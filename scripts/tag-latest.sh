#!/bin/bash

# Script to manage Renovate config tags
# Usage: ./scripts/tag-latest.sh [version]

set -e

VERSION=${1:-$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")}

echo "Managing tags for version: $VERSION"

# Update 'latest' tag to point to main branch (development)
git tag -f latest
echo "✓ Updated 'latest' tag to point to main branch (development)"

# Push latest tag
git push origin latest --force
echo "✓ Pushed 'latest' tag to remote"

echo ""
echo "📋 Tag Strategy:"
echo "  - 'latest' = points to main branch (development)"
echo "  - 'stable' = points to latest stable release (manual update)"
echo "  - 'v1.0.0' = specific version tags"
echo ""
echo "🔧 To update stable tag (when ready for release):"
echo "  git tag stable -f && git push origin stable --force"
echo ""
echo "📝 Teams can use:"
echo "  - github>bcgov/renovate-config#latest  (development)"
echo "  - github>bcgov/renovate-config#stable  (stable releases)"
echo "  - github>bcgov/renovate-config#main    (development)"
echo "  - github>bcgov/renovate-config#v1.0.0  (specific version)"
