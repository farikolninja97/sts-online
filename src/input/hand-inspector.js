// Swipeable hand, card inspection and drag-to-play skills/powers.
/* V1.08 — swipeable hand, expanded card inspection, universal drag casting. */
let v108HandScroll=0;
const v108BattleScreen=battleScreen;
battleScreen=function(){
 const content=v108BattleScreen();
 const handToolbar=`<div class="hand-tools" role="group" aria-label="Hand navigation"><span class="hand-count">HAND <b>${S.hand.length}/10</b></span><button type="button" class="hand-nav" data-hand-scroll="-1" aria-label="Scroll hand left">‹</button><button type="button" class="hand-nav" data-hand-scroll="1" aria-label="Scroll hand right">›</button><button class="hand-view" data-action="handall">View all cards</button><span class="hand-hint">Swipe cards · Tap for live damage · Drag to play</span></div>`;
 return content.replace('<div class="hand-wrap">','<section class="hand-area">'+handToolbar+'<div class="hand-wrap" role="group" aria-label="Swipeable card hand">').replace('</div></main>','</div></section></main>');
};
const v108Render=render;
render=function(){
 if(S?.screen==='battle')v108HandScroll=document.querySelector('.hand-wrap')?.scrollLeft??v108HandScroll;
 v108Render();
 if(S?.screen==='battle')requestAnimationFrame(()=>{
   const row=document.querySelector('.hand-wrap');
   if(row){row.scrollLeft=Math.min(v108HandScroll,Math.max(0,row.scrollWidth-row.clientWidth));}
   document.querySelectorAll('.hand-wrap .card').forEach(c=>{c.style.marginLeft='0px';c.style.zIndex='1'});
 });
};
const v108ModalHTML=modalHTML;
modalHTML=function(){
 if(modal?.type==='handall'){
   return `<div class="overlay"><section class="modal v108-hand-modal" role="dialog" aria-modal="true" aria-label="All cards in hand"><button class="litebtn close" data-action="close" aria-label="Close">✕</button><h2>Cards in your hand (${S.hand.length}/10)</h2><p class="note">Choose any card to read its complete text and play it. Scroll inside this window to see all cards.</p><div class="v108-hand-list">${S.hand.map(c=>{let d=spec(c),cost=updatedCost(c);return `<button class="v108-hand-item" data-inspect-hand="${escapeHTML(c.uid)}"><span class="v108-hand-cost">${cost===-1?'X':cost}</span><span><b>${escapeHTML(d.name)}${c.up?'+':''}</b><small>${escapeHTML(d.type)} · ${escapeHTML(d.rarity)}</small><span class="v108-hand-desc">${S.screen==='battle'&&d.type==='Attack'?liveCardDescription(d.desc,damagePreview(c,targetEnemy())):escapeHTML(d.desc)}</span></span><span class="v108-hand-eye">⌕</span></button>`}).join('')||'<p class="note">Your hand is empty.</p>'}</div><button class="btn ghost" data-action="close">Return to battle</button></section></div>`;
 }
 if(modal?.type==='cardinspect'){
   let c=S?.hand?.find(x=>x.uid===modal.id);
   if(!c)return `<div class="overlay"><section class="modal"><h2>Card no longer in hand</h2><button class="btn" data-action="close">Close</button></section></div>`;
   let d=spec(c), cost=updatedCost(c), valid=!d.unplayable&&(cost===-1||cost<=S.energy),targeted=isTargetedCard(c);
   let cleanCard=cardHTML(c,'combat-inspect').replace(/\sdata-rewardcard="[^"]*"/g,'').replace(/<button /,'<div ').replace(/<\/button>/,'</div>');
   return `<div class="overlay"><section class="modal v108-inspect-modal" role="dialog" aria-modal="true" aria-label="${escapeHTML(d.name)} details"><button class="litebtn close" data-action="inspectclose" aria-label="Close">✕</button><p class="small">CARD DETAILS · ${escapeHTML(d.type.toUpperCase())}</p><div class="v108-inspect-layout"><div class="v108-inspect-art">${cleanCard}</div><div class="v108-inspect-info"><h2>${escapeHTML(d.name)}${c.up?'+':''}</h2><p class="v108-card-text">${escapeHTML(d.desc)}</p>${d.type==='Attack'?damageBreakdownHTML(c):''}<p class="note">${cost===-1?'X':cost} Energy · ${escapeHTML(d.rarity)}${c.up?' · Upgraded':''}</p><p class="note">${targeted?'Select a foe below to update the live damage, then tap Select enemy or drag the card.':'Drag this card onto the battlefield to activate it.'}</p><div class="v108-inspect-actions"><button class="btn primary" data-action="${targeted?'inspectaim':'inspectplay'}" ${valid?'':'disabled'}>${targeted?'Select enemy →':d.type==='Power'?'Activate Power ✦':'Play card ⬡'}</button><button class="btn ghost" data-action="inspectclose">Back</button></div>${valid?'':`<p class="note">${d.unplayable?'This card cannot be played directly.':'Not enough Energy to play this card.'}</p>`}</div></div></section></div>`;
 }
 return v108ModalHTML();
};
const v108Act=act;
act=function(action){
 if(action==='handall'){modal={type:'handall'};render();return}
 if(action==='inspectclose'){modal=modal?.from==='handall'?{type:'handall'}:null;render();return}
 if(action==='inspectplay'||action==='inspectaim'){
   let c=S?.hand?.find(x=>x.uid===modal?.id);
   if(!c){modal=null;render();return}
   let d=spec(c), cost=updatedCost(c);
   if(d.unplayable||(cost!==-1&&cost>S.energy))return;
   modal=null;render();
   if(action==='inspectplay'&&!isTargetedCard(c))playCard(c.uid);
   else setTargetMode(c.uid);
   return;
 }
 v108Act(action);
};
document.addEventListener('click',e=>{
 let nav=e.target.closest('[data-hand-scroll]');
 if(nav){e.preventDefault();const row=document.querySelector('.hand-wrap');if(!row)return;
   const width=row.querySelector('.card')?.getBoundingClientRect().width||100;
   row.scrollBy({left:Number(nav.dataset.handScroll)*(width*2+14),behavior:'smooth'});
   return;
 }
 let item=e.target.closest('[data-inspect-hand]');
 if(item){e.preventDefault();let uid=item.dataset.inspectHand;
   if(S?.hand?.some(c=>c.uid===uid)){modal={type:'cardinspect',id:uid,from:'handall'};render()}
 }
},true);
document.addEventListener('scroll',e=>{if(e.target?.matches?.('.hand-wrap'))v108HandScroll=e.target.scrollLeft},true);
