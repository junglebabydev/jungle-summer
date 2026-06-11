#!/usr/bin/env python3
"""
Flag records whose `priceType` looks wrong given the wording of `priceDisplay`.

Two mistag patterns we've actually seen in data.jsx:

  free → mixed:
    priceType:'free' but priceDisplay mentions "admission applies",
    "applies for", "fee may apply", "(... required)", "separately charged",
    "from $X for", etc.

  paid → mixed:
    priceType:'paid' but priceDisplay mentions "free for" / "complimentary" /
    "many free" / "some programmes free" alongside the paid amount.

This script READS data.jsx and prints a report — it does NOT modify the file.
Use the report to hand-correct records (or feed the IDs back to the weekly
crawl for re-extraction).
"""
import re
import sys
from pathlib import Path

DATA_JS = Path(__file__).resolve().parent.parent / "app" / "_components" / "data.jsx"

# A record block starts at "{id:'...'" and ends at the matching "}," at the
# top level. Records here are conveniently single-statement objects with
# unique `id:` keys, so we slice on id boundaries.
RECORD_RE = re.compile(
    r"\{id:'(?P<id>[^']+)',[^\n]*?\n(?:[^\n]*\n){0,15}?[^\n]*?priceType:'(?P<ptype>free|paid|mixed)',\s*"
    r"priceDisplay:'(?P<pdisplay>(?:\\.|[^'\\])*)'",
    re.DOTALL,
)

# Phrases that suggest a "free" tag is actually mixed.
FREE_TO_MIXED_HINTS = [
    r"admission applies",
    r"admission required",
    r"admission fee",
    r"applies for",
    r"applies to others",
    r"fee may apply",
    r"separately charged",
    r"from \$?\s*\d",
    r"from s\$\s*\d",
    r"\bfor others\b",
    r"\bticketed\b",
    r"general admission",
    r"members? \$",
    r"\$\d",                              # any dollar amount inside a "free" record
]

# Phrases that suggest a "paid" tag is actually mixed.
PAID_TO_MIXED_HINTS = [
    r"free for ",
    r"\bfree entry\b",
    r"complimentary",
    r"some free",
    r"many free",
    r"\bfree (programme|programmes|shows|outdoor)\b",
    r"free admission",
]

def find_hits(text: str, patterns: list[str]) -> list[str]:
    hits = []
    for p in patterns:
        if re.search(p, text, re.IGNORECASE):
            hits.append(p)
    return hits

def js_unescape(s: str) -> str:
    return re.sub(r"\\(.)", r"\1", s)

def main() -> int:
    src = DATA_JS.read_text()
    free_flags: list[tuple[str, str, list[str]]] = []
    paid_flags: list[tuple[str, str, list[str]]] = []
    total = 0

    for m in RECORD_RE.finditer(src):
        total += 1
        rid = m.group("id")
        ptype = m.group("ptype")
        pdisplay = js_unescape(m.group("pdisplay"))

        if ptype == "free":
            hits = find_hits(pdisplay, FREE_TO_MIXED_HINTS)
            if hits:
                free_flags.append((rid, pdisplay, hits))
        elif ptype == "paid":
            hits = find_hits(pdisplay, PAID_TO_MIXED_HINTS)
            if hits:
                paid_flags.append((rid, pdisplay, hits))

    print(f"scanned: {total} records\n")

    print(f"== priceType:'free' that look MIXED: {len(free_flags)} ==")
    for rid, pdisplay, hits in free_flags:
        print(f"  - {rid}")
        print(f"      priceDisplay: {pdisplay}")
        print(f"      matched hint(s): {', '.join(hits)}")

    print(f"\n== priceType:'paid' that look MIXED: {len(paid_flags)} ==")
    for rid, pdisplay, hits in paid_flags:
        print(f"  - {rid}")
        print(f"      priceDisplay: {pdisplay}")
        print(f"      matched hint(s): {', '.join(hits)}")

    print(f"\ntotal flagged: {len(free_flags) + len(paid_flags)}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
