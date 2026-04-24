import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Bell, CheckCheck, Trash2, ShoppingBag, User, Package, Loader2, BellOff } from 'lucide-react';

const iconForType = (type) => {
  if (type === 'admin_action') return <ShoppingBag size={18} style={{ color: '#f59e0b' }} />;
  if (type?.includes('listing')) return <Package size={18} style={{ color: 'var(--color-accent-primary)' }} />;
  if (type?.includes('user') || type === 'system') return <User size={18} style={{ color: '#8b5cf6' }} />;
  return <Bell size={18} style={{ color: 'var(--color-text-secondary)' }} />;
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications?limit=50');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotif = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-secondary)' }}>
        <Loader2 size={24} className="spin" />
        <span>Loading notifications…</span>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Bell size={22} />
            Notifications
            {unreadCount > 0 && (
              <span style={{
                background: '#ef4444',
                color: 'white',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.1rem 0.55rem',
                lineHeight: 1.6,
              }}>
                {unreadCount}
              </span>
            )}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            {notifications.length} total notification{notifications.length !== 1 ? 's' : ''}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border)',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Empty state */}
      {notifications.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <BellOff size={56} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem' }}>No Notifications</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>You're all caught up!</p>
        </div>
      )}

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {notifications.map((notif) => (
          <div
            key={notif._id}
            onClick={() => !notif.isRead && markRead(notif._id)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.9rem',
              padding: '0.9rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              background: notif.isRead ? 'var(--color-bg-card)' : 'var(--color-bg-elevated)',
              border: `1px solid ${notif.isRead ? 'var(--glass-border)' : 'var(--color-accent-primary)40'}`,
              cursor: notif.isRead ? 'default' : 'pointer',
              transition: 'all 0.2s',
              position: 'relative',
            }}
          >
            {/* Unread dot */}
            {!notif.isRead && (
              <span style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--color-accent-primary)',
              }} />
            )}

            {/* Icon */}
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'var(--color-bg-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '1px solid var(--glass-border)',
            }}>
              {iconForType(notif.type)}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: notif.isRead ? 500 : 700, fontSize: '0.92rem' }}>
                {notif.title}
              </div>
              <div style={{ fontSize: '0.83rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem', lineHeight: 1.5 }}>
                {notif.message}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
                {new Date(notif.createdAt).toLocaleString()}
              </div>
            </div>

            {/* Delete */}
            <button
              onClick={(e) => { e.stopPropagation(); deleteNotif(notif._id); }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: '0.25rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.2s',
                flexShrink: 0,
              }}
              title="Delete notification"
            >
              <Trash2 size={15} />
            </button>
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

export default AdminNotifications;
