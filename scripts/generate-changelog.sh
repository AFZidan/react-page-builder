#!/bin/bash

# Script to generate changelog locally
# Usage: ./scripts/generate-changelog.sh [version]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📝 Changelog Generator${NC}"
echo ""

# Check if conventional-changelog-cli is installed
if ! command -v conventional-changelog &> /dev/null; then
    echo -e "${YELLOW}Installing conventional-changelog-cli...${NC}"
    npm install -g conventional-changelog-cli
fi

# Get version from argument or package.json
if [ -n "$1" ]; then
    VERSION=$1
else
    VERSION=$(node -p "require('./package.json').version")
fi

echo -e "${BLUE}Generating changelog for version ${GREEN}${VERSION}${NC}"
echo ""

# Backup existing CHANGELOG.md
if [ -f CHANGELOG.md ]; then
    cp CHANGELOG.md CHANGELOG.md.backup
    echo -e "${YELLOW}✓ Backed up existing CHANGELOG.md${NC}"
fi

# Generate changelog
conventional-changelog -p angular -i CHANGELOG.md -s -r 0

echo ""
echo -e "${GREEN}✓ Changelog generated successfully!${NC}"
echo ""
echo "Preview of changes:"
echo "-------------------"
head -30 CHANGELOG.md
echo "-------------------"
echo ""

# Show what's new in this version
echo -e "${BLUE}What's new in this version:${NC}"
awk '/^## \[/{if (++count == 2) exit} count == 1' CHANGELOG.md

echo ""
echo -e "${YELLOW}Note: Review CHANGELOG.md before committing${NC}"
echo -e "${YELLOW}Backup saved as: CHANGELOG.md.backup${NC}"

