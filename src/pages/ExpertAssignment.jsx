import { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import ModificationRequestModal from '../components/ModificationRequestModal';

function ExpertAssignment() {
  const { events: allEvents, assignExpert, rejectExpertRequest, acceptReschedule, requestAlternativeDate } = useGlobal();
  const events = allEvents;
  const assignments = allEvents.flatMap(ev => {
    if (ev.status !== 'provider_allocation_pending' && ev.status !== 'event_scheduled') return [];
    
    if (ev.expertRequests && ev.expertRequests.length > 0) {
      return ev.expertRequests.map(req => ({
        ...ev,
        ...req,
        eventId: ev.id,
        requestId: req.id,
        status: req.status || ev.status,
        uniqueId: `${ev.id}-${req.id}`
      }));
    }
    
    return [{
      ...ev,
      eventId: ev.id,
      requestId: null,
      uniqueId: `${ev.id}`
    }];
  });

  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [assigningId, setAssigningId] = useState(null);
  const [selectedExpert, setSelectedExpert] = useState('');
  const [expertCost, setExpertCost] = useState('');

  // Assign Expert Modal New Flow State
  const [isSearchingExperts, setIsSearchingExperts] = useState(false);
  const [searchFilters, setSearchFilters] = useState({ language: '', location: '', mode: '' });
  const [expertSearchResults, setExpertSearchResults] = useState([]);
  const [isAssignConfirmOpen, setIsAssignConfirmOpen] = useState(false);
  const [selectedExpertData, setSelectedExpertData] = useState(null);

  // Modification Requests State
  const [isModificationsCollapsed, setIsModificationsCollapsed] = useState(false);
  const modificationRequests = allEvents.flatMap(ev => {
    let mods = [];
    if (ev.status === 'reschedule_requested') {
      mods.push({ ...ev, type: 'reschedule', eventId: ev.id, requestId: null, uniqueId: `reschedule-${ev.id}` });
    }
    if (ev.expertRequests && ev.expertRequests.length > 0) {
      ev.expertRequests.forEach(req => {
        if (req.status === 'expert_change_requested') {
          mods.push({
            ...ev,
            ...req,
            type: 'change_expert',
            eventId: ev.id,
            requestId: req.id,
            uniqueId: `change-${ev.id}-${req.id}`
          });
        }
      });
    }
    return mods;
  });

  const [viewModRequestData, setViewModRequestData] = useState(null);
  const [isModRequestModalOpen, setIsModRequestModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

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

  const activeAssignment = assignments.find(a => a.uniqueId === assigningId) || modificationRequests.find(a => a.uniqueId === assigningId);

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

    const active = activeAssignment;
    assignExpert(active.eventId, selectedExpert, parseFloat(expertCost), active.requestId);

    setAssigningId(null);
    setSelectedExpert('');
    setExpertCost('');
  };

  const openAssignModal = (assignment) => {
    setAssigningId(assignment.uniqueId);
    setSelectedExpert(assignment.assignedExpert || '');
    setExpertCost(assignment.expertCost ? assignment.expertCost.toString() : '');
    
    // Reset new flow state
    setIsSearchingExperts(false);
    setSearchFilters({
      language: assignment.language || 'English',
      mode: assignment.sessionType || 'online',
      location: assignment.location || ''
    });
    setExpertSearchResults([]);
    setSelectedExpertData(null);
  };

  const handleSearchExperts = () => {
    // Simple filter logic: in a real app, this would be an API call
    const results = expertDatabase.filter(exp => {
      const matchLang = !searchFilters.language || exp.language.toLowerCase().includes(searchFilters.language.toLowerCase());
      const matchLocation = !searchFilters.location || exp.location.toLowerCase().includes(searchFilters.location.toLowerCase()) || searchFilters.location.toLowerCase().includes(exp.location.toLowerCase());
      return matchLang || matchLocation; // lenient search for demo
    });
    // If no results, just show all for demo purposes
    setExpertSearchResults(results.length > 0 ? results : expertDatabase);
    setIsSearchingExperts(true);
  };

  const handleExpertSelect = (expert) => {
    setSelectedExpertData(expert);
    setSelectedExpert(expert.name);
    setExpertCost(expert.price.toString());
    setIsAssignConfirmOpen(true);
  };

  const confirmAssignment = () => {
    const active = activeAssignment;
    assignExpert(active.eventId, selectedExpert, parseFloat(expertCost), active.requestId);
    setAssigningId(null);
    setIsAssignConfirmOpen(false);
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }
    const active = activeAssignment;
    rejectExpertRequest(active.eventId, active.requestId, rejectReason);
    setAssigningId(null);
    setIsRejectModalOpen(false);
    setRejectReason('');
  };

  // Mock list of detailed experts
  const expertDatabase = [
    { providerId: 'P-101', name: 'Dr. Sarah Jenkins', email: 's.jenkins@example.com', location: 'Online', language: 'English', expertise: 'Mental Health, Wellness', price: 1.00 },
    { providerId: 'P-102', name: 'Dr. Michael Chen', email: 'm.chen@example.com', location: 'Onsite, New York', language: 'Mandarin Chinese, English', expertise: 'Stress Management', price: 2.50 },
    { providerId: 'P-103', name: 'Jane Doe, LCSW', email: 'j.doe@example.com', location: 'Online', language: 'Spanish, English', expertise: 'CBT, Therapy', price: 1.50 },
    { providerId: 'P-104', name: 'John Smith, Ph.D', email: 'j.smith@example.com', location: 'A1-10, 3rd Floow, Pashim Vihar, Delhi - 110063', language: 'Hindi, English', expertise: 'Counseling', price: 1.00 },
    { providerId: 'P-105', name: 'Alice Williams, M.A.', email: 'a.williams@example.com', location: 'Online', language: 'French, English', expertise: 'Yoga, Mindfulness', price: 2.00 },
    { providerId: 'P-106', name: 'Dr. Robert Kiyosaki', email: 'r.kiyosaki@example.com', location: 'Online', language: 'Japanese, English', expertise: 'Financial Wellness', price: 3.00 },
    { providerId: 'P-107', name: 'Maria Garcia, MD', email: 'm.garcia@example.com', location: 'Onsite, Los Angeles', language: 'Spanish', expertise: 'Dietary Counseling', price: 2.00 },
    { providerId: 'P-108', name: 'Priya Sharma, MSc', email: 'p.sharma@example.com', location: 'Delhi, India', language: 'Hindi, Punjabi, English', expertise: 'Corporate Wellness', price: 1.50 },
  ];

  return (
    <main className="main-content">
      <div className="page-header">
        <h1>Expert Assignment</h1>
        <p className="text-muted">Assign experts to approved events and manage session costs.</p>
      </div>

      {modificationRequests.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setIsModificationsCollapsed(!isModificationsCollapsed)}
          >
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--orange)' }}>
              <i className='bx bx-calendar-exclamation' style={{ marginRight: '8px' }}></i>
              Modification Request ({modificationRequests.length})
            </h2>
            <i className={`bx bx-chevron-${isModificationsCollapsed ? 'down' : 'up'}`} style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}></i>
          </div>
          
          {!isModificationsCollapsed && (
            <div className="table-responsive" style={{ marginTop: '1rem' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Request Type</th>
                    <th>Session Name</th>
                    <th>Client Name</th>
                    <th>Requested By</th>
                    <th>Session Date</th>
                    <th>Requested Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {modificationRequests.map(req => (
                    <tr key={req.uniqueId}>
                      <td><span style={{ fontWeight: '500', color: 'var(--text-main)', background: 'var(--bg-light)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {req.type === 'reschedule' ? 'Reschedule Session' : 'Change Expert'}
                      </span></td>
                      <td>{req.sessionName}</td>
                      <td>{req.clientName}</td>
                      <td>CS Team</td>
                      <td>{req.sessionDate}</td>
                      <td>{req.requestedDate || req.submittedOn || '2026-09-04'}</td>
                      <td>
                        <button 
                          className="btn-icon" 
                          style={{ padding: '0.3rem', fontSize: '1.25rem', color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer' }}
                          onClick={() => {
                            setViewModRequestData(req);
                            setIsModRequestModalOpen(true);
                          }}
                        >
                          <i className='bx bx-show'></i>
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
                <th>Raised By</th>
                <th>Client Name</th>
                <th>Session Date</th>
                <th>Type</th>
                <th>Location</th>
                <th>Budget</th>
                <th>Assigned Expert</th>
                <th>Expert Cost</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAssignments.length > 0 ? (
                paginatedAssignments.map(assignment => (
                  <tr key={assignment.uniqueId}>
                    <td>{assignment.submittedOn || '2026-08-20'}</td>
                    <td><span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{assignment.sessionName}</span></td>
                    <td>{assignment.createdBy || 'System'}</td>
                    <td>{assignment.clientName}</td>
                    <td>{assignment.sessionDate}</td>
                    <td style={{ textTransform: 'capitalize' }}>{assignment.sessionType || assignment.type}</td>
                    <td>{assignment.location || 'Online'}</td>
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
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: isSearchingExperts ? '1000px' : '700px' }}>
            <div className="modal-header">
              <h2>Assign Expert</h2>
              <button className="close-btn" onClick={() => setAssigningId(null)}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            
            <div className="modal-body" style={{ overflowY: 'auto', maxHeight: '80vh' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', background: 'var(--bg-main)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Session Details</h3>
                  <p style={{ margin: '0 0 0.5rem 0' }}><strong>Name:</strong> {activeAssignment.sessionName}</p>
                  <p style={{ margin: '0 0 0.5rem 0' }}><strong>Client:</strong> {activeAssignment.clientName}</p>
                  <p style={{ margin: '0 0 0.5rem 0' }}><strong>Language:</strong> {activeAssignment.language || 'English'}</p>
                  <p style={{ margin: '0 0 0.5rem 0' }}><strong>Mode:</strong> {activeAssignment.sessionType}</p>
                  <p style={{ margin: '0 0 0.5rem 0' }}><strong>Gender Pref:</strong> {activeAssignment.genderPref || 'None'}</p>
                  <p style={{ margin: '0', color: 'var(--green)', fontWeight: '600' }}>Budget: {formatCurrency(activeAssignment.budget)}</p>
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Schedule & Location</h3>
                  <p style={{ margin: '0 0 0.5rem 0' }}><strong>Date:</strong> {activeAssignment.sessionDate}</p>
                  <p style={{ margin: '0 0 0.5rem 0' }}><strong>Time:</strong> {activeAssignment.sessionTime || 'TBD'}</p>
                  <p style={{ margin: '0 0 0.5rem 0' }}><strong>Location:</strong> {activeAssignment.location || 'Online'}</p>
                </div>
              </div>

              {!isSearchingExperts ? (
                <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Search Filters</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Language</label>
                      <input type="text" className="form-control" value={searchFilters.language} onChange={(e) => setSearchFilters(prev => ({...prev, language: e.target.value}))} />
                    </div>
                    <div className="form-group">
                      <label>Mode</label>
                      <select className="form-control" value={searchFilters.mode} onChange={(e) => setSearchFilters(prev => ({...prev, mode: e.target.value}))}>
                        <option value="">Any</option>
                        <option value="online">Online</option>
                        <option value="onsite">Onsite</option>
                      </select>
                    </div>
                    <div className="form-group full-width">
                      <label>Location Keyword (e.g. city, address)</label>
                      <input type="text" className="form-control" value={searchFilters.location} onChange={(e) => setSearchFilters(prev => ({...prev, location: e.target.value}))} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                    <button className="btn-primary" onClick={handleSearchExperts}>Search Experts</button>
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Expert Results ({expertSearchResults.length})</h3>
                    <button className="btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }} onClick={() => setIsSearchingExperts(false)}>Revise Search</button>
                  </div>
                  
                  <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table className="data-table">
                      <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-main)', zIndex: 1 }}>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Location</th>
                          <th>Language</th>
                          <th>Expertise</th>
                          <th>Price</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expertSearchResults.map(exp => (
                          <tr key={exp.providerId}>
                            <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{exp.providerId}</td>
                            <td style={{ fontWeight: '500' }}>{exp.name}</td>
                            <td style={{ fontSize: '0.85rem' }}>{exp.location}</td>
                            <td style={{ fontSize: '0.85rem' }}>{exp.language}</td>
                            <td style={{ fontSize: '0.85rem' }}>{exp.expertise}</td>
                            <td style={{ color: exp.price <= activeAssignment.budget ? 'var(--green)' : 'var(--red)', fontWeight: '600' }}>
                              ${exp.price.toFixed(2)}
                            </td>
                            <td>
                              <button 
                                className="btn-outline" 
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.85rem' }}
                                onClick={() => handleExpertSelect(exp)}
                              >
                                Select
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button type="button" className="btn-outline" onClick={() => setIsRejectModalOpen(true)}>Reject</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirm Selection Modal */}
      {isAssignConfirmOpen && selectedExpertData && (
        <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={() => setIsAssignConfirmOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Confirm Assignment</h2>
              <button className="close-btn" onClick={() => setIsAssignConfirmOpen(false)}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '1rem' }}>
                You are about to assign <strong>{selectedExpertData.name}</strong> to the session <strong>{activeAssignment?.sessionName}</strong>.
              </p>
              <div style={{ background: 'var(--bg-light)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>Expert Price:</strong> ${selectedExpertData.price.toFixed(2)}</p>
                <p style={{ margin: '0' }}><strong>Session Budget:</strong> {activeAssignment ? formatCurrency(activeAssignment.budget) : ''}</p>
                {selectedExpertData.price > activeAssignment?.budget && (
                  <p style={{ margin: '0.5rem 0 0 0', color: 'var(--red)', fontSize: '0.85rem', fontWeight: '500' }}>
                    <i className='bx bx-error-circle'></i> Warning: Price exceeds budget.
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button className="btn-primary" onClick={confirmAssignment} disabled={selectedExpertData.price > activeAssignment?.budget}>
                  {activeAssignment?.status === 'reschedule_requested' ? 'Update & Reschedule' : 'Confirm Assignment'}
                </button>
                <button className="btn-outline" onClick={() => setIsAssignConfirmOpen(false)}>Back</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ModificationRequestModal 
        isOpen={isModRequestModalOpen}
        onClose={() => setIsModRequestModalOpen(false)}
        modificationData={viewModRequestData}
        onAssignExpert={() => {
          setIsModRequestModalOpen(false);
          openAssignModal(viewModRequestData);
        }}
        onAcceptReschedule={() => {
          if (window.confirm("This confirms that the same expert will be conducting the session on the rescheduled date. Confirm or cancel.")) {
            acceptReschedule(viewModRequestData.id);
            setIsModRequestModalOpen(false);
          }
        }}
        onRequestAnotherDate={() => {
          alert("This will send notification to the required team to change the date.");
          requestAlternativeDate(viewModRequestData.id);
          setIsModRequestModalOpen(false);
        }}
      />

      {/* Reject Request Modal */}
      {isRejectModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setIsRejectModalOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reject Request</h2>
              <button className="close-modal" onClick={() => setIsRejectModalOpen(false)}><i className='bx bx-x'></i></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleRejectSubmit}>
                <div className="form-group full-width">
                  <label>Reason for Rejection *</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    required 
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="E.g., Budget too low for this region"
                  ></textarea>
                </div>
                <div className="modal-footer" style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-outline" onClick={() => setIsRejectModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ backgroundColor: 'var(--red)', borderColor: 'var(--red)' }}>Submit Rejection</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ExpertAssignment;
