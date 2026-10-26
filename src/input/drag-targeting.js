// Touch and mouse drag targeting; click fallback.
function isTargetedCard(c){if(!c)return false;let d=spec(c);return d.type==='Attack'&&!d.aoe&&!['whirlwind','conflag','swordboom','stomp','breakthrough','howl','pactsend','thunder'].includes(c.key)||['taunt','tremble','dominate','molten'].includes(c.key)}
function setTargetMode(uid){chosenTargetCard=uid;document.body.classList.toggle('choosing-target',!!uid);document.querySelectorAll('.selected-cast').forEach(el=>el.classList.remove('selected-cast'));
 if(uid){let el=document.querySelector(`[data-play="${uid}"]`);if(el)el.classList.add('selected-cast')}document.getElementById('targeting-banner')?.remove();
 if(uid){let t=document.createElement('div');t.id='targeting-banner';t.className='targeting-banner';t.innerHTML='Choose an enemy or drag the card onto one <button type="button" data-cancel-target>Cancel</button>';document.body.appendChild(t)}
}
function commitTargetCard(uid,enemyId){if(S?.screen!=='battle'||busy)return;let card=S.hand.find(c=>c.uid===uid),enemy=S.enemies.find(e=>e.id===enemyId&&e.hp>0);if(!card||!enemy)return;S.target=S.enemies.indexOf(enemy);setTargetMode(null);playCard(uid)}
function cleanDrag(){if(dragGhost){dragGhost.remove();dragGhost=null}if(dragLine){dragLine.remove();dragLine=null}document.querySelectorAll('.drop-ready').forEach(x=>x.classList.remove('drop-ready'));cardPointer=null}
function fitHand(){if(S?.screen!=='battle')return;let wrap=document.querySelector('.hand-wrap');if(!wrap)return;let cards=[...wrap.querySelectorAll('.card')],count=cards.length;
 if(!count)return;let narrow=window.matchMedia('(max-width:600px)').matches;if(!narrow){cards.forEach(el=>el.style.marginLeft='');return}
 let width=window.innerWidth,short=window.innerHeight<=720,cardWidth=short?86:100,usable=width-14;
 cards.forEach((el,i)=>{el.style.marginLeft='0px';el.style.zIndex='1'})
}
const oldRender=render;
render=function(){oldRender();if(!S||S.screen!=='battle'){chosenTargetCard=null;cleanDrag();document.body.classList.remove('choosing-target');document.getElementById('targeting-banner')?.remove()}
 if(S?.screen==='battle'){requestAnimationFrame(()=>{fitHand();if(chosenTargetCard&&!S.hand.find(c=>c.uid===chosenTargetCard))setTargetMode(null);else if(chosenTargetCard)setTargetMode(chosenTargetCard)})}}
function makeDragGhost(source,clientX,clientY){dragGhost=source.cloneNode(true);dragGhost.classList.add('drag-card-ghost');dragGhost.removeAttribute('data-play');dragGhost.style.width=source.getBoundingClientRect().width+'px';dragGhost.style.height=source.getBoundingClientRect().height+'px';document.body.appendChild(dragGhost);
 if(isTargetedCard(S.hand.find(c=>c.uid===cardPointer?.id))){dragLine=document.createElementNS('http://www.w3.org/2000/svg','svg');dragLine.setAttribute('class','drag-aim-line');dragLine.innerHTML='<defs><marker id="aimhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#ffd082"/></marker></defs><path id="aimpath" stroke="#ffd082" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="9 5" marker-end="url(#aimhead)"/>';document.body.appendChild(dragLine)}positionDrag(clientX,clientY)}
function positionDrag(x,y){if(!dragGhost)return;dragGhost.style.left=x+'px';dragGhost.style.top=y+'px';const p=dragLine?.querySelector('#aimpath');if(p){let box=cardPointer?.source?.getBoundingClientRect();let cx=(box?.left||x)+(box?.width||0)/2,cy=(box?.top||y)+(box?.height||0)/2;p.setAttribute('d',`M ${cx} ${cy} Q ${(cx+x)/2} ${Math.min(cy,y)-60} ${x} ${y}`)}
 document.querySelectorAll('.drop-ready').forEach(x=>x.classList.remove('drop-ready'));let target=document.elementFromPoint(x,y)?.closest('[data-enemy]');if(target)target.classList.add('drop-ready')}
document.addEventListener('pointerdown',e=>{if(S?.screen!=='battle'||busy||modal)return;let source=e.target.closest('[data-play]');if(!source||e.button!==0)return;let id=source.dataset.play,c=S.hand.find(x=>x.uid===id);if(!c||spec(c).unplayable||(updatedCost(c)!==-1&&updatedCost(c)>S.energy))return;cardPointer={id,source,x:e.clientX,y:e.clientY,pid:e.pointerId,dragging:false}},true);
document.addEventListener('pointermove',e=>{if(!cardPointer||e.pointerId!==cardPointer.pid)return;let dx=e.clientX-cardPointer.x,dy=e.clientY-cardPointer.y;if(!cardPointer.dragging&&Math.abs(dx)>11&&Math.abs(dx)>Math.abs(dy)*1.45&&e.pointerType==='touch'){cardPointer=null;return}
 if(!cardPointer.dragging&&Math.hypot(dx,dy)>11){cardPointer.dragging=true;if(isTargetedCard(S.hand.find(c=>c.uid===cardPointer.id)))setTargetMode(cardPointer.id);else setTargetMode(null);makeDragGhost(cardPointer.source,e.clientX,e.clientY)}
 if(cardPointer?.dragging){e.preventDefault();positionDrag(e.clientX,e.clientY)}},{capture:true,passive:false});
document.addEventListener('pointerup',e=>{if(!cardPointer||cardPointer.pid!==e.pointerId)return;const info=cardPointer,dragged=info.dragging;let target=dragged?document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-enemy]'):null;cleanDrag();if(dragged){lastDragClickBlock=Date.now()+450;
 let c=S.hand.find(x=>x.uid===info.id),aimed=isTargetedCard(c),hit=document.elementFromPoint(e.clientX,e.clientY);
 if(aimed){if(target)commitTargetCard(info.id,Number(target.dataset.enemy));else setTargetMode(null)}
 else if(c&&hit?.closest('.arena,.fighter-zone,.combat-meta,.combat-toolbar')){setTargetMode(null);playCard(info.id)}
 else setTargetMode(null);
 }},true);
document.addEventListener('pointercancel',()=>{cleanDrag()},true);
// Run before legacy delegated click-to-play. Targeted attacks tap-to-select; drags play on drop.
document.addEventListener('click',e=>{
 if(e.target.closest('[data-cancel-target]')){e.preventDefault();e.stopImmediatePropagation();setTargetMode(null);return}
 let cardEl=e.target.closest('[data-play]');if(cardEl&&S?.screen==='battle'&&!modal){
 e.preventDefault();e.stopImmediatePropagation();
 let c=S.hand.find(c=>c.uid===cardEl.dataset.play);
 if(c&&Date.now()>lastDragClickBlock){modal={type:'cardinspect',id:c.uid,from:'battle'};render()}
 return;
}
 let enemy=e.target.closest('[data-enemy]');if(enemy&&chosenTargetCard&&S?.screen==='battle'){e.preventDefault();e.stopImmediatePropagation();commitTargetCard(chosenTargetCard,Number(enemy.dataset.enemy))}
},true);
document.addEventListener('click',e=>{let t=e.target.closest('[data-catalog-entry]');if(t)return},true);
document.addEventListener('input',e=>{if(e.target?.matches('[data-catalog-search]')){let q=e.target.value.toLowerCase();document.querySelectorAll('[data-catalog-entry]').forEach(el=>el.hidden=!el.dataset.catalogEntry.includes(q))}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal?.type==='cardreveal'){e.preventDefault();e.stopImmediatePropagation();revealNext()}},true);
window.addEventListener('resize',()=>requestAnimationFrame(fitHand));


// Reveals for shop acquisitions and the random forge event (before the original delegated handlers).
document.addEventListener('click',e=>{
 let buy=e.target.closest('[data-buy]');if(buy&&S?.screen==='shop'){
  e.preventDefault();e.stopImmediatePropagation();let i=Number(buy.dataset.buy),key=S.shopOffers?.[i];if(!key||S.gold<55)return;
  S.gold-=55;let card=newCard(key);S.deck.push(card);S.shopOffers.splice(i,1);showCardReveal(card,'Card purchased','This card has been added to your permanent deck.','close');return;
 }
 let forge=e.target.closest('[data-event="forge"]');if(forge&&S?.screen==='event'){
  e.preventDefault();e.stopImmediatePropagation();let pool=S.deck.filter(c=>!c.up&&UP[c.key]);if(!pool.length){showToast('No eligible cards to upgrade');moveToNext();return}
  let c=choice(pool),before={...c};c.up=true;showCardReveal(c,'Random card upgraded','The Cinder Altar strengthened one randomly selected card.','route',before);return;
 }
},true);


