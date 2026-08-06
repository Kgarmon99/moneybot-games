(() => {
  "use strict";

  // ===========================
  // DATA: 60 cards across 10 scam categories
  // ===========================
  const CATEGORIES = {
    phishing: { label: "Phishing", color: "#38BDF8", pattern: "radial-gradient(circle, rgba(56,189,248,0.15) 2px, transparent 2px)" },
    ecommerce: { label: "E-Commerce", color: "#FBBF24", pattern: "repeating-linear-gradient(45deg, rgba(251,191,36,0.08) 0, rgba(251,191,36,0.08) 2px, transparent 2px, transparent 10px)" },
    investment: { label: "Investment", color: "#A78BFA", pattern: "linear-gradient(0deg, transparent 49%, rgba(167,139,250,0.1) 50%, transparent 51%)" },
    romance: { label: "Romance", color: "#FB7185", pattern: "radial-gradient(circle at 50% 50%, rgba(251,113,133,0.12) 20%, transparent 21%)" },
    job: { label: "Job Scam", color: "#34D399", pattern: "repeating-linear-gradient(90deg, rgba(52,211,153,0.08) 0, rgba(52,211,153,0.08) 1px, transparent 1px, transparent 14px)" },
    tech: { label: "Tech Support", color: "#94A3B8", pattern: "repeating-linear-gradient(0deg, rgba(148,163,184,0.08) 0, rgba(148,163,184,0.08) 1px, transparent 1px, transparent 14px)" },
    social: { label: "Social", color: "#F472B6", pattern: "radial-gradient(circle, rgba(244,114,182,0.12) 2px, transparent 2px)" },
    crypto: { label: "Crypto", color: "#F59E0B", pattern: "repeating-linear-gradient(45deg, rgba(245,158,11,0.08) 0, rgba(245,158,11,0.08) 2px, transparent 2px, transparent 8px)" },
    government: { label: "Government", color: "#60A5FA", pattern: "linear-gradient(90deg, transparent 49%, rgba(96,165,250,0.1) 50%, transparent 51%)" },
    charity: { label: "Charity", color: "#22D3EE", pattern: "radial-gradient(circle at 25% 25%, rgba(34,211,238,0.12) 20%, transparent 21%)" },
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

    // Extra mixed
    { sender: "Boss (Dave)", text: "I'm in back-to-back meetings. Can you buy 5 gift cards for a client and send the codes? I'll reimburse you.", fraud: true, category: "job", difficulty: 2, clues: ["Gift card pressure", "Impersonation"], hint: "Gift card requests through text or email are a top scam pattern." },
    { sender: "Mom", text: "Can you Venmo me $40 for groceries? I'll pay you back Friday.", fraud: false, category: "social", difficulty: 1, clues: ["Known sender", "Specific amount"], hint: "Messages from people you know with normal requests are usually fine." },
    { sender: "Netflix", text: "Your monthly invoice for $15.49 is ready. View account at netflix.com.", fraud: false, category: "phishing", difficulty: 2, clues: ["Expected bill", "Real domain"], hint: "Check the domain and whether you expected the charge." },
    { sender: "LinkedIn", text: "Jordan commented on your post: 'Great insights — sent you a connection request.'", fraud: false, category: "social", difficulty: 1, clues: ["Normal notification", "No money ask"], hint: "Social notifications without money or login pressure are usually legit." },
  ];

  // ===========================
  // STATE
  // ===========================
  const state = {
    deck: [], index: 0, score: 0, hearts: 4, maxHearts: 4,
    streak: 0, bestStreak: 0, correct: 0, wrong: 0,
    mode: "normal", status: "start", startTime: 0,
    categoryStats: {}, sessionBadges: [], _answering: false,
  };

  const STORAGE_KEY = "***";
  const MODES = {
    easy: { count: 15, maxDifficulty: 2, hearts: 5 },
    normal: { count: 25, maxDifficulty: 3, hearts: 4 },
    hard: { count: 40, maxDifficulty: 5, hearts: 3 },
    daily: { count: 20, maxDifficulty: 3, hearts: 4 },
  };

  function loadProgress() { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : {}; } catch { return {}; } }
  function saveProgress(data) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {} }
  function getDailySeed() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; }

  // ===========================
  // PREMIUM AUDIO ENGINE
  // ===========================
  const AudioEngine = (() => {
    let ctx = null, master = null, musicNodes = [], enabled = false;

    function init() {
      if (ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.22;
      master.connect(ctx.destination);
      return true;
    }

    function ensureEnabled() {
      // Audio is opt-in only. Never create AudioContext or play sounds unless explicitly toggled on.
      if (!enabled) return false;
      return init();
    }

    function now() { return ctx ? ctx.currentTime : 0; }

    function tone({ freq = 440, type = "sine", duration = 0.2, peak = 0.3, attack = 0.01, release = 0.14, slideTo, delay = 0 }) {
      if (!ensureEnabled()) return;
      if (ctx.state === "suspended") ctx.resume();
      const t = now() + delay;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + duration);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(g).connect(master);
      osc.start(t);
      osc.stop(t + duration + 0.05);
    }

    function chord(notes, { duration = 0.35, peak = 0.18, type = "triangle" } = {}) {
      if (!ensureEnabled()) return;
      notes.forEach((f, i) => tone({ freq: f, type, duration, peak: peak - i * 0.02, delay: i * 0.025 }));
    }

    function correct() { chord([523.25, 659.25, 783.99], { duration: 0.3, peak: 0.22 }); setTimeout(() => chord([783.99, 987.77, 1174.66], { duration: 0.35, peak: 0.18 }), 90); }
    function wrong() { tone({ freq: 196, type: "sawtooth", duration: 0.32, peak: 0.2, slideTo: 98 }); setTimeout(() => tone({ freq: 92, type: "sawtooth", duration: 0.45, peak: 0.15 }), 120); }
    function swipe() { tone({ freq: 300, type: "triangle", duration: 0.08, peak: 0.08, slideTo: 220 }); }
    function win() { const p = [[523,659,784],[659,784,1047],[784,1047,1319],[1047,1319,1568]]; p.forEach((n,i) => setTimeout(() => chord(n,{duration:.4,peak:.2}), i*110)); }
    function lose() { const p = [[392,311,247],[349,293,233],[311,261,207],[261,220,174]]; p.forEach((n,i) => setTimeout(() => chord(n,{duration:.45,peak:.16}), i*130)); }
    function badge() { [523,659,784,1047,1319].forEach((f,i) => setTimeout(() => tone({freq:f,type:"sine",duration:.12,peak:.18}), i*70)); }
    function heartLoss() { tone({ freq: 150, type: "square", duration: 0.25, peak: 0.16, slideTo: 80 }); }

    function startMusic() {
      if (!ensureEnabled() || musicNodes.length) return;
      const root = 110;
      [1, 1.5, 2, 2.5].forEach((r, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = i % 2 === 0 ? "sine" : "triangle";
        osc.frequency.value = root * r;
        g.gain.value = 0.008 + i * 0.002;
        osc.connect(g).connect(master);
        osc.start();
        musicNodes.push({ osc, g });
      });
      const lfo = ctx.createOscillator();
      lfo.type = "sine"; lfo.frequency.value = 0.08;
      const lfoGain = ctx.createGain(); lfoGain.gain.value = 8;
      lfo.connect(lfoGain);
      musicNodes.forEach(({ osc }) => lfoGain.connect(osc.frequency));
      lfo.start();
      musicNodes.push({ osc: lfo });
    }

    function stopMusic() { musicNodes.forEach((n) => { try { n.osc.stop(); } catch {} }); musicNodes = []; }
    function toggle() {
      enabled = !enabled;
      if (!enabled) { stopMusic(); }
      else { init(); startMusic(); }
      return enabled;
    }

    return { init, correct, wrong, swipe, win, lose, badge, heartLoss, startMusic, stopMusic, toggle };
  })();

  function haptic(pattern) { if (navigator.vibrate) navigator.vibrate(pattern); }

  // ===========================
  // UTILS
  // ===========================
  function stringHash(str) { let h = 0; for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i); return Math.abs(h); }
  function seededRandom(seed) { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  function shuffle(arr, rng = Math.random) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  // ===========================
  // DOM
  // ===========================
  const els = {
    splash: document.getElementById("splash"),
    shell: document.getElementById("shell"),
    heartsRow: document.getElementById("heartsRow"),
    score: document.getElementById("score"),
    streak: document.getElementById("streak"),
    comboStat: document.getElementById("comboStat"),
    progress: document.getElementById("progress"),
    card: document.getElementById("card"),
    cardNext: document.getElementById("cardNext"),
    cardPattern: document.getElementById("cardPattern"),
    cardSender: document.getElementById("cardSender"),
    cardText: document.getElementById("cardText"),
    cardClues: document.getElementById("cardClues"),
    cardHint: document.getElementById("cardHint"),
    cardBadge: document.getElementById("cardBadge"),
    coachLine: document.getElementById("coachLine"),
    mascot: document.getElementById("mascot"),
    startOverlay: document.getElementById("startOverlay"),
    tutorialOverlay: document.getElementById("tutorialOverlay"),
    pauseOverlay: document.getElementById("pauseOverlay"),
    resultOverlay: document.getElementById("resultOverlay"),
    resultTitle: document.getElementById("resultTitle"),
    resultMessage: document.getElementById("resultMessage"),
    resultStats: document.getElementById("resultStats"),
    resultBadges: document.getElementById("resultBadges"),
    radarRing: document.getElementById("radarRing"),
    radarScore: document.getElementById("radarScore"),
    radarLabel: document.getElementById("radarLabel"),
    resultMascot: document.getElementById("resultMascot"),
    btnStart: document.getElementById("btnStart"),
    btnPlayAgain: document.getElementById("btnPlayAgain"),
    btnShare: document.getElementById("btnShare"),
    btnResume: document.getElementById("btnResume"),
    btnRestartFromPause: document.getElementById("btnRestartFromPause"),
    btnTutorial: document.getElementById("btnTutorial"),
    btnTutorialClose: document.getElementById("btnTutorialClose"),
    btnFraud: document.getElementById("btnFraud"),
    btnNah: document.getElementById("btnNah"),
    modeSelector: document.getElementById("modeSelector"),
    dailyBadge: document.getElementById("dailyBadge"),
    audioToggle: document.getElementById("audioToggle"),
    comboFlame: document.getElementById("comboFlame"),
    lifetimeStats: document.getElementById("lifetimeStats"),
  };

  const parallaxLayers = document.querySelectorAll(".parallax-layer");

  // ===========================
  // PARALLAX
  // ===========================
  function updateParallax(x, y) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const px = (x - cx) / cx;
    const py = (y - cy) / cy;
    parallaxLayers.forEach((layer) => {
      const speed = parseFloat(layer.dataset.speed) || 0.05;
      const tx = px * speed * -80;
      const ty = py * speed * -60;
      layer.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    });
  }

  window.addEventListener("mousemove", (e) => requestAnimationFrame(() => updateParallax(e.clientX, e.clientY)));
  window.addEventListener("deviceorientation", (e) => {
    const x = ((e.gamma || 0) + 45) / 90 * window.innerWidth;
    const y = ((e.beta || 45) - 15) / 60 * window.innerHeight;
    requestAnimationFrame(() => updateParallax(x, y));
  });

  // ===========================
  // SPLASH
  // ===========================
  function showApp() {
    setTimeout(() => {
      els.splash.classList.add("hidden");
      els.shell.classList.remove("hidden");
    }, 1400);
  }

  // ===========================
  // HEARTS
  // ===========================
  function renderHearts() {
    els.heartsRow.innerHTML = "";
    for (let i = 0; i < state.maxHearts; i++) {
      const heart = document.createElement("span");
      heart.className = "heart";
      heart.textContent = "❤";
      if (i >= state.hearts) heart.classList.add("lost");
      els.heartsRow.appendChild(heart);
    }
  }

  function damageHeart() {
    const hearts = els.heartsRow.querySelectorAll(".heart");
    const target = hearts[state.hearts];
    if (target) {
      target.classList.add("damaged");
      setTimeout(() => target.classList.add("lost"), 250);
    }
  }

  // ===========================
  // DECK BUILDERS
  // ===========================
  function buildDeck(mode) {
    const cfg = MODES[mode];
    let pool = RAW_CARDS.filter((c) => c.difficulty <= cfg.maxDifficulty);
    pool = shuffle(pool);
    const frauds = pool.filter((c) => c.fraud);
    const nahs = pool.filter((c) => !c.fraud);
    const deck = [];
    const count = Math.min(cfg.count, pool.length);
    for (let i = 0; i < count; i++) {
      if (i % 2 === 0 && frauds.length) deck.push(frauds.shift());
      else if (nahs.length) deck.push(nahs.shift());
      else deck.push(pool.shift());
    }
    return shuffle(deck);
  }

  function buildDailyDeck() {
    const rng = seededRandom(stringHash(getDailySeed() + "fraud-or-nah-v4"));
    const pool = shuffle(RAW_CARDS.filter((c) => c.difficulty <= 3), rng);
    return pool.slice(0, MODES.daily.count);
  }

  function resetGame(mode = "normal") {
    // Audio is opt-in via the speaker toggle. Do not init AudioContext here.
    const cfg = MODES[mode];
    state.mode = mode;
    state.deck = mode === "daily" ? buildDailyDeck() : buildDeck(mode);
    state.index = 0; state.score = 0;
    state.maxHearts = cfg.hearts; state.hearts = cfg.hearts;
    state.streak = 0; state.bestStreak = 0;
    state.correct = 0; state.wrong = 0;
    state.status = "playing";
    state.startTime = Date.now();
    state.categoryStats = {};
    state.sessionBadges = [];
    renderHearts();
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
    els.score.textContent = state.score;
    els.streak.textContent = state.streak;
    els.comboStat.classList.toggle("glowing", state.streak >= 3);
    const pct = state.deck.length ? ((state.index) / state.deck.length) * 100 : 0;
    els.progress.style.width = `${pct}%`;
  }

  function renderCard() {
    const item = state.deck[state.index];
    if (!item) return;
    const cat = CATEGORIES[item.category];
    els.card.className = "card";
    els.card.style.transform = "";
    els.card.style.opacity = "1";
    els.card.classList.add(`cat-${item.category}`);
    els.cardPattern.style.backgroundImage = cat.pattern;
    els.cardPattern.style.backgroundSize = "24px 24px";
    els.cardSender.innerHTML = `<span class="sender-avatar"><svg><use href="#icon-${item.category}"/></svg></span>${item.sender}`;
    els.cardText.textContent = item.text;
    els.cardHint.textContent = "";
    els.cardHint.classList.remove("show");
    els.cardClues.innerHTML = "";
    els.cardClues.classList.add("hidden");
    els.cardBadge.innerHTML = `<span class="cat-dot cat-${item.category}"></span>${cat.label} · ${state.index + 1}/${state.deck.length}`;
    renderNextCard();
  }

  function renderNextCard() {
    const next = state.deck[state.index + 1];
    if (next) {
      const cat = CATEGORIES[next.category];
      els.cardNext.innerHTML = `<div class="next-sender"><span class="sender-avatar"><svg><use href="#icon-${next.category}"/></svg></span>${next.sender}</div>`;
      els.cardNext.className = `card card-next cat-${next.category}`;
    } else {
      els.cardNext.innerHTML = "";
    }
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
    els.mascot.classList.remove("facepalm", "celebrate", "think", "shock");
    if (mode) els.mascot.classList.add(mode);
  }

  // ===========================
  // JUICE
  // ===========================
  function screenFlash(color) {
    const flash = document.createElement("div");
    flash.style.cssText = `position:fixed;inset:0;background:${color};opacity:.14;pointer-events:none;z-index:100;transition:opacity 360ms ease;`;
    document.body.appendChild(flash);
    requestAnimationFrame(() => (flash.style.opacity = "0"));
    setTimeout(() => flash.remove(), 380);
  }

  function screenShake() {
    els.shell.animate([
      { transform: "translate(0,0)" },
      { transform: "translate(-8px, 6px)" },
      { transform: "translate(8px, -6px)" },
      { transform: "translate(-5px, 4px)" },
      { transform: "translate(0,0)" },
    ], { duration: 300, easing: "ease-out" });
  }

  function spawnConfetti() {
    const colors = ["#00E676", "#FBBF24", "#38BDF8", "#A78BFA"];
    for (let i = 0; i < 120; i++) {
      const c = document.createElement("div");
      c.className = "particle";
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      c.style.left = `${50 + (Math.random() - 0.5) * 80}vw`;
      c.style.top = "-10px";
      c.style.width = `${6 + Math.random() * 10}px`;
      c.style.height = `${6 + Math.random() * 10}px`;
      document.body.appendChild(c);
      const tx = (Math.random() - 0.5) * 400;
      const rot = Math.random() * 720;
      c.animate([
        { transform: `translate(-50%, 0) rotate(0deg)`, opacity: 1 },
        { transform: `translate(calc(-50% + ${tx}px), 110vh) rotate(${rot}deg)`, opacity: 0 },
      ], { duration: 1400 + Math.random() * 1800, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "forwards" });
      setTimeout(() => c.remove(), 3400);
    }
  }

  function spawnParticles(good, categoryColor) {
    const color = good ? (categoryColor || "#00E676") : "#FB7185";
    const rect = els.card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 24; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.style.background = color;
      p.style.boxShadow = `0 0 10px ${color}`;
      p.style.left = `${cx}px`;
      p.style.top = `${cy}px`;
      const angle = Math.random() * Math.PI * 2;
      const dist = 70 + Math.random() * 140;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      p.animate([
        { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
        { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 },
      ], { duration: 650 + Math.random() * 250, easing: "ease-out", fill: "forwards" });
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 950);
    }
  }

  function showPop(text, good) {
    const el = document.createElement("div");
    el.className = `pop ${good ? "good" : "bad"}`;
    el.textContent = text;
    els.card.appendChild(el);
    requestAnimationFrame(() => el.classList.add("rise"));
    setTimeout(() => el.remove(), 720);
  }

  function updateComboFlame() {
    if (state.streak >= 3) {
      els.comboFlame.classList.remove("hidden");
      requestAnimationFrame(() => els.comboFlame.classList.add("show"));
      els.comboFlame.innerHTML = `<span class="flame-icon">🔥</span><span>Combo x${state.streak}</span>`;
    } else {
      els.comboFlame.classList.remove("show");
      setTimeout(() => els.comboFlame.classList.add("hidden"), 220);
    }
  }

  // ===========================
  // BADGES
  // ===========================
  const BADGES = [
    { id: "first_win", name: "First Blood", desc: "Win your first round", test: (s) => s.correct >= s.deck.length },
    { id: "streak_5", name: "On Fire", desc: "Hit a 5-card streak", test: (s) => s.bestStreak >= 5 },
    { id: "streak_10", name: "Untouchable", desc: "Hit a 10-card streak", test: (s) => s.bestStreak >= 10 },
    { id: "perfect", name: "Clean Sheet", desc: "No wrong answers", test: (s) => s.wrong === 0 && s.index + 1 >= s.deck.length && s.hearts > 0 },
    { id: "hard_mode", name: "Hard Mode Hero", desc: "Win on Hard", test: (s) => s.mode === "hard" && s.hearts > 0 && s.index + 1 >= s.deck.length },
    { id: "speed_demon", name: "Speed Demon", desc: "Avg under 4s per card", test: (s) => s.hearts > 0 && s.index + 1 >= s.deck.length && ((Date.now() - s.startTime) / s.deck.length) < 4000 },
    { id: "daily_champ", name: "Daily Champ", desc: "Beat the daily", test: (s) => s.mode === "daily" && s.hearts > 0 && s.index + 1 >= s.deck.length },
    { id: "survivor", name: "Survivor", desc: "Win with 1 heart left", test: (s) => s.hearts === 1 && s.index + 1 >= s.deck.length },
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
          AudioEngine.badge();
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
    setTimeout(() => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 300); }, 2600);
  }

  function renderBadges() {
    const progress = loadProgress();
    const earned = progress.badges || {};
    return BADGES.map((b) => {
      const got = earned[b.id] || state.sessionBadges.includes(b.id);
      return `<div class="badge ${got ? "earned" : "locked"}"><span class="badge-icon">🏅</span><span class="badge-name">${b.name}</span><span class="badge-desc">${b.desc}</span></div>`;
    }).join("");
  }

  // ===========================
  // RADAR RATING
  // ===========================
  function getRadarRating() {
    const total = state.correct + state.wrong;
    if (!total) return { label: "Newbie", score: 0, color: "#94A3B8" };
    let score = (state.correct / total) * 100;
    if (state.bestStreak >= 10) score += 8;
    else if (state.bestStreak >= 5) score += 4;
    const avgTime = (Date.now() - state.startTime) / total;
    if (avgTime < 3000) score += 4;
    if (state.wrong === 0) score += 8;
    if (state.mode === "hard") score += 5;
    score = Math.min(100, Math.round(score));
    if (score >= 95) return { label: "Fraud Hunter", score, color: "#00E676" };
    if (score >= 85) return { label: "Scam Radar Elite", score, color: "#69F0AE" };
    if (score >= 70) return { label: "Sharp Eye", score, color: "#FBBF24" };
    if (score >= 50) return { label: "Learning", score, color: "#38BDF8" };
    return { label: "Needs Training", score, color: "#FB7185" };
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
    const catColor = CATEGORIES[item.category].color;

    state.categoryStats[item.category] = state.categoryStats[item.category] || { correct: 0, total: 0 };
    state.categoryStats[item.category].total += 1;
    if (correct) state.categoryStats[item.category].correct += 1;

    if (correct) {
      state.correct += 1;
      state.streak += 1;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      const timeBonus = Math.max(0, Math.round((5000 - (Date.now() - state.startTime) / (state.index + 1)) / 100));
      const comboBonus = state.streak * 30;
      const points = 100 + comboBonus + timeBonus;
      state.score += points;
      showPop(`+${points}`, true);
      spawnParticles(true, catColor);
      AudioEngine.correct();
      haptic([12, 36, 12]);
      if (state.streak >= 3) setMascot("celebrate");
      else setMascot("think");
      els.coachLine.textContent = ["Nice call.", "Scam radar on.", "You're getting sharper.", "Unstoppable.", "Legendary."][Math.min(state.streak - 1, 4)];
    } else {
      state.wrong += 1;
      state.streak = 0;
      state.hearts = Math.max(0, state.hearts - 1);
      damageHeart();
      showPop("-1 heart", false);
      spawnParticles(false);
      AudioEngine.wrong();
      AudioEngine.heartLoss();
      haptic([90, 70, 90]);
      screenShake();
      screenFlash("rgba(251,113,133,0.2)");
      setMascot("facepalm");
      els.coachLine.textContent = "Oof. Read the clues and try again.";
    }

    updateComboFlame();
    revealClues(item);
    revealHint(item, correct);
    updateHud();
    checkBadges();

    setTimeout(() => {
      state._answering = false;
      if (state.hearts <= 0) endGame(false);
      else if (state.index + 1 >= state.deck.length) endGame(true);
      else { state.index += 1; renderCard(); updateHud(); }
    }, 1200);
  }

  function revealHint(item, correct) {
    els.cardHint.textContent = item.hint;
    els.cardHint.classList.add("show");
    els.cardHint.style.color = correct ? "var(--mb-muted)" : "var(--mb-red)";
  }

  function endGame(win) {
    state.status = "over";
    if (win) { AudioEngine.win(); spawnConfetti(); }
    else AudioEngine.lose();

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

    els.radarRing.style.setProperty("--score", `${rating.score}%`);
    els.radarRing.style.setProperty("--ring-color", rating.color);
    els.radarScore.textContent = rating.score;
    els.radarLabel.textContent = rating.label;
    els.radarLabel.style.color = rating.color;

    els.resultStats.innerHTML = `
      <div class="result-stat"><span>Score</span><strong>${state.score}</strong></div>
      <div class="result-stat"><span>Correct</span><strong>${state.correct}/${state.deck.length}</strong></div>
      <div class="result-stat"><span>Best Streak</span><strong>${state.bestStreak}</strong></div>
      <div class="result-stat"><span>Hearts Left</span><strong>${state.hearts}</strong></div>
    `;

    els.resultBadges.innerHTML = `<h3>Badges</h3><div class="badge-grid">${renderBadges()}</div>` +
      (weakCategories.length ? `<p class="weak-cats">Study up: ${weakCategories.join(", ")}</p>` : "");
  }

  function shareScore() {
    const rating = getRadarRating();
    const text = `I scored ${state.score} on Fraud or Nah (${rating.label} · ${rating.score}/100). Can you spot the scams? https://moneybot-games-deploy.vercel.app/fraud-or-nah/`;
    if (navigator.share) navigator.share({ title: "Fraud or Nah", text });
    else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        const toast = document.createElement("div");
        toast.className = "badge-toast";
        toast.innerHTML = `<strong>Copied</strong><span>Score copied to clipboard</span>`;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add("show"));
        setTimeout(() => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 300); }, 1600);
      });
    }
  }

  function hideOverlays() {
    [els.startOverlay, els.pauseOverlay, els.resultOverlay, els.tutorialOverlay].forEach((el) => el.classList.add("hidden"));
  }
  function showTutorial() { els.tutorialOverlay.classList.remove("hidden"); }
  function pauseGame() { if (state.status !== "playing") return; state.status = "paused"; els.pauseOverlay.classList.remove("hidden"); }
  function resumeGame() { if (state.status !== "paused") return; state.status = "playing"; els.pauseOverlay.classList.add("hidden"); }

  // ===========================
  // SWIPE / INPUT
  // ===========================
  let startX = null, currentX = null, startY = null, currentY = null, dragging = false;

  function onPointerDown(e) {
    if (state.status !== "playing") return;
    startX = e.clientX ?? e.touches?.[0]?.clientX;
    startY = e.clientY ?? e.touches?.[0]?.clientY;
    dragging = true;
    els.card.classList.add("dragging");
  }

  function onPointerMove(e) {
    if (!dragging || startX == null) return;
    currentX = e.clientX ?? e.touches?.[0]?.clientX;
    currentY = e.clientY ?? e.touches?.[0]?.clientY;
    const dx = currentX - startX;
    const dy = currentY - startY;
    if (Math.abs(dx) < Math.abs(dy) && Math.abs(dy) > 20) return;
    const rotate = dx * 0.05;
    els.card.style.transform = `translateX(${dx}px) rotate(${rotate}deg)`;
    els.card.style.opacity = `${1 - Math.min(Math.abs(dx) / 260, 0.42)}`;
    els.card.classList.toggle("yep", dx > 35);
    els.card.classList.toggle("nope", dx < -35);
  }

  function onPointerUp() {
    if (!dragging) return;
    dragging = false;
    els.card.classList.remove("dragging", "yep", "nope");
    if (currentX != null && startX != null) {
      const dx = currentX - startX;
      if (dx > 90) handleAnswer(false);
      else if (dx < -90) handleAnswer(true);
      else { els.card.style.transform = ""; els.card.style.opacity = "1"; }
    }
    startX = startY = currentX = currentY = null;
  }

  els.card.addEventListener("mousedown", onPointerDown);
  els.card.addEventListener("touchstart", onPointerDown, { passive: true });
  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("touchmove", onPointerMove, { passive: true });
  window.addEventListener("mouseup", onPointerUp);
  window.addEventListener("touchend", onPointerUp);

  els.btnStart.addEventListener("click", () => resetGame(els.modeSelector.value));
  els.btnPlayAgain.addEventListener("click", () => resetGame(state.mode || "normal"));
  els.btnShare.addEventListener("click", shareScore);
  els.btnResume.addEventListener("click", resumeGame);
  els.btnRestartFromPause.addEventListener("click", () => resetGame(state.mode || "normal"));
  els.btnTutorial.addEventListener("click", showTutorial);
  els.btnTutorialClose.addEventListener("click", () => els.tutorialOverlay.classList.add("hidden"));
  els.btnFraud.addEventListener("click", () => handleAnswer(true));
  els.btnNah.addEventListener("click", () => handleAnswer(false));

  if (els.audioToggle) {
    els.audioToggle.setAttribute("aria-label", "Sound off. Tap to enable.");
    els.audioToggle.addEventListener("click", () => {
      const on = AudioEngine.toggle();
      els.audioToggle.textContent = on ? "🔊" : "🔇";
      els.audioToggle.setAttribute("aria-pressed", String(on));
      els.audioToggle.setAttribute("aria-label", on ? "Sound on" : "Sound off");
    });
  }

  document.addEventListener("keydown", (e) => {
    if (state.status === "start" && e.key === "Enter") { resetGame(els.modeSelector.value); return; }
    if (state.status === "over" && e.key === "Enter") { resetGame(state.mode || "normal"); return; }
    if (state.status !== "playing") return;
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") { e.preventDefault(); handleAnswer(true); }
    else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") { e.preventDefault(); handleAnswer(false); }
    else if (e.key === "Escape") pauseGame();
  });

  document.addEventListener("visibilitychange", () => { if (document.hidden && state.status === "playing") pauseGame(); });

  // ===========================
  // INIT
  // ===========================
  const progress = loadProgress();
  if (els.lifetimeStats && progress.gamesPlayed) {
    els.lifetimeStats.innerHTML = `Games: <strong>${progress.gamesPlayed}</strong> · Best: <strong>${progress.bestScore || 0}</strong>`;
  }
  if (els.audioToggle) { els.audioToggle.textContent = "🔇"; els.audioToggle.setAttribute("aria-pressed", "false"); }
  renderHearts();
  updateHud();
  showApp();
})();
