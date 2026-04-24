import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Tag, MessageSquare, Briefcase, PlusCircle, Activity } from 'lucide-react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';

// Import dashboard views
import MyListings from './MyListings';
import AddListingForm from './AddListingForm';
import SellerOrders from './SellerOrders';
import SellerOverview from './SellerOverview';
import ProfileView from './ProfileView';

const SellerDashboard = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const tabs = [
    { path: '/seller', label: 'Overview', icon: <Activity size={18} /> },
    { path: '/seller/listings', label: 'My Listings', icon: <Tag size={18} /> },
    { path: '/seller/add-listing', label: 'Add Listing', icon: <PlusCircle size={18} /> },
    { path: '/seller/orders', label: 'Orders & Offers', icon: <Briefcase size={18} /> },
    { path: '/seller/profile', label: 'Profile', icon: <Activity size={18} /> },
    { path: '/seller/chats', label: 'Messages', icon: <MessageSquare size={18} /> },
  ];

  return (
    <div className="container" style={{ padding: '3rem 1rem', display: 'flex', gap: '2rem', minHeight: '80vh' }}>
      
      {/* Sidebar Navigation */}
      <div style={{ width: '250px', flexShrink: 0, display: window.innerWidth > 768 ? 'block' : 'none' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{user?.name}</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-accent-primary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Seller Account</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path || (location.pathname.startsWith(tab.path) && tab.path !== '/seller');
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
          <Route path="/" element={<SellerOverview />} />
          <Route path="/listings" element={<MyListings />} />
          <Route path="/add-listing" element={<AddListingForm />} />
          <Route path="/orders" element={<SellerOrders />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="/chats" element={<div style={{ padding: '2rem' }}><h2>Messages</h2><p>Coming Soon: Chat interface with buyers.</p></div>} />
        </Routes>
      </div>

    </div>
  );
};

export default SellerDashboard;
