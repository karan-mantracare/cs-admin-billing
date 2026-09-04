import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';

function CustomSelect({ label, options, value, onChange, id }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="filter-group" ref={dropdownRef}>
      <label>{label}</label>
      <div className={`custom-select ${isOpen ? 'active' : ''}`} id={id}>
        <div className="select-trigger" onClick={() => setIsOpen(!isOpen)}>
          <span>{value ? value.label : 'Select...'}</span>
          <div className="select-actions">
            {value && (
              <i className='bx bx-x clear-btn' onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }} style={{ display: 'block' }}></i>
            )}
            {!value && <i className='bx bxs-down-arrow arrow'></i>}
          </div>
        </div>
        {isOpen && (
          <div className="select-dropdown" style={{ display: 'flex' }}>
            <div className="search-box">
              <i className='bx bx-search'></i>
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <ul className="options">
              {filteredOptions.map((opt, i) => (
                <li key={i} onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                  setSearchTerm('');
                }}>
                  {opt.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  
  const orderOptions = [
    { value: 'adv', label: 'Advanced Plan 2026-0...' },
    { value: 'ai', label: 'All Products with AI bot' },
    { value: 'comp20', label: 'Comprehensive Plan 20...' },
    { value: 'compw', label: 'Comprehensive Wellness...' },
  ];
  
  const divisionOptions = [
    { value: 'safi', label: 'Al Safi - Danone Co Ltd' },
    { value: 'api', label: 'API Client' },
    { value: 'aspen', label: 'Aspen Medical' },
    { value: 'avery', label: 'Avery Dennison (India)' },
  ];

  const timeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'custom', label: 'Custom Time' },
    { value: '6m', label: 'Last 6 months' },
    { value: '1m', label: 'Last month' },
  ];

  const [order, setOrder] = useState(orderOptions[3]);
  const [division, setDivision] = useState({ value: 'mc', label: 'MantraCare Intern...' });
  const [time, setTime] = useState(timeOptions[0]);

  const { events, updateEventStatus, requestReschedule, updateEventDetails, addEvent, addExpense, showToast } = useGlobal();

  // Add Expense State
  const [expenseModalEventId, setExpenseModalEventId] = useState(null);
  const [expenseData, setExpenseData] = useState({
    expenseType: 'Session Expense',
    deliveredBy: 'CS-Karan',
    amount: '',
    details: ''
  });

  const handleAddExpense = (e) => {
    e.preventDefault();
    const event = events.find(ev => ev.id === expenseModalEventId);
    
    addExpense({
      date: new Date().toISOString().split('T')[0],
      clientName: event?.clientName || 'MantraCare Internal',
      expenseType: expenseData.expenseType,
      details: expenseData.details,
      deliveredBy: expenseData.deliveredBy,
      amount: parseFloat(expenseData.amount),
      addedBy: 'CS-Karan',
      eventId: expenseModalEventId
    });

    showToast('Expense added successfully. Pending approval.', 5000);

    setExpenseModalEventId(null);
    setExpenseData({
      expenseType: 'Session Expense',
      deliveredBy: 'CS-Karan',
      amount: '',
      details: ''
    });
  };

  // Inline Row State
  const [isAdding, setIsAdding] = useState(false);
  const eventNameOptions = {
    webinar: ['Remote Work Wellness Webinar', 'Diversity & Inclusion Webinar'],
    seminar: ['Leadership Seminar 2026', 'Team Building Seminar'],
    assessment: ['Q3 Performance Assessment', 'Annual Culture Assessment']
  };

  const [newActivity, setNewActivity] = useState({
    sessionDate: '',
    sessionType: 'webinar',
    sessionName: eventNameOptions.webinar[0]
  });

  const handleSaveInline = () => {
    if (!newActivity.sessionDate || !newActivity.sessionName) {
      alert('Please fill out Date and Event Name');
      return;
    }

    addEvent({
      submittedOn: new Date().toISOString().split('T')[0],
      sessionName: newActivity.sessionName,
      clientName: 'MantraCare Internal',
      sessionDate: newActivity.sessionDate,
      sessionType: newActivity.sessionType,
      location: 'Online',
      expertExp: 0,
      genderPref: 'no_preference',
      budget: 0,
      otherCosts: 0,
      requirements: 'Generated from inline CS Calendar.',
      status: 'tentative',
      createdBy: 'CS-Karan'
    });

    setIsAdding(false);
    setNewActivity({ sessionDate: '', sessionType: 'webinar', sessionName: eventNameOptions.webinar[0] });
  };

  // Reschedule Prompt State
  const [showReschedulePrompt, setShowReschedulePrompt] = useState(false);
  const [showRescheduleDatepicker, setShowRescheduleDatepicker] = useState(false);
  const [newRescheduleDate, setNewRescheduleDate] = useState('');
  const [reschedulingEventId, setReschedulingEventId] = useState(null);

  // Today and Mark Complete State
  const [todayActionId, setTodayActionId] = useState(null);
  const [markCompleteId, setMarkCompleteId] = useState(null);
  const [participantCount, setParticipantCount] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // We map the global events to the dashboard table.
  // Instead of static webinars, we use actual events.

  const renderStatus = (status, createdBy) => {
    switch (status) {
      case 'pending_confirmation': 
        return <span className="status-pill status-tentative"><i className='bx bx-time'></i> {createdBy && createdBy.startsWith('HR') ? `Added by ${createdBy}` : 'Pending Confirmation'}</span>;
      case 'provider_allocation_pending': 
        return <span className="status-pill status-approved"><i className='bx bx-user-plus'></i> Provider Allocation Pending</span>;
      case 'event_scheduled': 
        return <span className="status-pill status-complete"><i className='bx bx-check-circle'></i> Event Scheduled</span>;
      case 'event_completed': 
        return <span className="status-pill status-complete"><i className='bx bx-check-double'></i> Event Completed</span>;
      case 'reschedule_requested':
        return <span className="status-pill status-tentative" style={{ color: 'var(--orange)', borderColor: 'var(--orange)' }}><i className='bx bx-calendar-exclamation'></i> Reschedule Requested</span>;
      case 'date_change_requested':
        return <span className="status-pill status-tentative" title="Request to Change the Date: click on edit and change the session date" style={{ color: 'var(--orange)', borderColor: 'var(--orange)', cursor: 'help' }}><i className='bx bx-calendar-edit'></i> Request to Change Date</span>;
      case 'complete': 
      case 'completed':
      case 'event_completed':
        return <span className="status-pill status-approved"><i className='bx bx-check-circle'></i> Completed</span>;
      case 'approved': return <span className="status-pill status-approved"><i className='bx bx-check-circle'></i> Approved</span>;
      case 'tentative': return <span className="status-pill status-tentative"><i className='bx bx-time'></i> Tentative</span>;
      case 'canceled_by_cs':
      case 'canceled_by_hr':
        const byWhom = status === 'canceled_by_cs' ? 'CS' : 'HR';
        return <span className="status-pill" style={{ color: 'var(--text-muted)', borderColor: 'var(--text-muted)', backgroundColor: 'var(--bg-light)' }}><i className='bx bx-x-circle'></i> Canceled by {byWhom}</span>;
      default: return <span className="status-pill status-tentative"><i className='bx bx-time'></i> {status}</span>;
    }
  };

  return (
    <main className="main-content">
      <div className="page-header">
        <h1>Calendar</h1>
        
        <div className="filters">
          <CustomSelect label="Order" options={orderOptions} value={order} onChange={setOrder} id="orderSelect" />
          <CustomSelect label="Division" options={divisionOptions} value={division} onChange={setDivision} id="divisionSelect" />
          <CustomSelect label="Time Range" options={timeOptions} value={time} onChange={setTime} id="timeRangeSelect" />
        </div>

        {time?.value === 'custom' && (
          <div className="custom-date-range" id="customDateRange">
            <div className="date-input">
              <label>Start date :</label>
              <input type="date" defaultValue="2021-08-24" />
            </div>
            <div className="date-input">
              <label>End date :</label>
              <input type="date" defaultValue="2031-08-24" />
            </div>
          </div>
        )}
      </div>

      <div className="toolbar">
        <div className="status-legends">
          <span className="legend"><i className='bx bx-check-circle text-green'></i> Complete</span>
          <span className="legend"><i className='bx bx-check-circle text-green'></i> Approved</span>
          <span className="legend"><i className='bx bx-time text-orange'></i> Tentative</span>
          <span className="legend"><i className='bx bx-error-circle text-red'></i> Reschedule</span>
          <span className="legend"><i className='bx bx-x-circle text-gray'></i> Cancelled</span>
          <span className="legend"><i className='bx bx-shield-quarter text-yellow'></i> Special Approval</span>
        </div>
        <button className="btn-primary">
          <i className='bx bx-copy'></i> Use Existing Template
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>UPDATE AT</th>
              <th>CREATED BY</th>
              <th>CATEGORY</th>
              <th>EVENT NAME</th>
              <th>STATUS</th>
              <th>COMMENT</th>
              <th>PARTICIPANTS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {events.map((w, i) => (
              <tr key={i}>
                <td style={{ whiteSpace: 'nowrap' }}>{w.sessionDate}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{w.submittedOn}</td>
                <td>
                  <div style={{ whiteSpace: 'nowrap' }}>
                    {w.createdBy || 'CS-Karan'}<br/>
                    <small style={{ color: 'var(--text-muted)' }}>{w.submittedOn}</small>
                  </div>
                </td>
                <td>
                  <span style={{
                    color: (w.sessionType || 'webinar').toLowerCase() === 'onsite' ? 'var(--orange)' : 'var(--primary)',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {w.sessionType || 'Webinar'}
                  </span>
                </td>
                <td className="event-name">{w.sessionName}</td>
                <td>{renderStatus(w.status ? w.status.toLowerCase() : 'tentative', w.createdBy)}</td>
                <td className="comment">{w.comments && w.comments.length > 0 ? w.comments[0].text : '-'}</td>
                <td>{w.participantCount || 0}</td>
                <td className="actions">
                  <button className="action-btn edit" title="View" onClick={() => navigate(`/edit?id=${w.id}`)}>
                    <i className='bx bx-show'></i>
                  </button>

                  {w.status === 'event_scheduled' ? (
                    w.sessionDate > today ? (
                      <button className="action-btn delete" title="Cancel/Reschedule" onClick={() => {
                        setReschedulingEventId(w.id);
                        setShowReschedulePrompt(true);
                      }}>
                        <i className='bx bx-minus-circle'></i>
                      </button>
                    ) : w.sessionDate === today ? (
                      <button className="action-btn edit" title="Update Session" onClick={() => {
                        setTodayActionId(w.id);
                      }}>
                        <i className='bx bx-pencil'></i>
                      </button>
                    ) : (
                      <button className="action-btn" title="Mark Complete" style={{ color: 'var(--green)', background: 'transparent' }} onClick={() => {
                        setMarkCompleteId(w.id);
                      }}>
                        <i className='bx bx-check-circle' style={{ fontSize: '1.25rem' }}></i>
                      </button>
                    )
                  ) : (
                    (!w.status || (w.status.toLowerCase() !== 'canceled_by_cs' && w.status.toLowerCase() !== 'canceled_by_hr' && w.status.toLowerCase() !== 'complete' && w.status.toLowerCase() !== 'completed' && w.status.toLowerCase() !== 'event_completed')) && (
                      <button className="action-btn delete" title="Cancel" onClick={() => {
                        if (window.confirm('Are you sure you want to cancel this event?')) {
                          updateEventStatus(w.id, 'canceled_by_cs');
                        }
                      }}>
                        <i className='bx bx-minus-circle'></i>
                      </button>
                    )
                  )}
                  {(w.status === 'complete' || w.status === 'completed' || w.status === 'event_completed') && (
                    <button className="action-btn" title="Update Session" disabled style={{ color: '#ccc', cursor: 'not-allowed', background: 'transparent' }}>
                      <i className='bx bx-pencil'></i>
                    </button>
                  )}
                </td>
              </tr>
            ))}
            
            {/* Inline Add Row */}
            {isAdding && (
              <tr style={{ background: 'var(--bg-light)' }}>
                <td>
                  <input 
                    type="date" 
                    className="form-control" 
                    style={{ padding: '0.25rem', width: '130px', fontSize: '0.85rem' }} 
                    value={newActivity.sessionDate}
                    onChange={(e) => setNewActivity({...newActivity, sessionDate: e.target.value})}
                  />
                </td>
                <td>-</td>
                <td>CS-Karan</td>
                <td>
                  <select 
                    className="form-control" 
                    style={{ padding: '0.25rem', fontSize: '0.85rem' }}
                    value={newActivity.sessionType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setNewActivity({
                        ...newActivity, 
                        sessionType: newType,
                        sessionName: eventNameOptions[newType][0]
                      });
                    }}
                  >
                    <option value="webinar">Webinar</option>
                    <option value="seminar">Seminar</option>
                    <option value="assessment">Assessment</option>
                  </select>
                </td>
                <td>
                  <select 
                    className="form-control" 
                    style={{ padding: '0.25rem', fontSize: '0.85rem' }}
                    value={newActivity.sessionName}
                    onChange={(e) => setNewActivity({...newActivity, sessionName: e.target.value})}
                  >
                    {eventNameOptions[newActivity.sessionType].map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </td>
                <td><span className="status-pill status-tentative">Tentative</span></td>
                <td>-</td>
                <td>0</td>
                <td className="actions" style={{ gap: '0.5rem' }}>
                  <button className="btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={handleSaveInline}>
                    Save
                  </button>
                  <button className="btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setIsAdding(false)}>
                    Cancel
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex' }}>
        <button className="btn-primary" onClick={() => setIsAdding(true)} disabled={isAdding}>
          <i className='bx bx-plus'></i> Add Activity
        </button>
      </div>

      {/* Reschedule Prompt Modal */}
      {showReschedulePrompt && (
        <div className="modal-overlay" onClick={() => { setShowReschedulePrompt(false); setShowRescheduleDatepicker(false); setReschedulingEventId(null); }}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Action Not Allowed</h2>
              <button className="close-btn" onClick={() => { setShowReschedulePrompt(false); setShowRescheduleDatepicker(false); setReschedulingEventId(null); }}><i className='bx bx-x'></i></button>
            </div>
            <div className="modal-body text-center">
              {!showRescheduleDatepicker ? (
                <>
                  <p style={{ marginBottom: '1.5rem', lineHeight: '1.5' }}>
                    Since the expert is assigned it can not be Deleted. Do you instead want to raise a reschedule request?
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button className="btn-primary" onClick={() => setShowRescheduleDatepicker(true)}>Yes</button>
                    <button className="btn-outline" onClick={() => setShowReschedulePrompt(false)}>No</button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ marginBottom: '1rem' }}>Please select a new date:</p>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={newRescheduleDate} 
                    onChange={e => setNewRescheduleDate(e.target.value)} 
                    style={{ marginBottom: '1.5rem', width: '100%' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button className="btn-primary" onClick={() => {
                      if (!newRescheduleDate) { alert('Please select a date.'); return; }
                      if (reschedulingEventId) {
                        requestReschedule(reschedulingEventId, newRescheduleDate);
                        alert("Request sent to the Team.");
                        setShowReschedulePrompt(false);
                        setShowRescheduleDatepicker(false);
                        setNewRescheduleDate('');
                        setReschedulingEventId(null);
                      }
                    }}>Submit Request</button>
                    <button className="btn-outline" onClick={() => { setShowReschedulePrompt(false); setShowRescheduleDatepicker(false); setNewRescheduleDate(''); setReschedulingEventId(null); }}>Cancel</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Today Action Modal */}
      {todayActionId && (
        <div className="modal-overlay" onClick={() => setTodayActionId(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Update Today's Session</h2>
              <button className="close-btn" onClick={() => setTodayActionId(null)}><i className='bx bx-x'></i></button>
            </div>
            <div className="modal-body text-center">
              <p style={{ marginBottom: '1.5rem', lineHeight: '1.5' }}>
                How would you like to update this session?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 2rem' }}>
                <button className="btn-primary" style={{ background: 'var(--green)', borderColor: 'var(--green)' }} onClick={() => {
                  setMarkCompleteId(todayActionId);
                  setTodayActionId(null);
                }}>Mark as Complete</button>
                <button className="btn-primary" onClick={() => {
                  setReschedulingEventId(todayActionId);
                  setShowRescheduleDatepicker(true);
                  setShowReschedulePrompt(true);
                  setTodayActionId(null);
                }}>Reschedule Session</button>
                <button className="btn-outline" onClick={() => setTodayActionId(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mark Complete Modal */}
      {markCompleteId && (
        <div className="modal-overlay" onClick={() => { setMarkCompleteId(null); setParticipantCount(''); }}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Mark as Complete</h2>
              <button className="close-btn" onClick={() => { setMarkCompleteId(null); setParticipantCount(''); }}><i className='bx bx-x'></i></button>
            </div>
            <div className="modal-body">
              <div style={{ backgroundColor: 'rgba(255, 152, 0, 0.1)', borderLeft: '4px solid var(--orange)', padding: '1rem', marginBottom: '1.5rem', borderRadius: '4px' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-color)' }}>
                  <i className='bx bx-error-circle' style={{ color: 'var(--orange)', marginRight: '6px', verticalAlign: 'middle', fontSize: '1.2rem' }}></i>
                  <strong>Warning:</strong> Please add any Session Expenses before proceeding. Once marked as complete, you will not be able to add any session expenses.
                </p>
              </div>
              <div className="form-group">
                <label>Update Participant Count <span className="text-red">*</span></label>
                <input 
                  type="number" 
                  className="form-control" 
                  min="0"
                  required
                  value={participantCount}
                  onChange={(e) => setParticipantCount(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn-outline" onClick={() => { setMarkCompleteId(null); setParticipantCount(''); }}>Cancel</button>
              <button className="btn-primary" style={{ background: 'var(--green)', borderColor: 'var(--green)' }} onClick={() => {
                if (!participantCount) {
                  alert('Please enter a participant count.');
                  return;
                }
                updateEventDetails(markCompleteId, { 
                  participantCount: parseInt(participantCount, 10), 
                  status: 'complete' 
                });
                setMarkCompleteId(null);
                setParticipantCount('');
              }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {expenseModalEventId && (
        <div className="modal-overlay" onClick={() => setExpenseModalEventId(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Add Session Expense</h2>
              <button className="close-btn" onClick={() => setExpenseModalEventId(null)}><i className='bx bx-x'></i></button>
            </div>
            <form onSubmit={handleAddExpense}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Expense Type <span className="text-red">*</span></label>
                  <select 
                    className="form-control" 
                    required
                    value={expenseData.expenseType}
                    onChange={(e) => setExpenseData({...expenseData, expenseType: e.target.value})}
                  >
                    <option value="Session Expense">Session Expense</option>
                    <option value="Travel">Travel</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount <span className="text-red">*</span></label>
                  <input 
                    type="number" 
                    className="form-control" 
                    min="0"
                    step="0.01"
                    required
                    value={expenseData.amount}
                    onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Delivered By <span className="text-red">*</span></label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required
                    value={expenseData.deliveredBy}
                    onChange={(e) => setExpenseData({...expenseData, deliveredBy: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Details</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    value={expenseData.details}
                    onChange={(e) => setExpenseData({...expenseData, details: e.target.value})}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-outline" onClick={() => setExpenseModalEventId(null)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: 'var(--green)', borderColor: 'var(--green)' }}>Submit Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Dashboard;
