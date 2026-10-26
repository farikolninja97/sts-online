// V1.15 | Main-branch-inspired consumables. Effects are local and deterministic.
'use strict';
function edEnsurePotions(){if(!S)return;S.potions=Array.isArray(S.potions)?S.potions:[];S.potionSlots=Number.isInteger(S.potionSlots)?S.potionSlots:3;S.potionReward??=null;S.shopPotions??=[];}
function edGivePotion(id){edEnsurePotions();if(!ED_POTIONS[id]||S.potions.length>=S.potionSlots)return false;S.potions.push(id);save();return true;}
function edOfferPotion(){edEnsurePotions();return ED_POTION_IDS[Math.floor(Math.random()*ED_POTION_IDS.length)]}
function edPotionChip(id,i){const p=ED_POTIONS[id];return `<button type="button" class="ed-potion-chip" data-potion-slot="${i}" aria-label="${escapeHTML(p.name)}: ${escapeHTML(p.desc)}" title="${escapeHTML(p.name)} · ${escapeHTML(p.desc)}"><span>${p.icon}</span><small>${escapeHTML(p.name)}</small></button>`}
const edPotionsBanner=banner;
banner=function(){let h=edPotionsBanner();if(!S)return h;edEnsurePotions();return h.replace('<button class="litebtn" data-action="menu">',`<button class="litebtn ed-potion-top" data-potion-open title="Open potion satchel">🧪 ${S.potions.length}/${S.potionSlots}</button><button class="litebtn" data-action="menu">`)};
const edPotionsBattle=battleScreen;
battleScreen=function(){let h=edPotionsBattle();edEnsurePotions();let bar=`<div class="ed-combat-potions"><span>🧪 POTIONS</span>${S.potions.map(edPotionChip).join('')}${Array.from({length:Math.max(0,S.potionSlots-S.potions.length)},()=>'<span class="ed-potion-empty">◯</span>').join('')}</div>`;return h.replace('<div class="player-summary">','<div class="player-summary">'+bar)};
const edPotionsReward=rewardScreen;
rewardScreen=function(){let h=edPotionsReward();edEnsurePotions();if(!S.potionReward)return h;let p=ED_POTIONS[S.potionReward];return h.replace('<div class="reward-cards">',`<div class="ed-reward-potion"><span class="ed-potion-big">${p.icon}</span><div><b>Bonus potion: ${escapeHTML(p.name)}</b><small>${escapeHTML(p.desc)}</small></div><button type="button" class="btn dark" data-claim-potion ${S.potions.length>=S.potionSlots?'disabled':''}>Take potion</button></div><div class="reward-cards">`)};
const edPotionsEnd=checkEndBattle;
checkEndBattle=function(){const wasBattle=S?.screen==='battle';const result=edPotionsEnd();if(wasBattle&&S?.screen==='reward'){edEnsurePotions();S.potionReward=Math.random()<.4?edOfferPotion():null;save()}return result};
const edPotionModal=modalHTML;
modalHTML=function(){if(modal?.type==='edPotions'){edEnsurePotions();return `<div class="overlay"><section class="modal ed-pot-modal" role="dialog" aria-modal="true" aria-label="Potion satchel"><button class="litebtn close" data-action="close">✕</button><h2>🧪 Potion satchel</h2><p class="note">${S.potions.length} of ${S.potionSlots} slots filled. Potions are consumed when used. Targeted potions let you choose an enemy.</p><div class="ed-satchel">${S.potions.map((id,i)=>{let p=ED_POTIONS[id];return `<button class="ed-satchel-potion" data-potion-slot="${i}"><span>${p.icon}</span><b>${escapeHTML(p.name)}</b><small>${escapeHTML(p.desc)}</small></button>`}).join('')||'<p class="note">No potions collected.</p>'}</div><button class="btn dark" data-action="close">Return</button></section></div>`}
 if(modal?.type==='edPotionDetail'){let id=S.potions?.[modal.slot],p=ED_POTIONS[id];if(!p)return edPotionModal();return `<div class="overlay"><section class="modal ed-pot-modal" role="dialog" aria-modal="true"><button class="litebtn close" data-action="close">✕</button><div class="ed-potion-inspect"><span>${p.icon}</span><h2>${escapeHTML(p.name)}</h2><p>${escapeHTML(p.desc)}</p></div>${S.screen==='battle'?p.target?`<p class="note">Choose an enemy to use this potion on:</p><div class="ed-potion-targets">${alive().map(e=>`<button class="btn dark" data-potion-use="${e.id}">${escapeHTML(e.name)} (${e.hp} HP)</button>`).join('')}</div>`:`<button class="btn primary" data-potion-use="self">Use potion</button>`:'<p class="note">Potions can be used during combat.</p>'}<button class="btn ghost" data-action="close">Back</button></section></div>`}
 return edPotionModal()};
const edPotionNewGame=newGame;
newGame=function(){edPotionNewGame();edEnsurePotions();S.potions=[];S.potionReward=null;save();render()};
// Intercept potion gestures before generic click handlers; preserve all prior listeners.
document.addEventListener('click',e=>{
 let pick=e.target.closest('[data-potion-slot]');if(pick){e.preventDefault();e.stopImmediatePropagation();if(!S)return;edEnsurePotions();let i=Number(pick.dataset.potionSlot);if(!S.potions[i])return;modal={type:'edPotionDetail',slot:i};render();return}
 if(e.target.closest('[data-potion-open]')){e.preventDefault();e.stopImmediatePropagation();modal={type:'edPotions'};render();return}
 if(e.target.closest('[data-claim-potion]')){e.preventDefault();e.stopImmediatePropagation();if(S?.screen!=='reward'||!S.potionReward)return;if(edGivePotion(S.potionReward)){S.potionReward=null;save();render()}return}
 let use=e.target.closest('[data-potion-use]');if(use){e.preventDefault();e.stopImmediatePropagation();if(S?.screen!=='battle'||busy||modal?.type!=='edPotionDetail')return;let id=S.potions?.[modal.slot],p=ED_POTIONS[id];if(!p)return;let target=p.target?S.enemies.find(x=>x.id===Number(use.dataset.potionUse)&&x.hp>0):null;if(p.target&&!target)return;const slot=modal.slot;modal=null;S.potions.splice(slot,1);p.use(target);log('Used '+p.name);if(S.screen==='battle'&&!alive().length)checkEndBattle();save();render();triggerFX();return}
},true);
if(S){edEnsurePotions();save()}
