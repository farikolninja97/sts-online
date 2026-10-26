// Card display, text and basic cost helpers.
function spec(c){let d=CARDS[c.key];return c.up&&UP[c.key]?{...d,...UP[c.key]}:d}
function updatedText(c){return spec(c).desc}
function updatedCost(c){let d=spec(c);return c.tempFree?0:(d.cost<0?d.cost:d.cost+(d.type==='Attack'&&S?.screen==='battle'?(S.tangled||0):0))}
function cardText(c){return updatedText(c)}
function getCost(c){return updatedCost(c)}
function cardHTML(c,mode='hand'){
 let d=spec(c), cost=updatedCost(c), playable=mode!=='hand'||(S&&S.screen==='battle'&&!busy&&!d.unplayable&&(cost===-1||S.energy>=cost));
 let action=mode==='hand'?'play':mode==='reward'?'rewardcard':'inspectcard';
 const live=(mode==='hand'||mode==='combat-inspect')&&S?.screen==='battle'&&d.type==='Attack'?damagePreview(c,targetEnemy()):null;
 const liveLabel=live?` · ${live.perHit} damage${live.hits>1?' × '+live.hits:''} vs ${live.enemyName}`:'';
 const badge=live?`<div class="v109-damage" role="note" aria-label="${escapeHTML(live.accessible)}" title="${escapeHTML(live.accessible)}"><b>⚔ ${live.perHit}</b>${live.hits>1?`<em>×${live.hits}</em>`:''}<small>${live.random?'RANDOM':live.hpLoss!==live.total?`${live.hpLoss} HP`:'LIVE'}</small></div>`:'';
 return `<button class="card type-${d.type.toLowerCase()} ${c.up?'card-upgraded':''} ${!playable?'disabled':''} ${mode!=='hand'?'mini':''}" ${!playable&&mode!=='hand'?'disabled':''} data-playable="${playable}" data-${action}="${escapeHTML(c.uid)}" aria-label="${escapeHTML(d.name+(c.up?' upgraded':'')+', '+d.desc+liveLabel)}"><span class="cost">${d.unplayable?'—':cost===-1?'X':cost}</span><div class="card-title">${escapeHTML(d.name)}${c.up?'+':''}</div>${c.up?'<span class="upgrade-corner" aria-hidden="true">✦</span>':''}${mode==='hand'?`<span class="card-info-mark" data-card-info="${escapeHTML(c.uid)}" aria-hidden="true">i</span>`:''}<div class="art">${iconArt(d.icon)}${badge}</div><div class="card-type">${d.type}</div><div class="card-desc">${live?liveCardDescription(d.desc,live):escapeHTML(d.desc)}</div><div class="rarity">${d.rarity}</div></button>`;
}
