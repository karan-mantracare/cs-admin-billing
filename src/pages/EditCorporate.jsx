import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import AddDivisionModal from '../components/AddDivisionModal';

function EditCorporate() {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateClient } = useGlobal();
  const { client } = location.state || {};

  // If accessed directly without state, fallback
  if (!client) {
    navigate('/corporate');
    return null;
  }

  const [formData, setFormData] = useState({
    name: client.name || '',
    corporateRemarks: client.corporateRemarks || '',
    status: client.status || 'Active'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleStatus = () => {
    setFormData(prev => ({ ...prev, status: prev.status === 'Active' ? 'Inactive' : 'Active' }));
  };

  const [divisions, setDivisions] = useState([
    {
      id: 1,
      divisionName: client.divisionName || 'Default Division',
      clientName: client.clientName || 'N/A',
      responsible: client.responsible || 'N/A',
      remarks: client.divisionRemarks || ''
    }
  ]);
  
  const [isAddDivisionOpen, setIsAddDivisionOpen] = useState(false);

  const handleAddDivision = (newDiv) => {
    setDivisions(prev => [...prev, { ...newDiv, id: Date.now(), responsible: formData.responsible }]);
    setIsAddDivisionOpen(false);
  };

  const handleSaveChanges = () => {
    // If corporate is inactive, mark all divisions as Incomplete
    const updatedDivisions = divisions.map(div => 
      formData.status === 'Inactive' ? { ...div, status: 'Incomplete' } : div
    );

    updateClient(client.id, {
      ...formData,
      divisions: updatedDivisions
    });
    navigate('/corporate');
  };

  return (
    <main className="main-content">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#003366', margin: 0, fontSize: '1.75rem', fontWeight: '600' }}>{client.name}</h1>
      </div>

      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '0.3rem', borderRadius: '4px', display: 'flex' }}>
              <i className='bx bx-building-house' style={{ fontSize: '1.1rem' }}></i>
            </div>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Company Details</h3>
          </div>
          <span style={{ 
            background: formData.status === 'Active' ? '#dcfce7' : '#fee2e2', 
            color: formData.status === 'Active' ? '#166534' : '#991b1b', 
            padding: '0.3rem 0.8rem', 
            borderRadius: '20px', 
            fontSize: '0.85rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <i className={`bx ${formData.status === 'Active' ? 'bx-check-circle' : 'bx-x-circle'}`}></i>
            {formData.status}
          </span>
        </div>

        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Company Name</label>
              <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }} />
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', color: '#94a3b8' }}>Shown across Invoices and the client dashboard.</p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.85rem', color: formData.status === 'Active' ? '#10b981' : '#ef4444', marginBottom: '0.1rem' }}>
                  {formData.status}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Corporate can place and manage orders.
                </div>
              </div>
              <div 
                onClick={toggleStatus}
                style={{ 
                  width: '36px', height: '20px', 
                  background: formData.status === 'Active' ? '#0ea5e9' : '#cbd5e1', 
                  borderRadius: '10px', 
                  position: 'relative', 
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ 
                  width: '16px', height: '16px', 
                  background: 'white', borderRadius: '50%', 
                  position: 'absolute', top: '2px', 
                  left: formData.status === 'Active' ? '18px' : '2px', 
                  transition: 'all 0.3s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}></div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Remarks</label>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{formData.corporateRemarks.length}/500</span>
            </div>
            <textarea className="form-control" name="corporateRemarks" value={formData.corporateRemarks} onChange={handleInputChange} style={{ padding: '0.5rem', fontSize: '0.85rem', flex: 1, resize: 'none' }}></textarea>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <button className="btn-outline" onClick={() => navigate('/corporate')} style={{ border: 'none', color: '#64748b', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Discard</button>
          <button className="btn-primary" onClick={handleSaveChanges} style={{ padding: '0.4rem 1.25rem', background: '#6366f1', fontSize: '0.85rem' }}>Save Changes</button>
        </div>
      </div>

      {/* Divisions Section */}
      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="search-box" style={{ flex: '1', minWidth: '300px', maxWidth: '600px', border: '1px solid #0ea5e9', boxShadow: 'none' }}>
            <i className='bx bx-search' style={{ color: '#0ea5e9' }}></i>
            <input 
              type="text" 
              placeholder="Search by division name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <span>Total: {divisions.length}</span>
            <span>Rows:</span>
            <select 
              value={rowsPerPage} 
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.5rem', background: 'white', cursor: 'pointer' }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table" style={{ borderCollapse: 'separate', borderSpacing: '0', width: '100%' }}>
            <thead style={{ background: '#003366', color: 'white' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600', fontSize: '0.75rem', border: 'none', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}>
                    DIVISION <i className='bx bx-sort-alt-2' style={{ opacity: 0.7 }}></i>
                  </div>
                </th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600', fontSize: '0.75rem', border: 'none', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}>
                    CLIENT NAME <i className='bx bx-sort-alt-2' style={{ opacity: 0.7 }}></i>
                  </div>
                </th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600', fontSize: '0.75rem', border: 'none', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}>
                    CS RESPONSIBLE <i className='bx bx-sort-alt-2' style={{ opacity: 0.7 }}></i>
                  </div>
                </th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600', fontSize: '0.75rem', border: 'none', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}>
                    COMMENTS <i className='bx bx-sort-alt-2' style={{ opacity: 0.7 }}></i>
                  </div>
                </th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600', fontSize: '0.75rem', border: 'none', textAlign: 'center' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {divisions.map(div => (
                <tr key={div.id}>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.85rem' }}>{div.divisionName}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.85rem' }}>{div.clientName}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.85rem' }}>{div.responsible}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>{div.remarks || '-'}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <button className="action-btn" title="Edit" onClick={() => navigate('/corporate/division/edit', { state: { division: div } })} style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }}>
                      <i className='bx bx-edit' style={{ fontSize: '1rem', color: '#64748b' }}></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Page 1 of 1</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={{ border: '1px solid var(--border-color)', background: 'white', padding: '0.3rem 0.6rem', borderRadius: '4px', color: '#cbd5e1' }} disabled><i className='bx bx-chevrons-left'></i></button>
            <button style={{ border: '1px solid var(--border-color)', background: 'white', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem' }}>Previous</button>
            <button style={{ border: '1px solid var(--border-color)', background: 'white', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem' }}>Next</button>
            <button style={{ border: '1px solid var(--border-color)', background: 'white', padding: '0.3rem 0.6rem', borderRadius: '4px', color: '#cbd5e1' }} disabled><i className='bx bx-chevrons-right'></i></button>
          </div>
          <button className="btn-outline" onClick={() => setIsAddDivisionOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
            <i className='bx bx-plus'></i> Add Division
          </button>
        </div>
      </div>
      
      <AddDivisionModal 
        isOpen={isAddDivisionOpen} 
        onClose={() => setIsAddDivisionOpen(false)} 
        onAdd={handleAddDivision} 
      />
    </main>
  );
}

export default EditCorporate;
