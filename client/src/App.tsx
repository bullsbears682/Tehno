import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image, Coins, Users, TrendingUp, Upload, Grid, Heart, Eye, Clock } from 'lucide-react';
import PhotoUpload from './components/PhotoUpload';
import PhotoGallery from './components/PhotoGallery';
import StatsDisplay from './components/StatsDisplay';
import './App.css';

interface SiteStats {
  totalSlots: number;
  usedSlots: number;
  availableSlots: number;
  totalEarnings: number;
  recentPhotos: any[];
}

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'upload' | 'gallery'>('home');
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  };

  if (loading) {
    return (
      <div className="app loading">
        <motion.div 
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Camera size={48} />
        </motion.div>
        <p>Loading CryptoFrame...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <motion.div 
          className="header-content"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="logo">
            <Camera className="logo-icon" />
            <h1>CryptoFrame</h1>
            <span className="beta">BETA</span>
          </div>
          
          <nav className="nav">
            <button 
              className={currentView === 'home' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setCurrentView('home')}
            >
              <TrendingUp size={20} />
              Home
            </button>
            <button 
              className={currentView === 'upload' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setCurrentView('upload')}
            >
              <Upload size={20} />
              Upload
            </button>
            <button 
              className={currentView === 'gallery' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setCurrentView('gallery')}
            >
              <Grid size={20} />
              Gallery
            </button>
          </nav>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="main">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="page home-page"
            >
              {/* Hero Section */}
              <section className="hero">
                <motion.div 
                  className="hero-content"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <h2 className="hero-title">
                    Share Your Photos on the
                    <span className="gradient-text"> Blockchain</span>
                  </h2>
                  <p className="hero-subtitle">
                    Upload photos for just $1 in crypto. No wallet connection required. 
                    Only {stats?.availableSlots.toLocaleString()} slots remaining out of 1 million!
                  </p>
                  
                  <div className="hero-stats">
                    <div className="stat-card">
                      <Image className="stat-icon" />
                      <div className="stat-info">
                        <div className="stat-number">{stats?.usedSlots.toLocaleString()}</div>
                        <div className="stat-label">Photos Posted</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <Coins className="stat-icon" />
                      <div className="stat-info">
                        <div className="stat-number">${stats?.totalEarnings.toFixed(0)}</div>
                        <div className="stat-label">Total Value</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <Users className="stat-icon" />
                      <div className="stat-info">
                        <div className="stat-number">{stats?.availableSlots.toLocaleString()}</div>
                        <div className="stat-label">Slots Left</div>
                      </div>
                    </div>
                  </div>

                  <motion.button 
                    className="cta-button"
                    onClick={() => setCurrentView('upload')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Upload size={20} />
                    Upload Your Photo Now
                  </motion.button>
                </motion.div>
              </section>

              {/* Recent Photos Preview */}
              {stats?.recentPhotos && stats.recentPhotos.length > 0 && (
                <section className="recent-photos">
                  <h3>Latest Photos</h3>
                  <div className="photos-grid">
                    {stats.recentPhotos.slice(0, 6).map((photo, index) => (
                      <motion.div 
                        key={photo._id}
                        className="photo-preview"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <img src={`/uploads/${photo.filename}`} alt={`Slot #${photo.slotNumber}`} />
                        <div className="photo-overlay">
                          <div className="slot-number">#{photo.slotNumber}</div>
                          <div className="photo-stats">
                            <span><Heart size={14} /> {photo.likes}</span>
                            <span><Eye size={14} /> {photo.views}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <motion.button 
                    className="view-all-btn"
                    onClick={() => setCurrentView('gallery')}
                    whileHover={{ scale: 1.02 }}
                  >
                    View All Photos
                  </motion.button>
                </section>
              )}

              {/* Progress Bar */}
              <section className="progress-section">
                <h3>Platform Progress</h3>
                <div className="progress-container">
                  <div className="progress-bar">
                    <motion.div 
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${((stats?.usedSlots || 0) / (stats?.totalSlots || 1000000)) * 100}%` }}
                      transition={{ duration: 2, delay: 0.5 }}
                    />
                  </div>
                  <div className="progress-labels">
                    <span>0</span>
                    <span className="progress-current">
                      {stats?.usedSlots.toLocaleString()} / {stats?.totalSlots.toLocaleString()}
                    </span>
                    <span>1M</span>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {currentView === 'upload' && (
            <motion.div
              key="upload"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="page upload-page"
            >
              <PhotoUpload onSuccess={() => {
                fetchStats();
                setCurrentView('gallery');
              }} />
            </motion.div>
          )}

          {currentView === 'gallery' && (
            <motion.div
              key="gallery"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="page gallery-page"
            >
              <PhotoGallery />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>CryptoFrame</h4>
            <p>Decentralized photo sharing on the blockchain</p>
          </div>
          <div className="footer-section">
            <h4>How it works</h4>
            <ul>
              <li>Upload your photo</li>
              <li>Pay $1 in crypto</li>
              <li>Get your permanent slot</li>
              <li>Share with the world</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Stats</h4>
            <ul>
              <li>Total Slots: {stats?.totalSlots.toLocaleString()}</li>
              <li>Available: {stats?.availableSlots.toLocaleString()}</li>
              <li>Photos Posted: {stats?.usedSlots.toLocaleString()}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 CryptoFrame. Powered by Ethereum blockchain.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
