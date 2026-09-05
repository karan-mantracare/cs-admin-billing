import { useState, useEffect } from 'react';
import { useGlobal } from '../context/GlobalContext';
import LanguageDropdown from './LanguageDropdown';

function ApprovalModal({ isOpen, onClose, pageTitle, pageDate, modalData, setModalData, isLocked, setIsLocked, status, onSubmit, isHrRole }) {
  const [tempParticipantCount, setTempParticipantCount] = useState('');
  const { showToast } = useGlobal();

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
      showToast("Approval Request Sent Successfully!", 5000);
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
          {modalData.status?.toLowerCase() === 'rejected' && (
            <div style={{ background: 'var(--bg-light)', border: '1px solid var(--red)', borderLeft: '4px solid var(--red)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--red)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className='bx bx-error-circle'></i> Request Rejected
              </h4>
              <p style={{ margin: 0, color: 'var(--text-color)' }}>
                <strong>Reason:</strong> {modalData.rejectionReason || 'No reason provided.'}
              </p>
            </div>
          )}
          <form id="approvalForm" onSubmit={handleSubmit}>
            {!isHrRole && <h3 className="modal-section-title">Section One - Session Information</h3>}
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
                <label>Session Time *</label>
                <input type="time" className="form-control" required name="sessionTime" value={modalData.sessionTime || ''} onChange={handleChange} disabled={isLocked} />
              </div>
              <div className="form-group">
                <label>Duration (in Min) *</label>
                <input type="number" className="form-control" required min="0" name="duration" value={modalData.duration || ''} onChange={handleChange} disabled={isLocked} />
              </div>
              <div className="form-group">
                <label>Client Name</label>
                <input type="text" className="form-control" readOnly value="MantraCare Internal" />
              </div>
              {isHrRole && (
                <div className="form-group">
                  <label>Gender Preference *</label>
                  <select className="form-control" required name="genderPref" value={modalData.genderPref} onChange={handleChange} disabled={isLocked}>
                    <option value="">Select Preference</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non_binary">Non Binary</option>
                  </select>
                </div>
              )}
              {!isHrRole && (
                <>
                  <div className="form-group">
                    <label>Session Type *</label>
                    <select 
                      className="form-control" 
                      required 
                      name="sessionType" 
                      value={modalData.sessionType} 
                      onChange={handleChange} 
                      disabled={isLocked}
                      style={{
                        color: modalData.sessionType === 'onsite' ? 'var(--orange)' : modalData.sessionType === 'online' ? 'var(--primary)' : '',
                        fontWeight: modalData.sessionType ? '500' : 'normal'
                      }}
                    >
                      <option value="">Select Type</option>
                      <option value="online" style={{ color: 'var(--primary)', fontWeight: '500' }}>Online</option>
                      <option value="onsite" style={{ color: 'var(--orange)', fontWeight: '500' }}>Onsite</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Language *</label>
                    <LanguageDropdown 
                      value={modalData.language} 
                      onChange={(val) => setModalData(prev => ({ ...prev, language: val }))} 
                      disabled={isLocked}
                    />
                  </div>
                  {modalData.sessionType === 'onsite' && (
                    <div className="form-group full-width">
                      <label>Session Location (Full Address) *</label>
                      <textarea className="form-control" rows="2" name="sessionLocation" value={modalData.sessionLocation} onChange={handleChange} required disabled={isLocked}></textarea>
                    </div>
                  )}
                </>
              )}
            </div>

            {!isHrRole && (
              <>
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
              </>
            )}

            {!isHrRole && (
              <>
                <h3 className="modal-section-title mt-4">Section Three - Budget & Cost</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Budget (in USD) *</label>
                    <input type="number" className="form-control" required min="0" name="budget" value={modalData.budget} onChange={handleChange} disabled={isLocked} />
                  </div>
                  
                  {(status === 'complete' || status === 'approved') && (
                    <div className="form-group">
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
                            const updatedData = { ...modalData, participantCount: tempParticipantCount };
                            setModalData(updatedData);
                            if (onSubmit) {
                              onSubmit(updatedData);
                            }
                            showToast("Participant Count updated successfully!", 5000);
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
              </>
            )}
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isLocked}>
                  {isLocked ? 'Submitting...' : 
                 (modalData.status?.toLowerCase() === 'rejected' ? 'Resubmit Request' : (isHrRole ? 'Request Session' : 'Submit'))}
                </button>
              </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ApprovalModal;
