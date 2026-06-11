#!/usr/bin/env python3
"""
Backfill `priceInfo` on every record in data.jsx.

Parses each record's `priceType` + `priceDisplay`, derives a structured
priceInfo of shape:
    { type: 'free' | 'paid' | 'mixed',
      display?, freeFor?, paidDisplay?, note?, fullText? }
and inserts it inline right after `priceDisplay:'…',`.

Idempotent: records that already have `priceInfo:` are left alone.
"""
import re
import sys
from pathlib import Path

DATA_JS = Path(__file__).resolve().parent.parent / "app" / "_components" / "data.jsx"

# ---- price parser (mirrors priceInfoFor in data.jsx) ----------------------

AMOUNT_RE = re.compile(r"S?\$\s?\d+(?:\.\d{1,2})?", re.IGNORECASE)

def first_amount(text: str | None) -> str | None:
    if not text:
        return None
    m = AMOUNT_RE.search(text)
    if not m:
        return None
    s = re.sub(r"\s+", "", m.group(0))
    if s.startswith("$"):
        s = "S" + s
    return re.sub(r"^s\$", "S$", s)

# Delimiters between the free clause and the paid clause are `;` or
# `. ` (sentence end) — NOT commas, since the freeFor phrase itself
# often contains commas (e.g. "Singapore Citizens, PRs and visitors aged 6
# and below").
_DELIM = r"(?:;|\.\s)"
PAT_A = re.compile(
    rf"free\b[^;.]*?\bfor\s+(.+?)\s*{_DELIM}\s*(?:from\s+)?([^;]*?)\bfor\s+others?\b\s*(?:\(([^)]+)\))?",
    re.IGNORECASE,
)
PAT_B = re.compile(
    rf"free\b[^;.]*?\bfor\s+(.+?)\s*{_DELIM}\s*(.+)$",
    re.IGNORECASE,
)
PAT_C = re.compile(rf"^free\b([^;.]*?)\s*{_DELIM}\s*(.+)$", re.IGNORECASE)

def derive_price_info(price_type: str, price_display: str) -> dict:
    text = (price_display or "").strip()

    if price_type == "free":
        return {"type": "free", "fullText": text}

    if price_type == "mixed":
        amt = first_amount(text)
        m = PAT_A.search(text)
        if m:
            return {
                "type": "mixed",
                "freeFor": re.sub(r"\s+", " ", m.group(1).strip()),
                "paidDisplay": f"From {amt}" if amt else "Admission applies",
                "note": m.group(3).strip() if m.group(3) else None,
                "fullText": text,
            }
        m = PAT_B.search(text)
        if m:
            return {
                "type": "mixed",
                "freeFor": re.sub(r"\s+", " ", m.group(1).strip()),
                "paidDisplay": f"From {amt}" if amt else "Admission applies",
                "note": None,
                "fullText": text,
            }
        m = PAT_C.search(text)
        if m:
            ff = re.sub(r"^(admission|entry|programme|to)\s*", "", m.group(1), flags=re.IGNORECASE).strip() or "entry"
            return {
                "type": "mixed",
                "freeFor": ff,
                "paidDisplay": f"From {amt}" if amt else "Some paid",
                "note": None,
                "fullText": text,
            }
        return {
            "type": "mixed",
            "freeFor": "some visitors",
            "paidDisplay": f"From {amt}" if amt else "Some paid",
            "note": None,
            "fullText": text,
        }

    # paid
    amt = first_amount(text)
    return {
        "type": "paid",
        "display": amt if amt else ("Paid entry" if len(text) > 28 else text),
        "fullText": text,
    }

# ---- JS literal emit + JSX rewrite ----------------------------------------

def js_str(s: str) -> str:
    # JS single-quoted string with \\ and \' escapes
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"

def emit_js_object(info: dict) -> str:
    # ordered, compact, single-line literal
    keys_in_order = ["type", "display", "freeFor", "paidDisplay", "note", "fullText"]
    parts = []
    for k in keys_in_order:
        if k not in info:
            continue
        v = info[k]
        if v is None:
            parts.append(f"{k}:null")
        elif isinstance(v, str):
            parts.append(f"{k}:{js_str(v)}")
        else:
            parts.append(f"{k}:{v}")
    return "{" + ",".join(parts) + "}"

# Match: priceType:'X', (whitespace) priceDisplay:'<escaped string>',
# Don't allow `priceInfo:` to already follow.
RECORD_RE = re.compile(
    r"(priceType\s*:\s*'(free|paid|mixed)'\s*,\s*"
    r"priceDisplay\s*:\s*'((?:\\.|[^'\\])*)'\s*,)"
    r"(?!\s*priceInfo)",
    re.DOTALL,
)

def js_unescape(s: str) -> str:
    return re.sub(r"\\(.)", r"\1", s)

def main():
    src = DATA_JS.read_text()
    if "priceInfo:" in src and "function priceInfoFor" in src:
        print(f"note: data.jsx already exports priceInfoFor (helper kept as fallback)")

    n_total = 0
    n_patched = 0
    skipped_already = 0

    def repl(m: re.Match) -> str:
        nonlocal n_total, n_patched
        n_total += 1
        whole = m.group(1)
        price_type = m.group(2)
        price_display_raw = m.group(3)
        price_display = js_unescape(price_display_raw)
        info = derive_price_info(price_type, price_display)
        n_patched += 1
        return f"{whole} priceInfo:{emit_js_object(info)},"

    new_src, n_subs = RECORD_RE.subn(repl, src)

    # Also count records that already had priceInfo
    skipped_already = len(re.findall(r"priceInfo\s*:\s*\{", src))

    DATA_JS.write_text(new_src)

    print(f"records patched:           {n_patched}")
    print(f"records already had info:  {skipped_already}")
    print(f"data.jsx written.")

if __name__ == "__main__":
    main()
