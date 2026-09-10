import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import AddScheduleModal from '../components/AddScheduleModal';
import EditPaymentModal from '../components/EditPaymentModal';
import BillingMessageModal, { BillingMessageContent } from '../components/BillingMessageModal';
import UniversalFilter from '../components/UniversalFilter';
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
  const location = useLocation();
  const initialClient = searchParams.get('client');

  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [addModalMode, setAddModalMode] = useState('schedule');
  
  // Generating mock data matching the new 14-column layout
  const [payments, setPayments] = useState(() => {
    try {
      const saved = localStorage.getItem('client_payments');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter(p => p != null) : [];
      }
      return [];
    } catch (e) {
      console.error("Failed to parse client_payments from localStorage", e);
      return [];
    }
  });

  const [paymentRecords, setPaymentRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('client_payment_records');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter(p => p != null) : [];
      }
      return [];
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
  const [advancedFilters, setAdvancedFilters] = useState({ conditions: [], searchText: '' });
  
  // Unique clients for the dropdown (if still needed elsewhere)
  const uniqueClients = [...new Set(payments.map(p => p?.clientName).filter(Boolean))];

  // Popup State
  const [activeUploadId, setActiveUploadId] = useState(null);
  const [activeUploadTab, setActiveUploadTab] = useState('upload'); // 'upload' or 'message'
  const [copied, setCopied] = useState(false);
  const [activePaymentId, setActivePaymentId] = useState(null);
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [activeBillingMessage, setActiveBillingMessage] = useState(null);
  
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    invoiceDate: '',
    invoiceFile: null
  });
  const [invoiceErrors, setInvoiceErrors] = useState({});

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
    // Free text search
    const query = String(advancedFilters.searchText || '').toLowerCase();
    const matchesSearch = !query || 
      String(p.clientName || '').toLowerCase().includes(query) || 
      String(p.orderId || '').toLowerCase().includes(query) ||
      String(p.billingCompany || '').toLowerCase().includes(query);
    
    // Conditions
    let matchesConditions = true;
    for (const cond of advancedFilters.conditions) {
       // Skip empty conditions
       if (!cond.value || (Array.isArray(cond.value) && !cond.value[0] && !cond.value[1])) {
         continue;
       }

       const fieldVal = String(p[cond.fieldId] || '');
       if (cond.operator === 'Is') {
          if (fieldVal !== cond.value) matchesConditions = false;
       } else if (cond.operator === 'Is not') {
          if (fieldVal === cond.value) matchesConditions = false;
       } else if (cond.operator === 'Contains') {
          if (!fieldVal.toLowerCase().includes((cond.value || '').toLowerCase())) matchesConditions = false;
       } else if (cond.operator === 'Not Contains') {
          if (fieldVal.toLowerCase().includes((cond.value || '').toLowerCase())) matchesConditions = false;
       } else if (cond.operator === 'Between' && Array.isArray(cond.value)) {
          // date logic
          const d = new Date(fieldVal);
          const start = cond.value[0] ? new Date(cond.value[0]) : new Date('1900-01-01');
          const end = cond.value[1] ? new Date(cond.value[1]) : new Date('2100-01-01');
          if (d < start || d > end) matchesConditions = false;
       } else if (cond.operator === 'Before') {
          const d = new Date(fieldVal);
          if (d >= new Date(cond.value)) matchesConditions = false;
       } else if (cond.operator === 'After') {
          const d = new Date(fieldVal);
          if (d <= new Date(cond.value)) matchesConditions = false;
       } else if (cond.operator === 'Greater than') {
          if (Number(fieldVal) <= Number(cond.value)) matchesConditions = false;
       } else if (cond.operator === 'Less than') {
          if (Number(fieldVal) >= Number(cond.value)) matchesConditions = false;
       }
    }
    
    return matchesSearch && matchesConditions;
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

  const handleSaveEdit = (updatedPayment) => {
    setPayments(prev => prev.map(p => p.id === updatedPayment.id ? updatedPayment : p));
    setEditingPaymentId(null);
  };

  const handleDeletePayment = (paymentId) => {
    setPayments(prev => prev.filter(p => p.id !== paymentId));
    setEditingPaymentId(null);
  };

  return (
    <main className="main-content" style={{ paddingTop: '1rem', overflowX: 'hidden' }}>
      <div className="page-header" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, maxWidth: '500px' }}>
          <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Accounts Receivable</h1>
          
          <div className="table-toolbar" style={{ margin: 0 }}>
            <UniversalFilter 
              pageName="Client Payments"
              storageKey="client_payments_universal_filters"
              initialSearchText={location.state?.filterOrderId ? String(location.state.filterOrderId) : ''}
              fields={[
                { id: 'clientName', label: 'Client Name', type: 'text' },
                { id: 'orderId', label: 'Order ID', type: 'text' },
                { id: 'corporateName', label: 'Corporate Name', type: 'text' },
                { id: 'billingCompany', label: 'Billing Company', type: 'text' },
                { id: 'status', label: 'Status', type: 'select', options: ['To be Raised', 'Pending', 'Partial', 'Received', 'Overdue', 'Invoice Pending'] },
                { id: 'dueByDate', label: 'Due By Date', type: 'date' },
                { id: 'invoiceDate', label: 'Invoice Date', type: 'date' }
              ]}
              defaultFields={['clientName', 'status', 'dueByDate']}
              onApply={(conditions, searchText) => setAdvancedFilters({ conditions, searchText })}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0', background: '#fff', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          {[
            { label: 'Total Billed', value: totalBilled, color: 'var(--blue)', icon: 'bx-receipt' },
            { label: 'Total Received', value: totalReceived, color: 'var(--green)', icon: 'bx-check-circle' },
            { label: 'Total Overdue', value: totalOverdue, color: 'var(--red)', icon: 'bx-error-circle' },
            { label: 'To Be Billed', value: toBeBilled, color: '#f59e0b', icon: 'bx-time' },
          ].map((stat, i, arr) => (
            <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem 1.25rem', borderRight: i < arr.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                <i className={`bx ${stat.icon}`} style={{ fontSize: '0.9rem', color: stat.color }}></i>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{stat.label}</span>
              </div>
              <strong style={{ fontSize: '1.05rem', color: stat.color }}>${Number(stat.value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #cbd5e1', marginBottom: '1.5rem', gap: '0.25rem' }}>
        <button 
          style={{ 
            padding: '0.65rem 1.25rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'billing' ? '2px solid #0ea5e9' : '2px solid transparent',
            color: activeTab === 'billing' ? '#0ea5e9' : '#64748b',
            fontWeight: activeTab === 'billing' ? '600' : '500',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
          onClick={() => setActiveTab('billing')}
        >
          <i className='bx bx-table'></i>
          Billing and Payment
          <span style={{ background: activeTab === 'billing' ? '#0ea5e9' : '#e2e8f0', color: activeTab === 'billing' ? 'white' : '#64748b', borderRadius: '10px', padding: '0.1rem 0.5rem', fontSize: '0.72rem', fontWeight: '700' }}>{payments.length}</span>
        </button>
        <button 
          style={{ 
            padding: '0.65rem 1.25rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'records' ? '2px solid #0ea5e9' : '2px solid transparent',
            color: activeTab === 'records' ? '#0ea5e9' : '#64748b',
            fontWeight: activeTab === 'records' ? '600' : '500',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
          onClick={() => setActiveTab('records')}
        >
          <i className='bx bx-money-withdraw'></i>
          Payment Records
          <span style={{ background: activeTab === 'records' ? '#0ea5e9' : '#e2e8f0', color: activeTab === 'records' ? 'white' : '#64748b', borderRadius: '10px', padding: '0.1rem 0.5rem', fontSize: '0.72rem', fontWeight: '700' }}>{paymentRecords.length}</span>
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
                <td><strong className="text-blue">${Number(p.amountDueUsd || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}</strong></td>
                <td>{Number(p.amountDue || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
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
                <td><strong className="text-green">${Number(p.totalPaid || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}</strong></td>
                <td>
                  <span style={{ color: p.dueAmount > 0 ? 'var(--red)' : 'var(--text-main)', fontWeight: p.dueAmount > 0 ? '600' : '400' }}>
                    ${Number(p.dueAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </span>
                </td>
                <td>
                  {(() => {
                    let s = p.status;
                    let text = s;
                    
                    const today = new Date();
                    today.setHours(0,0,0,0);

                    if (s === 'To be Raised' && p.dueByDate && p.invoiceByDate) {
                      const due = new Date(p.dueByDate);
                      due.setHours(0,0,0,0);
                      
                      if (today > due) {
                        const invoiceBy = new Date(p.invoiceByDate);
                        invoiceBy.setHours(0,0,0,0);
                        const diffTime = today.getTime() - invoiceBy.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        s = 'Invoice Pending';
                        text = `Invoice Pending ${diffDays > 0 ? diffDays : 0} Days`;
                      }
                    } else if (s !== 'Received' && s !== 'To be Raised' && p.dueByDate) {
                      const due = new Date(p.dueByDate);
                      due.setHours(0,0,0,0);
                      
                      const diffTime = today.getTime() - due.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      
                      if (diffDays > 0) {
                        s = 'Overdue';
                        text = `${diffDays} Days`;
                      }
                    }

                    const cfg = {
                      'To be Raised': { bg: '#fef9c3', color: '#a16207', icon: 'bx-time' },
                      'Pending':      { bg: '#e0f2fe', color: '#0369a1', icon: 'bx-loader-circle' },
                      'Partial':      { bg: '#fff7ed', color: '#c2410c', icon: 'bx-minus-circle' },
                      'Received':     { bg: '#dcfce7', color: '#15803d', icon: 'bx-check-circle' },
                      'Overdue':      { bg: '#fee2e2', color: '#b91c1c', icon: 'bx-error' },
                      'Invoice Pending': { bg: '#ffedd5', color: '#c2410c', icon: 'bx-file-blank' },
                    }[s] || { bg: '#f1f5f9', color: '#475569', icon: 'bx-circle' };
                    return (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: cfg.bg, color: cfg.color, padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap' }}>
                        <i className={`bx ${cfg.icon}`}></i>{text}
                      </span>
                    );
                  })()}
                </td>
                <td className="actions" style={{ gap: '0.35rem' }}>
                  <button className="action-btn edit" title="Edit" style={{ border: '1px solid #e2e8f0', borderRadius: '5px', padding: '0.3rem 0.5rem', background: '#fff', cursor: p.status !== 'To be Raised' ? 'not-allowed' : 'pointer', color: '#64748b', opacity: p.status !== 'To be Raised' ? 0.4 : 1 }} disabled={p.status !== 'To be Raised'} onClick={() => setEditingPaymentId(p.id)}>
                    <i className='bx bx-pencil'></i>
                  </button>
                  <button title="Add Payment" style={{ border: '1px solid #bbf7d0', borderRadius: '5px', padding: '0.3rem 0.5rem', background: '#f0fdf4', cursor: 'pointer', color: '#16a34a', display: 'inline-flex', alignItems: 'center' }} onClick={() => setActivePaymentId(p.id)}>
                    <i className='bx bx-money'></i>
                  </button>
                  <button title="Upload Invoice" style={{ border: '1px solid #bfdbfe', borderRadius: '5px', padding: '0.3rem 0.5rem', background: '#eff6ff', cursor: 'pointer', color: '#2563eb', display: 'inline-flex', alignItems: 'center' }} onClick={() => setActiveUploadId(p.id)}>
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
                <td><strong>{Number(r.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}</strong></td>
                <td>{r.currency}</td>
                <td><strong className="text-green">${Number(r.amountInUSD || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}</strong></td>
              </tr>
            ))}
            {paymentRecords.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No payment records found.</td>
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
          if (data.invoices && data.invoices.length > 0) {
            setPayments(prev => [...data.invoices, ...prev]);
            alert(`Schedule added for ${data.formData.corporate}, Order: ${data.formData.orderName}`);
          }
        }}
      />

      <EditPaymentModal 
        isOpen={!!editingPaymentId}
        onClose={() => setEditingPaymentId(null)}
        payment={payments.find(p => p.id === editingPaymentId)}
        onSave={handleSaveEdit}
        onDelete={handleDeletePayment}
      />


      {/* Manage Invoice Modal (Upload + Billing Message) */}
      {activeUploadId !== null && (() => {
        const payment = payments.find(p => p.id === activeUploadId);
        if (!payment) return null;
        
        let orderDetails = null;
        if (payment.orderId) {
          try {
            const saved = localStorage.getItem('division_orders');
            if (saved) {
              const orders = JSON.parse(saved);
              orderDetails = Array.isArray(orders) ? orders.find(o => String(o.id) === String(payment.orderId)) : null;
            }
          } catch (e) {}
        }

        const handleCopy = () => {
          const billing = orderDetails?.billingDetails || {};
          const clientBillingEntity = billing.billingEntity || payment.billingCompany || '—';
          const clientTaxDetails    = billing.taxDetails || '—';
          const contractCurrency    = billing.clientCurrency || payment.currency || '—';
          const contractValue       = billing.contractValue ? `${contractCurrency} ${Number(billing.contractValue).toLocaleString('en-US', { maximumFractionDigits: 2 })}` : '—';
          const invoiceValue        = payment.amountDue ? `${payment.currency || contractCurrency} ${Number(payment.amountDue).toLocaleString('en-US', { maximumFractionDigits: 2 })}` : '—';
          const invoiceDate         = payment.invoiceByDate || '—';
          const dueByDate           = payment.dueByDate || '—';
          const noOfEmployees       = billing.noOfEmployees || orderDetails?.employees || '—';
          const servicePeriod       = billing.paymentDueDays ? `${billing.paymentDueDays} days` : '—';
          const bankDetailsLink     = billing.bankDetailsLink || null;
          const serviceDescription  = `EAP Service offered for ${noOfEmployees} employees`;

          const messageText = [
            'Billing Message',
            '─────────────────────────────',
            `Client Billing Entity Name : ${clientBillingEntity}`,
            `Client Tax Details         : ${clientTaxDetails}`,
            `Contract Billing Currency  : ${contractCurrency}`,
            `Contract Value             : ${contractValue}`,
            '',
            'Current Invoice',
            '─────────────────────────────',
            `Invoice Value              : ${invoiceValue}`,
            `Invoice Date               : ${invoiceDate}`,
            `Due By Date                : ${dueByDate}`,
            `Service Description        : ${serviceDescription}`,
            `Service Period             : ${servicePeriod}`,
            bankDetailsLink ? `Bank Details Link          : ${bankDetailsLink}` : null,
          ].filter(l => l !== null).join('\n');

          navigator.clipboard.writeText(messageText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          });
        };

        const resetModal = () => {
          setActiveUploadId(null);
          setInvoiceForm({ invoiceNumber: '', invoiceDate: '', invoiceFile: null });
          setInvoiceErrors({});
          setActiveUploadTab('upload');
        };

        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
          }} onClick={resetModal}>
            <div style={{
              background: 'white', borderRadius: '12px', width: '90%', maxWidth: '520px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column'
            }} onClick={(e) => e.stopPropagation()}>
              
              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'white', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className='bx bx-file-blank'></i> Manage Invoice
                </h2>
                <button onClick={resetModal} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '6px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>×</button>
              </div>
              
              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <button 
                  onClick={() => setActiveUploadTab('upload')} 
                  style={{ 
                    flex: 1, padding: '0.85rem', background: 'transparent', border: 'none', 
                    color: activeUploadTab === 'upload' ? '#2563eb' : '#64748b', 
                    borderBottom: activeUploadTab === 'upload' ? '2px solid #2563eb' : '2px solid transparent', 
                    fontWeight: activeUploadTab === 'upload' ? '600' : '500', 
                    cursor: 'pointer', transition: 'all 0.2s ease', fontSize: '0.9rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                  }}
                >
                  Upload Invoice
                </button>
                <button 
                  onClick={() => setActiveUploadTab('message')} 
                  style={{ 
                    flex: 1, padding: '0.85rem', background: 'transparent', border: 'none', 
                    color: activeUploadTab === 'message' ? '#2563eb' : '#64748b', 
                    borderBottom: activeUploadTab === 'message' ? '2px solid #2563eb' : '2px solid transparent', 
                    fontWeight: activeUploadTab === 'message' ? '600' : '500', 
                    cursor: 'pointer', transition: 'all 0.2s ease', fontSize: '0.9rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                  }}
                >
                  Billing Details
                </button>
              </div>

              {/* Tab Content */}
              {activeUploadTab === 'upload' ? (
                <>
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', fontWeight: '600', color: '#475569', letterSpacing: '0.02em' }}>
                        Invoice Number <span style={{color:'#ef4444'}}>*</span>
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. INV-2024-001" 
                        style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', border: `1px solid ${invoiceErrors.invoiceNumber ? '#ef4444' : '#cbd5e1'}`, fontSize: '0.9rem', color: '#0f172a', boxSizing: 'border-box', transition: 'border-color 0.2s', outline: 'none' }} 
                        value={invoiceForm.invoiceNumber}
                        onChange={(e) => { setInvoiceForm(prev => ({ ...prev, invoiceNumber: e.target.value })); setInvoiceErrors(prev => ({...prev, invoiceNumber: null})); }}
                        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                        onBlur={(e) => e.target.style.borderColor = invoiceErrors.invoiceNumber ? '#ef4444' : '#cbd5e1'}
                      />
                      {invoiceErrors.invoiceNumber && <p style={{margin:'0.3rem 0 0',fontSize:'0.75rem',color:'#ef4444'}}>{invoiceErrors.invoiceNumber}</p>}
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', fontWeight: '600', color: '#475569', letterSpacing: '0.02em' }}>
                        Invoice Date <span style={{color:'#ef4444'}}>*</span>
                      </label>
                      <input 
                        type="date" 
                        style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', border: `1px solid ${invoiceErrors.invoiceDate ? '#ef4444' : '#cbd5e1'}`, fontSize: '0.9rem', color: '#0f172a', boxSizing: 'border-box', transition: 'border-color 0.2s', outline: 'none' }} 
                        value={invoiceForm.invoiceDate}
                        onChange={(e) => { setInvoiceForm(prev => ({ ...prev, invoiceDate: e.target.value })); setInvoiceErrors(prev => ({...prev, invoiceDate: null})); }}
                        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                        onBlur={(e) => e.target.style.borderColor = invoiceErrors.invoiceDate ? '#ef4444' : '#cbd5e1'}
                      />
                      {invoiceErrors.invoiceDate && <p style={{margin:'0.3rem 0 0',fontSize:'0.75rem',color:'#ef4444'}}>{invoiceErrors.invoiceDate}</p>}
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', fontWeight: '600', color: '#475569', letterSpacing: '0.02em' }}>
                        Invoice Document <span style={{ color: '#94a3b8', fontWeight: '500' }}>(PDF)</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type="file" 
                          accept=".pdf" 
                          style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px dashed #cbd5e1', background: '#f8fafc', fontSize: '0.9rem', color: '#475569', boxSizing: 'border-box', cursor: 'pointer' }} 
                          onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoiceFile: e.target.files[0] }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '0 1.5rem 1.5rem', background: 'white' }}>
                    <button style={{ padding: '0.6rem 1.25rem', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.2s' }} onClick={resetModal} onMouseOver={(e) => e.target.style.background = '#e2e8f0'} onMouseOut={(e) => e.target.style.background = '#f1f5f9'}>Cancel</button>
                    <button style={{ padding: '0.6rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(37,99,235,0.2)' }} onClick={() => {
                      const errs = {};
                      if (!invoiceForm.invoiceNumber) errs.invoiceNumber = 'Invoice number is required';
                      if (!invoiceForm.invoiceDate) errs.invoiceDate = 'Invoice date is required';
                      if (Object.keys(errs).length) { setInvoiceErrors(errs); return; }
                      setPayments(prev => prev.map(p => {
                        if (p.id === activeUploadId) {
                          return { ...p, invoiceDate: invoiceForm.invoiceDate, invoiceLink: invoiceForm.invoiceNumber, status: p.status === 'To be Raised' ? 'Pending' : p.status };
                        }
                        return p;
                      }));
                      resetModal();
                    }}><i className='bx bx-upload'></i> Upload</button>
                  </div>
                </>
              ) : (
                <BillingMessageContent payment={payment} orderDetails={orderDetails} onCopy={handleCopy} copied={copied} />
              )}
            </div>
          </div>
        );
      })()}

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
              background: 'white', borderRadius: '10px', width: '90%', maxWidth: '420px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)', overflow: 'hidden'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ background: 'linear-gradient(135deg, #059669, #10b981)', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1rem', color: 'white', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><i className='bx bx-money'></i> {editingRecordId ? 'Edit Payment' : 'Add Payment'}</h2>
                <button onClick={() => { setActivePaymentId(null); setPaymentForm({ paymentDate: '', amount: '', isChangeCurrency: false, changedCurrency: 'USD', exchangedAmount: '', receivedBank: '' }); setEditingRecordId(null); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
              <div style={{ padding: '1.25rem' }}>
              
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
                  <select 
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', boxSizing: 'border-box', backgroundColor: 'white' }} 
                    value={paymentForm.receivedBank}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, receivedBank: e.target.value }))}
                  >
                    <option value="" disabled hidden>Select Bank</option>
                    <option value="AirWallex">AirWallex</option>
                    <option value="ICICI">ICICI</option>
                    <option value="Wise">Wise</option>
                    <option value="Mercury">Mercury</option>
                    <option value="ENBD">ENBD</option>
                  </select>
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
                            <strong style={{ color: '#0f172a' }}>{Number(pp.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}</strong>
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
                  
                    setActivePaymentId(null);
                    setPaymentForm({ paymentDate: '', amount: '', isChangeCurrency: false, changedCurrency: 'USD', exchangedAmount: '', receivedBank: '' });
                    setShowPastPayments(false);
                    setEditingRecordId(null);
                  }}
                  style={{ padding: '0.5rem 1.25rem', background: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                ><i className={`bx ${editingRecordId ? 'bx-save' : 'bx-check'}`}></i>{editingRecordId ? 'Update' : 'Save'}</button>
              </div>
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
