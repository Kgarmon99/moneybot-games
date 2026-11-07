/* =====================================================================
   BOTBANK · content: sponsor, products, customers, lessons, events
   Everything a kid reads lives here so it can be reviewed in one place.
   ===================================================================== */
/* Sponsor lockup. Drop the bank's approved logo into `logo` (a data: URL) and every placement picks it up. */
const SPONSOR={name:'American Bank & Trust',place:'Bowling Green, KY',logo:null};

const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];

/* products sold at New Accounts */
const PRODUCTS={
  checking:{name:'Checking',icon:'💳',line:'For everyday money. Debit card, bill pay, direct deposit.',book:'chk'},
  savings:{name:'Savings',icon:'🐖',line:'For money you are not spending yet. Earns interest.',book:'sav'},
  cd:{name:'Certificate of Deposit',short:'CD',icon:'🔒',line:'Lock money for a set time for a higher rate. Early withdrawal costs a penalty.',book:'cd',lvl:1},
  student:{name:'Teen Checking',icon:'🎒',line:'Starter checking with a parent or guardian on the account.',book:'chk',lvl:1},
  business:{name:'Business Checking',icon:'🏪',line:'Keeps business money separate from personal money.',book:'chk',lvl:2},
  secured:{name:'Secured Credit Card',icon:'🛡️',line:'A deposit backs the card. A safe way to build credit.',book:'sav',lvl:2}
};
/* New Accounts walk-ins: goal, best product, ok product, and why */
const GOALS=[
  {say:'I just got my first job. I need a place for my paycheck and a debit card.',best:'checking',why:'Checking is built for money that moves: paychecks in, bills and purchases out.',lesson:'checking',amt:[900,4000]},
  {say:'I want to set aside money for a car next year. I will not touch it until then.',best:'savings',ok:['cd'],why:'Savings keeps goal money away from spending money, and it earns interest. It is still there when you need it.',lesson:'savings',amt:[1200,7000]},
  {say:'I have $10,000 from my grandma and I will not need it for two years. What pays the most?',best:'cd',ok:['savings'],why:'If you truly will not need the money, a CD pays more because you promise to leave it alone.',lesson:'cd',amt:[10000,10000],lvl:1},
  {say:'I am 15 and want my first account. My mom came with me.',best:'student',ok:['checking','savings'],why:'Most banks need an adult on the account for anyone under 18. Teen checking is made for that.',lesson:'teens',amt:[150,900],lvl:1},
  {say:'I started a lawn care company and my money is all mixed together.',best:'business',ok:['checking'],why:'A business account keeps your records clean and makes tax time much easier.',lesson:'fees',amt:[6000,40000],lvl:2},
  {say:'I have no credit history. I want to start building it without getting in trouble.',best:'secured',ok:['savings'],why:'A secured card is backed by your own deposit. Pay it on time and you build a credit history.',lesson:'score',amt:[300,1000],lvl:2},
  {say:'I want an emergency fund in case my car breaks down.',best:'savings',ok:['checking'],why:'Emergency money must be safe and easy to reach, so savings fits. A CD would lock it up.',lesson:'savings',amt:[500,5000]},
  {say:'I pay rent, phone and streaming every month. I want it all in one place.',best:'checking',why:'Automatic bill pay from checking keeps you on time without thinking about it.',lesson:'checking',amt:[800,3500]},
  {say:'I am saving for retirement money that I will not need for a long, long time, and I want a set rate.',best:'cd',ok:['savings'],why:'A CD locks in a set rate for a set time. It is safe, though long-term investing can grow more with more risk.',lesson:'compound',amt:[6000,30000],lvl:1},
  {say:'My bakery needs to pay two workers and take card payments.',best:'business',ok:['checking'],why:'Payroll and card payments belong in a business account, not a personal one.',lesson:'fees',amt:[9000,60000],lvl:2}
];

/* loan types */
const LOANS={
  builder:{name:'Credit Builder Loan',icon:'🌱',amt:[500,1500],term:12,recov:.9,add:-3,what:'First-time borrower building a credit history',fixed:0},
  personal:{name:'Personal Loan',icon:'🧾',amt:[2000,10000],term:36,recov:.1,add:2.5,what:'No collateral. Signature only.',fixed:0},
  auto:{name:'Auto Loan',icon:'🚗',amt:[9000,32000],term:60,recov:.55,add:0,what:'The car is the collateral.',fixed:0},
  biz:{name:'Small Business Loan',icon:'🏪',amt:[20000,110000],term:60,recov:.35,add:1.5,what:'Business equipment is the collateral.',fixed:0,lvl:1},
  mortgage:{name:'Home Mortgage',icon:'🏡',amt:[90000,260000],term:360,recov:.8,add:-.5,what:'The house is the collateral. Rate stays fixed for 30 years.',fixed:1,lvl:2}
};
const JOBS_LIST=['Delivery Driver','Nurse Assistant','Welder','Teacher','Barber','Line Cook','Electrician','Warehouse Lead','Dental Hygienist','Bus Driver','Accountant','Mechanic'];
const NAMES1=['Ada','Max','Rosa','Kai','Juno','Theo','Mira','Otis','Nia','Leo','Ivy','Remy','Zara','Finn','Lola','Hugo','Pia','Gus','Tess','Omar','Bea','Sol','Wren','Ezra','Iris','Rex','Uma','Dot','Clem','Vee'];
const NAMES2=['Volt','Byte','Sprocket','Gear','Pixel','Cache','Kernel','Flux','Ohm','Rivet','Nano','Diode','Servo','Logic','Widget','Coil'];

/* staff */
const ROLES={
  teller:{name:'Teller Bot',icon:'💵',pay:600,text:'Runs a teller window: deposits, withdrawals and checks.',station:'teller'},
  rep:{name:'New Accounts Bot',icon:'🤝',pay:680,text:'Opens accounts. A good rep matches people to the right product.',station:'newacct'},
  loan:{name:'Loan Officer Bot',icon:'📝',pay:950,text:'Reviews loan applications and runs the monthly lending pipeline.',station:'loan',lvl:1},
  vault:{name:'Vault Teller Bot',icon:'🗝️',pay:640,text:'Keeps the teller drawers stocked with cash so you do not have to.',lvl:1},
  fraud:{name:'Fraud Analyst Bot',icon:'🕵️',pay:1300,text:'Works the Fraud Lab alerts all day.',station:'fraud',lvl:3},
  comply:{name:'Compliance Bot',icon:'📋',pay:1200,text:'Keeps the bank inside the rules. Raises your Management grade.',lvl:2}
};

/* things to build */
const BUILD=[
  {id:'teller2',name:'Teller Window 2',icon:'💵',cost:12000,lvl:0,text:'A second window. Shorter lines, happier customers.'},
  {id:'loanoffice',name:'Loan Office',icon:'📝',cost:25000,lvl:0,text:'Unlocks the Loan Desk. This is how a bank earns real money.'},
  {id:'teller3',name:'Teller Window 3',icon:'💵',cost:22000,lvl:1,text:'A third window for the lunch rush.',need:'teller2'},
  {id:'coffee',name:'Coffee Lounge',icon:'☕',cost:18000,lvl:1,text:'Waiting customers stay patient 40% longer.'},
  {id:'atm',name:'ATM',icon:'🏧',cost:30000,lvl:1,text:'Takes quick cash trips away from the teller line and earns a little in out-of-network fees.'},
  {id:'fraudlab',name:'Fraud Lab',icon:'🕵️',cost:45000,lvl:2,text:'Catch fake charges and scams before customers lose money.'},
  {id:'drive',name:'Drive-Thru Lane',icon:'🚘',cost:60000,lvl:2,text:'More customers each day. Bots love not getting out of the car.'},
  {id:'teller4',name:'Teller Window 4',icon:'💵',cost:38000,lvl:2,text:'Your teller line at full size.',need:'teller3'},
  {id:'community',name:'Community Room',icon:'🎓',cost:50000,lvl:3,text:'Free money workshops for Bot City. Your reputation grows every month.'},
  {id:'digital',name:'Digital Banking',icon:'📱',cost:120000,lvl:3,text:'A mobile app. Deposits grow faster, but scammers will come with it.'},
  {id:'trust',name:'Trust Department',icon:'⚖️',cost:180000,lvl:4,text:'Manage money for families and earn steady fees. Trust officers must put clients first.'},
  {id:'tower',name:'BotBank Tower',icon:'🏙️',cost:400000,lvl:4,text:'Your name on the Bot City skyline. The biggest flex in banking.'}
];

/* chapters & goals */
const CHAPTERS=[
  {name:'Open the Doors',badge:'firstquest',intro:'Every bank starts with one promise: <b>your money is safe here.</b> Serve your first customers and earn that trust.',goals:[
    {id:'serve5',text:'Serve 5 customers at a teller window',n:s=>s.stats.served,max:5},
    {id:'acct3',text:'Open 3 new accounts',n:s=>s.stats.opened,max:3},
    {id:'dep50',text:'Hold $50,000 in customer deposits',n:s=>depositsTotal(s),max:50000,money:1},
    {id:'loanoffice',text:'Build the Loan Office',n:s=>s.built.loanoffice?1:0,max:1}]},
  {name:'The Spread',badge:'coincollector',intro:'Here is the secret of banking: <b>pay savers a little, charge borrowers more,</b> and live on the gap. That gap is called the spread.',goals:[
    {id:'loans3',text:'Approve 3 loans',n:s=>s.stats.loans,max:3},
    {id:'lent150',text:'Have $150,000 out on loans',n:s=>loansTotal(s),max:150000,money:1},
    {id:'profit',text:'Finish a month with a profit',n:s=>s.stats.profitMonths,max:1},
    {id:'hire2',text:'Grow the team to 3 bots',n:s=>s.staff.length,max:3}]},
  {name:'Risk and Reward',badge:'detective',intro:'Some loans do not get paid back. Great bankers are not the ones who say yes the most. They are the ones who <b>say yes to the right people.</b>',goals:[
    {id:'exam',text:'Earn a 2 or better on a bank exam',n:s=>s.stats.bestExam&&s.stats.bestExam<=2?1:0,max:1},
    {id:'denied',text:'Protect the bank: deny 2 risky loans',n:s=>s.stats.goodDenies,max:2},
    {id:'assets1m',text:'Grow to $1 million in assets',n:s=>assetsTotal(s),max:1000000,money:1},
    {id:'fraudlab',text:'Build the Fraud Lab',n:s=>s.built.fraudlab?1:0,max:1}]},
  {name:'Trust',badge:'savingsguardian',intro:'A bank runs on trust. When trust breaks, it breaks fast. Scammers, rumors and rate shocks are all coming. <b>Be ready.</b>',goals:[
    {id:'fraud5',text:'Stop 5 frauds or scams',n:s=>s.stats.fraudStopped,max:5},
    {id:'run',text:'Survive a bank run',n:s=>s.stats.runsSurvived,max:1},
    {id:'stars4',text:'Reach 4 stars of reputation',n:s=>s.rep,max:75},
    {id:'assets4m',text:'Grow to $2.5 million in assets',n:s=>assetsTotal(s),max:2500000,money:1}]},
  {name:'Bank of the Year',badge:'level4-moneymaster',intro:'Bot City is watching. A great community bank keeps money working close to home. <b>Finish the job.</b>',goals:[
    {id:'community',text:'Open the Community Room',n:s=>s.built.community?1:0,max:1},
    {id:'exam1',text:'Earn a perfect 1 on a bank exam',n:s=>s.stats.bestExam===1?1:0,max:1},
    {id:'assets10m',text:'Grow to $5 million in assets',n:s=>assetsTotal(s),max:5000000,money:1},
    {id:'tower',text:'Raise the BotBank Tower',n:s=>s.built.tower?1:0,max:1}]}
];

/* THE PLAYBOOK. Each card has a game fact and a real-life move. */
const PLAYBOOK={
  bank:{t:'What a bank really does',i:'🏦',what:'A bank keeps your money safe, moves it for you, and lends most of it to neighbors who need a car, a home or a shop. The money in the vault is only a small part of what is on deposit.',you:'Think of a bank as a tool. Pick one that helps you save, pay bills and borrow fairly when the time comes.'},
  checking:{t:'Checking accounts',i:'💳',what:'Checking is for money that moves. Paychecks come in. Bills, debit swipes and transfers go out.',you:'Turn on low balance alerts and look at your account once a week. Most money problems start with not looking.'},
  savings:{t:'Savings accounts',i:'🐖',what:'Savings is for money you are not spending yet. It earns interest and stays separate from your spending money.',you:'Open a savings account and name it after a goal. Even $10 a paycheck builds the habit.'},
  apy:{t:'APY vs. APR',i:'📊',what:'APY is what you EARN on savings each year, with compounding counted. APR is what you PAY to borrow each year, with certain fees counted. Same kind of number, opposite sides of the counter.',you:'When saving, look for a higher APY. When borrowing, look for a lower APR. Always compare the same kind of number.'},
  compound:{t:'Compound interest',i:'📈',what:'You earn interest on your interest. The Rule of 72: divide 72 by the rate to estimate how many years money takes to double. At 4%, about 18 years.',you:'Start early. Time does more of the work than the amount does.'},
  cd:{t:'Certificates of Deposit',i:'🔒',what:'A CD pays a set rate for a set time. Take the money out early and you usually pay a penalty.',you:'Use a CD only for money with a known future date, like tuition next fall.'},
  fdic:{t:'FDIC insurance',i:'🛡️',what:'At an FDIC-insured bank, deposits are covered up to $250,000 per depositor, per bank, per ownership category. If the bank fails, the government backs that money. Stocks, crypto and safe deposit box contents are not covered.',you:'Before you open an account, look for "Member FDIC" (or NCUA at a credit union). No sign? Ask why.'},
  checks:{t:'How to read a check',i:'✍️',what:'A good check has a date, a payee, matching number and word amounts, and a signature. The back needs the endorsement of the person cashing it. Banks can refuse checks older than six months.',you:'Sign the back only when you are at the bank or depositing it. Write "For Deposit Only" for extra safety.'},
  debit:{t:'Debit vs. credit',i:'🔁',what:'Debit spends your own money right now. Credit borrows the bank\'s money, and you owe it back. Credit builds your score. Debit does not.',you:'Use credit like debit: only buy what you could pay for today, and pay the full balance every month.'},
  overdraft:{t:'Overdraft fees',i:'⚠️',what:'An overdraft is when you spend more than you have and the bank covers it, often for a fee. For everyday debit and ATM use, the bank must get your OK before charging an overdraft fee.',you:'You can say no to debit overdraft coverage. Your card just gets declined, and that is often cheaper.'},
  score:{t:'Your credit score',i:'🎯',what:'A FICO score runs 300 to 850. Payment history counts about 35%, amounts owed 30%, length of history 15%, new credit 10%, and credit mix 10%.',you:'Pay every bill on time. Check your reports for free at AnnualCreditReport.com. A report is not a score, but it shows what lenders see.'},
  fivec:{t:'The 5 Cs of credit',i:'🖐️',what:'Lenders look at Character (track record), Capacity (can you afford it), Capital (your own money in), Collateral (what backs the loan) and Conditions (the purpose and the economy).',you:'Before you apply, run the 5 Cs on yourself. You will know what a lender will ask.'},
  dti:{t:'Debt-to-income ratio',i:'⚖️',what:'DTI is your monthly debt payments divided by your monthly income before taxes. Many lenders want it under about 36% to 43%.',you:'Before taking on a payment, add up your debts and divide by your income. If it is high, wait or borrow less.'},
  pricing:{t:'Why rates differ',i:'🏷️',what:'Riskier borrowers usually pay higher rates. This is called risk-based pricing. A better score can save thousands of dollars on the same loan.',you:'Get quotes from more than one lender. Rate shopping for a car or home within a short window usually has little effect on your score.'},
  total:{t:'The true cost of a loan',i:'🧮',what:'Monthly payment is only part of the story. A longer loan has a smaller payment but costs much more in total interest.',you:'Ask: "How much will I pay in total?" Compare that number, not just the monthly one.'},
  collateral:{t:'Secured vs. unsecured',i:'🔑',what:'A secured loan is backed by something the lender can take if you stop paying, like a car. That is why secured loans often cost less.',you:'Never put up something you cannot afford to lose.'},
  liquidity:{t:'Liquidity',i:'💧',what:'Liquidity means having cash ready when people want it. The Federal Reserve\'s reserve requirement has been 0% since March 2020, so banks and regulators manage this with their own planning, not one fixed number.',you:'You need liquidity too. Aim for an emergency fund of a few months of expenses you can reach right away.'},
  run:{t:'Bank runs',i:'🏃',what:'If everyone asks for their money at once, even a healthy bank can struggle, because deposits are loaned out. FDIC insurance was created in 1933 to stop this kind of panic.',you:'If you hear a rumor, check the facts first. Insured deposits are protected up to the limit, so you do not need to race to the door.'},
  fed:{t:'The Fed and rates',i:'🦅',what:'The Federal Reserve sets a target for short-term rates. When it goes up, savings and loan rates tend to follow. When it goes down, they tend to fall.',you:'Rising rates are good for savers and hard on borrowers. Thinking about a big loan? Check where rates are.'},
  bonds:{t:'Why rising rates hurt bonds',i:'📉',what:'When rates rise, old bonds that pay less lose market value. If a bank must sell them in a hurry, that paper loss becomes a real loss. It helped bring down a few big banks in 2023.',you:'Money you may need soon should not be somewhere that can drop in value when you have to sell.'},
  phish:{t:'Spotting scams',i:'🎣',what:'Scammers rush you, scare you and ask for codes or passwords. A real bank will never ask for your password or one-time code by text, email or phone.',you:'Hang up, then call the number on the back of your card. Never share a code. Ever.'},
  rege:{t:'Lost card? Move fast',i:'🚨',what:'For a lost debit card, report within 2 business days and your loss is generally capped at $50. Wait longer and it can reach $500 or more. Credit card liability is capped at $50.',you:'Save your bank\'s number in your phone today. Most apps let you freeze a card instantly.'},
  ctr:{t:'The $10,000 cash report',i:'📑',what:'Banks must report cash transactions over $10,000 to the government. It is routine and does not mean you did anything wrong. Splitting cash up to dodge the report is called structuring, and that is a crime.',you:'If you ever handle a large amount of cash, just do it normally. Honest is simple.'},
  fair:{t:'Fair lending',i:'🤝',what:'The Equal Credit Opportunity Act says lenders cannot judge you on race, color, religion, national origin, sex, marital status or age, or because you receive public assistance.',you:'If you are denied credit, you have the right to know why. Ask for the reasons.'},
  fees:{t:'Shop for fees',i:'🛒',what:'Monthly fees, ATM fees and overdraft fees add up fast. A $10 monthly fee is $120 a year. That is real money, gone.',you:'Ask a bank: How do I avoid the monthly fee? What are the ATM fees? Most will tell you.'},
  autosave:{t:'Pay yourself first',i:'⚡',what:'Direct deposit sends your paycheck straight to your account. Many jobs let you split it, so part goes to savings before you ever see it.',you:'With your first job, set up an automatic split. Money you never see is money you never miss.'},
  teens:{t:'Accounts for teens',i:'🎒',what:'Most banks need a parent or guardian on the account until you turn 18. Under 21, you generally need your own income or a co-signer for a credit card.',you:'Ask a trusted adult to go with you and open a teen account. Bring your ID and Social Security number.'},
  choose:{t:'Bank, credit union or online?',i:'🧭',what:'Banks are companies. Credit unions are owned by members. Online banks often pay more but have no branch. Community banks lend close to home and know their neighbors.',you:'List what you need most: branches, ATMs, app, rates, a person to talk to. Then compare.'},
  trust:{t:'Fiduciary duty',i:'🤲',what:'A fiduciary must put your interests ahead of their own. A trust department manages money for families under that duty.',you:'When someone gives you money advice, ask: "Are you a fiduciary?" and "How do you get paid?"'},
  community:{t:'Money that stays close',i:'🏘️',what:'When you bank locally, your deposit can become a loan for the bakery down the street. The money keeps working in your own town.',you:'Look at who lends in your town. Ask what they do for the community.'}
};

/* monthly events: a choice with a lesson. Effects are applied to the bank state. */
const EVENTS=[
  {id:'fedup',when:s=>s.month>=4&&s.fed<6,run:'fedup'},
  {id:'feddown',when:s=>s.month>=6&&s.fed>1.5,run:'feddown'},
  {id:'hr_raise',when:s=>s.staff.length>=2,title:'A raise request',lesson:null,text:s=>`${pick(s.staff).name} asks for a raise. "I handle more customers than ever, and Bolt Savings is hiring."`,choices:[
    {t:'Give everyone a 10% raise',r:'Payroll goes up, but your bots feel valued. Keeping a good worker is cheaper than training a new one.',fx:s=>{s.staff.forEach(b=>{b.pay=Math.round(b.pay*1.1);b.skill=Math.min(5,b.skill+.15);});s.morale=clamp(s.morale+12,0,100);}},
    {t:'Hold pay flat for now',r:'You save money this month, but morale slips. Unhappy staff work slower and make more mistakes.',fx:s=>{s.morale=clamp(s.morale-14,0,100);}}]},
  {id:'hr_train',when:s=>s.staff.length>=2&&s.cash>20000,title:'Training day',text:()=>'The Bot City Bankers Association offers a training course for $6,000. Better staff make fewer mistakes.',choices:[
    {t:'Send the team ($6,000)',r:'Training pays back slowly and for a long time. Your bots got better at their jobs.',fx:s=>{s.ledger.other+=6000;s.cash-=6000;s.staff.forEach(b=>b.skill=Math.min(5,b.skill+.4));s.compliance=clamp(s.compliance+6,0,100);}},
    {t:'Skip it this year',r:'You kept the cash. That is fine sometimes. Skip it too often and mistakes start to add up.',fx:s=>{s.compliance=clamp(s.compliance-3,0,100);}}]},
  {id:'reg_paper',when:s=>s.month>=3,title:'New rule from regulators',text:()=>'The examiners want clearer loan disclosures, so borrowers can see the APR and total cost before signing.',lesson:'total',choices:[
    {t:'Update every form ($3,000)',r:'Clear disclosures protect customers and protect you. Regulators remember who took this seriously.',fx:s=>{s.ledger.other+=3000;s.cash-=3000;s.compliance=clamp(s.compliance+10,0,100);}},
    {t:'Do it next quarter',r:'Putting off compliance is a bet that nobody checks. Somebody always checks.',fx:s=>{s.compliance=clamp(s.compliance-12,0,100);}}]},
  {id:'overdraft',when:s=>s.month>=3&&!s.flags.overdraftAsked,title:'A fee idea',lesson:'overdraft',text:()=>'Your finance bot has an idea: "Let\'s auto-enroll everyone in overdraft coverage and charge $35 a pop. Big income!" But the rules say customers must opt in for everyday debit overdrafts.',choices:[
    {t:'Only with clear customer opt-in',r:'You follow the rule and keep trust. Fee income is smaller, but customers stay.',fx:s=>{s.flags.overdraftAsked=1;s.rep=clamp(s.rep+4,0,100);s.compliance=clamp(s.compliance+6,0,100);}},
    {t:'Enroll everyone anyway',r:'You earn $9,000 this month, then regulators and angry customers show up. Fees that surprise people cost more than they earn.',fx:s=>{s.flags.overdraftAsked=1;s.cash+=9000;s.ledger.fees+=9000;s.rep=clamp(s.rep-12,0,100);s.compliance=clamp(s.compliance-25,0,100);}}]},
  {id:'recession',when:s=>s.month>=10&&s.econ<1.4,run:'recession'},
  {id:'boom',when:s=>s.month>=5&&s.econ>.9,run:'boom'},
  {id:'scamwave',when:s=>s.built.digital||s.month>=14,title:'Scam wave!',lesson:'phish',text:()=>'Fake "BotBank Security" texts are going around Bot City. They ask customers to reply with their one-time code.',choices:[
    {t:'Warn every customer ($2,500)',r:'A warning costs little. Your customers learned the rule: a real bank will never ask for your code.',fx:s=>{s.ledger.other+=2500;s.cash-=2500;s.rep=clamp(s.rep+5,0,100);}},
    {t:'Stay quiet to avoid scaring people',r:'Twelve customers lost money, and trust took a hit. Silence helps scammers.',fx:s=>{s.rep=clamp(s.rep-9,0,100);}}]},
  {id:'ctrcase',when:s=>s.month>=7,title:'A big cash deposit',lesson:'ctr',text:()=>'A customer wants to deposit $14,000 in cash and asks you to split it across two days "so nobody has to fill out forms."',choices:[
    {t:'Process it normally and file the report',r:'Correct. Cash over $10,000 gets reported, and asking to dodge that is a red flag your bank must take seriously.',fx:s=>{s.compliance=clamp(s.compliance+8,0,100);}},
    {t:'Split it to be friendly',r:'That is called structuring. It is illegal, and helping is serious trouble for the bank.',fx:s=>{s.compliance=clamp(s.compliance-30,0,100);s.rep=clamp(s.rep-6,0,100);}}]},
  {id:'fair',when:s=>s.built.loanoffice&&s.month>=5,title:'A note on a file',lesson:'fair',text:()=>'A sticky note on a loan file says: "Deny. They are from the wrong side of town." The numbers on the application look strong.',choices:[
    {t:'Remove the note and review the numbers',r:'Right call. Judging someone by where they come from can be illegal discrimination. Lending decisions rest on the numbers.',fx:s=>{s.compliance=clamp(s.compliance+8,0,100);s.rep=clamp(s.rep+3,0,100);}},
    {t:'Follow the note',r:'That is unfair and can break fair lending law. Fines are big. The harm to real families is bigger.',fx:s=>{s.compliance=clamp(s.compliance-30,0,100);s.rep=clamp(s.rep-8,0,100);}}]},
  {id:'community',when:s=>s.month>=4,title:'School visit',lesson:'choose',text:()=>'Bot City High asks you to teach a free class on how banks work. It would take your best bot off the floor for a day.',choices:[
    {t:'Teach the class',r:'Those students will remember who taught them about money. Community banks earn trust this way.',fx:s=>{s.rep=clamp(s.rep+6,0,100);}},
    {t:'Too busy this month',r:'Fair enough. The floor stayed staffed, but you missed a chance to show up for your town.',fx:s=>{}}]},
  {id:'bigdep',when:s=>s.month>=6&&assetsTotal(s)>400000,title:'A big depositor',lesson:'liquidity',text:()=>'Sprocket Bakery wants to move $120,000 here, but only if you promise they can pull it out on short notice.',choices:[
    {t:'Take it and keep extra cash ready',r:'Hot money can leave as fast as it came. Keeping it liquid is the smart way to accept it.',fx:s=>{s.chk+=120000;s.cash+=120000;s.flags.hot=120000;}},
    {t:'Politely pass',r:'You stayed steady. Slower growth, fewer surprises. There is no wrong answer here, only trade-offs.',fx:s=>{}}]}
];

/* MoneyBot tips between shifts */
const TIPS=[
  'Check the <b>spread</b>: your loan rate minus your savings rate. If it is too thin, you cannot pay the bills.',
  'Rates too low on savings? Customers notice. Too high? You are paying away your profit.',
  'Keep some cash handy. Lending every dollar feels great until the first big withdrawal.',
  'Every bot you hire is a bill. Hire when the line is long, not before.',
  'A loan is only good money if it gets paid back. High rates cannot fix a bad loan.',
  'The Playbook has a real-life move on every card. That part is for you, not the bots.',
  'Your paycheck is yours. The vault is not. Bankers get in very real trouble for mixing those up.'
];

/* fraud lab: phishing + card alerts */
const PHISH=[
  {m:'BOTBANK ALERT: Your account is LOCKED. Reply with your 6-digit code in 10 minutes or lose access!',from:'Text from 555-0188',scam:1,why:'Rush plus a request for a code. A real bank will never ask for your code.'},
  {m:'Your statement for October is ready. Log in through the BotBank app to view it.',from:'App notification',scam:0,why:'No link, no code, no pressure. It points you to the real app.'},
  {m:'Congrats!! You won a $500 BotBank gift card. Pay $4.99 shipping at bb-prizes.net',from:'Email from prizes@bb-prizes.net',scam:1,why:'Prize you never entered, an odd website, and a small payment to get your card number.'},
  {m:'Did you just spend $18.42 at Gear Garage? Reply YES or NO.',from:'Text from your bank\'s short code',scam:0,why:'Real fraud alerts ask yes or no. They never ask for passwords or codes.'},
  {m:'This is the BotBank fraud team. To protect your money, move it into this "safe account" right now.',from:'Phone call',scam:1,why:'No real bank asks you to move money to a safe account. Hang up and call the number on your card.'},
  {m:'Your new debit card is arriving soon. Activate it in the app or at any ATM.',from:'Letter in the mail',scam:0,why:'Normal mail with normal options. Nobody asks you to hand over details.'},
  {m:'I am your cousin in trouble. Send gift cards NOW and do not tell anyone.',from:'Text from unknown number',scam:1,why:'Urgent, secret, and paid with gift cards. Those are three classic scam signs.'},
  {m:'Hi! Your employer set up direct deposit with us. Your first paycheck has posted.',from:'App notification',scam:0,why:'Informational and asks you for nothing.'},
  {m:'FINAL NOTICE: Unpaid toll of $3.15. Pay now at tolls-botcity-pay.co or face a fine.',from:'Text from 555-0142',scam:1,why:'Fake toll texts are a very common scam. Look up the real agency on your own.'}
];
const CARDFRAUD=[
  {who:'Mira Byte',home:'Bot City',rows:[['Compound Coffee','Bot City',5.4],['Widget Mart','Bot City',42.1],['ELECTRONICS HUB','Overseas',1899],['ELECTRONICS HUB','Overseas',1899]],bad:1,why:'Two huge charges in a row, far from home, right after normal coffee. Classic stolen card.'},
  {who:'Otis Gear',home:'Bot City',rows:[['Gear Garage','Bot City',86],['Bot City Grocer','Bot City',64.2],['Streaming Plus','Online',14.99],['Dash Delivery','Bot City',23.5]],bad:0,why:'Normal spending near home. Freezing this card would annoy a good customer.'},
  {who:'Nia Volt',home:'Bot City',rows:[['GIFT CARD KIOSK','Bot City',200],['GIFT CARD KIOSK','Bot City',200],['GIFT CARD KIOSK','Bot City',200],['Penny Bakery','Bot City',6.5]],bad:1,why:'Repeated gift card buys are a big red flag. Often the customer is being scammed.'},
  {who:'Hugo Ohm',home:'Bot City',rows:[['Orbit Travel','Online',412],['Hotel Sprocket','Seaside',188],['Seaside Cafe','Seaside',31],['Seaside Surf Shop','Seaside',55]],bad:0,why:'A trip. Travel booked, then normal purchases in the same town. Looks like a vacation.'},
  {who:'Tess Flux',home:'Bot City',rows:[['GAS N GO','Bot City',1],['GAS N GO','Bot City',1],['LUXE WATCHES','Online',3260],['Penny Bakery','Bot City',5]],bad:1,why:'Tiny $1 test charges, then a giant purchase. That is how thieves test a stolen card.'}
];

/* president's personal shop: bought from YOUR account, never the bank's */
const SHOP=[
  {id:'suit-navy',name:'Navy Suit Finish',price:600,kind:'suit',val:'#1E3A8A'},
  {id:'suit-emerald',name:'Emerald Suit Finish',price:900,kind:'suit',val:'#0B6B4B'},
  {id:'suit-gold',name:'Gold Chrome Finish',price:4500,kind:'suit',val:'#F4C542'},
  {id:'hat-fedora',name:'Banker\'s Hat',price:1200,kind:'hat',val:'fedora'},
  {id:'hat-crown',name:'Bank of the Year Crown',price:9000,kind:'hat',val:'crown'},
  {id:'tie-green',name:'MoneyBot Green Tie',price:350,kind:'tie',val:'#39E75F'},
  {id:'tie-gold',name:'Gold Tie',price:700,kind:'tie',val:'#F4C542'}
];
const TUTORIAL_STEPS=[]; /* tutorial is driven by chapter goals in main.js */
