import React, { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, SlidersHorizontal, CheckCircle2, Search, ShieldOff, X } from 'lucide-react';
import api from '../services/api';
import PhoneCard from '../components/PhoneCard';
import Loader from '../components/Loader';
import { motion } from 'framer-motion';

const Browse = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  // Helper to get initial filters from URL
  const getFiltersFromURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    return {
      brand: params.get('brand') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      condition: params.get('condition') || '',
      inspected: params.get('inspected') === 'true',
      search: params.get('search') || '',
    };
  }, [location.search]);

  const [filters, setFilters] = useState(getFiltersFromURL());

  // Update state when URL changes (e.g. back button or logo click)
  useEffect(() => {
    setFilters(getFiltersFromURL());
  }, [getFiltersFromURL]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const currentFilters = getFiltersFromURL();
      const queryParams = new URLSearchParams();
      if (currentFilters.brand) queryParams.append('brand', currentFilters.brand);
      if (currentFilters.condition) queryParams.append('condition', currentFilters.condition);
      if (currentFilters.minPrice) queryParams.append('minPrice', currentFilters.minPrice);
      if (currentFilters.maxPrice) queryParams.append('maxPrice', currentFilters.maxPrice);
      if (currentFilters.inspected) queryParams.append('inspected', 'true');
      if (currentFilters.search) queryParams.append('search', currentFilters.search);

      const lat = localStorage.getItem('userLat');
      const lng = localStorage.getItem('userLng');
      if (lat && lng) {
        queryParams.append('lat', lat);
        queryParams.append('lng', lng);
      }

      const { data } = await api.get(`/listings?${queryParams.toString()}`);
      setListings(data.listings);
    } catch (error) {
      console.error('Failed to fetch listings', error);
    } finally {
      setLoading(false);
    }
  }, [getFiltersFromURL]);

  // Fetch when URL search changes
  useEffect(() => {
    fetchListings();
    
    const handleLocationChange = () => fetchListings();
    window.addEventListener('locationChanged', handleLocationChange);
    return () => window.removeEventListener('locationChanged', handleLocationChange);
  }, [fetchListings]);

  // Sync state to URL with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentParams = new URLSearchParams(location.search);
      const newParams = new URLSearchParams();
      
      if (filters.brand) newParams.set('brand', filters.brand);
      if (filters.condition) newParams.set('condition', filters.condition);
      if (filters.minPrice) newParams.set('minPrice', filters.minPrice);
      if (filters.maxPrice) newParams.set('maxPrice', filters.maxPrice);
      if (filters.inspected) newParams.set('inspected', 'true');
      if (filters.search) newParams.set('search', filters.search);

      // Only navigate if search string actually changed to avoid infinite loop
      if (currentParams.toString() !== newParams.toString()) {
        navigate(`/browse?${newParams.toString()}`, { replace: true });
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [filters, navigate, location.search]);

  const handleClearFilters = () => {
    navigate('/browse');
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleToggleSave = (id, saved) => {
    if (!user) return;
    const updatedSaved = saved 
      ? [...(user.savedListings || []), id]
      : (user.savedListings || []).filter(sid => sid !== id);
    
    setUser({ ...user, savedListings: updatedSaved });
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', display: 'flex', gap: '2rem', flexDirection: 'column', minHeight: '80vh' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Browse Phones</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Find your next verified device</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          <SlidersHorizontal size={16} /> 
          <span>{listings.length} Results</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flex: 1 }}>
        {/* Sidebar Filters */}
        <div style={{ width: '250px', flexShrink: 0, display: window.innerWidth > 768 ? 'block' : 'none' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', position: 'sticky', top: '90px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
              <Filter size={18} /> Filters
            </h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Search</label>
              <input 
                type="text" 
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search models..."
                style={{ width: '100%', padding: '0.5rem', background: 'var(--color-bg-base)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', color: 'white' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Brand</label>
              <select 
                name="brand"
                value={filters.brand}
                onChange={handleFilterChange}
                style={{ width: '100%', padding: '0.5rem', background: 'var(--color-bg-base)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', color: 'white' }}
              >
                <option value="">All Brands</option>
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
                <option value="Google">Google</option>
                <option value="OnePlus">OnePlus</option>
                <option value="Xiaomi">Xiaomi</option>
                <option value="Oppo">Oppo</option>
                <option value="Vivo">Vivo</option>
                <option value="Realme">Realme</option>
                <option value="Nothing">Nothing</option>
                <option value="Motorola">Motorola</option>
                <option value="Nokia">Nokia</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Price Range</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="number" 
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min"
                  style={{ width: '50%', padding: '0.5rem', background: 'var(--color-bg-base)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                />
                <input 
                  type="number" 
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  style={{ width: '50%', padding: '0.5rem', background: 'var(--color-bg-base)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="checkbox-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  name="inspected"
                  checked={filters.inspected}
                  onChange={handleFilterChange}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle2 size={16} color="var(--color-success)" /> TrustiFi Inspected Only
                </span>
              </label>
            </div>

            <button 
              onClick={() => setFilters({ brand: '', minPrice: '', maxPrice: '', condition: '', inspected: false, search: '' })}
              style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)', marginTop: '1rem' }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Grid */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <Loader />
          ) : listings.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {listings.map((listing) => (
                <PhoneCard 
                  key={listing._id} 
                  listing={listing} 
                  isSaved={user?.savedListings?.includes(listing._id)} 
                  onToggleSave={handleToggleSave} 
                />
              ))}
            </div>
        ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{
                textAlign: 'center',
                padding: '5rem 2rem',
                background: 'var(--color-bg-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--glass-border)',
              }}
            >
              <ShieldOff size={56} color="var(--color-text-muted)" style={{ marginBottom: '1.25rem' }} />
              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                {filters.brand
                  ? `No ${filters.brand} phones listed yet`
                  : filters.search
                  ? `No results for "${filters.search}"`
                  : 'No listings found'}
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.75rem', maxWidth: 380, margin: '0.5rem auto 1.75rem' }}>
                {filters.brand
                  ? `We don't have any approved ${filters.brand} phones right now. Check back soon or explore other brands.`
                  : 'Try adjusting your filters or search term to find what you\'re looking for.'}
              </p>
              <button 
                onClick={handleClearFilters}
                style={{
                  padding: '0.75rem 2rem',
                  background: 'var(--color-accent-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                }}
              >
                Browse All Phones
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Browse;
