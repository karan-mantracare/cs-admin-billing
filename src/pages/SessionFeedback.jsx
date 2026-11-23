import React, { useState, useEffect, useMemo, useRef } from 'react';
import { INITIAL_SESSION_FEEDBACKS } from '../data/sessionFeedbackData';

export default function SessionFeedback() {
  // Feedbacks state backed by localStorage
  const [feedbacks, setFeedbacks] = useState(() => {
    try {
      const saved = localStorage.getItem('session_feedbacks_data');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SESSION_FEEDBACKS;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('session_feedbacks_data', JSON.stringify(feedbacks));
    } catch {}
  }, [feedbacks]);

  // Tab: 'critical', 'all', or 'false_alarm'
  const [activeTab, setActiveTab] = useState('critical');

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Status Filter: 'all', 'Pending', 'False Alarm', 'Verified Risk'
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting
  const [sortField, setSortField] = useState('dateTime');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    dateTime: true,
    providerName: true,
    userName: true,
    critical: true,
    verification: true,
    responses: true
  });
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const columnDropdownRef = useRef(null);

  // Modals state
  const [selectedVerifySession, setSelectedVerifySession] = useState(null);
  const [verifyStatusChoice, setVerifyStatusChoice] = useState('False Alarm');
  const [verifyNotes, setVerifyNotes] = useState('');

  const [selectedResponseSession, setSelectedResponseSession] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (columnDropdownRef.current && !columnDropdownRef.current.contains(e.target)) {
        setIsColumnDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Metrics calculations
  const metrics = useMemo(() => {
    const total = feedbacks.length;
    const criticalCount = feedbacks.filter(f => f.critical).length;
    const pendingCount = feedbacks.filter(f => f.critical && (f.verificationStatus === 'Pending' || !f.verificationStatus)).length;
    const falseAlarmCount = feedbacks.filter(f => f.verificationStatus === 'False Alarm').length;
    const verifiedRiskCount = feedbacks.filter(f => f.verificationStatus === 'Verified Risk').length;
    return {
      total,
      criticalCount,
      pendingCount,
      falseAlarmCount,
      verifiedRiskCount
    };
  }, [feedbacks]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return feedbacks.filter(item => {
      // Tab filter
      if (activeTab === 'critical' && !item.critical) return false;
      if (activeTab === 'false_alarm' && item.verificationStatus !== 'False Alarm') return false;

      // Status dropdown filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'Pending' && item.verificationStatus !== 'Pending') return false;
        if (statusFilter === 'False Alarm' && item.verificationStatus !== 'False Alarm') return false;
        if (statusFilter === 'Verified Risk' && item.verificationStatus !== 'Verified Risk') return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesId = (item.id || '').toLowerCase().includes(q);
        const matchesProvider = (item.providerName || '').toLowerCase().includes(q);
        const matchesUser = (item.userName || '').toLowerCase().includes(q);
        const matchesClient = (item.clientName || '').toLowerCase().includes(q);
        const matchesReason = (item.criticalReason || '').toLowerCase().includes(q);
        if (!matchesId && !matchesProvider && !matchesUser && !matchesClient && !matchesReason) return false;
      }
      return true;
    });
  }, [feedbacks, activeTab, statusFilter, searchTerm]);

  // Sorted dataset
  const sortedData = useMemo(() => {
    const list = [...filteredData];
    list.sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredData, sortField, sortDirection]);

  // Paginated dataset
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + rowsPerPage);

  // Reset page when filter/search/rowsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, statusFilter, searchTerm, rowsPerPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Open Verify Modal
  const openVerifyModal = (session) => {
    setSelectedVerifySession(session);
    setVerifyStatusChoice(session.verificationStatus === 'Pending' ? 'False Alarm' : (session.verificationStatus || 'False Alarm'));
    setVerifyNotes(session.verificationNotes || '');
  };

  // Handle Verify Submission
  const handleSaveVerification = (e) => {
    e.preventDefault();
    if (!selectedVerifySession) return;

    setFeedbacks(prev => prev.map(item => {
      if (item.id === selectedVerifySession.id) {
        return {
          ...item,
          verificationStatus: verifyStatusChoice,
          verificationLabel: verifyStatusChoice === 'False Alarm' ? 'False Alarm' : (verifyStatusChoice === 'Verified Risk' ? 'Verified Risk' : 'Resolved'),
          verificationNotes: verifyNotes,
          verifiedAt: new Date().toISOString()
        };
      }
      return item;
    }));

    showToast(`Session ${selectedVerifySession.id} verified as "${verifyStatusChoice}"`);
    setSelectedVerifySession(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Date Time', 'Provider Name', 'Provider Specialty', 'User Name', 'User Email', 'Client Name', 'Critical', 'Verification Status', 'Critical Reason'];
    const rows = filteredData.map(item => [
      item.id,
      item.dateTime,
      `"${item.providerName || ''}"`,
      `"${item.providerSpecialty || ''}"`,
      `"${item.userName || ''}"`,
      `"${item.userEmail || ''}"`,
      `"${item.clientName || ''}"`,
      item.critical ? 'Yes' : 'No',
      `"${item.verificationStatus || 'Pending'}"`,
      `"${(item.criticalReason || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `session_feedback_${activeTab}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported session feedback CSV successfully');
  };

  // Reset to default sample
  const handleResetData = () => {
    if (window.confirm('Reset all session feedback to default sample dataset?')) {
      setFeedbacks(INITIAL_SESSION_FEEDBACKS);
      localStorage.setItem('session_feedbacks_data', JSON.stringify(INITIAL_SESSION_FEEDBACKS));
      showToast('Session feedback data reset to original records');
    }
  };

  return (
    <div className="page-container" style={{ padding: '1.5rem 2rem', background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          background: '#0f172a',
          color: 'white',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          fontSize: '0.88rem',
          fontWeight: '500',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <i className='bx bx-check-circle' style={{ color: '#10b981', fontSize: '1.3rem' }}></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header matching platform style */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: '700',
              letterSpacing: '0.05em',
              color: '#0284c7',
              background: '#e0f2fe',
              padding: '0.2rem 0.6rem',
              borderRadius: '4px',
              textTransform: 'uppercase'
            }}>
              Clinical Quality &bull; Provider Care
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.35rem',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
            }}>
              <i className='bx bx-message-square-detail'></i>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
                Session Feedback
              </h1>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
                Audit participant ratings, triage clinical crisis alerts, and verify post-session feedback logs.
              </p>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleResetData}
            title="Reload default sample session records"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.85rem',
              background: 'white',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              color: '#64748b',
              fontWeight: '600',
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.color = '#334155'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#64748b'; }}
          >
            <i className='bx bx-refresh' style={{ fontSize: '1.1rem' }}></i>
            <span>Reset Sample</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              background: '#0284c7',
              color: 'white',
              border: 'none',
              fontWeight: '600',
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#0369a1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#0284c7'; }}
          >
            <i className='bx bx-download' style={{ fontSize: '1.1rem' }}></i>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Card 1: Critical Triggers */}
        <div style={{ background: 'white', borderRadius: '10px', padding: '1rem 1.15rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #dc2626', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Critical Triggers</span>
            <i className='bx bx-alarm-exclamation' style={{ fontSize: '1.25rem', color: '#dc2626' }}></i>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#dc2626', marginTop: '0.3rem' }}>
            {metrics.criticalCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: '600', marginTop: '0.2rem' }}>
            {metrics.pendingCount} Pending Triage &bull; {metrics.verifiedRiskCount} Confirmed Risk
          </div>
        </div>

        {/* Card 2: Pending Verifications */}
        <div style={{ background: 'white', borderRadius: '10px', padding: '1rem 1.15rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Awaiting Verification</span>
            <i className='bx bx-time-five' style={{ fontSize: '1.25rem', color: '#f59e0b' }}></i>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#b45309', marginTop: '0.3rem' }}>
            {metrics.pendingCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
            Requires clinical lead sign-off
          </div>
        </div>

        {/* Card 3: Cleared False Alarms */}
        <div style={{ background: 'white', borderRadius: '10px', padding: '1rem 1.15rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Audited False Alarms</span>
            <i className='bx bx-check-shield' style={{ fontSize: '1.25rem', color: '#10b981' }}></i>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#059669', marginTop: '0.3rem' }}>
            {metrics.falseAlarmCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: '600', marginTop: '0.2rem' }}>
            Cleared &amp; marked safe by triage
          </div>
        </div>

        {/* Card 4: Total Feedbacks Logged */}
        <div style={{ background: 'white', borderRadius: '10px', padding: '1rem 1.15rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #0284c7', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Session Audits</span>
            <i className='bx bx-file-blank' style={{ fontSize: '1.25rem', color: '#0284c7' }}></i>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '0.3rem' }}>
            {metrics.total}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
            100% feedback form completion rate
          </div>
        </div>
      </div>

      {/* Main Card with Tabs & Table */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', overflow: 'hidden' }}>

        {/* Sub-tabs strip */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #e2e8f0', padding: '0 1.25rem', background: '#fafbfc' }}>
          {/* Critical Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('critical')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.95rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'critical' ? '3px solid #0284c7' : '3px solid transparent',
              color: activeTab === 'critical' ? '#0284c7' : '#64748b',
              fontWeight: activeTab === 'critical' ? '700' : '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <i className='bx bx-alarm-exclamation' style={{ fontSize: '1.15rem', color: activeTab === 'critical' ? '#dc2626' : '#94a3b8' }}></i>
            <span>Critical</span>
            <span style={{
              background: activeTab === 'critical' ? '#dc2626' : '#f1f5f9',
              color: activeTab === 'critical' ? 'white' : '#64748b',
              padding: '0.12rem 0.55rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: '700'
            }}>
              {metrics.criticalCount}
            </span>
          </button>

          {/* All Feedback Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.95rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'all' ? '3px solid #0284c7' : '3px solid transparent',
              color: activeTab === 'all' ? '#0284c7' : '#64748b',
              fontWeight: activeTab === 'all' ? '700' : '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <i className='bx bx-list-ul' style={{ fontSize: '1.15rem' }}></i>
            <span>All Sessions</span>
            <span style={{
              background: activeTab === 'all' ? '#0284c7' : '#f1f5f9',
              color: activeTab === 'all' ? 'white' : '#64748b',
              padding: '0.12rem 0.55rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: '700'
            }}>
              {metrics.total}
            </span>
          </button>

          {/* False Alarm Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('false_alarm')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.95rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'false_alarm' ? '3px solid #0284c7' : '3px solid transparent',
              color: activeTab === 'false_alarm' ? '#0284c7' : '#64748b',
              fontWeight: activeTab === 'false_alarm' ? '700' : '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <i className='bx bx-check-shield' style={{ fontSize: '1.15rem', color: activeTab === 'false_alarm' ? '#10b981' : '#94a3b8' }}></i>
            <span>False Alarm</span>
            <span style={{
              background: activeTab === 'false_alarm' ? '#10b981' : '#f1f5f9',
              color: activeTab === 'false_alarm' ? 'white' : '#64748b',
              padding: '0.12rem 0.55rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: '700'
            }}>
              {metrics.falseAlarmCount}
            </span>
          </button>
        </div>

        {/* Toolbar: Search, Filters & Controls */}
        <div style={{ padding: '1rem 1.25rem', background: '#ffffff', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Left: Search Bar & Verification Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '300px', maxWidth: '780px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <i className='bx bx-search' style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem' }}></i>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Session ID, Provider, User, or Corporate..."
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem 0.55rem 2.4rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '0.84rem',
                  color: '#1e293b',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.15s ease'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#0284c7'; e.target.style.background = '#ffffff'; }}
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc'; }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{ position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <i className='bx bx-x' style={{ fontSize: '1.1rem' }}></i>
                </button>
              )}
            </div>

            {/* Verification Status Filter */}
            <div style={{ position: 'relative', minWidth: '160px' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 1.8rem 0.55rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  fontSize: '0.82rem',
                  color: '#334155',
                  fontWeight: '500',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Verifications</option>
                <option value="Pending">Pending</option>
                <option value="False Alarm">False Alarm</option>
                <option value="Verified Risk">Verified Risk</option>
              </select>
              <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}></i>
            </div>
          </div>

          {/* Right Controls: Count, Columns, Rows */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', background: '#f1f5f9', padding: '0.35rem 0.65rem', borderRadius: '6px' }}>
              Total: <strong style={{ color: '#0f172a' }}>{totalItems}</strong>
            </span>

            {/* Columns Dropdown Toggle */}
            <div style={{ position: 'relative' }} ref={columnDropdownRef}>
              <button
                type="button"
                onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  color: '#334155',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <i className='bx bx-columns' style={{ fontSize: '1.05rem', color: '#0284c7' }}></i>
                <span>Columns</span>
                <i className='bx bx-chevron-down' style={{ fontSize: '0.95rem', color: '#64748b' }}></i>
              </button>

              {isColumnDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '115%',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                  padding: '0.75rem',
                  zIndex: 100,
                  minWidth: '220px'
                }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', paddingBottom: '0.35rem', borderBottom: '1px solid #f1f5f9' }}>
                    Show / Hide Columns
                  </div>
                  {[
                    { key: 'id', label: 'Session ID' },
                    { key: 'dateTime', label: 'Session Date & Time' },
                    { key: 'providerName', label: 'Provider Name' },
                    { key: 'userName', label: 'User Name' },
                    { key: 'critical', label: 'Critical' },
                    { key: 'verification', label: 'Verification' },
                    { key: 'responses', label: 'Responses' }
                  ].map(col => (
                    <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: '#1e293b', padding: '0.35rem 0.25rem', cursor: 'pointer', borderRadius: '4px' }}>
                      <input
                        type="checkbox"
                        checked={visibleColumns[col.key]}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, [col.key]: e.target.checked })}
                        style={{ accentColor: '#0284c7' }}
                      />
                      <span>{col.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Rows Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Rows:</span>
              <div style={{ position: 'relative' }}>
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  style={{
                    padding: '0.5rem 1.6rem 0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    color: '#0f172a',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}></i>
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
            {/* Dark Navy Table Header */}
            <thead>
              <tr style={{ background: '#002b49', color: '#ffffff' }}>
                {visibleColumns.id && (
                  <th
                    onClick={() => handleSort('id')}
                    style={{ padding: '0.85rem 1rem', fontSize: '0.74rem', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    ID {sortField === 'id' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                  </th>
                )}
                {visibleColumns.dateTime && (
                  <th
                    onClick={() => handleSort('dateTime')}
                    style={{ padding: '0.85rem 1rem', fontSize: '0.74rem', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    SESSION DATE AND TIME {sortField === 'dateTime' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                  </th>
                )}
                {visibleColumns.providerName && (
                  <th
                    onClick={() => handleSort('providerName')}
                    style={{ padding: '0.85rem 1rem', fontSize: '0.74rem', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    PROVIDER NAME {sortField === 'providerName' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                  </th>
                )}
                {visibleColumns.userName && (
                  <th
                    onClick={() => handleSort('userName')}
                    style={{ padding: '0.85rem 1rem', fontSize: '0.74rem', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    USER NAME {sortField === 'userName' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                  </th>
                )}
                {visibleColumns.critical && (
                  <th
                    onClick={() => handleSort('critical')}
                    style={{ padding: '0.85rem 1rem', fontSize: '0.74rem', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'center' }}
                  >
                    CRITICAL {sortField === 'critical' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                  </th>
                )}
                {visibleColumns.verification && (
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.74rem', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center' }}>
                    VERIFICATION
                  </th>
                )}
                {visibleColumns.responses && (
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.74rem', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center' }}>
                    RESPONSES
                  </th>
                )}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                    <i className='bx bx-folder-open' style={{ fontSize: '2.5rem', color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}></i>
                    <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: '600', color: '#334155' }}>No session feedback records found</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem' }}>Try clearing your search query or switching tabs.</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => {
                  const isFalseAlarm = row.verificationStatus === 'False Alarm';
                  const isVerifiedRisk = row.verificationStatus === 'Verified Risk';
                  const isResolved = row.verificationStatus === 'Resolved';

                  return (
                    <tr
                      key={row.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#fcfdfe',
                        transition: 'background 0.12s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#fcfdfe'; }}
                    >
                      {/* ID */}
                      {visibleColumns.id && (
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.84rem', fontWeight: '700', color: '#0284c7' }}>
                          <span style={{ cursor: 'pointer' }} onClick={() => setSelectedResponseSession(row)} title="View Feedback Details">
                            {row.id}
                          </span>
                        </td>
                      )}

                      {/* Date & Time */}
                      {visibleColumns.dateTime && (
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#334155', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <i className='bx bx-calendar' style={{ color: '#94a3b8' }}></i>
                            <span>{row.dateTime}</span>
                          </div>
                        </td>
                      )}

                      {/* Provider Name */}
                      {visibleColumns.providerName && (
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.84rem', color: '#0f172a', fontWeight: '600' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: '#e0f2fe',
                              color: '#0284c7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.72rem',
                              fontWeight: '700'
                            }}>
                              {(row.providerName || 'P').charAt(0)}
                            </div>
                            <div>
                              <div>{row.providerName}</div>
                              {row.providerSpecialty && (
                                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '400' }}>
                                  {row.providerSpecialty}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      )}

                      {/* User Name */}
                      {visibleColumns.userName && (
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.84rem', color: '#334155' }}>
                          <div style={{ fontWeight: '500', color: '#0f172a' }}>{row.userName}</div>
                          {row.clientName && (
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              {row.clientName}
                            </div>
                          )}
                        </td>
                      )}

                      {/* Critical */}
                      {visibleColumns.critical && (
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          {row.critical ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '999px',
                              background: '#fee2e2',
                              color: '#b91c1c',
                              fontSize: '0.74rem',
                              fontWeight: '700',
                              border: '1px solid #fecaca'
                            }}>
                              <i className='bx bx-error-circle' style={{ fontSize: '0.85rem' }}></i>
                              Yes
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '999px',
                              background: '#f1f5f9',
                              color: '#64748b',
                              fontSize: '0.74rem',
                              fontWeight: '600'
                            }}>
                              No
                            </span>
                          )}
                        </td>
                      )}

                      {/* Verification Column */}
                      {visibleColumns.verification && (
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          {isFalseAlarm ? (
                            <button
                              type="button"
                              onClick={() => openVerifyModal(row)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                background: '#fef3c7',
                                border: '1px solid #fde68a',
                                color: '#b45309',
                                fontWeight: '700',
                                fontSize: '0.76rem',
                                cursor: 'pointer',
                                padding: '0.3rem 0.7rem',
                                borderRadius: '6px',
                                transition: 'all 0.15s ease'
                              }}
                              title="Audited False Alarm - click to modify triage decision"
                            >
                              <i className='bx bx-check-circle' style={{ fontSize: '0.9rem' }}></i>
                              <span>False Alarm</span>
                            </button>
                          ) : isVerifiedRisk ? (
                            <button
                              type="button"
                              onClick={() => openVerifyModal(row)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                background: '#fee2e2',
                                border: '1px solid #fca5a5',
                                color: '#991b1b',
                                fontWeight: '700',
                                fontSize: '0.76rem',
                                cursor: 'pointer',
                                padding: '0.3rem 0.7rem',
                                borderRadius: '6px',
                                transition: 'all 0.15s ease'
                              }}
                              title="Verified High Risk - click to update notes"
                            >
                              <i className='bx bx-alarm-exclamation' style={{ fontSize: '0.9rem' }}></i>
                              <span>Verified Risk</span>
                            </button>
                          ) : isResolved ? (
                            <button
                              type="button"
                              onClick={() => openVerifyModal(row)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                background: '#dcfce7',
                                border: '1px solid #bbf7d0',
                                color: '#166534',
                                fontWeight: '700',
                                fontSize: '0.76rem',
                                cursor: 'pointer',
                                padding: '0.3rem 0.7rem',
                                borderRadius: '6px'
                              }}
                              title="Resolved - click to edit triage details"
                            >
                              <i className='bx bx-check-double' style={{ fontSize: '0.9rem' }}></i>
                              <span>Resolved</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openVerifyModal(row)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                background: '#0284c7',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.35rem 0.85rem',
                                fontSize: '0.78rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                boxShadow: '0 1px 3px rgba(2, 132, 199, 0.25)'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#0369a1'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = '#0284c7'; }}
                            >
                              <i className='bx bx-shield-quarter'></i>
                              <span>Verify</span>
                            </button>
                          )}
                        </td>
                      )}

                      {/* Responses Column (Eye Icon) */}
                      {visibleColumns.responses && (
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedResponseSession(row)}
                            title="Inspect Participant Feedback &amp; Responses"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              border: '1px solid #cbd5e1',
                              background: 'white',
                              color: '#475569',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#0284c7';
                              e.currentTarget.style.color = '#0284c7';
                              e.currentTarget.style.background = '#f0f9ff';
                              e.currentTarget.style.boxShadow = '0 2px 5px rgba(2, 132, 199, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#cbd5e1';
                              e.currentTarget.style.color = '#475569';
                              e.currentTarget.style.background = 'white';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <i className='bx bx-show' style={{ fontSize: '1.15rem' }}></i>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Bar */}
        <div style={{
          padding: '0.9rem 1.25rem',
          borderTop: '1px solid #f1f5f9',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Page Indicator */}
          <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
            Showing <strong style={{ color: '#0f172a' }}>{totalItems === 0 ? 0 : startIndex + 1}</strong> to{' '}
            <strong style={{ color: '#0f172a' }}>{Math.min(startIndex + rowsPerPage, totalItems)}</strong> of{' '}
            <strong style={{ color: '#0f172a' }}>{totalItems}</strong> entries
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: currentPage === 1 ? '#f8fafc' : 'white',
                color: currentPage === 1 ? '#cbd5e1' : '#334155',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.82rem',
                fontWeight: '600'
              }}
              title="First Page"
            >
              «
            </button>
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: currentPage === 1 ? '#f8fafc' : 'white',
                color: currentPage === 1 ? '#cbd5e1' : '#334155',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.82rem',
                fontWeight: '500'
              }}
            >
              Previous
            </button>

            {/* Page number pill */}
            <span style={{
              padding: '0.35rem 0.8rem',
              borderRadius: '6px',
              background: '#0284c7',
              color: 'white',
              fontSize: '0.82rem',
              fontWeight: '700'
            }}>
              {currentPage}
            </span>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: currentPage === totalPages ? '#f8fafc' : 'white',
                color: currentPage === totalPages ? '#cbd5e1' : '#334155',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '0.82rem',
                fontWeight: '500'
              }}
            >
              Next
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: currentPage === totalPages ? '#f8fafc' : 'white',
                color: currentPage === totalPages ? '#cbd5e1' : '#334155',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '0.82rem',
                fontWeight: '600'
              }}
              title="Last Page"
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODAL 1: CLINICAL VERIFICATION MODAL ================= */}
      {selectedVerifySession && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '540px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: '#002b49',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                  fontSize: '1.25rem'
                }}>
                  <i className='bx bx-check-shield'></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700' }}>
                    Clinical Risk Verification
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#93c5fd' }}>
                    Session ID: {selectedVerifySession.id} &bull; {selectedVerifySession.providerName}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVerifySession(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.35rem', cursor: 'pointer' }}
              >
                <i className='bx bx-x'></i>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveVerification} style={{ padding: '1.5rem' }}>
              {/* Session Overview Mini Box */}
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Participant</span>
                    <strong style={{ color: '#0f172a' }}>{selectedVerifySession.userName}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Date &amp; Time</span>
                    <strong style={{ color: '#0f172a' }}>{selectedVerifySession.dateTime}</strong>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Flagged Reason</span>
                    <span style={{ color: '#b91c1c', fontWeight: '600' }}>
                      {selectedVerifySession.criticalReason || 'High distress score triggered in session evaluation'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Triage Decision Selector */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.82rem', fontWeight: '700', color: '#1e293b' }}>
                  Select Verification Outcome <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    {
                      val: 'False Alarm',
                      label: 'False Alarm (Disregard Alert)',
                      badge: 'Non-Critical',
                      badgeColor: '#059669',
                      badgeBg: '#dcfce7',
                      desc: 'Participant responded normally; distress settled or trigger occurred mistakenly.'
                    },
                    {
                      val: 'Verified Risk',
                      label: 'Verified Critical Risk',
                      badge: 'Escalation Required',
                      badgeColor: '#dc2626',
                      badgeBg: '#fee2e2',
                      desc: 'Active self-harm, severe trauma, or clinical crisis confirmed. Triage team alerted.'
                    },
                    {
                      val: 'Resolved',
                      label: 'Resolved &amp; Monitored',
                      badge: 'Stabilized',
                      badgeColor: '#0284c7',
                      badgeBg: '#e0f2fe',
                      desc: 'Attending psychologist provided immediate de-escalation; scheduled check-in.'
                    }
                  ].map(opt => (
                    <label
                      key={opt.val}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.65rem',
                        padding: '0.75rem 0.85rem',
                        borderRadius: '8px',
                        border: verifyStatusChoice === opt.val ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                        background: verifyStatusChoice === opt.val ? '#f0f9ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease'
                      }}
                    >
                      <input
                        type="radio"
                        name="verifyChoice"
                        value={opt.val}
                        checked={verifyStatusChoice === opt.val}
                        onChange={(e) => setVerifyStatusChoice(e.target.value)}
                        style={{ marginTop: '0.25rem', accentColor: '#0284c7' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.86rem', fontWeight: '700', color: verifyStatusChoice === opt.val ? '#0284c7' : '#0f172a' }}>
                            {opt.label}
                          </span>
                          <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.15rem 0.45rem', borderRadius: '4px', background: opt.badgeBg, color: opt.badgeColor }}>
                            {opt.badge}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                          {opt.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clinical Verification Notes */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.82rem', fontWeight: '700', color: '#1e293b' }}>
                  Triage Remarks / Protocol Actions
                </label>
                <textarea
                  rows="3"
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="Record provider consultation, participant call-back details, or clinical safety rationale..."
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#0284c7'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedVerifySession(null)}
                  style={{
                    padding: '0.55rem 1.1rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    color: '#64748b',
                    fontSize: '0.84rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.55rem 1.35rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#0284c7',
                    color: 'white',
                    fontSize: '0.84rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  Confirm Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: RESPONSES INSPECTOR MODAL ================= */}
      {selectedResponseSession && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: '#002b49',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                  fontSize: '1.35rem'
                }}>
                  <i className='bx bx-show'></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>
                    Session Feedback Details
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#93c5fd' }}>
                    ID: {selectedResponseSession.id} &bull; {selectedResponseSession.dateTime}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedResponseSession(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.45rem', cursor: 'pointer' }}
              >
                <i className='bx bx-x'></i>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {/* Quick Summary Cards Banner */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Critical Care</span>
                  <div style={{ marginTop: '0.2rem' }}>
                    {selectedResponseSession.critical ? (
                      <span style={{ color: '#dc2626', fontWeight: '700', fontSize: '0.86rem' }}>
                        ● Yes (Flagged)
                      </span>
                    ) : (
                      <span style={{ color: '#059669', fontWeight: '700', fontSize: '0.86rem' }}>
                        ● No (Normal)
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Verification</span>
                  <div style={{ marginTop: '0.2rem', fontWeight: '700', fontSize: '0.86rem', color: selectedResponseSession.verificationStatus === 'False Alarm' ? '#d97706' : (selectedResponseSession.verificationStatus === 'Verified Risk' ? '#dc2626' : '#0284c7') }}>
                    {selectedResponseSession.verificationStatus || 'Pending'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Clinical Score</span>
                  <div style={{ marginTop: '0.2rem', fontWeight: '700', fontSize: '0.86rem', color: '#0f172a' }}>
                    {selectedResponseSession.clinicalScore ? `${selectedResponseSession.clinicalScore} / 10` : '8.5 / 10'}
                  </div>
                </div>
              </div>

              {/* Participant & Provider Meta */}
              <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bae6fd', marginBottom: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.84rem' }}>
                  <div>
                    <span style={{ color: '#0369a1', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Provider Details</span>
                    <div style={{ fontWeight: '700', color: '#0c4a6e', marginTop: '0.15rem' }}>
                      {selectedResponseSession.providerName}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#0284c7' }}>
                      {selectedResponseSession.providerSpecialty || 'EAP Specialist / Counselor'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#0369a1', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Participant / Client</span>
                    <div style={{ fontWeight: '700', color: '#0c4a6e', marginTop: '0.15rem' }}>
                      {selectedResponseSession.userName}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#0284c7' }}>
                      {selectedResponseSession.clientName || 'Corporate Client Partner'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Critical Risk Trigger Explanation */}
              {selectedResponseSession.criticalReason && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.9rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#b91c1c', fontWeight: '700', fontSize: '0.84rem', marginBottom: '0.35rem' }}>
                    <i className='bx bx-alarm-exclamation' style={{ fontSize: '1.15rem' }}></i>
                    <span>Identified Risk Factor</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#991b1b', lineHeight: 1.45 }}>
                    {selectedResponseSession.criticalReason}
                  </p>
                </div>
              )}

              {/* Form Responses Breakdown */}
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                Participant Survey Questions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.75rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Overall Session Satisfaction</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0f172a', marginTop: '0.15rem' }}>
                    {'★'.repeat(selectedResponseSession.questionnaire?.satisfaction || 4)}
                    <span style={{ color: '#cbd5e1' }}>{'★'.repeat(5 - (selectedResponseSession.questionnaire?.satisfaction || 4))}</span>
                    <span style={{ fontSize: '0.76rem', color: '#64748b', marginLeft: '0.45rem', fontWeight: '500' }}>
                      ({selectedResponseSession.questionnaire?.satisfaction || 4} out of 5 stars)
                    </span>
                  </div>
                </div>

                <div style={{ padding: '0.75rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Felt supported and heard during session?</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#059669', marginTop: '0.15rem' }}>
                    {selectedResponseSession.questionnaire?.feltSupported || 'Yes'}
                  </div>
                </div>

                <div style={{ padding: '0.75rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Was immediate distress effectively de-escalated?</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0f172a', marginTop: '0.15rem' }}>
                    {selectedResponseSession.questionnaire?.crisisDeescalated || 'Partially / Follow-up Needed'}
                  </div>
                </div>

                {selectedResponseSession.questionnaire?.userComments && (
                  <div style={{ padding: '0.75rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Participant Remarks / Feedback</div>
                    <div style={{ fontSize: '0.84rem', color: '#1e293b', marginTop: '0.25rem', fontStyle: 'italic', lineHeight: 1.45 }}>
                      "{selectedResponseSession.questionnaire?.userComments}"
                    </div>
                  </div>
                )}
              </div>

              {/* Provider Clinical Notes */}
              {selectedResponseSession.questionnaire?.providerNotes && (
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                    Clinician Post-Session Notes
                  </h4>
                  <div style={{ padding: '0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                    {selectedResponseSession.questionnaire.providerNotes}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <button
                type="button"
                onClick={() => {
                  const s = selectedResponseSession;
                  setSelectedResponseSession(null);
                  openVerifyModal(s);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  background: '#0284c7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                <i className='bx bx-check-shield'></i>
                <span>Triage Verification</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedResponseSession(null)}
                style={{
                  padding: '0.5rem 1.15rem',
                  background: 'white',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '0.82rem',
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
