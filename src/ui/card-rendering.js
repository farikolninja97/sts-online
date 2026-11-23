
// Card display, text and upgraded identity styling.
function spec(c){let d=CARDS[c.key];return c.up&&UP[c.key]?{...d,...UP[c.key]}:d}
function updatedText(c){return spec(c).desc}
function updatedCost(c){let d=spec(c);return c.tempFree?0:(d.cost<0?d.cost:d.cost+(d.type==='Attack'&&S?.screen==='battle'?(S.tangled||0):0))}
function cardText(c){return updatedText(c)}
function getCost(c){return updatedCost(c)}
function ed126Hash(str=''){let h=2166136261>>>0;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function ed126Unique(arr){return [...new Set(arr.filter(Boolean))]}
function ed126CardFamily(d,c){let t=(d.type||'').toLowerCase(),desc=(d.desc||'').toLowerCase(),name=(d.name||'').toLowerCase(),key=(c?.key||'').toLowerCase();
 if(/flame|inferno|molten|ashen|cinder|burn|fire|thunder/.test(name+' '+key+' '+desc))return 'fire';
 if(/lose \d+ hp|lose hp|blood|hemo|rupture|offering|crimson|brand/.test(desc+' '+name+' '+key))return 'blood';
 if(/exhaust/.test(desc)||/havoc|fiend|stoke|pact|grit|burning/.test(key))return 'exhaust';
 if(/vulnerable|weak|frail|mangle|taunt|tremble|uppercut|dominate|dismantle/.test(desc+' '+name+' '+key))return 'control';
 if(/strength|rage|demon|inflame|juggling|one-two|setup|fight me|stampede/.test(desc+' '+name+' '+key))return 'fury';
 if(/all enemies|random enemy| times|x times|whirlwind|boomerang|conflag|howl|stomp/.test(desc+' '+name+' '+key))return 'volley';
 if(/block|plating|barricade|impervious|armor|defend|shrug|second wind|colossus|flame barrier|armaments/.test(desc+' '+name+' '+key))return 'guard';
 if(t==='power')return 'power';
 if(t==='skill')return 'tactic';
 return 'assault';
}
function ed126CardTags(d,c){let desc=(d.desc||'').toLowerCase(),tags=[];
 if(d.type==='Attack')tags.push('Attack'); else if(d.type==='Skill')tags.push('Skill'); else if(d.type==='Power')tags.push('Power');
 if(/exhaust/.test(desc)||d.exhaust)tags.push('Exhaust');
 if(/draw/.test(desc))tags.push('Draw');
 if(/block/.test(desc))tags.push('Block');
 if(/strength/.test(desc))tags.push('Strength');
 if(/vulnerable/.test(desc))tags.push('Vulnerable');
 if(/weak/.test(desc))tags.push('Weak');
 if(/lose hp|lose \d+ hp/.test(desc))tags.push('Blood');
 if(/all enemies/.test(desc))tags.push('AOE');
 if(/random enemy|times/.test(desc)&&!/all enemies/.test(desc))tags.push('Multi');
 if(/energy/.test(desc)||d.cost===-1)tags.push('Energy');
 return ed126Unique(tags).slice(0,2);
}
function ed126CardVisual(c,d){
 const hash=ed126Hash((c?.key||d.name||'card')+(c?.up?'up':''));
 const family=ed126CardFamily(d,c);
 const tags=ed126CardTags(d,c);
 const families={
  assault:['⚔','ASSAULT',[12,32]], tactic:['⬡','TACTIC',[196,218]], power:['✦','POWER',[275,305]], guard:['🛡','GUARD',[200,165]],
  blood:['🩸','BLOOD',[355,12]], fire:['🔥','EMBER',[22,48]], control:['⛓','CONTROL',[320,350]], volley:['➶','VOLLEY',[150,200]],
  fury:['✹','FURY',[48,68]], exhaust:['♨','EXHAUST',[28,16]]
 };
 const base=families[family]||families.assault;
 const h1=(base[2][0]+(hash%11)-5+360)%360,h2=(base[2][1]+((hash>>5)%13)-6+360)%360;
 const angle=20+(hash%140),p1=8+hash%55,p2=25+((hash>>8)%50),glow=.18+((hash>>12)%14)/100;
 return {family,symbol:base[0],label:base[1],tags,style:`--ed-card-h1:${h1};--ed-card-h2:${h2};--ed-card-angle:${angle}deg;--ed-card-p1:${p1}%;--ed-card-p2:${p2}%;--ed-card-glow:${glow};`};
}
function cardHTML(c,mode='hand'){
 let d=spec(c), cost=updatedCost(c), playable=mode!=='hand'||(S&&S.screen==='battle'&&!busy&&!d.unplayable&&(cost===-1||S.energy>=cost));
 let action=mode==='hand'?'play':mode==='reward'?'rewardcard':'inspectcard';
 const live=(mode==='hand'||mode==='combat-inspect')&&S?.screen==='battle'&&d.type==='Attack'?damagePreview(c,targetEnemy()):null;
 const liveLabel=live?` · ${live.perHit} damage${live.hits>1?' × '+live.hits:''} vs ${live.enemyName}`:'';
 const badge=live?`<div class="v109-damage" role="note" aria-label="${escapeHTML(live.accessible)}" title="${escapeHTML(live.accessible)}"><b>⚔ ${live.perHit}</b>${live.hits>1?`<em>×${live.hits}</em>`:''}<small>${live.random?'RANDOM':live.hpLoss!==live.total?`${live.hpLoss} HP`:'LIVE'}</small></div>`:'';
 const vis=ed126CardVisual(c,d), rarity=(d.rarity||'Common').toLowerCase();
 const chips=vis.tags.map(t=>`<span class="ed126-card-chip">${escapeHTML(t)}</span>`).join('');
 return `<button class="card ed126-card type-${d.type.toLowerCase()} rarity-${rarity} family-${vis.family} ${c.up?'card-upgraded':''} ${!playable?'disabled':''} ${mode!=='hand'?'mini':''}" style="${vis.style}" ${!playable&&mode!=='hand'?'disabled':''} data-playable="${playable}" data-${action}="${escapeHTML(c.uid)}" aria-label="${escapeHTML(d.name+(c.up?' upgraded':'')+', '+d.desc+liveLabel)}"><span class="cost">${d.unplayable?'—':cost===-1?'X':cost}</span><div class="ed126-card-banner"><span class="ed126-card-affinity">${vis.symbol} ${vis.label}</span><span class="ed126-card-rarity">${escapeHTML(d.rarity)}</span></div><div class="card-title">${escapeHTML(d.name)}${c.up?'+':''}</div>${c.up?'<span class="upgrade-corner" aria-hidden="true">✦</span>':''}${mode==='hand'?`<span class="card-info-mark" data-card-info="${escapeHTML(c.uid)}" aria-hidden="true">i</span>`:''}<div class="art"><div class="ed126-art-back"></div><div class="ed126-sigil"><span>${vis.symbol}</span></div>${iconArt(d.icon)}${badge}</div><div class="ed126-card-tags">${chips}</div><div class="card-type">${d.type}</div><div class="card-desc">${live?liveCardDescription(d.desc,live):escapeHTML(d.desc)}</div><div class="rarity">${d.rarity}</div></button>`;
}
