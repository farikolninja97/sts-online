// Reward/upgrade popups and card library.
/* V1.02: reveal events and iPhone touch-to-target combat. */
let chosenTargetCard=null, cardPointer=null, lastDragClickBlock=0, dragGhost=null, dragLine=null;
const normalRewardChoice=chooseReward;
function revealCardInfo(c){let d=spec(c);return {uid:c.uid,key:c.key,up:!!c.up,name:d.name,desc:d.desc,cost:d.cost,type:d.type}}
const oldMoveToNextV102=moveToNext;moveToNext=function(){S.rewardTaken=false;oldMoveToNextV102()};
function revealNext(){let next=modal?.next||'close';modal=null;if(next==='route'){moveToNext()}else{save();render()}}
function showCardReveal(cards,title,description,next='close',before=null){
 const valid=(Array.isArray(cards)?cards:[cards]).filter(Boolean).map(c=>({...c}));
 if(!valid.length){if(next==='route')moveToNext();else{save();render()}return}
 modal={type:'cardreveal',cards:valid,title,description,next,before:before?{...before}:null};save();render();
}
chooseReward=function(uid){const selected=S.offered.find(c=>c.uid===uid);if(!selected||S.screen!=='reward'||S.rewardTaken)return;S.rewardTaken=true;S.deck.push(selected);showCardReveal(selected,'Card acquired','Added permanently to your Ironclad deck.','route')}
applyUpgrade=function(uid){let c=S.deck.find(x=>x.uid===uid);if(!c||c.up||!UP[c.key])return;let before={...c};c.up=true;showCardReveal(c,'Card upgraded','Your card has been improved for the rest of this run.','route',before)}
const oldResolveChoice=resolveChoice;
resolveChoice=function(uid){let was=modal?.type,card=was==='upgradehand'?S.hand.find(c=>c.uid===uid):null;
 if(was==='upgradehand'&&card&&!card.up&&UP[card.key]){let before={...card};card.up=true;showCardReveal(card,'Card upgraded','Upgraded for this combat.','close',before);return}
 oldResolveChoice(uid)
}
const oldAct=act;
act=function(action){if(action==='revealnext'){revealNext();return}if(action==='catalog'){modal={type:'catalog'};render();return}oldAct(action)}
const oldModalHTML=modalHTML;
modalHTML=function(){
 if(modal?.type==='cardreveal'){
   let first=modal.cards[0];const before=modal.before;
   let art=modal.cards.map(c=>{let html=cardHTML(c,'reward');return html.replace(/\sdata-rewardcard="[^"]*"/g,'').replace(/\sdata-inspectcard="[^"]*"/g,'').replace(/<button /,'<div ').replace(/<\/button>/,'</div>')});
   if(before){let old=cardHTML(before,'reward').replace(/\sdata-rewardcard="[^"]*"/g,'').replace(/\sdata-inspectcard="[^"]*"/g,'').replace(/<button /,'<div ').replace(/<\/button>/,'</div>');art=[old,art[0]]}
   let html=before?`<div class="card-compare">${art[0]}<span class="reveal-arrow">➜</span>${art[1]}</div>`:`<div class="card-reveal-wrap">${art.join('')}</div>`;
   return `<div class="overlay"><section class="modal reveal-modal" role="dialog" aria-modal="true" aria-label="${escapeHTML(modal.title||'Card obtained')}"><div class="reveal-subtitle">${before?'THE FORGE':'YOUR COLLECTION'}</div><h2>${escapeHTML(modal.title)}</h2>${html}<p class="reveal-story">${escapeHTML(modal.description||'')}</p><button class="btn primary" data-action="revealnext">Continue →</button></section></div>`;
 }
 if(modal?.type==='catalog')return `<div class="overlay"><section class="modal" role="dialog" aria-modal="true"><button class="litebtn close" data-action="close" aria-label="Close">✕</button><h2>Ironclad card library</h2><p class="note">All ${SOLO_POOL.length} solo reward cards and 3 starting cards. The effects in this fan prototype may differ from the original game's exact timing.</p><div class="library-tools"><span>${SOLO_POOL.length+3} named card types</span><input data-catalog-search placeholder="Filter card names" aria-label="Filter card names"></div><div class="deck-catalog">${['strike','defend','bash',...SOLO_POOL].map(key=>{let d=CARDS[key];return `<div class="catalog-entry" data-catalog-entry="${escapeHTML(d.name.toLowerCase())}"><b>${escapeHTML(d.name)}</b><small>${escapeHTML(d.rarity)} · ${d.cost===-1?'X':d.cost} Energy · ${escapeHTML(d.type)}</small><small>${escapeHTML(d.desc)}</small></div>`}).join('')}</div><button class="btn ghost" data-action="close">Close</button></section></div>`;
 let output=oldModalHTML();if(modal?.type==='menu')output=output.replace('<button class="btn ghost" data-action="restart">','<button class="btn dark" data-action="catalog">View all 83 Ironclad card types</button><button class="btn ghost" data-action="restart">');return output;
}
