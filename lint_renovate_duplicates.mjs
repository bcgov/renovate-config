#!/usr/bin/env node
// lint_renovate_duplicates.mjs
// Lint Renovate JSON5 config for duplicate/overlapping packageRules by matchManagers and matchPackageNames
// Usage: node lint_renovate_duplicates.mjs rules-actions.json5
import fs from 'fs';
import process from 'process';
import json5 from 'json5';

if (process.argv.length < 3) {
  console.error('Usage: node lint_renovate_duplicates.mjs <rules-file.json5>');
  process.exit(1);
}
const path = process.argv[2];
console.log(`[INFO] Linting ${path} for duplicate/overlapping packageRules...`);
let data;
try {
  const raw = fs.readFileSync(path, 'utf8');
  data = json5.parse(raw);
} catch (e) {
  console.error(`[ERROR] Could not parse ${path}: ${e}`);
  process.exit(1);
}
const rules = data.packageRules || [];
console.log(`[INFO] Found ${rules.length} packageRules in ${path}`);
const seen = new Map();
for (let i = 0; i < rules.length; i++) {
  const managers = (rules[i].matchManagers || []).slice().sort().join(',');
  const pkgs = (rules[i].matchPackageNames || []).slice().sort().join(',');
  const key = `${managers}|${pkgs}`;
  if (!seen.has(key)) seen.set(key, []);
  seen.get(key).push(i);
}
for (const [key, idxs] of seen.entries()) {
  if (idxs.length > 1) {
    const [managers, pkgs] = key.split('|');
    console.warn(`[WARN][DUPLICATE] Exact duplicate packageRules in ${path} for matchManagers=[${managers}] and matchPackageNames=[${pkgs}] at indices ${idxs}`);
  }
}
// Warn about rules with same managers and overlapping package names
for (let i = 0; i < rules.length; i++) {
  const m1 = new Set(rules[i].matchManagers || []);
  const p1 = new Set(rules[i].matchPackageNames || []);
  for (let j = i + 1; j < rules.length; j++) {
    const m2 = new Set(rules[j].matchManagers || []);
    const p2 = new Set(rules[j].matchPackageNames || []);
    if (m1.size === m2.size && [...m1].every(x => m2.has(x))) {
      const overlap = [...p1].filter(x => p2.has(x));
      if (overlap.length > 0) {
        console.warn(`[WARN][OVERLAP] Overlapping matchPackageNames in rules ${i} and ${j} for matchManagers=[${[...m1]}]: [${overlap}]`);
      }
    }
  }
}
console.log(`[INFO] Lint complete for ${path}`);
