/* =====================================================================
   BOTBANK · the bank itself. Pure rules, no drawing, so it can be tested.
   Balance sheet identity: equity is always assets minus liabilities.
   ===================================================================== */
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const rand=(a,b)=>a+Math.random()*(b-a);
const ri=(a,b)=>Math.floor(rand(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const roundTo=(v,n)=>Math.round(v/n)*n;

function blankLedger(){return {intLoans:0,intBonds:0,intCash:0,fees:0,trust:0,intDep:0,intDebt:0,pay:0,rent:0,fdic:0,marketing:0,build:0,other:0,chargeoffs:0,bondLoss:0,chargeList:[]};}
function newBank(name){return {
  v:1,name:name||'President',month:1,phase:'board',clock:0,
  cash:400000,bonds:0,bondYield:0,bondFed:0,loans:[],seq:1,
  chk:0,sav:0,cd:0,debt:0,startCapital:400000,
  rates:{sav:1.5,cd:3,loan:8},fee:0,standard:'balanced',marketing:0,
  fed:3.5,prevFed:3.5,econ:1,econLeft:0,rep:40,morale:75,compliance:70,
  accts:{chk:0,sav:0,cd:0},
  staff:[],built:{},flags:{},chapter:0,goals:{},playbook:{},
  ledger:blankLedger(),hist:[],exams:[],
  stats:{served:0,opened:0,loans:0,goodDenies:0,badLoans:0,profitMonths:0,bestExam:0,fraudStopped:0,fraudMissed:0,runsSurvived:0,goodFits:0,lost:0,handServed:0},
  me:{chk:250,sav:0,auto:10,pay:900,owned:{},suit:null,hat:null,tie:null,txns:[]},
  seen:{},lastEvent:{},nextEvent:2
};}
const depositsTotal=s=>s.chk+s.sav+s.cd;
const loansTotal=s=>s.loans.reduce((a,l)=>a+l.bal,0);
const assetsTotal=s=>s.cash+s.bonds+loansTotal(s);
const liabTotal=s=>depositsTotal(s)+s.debt;
const equity=s=>assetsTotal(s)-liabTotal(s);
const capRatio=s=>{const a=assetsTotal(s);return a>0?equity(s)/a*100:100;};
const liqRatio=s=>{const d=depositsTotal(s);return d>0?(Math.max(0,s.cash)+s.bonds*.9)/d*100:100;};
const mktRates=s=>({sav:+(s.fed*.55).toFixed(2),cd:+(s.fed*.95).toFixed(2),loan:+(s.fed+4.5).toFixed(2)});
const spread=s=>s.rates.loan-s.rates.sav;
const bondValue=s=>s.bonds*clamp(1-4*(s.fed-s.bondFed)/100,.6,1.15);
const stars=s=>clamp(Math.round(s.rep/20*2)/2,.5,5);
const level=s=>s.chapter;

/* ----- customer traffic ----- */
function arrivals(s){
  const mk=mktRates(s),gap=clamp(s.rates.sav-mk.sav,-2,2);
  let n=6+s.rep/9+gap*1.5+[0,2,4,7][s.marketing]+(s.built.drive?3:0)+s.chapter*1.5;
  if(s.fee>=6)n-=1.5; return clamp(Math.round(n),5,MAX_CUSTOMERS);
}
const MAX_CUSTOMERS=32;
const MKT_COST=[0,600,1800,4500];

/* ----- deposits and loans ----- */
function addDeposit(s,book,amt){s[book]+=amt;s.cash+=amt;}
function withdraw(s,amt){
  /* take from checking first, then savings */
  let left=amt;const a=Math.min(s.chk,left);s.chk-=a;left-=a;const b=Math.min(s.sav,left);s.sav-=b;left-=b;const c=Math.min(s.cd,left);s.cd-=c;left-=c;
  s.cash-=(amt-left);return amt-left;
}
function makeApplicant(s){
  const open=Object.keys(LOANS).filter(k=>(LOANS[k].lvl||0)<=s.chapter);
  const type=pick(open),T=LOANS[type];
  /* a third strong, a third middling, a third shaky */
  const tier=Math.random(),score=tier<.36?ri(720,810):tier<.72?ri(630,715):ri(520,625);
  const income=roundTo(type==='mortgage'?rand(5200,11000):type==='biz'?rand(5000,14000):rand(2400,7000),50);
  const amt=roundTo(rand(T.amt[0],T.amt[1]),type==='builder'?50:500);
  const debts=roundTo(income*(score>700?rand(.05,.22):score>630?rand(.12,.34):rand(.22,.42)),10);
  const down=type==='mortgage'||type==='auto'?Math.round(rand(score>680?10:0,score>680?22:12)):0;
  const yrs=score>680?ri(3,14):ri(0,6),late=score>700?0:score>630?ri(0,2):ri(2,6);
  const refr=loanPay(amt,s.rates.loan+T.add,T.term),dti=Math.round((debts+refr)/income*100);
  /* true yearly default chance, hidden from the player */
  let pd=.012+(Math.max(0,700-score)/100)*.13+Math.max(0,dti-36)*.0035+late*.01-(yrs>=5?.006:0);
  if(T.recov>=.5&&down>=10)pd*=.8; pd=clamp(pd,.004,.5);
  return {type,name:pick(NAMES1)+' '+pick(NAMES2),job:pick(JOBS_LIST),amt,income,debts,dti,score,down,yrs,late,pd,term:T.term};
}
function loanPay(p,apr,n){const r=apr/1200;return r?p*r/(1-Math.pow(1+r,-n)):p/n;}
/* what a good banker would do: 'approve', 'price' (only at a higher rate), 'deny' */
function goodCall(a){return a.pd>=.2||a.dti>50?'deny':a.pd>=.075?'price':'approve';}
function bookLoan(s,a,bump){
  const T=LOANS[a.type],apr=+(s.rates.loan+T.add+bump).toFixed(2);
  const l={id:s.seq++,type:a.type,name:a.name,bal:a.amt,orig:a.amt,apr,term:a.term,left:a.term,pay:loanPay(a.amt,apr,a.term),pd:a.pd,fixed:T.fixed};
  s.loans.push(l);s.cash-=a.amt;s.stats.loans++;
  /* a loan is a deposit somewhere: some of it lands back in checking here */
  const back=a.amt*.25;s.chk+=back;s.cash+=back;return l;
}

/* ----- staff & market helpers ----- */
function teamPay(s){return s.staff.reduce((a,b)=>a+b.pay,0);}
function rent(s){return 1400+Object.keys(s.built).length*450+(s.built.tower?4000:0);}
function staffOf(s,r){return s.staff.filter(b=>b.role===r);}
function underwriteSkill(s){const l=staffOf(s,'loan');return l.length?l.reduce((a,b)=>a+b.skill,0)/l.length:0;}

/* ----- close of the month: this is the whole business model ----- */
function closeMonth(s){
  const L=s.ledger,mk=mktRates(s);
  /* 1. organic deposit flows follow rates, reputation and service */
  const gapS=clamp(s.rates.sav-mk.sav,-2,2),gapC=clamp(s.rates.cd-mk.cd,-2,2);
  const pull=.018+s.rep*.0004+(s.built.digital?.022:0)+s.marketing*.004+(s.built.community?.004:0)-(s.fee>=6?.012:s.fee>=3?.005:0);
  const seed=2500+s.rep*220+s.chapter*4500+s.marketing*3000;
  const dS=s.sav*(pull+gapS*.012)+seed*.45+(gapS>0?seed*gapS*.2:0),dC=s.chk*(pull*.55)+seed*.45,dD=s.cd*(gapC*.012+.006)+(gapC>0?seed*gapC*.2:0);
  const savFlow=Math.max(-s.sav,dS),chkFlow=Math.max(-s.chk,dC),cdFlow=Math.max(-s.cd,dD);
  s.sav+=savFlow;s.chk+=chkFlow;s.cd+=cdFlow;s.cash+=savFlow+chkFlow+cdFlow;
  if(s.flags.hot){if(Math.random()<.2){const h=Math.min(s.flags.hot,s.chk);s.chk-=h;s.cash-=h;s.flags.hot=0;s.flags.hotLeft=h;}}
  /* 2. the lending pipeline: an officer turns demand into loans under your credit standards */
  const uw=underwriteSkill(s);
  if(uw>0){
    const std={tight:{d:.55,p:.65,s:'tight'},balanced:{d:1,p:1,s:'balanced'},loose:{d:1.6,p:1.8,s:'loose'}}[s.standard];
    const attract=clamp(1+(mk.loan-s.rates.loan)*.35,.25,1.8);
    const room=Math.max(0,s.cash-depositsTotal(s)*.1);
    const want=(depositsTotal(s)*.055+9000+s.rep*260)*attract*std.d*(2-Math.min(1.4,s.econ));
    const lent=Math.min(room*.8,want);
    if(lent>500){
      const fixedShare=s.chapter>=2?.4:0;
      const pd=(.022+Math.max(0,.012*(3-uw)))*std.p;
      [['auto',1-fixedShare],['mortgage',fixedShare]].forEach(([t,sh])=>{if(sh<=0)return;const a=lent*sh;const T=LOANS[t],apr=+(s.rates.loan+T.add).toFixed(2);
        s.loans.push({id:s.seq++,type:t,name:'Pipeline '+MONTHS[(s.month-1)%12],pool:1,bal:a,orig:a,apr,term:T.term,left:T.term,pay:loanPay(a,apr,T.term),pd,fixed:T.fixed});s.cash-=a;});
      L.pipeline=lent; s.stats.pipeline=(s.stats.pipeline||0)+lent;
    }
  }
  /* 3. borrowers pay. a few do not. */
  const survivors=[];
  s.loans.forEach(l=>{
    const r=l.apr/1200,int=l.bal*r;
    const moPd=l.pd/12*s.econ;
    /* pooled balances default in slices, single loans default whole */
    if(l.pool){const hit=l.bal*moPd;L.chargeoffs+=hit*(1-LOANS[l.type].recov);s.cash+=hit*LOANS[l.type].recov;l.bal-=hit;}
    else if(Math.random()<moPd){const rec=l.bal*LOANS[l.type].recov,loss=l.bal-rec;s.cash+=rec;L.chargeoffs+=loss;s.stats.badLoans++;L.chargeList.push({name:l.name,type:l.type,loss});return;}
    const prin=Math.min(l.bal,Math.max(0,l.pay-int));L.intLoans+=int;s.cash+=prin;l.bal-=prin;l.left--;
    if(l.bal>1&&l.left>0)survivors.push(l);
  });
  s.loans=survivors;
  /* 4. the rest of the income statement */
  L.intBonds=s.bonds*s.bondYield/1200;L.intCash=Math.max(0,s.cash)*Math.max(0,s.fed-.1)/1200;
  L.intDep=s.sav*s.rates.sav/1200+s.cd*s.rates.cd/1200;L.intDebt=s.debt*(s.fed+.75)/1200;
  L.fees+=s.fee*s.accts.chk+(s.built.atm?1400:0);L.trust=s.built.trust?Math.max(9000,assetsTotal(s)*.0012):0;
  L.pay=teamPay(s)+s.me.pay;L.rent=rent(s);L.fdic=depositsTotal(s)*.0005/12*3;L.marketing=MKT_COST[s.marketing];
  const income=L.intLoans+L.intBonds+L.intCash+L.fees+L.trust;
  const expense=L.intDep+L.intDebt+L.pay+L.rent+L.fdic+L.marketing;
  /* deposit interest is credited to accounts, so it raises what we owe instead of leaving as cash */
  s.sav+=s.sav*s.rates.sav/1200;s.cd+=s.cd*s.rates.cd/1200;
  s.cash+=income-(expense-L.intDep);
  const net=income-expense-L.chargeoffs-L.bondLoss-L.other;
  if(net>0)s.stats.profitMonths++;
  /* 5. reputation drifts toward how well you treated people */
  s.rep=clamp(s.rep+(s.fee>=6?-1.2:0)+(s.built.community?1.4:0)+(gapS>0?.5:gapS<-1?-.6:0)+(s.marketing?.3:0),0,100);
  s.compliance=clamp(s.compliance+(staffOf(s,'comply').length?3:-.6),0,100);
  /* 6. the president gets paid, from the bank's payroll, into a personal account */
  const paid=s.me.pay,saved=Math.round(paid*s.me.auto/100);
  s.me.chk+=paid-saved;s.me.sav+=saved;const myInt=s.me.sav*s.rates.sav/1200;s.me.sav+=myInt;s.me.lastInt=myInt;
  const assets=assetsTotal(s),rec={month:s.month,net,income,expense,assets,equity:equity(s),cap:capRatio(s),liq:liqRatio(s),loans:loansTotal(s),deposits:depositsTotal(s),nim:assets>0?(L.intLoans+L.intBonds+L.intCash-L.intDep-L.intDebt)*12/assets*100:0,charge:L.chargeoffs};
  s.hist.push(rec);if(s.hist.length>48)s.hist.shift();
  /* the economy moves on */
  s.prevFed=s.fed;if(s.econLeft>0){s.econLeft--;if(!s.econLeft)s.econ=1;}
  return rec;
}
function freshMonth(s){s.ledger=blankLedger();s.month++;}

/* CAMELS bank exam, 1 is best, 5 is worst */
function exam(s){
  const h=s.hist.slice(-3),a=assetsTotal(s)||1,roa=h.reduce((x,r)=>x+r.net,0)*4/a*100,cl=h.reduce((x,r)=>x+r.charge,0)*4/(loansTotal(s)||1)*100;
  const fixed=s.loans.filter(l=>l.fixed).reduce((x,l)=>x+l.bal,0)+s.bonds,ratio=fixed/a;
  const g=(v,cuts)=>{for(let i=0;i<cuts.length;i++)if(v>=cuts[i])return i+1;return 5;},gl=(v,cuts)=>{for(let i=0;i<cuts.length;i++)if(v<=cuts[i])return i+1;return 5;};
  const r={C:g(capRatio(s),[10,7,5,3]),A:loansTotal(s)<200000?2:gl(cl,[.6,1.6,3.5,7]),M:g(s.compliance,[85,70,55,35]),E:g(roa,[1,.4,0,-1.2]),L:g(liqRatio(s),[18,11,7,3]),S:gl(ratio,[.3,.45,.6,.75])};
  const avg=(r.C*2+r.A*2+r.M*2+r.E+r.L*2+r.S)/10;r.total=clamp(Math.round(avg),1,5);r.month=s.month;r.roa=roa;
  s.exams.push(r);if(!s.stats.bestExam||r.total<s.stats.bestExam)s.stats.bestExam=r.total;
  s.rep=clamp(s.rep+(3-r.total)*2.5,0,100);return r;
}
/* treasury actions */
function buyBonds(s,amt){amt=Math.min(amt,Math.max(0,s.cash));if(amt<=0)return 0;const y=s.fed+.9,t=s.bonds+amt;s.bondYield=(s.bonds*s.bondYield+amt*y)/t;s.bondFed=(s.bonds*s.bondFed+amt*s.fed)/t;s.bonds=t;s.cash-=amt;return amt;}
function sellBonds(s,amt){amt=Math.min(amt,s.bonds);if(amt<=0)return 0;const px=clamp(1-4*(s.fed-s.bondFed)/100,.6,1.15),got=amt*px;s.bonds-=amt;s.cash+=got;s.ledger.bondLoss+=amt-got;return got;}
function borrow(s,amt){s.debt+=amt;s.cash+=amt;}
function repay(s,amt){amt=Math.min(amt,s.debt,Math.max(0,s.cash));s.debt-=amt;s.cash-=amt;return amt;}
function failed(s){return equity(s)<=0;}
if(typeof module!=='undefined')module.exports={newBank,closeMonth,freshMonth,exam,assetsTotal,equity,capRatio,liqRatio,depositsTotal,loansTotal,makeApplicant,bookLoan,addDeposit,withdraw,goodCall,buyBonds,sellBonds,borrow,repay,arrivals,mktRates,staffOf};
