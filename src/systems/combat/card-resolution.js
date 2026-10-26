// Ironclad card effect resolution and turn actions.
function updatedCost(c){let d=spec(c);if(c.tempFree||((S?.nextAttackFree)&&d.type==='Attack'&&d.cost!==-1&&S?.screen==='battle'))return 0;let cost=d.cost;if(c.key==='stomp'&&S?.screen==='battle')cost=Math.max(0,cost-S.attacksPlayed);return cost<0?-1:cost+(d.type==='Attack'&&S?.screen==='battle'?S.tangled||0:0)}
function dmgCard(e,base){let damage=Math.max(0,base+(S.strength||0));if(S.weak>0)damage=Math.floor(damage*.75);if(S.shrink)damage=Math.floor(damage*.7);if(e.vulnerable>0)damage=Math.floor(damage*(S.powers?.cruelty?(S.crueltyBonus||1.75):1.5));if(e.key==='sentinel')damage=Math.floor(damage*(1+e.slow*.1));return damage}
function adjustedEnemyDamage(e,m){if(m.kind!=='attack')return 0;let value=legacyAdjustedEnemyDamage(e,m);if(S.colossus&&e.vulnerable>0)value=Math.floor(value*.5);return value}
function gainBlock(amount){let n=Math.max(0,Math.floor((amount+(S.dexterity||0))*(S.frail>0?.75:1)));if(S.powers?.unmovable&&!S.blockGainedFromCard){n*=2;S.blockGainedFromCard=true}S.block+=n;if(n>0&&S.powers?.juggernaut)for(let i=0;i<S.powers.juggernaut;i++)dealRawToRandom(S.juggernautDamage||6);log(`Gained ${n} Block`);return n}
function exhaustCard(c){S.exhaust.push(c);S.exhaustedThisTurn=(S.exhaustedThisTurn||0)+1;if(S.powers?.feel)gainBlock(S.powers.feel);if(S.powers?.darkembrace)drawCards(S.powers.darkembrace);if(c.key==='drum')S.energy+=c.up?3:2}
function personalLoss(n){S.hp=Math.max(0,S.hp-n);S.turnHpLoss=(S.turnHpLoss||0)+n;S.lossCount=(S.lossCount||0)+1;log(`Lost ${n} HP`);if(S.powers?.rupture)S.strength+=S.powers.rupture;if(S.powers?.inferno)for(let e of alive())hurtEnemy(e,S.infernoDamage||6,false)}
function drawCards(n,force=false){if(!S.canDraw&&!force){log('Cannot draw more cards this turn');return}for(let i=0;i<n;i++){if(S.hand.length>=10)break;if(!S.draw.length){if(!S.discard.length)break;S.draw=shuffle(S.discard.splice(0))}let c=S.draw.shift();if(S.powers?.hellraiser&&CARDS[c.key].name.includes('Strike')&&!S._drawingStrike){S._drawingStrike=true;let foe=choice(alive());if(foe)attack(foe,spec(c).dmg||6);S.discard.push(c);S._drawingStrike=false}else S.hand.push(c)}}
function startBattle(type){legacyStartBattle(type);S.exhaustedThisTurn=0;S.turnHpLoss=0;S.lossCount=0;S.tempStrength=0;S.plating=0;S.dexterity=0;S.colossus=0;S.oneTwo=0;S.nextAttackFree=false;S.blockGainedFromCard=false}
function checkEndBattle(){if(S.hp<=0){S.screen='death';busy=false;return true}if(alive().length===0){S.defeated=S.enemies.map(x=>x.name).join(', ');S.clearCount++;S.hp=Math.min(S.maxHP,S.hp+6);S.rewardGold=S.room==='Boss'?45:S.room==='Elite'?32:17;S.gold+=S.rewardGold;let commons=SOLO_POOL.filter(k=>CARDS[k].rarity!=='Rare'),rares=SOLO_POOL.filter(k=>CARDS[k].rarity==='Rare');S.offered=[...shuffle(commons).slice(0,2),choice(rares)].map(newCard);S.screen='reward';busy=false;return true}return false}
function chooseReward(uid){let c=S.offered.find(x=>x.uid===uid);if(c&&S.screen==='reward'){S.deck.push(c);moveToNext()}}
function shopScreen(){let cards=S.shopOffers||[];return `<main class="page screenpad"><section class="innerpanel"><div class="small">Merchant's lantern · Act ${S.act} · Floor ${S.floor}</div><h1 class="sectiontitle">The Lantern Merchant</h1><p class="subhead">Gold: <b>✦ ${S.gold}</b>. Select cards or healing.</p><div class="shopgrid">${cards.map((key,i)=>`<div class="shoprow"><div><b>${escapeHTML(CARDS[key].name)}</b><div class="note">${escapeHTML(CARDS[key].desc)}</div></div><button class="btn dark" data-buy="${i}" ${S.gold<55?'disabled':''}>55 ✦</button></div>`).join('')}<div class="shoprow"><div><b>Camp provisions</b><p class="note">Heal 18 HP.</p></div><button class="btn dark" data-action="buyheal" ${S.gold<40||S.hp===S.maxHP?'disabled':''}>40 ✦</button></div></div><button class="btn" data-action="leave">Leave merchant →</button></section></main>`}
function addVuln(e,n){if(!e||e.hp<=0)return;e.vulnerable+=n;if(S.powers?.vicious)drawCards(S.powers.vicious)}
function playCard(id){if(S.screen!=='battle'||busy)return;let pos=S.hand.findIndex(c=>c.uid===id);if(pos<0)return;let c=S.hand[pos],cost=updatedCost(c);if(cost!==-1&&cost>S.energy)return;S.hand.splice(pos,1);applyCard(c,{cost});save();render();triggerFX()}
function applyCard(c,opt={}){vfxActiveCard=c.key;if(S.screen!=='battle')return;let d=spec(c),enemy=targetEnemy(),cost=opt.cost??0;if(d.type==='Attack'&&!enemy)return;let X=cost===-1?S.energy:0;if(!opt.free){S.energy=cost===-1?0:S.energy-cost}else X=opt.x??1;if(d.type==='Attack'&&S.nextAttackFree)S.nextAttackFree=false;S.cardsPlayed++;log(`${d.name}${c.up?'+':''} played`);if(enemy?.key==='sentinel')enemy.slow++;if(d.type==='Attack'){S.attacksPlayed++;if(S.powers?.juggling&&S.attacksPlayed===3&&S.hand.length<10)S.hand.push({...c,uid:'c'+(++uid)});if(S.nextAttackFree)S.nextAttackFree=false}
 const power=(key,n=1)=>{S.powers[key]=(S.powers[key]||0)+n};let killed=false,base=(d.dmg||0)+(c.bonus||0);let aoe=false,hits=1,randomHits=0;
 switch(c.key){
 case 'body':base=S.block;break;
 case 'perfect':base=6+(c.up?3:2)*[...S.draw,...S.hand,...S.discard,...S.exhaust,c].filter(x=>CARDS[x.key]?.name.includes('Strike')).length;break;
 case 'ashen':base=6+(c.up?4:3)*S.exhaust.length;break;
 case 'bully':base=4+(c.up?3:2)*(enemy?.vulnerable||0);break;
 case 'pactsend':base=S.exhaust.length>=3?(d.dmg||18):0;aoe=true;break;
 case 'rampage':base=9+(c.bonus||0);c.bonus=(c.bonus||0)+(c.up?9:5);break;
 case 'spite':hits=S.turnHpLoss>0?(c.up?3:2):1;break;
 case 'tear':base=d.dmg||5;hits=1+(S.lossCount||0);break;
 case 'thrash':{base=(d.dmg||4)+(c.bonus||0);hits=2;break}
 case 'fiend':{let cs=S.hand.splice(0);for(let x of cs)exhaustCard(x);hits=cs.length;break}
 case 'whirlwind':hits=X;aoe=true;break;
 case 'conflag':hits=c.up?5:4;aoe=true;break;
 case 'swordboom':randomHits=c.up?4:3;break;
 case 'stomp':case 'breakthrough':case 'howl':case 'thunder':aoe=true;break;
 case 'dismantle':hits=enemy?.vulnerable?2:1;break;
 case 'twin':case 'fightme':hits=2;break;
 }
 // Self-damage is applied before the attack, including Rupture and Inferno triggers.
 if(c.key==='hemo'||c.key==='bloodwall')personalLoss(2);
 if(c.key==='bloodlet')personalLoss(3);
 if(c.key==='breakthrough'||c.key==='brand')personalLoss(1);
 if(c.key==='offering')personalLoss(6);
 const useAttack=()=>{if(d.type!=='Attack')return;if(randomHits){for(let i=0;i<randomHits;i++){let t=choice(alive());if(t)killed=attack(t,base)||killed}}else if(aoe){for(let i=0;i<hits;i++)for(let t of [...alive()])killed=attack(t,base)||killed}else if(hits>0)killed=attack(enemy,base,hits)};
 if(c.key==='ironwave')gainBlock(d.block||5);
 useAttack();
 if(c.key==='thrash'){let choices=S.hand.filter(x=>spec(x).type==='Attack');if(choices.length){let sacrificed=choice(choices);S.hand.splice(S.hand.indexOf(sacrificed),1);c.bonus=(c.bonus||0)+(spec(sacrificed).dmg||0);exhaustCard(sacrificed)}}
  // The repeated play resolves after the original attack's on-hit effects.
 if(d.type==='Attack'&&S.rage){gainBlock(S.rage,'effect');log(`Rage: +${S.rage} Block`)}
 switch(c.key){
 case 'bash':addVuln(enemy,c.up?3:2);break;
 case 'thunder':for(let e of alive())addVuln(e,1);break;
 case 'taunt':addVuln(enemy,c.up?2:1);break;
 case 'tremble':addVuln(enemy,c.up?4:3);break;
 case 'uppercut':if(enemy?.hp>0){blockDebuff(enemy,'weak',c.up?2:1);addVuln(enemy,c.up?2:1)}break;
 case 'molten':if(enemy?.hp>0)enemy.vulnerable*=2;break;
 case 'setupstrike':{let n=c.up?3:2;S.strength+=n;S.tempStrength=(S.tempStrength||0)+n;break}
 case 'fightme':S.strength+=c.up?4:3;if(enemy?.hp>0)enemy.strength++;break;
 case 'mangle':if(enemy?.hp>0){let lowered=c.up?15:10;enemy.tempStrengthDown=(enemy.tempStrengthDown||0)+lowered;enemy.strength-=lowered}break;
 case 'unrelenting':S.nextAttackFree=true;break;
 case 'bloodlet':grantEnergyV110(c.up?3:2);break;
 case 'forgotten':if(S.exhaustedThisTurn>0)grantEnergyV110(c.up?4:3);else log('Forgotten Ritual: no card Exhausted earlier this turn');break;
 case 'offering':grantEnergyV110(2);drawCards(c.up?5:3);break;
 case 'pommel':drawCards(c.up?2:1);break;
 case 'shrug':drawCards(1);break;
 case 'pillage':{for(let i=0;i<30;i++){let before=S.hand.length;drawCards(1);if(S.hand.length===before||spec(S.hand.at(-1)).type!=='Attack')break}break}
 case 'battletrance':drawCards(c.up?4:3);S.canDraw=false;break;
 case 'drum':drawCards(2);break;
 case 'evileye':gainBlock((c.up?11:8)*(S.exhaustedThisTurn?2:1));break;
 case 'expect':{const attacksInHand=S.hand.filter(x=>spec(x).type==='Attack').length;grantEnergyV110(attacksInHand);S.energyLocked=true;log(`Expect a Fight: +${attacksInHand} Energy; no further Energy gain this turn`);break;}
 case 'bloodwall':gainBlock(d.block||16);break;
 case 'colossus':gainBlock(d.block||4);S.colossus=1;break;
 case 'brand':S.strength+=c.up?2:1;chooseExhaustFromHand();break;
 case 'dominate':addVuln(enemy,c.up?2:1);S.strength+=enemy?.vulnerable||0;break;
 case 'notyet':S.hp=Math.min(S.maxHP,S.hp+(c.up?13:10));break;
 case 'onetwo':S.oneTwo+=c.up?2:1;break;
 case 'infernal':{let k=choice(SOLO_POOL.filter(x=>CARDS[x].type==='Attack'));if(k&&S.hand.length<10){let a=newCard(k);a.tempFree=true;S.hand.push(a)}break}
 case 'armaments':if(c.up)S.hand.forEach(x=>{if(UP[x.key])x.up=true});else if(S.hand.some(x=>!x.up&&UP[x.key]))modal={type:'upgradehand'};break;
 case 'truegrit':if(S.hand.length){if(c.up)chooseExhaustFromHand();else exhaustCard(S.hand.splice(Math.floor(Math.random()*S.hand.length),1)[0])}break;
 case 'cinder':if(S.hand.length)exhaustCard(S.hand.splice(Math.floor(Math.random()*S.hand.length),1)[0]);break;
 case 'burningpact':{let n=c.up?3:2;if(S.hand.length){modal={type:'chooseExhaust',afterDraw:n}}else drawCards(n);break}
 case 'headbutt':if(S.discard.length)modal={type:'discardtop'};break;
 case 'havoc':{let next=popDraw();if(next)applyCard(next,{free:true,cost:0,forcedExhaust:true});break}
 case 'cascade':for(let i=0;i<X+(c.up?1:0);i++){let next=popDraw();if(next)applyCard(next,{free:true,cost:0})}break;
 case 'secondwind':{let cs=S.hand.filter(x=>spec(x).type!=='Attack');S.hand=S.hand.filter(x=>spec(x).type==='Attack');for(let cc of cs){exhaustCard(cc);gainBlock(c.up?7:5)}break}
 case 'rage':S.rage+=c.up?5:3;break;
 case 'flames':S.flame+=c.up?6:4;break;
 case 'inflame':S.strength+=c.up?3:2;queueFX('hero',c.up?3:2,'buff');break;
 case 'anger':S.discard.push({...c,uid:'c'+(++uid)});break;
 case 'primal':S.hand=S.hand.map(x=>{if(spec(x).type!=='Attack')return x;let a=newCard('giantrock');a.up=!!c.up;return a});break;
 case 'stoke':{let count=S.hand.length;for(let cc of S.hand.splice(0))exhaustCard(cc);for(let i=0;i<count;i++)if(S.hand.length<10){let made=newCard(choice(SOLO_POOL));if(c.up)made.up=!!UP[made.key];S.hand.push(made)}break}
 case 'fiend':if(killed)log('Fiend Fire struck the final blow');break;
 case 'feed':if(killed){let n=c.up?4:3;S.maxHP+=n;S.hp+=n;log(`Fatal: +${n} Max HP`)}break;
 }
 if(!opt.repeat&&d.type==='Attack'&&S.oneTwo>0&&S.screen==='battle'&&alive().length){S.oneTwo--;applyCard(c,{free:true,cost:0,repeat:true,x:X})}
 if(d.block&&!['ironwave','evileye','expect','bloodwall','colossus'].includes(c.key))gainBlock(d.block);
 if(d.type==='Power'&&c.key!=='inflame'){power(c.key,c.key==='demon'?(c.up?3:2):c.key==='vicious'?(c.up?2:1):c.key==='feel'?(c.up?4:3):1);if(c.key==='pyre')S.powers.pyre+=c.up?1:0;if(c.key==='cruelty'){S.crueltyPct=(S.crueltyPct||0)+(c.up?.5:.25);S.crueltyBonus=1.5+S.crueltyPct;}if(c.key==='stonearmor')S.plating+=c.up?6:4;if(c.key==='juggernaut')S.juggernautDamage=c.up?8:6;if(c.key==='crimson')S.crimsonBlock=(S.crimsonBlock||0)+(c.up?10:7);if(c.key==='inferno')S.infernoDamage=(S.infernoDamage||0)+(c.up?9:6)}
 if(!opt.repeat){if(d.exhaust||opt.forcedExhaust)exhaustCard(c);else if(d.type!=='Power')S.discard.push(c);}
 if(S.hp<=0){S.screen='death';busy=false}else if(!alive().length)checkEndBattle();
 if(S.screen==='battle'&&(!S.enemies[S.target]||S.enemies[S.target].hp<=0))S.target=S.enemies.findIndex(e=>e.hp>0)
}
function popDraw(){if(!S.draw.length&&S.discard.length)S.draw=shuffle(S.discard.splice(0));return S.draw.shift()}
function chooseExhaustFromHand(){if(S.hand.length)modal={type:'chooseExhaust'}}
async function endTurn(){if(busy||S.screen!=='battle')return;
 // End-of-turn powers, preserving the original enemy AI and attack animation system.
 if(S.powers?.stampede){for(let i=0;i<S.powers.stampede;i++){let cs=S.hand.filter(c=>spec(c).type==='Attack');if(cs.length){let c=choice(cs);S.hand.splice(S.hand.indexOf(c),1);applyCard(c,{free:true,cost:0})}}}
 for(let c of [...S.exhaust.filter(c=>c.key==='howl')]){S.exhaust.splice(S.exhaust.indexOf(c),1);for(let e of [...alive()])attack(e,spec(c).dmg||18);S.discard.push(c)}
 if(S.tempStrength){S.strength-=S.tempStrength;S.tempStrength=0}
 S.rage=0;S.oneTwo=0; // Turn-only effects expire at the end of the player's turn.
 if(checkEndBattle()){save();render();return}
 await legacyEndTurn();
 if(S.screen!=='battle'){save();render();return}
 S.exhaustedThisTurn=0;S.turnHpLoss=0;S.blockGainedFromCard=false;for(let pile of [S.draw,S.discard,S.hand,S.exhaust])for(let card of pile)card.tempFree=false;
 if(S.powers?.pyre)S.energy+=S.powers.pyre;
 if(S.powers?.crimson){personalLoss(S.powers.crimson);gainBlock(S.crimsonBlock||7*S.powers.crimson)}
 if(S.powers?.inferno)personalLoss(S.powers.inferno);
 if(S.powers?.aggression){for(let i=0;i<S.powers.aggression;i++){let cs=S.discard.filter(c=>spec(c).type==='Attack');if(cs.length&&S.hand.length<10){let c=choice(cs);S.discard.splice(S.discard.indexOf(c),1);if(UP[c.key])c.up=true;S.hand.push(c)}}}
 
 for(let e of S.enemies){if(e.tempStrengthDown){e.strength+=e.tempStrengthDown;e.tempStrengthDown=0}}
 S.colossus=0;
 if(S.hp<=0)S.screen='death';save();render();triggerFX()
}
