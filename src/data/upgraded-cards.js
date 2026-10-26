// Card upgrade definitions and card rule corrections.
// V1.03 — verified against the v0.111 Ironclad references and official patch notes.
// Drum of Battle has been a 1-cost Skill since v0.104.0 (not the old Power).
CARDS.drum.type='Skill';CARDS.drum.cost=1;
CARDS.drum.desc='Draw 2 cards. When this card is Exhausted, gain 2 Energy.';
// These printed Exhaust keywords were missing from V1.02 even though they are game rules.
CARDS.dominate.exhaust=true;
CARDS.dominate.desc='Apply 1 Vulnerable. Gain 1 Strength for each Vulnerable on the enemy. Exhaust.';
CARDS.molten.exhaust=true;
CARDS.molten.desc='Deal 10 damage. Double the enemy\'s Vulnerable. Exhaust.';
CARDS.forgotten.exhaust=true;
CARDS.notyet.exhaust=true;
CARDS.demon.desc='At the start of your turn, gain 3 Strength.';
CARDS.spite.desc='Deal 5 damage. If you lost HP this turn, hits 2 times.';
CARDS.conflag.desc='Deal 2 damage to ALL enemies 4 times.';
CARDS.cinder.desc='Deal 18 damage. Exhaust 1 card at random.';
CARDS.howl.desc='Deal 18 damage to ALL enemies. At the end of your turn, if this is in your Exhaust Pile, play it.';
CARDS.unrelenting.desc='Deal 14 damage. The next Attack you play costs 0 Energy.';
Object.assign(UP,{
 drum:{desc:'Draw 2 cards. When this card is Exhausted, gain 3 Energy.'},
 cinder:{dmg:24,desc:'Deal 24 damage. Exhaust 1 card at random.'},
 spite:{desc:'Deal 5 damage. If you lost HP this turn, hits 3 times.'},
 conflag:{desc:'Deal 2 damage to ALL enemies 5 times.'},
 rampage:{desc:'Deal 10 damage. Increase this card\'s damage by 10 this combat.'},
 expect:{block:16,desc:'Gain 16 Block. Gains 8 additional Block for each Strength you have.'},
 dominate:{desc:'Apply 2 Vulnerable. Gain 1 Strength for each Vulnerable on the enemy. Exhaust.'},
 molten:{dmg:14,desc:'Deal 14 damage. Double the enemy\'s Vulnerable. Exhaust.'},
 forgotten:{desc:'Gain 4 Energy. Exhaust.'},
 notyet:{desc:'Heal 13 HP. Exhaust.'},
 demon:{desc:'At the start of your turn, gain 4 Strength.'},
 vicious:{desc:'Whenever you apply Vulnerable, draw 2 cards.'},
 unrelenting:{dmg:20,desc:'Deal 20 damage. The next Attack you play costs 0 Energy.'},
 howl:{dmg:24,desc:'Deal 24 damage to ALL enemies. At the end of your turn, if this is in your Exhaust Pile, play it.'},
 ashen:{desc:'Deal 6 damage. Deals 4 additional damage for each card in your Exhaust Pile.'},
 secondwind:{desc:'Exhaust all non-Attack cards in your Hand. Gain 7 Block for each card Exhausted.'},
 feel:{desc:'Whenever a card is Exhausted, gain 4 Block.'},
 stoke:{desc:'Exhaust your Hand. Add 1 random Upgraded card into your Hand for each card Exhausted. Exhaust.'}
});


/* V1.04 Ironclad upgrade catalog. Data aligned primarily to beta v0.111,
   checked against published upgraded card descriptions. */
Object.assign(UP,{
 bloodwall:{block:20,desc:'Lose 2 HP. Gain 20 Block.'},
 breakthrough:{dmg:13,desc:'Lose 1 HP. Deal 13 damage to ALL enemies.'},
 havoc:{cost:0,desc:'Play the top card of your Draw Pile and Exhaust it. Exhaust.'},
 headbutt:{dmg:12,desc:'Deal 12 damage. Put a card from your Discard Pile on top of your Draw Pile.'},
 perfect:{desc:'Deal 6 damage. Deals 3 additional damage for ALL your cards containing Strike.'},
 setupstrike:{dmg:9,desc:'Deal 9 damage. Gain 3 Strength this turn.'},
 swordboom:{dmg:3,desc:'Deal 3 damage to a random enemy 4 times.'},
 taunt:{block:7,desc:'Gain 7 Block. Apply 2 Vulnerable.'},
 tremble:{desc:'Apply 4 Vulnerable. Exhaust.'},
 bloodlet:{desc:'Lose 3 HP. Gain 3 Energy.'},
 bully:{desc:'Deal 4 damage. Deals 3 additional damage for each Vulnerable on the enemy.'},
 burningpact:{desc:'Exhaust 1 card. Draw 3 cards.'},
 colossus:{block:7,desc:'Gain 7 Block. Take 50% less damage from Vulnerable enemies this turn.'},
 cruelty:{desc:'Vulnerable enemies take an additional 50% damage.'},
 dismantle:{dmg:10,desc:'Deal 10 damage. If the enemy is Vulnerable, hits twice.'},
 evileye:{block:11,desc:'Gain 11 Block. Gain another 11 Block if you Exhausted a card this turn.'},
 fightme:{dmg:6,desc:'Deal 6 damage twice. Gain 4 Strength. The enemy gains 1 Strength.'},
 hemo:{dmg:20,desc:'Lose 2 HP. Deal 20 damage.'},
 infernal:{cost:0,desc:'Add a random Attack into your Hand. It is free to play this turn. Exhaust.'},
 inferno:{desc:'At the start of your turn, lose 1 HP. Whenever you lose HP on your turn, deal 9 damage to ALL enemies.'},
 juggling:{innate:true,desc:'Innate. Add a copy of the third Attack you play each turn into your Hand.'},
 pillage:{dmg:9,desc:'Deal 9 damage. Draw cards until you draw a non-Attack card.'},
 rage:{desc:'Whenever you play an Attack this turn, gain 5 Block.'},
 rupture:{desc:'Whenever you lose HP on your turn, gain 2 Strength.'},
 stampede:{cost:1,desc:'At the end of your turn, 1 random Attack in your Hand is played against a random enemy.'},
 stomp:{dmg:15,desc:'Deal 15 damage to ALL enemies. Costs 1 less Energy for each Attack played this turn.'},
 stonearmor:{desc:'Gain 6 Plating.'},
 aggression:{innate:true,desc:'Innate. At the start of your turn, put a random Attack from your Discard Pile into your Hand and Upgrade it.'},
 barricade:{cost:2,desc:'Block is not removed at the start of your turn.'},
 brand:{desc:'Lose 1 HP. Exhaust 1 card. Gain 2 Strength.'},
 cascade:{desc:'Play the top X+1 cards of your Draw Pile.'},
 crimson:{desc:'At the start of your turn, lose 1 HP and gain 10 Block.'},
 darkembrace:{cost:1,desc:'Whenever a card is Exhausted, draw 1 card.'},
 hellraiser:{cost:1,desc:'Whenever you draw a card containing Strike, play it against a random enemy.'},
 juggernaut:{desc:'Whenever you gain Block, deal 8 damage to a random enemy.'},
 mangle:{dmg:26,desc:'Deal 26 damage. The enemy loses 15 Strength this turn.'},
 onetwo:{desc:'This turn, your next 2 Attacks are played an extra time.'},
 pactsend:{dmg:24,desc:'If you have 3 or more cards in your Exhaust Pile, deal 24 damage to ALL enemies.'},
 primal:{desc:'Transform all Attacks in your Hand into Upgraded Giant Rock.'},
 pyre:{desc:'At the start of your turn, gain 2 Energy.'},
 tear:{dmg:7,desc:'Deal 7 damage. Hits an additional time for each time you lost HP this combat.'},
 thrash:{dmg:6,desc:'Deal 6 damage twice. Exhaust a random Attack in your Hand and add its damage to this card.'},
 unmovable:{cost:1,desc:'The first time you gain Block from a card each turn, double it.'}
});
// Printed Exhaust keyword was missing for this common single-player card.
CARDS.tremble.exhaust=true;
CARDS.tremble.desc='Apply 3 Vulnerable. Exhaust.';
CARDS.bloodwall.block=16;
// Keep baseline and tooltip damage aligned with the underlying implementation.
CARDS.perfect.dmg=6;
CARDS.setupstrike.dmg=7;
CARDS.setupstrike.desc='Deal 7 damage. Gain 2 Strength this turn.';
CARDS.bully.dmg=4;
CARDS.swordboom.dmg=3;
CARDS.pactsend.dmg=18;
CARDS.crimson.desc='At the start of your turn, lose 1 HP and gain 7 Block.';
CARDS.juggernaut.desc='Whenever you gain Block, deal 6 damage to a random enemy.';
CARDS.mangle.dmg=20;
CARDS.mangle.desc='Deal 20 damage. The enemy loses 10 Strength this turn.';
CARDS.tear.dmg=5;
CARDS.tear.desc='Deal 5 damage. Hits an additional time for each time you lost HP this combat.';
CARDS.thrash.dmg=4;
CARDS.thrash.desc='Deal 4 damage twice. Exhaust a random Attack in your Hand and add its damage to this card.';
// Thrash adds damage to itself permanently during this combat, not just the current attack.
CARDS.giantrock.dmg=20;
CARDS.giantrock.desc='Deal 20 damage.';
UP.giantrock={dmg:24,desc:'Deal 24 damage.'};
const UPGRADE_KEYS=Object.keys(CARDS).filter(k=>k!=='giantrock' && !!UP[k]);
const REWARD_UPGRADE_MISSING=SOLO_POOL.filter(k=>!UP[k]);


