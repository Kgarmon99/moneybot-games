/* =====================================================================
   BOTBANK · proof of learning: warm-up and final check, chapter license
   exams, card quick checks, the Money Lab and the learning report.
   Results stay on this device.
   ===================================================================== */
/* first answer is the right one; choices are shuffled on screen */
const QUIZ={
 bank:['Where does most of the money people deposit go?',['It gets loaned to people and businesses','It stays in the vault','It goes to the government']],
 checking:['Which account fits paying bills and everyday spending?',['Checking','A 5-year CD','A trust']],
 savings:['What is a savings account mainly for?',['Money you are not spending yet, earning interest','Paying for lunch every day','Building your credit score']],
 apy:['Which number do you want to be HIGH?',['The APY on your savings','The APR on your loan','The monthly fee on your account']],
 compound:['Using the Rule of 72, about how long does money take to double at 6%?',['About 12 years','About 6 years','About 24 years']],
 cd:['You take money out of a CD early. What usually happens?',['You pay an early withdrawal penalty','Nothing at all','You earn a bonus']],
 fdic:['Which of these does FDIC insurance cover?',['Your savings account at an insured bank','Stocks you bought','Crypto you own']],
 checks:['On a good check, which two things must match?',['The number amount and the written amount','The date and the phone number','The payee and the bank name']],
 debit:['Which one can build your credit history?',['A credit card paid on time','A debit card','Paying with cash']],
 teens:['Under 18, what do most banks need to open your account?',['A parent or guardian on the account','A credit score of 700','A $1,000 deposit']],
 overdraft:['For everyday debit card purchases, when can a bank charge you an overdraft fee?',['Only if you opted in first','Any time, with no permission','Only on weekends']],
 fees:['A $10 monthly account fee costs how much in a year?',['$120','$100','$12']],
 autosave:['What does "pay yourself first" mean?',['Send part of your paycheck to savings before you spend','Buy something fun on payday','Pay every bill before saving']],
 choose:['Who owns a credit union?',['Its members','The government','The Federal Reserve']],
 score:['What is the biggest part of a FICO score?',['Payment history','Credit mix','New credit']],
 fivec:['In the 5 Cs of credit, what does Capacity ask?',['Can you afford the payments?','What backs the loan?','What is the loan for?']],
 dti:['You earn $2,000 a month before taxes and pay $500 on debts. What is your DTI?',['25%','40%','4%']],
 pricing:['Two people want the same loan. Who usually gets the lower rate?',['The one with the better credit score','The one who applies first','The younger one']],
 total:['Same car loan and same rate: 36 months or 72 months?',['72 months has a smaller payment but costs more in total','72 months costs less in total','They cost exactly the same']],
 collateral:['Your car loan is secured by the car. What does that mean?',['The lender can take the car if you stop paying','The car is insured for free','You can never sell the car']],
 fair:['Which reason for denying a loan is illegal?',['The applicant\'s religion','Not enough income','A history of late payments']],
 liquidity:['What does liquidity mean for a bank?',['Having cash ready when people want it','Having the most branches','Paying the highest rates']],
 run:['What is a bank run?',['Many people trying to take their money out at once','A race between banks','A monthly bank audit']],
 phish:['A text from "your bank" asks for your one-time code. What do you do?',['Do not share it. Call the number on your card','Reply quickly so your account stays open','Tap the link and sign in']],
 rege:['You lose your debit card. What is the best move?',['Report it right away','Wait for your statement','Wait a week to see if it turns up']],
 ctr:['You deposit $12,000 in cash. What happens?',['The bank files a routine report','You are in trouble','The bank must refuse the cash']],
 fed:['When the Fed raises rates, what usually happens?',['Savings and loan rates tend to rise','Savings and loan rates tend to fall','Nothing changes for anyone']],
 bonds:['Rates go up. What happens to older bonds paying less?',['Their market value falls','Their market value rises','They turn into cash']],
 trust:['What must a fiduciary do?',['Put your interests ahead of their own','Promise you a profit','Sell you the highest-fee product']],
 community:['How can a deposit at a local bank help your town?',['It can become a loan to a nearby business','It is shipped to the national vault','It lowers local taxes']]
};
const CH_CARDS=[['bank','checking','savings','apy','fdic','debit','teens','checks'],['compound','cd','overdraft','fees','autosave','choose'],['score','fivec','dti','pricing','total','collateral','fair'],['phish','rege','ctr','liquidity','run'],['fed','bonds','trust','community']];
const CHECKUP=['apy','compound','fdic','score','total','phish'],PASS=3,EXAM_N=4;
const LRN=()=>S.lrn||(S.lrn={pre:null,post:null,mastered:{},first:0,tries:0,miss:{}});
const shuffled=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);

/* one question at a time. feedback:false hides the answers (warm-up and final check) */
function quizRun(keys,o){let i=0,score=0;const missed=[];
  const ask=()=>{const k=keys[i],[q,ans]=QUIZ[k],right=ans[0];
    const C=openModal(`<div class="eyebrow">${o.eye}</div><h2>${o.title}</h2><div class="qbar"><i style="width:${(i)/keys.length*100}%"></i></div><p class="qn">Question ${i+1} of ${keys.length}</p><p class="qq">${q}</p><div class="stackb">${shuffled(ans).map(a=>`<button class="choice" data-a="${esc(a)}" ${a===right&&PARAMS.has('test')?'data-ok':''}>${esc(a)}</button>`).join('')}</div><div class="after" hidden></div>`,{cls:'dark panel'});
    C.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{const good=b.dataset.a===right;if(good)score++;else missed.push(k);const next=()=>{i++;if(i<keys.length)ask();else o.done(score,missed);};
      if(o.feedback===false)return next();C.querySelectorAll('.choice').forEach(x=>x.disabled=true);const el=C.querySelector('.after');el.innerHTML=`<div class="res ${good?'':'bad'}"><b>${good?'Correct.':'The answer: '+esc(right)+'.'}</b> ${PLAYBOOK[k].what}</div><div class="mact"><button class="btn pri" data-go data-focus>Next</button></div>`;el.hidden=false;sfx(good?'good':'bad');el.querySelector('[data-go]').onclick=next;el.querySelector('[data-go]').focus();el.scrollIntoView&&el.scrollIntoView({block:'nearest'});});};ask();}

/* warm-up before play, final check after: same six questions, so growth is real */
function preTest(){const C=openModal(`<div class="eyebrow">Before you start</div><h2>What do you already know?</h2><p class="sub">Six quick money questions. This does not change your game. You will see the same six at the end, so you can see how much you learned.</p><div class="mact"><button class="btn" id="skip">Skip</button><button class="btn pri" data-go data-focus>Start</button></div>`,{cls:'dark panel'});
  C.querySelector('#skip').onclick=closeModal;C.querySelector('[data-go]').onclick=()=>quizRun(shuffled(CHECKUP),{eye:'Warm-up',title:'What do you know?',feedback:false,done:s=>{LRN().pre=s;save();closeModal();}});}
function postTest(then){const C=openModal(`<div class="eyebrow">One last thing</div><h2>The Final Check</h2><p class="sub">These are the same six questions from your first day. Show what you learned.</p><div class="mact"><button class="btn pri" data-go data-focus>Start</button></div>`,{cls:'dark panel'});
  C.querySelector('[data-go]').onclick=()=>quizRun(shuffled(CHECKUP),{eye:'Final Check',title:'What do you know now?',feedback:false,done:s=>{LRN().post=s;save();then();}});}

/* each chapter ends with a banking license exam. Retakes are free and unlimited */
function chapterExam(i,then){const pool=CH_CARDS[i],L=LRN();pool.forEach(k=>S.playbook[k]=1);const keys=shuffled(pool).slice(0,EXAM_N);L.tries++;const firstTry=!L['ex'+i];L['ex'+i]=1;
  const C=openModal(`<div class="eyebrow">Chapter ${i+1} license exam</div><h2>Prove you can run this bank</h2><p class="sub">${EXAM_N} questions on what this chapter taught. Get ${PASS} right to move on. You can retake it as many times as you need.</p><div class="mact"><button class="btn" id="study">Study my Playbook first</button><button class="btn pri" data-go data-focus>Start the exam</button></div>`,{cls:'dark panel'});
  C.querySelector('#study').onclick=()=>{L['ex'+i]=firstTry?0:1;L.tries--;MODALQ.unshift(()=>chapterExam(i,then));panelPlaybook(pool[0]);};
  C.querySelector('[data-go]').onclick=()=>quizRun(keys,{eye:`Chapter ${i+1} license exam`,title:'Show what you know',done:(s,missed)=>{missed.forEach(k=>L.miss[k]=(L.miss[k]||0)+1);const ok=s>=PASS;if(ok&&firstTry)L.first++;if(ok){keys.forEach(k=>{if(!missed.includes(k))L.mastered[k]=1;});S.rep=clamp(S.rep+2,0,100);}save();
    const R=openModal(`<div class="eyebrow">${ok?'License earned':'Not yet'}</div><h2>${s} of ${EXAM_N}</h2><p class="sub">${ok?'You passed. The regulators are impressed, and your reputation went up.':`You need ${PASS}. Review these, then try again.`}</p>${missed.length?`<div class="stackb">${missed.map(k=>`<div class="res bad"><b>${PLAYBOOK[k].t}.</b> ${PLAYBOOK[k].what}</div>`).join('')}</div>`:''}<div class="mact"><button class="btn pri" data-go data-focus>${ok?'Continue':'Retake the exam'}</button></div>`,{cls:'dark panel'});sfx(ok?'win':'bad');
    R.querySelector('[data-go]').onclick=()=>{if(ok){closeModal();then();}else chapterExam(i,then);};}});}

function quickCheck(k){quizRun([k],{eye:'Quick Check',title:PLAYBOOK[k].t,done:(s)=>{const L=LRN();if(s&&!L.mastered[k]){L.mastered[k]=1;S.rep=clamp(S.rep+1,0,100);toast(`<b>Card mastered</b><br>${PLAYBOOK[k].t}`);}if(!s)L.miss[k]=(L.miss[k]||0)+1;save();panelPlaybook(k);}});}

/* ----- Money Lab: real math with the kid's own numbers ----- */
function panelLab(tab){learn('compound');learn('total');tab=tab||'save';const st=G.lab||(G.lab={m:50,y:10,r:4,a:20000,apr:8,t:60});
  const C=openModal(`${head('Money Lab','Try your own numbers','This is real math you can use outside the game.')}
  <div class="seg" id="labT"><button class="${tab==='save'?'on':''}" data-t="save">Saving</button><button class="${tab==='loan'?'on':''}" data-t="loan">Borrowing</button></div><div id="labB"></div><div class="mact"><button class="btn pri" onclick="closeModal()" data-focus>Done</button></div>`,{cls:'dark panel',close:1});
  const B=C.querySelector('#labB'),sl=(id,lab,min,max,step,fmt)=>`<div class="sl"><label for="${id}"><span>${lab}</span><b id="${id}V">${fmt(st[id])}</b></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${st[id]}"></div>`;
  const usd=v=>money(Math.round(v)),P1=v=>v+'%',calc=()=>{const R=C.querySelector('#labR');
    if(tab==='save'){const i=st.r/1200,n=st.y*12,fv=i?st.m*(Math.pow(1+i,n)-1)/i:st.m*n,put=st.m*n;R.innerHTML=`<div class="ratios lite"><div><small>You put in</small><b>${usd(put)}</b></div><div><small>Interest earned</small><b>${usd(fv-put)}</b></div><div><small>You end with</small><b>${usd(fv)}</b></div></div><p class="hint">Rule of 72: at ${st.r}%, a lump of money doubles in about ${Math.round(72/st.r)} years. Assumes a steady rate compounded monthly. Real rates change.</p><p class="hint">Inflation check: if prices rise 3% a year, ${usd(fv)} in ${st.y} years buys about what ${usd(fv/Math.pow(1.03,st.y))} buys today.</p>`;}
    else{const pay=t=>{const i=st.apr/1200;return i?st.a*i/(1-Math.pow(1+i,-t)):st.a/t;},p=pay(st.t),tot=p*st.t,p36=pay(36),x=tot-p36*36;R.innerHTML=`<div class="ratios lite"><div><small>Monthly payment</small><b>${usd(p)}</b></div><div><small>Total interest</small><b>${usd(tot-st.a)}</b></div><div><small>Total you pay</small><b>${usd(tot)}</b></div></div><p class="hint">${st.t===36?'A 36-month loan has the highest payment and the lowest total cost.':x>0?`Compared with 36 months, this payment is ${usd(p36-p)} a month lower, but the loan costs ${usd(x)} more in total.`:''}</p>`;}};
  B.innerHTML=(tab==='save'?sl('m','Saved each month',5,500,5,usd)+sl('y','Years',1,50,1,v=>v)+sl('r','APY',1,10,.5,P1):sl('a','Loan amount',1000,50000,1000,usd)+sl('apr','APR',2,24,.5,P1)+sl('t','Months',36,84,12,v=>v))+'<div id="labR"></div>';
  B.querySelectorAll('input').forEach(e=>e.oninput=()=>{st[e.id]=+e.value;const f=e.id==='m'||e.id==='a'?usd(st[e.id]):e.id==='r'||e.id==='apr'?P1(st[e.id]):st[e.id];C.querySelector('#'+e.id+'V').textContent=f;calc();});calc();
  C.querySelectorAll('#labT button').forEach(b=>b.onclick=()=>panelLab(b.dataset.t));}

/* ----- the learning report ----- */
function learningReport(){const L=LRN(),all=Object.keys(PLAYBOOK),m=Object.keys(L.mastered).length,rev=Object.keys(L.miss).sort((a,b)=>L.miss[b]-L.miss[a]).slice(0,6).map(k=>PLAYBOOK[k].t);
  return `BOTBANK LEARNING REPORT\nPlayer: ${S.name}\nMonths played: ${S.month-1}\nChapters finished: ${Math.min(S.chapter,CHAPTERS.length)} of ${CHAPTERS.length}\nWarm-up score: ${L.pre==null?'skipped':L.pre+' of '+CHECKUP.length}\nFinal Check score: ${L.post==null?'not taken yet':L.post+' of '+CHECKUP.length}\nLicense exams passed on the first try: ${L.first}\nPlaybook cards earned: ${Object.keys(S.playbook).length} of ${all.length}\nCards mastered: ${m} of ${all.length}\nTopics to review: ${rev.length?rev.join(', '):'none so far'}\nKentucky banking standards reached: ${STANDARDS.filter(stdDone).length} of ${STANDARDS.length}\n\nThis report stays on this device until you copy it.`;}
function copyReport(){const t=learningReport(),box=()=>{const C=openModal(`${head('Learning report','Copy your report','Select this text and copy it.')}<textarea id="repText" readonly rows="13" style="width:100%;font:14px/1.5 Inter,Arial,sans-serif;padding:12px;border-radius:10px"></textarea><div class="mact"><button class="btn pri" onclick="closeModal()" data-focus>Done</button></div>`,{cls:'dark panel',close:1}),e=C.querySelector('#repText');e.value=t;e.select();};try{navigator.clipboard.writeText(t).then(()=>toast('<b>Report copied</b><br>Paste it into an email or a doc.'),box);}catch(e){box();}}

/* =====================================================================
   STANDARDS: the banking strand of the Kentucky Academic Standards for
   Career Studies and Financial Literacy (June 2025), high school.
   Codes are from the Kentucky Department of Education document.
   Older third-party copies use different numbers: do not use those.
   ===================================================================== */
Object.assign(PLAYBOOK,{
 accounts:{t:'Savings account types',i:'🏧',what:'A traditional savings account is at a branch. An online savings account has no branch and often pays more. A high-yield savings account pays well above average. A money market account usually pays more too, and may need a higher balance.',you:'Compare the APY, the fees and the minimum balance. Then check that the account is FDIC or NCUA insured.'},
 digital:{t:'Digital payments',i:'📲',what:'Payment apps, mobile wallets and online bill pay move money from your phone. Person-to-person transfers can land in minutes and are often hard to reverse.',you:'Treat a payment app like cash. Double-check the name, and only send money to people you know.'},
 inflation:{t:'Inflation',i:'🎈',what:'Inflation is a rise in overall prices, so each dollar buys less. If prices rise 3% a year and your savings earn 1%, your balance grows but it buys less.',you:'Compare your savings rate with inflation. Keep cash for near-term needs, and learn about investing for long-term goals.'},
 report:{t:'Your credit report',i:'📄',what:'A credit report lists your accounts, balances, payment history, credit checks and public records like bankruptcies. Your score is calculated from that information.',you:'Get your free reports at AnnualCreditReport.com. Dispute anything that is wrong.'},
 cardterms:{t:'Credit terms to know',i:'📋',what:'APR is the yearly cost of borrowing. A grace period is the time to pay a card bill with no interest. A finance charge is the cost of the credit. Late fees add up. Installment loans have fixed payments. Revolving credit, like a card, lets you borrow again as you repay.',you:'Pay the full card balance by the due date and you can usually avoid interest. Read the terms before you sign.'},
 payday:{t:'Payday and predatory loans',i:'🪤',what:'A payday loan is a short, high-cost loan due on your next payday. A typical fee of $15 per $100 for two weeks works out to about 400% APR. Many borrowers cannot repay on time, so they roll it over and pay fees again. That is the debt cycle.',you:'Before using one, ask a bank or credit union about small loans, ask for a payment plan, or talk to a trusted adult.'},
 hardship:{t:'When debt gets hard',i:'🛟',what:'If you cannot make a payment, call the lender before you miss it. List every debt, cut spending, and ask about a payment plan. A nonprofit credit counselor can help. Bankruptcy can erase or reorganize debt, but it can stay on a credit report for up to 10 years.',you:'Raise your score by paying on time, paying down balances and keeping old accounts open. Ask for help early.'},
 regulators:{t:'Who watches the banks',i:'🏛️',what:'The Federal Reserve sets monetary policy and supervises banks. The FDIC insures bank deposits. The NCUA insures credit union deposits. The FTC fights consumer fraud. The SEC and FINRA oversee investing. The IRS collects taxes. States have regulators too.',you:'If a bank or lender treats you unfairly, you can file a complaint with a regulator.'},
 idtheft:{t:'If your identity is stolen',i:'🆘',what:'Identity theft is when someone uses your information to take money or open accounts. Act fast: call your bank, change your passwords, freeze your credit, and report it at IdentityTheft.gov.',you:'Use strong, different passwords and turn on two-step login. Check your accounts often.'}
});
PLAYBOOK.fdic.what+=' Credit unions get the same coverage through the NCUA.';
PLAYBOOK.pricing.what+=' Your credit can also affect renting an apartment and insurance costs, and some employers can check your credit report with your permission.';
Object.assign(QUIZ,{
 accounts:['Which account has no branch and often pays a higher rate?',['An online savings account','A checking account at a branch','A safe deposit box']],
 digital:['You sent money to the wrong person on a payment app. Why is that a problem?',['Transfers can land in minutes and are often hard to reverse','The app always refunds it the next day','The bank has to pay it back']],
 inflation:['Prices rise 3% this year and your savings earn 1%. What happens?',['Your balance grows, but it buys less','Your balance shrinks','Your money buys more']],
 report:['Where can you get your free credit reports?',['AnnualCreditReport.com','Any store that sells gift cards','Only from a lawyer']],
 cardterms:['What is a grace period on a credit card?',['Time to pay your bill with no interest','A fee for paying late','A higher credit limit']],
 payday:['Why can payday loans trap people in a cycle of debt?',['Very high costs and short deadlines lead to repeat fees','They have the lowest rates in banking','They never have to be repaid']],
 hardship:['You know you will miss a loan payment next month. What is the best first step?',['Call the lender before you miss it','Ignore the bills','Take a payday loan']],
 regulators:['Which agency insures deposits at credit unions?',['The NCUA','The SEC','The IRS']],
 idtheft:['Someone opened an account in your name. What should you do?',['Call your bank, freeze your credit and report it at IdentityTheft.gov','Wait to see if it goes away','Reply to the scammer']]
});
CH_CARDS[0].push('accounts','digital');CH_CARDS[1].push('inflation');CH_CARDS[2].push('report','cardterms','payday','hardship');CH_CARDS[3].push('idtheft','regulators');
const STANDARDS_DOC='Kentucky Academic Standards for Career Studies and Financial Literacy (June 2025), High School Financial Literacy';
const STANDARDS=[
 ['FL.H.6','Develop strategies to control and manage credit and debt',['hardship','score','dti']],
 ['FL.H.6.a','Interpret the components of a credit report and how the credit score is determined',['report','score']],
 ['FL.H.6.b','How credit scores can affect financial options and standard of living',['pricing','score']],
 ['FL.H.6.c','How to get a free copy of your credit report and why it is advisable',['report','score']],
 ['FL.H.6.d','Causes and implications of bankruptcy, and ways to increase a credit score',['hardship']],
 ['FL.H.6.e','Create a plan for a person having difficulty repaying debt',['hardship']],
 ['FL.H.7','Analyze the costs and benefits of using credit',['total','debit','cardterms']],
 ['FL.H.7.a','How a credit score can impact housing, employment, insurance and the cost of credit',['pricing']],
 ['FL.H.7.b','Value of a healthy credit rating, including the 5 Cs of creditworthiness',['fivec','score']],
 ['FL.H.7.c','Advantages and disadvantages of basic types of credit, including predatory lenders',['collateral','cardterms','payday']],
 ['FL.H.7.d','Risks, responsibilities and rights of credit, such as APR, grace period and late fees',['cardterms','apy','fair']],
 ['FL.H.7.e','How payday loans can cause a cycle of debt',['payday']],
 ['FL.H.10.c','Proactive budget priorities, such as pay yourself first',['autosave']],
 ['FL.H.11','Major types of financial institutions and their products and services',['bank','choose','accounts','cd','savings','checking']],
 ['FL.H.12','How to use different payment methods, including checks, debit cards and digital payments',['checks','debit','digital']],
 ['FL.H.14','Implications of the time value of money, such as inflation and compounding interest',['compound','inflation']],
 ['FL.H.15.a','FDIC and NCUA insured deposits compared to uninsured investments',['fdic']],
 ['FL.H.15.b','Compare and contrast traditional, online and high-yield savings accounts',['accounts']],
 ['FL.H.18.c','Inflation raises overall prices and reduces purchasing power',['inflation']],
 ['FL.H.19','The role of financial intermediaries between savers and lenders',['bank','community','liquidity']],
 ['FL.H.23','The role of regulatory agencies, such as the Federal Reserve, FDIC, NCUA, FTC and SEC',['regulators','fed','fdic']],
 ['FL.H.26','Strategies for protecting personal financial information and resources',['phish','rege']],
 ['FL.H.26.a','How online behavior, scams and telemarketers create risk of identity theft and fraud',['phish']],
 ['FL.H.26.b','Strategies to reduce the risk of identity theft and financial fraud',['phish','idtheft']],
 ['FL.H.26.c','Steps an identity theft victim should take to limit losses and restore security',['idtheft','rege']]
];
const stdDone=r=>r[2].some(k=>S.playbook[k]);
function standardsText(){return `BOTBANK STANDARDS ALIGNMENT\n${STANDARDS_DOC}\nBanking-related standards only. Alignment prepared by MoneyBot. Not reviewed or endorsed by the Kentucky Department of Education.\n\n`+STANDARDS.map(r=>`${r[0]}: ${r[1]}\n  Taught in: ${r[2].map(k=>PLAYBOOK[k].t).join(', ')}`).join('\n');}
function panelStandards(){const met=STANDARDS.filter(stdDone).length;
  const C=openModal(`${head('For teachers','Standards alignment',`The banking part of the ${STANDARDS_DOC}. You have reached <b>${met} of ${STANDARDS.length}</b>.`)}
  <div class="stdl">${STANDARDS.map(r=>`<div class="std ${stdDone(r)?'on':''}"><b>${r[0]}</b><div><p>${r[1]}</p><small>${r[2].map(k=>PLAYBOOK[k].t).join(' · ')}</small></div><i>${stdDone(r)?'✓':''}</i></div>`).join('')}</div>
  <p class="hint">Alignment prepared by MoneyBot. Not reviewed or endorsed by the Kentucky Department of Education.</p>
  <div class="mact"><button class="btn" id="cpS">Copy alignment</button><button class="btn pri" id="bk" data-focus>Back</button></div>`,{cls:'dark panel wide',close:1});
  C.querySelector('#bk').onclick=()=>panelPlaybook();C.querySelector('#cpS').onclick=()=>{try{navigator.clipboard.writeText(standardsText()).then(()=>toast('<b>Alignment copied</b>'),()=>toast('Copy was blocked on this device.','warn'));}catch(e){toast('Copy was blocked on this device.','warn');}};}
