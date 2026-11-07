/* =====================================================================
   BOTBANK · game flow: the day, the month, chapters, the bank run
   ===================================================================== */
let S=null;const SAVE='botbank-save-v1';
const DAY_SEC=120;
const titleOn=()=>!$('#title').hidden;
function save(){if(!S)return;try{localStorage.setItem(SAVE,JSON.stringify(S));}catch(e){}}
function load(){try{const r=localStorage.getItem(SAVE);return r?JSON.parse(r):null;}catch(e){return null;}}
function learn(k){if(!S||S.playbook[k]||!PLAYBOOK[k])return;S.playbook[k]=1;G.newCards=(G.newCards||0)+1;toast(`<b>${PLAYBOOK[k].i} New Playbook card</b><br>${PLAYBOOK[k].t}`);save();}
function setSpeed(v){if(!S||S.phase!=='day')return;S.speed=v;renderHUD();}
function togglePause(){if(!S||S.phase!=='day')return;if(S.speed){G.lastSpeed=S.speed;S.speed=0;}else S.speed=G.lastSpeed||1;renderHUD();}

/* ----- starting a shift ----- */
function openDoors(){checkGoals();
  if(S.phase!=='board')return;S.phase='day';S.clock=0;S.speed=G.lastSpeed||1;G.spawnAt=[];G.windowsReset=0;
  G.win=TELLER_X.map((x,i)=>({busy:null,t:0,drawer:10}));G.desk.newacct={busy:null,t:0};G.desk.loan={busy:null,t:0};G.alerts=[];
  const n=arrivals(S);for(let i=0;i<n;i++)G.spawnAt.push(rand(.02,.9));G.spawnAt.sort((a,b)=>a-b);
  G.alertAt=S.built.fraudlab?[rand(.1,.4),rand(.45,.8)].concat(S.chapter>=4?[rand(.3,.9)]:[]).sort((a,b)=>a-b):[];
  /* the bank run: a scripted test in Chapter 4, or a real risk any time trust collapses */
  G.run=null;if(S.chapter===3)S.flags.ch3wait=(S.flags.ch3wait||0)+1;if((S.chapter===3&&!S.stats.runsSurvived&&(S.stats.fraudStopped>=2||S.flags.ch3wait>=3))||(S.chapter>=2&&depositsTotal(S)>80000&&(S.rep<22||liqRatio(S)<4)&&Math.random()<.5))startRun();
  sfx('bell');hideOpenHint();renderHUD();save();
}
function hideOpenHint(){$('#advisor').classList.add('hide');}
function startRun(){S.flags.ran=1;G.run={left:Math.min(14,Q.t>=2?14:10),at:.12,done:0,calmed:0,start:S.cash,bite:depositsTotal(S)*.045};G.spawnAt=G.spawnAt.filter((_,i)=>i%2);sfx('alarm');learn('run');runCine();
  queueModal(()=>{const C=openModal(`<div class="eyebrow alarm">Breaking news</div><h2>A rumor is racing through Bot City</h2><p class="sub">A viral post says BotBank is out of money. It is not true, but a crowd is coming. Deposits are loaned out, so you do not have enough cash to pay everyone at once. That is the danger of a bank run.</p><div class="res"><b>What you can do:</b> walk the line and press <b>E</b> to calm depositors: their money is FDIC insured. Keep drawers stocked. Open <b>Books</b> to borrow from the Fed if cash runs low.</div><div class="mact"><button class="btn pri" id="go" data-focus>Calm the crowd</button></div>`,{cls:'dark panel'});C.querySelector('#go').onclick=closeModal;});learn('fdic');}
function makeTellerReq(){const dep=depositsTotal(S),r=Math.random(),atm=S.built.atm?.55:1;
  if(dep>8000&&r<.3*atm)return {t:'withdraw',amt:ri(3,48)*5+ri(0,4)};
  if(r<.68){const fl=Math.random()<.34?pick(['amount','signature','stale','endorse','payee']):null;return {t:'check',amt:ri(6,190)*10+ri(0,9)*5,flaw:fl};}
  return {t:'deposit',amt:ri(4,70)*10+ri(0,9),short:Math.random()<.3};}
function spawnNext(){
  const loanOn=S.built.loanoffice,r=Math.random();let kind='teller';
  if(loanOn&&r<.2)kind='loan';else if(r<(loanOn?.5:.42))kind='newacct';
  if(kind==='teller')spawnCustomer('teller',makeTellerReq());
  else if(kind==='newacct'){const pool=GOALS.filter(g=>(g.lvl||0)<=S.chapter),g=pick(pool);spawnCustomer('newacct',{t:'newacct',goal:g});}
  else spawnCustomer('loan',{t:'loan',app:makeApplicant(S)});
}
/* ----- resolving customers ----- */
function payTeller(c,auto){const q=c.req,x=c.pos.x,z=c.pos.z,res=q.result;S.stats.served++;
  if(q.t==='withdraw'){const ok=auto?Math.random()<.9+skillNow('teller')*.02:res.ok;withdraw(S,q.amt);if(!ok){S.cash-=20;S.ledger.other+=20;}}
  else if(q.t==='deposit'){addDeposit(S,'chk',q.amt);}
  else if(q.t==='check'){const bad=!!q.flaw;let accept=auto?(!bad||Math.random()>.4+skillNow('teller')*.11):res.acc;
    if(auto&&bad&&!accept){S.stats.staffCatches=(S.stats.staffCatches||0)+1;}
    if(accept&&bad){const hit=Math.round(q.amt*(auto?.35:1));S.cash-=hit;S.ledger.other+=hit;floatAt(x,2,z,'Bad check -'+short(hit),'#FF7A73');S.compliance=clamp(S.compliance-1.5,0,100);}
    else if(accept){addDeposit(S,'chk',q.amt);}else if(!bad){S.rep=clamp(S.rep-.5,0,100);}}
  if(!auto&&res&&res.ok){S.rep=clamp(S.rep+.25,0,100);S.stats.handServed++;}
  floatAt(x,2.1,z,'+'+money(q.amt));coinFly(x,2,z);sfx('coin');dismiss(c,'happy');checkGoals();}
function payNew(c,auto){const q=c.req,g=q.goal;let k=q.pick,fit=q.fit;
  if(auto){const sk=skillNow('rep'),hit=Math.random()<.35+sk*.13;k=hit?g.best:(g.ok&&g.ok[0])||g.best;fit=hit?2:1;}
  if(fit===0){S.rep=clamp(S.rep-.8,0,100);dismiss(c,'mad');return;}
  const amt=Math.round(rand(g.amt[0],g.amt[1])*(fit===2?1:.55)*(1+S.chapter*.35)/10)*10,bk=PRODUCTS[k].book;addDeposit(S,bk,amt);S.accts[bk]=(S.accts[bk]||0)+1;S.stats.opened++;if(fit===2){S.rep=clamp(S.rep+.45,0,100);S.stats.goodFits++;}
  learn(k==='checking'?'checking':k==='savings'?'savings':g.lesson);floatAt(c.pos.x,2.1,c.pos.z,'+'+short(amt)+' deposit');coinFly(c.pos.x,2,c.pos.z);sfx('coin');dismiss(c,'happy');checkGoals();}
function payLoan(c,auto){const q=c.req,a=q.app;let v=q.decision;const g=goodCall(a);
  if(auto){const sk=skillNow('loan'),right=Math.random()<.42+sk*.12;v=right?g:pick(['approve','price','deny']);}
  if(v==='deny'){if(g==='deny')S.stats.goodDenies++;else S.rep=clamp(S.rep-.3,0,100);dismiss(c,g==='deny'?null:'mad');checkGoals();return;}
  if(S.cash<a.amt+2000){toast(`Not enough cash to fund ${esc(a.name)}'s loan. That is a liquidity problem.`,'warn');learn('liquidity');dismiss(c,'mad');return;}
  bookLoan(S,a,v==='price'?2:0);if(!auto&&g===v)S.rep=clamp(S.rep+.4,0,100);if(v==='price'&&g==='approve')S.rep=clamp(S.rep-.6,0,100);
  floatAt(c.pos.x,2.1,c.pos.z,'Loan '+short(a.amt),'#F4C542');sfx('coin');dismiss(c,'happy');checkGoals();}
const skillNow=r=>{const l=staffOf(S,r);return l.length?l.reduce((a,b)=>a+b.skill,0)/l.length:2;};
function gaveUp(c){S.stats.lost++;S.rep=clamp(S.rep-.8,0,100);floatAt(c.pos.x,2.1,c.pos.z,'Left angry','#FF7A73');dismiss(c,'mad');if(S.stats.lost===1)advise('Waiting too long costs you customers. <b>Hire a Teller Bot</b> when the line gets long.');}
/* run customers pull real money */
function payRun(c){const g=G.run,amt=g?g.bite:0;const got=withdraw(S,amt);if(g)g.done++;floatAt(c.pos.x,2.1,c.pos.z,'-'+short(got),'#FF7A73');sfx('bad');dismiss(c,null);}

/* ----- the shift ----- */
function tellers(){return staffOf(S,'teller');}
function callToWindow(c,i){leaveQueue(c);c.state='toSpot';c.spot=V(TELLER_X[i],0,-3.85);c.path=[];c.face=Math.PI;G.win[i].busy=c;setBubble(c.rig.bub2,null);}
function tickDay(dt){
  S.clock+=dt/DAY_SEC*(G.run&&G.run.left>0?.55:1);
  while(G.spawnAt.length&&G.spawnAt[0]<=S.clock){G.spawnAt.shift();spawnNext();}
  if(G.alertAt&&G.alertAt.length&&G.alertAt[0]<=S.clock){G.alertAt.shift();G.alerts.push({kind:Math.random()<.55?'phish':'card',d:pick(Math.random()<.55?PHISH:CARDFRAUD),age:0});G.alerts[G.alerts.length-1].kind=G.alerts[G.alerts.length-1].d.m?'phish':'card';sfx('alarm');toast('🕵️ New alert in the <b>Fraud Lab</b>','warn');}
  /* run crowd */
  if(G.run&&G.run.left>0&&S.clock>=G.run.at){G.run.at+=.022;const c=spawnCustomer('run',{t:'run'});if(c){G.run.left--;c.patience=999;c.req.run=1;}}
  /* teller windows */
  const n=teller_count(S),tl=tellers();
  for(let i=0;i<n;i++){const w=G.win[i],op=tl[i];
    if(!w.busy&&op&&G.q.teller.length){const head=G.q.teller.find(c=>c.state==='queue');if(head&&head.qi===0&&!(w.drawer<=0&&(head.req.t==='withdraw'||head.req.t==='run')))callToWindow(head,i);}
    if(w.busy&&w.busy.state==='atSpot'&&op&&!w.player){w.t+=dt;const need=(w.busy.kind==='run'?2.2:6.4-op.skill*.9)*(S.morale<35?1.3:1);if(w.t>=need){const c=w.busy;w.busy=null;w.t=0;if(c.kind==='run'){w.drawer=Math.max(0,w.drawer-1);payRun(c);}else{if(c.req.t==='withdraw')w.drawer=Math.max(0,w.drawer-1);payTeller(c,true);}}}
  }
  /* desks */
  [['newacct','rep',payNew,7],['loan','loan',payLoan,10]].forEach(([k,role,pay,base])=>{const d=G.desk[k],op=staffOf(S,role)[0],q=G.q[k],spot=k==='newacct'?world.stationSpots.newacct:world.stationSpots.loan;
    if(!d.busy&&op&&q.length&&q[0].state==='queue'){const c=q[0];leaveQueue(c);c.state='toSpot';c.spot=V(spot.x,0,spot.z);c.face=Math.PI;c.path=[];d.busy=c;}
    if(d.busy&&d.busy.state==='atSpot'&&op&&!d.player){d.t+=dt;if(d.t>=base-op.skill){const c=d.busy;d.busy=null;d.t=0;pay(c,true);}}});
  /* vault teller keeps drawers full */
  G.vtimer=(G.vtimer||0)+dt;if(staffOf(S,'vault').length&&G.vtimer>7){G.vtimer=0;const w=G.win.slice(0,n).sort((a,b)=>a.drawer-b.drawer)[0];w.drawer=10;}
  /* fraud lab */
  if(G.alerts.length){const an=staffOf(S,'fraud')[0];G.alerts.forEach(a=>a.age+=dt);if(an&&G.alerts[0].age>12-an.skill*1.6){const a=G.alerts.shift();if(Math.random()<.5+an.skill*.1){S.stats.fraudStopped++;}else missFraud();checkGoals();}else{const old=G.alerts[0];if(old&&old.age>30){G.alerts.shift();missFraud();}}}
  if(S.clock>=1)closeBusiness();
}
function missFraud(){const loss=ri(6,30)*100;S.cash-=loss;S.ledger.other+=loss;S.stats.fraudMissed++;S.rep=clamp(S.rep-1.2,0,100);toast(`Fraud got through. The bank covered ${money(loss)}.`,'bad');}
function closeBusiness(){
  S.phase='closing';S.speed=1;G.spawnAt=[];sfx('bell');
  /* anyone still waiting gets a polite good night, and tomorrow they come back */
  G.cust.slice().forEach(c=>{if(c.state!=='leave')dismiss(c,null);});
  G.win.forEach(w=>{w.busy=null;});G.desk.newacct.busy=G.desk.loan.busy=null;
  if(G.run){if(G.run.done+G.run.calmed>0){S.stats.runsSurvived++;learn('fdic');G.runWon={calmed:G.run.calmed,done:G.run.done};}G.run=null;}
  setTimeout(monthEnd,900);
}
function monthEnd(){
  /* an overdrawn bank has to borrow from the Fed's discount window */
  if(S.cash<0){const need=-S.cash+2000;borrow(S,need);S.compliance=clamp(S.compliance-8,0,100);learn('liquidity');toast(`Cash went negative. You borrowed ${money(need)} from the Fed.`,'bad');}
  const L=S.ledger,rec=closeMonth(S);if(rec.net>0&&!S.flags.firstProfit){S.flags.firstProfit=1;confetti(120);sfx('win');}
  S.phase='board';checkGoals();const quarter=S.month%3===0;
  if(S.cash<0){const need=-S.cash+2000;borrow(S,need);}
  statementModal(rec,L,()=>{
    if(failed(S)){failModal();return;}
    freshMonth(S);S.cash=S.cash;scheduleCards();
    if(quarter){const r=exam(S);S.checkpoint=null;const cp=JSON.stringify(S);try{localStorage.setItem(SAVE+'-q',cp);}catch(e){}examModal(r,afterMonth);}else afterMonth();});
  syncPiles(S);renderHUD();save();
}
const SCHEDULE={1:'bank',2:'fdic',3:'compound',4:'debit',5:'teens',6:'fed',7:'choose',8:'overdraft',9:'accounts',10:'digital',11:'inflation',12:'report',13:'cardterms',14:'payday',15:'hardship',16:'regulators',17:'idtheft'};
function scheduleCards(){const k=SCHEDULE[S.month];if(k)learn(k);}
function afterMonth(){if(S.season&&seasonTick())return;runFollowups();
  if(G.runWon){const w=G.runWon;G.runWon=null;confetti(170);sfx('win');queueModal(()=>{const C=openModal(`<div class="eyebrow">Crisis over</div><h2>The doors stayed open</h2><p class="sub">You calmed ${w.calmed} depositors and paid out ${w.done}. Trust stopped the panic. That is the reason FDIC insurance exists: insured savers do not need to race to the door.</p><div class="mact"><button class="btn pri" id="ok" data-focus>Back to work</button></div>`,{cls:'dark panel'});C.querySelector('#ok').onclick=closeModal;S.rep=clamp(S.rep+6,0,100);});}
  if(S.month>=S.nextEvent)queueModal(runEvent);
  queueModal(()=>{});if(modalOpen())return;
  onModalsDone();
}
function onModalsDone(){if(!S||S.phase!=='board'||modalOpen())return;renderHUD();save();boardTip();}
function boardTip(){
  if(S.month===1&&!S.flags.t1)return;
  if(S.flags.tipM===S.month)return;S.flags.tipM=S.month;
  if(S.month===2)advise('Month 2. Open the <b>Rates</b> panel and look at the spread. Then check <b>Build</b>: the Loan Office is how a bank really earns money.',14000);
  else advise(pick(TIPS),11000);
}
function runEvent(){
  const pool=EVENTS.filter(e=>(!S.lastEvent[e.id]||S.month-S.lastEvent[e.id]>9)&&e.when(S));if(!pool.length){S.nextEvent=S.month+1;return onModalsDone();}
  const e=pick(pool);S.lastEvent[e.id]=S.month;{const gp=evGap();S.nextEvent=S.month+ri(gp[0],gp[1]);}
  if(e.run)return SPECIAL[e.run]();
  const C=openModal(`<div class="eyebrow">A decision for the president</div><h2>${e.title}</h2><p class="sub">${typeof e.text==='function'?e.text(S):e.text}</p><div class="stackb">${e.choices.map((c,i)=>`<button class="choice" data-i="${i}">${esc(c.t)}</button>`).join('')}</div><div class="after" hidden></div>`,{cls:'dark panel job'});
  C.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{const c=e.choices[+b.dataset.i];c.fx(S);b.classList.add('on');verdict(C,true,'',c.r,e.lesson,()=>{});});
}
const SPECIAL={
  fedup(){const d=pick([.25,.5,.75]);S.fed=+(S.fed+d).toFixed(2);newsCard('🦅 The Fed raises rates',`The Federal Reserve lifted its rate by ${pct(d,2)} to ${pct(S.fed,2)}. Savers will want more. New loans can charge more. Old fixed-rate loans and bonds now look worse.`,'fed',S.bonds?'bonds':null);},
  feddown(){const d=pick([.25,.5]);S.fed=+(S.fed-d).toFixed(2);newsCard('🦅 The Fed cuts rates',`The Federal Reserve lowered its rate by ${pct(d,2)} to ${pct(S.fed,2)}. Borrowing gets cheaper across Bot City. Check whether your rates still make sense.`,'fed');},
  recession(){S.econ=1.7;S.econLeft=6;newsCard('📉 Recession hits Bot City','Factories slow down and more bots lose jobs. Loan defaults will rise for about six months. Banks with strong capital and careful loans get through this.','pricing');},
  boom(){S.econ=.8;S.econLeft=6;newsCard('📈 Bot City is booming','Jobs are everywhere, and borrowers are paying on time. Be careful: good times are when banks get sloppy.','total');}
};
function newsCard(t,x,a,b){const C=openModal(`<div class="eyebrow">Bot City News</div><h2>${t}</h2><p class="sub">${x}</p><div class="mact"><button class="btn" id="r">Review my rates</button><button class="btn pri" id="ok" data-focus>Got it</button></div>`,{cls:'dark panel'});C.querySelector('#ok').onclick=closeModal;C.querySelector('#r').onclick=()=>{closeModal();setTimeout(panelRates,150);};a&&learn(a);b&&learn(b);}
function failModal(){const C=openModal(`<div class="eyebrow alarm">Friday, 5:00 PM</div><h2>The FDIC has closed BotBank</h2><p class="sub">Your capital ran out, so regulators stepped in. This is how real bank failures work: they usually happen on a Friday, and by Monday customers can reach their insured money, often at a new bank. Depositors were protected. Owners were not.</p><p class="why">${stmtInsight(S.hist[S.hist.length-1]||{},S.ledger)}</p><div class="mact"><button class="btn pri" id="re" data-focus>Reopen with new investors</button><button class="btn" id="fresh">Start over</button></div>`,{cls:'dark panel'});learn('fdic');
  C.querySelector('#re').onclick=()=>{let cp=null;try{cp=localStorage.getItem(SAVE+'-q');}catch(e){}closeModal();if(cp){S=JSON.parse(cp);S.phase='board';const inj=Math.max(150000,Math.round(assetsTotal(S)*.08));S.cash+=inj;S.startCapital+=inj;S.rep=clamp(S.rep-10,0,100);if(S.ledger)S.ledger=blankLedger();resumeWorld();const M=openModal(`<div class="eyebrow">Second chance</div><h2>Investors saved BotBank</h2><p class="sub">New owners put in <b>${money(inj)}</b> of fresh capital. This is called a recapitalization. Your reputation took a hit, and it is on you to fix what went wrong.</p><div class="mact"><button class="btn pri" id="ok" data-focus>Back to work</button></div>`,{cls:'dark panel'});M.querySelector('#ok').onclick=closeModal;}else startNew(S.name);};C.querySelector('#fresh').onclick=()=>{closeModal();startNew(S.name);};}

/* ----- chapters ----- */
function checkGoals(){if(!S||S.season)return;const ch=CHAPTERS[S.chapter];if(!ch)return;if(G.chExam&&!modalOpen()&&!MODALQ.length)G.chExam=0;ch.goals.forEach(g=>{if(!S.goals[g.id]&&g.n(S)>=g.max){S.goals[g.id]=1;toast(`<b>✓ Goal done</b><br>${g.text}`);sfx('good');if(g.id==='loanoffice')advise('Loan Office open. Hire a <b>Loan Officer Bot</b> to run the lending pipeline, or work the desk yourself.');}});
  if(ch.goals.every(g=>S.goals[g.id])&&!G.chExam){G.chExam=1;const done=S.chapter;queueModal(()=>chapterExam(done,()=>chapterDone(done)));}}
function chapterDone(i){S.chapter=i+1;G.chExam=0;confetti(200);sfx('win');const ch=CHAPTERS[i],nx=CHAPTERS[i+1];G.cands=null;
  if(!nx)return winGame();
  chapterCine(i);
  const unlocked=[].concat(BUILD.filter(b=>b.lvl===i+1).map(b=>b.icon+' '+b.name),Object.values(ROLES).filter(r=>r.lvl===i+1).map(r=>r.icon+' '+r.name));
  const C=openModal(`<div class="chap"><img src="${MB_ASSETS.badges[ch.badge]}" alt=""><div class="eyebrow">Chapter ${i+1} complete</div><h2>${ch.name}</h2></div><div class="chapn"><div class="eyebrow">Up next</div><h3 class="t">Chapter ${i+2}: ${nx.name}</h3><p>${nx.intro}</p>${unlocked.length?`<div class="chips">${unlocked.map(u=>`<span>${u}</span>`).join('')}</div>`:''}</div><div class="mact"><button class="btn pri" id="ok" data-focus>Keep going</button></div>`,{cls:'dark panel'});C.querySelector('#ok').onclick=closeModal;save();renderHUD();}
function winGame(){postTest(showCert);}
function showCert(){const n=Object.keys(S.playbook).length,tot=Object.keys(PLAYBOOK).length,L=LRN();
  const C=openModal(`<div class="cert"><img class="wm" src="${MB_ASSETS.logo}" alt="MoneyBot"><div class="eyebrow">Bot City names you</div><h2>Bank of the Year</h2><p class="nm">${esc(S.name)}</p><p>completed BotBank, ran a full community bank, and earned ${n} of ${tot} Playbook cards.</p>${L.post!=null?`<p class="grow">${L.pre!=null?`Warm-up <b>${L.pre} of ${CHECKUP.length}</b> → Final Check <b>${L.post} of ${CHECKUP.length}</b>`:`Final Check <b>${L.post} of ${CHECKUP.length}</b>`}</p>`:''}<div class="sig2"><div><b>MoneyBot</b><small>Head of Everything</small></div>${sponsorLine('sm')}</div></div><div class="mact"><button class="btn" id="pr">Copy my Playbook</button><button class="btn" id="rp">Copy learning report</button><button class="btn pri" id="ok" data-focus>Keep running my bank</button></div>`,{cls:'paper stmt'});C.querySelector('#ok').onclick=closeModal;C.querySelector('#pr').onclick=printPlaybook;C.querySelector('#rp').onclick=copyReport;S.flags.won=1;save();}

/* ----- the action button ----- */
function nearest(){
  if(G.floor)return floorNearest();
  if(Math.hypot(P.pos.x-STAIR.ax,P.pos.z-STAIR.az)<1.4)return {t:'Take the stairs',f:panelStairs};
  const px=P.pos.x,pz=P.pos.z,near=(x,z,r)=>Math.hypot(px-x,pz-z)<r,day=S.phase==='day';
  if(G.run&&near(0,3,20)&&G.cust.some(c=>c.kind==='run'&&c.state!=='leave'&&c.state!=='atSpot'&&Math.hypot(c.pos.x-px,c.pos.z-pz)<3.6))return {t:'Calm the crowd',f:shout};
  if(near(0,-9.5,3.8))return day?(G.carry?{t:'Carrying cash',f:null}:{t:'Grab a cash bag',f:()=>{G.carry=true;sfx('tick');}}):{t:'Vault is locked until morning',f:null};
  if(pz>-8&&pz<-1.8&&Math.abs(px)<8.4){const n=teller_count(S);let best=-1,bd=99;for(let i=0;i<n;i++){const d=Math.abs(px-TELLER_X[i]);if(d<bd){bd=d;best=i;}}
    if(best>=0&&bd<2.2){const w=G.win[best]||{};if(G.carry&&w.drawer<10)return {t:`Refill Window ${best+1} drawer`,f:()=>{w.drawer=10;G.carry=false;floatAt(TELLER_X[best],2,-5,'Drawer full');sfx('coin');}};
      if(!day)return null;const head=G.q.teller.find(c=>c.state==='queue'||c.state==='walk');if(w.busy&&w.busy.state==='atSpot'&&tellers()[best])return {t:'Teller Bot is on it',f:null};if(head)return {t:'Serve next customer',f:()=>serveTeller(best,head)};}}
  if(near(-11.5,6.3,3.6)&&day&&G.q.newacct[0]&&!G.desk.newacct.busy)return {t:'Open an account',f:()=>{const c=G.q.newacct[0];leaveQueue(c);c.state='toSpot';c.spot=V(-11.5,0,7.3);c.path=[];c.face=Math.PI;jobNew(c,()=>payNew(c,false));}};
  if(S.built.loanoffice&&near(-11.5,-2.7,3.8)&&day&&G.q.loan[0]&&!G.desk.loan.busy)return {t:'Review the application',f:()=>{const c=G.q.loan[0];leaveQueue(c);c.state='toSpot';c.spot=V(-11.5,0,-1.7);c.path=[];c.face=Math.PI;jobLoan(c,()=>payLoan(c,false));}};
  if(S.built.fraudlab&&near(-11.5,-8,3.4)&&G.alerts.length)return {t:'Work the alert',f:()=>{const a=G.alerts.shift();jobFraud(a,()=>{if(a.ok){S.stats.fraudStopped++;S.rep=clamp(S.rep+.6,0,100);}else missFraud();checkGoals();});}};
  if(near(4.2,6,2.6))return {t:'Talk to MoneyBot',f:()=>{rigPlay(world.mascot,'Wave',true);advise(pick(TIPS),8000);}};
  if(near(ELEV.x-1.2,ELEV.z,2.2))return {t:'Take the elevator',f:panelElevator};
  return null;
}
function serveTeller(i,c){const w=G.win[i];if(!w)return;if((c.req.t==='withdraw'||c.req.t==='run')&&w.drawer<=0){toast('This drawer is out of cash. Grab a bag from the vault.','warn');return;}
  leaveQueue(c);c.state='toSpot';c.spot=V(TELLER_X[i],0,-3.85);c.path=[];c.face=Math.PI;w.busy=c;w.player=true;
  const end=()=>{w.busy=null;w.player=false;w.t=0;};
  if(c.kind==='run'){const g=G.run;w.drawer=Math.max(0,w.drawer-1);end();payRun(c);return;}
  const f=c.req.t==='check'?jobCheck:c.req.t==='withdraw'?jobCount:jobCash;
  if(c.req.t==='withdraw')w.drawer=Math.max(0,w.drawer-1);
  f(c,()=>{end();payTeller(c,false);});}
function shout(){if(G.shout>0)return;G.shout=1.4;let n=0;G.cust.slice().forEach(c=>{if(n<3&&c.kind==='run'&&c.state!=='leave'&&c.state!=='atSpot'&&Math.hypot(c.pos.x-P.pos.x,c.pos.z-P.pos.z)<4.2){n++;if(G.run)G.run.calmed++;floatAt(c.pos.x,2.1,c.pos.z,'FDIC insured','#39E75F');dismiss(c,'happy');}});if(n){sfx('good');rigPlay(P.rig,'Cheer',true);}}
function doAction(){const a=nearest();if(a&&a.f)a.f();}
function updatePrompt(){const a=!modalOpen()&&!titleOn()?nearest():null,el=$('#act');if(a){el.hidden=false;el.querySelector('span').textContent=a.t;el.classList.toggle('dim',!a.f);}else el.hidden=true;
  /* pins over stations */
  const day=S.phase==='day',n=teller_count(S),ppl=[['teller',0,3.6,COUNTER_Z,G.q.teller.length,tellers().length,'Tellers'],['newacct',-11.5,3.2,6,G.q.newacct.length,staffOf(S,'rep').length,'New Accounts'],['loan',-11.5,3.2,-3,G.q.loan.length,staffOf(S,'loan').length,'Loans'],['fraud',-11.5,3.2,-9,G.alerts.length,staffOf(S,'fraud').length,'Alerts']];
  ppl.forEach(([k,x,y,z,q,st,lab])=>{const el=PINS[k],show=day&&q>0&&!modalOpen();el.hidden=!show;if(show){const p=project(x,y+.9,z);el.style.transform=`translate(${p.x}px,${p.y}px) translate(-50%,-100%)`;el.textContent=`${lab}: ${q} ${st?'':'· no bot here!'}`;el.classList.toggle('alert',!st);}});
  const low=day?G.win.slice(0,n).findIndex(w=>w.drawer<=2):-1;const d=PINS.drawer;d.hidden=!(low>=0)||modalOpen();if(low>=0&&!modalOpen()){const p=project(TELLER_X[low],3,COUNTER_Z);d.style.transform=`translate(${p.x}px,${p.y}px) translate(-50%,-100%)`;d.textContent='Drawer low: bring cash';}
}
const PINS={};
/* ----- title + boot ----- */
function bindUI(){
  $('#open').onclick=()=>{if(!AC)initAudio();openDoors();};
  $$('#dock button').forEach(b=>b.onclick=()=>openPanel(b.dataset.p));
  $$('#speed button').forEach(b=>b.onclick=()=>{const v=+b.dataset.sp;if(v===0)togglePause();else setSpeed(v);});
  $('#act').onclick=doAction;$('#street').onclick=()=>{camS.street=!camS.street;$('#street').classList.toggle('on',camS.street);if(!camS.street)world.facade.visible=false;sfx('tick');};$('#voice').classList.toggle('off',!VOICE_ON);$('#voice').onclick=()=>{VOICE_ON=!VOICE_ON;try{localStorage.setItem('botbank-voice',VOICE_ON?'1':'0');}catch(e){}$('#voice').classList.toggle('off',!VOICE_ON);if(VOICE_ON)say('Narrator on.');else hush();};$('#cineSkip').onclick=endCine;$('#floorsB').onclick=()=>{if(!S||modalOpen()||titleOn()||CINE.on)return;sfx('open');panelElevator();};$('#mute').onclick=()=>{muted=!muted;if(muted)hush();try{localStorage.setItem('botbank-mute',muted?'1':'0');}catch(e){}$('#mute').classList.toggle('off',muted);};$('#mute').classList.toggle('off',muted);
  ['teller','newacct','loan','fraud','drawer'].forEach(k=>{const e=document.createElement('div');e.className='pin';e.hidden=true;$('#pins').appendChild(e);PINS[k]=e;});
  $('#btnSeason').onclick=()=>{initAudio();panelSeasons();};$('#btnNew').onclick=()=>{initAudio();$('#modeSeg').innerHTML=Object.keys(MODES).map(k=>`<button data-m="${k}" class="${(G.pickMode||'pres')===k?'on':''}"><b>${MODES[k].name}</b><small>${MODES[k].sub}</small></button>`).join('');$('#modeSeg').querySelectorAll('button').forEach(b=>b.onclick=()=>{G.pickMode=b.dataset.m;$('#modeSeg').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));});$('#btnSeason').hidden=true;$('#setup').hidden=false;$('#btnNew').hidden=true;$('#btnCont').hidden=true;$('#btnGo').hidden=false;$('#pname').focus();};
  $('#btnGo').onclick=()=>startNew(($('#pname').value||'').trim().slice(0,18)||'President Bot');
  $('#pname').onkeydown=e=>{if(e.key==='Enter')$('#btnGo').click();};
  $('#btnCont').onclick=()=>{initAudio();S=load();if(S.phase!=='board')S.phase='board';S.speed=0;enterGame();resumeWorld();};
}
function initAudio(){if(AC)return;try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}startMusic();}
function resumeWorld(){G.cust.slice().forEach(freeCust);G.q={teller:[],newacct:[],loan:[]};G.cands=null;syncZones(S);syncStaff();syncPiles(S);dressPlayer();renderGoals.k=null;renderHUD();}
function startNew(name){S=newBank(name);applyMode(S,G.pickMode||'pres');S.flags.t1=1;enterGame();resumeWorld();learn('bank');save();if(!G.seasonStart)introCine();
  const C=openModal(`<div class="welcome"><img src="${MB_ASSETS.logo}" alt="MoneyBot"><div class="eyebrow">Welcome, ${esc(S.name)}</div><h2>You run the bank now</h2><p>Bot City needs a bank it can trust, and you just got the charter. You start with <b>${money(S.cash)}</b> of capital. Nobody has deposited a dime yet.</p><p>${CHAPTERS[0].intro}</p></div><div class="mact"><button class="btn pri" id="ok" data-focus>Let's go</button></div>`,{cls:'dark panel'});if(!G.seasonStart)MODALQ.push(preTest);C.querySelector('#ok').onclick=()=>{closeModal();advise(`Move with <b>${TOUCH?'the stick':'WASD'}</b>${TOUCH?'':', or click the floor'}. Hit <b>Open the Doors</b> when you are ready. Customers will walk in. Walk to the teller counter and press <b>${TOUCH?'the action button':'E'}</b> to help them.`,20000);};}
function enterGame(){$('#title').hidden=true;document.body.classList.remove('titling');camS.title=false;camS.pos.set(0,15,25);camS.look.set(0,1,6);P.pos.set(0,0,8.4);P.ry=Math.PI;camS.street=false;world.facade.visible=false;P.rig.root.visible=true;resetFloor();}
async function boot(){
  const bar=$('#loadfill');bar.style.width='20%';
  initThree();setupMaterials();bar.style.width='35%';buildWorld();
  floorsInit();await new Promise(r=>setTimeout(r,30));
  const [h,c]=await Promise.all([parseGLB(MB_ASSETS.hero),parseGLB(MB_ASSETS.crowd)]);const clips=emoteClips();h.animations.push(...clips);c.animations.push(...clips.map(x=>x.clone()));GLTF.hero=h;GLTF.crowd=c;bar.style.width='75%';
  buildPlayer();buildMascot();initInput();bindUI();P.rig.root.visible=false;
  S=newBank('');syncZones(S);Object.keys(world.zones).forEach(k=>{if(k.startsWith('mark_'))world.zones[k].visible=false;});syncPiles({cash:900000});S=null;
  /* a few bots out front for the title shot */
  for(let i=0;i<5;i++){const r=makeRig(GLTF.crowd,pick(MB.tints),1.42);r.root.position.set(-9+i*4.4,.0,14+rand(-1,2));r.root.rotation.y=rand(-.6,.6)+Math.PI;scene.add(r.root);(world.titleBots=world.titleBots||[]).push(r);}
  renderer.compile(scene,camera);bar.style.width='100%';
  $('#btnNew').disabled=false;$('#btnNew').textContent='New Bank';if(load()){$('#btnCont').hidden=false;}$('#btnSeason').hidden=false;
  $('#loadbar').style.visibility='hidden';
  camera.position.set(-16,7.5,36);camS.look.set(-2,6.4,BD);
  requestAnimationFrame(frame);
}
const clock=new THREE.Clock();let frames=0,slowT=0;
function frame(){
  requestAnimationFrame(frame);const dt=Math.min(.05,clock.getDelta()),t=clock.elapsedTime;
  if(document.hidden)return;
  if(S&&!titleOn()){
    const paused=modalOpen()||CINE.on;const mul=paused?0:(S.phase==='day'?(S.speed||0):0);
    if(world.titleBots){world.titleBots.forEach(r=>{scene.remove(r.root);});world.titleBots=null;}
    if(S.phase==='day'&&mul>0)tickDay(dt*mul);
    if(G.shout>0)G.shout-=dt;
    updatePlayer(dt,t);updateCustomers(dt,mul>0?dt*mul:(S.phase==='closing'?dt:0),t);updateStaff(dt,t);updatePrompt();
    world.mascot&&(world.mascot.mixer.update(dt));
    if((frames++%20)===0){renderHUD();syncPiles(S);}
    if(S.phase==='closing'&&G.cust.length===0&&0){}
  }else if(world.titleBots){world.titleBots.forEach(r=>r.mixer.update(dt));world.mascot&&world.mascot.mixer.update(dt);}
  updateWorld(dt,t,S&&S.phase==='day');updateCamera(dt,t);updateLook(dt,t);renderFrame(t);drawConfetti();
  /* auto-downshift on slow machines */
  if(dt>=.049){slowT+=dt;if(slowT>6&&Q.t>=2){Q.t=1;dropPost();renderer.setPixelRatio(1);slowT=0;}if(slowT>10&&Q.t===1){Q.t=0;sun.castShadow=false;renderer.shadowMap.autoUpdate=false;}}else slowT=Math.max(0,slowT-dt*.5);
}
window.addEventListener('DOMContentLoaded',()=>{$('#titleHero').src=MB_ASSETS.logo;$('#hudLogo').src=MB_ASSETS.logo;$('#advFace').src=MB_ASSETS.badges.icon||MB_ASSETS.logo;$('#titleSpons').innerHTML=sponsorLine();if(TOUCH)document.body.classList.add('touch');boot().catch(e=>{console.error(e);$('#btnNew').textContent='Could not start. Try another browser.';});});
