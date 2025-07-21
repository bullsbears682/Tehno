# 📱 CryptoFrame on Termux - Complete Setup Guide

Run your crypto photo sharing platform directly on Android using Termux!

## 🚀 **Quick Start (TL;DR)**

```bash
# 1. Install Termux from F-Droid (recommended) or Google Play
# 2. Open Termux and run:
pkg update && pkg upgrade
pkg install nodejs npm git
git clone https://github.com/bullsbears682/Tehno.git
cd Tehno
chmod +x termux-setup.sh
./termux-setup.sh
./start-termux.sh
```

## 📋 **Detailed Setup Instructions**

### **Step 1: Install Termux**

**Option A: F-Droid (Recommended)**
1. Download F-Droid APK from [f-droid.org](https://f-droid.org)
2. Install F-Droid
3. Search and install "Termux" from F-Droid

**Option B: Google Play Store**
1. Search for "Termux" in Play Store
2. Install Termux by Fredrik Fornwall

### **Step 2: Initial Termux Setup**

```bash
# Update package repositories
pkg update && pkg upgrade

# Install essential packages
pkg install nodejs npm git python make clang

# Optional: Install storage access
termux-setup-storage
```

### **Step 3: Clone and Setup CryptoFrame**

```bash
# Clone the repository
git clone https://github.com/bullsbears682/Tehno.git
cd Tehno

# Make setup script executable
chmod +x termux-setup.sh

# Run the Termux setup script
./termux-setup.sh
```

### **Step 4: Database Setup**

**Option A: MongoDB (Recommended)**
```bash
# MongoDB will be installed by the setup script
# Create data directory
mkdir -p ~/mongodb-data

# Start MongoDB
mongod --dbpath ~/mongodb-data --fork --logpath ~/mongodb.log
```

**Option B: SQLite (Lighter)**
```bash
# SQLite is lighter and automatically handled
# No additional setup required
```

### **Step 5: Start the Application**

```bash
# Start CryptoFrame
./start-termux.sh

# Or manually:
npm run termux
```

## 🌐 **Accessing Your App**

Once started, access your crypto photo platform at:
- **Main App**: `http://localhost:8080`
- **API Endpoints**: `http://localhost:8080/api`

## 📱 **Mobile-Optimized Features**

### **Performance Optimizations**
- ✅ Reduced animations for better performance
- ✅ Optimized image loading and processing
- ✅ Lighter database options (SQLite)
- ✅ Reduced memory footprint
- ✅ Touch-friendly interface

### **Mobile UI Enhancements**
- ✅ Larger touch targets (44px minimum)
- ✅ Optimized text sizes for mobile screens
- ✅ Single-column photo grid for small screens
- ✅ Full-screen modals
- ✅ Touch gestures support

### **Network Optimizations**
- ✅ Reduced API calls
- ✅ Optimized image compression
- ✅ Efficient blockchain monitoring
- ✅ Cached responses

## 🔧 **Termux-Specific Configuration**

### **Environment Variables (.env.termux)**
```env
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://localhost:27017/cryptophotosite
MAIN_WALLET_ADDRESS=0x13322cc8958e50ed5363442352d0D1110C8768dA
PAYMENT_AMOUNT_ETH=0.001
CORS_ORIGIN=http://localhost:8080
TERMUX_MODE=true
```

### **Package.json Modifications**
- Modified scripts for Termux compatibility
- Optimized dependencies for mobile
- Added Termux-specific configurations

## 🎯 **Available Commands**

```bash
# Start the application
./start-termux.sh

# Alternative start methods
npm run termux
npm run dev

# Development commands
npm start              # Backend only
npm run client         # Frontend only
npm run build          # Production build

# Maintenance
npm run setup-termux   # Re-run setup
```

## 📊 **Resource Usage**

### **Minimum Requirements**
- **RAM**: 2GB (4GB recommended)
- **Storage**: 500MB for app + 1GB for photos
- **Android**: 7.0+ (API level 24+)
- **CPU**: Any ARM64 or x86_64

### **Performance Tips**
```bash
# Reduce memory usage
export NODE_OPTIONS="--max-old-space-size=1024"

# Use SQLite instead of MongoDB for lighter setup
# Choose option 2 during setup

# Clear Termux cache periodically
pkg clean
```

## 🔒 **Security Considerations**

### **Network Security**
- App runs on localhost only by default
- No external network exposure unless configured
- CORS protection enabled

### **File Permissions**
```bash
# Secure uploaded photos directory
chmod 755 uploads/
chmod 644 uploads/*

# Secure environment files
chmod 600 .env.termux
```

## 🛠️ **Troubleshooting**

### **Common Issues**

**1. Node.js Installation Fails**
```bash
pkg update
pkg upgrade
pkg install nodejs-lts
```

**2. MongoDB Won't Start**
```bash
# Check if data directory exists
ls ~/mongodb-data

# Create if missing
mkdir -p ~/mongodb-data

# Start with verbose logging
mongod --dbpath ~/mongodb-data --logpath ~/mongodb.log --verbose
```

**3. Port Already in Use**
```bash
# Kill processes on port 8080
pkill -f "node.*8080"

# Or use different port
export PORT=8081
```

**4. Memory Issues**
```bash
# Reduce Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=512"

# Use SQLite instead of MongoDB
# Choose option 2 during setup
```

**5. Sharp (Image Processing) Issues**
```bash
# Install Sharp dependencies
pkg install vips

# Or disable Sharp optimization
# Edit server.js and comment out Sharp usage
```

### **Performance Issues**

**Slow Loading**
```bash
# Reduce image quality in server.js
# Change quality from 85 to 60
.webp({ quality: 60 })

# Disable sound effects
# Set ENABLE_SOUNDS=false in environment
```

**High Battery Usage**
```bash
# Reduce background monitoring
# Increase interval in server.js from 30s to 60s
setInterval(async () => {
    // ... payment monitoring
}, 60000); // 60 seconds
```

## 🔄 **Updates and Maintenance**

### **Updating CryptoFrame**
```bash
# Pull latest changes
git pull origin main

# Reinstall dependencies
npm install
cd client && npm install && cd ..

# Restart application
./start-termux.sh
```

### **Database Maintenance**
```bash
# MongoDB cleanup
mongo cryptophotosite --eval "db.runCommand({compact: 'photos'})"

# SQLite cleanup (if using SQLite)
sqlite3 database.db "VACUUM;"
```

### **Log Management**
```bash
# View application logs
tail -f ~/mongodb.log

# Clear old logs
> ~/mongodb.log
```

## 🌟 **Advanced Configuration**

### **Custom Domain (Local Network)**
```bash
# Edit .env.termux
CORS_ORIGIN=http://192.168.1.100:8080

# Find your IP address
ifconfig wlan0
```

### **External Access (Caution!)**
```bash
# Only do this if you understand the security implications
# Edit server.js to bind to 0.0.0.0 instead of localhost

# Add firewall rules if needed
# This allows access from other devices on your network
```

### **SSL/HTTPS Setup**
```bash
# Generate self-signed certificate
pkg install openssl
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Modify server.js to use HTTPS
# Add SSL configuration
```

## 📈 **Monitoring and Analytics**

### **Performance Monitoring**
```bash
# Monitor resource usage
top

# Check memory usage
free -h

# Monitor network
netstat -tulpn | grep :8080
```

### **Application Logs**
```bash
# View real-time logs
tail -f ~/mongodb.log

# Application debug logs
DEBUG=* npm run termux
```

## 🎉 **Success! Your Mobile Crypto Photo Platform**

Once everything is set up, you'll have:

✅ **Full crypto photo sharing platform** running on your phone  
✅ **Beautiful mobile-optimized UI** with touch support  
✅ **Sound effects and animations** (optimized for mobile)  
✅ **QR code crypto payments** - no wallet connection needed  
✅ **1 million photo slots** with progress tracking  
✅ **Real-time blockchain monitoring**  
✅ **Infinite scroll photo gallery**  
✅ **Search and filtering capabilities**  

## 🆘 **Support**

If you encounter issues:

1. **Check the logs**: `tail -f ~/mongodb.log`
2. **Restart Termux**: Close and reopen the app
3. **Clear cache**: `pkg clean && npm cache clean --force`
4. **Reinstall**: Run `./termux-setup.sh` again

## 🚀 **Next Steps**

- **Customize the UI** colors and branding
- **Add more cryptocurrencies** for payments  
- **Set up external access** for friends to use
- **Deploy to a VPS** for permanent hosting
- **Add push notifications** for payment confirmations

---

**Enjoy running your own crypto photo sharing platform on your phone! 📱✨**

*Made with ❤️ for the mobile crypto community*