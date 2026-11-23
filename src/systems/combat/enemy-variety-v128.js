/* V1.28 — Distinct enemies, telegraphed move effects, less repetitive Shrink.
 * Original Ember Descent monsters. No changes to card math, save key or RNG streams. */
'use strict';
// Once per encounter only: Gloom Mite opens with actual damage. Its one Shrink
// attempt is telegraphed later, lasts until this caster is killed, and is not
// silently replicated by any other enemy.
ED120_POLICY.mite={mode:'sequence',seq:[1,2,0,1,2,1,2]};
const ed128MitePlanBase=ed120Plan;
ed120Plan=function(e){
 const plan=ed128MitePlanBase(e);
 if(e?.key==='mite'&&e.usedShrink&&plan?.move?.shrink){
  plan.move={...ENEMIES.mite.moves[1]};
  plan.origin='beetle-no-repeat';
  e.aiPlan=plan;
 }
 return plan;
};
// Optional move tags are visible through Intent and Intel and only resolved at
// their telegraphed action; they never replace a committed Intent mid-turn.
const ED128_MOVES={
 // Act I: sentries protect friends, wolves coordinate, fire imps apply Burn,
 // mites shrink once, and bruisers can break an existing shield.
 archer:{0:{n:'Take Aim',block:5,allyBlock:2},1:{n:'Piercing Bolt',shatterBlock:3}},
 axe:{2:{n:'Overhead Smash',shatterBlock:4}},
 sootling:{1:{n:'Cinder Spit',kind:'attack',dmg:5,status:'burn'}},
 briarhound:{1:{n:'Pack Guard',allyBlock:6}},
 ember_shield:{0:{n:'Shield Bash',shatterBlock:3},1:{n:'Protect the Line',allyBlock:8}},
 lantern_wisp:{2:{n:'Blinding Spark',kind:'attack',dmg:5,vulnerable:1}},
 moss_hermit:{1:{n:'Root Whip',kind:'attack',dmg:8,frail:1}},
 ash_howler:{2:{n:'Wild Rend',recoil:3}},
 thicket:{0:{n:'Piercing Briars',kind:'attack',dmg:6,weak:1}},
 knuckle:{1:{n:'Hammerfall',shatterBlock:4}},
 crimson_binder:{0:{n:'Burning Bind',kind:'attack',dmg:8,frail:1,status:'wound'}},
 thorn_executioner:{2:{n:'Thorn Storm',recoil:2}},
 rootmaw:{0:{n:'Grasping Vines',kind:'attack',dmg:9,weak:1}},
 ashen_monarch:{0:{n:'Call the Court',allyBlock:7}},
 // Act II: crystal creatures pierce armor, echo mages guard allies, and
 // spinners inflict Dazed alongside attacks instead of repetitive pure debuffs.
 shardspider:{0:{n:'Glass Thread',kind:'attack',dmg:5,weak:1,status:'dazed'}},
 echo_mage:{0:{n:'Prismatic Ward',allyBlock:5}},
 ore_golem:{1:{n:'Iron Fist',shatterBlock:6}},
 hollow_monk:{2:{n:'Dust Palm Curse',kind:'attack',dmg:9,frail:1}},
 mist_thief:{2:{n:'Dirty Trick',kind:'attack',dmg:8,vulnerable:1}},
 molten_guard:{1:{n:'Heated Blade',status:'burn',shatterBlock:3}},
 glasswing:{1:{n:'Shard Burst',status:'dazed'}},
 shellguard:{0:{n:'Shell Wall',allyBlock:5}},
 prism_jailor:{0:{n:'Crystal Cage',kind:'attack',dmg:10,frail:1,status:'dazed'}},
 cinder_duelist:{2:{n:'Flaming Riposte',recoil:3}},
 crystal_sentinel:{1:{n:'Gem Lance',shatterBlock:7}},
 shard_matriarch:{0:{n:'Brood Chamber',allyBlock:6},2:{n:'Needle Web',kind:'attack',dmg:10,weak:1,status:'dazed'}},
 forge_tyrant:{1:{n:'Hammer of Embers',shatterBlock:5},2:{n:'Smelting Smoke',kind:'attack',dmg:11,frail:1}},
 // Act III: elite tactics, exhausting volleys, expensive piercing attacks,
 // and several boss signature risks (self-damage after their huge swings).
 crown_wraith:{0:{n:'Royal Hexblade',kind:'attack',dmg:10,weak:1}},
 bone_harbinger:{1:{n:'Marrow Crush',recoil:4}},
 star_devourer:{0:{n:'Drain Light',heal:7}},
 ruin_keeper:{1:{n:'Gatebreaker',shatterBlock:10}},
 dusk_collector:{0:{n:'Tax Collector',kind:'attack',dmg:10,frail:1,status:'wound'}},
 void_scribe:{0:{n:'Seal the Page',statusCount:1}},
 voidclaw:{1:{n:'Sunder',kind:'attack',dmg:10,frail:1}},
 astral:{0:{n:'Warp Arrow',shatterBlock:5}},
 basalt:{1:{n:'Stonefall',shatterBlock:8}},
 void_arbiter:{0:{n:'Sentence',kind:'attack',dmg:12,vulnerable:1,status:'dazed'}},
 grave_marshal:{0:{n:'Rally Ash',allyBlock:7}},
 astral_harvester:{1:{n:'Meteor Arrow',recoil:4}},
 hollow_regent:{1:{n:'Spectral Edict',kind:'attack',dmg:14,vulnerable:1,status:'wound'}},
 eclipse_engine:{2:{n:'Dead Star',statusCount:1}}
};
for(const [key,changes] of Object.entries(ED128_MOVES)){
 const enemy=ENEMIES[key];if(!enemy?.moves)continue;
 for(const [index,change] of Object.entries(changes)){
  if(!enemy.moves[Number(index)])continue;
  enemy.moves[Number(index)]={...enemy.moves[Number(index)],...change};
 }
}
// A simpler, friendly counter to frequent curses: one Shrink per beetle.
// Do not mutate an already displayed Intent from a restored saved game.
const ed128IntentBase=intentHTML;
intentHTML=function(e){
 let html=ed128IntentBase(e),m=moveFor(e);
 const extra=[];
 if(m.shatterBlock)extra.push(`▰ −${m.shatterBlock} Block`);
 if(m.allyBlock)extra.push(`◆ ${m.allyBlock} ally Block`);
 if(m.recoil)extra.push(`↩ ${m.recoil} recoil`);
 if(m.weak)extra.push(`↓ ${m.weak} Weak`);
 if(m.frail)extra.push(`⬡ ${m.frail} Frail`);
 if(m.vulnerable)extra.push(`✹ ${m.vulnerable} Vulnerable`);
 if(m.shrink)extra.push('◇ Shrink (beetle only)');
 if(m.status)extra.push(`✦ ${m.status}`);
 if(extra.length)html+=`<span class="ed128-intent-detail" title="${escapeHTML(extra.join(' · '))}">${escapeHTML(extra.join(' · '))}</span>`;
 return html;
};
function ed128ResolveEnemyMove(e,m){
 if(!e||!m||S?.screen!=='battle')return;
 // Support allies in the current encounter. The caster's own printed Block
 // is already applied by the standard combat resolver.
 if(m.allyBlock){
  for(const ally of alive())if(ally!==e){ally.block=(ally.block||0)+m.allyBlock;queueFX(ally.id,m.allyBlock,'buff');}
  log(`${e.name} shields its allies for ${m.allyBlock} Block`);
  combatEvent('enemy-ally-block',{enemy:e.key,amount:m.allyBlock});
 }
 if(m.recoil&&m.kind==='attack'&&e.hp>0){
  const before=e.hp;hurtEnemy(e,m.recoil,false);
  log(`${e.name}'s reckless attack deals ${before-e.hp} recoil damage`);
  combatEvent('enemy-recoil',{enemy:e.key,amount:before-e.hp});
 }
}
// Attack archetypes now influence the presentation in addition to per-move
// text. These are cosmetic only; the committed damage math never changes.
const ED128_ARCHETYPES={
 mite:'skitter',sootling:'ember',lantern_wisp:'ember',emberling:'ember',molten_guard:'ember',forge_tyrant:'ember',eclipse_engine:'arcane',
 archer:'projectile',mist_thief:'projectile',astral:'projectile',dusk_collector:'projectile',astral_harvester:'projectile',
 briarhound:'fang',ash_howler:'fang',thicket:'thorn',moss_hermit:'thorn',vine:'thorn',rootmaw:'thorn',thorn_executioner:'thorn',
 glasswing:'crystal',shardspider:'crystal',prism_jailor:'crystal',crystal_sentinel:'crystal',shard_matriarch:'crystal',
 echo_mage:'arcane',void_scribe:'arcane',hollow_monk:'arcane',void_arbiter:'arcane',hollow_regent:'arcane',crown_wraith:'arcane',
 ore_golem:'heavy',stone:'heavy',basalt:'heavy',ruin_keeper:'heavy',ember_shield:'shield',shellguard:'shield',sentinel:'heavy'
};
const ed128CinematicBeginBase=enemyCinematics.begin;
enemyCinematics.begin=async function(e,m){
 document.body.dataset.ed128Archetype=ED128_ARCHETYPES[e?.key]|| (m?.kind==='debuff'?'arcane':'martial');
 return ed128CinematicBeginBase(e,m);
};
const ed128CinematicFinishBase=enemyCinematics.finish;
enemyCinematics.finish=async function(...args){
 try{return await ed128CinematicFinishBase(...args)}finally{delete document.body.dataset.ed128Archetype;}
};
// The Intel screen explains tactical consequences of the new moves rather
// than hiding debuffs inside a generic "attack" label.
const ed128IntelModalBase=modalHTML;
modalHTML=function(){
 const html=ed128IntelModalBase();
 if(modal?.type!=='enemy-intel'||!S||S.screen!=='battle')return html;
 const guide=alive().map(e=>{
  const moves=[...(ENEMIES[e.key]?.moves||[]),...(ENEMIES[e.key]?.enragedMoves||[])];
  const descriptions=moves.map(m=>{
   const tags=[];
   if(m.shatterBlock)tags.push(`shatters ${m.shatterBlock} Block before hitting`);
   if(m.allyBlock)tags.push(`shields allies for ${m.allyBlock}`);
   if(m.recoil)tags.push(`takes ${m.recoil} recoil damage`);
   if(m.weak)tags.push(`applies ${m.weak} Weak`);
   if(m.frail)tags.push(`applies ${m.frail} Frail`);
   if(m.vulnerable)tags.push(`applies ${m.vulnerable} Vulnerable`);
   if(m.shrink)tags.push('Shrink ends when this beetle dies; used once per encounter');
   if(m.status)tags.push(`adds ${m.status}`);
   if(m.summon)tags.push('summons an ally');
   return tags.length?`<li><b>${escapeHTML(m.n)}</b>: ${escapeHTML(tags.join(' · '))}</li>`:'';
  }).filter(Boolean).join('');
  return descriptions?`<div class="ed128-intel-foe"><strong>${escapeHTML(e.name)}</strong><ul>${descriptions}</ul></div>`:'';
 }).join('');
 if(!guide)return html;
 const panel=`<div class="ed128-intel-guide"><h3>Signature tactics</h3><p class="note">Every effect listed here is telegraphed by the chosen Intent. Other enemies do not apply Shrink.</p>${guide}</div>`;
 const last=html.lastIndexOf('</section></div>');
 return last>=0?html.slice(0,last)+panel+html.slice(last):html;
};
