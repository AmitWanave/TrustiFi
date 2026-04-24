import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Camera, X, Loader2, LocateFixed, Check, ShieldAlert } from 'lucide-react';

const AddListingForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [imeiVerified, setImeiVerified] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    condition: '',
    description: '',
    askingPrice: '',
    isNegotiable: false,
    ram: '',
    storage: '',
    color: '',
    color: '',
    city: '',
    state: '',
    lat: '',
    lng: '',
    imei: '',
    isBlacklisted: false
  });

  const brands = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Vivo', 'Realme', 'Oppo', 'Motorola', 'Other'];
  const conditions = ['Like New', 'Excellent', 'Good', 'Fair'];
  const ramOptions = ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB+'];
  const storageOptions = ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      return toast.error('Maximum 5 images allowed');
    }

    setImages(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    toast.loading('Locating...', { id: 'locating' });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
          const state = data.address.state || '';
          setFormData(prev => ({ ...prev, city, state, lat: latitude, lng: longitude }));
          toast.success('Location detected', { id: 'locating' });
        } catch (e) {
          toast.error('Failed to get address', { id: 'locating' });
        }
      },
      () => toast.error('Location denied', { id: 'locating' })
    );
  };
  
  const handleVerifyImei = async () => {
    if (!formData.imei || formData.imei.length < 14) {
      return toast.error('Please enter a valid IMEI (14-16 digits)');
    }
    
    setVerifying(true);
    try {
      const { data } = await api.post('/listings/check-imei', { 
        deviceId: formData.imei, 
        brand: formData.brand || 'Apple' 
      });
      
      console.log('IMEI Verification Response:', data);
      
      // Axios response.data is { success: true, data: result }
      // The actual result from IMEIcheck is in data.data
      const result = data.data || {};
      
      // Service 12 often puts info in 'object' or 'properties' or 'result'
      const details = result.object || result.properties || result.result || result;
      
      // Robust blacklist check
      const blacklistStatus = 
        result.status === 'blacklisted' || 
        result.blacklist?.status === 'blacklisted' ||
        details.status === 'blacklisted' ||
        details.blacklist?.status === 'blacklisted';

      setFormData(prev => ({
        ...prev,
        brand: details.brand || details.Manufacturer || prev.brand,
        model: details.model_name || details.model?.name || details.Model || details.model || prev.model,
        ram: details.ram || details.RAM || prev.ram,
        storage: details.storage || details.Capacity || details.Storage || prev.storage,
        isBlacklisted: !!blacklistStatus
      }));
      
      setImeiVerified(true);
      toast.success('Device verified successfully!');
      if (blacklistStatus) {
        toast.error('Warning: This device is reported as blacklisted/stolen!', { duration: 6000 });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'IMEI verification failed. Please enter details manually.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) return toast.error('Please upload at least one image');

    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('brand', formData.brand);
    data.append('model', formData.model);
    data.append('condition', formData.condition);
    data.append('description', formData.description);
    
    const price = { asking: Number(formData.askingPrice), isNegotiable: formData.isNegotiable };
    data.append('price', JSON.stringify(price));
    
    const specs = { ram: formData.ram, storage: formData.storage, color: formData.color };
    data.append('specs', JSON.stringify(specs));
    
    const location = { city: formData.city, state: formData.state };
    data.append('location', JSON.stringify(location));
    data.append('isBlacklisted', formData.isBlacklisted);
    data.append('imei', formData.imei);

    let finalLat = formData.lat;
    let finalLng = formData.lng;

    // If manual location was typed without Lat/Lng, try to geocode it
    if (!finalLat && formData.city) {
      try {
        const query = encodeURIComponent(`${formData.city}, ${formData.state}`);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
        const result = await res.json();
        if (result && result.length > 0) {
          finalLat = result[0].lat;
          finalLng = result[0].lon;
        }
      } catch (e) {
        console.error('Manual geocoding failed', e);
      }
    }

    if (finalLat && finalLng) {
      data.append('lat', finalLat);
      data.append('lng', finalLng);
    }

    images.forEach(image => {
      data.append('images', image);
    });

    try {
      await api.post('/listings', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Listing created successfully! Waiting for admin approval.');
      navigate('/seller/listings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Sell Your Smartphone</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem', maxWidth: '800px' }}>
        
        {/* Basic Info */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'grid', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Basic Details</h3>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>IMEI / Serial Number *</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="text" 
                name="imei" 
                required 
                value={formData.imei} 
                onChange={handleInputChange} 
                placeholder="Enter 15-digit IMEI"
                style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }}
              />
              <button 
                type="button" 
                onClick={handleVerifyImei} 
                disabled={verifying || !formData.imei}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  background: imeiVerified ? 'var(--color-success, #16a34a)' : 'var(--color-accent-primary)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {verifying ? <Loader2 className="animate-spin" size={18} /> : imeiVerified ? <><Check size={18} /> Verified</> : 'Verify Device'}
              </button>
            </div>
            {formData.isBlacklisted && (
              <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '4px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                <ShieldAlert size={20} />
                <strong>Warning: Stolen/Blacklisted device detected. Buy on your own risk!</strong>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Brand *</label>
              <select 
                name="brand" 
                required 
                value={formData.brand} 
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }}
              >
                <option value="">Select Brand</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Model *</label>
              <input 
                type="text" 
                name="model" 
                required 
                value={formData.model} 
                onChange={handleInputChange} 
                placeholder="e.g. iPhone 14 Pro"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Listing Title *</label>
            <input 
              type="text" 
              name="title" 
              required 
              value={formData.title} 
              onChange={handleInputChange} 
              placeholder="Keep it catchy! e.g. Mint condition iPhone 14 Pro"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Condition *</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {conditions.map(c => (
                <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="condition" value={c} checked={formData.condition === c} onChange={handleInputChange} required />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'grid', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Specifications</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>RAM *</label>
              <select name="ram" required value={formData.ram} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }}>
                <option value="">Select</option>
                {ramOptions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Storage *</label>
              <select name="storage" required value={formData.storage} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }}>
                <option value="">Select</option>
                {storageOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Color *</label>
              <input type="text" name="color" required value={formData.color} onChange={handleInputChange} placeholder="e.g. Jet Black" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Description *</label>
            <textarea 
              name="description" 
              required 
              rows="4" 
              value={formData.description} 
              onChange={handleInputChange}
              placeholder="Tell buyers about usage, battery health, accessories included..."
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)', resize: 'vertical' }}
            ></textarea>
          </div>
        </div>

        {/* Price & Location */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'grid', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
             <h3 style={{ fontSize: '1.1rem' }}>Price & Location</h3>
             <button type="button" onClick={handleUseLocation} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-accent-primary)', color: 'var(--color-accent-primary)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
               <LocateFixed size={14} /> Use My Location
             </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Asking Price (₹) *</label>
              <input type="number" name="askingPrice" required value={formData.askingPrice} onChange={handleInputChange} placeholder="0" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
            </div>
            <div style={{ alignSelf: 'center', paddingTop: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="isNegotiable" checked={formData.isNegotiable} onChange={handleInputChange} />
                <span>Price is Negotiable</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>City *</label>
              <input type="text" name="city" required value={formData.city} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>State *</label>
              <input type="text" name="state" required value={formData.state} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>Photos (Up to 5) *</h3>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {previews.map((src, idx) => (
              <div key={idx} style={{ position: 'relative', width: '100px', height: '100px' }}>
                <img src={src} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                <button 
                  type="button" 
                  onClick={() => removeImage(idx)}
                  style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {previews.length < 5 && (
              <label style={{ width: '100px', height: '100px', border: '2px dashed var(--glass-border)', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-secondary)', transition: 'all 0.2s' }}>
                <Camera size={24} />
                <span style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Add Photo</span>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '1rem', background: 'var(--color-accent-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-md)' }}
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : 'Post Listing Now'}
        </button>

      </form>
    </div>
  );
};

export default AddListingForm;
