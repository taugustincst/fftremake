/* The Hollow Sky through the real screens: the expansion begun from the
   title with a veteran company, its sixteen chapters walked with the engine
   (the mirror battle among them, and the recruits joining), the fork and its
   three answers each taken to an ending, the road card and map, the wagon's
   stock and the Marches' errands and cities, the new trades on the tree, a
   finished first game going east and coming back west, saves across both,
   and every new field drawing under its own sky. */
const { BASE, open, OUT } = require('./lib');
let fails = 0;
const ok = (n, c, d) => { console.log((c ? 'PASS  ' : 'FAIL  ') + n + (d ? `  [${d}]` : '')); if (!c) fails++; };
(async () => {
  const { browser, page, errors } = await open();
  await page.waitForSelector('#screen-title.active');
  const title = await page.evaluate(() => ({ button: !!document.getElementById('btn-new-hollow'), text: document.getElementById('btn-new-hollow').textContent }));
  ok('the title offers The Hollow Sky', title.button && /Hollow Sky/.test(title.text), title.text);
  await page.click('#btn-new-hollow'); await page.waitForSelector('#screen-world.active');
  const shape = await page.evaluate(() => { const c = CAMPAIGNS.hollowsky; return { common: c.chapters.length, acts: c.acts.length, lastAct: c.acts[c.acts.length - 1], roads: c.roadOrder, act4End: c.chapters[15].outro.join(' ').includes('END OF ACT IV.'), noEnd: !c.chapters.some(x => x.final), endings: c.roadOrder.map(id => c.roads[id].ending.title), route: c.route.length, cities: c.cities.length, recruits: c.chapters.filter(x => x.recruit).map(x => x.recruit.job), mirror: c.chapters.filter(x => x.mirror).length }; });
  ok('sixteen chapters in four acts, then three answers with three endings, five towns and four recruits', shape.common === 16 && shape.acts === 4 && shape.lastAct.to === 17 && shape.roads.length === 3 && shape.act4End && shape.noEnd && new Set(shape.endings).size === 3 && shape.route === 16 && shape.cities === 5 && shape.recruits.join(',') === 'skyward,cantor,glassblade,lanternkeeper' && shape.mirror === 1, JSON.stringify(shape));
  const start = await page.evaluate(() => ({ campaign: game.state.campaign, chapter: game.state.chapter, party: game.state.party.length, lead: game.state.party.find(u => u.leader).name, gil: game.state.gil, card: document.querySelector('#world-next .chapter-num').textContent, title: document.querySelector('#world-next .chapter-title').textContent, geared: game.state.party.every(u => u.gear.weapon && u.gear.body), learned: game.state.party.every(u => Object.keys(u.learned).length >= 3), tier: game.shopTier() }));
  ok('a fresh Hollow Sky stands at the Bell Road with the thirteen, geared, learned and funded', start.campaign === 'hollowsky' && start.chapter === 0 && start.party === 13 && start.lead === 'Rowan' && start.gil >= 5000 && /The Hollow Sky/.test(start.card) && /Act 1/.test(start.card) && start.title === 'The Bell Road' && start.geared && start.learned && start.tier === 7, JSON.stringify(start));
  // The wagon carries the Marches' arms as the road is walked, and never the towns' own.
  await page.click('#btn-shop'); await page.waitForSelector('#screen-shop.active');
  const stocked = await page.evaluate(() => [...document.querySelectorAll('#shop-list button[data-buy]')].map(b => b.dataset.buy));
  ok('at the first field the wagon carries the pass spear and bow but not what comes later, nor city stock', stocked.includes('passSpear') && stocked.includes('greywallBow') && !stocked.includes('glassEdge') && !stocked.includes('skyIronBlade') && !stocked.includes('greywallSpear'), stocked.filter(i => /pass|greywall|glass|skyIron/.test(i)).join(','));
  await page.click('#btn-shop-back');
  const errands = await page.evaluate(() => game.offeredErrands().map(e => `${e.id}:${e.camp || 'base'}`));
  ok('the camp offers the Marches\' errands', errands.length === 2 && errands.every(x => /:hollowsky$/.test(x)), errands.join(','));
  // Walk the common road with the engine: foes fall to a blow, the story's
  // own hooks run (recruits, the mirror, the end of each act).
  const walked = await page.evaluate(async () => {
    const s = game.state, out = { fights: [], recruits: [], mirror: null };
    for (let i = 0; i < 16; i++) {
      const ch = game.chapterAt(i);
      const specs = ch.mirror ? game.mirrorEnemies(ch) : ch.enemies;
      if (ch.mirror) out.mirror = { n: specs.length, names: specs.map(e => e.name), jobs: specs.map(e => e.job), ours: s.party.slice(0, 5).map(u => u.job) };
      const b = Battle.setup(MAPS[ch.map], s.party, specs, { log: () => {}, awaitPlayerTurn: async (u) => b.aiTurn(u) }, ch.objective, 'knight');
      for (const u of b.units) if (u.team === 'enemy') { u.hp = 1; u.level = 1; if (u.phases) u.phases = []; }
      const res = await b.run();
      out.fights.push(`${ch.id}:${res}:${b.turnNo}${res === 'victory' ? '' : ':' + b.endReason}`);
      if (res !== 'victory') break;
      s.chapter++; s.victories++;
      if (ch.recruit) { const r = new Unit({ name: ch.recruit.name, job: ch.recruit.job, level: ch.recruit.level, team: 'player' }); s.party.push(r); out.recruits.push(r.name); }
    }
    for (const u of s.party) u.resetBattleState();
    game.showWorld();
    out.party = s.party.length; out.fork = game.atFork(); out.button = document.getElementById('btn-battle').textContent; out.title = document.querySelector('#world-next .chapter-title').textContent;
    return out;
  });
  ok('the sixteen chapters are fought to the top of the tower and the four join', walked.fights.length === 16 && walked.fights.every(f => /:victory:/.test(f)) && walked.recruits.join(',') === 'Thessaly,Cassian,Oriel,Maren' && walked.party === 17, JSON.stringify(walked.fights));
  ok('Mirrorwater fields reflections of the company itself', walked.mirror && walked.mirror.n === 5 && walked.mirror.names.every(n => /^Mirror /.test(n)) && walked.mirror.jobs.join(',') === walked.mirror.ours.join(','), JSON.stringify(walked.mirror));
  ok('at the top of the tower the road card offers the three answers', walked.fork && walked.button === 'Give an Answer' && walked.title === 'Three Answers', JSON.stringify({ fork: walked.fork, button: walked.button, title: walked.title }));
  await page.waitForTimeout(200);
  const mapBox = await page.$eval('#world-map', e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
  await page.screenshot({ path: `${OUT}/act6-fork.png`, clip: mapBox });
  await page.click('#btn-battle'); await page.waitForSelector('#screen-choice.active');
  const roads = await page.evaluate(() => ({ list: [...document.querySelectorAll('#choice-list .road')].map(r => r.dataset.road), title: document.getElementById('choice-title').textContent }));
  ok('the choice screen lists the three answers', roads.list.join(',') === 'silence,ascent,lantern' && roads.title === 'Three Answers', JSON.stringify(roads));
  ok('Back leaves the choice for camp', await page.evaluate(() => handleBack() && game.screen === 'world'));
  const walk = async (id) => page.evaluate(async (id) => {
    const s = game.state; s.chapter = 16; s.branch = null;
    const chose = game.chooseRoad(id); game.answerAsk(true); await chose;
    const out = { id, branch: s.branch, fights: [] };
    for (let i = 0; i < 2; i++) {
      const ch = game.chapterAt(16 + i);
      const b = Battle.setup(MAPS[ch.map], s.party, ch.enemies, { log: () => {}, awaitPlayerTurn: async (u) => b.aiTurn(u) }, ch.objective, 'knight');
      for (const u of b.units) if (u.team === 'enemy') { u.hp = 1; u.level = 1; if (u.phases) u.phases = []; }
      const res = await b.run();
      out.fights.push(`${ch.id}:${res}:${b.turnNo}${res === 'victory' ? '' : ':' + b.endReason}`);
      if (res !== 'victory') break;
      s.chapter++;
      if (ch.final) s.endings[s.branch] = true;
    }
    for (const u of s.party) u.resetBattleState();
    out.done = game.roadDone(); out.endings = Object.keys(s.endings);
    game.showWorld();
    out.card = document.querySelector('#world-next .chapter-num').textContent;
    out.another = !!document.getElementById('btn-another');
    out.west = !!document.getElementById('btn-west');
    return out;
  }, id);
  const titles = { silence: 'The Silence', ascent: 'The Ascent', lantern: 'The Lantern' };
  for (const id of ['silence', 'ascent', 'lantern']) {
    const r = await walk(id);
    ok(`${titles[id]} is fought to its ending, recorded, and offers another answer while one is left`, r.branch === id && r.fights.length === 2 && r.fights.every(f => /:victory:/.test(f)) && r.done && r.endings.includes(id) && r.another === (r.endings.length < 3) && r.card.includes(titles[id]) && !r.west, JSON.stringify(r));
  }
  const seen = await page.evaluate(() => ({ n: Object.keys(game.state.endings).length, text: document.querySelector('#world-next .revisit-row').textContent, another: !!document.getElementById('btn-another'), rec: document.querySelector('#records .rec-endings').textContent }));
  ok('with every answer given, the road card says so', seen.n === 3 && /3 of 3/.test(seen.text) && /Every answer has been given/.test(seen.text) && !seen.another && /3 of 3/.test(seen.rec), JSON.stringify(seen));
  // Trials draw on the Marches' fields and pools.
  const trial = await page.evaluate(() => { const t = game.trialSpec(1); return { map: t.map, hollowMap: !!MAPS_HOLLOW[t.map], jobs: t.jobs, pool: game.mapPool(true).every(m => MAPS_HOLLOW[m]) }; });
  ok('the trials and training after the sky are fought on the Marches\' fields', trial.hollowMap && trial.pool, JSON.stringify(trial));
  // Saving and loading keeps the campaign, the answer taken and the endings.
  await page.evaluate(() => game.saveGame());
  await page.reload(); await page.waitForSelector('#screen-title.active');
  await page.click('#btn-continue'); await page.waitForSelector('#screen-world.active');
  const loaded = await page.evaluate(() => ({ campaign: game.state.campaign, branch: game.state.branch, endings: Object.keys(game.state.endings).length, party: game.state.party.length, }));
  ok('a save keeps the Hollow Sky, the answer given and the endings seen', loaded.campaign === 'hollowsky' && loaded.branch === 'lantern' && loaded.endings === 3 && loaded.party === 17, JSON.stringify({ c: loaded.campaign, b: loaded.branch, e: loaded.endings, p: loaded.party }));
  // The new trades open from the tree; the towns are on the road with their own markets and kennels.
  await page.evaluate(() => { const u = game.state.party[0]; u.jpTotal.dragoon = 260; u.jpTotal.archer = 260; u.jpTotal.bard = 260; u.jpTotal.whiteMage = 450; u.jpTotal.samurai = 260; u.jpTotal.duelist = 100; u.jpTotal.engineer = 100; game.showWorld(); });
  await page.click('#btn-formation'); await page.waitForSelector('#screen-formation.active');
  await page.click('#btn-tree'); await page.waitForTimeout(150);
  const openJobs = await page.evaluate(() => Object.fromEntries(['skyward', 'cantor', 'glassblade', 'lanternkeeper'].map(j => [j, (document.querySelector(`.job-card[data-job="${j}"]`) || { className: 'missing' }).className.includes('open')])));
  ok('Skyward, Cantor, Glassblade and Lanternkeeper open from their requirements', Object.values(openJobs).every(Boolean), JSON.stringify(openJobs));
  await page.click('#btn-formation-back');
  const cities = await page.evaluate(() => { game.showCampTab('cities'); return [...document.querySelectorAll('.cities-card [data-city]')].map(e => e.dataset.city); });
  ok('the five towns of the Marches are on the road, and none of the first game\'s', cities.join(',') === 'greywallWatch,wickmarket,lampholt,glassmere,emberfall', cities.join(','));
  const city = await page.evaluate(() => { const c = CAMPAIGNS.hollowsky.cities[3]; game.state.cities[c.id] = true; game.cityView = c.id; game.renderCities(); const el = document.getElementById('cities'); return { hires: [...el.querySelectorAll('[data-hire-at]')].map(b => b.dataset.hireAt), pets: [...el.querySelectorAll('[data-pet-at]')].map(b => b.dataset.petAt), stock: [...el.querySelectorAll('[data-buy-at]')].map(b => b.dataset.buyAt), forge: !!el.querySelector('.forge, [data-forge-tab], .forge-tabs') }; });
  ok('an open Glassmere hires glassblades, kennels glass stags and sells its own blades', city.hires.includes('glassblade') && city.pets.includes('glassStag') && city.stock.join(',') === 'facetKatana,prismShield', JSON.stringify(city));
  await page.evaluate(() => { game.cityView = null; game.showCampTab('road'); });
  // A finished first game goes east with its own company, and can come back.
  await page.evaluate(() => {
    game.newGame(2);
    const s = game.state; s.chapter = 26; s.branch = 'crown'; s.endings = { crown: true }; s.gil = 12000;
    s.party.forEach(u => { u.level = 30; });
    s.exiled = []; game.showWorld();
  });
  const east = await page.evaluate(async () => { const before = { party: game.state.party.length, east: !!document.getElementById('btn-east') }; const go = game.goEast(); game.answerAsk(true); await go; const s = game.state; return Object.assign(before, { campaign: s.campaign, chapter: s.chapter, prior: s.prior, party: s.party.length, card: document.querySelector('#world-next .chapter-num').textContent, endings: Object.keys(s.endings) }); });
  ok('a company that has walked a road to its end is offered the east and goes with everything it has', east.east && east.campaign === 'hollowsky' && east.chapter === 0 && east.prior && east.prior.chapter === 26 && east.prior.branch === 'crown' && east.party === 4 && /Hollow Sky/.test(east.card) && east.endings.includes('crown'), JSON.stringify(east));
  const west = await page.evaluate(async () => { const s = game.state; s.chapter = 18; s.branch = 'silence'; s.endings.silence = true; game.showWorld(); const had = !!document.getElementById('btn-west'); const go = game.goWest(); game.answerAsk(true); await go; return { had, campaign: game.state.campaign, chapter: game.state.chapter, branch: game.state.branch, card: document.querySelector('#world-next .chapter-num').textContent, endings: Object.keys(game.state.endings).sort().join(',') }; });
  ok('from the Marches\' end the capital can be walked back to as the first road left it', west.had && west.campaign === null && west.chapter === 26 && west.branch === 'crown' && /The Crown/.test(west.card) && west.endings === 'crown,silence', JSON.stringify(west));
  // An old save with no campaign loads onto the first road; the records tab counts the first game's endings.
  const base = await page.evaluate(() => { const raw = JSON.parse(localStorage.getItem(slotKey(2))); delete raw.campaign; delete raw.prior; raw.v = 5; localStorage.setItem(slotKey(2), JSON.stringify(raw)); game.loadGame(2); return { campaign: game.state.campaign, chapter: game.state.chapter, endings: document.querySelector('#records .rec-endings').textContent }; });
  ok('a save from before the expansion loads onto the first road', base.campaign === null && base.chapter === 26 && /of 5/.test(base.endings), JSON.stringify(base));
  // Every new field draws, in its own mood, with the new sprites in place.
  const moods = await page.evaluate(async () => {
    const out = {};
    const all = [...CAMPAIGNS.hollowsky.chapters, ...CAMPAIGNS.hollowsky.roadOrder.flatMap(id => CAMPAIGNS.hollowsky.roads[id].chapters)];
    for (const ch of all) {
      const m = ch.map;
      game.battle = Battle.setup(MAPS[m], game.state.party, ch.mirror ? game.mirrorEnemies(ch) : ch.enemies, { log: () => {}, awaitPlayerTurn: async () => {} }, ch.objective, 'knight');
      game.renderer.setBattle(game.battle); game.renderer.mood = MAPS[m].mood; game.renderer.fit(); game.renderer.draw();
      out[m] = MAPS[m].mood;
      await new Promise(r => setTimeout(r, 30));
    }
    return { n: Object.keys(out).length, moods: [...new Set(Object.values(out))], tracks: ['choir', 'glass', 'hollow'].every(t => !!TRACKS[t]), skies: ['ash', 'lantern', 'glass', 'hollow'].every(m => !!MOODS[m]), sprites: ['skyward', 'cantor', 'glassblade', 'lanternkeeper', 'hollowed', 'emberMoth', 'glassStag', 'theHerald', 'theChorus'].every(j => SPRITE_TEMPLATES[JOBS[j].sprite]) };
  });
  ok('every field of the Marches draws under its own sky, with its music and sprites in place', moods.n === 22 && moods.moods.includes('hollow') && moods.moods.includes('glass') && moods.tracks && moods.skies && moods.sprites && errors.length === 0, JSON.stringify(moods));
  ok('no page errors', errors.length === 0, errors.join(' | '));
  console.log(fails ? `${fails} FAILED` : 'all Hollow Sky checks passed');
  await browser.close();
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('FAILED', e); process.exit(1); });
