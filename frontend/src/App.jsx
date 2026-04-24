import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loader from './components/Loader';

// Lazy load pages for performance
const Home = React.lazy(() => import('./pages/Home'));
const Browse = React.lazy(() => import('./pages/Browse'));
const ListingDetail = React.lazy(() => import('./pages/ListingDetail'));
const Auth = React.lazy(() => import('./pages/Auth'));
const HowItWorks = React.lazy(() => import('./pages/HowItWorks'));
const BuyerDashboard = React.lazy(() => import('./pages/dashboards/BuyerDashboard'));
const SellerDashboard = React.lazy(() => import('./pages/dashboards/SellerDashboard'));
const InspectorDashboard = React.lazy(() => import('./pages/dashboards/InspectorDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/dashboards/AdminDashboard'));
const StaticPage = React.lazy(() => import('./pages/StaticPage'));
const Messages = React.lazy(() => import('./pages/Messages'));

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) return <Loader fullScreen />;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Or an unauthorized page
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--glass-border)'
            }
          }}
        />
        <Navbar />
        <main style={{ flex: 1 }}>
          <React.Suspense fallback={<Loader fullScreen />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/listings/:id" element={<ListingDetail />} />
              <Route path="/login" element={<Auth type="login" />} />
              <Route path="/register" element={<Auth type="register" />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />

              {/* Informational Routes */}
              <Route path="/pricing" element={<StaticPage />} />
              <Route path="/trust-score" element={<StaticPage />} />
              <Route path="/help" element={<StaticPage />} />
              <Route path="/contact" element={<StaticPage />} />
              <Route path="/disputes" element={<StaticPage />} />
              <Route path="/terms" element={<StaticPage />} />
              <Route path="/privacy" element={<StaticPage />} />

              {/* Protected Buyer Routes */}
              <Route path="/buyer/*" element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <BuyerDashboard />
                </ProtectedRoute>
              } />

              {/* Protected Seller Routes */}
              <Route path="/seller/*" element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <SellerDashboard />
                </ProtectedRoute>
              } />

              {/* Protected Inspector Routes */}
              <Route path="/inspector/*" element={
                <ProtectedRoute allowedRoles={['inspector']}>
                  <InspectorDashboard />
                </ProtectedRoute>
              } />

              {/* Protected Admin Routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </React.Suspense>
        </main>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
