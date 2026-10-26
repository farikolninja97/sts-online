// V1.16 — Stateful, explicitly claimed combat loot and confirmable Smith upgrades.
// Load last so this module decorates the existing legacy/relic/potion UI without modifying combat rules.
'use strict';

function ed116EnsureLoot(){
 if(!S||S.screen!=='reward')return null;
 if(!S.loot){
  // A V1.15 save may be sitting on a reward screen with gold/relic ALREADY applied.
  // Do not pay the player twice or revoke something already owned.
  const legacyReward=!!S.rewardTaken||!!S.lastRelicFound;
  S.loot={
   gold:S.rewardGold||0,
   goldTaken:true, // Old versions already deposited gold on victory.
   relicId:null, // Old versions already awarded any elite relic.
   relicTaken:true,
   potionId:S.potionReward||null,
   potionDone:!S.potionReward,
   cardDone:!!S.rewardTaken,
   cardChosen:!!S.rewardTaken,
   createdFromPreviousSave:true
  };
 }
 return S.loot;
}
function ed116NewLoot(){
 return {
  gold:S.rewardGold||0,goldTaken:false,
  relicId:S.pendingBattleRelic||null,relicTaken:!S.pendingBattleRelic,
  potionId:S.potionReward||null,potionDone:!S.potionReward,
  cardDone:false,cardChosen:false,
  createdFromPreviousSave:false
 };
}
function ed116LootComplete(){let l=ed116EnsureLoot();return !!l&&l.goldTaken&&l.relicTaken&&l.potionDone&&l.cardDone}
function ed116AwardGold(){let l=ed116EnsureLoot();if(!l||l.goldTaken)return;
 S.gold+=l.gold;l.goldTaken=true;save();render();
}
function ed116AwardRelic(){let l=ed116EnsureLoot();if(!l||l.relicTaken)return;
 if(!l.relicId||!RELICS[l.relicId]){l.relicTaken=true;save();render();return}
 const id=l.relicId;
 if(!gainRelic(id)&&!ownsRelic(id))return;
 l.relicTaken=true;S.pendingBattleRelic=null;
 modal={type:'ed116RelicAcquired',id};save();render();
}
function ed116AwardPotion(){let l=ed116EnsureLoot();if(!l||l.potionDone)return;
 if(l.potionId&&!edGivePotion(l.potionId))return;
 l.potionDone=true;S.potionReward=null;save();render();
}
function ed116SkipPotion(){let l=ed116EnsureLoot();if(!l||l.potionDone)return;l.potionDone=true;S.potionReward=null;save();render()}
function ed116CardChoice(){let l=ed116EnsureLoot();if(!l||l.cardDone)return;modal={type:'ed116ChooseCard'};render()}
function ed116ChooseCard(uid){
 let l=ed116EnsureLoot();if(!l||l.cardDone)return;
 const c=S.offered.find(x=>x.uid===uid);if(!c)return;
 S.deck.push(c);l.cardChosen=true;l.cardDone=true;S.rewardTaken=true;
 showCardReveal(c,'Card acquired','Added to your permanent Ironclad deck.','close');
}
function ed116SkipCard(){let l=ed116EnsureLoot();if(!l||l.cardDone)return;
 l.cardDone=true;l.cardChosen=false;S.rewardTaken=true;modal=null;save();render();
}
function ed116Continue(){if(S?.screen!=='reward'||!ed116LootComplete())return;
 modal=null;moveToNext();
}
const ed116BattleCheck=checkEndBattle;
checkEndBattle=function(){const prior=S?.screen;const result=ed116BattleCheck();
 if(prior==='battle'&&S?.screen==='reward'&&!S.loot){S.loot=ed116NewLoot();save();}
 return result;
};
const ed116NextRoom=moveToNext;
moveToNext=function(){if(S?.screen==='reward'&&!ed116LootComplete())return;
 if(S){S.loot=null;S.pendingBattleRelic=null;S.potionReward=null;}
 return ed116NextRoom();
};
const ed116NewRun=newGame;
newGame=function(){ed116NewRun();if(S){S.loot=null;S.pendingBattleRelic=null;save();render()}};
function ed116RewardRow(kind,icon,title,detail,action,state){
 let label=state==='done'?'Collected ✓':state==='skip'?'Skipped':null;
 return `<div class="ed116-loot-row ${state==='done'||state==='skip'?'is-done':''}" role="group" aria-label="${escapeHTML(title)}">
 <div class="ed116-loot-icon">${icon}</div><div class="ed116-loot-description"><strong>${escapeHTML(title)}</strong><span>${escapeHTML(detail)}</span></div>
 ${label?`<span class="ed116-claimed" aria-label="${label}">${label}</span>`:action}
 </div>`;
}
rewardScreen=function(){const l=ed116EnsureLoot();if(!l)return '';
 const relic=l.relicId&&RELICS[l.relicId],pot=l.potionId&&ED_POTIONS[l.potionId];
 const gold=ed116RewardRow('gold','✦',`${l.gold} Gold`,'Add the coins to your gold pouch.',`<button class="ed116-claim" data-ed116-claim="gold">Collect</button>`,l.goldTaken?'done':'ready');
 const relicRow=relic?ed116RewardRow('relic',relic.icon,relic.name,relic.description,`<button class="ed116-claim" data-ed116-claim="relic">Collect</button>`,l.relicTaken?'done':'ready'):'';
 const potRow=pot?ed116RewardRow('potion',pot.icon,pot.name,pot.desc,`<div class="ed116-loot-actions"><button class="ed116-claim" data-ed116-claim="potion" ${S.potions.length>=S.potionSlots?'disabled':''}>Collect</button><button class="ed116-skip" data-ed116-claim="skip-potion">Skip</button></div>`,l.potionDone?'done':'ready'):'';
 const cardRow=ed116RewardRow('card','▣','Add a card to your deck',l.cardDone?(l.cardChosen?'A new card has joined your deck.':'You skipped the card reward.'):'Choose one of three Ironclad cards or skip.',`<button class="ed116-claim" data-ed116-claim="card">Choose</button>`,l.cardDone?(l.cardChosen?'done':'skip'):'ready');
 const done=ed116LootComplete();
 return `<main class="page screenpad ed116-reward-page"><section class="ed116-loot-scene">
  <div class="ed116-loot-label">COMBAT COMPLETE</div><h1 class="ed116-ribbon">Loot!</h1>
  <p class="ed116-fallen">Defeated ${escapeHTML(S.defeated||'your foes')} · Burning Blood restored 6 HP</p>
  <div class="ed116-loot-panel">${gold}${potRow}${relicRow}${cardRow}</div>
  <div class="ed116-loot-footer"><span>${[l.goldTaken,l.cardDone,...(relic?[l.relicTaken]:[]),...(pot?[l.potionDone]:[])].filter(Boolean).length}/${2+Number(!!relic)+Number(!!pot)} resolved</span><button class="btn primary" data-ed116-claim="continue" ${done?'':'disabled'}>Continue to map →</button></div>
  <p class="ed116-help">Select each reward to collect it. Card and potion rewards can be skipped.</p>
 </section></main>`;
};
function ed116VisualCard(card){
 // Use the game's existing full-size card art, but remove play/pick handlers.
 return cardHTML(card,'reward').replace(/\sdata-rewardcard="[^"]*"/g,'').replace(/\sdata-inspectcard="[^"]*"/g,'').replace(/<button\b/,'<div').replace(/<\/button>/,'</div>');
}
const ed116ExistingModal=modalHTML;
modalHTML=function(){
 if(modal?.type==='ed116ChooseCard')return `<div class="overlay"><section class="modal ed116-choice-dialog" role="dialog" aria-modal="true" aria-label="Choose a card reward"><div class="ed116-loot-label">CARD REWARD</div><h2>Choose a Card</h2><p class="note">Choose one card to add permanently to your deck, or skip.</p><div class="reward-cards">${S.offered.map(c=>cardHTML(c,'reward')).join('')}</div><button class="btn ghost" data-ed116-claim="skip-card">Skip card reward</button><button class="litebtn ed116-return" data-ed116-claim="back-loot">← Back to loot</button></section></div>`;
 if(modal?.type==='ed116RelicAcquired'){let r=RELICS[modal.id];return `<div class="overlay"><section class="modal ed116-relic-dialog" role="dialog" aria-modal="true"><div class="ed116-loot-label">RELIC ACQUIRED</div><div class="ed116-big-relic">${r?.icon||'✦'}</div><h2>${escapeHTML(r?.name||'Relic')}</h2><p>${escapeHTML(r?.description||'')}</p><button class="btn primary" data-ed116-claim="back-loot">Return to loot</button></section></div>`}
 if(modal?.type==='smith'){
  const eligible=S.deck.filter(c=>!c.up&&UP[c.key]);
  return `<div class="overlay"><section class="modal ed116-smith-modal" role="dialog" aria-modal="true" aria-label="Select a card to upgrade">
   <div class="ed116-loot-label">REST SITE · SMITH</div><h2>Choose a Card to Upgrade</h2><p class="note">Inspect an upgrade before committing. You can cancel and choose a different card without using the rest site.</p>
   <div class="ed116-smith-grid">${eligible.map(c=>{let d=spec(c);return `<button type="button" class="ed116-smith-tile" data-ed116-smith="${escapeHTML(c.uid)}" aria-label="Preview upgrade for ${escapeHTML(d.name)}"><span class="ed116-mini-energy">${d.cost===-1?'X':d.cost}</span><span class="ed116-mini-art">${iconArt(d.icon)}</span><b>${escapeHTML(d.name)}</b><small>Preview upgrade ↗</small></button>`}).join('')||'<p class="note">All your cards are already upgraded.</p>'}</div>
   <button class="btn ghost" data-ed116-upgrade="cancel-rest">Cancel · Return to campfire</button>
  </section></div>`;
 }
 if(modal?.type==='ed116UpgradePreview'){
  let card=S.deck.find(c=>c.uid===modal.uid),up=card&&!card.up&&UP[card.key]?{...card,up:true}:null;
  if(!up)return `<div class="overlay"><section class="modal"><h2>Card unavailable</h2><button class="btn" data-ed116-upgrade="another">Choose another</button></section></div>`;
  return `<div class="overlay"><section class="modal ed116-upgrade-dialog" role="dialog" aria-modal="true" aria-label="Confirm card upgrade">
   <div class="ed116-loot-label">THE FORGE</div><h2>Upgrade ${escapeHTML(CARDS[card.key].name)}?</h2>
   <div class="ed116-preview-compare"><div><div class="ed116-compare-label">BEFORE</div>${ed116VisualCard(card)}</div><span class="ed116-preview-arrow">➜</span><div><div class="ed116-compare-label">AFTER</div>${ed116VisualCard(up)}</div></div>
   <p class="note">The card will not change until you confirm. Your rest-site action is spent only after confirming.</p>
   <div class="ed116-confirm-buttons"><button class="btn primary" data-ed116-upgrade="confirm">Confirm Upgrade</button><button class="btn ghost" data-ed116-upgrade="another">Cancel · Choose Another</button></div>
  </section></div>`;
 }
 return ed116ExistingModal();
};
// All permanent Smith upgrades are previewed first; existing in-combat upgrade effects remain instantaneous.
applyUpgrade=function(uid){const c=S?.deck.find(x=>x.uid===uid);if(!c||c.up||!UP[c.key])return;modal={type:'ed116UpgradePreview',uid};render()};
function ed116ConfirmUpgrade(){if(modal?.type!=='ed116UpgradePreview')return;
 const c=S.deck.find(x=>x.uid===modal.uid);if(!c||c.up||!UP[c.key]){modal={type:'smith'};render();return}
 const prior={...c};c.up=true;
 showCardReveal(c,'Card upgraded','Confirmed! This upgrade is permanent for the rest of your run.','route',prior);
}
const ed116ChooseRewardBase=chooseReward;
chooseReward=function(uid){if(S?.screen==='reward'&&S.loot){ed116ChooseCard(uid);return}ed116ChooseRewardBase(uid)};
const ed116ActionBase=act;
act=function(action){
 if(action==='skipreward'&&S?.screen==='reward'){ed116SkipCard();return}
 if(action==='revealnext'&&modal?.type==='cardreveal'&&S?.screen==='reward'&&S.loot){modal=null;save();render();return}
 if(action==='close'&&modal?.type==='ed116UpgradePreview'){modal={type:'smith'};render();return}
 if(action==='close'&&modal?.type==='ed116ChooseCard'){modal=null;render();return}
 ed116ActionBase(action);
};
document.addEventListener('click',e=>{
 const claim=e.target.closest('[data-ed116-claim]');if(claim){e.preventDefault();e.stopImmediatePropagation();
  switch(claim.dataset.ed116Claim){case 'gold':ed116AwardGold();break;case 'relic':ed116AwardRelic();break;case 'potion':ed116AwardPotion();break;case 'skip-potion':ed116SkipPotion();break;case 'card':ed116CardChoice();break;case 'skip-card':ed116SkipCard();break;case 'back-loot':modal=null;save();render();break;case 'continue':ed116Continue();break}
  return;
 }
 const smith=e.target.closest('[data-ed116-smith]');if(smith){e.preventDefault();e.stopImmediatePropagation();applyUpgrade(smith.dataset.ed116Smith);return}
 const upgrade=e.target.closest('[data-ed116-upgrade]');if(upgrade){e.preventDefault();e.stopImmediatePropagation();
  switch(upgrade.dataset.ed116Upgrade){case 'confirm':ed116ConfirmUpgrade();break;case 'another':modal={type:'smith'};render();break;case 'cancel-rest':modal=null;render();break}
 }
},true);
// On an older saved reward screen, prevent double collection. Fresh screens are initialized in checkEndBattle.
if(S?.screen==='reward'&&!S.loot){ed116EnsureLoot();save();render()}
