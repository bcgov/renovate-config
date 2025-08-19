#!/bin/bash

# Script to discover downstream repositories using our Renovate config
# Usage: ./scripts/discover-downstream.sh

set -e

echo "🔍 Discovering downstream repositories..."

# Search for renovate.json files in bcgov org
echo "Searching for renovate.json files in bcgov organization..."

# Use GitHub CLI to search for renovate.json files
REPOS=$(gh search repos "org:bcgov filename:renovate.json" --json nameWithOwner --jq '.[].nameWithOwner' 2>/dev/null || echo "")

if [ -z "$REPOS" ]; then
    echo "⚠️  Could not find repos via GitHub search API"
    echo "📝 Manual approach:"
    echo "1. Check known repos manually"
    echo "2. Use Renovate's built-in discovery when it runs"
    echo "3. Ask teams to self-report"
else
    echo "📋 Found repositories with renovate.json:"
    echo "$REPOS" | while read -r repo; do
        echo "  - $repo"
    done

    echo ""
    echo "🔧 To update these repos to use stable stream:"
    echo "   Add this to their renovate.json:"
    echo "   {"
    echo "     \"extends\": [\"github>bcgov/renovate-config#stable\"]"
    echo "   }"
fi

echo ""
echo "💡 Alternative: Let Renovate handle this automatically!"
echo "   The packageRule we added will create PRs in downstream repos"
echo "   when they reference our config."
