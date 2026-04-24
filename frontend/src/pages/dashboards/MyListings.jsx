import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ShieldCheck, Clock, Trash2, MapPin } from 'lucide-react';
import Loader from '../../components/Loader';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyListings = async () => {
    try {
      const { data } = await api.get('/listings/my');
      setListings(data.listings);
    } catch (error) {
      toast.error('Failed to fetch your listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/listings/${id}`);
      setListings(prev => prev.filter(l => l._id !== id));
      toast.success('Listing deleted');
    } catch (error) {
      toast.error('Failed to delete listing');
    }
  };

  const handleRequestInspection = async (id) => {
    try {
      await api.post(`/inspections/request/${id}`);
      toast.success('Inspection requested! An inspector will be assigned soon.');
      fetchMyListings(); // refresh status
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request inspection');
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>My Listings</h2>
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{listings.length} Items</span>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {listings.map(listing => (
          <div key={listing._id} className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <img 
              src={(listing.images[0]?.url.startsWith('http') || listing.images[0]?.url.startsWith('https')) ? listing.images[0].url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${listing.images[0]?.url}`} 
              alt={listing.title} 
              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
              onError={(e) => { e.target.src = '/placeholder-phone.jpg'; }}
            />
            
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{listing.title}</h3>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                <span>₹{listing.price.asking.toLocaleString()}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {listing.location.city}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end', minWidth: '200px' }}>
              {/* Status Badge */}
              <div style={{ 
                padding: '0.25rem 0.75rem', 
                borderRadius: 'var(--radius-full)', 
                fontSize: '0.75rem', 
                fontWeight: 600,
                textTransform: 'uppercase',
                background: listing.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                color: listing.status === 'active' ? 'var(--color-success)' : 'var(--color-warning)',
                border: `1px solid ${listing.status === 'active' ? 'var(--color-success)' : 'var(--color-warning)'}`
              }}>
                {listing.status.replace('_', ' ')}
              </div>

              {/* Inspection Status */}
              {!listing.inspection ? (
                <button 
                  onClick={() => handleRequestInspection(listing._id)}
                  style={{ padding: '0.4rem 0.8rem', background: 'var(--color-accent-primary)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Request Inspection
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--color-success)' }}>
                  <ShieldCheck size={16} /> {listing.inspectionStatus === 'completed' ? 'Verified' : 'Pending Inspection'}
                </div>
              )}

              <button 
                onClick={() => handleDelete(listing._id)}
                style={{ pading: '0.5rem', background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {listings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            You haven't posted any listings yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;
