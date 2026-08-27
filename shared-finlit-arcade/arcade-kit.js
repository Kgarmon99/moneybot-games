(function () {
  const config = window.MB_ARCADE_CONFIG;
  const kit = window.MoneyBotGameKit || {};
  const $ = (id) => document.getElementById(id);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = {
    running: false,
    paused: false,
    ended: false,
    score: 0,
    streak: 0,
    round: 1,
    best: Number(localStorage.getItem(`${config.id}:best`) || 0),
  };

  function haptic(ms = 18) {
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  function toast(message) {
    const el = $("toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("show"), 1100);
  }

  function updateHud() {
    kit.setText?.("score", state.score);
    kit.setText?.("streak", state.streak);
    kit.setText?.("round", state.round);
    kit.setText?.("best", state.best);
  }

  function setMeter(id, value, max = 100, valueText = "") {
    kit.setMeter?.(id, value, max);
    const fill = $(id);
    const meter = fill?.parentElement;
    if (!meter) return;
    const pct = clamp(Math.round((Number(value) / Number(max || 1)) * 100), 0, 100);
    meter.setAttribute("aria-valuenow", String(pct));
    if (valueText) meter.setAttribute("aria-valuetext", valueText);
  }

  function setCoach(message) {
    const el = $("coachText");
    if (el) el.textContent = message;
  }

  function burst(target, label) {
    if (!target || !kit.burst) return;
    const rect = target.getBoundingClientRect();
    kit.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, label);
  }

  function endGame(won, title, message) {
    state.running = false;
    state.ended = true;
    state.best = Math.max(state.best, state.score);
    localStorage.setItem(`${config.id}:best`, String(state.best));
    updateHud();
    $("resultTitle").textContent = title || (won ? "Round cleared" : "Run over");
    $("resultText").textContent = message;
    $("resultStats").innerHTML = `
      <div class="mb-stat"><span class="mb-stat-label">Score</span><span class="mb-stat-value">${state.score}</span></div>
      <div class="mb-stat"><span class="mb-stat-label">Best</span><span class="mb-stat-value">${state.best}</span></div>
      <div class="mb-stat"><span class="mb-stat-label">Streak</span><span class="mb-stat-value">${state.streak}</span></div>
    `;
    $("resultOverlay").classList.remove("hidden");
  }

  function resetBase() {
    state.running = true;
    state.paused = false;
    state.ended = false;
    state.score = 0;
    state.streak = 0;
    state.round = 1;
    $("startOverlay").classList.add("hidden");
    $("resultOverlay").classList.add("hidden");
    $("pauseOverlay").classList.add("hidden");
    updateHud();
  }

  function pause() {
    if (!state.running || state.ended) return;
    state.paused = true;
    $("pauseOverlay").classList.remove("hidden");
  }

  function resume() {
    if (!state.running || state.ended) return;
    state.paused = false;
    $("pauseOverlay").classList.add("hidden");
  }

  function points(amount, target, label) {
    state.score = Math.max(0, state.score + amount);
    state.streak = amount > 0 ? state.streak + 1 : 0;
    updateHud();
    if (label) burst(target, label);
    if (amount > 0) haptic(12);
  }

  const games = {
    runner: null,
    debt: null,
    portfolio: null,
  };

  games.runner = function runnerGame() {
    const zone = $("playZone");
    let lane = 2;
    let cash = 1200;
    let recurring = 220;
    let burn = 360;
    let timeLeft = 45;
    let last = 0;
    let spawnTimer = 0;
    let drops = [];
    let raf = 0;

    function drawShell() {
      zone.innerHTML = `
        <div class="lane-board">${Array.from({ length: 5 }, (_, i) => `<div class="lane" aria-hidden="true"></div>`).join("")}</div>
        <div class="runner" id="runner" style="--lane:${lane}"><img src="assets/moneybot/assets/moneybot-logo-avatar.png" alt="MoneyBot runner"></div>
      `;
      $("controls").innerHTML = `
        <div class="thumb-controls" aria-label="Choose lane">
          ${[1, 2, 3, 4, 5].map((n, i) => `<button class="lane-btn" type="button" data-lane="${i}" aria-label="Lane ${n}">${n}</button>`).join("")}
        </div>
        <div class="control-cluster">
          <button class="mb-btn mb-btn-secondary" id="pauseBtn" type="button">Pause</button>
          <button class="mb-btn mb-btn-secondary" id="restartBtn" type="button">Restart</button>
        </div>
      `;
      $("controls").querySelectorAll("[data-lane]").forEach((button) => {
        button.addEventListener("click", () => moveTo(Number(button.dataset.lane)));
      });
      $("pauseBtn").addEventListener("click", pause);
      $("restartBtn").addEventListener("click", start);
    }

    function meter() {
      const netBurn = Math.max(80, burn - recurring);
      const runwayMonths = cash / netBurn;
      $("meterAName").textContent = "Cash";
      $("meterBName").textContent = "Runway";
      $("meterAValue").textContent = `$${Math.round(cash)}`;
      $("meterBValue").textContent = `${runwayMonths.toFixed(1)} mo`;
      setMeter("meterA", cash, 2200, `$${Math.round(cash)} cash`);
      setMeter("meterB", runwayMonths, 6, `${runwayMonths.toFixed(1)} months of runway`);
    }

    function moveTo(next) {
      lane = clamp(next, 0, 4);
      const runner = $("runner");
      if (runner) runner.style.setProperty("--lane", lane);
    }

    function spawn() {
      const roll = Math.random();
      const item = roll > 0.72
        ? { kind: "bad", label: "BILL", value: -120 }
        : roll > 0.55
          ? { kind: "shield", label: "SAVE", value: 150 }
          : { kind: "good", label: "REV", value: 40 };
      drops.push({ ...item, lane: Math.floor(Math.random() * 5), y: -20, speed: 95 + Math.random() * 78 + state.round * 4 });
    }

    function renderDrops() {
      zone.querySelectorAll(".drop").forEach((el) => el.remove());
      drops.forEach((drop) => {
        const el = document.createElement("div");
        el.className = `drop ${drop.kind}`;
        el.style.setProperty("--lane", drop.lane);
        el.style.setProperty("--y", `${drop.y}px`);
        el.textContent = drop.label;
        zone.appendChild(el);
      });
    }

    function loop(now) {
      if (!state.running || state.ended) return;
      raf = requestAnimationFrame(loop);
      if (state.paused) {
        last = now;
        return;
      }
      const dt = Math.min(0.034, (now - last) / 1000 || 0.016);
      last = now;
      timeLeft -= dt;
      spawnTimer -= dt;
      cash -= Math.max(80, burn - recurring) / 30 * dt;
      if (spawnTimer <= 0) {
        spawn();
        spawnTimer = Math.max(0.34, 0.92 - state.round * 0.04);
      }
      drops.forEach((drop) => {
        drop.y += drop.speed * dt;
      });
      const height = zone.clientHeight;
      drops = drops.filter((drop) => {
        const hit = drop.y > height - 82 && drop.y < height - 22 && drop.lane === lane;
        if (hit) {
          const target = $("runner");
          if (drop.kind === "bad") {
            cash = Math.max(0, cash + drop.value);
            burn += 20;
            points(-8, target, "-$");
            toast("Bill hit. More burn means less runway.");
          } else {
            if (drop.kind === "good") recurring += 35;
            cash += drop.value;
            points(drop.kind === "shield" ? 18 : 12, target, drop.kind === "shield" ? "+CASH" : "+REV");
          }
          meter();
          return false;
        }
        return drop.y < height + 60;
      });
      state.round = Math.max(1, Math.floor((45 - timeLeft) / 10) + 1);
      updateHud();
      meter();
      renderDrops();
      const runwayMonths = cash / Math.max(80, burn - recurring);
      if (cash <= 0 || runwayMonths < 0.3) {
        cancelAnimationFrame(raf);
        endGame(false, "Runway ran out", "Your expenses outran your income. Prioritize recurring revenue and savings shields next run.");
      } else if (timeLeft <= 0) {
        cancelAnimationFrame(raf);
        endGame(true, "Runway secured", "You kept cash moving and protected the runway through the whole sprint.");
      }
    }

    function start() {
      cancelAnimationFrame(raf);
      resetBase();
      lane = 2;
      cash = 1200;
      recurring = 220;
      burn = 360;
      timeLeft = 45;
      last = 0;
      spawnTimer = 0;
      drops = [];
      drawShell();
      meter();
      setCoach("Move between lanes. Collect revenue and savings, dodge bills.");
      raf = requestAnimationFrame(loop);
    }

    document.addEventListener("keydown", (event) => {
      if (config.type !== "runner" || !state.running) return;
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") moveTo(lane - 1);
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") moveTo(lane + 1);
      if (event.key === "Escape") pause();
    });

    return { start, resume };
  };

  games.debt = function debtGame() {
    const zone = $("playZone");
    let month = 1;
    let flexibility = 72;
    let interestSaved = 0;
    let debts = [];

    const names = ["Store card", "Phone plan", "Student loan", "Auto note", "Cash advance", "Starter card"];

    function makeDebts() {
      debts = Array.from({ length: 3 }, (_, i) => ({
        name: names[(month + i + Math.floor(Math.random() * names.length)) % names.length],
        apr: Math.round(8 + Math.random() * 24 + month * 1.3),
        balance: Math.round((260 + Math.random() * 680 + month * 70) / 10) * 10,
      })).sort(() => Math.random() - 0.5);
    }

    function meter() {
      $("meterAName").textContent = "Flex";
      $("meterBName").textContent = "Interest blocked";
      $("meterAValue").textContent = `${Math.round(flexibility)}%`;
      $("meterBValue").textContent = `$${interestSaved}`;
      setMeter("meterA", flexibility, 100, `${Math.round(flexibility)} percent flexibility`);
      setMeter("meterB", interestSaved, 80, `$${interestSaved} estimated one-month interest blocked`);
    }

    function render() {
      const bestApr = Math.max(...debts.map((debt) => debt.apr));
      zone.innerHTML = `
        <div class="choice-board">
          <section class="month-card">
            <h2>Month ${month}: choose the debt to attack</h2>
            <p>Minimums are covered. Put the extra $120 where one month of interest costs the most.</p>
          </section>
          <div class="debt-grid">
            ${debts.map((debt, index) => `
              <button class="debt-btn" type="button" data-index="${index}" aria-label="Pay ${debt.name}">
                <strong>${debt.name}</strong>
                <span>APR ${debt.apr}%</span>
                <span>Balance $${debt.balance}</span>
              </button>
            `).join("")}
          </div>
        </div>
      `;
      zone.querySelectorAll(".debt-btn").forEach((button) => {
        button.addEventListener("click", () => choose(Number(button.dataset.index), bestApr, button));
      });
      $("controls").innerHTML = `
        <div class="concept">Pick the highest APR first. Wrong picks let expensive interest keep growing.</div>
        <div class="control-cluster">
          <button class="mb-btn mb-btn-secondary" id="pauseBtn" type="button">Pause</button>
          <button class="mb-btn mb-btn-secondary" id="restartBtn" type="button">Restart</button>
        </div>
      `;
      $("pauseBtn").addEventListener("click", pause);
      $("restartBtn").addEventListener("click", start);
      meter();
    }

    function choose(index, bestApr, target) {
      if (!state.running || state.paused) return;
      const picked = debts[index];
      const correct = picked.apr === bestApr;
      if (correct) {
        const saved = Math.round(Math.min(120, picked.balance) * picked.apr / 100 / 12);
        interestSaved += saved;
        flexibility = clamp(flexibility + 5, 0, 100);
        points(24 + state.streak * 2, target, `+$${saved}`);
        setCoach("Avalanche move. Highest APR first blocks the most interest on the extra payment.");
      } else {
        const leak = Math.round((bestApr - picked.apr) * 2.2 + 10);
        flexibility = clamp(flexibility - leak, 0, 100);
        points(-10, target, "-APR");
        setCoach("That debt can wait. The highest APR is growing fastest.");
      }
      month += 1;
      state.round = month;
      haptic(correct ? 14 : 34);
      if (month > 8) {
        endGame(true, "Debt pressure down", "You practiced the debt avalanche: pay minimums, then attack the highest APR.");
        return;
      }
      if (flexibility <= 0) {
        endGame(false, "Interest took over", "Your extra payments missed the most expensive balances. Try hunting the highest APR first.");
        return;
      }
      makeDebts();
      render();
      updateHud();
    }

    function start() {
      resetBase();
      month = 1;
      flexibility = 72;
      interestSaved = 0;
      makeDebts();
      setCoach("Read the APR, not just the balance. Expensive debt gets priority.");
      render();
    }

    document.addEventListener("keydown", (event) => {
      if (config.type !== "debt" || !state.running) return;
      const key = Number(event.key);
      if (key >= 1 && key <= 3) {
        const button = zone.querySelectorAll(".debt-btn")[key - 1];
        if (button) button.click();
      }
      if (event.key === "Escape") pause();
    });

    return { start };
  };

  games.portfolio = function portfolioGame() {
    const zone = $("playZone");
    const buckets = [
      { id: "stocks", name: "Growth", risk: 16, return: 18 },
      { id: "bonds", name: "Stability", risk: 5, return: 8 },
      { id: "cash", name: "Cash", risk: 1, return: 3 },
      { id: "skills", name: "Skills", risk: 7, return: 14 },
    ];
    const events = [
      { title: "Market storm", copy: "High growth can win, but too much single-bucket risk gets punished.", targetRisk: 13, minReturn: 14 },
      { title: "Inflation wave", copy: "Cash alone feels safe but loses speed. Blend stability with growth.", targetRisk: 9, minReturn: 10 },
      { title: "Opportunity window", copy: "You need upside without betting the whole portfolio on one lane.", targetRisk: 15, minReturn: 15 },
      { title: "Emergency month", copy: "A flexible mix survives surprises better than all-in choices.", targetRisk: 8, minReturn: 9 },
      { title: "Long game", copy: "Compounding needs growth, but diversification keeps you in the game.", targetRisk: 12, minReturn: 14 },
    ];
    let allocation = {};
    let eventIndex = 0;
    let resilience = 68;
    let tokens = 10;

    function resetAlloc() {
      allocation = { stocks: 0, bonds: 0, cash: 0, skills: 0 };
      tokens = 10;
    }

    function totals() {
      const values = buckets.reduce((acc, bucket) => {
        acc.risk += allocation[bucket.id] * bucket.risk;
        acc.return += allocation[bucket.id] * bucket.return;
        acc.concentration = Math.max(acc.concentration, allocation[bucket.id]);
        return acc;
      }, { risk: 0, return: 0, concentration: 0 });
      values.risk = Math.round(values.risk / 10);
      values.return = Math.round(values.return / 10);
      return values;
    }

    function meter() {
      const t = totals();
      $("meterAName").textContent = "Risk";
      $("meterBName").textContent = "Return";
      $("meterAValue").textContent = `${t.risk}`;
      $("meterBValue").textContent = `${t.return}`;
      setMeter("meterA", t.risk, 18, `${t.risk} portfolio risk`);
      setMeter("meterB", t.return, 18, `${t.return} portfolio return`);
    }

    function renderBars() {
      return buckets.map((bucket) => `
        <div class="bar-row">
          <span>${bucket.name}</span>
          <div class="bar-track"><div class="bar-fill" style="--w:${allocation[bucket.id] * 10}%"></div></div>
          <span>${allocation[bucket.id]}/10</span>
        </div>
      `).join("");
    }

    function render() {
      const current = events[eventIndex];
      zone.innerHTML = `
        <div class="balance-board">
          <section class="event-card">
            <h2>${current.title}</h2>
            <p>${current.copy}</p>
          </section>
          <div class="portfolio-bars">${renderBars()}</div>
          <div class="portfolio-grid">
            ${buckets.map((bucket) => `
              <button class="bucket-btn" type="button" data-bucket="${bucket.id}">
                <strong>${bucket.name}</strong>
                <span>Risk ${bucket.risk} / Return ${bucket.return}</span>
                <span>Add one allocation token</span>
              </button>
            `).join("")}
          </div>
        </div>
      `;
      zone.querySelectorAll(".bucket-btn").forEach((button) => {
        button.addEventListener("click", () => addBucket(button.dataset.bucket, button));
      });
      $("controls").innerHTML = `
        <div class="concept">Tokens left: <strong>${tokens}</strong>. Diversify, then test the portfolio.</div>
        <div class="control-cluster">
          <button class="mb-btn mb-btn-primary" id="testBtn" type="button">Test portfolio</button>
          <button class="mb-btn mb-btn-secondary" id="clearBtn" type="button">Clear</button>
          <button class="mb-btn mb-btn-secondary" id="pauseBtn" type="button">Pause</button>
        </div>
      `;
      $("testBtn").addEventListener("click", testPortfolio);
      $("clearBtn").addEventListener("click", () => { resetAlloc(); render(); meter(); });
      $("pauseBtn").addEventListener("click", pause);
      meter();
    }

    function addBucket(id, target) {
      if (tokens <= 0 || !state.running || state.paused) return;
      allocation[id] += 1;
      tokens -= 1;
      points(2, target, "+MIX");
      render();
    }

    function testPortfolio() {
      if (tokens > 0) {
        toast("Use all 10 tokens first.");
        return;
      }
      const current = events[eventIndex];
      const t = totals();
      const concentrationPenalty = Math.max(0, t.concentration - 5) * 5;
      const riskPenalty = Math.max(0, t.risk - current.targetRisk);
      const returnGap = Math.max(0, current.minReturn - t.return);
      const hit = Math.max(0, concentrationPenalty + riskPenalty + returnGap);
      if (hit <= 8) {
        resilience = clamp(resilience + 8, 0, 100);
        points(32, $("testBtn"), "+BAL");
        setCoach("Strong mix. You balanced upside with survival.");
      } else {
        resilience = clamp(resilience - hit, 0, 100);
        points(-12, $("testBtn"), "-RISK");
        setCoach(concentrationPenalty ? "Too concentrated. Spread bets so one shock cannot sink the round." : "The mix missed the event. Tune risk and return together.");
      }
      $("meterAName").textContent = "Resilience";
      $("meterAValue").textContent = `${Math.round(resilience)}%`;
      setMeter("meterA", resilience, 100, `${Math.round(resilience)} percent resilience`);
      eventIndex += 1;
      state.round = eventIndex + 1;
      haptic(hit <= 8 ? 16 : 40);
      if (resilience <= 0) {
        endGame(false, "Portfolio cracked", "One mix carried too much risk. Diversification protects your ability to keep playing.");
        return;
      }
      if (eventIndex >= events.length) {
        endGame(true, "Portfolio held", "You survived shocks by balancing growth, stability, cash, and skill-building.");
        return;
      }
      resetAlloc();
      updateHud();
      setTimeout(render, prefersReducedMotion ? 20 : 500);
    }

    function start() {
      resetBase();
      eventIndex = 0;
      resilience = 68;
      resetAlloc();
      setCoach("Build a portfolio that can grow and survive. Do not go all in.");
      render();
    }

    document.addEventListener("keydown", (event) => {
      if (config.type !== "portfolio" || !state.running) return;
      const key = Number(event.key);
      if (key >= 1 && key <= 4) {
        const button = zone.querySelectorAll(".bucket-btn")[key - 1];
        if (button) button.click();
      }
      if (event.key === "Enter") $("testBtn")?.click();
      if (event.key === "Escape") pause();
    });

    return { start };
  };

  function boot() {
    document.title = `${config.title} - MoneyBot Games`;
    $("gameTitle").textContent = config.title;
    $("startTitle").textContent = config.title;
    $("concept").textContent = config.concept;
    $("startText").textContent = config.startText;
    $("coachText").textContent = config.coach;
    $("mascotHud").src = "assets/moneybot/assets/moneybot-logo-avatar.png";
    $("mascotStart").src = "assets/moneybot/assets/moneybot-logo-avatar.png";
    $("mascotResult").src = "assets/moneybot/assets/moneybot-logo-avatar.png";
    updateHud();

    const game = games[config.type]();
    $("startBtn").addEventListener("click", game.start);
    $("playAgainBtn").addEventListener("click", game.start);
    $("resumeBtn").addEventListener("click", resume);
    $("restartFromPauseBtn").addEventListener("click", game.start);
    document.addEventListener("keydown", (event) => {
      if (event.key === " " && !state.running) {
        event.preventDefault();
        game.start();
      }
    });
  }

  boot();
})();
