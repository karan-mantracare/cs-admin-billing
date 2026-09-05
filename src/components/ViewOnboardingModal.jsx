import React from 'react';

function ViewOnboardingModal({ isOpen, onClose, data }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div 
        style={{
          width: '100%',
          maxWidth: '700px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', background: '#f0fdf4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <i className='bx bx-file' style={{ fontSize: '1.5rem' }}></i>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: '600' }}>Onboarding Details</h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Filed on 05 Sep 2026</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
            <i className='bx bx-x' style={{ fontSize: '1.25rem' }}></i>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
          
          {/* Key SPOC */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key SPOC</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#64748b' }}>Name</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: '500' }}>{data?.keySpoc?.name || 'N/A'}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#64748b' }}>Email</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: '500' }}>{data?.keySpoc?.email || 'N/A'}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#64748b' }}>Contact Number</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: '500' }}>{data?.keySpoc?.contact || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Escalation SPOCs */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Escalation Contacts</h3>
            {data?.escalationSpocs?.map((spoc, idx) => (
              <div key={idx} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#64748b' }}>Name</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: '500' }}>{spoc.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#64748b' }}>Designation</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: '500' }}>{spoc.designation || 'N/A'}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#64748b' }}>Email</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: '500' }}>{spoc.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#64748b' }}>Contact Number</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: '500' }}>{spoc.contact || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Billing Details */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Billing Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#64748b' }}>Company Name</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: '500' }}>{data?.billingDetails?.companyName || 'N/A'}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#64748b' }}>GST / Tax Number</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: '500' }}>{data?.billingDetails?.gstNumber || 'N/A'}</p>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#64748b' }}>Address</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: '500' }}>{data?.billingDetails?.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Billing SPOCs */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Billing / Payment SPOCs</h3>
            {data?.billingSpocs?.map((spoc, idx) => (
              <div key={idx} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#64748b' }}>Name</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: '500' }}>{spoc.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#64748b' }}>Department</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: '500' }}>{spoc.department || 'N/A'}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#64748b' }}>Email</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: '500' }}>{spoc.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#64748b' }}>Contact Number</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: '500' }}>{spoc.contact || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Expectations */}
          <div>
            <h3 style={{ fontSize: '0.9rem', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expectations</h3>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', lineHeight: '1.5' }}>
                {data?.expectations || 'No expectations provided.'}
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{ 
              padding: '0.5rem 1.5rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
          >
            Close
          </button>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}} />
    </div>
  );
}

export default ViewOnboardingModal;
