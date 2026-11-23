/* Ember Descent V1.27 — Shareable Runs + Daily Challenge milestone.
 * These are original Ember Descent challenges, not the official STS2 daily climb.
 * Named RNG streams are persisted in the SAME run save, independent of VFX.
 */
'use strict';
const ED127_RULES=1;
let ed127PendingStart=null;
function ed127Hash(text){let h=2166136261>>>0;for(const ch of String(text)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function ed127NormalizeSeed(input){return String(input||'').trim().toUpperCase().replace(/\s+/g,'-').replace(/[^A-Z0-9_-]/g,'').slice(0,28)}
function ed127Random(stream='general'){
 if(!S?.ed127Seed)return Math.random();
 const rng=S.ed127Rng??(S.ed127Rng={});
 const tag=String(stream||'general').slice(0,28);
 let state=rng[tag];
 if(!Number.isInteger(state))state=ed127Hash(`ED${ED127_RULES}|${S.ed127Seed}|${tag}`);
 state=(state+0x6D2B79F5)>>>0;rng[tag]=state;
 let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);
 return ((t^(t>>>14))>>>0)/4294967296;
}
function ed127DayUTC(date=new Date()){return date.toISOString().slice(0,10)}
function ed127DailySeed(day=ed127DayUTC()){return 'DAILY-'+String(day||ed127DayUTC()).replace(/-/g,'')+'-R'+ED127_RULES}
function ed127RandomSeed(){
 let value=0;
 try{const bytes=new Uint32Array(1);crypto.getRandomValues(bytes);value=bytes[0]}catch(e){value=(Math.random()*0x100000000)>>>0}
 return 'EMBER-'+value.toString(36).padStart(7,'0').toUpperCase();
}
function ed127InitializeRun(run){
 const opts=ed127PendingStart||{mode:'random',seed:ed127RandomSeed()};
 const seed=ed127NormalizeSeed(opts.seed)||ed127RandomSeed();
 run.ed127Seed=seed;run.ed127Mode=opts.mode||'random';run.ed127Rules=ED127_RULES;
 run.ed127ChallengeDate=opts.mode==='daily'?opts.date||ed127DayUTC():null;
 run.ed127Rng={};
 run.aiSeed=ed127Hash('AI|'+seed+'|R'+ED127_RULES)||0x9e3779b9;
 ed127PendingStart=null;
 try{localStorage.setItem('ed127_recent_seed',seed)}catch(e){}
}
function ed127ModeName(mode){return mode==='daily'?'Daily challenge':mode==='custom'?'Custom seed':mode==='replay'?'Seed replay':'Random run'}
function ed127DailyStats(day=ed127DayUTC()){
 const records=(typeof ed125ReadHistory==='function'?ed125ReadHistory().runs:[]).filter(r=>r.mode==='daily'&&r.challengeDate===day);
 return {attempts:records.length,wins:records.filter(r=>r.outcome==='victory').length,best:[...records].sort((a,b)=>(Number(b.act)||0)-(Number(a.act)||0)||(Number(b.floor)||0)-(Number(a.floor)||0))[0]||null};
}
function ed127CurrentSeedLine(){return S?.ed127Seed?`<span class="ed127-current-seed" title="Seeded run; same seed and same decisions reproduce outcomes">${escapeHTML(ed127ModeName(S.ed127Mode))} · <b>${escapeHTML(S.ed127Seed)}</b></span>`:'';}
function ed127ControlModal(){
 const today=ed127DayUTC(),daily=ed127DailySeed(today),stats=ed127DailyStats(today);
 const recent=S?.ed127Seed||(()=>{try{return localStorage.getItem('ed127_recent_seed')||''}catch(e){return ''}})();
 return `<div class="overlay ed127-overlay" data-outside="true"><section class="modal ed127-modal" role="dialog" aria-modal="true" aria-label="Run seeds and daily challenge">
 <button type="button" class="litebtn close" data-ed127-close aria-label="Close">✕</button>
 <div class="small">REPLAYABILITY MILESTONE · RNG RULES R${ED127_RULES}</div><h2>Run Seeds & Daily Challenge</h2><p class="note">Same build, same seed, and the same decisions produce the same maps, encounters, card rewards, relics, and shop stock. Your choices still change a run. Runs are saved in this browser.</p>
 ${S?.ed127Seed?`<div class="ed127-current"><span>Current run: ${escapeHTML(ed127ModeName(S.ed127Mode))}</span><div><code>${escapeHTML(S.ed127Seed)}</code><button class="litebtn" type="button" data-ed127-copy="${escapeHTML(S.ed127Seed)}">Copy seed</button></div></div>`:''}
 <div class="ed127-options">
 <section class="ed127-option"><div class="ed127-icon">✧</div><h3>Surprise me</h3><p>Generate a new random seed. You can share it afterward.</p><button class="btn primary" data-ed127-start="random">Random run</button></section>
 <section class="ed127-option"><div class="ed127-icon">⌘</div><h3>Play a shared seed</h3><p>Enter a friend's seed or invent your own, up to 28 characters.</p><input type="text" id="ed127-seed-input" data-ed127-seed-input maxlength="28" placeholder="e.g. EMBER-DRAGON-7" autocomplete="off" autocapitalize="characters" spellcheck="false" value="${escapeHTML(recent)}" aria-label="Custom seed"><button class="btn dark" data-ed127-start="custom">Start seeded run</button><small class="ed127-error" role="status" aria-live="polite"></small></section>
 <section class="ed127-option ed127-daily"><div class="ed127-icon">☀</div><h3>Daily challenge · UTC</h3><p>Everyone on the same build gets today's seed: <strong>${today}</strong>.</p><code>${daily}</code><div class="ed127-daily-stats">On this device: ${stats.attempts} finished · ${stats.wins} wins${stats.best?' · Best Act '+stats.best.act+' / F'+stats.best.floor:''}</div><button class="btn primary" data-ed127-start="daily">Play today's challenge</button></section>
 </div><div class="ed127-notice"><strong>Local challenge rules</strong><p>No online leaderboards. Daily attempts are repeatable, with separate records in your Run Chronicle. A new challenge appears each UTC day; future rule changes use a new R number.</p></div></section></div>`;
}
function ed127Confirmation(){const pending=ed127PendingStart;return `<div class="overlay ed127-overlay"><section class="modal ed127-confirm" role="alertdialog" aria-modal="true"><h2>Start a new run?</h2><p>Your current climb is not finished. Starting <b>${escapeHTML(ed127ModeName(pending?.mode))}</b> will replace the active-run save; completed run history will remain.</p><div class="ed127-actions"><button class="btn ghost" data-ed127-cancel>Keep current run</button><button class="btn primary" data-ed127-confirm>Replace active run</button></div></section></div>`;}
function ed127StartRun(options){
 if(!options?.seed)return;
 ed127PendingStart={...options,seed:ed127NormalizeSeed(options.seed)};
 if(S&&!['victory','death'].includes(S.screen)){modal={type:'ed127Confirm'};render();return;}
 ed127ConfirmStart();
}
function ed127ConfirmStart(){if(!ed127PendingStart)return;modal=null;newGame();}
const ed127PriorModalHTML=modalHTML;
modalHTML=function(){if(modal?.type==='ed127Setup')return ed127ControlModal();if(modal?.type==='ed127Confirm')return ed127Confirmation();return ed127PriorModalHTML();};
const ed127PriorIntro=introScreen;
introScreen=function(){return ed127PriorIntro().replace('<button class="btn dark" data-action="how">','<button class="btn dark" data-ed127-open>☀ Daily / Seeded</button><button class="btn dark" data-action="how">');};
const ed127PriorBattle=battleScreen;
battleScreen=function(){let html=ed127PriorBattle();if(S?.ed127Seed)html=html.replace('<div class="combat-meta">',`<div class="combat-meta"><div class="ed127-battle-seed">${ed127CurrentSeedLine()}</div>`);return html;};
const ed127PriorRoute=routeScreen;
routeScreen=function(){let html=ed127PriorRoute();if(S?.ed127Seed)html=html.replace('<h3>Available rooms</h3>',`<div class="ed127-route-seed">${ed127CurrentSeedLine()}<button type="button" class="litebtn" data-ed127-copy="${escapeHTML(S.ed127Seed)}">Copy</button></div><h3>Available rooms</h3>`);return html;};
const ed127PriorEnd=endScreen;
endScreen=function(win){const html=ed127PriorEnd(win);if(!S?.ed127Seed)return html;return html.replace('<div class="ed125-end-actions">',`<div class="ed127-end-seed">${ed127CurrentSeedLine()} <button type="button" class="litebtn" data-ed127-replay-current>Replay this seed</button></div><div class="ed125-end-actions">`);};
const ed127PriorMenu=modalHTML;
modalHTML=function(){let html=ed127PriorMenu();if(modal?.type==='menu')return html.replace('</section></div>','<div class="ed127-menu-actions"><button class="btn dark" type="button" data-ed127-open>☀ Seed & Daily Challenge</button></div></section></div>');return html;};
function ed127Clipboard(text){
 if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(()=>showToast('Seed copied')).catch(()=>showToast('Copy the displayed seed manually'));}
 else{showToast('Select the seed text to copy it');}
}
document.addEventListener('click',function ed127Click(e){
 const el=e.target.closest('[data-ed127-open],[data-ed127-close],[data-ed127-start],[data-ed127-confirm],[data-ed127-cancel],[data-ed127-copy],[data-ed127-replay-current],[data-ed127-replay-record]');
 if(!el)return;e.preventDefault();e.stopImmediatePropagation();
 if(el.hasAttribute('data-ed127-open')){modal={type:'ed127Setup'};render();return;}
 if(el.hasAttribute('data-ed127-close')){modal=null;render();return;}
 if(el.hasAttribute('data-ed127-copy')){ed127Clipboard(el.dataset.ed127Copy);return;}
 if(el.hasAttribute('data-ed127-cancel')){ed127PendingStart=null;modal=null;render();return;}
 if(el.hasAttribute('data-ed127-confirm')){if(modal?.type==='ed127Confirm')ed127ConfirmStart();return;}
 if(el.hasAttribute('data-ed127-replay-current')){if(S?.ed127Seed)ed127StartRun({mode:'replay',seed:S.ed127Seed});return;}
 if(el.hasAttribute('data-ed127-replay-record')){
  const record=ed125ReadHistory().runs.find(r=>r.id===el.dataset.ed127ReplayRecord);
  if(record?.seed)ed127StartRun({mode:'replay',seed:record.seed});return;
 }
 if(el.hasAttribute('data-ed127-start')){
  if(modal?.type!=='ed127Setup')return;
  const mode=el.dataset.ed127Start;
  if(mode==='random'){ed127StartRun({mode,seed:ed127RandomSeed()});return;}
  if(mode==='daily'){const date=ed127DayUTC();ed127StartRun({mode,date,seed:ed127DailySeed(date)});return;}
  if(mode==='custom'){
   const input=document.querySelector('[data-ed127-seed-input]');const seed=ed127NormalizeSeed(input?.value);
   if(seed.length<3){const error=document.querySelector('.ed127-error');if(error)error.textContent='Use at least three letters or numbers.';return;}
   ed127StartRun({mode,seed});return;
  }
 }
},true);

// Refresh the initial screen after the replay UI wrappers are installed.
render();
