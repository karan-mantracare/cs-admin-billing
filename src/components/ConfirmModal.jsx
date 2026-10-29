import React, { useEffect } from 'react';

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "OK", cancelText = "Cancel" }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isWarning = title?.toLowerCase().includes('exist') || title?.toLowerCase().includes('warn') || title?.toLowerCase().includes('schedule');
  const isDanger = title?.toLowerCase().includes('delete') || title?.toLowerCase().includes('remove');

  const iconColor = isDanger ? '#dc2626' : (isWarning ? '#d97706' : '#2563eb');
  const iconBg = isDanger ? '#fef2f2' : (isWarning ? '#fffbeb' : '#eff6ff');
  const iconBorder = isDanger ? '#fecaca' : (isWarning ? '#fde68a' : '#bfdbfe');
  const iconClass = isDanger ? 'bx-trash' : (isWarning ? 'bx-error-alt' : 'bx-info-circle');
  const confirmBtnGradient = isDanger 
    ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
    : (isWarning ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #0284c7, #0ea5e9)');

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.15s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()} 
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Accent Bar */}
        <div style={{ height: '4px', background: confirmBtnGradient }} />

        {/* Header & Body */}
        <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', marginBottom: '1rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: iconBg,
              border: `1px solid ${iconBorder}`,
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.45rem',
              flexShrink: 0
            }}>
              <i className={`bx ${iconClass}`}></i>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                  {title}
                </h3>
                <button 
                  onClick={onClose} 
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.3rem', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
                >
                  <i className='bx bx-x'></i>
                </button>
              </div>
            </div>
          </div>

          <p style={{ margin: 0, lineHeight: '1.55', fontSize: '0.9rem', color: '#475569', background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            {message}
          </p>
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.85rem 1.5rem',
          background: '#f8fafc',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
          <button 
            type="button" 
            onClick={onClose}
            style={{
              padding: '0.55rem 1.15rem',
              background: '#ffffff',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
          >
            {cancelText}
          </button>
          <button 
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              padding: '0.55rem 1.35rem',
              background: confirmBtnGradient,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.05)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            <i className='bx bx-check'></i> {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
