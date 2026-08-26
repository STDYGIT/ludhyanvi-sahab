"""
migrate_sqlite_to_pg.py — Export all data from SQLite sahir.db → PostgreSQL

Usage:
    python migrate_sqlite_to_pg.py

Env vars:
    DATABASE_URL  — PostgreSQL connection string (e.g. postgresql://sahir:sahir@localhost:5432/sahir_db)
    SQLITE_PATH   — Path to source SQLite DB (default: ./sahir.db)
"""
import os, sys, sqlite3
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

SQLITE_PATH = os.getenv("SQLITE_PATH", os.path.join(os.path.dirname(__file__), "sahir.db"))
PG_URL = os.getenv("DATABASE_URL")

if not PG_URL or not PG_URL.startswith("postgresql"):
    print("ERROR: Set DATABASE_URL to a PostgreSQL connection string.")
    print("  Example: DATABASE_URL=postgresql://sahir:sahir@localhost:5432/sahir_db")
    sys.exit(1)

if not os.path.exists(SQLITE_PATH):
    print(f"ERROR: SQLite file not found: {SQLITE_PATH}")
    sys.exit(1)

# Connect to both databases
sqlite_conn = sqlite3.connect(SQLITE_PATH)
sqlite_conn.row_factory = sqlite3.Row
pg_engine = create_engine(PG_URL)

print(f"[i] Source: {SQLITE_PATH}")
print(f"[i] Target: {PG_URL}")
print()


def migrate_table(table_name, columns, has_serial_id=True):
    """Generic migration: read from SQLite, insert into PostgreSQL."""
    cursor = sqlite_conn.execute(f"SELECT * FROM {table_name}")
    rows = [dict(row) for row in cursor.fetchall()]

    if not rows:
        print(f"  [·] {table_name}: 0 rows (skipped)")
        return 0

    # Build INSERT statement
    col_names = columns
    placeholders = ", ".join([f":{c}" for c in col_names])
    col_list = ", ".join(col_names)

    # Use ON CONFLICT DO NOTHING to avoid duplicates on re-run
    if has_serial_id and "id" in col_names:
        insert_sql = f"INSERT INTO {table_name} ({col_list}) VALUES ({placeholders}) ON CONFLICT DO NOTHING"
    else:
        insert_sql = f"INSERT INTO {table_name} ({col_list}) VALUES ({placeholders}) ON CONFLICT DO NOTHING"

    with pg_engine.begin() as conn:
        for row in rows:
            # Filter to only the columns we want
            params = {c: row.get(c) for c in col_names}
            conn.execute(text(insert_sql), params)

    # Reset sequence to max id if table has serial id
    if has_serial_id and "id" in col_names:
        with pg_engine.begin() as conn:
            conn.execute(text(f"SELECT setval(pg_get_serial_sequence('{table_name}', 'id'), COALESCE(MAX(id), 1)) FROM {table_name}"))

    print(f"  [✓] {table_name}: {len(rows)} rows migrated")
    return len(rows)


# ── Run schema creation first ────────────────────────────────────────────────
init_sql_path = os.path.join(os.path.dirname(__file__), "init_db.sql")
if os.path.exists(init_sql_path):
    print("[1] Creating tables from init_db.sql ...")
    with open(init_sql_path) as f:
        schema_sql = f.read()
    with pg_engine.begin() as conn:
        conn.execute(text(schema_sql))
    print("  [✓] Tables created\n")
else:
    print("[!] init_db.sql not found — assuming tables exist\n")


# ── Migrate each table ──────────────────────────────────────────────────────
print("[2] Migrating data ...")

migrate_table("poems", [
    "id", "title", "content", "type", "source", "source_url", "content_hash", "created_at"
])

migrate_table("themes", [
    "id", "slug", "name"
])

migrate_table("poem_themes", [
    "poem_id", "theme_id"
], has_serial_id=False)

# Songs table — handle both old schema (slug-based) and new schema (audio_url)
song_cursor = sqlite_conn.execute("PRAGMA table_info(songs)")
song_cols_raw = [row["name"] for row in song_cursor.fetchall()]
song_cols = [c for c in song_cols_raw if c in [
    "id", "slug", "title", "film", "year", "singer", "music_director",
    "youtube_url", "youtube_music_url", "thumbnail_url", "mood", "description",
    "audio_url", "youtube_id", "duration_seconds"
]]
migrate_table("songs", song_cols)

migrate_table("stanzas", [
    "id", "line1", "line2", "source", "song_title", "film", "singer",
    "composer", "audio_clip", "tag", "order_num"
])

print()
print("[✓] Migration complete!")
print()

# ── Verify ───────────────────────────────────────────────────────────────────
print("[3] Verification:")
with pg_engine.connect() as conn:
    for table in ["poems", "themes", "poem_themes", "songs", "stanzas"]:
        count = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
        print(f"  {table}: {count} rows")

sqlite_conn.close()
print("\n[✓] Done. PostgreSQL is ready.")
