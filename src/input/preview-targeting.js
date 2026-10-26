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
// Drag hover damage is handled by the unified V1.13 pointer controller.
