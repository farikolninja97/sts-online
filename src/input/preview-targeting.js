// Select damage preview target and render live drag previews.
// Clicking a foe in the inspection modal changes the same selected target
// used by tap-to-target and dragging, with no damage dealt until card play.
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-preview-target]');
 if(!b||modal?.type!=='cardinspect'||S?.screen!=='battle')return;
 e.preventDefault();e.stopImmediatePropagation();
 const id=Number(b.dataset.previewTarget);
 const i=S.enemies.findIndex(q=>q.id===id&&q.hp>0);
 if(i<0)return;
 S.target=i;save();render();
},true);
// When a dragged card hovers a different foe, show damage against THAT foe
// on the ghost itself, even though selection changes only after a valid drop.
document.addEventListener('pointermove',e=>{
 if(!cardPointer?.dragging||!dragGhost||S?.screen!=='battle')return;
 const id=cardPointer.id,c=S.hand.find(q=>q.uid===id);
 const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-enemy]');
 const enemy=hit?S.enemies.find(q=>q.id===Number(hit.dataset.enemy)&&q.hp>0):null;
 if(!c||!enemy||spec(c).type!=='Attack')return;
 const p=damagePreview(c,enemy),badge=dragGhost.querySelector('.v109-damage');
 if(!p||!badge)return;
 badge.innerHTML=`<b>⚔ ${p.perHit}</b>${p.hits>1?`<em>×${p.hits}</em>`:''}<small>${p.hpLoss!==p.total?`${p.hpLoss} HP`:'LIVE'}</small>`;
 badge.title=p.accessible;
},false);

// Refresh one time for new hand toolbar on an already-loaded local save.
render();


