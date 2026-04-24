import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { User, Phone, MapPin, AlignLeft, Camera, Loader2, Save, X, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileView = () => {
  const { user, setUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location?.city || '',
  });

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('bio', formData.bio);
      
      // Construct location object for the backend
      const locationObj = { city: formData.location };
      data.append('location', JSON.stringify(locationObj));

      if (avatarFile) {
        data.append('avatar', avatarFile);
      }

      const res = await api.put('/users/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setUser(res.data.user);
        toast.success('Profile updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      location: user?.location?.city || '',
    });
    setAvatarPreview(user?.avatar || null);
    setAvatarFile(null);
    setIsEditing(false);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Profile Details</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            Manage your account information and preferences.
          </p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.6rem 1.2rem', 
              background: 'var(--color-bg-elevated)', 
              color: 'var(--color-accent-primary)', 
              border: '1px solid var(--color-accent-primary)',
              borderRadius: 'var(--radius-md)', 
              fontWeight: 600, 
              cursor: 'pointer' 
            }}
          >
            <Edit2 size={16} /> Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2.5rem' }}>
        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
          
          {/* Avatar Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative', width: '150px', height: '150px' }}>
              <div style={{ 
                width: '100%', 
                height: '100%', 
                borderRadius: '50%', 
                background: 'var(--color-bg-base)', 
                overflow: 'hidden', 
                border: '4px solid var(--color-bg-elevated)',
                boxShadow: 'var(--shadow-lg)'
              }}>
                {avatarPreview ? (
                  <img 
                    src={avatarPreview.startsWith('data:') ? avatarPreview : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${avatarPreview}`} 
                    alt="Profile" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={64} color="var(--color-text-muted)" />
                  </div>
                )}
              </div>
              
              <AnimatePresence>
                {isEditing && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      position: 'absolute',
                      bottom: '5px',
                      right: '5px',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--color-accent-primary)',
                      color: 'white',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  >
                    <Camera size={20} />
                  </motion.button>
                )}
              </AnimatePresence>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
            </div>
            {isEditing && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Click to change photo</span>}
          </div>

          {/* Form Fields Section */}
          <div style={{ flex: 1, minWidth: '300px', display: 'grid', gap: '1.5rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  <User size={14} /> Full Name
                </label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Your full name"
                  style={{ 
                    width: '100%', 
                    padding: '0.8rem 1rem', 
                    background: isEditing ? 'var(--color-bg-base)' : 'transparent', 
                    border: isEditing ? '1px solid var(--glass-border)' : '1px solid transparent',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-primary)',
                    fontSize: '1rem',
                    transition: 'all 0.2s'
                  }}
                />
              </div>

              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  <Phone size={14} /> Phone Number
                </label>
                <input 
                  type="text" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="+91 XXXXX XXXXX"
                  style={{ 
                    width: '100%', 
                    padding: '0.8rem 1rem', 
                    background: isEditing ? 'var(--color-bg-base)' : 'transparent', 
                    border: isEditing ? '1px solid var(--glass-border)' : '1px solid transparent',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-primary)',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                <MapPin size={14} /> Location / City
              </label>
              <input 
                type="text" 
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="e.g. Mumbai, Maharashtra"
                style={{ 
                  width: '100%', 
                  padding: '0.8rem 1rem', 
                  background: isEditing ? 'var(--color-bg-base)' : 'transparent', 
                  border: isEditing ? '1px solid var(--glass-border)' : '1px solid transparent',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-primary)',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                <AlignLeft size={14} /> Bio / About You
              </label>
              <textarea 
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Write a brief bio..."
                style={{ 
                  width: '100%', 
                  padding: '0.8rem 1rem', 
                  background: isEditing ? 'var(--color-bg-base)' : 'transparent', 
                  border: isEditing ? '1px solid var(--glass-border)' : '1px solid transparent',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-primary)',
                  fontSize: '1rem',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Email Address (Verified)</label>
              <input 
                type="text" 
                value={user?.email} 
                disabled 
                style={{ 
                  width: '100%', 
                  padding: '0.8rem 1rem', 
                  background: 'var(--color-bg-elevated)', 
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-muted)',
                  fontSize: '1rem',
                  opacity: 0.7,
                  cursor: 'not-allowed'
                }} 
              />
            </div>

          </div>
        </div>

        <AnimatePresence>
          {isEditing && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', overflow: 'hidden' }}
            >
              <button 
                type="button" 
                onClick={cancelEdit}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  padding: '0.75rem 1.5rem', 
                  background: 'transparent', 
                  color: 'var(--color-text-secondary)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: 'var(--radius-md)', 
                  fontWeight: 600, 
                  cursor: 'pointer' 
                }}
              >
                <X size={18} /> Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  padding: '0.75rem 2rem', 
                  background: 'var(--color-accent-primary)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 'var(--radius-md)', 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Save Changes
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};

export default ProfileView;
