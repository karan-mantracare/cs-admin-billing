const fs = require('fs');
const file = 'src/pages/AddOrder.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update useGlobal
content = content.replace(
  'const { showToast, expenses, updateExpense } = useGlobal();',
  'const { showToast, expenses, updateExpense, events, updateExpenseStatus } = useGlobal();'
);

// 2. Update states
content = content.replace(
  'const [isViewExpensesModalOpen, setIsViewExpensesModalOpen] = useState(false);',
  'const [viewingExpense, setViewingExpense] = useState(null);'
);

// 3. Update expandedSections & helpers
const expandedSectionsRegex = /const \[expandedSections, setExpandedSections\] = useState\(\{[\s\S]*?accessSecurity: true\n\s*\}\);/;
const replacementHelpers = `const [expandedSections, setExpandedSections] = useState({
    contractDetails: false,
    planSchedule: true,
    details: true,
    addOns: true,
    appConfig: true,
    accessSecurity: true,
    expenseDetails: true
  });

  const orderExpenses = expenses.filter(exp => {
    const targetOrderId = location.state?.orderId || tempSessionId;
    if (String(exp.orderId) === String(targetOrderId)) return true;
    if (exp.eventId && formData.orderName) {
      const relatedEvent = events?.find(ev => String(ev.id) === String(exp.eventId));
      if (relatedEvent && String(relatedEvent.orderName) === String(formData.orderName)) {
        return true;
      }
    }
    return false;
  });

  const formatCurrency = (amount) => {
    const num = Number(amount);
    return isNaN(num) ? amount : \`$\${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}\`;
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

  const handleSettleExpense = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Settle Expense',
      message: 'Are you sure you want to mark this expense as settled? This will update the status and log the action.',
      confirmText: 'Confirm Settle',
      onConfirm: () => {
        updateExpenseStatus(id, 'Settled', 'Expense settled by CS');
        showToast('Expense marked as settled', 5000);
      }
    });
  };`;
content = content.replace(expandedSectionsRegex, replacementHelpers);

// 4. Inject Expense Details section and fix footer buttons
const actionFooterRegex = /\{\/\* Action Footer \*\/\}\s*<div style=\{\{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '1rem', marginBottom: '2rem', gap: '1rem' \}\}>\s*<button[\s\S]*?View Expenses[\s\S]*?<\/button>\s*<button[\s\S]*?Add Expenses[\s\S]*?<\/button>\s*<div style=\{\{ display: 'flex', alignItems: 'center', gap: '0\.75rem', marginLeft: 'auto' \}\}>/;

const expenseDetailsReplacement = `{/* Expense Details Section */}
      <div style={cardStyle}>
        <div 
          onClick={() => toggleSection('expenseDetails')}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedSections.expenseDetails ? '1.5rem' : '0', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a', fontWeight: '700', fontSize: '1rem' }}>
            <div style={iconBoxStyle}><i className='bx bx-credit-card-front'></i></div>
            <span>Expense Details</span>
          </div>
          <i className={\`bx bx-chevron-\${expandedSections.expenseDetails ? 'up' : 'down'}\`} style={{ fontSize: '1.5rem', color: '#94a3b8' }}></i>
        </div>
        
        {expandedSections.expenseDetails && (
        <div style={{ marginTop: '0.5rem' }}>
          {orderExpenses.length === 0 ? (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '3rem 1rem', textAlign: 'center', color: '#0f172a', fontWeight: '500', fontSize: '0.9rem' }}>
              <p style={{ margin: 0 }}>No expenses available.</p>
            </div>
          ) : (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expense Type</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount (USD)</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orderExpenses.map((exp, index) => (
                    <tr key={exp.id} style={{ borderBottom: index === orderExpenses.length - 1 ? 'none' : '1px solid #e2e8f0', background: 'white' }}>
                      <td style={{ padding: '0.75rem 1rem', color: '#334155', fontWeight: '500' }}>{exp.expenseType}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={exp.details}>{exp.details || '-'}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#0f172a', fontWeight: '600' }}>{formatCurrency(exp.amount)}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{getStatusBadge(exp.status)}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', display: 'flex', gap: '0.25rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button 
                          onClick={() => setViewingExpense(exp)}
                          style={{ padding: '0.35rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: '1.2rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          title="View Details"
                        >
                          <i className='bx bx-show'></i>
                        </button>
                        {exp.status === 'Approved' && (
                          <button 
                            onClick={() => handleSettleExpense(exp.id)}
                            style={{ padding: '0.35rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#10b981', fontSize: '1.2rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Settle Expense"
                          >
                            <i className='bx bx-check-double'></i>
                          </button>
                        )}
                        {(exp.status === 'Rejected' || exp.status === 'Revoked') && (
                          <button 
                            onClick={() => {
                              setEditExpenseData(exp);
                              setIsAddExpenseModalOpen(true);
                            }}
                            style={{ padding: '0.35rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: '1.2rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: '0.25rem' }}
                            title="Edit & Resubmit"
                          >
                            <i className='bx bx-edit'></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button 
              onClick={() => {
                setEditExpenseData(null);
                setIsAddExpenseModalOpen(true);
              }}
              style={{ padding: '0.5rem 1.25rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 1px 2px rgba(99, 102, 241, 0.2)' }}
            >
              Add Expense
            </button>
          </div>
        </div>
        )}
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '1rem', marginBottom: '2rem', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>`;
content = content.replace(actionFooterRegex, expenseDetailsReplacement);

// 5. Update ViewExpensesModal usage
const viewModalRegex = /<ViewExpensesModal[\s\S]*?onEdit=\{\(expense\) => \{[\s\S]*?\}\}\s*\/>/;
const viewModalReplacement = `<ViewExpensesModal
        isOpen={!!viewingExpense}
        onClose={() => setViewingExpense(null)}
        viewingExpense={viewingExpense}
      />`;
content = content.replace(viewModalRegex, viewModalReplacement);

fs.writeFileSync(file, content);
console.log('Patched correctly');
