/* Ember Descent V1.19: conditional boss AI, per-boss mechanics, attack telegraphs.
   Original creatures/rules for the prototype. Maintains the V1.18 save format. */
'use strict';
const ED119_REACTIONS={
 ashen_monarch:{name:'Royal Retaliation',when:'Two Attacks in one turn',move:{n:'Royal Retaliation',kind:'attack',dmg:9,hits:2,signal:'The king punishes a flurry of strikes',reaction:'attacks'}},
 rootmaw:{name:'Crushing Vines',when:'18+ player Block',move:{n:'Crushing Vines',kind:'debuff',frail:2,tangled:1,signal:'A binding vine targets your defenses',reaction:'block'}},
 shard_matriarch:{name:'Spinning Prison',when:'Two Skills in one turn',move:{n:'Spinning Prison',kind:'debuff',weak:1,status:'dazed',statusCount:2,signal:'Silk traps the cards you played',reaction:'skills'}},
 forge_tyrant:{name:'Backblast',when:'Three Attacks in one turn',move:{n:'Backblast',kind:'attack',dmg:12,status:'burn',statusCount:2,signal:'The forge overheats from repeated blows',reaction:'attacks'}},
 hollow_regent:{name:'Edict of Dust',when:'18+ player Block',move:{n:'Edict of Dust',kind:'debuff',frail:2,vulnerable:1,signal:'The regent curses your fortifications',reaction:'block'}},
 eclipse_engine:{name:'Core Vent',when:'Two Vulnerable or Weak on boss',move:{n:'Core Vent',kind:'buff',block:12,heal:4,vent:true,signal:'Debuffs destabilize the core and cancel charging',reaction:'debuff'}}
};
const ED119_EXTRA={
 crimson_binder:{n:'Seal of Silence',kind:'debuff',weak:1,status:'dazed',statusCount:1,reaction:'power',signal:'A ritual counters your active Powers'},
 thorn_executioner:{n:'Briar Snare',kind:'debuff',frail:2,reaction:'block',signal:'Spines constrict a fortified target'},
 prism_jailor:{n:'Refraction',kind:'buff',block:16,artifact:1,reaction:'skills',signal:'A barrier forms against your Skills'},
 grave_marshal:{n:'Muster the Fallen',kind:'buff',summon:'sootling',block:8,reaction:'alone',signal:'The marshal calls a fresh ally'},
 mist_thief:{n:'Smoke Break',kind:'buff',block:13,reaction:'exposed',signal:'The exposed thief retreats into smoke'}
};
function ed119Context(){
 if(S?.turnPhase==='enemy'&&S.enemyResponse?.turn===S.turn)return S.enemyResponse;
 const played=(S?.combatEvents||[]).filter(ev=>ev.turn===S.turn&&ev.event==='card-played');
 return {turn:S?.turn||1,attacks:S?.attacksPlayed||0,skills:played.filter(ev=>CARDS[ev.card]?.type==='Skill').length,
  cards:S?.cardsPlayed||0,block:S?.block||0,powers:Object.values(S?.powers||{}).filter(v=>typeof v==='number'&&v>0).length};
}
function ed119BeforeEnemyPhase(){S.enemyResponse=ed119Context();S.enemyResponse.turn=S.turn;}
function ed119ReactionReady(e){return !e.stunned&&!e.phaseShifted &&(e.nextReactionTurn||0)<=S.turn}
function ed119MayReact(e,m,ctx){
 if(!ed119ReactionReady(e))return false;
 if(e.key==='ashen_monarch')return e.phase2&&ctx.attacks>=2&&alive().length<=2;
 if(e.key==='rootmaw')return ctx.block>=18;
 if(e.key==='shard_matriarch')return ctx.skills>=2;
 if(e.key==='forge_tyrant')return ctx.attacks>=3;
 if(e.key==='hollow_regent')return ctx.block>=18;
 if(e.key==='eclipse_engine')return e.phase2&&(e.vulnerable>=2||e.weak>=2)&&e.coreCharge>0;
 if(e.key==='crimson_binder')return ctx.powers>=2;
 if(e.key==='thorn_executioner')return ctx.block>=20;
 if(e.key==='prism_jailor')return ctx.skills>=2;
 if(e.key==='grave_marshal')return alive().length===1&&e.step>=1;
 if(e.key==='mist_thief')return e.vulnerable>=2;
 return false;
}
const ed119PreviousMoveFor=moveFor;
moveFor=function(e){
 const original=ed119PreviousMoveFor(e);
 if(!e||e.hp<=0||e.stunned||original.phaseShift)return original;
 const ctx=ed119Context();
 if(e.key==='forge_tyrant'&&ed119ReactionReady(e)&&e.step>=1&&ownsRelic('bronze_scales')&&e.hp<=e.maxHP*.75&&ctx.attacks<3)
  return {n:'Temper the Spikes',kind:'buff',block:18,artifact:1,reaction:'relic',signal:'Your Bronze Scales provoke a defensive countermeasure'};
 const entry=ED119_REACTIONS[e.key];
 if(entry&&ed119MayReact(e,original,ctx))return {...entry.move};
 if(ED119_EXTRA[e.key]&&ed119MayReact(e,original,ctx))return {...ED119_EXTRA[e.key]};
 // The Eclipse Engine now broadcasts its attack a full turn before it lands.
 if(e.key==='eclipse_engine'&&e.phase2){
  if(e.coreCharge>0)return {n:'Annihilation Beam',kind:'attack',dmg:19+(e.coreCharge*5),hits:2,coreRelease:true,signal:'Charged core: a two-hit beam is imminent'};
  return {n:'Charge the Eclipse',kind:'buff',block:14,coreCharge:1,signal:'The core charges. Next enemy turn: a powerful beam'};
 }
 return original;
};
function ed119ResolveEnemyMove(e,m){
 if(!e||e.hp<=0||!m)return;
 if(m.phaseShift){
  if(e.key==='ashen_monarch'||e.key==='shard_matriarch'||e.key==='hollow_regent'){
   const minion={ashen_monarch:'sootling',shard_matriarch:'shardspider',hollow_regent:'crown_wraith'}[e.key];
   if(alive().length<3&&S.enemies.length<9){let id=Math.max(-1,...S.enemies.map(x=>+x.id||0))+1;S.enemies.push(makeEnemy(minion,id));log(e.name+' rallies '+ENEMIES[minion].name+' for Phase II');}
  }
  if(e.key==='rootmaw'){e.spineWard=2;log('Rootmaw sprouts thorns: attacks against it retaliate for 2 HP');}
  if(e.key==='forge_tyrant'){e.block+=12;log('Forge Tyrant gains 12 Phase II armor');}
  if(e.key==='eclipse_engine'){e.coreCharge=1;log('Eclipse Engine enters Phase II with a charged core');}
  combatEvent('boss-phase-shift',{enemy:e.key});
  ed119VisualBurst(e,'phase');
 }
 if(m.reaction){e.nextReactionTurn=S.turn+2;combatEvent('enemy-reaction',{enemy:e.key,type:m.reaction});log(e.name+' reacts to '+m.reaction);}
 if(m.tangled&&m.kind!=='attack'){S.tangled=(S.tangled||0)+m.tangled;log('Entangled: your next Attack costs '+S.tangled+' extra');}
 if(m.coreCharge){e.coreCharge=Math.min(3,(e.coreCharge||0)+m.coreCharge);combatEvent('boss-charge',{enemy:e.key,charge:e.coreCharge});}
 if(m.coreRelease){e.coreCharge=0;combatEvent('boss-release',{enemy:e.key});}
 if(m.vent){e.coreCharge=0; e.strength=Math.max(0,e.strength-2);combatEvent('boss-vent',{enemy:e.key});log('Core disrupted: 2 Strength lost and the beam canceled');}
 if(e.key==='forge_tyrant'&&S.enemyResponse?.attacks>=3&&!m.reaction){e.block+=6;log('Forge Tyrant hardens its armor (+6 Block) after your three Attacks');}
 if(e.key==='shard_matriarch'&&S.enemyResponse?.skills>=2&&!m.reaction){
  placeCombatCard('dazed','discard');log('Silken backlash: shuffled a Dazed into your discard pile');
 }
 if(e.key==='hollow_regent'&&S.enemyResponse?.powers>=2&&e.phase2&&!m.reaction){e.block+=5;log('Hollow Regent gains 5 Block against your active Powers');}
}
// Retaliatory thorns are actual unblocked HP loss, never reflected recursively.
// The Monarch's minions protect the crown. Use dmgCard so damage previews
// and real hits agree; non-attack damage is intentionally unaffected.
const ed119DmgCardBase=dmgCard;
dmgCard=function(enemy,base,strengthOverride=S.strength){
 const damage=ed119DmgCardBase(enemy,base,strengthOverride);
 if(enemy?.key==='ashen_monarch'&&alive().some(e=>e.id!==enemy.id))return Math.max(0,damage-2);
 return damage;
};
const ed119HurtEnemyBase=hurtEnemy;
hurtEnemy=function(enemy,amount,attack=true){
 const before=enemy?.hp||0;const inflicted=ed119HurtEnemyBase(enemy,amount,attack);
 if(attack&&before>0&&inflicted>0&&enemy?.key==='rootmaw'&&enemy.spineWard>0&&S.screen==='battle'){
  const damage=receiveDamage(enemy.spineWard,{attack:false});log('Rootmaw thorns retaliate for '+damage.actual+' HP');
  queueFX('hero',damage.actual,'hit',{incoming:enemy.spineWard,style:'ember',source:'thorns'});
  combatEvent('thorns',{enemy:enemy.key,damage:damage.actual});
 }
 return inflicted;
};
const ed119StartBase=startBattle;
startBattle=function(kind){ed119StartBase(kind);S.enemyResponse=null;};
// Tooltip signals show the genuine chosen move, not a random flavor warning.
const ed119IntentBase=intentHTML;
intentHTML=function(enemy){
 let html=ed119IntentBase(enemy),m=moveFor(enemy);
 if(m.signal)html+=`<span class="ed119-intent-signal" title="${escapeHTML(m.signal)}">${m.coreCharge?'◉ CHARGING':m.coreRelease?'⚡ BEAM':m.reaction?'↪ REACTIVE':'⚡ PHASE MOVE'}</span>`;
 return html;
};
const ed119BattleBase=battleScreen;
battleScreen=function(){
 let html=ed119BattleBase();
 if(S?.screen!=='battle')return html;
 const boss=alive().find(e=>ENEMIES[e.key]?.boss);
 const cls=boss?`ed119-boss-field ed119-${boss.key}`:'ed119-encounter-field';
 html=html.replace('class="arena"',`class="arena ${cls}"`);
 if(boss){
  const notes=[];
  if(boss.phase2)notes.push('Phase II');
  if(boss.coreCharge)notes.push('Core '+boss.coreCharge+'/3');
  if(boss.spineWard)notes.push('Thorns '+boss.spineWard);
  if(boss.key==='ashen_monarch'&&alive().length>1)notes.push('Guarded Court');
  if(notes.length)html=html.replace(`data-enemy="${boss.id}"`,`data-enemy="${boss.id}" data-boss-tags="${escapeHTML(notes.join(' · '))}"`);
 }
 return html;
};
const ed119IntelBase=modalHTML;
modalHTML=function(){
 let content=ed119IntelBase();if(modal?.type!=='enemy-intel')return content;
 const enemyRows=alive().map(e=>{
  const entry=ED119_REACTIONS[e.key];const extra=ED119_EXTRA[e.key];
  const info=entry?`${entry.name} · Trigger: ${entry.when}${e.key==='forge_tyrant'?' · Countermeasure vs Bronze Scales relic':''}`:extra?`${extra.n} · Reactive encounter move`:'';
  const signs=[e.coreCharge?'Core charge '+e.coreCharge:'',e.spineWard?'Thorns '+e.spineWard:''].filter(Boolean).join(' · ');
  return info?`<div class="ed119-intel-tip"><strong>${escapeHTML(e.name)}</strong>: ${escapeHTML(info)}${signs?' · '+escapeHTML(signs):''}</div>`:'';
 }).join('');
 return content.replace('<p class="note">Move patterns',enemyRows+'<p class="note">Move patterns');
};
function ed119VisualBurst(enemy,kind){
 if(typeof document==='undefined'||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
 const actor=document.querySelector(`[data-enemy="${enemy.id}"] .avatar`);
 const arena=document.querySelector('.arena');if(!arena)return;
 const pane=document.createElement('div');pane.className='ed119-burst '+kind;
 pane.textContent=kind==='phase'?'PHASE II':kind==='react'?'COUNTER MOVE':'CORE SURGE';
 arena.append(pane);setTimeout(()=>pane.remove(),1050);
 if(actor&&actor.animate)actor.animate([{filter:'brightness(1)'},{filter:'brightness(2.1) saturate(1.7)',transform:'scale(1.16)'},{filter:'brightness(1)',transform:'scale(1)'}],{duration:700,easing:'ease-out'});
}
// Telegraph the actual flight path of a heavy or special incoming blow.
// Visual effects never mutate damage, Block, cards, or enemy turn state.
const ed119OriginalHit=enemyCinematics.hit;
enemyCinematics.hit=async function(enemy,move,index,total,onImpact){
 let marker=null;
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 if(!reduced&&(move.coreRelease||move.reaction||enemyCinematics.style(enemy,move)==='heavy')){
  const from=document.querySelector(`[data-enemy="${enemy.id}"] .avatar`)?.getBoundingClientRect();
  const to=document.querySelector('[data-character="hero"] .avatar')?.getBoundingClientRect();
  if(from&&to){
   const x=from.x+from.width/2,y=from.y+from.height/2,dx=to.x+to.width/2-x,dy=to.y+to.height/2-y;
   marker=document.createElement('div');marker.className='ed119-aim-line'+(move.coreRelease?' beam':'');
   marker.style.cssText=`left:${x}px;top:${y}px;width:${Math.hypot(dx,dy)}px;transform:rotate(${Math.atan2(dy,dx)}rad)`;
   document.body.append(marker);
  }
 }
 try{await ed119OriginalHit(enemy,move,index,total,onImpact)}finally{marker?.remove()}
};
const ed119OriginalBegin=enemyCinematics.begin;
enemyCinematics.begin=async function(enemy,move){
 if(move.reaction)ed119VisualBurst(enemy,'react');
 else if(move.coreCharge||move.coreRelease)ed119VisualBurst(enemy,'core');
 await ed119OriginalBegin(enemy,move);
};
