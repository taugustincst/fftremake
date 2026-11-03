/* ==========================================================================
   The store. Chronicles of Elderon is a paid download: every chapter of
   the first game ships with it, everywhere, and nothing here can lock one.
   The one thing still sold is The Hollow Sky expansion (Play product
   `hollow_sky`), bought inside the Google Play app.

   The Play app is an Android WebView that loads the game from files in
   the APK and adds a native Play Billing bridge, `window.ElderonPlay`
   (MainActivity). The bridge is the whole store as far as this file is
   concerned:

     ElderonPlay.query(id)  ask Play for the product and the player's purchases
     ElderonPlay.buy(id)    open Play's purchase sheet for the expansion

   `id` is a request id chosen here. Neither call returns anything; the
   native side answers later by calling window.__elderonPlayReply(json),
   where json is a string:

     { "id": <request id or null>, "op": "query" | "buy" | "update",
       "status": ..., "owned": bool, "pending": bool,
       "price": "$5.99" | null, "title": string | null }

   query answers "ok" or "unavailable" (billing service out of reach);
   buy answers "owned", "pending", "cancelled", "unavailable" or "error";
   "update" (id null) can arrive at any moment — a pending payment that
   clears while the game is open, say. Acknowledging purchases is done
   natively on the device; nothing here talks to any server.

   Where the expansion is gated: only inside the Play app (the bridge is
   present) and in the simulation below. Everywhere else — the desktop,
   itch and web builds, which have no Play store behind them — it is open,
   as it always has been. Inside the Play app it is shut until Play says
   it is owned. Ownership is remembered, so a launch with no signal (a
   query answering "unavailable") keeps a bought expansion open; a query
   that answers "ok" without it closes it again (a refund or revocation).

   An unreachable store, a timeout or a failed purchase is ordinary here
   (an emulator has no Play Store at all): none of it logs an error or
   throws. Every request settles; none rejects.
   ========================================================================== */

const Billing = (() => {
  const SKU_EXP = 'hollow_sky';
  const OWNED_EXP_KEY = 'elderon.unlock-hollow';           // Play said the expansion is owned
  const PENDING_EXP_KEY = 'elderon.unlock-hollow-pending'; // paid (or paying), not yet confirmed
  const SIM_KEY = 'elderon.store-sim';                     // simulation scenario (tools/store-sim.html)
  const SIM_OWNED_EXP_KEY = 'elderon.store-sim-owned-hollow';
  const SIM_PENDING_EXP_KEY = 'elderon.store-sim-pending-hollow';
  // Keys from the free-demo era (the full-game unlock, the store-seen
  // flags, the acknowledgement queue). Nothing reads them now; they are
  // cleared so they cannot confuse anything later.
  const STALE_KEYS = ['elderon.unlock', 'elderon.unlock-pending', 'elderon.store-seen',
    'elderon.store-seen-hollow', 'elderon.unacked', 'elderon.store-sim-owned'];
  const FALLBACK_PRICE = '$5.99';
  const DEFAULT_TITLE = 'The Hollow Sky';
  const REPLY_TIMEOUT_MS = 20000;   // a request with no answer by then settles as unavailable/error

  // Storage, with the same caution as the game's own: it can be absent,
  // blocked or full, and none of that may break the game.
  const mem = {};
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return k in mem ? mem[k] : null; } },
    set(k, v) { mem[k] = v; try { localStorage.setItem(k, v); } catch (e) { /* remembered for the session */ } },
    del(k) { delete mem[k]; try { localStorage.removeItem(k); } catch (e) { /* nothing to do */ } },
  };
  for (const k of STALE_KEYS) store.del(k);

  const w = typeof window !== 'undefined' ? window : null;

  let mode = 'open';          // 'open' (no store: nothing gated) | 'play' (the bridge) | 'sim'
  let port = null;            // { query(id), buy(id) } — the bridge, or the simulation's stand-in
  let ownedExp = store.get(OWNED_EXP_KEY) === '1';
  let pendingExp = store.get(PENDING_EXP_KEY) === '1';
  let price = null;           // Play's formatted price, once it has answered
  let title = null;           // Play's product title
  let lastQuery = null;       // the last query's status: 'ok' | 'unavailable' | null (none yet)
  let seq = 0;
  const waiting = new Map();  // request id -> { op, resolve, timer }

  const api = {
    SKU_EXP,
    REPLY_TIMEOUT_MS,
    onChange: null,           // the game sets this; called whenever the answers change
    ready: null,              // a promise for the first answer (or its timeout) settling
  };

  function changed() { if (typeof api.onChange === 'function') { try { api.onChange(); } catch (e) { /* the game's drawing is its own affair */ } } }

  // ---- entitlement ------------------------------------------------------------
  function setOwned(v) {
    ownedExp = !!v;
    if (ownedExp) { store.set(OWNED_EXP_KEY, '1'); setPending(false); }
    else store.del(OWNED_EXP_KEY);
  }
  function setPending(v) {
    pendingExp = !!v;
    if (pendingExp) store.set(PENDING_EXP_KEY, '1'); else store.del(PENDING_EXP_KEY);
  }

  // ---- the reply channel --------------------------------------------------------
  // Everything Play says lands here, whether it answers a request or not.
  function onReply(json) {
    let msg = json;
    if (typeof json === 'string') { try { msg = JSON.parse(json); } catch (e) { return; } }
    if (!msg || typeof msg !== 'object') return;
    const op = msg.op, status = msg.status;
    if (typeof msg.price === 'string' && msg.price.trim()) price = msg.price.trim();
    if (typeof msg.title === 'string' && msg.title.trim()) title = msg.title.trim();
    if (op === 'query') {
      if (status === 'ok' || status === 'unavailable') lastQuery = status;
      // "ok" is Play's word on what is owned now — a refund closes the
      // expansion again. "unavailable" says nothing, and the remembered
      // answer stands.
      if (status === 'ok') { setOwned(msg.owned === true); if (!ownedExp) setPending(msg.pending === true); }
    } else if (op === 'buy') {
      if (status === 'owned' || msg.owned === true) setOwned(true);
      else if (status === 'pending') setPending(true);
    } else if (op === 'update') {
      if (typeof msg.owned === 'boolean') setOwned(msg.owned);
      if (!ownedExp && typeof msg.pending === 'boolean') setPending(msg.pending);
    }
    const id = msg.id == null ? null : String(msg.id);
    if (id !== null && waiting.has(id)) {
      const req = waiting.get(id);
      waiting.delete(id);
      clearTimeout(req.timer);
      req.resolve(msg);
    }
    changed();
  }

  // Send one request; resolves to the reply, or to a stand-in reply
  // (unavailable for a query, error for a purchase) if none comes in time
  // or the bridge throws. Nothing the store does may hang the game.
  function request(op) {
    const id = `r${Date.now().toString(36)}-${++seq}`;
    const fallback = { id, op, status: op === 'query' ? 'unavailable' : 'error', owned: ownedExp, pending: pendingExp };
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        if (!waiting.has(id)) return;
        waiting.delete(id);
        if (op === 'query') lastQuery = 'unavailable';
        resolve(Object.assign({ timedOut: true }, fallback));
      }, REPLY_TIMEOUT_MS);
      waiting.set(id, { op, resolve, timer });
      try {
        port[op](id);
      } catch (e) {
        waiting.delete(id);
        clearTimeout(timer);
        if (op === 'query') lastQuery = 'unavailable';
        resolve(Object.assign({ error: e }, fallback));
      }
    });
  }

  // ---- simulation ---------------------------------------------------------------
  // A stand-in for the native bridge, for tools/store-sim.html and the
  // tests. It engages only when asked for by name — a `store-sim` URL
  // parameter, a storage flag the harness sets, or a global set before
  // this file loads — and never inside the Play app, where the real
  // bridge always wins. It answers through the same reply channel as the
  // bridge, so everything after the boundary is the real code.
  //   ready         not owned; buying succeeds
  //   owned-hollow  already owned
  //   cancel        the player closes the purchase sheet
  //   error         Play fails the purchase
  //   pending       the payment waits on Play (an "update" can clear it)
  //   offline       the billing service cannot be reached
  //   nostore       no store at all: the open build's rules
  function simScenario() {
    try {
      if (w && w.__ELDERON_STORE_SIM__) return String(w.__ELDERON_STORE_SIM__);
      if (typeof location !== 'undefined' && location.search) {
        const q = new URLSearchParams(location.search).get('store-sim');
        if (q) return q;
      }
    } catch (e) { /* fall through to the storage flag */ }
    return store.get(SIM_KEY);
  }

  function simPort(scenario) {
    const reply = (msg, delay) => setTimeout(() => onReply(JSON.stringify(msg)), delay);
    const isOwned = () => scenario === 'owned-hollow' || store.get(SIM_OWNED_EXP_KEY) === '1';
    const isPending = () => store.get(SIM_PENDING_EXP_KEY) === '1';
    const base = () => ({ price: '$5.99', title: DEFAULT_TITLE });
    return {
      query(id) {
        if (scenario === 'offline') return reply({ id, op: 'query', status: 'unavailable', owned: false, pending: false, price: null, title: null }, 10);
        reply(Object.assign({ id, op: 'query', status: 'ok', owned: isOwned(), pending: !isOwned() && isPending() }, base()), 10);
      },
      buy(id) {
        let status;
        if (isOwned()) status = 'owned';
        else if (scenario === 'cancel') status = 'cancelled';
        else if (scenario === 'error') status = 'error';
        else if (scenario === 'offline') status = 'unavailable';
        else if (scenario === 'pending') { status = 'pending'; store.set(SIM_PENDING_EXP_KEY, '1'); }
        else { status = 'owned'; store.set(SIM_OWNED_EXP_KEY, '1'); }
        reply(Object.assign({ id, op: 'buy', status, owned: status === 'owned', pending: status === 'pending' }, base()), 60);
      },
    };
  }

  // ---- detection ------------------------------------------------------------------
  function detect() {
    const bridge = w && w.ElderonPlay;
    if (bridge && typeof bridge.query === 'function' && typeof bridge.buy === 'function') {
      mode = 'play';
      port = { query: (id) => bridge.query(id), buy: (id) => bridge.buy(id) };
      return;
    }
    const scenario = simScenario();
    if (scenario && scenario !== 'nostore') {
      mode = 'sim';
      port = simPort(scenario);
    }
  }

  detect();
  if (w) w.__elderonPlayReply = onReply;
  api.ready = port ? request('query').then(() => api, () => api) : Promise.resolve(api);

  // ---- the questions the game asks --------------------------------------------------
  // The first game is bought with the download: it is always owned, and no
  // chapter is ever locked, in any build.
  api.locksChapter = function () { return false; };
  // Is the Hollow Sky shut for this player? Only where a store is present.
  api.locksExpansion = function () { return mode !== 'open' && !ownedExp; };
  api.armed = function (which) { return which === 'expansion' ? api.locksExpansion() : false; };
  api.available = function () { return mode !== 'open'; };
  api.mode = function () { return mode; };
  // Did the last question to Play get an answer? (False only after a query
  // came back unavailable or went unanswered.)
  api.reachable = function () { return mode !== 'open' && lastQuery !== 'unavailable'; };
  api.owned = function (which) { return which === 'expansion' ? ownedExp : true; };
  api.pending = function (which) { return which === 'expansion' ? (pendingExp && !ownedExp) : false; };
  api.itemDetails = function (which) {
    if (which !== 'expansion') return { title: '', description: '', price: '' };
    // Play's product titles can carry the app's name in brackets.
    const t = title ? title.replace(/\s*\([^)]*\)\s*$/, '') : '';
    return { title: t || DEFAULT_TITLE, description: '', price: price || FALLBACK_PRICE };
  };
  api.priceText = function (which) { return which === 'expansion' ? (price || FALLBACK_PRICE) : ''; };

  // ---- buying -------------------------------------------------------------------------
  // Resolves to { status }: 'owned' (Play confirms it), 'pending' (Play
  // took the payment but has not confirmed it — deferred payment methods
  // do this; it lands with an update, a Restore or a later launch),
  // 'cancelled' (the player closed the sheet), 'unavailable' (no store
  // reachable) or 'error'.
  api.buy = async function (which) {
    if (which !== 'expansion') return { status: 'owned' };
    if (!port) return { status: 'unavailable' };
    await api.ready;
    if (ownedExp) return { status: 'owned' };
    const r = await request('buy');
    if (ownedExp) return { status: 'owned' };
    const status = ['pending', 'cancelled', 'unavailable'].includes(r.status) ? r.status : 'error';
    return status === 'error' ? { status, error: r.timedOut ? 'timeout' : (r.error || r.status) } : { status };
  };

  // The Restore button: ask Play again. Resolves to whether it is owned.
  api.restore = async function (which) {
    if (which !== 'expansion') return true;
    if (!port) return ownedExp;
    await request('query');
    return ownedExp;
  };

  return api;
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Billing;
if (typeof window !== 'undefined') window.Billing = Billing;
