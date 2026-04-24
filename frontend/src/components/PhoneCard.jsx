import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin, CheckCircle2, ShieldCheck, ShieldAlert } from 'lucide-react';
import TrustBadge from './TrustBadge';
import styles from './PhoneCard.module.css';
import { clsx } from 'clsx';
import api from '../services/api';
import toast from 'react-hot-toast';

const PhoneCard = ({ listing, isSaved, onToggleSave }) => {
  const {
    _id,
    title,
    price,
    images,
    inspection,
    location,
    condition,
    verifiedByTrustifi,
    geo,
    specs
  } = listing;


  const userLat = localStorage.getItem('userLat');
  const userLng = localStorage.getItem('userLng');

  let distanceText = '';
  if (userLat && userLng && geo?.coordinates?.length === 2) {
    const lat1 = parseFloat(userLat);
    const lon1 = parseFloat(userLng);
    const lon2 = geo.coordinates[0];
    const lat2 = geo.coordinates[1];

    const p = 0.017453292519943295;
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))/2;
    const distanceKm = 12742 * Math.asin(Math.sqrt(a));
    distanceText = distanceKm < 1 ? 'Under 1 km away' : `${distanceKm.toFixed(1)} km away`;
  }


  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.post(`/users/saved/${_id}`);
      if (onToggleSave) onToggleSave(_id, res.data.saved);
      toast.success(res.data.message);
    } catch (err) {
      toast.error('Please login to save listings');
    }
  };

  const primaryImage = images?.find((img) => img.isPrimary)?.url || images?.[0]?.url || '/placeholder-phone.jpg';

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className={clsx('glass-panel', styles.card)}
    >
      <Link to={`/listings/${_id}`} className={styles.link}>
        <div className={styles.imageContainer}>
          <img
            src={(primaryImage.startsWith('http') || primaryImage.startsWith('https')) ? primaryImage : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${primaryImage}`}
            alt={title}
            className={styles.image}
            onError={(e) => { e.target.src = '/placeholder-phone.jpg'; }}
          />
          <button 
            className={clsx(styles.saveBtn, isSaved && styles.saved)} 
            onClick={handleSave}
            aria-label="Save listing"
          >
            <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
          </button>

          {/* TrustiFi Verified Badge - top left overlay */}
          {verifiedByTrustifi && (
            <div style={{
              position: 'absolute',
              top: 8,
              left: 8,
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              color: 'white',
              borderRadius: '999px',
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '0.2rem 0.55rem',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(34,197,94,0.4)',
              letterSpacing: '0.03em',
            }}>
              <ShieldCheck size={11} strokeWidth={2.5} />
              TrustiFi Verified
            </div>
          )}

          {specs?.isBlacklisted && (
            <div style={{
              position: 'absolute',
              top: verifiedByTrustifi ? 40 : 8,
              left: 8,
              background: 'linear-gradient(135deg, #dc2626, #ef4444)',
              color: 'white',
              borderRadius: '999px',
              fontSize: '0.65rem',
              fontWeight: 800,
              padding: '0.2rem 0.55rem',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(220,38,38,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <ShieldAlert size={11} strokeWidth={2.5} />
              Stolen / Blacklisted
            </div>
          )}
          
          {inspection?.trustScore && (
            <div className={styles.badgeWrapper}>
               <TrustBadge score={inspection.trustScore.overall} grade={inspection.trustScore.grade} />
            </div>
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.header}>
            <h3 className={styles.title} title={title}>{title}</h3>
            <p className={styles.price}>
              ₹{price?.asking?.toLocaleString() || 'N/A'}
            </p>
          </div>

          <div className={styles.details}>
            <span className={styles.tag}>{condition}</span>
            {verifiedByTrustifi && (
               <span className={clsx(styles.tag, styles.verifiedTag)} title="Verified by TrustiFi">
                 <ShieldCheck size={12} /> TrustiFi Verified
               </span>
            )}
            {!verifiedByTrustifi && inspection?.trustScore && (
               <span className={clsx(styles.tag, styles.verifiedTag)}>
                 <CheckCircle2 size={12} /> Inspected
               </span>
            )}
          </div>

          <div className={styles.footer}>
            <div className={styles.location}>
              <MapPin size={14} />
              <span>{distanceText || location?.city || 'Unknown Location'}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PhoneCard;
