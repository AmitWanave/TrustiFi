import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../../components/Loader';
import { Package, CheckCircle, XCircle, Clock, User, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/seller');
      setOrders(data.orders);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, status) => {
    const confirmMsg = status === 'confirmed' 
      ? 'Accept this reservation? This will mark the phone as reserved for this buyer.'
      : 'Reject this reservation request?';
    
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success(`Order ${status === 'confirmed' ? 'accepted' : 'cancelled'}`);
      fetchOrders(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

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
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Reservation Requests</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Manage incoming requests from potential buyers.
        </p>
      </div>

      {orders.length > 0 ? (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {orders.map((order) => (
            <motion.div 
              key={order._id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-panel"
              style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '1.5rem', alignItems: 'center' }}
            >
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.75rem' }}>
                   <div className="glass-panel" style={{ padding: '0.75rem', background: 'var(--color-bg-base)', border: 'none' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                         <User size={12} /> Buyer Information
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{order.buyer?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                         <Mail size={12} /> {order.buyer?.email}
                      </div>
                      {order.status === 'confirmed' && order.buyer?.phone && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                           <Phone size={12} /> {order.buyer.phone}
                        </div>
                      )}
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Offered Price</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-accent-primary)' }}>₹{order.amount.final.toLocaleString()}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                         Requested: {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                   </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {order.status === 'pending' ? (
                  <>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStatusUpdate(order._id, 'confirmed')}
                      style={{ 
                        padding: '0.6rem 1.5rem', 
                        background: 'var(--color-success)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: 'var(--radius-full)', 
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <CheckCircle size={16} /> Accept
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                      style={{ 
                        padding: '0.6rem 1.5rem', 
                        background: 'transparent', 
                        color: 'var(--color-error)', 
                        border: '1px solid var(--color-error)', 
                        borderRadius: 'var(--radius-full)', 
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <XCircle size={16} /> Reject
                    </motion.button>
                  </>
                ) : order.status === 'confirmed' ? (
                  <>
                    <button 
                      onClick={() => handleStatusUpdate(order._id, 'completed')}
                      style={{ padding: '0.6rem 1.5rem', background: 'var(--color-accent-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Mark as Sold
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                      style={{ padding: '0.6rem 1.5rem', background: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-full)', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Cancel Reservation
                    </button>
                  </>
                ) : (
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                    Closed on {new Date(order.updatedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '5rem 0', background: 'var(--color-bg-base)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--glass-border)' }}>
          <Package size={48} color="var(--color-text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
          <h3>No requests yet</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>You'll see buyer reservation requests here.</p>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
