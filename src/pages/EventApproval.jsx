import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';

function EventApproval() {
  const [searchParams] = useSearchParams();
  const initialClient = searchParams.get('client') || '';

  const { events: allEvents, updateEventStatus } = useGlobal();
  const approvals = allEvents.filter(ev => ev.status !== 'hr_requested' && ev.status !== 'Tentative');

  const [searchQuery, setSearchQuery] = useState(initialClient);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [activeDetailsId, setActiveDetailsId] = useState(null);
  
  // Rejection State
  const [rejectingRequestId, setRejectingRequestId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Filtering Logic
  const filteredApprovals = approvals.filter(req => {
    const matchesSearch = 
      req.sessionName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      req.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    const matchesType = typeFilter === 'All' || req.sessionType === typeFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const totalItems = filteredApprovals.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedApprovals = filteredApprovals.slice(startIndex, startIndex + rowsPerPage);

  // Summary Logic
  const totalRequests = approvals.length;
  const pendingRequests = approvals.filter(r => r.status === 'pending_confirmation' || r.status === 'Pending').length;
  const approvedRequests = approvals.filter(r => r.status === 'provider_allocation_pending').length;
  const rejectedRequests = approvals.filter(r => r.status === 'rejected').length;

  const handleUpdateStatus = (id, newStatus, reason = '') => {
    updateEventStatus(id, newStatus, reason);
  };

  const activeDetails = approvals.find(r => r.id === activeDetailsId);

  return (
    <main className="main-content">
      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a', fontWeight: '700' }}>Event Approval</h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>Manage and approve session/webinar event requests</p>
      </div>

      {/* Summary Dashboard */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Requests', value: totalRequests, color: '#0f172a', bg: '#f8fafc', icon: 'bx-calendar-event', border: '#94a3b8' },
          { label: 'Pending', value: pendingRequests, color: '#b45309', bg: '#fffbeb', icon: 'bx-time-five', border: '#f59e0b' },
          { label: 'Provider Pending', value: approvedRequests, color: '#0369a1', bg: '#f0f9ff', icon: 'bx-user-check', border: '#0ea5e9' },
          { label: 'Rejected', value: rejectedRequests, color: '#b91c1c', bg: '#fff5f5', icon: 'bx-x-circle', border: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: 'white', borderRadius: '10px', padding: '1rem 1.25rem', border: '1px solid var(--border-color)', borderLeft: `4px solid ${s.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
              <i className={`bx ${s.icon}`}></i>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>{s.label}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: s.color, marginTop: '0.1rem' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="search-input-wrapper">
          <i className='bx bx-search'></i>
          <input 
            type="text" 
            className="search-input"
            placeholder="Search Session or Client..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="pending_confirmation">Pending Confirmation</option>
            <option value="provider_allocation_pending">Provider Allocation Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <select className="form-control" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="All">All Types</option>
            <option value="Online">Online</option>
            <option value="Onsite">Onsite</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>SUBMITTED ON</th>
              <th>SESSION NAME</th>
              <th>CLIENT</th>
              <th>SESSION DATE</th>
              <th>TYPE</th>
              <th>BUDGET</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedApprovals.map((req) => (
              <tr key={req.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{req.submittedOn}</td>
                <td className="event-name">{req.sessionName}</td>
                <td>{req.clientName}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{req.sessionDate}</td>
                <td style={{ textTransform: 'capitalize' }}>
                  {req.sessionType}
                  {req.sessionType === 'onsite' && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.location}</div>}
                </td>
                <td>${req.budget}</td>
                <td>
                  <span className={`badge badge-${req.status === 'provider_allocation_pending' ? 'success' : req.status === 'rejected' ? 'danger' : 'warning'}`}>
                    {req.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="icon-btn" title="View Details" onClick={() => setActiveDetailsId(req.id)}>
                      <i className='bx bx-show'></i>
                    </button>
                    {(req.status === 'pending_confirmation' || req.status === 'Pending') && (
                      <>
                        <button className="icon-btn text-success" title="Approve" onClick={() => handleUpdateStatus(req.id, 'provider_allocation_pending')}>
                          <i className='bx bx-check-circle'></i>
                        </button>
                        <button className="icon-btn text-danger" title="Reject" onClick={() => setRejectingRequestId(req.id)}>
                          <i className='bx bx-x-circle'></i>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredApprovals.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No approval requests found</td>
              </tr>
            )}
          </tbody>
        </table>
        {totalItems > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid var(--border-color)', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span>
                Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, totalItems)} of {totalItems} entries
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label>Rows per page:</label>
                <select 
                  className="form-control" 
                  style={{ width: 'auto', padding: '0.25rem 0.5rem' }}
                  value={rowsPerPage} 
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn-outline" 
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button 
                className="btn-outline" 
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {activeDetailsId !== null && activeDetails && (
        <div className="modal-overlay" onClick={() => setActiveDetailsId(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Request Details</h2>
              <button className="close-btn" onClick={() => setActiveDetailsId(null)}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Session Info</h3>
                <div className="form-grid">
                  <div><strong>Session Name:</strong><br/>{activeDetails.sessionName}</div>
                  <div><strong>Client Name:</strong><br/>{activeDetails.clientName}</div>
                  <div><strong>Date:</strong><br/>{activeDetails.sessionDate}</div>
                  <div><strong>Duration:</strong><br/>{activeDetails.duration || 'N/A'} Mins</div>
                  <div><strong>Type:</strong><br/><span style={{ textTransform: 'capitalize' }}>{activeDetails.sessionType}</span></div>
                  {activeDetails.sessionType === 'onsite' && (
                    <div className="full-width"><strong>Location:</strong><br/>{activeDetails.location}</div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Expert Info</h3>
                <div className="form-grid">
                  <div><strong>Required Experience:</strong><br/>{activeDetails.expertExp} Years</div>
                  <div><strong>Gender Preference:</strong><br/><span style={{ textTransform: 'capitalize' }}>{activeDetails.genderPref.replace('_', ' ')}</span></div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Budget & Costs</h3>
                <div className="form-grid">
                  <div><strong>Budget:</strong><br/>${activeDetails.budget}</div>
                  <div><strong>Other Costs:</strong><br/>${activeDetails.otherCosts}</div>
                </div>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Requirements Description</h3>
                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '4px', fontSize: '0.95rem' }}>
                  {activeDetails.requirements}
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              {(activeDetails.status === 'pending_confirmation' || activeDetails.status === 'Pending') && (
                <>
                  <button className="btn-outline text-red" style={{ borderColor: 'var(--red)' }} onClick={() => setRejectingRequestId(activeDetails.id)}>Reject</button>
                  <button className="btn-primary" style={{ background: 'var(--green)', borderColor: 'var(--green)' }} onClick={() => { handleUpdateStatus(activeDetails.id, 'provider_allocation_pending'); setActiveDetailsId(null); }}>Approve</button>
                </>
              )}
              {(activeDetails.status !== 'pending_confirmation' && activeDetails.status !== 'Pending') && (
                <button className="btn-outline" onClick={() => setActiveDetailsId(null)}>Close</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectingRequestId !== null && (
        <div className="modal-overlay" onClick={() => { setRejectingRequestId(null); setRejectReason(''); }}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Provide Rejection Reason</h2>
              <button className="close-btn" onClick={() => { setRejectingRequestId(null); setRejectReason(''); }}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateStatus(rejectingRequestId, 'Rejected', rejectReason);
              setRejectingRequestId(null);
              setRejectReason('');
              setActiveDetailsId(null); // Close details modal if open
            }}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Reason for rejection <span className="text-red">*</span></label>
                  <textarea 
                    className="form-control" 
                    rows="4" 
                    required 
                    placeholder="Please explain why this request is being rejected..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-outline" onClick={() => { setRejectingRequestId(null); setRejectReason(''); }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: '#ef4444', borderColor: '#ef4444' }}>Confirm Reject</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default EventApproval;
