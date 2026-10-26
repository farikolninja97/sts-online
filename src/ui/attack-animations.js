// Hit, block, multi-hit, death and visual effect pipeline.
/* V1.06 — visual event pipeline. Positions and dying sprites are captured BEFORE render()
   removes defeated enemies. All effects are cosmetic and never change hit calculations. */
let vfxActiveCard='strike';
let vfxTransitionHeld=false;
let vfxVisualEnd=0;
const vfxReduced=typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const vfxStyleForCard=key=>{
 if(['bash','body','feed','pommel','ironwave','hemokinesis','bludgeon','mangle','cruelty','uppercut','headbutt','cinder','dominate','heavyslash'].includes(key))return 'heavy';
 if(['inferno','immolate','fiend','burn','conflagration','firebreathing','combust','pyre','flames','thunder','moltenfist','sever'].includes(key))return 'ember';
 if(['whirlwind','pummel','twinstrike','one-two','onetwo','riddle','spite','swordboomerang'].includes(key))return 'multi';
 return 'slash';
};
const vfxLayer=()=>{let el=document.getElementById('ember-vfx-layer');if(!el){el=document.createElement('div');el.id='ember-vfx-layer';el.setAttribute('aria-hidden','true');document.body.append(el)}return el};
const vfxSelector=id=>id==='hero'?'[data-character="hero"]':`[data-enemy="${id}"]`;
const vfxCapture=id=>{
 const dest=document.querySelector(vfxSelector(id));if(!dest)return null;
 const avatar=dest.querySelector('.avatar')||dest;
 const box=avatar.getBoundingClientRect(),r=dest.getBoundingClientRect();
 return {cx:box.x+box.width/2,cy:box.y+box.height*.5,x:box.x,y:box.y,w:box.width,h:box.height,
   avatarHTML:avatar.outerHTML,combatantX:r.x,combatantY:r.y};
};
queueFX=function(id,n,type,meta={}){fx.push({id,n,type,...meta,visual:vfxCapture(id)})};
const vfxElement=(cls,x,y,css={})=>{
 const el=document.createElement('div');el.className=cls;el.style.left=x+'px';el.style.top=y+'px';
 for(let [k,v] of Object.entries(css))el.style.setProperty(k,v);
 vfxLayer().append(el);return el;
};
const vfxRemove=(el,ms=850)=>setTimeout(()=>el?.remove(),ms);
function vfxSparks(x,y,count=9,force=false){
 if(vfxReduced)return;
 const palette=['#fff2b9','#ffce75','#fe9353','#ec5a3d','#c26f37'];
 for(let i=0;i<count;i++){
  const angle=(2*Math.PI*i/count)+(Math.random()-.5)*.55;
  const length=(force?80:48)+Math.random()*(force?86:38);
  let el=vfxElement('vfx-spark',x+(Math.random()-.5)*22,y+(Math.random()-.5)*17,{
   '--dx':Math.cos(angle)*length+'px','--dy':Math.sin(angle)*length-(force?36:22)+'px',
   '--dur':(force?.8:.51)+Math.random()*.42+'s','--size':(2+Math.random()*6)+'px','--spark':palette[i%palette.length]
  });vfxRemove(el,1350);
 }
}
function vfxAnimateActor(id,type){
 const el=document.querySelector(`${vfxSelector(id)} .avatar`);
 if(!el||vfxReduced||typeof el.animate!=='function')return;
 const enemy=id!=='hero',dir=enemy?-1:1;
 const frames=type==='attack'?[{transform:'translate(0,0) scale(1)',filter:'brightness(1)'},{transform:`translate(${dir*18}px,-4px) scale(1.07)`,filter:'brightness(1.35)',offset:.48},{transform:'translate(0,0) scale(1)',filter:'brightness(1)'}]:
 [{transform:'translate(0,0)',filter:'brightness(1)'},{transform:`translate(${enemy?9:-8}px,3px) rotate(${enemy?5:-4}deg)`,filter:'brightness(2)',offset:.32},{transform:'translate(0,0)',filter:'brightness(1)'}];
 el.animate(frames,{duration:type==='attack'?290:330,easing:'ease-out'});
}
function vfxImpact(q){
 const v=q.visual||vfxCapture(q.id);if(!v)return;
 const x=v.cx,y=v.cy;
 if(q.type==='buff'){
   const number=vfxElement('vfx-number heal',x,y-17);number.textContent='+'+q.n;vfxRemove(number,850);return;
 }
 if(q.type==='death'){
   vfxDeath(q);return;
 }
 if(q.type!=='hit')return;
 const blocked=Math.max(0,q.blocked||0),hurt=Math.max(0,q.n||0);
 const style=q.style||'slash';
 if(q.source==='hero')vfxAnimateActor('hero','attack');
 if(hurt>0){vfxAnimateActor(q.id,'hurt')}
 if(blocked>0){let shield=vfxElement('vfx-block',x,y);vfxRemove(shield,430)}
 if(hurt>0||(!blocked&&q.incoming>0)){
  let impact=vfxElement('vfx-impact '+style,x,y);vfxRemove(impact,500);
  vfxSparks(x,y,style==='heavy'?12:style==='ember'?10:6,style==='heavy');
 }
 let number=vfxElement('vfx-number'+(hurt===0?' blocked':''),x,y-28);
 number.textContent=hurt>0?'−'+hurt:(blocked>0?'BLOCKED':'0');vfxRemove(number,840);
 if(blocked>0&&hurt>0){let guard=vfxElement('vfx-number blocked',x+30,y+8);guard.textContent='🛡 '+blocked;vfxRemove(guard,850)}
 if(hurt>0&&(style==='heavy'||q.id==='hero')){
  document.body.classList.remove('vfx-shake');void document.body.offsetWidth;
  document.body.classList.add('vfx-shake');setTimeout(()=>document.body.classList.remove('vfx-shake'),280);
 }
}
function vfxDeath(q){
 const v=q.visual;if(!v)return;
 const ghost=vfxElement('vfx-death',v.x,v.y);
 ghost.style.width=Math.max(v.w,38)+'px';ghost.style.height=Math.max(v.h,42)+'px';
 ghost.innerHTML=v.avatarHTML;
 // During a last-enemy kill, the battle screen is intentionally held for this animation.
 const original=document.querySelector(vfxSelector(q.id));
 if(original)original.style.visibility='hidden';
 vfxSparks(v.cx,v.cy,21,true);
 const bloom=vfxElement('vfx-burst',v.cx,v.cy);vfxRemove(bloom,550);
 vfxRemove(ghost,vfxReduced?190:900);
}
triggerFX=function(){
 let jobs=fx.splice(0);if(!jobs.length)return;
 let now=performance.now();
 // Keep multi-hit visuals spaced apart even though combat outcomes resolve synchronously.
 let offset=Math.max(0,vfxVisualEnd-now),previousId=null,lastHitAt=0;
 for(let q of jobs){
   if(q.type==='hit'){
     if(previousId===q.id){offset+=vfxReduced?35:156}
     else if(previousId!==null){offset+=vfxReduced?25:82}
     previousId=q.id;lastHitAt=offset;
   }else if(q.type==='death'){offset=Math.max(offset,lastHitAt+(vfxReduced?25:180));}
   setTimeout(()=>vfxImpact(q),Math.max(0,offset));
 }
 vfxVisualEnd=now+offset+(vfxReduced?55:180);
};
const vfxOriginalRender=render;
render=function(){
 // Don't cut away to a card reward before the final monster disintegrates.
 if(!vfxTransitionHeld&&S&&S.screen!=='battle'&&document.body.classList.contains('oncombat')&&fx.some(q=>q.type==='death')){
   vfxTransitionHeld=true;
   const remaining=Math.max(0,vfxVisualEnd-performance.now());
   const hits=fx.filter(q=>q.type==='hit').length;
   const otherDeaths=fx.filter(q=>q.type==='death').length-1;
   const hold=vfxReduced?190:Math.min(3200,Math.max(1100,remaining+950+Math.max(0,hits-1)*140+Math.max(0,otherDeaths)*150));
   setTimeout(()=>{vfxTransitionHeld=false;vfxOriginalRender()},hold);
   return;
 }
 if(vfxTransitionHeld)return;
 vfxOriginalRender();
};


