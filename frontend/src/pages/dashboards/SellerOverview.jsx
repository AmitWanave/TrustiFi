import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  BarChart3, ShoppingBag, Eye, DollarSign, 
  Clock, CheckCircle, AlertCircle, TrendingUp, PlusCircle, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import Loader from '../../components/Loader';

const SellerOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/listings/seller-stats');
        setStats(data.stats);
      } catch (error) {
        console.error('Failed to fetch seller stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader />;

  const statCards = [
    { label: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString()}`, icon: <DollarSign size={24} />, color: '#10b981', trend: '+12.5%' },
    { label: 'Active Listings', value: stats?.activeListings, icon: <ShoppingBag size={24} />, color: '#3b82f6', trend: 'Live' },
    { label: 'Total Views', value: stats?.totalViews, icon: <Eye size={24} />, color: '#f59e0b', trend: 'Lifetime' },
    { label: 'Pending Orders', value: stats?.pendingOrders, icon: <Clock size={24} />, color: '#8b5cf6', trend: 'Action needed' },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Seller Overview</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Track your performance and manage your business at a glance.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        {statCards.map((card, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel"
            style={{ 
              padding: '1.5rem', 
              display: 'flex', 
              flexDirection: 'column',
              gap: '1rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start' 
            }}>
              <div style={{ 
                padding: '0.75rem', 
                borderRadius: 'var(--radius-md)', 
                background: `${card.color}15`, 
                color: card.color 
              }}>
                {card.icon}
              </div>
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                color: card.trend.startsWith('+') ? '#10b981' : 'var(--color-text-muted)',
                padding: '0.25rem 0.5rem',
                borderRadius: '999px',
                background: card.trend.startsWith('+') ? '#10b98115' : 'var(--color-bg-elevated)'
              }}>
                {card.trend}
              </span>
            </div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {card.label}
              </h4>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {card.value || 0}
              </div>
            </div>

            {/* Decorative background circle */}
            <div style={{ 
              position: 'absolute', 
              right: '-20px', 
              bottom: '-20px', 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: `${card.color}05`,
              zIndex: 0
            }} />
          </motion.div>
        ))}
      </div>

      {/* Secondary Info Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        
        {/* Listing Health */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="var(--color-accent-primary)" />
            Listing Status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} color="#10b981" /> Active
              </span>
              <span style={{ fontWeight: 700 }}>{stats?.activeListings}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} color="#f59e0b" /> Pending Approval
              </span>
              <span style={{ fontWeight: 700 }}>{stats?.pendingApproval}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingBag size={16} color="var(--color-text-muted)" /> Sold
              </span>
              <span style={{ fontWeight: 700 }}>{stats?.soldListings}</span>
            </div>
          </div>
          
          <button 
            onClick={() => window.location.href = '/seller/add-listing'}
            style={{ 
              width: '100%', 
              marginTop: '2rem', 
              padding: '0.75rem', 
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'var(--color-accent-primary)',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <PlusCircle size={18} /> Sell New Phone
          </button>
        </div>

        {/* Quick Tips / Performance */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Quick Tips for Better Sales</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--color-bg-base)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-accent-primary)' }}>Better Photos</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                Listings with 5+ clear photos sell 40% faster on average.
              </p>
            </div>
            <div style={{ padding: '1rem', background: 'var(--color-bg-base)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-accent-primary)' }}>Competitive Price</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                Check similar models to ensure your price is attractive to buyers.
              </p>
            </div>
            <div style={{ padding: '1rem', background: 'var(--color-bg-base)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-accent-primary)' }}>Detailed Specs</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                Accurate battery health and storage info reduces buyer questions.
              </p>
            </div>
            <div style={{ padding: '1rem', background: 'var(--color-bg-base)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-accent-primary)' }}>Fast Response</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                Responding to offers within 1 hour increases closing rates by 2x.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SellerOverview;
