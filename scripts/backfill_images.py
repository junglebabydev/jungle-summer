#!/usr/bin/env python3
"""
Backfill real hero images into app/_components/data.jsx.

Targets events whose img is a generic placeholder (IMG('p1'..'p5'|'hero-img'))
or a currently-broken external URL. For each, fetch its visitSiteUrl and pull
the best og:image / twitter:image / first content image, validate it loads as
a real image, and rewrite the record's img field to that URL. Events with no
recoverable image get img:'' so the UI falls back to the Jungle logo.

Run:  python3 scripts/backfill_images.py
"""
import re, sys, concurrent.futures
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

DATA = "app/_components/data.jsx"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
HEADERS = {"User-Agent": UA}
TIMEOUT = 14

IMAGE_EXTS = (".jpg", ".jpeg", ".png", ".webp", ".avif")  # no .gif (spinners/spacers)
# Junk substrings that mean "not a hero image" even if served as an image
SKIP = ("logo", "icon", "qr", "lock", "crest", "google-play", "apple-store",
        "app-store", "footer", "sprite", "arrow", "placeholder", ".svg",
        "spinner", "spacer", "blank", "global", "search", "balloon",
        "favicon", "loading", "transition", "1x1", "pixel")


def is_image_url(u):
    low = u.lower()
    if any(s in low for s in SKIP):
        return False
    return any(e in low for e in IMAGE_EXTS) or "/media/" in low or "getimage" in low


def url_ok_image(u):
    """True if URL returns 200 with an image content-type."""
    try:
        r = requests.get(u, headers=HEADERS, timeout=TIMEOUT, stream=True,
                         allow_redirects=True)
        ok = r.status_code == 200 and \
            r.headers.get("content-type", "").startswith("image/")
        r.close()
        return ok
    except Exception:
        return False


def best_image(page_url):
    """Scrape page, return a validated image URL or None."""
    try:
        r = requests.get(page_url, headers=HEADERS, timeout=TIMEOUT,
                         allow_redirects=True)
        if r.status_code != 200:
            return None
    except Exception:
        return None
    soup = BeautifulSoup(r.text, "html.parser")
    base = r.url
    cands = []
    for prop in ("og:image", "og:image:url", "og:image:secure_url"):
        for t in soup.find_all("meta", property=prop):
            if t.get("content"):
                cands.append(urljoin(base, t["content"]))
    for name in ("twitter:image", "twitter:image:src"):
        for t in soup.find_all("meta", attrs={"name": name}):
            if t.get("content"):
                cands.append(urljoin(base, t["content"]))
    # og:image / twitter:image only — these are curated share images.
    # The first-<img> fallback is intentionally omitted: it scrapes
    # spinners, spacers and site logos, which are worse than the logo fallback.
    for c in cands:
        if is_image_url(c) and url_ok_image(c):
            return c
    return None


def main():
    src = open(DATA).read()

    # slice file into per-record spans by '{id:' start positions
    starts = [m.start() for m in re.finditer(r"\{id:'", src)]
    prefix = src[:starts[0]]
    spans = [(starts[i], starts[i + 1] if i + 1 < len(starts) else len(src))
             for i in range(len(starts))]
    records = [src[a:b] for a, b in spans]
    print(f"records: {len(records)}")

    # img value: IMG('..') or a single-quoted string that may contain \' escapes
    img_re = re.compile(r"img:(IMG\('[^']*'\)|'(?:\\.|[^'\\])*')")
    visit_re = re.compile(r"visitSiteUrl:'([^']+)'")
    placeholder_re = re.compile(r"^IMG\('(p\d|hero-img)'\)$")

    # decide targets
    targets = []  # (idx, visitSiteUrl)
    http_imgs = []  # (idx, url) external imgs to validate
    for i, rec in enumerate(records):
        im = img_re.search(rec)
        vm = visit_re.search(rec)
        if not im:
            continue
        val = im.group(1)
        if placeholder_re.match(val):
            targets.append((i, vm.group(1) if vm else None))
        elif val.startswith("'http"):
            http_imgs.append((i, val.strip("'"), vm.group(1) if vm else None))

    # validate external imgs; broken ones become targets
    print(f"validating {len(http_imgs)} external images...")
    def chk(t):
        return (t[0], url_ok_image(t[1]), t[2])
    with concurrent.futures.ThreadPoolExecutor(max_workers=16) as ex:
        for idx, ok, vurl in ex.map(chk, http_imgs):
            if not ok:
                targets.append((idx, vurl))
    print(f"targets to recover: {len(targets)} "
          f"({len(targets)-len([t for t in targets if t in []])})")

    # scrape in parallel
    def work(t):
        idx, vurl = t
        if not vurl:
            return idx, None
        return idx, best_image(vurl)

    recovered = {}
    done = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:
        for idx, img in ex.map(work, targets):
            done += 1
            recovered[idx] = img
            tag = img[:70] if img else "-> logo"
            print(f"[{done}/{len(targets)}] rec#{idx}: {tag}")

    # rewrite records
    n_real = n_logo = 0
    for idx, img in recovered.items():
        newval = f"'{img}'" if img else "''"
        if img:
            n_real += 1
        else:
            n_logo += 1
        records[idx] = img_re.sub("img:" + newval.replace("\\", "\\\\"),
                                  records[idx], count=1)

    out = prefix + "".join(records)
    open(DATA, "w").write(out)
    print(f"\n=== recovered real images: {n_real} | set to logo: {n_logo} ===")
    print(f"wrote {DATA}")


if __name__ == "__main__":
    main()
