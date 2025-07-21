const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { ethers } = require('ethers');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('client/build'));
app.use('/uploads', express.static('uploads'));

// Create uploads directory
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cryptophotosite', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Photo Schema
const photoSchema = new mongoose.Schema({
    filename: String,
    originalName: String,
    paymentAddress: String,
    paymentAmount: Number,
    paymentStatus: { type: String, default: 'pending' }, // pending, confirmed, expired
    transactionHash: String,
    uploadedAt: { type: Date, default: Date.now },
    confirmedAt: Date,
    slotNumber: Number,
    description: String,
    tags: [String],
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
});

const Photo = mongoose.model('Photo', photoSchema);

// Site stats schema
const statsSchema = new mongoose.Schema({
    totalSlots: { type: Number, default: 1000000 },
    usedSlots: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
});

const Stats = mongoose.model('Stats', statsSchema);

// Initialize stats
Stats.findOne().then(stats => {
    if (!stats) {
        new Stats().save();
    }
});

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Generate unique payment address - using main wallet for simplicity
function generatePaymentAddress() {
    const mainWallet = process.env.MAIN_WALLET_ADDRESS || '0x13322cc8958e50ed5363442352d0D1110C8768dA';
    return {
        address: mainWallet,
        privateKey: null, // We don't need private key for receiving
    };
}

// Check transaction status on blockchain
async function checkTransactionStatus(address, expectedAmount) {
    try {
        const response = await axios.get(`https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${process.env.ETHERSCAN_API_KEY}`);
        const balance = parseFloat(ethers.formatEther(response.data.result));
        return balance >= expectedAmount;
    } catch (error) {
        console.error('Error checking transaction:', error);
        return false;
    }
}

// Routes

// Get site statistics
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await Stats.findOne();
        const recentPhotos = await Photo.find({ paymentStatus: 'confirmed' })
            .sort({ confirmedAt: -1 })
            .limit(12)
            .select('filename slotNumber uploadedAt views likes');
        
        res.json({
            ...stats.toObject(),
            recentPhotos,
            availableSlots: stats.totalSlots - stats.usedSlots,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Get all confirmed photos with pagination
app.get('/api/photos', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const photos = await Photo.find({ paymentStatus: 'confirmed' })
            .sort({ confirmedAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('filename slotNumber uploadedAt views likes description tags');
        
        const total = await Photo.countDocuments({ paymentStatus: 'confirmed' });
        
        res.json({
            photos,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch photos' });
    }
});

// Initiate photo upload and payment
app.post('/api/upload/initiate', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No photo uploaded' });
        }

        // Check if slots are available
        const stats = await Stats.findOne();
        if (stats.usedSlots >= stats.totalSlots) {
            return res.status(400).json({ error: 'All slots are taken!' });
        }

        // Generate unique filename
        const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.webp`;
        
        // Process and save image
        await sharp(req.file.buffer)
            .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 85 })
            .toFile(path.join('uploads', filename));

        // Generate payment address
        const paymentInfo = generatePaymentAddress();
        
        // Create photo record
        const photo = new Photo({
            filename,
            originalName: req.file.originalname,
            paymentAddress: paymentInfo.address,
            paymentAmount: 0.001, // ~$1 worth of ETH (adjust based on current price)
            description: req.body.description || '',
            tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
        });

        await photo.save();

        res.json({
            photoId: photo._id,
            paymentAddress: paymentInfo.address,
            paymentAmount: photo.paymentAmount,
            qrCodeData: `ethereum:${paymentInfo.address}?value=${ethers.parseEther(photo.paymentAmount.toString())}`,
            filename,
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to process upload' });
    }
});

// Check payment status
app.get('/api/payment/status/:photoId', async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.photoId);
        if (!photo) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        // If already confirmed, return status
        if (photo.paymentStatus === 'confirmed') {
            return res.json({ 
                status: 'confirmed', 
                slotNumber: photo.slotNumber,
                transactionHash: photo.transactionHash 
            });
        }

        // Check blockchain for payment
        const isPaid = await checkTransactionStatus(photo.paymentAddress, photo.paymentAmount);
        
        if (isPaid && photo.paymentStatus === 'pending') {
            // Update stats and assign slot number
            const stats = await Stats.findOne();
            const slotNumber = stats.usedSlots + 1;
            
            photo.paymentStatus = 'confirmed';
            photo.confirmedAt = new Date();
            photo.slotNumber = slotNumber;
            await photo.save();

            // Update stats
            stats.usedSlots += 1;
            stats.totalEarnings += photo.paymentAmount;
            stats.lastUpdated = new Date();
            await stats.save();

            return res.json({ 
                status: 'confirmed', 
                slotNumber,
                message: `Congratulations! Your photo is now live at slot #${slotNumber}` 
            });
        }

        res.json({ status: photo.paymentStatus });
    } catch (error) {
        console.error('Payment check error:', error);
        res.status(500).json({ error: 'Failed to check payment status' });
    }
});

// Manual transaction hash verification
app.post('/api/payment/verify', async (req, res) => {
    try {
        const { photoId, transactionHash } = req.body;
        
        const photo = await Photo.findById(photoId);
        if (!photo) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        if (photo.paymentStatus === 'confirmed') {
            return res.json({ 
                status: 'already_confirmed', 
                slotNumber: photo.slotNumber 
            });
        }

        // Verify transaction on blockchain
        try {
            const response = await axios.get(`https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${transactionHash}&apikey=${process.env.ETHERSCAN_API_KEY}`);
            const tx = response.data.result;
            
            if (tx && tx.to.toLowerCase() === photo.paymentAddress.toLowerCase()) {
                const value = parseFloat(ethers.formatEther(tx.value));
                if (value >= photo.paymentAmount) {
                    // Confirm payment
                    const stats = await Stats.findOne();
                    const slotNumber = stats.usedSlots + 1;
                    
                    photo.paymentStatus = 'confirmed';
                    photo.confirmedAt = new Date();
                    photo.slotNumber = slotNumber;
                    photo.transactionHash = transactionHash;
                    await photo.save();

                    // Update stats
                    stats.usedSlots += 1;
                    stats.totalEarnings += photo.paymentAmount;
                    await stats.save();

                    return res.json({ 
                        status: 'confirmed', 
                        slotNumber,
                        message: `Payment verified! Your photo is now live at slot #${slotNumber}` 
                    });
                }
            }
        } catch (verifyError) {
            console.error('Transaction verification error:', verifyError);
        }

        res.json({ status: 'invalid_transaction' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Failed to verify transaction' });
    }
});

// Like a photo
app.post('/api/photos/:id/like', async (req, res) => {
    try {
        const photo = await Photo.findByIdAndUpdate(
            req.params.id,
            { $inc: { likes: 1 } },
            { new: true }
        );
        res.json({ likes: photo.likes });
    } catch (error) {
        res.status(500).json({ error: 'Failed to like photo' });
    }
});

// View a photo (increment views)
app.post('/api/photos/:id/view', async (req, res) => {
    try {
        await Photo.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update views' });
    }
});

// Serve React app
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📸 Crypto Photo Site is live!`);
});

// Background job to check pending payments
setInterval(async () => {
    try {
        const pendingPhotos = await Photo.find({ 
            paymentStatus: 'pending',
            uploadedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Only check photos from last 24 hours
        });

        for (const photo of pendingPhotos) {
            const isPaid = await checkTransactionStatus(photo.paymentAddress, photo.paymentAmount);
            if (isPaid) {
                const stats = await Stats.findOne();
                const slotNumber = stats.usedSlots + 1;
                
                photo.paymentStatus = 'confirmed';
                photo.confirmedAt = new Date();
                photo.slotNumber = slotNumber;
                await photo.save();

                stats.usedSlots += 1;
                stats.totalEarnings += photo.paymentAmount;
                await stats.save();

                console.log(`✅ Photo ${photo._id} confirmed at slot #${slotNumber}`);
            }
        }
    } catch (error) {
        console.error('Background payment check error:', error);
    }
}, 30000); // Check every 30 seconds