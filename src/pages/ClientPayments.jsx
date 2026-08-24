import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// Custom Multi-Select Dropdown Component
function MultiSelectDropdown({ options, selected, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
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

  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

  const toggleOption = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(item => item !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="multi-select-container" ref={dropdownRef}>
      <div className="multi-select-input" onClick={() => setIsOpen(!isOpen)}>
        <span>{selected.length > 0 ? `${selected.length} selected` : placeholder}</span>
        <i className='bx bx-chevron-down'></i>
      </div>
      {isOpen && (
        <div className="multi-select-dropdown">
          <div className="multi-select-search">
            <input 
              type="text" 
              placeholder="Search..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          {filteredOptions.map(opt => (
            <label key={opt} className="multi-select-option">
              <input 
                type="checkbox" 
                checked={selected.includes(opt)} 
                onChange={() => toggleOption(opt)} 
              />
              {opt}
            </label>
          ))}
          {filteredOptions.length === 0 && (
            <div style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>No results found</div>
          )}
        </div>
      )}
    </div>
  );
}
function ClientPayments() {
  const [searchParams] = useSearchParams();
  const initialClient = searchParams.get('client');
  const generate = searchParams.get('generate');

  const [payments, setPayments] = useState(() => {
    let initialData = [
      { id: 1, idealDate: '2026-01-01', client: 'Comprehensive Wellness', invoiceDate: '2026-01-01', invoiceNumber: 'INV-001', dueDate: '2026-01-15', amount: 100, status: 'Received', createdOn: '2026-01-01', updatedOn: '2026-01-16' },
      { id: 2, idealDate: '2026-02-01', client: 'Comprehensive Wellness', invoiceDate: '2026-02-01', invoiceNumber: 'INV-002', dueDate: '2026-02-15', amount: 100, status: 'Received', createdOn: '2026-02-01', updatedOn: '2026-02-16' },
      { id: 3, idealDate: '2026-03-01', client: 'Comprehensive Wellness', invoiceDate: '2026-03-01', invoiceNumber: 'INV-003', dueDate: '2026-03-15', amount: 100, status: 'Received', createdOn: '2026-03-01', updatedOn: '2026-03-16' },
      { id: 4, idealDate: '2026-04-01', client: 'Comprehensive Wellness', invoiceDate: '2026-04-01', invoiceNumber: 'INV-004', dueDate: '2026-04-15', amount: 100, status: 'Received', createdOn: '2026-04-01', updatedOn: '2026-04-16' },
      { id: 5, idealDate: '2026-05-01', client: 'Comprehensive Wellness', invoiceDate: '2026-05-01', invoiceNumber: 'INV-005', dueDate: '2026-05-15', amount: 100, status: 'Overdue', createdOn: '2026-05-01', updatedOn: '2026-05-01' },
      { id: 6, idealDate: '2026-06-01', client: 'Comprehensive Wellness', invoiceDate: '2026-06-01', invoiceNumber: 'INV-006', dueDate: '2026-06-15', amount: 100, status: 'Due', createdOn: '2026-06-01', updatedOn: '2026-06-01' },
      { id: 7, idealDate: '2026-07-01', client: 'Comprehensive Wellness', invoiceDate: '-', invoiceNumber: '-', dueDate: '-', amount: 100, status: 'To be Raised', createdOn: '-', updatedOn: '-' },
      { id: 8, idealDate: '2026-08-01', client: 'Comprehensive Wellness', invoiceDate: '-', invoiceNumber: '-', dueDate: '-', amount: 100, status: 'To be Raised', createdOn: '-', updatedOn: '-' },
      { id: 9, idealDate: '2026-09-01', client: 'Comprehensive Wellness', invoiceDate: '-', invoiceNumber: '-', dueDate: '-', amount: 100, status: 'To be Raised', createdOn: '-', updatedOn: '-' },
      { id: 10, idealDate: '2026-10-01', client: 'Comprehensive Wellness', invoiceDate: '-', invoiceNumber: '-', dueDate: '-', amount: 100, status: 'To be Raised', createdOn: '-', updatedOn: '-' },

      { id: 11, idealDate: '2026-01-01', client: 'Text Client', invoiceDate: '2026-01-01', invoiceNumber: 'INV-T01', dueDate: '2026-01-15', amount: 500, status: 'Received', createdOn: '2026-01-01', updatedOn: '2026-01-16' },
      { id: 12, idealDate: '2026-02-01', client: 'Text Client', invoiceDate: '2026-02-01', invoiceNumber: 'INV-T02', dueDate: '2026-02-15', amount: 500, status: 'Received', createdOn: '2026-02-01', updatedOn: '2026-02-16' },
      { id: 13, idealDate: '2026-03-01', client: 'Text Client', invoiceDate: '2026-03-01', invoiceNumber: 'INV-T03', dueDate: '2026-03-15', amount: 500, status: 'Received', createdOn: '2026-03-01', updatedOn: '2026-03-16' },
      { id: 14, idealDate: '2026-04-01', client: 'Text Client', invoiceDate: '2026-04-01', invoiceNumber: 'INV-T04', dueDate: '2026-04-15', amount: 500, status: 'Due', createdOn: '2026-04-01', updatedOn: '2026-04-01' },
      { id: 15, idealDate: '2026-05-01', client: 'Text Client', invoiceDate: '-', invoiceNumber: '-', dueDate: '-', amount: 500, status: 'To be Raised', createdOn: '-', updatedOn: '-' },
      { id: 16, idealDate: '2026-06-01', client: 'Text Client', invoiceDate: '-', invoiceNumber: '-', dueDate: '-', amount: 500, status: 'To be Raised', createdOn: '-', updatedOn: '-' },
      { id: 17, idealDate: '2026-07-01', client: 'Text Client', invoiceDate: '-', invoiceNumber: '-', dueDate: '-', amount: 500, status: 'To be Raised', createdOn: '-', updatedOn: '-' },
      { id: 18, idealDate: '2026-08-01', client: 'Text Client', invoiceDate: '-', invoiceNumber: '-', dueDate: '-', amount: 500, status: 'To be Raised', createdOn: '-', updatedOn: '-' },
      { id: 19, idealDate: '2026-09-01', client: 'Text Client', invoiceDate: '-', invoiceNumber: '-', dueDate: '-', amount: 500, status: 'To be Raised', createdOn: '-', updatedOn: '-' },
      { id: 20, idealDate: '2026-10-01', client: 'Text Client', invoiceDate: '-', invoiceNumber: '-', dueDate: '-', amount: 500, status: 'To be Raised', createdOn: '-', updatedOn: '-' },

      { id: 21, idealDate: '2026-01-01', client: 'Yearly Client', invoiceDate: '2026-01-01', invoiceNumber: 'INV-Y01', dueDate: '2026-01-15', amount: 12000, status: 'Received', createdOn: '2026-01-01', updatedOn: '2026-01-16' },
      { id: 22, idealDate: '2026-01-01', client: 'Quarterly Client', invoiceDate: '2026-01-01', invoiceNumber: 'INV-Q01', dueDate: '2026-01-15', amount: 3000, status: 'Received', createdOn: '2026-01-01', updatedOn: '2026-01-16' },
      { id: 23, idealDate: '2026-01-01', client: 'Halfyearly Client', invoiceDate: '2026-01-01', invoiceNumber: 'INV-H01', dueDate: '2026-01-15', amount: 6000, status: 'Received', createdOn: '2026-01-01', updatedOn: '2026-01-16' },
    ];

    if (generate === 'true') {
      const start = searchParams.get('start');
      const freqStr = searchParams.get('freq');
      const termStr = searchParams.get('term');
      const payTerm = searchParams.get('payTerm');
      const totalAmount = parseFloat(searchParams.get('amount')) || 1000;
      
      let freqMonths = 1;
      if (freqStr === 'Quarterly') freqMonths = 3;
      if (freqStr === 'Half Yearly') freqMonths = 6;
      if (freqStr === 'Yearly') freqMonths = 12;

      const term = parseInt(termStr, 10) || 12;
      const numInvoices = Math.floor(term / freqMonths);
      const amountPerInvoice = numInvoices > 0 ? totalAmount / numInvoices : totalAmount;

      const generated = [];
      const startDate = new Date(start);
      
      if (!isNaN(startDate.getTime())) {
        for (let i = 0; i < numInvoices; i++) {
          const d = new Date(startDate);
          d.setMonth(d.getMonth() + (i * freqMonths));
          
          const idealDate = d.toISOString().split('T')[0];
          
          generated.push({
            id: 1000 + i,
            idealDate: idealDate,
            client: initialClient || 'Test Billing',
            invoiceDate: '-',
            invoiceNumber: '-',
            dueDate: '-',
            amount: amountPerInvoice,
            status: 'To be Raised',
            createdOn: '-',
            updatedOn: '-'
          });
        }
        initialData = [...generated, ...initialData];
      }
    }
    return initialData;
  });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter Fields State
  const [selectedClients, setSelectedClients] = useState(initialClient ? [initialClient] : []);
  const [invoiceDateRange, setInvoiceDateRange] = useState('All');
  const [customInvoiceStart, setCustomInvoiceStart] = useState('');
  const [customInvoiceEnd, setCustomInvoiceEnd] = useState('');
  
  const [dueDateRange, setDueDateRange] = useState('All');
  const [customDueStart, setCustomDueStart] = useState('');
  const [customDueEnd, setCustomDueEnd] = useState('');
  
  const [invoiceStatus, setInvoiceStatus] = useState('All');

  // Unique clients for the dropdown
  const uniqueClients = [...new Set(payments.map(p => p.client))];

  // Popup State
  const [activeUploadId, setActiveUploadId] = useState(null);
  const [activePaymentId, setActivePaymentId] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Filtering Logic
  const filteredPayments = payments.filter(p => {
    // 1. Search Query (Client Name, Invoice Number, Invoice Date)
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      p.client.toLowerCase().includes(query) || 
      p.invoiceNumber.toLowerCase().includes(query) || 
      p.invoiceDate.toLowerCase().includes(query);
    
    // 2. Client Filter
    const matchesClient = selectedClients.length === 0 || selectedClients.includes(p.client);
    
    // 3. Status Filter
    const matchesStatus = invoiceStatus === 'All' || p.status === invoiceStatus;

    // Date Setup
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // 4. Invoice Date Filter
    let matchesInvoiceDate = true;
    if (invoiceDateRange !== 'All') {
      if (p.invoiceDate === '-') {
        matchesInvoiceDate = false;
      } else {
        const invDate = new Date(p.invoiceDate);
        invDate.setHours(0, 0, 0, 0);
        if (invoiceDateRange === 'Today') {
          matchesInvoiceDate = invDate.getTime() === today.getTime();
        } else if (invoiceDateRange === '7days') {
          matchesInvoiceDate = invDate >= sevenDaysAgo && invDate <= today;
        } else if (invoiceDateRange === 'Custom') {
          const start = customInvoiceStart ? new Date(customInvoiceStart) : new Date('1900-01-01');
          const end = customInvoiceEnd ? new Date(customInvoiceEnd) : new Date('2100-01-01');
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          matchesInvoiceDate = invDate >= start && invDate <= end;
        }
      }
    }

    // 5. Due Date Filter
    let matchesDueDate = true;
    if (dueDateRange !== 'All') {
      if (p.dueDate === '-') {
        matchesDueDate = false;
      } else {
        const dDate = new Date(p.dueDate);
        dDate.setHours(0, 0, 0, 0);
        if (dueDateRange === 'Today') {
          matchesDueDate = dDate.getTime() === today.getTime();
        } else if (dueDateRange === '7days') {
          matchesDueDate = dDate >= sevenDaysAgo && dDate <= today;
        } else if (dueDateRange === 'Custom') {
          const start = customDueStart ? new Date(customDueStart) : new Date('1900-01-01');
          const end = customDueEnd ? new Date(customDueEnd) : new Date('2100-01-01');
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          matchesDueDate = dDate >= start && dDate <= end;
        }
      }
    }

    return matchesSearch && matchesClient && matchesStatus && matchesInvoiceDate && matchesDueDate;
  });

  // Pagination Logic
  const totalItems = filteredPayments.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + rowsPerPage);

  const totalBilled = filteredPayments.filter(p => p.status !== 'To be Raised').reduce((sum, p) => sum + p.amount, 0);
  const totalReceived = filteredPayments.filter(p => p.status === 'Received').reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = filteredPayments.filter(p => p.status === 'Overdue').reduce((sum, p) => sum + p.amount, 0);
  const toBeBilled = filteredPayments.filter(p => p.status === 'To be Raised').reduce((sum, p) => sum + p.amount, 0);

  const renderStatus = (status) => {
    switch (status) {
      case 'Received': return <span className="status-pill status-approved"><i className='bx bx-check-circle'></i> Received</span>;
      case 'Overdue': return <span className="status-pill status-tentative" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)' }}><i className='bx bx-error-circle'></i> Overdue</span>;
      case 'Due': return <span className="status-pill status-tentative"><i className='bx bx-time'></i> Due</span>;
      case 'To be Raised': return <span className="status-pill" style={{ background: 'rgba(148, 163, 184, 0.1)', color: 'var(--gray)' }}><i className='bx bx-file'></i> To be Raised</span>;
      default: return null;
    }
  };

  return (
    <main className="main-content" style={{ paddingTop: '1rem' }}>
      <div className="page-header" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, maxWidth: '500px' }}>
          <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Accounts Receivable</h1>
          
          <div className="table-toolbar" style={{ margin: 0 }}>
            <div className="search-input-wrapper">
              <i className='bx bx-search'></i>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search Party name, Invoice..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="filter-btn" onClick={() => setIsFilterOpen(true)}>
              <i className='bx bx-filter-alt'></i> Filters
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem', background: '#fff', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Billed</span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--blue)' }}>${totalBilled.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Received</span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--green)' }}>${totalReceived.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Overdue</span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--red)' }}>${totalOverdue.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>To be Billed</span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>${toBeBilled.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>IDEAL DATE</th>
              <th>CLIENT NAME</th>
              <th>INVOICE DATE</th>
              <th>INVOICE NUMBER</th>
              <th>DUE DATE</th>
              <th>AMOUNT</th>
              <th>PAYMENT RECEIVED</th>
              <th>PAYMENT DATE</th>
              <th>PAYMENT STATUS</th>
              <th>CREATED ON</th>
              <th>UPDATED ON</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPayments.map((p) => (
              <tr key={p.id}>
                <td>{p.idealDate}</td>
                <td className="event-name">{p.client}</td>
                <td>{p.invoiceDate}</td>
                <td>
                  <strong>
                    {p.invoiceNumber !== '-' ? (
                      <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }} title="View Invoice">{p.invoiceNumber}</a>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </strong>
                </td>
                <td>{p.dueDate}</td>
                <td>${p.amount.toFixed(2)}</td>
                <td><strong className="text-green">${p.status === 'Received' ? p.amount.toFixed(2) : '0.00'}</strong></td>
                <td>{p.status === 'Received' ? p.updatedOn : '-'}</td>
                <td>{renderStatus(p.status)}</td>
                <td>{p.createdOn}</td>
                <td>{p.updatedOn}</td>
                <td className="actions">
                  <button className="action-btn edit" title="Edit">
                    <i className='bx bx-pencil'></i>
                  </button>
                  <button className="action-btn text-blue" title="Upload Invoice" style={{ border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.25rem 0.5rem', background: '#fff', cursor: 'pointer' }} onClick={() => setActiveUploadId(p.id)}>
                    <i className='bx bxs-file-pdf'></i>
                  </button>
                  <button className="action-btn text-green" title="Update Payment" style={{ border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.25rem 0.5rem', background: '#fff', cursor: 'pointer' }} onClick={() => setActivePaymentId(p.id)}>
                    <i className='bx bx-money'></i>
                  </button>
                </td>
              </tr>
            ))}
            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan="12" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No records found matching your criteria.</td>
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

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="modal-overlay" onClick={() => setIsFilterOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Filters</h2>
              <button className="close-btn" onClick={() => setIsFilterOpen(false)}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Client Name</label>
                <MultiSelectDropdown 
                  options={uniqueClients} 
                  selected={selectedClients} 
                  onChange={setSelectedClients} 
                  placeholder="Select clients..." 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Invoice Date Range</label>
                <select className="form-control" value={invoiceDateRange} onChange={(e) => setInvoiceDateRange(e.target.value)}>
                  <option value="All">All Time</option>
                  <option value="Today">Today</option>
                  <option value="7days">Last 7 days</option>
                  <option value="Custom">Custom Range</option>
                </select>
                {invoiceDateRange === 'Custom' && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <input type="date" className="form-control" value={customInvoiceStart} onChange={e => setCustomInvoiceStart(e.target.value)} />
                    <input type="date" className="form-control" value={customInvoiceEnd} onChange={e => setCustomInvoiceEnd(e.target.value)} />
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Due Date Range</label>
                <select className="form-control" value={dueDateRange} onChange={(e) => setDueDateRange(e.target.value)}>
                  <option value="All">All Time</option>
                  <option value="Today">Today</option>
                  <option value="7days">Last 7 days</option>
                  <option value="Custom">Custom Range</option>
                </select>
                {dueDateRange === 'Custom' && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <input type="date" className="form-control" value={customDueStart} onChange={e => setCustomDueStart(e.target.value)} />
                    <input type="date" className="form-control" value={customDueEnd} onChange={e => setCustomDueEnd(e.target.value)} />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Invoice Status</label>
                <select className="form-control" value={invoiceStatus} onChange={(e) => setInvoiceStatus(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Received">Received</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Due">Due</option>
                  <option value="To be Raised">To be Raised</option>
                </select>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                className="btn-outline" 
                onClick={() => {
                  setSelectedClients([]);
                  setInvoiceDateRange('All');
                  setDueDateRange('All');
                  setInvoiceStatus('All');
                  setSearchQuery('');
                }}
              >
                Clear All
              </button>
              <button className="btn-primary" onClick={() => setIsFilterOpen(false)}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Invoice Modal */}
      {activeUploadId !== null && (
        <div className="modal-overlay" onClick={() => setActiveUploadId(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Upload Invoice</h2>
              <button className="close-btn" onClick={() => setActiveUploadId(null)}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Invoice Number</label>
                <input type="text" className="form-control" placeholder="e.g. INV-1234" />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Invoice Date</label>
                <input type="date" className="form-control" />
              </div>
              <div className="form-group">
                <label>Invoice Document (PDF)</label>
                <input type="file" className="form-control" accept=".pdf" style={{ padding: '0.5rem' }} />
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn-outline" onClick={() => setActiveUploadId(null)}>Cancel</button>
              <button className="btn-primary" onClick={() => setActiveUploadId(null)}>Upload</button>
            </div>
          </div>
        </div>
      )}

      {/* Update Payment Modal */}
      {activePaymentId !== null && (
        <div className="modal-overlay" onClick={() => setActivePaymentId(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Update Payment</h2>
              <button className="close-btn" onClick={() => setActivePaymentId(null)}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Payment Status</label>
                <select className="form-control">
                  <option value="Received">Received</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Due">Due</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Amount Received</label>
                <div style={{ position: 'relative' }}>
                  <i className='bx bx-dollar' style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                  <input type="number" className="form-control" style={{ paddingLeft: '2.5rem' }} placeholder="0.00" />
                </div>
              </div>
              <div className="form-group">
                <label>Payment Date</label>
                <input type="date" className="form-control" />
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn-outline" onClick={() => setActivePaymentId(null)}>Cancel</button>
              <button className="btn-primary" onClick={() => {
                setPayments(payments.map(p => {
                  if (p.id === activePaymentId) {
                    return { ...p, status: 'Received' };
                  }
                  return p;
                }));
                setActivePaymentId(null);
              }}>Save Payment</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ClientPayments;
