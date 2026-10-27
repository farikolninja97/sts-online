// Status, curse, damage and exhaust events.
/* V1.05 — Priority 2: combat-turn resolver, combat statuses, exhaust/power triggers.
   This intentionally leaves map/encounter art and the permanent Ironclad pool untouched. */
const COMBAT_ONLY_CARDS={
 dazed:{name:'Dazed',type:'Status',cost:0,rarity:'Status',desc:'Unplayable. Ethereal.',icon:'storm',unplayable:true,ethereal:true},
 void:{name:'Void',type:'Status',cost:0,rarity:'Status',desc:'Unplayable. Ethereal. Whenever drawn, lose 1 Energy.',icon:'storm',unplayable:true,ethereal:true},
 wound:{name:'Wound',type:'Status',cost:0,rarity:'Status',desc:'Unplayable.',icon:'shield',unplayable:true},
 burn:{name:'Burn',type:'Status',cost:0,rarity:'Status',desc:'Unplayable. At end of turn, take 2 damage if in Hand.',icon:'flame',unplayable:true},
 slimed:{name:'Slimed',type:'Status',cost:1,rarity:'Status',desc:'Draw 1 card. Exhaust.',icon:'storm',exhaust:true},
 decay:{name:'Decay',type:'Curse',cost:0,rarity:'Curse',desc:'Unplayable. At end of turn, take 2 damage if in Hand.',icon:'flame',unplayable:true},
 greed:{name:'Greed',type:'Curse',cost:0,rarity:'Curse',desc:'Unplayable. Eternal. Cannot be removed or transformed from your permanent deck.',icon:'flame',unplayable:true,eternal:true},
 clumsy:{name:'Clumsy',type:'Curse',cost:0,rarity:'Curse',desc:'Unplayable. Ethereal.',icon:'storm',unplayable:true,ethereal:true},
 pain:{name:'Pain',type:'Curse',cost:0,rarity:'Curse',desc:'Unplayable. While in hand, lose 1 HP when another card is played.',icon:'flame',unplayable:true},
 regret:{name:'Regret',type:'Curse',cost:0,rarity:'Curse',desc:'Unplayable. At end of turn, lose 1 HP per card in Hand.',icon:'flame',unplayable:true},
 doubt:{name:'Doubt',type:'Curse',cost:0,rarity:'Curse',desc:'Unplayable. At end of turn, gain 1 Weak.',icon:'storm',unplayable:true},
 shame:{name:'Shame',type:'Curse',cost:0,rarity:'Curse',desc:'Unplayable. At end of turn, gain 1 Frail.',icon:'shield',unplayable:true}
};
Object.assign(CARDS,COMBAT_ONLY_CARDS);
const v105LegacyStartBattle=startBattle;
startBattle=function(kind){v105LegacyStartBattle(kind);S.artifact=0;S.turnPhase='player';S.combatEvents=[];S.weakThisTurn=0;S.vulnerableThisTurn=0;S.frailThisTurn=0;};
function combatEvent(event,details={}){S.combatEvents??=[];S.combatEvents.push({event,turn:S.turn,...details});if(S.combatEvents.length>100)S.combatEvents.splice(0,40)}
function combatantRef(target){return target===S?'hero':target?.id}
function queueStatusFX(target,key,amount=1,extra={}){let id=combatantRef(target);if(id==null||typeof queueFX!=='function')return;let visual=typeof vfxCapture==='function'?vfxCapture(id):null;queueFX(id,amount,'status',{status:key,label:extra.label||String(key||'status').toUpperCase(),visual})}
function applyShrink(target){if(!target)return 0;let artifact=target.artifact||0;if(artifact>0){target.artifact--;log('Artifact negated shrink');combatEvent('artifact-negated',{key:'shrink'});queueStatusFX(target,'artifact',1,{label:'ARTIFACT'});return 0}target.shrink=true;combatEvent('debuff-applied',{key:'shrink'});queueStatusFX(target,'shrink',1,{label:'SHRINK'});return 1}
function blockDebuff(target,key,amount){if(amount<=0)return 0;let artifact=target.artifact||0;if(artifact>0){target.artifact--;log('Artifact negated '+key);combatEvent('artifact-negated',{key});queueStatusFX(target,'artifact',1,{label:'ARTIFACT'});return 0}target[key]=(target[key]||0)+amount;combatEvent('debuff-applied',{key,amount});queueStatusFX(target,key,amount,{label:String(key).toUpperCase()});return amount}
function receiveDamage(amount,{attack=false,source=null,blockable=attack}={}){
 let value=Math.max(0,Math.floor(amount));
 // Colossus is already represented in the attack preview and incoming damage calculation.
 let blocked=blockable?Math.min(S.block,value):0;
 if(blockable)S.block-=blocked;
 let actual=Math.min(S.hp,Math.max(0,value-blocked));S.hp-=actual;
 // Plating does not wear off on damage; it loses one stack at the start of the owner's turn.
 if(attack&&S.flame>0&&source?.hp>0)hurtEnemy(source,S.flame,false);
 if(actual>0){S.turnHpLoss=(S.turnHpLoss||0)+actual;S.lossCount=(S.lossCount||0)+1;
   if(S.turnPhase==='player'){
     if(S.powers?.rupture)S.strength+=S.powers.rupture;
     if(S.powers?.inferno)for(const e of [...alive()])hurtEnemy(e,S.infernoDamage||6,false);
   }
 }
 combatEvent(attack?'player-attacked':'hp-loss',{actual,blocked});
 if(S.hp<=0)S.screen='death';
 return {actual,blocked};
}
personalLoss=function(n){const r=receiveDamage(n,{attack:false});log(`Lost ${r.actual} HP`);return r.actual};
// Enemy/Power Block is not modified by Dexterity or Frail; card Block is.
gainBlock=function(amount,source='card'){
 const modified=source==='card'?Math.floor(Math.max(0,amount+(S.dexterity||0))*(S.frail>0?.75:1)):Math.max(0,Math.floor(amount));
 let n=modified;
 if(source==='card'&&S.powers?.unmovable&&!S.blockGainedFromCard){n*=2;S.blockGainedFromCard=true}
 S.block+=n;
 if(n>0){log(`Gained ${n} Block`);combatEvent('block',{amount:n,source});if(S.powers?.juggernaut){for(let i=0;i<S.powers.juggernaut;i++)dealRawToRandom(S.juggernautDamage||6)}}
 return n;
};
// Exhausting *any* combat card fires exhaust Powers and Drum of Battle's ability.
exhaustCard=function(c){if(!c)return;S.exhaust.push(c);S.exhaustedThisTurn=(S.exhaustedThisTurn||0)+1;combatEvent('exhaust',{card:c.key});
 if(S.powers?.feel)gainBlock(S.powers.feel,'effect');
 if(S.powers?.darkembrace)drawCards(S.powers.darkembrace);
 if(c.key==='drum')grantEnergyV110(c.up?3:2);
};
// Hellraiser now plays the *entire Strike card*, including costs ignored, copies,
// Attack triggers and additional effects; it is no longer a pure damage shortcut.
let autoPlayDepth=0;
drawCards=function(n,force=false){
 if(!S.canDraw&&!force){log('No Draw prevents further draws');return 0}
 let count=0;
 for(let i=0;i<n;i++){
  if(S.hand.length>=10){log('Hand full (10 cards)');break}
  if(!S.draw.length){if(!S.discard.length)break;S.draw=shuffle(S.discard.splice(0));combatEvent('reshuffle')}
  const c=S.draw.shift();if(!c)break;
  S.hand.push(c);count++;combatEvent('draw',{card:c.key});
  if(c.key==='void')S.energy=Math.max(0,S.energy-1);
  if(S.powers?.hellraiser&&CARDS[c.key]?.name.includes('Strike')&&autoPlayDepth<12&&alive().length){
   let foe=choice(alive()),oldTarget=S.target;
   S.target=S.enemies.indexOf(foe);S.hand.splice(S.hand.indexOf(c),1);
   autoPlayDepth++;
   try{applyCard(c,{free:true,cost:0})}finally{autoPlayDepth--;S.target=oldTarget}
  }
  if(S.screen!=='battle')break;
 }
 return count;
};
const v105ApplyCard=applyCard;
applyCard=function(c,opt={}){
 if(!c||spec(c).unplayable)return;
 // Applies to played cards from Hand, Cascade, Havoc and other free plays.
 for(const pain of S.hand.filter(x=>x.key==='pain'))personalLoss(1);
 if(S.hp<=0){checkEndBattle();return}
 // A played Slimed has a positive, current STS2 effect: draw 1; Exhaust.
 if(c.key==='slimed'){
  if(S.screen!=='battle')return;
  if(!opt.free)S.energy=Math.max(0,S.energy-(opt.cost??1));
  S.cardsPlayed++;log('Slimed played');drawCards(1);exhaustCard(c);combatEvent('card-played',{card:'slimed'});return;
 }
 const wasPlaying=S.turnPhase==='player';
 v105ApplyCard(c,opt);
 if(wasPlaying)combatEvent('card-played',{card:c.key,upgraded:!!c.up});
};
// Reject unplayables BEFORE they leave the hand or consume energy.
const v105PlayCard=playCard;
playCard=function(id){
 if(S?.screen!=='battle'||busy)return;
 const c=S.hand.find(x=>x.uid===id);if(!c||spec(c).unplayable){if(c)log(`${spec(c).name} is unplayable`);return}
 if(isTargetedCard(c)&&!targetEnemy())return
 if(updatedCost(c)>S.energy&&updatedCost(c)!==-1)return;
 v105PlayCard(id);
};
const v105OldStatusPlayer=statusForPlayer,v105OldStatusEnemy=statusForEnemy;
statusForPlayer=function(){let old=v105OldStatusPlayer();if(S.artifact>0)old+=statusChip('Artifact',S.artifact);if((S.hand||[]).some(c=>CARDS[c.key]?.type==='Curse'))old+=statusChip('Cursed',S.hand.filter(c=>CARDS[c.key]?.type==='Curse').length);return old};
statusForEnemy=function(e){let old=v105OldStatusEnemy(e);if(e.artifact>0)old+=statusChip('Artifact',e.artifact);return old};
// Players can add/inspect sample afflictions via the in-game Combat Reference.
function placeCombatCard(key,pile='discard'){if(!CARDS[key]||!['Status','Curse'].includes(CARDS[key].type))return null;let c=newCard(key);if(CARDS[key].type==='Curse'){S.deck.push(c);S[pile].push({...c})}else S[pile].push(c);save();render();return c}
function decayStatus(actor,keys=['weak','vulnerable','frail']){for(let k of keys)actor[k]=Math.max(0,(actor[k]||0)-1)}
function flushHandV105(){
 // Ethereal cards exhaust before on-end-turn-in-hand HP-loss effects.
 for(let c of [...S.hand])if(spec(c).ethereal){S.hand.splice(S.hand.indexOf(c),1);exhaustCard(c)}
 const snapshot=[...S.hand],handCount=snapshot.length;
 for(let c of snapshot){
  if(!S.hand.includes(c))continue;
  if(c.key==='burn'||c.key==='decay')receiveDamage(2,{attack:false,blockable:true});
  if(c.key==='regret')personalLoss(handCount);
  if(c.key==='doubt')blockDebuff(S,'weak',1);
  if(c.key==='shame')blockDebuff(S,'frail',1);
  if(S.hp<=0)break;
 }
 for(let c of S.hand.splice(0)){
  // End-of-turn status/curse effects force self-discard even if Retain is set.
  if(spec(c).retain&&!['burn','decay','regret','doubt','shame'].includes(c.key))S.hand.push(c);
  else S.discard.push(c);
 }
}
