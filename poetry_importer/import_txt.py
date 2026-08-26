"""
import_txt.py
-------------
Parses a.txt (or any file in the same format) and imports each sher/couplet
into PostgreSQL.

File format expected:
    Line 1 of sher
    Line 2 of sher
    टैग्ज़ : इश्क़ और 4 अन्य      ← optional tag line
                                   ← blank line → next entry

Usage:
    python import_txt.py a.txt
    python import_txt.py a.txt --source "Rekhta shayari"
    python import_txt.py a.txt --type shayari
"""

import os
import re
import sys
import hashlib
import argparse
from pathlib import Path
from datetime import datetime, timezone

from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base, Session
from sqlalchemy.exc import IntegrityError

# ── Env ───────────────────────────────────────────────────────────────────────
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    sys.exit(
        "ERROR: DATABASE_URL not set.\n"
        "Copy .env.example → .env and fill in your PostgreSQL connection string."
    )

# ── Model (mirrors setup_db.py) ───────────────────────────────────────────────
Base = declarative_base()

class Poem(Base):
    __tablename__ = "poems"
    id           = Column(Integer, primary_key=True, autoincrement=True)
    title        = Column(String(512), nullable=False)
    content      = Column(Text, nullable=False)
    type         = Column(String(128), nullable=True)
    source       = Column(String(256), nullable=True)
    source_url   = Column(String(1024), nullable=True)
    content_hash = Column(String(64), unique=True, nullable=False)
    created_at   = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


# ── Helpers ───────────────────────────────────────────────────────────────────
TAG_RE = re.compile(r"^टैग्ज़?\s*[:：]\s*", re.UNICODE)


def is_tag_line(line: str) -> bool:
    return bool(TAG_RE.match(line.strip()))


def parse_tag(line: str) -> str:
    """Extract the first tag from a टैग्ज़ line, e.g. 'इश्क़ और 4 अन्य' → 'इश्क़'"""
    cleaned = TAG_RE.sub("", line.strip())
    # Keep only the first tag (before ' और ')
    first = cleaned.split(" और ")[0].strip()
    return first


def make_title(content: str) -> str:
    """Use the first line (max 80 chars) as the title."""
    first_line = content.splitlines()[0].strip()
    return first_line[:80] + ("…" if len(first_line) > 80 else "")


def make_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def clean(text: str) -> str:
    text = text.strip()
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = "\n".join(l.rstrip() for l in text.splitlines())
    return text


# ── Parser ────────────────────────────────────────────────────────────────────
def parse_txt(path: Path) -> list[dict]:
    """
    Split the file into blocks separated by blank lines.
    Each block = poem lines + optional tag line at the end.
    """
    raw = path.read_text(encoding="utf-8")
    blocks = re.split(r"\n\s*\n", raw.strip())

    entries = []
    for block in blocks:
        lines = [l for l in block.splitlines() if l.strip()]
        if not lines:
            continue

        # Separate tag line (always last, starts with टैग)
        tag = None
        if lines and is_tag_line(lines[-1]):
            tag = parse_tag(lines.pop())

        poem_lines = [l.strip() for l in lines if l.strip()]
        if not poem_lines:
            continue

        content = "\n".join(poem_lines)
        entries.append({
            "content": content,
            "tag": tag,   # first tag extracted, or None
        })

    return entries


# ── Importer ─────────────────────────────────────────────────────────────────
def run(input_path: Path, default_type: str, default_source: str) -> None:
    entries = parse_txt(input_path)
    total      = len(entries)
    imported   = 0
    duplicates = 0
    failed     = 0

    print(f"\nParsed {total} sher(s) from {input_path.name}\n")

    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(engine)  # create table if it doesn't exist

    with Session(engine) as session:
        for entry in entries:
            raw_content = entry["content"]
            tag         = entry["tag"]

            try:
                content = clean(raw_content)
                title   = make_title(content)
                chash   = make_hash(content)

                # Tag wins over default_type if present
                poem_type = tag if tag else (default_type or None)

                poem = Poem(
                    title        = title,
                    content      = content,
                    type         = poem_type,
                    source       = default_source or None,
                    source_url   = None,
                    content_hash = chash,
                )
                session.add(poem)
                session.flush()

                print(f"[+] Imported:   {title}")
                imported += 1

            except IntegrityError:
                session.rollback()
                print(f"[-] Duplicate:  {make_title(raw_content)}")
                duplicates += 1

            except Exception as exc:
                session.rollback()
                print(f"[!] Failed:     {make_title(raw_content)}  →  {exc}")
                failed += 1

        session.commit()

    print(f"""
─────────────────────────────
 Total found:  {total}
 Imported:     {imported}
 Duplicates:   {duplicates}
 Failed:       {failed}
─────────────────────────────""")


# ── CLI ───────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="Import sher/couplets from a plain-text file into PostgreSQL."
    )
    parser.add_argument("file", help="Path to the .txt file (e.g. a.txt)")
    parser.add_argument(
        "--type",
        default="shayari",
        help="Default poem type if no tag found in file (default: shayari)",
    )
    parser.add_argument(
        "--source",
        default="Sahir Ludhianvi — personal collection",
        help="Source label stored in the DB",
    )
    args = parser.parse_args()

    path = Path(args.file)
    if not path.exists():
        sys.exit(f"ERROR: File not found: {path}")

    run(path, args.type, args.source)


if __name__ == "__main__":
    main()
