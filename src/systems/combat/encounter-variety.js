// Custom opponent data and act-based encounter selection; original sprites and names.
'use strict';
// Additional original opponents with attack/debuff/buff cycles supported by the combat engine.
Object.assign(ENEMIES,{
 emberling:{name:'Copper Emberling',hp:25,art:'mite',act:1,moves:[{n:'Spark Bite',kind:'attack',dmg:6},{n:'Harden Carapace',kind:'buff',block:8},{n:'Double Nip',kind:'attack',dmg:4,hits:2}]},
 thicket:{name:'Briar Matron',hp:54,art:'vine',act:1,moves:[{n:'Tangle Roots',kind:'debuff',weak:2},{n:'Needle Volley',kind:'attack',dmg:5,hits:3},{n:'Thorn Slam',kind:'attack',dmg:15}]},
 knuckle:{name:'Iron Knuckler',hp:40,art:'axe',act:1,moves:[{n:'Wind Up',kind:'buff',strength:2},{n:'Hammerfall',kind:'attack',dmg:13},{n:'Shield Tap',kind:'attack',dmg:5,block:7}]},
 duskseer:{name:'Dusk Seer',hp:48,art:'acolyte',act:2,moves:[{n:'Ominous Hex',kind:'debuff',vulnerable:2},{n:'Twin Curse',kind:'attack',dmg:7,hits:2},{n:'Meditate',kind:'buff',strength:3}]},
 glasswing:{name:'Glasswing',hp:36,art:'silk',act:2,moves:[{n:'Mirror Guard',kind:'buff',block:12},{n:'Shard Burst',kind:'attack',dmg:5,hits:3},{n:'Wind Cut',kind:'attack',dmg:11}]},
 shellguard:{name:'Shell Guard',hp:63,art:'whelp',act:2,moves:[{n:'Brace',kind:'buff',block:15},{n:'Shell Crush',kind:'attack',dmg:18},{n:'Bite',kind:'attack',dmg:9}]},
 voidclaw:{name:'Voidclaw',hp:75,art:'marauder',act:3,moves:[{n:'Life Drain',kind:'attack',dmg:12},{n:'Sunder',kind:'debuff',frail:2},{n:'Rip Apart',kind:'attack',dmg:8,hits:2}]},
 astral:{name:'Astral Watcher',hp:83,art:'archer',act:3,moves:[{n:'Warp Arrow',kind:'attack',dmg:18},{n:'Snare',kind:'debuff',weak:2},{n:'Rapid Volley',kind:'attack',dmg:7,hits:3}]},
 basalt:{name:'Basalt Titan',hp:100,art:'stone',act:3,moves:[{n:'Bulwark',kind:'buff',block:22},{n:'Stonefall',kind:'attack',dmg:23},{n:'Quake',kind:'attack',dmg:10,hits:2}]}
});
const edLegacyBattle=legacyStartBattle;
legacyStartBattle=function(type){edLegacyBattle(type);if(type!=='normal')return;
 const groups={1:[['mite'],['emberling'],['thicket'],['knuckle'],['emberling','archer'],['thicket','marauder'],['axe','knuckle']],2:[['feeder'],['duskseer'],['glasswing'],['shellguard'],['glasswing','whelp'],['acolyte','duskseer'],['feeder','shellguard']],3:[['vine'],['voidclaw'],['astral'],['basalt'],['voidclaw','silk'],['astral','stone'],['basalt','whelp']]};
 const options=groups[S.act]||groups[1];const group=choice(options);S.enemies=group.map(makeEnemy);S.target=0;S.log=[`Encounter: ${S.enemies.map(e=>e.name).join(' + ')}`];
};
