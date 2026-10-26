// DOM helpers, random selection, cards, saves and loads.
const $=s=>document.querySelector(s); const $all=s=>Array.from(document.querySelectorAll(s));
const choice=(a)=>a[Math.floor(Math.random()*a.length)]; const shuffle=(a)=>{a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const escapeHTML=(s)=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
function newCard(key){return {uid:'c'+(++uid),key,up:false,bonus:0}};
function newGame(){uid=0; S={screen:'route',act:1,floor:0,hp:80,maxHP:80,energy:3,block:0,strength:0,weak:0,vulnerable:0,frail:0,tangled:0,shrink:false,flame:0,rage:0,gold:99,powers:{},deck:[...Array(5)].map(()=>newCard('strike')).concat([...Array(4)].map(()=>newCard('defend')),newCard('bash')),draw:[],discard:[],hand:[],exhaust:[],enemies:[],target:0,turn:1,log:[],offered:[],room:'',clearCount:0,asc9:false,canDraw:true,cardsPlayed:0,attacksPlayed:0,cardLoseCount:0,finished:false,looted:false,routeOptions:[]}; generateRoute(); save();render()}
function save(){try{if(S)localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}}
function load(){try{const old=localStorage.getItem(SAVE_KEY);if(old){let x=JSON.parse(old);if(x&&x.deck&&x.screen){S=x;uid=Math.max(0,...(S.deck||[]).map(c=>parseInt(String(c.uid).replace(/\D/g,''))||0),...(S.hand||[]).map(c=>parseInt(String(c.uid).replace(/\D/g,''))||0));return true}}}catch(e){}return false}
