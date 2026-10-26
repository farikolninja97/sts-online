// Relic inventory, context help and mobile-first tooltips.
'use strict';
function relicBadge(id,compact=true){let r=RELICS[id];if(!r)return '';return `<button type="button" class="relic-badge ${compact?'compact':''}" data-relic-detail="${id}" title="${escapeHTML(r.name+': '+r.description)}" aria-label="Relic: ${escapeHTML(r.name)}. ${escapeHTML(r.description)}"><span class="relic-symbol" aria-hidden="true">${r.icon}</span>${compact?'':`<span class="relic-title">${escapeHTML(r.name)}</span>`}</button>`}
const relicBannerBase=banner;
banner=function(){let html=relicBannerBase();if(!S)return html;ensureRelics();const inventory=`<button class="litebtn relic-open" data-action="relics" title="View your relic collection and effects" aria-label="View ${S.relics.length} relics">✧ ${S.relics.length}</button>`;return html.replace('<button class="litebtn" data-action="menu">',inventory+'<button class="litebtn" data-action="menu">')};
const relicBattleBase=battleScreen;
battleScreen=function(){let html=relicBattleBase();if(!S?.relics?.length)return html;let icons=S.relics.slice(0,7).map(id=>relicBadge(id)).join('');let ribbon=`<div class="relic-battlebar"><span class="relic-battle-label">RELICS</span><div class="relic-icons">${icons}</div><button class="relic-more" data-action="relics" title="View all equipped relics">${S.relics.length>7?`+${S.relics.length-7}`:'View all'}</button></div>`;return html.replace('<div class="arena">','<div class="arena">'+ribbon).replace('<div class="energy" title="Energy">','<div class="energy" title="Tap for Energy rules" role="button" tabindex="0" data-effect-help="Energy">')};
// Tap targets use the same explanations on touch devices and desktop keyboards.
const RELIC_COMBAT_GLOSSARY={
 Strength:'Adds the displayed amount to each hit of an Attack before Weak and Vulnerable are applied.',
 Dexterity:'Adds the displayed amount to Block gained from cards. It does not affect Block from relics or most Powers.',
 Weak:'Reduces attack damage dealt by 25% while it lasts.',
 Vulnerable:'Increases attack damage received by 50% while it lasts.',
 Frail:'Reduces Block gained from cards by 25% while it lasts.',
 Artifact:'Negates the next debuff that would be applied, consuming one Artifact stack.',
 Ritual:'Gains Strength after enemy actions according to the enemy ability.',
 Thorns:'Damages the attacker when it performs an Attack against this character.',
 Block:'Absorbs incoming Attack damage before HP is lost. Usually clears at the start of your next turn; certain relics and Powers can retain it.',
 Energy:'Spent when playing cards. Normally resets to 3 at the start of each turn, before relic and Power bonuses.',
 Exhaust:'Removes a card from the current combat. It does not permanently remove the card from your Deck.',
 Ethereal:'If this card remains in your Hand at the end of your turn, it Exhausts.',
 Innate:'Starts combat in your opening Hand, subject to the hand limit.',
 Retain:'Remains in your Hand instead of being discarded at the end of your turn.',
 Fatal:'A Fatal effect activates when the hit from that card kills an enemy.',
 'No More Energy':'You cannot gain any more Energy during this turn, even from relics or Powers.',
 Cursed:'Curse cards are persistent additions to your Deck and usually have negative effects.',
 'Enemy intent':'The action this enemy plans to perform: attack, buff, or debuff. Damage already includes current Strength and Weak, but can change before the attack lands.'
};
const relicIntentBase=intentHTML;
intentHTML=function(e){return `<button type="button" class="intent-inspect" data-intent-help="${e.id}" aria-label="Inspect next move of ${escapeHTML(e.name)}">${relicIntentBase(e)}</button>`};
const relicBlockShieldBase=blockShield;
blockShield=function(n,label){return relicBlockShieldBase(n,label).replace('role="img"',`role="button" tabindex="0" data-effect-help="Block" data-block-label="${escapeHTML(label)}"`)};
const relicStatusChipBase=statusChip;
statusChip=function(name,value){let html=relicStatusChipBase(name,value);let card=Object.values(CARDS).find(c=>c?.name===name&&c?.type==='Power');if(card&&html){html=html.replace(/title="[^"]*"/,`title="${escapeHTML(card.desc)}"`)}return html.replace('class="combat-status ', 'role="button" tabindex="0" class="combat-status ')};
const relicStatusForPlayerBase=statusForPlayer;
statusForPlayer=function(){let output=relicStatusForPlayerBase(),original=output;if((S.thorns||0)>0)output+=`<span class="combat-status buff" title="Thorns: Deal ${S.thorns} damage to an enemy when it attacks you." aria-label="Thorns ${S.thorns}"><span class="status-icon">✳</span><b>${S.thorns}</b><span class="status-name">Thorns</span></span>`;if(ownsRelic('red_skull')&&S.hp*2<=S.maxHP)output+=`<span class="combat-status buff" title="Red Skull: +3 Strength while HP is at or below 50%." aria-label="Red Skull active plus 3 Strength"><span class="status-icon">💀</span><b>+3</b><span class="status-name">Red Skull</span></span>`;return output!==original?output.replace('<span class="status-none">No active effects</span>',''):output};
const relicBannerCompactBase=banner;
banner=function(){let html=relicBannerCompactBase();if(S?.screen==='battle'){html=html.replace(/<span class="stat">⌖ Act [^<]*<\/span>/,'').replace(/>Deck (\d+)<\/button>/,' aria-label="Open deck">☷$1</button>')}return html};
const relicRewardBase=rewardScreen;
rewardScreen=function(){let html=relicRewardBase();if(!S?.lastRelicFound||!RELICS[S.lastRelicFound])return html;let r=RELICS[S.lastRelicFound];return html.replace('<div class="reward-cards">',`<div class="relic-reward-notice"><span class="relic-reward-emoji">${r.icon}</span><div><b>RELIC FOUND · ${escapeHTML(r.name)}</b><p>${escapeHTML(r.description)}</p><button class="litebtn" data-relic-detail="${S.lastRelicFound}">Inspect relic</button></div></div><div class="reward-cards">`)};
const relicShopBase=shopScreen;
shopScreen=function(){let html=relicShopBase();if(!S?.shopRelics?.length)return html;let rows=S.shopRelics.map(id=>{let r=RELICS[id];if(!r)return '';let cost=RELIC_RARITIES[r.rarity]||175;return `<div class="shoprow relic-shoprow"><div class="relic-shopdesc"><button class="relic-shop-icon" data-relic-detail="${id}" title="Inspect ${escapeHTML(r.name)}">${r.icon}</button><div><b>${escapeHTML(r.name)}</b><small>${escapeHTML(r.rarity)} Relic</small><p class="note">${escapeHTML(r.description)}</p></div></div><button class="btn dark" data-relic-buy="${id}" ${S.gold<cost?'disabled':''}>${cost} ✦</button></div>`}).join('');return html.replace('</div><button class="btn" data-action="leave">',`<h3 class="relic-shop-head">Relics for sale</h3>${rows}</div><button class="btn" data-action="leave">`)};
const relicTreasureBase=treasureScreen;
treasureScreen=function(){let html=relicTreasureBase();if(S?.treasureRelic&&RELICS[S.treasureRelic]){let r=RELICS[S.treasureRelic];return `<main class="page screenpad"><section class="innerpanel"><div class="small">TREASURE · ACT ${S.act} · FLOOR ${S.floor}</div><h1 class="sectiontitle">A hidden reliquary</h1><div class="relic-reward-notice"><span class="relic-reward-emoji">${r.icon}</span><div><b>${escapeHTML(r.name)}</b><p>${escapeHTML(r.description)}</p><button class="litebtn" data-relic-detail="${S.treasureRelic}">Inspect relic</button></div></div><button class="btn" data-action="leave">Continue →</button></section></main>`}return html};
const relicRestBase=restScreen;
restScreen=function(){let html=relicRestBase();if(ownsRelic('regal_pillow'))html=html.replace(/Recover (\d+) HP \(up to your max\)/,(_,n)=>`Recover ${Number(n)+15} HP with Regal Pillow (up to max)`);return html};
const relicRouteBase=routeScreen;
routeScreen=function(){let html=relicRouteBase();return html.replace('cards · Burning Blood','cards · '+(S.relics?.length||1)+' relics')};
const relicModalBase=modalHTML;
modalHTML=function(){if(!modal)return relicModalBase();
 if(modal.type==='relics'){
  return `<div class="overlay"><section class="modal relic-modal" role="dialog" aria-modal="true" aria-label="Relics in this run"><button class="litebtn close" data-action="close" aria-label="Close">✕</button><div class="small">IRONCLAD · RELIC COLLECTION</div><h2>Artifacts of the descent</h2><p class="note">Tap any relic to see its full effect and when it activates. Effects are active automatically.</p><div class="relic-inventory">${(S.relics||[]).map(id=>{let r=RELICS[id];return `<button class="relic-inventory-item" data-relic-detail="${id}"><span class="relic-inv-emoji">${r.icon}</span><span><b>${escapeHTML(r.name)}</b><small>${escapeHTML(r.rarity)} · ${escapeHTML(r.description)}</small></span><span aria-hidden="true">›</span></button>`}).join('')}</div><button class="btn ghost" data-action="close">Back</button></section></div>`;
 }
 if(modal.type==='relicDetail'){
  let r=RELICS[modal.id];if(!r)return relicModalBase();return `<div class="overlay"><section class="modal relic-detail-modal" role="dialog" aria-modal="true" aria-label="${escapeHTML(r.name)} effect"><button class="litebtn close" data-action="relicback" aria-label="Back">✕</button><div class="relic-detail-icon" aria-hidden="true">${r.icon}</div><div class="small">${escapeHTML(r.rarity.toUpperCase())} RELIC · ${escapeHTML(r.trigger)}</div><h2>${escapeHTML(r.name)}</h2><p class="relic-detail-description">${escapeHTML(r.description)}</p>${['war_paint','whetstone'].includes(modal.id)&&S.relicUpgrades?.[modal.id]?.length?`<p class="note">Upgraded on pickup: ${S.relicUpgrades[modal.id].map(c=>escapeHTML(CARDS[c.key]?.name||c.key)).join(', ')}.</p>`:''}${({happy_flower:3,nunchaku:10,joss_paper:5})[modal.id]?`<p class="note">Progress toward next trigger: ${((S.relicCounters||{})[({happy_flower:'happy',nunchaku:'nunchaku',joss_paper:'joss'})[modal.id]]||0)%({happy_flower:3,nunchaku:10,joss_paper:5})[modal.id]} / ${({happy_flower:3,nunchaku:10,joss_paper:5})[modal.id]}</p>`:''}<p class="note">Owned during this run: ${ownsRelic(modal.id)?'Yes':'No'}. Passive effects activate automatically when the trigger occurs.</p><button class="btn" data-action="relicback">Back</button></section></div>`;
 }
 if(modal.type==='effectHelp'){
  return `<div class="overlay"><section class="modal relic-detail-modal" role="dialog" aria-modal="true"><button class="litebtn close" data-action="close">✕</button><div class="small">COMBAT EFFECT GUIDE</div><h2>${escapeHTML(modal.name||'Effect')}</h2><p class="relic-detail-description">${escapeHTML(modal.description||'No description available.')}</p><button class="btn" data-action="close">Return to combat</button></section></div>`;
 }
 if(modal.type==='combatref'){
  return relicModalBase().replace('<div class="pile-list">',`<h3>Combat keyword glossary</h3><div class="relic-keyword-grid">${['Strength','Dexterity','Weak','Vulnerable','Frail','Artifact','Thorns','Block','Energy','Exhaust','Ethereal','Innate','Retain','Fatal'].map(name=>`<button class="relic-keyword" data-effect-help="${name}">${name}</button>`).join('')}</div><div class="pile-list">`);
 }
 return relicModalBase();
};
const relicActBaseUI=act;
act=function(action){if(action==='relics'){modal={type:'relics'};render();return}if(action==='relicback'){modal={type:'relics'};render();return}relicActBaseUI(action)};
document.addEventListener('click',e=>{
 const relicDetail=e.target.closest('[data-relic-detail]');
 if(relicDetail){e.preventDefault();e.stopImmediatePropagation();if(!RELICS[relicDetail.dataset.relicDetail])return;modal={type:'relicDetail',id:relicDetail.dataset.relicDetail};render();return}
 const buy=e.target.closest('[data-relic-buy]');
 if(buy&&S?.screen==='shop'){e.preventDefault();e.stopImmediatePropagation();let id=buy.dataset.relicBuy;let relic=RELICS[id],price=RELIC_RARITIES[relic?.rarity]||175;
  if(!relic||!S.shopRelics?.includes(id)||S.gold<price)return;
  S.gold-=price;gainRelic(id);S.shopRelics=S.shopRelics.filter(x=>x!==id);modal={type:'relicDetail',id};save();render();return;
 }
 const intent=e.target.closest('[data-intent-help]');
 if(intent&&S?.screen==='battle'){
  e.preventDefault();e.stopImmediatePropagation();const foe=S.enemies.find(x=>String(x.id)===String(intent.dataset.intentHelp));
  if(!foe)return;const move=moveFor(foe),number=adjustedEnemyDamage(foe,move),hits=move.hits||1;
  const info=move.kind==='attack'?`Next intent: ${move.n}. ${number} damage per hit × ${hits} hit${hits===1?'':'s'}. Before damage is dealt, player Block absorbs the attacks. Enemy Strength and Weak are included; buffs or debuffs may change the result.`:`Next intent: ${move.n}. This is a ${move.kind} move, not immediate attack damage. ${move.strength?`It adds ${move.strength} Strength. `:''}${move.block?`It grants ${move.block} Block. `:''}${move.weak?`It applies ${move.weak} Weak. `:''}`;
  modal={type:'effectHelp',name:foe.name+' · '+move.n,description:info};render();return;
 }
 const hint=e.target.closest('[data-effect-help]');
 if(hint){e.preventDefault();e.stopImmediatePropagation();const name=hint.dataset.effectHelp,who=hint.dataset.blockLabel;
  modal={type:'effectHelp',name:who?who+' · Block':name,description:(who?who+' currently has '+(who==='Ironclad'?S.block:S.enemies.find(x=>x.name===who)?.block||0)+' Block. ':'')+(RELIC_COMBAT_GLOSSARY[name]||'Tap a relic or status for its details.')};render();return;
 }
 const effect=e.target.closest('.combat-status');
 if(effect&&S?.screen==='battle'){e.preventDefault();e.stopImmediatePropagation();modal={type:'effectHelp',name:effect.querySelector('.status-name')?.textContent?.trim()||'Combat effect',description:effect.title||RELIC_COMBAT_GLOSSARY[effect.querySelector('.status-name')?.textContent?.trim()]||effect.getAttribute('aria-label')};render();return}
},true);
if(S){ensureRelics();save();}

// Keyboard access for tap-to-inspect status chips, shields, Energy and intents.
document.addEventListener('keydown',e=>{
 if((e.key==='Enter'||e.key===' ')&&e.target?.matches?.('[data-effect-help],[data-intent-help],.combat-status')){
  e.preventDefault();e.target.click();
 }
},true);
