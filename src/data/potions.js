// Main-build potion definitions, separate from gameplay triggers.
'use strict';
const ED_POTIONS = Object.freeze({
 fire:{name:'Fire Potion',icon:'🔥',rarity:'Common',target:true,desc:'Deal 20 damage to an enemy.',use:(e)=>hurtEnemy(e,20,false)},
 block:{name:'Block Potion',icon:'🛡️',rarity:'Common',desc:'Gain 12 Block.',use:()=>gainBlock(12)},
 energy:{name:'Energy Potion',icon:'⚡',rarity:'Common',desc:'Gain 2 Energy.',use:()=>grantEnergyV110(2)},
 swift:{name:'Swift Potion',icon:'🌪️',rarity:'Common',desc:'Draw 3 cards.',use:()=>drawCards(3,true)},
 strength:{name:'Strength Potion',icon:'💪',rarity:'Common',desc:'Gain 2 Strength.',use:()=>{S.strength+=2}},
 dexterity:{name:'Dexterity Potion',icon:'🔷',rarity:'Common',desc:'Gain 2 Dexterity.',use:()=>{S.dexterity=(S.dexterity||0)+2}},
 weak:{name:'Weak Potion',icon:'🕸️',rarity:'Common',target:true,desc:'Apply 3 Weak to an enemy.',use:(e)=>blockDebuff(e,'weak',3)},
 vulnerable:{name:'Vulnerable Potion',icon:'🩸',rarity:'Common',target:true,desc:'Apply 3 Vulnerable to an enemy.',use:(e)=>blockDebuff(e,'vulnerable',3)},
 blood:{name:'Blood Potion',icon:'🍷',rarity:'Common',desc:'Heal 20% of Max HP.',use:()=>{S.hp=Math.min(S.maxHP,S.hp+Math.floor(S.maxHP*.2))}},
 cure:{name:'Cure All',icon:'💚',rarity:'Uncommon',desc:'Gain 1 Energy. Draw 2 cards.',use:()=>{grantEnergyV110(1);drawCards(2,true)}},
 forge:{name:'Blessing of the Forge',icon:'🔨',rarity:'Uncommon',desc:'Upgrade all cards in your Hand for the rest of combat.',use:()=>{for(const pile of [S.hand,S.draw,S.discard,S.exhaust])for(const c of pile)if(UP[c.key])c.up=true}}
});
const ED_POTION_IDS=Object.keys(ED_POTIONS);
