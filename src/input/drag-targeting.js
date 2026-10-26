// V1.13 — Unified pointer interaction controller for mouse, touch and pen.
// Horizontal gestures scroll the hand; vertical gestures lift and drag cards.
// One tap selects and previews a card; the second tap casts non-targeted cards.
// Attacks can be dragged to foes or tapped to select, then tapped on a foe.
function isTargetedCard(c){
 if(!c)return false;
 const d=spec(c);
 return (d.type==='Attack'&&!d.aoe&&!['whirlwind','conflag','swordboom','stomp','breakthrough','howl','pactsend','thunder'].includes(c.key))||['taunt','tremble','dominate','molten'].includes(c.key);
}
const gestureState={selected:null,hoverEnemy:null,startedAt:0};
function currentCard(uid=chosenTargetCard){return S?.hand?.find(c=>c.uid===uid)||null}
function cardCanPlay(c){if(!c||S?.screen!=='battle'||busy||modal||spec(c).unplayable)return false;const n=updatedCost(c);return n===-1||n<=S.energy}
function clearCastPreview(){document.getElementById('cast-preview')?.remove()}
function refreshCastPreview(){
 clearCastPreview();if(!S||S.screen!=='battle'||modal||!chosenTargetCard)return;
 const c=currentCard();if(!c)return;
 const d=spec(c),foe=targetEnemy(),p=d.type==='Attack'?damagePreview(c,foe):null;
 const el=document.createElement('aside');el.id='cast-preview';el.className='cast-preview';el.setAttribute('aria-live','polite');
 el.innerHTML=`<div class="cast-summary"><b>${escapeHTML(d.name)}${c.up?'+':''}</b><span class="cast-description">${escapeHTML(d.desc)}</span>${p?`<strong class="cast-amount">⚔ ${p.perHit}${p.hits>1?' × '+p.hits:''} <small>${p.hpLoss} HP vs ${escapeHTML(p.enemyName)}</small></strong>`:''}</div><div class="cast-buttons">${isTargetedCard(c)?'<span class="cast-hint">Tap a foe</span>':`<button type="button" class="cast-go" data-cast-selected="1" ${cardCanPlay(c)?'':'disabled'}>Play</button>`}<button type="button" class="cast-info" data-cast-info="1" aria-label="Inspect full card">Details</button><button type="button" class="cast-close" data-cancel-target="1" aria-label="Deselect card">×</button></div>`;
 document.body.appendChild(el);
}
function setTargetMode(uid){
 chosenTargetCard=uid&&currentCard(uid)?uid:null;
 document.body.classList.toggle('choosing-target',!!chosenTargetCard&&isTargetedCard(currentCard()));
 document.querySelectorAll('.selected-cast').forEach(el=>el.classList.remove('selected-cast'));
 if(chosenTargetCard){let el=[...document.querySelectorAll('[data-play]')].find(x=>x.dataset.play===chosenTargetCard);el?.classList.add('selected-cast')}
 refreshCastPreview();
}
function commitTargetCard(uid,enemyId){
 if(!cardCanPlay(currentCard(uid)))return;
 const enemy=S.enemies.find(e=>e.id===enemyId&&e.hp>0);if(!enemy)return;
 S.target=S.enemies.indexOf(enemy);setTargetMode(null);playCard(uid);
}
function clearDragHighlights(){
 document.querySelectorAll('.drop-ready,.drag-origin').forEach(el=>el.classList.remove('drop-ready','drag-origin'));
 document.getElementById('drag-damage-readout')?.remove();
 document.getElementById('drag-cast-note')?.remove();
}
function cleanDrag(){
 dragGhost?.remove();dragGhost=null;dragLine?.remove();dragLine=null;
 clearDragHighlights();cardPointer=null;gestureState.hoverEnemy=null;
 document.body.classList.remove('dragging-card');
}
function fitHand(){
 if(S?.screen!=='battle')return;
 document.querySelectorAll('.hand-wrap .card').forEach(el=>{el.style.marginLeft='';el.style.zIndex=''});
}
const v113UnderlyingRender=render;
render=function(){
 v113UnderlyingRender();
 if(S?.screen!=='battle'){chosenTargetCard=null;cleanDrag();clearCastPreview();return}
 // Never rebuild the hand during an active drag. Refresh after card resolution.
 if(chosenTargetCard&&!currentCard())chosenTargetCard=null;
 requestAnimationFrame(()=>{fitHand();if(!cardPointer?.dragging)setTargetMode(chosenTargetCard)});
};
function foeAt(x,y){
 const el=document.elementFromPoint(x,y)?.closest('[data-enemy]');
 if(!el)return null;
 return S.enemies.find(e=>e.id===Number(el.dataset.enemy)&&e.hp>0)||null;
}
function createDragGhost(source,x,y){
 dragGhost=source.cloneNode(true);dragGhost.classList.add('drag-card-ghost');dragGhost.removeAttribute('data-play');
 dragGhost.querySelector('[data-card-info]')?.remove();
 const rect=source.getBoundingClientRect();dragGhost.style.width=rect.width+'px';dragGhost.style.height=rect.height+'px';
 document.body.appendChild(dragGhost);source.classList.add('drag-origin');document.body.classList.add('dragging-card');
 if(isTargetedCard(currentCard(cardPointer.id))){
  dragLine=document.createElementNS('http://www.w3.org/2000/svg','svg');dragLine.setAttribute('class','drag-aim-line');
  dragLine.innerHTML='<path id="aimpath" stroke="#ffd486" stroke-width="3" stroke-linecap="round" fill="none" stroke-dasharray="8 7"/>';
  document.body.appendChild(dragLine);
 }
 positionDrag(x,y);
}
function updateDragReadout(c,foe,x,y){
 let readout=document.getElementById('drag-damage-readout');
 if(!foe||spec(c).type!=='Attack'){
  readout?.remove();return;
 }
 const p=damagePreview(c,foe);if(!p)return;
 if(!readout){readout=document.createElement('div');readout.id='drag-damage-readout';readout.setAttribute('role','status');readout.className='drag-damage-readout';document.body.appendChild(readout)}
 const conditions=[S.strength?`Strength ${S.strength>0?'+':''}${S.strength}`:'',S.weak>0?'Weak': '',foe.vulnerable>0?`Vulnerable ${foe.vulnerable}`:'',foe.block>0?`Block ${foe.block}`:''].filter(Boolean);
 readout.innerHTML=`<small>${escapeHTML(foe.name)}</small><strong>⚔ ${p.perHit}${p.hits>1?` × ${p.hits}`:''}</strong><span>${p.hpLoss} projected HP damage</span>${conditions.length?`<em>${escapeHTML(conditions.join(' · '))}</em>`:''}`;
 readout.style.left=Math.max(8,Math.min(window.innerWidth-195,x-90))+'px';
 readout.style.top=Math.max(8,Math.min(window.innerHeight-132,y-210))+'px';
 const badge=dragGhost?.querySelector('.v109-damage');
 if(badge){badge.innerHTML=`<b>⚔ ${p.perHit}</b>${p.hits>1?`<em>×${p.hits}</em>`:''}<small>${p.hpLoss} HP</small>`;badge.title=p.accessible}
 const desc=dragGhost?.querySelector('.card-desc');if(desc)desc.innerHTML=liveCardDescription(spec(c).desc,p);
}
function positionDrag(x,y){
 if(!dragGhost||!cardPointer)return;
 dragGhost.style.left=x+'px';dragGhost.style.top=y+'px';
 const path=dragLine?.querySelector('#aimpath');
 if(path){const rect=cardPointer.source.getBoundingClientRect();const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
  path.setAttribute('d',`M ${cx} ${cy} Q ${(cx+x)/2} ${Math.min(cy,y)-60} ${x} ${y}`)}
 const foe=foeAt(x,y);gestureState.hoverEnemy=foe?.id??null;
 document.querySelectorAll('.drop-ready').forEach(el=>el.classList.remove('drop-ready'));
 if(foe&&isTargetedCard(currentCard(cardPointer.id))){const el=[...document.querySelectorAll('[data-enemy]')].find(n=>Number(n.dataset.enemy)===foe.id);el?.classList.add('drop-ready')}
 const c=currentCard(cardPointer.id);if(c)updateDragReadout(c,foe,x,y);
 if(!isTargetedCard(c)){
  const zone=document.querySelector('.hand-area');const release=(zone?y<zone.getBoundingClientRect().top-5:y<window.innerHeight*.70);
  let note=document.getElementById('drag-cast-note');if(!note){note=document.createElement('div');note.id='drag-cast-note';note.className='drag-cast-note';document.body.appendChild(note)}
  note.textContent=release?'Release to play':'Drag upward to play';note.classList.toggle('cast-ready',release);
 }
}
function beginDrag(e,source,c){
 cardPointer.dragging=true;setTargetMode(c.uid);
 try{source.setPointerCapture(e.pointerId)}catch(_){}
 createDragGhost(source,e.clientX,e.clientY);
}
document.addEventListener('pointerdown',e=>{
 if(S?.screen!=='battle'||busy||modal||e.button!==0)return;
 const source=e.target.closest('[data-play]');if(!source||e.target.closest('[data-card-info]'))return;
 const c=currentCard(source.dataset.play);if(!c)return;
 cardPointer={id:c.uid,source,x:e.clientX,y:e.clientY,pid:e.pointerId,dragging:false,axis:null,pointerType:e.pointerType};
},true);
document.addEventListener('pointermove',e=>{
 if(!cardPointer||e.pointerId!==cardPointer.pid)return;
 const p=cardPointer,dx=e.clientX-p.x,dy=e.clientY-p.y;
 if(!p.dragging){
  if(p.pointerType==='touch'&&Math.abs(dx)>13&&Math.abs(dx)>Math.abs(dy)*1.15){cardPointer=null;return}
  if(Math.hypot(dx,dy)<10)return;
  if(p.pointerType==='touch'&&dy>8&&Math.abs(dy)>Math.abs(dx)*1.4){cardPointer=null;return} // allow downward page scroll
  const c=currentCard(p.id);if(!c||!cardCanPlay(c)){cardPointer=null;return}
  beginDrag(e,p.source,c);
 }
 if(cardPointer?.dragging){e.preventDefault();positionDrag(e.clientX,e.clientY)}
},{capture:true,passive:false});
document.addEventListener('pointerup',e=>{
 if(!cardPointer||cardPointer.pid!==e.pointerId)return;
 const p=cardPointer,dragged=p.dragging,c=currentCard(p.id);
 const foe=dragged?foeAt(e.clientX,e.clientY):null;
 const handTop=document.querySelector('.hand-area')?.getBoundingClientRect().top??(window.innerHeight*.70);
 const wasUp=e.clientY<handTop-5;
 if(dragged){
  gestureState.suppressedClick={uid:p.id,until:Date.now()+220};
  cleanDrag();
  if(!c)return;
  if(isTargetedCard(c)){
   if(foe)commitTargetCard(c.uid,foe.id);
   else setTargetMode(c.uid); // missed target: keep selected, never auto-hit wrong foe
  }else if(wasUp){setTargetMode(null);playCard(c.uid)}
  else setTargetMode(c.uid);
 }
},true);
document.addEventListener('pointercancel',()=>{if(cardPointer){cleanDrag();setTargetMode(null)}},true);
document.addEventListener('click',e=>{
 if(e.target.closest('[data-cancel-target]')){e.preventDefault();e.stopImmediatePropagation();setTargetMode(null);return}
 if(e.target.closest('[data-cast-info],[data-card-info]')){
  e.preventDefault();e.stopImmediatePropagation();
  const uid=e.target.closest('[data-card-info]')?.dataset.cardInfo||chosenTargetCard;
  if(currentCard(uid)){modal={type:'cardinspect',id:uid,from:'battle'};setTargetMode(null);render()}
  return;
 }
 if(e.target.closest('[data-cast-selected]')){
  e.preventDefault();e.stopImmediatePropagation();const c=currentCard();if(cardCanPlay(c)&&!isTargetedCard(c)){setTargetMode(null);playCard(c.uid)}return;
 }
 const cardEl=e.target.closest('[data-play]');
 if(cardEl&&S?.screen==='battle'&&!modal){
  e.preventDefault();e.stopImmediatePropagation();
  if(gestureState.suppressedClick?.uid===cardEl.dataset.play&&Date.now()<gestureState.suppressedClick.until)return;
  const c=currentCard(cardEl.dataset.play);if(!c)return;
  if(chosenTargetCard===c.uid&&!isTargetedCard(c)&&cardCanPlay(c)){setTargetMode(null);playCard(c.uid)}
  else setTargetMode(c.uid);
  return;
 }
 const enemyEl=e.target.closest('[data-enemy]');
 if(enemyEl&&chosenTargetCard&&S?.screen==='battle'){
  e.preventDefault();e.stopImmediatePropagation();const c=currentCard();
  if(isTargetedCard(c))commitTargetCard(c.uid,Number(enemyEl.dataset.enemy));
  else{S.target=S.enemies.findIndex(q=>q.id===Number(enemyEl.dataset.enemy));save();render()}
 }
},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){setTargetMode(null)}},true);
document.addEventListener('input',e=>{if(e.target?.matches('[data-catalog-search]')){const q=e.target.value.toLowerCase();document.querySelectorAll('[data-catalog-entry]').forEach(el=>el.hidden=!el.dataset.catalogEntry.includes(q))}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal?.type==='cardreveal'){e.preventDefault();e.stopImmediatePropagation();revealNext()}},true);
window.addEventListener('resize',()=>requestAnimationFrame(fitHand));
// Keep compatibility with cards acquired in the merchant and random card-upgrade events.
document.addEventListener('click',e=>{
 const buy=e.target.closest('[data-buy]');if(buy&&S?.screen==='shop'){
  e.preventDefault();e.stopImmediatePropagation();const i=Number(buy.dataset.buy),key=S.shopOffers?.[i];if(!key||S.gold<55)return;
  S.gold-=55;const card=newCard(key);S.deck.push(card);S.shopOffers.splice(i,1);
  showCardReveal(card,'Card purchased','Added to your permanent deck.','close');return;
 }
 const forge=e.target.closest('[data-event="forge"]');if(forge&&S?.screen==='event'){
  e.preventDefault();e.stopImmediatePropagation();const pool=S.deck.filter(c=>!c.up&&UP[c.key]);
  if(!pool.length){showToast('No eligible cards to upgrade');moveToNext();return}
  const c=choice(pool),before={...c};c.up=true;
  showCardReveal(c,'Random card upgraded','The Cinder Altar strengthened one randomly selected card.','route',before);
 }
},true);
