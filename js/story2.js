/* ==========================================================================
   The Hollow Sky: the expansion's road. A second campaign for a company
   that has finished the first, with its own chapters, acts, fork, roads,
   cities, recruits and endings, driven by the same engine. Loaded after
   story.js and maps2.js; game.js reads it through CAMPAIGNS.

   A year after the war, the bell Ottilie took from the drowned city rings,
   and does not stop. The aurora stands in daylight over the Greywall, the
   mountains east of the capital that no road crosses. The thing that fell
   at Starfall was the first of a chorus; the second has come down beyond
   the Greywall, into the Lantern Marches, where a Choir has waited four
   hundred years for exactly this, and has begun to sing it the rest of the
   way down.
   ========================================================================== */

const CAMPAIGN_HOLLOW = [
  // ---- Act I: The Bell -------------------------------------------------
  {
    objective: { type: 'rout', protectLeader: true },
    id: 'hs1', title: 'The Bell Road', map: 'bellroad',
    camp: [
      'Ottilie: "It rang at dusk. Once. I was asleep in the wagon and I thought I had dreamed it, and then it rang again, and it has not stopped."',
      'Rowan: "You said it would never ring."  Ottilie: "I said nothing was answering. Something is answering now."',
      'Eirik, who has not looked away from the east all evening: "The aurora is standing up. In daylight. It is not weather. I was wrong about that, and I would like it noted that I said so first."',
    ],
    intro: [
      'A year of peace, and the company has learned to sleep through most things. Not this.',
      'The bell from Tessaly hangs from the wagon\'s rail and has rung, softly and without a hand on it, for three days. Ottilie has wrapped it in a blanket. It rings through the blanket.',
      'East, over the Greywall, where the mountains stand and no road goes, the aurora hangs in the middle of the morning like a curtain somebody has left open.',
      'People have started walking toward it. Not many. A farmer, a tinker, a child. They walk past the wagon without seeing it, and their faces are wrong.',
      '"They are hollow," Mira says, and does not know why she said it. "Look at them. Somebody has sung the middle out of them."',
      'Three of them turn around on the road. Their dogs turn with them.',
    ],
    enemies: [
      { job: 'hollowed', level: 26, x: 10, y: 5, name: 'Hollowed Farmer' },
      { job: 'hollowed', level: 26, x: 8, y: 3, name: 'Hollowed Tinker' },
      { job: 'hollowed', level: 26, x: 10, y: 7, name: 'Hollowed Carter' },
      { job: 'hollowHound', level: 25, x: 8, y: 6 },
      { job: 'hollowHound', level: 25, x: 7, y: 2 },
    ],
    gil: 5400,
    outro: [
      'They go down without a sound. Not one of them cried out. Garret turns the tinker over with his boot and the man\'s eyes are open and there is nothing behind them, and there was nothing behind them before the fight either.',
      'In the tinker\'s pack: a lamp of a kind nobody has seen, brass, with a glass that is not glass, and a hymnal in a script Tamsin half knows. "It is the old liturgy," she says. "From before the sea came. The Choir of the Hollow Sky. They were a heresy. They were burned."',
      '"Not all of them," Rowan says, and looks east, where the curtain hangs.',
      'The bell rings.',
    ],
  },
  {
    objective: { type: 'escort', protectLeader: true, goal: 'far', escort: { name: 'Thessaly', job: 'skyward', level: 27 } },
    id: 'hs2', title: 'Greywall Pass', map: 'greywallPass',
    camp: [
      'Kael: "There is no road over the Greywall. There has never been a road over the Greywall. My father\'s maps stop at the foot of it and say so in ink."',
      'Bram: "There is a woman at the foot of it who says there is a road, and that she keeps it, and that we are to follow her and not touch the lamps."  Kael: "I like her already."',
      'Thessaly, from the dark beyond the fire: "You can hear me. Do not touch the lamps."',
    ],
    intro: [
      'Thessaly is a pass-warden of the Greywall, one of a dozen left, and she has come down the mountain for the first time in her life because the lamps on the stair have gone out from the top down and she does not know how to make them stop.',
      '"Something is coming down the pass," she says. "It is coming down slowly. It is hollowing the lamp-keepers as it comes, and the lamps go out after them. I have come down ahead of it. I would like to go back up with people who can fight."',
      'The pass is a stair cut into the wall of the world, with the aurora standing over it like a second sky.',
      '"See her to the top," Rowan says. "She knows the way, and we do not. If we lose her we lose the mountain."',
      'Something under the aurora unhooks itself from the rock and comes down the stair to meet them.',
    ],
    enemies: [
      { job: 'skyLeech', level: 27, x: 5, y: 3 },
      { job: 'hollowed', level: 27, x: 3, y: 6, name: 'Hollowed Keeper' },
      { job: 'hollowed', level: 27, x: 7, y: 6, name: 'Hollowed Keeper' },
      { job: 'hollowHound', level: 26, x: 4, y: 1 },
      { job: 'hollowed', level: 27, x: 6, y: 9, name: 'Hollowed Keeper' },
    ],
    gil: 5800,
    recruit: { name: 'Thessaly', job: 'skyward', level: 27 },
    outro: [
      'The top of the pass is a shelf of rock with a lamp on it, dark, and a view that goes on past the edge of what the company has ever called a country.',
      'Below, east, under the curtain of the aurora, there are lights. Thousands of them. Lamps, hung in rows, on poles, on wires, on the roofs of towns, all the way to a line of white at the horizon that Thessaly says is glass.',
      '"The Lantern Marches," she says. "They hang their lamps to keep the sky off. Every lamp a prayer. They have been praying for four hundred years." She lights the lamp on the shelf with a taper, and it stays lit, and she looks at it for a long time.',
      '"I will come with you," she says. "I have kept this stair since I was nine. I would like to see what it is a stair to."',
      'Thessaly the Skyward joins the party!',
    ],
  },
  {
    objective: { type: 'reach', protectLeader: true, goal: 'far' },
    id: 'hs3', title: 'The Beacon Stairs', map: 'beaconStairs',
    camp: [
      'Thessaly: "The beacon stairs go down into the Marches. There are seven beacons. When all seven are lit, the Marches know the pass is held. All seven are out."',
      'Ysolde: "Then whoever is below thinks the pass has fallen."  Thessaly: "Whoever is below is right."',
      'Lysa has counted the company twice and the bell three times. "It rings faster the closer we get," she says. "I am not saying it means anything. I am saying I counted."',
    ],
    intro: [
      'The stairs come down the east face of the Greywall in seven flights, a beacon at the head of each, and the lamp-wraiths have found the beacons.',
      '"They are the light of a dead lamp," Thessaly says. "The keeper dies and the light keeps the rounds. They do not know they are dead. They will try to keep you off the stair because that was their work."',
      'The moths have come up out of the Marches to drink what is left of the beacons.',
      '"Get Rowan to the foot of the stair," Garret says. "The rest of us hold the flights. Nobody is lit on fire. Nobody."',
    ],
    enemies: [
      { job: 'lanternWraith', level: 27, x: 9, y: 2 },
      { job: 'lanternWraith', level: 27, x: 9, y: 9 },
      { job: 'emberMoth', level: 27, x: 6, y: 5 },
      { job: 'emberMoth', level: 27, x: 6, y: 7 },
      { job: 'hollowed', level: 27, x: 11, y: 5, name: 'Hollowed Beacon-keeper' },
      { job: 'hollowed', level: 27, x: 11, y: 7, name: 'Hollowed Beacon-keeper' },
    ],
    gil: 6200,
    outro: [
      'At the foot of the seventh flight there is a gate, and the gate is lit.',
      'Not with lamps. With people. They stand in rows on the wall with their mouths open and a note coming out of each of them, the same note, and the light the note makes is the colour of the aurora.',
      '"The Choir," Tamsin says. "That is the Choir. I thought they were a heresy in a book."',
      '"They were," Thessaly says. "The Marches are what the heresy built when nobody came to burn it. I kept the stair that led here and I never once came down it. I am sorry. I did not want to know."',
    ],
  },
  {
    objective: { type: 'boss', protectLeader: true },
    id: 'hs4', title: 'The Lantern Gate', map: 'lanternGate',
    talk: [{ who: 'leader', text: 'We did not come to burn anyone. Open the gate, or we will open it.' }],
    camp: [
      'Bastian: "Vexley would have sold them lamp oil. He would have been very rich and very dead."',
      'Ingrid: "A wall that sings. In the forest we had wolves. I understood the wolves."',
      'Thessaly: "The man on the gate is the Gatewarden. He has sung the same four notes for thirty years. The Choir says he is holy. I say a man who sings the same four notes for thirty years has stopped being a man and started being a hinge."',
    ],
    intro: [
      'The Gatewarden stands in the gap of the wall with a maul across his shoulders and a voice coming out of him that has worn a groove in the air.',
      '"Pilgrims," he says, which is the first word anyone in the Marches has said to the company. "You are late. The sky is nearly here. Come in and be made ready."',
      '"We would rather come in as we are," Rowan says.',
      '"Nobody comes in as they are." The four notes begin, and the wall begins with him, and the hollowed on the road behind the company turn around and start to walk back toward the gate.',
    ],
    enemies: [
      { job: 'gatewarden', level: 29, x: 10, y: 5, name: 'The Gatewarden', boss: true,
        lines: { open: 'Four notes. I have never needed a fifth.', half: 'You are making a fifth note. Stop that.', fall: 'Ah. There it is. The fifth.' }, passives: ['parry', 'attackUp', 'ironFooting'] },
      { job: 'cantor', level: 28, x: 9, y: 2, name: 'Wall Cantor' },
      { job: 'cantor', level: 28, x: 9, y: 8, name: 'Wall Cantor' },
      { job: 'hollowed', level: 27, x: 6, y: 3, name: 'Hollowed Pilgrim' },
      { job: 'hollowed', level: 27, x: 6, y: 7, name: 'Hollowed Pilgrim' },
      { job: 'hollowHound', level: 27, x: 4, y: 9 },
    ],
    gil: 9000,
    outro: [
      'The Gatewarden sits down in the gap of his gate with the maul across his knees and the fifth note still in his mouth, and dies with a look on his face that is almost interest.',
      'The wall stops singing. The hollowed on the road stop walking. The ones who are still standing simply stand, waiting for a note that does not come.',
      'Beyond the gate the Marches open out under the aurora: lamps on every pole and roof and wire, towns strung together with light like beads on a thread, and far off, in the middle of all of it, a tower that was not built so much as grown, pointing at the place where the curtain comes down.',
      '"That is where the second star fell," Thessaly says. "They have been building on it. They have been building on it for four hundred years."',
      '--- END OF ACT I. ---',
    ],
  },

  // ---- Act II: The Lantern Marches ---------------------------------------
  {
    objective: { type: 'rout', protectLeader: true },
    id: 'hs5', title: 'Wickmarket Square', map: 'wickmarket',
    camp: [
      'Wren: "A town called Wickmarket. They sell candles. The whole town sells candles. I have never wanted to burn a place down more and I was a pirate."',
      'Mira: "The people who are not hollow are frightened of the people who are, and the people who are hollow are not frightened of anything, and the Choir is in the square telling everyone which is holier."',
      'Rowan: "Then we go to the square."',
    ],
    intro: [
      'Wickmarket is a town built around a candle-works, every street lit, every window lit, every doorway with a lamp over it, so that the sky has nowhere to stand.',
      'In the square two cantors of the Choir sing from the steps of the works, and the townspeople who have come to listen have begun, one by one, to join in, and to go quiet behind the eyes as they do.',
      '"They are hollowing the town," Tamsin says. "Street by street. It is a hymn and it is a harvest."',
      'The wick guard, what is left of it, has drawn up between the cantors and the company. They do not seem to know which side they are on. The moths do.',
    ],
    enemies: [
      { job: 'cantor', level: 29, x: 5, y: 1, name: 'Choir Cantor' },
      { job: 'cantor', level: 29, x: 7, y: 1, name: 'Choir Cantor' },
      { job: 'hollowed', level: 28, x: 4, y: 4, name: 'Hollowed Chandler' },
      { job: 'hollowed', level: 28, x: 7, y: 4, name: 'Hollowed Chandler' },
      { job: 'emberMoth', level: 27, x: 2, y: 3 },
      { job: 'emberMoth', level: 27, x: 9, y: 3 },
      { job: 'knight', level: 28, x: 7, y: 7, name: 'Wick Guard' },
    ],
    gil: 6800,
    outro: [
      'When the cantors fall silent the square is full of people who do not know how long they have been standing there. Some of them come back. Some of them do not. Mira goes among the ones who do not with a lamp and her hand on their faces and says their names until a few of them say them back.',
      'The chandlers\' guild, grey and shaking, gives the company the freedom of the town and asks, carefully, whether the company means to go on toward the tower.',
      '"Yes," Rowan says.',
      '"Then take candles," the guildmaster says. "Take all of them. They do not like the light. That is the only thing we have ever known for certain and it has been enough until now."',
    ],
  },
  {
    objective: { type: 'survive', rounds: 5, protectLeader: true, reinforcements: [{ round: 3, text: 'The moths come up out of the grass in a cloud.', enemies: [{ job: 'emberMoth', level: 29, x: 11, y: 1 }, { job: 'emberMoth', level: 29, x: 11, y: 10 }] }] },
    id: 'hs6', title: 'The Moth Fields', map: 'mothFields',
    camp: [
      'Garret: "Moths. We have fought the dead, the drowned, the Court, a thing with no name, and the Chancellor, and now moths."  Bram: "The size of shields."  Garret: "Moths."',
      'Eirik: "They drink the lamps. That is why the Marches hang them high. We are carrying forty candles across a field of things that eat candles. I want it said that I noticed."',
      'Ottilie has stopped wrapping the bell. "It is not louder," she says. "It is just that nothing else is quiet any more."',
    ],
    intro: [
      'Between Wickmarket and the Singing Well lies a plain of long grass with the lamps on poles every twenty paces, and under the grass the moths sleep by day with their wings folded like coals.',
      'The company has to cross it. The company has forty candles in the wagon and the evening is coming on.',
      '"Light nothing until we are over," Thessaly says. "Keep moving. If they rise, stand and let them break on you, and then keep moving."',
      'The grass begins to glow.',
    ],
    enemies: [
      { job: 'emberMoth', level: 28, x: 9, y: 2 },
      { job: 'emberMoth', level: 28, x: 10, y: 5 },
      { job: 'emberMoth', level: 28, x: 11, y: 8 },
      { job: 'emberMoth', level: 28, x: 8, y: 10 },
      { job: 'lanternWraith', level: 29, x: 6, y: 4 },
      { job: 'skyLeech', level: 29, x: 9, y: 7 },
    ],
    gil: 7200,
    outro: [
      'The moths settle at last, back into the grass, and the company stands in the middle of the field with scorched sleeves and all forty candles.',
      'On the far side the lamps lead down into a hollow where a well-head stands in a ring of stones, and from the well, faint, somebody is singing. Not the Choir\'s note. Something older, with words in it.',
      '"That is a man," Tamsin says. "That is a man singing a hymn I know, and he is singing it wrong on purpose."',
    ],
  },
  {
    objective: { type: 'escort', protectLeader: true, goal: 'far', escort: { name: 'Cassian', job: 'cantor', level: 29 } },
    id: 'hs7', title: 'The Singing Well', map: 'singingWell',
    camp: [
      'Cassian, from the bottom of the well, where he has been living on what the pilgrims throw down: "I was a cantor. I sang the hollowing for eleven years. Then one morning I heard what we were singing to, and I stopped, and they put me down here for a Choir of one."',
      'Tamsin: "What were you singing to?"  Cassian: "Nothing. That is the point. We were singing to nothing, and it was listening."',
      'Rowan: "Can you get us into the Cathedral?"  Cassian: "I can get you into the Cathedral. I can get you to Idrenne. What happens then is not mine to promise."',
    ],
    intro: [
      'The Choir has come for its deserter. Cantors on the ring of stones, a warden with them, and the hollowed in a slow circle around the well-head, all of them singing the one note down the shaft.',
      'Cassian comes up the well-rope with his hands bleeding and a hymnal under his arm and no voice left at all.',
      '"They mean to hollow him on the stones," Tamsin says. "In front of us. As a lesson."',
      '"Then we will teach a different one," Rowan says. "Get him out of the ring. Get him over the far rise and keep him there."',
    ],
    enemies: [
      { job: 'cantor', level: 29, x: 5, y: 9, name: 'Choir Cantor' },
      { job: 'cantor', level: 29, x: 8, y: 9, name: 'Choir Cantor' },
      { job: 'knight', level: 29, x: 7, y: 8, name: 'Choir Warden' },
      { job: 'hollowed', level: 29, x: 2, y: 5, name: 'Hollowed Pilgrim' },
      { job: 'hollowed', level: 29, x: 9, y: 4, name: 'Hollowed Pilgrim' },
      { job: 'lanternWraith', level: 29, x: 6, y: 10 },
    ],
    gil: 7600,
    recruit: { name: 'Cassian', job: 'cantor', level: 29 },
    outro: [
      'Cassian stands on the far rise with his back to the well and does not look at the stones until the last cantor is down. Then he looks for a long time.',
      '"I taught her," he says. "The tall one. She had a lovely voice. She still does, somewhere." He opens the hymnal. The pages are full of marks that are not notes.',
      '"The Choir\'s songs are spells," he says. "I will teach you them. All of them. The hollowing too, if you want it, because you should know what it sounds like coming."',
      'Cassian the Cantor joins the party!',
    ],
  },
  {
    objective: { type: 'boss', protectLeader: true, reinforcements: [{ round: 3, text: 'The Choir rises from the pews, singing.', enemies: [{ job: 'hollowed', level: 30, x: 1, y: 3, name: 'Hollowed Chorister' }, { job: 'hollowed', level: 30, x: 11, y: 3, name: 'Hollowed Chorister' }] }] },
    id: 'hs8', title: 'Cathedral of Lamps', map: 'cathedral',
    talk: [{ who: 'leader', text: 'Idrenne. The Gatewarden is dead and the well is empty. There is nobody left to sing but you.' }],
    camp: [
      'Cassian: "The Cathedral has ten thousand lamps and she lit every one. She is not cruel. That is what makes her hard to fight. She believes the sky will take the hollow ones gently, because they have nothing left for it to hurt."',
      'Garret: "I have met kind people who were wrong before."  Cassian: "Have you met one with a Cathedral?"',
      'Lysa: "The bell rang forty-one times during supper. I have never counted a number I liked less."',
    ],
    intro: [
      'The Cathedral of Lamps is a hall the length of a village with no roof, so that the aurora can come in, and ten thousand lamps hung in the roofless dark so that it cannot come all the way.',
      'Idrenne the Choirmaster stands at the altar at the far end with her hands open and the whole hall singing with her: the cantors in the stalls, the wraiths of the lamps that have lost their keepers, the hollowed in the pews with their mouths open.',
      '"Cassian," she says, and her voice is as lovely as he said. "You came back. I knew you would. Everyone does, in the end. Come and sing."',
      '"I came to stop the song," he says, and his voice cracks on it, and he sings the first wrong note anyway.',
    ],
    enemies: [
      { job: 'choirmaster', level: 31, x: 6, y: 1, name: 'Idrenne the Choirmaster', boss: true,
        lines: { open: 'There is nothing to fear in being empty. The sky fills what is empty.', half: 'You are all so loud. Does it not hurt, carrying so much?', fall: 'Listen. It is still singing. It does not need me. It never did.' }, passives: ['magickUp', 'absorbMp', 'regenerator'] },
      { job: 'cantor', level: 30, x: 4, y: 1, name: 'Choir Cantor' },
      { job: 'cantor', level: 30, x: 8, y: 1, name: 'Choir Cantor' },
      { job: 'lanternWraith', level: 30, x: 3, y: 4 },
      { job: 'lanternWraith', level: 30, x: 9, y: 4 },
      { job: 'hollowed', level: 29, x: 6, y: 6, name: 'Hollowed Chorister' },
    ],
    gil: 14000,
    outro: [
      'Idrenne dies at her altar with her hands still open, and the hall goes on singing for the space of a breath after she has stopped, and then does not.',
      'The lamps gutter. Ten thousand of them. Cassian walks the length of the nave relighting what he can reach and crying without any sound.',
      'On the altar, under a cloth, is what she was singing to: a piece of glass the size of a shield, black, and in it, very faintly, a reflection of a tower that is not this one.',
      '"The second star did not land in the Marches," Thessaly says, looking at it. "It landed past them. In the desert. The tower is where they built to meet it. The glass is where it is."',
      '"Then that is where we go," Rowan says, and the bell, for the first time in a month, rings once and is quiet.',
      '--- END OF ACT II. ---',
    ],
  },

  // ---- Act III: The Glass Desert ------------------------------------------
  {
    objective: { type: 'rout', protectLeader: true },
    id: 'hs9', title: 'The Shattered Road', map: 'shatteredRoad',
    camp: [
      'Thessaly: "Past the last lamp the ground is glass. The second star made it. The caravans used to cross it with their eyes shut because of what the glass showed them."',
      'Kael: "What did it show them?"  Thessaly: "Themselves. It is a mirror. All of it. A desert of mirror, a day across, and things live in it that are made of the same stuff."',
      'Bram: "I have never minded a mirror."  Ingrid: "You have never seen one the size of a country."',
    ],
    intro: [
      'The road goes out of the last town and the lamps stop and the ground turns, between one step and the next, to glass: black glass, blue glass, glass with the sky in it so clearly that the company walks on the aurora.',
      'The caravan road is marked with cairns of broken mirror. Beside it, where the glass has grown up in the shapes of what it remembers, stags stand with antlers of light.',
      '"They are not animals," Oriel will say later. "They are what the glass thought an animal was."',
      'The stags turn their heads together, and in each antler the company sees itself turn.',
    ],
    enemies: [
      { job: 'glassStag', level: 31, x: 9, y: 2 },
      { job: 'glassStag', level: 31, x: 10, y: 8 },
      { job: 'glassStag', level: 31, x: 6, y: 4 },
      { job: 'starSpawn', level: 32, x: 11, y: 5 },
      { job: 'skyLeech', level: 31, x: 8, y: 1 },
      { job: 'hollowed', level: 31, x: 9, y: 9, name: 'Hollowed Caravaner' },
    ],
    gil: 8400,
    outro: [
      'The stags break into light and the light runs away across the glass in every direction and is gone.',
      'Where the road dips there is water, or something that lies like water: a lake of mirror a mile wide with the company standing upside down in it, and on the far shore, very small, the company standing on the far shore and looking back.',
      '"Mirrorwater," Thessaly says. "The caravans go round. It takes four days."',
      '"We do not have four days," Rowan says, and looks at himself on the far shore, and the man on the far shore looks back, and does not look away first.',
    ],
  },
  {
    objective: { type: 'rout', protectLeader: true },
    mirror: true,
    id: 'hs10', title: 'Mirrorwater', map: 'mirrorwater',
    camp: [
      'Mira: "The one on the far shore that is me. She is standing wrong. I do not stand like that."  Lysa: "You stand exactly like that."  Mira: "I know. That is what I mean."',
      'Garret: "If it comes to it, I will not be beaten by a man thirty years younger than me who happens to be me."',
      'Rowan: "Whatever is across the water, it has had a day to watch us. It knows what we do. Do something else."',
    ],
    intro: [
      'The lake is not water. It holds the company\'s weight and its image, and halfway across the image stands up out of it.',
      'Five of them. The five the company sent across first, as they were when they stepped onto the glass: the same faces, the same arms, the same trades, standing on the far bank with the company\'s own colours reversed.',
      '"They will fight as we fight," Thessaly says. "That is what the glass does. It does not invent. It only remembers."',
      '"Then we will have to be worse than we are," Garret says, "or better. One or the other." He draws, and across the water, the man who is him draws a moment later, and grins, and Garret has never once in his life grinned.',
    ],
    // Placeholders: the engine replaces these with reflections of the company
    // the player deploys, at these tiles (see Game.mirrorEnemies).
    enemies: [
      { job: 'glassblade', level: 32, x: 8, y: 3, name: 'Reflection' },
      { job: 'glassblade', level: 32, x: 9, y: 2, name: 'Reflection' },
      { job: 'glassblade', level: 32, x: 10, y: 3, name: 'Reflection' },
      { job: 'glassblade', level: 32, x: 8, y: 6, name: 'Reflection' },
      { job: 'glassblade', level: 32, x: 9, y: 8, name: 'Reflection' },
    ],
    gil: 9000,
    outro: [
      'The last reflection goes down into the glass like a stone into water and the lake is only a lake of mirror again, with nothing standing on the far side of it but the far side.',
      'Nobody says anything for a while. Then Bram says, "Mine fought dirty," and Kael says, "Mine fought well," and they look at each other.',
      'On the far shore a man is waiting who is not a reflection. He is old, and burned brown, and he has a sword made of the same glass as the lake, and he says, "You crossed. Nobody crosses. Come and sit down, and tell me what you are, so I can tell you what she is."',
    ],
  },
  {
    objective: { type: 'boss', protectLeader: true },
    id: 'hs11', title: 'The Hermit\'s Mirror', map: 'glassHermit',
    talk: [{ who: 'leader', text: 'We have fought ourselves once today. We can do it again.' }],
    camp: [
      'Oriel: "I came out here with my sister forty years ago to see the star. She looked into the glass first. What came out of the glass wearing her face has been queen of this desert since, and I have been learning to fight it with its own stuff. I am nearly good enough. I am not quite."',
      'Rowan: "What does she want?"  Oriel: "What the glass wants. To be looked into. Every face it takes is a face it keeps. The tower is her idea. She told the Choir the sky was coming. She was not wrong. She was just glad."',
      'Wren: "And you want us to kill your sister."  Oriel: "I want you to kill the thing that killed my sister and has been wearing her to parties. Yes."',
    ],
    intro: [
      'The Hermit\'s mirror is a hollow in the glass where Oriel has lived for forty years, and the Mirror Queen has come to it because the company came, and because she is curious, and because she has not had a new face in a long time.',
      'She is beautiful. She is Oriel\'s sister as a girl of twenty, and then she is Mira, and then she is Rowan, and then she is nobody, and the glass stags kneel around her with their antlers down.',
      '"You brought me so many," she says, in Rowan\'s voice. "I will keep every one."',
      '"You will keep nothing," Oriel says, and his glass blade comes up, and in it, for the first time in forty years, he sees his own face and not hers.',
    ],
    enemies: [
      { job: 'mirrorQueen', level: 33, x: 8, y: 2, name: 'The Mirror Queen', boss: true,
        lines: { open: 'Which of you shall I be first?', half: 'Oh. This face. I had forgotten this face hurt.', fall: 'Keep it, then. Keep your own face. See how long you like it.' }, passives: ['parry', 'magickUp', 'movePlus1'] },
      { job: 'glassStag', level: 32, x: 2, y: 6 },
      { job: 'glassStag', level: 32, x: 8, y: 7 },
      { job: 'glassblade', level: 32, x: 4, y: 4, name: 'Glass Thrall' },
      { job: 'glassblade', level: 32, x: 7, y: 5, name: 'Glass Thrall' },
      { job: 'starSpawn', level: 33, x: 5, y: 9 },
    ],
    gil: 15000,
    recruit: { name: 'Oriel', job: 'glassblade', level: 33 },
    outro: [
      'The Mirror Queen breaks. Not dies: breaks, into a thousand faces that lie on the glass and look up and are, one by one, nobody.',
      'The last of them is a girl of twenty, and Oriel kneels by it until it is only glass, and then he stands up, and he is forty years older than he was at breakfast and looks it.',
      '"She was right about the sky," he says. "That is the worst of it. It is coming. The crater is a day east and the thing in it has been calling the whole time she was keeping me busy. I will show you. I am done here."',
      'Oriel the Glassblade joins the party!',
    ],
  },
  {
    objective: { type: 'boss', protectLeader: true },
    id: 'hs12', title: 'The Second Crater', map: 'secondCrater',
    talk: [{ who: 'leader', text: 'Starfall again. We put the first one down. We will put this one down.' }],
    camp: [
      'Eirik: "The first one was cold. This one is not cold. This one is awake. I would rather the cold."',
      'Ottilie: "The bell has stopped." The company looks up. "It stopped an hour ago. I did not say, because I wanted to be sure. It has stopped because we are here. It does not need to call us any more."',
      'Oriel: "What is in the crater is a seed. It is not the thing. The thing is still coming. The seed is what tells it where to land."',
    ],
    intro: [
      'The second crater is a bowl of glass a mile wide with the sky standing in the bottom of it like water in a cup.',
      'In the middle of the sky, something that is not quite a shape turns slowly, white, and the hollowed kneel in rings around it, and the things that fell with it walk the rim with their light turned inward.',
      '"That is the Seed," Oriel says. "It has been singing to the tower, and the tower has been singing back, and when they agree on the note, the rest comes down. Break it, and they have to start the song again from nothing."',
      'The Seed turns toward the company. It has no face. It has, Rowan thinks, every face it has ever been shown.',
    ],
    enemies: [
      { job: 'starSpawn', level: 34, x: 6, y: 5, name: 'The Seed', boss: true,
        lines: { open: 'You are the one the bell was for. Come and be the place I land.', half: 'The note is nearly agreed. You are too late by a year.', fall: 'Then the tower will sing alone. It knows the words.' }, passives: ['magickUp', 'absorbMp', 'arcaneEcho'] },
      { job: 'starSpawn', level: 33, x: 4, y: 6 },
      { job: 'starSpawn', level: 33, x: 8, y: 6 },
      { job: 'hollowed', level: 33, x: 3, y: 3, name: 'Hollowed Pilgrim' },
      { job: 'hollowed', level: 33, x: 9, y: 3, name: 'Hollowed Pilgrim' },
      { job: 'skyLeech', level: 33, x: 6, y: 2 },
      { job: 'lanternWraith', level: 33, x: 6, y: 9 },
    ],
    gil: 16000,
    outro: [
      'The Seed goes out like a lamp, and the sky in the bottom of the crater is only glass with the real sky in it, and the real sky is the aurora, and the aurora is lower than it was this morning.',
      '"It is still coming," Oriel says. "The Seed told it where. Breaking the Seed does not unsay that. The tower is the only voice left that can speak to it, and the tower is Choir, and the Choir is a man now. One man. He climbed it first. They call him the Herald."',
      'Ottilie unwraps the bell and hangs it from the rail and looks at it. "Ring," she tells it. It does not. "Good," she says. "Then we are doing this ourselves."',
      '--- END OF ACT III. ---',
    ],
  },

  // ---- Act IV: The Hollow Sky ---------------------------------------------
  {
    objective: { type: 'escort', protectLeader: true, goal: 'far', escort: { name: 'Maren', job: 'lanternkeeper', level: 35 } },
    id: 'hs13', title: 'Lamplighter\'s Row', map: 'lamplighter',
    camp: [
      'Maren: "I keep the lamps on the Row under the tower. Kept. The Herald hollowed the Row last week and left me because I was up a ladder and he did not look up. I have been up the ladder since. I would like to come down."',
      'Mira: "Why did he leave the lamps?"  Maren: "He did not leave them. He is waiting for them to go out. Then it is dark all the way to the door, and the sky can come down the Row to meet him."',
      'Rowan: "Then we light them."  Maren: "Then we light them. I have four hundred wicks. Bring the ones who can fight."',
    ],
    intro: [
      'Lamplighter\'s Row is the last street under the tower, a mile of lamps on both sides, and the Herald\'s hollowed stand under every one of them waiting for it to go out.',
      'Maren comes down her ladder with a pole and a satchel and a look of somebody who has not slept in eight days and does not intend to start now.',
      '"Every lamp I light they will try to put out, and me with it," she says. "Keep them off me and I will keep the dark off you. That is the trade. It has always been the trade."',
      '"Get her to the door of the tower," Rowan says. "Lit."',
    ],
    enemies: [
      { job: 'hollowed', level: 35, x: 9, y: 2, name: 'Hollowed Lamplighter' },
      { job: 'hollowed', level: 35, x: 10, y: 6, name: 'Hollowed Lamplighter' },
      { job: 'hollowHound', level: 34, x: 6, y: 1 },
      { job: 'hollowHound', level: 34, x: 7, y: 9 },
      { job: 'cantor', level: 35, x: 10, y: 3, name: 'Herald\'s Cantor' },
      { job: 'skyLeech', level: 36, x: 4, y: 8 },
    ],
    gil: 9800,
    recruit: { name: 'Maren', job: 'lanternkeeper', level: 35 },
    outro: [
      'The Row is lit from end to end, and at the end of it is the door of the tower, which is not a door, which is a mouth in the glass with a stair behind it going up into the aurora.',
      'Maren lights the last lamp and sits down under it with the pole across her knees. "There," she says. "Now it has to come down the stair and knock, like anybody."',
      '"Will you come?" Rowan asks. "Up?"',
      '"I have never once in my life left a lamp lit with nobody to watch it," she says, and gets up. "I suppose there is a first time."',
      'Maren the Lanternkeeper joins the party!',
    ],
  },
  {
    objective: { type: 'survive', rounds: 5, protectLeader: true, reinforcements: [
      { round: 3, text: 'The hollowed come up the Row behind you, singing.', enemies: [{ job: 'hollowed', level: 36, x: 0, y: 7, name: 'Hollowed Pilgrim' }, { job: 'hollowed', level: 36, x: 12, y: 7, name: 'Hollowed Pilgrim' }] },
      { round: 4, text: 'Something unhooks itself from under the aurora and drops.', enemies: [{ job: 'skyLeech', level: 36, x: 6, y: 6 }] },
    ] },
    id: 'hs14', title: 'The Tower Foot', map: 'towerFoot',
    camp: [
      'Thessaly: "The tower is three hundred steps and the Herald is at the top of them and the sky is three hundred steps above him. We have to go up all of it in the dark. I have climbed worse. I have not climbed worse with the sky coming down it."',
      'Garret: "Then we take the foot of the stair and we hold it until everyone is through the door, and nobody is left on the Row when the dark comes."',
      'Cassian has been quiet all evening. "He was my student too," he says. "The Herald. He had no voice at all. He was the worst singer I ever taught. I wonder what he sounds like now."',
    ],
    intro: [
      'The foot of the tower is a terrace of glass with the stair going up out of the middle of it, and the Choir\'s last warden stands at the head of the stair with the cantors on the steps behind him.',
      '"Hold the foot," Garret says. "Five rounds. Then we go up, and nothing follows us."',
      'Above, the aurora is lower than the top of the tower now. It has begun, very faintly, to sing.',
    ],
    enemies: [
      { job: 'gatewarden', level: 36, x: 6, y: 1, name: 'Tower Warden' },
      { job: 'cantor', level: 36, x: 4, y: 2, name: 'Herald\'s Cantor' },
      { job: 'cantor', level: 36, x: 8, y: 2, name: 'Herald\'s Cantor' },
      { job: 'hollowed', level: 36, x: 2, y: 5, name: 'Hollowed Pilgrim' },
      { job: 'hollowed', level: 36, x: 10, y: 5, name: 'Hollowed Pilgrim' },
      { job: 'starSpawn', level: 36, x: 6, y: 4 },
    ],
    gil: 10400,
    outro: [
      'The foot is held. The last of the hollowed stand on the Row under Maren\'s lamps and do not come closer, and the company goes up the stair, and nothing follows.',
      'Three hundred steps. Ottilie counts them. At the hundredth the walls begin to sing with the sky, and at the two hundredth the company can no longer hear itself, and at the two hundred and fiftieth the singing stops, and in the silence a voice says, quite close, "I was wondering when you would come up."',
    ],
  },
  {
    objective: { type: 'reach', protectLeader: true, goal: 'far' },
    id: 'hs15', title: 'The Stair of Voices', map: 'stairOfVoices',
    camp: [
      'Bram: "We are inside a tower made of glass with the sky on the roof and a man at the top who talks to it. I am going to say what I always say, which is that we are paid for this, and nobody is going to say we are, and that is fine."',
      'Ingrid: "I will say it. Nobody is paying us."  Bram: "Thank you."',
      'Rowan: "Get me to the top. Whatever is up there, it is a man first, and I have words for a man."',
    ],
    intro: [
      'The last hundred steps are the Stair of Voices, where every cantor the Choir ever hollowed stands in the wall and sings, and the stair is the throat the song goes up.',
      'The Herald\'s guard holds the flights. The glass stags have come up from the desert to kneel at the top.',
      '"Rowan to the top," Garret says, and for once does not say anything else, because the song is very loud and he would like to save his breath.',
    ],
    enemies: [
      { job: 'hollowed', level: 37, x: 3, y: 9, name: 'Hollowed Chorister' },
      { job: 'hollowed', level: 37, x: 6, y: 9, name: 'Hollowed Chorister' },
      { job: 'cantor', level: 37, x: 4, y: 5, name: 'Herald\'s Cantor' },
      { job: 'cantor', level: 37, x: 6, y: 5, name: 'Herald\'s Cantor' },
      { job: 'lanternWraith', level: 37, x: 5, y: 2 },
      { job: 'glassStag', level: 37, x: 3, y: 7 },
      { job: 'skyLeech', level: 38, x: 6, y: 1 },
    ],
    gil: 11000,
    outro: [
      'The top of the stair is a floor of glass open to the sky, and the sky is a hand\'s breadth above it, and in the middle of the floor a man sits on a chair of star-iron with his face turned up, listening.',
      '"Hello, Cassian," the Herald says, without looking down. "I found my voice. Would you like to hear it?"',
    ],
  },
  {
    objective: { type: 'boss', protectLeader: true, reinforcements: [{ round: 4, text: 'The hollowed come up the last of the stair.', enemies: [{ job: 'hollowed', level: 38, x: 1, y: 10, name: 'Hollowed Chorister' }, { job: 'hollowed', level: 38, x: 11, y: 10, name: 'Hollowed Chorister' }] }] },
    id: 'hs16', title: 'The Hollow Throne', map: 'hollowThrone',
    talk: [{ who: 'leader', text: 'Get up out of that chair. Whatever you are speaking for, it can hear me from here.' }],
    camp: [
      'Cassian: "He was called Aurel. He could not hold a note. The others laughed. I did not stop them, and I should have, and now he holds one note so well the sky has come to hear it."',
      'Oriel: "When he falls, it will stand up in him. That is what the glass showed me, forty years ago, and I did not understand it. It will stand up in his armour and it will be every voice at once. Do not stop when he falls. Nobody stop."',
      'Rowan: "Four wars. Five roads. A bell. I am going to go up there and tell a man to get out of a chair, and then we are going to see what we are made of."',
    ],
    intro: [
      'Aurel the Herald stands up out of his chair, and he is only a man, thin, in star-iron that does not fit, with the sky a hand\'s breadth over his head and the whole tower singing through him.',
      '"I am not the thing," he says. "I know you think I am. I am the door. Somebody has to be the door. I volunteered. Nobody else would."',
      '"Then close," Rowan says.',
      '"I cannot. That is what a door is." He draws, and the sky draws with him, and the note the whole Marches has been singing for four hundred years is finally, entirely, agreed.',
    ],
    enemies: [
      { job: 'theHerald', level: 38, x: 6, y: 6, name: 'Aurel the Herald', boss: true,
        lines: { open: 'You are late. I have been holding it open for a year.', half: 'It is nearly through. You cannot shut it. Nobody can shut it. I tried.', fall: 'There. The door is open. Now it comes down.' },
        passives: ['magickUp', 'absorbMp', 'ironFooting'],
        phases: [{ atPct: 0.35, job: 'theChorus', name: 'The Chorus', heal: 1, say: 'Aurel goes down, and something stands up in the star-iron, and it is every voice at once.', cry: 'WE ARE THE ANSWER. WE ARE ONLY THE ANSWER.' }] },
      { job: 'gatewarden', level: 38, x: 4, y: 5, name: 'Throne Warden' },
      { job: 'gatewarden', level: 38, x: 8, y: 5, name: 'Throne Warden' },
      { job: 'cantor', level: 38, x: 3, y: 2, name: 'Herald\'s Cantor' },
      { job: 'cantor', level: 38, x: 9, y: 2, name: 'Herald\'s Cantor' },
      { job: 'starSpawn', level: 38, x: 6, y: 3 },
      { job: 'lanternWraith', level: 37, x: 2, y: 8 },
    ],
    gil: 24000,
    outro: [
      'The Chorus breaks like a bell dropped from a height, and the sound goes out across the Marches and the desert and over the Greywall, and every lamp in the Marches goes out at once, and then, one by one, comes back.',
      'Aurel lies on the glass in his star-iron with the sky a hand\'s breadth above him and the aurora, for the first time in a year, going up instead of down.',
      '"It is not gone," he says. He is dying, and knows it, and is not hollow. "It is only not called. The door is open and nobody is standing in it. You will have to decide what to do about the door."',
      '"Us?" Rowan says.',
      '"You climbed the stair." He closes his eyes. "That is how it works. Whoever climbs the stair."',
      '--- END OF ACT IV. ---',
    ],
  },
];

// The fork at the top of the tower, and what the company says there.
const CHOICE_HOLLOW = {
  title: 'Three Answers',
  lines: [
    'The company stands at the top of the Hollow Tower with the door open and the sky waiting to be told what to do.',
    'It could bring the tower down and let the sky forget the way. It could climb the last of the way and speak to what is coming. Or it could keep the tower, and the door, and make a lamp of it.',
    'Whichever answer you give, the others close behind you. An answer once given can be given again from here.',
  ],
};

const ROADS_HOLLOW = {
  silence: {
    id: 'silence', title: 'The Silence', tagline: 'Bring it down.',
    blurb: 'Ottilie can bring the tower down if the company holds its foot while she sets the charges. No tower, no door, no song. The sky forgets the way, or does not.',
    asks: 'Two fights, down and out. Ends with the Marches dark and the company home.',
    chapters: [
      {
        objective: { type: 'rout', protectLeader: true },
        id: 'silence1', title: 'The Tower Root', map: 'towerRoot',
        camp: [
          'Ottilie: "The tower is glass and the glass is grown and grown things have roots. I put four charges at the roots and it comes down like a tree. I have never done it. I have thought about it every night since Wickmarket."',
          'Maren: "And the lamps?"  Ottilie: "The lamps are yours. The tower is mine."',
          'Rowan: "Then we go down. All the way down. And we hold the root while she works."',
        ],
        intro: [
          'The root of the tower is a cave under the glass where the first Choir dug to meet the first star, and what fell with it has lived there since, keeping the roots warm.',
          '"Four charges," Ottilie says. "Four roots. I need the chamber clear. Clear it."',
          'The star-spawn come up out of the roots with their light turned inward, and the last warden of the Choir stands among them with his maul, because somebody has to.',
        ],
        enemies: [
          { job: 'gatewarden', level: 39, x: 6, y: 8, name: 'The Last Warden' },
          { job: 'starSpawn', level: 39, x: 5, y: 8 }, { job: 'starSpawn', level: 39, x: 7, y: 8 },
          { job: 'skyLeech', level: 40, x: 6, y: 10 },
          { job: 'hollowed', level: 38, x: 3, y: 7, name: 'Hollowed Digger' }, { job: 'hollowed', level: 38, x: 9, y: 7, name: 'Hollowed Digger' },
        ],
        gil: 12000,
        outro: [
          'The chamber is clear. Ottilie works for an hour in the dark with the company standing round her and nobody speaking, and then she stands up and wipes her hands and says, "Up. Fast. Do not stop to look at anything."',
        ],
      },
      {
        objective: { type: 'survive', rounds: 6, protectLeader: true, reinforcements: [{ round: 3, text: 'The hollowed come down the Row to stop the fuses.', enemies: [{ job: 'hollowed', level: 40, x: 0, y: 3, name: 'Hollowed Pilgrim' }, { job: 'hollowed', level: 40, x: 11, y: 3, name: 'Hollowed Pilgrim' }] }] },
        id: 'silence2', title: 'The Falling Tower', map: 'fallingTower',
        talk: [{ who: 'leader', text: 'Six rounds. Then it comes down, and we do not.' }],
        camp: [
          'Garret: "I have held a bridge, a gate, a crater and a throne. I have never held a fuse."  Ottilie: "You will like it. It is the same as a gate, only the gate wins at the end."',
          'Thessaly, looking up the tower: "I kept a stair for thirty years. I am about to watch a stair fall down. I do not know what I am for after this."  Rowan: "Neither do I. Come and find out."',
        ],
        intro: [
          'The fuses are lit. The company stands on the Row under Maren\'s lamps with the tower going up behind them into the sky it was built to call, and the sky, for once, is coming down to stop them.',
          '"Six rounds," Ottilie says. "Hold the Row. When it goes, run."',
        ],
        enemies: [
          { job: 'starSpawn', level: 40, x: 5, y: 10 }, { job: 'starSpawn', level: 40, x: 7, y: 10 },
          { job: 'skyLeech', level: 40, x: 6, y: 8 },
          { job: 'hollowed', level: 40, x: 3, y: 5, name: 'Hollowed Pilgrim' }, { job: 'hollowed', level: 40, x: 8, y: 5, name: 'Hollowed Pilgrim' },
          { job: 'lanternWraith', level: 40, x: 10, y: 6 },
        ],
        gil: 20000,
        outro: [
          'The tower goes down like a tree, slowly and then all at once, into the crater it was grown from, and the sound of it is the last note of the song, held and then not.',
          'The aurora goes out. Not up: out. The Marches lie under an ordinary night sky with ordinary stars in it, and Maren\'s lamps, and nothing else.',
          'Nobody sings. For the first time in four hundred years, nobody in the Marches sings, and in the silence the hollowed sit down where they are standing and, some of them, after a while, begin to weep, which is the first thing they have felt in years.',
          'The company goes home over the Greywall. Thessaly lights every lamp on the stair behind them, and leaves them lit, and does not look back.',
          'Oriel stays in the desert. "Somebody should tell the glass it is only glass," he says. "Every day. Until it believes it." Cassian stays with him, and teaches the children of Wickmarket to sing badly, on purpose, so that nothing listening will ever mistake it for a prayer.',
          'The bell hangs from the wagon. It does not ring. Ottilie checks it every night, and says "Nothing," and means it the way she used to.',
          '--- THE END: THE SILENCE. Thank you for playing. Another answer waits at the top of the tower, and the trials at camp. ---',
        ],
        final: true,
        ending: {
          title: 'The Silence', after: 'The tower is down and the sky has forgotten the way. What remains are the trials, and a company that has learned to sleep through the dark.',
          camp: [
            'Maren keeps the lamps on the Row under a crater, and says the Row is the same length with nothing at the end of it.',
            'Thessaly has come back down the stair. "I kept it for thirty years," she says. "It turns out I like the bottom."',
            'Eirik watches the sky every night. It is only weather. He says so, every night, and this time he sounds glad.',
            'Lysa has counted the company. "Seventeen," she says, "and one bell, and the bell does not count, because it has stopped counting."',
            'Garret: "Four wars, five roads, a tower. His father would have called that a start."  Rowan: "He would have. Let him."',
          ],
        },
      },
    ],
  },
  ascent: {
    id: 'ascent', title: 'The Ascent', tagline: 'Go up and speak.',
    blurb: 'The door is open and nobody is standing in it. Climb the last of the way, into the sky itself, and tell what is coming to turn back. It has never been told. It may listen. It may not.',
    asks: 'Two fights, up into the aurora. Ends with the company speaking for the realm, and one of them staying to keep the word.',
    chapters: [
      {
        objective: { type: 'reach', protectLeader: true, goal: 'far' },
        id: 'ascent1', title: 'The High Stair', map: 'highStair',
        camp: [
          'Cassian: "Above the throne there is no tower. There is the stair the song made, going up into the curtain. It is only there while somebody sings. I will sing. I will have to sing the hollowing, because it is the only one that reaches. I will sing it wrong."',
          'Rowan: "What do I say to it?"  Cassian: "I do not know. Nobody has ever said anything to it. Everyone has only ever sung."',
          'Garret: "Then say what you said to the Chancellor, and the Queen, and the Cold. It worked on them."  Rowan: "It killed them."  Garret: "Yes."',
        ],
        intro: [
          'The stair the song makes goes up out of the top of the tower into the aurora, and it is only as solid as the note that holds it, and Cassian sings with his cracked voice and the stair holds, mostly.',
          'The things that live under the curtain have come down it to see who is climbing.',
          '"Rowan to the top," Thessaly says. "I will go first. I have climbed stairs that were not there before. In fog. It is the same."',
        ],
        enemies: [
          { job: 'skyLeech', level: 40, x: 4, y: 3 }, { job: 'skyLeech', level: 40, x: 5, y: 1 },
          { job: 'hollowed', level: 39, x: 3, y: 8, name: 'Hollowed Chorister' }, { job: 'hollowed', level: 39, x: 7, y: 8, name: 'Hollowed Chorister' },
          { job: 'cantor', level: 40, x: 6, y: 6, name: 'Herald\'s Cantor' },
          { job: 'starSpawn', level: 40, x: 5, y: 4 },
        ],
        gil: 12000,
        outro: [
          'The top of the stair is a floor of light with the whole of the Marches under it, and the Greywall, and past the Greywall, very small, Elderon with its ten open cities lit.',
          'Above, the curtain. Below the curtain, waiting, the thing the Choir sang to for four hundred years: not a shape, not a face, a listening.',
        ],
      },
      {
        objective: { type: 'boss', protectLeader: true },
        id: 'ascent2', title: 'The Summit', map: 'theSummit',
        talk: [{ who: 'leader', text: 'You have been sung to for four hundred years. I am going to talk. Listen, or do not, but you will hear it.' }],
        camp: [
          'Nobody sleeps at the top of the stair. Ottilie: "If we win, somebody has to stay up here and keep saying it. Whatever you say. It will not remember on its own."',
          'Eirik: "I will stay." Everyone looks at him. "I have watched the sky every night for two years and said it was weather. I would like, for once, to be the thing that makes it so."',
        ],
        intro: [
          'The Chorus stands up out of the light a last time, every voice that ever sang to the sky, and behind it the sky leans down to listen.',
          '"I am not going to sing," Rowan says. "I have never been able to. I am going to tell you what you are coming to, and you are going to decide if you still want it."',
          'He tells it. Four wars. Five roads. A bell. The grain. The Chorus screams over him, and he keeps talking, and the company holds the floor so that he can.',
        ],
        enemies: [
          { job: 'theChorus', level: 40, x: 5, y: 3, name: 'The Chorus', boss: true,
            lines: { open: 'WE ARE THE ANSWER.', half: 'IT IS LISTENING. IT HAS NEVER LISTENED.', fall: 'It heard you. We are not needed. We were never needed.' }, passives: ['magickUp', 'absorbMp', 'arcaneEcho'] },
          { job: 'starSpawn', level: 40, x: 2, y: 2 }, { job: 'starSpawn', level: 40, x: 8, y: 2 },
          { job: 'skyLeech', level: 40, x: 5, y: 6 },
        ],
        gil: 22000,
        outro: [
          'The Chorus goes out, and in the silence the sky is still there, listening, and Rowan, hoarse, says the last of it: "That is what is here. Come if you want it. Nobody will sing you down again, and nobody will sing you away. You will have to decide, like anybody."',
          'The curtain hangs for a long moment. Then it goes up. Not out: up, and away, slowly, the way a thing goes that has been told something it will have to think about for a thousand years.',
          'Eirik stays at the top of the stair, with a lamp from Maren and a bell from Ottilie, and says the words every night to a sky that is only weather, so that it stays weather.',
          'The company comes down the stair into the Marches, where the lamps are lit and the Choir is a story, and goes home over the Greywall, and Rowan Aldric, who ended four wars, has never once told anyone what he said at the top of the tower, and never will.',
          'Cassian\'s voice never comes back. He is glad of it. He writes the songs down instead, all of them, with the wrong notes marked, so that nobody will ever sing them right by accident.',
          '--- THE END: THE ASCENT. Thank you for playing. Another answer waits at the top of the tower, and the trials at camp. ---',
        ],
        final: true,
        ending: {
          title: 'The Ascent', after: 'The sky has been spoken to, and has gone away to think. What remains are the trials, and a company one voice short, which is kept at the top of a stair.',
          camp: [
            'Letters come down from the top of the stair, one a month, in Eirik\'s hand. Every one says "Weather." Every one is kept.',
            'Rowan trains with the company every morning and does not talk about the tower. Garret has stopped asking. Bram has not.',
            'Thessaly keeps the Greywall stair again, and has had a second stair cut beside it, going up past the top, in case anyone ever needs to go and relieve Eirik. Nobody has. Somebody will.',
            'Lysa has counted the company and come up one short and counted the letters and come up right.',
            'Ottilie made a second bell. It hangs at the top of the stair. Once a year Eirik rings it, and far below, on the wagon, the first one answers, and that, Ottilie says, is the only kind of answering she has ever liked.',
          ],
        },
      },
    ],
  },
  lantern: {
    id: 'lantern', title: 'The Lantern', tagline: 'Keep the door, and light it.',
    blurb: 'Maren says a door with a lamp in it is a lighthouse. Keep the tower, keep the Choir, teach them a different song, and make the Hollow Sky a light the whole realm can see by.',
    asks: 'Two fights to hold what was built. Ends with the tower lit, and the Marches a province of lamps.',
    chapters: [
      {
        objective: { type: 'hold', rounds: 4, goal: { x: 6, y: 5 }, protectLeader: true },
        id: 'lantern1', title: 'The Lamp Walk', map: 'lampWalk',
        camp: [
          'Maren: "You do not pull a tooth because it aches. You fill it. The tower is a door. Put a lamp in a door and it is a lighthouse, and a lighthouse is the kindest thing anyone ever built."',
          'Tamsin: "The Choir will not take it kindly."  Maren: "The Choir is nine cantors and a Gate Captain. They will take what they are given, and what they are given is a new hymn, and Cassian is going to write it."',
          'Cassian: "I have never written a hymn to keep something out."  Maren: "Then it will be the first honest one."',
        ],
        intro: [
          'What is left of the Choir has come down the Row to take the tower back, under a Gate Captain who has never sung a note in his life and does not intend to start.',
          '"Hold the Row at the lamp-post," Maren says. "The middle one. If they put that one out, the rest go in a line. If they cannot, they cannot."',
        ],
        enemies: [
          { job: 'gatewarden', level: 39, x: 12, y: 5, name: 'Gate Captain' },
          { job: 'hollowed', level: 38, x: 10, y: 4, name: 'Hollowed Pilgrim' }, { job: 'hollowed', level: 38, x: 10, y: 6, name: 'Hollowed Pilgrim' },
          { job: 'cantor', level: 39, x: 10, y: 2, name: 'Choir Cantor' },
          { job: 'emberMoth', level: 38, x: 5, y: 1 }, { job: 'emberMoth', level: 38, x: 5, y: 9 },
        ],
        gil: 12000,
        outro: [
          'The middle lamp stays lit. The Gate Captain, who has never sung, surrenders in a plain speaking voice, and seems relieved to have been asked a question he can answer with words.',
        ],
      },
      {
        objective: { type: 'boss', protectLeader: true },
        id: 'lantern2', title: 'The Lighthouse', map: 'theLighthouse',
        talk: [{ who: 'leader', text: 'The tower stays. The song changes. Sing the new one or get out of the way of those who will.' }],
        camp: [
          'Cassian has written the hymn. It has four notes, and a fifth, and the fifth is the one the Gatewarden died making. "It goes up," he says. "The old one went down. That is all I did. I turned it over."',
          'Maren: "Tomorrow the tower is lit from the foot to the door. If it holds the night, it holds."  Ottilie: "And if it does not?"  Maren: "Then you may have your charges, and I will hand you the match."',
        ],
        intro: [
          'The last cantor of the old Choir stands at the top of the tower with the lamps lit all the way up it to her feet, and refuses the new hymn, and sings the old one down the stair at the company one last time.',
          '"Sabel," Cassian says. "You were the best of us."  "I still am," she says. "Listen."',
          'The lamps gutter. Maren goes up the stair with a taper.',
        ],
        enemies: [
          { job: 'choirmaster', level: 40, x: 5, y: 5, name: 'Sabel of the Choir', boss: true,
            lines: { open: 'You will not put a lamp in the sky. The sky is the lamp.', half: 'The fifth note. You stole it from a dead man.', fall: 'Turned over. Yes. It does go up. I wish I had heard that.' }, passives: ['magickUp', 'absorbMp', 'quickCast'] },
          { job: 'lanternWraith', level: 39, x: 3, y: 4 }, { job: 'lanternWraith', level: 39, x: 8, y: 4 },
          { job: 'hollowed', level: 39, x: 2, y: 7, name: 'Hollowed Chorister' }, { job: 'hollowed', level: 39, x: 9, y: 7, name: 'Hollowed Chorister' },
          { job: 'emberMoth', level: 38, x: 6, y: 8 },
        ],
        gil: 20000,
        outro: [
          'Sabel sits down at the top of the stair, and Maren lights the lamp in the door of the sky over her head, and the tower is lit from the foot to the roof, and the aurora, which has been a curtain, becomes a glow, and then a glow on a lamp, and stays.',
          'The Marches call it the Lighthouse. Ships see it from the Sunder Sea. Herders see it from the Winter Court. On a clear night, from the walls of Elderon, you can see it standing over the Greywall like a star that somebody keeps.',
          'The Choir sings the new hymn. It goes up. The hollowed, slowly, over years, come back to themselves to the sound of it, and the first thing most of them do is complain about the tune.',
          'Maren keeps the light. Cassian keeps the Choir. Thessaly keeps the stair. The company goes home, and every one of them, on a clear night, goes out and looks east, and does not say why.',
          '--- THE END: THE LANTERN. Thank you for playing. Another answer waits at the top of the tower, and the trials at camp. ---',
        ],
        final: true,
        ending: {
          title: 'The Lantern', after: 'The tower is a lighthouse and the Marches are a province of lamps. What remains are the trials, and a company that can see its way home from anywhere.',
          camp: [
            'Maren sends a letter a season. It is always one line: "Lit." Ottilie keeps them in the bell.',
            'The chandlers of Wickmarket have made a candle in the company\'s colours and sell it for a mark. It does not sell. They keep making it.',
            'Cassian has taught the Choir sixty hymns, all of them going up, and the hollowed sing along out of tune and nobody minds.',
            'Eirik watches the Lighthouse every night from the walls. "Not weather," he says, pleased. "A lamp."',
            'Garret: "A tower, kept. His father would have called that a start."  Rowan: "His father would have asked who was paying for the oil."  Garret: "Who is?"  Rowan: "We are."',
          ],
        },
      },
    ],
  },
};
const ROAD_ORDER_HOLLOW = ['silence', 'ascent', 'lantern'];
for (const id of ROAD_ORDER_HOLLOW) ROADS_HOLLOW[id].ending = ROADS_HOLLOW[id].chapters[ROADS_HOLLOW[id].chapters.length - 1].ending;

const ACTS_HOLLOW = [
  { title: 'The Bell', from: 0, to: 3 },
  { title: 'The Lantern Marches', from: 4, to: 7 },
  { title: 'The Glass Desert', from: 8, to: 11 },
  { title: 'The Hollow Sky', from: 12, to: 17 },
];
const AFTER_THE_WAR_HOLLOW = 'The sky has been answered and the road east walked to its end. What remains are the trials, and the company.';
const EPILOGUE_CAMP_HOLLOW = [
  'The lamps of the Marches burn all night, every night, and the company has stopped noticing, which Maren says is the point of lamps.',
  'Thessaly has taught Bram to climb. He is bad at it. He goes up the stair every morning anyway, to be bad at it where she can see.',
  'Oriel keeps a shard of the glass in his pack and looks into it once a day to be sure it is only him. It is only him. He checks anyway.',
  'Cassian hums. He cannot sing any more, and so he hums, and the hum is in tune, and he has made his peace with that.',
  'Ottilie: "The bell has not rung in a season."  Rowan: "Good."  Ottilie: "I miss it."  Rowan: "I know."',
  'Garret: "Four wars, five roads, a sky. Your father would have called that a start."  Rowan: "He would have. Let us not find out what comes after a sky."',
];

// ------------------------------------------------------------------ cities
/* The towns of the Marches, each held by someone who should not have it.
   `from` is the expansion chapter from which a town is on the map. */
const CITIES_HOLLOW = [
  { id: 'greywallWatch', name: 'Greywall Watch', from: 2, pos: [0.24, 0.58], map: 'greywallWatch', level: 27, gil: 3200, hireCost: 1400, forgeTier: 7,
    held: 'held by the hollowed garrison', blurb: 'The watch-town at the top of the pass, its garrison hollowed to a man and still walking the walls.',
    intro: [
      'Greywall Watch was the last town before the mountain, and the Choir came through it first. The garrison walks the walls still, with the lamps out and nothing behind their eyes.',
      '"They were my friends," Thessaly says. "Some of them. I would rather they were put down by people who did not know them."',
    ],
    enemies: [{ job: 'hollowed', name: 'Hollowed Guard' }, { job: 'hollowed', name: 'Hollowed Guard' }, { job: 'hollowHound' }, { job: 'skyLeech' }, { job: 'skyward', name: 'Hollowed Warden' }],
    outro: [
      'The last of the garrison goes down on the wall, and the town below unbars its doors for the first time in a month. The pass-wardens who were up the mountain come down to hold it properly.',
      'Greywall Watch is open. Its wardens train the skyward art, and its armoury sells the pass\'s own spears.',
    ],
    hires: ['skyward', 'dragoon', 'archer'], pets: ['hollowHound', 'wolf'], stock: ['greywallSpear', 'passCloak'],
    open: 'Lamps on the stair again, and a garrison that answers when spoken to.' },
  { id: 'wickmarket', name: 'Wickmarket', from: 5, pos: [0.40, 0.44], map: 'wickmarketTown', level: 29, gil: 3800, hireCost: 1500, forgeTier: 7,
    held: 'held by the Choir\'s cantors', blurb: 'The candle town, with the Choir in its lanes singing the chandlers hollow one street at a time.',
    intro: [
      'The square is cleared, but the Choir holds the lanes behind the candle-works, and sings through the shutters at anyone who will not come out.',
      '"Street by street," Mira says. "We take it back the same way."',
    ],
    enemies: [{ job: 'cantor', name: 'Lane Cantor' }, { job: 'cantor', name: 'Lane Cantor' }, { job: 'hollowed', name: 'Hollowed Chandler' }, { job: 'emberMoth' }, { job: 'knight', name: 'Choir Warden' }],
    outro: [
      'The last cantor is sung down by Cassian in the candle-works yard, off-key, with the chandlers joining in from the windows, and that is the end of the Choir in Wickmarket.',
      'Wickmarket is open. Its guild hires voices who have changed their tune, and its market sells what the chandlers make and never sold.',
    ],
    hires: ['cantor', 'bard', 'engineer'], pets: ['emberMoth', 'bomb'], stock: ['wickBlade', 'mothwingHat'],
    open: 'Every window lit, and the candle-works turning out something that is not a prayer.' },
  { id: 'lampholt', name: 'Lampholt', from: 8, pos: [0.56, 0.30], map: 'lampholtTown', level: 31, gil: 4400, hireCost: 1700, forgeTier: 7,
    held: 'held by the lantern wraiths', blurb: 'The lamp-keepers\' town, its keepers hollowed and their lamps keeping the rounds without them.',
    intro: [
      'Lampholt kept the lamps of the whole Marches, and when its keepers were hollowed the lamps kept on without them, and now the wraiths of a hundred dead lights walk the town\'s rounds and let nobody in.',
      '"They are only doing their work," Maren will say, when she is asked. "Somebody has to tell them it is done."',
    ],
    enemies: [{ job: 'lanternWraith' }, { job: 'lanternWraith' }, { job: 'lanternWraith' }, { job: 'hollowed', name: 'Hollowed Keeper' }, { job: 'lanternkeeper', name: 'Hollowed Keeper' }],
    outro: [
      'The last wraith goes out in the square, and the lamps of Lampholt, for the first time in a year, go dark, and then, one by one, are lit by hands.',
      'Lampholt is open. Its keepers teach the lamps, and its market sells the tomes and robes the keepers wore.',
    ],
    hires: ['lanternkeeper', 'whiteMage', 'sage'], pets: ['wisp', 'emberMoth'], stock: ['lampholtTome', 'keepersRobe'],
    open: 'A hundred lamps lit by hand every dusk, and a keeper under each one.' },
  { id: 'glassmere', name: 'Glassmere', from: 10, pos: [0.72, 0.46], map: 'glassmereTown', level: 33, gil: 5000, hireCost: 2000, forgeTier: 7,
    held: 'held by the glass thralls', blurb: 'The caravan town on the edge of the desert, its people gone to glass and its river running with reflections.',
    intro: [
      'Glassmere was where the caravans watered before the crossing, and the Mirror Queen took it for a looking-glass. Its people stand in the streets as glass, and the thralls among them still move.',
      '"Break them gently," Oriel says. "Some of them are only sleeping."',
    ],
    enemies: [{ job: 'glassblade', name: 'Glass Thrall' }, { job: 'glassblade', name: 'Glass Thrall' }, { job: 'glassStag' }, { job: 'glassStag' }, { job: 'starSpawn' }],
    outro: [
      'The thralls break, and the people who were only sleeping wake up in the street and ask what day it is, and nobody has the heart to say what year.',
      'Glassmere is open. Its smiths work the star-glass, and its market sells blades that show the foe their own face.',
    ],
    hires: ['glassblade', 'samurai', 'duelist'], pets: ['glassStag', 'griffon'], stock: ['facetKatana', 'prismShield'],
    open: 'Caravans watering again, and a town that keeps its mirrors covered after dark.' },
  { id: 'emberfall', name: 'Emberfall', from: 13, pos: [0.86, 0.24], map: 'emberfallTown', level: 36, gil: 6000, hireCost: 2400, forgeTier: 7,
    held: 'held by the Herald\'s pilgrims', blurb: 'The smiths\' town under the tower, where star-iron is worked, held by pilgrims who have stopped working anything.',
    intro: [
      'Emberfall worked the star-iron that fell with the second star, and the Herald\'s pilgrims hold its forges now, waiting for the sky with the fires out.',
      '"A forge with the fire out," Ottilie says, with real anger. "Light it. Light all of them."',
    ],
    enemies: [{ job: 'hollowed', name: 'Hollowed Smith' }, { job: 'hollowed', name: 'Hollowed Smith' }, { job: 'cantor', name: 'Herald\'s Cantor' }, { job: 'starSpawn' }, { job: 'gatewarden', name: 'Pilgrim Warden' }],
    outro: [
      'The forges are lit before the last pilgrim is down, because Ottilie would not wait, and the sound of hammers comes back to Emberfall under the tower.',
      'Emberfall is open. Its smiths work star-iron, and its market sells the best of what they make.',
    ],
    hires: ['artificer', 'fellKnight', 'dragonlord'], pets: ['golem', 'glassStag'], stock: ['emberfallAxe', 'cinderCrown'],
    open: 'Every forge lit, and star-iron on the anvils instead of in the sky.' },
];

// The Marches, drawn: sixteen stops from the foot of the Greywall to the
// top of the tower, with three answers fanned out from the summit.
const WORLD_ROUTE_HOLLOW = [
  [0.06, 0.84], [0.16, 0.70], [0.26, 0.76], [0.34, 0.62],
  [0.44, 0.56], [0.54, 0.64], [0.62, 0.52], [0.66, 0.38],
  [0.76, 0.56], [0.86, 0.62], [0.92, 0.48], [0.84, 0.38],
  [0.74, 0.26], [0.62, 0.18], [0.50, 0.24], [0.40, 0.14],
];

// What the company's new voices say over a first kill.
const FIRST_BLOOD_HOLLOW = {
  Thessaly: 'From above. It is always from above. The stair taught me that much.',
  Cassian: 'I sang that one wrong on purpose. It worked. I do not know how I feel about that.',
  Oriel: 'Forty years. I was waiting for the glass to show me this, and it never once did.',
  Maren: 'A lamp is heavier than it looks. So is the end of a lamp-pole.',
};

/* A company for a Hollow Sky begun fresh from the title: the thirteen who
   walked the first road, at the level the war left them, with the trades
   they held at its end. A finished save brings its own company instead. */
const STARTING_PARTY_HOLLOW = [
  { name: 'Rowan', job: 'paladin', level: 25, leader: true },
  { name: 'Garret', job: 'knight', level: 25 },
  { name: 'Bram', job: 'thief', level: 25 },
  { name: 'Mira', job: 'whiteMage', level: 25 },
  { name: 'Lysa', job: 'chemist', level: 25 },
  { name: 'Kael', job: 'archer', level: 25 },
  { name: 'Tamsin', job: 'inquisitor', level: 25 },
  { name: 'Ottilie', job: 'engineer', level: 25 },
  { name: 'Bastian', job: 'gunner', level: 25 },
  { name: 'Ingrid', job: 'warden', level: 25 },
  { name: 'Eirik', job: 'frostweaver', level: 25 },
  { name: 'Wren', job: 'corsair', level: 25 },
  { name: 'Ysolde', job: 'tidecaller', level: 25 },
];

/* ---------------------------------------------------------------- registry
   Every campaign the game can walk, by id. The base game is `base`; a save
   without a campaign is on it. game.js reads the road through this table
   and nothing else, so a third campaign is another entry. */
const CAMPAIGNS = {
  base: {
    id: 'base', title: 'Chronicles of Elderon',
    chapters: CAMPAIGN, roads: ROADS, roadOrder: ROAD_ORDER, acts: ACTS, choice: CHOICE,
    after: AFTER_THE_WAR, epilogue: EPILOGUE_CAMP, cities: CITIES, route: WORLD_ROUTE,
    refusers: { iron: IRON_REFUSERS },
    training: TRAINING_POOL, forkLabel: 'Five Roads', forkButton: 'Choose a Road',
    forkGoal: 'Choose a road. Each is two chapters and an ending of its own.',
    spurAngle: (k) => -Math.PI / 2 + (k - 2) * (Math.PI / 3.2),
    noTraining: ['thornwall', 'brassgate', 'starfall'],
    shopTier: null,
  },
  hollowsky: {
    id: 'hollowsky', title: 'The Hollow Sky', sub: 'An expansion for Chronicles of Elderon',
    chapters: CAMPAIGN_HOLLOW, roads: ROADS_HOLLOW, roadOrder: ROAD_ORDER_HOLLOW, acts: ACTS_HOLLOW, choice: CHOICE_HOLLOW,
    after: AFTER_THE_WAR_HOLLOW, epilogue: EPILOGUE_CAMP_HOLLOW, cities: CITIES_HOLLOW, route: WORLD_ROUTE_HOLLOW,
    refusers: {},
    training: TRAINING_POOL_HOLLOW, forkLabel: 'Three Answers', forkButton: 'Give an Answer',
    forkGoal: 'Give an answer. Each is two chapters and an ending of its own.',
    spurAngle: (k) => -Math.PI / 2 + (k - 1) * (Math.PI / 2.6),
    noTraining: ['hollowThrone', 'theSummit', 'cathedral'],
    trialTitles: ['What the Glass Kept', 'A Rumour of Lamps', 'The Choir\'s Leavings', 'Hollow Men', 'The Long Stair', 'Moths to a Flame', 'Old Songs', 'What Fell Second', 'The Lamp Walk Again', 'No Sky but Ours'],
    // The wagon is a war's wagon already: it sells its summit from the first field.
    shopTier: 7,
    party: STARTING_PARTY_HOLLOW, gil: 9000,
    blurb: 'A year after the war, the bell rings. East over the Greywall, where no road goes, the aurora stands in daylight, and a Choir that has waited four hundred years has begun to sing the sky down.',
  },
};
// The expansion's recruits have words for a first kill like anyone else.
Object.assign(FIRST_BLOOD, FIRST_BLOOD_HOLLOW);
