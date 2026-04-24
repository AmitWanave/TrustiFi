import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Search, UserPlus, Shield, ShieldOff, Ban, CheckCircle, 
  MoreVertical, Loader2, Mail, User as UserIcon, X
} from 'lucide-react';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [showInspectorModal, setShowInspectorModal] = useState(false);
  const [newInspector, setNewInspector] = useState({
    name: '', email: '', password: '', certifications: '', specialization: ''
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/users?search=${search}&role=${role}`);
      setUsers(data.users || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, role]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchUsers]);

  const handleAction = async (userId, action, value) => {
    try {
      await api.patch(`/admin/users/${userId}`, { [action]: value });
      toast.success('User updated');
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, [action]: value } : u));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleCreateInspector = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/inspectors', {
        ...newInspector,
        certifications: newInspector.certifications.split(',').map(s => s.trim()),
      });
      toast.success('Inspector account created!');
      setShowInspectorModal(false);
      setNewInspector({ name: '', email: '', password: '', certifications: '', specialization: '' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create inspector');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>User Management</h2>
        <button 
          onClick={() => setShowInspectorModal(true)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.65rem 1.25rem', background: 'var(--color-accent-primary)',
            color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
            fontWeight: 600, cursor: 'pointer'
          }}
        >
          <UserPlus size={18} /> Add Inspector
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.5rem', 
              borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', 
              background: 'var(--color-bg-card)', color: 'var(--color-text-primary)'
            }}
          />
        </div>
        <select 
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ 
            padding: '0.65rem', borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--glass-border)', background: 'var(--color-bg-card)',
            color: 'var(--color-text-primary)'
          }}
        >
          <option value="">All Roles</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="inspector">Inspector</option>
        </select>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-base)', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>User</th>
              <th style={{ padding: '1rem' }}>Role</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Joined</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center' }}>
                  <Loader2 size={24} className="spin" style={{ margin: '0 auto' }} />
                </td>
              </tr>
            ) : users.length === 0 ? (
               <tr>
                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  No users found
                </td>
              </tr>
            ) : users.map(user => (
              <tr key={user._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{user.email}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    textTransform: 'capitalize', fontSize: '0.75rem', fontWeight: 600,
                    padding: '0.2rem 0.5rem', borderRadius: '999px',
                    background: user.role === 'admin' ? '#ef444422' : user.role === 'inspector' ? '#8b5cf622' : '#10b98122',
                    color: user.role === 'admin' ? '#ef4444' : user.role === 'inspector' ? '#8b5cf6' : '#10b981'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {user.isVerified && <CheckCircle size={16} color="#10b981" title="Verified" />}
                    {user.isBanned && <Ban size={16} color="#ef4444" title="Banned" />}
                  </div>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem' }}>
                  {user.role !== 'admin' && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button 
                        onClick={() => handleAction(user._id, 'isVerified', !user.isVerified)}
                        style={{ border: 'none', background: 'none', color: user.isVerified ? '#f59e0b' : '#10b981', cursor: 'pointer' }}
                        title={user.isVerified ? 'Unverify' : 'Verify'}
                      >
                        {user.isVerified ? <ShieldOff size={18} /> : <Shield size={18} />}
                      </button>
                      <button 
                        onClick={() => handleAction(user._id, 'isBanned', !user.isBanned)}
                        style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}
                        title={user.isBanned ? 'Unban' : 'Ban'}
                      >
                        <Ban size={18} style={{ opacity: user.isBanned ? 0.5 : 1 }} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Create Inspector Modal ── */}
      {showInspectorModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel"
            style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}
          >
            <button 
              onClick={() => setShowInspectorModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '1.5rem' }}>Add New Inspector</h3>
            <form onSubmit={handleCreateInspector} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Full Name</label>
                <input 
                  type="text" required
                  value={newInspector.name}
                  onChange={e => setNewInspector({...newInspector, name: e.target.value})}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Email Address</label>
                <input 
                  type="email" required
                  value={newInspector.email}
                  onChange={e => setNewInspector({...newInspector, email: e.target.value})}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Temporary Password</label>
                <input 
                  type="password" required
                  value={newInspector.password}
                  onChange={e => setNewInspector({...newInspector, password: e.target.value})}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Specialization</label>
                <input 
                  type="text" placeholder="e.g. High-end Android, iPhone"
                  value={newInspector.specialization}
                  onChange={e => setNewInspector({...newInspector, specialization: e.target.value})}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Certifications (comma separated)</label>
                <input 
                  type="text" placeholder="e.g. Apple Certified, Samsung Expert"
                  value={newInspector.certifications}
                  onChange={e => setNewInspector({...newInspector, certifications: e.target.value})}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
                />
              </div>
              <button 
                type="submit"
                style={{ 
                  marginTop: '1rem', padding: '0.75rem', 
                  background: 'var(--color-accent-primary)', color: 'white',
                  border: 'none', borderRadius: 'var(--radius-md)',
                  fontWeight: 700, cursor: 'pointer'
                }}
              >
                Create Account
              </button>
            </form>
          </motion.div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default AdminUserManagement;
