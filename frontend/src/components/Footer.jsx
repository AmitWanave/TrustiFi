import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', padding: '3rem 0', background: 'var(--color-bg-base)' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
        <div>
          <Link autoFocus to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-accent-primary)' }}>
            <ShieldCheck size={28} />
            <span className="text-gradient" style={{ fontWeight: 800, fontSize: '1.4rem', fontFamily: 'var(--font-display)' }}>TrustiFi</span>
          </Link>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            The trusted marketplace for verified second-hand smartphones. Building trust through thorough inspections.
          </p>
        </div>
        
        <div>
          <h4 style={{ marginBottom: '1rem' }}>Platform</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
            <li><Link to="/browse" style={{ color: 'var(--color-text-secondary)' }}>Browse Phones</Link></li>
            <li><Link to="/how-it-works" style={{ color: 'var(--color-text-secondary)' }}>How it Works</Link></li>
            <li><Link to="/pricing" style={{ color: 'var(--color-text-secondary)' }}>Pricing</Link></li>
            <li><Link to="/trust-score" style={{ color: 'var(--color-text-secondary)' }}>About Trust Score</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem' }}>Support</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
            <li><Link to="/help" style={{ color: 'var(--color-text-secondary)' }}>Help Center</Link></li>
            <li><Link to="/contact" style={{ color: 'var(--color-text-secondary)' }}>Contact Us</Link></li>
            <li><Link to="/disputes" style={{ color: 'var(--color-text-secondary)' }}>Dispute Resolution</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 style={{ marginBottom: '1rem' }}>Legal</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
            <li><Link to="/terms" style={{ color: 'var(--color-text-secondary)' }}>Terms of Service</Link></li>
            <li><Link to="/privacy" style={{ color: 'var(--color-text-secondary)' }}>Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="container" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
        &copy; {new Date().getFullYear()} TrustiFi. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
