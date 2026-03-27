#!/usr/bin/env python3
"""
Deploy n8n workflow via REST API.
Usage: python deploy_n8n_workflow.py <N8N_URL> <API_TOKEN>
"""

import requests
import json
import sys
from pathlib import Path

# Configuration
N8N_URL = sys.argv[1] if len(sys.argv) > 1 else "https://5678-dot-data-terminus-376005.uc.r.appspot.com"
API_TOKEN = sys.argv[2] if len(sys.argv) > 2 else "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzk1MjU3NS1iODQzLTRhNDktOTM5MS00ZDA0MDYxYTA1OWUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiYTNiYTMxMzAtMmVhZC00NDc0LTliZGEtMDMxYTk5YjQxNGE2IiwiaWF0IjoxNzc0NjA2MDU3LCJleHAiOjE3NzcxNzYwMDB9.Bso7JCnRBAPGOl0O-joWNUrwnlQ7wLU5iZuMEkdKjrM"
WORKFLOW_PATH = "/home/jpgreen1/.openclaw/workspace/foodfact/n8n-workflow-social-poster.json"

def main():
    print(f"Deploying to n8n at {N8N_URL}...")
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }

    # 1. Load workflow JSON
    workflow_file = Path(WORKFLOW_PATH)
    if not workflow_file.exists():
        print(f"❌ Workflow file not found: {WORKFLOW_PATH}")
        return
    workflow_data = json.loads(workflow_file.read_text())
    print(f"✓ Loaded workflow: {workflow_data.get('name')}")

    # 2. Create workflow via POST /rest/workflows
    resp = requests.post(f"{N8N_URL.rstrip('/')}/rest/workflows", headers=headers, json=workflow_data)
    if resp.status_code >= 400:
        print(f"❌ Failed to create workflow: {resp.status_code}")
        print(resp.text)
        # Maybe it already exists - try to update
        print("Attempting to find existing workflow by name...")
        list_resp = requests.get(f"{N8N_URL}/rest/workflows", headers=headers)
        if list_resp.ok:
            workflows = list_resp.json().get("data", [])
            for wf in workflows:
                if wf.get("name") == workflow_data.get("name"):
                    wf_id = wf["id"]
                    print(f"Found existing workflow ID: {wf_id}")
                    update_resp = requests.put(f"{N8N_URL}/rest/workflows/{wf_id}", headers=headers, json=workflow_data)
                    if update_resp.ok:
                        print("✓ Updated existing workflow")
                        workflow_id = wf_id
                        break
                    else:
                        print(f"❌ Failed to update: {update_resp.text}")
                        return
            else:
                print("No matching workflow found to update.")
                return
        else:
            return
    else:
        workflow_id = resp.json()["data"]["id"]
        print(f"✓ Created workflow ID: {workflow_id}")

    # 3. Activate workflow (turn on)
    activate_url = f"{N8N_URL}/rest/workflows/{workflow_id}/activate"
    resp = requests.post(activate_url, headers=headers)
    if resp.status_code == 200:
        print("✓ Workflow activated successfully")
    else:
        print(f"⚠ Activation returned {resp.status_code}")
        print(resp.text)

    print("\n✅ Workflow deployed!")
    print(f"View it at: {N8N_URL}/workflow/{workflow_id}")
    print("\nNEXT STEPS:")
    print("1. Create credentials in n8n UI for:")
    print("   - Google Sheets OAuth2")
    print("   - Pinterest API")
    print("   - Twitter OAuth1")
    print("   - Facebook Graph API")
    print("   - TikTok API")
    print("   - PostgreSQL (optional for logging)")
    print("   - Brevo API (for email notifications)")
    print("2. Update the Google Sheets node with your published CSV URL")
    print("3. Test with 'Run once' button")
    print("4. The workflow will run hourly automatically")

if __name__ == "__main__":
    main()
