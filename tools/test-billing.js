#!/usr/bin/env node
/* Exercises js/billing.js without a browser: the gate, the entitlement
   mirror, and the purchase outcomes, against fake store surfaces.

   The one thing faked is the boundary only Google can provide — the
   Digital Goods service and the Payment Request sheet. Everything on
   this side of it (detection, arming, persistence, purchase bookkeeping)
   is the game's real code, loaded fresh per scenario so no state leaks
   between them.

   Usage: node tools/test-billing.js   (exits non-zero on the first failure) */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'js', 'billing.js'), 'utf8');

function makeStorage(seed = {}) {
  const m = new Map(Object.entries(seed));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    _map: m,
  };
}

// A fake Digital Goods service for the Play store. `state.owned` flips
// what listPurchases reports, so a test can act out Play confirming a
// payment between one call and the next.
function fakeService({ details = null, owned = false } = {}) {
  const state = { owned };
  const item = {
    itemId: 'full_unlock', title: 'Full Game (fake)', description: 'fake',
    price: { currency: 'USD', value: '8.99' },
  };
  return {
    state,
    service: {
      async getDetails(ids) {
        if (details === 'throw') throw new Error('no details');
        const list = details === 'empty' ? [] : [item];
        return list.filter(d => ids.includes(d.itemId));
      },
      async listPurchases() { return state.owned ? [{ itemId: 'full_unlock', purchaseToken: 'tok' }] : []; },
      async consume() {},
    },
  };
}

function loadBilling({ storage, windowExtra = {}, search = '' }) {
  const ctx = {
    console, setTimeout, clearTimeout, URLSearchParams, Intl,
    localStorage: storage,
    location: { search },
    navigator: { language: 'en-US' },
    ...windowExtra,
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(SRC, ctx, { filename: 'billing.js' });
  return ctx.Billing;
}

let passed = 0;
function check(name, cond) {
  if (!cond) { console.error(`FAIL: ${name}`); process.exit(1); }
  passed++; console.log(`ok ${passed} - ${name}`);
}

(async () => {
  // 1. The open web: no Digital Goods API at all. No gate, ever.
  {
    const B = loadBilling({ storage: makeStorage() });
    await B.ready;
    check('web: not available', B.available() === false);
    check('web: not armed', B.armed() === false);
    check('web: chapter 5 open', B.locksChapter(5) === false);
    check('web: chapter 24 open', B.locksChapter(24) === false);
    check('web: buy is unavailable', (await B.buy()).status === 'unavailable');
  }

  // 2. A browser that has the API's shape but no Play product behind it
  //    (desktop Chrome, or a Play listing with no product created yet).
  {
    const fake = fakeService({ details: 'empty' });
    const B = loadBilling({
      storage: makeStorage(),
      windowExtra: { getDigitalGoodsService: async () => fake.service },
    });
    await B.ready;
    check('no product: not armed', B.armed() === false);
    check('no product: chapter 5 open', B.locksChapter(5) === false);
  }

  // 3. Play, not owned: the demo is chapters 0-4, the gate stands at 5.
  {
    const storage = makeStorage();
    const fake = fakeService();
    const B = loadBilling({
      storage,
      windowExtra: { getDigitalGoodsService: async () => fake.service },
    });
    await B.ready;
    check('play: available', B.available() === true);
    check('play: price from Play', B.priceText() === '$8.99');
    check('play: chapters 0-4 free', [0, 1, 2, 3, 4].every(i => !B.locksChapter(i)));
    check('play: chapter 5 locked', B.locksChapter(5) === true);
    check('play: chapter 24 locked', B.locksChapter(24) === true);
    check('play: store-seen remembered', storage.getItem('elderon.store-seen') === '1');
  }

  // 4. Play, already owned (bought on another device, promo code, ...).
  {
    const fake = fakeService({ owned: true });
    const B = loadBilling({
      storage: makeStorage(),
      windowExtra: { getDigitalGoodsService: async () => fake.service },
    });
    await B.ready;
    check('owned: entitlement seen', B.owned() === true);
    check('owned: nothing locked', B.locksChapter(5) === false && B.locksChapter(24) === false);
    check('owned: buy short-circuits', (await B.buy()).status === 'owned');
  }

  // 5. The store answered on an earlier launch; today it cannot be
  //    reached (getDigitalGoodsService throws). The gate stays armed —
  //    a tunnel is not an unlock — and the remembered answers hold.
  {
    const B = loadBilling({
      storage: makeStorage({ 'elderon.store-seen': '1' }),
      windowExtra: { getDigitalGoodsService: async () => { throw new Error('store unreachable'); } },
    });
    await B.ready;
    check('offline in Play: gate still armed', B.locksChapter(5) === true);
    check('offline in Play: demo still free', B.locksChapter(4) === false);
  }

  // 6. Buying: the sheet succeeds and Play lists the purchase.
  {
    const storage = makeStorage();
    const fake = fakeService();
    let seenMethods = null;
    class FakePaymentRequest {
      constructor(methods) { seenMethods = methods; }
      async show() {
        fake.state.owned = true;   // Play confirms as the sheet closes
        return { details: { purchaseToken: 'tok-1' }, complete: async () => {} };
      }
    }
    const B = loadBilling({
      storage,
      windowExtra: { getDigitalGoodsService: async () => fake.service, PaymentRequest: FakePaymentRequest },
    });
    await B.ready;
    const r = await B.buy();
    check('buy: owned', r.status === 'owned' && B.owned() === true);
    check('buy: Play billing method used', seenMethods[0].supportedMethods === 'https://play.google.com/billing');
    check('buy: full_unlock sku used', seenMethods[0].data.sku === 'full_unlock');
    check('buy: unlock persisted', storage.getItem('elderon.unlock') === '1');
    check('buy: gate open', B.locksChapter(5) === false);
  }

  // 7. Buying: the player closes the sheet. Nothing charged, still locked.
  {
    const fake = fakeService();
    class CancelRequest {
      async show() { const e = new Error('closed'); e.name = 'AbortError'; throw e; }
    }
    const B = loadBilling({
      storage: makeStorage(),
      windowExtra: { getDigitalGoodsService: async () => fake.service, PaymentRequest: CancelRequest },
    });
    await B.ready;
    const r = await B.buy();
    check('cancel: reported', r.status === 'cancelled');
    check('cancel: still locked', B.locksChapter(5) === true);
  }

  // 8. Buying: a deferred payment. The sheet resolves, Play has not
  //    listed the purchase yet — pending, not owned, not lost. When Play
  //    confirms it, Restore finds it.
  {
    const storage = makeStorage();
    const fake = fakeService();
    class PendingRequest {
      async show() { return { details: { purchaseToken: 'tok-p' }, complete: async () => {} }; }
    }
    const B = loadBilling({
      storage,
      windowExtra: { getDigitalGoodsService: async () => fake.service, PaymentRequest: PendingRequest },
    });
    await B.ready;
    const r = await B.buy();
    check('pending: reported', r.status === 'pending');
    check('pending: flagged', B.pending() === true && storage.getItem('elderon.unlock-pending') === '1');
    check('pending: still locked until confirmed', B.locksChapter(5) === true);
    fake.state.owned = true;    // Play confirms the deferred payment
    check('pending: restore finds it', (await B.restore()) === true);
    check('pending: flag cleared', B.pending() === false && storage.getItem('elderon.unlock-pending') === null);
    check('pending: gate open after restore', B.locksChapter(5) === false);
  }

  // 9. A revocation: Play stops listing the purchase (refund), and the
  //    mirror follows on the next ask — the client keeps no stale claim.
  {
    const fake = fakeService({ owned: true });
    const B = loadBilling({
      storage: makeStorage(),
      windowExtra: { getDigitalGoodsService: async () => fake.service },
    });
    await B.ready;
    check('revoke: owned first', B.owned() === true);
    fake.state.owned = false;
    check('revoke: restore drops it', (await B.restore()) === false && B.locksChapter(5) === true);
  }

  // 10. The simulation the harness drives: same code, scripted store.
  {
    const storage = makeStorage({ 'elderon.store-sim': 'unowned' });
    const B = loadBilling({ storage });
    await B.ready;
    check('sim unowned: armed', B.available() === true && B.locksChapter(5) === true);
    check('sim unowned: buy unlocks', (await B.buy()).status === 'owned' && B.locksChapter(5) === false);
  }
  {
    const B = loadBilling({ storage: makeStorage({ 'elderon.store-sim': 'cancel' }) });
    await B.ready;
    check('sim cancel: reported', (await B.buy()).status === 'cancelled');
    check('sim cancel: still locked', B.locksChapter(5) === true);
  }
  {
    const B = loadBilling({ storage: makeStorage({ 'elderon.store-sim': 'nostore' }) });
    await B.ready;
    check('sim nostore: web rules', B.armed() === false && B.locksChapter(5) === false);
  }
  {
    const B = loadBilling({ storage: makeStorage(), search: '?store-sim=owned' });
    await B.ready;
    check('sim via URL: owned', B.owned() === true && B.locksChapter(5) === false);
  }

  console.log(`\nbilling: all ${passed} checks passed`);
})().catch(e => { console.error('FAIL:', e); process.exit(1); });
