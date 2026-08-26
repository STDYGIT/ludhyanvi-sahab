"""
extract_audio.py

Extract/download audio from a YouTube video OR playlist link and save it as
audio file(s) (mp3 by default), with metadata (title/artist/duration/etc.)
embedded in each file and written out as JSON for easy DB import.

Requirements:
    pip3 install -U yt-dlp

You also need ffmpeg installed on your system:
    - Windows: https://ffmpeg.org/download.html  (add to PATH)
    - macOS:   brew install ffmpeg
    - Linux:   sudo apt install ffmpeg

Usage:
    # Single video
    python3 extract_audio.py "https://www.youtube.com/watch?v=XXXXXXXXXXX"

    # Full playlist -- just paste the playlist link, every song gets downloaded
    python3 extract_audio.py "https://www.youtube.com/playlist?list=XXXXXXXXXXX"

    # Only specific items from a playlist (1-indexed, e.g. first 5 + item 10)
    python3 extract_audio.py "<playlist_url>" -p "1-5,10"

    # Or import and use in your own DB import script:
    from extract_audio import download_from_youtube
    songs = download_from_youtube("https://www.youtube.com/playlist?list=XXXXXXXXXXX")
    # songs is a list of dicts, one per track -- loop it straight into your DB.
"""

import argparse
import json
import os
import sys
from typing import Any, Dict, List, Optional

try:
    from yt_dlp import YoutubeDL
except ImportError:
    print("yt-dlp is not installed. Run: pip3 install -U yt-dlp")
    sys.exit(1)


# Workaround for YouTube 403 errors: the "web" client's stream URLs are
# frequently blocked/throttled. Falling back through android/ios/tv clients
# generally works around it.
_EXTRACTOR_ARGS = {"youtube": {"player_client": ["android", "ios", "tv", "web"]}}


def _is_playlist(url: str) -> bool:
    """Quick, no-download probe to check whether a URL is a playlist."""
    probe_opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": True,
        "skip_download": True,
        "extractor_args": _EXTRACTOR_ARGS,
    }
    with YoutubeDL(probe_opts) as probe:
        info = probe.extract_info(url, download=False)
    return bool(info) and (info.get("_type") == "playlist" or "entries" in info)


def download_from_youtube(
    url: str,
    output_dir: str = "audio_downloads",
    fmt: str = "mp3",
    quality: str = "192",
    save_metadata_json: bool = True,
    playlist_items: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Download audio for a single YouTube video OR an entire playlist.

    Args:
        url: YouTube video or playlist URL.
        output_dir: Folder to save audio files into (created if missing).
        fmt: Output audio format, e.g. "mp3", "wav", "m4a".
        quality: Audio bitrate in kbps (lossy formats like mp3).
        save_metadata_json: If True, writes per-track JSON files plus one
            combined "playlist_metadata.json" (handy for bulk DB import).
        playlist_items: Optional yt-dlp playlist-items selector, e.g.
            "1,3,5-10" to only grab specific tracks from a playlist.

    Returns:
        A list of metadata dicts (one per track). A single video URL still
        returns a list, just with one item in it.
    """
    os.makedirs(output_dir, exist_ok=True)

    is_playlist = _is_playlist(url)

    # For playlists, prefix a zero-padded track number so files sort in
    # playlist order and same-titled remixes/versions don't collide.
    if is_playlist:
        outtmpl = os.path.join(output_dir, "%(playlist_index)03d - %(title)s.%(ext)s")
    else:
        outtmpl = os.path.join(output_dir, "%(title)s.%(ext)s")

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": outtmpl,
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": fmt,
                "preferredquality": quality,
            },
            # Embeds title/artist/etc. as ID3/format tags directly into the audio file
            {"key": "FFmpegMetadata"},
        ],
        "quiet": False,
        "no_warnings": True,
        "extractor_args": _EXTRACTOR_ARGS,
        "retries": 10,
        "fragment_retries": 10,
        # Don't let one broken/unavailable video kill the whole playlist run
        "ignoreerrors": True,
    }
    if playlist_items:
        ydl_opts["playlist_items"] = playlist_items

    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)

    if info is None:
        print("Nothing was downloaded.")
        return []

    entries = info["entries"] if is_playlist and "entries" in info else [info]

    results: List[Dict[str, Any]] = []
    for entry in entries:
        if entry is None:
            # A video in the playlist was unavailable/private/deleted -- skipped.
            continue

        base, _ = os.path.splitext(ydl.prepare_filename(entry))
        final_path = f"{base}.{fmt}"

        metadata = {
            "title": entry.get("title"),
            "artist": entry.get("artist") or entry.get("uploader"),
            "album": entry.get("album"),
            "duration_seconds": entry.get("duration"),
            "upload_date": entry.get("upload_date"),  # YYYYMMDD
            "youtube_id": entry.get("id"),
            "playlist_index": entry.get("playlist_index"),
            "url": f"https://www.youtube.com/watch?v={entry.get('id')}",
            "audio_path": final_path,
        }
        results.append(metadata)

        if save_metadata_json:
            with open(f"{base}.json", "w", encoding="utf-8") as f:
                json.dump(metadata, f, ensure_ascii=False, indent=2)

        print(f"Saved: {final_path}")

    if save_metadata_json and results:
        combined_path = os.path.join(output_dir, "playlist_metadata.json")
        with open(combined_path, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"\nCombined metadata for {len(results)} track(s) saved: {combined_path}")

    print(f"\nDone. {len(results)} track(s) downloaded to '{output_dir}'.")
    return results


def main():
    parser = argparse.ArgumentParser(
        description="Download and extract audio + metadata from a YouTube video or playlist."
    )
    parser.add_argument("url", help="YouTube video URL or playlist URL")
    parser.add_argument("-o", "--output-dir", default="audio_downloads", help="Output folder (default: audio_downloads)")
    parser.add_argument("-f", "--format", default="mp3", help="Audio format: mp3, wav, m4a, etc. (default: mp3)")
    parser.add_argument("-q", "--quality", default="192", help="Audio bitrate in kbps for lossy formats (default: 192)")
    parser.add_argument("-p", "--playlist-items", default=None, help='Only these playlist items, e.g. "1-5,10"')
    parser.add_argument("--no-json", action="store_true", help="Don't write metadata JSON files")
    args = parser.parse_args()

    download_from_youtube(
        args.url,
        args.output_dir,
        args.format,
        args.quality,
        save_metadata_json=not args.no_json,
        playlist_items=args.playlist_items,
    )


if __name__ == "__main__":
    main()