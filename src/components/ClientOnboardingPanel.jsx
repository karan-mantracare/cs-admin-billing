import React from 'react';
import ClientOnboardingWizard from './ClientOnboardingWizard';

function ClientOnboardingPanel({ isOpen, onClose, onSuccess, initialData }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div 
        style={{
          width: '800px',
          maxWidth: '100%',
          height: '100%',
          backgroundColor: '#f8fafc',
          boxShadow: '-10px 0 25px -5px rgba(0, 0, 0, 0.1)',
          animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <ClientOnboardingWizard onClose={onClose} onSuccess={onSuccess} initialData={initialData} />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}} />
    </div>
  );
}

export default ClientOnboardingPanel;
