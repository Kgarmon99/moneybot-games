/* =====================================================================
   BOTBANK · replay: difficulty modes, Seasons (one-year scenarios with
   stars and best scores) and random city events whose choices come
   back months later.
   ===================================================================== */
const MODES={
 intern:{name:'Intern',sub:'More cash, fewer surprises',cash:600000,rep:50,pd:.7,gap:[3,4]},
 pres:{name:'President',sub:'The standard game',cash:400000,rep:40,pd:1,gap:[2,3]},
 iron:{name:'Iron Vault',sub:'Less cash, riskier loans, more events',cash:280000,rep:30,pd:1.35,gap:[1,2]}};
function applyMode(s,m){const M=MODES[m]||MODES.pres;s.mode=m in MODES?m:'pres';s.cash=M.cash;s.startCapital=M.cash;s.rep=M.rep;s.pdMul=M.pd;}
const evGap=()=>S.evGap||(MODES[S.mode]||MODES.pres).gap;

/* ---------- Seasons: twelve months, one big lesson, up to three stars ---------- */
const yearProfit=s=>equity(s)-s.startCapital;
const SEASONS=[
 {id:'opening',name:'Grand Opening Rush',icon:'🎉',diff:'Easy',blurb:'Bot City has no bank yet. Grow as fast as you safely can.',goal:'Reach $600K in deposits by the end of the year.',teach:'Deposits are what a bank lends out. Good rates, a good reputation and good service bring them in.',setup:s=>{s.rep=55;},label:'Deposits',score:s=>depositsTotal(s),fmt:v=>money(Math.round(v)),stars:[300000,450000,600000]},
 {id:'housing',name:'Housing Boom',icon:'🏠',diff:'Medium',blurb:'Home prices are soaring and everyone wants a mortgage. Booms do not last forever.',goal:'Survive the bust and finish the year with a profit.',teach:'In a boom, loans look safe because everyone can pay. Careful banks keep lending standards tight so the bust does not sink them.',setup:s=>{s.econ=.72;s.econLeft=8;},label:'Profit for the year',score:yearProfit,fmt:v=>money(Math.round(v)),stars:[0,40000,90000],
  script:{5:()=>['🏠 Home prices hit a record','Bots are lining up for mortgages. Lenders across Bot City are loosening their standards to keep up. Will you?','collateral'],9:s=>{s.econ=1.9;s.econLeft=4;return ['📉 The housing bubble pops','Home prices fell 20% in a month. Bots who borrowed too much are falling behind, and defaults will climb for a few months.','collateral'];}}},
 {id:'recession',name:'Recession Year',icon:'📉',diff:'Hard',blurb:'Bot City factories are slowing down. Defaults will climb for most of the year.',goal:'Finish the year with a capital ratio of 8% or more.',teach:'Capital is the cushion that absorbs loan losses. Banks that kept a thick cushion and lent carefully make it through recessions.',setup:s=>{s.econ=1.6;s.econLeft=10;s.fed=2.5;s.prevFed=2.5;},label:'Capital ratio',score:s=>capRatio(s),fmt:v=>pct(v),stars:[6,8,11],
  script:{4:s=>{s.fed=1.75;return ['🦅 The Fed cuts rates','To help the economy, the Fed lowered its rate to 1.75%. Borrowing gets cheaper and savers earn less.','fed'];},8:()=>['🏭 Layoffs at the gear plant','Two hundred bots lost their jobs. Expect more late payments for a few months.','hardship'],11:s=>{s.econ=1;s.econLeft=0;return ['🌤️ The recovery begins','Hiring is picking up again. The banks that survived are ready to grow.','fed'];}}},
 {id:'rateshock',name:'Rate Shock',icon:'🦅',diff:'Hard',blurb:'Rates start near zero. Then the Fed raises them again and again to fight inflation.',goal:'Keep your capital ratio at 8% or more through the year.',teach:'When rates rise fast, savers want more interest and older bonds lose value. Banks that matched their rates to the market kept their savers.',setup:s=>{s.fed=.75;s.prevFed=.75;s.rates={sav:.4,cd:.8,loan:5.5};},label:'Capital ratio',score:s=>capRatio(s),fmt:v=>pct(v),stars:[6,8,10],
  script:{3:s=>hike(s,.75),5:s=>hike(s,.75),7:s=>hike(s,.75),9:s=>hike(s,.75),11:s=>hike(s,.5)}},
 {id:'scams',name:'Scam Season',icon:'🛡️',diff:'Medium',blurb:'A scam ring is targeting Bot City. Every few weeks brings a new trick.',goal:'Finish the year with a reputation of 60 or more.',teach:'Scams work by rushing people and asking for secrets. Banks that warn customers and act fast keep their trust.',setup:s=>{s.built.fraudlab=1;},label:'Reputation',score:s=>s.rep,fmt:v=>Math.round(v)+' / 100',stars:[45,60,75],
  script:{2:()=>({ev:'scamwave'}),5:()=>({ev:'phishcall'}),8:()=>({ev:'fakeapp'}),11:()=>({ev:'scamwave'})}}];
function hike(s,d){s.fed=+(s.fed+d).toFixed(2);return [`🦅 The Fed raises rates to ${pct(s.fed,2)}`,`Prices are rising fast, so the Federal Reserve raised its rate by ${pct(d,2)}. Savers will expect more, and the bonds you already own just lost some value.`,'bonds'];}
const SBEST=()=>{try{return JSON.parse(localStorage.getItem('botbank-seasons')||'{}');}catch(e){return {};}};
function starsFor(se,v){return se.stars.filter(t=>v>=t).length;}
const starStr=n=>'★'.repeat(n)+'☆'.repeat(3-n);
function panelSeasons(){const B=SBEST();const C=openModal(`${head('Seasons','Pick a year to survive','Twelve months. One big challenge. Earn up to three stars, then try to beat your best.')}<div class="seasons">${SEASONS.map(se=>{const b=B[se.id];return `<button class="season" data-s="${se.id}"><i>${se.icon}</i><span><b>${se.name}</b><small>${se.blurb}</small><em>Goal: ${se.goal}</em></span><span class="sr"><u class="d${se.diff[0]}">${se.diff}</u><s>${b?starStr(b.stars):'☆☆☆'}</s>${b?`<small>Best: ${se.fmt(b.best)}</small>`:''}</span></button>`;}).join('')}</div>
  <div class="mode"><b>Difficulty</b><div class="seg" id="sMode">${Object.keys(MODES).map(k=>`<button data-m="${k}" class="${(G.pickMode||'pres')===k?'on':''}" title="${MODES[k].sub}">${MODES[k].name}</button>`).join('')}</div></div>`,{cls:'dark panel wide',close:1});
  C.querySelectorAll('#sMode button').forEach(b=>b.onclick=()=>{G.pickMode=b.dataset.m;C.querySelectorAll('#sMode button').forEach(x=>x.classList.toggle('on',x===b));});
  C.querySelectorAll('.season').forEach(b=>b.onclick=()=>{closeModal();startSeason(b.dataset.s);});}
function startSeason(id){const se=SEASONS.find(x=>x.id===id);initAudio();G.seasonStart=1;const nm=(($('#pname')&&$('#pname').value)||'').trim().slice(0,18)||(S&&S.name)||'President Bot';
  startNew(nm);G.seasonStart=0;S.season=id;S.chapter=2;S.evGap=[1,2];se.setup(S);S.startCapital=equity(S);syncZones(S);renderGoals.k=null;renderHUD();save();
  MODALQ.push(()=>{const C=openModal(`<div class="eyebrow">Season · ${se.diff} · ${MODES[S.mode].name}</div><h2>${se.icon} ${se.name}</h2><p class="sub">${se.blurb}</p><div class="res"><b>Your goal:</b> ${se.goal}</div><p class="hint">Stars: ${se.stars.map((t,i)=>`${'★'.repeat(i+1)} ${se.fmt(t)}`).join(' · ')}</p><div class="mact"><button class="btn pri" id="ok" data-focus>Start the year</button></div>`,{cls:'dark panel'});C.querySelector('#ok').onclick=closeModal;});}
/* runs at the top of every new month; returns true when the season is over */
function seasonTick(){if(!S.season)return false;const se=SEASONS.find(x=>x.id===S.season);if(!se)return false;
  if(S.month>12){seasonEnd(se);return true;}
  const f=se.script&&se.script[S.month];if(f&&!S.flags['ss'+S.month]){S.flags['ss'+S.month]=1;const r=f(S);if(r&&r.ev)queueModal(()=>forceEvent(r.ev));else if(r)queueModal(()=>newsCard(r[0],r[1],r[2]));}
  return false;}
function seasonEnd(se){const v=se.score(S),st=starsFor(se,v),B=SBEST(),prev=B[se.id],nb=!prev||v>prev.best;if(nb)B[se.id]={best:v,stars:Math.max(st,prev?prev.stars:0)};else if(st>prev.stars)B[se.id].stars=st;try{localStorage.setItem('botbank-seasons',JSON.stringify(B));}catch(e){}
  confetti(st*80+40);sfx(st>=2?'win':'good');say(`Season complete. ${st} star${st===1?'':'s'}.`);
  const C=openModal(`<div class="eyebrow">Season complete · ${MODES[S.mode].name}</div><h2>${se.icon} ${se.name}</h2><p class="stars">${starStr(st)}</p><div class="ratios lite"><div><small>${se.label}</small><b>${se.fmt(v)}</b></div><div><small>Your best</small><b>${se.fmt(nb?v:prev.best)}</b></div><div><small>Goal</small><b>${st>=2?'Met':'Missed'}</b></div></div>${nb&&prev?'<p class="hint">New best score!</p>':''}<div class="res"><b>What this year teaches.</b> ${se.teach}</div><div class="mact"><button class="btn" id="kp">Keep running this bank</button><button class="btn" id="ot">Other seasons</button><button class="btn pri" id="ag" data-focus>Play again</button></div>`,{cls:'dark panel'});
  C.querySelector('#ag').onclick=()=>{closeModal();startSeason(se.id);};C.querySelector('#ot').onclick=()=>{closeModal();panelSeasons();};C.querySelector('#kp').onclick=()=>{S.season=null;S.evGap=null;closeModal();renderGoals.k=null;save();onModalsDone();};}
function seasonGoals(){const se=SEASONS.find(x=>x.id===S.season),v=se.score(S),st=starsFor(se,v),left=Math.max(0,13-S.month);
  return `<div class="gh"><i class="sicon">${se.icon}</i><div><small>Season · ${left} month${left===1?'':'s'} left</small><b>${se.name}</b></div></div><div class="g"><span>${se.goal}</span></div><div class="g"><span>${se.label}: <b>${se.fmt(v)}</b></span><small>${starStr(st)}</small></div>`;}

/* ---------- more city events, some with consequences later ---------- */
function later(s,m,id){(s.follow=s.follow||[]).push({m:s.month+m,id});}
const FOLLOW={
 storm:s=>{s.cash-=15000;s.ledger.chargeoffs+=15000;return ['🧊 Storm loans went bad','Borrowers who got late fees after the ice storm fell further behind. You charged off $15,000. A short payment pause would have cost less.','hardship'];},
 factory:s=>{if(Math.random()<.55){s.cash+=34000;s.ledger.fees+=34000;s.rep=clamp(s.rep+3,0,100);return ['🏭 GearWorks is booming','The new factory is running and the loan is paying. You earned $34,000 in interest and fees. Big loans pay big when they work.','fivec'];}s.cash-=90000;s.ledger.chargeoffs+=90000;return ['🏭 GearWorks hit trouble','Orders dried up and GearWorks missed payments. You charged off $90,000. Putting too much money into one borrower is called concentration risk.','fivec'];},
 share:s=>{s.cash+=14000;s.ledger.fees+=14000;return ['🤝 The shared loan paid off','Your half of the GearWorks loan earned $14,000. Sharing a big loan with another lender means smaller profits, but smaller risks too.','fivec'];},
 students:s=>{addDeposit(s,'sav',9000);s.accts.sav=(s.accts.sav||0)+20;s.rep=clamp(s.rep+3,0,100);return ['🎓 Your money class paid off','Twenty Bot City High students opened their first savings accounts. Teaching people about money builds customers for life.','teens'];},
 fintech:s=>{addDeposit(s,'chk',45000);return ['📲 App users found you','The budgeting app brought $45,000 in new checking deposits. Digital banking reaches bots who never visit a branch.','digital'];}};
function runFollowups(){if(!S.follow||!S.follow.length)return;const due=S.follow.filter(f=>f.m<=S.month);S.follow=S.follow.filter(f=>f.m>S.month);due.forEach(f=>{const r=FOLLOW[f.id]&&FOLLOW[f.id](S);if(r)queueModal(()=>newsCard(r[0],r[1],r[2]));});}
EVENTS.push(
 {id:'festival',when:s=>s.month>=3,title:'Bot City Festival',lesson:'community',text:()=>'The Bot City Festival is this weekend, and 5,000 bots will be there. A booth costs $4,000.',choices:[
  {t:'Run a booth ($4,000)',r:'Bots signed up for savings accounts at your booth, bringing in $25,000 in deposits. Showing up in your community builds trust.',fx:s=>{s.cash-=4000;s.ledger.other+=4000;addDeposit(s,'sav',25000);s.rep=clamp(s.rep+5,0,100);}},
  {t:'Skip it',r:'You kept the $4,000. Bolt Savings ran a booth instead and signed up the new customers.',fx:s=>{s.rep=clamp(s.rep-1,0,100);}}]},
 {id:'icestorm',when:s=>s.month>=4&&s.loans.length>0,title:'An ice storm',lesson:'hardship',text:()=>'An ice storm shut down the gear plant for two weeks. Some of your borrowers will be short on their payments this month.',choices:[
  {t:'Offer a one-month payment pause',r:'You gave up $3,000 in interest, and those borrowers stayed on track. Helping people through a short crisis keeps loans from going bad.',fx:s=>{s.cash-=3000;s.ledger.other+=3000;s.rep=clamp(s.rep+7,0,100);}},
  {t:'Charge late fees as usual',r:'You collected $2,500 in late fees this month. Bots noticed, and some borrowers are now further behind. This could come back to you.',fx:s=>{s.cash+=2500;s.ledger.fees+=2500;s.rep=clamp(s.rep-6,0,100);later(s,2,'storm');}}]},
 {id:'factory',when:s=>s.built.loanoffice&&s.month>=6&&s.cash>200000,title:'The biggest loan ever',lesson:'fivec',text:()=>'GearWorks wants a $250,000 loan to build a new factory. It would be the biggest loan BotBank has ever made.',choices:[
  {t:'Lend the whole amount',r:'Big loan, big reward, and big risk if GearWorks struggles. You will find out in a few months.',fx:s=>{later(s,4,'factory');}},
  {t:'Share it with CogCo Credit Union',r:'You split the loan with another lender. That is called a loan participation: less profit, much less risk.',fx:s=>{later(s,4,'share');}},
  {t:'Turn it down',r:'No risk, and no reward. GearWorks will bank somewhere else.',fx:s=>{s.rep=clamp(s.rep-2,0,100);}}]},
 {id:'viral',when:s=>s.month>=4,title:'You went viral',lesson:'liquidity',text:()=>'A popular bot streamer posted about your accounts. $120,000 in new checking deposits is landing this week.',choices:[
  {t:'Keep most of it as cash',r:'Smart. Money that arrives fast can leave fast. Keeping it ready means you can pay it back out.',fx:s=>{addDeposit(s,'chk',120000);}},
  {t:'Plan to lend it all out',r:'More loans mean more interest, but if these new customers leave, you might come up short on cash.',fx:s=>{addDeposit(s,'chk',120000);s.flags.hot=(s.flags.hot||0)+90000;}}]},
 {id:'outage',when:s=>s.month>=3,title:'Debit cards are down',lesson:'debit',text:()=>'The card network went down for six hours. Bots could not pay with their BotBank debit cards, and some got charged fees.',choices:[
  {t:'Post updates and refund the fees ($1,500)',r:'Being honest and fixing it fast kept customers on your side.',fx:s=>{s.cash-=1500;s.ledger.other+=1500;s.rep=clamp(s.rep+5,0,100);}},
  {t:'Stay quiet until it is fixed',r:'Customers were left guessing, and many complained. Silence during a problem costs trust.',fx:s=>{s.rep=clamp(s.rep-7,0,100);}}]},
 {id:'school',when:s=>s.month>=2,title:'A call from Bot City High',lesson:'teens',text:()=>'Bot City High asks if one of your bankers can teach a money class for teenagers.',choices:[
  {t:'Send a teller to teach',r:'Your teller taught saving, checking and credit. Teaching is how banks build customers for life.',fx:s=>{s.rep=clamp(s.rep+4,0,100);later(s,5,'students');}},
  {t:'We are too busy',r:'Fair enough, but Bolt Savings said yes.',fx:s=>{}}]},
 {id:'cdleave',when:s=>s.month>=5&&s.cd>20000,title:'A CD is maturing',lesson:'cd',text:s=>`A customer's ${money(Math.min(40000,Math.round(s.cd)))} CD just matured. CogCo Credit Union is offering half a percent more.`,choices:[
  {t:'Match the rate',r:'You kept the customer. Keeping a good customer usually costs less than finding a new one.',fx:s=>{s.cash-=200;s.ledger.other+=200;s.rep=clamp(s.rep+2,0,100);}},
  {t:'Let it go',r:'The money moved to CogCo. Savers shop for the best rate, and that is competition working.',fx:s=>{const a=Math.min(40000,s.cd);s.cd-=a;s.cash-=a;}}]},
 {id:'counterfeit',when:s=>s.month>=2,title:'Something feels off',lesson:null,text:()=>'A customer deposits a $100 bill that feels a little too smooth.',choices:[
  {t:'Check the security features',r:'Real $100 bills have a security thread, a watermark and ink that shifts color. This one had none. You caught a fake.',fx:s=>{s.rep=clamp(s.rep+2,0,100);}},
  {t:'Just take it',r:'It was fake, so the bank lost $100. Tellers learn to check every big bill.',fx:s=>{s.cash-=100;s.ledger.other+=100;}}]},
 {id:'inherit',when:s=>s.month>=3,title:'A teen with $20,000',lesson:'autosave',text:()=>'A 16-year-old bot just inherited $20,000 and asks what you would do with it.',choices:[
  {t:'Help her build a plan: savings plus a CD',r:'She put $8,000 in emergency savings and $12,000 in a CD. A plan turns a windfall into a head start.',fx:s=>{addDeposit(s,'sav',8000);addDeposit(s,'cd',12000);s.rep=clamp(s.rep+3,0,100);}},
  {t:'Tell her to buy a sports car',r:'She bought it, and it lost value the moment she drove off. Her parents moved their accounts to CogCo.',fx:s=>{s.rep=clamp(s.rep-4,0,100);}}]},
 {id:'fintech',when:s=>s.month>=7,title:'An app wants to partner',lesson:'digital',text:()=>'A startup wants to put BotBank accounts inside its budgeting app. The setup costs $8,000.',choices:[
  {t:'Partner with them ($8,000)',r:'The app launches soon. Digital tools can reach bots who never walk into a branch.',fx:s=>{s.cash-=8000;s.ledger.other+=8000;later(s,3,'fintech');}},
  {t:'Pass for now',r:'You kept the cash. Bolt Savings signed the deal instead.',fx:s=>{}}]},
 {id:'phishcall',when:s=>!!s.season,title:'A phone scam',lesson:'phish',text:()=>'Bots are getting calls from "BotBank Security" asking them to read back the code we just texted them.',choices:[
  {t:'Text every customer a warning ($1,500)',r:'Your warning was clear: BotBank will never ask for a code. Almost nobody fell for it.',fx:s=>{s.cash-=1500;s.ledger.other+=1500;s.rep=clamp(s.rep+6,0,100);}},
  {t:'Wait to see how bad it gets',r:'Eighteen customers lost money, and they blamed the bank. Scammers count on silence.',fx:s=>{s.rep=clamp(s.rep-10,0,100);}}]},
 {id:'fakeapp',when:s=>!!s.season,title:'A fake BotBank app',lesson:'idtheft',text:()=>'A fake "BotBank" app is in the app store. It steals passwords from anyone who signs in.',choices:[
  {t:'Get it taken down and alert customers ($2,000)',r:'The app was gone in a day, and you told customers to change their passwords. Fast action limits the damage.',fx:s=>{s.cash-=2000;s.ledger.other+=2000;s.rep=clamp(s.rep+6,0,100);}},
  {t:'It is not our app, so not our problem',r:'Customers who lost money blamed BotBank anyway. Protecting customers is part of the job.',fx:s=>{s.rep=clamp(s.rep-11,0,100);}}]});
function forceEvent(id){const e=EVENTS.find(x=>x.id===id);if(!e)return;S.lastEvent[e.id]=S.month;if(e.run)return SPECIAL[e.run]();
  const C=openModal(`<div class="eyebrow">A decision for the president</div><h2>${e.title}</h2><p class="sub">${typeof e.text==='function'?e.text(S):e.text}</p><div class="stackb">${e.choices.map((c,i)=>`<button class="choice" data-i="${i}">${esc(c.t)}</button>`).join('')}</div><div class="after" hidden></div>`,{cls:'dark panel job'});
  C.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{const c=e.choices[+b.dataset.i];c.fx(S);b.classList.add('on');verdict(C,true,'',c.r,e.lesson,()=>{});});}
