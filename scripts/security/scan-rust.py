"""Query OSV for exact locked crate versions without compiling application code."""
import argparse
import concurrent.futures
import hashlib
import json
from pathlib import Path
import tomllib
import urllib.request


def fetch(url, payload=None):
    data = None if payload is None else json.dumps(payload).encode()
    request = urllib.request.Request(url, data=data, headers={
        "Content-Type": "application/json", "User-Agent": "Novera-security-review",
    })
    with urllib.request.urlopen(request, timeout=45) as response:
        return json.load(response)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--lockfile", action="append", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    scopes, packages = {}, set()
    for filename in args.lockfile:
        path = Path(filename)
        entries = tomllib.loads(path.read_text(encoding="utf-8-sig"))["package"]
        entries = {(p["name"], p["version"]) for p in entries if p.get("source", "").startswith("registry+")}
        scopes[filename] = {"sha256": hashlib.sha256(path.read_bytes()).hexdigest(), "packages": sorted(entries)}
        packages.update(entries)
    packages = sorted(packages)

    def batch_query(batch):
        result = fetch("https://api.osv.dev/v1/querybatch", {"queries": [
            {"package": {"name": name, "ecosystem": "crates.io"}, "version": version}
            for name, version in batch
        ]})
        if len(result["results"]) != len(batch):
            raise RuntimeError("Incomplete OSV response")
        return [{"name": name, "version": version, "advisories": result.get("vulns", [])}
                for (name, version), result in zip(batch, result["results"]) if result.get("vulns")]

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        matches = [match for batch in executor.map(batch_query, [packages[i:i+300] for i in range(0, len(packages), 300)]) for match in batch]
        ids = sorted({advisory["id"] for match in matches for advisory in match["advisories"]})
        details = list(executor.map(lambda ident: fetch("https://api.osv.dev/v1/vulns/" + ident), ids))
    result = {
        "database": "https://api.osv.dev", "scopes": scopes,
        "unique_package_versions_checked": len(packages), "matches": matches, "details": details,
        "note": "IDs may alias the same issue. Maintenance notices and vulnerability advisories are distinct; reachability requires code review.",
    }
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(f"Checked {len(packages)} package versions; {len(matches)} matching versions, {len(ids)} advisory IDs including aliases.")


if __name__ == "__main__":
    main()
