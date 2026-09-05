import { useState, useRef, useEffect } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { useNavigate } from 'react-router-dom';

function Corporate() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Active');
  const [statusSearch, setStatusSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [isAdding, setIsAdding] = useState(false);
  const { clients, addClient } = useGlobal();
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    responsible: '',
    corporateRemarks: '',
    divisionName: '',
    clientName: '',
    clientEmail: '',
    divisionRemarks: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateCorporate = () => {
    if (!formData.name) return; // Basic validation
    addClient(formData);
    setFormData({
      name: '', domain: '', responsible: '', corporateRemarks: '',
      divisionName: '', clientName: '', clientEmail: '', divisionRemarks: ''
    });
    setIsAdding(false);
  };
  
  const statusOptions = ['All', 'Active', 'Inactive'];
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStatusOptions = statusOptions.filter(opt => 
    opt.toLowerCase().includes(statusSearch.toLowerCase())
  );

  return (
    <main className="main-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.75rem' }}>{isAdding ? 'Add Corporate' : 'Clients'}</h1>
      </div>

      {isAdding ? (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '0.4rem', borderRadius: '4px', display: 'flex' }}>
                <i className='bx bx-building-house'></i>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Corporate Details</h3>
            </div>
            
            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Name</label>
                <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Acme Corporation" />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Domain</label>
                <input type="text" className="form-control" name="domain" value={formData.domain} onChange={handleInputChange} placeholder="e.g. acme.com" />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Responsible</label>
                <input type="text" className="form-control" name="responsible" value={formData.responsible} onChange={handleInputChange} placeholder="CS point of contact" />
              </div>
            </div>
            
            <div className="form-group full-width" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Remarks</label>
              <textarea className="form-control" rows="3" name="corporateRemarks" value={formData.corporateRemarks} onChange={handleInputChange} placeholder="Internal notes about this corporate account..."></textarea>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '0.4rem', borderRadius: '4px', display: 'flex' }}>
                <i className='bx bx-briefcase'></i>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Primary Division</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem', marginTop: 0 }}>Every corporate needs at least one division to manage its employees and orders.</p>
            
            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Division Name</label>
                <input type="text" className="form-control" name="divisionName" value={formData.divisionName} onChange={handleInputChange} placeholder="e.g. Head Office" />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Client Name</label>
                <input type="text" className="form-control" name="clientName" value={formData.clientName} onChange={handleInputChange} placeholder="Division point of contact" />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Client Email</label>
                <input type="email" className="form-control" name="clientEmail" value={formData.clientEmail} onChange={handleInputChange} placeholder="name@company.com" />
              </div>
            </div>
            
            <div className="form-group full-width" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Remarks</label>
              <textarea className="form-control" rows="3" name="divisionRemarks" value={formData.divisionRemarks} onChange={handleInputChange} placeholder="Internal notes about this division..."></textarea>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
              <i className='bx bx-info-circle'></i>
              <span style={{ maxWidth: '300px', lineHeight: '1.4' }}>The current logged-in user will be granted access to this division, which can be managed at a later time.</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-outline" onClick={() => setIsAdding(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreateCorporate}>Create Corporate</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: '1rem' }}>
        {/* Top Controls Area */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
          
          {/* Search Box */}
          <div className="search-box" style={{ flex: '1', minWidth: '300px', maxWidth: '600px', border: '1px solid var(--primary)' }}>
            <i className='bx bx-search' style={{ color: 'var(--primary)' }}></i>
            <input 
              type="text" 
              placeholder="Search by company name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            
            {/* Status Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Status</span>
              <div 
                ref={dropdownRef}
                style={{ 
                  position: 'relative', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '0.4rem 0.8rem', 
                  background: 'white',
                  cursor: 'pointer',
                  minWidth: '120px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              >
                <span>{statusFilter}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)' }}>
                  {statusFilter !== 'All' && (
                    <i 
                      className='bx bx-x' 
                      style={{ color: 'var(--red)', fontSize: '1.1rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setStatusFilter('All');
                      }}
                    ></i>
                  )}
                  <i className='bx bx-caret-down'></i>
                </div>

                {isStatusDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    zIndex: 10,
                    padding: '0.5rem',
                    minWidth: '160px'
                  }}>
                    <div className="search-box" style={{ marginBottom: '0.5rem', padding: '0.2rem 0.5rem', background: 'var(--bg-light)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
                      <i className='bx bx-search' style={{ fontSize: '1rem', color: '#8b5cf6' }}></i>
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        value={statusSearch}
                        onChange={(e) => setStatusSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ padding: '0.3rem', fontSize: '0.85rem' }}
                      />
                    </div>
                    {filteredStatusOptions.map(opt => (
                      <div 
                        key={opt}
                        style={{
                          padding: '0.5rem',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          background: statusFilter === opt ? 'var(--bg-light)' : 'transparent',
                          color: statusFilter === opt ? 'var(--primary)' : 'var(--text-main)',
                          fontWeight: statusFilter === opt ? '500' : 'normal'
                        }}
                        onClick={() => {
                          setStatusFilter(opt);
                          setIsStatusDropdownOpen(false);
                          setStatusSearch('');
                        }}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pagination Size */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>Total: {clients.length}</span>
              <span>Rows:</span>
              <select 
                value={rowsPerPage} 
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                style={{ 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-sm)', 
                  padding: '0.2rem 0.5rem',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-responsive">
          <table className="data-table" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
            <thead style={{ background: '#003366', color: 'white' }}>
              <tr>
                <th style={{ padding: '0.5rem 1rem', fontWeight: '600', fontSize: '0.85rem', border: 'none', borderRadius: '8px 0 0 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    COMPANY <i className='bx bx-sort-alt-2' style={{ opacity: 0.7 }}></i>
                  </div>
                </th>
                <th style={{ padding: '0.5rem 1rem', fontWeight: '600', fontSize: '0.85rem', border: 'none', textAlign: 'center' }}>
                  STATUS
                </th>
                <th style={{ padding: '0.5rem 1rem', fontWeight: '600', fontSize: '0.85rem', border: 'none', textAlign: 'center', borderRadius: '0 8px 0 0' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className='bx bx-buildings' style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
                      </div>
                      <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>No Clients Found</h3>
                        <p style={{ margin: 0, fontSize: '0.95rem' }}>You haven't added any corporate clients yet.</p>
                      </div>
                      <button className="btn-primary" style={{ marginTop: '0.5rem' }} onClick={() => setIsAdding(true)}>
                        Add Your First Client
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                clients.map(client => (
                  <tr key={client.id}>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center', fontWeight: '500', fontSize: '0.85rem' }}>
                      {client.name}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.85rem' }}>
                      <span style={{ color: client.status === 'Active' ? '#10b981' : client.status === 'Canceled' ? '#ef4444' : 'inherit', fontWeight: '500' }}>
                        {client.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <button className="action-btn" title="Edit" onClick={() => navigate('/corporate/edit', { state: { client } })} style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }}>
                        <i className='bx bx-edit' style={{ fontSize: '1rem', color: '#64748b' }}></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button className="btn-primary" style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setIsAdding(true)}>
          <i className='bx bx-plus'></i> Add Client
        </button>
      </div>
      </>)}
    </main>
  );
}

export default Corporate;
