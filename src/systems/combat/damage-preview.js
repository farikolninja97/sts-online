// Target-aware attack and Block damage preview.
/* V1.09 — single-source, target-aware live card damage display.
  Damage is projected through the same dmgCard() routine as actual hits.
  HP totals are shown separately because Block is not a damage modifier.
  Does not change the battle mechanics or persisted save format. */
function damagePreview(c,e){
 if(!S||S.screen!=='battle'||!c||spec(c).type!=='Attack'||!e||e.hp<=0)return null;
 const d=spec(c),key=c.key;
 const chosen=targetEnemy(), selectedIsSentinel=chosen?.id===e.id && chosen?.key==='sentinel';
 let base=(d.dmg||0)+(c.bonus||0),hits=1,random=false,aoe=!!d.aoe;
 switch(key){
  case 'body':base=S.block||0;break;
  case 'perfect':base=6+(c.up?3:2)*[...S.draw,...S.hand,...S.discard,...S.exhaust].filter(x=>CARDS[x.key]?.name.includes('Strike')).length;break;
  case 'ashen':base=6+(c.up?4:3)*S.exhaust.length;break;
  case 'bully':base=4+(c.up?3:2)*(e.vulnerable||0);break;
  case 'pactsend':base=S.exhaust.length>=3?(d.dmg||18):0;aoe=true;break;
  case 'rampage':base=9+(c.bonus||0);break;
  case 'spite':hits=(S.turnHpLoss||0)>0?(c.up?3:2):1;break;
  case 'tear':hits=1+(S.lossCount||0);break;
  case 'thrash':base=(d.dmg||4)+(c.bonus||0);hits=2;break;
  case 'fiend':hits=Math.max(0,S.hand.length-1);break;
  case 'whirlwind':hits=Math.max(0,S.energy||0);aoe=true;break;
  case 'conflag':hits=c.up?5:4;aoe=true;break;
  case 'swordboom':hits=c.up?4:3;random=true;break;
  case 'stomp':case 'breakthrough':case 'howl':case 'thunder':aoe=true;break;
  case 'dismantle':hits=e.vulnerable>0?2:1;break;
  case 'twin':case 'fightme':hits=2;break;
 }
 // The engine applies Pain and self-inflicted HP loss before the attack.
 // Rupture thus changes the very attack that activated it.
 const pain=(S.hand||[]).filter(x=>x.key==='pain'&&x.uid!==c.uid).length;
 const selfLoss=({hemo:2,bloodwall:2,bloodlet:3,breakthrough:1,brand:1,offering:6})[key]||0;
 const expectedTriggers=(pain>0?pain:0)+(selfLoss?1:0);
 if(key==='spite'&&((S.turnHpLoss||0)>0||expectedTriggers>0))hits=c.up?3:2;
 if(key==='tear')hits=1+(S.lossCount||0)+expectedTriggers;
 const strength=(S.strength||0)+((S.powers?.rupture||0)*expectedTriggers);
 // An enemy's slow debuff increments once when a played card is aimed at it,
 // before damage is computed. Include this extra stack in the preview.
 const projectedEnemy=selectedIsSentinel?{...e,slow:(e.slow||0)+1}:e;
 // dmgCard's optional third argument is added in V1.09, default unchanged.
 const perHit=dmgCard(projectedEnemy,base,strength);
 const total=perHit*hits;
 const block=Math.max(0,e.block||0);
 const postBlock=Math.max(0,total-block);
 const hpLoss=Math.min(Math.max(0,e.hp||0),postBlock);
 const repeat=!!(S.oneTwo>0);
 const conditional=!!(S.powers?.inferno&&(pain+selfLoss)>0)||repeat||random;
 let accessible=`${d.name}${c.up?'+':''}: ${perHit} damage per hit`;
 if(hits!==1)accessible+=`, ${hits} hits, ${total} total attack damage`;
 accessible+=` against ${e.name}, ${hpLoss} HP after ${block} Block and current HP`;
 if(random)accessible+='; random enemy targets, damage only if this enemy is hit';
 if(repeat)accessible+='; One-Two Punch causes an extra play, which may change the final total';
 if(S.powers?.inferno&&(pain+selfLoss)>0)accessible+='; HP-loss Power may affect the target first';
 return {perHit,hits,total,postBlock,hpLoss,enemyName:e.name,enemyId:e.id,block,base,strength,random,aoe,repeat,conditional,accessible};
}
function liveCardDescription(desc,preview){
 if(!preview)return escapeHTML(desc);
 const raw=String(desc),piece=`<strong class="v109-live-figure">${preview.perHit}</strong>`;
 let safe=escapeHTML(raw);
 // Keep permanent card definitions unchanged; substitute only the first
 // actual attack number, not Block, Energy, self-damage, or power text.
 if(/\bDeal \d+ damage/i.test(raw))safe=safe.replace(/\b(Deal\s+)\d+(\s+damage)/i,(_,start,end)=>start+piece+end);
 else if(/\bDeal damage equal to your Block/i.test(raw))safe=safe.replace(/\bDeal damage equal to your Block/i,`Deal ${piece} damage (from Block)`);
 if(preview.hits>1 && !/\b(times|twice|hits)/i.test(raw))safe+=` <span class="v109-live-sub">(${preview.hits} hits)</span>`;
 return safe;
}
function damageBreakdownHTML(c){
 if(!S||S.screen!=='battle'||spec(c).type!=='Attack')return '';
 const enemies=alive(),selected=targetEnemy();
 const previews=enemies.map(e=>damagePreview(c,e)).filter(Boolean);
 const current=previews.find(p=>p.enemyId===selected?.id)||previews[0];
 if(!current)return '';
 const targets=previews.map(p=>`<button type="button" class="v109-foe-option ${p.enemyId===selected?.id?'active':''}" data-preview-target="${p.enemyId}" aria-pressed="${p.enemyId===selected?.id}"><span>${escapeHTML(p.enemyName)}</span><b>${p.perHit}${p.hits>1?' × '+p.hits:''}</b><small>${p.hpLoss} HP after Block</small></button>`).join('');
 const modifiers=[S.strength>0?`+${S.strength} Strength`:S.strength<0?`${S.strength} Strength`:'',S.weak>0?'Weak ×0.75':'',S.shrink?'Shrink ×0.7':'',selected?.vulnerable>0?`Vulnerable ×${S.powers?.cruelty?(S.crueltyBonus||1.75):1.5}`:'',selected?.key==='sentinel'?'Slow on play':''].filter(Boolean);
 return `<div class="v109-breakdown" aria-live="polite"><div class="v109-breakdown-head">LIVE DAMAGE · ${escapeHTML(current.enemyName)}</div><div class="v109-big-number">⚔ ${current.perHit}${current.hits>1?` <span>× ${current.hits}</span>`:''}</div><div class="v109-totals"><span><b>${current.total}</b> attack damage</span><span><b>${current.block}</b> enemy Block</span><span><b>${current.hpLoss}</b> HP damage</span></div>${modifiers.length?`<p class="v109-modifiers">${escapeHTML(modifiers.join(' · '))}</p>`:''}${previews.length>1?`<p class="small">Tap a foe to compare damage before playing:</p><div class="v109-targets">${targets}</div>`:''}${current.random?'<p class="note">Random hits are not guaranteed to strike the selected enemy.</p>':''}${current.conditional?'<p class="note">Other automatic effects or repeat plays can change the final total.</p>':''}</div>`;
}
