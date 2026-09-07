import React, { useState, useRef } from 'react';

function DocumentUploadModal({ isOpen, onClose, onSave }) {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    file: null,
    type: 'Contract',
    otherType: ''
  });

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, file: e.target.files[0] }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.file) {
      alert('Please select a file to upload.');
      return;
    }
    
    const newDoc = {
      id: Date.now() + Math.random(),
      file: formData.file,
      name: formData.file.name,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      type: formData.type,
      otherType: formData.otherType
    };

    onSave(newDoc);
    
    // Reset form
    setFormData({
      file: null,
      type: 'Contract',
      otherType: ''
    });
  };

  // Common styles
  const inputStyle = {
    width: '100%',
    padding: '0.6rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    outline: 'none',
    color: '#0f172a'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.8rem',
    color: '#64748b',
    fontWeight: '500',
    marginBottom: '0.4rem'
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        background: 'white', borderRadius: '8px', width: '90%', maxWidth: '500px',
        padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Upload Document</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>
            &times;
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={labelStyle}>File</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', color: '#475569', fontSize: '0.85rem' }}
              >
                Choose File
              </button>
              <span style={{ fontSize: '0.85rem', color: formData.file ? '#0f172a' : '#94a3b8' }}>
                {formData.file ? formData.file.name : 'No file chosen'}
              </span>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Document Type</label>
            <select 
              name="type"
              style={inputStyle} 
              value={formData.type} 
              onChange={handleChange}
            >
              <option value="Contract">Contract</option>
              <option value="SOW">SOW</option>
              <option value="Tax Certificate">Tax Certificate</option>
              <option value="Others">Others (please specify)</option>
            </select>
          </div>
          
          {formData.type === 'Others' && (
            <div>
              <label style={labelStyle}>Specify Type</label>
              <input 
                type="text" 
                name="otherType"
                style={inputStyle} 
                placeholder="Enter document type..."
                value={formData.otherType}
                onChange={handleChange}
              />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button 
            onClick={onClose}
            style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', color: '#475569' }}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            style={{ padding: '0.5rem 1rem', background: '#0ea5e9', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'white', fontWeight: '500' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocumentUploadModal;
