# Design Notes: Money Printer GO

## Math & Mechanics

**The Core Tension:**
Cash is needed to buy assets, but generating cash increases the global multiplier for asset prices. 
If the player prints too fast, the assets become unaffordable. If they print too slow, they run out of time.

**Variables:**
- `Cash`: Fiat currency on hand.
- `Real Wealth`: The score. 1 Asset = 1 Wealth. Target = 100.
- `Inflation Rate`: Starts at 1.0x (0%). Maxes out at 10.0x (1000%).
- `Base Asset Price`: Starts at $10.
- `Current Asset Price`: `Base Asset Price * Inflation Rate`.

**The Loop Execution:**
1. **Printing:** Each tap/tick of the printer adds +$5 Cash, but also adds +0.02x to the `Inflation Rate`.
2. **Cooling:** If the player STOPS printing, the `Inflation Rate` drops naturally over time (e.g., -0.05x per second), representing economic stabilization.
3. **Buying:** Player spends `Cash` equal to `Current Asset Price` to gain +1 `Real Wealth`.
4. **The Trap:** If inflation hits 10.0x, the game ends immediately in a Hyperinflation loss. 

## UI Layout (Mobile First)
- **Header:** 
  - Left: Real Wealth (⭐ 0/100)
  - Right: Timer (02:00)
- **Store Area:**
  - Big button showing "Buy Asset: $10" (price updates dynamically).
- **Feedback Area:**
  - MoneyBot mascot face (calm -> sweating -> screaming).
- **Control Zone (Bottom):**
  - **Inflation Meter:** A horizontal bar just above the printer. Green -> Yellow -> Red.
  - **Printer Button:** Massive, thumb-friendly button covering the bottom 20% of the screen.

## Polish & "Juice" Details
1. **Price Odometer:** When prices increase due to inflation, the numbers should roll up rapidly, making it feel out of control.
2. **Printer Overheat:** The printer button should turn red and shake slightly as inflation crosses 500% (5.0x).
3. **Mascot:** The mascot image swaps based on `Inflation Rate` thresholds (< 2.0x calm, > 5.0x nervous, > 8.0x panic).
4. **Cash Particles:** Tapping the printer should spawn small green `$` symbols that float up and fade out.

## Elite-Score Risks (What CodeBot needs to nail)
- **Math Tuning:** The game is ruined if inflation cools too fast (too easy) or if prices outpace cash generation instantly (impossible). CodeBot needs to tune the $+/tap vs. inflation+/tap ratio carefully.
- **Mobile Responsiveness:** The printer button must be huge and prevent double-tap-to-zoom on iOS Safari (`touch-action: manipulation`).
- **Feedback Loop Clarity:** If the player doesn't realize *why* prices are going up, the educational mechanic fails. The inflation meter and price tags must be visually linked (e.g., pulsing red together).