"""
main.py — Sahir Ludhianvi API
Run locally:  uvicorn main:app --reload --port 8000
Docker:       automatically started by docker-compose
"""
import os, random, uvicorn
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sahir.db")

# SQLite needs check_same_thread=False; PostgreSQL doesn't
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)

# Detect DB dialect for syntax differences
IS_POSTGRES = DATABASE_URL.startswith("postgresql")

# Aggregate function differs between SQLite and PostgreSQL
def agg_concat(col, sep=","):
    if IS_POSTGRES:
        return f"STRING_AGG({col}, '{sep}')"
    return f"GROUP_CONCAT({col})"

app = FastAPI(title="Sahir API", version="1.0")

# CORS — allow Netlify domain + localhost for dev
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",")
ALLOWED_ORIGINS = [o.strip() for o in ALLOWED_ORIGINS if o.strip()]
ALLOWED_ORIGINS += [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def row_to_dict(row):
    return dict(row._mapping)


# ── Poems ─────────────────────────────────────────────────────────────────────

@app.get("/api/poems")
def list_poems(theme: str = Query(None)):
    agg_slug = agg_concat("t.slug")
    agg_name = agg_concat("t.name")
    with engine.connect() as conn:
        if theme:
            rows = conn.execute(text(f"""
                SELECT p.*, {agg_slug} as theme_slugs, {agg_name} as theme_names
                FROM poems p
                JOIN poem_themes pt ON p.id = pt.poem_id
                JOIN themes t ON pt.theme_id = t.id
                WHERE t.slug = :theme OR t.name = :theme
                GROUP BY p.id
                ORDER BY p.id
            """), {"theme": theme}).fetchall()
        else:
            rows = conn.execute(text(f"""
                SELECT p.*, {agg_slug} as theme_slugs, {agg_name} as theme_names
                FROM poems p
                LEFT JOIN poem_themes pt ON p.id = pt.poem_id
                LEFT JOIN themes t ON pt.theme_id = t.id
                GROUP BY p.id
                ORDER BY p.id
            """)).fetchall()
        return [row_to_dict(r) for r in rows]


@app.get("/api/poems/random")
def random_poem(theme: str = Query(None)):
    with engine.connect() as conn:
        if theme:
            rows = conn.execute(text("""
                SELECT p.* FROM poems p
                JOIN poem_themes pt ON p.id = pt.poem_id
                JOIN themes t ON pt.theme_id = t.id
                WHERE t.slug = :theme
            """), {"theme": theme}).fetchall()
        else:
            rows = conn.execute(text("SELECT * FROM poems")).fetchall()

        if not rows:
            rows = conn.execute(text("SELECT * FROM poems")).fetchall()
        if not rows:
            return {"error": "No poems found"}

        row = random.choice(rows)
        return row_to_dict(row)


# ── Songs ─────────────────────────────────────────────────────────────────────

@app.get("/api/songs")
def list_songs():
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT * FROM songs ORDER BY year, id")
        ).fetchall()
        return [row_to_dict(r) for r in rows]


@app.get("/api/songs/random")
def random_song():
    with engine.connect() as conn:
        rows = conn.execute(text("SELECT * FROM songs")).fetchall()
        if not rows:
            return {"error": "No songs found"}
        return row_to_dict(random.choice(rows))


# ── Themes ────────────────────────────────────────────────────────────────────

@app.get("/api/themes")
def list_themes():
    with engine.connect() as conn:
        rows = conn.execute(text("SELECT * FROM themes ORDER BY id")).fetchall()
        return [row_to_dict(r) for r in rows]


@app.get("/api/stanzas")
def list_stanzas():
    with engine.connect() as conn:
        rows = conn.execute(text("SELECT * FROM stanzas ORDER BY order_num, id")).fetchall()
        return [row_to_dict(r) for r in rows]


@app.get("/api/stats")
def get_stats():
    with engine.connect() as conn:
        poem_count = conn.execute(text("SELECT COUNT(*) FROM poems")).scalar() or 0
        song_count = conn.execute(text("SELECT COUNT(*) FROM songs")).scalar() or 0
        theme_count = conn.execute(text("SELECT COUNT(*) FROM themes")).scalar() or 0
        stanza_count = conn.execute(text("SELECT COUNT(*) FROM stanzas")).scalar() or 0
        return {
            "poem_count": poem_count,
            "song_count": song_count,
            "theme_count": theme_count,
            "stanza_count": stanza_count,
            "tribute_years": "1921 — 1980"
        }


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        return {"status": "error", "db": str(e)}


# ── Static files: Audio ──────────────────────────────────────────────────────

# Docker mounts audio to /data/audio; local dev uses ../poetry_importer/audio_downloads
audio_dir = os.getenv("AUDIO_DIR", os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "poetry_importer", "audio_downloads")
))
if os.path.exists(audio_dir):
    app.mount("/audio", StaticFiles(directory=audio_dir), name="audio")

# Mount static frontend build if it exists (for local full-stack dev)
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("audio/"):
            return {"error": "Not found"}
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {"message": "Sahir API — log chale jaate hain, unki awaaz reh jaati hai."}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
