import React from 'react';

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "OK", cancelText = "Cancel" }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-modal" onClick={onClose}><i className='bx bx-x'></i></button>
        </div>
        <div className="modal-body">
          <p style={{ marginBottom: '1.5rem', lineHeight: '1.5', fontSize: '1rem', color: 'var(--text-main)' }}>
            {message}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button className="btn-primary" onClick={() => {
              onConfirm();
              onClose();
            }}>{confirmText}</button>
            <button className="btn-outline" onClick={onClose}>{cancelText}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
