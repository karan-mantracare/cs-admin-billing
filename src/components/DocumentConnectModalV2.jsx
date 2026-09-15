import React, { useState, useRef, useEffect } from 'react';

function DocumentConnectModalV2({ isOpen, onClose, onConnect, divisionId, orderId, existingV2Docs = [] }) {
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('connect'); // 'connect' or 'upload'
  const [availableDocs, setAvailableDocs] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState([]);

  const [uploadData, setUploadData] = useState({
    file: null,
    type: 'Contract',
    otherType: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadAvailableDocs();
      setSelectedDocIds([]);
      setActiveTab('connect');
      setUploadData({ file: null, type: 'Contract', otherType: '' });
    }
  }, [isOpen, divisionId, orderId, existingV2Docs]);

  const loadAvailableDocs = () => {
    try {
      const allDocsStr = localStorage.getItem('division_documents');
      if (allDocsStr) {
        const allDocs = JSON.parse(allDocsStr);
        // Available docs: belong to this division, have no order attached yet, and aren't already selected in the UI
        const existingIds = existingV2Docs.map(d => d.id);
        const available = allDocs.filter(d => 
          String(d.divisionId) === String(divisionId) && 
          !d.orderId && 
          !existingIds.includes(d.id)
        );
        setAvailableDocs(available);
      } else {
        setAvailableDocs([]);
      }
    } catch (e) {
      console.error('Failed to load division_documents', e);
      setAvailableDocs([]);
    }
  };

  if (!isOpen) return null;

  // --- Upload Handlers ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadData(prev => ({ ...prev, file: e.target.files[0] }));
    }
  };

  const handleUploadChange = (e) => {
    const { name, value } = e.target;
    setUploadData(prev => ({ ...prev, [name]: value }));
  };

  // --- Save Handler ---
  const handleSave = () => {
    if (activeTab === 'connect') {
      if (selectedDocIds.length === 0) {
        alert('Please select at least one document to connect.');
        return;
      }
      
      const connectedDocs = availableDocs.filter(d => selectedDocIds.includes(d.id));
      onConnect(connectedDocs, 'connect');
      
    } else {
      if (!uploadData.file) {
        alert('Please select a file to upload.');
        return;
      }
      
      const newDoc = {
        id: Date.now() + Math.random(),
        file: uploadData.file, // In a real app, upload this and get URL
        name: uploadData.file.name,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        type: uploadData.type,
        otherType: uploadData.otherType,
        divisionId: divisionId,
        orderId: orderId || '', // Might be blank if order is new
        orderName: '', // Will be updated on save
        isDirectlyUploaded: true
      };

      onConnect([newDoc], 'upload');
    }
  };

  // --- Styles ---
  const inputStyle = {
    width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0',
    fontSize: '0.9rem', outline: 'none', color: '#0f172a', backgroundColor: '#f8fafc',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  };

  const labelStyle = {
    display: 'block', fontSize: '0.85rem', color: '#334155', fontWeight: '600', marginBottom: '0.5rem'
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      
      <div style={{
        background: 'white', borderRadius: '16px', width: '90%', maxWidth: '520px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ background: '#f8fafc', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#e0f2fe', color: '#0ea5e9', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className='bx bx-link' style={{ fontSize: '1.5rem' }}></i>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '700' }}>Manage Documents V2</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%' }}>
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button 
            onClick={() => setActiveTab('connect')}
            style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === 'connect' ? '2px solid #0ea5e9' : '2px solid transparent', color: activeTab === 'connect' ? '#0ea5e9' : '#64748b', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem' }}
          >
            Connect Existing
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === 'upload' ? '2px solid #0ea5e9' : '2px solid transparent', color: activeTab === 'upload' ? '#0ea5e9' : '#64748b', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem' }}
          >
            Upload New
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', maxHeight: '400px', overflowY: 'auto' }}>
          
          {activeTab === 'connect' && (
            <div>
              <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.85rem' }}>Select documents previously uploaded to this division to attach them to this order.</p>
              {availableDocs.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  <i className='bx bx-folder-open' style={{ fontSize: '2rem', color: '#94a3b8', marginBottom: '0.5rem' }}></i>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>No unlinked documents found in this division.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {availableDocs.map(doc => {
                    const isSelected = selectedDocIds.includes(doc.id);
                    return (
                      <div 
                        key={doc.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedDocIds(prev => prev.filter(id => id !== doc.id));
                          } else {
                            setSelectedDocIds(prev => [...prev, doc.id]);
                          }
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: isSelected ? '#f0f9ff' : 'white', border: isSelected ? '1px solid #0ea5e9' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: '#0ea5e9', width: '16px', height: '16px', cursor: 'pointer' }} />
                        <i className='bx bxs-file-pdf' style={{ fontSize: '1.5rem', color: '#ef4444' }}></i>
                        <div>
                          <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.9rem' }}>{doc.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{doc.type === 'Others' ? doc.otherType : doc.type} • {doc.date}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Document File</label>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ border: uploadData.file ? '1px solid #0ea5e9' : '2px dashed #cbd5e1', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: uploadData.file ? '#f0f9ff' : '#f8fafc' }}
                >
                  {uploadData.file ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <i className='bx bxs-file-pdf' style={{ fontSize: '2.5rem', color: '#ef4444' }}></i>
                      <div style={{ color: '#0f172a', fontWeight: '600', fontSize: '0.9rem', wordBreak: 'break-all' }}>{uploadData.file.name}</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ background: '#e2e8f0', color: '#475569', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className='bx bx-plus' style={{ fontSize: '1.25rem' }}></i>
                      </div>
                      <div style={{ color: '#334155', fontWeight: '600', fontSize: '0.9rem' }}>Click to select a file</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Document Type</label>
                <select name="type" style={{...inputStyle, cursor: 'pointer'}} value={uploadData.type} onChange={handleUploadChange}>
                  <option value="Contract">Contract</option>
                  <option value="SOW">SOW</option>
                  <option value="Tax Certificate">Tax Certificate</option>
                  <option value="Others">Others (please specify)</option>
                </select>
              </div>
              
              {uploadData.type === 'Others' && (
                <div>
                  <label style={labelStyle}>Specify Type</label>
                  <input type="text" name="otherType" style={inputStyle} placeholder="Enter document type..." value={uploadData.otherType} onChange={handleUploadChange} />
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button 
            onClick={onClose}
            style={{ padding: '0.6rem 1.2rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', color: '#475569', fontWeight: '600' }}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            style={{ padding: '0.6rem 1.5rem', background: '#0ea5e9', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white', fontWeight: '600' }}
          >
            {activeTab === 'connect' ? 'Connect Documents' : 'Upload & Connect'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default DocumentConnectModalV2;
