const nav=document.getElementById('nav'),pointer=document.getElementById('pointer');
let targetX=0,targetY=0,curX=0,curY=0;
addEventListener('mousemove',e=>{targetX=(e.clientX-innerWidth/2)/innerWidth;targetY=(e.clientY-innerHeight/2)/innerHeight;if(pointer){pointer.style.left=e.clientX+'px';pointer.style.top=e.clientY+'px';}});
addEventListener('scroll',()=>nav?.classList.toggle('scrolled',scrollY>80),{passive:true});
const scrollEls=[...document.querySelectorAll('.scroll3d')];
function animate(){curX+=(targetX-curX)*.045;curY+=(targetY-curY)*.045;scrollEls.forEach(el=>{const r=el.getBoundingClientRect(),center=r.top+r.height/2-innerHeight/2;const speed=parseFloat(el.dataset.speed||0);const scrollShift=Math.max(-90,Math.min(90,-center*speed));el.style.setProperty('--sy',scrollShift.toFixed(2)+'px');el.style.setProperty('--mx',(curX*18).toFixed(2)+'px');});requestAnimationFrame(animate)}animate();
const cards=[...document.querySelectorAll('.characterCard')];let active=0;
function positions(){cards.forEach((c,i)=>{let d=(i-active+4)%4;c.className='characterCard '+(d===0?'c0':d===1?'c2':d===2?'c3':'c1');});document.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('active',i===active));}
function select(n){active=(n+4)%4;positions();document.getElementById('carousel')?.animate([{transform:'scale(.985)'},{transform:'scale(1)'}],{duration:280,easing:'cubic-bezier(.2,.8,.2,1)'});}
document.getElementById('prev')?.addEventListener('click',()=>select(active-1));document.getElementById('next')?.addEventListener('click',()=>select(active+1));
const dots=document.getElementById('dots');if(dots){for(let i=0;i<4;i++){const d=document.createElement('button');d.className='dot'+(!i?' active':'');d.setAttribute('aria-label','Selecionar integrante '+(i+1));d.onclick=()=>select(i);dots.appendChild(d)}}
// As setas escolhem o integrante. O scroll da página NÃO altera o integrante selecionado.
