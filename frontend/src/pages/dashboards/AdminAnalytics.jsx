import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Users, ShoppingBag, CheckCircle, Clock, AlertTriangle, 
  TrendingUp, TrendingDown, DollarSign, Loader2 
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setData(data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '3rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-secondary)' }}>
        <Loader2 size={24} className="spin" />
        <span>Loading analytics…</span>
      </div>
    );
  }

  const { stats, recentOrders } = data || {};

  const cards = [
    { label: 'Total Revenue', value: `₹${stats?.revenue?.toLocaleString()}`, icon: <DollarSign size={24} />, color: '#10b981' },
    { label: 'Total Users', value: stats?.users?.total, icon: <Users size={24} />, color: '#3b82f6' },
    { label: 'Active Listings', value: stats?.listings?.active, icon: <ShoppingBag size={24} />, color: '#f59e0b' },
    { label: 'Completed Orders', value: stats?.orders?.completed, icon: <CheckCircle size={24} />, color: '#8b5cf6' },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Platform Analytics</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {cards.map((card, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel"
            style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
          >
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: `${card.color}15`, color: card.color }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{card.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{card.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
        {/* User Breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>User Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span>Buyers</span>
              <span>{stats?.users?.buyers}</span>
            </div>
            <div style={{ width: '100%', height: 8, background: 'var(--color-bg-base)', borderRadius: 4 }}>
                <div style={{ width: `${(stats?.users?.buyers / stats?.users?.total) * 100}%`, height: '100%', background: '#3b82f6', borderRadius: 4 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span>Sellers</span>
              <span>{stats?.users?.sellers}</span>
            </div>
             <div style={{ width: '100%', height: 8, background: 'var(--color-bg-base)', borderRadius: 4 }}>
                <div style={{ width: `${(stats?.users?.sellers / stats?.users?.total) * 100}%`, height: '100%', background: '#10b981', borderRadius: 4 }} />
            </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span>Inspectors</span>
              <span>{stats?.users?.inspectors}</span>
            </div>
             <div style={{ width: '100%', height: 8, background: 'var(--color-bg-base)', borderRadius: 4 }}>
                <div style={{ width: `${(stats?.users?.inspectors / stats?.users?.total) * 100}%`, height: '100%', background: '#8b5cf6', borderRadius: 4 }} />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Recent Orders</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentOrders?.length > 0 ? recentOrders.map((order, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--color-bg-base)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{order.listing?.title || 'Unknown Item'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>By {order.buyer?.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>₹{order.amount?.final?.toLocaleString()}</div>
                  <div style={{ fontSize: '0.75rem', color: order.status === 'completed' ? '#10b981' : '#f59e0b' }}>
                    {order.status.toUpperCase()}
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-secondary)' }}>No recent orders</div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default AdminAnalytics;
