import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const webinars = [
    { date: '3 Mar 2025', updateAt: '-', createdBy: '-', category: 'Webinar', name: 'Employee Induction Webinar', status: 'complete', comment: 'Hey I need help with this activity', participants: 1 },
    { date: '12 Jan 2025', updateAt: '-', createdBy: '-', category: 'Assessment', name: 'Holistic Wellbeing Assessment', status: 'approved', comment: '-', participants: 0 },
    { date: '28 Jan 2025', updateAt: '-', createdBy: '-', category: 'Webinar', name: '#Happify: The Secret To Happiness', status: 'approved', comment: '-', participants: 0 },
    { date: '25 Apr 2025', updateAt: '-', createdBy: '-', category: 'Webinar', name: 'Art & Mindfulness', status: 'tentative', comment: '-', participants: 0 },
    { date: '14 May 2025', updateAt: '-', createdBy: '-', category: 'Training', name: 'Time Management & Productivity: Beating Procrastination', status: 'tentative', comment: '-', participants: 0 },
  ];

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
            {webinars.map((w, i) => (
              <tr key={i}>
                <td>{w.date}</td>
                <td>{w.updateAt}</td>
                <td>{w.createdBy}</td>
                <td>{w.category}</td>
                <td className="event-name">{w.name}</td>
                <td>{renderStatus(w.status)}</td>
                <td className="comment">{w.comment}</td>
                <td>{w.participants}</td>
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
