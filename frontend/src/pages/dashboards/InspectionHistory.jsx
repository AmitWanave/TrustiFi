import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Calendar, User, CheckCircle, FileText, TrendingUp } from 'lucide-react';
import Loader from '../../components/Loader';
import { Link } from 'react-router-dom';
import TrustBadge from '../../components/TrustBadge';

const InspectionHistory = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/inspections/assigned?status=completed');
        setReports(data.reports);
      } catch (error) {
        toast.error('Failed to fetch inspection history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <Loader />;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Inspection History</h2>
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{reports.length} Completed Reports</span>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {reports.map(report => (
          <div key={report._id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <img 
              src={(report.listing?.images?.[0]?.url.startsWith('http') || report.listing?.images?.[0]?.url.startsWith('https')) ? report.listing.images[0].url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${report.listing?.images?.[0]?.url}`} 
              alt={report.listing?.title} 
              style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '4px' }}
              onError={(e) => { e.target.src = '/placeholder-phone.jpg'; }}
            />
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                 <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{report.listing?.brand} {report.listing?.model}</h3>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ transform: 'scale(0.8)', transformOrigin: 'right' }}>
                       <TrustBadge score={report.trustScore?.overall} grade={report.trustScore?.grade} />
                    </div>
                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'var(--color-success)15', color: 'var(--color-success)', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
                       Completed
                    </span>
                 </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> Seller: {report.requestedBy?.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {new Date(report.completedDate || report.updatedAt).toLocaleDateString()}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent-primary)' }}><TrendingUp size={14} /> Score: {report.trustScore?.overall}/100</div>
              </div>
            </div>

            <Link 
              to={`/inspector/report/${report._id}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', border: '1px solid var(--glass-border)', color: 'var(--color-text-primary)', borderRadius: '4px', fontWeight: 600, fontSize: '0.9rem' }}
            >
              <FileText size={16} /> View Report
            </Link>
          </div>
        ))}

        {reports.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)', background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-lg)' }}>
            <CheckCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>No completed inspections yet</h3>
            <p>Your finished reports will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionHistory;
