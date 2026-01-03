#!/bin/bash
# VoiceVault Vercel Deployment Script

echo "=== VoiceVault Vercel Deployment ==="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found${NC}"
    echo ""
    echo "Please install Vercel CLI first:"
    echo ""
    echo "Option 1: Using npm"
    echo "  npm install -g vercel"
    echo ""
    echo "Option 2: Using yarn"
    echo "  yarn global add vercel"
    echo ""
    echo "Option 3: Using pnpm"
    echo "  pnpm add -g vercel"
    echo ""
    echo "Option 4: Using brew (macOS)"
    echo "  brew install vercel-cli"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo -e "${GREEN}✓ Vercel CLI installed${NC}"
vercel --version

# Check if logged in
if vercel whoami &> /dev/null; then
    echo -e "${GREEN}✓ Already logged in to Vercel${NC}"
    vercel whoami
else
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    echo ""
    echo "Please login first:"
    echo "  vercel login"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Deploy to Vercel
echo ""
echo -e "${GREEN}Deploying to Vercel...${NC}"
echo ""

vercel deploy --prod

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Deployment successful!${NC}"
    echo ""
    echo "Your app is now live on Vercel!"
    echo ""
    echo "Check deployment status at:"
    echo "  https://vercel.com/dashboard"
else
    echo -e "${RED}✗ Deployment failed${NC}"
    echo ""
    echo "Please check the error messages above."
    exit 1
fi