#!/usr/bin/env python3
"""
Automated Make.com setup for multi-platform social media posting.
Uses browser-use library to log in, create data store, import scenario, and configure modules.
"""

import asyncio
import json
import os
from pathlib import Path

# Use top-level imports from browser_use (lazy loading)
from browser_use import Agent, Browser, BrowserProfile, Controller

# Configuration
MAKE_EMAIL = "foodfactscanner@gmail.com"
MAKE_PASSWORD = "Rocks0522#@!"
SCENARIO_JSON_PATH = "/home/jpgreen1/.openclaw/workspace/foodfact/multi-platform-scenario.json"
DATA_STORE_NAME = "PostedArticles"

# Set browser-use API key (user provided)
os.environ["BROWSER_USE_API_KEY"] = "bu_1jIxeurRi2Qgao-uFNrZkKgjkt-_sfkWJmKH_EBRqTw"

async def main():
    # Initialize browser with profile
    browser_profile = BrowserProfile(headless=False, keep_alive=True)
    browser = Browser(browser_profile=browser_profile)

    # Create agent with controller
    controller = Controller()
    agent = Agent(
        task=f"""
        Complete the Make.com automation setup for FoodFactScanner social media posting.

        Step-by-step, perform these actions in order:

        1. Go to https://make.com/login
        2. Log in with email: {MAKE_EMAIL} and password: {MAKE_PASSWORD}
        3. Wait for dashboard to load (you should see "Scenarios" or "Dashboard")

        4. Create Data Store:
           - Click "Data stores" in left sidebar
           - Click "Create data store"
           - Name it: {DATA_STORE_NAME}
           - Add a field: guid (type: text)
           - Click "Create"
           - Verify data store appears in list

        5. Import Scenario:
           - Click "Scenarios" in left sidebar
           - Click "Import" button (top right)
           - Upload the file: {SCENARIO_JSON_PATH}
           - Wait for import to complete
           - Click on the imported scenario name to open it (it will be named "Social Media Auto-Poster - All Platforms")

        6. In the scenario builder, configure each module as follows:

           a) Google Sheets module ("Get Image Mapping"):
              - Click the module
              - Connection: Select your Google Sheets connection (or create new if missing)
              - Spreadsheet: Enter your published CSV URL (user will provide later - for now leave placeholder)
              - Operation: Search rows
              - Condition: article_slug equals {{router_new_items.item.link}}
              - Click "Save"

           b) Pinterest module ("Create Pinterest Pin"):
              - Connection: Select your Pinterest connection (or create if missing)
              - Board ID: Leave as {{get_board_id_from_name(router_pinterest_board.name)}}
              - Title: {{transform_setup.pinterest_title}}
              - Description: {{transform_setup.pinterest_desc}}
              - Link: {{transform_setup.article_url}}
              - Publish: Immediately
              - Click "Save"

           c) Twitter module ("Create Tweet"):
              - Connection: Select your Twitter connection
              - Text: {{transform_setup.twitter_text_short if length(transform_setup.twitter_text_short) <= 280 else transform_setup.twitter_text_short | slice: 0, 277}}...
              - Media: {{google_sheets_lookup.rows[0].twitter_image}}
              - Click "Save"

           d) Facebook module ("Create Facebook Post"):
              - Connection: Select your Facebook/IG connection
              - Page ID: (leave blank or enter your Page ID if you know it)
              - Message: {{transform_setup.facebook_message}}
              - Link: {{transform_setup.article_url}}
              - Picture: {{google_sheets_lookup.rows[0].facebook_image}}
              - Click "Save"

           e) TikTok module ("Create TikTok Video"):
              - Connection: Select your TikTok connection
              - Video URL: {{google_sheets_lookup.rows[0].tiktok_video}}
              - Description: {{transform_setup.tiktok_desc}}
              - Privacy: Public
              - Click "Save"

           f) Data Store module ("Mark Article as Posted"):
              - Data store: {DATA_STORE_NAME}
              - Operation: Add record
              - Record: guid = {{transform_setup.article_guid}}, posted_at = {{now}}, title = {{transform_setup.article_title}}
              - Click "Save"

        7. Click "Run once" (top right) to test the scenario.
        8. Observe execution - all modules should turn green with checkmarks.
        9. If any module shows red error, note the error and continue.
        10. After successful test, click "Turn on scenario" to enable hourly execution.

        IMPORTANT:
        - If any connection is missing, you will be prompted to create it. Create the connection with the recommended name.
        - For OAuth connections (Pinterest, Twitter, Facebook, TikTok, Google Sheets), you may need to log in to those services in popup windows. Complete the OAuth flow if prompted.
        - The Google Sheets module needs a CSV URL. If you don't have it yet, save the module with a placeholder URL and note that it needs to be updated.
        - Do NOT modify any variable mappings - they are already correct in the imported scenario.
        - Verify that the Data Store {DATA_STORE_NAME} exists and is selected.

        Report back:
        - Whether login succeeded
        - Whether data store was created
        - Whether scenario was imported
        - Whether test run completed successfully or had errors
        - Screenshots of key steps if possible (optional)
        """,
        browser=browser,
        controller=controller
    )

    result = await agent.run(max_steps=50)
    print("Agent completed. Result:", result.done())

    # Keep browser open for user to verify
    print("Browser will remain open. Close manually when done.")

if __name__ == "__main__":
    asyncio.run(main())
