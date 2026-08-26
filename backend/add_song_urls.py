"""
add_song_urls.py
----------------
Interactive script to add YouTube / YouTube Music URLs to each song in sahir.db.

Usage:
    python add_song_urls.py

For each song it will show the title and ask for:
  - YouTube watch URL  (e.g. https://www.youtube.com/watch?v=XXXXXXXXXXX)
  - YouTube Music URL  (e.g. https://music.youtube.com/watch?v=XXXXXXXXXXX)

Press Enter to skip a song.

You can also update a specific song by title:
    python add_song_urls.py --title "Kabhie Kabhie Mere Dil Mein"
"""

import sqlite3, os, sys, argparse

DB = os.path.join(os.path.dirname(__file__), "sahir.db")


def update(conn, song_id, yt_url, ytm_url):
    conn.execute(
        "UPDATE songs SET youtube_url=?, youtube_music_url=? WHERE id=?",
        (yt_url.strip(), ytm_url.strip(), song_id),
    )
    conn.commit()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--title", help="Update only this song (partial match)")
    args = parser.parse_args()

    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row

    if args.title:
        songs = conn.execute(
            "SELECT * FROM songs WHERE title LIKE ?", (f"%{args.title}%",)
        ).fetchall()
    else:
        songs = conn.execute("SELECT * FROM songs ORDER BY year, id").fetchall()

    if not songs:
        print("No songs found.")
        return

    print("\n── Sahir Song URL Updater ──────────────────────────────")
    print("Press Enter to skip. Paste full YouTube URL and press Enter.\n")

    for s in songs:
        print(f"\n[{s['id']}] {s['title']}")
        print(f"     {s['film']} ({s['year']}) · {s['singer']}")
        print(f"     Current YT URL:  {s['youtube_url'] or '(empty)'}")
        print(f"     Current YTM URL: {s['youtube_music_url'] or '(empty)'}")

        yt  = input("  → YouTube URL      : ").strip() or s["youtube_url"] or ""
        ytm = input("  → YouTube Music URL: ").strip() or s["youtube_music_url"] or ""

        update(conn, s["id"], yt, ytm)
        print(f"  ✓ Saved.")

    conn.close()
    print("\n── Done! Restart uvicorn if it is running. ─────────────\n")


if __name__ == "__main__":
    main()
