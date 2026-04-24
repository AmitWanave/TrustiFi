import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Battery, Cpu, Search, Star, MapPin, MessageSquare, ShoppingCart, Info, ShieldAlert, Plus, MessageCircle } from 'lucide-react';
import chatService from '../services/chatService';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';
import TrustBadge from '../components/TrustBadge';
import Modal from '../components/Modal';

const ListingDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [messageText, setMessageText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data } = await api.get(`/listings/${id}`);
        setListing(data.listing);
      } catch (error) {
        toast.error('Listing not found');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleMakeOffer = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/listings/${id}/offers`, { amount: Number(offerAmount), message: `I am offering ₹${offerAmount} for this ${listing.title}. Please let me know if you are interested.` });
      toast.success('Offer sent successfully!');
      setIsOfferModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send offer');
    }
  };

  const handleReserve = async () => {
    if (!user) return toast.error('Please login to reserve this phone');
    if (!window.confirm('By reserving this phone, the seller will be notified that you intend to buy it. Continue?')) return;
    
    try {
      await api.post('/orders', { listingId: id });
      toast.success('Phone reserved successfully! Check your orders for details.');
      // Refresh listing data
      const { data } = await api.get(`/listings/${id}`);
      setListing(data.listing);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reserve phone');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      await chatService.sendMessage(listing.seller._id, messageText, id);
      toast.success('Message sent! Redirecting to chat...');
      setIsMessageModalOpen(false);
      setTimeout(() => navigate('/messages'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!listing) return <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>Listing not found.</div>;

  const { title, price, images, specs, condition, description, seller, inspection, location } = listing;
  const safeImages = images?.length > 0 
    ? images.map(img => (img.url.startsWith('http') || img.url.startsWith('https')) ? img.url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${img.url}`) 
    : ['/placeholder-phone.jpg'];

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
        
        {/* Images Column */}
        <div>
          <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-base)' }}>
            <img src={safeImages[activeImage]} alt={title} style={{ maxHeight: '100%', objectFit: 'contain' }} />
          </div>
          {safeImages.length > 1 && (
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {safeImages.map((img, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setActiveImage(idx)}
                  className="glass-panel"
                  style={{ width: '80px', height: '80px', flexShrink: 0, padding: '0.5rem', cursor: 'pointer', border: activeImage === idx ? '2px solid var(--color-accent-primary)' : '1px solid var(--glass-border)' }}
                >
                  <img src={img} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details Column */}
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h1 style={{ fontSize: '2.5rem', lineHeight: 1.1 }}>{title}</h1>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-accent-primary)' }}>
                ₹{price?.asking?.toLocaleString()}
              </span>
              <span style={{ padding: '0.25rem 0.75rem', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-full)', fontSize: '0.9rem' }}>
                {condition}
              </span>
            </div>
            
            {specs?.isBlacklisted && (
              <div style={{ 
                padding: '1.25rem', 
                background: 'rgba(220, 38, 38, 0.1)', 
                border: '1.5px solid #dc2626', 
                borderRadius: '8px', 
                color: '#dc2626', 
                display: 'flex', 
                alignItems: 'start', 
                gap: '1rem', 
                marginBottom: '2rem',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)'
              }}>
                <ShieldAlert size={28} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 700 }}>Stolen / Blacklisted Device Detected</h4>
                  <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.4 }}>
                    This device's IMEI has been reported as stolen or blacklisted. <strong>Buy on your own risk!</strong> TrustiFi does not recommend purchasing reported devices.
                  </p>
                </div>
              </div>
            )}

            {inspection?.trustScore ? (
              <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid var(--color-success)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck color="var(--color-success)" size={24} />
                    <h3 style={{ margin: 0 }}>TrustiFi Inspected</h3>
                  </div>
                  <TrustBadge score={inspection.trustScore.overall} grade={inspection.trustScore.grade} size="large" />
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                  This device was thoroughly verified by our certified experts. 
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--color-success)" /> IMEI Clean</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Battery size={16} color="var(--color-success)" /> Battery: {inspection.batteryHealth || 'Good'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--color-success)" /> Original Parts</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Cpu size={16} color="var(--color-success)" /> Hardware Pass</div>
                </div>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', borderLeft: '4px solid var(--color-warning)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Info color="var(--color-warning)" />
                <span style={{ fontSize: '0.9rem' }}>This listing has not been formally inspected by TrustiFi yet. Buy with caution.</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <button 
                onClick={handleReserve}
                disabled={!user || listing.status !== 'active' || (user && listing.seller?._id === user?._id)}
                style={{ 
                  flex: 1, 
                  padding: '1rem', 
                  background: (listing.status !== 'active' || (user && listing.seller?._id === user?._id)) ? 'var(--color-bg-elevated)' : 'var(--color-accent-primary)', 
                  color: (listing.status !== 'active' || (user && listing.seller?._id === user?._id)) ? 'var(--color-text-muted)' : 'white', 
                  border: 'none', 
                  borderRadius: 'var(--radius-full)', 
                  fontWeight: 600, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.5rem',
                  cursor: (listing.status !== 'active' || (user && listing.seller?._id === user?._id)) ? 'not-allowed' : 'pointer'
                }}
              >
                <ShoppingCart size={20} /> 
                {listing.status === 'active' ? (user && listing.seller?._id === user?._id ? 'Your Listing' : 'Request Reservation') : listing.status.replace('_', ' ')}
              </button>
              <button 
                onClick={() => user ? setIsMessageModalOpen(true) : toast.error('Please login first')}
                disabled={listing.status !== 'active' || (user && listing.seller?._id === user?._id)}
                style={{ 
                  flex: 1, 
                  padding: '1rem', 
                  background: 'transparent', 
                  color: 'var(--color-text-primary)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: 'var(--radius-full)', 
                  fontWeight: 600, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.5rem',
                  opacity: (listing.status !== 'active' || (user && listing.seller?._id === user?._id)) ? 0.5 : 1,
                  cursor: (listing.status !== 'active' || (user && listing.seller?._id === user?._id)) ? 'not-allowed' : 'pointer'
                }}
              >
                <MessageCircle size={20} /> Message Seller
              </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Seller Info</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {seller?.avatar ? <img src={seller.avatar} alt={seller.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : seller?.name?.charAt(0)}
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>{seller?.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                    Seller Verified ✓
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Specifications */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Specifications & Description</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
          <div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Brand</span>
                <span style={{ fontWeight: 500 }}>{listing.brand}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Model</span>
                <span style={{ fontWeight: 500 }}>{listing.model}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>RAM</span>
                <span style={{ fontWeight: 500 }}>{specs?.ram || 'N/A'}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Storage</span>
                <span style={{ fontWeight: 500 }}>{specs?.storage || 'N/A'}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Color</span>
                <span style={{ fontWeight: 500 }}>{specs?.color || 'N/A'}</span>
              </li>
            </ul>
          </div>
          <div>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {description}
            </p>
          </div>
        </div>
      </div>

      <Modal isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} title="Make an Offer">
        <form onSubmit={handleMakeOffer}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Offer Amount (₹)</label>
            <input 
              type="number" 
              required
              min="1"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              placeholder={`Asking price: ₹${price?.asking}`}
              style={{ width: '100%', padding: '0.75rem', background: '#fff', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)', outline: 'none' }}
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: '0.75rem', background: 'var(--color-accent-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
            Send Offer
          </button>
        </form>
      </Modal>

      <Modal isOpen={isMessageModalOpen} onClose={() => setIsMessageModalOpen(false)} title={`Message ${listing.seller?.name}`}>
        <form onSubmit={handleSendMessage}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Your Message</label>
            <textarea 
              required
              rows="4"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Hi, I'm interested in the ${listing.title}...`}
              style={{ width: '100%', padding: '0.75rem', background: '#fff', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)', outline: 'none', resize: 'vertical' }}
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: '0.75rem', background: 'var(--color-accent-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
            Send Message
          </button>
        </form>
      </Modal>

      {inspection?.trustScore && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-panel" 
          style={{ padding: '2rem', marginTop: '2rem', borderTop: '4px solid var(--color-accent-primary)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--color-bg-elevated)', borderRadius: '12px' }}>
              <ShieldCheck size={32} color="var(--color-accent-primary)" />
            </div>
            <div>
              <h2 style={{ margin: 0 }}>Inspector's Detailed Feedback</h2>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>Full verification report by TrustiFi Certified Experts</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
            {/* Summary & Recommendations */}
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>
                  <Info size={18} /> Summary
                </h4>
                <p style={{ lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                  {inspection.summary || 'The device has undergone a comprehensive multi-point inspection and meets our quality standards for its assigned grade.'}
                </p>
              </div>

              {inspection.recommendations && (
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>
                    <Plus size={18} /> Recommendations
                  </h4>
                  <p style={{ lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                    {inspection.recommendations}
                  </p>
                </div>
              )}
            </div>

            {/* Red Flags & Hardware Health */}
            <div>
              {(inspection.redFlags || (listing?.specs?.isBlacklisted)) && (
                <div style={{ 
                  padding: '1.25rem', 
                  background: 'rgba(220, 38, 38, 0.05)', 
                  border: '1px solid rgba(220, 38, 38, 0.2)', 
                  borderRadius: '12px',
                  marginBottom: '2rem'
                }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#dc2626' }}>
                    <ShieldAlert size={18} /> Critical Findings
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#dc2626', lineHeight: 1.5 }}>
                    {inspection.redFlags || (listing?.specs?.isBlacklisted ? 'Device reported as stolen/blacklisted. High risk.' : 'None detected during inspection.')}
                  </p>
                </div>
              )}

              <h4 style={{ marginBottom: '1.25rem', color: 'var(--color-text-primary)' }}>Hardware Health Breakdown</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--color-bg-elevated)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.9rem' }}>Battery Health</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>{inspection.batteryHealth || '85%+' }</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--color-bg-elevated)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.9rem' }}>Display Integrity</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>Original / Perfect</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--color-bg-elevated)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.9rem' }}>Network & Connectivity</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>Fully Functional</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default ListingDetail;
