// Reference/help panel, load/save migration and first render.
// A glossary accessible during combat, documenting supported afflictions.
const v105Act=act;act=function(action){if(action==='combatref'){modal={type:'combatref'};render();return}v105Act(action)};
const v105ModalHTML=modalHTML;modalHTML=function(){if(modal?.type==='combatref'){
 return `<div class="overlay"><section class="modal" role="dialog" aria-modal="true" aria-label="Combat reference"><button class="litebtn close" data-action="close">✕</button><h2>Combat rules · Main v0.107.1</h2><p class="note">Attack damage: (base + Strength), then Weak ×0.75, Vulnerable ×1.5; calculated per hit before Block. Enemy Block clears at the start of its own turn.</p><div class="pile-list">${Object.values(COMBAT_ONLY_CARDS).map(c=>`<div class="pile-entry"><span>✦</span><b>${escapeHTML(c.name)}</b><small>${escapeHTML(c.desc)}</small></div>`).join('')}</div><p class="note">These Statuses are combat-only. Curses persist in your deck. This reference is not a card reward pool.</p><button class="btn" data-action="close">Return to combat</button></section></div>`;
 }return v105ModalHTML()};
const v105BattleScreen=battleScreen;battleScreen=function(){return v105BattleScreen().replace('<div class="combat-meta">','<div class="combat-meta">').replace('<div class="hint">Choose a target, play a card, then end the turn</div>','<button class="litebtn combat-guide" data-action="combatref">Combat rules &amp; statuses</button>')};
// Original altar option exercises persistent Curse behavior in normal solo runs.
const v105EventScreen=eventScreen;
eventScreen=function(){return v105EventScreen().replace('<button class="choice" data-event="none">',
 '<button class="choice" data-event="curse"><span class="choiceicon">☽</span><span class="choicetitle">Cursed bargain</span><span class="choicedesc">Gain 120 gold. Receive a random permanent Curse.</span></button><button class="choice" data-event="none">')};
document.addEventListener('click',evt=>{
 const button=evt.target.closest('[data-event="curse"]');if(!button)return;
 evt.preventDefault();evt.stopImmediatePropagation();
 if(S?.screen!=='event')return;
 let c=newCard(choice(['regret','doubt','shame','pain','decay']));S.deck.push(c);S.gold+=120;
 showCardReveal(c,'Cursed bargain','Added to your permanent deck. Curse effects apply during future combats.','route');
},true);


 try{load()}catch(e){console.warn('Save unavailable',e)}
// A future release can migrate saves without changing the game engine.
if(S){if(S.deck?.some(c=>!CARDS[c.key]))S=null;else{S.visitedMap??=[];S.exhaustedThisTurn??=0;S.turnHpLoss??=0;S.lossCount??=0;S.dexterity??=0;S.plating??=0;S.oneTwo??=0;S.nextAttackFree??=false;if(!S.mapData)generateMap();S.routeOptions??=[];S.totalFloors??=0;if(S.screen==='battle'){S.enemies??=[];S.log??=[]}if(S.screen==='route'&&!S.routeOptions.length)generateRoute()}}
render();


