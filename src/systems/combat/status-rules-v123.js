/* V1.23 — sourced Shrink and turn-accurate status lifecycle.
 * Rules derived from the main-build STS2 power descriptions.  This does not
 * claim original enemies are game-exact; those remain the Ember Descent set.
 * Data below is JSON-serializable for existing saves. */
'use strict';
const ED123_DURATION_KEYS=['weak','vulnerable','frail'];
function ed123ActorIsPlayer(actor){return actor===S}
function ed123State(actor){
 if(!actor||typeof actor!=='object')return {duration:0,sources:[]};
 if(!actor._shrinkState||typeof actor._shrinkState!=='object'){
  // Old saves only stored shrink:true.  Infer living Shrinker Beetle casters;
  // if none remain, clear the previously permanent bugged status.
  const casters=actor.shrink&&actor===S?(S.enemies||[]).filter(e=>e.hp>0&&e.key==='mite').map(e=>e.id):[];
  actor._shrinkState={duration:0,sources:casters};
  actor.shrink=casters.length>0;
 }
 const state=actor._shrinkState;
 state.duration=Math.max(0,Math.floor(Number(state.duration)||0));
 state.sources=Array.isArray(state.sources)?[...new Set(state.sources.filter(x=>x!==null&&x!==undefined))]:[];
 return state;
}
function ed123HasShrink(actor){return !!actor?.shrink;}
function ed123RefreshShrink(actor){
 if(!actor)return false;
 const previous=!!actor.shrink;
 const state=ed123State(actor);
 if(actor===S)state.sources=state.sources.filter(id=>(S.enemies||[]).some(e=>e.id===id&&e.hp>0&&e.key==='mite'));
 actor.shrink=state.duration>0||state.sources.length>0;
 if(previous&&!actor.shrink){
  combatEvent('shrink-ended',{actor:ed123ActorIsPlayer(actor)?'hero':actor.id});
  if(S?.screen==='battle')queueStatusFX(actor,'shrink',1,{label:'SHRINK ENDED'});
 }
 return actor.shrink;
}
// Source is a Shrinker Beetle (id saved, not a live object). Timed Shrink uses
// duration, not damage multiplier stacks. Applying another source won't make
// the target doubly small or inflict 60% less damage.
applyShrink=function(target,options={}){
 if(!target||S?.screen!=='battle')return 0;
 if((target.artifact||0)>0){
  target.artifact--;log('Artifact negated Shrink');
  combatEvent('artifact-negated',{key:'shrink'});
  queueStatusFX(target,'artifact',1,{label:'ARTIFACT'});return 0;
 }
 const state=ed123State(target);
 if(options.source&&options.source.key==='mite'){
  if(!state.sources.includes(options.source.id))state.sources.push(options.source.id);
 }else{
  const duration=Math.max(1,Math.floor(Number(options.duration)||4));
  // Duration stacks additively (e.g. two Beetle Juices: 4 + 4 turns).
  state.duration+=duration;
 }
 target.shrink=true;
 if(ed123ActorIsPlayer(target)){
  S._statusFresh??={};S._shrinkAppliedInPhase=true;
 }
 combatEvent('debuff-applied',{key:'shrink',duration:state.duration,source:options.source?.id??null});
 queueStatusFX(target,'shrink',state.duration||1,{label:'SHRINK'});
 return 1;
};
// Weak/Vulnerable/Frail decrement at the end of the enemy phase. A fresh
// application on a player skips its first tick; previously-existing stacks can
// still lose one. Enemy debuffs applied on the player turn do tick after their move.
const ed123DebuffBase=blockDebuff;
blockDebuff=function(target,key,amount){
 const actual=ed123DebuffBase(target,key,amount);
 if(actual>0&&target===S&&ED123_DURATION_KEYS.includes(key)){
  S._statusFresh??={};
  S._statusFresh[key]=(S._statusFresh[key]||0)+actual;
 }
 return actual;
};
function ed123EndEnemyPhase(){
 S._statusFresh??={};
 for(const key of ED123_DURATION_KEYS){
  const count=Math.max(0,Number(S[key])||0),fresh=Math.max(0,Number(S._statusFresh[key])||0);
  // Never eat a fresh player stack on the turn it arrived.
  if(count>fresh)S[key]=count-1;
  else S[key]=count;
 }
 S._statusFresh={};
 // Timed Shrink on the player also skips its application phase, then lasts
 // through the printed number of complete player turns. Beetle-sourced Shrink
 // has no timer and still only ends when its caster dies.
 if(S._shrinkState?.duration>0){
  if(!S._shrinkAppliedInPhase)S._shrinkState.duration--;
 }
 S._shrinkAppliedInPhase=false;
 ed123RefreshShrink(S);
}
function ed123EndEnemyAction(enemy){
 if(!enemy)return;
 // Mangle weakens exactly this enemy action, then restores all reduced Strength.
 if(enemy.tempStrengthDown){enemy.strength=(enemy.strength||0)+enemy.tempStrengthDown;enemy.tempStrengthDown=0;}
 // Beetle Juice lasts through the number of enemy actions indicated by duration.
 if(enemy._shrinkState?.duration>0){enemy._shrinkState.duration--;ed123RefreshShrink(enemy);}
}
function applyTemporaryStrengthLoss(enemy,amount){
 if(!enemy||enemy.hp<=0||amount<=0)return 0;
 if((enemy.artifact||0)>0){enemy.artifact--;combatEvent('artifact-negated',{key:'mangle'});queueStatusFX(enemy,'artifact',1,{label:'ARTIFACT'});return 0;}
 enemy.strength=(enemy.strength||0)-amount;
 enemy.tempStrengthDown=(enemy.tempStrengthDown||0)+amount;
 combatEvent('debuff-applied',{key:'mangle',amount});
 queueStatusFX(enemy,'mangle',amount,{label:'MANGLE'});
 return amount;
}
const ed123HurtBase=hurtEnemy;
hurtEnemy=function(enemy,amount,attack=true){
 const before=enemy?.hp||0;
 const result=ed123HurtBase(enemy,amount,attack);
 if(before>0&&enemy?.hp<=0&&enemy?.key==='mite'&&S?._shrinkState)ed123RefreshShrink(S);
 return result;
};
const ed123BattleBase=startBattle;
startBattle=function(kind){
 ed123BattleBase(kind);
 if(S){S._statusFresh={};S._shrinkAppliedInPhase=false;S._shrinkState={duration:0,sources:[]};S.shrink=false;}
};
// Existing v1.22 / older saves remain readable and old permanent Shrink is
// reconciled immediately, even if the source was killed before saving.
if(S?.screen==='battle'){
 ed123State(S);ed123RefreshShrink(S);S._statusFresh??={};
 for(const foe of S.enemies||[])if(foe.shrink)ed123State(foe);
 save();render();
}
