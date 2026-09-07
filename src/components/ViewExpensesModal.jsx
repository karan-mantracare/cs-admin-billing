import React from 'react';
import { useGlobal } from '../context/GlobalContext';

function ViewExpensesModal({ isOpen, onClose, orderId, onEditExpense }) {
  const { expenses } = useGlobal();

  if (!isOpen) return null;

  // Filter expenses associated with the current order
  const orderExpenses = expenses.filter(exp => String(exp.orderId) === String(orderId));

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
      default:
        return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#fef3c7', color: '#92400e' }}>Pending</span>;
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        background: 'white', borderRadius: '12px', width: '90%', maxWidth: '800px',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ background: '#f8fafc', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className='bx bx-list-ul' style={{ color: '#3b82f6' }}></i> Order Expenses
            </h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>View expenses submitted for this order</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer', padding: '0.5rem' }}>
            <i className='bx bx-x'></i>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          {orderExpenses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <i className='bx bx-receipt' style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }}></i>
              <p>No expenses have been submitted for this order yet.</p>
            </div>
          ) : (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>Category</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>Amount</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orderExpenses.map((exp, index) => (
                    <React.Fragment key={exp.id}>
                      <tr style={{ borderBottom: index === orderExpenses.length - 1 ? 'none' : '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.75rem 1rem' }}>{exp.date}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: '500', color: '#0f172a' }}>{exp.expenseType}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={exp.details}>{exp.details}</div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>{formatCurrency(exp.amount)}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{getStatusBadge(exp.status)}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          {exp.status === 'Rejected' && (
                            <button 
                              onClick={() => onEditExpense(exp)}
                              style={{ padding: '0.35rem 0.75rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', color: '#0f172a', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: '500' }}
                            >
                              <i className='bx bx-edit'></i> Edit & Resubmit
                            </button>
                          )}
                        </td>
                      </tr>
                      {exp.status === 'Rejected' && exp.rejectReason && (
                        <tr style={{ background: '#fff5f5', borderBottom: index === orderExpenses.length - 1 ? 'none' : '1px solid #e2e8f0' }}>
                          <td colSpan="5" style={{ padding: '0.5rem 1rem 0.75rem 1rem', fontSize: '0.85rem', color: '#991b1b' }}>
                            <strong>Rejection Reason:</strong> {exp.rejectReason}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
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
    </div>
  );
}

export default ViewExpensesModal;
