/* =====================================================================
   BOTBANK · hands-on jobs. Every one is a real banking decision.
   ===================================================================== */
const money=(v,d)=>{v=+v||0;const n=v<0;v=Math.abs(v);return (n?'-$':'$')+v.toLocaleString('en-US',{minimumFractionDigits:d||0,maximumFractionDigits:d||0});};
const short=v=>{v=+v||0;const a=Math.abs(v),n=v<0?'-':'';if(a>=1e6)return n+'$'+(a/1e6).toFixed(a>=1e7?1:2)+'M';if(a>=1e4)return n+'$'+(a/1e3).toFixed(0)+'K';if(a>=1e3)return n+'$'+(a/1e3).toFixed(1)+'K';return n+'$'+Math.round(a);};
const pct=(v,d=1)=>(+v).toFixed(d)+'%';
function modalOpen(){return !$('#modal').hidden;}
function openModal(html,o={}){const M=$('#modal'),C=$('#card');C.className='card '+(o.cls||'');C.innerHTML=html;M.hidden=false;M.onclick=e=>{if(e.target===M&&o.close){closeModal();}};C.scrollTop=0;const f=C.querySelector('[data-focus]');f&&setTimeout(()=>f.focus(),30);sfx('open');return C;}
function closeModal(){clearInterval(jobT);$('#modal').hidden=true;const f=MODALQ.shift();if(f)setTimeout(f,120);else if(typeof onModalsDone==='function')onModalsDone();}
const MODALQ=[];function queueModal(f){if(modalOpen())MODALQ.push(f);else f();}
let jobT=null;
function timerBar(C,sec,onOut){const b=C.querySelector('.timer i');if(!b)return;const t0=performance.now();clearInterval(jobT);jobT=setInterval(()=>{const k=(performance.now()-t0)/1000/sec;b.style.width=Math.max(0,(1-k)*100)+'%';b.style.background=k>.72?'#E5484D':k>.45?'#D99A1C':'#14935C';if(k>=1){clearInterval(jobT);onOut&&onOut();}},60);}
const stopTimer=()=>clearInterval(jobT);
function verdict(C,good,head,text,lesson,done){stopTimer();const el=C.querySelector('.after');C.querySelectorAll('.choice,.billbtn').forEach(b=>b.disabled=true);el.innerHTML=`<div class="res ${good?'':'bad'}"><b>${head}</b> ${text}</div><div class="mact"><button class="btn pri" data-go data-focus>Next</button></div>`;el.hidden=false;sfx(good?'good':'bad');const go=el.querySelector('[data-go]');go.onclick=()=>{closeModal();done();};go.focus();if(lesson)learn(lesson);setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'nearest'}),30);}
const WORDS=['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'],TENS=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
function amtWords(n){let s='';if(n>=1000){s+=amtWords(Math.floor(n/1000))+' Thousand ';n%=1000;}if(n>=100){s+=WORDS[Math.floor(n/100)]+' Hundred ';n%=100;}if(n>=20){s+=TENS[Math.floor(n/10)]+(n%10?'-'+WORDS[n%10]:'');}else if(n>0)s+=WORDS[n];return s.trim();}

/* TELLER 1: inspect a check */
function jobCheck(c,done){
  const amt=c.req.amt,flaw=c.req.flaw,payee=c.name,paper=pick(['Sprocket Bakery','Bolt Bikes','Volt Energy Co.','Rivet Realty','Dash Delivery','Spark Schools']);
  const curM=(S.month-1)%12,d=flaw==='stale'?`${MONTHS[(curM+12-8)%12]} 3, ${2026+Math.floor((S.month-1)/12)-1}`:`${MONTHS[curM]} ${ri(1,26)}, ${2026+Math.floor((S.month-1)/12)}`;
  const words=amtWords(flaw==='amount'?amt+ri(1,9)*100:amt)+' and 00/100';
  const C=openModal(`<div class="jobhead"><span class="eyebrow">Teller Window</span><h2>Check deposit</h2><p>${esc(c.name)} wants to deposit this check. Is it good?</p></div><div class="timer"><i></i></div>
  <div class="check"><div class="ck1"><div><b>${paper}</b><small>2413 Nashville Rd · Bot City</small></div><div class="ckno">No. ${ri(1001,9899)}<br><span>Date</span> <u>${d}</u></div></div>
  <div class="ck2"><span>Pay to the order of</span><u class="pay">${esc(flaw==='payee'?pick(NAMES1)+' '+pick(NAMES2):payee)}</u><em>${money(amt,2)}</em></div>
  <div class="ck3"><u>${words}</u><span>Dollars</span></div><div class="ck4"><div><span>Memo</span> <u>${pick(['Invoice 88','Paycheck','Birthday','Lawn care'])}</u></div><div class="sig">${flaw==='signature'?'':'<i>'+paper.split(' ')[0]+' Owner</i>'}<u></u></div></div><div class="micr">⑆081000432⑆ 2200${ri(1000,9999)}⑈ ${ri(1001,9899)}</div></div>
  <div class="ckback"><span>Back of check, endorsement:</span> ${flaw==='endorse'?'<em class="blank">blank</em>':`<i>${esc(payee)}</i>`}</div>
  <div class="row2"><button class="choice good" data-a="1" data-focus>✓ Accept check</button><button class="choice" data-a="0">✕ Reject check</button></div><div class="after" hidden></div>`,{cls:'paper job'});
  const REASON={amount:'The number and the written amount do not match.',signature:'The signature line is empty.',stale:'It is over six months old. That is a stale check.',endorse:'The back is not endorsed.',payee:'It is made out to someone else.'};
  const finish=(acc,out)=>{const ok=(acc&&!flaw)||(!acc&&!!flaw);c.req.result={acc,ok};
    verdict(C,ok,out?'Too slow.':ok?(flaw?'Good catch!':'Good to go.'):(flaw?'Bad check!':'That check was fine.'),flaw?REASON[flaw]+(ok?'':` You accepted it, so the bank is out ${money(amt)}.`):(ok?'Date, payee, amounts, signature and endorsement all check out.':'Everything matched, and you sent a good customer away.'),'checks',done);};
  C.querySelectorAll('.choice').forEach(b=>b.onclick=()=>finish(b.dataset.a==='1'));timerBar(C,16,()=>finish(!!0,true));
}
/* TELLER 2: count out cash fast */
function jobCount(c,done){
  const need=c.req.amt;let sum=0,picked=[];
  const C=openModal(`<div class="jobhead"><span class="eyebrow">Teller Window</span><h2>Cash withdrawal</h2><p>${esc(c.name)} needs <b>${money(need)}</b>. Count it out exactly.</p></div><div class="timer"><i></i></div>
  <div class="tray" id="tray"></div><div class="sumline"><span>Counted</span><b id="sum">$0</b><span>of ${money(need)}</span></div>
  <div class="bills">${[100,50,20,10,5,1].map(b=>`<button class="billbtn b${b}" data-b="${b}"><span>$${b}</span></button>`).join('')}</div>
  <div class="row2"><button class="btn" id="undo">Take one back</button></div><div class="after" hidden></div>`,{cls:'paper job'});
  const up=()=>{C.querySelector('#sum').textContent=money(sum);C.querySelector('#tray').innerHTML=picked.slice(-16).map((b,i)=>`<i class="minib b${b}" style="left:${i*22}px">$${b}</i>`).join('');};
  const end=(ok,out)=>{c.req.result={ok};verdict(C,ok,ok?'Exact!':out?'Line is backing up.':'Drawer is off.',ok?'Fast, exact counting is what keeps a teller line moving.':'Tellers balance their drawers at the end of every shift. Every dollar has to be right.',null,done);};
  C.querySelectorAll('.billbtn').forEach(b=>b.onclick=()=>{const v=+b.dataset.b;sum+=v;picked.push(v);sfx('tick');up();if(sum===need)end(true);else if(sum>need){end(false);}});
  C.querySelector('#undo').onclick=()=>{const v=picked.pop();if(v){sum-=v;up();}};timerBar(C,14,()=>end(false,true));
}
/* TELLER 3: add up a cash deposit */
function jobCash(c,done){
  const parts=[];let left=c.req.amt;[100,50,20,10,5,1].forEach(b=>{let n=Math.floor(left/b);if(n>0){if(n>7)n=7;parts.push([b,n]);left-=b*n;}});if(left)c.req.amt-=left;
  const real=c.req.amt,slip=c.req.short?real+pick([20,40,100]):real;
  const C=openModal(`<div class="jobhead"><span class="eyebrow">Teller Window</span><h2>Cash deposit</h2><p>${esc(c.name)}'s slip says <b>${money(slip)}</b>. Count the cash. Does it match?</p></div><div class="timer"><i></i></div>
  <div class="cashpile">${parts.map(([b,n])=>`<div><b>${n} ×</b><i class="minib b${b} big">$${b}</i></div>`).join('')}</div>
  <div class="row2"><button class="choice good" data-a="1" data-focus>✓ Matches, deposit it</button><button class="choice" data-a="0">✕ Slip is wrong</button></div><div class="after" hidden></div>`,{cls:'paper job'});
  const end=(m,out)=>{const ok=m===(slip===real);c.req.amt=real;c.req.result={ok};verdict(C,ok,ok?'Balanced.':out?'Too slow.':'Count again!',slip===real?`The cash really is ${money(real)}.`:`The cash is only ${money(real)}, not ${money(slip)}. Credit what is actually there.`,null,done);};
  C.querySelectorAll('.choice').forEach(b=>b.onclick=()=>end(b.dataset.a==='1'));timerBar(C,14,()=>end(!(slip===real),true));
}
/* NEW ACCOUNTS: match a goal to the right product */
function jobNew(c,done){
  const g=c.req.goal,open=Object.keys(PRODUCTS).filter(k=>(PRODUCTS[k].lvl||0)<=S.chapter);
  const C=openModal(`<div class="jobhead"><span class="eyebrow">New Accounts</span><h2>${esc(c.name)} sits down</h2></div>
  <div class="quote">"${esc(g.say)}"</div><p class="ask">Which account fits best?</p>
  <div class="prods">${open.map(k=>{const p=PRODUCTS[k];return `<button class="choice prod" data-k="${k}"><i>${p.icon}</i><b>${p.name}</b><span>${p.line}</span></button>`;}).join('')}</div><div class="after" hidden></div>`,{cls:'dark job'});
  C.querySelectorAll('.prod').forEach(b=>b.onclick=()=>{const k=b.dataset.k,best=k===g.best,ok=(g.ok||[]).includes(k);c.req.pick=k;c.req.fit=best?2:ok?1:0;b.classList.add(best?'on':ok?'meh':'no');
    verdict(C,best||ok,best?'Perfect fit.':ok?'That works, but there is a better fit.':'Wrong tool for this job.',g.why,g.lesson,done);});
}
/* LOAN DESK: underwrite a real file */
function gaugeHTML(sc){const p=(sc-300)/550*100,band=sc>=740?'Very good':sc>=670?'Good':sc>=580?'Fair':'Poor';return `<div class="gauge"><i style="left:${p}%"></i></div><div class="gl"><span>300</span><b>${sc} · ${band}</b><span>850</span></div>`;}
function jobLoan(c,done){
  const a=c.req.app,T=LOANS[a.type],apr=+(S.rates.loan+T.add).toFixed(2),pay=loanPay(a.amt,apr,a.term),payHi=loanPay(a.amt,apr+2,a.term),totalInt=pay*a.term-a.amt;
  const C=openModal(`<div class="jobhead"><span class="eyebrow">Loan Desk · Application</span><h2>${T.icon} ${T.name}: ${money(a.amt)}</h2><p>${esc(a.name)}, ${esc(a.job)}. ${T.what}</p></div>
  <div class="file"><div class="fl"><h4>Character</h4>${gaugeHTML(a.score)}<dl><dt>Late payments, 2 yrs</dt><dd>${a.late}</dd><dt>Years at job</dt><dd>${a.yrs}</dd></dl></div>
  <div class="fl"><h4>Capacity</h4><dl><dt>Monthly income</dt><dd>${money(a.income)}</dd><dt>Other debt payments</dt><dd>${money(a.debts)}</dd><dt>This loan's payment</dt><dd>${money(pay)}</dd></dl><div class="dti ${a.dti>43?'hot':a.dti>36?'warm':''}"><span>Debt-to-income</span><b>${a.dti}%</b></div></div>
  <div class="fl"><h4>Capital &amp; Collateral</h4><dl><dt>Down payment</dt><dd>${a.down?a.down+'%':'None'}</dd><dt>If they stop paying</dt><dd>We recover about ${Math.round(T.recov*100)}%</dd></dl></div>
  <div class="fl"><h4>This loan</h4><dl><dt>Term</dt><dd>${a.term>=24?(a.term/12)+' years':a.term+' months'}</dd><dt>Your standard APR</dt><dd>${pct(apr,2)}</dd><dt>Total interest paid</dt><dd>${money(totalInt)}</dd></dl></div></div>
  <div class="row3"><button class="choice good" data-a="approve" data-focus>Approve<small>${pct(apr,2)} APR · ${money(pay)}/mo</small></button><button class="choice warm" data-a="price">Approve, higher rate<small>${pct(apr+2,2)} APR · ${money(payHi)}/mo</small></button><button class="choice" data-a="deny">Deny<small>Tell them why</small></button></div><div class="after" hidden></div>`,{cls:'paper job wide'});
  C.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{const v=b.dataset.a,g=goodCall(a);c.req.decision=v;c.req.grade=g;let good,h,t;
    if(v==='deny'){good=g==='deny';h=good?'Smart no.':'You turned away a solid borrower.';t=good?`A ${a.dti}% debt-to-income and a ${a.score} score make this likely to fail, and a failed loan hurts ${esc(a.name.split(' ')[0])} too. Saying no can be the kind choice.`:'No loan means no interest income. This file could have worked.';}
    else if(g==='deny'){good=false;h='Dangerous loan.';t=`The payment is more than this borrower can handle. A higher rate does not fix that. Watch for it on your statements.`;}
    else if(v==='price'&&g==='approve'){good=false;h='Overcharged.';t='This is a strong borrower. Charging them more is how you lose them to Bolt Savings, and it is not fair pricing.';}
    else if(v==='approve'&&g==='price'){good=true;h='Approved, but thin.';t='This file carries extra risk. Many banks would price that risk with a higher rate. That is risk-based pricing.';}
    else{good=true;h=v==='price'?'Well priced.':'Solid loan.';t=v==='price'?'Some risk, so you charged more for it. That is exactly risk-based pricing.':`Good score, a payment they can carry, and ${T.recov>=.5?'collateral behind it':'a steady record'}.`;}
    verdict(C,good,h,t,pick(['fivec','dti','score','pricing',T.recov>=.5?'collateral':'total']),done);});
}
/* FRAUD LAB */
function jobFraud(al,done){
  if(al.kind==='phish'){const p=al.d;const C=openModal(`<div class="jobhead"><span class="eyebrow">Fraud Lab</span><h2>A customer got this. Scam or real?</h2></div><div class="phone"><small>${esc(p.from)}</small><p>${esc(p.m)}</p></div><div class="row2"><button class="choice warm" data-a="1" data-focus>🎣 It's a scam</button><button class="choice good" data-a="0">✓ It's real</button></div><div class="after" hidden></div>`,{cls:'dark job'});
    C.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{const said=b.dataset.a==='1',ok=said===!!p.scam;al.ok=ok;verdict(C,ok,ok?'Nailed it.':'Careful!',p.why,'phish',done);});return;}
  const d=al.d;const C=openModal(`<div class="jobhead"><span class="eyebrow">Fraud Lab</span><h2>Card alert: ${esc(d.who)}</h2><p>Lives in ${d.home}. Look at the pattern.</p></div><table class="tx">${d.rows.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${money(r[2],2)}</td></tr>`).join('')}</table><div class="row2"><button class="choice warm" data-a="1" data-focus>🧊 Freeze card</button><button class="choice good" data-a="0">✓ Looks normal</button></div><div class="after" hidden></div>`,{cls:'dark job'});
  C.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{const said=b.dataset.a==='1',ok=said===!!d.bad;al.ok=ok;verdict(C,ok,ok?'Good read.':'Missed it.',d.why,'rege',done);});
}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
