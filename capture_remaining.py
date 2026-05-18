#!/usr/bin/env python3
"""
Capture remaining MoneyBot screens
"""

import asyncio
from playwright.async_api import async_playwright
import os

OUTPUT_DIR = os.path.expanduser("~/MoneyBot_Screenshots")

async def capture():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()
        
        # Shop Accessories
        print("Capturing: 08_Shop_Accessories")
        await page.goto("https://getmoneybot.com/#/student/shop", wait_until="networkidle")
        await asyncio.sleep(3)
        # Try to find Accessories tab by text
        try:
            await page.get_by_role("button", name="Accessories").click()
        except:
            pass
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "08_Shop_Accessories.png"), full_page=True)
        print("  ✓ Saved")
        
        # Shop Inventory
        print("Capturing: 09_Shop_Inventory")
        try:
            await page.get_by_role("button", name="My Inventory").click()
        except:
            pass
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "09_Shop_Inventory.png"), full_page=True)
        print("  ✓ Saved")
        
        # Classes
        print("Capturing: 10_Classes")
        await page.goto("https://getmoneybot.com/#/student/missions", wait_until="networkidle")
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "10_Classes.png"), full_page=True)
        print("  ✓ Saved")
        
        # Leaderboard
        print("Capturing: 11_Leaderboard")
        await page.goto("https://getmoneybot.com/#/student/leaderboard", wait_until="networkidle")
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "11_Leaderboard.png"), full_page=True)
        print("  ✓ Saved")
        
        # Quests
        print("Capturing: 12_Quests")
        await page.goto("https://getmoneybot.com/#/student/quests", wait_until="networkidle")
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "12_Quests.png"), full_page=True)
        print("  ✓ Saved")
        
        # Simulators
        print("Capturing: 13_Simulators")
        await page.goto("https://getmoneybot.com/#/student/simulators", wait_until="networkidle")
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "13_Simulators.png"), full_page=True)
        print("  ✓ Saved")
        
        # Journal
        print("Capturing: 14_Journal")
        await page.goto("https://getmoneybot.com/#/student/journal", wait_until="networkidle")
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "14_Journal.png"), full_page=True)
        print("  ✓ Saved")
        
        # Tutor
        print("Capturing: 15_Tutor")
        await page.goto("https://getmoneybot.com/#/student/tutor", wait_until="networkidle")
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "15_Tutor.png"), full_page=True)
        print("  ✓ Saved")
        
        # Profile
        print("Capturing: 16_Profile")
        await page.goto("https://getmoneybot.com/#/student/profile", wait_until="networkidle")
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "16_Profile.png"), full_page=True)
        print("  ✓ Saved")
        
        await browser.close()
    
    print(f"\nAll remaining screenshots saved to: {OUTPUT_DIR}")

if __name__ == "__main__":
    asyncio.run(capture())
