#!/bin/bash

# Script to create/update latest and stable tags
# Usage: ./scripts/tag-latest.sh [version]

set -e

VERSION=${1:-$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")}

echo "Creating/updating tags for version: $VERSION"

# Create or update the 'latest' tag
git tag -f latest
echo "✓ Updated 'latest' tag"

# Create or update the 'stable' tag
git tag -f stable
echo "✓ Updated 'stable' tag"

# Push tags
git push origin latest --force
git push origin stable --force
echo "✓ Pushed tags to remote"

echo "Done! Teams can now use:"
echo "  - github>bcgov/renovate-config#latest  (latest stable)"
echo "  - github>bcgov/renovate-config#stable  (latest stable)"
echo "  - github>bcgov/renovate-config#main    (development)"
