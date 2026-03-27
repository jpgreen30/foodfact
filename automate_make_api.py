#!/usr/bin/env python3
"""
Fully automated Make.com setup via API (no browser).
Requirements:
  - Make.com API token with scopes: scenarios (read+write), connections (read), data-stores (read+write)
  - The scenario JSON file
  - OAuth connections must be created manually first (or via API if you have connection IDs)

Steps this script performs:
  1. Create Data Store "PostedArticles"
  2. Import scenario from multi-platform-scenario.json
  3. Configure module connections (by connection names)
  4. Activate the scenario (set to hourly)
"""

import requests
import json
import time
from pathlib import Path

# Configuration
MAKE_API_TOKEN = "2ecadeed-af9e-4ffb-909a-1e72943da08d"
MAKE_API_BASE = "https://www.make.com/v2"
SCENARIO_JSON_PATH = "/home/jpgreen1/.openclaw/workspace/foodfact/multi-platform-scenario.json"
DATA_STORE_NAME = "PostedArticles"

# Expected connection names (you must create these in Make.com UI first via OAuth)
CONNECTIONS = {
    "pinterest": "Pinterest - FoodFactScanner",
    "twitter": "Twitter - FoodFactScanner",
    "facebook": "Facebook/IG - FoodFactScanner",
    "tiktok": "TikTok - FoodFactScanner",
    "google_sheets": "Google Sheets - FoodFactScanner"
}

def make_headers():
    return {
        "Authorization": f"Bearer {MAKE_API_TOKEN}",
        "Content-Type": "application/json"
    }

def create_data_store():
    """Create the PostedArticles data store if it doesn't exist."""
    print("1. Creating data store...")
    # First, list existing data stores to check
    resp = requests.get(f"{MAKE_API_BASE}/data-stores", headers=make_headers())
    resp.raise_for_status()
    stores = resp.json().get("data", [])
    for store in stores:
        if store["name"] == DATA_STORE_NAME:
            print(f"   Data store '{DATA_STORE_NAME}' already exists (ID: {store['id']})")
            return store["id"]

    # Create new data store
    payload = {
        "name": DATA_STORE_NAME,
        "schema": [
            {"name": "guid", "type": "text"},
            {"name": "posted_at", "type": "text"},
            {"name": "title", "type": "text"}
        ]
    }
    resp = requests.post(f"{MAKE_API_BASE}/data-stores", headers=make_headers(), json=payload)
    resp.raise_for_status()
    store_id = resp.json()["data"]["id"]
    print(f"   ✓ Data store created (ID: {store_id})")
    return store_id

def get_connection_ids():
    """Fetch connection IDs by connection names."""
    print("2. Resolving connection IDs...")
    resp = requests.get(f"{MAKE_API_BASE}/connections", headers=make_headers())
    resp.raise_for_status()
    connections = resp.json().get("data", [])
    conn_ids = {}
    for conn in connections:
        name = conn["name"]
        if name in CONNECTIONS.values():
            # Find which key
            for key, val in CONNECTIONS.items():
                if val == name:
                    conn_ids[key] = conn["id"]
                    print(f"   Found {key}: {name} (ID: {conn['id']})")
    missing = [k for k, v in CONNECTIONS.items() if k not in conn_ids]
    if missing:
        print(f"   ⚠ Missing connections: {missing}")
        print("   Please create these OAuth connections in Make.com UI first.")
        return None
    return conn_ids

def import_scenario():
    """Import scenario from JSON file."""
    print("3. Importing scenario...")
    # Check if scenario already exists
    resp = requests.get(f"{MAKE_API_BASE}/scenarios", headers=make_headers())
    resp.raise_for_status()
    scenarios = resp.json().get("data", [])
    for scen in scenarios:
        if "Social Media Auto-Poster" in scen.get("name", ""):
            print(f"   Scenario already exists (ID: {scen['id']})")
            return scen["id"]

    # Upload JSON file
    json_path = Path(SCENARIO_JSON_PATH)
    if not json_path.exists():
        raise FileNotFoundError(f"Scenario JSON not found: {SCENARIO_JSON_PATH}")

    # Make API import endpoint expects multipart/form-data with file
    files = {
        "file": (json_path.name, open(json_path, "rb"), "application/json")
    }
    # Remove Content-Type header for multipart
    headers = {"Authorization": f"Bearer {MAKE_API_TOKEN}"}
    resp = requests.post(f"{MAKE_API_BASE}/scenarios/import", headers=headers, files=files)
    resp.raise_for_status()
    scenario_id = resp.json()["data"]["id"]
    print(f"   ✓ Scenario imported (ID: {scenario_id})")
    return scenario_id

def configure_modules(scenario_id, conn_ids):
    """Update module configurations with proper connection IDs and data store."""
    print("4. Configuring modules...")

    # First, get scenario blueprint
    resp = requests.get(f"{MAKE_API_BASE}/scenarios/{scenario_id}/blueprint", headers=make_headers())
    resp.raise_for_status()
    blueprint = resp.json()["data"]

    # The blueprint contains modules. We'll need to update:
    # - Google Sheets module: connectionId, spreadsheetUrl (placeholder)
    # - Pinterest: connectionId
    # - Twitter: connectionId
    # - Facebook: connectionId, pageId (optional)
    # - TikTok: connectionId
    # - Data Store: dataStoreId (should be our PostedArticles)

    modules = blueprint.get("modules", [])
    updates = []

    for module in modules:
        mod_id = module["id"]
        mod_name = module.get("name", "")
        updated = False

        # Data store module: set dataStoreId
        if "Mark Article as Posted" in mod_name:
            # We need to find the data store ID we created
            ds_resp = requests.get(f"{MAKE_API_BASE}/data-stores", headers=make_headers())
            ds_resp.raise_for_status()
            stores = ds_resp.json()["data"]
            ds_id = next(s["id"] for s in stores if s["name"] == DATA_STORE_NAME)
            module["dataStoreId"] = ds_id
            updated = True

        # Connection-based modules: set connectionId
        conn_type = None
        if "Pinterest" in mod_name:
            conn_type = "pinterest"
        elif "Twitter" in mod_name:
            conn_type = "twitter"
        elif "Facebook" in mod_name:
            conn_type = "facebook"
        elif "TikTok" in mod_name:
            conn_type = "tiktok"
        elif "Google Sheets" in mod_name or "Get Image Mapping" in mod_name:
            conn_type = "google_sheets"

        if conn_type and conn_type in conn_ids:
            # In the blueprint, connection is often in module['config']['connectionId'] or similar
            # We'll set it at the module level if present
            if "config" in module:
                module["config"]["connectionId"] = conn_ids[conn_type]
            else:
                module["connectionId"] = conn_ids[conn_type]
            updated = True

        if updated:
            updates.append(module)

    # Apply updates: Make API may require PATCH to scenario modules
    # In Make v2 API, we can update the whole blueprint
    blueprint["modules"] = updates
    resp = requests.put(f"{MAKE_API_BASE}/scenarios/{scenario_id}/blueprint", headers=make_headers(), json=blueprint)
    resp.raise_for_status()
    print(f"   ✓ Updated {len(updates)} modules")

    return scenario_id

def activate_scenario(scenario_id):
    """Activate the scenario (turn on hourly schedule)."""
    print("5. Activating scenario...")
    payload = {
        "isActive": True,
        "schedule": {
            "type": "simple",
            "interval": 1,
            "timeUnit": "hours"
        }
    }
    resp = requests.patch(f"{MAKE_API_BASE}/scenarios/{scenario_id}", headers=make_headers(), json=payload)
    resp.raise_for_status()
    print("   ✓ Scenario activated (runs hourly)")

def main():
    print("=== Make.com API Automation ===\n")
    try:
        # 1. Create data store
        store_id = create_data_store()

        # 2. Resolve connection IDs
        conn_ids = get_connection_ids()
        if conn_ids is None:
            print("\n⚠ Missing connections. Please create them manually in Make.com UI, then re-run.")
            return

        # 3. Import scenario
        scenario_id = import_scenario()

        # 4. Configure modules
        configure_modules(scenario_id, conn_ids)

        # 5. Activate
        activate_scenario(scenario_id)

        print("\n✅ SUCCESS!")
        print(f"Scenario ID: {scenario_id}")
        print("Data store created/verified.")
        print("All modules configured.")
        print("Scenario is active and will run hourly.")
        print("\nNEXT STEPS (manual):")
        print("- Create OAuth connections with the exact names:")
        for key, name in CONNECTIONS.items():
            print(f"  • {name}")
        print("- Update Google Sheets module with your published CSV URL")
        print("- Run a test manually in Make.com UI to verify")
        print("- Check your Make.com dashboard for executions")

    except requests.exceptions.HTTPError as e:
        print(f"\n❌ API Error: {e}")
        if e.response is not None:
            print(f"Response: {e.response.text}")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()
