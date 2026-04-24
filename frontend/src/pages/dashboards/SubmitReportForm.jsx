import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle2, AlertCircle, Camera } from 'lucide-react';
import Loader from '../../components/Loader';

const SubmitReportForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reportData, setReportData] = useState(null);

  const [formData, setFormData] = useState({
    imei: { number: '', isClean: true, modelMatch: true },
    hardware: { screen: 'pass', battery: 'pass', camera: 'pass', speakers: 'pass', buttons: 'pass', chargingPort: 'pass', wifi: 'pass', bluetooth: 'pass' },
    battery: { healthPercentage: 100, cycleCount: 0, status: 'good' },
    parts: { screenOriginal: true, batteryOriginal: true, cameraOriginal: true, housingOriginal: true },
    performance: { cpuScore: 90, gpuScore: 90, ramTest: 'pass', storageTest: 'pass' },
    summary: '',
    recommendations: '',
    redFlags: []
  });

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data } = await api.get(`/inspections/${id}`);
        setReportData(data.report);
      } catch (error) {
        toast.error('Failed to fetch inspection details');
        navigate('/inspector');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id, navigate]);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/inspections/${id}/submit`, formData);
      toast.success('Inspection report submitted successfully!');
      navigate('/inspector/history');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Inspection Report</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Conducting inspection for <strong>{reportData?.listing?.brand} {reportData?.listing?.model}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem', maxWidth: '1000px' }}>
        
        {/* IMEI & Security */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'grid', gap: '1.25rem' }}>
           <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={20} color="var(--color-warning)" /> IMEI & Identity
           </h3>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
             <div>
               <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>IMEI Number *</label>
               <input 
                 type="text" 
                 required 
                 value={formData.imei.number} 
                 onChange={(e) => handleInputChange('imei', 'number', e.target.value)}
                 style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }}
               />
             </div>
             <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '1.5rem' }}>
               <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                 <input type="checkbox" checked={formData.imei.isClean} onChange={(e) => handleInputChange('imei', 'isClean', e.target.checked)} />
                 <span>IMEI Is Clean</span>
               </label>
               <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                 <input type="checkbox" checked={formData.imei.modelMatch} onChange={(e) => handleInputChange('imei', 'modelMatch', e.target.checked)} />
                 <span>Model Matches IMEI</span>
               </label>
             </div>
           </div>
        </div>

        {/* Dynamic Grading Sections */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          {/* Hardware Checks */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>Hardware Status</h3>
            {Object.keys(formData.hardware).map(field => (
              <div key={field} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ textTransform: 'capitalize', fontSize: '0.95rem' }}>{field.replace(/([A-Z])/g, ' $1')}</span>
                <select 
                  value={formData.hardware[field]} 
                  onChange={(e) => handleInputChange('hardware', field, e.target.value)}
                  style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }}
                >
                  <option value="pass">Pass ✅</option>
                  <option value="minor_issue">Minor Issue ⚠️</option>
                  <option value="fail">Fail ❌</option>
                  <option value="not_tested">Not Tested</option>
                </select>
              </div>
            ))}
          </div>

          {/* Parts Originality */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>OEM Parts Check</h3>
            {Object.keys(formData.parts).map(field => (
              <div key={field} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ textTransform: 'capitalize', fontSize: '0.95rem' }}>{field.replace(/Original/g, '')}</span>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                    <input type="radio" checked={formData.parts[field] === true} onChange={() => handleInputChange('parts', field, true)} /> Original
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                    <input type="radio" checked={formData.parts[field] === false} onChange={() => handleInputChange('parts', field, false)} /> Refurbished
                  </label>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Battery Health */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>Battery Performance</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Health (%) *</label>
              <input type="number" value={formData.battery.healthPercentage} onChange={(e) => handleInputChange('battery', 'healthPercentage', Number(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Cycle Count</label>
              <input type="number" value={formData.battery.cycleCount} onChange={(e) => handleInputChange('battery', 'cycleCount', Number(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Status *</label>
              <select value={formData.battery.status} onChange={(e) => handleInputChange('battery', 'status', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }}>
                <option value="good">Good</option>
                <option value="service_required">Service Required</option>
                <option value="degraded">Degraded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>Final Summary</h3>
          <textarea 
            value={formData.summary} 
            onChange={(e) => setFormData({...formData, summary: e.target.value})}
            placeholder="Provide a general assessment of the device..."
            style={{ width: '100%', padding: '1rem', borderRadius: '4px', border: '1px solid var(--glass-border)', height: '100px', resize: 'vertical' }}
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          style={{ padding: '1rem', background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-lg)' }}
        >
          {submitting ? <Loader2 className="animate-spin" size={24} /> : 'Complete Inspection & Generate Trust Score'}
        </button>

      </form>
    </div>
  );
};

export default SubmitReportForm;
