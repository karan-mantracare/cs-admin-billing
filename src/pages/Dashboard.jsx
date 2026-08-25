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

  const { events } = useGlobal();

  // We map the global events to the dashboard table.
  // Instead of static webinars, we use actual events.

  const renderStatus = (status) => {
    switch (status) {
      case 'complete': return <span className="status-pill status-complete"><i className='bx bx-check-double'></i> Complete</span>;
      case 'approved': return <span className="status-pill status-approved"><i className='bx bx-check-circle'></i> Approved</span>;
      case 'tentative': return <span className="status-pill status-tentative"><i className='bx bx-time'></i> Tentative</span>;
      default: return null;
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
          <span className="legend"><i className='bx bx-check-double text-blue'></i> Complete</span>
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
                <td style={{ textTransform: 'capitalize' }}>{w.sessionType || 'Webinar'}</td>
                <td className="event-name">{w.sessionName}</td>
                <td>{renderStatus(w.status ? w.status.toLowerCase() : 'tentative')}</td>
                <td className="comment">{w.comments && w.comments.length > 0 ? w.comments[0].text : '-'}</td>
                <td>{0}</td>
                <td className="actions">
                  <button className="action-btn edit" title="Edit" onClick={() => navigate('/edit')}>
                    <i className='bx bx-pencil'></i>
                  </button>
                  <button className="action-btn delete" title="Delete">
                    <i className='bx bx-minus-circle'></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default Dashboard;
