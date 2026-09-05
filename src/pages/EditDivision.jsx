import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ViewOnboardingModal from '../components/ViewOnboardingModal';

function EditDivision() {
  const location = useLocation();
  const navigate = useNavigate();
  const { division } = location.state || {};

  // If accessed directly without state, fallback
  if (!division) {
    navigate(-1);
    return null;
  }

  const [formData, setFormData] = useState({
    divisionName: division.divisionName || '',
    clientName: division.clientName || '',
    clientEmail: division.clientEmail || '',
    remarks: division.remarks || '',
    status: division.status || 'Active',
    keySpoc: division.keySpoc || { name: '', email: '', contact: '' },
    escalationSpocs: division.escalationSpocs?.length ? division.escalationSpocs : [{ id: Date.now(), name: '', email: '', contact: '', designation: '' }],
    billingDetails: division.billingDetails || { companyName: '', gstNumber: '', address: '' },
    billingSpocs: division.billingSpocs?.length ? division.billingSpocs : [{ id: Date.now(), name: '', email: '', contact: '', department: 'Billing' }],
    expectations: division.expectations || ''
  });

  const [isOtherDetailsOpen, setIsOtherDetailsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFiled, setIsFiled] = useState(false);
  const [filedData, setFiledData] = useState(null);

  useEffect(() => {
    const checkFiledStatus = () => {
      const saved = localStorage.getItem('onboardingFiled_' + (division.id || '1'));
      if (saved) {
        setIsFiled(true);
        setFiledData(JSON.parse(saved));
      }
    };
    
    checkFiledStatus();
    
    // Listen for changes from other tabs
    window.addEventListener('storage', checkFiledStatus);
    return () => window.removeEventListener('storage', checkFiledStatus);
  }, [division.id]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/client-onboarding/${division.id || '1'}`;
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    // Note: To persist this fully, we would need to update the client in GlobalContext.
    // For now, we simulate saving and go back.
    navigate(-1);
  };

  return (
    <main className="main-content">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#003366', margin: 0, fontSize: '1.75rem', fontWeight: '600' }}>{division.divisionName || 'Division Name'}</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-outline" style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '6px', fontSize: '0.85rem' }}>
            Department
          </button>
          <button className="btn-outline" style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '6px', fontSize: '0.85rem' }}>
            Corporate Data
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '0.3rem', borderRadius: '4px', display: 'flex' }}>
              <i className='bx bx-briefcase' style={{ fontSize: '1.1rem' }}></i>
            </div>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Division Details</h3>
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

        <div style={{ display: 'flex', gap: '2rem' }}>
          {/* Form Fields - Left Side */}
          <div style={{ flex: 1 }}>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Division Name</label>
                <input type="text" className="form-control" name="divisionName" value={formData.divisionName} onChange={handleInputChange} style={{ padding: '0.5rem', fontSize: '0.85rem' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Client Name</label>
                <input type="text" className="form-control" name="clientName" value={formData.clientName} onChange={handleInputChange} style={{ padding: '0.5rem', fontSize: '0.85rem' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Client Email</label>
                <input type="email" className="form-control" name="clientEmail" value={formData.clientEmail} onChange={handleInputChange} style={{ padding: '0.5rem', fontSize: '0.85rem' }} />
              </div>
            </div>

            {/* Collapsible Section: Other Details */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
              <button 
                onClick={() => setIsOtherDetailsOpen(!isOtherDetailsOpen)}
                style={{ 
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '0.75rem 1rem', background: '#f8fafc', border: 'none', cursor: 'pointer',
                  fontSize: '0.9rem', color: '#334155', fontWeight: '500'
                }}
              >
                Other Details
                <i className={`bx ${isOtherDetailsOpen ? 'bx-chevron-up' : 'bx-chevron-down'}`} style={{ fontSize: '1.2rem', color: '#64748b' }}></i>
              </button>
              
              {isOtherDetailsOpen && (
                <div style={{ padding: '1.5rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Remarks */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Remarks</label>
                    <textarea 
                      className="form-control" 
                      name="remarks" 
                      value={formData.remarks} 
                      onChange={handleInputChange} 
                      rows="2"
                      style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                      placeholder="Internal notes about this division..."
                    ></textarea>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: 0 }} />

                  {/* Onboarding Trigger Buttons */}
                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1rem' }}>Onboarding Form</h4>
                        <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.85rem' }}>Copy the link to share the onboarding form with the client.</p>
                      </div>
                      
                      {isFiled && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f0fdf4', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                          <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: '500' }}>Filed on: 05 Sep 2026</span>
                          <button 
                            onClick={() => setIsViewModalOpen(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'white', border: '1px solid #86efac', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', color: '#15803d', cursor: 'pointer', fontWeight: '600' }}
                          >
                            <i className='bx bx-show'></i> View
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button 
                        onClick={handleCopyLink}
                        className="btn-primary" 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: isCopied ? '#10b981' : '#3b82f6', fontSize: '0.85rem', transition: 'background-color 0.3s' }}
                      >
                        <i className={`bx ${isCopied ? 'bx-check' : 'bx-copy'}`}></i> 
                        {isCopied ? 'Copied!' : 'Copy the Link'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Active Status Toggle */}
            <div style={{ marginTop: '2rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>Active Status</label>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '1rem', 
                  background: formData.status === 'Active' ? '#f0fdf4' : '#f8fafc',
                  border: formData.status === 'Active' ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  transition: 'all 0.3s'
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: formData.status === 'Active' ? '#16a34a' : '#64748b', fontSize: '0.95rem', fontWeight: '600' }}>
                    {formData.status === 'Active' ? 'Active' : 'Inactive'}
                  </h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>
                    {formData.status === 'Active' ? 'Division can place and manage orders.' : 'Division is disabled. No orders can be placed.'}
                  </p>
                </div>
                
                {/* Toggle Switch */}
                <div 
                  onClick={() => setFormData({...formData, status: formData.status === 'Active' ? 'Inactive' : 'Active'})}
                  style={{
                    width: '44px',
                    height: '24px',
                    background: formData.status === 'Active' ? '#0ea5e9' : '#cbd5e1',
                    borderRadius: '12px',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: formData.status === 'Active' ? '22px' : '2px',
                    transition: 'left 0.3s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}></div>
                </div>
              </div>
            </div>

          </div>

          {/* Logo - Right Side */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '150px' }}>
            <div style={{ 
              width: '100px', height: '100px', 
              borderRadius: '50%', 
              background: '#f1f5f9', 
              border: '1px dashed #cbd5e1',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              marginBottom: '0.75rem'
            }}>
              <i className='bx bx-image' style={{ fontSize: '2rem', color: '#94a3b8' }}></i>
            </div>
            <button style={{ background: 'transparent', border: 'none', color: '#0ea5e9', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <i className='bx bx-edit-alt'></i> Change Logo
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
          <button className="btn-outline" onClick={() => navigate(-1)} style={{ border: 'none', color: '#64748b', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Discard</button>
          <button className="btn-primary" onClick={handleSaveChanges} style={{ padding: '0.4rem 1.25rem', background: '#6366f1', fontSize: '0.85rem' }}>Save Changes</button>
        </div>
      </div>
      
      {/* Access & Roles Section */}
      <div style={{ padding: '1.5rem 2rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', background: '#f0f9ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                <i className='bx bx-group'></i>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: '700' }}>Access & Roles</h2>
            </div>
            <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>Manage roles and permissions for corporate access</p>
          </div>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#3b82f6', fontSize: '0.85rem', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            <i className='bx bx-plus'></i> New Role
          </button>
        </div>

        {/* Roles List */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: 'white' }}>
            {/* Avatar */}
            <div style={{ width: '36px', height: '36px', background: '#e0f2fe', color: '#0284c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.9rem', marginRight: '1.5rem' }}>
              K
            </div>
            
            {/* Roles/Badges */}
            <div style={{ display: 'flex', gap: '0.5rem', marginRight: 'auto', minWidth: '200px' }}>
              <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>Customer Success</span>
              <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <i className='bx bx-star'></i> Primary CS
              </span>
            </div>
            
            {/* Name */}
            <div style={{ width: '200px', fontSize: '0.9rem', color: '#334155', fontWeight: '500' }}>
              Karan Hinduja
            </div>
            
            {/* Email */}
            <div style={{ width: '250px', fontSize: '0.85rem', color: '#64748b' }}>
              hinduja1988@gmail.com
            </div>
            
            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', color: '#94a3b8' }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><i className='bx bx-pencil'></i></button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><i className='bx bx-trash'></i></button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Orders Section */}
      <div style={{ padding: '1.5rem 2rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', marginTop: '2rem' }}>
        
        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <i className='bx bx-search' style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
            <input type="text" placeholder="Search orders..." style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.85rem' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: '#64748b' }}>
            <span>Total: <strong>27</strong></span>
            <span>Rows:</span>
            <select style={{ padding: '0.4rem 2rem 0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', fontSize: '0.85rem', outline: 'none', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}>
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: 'white' }}>
                <th style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>ORDER ID <i className='bx bx-sort-alt-2' style={{ marginLeft: '4px', opacity: 0.7, fontSize: '0.8rem' }}></i></th>
                <th style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>PLAN NAME <i className='bx bx-sort-alt-2' style={{ marginLeft: '4px', opacity: 0.7, fontSize: '0.8rem' }}></i></th>
                <th style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>PROGRAM CODE <i className='bx bx-sort-alt-2' style={{ marginLeft: '4px', opacity: 0.7, fontSize: '0.8rem' }}></i></th>
                <th style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>PLAN START <i className='bx bx-sort-alt-2' style={{ marginLeft: '4px', opacity: 0.7, fontSize: '0.8rem' }}></i></th>
                <th style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>PLAN END <i className='bx bx-sort-alt-2' style={{ marginLeft: '4px', opacity: 0.7, fontSize: '0.8rem' }}></i></th>
                <th style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>EMPLOYEES <i className='bx bx-sort-alt-2' style={{ marginLeft: '4px', opacity: 0.7, fontSize: '0.8rem' }}></i></th>
                <th style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>STATUS <i className='bx bx-sort-alt-2' style={{ marginLeft: '4px', opacity: 0.7, fontSize: '0.8rem' }}></i></th>
                <th style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: 'white' }}>
                <td style={{ padding: '1rem', color: '#475569' }}>25</td>
                <td style={{ padding: '1rem', color: '#475569' }}>Basic EAP (Chat Support)</td>
                <td style={{ padding: '1rem', color: '#475569' }}>mcsub</td>
                <td style={{ padding: '1rem', color: '#475569' }}>01/01/2024</td>
                <td style={{ padding: '1rem', color: '#475569' }}>31/12/2025</td>
                <td style={{ padding: '1rem', color: '#475569' }}>100</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.25rem 0.75rem', background: '#fee2e2', color: '#ef4444', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>Inactive</span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <button style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #cbd5e1', background: 'white', color: '#64748b', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className='bx bx-pencil' style={{ fontSize: '1rem' }}></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          
          {/* Scrollbar Mock */}
          <div style={{ padding: '4px', background: '#f1f5f9', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ height: '8px', background: '#cbd5e1', borderRadius: '4px', margin: '0 4px', width: '90%' }}></div>
          </div>
          
          {/* Table Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc' }}>
            <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: '600' }}>Page 1 of 2</span>
            
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button style={{ padding: '0.4rem 0.75rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', color: '#94a3b8', cursor: 'not-allowed', fontSize: '0.85rem' }}><i className='bx bx-chevrons-left'></i></button>
              <button style={{ padding: '0.4rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', color: '#94a3b8', cursor: 'not-allowed', fontSize: '0.85rem', fontWeight: '500' }}>Previous</button>
              <button style={{ padding: '0.4rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', color: '#0f172a', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>Next</button>
              <button style={{ padding: '0.4rem 0.75rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', color: '#0f172a', cursor: 'pointer', fontSize: '0.85rem' }}><i className='bx bx-chevrons-right'></i></button>
            </div>
            
            <button onClick={() => navigate('/corporate/division/order/add')} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
              <i className='bx bx-plus'></i> Add Order
            </button>
          </div>
        </div>
      </div>
      
      
            <ViewOnboardingModal 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        data={filedData || formData}
      />
    </main>
  );
}

export default EditDivision;
