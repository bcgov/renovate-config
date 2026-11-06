#!/usr/bin/env node
// .github/scripts/lint_renovate_policy.mjs
// Lint Renovate JSON (JSONC) config for policy constraints, specifically minimumReleaseAge safety.
//
// Policy rules enforced:
// 1. `minimumReleaseAge: null` is forbidden on packageRules unless explicitly allowlisted:
//    - bcgov/renovate-config (to support zero-delay CalVer transitions downstream)
//    - lockFileMaintenance (doesn't upgrade versions, only updates in-range lockfiles)
// 2. Any explicit `minimumReleaseAge` must not evaluate to zero (e.g. "0 days", "0 hours").

import fs from 'fs';
import process from 'process';
import { fileURLToPath } from 'url';

/**
 * Parses JSONC (JSON with comments) content natively.
 * @param {string} text
 * @returns {any}
 */
export function parseJSONC(text) {
  const clean = text.replace(/("([^"\\]|\\.)*")|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (match, string) => {
    if (string) {
      return match;
    }
    return '';
  });
  return JSON.parse(clean);
}

/**
 * Checks if a rule is allowlisted for minimumReleaseAge: null.
 * @param {any} rule
 * @returns {boolean}
 */
export function isAllowedMinimumReleaseAgeNull(rule) {
  const pkgs = rule.matchPackageNames || [];
  const updateTypes = rule.matchUpdateTypes || [];

  const isRenovateConfigOnly =
    pkgs.length === 1 && pkgs[0] === 'bcgov/renovate-config';

  const isLockFileMaintenanceOnly =
    updateTypes.length === 1 && updateTypes[0] === 'lockFileMaintenance';

  return isRenovateConfigOnly || isLockFileMaintenanceOnly;
}

/**
 * Parse Renovate's compound duration syntax to milliseconds without dependencies.
 * Units follow ms@2.1.3, plus Renovate's 30-day months (including uppercase M).
 * https://github.com/renovatebot/renovate/blob/main/lib/util/pretty-time.ts
 * Invalid syntax remains the responsibility of renovate-config-validator.
 * @param {string} value
 * @returns {number | null}
 */
function releaseAgeMilliseconds(value) {
  const units = [
    [/^(milliseconds?|msecs?|ms)$/i, 1],
    [/^(seconds?|secs?|s)$/i, 1000],
    [/^(minutes?|mins?|m)$/i, 60 * 1000],
    [/^(hours?|hrs?|h)$/i, 60 * 60 * 1000],
    [/^(days?|d)$/i, 24 * 60 * 60 * 1000],
    [/^(weeks?|w)$/i, 7 * 24 * 60 * 60 * 1000],
    [/^(years?|yrs?|y)$/i, 365.25 * 24 * 60 * 60 * 1000],
  ];
  const parts = value.split(/(.*?[a-z]+)/).map(part => part.trim()).filter(Boolean);
  if (!parts.length) return null;

  let total = 0;
  for (const part of parts) {
    const month = /^(\d+)\s*(?:months?|M)$/.exec(part);
    if (month) {
      total += Number(month[1]) * 30 * 24 * 60 * 60 * 1000;
      continue;
    }
    const match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(part);
    if (!match || part.length > 100) return null;
    const multiplier = match[2] ? units.find(([pattern]) => pattern.test(match[2]))[1] : 1;
    total += Number(match[1]) * multiplier;
  }
  return Number.isFinite(total) ? total : null;
}

/**
 * Validates policy constraints on loaded packageRules.
 * @param {string} file
 * @param {any[]} packageRules
 * @returns {string[]} List of policy violation messages
 */
export function validatePackageRules(file, packageRules) {
  const errors = [];

  for (let i = 0; i < packageRules.length; i++) {
    const rule = packageRules[i];
    const loc = `${file}[${i}] (${rule.description || 'no description'})`;

    if ('minimumReleaseAge' in rule) {
      const val = rule.minimumReleaseAge;

      if (val === null) {
        if (!isAllowedMinimumReleaseAgeNull(rule)) {
          errors.push(
            `[POLICY_ERROR] ${loc}: "minimumReleaseAge": null is not allowed on general package rules. ` +
            `It bypasses upstream stability buffers and causes install failures on package managers enforcing minimum release ages (e.g. Yarn modern). ` +
            `Only bcgov/renovate-config and lockFileMaintenance are permitted to set null.`
          );
        }
      } else if (typeof val === 'string') {
        if (releaseAgeMilliseconds(val) === 0) {
          errors.push(
            `[POLICY_ERROR] ${loc}: "minimumReleaseAge": "${val}" evaluates to zero. ` +
            `Zero-delay release age bypasses stability buffers and is forbidden.`
          );
        }
      }
    }
  }

  return errors;
}

export function runCli(argv = process.argv) {
  if (argv.length < 3) {
    console.error('Usage: node .github/scripts/lint_renovate_policy.mjs <file1.json> [file2.json ...]');
    process.exit(1);
  }

  const files = argv.slice(2);
  console.log(`[INFO] Validating policy across ${files.length} files: ${files.join(', ')}`);

  let hasErrors = false;

  for (const path of files) {
    console.log(`[INFO] ├─ Checking policy for ${path} ...`);
    let data;
    try {
      const raw = fs.readFileSync(path, 'utf8');
      data = parseJSONC(raw);
    } catch (e) {
      console.error(`[ERROR] └─ Could not parse ${path}: ${e}`);
      hasErrors = true;
      continue;
    }

    const rules = data.packageRules || [];
    const errors = validatePackageRules(path, rules);

    if (errors.length > 0) {
      hasErrors = true;
      for (const err of errors) {
        console.error(err);
      }
    } else {
      console.log(`[INFO] │   ${rules.length} packageRules passed policy checks.`);
    }
  }

  if (hasErrors) {
    console.error('\n[FATAL] Renovate policy lint failed. Fix violations listed above.');
    process.exit(1);
  } else {
    console.log('\n[INFO] All Renovate policy checks passed successfully.');
  }
}

const isDirectExecution = process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1]);
if (isDirectExecution) {
  runCli();
}
