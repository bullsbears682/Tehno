#!/data/data/com.termux/files/usr/bin/bash

echo "📱 CryptoFrame - Termux Setup Script"
echo "===================================="

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running on Termux
if [ ! -d "/data/data/com.termux" ]; then
    echo -e "${RED}❌ This script is designed for Termux only!${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Installing required packages...${NC}"

# Update packages
pkg update -y

# Install Node.js and dependencies
pkg install -y nodejs npm git python make clang

# Install MongoDB or SQLite
echo -e "${YELLOW}💾 Choose database:${NC}"
echo "1) MongoDB (recommended)"
echo "2) SQLite (lighter)"
read -p "Enter choice (1-2): " db_choice

if [ "$db_choice" = "1" ]; then
    pkg install -y mongodb
    echo -e "${GREEN}✅ MongoDB installed${NC}"
else
    pkg install -y sqlite
    echo -e "${GREEN}✅ SQLite installed${NC}"
fi

# Create Termux-specific environment file
echo -e "${BLUE}⚙️ Creating Termux configuration...${NC}"

cat > .env.termux << EOF
NODE_ENV=development
PORT=8080

# MongoDB for Termux
MONGODB_URI=mongodb://localhost:27017/cryptophotosite

# Wallet Configuration
MAIN_WALLET_ADDRESS=0x13322cc8958e50ed5363442352d0D1110C8768dA
ETHERSCAN_API_KEY=YourEtherscanAPIKeyHere

# Payment Configuration
PAYMENT_AMOUNT_ETH=0.001
PAYMENT_AMOUNT_USD=1

# Termux specific
CORS_ORIGIN=http://localhost:8080
TERMUX_MODE=true
EOF

# Create Termux startup script
cat > start-termux.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash

echo "🚀 Starting CryptoFrame on Termux"
echo "================================"

# Load environment variables
export $(cat .env.termux | xargs)

# Create uploads directory
mkdir -p uploads

# Check if MongoDB is running (if installed)
if command -v mongod &> /dev/null; then
    echo "📊 Starting MongoDB..."
    mongod --dbpath ~/mongodb-data --fork --logpath ~/mongodb.log --quiet || echo "MongoDB already running"
fi

# Start the application
echo "🎯 Starting CryptoFrame..."
echo "📱 Mobile optimized version"
echo "🌐 Access at: http://localhost:8080"
echo ""

# Run in development mode
npm run dev
EOF

chmod +x start-termux.sh

# Create MongoDB data directory if using MongoDB
if [ "$db_choice" = "1" ]; then
    mkdir -p ~/mongodb-data
fi

# Create Termux-optimized package.json scripts
echo -e "${BLUE}📝 Updating package.json for Termux...${NC}"

# Backup original package.json
cp package.json package.json.backup

# Update package.json with Termux-specific scripts
cat > package.json << 'EOF'
{
  "name": "crypto-photo-site-termux",
  "version": "1.0.0",
  "description": "A decentralized photo posting platform optimized for Termux",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "concurrently \"nodemon server.js\" \"npm run client\"",
    "client": "cd client && PORT=3001 npm start",
    "build": "cd client && npm run build",
    "install-client": "cd client && npm install",
    "termux": "./start-termux.sh",
    "setup-termux": "./termux-setup.sh"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "multer": "^1.4.5-lts.1",
    "mongoose": "^7.5.0",
    "web3": "^4.1.1",
    "ethers": "^6.7.1",
    "axios": "^1.5.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "uuid": "^9.0.0",
    "sharp": "^0.32.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "concurrently": "^8.2.0"
  },
  "engines": {
    "node": ">=16.0.0"
  },
  "termux": {
    "optimized": true,
    "port": 8080
  },
  "keywords": [
    "crypto",
    "web3",
    "photos",
    "blockchain",
    "ethereum",
    "termux",
    "mobile"
  ],
  "author": "CryptoFrame",
  "license": "MIT"
}
EOF

echo -e "${GREEN}✅ Termux setup complete!${NC}"
echo ""
echo -e "${BLUE}🚀 To start CryptoFrame on Termux:${NC}"
echo -e "${YELLOW}   ./start-termux.sh${NC}"
echo ""
echo -e "${BLUE}📱 Mobile-optimized features:${NC}"
echo "   • Lighter resource usage"
echo "   • Touch-friendly interface" 
echo "   • Optimized for mobile screens"
echo "   • Reduced memory footprint"
echo ""
echo -e "${BLUE}🌐 Access URLs:${NC}"
echo "   • Main app: http://localhost:8080"
echo "   • API: http://localhost:8080/api"
echo ""
echo -e "${GREEN}Happy crypto photo sharing on mobile! 📸✨${NC}"