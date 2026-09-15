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
  // Common styles
  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '0.9rem',
    outline: 'none',
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.85rem',
    color: '#334155',
    fontWeight: '600',
    marginBottom: '0.5rem'
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: '16px', width: '90%', maxWidth: '480px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ background: '#f8fafc', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#e0f2fe', color: '#0ea5e9', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className='bx bx-cloud-upload' style={{ fontSize: '1.5rem' }}></i>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '700' }}>Upload Document V1</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            &times;
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* File Upload Area */}
          <div>
            <label style={labelStyle}>Document File</label>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{ 
                border: formData.file ? '1px solid #0ea5e9' : '2px dashed #cbd5e1', 
                borderRadius: '12px', padding: '2rem 1.5rem', textAlign: 'center', cursor: 'pointer',
                background: formData.file ? '#f0f9ff' : '#f8fafc', transition: 'all 0.2s'
              }}
              onMouseEnter={e => !formData.file && (e.currentTarget.style.borderColor = '#94a3b8')}
              onMouseLeave={e => !formData.file && (e.currentTarget.style.borderColor = '#cbd5e1')}
            >
              {formData.file ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <i className='bx bxs-file-pdf' style={{ fontSize: '2.5rem', color: '#ef4444' }}></i>
                  <div style={{ color: '#0f172a', fontWeight: '600', fontSize: '0.95rem', wordBreak: 'break-all' }}>{formData.file.name}</div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Click to change file</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ background: '#e2e8f0', color: '#475569', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                    <i className='bx bx-plus' style={{ fontSize: '1.5rem' }}></i>
                  </div>
                  <div style={{ color: '#334155', fontWeight: '600', fontSize: '0.95rem' }}>Click to select a file</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Supported formats: PDF, DOCX, JPG, PNG</div>
                </div>
              )}
            </div>
          </div>

          {/* Type Select */}
          <div>
            <label style={labelStyle}>Document Type</label>
            <div style={{ position: 'relative' }}>
              <select 
                name="type"
                style={{...inputStyle, appearance: 'none', cursor: 'pointer'}} 
                value={formData.type} 
                onChange={handleChange}
                onFocus={e => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <option value="Contract">Contract</option>
                <option value="SOW">SOW</option>
                <option value="Tax Certificate">Tax Certificate</option>
                <option value="Others">Others (please specify)</option>
              </select>
              <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none', fontSize: '1.2rem' }}></i>
            </div>
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
                onFocus={e => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button 
            onClick={onClose}
            style={{ padding: '0.6rem 1.2rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', color: '#475569', fontWeight: '600', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            style={{ padding: '0.6rem 1.5rem', background: '#0ea5e9', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white', fontWeight: '600', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.2)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#0284c7'}
            onMouseLeave={e => e.currentTarget.style.background = '#0ea5e9'}
          >
            Save Document
          </button>
        </div>

      </div>
    </div>
  );
}

export default DocumentUploadModal;
