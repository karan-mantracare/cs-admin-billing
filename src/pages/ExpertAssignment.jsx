import { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';

function ExpertAssignment() {
  const { events: allEvents, assignExpert, acceptReschedule, requestAlternativeDate } = useGlobal();
  const events = allEvents;
  const assignments = events.filter(ev => ev.status === 'provider_allocation_pending' || ev.status === 'event_scheduled');

  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [assigningId, setAssigningId] = useState(null);
  const [selectedExpert, setSelectedExpert] = useState('');
  const [expertCost, setExpertCost] = useState('');

  // Rescheduled Section State
  const [isRescheduledCollapsed, setIsRescheduledCollapsed] = useState(true);
  const rescheduledEvents = allEvents.filter(ev => ev.status === 'reschedule_requested');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const filteredAssignments = assignments.filter(item => 
    item.sessionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const paginatedAssignments = filteredAssignments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeAssignment = assignments.find(a => a.id === assigningId);

  // Determine text color based on cost vs budget
  const getCostColor = () => {
    if (!activeAssignment || !expertCost) return 'var(--text-main)';
    const cost = parseFloat(expertCost);
    const budget = activeAssignment.budget;
    
    if (isNaN(cost)) return 'var(--text-main)';
    
    if (cost <= budget * 0.50) return 'var(--green)'; // Green
    if (cost <= budget * 0.80) return 'var(--orange)';  // Orange
    return 'var(--red)'; // Red
  };

  const isCostValid = () => {
    if (!activeAssignment || !expertCost) return false;
    const cost = parseFloat(expertCost);
    return !isNaN(cost) && cost > 0 && cost <= activeAssignment.budget;
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!selectedExpert) {
      alert('Please select an expert.');
      return;
    }
    if (!isCostValid()) {
      alert('Cost must be greater than 0 and cannot exceed the budget.');
      return;
    }

    assignExpert(assigningId, selectedExpert, parseFloat(expertCost));

    setAssigningId(null);
    setSelectedExpert('');
    setExpertCost('');
  };

  const openAssignModal = (assignment) => {
    setAssigningId(assignment.id);
    setSelectedExpert(assignment.assignedExpert || '');
    setExpertCost(assignment.expertCost ? assignment.expertCost.toString() : '');
  };

  // Mock list of experts
  const expertOptions = [
    "Dr. Sarah Jenkins",
    "Dr. Michael Chen",
    "Jane Doe, LCSW",
    "John Smith, Ph.D",
    "Alice Williams, M.A."
  ];

  return (
    <main className="main-content">
      <div className="page-header">
        <h1>Expert Assignment</h1>
        <p className="text-muted">Assign experts to approved events and manage session costs.</p>
      </div>

      {rescheduledEvents.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setIsRescheduledCollapsed(!isRescheduledCollapsed)}
          >
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--orange)' }}>
              <i className='bx bx-calendar-exclamation' style={{ marginRight: '8px' }}></i>
              Session Rescheduled ({rescheduledEvents.length})
            </h2>
            <i className={`bx bx-chevron-${isRescheduledCollapsed ? 'down' : 'up'}`} style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}></i>
          </div>
          
          {!isRescheduledCollapsed && (
            <div className="table-responsive" style={{ marginTop: '1rem' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Session Name</th>
                    <th>Client Name</th>
                    <th>Old Date</th>
                    <th>Requested Date</th>
                    <th>Expert</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rescheduledEvents.map(ev => (
                    <tr key={ev.id}>
                      <td><span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{ev.sessionName}</span></td>
                      <td>{ev.clientName}</td>
                      <td>{ev.sessionDate}</td>
                      <td style={{ color: 'var(--orange)', fontWeight: '600' }}>{ev.requestedDate}</td>
                      <td>{ev.assignedExpert}</td>
                      <td style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', background: 'var(--green)', borderColor: 'var(--green)' }}
                          onClick={() => {
                            if (window.confirm("This confirms that the same expert will be conducting the session on the rescheduled date. Confirm or cancel.")) {
                              acceptReschedule(ev.id);
                            }
                          }}
                        >
                          Accept
                        </button>
                        <button 
                          className="btn-outline" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                          onClick={() => openAssignModal(ev)}
                        >
                          Update Expert
                        </button>
                        <button 
                          className="btn-outline" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', borderColor: 'var(--red)', color: 'var(--red)' }}
                          onClick={() => {
                            alert("This will send notification to the required team to change the date.");
                            requestAlternativeDate(ev.id);
                          }}
                        >
                          Request Another Date
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="table-controls" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="search-box" style={{ flex: 1, minWidth: '250px' }}>
            <i className='bx bx-search'></i>
            <input 
              type="text" 
              placeholder="Search by session or client..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Approved On</th>
                <th>Session Name</th>
                <th>Client Name</th>
                <th>Session Date</th>
                <th>Type</th>
                <th>Budget</th>
                <th>Assigned Expert</th>
                <th>Expert Cost</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAssignments.length > 0 ? (
                paginatedAssignments.map(assignment => (
                  <tr key={assignment.id}>
                    <td>{assignment.submittedOn || '2026-08-20'}</td>
                    <td><span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{assignment.sessionName}</span></td>
                    <td>{assignment.clientName}</td>
                    <td>{assignment.sessionDate}</td>
                    <td style={{ textTransform: 'capitalize' }}>{assignment.sessionType || assignment.type}</td>
                    <td>{formatCurrency(assignment.budget)}</td>
                    <td>
                      {assignment.assignedExpert ? (
                        <span style={{ color: 'var(--primary)', fontWeight: '500' }}>{assignment.assignedExpert}</span>
                      ) : (
                        <span className="text-muted">Not Assigned</span>
                      )}
                    </td>
                    <td>
                      {assignment.expertCost > 0 ? formatCurrency(assignment.expertCost) : '-'}
                    </td>
                    <td>
                      <button className="btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => openAssignModal(assignment)}>
                        {assignment.assignedExpert ? (assignment.status === 'reschedule_requested' ? 'Update Expert' : 'Reassign') : 'Assign Expert'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>No approved requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              className="icon-btn" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <i className='bx bx-chevron-left'></i>
            </button>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button 
              className="icon-btn" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <i className='bx bx-chevron-right'></i>
            </button>
          </div>
        )}
      </div>

      {/* Assign Expert Modal */}
      {assigningId !== null && activeAssignment && (
        <div className="modal-overlay" onClick={() => setAssigningId(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>Assign Expert</h2>
              <button className="close-btn" onClick={() => setAssigningId(null)}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            
            <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
              <div className="modal-body" style={{ overflowY: 'auto' }}>
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ margin: '0 0 0.5rem 0' }}><strong>Session:</strong> {activeAssignment.sessionName}</p>
                  <p style={{ margin: '0 0 0.5rem 0' }}><strong>Client:</strong> {activeAssignment.clientName}</p>
                  <p style={{ margin: '0', color: 'var(--primary)', fontWeight: '600' }}>Budget: {formatCurrency(activeAssignment.budget)}</p>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label>Select Expert <span className="text-red">*</span></label>
                  <select 
                    className="form-control" 
                    required
                    value={selectedExpert}
                    onChange={(e) => setSelectedExpert(e.target.value)}
                  >
                    <option value="">-- Choose an Expert --</option>
                    {expertOptions.map((opt, idx) => (
                      <option key={idx} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label>Expert Session Cost (USD) <span className="text-red">*</span></label>
                  <input 
                    type="number" 
                    className="form-control" 
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={expertCost}
                    onChange={(e) => setExpertCost(e.target.value)}
                    style={{ 
                      color: getCostColor(), 
                      fontWeight: '600',
                      borderColor: parseFloat(expertCost) > activeAssignment.budget ? 'var(--red)' : 'var(--border-color)'
                    }}
                  />
                  {expertCost && parseFloat(expertCost) > activeAssignment.budget && (
                    <p style={{ color: 'var(--red)', fontSize: '0.85rem', marginTop: '0.5rem', marginBottom: '0' }}>
                      <i className='bx bx-error-circle' style={{ verticalAlign: 'middle', marginRight: '4px' }}></i>
                      Cost cannot be greater than the Budget ({formatCurrency(activeAssignment.budget)}).
                    </p>
                  )}
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-outline" onClick={() => setAssigningId(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={!selectedExpert || !isCostValid()}>
                  {activeAssignment.status === 'reschedule_requested' ? 'Update Expert & Reschedule' : 'Assign Expert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default ExpertAssignment;
