// Relic event hooks. Classic-script compatibility layer; requires all core systems.
'use strict';
function ensureRelics(){if(!S)return;S.relics=Array.isArray(S.relics)?S.relics:['burning_blood'];if(!S.relics.includes('burning_blood'))S.relics.unshift('burning_blood');S.relicCounters??={};S.relicCombat??={};}
function ownsRelic(id){return !!S&&Array.isArray(S.relics)&&S.relics.includes(id)}
function relicRoll(rarity){if(!S)return null;let options=RELIC_POOL.filter(id=>!ownsRelic(id)&&(!rarity||RELICS[id].rarity===rarity));if(!options.length)options=RELIC_POOL.filter(id=>!ownsRelic(id));return options.length?choice(options):null;}
function relicHeal(n){let before=S.hp;S.hp=Math.min(S.maxHP,S.hp+n);return S.hp-before}
function gainRelic(id){ensureRelics();if(!RELICS[id]||ownsRelic(id))return false;S.relics.push(id);S.lastRelicFound=id;log('Relic acquired: '+RELICS[id].name);
 if(id==='joss_paper')S.relicCounters.joss??=0;
 if(id==='nunchaku')S.relicCounters.nunchaku??=0;
 if(id==='strawberry'){S.maxHP+=7;S.hp+=7}
 if(id==='war_paint'||id==='whetstone'){
  const type=id==='war_paint'?'Skill':'Attack';let eligible=shuffle(S.deck.filter(c=>!c.up&&UP[c.key]&&CARDS[c.key]?.type===type));
  S.relicUpgrades??={};S.relicUpgrades[id]=eligible.slice(0,2).map(c=>{c.up=true;return {key:c.key,uid:c.uid};});
 }
 save();return true;
}
const relicNewGameBase=newGame;
newGame=function(){relicNewGameBase();ensureRelics();S.relicCounters={};S.lastRelicFound=null;save();render()};
const relicStartBattleBase=startBattle;
startBattle=function(type){ensureRelics();relicStartBattleBase(type);S.relicCombat={centennialUsed:false,attacksThisTurn:0,skillsThisTurn:0};S.thorns=0;
 if(ownsRelic('anchor'))gainBlock(10,'effect');
 if(ownsRelic('bag_marbles'))for(let e of alive())blockDebuff(e,'vulnerable',1);
 if(ownsRelic('red_mask'))for(let e of alive())blockDebuff(e,'weak',1);
 if(ownsRelic('blood_vial'))relicHeal(2);
 if(type==='boss'&&ownsRelic('pantograph'))relicHeal(25);
 if(ownsRelic('bronze_scales'))S.thorns=(S.thorns||0)+3;
 if(ownsRelic('oddly_smooth_stone'))S.dexterity++;
 if(ownsRelic('vajra'))S.strength++;
 if(ownsRelic('lantern'))S.energy++;
 if(ownsRelic('bag_preparation'))drawCards(2,true);
 // Counters persist across battles, as they do with Happy Flower.
 if(ownsRelic('happy_flower')){S.relicCounters.happy=(S.relicCounters.happy||0)+1;if(S.relicCounters.happy%3===0)grantEnergyV110(1)}
 save();render();
};
// The same damage function drives both actual attack damage and card previews.
const relicDmgCardBase=dmgCard;
dmgCard=function(enemy,base,strengthOverride=S.strength){
 let extra=(ownsRelic('red_skull')&&S.hp*2<=S.maxHP)?3:0;
 if(ownsRelic('strike_dummy')&&CARDS[vfxActiveCard]?.name?.includes('Strike'))base+=3;
 return relicDmgCardBase(enemy,base,(strengthOverride||0)+extra);
};
// Preview uses the same active-card context as real attack resolution.
const relicPreviewBase=damagePreview;
damagePreview=function(card,enemy){const prior=vfxActiveCard;vfxActiveCard=card?.key||null;try{return relicPreviewBase(card,enemy)}finally{vfxActiveCard=prior}};
// Persistent count relics and per-turn combat relics run after a card's normal effect.
const relicApplyCardBase=applyCard;
applyCard=function(c,opt={}){
 const active=S?.screen==='battle'&&!!c,kind=active?spec(c).type:null;
 const attackWas=S?.attacksPlayed||0;
 const playedWas=S?.cardsPlayed||0;
 const outcome=relicApplyCardBase(c,opt);
 if(!active||!S||S.cardsPlayed<=playedWas)return outcome;
 ensureRelics();
 if(kind==='Attack'&&S.attacksPlayed>attackWas){
  S.relicCombat.attacksThisTurn=(S.relicCombat.attacksThisTurn||0)+1;
  let count=S.relicCombat.attacksThisTurn;
  if(ownsRelic('nunchaku')){S.relicCounters.nunchaku=(S.relicCounters.nunchaku||0)+1;
   if(S.relicCounters.nunchaku%10===0)grantEnergyV110(1)}
  if(count%3===0){
   if(ownsRelic('shuriken'))S.strength++;
   if(ownsRelic('kunai'))S.dexterity++;
   if(ownsRelic('ornamental_fan'))gainBlock(4,'effect');
  }
 }
 if(kind==='Skill'){
  S.relicCombat.skillsThisTurn=(S.relicCombat.skillsThisTurn||0)+1;
  if(ownsRelic('letter_opener')&&S.relicCombat.skillsThisTurn%3===0){
   for(const e of [...alive()])hurtEnemy(e,5,false);
   if(S.screen==='battle'&&S.hp>0&&!alive().length)checkEndBattle();
  }
 }
 return outcome;
};
const relicExhaustCardBase=exhaustCard;
exhaustCard=function(c){
 const out=relicExhaustCardBase(c);if(!c||!S)return out;
 if(ownsRelic('joss_paper')){S.relicCounters.joss=(S.relicCounters.joss||0)+1;
  if(S.relicCounters.joss%5===0&&S.screen==='battle')drawCards(1,true);
 }
 return out;
};
const relicReceiveDamageBase=receiveDamage;
receiveDamage=function(n,options={}){
 let result=relicReceiveDamageBase(n,options);
 if(result.actual>0&&S?.screen==='battle'&&ownsRelic('centennial_puzzle')){
  S.relicCombat??={};if(!S.relicCombat.centennialUsed){S.relicCombat.centennialUsed=true;drawCards(3,true);log('Centennial Puzzle: draw 3')}
 }
 if(options.attack&&options.source?.hp>0&&S?.thorns>0)hurtEnemy(options.source,S.thorns,false);
 return result;
};
const relicHurtEnemyBase=hurtEnemy;
hurtEnemy=function(enemy,amount,attack=true){
 let living=!!enemy&&enemy.hp>0;const result=relicHurtEnemyBase(enemy,amount,attack);
 if(living&&enemy.hp<=0&&S?.screen==='battle'&&ownsRelic('gremlin_horn')){grantEnergyV110(1);drawCards(1,true);log('Gremlin Horn: +1 Energy, draw 1')}
 return result;
};
const relicEndTurnBase=endTurn;
endTurn=async function(){if(S?.screen!=='battle'||busy)return;
 ensureRelics();const attacks=S.attacksPlayed||0;
 const tempBarricade=ownsRelic('sturdy_clamp')&&!S.powers?.barricade;
 if(tempBarricade)S.powers.barricade=1;
 // End-of-player-turn effects occur before enemy actions.
 if(ownsRelic('orichalcum')&&S.block===0)gainBlock(6,'effect');
 try{await relicEndTurnBase()}finally{if(tempBarricade&&S?.powers){delete S.powers.barricade;if(S.screen==='battle')S.block=Math.min(10,S.block)}}
 if(S?.screen!=='battle')return;
 S.relicCombat??={};S.relicCombat.attacksThisTurn=0;S.relicCombat.skillsThisTurn=0;
 if(ownsRelic('art_of_war')&&attacks===0)grantEnergyV110(1);
 if(ownsRelic('horn_cleat')&&S.turn===2)gainBlock(14,'effect');
 if(ownsRelic('happy_flower')){S.relicCounters.happy=(S.relicCounters.happy||0)+1;if(S.relicCounters.happy%3===0)grantEnergyV110(1)}
 save();render();
};
const relicCheckEndBase=checkEndBattle;
checkEndBattle=function(){let wasBattle=S?.screen==='battle',clear=wasBattle&&S.hp>0&&S.enemies?.length&&alive().length===0;
 let result=relicCheckEndBase();
 if(clear&&S.screen==='reward'){
  ensureRelics();S.lastRelicFound=null;S.pendingBattleRelic=null;
  if(ownsRelic('amethyst_aubergine')){S.rewardGold=(S.rewardGold||0)+15}
  if(S.room==='Elite'||S.room==='Boss'){
   // Stage loot for an explicit claim after combat. Do not fire relic pickup hooks yet.
   S.pendingBattleRelic=relicRoll(S.room==='Boss'?'Rare':null);
  }
  save();
 }
 return result;
};
const relicChooseNodeBase=chooseNode;
chooseNode=function(id){const valid=S?.screen==='route'&&openNodes().some(n=>n.id===id);if(!valid)return;
 let node=nodeById(id),type=node?.type;
 relicChooseNodeBase(id);ensureRelics();
 if(type==='treasure'){
  // This prototype's earlier gold-only treasure is now a relic chest.
  const dropped=relicRoll();
  if(dropped){S.gold-=75;gainRelic(dropped)}
  S.treasureRelic=dropped;
 }
 if(type==='shop'){
  if(ownsRelic('meal_ticket'))relicHeal(15);
  S.shopRelics=shuffle(RELIC_POOL.filter(k=>!ownsRelic(k))).slice(0,2);
 }
 save();render();
};
const relicActBase=act;
act=function(action){if(action==='restheal'&&S?.screen==='rest'&&ownsRelic('regal_pillow'))relicHeal(15);relicActBase(action)};
// Existing local saves are automatically upgraded and kept in the same save key.
if(S){ensureRelics();save();}
