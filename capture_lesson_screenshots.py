#!/usr/bin/env python3
"""
Capture screenshots of MoneyBot learning platform lesson types
and save them for upload to Google Drive
"""

import asyncio
from playwright.async_api import async_playwright
from datetime import datetime
import os

# Lesson URLs to capture
LESSONS = {
    "01_Dashboard": "https://getmoneybot.com/#/dashboard/student",
    "02_Quiz_Active": "https://getmoneybot.com/#/student/activities/828",
    "03_TrueFalse_Active": "https://getmoneybot.com/#/student/activities/825",
    "04_Matching_Active": "https://getmoneybot.com/#/student/activities/824",
    "05_FillInBlanks_Active": "https://getmoneybot.com/#/student/activities/823",
    "06_Discussion_Results": "https://getmoneybot.com/#/student/activities/827",
}

OUTPUT_DIR = os.path.expanduser("~/MoneyBot_Screenshots")

async def capture_screenshots():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()
        
        for name, url in LESSONS.items():
            print(f"Capturing: {name}")
            try:
                await page.goto(url, wait_until="networkidle")
                await asyncio.sleep(3)  # Wait for page to fully load
                
                # Take full page screenshot
                filepath = os.path.join(OUTPUT_DIR, f"{name}.png")
                await page.screenshot(path=filepath, full_page=True)
                print(f"  ✓ Saved: {filepath}")
            except Exception as e:
                print(f"  ✗ Error: {e}")
        
        await browser.close()
    
    print(f"\nAll screenshots saved to: {OUTPUT_DIR}")

if __name__ == "__main__":
    asyncio.run(capture_screenshots())
