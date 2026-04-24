import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Calendar, User, MapPin, ChevronRight, ClipboardList } from 'lucide-react';
import Loader from '../../components/Loader';
import { Link } from 'react-router-dom';

const AssignedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await api.get('/inspections/assigned');
        // Filter out completed jobs
        const activeJobs = data.reports.filter(job => job.status !== 'completed');
        setJobs(activeJobs);
      } catch (error) {
        toast.error('Failed to fetch assigned jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) return <Loader />;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Assigned Inspections</h2>
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{jobs.length} Active Tasks</span>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {jobs.map(job => (
          <div key={job._id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <img 
              src={(job.listing?.images?.[0]?.url.startsWith('http') || job.listing?.images?.[0]?.url.startsWith('https')) ? job.listing.images[0].url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${job.listing?.images?.[0]?.url}`} 
              alt={job.listing?.title} 
              style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '4px' }}
              onError={(e) => { e.target.src = '/placeholder-phone.jpg'; }}
            />
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                 <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{job.listing?.brand} {job.listing?.model}</h3>
                 <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'var(--color-bg-elevated)', borderRadius: '4px', textTransform: 'uppercase', color: 'var(--color-warning)', fontWeight: 600 }}>
                    {job.status}
                 </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> {job.requestedBy?.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {job.requestedBy?.location?.city}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {new Date(job.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            <Link 
              to={`/inspector/submit/${job._id}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: 'var(--color-accent-primary)', color: 'white', borderRadius: '4px', fontWeight: 600, fontSize: '0.9rem' }}
            >
              Start Inspection <ChevronRight size={16} />
            </Link>
          </div>
        ))}

        {jobs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)', background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-lg)' }}>
            <ClipboardList size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>No pending inspections</h3>
            <p>Check back later for new assignments.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedJobs;
