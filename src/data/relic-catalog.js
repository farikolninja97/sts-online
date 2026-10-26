// Main-build v0.107.1 relics, limited to effects this game can accurately execute.
// Data and presentation only; triggers live in systems/relics/relic-engine.js.
'use strict';
const RELICS={
 burning_blood:{name:'Burning Blood',rarity:'Starter',icon:'🩸',description:'At the end of combat, heal 6 HP.',trigger:'afterCombat'},
 anchor:{name:'Anchor',rarity:'Common',icon:'⚓',description:'Start each combat with 10 Block.',trigger:'combatStart'},
 bag_marbles:{name:'Bag of Marbles',rarity:'Common',icon:'🔮',description:'At the start of each combat, apply 1 Vulnerable to ALL enemies.',trigger:'combatStart'},
 bag_preparation:{name:'Bag of Preparation',rarity:'Common',icon:'🎒',description:'At the start of each combat, draw 2 additional cards.',trigger:'combatStart'},
 blood_vial:{name:'Blood Vial',rarity:'Common',icon:'🧪',description:'At the start of each combat, heal 2 HP.',trigger:'combatStart'},
 bronze_scales:{name:'Bronze Scales',rarity:'Common',icon:'🛡️',description:'At the start of each combat, gain 3 Thorns.',trigger:'combatStart'},
 happy_flower:{name:'Happy Flower',rarity:'Common',icon:'🌼',description:'Every 3 turns, gain 1 Energy.',trigger:'turnStart'},
 lantern:{name:'Lantern',rarity:'Common',icon:'🏮',description:'Start each combat with an additional 1 Energy.',trigger:'combatStart'},
 oddly_smooth_stone:{name:'Oddly Smooth Stone',rarity:'Common',icon:'🪨',description:'Start each combat with 1 Dexterity.',trigger:'combatStart'},
 vajra:{name:'Vajra',rarity:'Common',icon:'⚔️',description:'Start each combat with 1 Strength.',trigger:'combatStart'},
 strawberry:{name:'Strawberry',rarity:'Common',icon:'🍓',description:'Upon pickup, raise your Max HP by 7.',trigger:'pickup'},
 strike_dummy:{name:'Strike Dummy',rarity:'Common',icon:'🎯',description:'Cards containing “Strike” deal 3 additional damage.',trigger:'attack'},
 meal_ticket:{name:'Meal Ticket',rarity:'Common',icon:'🎟️',description:'Whenever you enter a shop room, heal 15 HP.',trigger:'shopEnter'},
 regal_pillow:{name:'Regal Pillow',rarity:'Common',icon:'🛏️',description:'Whenever you Rest, heal an additional 15 HP.',trigger:'rest'},
 amethyst_aubergine:{name:'Amethyst Aubergine',rarity:'Common',icon:'🍆',description:'Enemies drop 15 additional Gold.',trigger:'afterCombat'},
 red_mask:{name:'Red Mask',rarity:'Common',icon:'🎭',description:'At the start of each combat, apply 1 Weak to ALL enemies.',trigger:'combatStart'},
 red_skull:{name:'Red Skull',rarity:'Common',icon:'💀',description:'While your HP is at or below 50%, you have 3 additional Strength.',trigger:'continuous'},
 centennial_puzzle:{name:'Centennial Puzzle',rarity:'Common',icon:'🧩',description:'The first time you lose HP each combat, draw 3 cards.',trigger:'hpLoss'},
 war_paint:{name:'War Paint',rarity:'Common',icon:'🎨',description:'Upon pickup, Upgrade 2 random Skills.',trigger:'pickup'},
 whetstone:{name:'Whetstone',rarity:'Common',icon:'🗡️',description:'Upon pickup, Upgrade 2 random Attacks.',trigger:'pickup'},
 orichalcum:{name:'Orichalcum',rarity:'Uncommon',icon:'🔶',description:'At the end of your turn, if you have no Block, gain 6 Block.',trigger:'turnEnd'},
 pantograph:{name:'Pantograph',rarity:'Uncommon',icon:'🏛️',description:'At the start of Boss combat, heal 25 HP.',trigger:'combatStart'},
 joss_paper:{name:'Joss Paper',rarity:'Uncommon',icon:'📄',description:'Every 5 times you Exhaust a card, draw 1 card.',trigger:'exhaust'},
 nunchaku:{name:'Nunchaku',rarity:'Uncommon',icon:'🥋',description:'Every time you play 10 Attacks, gain 1 Energy.',trigger:'attackPlay'},
 ornamental_fan:{name:'Ornamental Fan',rarity:'Uncommon',icon:'🪭',description:'Every time you play 3 Attacks in a single turn, gain 4 Block.',trigger:'attackPlay'},
 letter_opener:{name:'Letter Opener',rarity:'Uncommon',icon:'✉️',description:'Every time you play 3 Skills in a single turn, deal 5 damage to ALL enemies.',trigger:'skillPlay'},
 horn_cleat:{name:'Horn Cleat',rarity:'Uncommon',icon:'📯',description:'At the start of your 2nd turn, gain 14 Block.',trigger:'turnStart'},
 gremlin_horn:{name:'Gremlin Horn',rarity:'Uncommon',icon:'📣',description:'Whenever an enemy dies, gain 1 Energy and draw 1 card.',trigger:'enemyDeath'},
 shuriken:{name:'Shuriken',rarity:'Rare',icon:'✴️',description:'Every time you play 3 Attacks in a single turn, gain 1 Strength.',trigger:'attackPlay'},
 kunai:{name:'Kunai',rarity:'Rare',icon:'🥷',description:'Every time you play 3 Attacks in a single turn, gain 1 Dexterity.',trigger:'attackPlay'},
 art_of_war:{name:'Art of War',rarity:'Rare',icon:'📜',description:'If you do not play any Attacks during your turn, gain an additional 1 Energy next turn.',trigger:'turnStart'},
 sturdy_clamp:{name:'Sturdy Clamp',rarity:'Rare',icon:'🔩',description:'Up to 10 Block persists across turns.',trigger:'turnStart'}
};
const RELIC_POOL=Object.keys(RELICS).filter(id=>id!=='burning_blood');
const RELIC_RARITIES={Common:175,Uncommon:225,Rare:275};
