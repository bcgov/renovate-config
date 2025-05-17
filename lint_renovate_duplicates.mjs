#!/usr/bin/env node
// lint_renovate_duplicates.mjs
// Lint Renovate JSON/JSON5 config for duplicate/overlapping packageRules by matchManagers and matchPackageNames
// Usage: node lint_renovate_duplicates.mjs file1.json file2.json5 ...
//
// - Accepts any number of .json or .json5 files as arguments.
// - Checks for exact duplicate and overlapping packageRules across all files.
// - Prints clear warnings with file and rule index for each case.
//
// Adapt or extend as needed for your org's Renovate config structure!

import fs from 'fs';
import process from 'process';
import json5 from 'json5';

if (process.argv.length < 3) {
  console.error('Usage: node lint_renovate_duplicates.mjs <file1.json> [file2.json5 ...]');
  process.exit(1);
}

const files = process.argv.slice(2);
console.log(`[INFO] Linting ${files.length} files: ${files.join(', ')}`);
const allRules = [];
let totalRules = 0;

// Parse all files and collect packageRules with file and index info
for (const path of files) {
  console.log(`[INFO] ├─ Parsing ${path} ...`);
  let data;
  try {
    const raw = fs.readFileSync(path, 'utf8');
    // Use JSON5 parser for .json5, native JSON for .json
    data = path.endsWith('.json5') ? json5.parse(raw) : JSON.parse(raw);
  } catch (e) {
    console.error(`[ERROR] └─ Could not parse ${path}: ${e}`);
    continue;
  }
  const rules = data.packageRules || [];
  totalRules += rules.length;
  console.log(`[INFO] │   Found ${rules.length} packageRules in ${path}`);
  for (let i = 0; i < rules.length; i++) {
    allRules.push({
      file: path,
      idx: i,
      managers: (rules[i].matchManagers || []).slice().sort(),
      pkgs: (rules[i].matchPackageNames || []).slice().sort(),
    });
  }
}
console.log(`[INFO] └─ Total packageRules loaded: ${totalRules}`);

// Check for exact duplicate rules (same managers and package names)
let duplicateCount = 0;
const seen = new Map();
for (const rule of allRules) {
  const key = `${rule.managers.join(',')}|${rule.pkgs.join(',')}`;
  if (!seen.has(key)) seen.set(key, []);
  seen.get(key).push(rule);
}
for (const [key, rules] of seen.entries()) {
  if (rules.length > 1) {
    duplicateCount++;
    const [managers, pkgs] = key.split('|');
    const locs = rules.map(r => `${r.file}[r.idx]`).join(', ');
    console.warn(`[WARN][DUPLICATE] Exact duplicate packageRules for matchManagers=[${managers}] and matchPackageNames=[${pkgs}] at: ${locs}`);
  }
}
if (duplicateCount === 0) {
  console.log('[INFO] No exact duplicate packageRules found.');
}

// Check for overlapping rules (same managers, any overlapping package names)
let overlapCount = 0;
for (let i = 0; i < allRules.length; i++) {
  const r1 = allRules[i];
  const m1 = new Set(r1.managers);
  const p1 = new Set(r1.pkgs);
  for (let j = i + 1; j < allRules.length; j++) {
    const r2 = allRules[j];
    const m2 = new Set(r2.managers);
    const p2 = new Set(r2.pkgs);
    // Only compare rules with exactly the same managers
    if (m1.size === m2.size && [...m1].every(x => m2.has(x))) {
      const overlap = [...p1].filter(x => p2.has(x));
      if (overlap.length > 0) {
        overlapCount++;
        console.warn(`[WARN][OVERLAP] Overlapping matchPackageNames in ${r1.file}[${r1.idx}] and ${r2.file}[${r2.idx}] for matchManagers=[${[...m1]}]: [${overlap}]`);
      }
    }
  }
}
if (overlapCount === 0) {
  console.log('[INFO] No overlapping packageRules found.');
}

console.log(`[INFO] Lint complete for ${files.length} files. Checked ${totalRules} packageRules.`);
