import { useState } from 'react';

function AddDivisionModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    divisionName: '',
    clientName: '',
    clientEmail: '',
    remarks: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.divisionName) return;
    onAdd(formData);
    setFormData({ divisionName: '', clientName: '', clientEmail: '', remarks: '' });
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', zIndex: 1000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="modal-content" style={{ background: 'white', borderRadius: '12px', width: '500px', maxWidth: '90%', padding: '1.5rem', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '0.6rem', borderRadius: '8px', display: 'flex' }}>
              <i className='bx bx-briefcase' style={{ fontSize: '1.5rem' }}></i>
            </div>
            <div>
              <h2 style={{ margin: '0 0 0.2rem 0', color: '#003366', fontSize: '1.25rem' }}>Add Division</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Create a new division under this corporate.</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.2rem', padding: '0.2rem' }}>
            <i className='bx bx-x'></i>
          </button>
        </div>

        {/* Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '500' }}>Division Name</label>
            <input type="text" className="form-control" name="divisionName" value={formData.divisionName} onChange={handleInputChange} placeholder="e.g. Head Office" style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #0ea5e9' }} />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '500' }}>Client Name</label>
              <input type="text" className="form-control" name="clientName" value={formData.clientName} onChange={handleInputChange} placeholder="Division point of contact" style={{ padding: '0.6rem', borderRadius: '6px' }} />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '500' }}>Client Email</label>
              <input type="email" className="form-control" name="clientEmail" value={formData.clientEmail} onChange={handleInputChange} placeholder="name@company.com" style={{ padding: '0.6rem', borderRadius: '6px' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '500' }}>Remarks</label>
            <textarea className="form-control" name="remarks" value={formData.remarks} onChange={handleInputChange} rows="3" placeholder="Internal notes about this division..." style={{ padding: '0.6rem', borderRadius: '6px' }}></textarea>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
          <button className="btn-outline" onClick={onClose} style={{ border: 'none', color: '#334155', fontWeight: '500' }}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} style={{ background: '#2563eb', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: '500' }}>Add Division</button>
        </div>
      </div>
    </div>
  );
}

export default AddDivisionModal;
