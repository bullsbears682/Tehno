#!/data/data/com.termux/files/usr/bin/bash

echo "🚀 Starting CryptoFrame on Termux"
echo "================================"

# Colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables if .env.termux exists
if [ -f ".env.termux" ]; then
    echo -e "${BLUE}📋 Loading Termux configuration...${NC}"
    export $(cat .env.termux | xargs)
else
    echo -e "${YELLOW}⚠️ .env.termux not found, using defaults${NC}"
    export PORT=8080
    export MAIN_WALLET_ADDRESS=0x13322cc8958e50ed5363442352d0D1110C8768dA
fi

# Create uploads directory
mkdir -p uploads

# Check if MongoDB is installed and running
if command -v mongod &> /dev/null; then
    echo -e "${BLUE}📊 Starting MongoDB...${NC}"
    # Create MongoDB data directory if it doesn't exist
    mkdir -p ~/mongodb-data
    
    # Start MongoDB in background
    if ! pgrep mongod > /dev/null; then
        mongod --dbpath ~/mongodb-data --fork --logpath ~/mongodb.log --quiet 2>/dev/null || echo -e "${YELLOW}MongoDB may already be running${NC}"
    else
        echo -e "${GREEN}✅ MongoDB already running${NC}"
    fi
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    npm install --silent
fi

if [ ! -d "client/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    cd client && npm install --silent && cd ..
fi

echo ""
echo -e "${GREEN}🎯 Starting CryptoFrame...${NC}"
echo -e "${BLUE}📱 Mobile optimized version${NC}"
echo -e "${BLUE}🌐 Access at: http://localhost:${PORT:-8080}${NC}"
echo -e "${BLUE}💳 Payment Address: ${MAIN_WALLET_ADDRESS}${NC}"
echo ""
echo -e "${GREEN}Features enabled:${NC}"
echo "   ✅ Beautiful UI with sound effects"
echo "   ✅ Crypto payments (QR codes + manual)"
echo "   ✅ Photo gallery with infinite scroll"
echo "   ✅ Real-time blockchain monitoring"
echo "   ✅ Mobile-optimized interface"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Start the application in development mode
npm run dev