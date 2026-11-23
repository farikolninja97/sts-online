/* Ember Descent V1.24 — original event encounters and claimable treasures.
 * This is original fan content, not a copy of official STS2 event definitions.
 * All event and chest rewards are committed once, on confirmed user action.
 */
'use strict';
const ED124_EVENTS=Object.freeze({
 cinder_altar:{name:'The Cinder Altar',icon:'♨',text:'An extinguished altar offers three uneasy bargains.',choices:[
  {id:'blood_gold',icon:'♥',name:'Blood offering',detail:'Lose 6 HP. Gain 80 Gold.',hp:6},
  {id:'random_smith',icon:'⚒',name:'Quiet blessing',detail:'Upgrade one randomly selected eligible card.',needs:'upgrade'},
  {id:'leave',icon:'☾',name:'Leave the altar',detail:'Walk away unharmed.'}]},
 fractured_mirror:{name:'The Fractured Mirror',icon:'◇',text:'Your reflection offers to keep what you discard—or duplicate what you cherish.',choices:[
  {id:'mirror_copy',icon:'❖',name:'Duplicate a card',detail:'Lose 8 HP. Choose a permanent card to copy.',hp:8,needs:'deck'},
  {id:'mirror_erase',icon:'✂',name:'Erase a reflection',detail:'Pay 35 Gold. Choose a removable card to delete.',gold:35,needs:'remove'},
  {id:'leave',icon:'☾',name:'Shatter the illusion',detail:'Leave with your deck unchanged.'}]},
 abandoned_armory:{name:'Abandoned Armory',icon:'⚒',text:'An old forge still holds a few useful weapons, and one very old relic.',choices:[
  {id:'armory_relic',icon:'✧',name:'Reach into the forge',detail:'Lose 10 HP. Receive one unowned relic.',hp:10,needs:'relic'},
  {id:'armory_smith',icon:'⚔',name:'Temper a weapon',detail:'Lose 5 HP. Choose an Attack to upgrade.',hp:5,needs:'attack'},
  {id:'leave',icon:'☾',name:'Leave',detail:'Keep your strength for the road.'}]},
 lantern_stall:{name:'The Lantern Stall',icon:'⚗',text:'A traveling alchemist left a crate of glowing bottles and rare paper.',choices:[
  {id:'stall_potion',icon:'🧪',name:'Take a forgotten potion',detail:'Gain one random potion if you have room.',needs:'potion'},
  {id:'stall_rare',icon:'▣',name:'Buy a rare manuscript',detail:'Pay 65 Gold. Add a random Rare card.',gold:65,needs:'rare'},
  {id:'leave',icon:'☾',name:'Leave the stall',detail:'No exchange.'}]},
 withered_grove:{name:'The Withered Grove',icon:'🌿',text:'Pale leaves curl around a spring that seems to understand pain.',choices:[
  {id:'grove_rest',icon:'♥',name:'Purifying water',detail:'Pay 30 Gold. Restore up to 25 HP.',gold:30,needs:'injured'},
  {id:'grove_curse',icon:'☽',name:'Drink the dark water',detail:'Restore up to 35 HP. Add a random Curse to your deck.',needs:'injured'},
  {id:'leave',icon:'☾',name:'Keep walking',detail:'Preserve your deck and Gold.'}]},
 shattered_vault:{name:'The Shattered Vault',icon:'✦',text:'Beyond the broken lock you can reach a coin purse—or a guarded relic.',choices:[
  {id:'vault_gold',icon:'✦',name:'Snatch the coins',detail:'Lose 10 HP. Gain 90 Gold.',hp:10},
  {id:'vault_relic',icon:'♜',name:'Buy the guardian’s prize',detail:'Pay 65 Gold. Receive one unowned relic.',gold:65,needs:'relic'},
  {id:'leave',icon:'☾',name:'Step away',detail:'Leave the vault sealed.'}]},
 runic_workshop:{name:'Runic Workshop',icon:'⬡',text:'A patient artificer offers to repair either your equipment or your spirit.',choices:[
  {id:'workshop_upgrade',icon:'⚒',name:'Etch a rune',detail:'Lose 4 HP. Choose any eligible card to upgrade.',hp:4,needs:'upgrade'},
  {id:'workshop_purge',icon:'☀',name:'Lift a curse',detail:'Remove one removable Curse. Restore up to 10 HP.',needs:'curse'},
  {id:'leave',icon:'☾',name:'Refuse the work',detail:'Leave the workshop.'}]},
 forgotten_archive:{name:'Forgotten Archive',icon:'▤',text:'There is just enough light to read one dangerous page.',choices:[
  {id:'archive_rare',icon:'📜',name:'Study forbidden text',detail:'Gain a random Rare card and a random Curse.',needs:'rare'},
  {id:'archive_remove',icon:'✂',name:'Burn a page',detail:'Pay 25 Gold. Choose a removable card to delete.',gold:25,needs:'remove'},
  {id:'leave',icon:'☾',name:'Close the book',detail:'Leave the archive.'}]},
 silent_shrine:{name:'The Silent Shrine',icon:'☼',text:'A cracked stone figure asks for a lasting sacrifice.',choices:[
  {id:'shrine_hp',icon:'♥',name:'Blessing of vitality',detail:'Pay 60 Gold. Gain 6 Max HP and heal 6 HP.',gold:60},
  {id:'shrine_relic',icon:'✧',name:'Offer vitality',detail:'Lose 5 Max HP. Receive one unowned relic.',maxhp:5,needs:'relic'},
  {id:'leave',icon:'☾',name:'Bow and depart',detail:'Leave your strength unchanged.'}]}
});
const ED124_SELECT_ACTIONS={mirror_copy:'copy',mirror_erase:'remove',armory_smith:'attack',workshop_upgrade:'upgrade',workshop_purge:'curse',archive_remove:'remove'};
const ED124_CURSES=['regret','doubt','shame','pain','decay'];
function ed124Removable(c){return !!c&&!!CARDS[c.key]&&!CARDS[c.key].eternal&&c.key!=='greed'}
function ed124UnownedRelic(){return typeof RELIC_POOL!=='undefined'&&RELIC_POOL.some(id=>RELICS[id]&&!ownsRelic(id))}
function ed124DeckCandidates(type){
 const deck=S?.deck||[];
 switch(type){
  case 'upgrade':return deck.filter(c=>!c.up&&UP[c.key]);
  case 'attack':return deck.filter(c=>!c.up&&UP[c.key]&&CARDS[c.key]?.type==='Attack');
  case 'remove':return deck.filter(ed124Removable);
  case 'curse':return deck.filter(c=>CARDS[c.key]?.type==='Curse'&&ed124Removable(c));
  case 'copy':return deck.filter(c=>CARDS[c.key]);
  default:return [];
 }
}
function ed124CanPick(choice){
 if(!S||!choice)return false;
 if(choice.gold&&(S.gold||0)<choice.gold)return false;
 if(choice.hp&&(S.hp||0)<=choice.hp)return false;
 if(choice.maxhp&&(S.maxHP||0)<=choice.maxhp+1)return false;
 if(choice.needs==='deck'&&!(S.deck||[]).length)return false;
 if(['attack','upgrade','remove','curse'].includes(choice.needs)&&!ed124DeckCandidates(choice.needs).length)return false;
 if(choice.needs==='relic'&&!ed124UnownedRelic())return false;
 if(choice.needs==='rare'&&!SOLO_POOL.some(k=>CARDS[k]?.rarity==='Rare'))return false;
 if(choice.needs==='injured'&&S.hp>=S.maxHP)return false;
 if(choice.needs==='potion'){edEnsurePotions();if(S.potions.length>=S.potionSlots)return false;}
 return true;
}
function ed124SelectEvent(){
 S.ed124EventHistory??=[];
 const recent=S.ed124EventHistory.slice(-2).map(x=>x.key);
 const eligible=Object.keys(ED124_EVENTS).filter(k=>!recent.includes(k));
 const key=choice(eligible.length?eligible:Object.keys(ED124_EVENTS));
 S.ed124EventHistory.push({act:S.act,floor:S.floor,key});
 return {key,completed:false,choice:null,result:''};
}
function ed124EnsureEvent(){
 if(S?.screen!=='event')return null;
 if(!S.ed124Event||!ED124_EVENTS[S.ed124Event.key]){S.ed124Event=ed124SelectEvent();save();}
 return S.ed124Event;
}
function ed124Remember(kind,title,description){
 S.ed124Journal??=[];
 S.ed124Journal.push({act:S.act,floor:S.floor,kind,title,description});
 if(S.ed124Journal.length>80)S.ed124Journal.splice(0,S.ed124Journal.length-80);
}
function ed124PickRelic(){const id=relicRoll();if(id){gainRelic(id);return `Received ${RELICS[id].name}.`;}return 'No unowned relics remain.';}
function ed124PickRare(){const pool=SOLO_POOL.filter(k=>CARDS[k]?.rarity==='Rare');if(!pool.length)return 'No eligible Rare cards.';const c=newCard(choice(pool));S.deck.push(c);return `Added ${CARDS[c.key].name} to your permanent deck.`;}
function ed124ApplyEventAction(id,selectedUid){
 let text='';const card=selectedUid?S.deck.find(c=>c.uid===selectedUid):null;
 switch(id){
  case 'blood_gold':S.hp-=6;S.gold+=80;text='Lost 6 HP and gained 80 Gold.';break;
  case 'random_smith':{const c=choice(ed124DeckCandidates('upgrade'));if(!c)return null;c.up=true;text=`Upgraded ${CARDS[c.key].name}.`;break;}
  case 'mirror_copy':{if(!card)return null;S.hp-=8;const copy=newCard(card.key);copy.up=!!card.up;S.deck.push(copy);text=`Lost 8 HP and duplicated ${CARDS[card.key].name}${copy.up?'+':''}.`;break;}
  case 'mirror_erase':case 'archive_remove':{if(!card||!ed124Removable(card))return null;const cost=id==='mirror_erase'?35:25;S.gold-=cost;S.deck.splice(S.deck.indexOf(card),1);text=`Paid ${cost} Gold and removed ${CARDS[card.key].name}.`;break;}
  case 'armory_relic':S.hp-=10;text=`Lost 10 HP. ${ed124PickRelic()}`;break;
  case 'armory_smith':{if(!card||!UP[card.key]||card.up||CARDS[card.key]?.type!=='Attack')return null;S.hp-=5;card.up=true;text=`Lost 5 HP and upgraded ${CARDS[card.key].name}.`;break;}
  case 'stall_potion':{const potion=edOfferPotion();if(!potion||!edGivePotion(potion))return null;text=`Collected ${ED_POTIONS[potion].name}.`;break;}
  case 'stall_rare':S.gold-=65;text=`Paid 65 Gold. ${ed124PickRare()}`;break;
  case 'grove_rest':{S.gold-=30;const restored=Math.min(25,S.maxHP-S.hp);S.hp+=restored;text=`Paid 30 Gold and restored ${restored} HP.`;break;}
  case 'grove_curse':{const restored=Math.min(35,S.maxHP-S.hp);S.hp+=restored;const curse=newCard(choice(ED124_CURSES));S.deck.push(curse);text=`Restored ${restored} HP and added ${CARDS[curse.key].name} to your deck.`;break;}
  case 'vault_gold':S.hp-=10;S.gold+=90;text='Lost 10 HP and gained 90 Gold.';break;
  case 'vault_relic':S.gold-=65;text=`Paid 65 Gold. ${ed124PickRelic()}`;break;
  case 'workshop_upgrade':{if(!card||card.up||!UP[card.key])return null;S.hp-=4;card.up=true;text=`Lost 4 HP and upgraded ${CARDS[card.key].name}.`;break;}
  case 'workshop_purge':{if(!card||CARDS[card.key]?.type!=='Curse'||!ed124Removable(card))return null;S.deck.splice(S.deck.indexOf(card),1);const healed=Math.min(10,S.maxHP-S.hp);S.hp+=healed;text=`Removed ${CARDS[card.key].name} and restored ${healed} HP.`;break;}
  case 'archive_rare':{text=ed124PickRare();const curse=newCard(choice(ED124_CURSES));S.deck.push(curse);text+=` Also acquired ${CARDS[curse.key].name}.`;break;}
  case 'shrine_hp':S.gold-=60;S.maxHP+=6;S.hp+=6;text='Paid 60 Gold. Gained 6 Max HP and restored 6 HP.';break;
  case 'shrine_relic':S.maxHP-=5;S.hp=Math.min(S.hp,S.maxHP);text=`Lost 5 Max HP. ${ed124PickRelic()}`;break;
  case 'leave':text='Left without taking a bargain.';break;
  default:return null;
 }
 S.hp=Math.max(0,Math.min(S.hp,S.maxHP));
 return text;
}
function ed124ResolveEvent(optionId,selectedUid){
 const ev=ed124EnsureEvent();if(!ev||ev.completed||S.screen!=='event')return false;
 const def=ED124_EVENTS[ev.key];const opt=def.choices.find(c=>c.id===optionId);
 if(!ed124CanPick(opt))return false;
 const mode=ED124_SELECT_ACTIONS[optionId];
 if(mode&&!selectedUid){modal={type:'ed124SelectCard',optionId};render();return false;}
 if(mode&&!ed124DeckCandidates(mode).some(c=>c.uid===selectedUid))return false;
 // Commit once before rendering and before any further click can run.
 ev.completed=true;ev.choice=optionId;
 const result=ed124ApplyEventAction(optionId,selectedUid);
 if(result==null){ev.completed=false;ev.choice=null;return false;}
 ev.result=result;modal=null;
 ed124Remember('event',def.name,`${opt.name}: ${result}`);
 if(S.hp<=0){S.screen='death';}
 save();render();return true;
}
const ed124PriorChooseNode=chooseNode;
chooseNode=function(id){
 if(!S||S.screen!=='route'||!openNodes().some(n=>n.id===id))return;
 const n=nodeById(id);
 if(n?.type==='treasure'){
  // The old branch granted a relic before showing the chest. New treasure
  // rooms never enter that path, allowing exactly one explicit reward claim.
  S.mapPos=id;S.floor=n.r+2;S.visitedMap??=[];S.visitedMap.push({act:S.act,id});
  S.room='treasure';S.screen='treasure';S.treasureRelic=null;
  S.ed124Treasure={relicId:relicRoll(),completed:false,choice:null,result:''};
  modal=null;save();render();return;
 }
 if(n?.type==='event')S.ed124Event=null;
 ed124PriorChooseNode(id);
 if(n?.type==='event'){ed124EnsureEvent();save();render();}
};
const ed124PriorNewGame=newGame;
newGame=function(){ed124PriorNewGame();if(S){S.ed124Event=null;S.ed124Treasure=null;S.ed124EventHistory=[];S.ed124Journal=[];save();render()}};
const ed124PriorMoveToNext=moveToNext;
moveToNext=function(){if(S?.screen==='event'&&!S.ed124Event?.completed)return;
 if(S?.screen==='treasure'&&!S.ed124Treasure?.completed)return;
 if(S){if(S.screen==='event')S.ed124Event=null;if(S.screen==='treasure')S.ed124Treasure=null;}
 return ed124PriorMoveToNext();
};
const ed124PriorEventScreen=eventScreen;
eventScreen=function(){const ev=ed124EnsureEvent();if(!ev)return ed124PriorEventScreen();
 const def=ED124_EVENTS[ev.key];
 const available=def.choices.map(c=>({...c,enabled:ed124CanPick(c)}));
 return `<main class="page screenpad ed124-page"><section class="innerpanel ed124-panel">
 <div class="small">UNKNOWN ROOM · ACT ${S.act} · FLOOR ${S.floor}</div><div class="ed124-glyph" aria-hidden="true">${def.icon}</div><h1 class="sectiontitle">${escapeHTML(def.name)}</h1>
 <p class="subhead">${escapeHTML(def.text)}</p><div class="ed124-resources"><span>♥ ${S.hp}/${S.maxHP}</span><span>✦ ${S.gold}</span><span>▣ ${S.deck.length} cards</span></div>
 ${ev.completed?`<section class="ed124-result" role="status"><div class="small">BARGAIN RESOLVED</div><p>${escapeHTML(ev.result)}</p></section><button type="button" class="btn primary ed124-continue" data-ed124-continue>Continue to the map →</button>`:
 `<div class="ed124-options">${available.map(c=>`<button type="button" class="ed124-choice" data-ed124-event="${c.id}" ${c.enabled?'':'disabled'}><span class="ed124-choice-icon">${c.icon}</span><span><b>${escapeHTML(c.name)}</b><small>${escapeHTML(c.detail)}</small></span><span class="ed124-chevron">${c.enabled?'›':'×'}</span></button>`).join('')}</div><p class="note">Choose one outcome. Ineligible choices are disabled. Your choice is permanent for this room.</p>`}
 </section></main>`;
};
function ed124EnsureTreasure(){
 if(S?.screen!=='treasure')return null;
 if(!S.ed124Treasure){
  // A V1.23 save already received a relic (or 75 Gold if the pool was exhausted).
  // Do not revoke its reward, or let it be claimed again.
  S.ed124Treasure={relicId:S.treasureRelic||null,completed:true,choice:'legacy',result:S.treasureRelic&&RELICS[S.treasureRelic]?`Previously received ${RELICS[S.treasureRelic].name}.`:'Previously collected the room reward.'};save();
 }
 return S.ed124Treasure;
}
const ed124PriorTreasureScreen=treasureScreen;
treasureScreen=function(){const chest=ed124EnsureTreasure();if(!chest)return ed124PriorTreasureScreen();
 const relic=chest.relicId&&RELICS[chest.relicId];edEnsurePotions();const potionSpace=S.potions.length<S.potionSlots;
 return `<main class="page screenpad ed124-page"><section class="innerpanel ed124-panel">
 <div class="small">TREASURE · ACT ${S.act} · FLOOR ${S.floor}</div><div class="ed124-glyph" aria-hidden="true">▣</div><h1 class="sectiontitle">The Unsealed Reliquary</h1>
 ${chest.completed?`<section class="ed124-result" role="status"><div class="small">TREASURE CLAIMED</div><p>${escapeHTML(chest.result)}</p></section><button class="btn primary ed124-continue" data-ed124-continue>Continue to the map →</button>`:
 `<p class="subhead">Choose one treasure. Once collected, the other rewards disappear.</p><div class="ed124-options">
 <button type="button" class="ed124-choice" data-ed124-treasure="relic" ${relic?'':'disabled'}><span class="ed124-choice-icon">${relic?.icon||'♜'}</span><span><b>${relic?escapeHTML(relic.name):'No relics remaining'}</b><small>${relic?escapeHTML(relic.description):'All available relics have been collected.'}</small></span><span class="ed124-chevron">›</span></button>
 <button type="button" class="ed124-choice" data-ed124-treasure="gold"><span class="ed124-choice-icon">✦</span><span><b>Gold reserve</b><small>Collect 75 Gold instead of the relic.</small></span><span class="ed124-chevron">›</span></button>
 <button type="button" class="ed124-choice" data-ed124-treasure="potion" ${potionSpace?'':'disabled'}><span class="ed124-choice-icon">🧪</span><span><b>Potion cache</b><small>Receive a random potion and 30 Gold. Requires an empty potion slot.</small></span><span class="ed124-chevron">›</span></button></div>`}
 </section></main>`;
};
function ed124ClaimTreasure(type){
 const chest=ed124EnsureTreasure();if(!chest||chest.completed||S.screen!=='treasure')return false;
 if(type==='relic'&&(!chest.relicId||ownsRelic(chest.relicId)))return false;
 if(type==='potion'){edEnsurePotions();if(S.potions.length>=S.potionSlots)return false;}
 if(!['relic','gold','potion'].includes(type))return false;
 chest.completed=true;chest.choice=type;
 if(type==='relic'){gainRelic(chest.relicId);chest.result=`Collected ${RELICS[chest.relicId].name}.`;}
 if(type==='gold'){S.gold+=75;chest.result='Collected 75 Gold.';}
 if(type==='potion'){
  const potion=edOfferPotion();
  if(!potion||!edGivePotion(potion)){chest.completed=false;chest.choice=null;return false;}
  S.gold+=30;chest.result=`Collected ${ED_POTIONS[potion].name} and 30 Gold.`;
 }
 ed124Remember('treasure','The Unsealed Reliquary',chest.result);
 save();render();return true;
}
const ed124PriorModalHTML=modalHTML;
modalHTML=function(){
 if(modal?.type==='ed124SelectCard'){
  if(S?.screen!=='event'||S.ed124Event?.completed)return '';
  const id=modal.optionId,mode=ED124_SELECT_ACTIONS[id],cards=ed124DeckCandidates(mode);
  const label=mode==='remove'||mode==='curse'?'Remove a card':mode==='copy'?'Duplicate a card':'Upgrade a card';
  return `<div class="overlay"><section class="modal ed124-card-modal" role="dialog" aria-modal="true" aria-label="${label}"><button type="button" class="litebtn close" data-ed124-cancel aria-label="Cancel">✕</button><h2>${label}</h2><p class="note">Choose one card to confirm the event outcome. No cost is paid before you select a card.</p><div class="ed124-card-list">${cards.map(c=>{let d=spec(c);return `<button type="button" data-ed124-card="${escapeHTML(c.uid)}" class="ed124-card-option"><span class="ed124-card-art">${iconArt(d.icon)}</span><span><b>${escapeHTML(d.name)}${c.up?'+':''}</b><small>${escapeHTML(d.desc||'')}</small></span><span>›</span></button>`}).join('')||'<p class="note">No eligible cards.</p>'}</div><button class="btn ghost" data-ed124-cancel>Back to event</button></section></div>`;
 }
 if(modal?.type==='ed124Journal'){
  const rows=[...(S?.ed124Journal||[])].reverse();
  return `<div class="overlay"><section class="modal ed124-card-modal" role="dialog" aria-modal="true" aria-label="Run journal"><button type="button" class="litebtn close" data-ed124-cancel aria-label="Close">✕</button><h2>Run Journal</h2><p class="note">Your event choices and claimed treasure during this run. Saved locally with your current run.</p><div class="ed124-journal-list">${rows.map(x=>`<div class="ed124-journal-entry"><small>ACT ${x.act} · FLOOR ${x.floor} · ${escapeHTML(x.kind.toUpperCase())}</small><b>${escapeHTML(x.title)}</b><span>${escapeHTML(x.description)}</span></div>`).join('')||'<p class="note">No event or treasure entries yet.</p>'}</div><button class="btn ghost" data-ed124-cancel>Close Journal</button></section></div>`;
 }
 const html=ed124PriorModalHTML();
 if(modal?.type==='menu')return html.replace('</section></div>','<button type="button" class="btn dark ed124-journal-open" data-ed124-journal>☷ View Run Journal</button></section></div>');
 return html;
};
document.addEventListener('click',function ed124Click(e){
 const event=e.target.closest('[data-ed124-event]'),treasure=e.target.closest('[data-ed124-treasure]'),card=e.target.closest('[data-ed124-card]'),continueButton=e.target.closest('[data-ed124-continue]'),cancel=e.target.closest('[data-ed124-cancel]'),journal=e.target.closest('[data-ed124-journal]');
 if(!(event||treasure||card||continueButton||cancel||journal))return;
 e.preventDefault();e.stopImmediatePropagation();
 if(event){if(S?.screen==='event')ed124ResolveEvent(event.dataset.ed124Event);return;}
 if(treasure){if(S?.screen==='treasure')ed124ClaimTreasure(treasure.dataset.ed124Treasure);return;}
 if(card){if(modal?.type==='ed124SelectCard'&&S?.screen==='event')ed124ResolveEvent(modal.optionId,card.dataset.ed124Card);return;}
 if(continueButton){if((S?.screen==='event'&&S.ed124Event?.completed)||(S?.screen==='treasure'&&S.ed124Treasure?.completed))moveToNext();return;}
 if(cancel){modal=null;render();return;}
 if(journal){modal={type:'ed124Journal'};render();return;}
},true);
// Important: no rerolls on reload, no re-awards of existing chest rewards.
if(S?.screen==='event'){ed124EnsureEvent();save();render();}
if(S?.screen==='treasure'){ed124EnsureTreasure();save();render();}
