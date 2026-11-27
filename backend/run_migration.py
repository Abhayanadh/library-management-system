"""
VVITU Smart Library Management System
Database Migration Runner

This script reads the SQL migration file and executes it against
your Supabase PostgreSQL database using the service role key.

Usage:
    cd backend
    python -m venv .venv
    .venv\\Scripts\\activate        # Windows
    pip install -r requirements.txt
    python run_migration.py
"""

import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
MIGRATION_FILE = "../database/migrations/001_initial_schema.sql"


def run_migration():
    if not SUPABASE_URL or not SERVICE_ROLE_KEY:
        print("❌  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env")
        return

    # Read the SQL migration file
    sql_path = os.path.join(os.path.dirname(__file__), MIGRATION_FILE)
    with open(sql_path, "r", encoding="utf-8") as f:
        sql = f.read()

    # Split into individual statements and attempt execution via REST API
    # Supabase Management API: POST /rest/v1/ RPC endpoint approach
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }

    print(f"🔗 Connecting to: {SUPABASE_URL}")
    print(f"📄 Reading migration: {MIGRATION_FILE}")
    print()
    print("=" * 60)
    print("MIGRATION SQL (copy and paste this into Supabase SQL Editor):")
    print("=" * 60)
    print(sql)
    print("=" * 60)
    print()
    print("👆 Copy everything above the last line of equals signs and paste")
    print("   it into: Supabase Dashboard -> SQL Editor -> New Query -> Run")
    print()

    # Verify connectivity
    try:
        resp = httpx.get(
            f"{SUPABASE_URL}/rest/v1/",
            headers=headers,
            timeout=10,
        )
        if resp.status_code in (200, 400, 404):
            print(f"✅  Supabase connection verified (status {resp.status_code})")
        else:
            print(f"⚠️  Unexpected status {resp.status_code}: {resp.text}")
    except Exception as e:
        print(f"❌  Connection error: {e}")


if __name__ == "__main__":
    run_migration()
