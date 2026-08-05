(() => {
  "use strict";

  // ===========================
  // DATA: 60 cards across 10 scam categories
  // ===========================
  const CATEGORIES = {
    phishing: { label: "Phishing", icon: "🎣" },
    ecommerce: { label: "E-Commerce", icon: "📦" },
    investment: { label: "Investment", icon: "📈" },
    romance: { label: "Romance", icon: "💔" },
    job: { label: "Job Scam", icon: "💼" },
    tech: { label: "Tech Support", icon: "🖥" },
    social: { label: "Social Media", icon: "💬" },
    crypto: { label: "Crypto", icon: "₿" },
    government: { label: "Government", icon: "🏛" },
    charity: { label: "Charity", icon: "🤝" },
  };

  const RAW_CARDS = [
    // Phishing
    { sender: "IRS Refund Unit", text: "Your tax refund of $1,247 is pending. Click here to verify your banking details and receive it within 24 hours.", fraud: true, category: "phishing", difficulty: 1, clues: ["Urgency", "Suspicious link", "Unsolicited"], hint: "The IRS does not email or text refund links. They send letters." },
    { sender: "Bank Alert", text: "Suspicious charge detected on your card ending in 4821. Reply Y to confirm or call the number on your card.", fraud: false, category: "phishing", difficulty: 2, clues: ["Specific detail", "No link", "Tells you to call official number"], hint: "Good alerts give a detail and point you to your real card number." },
    { sender: "Security Team", text: "We noticed unusual login activity. Verify your password here to avoid account lockout.", fraud: true, category: "phishing", difficulty: 1, clues: ["Fear tactic", "Password link"], hint: "Never enter your password from a link in an unexpected message." },
    { sender: "Chase", text: "Your statement is ready. Log in at chase.com to review recent transactions.", fraud: false, category: "phishing", difficulty: 2, clues: ["Expected communication", "Real domain", "No urgency"], hint: "Expected bank statements with no surprise action required are usually real." },
    { sender: "Netflix Support", text: "Your account will be suspended today. Update payment info at netflix-billing.net to keep watching.", fraud: true, category: "phishing", difficulty: 2, clues: ["Threat", "Lookalike domain"], hint: "Check the domain carefully. netflix-billing.net is not netflix.com." },
    { sender: "Dropbox", text: "Someone shared a folder with you. Sign in to dropbox.com to view it.", fraud: false, category: "phishing", difficulty: 3, clues: ["Expected service", "No money ask", "Real domain"], hint: "If you use Dropbox and the domain is real, this is normal." },

    // E-Commerce
    { sender: "FedEx Delivery", text: "Package on hold. Pay a $2.99 redelivery fee now or it will be returned to sender.", fraud: true, category: "ecommerce", difficulty: 1, clues: ["Small fee trap", "Threat of loss"], hint: "Real couriers do not demand tiny fees via random texts." },
    { sender: "Amazon", text: "Your order #112-9342021 has shipped and will arrive Thursday.", fraud: false, category: "ecommerce", difficulty: 1, clues: ["Order you made", "Specific details"], hint: "Expected shipping updates with order numbers are usually real." },
    { sender: "Walmart Winner", text: "CONGRATULATIONS! You won a $1,000 Walmart gift card. Pay a $9.99 processing fee to claim it.", fraud: true, category: "ecommerce", difficulty: 1, clues: ["Unexpected prize", "Fee to collect"], hint: "You never have to pay to collect a real prize." },
    { sender: "eBay", text: "Your listing sold. The buyer paid. Ship within 3 days to receive funds.", fraud: false, category: "ecommerce", difficulty: 2, clues: ["Expected sale", "No external link pressure"], hint: "Expected marketplace activity on the real app is fine." },
    { sender: "DHL Express", text: "Customs duty of $12.80 due on your package. Pay now via this link to release shipment.", fraud: true, category: "ecommerce", difficulty: 3, clues: ["Unexpected fee", "Unsolicited link"], hint: "Real customs notices come through official postal channels, not random texts." },
    { sender: "Target", text: "Your order #T-883921 is ready for pickup at the counter.", fraud: false, category: "ecommerce", difficulty: 1, clues: ["Order you placed", "Pickup notice"], hint: "Expected pickup notices from stores you ordered from are real." },

    // Investment
    { sender: "CryptoWin Bot", text: "Guaranteed 340% returns in 7 days. Deposit now — spots limited to the first 50 people.", fraud: true, category: "investment", difficulty: 1, clues: ["Guaranteed returns", "Fake scarcity"], hint: "Guaranteed high returns are a classic fraud signal. No one can guarantee that." },
    { sender: "Fidelity", text: "Your quarterly portfolio summary is available. Review your allocations at fidelity.com.", fraud: false, category: "investment", difficulty: 2, clues: ["Expected statement", "Real domain", "No urgency"], hint: "Expected brokerage statements are normal." },
    { sender: "Wealth Guru", text: "I turned $1,000 into $100,000 in 30 days. Reply START to copy my exact trades.", fraud: true, category: "investment", difficulty: 2, clues: ["Unrealistic gains", "No track record", "Unsolicited"], hint: "If it worked that well, they wouldn't be selling it via text." },
    { sender: "Vanguard", text: "Your dividend of $47.12 was reinvested in VTI. View details in your account.", fraud: false, category: "investment", difficulty: 3, clues: ["Specific amounts", "Expected event", "Real fund ticker"], hint: "Dividend reinvestment notices from real brokerages are routine." },
    { sender: "PENNY STOCK PICK", text: "HOT TIP: XYZ Corp is about to explode 500%. Buy before market open.", fraud: true, category: "investment", difficulty: 2, clues: ["Pump and dump", "Urgency", "No research"], hint: "Pump-and-dump schemes push cheap stocks to trap buyers." },
    { sender: "Schwab", text: "Your recurring investment of $100 into SWTSX has been executed.", fraud: false, category: "investment", difficulty: 3, clues: ["Recurring setup", "Specific fund", "No action needed"], hint: "Automated investment confirmations you set up yourself are real." },

    // Romance
    { sender: "Alex ❤️", text: "I finally found you. I need help paying for my flight home so we can finally meet. Wire $800.", fraud: true, category: "romance", difficulty: 2, clues: ["Never met", "Money request", "Emotional pressure"], hint: "Romance scammers build trust then create an emergency." },
    { sender: "Bumble Match", text: "Hey! You seem cool. Want to grab coffee this weekend?", fraud: false, category: "romance", difficulty: 1, clues: ["Normal chat", "No money ask"], hint: "Normal dating app conversation without financial pressure is fine." },
    { sender: "Sarah", text: "My wallet was stolen abroad. Can you send $500 via Western Union? I'll pay you back when I'm home.", fraud: true, category: "romance", difficulty: 2, clues: ["Wire transfer", "Crisis story", "Never met"], hint: "Crisis + wire transfer + online-only relationship = red flag." },
    { sender: "Hinge", text: "You have a new match. Open the app to view their profile.", fraud: false, category: "romance", difficulty: 1, clues: ["App notification", "No link"], hint: "App push notifications without financial asks are normal." },
    { sender: "Deployed Soldier", text: "I love you. I found a package of gold but need $1,200 to ship it to you.", fraud: true, category: "romance", difficulty: 2, clues: ["Too fast", "Fake valuable", "Upfront cost"], hint: "The 'gold package' scam is one of the oldest romance frauds." },

    // Job Scam
    { sender: "Remote Jobs HQ", text: "Congratulations! You got the job. Send $150 for your background check kit.", fraud: true, category: "job", difficulty: 1, clues: ["Upfront fee", "No interview"], hint: "Real employers don't make you pay for background checks before hiring." },
    { sender: "LinkedIn", text: "A recruiter viewed your profile. Update your skills to appear in more searches.", fraud: false, category: "job", difficulty: 2, clues: ["Platform notification", "No money ask"], hint: "LinkedIn engagement nudges without payment pressure are normal." },
    { sender: "HR Department", text: "Your resume was selected. Buy equipment from our approved vendor and we'll reimburse you.", fraud: true, category: "job", difficulty: 3, clues: ["Buy first", "Reimburse later", "Unsolicited"], hint: "Reimbursement-based equipment purchases are a common job scam." },
    { sender: "Indeed", text: "Your application for Marketing Coordinator was submitted to Acme Inc.", fraud: false, category: "job", difficulty: 1, clues: ["Expected application", "Specific job"], hint: "Expected job application confirmations are real." },
    { sender: "Mystery Shopper Inc.", text: "Deposit this $2,400 check, keep $400, and wire the rest back to evaluate Western Union.", fraud: true, category: "job", difficulty: 2, clues: ["Fake check", "Wire back", "Too easy"], hint: "Fake check scams always involve depositing and sending money back." },

    // Tech Support
    { sender: "Microsoft Support", text: "Your PC is infected. Call this number immediately or your bank accounts will be drained.", fraud: true, category: "tech", difficulty: 1, clues: ["Fear", "Unsolicited call"], hint: "Microsoft does not call or text you about viruses." },
    { sender: "Apple", text: "Your Apple ID was used to sign in on a new device near Austin, TX. Was this you?", fraud: false, category: "tech", difficulty: 2, clues: ["Specific detail", "Asks if it was you", "Real platform"], hint: "Security alerts from real platforms that ask 'was this you?' are normal." },
    { sender: "Geek Squad", text: "Your Geek Squad renewal of $399 will auto-renew. Call to cancel or dispute.", fraud: true, category: "tech", difficulty: 2, clues: ["Unexpected charge", "Call to cancel", "Scare tactic"], hint: "Fake subscription renewal calls are a huge tech support scam pattern." },
    { sender: "Google", text: "A new device signed in to your Gmail from Chrome on Windows. If this wasn't you, change your password.", fraud: false, category: "tech", difficulty: 2, clues: ["Specific device/browser", "Directed to real account"], hint: "Expected security emails from Google are usually real if they reference real devices." },
    { sender: "Norton", text: "Virus found on your computer. Click here to download removal tool.", fraud: true, category: "tech", difficulty: 1, clues: ["Unsolicited", "Download link"], hint: "Antivirus does not alert you via random popups or texts." },

    // Social Media
    { sender: "Instagram", text: "Your account will be banned in 24 hours. Verify your identity at ig-verify-support.com.", fraud: true, category: "social", difficulty: 2, clues: ["Threat", "Lookalike domain"], hint: "Real platforms ban via in-app notices, not third-party links." },
    { sender: "TikTok", text: "Your video hit 10,000 views. Keep creating!", fraud: false, category: "social", difficulty: 1, clues: ["Engagement update", "No action needed"], hint: "App engagement milestones without money asks are fine." },
    { sender: "Verified Badge Team", text: "Pay $49.99 to get your account verified today. Limited spots available.", fraud: true, category: "social", difficulty: 1, clues: ["Pay for verification", "Scarcity"], hint: "Real verification is never sold via random DMs or texts." },
    { sender: "Twitter/X", text: "Your password was changed. If you didn't do this, secure your account now.", fraud: false, category: "social", difficulty: 2, clues: ["Security event", "Directed to official settings"], hint: "Real password-change alerts direct you to the official app/website." },
    { sender: "Influencer Manager", text: "I want to sponsor you. First, send $75 for shipping the brand package.", fraud: true, category: "social", difficulty: 3, clues: ["Pay to get deal", "Unsolicited"], hint: "Real brand deals do not require you to pay upfront." },

    // Crypto
    { sender: "Coinbase", text: "Your recurring buy of $50 ETH executed at 2:34 PM. View receipt in the app.", fraud: false, category: "crypto", difficulty: 2, clues: ["Expected trade", "Specific details", "No link"], hint: "Expected crypto exchange confirmations are normal." },
    { sender: "ETH Giveaway", text: "Elon Musk is doubling all ETH sent to this address. Send 0.5 ETH, get 1.0 ETH back.", fraud: true, category: "crypto", difficulty: 1, clues: ["Celebrity impersonation", "Send crypto first"], hint: "No one is doubling your crypto. This is the oldest crypto scam." },
    { sender: "Metamask", text: "Your wallet is at risk. Enter your seed phrase here to secure your assets.", fraud: true, category: "crypto", difficulty: 1, clues: ["Seed phrase request", "Fear tactic"], hint: "Never enter your seed phrase anywhere except your wallet app during recovery." },
    { sender: "Kraken", text: "Your deposit of $200 has cleared and is available for trading.", fraud: false, category: "crypto", difficulty: 2, clues: ["Expected deposit", "No action required"], hint: "Expected deposit clearances from real exchanges are normal." },
    { sender: "Airdrop Bot", text: "Claim your free $2,000 airdrop. Connect your wallet and approve the smart contract.", fraud: true, category: "crypto", difficulty: 3, clues: ["Free money", "Approve contract", "Unsolicited"], hint: "Fake airdrops drain wallets when you approve malicious contracts." },

    // Government
    { sender: "Social Security Admin", text: "Your SSN has been suspended due to suspicious activity. Call immediately to reinstate.", fraud: true, category: "government", difficulty: 2, clues: ["Threat", "Unsolicited"], hint: "The SSA does not suspend SSNs or demand calls via text." },
    { sender: "DMV", text: "Your driver's license renewal confirmation #DL-9928371. No action needed.", fraud: false, category: "government", difficulty: 2, clues: ["Confirmation", "Specific ID", "No payment link"], hint: "Expected renewal confirmations without payment pressure are real." },
    { sender: "Student Loan Relief", text: "Act immediately! Your loan forgiveness application will expire tonight. Pay $99 to secure your spot.", fraud: true, category: "government", difficulty: 1, clues: ["Expiring offer", "Upfront fee"], hint: "Real government programs do not charge fees or expire in hours." },
    { sender: "USPS", text: "Your package is out for delivery. Track at tools.usps.com.", fraud: false, category: "government", difficulty: 1, clues: ["Expected delivery", "Real domain"], hint: "Expected USPS tracking updates are real." },
    { sender: "Jury Duty", text: "You missed jury duty. Pay a $500 fine now or a warrant will be issued.", fraud: true, category: "government", difficulty: 2, clues: ["Threat of arrest", "Fine via text"], hint: "Courts do not text fines or warrant threats." },

    // Charity
    { sender: "Disaster Relief Fund", text: "Urgent: Children need help now. Donate Bitcoin to this wallet for instant aid.", fraud: true, category: "charity", difficulty: 2, clues: ["Crypto donation", "Emotional manipulation", "No verifiable org"], hint: "Real charities take donations through official websites, not random crypto wallets." },
    { sender: "United Way", text: "Thank you for your monthly $25 donation. Your receipt is attached.", fraud: false, category: "charity", difficulty: 2, clues: ["Expected receipt", "Specific amount"], hint: "Expected donation receipts from real charities are normal." },
    { sender: "GoFundMe", text: "Your donation to Sarah's medical fund has been processed. Thank you.", fraud: false, category: "charity", difficulty: 1, clues: ["Specific campaign", "Expected confirmation"], hint: "Expected crowdfunding confirmations are real." },
    { sender: "Police Charity", text: "Local officers need your support. Donate $100 by text and we'll add you to our donor wall.", fraud: true, category: "charity", difficulty: 3, clues: ["Pressure", "Text donation", "Vague charity"], hint: "Scammers impersonate police and fire charities frequently. Verify independently." },

    // Extra mixed difficulty
    { sender: "Boss (Dave)", text: "I'm in back-to-back meetings. Can you buy 5 gift cards for a client and send the codes? I'll reimburse you.", fraud: true, category: "job", difficulty: 2, clues: ["Gift card pressure", "Impersonation"], hint: "Gift card requests through text or email are a top scam pattern." },
    { sender: "Mom", text: "Can you Venmo me $40 for groceries? I'll pay you back Friday.", fraud: false, category: "social", difficulty: 1, clues: ["Known sender", "Specific amount"], hint: "Messages from people you know with normal requests are usually fine." },
    { sender: "Netflix", text: "Your monthly invoice for $15.49 is ready. View account at netflix.com.", fraud: false, category: "phishing", difficulty: 2, clues: ["Expected bill", "Real domain"], hint: "Check the domain and whether you expected the charge." },
    { sender: "LinkedIn", text: "Jordan commented on your post: 'Great insights — sent you a connection request.'", fraud: false, category: "social", difficulty: 1, clues: ["Normal notification", "No money ask"], hint: "Social notifications without money or login pressure are usually legit." },
  ];

  // ===========================
  // STATE
  // ===========================
  const state = {
    deck: [],
    index: 0,
    score: 0,
    trust: 100,
    streak: 0,
    bestStreak: 0,
    correct: 0,
    wrong: 0,
    mode: "normal",
    status: "start",
    startTime: 0,
    categoryStats: {},
    sessionBadges: [],
    _answering: false,
  };

  const STORAGE_KEY = "fraudOrNah_v2";
  const DAILY_KEY = "fraudOrNah_daily";

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveProgress(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }

  function getDailySeed() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  // ===========================
  // AUDIO ENGINE (Web Audio API)
  // ===========================
  const AudioEngine = (() => {
    let ctx = null;
    let masterGain = null;
    let musicOsc = null;
    let musicGain = null;
    let enabled = true;

    function init() {
      if (ctx) return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      ctx = new AudioContext();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.25;
      masterGain.connect(ctx.destination);
    }

    function tone({ freq = 440, type = "sine", duration = 0.15, startGain = 0.0001, peakGain = 0.3, attack = 0.01, release = 0.12, slideTo }) {
      if (!enabled || !ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
      g.gain.setValueAtTime(startGain, now);
      g.gain.exponentialRampToValueAtTime(peakGain, now + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(g).connect(masterGain);
      osc.start(now);
      osc.stop(now + duration + 0.05);
    }

    function correct() {
      tone({ freq: 880, type: "sine", duration: 0.18, peakGain: 0.25, slideTo: 1320 });
      setTimeout(() => tone({ freq: 1320, type: "sine", duration: 0.22, peakGain: 0.2, slideTo: 1760 }), 80);
    }

    function wrong() {
      tone({ freq: 220, type: "sawtooth", duration: 0.28, peakGain: 0.2, slideTo: 110 });
    }

    function swipe() {
      tone({ freq: 320, type: "triangle", duration: 0.08, peakGain: 0.08, slideTo: 240 });
    }

    function win() {
      [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone({ freq: f, type: "sine", duration: 0.35, peakGain: 0.25 }), i * 100));
    }

    function lose() {
      [300, 250, 200, 150].forEach((f, i) => setTimeout(() => tone({ freq: f, type: "sawtooth", duration: 0.35, peakGain: 0.18 }), i * 120));
    }

    function startMusic() {
      if (!enabled || !ctx || musicOsc) return;
      const now = ctx.currentTime;
      musicOsc = ctx.createOscillator();
      musicGain = ctx.createGain();
      musicOsc.type = "sine";
      musicOsc.frequency.setValueAtTime(110, now);
      musicGain.gain.value = 0.015;
      // Very subtle ambient drone
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.1;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 20;
      lfo.connect(lfoGain);
      lfoGain.connect(musicOsc.frequency);
      lfo.start();
      musicOsc.connect(musicGain).connect(masterGain);
      musicOsc.start();
    }

    function stopMusic() {
      if (musicOsc) {
        try { musicOsc.stop(); } catch {}
        musicOsc = null;
      }
    }

    function toggle() {
      enabled = !enabled;
      if (!enabled) stopMusic();
      else if (ctx) startMusic();
      return enabled;
    }

    return { init, correct, wrong, swipe, win, lose, startMusic, stopMusic, toggle };
  })();

  // ===========================
  // HAPTICS
  // ===========================
  function haptic(pattern) {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }

  // ===========================
  // UTILS
  // ===========================
  function seededRandom(seed) {
    let s = seed;
    return function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  function stringHash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
    return Math.abs(h);
  }

  function shuffle(arr, rng = Math.random) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ===========================
  // DOM
  // ===========================
  const els = {
    trust: document.getElementById("trust"),
    score: document.getElementById("score"),
    streak: document.getElementById("streak"),
    progress: document.getElementById("progress"),
    card: document.getElementById("card"),
    cardSender: document.getElementById("cardSender"),
    cardText: document.getElementById("cardText"),
    cardClues: document.getElementById("cardClues"),
    cardHint: document.getElementById("cardHint"),
    cardBadge: document.getElementById("cardBadge"),
    coachLine: document.getElementById("coachLine"),
    mascot: document.getElementById("mascot"),
    startOverlay: document.getElementById("startOverlay"),
    pauseOverlay: document.getElementById("pauseOverlay"),
    resultOverlay: document.getElementById("resultOverlay"),
    resultTitle: document.getElementById("resultTitle"),
    resultMessage: document.getElementById("resultMessage"),
    resultStats: document.getElementById("resultStats"),
    resultBadges: document.getElementById("resultBadges"),
    resultMascot: document.getElementById("resultMascot"),
    btnStart: document.getElementById("btnStart"),
    btnPlayAgain: document.getElementById("btnPlayAgain"),
    btnResume: document.getElementById("btnResume"),
    btnRestartFromPause: document.getElementById("btnRestartFromPause"),
    btnFraud: document.getElementById("btnFraud"),
    btnNah: document.getElementById("btnNah"),
    modeSelector: document.getElementById("modeSelector"),
    dailyBadge: document.getElementById("dailyBadge"),
    audioToggle: document.getElementById("audioToggle"),
    shell: document.getElementById("shell"),
  };

  // ===========================
  // GAME FLOW
  // ===========================
  function buildDeck(mode = "normal") {
    const settings = {
      easy: { count: 15, maxDifficulty: 2, trustPenalty: 20 },
      normal: { count: 25, maxDifficulty: 3, trustPenalty: 25 },
      hard: { count: 40, maxDifficulty: 5, trustPenalty: 30 },
    }[mode];

    let pool = RAW_CARDS.filter((c) => c.difficulty <= settings.maxDifficulty);
    pool = shuffle(pool);
    // ensure at least one fraud and one legit
    const frauds = pool.filter((c) => c.fraud);
    const nahs = pool.filter((c) => !c.fraud);
    let deck = [];
    const count = Math.min(settings.count, pool.length);
    for (let i = 0; i < count; i++) {
      if (i % 2 === 0 && frauds.length) deck.push(frauds.shift());
      else if (nahs.length) deck.push(nahs.shift());
      else deck.push(pool.shift());
    }
    return shuffle(deck);
  }

  function buildDailyDeck() {
    const seed = stringHash(getDailySeed() + "fraud-or-nah");
    const rng = seededRandom(seed);
    let pool = RAW_CARDS.filter((c) => c.difficulty <= 3);
    pool = shuffle(pool, rng);
    return pool.slice(0, 20);
  }

  function resetGame(mode = "normal") {
    AudioEngine.init();
    AudioEngine.startMusic();
    state.mode = mode;
    state.deck = mode === "daily" ? buildDailyDeck() : buildDeck(mode);
    state.index = 0;
    state.score = 0;
    state.trust = 100;
    state.streak = 0;
    state.bestStreak = 0;
    state.correct = 0;
    state.wrong = 0;
    state.status = "playing";
    state.startTime = Date.now();
    state.categoryStats = {};
    state.sessionBadges = [];
    updateHud();
    renderCard();
    hideOverlays();
    setMascot("idle");
    els.coachLine.textContent = mode === "daily" ? "Daily challenge. Same deck for everyone today." : "Read carefully. Swipe or tap your call.";
    if (mode === "daily") {
      els.dailyBadge.classList.remove("hidden");
      els.dailyBadge.textContent = `Daily · ${getDailySeed()}`;
    } else {
      els.dailyBadge.classList.add("hidden");
    }
  }

  function updateHud() {
    const settings = { easy: 20, normal: 25, hard: 30 }[state.mode] || 25;
    els.trust.textContent = `${Math.max(0, state.trust)}%`;
    els.score.textContent = state.score;
    els.streak.textContent = state.streak;
    els.trust.parentElement.classList.toggle("danger", state.trust <= settings);
    const pct = state.deck.length ? ((state.index) / state.deck.length) * 100 : 0;
    els.progress.style.width = `${pct}%`;
  }

  function renderCard() {
    const item = state.deck[state.index];
    if (!item) return;
    els.card.classList.remove("fly-left", "fly-right", "nope", "yep");
    els.card.style.transform = "";
    els.card.style.opacity = "1";
    els.cardSender.textContent = item.sender;
    els.cardText.textContent = item.text;
    els.cardHint.textContent = "";
    els.cardHint.classList.remove("show");
    els.cardClues.innerHTML = "";
    els.cardClues.classList.add("hidden");
    const cat = CATEGORIES[item.category];
    els.cardBadge.innerHTML = `<span class="cat-dot cat-${item.category}"></span>${cat.icon} ${cat.label} · ${state.index + 1}/${state.deck.length}`;
  }

  function revealClues(item) {
    els.cardClues.classList.remove("hidden");
    els.cardClues.innerHTML = "";
    item.clues.forEach((clue) => {
      const span = document.createElement("span");
      span.className = `card-clue ${item.fraud ? "fraud" : "nah"}`;
      span.textContent = clue;
      els.cardClues.appendChild(span);
    });
  }

  function setMascot(mode) {
    els.mascot.classList.remove("facepalm", "celebrate");
    if (mode === "facepalm") els.mascot.classList.add("facepalm");
    if (mode === "celebrate") els.mascot.classList.add("celebrate");
  }

  // ===========================
  // JUICE
  // ===========================
  function screenFlash(color) {
    const flash = document.createElement("div");
    flash.style.cssText = `position:fixed;inset:0;background:${color};opacity:.18;pointer-events:none;z-index:100;transition:opacity 260ms ease;`;
    document.body.appendChild(flash);
    requestAnimationFrame(() => (flash.style.opacity = "0"));
    setTimeout(() => flash.remove(), 300);
  }

  function screenShake() {
    els.shell.animate(
      [
        { transform: "translate(0,0)" },
        { transform: "translate(-6px, 4px)" },
        { transform: "translate(6px, -4px)" },
        { transform: "translate(-4px, 3px)" },
        { transform: "translate(0,0)" },
      ],
      { duration: 260, easing: "ease-out" }
    );
  }

  function spawnConfetti() {
    const colors = ["var(--mb-green)", "var(--mb-gold)", "var(--mb-blue)", "var(--mb-purple)"];
    for (let i = 0; i < 80; i++) {
      const c = document.createElement("div");
      c.className = "particle";
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      c.style.left = `${50 + (Math.random() - 0.5) * 80}vw`;
      c.style.top = "-10px";
      c.style.width = `${6 + Math.random() * 10}px`;
      c.style.height = `${6 + Math.random() * 10}px`;
      document.body.appendChild(c);
      const tx = (Math.random() - 0.5) * 340;
      const rot = Math.random() * 720;
      c.animate(
        [
          { transform: `translate(-50%, 0) rotate(0deg)`, opacity: 1 },
          { transform: `translate(calc(-50% + ${tx}px), 110vh) rotate(${rot}deg)`, opacity: 0 },
        ],
        { duration: 1400 + Math.random() * 1600, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "forwards" }
      );
      setTimeout(() => c.remove(), 3200);
    }
  }

  function spawnParticles(good) {
    const color = good ? "var(--mb-green)" : "var(--mb-red)";
    const rect = els.card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 18; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.style.background = color;
      p.style.left = `${cx}px`;
      p.style.top = `${cy}px`;
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 110;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      p.animate(
        [
          { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
          { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 },
        ],
        { duration: 600 + Math.random() * 200, easing: "ease-out", fill: "forwards" }
      );
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 900);
    }
  }

  function showPop(text, good) {
    const el = document.createElement("div");
    el.className = `pop ${good ? "good" : "bad"}`;
    el.textContent = text;
    els.card.appendChild(el);
    requestAnimationFrame(() => el.classList.add("rise"));
    setTimeout(() => el.remove(), 700);
  }

  // ===========================
  // BADGES
  // ===========================
  const BADGES = [
    { id: "first_win", name: "First Blood", desc: "Win your first round", test: (s) => s.correct >= s.deck.length },
    { id: "streak_5", name: "On Fire", desc: "Hit a 5-card streak", test: (s) => s.bestStreak >= 5 },
    { id: "streak_10", name: "Untouchable", desc: "Hit a 10-card streak", test: (s) => s.bestStreak >= 10 },
    { id: "perfect", name: "Clean Sheet", desc: "No wrong answers in a round", test: (s) => s.wrong === 0 && s.index + 1 >= s.deck.length && s.trust > 0 },
    { id: "hard_mode", name: "Hard Mode Hero", desc: "Win on Hard", test: (s) => s.mode === "hard" && s.trust > 0 && s.index + 1 >= s.deck.length },
    { id: "speed_demon", name: "Speed Demon", desc: "Average under 4 seconds per card", test: (s) => s.trust > 0 && s.index + 1 >= s.deck.length && ((Date.now() - s.startTime) / s.deck.length) < 4000 },
    { id: "daily_champ", name: "Daily Champ", desc: "Beat the daily challenge", test: (s) => s.mode === "daily" && s.trust > 0 && s.index + 1 >= s.deck.length },
  ];

  function checkBadges() {
    BADGES.forEach((badge) => {
      if (badge.test(state) && !state.sessionBadges.includes(badge.id)) {
        state.sessionBadges.push(badge.id);
        const progress = loadProgress();
        progress.badges = progress.badges || {};
        if (!progress.badges[badge.id]) {
          progress.badges[badge.id] = { earned: Date.now() };
          saveProgress(progress);
          showBadgeToast(badge);
        }
      }
    });
  }

  function showBadgeToast(badge) {
    const toast = document.createElement("div");
    toast.className = "badge-toast";
    toast.innerHTML = `<strong>🏅 ${badge.name}</strong><span>${badge.desc}</span>`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 300); }, 2400);
  }

  function renderBadges() {
    const progress = loadProgress();
    const earned = progress.badges || {};
    const current = state.sessionBadges;
    const html = BADGES.map((b) => {
      const got = earned[b.id] || current.includes(b.id);
      return `<div class="badge ${got ? "earned" : "locked"}"><span class="badge-icon">🏅</span><span class="badge-name">${b.name}</span><span class="badge-desc">${b.desc}</span></div>`;
    }).join("");
    return html;
  }

  // ===========================
  // SCAM RADAR RATING
  // ===========================
  function getRadarRating() {
    const total = state.correct + state.wrong;
    if (!total) return { label: "Newbie", color: "var(--mb-muted)" };
    const accuracy = state.correct / total;
    const speed = (Date.now() - state.startTime) / total;
    let score = accuracy * 100;
    if (state.bestStreak >= 10) score += 10;
    if (state.bestStreak >= 5) score += 5;
    if (speed < 3000) score += 5;
    if (state.wrong === 0) score += 10;
    if (state.mode === "hard") score += 5;
    score = Math.min(100, Math.round(score));
    if (score >= 95) return { label: "Fraud Hunter", score, color: "var(--mb-green)" };
    if (score >= 85) return { label: "Scam Radar Elite", score, color: "var(--mb-green-soft)" };
    if (score >= 70) return { label: "Sharp Eye", score, color: "var(--mb-gold)" };
    if (score >= 50) return { label: "Learning", score, color: "var(--mb-blue)" };
    return { label: "Needs Training", score, color: "var(--mb-red)" };
  }

  // ===========================
  // ANSWER HANDLING
  // ===========================
  function handleAnswer(isFraud) {
    if (state.status !== "playing" || state._answering) return;
    state._answering = true;
    AudioEngine.swipe();

    const item = state.deck[state.index];
    const correct = item.fraud === isFraud;
    const settings = { easy: 20, normal: 25, hard: 30 }[state.mode] || 25;

    // Category stats
    state.categoryStats[item.category] = state.categoryStats[item.category] || { correct: 0, total: 0 };
    state.categoryStats[item.category].total += 1;
    if (correct) state.categoryStats[item.category].correct += 1;

    if (correct) {
      state.correct += 1;
      state.streak += 1;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      const timeBonus = Math.max(0, Math.round((4000 - (Date.now() - state.startTime) / (state.index + 1)) / 100));
      const points = 100 + state.streak * 25 + timeBonus;
      state.score += points;
      showPop(`+${points}`, true);
      spawnParticles(true);
      AudioEngine.correct();
      haptic([15, 40, 15]);
      setMascot(state.streak >= 3 ? "celebrate" : "idle");
      els.coachLine.textContent = ["Nice call.", "Scam radar on.", "You're getting sharper.", "Unstoppable.", "Legendary."][Math.min(state.streak - 1, 4)];
    } else {
      state.wrong += 1;
      state.streak = 0;
      state.trust = Math.max(0, state.trust - settings);
      showPop(`-${settings}% trust`, false);
      spawnParticles(false);
      AudioEngine.wrong();
      haptic([80, 60, 80]);
      screenShake();
      screenFlash("rgba(251,113,133,0.25)");
      setMascot("facepalm");
      els.coachLine.textContent = "Oof. Read the clues and try again.";
    }

    revealClues(item);
    revealHint(item, correct);
    updateHud();
    checkBadges();

    setTimeout(() => {
      state._answering = false;
      if (state.trust <= 0) {
        endGame(false);
      } else if (state.index + 1 >= state.deck.length) {
        endGame(true);
      } else {
        state.index += 1;
        renderCard();
        updateHud();
      }
    }, 1100);
  }

  function revealHint(item, correct) {
    els.cardHint.textContent = item.hint;
    els.cardHint.classList.add("show");
    els.cardHint.style.color = correct ? "var(--mb-muted)" : "var(--mb-red)";
  }

  function endGame(win) {
    state.status = "over";
    if (win) {
      AudioEngine.win();
      spawnConfetti();
    } else {
      AudioEngine.lose();
    }
    els.resultOverlay.classList.remove("hidden");
    els.resultTitle.textContent = win ? "Trust Intact" : "Trust Depleted";
    els.resultMessage.textContent = win
      ? "You made it through. Your scam radar is looking strong."
      : "Scammers got the best of you this time. Review the hints and try again.";

    const rating = getRadarRating();
    const progress = loadProgress();
    progress.bestScore = Math.max(progress.bestScore || 0, state.score);
    progress.gamesPlayed = (progress.gamesPlayed || 0) + 1;
    progress.totalCorrect = (progress.totalCorrect || 0) + state.correct;
    progress.totalWrong = (progress.totalWrong || 0) + state.wrong;
    saveProgress(progress);

    const weakCategories = Object.entries(state.categoryStats)
      .filter(([_, v]) => v.total > 0 && v.correct / v.total < 0.7)
      .map(([k]) => CATEGORIES[k].label);

    els.resultStats.innerHTML = `
      <div class="result-stat"><span>Score</span><strong>${state.score}</strong></div>
      <div class="result-stat"><span>Correct</span><strong>${state.correct}/${state.deck.length}</strong></div>
      <div class="result-stat"><span>Best Streak</span><strong>${state.bestStreak}</strong></div>
      <div class="result-stat"><span>Trust Left</span><strong>${Math.max(0, state.trust)}%</strong></div>
      <div class="result-stat wide"><span>Scam Radar</span><strong style="color:${rating.color}">${rating.label}</strong><small>${rating.score}/100</small></div>
    `;

    els.resultBadges.innerHTML = `<h3>Badges</h3><div class="badge-grid">${renderBadges()}</div>` +
      (weakCategories.length ? `<p class="weak-cats">Study up: ${weakCategories.join(", ")}</p>` : "");
  }

  function hideOverlays() {
    els.startOverlay.classList.add("hidden");
    els.pauseOverlay.classList.add("hidden");
    els.resultOverlay.classList.add("hidden");
  }

  function pauseGame() {
    if (state.status !== "playing") return;
    state.status = "paused";
    els.pauseOverlay.classList.remove("hidden");
  }

  function resumeGame() {
    if (state.status !== "paused") return;
    state.status = "playing";
    els.pauseOverlay.classList.add("hidden");
  }

  // ===========================
  // SWIPE / INPUT
  // ===========================
  let startX = null;
  let currentX = null;
  let dragging = false;

  function onPointerDown(e) {
    if (state.status !== "playing") return;
    startX = e.clientX || e.touches?.[0]?.clientX;
    dragging = true;
    els.card.classList.add("dragging");
  }

  function onPointerMove(e) {
    if (!dragging || startX == null) return;
    currentX = e.clientX || e.touches?.[0]?.clientX;
    const dx = currentX - startX;
    const rotate = dx * 0.04;
    els.card.style.transform = `translateX(${dx}px) rotate(${rotate}deg)`;
    els.card.style.opacity = `${1 - Math.min(Math.abs(dx) / 300, 0.45)}`;
    els.card.classList.toggle("yep", dx > 40);
    els.card.classList.toggle("nope", dx < -40);
  }

  function onPointerUp() {
    if (!dragging) return;
    dragging = false;
    els.card.classList.remove("dragging", "yep", "nope");
    if (currentX != null && startX != null) {
      const dx = currentX - startX;
      if (dx > 90) {
        handleAnswer(false);
      } else if (dx < -90) {
        handleAnswer(true);
      } else {
        els.card.style.transform = "";
        els.card.style.opacity = "1";
      }
    }
    startX = null;
    currentX = null;
  }

  els.card.addEventListener("mousedown", onPointerDown);
  els.card.addEventListener("touchstart", onPointerDown, { passive: true });
  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("touchmove", onPointerMove, { passive: true });
  window.addEventListener("mouseup", onPointerUp);
  window.addEventListener("touchend", onPointerUp);

  els.btnStart.addEventListener("click", () => {
    const mode = els.modeSelector ? els.modeSelector.value : "normal";
    resetGame(mode);
  });
  els.btnPlayAgain.addEventListener("click", () => resetGame(state.mode || "normal"));
  els.btnResume.addEventListener("click", resumeGame);
  els.btnRestartFromPause.addEventListener("click", () => resetGame(state.mode || "normal"));
  els.btnFraud.addEventListener("click", () => handleAnswer(true));
  els.btnNah.addEventListener("click", () => handleAnswer(false));

  if (els.audioToggle) {
    els.audioToggle.addEventListener("click", () => {
      const on = AudioEngine.toggle();
      els.audioToggle.textContent = on ? "🔊" : "🔇";
      els.audioToggle.setAttribute("aria-pressed", String(on));
    });
  }

  document.addEventListener("keydown", (e) => {
    if (state.status === "start" && e.key === "Enter") {
      const mode = els.modeSelector ? els.modeSelector.value : "normal";
      resetGame(mode);
      return;
    }
    if (state.status === "over" && e.key === "Enter") {
      resetGame(state.mode || "normal");
      return;
    }
    if (state.status !== "playing") return;
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
      e.preventDefault();
      handleAnswer(true);
    } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
      e.preventDefault();
      handleAnswer(false);
    } else if (e.key === "Escape") {
      pauseGame();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.status === "playing") pauseGame();
  });

  // ===========================
  // INIT
  // ===========================
  const progress = loadProgress();
  els.cardSender.textContent = "Ready?";
  els.cardText.textContent = "Pick a mode and press Start.";
  els.cardClues.innerHTML = "";
  els.cardClues.classList.add("hidden");
  els.cardHint.textContent = "";
  els.cardBadge.innerHTML = `<span class="cat-dot"></span>Daily · 0/0`;
  if (els.dailyBadge) els.dailyBadge.classList.add("hidden");

  // Show lifetime stats on start overlay if available
  const statsEl = document.getElementById("lifetimeStats");
  if (statsEl && progress.gamesPlayed) {
    statsEl.innerHTML = `Games: <strong>${progress.gamesPlayed}</strong> · Best: <strong>${progress.bestScore || 0}</strong>`;
  }
})();
