// Enemy definitions and patterns.
// Enemy IDs and artwork are original. Move sequences and base numbers below model documented STS2 enemies.
const ENEMIES={
 mite:{name:'Gloom Mite',src:'Shrinker Beetle',hp:39,art:'mite',act:1,moves:[{n:'Warping Dust',kind:'debuff',shrink:true},{n:'Chomp',kind:'attack',dmg:7},{n:'Stomp',kind:'attack',dmg:13}]},
 marauder:{name:'Ashbound Marauder',src:'Brute Raider',hp:32,art:'marauder',act:1,moves:[{n:'Crush',kind:'attack',dmg:7},{n:'War Chant',kind:'buff',strength:3}]},
 archer:{name:'Thorn Ranger',src:'Crossbow Raider',hp:21,art:'archer',act:1,moves:[{n:'Reload',kind:'buff',block:3},{n:'Piercing Bolt',kind:'attack',dmg:14}]},
 axe:{name:'Bronze Reaver',src:'Axe Raider',hp:22,art:'axe',act:1,moves:[{n:'Guarded Swing',kind:'attack',dmg:5,block:5},{n:'Guarded Swing',kind:'attack',dmg:5,block:5},{n:'Overhead Smash',kind:'attack',dmg:12}]},
 acolyte:{name:'Cinder Acolyte',src:'Calcified Cultist',hp:41,art:'acolyte',act:2,moves:[{n:'Incantation',kind:'buff',ritual:2},{n:'Dark Strike',kind:'attack',dmg:9}]},
 feeder:{name:'Ember Feeder',src:'Bowlbug (Nectar)',hp:38,art:'feeder',act:2,moves:[{n:'Thrash',kind:'attack',dmg:3},{n:'Absorb Heat',kind:'buff',strength:15},{n:'Thrash',kind:'attack',dmg:3}]},
 whelp:{name:'Shell Whelp',src:'Bowlbug (Egg)',hp:22,art:'whelp',act:2,moves:[{n:'Bite',kind:'attack',dmg:7,block:7}]},
 silk:{name:'Silk Phantom',src:'Bowlbug (Silk)',hp:42,art:'silk',act:2,moves:[{n:'Binding Web',kind:'debuff',weak:1},{n:'Thrash',kind:'attack',dmg:4,hits:2}]},
 vine:{name:'Hollowvine',src:'Vine Shambler',hp:61,art:'vine',act:3,moves:[{n:'Vine Swipe',kind:'attack',dmg:6,hits:2},{n:'Grasp',kind:'attack',dmg:8,tangled:1},{n:'Gorge',kind:'attack',dmg:16}]},
 stone:{name:'Stoneback Colossus',src:'Bowlbug (Rock)',hp:48,art:'stone',act:3,moves:[{n:'Headbutt',kind:'attack',dmg:15}]},
 sentinel:{name:'Forgotten Sentinel',src:'Bygone Effigy',hp:127,art:'sentinel',act:1,elite:true,moves:[{n:'Dormant',kind:'sleep'},{n:'Awaken',kind:'buff',strength:10},{n:'Stone Slash',kind:'attack',dmg:13,ascDmg:15}]},
};
