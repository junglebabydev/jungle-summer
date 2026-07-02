#!/usr/bin/env python3
"""
Fetch hero images for things_to_do records with NULL hero_image_url.

For each record:
  1. Fetch the provider_url page and extract the best image URL
  2. Download the image binary
  3. Upload to Supabase Storage bucket
  4. Record the Supabase CDN URL

Outputs:
  update_images.sql  — run in Supabase Studio SQL editor
  seed_with_images.sql — seed.sql with hero_image_url filled in

Usage:
  SUPABASE_URL=https://xxx.supabase.co \
  SUPABASE_SERVICE_KEY=<rotate-and-put-your-own-here> \
  python3 fetch_images.py

  Or set them in .env.local in this directory.
"""

import io
import os
import re
import sys
import time
import mimetypes
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

# ── Config ──────────────────────────────────────────────────────────────────

SEED_PATH = "seed.sql"
OUT_SQL = "update_images.sql"
OUT_SEED = "seed_with_images.sql"
STORAGE_BUCKET = "images"
STORAGE_PATH_PREFIX = "things-to-do"
DELAY = 0.7        # seconds between requests
TIMEOUT = 14       # request timeout seconds
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
}

# Image suffixes / path markers that indicate a real image
IMAGE_EXTS = (".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif")
IMAGE_PATH_MARKERS = ("/media/", "/images/", "/uploads/", "/assets/", "/img/",
                      "/photos/", "/pictures/", "/content/", "getimage", "getImage",
                      "/events/", "/activity", "/exhibition", "/programme")

# Patterns that indicate a URL is NOT an event image
SKIP_PATTERNS = ("logo", "icon", "qr", "lock", "crest", "government_building",
                 "google-play", "apple-store", "app-store", "banner-bottom",
                 "footer", "sprite", "arrow", "button", ".svg")


# ── Supabase helpers ─────────────────────────────────────────────────────────

def supa_headers(key: str) -> dict:
    return {"apikey": key, "Authorization": f"Bearer {key}"}


def ensure_bucket(url: str, key: str) -> bool:
    """Create the storage bucket if it doesn't exist. Returns True on success."""
    r = requests.get(f"{url}/storage/v1/bucket/{STORAGE_BUCKET}",
                     headers=supa_headers(key), timeout=10)
    if r.status_code == 200:
        return True  # already exists
    # Create it as public
    payload = {"id": STORAGE_BUCKET, "name": STORAGE_BUCKET, "public": True}
    r = requests.post(f"{url}/storage/v1/bucket",
                      headers={**supa_headers(key), "Content-Type": "application/json"},
                      json=payload, timeout=10)
    if r.status_code in (200, 201):
        print(f"  Created bucket '{STORAGE_BUCKET}'")
        return True
    print(f"  ERROR creating bucket: {r.status_code} {r.text[:200]}")
    return False


def upload_image(url: str, key: str, path: str, data: bytes, mime: str) -> str | None:
    """Upload bytes to Supabase Storage. Returns public CDN URL or None."""
    endpoint = f"{url}/storage/v1/object/{STORAGE_BUCKET}/{path}"
    r = requests.post(
        endpoint,
        headers={**supa_headers(key), "Content-Type": mime, "x-upsert": "true"},
        data=data,
        timeout=20,
    )
    if r.status_code in (200, 201):
        return f"{url}/storage/v1/object/public/{STORAGE_BUCKET}/{path}"
    print(f"  UPLOAD ERROR {r.status_code}: {r.text[:200]}")
    return None


# ── Image extraction ─────────────────────────────────────────────────────────

def is_image_url(u: str) -> bool:
    low = u.lower()
    if any(skip in low for skip in SKIP_PATTERNS):
        return False
    if any(ext in low for ext in IMAGE_EXTS):
        return True
    if any(marker in u for marker in IMAGE_PATH_MARKERS):
        return True
    return False


def fetch_best_image_url(page_url: str) -> str | None:
    """Fetch page and return the best candidate image URL (absolute)."""
    try:
        r = requests.get(page_url, timeout=TIMEOUT, headers=HEADERS, allow_redirects=True)
        r.raise_for_status()
    except Exception as e:
        print(f"    page fetch error: {e}")
        return None

    soup = BeautifulSoup(r.text, "html.parser")
    base = r.url

    # 1. og:image / og:image:url
    for prop in ("og:image", "og:image:url"):
        tag = soup.find("meta", property=prop)
        if tag:
            content = urljoin(base, tag.get("content", ""))
            if is_image_url(content):
                return content

    # 2. twitter:image variants
    for name in ("twitter:image", "twitter:image:src"):
        tag = soup.find("meta", attrs={"name": name})
        if tag:
            content = urljoin(base, tag.get("content", ""))
            if is_image_url(content):
                return content

    # 3. First img tag that looks like an event image
    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src") or img.get("data-lazy-src") or ""
        if not src:
            continue
        full = urljoin(base, src)
        if is_image_url(full):
            return full

    return None


def download_image(img_url: str) -> tuple[bytes, str] | tuple[None, None]:
    """Download image bytes. Returns (bytes, mime_type) or (None, None)."""
    try:
        r = requests.get(img_url, timeout=TIMEOUT, headers=HEADERS, allow_redirects=True)
        r.raise_for_status()
        mime = r.headers.get("content-type", "image/jpeg").split(";")[0].strip()
        if not mime.startswith("image/"):
            mime = "image/jpeg"
        return r.content, mime
    except Exception as e:
        print(f"    download error: {e}")
        return None, None


def ext_for_mime(mime: str) -> str:
    exts = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp",
            "image/gif": ".gif", "image/avif": ".avif"}
    return exts.get(mime, ".jpg")


# ── seed.sql parsing ─────────────────────────────────────────────────────────

def parse_seed(path: str):
    """
    Returns (records_list, all_lines).
    Each record: slug, provider_url, hero_image_url (None if NULL),
                 line_start, hero_line_idx.
    """
    with open(path) as f:
        lines = f.readlines()

    RECORD_START = 11
    RECORD_LEN = 6
    HERO_OFFSET = 4

    records = []
    for i in range(RECORD_START, len(lines), RECORD_LEN):
        if i + RECORD_LEN > len(lines):
            break

        line0 = lines[i]
        line4 = lines[i + HERO_OFFSET]

        slug_m = re.search(r"^\s*\('([^']+)'", line0)
        slug = slug_m.group(1) if slug_m else None

        url_m = re.search(r"'(https?://[^']+)'", line0)
        provider_url = url_m.group(1) if url_m else None

        stripped = line4.strip()
        if stripped.startswith("NULL"):
            hero_image_url = None
        else:
            img_m = re.search(r"'(https?://[^']+)'", stripped)
            hero_image_url = img_m.group(1) if img_m else None

        records.append({
            "slug": slug,
            "provider_url": provider_url,
            "hero_image_url": hero_image_url,
            "line_start": i,
            "hero_line_idx": i + HERO_OFFSET,
        })

    return records, lines


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    # Load .env.local if present
    env_path = os.path.join(os.path.dirname(__file__), ".env.local")
    if os.path.exists(env_path):
        for line in open(env_path):
            if "=" in line and not line.startswith("#"):
                k, _, v = line.strip().partition("=")
                os.environ.setdefault(k.strip(), v.strip())

    supa_url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
    supa_key = os.environ.get("SUPABASE_SERVICE_KEY", "")

    if not supa_url or not supa_key:
        print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars.")
        print("  Get the service_role key from: Supabase Dashboard → Settings → API")
        sys.exit(1)

    print(f"Supabase: {supa_url}")
    print(f"Parsing {SEED_PATH}...")
    records, all_lines = parse_seed(SEED_PATH)

    null_records = [r for r in records if r["hero_image_url"] is None]
    print(f"  Total: {len(records)}, NULL hero_image_url: {len(null_records)}")
    print()

    # Ensure bucket exists
    print(f"Ensuring bucket '{STORAGE_BUCKET}' exists...")
    if not ensure_bucket(supa_url, supa_key):
        print("Cannot proceed without storage bucket.")
        sys.exit(1)
    print()

    results = {}  # slug -> supabase CDN url

    for idx, rec in enumerate(null_records):
        slug = rec["slug"]
        page_url = rec["provider_url"]
        print(f"[{idx+1}/{len(null_records)}] {slug}")

        if not page_url:
            print("  SKIP: no provider_url")
            continue

        # 1. Find image URL on the page
        print(f"  Fetching {page_url[:80]}")
        img_url = fetch_best_image_url(page_url)
        if not img_url:
            print("  No image found on page")
            time.sleep(DELAY)
            continue

        print(f"  Image URL: {img_url[:80]}")

        # 2. Download image
        data, mime = download_image(img_url)
        if not data:
            print("  Download failed")
            time.sleep(DELAY)
            continue

        # 3. Upload to Supabase Storage
        ext = ext_for_mime(mime)
        storage_path = f"{STORAGE_PATH_PREFIX}/{slug}{ext}"
        cdn_url = upload_image(supa_url, supa_key, storage_path, data, mime)
        if cdn_url:
            print(f"  Uploaded -> {cdn_url}")
            results[slug] = cdn_url
        else:
            print("  Upload failed")

        time.sleep(DELAY)

    # ── Write outputs ────────────────────────────────────────────────────────
    print()
    print(f"=== Done: {len(results)}/{len(null_records)} images uploaded ===")
    print()

    # SQL UPDATE file
    with open(OUT_SQL, "w") as f:
        f.write("-- hero_image_url updates for things_to_do\n")
        f.write(f"-- {len(results)} records\n\n")
        for slug, cdn_url in results.items():
            safe_url = cdn_url.replace("'", "''")
            f.write(f"UPDATE things_to_do SET hero_image_url = '{safe_url}' WHERE slug = '{slug}';\n")

        no_img = [r["slug"] for r in null_records if r["slug"] not in results]
        if no_img:
            f.write("\n-- No image found:\n")
            for s in no_img:
                f.write(f"-- {s}\n")

    print(f"Written: {OUT_SQL}")

    # Updated seed.sql
    updated = all_lines[:]
    for rec in records:
        slug = rec["slug"]
        if rec["hero_image_url"] is not None or slug not in results:
            continue
        cdn_url = results[slug]
        idx = rec["hero_line_idx"]
        safe_url = cdn_url.replace("'", "''")
        updated[idx] = updated[idx].replace("NULL,", f"'{safe_url}',", 1)

    with open(OUT_SEED, "w") as f:
        f.writelines(updated)
    print(f"Written: {OUT_SEED}")

    missing = [r["slug"] for r in null_records if r["slug"] not in results]
    if missing:
        print(f"\n{len(missing)} records still missing images:")
        for s in missing[:20]:
            print(f"  {s}")
        if len(missing) > 20:
            print(f"  ... and {len(missing)-20} more")


if __name__ == "__main__":
    main()
