/* BOTBANK · UI kit helpers: number bumps, slider fills, icon toggles */
function rangeFill(el){const mn=+el.min||0,mx=+el.max||100,v=+el.value;el.style.setProperty('--p',((v-mn)/(mx-mn||1)*100).toFixed(1)+'%');}
document.addEventListener('DOMContentLoaded',()=>{
  const bump=new MutationObserver(ms=>ms.forEach(m=>{const el=m.target.nodeType===3?m.target.parentElement:m.target;const s=el&&el.closest('.stat');if(!s)return;s.classList.remove('bump');void s.offsetWidth;s.classList.add('bump');}));
  ['hCash','hDep','hLoans','hCap'].forEach(id=>{const e=document.getElementById(id);if(e)bump.observe(e,{childList:true,characterData:true,subtree:true});});
  document.addEventListener('input',e=>{if(e.target.type==='range')rangeFill(e.target);},true);
  const card=document.getElementById('card');if(card)new MutationObserver(()=>card.querySelectorAll('input[type=range]').forEach(rangeFill)).observe(card,{childList:true,subtree:true});
  const t=document.getElementById('modeSeg');if(t)new MutationObserver(()=>{}).observe(t,{childList:true});
});
