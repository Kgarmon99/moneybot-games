/*
  MoneyBot Game Kit helpers.
  Load with:
    <script src="assets/moneybot/moneybot-game-kit.js"></script>
*/

(function () {
  const assetBase = "assets/moneybot/assets/";

  const assets = {
    mascotAvatar: "assets/moneybot-logo-avatar.png",
    coinGreen: `${assetBase}game-coin-green.svg`,
    coinGold: `${assetBase}game-coin-gold.svg`,
    obstacleDebt: `${assetBase}game-obstacle-debt.svg`,
    buttonPrimary: `${assetBase}ui-button-primary.svg`,
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    const el = byId(id);
    if (el) el.textContent = String(value);
  }

  function setMeter(id, value, max = 100) {
    const el = byId(id);
    if (!el) return;
    const pct = Math.max(0, Math.min(100, Math.round((Number(value) / Number(max || 1)) * 100)));
    el.style.setProperty("--value", `${pct}%`);
    el.setAttribute("aria-valuenow", String(pct));
  }

  function asset(name) {
    return assets[name] || "";
  }

  function img(name, alt, className = "mb-asset") {
    const image = document.createElement("img");
    image.src = asset(name);
    image.alt = alt || name;
    image.className = className;
    image.loading = "lazy";
    return image;
  }

  function showCoach(message, mood = "idle") {
    const coach = byId("mb-coach");
    if (!coach) return;
    const image = coach.querySelector("img");
    const bubble = coach.querySelector(".mb-coach-bubble");
    if (image) {
      image.src = asset("mascotAvatar");
    }
    if (bubble) bubble.textContent = message;
  }

  function burst(x, y, label = "+$") {
    const el = document.createElement("div");
    el.textContent = label;
    el.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      z-index: 100;
      color: var(--mb-green);
      font: 950 18px var(--mb-font);
      text-shadow: 0 0 18px rgba(0,230,118,.55);
      pointer-events: none;
      transform: translate(-50%, -50%);
      animation: mbBurst 720ms ease-out forwards;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 760);
  }

  if (!document.getElementById("mb-kit-animations")) {
    const style = document.createElement("style");
    style.id = "mb-kit-animations";
    style.textContent = `
      @keyframes mbBurst {
        0% { opacity: 0; transform: translate(-50%, -30%) scale(.7); }
        18% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        100% { opacity: 0; transform: translate(-50%, -115%) scale(.92); }
      }
    `;
    document.head.appendChild(style);
  }

  window.MoneyBotGameKit = {
    assets,
    asset,
    img,
    byId,
    setText,
    setMeter,
    showCoach,
    burst,
  };
})();
