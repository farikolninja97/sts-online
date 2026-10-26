/* Ember Descent V1.18 — Expanded Encounters, Elites, and Bosses.
 * These are ORIGINAL fantasy adversaries, NOT official STS2 enemies/stat blocks.
 * Uses the existing battle resolver, save key, relics and Ancient boons.
 */
'use strict';
const ENCOUNTERS_V118={
 // Act 1 regulars
 sootling:{name:'Soot Skitter',hp:27,art:'mite',act:1,moves:[{n:'Cinder Nip',kind:'attack',dmg:6},{n:'Kick Up Ash',kind:'debuff',weak:1},{n:'Scorching Lunge',kind:'attack',dmg:10}]},
 briarhound:{name:'Briar Hound',hp:38,art:'vine',act:1,moves:[{n:'Thorn Bite',kind:'attack',dmg:9},{n:'Snarling Guard',kind:'buff',block:9},{n:'Twin Fang',kind:'attack',dmg:5,hits:2}]},
 ember_shield:{name:'Ember Shieldbearer',hp:46,art:'axe',act:1,moves:[{n:'Rim Strike',kind:'attack',dmg:7,block:6},{n:'Brace',kind:'buff',block:14},{n:'Shield Rush',kind:'attack',dmg:14}]},
 lantern_wisp:{name:'Lantern Wisp',hp:31,art:'silk',act:1,moves:[{n:'Flicker',kind:'buff',strength:2},{n:'Ghostlight',kind:'attack',dmg:9},{n:'Seared Vision',kind:'debuff',vulnerable:1}]},
 moss_hermit:{name:'Moss Hermit',hp:51,art:'acolyte',act:1,moves:[{n:'Tending Roots',kind:'buff',heal:9},{n:'Snare',kind:'debuff',frail:1},{n:'Root Staff',kind:'attack',dmg:11}]},
 ash_howler:{name:'Ash Howler',hp:57,art:'marauder',act:1,moves:[{n:'Howl',kind:'buff',strength:2},{n:'Two Claws',kind:'attack',dmg:6,hits:2},{n:'Rend',kind:'attack',dmg:17}]},
 // Act 2 regulars
 shardspider:{name:'Shard Spider',hp:40,art:'silk',act:2,moves:[{n:'Glass Thread',kind:'debuff',weak:1,status:'dazed'},{n:'Skewer',kind:'attack',dmg:6,hits:2},{n:'Snap Jaw',kind:'attack',dmg:14}]},
 echo_mage:{name:'Echo Mage',hp:46,art:'acolyte',act:2,moves:[{n:'Reflecting Ward',kind:'buff',block:12,artifact:1},{n:'Echo Bolt',kind:'attack',dmg:13},{n:'Refracted Beam',kind:'attack',dmg:7,hits:2}]},
 ore_golem:{name:'Ore Golem',hp:72,art:'stone',act:2,moves:[{n:'Ore Plating',kind:'buff',block:17},{n:'Iron Fist',kind:'attack',dmg:18},{n:'Hammering',kind:'attack',dmg:8,hits:2}]},
 hollow_monk:{name:'Hollow Monk',hp:54,art:'acolyte',act:2,moves:[{n:'Chant of Dust',kind:'buff',strength:3},{n:'Dust Palm',kind:'attack',dmg:11},{n:'Fading Curse',kind:'debuff',frail:2}]},
 mist_thief:{name:'Mist Thief',hp:49,art:'archer',act:2,moves:[{n:'Vanish',kind:'buff',block:14},{n:'Sneak Cut',kind:'attack',dmg:15},{n:'Dirty Trick',kind:'debuff',vulnerable:1}]},
 molten_guard:{name:'Molten Guard',hp:82,art:'axe',act:2,moves:[{n:'Heatshield',kind:'buff',block:20},{n:'Heated Blade',kind:'attack',dmg:14,status:'burn'},{n:'Smelt',kind:'buff',strength:3}]},
 // Act 3 regulars
 crown_wraith:{name:'Crown Wraith',hp:76,art:'silk',act:3,moves:[{n:'Royal Hex',kind:'debuff',vulnerable:1,weak:1},{n:'Soul Rake',kind:'attack',dmg:16},{n:'Dusk Swarm',kind:'attack',dmg:8,hits:3}]},
 bone_harbinger:{name:'Bone Harbinger',hp:94,art:'marauder',act:3,moves:[{n:'Bone Rattle',kind:'buff',strength:3},{n:'Marrow Crush',kind:'attack',dmg:21},{n:'Splinter Flurry',kind:'attack',dmg:9,hits:2}]},
 star_devourer:{name:'Star Devourer',hp:71,art:'feeder',act:3,moves:[{n:'Drain Light',kind:'attack',dmg:14,heal:7},{n:'Consume Sparks',kind:'buff',strength:3},{n:'Solar Tear',kind:'attack',dmg:10,hits:2}]},
 ruin_keeper:{name:'Ruin Keeper',hp:104,art:'sentinel',act:3,moves:[{n:'Ancient Ward',kind:'buff',block:24,artifact:1},{n:'Gatebreaker',kind:'attack',dmg:22},{n:'Tumbling Pillars',kind:'attack',dmg:13,hits:2}]},
 dusk_collector:{name:'Dusk Collector',hp:88,art:'archer',act:3,moves:[{n:'Collect Toll',kind:'debuff',frail:2,status:'wound'},{n:'Black Arrow',kind:'attack',dmg:19},{n:'Repeating Volley',kind:'attack',dmg:8,hits:3}]},
 void_scribe:{name:'Void Scribe',hp:89,art:'acolyte',act:3,moves:[{n:'Seal the Page',kind:'debuff',weak:2,status:'dazed',statusCount:2},{n:'Inked Lance',kind:'attack',dmg:21},{n:'Reinforce Sigil',kind:'buff',block:18,artifact:1}]},
 // Act-based elites
 crimson_binder:{name:'Crimson Binder',hp:91,art:'acolyte',act:1,elite:true,moves:[{n:'Bind the Flame',kind:'debuff',frail:2,status:'wound'},{n:'Searing Chain',kind:'attack',dmg:12},{n:'Branding Sigil',kind:'buff',strength:3},{n:'Hooked Lash',kind:'attack',dmg:7,hits:2}]},
 thorn_executioner:{name:'Thorn Executioner',hp:108,art:'vine',act:1,elite:true,moves:[{n:'Planted Feet',kind:'buff',block:16},{n:'Briar Cleave',kind:'attack',dmg:18},{n:'Thorn Storm',kind:'attack',dmg:6,hits:3},{n:'Gather Rage',kind:'buff',strength:3}]},
 prism_jailor:{name:'Prism Jailor',hp:125,art:'stone',act:2,elite:true,moves:[{n:'Crystal Cage',kind:'debuff',weak:1,frail:1,status:'dazed'},{n:'Prism Breaker',kind:'attack',dmg:20},{n:'Reflect',kind:'buff',block:20,artifact:1},{n:'Facet Strike',kind:'attack',dmg:9,hits:2}]},
 cinder_duelist:{name:'Cinder Duelist',hp:112,art:'marauder',act:2,elite:true,moves:[{n:'Flourish',kind:'buff',strength:3},{n:'Twin Blades',kind:'attack',dmg:8,hits:2},{n:'Flaming Riposte',kind:'attack',dmg:18,status:'burn'},{n:'Recover',kind:'buff',block:18}]},
 crystal_sentinel:{name:'Crystal Sentinel',hp:136,art:'sentinel',act:2,elite:true,moves:[{n:'Facet Armor',kind:'buff',block:21,artifact:1},{n:'Gem Lance',kind:'attack',dmg:22},{n:'Splinter Rain',kind:'attack',dmg:8,hits:3}]},
 void_arbiter:{name:'Void Arbiter',hp:154,art:'acolyte',act:3,elite:true,moves:[{n:'Sentence',kind:'debuff',vulnerable:2,status:'dazed'},{n:'Verdict',kind:'attack',dmg:23},{n:'Dismiss',kind:'buff',block:25},{n:'Seal',kind:'attack',dmg:11,hits:2}]},
 grave_marshal:{name:'Grave Marshal',hp:153,art:'axe',act:3,elite:true,moves:[{n:'Rally Ash',kind:'buff',strength:3,summon:'sootling'},{n:'Marching Blows',kind:'attack',dmg:10,hits:2},{n:'Death Knell',kind:'attack',dmg:27}]},
 astral_harvester:{name:'Astral Harvester',hp:168,art:'archer',act:3,elite:true,moves:[{n:'Skyward Aim',kind:'buff',strength:4},{n:'Meteor Arrow',kind:'attack',dmg:25},{n:'Starfall',kind:'attack',dmg:10,hits:3},{n:'Glittering Shield',kind:'buff',block:19}]},
 // Alternate original bosses for each act. Unique half-HP transition + new rotation.
 ashen_monarch:{name:'Ashen Monarch',hp:165,art:'sentinel',act:1,boss:true,phaseBuff:3,moves:[{n:'Call the Cinders',kind:'buff',summon:'sootling',block:9},{n:'Ember Scepter',kind:'attack',dmg:13},{n:'Royal Decree',kind:'debuff',vulnerable:1}],enragedMoves:[{n:'Blazing Decree',kind:'attack',dmg:12,hits:2},{n:'Cinder Court',kind:'buff',summon:'lantern_wisp',strength:2},{n:'Royal Collapse',kind:'attack',dmg:25}]},
 rootmaw:{name:'Rootmaw the Ancient',hp:179,art:'vine',act:1,boss:true,phaseBuff:3,moves:[{n:'Entangling Roots',kind:'debuff',weak:1,frail:1},{n:'Buried Fangs',kind:'attack',dmg:15},{n:'Root Mending',kind:'buff',heal:12,block:8}],enragedMoves:[{n:'Razor Canopy',kind:'attack',dmg:8,hits:3},{n:'Ravenous Roots',kind:'attack',dmg:20,status:'wound'},{n:'Surging Sap',kind:'buff',heal:12,strength:2}]},
 shard_matriarch:{name:'Shard Matriarch',hp:208,art:'silk',act:2,boss:true,phaseBuff:4,moves:[{n:'Brood Chamber',kind:'buff',summon:'shardspider',block:12},{n:'Glass Needle',kind:'attack',dmg:18},{n:'Web of Doubt',kind:'debuff',weak:2,status:'dazed'}],enragedMoves:[{n:'Crystal Rain',kind:'attack',dmg:9,hits:3},{n:'Brood Call',kind:'buff',summon:'shardspider',strength:2},{n:'Shatter',kind:'attack',dmg:25}]},
 forge_tyrant:{name:'Forge Tyrant',hp:226,art:'stone',act:2,boss:true,phaseBuff:4,moves:[{n:'Kindle Furnace',kind:'buff',strength:3,block:12},{n:'Hammer of Embers',kind:'attack',dmg:21,status:'burn'},{n:'Bellows',kind:'debuff',frail:2}],enragedMoves:[{n:'Molten Strikes',kind:'attack',dmg:12,hits:2,status:'burn'},{n:'Tempered Armor',kind:'buff',block:28,artifact:1},{n:'Final Hammer',kind:'attack',dmg:30}]},
 hollow_regent:{name:'Hollow Regent',hp:263,art:'sentinel',act:3,boss:true,phaseBuff:5,moves:[{n:'Sovereign Ward',kind:'buff',block:24,artifact:1},{n:'Spectral Edict',kind:'debuff',vulnerable:1,frail:1,status:'wound'},{n:'Regal Slam',kind:'attack',dmg:27}],enragedMoves:[{n:'Thronebreaker',kind:'attack',dmg:15,hits:2},{n:'Raise the Court',kind:'buff',summon:'crown_wraith',block:15},{n:'Crownfall',kind:'attack',dmg:34}]},
 eclipse_engine:{name:'Eclipse Engine',hp:279,art:'stone',act:3,boss:true,phaseBuff:5,moves:[{n:'Charge the Core',kind:'buff',strength:4},{n:'Dark Pulse',kind:'attack',dmg:12,hits:2},{n:'Dead Star',kind:'debuff',weak:2,status:'dazed',statusCount:2}],enragedMoves:[{n:'Solar Flare',kind:'attack',dmg:11,hits:3},{n:'Core Repair',kind:'buff',heal:16,block:24},{n:'Total Eclipse',kind:'attack',dmg:36}]}
};
Object.assign(ENEMIES,ENCOUNTERS_V118);
const E118_GROUPS={
 1:{early:[
  ['sootling'],['briarhound'],['lantern_wisp'],['emberling'],['mite','sootling'],['archer','sootling'],['marauder'],['ember_shield']],
 mid:[['briarhound','sootling'],['ember_shield','lantern_wisp'],['moss_hermit'],['ash_howler'],['marauder','ash_howler'],['briarhound','archer'],['knuckle','ember_shield'],['thicket']],
 late:[['moss_hermit','briarhound'],['ash_howler','lantern_wisp'],['ember_shield','archer'],['moss_hermit','sootling','sootling'],['thicket','briarhound'],['ash_howler','marauder'],['knuckle','moss_hermit'],['ember_shield','ash_howler']]},
 2:{early:[['shardspider'],['echo_mage'],['mist_thief'],['glasswing'],['shardspider','whelp'],['hollow_monk'],['ore_golem'],['feeder']],
 mid:[['shardspider','echo_mage'],['ore_golem','mist_thief'],['hollow_monk','glasswing'],['molten_guard'],['shellguard','mist_thief'],['glasswing','shardspider'],['duskseer','hollow_monk'],['molten_guard','whelp']],
 late:[['ore_golem','shardspider'],['molten_guard','echo_mage'],['mist_thief','hollow_monk'],['shellguard','ore_golem'],['echo_mage','shardspider','whelp'],['duskseer','molten_guard'],['ore_golem','glasswing'],['molten_guard','shardspider']]},
 3:{early:[['crown_wraith'],['bone_harbinger'],['star_devourer'],['void_scribe'],['voidclaw'],['ruin_keeper'],['astral'],['dusk_collector']],
 mid:[['star_devourer','crown_wraith'],['ruin_keeper','void_scribe'],['bone_harbinger','dusk_collector'],['basalt'],['voidclaw','crown_wraith'],['astral','star_devourer'],['vine','dusk_collector'],['void_scribe','star_devourer']],
 late:[['ruin_keeper','crown_wraith'],['bone_harbinger','star_devourer'],['void_scribe','dusk_collector'],['basalt','star_devourer'],['ruin_keeper','bone_harbinger'],['crown_wraith','dusk_collector'],['voidclaw','void_scribe'],['bone_harbinger','crown_wraith','dusk_collector']]}
};
const E118_ELITES={1:['sentinel','crimson_binder','thorn_executioner'],2:['prism_jailor','cinder_duelist','crystal_sentinel'],3:['void_arbiter','grave_marshal','astral_harvester']};
const E118_BOSSES={1:['ashen_monarch','rootmaw'],2:['shard_matriarch','forge_tyrant'],3:['hollow_regent','eclipse_engine']};
function e118ChooseGroup(kind){
 const act=Number(S.act)||1, depth=Number(S.floor)||1;
 const band=depth<=5?'early':depth<=10?'mid':'late';
 const formations=kind==='normal'?E118_GROUPS[act][band].map(enemies=>({enemies,band})):
  (kind==='elite'?E118_ELITES[act]:E118_BOSSES[act]).map(key=>({enemies:[key],band:kind}));
 S.encounterHistory??=[];
 const recent=S.encounterHistory.filter(x=>x.act===act&&x.kind===kind).slice(-3).map(x=>x.id);
 let options=formations.filter(f=>!recent.includes(f.enemies.join('+')));
 if(!options.length)options=formations;
 const selected=choice(options);
 S.encounterHistory.push({act,kind,id:selected.enemies.join('+')});
 if(S.encounterHistory.length>30)S.encounterHistory=S.encounterHistory.slice(-30);
 return selected;
}
// Replace encounter content inside the old starter function BEFORE relics/Neow
// execute their 'on battle start' triggers. This keeps their effects on the real foes.
const e118LegacyBattle=legacyStartBattle;
legacyStartBattle=function(kind){
 e118LegacyBattle(kind);
 if(!['normal','elite','boss'].includes(kind))return;
 const encounter=e118ChooseGroup(kind);
 S.enemies=encounter.enemies.map((key,i)=>makeEnemy(key,i));
 S.target=0;
 S.encounterTitle=(kind==='boss'?'Act '+S.act+' Guardian':kind==='elite'?'Elite Ambush':
  encounter.band==='early'?'Opening Patrol':encounter.band==='mid'?'Deepening Peril':'Last Stand');
 S.log=[`${S.encounterTitle}: ${S.enemies.map(e=>e.name).join(' + ')}`];
};
// Preserve generic card/buff logic, overriding only the new phase-specific moves.
const e118MoveFor=moveFor;
moveFor=function(e){
 if(e.stunned)return e118MoveFor(e);
 const data=ENEMIES[e.key];
 if(!data?.boss)return e118MoveFor(e);
 if(!e.phase2&&e.hp>0&&e.hp<=Math.floor(e.maxHP*.5))return {n:'Awakening Fury',kind:'buff',phaseShift:true,phaseStrength:data.phaseBuff||3,block:12,artifact:1};
 if(e.phase2)return data.enragedMoves[e.step%data.enragedMoves.length];
 return e118MoveFor(e);
};
// Called from enemy-turn resolver after standard move effects. Summons do NOT
// act the turn they enter; enemy turn iterates a beginning-of-turn snapshot.
function ed118ResolveEnemyMove(e,m){
 if(!e||e.hp<=0||!m)return;
 if(m.phaseShift){e.phase2=true;e.strength+=(m.phaseStrength||0);log(`${e.name} enters Phase II! +${m.phaseStrength||0} Strength`);queueFX(e.id,m.phaseStrength||0,'buff')}
 if(m.artifact){e.artifact=(e.artifact||0)+m.artifact;log(`${e.name} gained ${m.artifact} Artifact`)}
 if(m.heal){const recovered=Math.min(m.heal,e.maxHP-e.hp);e.hp+=recovered;if(recovered){log(`${e.name} healed ${recovered} HP`);queueFX(e.id,recovered,'buff')}}
 if(m.summon){
  const canEnter=alive().length<3&&S.enemies.length<9&&!!ENEMIES[m.summon];
  if(canEnter){const nextId=Math.max(-1,...S.enemies.map(x=>Number(x.id)||0))+1;const minion=makeEnemy(m.summon,nextId);S.enemies.push(minion);log(`${e.name} summoned ${minion.name}`);combatEvent('summon',{enemy:minion.key});}
  else log(`${e.name}'s call finds no room for reinforcements`);
 }
}
// Distinct original creature visuals from the original vector base (no game art copied).
// Regular mobs gain subtle palette variants; elites and bosses get a bespoke crest.
const e118SpriteBase=sprite;
sprite=function(kind){
 const data=ENCOUNTERS_V118[kind];if(!data)return e118SpriteBase(kind);
 let original=e118SpriteBase(data.art),hash=[...kind].reduce((n,c)=>n+c.charCodeAt(0),0);
 const hue=(hash*11)%90-45,sat=data.boss?1.15:1.03;
 original=original.replace('role="img"',`role="img" data-variant="${kind}"`);
 original=original.replace('<ellipse cx="105"',`<ellipse cx="105"`);
 // Wrap creature graphic apart from shadow to tint one foe without altering others.
 const pos=original.indexOf('/>')+2;
 const shadow=original.slice(0,pos),figure=original.slice(pos,-6);
 const sigil=data.boss?'<g opacity=".95"><path d="M69 36L77 3L98 28L110 0L125 28L147 3L156 37" fill="none" stroke="#f8ca65" stroke-width="7" stroke-linejoin="round"/><circle cx="110" cy="15" r="6" fill="#fff2bd"/></g>':
  data.elite?'<path d="M58 47L32 17M164 47L190 17" stroke="#f7a572" stroke-width="8" stroke-linecap="round"/>':'';
 return `${shadow}<g style="filter:hue-rotate(${hue}deg) saturate(${sat})">${figure}</g>${sigil}</svg>`;
};
const e118MakeEnemyBase=makeEnemy;
makeEnemy=function(key,id){let enemy=e118MakeEnemyBase(key,id);if(ENCOUNTERS_V118[key])enemy.art=key;return enemy};
const e118BattlePage=battleScreen;
battleScreen=function(){
 let html=e118BattlePage();if(!S?.enemies?.length)return html;
 const boss=alive().find(e=>ENEMIES[e.key]?.boss);
 const phase=boss?` <span class="ed118-phase-inline">${boss.phase2?'· Phase II':boss.hp<=boss.maxHP/2?'· Phase shift':'· Phase I'}</span>`:'';
 const title=escapeHTML(S.encounterTitle||S.room||'Encounter');
 // Keep the original FOUR combat grid rows; extra rows break iPhone hand controls.
 html=html.replace(/(<div class="room-name">)[^<]*/,`$1${title}${phase} `);
 if(boss){const marker=`data-enemy="${boss.id}"`;html=html.replace(marker,marker+` data-boss-phase="${boss.phase2?'2':'1'}"`)}
 const button='<button type="button" class="ed118-intel-button" data-v118-intel="true" aria-label="Inspect enemy moves">Intel ⓘ</button>';
 html=html.replace('<button class="litebtn combat-guide"',button+'<button class="litebtn combat-guide"');
 return html;
};
const e118ModalBase=modalHTML;
modalHTML=function(){
 if(modal?.type!=='enemy-intel')return e118ModalBase();
 const rows=alive().map(enemy=>{
  const d=ENEMIES[enemy.key],phase=d.boss&&enemy.phase2,planned=moveFor(enemy);
  const moves=[...d.moves,...(d.enragedMoves||[])];
  return `<section class="ed118-intel-unit"><h3>${escapeHTML(enemy.name)} <span>${d.boss?'BOSS':d.elite?'ELITE':'FOE'}</span></h3>
    <p>${enemy.hp}/${enemy.maxHP} HP · ${enemy.block} Block${phase?' · Enraged':''}</p>
    <p><b>Next: ${escapeHTML(planned.n)}</b> — ${planned.kind==='attack'?`${adjustedEnemyDamage(enemy,planned)} damage${planned.hits>1?' × '+planned.hits:''}`:escapeHTML(planned.kind)}</p>
    <div class="ed118-move-list">${moves.map(m=>`<div><strong>${escapeHTML(m.n)}</strong><small>${m.kind==='attack'?`${m.dmg} base damage${m.hits>1?' × '+m.hits:''}`:m.kind==='debuff'?'Applies debuffs':m.kind==='buff'?'Gains an advantage':'Waits'}${m.heal?`, heals ${m.heal}`:''}${m.summon?', summons an ally':''}${m.status?`, adds ${escapeHTML(m.status)}`:''}</small></div>`).join('')}</div></section>`
 }).join('');
 return `<div class="overlay" data-outside="true"><section class="modal ed118-intel-modal" role="dialog" aria-modal="true" aria-label="Enemy Intel"><button class="litebtn close" data-action="close" aria-label="Close dialog">✕</button><h2>Encounter Intel</h2><p class="note">Move patterns in this prototype are deterministic; buffs and debuffs change the displayed predictions. Half-health bosses have a second phase.</p>${rows}</section></div>`;
};
document.addEventListener('click',event=>{const btn=event.target.closest('[data-v118-intel]');if(!btn||S?.screen!=='battle')return;
 event.preventDefault();event.stopImmediatePropagation();if(busy)return;modal={type:'enemy-intel'};render();},true);
