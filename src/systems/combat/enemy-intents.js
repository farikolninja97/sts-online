// Enemy move intent labels and initial damage projections.
function log(t){S.log.unshift(t); S.log=S.log.slice(0,22)}
const alive=()=>S.enemies.filter(e=>e.hp>0);
const targetEnemy=()=>S.enemies[S.target]?.hp>0?S.enemies[S.target]:alive()[0];
let moveFor=(e)=>{
 if(e.stunned){return {n:'Stunned',kind:'sleep',stunned:true}}
 if(e.key==='sentinel')return e.step===0?ENEMIES.sentinel.moves[0]:e.step===1?ENEMIES.sentinel.moves[1]:ENEMIES.sentinel.moves[2];
 if(e.key==='feeder')return e.step===0?ENEMIES.feeder.moves[0]:e.step===1?ENEMIES.feeder.moves[1]:ENEMIES.feeder.moves[2];
 if(e.key==='acolyte')return e.step===0?ENEMIES.acolyte.moves[0]:ENEMIES.acolyte.moves[1];
 if(e.key==='stone')return ENEMIES.stone.moves[0];
 return ENEMIES[e.key].moves[e.step%ENEMIES[e.key].moves.length];
};
const legacyAdjustedEnemyDamage=(e,m)=>{
 let base=S.asc9&&m.ascDmg!=null?m.ascDmg:(m.dmg||0);
 // Ascension 9+ differences are documented for a subset; the remaining demo encounters are normal-only.
 if(S.asc9&&!m.ascDmg){const over={mite:{Chomp:8,Stomp:14},marauder:{Crush:8},axe:{'Guarded Swing':6,'Overhead Smash':13},vine:{'Vine Swipe':7,Grasp:9,Gorge:18},archer:{'Piercing Bolt':16},acolyte:{'Dark Strike':11},whelp:{Bite:8},silk:{Thrash:5},stone:{Headbutt:16},feeder:{'Absorb Heat':0}};base=over[e.key]?.[m.n]??base;}
 let value=Math.max(0,base+(e.strength||0));
 if(e.weak>0)value=Math.floor(value*.75);
 if(S.vulnerable>0)value=Math.floor(value*1.5);
 return value;
};
function intentHTML(e){const m=moveFor(e);let hits=m.hits||1,damage=adjustedEnemyDamage(e,m);return m.kind==='attack'?`<span class="danger">⚔ ${damage}${hits>1?' × '+hits:''}</span><span class="move-name">${escapeHTML(m.n)}</span>`:`<span class="support">${m.kind==='buff'?'✦ ':m.kind==='debuff'?'☷ ':'◌ '}${escapeHTML(m.n)}${m.strength?' +'+(S.asc9&&e.key==='feeder'?16:m.strength)+' Str':''}</span>`}
function pill(label,num){return num>0?`<span class="statuspill">${label} ${num}</span>`:''}
function healthbar(hp,max){return `<div class="healthbar"><div class="hpfill" style="width:${Math.max(0,Math.min(100,hp/max*100))}%"></div><div class="hptxt">${Math.max(0,hp)} / ${max}</div></div>`}
