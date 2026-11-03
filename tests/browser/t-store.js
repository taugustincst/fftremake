/* The store through the real screens. Elderon is a paid download: no
   chapter is ever behind a gate, in any build. The Hollow Sky is gated
   only where a Play store is present — here, the simulation in
   js/billing.js, which answers through the same reply channel as the
   native ElderonPlay bridge — and is open in the plain build. */
const { BASE, open } = require('./lib');
let failures = 0;
function check(name, cond, extra) {
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${name}${extra !== undefined ? `  [${extra}]` : ''}`);
  if (!cond) failures++;
}
(async () => {
  const { browser, page, errors } = await open();
  const load = async (query) => {
    await page.goto(BASE + '/index.html' + query);
    await page.evaluate(() => { try { localStorage.clear(); } catch (e) { /* fine */ } });
    await page.goto(BASE + '/index.html' + query);
    await page.waitForFunction(() => window.game && window.Billing && Billing.ready);
    await page.evaluate(() => Billing.ready);
  };
  const toUnlock = async () => {
    await page.evaluate(() => game.showScreen('title'));
    await page.click('#btn-new-hollow');
    await page.waitForFunction(() => game.screen === 'unlock' || !!(game.state && game.state.campaign === 'hollowsky'), null, { timeout: 5000 });
    return page.evaluate(() => game.screen);
  };
  const buyAndWait = async () => {
    await page.click('#btn-unlock-buy');
    await page.waitForFunction(() => !game._unlockBusy, null, { timeout: 25000 });
  };

  // 1. The plain build: no store. Nothing gated, the expansion included.
  await load('');
  check('plain: no store', await page.evaluate(() => Billing.mode() === 'open' && !Billing.locksExpansion()));
  check('plain: no Options unlock card', await page.evaluate(() => !document.getElementById('unlock-card')));
  check('plain: Hollow Sky starts at once', (await toUnlock()) !== 'unlock');

  // 2. The Play store (simulated), expansion not bought.
  await load('?store-sim=ready');
  check('sim ready: expansion locked', await page.evaluate(() => Billing.mode() === 'sim' && Billing.locksExpansion()));
  // Every chapter of the first game is open: stand at Ashen Ridge (the old
  // demo boundary) and at the last common chapter, and march.
  for (const ch of [5, 18]) {
    await page.evaluate((ch) => { game.newGame(); game.state.chapter = ch; game.showWorld(); }, ch);
    check(`sim: chapter ${ch + 1} shows no gate warning`, await page.evaluate(() => !/demo|full game/i.test(document.getElementById('world-next').textContent)));
    await page.evaluate(() => { game.startNextChapter(); });
    await page.waitForTimeout(400);
    check(`sim: chapter ${ch + 1} marches (no unlock screen)`, await page.evaluate(() => game.screen !== 'unlock'), await page.evaluate(() => game.screen));
    await page.evaluate(() => { if (game.storyBox && game.storyBox.close) game.storyBox.close(); });
  }
  check('sim: the Hollow Sky opens the unlock screen', (await toUnlock()) === 'unlock');
  const screen = await page.evaluate(() => ({
    title: document.getElementById('unlock-title').textContent,
    price: document.getElementById('unlock-price').textContent,
    buy: document.getElementById('btn-unlock-buy').textContent,
    text: document.getElementById('screen-unlock').textContent,
  }));
  check('unlock: titled for the expansion', screen.title === 'The Hollow Sky', screen.title);
  check('unlock: price from the store', screen.price === '$5.99' && screen.buy.includes('$5.99'), screen.buy);
  check('unlock: no demo or full-game wording', !/demo|full game/i.test(screen.text));
  await buyAndWait();
  check('sim ready: buying unlocks it', await page.evaluate(() => !Billing.locksExpansion() && game.screen !== 'unlock'), await page.evaluate(() => game.screen));
  check('sim ready: ownership remembered', await page.evaluate(() => localStorage.getItem('elderon.unlock-hollow') === '1'));
  check('sim ready: the Hollow Sky now starts', (await toUnlock()) !== 'unlock');

  // 3. The player cancels at the till.
  await load('?store-sim=cancel');
  await toUnlock();
  await buyAndWait();
  check('sim cancel: message, still on the unlock screen', await page.evaluate(() => game.screen === 'unlock' && /closed before it finished/.test(document.getElementById('unlock-msg').textContent)));

  // 4. Store errors.
  await load('?store-sim=error');
  await toUnlock();
  await buyAndWait();
  check('sim error: message', await page.evaluate(() => /did not go through/.test(document.getElementById('unlock-msg').textContent)));

  // 5. A pending payment, cleared by a late "update" while the screen is up.
  await load('?store-sim=pending');
  await toUnlock();
  await buyAndWait();
  check('sim pending: waiting message', await page.evaluate(() => /still confirming/.test(document.getElementById('unlock-msg').textContent) && Billing.pending('expansion')));
  await page.evaluate(() => window.__elderonPlayReply(JSON.stringify({ id: null, op: 'update', status: 'owned', owned: true, pending: false })));
  check('sim pending: the update opens it on screen', await page.evaluate(() => !document.getElementById('unlock-owned').hidden && document.getElementById('unlock-buy-row').hidden && !Billing.locksExpansion()));

  // 6. Billing unreachable: buy and restore say so; nothing hangs.
  await load('?store-sim=offline');
  await toUnlock();
  check('sim offline: fallback price', await page.evaluate(() => document.getElementById('unlock-price').textContent === '$5.99'));
  await buyAndWait();
  check('sim offline: buy says unreachable', await page.evaluate(() => /cannot be reached/.test(document.getElementById('unlock-msg').textContent)));
  await page.click('#btn-unlock-restore');
  await page.waitForFunction(() => !game._unlockBusy, null, { timeout: 25000 });
  check('sim offline: restore says unreachable', await page.evaluate(() => /cannot be reached/.test(document.getElementById('unlock-msg').textContent)));

  // 7. Already owned.
  await load('?store-sim=owned-hollow');
  check('sim owned-hollow: the Hollow Sky starts at once', (await toUnlock()) !== 'unlock');

  check('no page or console errors', errors.length === 0, errors.join(' | '));
  await browser.close();
  console.log(failures ? `${failures} store check(s) FAILED` : 'store: all checks passed');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('FAILED', e); process.exit(1); });
