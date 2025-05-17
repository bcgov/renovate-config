#!/usr/bin/env python3
"""
Lint Renovate JSON5 config for duplicate matchPackageNames or matchManagers in packageRules.
Warns if any packageRule in a JSON5 file has the same matchManagers and overlapping matchPackageNames as another rule.

Usage:
  python3 lint_renovate_duplicates.py rules-actions.json5
"""
import sys
import re
import json
import json5
from collections import defaultdict

def normalize(val):
    if isinstance(val, list):
        return tuple(sorted(val))
    if isinstance(val, str):
        return val.strip()
    return val

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 lint_renovate_duplicates.py <rules-file.json5>")
        sys.exit(1)
    path = sys.argv[1]
    with open(path) as f:
        raw = f.read()
    try:
        data = json5.loads(raw)
    except Exception as e:
        print(f"ERROR: Could not parse {path}: {e}")
        sys.exit(1)
    rules = data.get('packageRules', [])
    seen = defaultdict(list)
    for idx, rule in enumerate(rules):
        managers = tuple(sorted(rule.get('matchManagers', [])))
        pkgs = tuple(sorted(rule.get('matchPackageNames', [])))
        key = (managers, pkgs)
        seen[key].append(idx)
    # Warn about duplicate rules
    for (managers, pkgs), idxs in seen.items():
        if len(idxs) > 1:
            print(f"WARNING: Duplicate/overlapping packageRules in {path} for matchManagers={managers} and matchPackageNames={pkgs} at indices {idxs}")
    # Warn about rules with same managers and overlapping package names
    for i, rule1 in enumerate(rules):
        m1 = set(rule1.get('matchManagers', []))
        p1 = set(rule1.get('matchPackageNames', []))
        for j, rule2 in enumerate(rules):
            if i >= j:
                continue
            m2 = set(rule2.get('matchManagers', []))
            p2 = set(rule2.get('matchPackageNames', []))
            if m1 == m2 and p1 & p2:
                print(f"WARNING: Overlapping matchPackageNames in rules {i} and {j} for matchManagers={m1}: {p1 & p2}")

if __name__ == "__main__":
    main()
