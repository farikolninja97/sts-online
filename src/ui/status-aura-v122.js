/* V1.22 — Status lifecycle, persistent buff auras and bespoke boss curses.
   Presentation only: this script does NOT mutate HP, Block, damage, status stacks,
   Intents, save data or enemy move decisions. */
'use strict';
const ED122_BUFFS=['strength','dexterity','plating','ritual','artifact','thorns','spineWard','flame','rage','colossus'];
const ED122_DEBUFFS=['weak','vulnerable','frail','tangled','shrink'];
const ED122_BOSS_SIGNS={
 ashen_monarch:{label:'ROYAL DECREE',sigil:'♛',theme:'crown'},
 rootmaw:{label:'ENTANGLING ROOTS',sigil:'❧',theme:'root'},
 shard_matriarch:{label:'CRYSTAL WEB',sigil:'✳',theme:'web'},
 forge_tyrant:{label:'BLAZING CURSE',sigil:'⚒',theme:'forge'},
 hollow_regent:{label:'SPECTRAL EDICT',sigil:'♜',theme:'regent'},
 eclipse_engine:{label:'DEAD STAR',sigil:'◉',theme:'eclipse'}
};
function ed122Val(source,key){
 const v=source?.[key];return Number.isFinite(Number(v))?Math.max(0,Number(v)):v===true?1:0;
}
function ed122PowerValues(a){
 const powers=a?.powers||{};return Object.fromEntries(Object.entries(powers).filter(([k,v])=>Number(v)>0).map(([k,v])=>['power:'+k,Number(v)]));
}
function ed122Capture(){
 if(S?.screen!=='battle')return null;
 const snapshotActor=(a,hero=false)=>{
  let statuses={};for(const key of [...ED122_BUFFS,...ED122_DEBUFFS])statuses[key]=ed122Val(a,key);
  if(hero)Object.assign(statuses,ed122PowerValues(a));
  return {id:hero?'hero':a.id,key:hero?'hero':a.key,statuses};
 };
 return {identity:[S.act,S.floor,S.room,S.encounterTitle||''].join('|'),
  actors:[snapshotActor(S,true),...(S.enemies||[]).filter(e=>e.hp>0).map(e=>snapshotActor(e))]};
}
function ed122QueueChange(actor,key,n,type){
 if(typeof queueFX!=='function'||!document.querySelector(vfxSelector(actor.id)))return false;
 const label=(key.startsWith('power:')?(CARDS[key.slice(6)]?.name||key.slice(6)):key==='spineWard'?'Thorns':key).replace(/([a-z])([A-Z])/g,'$1 $2').toUpperCase();
 queueFX(actor.id,n,type,{status:key.startsWith('power:')?'power':key.toLowerCase(),label,fxSource:'v122'});
 return true;
}
let ed122Last=null;
const ed122RenderBase=render;
render=function(){
 const next=ed122Capture();const last=ed122Last;
 const same=next&&last&&next.identity===last.identity;
 let queued=false;
 if(same){
  const oldById=new Map(last.actors.map(a=>[String(a.id)+'|'+a.key,a]));
  for(const actor of next.actors){
   const old=oldById.get(String(actor.id)+'|'+actor.key);if(!old)continue;
   for(const [key,n] of Object.entries(actor.statuses)){
    const prev=old.statuses[key]||0;if(prev===n)continue;
    const debuff=ED122_DEBUFFS.includes(key);
    // Application of Weak/Vulnerable/Frail/Shrink already produces V1.21 FX.
    // Tangled can be assigned directly without blockDebuff, so it needs FX.
    if(n>prev&&(!debuff||key==='tangled'))queued=ed122QueueChange(actor,key,n-prev,'status')||queued;
    else if(prev>n)queued=ed122QueueChange(actor,key,prev-n,n===0?'status-end':'status-tick')||queued;
   }
  }
 }
 ed122Last=next;
 const result=ed122RenderBase();
 // Many legacy code paths render without triggerFX (including relic/Powers);
 // schedule a drain rather than leaving those announcements indefinitely queued.
 if(queued)queueMicrotask(()=>{if(S?.screen==='battle'&&typeof triggerFX==='function')triggerFX()});
 return result;
};
const ed122BaseCombatantState=combatantStateClass;
combatantStateClass=function(actor,isPlayer=false){
 const old=ed122BaseCombatantState(actor,isPlayer), extra=[];
 if(ed122Val(actor,'strength')>0)extra.push('is-empowered');
 if(ed122Val(actor,'dexterity')>0||ed122Val(actor,'plating')>0||ed122Val(actor,'spineWard')>0)extra.push('is-guarded');
 if(ed122Val(actor,'ritual')>0)extra.push('is-ritualized');
 if(ed122Val(actor,'artifact')>0)extra.push('is-artifacted');
 if(isPlayer&&(ed122Val(S,'flame')>0||ed122Val(S,'thorns')>0))extra.push('is-flaming');
 if(isPlayer&&S?.powers&&Object.values(S.powers).some(x=>Number(x)>0))extra.push('is-powered');
 return [old,...extra].filter(Boolean).join(' ');
};
function ed122ClampLabelX(x){const padding=window.innerWidth<=600?100:135;return Math.max(Math.min(padding,window.innerWidth/2),Math.min(window.innerWidth-Math.min(padding,window.innerWidth/2),x));}
function ed122StatusFx(q){
 const v=q.visual||vfxCapture(q.id);if(!v)return;
 const isRemoved=q.type==='status-end',isTick=q.type==='status-tick';
 const key=String(q.status||'').replace(/[^a-z0-9-]/g,'');
 const debuff=ED122_DEBUFFS.includes(key);
 const theme=isRemoved?'removed':isTick?'tick':debuff?'debuff':'buff';
 const label=isRemoved?`${q.label||key} ENDED`:isTick?`${q.label||key} −${q.n}`:`${q.label||key} +${q.n}`;
 const glyph=isRemoved?'✧':isTick?'−':debuff?'↓':'✦';
 const ring=vfxElement(`ed122-status-ring ${theme}`,v.cx,v.cy);
 ring.textContent=glyph;vfxRemove(ring,vfxReduced?180:790);
 const tag=vfxElement(`ed122-status-label ${theme}`,ed122ClampLabelX(v.cx),v.cy-40);
 tag.textContent=label;vfxRemove(tag,vfxReduced?220:1150);
 if(isRemoved){const actor=document.querySelector(vfxSelector(q.id));actor?.querySelector('.avatar-shell')?.animate?.([
   {opacity:1,filter:'brightness(1.35)'},{opacity:.86,filter:'brightness(1.1)',offset:.4},{opacity:1,filter:'brightness(1)'}
  ],{duration:vfxReduced?100:450,easing:'ease-out'});
 }else if(!isTick){
  const actor=document.querySelector(vfxSelector(q.id));const chip=actor?.querySelector(`[data-status-key="${key}"]`);
  if(chip&&typeof chip.animate==='function')chip.animate([{transform:'scale(.85)'},{transform:'scale(1.18)',offset:.45},{transform:'scale(1)'}],{duration:vfxReduced?90:580});
 }
}
function ed122BossScene(key,pos,move,castOnly=false){
 const spec=ED122_BOSS_SIGNS[key];if(!spec||!pos)return;
 const ring=vfxElement(`ed122-boss-rune ${spec.theme}`,pos.cx,pos.cy-8);
 const glyph=document.createElement('strong');glyph.textContent=spec.sigil;ring.append(glyph);
 vfxRemove(ring,vfxReduced?230:1050);
 if(!castOnly){
  const label=vfxElement(`ed122-boss-label ${spec.theme}`,ed122ClampLabelX(pos.cx),pos.cy-70);
  label.textContent=move?.n?.toUpperCase()||spec.label;
  vfxRemove(label,vfxReduced?280:1170);
 }
 if(!vfxReduced){
  // Unique, original glyph/particle overlays; never alter actual damage.
  const rays=spec.theme==='web'?8:spec.theme==='root'?6:spec.theme==='eclipse'?12:7;
  for(let i=0;i<rays;i++){
   const a=2*Math.PI*i/rays,ray=vfxElement(`ed122-boss-ray ${spec.theme}`,pos.cx,pos.cy-10);
   ray.style.setProperty('--angle',a+'rad');ray.style.setProperty('--travel',spec.theme==='root'?'76px':'112px');
   vfxRemove(ray,900);
  }
 }
}
// Add a distinctive aura to the boss WINDUP, before any real debuff is applied.
const ed122CastBase=enemyCinematics.cast;
enemyCinematics.cast=async function(enemy,move){
 if(ED122_BOSS_SIGNS[enemy?.key]&&move?.kind==='debuff'){
  const pos=vfxCapture(enemy.id);ed122BossScene(enemy.key,pos,move,true);
 }
 return ed122CastBase(enemy,move);
};
// Boss curse lands on hero after the normal status/card effects are resolved.
// Artifact can block a status; the sigil is a spell visual, not a false status claim.
const ed122ResolveBase=ed119ResolveEnemyMove;
ed119ResolveEnemyMove=function(enemy,move){
 const result=ed122ResolveBase(enemy,move);
 if(ED122_BOSS_SIGNS[enemy?.key]&&(move?.kind==='debuff'||move?.status)){
  const pos=vfxCapture('hero');if(pos)queueFX('hero',1,'boss-curse',{boss:enemy.key,move:move.n,visual:pos});
 }
 return result;
};
const ed122ImpactBase=vfxImpact;
vfxImpact=function(q){
 if(q.type==='status-end'||q.type==='status-tick'||q.type==='status'&&q.fxSource==='v122'){ed122StatusFx(q);return;}
 if(q.type==='boss-curse'){const pos=q.visual||vfxCapture('hero');ed122BossScene(q.boss,pos,{n:q.move},false);return;}
 return ed122ImpactBase(q);
};
