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

// === USAGE & EXAMPLES ===
//
// Usage:
//   node lint_renovate_duplicates.mjs file1.json file2.json5 ...
//
// Example output:
//   [INFO] Linting 3 files: default.json, rules-actions.json5, rules-javascript.json5
//   [INFO] ├─ Parsing default.json ...
//   [INFO] │   Found 1 packageRules in default.json
//   ...
//   [WARN][DUPLICATE] Exact duplicate packageRules for matchManagers=[npm] and matchPackageNames=[/eslint/] at: rules-javascript.json5[8], default.json[2]
//   [WARN][OVERLAP] Overlapping matchPackageNames in rules-javascript.json5[0] and rules-javascript.json5[1] for matchManagers=[npm]: [/eslint/]
//   [INFO] === Rule Coverage Report ===
//   [INFO] Managers covered by rules:
//     [MULTI] github-actions (covered by 3 rules): rules-actions.json5[0], rules-actions.json5[1], rules-actions.json5[2]
//     [OK]    npm           (covered by 1 rule): rules-javascript.json5[8]
//   ...
//
// See README.md for more details.

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
/**
 * Identifies and logs exact duplicate packageRules based on matchManagers and matchPackageNames.
 * 
 * @param {Array<Object>} allRules - An array of rule objects, each containing:
 *   - {string} file: The file where the rule is defined.
 *   - {number} idx: The index of the rule within the file.
 *   - {Array<string>} managers: A sorted array of matchManagers for the rule.
 *   - {Array<string>} pkgs: A sorted array of matchPackageNames for the rule.
 * 
 * Logs warnings for any exact duplicate rules found and provides their locations.
 * If no duplicates are found, logs an informational message.
 */
function checkExactDuplicates(allRules) {
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
      const locs = rules.map(r => `${r.file}[${r.idx}]`).join(', ');
      console.warn(`[WARN][DUPLICATE] Exact duplicate packageRules for matchManagers=[${managers}] and matchPackageNames=[${pkgs}] at: ${locs}`);
    }
  }
  if (duplicateCount === 0) {
    console.log('[INFO] No exact duplicate packageRules found.');
  }
}

// Check for overlapping rules (same managers, any overlapping package names)
function checkOverlappingRules(allRules) {
  let overlapCount = 0;
  // Group rules by their managers key for efficient overlap checking
  const groupedRules = new Map();
  for (const rule of allRules) {
    // Sort managers before joining to ensure consistent grouping
    const key = rule.managers.slice().sort().join(',');
    if (!groupedRules.has(key)) groupedRules.set(key, []);
    groupedRules.get(key).push(rule);
  }
  // Check for overlaps within each group
  for (const [managersKey, rules] of groupedRules.entries()) {
    for (let i = 0; i < rules.length; i++) {
      const r1 = rules[i];
      const p1 = new Set(r1.pkgs);
      for (let j = i + 1; j < rules.length; j++) {
        const r2 = rules[j];
        const p2 = new Set(r2.pkgs);
        const overlap = [...p1].filter(x => p2.has(x));
        if (overlap.length > 0) {
          overlapCount++;
          console.warn(`[WARN][OVERLAP] Overlapping matchPackageNames in ${r1.file}[${r1.idx}] and ${r2.file}[${r2.idx}] for matchManagers=[${managersKey}]: [${overlap}]`);
        }
      }
    }
  }
  if (overlapCount === 0) {
    console.log('[INFO] No overlapping packageRules found.');
  }
}

checkExactDuplicates(allRules);
checkOverlappingRules(allRules);

// === Rule Coverage/Overlap Report ===
// Print a summary table of all managers and package names covered by rules, and highlight multiply-covered items

// Collect all managers and package names
const managerCoverage = new Map(); // manager -> [ruleLocs]
const packageCoverage = new Map(); // packageName -> [ruleLocs]

for (const rule of allRules) {
  const loc = `${rule.file}[${rule.idx}]`;
  for (const m of rule.managers) {
    if (!managerCoverage.has(m)) managerCoverage.set(m, []);
    managerCoverage.get(m).push(loc);
  }
  for (const p of rule.pkgs) {
    if (!packageCoverage.has(p)) packageCoverage.set(p, []);
    packageCoverage.get(p).push(loc);
  }
}

console.log('\n[INFO] === Rule Coverage Report ===');
console.log('[INFO] Managers covered by rules:');
const allManagerLabels = Array.from(managerCoverage.keys());
const maxManagerLen = Math.max(...allManagerLabels.map(m => m.length));
const labelWidth = 7; // '[MULTI]' is 7 chars
for (const [m, locs] of managerCoverage.entries()) {
  const label = locs.length > 1 ? '[MULTI]' : '[OK]';
  const labelPad = ' '.repeat(labelWidth - label.length);
  const namePad = ' '.repeat(maxManagerLen - m.length);
  if (locs.length > 1) {
    console.log(`  ${label}${labelPad} ${m}${namePad} (covered by ${locs.length} rules): ${locs.join(', ')}`);
  } else {
    console.log(`  ${label}${labelPad} ${m}${namePad} (covered by 1 rule): ${locs[0]}`);
  }
}
console.log('[INFO] Package names covered by rules (grouped by file):');
const pkgsByFile = {};
for (const [p, locs] of packageCoverage.entries()) {
  for (const loc of locs) {
    const [file] = loc.split('[');
    if (!pkgsByFile[file]) pkgsByFile[file] = [];
    pkgsByFile[file].push({ pkg: p, loc, count: locs.length });
  }
}
const allPkgLabels = Object.values(pkgsByFile).flat().map(e => e.pkg);
const maxPkgLen = Math.max(...allPkgLabels.map(p => p.length));
for (const file of Object.keys(pkgsByFile)) {
  console.log(`  File: ${file}`);
  for (const entry of pkgsByFile[file]) {
    const label = entry.count > 1 ? '[MULTI]' : '[OK]';
    const labelPad = ' '.repeat(labelWidth - label.length);
    const namePad = ' '.repeat(maxPkgLen - entry.pkg.length);
    if (entry.count > 1) {
      console.log(`    ${label}${labelPad} ${entry.pkg}${namePad} (covered by ${entry.count} rules): ${entry.loc}`);
    } else {
      console.log(`    ${label}${labelPad} ${entry.pkg}${namePad} (covered by 1 rule): ${entry.loc}`);
    }
  }
}
console.log('[INFO] === End Rule Coverage Report ===\n');

console.log(`[INFO] Lint complete for ${files.length} files. Checked ${totalRules} packageRules.`);
