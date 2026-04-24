import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../../components/Loader';
import { Package, MapPin, Clock, CheckCircle2, XCircle, ExternalLink, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my');
        setOrders(data.orders);
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'var(--color-warning)';
      case 'confirmed': return 'var(--color-success)';
      case 'completed': return 'var(--color-accent-primary)';
      case 'cancelled': return 'var(--color-error)';
      default: return 'var(--color-text-secondary)';
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>My Reservations</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Track your reservation requests and purchases.
        </p>
      </div>

      {orders.length > 0 ? (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {orders.map((order) => (
            <motion.div 
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel"
              style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '1.5rem', alignItems: 'center' }}
            >
              {/* Product Info */}
              <div style={{ width: '100px', height: '100px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--color-bg-base)' }}>
                <img 
                  src={order.listing?.images?.[0]?.url.startsWith('http') ? order.listing.images[0].url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${order.listing?.images?.[0]?.url}`} 
                  alt={order.listing?.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => e.target.src = '/placeholder-phone.jpg'}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{order.listing?.title}</h3>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: 'var(--radius-full)', 
                    background: `${getStatusColor(order.status)}20`,
                    color: getStatusColor(order.status),
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    {order.status}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={14} /> Ordered: {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-accent-primary)', fontWeight: 600 }}>
                    ₹{order.amount.final.toLocaleString()}
                  </span>
                </div>

                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {order.seller?.avatar ? <img src={order.seller.avatar} alt={order.seller.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : order.seller?.name?.charAt(0)}
                   </div>
                   <div style={{ fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Seller: </span>
                      <span style={{ fontWeight: 500 }}>{order.seller?.name}</span>
                      {order.status === 'confirmed' && order.seller?.phone && (
                        <span style={{ marginLeft: '1rem', color: 'var(--color-success)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Phone size={12} /> {order.seller.phone}
                        </span>
                      )}
                   </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a 
                  href={`/listings/${order.listing?._id}`}
                  style={{ 
                    padding: '0.6rem 1.25rem', 
                    background: 'var(--color-bg-elevated)', 
                    borderRadius: 'var(--radius-full)', 
                    fontSize: '0.85rem', 
                    fontWeight: 600,
                    textAlign: 'center',
                    textDecoration: 'none',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  View Phone
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '5rem 0', background: 'var(--color-bg-base)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--glass-border)' }}>
          <Package size={48} color="var(--color-text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
          <h3>No reservations yet</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>Find a phone you like and request a reservation.</p>
          <button 
            onClick={() => window.location.href = '/browse'}
            style={{ padding: '0.75rem 2rem', background: 'var(--color-accent-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 600, cursor: 'pointer' }}
          >
            Start Browsing
          </button>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
