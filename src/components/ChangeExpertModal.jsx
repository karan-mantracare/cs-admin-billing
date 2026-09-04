import React, { useState } from 'react';

function ChangeExpertModal({ isOpen, onClose, sessionData, onSubmitRequest }) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
        <div className="modal-header">
          <h2>Change Expert</h2>
          <button className="close-modal" onClick={onClose}><i className='bx bx-x'></i></button>
        </div>
        <div className="modal-body">
          <p style={{ marginBottom: '1.5rem', lineHeight: '1.5' }}>
            You are requesting to change the assigned expert for this session. This will send a notification to HR to reassign an expert.
          </p>
          
          <div style={{ background: 'var(--bg-light)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <p style={{ margin: '0 0 0.5rem 0' }}><strong>Session:</strong> {sessionData?.sessionName}</p>
            <p style={{ margin: '0 0 0.5rem 0' }}><strong>Date/Time:</strong> {sessionData?.sessionDate} at {sessionData?.sessionTime}</p>
            <p style={{ margin: '0 0 0.5rem 0' }}><strong>Mode & Location:</strong> {sessionData?.sessionType} - {sessionData?.location}</p>
            <p style={{ margin: '0', color: 'var(--orange)' }}><strong>Current Expert:</strong> {sessionData?.assignedExpert}</p>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Reason for Change <span className="text-red">*</span></label>
            <textarea 
              className="form-control" 
              rows="3" 
              placeholder="Please explain why you need to change the expert..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button 
              className="btn-primary" 
              onClick={() => {
                if (!reason.trim()) {
                  alert('Please provide a reason for the change.');
                  return;
                }
                onSubmitRequest(reason);
                setReason('');
              }}
            >
              Submit Request
            </button>
            <button className="btn-outline" onClick={() => {
              onClose();
              setReason('');
            }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangeExpertModal;
