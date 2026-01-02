#!/bin/bash
# VoiceVault GitHub Integration Script

echo "=== VoiceVault GitHub Integration ==="
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if gh is already installed
if command -v gh &> /dev/null; then
    echo -e "${GREEN}✓ GitHub CLI is already installed${NC}"
else
    echo -e "${YELLOW}GitHub CLI not found. Please install it manually.${NC}"
    echo ""
    echo "For Ubuntu/Debian, run:"
    echo "  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg"
    echo "  echo \"deb [arch=\$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main\" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null"
    echo "  sudo apt update"
    echo "  sudo apt install gh"
    echo ""
    echo "After installation, authenticate with:"
    echo "  gh auth login"
    echo ""
    exit 1
fi

# Check if already authenticated
if gh auth status &> /dev/null; then
    echo -e "${GREEN}✓ Already authenticated with GitHub${NC}"
    gh auth status
else
    echo -e "${YELLOW}⚠ Not authenticated. Please authenticate:${NC}"
    echo ""
    echo "Run: gh auth login"
    echo ""
    echo "IMPORTANT: Use a Personal Access Token, NOT your password!"
    echo "Create token at: https://github.com/settings/tokens"
    echo ""
    exit 1
fi

# Create repository
echo ""
echo -e "${GREEN}Creating GitHub repository...${NC}"
gh repo create voicevault --public --source=. --push || {
    echo -e "${RED}✗ Failed to create repository${NC}"
    echo "Possible reasons:"
    echo "  - Repository 'voicevault' already exists"
    echo "  - Not authenticated properly"
    echo ""
    echo "Try manual setup:"
    echo "  1. Go to https://github.com/new"
    echo "  2. Create 'voicevault' repository"
    echo "  3. Run: git remote add origin https://github.com/cemcobancem/voicevault.git"
    echo "  4. Run: git push -u origin main"
    exit 1
}

echo ""
echo -e "${GREEN}✓ Repository created successfully!${NC}"
echo ""
echo "Your code is now available at:"
echo "  https://github.com/cemcobancem/voicevault"
echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"