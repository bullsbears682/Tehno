#!/bin/bash

echo "🚀 Starting CryptoFrame - Blockchain Photo Sharing Platform"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if MongoDB is running (optional)
echo "📦 Checking dependencies..."

# Install backend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    npm install
fi

# Install frontend dependencies if needed
if [ ! -d "client/node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    cd client && npm install && cd ..
fi

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    echo "📁 Creating uploads directory..."
    mkdir uploads
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp .env .env.example 2>/dev/null || echo "Please create a .env file with your configuration."
fi

echo "✅ All dependencies ready!"
echo ""
echo "🎯 Starting the application..."
echo "   Backend: http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo ""
echo "🎵 Features included:"
echo "   • Beautiful UI with sound effects"
echo "   • Crypto payments (no wallet connection needed)"
echo "   • Photo gallery with infinite scroll"
echo "   • Real-time payment monitoring"
echo ""
echo "💳 Payment Address: 0x13322cc8958e50ed5363442352d0D1110C8768dA"
echo ""

# Start the application in development mode
npm run dev