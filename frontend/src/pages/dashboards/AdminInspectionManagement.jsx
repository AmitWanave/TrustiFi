import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  ShieldAlert, Clock, CheckCircle, User, Package,
  Loader2, CalendarDays, UserCheck, ChevronDown, ChevronUp, AlertCircle,
} from 'lucide-react';

const statusConfig = {
  pending:   { label: 'Pending',   color: '#f59e0b', bg: '#f59e0b18', border: '#f59e0b40' },
  assigned:  { label: 'Assigned',  color: '#3b82f6', bg: '#3b82f618', border: '#3b82f640' },
  completed: { label: 'Completed', color: '#22c55e', bg: '#22c55e18', border: '#22c55e40' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: '#ef444418', border: '#ef444440' },
};

const AdminInspectionManagement = () => {
  const [reports, setReports] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [assignState, setAssignState] = useState({}); // { [reportId]: { inspectorId, submitting } }
  const [activeTab, setActiveTab] = useState('pending');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [inspRes, usersRes] = await Promise.all([
        api.get('/inspections?limit=100'),
        api.get('/admin/users?role=inspector&limit=100'),
      ]);
      setReports(inspRes.data.reports || []);
      setInspectors(usersRes.data.users || []);
    } catch {
      toast.error('Failed to load inspection data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredReports = reports.filter((r) => {
    if (activeTab === 'pending') return r.status === 'pending';
    if (activeTab === 'assigned') return r.status === 'assigned';
    if (activeTab === 'completed') return r.status === 'completed';
    return true;
  });

  const counts = {
    pending: reports.filter((r) => r.status === 'pending').length,
    assigned: reports.filter((r) => r.status === 'assigned').length,
    completed: reports.filter((r) => r.status === 'completed').length,
    all: reports.length,
  };

  const handleAssign = async (reportId) => {
    const state = assignState[reportId] || {};
    if (!state.inspectorId) return toast.error('Please select an inspector first');
    setAssignState((prev) => ({ ...prev, [reportId]: { ...state, submitting: true } }));
    try {
      await api.patch(`/inspections/${reportId}/assign`, {
        inspectorId: state.inspectorId,
        scheduledDate: state.scheduledDate,
      });
      toast.success('Inspector assigned successfully!');
      fetchData();
      setExpandedId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
      setAssignState((prev) => ({ ...prev, [reportId]: { ...state, submitting: false } }));
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-secondary)' }}>
        <Loader2 size={24} className="spin" />
        <span>Loading inspection requests…</span>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShieldAlert size={22} />
          Inspection Requests
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Manage and assign inspector to seller inspection requests
        </p>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1px' }}>
        {[
          { key: 'pending', label: 'Pending', icon: <Clock size={15} /> },
          { key: 'assigned', label: 'Assigned', icon: <UserCheck size={15} /> },
          { key: 'completed', label: 'Completed', icon: <CheckCircle size={15} /> },
          { key: 'all', label: 'All', icon: <Package size={15} /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.6rem 1.1rem',
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid var(--color-accent-primary)' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === tab.key ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === tab.key ? 700 : 400,
              cursor: 'pointer',
              fontSize: '0.88rem',
              transition: 'all 0.2s',
            }}
          >
            {tab.icon}
            {tab.label}
            <span style={{
              background: activeTab === tab.key ? 'var(--color-accent-primary)' : 'var(--glass-border)',
              color: activeTab === tab.key ? 'white' : 'var(--color-text-muted)',
              borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700,
              padding: '0.1rem 0.45rem', lineHeight: 1.6,
            }}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filteredReports.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed var(--glass-border)', borderRadius: 'var(--radius-lg)' }}>
          <AlertCircle size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem' }}>No {activeTab} inspection requests</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {activeTab === 'pending' ? 'No sellers have requested an inspection yet.' : `No ${activeTab} inspections at the moment.`}
          </p>
        </div>
      )}

      {/* Report List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredReports.map((report) => {
          const cfg = statusConfig[report.status] || statusConfig.pending;
          const isExpanded = expandedId === report._id;
          const aState = assignState[report._id] || {};
          const primaryImg = report.listing?.images?.find((i) => i.isPrimary)?.url || report.listing?.images?.[0]?.url;

          return (
            <div
              key={report._id}
              style={{
                background: 'var(--color-bg-elevated)',
                border: `1px solid var(--glass-border)`,
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
              }}
            >
              {/* Card Header */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', cursor: 'pointer', background: 'var(--color-bg-card)' }}
                onClick={() => setExpandedId(isExpanded ? null : report._id)}
              >
                {/* Thumbnail */}
                <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0, background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {primaryImg
                    ? <img src={`http://localhost:5000${primaryImg}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Package size={22} style={{ color: 'var(--color-text-muted)' }} />}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {report.listing?.title || 'Unknown Listing'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span><User size={12} style={{ marginRight: 3, verticalAlign: 'middle' }} />{report.requestedBy?.name}</span>
                    <span><CalendarDays size={12} style={{ marginRight: 3, verticalAlign: 'middle' }} />{new Date(report.createdAt).toLocaleDateString()}</span>
                    {report.inspector && (
                      <span style={{ color: '#3b82f6' }}><UserCheck size={12} style={{ marginRight: 3, verticalAlign: 'middle' }} />{report.inspector.name}</span>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: cfg.bg,
                  color: cfg.color,
                  border: `1px solid ${cfg.border}`,
                  flexShrink: 0,
                }}>
                  {cfg.label}
                </span>

                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>

              {/* Expanded Details + Assign */}
              {isExpanded && (
                <div style={{ padding: '1.25rem', borderTop: '1px solid var(--glass-border)' }}>
                  {/* Listing Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.6rem', marginBottom: '1.25rem' }}>
                    {[
                      { label: 'Brand', value: report.listing?.brand },
                      { label: 'Model', value: report.listing?.model },
                      { label: 'Requested By', value: report.requestedBy?.name },
                      { label: 'Email', value: report.requestedBy?.email },
                      { label: 'Status', value: cfg.label },
                      ...(report.scheduledDate ? [{ label: 'Scheduled', value: new Date(report.scheduledDate).toLocaleDateString() }] : []),
                    ].map(({ label, value }) => (
                      <div key={label} style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem' }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '0.15rem' }}>{value || '—'}</div>
                      </div>
                    ))}
                  </div>

                  {/* Assign Section — only for pending */}
                  {report.status === 'pending' && (
                    <div style={{
                      background: 'linear-gradient(135deg, #1e3a5f12, #3b82f60a)',
                      border: '1px solid #3b82f630',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem 1.25rem',
                    }}>
                      <h4 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                        <UserCheck size={18} style={{ color: '#3b82f6' }} />
                        Assign Inspector
                      </h4>

                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        {/* Inspector Select */}
                        <div style={{ flex: '1 1 200px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                            Select Inspector
                          </label>
                          <select
                            value={aState.inspectorId || ''}
                            onChange={(e) => setAssignState((prev) => ({ ...prev, [report._id]: { ...aState, inspectorId: e.target.value } }))}
                            style={{
                              width: '100%', padding: '0.6rem 0.85rem',
                              background: 'var(--color-bg-card)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: 'var(--radius-md)',
                              color: 'var(--color-text-primary)',
                              fontSize: '0.88rem',
                            }}
                          >
                            <option value="">— Choose inspector —</option>
                            {inspectors.map((insp) => (
                              <option key={insp._id} value={insp._id}>{insp.name} ({insp.email})</option>
                            ))}
                          </select>
                        </div>

                        {/* Scheduled Date */}
                        <div style={{ flex: '1 1 160px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                            Scheduled Date (optional)
                          </label>
                          <input
                            type="date"
                            value={aState.scheduledDate || ''}
                            onChange={(e) => setAssignState((prev) => ({ ...prev, [report._id]: { ...aState, scheduledDate: e.target.value } }))}
                            style={{
                              width: '100%', padding: '0.6rem 0.85rem',
                              background: 'var(--color-bg-card)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: 'var(--radius-md)',
                              color: 'var(--color-text-primary)',
                              fontSize: '0.88rem',
                            }}
                          />
                        </div>

                        {/* Assign Button */}
                        <button
                          disabled={!aState.inspectorId || aState.submitting}
                          onClick={() => handleAssign(report._id)}
                          style={{
                            padding: '0.6rem 1.5rem',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 700,
                            cursor: aState.inspectorId && !aState.submitting ? 'pointer' : 'not-allowed',
                            opacity: !aState.inspectorId || aState.submitting ? 0.5 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            flexShrink: 0,
                            height: 'fit-content',
                          }}
                        >
                          {aState.submitting ? <Loader2 size={16} className="spin" /> : <UserCheck size={16} />}
                          Assign
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Completed trust score */}
                  {report.status === 'completed' && report.trustScore && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      background: '#22c55e12', border: '1px solid #22c55e30',
                      borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem',
                    }}>
                      <CheckCircle size={22} style={{ color: '#22c55e', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 700 }}>Trust Score: {report.trustScore.overall}/100 — Grade {report.trustScore.grade}</div>
                        {report.summary && <div style={{ fontSize: '0.83rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>{report.summary}</div>}
                      </div>
                    </div>
                  )}
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

export default AdminInspectionManagement;
