// Enemy turns, statuses, card triggers and timing.
// Custom turn scheduler: player finish → enemies clear Block → left-to-right enemy
// actions → player start Powers → draw. Avoids old enemy-Block and HP-loss bugs.
endTurn=async function(){
 if(busy||S.screen!=='battle')return;
 busy=true;S.turnPhase='player';
 try{
  if(S.powers?.stampede){for(let i=0;i<S.powers.stampede&&alive().length;i++){
   const attacks=S.hand.filter(c=>spec(c).type==='Attack');if(!attacks.length)break;
   const c=choice(attacks),oldTarget=S.target;S.hand.splice(S.hand.indexOf(c),1);
   S.target=S.enemies.indexOf(choice(alive()));applyCard(c,{free:true,cost:0});S.target=oldTarget;
  }}
  for(let c of [...S.exhaust.filter(c=>c.key==='howl')]){
   S.exhaust.splice(S.exhaust.indexOf(c),1);
   for(let enemy of [...alive()])attack(enemy,spec(c).dmg||18);
   S.discard.push(c);
  }
  if(checkEndBattle())return;
  // Player-duration debuffs tick before end-turn curses add their new stacks.
  decayStatus(S);S.tangled=Math.max(0,(S.tangled||0)-1);
  if(S.plating>0)gainBlock(S.plating,'effect');
  flushHandV105();
  if(S.tempStrength){S.strength-=S.tempStrength;S.tempStrength=0}
  S.rage=0;S.oneTwo=0;
  for(const e of S.enemies){if(e.tempStrengthDown){e.strength+=e.tempStrengthDown;e.tempStrengthDown=0}}
  if(checkEndBattle())return;
  // V1.19: freeze the player's actions and defenses before enemy attacks can
  // alter Block or card counters; intent and execution share this snapshot.
  if(typeof ed119BeforeEnemyPhase==='function')ed119BeforeEnemyPhase();
  S.turnPhase='enemy';
  // Enemies lose Block at the beginning of THEIR turn, not the player's.
  for(let e of alive())e.block=0;
  for(let e of [...alive()]){
   if(S.hp<=0||S.screen!=='battle')break;
   const m=moveFor(e),kind=m.kind;log(`${e.name}: ${m.n}`);
   render();
   await enemyCinematics.begin(e,m);
   if(kind==='attack'){
    for(let i=0;i<(m.hits||1);i++){
     if(e.hp<=0||S.hp<=0||S.screen!=='battle')break;
     await enemyCinematics.hit(e,m,i,m.hits||1,()=>{
      const predicted=adjustedEnemyDamage(e,m);
      const impact=receiveDamage(predicted,{attack:true,source:e});
      log(`${e.name} attacks for ${predicted} (${impact.blocked} blocked)`);
      queueFX('hero',impact.actual,'hit',{blocked:impact.blocked,incoming:predicted,style:enemyCinematics.style(e,m)==='heavy'?'heavy':enemyCinematics.style(e,m)==='magic'?'ember':'enemy'});
      if(e.key==='stone'&&impact.actual===0&&impact.blocked>0)e.nextStun=true;
      // Keep the battlefield onscreen for the impact even if Ironclad falls.
      const defeated=S.screen==='death';
      if(defeated)S.screen='battle';
      render();enemyCinematics.mask(e);triggerFX();
      if(defeated)S.screen='death';
     });
    }
    if(m.block)e.block+=(S.asc9&&e.key==='axe'?6:S.asc9&&e.key==='whelp'?8:m.block);
    if(m.tangled)S.tangled=(S.tangled||0)+m.tangled;
   }else{
    await enemyCinematics.cast(e,m);
   }
   await enemyCinematics.finish();
   if(kind==='buff'){
    if(m.strength){let amount=e.key==='feeder'&&S.asc9?16:m.strength;e.strength+=amount;queueFX(e.id,amount,'buff')}
    if(m.block)e.block+=m.block;if(m.ritual)e.ritual+=m.ritual;
   }
   if(kind==='debuff'){
    if(m.shrink)S.shrink=true;
    if(m.weak)blockDebuff(S,'weak',m.weak);
    if(m.frail)blockDebuff(S,'frail',m.frail);
    if(m.vulnerable)blockDebuff(S,'vulnerable',m.vulnerable);
   }
   if(m.status&&COMBAT_ONLY_CARDS[m.status])for(let i=0;i<(m.statusCount||1);i++)placeCombatCard(m.status,'discard');
   if(typeof ed118ResolveEnemyMove==='function')ed118ResolveEnemyMove(e,m);
   if(typeof ed119ResolveEnemyMove==='function')ed119ResolveEnemyMove(e,m);
   if(e.ritual>0&&e.step>0)e.strength+=e.ritual;
   e.step++;if(e.stunned)e.stunned=false;
   if(e.nextStun){e.stunned=true;e.nextStun=false}
   decayStatus(e,['weak','vulnerable']);
   if(checkEndBattle())break;
   render();triggerFX();await sleep(105);
  }
  if(S.screen!=='battle')return;
  const completedTurn=S.enemyResponse?{...S.enemyResponse}:null;
  S.turn++;S.turnPhase='player';
  if(typeof ed120PlanAll==='function')ed120PlanAll(completedTurn);
  S.enemyResponse=null;
  S.energy=3;S.energyLocked=false;S.canDraw=true;S.cardsPlayed=0;S.attacksPlayed=0;S.flame=0;
  S.block=S.powers?.barricade?S.block:0;
  for(let e of alive())if(e.key==='sentinel')e.slow=0;
  if(S.powers?.demon)S.strength+=S.powers.demon;
  S.exhaustedThisTurn=0;S.turnHpLoss=0;S.blockGainedFromCard=false;
  for(let pile of [S.draw,S.discard,S.hand,S.exhaust])for(let card of pile)card.tempFree=false;
  if(S.powers?.pyre)grantEnergyV110(S.powers.pyre);
  if(S.powers?.crimson){personalLoss(S.powers.crimson);if(S.hp>0)gainBlock(S.crimsonBlock||7*S.powers.crimson,'effect')}
  if(S.powers?.inferno&&S.hp>0)personalLoss(S.powers.inferno);
  if(S.hp<=0){checkEndBattle();return}
  if(S.powers?.aggression){for(let i=0;i<S.powers.aggression;i++){
   let cards=S.discard.filter(c=>spec(c).type==='Attack');if(cards.length&&S.hand.length<10){let c=choice(cards);S.discard.splice(S.discard.indexOf(c),1);if(UP[c.key])c.up=true;S.hand.push(c)}
  }}
  for(let e of S.enemies){if(e.tempStrengthDown){e.strength+=e.tempStrengthDown;e.tempStrengthDown=0}}
  S.colossus=0;
  drawCards(5,true);log('Your turn');
 }finally{enemyCinematics.cleanup();busy=false;save();render();triggerFX()}
};
// Avoid double-rounding when Weak and Vulnerable both affect one hit.
// Strength is added before both multipliers, and floor happens once per hit.
dmgCard=function(e,base,strengthOverride=S.strength){
 let multiplier=(S.weak>0?.75:1)*(S.shrink?.7:1)*(e.vulnerable>0?(S.powers?.cruelty?(S.crueltyBonus||1.75):1.5):1);
 if(e.key==='sentinel')multiplier*=1+(e.slow||0)*.1;
 return Math.max(0,Math.floor(Math.max(0,base+(strengthOverride||0))*multiplier));
};
adjustedEnemyDamage=function(e,m){
 if(m.kind!=='attack')return 0;
 let base=S.asc9&&m.ascDmg!=null?m.ascDmg:(m.dmg||0);
 if(S.asc9&&m.ascDmg==null){const over={mite:{Chomp:8,Stomp:14},marauder:{Crush:8},axe:{'Guarded Swing':6,'Overhead Smash':13},vine:{'Vine Swipe':7,Grasp:9,Gorge:18},archer:{'Piercing Bolt':16},acolyte:{'Dark Strike':11},whelp:{Bite:8},silk:{Thrash:5},stone:{Headbutt:16}};base=over[e.key]?.[m.n]??base}
 const multiplier=(e.weak>0?.75:1)*(S.vulnerable>0?1.5:1)*(S.colossus&&e.vulnerable>0?.5:1);
 return Math.max(0,Math.floor(Math.max(0,base+(e.strength||0))*multiplier));
};
addVuln=function(e,n){if(!e||e.hp<=0)return;if(blockDebuff(e,'vulnerable',n)&&S.powers?.vicious)drawCards(S.powers.vicious)};
