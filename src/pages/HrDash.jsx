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

function HrDash() {
  const navigate = useNavigate();
  const { events, addEvent, deleteEvent, updateEventStatus, requestReschedule, updateEventDetails } = useGlobal();
  
  const orderOptions = [{ value: 'all', label: 'All' }];
  const divisionOptions = [{ value: 'all', label: 'All' }];
  const timeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'custom', label: 'Custom Range' },
    { value: '1m', label: 'Last month' },
  ];

  const [order, setOrder] = useState(orderOptions[0]);
  const [division, setDivision] = useState(divisionOptions[0]);
  const [time, setTime] = useState(timeOptions[0]);

  // Reschedule Prompt State
  const [showReschedulePrompt, setShowReschedulePrompt] = useState(false);
  const [showRescheduleDatepicker, setShowRescheduleDatepicker] = useState(false);
  const [newRescheduleDate, setNewRescheduleDate] = useState('');
  const [reschedulingEventId, setReschedulingEventId] = useState(null);

  const today = new Date().toISOString().split('T')[0];

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

  const hrEvents = events.filter(e => e.createdBy && e.createdBy.startsWith('HR'));

  const renderStatus = (status) => {
    const statStr = status ? status.toLowerCase() : 'tentative';
    switch (statStr) {
      case 'tentative':
      case 'pending_confirmation': 
        return <span className="status-pill status-tentative"><i className='bx bx-time'></i> Tentative</span>;
      case 'provider_allocation_pending': 
        return <span className="status-pill status-approved"><i className='bx bx-user-plus'></i> Provider Allocation Pending</span>;
      case 'event_scheduled': 
        return <span className="status-pill status-complete"><i className='bx bx-check-circle'></i> Event Scheduled</span>;
      case 'event_completed': 
        return <span className="status-pill status-complete"><i className='bx bx-check-double'></i> Event Completed</span>;
      case 'complete': 
        return <span className="status-pill status-approved"><i className='bx bx-check-circle'></i> Complete</span>;
      case 'approved': 
        return <span className="status-pill status-approved"><i className='bx bx-check-circle'></i> Approved</span>;
      case 'reschedule_requested':
        return <span className="status-pill status-tentative" style={{ color: 'var(--orange)', borderColor: 'var(--orange)' }}><i className='bx bx-calendar-exclamation'></i> Reschedule Requested</span>;
      case 'date_change_requested':
        return <span className="status-pill status-tentative" title="Request to Change the Date: click on edit and change the session date" style={{ color: 'var(--orange)', borderColor: 'var(--orange)', cursor: 'help' }}><i className='bx bx-calendar-edit'></i> Request to Change Date</span>;
      case 'canceled_by_cs':
      case 'canceled_by_hr':
        const byWhom = statStr === 'canceled_by_cs' ? 'CS' : 'HR';
        return <span className="status-pill" style={{ color: 'var(--text-muted)', borderColor: 'var(--text-muted)', backgroundColor: 'var(--bg-light)' }}><i className='bx bx-x-circle'></i> Canceled by {byWhom}</span>;
      default: 
        return <span className="status-pill status-tentative"><i className='bx bx-time'></i> {statStr}</span>;
    }
  };

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
      requirements: 'Generated from inline HR Calendar.',
      status: 'tentative', // as explicitly requested
      createdBy: 'HR-Rakesh'
    });

    setIsAdding(false);
    setNewActivity({ sessionDate: '', sessionType: 'webinar', sessionName: eventNameOptions.webinar[0] });
  };

  return (
    <main className="main-content">
      <div className="page-header">
        <h1>HR Calendar</h1>
        
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

      <div className="table-container" style={{ marginTop: '1.5rem' }}>
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
            {hrEvents.map((w, i) => (
              <tr key={w.id || i}>
                <td style={{ whiteSpace: 'nowrap' }}>{w.sessionDate}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{w.submittedOn}</td>
                <td>
                  <div style={{ whiteSpace: 'nowrap' }}>
                    {w.createdBy}<br/>
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
                <td>{renderStatus(w.status)}</td>
                <td className="comment">{w.comments && w.comments.length > 0 ? w.comments[0].text : '-'}</td>
                <td>{w.participantCount || 0}</td>
                <td className="actions">
                  <button className="action-btn edit" title="View" onClick={() => navigate(`/edit?id=${w.id}&role=hr`)}>
                    <i className='bx bx-show'></i>
                  </button>
                  {w.status === 'event_scheduled' ? (
                    w.sessionDate > today && (
                      <button className="action-btn delete" title="Cancel/Reschedule" onClick={() => {
                        setReschedulingEventId(w.id);
                        setShowReschedulePrompt(true);
                      }}>
                        <i className='bx bx-minus-circle'></i>
                      </button>
                    )
                  ) : (
                    (!w.status || (w.status.toLowerCase() !== 'canceled_by_cs' && w.status.toLowerCase() !== 'canceled_by_hr' && w.status.toLowerCase() !== 'complete' && w.status.toLowerCase() !== 'event_completed')) && (
                      <button className="action-btn delete" title="Cancel" onClick={() => {
                        if (window.confirm('Are you sure you want to cancel this event?')) {
                          updateEventStatus(w.id, 'canceled_by_hr');
                        }
                      }}>
                        <i className='bx bx-minus-circle'></i>
                      </button>
                    )
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
                <td>HR-Rakesh</td>
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
            
            {!isAdding && hrEvents.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>No events found. Click "Add Activity" to create one.</td>
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
    </main>
  );
}

export default HrDash;
