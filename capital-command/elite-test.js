const { chromium } = require("playwright");
const assert = require("node:assert");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("console", (m) => {
      if (m.type() === "error" && !m.text().includes("Failed to load resource"))
        errors.push(m.text());
    });
    await page.goto("http://127.0.0.1:5199/capital-command/", {
      waitUntil: "networkidle",
    });
    await page.click("#startButton");
    await page.evaluate(() => {
      const s = CapitalCommand.getState();
      s.held = 500;
      CapitalCommand.refresh();
    });
    const projected = await page.locator("#projection").textContent();
    assert.match(projected, /Deploy \$220 to Bills/);
    await page.click('[data-system="bills"]');
    const actual = await page.locator("#billsValue").textContent();
    assert.match(actual, /\$220/);
    assert.equal(
      await page.locator('[data-system="shield"]').isDisabled(),
      true,
    );
    await page.keyboard.press("2");
    assert.equal(await page.locator("#shieldValue").textContent(), "$700");
    await page.click("#pauseButton");
    assert(
      await page
        .locator("#pauseModal")
        .getAttribute("class")
        .then((x) => x.includes("is-open")),
    );
    await page.click("#pauseRestartButton");
    assert(
      !(await page.locator("#pauseModal").getAttribute("class")).includes(
        "is-open",
      ),
    );
    const metrics = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
      sh: document.documentElement.scrollHeight,
      ch: document.documentElement.clientHeight,
      targets: [...document.querySelectorAll("button,a.icon-button")].map(
        (e) => {
          const r = e.getBoundingClientRect();
          return [r.width, r.height, e.id || e.textContent.trim()];
        },
      ),
    }));
    assert(
      metrics.sw <= metrics.cw,
      `horizontal overflow ${JSON.stringify(metrics)}`,
    );
    if (viewport.width === 390) {
      assert(
        metrics.sh <= metrics.ch,
        `document scroll ${JSON.stringify(metrics)}`,
      );
      assert(
        metrics.targets.every(([w, h]) => w >= 44 && h >= 44),
        `small target ${JSON.stringify(metrics.targets.filter(([w, h]) => w < 44 || h < 44))}`,
      );
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  await browser.close();
  console.log(
    "PASS: projection parity, unlock enforcement, pause restart, responsive overflow, 44px targets, console clean",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
