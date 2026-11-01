/* ==========================================================================
   The store: Google Play Billing, reached through the Digital Goods API
   and the Payment Request API, for the Play edition of the game (a Trusted
   Web Activity). The game itself holds no money logic: this file answers
   three questions — is Play's store here, does this player own the full
   game, and what happens when they ask to buy it.

   The demo boundary: chapters are counted from 0, and the first five
   (Ambush on the Verdant Road through The Gates of Dunmarch) are free.
   The road beyond — Ashen Ridge onward — belongs to the unlocked game.

   The lock is a Play-edition thing only. It can engage solely where the
   Play billing surface answers for this app's own product: the service is
   requested, and the product's details come back. On the open web (and in
   the desktop and itch builds, which have no Play store behind them) that
   never happens, the gate never arms, and the game is whole and free
   exactly as it has always been. Where the store has answered once, the
   gate stays armed on later launches even if the store cannot be reached
   that day (a train tunnel is not a free unlock), and ownership, once
   seen, is remembered the same way — Play remains the source of truth and
   is re-asked on every launch that can reach it.

   One thing the client cannot do alone: Play requires a purchase to be
   acknowledged, and will refund and revoke one that is not acknowledged
   within three days. Acknowledgement is a Play Developer API call, which
   needs the developer's credentials and so a small backend — that
   endpoint now exists (see the acknowledgement section below), and what
   the client can do, it does: it reports every purchase token to the
   endpoint, queues any it could not confirm, retries the queue on every
   launch, and asks Play what the player owns on every launch
   (listPurchases), so a refund or revocation closes the gate again and
   a completed pending payment opens it, with no state of its own to
   go stale.
   ========================================================================== */

const Billing = (() => {
  const PLAY_STORE = 'https://play.google.com/billing';
  const SKU = 'full_unlock';
  // The expansion is a second product, gated the same way: only where
  // Play answers for it, never on the open web.
  const SKU_EXP = 'hollow_sky';
  const SKUS = { full: SKU, expansion: SKU_EXP };
  // Chapters 0..4 are the demo: five battles, three recruits, and the
  // cliffhanger at Dunmarch's gate. Index 5 (Ashen Ridge) is the first
  // chapter of the full game.
  const DEMO_CHAPTERS = 5;
  const SEEN_KEY = 'elderon.store-seen';       // the Play store answered for our product once
  const OWNED_KEY = 'elderon.unlock';          // Play says the full game is owned
  const PENDING_KEY = 'elderon.unlock-pending'; // paid (or paying) but not yet confirmed by Play
  const SEEN_EXP_KEY = 'elderon.store-seen-hollow';  // Play listed the expansion once
  const OWNED_EXP_KEY = 'elderon.unlock-hollow';
  const PENDING_EXP_KEY = 'elderon.unlock-hollow-pending';
  const SIM_KEY = 'elderon.store-sim';         // simulation scenario (tools/store-sim.html)
  const SIM_OWNED_KEY = 'elderon.store-sim-owned';
  const SIM_OWNED_EXP_KEY = 'elderon.store-sim-owned-hollow';
  const FALLBACK_PRICE = { currency: 'USD', value: '8.99' };
  const FALLBACK_PRICE_EXP = { currency: 'USD', value: '5.99' };

  // Storage, with the same caution as the game's own: it can be absent,
  // blocked or full, and none of that may break the game.
  const mem = {};
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return k in mem ? mem[k] : null; } },
    set(k, v) { mem[k] = v; try { localStorage.setItem(k, v); } catch (e) { /* remembered for the session */ } },
    del(k) { delete mem[k]; try { localStorage.removeItem(k); } catch (e) { /* nothing to do */ } },
  };

  let mode = 'unknown';       // 'unknown' | 'web' | 'play'
  let service = null;         // the Digital Goods service, once obtained
  let item = null;            // this product's details, as Play reports them
  let itemExp = null;         // the expansion's
  let owned = store.get(OWNED_KEY) === '1';
  let pending = store.get(PENDING_KEY) === '1';
  let ownedExp = store.get(OWNED_EXP_KEY) === '1';
  let pendingExp = store.get(PENDING_EXP_KEY) === '1';
  let sim = null;             // { scenario } when simulating, else null
  let readyPromise = null;

  const api = {
    SKU, SKU_EXP, DEMO_CHAPTERS, PLAY_STORE,
    onChange: null,           // the game sets this; called whenever the answers change
    ready: null,              // a promise for the first detection settling
  };

  function changed() { if (typeof api.onChange === 'function') { try { api.onChange(); } catch (e) { /* the game's drawing is its own affair */ } } }

  // ---- simulation ---------------------------------------------------------
  // A stand-in for the Play service boundary, for tools/store-sim.html and
  // tools/test-billing.js. It engages only when asked for by name — a
  // `store-sim` URL parameter, a storage flag the harness sets, or a
  // global set before this file loads — and never otherwise. It imitates
  // the one thing only Google can provide (the store itself); the gate,
  // the persistence and the purchase bookkeeping under test are the real
  // code. On the open web the lock never engages in any case, and inside
  // the Play app there is no way for a player to set these flags.
  function simScenario() {
    try {
      if (typeof window !== 'undefined' && window.__ELDERON_STORE_SIM__) return String(window.__ELDERON_STORE_SIM__);
      if (typeof location !== 'undefined' && location.search) {
        const q = new URLSearchParams(location.search).get('store-sim');
        if (q) return q;
      }
    } catch (e) { /* fall through to the storage flag */ }
    return store.get(SIM_KEY);
  }

  function simService(scenario) {
    const details = [{
      itemId: SKU,
      title: 'Chronicles of Elderon — Full Game',
      description: 'Unlocks the whole campaign beyond the demo.',
      price: { currency: 'USD', value: '8.99' },
    }, {
      itemId: SKU_EXP,
      title: 'The Hollow Sky',
      description: 'A second campaign east over the Greywall: four acts, three answers, four trades.',
      price: { currency: 'USD', value: '5.99' },
    }];
    const isOwned = () => scenario === 'owned' || store.get(SIM_OWNED_KEY) === '1';
    const isOwnedExp = () => scenario === 'owned' || scenario === 'owned-hollow' || store.get(SIM_OWNED_EXP_KEY) === '1';
    return {
      async getDetails(ids) { return details.filter(d => ids.includes(d.itemId)); },
      async listPurchases() { const out = []; if (isOwned()) out.push({ itemId: SKU, purchaseToken: 'sim-token' }); if (isOwnedExp()) out.push({ itemId: SKU_EXP, purchaseToken: 'sim-token-hollow' }); return out; },
      async consume() { /* the unlock is never consumed */ },
    };
  }

  // What the simulated player does at the till, per scenario.
  async function simBuy(scenario, which) {
    await new Promise(r => setTimeout(r, 60));
    if (scenario === 'cancel') { const e = new Error('The simulated player closed the payment sheet.'); e.name = 'AbortError'; throw e; }
    if (scenario === 'error') throw new Error('Simulated store failure.');
    if (scenario === 'pending') return { purchaseToken: 'sim-token-pending' };
    store.set(which === 'expansion' ? SIM_OWNED_EXP_KEY : SIM_OWNED_KEY, '1');
    return { purchaseToken: which === 'expansion' ? 'sim-token-hollow' : 'sim-token' };
  }

  // ---- entitlement ----------------------------------------------------------
  function setOwned(v, which) {
    if (which === 'expansion') {
      if (ownedExp === v) { ownedExp = v; return; }
      ownedExp = v;
      if (v) { store.set(OWNED_EXP_KEY, '1'); setPending(false, which); }
      else store.del(OWNED_EXP_KEY);
      changed();
      return;
    }
    if (owned === v) { owned = v; return; }
    owned = v;
    if (v) { store.set(OWNED_KEY, '1'); setPending(false); }
    else store.del(OWNED_KEY);
    changed();
  }
  function setPending(v, which) {
    if (which === 'expansion') { pendingExp = v; if (v) store.set(PENDING_EXP_KEY, '1'); else store.del(PENDING_EXP_KEY); return; }
    pending = v;
    if (v) store.set(PENDING_KEY, '1'); else store.del(PENDING_KEY);
  }

  // ---- acknowledgement --------------------------------------------------------
  // Play refunds and revokes a purchase that is not acknowledged within
  // three days. The acknowledgement itself is a Play Developer API call
  // the client cannot make, so the game reports each purchase token to
  // the small endpoint that can (elderon-acknowledge, Cloud Run). Tokens
  // are queued in storage and retried on every launch until the endpoint
  // confirms; the endpoint is idempotent, so reporting twice is harmless,
  // and the three-day window makes retries safe. Nothing here may break
  // the game: every failure is a shrug and a later retry.
  const ACK_URL = 'https://elderon-acknowledge-132998034840.us-central1.run.app';
  const PACKAGE_NAME = 'com.taugustincst.elderon';
  const UNACKED_KEY = 'elderon.unacked';   // JSON object: { purchaseToken: productId }
  function unacked() {
    try { const q = JSON.parse(store.get(UNACKED_KEY) || '{}'); return q && typeof q === 'object' ? q : {}; }
    catch (e) { return {}; }
  }
  function saveUnacked(q) { try { store.set(UNACKED_KEY, JSON.stringify(q)); } catch (e) { /* remembered for the session */ } }
  async function ackNow(token, productId) {
    if (typeof fetch !== 'function') return false;
    try {
      const r = await fetch(ACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageName: PACKAGE_NAME, productId, purchaseToken: token }),
      });
      if (r && r.ok) {
        const body = await r.json().catch(() => null);
        if (body && (body.status === 'acknowledged' || body.status === 'already_acknowledged')) {
          const q = unacked();
          if (token in q) { delete q[token]; saveUnacked(q); }
          return true;
        }
      }
    } catch (e) { /* offline, or the endpoint is down — retried on a later launch */ }
    return false;
  }
  function queueAck(token, productId) {
    if (sim) return;   // simulated purchases are not Play's to acknowledge
    if (!token || typeof token !== 'string' || (productId !== SKU && productId !== SKU_EXP)) return;
    const q = unacked();
    if (!(token in q)) { q[token] = productId; saveUnacked(q); }
    void ackNow(token, productId);
  }
  // Report anything Play says the player owns, and retry the queue.
  // Called whenever entitlement is refreshed, which includes every launch.
  function reportPurchases(purchases) {
    if (Array.isArray(purchases)) {
      for (const p of purchases) {
        if (p && p.purchaseToken) queueAck(p.purchaseToken, p.itemId);
      }
    }
    const q = unacked();
    for (const token of Object.keys(q)) void ackNow(token, q[token]);
  }

  // Ask Play what this player owns. Entitlement lives there, not here:
  // this only mirrors the answer, so refunds and revocations are honoured
  // the next time the store can be asked.
  async function refreshEntitlement() {
    if (!service) return owned;
    const purchases = await service.listPurchases();
    reportPurchases(purchases);
    const has = Array.isArray(purchases) && purchases.some(p => p && p.itemId === SKU);
    const hasExp = Array.isArray(purchases) && purchases.some(p => p && p.itemId === SKU_EXP);
    setOwned(has);
    if (has) setPending(false);
    setOwned(hasExp, 'expansion');
    if (hasExp) setPending(false, 'expansion');
    return owned;
  }

  // ---- detection --------------------------------------------------------------
  async function detect() {
    const scenario = simScenario();
    if (scenario) {
      if (scenario === 'nostore') { mode = 'web'; return api; }
      sim = { scenario };
      service = simService(scenario);
      const simDetails = await service.getDetails([SKU, SKU_EXP]);
      item = simDetails.find(d => d.itemId === SKU) || null;
      itemExp = simDetails.find(d => d.itemId === SKU_EXP) || null;
      if (itemExp) store.set(SEEN_EXP_KEY, '1');
      mode = 'play';
      store.set(SEEN_KEY, '1');
      await refreshEntitlement();
      return api;
    }
    const w = typeof window !== 'undefined' ? window : null;
    if (!w || typeof w.getDigitalGoodsService !== 'function') { mode = 'web'; return api; }
    try {
      service = await w.getDigitalGoodsService(PLAY_STORE);
    } catch (e) {
      service = null; mode = 'web'; return api;
    }
    try {
      const details = await service.getDetails([SKU, SKU_EXP]);
      item = (details || []).find(d => d && d.itemId === SKU) || null;
      itemExp = (details || []).find(d => d && d.itemId === SKU_EXP) || null;
      if (itemExp) store.set(SEEN_EXP_KEY, '1');
    } catch (e) { item = null; itemExp = null; }
    if (item) {
      // Play answered for this app's own product: this is the Play
      // edition, and buying is possible, so the demo gate may arm.
      mode = 'play';
      store.set(SEEN_KEY, '1');
      await refreshEntitlement();
    } else if (store.get(SEEN_KEY) === '1') {
      // The store answered on an earlier launch but the product cannot
      // be read now. The gate stays as it was; Play is re-asked on the
      // next launch, and Restore on the unlock screen asks again at once.
      mode = 'play';
      try { await refreshEntitlement(); } catch (e) { /* keep the remembered answers */ }
    } else {
      // A store surface but not our product — the open web in a browser
      // that knows the API's shape, a store that is not Play's, or a Play
      // listing whose product has not been created yet. No lock: a lock
      // that cannot be bought off is a bug, not a business model.
      mode = 'web';
    }
    return api;
  }

  api.init = function () {
    if (!readyPromise) {
      readyPromise = detect().catch(() => { /* detection must never break the game */ });
      api.ready = readyPromise;
    }
    return readyPromise;
  };

  // ---- the questions the game asks ---------------------------------------------
  // The gate is armed wherever Play's store has answered for the product
  // (this launch, or a remembered earlier one) and the player has not
  // bought the full game.
  api.armed = function (which) {
    if (which === 'expansion') { if (ownedExp) return false; return mode === 'play' || store.get(SEEN_KEY) === '1'; }
    if (owned) return false;
    return mode === 'play' || store.get(SEEN_KEY) === '1';
  };
  api.available = function () { return mode === 'play' && !!service; };
  api.owned = function (which) { return which === 'expansion' ? ownedExp : owned; };
  api.pending = function (which) { return which === 'expansion' ? pendingExp : pending; };
  // Does this chapter index belong to the full game, for this player,
  // in this edition? Resume of a battle already begun never asks.
  api.locksChapter = function (i) { return api.armed() && i >= DEMO_CHAPTERS; };
  // Is the Hollow Sky shut, for this player, in this edition? Only where
  // Play answers for it: a listing without the product never locks it.
  api.locksExpansion = function () { return !ownedExp && (mode === 'play' ? !!itemExp : false) || (!ownedExp && mode !== 'play' && store.get(SEEN_EXP_KEY) === '1'); };
  api.itemDetails = function (which) {
    if (which === 'expansion') {
      if (itemExp) return { title: itemExp.title || '', description: itemExp.description || '', price: itemExp.price || FALLBACK_PRICE_EXP };
      return { title: '', description: '', price: FALLBACK_PRICE_EXP };
    }
    if (item) return { title: item.title || '', description: item.description || '', price: item.price || FALLBACK_PRICE };
    return { title: '', description: '', price: FALLBACK_PRICE };
  };
  api.priceText = function (which) {
    const p = api.itemDetails(which).price;
    try {
      return new Intl.NumberFormat(typeof navigator !== 'undefined' ? navigator.language : 'en-US',
        { style: 'currency', currency: p.currency }).format(p.value);
    } catch (e) { return `$${p.value}`; }
  };

  // ---- buying ---------------------------------------------------------------------
  // Resolves to one of: 'owned' (Play confirms the unlock), 'pending'
  // (Play took the payment but has not confirmed it yet — deferred
  // payment methods do this; the entitlement arrives on a later launch
  // or Restore), 'cancelled' (the player closed the payment sheet),
  // 'unavailable' (no store here), 'error' (anything else, with .error).
  api.buy = async function (which) {
    await api.init();
    const exp = which === 'expansion';
    if (exp ? ownedExp : owned) return { status: 'owned' };
    if (!service) return { status: 'unavailable' };
    try {
      let token = null;
      if (sim) {
        const r = await simBuy(sim.scenario, which);
        token = r && r.purchaseToken;
      } else {
        const w = window;
        const details = api.itemDetails(which);
        const request = new w.PaymentRequest(
          [{ supportedMethods: PLAY_STORE, data: { sku: SKUS[which] || SKU } }],
          { total: { label: 'Total', amount: { currency: details.price.currency, value: String(details.price.value) } } }
        );
        const response = await request.show();
        token = response && response.details ? (response.details.purchaseToken || response.details.token) : null;
        try { await response.complete('success'); } catch (e) { /* the sheet is already closed */ }
      }
      // Report the token for acknowledgement at once; if the endpoint
      // cannot confirm right now, the queue retries it on later launches.
      if (token) queueAck(token, exp ? SKU_EXP : SKU);
      // The payment sheet resolving is Play saying the purchase went
      // through; the entitlement list is the proof we keep. If it is not
      // there yet, the payment is pending with Play, not lost.
      try { await refreshEntitlement(); } catch (e) { /* asked again on Restore and next launch */ }
      if (exp ? ownedExp : owned) return { status: 'owned', token };
      setPending(true, which);
      changed();
      return { status: 'pending', token };
    } catch (e) {
      if (e && e.name === 'AbortError') return { status: 'cancelled' };
      return { status: 'error', error: e };
    }
  };

  // The Restore button, and any moment that wants a fresh answer: ask
  // Play again. Resolves to whether the full game is owned afterwards.
  api.restore = async function (which) {
    await api.init();
    if (!service) {
      // The store could not be reached at first detection; try again —
      // a first launch in a tunnel should not stick for the session.
      readyPromise = null;
      await api.init();
    }
    const answer = () => (which === 'expansion' ? ownedExp : owned);
    if (!service) return answer();
    try { await refreshEntitlement(); } catch (e) { /* keep the remembered answer */ }
    changed();
    return answer();
  };

  api.init();
  return api;
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Billing;
if (typeof window !== 'undefined') window.Billing = Billing;
