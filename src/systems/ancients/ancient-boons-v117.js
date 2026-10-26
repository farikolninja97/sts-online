/* Ember Descent V1.17 — standalone Ancient-bonus system (STS2 main v0.107.1).
   Neow starts Act 1. Acts 2/3 use a curated, fully implemented subset of
   the act-specific Ancients: Pael/Tezcatara and Nonupeipe/Tanx.
   Each offered item is persisted before selection, and committed once.
   The original core systems are wrapped, not rewritten. */
'use strict';
const ANCIENT_V117={
 // Act 1: two positive offers and one risky third offer.
 neow_gold:{name:'Golden Pearl',icon:'🟡',desc:'Upon pickup, gain 150 Gold.',risk:false},
 neow_oyster:{name:'Nutritious Oyster',icon:'🦪',desc:'Raise your Max HP by 11.',risk:false},
 neow_rare:{name:'Arcane Scroll',icon:'📜',desc:'Obtain a random Rare Ironclad card.',risk:false},
 neow_small:{name:'Small Capsule',icon:'🎁',desc:'Obtain one random relic.',risk:false},
 neow_booming:{name:'Booming Conch',icon:'🐚',desc:'At the start of Elite combats, draw 2 additional cards and gain 1 Energy.',risk:false},
 neow_talisman:{name:"Neow's Talisman",icon:'🪬',desc:'Upon pickup, upgrade one Strike and one Defend in your deck.',risk:false},
 neow_phial:{name:'Phial Holster',icon:'⚗️',desc:'Gain 1 potion slot and obtain 2 random potions.',risk:false},
 neow_cursed:{name:'Cursed Pearl',icon:'🔮',desc:'Gain 333 Gold, but permanently add Greed (Unplayable, Eternal) to your deck.',risk:true},
 neow_large:{name:'Large Capsule',icon:'📦',desc:'Gain 2 random relics, but add an extra Strike and Defend to your deck.',risk:true},
 // Act 2: these are actual choices from each named Ancient's pool.
 pael_flesh:{name:'Pael Flesh',icon:'🩸',desc:'Gain 1 extra Energy each turn beginning with turn 3.',risk:false},
 pael_tears:{name:'Pael Tears',icon:'💧',desc:'If you end your turn with unspent Energy, gain 2 Energy next turn.',risk:false},
 pael_blood:{name:'Pael Blood',icon:'🧬',desc:'Draw 1 additional card at the start of every turn.',risk:false},
 tez_cocoa:{name:'Very Hot Cocoa',icon:'☕',desc:'At the start of combat, gain 4 extra Energy on turn 1.',risk:false},
 tez_cookie:{name:'Yummy Cookie',icon:'🍪',desc:'Upgrade 4 random eligible cards in your deck.',risk:false},
 tez_seal:{name:'Seal of Gold',icon:'🪙',desc:'Lose 5 Gold upon pickup. Gain 1 extra Energy each turn.',risk:false},
 // Act 3: selected choices that can be implemented without missing engine systems.
 nonu_fruit:{name:'Looming Fruit',icon:'🍑',desc:'Raise your Max HP by 31.',risk:false},
 nonu_ring:{name:'Signet Ring',icon:'💍',desc:'Upon pickup, gain 999 Gold.',risk:false},
 nonu_frond:{name:'Delicate Frond',icon:'🌿',desc:'At the start of each combat, fill all empty potion slots with random potions.',risk:false},
 tanx_sai:{name:'Sai',icon:'🛡️',desc:'Gain 7 Block at the start of every turn.',risk:false},
 tanx_club:{name:'Iron Club',icon:'🔨',desc:'Every 4 cards you play, draw 1 card.',risk:false},
 tanx_hammer:{name:'War Hammer',icon:'⚒️',desc:'After defeating an Elite, upgrade 4 random eligible cards.',risk:false}
};
// Treat Ancient boons as relic-like inventory entries. Keep them OUT of the
// general relic pool, which was created before this script loaded.
for (const [id,boon] of Object.entries(ANCIENT_V117)){
 RELICS['anc_'+id]={name:boon.name,icon:boon.icon,rarity:'Ancient',description:boon.desc,trigger:'ancient'};
}
const ANCIENT_V117_IDENTITIES={
 1:{name:'Neow',title:'Mother of Resurrection',portrait:'🐋',intro:'Rise... champion... again.'},
 2:[{name:'Pael',title:'Melting Dragon',portrait:'🐉',intro:'The dragon offers power at a price of patience.',offers:['pael_flesh','pael_tears','pael_blood']},
    {name:'Tezcatara',title:'It Which Feeds the Fire',portrait:'🔥',intro:'Warmth blooms from an impossible flame.',offers:['tez_cocoa','tez_cookie','tez_seal']}],
 3:[{name:'Nonupeipe',title:'Serendipity Incarnate',portrait:'🦌',intro:'An Ancient of marvelous fortunes appears.',offers:['nonu_fruit','nonu_ring','nonu_frond']},
    {name:'Tanx',title:'Khimera King',portrait:'🦁',intro:'A warrior king presents three martial boons.',offers:['tanx_sai','tanx_club','tanx_hammer']}]
};
function ancientV117Start(act){
 if(!S||!(act in ANCIENT_V117_IDENTITIES)||S.ancientHistory?.some(b=>b.act===act))return false;
 let who,offers;
 if(act===1){
  who=ANCIENT_V117_IDENTITIES[1];
  const cursed=choice(['neow_cursed','neow_large']);
  const positives=Object.keys(ANCIENT_V117).filter(x=>x.startsWith('neow_')&&!ANCIENT_V117[x].risk &&
     // The cursed gold offer is not paired with Golden Pearl.
     !(cursed==='neow_cursed'&&x==='neow_gold')&&
     // Large Capsule isn't offered alongside Small Capsule.
     !(cursed==='neow_large'&&x==='neow_small'));
  offers=[...shuffle(positives).slice(0,2),cursed];
 }else{
  who=choice(ANCIENT_V117_IDENTITIES[act]);offers=[...who.offers];
 }
 const missing=Math.max(0,S.maxHP-S.hp);
 // STS2 Ascension 2+ heals 80% of missing health; this prototype exposes A9+.
 const restored=S.asc9?Math.ceil(missing*.8):missing;
 S.hp=Math.min(S.maxHP,S.hp+restored);
 S.ancientPending={act,name:who.name,title:who.title,portrait:who.portrait,intro:who.intro,offers,selected:null,heal:restored};
 S.ancientHistory??=[];S.screen='ancient';modal=null;save();return true;
}
function ancientV117Eligible(){return S.deck.filter(c=>!c.up&&UP[c.key]);}
function ancientV117Upgrade(n=1,predicate=()=>true){let options=shuffle(ancientV117Eligible().filter(predicate));let selected=options.slice(0,n);for(let c of selected)c.up=true;return selected.length;}
function ancientV117Boon(id){return !!S?.relics?.includes('anc_'+id)};
function ancientV117Apply(id){
 // Invoked exclusively by a confirmed offer. Never on render or load.
 const gain=()=>gainRelic('anc_'+id);
 const randomRelic=()=>{let r=relicRoll();if(r)gainRelic(r);return r};
 switch(id){
 case 'neow_gold':S.gold+=150;break;
 case 'neow_oyster':S.maxHP+=11;S.hp+=11;break;
 case 'neow_rare':{
   let rare=SOLO_POOL.filter(k=>CARDS[k]?.rarity==='Rare');
   if(rare.length)S.deck.push(newCard(choice(rare)));break;
 }
 case 'neow_small':randomRelic();break;
 case 'neow_talisman':
   ancientV117Upgrade(1,c=>c.key==='strike');ancientV117Upgrade(1,c=>c.key==='defend');break;
 case 'neow_phial':
   edEnsurePotions();S.potionSlots++;for(let i=0;i<2;i++)edGivePotion(edOfferPotion());break;
 case 'neow_cursed':S.gold+=333;S.deck.push(newCard('greed'));break;
 case 'neow_large':randomRelic();randomRelic();S.deck.push(newCard('strike'));S.deck.push(newCard('defend'));break;
 case 'tez_cookie':ancientV117Upgrade(4);break;
 case 'tez_seal':S.gold=Math.max(0,S.gold-5);break;
 case 'nonu_fruit':S.maxHP+=31;S.hp+=31;break;
 case 'nonu_ring':S.gold+=999;break;
 // The remaining boons are permanent passive triggers handled below.
 }
 gain();
}
function ancientV117Confirm(){
 const b=S?.ancientPending,id=b?.selected;
 if(S?.screen!=='ancient'||!b||!b.offers.includes(id)||S.ancientHistory?.some(x=>x.act===b.act))return false;
 // The lock occurs BEFORE awarding loot, preventing repeat actions.
 S.ancientHistory??=[];S.ancientHistory.push({act:b.act,ancient:b.name,offer:id});
 ancientV117Apply(id);
 S.ancientPending=null;S.screen='route';modal=null;save();render();return true;
}
function ancientV117Screen(){
 const b=S.ancientPending;if(!b)return '<main class="page screenpad"><h1>Choose an Ancient</h1></main>';
 return `<main class="page ed117-ancient-page"><section class="ed117-ancient-panel">
 <div class="ed117-ancient-hero" aria-hidden="true"><div class="ed117-sigil">${b.portrait}</div><div class="ed117-halo"></div></div>
 <div class="ed117-ancient-content"><div class="small">ANCIENT ENCOUNTER · ACT ${b.act}</div><h1>${escapeHTML(b.name)}</h1>
 <div class="ed117-subtitle">${escapeHTML(b.title)}</div><p class="ed117-quote">“${escapeHTML(b.intro)}”</p>
 <p class="ed117-heal">♥ ${b.heal?`Restored ${b.heal} HP upon entering`:'Your HP is restored'} · Pick one Ancient relic</p>
 <div class="ed117-ancient-choices">${b.offers.map((id,index)=>{const boon=ANCIENT_V117[id];return `<button class="ed117-offer ${b.selected===id?'selected':''} ${boon.risk?'risky':''}" type="button" data-ancient-pick="${id}" aria-pressed="${b.selected===id?'true':'false'}">
 <span class="ed117-relic-icon">${boon.icon}</span><span class="ed117-offer-text"><strong>${escapeHTML(boon.name)}</strong><small>${boon.risk?'RISK & REWARD · ':'ANCIENT RELIC · '}OFFER ${index+1}</small><span>${escapeHTML(boon.desc)}</span></span><span class="ed117-check">${b.selected===id?'✓':'◇'}</span>
 </button>`}).join('')}</div>
 <div class="ed117-ancient-actions"><button class="btn primary ed117-confirm" data-ancient-confirm ${b.selected?'':'disabled'}>${b.selected?'Claim '+escapeHTML(ANCIENT_V117[b.selected].name):'Choose one blessing'}</button>
 <p class="note">Inspect and choose freely; only Confirm claims the relic. You cannot claim the same blessing twice.</p></div>
 </div></section></main>`;
}
const ed117RenderBase=render;
render=function(){
 if(S?.screen!=='ancient')return ed117RenderBase();
 // Preserve existing banner / toolbox / overlays without replacing the whole UI.
 const current=S.screen;S.screen='route';
 try{ed117RenderBase()}finally{S.screen=current}
 const currentPage=document.querySelector('#app main.page');
 if(currentPage)currentPage.outerHTML=ancientV117Screen();
 document.body.classList.remove('oncombat');
};
// Hook at the end of the wrapper chain so relic/potion/loot state initializes first.
const ed117NewGameBase=newGame;
newGame=function(){ed117NewGameBase();S.ancientHistory=[];ancientV117Start(1);render()};
const ed117MoveNextBase=moveToNext;
moveToNext=function(){const previous=S?.act;const result=ed117MoveNextBase();
 if(S&&S.act!==previous&&S.screen==='route'){ancientV117Start(S.act);render()}
 return result;
};
const ed117StartBattleBase=startBattle;
startBattle=function(kind){ed117StartBattleBase(kind);if(!S||S.screen!=='battle')return;
 if(kind==='elite'&&ancientV117Boon('neow_booming')){S.energy+=1;drawCards(2,true)}
 if(ancientV117Boon('tez_cocoa')&&S.turn===1)S.energy+=4;
 if(ancientV117Boon('tez_seal'))S.energy+=1;
 if(ancientV117Boon('pael_blood'))drawCards(1,true);
 if(ancientV117Boon('nonu_frond')){edEnsurePotions();while(S.potions.length<S.potionSlots)edGivePotion(edOfferPotion())}
 if(ancientV117Boon('tanx_sai'))gainBlock(7,'effect');
 S.ancientCounts??={cards:0};save();
};
const ed117EndTurnBase=endTurn;
endTurn=async function(){if(!S||S.screen!=='battle'||busy)return;
 const paelBonus=ancientV117Boon('pael_tears')&&S.energy>0;
 await ed117EndTurnBase();
 if(S?.screen!=='battle')return;
 if(ancientV117Boon('pael_flesh')&&S.turn>=3)S.energy+=1;
 if(paelBonus)S.energy+=2;
 if(ancientV117Boon('tez_seal'))S.energy+=1;
 if(ancientV117Boon('pael_blood'))drawCards(1,true);
 if(ancientV117Boon('tanx_sai'))gainBlock(7,'effect');
 save();render();
};
const ed117ApplyCardBase=applyCard;
applyCard=function(card,options={}){
 const prior=S?.cardsPlayed||0;const result=ed117ApplyCardBase(card,options);
 if(S?.screen==='battle'&&S.cardsPlayed>prior&&ancientV117Boon('tanx_club')){
  S.ancientCounts??={cards:0};S.ancientCounts.cards++;
  if(S.ancientCounts.cards%4===0)drawCards(1,true);
 }
 return result;
};
const ed117CheckEndBattleBase=checkEndBattle;
checkEndBattle=function(){const elite=S?.screen==='battle'&&S.room==='Elite'&&S.hp>0&&S.enemies?.length&&!alive().length;
 const result=ed117CheckEndBattleBase();
 if(elite&&S.screen==='reward'&&ancientV117Boon('tanx_hammer')){
  S.ancientCounts??={};
  if(S.ancientCounts.lastWarHammerClear!==S.clearCount){
   ancientV117Upgrade(4);S.ancientCounts.lastWarHammerClear=S.clearCount;
  }
 }
 return result;
};
document.addEventListener('click',e=>{
 const select=e.target.closest('[data-ancient-pick]');if(select){e.preventDefault();e.stopImmediatePropagation();
  if(S?.screen!=='ancient'||!S.ancientPending?.offers.includes(select.dataset.ancientPick))return;
  S.ancientPending.selected=select.dataset.ancientPick;save();render();return;
 }
 const confirm=e.target.closest('[data-ancient-confirm]');if(confirm){e.preventDefault();e.stopImmediatePropagation();ancientV117Confirm();return}
},true);
// If a V1.17 save is reopened during boon selection, the same choices persist.
// Existing V1.16 saves remain playable: we don't insert a new Act 1 screen mid-run.
if(S?.screen==='ancient'&&S.ancientPending)render();
