#!/usr/bin/env python3
"""
Capture all MoneyBot student platform screens
"""

import asyncio
from playwright.async_api import async_playwright
import os

# All screens to capture
SCREENS = {
    "07_Shop_Characters": "https://getmoneybot.com/#/student/shop",
    "08_Shop_Accessories": "https://getmoneybot.com/#/student/shop",
    "09_Shop_Inventory": "https://getmoneybot.com/#/student/shop",
    "10_ToDo": "https://getmoneybot.com/#/dashboard/student",
    "11_Classes": "https://getmoneybot.com/#/student/missions",
    "12_Leaderboard": "https://getmoneybot.com/#/student/leaderboard",
    "13_Quests": "https://getmoneybot.com/#/student/quests",
    "14_Simulators": "https://getmoneybot.com/#/student/simulators",
    "15_Journal": "https://getmoneybot.com/#/student/journal",
    "16_Tutor": "https://getmoneybot.com/#/student/tutor",
    "17_Profile": "https://getmoneybot.com/#/student/profile",
}

OUTPUT_DIR = os.path.expanduser("~/MoneyBot_Screenshots")

async def capture_screens():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()
        
        # Shop Characters
        print("Capturing: 07_Shop_Characters")
        await page.goto("https://getmoneybot.com/#/student/shop", wait_until="networkidle")
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "07_Shop_Characters.png"), full_page=True)
        print("  ✓ Saved")
        
        # Shop Accessories - click tab
        print("Capturing: 08_Shop_Accessories")
        await page.click('button:has-text("Accessories")')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "08_Shop_Accessories.png"), full_page=True)
        print("  ✓ Saved")
        
        # Shop Inventory - click tab
        print("Capturing: 09_Shop_Inventory")
        await page.click('button:has-text("My Inventory")')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "09_Shop_Inventory.png"), full_page=True)
        print("  ✓ Saved")
        
        # To-Do
        print("Capturing: 10_ToDo")
        await page.goto("https://getmoneybot.com/#/dashboard/student", wait_until="networkidle")
        await asyncio.sleep(2)
        await page.click('button:has-text("To-Do")')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "10_ToDo.png"), full_page=True)
        print("  ✓ Saved")
        
        # Classes
        print("Capturing: 11_Classes")
        await page.goto("https://getmoneybot.com/#/student/missions", wait_until="networkidle")
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "11_Classes.png"), full_page=True)
        print("  ✓ Saved")
        
        # Leaderboard
        print("Capturing: 12_Leaderboard")
        await page.goto("https://getmoneybot.com/#/student/leaderboard", wait_until="networkidle")
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "12_Leaderboard.png"), full_page=True)
        print("  ✓ Saved")
        
        # Quests
        print("Capturing: 13_Quests")
        await page.goto("https://getmoneybot.com/#/student/quests", wait_until="networkidle")
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "13_Quests.png"), full_page=True)
        print("  ✓ Saved")
        
        # Simulators
        print("Capturing: 14_Simulators")
        await page.goto("https://getmoneybot.com/#/student/simulators", wait_until="networkidle")
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "14_Simulators.png"), full_page=True)
        print("  ✓ Saved")
        
        # Journal
        print("Capturing: 15_Journal")
        await page.goto("https://getmoneybot.com/#/student/journal", wait_until="networkidle")
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "15_Journal.png"), full_page=True)
        print("  ✓ Saved")
        
        # Tutor
        print("Capturing: 16_Tutor")
        await page.goto("https://getmoneybot.com/#/student/tutor", wait_until="networkidle")
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "16_Tutor.png"), full_page=True)
        print("  ✓ Saved")
        
        # Profile
        print("Capturing: 17_Profile")
        await page.goto("https://getmoneybot.com/#/student/profile", wait_until="networkidle")
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "17_Profile.png"), full_page=True)
        print("  ✓ Saved")
        
        await browser.close()
    
    print(f"\nAll screenshots saved to: {OUTPUT_DIR}")

if __name__ == "__main__":
    asyncio.run(capture_screens())
