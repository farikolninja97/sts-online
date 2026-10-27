// Initial game loop, card effects and input event handlers; see architecture notes.
function generateRoute(){let i=S.floor;let phases=[['normal','normal'],['normal','event'],['normal','elite'],['rest','shop'],['normal','normal'],['event','elite'],['rest','shop'],['normal','elite'],['boss']];S.routeOptions=phases[Math.min(i,8)].slice();}
function newGame(){uid=0;modal=null;S={screen:'route',act:1,floor:0,hp:80,maxHP:80,energy:3,block:0,strength:0,weak:0,vulnerable:0,frail:0,tangled:0,shrink:false,flame:0,rage:0,gold:99,powers:{},deck:[...Array(5)].map(()=>newCard('strike')).concat([...Array(4)].map(()=>newCard('defend')),newCard('bash')),draw:[],discard:[],hand:[],exhaust:[],enemies:[],target:0,turn:1,log:[],offered:[],room:'',clearCount:0,asc9:false,canDraw:true,cardsPlayed:0,attacksPlayed:0,cardLoseCount:0,finished:false,looted:false,routeOptions:[],totalFloors:0};generateRoute();save();render()}
function moveToNext(){S.totalFloors=(S.totalFloors||0)+1;if(S.floor===9){if(S.act>=3){S.screen='victory'}else{S.act++;S.floor=0;S.screen='route';generateRoute()}}else{S.screen='route';generateRoute()}save();render()}
function takeRoom(type){if(S.screen!=='route')return;S.floor++; S.room=type==='normal'?'Battle':type==='elite'?'Elite':type==='boss'?'Boss':type;S.shopOffers=null;
 if(['normal','elite','boss'].includes(type))startBattle(type);
 else if(type==='shop'){S.screen='shop';S.shopOffers=shuffle(POOL).slice(0,3)}
 else S.screen=type;
 save();render();}
function makeEnemy(k,i){let d=ENEMIES[k],h=d.hp+(S.asc9?1:0);return {id:i,key:k,name:d.name,art:d.art,hp:h,maxHP:h,block:0,strength:0,weak:0,vulnerable:0,ritual:0,step:0,stunned:false,slow:0}}
function legacyStartBattle(type){
 let sets={1:[['mite'],['marauder'],['archer','axe'],['mite','archer'],['marauder','axe']],2:[['feeder'],['whelp','silk'],['acolyte'],['feeder','whelp'],['silk']],3:[['vine'],['stone'],['stone','silk'],['vine','whelp'],['stone','vine']]};
 let group=type==='elite'?['sentinel']:type==='boss'?(S.act===1?['sentinel','mite']:S.act===2?['feeder','stone']:['sentinel','vine']):choice(sets[S.act]);
 S.enemies=group.map(makeEnemy);S.target=0;S.draw=shuffle(S.deck.map(c=>({...c})));S.discard=[];S.hand=[];S.exhaust=[];
 S.energy=3;S.block=0;S.strength=0;S.weak=0;S.vulnerable=0;S.frail=0;S.tangled=0;S.shrink=false;S.flame=0;S.rage=0;S.powers={};S.turn=1;S.canDraw=true;S.cardsPlayed=0;S.attacksPlayed=0;S.log=[];S.screen='battle';
 log(`Encounter: ${S.enemies.map(e=>e.name).join(' + ')}`);let innates=S.draw.filter(c=>spec(c).innate);S.draw=S.draw.filter(c=>!spec(c).innate);S.hand.push(...innates.slice(0,10));drawCards(Math.max(0,5-S.hand.length));}
function drawCards(n,force=false){if(!S.canDraw&&!force){log('Cannot draw more cards this turn');return}for(let i=0;i<n;i++){if(S.hand.length>=10)break;if(!S.draw.length){if(!S.discard.length)break;S.draw=shuffle(S.discard.splice(0))}S.hand.push(S.draw.shift())}}
function gainBlock(amount){let n=Math.max(0,Math.floor(amount*(S.frail>0?.75:1)));S.block+=n;if(n>0&&S.powers.juggernaut){for(let i=0;i<S.powers.juggernaut;i++)dealRawToRandom(5)}log(`Gained ${n} Block`);return n}
function dealRawToRandom(amount){let e=choice(alive());if(!e)return;hurtEnemy(e,amount,false)}
function hurtEnemy(e,dmg,attack=true){if(!e||e.hp<=0)return 0;const blocked=Math.min(e.block,dmg);e.block-=blocked;let dealt=Math.min(e.hp,Math.max(0,dmg-blocked));e.hp-=dealt;queueFX(e.id,dealt,'hit',{blocked,incoming:dmg,style:attack?vfxStyleForCard(vfxActiveCard):'ember',source:'hero'});if(e.hp<=0)queueFX(e.id,0,'death',{style:attack?vfxStyleForCard(vfxActiveCard):'ember'});return dealt}
function dmgCard(e,base){let dmg=Math.max(0,base+(S.strength||0));if(S.weak>0)dmg=Math.floor(dmg*.75);if(S.shrink)dmg=Math.floor(dmg*.7);if(e.vulnerable>0)dmg=Math.floor(dmg*1.5);if(e.key==='sentinel'){dmg=Math.floor(dmg*(1+e.slow*.1));}return dmg}
function attack(e,base,hits=1){if(!e||e.hp<=0)return false;let killed=false;for(let i=0;i<hits;i++){if(e.hp<=0)break;let n=dmgCard(e,base);let dealt=hurtEnemy(e,n,true);/* V1.23: Shrink removal is managed by the caster's death, including non-card kills. */log(`${e.name} takes ${dealt} damage${e.block?' (blocked)':''}`);if(e.hp<=0)killed=true;}return killed}
let fx=[];
function queueFX(id,n,type){fx.push({id,n,type})}
function triggerFX(){let jobs=fx.splice(0);for(let q of jobs){let sel=q.id==='hero'?'[data-character="hero"]':`[data-enemy="${q.id}"]`;let dest=$(sel);if(!dest)continue;let a=dest.querySelector('.avatar');if(a){a.classList.remove('hurt','casting','striking');void a.offsetWidth;a.classList.add(q.type==='buff'?'casting':'hurt');}let bubble=document.createElement('div');bubble.className='floatnum '+(q.type==='buff'?'green':'');bubble.textContent=(q.type==='buff'?'+':'−')+q.n;dest.appendChild(bubble);setTimeout(()=>bubble.remove(),900);if(q.type==='hit'){let slash=document.createElement('div');slash.className='slash';dest.appendChild(slash);setTimeout(()=>slash.remove(),400)}}}
function exhaustCard(c){S.exhaust.push(c);if(S.powers.feel){gainBlock(S.powers.feel*3)}}
function personalLoss(n){S.hp=Math.max(0,S.hp-n);log(`Lost ${n} HP`);if(S.powers.rupture)S.strength+=S.powers.rupture}
function checkEndBattle(){if(S.hp<=0){S.screen='death';busy=false;return true}if(alive().length===0){S.defeated=S.enemies.map(x=>x.name).join(', ');S.clearCount++;S.hp=Math.min(S.maxHP,S.hp+6);S.rewardGold=S.room==='Boss'?45:S.room==='Elite'?32:17; // V1.16: loot is awarded only when its claim button is pressed.
  S.offered=shuffle(POOL.filter(k=>CARDS[k].rarity!=='Rare')).slice(0,2).concat([choice(POOL.filter(k=>CARDS[k].rarity==='Rare'))]).map(newCard);
  S.screen='reward';busy=false;return true}return false;}
function playCard(id){if(S.screen!=='battle'||busy)return;let pos=S.hand.findIndex(c=>c.uid===id);if(pos<0)return;let c=S.hand[pos],d=spec(c),cost=updatedCost(c);if(cost!==-1&&cost>S.energy)return;
 let enemy=targetEnemy();if(d.type==='Attack'&&!enemy)return;
 S.hand.splice(pos,1);let x=cost===-1?S.energy:0;S.energy=cost===-1?0:S.energy-cost;
 log(`${d.name}${c.up?'+':''} played`);S.cardsPlayed++;if(enemy?.key==='sentinel')enemy.slow++;
 if(d.type==='Attack'&&S.rage)gainBlock(S.rage*3);
 if(d.type==='Attack')S.attacksPlayed++;
 let base=d.dmg||0,killed=false;
 if(c.key==='body')base=S.block;
 if(c.key==='fiend'){let num=S.hand.length;for(let cc of S.hand.splice(0))exhaustCard(cc);if(num)killed=attack(enemy,base,num)}
 else if(c.key==='whirlwind'){for(let i=0;i<x;i++)for(let e of alive())attack(e,base)}
 else if(d.type==='Attack'&&d.aoe){for(let e of alive())attack(e,base)}
 else if(d.type==='Attack'){if(c.key==='ironwave')gainBlock(d.block||0);killed=attack(enemy,base,d.hits||1)}
 if(d.block&&c.key!=='ironwave')gainBlock(d.block);
 if(c.key==='bash'&&enemy?.hp>0)enemy.vulnerable+=c.up?3:2;
 if(c.key==='thunder')for(let e of alive())e.vulnerable++;
 if(c.key==='uppercut'&&enemy?.hp>0){enemy.weak+=c.up?2:1;enemy.vulnerable+=c.up?2:1}
 if(c.key==='anger'){S.discard.push({...c,uid:'c'+(++uid)})}
 if(c.key==='pommel'||c.key==='shrug')drawCards(c.up&&c.key==='pommel'?2:1);
 if(c.key==='inflame'){S.strength+=c.up?3:2;queueFX('hero',c.up?3:2,'buff')}
 if(c.key==='flames')S.flame+=c.up?6:4;
 if(c.key==='battletrance'){drawCards(c.up?4:3);S.canDraw=false}
 if(c.key==='offering'){personalLoss(6);S.energy+=2;drawCards(c.up?5:3)}
 if(c.key==='armaments'){if(c.up){S.hand.forEach(v=>{if(UP[v.key])v.up=true})}else if(S.hand.some(v=>!v.up&&UP[v.key])){modal={type:'upgradehand'}}}
 if(c.key==='truegrit'){if(c.up&&S.hand.length){modal={type:'chooseExhaust'}}else if(S.hand.length){exhaustCard(S.hand.splice(Math.floor(Math.random()*S.hand.length),1)[0])}}
 if(c.key==='feed'&&killed){let n=c.up?4:3;S.maxHP+=n;S.hp+=n;log(`Fatal: +${n} Max HP`)}
 if(d.type==='Power'){if(c.key!=='inflame')S.powers[c.key]=(S.powers[c.key]||0)+1}else if(d.exhaust){exhaustCard(c)}else S.discard.push(c);
 if(!S.enemies[S.target]||S.enemies[S.target].hp<=0)S.target=S.enemies.findIndex(e=>e.hp>0);
 if(checkEndBattle()){modal=null}
 save();render();triggerFX();}
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
async function legacyEndTurn(){if(busy||S.screen!=='battle')return;busy=true;
 S.discard.push(...S.hand.splice(0));S.flame=S.flame||0;S.weak=Math.max(0,S.weak-1);S.vulnerable=Math.max(0,S.vulnerable-1);S.frail=Math.max(0,S.frail-1);S.tangled=Math.max(0,(S.tangled||0)-1);
 for(let e of [...alive()]){
  if(S.hp<=0||S.screen!=='battle')break;
  let m=moveFor(e),kind=m.kind;
  log(`${e.name}: ${m.n}`);render();
  let source=$(`[data-enemy="${e.id}"] .avatar`);if(source){source.classList.remove('striking','casting');void source.offsetWidth;source.classList.add(kind==='attack'?'striking':'casting')}
  await sleep(470);
  if(kind==='attack'){
   for(let i=0;i<(m.hits||1);i++){
    let dmg=adjustedEnemyDamage(e,m),absorbed=Math.min(S.block,dmg);S.block-=absorbed;let hpHit=Math.max(0,dmg-absorbed);S.hp=Math.max(0,S.hp-hpHit);
    log(`${e.name} attacks for ${dmg} (${absorbed} blocked)`);queueFX('hero',hpHit,'hit');
    if(e.key==='stone'&&hpHit===0&&absorbed>0)e.nextStun=true;
    if(S.flame>0)hurtEnemy(e,S.flame,false);
    if(S.hp===0)break;
   }
   if(m.block)e.block+=(S.asc9&&e.key==='axe'?6:S.asc9&&e.key==='whelp'?8:m.block);
    if(m.tangled)S.tangled=(S.tangled||0)+m.tangled;
  }
  if(kind==='buff'){
   if(m.strength){let amount=e.key==='feeder'&&S.asc9?16:m.strength;e.strength+=amount;queueFX(e.id,amount,'buff')}
   if(m.block)e.block+=m.block;
   if(m.ritual)e.ritual+=m.ritual;
  }
  if(kind==='debuff'){
   if(m.shrink)S.shrink=true;
   if(m.weak)S.weak+=m.weak;
  }
  if(e.ritual>0&&e.step>0)e.strength+=e.ritual;
  e.step++;if(e.stunned)e.stunned=false;
  if(e.nextStun){e.stunned=true;e.nextStun=false}
  if(e.weak>0)e.weak--;if(e.vulnerable>0)e.vulnerable--;
  if(checkEndBattle())break;
  render();triggerFX();await sleep(230);
 }
 if(S.screen==='battle'){
  S.turn++;S.energy=3;S.canDraw=true;S.cardsPlayed=0;S.attacksPlayed=0;S.flame=0;
  S.block=S.powers.barricade?S.block:0;
  if(S.powers.demon)S.strength+=S.powers.demon;
  for(let e of alive()){e.block=0;if(e.key==='sentinel')e.slow=0}
  drawCards(5,true);log('Your turn');
 }
 busy=false;save();render();triggerFX();}
function chooseReward(uid){let selected=S.offered.find(c=>c.uid===uid);if(!selected||S.screen!=='reward')return;S.deck.push(selected);moveToNext()}
function showToast(msg){let t=document.createElement('div');t.className='tiny-toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),1900)}
function resolveChoice(uid){if(!modal)return;let type=modal.type;let idx=S.hand.findIndex(c=>c.uid===uid);if(idx<0)return;if(type==='chooseExhaust'){exhaustCard(S.hand.splice(idx,1)[0])}if(type==='upgradehand'&&UP[S.hand[idx].key])S.hand[idx].up=true;modal=null;save();render()}
function applyUpgrade(uid){let c=S.deck.find(x=>x.uid===uid);if(c&&!c.up&&UP[c.key]){c.up=true;modal=null;moveToNext()}}
function act(action){if(action==='new'||action==='restart'){newGame();return}if(action==='how'){modal={type:'how'};render();return}if(!S)return;
 if(action==='menu'||action==='deck'||action==='piles'){modal={type:action};render();return}
 if(action==='close'||action==='choicecancel'){modal=null;render();return}
 if(action==='end'){endTurn();return}
 if(action==='skipreward'||action==='leave'){moveToNext();return}
 if(action==='restheal'){S.hp=Math.min(S.maxHP,S.hp+Math.ceil(S.maxHP*.3));moveToNext();return}
 if(action==='restupgrade'){modal={type:'smith'};render();return}
 if(action==='buyheal'){if(S.gold>=40&&S.hp<S.maxHP){S.gold-=40;S.hp=Math.min(S.maxHP,S.hp+18);save();render()}return}
}
document.addEventListener('click',evt=>{
 let e=evt.target.closest('[data-action],[data-room],[data-enemy],[data-play],[data-rewardcard],[data-choice],[data-upgrade],[data-buy],[data-event]');
 if(!e)return;
 if(e.dataset.action){act(e.dataset.action);return}
 if(e.dataset.room){takeRoom(e.dataset.room);return}
 if(e.dataset.enemy!==undefined){if(S?.screen==='battle'&&!busy){let id=Number(e.dataset.enemy);S.target=S.enemies.findIndex(x=>x.id===id);save();render()}return}
 if(e.dataset.play){playCard(e.dataset.play);return}
 if(e.dataset.rewardcard){chooseReward(e.dataset.rewardcard);return}
 if(e.dataset.choice){resolveChoice(e.dataset.choice);return}
 if(e.dataset.upgrade){applyUpgrade(e.dataset.upgrade);return}
 if(e.dataset.buy!=null){let id=Number(e.dataset.buy),key=S.shopOffers?.[id];if(key&&S.gold>=55){S.gold-=55;S.deck.push(newCard(key));S.shopOffers.splice(id,1);save();render()}return}
 if(e.dataset.event){if(e.dataset.event==='life'){personalLoss(6);S.gold+=80}else if(e.dataset.event==='forge'){let possible=S.deck.filter(c=>!c.up&&UP[c.key]);if(possible.length)choice(possible).up=true}if(S.hp<=0){S.screen='death';save();render()}else moveToNext();return}
});
document.addEventListener('change',e=>{if(e.target?.dataset?.setting==='asc9'&&S){S.asc9=!!e.target.checked;save();render()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal){modal=null;render()}if(e.key==='Enter'&&e.target?.dataset?.enemy!==undefined)e.target.click()});

