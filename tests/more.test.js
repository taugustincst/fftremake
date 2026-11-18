// The "More from AugustInnovations" list: node tests/more.test.js
// js/more.js is the studio's shared catalog, byte for byte the same in every game.
const fs = require('fs'); const path = require('path'); const assert = require('assert');
const M = require('../js/more.js'); const root = path.resolve(__dirname, '..');
const gradle = fs.readFileSync(path.join(root, 'android/play/build.gradle'), 'utf8');
const self = (gradle.match(/applicationId\s+['"]com\.taugustincst\.([a-z0-9]+)['"]/) || [])[1];
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const png = (f) => { const b = fs.readFileSync(path.join(root, f)); assert.strictEqual(b.toString('latin1', 1, 4), 'PNG', f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
let n = 0; const t = (name, fn) => { fn(); n++; console.log('PASS ' + name); };
t('this game is in the catalog', () => assert.ok(M.CATALOG.some(x => x.id === self), 'no catalog entry for ' + self));
const list = M.listFor(self);
t('the list leaves this game out', () => assert.ok(list.length > 0 && !list.some(x => x.id === self)));
t('only live titles with a hook are listed', () => assert.ok(list.every(x => x.live && x.hook)));
t('no prices or promo words on the screen', () => list.forEach(x => assert.ok(!/[$£€¥]|\bfree\b|\bsale\b|\bdiscount\b|\bprice\b/i.test(x.title + ' ' + x.hook), x.id)));
t('hooks fit one line of 80 characters', () => list.forEach(x => assert.ok(x.hook.length <= 80, x.id)));
t('every link is a Play listing on our package', () => list.forEach(x => assert.strictEqual(M.url(x), 'https://play.google.com/store/apps/details?id=com.taugustincst.' + x.id)));
t('every listed title has a 96px icon, cached by the service worker and packed into the app', () => { const sw = read('sw.js'); assert.ok(/'icons\/\*\*'/.test(gradle)); list.forEach(x => { assert.deepStrictEqual(png(M.icon(x)), [96, 96], M.icon(x)); assert.ok(sw.includes(`'${M.icon(x)}'`), 'sw.js lacks ' + M.icon(x)); }); assert.ok(sw.includes("'js/more.js'")); });
t('nearest genre comes first', () => { const share = x => x.tags.filter(g => M.CATALOG.find(c => c.id === self).tags.includes(g)).length; for (let i = 1; i < list.length; i++) assert.ok(share(list[i - 1]) >= share(list[i])); });
t('the 16+ title is never cross-promoted', () => assert.ok(!M.CATALOG.some(x => x.id === 'nightshift')));
t('the entry is on the title screen only', () => { const html = read('index.html'); const title = html.slice(html.indexOf('<section id="screen-title"'), html.indexOf('</section>', html.indexOf('<section id="screen-title"'))); assert.ok(title.includes('id="btn-more"')); assert.strictEqual((html.match(/btn-more"/g) || []).length, 1); assert.strictEqual((read('js/game.js').match(/showScreen\('more'\)/g) || []).length, 1); });
console.log(`${n}/10 more-games checks passed`);
