import React, { useState, useEffect } from 'react';
import { useGlobal } from '../context/GlobalContext';

function ViewExpensesModal({ isOpen, onClose, viewingExpense }) {
  const { showToast } = useGlobal();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !viewingExpense) return null;

  const formatCurrency = (amount) => {
    const num = Number(amount);
    return isNaN(num) ? amount : `$${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#dcfce7', color: '#166534' }}>Approved</span>;
      case 'Rejected':
        return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#fee2e2', color: '#991b1b' }}>Rejected</span>;
      case 'Settled':
        return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#e0e7ff', color: '#3730a3' }}>Settled</span>;
      case 'Revoked':
        return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#f3f4f6', color: '#4b5563' }}>Revoked</span>;
      default:
        return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#fef3c7', color: '#92400e' }}>{status || 'Pending'}</span>;
    }
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
        display: 'flex', justifyContent: 'center', alignItems: 'center'
      }}
    >
      <div style={{
        background: 'white', borderRadius: '12px', width: '90%', maxWidth: '600px',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ background: '#f8fafc', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className='bx bx-detail' style={{ color: '#3b82f6' }}></i> Expense Details
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '1.4rem', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }} onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
            <i className='bx bx-x'></i>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          
          {/* Expense Info Card */}
          <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1.25rem', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>Expense Type</span>
                <div style={{ color: '#0f172a', fontWeight: '600', fontSize: '0.95rem' }}>{viewingExpense.expenseType}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>Amount</span>
                <div style={{ color: '#3b82f6', fontWeight: '700', fontSize: '1.15rem' }}>{formatCurrency(viewingExpense.amount)}</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>Details</span>
                <div style={{ color: '#334155', fontSize: '0.9rem', lineHeight: '1.5' }}>{viewingExpense.details || '-'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Status</span>
                <div>{getStatusBadge(viewingExpense.status)}</div>
              </div>
              
              {(viewingExpense.status === 'Rejected' || viewingExpense.status === 'Revoked') && viewingExpense.rejectReason && (
                <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#991b1b', display: 'block', marginBottom: '0.35rem', fontWeight: '700' }}>
                    {viewingExpense.status === 'Revoked' ? 'Revocation Reason' : 'Rejection Reason'}
                  </span>
                  <div style={{ color: '#7f1d1d', fontSize: '0.95rem' }}>{viewingExpense.rejectReason}</div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Logs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <i className='bx bx-history' style={{ color: '#64748b', fontSize: '1.2rem' }}></i>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: '700' }}>Activity Logs</h3>
          </div>
          
          {viewingExpense.logs && viewingExpense.logs.length > 0 ? (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>Description</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>User</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingExpense.logs.map((log, i) => (
                    <tr key={i} style={{ borderBottom: i === viewingExpense.logs.length - 1 ? 'none' : '1px solid #e2e8f0', background: 'white' }}>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b', whiteSpace: 'nowrap' }}>{log.date}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>{log.description}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>{log.user}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ 
                          fontWeight: '600', 
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: log.status === 'Approved' ? '#dcfce7' : log.status === 'Rejected' ? '#fee2e2' : '#f1f5f9',
                          color: log.status === 'Approved' ? '#166534' : log.status === 'Rejected' ? '#991b1b' : '#475569' 
                        }}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '2.5rem 2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <i className='bx bx-receipt' style={{ fontSize: '2.5rem', color: '#cbd5e1', marginBottom: '0.75rem' }}></i>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>No activity logs available for this expense.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc' }}>
          <button 
            onClick={onClose}
            style={{ padding: '0.5rem 1.25rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', color: '#0f172a', fontWeight: '500', fontSize: '0.9rem' }}
          >
            Close
          </button>
        </div>

    </div>
  );
}

export default ViewExpensesModal;
