// Game buttons, card selections and map click actions.
function act(action){if(action==='map'&&S){modal={type:'map'};render();return}if(action==='new'||action==='restart'){newGame();return}if(action==='how'){modal={type:'how'};render();return}if(!S)return;
 if(action==='menu'||action==='deck'||action==='piles'){modal={type:action};render();return}
 if(action==='close'||action==='choicecancel'){modal=null;render();return}
 if(action==='end'){endTurn();return}
 if(action==='skipreward'||action==='leave'){moveToNext();return}
 if(action==='restheal'){S.hp=Math.min(S.maxHP,S.hp+Math.floor(S.maxHP*.3));moveToNext();return}
 if(action==='restupgrade'){modal={type:'smith'};render();return}
 if(action==='buyheal'){if(S.gold>=40&&S.hp<S.maxHP){S.gold-=40;S.hp=Math.min(S.maxHP,S.hp+18);save();render()}return}
}
function resolveChoice(uid){if(!modal)return;let ty=modal.type,arr=ty==='discardtop'?S.discard:S.hand,i=arr.findIndex(c=>c.uid===uid);if(i<0)return;
 if(ty==='discardtop')S.draw.unshift(S.discard.splice(i,1)[0]);
 else if(ty==='chooseExhaust'){let c=S.hand.splice(i,1)[0];exhaustCard(c);if(modal.afterDraw)drawCards(modal.afterDraw)}
 else if(ty==='upgradehand'&&UP[S.hand[i].key])S.hand[i].up=true;
 modal=null;save();render();}
// Dedicated interactive inputs for the new map and pile tabs.
document.addEventListener('click',e=>{let zm=e.target.closest('[data-mapzoom]');if(zm){mapFit=zm.dataset.mapzoom==='fit';render();return}let n=e.target.closest('[data-node]');if(n){chooseNode(n.dataset.node);return}let st=e.target.closest('.combat-status');if(st){showToast(st.getAttribute('title')||st.getAttribute('aria-label'));return}let p=e.target.closest('[data-pile]');if(p&&S?.screen==='battle'){modal={type:'piles',pile:p.dataset.pile};render();return}let m=e.target.closest('[data-modalpick]');if(m){resolveChoice(m.dataset.modalpick)} });
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target?.dataset?.node){e.preventDefault();chooseNode(e.target.dataset.node)}});
// Upgrade old local save without discarding the previous player's run.
if(S){S.visitedMap??=[];S.exhaustedThisTurn??=0;S.turnHpLoss??=0;S.lossCount??=0;S.dexterity??=0;S.plating??=0;S.temporaryStrength??=0;S.oneTwo??=0;S.nextAttackFree??=false;if(!S.mapData)generateMap();save();render()}


