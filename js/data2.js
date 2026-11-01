/* ==========================================================================
   The Hollow Sky: the expansion's trades, creatures, arms and errands.
   Loaded after data.js, before maps2.js and story2.js. Everything here is
   merged into the base tables (JOBS, ABILITIES, PASSIVES, ITEMS, PETS,
   ERRANDS, JOB_EQUIP, STARTER_GEAR, TRAINING_POOL), so the engine, the
   validator and a save see one game. Ids are prefixed or unique so an old
   save loads as it was.
   ========================================================================== */

// ----------------------------------------------------------------- the trades
/* Four trades learned east of the Greywall. Each is a full study: six or more
   skills, the last learned late and dearly, and a passive of its own. */
const JOBS_HOLLOW = {
  skyward: {
    name: 'Skyward', skillset: 'Updraft', kind: 'human', sprite: 'rogue',
    palette: { h: '#c8c0b0', c: '#5a7a9a', p: '#3a4a5a', b: '#2a2a2a' },
    hp: 1.05, mp: 0.9, pa: 1.2, ma: 0.95, spd: 1.15, move: 4, jump: 6, evade: 16,
    weapon: { name: 'Pass Spear', power: 7, range: 2, vert: 5 },
    abilities: ['stoop', 'gale', 'thinAir', 'eagleCry', 'ridgeGuard', 'skyfall', 'thunderhead'],
    req: { dragoon: 2, archer: 2 }, desc: 'The Greywall\'s pass-wardens, who fight from above and strike down the wind.',
  },
  cantor: {
    name: 'Cantor', skillset: 'Chorus', kind: 'human', sprite: 'mage',
    palette: { h: '#e0c060', c: '#6a2a3a', p: '#3a1a2a', b: '#1a0a10' },
    hp: 0.9, mp: 1.5, pa: 0.85, ma: 1.35, spd: 1.0, move: 3, jump: 3, evade: 8,
    weapon: { name: 'Choir Rod', power: 4, range: 1, vert: 2 },
    abilities: ['hymnOfAsh', 'litany', 'dirge', 'canticle', 'hush', 'anthem', 'requiem'],
    req: { bard: 2, whiteMage: 2 }, desc: 'A voice of the Choir, turned. Every song is a spell, and every spell is sung over an area.',
  },
  glassblade: {
    name: 'Glassblade', skillset: 'Mirror', kind: 'human', sprite: 'warrior',
    palette: { h: '#f0f0f8', c: '#8ab0c8', p: '#4a6a80', b: '#2a3a4a' },
    hp: 1.1, mp: 1.0, pa: 1.3, ma: 1.1, spd: 1.1, move: 4, jump: 4, evade: 18,
    weapon: { name: 'Glass Edge', power: 8, range: 1, vert: 2 },
    abilities: ['mirrorCut', 'shardStorm', 'facet', 'glassStance', 'prismStep', 'shatter', 'reflection'],
    req: { samurai: 2, duelist: 1 }, desc: 'A duelist of the Glass Desert, who fights with an edge that shows the foe their own face.',
  },
  lanternkeeper: {
    name: 'Lanternkeeper', skillset: 'Lamps', kind: 'human', sprite: 'mage',
    palette: { h: '#5a3a2a', c: '#c89040', p: '#5a4a2a', b: '#2a1a0a' },
    hp: 1.0, mp: 1.35, pa: 0.9, ma: 1.25, spd: 1.0, move: 3, jump: 3, evade: 10,
    weapon: { name: 'Lamp Pole', power: 5, range: 2, vert: 3 },
    abilities: ['kindle', 'ward', 'beacon', 'lampOil', 'radiance', 'rekindle', 'stillFlame'],
    req: { whiteMage: 3, engineer: 1 }, desc: 'Keeper of the lamps that held the Marches\' dark back. Light that heals, blinds and burns.',
  },

  // ---- the Choir and what it keeps ----
  gatewarden: {
    name: 'Gatewarden', skillset: 'Chorus', kind: 'human', sprite: 'heavy',
    palette: { h: '#e0c060', c: '#5a1a2a', p: '#2a0a1a', b: '#100008' },
    affinity: { dark: 'resist', holy: 'resist', thunder: 'weak' },
    hp: 1.8, mp: 1.4, pa: 1.4, ma: 1.3, spd: 1.05, move: 4, jump: 3, evade: 14,
    weapon: { name: 'Warden\'s Maul', power: 11, range: 1, vert: 2 },
    abilities: ['hymnOfAsh', 'dirge', 'hush', 'wardensBlow'], req: null,
    desc: 'The Choir\'s doorkeeper. He has sung the same four notes at the Lantern Gate for thirty years.',
  },
  choirmaster: {
    name: 'Choirmaster', skillset: 'Chorus', kind: 'human', sprite: 'mage',
    palette: { h: '#f0e0a0', c: '#4a1020', p: '#200810', b: '#000000' },
    affinity: { holy: 'absorb', dark: 'resist', thunder: 'weak' },
    hp: 2.2, mp: 2.2, pa: 1.2, ma: 1.8, spd: 1.1, move: 4, jump: 4, evade: 16,
    weapon: { name: 'Tuning Rod', power: 9, range: 2, vert: 3 },
    abilities: ['hymnOfAsh', 'litany', 'dirge', 'hush', 'anthem', 'requiem', 'greatChorus'], req: null,
    desc: 'Idrenne, who taught the Marches to sing to the sky, and has begun to hear it sing back.',
  },
  mirrorQueen: {
    name: 'Mirror Queen', skillset: 'Mirror', kind: 'human', sprite: 'mage',
    palette: { h: '#ffffff', c: '#a8c8e0', p: '#5a7a98', b: '#1a2a3a' },
    affinity: { ice: 'absorb', earth: 'weak', fire: 'resist' },
    hp: 2.2, mp: 2.0, pa: 1.5, ma: 1.6, spd: 1.15, move: 4, jump: 5, evade: 18,
    weapon: { name: 'Facet Blade', power: 11, range: 1, vert: 3 },
    abilities: ['mirrorCut', 'shardStorm', 'facet', 'glassStance', 'shatter', 'reflection', 'thousandFaces'], req: null,
    desc: 'What the second star made of the first person who looked into the glass. She wears your face when she wants to.',
  },
  theHerald: {
    name: 'The Herald', skillset: 'Hollow', kind: 'human', sprite: 'heavy',
    palette: { h: '#f8f8ff', c: '#1a1a30', p: '#0a0a18', b: '#000000' },
    affinity: { dark: 'absorb', holy: 'weak', thunder: 'resist', ice: 'resist' },
    hp: 2.6, mp: 2.0, pa: 1.7, ma: 1.7, spd: 1.2, move: 4, jump: 4, evade: 18,
    weapon: { name: 'Star-iron Blade', power: 12, range: 1, vert: 3 },
    abilities: ['hollowCut', 'callDown', 'hush', 'dirge', 'starFall'], req: null,
    desc: 'A man who climbed the tower first and came down speaking for what is on its way.',
  },
  theChorus: {
    name: 'The Chorus', skillset: 'Nothing', kind: 'monster', sprite: 'wisp',
    palette: { h: '#ffffff', c: '#c0a0ff', p: '#40205a', b: '#100020', w: '#ffffff', e: '#000000' },
    affinity: { dark: 'absorb', holy: 'weak', thunder: 'weak', ice: 'resist', fire: 'resist' },
    hp: 2.4, mp: 2.6, pa: 1.5, ma: 1.8, spd: 1.1, move: 5, jump: 9, evade: 12,
    weapon: { name: 'Nothing', power: 11, range: 1, vert: 9 },
    abilities: ['hunger', 'stillness', 'unmake', 'starFall', 'greatChorus'], req: null,
    desc: 'Every voice that ever sang to the sky, answering at once. It is not what fell. It is what fell\'s echo, and it is enough.',
  },

  // ---- the creatures of the Marches ----
  hollowed: {
    name: 'Hollowed', skillset: 'Hollow', kind: 'monster', sprite: 'skeleton',
    palette: { h: '#d8d8e0', c: '#b0b0c0', p: '#6a6a7a', b: '#3a3a48', e: '#ffffff' },
    affinity: { dark: 'absorb', holy: 'weak', fire: 'weak' },
    hp: 1.0, mp: 0.8, pa: 1.15, ma: 0.9, spd: 0.95, move: 4, jump: 3, evade: 6,
    weapon: { name: 'Empty Hands', power: 7, range: 1, vert: 2 },
    abilities: ['hollowGrasp', 'emptySong', 'hollowCut'], req: null,
    desc: 'A person the Choir has sung the self out of. What is left walks, and wants company.',
  },
  hollowHound: {
    name: 'Hollow Hound', skillset: 'Hound', kind: 'monster', sprite: 'wolf',
    palette: { h: '#e8e8f0', c: '#c8c8d8', p: '#8a8a9a', b: '#3a3a48', e: '#ffffff' },
    affinity: { dark: 'resist', holy: 'weak', fire: 'weak' },
    hp: 0.95, mp: 0.5, pa: 1.15, ma: 0.6, spd: 1.35, move: 6, jump: 4, evade: 16,
    weapon: { name: 'Fangs', power: 6, range: 1, vert: 2 },
    abilities: ['bite', 'howl', 'hollowGrasp'], req: null,
    desc: 'A dog that followed its hollowed master, and was hollowed for its loyalty.',
  },
  emberMoth: {
    name: 'Ember Moth', skillset: 'Moth', kind: 'monster', sprite: 'wisp',
    palette: { h: '#ffd060', c: '#ff7a30', p: '#8a3010', b: '#3a1008', w: '#ffe0a0', e: '#000000' },
    affinity: { fire: 'absorb', ice: 'weak', water: 'weak' },
    hp: 0.7, mp: 1.2, pa: 0.8, ma: 1.2, spd: 1.3, move: 5, jump: 9, evade: 20,
    weapon: { name: 'Wing-dust', power: 5, range: 2, vert: 9 },
    abilities: ['kindle', 'dustCloud', 'swarm'], req: null,
    desc: 'A moth the size of a shield that drinks lamp fire. The Marches hang their lanterns high because of it.',
  },
  glassStag: {
    name: 'Glass Stag', skillset: 'Glass', kind: 'monster', sprite: 'wolf',
    palette: { h: '#e8f4ff', c: '#b8d8f0', p: '#6a8aa8', b: '#2a3a4a', e: '#80c0ff' },
    affinity: { ice: 'absorb', earth: 'weak', thunder: 'resist' },
    hp: 1.3, mp: 0.8, pa: 1.3, ma: 1.0, spd: 1.15, move: 5, jump: 4, evade: 14,
    weapon: { name: 'Antlers', power: 9, range: 1, vert: 3 },
    abilities: ['antlerCharge', 'shardStorm', 'facet'], req: null,
    desc: 'A stag of the Glass Desert, grown from the star-glass. Its antlers show you yourself, and then they go through you.',
  },
  lanternWraith: {
    name: 'Lantern Wraith', skillset: 'Lamp', kind: 'monster', sprite: 'wisp',
    palette: { h: '#fff0c0', c: '#e0a040', p: '#6a3a10', b: '#2a1808', w: '#ffffff', e: '#ff8020' },
    affinity: { holy: 'absorb', dark: 'weak', water: 'weak' },
    hp: 0.85, mp: 1.6, pa: 0.9, ma: 1.4, spd: 1.1, move: 4, jump: 9, evade: 18,
    weapon: { name: 'Lamp-light', power: 6, range: 3, vert: 9 },
    abilities: ['radiance', 'lampOil', 'wardensBlow'], req: null,
    desc: 'The light of a lamp whose keeper is dead, still doing its rounds. It does not know the keeper is gone.',
  },
  skyLeech: {
    name: 'Sky Leech', skillset: 'Leech', kind: 'monster', sprite: 'serpent',
    palette: { h: '#4a3a6a', c: '#7a5aa8', p: '#2a1a40', b: '#100818', e: '#e0c0ff' },
    affinity: { thunder: 'absorb', earth: 'weak', fire: 'resist' },
    hp: 1.5, mp: 1.2, pa: 1.35, ma: 1.2, spd: 1.0, move: 4, jump: 6, evade: 10,
    weapon: { name: 'Maw', power: 10, range: 1, vert: 4 },
    abilities: ['hollowGrasp', 'gale', 'thunderhead'], req: null,
    desc: 'Something that hangs under the aurora where it comes down, and drinks what the tower sends up.',
  },
  starSpawn: {
    name: 'Star Spawn', skillset: 'Fallen', kind: 'monster', sprite: 'bomb',
    palette: { h: '#f0f0ff', c: '#6a4aa0', p: '#2a1050', b: '#100020', e: '#ffffff' },
    affinity: { dark: 'absorb', thunder: 'resist', holy: 'weak', earth: 'weak' },
    hp: 1.2, mp: 1.4, pa: 1.2, ma: 1.4, spd: 1.05, move: 4, jump: 9, evade: 12,
    weapon: { name: 'Nothing', power: 8, range: 1, vert: 9 },
    abilities: ['starFall', 'hunger', 'goHome'], req: null,
    desc: 'A piece of the second star that landed walking. It burns to go home.',
  },
};

// --------------------------------------------------------------- abilities
const ABILITIES_HOLLOW = {
  // Skyward: the pass-wardens' art, all of it downhill.
  stoop: { name: 'Stoop', job: 'skyward', jp: 100, mp: 0, range: 'weapon', aoe: 0, vert: 9, ct: 0, kind: 'physical', affects: 'all',
    effects: [{ type: 'damage', formula: 'pa', power: 'weapon', bonus: 2 }], desc: 'A strike that falls from any height. Weapon power +2, and no cliff is too tall.' },
  gale: { name: 'Gale', job: 'skyward', jp: 150, mp: 8, range: 3, aoe: 1, vert: 5, ct: 0, kind: 'magic', affects: 'enemy', element: 'thunder',
    effects: [{ type: 'damage', formula: 'pa', power: 3 }, { type: 'ctmod', amount: -20 }], desc: 'A wind off the pass that knocks an area about and 20 off its Tempo.' },
  thinAir: { name: 'Thin Air', job: 'skyward', jp: 200, mp: 10, range: 3, aoe: 1, vert: 9, ct: 0, kind: 'magic', affects: 'enemy',
    effects: [{ type: 'status', status: 'silence', hit: 65 }], desc: 'Take the breath out of an area: likely Silence.' },
  eagleCry: { name: 'Eagle Cry', job: 'skyward', jp: 180, mp: 6, range: 3, aoe: 1, vert: 9, ct: 0, kind: 'support', affects: 'ally', allowSelf: true,
    effects: [{ type: 'statmod', stat: 'spd', amount: 2 }, { type: 'statmod', stat: 'jump', amount: 2 }], desc: 'A cry that lifts allies in an area: Speed +2 and Jump +2 for the battle.' },
  ridgeGuard: { name: 'Ridge Guard', job: 'skyward', jp: 220, mp: 0, range: 0, aoe: 0, vert: 0, ct: 0, kind: 'support', affects: 'ally', self: true,
    effects: [{ type: 'status', status: 'protect', hit: 100 }, { type: 'statmod', stat: 'evade', amount: 8 }], desc: 'Set your feet on the ridge: Protect, and Evasion +8 for the battle.' },
  skyfall: { name: 'Skyfall', job: 'skyward', jp: 350, mp: 14, range: 4, aoe: 2, vert: 9, ct: 24, kind: 'physical', affects: 'all',
    effects: [{ type: 'damage', formula: 'pa', power: 7 }], desc: 'Leap and come down on a wide area with everything you weigh. Charged.' },
  thunderhead: { name: 'Thunderhead', job: 'skyward', jp: 500, mp: 22, range: 4, aoe: 1, vert: 9, ct: 16, kind: 'magic', affects: 'all', element: 'thunder',
    effects: [{ type: 'damage', formula: 'ma', power: 9 }, { type: 'status', status: 'stop', hit: 35 }], desc: 'Call the storm down on an area. Sometimes it Stops what it hits.' },

  // Cantor: the Choir's songs, each over an area.
  hymnOfAsh: { name: 'Hymn of Ash', job: 'cantor', jp: 120, mp: 12, range: 4, aoe: 1, vert: 4, ct: 18, kind: 'magic', affects: 'all', element: 'fire',
    effects: [{ type: 'damage', formula: 'ma', power: 6 }], desc: 'The first hymn the Choir teaches. Fire over an area.' },
  litany: { name: 'Litany', job: 'cantor', jp: 160, mp: 14, range: 3, aoe: 1, vert: 4, ct: 14, kind: 'magic', affects: 'ally', allowSelf: true,
    effects: [{ type: 'heal', formula: 'ma', power: 6 }], desc: 'A sung mending over an area.' },
  dirge: { name: 'Dirge', job: 'cantor', jp: 200, mp: 14, range: 4, aoe: 1, vert: 4, ct: 16, kind: 'magic', affects: 'enemy', element: 'dark',
    effects: [{ type: 'damage', formula: 'ma', power: 5 }, { type: 'status', status: 'slow', hit: 60 }], desc: 'Dark over an area, and the heavy step that comes with it: likely Slow.' },
  canticle: { name: 'Canticle', job: 'cantor', jp: 220, mp: 12, range: 3, aoe: 1, vert: 4, ct: 0, kind: 'support', affects: 'ally', allowSelf: true,
    effects: [{ type: 'status', status: 'haste', hit: 100 }], desc: 'A quick song that puts Haste on an area of allies.' },
  hush: { name: 'Hush', job: 'cantor', jp: 180, mp: 10, range: 4, aoe: 1, vert: 4, ct: 10, kind: 'magic', affects: 'enemy',
    effects: [{ type: 'status', status: 'silence', hit: 70 }, { type: 'mpdamage', formula: 'ma', power: 2 }], desc: 'Sing the voice out of an area: likely Silence, and MP taken.' },
  anthem: { name: 'Anthem', job: 'cantor', jp: 300, mp: 16, range: 3, aoe: 2, vert: 4, ct: 12, kind: 'support', affects: 'ally', allowSelf: true,
    effects: [{ type: 'statmod', stat: 'pa', amount: 1 }, { type: 'statmod', stat: 'ma', amount: 1 }], desc: 'The company\'s own song: PA +1 and MA +1 over a wide area, for the battle.' },
  requiem: { name: 'Requiem', job: 'cantor', jp: 500, mp: 28, range: 4, aoe: 2, vert: 4, ct: 22, kind: 'magic', affects: 'enemy', element: 'holy',
    effects: [{ type: 'damage', formula: 'ma', power: 8 }, { type: 'slay', hit: 15 }], desc: 'Holy over a wide area, sung for the dead. Now and then it takes one of the living with it.' },

  // Glassblade: the mirror art of the desert.
  mirrorCut: { name: 'Mirror Cut', job: 'glassblade', jp: 120, mp: 0, range: 'weapon', aoe: 0, vert: 2, ct: 0, kind: 'physical', affects: 'all',
    effects: [{ type: 'damage', formula: 'pa', power: 'weapon', bonus: 1 }, { type: 'statmod', stat: 'evade', amount: -6 }], desc: 'A cut that shows the foe their own guard, and takes 6 off their Evasion.' },
  shardStorm: { name: 'Shard Storm', job: 'glassblade', jp: 180, mp: 10, range: 3, aoe: 1, vert: 3, ct: 0, kind: 'physical', affects: 'all', element: 'ice',
    effects: [{ type: 'damage', formula: 'pa', power: 4 }], desc: 'Glass thrown over an area. Ice, and it cuts.' },
  facet: { name: 'Facet', job: 'glassblade', jp: 200, mp: 8, range: 3, aoe: 0, vert: 3, ct: 0, kind: 'magic', affects: 'enemy',
    effects: [{ type: 'statmod', stat: 'ma', amount: -3 }, { type: 'statmod', stat: 'pa', amount: -1 }], desc: 'Turn the foe\'s edge against them: MA -3 and PA -1 for the battle.' },
  glassStance: { name: 'Glass Stance', job: 'glassblade', jp: 240, mp: 6, range: 0, aoe: 0, vert: 0, ct: 0, kind: 'support', affects: 'ally', self: true,
    effects: [{ type: 'status', status: 'shell', hit: 100 }, { type: 'status', status: 'protect', hit: 100 }], desc: 'Stand like glass: Protect and Barrier at once.' },
  prismStep: { name: 'Prism Step', job: 'glassblade', jp: 260, mp: 10, range: 0, aoe: 0, vert: 0, ct: 0, kind: 'support', affects: 'ally', self: true,
    effects: [{ type: 'ctmod', amount: 40 }, { type: 'status', status: 'haste', hit: 100 }], desc: 'Step through your own reflection: 40 Tempo at once, and Haste.' },
  shatter: { name: 'Shatter', job: 'glassblade', jp: 380, mp: 14, range: 'weapon', aoe: 0, vert: 2, ct: 20, kind: 'physical', affects: 'all',
    effects: [{ type: 'damage', formula: 'pa', power: 'weapon', bonus: 7 }, { type: 'cure', statuses: ['protect', 'shell', 'haste', 'regen', 'reraise'] }], desc: 'A charged blow that breaks whatever the target was keeping up: weapon power +7, and their wards shatter.' },
  reflection: { name: 'Reflection', job: 'glassblade', jp: 500, mp: 24, range: 2, aoe: 1, vert: 3, ct: 12, kind: 'magic', affects: 'enemy', element: 'ice',
    effects: [{ type: 'damage', formula: 'pa', power: 7 }, { type: 'status', status: 'blind', hit: 60 }], desc: 'Hold up the glass. Ice over an area, and what it shows them: likely Blind.' },

  // Lanternkeeper: light that keeps.
  kindle: { name: 'Kindle', job: 'lanternkeeper', jp: 100, mp: 8, range: 3, aoe: 0, vert: 4, ct: 0, kind: 'magic', affects: 'all', element: 'fire',
    effects: [{ type: 'damage', formula: 'ma', power: 5 }], desc: 'A lamp\'s flame, thrown. Fire, quickly.' },
  ward: { name: 'Ward', job: 'lanternkeeper', jp: 160, mp: 10, range: 3, aoe: 0, vert: 4, ct: 0, kind: 'support', affects: 'ally', allowSelf: true,
    effects: [{ type: 'status', status: 'protect', hit: 100 }, { type: 'status', status: 'shell', hit: 100 }], desc: 'Set a lamp beside an ally: Protect and Barrier.' },
  beacon: { name: 'Beacon', job: 'lanternkeeper', jp: 220, mp: 16, range: 3, aoe: 1, vert: 4, ct: 10, kind: 'magic', affects: 'ally', allowSelf: true,
    effects: [{ type: 'heal', formula: 'ma', power: 5 }, { type: 'cure', statuses: ['poison', 'blind', 'silence', 'slow'] }], desc: 'Raise the beacon over an area: mending, and Poison, Blind, Silence and Slow lifted.' },
  lampOil: { name: 'Lamp Oil', job: 'lanternkeeper', jp: 180, mp: 8, range: 3, aoe: 1, vert: 4, ct: 0, kind: 'magic', affects: 'enemy',
    effects: [{ type: 'status', status: 'blind', hit: 70 }, { type: 'statmod', stat: 'evade', amount: -4 }], desc: 'Oil in the eyes over an area: likely Blind, and Evasion -4.' },
  radiance: { name: 'Radiance', job: 'lanternkeeper', jp: 300, mp: 18, range: 4, aoe: 1, vert: 9, ct: 16, kind: 'magic', affects: 'all', element: 'holy',
    effects: [{ type: 'damage', formula: 'ma', power: 7 }], desc: 'Every lamp at once. Holy over an area.' },
  rekindle: { name: 'Rekindle', job: 'lanternkeeper', jp: 360, mp: 20, range: 3, aoe: 0, vert: 4, ct: 12, kind: 'magic', affects: 'ally', deadOnly: true,
    effects: [{ type: 'revive', pct: 0.4 }], desc: 'Light a fallen ally again, with 40% of their HP.' },
  stillFlame: { name: 'Still Flame', job: 'lanternkeeper', jp: 520, mp: 30, range: 3, aoe: 0, vert: 4, ct: 18, kind: 'support', affects: 'ally', allowSelf: true,
    effects: [{ type: 'status', status: 'reraise', hit: 100 }, { type: 'status', status: 'regen', hit: 100 }], desc: 'A flame that does not go out: Second Breath and Regen on one ally.' },

  // The Choir's own, and what the hollowed do.
  wardensBlow: { name: 'Warden\'s Blow', job: 'gatewarden', jp: 0, mp: 0, range: 1, aoe: 0, vert: 3, ct: 0, kind: 'physical', affects: 'all',
    effects: [{ type: 'damage', formula: 'pa', power: 6 }, { type: 'ctmod', amount: -30 }], desc: 'The gate, shut in your face. 30 off the target\'s Tempo.' },
  greatChorus: { name: 'Great Chorus', job: 'choirmaster', jp: 0, mp: 32, range: 5, aoe: 2, vert: 9, ct: 20, kind: 'magic', affects: 'enemy', element: 'holy',
    effects: [{ type: 'damage', formula: 'ma', power: 9 }, { type: 'status', status: 'silence', hit: 50 }], desc: 'Every voice at once. Holy over a wide area, and half of them Silenced.' },
  thousandFaces: { name: 'Thousand Faces', job: 'mirrorQueen', jp: 0, mp: 26, range: 4, aoe: 2, vert: 9, ct: 18, kind: 'magic', affects: 'enemy', element: 'ice',
    effects: [{ type: 'damage', formula: 'ma', power: 8 }, { type: 'status', status: 'berserk', hit: 40 }], desc: 'A wide area sees itself and does not like it: Ice, and some go Berserk.' },
  hollowCut: { name: 'Hollow Cut', job: 'theHerald', jp: 0, mp: 0, range: 'weapon', aoe: 0, vert: 3, ct: 0, kind: 'physical', affects: 'all', element: 'dark',
    effects: [{ type: 'drain', formula: 'pa', power: 6 }], desc: 'A blow that takes what it cuts and keeps it.' },
  callDown: { name: 'Call Down', job: 'theHerald', jp: 0, mp: 24, range: 5, aoe: 1, vert: 9, ct: 22, kind: 'magic', affects: 'enemy', element: 'dark',
    effects: [{ type: 'damage', formula: 'ma', power: 9 }, { type: 'status', status: 'stop', hit: 40 }], desc: 'He points, and something answers from above. Dark, and often Stop.' },
  starFall: { name: 'Star Fall', job: 'starSpawn', jp: 0, mp: 20, range: 4, aoe: 2, vert: 9, ct: 16, kind: 'magic', affects: 'enemy', element: 'dark',
    effects: [{ type: 'damage', formula: 'ma', power: 8 }], desc: 'A piece of the sky, put down hard over a wide area.' },
  hollowGrasp: { name: 'Hollow Grasp', job: 'hollowed', jp: 0, mp: 6, range: 1, aoe: 0, vert: 2, ct: 0, kind: 'magic', affects: 'enemy', element: 'dark',
    effects: [{ type: 'drain', formula: 'pa', power: 4 }, { type: 'mpdrain', formula: 'ma', power: 2 }], desc: 'It holds on, and takes HP and MP to fill what it lost.' },
  emptySong: { name: 'Empty Song', job: 'hollowed', jp: 0, mp: 10, range: 3, aoe: 1, vert: 3, ct: 12, kind: 'magic', affects: 'enemy',
    effects: [{ type: 'status', status: 'silence', hit: 50 }, { type: 'statmod', stat: 'ma', amount: -2 }], desc: 'The song with nothing in it. Likely Silence, and MA -2.' },
  dustCloud: { name: 'Dust Cloud', job: 'emberMoth', jp: 0, mp: 8, range: 2, aoe: 1, vert: 9, ct: 0, kind: 'magic', affects: 'enemy',
    effects: [{ type: 'status', status: 'blind', hit: 60 }, { type: 'damage', formula: 'ma', power: 2 }], desc: 'Wing-dust in the eyes: likely Blind.' },
  swarm: { name: 'Swarm', job: 'emberMoth', jp: 0, mp: 12, range: 3, aoe: 2, vert: 9, ct: 14, kind: 'magic', affects: 'enemy', element: 'fire',
    effects: [{ type: 'damage', formula: 'ma', power: 5 }], desc: 'The whole cloud at once. Fire over a wide area.' },
  antlerCharge: { name: 'Antler Charge', job: 'glassStag', jp: 0, mp: 0, range: 2, aoe: 0, vert: 3, ct: 0, kind: 'physical', affects: 'all',
    effects: [{ type: 'damage', formula: 'pa', power: 7 }, { type: 'ctmod', amount: -15 }], desc: 'Antlers first. Knocks 15 off the target\'s Tempo.' },
  goHome: { name: 'Go Home', job: 'starSpawn', jp: 0, mp: 0, range: 0, aoe: 1, vert: 9, ct: 0, kind: 'magic', affects: 'all', self: true, suicide: true, element: 'dark',
    effects: [{ type: 'damage', formula: 'curhp', power: 1 }], desc: 'It burns to go back where it fell from: everything beside it takes its remaining HP, and it is gone.' },
};

// ---------------------------------------------------------------- passives
const PASSIVES_HOLLOW = {
  highGround: { name: 'High Ground', kind: 'support', job: 'skyward', jp: 380, desc: 'Physical damage rises by a third against a target below you.' },
  choirVoice: { name: 'Choir Voice', kind: 'support', job: 'cantor', jp: 400, desc: 'Anything sung over an area reaches one tile wider.' },
  glassSkin: { name: 'Glass Skin', kind: 'reaction', job: 'glassblade', jp: 420, desc: 'A quarter of all magick aimed at you shatters on the glass and does nothing.' },
  lampLight: { name: 'Lamp Light', kind: 'support', job: 'lanternkeeper', jp: 380, desc: 'Blind, Silence and Berserk do not take on you, and your heals restore 20% more.' },
};

// --------------------------------------------------------------- equipment
const JOB_EQUIP_HOLLOW = {
  skyward:       { w: ['spear', 'bow', 'knife'], a: ['light', 'cloth'], head: ['hat', 'helm'], shield: false },
  cantor:        { w: ['rod', 'staff', 'harp'], a: ['robe', 'cloth'], head: ['hat'], shield: false },
  glassblade:    { w: ['katana', 'sword', 'knife'], a: ['light', 'cloth'], head: ['hat', 'helm'], shield: false },
  lanternkeeper: { w: ['staff', 'rod', 'tome'], a: ['robe', 'cloth', 'light'], head: ['hat'], shield: true },
  gatewarden:    { w: ['axe', 'sword'], a: ['heavy'], head: ['helm'], shield: true },
  choirmaster:   { w: ['rod', 'staff'], a: ['robe', 'cloth'], head: ['hat'], shield: false },
  mirrorQueen:   { w: ['katana', 'sword'], a: ['light', 'robe'], head: ['hat'], shield: false },
  theHerald:     { w: ['sword', 'greatsword'], a: ['heavy', 'light'], head: ['helm'], shield: true },
};
const STARTER_GEAR_HOLLOW = {
  skyward: { weapon: 'spear', body: 'clothes' },
  cantor: { weapon: 'rod', body: 'clothes' },
  glassblade: { weapon: 'ashuraBlade', body: 'clothes' },
  lanternkeeper: { weapon: 'staff', body: 'clothes' },
};

/* Arms of the Marches. The wagon's stock widens to these as the expansion is
   walked: `from` is the expansion chapter from which the wagon carries a
   piece. Tier 7 is the base game's summit; these stand beside it and climb
   past it in the last act. `city` names the market that sells a piece. */
const ITEMS_HOLLOW = {
  // The wagon, as the road east is walked.
  passSpear:     { name: 'Pass Spear', slot: 'weapon', wtype: 'spear', power: 15, range: 2, vert: 5, jump: 1, price: 3000, tier: 6, from: 0 },
  greywallBow:   { name: 'Greywall Bow', slot: 'weapon', wtype: 'bow', power: 12, range: 6, vert: 9, price: 3000, tier: 6, from: 0 },
  wardensMaul:   { name: 'Warden\'s Maul', slot: 'weapon', wtype: 'axe', power: 19, range: 1, vert: 2, spd: -1, price: 3300, tier: 6, from: 2 },
  choirRod:      { name: 'Choir Rod', slot: 'weapon', wtype: 'rod', power: 7, range: 1, vert: 2, ma: 10, mp: 20, price: 3400, tier: 6, from: 4 },
  lampStaff:     { name: 'Lamp Staff', slot: 'weapon', wtype: 'staff', power: 8, range: 1, vert: 2, ma: 8, mp: 30, resist: { dark: 'resist' }, price: 3400, tier: 6, from: 4 },
  mothSilk:      { name: 'Moth-silk Robe', slot: 'body', atype: 'robe', hp: 48, mp: 60, resist: { fire: 'resist' }, price: 3200, tier: 6, from: 4 },
  marchCoat:     { name: 'March Coat', slot: 'body', atype: 'light', hp: 62, evade: 6, price: 3300, tier: 6, from: 2 },
  wardensPlate:  { name: 'Warden\'s Plate', slot: 'body', atype: 'heavy', hp: 80, resist: { dark: 'resist' }, price: 3600, tier: 6, from: 3 },
  lanternHelm:   { name: 'Lantern Helm', slot: 'head', htype: 'helm', look: 'helm', hp: 40, mp: 20, wards: ['blind'], price: 2800, tier: 6, from: 4 },
  cantorsHood:   { name: 'Cantor\'s Hood', slot: 'head', htype: 'hat', look: 'wizard', hp: 20, ma: 4, mp: 30, price: 2800, tier: 6, from: 5 },
  glassEdge:     { name: 'Glass Edge', slot: 'weapon', wtype: 'katana', power: 18, range: 1, vert: 2, evade: 10, price: 4200, tier: 6, from: 8 },
  mirrorShard:   { name: 'Mirror Shard', slot: 'weapon', wtype: 'knife', power: 13, range: 1, vert: 2, spd: 2, evade: 8, price: 4000, tier: 6, from: 8 },
  glassMail:     { name: 'Glass Mail', slot: 'body', atype: 'light', hp: 66, evade: 12, resist: { ice: 'resist' }, price: 4400, tier: 6, from: 9 },
  starGlassRing: { name: 'Star-glass Ring', slot: 'acc', ma: 4, evade: 6, resist: { ice: 'resist' }, price: 4000, tier: 6, from: 9 },
  skyIronBlade:  { name: 'Sky-iron Blade', late: true, slot: 'weapon', wtype: 'sword', power: 24, range: 1, vert: 2, pa: 2, resist: { thunder: 'resist' }, price: 9800, tier: 7, from: 12 },
  heraldsSpear:  { name: 'Herald\'s Spear', late: true, slot: 'weapon', wtype: 'spear', power: 23, range: 2, vert: 6, jump: 2, price: 9600, tier: 7, from: 12 },
  chorusTome:    { name: 'Chorus Tome', late: true, slot: 'weapon', wtype: 'tome', power: 12, range: 2, vert: 3, ma: 17, mp: 60, price: 9800, tier: 7, from: 12 },
  hollowPlate:   { name: 'Hollow Plate', late: true, slot: 'body', atype: 'heavy', hp: 92, pa: 1, resist: { dark: 'absorb', holy: 'weak' }, price: 10200, tier: 7, from: 13 },
  auroraMantle:  { name: 'Aurora Mantle', late: true, slot: 'body', atype: 'robe', hp: 56, mp: 80, ma: 3, resist: { thunder: 'absorb' }, price: 10000, tier: 7, from: 13 },
  heraldsCrown:  { name: 'Herald\'s Crown', late: true, slot: 'head', htype: 'helm', look: 'helm', hp: 48, pa: 2, ma: 2, wards: ['stop'], price: 9400, tier: 7, from: 14 },
  starHeartAmulet: { name: 'Star-heart Amulet', late: true, slot: 'acc', hp: 40, ma: 4, spd: 1, wards: ['silence', 'stop'], price: 9800, tier: 7, from: 14 },
  // What the Marches' markets sell, two to a town.
  greywallSpear: { name: 'Greywall Spear', city: 'greywallWatch', slot: 'weapon', wtype: 'spear', power: 17, range: 2, vert: 6, price: 3400, tier: 6 },
  passCloak:     { name: 'Pass Cloak', city: 'greywallWatch', slot: 'body', atype: 'light', hp: 58, jump: 1, resist: { ice: 'resist' }, price: 3200, tier: 6 },
  wickBlade:     { name: 'Wick Blade', city: 'wickmarket', slot: 'weapon', wtype: 'sword', power: 18, range: 1, vert: 2, resist: { fire: 'resist' }, price: 3800, tier: 6 },
  mothwingHat:   { name: 'Mothwing Hat', city: 'wickmarket', slot: 'head', htype: 'hat', look: 'feather', hp: 24, spd: 1, evade: 8, price: 3000, tier: 6 },
  lampholtTome:  { name: 'Lampholt Tome', city: 'lampholt', slot: 'weapon', wtype: 'tome', power: 10, range: 2, vert: 3, ma: 12, mp: 30, resist: { dark: 'resist' }, price: 4200, tier: 6 },
  keepersRobe:   { name: 'Keeper\'s Robe', city: 'lampholt', slot: 'body', atype: 'robe', hp: 52, mp: 70, resist: { dark: 'resist' }, price: 4000, tier: 6 },
  facetKatana:   { name: 'Facet Katana', city: 'glassmere', slot: 'weapon', wtype: 'katana', power: 20, range: 1, vert: 2, spd: 1, evade: 6, price: 4800, tier: 6 },
  prismShield:   { name: 'Prism Shield', city: 'glassmere', slot: 'offhand', otype: 'shield', evade: 30, hp: 30, resist: { ice: 'resist', fire: 'resist' }, price: 4400, tier: 6 },
  emberfallAxe:  { name: 'Emberfall Axe', city: 'emberfall', late: true, slot: 'weapon', wtype: 'axe', power: 25, range: 1, vert: 2, pa: 2, resist: { fire: 'absorb' }, price: 9800, tier: 7 },
  cinderCrown:   { name: 'Cinder Crown', city: 'emberfall', late: true, slot: 'head', htype: 'helm', look: 'helm', hp: 44, ma: 4, resist: { fire: 'absorb', ice: 'weak' }, price: 9200, tier: 7 },
};

// What the Marches' forges make and nobody sells.
const FORGE_ITEMS_HOLLOW = {
  ridgeHalberd:  { name: 'Ridge Halberd', forge: 'greywallWatch', slot: 'weapon', wtype: 'spear', power: 18, range: 2, vert: 7, jump: 1, price: 3600, tier: 6, cost: { steelIngot: 3, oakHeartwood: 2 } },
  skywardMail:   { name: 'Skyward Mail', forge: 'greywallWatch', slot: 'body', atype: 'light', hp: 64, jump: 2, evade: 6, price: 3800, tier: 6, cost: { steelIngot: 2, silkBolt: 2 } },
  choirHarp:     { name: 'Choir Harp', forge: 'wickmarket', slot: 'weapon', wtype: 'harp', power: 9, range: 4, vert: 4, ma: 10, mp: 40, price: 4000, tier: 6, cost: { oakHeartwood: 3, silkBolt: 2 } },
  wickRifle:     { name: 'Wick Rifle', forge: 'wickmarket', slot: 'weapon', wtype: 'gun', power: 16, range: 6, vert: 9, resist: { fire: 'resist' }, price: 4200, tier: 6, cost: { brassFitting: 3, steelIngot: 2 } },
  lampShield:    { name: 'Lamp Shield', forge: 'lampholt', slot: 'offhand', otype: 'shield', evade: 28, hp: 36, resist: { dark: 'resist' }, price: 4000, tier: 6, cost: { steelIngot: 2, emberGlass: 2 } },
  keepersStaff:  { name: 'Keeper\'s Staff', forge: 'lampholt', slot: 'weapon', wtype: 'staff', power: 9, range: 1, vert: 2, ma: 11, mp: 40, resist: { dark: 'resist' }, price: 4400, tier: 6, cost: { oakHeartwood: 3, emberGlass: 2 } },
  starGlassBlade: { name: 'Star-glass Blade', forge: 'glassmere', late: true, slot: 'weapon', wtype: 'katana', power: 23, range: 1, vert: 2, ma: 4, evade: 8, price: 9600, tier: 7, cost: { starIron: 2, emberGlass: 3, steelIngot: 2 } },
  mirrorPlate:   { name: 'Mirror Plate', forge: 'glassmere', late: true, slot: 'body', atype: 'heavy', hp: 88, evade: 8, resist: { ice: 'absorb', earth: 'weak' }, price: 10000, tier: 7, cost: { starIron: 2, starHeart: 1, steelIngot: 3 } },
  emberfallCannon: { name: 'Emberfall Cannon', forge: 'emberfall', late: true, slot: 'weapon', wtype: 'gun', power: 21, range: 5, vert: 9, ma: 3, price: 10400, tier: 7, cost: { starIron: 2, starHeart: 1, brassFitting: 4 } },
  cinderHeart:   { name: 'Cinder Heart', forge: 'emberfall', late: true, slot: 'acc', hp: 50, pa: 3, ma: 3, resist: { fire: 'absorb' }, price: 10000, tier: 7, cost: { starHeart: 1, emberGlass: 4, starIron: 1 } },
};

// ------------------------------------------------------------------ beasts
const PETS_HOLLOW = {
  hollowHound: { price: 2000, names: ['Vigil', 'Moth', 'Pale', 'Ash-eye'],
                 desc: 'It followed someone into the Choir and came out the other side. It will follow you anywhere, which is the problem. Holy light and fire undo it.' },
  emberMoth:   { price: 2400, names: ['Wick', 'Tallow', 'Flicker', 'Glim'],
                 desc: 'A moth that drinks fire and throws its dust in the eyes of anything that comes close. Keep it out of the rain and the ice.' },
  glassStag:   { price: 3200, names: ['Facet', 'Hoarfrost', 'Prism', 'Shard'],
                 desc: 'A stag grown from star-glass. It drinks ice, dreads earth, and shows the enemy their own face before it goes through them.' },
};

// ------------------------------------------------------------------ errands
// What the Marches want doing. `camp` keeps them to the expansion's road.
const ERRANDS_HOLLOW = [
  { id: 'lamps', camp: 'hollowsky', title: 'Relight the pass lamps', days: 1, gil: 1.1, jp: 1.1, item: 0.2, text: 'Every lamp on the Greywall stair has gone out at once. Somebody has to climb it with a taper and see why.' },
  { id: 'moths', camp: 'hollowsky', title: 'Drive the moths off Wickmarket', days: 1, gil: 1.0, jp: 1.4, item: 0.15, text: 'The ember moths have found the candle-works. The chandlers will pay in marks and in candles, and the candles are worth more.' },
  { id: 'choirBooks', camp: 'hollowsky', title: 'Carry the Choir\'s books to Lampholt', days: 2, gil: 1.4, jp: 1.0, item: 0.6, text: 'A cantor who has stopped singing wants her library out of the Cathedral before it is burned. Nobody else will carry a Choir book through the Marches.' },
  { id: 'glassRoad', camp: 'hollowsky', title: 'Walk the glass road', days: 2, gil: 1.6, jp: 1.3, item: 0.5, text: 'The road across the desert was made of glass by the second star and nobody has walked it end to end since. The caravans want to know if it holds.' },
  { id: 'hollowWatch', camp: 'hollowsky', title: 'Keep the hollow watch', days: 1, gil: 1.2, jp: 1.2, item: 0.2, text: 'A village under the tower wants someone awake all night who can tell a hollowed neighbour from a sleepwalking one.' },
  { id: 'starIron', camp: 'hollowsky', title: 'Haul star-iron from the crater', days: 2, gil: 1.8, jp: 0.9, item: 0.7, text: 'Emberfall\'s smiths will pay by weight for what fell, and more for whoever brings it back with their own face still on.' },
];

// ----------------------------------------------------------- training pools
// What the Marches field when the company trains, by how far it has come.
const TRAINING_POOL_HOLLOW = [
  ['hollowed', 'hollowed', 'hollowHound', 'hollowHound'],
  ['skyward', 'hollowed', 'skyLeech', 'hollowHound', 'archer'],
  ['cantor', 'cantor', 'emberMoth', 'emberMoth', 'knight'],
  ['lanternWraith', 'cantor', 'hollowed', 'hollowed', 'lanternkeeper'],
  ['glassStag', 'glassStag', 'glassblade', 'emberMoth', 'cantor'],
  ['glassblade', 'glassblade', 'glassStag', 'skyward', 'lanternkeeper', 'cantor'],
  ['starSpawn', 'starSpawn', 'skyLeech', 'hollowed', 'lanternWraith', 'cantor'],
  ['theHerald', 'starSpawn', 'glassblade', 'skyward', 'cantor', 'lanternkeeper', 'skyLeech'],
];

// ---------------------------------------------------------------- merging
Object.assign(JOBS, JOBS_HOLLOW);
Object.assign(ABILITIES, ABILITIES_HOLLOW);
Object.assign(PASSIVES, PASSIVES_HOLLOW);
Object.assign(JOB_EQUIP, JOB_EQUIP_HOLLOW);
Object.assign(STARTER_GEAR, STARTER_GEAR_HOLLOW);
Object.assign(FORGE_ITEMS, FORGE_ITEMS_HOLLOW);
Object.assign(ITEMS, ITEMS_HOLLOW, FORGE_ITEMS_HOLLOW);
// The forge's steps for the Marches' arms, made the same way as the base
// game's (data.js makes its own before this file loads).
for (const id of [...Object.keys(ITEMS_HOLLOW), ...Object.keys(FORGE_ITEMS_HOLLOW)]) if (upgradeable(id)) for (let p = 1; p <= FORGE_MAX; p++) ITEMS[`${id}+${p}`] = forgeVariant(id, p);
Object.assign(PETS, PETS_HOLLOW);
for (const e of ERRANDS_HOLLOW) ERRANDS.push(e);
