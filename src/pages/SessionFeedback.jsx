import React, { useState, useEffect, useMemo } from 'react';
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

  // Tab: 'critical' vs 'all'
  const [activeTab, setActiveTab] = useState('critical');

  // Search
  const [searchTerm, setSearchTerm] = useState('');

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

  // Modals state
  const [selectedVerifySession, setSelectedVerifySession] = useState(null);
  const [verifyStatusChoice, setVerifyStatusChoice] = useState('False Alarm');
  const [verifyNotes, setVerifyNotes] = useState('');

  const [selectedResponseSession, setSelectedResponseSession] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    return feedbacks.filter(item => {
      // Tab filter
      if (activeTab === 'critical' && !item.critical) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesProvider = item.providerName.toLowerCase().includes(q);
        const matchesUser = item.userName.toLowerCase().includes(q);
        const matchesClient = (item.clientName || '').toLowerCase().includes(q);
        if (!matchesId && !matchesProvider && !matchesUser && !matchesClient) return false;
      }
      return true;
    });
  }, [feedbacks, activeTab, searchTerm]);

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
  }, [activeTab, searchTerm, rowsPerPage]);

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
    setVerifyStatusChoice(session.verificationStatus === 'Pending' ? 'False Alarm' : session.verificationStatus);
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
          verificationLabel: verifyStatusChoice === 'False Alarm' ? 'False Alarm' : (verifyStatusChoice === 'Verified Risk' ? 'Verified Risk' : 'Verified'),
          verificationNotes: verifyNotes,
          verifiedAt: new Date().toISOString()
        };
      }
      return item;
    }));

    showToast(`Session ${selectedVerifySession.id} marked as "${verifyStatusChoice}"`);
    setSelectedVerifySession(null);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '1.75rem 2rem' }}>
      
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

      {/* Page Title */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ margin: '0 0 0.85rem 0', fontSize: '1.65rem', fontWeight: '800', color: '#002b49', letterSpacing: '-0.02em' }}>
          Session Feedback
        </h1>

        {/* Sub-tabs: Critical vs All */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('critical')}
            style={{
              padding: '0.35rem 0.95rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              border: activeTab === 'critical' ? '1px solid #38bdf8' : '1px solid transparent',
              background: activeTab === 'critical' ? '#f0f9ff' : 'transparent',
              color: activeTab === 'critical' ? '#0284c7' : '#64748b'
            }}
          >
            Critical
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            style={{
              padding: '0.35rem 0.95rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              border: activeTab === 'all' ? '1px solid #38bdf8' : '1px solid transparent',
              background: activeTab === 'all' ? '#f0f9ff' : 'transparent',
              color: activeTab === 'all' ? '#0284c7' : '#64748b'
            }}
          >
            All
          </button>
        </div>
      </div>

      {/* Toolbar: Search + Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', flex: '1', minWidth: '280px', maxWidth: '750px' }}>
          <i className='bx bx-search' style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem' }}></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Session ID, Provider, or Client..."
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.4rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: 'white',
              fontSize: '0.85rem',
              color: '#1e293b',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s ease'
            }}
            onFocus={(e) => { e.target.style.borderColor = '#0284c7'; }}
            onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <i className='bx bx-x' style={{ fontSize: '1.1rem' }}></i>
            </button>
          )}
        </div>

        {/* Right Controls: Total Count, Columns, Rows */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#475569' }}>
            Total: <strong style={{ color: '#0f172a' }}>{totalItems}</strong>
          </span>

          {/* Columns Dropdown Toggle */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: 'white',
                color: '#334155',
                fontSize: '0.82rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              <i className='bx bx-columns' style={{ fontSize: '1.05rem', color: '#64748b' }}></i>
              <span>Columns</span>
            </button>

            {isColumnDropdownOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '110%',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                padding: '0.65rem',
                zIndex: 100,
                minWidth: '200px'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', paddingBottom: '0.25rem', borderBottom: '1px solid #f1f5f9' }}>
                  Toggle Columns
                </div>
                {[
                  { key: 'id', label: 'ID' },
                  { key: 'dateTime', label: 'Session Date & Time' },
                  { key: 'providerName', label: 'Provider Name' },
                  { key: 'userName', label: 'User Name' },
                  { key: 'critical', label: 'Critical' },
                  { key: 'verification', label: 'Verification' },
                  { key: 'responses', label: 'Responses' }
                ].map(col => (
                  <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#1e293b', padding: '0.3rem 0.2rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={visibleColumns[col.key]}
                      onChange={(e) => setVisibleColumns({ ...visibleColumns, [col.key]: e.target.checked })}
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
                  padding: '0.45rem 1.6rem 0.45rem 0.75rem',
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

      {/* Main Table Container */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '980px' }}>
            {/* Dark Navy Table Header */}
            <thead>
              <tr style={{ background: '#002b49', color: '#ffffff' }}>
                {visibleColumns.id && (
                  <th
                    onClick={() => handleSort('id')}
                    style={{ padding: '0.85rem 1rem', fontSize: '0.74rem', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    ID {sortField === 'id' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                  </th>
                )}
                {visibleColumns.dateTime && (
                  <th
                    onClick={() => handleSort('dateTime')}
                    style={{ padding: '0.85rem 1rem', fontSize: '0.74rem', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    SESSION DATE AND TIME {sortField === 'dateTime' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                  </th>
                )}
                {visibleColumns.providerName && (
                  <th
                    onClick={() => handleSort('providerName')}
                    style={{ padding: '0.85rem 1rem', fontSize: '0.74rem', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    PROVIDER NAME {sortField === 'providerName' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                  </th>
                )}
                {visibleColumns.userName && (
                  <th
                    onClick={() => handleSort('userName')}
                    style={{ padding: '0.85rem 1rem', fontSize: '0.74rem', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    USER NAME {sortField === 'userName' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                  </th>
                )}
                {visibleColumns.critical && (
                  <th
                    onClick={() => handleSort('critical')}
                    style={{ padding: '0.85rem 1rem', fontSize: '0.74rem', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'center' }}
                  >
                    CRITICAL {sortField === 'critical' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
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
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem' }}>Try refining your search or switching tabs.</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => {
                  const isFalseAlarm = row.verificationStatus === 'False Alarm';
                  const isVerifiedRisk = row.verificationStatus === 'Verified Risk';

                  return (
                    <tr
                      key={row.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#fcfdfe',
                        transition: 'background 0.1s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#fcfdfe'; }}
                    >
                      {/* ID */}
                      {visibleColumns.id && (
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', fontWeight: '600', color: '#0f172a' }}>
                          {row.id}
                        </td>
                      )}

                      {/* Date & Time */}
                      {visibleColumns.dateTime && (
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#334155' }}>
                          {row.dateTime}
                        </td>
                      )}

                      {/* Provider Name */}
                      {visibleColumns.providerName && (
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#0f172a', fontWeight: '500' }}>
                          {row.providerName}
                        </td>
                      )}

                      {/* User Name */}
                      {visibleColumns.userName && (
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#334155' }}>
                          {row.userName}
                        </td>
                      )}

                      {/* Critical */}
                      {visibleColumns.critical && (
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          {row.critical ? (
                            <span style={{
                              color: '#dc2626',
                              fontSize: '0.78rem',
                              fontWeight: '600'
                            }}>
                              Yes
                            </span>
                          ) : (
                            <span style={{
                              color: '#64748b',
                              fontSize: '0.78rem',
                              fontWeight: '500'
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
                                background: 'transparent',
                                border: 'none',
                                color: '#d97706',
                                fontWeight: '700',
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px'
                              }}
                              title="Click to edit verification"
                            >
                              False Alarm
                            </button>
                          ) : isVerifiedRisk ? (
                            <button
                              type="button"
                              onClick={() => openVerifyModal(row)}
                              style={{
                                background: '#fee2e2',
                                border: '1px solid #fca5a5',
                                color: '#b91c1c',
                                fontWeight: '700',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '4px'
                              }}
                              title="Click to edit verification"
                            >
                              Verified Risk
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openVerifyModal(row)}
                              style={{
                                background: '#1d4ed8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.3rem 0.95rem',
                                fontSize: '0.78rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                boxShadow: '0 1px 2px rgba(29, 78, 216, 0.2)'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#1e40af'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = '#1d4ed8'; }}
                            >
                              Verify
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
                            title="View Session Feedback Responses"
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
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#cbd5e1';
                              e.currentTarget.style.color = '#475569';
                              e.currentTarget.style.background = 'white';
                            }}
                          >
                            <i className='bx bx-show' style={{ fontSize: '1.1rem' }}></i>
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
          padding: '0.85rem 1.25rem',
          borderTop: '1px solid #f1f5f9',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Page Indicator */}
          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Page {currentPage} of {totalPages}
          </div>

          {/* Navigation Buttons: <<, Previous, Next, >> */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
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

      {/* ================= MODAL 1: VERIFICATION MODAL ================= */}
      {selectedVerifySession && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
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
            maxWidth: '520px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            overflow: 'hidden'
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
                <i className='bx bx-check-shield' style={{ fontSize: '1.35rem', color: '#38bdf8' }}></i>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700' }}>
                    Verify Session Feedback
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#93c5fd' }}>
                    ID: {selectedVerifySession.id} • {selectedVerifySession.providerName}
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
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Triage Reason</span>
                    <span style={{ color: '#b91c1c', fontWeight: '500' }}>{selectedVerifySession.criticalReason}</span>
                  </div>
                </div>
              </div>

              {/* Triage Decision Radio */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.82rem', fontWeight: '600', color: '#334155' }}>
                  Verification Assessment <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { val: 'False Alarm', label: 'False Alarm (No Immediate Clinical Risk)', desc: 'User or provider triggered alert mistakenly; normal session parameters.' },
                    { val: 'Verified Risk', label: 'Verified Critical Risk (Escalate to Crisis Team)', desc: 'Genuine high-risk event requiring immediate clinical oversight.' },
                    { val: 'Resolved', label: 'Resolved & Monitored (Follow-up Handled)', desc: 'Post-session stabilization verified by attending clinical staff.' }
                  ].map(opt => (
                    <label
                      key={opt.val}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.65rem',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        border: verifyStatusChoice === opt.val ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                        background: verifyStatusChoice === opt.val ? '#f0f9ff' : '#ffffff',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="radio"
                        name="verifyChoice"
                        value={opt.val}
                        checked={verifyStatusChoice === opt.val}
                        onChange={(e) => setVerifyStatusChoice(e.target.value)}
                        style={{ marginTop: '0.2rem' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: '600', color: verifyStatusChoice === opt.val ? '#0369a1' : '#1e293b' }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.15rem' }}>
                          {opt.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clinical Verification Notes */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.82rem', fontWeight: '600', color: '#334155' }}>
                  Triage Remarks / Protocol Actions
                </label>
                <textarea
                  rows="3"
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="Record call back details, clinical confirmation, or rationale for this assessment..."
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedVerifySession(null)}
                  style={{
                    padding: '0.55rem 1rem',
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
                    padding: '0.55rem 1.25rem',
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
                  Submit Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: RESPONSES MODAL ================= */}
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
            maxHeight: '88vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            overflow: 'hidden'
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
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{
                    background: selectedResponseSession.critical ? '#fee2e2' : '#dcfce7',
                    color: selectedResponseSession.critical ? '#b91c1c' : '#15803d',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase'
                  }}>
                    {selectedResponseSession.critical ? 'Critical Session' : 'Standard Session'}
                  </span>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>
                    Session Feedback Details
                  </h3>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#93c5fd', marginTop: '0.2rem', display: 'block' }}>
                  ID: {selectedResponseSession.id} • {selectedResponseSession.dateTime}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedResponseSession(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                <i className='bx bx-x'></i>
              </button>
            </div>

            {/* Scrollable Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Participant & Provider Info Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                    Attending Provider
                  </span>
                  <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a' }}>
                    {selectedResponseSession.providerName}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#0284c7', marginTop: '0.15rem' }}>
                    {selectedResponseSession.providerSpecialty || 'Clinical Professional'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                    Participant / Client
                  </span>
                  <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a' }}>
                    {selectedResponseSession.userName}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.15rem' }}>
                    {selectedResponseSession.clientName || 'Corporate Enterprise'}
                  </div>
                </div>
              </div>

              {/* Critical Triage Notice */}
              {selectedResponseSession.critical && (
                <div style={{
                  background: '#fef2f2',
                  border: '1.5px solid #fecaca',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                    <i className='bx bx-error' style={{ color: '#dc2626', fontSize: '1.2rem' }}></i>
                    <strong style={{ fontSize: '0.85rem', color: '#991b1b' }}>
                      Clinical Risk Trigger Flagged
                    </strong>
                    <span style={{ marginLeft: 'auto', background: '#fee2e2', color: '#b91c1c', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }}>
                      Severity: {selectedResponseSession.clinicalScore || 8} / 10
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#7f1d1d', lineHeight: '1.4' }}>
                    {selectedResponseSession.criticalReason}
                  </p>
                </div>
              )}

              {/* Questionnaire Responses Section */}
              <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.85rem 0', fontSize: '0.84rem', fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                  Participant Questionnaire Responses
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Session Rating</span>
                    <strong style={{ fontSize: '0.92rem', color: '#f59e0b' }}>
                      {'★'.repeat(selectedResponseSession.questionnaire?.satisfaction || 5)}
                      <span style={{ color: '#cbd5e1' }}>{'★'.repeat(5 - (selectedResponseSession.questionnaire?.satisfaction || 5))}</span>
                    </strong>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Felt Supported &amp; Heard</span>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                      {selectedResponseSession.questionnaire?.feltSupported || 'Yes'}
                    </strong>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Crisis De-escalated in Session</span>
                    <strong style={{ fontSize: '0.88rem', color: selectedResponseSession.questionnaire?.crisisDeescalated === 'Partially' ? '#d97706' : '#15803d' }}>
                      {selectedResponseSession.questionnaire?.crisisDeescalated || 'Yes'}
                    </strong>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Provider Empathy Rating</span>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                      {selectedResponseSession.questionnaire?.providerEmpathy || 5} / 5
                    </strong>
                  </div>
                </div>

                {/* User Written Feedback */}
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                    Participant Remarks
                  </span>
                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', fontSize: '0.82rem', color: '#1e293b', fontStyle: 'italic', border: '1px solid #f1f5f9' }}>
                    "{selectedResponseSession.questionnaire?.userComments || 'No written comment left by participant.'}"
                  </div>
                </div>
              </div>

              {/* Provider Clinical Post-Session Notes */}
              <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.84rem', fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Provider Clinical Summary
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: '1.5', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                  {selectedResponseSession.questionnaire?.providerNotes || 'Standard session completed without clinical exceptions.'}
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Verification Status: <strong>{selectedResponseSession.verificationStatus}</strong>
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    const session = selectedResponseSession;
                    setSelectedResponseSession(null);
                    openVerifyModal(session);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid #0284c7',
                    background: '#f0f9ff',
                    color: '#0284c7',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Verify / Triage
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedResponseSession(null)}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#0f172a',
                    color: 'white',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
