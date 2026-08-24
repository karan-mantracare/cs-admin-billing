import { useState, useEffect } from 'react';

function ApprovalModal({ isOpen, onClose, pageTitle, pageDate, modalData, setModalData, isLocked, setIsLocked, status, onSubmit }) {
  const [tempParticipantCount, setTempParticipantCount] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTempParticipantCount(modalData.participantCount || '');
    }
  }, [isOpen, modalData.participantCount]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setModalData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (e.target.checkValidity()) {
      setIsLocked(true);
      if (onSubmit) onSubmit(modalData);
      alert("Approval Request Sent Successfully!");
      onClose();
    } else {
      e.target.reportValidity();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Request Approval</h2>
          <button className="close-modal" onClick={onClose}><i className='bx bx-x'></i></button>
        </div>
        <div className="modal-body">
          <form id="approvalForm" onSubmit={handleSubmit}>
            <h3 className="modal-section-title">Section One - Session Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Session Name</label>
                <input type="text" className="form-control" readOnly value={pageTitle} />
              </div>
              <div className="form-group">
                <label>Session Date</label>
                <input type="date" className="form-control" readOnly value={pageDate} />
              </div>
              <div className="form-group">
                <label>Client Name</label>
                <input type="text" className="form-control" readOnly value="MantraCare Internal" />
              </div>
              <div className="form-group">
                <label>Session Type *</label>
                <select className="form-control" required name="sessionType" value={modalData.sessionType} onChange={handleChange} disabled={isLocked}>
                  <option value="">Select Type</option>
                  <option value="online">Online</option>
                  <option value="onsite">Onsite</option>
                </select>
              </div>
              {modalData.sessionType === 'onsite' && (
                <div className="form-group full-width">
                  <label>Session Location (Full Address) *</label>
                  <textarea className="form-control" rows="2" name="sessionLocation" value={modalData.sessionLocation} onChange={handleChange} required disabled={isLocked}></textarea>
                </div>
              )}
            </div>

            <h3 className="modal-section-title mt-4">Section Two - Expert Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Expert Exp (no of Years) *</label>
                <input type="number" className="form-control" required min="0" name="expertExp" value={modalData.expertExp} onChange={handleChange} disabled={isLocked} />
              </div>
              <div className="form-group">
                <label>Gender Preference *</label>
                <select className="form-control" required name="genderPref" value={modalData.genderPref} onChange={handleChange} disabled={isLocked}>
                  <option value="">Select Preference</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non_binary">Non Binary</option>
                </select>
              </div>
            </div>

            <h3 className="modal-section-title mt-4">Section Three - Budget & Cost</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Budget (in USD) *</label>
                <input type="number" className="form-control" required min="0" name="budget" value={modalData.budget} onChange={handleChange} disabled={isLocked} />
              </div>
              
              {status === 'complete' && (
                <div className="form-group full-width">
                  <label>Update Participant Count</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="number" 
                      className="form-control" 
                      min="0" 
                      value={tempParticipantCount} 
                      onChange={(e) => setTempParticipantCount(e.target.value)} 
                    />
                    <button 
                      type="button" 
                      className="btn-primary" 
                      style={{ padding: '0 0.75rem', borderRadius: 'var(--radius-md)' }}
                      onClick={() => {
                        setModalData(prev => ({ ...prev, participantCount: tempParticipantCount }));
                        alert("Participant Count updated successfully!");
                        onClose();
                      }}
                      title="Update Participant Count"
                    >
                      <i className='bx bx-check' style={{ fontSize: '1.25rem' }}></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer mt-4" style={{ margin: '-1.5rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={isLocked}>
                {isLocked ? 'Approval Request Sent' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ApprovalModal;
