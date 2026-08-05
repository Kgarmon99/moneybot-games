(() => {
  const DECK = [
    {
      sender: "IRS Refund Unit",
      text: "Your tax refund of $1,247 is pending. Click here to verify your banking details and receive it within 24 hours.",
      fraud: true,
      clues: ["Urgency", "Suspicious link", "Unsolicited"],
      hint: "The IRS does not email or text refund links. They send letters.",
    },
    {
      sender: "Mom",
      text: "Can you Venmo me $40 for groceries? I'll pay you back Friday.",
      fraud: false,
      clues: ["Known sender", "Specific amount"],
      hint: "Messages from people you know with normal requests are usually fine.",
    },
    {
      sender: "FedEx Delivery",
      text: "Package on hold. Pay a $2.99 redelivery fee now or it will be returned to sender.",
      fraud: true,
      clues: ["Small fee trap", "Threat of loss"],
      hint: "Real couriers do not demand tiny fees via random texts.",
    },
    {
      sender: "Netflix",
      text: "Your monthly invoice for $15.49 is ready. View account at netflix.com.",
      fraud: false,
      clues: ["Expected bill", "Real domain"],
      hint: "Check the domain and whether you expected the charge.",
    },
    {
      sender: "CryptoWin Bot",
      text: "Guaranteed 340% returns in 7 days. Deposit now — spots limited to the first 50 people.",
      fraud: true,
      clues: ["Guaranteed returns", "Fake scarcity"],
      hint: "Guaranteed high returns are a classic fraud signal. No one can guarantee that.",
    },
    {
      sender: "Boss (Dave)",
      text: "I'm in back-to-back meetings. Can you buy 5 gift cards for a client and send the codes? I'll reimburse you.",
      fraud: true,
      clues: ["Gift card pressure", "Impersonation"],
      hint: "Gift card requests through text or email are a top scam pattern.",
    },
    {
      sender: "Bank Alert",
      text: "Suspicious charge detected on your card ending in 4821. Reply Y to confirm or call the number on your card.",
      fraud: false,
      clues: ["Specific detail", "No link", "Tells you to call official number"],
      hint: "Good alerts give a detail and point you to your real card number.",
    },
    {
      sender: "Prize Center",
      text: "CONGRATULATIONS! You won a $1,000 Walmart gift card. Pay a $9.99 processing fee to claim it.",
      fraud: true,
      clues: ["Unexpected prize", "Fee to collect"],
      hint: "You never have to pay to collect a real prize.",
    },
    {
      sender: "LinkedIn",
      text: "Jordan commented on your post: 'Great insights — sent you a connection request.'",
      fraud: false,
      clues: ["Normal notification", "No money ask"],
      hint: "Social notifications without money or login pressure are usually legit.",
    },
    {
      sender: "Student Loan Relief",
      text: "Act immediately! Your loan forgiveness application will expire tonight. Pay $99 to secure your spot.",
      fraud: true,
      clues: ["Expiring offer", "Upfront fee"],
      hint: "Real government programs do not charge fees or expire in hours.",
    },
    {
      sender: "Amazon",
      text: "Your order #112-9342021 has shipped and will arrive Thursday.",
      fraud: false,
      clues: ["Order you made", "Specific details"],
      hint: "Expected shipping updates with order numbers are usually real.",
    },
    {
      sender: "Security Team",
      text: "We noticed unusual login activity. Verify your password here to avoid account lockout.",
      fraud: true,
      clues: ["Fear tactic", "Password link"],
      hint: "Never enter your password from a link in an unexpected message.",
    },
  ];

  const state = {
    deck: [],
    index: 0,
    score: 0,
    trust: 100,
    streak: 0,
    bestStreak: 0,
    correct: 0,
    wrong: 0,
    status: "start",
  };

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
    resultMascot: document.getElementById("resultMascot"),
    btnStart: document.getElementById("btnStart"),
    btnFraud: document.getElementById("btnFraud"),
    btnNah: document.getElementById("btnNah"),
    btnPlayAgain: document.getElementById("btnPlayAgain"),
    btnResume: document.getElementById("btnResume"),
    btnRestartFromPause: document.getElementById("btnRestartFromPause"),
    shell: document.getElementById("shell"),
  };

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function resetGame() {
    state.deck = shuffle(DECK);
    state.index = 0;
    state.score = 0;
    state.trust = 100;
    state.streak = 0;
    state.bestStreak = 0;
    state.correct = 0;
    state.wrong = 0;
    state.status = "playing";
    updateHud();
    renderCard();
    hideOverlays();
    setMascot("idle");
    els.coachLine.textContent = "Read carefully. Swipe or tap your call.";
  }

  function updateHud() {
    els.trust.textContent = `${Math.max(0, state.trust)}%`;
    els.score.textContent = state.score;
    els.streak.textContent = state.streak;
    els.trust.parentElement.classList.toggle("danger", state.trust <= 35);
    const pct = state.deck.length ? ((state.index) / state.deck.length) * 100 : 0;
    els.progress.style.width = `${pct}%`;
  }

  function renderCard() {
    const item = state.deck[state.index];
    if (!item) return;
    els.card.classList.remove("fly-left", "fly-right");
    els.card.style.transform = "";
    els.card.style.opacity = "1";
    els.cardSender.textContent = item.sender;
    els.cardText.textContent = item.text;
    els.cardHint.textContent = "";
    els.cardHint.classList.remove("show");
    els.cardClues.innerHTML = "";
    els.cardClues.classList.add("hidden");
    els.cardBadge.textContent = `Message ${state.index + 1}/${state.deck.length}`;
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

  function spawnConfetti() {
    const colors = ["var(--mb-green)", "var(--mb-gold)", "var(--mb-blue)", "var(--mb-purple)"];
    for (let i = 0; i < 60; i++) {
      const c = document.createElement("div");
      c.className = "particle";
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      c.style.left = `${50 + (Math.random() - 0.5) * 80}vw`;
      c.style.top = "-10px";
      c.style.width = `${6 + Math.random() * 8}px`;
      c.style.height = `${6 + Math.random() * 8}px`;
      document.body.appendChild(c);
      const tx = (Math.random() - 0.5) * 300;
      const rot = Math.random() * 720;
      c.animate(
        [
          { transform: `translate(-50%, 0) rotate(0deg)`, opacity: 1 },
          { transform: `translate(calc(-50% + ${tx}px), 110vh) rotate(${rot}deg)`, opacity: 0 },
        ],
        { duration: 1400 + Math.random() * 1400, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "forwards" }
      );
      setTimeout(() => c.remove(), 3000);
    }
  }

  function spawnParticles(good) {
    const color = good ? "var(--mb-green)" : "var(--mb-red)";
    const rect = els.card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 14; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.style.background = color;
      p.style.left = `${cx}px`;
      p.style.top = `${cy}px`;
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 90;
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

  function handleAnswer(isFraud) {
    if (state.status !== "playing" || state._answering) return;
    state._answering = true;
    const item = state.deck[state.index];
    const correct = item.fraud === isFraud;

    if (correct) {
      state.correct += 1;
      state.streak += 1;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      const points = 100 + state.streak * 20;
      state.score += points;
      showPop(`+${points}`, true);
      spawnParticles(true);
      setMascot(state.streak >= 3 ? "celebrate" : "idle");
      els.coachLine.textContent = ["Nice call.", "Scam radar on.", "You're getting sharper.", "Unstreakable."][Math.min(state.streak - 1, 3)];
    } else {
      state.wrong += 1;
      state.streak = 0;
      state.trust = Math.max(0, state.trust - 25);
      showPop("-25% trust", false);
      spawnParticles(false);
      setMascot("facepalm");
      els.coachLine.textContent = "Oof. Read the clues and try again.";
    }

    revealClues(item);
    revealHint(item, correct);
    updateHud();

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
    }, 1000);
  }

  function revealHint(item, correct) {
    const hint = item.hint;
    els.cardHint.textContent = hint;
    els.cardHint.classList.add("show");
    if (!correct) {
      els.cardHint.style.color = "var(--mb-red)";
    } else {
      els.cardHint.style.color = "var(--mb-muted)";
    }
  }

  function endGame(win) {
    state.status = "over";
    if (win) spawnConfetti();
    els.resultOverlay.classList.remove("hidden");
    els.resultTitle.textContent = win ? "Trust Intact" : "Trust Depleted";
    els.resultMessage.textContent = win
      ? "You made it through. Your scam radar is looking strong."
      : "Scammers got the best of you this time. Review the hints and try again.";
    els.resultMascot.src = win
      ? "assets/moneybot/assets/moneybot-celebrating.svg"
      : "assets/moneybot/assets/moneybot-idle.svg";
    els.resultStats.innerHTML = `
      <div class="result-stat"><span>Score</span><strong>${state.score}</strong></div>
      <div class="result-stat"><span>Correct</span><strong>${state.correct}</strong></div>
      <div class="result-stat"><span>Best Streak</span><strong>${state.bestStreak}</strong></div>
      <div class="result-stat"><span>Trust Left</span><strong>${Math.max(0, state.trust)}%</strong></div>
    `;
    updateHud();
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

  // Touch / swipe handling
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
  }

  function onPointerUp() {
    if (!dragging) return;
    dragging = false;
    els.card.classList.remove("dragging");
    if (currentX != null && startX != null) {
      const dx = currentX - startX;
      if (dx > 90) {
        handleAnswer(false); // nah (right)
      } else if (dx < -90) {
        handleAnswer(true); // fraud (left)
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

  els.btnStart.addEventListener("click", resetGame);
  els.btnPlayAgain.addEventListener("click", resetGame);
  els.btnResume.addEventListener("click", resumeGame);
  els.btnRestartFromPause.addEventListener("click", resetGame);
  els.btnFraud.addEventListener("click", () => handleAnswer(true));
  els.btnNah.addEventListener("click", () => handleAnswer(false));

  document.addEventListener("keydown", (e) => {
    if (state.status === "start" && e.key === "Enter") {
      resetGame();
      return;
    }
    if (state.status === "over" && e.key === "Enter") {
      resetGame();
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

  // Pause when tab hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.status === "playing") pauseGame();
  });

  // Initial render of empty card
  els.cardSender.textContent = "Ready?";
  els.cardText.textContent = "Press Start to begin.";
  els.cardClues.innerHTML = "";
  els.cardClues.classList.add("hidden");
  els.cardHint.textContent = "";
  els.cardBadge.textContent = "Message 0/0";
})();
