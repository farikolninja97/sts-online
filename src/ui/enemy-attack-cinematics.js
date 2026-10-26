// V1.14 — Enemy action presentation. All gameplay mutations remain in turn-sequence.js.
// Damage is applied ONLY in the onImpact callback, after the windup/travel phase.
// No proprietary animation assets; effects are built from original inline SVG/CSS.
const enemyCinematics = (() => {
  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const duration = ms => reduced() ? Math.min(ms, 35) : ms;
  const wait = ms => new Promise(resolve => setTimeout(resolve, duration(ms)));
  const layer = () => vfxLayer();
  let caption = null;
  let charge = null;
  const coords = el => {
    const r = el?.getBoundingClientRect();
    return r && r.width > 0 ? {x:r.left+r.width/2, y:r.top+r.height/2, w:r.width, h:r.height, left:r.left, top:r.top} : null;
  };
  function enemySprite(e) {return document.querySelector(`[data-enemy="${e.id}"] .avatar`)}
  function heroSprite() {return document.querySelector('[data-character="hero"] .avatar')}
  function style(e,m) {
    if(e.key==='archer' || /bolt|arrow|shot/i.test(m.n))return 'ranged';
    if(e.key==='acolyte' || /dark strike|flame|fire|spell|magic/i.test(m.n))return 'magic';
    if(e.key==='stone'||e.key==='sentinel'||/smash|headbutt|crush|overhead|gorge/i.test(m.n))return 'heavy';
    return 'melee';
  }
  function mask(e){
    const sprite=enemySprite(e);if(sprite)sprite.style.opacity='.18';
    // Render rebuilds the arena after every HP update. Keep the move callout
    // visible between strikes rather than dropping it on the first hit.
    if(caption&&!caption.isConnected)document.querySelector('.arena')?.append(caption);
  }
  function cleanup(){caption?.remove();charge?.remove();caption=null;charge=null;}
  async function begin(e,m){
    cleanup();
    const arena = document.querySelector('.arena');
    if(!arena) return;
    caption = document.createElement('div');
    caption.className='enemy-cinematic-caption '+(m.kind==='attack'?'attack':'support');
    const title = document.createElement('strong');title.textContent=e.name;
    const action = document.createElement('span');action.textContent=m.n;
    caption.append(title,action);arena.append(caption);
    const source=enemySprite(e),pos=coords(source);
    if(pos && !reduced()){
      charge = document.createElement('div');
      charge.className='enemy-charge-ring '+style(e,m);
      charge.style.left=pos.x+'px';charge.style.top=pos.y+'px';layer().append(charge);
      source.animate([
        {transform:'translateY(0) scale(1)',filter:'brightness(1)'},
        {transform:'translateY(-9px) scale(1.05)',filter:'brightness(1.5)',offset:.7},
        {transform:'translateY(-6px) scale(1.04)',filter:'brightness(1.3)'}
      ],{duration:420,easing:'ease-out'});
    }
    await wait(m.kind==='attack'?390:270);
  }
  function ghostOf(source,pos){
    const el=document.createElement('div');el.className='enemy-cinematic-ghost';
    el.style.left=pos.left+'px';el.style.top=pos.top+'px';el.style.width=pos.w+'px';el.style.height=pos.h+'px';
    el.innerHTML=source.innerHTML;layer().append(el);return el;
  }
  function rangedBolt(a,b,kind,ms){
    const bolt=document.createElement('div');bolt.className='enemy-cinematic-bolt '+kind;
    bolt.style.left=a.x+'px';bolt.style.top=a.y+'px';
    const theta=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
    bolt.style.rotate=theta+'deg';layer().append(bolt);
    const run=bolt.animate([
      {transform:'translate(0,0) scale(.6)',opacity:0},
      {transform:`translate(${(b.x-a.x)*.18}px,${(b.y-a.y)*.18}px) scale(1)`,opacity:1,offset:.2},
      {transform:`translate(${b.x-a.x}px,${b.y-a.y}px) scale(1.45)`,opacity:1}
    ],{duration:duration(ms),easing:'cubic-bezier(.22,.36,.6,1)',fill:'forwards'});
    run.finished.catch(()=>{}).then(()=>bolt.remove());return bolt;
  }
  function impactFreeze(kind){
    if(reduced()) return;
    document.body.classList.remove('enemy-impact-frame');
    void document.body.offsetWidth;
    document.body.classList.add('enemy-impact-frame');
    setTimeout(()=>document.body.classList.remove('enemy-impact-frame'),kind==='heavy'?155:95);
  }
  async function hit(e,m,index,total,onImpact){
    const source=enemySprite(e), hero=heroSprite(), from=coords(source),to=coords(hero);
    const kind=style(e,m);
    // An attack never relies on DOM visibility to apply damage (e.g., on tiny screens).
    if(!from||!to||reduced()){
      await wait(70);onImpact();await wait(85);return;
    }
    const windup=index===0?180:92;
    const travel=kind==='heavy'?450:kind==='ranged'?365:320;
    let clone=null;
    try{
      // Short second windup makes individual hits of a multi-hit attack readable.
      source.animate([
        {transform:'translateX(0) scale(1)',filter:'brightness(1)'},
        {transform:`translateX(${kind==='ranged'?9:17}px) scale(.93)`,filter:'brightness(1.4)',offset:.64},
        {transform:'translateX(0) scale(1.03)',filter:'brightness(1.25)'}
      ],{duration:windup,easing:'ease-in-out'});
      await wait(windup);
      if(kind==='ranged'||kind==='magic'){
        rangedBolt(from,to,kind,travel);
      }else{
        clone=ghostOf(source,from);
        source.style.opacity='.18';
        const dx=(to.x-from.x)*.70,dy=(to.y-from.y)*.24;
        clone.animate([
          {transform:'translate(0,0) scale(1)',filter:'brightness(1)'},
          {transform:`translate(${dx*.13}px,-12px) scale(.95)`,filter:'brightness(1.26)',offset:.2},
          {transform:`translate(${dx}px,${dy}px) scale(${kind==='heavy'?1.17:1.07}) rotate(-5deg)`,filter:'brightness(1.5)'}
        ],{duration:travel,easing:'cubic-bezier(.66,.02,.65,1)',fill:'forwards'});
      }
      // The health bar, Block shield and damage number change at the *visible* impact.
      await wait(travel);
      impactFreeze(kind);
      onImpact();
      await wait(kind==='heavy'?260:205);
    } finally {
      clone?.remove();
      if(source?.isConnected)source.style.opacity='';
      const displayed=enemySprite(e);if(displayed)displayed.style.opacity='';
    }
  }
  async function cast(e,m){
    const sprite=enemySprite(e);const pos=coords(sprite);
    if(pos && !reduced()){
      sprite.animate([
        {transform:'translateY(0) scale(1)',filter:'brightness(1)'},
        {transform:'translateY(-13px) scale(1.1)',filter:'brightness(1.7)',offset:.58},
        {transform:'translateY(0) scale(1)',filter:'brightness(1)'}
      ],{duration:530,easing:'ease-in-out'});
      const orb=document.createElement('div');orb.className='enemy-cast-orb '+m.kind;
      orb.style.left=pos.x+'px';orb.style.top=pos.y+'px';layer().append(orb);
      setTimeout(()=>orb.remove(),750);
    }
    await wait(550);
  }
  async function finish(){
    if(caption && !reduced())caption.classList.add('fade');
    await wait(100);cleanup();
  }
  return {begin,hit,cast,finish,cleanup,mask,style};
})();
