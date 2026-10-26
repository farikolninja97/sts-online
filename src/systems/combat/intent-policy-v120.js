/* Ember Descent V1.20 — persistent, per-enemy intent state machines.
 * Models the DESIGN of STS2 monster AI: scripted openers, weighted branches,
 * no-repeat rules, conditional eligibility and telegraphed boss phases.
 * The 52 creatures in this prototype are ORIGINAL. These policies are NOT
 * advertised as the exact official move scripts or damage values.
 */
'use strict';
// Every playable opponent gets its own policy. Move indices reference its
// existing authored moves; every variation is stable across save/reload.
const ED120_POLICY={
 // Act I
 mite:{mode:'sequence',seq:[0,1,2,1,2]},
 marauder:{mode:'weighted',weights:[4,1],limit:2,open:0},
 archer:{mode:'sequence',seq:[0,1]},
 axe:{mode:'sequence',seq:[0,1,2]},
 sentinel:{mode:'sequence',seq:[0,1,2,2,2]},
 emberling:{mode:'weighted',weights:[4,2,2],limit:2,open:0},
 thicket:{mode:'sequence',seq:[0,1,2,1,2]},
 knuckle:{mode:'sequence',seq:[0,1,2,1,2]},
 sootling:{mode:'weighted',weights:[5,2,3],limit:2,open:0},
 briarhound:{mode:'weighted',weights:[4,2,3],limit:2,open:0},
 ember_shield:{mode:'sequence',seq:[0,1,2,0,2]},
 lantern_wisp:{mode:'sequence',seq:[0,1,2,1]},
 moss_hermit:{mode:'weighted',weights:[2,2,5],limit:1,open:2},
 ash_howler:{mode:'sequence',seq:[0,1,2,1,2]},
 crimson_binder:{mode:'sequence',seq:[0,1,2,3,1]},
 thorn_executioner:{mode:'weighted',weights:[2,4,3,1],limit:1,open:0},
 ashen_monarch:{mode:'sequence',seq:[0,1,2,1]},
 rootmaw:{mode:'weighted',weights:[2,5,2],limit:1,open:0},
 // Act II
 acolyte:{mode:'sequence',seq:[0,1,1,1]},
 feeder:{mode:'sequence',seq:[0,1,2,2,2]},
 whelp:{mode:'fixed',move:0},
 silk:{mode:'sequence',seq:[0,1]},
 duskseer:{mode:'sequence',seq:[0,1,2,1]},
 glasswing:{mode:'weighted',weights:[2,4,3],limit:1,open:0},
 shellguard:{mode:'sequence',seq:[0,1,2,1]},
 shardspider:{mode:'sequence',seq:[0,1,2,1]},
 echo_mage:{mode:'weighted',weights:[2,4,3],limit:1,open:0},
 ore_golem:{mode:'sequence',seq:[0,1,2,1]},
 hollow_monk:{mode:'sequence',seq:[0,1,2,1]},
 mist_thief:{mode:'weighted',weights:[2,4,2],limit:1,open:1},
 molten_guard:{mode:'sequence',seq:[0,1,2,1]},
 prism_jailor:{mode:'sequence',seq:[0,1,2,3,1]},
 cinder_duelist:{mode:'weighted',weights:[1,4,3,2],limit:1,open:0},
 crystal_sentinel:{mode:'sequence',seq:[0,1,2,1]},
 shard_matriarch:{mode:'sequence',seq:[0,1,2,1]},
 forge_tyrant:{mode:'sequence',seq:[0,1,2,1]},
 // Act III
 vine:{mode:'sequence',seq:[0,1,2]},
 stone:{mode:'fixed',move:0},
 voidclaw:{mode:'weighted',weights:[4,2,3],limit:1,open:0},
 astral:{mode:'sequence',seq:[0,1,2,0,2]},
 basalt:{mode:'sequence',seq:[0,1,2,1]},
 crown_wraith:{mode:'sequence',seq:[0,1,2,1]},
 bone_harbinger:{mode:'sequence',seq:[0,1,2,1]},
 star_devourer:{mode:'weighted',weights:[5,2,3],limit:1,open:0},
 ruin_keeper:{mode:'sequence',seq:[0,1,2,1]},
 dusk_collector:{mode:'sequence',seq:[0,1,2,1]},
 void_scribe:{mode:'sequence',seq:[0,1,2,1]},
 void_arbiter:{mode:'weighted',weights:[2,5,2,3],limit:1,open:0},
 grave_marshal:{mode:'sequence',seq:[0,1,2,1]},
 astral_harvester:{mode:'weighted',weights:[2,5,3,2],limit:1,open:0},
 hollow_regent:{mode:'sequence',seq:[0,1,2,1]},
 eclipse_engine:{mode:'sequence',seq:[0,1,2,1]}
};
function ed120Rand(){
 // xorshift32 is deterministic and stored in the run: rendering cannot reroll.
 let seed=(S.aiSeed>>>0)||0x9e3779b9;
 seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
 S.aiSeed=seed>>>0;return (S.aiSeed>>>0)/4294967296;
}
function ed120MoveArray(e){
 const d=ENEMIES[e.key];
 return d?.boss&&e.phase2&&d.enragedMoves?.length?d.enragedMoves:d?.moves||[];
}
function ed120Weight(e,m,index,weight){
 if(weight<=0)return 0;
 // Explicit conditional gates prevent impossible actions, rather than
 // magically switching plans in reaction to freshly played cards.
 if(m.heal&&e.hp>=e.maxHP)return 0;
 if(m.heal&&e.hp>e.maxHP*.75)weight*=.25;
 if(m.summon&&(alive().length>=3||S.enemies.length>=9))return 0;
 if(m.artifact&&(e.artifact||0)>=3)weight*=.3;
 if(m.block&&e.block>=20)weight*=.4;
 if(m.strength&&(e.strength||0)>=18)weight*=.4;
 if(e.key==='mist_thief'&&index===0&&e.vulnerable>0)weight*=3;
 if(e.key==='star_devourer'&&index===0&&e.hp<e.maxHP*.4)weight*=3;
 if(e.key==='moss_hermit'&&index===0&&e.hp<e.maxHP*.65)weight*=5;
 if(e.key==='thorn_executioner'&&index===0&&e.hp<e.maxHP*.4)weight*=2;
 if(e.key==='cinder_duelist'&&index===3&&e.hp<e.maxHP*.35)weight*=3;
 return weight;
}
function ed120SelectIndex(e,moves,policy){
 const count=moves.length;
 if(count<2)return 0;
 const history=e.aiHistory||[];
 // For a scripted pattern, only its turn index advances. Never reroll a turn.
 if(policy.mode==='fixed')return Math.min(count-1,policy.move||0);
 if(policy.mode==='sequence'){
  let seq=policy.seq||[0];let step=e.step||0;
  if(step>=seq.length&&seq.length>2&&new Set(seq.slice(2)).size===1)return seq[seq.length-1];
  if(step>=seq.length&&seq.length>1&&new Set(seq.slice(1)).size===1)return seq[seq.length-1];
  return (seq[step%seq.length]||0)%count;
 }
 if(e.step===0&&policy.open!=null)return policy.open%count;
 let weights=moves.map((m,i)=>ed120Weight(e,m,i,policy.weights?.[i]??1));
 const previous=history[history.length-1];
 let repeats=0;for(let i=history.length-1;i>=0&&history[i]===previous;i--)repeats++;
 if(previous!=null&&repeats>=(policy.limit||2)&&weights.some((w,i)=>i!==previous&&w>0))weights[previous]=0;
 let total=weights.reduce((a,b)=>a+b,0);
 if(total<=0){weights=moves.map((m,i)=>ed120Weight(e,m,i,1));total=weights.reduce((a,b)=>a+b,0)}
 if(total<=0)return moves.findIndex(m=>m.kind==='attack')>=0?moves.findIndex(m=>m.kind==='attack'):0;
 let roll=ed120Rand()*total;
 for(let i=0;i<weights.length;i++){roll-=weights[i];if(roll<0&&weights[i]>0)return i}
 return weights.findIndex(w=>w>0);
}
const ed120BeforeMoveFor=moveFor;
function ed120Plan(e){
 if(!e||e.hp<=0)return null;
 const moves=ed120MoveArray(e),policy=ED120_POLICY[e.key]||{mode:'sequence',seq:[0,1,2]};
 // V1.19 special moves only interrupt at the NEXT intent-selection boundary;
 // player's actions during the current turn cannot silently rewrite intent.
 const special=ed120BeforeMoveFor(e);
 let planned,index=null,origin='pattern';
 if(e.stunned||special.phaseShift||special.reaction||special.coreCharge||special.coreRelease){planned={...special};origin=special.phaseShift?'phase':special.reaction?'reaction':special.coreCharge||special.coreRelease?'charge':'stunned'}
 else{
  index=ed120SelectIndex(e,moves,policy);
  planned={...moves[index]};
 }
 e.aiPlan={turn:S.turn,move:planned,origin,index};
 if(index!==null){e.aiHistory??=[];e.aiHistory.push(index);if(e.aiHistory.length>8)e.aiHistory.shift()}
 return e.aiPlan;
}
function ed120PlanAll(previousTurn=null){
 if(S?.screen!=='battle')return;
 const former=S.enemyResponse, formerPhase=S.turnPhase;
 // The conditional scripts inspect the FINISHED player turn, not future cards.
 S.enemyResponse=previousTurn?{...previousTurn,turn:S.turn}:null;
 if(previousTurn)S.turnPhase='enemy'; // Let the existing V1.19 condition reader consume the frozen snapshot.
 try{for(const e of alive())if(e.aiPlan?.turn!==S.turn)ed120Plan(e);}
 finally{S.enemyResponse=former;S.turnPhase=formerPhase;}
}
moveFor=function(e){
 if(!e||e.hp<=0)return {n:'Defeated',kind:'sleep'};
 // Guarded HP thresholds legitimately announce a visible phase transition.
 if(ENEMIES[e.key]?.boss&&!e.phase2&&e.hp<=Math.floor(e.maxHP*.5)){
  const shift=ed120BeforeMoveFor(e);
  if(shift?.phaseShift&&(!e.aiPlan||!e.aiPlan.move.phaseShift)){
   e.aiPlan={turn:S.turn,move:{...shift},origin:'phase',index:null};
  }
 }
 if(e.aiPlan?.turn===S.turn)return e.aiPlan.move;
 if(S?.screen==='battle')return (ed120Plan(e)||{}).move;
 return ed120BeforeMoveFor(e);
};
const ed120StartBattleBase=startBattle;
startBattle=function(kind){
 ed120StartBattleBase(kind);
 S.aiSeed=(S.aiSeed>>>0)||((Math.random()*4294967295)>>>0)||0x9e3779b9;
 if(S.screen==='battle')ed120PlanAll();
};
const ed120BattleBase=battleScreen;
battleScreen=function(){
 let html=ed120BattleBase();if(S?.screen!=='battle')return html;
 // Explain to players that the chosen intent is committed for the turn.
 html=html.replace('Choose a target, play a card, then end the turn','Enemy intents are locked for this turn · Plan your cards');
 return html;
};
const ed120IntelBase=modalHTML;
modalHTML=function(){
 const html=ed120IntelBase();if(modal?.type!=='enemy-intel')return html;
 const explanations=alive().map(e=>{
  const rule=ED120_POLICY[e.key];if(!rule)return '';
  const style=rule.mode==='weighted'?'Weighted random; no long repeated move streaks':rule.mode==='fixed'?'Fixed move (unless stunned)':'Scripted attack cycle';
  const intent=e.aiPlan?.move?.n||moveFor(e).n;
  return `<p class="ed120-ai-line"><b>${escapeHTML(e.name)}</b>: ${escapeHTML(style)} · Committed: ${escapeHTML(intent)}</p>`;
 }).join('');
 return html.replace('<p class="note">Move patterns',`<div class="ed120-ai-panel"><strong>Enemy decisions</strong><p class="note">Intents are chosen at the start of your turn. Player actions cannot secretly reroll a committed move. Specific enemy passive effects are separate from their intended move.</p>${explanations}</div><p class="note">Move patterns`).replace('Move patterns in this prototype are deterministic; buffs and debuffs change the displayed predictions. Half-health bosses have a second phase.','Some opponents follow a cycle, others use weighted choices or conditional responses between turns. Strength, Weak and Vulnerable affect damage previews. Boss phase changes are clearly telegraphed.');
};
