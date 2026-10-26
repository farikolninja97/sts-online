// Current main-branch (non-beta) card values and final compatibility patches.
/* V1.10 — pinned to Slay the Spire 2 DEFAULT MAIN v0.107.1 (not beta).
 * Independent references: spiregenius.com/cards/.. and sts2db.com/patches/.
 * Scope: Ironclad solo cards and deterministic combat interaction fixes.
 */
const RULESET_MAIN_V110='v0.107.1';
function grantEnergyV110(n){
 n=Math.max(0,Math.floor(Number(n)||0));
 if(S.energyLocked){if(n)log(`Energy gain blocked (${n})`);return 0}
 S.energy+=n;return n;
}
const MAIN_CARD_PATCH_V110={
 demon:{desc:'At the start of your turn, gain 2 Strength.'},
 mangle:{dmg:15,desc:'Deal 15 damage. The enemy loses 10 Strength this turn.'},
 rampage:{dmg:9,desc:"Deal 9 damage. Increase this card\'s damage by 5 this combat."},
 taunt:{rarity:'Uncommon',block:7,desc:'Gain 7 Block. Apply 1 Vulnerable.'},
 cruelty:{rarity:'Rare'},
 dominate:{rarity:'Uncommon'},
 expect:{cost:2,block:0,desc:'Gain 1 Energy for each Attack in your Hand. You cannot gain additional Energy this turn.'},
 forgotten:{desc:'If you Exhausted a card earlier this turn, gain 3 Energy. Exhaust.'}
};
for(const [key,meta] of Object.entries(MAIN_CARD_PATCH_V110))Object.assign(CARDS[key],meta);
Object.assign(UP,{
 demon:{desc:'At the start of your turn, gain 3 Strength.'},
 mangle:{dmg:20,desc:'Deal 20 damage. The enemy loses 15 Strength this turn.'},
 rampage:{dmg:9,desc:"Deal 9 damage. Increase this card\'s damage by 9 this combat."},
 taunt:{block:8,desc:'Gain 8 Block. Apply 2 Vulnerable.'},
 expect:{cost:1,block:0,desc:'Gain 1 Energy for each Attack in your Hand. You cannot gain additional Energy this turn.'},
 forgotten:{desc:'If you Exhausted a card earlier this turn, gain 4 Energy. Exhaust.'}
});
// Reset run-scoped conditional mechanics between encounters.
const startBattleBeforeMainV110=startBattle;
startBattle=function(type){startBattleBeforeMainV110(type);S.energyLocked=false;S.crueltyPct=0;S.crueltyBonus=1.5};
const playerStatusBeforeMainV110=statusForPlayer;
statusForPlayer=function(){let chips=playerStatusBeforeMainV110();if(S.energyLocked)chips+=statusChip('No More Energy',1);return chips};
// Preserves new-run and existing-save behavior without resetting current progress.
if(S){S.energyLocked??=false;S.crueltyPct??=Math.max(0,(S.crueltyBonus||1.5)-1.5);if(S.screen==='battle')render()}

