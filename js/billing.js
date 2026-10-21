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

   One thing the client cannot do: Play requires a purchase to be
   acknowledged, and will refund and revoke one that is not acknowledged
   within three days. Acknowledgement is a Play Developer API call, which
   needs the developer's credentials and so a small backend; the console
   steps in android/PLAY_STORE.md carry it as a launch requirement. What
   the client can do, it does: it asks Play what the player owns on every
   launch (listPurchases), so a refund or revocation closes the gate again
   and a completed pending payment opens it, with no state of its own to
   go stale.
   ========================================================================== */

const Billing = (() => {
  const PLAY_STORE = 'https://play.google.com/billing';
  const SKU = 'full_unlock';
  // Chapters 0..4 are the demo: five battles, three recruits, and the
  // cliffhanger at Dunmarch's gate. Index 5 (Ashen Ridge) is the first
  // chapter of the full game.
  const DEMO_CHAPTERS = 5;
  const SEEN_KEY = 'elderon.store-seen';       // the Play store answered for our product once
  const OWNED_KEY = 'elderon.unlock';          // Play says the full game is owned
  const PENDING_KEY = 'elderon.unlock-pending'; // paid (or paying) but not yet confirmed by Play
  const SIM_KEY = 'elderon.store-sim';         // simulation scenario (tools/store-sim.html)
  const SIM_OWNED_KEY = 'elderon.store-sim-owned';
  const FALLBACK_PRICE = { currency: 'USD', value: '8.99' };

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
  let owned = store.get(OWNED_KEY) === '1';
  let pending = store.get(PENDING_KEY) === '1';
  let sim = null;             // { scenario } when simulating, else null
  let readyPromise = null;

  const api = {
    SKU, DEMO_CHAPTERS, PLAY_STORE,
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
    }];
    const isOwned = () => scenario === 'owned' || store.get(SIM_OWNED_KEY) === '1';
    return {
      async getDetails(ids) { return details.filter(d => ids.includes(d.itemId)); },
      async listPurchases() { return isOwned() ? [{ itemId: SKU, purchaseToken: 'sim-token' }] : []; },
      async consume() { /* the unlock is never consumed */ },
    };
  }

  // What the simulated player does at the till, per scenario.
  async function simBuy(scenario) {
    await new Promise(r => setTimeout(r, 60));
    if (scenario === 'cancel') { const e = new Error('The simulated player closed the payment sheet.'); e.name = 'AbortError'; throw e; }
    if (scenario === 'error') throw new Error('Simulated store failure.');
    if (scenario === 'pending') return { purchaseToken: 'sim-token-pending' };
    store.set(SIM_OWNED_KEY, '1');
    return { purchaseToken: 'sim-token' };
  }

  // ---- entitlement ----------------------------------------------------------
  function setOwned(v) {
    if (owned === v) { owned = v; return; }
    owned = v;
    if (v) { store.set(OWNED_KEY, '1'); setPending(false); }
    else store.del(OWNED_KEY);
    changed();
  }
  function setPending(v) {
    pending = v;
    if (v) store.set(PENDING_KEY, '1'); else store.del(PENDING_KEY);
  }

  // Ask Play what this player owns. Entitlement lives there, not here:
  // this only mirrors the answer, so refunds and revocations are honoured
  // the next time the store can be asked.
  async function refreshEntitlement() {
    if (!service) return owned;
    const purchases = await service.listPurchases();
    const has = Array.isArray(purchases) && purchases.some(p => p && p.itemId === SKU);
    setOwned(has);
    if (has) setPending(false);
    return owned;
  }

  // ---- detection --------------------------------------------------------------
  async function detect() {
    const scenario = simScenario();
    if (scenario) {
      if (scenario === 'nostore') { mode = 'web'; return api; }
      sim = { scenario };
      service = simService(scenario);
      item = (await service.getDetails([SKU]))[0] || null;
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
      const details = await service.getDetails([SKU]);
      item = (details || []).find(d => d && d.itemId === SKU) || null;
    } catch (e) { item = null; }
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
  api.armed = function () {
    if (owned) return false;
    return mode === 'play' || store.get(SEEN_KEY) === '1';
  };
  api.available = function () { return mode === 'play' && !!service; };
  api.owned = function () { return owned; };
  api.pending = function () { return pending; };
  // Does this chapter index belong to the full game, for this player,
  // in this edition? Resume of a battle already begun never asks.
  api.locksChapter = function (i) { return api.armed() && i >= DEMO_CHAPTERS; };
  api.itemDetails = function () {
    if (item) return { title: item.title || '', description: item.description || '', price: item.price || FALLBACK_PRICE };
    return { title: '', description: '', price: FALLBACK_PRICE };
  };
  api.priceText = function () {
    const p = api.itemDetails().price;
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
  api.buy = async function () {
    await api.init();
    if (owned) return { status: 'owned' };
    if (!service) return { status: 'unavailable' };
    try {
      let token = null;
      if (sim) {
        const r = await simBuy(sim.scenario);
        token = r && r.purchaseToken;
      } else {
        const w = window;
        const details = api.itemDetails();
        const request = new w.PaymentRequest(
          [{ supportedMethods: PLAY_STORE, data: { sku: SKU } }],
          { total: { label: 'Total', amount: { currency: details.price.currency, value: String(details.price.value) } } }
        );
        const response = await request.show();
        token = response && response.details ? (response.details.purchaseToken || response.details.token) : null;
        try { await response.complete('success'); } catch (e) { /* the sheet is already closed */ }
      }
      // The payment sheet resolving is Play saying the purchase went
      // through; the entitlement list is the proof we keep. If it is not
      // there yet, the payment is pending with Play, not lost.
      try { await refreshEntitlement(); } catch (e) { /* asked again on Restore and next launch */ }
      if (owned) return { status: 'owned', token };
      setPending(true);
      changed();
      return { status: 'pending', token };
    } catch (e) {
      if (e && e.name === 'AbortError') return { status: 'cancelled' };
      return { status: 'error', error: e };
    }
  };

  // The Restore button, and any moment that wants a fresh answer: ask
  // Play again. Resolves to whether the full game is owned afterwards.
  api.restore = async function () {
    await api.init();
    if (!service) {
      // The store could not be reached at first detection; try again —
      // a first launch in a tunnel should not stick for the session.
      readyPromise = null;
      await api.init();
    }
    if (!service) return owned;
    try { await refreshEntitlement(); } catch (e) { /* keep the remembered answer */ }
    changed();
    return owned;
  };

  api.init();
  return api;
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Billing;
if (typeof window !== 'undefined') window.Billing = Billing;
