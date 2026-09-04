import React from 'react';

function ModificationRequestModal({ 
  isOpen, 
  onClose, 
  modificationData, 
  onAssignExpert, 
  onAcceptReschedule, 
  onRequestAnotherDate 
}) {
  if (!isOpen || !modificationData) return null;

  const isReschedule = modificationData.type === 'reschedule';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>{isReschedule ? 'Reschedule Request' : 'Change Expert Request'}</h2>
          <button className="close-modal" onClick={onClose}><i className='bx bx-x'></i></button>
        </div>
        <div className="modal-body">
          <div style={{ background: 'var(--bg-light)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ margin: '0' }}><strong>Session:</strong> {modificationData.sessionName}</p>
            <p style={{ margin: '0' }}><strong>Date/Time:</strong> {modificationData.sessionDate} at {modificationData.sessionTime}</p>
            <p style={{ margin: '0' }}><strong>Mode & Location:</strong> {modificationData.sessionType} - {modificationData.location}</p>
            {!isReschedule && <p style={{ margin: '0' }}><strong>Language:</strong> {modificationData.language}</p>}
            <p style={{ margin: '0', color: 'var(--orange)' }}><strong>Current Expert:</strong> {modificationData.assignedExpert}</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>Reason for Change:</p>
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              {modificationData.changeReason || 'No reason provided.'}
            </div>
          </div>

          {isReschedule && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>New Date Requested:</p>
              <div style={{ background: 'var(--bg-light)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--primary)', fontWeight: '600' }}>
                {modificationData.rescheduleDate || 'Date not specified'}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            {!isReschedule ? (
              <button className="btn-primary" onClick={onAssignExpert}>Assign Expert</button>
            ) : (
              <>
                <button className="btn-primary" style={{ background: 'var(--green)', borderColor: 'var(--green)' }} onClick={onAcceptReschedule}>Accept</button>
                <button className="btn-outline" onClick={onAssignExpert}>Update Expert</button>
                <button className="btn-outline" style={{ borderColor: 'var(--red)', color: 'var(--red)' }} onClick={onRequestAnotherDate}>Request Another Date</button>
              </>
            )}
            <button className="btn-outline" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModificationRequestModal;
