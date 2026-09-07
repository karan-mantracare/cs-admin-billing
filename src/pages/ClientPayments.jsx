import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AddScheduleModal from '../components/AddScheduleModal';

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

  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [addModalMode, setAddModalMode] = useState('schedule');
  
  // Generating mock data matching the new 14-column layout
  const [payments, setPayments] = useState(() => {
    try {
      const saved = localStorage.getItem('client_payments');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse client_payments from localStorage", e);
      return [];
    }
  });

  const [paymentRecords, setPaymentRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('client_payment_records');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('client_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('client_payment_records', JSON.stringify(paymentRecords));
  }, [paymentRecords]);

  // Tabs
  const [activeTab, setActiveTab] = useState('billing');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedClients, setSelectedClients] = useState(initialClient ? [initialClient] : []);
  
  // Unique clients for the dropdown
  const uniqueClients = [...new Set(payments.map(p => p.clientName))];

  // Popup State
  const [activeUploadId, setActiveUploadId] = useState(null);
  const [activePaymentId, setActivePaymentId] = useState(null);
  
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    invoiceDate: '',
    invoiceFile: null
  });

  // Add Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    paymentDate: '',
    amount: '',
    isChangeCurrency: false,
    changedCurrency: 'USD',
    exchangedAmount: '',
    receivedBank: ''
  });
  const [showPastPayments, setShowPastPayments] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Filtering Logic
  const filteredPayments = payments.filter(p => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      p.clientName.toLowerCase().includes(query) || 
      p.orderId.toLowerCase().includes(query) ||
      p.billingCompany.toLowerCase().includes(query);
    
    const matchesClient = selectedClients.length === 0 || selectedClients.includes(p.clientName);
    
    return matchesSearch && matchesClient;
  });

  // Pagination Logic
  const totalItems = filteredPayments.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + rowsPerPage);

  const totalBilled = filteredPayments.filter(p => p.status !== 'To be Raised').reduce((sum, p) => sum + p.amountDueUsd, 0);
  const totalReceived = filteredPayments.reduce((sum, p) => sum + p.totalPaid, 0);
  const totalOverdue = filteredPayments.filter(p => p.overdueDays > 0).reduce((sum, p) => sum + p.dueAmount, 0);
  const toBeBilled = filteredPayments.filter(p => p.status === 'To be Raised').reduce((sum, p) => sum + p.amountDueUsd, 0);

  return (
    <main className="main-content" style={{ paddingTop: '1rem', overflowX: 'hidden' }}>
      <div className="page-header" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, maxWidth: '500px' }}>
          <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Accounts Receivable</h1>
          
          <div className="table-toolbar" style={{ margin: 0 }}>
            <div className="search-input-wrapper">
              <i className='bx bx-search'></i>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search Client, Order ID..." 
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

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #cbd5e1', marginBottom: '1.5rem' }}>
        <button 
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'billing' ? '2px solid #0ea5e9' : '2px solid transparent',
            color: activeTab === 'billing' ? '#0ea5e9' : '#64748b',
            fontWeight: activeTab === 'billing' ? '600' : '500',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab('billing')}
        >
          Billing and Payment
        </button>
        <button 
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'records' ? '2px solid #0ea5e9' : '2px solid transparent',
            color: activeTab === 'records' ? '#0ea5e9' : '#64748b',
            fontWeight: activeTab === 'records' ? '600' : '500',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab('records')}
        >
          Payment Records
        </button>
      </div>

      {activeTab === 'billing' ? (
      <div className="table-container" style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ minWidth: '1600px' }}>
          <thead>
            <tr>
              <th>CLIENT NAME</th>
              <th>ORDER ID</th>
              <th>BILLING COMPANY</th>
              <th>AMOUNT DUE $</th>
              <th>AMOUNT DUE</th>
              <th>CURRENCY</th>
              <th>INVOICE BY DATE</th>
              <th>DUE BY DATE</th>
              <th>INVOICE DATE</th>
              <th>INVOICE LINK</th>
              <th>TOTAL PAID $</th>
              <th>DUE (AMOUNT)</th>
              <th>OVERDUE DAYS</th>
              <th style={{ minWidth: '140px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPayments.map((p) => (
              <tr key={p.id}>
                <td className="event-name">{p.clientName}</td>
                <td><strong>{p.orderId}</strong></td>
                <td><span style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '500' }}>{p.billingCompany}</span></td>
                <td><strong className="text-blue">${p.amountDueUsd.toLocaleString()}</strong></td>
                <td>{p.amountDue.toLocaleString()}</td>
                <td>{p.currency}</td>
                <td>{p.invoiceByDate}</td>
                <td>{p.dueByDate}</td>
                <td>{p.invoiceDate}</td>
                <td>
                  {p.invoiceLink ? (
                    <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <i className='bx bxs-file-pdf'></i> {p.invoiceLink}
                    </a>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td><strong className="text-green">${p.totalPaid.toLocaleString()}</strong></td>
                <td>
                  <span style={{ color: p.dueAmount > 0 ? 'var(--red)' : 'var(--text-main)', fontWeight: p.dueAmount > 0 ? '600' : '400' }}>
                    ${p.dueAmount.toLocaleString()}
                  </span>
                </td>
                <td>
                  {p.overdueDays > 0 ? (
                    <span style={{ background: '#fee2e2', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}>
                      {p.overdueDays} Days
                    </span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td className="actions" style={{ gap: '0.25rem' }}>
                  <button className="action-btn edit" title="Edit">
                    <i className='bx bx-pencil'></i>
                  </button>
                  <button className="action-btn text-green" title="+ Payment" style={{ border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.25rem 0.5rem', background: '#fff', cursor: 'pointer' }} onClick={() => setActivePaymentId(p.id)}>
                    <i className='bx bx-money'></i>
                  </button>
                  <button className="action-btn text-blue" title="+ Invoice" style={{ border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.25rem 0.5rem', background: '#fff', cursor: 'pointer' }} onClick={() => setActiveUploadId(p.id)}>
                    <i className='bx bx-file-blank'></i>
                  </button>
                </td>
              </tr>
            ))}
            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan="14" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No records found matching your criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* ADD ROW & ADD SCHEDULE BUTTONS */}
        <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#fff', borderTop: '1px solid var(--border-color)' }}>
          <button 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', color: '#0ea5e9', border: '1px dashed #0ea5e9', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
            onClick={() => { setAddModalMode('row'); setIsAddScheduleOpen(true); }}
          >
            <i className='bx bx-plus'></i> Add Row
          </button>
          
          <button 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0ea5e9', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
            onClick={() => { setAddModalMode('schedule'); setIsAddScheduleOpen(true); }}
          >
            <i className='bx bx-calendar-plus'></i> Add Schedule
          </button>
        </div>

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
                disabled={currentPage === totalPages || totalPages === 0} 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      ) : (
      <div className="table-container" style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ minWidth: '1200px' }}>
          <thead>
            <tr>
              <th>ENTRY DATE</th>
              <th>PAYMENT DATE</th>
              <th>RECEIVED BANK</th>
              <th>INVOICE NUMBER</th>
              <th>ORDER ID</th>
              <th>BILLING & PAYMENT ID</th>
              <th>AMOUNT</th>
              <th>CURRENCY</th>
              <th>AMOUNT IN USD</th>
            </tr>
          </thead>
          <tbody>
            {paymentRecords.map((r, i) => (
              <tr key={i}>
                <td>{r.entryDate}</td>
                <td>{r.paymentDate}</td>
                <td>{r.receivedBank || '-'}</td>
                <td><span style={{ color: '#0ea5e9', fontWeight: '500' }}>{r.invoiceNumber}</span></td>
                <td><strong>{r.orderId}</strong></td>
                <td><span style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>{r.paymentId}</span></td>
                <td><strong>{r.amount.toLocaleString()}</strong></td>
                <td>{r.currency}</td>
                <td><strong className="text-green">${r.amountInUSD.toLocaleString()}</strong></td>
              </tr>
            ))}
            {paymentRecords.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No payment records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* Filter Right Sidebar */}

      <AddScheduleModal 
        isOpen={isAddScheduleOpen}
        onClose={() => setIsAddScheduleOpen(false)}
        onSave={(data) => {
          console.log("Adding schedule for:", data);
          alert(`Schedule added for ${data.clientName}, Order: ${data.orderName}`);
        }}
      />

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
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                className="btn-outline" 
                onClick={() => {
                  setSelectedClients([]);
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
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }} onClick={() => setActiveUploadId(null)}>
          <div style={{
            background: 'white', borderRadius: '8px', width: '90%', maxWidth: '400px',
            padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Upload Invoice</h2>
              <button onClick={() => { setActiveUploadId(null); setInvoiceForm({ invoiceNumber: '', invoiceDate: '', invoiceFile: null }); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>
                &times;
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Invoice Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. INV-2024-001" 
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', boxSizing: 'border-box' }} 
                  value={invoiceForm.invoiceNumber}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Invoice Date</label>
                <input 
                  type="date" 
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', boxSizing: 'border-box' }} 
                  value={invoiceForm.invoiceDate}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoiceDate: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Invoice Document (PDF)</label>
                <input 
                  type="file" 
                  accept=".pdf" 
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px dashed #cbd5e1', background: '#f8fafc', fontSize: '0.9rem', color: '#475569', boxSizing: 'border-box' }} 
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoiceFile: e.target.files[0] }))}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button style={{ padding: '0.5rem 1rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }} onClick={() => { setActiveUploadId(null); setInvoiceForm({ invoiceNumber: '', invoiceDate: '', invoiceFile: null }); }}>Cancel</button>
              <button style={{ padding: '0.5rem 1rem', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }} onClick={() => {
                if (!invoiceForm.invoiceNumber || !invoiceForm.invoiceDate) {
                  alert("Please provide an invoice number and date.");
                  return;
                }
                setPayments(prev => prev.map(p => {
                  if (p.id === activeUploadId) {
                    return { ...p, invoiceDate: invoiceForm.invoiceDate, invoiceLink: invoiceForm.invoiceNumber, status: p.status === 'To be Raised' ? 'Pending' : p.status };
                  }
                  return p;
                }));
                setActiveUploadId(null);
                setInvoiceForm({ invoiceNumber: '', invoiceDate: '', invoiceFile: null });
              }}>Upload</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {activePaymentId !== null && (() => {
        const targetRow = payments.find(p => p.id === activePaymentId);
        if (!targetRow) return null;
        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
          }} onClick={() => setActivePaymentId(null)}>
            <div style={{
              background: 'white', borderRadius: '8px', width: '90%', maxWidth: '400px',
              padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{editingRecordId ? 'Edit Payment' : 'Add Payment'}</h2>
              <button onClick={() => { setActivePaymentId(null); setPaymentForm({ paymentDate: '', amount: '', isChangeCurrency: false, changedCurrency: 'USD', exchangedAmount: '', receivedBank: '' }); setEditingRecordId(null); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>
                &times;
              </button>
            </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Payment Date</label>
                  <input 
                    type="date" 
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', boxSizing: 'border-box' }} 
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Received Bank</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Chase Bank"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', boxSizing: 'border-box' }} 
                    value={paymentForm.receivedBank}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, receivedBank: e.target.value }))}
                  />
                </div>
                
                {!paymentForm.isChangeCurrency ? (
                  <>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Amount ({targetRow.currency})</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 1500" 
                        style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', boxSizing: 'border-box' }} 
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                    {paymentForm.amount && !isNaN(Number(paymentForm.amount)) && (
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Amount (USD)</label>
                        <div style={{ padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.9rem', color: '#0f172a', boxSizing: 'border-box', fontWeight: '500' }}>
                          ${(Number(paymentForm.amount) * (targetRow.amountDueUsd / targetRow.amountDue) || Number(paymentForm.amount)).toFixed(2)}
                        </div>
                      </div>
                    )}
                    <div style={{ textAlign: 'left' }}>
                      <button style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', padding: 0 }} onClick={() => setPaymentForm(prev => ({ ...prev, isChangeCurrency: true }))}>Change Currency</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Amount</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 1500" 
                        style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', boxSizing: 'border-box' }} 
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Currency</label>
                      <select 
                        style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', boxSizing: 'border-box' }} 
                        value={paymentForm.changedCurrency}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, changedCurrency: e.target.value }))}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Exchanged (to {targetRow.currency})</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 1350" 
                        style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', boxSizing: 'border-box' }} 
                        value={paymentForm.exchangedAmount}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, exchangedAmount: e.target.value }))}
                      />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', padding: 0 }} onClick={() => setPaymentForm(prev => ({ ...prev, isChangeCurrency: false }))}>Cancel Change</button>
                    </div>
                  </>
                )}
              </div>

              {(() => {
                const pastPayments = paymentRecords.filter(r => r.paymentId === activePaymentId);
                if (pastPayments.length === 0) return null;
                return (
                  <div style={{ marginBottom: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                    <div 
                      style={{ fontSize: '0.9rem', color: '#0ea5e9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500' }}
                      onClick={() => setShowPastPayments(!showPastPayments)}
                    >
                      <i className={`bx bx-chevron-${showPastPayments ? 'up' : 'down'}`}></i> View other payment
                    </div>
                    {showPastPayments && (
                      <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', padding: '0.5rem', background: '#e2e8f0', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569' }}>
                          <span>DATE</span>
                          <span>AMOUNT</span>
                          <span>CURRENCY</span>
                          <span style={{ textAlign: 'right' }}>ACTION</span>
                        </div>
                        {pastPayments.map((pp, idx) => (
                          <div key={pp.id || idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', padding: '0.5rem', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.85rem', alignItems: 'center' }}>
                            <span style={{ color: '#475569' }}>{pp.paymentDate}</span>
                            <strong style={{ color: '#0f172a' }}>{pp.amount.toLocaleString()}</strong>
                            <span style={{ color: '#475569' }}>{pp.currency}</span>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginLeft: '1rem' }}>
                              <i className='bx bx-edit' style={{ cursor: 'pointer', color: '#0ea5e9', fontSize: '1.1rem' }} onClick={() => {
                                setEditingRecordId(pp.id);
                                setPaymentForm({
                                  paymentDate: pp.paymentDate,
                                  amount: pp.amount,
                                  isChangeCurrency: pp.currency !== targetRow.currency,
                                  changedCurrency: pp.currency,
                                  exchangedAmount: pp.baseDeductAmount || pp.amount
                                });
                              }}></i>
                              <i className='bx bx-trash' style={{ cursor: 'pointer', color: '#ef4444', fontSize: '1.1rem' }} onClick={() => {
                                if (window.confirm("Are you sure you want to delete this payment record?")) {
                                  const deductAmtUsd = pp.amountInUSD || 0;
                                  setPaymentRecords(prev => prev.filter(r => r.id !== pp.id));
                                  setPayments(prev => prev.map(p => {
                                    if (p.id === activePaymentId) {
                                      const newTotalPaid = Math.max(0, p.totalPaid - deductAmtUsd);
                                      const newDue = p.amountDueUsd - newTotalPaid;
                                      return { ...p, totalPaid: newTotalPaid, dueAmount: newDue, status: newDue <= 0 ? 'Received' : 'Partial' };
                                    }
                                    return p;
                                  }));
                                }
                              }}></i>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button style={{ padding: '0.5rem 1rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }} onClick={() => { setActivePaymentId(null); setPaymentForm({ paymentDate: '', amount: '', isChangeCurrency: false, changedCurrency: 'USD', exchangedAmount: '' }); setShowPastPayments(false); setEditingRecordId(null); }}>Cancel</button>
                <button style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }} onClick={() => {
                  const amountVal = Number(paymentForm.amount);
                  const baseDeductAmount = paymentForm.isChangeCurrency ? Number(paymentForm.exchangedAmount) : amountVal;

                  if (!paymentForm.paymentDate || !amountVal || (paymentForm.isChangeCurrency && !baseDeductAmount)) {
                    alert("Please provide valid date and amount inputs.");
                    return;
                  }
                  
                  // Simple exchange logic based on row data to derive USD amount
                  const exchangeRate = targetRow.amountDueUsd / targetRow.amountDue;
                  const amountInUSD = isNaN(exchangeRate) ? baseDeductAmount : (baseDeductAmount * exchangeRate);
                  
                  const isEditing = editingRecordId != null;
                  const oldRecord = isEditing ? paymentRecords.find(r => r.id === editingRecordId) : null;
                  const oldDeductAmountUsd = oldRecord ? (oldRecord.amountInUSD || 0) : 0;

                  // Add record
                  const newRecord = {
                    id: isEditing ? editingRecordId : Math.random().toString(36).substring(2, 9),
                    entryDate: isEditing ? oldRecord.entryDate : new Date().toISOString().split('T')[0],
                    paymentDate: paymentForm.paymentDate,
                    invoiceNumber: targetRow.invoiceLink || 'N/A',
                    orderId: targetRow.orderId,
                    paymentId: targetRow.id,
                    amount: amountVal,
                    currency: paymentForm.isChangeCurrency ? paymentForm.changedCurrency : targetRow.currency,
                    receivedBank: paymentForm.receivedBank || '-',
                    baseDeductAmount: baseDeductAmount,
                    amountInUSD: Number(amountInUSD.toFixed(2))
                  };
                  
                  if (isEditing) {
                    setPaymentRecords(prev => prev.map(r => r.id === editingRecordId ? newRecord : r));
                  } else {
                    setPaymentRecords(prev => [...prev, newRecord]);
                  }

                  // Update Row
                  setPayments(prev => prev.map(p => {
                    if (p.id === activePaymentId) {
                      const newTotalPaid = p.totalPaid - oldDeductAmountUsd + Number(amountInUSD.toFixed(2));
                      const newDue = Math.max(0, p.amountDueUsd - newTotalPaid);
                      
                      let newOverdueDays = p.overdueDays;
                      if (paymentForm.paymentDate && p.dueByDate) {
                        const payDate = new Date(paymentForm.paymentDate);
                        const dueDate = new Date(p.dueByDate);
                        if (!isNaN(payDate) && !isNaN(dueDate) && payDate > dueDate) {
                          const diffTime = payDate - dueDate;
                          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                          if (diffDays > newOverdueDays) {
                            newOverdueDays = diffDays;
                          }
                        }
                      }

                      return { 
                        ...p, 
                        totalPaid: newTotalPaid,
                        dueAmount: newDue,
                        overdueDays: newOverdueDays,
                        status: newDue <= 0 ? 'Received' : 'Partial'
                      };
                    }
                    return p;
                  }));
                  
                  alert(isEditing ? 'Payment successfully updated!' : 'Payment successfully recorded!');
                  setActivePaymentId(null);
                  setPaymentForm({ paymentDate: '', amount: '', isChangeCurrency: false, changedCurrency: 'USD', exchangedAmount: '', receivedBank: '' });
                  setShowPastPayments(false);
                  setEditingRecordId(null);
                }}>{editingRecordId ? 'Update' : 'Save'}</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add Schedule Modal */}
      <AddScheduleModal 
        isOpen={isAddScheduleOpen} 
        onClose={() => setIsAddScheduleOpen(false)} 
        mode={addModalMode}
        onSave={({ formData, selectedOrder, mode }) => {
          if (!selectedOrder) return;
          const isRowMode = mode === 'row';
          const terms = isRowMode ? 1 : (Number(formData.paymentTerms) || 1);
          const contractValue = Number(selectedOrder.billingDetails?.contractValue) || 0;
          const contractValueUsd = Number(selectedOrder.billingDetails?.amountInUSD) || 0;
          
          let duePerTerm = 0;
          let duePerTermUsd = 0;

          if (isRowMode) {
            duePerTerm = Number(formData.amount) || 0;
            const exchangeRate = contractValue > 0 ? (contractValueUsd / contractValue) : 1;
            duePerTermUsd = duePerTerm * exchangeRate;
          } else {
            duePerTerm = contractValue / terms;
            duePerTermUsd = contractValueUsd / terms;
          }
          const currency = selectedOrder.billingDetails?.clientCurrency || 'USD';
          const billingCompany = selectedOrder.billingDetails?.billFrom || 'N/A';
          const paymentDueDays = Number(selectedOrder.billingDetails?.paymentDueDays) || 30;

          // Generate rows
          const newRows = [];
          for (let i = 0; i < terms; i++) {
            // For invoice by date, assume starting next month 1st? The user said "1st of each month"
            // We'll calculate it from planStart if available, or just from current date + i months
            const baseDate = selectedOrder.planStart ? new Date(selectedOrder.planStart) : new Date();
            baseDate.setMonth(baseDate.getMonth() + i);
            baseDate.setDate(1);
            
            const invoiceByDateStr = baseDate.toISOString().split('T')[0];
            
            // Due by date = Invoice Date + paymentDueDays
            const dueDate = new Date(baseDate);
            dueDate.setDate(dueDate.getDate() + paymentDueDays);
            const dueByDateStr = dueDate.toISOString().split('T')[0];

            newRows.push({
              id: Date.now() + i, // Unique ID
              clientName: formData.corporate,
              orderId: selectedOrder.id.toString(),
              billingCompany: billingCompany,
              amountDueUsd: duePerTermUsd,
              amountDue: duePerTerm,
              currency: currency,
              invoiceByDate: invoiceByDateStr,
              dueByDate: dueByDateStr,
              invoiceDate: '-',
              invoiceLink: '',
              totalPaid: 0,
              dueAmount: duePerTermUsd,
              overdueDays: 0,
              status: 'To be Raised'
            });
          }

          setPayments(prev => [...prev, ...newRows]);
        }} 
      />

    </main>
  );
}

export default ClientPayments;
