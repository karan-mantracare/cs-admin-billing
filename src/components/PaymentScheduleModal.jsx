import React, { useState, useEffect } from 'react';

function PaymentScheduleModal({ isOpen, onClose, orderId }) {
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    if (isOpen && orderId) {
      try {
        const savedRecords = localStorage.getItem('client_payment_records');
        if (savedRecords) {
          const records = JSON.parse(savedRecords);
          const filtered = records.filter(r => String(r.orderId) === String(orderId));
          setSchedule(filtered);
        } else {
          setSchedule([]);
        }
      } catch (e) {
        console.error('Failed to load payment records', e);
        setSchedule([]);
      }
    } else if (isOpen) {
      setSchedule([]);
    }
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  const totalReceived = schedule.reduce((sum, item) => sum + (Number(item.amountInUSD) || Number(item.amount) || 0), 0);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'white', borderRadius: '12px', width: '90%', maxWidth: '520px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.18)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.05rem', color: 'white', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className='bx bx-calendar-check'></i> Payment Schedule
            </h2>
            <p style={{ margin: '0.15rem 0 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem' }}>
              {schedule.length > 0 ? `${schedule.length} payment${schedule.length > 1 ? 's' : ''} recorded` : 'No payments recorded yet'}
              {orderId ? ` · Order #${orderId}` : ''}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '6px', width: '30px', height: '30px', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Table */}
        <div style={{ padding: '1rem 1.25rem' }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.65rem 1rem', fontWeight: '600', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>#</th>
                  <th style={{ padding: '0.65rem 1rem', fontWeight: '600', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Amount (USD)</th>
                  <th style={{ padding: '0.65rem 1rem', fontWeight: '600', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Payment Date</th>
                  <th style={{ padding: '0.65rem 1rem', fontWeight: '600', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bank</th>
                </tr>
              </thead>
              <tbody>
                {schedule.length > 0 ? schedule.map((item, index) => (
                  <tr key={item.id || index} style={{ background: index % 2 === 0 ? 'white' : '#fafafa', borderBottom: index < schedule.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <td style={{ padding: '0.7rem 1rem', color: '#94a3b8', fontSize: '0.8rem' }}>{index + 1}</td>
                    <td style={{ padding: '0.7rem 1rem', color: '#10b981', fontWeight: '700' }}>
                      ${(Number(item.amountInUSD) || Number(item.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.7rem 1rem', color: '#0f172a' }}>{item.paymentDate || '—'}</td>
                    <td style={{ padding: '0.7rem 1rem', color: '#64748b', fontSize: '0.8rem' }}>{item.receivedBank || '—'}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ padding: '2.5rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <i className='bx bx-calendar-x' style={{ fontSize: '2rem', color: '#cbd5e1' }}></i>
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No payments recorded for this order yet.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              {schedule.length > 0 && (
                <tfoot>
                  <tr style={{ background: '#f0fdf4', borderTop: '2px solid #bbf7d0' }}>
                    <td colSpan="2" style={{ padding: '0.65rem 1rem', fontWeight: '700', color: '#10b981', fontSize: '0.9rem' }}>
                      Total Received
                    </td>
                    <td colSpan="2" style={{ padding: '0.65rem 1rem', fontWeight: '700', color: '#10b981', fontSize: '0.95rem', textAlign: 'right' }}>
                      ${totalReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc' }}>
          <button onClick={onClose} style={{ padding: '0.45rem 1.25rem', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentScheduleModal;
