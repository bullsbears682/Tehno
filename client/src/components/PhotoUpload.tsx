import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, QrCode, Copy, Check, AlertCircle, Loader, CreditCard, Hash, ExternalLink } from 'lucide-react';
import QRCode from 'react-qr-code';
import axios from 'axios';
import './PhotoUpload.css';

interface PhotoUploadProps {
  onSuccess: () => void;
}

interface PaymentInfo {
  photoId: string;
  paymentAddress: string;
  paymentAmount: number;
  qrCodeData: string;
  filename: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onSuccess }) => {
  const [step, setStep] = useState<'upload' | 'payment' | 'confirmation'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'confirmed' | 'checking'>('pending');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fixed wallet address for receiving payments
  const MAIN_WALLET = '0x13322cc8958e50ed5363442352d0D1110C8768dA';

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    } else {
      setError('Please select a valid image file');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, [handleFileSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const initiateUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('description', description);
      formData.append('tags', tags);

      const response = await axios.post('/api/upload/initiate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPaymentInfo(response.data);
      setStep('payment');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const checkPaymentStatus = async () => {
    if (!paymentInfo) return;

    setPaymentStatus('checking');
    try {
      const response = await axios.get(`/api/payment/status/${paymentInfo.photoId}`);
      if (response.data.status === 'confirmed') {
        setPaymentStatus('confirmed');
        setStep('confirmation');
        setTimeout(onSuccess, 2000);
      } else {
        setPaymentStatus('pending');
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
      setPaymentStatus('pending');
    }
  };

  const verifyTransaction = async () => {
    if (!transactionHash || !paymentInfo) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/payment/verify', {
        photoId: paymentInfo.photoId,
        transactionHash
      });

      if (response.data.status === 'confirmed') {
        setPaymentStatus('confirmed');
        setStep('confirmation');
        setTimeout(onSuccess, 2000);
      } else {
        setError('Transaction not found or invalid. Please check the hash and try again.');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to verify transaction');
    } finally {
      setLoading(false);
    }
  };

  const resetUpload = () => {
    setStep('upload');
    setSelectedFile(null);
    setPreview(null);
    setDescription('');
    setTags('');
    setPaymentInfo(null);
    setError('');
    setTransactionHash('');
    setPaymentStatus('pending');
  };

  return (
    <div className="photo-upload">
      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="upload-step"
          >
            <div className="upload-header">
              <h2>Upload Your Photo</h2>
              <p>Share your moment on the blockchain for just $1</p>
            </div>

            <div
              className={`upload-zone ${selectedFile ? 'has-file' : ''}`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {preview ? (
                <div className="preview-container">
                  <img src={preview} alt="Preview" className="preview-image" />
                  <div className="preview-overlay">
                    <Upload size={24} />
                    <span>Click to change photo</span>
                  </div>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <Image size={48} />
                  <h3>Drop your photo here</h3>
                  <p>or click to browse</p>
                  <span className="supported-formats">Supports: JPG, PNG, GIF, WebP</span>
                </div>
              )}
            </div>

            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="upload-details"
              >
                <div className="input-group">
                  <label>Description (optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us about your photo..."
                    maxLength={500}
                  />
                  <span className="char-count">{description.length}/500</span>
                </div>

                <div className="input-group">
                  <label>Tags (optional)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="nature, photography, sunset..."
                  />
                </div>

                <motion.button
                  className="proceed-button"
                  onClick={initiateUpload}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <Loader className="spinning" size={20} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      Proceed to Payment
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="error-message"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}
          </motion.div>
        )}

        {step === 'payment' && paymentInfo && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="payment-step"
          >
            <div className="payment-header">
              <h2>Complete Payment</h2>
              <p>Send exactly <strong>0.001 ETH (~$1)</strong> to secure your slot</p>
            </div>

            <div className="payment-methods">
              <div className="payment-card qr-payment">
                <h3>
                  <QrCode size={20} />
                  Scan QR Code
                </h3>
                <div className="qr-container">
                  <QRCode
                    value={`ethereum:${MAIN_WALLET}?value=1000000000000000`}
                    size={200}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                </div>
                <p className="qr-instruction">Scan with any Ethereum wallet</p>
              </div>

              <div className="payment-divider">
                <span>OR</span>
              </div>

              <div className="payment-card manual-payment">
                <h3>
                  <Copy size={20} />
                  Manual Transfer
                </h3>
                
                <div className="payment-details">
                  <div className="detail-row">
                    <label>Wallet Address:</label>
                    <div className="copyable-field">
                      <code>{MAIN_WALLET}</code>
                      <button
                        className="copy-button"
                        onClick={() => copyToClipboard(MAIN_WALLET)}
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="detail-row">
                    <label>Amount:</label>
                    <div className="copyable-field">
                      <code>0.001 ETH</code>
                      <button
                        className="copy-button"
                        onClick={() => copyToClipboard('0.001')}
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="detail-row">
                    <label>Network:</label>
                    <span className="network-badge">Ethereum Mainnet</span>
                  </div>
                </div>

                <div className="transaction-verify">
                  <h4>Already sent? Verify your transaction:</h4>
                  <div className="verify-input">
                    <input
                      type="text"
                      placeholder="Enter transaction hash (0x...)"
                      value={transactionHash}
                      onChange={(e) => setTransactionHash(e.target.value)}
                    />
                    <button
                      className="verify-button"
                      onClick={verifyTransaction}
                      disabled={!transactionHash || loading}
                    >
                      {loading ? <Loader className="spinning" size={16} /> : <Hash size={16} />}
                      Verify
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="payment-status">
              <div className="status-indicator">
                <div className={`status-dot ${paymentStatus}`}></div>
                <span>
                  {paymentStatus === 'pending' && 'Waiting for payment...'}
                  {paymentStatus === 'checking' && 'Checking blockchain...'}
                  {paymentStatus === 'confirmed' && 'Payment confirmed!'}
                </span>
              </div>

              <button
                className="check-payment-button"
                onClick={checkPaymentStatus}
                disabled={paymentStatus === 'checking'}
              >
                {paymentStatus === 'checking' ? (
                  <>
                    <Loader className="spinning" size={16} />
                    Checking...
                  </>
                ) : (
                  <>
                    <ExternalLink size={16} />
                    Check Payment Status
                  </>
                )}
              </button>
            </div>

            <div className="payment-footer">
              <button className="back-button" onClick={resetUpload}>
                ← Back to Upload
              </button>
              <div className="payment-info">
                <small>
                  ⚡ Payments are automatically detected within 1-2 minutes<br />
                  🔒 Your photo will be permanently stored on IPFS
                </small>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="error-message"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}
          </motion.div>
        )}

        {step === 'confirmation' && (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="confirmation-step"
          >
            <motion.div
              className="success-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Check size={48} />
            </motion.div>
            
            <h2>Payment Confirmed!</h2>
            <p>Your photo has been successfully uploaded to the blockchain</p>
            
            <div className="confirmation-details">
              <div className="detail-item">
                <strong>Your Slot:</strong> #{paymentInfo?.photoId}
              </div>
              <div className="detail-item">
                <strong>Status:</strong> <span className="confirmed">Confirmed</span>
              </div>
            </div>

            <motion.button
              className="view-gallery-button"
              onClick={onSuccess}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View in Gallery
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoUpload;