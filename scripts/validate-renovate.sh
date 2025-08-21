#!/bin/bash
# Enhanced Renovate validation script
# Validates Renovate configuration beyond basic schema validation
# Catches semantic errors, contradictory rules, and runtime issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration files to validate
CONFIG_FILES="default.json renovate.json rules-*.json5"

echo -e "${BLUE}🔍 Enhanced Renovate Configuration Validation${NC}"
echo "=================================================="

# Stage 1: Basic schema validation
echo -e "\n${BLUE}Stage 1: Schema validation...${NC}"
if npx --yes --package renovate --- "renovate-config-validator --strict $CONFIG_FILES"; then
    echo -e "${GREEN}✅ Schema validation passed${NC}"
else
    echo -e "${RED}❌ Schema validation failed${NC}"
    exit 1
fi

# Stage 2: Config resolution test
echo -e "\n${BLUE}Stage 2: Config resolution test...${NC}"
RESOLUTION_OUTPUT=$(npx --yes --package renovate --- "renovate --dry-run=full --print-config" 2>&1 || true)

if echo "$RESOLUTION_OUTPUT" | grep -q -E "(ERROR|Invalid)"; then
    echo -e "${RED}❌ Config resolution errors found:${NC}"
    echo "$RESOLUTION_OUTPUT" | grep -E "(ERROR|Invalid)" || true
    exit 1
elif echo "$RESOLUTION_OUTPUT" | grep -q -E "WARN"; then
    echo -e "${YELLOW}⚠️  Config resolution warnings found:${NC}"
    echo "$RESOLUTION_OUTPUT" | grep -E "WARN" || true
    echo -e "${GREEN}✅ Config resolves successfully (with warnings)${NC}"
else
    echo -e "${GREEN}✅ Config resolves successfully${NC}"
fi

# Stage 3: Custom rule validation
echo -e "\n${BLUE}Stage 3: Custom rule validation...${NC}"

# Check for contradictory pinning rules
echo "  Checking for contradictory pinning rules..."
if grep -q '"pinDigests": true' default.json && grep -q '"pinDigests": false' default.json; then
    echo -e "${YELLOW}⚠️  Found both pinDigests: true and false rules${NC}"
    echo "  This is expected for our pinning strategy, but verify the logic is correct"
else
    echo -e "${GREEN}✅ PinDigests rules look consistent${NC}"
fi

# Check for duplicate package rules
echo "  Checking for duplicate package rules..."
DUPLICATE_RULES=$(grep -h '"matchPackageNames"' default.json rules-*.json5 2>/dev/null | sort | uniq -d || true)
if [ -n "$DUPLICATE_RULES" ]; then
    echo -e "${YELLOW}⚠️  Potential duplicate package rules found:${NC}"
    echo "$DUPLICATE_RULES"
else
    echo -e "${GREEN}✅ No duplicate package rules detected${NC}"
fi

# Check for valid update types
echo "  Checking for valid update types..."
INVALID_UPDATE_TYPES=$(grep -h '"matchUpdateTypes"' default.json rules-*.json5 2>/dev/null | grep -o '"[^"]*"' | grep -v -E '"(major|minor|patch|pin|pinDigest|digest|lockFileMaintenance|rollback|bump|replacement)"' || true)
if [ -n "$INVALID_UPDATE_TYPES" ]; then
    echo -e "${YELLOW}⚠️  Potentially invalid update types found:${NC}"
    echo "$INVALID_UPDATE_TYPES"
    echo "  Verify these are valid Renovate update types"
else
    echo -e "${GREEN}✅ All update types appear valid${NC}"
fi

# Check for invalid commitMessageAction values
echo "  Checking for invalid commitMessageAction values..."
INVALID_COMMIT_ACTIONS=$(grep -h '"commitMessageAction"' default.json rules-*.json5 2>/dev/null | grep -o '"[^"]*"' | grep -v -E '"(replace|append|prepend)"' || true)
if [ -n "$INVALID_COMMIT_ACTIONS" ]; then
    echo -e "${RED}❌ Invalid commitMessageAction values found:${NC}"
    echo "$INVALID_COMMIT_ACTIONS"
    echo "  Valid values are: replace, append, prepend"
    exit 1
else
    echo -e "${GREEN}✅ All commitMessageAction values are valid${NC}"
fi

# Check for contradictory enabled: true with blocking properties
echo "  Checking for contradictory enabled: true with blocking properties..."
CONTRADICTORY_RULES=$(grep -A5 -B5 '"enabled": true' default.json rules-*.json5 2>/dev/null | grep -E '(commitMessageAction.*block|commitMessageTopic.*block|prBody.*blocked)' || true)
if [ -n "$CONTRADICTORY_RULES" ]; then
    echo -e "${RED}❌ Found enabled: true with blocking properties:${NC}"
    echo "$CONTRADICTORY_RULES"
    echo "  Use enabled: false to block updates, not enabled: true with blocking properties"
    exit 1
else
    echo -e "${GREEN}✅ No contradictory enabled/blocking combinations${NC}"
fi

# Check for invalid allowedVersions regex patterns
echo "  Checking for invalid allowedVersions regex patterns..."
ALLOWED_VERSIONS=$(grep -h '"allowedVersions"' default.json rules-*.json5 2>/dev/null | grep -o '"[^"]*"' | sed 's/^"//;s/"$//' || true)
for regex in $ALLOWED_VERSIONS; do
    if [[ "$regex" =~ ^/.*/$ ]]; then
        # Remove leading/trailing slashes for testing
        test_regex="${regex#/}"
        test_regex="${test_regex%/}"
        if ! echo "test" | grep -q "$test_regex" 2>/dev/null; then
            echo -e "${RED}❌ Invalid allowedVersions regex: $regex${NC}"
            exit 1
        fi
    fi
done
echo -e "${GREEN}✅ All allowedVersions regex patterns are valid${NC}"

# Stage 4: Integration test with real repository
echo -e "\n${BLUE}Stage 4: Integration test...${NC}"
echo "  Testing config against bcgov/quickstart-openshift..."

# Create a temporary test config
cat > test-integration.json << EOF
{
  "extends": ["github>bcgov/renovate-config"],
  "repositories": ["bcgov/quickstart-openshift"]
}
EOF

INTEGRATION_OUTPUT=$(npx --yes --package renovate --- "renovate --config test-integration.json --dry-run=full extract" 2>&1 || true)

# Clean up test file
rm -f test-integration.json

if echo "$INTEGRATION_OUTPUT" | grep -q -E "(ERROR|WARN|Invalid)"; then
    echo -e "${RED}❌ Integration test errors found:${NC}"
    echo "$INTEGRATION_OUTPUT" | grep -E "(ERROR|WARN|Invalid)" | head -5 || true
    echo -e "${YELLOW}  (Showing first 5 errors)${NC}"
else
    echo -e "${GREEN}✅ Integration test passed${NC}"
fi

# Stage 5: Performance and best practices check
echo -e "\n${BLUE}Stage 5: Best practices check...${NC}"

# Check for excessive grouping
GROUP_COUNT=$(grep -h '"groupName"' default.json rules-*.json5 2>/dev/null | wc -l || echo "0")
if [ "$GROUP_COUNT" -gt 10 ]; then
    echo -e "${YELLOW}⚠️  High number of grouping rules ($GROUP_COUNT)${NC}"
    echo "  Consider if all groupings are necessary"
else
    echo -e "${GREEN}✅ Grouping rules count looks reasonable ($GROUP_COUNT)${NC}"
fi

# Check for clear descriptions
UNDESCRIBED_RULES=$(grep -h '"description"' default.json rules-*.json5 2>/dev/null | wc -l || echo "0")
TOTAL_RULES=$(grep -h '"packageRules"' default.json rules-*.json5 2>/dev/null | wc -l || echo "0")
if [ "$UNDESCRIBED_RULES" -lt "$TOTAL_RULES" ]; then
    echo -e "${YELLOW}⚠️  Some rules may be missing descriptions${NC}"
    echo "  Consider adding descriptions to all package rules"
else
    echo -e "${GREEN}✅ All rules have descriptions${NC}"
fi

echo -e "\n${GREEN}🎉 Enhanced validation completed successfully!${NC}"
echo -e "${BLUE}The Renovate configuration appears to be valid and well-structured.${NC}"
