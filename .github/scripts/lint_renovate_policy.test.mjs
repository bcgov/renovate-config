import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedMinimumReleaseAgeNull, validatePackageRules, parseJSONC } from './lint_renovate_policy.mjs';

test('parseJSONC strips line and block comments', () => {
  const jsonc = `
  {
    // A comment
    "key": "value" /* inline comment */
  }
  `;
  const result = parseJSONC(jsonc);
  assert.equal(result.key, 'value');
});

test('isAllowedMinimumReleaseAgeNull allows bcgov/renovate-config and lockFileMaintenance only', () => {
  assert.equal(isAllowedMinimumReleaseAgeNull({ matchPackageNames: ['bcgov/renovate-config'] }), true);
  assert.equal(isAllowedMinimumReleaseAgeNull({ matchUpdateTypes: ['lockFileMaintenance'] }), true);

  assert.equal(isAllowedMinimumReleaseAgeNull({ matchPackageNames: ['playwright'] }), false);
  assert.equal(isAllowedMinimumReleaseAgeNull({ matchPackageNames: ['bcgov/renovate-config', 'other'] }), false);
  assert.equal(isAllowedMinimumReleaseAgeNull({}), false);
});

test('validatePackageRules catches unallowed minimumReleaseAge: null', () => {
  const rules = [
    {
      description: 'Playwright override',
      matchPackageNames: ['playwright'],
      minimumReleaseAge: null
    }
  ];
  const errors = validatePackageRules('test.json', rules);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /minimumReleaseAge": null is not allowed on general package rules/);
});

test('validatePackageRules allows allowlisted minimumReleaseAge: null', () => {
  const rules = [
    {
      description: 'Bypass for renovate-config',
      matchPackageNames: ['bcgov/renovate-config'],
      minimumReleaseAge: null
    },
    {
      description: 'Lockfile maintenance',
      matchUpdateTypes: ['lockFileMaintenance'],
      minimumReleaseAge: null
    }
  ];
  const errors = validatePackageRules('test.json', rules);
  assert.equal(errors.length, 0);
});

test('validatePackageRules catches 0-day or 0-hour release ages', () => {
  const zeroRules = [
    { description: 'Zero days', matchPackageNames: ['foo'], minimumReleaseAge: '0 days' },
    { description: 'Zero hours', matchPackageNames: ['bar'], minimumReleaseAge: '0h' },
    { description: 'Plain 0', matchPackageNames: ['baz'], minimumReleaseAge: '0' }
  ];
  const errors = validatePackageRules('test.json', zeroRules);
  assert.equal(errors.length, 3);
  for (const err of errors) {
    assert.match(err, /evaluates to zero/);
  }
});

test('validatePackageRules permits legitimate non-zero release age strings', () => {
  const legitimateRules = [
    { description: '3 days', matchPackageNames: ['foo'], minimumReleaseAge: '3 days' },
    { description: '7 days', matchPackageNames: ['bar'], minimumReleaseAge: '7 days' }
  ];
  const errors = validatePackageRules('test.json', legitimateRules);
  assert.equal(errors.length, 0);
});
