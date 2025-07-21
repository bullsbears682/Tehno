# 🚀 CryptoFrame - Blockchain Photo Sharing Platform

A beautiful, modern crypto photo sharing platform where users can upload photos for $1 in cryptocurrency. Built with React, Node.js, and Web3 integration.

## ✨ Features

### 🎨 Beautiful UI/UX
- **Modern gradient design** with glassmorphism effects
- **Smooth animations** powered by Framer Motion
- **Interactive sound effects** for enhanced user experience
- **Responsive design** that works on all devices
- **Dark theme** with beautiful color schemes

### 💰 Crypto Payments
- **No wallet connection required** - users can pay via QR code or manual transfer
- **Multiple payment methods**: QR codes, copy-paste addresses, transaction verification
- **Real-time payment detection** and confirmation
- **Automatic blockchain monitoring** for incoming transactions
- **Transaction hash verification** for instant confirmation

### 📸 Photo Management
- **Drag & drop upload** with preview
- **Image optimization** and compression
- **1 million slot limit** with progress tracking
- **Photo descriptions and tags** support
- **Like and view tracking**
- **Infinite scroll gallery** with search and filters

### 🔊 Sound Effects
- **Interactive audio feedback** for all user actions
- **Beautiful confirmation sounds** and error notifications
- **Hover effects** with subtle audio cues
- **Blockchain-themed sounds** for crypto transactions

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Framer Motion** for animations
- **Lucide React** for icons
- **Web Audio API** for sound effects
- **QR Code generation** for payments

### Backend
- **Node.js** with Express
- **MongoDB** for data storage
- **Ethers.js** for blockchain interaction
- **Sharp** for image processing
- **Multer** for file uploads

### Blockchain
- **Ethereum** mainnet integration
- **Etherscan API** for transaction verification
- **Web3** payment processing

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Etherscan API key (optional)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd crypto-photo-site
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd client
npm install
cd ..
```

4. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cryptophotosite
MAIN_WALLET_ADDRESS=0x13322cc8958e50ed5363442352d0D1110C8768dA
ETHERSCAN_API_KEY=YourEtherscanAPIKeyHere
PAYMENT_AMOUNT_ETH=0.001
CORS_ORIGIN=http://localhost:3000
```

5. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

6. **Run the application**
```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or run separately:
# Backend
npm start

# Frontend (in another terminal)
cd client && npm start
```

7. **Open your browser**
Navigate to `http://localhost:3000`

## 💳 Payment Configuration

### Wallet Setup
The platform uses the wallet address: `0x13322cc8958e50ed5363442352d0D1110C8768dA`

### Payment Process
1. **Upload Photo**: Users select and upload their photo
2. **Payment Screen**: QR code and manual payment options are displayed
3. **Send Payment**: Users send 0.001 ETH (~$1) to the provided address
4. **Automatic Detection**: System monitors the blockchain for incoming payments
5. **Confirmation**: Once confirmed, the photo goes live with a unique slot number

### Payment Methods
- **QR Code**: Scan with any Ethereum wallet
- **Manual Transfer**: Copy address and send payment manually
- **Transaction Verification**: Paste transaction hash for instant confirmation

## 🎵 Sound Effects

The platform includes beautiful sound effects for:
- **Upload actions** - Ascending tones
- **Payment processing** - Gentle pulses
- **Success confirmations** - Triumphant melodies
- **Error notifications** - Descending tones
- **Button interactions** - Subtle clicks and hovers
- **Blockchain events** - Futuristic digital sounds

Sounds can be enabled/disabled and are built using the Web Audio API.

## 🖼️ Photo Gallery Features

- **Grid and List views** with smooth transitions
- **Search functionality** by description, tags, or slot number
- **Sorting options**: Recent, Popular, Slot Number
- **Infinite scroll** for seamless browsing
- **Photo modal** with detailed information
- **Like and view tracking**
- **Blockchain explorer links**

## 📱 Responsive Design

- **Mobile-first approach**
- **Touch-friendly interactions**
- **Optimized layouts** for all screen sizes
- **Progressive Web App** features
- **Fast loading** with image optimization

## 🔒 Security Features

- **Input validation** and sanitization
- **Rate limiting** for API endpoints
- **Image processing** and optimization
- **Secure file uploads**
- **Environment variable protection**

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd client
npm run build
cd ..

# Start production server
NODE_ENV=production npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
MAIN_WALLET_ADDRESS=0x13322cc8958e50ed5363442352d0D1110C8768dA
ETHERSCAN_API_KEY=your_etherscan_api_key
PAYMENT_AMOUNT_ETH=0.001
CORS_ORIGIN=https://yourdomain.com
```

## 🛠️ Development

### Project Structure
```
crypto-photo-site/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── utils/         # Utility functions (sounds, etc.)
│   │   └── App.tsx        # Main app component
├── uploads/               # Uploaded photos storage
├── server.js              # Express backend
├── package.json           # Backend dependencies
└── README.md             # This file
```

### Available Scripts

**Backend:**
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload

**Frontend:**
- `npm run client` - Start React development server
- `npm run build` - Build production frontend
- `npm run install-client` - Install frontend dependencies

## 🎯 Features Roadmap

### Completed ✅
- Beautiful UI with animations and sound effects
- Crypto payment integration without wallet connection
- Photo upload and gallery system
- Real-time payment monitoring
- Responsive design
- Search and filtering
- Like and view tracking

### Future Enhancements 🚀
- **IPFS Integration** - Decentralized photo storage
- **NFT Minting** - Convert photos to NFTs
- **Multiple Cryptocurrencies** - Bitcoin, USDC, etc.
- **User Profiles** - Account system and photo management
- **Social Features** - Comments, sharing, following
- **Mobile App** - React Native version
- **Advanced Analytics** - Photo performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 🙏 Acknowledgments

- **Framer Motion** for beautiful animations
- **Lucide React** for amazing icons
- **Ethers.js** for blockchain integration
- **React** and **Node.js** communities
- **Web Audio API** for sound capabilities

---

**Made with ❤️ and ☕ for the crypto community**

*Enjoy sharing your photos on the blockchain! 🚀*