import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ClipboardList, FileCheck, CheckCircle } from 'lucide-react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';

// Import inspector views
import AssignedJobs from './AssignedJobs';
import SubmitReportForm from './SubmitReportForm';
import InspectionHistory from './InspectionHistory';
import ProfileView from './ProfileView';

const InspectorDashboard = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const tabs = [
    { path: '/inspector', label: 'Assigned Inspections', icon: <ClipboardList size={18} /> },
    { path: '/inspector/history', label: 'Completed', icon: <CheckCircle size={18} /> },
    { path: '/inspector/profile', label: 'Profile', icon: <FileCheck size={18} /> },
  ];

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', display: 'flex', gap: '2rem', minHeight: '80vh' }}>
      
      {/* Sidebar Navigation */}
      <div style={{ width: '250px', flexShrink: 0, display: window.innerWidth > 768 ? 'block' : 'none' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{user?.name}</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-warning)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Certified Inspector</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path || (location.pathname.startsWith(tab.path) && tab.path !== '/inspector');
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
          <Route path="/" element={<AssignedJobs />} />
          <Route path="/submit/:id" element={<SubmitReportForm />} />
          <Route path="/history" element={<InspectionHistory />} />
          <Route path="/profile" element={<ProfileView />} />
        </Routes>
      </div>

    </div>
  );
};

export default InspectorDashboard;
