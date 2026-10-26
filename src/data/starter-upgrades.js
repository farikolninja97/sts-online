// Initial upgrades and encounter notes.
// A deliberately scoped fan-made prototype: 22 implemented card effects, custom enemy art.
// Only verified card effects are offered in rewards; unsupported cards in the draft catalog are not offered.
const POOL=['anger','pommel','shrug','ironwave','twin','thunder','body','armaments','truegrit','inflame','uppercut','whirlwind','flames','battletrance','offering','impervious','bludgeon','feed','fiend'];
const UP={
 strike:{dmg:9,desc:'Deal 9 damage.'},defend:{block:8,desc:'Gain 8 Block.'},bash:{dmg:10,weak:0,vuln:3,desc:'Deal 10 damage. Apply 3 Vulnerable.'},
 anger:{dmg:8,desc:'Deal 8 damage. Add a copy into your Discard Pile.'},
 pommel:{dmg:10,draw:2,desc:'Deal 10 damage. Draw 2 cards.'},shrug:{block:11,draw:1,desc:'Gain 11 Block. Draw 1 card.'},
 ironwave:{dmg:7,block:7,desc:'Gain 7 Block. Deal 7 damage.'},twin:{dmg:7,hits:2,desc:'Deal 7 damage twice.'},
 thunder:{dmg:7,desc:'Deal 7 damage and apply 1 Vulnerable to ALL enemies.'},body:{cost:0,desc:'Deal damage equal to your Block.'},
 armaments:{desc:'Gain 5 Block. Upgrade ALL cards in your Hand.'},truegrit:{block:9,desc:'Gain 9 Block. Exhaust 1 card.'},
 inflame:{strength:3,desc:'Gain 3 Strength.'},uppercut:{weak:2,vuln:2,desc:'Deal 13 damage. Apply 2 Weak and 2 Vulnerable.'},
 whirlwind:{dmg:8,desc:'Deal 8 damage to ALL enemies X times.'},flames:{block:16,flame:6,desc:'Gain 16 Block. Whenever attacked this turn, deal 6 damage back.'},
 battletrance:{draw:4,desc:'Draw 4 cards. Cannot draw more cards this turn.'},
 offering:{draw:5,desc:'Lose 6 HP. Gain 2 Energy. Draw 5 cards. Exhaust.'},impervious:{block:40,desc:'Gain 40 Block. Exhaust.'},
 bludgeon:{dmg:42,desc:'Deal 42 damage.'},feed:{dmg:12,feed:4,desc:'Deal 12 damage. If Fatal, gain 4 Max HP. Exhaust.'},
 fiend:{dmg:10,desc:'Exhaust your Hand. Deal 10 damage for each card Exhausted. Exhaust.'}
};
const HELPFUL={mite:'Opens with Shrink, then alternates attacks.',marauder:'Alternates between a hit and Strength gain.',archer:'Reloads, then fires.',axe:'Two guarded swings followed by a heavy strike.',acolyte:'Ritual first, then attacks as Strength grows.',feeder:'One light hit, +15 Strength, then heavy hits.',whelp:'Attacks and blocks every turn.',silk:'Weak, then a double strike.',vine:'A predictable three-hit cycle.',stone:'Fully blocking its attack stuns its next turn.',sentinel:'Sleeps, gains +10 Strength, then repeatedly attacks.'};
// Correct a late-beta damage change relative to the initial draft.
CARDS.hemo.dmg=15;CARDS.hemo.desc='Lose 2 HP. Deal 15 damage.';
// One premium menu of only tested cards. Fiend Fire, True Grit and Armaments handle selection by a small dialog.
const DIFFICULTY_SET=[false,true];
