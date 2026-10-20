#!/usr/bin/env python3
"""Check the complete historical guide ledger, its sources, and reader destinations."""

import argparse
import csv
import hashlib
import json
import re
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from functools import lru_cache
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLISHED = {"restored", "covered", "consolidated"}
STATUSES = PUBLISHED | {"withheld", "navigation", "support_note"}
PUBLIC_DOCS = "https://tempo.xyz/developers"


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.h1 = []
        self.title = []
        self.canonical = []
        self.current = None

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if values.get("id"):
            self.ids.add(values["id"])
        if tag in ("h1", "title"):
            self.current = tag
            getattr(self, tag).append("")
        if tag == "link" and values.get("rel") == "canonical":
            self.canonical.append(values.get("href"))

    def handle_endtag(self, tag):
        if tag == self.current:
            self.current = None

    def handle_data(self, data):
        if self.current:
            getattr(self, self.current)[-1] += data


def urls(value):
    return [item.strip() for item in value.split(";") if item.strip()]


@lru_cache(maxsize=4)
def indexed_pages(sitemap, ai_index):
    sitemap_urls = {
        element.text.rstrip("/")
        for element in ET.fromstring(sitemap).iter()
        if element.tag.rsplit("}", 1)[-1] == "loc" and element.text
    }
    ai_urls = {
        urllib.parse.urldefrag(url)[0].removesuffix(".md").rstrip("/")
        for url in re.findall(r"\]\((https?://[^)\s]+)\)", ai_index)
    }
    return sitemap_urls, ai_urls


@lru_cache(maxsize=None)
def fetch(url, accept="text/html"):
    request = urllib.request.Request(
        url, headers={"User-Agent": "Tempo-Docs-Recovery-Verification/1.0", "Accept": accept}
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        return response.status, response.url, response.headers, response.read()


def verify_destination(url, live, build):
    parsed = urllib.parse.urlsplit(url)
    base = urllib.parse.urlunsplit(parsed._replace(fragment=""))
    result = {"url": url, "errors": []}
    try:
        if live:
            status, final, headers, body = fetch(base)
            result.update(status=status, final_url=final)
            if status != 200 or "text/html" not in headers.get("Content-Type", ""):
                raise ValueError("Destination is not an HTML page with HTTP 200")
            if urllib.parse.urlsplit(final).path.rstrip("/") != parsed.path.rstrip("/"):
                raise ValueError("Ledger must point directly to the final destination")
        else:
            if not url.startswith(PUBLIC_DOCS + "/"):
                return {**result, "result": "external_requires_live_check"}
            route = parsed.path.removeprefix("/developers")
            body = (build / route.lstrip("/") / "index.html").read_bytes()
        page = Page()
        page.feed(body.decode("utf-8"))
        result.update(title=page.title, h1=page.h1, canonical=page.canonical)
        if not page.h1 or any(
            re.search(r"\b(404|page not found)\b", heading, re.I) for heading in page.h1
        ):
            raise ValueError("Destination has no useful page heading")
        if parsed.fragment and urllib.parse.unquote(parsed.fragment) not in page.ids:
            raise ValueError("Destination anchor is missing")
        if url.startswith(PUBLIC_DOCS + "/"):
            route = parsed.path.removeprefix("/developers")
            if page.canonical != [PUBLIC_DOCS + route]:
                raise ValueError("Docs canonical URL differs from the ledger")
            if live:
                sitemap = fetch(PUBLIC_DOCS + "/sitemap.xml")[3].decode()
                ai_index = fetch(PUBLIC_DOCS + "/llms.txt")[3].decode()
            else:
                sitemap = (build / "sitemap.xml").read_text()
                ai_index = (build / "llms.txt").read_text()
            sitemap_urls, ai_urls = indexed_pages(sitemap, ai_index)
            expected_url = (PUBLIC_DOCS + route).rstrip("/")
            if expected_url not in sitemap_urls or expected_url not in ai_urls:
                raise ValueError("Docs page is absent from the sitemap or AI index")
            if live:
                _, _, md_headers, markdown = fetch(base + ".md", "text/markdown")
                if "text/markdown" not in md_headers.get("Content-Type", ""):
                    raise ValueError("Docs Markdown response has the wrong content type")
                result["markdown_sha256"] = hashlib.sha256(markdown).hexdigest()
                if build:
                    manifest = json.loads((build / "markdown-manifest.json").read_text())
                    if manifest["files"].get(route + ".md") != result["markdown_sha256"]:
                        raise ValueError("Public Markdown differs from the local build")
            elif route + ".md" not in json.loads(
                (build / "markdown-manifest.json").read_text()
            )["files"]:
                raise ValueError("Docs page is absent from the Markdown manifest")
        result["result"] = "passed"
    except Exception as error:
        result["errors"].append(str(error))
        result["result"] = "failed"
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--live", action="store_true", help="Check public HTML and Markdown")
    parser.add_argument("--build-dir", type=Path, help="Verify against a production build")
    parser.add_argument("--archive-dir", type=Path, help="Also verify all original file hashes")
    parser.add_argument("--output", type=Path, help="Write the complete verification report")
    args = parser.parse_args()
    rows = list(csv.DictReader((ROOT / "docs/recovered-guide-mapping.csv").open()))
    inventory = json.loads((ROOT / "docs/recovered-guide-source-inventory.json").read_text())
    sources = {}
    for source in inventory["sources"]:
        for item in source["content_files"]:
            key = (source["repo"], str(source["pr"]), item["path"])
            if key in sources:
                raise ValueError(f"Duplicate source inventory entry: {key}")
            sources[key] = (source, item)
    seen = set()
    failures = []
    all_destinations = set()
    coverage_destinations = set()
    reference_destinations = set()
    for row in rows:
        key = (row["source_repo"], row["source_pr"], row["source_file"])
        errors = []
        if key in seen:
            errors.append("Duplicate ledger row")
        seen.add(key)
        if key not in sources:
            errors.append("Source is not in the original PR inventory")
        else:
            source, item = sources[key]
            expected = f'https://github.com/{source["repo"]}/blob/{source["ref"]}/{item["path"]}'
            if row["source_url"] != expected or row["source_kind"] != item["kind"]:
                errors.append("Source provenance differs from the pinned inventory")
            if args.archive_dir:
                original = args.archive_dir / source["archive_directory"] / item["path"]
                if hashlib.sha256(original.read_bytes()).hexdigest() != row["source_sha256"]:
                    errors.append("Original source hash differs")
        if not re.fullmatch(r"[0-9a-f]{64}", row["source_sha256"]):
            errors.append("Source hash is missing or malformed")
        status = row.get("reconciliation_status")
        destinations = urls(row.get("live_destinations", ""))
        references = urls(row.get("reference_destinations", ""))
        if status not in STATUSES:
            errors.append("Missing or unknown reconciliation status")
        if not row.get("coverage_summary", "").strip() or not row.get("coverage_evidence", "").strip():
            errors.append("Missing content coverage rationale or evidence")
        if status in PUBLISHED and not destinations:
            errors.append("Published coverage needs a live destination")
        if status == "withheld" and (
            destinations or not row.get("excluded_material", "").strip()
        ):
            errors.append("Withheld material needs a reason and cannot claim published coverage")
        coverage_destinations.update(destinations)
        reference_destinations.update(references)
        for destination in destinations + references:
            parsed = urllib.parse.urlsplit(destination)
            if parsed.scheme != "https" or not parsed.netloc:
                errors.append("Destination must be an absolute HTTPS URL")
            if parsed.netloc.endswith("docs.tempo.xyz"):
                errors.append("Use the canonical public Docs mount")
            all_destinations.add(destination)
        if errors:
            failures.append({"source": key, "errors": errors})
    for missing in sources.keys() - seen:
        failures.append({"source": missing, "errors": ["Original file has no ledger row"]})
    results = []
    global_checks = {}
    if (args.live or args.build_dir) and not failures:
        with ThreadPoolExecutor(max_workers=4) as executor:
            results = list(
                executor.map(
                    lambda url: verify_destination(url, args.live, args.build_dir),
                    sorted(all_destinations),
                )
            )
        failures.extend(item for item in results if item["errors"])
    if args.build_dir:
        expected_skill = (args.build_dir / "SKILL.md").read_bytes()
        actual_skill = (
            fetch(PUBLIC_DOCS + "/SKILL.md", "text/plain")[3]
            if args.live
            else (ROOT / "public/SKILL.md").read_bytes()
        )
        global_checks["skill_matches_build"] = (
            hashlib.sha256(expected_skill).hexdigest()
            == hashlib.sha256(actual_skill).hexdigest()
        )
        if not global_checks["skill_matches_build"]:
            failures.append({"errors": ["Published/source skill differs from the build"]})
    counts = {}
    for row in rows:
        status = row.get("reconciliation_status", "missing")
        counts[status] = counts.get(status, 0) + 1
    report = {
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "ledger_rows": len(rows),
        "original_page_files": sum(row["source_kind"] == "page" for row in rows),
        "supporting_notes": sum(row["source_kind"] == "support_note" for row in rows),
        "dispositions": counts,
        "coverage_destinations": len(coverage_destinations),
        "reference_destinations": len(reference_destinations),
        "global_checks": global_checks,
        "destinations": results,
        "failures": failures,
    }
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({**report, "destinations": len(results)}, indent=2))
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
