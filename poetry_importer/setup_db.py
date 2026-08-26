"""
setup_db.py
-----------
Creates the `poems` table in PostgreSQL.
Run once before importing any data:

    python setup_db.py
"""

import os
from dotenv import load_dotenv
from sqlalchemy import (
    create_engine, Column, Integer, String, Text, DateTime
)
from sqlalchemy.orm import declarative_base
from datetime import datetime, timezone

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set. Copy .env.example → .env and fill it in.")

Base = declarative_base()


class Poem(Base):
    __tablename__ = "poems"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    title      = Column(String(512), nullable=False)
    content    = Column(Text, nullable=False)
    type       = Column(String(128), nullable=True)   # e.g. nazm, ghazal, qata, shayari
    source     = Column(String(256), nullable=True)   # e.g. "Talkhiyan (1945)"
    source_url = Column(String(1024), nullable=True)
    content_hash = Column(String(64), unique=True, nullable=False)  # SHA-256, prevents duplicates
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Stanza(Base):
    __tablename__ = "stanzas"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    line1       = Column(Text, nullable=False)
    line2       = Column(Text, nullable=False)
    source      = Column(String(256), nullable=True)
    song_title  = Column(String(512), nullable=False)
    film        = Column(String(256), nullable=False)
    singer      = Column(String(256), nullable=False)
    composer    = Column(String(256), nullable=True)
    audio_clip  = Column(String(512), nullable=False)
    tag         = Column(String(128), nullable=True)
    order_num   = Column(Integer, default=0)


class Song(Base):
    __tablename__ = "songs"

    id               = Column(Integer, primary_key=True, autoincrement=True)
    title            = Column(String(512), nullable=False)
    film             = Column(String(256), nullable=True)
    year             = Column(Integer, nullable=True)
    singer           = Column(String(256), nullable=True)
    composer         = Column(String(256), nullable=True)
    audio_url        = Column(String(512), nullable=True)
    youtube_id       = Column(String(64), nullable=True)
    duration_seconds = Column(Integer, nullable=True)


class Theme(Base):
    __tablename__ = "themes"

    id   = Column(Integer, primary_key=True, autoincrement=True)
    slug = Column(String(64), unique=True, nullable=False)
    name = Column(String(128), nullable=False)


class PoemTheme(Base):
    __tablename__ = "poem_themes"

    poem_id  = Column(Integer, primary_key=True)
    theme_id = Column(Integer, primary_key=True)


def create_tables():
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(engine)
    print("[✓] Tables `poems`, `stanzas`, `songs`, `themes`, `poem_themes` are ready.")


if __name__ == "__main__":
    create_tables()

