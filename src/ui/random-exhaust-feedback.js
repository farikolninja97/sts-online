// V1.13 — A readable, nonblocking reveal for randomly Exhausted cards.
// Rendered outside #app so battle rerenders/attack FX cannot erase it.
let randomExhaustTimeout=null;
function showRandomExhaust(card,source='Card effect'){
 if(!card)return;
 const d=spec(card),name=d.name+(card.up?'+':'');
 document.getElementById('random-exhaust-reveal')?.remove();
 if(randomExhaustTimeout)clearTimeout(randomExhaustTimeout);
 const el=document.createElement('aside');el.id='random-exhaust-reveal';
 el.className='random-exhaust-reveal';el.setAttribute('role','status');el.setAttribute('aria-live','polite');
 const typeIcon=d.type==='Attack'?'⚔':d.type==='Power'?'✦':'⬡';
 el.innerHTML=`<div class="exhaust-mini-art" aria-hidden="true">${typeIcon}</div><div class="exhaust-result"><small>${escapeHTML(source)} · RANDOM EXHAUST</small><strong>${escapeHTML(name)}</strong><span>${escapeHTML(d.type)} · moved to Exhaust pile</span></div><button type="button" data-dismiss-exhaust aria-label="Dismiss exhaust notification">×</button>`;
 document.body.appendChild(el);
 randomExhaustTimeout=setTimeout(()=>{el.classList.add('leaving');setTimeout(()=>{if(el.isConnected)el.remove()},300)},3200);
}
document.addEventListener('click',e=>{if(e.target.closest('[data-dismiss-exhaust]')){e.preventDefault();document.getElementById('random-exhaust-reveal')?.remove()}},true);
