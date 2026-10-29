#!/usr/bin/env node
/* Builds the Hollow Sky's battlefields and writes js/maps2.js.

   Each field is a short spec: a size, a lie of the land (a ramp, a ridge, a
   bowl, a stair, a plateau), the features laid over it (a road, a river and
   its bridge, a stand of pillars, a courtyard of stone, a ring of water) and
   the mood it is fought under. The lie gives the heights, a seeded noise
   roughens them, the features carve the terrain, and the deployment is
   taken from the side the company arrives on. A field is kept only if the
   company can walk from its deployment to most of the board.

   Usage: node tools/make-maps-hollow.js   (rewrites js/maps2.js) */
const fs = require('fs');
const path = require('path');

function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// The lie of the land: height as a function of x,y in [0,1].
const LIES = {
  ramp: (x, y, p) => (p.dir === 'E' ? x : p.dir === 'W' ? 1 - x : p.dir === 'S' ? y : 1 - y) * 4,
  ridge: (x, y, p) => 4.5 - Math.abs((p.axis === 'x' ? x : y) - 0.5) * 9,
  bowl: (x, y) => Math.hypot(x - 0.5, y - 0.5) * 7,
  dome: (x, y) => 4.5 - Math.hypot(x - 0.5, y - 0.5) * 7,
  stair: (x, y, p) => Math.floor((p.dir === 'E' ? x : 1 - x) * 6) * 1.0,
  plateau: (x, y) => (x > 0.3 && x < 0.7 && y > 0.3 && y < 0.7 ? 3 : 1),
  valley: (x, y) => Math.abs(x - 0.5) * 7,
  terrace: (x, y) => Math.floor((x * 0.6 + y * 0.4) * 5),
  flat: () => 1.5,
  diagonal: (x, y) => (x + y) * 2.2,
};

function build(id, s) {
  const r = rng(s.seed * 7919 + s.w * 31 + s.h);
  const { w, h } = s;
  const lie = LIES[s.lie] || LIES.flat;
  // Value noise on a coarse grid, bilinear between knots.
  const kw = 4, kh = 4, knots = [];
  for (let j = 0; j <= kh; j++) { knots.push([]); for (let i = 0; i <= kw; i++) knots[j].push(r()); }
  const noise = (x, y) => {
    const fx = x * kw, fy = y * kh, i = Math.min(kw - 1, Math.floor(fx)), j = Math.min(kh - 1, Math.floor(fy)), tx = fx - i, ty = fy - j;
    const a = knots[j][i], b = knots[j][i + 1], c = knots[j + 1][i], d = knots[j + 1][i + 1];
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
  };
  const H = [], T = [];
  for (let y = 0; y < h; y++) {
    H.push([]); T.push([]);
    for (let x = 0; x < w; x++) {
      const nx = (x + 0.5) / w, ny = (y + 0.5) / h;
      let v = lie(nx, ny, s) + (noise(nx, ny) - 0.5) * (s.rough === undefined ? 2.2 : s.rough) + (s.lift || 0);
      v = Math.max(0, Math.min(s.maxH === undefined ? 6 : s.maxH, Math.round(v)));
      H[y].push(v);
      T[y].push(s.ground || 'g');
    }
  }
  // Ground reads from height: the high is stone, the low is dirt, unless told otherwise.
  if (!s.ground) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) T[y][x] = H[y][x] >= (s.stoneAt || 4) ? 's' : H[y][x] <= (s.dirtAt === undefined ? 0 : s.dirtAt) ? 'd' : 'g';
  const inb = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
  const line = (a, b, fn) => { const n = Math.max(1, Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])); for (let i = 0; i <= n; i++) { const x = Math.round(a[0] + (b[0] - a[0]) * i / n), y = Math.round(a[1] + (b[1] - a[1]) * i / n); if (inb(x, y)) fn(x, y); } };
  for (const f of s.features || []) {
    if (f.t === 'road') { line(f.from, f.to, (x, y) => { T[y][x] = f.ch || 'd'; if (f.level !== undefined) H[y][x] = f.level; }); if (f.wide) line([f.from[0], f.from[1] + 1], [f.to[0], f.to[1] + 1], (x, y) => { T[y][x] = f.ch || 'd'; if (f.level !== undefined) H[y][x] = f.level; }); }
    if (f.t === 'river') { line(f.from, f.to, (x, y) => { T[y][x] = 'w'; H[y][x] = f.level || 0; }); if (f.wide) line([f.from[0] + (f.wide[0] || 0), f.from[1] + (f.wide[1] || 0)], [f.to[0] + (f.wide[0] || 0), f.to[1] + (f.wide[1] || 0)], (x, y) => { T[y][x] = 'w'; H[y][x] = f.level || 0; }); }
    if (f.t === 'bridge') { line(f.from, f.to, (x, y) => { T[y][x] = 'b'; H[y][x] = f.level === undefined ? 1 : f.level; }); }
    if (f.t === 'pool') { for (let y = f.y - f.r; y <= f.y + f.r; y++) for (let x = f.x - f.r; x <= f.x + f.r; x++) if (inb(x, y) && Math.abs(x - f.x) + Math.abs(y - f.y) <= f.r) { T[y][x] = 'w'; H[y][x] = f.level || 0; } }
    if (f.t === 'rect') { for (let y = f.y; y < f.y + f.h; y++) for (let x = f.x; x < f.x + f.w; x++) if (inb(x, y)) { if (f.ch) T[y][x] = f.ch; if (f.level !== undefined) H[y][x] = f.level; } }
    if (f.t === 'pillars') { for (const [x, y] of f.at) if (inb(x, y)) { T[y][x] = f.ch || (s.ground === 's' || s.ground === 'd' || s.columns ? 'p' : 't'); } }
    if (f.t === 'scatter') { let n = 0; for (let k = 0; k < 400 && n < f.n; k++) { const x = Math.floor(r() * w), y = Math.floor(r() * h); if (T[y][x] === 'g' || T[y][x] === 's') { T[y][x] = f.ch || 't'; n++; } } }
    if (f.t === 'void') { for (let y = f.y; y < f.y + f.h; y++) for (let x = f.x; x < f.x + f.w; x++) if (inb(x, y)) { T[y][x] = 'x'; H[y][x] = 0; } }
    if (f.t === 'smooth') { for (let y = f.y; y < f.y + f.h; y++) for (let x = f.x; x < f.x + f.w; x++) if (inb(x, y)) H[y][x] = f.level; }
  }
  // Deployment: the first five or six passable tiles nearest the arriving edge's middle.
  const edge = s.deploy || 'W';
  const cx = edge === 'W' ? 0 : edge === 'E' ? w - 1 : edge === 'N' ? Math.floor(w / 2) : edge === 'S' ? Math.floor(w / 2) : Math.floor(w / 2);
  const cy = edge === 'N' ? 0 : edge === 'S' ? h - 1 : edge === 'W' ? Math.floor(h / 2) : edge === 'E' ? Math.floor(h / 2) : Math.floor(h / 2);
  const dx0 = s.deployAt ? s.deployAt[0] : cx, dy0 = s.deployAt ? s.deployAt[1] : cy;
  const pass = (x, y) => inb(x, y) && !'wtxp'.includes(T[y][x]);
  const cand = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (pass(x, y)) cand.push({ x, y, d: Math.abs(x - dx0) * (edge === 'W' || edge === 'E' ? 2 : 1) + Math.abs(y - dy0) * (edge === 'N' || edge === 'S' ? 2 : 1) });
  cand.sort((a, b) => a.d - b.d);
  // Level the deployment so the company stands together.
  const anchors = cand.slice(0, 6);
  const lvl = Math.round(anchors.reduce((a, t) => a + H[t.y][t.x], 0) / anchors.length);
  for (const t of anchors) H[t.y][t.x] = lvl;
  const deploy = anchors.map(t => [t.x, t.y]);
  // Walkability: from the deployment, over steps of two levels at most.
  const seen = new Set(), q = [deploy[0]]; seen.add(deploy[0].join(','));
  while (q.length) { const [x, y] = q.shift(); for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + ax, ny = y + ay, k = `${nx},${ny}`; if (seen.has(k) || !pass(nx, ny)) continue; if (Math.abs(H[ny][nx] - H[y][x]) > 2) continue; seen.add(k); q.push([nx, ny]); } }
  const total = cand.length, reach = seen.size;
  // Anything the company cannot reach is lowered a step toward its neighbours until it can; after a few passes, whatever is left becomes void.
  for (let pass_ = 0; pass_ < 8 && seen.size < total; pass_++) {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!pass(x, y) || seen.has(`${x},${y}`)) continue;
      let best = null;
      for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + ax, ny = y + ay; if (seen.has(`${nx},${ny}`)) { if (best === null || Math.abs(H[ny][nx] - H[y][x]) < Math.abs(best - H[y][x])) best = H[ny][nx]; } }
      if (best !== null) H[y][x] = H[y][x] > best ? best + 2 : best - 2 < 0 ? 0 : Math.max(best - 2, H[y][x]);
    }
    seen.clear(); q.push(deploy[0]); seen.add(deploy[0].join(','));
    while (q.length) { const [x, y] = q.shift(); for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + ax, ny = y + ay, k = `${nx},${ny}`; if (seen.has(k) || !pass(nx, ny)) continue; if (Math.abs(H[ny][nx] - H[y][x]) > 2) continue; seen.add(k); q.push([nx, ny]); } }
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (pass(x, y) && !seen.has(`${x},${y}`)) T[y][x] = 't';
  return { name: s.name, w, h, mood: s.mood, heights: H.map(row => row.join('')), terrain: T.map(row => row.join('')), deploy, reach: `${seen.size}/${total}` };
}

/* ------------------------------------------------------------------ fields */
const SPECS = {
  // Act I: the bell, and the road east to the Greywall.
  bellroad:    { name: 'The Bell Road', w: 12, h: 11, mood: 'ash', lie: 'ramp', dir: 'E', seed: 101, rough: 1.6, deploy: 'W', features: [{ t: 'road', from: [0, 5], to: [11, 5], level: 1 }, { t: 'scatter', n: 5 }, { t: 'pool', x: 9, y: 2, r: 1 }] },
  greywallPass:{ name: 'Greywall Pass', w: 11, h: 13, mood: 'snow', lie: 'ridge', axis: 'x', seed: 102, rough: 1.8, deploy: 'S', stoneAt: 3, features: [{ t: 'road', from: [5, 12], to: [5, 0], level: 2 }, { t: 'void', x: 0, y: 0, w: 2, h: 4 }, { t: 'void', x: 9, y: 0, w: 2, h: 4 }, { t: 'scatter', n: 4 }] },
  beaconStairs:{ name: 'The Beacon Stairs', w: 12, h: 12, mood: 'aurora', lie: 'stair', dir: 'E', columns: true, seed: 103, rough: 1.2, deploy: 'W', stoneAt: 2, features: [{ t: 'pillars', at: [[3, 2], [3, 9], [7, 2], [7, 9], [10, 5]] }, { t: 'river', from: [0, 0], to: [0, 11], level: 0 }] },
  lanternGate: { name: 'The Lantern Gate', w: 13, h: 11, mood: 'lantern', lie: 'flat', seed: 104, rough: 1.0, deploy: 'W', ground: 'd', features: [{ t: 'rect', x: 8, y: 0, w: 5, h: 11, ch: 's', level: 3 }, { t: 'rect', x: 8, y: 4, w: 2, h: 3, ch: 'd', level: 1 }, { t: 'pillars', at: [[8, 3], [8, 7], [12, 3], [12, 7]] }, { t: 'rect', x: 3, y: 2, w: 2, h: 2, ch: 'w', level: 0 }] },
  // Act II: the Lantern Marches.
  wickmarket:  { name: 'Wickmarket Square', w: 12, h: 12, mood: 'lantern', lie: 'flat', seed: 105, rough: 0.8, deploy: 'S', ground: 's', features: [{ t: 'rect', x: 4, y: 4, w: 4, h: 4, ch: 's', level: 3 }, { t: 'pillars', at: [[1, 1], [10, 1], [1, 10], [10, 10], [5, 5], [6, 6]] }, { t: 'rect', x: 0, y: 5, w: 3, h: 2, ch: 'w', level: 0 }, { t: 'road', from: [5, 11], to: [5, 8], level: 1 }] },
  mothFields:  { name: 'The Moth Fields', w: 13, h: 12, mood: 'ember', lie: 'dome', seed: 106, rough: 1.6, deploy: 'W', features: [{ t: 'scatter', n: 7 }, { t: 'pool', x: 10, y: 9, r: 1 }, { t: 'pool', x: 2, y: 2, r: 1 }] },
  singingWell: { name: 'The Singing Well', w: 12, h: 12, mood: 'mist', lie: 'bowl', seed: 107, rough: 1.4, deploy: 'N', features: [{ t: 'pool', x: 6, y: 6, r: 2 }, { t: 'bridge', from: [4, 6], to: [8, 6], level: 1 }, { t: 'scatter', n: 4 }] },
  cathedral:   { name: 'Cathedral of Lamps', w: 13, h: 13, mood: 'court', lie: 'flat', seed: 108, rough: 0.5, deploy: 'S', ground: 's', features: [{ t: 'pillars', at: [[2, 2], [2, 5], [2, 8], [10, 2], [10, 5], [10, 8], [5, 10], [7, 10]] }, { t: 'rect', x: 4, y: 0, w: 5, h: 3, ch: 's', level: 4 }, { t: 'rect', x: 5, y: 3, w: 3, h: 1, ch: 's', level: 2 }, { t: 'rect', x: 0, y: 0, w: 2, h: 2, ch: 'x' }, { t: 'rect', x: 11, y: 0, w: 2, h: 2, ch: 'x' }] },
  // Act III: the Glass Desert.
  shatteredRoad:{ name: 'The Shattered Road', w: 13, h: 11, mood: 'glass', lie: 'valley', seed: 109, rough: 1.8, deploy: 'W', ground: 'd', dirtAt: -1, stoneAt: 3, features: [{ t: 'road', from: [0, 5], to: [12, 5], ch: 's', level: 1 }, { t: 'scatter', n: 6 }] },
  mirrorwater: { name: 'Mirrorwater', w: 12, h: 12, mood: 'glass', lie: 'flat', seed: 110, rough: 0.6, deploy: 'W', ground: 's', features: [{ t: 'river', from: [5, 0], to: [5, 11], wide: [1, 0], level: 0 }, { t: 'bridge', from: [5, 5], to: [6, 5], level: 1 }, { t: 'bridge', from: [5, 9], to: [6, 9], level: 1 }, { t: 'rect', x: 8, y: 2, w: 3, h: 3, ch: 's', level: 3 }, { t: 'rect', x: 1, y: 7, w: 3, h: 3, ch: 's', level: 3 }] },
  glassHermit: { name: 'The Hermit\'s Mirror', w: 11, h: 13, mood: 'glass', lie: 'terrace', columns: true, seed: 111, rough: 1.2, deploy: 'S', stoneAt: 3, features: [{ t: 'pillars', at: [[2, 3], [8, 3], [5, 1], [2, 9], [8, 9]] }, { t: 'pool', x: 5, y: 6, r: 1 }] },
  secondCrater:{ name: 'The Second Crater', w: 13, h: 13, mood: 'hollow', lie: 'bowl', columns: true, seed: 112, rough: 1.6, deploy: 'S', stoneAt: 4, dirtAt: 1, features: [{ t: 'smooth', x: 5, y: 5, w: 3, h: 3, level: 0 }, { t: 'pillars', at: [[6, 6]] }, { t: 'scatter', n: 4 }] },
  // Act IV: under the Hollow Sky.
  lamplighter: { name: 'Lamplighter\'s Row', w: 12, h: 11, mood: 'lantern', lie: 'diagonal', columns: true, seed: 113, rough: 1.4, deploy: 'W', features: [{ t: 'road', from: [0, 2], to: [11, 8], level: 2 }, { t: 'pillars', at: [[3, 0], [9, 4], [5, 9]] }, { t: 'scatter', n: 3 }] },
  towerFoot:   { name: 'The Tower Foot', w: 13, h: 12, mood: 'hollow', lie: 'ramp', dir: 'N', columns: true, seed: 114, rough: 1.0, deploy: 'S', stoneAt: 3, features: [{ t: 'rect', x: 4, y: 0, w: 5, h: 3, ch: 's', level: 5 }, { t: 'rect', x: 5, y: 3, w: 3, h: 1, ch: 's', level: 3 }, { t: 'pillars', at: [[2, 1], [10, 1], [3, 6], [9, 6]] }, { t: 'river', from: [0, 9], to: [2, 9], level: 0 }, { t: 'river', from: [10, 9], to: [12, 9], level: 0 }] },
  stairOfVoices:{ name: 'The Stair of Voices', w: 10, h: 14, mood: 'hollow', lie: 'ramp', dir: 'N', columns: true, seed: 115, rough: 1.0, maxH: 7, deploy: 'S', stoneAt: 2, features: [{ t: 'void', x: 0, y: 0, w: 2, h: 6 }, { t: 'void', x: 8, y: 0, w: 2, h: 6 }, { t: 'pillars', at: [[4, 3], [5, 7], [4, 11]] }, { t: 'smooth', x: 3, y: 0, w: 4, h: 2, level: 7 }] },
  hollowThrone:{ name: 'The Hollow Throne', w: 13, h: 13, mood: 'hollow', lie: 'dome', seed: 116, rough: 0.9, deploy: 'S', ground: 's', features: [{ t: 'smooth', x: 5, y: 5, w: 3, h: 3, level: 5 }, { t: 'pillars', at: [[3, 3], [9, 3], [3, 9], [9, 9]] }, { t: 'rect', x: 0, y: 0, w: 1, h: 13, ch: 'x' }, { t: 'rect', x: 12, y: 0, w: 1, h: 13, ch: 'x' }] },
  // The three answers.
  towerRoot:   { name: 'The Tower Root', w: 12, h: 12, mood: 'abyss', lie: 'bowl', seed: 117, rough: 1.2, deploy: 'N', ground: 's', features: [{ t: 'pillars', at: [[5, 5], [6, 6], [5, 6], [6, 5]] }, { t: 'scatter', n: 4 }, { t: 'pool', x: 1, y: 10, r: 1 }] },
  fallingTower:{ name: 'The Falling Tower', w: 12, h: 12, mood: 'ember', lie: 'ramp', dir: 'S', columns: true, seed: 118, rough: 1.8, deploy: 'N', stoneAt: 3, features: [{ t: 'void', x: 0, y: 8, w: 3, h: 4 }, { t: 'void', x: 9, y: 8, w: 3, h: 4 }, { t: 'scatter', n: 5 }] },
  highStair:   { name: 'The High Stair', w: 10, h: 14, mood: 'aurora', lie: 'ramp', dir: 'N', columns: true, seed: 119, rough: 1.0, maxH: 7, deploy: 'S', stoneAt: 2, features: [{ t: 'void', x: 0, y: 0, w: 3, h: 7 }, { t: 'void', x: 7, y: 0, w: 3, h: 7 }, { t: 'pillars', at: [[5, 5], [4, 9]] }] },
  theSummit:   { name: 'The Summit', w: 11, h: 11, mood: 'hollow', lie: 'flat', seed: 120, rough: 0.6, deploy: 'S', ground: 's', features: [{ t: 'rect', x: 0, y: 0, w: 11, h: 1, ch: 'x' }, { t: 'rect', x: 0, y: 1, w: 1, h: 10, ch: 'x' }, { t: 'rect', x: 10, y: 1, w: 1, h: 10, ch: 'x' }, { t: 'smooth', x: 4, y: 2, w: 3, h: 3, level: 3 }] },
  lampWalk:    { name: 'The Lamp Walk', w: 13, h: 11, mood: 'lantern', lie: 'flat', seed: 121, rough: 1.2, deploy: 'W', features: [{ t: 'road', from: [0, 5], to: [12, 5], level: 2, wide: true }, { t: 'pillars', at: [[3, 3], [6, 3], [9, 3], [3, 8], [6, 8], [9, 8]] }, { t: 'pool', x: 11, y: 1, r: 1 }] },
  theLighthouse:{ name: 'The Lighthouse', w: 12, h: 12, mood: 'dawn', lie: 'dome', seed: 122, rough: 1.0, maxH: 7, deploy: 'S', ground: 's', features: [{ t: 'smooth', x: 5, y: 5, w: 2, h: 2, level: 7 }, { t: 'pillars', at: [[2, 2], [9, 2], [2, 9]] }, { t: 'river', from: [0, 0], to: [11, 0], level: 0 }] },
  // The towns of the Marches, fought open.
  greywallWatch:{ name: 'Greywall Watch', w: 12, h: 11, mood: 'snow', lie: 'ramp', dir: 'N', seed: 123, rough: 1.4, deploy: 'S', stoneAt: 3, features: [{ t: 'rect', x: 3, y: 0, w: 6, h: 3, ch: 's', level: 4 }, { t: 'pillars', at: [[3, 3], [8, 3]] }] },
  wickmarketTown:{ name: 'Wickmarket Lanes', w: 12, h: 12, mood: 'lantern', lie: 'flat', seed: 124, rough: 0.8, deploy: 'W', ground: 'd', features: [{ t: 'rect', x: 3, y: 2, w: 2, h: 3, ch: 's', level: 2 }, { t: 'rect', x: 7, y: 6, w: 2, h: 3, ch: 's', level: 2 }, { t: 'pillars', at: [[3, 7], [8, 2], [5, 10]] }, { t: 'road', from: [0, 5], to: [11, 5], level: 1 }] },
  lampholtTown:{ name: 'Lampholt', w: 12, h: 12, mood: 'night', lie: 'terrace', columns: true, seed: 125, rough: 1.0, deploy: 'S', stoneAt: 3, features: [{ t: 'pillars', at: [[2, 2], [9, 2], [2, 9], [9, 9]] }, { t: 'pool', x: 5, y: 5, r: 1 }] },
  glassmereTown:{ name: 'Glassmere', w: 12, h: 12, mood: 'glass', lie: 'flat', seed: 126, rough: 0.8, deploy: 'W', ground: 's', features: [{ t: 'river', from: [8, 0], to: [8, 11], level: 0 }, { t: 'bridge', from: [8, 4], to: [8, 4], level: 1 }, { t: 'bridge', from: [8, 8], to: [8, 8], level: 1 }, { t: 'rect', x: 9, y: 2, w: 3, h: 3, ch: 's', level: 2 }] },
  emberfallTown:{ name: 'Emberfall', w: 12, h: 12, mood: 'ember', lie: 'bowl', columns: true, seed: 127, rough: 1.4, deploy: 'N', stoneAt: 4, dirtAt: 1, features: [{ t: 'smooth', x: 5, y: 5, w: 2, h: 2, level: 0 }, { t: 'pillars', at: [[2, 8], [9, 8]] }, { t: 'scatter', n: 3 }] },
};

const out = {};
for (const [id, spec] of Object.entries(SPECS)) out[id] = build(id, spec);
const lines = ['/* The Hollow Sky\'s battlefields, generated by tools/make-maps-hollow.js from',
  '   short specs: a lie of the land, a few features, and a seed. Regenerate',
  '   with `node tools/make-maps-hollow.js`. Loaded after maps.js. */',
  'const MAPS_HOLLOW = {'];
for (const [id, m] of Object.entries(out)) {
  lines.push(`  ${id}: {`);
  lines.push(`    name: ${JSON.stringify(m.name)}, w: ${m.w}, h: ${m.h}, mood: '${m.mood}',`);
  lines.push(`    heights: [`); for (const r of m.heights) lines.push(`      '${r}',`); lines.push('    ],');
  lines.push(`    terrain: [`); for (const r of m.terrain) lines.push(`      '${r}',`); lines.push('    ],');
  lines.push(`    deploy: [${m.deploy.map(d => `[${d[0]}, ${d[1]}]`).join(', ')}],`);
  lines.push('  },');
}
lines.push('};', 'Object.assign(MAPS, MAPS_HOLLOW);', '');
fs.writeFileSync(path.join(__dirname, '..', 'js', 'maps2.js'), lines.join('\n'));
for (const [id, m] of Object.entries(out)) console.log(`${id.padEnd(14)} ${m.w}x${m.h}  reach ${m.reach}`);
