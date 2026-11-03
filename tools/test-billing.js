#!/usr/bin/env node
/* Exercises js/billing.js without a browser.

   Elderon is a paid download with every chapter included, so no chapter
   may ever be locked, in any build. The one thing sold is The Hollow Sky
   (`hollow_sky`), through the native Play Billing bridge the Play app
   injects as window.ElderonPlay; the bridge answers by calling
   window.__elderonPlayReply(jsonString). Here a fake bridge stands in for
   the Java side and answers asynchronously, as the real one does. Every
   thing on this side of it is the game's real code, loaded fresh per
   scenario so no state leaks between them.

   Usage: node tools/test-billing.js   (exits non-zero on the first failure) */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'js', 'billing.js'), 'utf8');
const tick = (ms = 0) => new Promise(r => setTimeout(r, ms));

function makeStorage(seed = {}) {
  const m = new Map(Object.entries(seed));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    _map: m,
  };
}

// A console that records errors: billing.js must never log one (the
// Android launch test fails on any console.error from the page).
function makeConsole() {
  const errors = [];
  return { errors, console: { log() {}, info() {}, warn() {}, debug() {}, error: (...a) => errors.push(a.join(' ')) } };
}

// A fake ElderonPlay. `answer(op, id)` returns the reply object for a
// request (or null for no answer at all); replies arrive on a later turn.
function fakeBridge(answer) {
  const calls = [];
  let ctx = null;
  const bridge = {
    query(id) { calls.push(['query', id]); respond('query', id); },
    buy(id) { calls.push(['buy', id]); respond('buy', id); },
  };
  function respond(op, id) {
    const msg = answer(op, id);
    if (!msg) return;
    setTimeout(() => ctx.window.__elderonPlayReply(JSON.stringify(Object.assign({ id, op }, msg))), 5);
  }
  return { bridge, calls, attach(c) { ctx = c; }, push(msg) { ctx.window.__elderonPlayReply(JSON.stringify(msg)); } };
}

// The Play side's state, as a fake bridge sees it.
function playStore({ owned = false, pending = false, available = true, buyResult = 'owned', price = '$5.99', title = 'The Hollow Sky (Chronicles of Elderon)' } = {}) {
  const st = { owned, pending, available, buyResult };
  const fake = fakeBridge((op) => {
    if (op === 'query') {
      if (!st.available) return { status: 'unavailable', owned: false, pending: false, price: null, title: null };
      return { status: 'ok', owned: st.owned, pending: st.pending, price, title };
    }
    if (!st.available) return { status: 'unavailable', owned: false, pending: false, price: null, title: null };
    if (st.buyResult === 'owned') st.owned = true;
    if (st.buyResult === 'pending') st.pending = true;
    return { status: st.buyResult, owned: st.buyResult === 'owned', pending: st.buyResult === 'pending', price, title };
  });
  fake.st = st;
  return fake;
}

function loadBilling({ storage = makeStorage(), bridge = null, search = '', simGlobal = null, timers = null } = {}) {
  const con = makeConsole();
  const ctx = {
    console: con.console,
    setTimeout: timers ? timers.setTimeout : setTimeout,
    clearTimeout: timers ? timers.clearTimeout : clearTimeout,
    URLSearchParams, Intl,
    localStorage: storage,
    location: { search },
    navigator: { language: 'en-US' },
  };
  ctx.window = ctx;
  if (bridge) { ctx.ElderonPlay = bridge.bridge; bridge.attach(ctx); }
  if (simGlobal) ctx.__ELDERON_STORE_SIM__ = simGlobal;
  vm.createContext(ctx);
  vm.runInContext(SRC, ctx, { filename: 'billing.js' });
  const B = ctx.Billing;
  B._errors = con.errors;
  B._ctx = ctx;
  return B;
}

let passed = 0;
function check(name, cond) {
  if (!cond) { console.error(`FAIL: ${name}`); process.exit(1); }
  passed++; console.log(`ok ${passed} - ${name}`);
}
const ALL_CHAPTERS = Array.from({ length: 60 }, (_, i) => i);
const noChapterLocked = (B) => ALL_CHAPTERS.every(i => B.locksChapter(i) === false) && B.armed() === false && B.owned() === true && B.owned('full') === true;
const noErrors = (B) => B._errors.length === 0;

(async () => {
  // 1. No bridge, no simulation: the desktop/itch/web builds. Everything open.
  {
    const B = loadBilling();
    await B.ready;
    check('open: no chapter locked', noChapterLocked(B));
    check('open: expansion open', B.locksExpansion() === false && B.armed('expansion') === false);
    check('open: no store', B.available() === false);
    check('open: reply hook defined', typeof B._ctx.window.__elderonPlayReply === 'function');
    check('open: buying expansion is unavailable', (await B.buy('expansion')).status === 'unavailable');
    check('open: buying "full" is owned', (await B.buy()).status === 'owned' && (await B.buy('full')).status === 'owned');
    check('open: restore full is true', (await B.restore()) === true);
    check('open: fallback price', B.priceText('expansion') === '$5.99' && B.itemDetails('expansion').price === '$5.99');
    check('open: no console errors', noErrors(B));
  }

  // 2. Demo-era keys from old installs lock nothing, anywhere, and are cleared.
  {
    const seed = { 'elderon.store-seen': '1', 'elderon.store-seen-hollow': '1', 'elderon.unlock-pending': '1', 'elderon.unacked': '{"t":"x"}' };
    const storage = makeStorage(seed);
    const B = loadBilling({ storage });
    await B.ready;
    check('old keys, open build: no chapter locked', noChapterLocked(B));
    check('old keys, open build: expansion open', B.locksExpansion() === false);
    check('old keys: cleared', Object.keys(seed).every(k => storage.getItem(k) === null));
    const fake = playStore();
    const B2 = loadBilling({ storage: makeStorage(Object.assign({ 'elderon.unlock': '0' }, seed)), bridge: fake });
    await B2.ready;
    check('old keys, Play app: no chapter locked', noChapterLocked(B2));
    check('old keys, Play app: expansion gated only by Play', B2.locksExpansion() === true && B2.pending('expansion') === false);
  }

  // 3. The Play app, expansion not owned: locked until Play says so.
  {
    const storage = makeStorage();
    const fake = playStore();
    const B = loadBilling({ storage, bridge: fake });
    check('play: locked before the first answer', B.locksExpansion() === true);
    check('play: still no chapter locked before the answer', noChapterLocked(B));
    await B.ready;
    check('play: one query sent at load', fake.calls.length === 1 && fake.calls[0][0] === 'query' && typeof fake.calls[0][1] === 'string');
    check('play: available', B.available() === true && B.mode() === 'play');
    check('play: expansion locked', B.locksExpansion() === true && B.armed('expansion') === true && B.owned('expansion') === false);
    check('play: no chapter locked', noChapterLocked(B));
    check('play: price from the bridge', B.priceText('expansion') === '$5.99');
    check('play: title from the bridge, app name dropped', B.itemDetails('expansion').title === 'The Hollow Sky');
    check('play: buy "full" never reaches the bridge', (await B.buy('full')).status === 'owned' && fake.calls.length === 1);
    let changes = 0;
    B.onChange = () => { changes++; };
    const r = await B.buy('expansion');
    check('play buy: owned', r.status === 'owned' && B.owned('expansion') === true);
    check('play buy: went through the bridge', fake.calls.some(c => c[0] === 'buy'));
    check('play buy: request ids are distinct', new Set(fake.calls.map(c => c[1])).size === fake.calls.length);
    check('play buy: expansion open', B.locksExpansion() === false);
    check('play buy: ownership remembered', storage.getItem('elderon.unlock-hollow') === '1');
    check('play buy: onChange called', changes > 0);
    check('play buy: buying again short-circuits', (await B.buy('expansion')).status === 'owned' && fake.calls.filter(c => c[0] === 'buy').length === 1);
    check('play: no console errors', noErrors(B));
  }

  // 4. Already owned (another device, a promo code): the load query opens it.
  {
    const fake = playStore({ owned: true });
    const B = loadBilling({ bridge: fake });
    await B.ready;
    check('owned at launch: expansion open', B.locksExpansion() === false && B.owned('expansion') === true);
  }

  // 5. Bridge price differs from the fallback.
  {
    const B = loadBilling({ bridge: playStore({ price: '4,99 €' }) });
    await B.ready;
    check('price: Play’s localized price used', B.priceText('expansion') === '4,99 €');
  }

  // 6. Buy outcomes map through.
  for (const outcome of ['pending', 'cancelled', 'error', 'unavailable']) {
    const storage = makeStorage();
    const fake = playStore({ buyResult: outcome });
    const B = loadBilling({ storage, bridge: fake });
    await B.ready;
    const r = await B.buy('expansion');
    check(`buy ${outcome}: status maps through`, r.status === outcome);
    check(`buy ${outcome}: still locked`, B.locksExpansion() === true);
    check(`buy ${outcome}: no console errors`, noErrors(B));
    if (outcome === 'pending') {
      check('buy pending: flagged and remembered', B.pending('expansion') === true && storage.getItem('elderon.unlock-hollow-pending') === '1');
      // Play confirms while the game is open: an unsolicited update.
      let changes = 0;
      B.onChange = () => { changes++; };
      fake.push({ id: null, op: 'update', status: 'owned', owned: true, pending: false, price: null, title: null });
      check('late update: opens the expansion', B.owned('expansion') === true && B.locksExpansion() === false);
      check('late update: pending cleared', B.pending('expansion') === false && storage.getItem('elderon.unlock-hollow-pending') === null);
      check('late update: onChange called', changes === 1);
    } else {
      check(`buy ${outcome}: not pending`, B.pending('expansion') === false);
    }
  }

  // 7. An unknown buy status counts as an error.
  {
    const fake = fakeBridge((op) => op === 'query' ? { status: 'ok', owned: false, pending: false } : { status: 'weird', owned: false, pending: false });
    const B = loadBilling({ bridge: fake });
    await B.ready;
    check('unknown buy status: error', (await B.buy('expansion')).status === 'error');
  }

  // 8. Remembered ownership vs. what the query says.
  {
    // ok + owned:false clears it (refund or revocation).
    const storage = makeStorage({ 'elderon.unlock-hollow': '1' });
    const fake = playStore({ owned: false });
    const B = loadBilling({ storage, bridge: fake });
    check('remembered: open before Play answers', B.locksExpansion() === false);
    await B.ready;
    check('ok query, not owned: remembered ownership cleared', B.owned('expansion') === false && storage.getItem('elderon.unlock-hollow') === null);
    check('ok query, not owned: locked again', B.locksExpansion() === true);
  }
  {
    // unavailable keeps it (an offline launch).
    const storage = makeStorage({ 'elderon.unlock-hollow': '1' });
    const fake = playStore({ available: false });
    const B = loadBilling({ storage, bridge: fake });
    await B.ready;
    check('unavailable query: remembered ownership kept', B.owned('expansion') === true && storage.getItem('elderon.unlock-hollow') === '1');
    check('unavailable query: expansion stays open', B.locksExpansion() === false);
    check('unavailable query: not reachable', B.reachable() === false);
    check('unavailable query: restore keeps it', (await B.restore('expansion')) === true);
    check('unavailable query: no console errors', noErrors(B));
  }
  {
    // unavailable with nothing remembered: shut, with the fallback price.
    const fake = playStore({ available: false });
    const B = loadBilling({ bridge: fake });
    await B.ready;
    check('unavailable, never owned: locked', B.locksExpansion() === true);
    check('unavailable, never owned: fallback price', B.priceText('expansion') === '$5.99');
    // The store comes back and Play lists the purchase: Restore finds it.
    fake.st.available = true; fake.st.owned = true;
    check('restore after reconnect: owned', (await B.restore('expansion')) === true && B.locksExpansion() === false && B.reachable() === true);
  }
  {
    // A remembered pending payment: Play still lists it as pending.
    const storage = makeStorage({ 'elderon.unlock-hollow-pending': '1' });
    const fake = playStore({ pending: true });
    const B = loadBilling({ storage, bridge: fake });
    await B.ready;
    check('pending at launch: still pending, still locked', B.pending('expansion') === true && B.locksExpansion() === true);
    fake.st.pending = false;
    await B.restore('expansion');
    check('pending dropped by Play: flag cleared', B.pending('expansion') === false && storage.getItem('elderon.unlock-hollow-pending') === null);
  }
  {
    // An update can also close it again (a revocation while open).
    const fake = playStore({ owned: true });
    const B = loadBilling({ bridge: fake });
    await B.ready;
    fake.push({ id: null, op: 'update', status: 'ok', owned: false, pending: false });
    check('update owned:false: locked again', B.locksExpansion() === true);
  }

  // 9. Garbage on the reply channel is ignored, not thrown.
  {
    const fake = playStore();
    const B = loadBilling({ bridge: fake });
    await B.ready;
    let threw = false;
    try {
      B._ctx.window.__elderonPlayReply('not json');
      B._ctx.window.__elderonPlayReply('null');
      B._ctx.window.__elderonPlayReply(JSON.stringify({ id: 'nobody-asked', op: 'buy', status: 'cancelled' }));
    } catch (e) { threw = true; }
    check('garbage replies: ignored quietly', !threw && B.locksExpansion() === true && noErrors(B));
  }

  // 10. The reply timeout: a bridge that never answers cannot hang the
  //     game. Timers asked for the full timeout run at once here.
  {
    const asked = [];
    const timers = {
      setTimeout: (fn, ms) => { asked.push(ms); return setTimeout(fn, ms >= 1000 ? 1 : ms); },
      clearTimeout,
    };
    const fake = fakeBridge(() => null);   // silence
    const storage = makeStorage({ 'elderon.unlock-hollow': '1' });
    const B = loadBilling({ storage, bridge: fake, timers });
    await B.ready;
    check('timeout: ready settles', true);
    check('timeout: about 20 s requested', asked.includes(B.REPLY_TIMEOUT_MS) && B.REPLY_TIMEOUT_MS >= 15000 && B.REPLY_TIMEOUT_MS <= 30000);
    check('timeout: unanswered query keeps remembered ownership', B.owned('expansion') === true && B.reachable() === false);
    const fake2 = fakeBridge(() => null);
    const B2 = loadBilling({ bridge: fake2, timers });
    await B2.ready;
    const r = await B2.buy('expansion');
    check('timeout: unanswered buy resolves as error', r.status === 'error');
    check('timeout: restore resolves', (await B2.restore('expansion')) === false);
    check('timeout: no console errors', noErrors(B) && noErrors(B2));
    // A reply that turns up after the timeout still counts.
    fake2.push({ id: null, op: 'update', owned: true, pending: false });
    check('timeout: a later update still opens it', B2.locksExpansion() === false);
  }

  // 11. A bridge that throws: treated as unavailable, quietly.
  {
    const bridge = { bridge: { query() { throw new Error('boom'); }, buy() { throw new Error('boom'); } }, attach() {} };
    const B = loadBilling({ bridge });
    await B.ready;
    check('throwing bridge: locked, no hang', B.locksExpansion() === true);
    check('throwing bridge: buy is error', (await B.buy('expansion')).status === 'error');
    check('throwing bridge: no console errors', noErrors(B));
  }

  // 12. The simulation (tools/store-sim.html): the same reply channel, scripted.
  const sim = async (scenario, opts = {}) => {
    const storage = opts.storage || makeStorage({ 'elderon.store-sim': scenario });
    const B = loadBilling(Object.assign({ storage }, opts));
    await B.ready;
    return B;
  };
  {
    const B = await sim('ready');
    check('sim ready: locked', B.mode() === 'sim' && B.locksExpansion() === true && noChapterLocked(B));
    check('sim ready: price', B.priceText('expansion') === '$5.99');
    check('sim ready: buy unlocks', (await B.buy('expansion')).status === 'owned' && B.locksExpansion() === false);
  }
  {
    const B = await sim('owned-hollow');
    check('sim owned-hollow: open', B.locksExpansion() === false && noChapterLocked(B));
  }
  for (const [scenario, status] of [['cancel', 'cancelled'], ['error', 'error'], ['pending', 'pending'], ['offline', 'unavailable']]) {
    const B = await sim(scenario);
    check(`sim ${scenario}: locked`, B.locksExpansion() === true && noChapterLocked(B));
    check(`sim ${scenario}: buy reports ${status}`, (await B.buy('expansion')).status === status);
    check(`sim ${scenario}: still locked`, B.locksExpansion() === true);
    if (scenario === 'pending') {
      B._ctx.window.__elderonPlayReply(JSON.stringify({ id: null, op: 'update', status: 'owned', owned: true, pending: false }));
      check('sim pending: update clears it', B.locksExpansion() === false);
    }
    check(`sim ${scenario}: no console errors`, noErrors(B));
  }
  {
    const storage = makeStorage({ 'elderon.store-sim': 'offline', 'elderon.unlock-hollow': '1' });
    const B = await sim('offline', { storage });
    check('sim offline: remembered ownership kept', B.locksExpansion() === false);
  }
  {
    const B = await sim('nostore');
    check('sim nostore: open build rules', B.mode() === 'open' && B.locksExpansion() === false && noChapterLocked(B));
  }
  {
    const B = loadBilling({ search: '?store-sim=owned-hollow' });
    await B.ready;
    check('sim via URL', B.mode() === 'sim' && B.locksExpansion() === false);
    const B2 = loadBilling({ simGlobal: 'ready' });
    await B2.ready;
    check('sim via global', B2.mode() === 'sim' && B2.locksExpansion() === true);
  }
  {
    // Inside the Play app the real bridge always wins over a sim flag.
    const fake = playStore({ owned: false });
    const B = loadBilling({ storage: makeStorage({ 'elderon.store-sim': 'owned-hollow' }), bridge: fake, search: '?store-sim=owned-hollow' });
    await B.ready;
    check('bridge beats sim flags', B.mode() === 'play' && B.locksExpansion() === true);
  }

  await tick(20);
  console.log(`\nbilling: all ${passed} checks passed`);
})().catch(e => { console.error('FAIL:', e); process.exit(1); });
