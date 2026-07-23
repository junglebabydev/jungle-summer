#!/usr/bin/env python3
"""
Fill in hero_image_url for LIVE things_to_do records that are missing one
(falling back to the Jungle placeholder logo in the UI).

For each record with no hero_image_url:
  1. Try provider_url, then source_url, then visit_site_url
  2. Fetch that page, extract the best candidate image (og:image ->
     twitter:image -> first plausible <img>, skipping logos/icons/banners)
  3. Set hero_image_url directly to that image's URL — no re-hosting to
     Supabase Storage; every other populated hero_image_url in this table
     is already a direct hotlink to the source site, so this matches the
     existing pattern rather than introducing a second one.

Only ever targets PUBLIC records (review_status=approved, status IN
(active,expired)) — the ones actually visible on the live site today.

Usage:
  python3 scripts/fetch_missing_images.py            # dry run
  python3 scripts/fetch_missing_images.py --apply     # write to Supabase

Requires: requests, beautifulsoup4 (pip install requests beautifulsoup4)
Reads SUPABASE_URL / SUPABASE_SERVICE_KEY from supabase/.env.local.
"""
import os
import re
import sys
import time
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

APPLY = "--apply" in sys.argv
ROOT = Path(__file__).resolve().parent.parent
DELAY = 0.7
TIMEOUT = 14
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
}

# Images confirmed (by hand, across separate runs of this script) to be
# generic/wrong rather than event-specific — a generic-image URL isn't
# guaranteed to repeat WITHIN a single run's batch (that's what the
# duplicate-in-batch check catches), but re-scraping the same page on a
# later run can independently reproduce the exact same wrong match. This
# persists across runs so a previously-caught mistake can never silently
# get re-applied. Substring match, case-insensitive.
KNOWN_BAD_IMAGE_SUBSTRINGS = (
    "dialogue-with-aichr",                 # childrensociety.org.sg — unrelated blog photo
    "baba-nyonya-outlet-deals",            # changiairport.com — food-outlet promo, not an event photo
    "150_x_150px_1200x1200",               # bykido.com — generic site logo
    "night-time_final_fire_works",         # rwsentosa.com — generic homepage banner
    "about-mandai/mandai-wildlife-reserve-1200x630",  # mandai.com — generic reserve-wide banner
)

IMAGE_EXTS = (".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif")
IMAGE_PATH_MARKERS = ("/media/", "/images/", "/uploads/", "/assets/", "/img/",
                       "/photos/", "/pictures/", "/content/", "getimage", "getImage",
                       "/events/", "/activity", "/exhibition", "/programme")
SKIP_PATTERNS = ("logo", "icon", "qr", "lock", "crest", "government_building",
                  "google-play", "apple-store", "app-store", "banner-bottom",
                  "footer", "sprite", "arrow", "button", ".svg")


def load_env():
    env = dict(os.environ)
    try:
        for line in (ROOT / "supabase" / ".env.local").read_text().splitlines():
            m = re.match(r'^\s*([A-Z_]+)\s*=\s*(.*)\s*$', line)
            if m and m.group(1) not in env:
                env[m.group(1)] = m.group(2).strip('"\'')
    except FileNotFoundError:
        pass
    return env


def is_image_url(u):
    low = u.lower()
    if any(s in low for s in SKIP_PATTERNS) or any(s in low for s in KNOWN_BAD_IMAGE_SUBSTRINGS):
        return False
    if any(ext in low for ext in IMAGE_EXTS):
        return True
    if any(marker in u for marker in IMAGE_PATH_MARKERS):
        return True
    return False


def fetch_best_image_url(page_url):
    """Returns (image_url, tier, error). tier is 'og'/'twitter' (high-confidence
    — the page's own author deliberately set this to represent the page) or
    'img-fallback' (low-confidence — just the first plausible <img> in the DOM,
    no semantic guarantee it's actually about this event; seen picking up
    unrelated footer/promo images in practice)."""
    try:
        r = requests.get(page_url, timeout=TIMEOUT, headers=HEADERS, allow_redirects=True)
        r.raise_for_status()
    except Exception as e:
        return None, None, f"page fetch error: {e}"

    soup = BeautifulSoup(r.text, "html.parser")
    base = r.url

    for prop in ("og:image", "og:image:url"):
        tag = soup.find("meta", property=prop)
        if tag:
            content = urljoin(base, tag.get("content", ""))
            if is_image_url(content):
                return content, "og", None

    for name in ("twitter:image", "twitter:image:src"):
        tag = soup.find("meta", attrs={"name": name})
        if tag:
            content = urljoin(base, tag.get("content", ""))
            if is_image_url(content):
                return content, "twitter", None

    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src") or img.get("data-lazy-src") or ""
        if not src:
            continue
        full = urljoin(base, src)
        if is_image_url(full):
            return full, "img-fallback", None

    return None, None, "no candidate image found on page"


def main():
    env = load_env()
    url = env.get("SUPABASE_URL") or env.get("NEXT_PUBLIC_SUPABASE_URL")
    key = env.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        print("Missing SUPABASE_URL / SUPABASE_SERVICE_KEY", file=sys.stderr)
        sys.exit(1)
    sh = {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}

    resp = requests.get(
        f"{url}/rest/v1/things_to_do",
        params={
            "select": "id,title,provider_url,source_url,visit_site_url",
            "review_status": "eq.approved",
            "status": "in.(active,expired)",
            "or": "(hero_image_url.is.null,hero_image_url.eq.)",
        },
        headers=sh, timeout=15,
    )
    resp.raise_for_status()
    records = resp.json()
    print(f"\n{len(records)} public listing(s) missing a hero image.\n")

    candidates_by_record = []
    not_found = []
    for r in records:
        urls = [u for u in (r.get("provider_url"), r.get("source_url"), r.get("visit_site_url")) if u]
        img_url, tier, err = None, None, "no URL to try"
        for u in urls:
            img_url, tier, err = fetch_best_image_url(u)
            if img_url:
                break
            time.sleep(DELAY)
        if img_url:
            candidates_by_record.append((r, img_url, tier))
        else:
            not_found.append((r, err))
        time.sleep(DELAY)

    # A real per-event photo is essentially never identical across two
    # DIFFERENT events. If the same image URL comes back for multiple
    # records, it's almost always a generic site logo/banner — reusing it
    # would be actively wrong, not just unhelpful. Quarantine those.
    from collections import Counter
    url_counts = Counter(u for _, u, _ in candidates_by_record)

    found, review = [], []
    for r, u, tier in candidates_by_record:
        if url_counts[u] > 1:
            review.append((r, u, f"same image used by {url_counts[u]} different listings — likely a generic site logo/banner"))
        elif tier == "img-fallback":
            # Low-confidence tier: no page-author signal this image actually
            # represents this event (seen picking up unrelated footer/promo
            # images in practice, e.g. a food-outlet ad for a sports event).
            # Surface for a human to eyeball rather than auto-apply.
            review.append((r, u, "low-confidence match (no og:image/twitter:image on the page — grabbed the first plausible <img> instead, unverified)"))
        else:
            found.append((r, u))

    for r, u in found:
        print(f"  FOUND       {r['title'][:55]}\n              -> {u}")
    for r, u, reason in review:
        print(f"  NEEDS REVIEW {r['title'][:55]}\n              -> {u}\n              ({reason}, NOT applying)")
    for r, err in not_found:
        print(f"  MISS        {r['title'][:55]}  ({err})")

    print(f"\nHigh-confidence matches (auto-apply eligible): {len(found)}/{len(records)}.  "
          f"Flagged for manual review: {len(review)}.  "
          f"No candidate at all: {len(not_found)}.\n")

    if not APPLY:
        print("Dry run. Re-run with --apply to write these to Supabase.\n")
        return

    updated = 0
    for r, img_url in found:
        patch = requests.patch(
            f"{url}/rest/v1/things_to_do",
            params={"id": f"eq.{r['id']}"},
            headers=sh, json={"hero_image_url": img_url}, timeout=15,
        )
        if patch.status_code in (200, 204):
            updated += 1
        else:
            print(f"  UPDATE FAILED for {r['title'][:60]}: {patch.status_code} {patch.text[:150]}")
    print(f"Updated {updated} record(s).\n")


if __name__ == "__main__":
    main()
