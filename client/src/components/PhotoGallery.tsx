import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Eye, Search, Filter, Grid, List, X, ExternalLink, Clock, Hash } from 'lucide-react';
import { playSound } from '../utils/sounds';
import './PhotoGallery.css';

interface Photo {
  _id: string;
  filename: string;
  slotNumber: number;
  uploadedAt: string;
  confirmedAt: string;
  views: number;
  likes: number;
  description?: string;
  tags?: string[];
}

interface GalleryResponse {
  photos: Photo[];
  totalPages: number;
  currentPage: number;
  total: number;
}

const PhotoGallery: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'slot'>('recent');
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastPhotoRef = useRef<HTMLDivElement | null>(null);

  // Fetch photos from API
  const fetchPhotos = useCallback(async (pageNum: number, reset = false) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/photos?page=${pageNum}&limit=20`);
      const data: GalleryResponse = await response.json();
      
      setPhotos(prev => reset ? data.photos : [...prev, ...data.photos]);
      setHasMore(pageNum < data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
      playSound.error();
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPhotos(1, true);
  }, [fetchPhotos]);

  // Infinite scroll setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchPhotos(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current = observer;

    if (lastPhotoRef.current) {
      observer.observe(lastPhotoRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fetchPhotos, page, hasMore, loading]);

  // Handle photo like
  const handleLike = async (photoId: string) => {
    try {
      const response = await fetch(`/api/photos/${photoId}/like`, {
        method: 'POST',
      });
      const data = await response.json();
      
      setPhotos(prev => 
        prev.map(photo => 
          photo._id === photoId 
            ? { ...photo, likes: data.likes }
            : photo
        )
      );
      
      setLikedPhotos(prev => new Set(prev).add(photoId));
      playSound.click();
    } catch (error) {
      console.error('Failed to like photo:', error);
      playSound.error();
    }
  };

  // Handle photo view
  const handleView = async (photo: Photo) => {
    try {
      await fetch(`/api/photos/${photo._id}/view`, {
        method: 'POST',
      });
      
      setPhotos(prev => 
        prev.map(p => 
          p._id === photo._id 
            ? { ...p, views: p.views + 1 }
            : p
        )
      );
      
      setSelectedPhoto(photo);
      playSound.click();
    } catch (error) {
      console.error('Failed to record view:', error);
    }
  };

  // Filter and sort photos
  const filteredPhotos = photos
    .filter(photo => 
      searchTerm === '' || 
      photo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      photo.slotNumber.toString().includes(searchTerm)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.likes + b.views) - (a.likes + a.views);
        case 'slot':
          return a.slotNumber - b.slotNumber;
        case 'recent':
        default:
          return new Date(b.confirmedAt).getTime() - new Date(a.confirmedAt).getTime();
      }
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="photo-gallery">
      {/* Gallery Header */}
      <div className="gallery-header">
        <div className="gallery-title">
          <h2>Photo Gallery</h2>
          <p>{photos.length.toLocaleString()} photos on the blockchain</p>
        </div>

        {/* Search and Filters */}
        <div className="gallery-controls">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search photos, descriptions, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              onMouseEnter={() => playSound.hover()}
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="slot">Slot Number</option>
            </select>

            <div className="view-toggle">
              <button
                className={viewMode === 'grid' ? 'active' : ''}
                onClick={() => {
                  setViewMode('grid');
                  playSound.click();
                }}
                onMouseEnter={() => playSound.hover()}
              >
                <Grid size={18} />
              </button>
              <button
                className={viewMode === 'list' ? 'active' : ''}
                onClick={() => {
                  setViewMode('list');
                  playSound.click();
                }}
                onMouseEnter={() => playSound.hover()}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      <div className={`photos-container ${viewMode}`}>
        <AnimatePresence>
          {filteredPhotos.map((photo, index) => (
            <motion.div
              key={photo._id}
              ref={index === filteredPhotos.length - 1 ? lastPhotoRef : null}
              className="photo-card"
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => handleView(photo)}
            >
              <div className="photo-image-container">
                <img
                  src={`/uploads/${photo.filename}`}
                  alt={`Slot #${photo.slotNumber}`}
                  loading="lazy"
                />
                <div className="photo-overlay">
                  <div className="slot-badge">#{photo.slotNumber}</div>
                  <div className="photo-actions">
                    <button
                      className={`like-button ${likedPhotos.has(photo._id) ? 'liked' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(photo._id);
                      }}
                      onMouseEnter={() => playSound.hover()}
                    >
                      <Heart size={16} />
                      {photo.likes}
                    </button>
                    <div className="view-count">
                      <Eye size={16} />
                      {photo.views}
                    </div>
                  </div>
                </div>
              </div>

              {viewMode === 'list' && (
                <div className="photo-info">
                  <h3>Slot #{photo.slotNumber}</h3>
                  {photo.description && (
                    <p className="photo-description">{photo.description}</p>
                  )}
                  {photo.tags && photo.tags.length > 0 && (
                    <div className="photo-tags">
                      {photo.tags.map((tag, idx) => (
                        <span key={idx} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="photo-meta">
                    <span className="upload-date">
                      <Clock size={14} />
                      {formatDate(photo.confirmedAt)}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="loading-indicator">
            <motion.div
              className="loading-spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Hash size={32} />
            </motion.div>
            <p>Loading more photos...</p>
          </div>
        )}

        {!hasMore && photos.length > 0 && (
          <div className="end-message">
            <p>🎉 You've reached the end! All {photos.length} photos loaded.</p>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className="photo-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSelectedPhoto(null);
              playSound.click();
            }}
          >
            <motion.div
              className="photo-modal"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="modal-close"
                onClick={() => {
                  setSelectedPhoto(null);
                  playSound.click();
                }}
                onMouseEnter={() => playSound.hover()}
              >
                <X size={24} />
              </button>

              <div className="modal-content">
                <div className="modal-image">
                  <img
                    src={`/uploads/${selectedPhoto.filename}`}
                    alt={`Slot #${selectedPhoto.slotNumber}`}
                  />
                </div>

                <div className="modal-info">
                  <div className="modal-header">
                    <h2>Slot #{selectedPhoto.slotNumber}</h2>
                    <div className="modal-stats">
                      <button
                        className={`like-button ${likedPhotos.has(selectedPhoto._id) ? 'liked' : ''}`}
                        onClick={() => handleLike(selectedPhoto._id)}
                        onMouseEnter={() => playSound.hover()}
                      >
                        <Heart size={18} />
                        {selectedPhoto.likes}
                      </button>
                      <div className="view-count">
                        <Eye size={18} />
                        {selectedPhoto.views}
                      </div>
                    </div>
                  </div>

                  {selectedPhoto.description && (
                    <div className="modal-description">
                      <h3>Description</h3>
                      <p>{selectedPhoto.description}</p>
                    </div>
                  )}

                  {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                    <div className="modal-tags">
                      <h3>Tags</h3>
                      <div className="tag-list">
                        {selectedPhoto.tags.map((tag, idx) => (
                          <span key={idx} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="modal-metadata">
                    <h3>Details</h3>
                    <div className="metadata-grid">
                      <div className="metadata-item">
                        <label>Slot Number:</label>
                        <span>#{selectedPhoto.slotNumber}</span>
                      </div>
                      <div className="metadata-item">
                        <label>Uploaded:</label>
                        <span>{formatDate(selectedPhoto.confirmedAt)}</span>
                      </div>
                      <div className="metadata-item">
                        <label>Views:</label>
                        <span>{selectedPhoto.views.toLocaleString()}</span>
                      </div>
                      <div className="metadata-item">
                        <label>Likes:</label>
                        <span>{selectedPhoto.likes.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    className="blockchain-link"
                    onClick={() => {
                      playSound.blockchain();
                      // In a real app, this would link to blockchain explorer
                      window.open(`https://etherscan.io/`, '_blank');
                    }}
                    onMouseEnter={() => playSound.hover()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ExternalLink size={16} />
                    View on Blockchain
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoGallery;