"""
seed.py — Run once to add themes + songs tables to sahir.db
Usage: python seed.py
"""
import sqlite3, os, re

DB = os.path.join(os.path.dirname(__file__), "sahir.db")
conn = sqlite3.connect(DB)
c = conn.cursor()

# ── Tables ────────────────────────────────────────────────────────────────────
c.executescript("""
CREATE TABLE IF NOT EXISTS themes (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT    NOT NULL UNIQUE,
    name TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS poem_themes (
    poem_id  INTEGER NOT NULL REFERENCES poems(id),
    theme_id INTEGER NOT NULL REFERENCES themes(id),
    PRIMARY KEY (poem_id, theme_id)
);

CREATE TABLE IF NOT EXISTS songs (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    slug              TEXT UNIQUE,
    title             TEXT NOT NULL,
    film              TEXT,
    year              INTEGER,
    singer            TEXT,
    music_director    TEXT,
    youtube_url       TEXT DEFAULT '',
    youtube_music_url TEXT DEFAULT '',
    thumbnail_url     TEXT DEFAULT '',
    mood              TEXT DEFAULT 'mohabbat',
    description       TEXT DEFAULT ''
);
""")

# ── Themes ────────────────────────────────────────────────────────────────────
themes = [
    ("mohabbat",  "मोहब्बत"),
    ("tanhai",    "तन्हाई"),
    ("judai",     "जुदाई"),
    ("dard",      "दर्द"),
    ("zindagi",   "ज़िंदगी"),
    ("bagawat",   "बग़ावत"),
    ("yaad",      "याद"),
    ("sukoon",    "सुकून"),
    ("insaniyat", "इंसानियत"),
    ("jung",      "जंग"),
]
for slug, name in themes:
    c.execute("INSERT OR IGNORE INTO themes (slug, name) VALUES (?,?)", (slug, name))

# ── Map existing poem types → themes ──────────────────────────────────────────
type_map = {
    "इश्क़":      ["mohabbat", "tanhai"],
    "mohabbat":   ["mohabbat"],
    "उदासी":      ["tanhai", "dard"],
    "tanhai":     ["tanhai"],
    "दर्द":       ["dard"],
    "ज़ख़्म":      ["dard"],
    "विसाल":      ["mohabbat", "judai"],
    "judai":      ["judai"],
    "इंक़िलाब":   ["bagawat"],
    "bagawat":    ["bagawat"],
    "ज़िंदगी":     ["zindagi"],
    "zindagi":    ["zindagi"],
    "yaad":       ["yaad"],
    "याद":        ["yaad"],
    "jung":       ["jung"],
    "जंग":        ["jung"],
    "अम्न":       ["jung", "insaniyat"],
    "इंसान":      ["insaniyat"],
    "दुनिया":     ["zindagi"],
    "shayari":    ["tanhai", "zindagi"],  # general fallback
    "ताज-महल":    ["bagawat", "insaniyat"],
    "मुफ़्लिसी":   ["insaniyat", "bagawat"],
    "इबलीस":      ["bagawat"],
    "उम्मीद":     ["sukoon"],
    "लव":         ["mohabbat"],
    "बहार":       ["yaad"],
    "घटा":        ["tanhai"],
    "मंज़िल":     ["zindagi"],
    "निगाह":      ["mohabbat"],
    "आँसू":       ["dard"],
    "मुलाक़ात":   ["yaad"],
    "नया साल":    ["zindagi"],
    "इबादत":      ["sukoon"],
}

poems = c.execute("SELECT id, type FROM poems").fetchall()
for poem_id, ptype in poems:
    slugs = type_map.get(ptype, ["tanhai"])
    for slug in slugs:
        row = c.execute("SELECT id FROM themes WHERE slug=?", (slug,)).fetchone()
        if row:
            c.execute("INSERT OR IGNORE INTO poem_themes VALUES (?,?)", (poem_id, row[0]))

# ── Songs (verified Sahir filmography) ────────────────────────────────────────
def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

songs = [
    {
        "title": "Kabhie Kabhie Mere Dil Mein",
        "film": "Kabhie Kabhie",
        "year": 1976,
        "singer": "Mukesh, Lata Mangeshkar",
        "music_director": "Khayyam",
        "mood": "mohabbat",
        "description": "A timeless meditation on love and the poetry of memory",
    },
    {
        "title": "Main Pal Do Pal Ka Shayar Hoon",
        "film": "Kabhie Kabhie",
        "year": 1976,
        "singer": "Mukesh",
        "music_director": "Khayyam",
        "mood": "zindagi",
        "description": "Sahir's most personal reflection on the fleeting nature of a poet's existence",
    },
    {
        "title": "Yeh Duniya Agar Mil Bhi Jaaye To Kya Hai",
        "film": "Pyaasa",
        "year": 1957,
        "singer": "Mohammad Rafi",
        "music_director": "S.D. Burman",
        "mood": "bagawat",
        "description": "A cry of rebellion against a world that ignores its dreamers",
    },
    {
        "title": "Jinhe Naaz Hai Hind Par Woh Kahan Hain",
        "film": "Pyaasa",
        "year": 1957,
        "singer": "Hemant Kumar",
        "music_director": "S.D. Burman",
        "mood": "bagawat",
        "description": "Sahir's indictment of a society that abandons its own people",
    },
    {
        "title": "Woh Subah Kabhi To Aayegi",
        "film": "Phir Subah Hogi",
        "year": 1958,
        "singer": "Mukesh, Asha Bhosle",
        "music_director": "Khayyam",
        "mood": "sukoon",
        "description": "A hopeful declaration — that despite darkness, dawn will come",
    },
    {
        "title": "Chalo Ik Baar Phir Se",
        "film": "Gumraah",
        "year": 1963,
        "singer": "Mahendra Kapoor",
        "music_director": "Ravi",
        "mood": "judai",
        "description": "A plea to return to the innocence of love before it was lost",
    },
    {
        "title": "Abhi Na Jao Chhod Kar",
        "film": "Hum Dono",
        "year": 1961,
        "singer": "Mohammad Rafi, Asha Bhosle",
        "music_director": "Jaidev",
        "mood": "mohabbat",
        "description": "One of Hindi cinema's most tender expressions of love's longing",
    },
    {
        "title": "Allah Tero Naam",
        "film": "Hum Dono",
        "year": 1961,
        "singer": "Lata Mangeshkar",
        "music_director": "Jaidev",
        "mood": "sukoon",
        "description": "A devotional song of quiet surrender and spiritual peace",
    },
    {
        "title": "Tujhe Apna Banane Ki Kasam",
        "film": "Sadhnaa",
        "year": 1958,
        "singer": "Rafi, Asha",
        "music_director": "N. Dutta",
        "mood": "mohabbat",
        "description": "A romantic promise that time cannot erase",
    },
    {
        "title": "Aurat Ne Janam Diya Mardon Ko",
        "film": "Sadhna",
        "year": 1958,
        "singer": "Asha Bhosle",
        "music_director": "N. Dutta",
        "mood": "bagawat",
        "description": "Sahir's fierce statement on the dignity and suffering of women in society",
    },
]

for s in songs:
    sl = slugify(s["title"])
    c.execute("""
        INSERT OR IGNORE INTO songs
          (slug, title, film, year, singer, music_director, mood, description)
        VALUES (?,?,?,?,?,?,?,?)
    """, (sl, s["title"], s["film"], s["year"], s["singer"],
          s["music_director"], s["mood"], s["description"]))

conn.commit()
conn.close()
print(f"[✓] Seeded {len(themes)} themes, mapped poem themes, seeded {len(songs)} songs.")
print("[i] Add YouTube URLs directly in sahir.db → songs table (youtube_url / youtube_music_url columns).")
