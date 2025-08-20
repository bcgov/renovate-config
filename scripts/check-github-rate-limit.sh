#!/bin/bash
# GitHub API Rate Limit Checker
# Helps determine when to use CLI vs manual methods for GitHub operations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 GitHub API Rate Limit Check${NC}"
echo "=================================="

# Check if gh CLI is authenticated
if ! gh auth status >/dev/null 2>&1; then
    echo -e "${RED}❌ GitHub CLI not authenticated${NC}"
    echo "Please run: gh auth login"
    exit 1
fi

# Get rate limit info
echo -e "\n${BLUE}Checking API rate limits...${NC}"
RATE_LIMIT=$(gh api rate_limit 2>/dev/null || echo "{}")

# Extract values (with fallbacks)
CORE_REMAINING=$(echo "$RATE_LIMIT" | jq -r '.resources.core.remaining // 0')
CORE_LIMIT=$(echo "$RATE_LIMIT" | jq -r '.resources.core.limit // 0')
CORE_RESET=$(echo "$RATE_LIMIT" | jq -r '.resources.core.reset // 0')

SEARCH_REMAINING=$(echo "$RATE_LIMIT" | jq -r '.resources.search.remaining // 0')
SEARCH_LIMIT=$(echo "$RATE_LIMIT" | jq -r '.resources.search.limit // 0')
SEARCH_RESET=$(echo "$RATE_LIMIT" | jq -r '.resources.search.reset // 0')

GRAPHQL_REMAINING=$(echo "$RATE_LIMIT" | jq -r '.resources.graphql.remaining // 0')
GRAPHQL_LIMIT=$(echo "$RATE_LIMIT" | jq -r '.resources.graphql.limit // 0')
GRAPHQL_RESET=$(echo "$RATE_LIMIT" | jq -r '.resources.graphql.reset // 0')

# Calculate reset time
if [ "$CORE_RESET" -gt 0 ]; then
    RESET_TIME=$(date -d "@$CORE_RESET" '+%H:%M:%S')
    RESET_DATE=$(date -d "@$CORE_RESET" '+%Y-%m-%d')
else
    RESET_TIME="unknown"
    RESET_DATE="unknown"
fi

# Display current status
echo -e "\n${BLUE}Current Rate Limits:${NC}"
echo "  Core API:    $CORE_REMAINING/$CORE_LIMIT remaining"
echo "  Search API:  $SEARCH_REMAINING/$SEARCH_LIMIT remaining"
echo "  GraphQL API: $GRAPHQL_REMAINING/$GRAPHQL_LIMIT remaining"
echo "  Reset time:  $RESET_TIME on $RESET_DATE"

# Determine recommendation
echo -e "\n${BLUE}Recommendation:${NC}"

if [ "$CORE_REMAINING" -gt 10 ] && [ "$GRAPHQL_REMAINING" -gt 5 ]; then
    echo -e "${GREEN}✅ Use GitHub CLI - Sufficient quota available${NC}"
    echo "  You can safely use 'gh' commands for GitHub operations"
    RECOMMENDATION="cli"
elif [ "$CORE_REMAINING" -gt 0 ] || [ "$GRAPHQL_REMAINING" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Limited quota - Use CLI sparingly${NC}"
    echo "  Consider manual methods for non-critical operations"
    RECOMMENDATION="limited"
else
    echo -e "${RED}❌ Rate limited - Use manual methods${NC}"
    echo "  Use GitHub web interface for operations"
    RECOMMENDATION="manual"
fi

# Provide specific guidance
echo -e "\n${BLUE}Guidance:${NC}"
case $RECOMMENDATION in
    "cli")
        echo "  ✅ Safe to use: gh issue create, gh pr create, gh api calls"
        echo "  ✅ Safe to use: Automated GitHub operations"
        ;;
    "limited")
        echo "  ⚠️  Use CLI for: Critical operations only"
        echo "  ⚠️  Use manual for: Issue creation, PR creation, bulk operations"
        echo "  ⚠️  Wait for reset: $RESET_TIME on $RESET_DATE"
        ;;
    "manual")
        echo "  ❌ Use manual for: All GitHub operations"
        echo "  ❌ Web interface: https://github.com/bcgov/nr-nerds/issues/new"
        echo "  ❌ Wait for reset: $RESET_TIME on $RESET_DATE"
        ;;
esac

# Export recommendation for use in other scripts
export GITHUB_RATE_LIMIT_RECOMMENDATION="$RECOMMENDATION"
export GITHUB_CORE_REMAINING="$CORE_REMAINING"
export GITHUB_GRAPHQL_REMAINING="$GRAPHQL_REMAINING"

# Return appropriate exit code
case $RECOMMENDATION in
    "cli") exit 0 ;;
    "limited") exit 1 ;;
    "manual") exit 2 ;;
    *) exit 3 ;;
esac
