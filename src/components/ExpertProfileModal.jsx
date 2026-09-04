import React from 'react';

function ExpertProfileModal({ isOpen, onClose, expertName }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2>Expert Profile</h2>
          <button className="close-modal" onClick={onClose}><i className='bx bx-x'></i></button>
        </div>
        <div className="modal-body text-center">
          <div style={{ fontSize: '4rem', color: 'var(--primary)', marginBottom: '1rem' }}>
            <i className='bx bxs-user-circle'></i>
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>{expertName}</h3>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>Senior Wellness Coach</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left', background: 'var(--bg-light)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Experience</p>
              <p style={{ margin: '0', fontWeight: '600' }}>10+ Years</p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Rating</p>
              <p style={{ margin: '0', fontWeight: '600', color: 'var(--orange)' }}><i className='bx bxs-star'></i> 4.9/5</p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Specialties</p>
              <p style={{ margin: '0', fontWeight: '600' }}>Mindfulness, Stress Management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpertProfileModal;
