import hashlib
import re


def normalize_title(title: str) -> str:
    t = title.lower().strip()
    t = re.sub(r"[^a-z0-9\s]", "", t)
    t = re.sub(r"\s+", " ", t)
    return t.strip()


def compute_cluster_key(title: str, start_date: str) -> str:
    """Compute a fingerprint for cross-platform deduplication."""
    normalized = normalize_title(title)
    # Use only the year-month portion to allow similar dates
    month_key = start_date[:7]  # e.g. "2026-06"
    raw = f"{normalized}|{month_key}"
    return hashlib.sha256(raw.encode()).hexdigest()
