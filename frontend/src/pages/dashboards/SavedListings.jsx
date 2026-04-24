import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import PhoneCard from '../../components/PhoneCard';
import Loader from '../../components/Loader';
import { HeartOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SavedListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const { data } = await api.get('/users/saved');
        setListings(data.savedListings);
      } catch (error) {
        console.error('Failed to fetch saved listings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  const handleToggleSave = (id, isSaved) => {
    if (!isSaved) {
      // Remove from UI if unsaved
      setListings(prev => prev.filter(l => l._id !== id));
      
      // Sync with global user state
      if (user) {
        const updatedSaved = (user.savedListings || []).filter(sid => sid !== id);
        setUser({ ...user, savedListings: updatedSaved });
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Saved Phones</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Listings you've bookmarked for later. 
          </p>
        </div>
        <span style={{ 
          background: 'var(--color-bg-elevated)', 
          padding: '0.4rem 0.8rem', 
          borderRadius: 'var(--radius-sm)', 
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--color-accent-primary)'
        }}>
          {listings.length} Items
        </span>
      </div>

      {listings.length > 0 ? (
        <motion.div 
          layout
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '1.5rem' 
          }}
        >
          <AnimatePresence>
            {listings.map(listing => (
              <motion.div
                key={listing._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <PhoneCard 
                  listing={listing} 
                  isSaved={true} 
                  onToggleSave={handleToggleSave} 
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '5rem 2rem',
          border: '1px dashed var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-bg-base)',
          marginTop: '1rem'
        }}>
          <HeartOff size={48} color="var(--color-text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Your wishlist is empty</h3>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '300px', margin: '0 auto 1.5rem' }}>
            Browse phones and click the heart icon to save them here for quick access.
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/browse'}
            style={{
              padding: '0.75rem 2rem',
              background: 'var(--color-accent-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Go Browsing
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default SavedListings;
