// Ember Descent V1.25 — Run Chronicle milestone.
// Persist run summaries independently from the live save; all content remains
// browser-local. No combat balance / AI changes are made by this module.
'use strict';
const ED125_HISTORY_KEY='ember_descent_run_chronicle_v1';
const ED125_HISTORY_LIMIT=100;
const ED125_BADGES=[
 {id:'first_steps',name:'First Steps',icon:'⚔',detail:'Finish at least one battle.',when:(r,a)=>r.battles>=1},
 {id:'road_worn',name:'Road Worn',icon:'⌖',detail:'Finish a run after traversing 10 rooms.',when:(r,a)=>r.floors>=10},
 {id:'elite_hunter',name:'Elite Hunter',icon:'♛',detail:'Defeat an Elite during a run.',when:(r,a)=>r.elites>=1},
 {id:'boss_breaker',name:'Boss Breaker',icon:'☠',detail:'Defeat a boss.',when:(r,a)=>r.bosses>=1},
 {id:'first_victory',name:'First Victory',icon:'★',detail:'Clear all three acts.',when:(r,a)=>r.outcome==='victory'},
 {id:'three_victories',name:'Seasoned Climber',icon:'♜',detail:'Win three complete runs.',when:(r,a)=>a.wins>=3},
 {id:'ten_runs',name:'Persistent',icon:'◈',detail:'Finish ten runs, wins or losses.',when:(r,a)=>a.total>=10},
 {id:'deck_smith',name:'Deck Smith',icon:'⚒',detail:'Finish a run with six upgraded cards.',when:(r,a)=>r.upgradedCards>=6},
 {id:'relic_keeper',name:'Relic Keeper',icon:'✧',detail:'Finish a run with eight relics.',when:(r,a)=>r.relics.length>=8},
 {id:'wanderer',name:'Wanderer',icon:'☾',detail:'Resolve five event choices in a run.',when:(r,a)=>r.eventCount>=5},
 {id:'pure_victory',name:'Clean Finish',icon:'☼',detail:'Win without any permanent Curse cards in the final deck.',when:(r,a)=>r.outcome==='victory'&&r.curses===0},
 {id:'ascended',name:'Ascended',icon:'♔',detail:'Win with A9+ enabled.',when:(r,a)=>r.outcome==='victory'&&r.asc9}
];
const ed125Number=(x)=>Number.isFinite(Number(x))?Math.max(0,Math.floor(Number(x))):0;
const ed125Time=()=>Date.now();
const ed125Date=ms=>{try{return new Date(ms).toLocaleString(undefined,{year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}catch(e){return 'Date unavailable'}};
const ed125Duration=ms=>{const n=Math.max(0,Number(ms)||0),s=Math.floor(n/1000);return s<60?`${s}s`:s<3600?`${Math.floor(s/60)}m ${s%60}s`:`${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m`};
function ed125ReadHistory(){
 try{
  const parsed=JSON.parse(localStorage.getItem(ED125_HISTORY_KEY)||'{}');
  if(parsed&&parsed.version===1&&Array.isArray(parsed.runs))return {version:1,runs:parsed.runs.filter(r=>r&&typeof r.id==='string').slice(0,ED125_HISTORY_LIMIT),badges:Array.isArray(parsed.badges)?parsed.badges.filter(x=>typeof x==='string'):[]};
 }catch(err){}
 return {version:1,runs:[],badges:[]};
}
function ed125WriteHistory(data){
 try{localStorage.setItem(ED125_HISTORY_KEY,JSON.stringify(data));return true;}catch(err){return false;}
}
function ed125MakeId(){return `run-${ed125Time().toString(36)}-${Math.floor(Math.random()*0x100000000).toString(36).padStart(6,'0')}`}
function ed125EnsureRun(){
 if(!S)return null;
 if(!S.ed125Run||typeof S.ed125Run!=='object'){
  S.ed125Run={id:ed125MakeId(),startedAt:ed125Time(),trackedFromStart:false,cardPlays:0,turns:0,damageDealt:0,damageTaken:0,damageBlocked:0,blockGained:0,relicsFound:0,elitesWon:0,bossesWon:0};
 }
 const r=S.ed125Run;
 if(typeof r.id!=='string'||!r.id)r.id=ed125MakeId();
 for(const k of ['cardPlays','turns','damageDealt','damageTaken','damageBlocked','blockGained','relicsFound','elitesWon','bossesWon'])r[k]=ed125Number(r[k]);
 if(!Number.isFinite(r.startedAt))r.startedAt=ed125Time();
 return r;
}
function ed125Snapshot(outcome){
 const m=ed125EnsureRun(),endedAt=ed125Time();
 const cards=(S.deck||[]).filter(c=>c&&CARDS[c.key]).map(c=>({key:c.key,up:!!c.up}));
 const relics=(S.relics||[]).filter(id=>typeof id==='string'&&RELICS[id]);
 const events=(S.ed124Journal||[]).filter(e=>e&&typeof e.title==='string').map(e=>({act:ed125Number(e.act),floor:ed125Number(e.floor),kind:String(e.kind||''),title:String(e.title).slice(0,100),description:String(e.description||'').slice(0,220)}));
 const rec={id:m.id,outcome,startedAt:m.startedAt,endedAt,elapsedMs:Math.max(0,endedAt-m.startedAt),act:ed125Number(S.act),floor:ed125Number(S.floor),
  floors:ed125Number(S.totalFloors),battles:ed125Number(S.clearCount),elites:ed125Number(m.elitesWon),bosses:ed125Number(m.bossesWon),
  gold:ed125Number(S.gold),hp:ed125Number(S.hp),maxHP:ed125Number(S.maxHP),asc9:!!S.asc9,cardPlays:m.cardPlays,turns:m.turns,
  damageDealt:m.damageDealt,damageTaken:m.damageTaken,damageBlocked:m.damageBlocked,blockGained:m.blockGained,trackedFromStart:!!m.trackedFromStart,
  relics,cards,potions:(S.potions||[]).filter(x=>ED_POTIONS[x]),ancients:(S.ancientHistory||[]).map(x=>JSON.parse(JSON.stringify(x))),
  events,eventCount:events.filter(e=>e.kind==='event').length,upgradedCards:cards.filter(c=>c.up).length,
  curses:cards.filter(c=>CARDS[c.key]?.type==='Curse').length,version:VERSION};
 return rec;
}
function ed125Aggregate(runs){
 const wins=runs.filter(r=>r.outcome==='victory').length;
 const losses=runs.filter(r=>r.outcome==='death').length;
 const best=[...runs].sort((a,b)=>ed125Number(b.act)-ed125Number(a.act)||ed125Number(b.floor)-ed125Number(a.floor)||ed125Number(b.floors)-ed125Number(a.floors))[0];
 return {total:runs.length,wins,losses,rate:runs.length?Math.round(wins/runs.length*100):0,best,battles:runs.reduce((t,r)=>t+ed125Number(r.battles),0),floors:runs.reduce((t,r)=>t+ed125Number(r.floors),0)};
}
function ed125Archive(){
 if(!S||!['victory','death'].includes(S.screen))return null;
 if(S.ed125Archived)return ed125ReadHistory().runs.find(r=>r.id===S.ed125Run?.id)||null;
 const m=ed125EnsureRun();
 const history=ed125ReadHistory();
 const existing=history.runs.find(r=>r.id===m.id);
 if(existing){S.ed125Archived=true;return existing;}
 const r=ed125Snapshot(S.screen);
 history.runs.unshift(r);
 history.runs=history.runs.slice(0,ED125_HISTORY_LIMIT);
 const aggregate=ed125Aggregate(history.runs);
 const earned=ED125_BADGES.filter(b=>!history.badges.includes(b.id)&&b.when(r,aggregate)).map(b=>b.id);
 history.badges.push(...earned);
 if(!ed125WriteHistory(history))return null;
 S.ed125Archived=true;
 S.ed125RecentBadges=earned;
 return r;
}
// Only one save key for the live run; another key for historical results. This
// wrapper captures victory and death even when game logic saves before render.
const ed125PriorSave=save;
save=function(){if(S){ed125EnsureRun();if(S.screen==='victory'||S.screen==='death')ed125Archive()}return ed125PriorSave();};
const ed125PriorNewGame=newGame;
newGame=function(){ed125PriorNewGame();if(S){S.ed125Run={id:ed125MakeId(),startedAt:ed125Time(),trackedFromStart:true,cardPlays:0,turns:0,damageDealt:0,damageTaken:0,damageBlocked:0,blockGained:0,relicsFound:0,elitesWon:0,bossesWon:0};S.ed125Archived=false;S.ed125RecentBadges=[];save();render();}};
// Counters attach to existing final game hooks. They do not affect damage,
// targeting, card exhaustion, loot, turn sequencing, or reward resolution.
const ed125PriorHurtEnemy=hurtEnemy;
hurtEnemy=function(enemy,amount,attack=true){const n=ed125PriorHurtEnemy(enemy,amount,attack);if(S?.screen==='battle'&&n>0)ed125EnsureRun().damageDealt+=n;return n;};
const ed125PriorReceiveDamage=receiveDamage;
receiveDamage=function(n,opts={}){const result=ed125PriorReceiveDamage(n,opts);if(S&&result){const stats=ed125EnsureRun();stats.damageTaken+=ed125Number(result.actual);stats.damageBlocked+=ed125Number(result.blocked);}return result;};
const ed125PriorGainBlock=gainBlock;
gainBlock=function(...args){const result=ed125PriorGainBlock(...args);if(S?.screen==='battle'&&Number(result)>0)ed125EnsureRun().blockGained+=ed125Number(result);return result;};
const ed125PriorApplyCard=applyCard;
applyCard=function(card,...args){const before=S?.cardsPlayed||0,valid=S?.screen==='battle'&&card;const ret=ed125PriorApplyCard(card,...args);if(valid&&S?.cardsPlayed>before){ed125EnsureRun().cardPlays++;}return ret;};
const ed125PriorEndTurn=endTurn;
endTurn=function(...args){if(S?.screen==='battle'&&!busy)ed125EnsureRun().turns++;return ed125PriorEndTurn(...args);};
const ed125PriorGainRelic=gainRelic;
gainRelic=function(...args){const result=ed125PriorGainRelic(...args);if(result&&S)ed125EnsureRun().relicsFound++;return result;};
const ed125PriorCheckEndBattle=checkEndBattle;
checkEndBattle=function(...args){const wasBattle=S?.screen==='battle';const priorClear=S?.clearCount||0,room=S?.room;const result=ed125PriorCheckEndBattle(...args);if(wasBattle&&S?.screen==='reward'&&S.clearCount>priorClear){const m=ed125EnsureRun();if(room==='Elite')m.elitesWon++;if(room==='Boss')m.bossesWon++;}return result;};
function ed125OutcomeLabel(r){return r.outcome==='victory'?'Victory':'Defeat';}
function ed125CardName(card){const d=CARDS[card.key];return `${escapeHTML(d?.name||card.key)}${card.up?'+':''}`}
function ed125StatsStrip(r){return `<div class="ed125-stats-strip"><span>⌖ ${ed125Number(r.floors)} floors</span><span>⚔ ${ed125Number(r.battles)} battles</span><span>▣ ${r.cards?.length||0} cards</span><span>✧ ${r.relics?.length||0} relics</span></div>`;}
function ed125Overview(){const history=ed125ReadHistory(),agg=ed125Aggregate(history.runs);
 const rows=history.runs.slice(0,50).map(r=>`<button type="button" class="ed125-record" data-ed125-record="${escapeHTML(r.id)}" aria-label="Open ${ed125OutcomeLabel(r)} from ${ed125Date(r.endedAt)}"><span class="ed125-record-icon ${r.outcome==='victory'?'won':'lost'}">${r.outcome==='victory'?'★':'☠'}</span><span class="ed125-record-body"><b>${ed125OutcomeLabel(r)} · Act ${r.act} Floor ${r.floor}</b><small>${escapeHTML(ed125Date(r.endedAt))} · ${escapeHTML(ed125Duration(r.elapsedMs))}${r.asc9?' · A9+':''}</small></span><span aria-hidden="true">›</span></button>`).join('');
 const badges=ED125_BADGES.map(b=>`<div class="ed125-badge ${history.badges.includes(b.id)?'earned':'locked'}" title="${escapeHTML(b.detail)}"><span>${b.icon}</span><b>${escapeHTML(b.name)}</b><small>${escapeHTML(b.detail)}</small></div>`).join('');
 return `<div class="overlay ed125-overlay"><section class="modal ed125-modal" role="dialog" aria-modal="true" aria-label="Run Chronicle"><button class="litebtn close" data-ed125-close aria-label="Close Chronicle">✕</button>
 <p class="small">PERMANENT LOCAL RECORDS</p><h2>Run Chronicle</h2><p class="note">Completed runs stay in this browser when you start a new game. These are Ember Descent achievements, not official Slay the Spire 2 unlocks.</p>
 <div class="ed125-metrics"><div><b>${agg.total}</b><span>Runs</span></div><div><b>${agg.wins}</b><span>Victories</span></div><div><b>${agg.rate}%</b><span>Win rate</span></div><div><b>${agg.battles}</b><span>Battles won</span></div></div>
 <p class="ed125-best">${agg.best?`Highest climb: <b>Act ${agg.best.act} Floor ${agg.best.floor}</b> · `:''}Cleared floors across saved runs: <b>${agg.floors}</b>. The latest ${ED125_HISTORY_LIMIT} completed runs are retained on this device.</p>
 <div class="ed125-archive-grid"><section><h3>Recent runs</h3><div class="ed125-record-list">${rows||'<p class="note">No completed runs yet. Finish a run to save its deck, relics, and statistics.</p>'}</div></section><section><h3>Achievements · ${history.badges.length}/${ED125_BADGES.length}</h3><div class="ed125-badge-grid">${badges}</div></section></div>
 <div class="ed125-bottom"><button class="btn ghost" data-ed125-reset-confirm ${!agg.total?'disabled':''}>Clear Chronicle…</button><button class="btn primary" data-ed125-close>Return to game</button></div></section></div>`;
}
function ed125RecordDetail(){const id=modal?.id,r=ed125ReadHistory().runs.find(x=>x.id===id);if(!r)return ed125Overview();
 const cards=(r.cards||[]).map(c=>`<div class="ed125-collection-item">${ed125CardName(c)}</div>`).join('');
 const relics=(r.relics||[]).map(id=>`<div class="ed125-collection-item">${escapeHTML(RELICS[id]?.icon||'✧')} ${escapeHTML(RELICS[id]?.name||id)}</div>`).join('');
 const journal=(r.events||[]).map(e=>`<p class="ed125-journal-entry"><b>${escapeHTML(e.title)}</b> · Act ${e.act} Floor ${e.floor}<span>${escapeHTML(e.description)}</span></p>`).join('');
 return `<div class="overlay ed125-overlay"><section class="modal ed125-modal" role="dialog" aria-modal="true" aria-label="Completed run details"><button class="litebtn close" data-ed125-close aria-label="Close Chronicle">✕</button><p class="small">${escapeHTML(ed125Date(r.endedAt))} · ${escapeHTML(r.version||'Earlier release')}</p><h2>${ed125OutcomeLabel(r)} · Act ${r.act} Floor ${r.floor}</h2>
 ${ed125StatsStrip(r)}<div class="ed125-metrics"><div><b>${r.hp}/${r.maxHP}</b><span>Final HP</span></div><div><b>${r.gold}</b><span>Gold</span></div><div><b>${r.upgradedCards}</b><span>Upgrades</span></div><div><b>${r.curses}</b><span>Curses</span></div></div>
 <p class="note">Run time: ${ed125Duration(r.elapsedMs)}${r.asc9?' · A9+ enabled':''}${r.trackedFromStart?'':'. Detailed combat stats began after this run started.'}</p>
 ${r.trackedFromStart?`<div class="ed125-stats-strip"><span>Cards played ${r.cardPlays}</span><span>Turns ended ${r.turns}</span><span>Damage dealt ${r.damageDealt}</span><span>HP lost ${r.damageTaken}</span><span>Block absorbed ${r.damageBlocked}</span></div>`:''}
 <div class="ed125-detail-grid"><section><h3>Final deck · ${(r.cards||[]).length}</h3><div class="ed125-collection">${cards||'—'}</div></section><section><h3>Relics · ${(r.relics||[]).length}</h3><div class="ed125-collection">${relics||'—'}</div></section></div>
 <h3>Event and treasure journal · ${(r.events||[]).length}</h3><div class="ed125-journal">${journal||'<p class="note">No event or treasure notes in this run.</p>'}</div>
 <div class="ed125-bottom"><button class="btn dark" data-ed125-back>← Back to Chronicle</button><button class="btn primary" data-ed125-close>Close</button></div></section></div>`;
}
function ed125Progress(){const m=ed125EnsureRun();return `<div class="overlay ed125-overlay"><section class="modal ed125-modal ed125-progress" role="dialog" aria-modal="true" aria-label="Current run progress"><button class="litebtn close" data-ed125-close>✕</button><p class="small">LIVE RUN</p><h2>Current climb</h2><div class="ed125-metrics"><div><b>${S.act}</b><span>Act</span></div><div><b>${S.clearCount}</b><span>Victories</span></div><div><b>${S.deck.length}</b><span>Cards</span></div><div><b>${S.relics?.length||0}</b><span>Relics</span></div></div><p class="note">Started ${escapeHTML(ed125Date(m.startedAt))}. ${m.trackedFromStart?'Combat statistics are tracked from the start of this run.':'This run started in an earlier version; combat statistics only cover actions since V1.25.'}</p><div class="ed125-stats-strip"><span>${m.cardPlays} cards played</span><span>${m.turns} turns ended</span><span>${m.damageDealt} damage dealt</span><span>${m.damageTaken} HP lost</span><span>${m.damageBlocked} blocked</span></div><div class="ed125-bottom"><button class="btn dark" data-ed125-history>View all runs</button><button class="btn primary" data-ed125-close>Continue run</button></div></section></div>`;}
function ed125ClearConfirm(){return `<div class="overlay ed125-overlay"><section class="modal ed125-modal ed125-confirm" role="alertdialog" aria-modal="true" aria-label="Confirm history deletion"><h2>Clear your Chronicle?</h2><p>All run records and earned achievements saved in this browser will be deleted. <b>Your current game save will NOT be deleted.</b></p><div class="ed125-bottom"><button class="btn ghost" data-ed125-back>Cancel</button><button class="btn red" data-ed125-clear>Clear records permanently</button></div></section></div>`;}
const ed125PriorModalHTML=modalHTML;
modalHTML=function(){
 if(modal?.type==='ed125Chronicle')return ed125Overview();
 if(modal?.type==='ed125Record')return ed125RecordDetail();
 if(modal?.type==='ed125Progress')return S?ed125Progress():ed125Overview();
 if(modal?.type==='ed125ClearConfirm')return ed125ClearConfirm();
 const html=ed125PriorModalHTML();
 if(modal?.type==='menu')return html.replace('</section></div>','<div class="ed125-menu-buttons"><button class="btn dark" data-ed125-progress>◈ Current Run</button><button class="btn dark" data-ed125-history>☷ Run Chronicle</button></div></section></div>');
 return html;
};
const ed125PriorIntroScreen=introScreen;
introScreen=function(){return ed125PriorIntroScreen().replace('<button class="btn dark" data-action="how">','<button class="btn dark" data-ed125-history>☷ Run Chronicle</button><button class="btn dark" data-action="how">');};
const ed125PriorEndScreen=endScreen;
endScreen=function(win){
 const record=ed125Archive();
 const recent=(S?.ed125RecentBadges||[]).map(id=>ED125_BADGES.find(b=>b.id===id)).filter(Boolean);
 const cards=(S?.deck||[]).filter(c=>CARDS[c.key]),upgrades=cards.filter(c=>c.up).length;
 const label=win?'VICTORY':'DEFEAT';
 const content=`<main class="page ed125-end"><section class="ed125-end-panel"><div class="small">THE RUN HAS ENDED</div><h1 class="hero-title ${win?'ed125-victory':'ed125-defeat'}">${label}</h1><p class="subhead">${win?'Three acts cleared. Your adventure is recorded.':'Your Ironclad fell, but the Chronicle keeps this climb.'}</p>
 <div class="ed125-metrics"><div><b>${S?.act||1}</b><span>Final act</span></div><div><b>${ed125Number(S?.totalFloors)}</b><span>Floors</span></div><div><b>${ed125Number(S?.clearCount)}</b><span>Battles</span></div><div><b>${cards.length}</b><span>Cards</span></div></div>
 <div class="ed125-end-details"><div>✧ <b>${S?.relics?.length||0}</b> relics</div><div>⚒ <b>${upgrades}</b> upgraded cards</div><div>✦ <b>${ed125Number(S?.gold)}</b> Gold</div></div>
 ${recent.length?`<div class="ed125-unlocked"><b>New achievements!</b><div>${recent.map(b=>`<span>${b.icon} ${escapeHTML(b.name)}</span>`).join('')}</div></div>`:''}
 ${!record?(S?.ed125Archived?'<p class="note">The previous record was cleared from the Chronicle.</p>':'<p class="note">Could not save the historical record. Check browser storage settings.</p>'):'<p class="note">Run summary saved locally in the Run Chronicle.</p>'}
 <div class="ed125-end-actions"><button class="btn primary" data-ed125-history>View Run Chronicle</button><button class="btn dark" data-action="restart">Start another run</button></div></section><div class="ed125-end-art">${sprite('hero')}</div></main>`;
 return content;
};
// Capture only our controls and leave existing click routing unchanged.
document.addEventListener('click',function ed125Click(event){
 const el=event.target.closest('[data-ed125-history],[data-ed125-record],[data-ed125-back],[data-ed125-close],[data-ed125-progress],[data-ed125-reset-confirm],[data-ed125-clear]');
 if(!el)return;
 event.preventDefault();event.stopImmediatePropagation();
 if(el.hasAttribute('data-ed125-close')){modal=null;render();return;}
 if(el.hasAttribute('data-ed125-record')){modal={type:'ed125Record',id:el.dataset.ed125Record};render();return;}
 if(el.hasAttribute('data-ed125-clear')){ed125WriteHistory({version:1,runs:[],badges:[]});modal={type:'ed125Chronicle'};render();return;}
 if(el.hasAttribute('data-ed125-reset-confirm')){modal={type:'ed125ClearConfirm'};render();return;}
 if(el.hasAttribute('data-ed125-progress')){modal={type:'ed125Progress'};render();return;}
 modal={type:'ed125Chronicle'};render();
},true);
// A V1.24 run loaded earlier by the old startup flow becomes trackable without
// changing its original save key or overwriting previously collected loot.
if(S){ed125EnsureRun();if(['victory','death'].includes(S.screen))ed125Archive();save();}
render();
