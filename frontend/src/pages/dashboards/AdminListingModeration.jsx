import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  CheckCircle, XCircle, ShieldCheck, Upload, ChevronDown, ChevronUp,
  User, Tag, MapPin, Calendar, Eye, FileText, Loader2, AlertCircle,
} from 'lucide-react';

const AdminListingModeration = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [actionState, setActionState] = useState({}); // per listing

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/listings/pending');
      setListings(data.listings || []);
    } catch {
      toast.error('Failed to load pending listings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const initState = (id) => ({
    verifiedByTrustifi: false,
    reportFile: null,
    note: '',
    submitting: false,
    ...(actionState[id] || {}),
  });

  const updateState = (id, patch) =>
    setActionState((prev) => ({ ...prev, [id]: { ...initState(id), ...patch } }));

  const handleModerate = async (listing, action) => {
    const state = initState(listing._id);
    updateState(listing._id, { submitting: true });

    try {
      const formData = new FormData();
      formData.append('action', action);
      if (state.note) formData.append('note', state.note);
      if (action === 'approve') {
        formData.append('verifiedByTrustifi', state.verifiedByTrustifi ? 'true' : 'false');
        if (state.verifiedByTrustifi && state.reportFile) {
          formData.append('verificationReport', state.reportFile);
        }
      }

      await api.patch(`/admin/listings/${listing._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(
        action === 'approve'
          ? `✅ "${listing.title}" approved!`
          : `❌ "${listing.title}" rejected.`
      );
      // Remove from list
      setListings((prev) => prev.filter((l) => l._id !== listing._id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
      updateState(listing._id, { submitting: false });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-secondary)' }}>
        <Loader2 size={24} className="spin" />
        <span>Loading pending listings…</span>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <CheckCircle size={56} style={{ color: 'var(--color-accent-primary)', marginBottom: '1rem' }} />
        <h3 style={{ marginBottom: '0.5rem' }}>All clear!</h3>
        <p style={{ color: 'var(--color-text-secondary)' }}>No listings pending approval right now.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Listing Moderation</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
          {listings.length} listing{listings.length !== 1 ? 's' : ''} awaiting review
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {listings.map((listing) => {
          const state = initState(listing._id);
          const isExpanded = expandedId === listing._id;
          const primaryImg = listing.images?.find((i) => i.isPrimary)?.url || listing.images?.[0]?.url;

          return (
            <div
              key={listing._id}
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                transition: 'box-shadow 0.2s',
              }}
            >
              {/* ── Card Header ──────────────────────────────── */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  cursor: 'pointer',
                  background: 'var(--color-bg-card)',
                }}
                onClick={() => setExpandedId(isExpanded ? null : listing._id)}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: 'var(--color-bg-elevated)',
                  }}
                >
                  {primaryImg ? (
                    <img
                      src={(primaryImg.startsWith('http') || primaryImg.startsWith('https')) ? primaryImg : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${primaryImg}`}
                      alt={listing.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertCircle size={22} style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {listing.title}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span><Tag size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />{listing.brand} {listing.model}</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-accent-primary)' }}>
                      ₹{Number(listing.price?.asking).toLocaleString()}
                    </span>
                    <span><User size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />{listing.seller?.name}</span>
                    <span><Calendar size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Condition badge */}
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: listing.condition === 'Like New' ? '#16a34a22' : '#ca8a0422',
                  color: listing.condition === 'Like New' ? '#22c55e' : '#eab308',
                  flexShrink: 0,
                }}>
                  {listing.condition}
                </span>

                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              {/* ── Expanded Detail ──────────────────────────── */}
              {isExpanded && (
                <div style={{ padding: '1.25rem', borderTop: '1px solid var(--glass-border)' }}>

                  {/* Image Gallery */}
                  {listing.images?.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', marginBottom: '1.25rem', paddingBottom: '0.5rem' }}>
                      {listing.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={(img.url.startsWith('http') || img.url.startsWith('https')) ? img.url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${img.url}`}
                          alt={`Image ${idx + 1}`}
                          style={{
                            height: 120,
                            width: 120,
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-md)',
                            flexShrink: 0,
                            border: img.isPrimary ? '2px solid var(--color-accent-primary)' : '1px solid var(--glass-border)',
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Specs Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {[
                      { label: 'Brand', value: listing.brand },
                      { label: 'Model', value: listing.model },
                      { label: 'Condition', value: listing.condition },
                      { label: 'Price', value: `₹${Number(listing.price?.asking).toLocaleString()}` },
                      { label: 'Negotiable', value: listing.price?.negotiable ? 'Yes' : 'No' },
                      ...(listing.specs?.ram ? [{ label: 'RAM', value: listing.specs.ram }] : []),
                      ...(listing.specs?.storage ? [{ label: 'Storage', value: listing.specs.storage }] : []),
                      ...(listing.specs?.color ? [{ label: 'Color', value: listing.specs.color }] : []),
                      ...(listing.specs?.battery ? [{ label: 'Battery', value: listing.specs.battery }] : []),
                      ...(listing.specs?.camera ? [{ label: 'Camera', value: listing.specs.camera }] : []),
                      ...(listing.specs?.processor ? [{ label: 'Processor', value: listing.specs.processor }] : []),
                      ...(listing.specs?.year ? [{ label: 'Year', value: listing.specs.year }] : []),
                    ].map(({ label, value }) => (
                      <div key={label} style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.85rem' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.2rem' }}>{value || '—'}</div>
                      </div>
                    ))}
                  </div>

                  {/* Seller Info */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem', marginBottom: '1.25rem',
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%', background: 'var(--color-accent-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700,
                    }}>
                      {listing.seller?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{listing.seller?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        {listing.seller?.email}
                        {listing.seller?.isVerified && (
                          <span style={{ marginLeft: '0.5rem', color: 'var(--color-accent-primary)' }}>✓ Verified</span>
                        )}
                      </div>
                    </div>
                    {listing.location?.city && (
                      <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={14} /> {listing.location.city}, {listing.location.state || listing.location.country}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {listing.description && (
                    <div style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                      <strong style={{ color: 'var(--color-text-primary)' }}>Description: </strong>
                      {listing.description}
                    </div>
                  )}

                  {/* Admin Note */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                      Admin Note (optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Add a note for the seller (required for rejection)…"
                      value={state.note}
                      onChange={(e) => updateState(listing._id, { note: e.target.value })}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '0.65rem 0.9rem',
                        background: 'var(--color-bg-card)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-text-primary)',
                        resize: 'vertical', fontSize: '0.9rem',
                      }}
                    />
                  </div>

                  {/* ── Verified by TrustiFi ── */}
                  <div style={{
                    background: 'linear-gradient(135deg, #0f4c2a18, #16a34a0a)',
                    border: '1px solid #22c55e30',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.25rem',
                    marginBottom: '1.25rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <ShieldCheck size={22} style={{ color: '#22c55e' }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Verified by TrustiFi</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                            Grant official TrustiFi verification badge to this listing
                          </div>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        onClick={() => updateState(listing._id, {
                          verifiedByTrustifi: !state.verifiedByTrustifi,
                          reportFile: !state.verifiedByTrustifi ? state.reportFile : null,
                        })}
                        style={{
                          width: 52,
                          height: 28,
                          borderRadius: '999px',
                          border: 'none',
                          cursor: 'pointer',
                          background: state.verifiedByTrustifi ? '#22c55e' : 'var(--glass-border)',
                          position: 'relative',
                          transition: 'background 0.25s',
                          flexShrink: 0,
                        }}
                        aria-label="Toggle Verified by TrustiFi"
                      >
                        <span style={{
                          position: 'absolute',
                          top: 3,
                          left: state.verifiedByTrustifi ? 26 : 3,
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: 'white',
                          transition: 'left 0.25s',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                        }} />
                      </button>
                    </div>

                    {/* Report Upload — only visible when toggle is ON */}
                    {state.verifiedByTrustifi && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #22c55e20' }}>
                        <label
                          htmlFor={`report-upload-${listing._id}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            cursor: 'pointer',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: `2px dashed ${state.reportFile ? '#22c55e' : '#22c55e50'}`,
                            background: state.reportFile ? '#22c55e12' : 'transparent',
                            transition: 'all 0.2s',
                          }}
                        >
                          {state.reportFile ? (
                            <>
                              <FileText size={20} style={{ color: '#22c55e' }} />
                              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#22c55e' }}>
                                {state.reportFile.name}
                              </span>
                              <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                                Click to change
                              </span>
                            </>
                          ) : (
                            <>
                              <Upload size={20} style={{ color: '#22c55e' }} />
                              <span style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
                                Upload Verification Report <span style={{ color: 'var(--color-text-muted)' }}>(PDF or image, optional)</span>
                              </span>
                            </>
                          )}
                        </label>
                        <input
                          id={`report-upload-${listing._id}`}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          style={{ display: 'none' }}
                          onChange={(e) => updateState(listing._id, { reportFile: e.target.files[0] || null })}
                        />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button
                      disabled={state.submitting}
                      onClick={() => handleModerate(listing, 'reject')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.65rem 1.5rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #ef444460',
                        background: '#ef444410',
                        color: '#ef4444',
                        fontWeight: 600, cursor: 'pointer',
                        opacity: state.submitting ? 0.6 : 1,
                        transition: 'all 0.2s',
                      }}
                    >
                      <XCircle size={18} />
                      Reject
                    </button>

                    <button
                      disabled={state.submitting}
                      onClick={() => handleModerate(listing, 'approve')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.65rem 1.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        background: 'var(--color-accent-primary)',
                        color: 'white',
                        fontWeight: 700, cursor: 'pointer',
                        opacity: state.submitting ? 0.6 : 1,
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(0,180,100,0.3)',
                      }}
                    >
                      {state.submitting ? <Loader2 size={18} className="spin" /> : <CheckCircle size={18} />}
                      {state.verifiedByTrustifi ? 'Approve & Verify' : 'Approve'}
                    </button>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default AdminListingModeration;
