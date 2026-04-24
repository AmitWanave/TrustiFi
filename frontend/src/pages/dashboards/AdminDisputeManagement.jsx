import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  AlertTriangle, CheckCircle, Clock, ExternalLink, 
  Loader2, MessageSquare, ShieldAlert, User 
} from 'lucide-react';

const AdminDisputeManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolution, setResolution] = useState('');
  const [resolvingId, setResolvingId] = useState(null);

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/admin/all?status=disputed');
      setOrders(data.orders || []);
    } catch {
      toast.error('Failed to load disputed orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDisputes(); }, [fetchDisputes]);

  const handleResolve = async (orderId) => {
    if (!resolution) return toast.error('Please provide a resolution');
    setResolvingId(orderId);
    try {
      await api.patch(`/admin/orders/${orderId}/resolve-dispute`, { resolution });
      toast.success('Dispute resolved');
      setOrders(prev => prev.filter(o => o._id !== orderId));
      setResolution('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Resolution failed');
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-secondary)' }}>
        <Loader2 size={24} className="spin" />
        <span>Loading disputes…</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <CheckCircle size={56} style={{ color: 'var(--color-accent-primary)', marginBottom: '1rem' }} />
        <h3 style={{ marginBottom: '0.5rem' }}>No Active Disputes</h3>
        <p style={{ color: 'var(--color-text-secondary)' }}>All disputes have been resolved or none have been raised.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Dispute Resolution</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {orders.map(order => (
          <div key={order._id} className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ 
                  width: 48, height: 48, borderRadius: 'var(--radius-md)', 
                  background: '#ef444415', color: '#ef4444',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem' }}>{order.listing?.title}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                    Order #{order._id.slice(-8).toUpperCase()} • Raised on {new Date(order.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-accent-primary)' }}>
                  ₹{order.amount?.final?.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#ef4444', fontWeight: 700 }}>
                  Awaiting Resolution
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'var(--color-bg-base)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <User size={14} /> BUYER
                </div>
                <div style={{ fontWeight: 600 }}>{order.buyer?.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{order.buyer?.email}</div>
              </div>
              <div style={{ background: 'var(--color-bg-base)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <User size={14} /> SELLER
                </div>
                <div style={{ fontWeight: 600 }}>{order.seller?.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{order.seller?.email}</div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageSquare size={16} /> Dispute Reason
              </div>
              <p style={{ 
                margin: 0, padding: '1rem', background: '#ef444408', 
                border: '1px solid #ef444420', borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem', color: 'var(--color-text-primary)', lineHeight: 1.5
              }}>
                "{order.dispute?.reason || 'No reason provided'}"
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>
                Admin Resolution Note
              </label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <textarea 
                  rows={2}
                  placeholder="Explain the final decision (refund, partial payout, etc.)"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  style={{ 
                    flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', 
                    border: '1px solid var(--glass-border)', background: 'var(--color-bg-card)',
                    color: 'var(--color-text-primary)', resize: 'vertical', fontSize: '0.9rem'
                  }}
                />
                <button 
                  disabled={resolvingId === order._id}
                  onClick={() => handleResolve(order._id)}
                  style={{ 
                    padding: '0 1.5rem', background: 'var(--color-accent-primary)',
                    color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
                    fontWeight: 700, cursor: 'pointer', height: 'fit-content', alignSelf: 'flex-end',
                    paddingTop: '0.75rem', paddingBottom: '0.75rem'
                  }}
                >
                  {resolvingId === order._id ? <Loader2 size={18} className="spin" /> : 'Resolve Dispute'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default AdminDisputeManagement;
