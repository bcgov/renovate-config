# Renovate v1 Migration Validation

## Overview

This document describes the approach for migrating unversioned `github>bcgov/renovate-config` references to versioned `github>bcgov/renovate-config#v1` references using Renovate's `customManagers` and `customDatasources`.

## Configuration

### Custom Manager

```json
{
  "customType": "regex",
  "description": "Temporary: Migrate unversioned renovate-config references to v1",
  "managerFilePatterns": [
    "(^|/)renovate\\.json$"
  ],
  "matchStrings": [
    "\"(?<currentValue>github>bcgov/renovate-config)\""
  ],
  "datasourceTemplate": "custom.v1-migration",
  "depNameTemplate": "bcgov/renovate-config"
}
```

### Custom Datasource

```json
{
  "v1-migration": {
    "defaultRegistryUrlTemplate": "https://api.github.com/repos/bcgov/renovate-config/releases",
    "transformTemplates": [
      "{ \"releases\": [{ \"version\": \"v1\", \"releaseTimestamp\": \"2025-08-27T00:00:00Z\" }] }"
    ]
  }
}
```

## How It Works

1. **Detection**: The custom manager scans `renovate.json` files for unversioned references
2. **Parsing**: Regex pattern `"(?<currentValue>github>bcgov/renovate-config)"` captures the reference
3. **Lookup**: Custom datasource provides `v1` as an available version
4. **Update**: Renovate creates a PR to update the reference to include `#v1`

## Local Validation

### Regex Pattern Testing

```bash
# Test that our regex matches target content
node -e "
const regex = /\"(?<currentValue>github>bcgov\/renovate-config)\"/;
const content = '\"github>bcgov/renovate-config\"';
console.log(regex.test(content) ? '✅ Match' : '❌ No match');
"
```

### Configuration Validation

```bash
# Validate configuration syntax
npx renovate-config-validator --strict default.json

# Run comprehensive validation
node validate-config.js
```

## Testing Strategy

### Local Testing (Preferred)
- ✅ Test regex patterns locally
- ✅ Validate configuration structure
- ✅ Simulate the migration process
- ✅ No external dependencies or tokens required

### Remote Testing (When needed)
- Use test repos that reference our experimental branch
- Temporarily point test repos to `github>bcgov/renovate-config#chore/v1try100`
- Revert after testing

## Expected Behavior

### Input
```json
{
  "extends": [
    "github>bcgov/renovate-config"
  ]
}
```

### Output
```json
{
  "extends": [
    "github>bcgov/renovate-config#v1"
  ]
}
```

## Validation Results

- ✅ **Custom manager**: Properly configured with regex type
- ✅ **Regex pattern**: Successfully matches unversioned references
- ✅ **Custom datasource**: Provides v1 as available version
- ✅ **Schema validation**: All required fields present
- ✅ **Configuration syntax**: Valid JSON and structure

## Next Steps

1. **Deploy configuration**: Merge to main when ready
2. **Monitor execution**: Watch for custom manager activation
3. **Verify migration**: Confirm PRs are created for target repos
4. **Cleanup**: Remove custom manager after migration is complete

## Files

- `default.json`: Main configuration with customManagers and customDatasources
- `validate-config.js`: Local validation script (not committed)
- `V1_MIGRATION_VALIDATION.md`: This documentation
