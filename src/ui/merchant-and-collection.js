// V1.15 — Merchant storefront, visual card collection, expanded encounters.
'use strict';
const ED_CARD_COST={Common:50,Uncommon:75,Rare:150};
const ED_POTION_COST={Common:50,Uncommon:75,Rare:100};
function edCost(base,wobble=.05){return Math.max(1,Math.round(base*(1+(Math.random()*2-1)*wobble)))}
function edDifferent(pool,taken=[]){const candidates=pool.filter(k=>!taken.includes(k));return candidates.length?choice(candidates):null}
function edMakeShop(){if(!S)return;edEnsurePotions();
 const picked=[];
 for(const type of ['Attack','Attack','Skill','Skill','Power']){
  const key=edDifferent(SOLO_POOL.filter(k=>CARDS[k]?.type===type),picked);if(key)picked.push(key);
 }
 const sale=Math.floor(Math.random()*picked.length);
 S.edShop={cards:picked.map((key,i)=>({key,price:edCost(ED_CARD_COST[CARDS[key].rarity]||75)*(i===sale?.5:1),sale:i===sale})),
  relics:(S.shopRelics||[]).slice(0,3).map(id=>({id,price:edCost(RELIC_RARITIES[RELICS[id]?.rarity]||175,.15)})),
  potions:shuffle(ED_POTION_IDS).slice(0,3).map(id=>({id,price:edCost(ED_POTION_COST[ED_POTIONS[id].rarity]||50)})),
  removalUsed:false};
 S.edShop.cards.forEach(x=>x.price=Math.round(x.price));save();
}
const edShopNodeBase=chooseNode;
chooseNode=function(id){const eligible=S?.screen==='route'&&openNodes().some(n=>n.id===id),isShop=eligible&&nodeById(id)?.type==='shop';edShopNodeBase(id);
 if(isShop){S.shopRelics=shuffle(RELIC_POOL.filter(k=>!ownsRelic(k))).slice(0,3);edMakeShop();save();render()}}
function edEnsureShop(){if(S?.screen==='shop'&&!S.edShop)edMakeShop();}
const edMerchantImage=`<svg class="ed-shopkeeper" viewBox="0 0 260 240" role="img" aria-label="Original hooded merchant illustration"><defs><radialGradient id="edAura"><stop stop-color="#f9b566" stop-opacity=".5"/><stop offset="1" stop-color="#b35567" stop-opacity="0"/></radialGradient></defs><ellipse cx="130" cy="135" rx="115" ry="105" fill="url(#edAura)"/><path d="M34 200Q40 70 129 18Q220 69 224 203Z" fill="#304a68" stroke="#d4ad7d" stroke-width="7"/><path d="M77 117Q85 46 131 48Q181 53 191 119L170 154L97 154Z" fill="#14253d"/><path d="M104 104Q132 74 163 107L155 127L113 129Z" fill="#89d4da" stroke="#b6e0cb" stroke-width="6"/><path d="M58 170Q110 141 130 164Q164 142 203 174L206 208L57 208Z" fill="#456a7d" stroke="#d7aa78" stroke-width="6"/><path d="M112 197L125 169L144 192L139 222L107 222Z" fill="#cfb17a"/><circle cx="210" cy="45" r="22" fill="#efb970" opacity=".45"/><path d="M195 45L209 28L223 45L209 62Z" fill="#f6cd86"/></svg>`;
function edShopCard(slot,i){if(!slot)return '<div class="ed-shop-sold">SOLD</div>';let c={key:slot.key,up:false,uid:'shop-'+i},d=spec(c);let affordable=S.gold>=slot.price;return `<button type="button" class="ed-shop-card ${!affordable?'ed-unaffordable':''}" data-ed-shop-card="${i}" aria-label="${escapeHTML(d.name)}, ${slot.price} gold. ${escapeHTML(d.desc)}"><span class="ed-card-energy">${d.cost===-1?'X':d.cost}</span><strong>${escapeHTML(d.name)}</strong><div class="ed-shop-art">${iconArt(d.icon)}</div><span class="ed-shop-type">${d.type}</span><span class="ed-shop-price">✦ ${slot.price}</span>${slot.sale?'<span class="ed-sale-tag">50% OFF</span>':''}</button>`}
function edShopRelic(slot,i){if(!slot)return '<div class="ed-shop-sold">SOLD</div>';let r=RELICS[slot.id];return `<button type="button" class="ed-shop-trinket" data-ed-shop-relic="${i}" aria-label="${escapeHTML(r.name)}, ${slot.price} gold"><span>${r.icon}</span><small>${escapeHTML(r.name)}</small><b>✦ ${slot.price}</b></button>`}
function edShopPotion(slot,i){if(!slot)return '<div class="ed-shop-sold">SOLD</div>';let p=ED_POTIONS[slot.id];return `<button type="button" class="ed-shop-trinket" data-ed-shop-potion="${i}" aria-label="${escapeHTML(p.name)}, ${slot.price} gold"><span>${p.icon}</span><small>${escapeHTML(p.name)}</small><b>✦ ${slot.price}</b></button>`}
shopScreen=function(){edEnsureShop();let sh=S.edShop;return `<main class="page screenpad ed-merchant"><section class="ed-merchant-panel"><div class="ed-merchant-header"><div><div class="small">ACT ${S.act} · FLOOR ${S.floor} · MERCHANT</div><h1>The Lantern Merchant</h1><p>Wares of the wandering spire. Tap an item to inspect and purchase.</p></div><div class="ed-merchant-gold">✦ ${S.gold}<small>Your gold</small></div></div><div class="ed-merchant-body"><aside class="ed-merchant-aside">${edMerchantImage}<div class="ed-merchant-speech">“A fine choice, traveler. Every relic has a story.”</div></aside><div class="ed-merchant-shelves"><div class="ed-shop-label">THE CARD TABLE <small>2 Attacks · 2 Skills · 1 Power · Swipe on mobile</small></div><div class="ed-shop-card-grid">${sh.cards.map(edShopCard).join('')}</div><div class="ed-shop-bottom"><div><div class="ed-shop-label">RELICS</div><div class="ed-shop-itemgrid">${sh.relics.map(edShopRelic).join('')}</div></div><div><div class="ed-shop-label">POTIONS</div><div class="ed-shop-itemgrid">${sh.potions.map(edShopPotion).join('')}</div></div></div><div class="ed-shop-services"><button type="button" class="ed-remove-service" data-ed-remove ${sh.removalUsed?'disabled':''}><span class="ed-remove-icon">✂</span><span><b>Card Removal Service</b><small>${sh.removalUsed?'Already used in this shop':'Remove one card permanently from your deck'}</small></span><strong>✦ ${75+25*(S.edRemovalCount||0)}</strong></button></div></div></div><button class="btn" data-action="leave">Leave merchant →</button></section></main>`};
function edCollectionTile(c,idx,scope){let d=spec(c);return `<button class="ed-collection-card ${c.up?'ed-collection-up':''}" data-ed-collection="${scope}:${idx}" title="${escapeHTML(d.name)} — ${escapeHTML(d.desc)}" aria-label="Inspect ${escapeHTML(d.name)}"><span class="ed-collection-cost">${d.cost===-1?'X':d.cost}</span><span class="ed-collection-art">${iconArt(d.icon)}</span><span class="ed-collection-mark">${d.type==='Attack'?'⚔':d.type==='Skill'?'⬡':'✦'} ${c.up?'+':''}</span><span class="ed-card-tip"><b>${escapeHTML(d.name)}${c.up?'+':''}</b><small>${escapeHTML(d.desc)}</small></span></button>`}
function edCollectionCards(scope){let list=S?.[scope]||[];return `<div class="ed-collection-grid">${list.map((c,i)=>edCollectionTile(c,i,scope)).join('')||'<p class="note">There are no cards in this pile.</p>'}</div>`}
const edOldModal=modalHTML;
modalHTML=function(){if(!modal)return edOldModal();
 if(modal.type==='catalog'){const all=['strike','defend','bash',...SOLO_POOL];return `<div class="overlay"><section class="modal ed-collection-modal" role="dialog" aria-modal="true"><button class="litebtn close" data-action="close">✕</button><h2>Ironclad card library · ${all.length}</h2><p class="note">Tap a card for its name, complete description, and upgrade details. On desktop, hover to inspect.</p><input data-catalog-search placeholder="Search card names…" aria-label="Search card names" class="ed-catalog-search"><div class="ed-collection-grid">${all.map((key,i)=>`<div class="ed-catalog-entry" data-catalog-entry="${escapeHTML(CARDS[key].name.toLowerCase())}">${edCollectionTile({key,uid:'catalog-'+i,up:false},i,'catalog')}</div>`).join('')}</div></section></div>`}
 if(modal.type==='deck'||modal.type==='piles'){
  let pile=modal.type==='deck'?'deck':(modal.pile||'draw');let heading=pile==='deck'?'Your permanent deck':'Combat piles';return `<div class="overlay"><section class="modal ed-collection-modal" role="dialog" aria-modal="true"><button class="litebtn close" data-action="close" aria-label="Close">✕</button><h2>${heading}</h2><p class="note">Tap a card for its name, description, upgrades, and artwork. Hover on desktop to preview.</p>${pile!=='deck'?`<div class="pile-tabs">${['draw','discard','exhaust'].map(k=>`<button class="litebtn ${pile===k?'active':''}" data-pile="${k}">${k[0].toUpperCase()+k.slice(1)} (${S[k].length})</button>`).join('')}</div>`:''}${edCollectionCards(pile)}</section></div>`
 }
 if(modal.type==='edCardDetails'||modal.type==='edShopDetails'||modal.type==='edRemoval'){
  if(modal.type==='edRemoval'){let n=75+25*(S.edRemovalCount||0);return `<div class="overlay"><section class="modal ed-collection-modal" role="dialog" aria-modal="true"><button class="litebtn close" data-action="close">✕</button><h2>Remove a card</h2><p class="note">Spend ${n} Gold to remove one card from your permanent deck. This can only be used once per merchant.</p>${edCollectionCards('deck')}</section></div>`}
  let fromShop=modal.type==='edShopDetails';let obj=fromShop?S.edShop?.[modal.kind]?.[modal.index]:null;
  let c=fromShop&&modal.kind==='cards'&&obj?newCard(obj.key):modal.card;
  let p=fromShop&&modal.kind==='potions'&&obj?ED_POTIONS[obj.id]:null;
  let r=fromShop&&modal.kind==='relics'&&obj?RELICS[obj.id]:null;
  let canBuy=fromShop&&obj&&S.gold>=obj.price&&(modal.kind!=='potions'||S.potions.length<S.potionSlots);
  let art=c?edCollectionTile(c,0,'preview'):p?`<span class="ed-big-object">${p.icon}</span>`:r?`<span class="ed-big-object">${r.icon}</span>`:'';
  let title=c?spec(c).name:p?.name||r?.name||'';
  let desc=c?spec(c).desc:p?.desc||r?.description||'';
  return `<div class="overlay"><section class="modal ed-item-inspect" role="dialog" aria-modal="true"><button class="litebtn close" data-action="close" aria-label="Close">✕</button><div class="ed-item-preview">${art}</div><div class="ed-item-text"><div class="small">${c?spec(c).type:p?'POTION':'RELIC'}</div><h2>${escapeHTML(title)}</h2><p>${escapeHTML(desc)}</p>${fromShop?`<p class="ed-detail-price">✦ ${obj.price} gold · You have ✦ ${S.gold}</p><button class="btn primary" data-ed-purchase ${canBuy?'':'disabled'}>${canBuy?'Purchase':'Not available'}</button>`:`<p class="note">${c?(c.up?'Upgraded · ':'')+spec(c).rarity:''}</p>${modal.scope==='deck'&&modal.remove&&!spec(c).eternal?`<button class="btn primary" data-ed-confirm-remove="${modal.index}" ${S.gold>=75+25*(S.edRemovalCount||0)?'':'disabled'}>Remove from deck · ✦ ${75+25*(S.edRemovalCount||0)}</button>`:''}`}<button class="btn ghost" data-ed-back>Back</button></div></section></div>`
 }
 return edOldModal()};
const edShopAct=act;
act=function(action){if(action==='close'&&(modal?.type==='edCardDetails'||modal?.type==='edShopDetails')){modal=null;render();return}edShopAct(action)};
function edStoreBuy(){let m=modal;if(!m||m.type!=='edShopDetails'||S.screen!=='shop')return;let item=S.edShop?.[m.kind]?.[m.index];if(!item||S.gold<item.price)return;
 if(m.kind==='potions'&&S.potions.length>=S.potionSlots)return;
 S.gold-=item.price;S.edShop[m.kind][m.index]=null;
 if(m.kind==='cards'){let card=newCard(item.key);S.deck.push(card);showCardReveal(card,'Purchased card','Added to your permanent deck.','close')}
 else if(m.kind==='relics'){gainRelic(item.id);modal={type:'relicDetail',id:item.id};save();render()}
 else if(m.kind==='potions'){edGivePotion(item.id);modal={type:'edPotions'};save();render()}
}
document.addEventListener('click',e=>{
 const q=e.target.closest('[data-ed-collection]');if(q){e.preventDefault();e.stopImmediatePropagation();let [scope,n]=q.dataset.edCollection.split(':'),idx=Number(n);if(scope==='preview')return;let c=scope==='catalog'?(()=>{let key=['strike','defend','bash',...SOLO_POOL][idx];return key?{key,uid:'catalog-'+idx,up:false}:null})():S?.[scope]?.[idx];if(c){let removing=modal?.type==='edRemoval';modal={type:'edCardDetails',card:{...c},scope,index:idx,remove:removing};render()}return}
 const view=e.target.closest('[data-ed-shop-card],[data-ed-shop-potion],[data-ed-shop-relic]');if(view&&S?.screen==='shop'){e.preventDefault();e.stopImmediatePropagation();let kind=view.hasAttribute('data-ed-shop-card')?'cards':view.hasAttribute('data-ed-shop-potion')?'potions':'relics';let idx=Number(view.getAttribute(`data-ed-shop-${kind==='cards'?'card':kind==='potions'?'potion':'relic'}`));modal={type:'edShopDetails',kind,index:idx};render();return}
 if(e.target.closest('[data-ed-purchase]')){e.preventDefault();e.stopImmediatePropagation();edStoreBuy();return}
 if(e.target.closest('[data-ed-remove]')){e.preventDefault();e.stopImmediatePropagation();if(!S.edShop?.removalUsed){modal={type:'edRemoval'};render()}return}
 if(e.target.closest('[data-ed-back]')){e.preventDefault();e.stopImmediatePropagation();let m=modal;if(m?.type==='edCardDetails'){modal=m.remove?{type:'edRemoval'}:m.scope==='catalog'?{type:'catalog'}:{type:m.scope==='deck'?'deck':'piles',pile:m.scope}}else modal=null;render();return}
 const remove=e.target.closest('[data-ed-confirm-remove]');if(remove){e.preventDefault();e.stopImmediatePropagation();let idx=Number(remove.dataset.edConfirmRemove),price=75+25*(S.edRemovalCount||0);if(S.screen!=='shop'||S.edShop.removalUsed||S.gold<price||!S.deck[idx]||spec(S.deck[idx]).eternal)return;S.gold-=price;S.deck.splice(idx,1);S.edRemovalCount=(S.edRemovalCount||0)+1;S.edShop.removalUsed=true;modal=null;save();render();return}
},true);
if(S){edEnsurePotions();if(S.screen==='shop')edEnsureShop();save();render()}
