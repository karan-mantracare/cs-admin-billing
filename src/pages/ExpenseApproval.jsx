import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';

function ExpenseApproval() {
  const [searchParams] = useSearchParams();
  const initialClient = searchParams.get('client') || '';

  const { expenses: allExpenses, updateExpenseStatus } = useGlobal();
  const approvals = allExpenses;

  const [searchQuery, setSearchQuery] = useState(initialClient);
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Rejection State
  const [rejectingRequestId, setRejectingRequestId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  
  // View State
  const [viewingRequestId, setViewingRequestId] = useState(null);
  const viewingDetails = approvals.find(r => r.id === viewingRequestId);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Filtering Logic
  const filteredApprovals = approvals.filter(req => {
    const matchesSearch = 
      req.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      req.expenseType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.addedBy.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalItems = filteredApprovals.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedApprovals = filteredApprovals.slice(startIndex, startIndex + rowsPerPage);

  // Summary Logic
  const totalRequests = approvals.length;
  const pendingRequests = approvals.filter(r => r.status === 'Pending').length;
  const approvedRequests = approvals.filter(r => r.status === 'Approved').length;
  const rejectedRequests = approvals.filter(r => r.status === 'Rejected').length;

  const handleUpdateStatus = (id, newStatus, reason = '') => {
    updateExpenseStatus(id, newStatus, reason);
  };

  const formatCurrency = (amount) => `$${amount.toLocaleString()}`;

  return (
    <main className="main-content">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1>Expense Approval</h1>
      </div>

      {/* Summary Dashboard */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div className="summary-box" style={{ flex: 1 }}>
          <div className="summary-item">
            <span>Total Requests</span>
            <strong>{totalRequests}</strong>
          </div>
        </div>
        <div className="summary-box" style={{ flex: 1 }}>
          <div className="summary-item">
            <span style={{ color: 'var(--warning)' }}>Pending</span>
            <strong style={{ color: 'var(--warning)' }}>{pendingRequests}</strong>
          </div>
        </div>
        <div className="summary-box" style={{ flex: 1 }}>
          <div className="summary-item">
            <span style={{ color: 'var(--success)' }}>Approved</span>
            <strong style={{ color: 'var(--success)' }}>{approvedRequests}</strong>
          </div>
        </div>
        <div className="summary-box" style={{ flex: 1 }}>
          <div className="summary-item">
            <span className="text-red">Rejected</span>
            <strong className="text-red">{rejectedRequests}</strong>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="search-input-wrapper">
          <i className='bx bx-search'></i>
          <input 
            type="text" 
            className="search-input"
            placeholder="Search Client, Expense Type, Added By..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>CLIENT NAME</th>
              <th>ADDED BY</th>
              <th>EXPENSE TYPE</th>
              <th>DETAILS</th>
              <th>DELIVERED BY</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedApprovals.map((req) => (
              <tr key={req.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{req.date}</td>
                <td className="event-name">{req.clientName}</td>
                <td>{req.addedBy}</td>
                <td>{req.expenseType}</td>
                <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={req.details}>
                  {req.details}
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>{req.deliveredBy}</td>
                <td>{formatCurrency(req.amount)}</td>
                <td>
                  <span className={`badge badge-${req.status === 'Approved' ? 'success' : req.status === 'Rejected' ? 'danger' : 'warning'}`}>
                    {req.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="icon-btn text-blue" title="View Details" onClick={() => setViewingRequestId(req.id)}>
                      <i className='bx bx-show'></i>
                    </button>
                    {req.status === 'Pending' ? (
                      <>
                        <button className="icon-btn text-success" title="Approve" onClick={() => handleUpdateStatus(req.id, 'Approved')}>
                          <i className='bx bx-check-circle'></i>
                        </button>
                        <button className="icon-btn text-danger" title="Reject" onClick={() => setRejectingRequestId(req.id)}>
                          <i className='bx bx-x-circle'></i>
                        </button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {filteredApprovals.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>No expense approvals found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
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
      {viewingRequestId !== null && viewingDetails && (
        <div className="modal-overlay" onClick={() => setViewingRequestId(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Expense Request Details</h2>
              <button className="close-btn" onClick={() => setViewingRequestId(null)}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <div className="modal-body">
              <h3 className="modal-section-title">Session Information</h3>
              <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label>Session Name</label>
                  <div style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>{viewingDetails.sessionName || 'N/A'}</div>
                </div>
                <div className="form-group">
                  <label>Session Date</label>
                  <div style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>{viewingDetails.sessionDate || 'N/A'}</div>
                </div>
                <div className="form-group">
                  <label>Client Name</label>
                  <div style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>{viewingDetails.clientName}</div>
                </div>
              </div>

              <h3 className="modal-section-title">Expense Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Expense Type</label>
                  <div style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>{viewingDetails.expenseType}</div>
                </div>
                <div className="form-group">
                  <label>Delivery By</label>
                  <div style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>{viewingDetails.deliveredBy}</div>
                </div>
                <div className="form-group">
                  <label>Amount</label>
                  <div style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', fontWeight: 'bold' }}>{formatCurrency(viewingDetails.amount)}</div>
                </div>
                <div className="form-group full-width">
                  <label>Details</label>
                  <div style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', whiteSpace: 'pre-wrap' }}>{viewingDetails.details}</div>
                </div>
                <div className="form-group">
                  <label>Added By</label>
                  <div style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>{viewingDetails.addedBy}</div>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <div style={{ padding: '0.5rem' }}>
                    <span className={`badge badge-${viewingDetails.status === 'Approved' ? 'success' : viewingDetails.status === 'Rejected' ? 'danger' : 'warning'}`}>
                      {viewingDetails.status}
                    </span>
                  </div>
                </div>
                {viewingDetails.status === 'Rejected' && (
                  <div className="form-group full-width">
                    <label>Rejection Reason</label>
                    <div style={{ padding: '0.5rem', background: '#fee2e2', color: 'var(--red)', borderRadius: 'var(--radius-md)', border: '1px solid #fca5a5' }}>
                      {viewingDetails.rejectReason}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              {viewingDetails.status === 'Pending' && (
                <>
                  <button className="btn-outline text-danger" style={{ borderColor: 'var(--danger)' }} onClick={() => { setRejectingRequestId(viewingDetails.id); setViewingRequestId(null); }}>Reject</button>
                  <button className="btn-primary" style={{ background: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => { handleUpdateStatus(viewingDetails.id, 'Approved'); setViewingRequestId(null); }}>Approve</button>
                </>
              )}
              {viewingDetails.status !== 'Pending' && (
                <button className="btn-outline" onClick={() => setViewingRequestId(null)}>Close</button>
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
            }}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Reason for rejection <span className="text-red">*</span></label>
                  <textarea 
                    className="form-control" 
                    rows="4" 
                    required 
                    placeholder="Please explain why this expense is being rejected..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-outline" onClick={() => { setRejectingRequestId(null); setRejectReason(''); }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}>Confirm Reject</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default ExpenseApproval;
