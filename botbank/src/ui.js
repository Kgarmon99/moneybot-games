/* =====================================================================
   BOTBANK · screens: HUD, boardroom panels, statements, exams
   ===================================================================== */
function sponsorLine(cls){return `<div class="spons ${cls||''}"><span>Presented by</span>${SPONSOR.logo?`<img src="${SPONSOR.logo}" alt="${SPONSOR.name}">`:`<b>${SPONSOR.name}</b>`}<em>${SPONSOR.place}</em></div>`;}
function renderHUD(){if(!S)return;
  const set=(i,v)=>{const e=$(i);if(e&&e.textContent!==v)e.textContent=v;};
  set('#hCash',short(S.cash));set('#hDep',short(depositsTotal(S)));set('#hLoans',short(loansTotal(S)));set('#hCap',pct(capRatio(S),1));
  $('#sCash').classList.toggle('warn',S.cash<Math.max(5000,depositsTotal(S)*.05));
  $('#hStars').style.setProperty('--f',stars(S)/5*100+'%');
  const y=Math.floor((S.month-1)/12)+1;set('#hDate',MONTHS[(S.month-1)%12]+', Year '+y);
  const m=9*60+(S.clock||0)*8*60,h=Math.floor(m/60),mm=Math.floor(m/60*0+m%60/10)*10;set('#hClock',S.phase==='day'?`${h>12?h-12:h}:${String(mm).padStart(2,'0')} ${h>=12?'PM':'AM'}`:'Closed');
  $('#clockFill').style.width=(S.phase==='day'?S.clock*100:0)+'%';
  $$('#speed button').forEach(b=>b.classList.toggle('on',+b.dataset.sp===S.speed));
  $('#open').hidden=!(S.phase==='board')||modalOpen();$('#speed').hidden=S.phase!=='day';
  renderGoals();
  const up=$('[data-p=build] i');if(up){const n=BUILD.filter(b=>canBuild(b)&&S.cash>=b.cost&&capOK(S,b.cost)).length;up.hidden=!n;up.textContent=n;}
  const pb=$('[data-p=playbook] i');if(pb){pb.hidden=!G.newCards;pb.textContent=G.newCards;}
}
function renderGoals(){if(S.season){const k='s'+S.month+'_'+Math.round(SEASONS.find(x=>x.id===S.season).score(S));if(renderGoals.k===k)return;renderGoals.k=k;$('#goals').innerHTML=seasonGoals();return;}const ch=CHAPTERS[Math.min(S.chapter,CHAPTERS.length-1)],k=ch.goals.map(g=>{const n=g.n(S);return g.id+Math.round(Math.min(1,n/g.max)*40);}).join();if(renderGoals.k===k+S.chapter)return;renderGoals.k=k+S.chapter;
  $('#goals').innerHTML=`<div class="gh"><img src="${MB_ASSETS.badges[ch.badge]}" alt=""><div><small>Chapter ${Math.min(S.chapter+1,5)} of 5</small><b>${ch.name}</b></div></div>${ch.goals.map(g=>{const n=Math.min(g.max,g.n(S)),done=S.goals[g.id];return `<div class="g ${done?'done':''}"><span>${done?'✓':'○'} ${g.text}</span>${!done&&g.max>1?`<em><u style="width:${n/g.max*100}%"></u></em><small>${g.money?short(n)+' / '+short(g.max):Math.floor(n)+' / '+g.max}</small>`:''}</div>`;}).join('')}`;}
function toast(html,type){const el=document.createElement('div');el.className='toast '+(type||'');el.innerHTML=html;const T=$('#toasts');T.appendChild(el);while(T.children.length>3)T.firstChild.remove();setTimeout(()=>{el.style.opacity=0;setTimeout(()=>el.remove(),400);},3800);}
let advT=null;
function advise(html,dur){say(html);$('#advText').innerHTML=html;$('#advisor').classList.remove('hide');clearTimeout(advT);advT=setTimeout(()=>$('#advisor').classList.add('hide'),dur||9000);}
function floatAt(x,y,z,t,c){if(G.floor)return;const p=project(x,y,z);if(!p.on)return;const e=document.createElement('div');e.className='floaty';e.textContent=t;e.style.left=p.x+'px';e.style.top=p.y+'px';e.style.color=c||'#39E75F';$('#pins').appendChild(e);setTimeout(()=>e.remove(),1100);}
function coinFly(x,y,z){const p=project(x,y,z),e=document.createElement('img');e.className='flycoin';e.src=MB_ASSETS.coinGold;e.style.left=p.x+'px';e.style.top=p.y+'px';document.body.appendChild(e);requestAnimationFrame(()=>{const b=$('#sCash').getBoundingClientRect();e.style.transform=`translate(${b.left+30-p.x}px,${b.top+12-p.y}px) scale(.5)`;e.style.opacity=.2;});setTimeout(()=>e.remove(),720);}

/* ----- panels ----- */
const PANELS={rates:panelRates,team:panelTeam,build:panelBuild,books:panelBooks,playbook:panelPlaybook,phone:panelPhone};
function openPanel(k){if(k==='rates')learn('apy');if(k==='phone')learn('autosave');if(k==='playbook')G.newCards=0;const wasDay=S.phase==='day';G.curP=k;try{PANELS[k]();}finally{G.curP=null;}sfx('open');}
function head(eye,title,sub){const k=G.curP;return `<button class="x" aria-label="Close" onclick="closeModal()"><svg><use href="#i-x"/></svg></button><div class="ph">${k?`<span class="hico ti-${k}"><svg><use href="#i-${k}"/></svg></span>`:''}<div class="eyebrow">${eye}</div></div><h2>${title}</h2>${sub?`<p class="sub">${sub}</p>`:''}`;}
function slider(id,label,val,min,max,step,mk,note){return `<div class="sl"><label for="${id}"><span>${label}</span><b id="${id}V">${pct(val,2)}</b></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"><small>${note}: <b>${pct(mk,2)}</b></small></div>`;}
function spreadSVG(){const r=S.rates,max=Math.max(12,r.loan+1),x=v=>v/max*100;return `<div class="spread"><div class="bar"><i class="pay" style="width:${x(r.sav)}%"></i><i class="gap" style="left:${x(r.sav)}%;width:${x(Math.max(0,r.loan-r.sav))}%"><span>${pct(spread(S),2)} spread</span></i></div><div class="lab"><span>You pay savers ${pct(r.sav,2)}</span><span>You charge borrowers ${pct(r.loan,2)}</span></div></div>`;}
function panelRates(){const mk=mktRates(S),r=S.rates;
  const C=openModal(`${head('The Boardroom','Set your rates','This is the most important screen in banking. Pay savers less than you charge borrowers, but not so far off that everyone leaves for Bolt Savings.')}
  <div id="spr">${spreadSVG()}</div><div class="fedchip">🦅 Federal Reserve rate <b>${pct(S.fed,2)}</b><span>${S.econ>1.1?'· Economy is weak':S.econ<.95?'· Economy is hot':''}</span></div>${rivalChips()}
  ${slider('rSav','Savings APY',r.sav,0,6,.05,mk.sav,'Bot City average')}${slider('rCd','1-Year CD APY',r.cd,0,8,.05,mk.cd,'Bot City average')}${slider('rLoan','Base loan APR',r.loan,3,16,.05,mk.loan,'Bot City average')}
  <h3>Credit standards</h3><div class="seg" id="segStd">${[['tight','Tight','Fewer loans, fewer losses'],['balanced','Balanced','The usual'],['loose','Loose','More loans, more losses']].map(([k,n,t])=>`<button data-v="${k}" class="${S.standard===k?'on':''}"><b>${n}</b><small>${t}</small></button>`).join('')}</div>
  <h3>Monthly checking fee</h3><div class="seg" id="segFee">${[0,3,6,10].map(v=>`<button data-v="${v}" class="${S.fee===v?'on':''}"><b>${v?'$'+v:'Free'}</b></button>`).join('')}</div>
  <h3>Marketing budget</h3><div class="seg" id="segMkt">${MKT_COST.map((v,i)=>`<button data-v="${i}" class="${S.marketing===i?'on':''}"><b>${v?money(v)+'/mo':'None'}</b></button>`).join('')}</div>
  <div class="mact"><button class="btn pri" onclick="closeModal()" data-focus>Done</button></div>`,{cls:'dark panel',close:1});
  [['rSav','sav'],['rCd','cd'],['rLoan','loan']].forEach(([id,k])=>{const e=C.querySelector('#'+id);e.oninput=()=>{S.rates[k]=+e.value;C.querySelector('#'+id+'V').textContent=pct(+e.value,2);C.querySelector('#spr').innerHTML=spreadSVG();save();};});
  const seg=(id,fn)=>C.querySelectorAll(id+' button').forEach(b=>b.onclick=()=>{fn(b.dataset.v);C.querySelectorAll(id+' button').forEach(x=>x.classList.toggle('on',x===b));sfx('tick');save();if(id==='#segFee'&&+b.dataset.v)learn('fees');});
  seg('#segStd',v=>S.standard=v);seg('#segFee',v=>S.fee=+v);seg('#segMkt',v=>S.marketing=+v);
}
function refreshCands(){G.cands=Object.keys(ROLES).filter(k=>(ROLES[k].lvl||0)<=S.chapter).flatMap(k=>{const sk=+rand(1.6,4.4).toFixed(1);return [{role:k,skill:sk,pay:roundTo(ROLES[k].pay*(.72+sk*.14),10),name:pick(NAMES1)+' '+pick(NAMES2)}];});}
function panelTeam(){if(!G.cands)refreshCands();
  const payLine=teamPay(S);
  const C=openModal(`${head('Human Resources','Your team',`Payroll: <b>${money(payLine)}</b> a month. Every bot is a bill, every month, busy or not. Morale ${Math.round(S.morale)}%.`)}
  ${S.staff.length?`<div class="list">${S.staff.map(b=>`<div class="rowc"><i>${ROLES[b.role].icon}</i><div><b>${esc(b.name)}</b><span>${ROLES[b.role].name} · Skill ${'★'.repeat(Math.round(b.skill))} · ${money(b.pay)}/mo</span></div><button class="btn sm" data-fire="${b.id}">Let go</button></div>`).join('')}</div>`:'<p class="hint">No staff yet. You are running every window yourself.</p>'}
  <h3>Candidates</h3><div class="list">${G.cands.map((c,i)=>{const n=staffOf(S,c.role).length,lim=c.role==='teller'?teller_count(S):c.role==='loan'&&!S.built.loanoffice?0:c.role==='fraud'&&!S.built.fraudlab?0:2,can=n<lim,fee=Math.round(c.pay*.6);return `<div class="rowc"><i>${ROLES[c.role].icon}</i><div><b>${esc(c.name)}</b><span>${ROLES[c.role].name} · Skill ${'★'.repeat(Math.round(c.skill))} · ${money(c.pay)}/mo</span><small>${ROLES[c.role].text}</small></div><button class="btn sm pri" data-hire="${i}" ${can&&S.cash>fee?'':'disabled'}>${can?'Hire · '+money(fee):c.role==='teller'?'Need a window':c.role==='loan'||c.role==='fraud'?'Build room first':'Team full'}</button></div>`;}).join('')}</div>
  <div class="mact"><button class="btn" id="newC">New candidates</button><button class="btn pri" onclick="closeModal()">Done</button></div>`,{cls:'dark panel',close:1});
  C.querySelectorAll('[data-hire]').forEach(b=>b.onclick=()=>{const c=G.cands[+b.dataset.hire],fee=Math.round(c.pay*.6);S.cash-=fee;S.ledger.other+=fee;S.staff.push({id:S.seq++,role:c.role,skill:c.skill,pay:c.pay,name:c.name});G.cands.splice(+b.dataset.hire,1);syncStaff();sfx('good');checkGoals();save();panelTeam();});
  C.querySelectorAll('[data-fire]').forEach(b=>b.onclick=()=>{S.staff=S.staff.filter(x=>x.id!=b.dataset.fire);syncStaff();S.morale=clamp(S.morale-6,0,100);save();panelTeam();});
  C.querySelector('#newC').onclick=()=>{refreshCands();panelTeam();};
}
function canBuild(b){return !S.built[b.id]&&(b.lvl||0)<=S.chapter&&(!b.need||S.built[b.need]);}
function panelBuild(){
  const list=BUILD.filter(b=>!S.built[b.id]);
  const C=openModal(`${head('Construction','Grow the bank',`Cash on hand: <b>${money(S.cash)}</b>. Capital ratio: <b>${pct(capRatio(S))}</b>. Building spends your cushion, so the board blocks anything that would drop it under ${MIN_BUILD_CAP}%.`)}
  <div class="grid">${list.map(b=>{const open=canBuild(b),safe=capOK(S,b.cost),afford=S.cash>=b.cost&&safe;return `<div class="bcard ${open?'':'lock'}"><i>${b.icon}</i><b>${b.name}</b><p>${b.text}</p><button class="btn sm ${open&&afford?'pri':''}" data-b="${b.id}" ${open&&afford?'':'disabled'}>${!open?'Unlocks in Chapter '+((b.lvl||0)+1):safe?money(b.cost):'Capital too low · '+money(b.cost)}</button></div>`;}).join('')||'<p>Everything is built. Look at this place.</p>'}</div><div class="mact"><button class="btn pri" onclick="closeModal()">Done</button></div>`,{cls:'dark panel wide',close:1});
  C.querySelectorAll('[data-b]').forEach(x=>x.onclick=()=>{const b=BUILD.find(q=>q.id===x.dataset.b);S.cash-=b.cost;S.ledger.build+=b.cost;S.built[b.id]=1;syncZones(S);sfx('win');confetti(60);toast(`<b>${b.icon} ${b.name}</b> is open!`);if(b.id==='trust')learn('trust');if(b.id==='community')learn('community');if(b.id==='digital')learn('phish');checkGoals();save();panelBuild();});
}
function panelBooks(){
  const a=[['Cash & reserves',S.cash],['Bonds',S.bonds],['Loans',loansTotal(S)]],l=[['Checking',S.chk],['Savings',S.sav],['CDs',S.cd],['Borrowed',S.debt]],eq=equity(S),A=assetsTotal(S)||1;
  const mv=bondValue(S)-S.bonds,h=S.hist.slice(-12);const max=Math.max(1,...h.map(r=>Math.abs(r.net)));
  const C=openModal(`${head('The Books','Balance sheet','Everything the bank owns on the left. Everything it owes on the right. The difference is capital: the cushion that protects depositors.')}
  <div class="tacct"><div><h4>Assets <em>what we own</em></h4>${a.map(r=>`<p><span>${r[0]}</span><b>${money(r[1])}</b></p>`).join('')}<p class="tot"><span>Total assets</span><b>${money(A)}</b></p></div>
  <div><h4>Liabilities <em>what we owe</em></h4>${l.map(r=>`<p><span>${r[0]}</span><b>${money(r[1])}</b></p>`).join('')}<p><span class="cap">Capital (ours)</span><b class="cap">${money(eq)}</b></p><p class="tot"><span>Total</span><b>${money(liabTotal(S)+eq)}</b></p></div></div>
  <div class="ratios"><div><small>Capital ratio</small><b>${pct(capRatio(S))}</b><span>Regulators want 5%+</span></div><div><small>Liquidity</small><b>${pct(liqRatio(S),0)}</b><span>Cash and bonds vs. deposits</span></div><div><small>Last month</small><b class="${h.length&&h[h.length-1].net<0?'neg':''}">${h.length?short(h[h.length-1].net):'—'}</b><span>Profit or loss</span></div></div>
  ${h.length?`<h3>Monthly profit</h3><div class="pl">${h.map(r=>`<i class="${r.net<0?'n':''}" style="height:${Math.max(3,Math.abs(r.net)/max*100)}%" title="${money(r.net)}"></i>`).join('')}</div>`:''}
  <h3>Treasury</h3><p class="hint">Extra cash earns about ${pct(Math.max(0,S.fed-.1),2)} at the Fed. Bonds pay about ${pct(S.fed+.9,2)}, but if rates rise, selling early means a loss.${S.bonds?` Your bonds are worth <b>${money(bondValue(S))}</b> today (${mv<0?'paper loss':'paper gain'} ${money(Math.abs(mv))}).`:''}</p>
  <div class="tre"><button class="btn sm" data-t="buy">Buy $50K bonds</button><button class="btn sm" data-t="sell" ${S.bonds?'':'disabled'}>Sell $50K bonds</button><button class="btn sm" data-t="bor">Borrow $50K from the Fed</button><button class="btn sm" data-t="rep" ${S.debt?'':'disabled'}>Repay $50K</button><button class="btn sm" data-t="cap" ${canRaise(S)?'':'disabled'} title="Open when your capital ratio is under 12%">Raise ${short(RAISE(S))} from investors</button></div>
  <div class="mact"><button class="btn pri" onclick="closeModal()" data-focus>Done</button></div>`,{cls:'dark panel wide',close:1});
  C.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{const t=b.dataset.t;if(t==='buy'){if(S.cash<50000)return toast('Not enough cash.','bad');buyBonds(S,50000);learn('bonds');}if(t==='sell')sellBonds(S,50000);if(t==='bor'){borrow(S,50000);learn('liquidity');}if(t==='rep')repay(S,50000);if(t==='cap'){const a=raiseCapital(S);toast(`<b>Investors bought in</b><br>${money(a)} of new capital, less a 4% fee. More cushion, more room to grow.`);}sfx('tick');save();panelBooks();});
}
function panelPlaybook(sel){const all=Object.keys(PLAYBOOK),got=all.filter(k=>S.playbook[k]);sel=sel||got[got.length-1];
  const P2=PLAYBOOK[sel];
  const C=openModal(`${head('The MoneyBot Playbook','Real moves for real life',`${got.length} of ${all.length} cards, ${Object.keys(LRN().mastered).length} mastered. The bank is a game. These are not.`)}
  <div class="pbw"><div class="pbl">${all.map(k=>{const on=S.playbook[k];return `<button class="pb ${on?'':'off'} ${k===sel?'on':''}" ${on?`data-k="${k}"`:'disabled'} title="${on?PLAYBOOK[k].t:'Keep playing to unlock'}"><i>${on?PLAYBOOK[k].i:'🔒'}</i><span>${on?PLAYBOOK[k].t:'Locked'}${LRN().mastered[k]?' ✓':''}</span></button>`;}).join('')}</div>
  <div class="pbd">${P2?`<div class="bigi">${P2.i}</div><h3 class="t">${P2.t}</h3><p>${P2.what}</p><div class="move"><b>Your move</b><p>${P2.you}</p></div>${LRN().mastered[sel]?'<p class="hint">✓ Mastered</p>':`<button class="btn sm pri" id="qc">Quick Check</button>`}`:''}</div></div>
  <div class="foot">${sponsorLine('sm')}<div class="mact"><button class="btn" id="stdB">Standards</button><button class="btn" id="rpB">Learning report</button><button class="btn" id="printPB">Copy my Playbook</button><button class="btn pri" onclick="closeModal()">Done</button></div></div>`,{cls:'dark panel wide',close:1});
  C.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>panelPlaybook(b.dataset.k));C.querySelector('#printPB').onclick=printPlaybook;C.querySelector('#rpB').onclick=copyReport;C.querySelector('#stdB').onclick=panelStandards;const qc=C.querySelector('#qc');if(qc)qc.onclick=()=>quickCheck(sel);
}
function playbookText(){const got=Object.keys(PLAYBOOK).filter(k=>S.playbook[k]);return `MY BANKING PLAYBOOK\n${S.name}, from BotBank, a MoneyBot game\nPresented by ${SPONSOR.name}, ${SPONSOR.place}\n\n`+got.map(k=>`${PLAYBOOK[k].t}\n${PLAYBOOK[k].what}\nMy move: ${PLAYBOOK[k].you}`).join('\n\n')+`\n\nGeneral education, not financial advice. BotBank is a game, not a real bank.`;}
function printPlaybook(){const t=playbookText(),ok=()=>toast('<b>Playbook copied</b><br>Paste it into a doc to keep or print it.'),box=()=>{const C=openModal(`${head('The MoneyBot Playbook','Copy your Playbook','Select all of this text and copy it into a doc.')}<textarea id="pbText" readonly rows="14" style="width:100%;font:14px/1.5 Inter,Arial,sans-serif;padding:12px;border-radius:10px"></textarea><div class="mact"><button class="btn pri" onclick="closeModal()" data-focus>Done</button></div>`,{cls:'dark panel',close:1}),e=C.querySelector('#pbText');e.value=t;e.select();};try{navigator.clipboard.writeText(t).then(ok,box);}catch(e){box();}}
function panelPhone(){const m=S.me;
  const C=openModal(`${head('Your BotPhone','My Money',`The vault is the bank's. This is <b>yours</b>. Your paycheck of ${money(m.pay)} lands by direct deposit every month.`)}
  <div class="meacct"><div class="ac"><small>My Checking</small><b>${money(m.chk)}</b></div><div class="ac sv"><small>My Savings · ${pct(S.rates.sav,2)} APY</small><b>${money(m.sav,2)}</b>${m.lastInt?`<span>+${money(m.lastInt,2)} interest last month</span>`:''}</div></div>
  <div class="sl"><label for="auto"><span>Auto-save from each paycheck</span><b id="autoV">${m.auto}%</b></label><input id="auto" type="range" min="0" max="50" step="5" value="${m.auto}"><small id="autoN"></small></div>
  <div class="tre"><button class="btn sm pri" id="lab">Open the Money Lab</button><button class="btn sm" data-m="s100">Move $100 to savings</button><button class="btn sm" data-m="c100">Move $100 to checking</button></div>
  <h3>President's Shop</h3><div class="grid">${SHOP.map(i=>{const own=m.owned[i.id],on=m[i.kind]===i.val;return `<div class="bcard shop"><b>${i.name}</b><button class="btn sm ${on?'pri':''}" data-s="${i.id}" ${!own&&m.chk<i.price?'disabled':''}>${on?'Wearing':own?'Wear':money(i.price)}</button></div>`;}).join('')}</div>
  <p class="hint">Buying from checking is your call. Savings grows only if you leave it alone. Rule of 72: at ${pct(S.rates.sav,2)}, money doubles in about ${S.rates.sav>0?Math.round(72/S.rates.sav):'∞'} years.</p>
  <div class="mact"><button class="btn pri" onclick="closeModal()" data-focus>Done</button></div>`,{cls:'dark panel',close:1});
  const note=()=>{const s=Math.round(m.pay*m.auto/100);C.querySelector('#autoN').textContent=`${money(s)} a month to savings, ${money(m.pay-s)} to checking.`;};note();
  C.querySelector('#lab').onclick=()=>panelLab();C.querySelector('#auto').oninput=e=>{m.auto=+e.target.value;C.querySelector('#autoV').textContent=m.auto+'%';note();save();};
  C.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{const k=b.dataset.m;if(k==='s100'&&m.chk>=100){m.chk-=100;m.sav+=100;}if(k==='c100'&&m.sav>=100){m.sav-=100;m.chk+=100;}save();panelPhone();});
  C.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{const i=SHOP.find(q=>q.id===b.dataset.s);if(!m.owned[i.id]){m.chk-=i.price;m.owned[i.id]=1;sfx('win');}m[i.kind]=m[i.kind]===i.val?null:i.val;dressPlayer();save();panelPhone();});
}

/* ----- monthly statement ----- */
function statementModal(rec,L,after){
  const line=(t,v,c)=>`<tr class="${c||''}"><td>${t}</td><td>${v<0?'('+money(-v)+')':money(v)}</td></tr>`;
  const inc=L.intLoans+L.intBonds+L.intCash,y=Math.floor((rec.month-1)/12)+1,cl=L.chargeList;
  const C=openModal(`<div class="st-head"><div><img src="${MB_ASSETS.logo}" alt="MoneyBot"><div><b>BOTBANK</b><small>Bot City · Powered by MoneyBot</small></div></div><div class="r"><small>Monthly statement</small><b>${MONTHS[(rec.month-1)%12]}, Year ${y}</b></div></div>
  <table class="ledger"><tbody><tr class="h"><td colspan="2">Money coming in</td></tr>${line('Interest from borrowers',L.intLoans)}${L.intBonds?line('Interest from bonds',L.intBonds):''}${line('Interest on cash at the Fed',L.intCash)}${L.fees?line('Account fees',L.fees):''}${L.trust?line('Trust department fees',L.trust):''}
  <tr class="h"><td colspan="2">Money going out</td></tr>${line('Interest paid to savers',-L.intDep)}${L.intDebt?line('Interest on borrowed money',-L.intDebt):''}${line('Payroll',-L.pay)}${line('Rent and utilities',-L.rent)}${L.fdic?line('FDIC insurance premium',-L.fdic):''}${L.marketing?line('Marketing',-L.marketing):''}${L.other?line('Other spending',-L.other):''}${L.chargeoffs?line('Loans that went bad',-L.chargeoffs,'bad'):''}${L.bondLoss?line('Loss selling bonds',-L.bondLoss,'bad'):''}
  <tr class="net ${rec.net<0?'neg':''}"><td>${rec.net<0?'Net loss':'Net profit'}</td><td>${rec.net<0?'('+money(-rec.net)+')':money(rec.net)}</td></tr>${L.build?line('Spent on construction',-L.build):''}</tbody></table>
  ${cl.length?`<div class="res bad"><b>Defaults:</b> ${cl.slice(0,3).map(c=>`${esc(c.name)} stopped paying a ${LOANS[c.type].name.toLowerCase()} (${money(c.loss)} lost).`).join(' ')}</div>`:''}
  <div class="ratios lite"><div><small>Total assets</small><b>${short(rec.assets)}</b></div><div><small>Capital</small><b>${pct(rec.cap)}</b></div><div><small>Margin</small><b>${pct(rec.nim,1)}</b></div></div>
  <p class="why">${stmtInsight(rec,L)}</p>
  <div class="st-foot">${sponsorLine('sm')}<button class="btn pri" id="stGo" data-focus>Continue</button></div>`,{cls:'paper stmt'});
  C.querySelector('#stGo').onclick=()=>{closeModal();after&&after();};
}
function stmtInsight(r,L){if(L.chargeoffs>L.intLoans)return 'Bad loans wiped out your interest income this month. A loan only makes money if it gets paid back.';if(r.net<0&&!loansTotal(S))return 'No loans yet, so almost nothing is earning. Build the Loan Office and put deposits to work.';if(r.net<0&&L.pay+L.rent>L.intLoans+L.intCash)return 'Your costs are bigger than your interest income. Grow the loan book or watch your payroll.';if(S.cash<depositsTotal(S)*.08)return 'Cash is getting low compared to deposits. One big withdrawal could sting. Consider keeping more on hand.';if(r.net>0)return 'Profit goes straight into capital. More capital means more room to safely grow.';return 'Keep building. Most new banks lose money before they make it.';}
const CAMELS={C:['Capital','Is there a big enough cushion?'],A:['Asset Quality','Are loans getting paid back?'],M:['Management','Are the rules being followed?'],E:['Earnings','Is the bank making money?'],L:['Liquidity','Is cash ready when people want it?'],S:['Sensitivity','Would a rate jump hurt?']};
function examModal(r,after){
  const T=['','Outstanding','Satisfactory','Fair','Marginal','Unsatisfactory'][r.total];
  const C=openModal(`<div class="eyebrow">Quarterly Bank Exam</div><h2>The Examiner Bot has finished</h2><p class="sub">Real regulators grade banks with a system called CAMELS. 1 is best. 5 is worst.</p>
  <div class="camels">${'CAMELS'.split('').map(k=>`<div class="cm g${r[k]}"><b>${r[k]}</b><strong>${k}</strong><span>${CAMELS[k][0]}</span><small>${CAMELS[k][1]}</small></div>`).join('')}</div>
  <div class="comp g${r.total}"><span>Composite rating</span><b>${r.total}</b><em>${T}</em></div>
  <p class="why">${examTip(r)}</p><div class="mact"><button class="btn pri" id="exGo" data-focus>Back to the bank</button></div>`,{cls:'dark panel'});
  C.querySelector('#exGo').onclick=()=>{closeModal();after&&after();};
}
function examTip(r){const worst=Object.keys(CAMELS).sort((a,b)=>r[b]-r[a])[0],T={C:'Your capital is thin. Earn more, spend less, or slow your growth.',A:'Too many bad loans. Tighten your standards and train your officers.',M:'Hire a Compliance Bot and say yes to the boring paperwork. It pays off.',E:'Earnings are the weak spot. Check your spread, and put idle cash to work in loans.',L:'Keep more cash and bonds on hand. Depositors can ask for their money any time.',S:'Lots of long, fixed-rate assets. If rates jump, you are stuck earning the old rate.'};return r[worst]<=1?'A clean exam. The examiners barely had coffee.':'Examiner\'s note: '+T[worst];}

/* ----- confetti + sound ----- */
let confParts=[];
function confetti(n){const cols=['#39E75F','#F4C542','#F8FAFC','#14935C'];for(let i=0;i<(n||150);i++)confParts.push({x:innerWidth/2+rand(-80,80),y:innerHeight*.3,vx:rand(-7,7),vy:rand(-12,-3),r:rand(0,6),vr:rand(-.3,.3),c:pick(cols),l:1});}
function drawConfetti(){const c=$('#confetti');if(!confParts.length){if(c.dataset.on){c.getContext('2d').clearRect(0,0,c.width,c.height);delete c.dataset.on;}return;}c.dataset.on=1;const g=c.getContext('2d'),d=c.width/innerWidth;g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,innerWidth,innerHeight);confParts.forEach(p=>{p.vy+=.25;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.l-=.008;g.save();g.translate(p.x,p.y);g.rotate(p.r);g.globalAlpha=Math.max(0,p.l);g.fillStyle=p.c;g.fillRect(-4,-2.5,8,5);g.restore();});confParts=confParts.filter(p=>p.l>0&&p.y<innerHeight+20);}
let AC=null,muted=false;try{muted=localStorage.getItem('botbank-mute')==='1';}catch(e){}
function tone(f,d,type,vol,when,slide){if(!AC||muted)return;const t=AC.currentTime+(when||0),o=AC.createOscillator(),g=AC.createGain();o.type=type||'triangle';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);g.gain.setValueAtTime(vol||.05,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+.02);}
function sfx(k){if(!AC)return;if(k==='tick')tone(900,.05,'square',.02);if(k==='open')tone(520,.08,'sine',.03);if(k==='good'){tone(660,.1,'triangle',.05);tone(990,.14,'triangle',.05,.09);}if(k==='bad')tone(200,.24,'sawtooth',.035,0,120);if(k==='coin'){tone(1320,.06,'square',.018);tone(1760,.1,'square',.018,.06);}if(k==='win')[523,659,784,1047].forEach((f,i)=>tone(f,.2,'triangle',.05,i*.1));if(k==='bell'){tone(880,.5,'sine',.05);tone(1320,.6,'sine',.03,.02);}if(k==='alarm')[0,.3,.6].forEach(w=>tone(740,.2,'square',.03,w,520));}
