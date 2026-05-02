export const CONFIG = {
  COLORS: {
    MONEYBOT_WHITE: 0xffffff,
    MONEYBOT_EYE: 0x00ff00,
    HUB_FLOOR: 0x222222,
    TERMINAL: 0x00ff00,
    NEON_GREEN: 0x00ff00,
    SPACE_BLUE: 0x000033
  },
  PLAYER: {
    MOVE_SPEED: 8,
    JUMP_FORCE: 12,
    GRAVITY: 30,
    GROUND_LEVEL: 0
  },
  STORY: [
    {
      id: 'intro',
      triggerDist: 5,
      name: 'MoneyBot',
      messages: [
        "Beep boop! Systems online. Hello there, young historian!",
        "I am MoneyBot, and I've been programmed to guard the secrets of wealth.",
        "Humans didn't always use coins and bills. It's a long, exciting journey!",
        "Walk through the hubs in order to see how money evolved. Follow the glowing path!"
      ]
    },
    {
      id: 'barter',
      triggerDist: 3,
      name: 'ERA 1: ANCIENT BARTER',
      label: 'BARTERING',
      pos: { x: 15, z: -10 },
      messages: [
        "ERA 1: The Barter System.",
        "In the beginning, people traded things directly. This is BARTERING.",
        "Need a fuel cell? Trade your space-apples for it!",
        "Complete the trade to unlock the next era."
      ]
    },
    {
      id: 'commodity',
      triggerDist: 3,
      name: 'ERA 2: SHELLS & BEADS',
      label: 'COMMODITIES',
      pos: { x: 15, z: -25 },
      messages: [
        "ERA 2: Commodity Money.",
        "Trading big items was hard, so people used rare things like shells or beads.",
        "They were small, easy to carry, and everyone agreed they were valuable!",
        "Sort these precious shells to earn your next sticker!"
      ]
    },
    {
      id: 'coins',
      triggerDist: 3,
      name: 'ERA 3: PRECIOUS METALS',
      label: 'METAL COINS',
      pos: { x: 0, z: -40 },
      messages: [
        "ERA 3: The First Coins.",
        "About 2,600 years ago, people started stamping gold and silver into coins.",
        "This made trading even easier because the weight was guaranteed by kings!",
        "Try the forge! It's harder now—don't miss the hit zone!"
      ]
    },
    {
      id: 'paper',
      triggerDist: 3,
      name: 'ERA 4: THE PAPER PRESS',
      label: 'BANKNOTES',
      pos: { x: -15, z: -25 },
      messages: [
        "ERA 4: Paper Currency.",
        "Heavy gold was a pain to move. China invented paper money as 'receipts' for gold.",
        "Soon, the paper itself became the money! It's light and fast.",
        "Can you print 5 bills perfectly? The speed is increasing!"
      ]
    },
    {
      id: 'gold_standard',
      triggerDist: 3,
      name: 'ERA 5: THE GOLD VAULT',
      label: 'GOLD STANDARD',
      pos: { x: -15, z: -10 },
      messages: [
        "ERA 5: The Gold Standard.",
        "For a long time, every paper dollar was 'backed' by real gold in a vault.",
        "You could swap your paper for a nugget! This kept money stable.",
        "Balance the scale: Paper vs. Gold!"
      ]
    },
    {
        id: 'digital',
        triggerDist: 3,
        name: 'ERA 6: THE DIGITAL AGE',
        label: 'DIGITAL BANKING',
        pos: { x: 0, z: 10 },
        messages: [
          "ERA 6: Modern Digital Wealth.",
          "Today, money is mostly code! Credits, apps, and digital banks.",
          "It's invisible but very real. Swipe to confirm your futuristic trades.",
          "Finish this to complete the timeline!"
        ]
      }
  ],
  STICKERS: [
    { id: 'barter', name: 'Barter Master', icon: '🍎', description: 'Mastered direct trade!' },
    { id: 'commodity', name: 'Shell Collector', icon: '🐚', description: 'Found value in nature!' },
    { id: 'coins', name: 'Precision Smith', icon: '🔨', description: 'Forged perfect metal coins!' },
    { id: 'paper', name: 'Fast Printer', icon: '🖨️', description: 'Mastered the money press!' },
    { id: 'gold_standard', name: 'Vault Keeper', icon: '⚖️', description: 'Balanced paper and gold!' },
    { id: 'digital', name: 'Cyber Hero', icon: '⚡', description: 'Secured the digital frontier!' }
  ],
  TIMELINE_SUMMARY: [
    {
      era: "BARTERING",
      time: "Ancient History",
      summary: "Directly trading items (crops for tools). Simple, but hard to find matches!",
      icon: "🍎",
      color: "#00ff00"
    },
    {
      era: "COMMODITY MONEY",
      time: "Ancient Times",
      summary: "Using shells, salt, or beads as intermediate currency.",
      icon: "🐚",
      color: "#00ccff"
    },
    {
      era: "METAL COINS",
      time: "600 BC",
      summary: "Precious metals stamped by governments for trust and ease.",
      icon: "🪙",
      color: "#ffcc00"
    },
    {
      era: "BANKNOTES",
      time: "700 AD - Present",
      summary: "Paper receipts for gold that became money themselves.",
      icon: "💵",
      color: "#00ffcc"
    },
    {
      era: "GOLD STANDARD",
      time: "1800s - 1970s",
      summary: "Money backed by actual gold kept in high-security vaults.",
      icon: "⚖️",
      color: "#ffd700"
    },
    {
      era: "DIGITAL WEALTH",
      time: "The Future",
      summary: "Invisible digital signals and code moving across the galaxy.",
      icon: "⚡",
      color: "#00ffff"
    }
  ]
};