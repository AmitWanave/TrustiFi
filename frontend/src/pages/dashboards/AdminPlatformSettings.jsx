import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  Settings, Shield, DollarSign, Bell, Globe, 
  Save, RefreshCw, Database, Server, Lock
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminPlatformSettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    platformName: 'TrustiFi',
    serviceFee: 5,
    inspectionFee: 499,
    maintenanceMode: false,
    emailNotifications: true,
    autoVerifySellers: false,
    maxListingImages: 10,
    apiEndpoint: 'https://api.trustifi.com/v1',
  });

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Platform settings updated successfully!');
    }, 1000);
  };

  const sections = [
    {
      title: 'General Settings',
      icon: <Globe size={20} />,
      items: [
        { key: 'platformName', label: 'Platform Name', type: 'text' },
        { key: 'apiEndpoint', label: 'Backend API Endpoint', type: 'text' },
        { key: 'maxListingImages', label: 'Max Images per Listing', type: 'number' },
      ]
    },
    {
      title: 'Monetization & Fees',
      icon: <DollarSign size={20} />,
      items: [
        { key: 'serviceFee', label: 'Transaction Service Fee (%)', type: 'number' },
        { key: 'inspectionFee', label: 'Base Inspection Fee (₹)', type: 'number' },
      ]
    },
    {
      title: 'Security & Moderation',
      icon: <Shield size={20} />,
      items: [
        { key: 'autoVerifySellers', label: 'Auto-verify Trusted Sellers', type: 'toggle' },
        { key: 'maintenanceMode', label: 'Maintenance Mode', type: 'toggle' },
      ]
    }
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Platform Settings</h2>
        <button 
          onClick={handleSave}
          disabled={loading}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.75rem 1.5rem', background: 'var(--color-accent-primary)',
            color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
            fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-md)'
          }}
        >
          {loading ? <RefreshCw size={18} className="spin" /> : <Save size={18} />}
          Save Changes
        </button>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {sections.map((section, sIdx) => (
          <motion.div 
            key={section.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: sIdx * 0.1 }}
            className="glass-panel"
            style={{ padding: '1.5rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <div style={{ color: 'var(--color-accent-primary)' }}>{section.icon}</div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{section.title}</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {section.items.map(item => (
                <div key={item.key}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                    {item.label}
                  </label>
                  
                  {item.type === 'toggle' ? (
                    <button
                      onClick={() => setSettings({ ...settings, [item.key]: !settings[item.key] })}
                      style={{
                        width: 52, height: 28, borderRadius: '999px', border: 'none', cursor: 'pointer',
                        background: settings[item.key] ? 'var(--color-accent-primary)' : 'var(--glass-border)',
                        position: 'relative', transition: 'background 0.25s'
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: 3, left: settings[item.key] ? 26 : 3,
                        width: 22, height: 22, borderRadius: '50%', background: 'white',
                        transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
                      }} />
                    </button>
                  ) : (
                    <input 
                      type={item.type}
                      value={settings[item.key]}
                      onChange={(e) => setSettings({ ...settings, [item.key]: e.target.value })}
                      style={{ 
                        width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', 
                        border: '1px solid var(--glass-border)', background: 'var(--color-bg-card)',
                        color: 'var(--color-text-primary)', fontSize: '0.9rem'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
           <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#0ea5e908', border: '1px solid #0ea5e920' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: '#0ea5e915', color: '#0ea5e9' }}>
                <Server size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>System Status</div>
                <div style={{ fontSize: '0.8rem', color: '#0ea5e9' }}>All systems operational (99.9% uptime)</div>
              </div>
           </div>
           <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#8b5cf608', border: '1px solid #8b5cf620' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: '#8b5cf615', color: '#8b5cf6' }}>
                <Database size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Database Backup</div>
                <div style={{ fontSize: '0.8rem', color: '#8b5cf6' }}>Last automated backup: 4 hours ago</div>
              </div>
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

export default AdminPlatformSettings;
