import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PhoneCard from '../components/PhoneCard';

// Local category icons
import appleLogo from '../assets/categories/apple.png';
import samsungLogo from '../assets/categories/samsung.png';
import googleLogo from '../assets/categories/google.png';
import oneplusLogo from '../assets/categories/oneplus.png';
import tabletIcon from '../assets/categories/tablet.png';
import accessoriesIcon from '../assets/categories/accessories.png';
import wearableIcon from '../assets/categories/wearable.png';
import repairIcon from '../assets/categories/repair.png';
import heroBanner from '../assets/hero_banner.png';

const categories = [
  { name: 'Apple', logo: appleLogo },
  { name: 'Samsung', logo: samsungLogo },
  { name: 'Google Pixel', logo: googleLogo },
  { name: 'OnePlus', logo: oneplusLogo },
  { name: 'Tablets', logo: tabletIcon },
  { name: 'Accessories', logo: accessoriesIcon },
  { name: 'Wearables', logo: wearableIcon },
  { name: 'Repairs', logo: repairIcon },
];

const Home = () => {
  const [featuredListings, setFeaturedListings] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const lat = localStorage.getItem('userLat');
        const lng = localStorage.getItem('userLng');
        let url = '/listings?limit=12';
        if (lat && lng) {
          url += `&lat=${lat}&lng=${lng}`;
        }
        const { data } = await api.get(url);
        setFeaturedListings(data.listings);
      } catch (error) {
        console.error('Failed to fetch featured listings', error);
      }
    };
    fetchListings();

    // Listen for location changes
    const handleLocChange = () => fetchListings();
    window.addEventListener('locationChanged', handleLocChange);
    return () => window.removeEventListener('locationChanged', handleLocChange);
  }, []);

  return (
    <div style={{ background: 'var(--color-bg-base)', paddingBottom: '4rem' }}>
      
      {/* Category Icons Grid Container (White banner) */}
      <div style={{ background: 'var(--color-bg-surface)', padding: '2rem 0', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem' }}>
        <div className="container">
           {/* Ads or Hero Banner (Like OLX usually has a big banner) */}
          {/* Hero Banner Illustration */}
          <div style={{ 
            width: '100%', 
            height: '200px', 
            backgroundImage: `url(${heroBanner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            borderRadius: 'var(--radius-md)', 
            marginTop: '1rem',
            marginBottom: '2.5rem',
            backgroundColor: 'var(--color-bg-base)',
            boxShadow: 'inset 0 0 100px rgba(0,0,0,0.05)'
          }}>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1.5rem', justifyItems: 'center' }}>
            {categories.map((cat, idx) => {
              const brandParam = cat.name === 'Google Pixel' ? 'Google' : cat.name;
              const isPhoneBrand = ['Apple', 'Samsung', 'Google', 'OnePlus'].includes(cat.name);
              const link = isPhoneBrand ? `/browse?brand=${brandParam}` : `/browse?search=${cat.name}`;
              
              return (
                <Link to={link} key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', backgroundColor: '#f2f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', boxShadow: 'var(--shadow-sm)', padding: '15px' }} className="category-icon-hover">
                    <img src={cat.logo} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', fontWeight: 500, textAlign: 'center' }}>{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fresh Recommendations */}
      <div className="container">
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)' }}>Fresh recommendations</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {featuredListings.map(listing => (
            <PhoneCard key={listing._id} listing={listing} />
          ))}
        </div>
        
        {featuredListings.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '5rem 2rem',
            background: 'var(--color-bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--glass-border)',
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📦</div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>No listings yet</h3>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: 360, margin: '0 auto' }}>
              Be the first to sell a verified smartphone. New listings appear here once approved by admin.
            </p>
          </div>
        )}

        {featuredListings.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
            <Link to="/browse" style={{ border: '2px solid var(--color-text-primary)', color: 'var(--color-text-primary)', padding: '0.75rem 1.5rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.95rem' }}>
              Load more
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default Home;
