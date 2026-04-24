import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ShoppingBag, Heart, MessageSquare, Star, UserCircle, Package } from 'lucide-react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import SavedListings from './SavedListings';
import MyOrders from './MyOrders';
import ProfileView from './ProfileView';

const BuyerDashboard = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const tabs = [
    { path: '/buyer', label: 'Profile', icon: <UserCircle size={18} /> },
    { path: '/buyer/orders', label: 'My Reservations', icon: <Package size={18} /> },
    { path: '/buyer/saved', label: 'Saved Phones', icon: <Heart size={18} /> },
    { path: '/buyer/chats', label: 'Messages', icon: <MessageSquare size={18} /> },
    { path: '/buyer/reviews', label: 'My Reviews', icon: <Star size={18} /> },
  ];

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', display: 'flex', gap: '2rem', minHeight: '80vh' }}>
      
      {/* Sidebar Navigation */}
      <div style={{ width: '250px', flexShrink: 0 }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-bg-elevated)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {user?.avatar ? <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserCircle size={40} color="var(--color-text-muted)" />}
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{user?.name}</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{user?.role}</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path;
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

      {/* Main Content Area */}
      <div style={{ flex: 1 }} className="glass-panel">
        <Routes>
          <Route path="/" element={<ProfileView />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/saved" element={<SavedListings />} />
          <Route path="/chats" element={<div style={{ padding: '2rem' }}><h2>Messages</h2><p>Your conversations with sellers.</p></div>} />
          <Route path="/reviews" element={<div style={{ padding: '2rem' }}><h2>My Reviews</h2><p>Reviews you left for sellers.</p></div>} />
        </Routes>
      </div>

    </div>
  );
};

export default BuyerDashboard;
