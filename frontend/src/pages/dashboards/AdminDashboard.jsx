import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Users, BarChart3, Settings, ShieldAlert, List, AlertTriangle, Bell } from 'lucide-react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import api from '../../services/api';

// Lazy-load moderation and notifications panels
import AdminListingModeration from './AdminListingModeration';
import AdminNotifications from './AdminNotifications';
import AdminInspectionManagement from './AdminInspectionManagement';
import AdminAnalytics from './AdminAnalytics';
import AdminUserManagement from './AdminUserManagement';
import AdminDisputeManagement from './AdminDisputeManagement';
import AdminPlatformSettings from './AdminPlatformSettings';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll unread notification count every 30s
  const fetchUnread = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications?limit=1');
      setUnreadCount(data.unreadCount || 0);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  const tabs = [
    { path: '/admin', label: 'Analytics', icon: <BarChart3 size={18} /> },
    { path: '/admin/users', label: 'User Management', icon: <Users size={18} /> },
    { path: '/admin/listings', label: 'Listing Moderation', icon: <List size={18} /> },
    { path: '/admin/inspections', label: 'Inspections', icon: <ShieldAlert size={18} /> },
    { path: '/admin/disputes', label: 'Disputes & Reports', icon: <AlertTriangle size={18} /> },
    { path: '/admin/settings', label: 'Platform Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', display: 'flex', gap: '2rem', minHeight: '80vh' }}>
      
      {/* ── Sidebar Navigation ── */}
      <div style={{ width: '250px', flexShrink: 0 }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>

          {/* Admin Profile */}
          <div style={{
            textAlign: 'center',
            marginBottom: '1.5rem',
            borderBottom: '1px solid var(--glass-border)',
            paddingBottom: '1.5rem',
          }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{user?.name}</h3>
            <span style={{
              fontSize: '0.85rem',
              color: 'var(--color-danger)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: 'bold',
            }}>
              System Admin
            </span>
          </div>

          {/* Notification Bell */}
          <Link
            to="/admin/notifications"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: location.pathname === '/admin/notifications'
                ? 'var(--color-accent-primary)'
                : unreadCount > 0 ? 'rgba(239,68,68,0.08)' : 'transparent',
              color: location.pathname === '/admin/notifications'
                ? 'white'
                : unreadCount > 0 ? '#ef4444' : 'var(--color-text-secondary)',
              fontWeight: unreadCount > 0 ? 600 : 400,
              textDecoration: 'none',
              marginBottom: '0.5rem',
              border: unreadCount > 0 && location.pathname !== '/admin/notifications'
                ? '1px solid rgba(239,68,68,0.25)'
                : '1px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Bell size={18} />
              Notifications
            </span>
            {unreadCount > 0 && (
              <span style={{
                background: '#ef4444',
                color: 'white',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.1rem 0.5rem',
                lineHeight: 1.6,
                minWidth: 20,
                textAlign: 'center',
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Nav Tabs */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tabs.map((tab) => {
              const isActive =
                location.pathname === tab.path ||
                (location.pathname.startsWith(tab.path) && tab.path !== '/admin');
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? 'white' : 'var(--color-text-secondary)',
                    background: isActive ? 'var(--color-accent-primary)' : 'transparent',
                    fontWeight: isActive ? 600 : 400,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1 }} className="glass-panel">
        <Routes>
          <Route path="/" element={<AdminAnalytics />} />
          <Route path="/users" element={<AdminUserManagement />} />
          {/* ─ Live Listing Moderation ─ */}
          <Route path="/listings" element={<AdminListingModeration />} />
          {/* ─ Live Inspections ─ */}
          <Route path="/inspections" element={<AdminInspectionManagement />} />
          <Route path="/disputes" element={<AdminDisputeManagement />} />
          <Route path="/settings" element={<AdminPlatformSettings />} />
          {/* ─ Notifications ─ */}
          <Route path="/notifications" element={<AdminNotifications />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
