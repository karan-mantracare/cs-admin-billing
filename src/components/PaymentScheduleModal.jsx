import React from 'react';

function PaymentScheduleModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  // Real schedule data would be fetched or passed in via props
  const schedule = [];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        background: 'white', borderRadius: '8px', width: '90%', maxWidth: '500px',
        padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Payment Schedule</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>
            &times;
          </button>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Amount</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Payment Received Date</th>
              </tr>
            </thead>
            <tbody>
              {schedule.length > 0 ? schedule.map((item, index) => (
                <tr key={item.id} style={{ background: 'white', borderBottom: index < schedule.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                  <td style={{ padding: '0.75rem 1rem', color: '#0f172a', fontWeight: '500' }}>${item.amount}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{item.date}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="2" style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>
                    No payment schedule available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '0.5rem 1rem', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentScheduleModal;
