-- init_db.sql — PostgreSQL schema for Sahir Ludhianvi API
-- Run automatically via docker-compose init script

CREATE TABLE IF NOT EXISTS poems (
    id            SERIAL PRIMARY KEY,
    title         VARCHAR(512) NOT NULL,
    content       TEXT NOT NULL,
    type          VARCHAR(128),
    source        VARCHAR(256),
    source_url    VARCHAR(1024),
    content_hash  VARCHAR(64) UNIQUE NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS themes (
    id   SERIAL PRIMARY KEY,
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL
);

CREATE TABLE IF NOT EXISTS poem_themes (
    poem_id  INTEGER NOT NULL REFERENCES poems(id),
    theme_id INTEGER NOT NULL REFERENCES themes(id),
    PRIMARY KEY (poem_id, theme_id)
);

CREATE TABLE IF NOT EXISTS songs (
    id                SERIAL PRIMARY KEY,
    slug              VARCHAR(256) UNIQUE,
    title             VARCHAR(512) NOT NULL,
    film              VARCHAR(256),
    year              INTEGER,
    singer            VARCHAR(256),
    music_director    VARCHAR(256),
    youtube_url       TEXT DEFAULT '',
    youtube_music_url TEXT DEFAULT '',
    thumbnail_url     TEXT DEFAULT '',
    mood              VARCHAR(64) DEFAULT 'mohabbat',
    description       TEXT DEFAULT '',
    audio_url         VARCHAR(512) DEFAULT '',
    youtube_id        VARCHAR(64) DEFAULT '',
    duration_seconds  INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS stanzas (
    id          SERIAL PRIMARY KEY,
    line1       TEXT NOT NULL,
    line2       TEXT NOT NULL,
    source      VARCHAR(256),
    song_title  VARCHAR(512) NOT NULL,
    film        VARCHAR(256) NOT NULL,
    singer      VARCHAR(256) NOT NULL,
    composer    VARCHAR(256),
    audio_clip  VARCHAR(512) NOT NULL,
    tag         VARCHAR(128),
    order_num   INTEGER DEFAULT 0
);
