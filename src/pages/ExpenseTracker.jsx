import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { getPrimaryCS } from '../utils/roleUtils';

function ExpenseTracker() {
  const navigate = useNavigate();
  const { expenses: allExpenses, resetExpenses, clients } = useGlobal();
  const globalExpenses = allExpenses;

  const [expenses, setExpenses] = useState([
    {
      id: 1,
      clientName: 'Sample 1',
      division: 'Healthcare',
      divisionStatus: 'Active',
      csResponsible: 'John Doe',
      orderName: 'Wellness Plan 2026',
      orderActive: 'Yes',
      orderStatus: 'In Progress',
      startDate: '2026-01-15',
      endDate: '2027-01-15',
      employeeCovered: 500,
      engagements: 120,
      contractAmount: 15000,
      sessionCount: 50,
      orderEndDate: '2027-01-15',
      totalOrderAmount: 15000,
      totalReceived: 5000,
      totalDue: 10000,
      totalSessionCost: 1500,
      totalWebinarCost: 2000,
      otherCost: 300,
    },
    {
      id: 2,
      clientName: 'Sample 2',
      division: 'Wellness',
      divisionStatus: 'Active',
      csResponsible: 'Jane Smith',
      orderName: 'Corp Wellness 2026',
      orderActive: 'Yes',
      orderStatus: 'Completed',
      startDate: '2025-06-30',
      endDate: '2026-06-30',
      employeeCovered: 200,
      engagements: 80,
      contractAmount: 8000,
      sessionCount: 20,
      orderEndDate: '2026-06-30',
      totalOrderAmount: 8000,
      totalReceived: 8000,
      totalDue: 0,
      totalSessionCost: 2000,
      totalWebinarCost: 1200,
      otherCost: 150,
    },
    {
      id: 3,
      clientName: 'Sample 3',
      division: 'Tech',
      divisionStatus: 'Inactive',
      csResponsible: 'Mike Johnson',
      orderName: 'Tech Corp Plan',
      orderActive: 'No',
      orderStatus: 'Cancelled',
      startDate: '2025-08-01',
      endDate: '2026-08-01',
      employeeCovered: 100,
      engagements: 30,
      contractAmount: 5000,
      sessionCount: 10,
      orderEndDate: '2026-08-01',
      totalOrderAmount: 5000,
      totalReceived: 1000,
      totalDue: 4000,
      totalSessionCost: 300,
      totalWebinarCost: 0,
      otherCost: 50,
    }
  ]);

  useEffect(() => {
    const loadOrdersAndExpenses = () => {
      const savedOrders = localStorage.getItem('division_orders');
      if (savedOrders) {
        try {
          const parsedOrders = JSON.parse(savedOrders);
          const newExpenses = parsedOrders.map((o, idx) => {
            const client = (clients || []).find(c => c.clientName === o.clientName) || {};
            const csResponsible = getPrimaryCS(o.divisionId, o.divisionName, o.clientName, client);

            const contractAmount = Number(o.billingDetails?.amountInUSD || o.amount || 0);

            const savedPayments = localStorage.getItem('client_payments');
            let totalReceived = 0;
            if (savedPayments) {
              const allPayments = JSON.parse(savedPayments);
              const orderPayments = allPayments.filter(p => String(p.orderId) === String(o.id));
              totalReceived = orderPayments.reduce((acc, curr) => acc + (Number(curr.totalPaid) || 0), 0);
            }
            const totalDue = Math.max(0, contractAmount - totalReceived);

            return {
              id: `order_${o.id || idx}`,
              clientName: o.clientName || 'Unknown',
              division: o.divisionName || 'Unknown',
              divisionStatus: 'Active',
              csResponsible: csResponsible,
              orderName: `${o.divisionName || 'Unknown'} | ${o.planStart} - ${o.plan}`,
              orderActive: o.status === 'Active' ? 'Yes' : 'No',
              orderStatus: o.status || 'Active',
              startDate: o.planStart || '-',
              endDate: o.planEnd || '-',
              employeeCovered: o.employees || 0,
              engagements: 0,
              contractAmount: contractAmount,
              sessionCount: 0,
              orderEndDate: o.planEnd || '-',
              totalOrderAmount: contractAmount,
              totalReceived: totalReceived,
              totalDue: totalDue,
              totalSessionCost: 0,
              totalWebinarCost: 0,
              otherCost: 0
            };
          });

          setExpenses(prev => {
            const baseExpenses = prev.filter(p => typeof p.id === 'number');
            return [...baseExpenses, ...newExpenses];
          });
        } catch (err) {
          console.error('Failed to parse orders', err);
        }
      }
    };

    loadOrdersAndExpenses();
    window.addEventListener('storage', loadOrdersAndExpenses);
    return () => window.removeEventListener('storage', loadOrdersAndExpenses);
  }, [clients]);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Health Score state with persistence
  const [healthScores, setHealthScores] = useState(() => {
    const saved = localStorage.getItem('client_pl_health_scores');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return {}; }
    }
    return {
      1: 'Healthy',
      2: 'Moderate',
      3: 'Risky'
    };
  });

  const handleHealthScoreChange = (id, newScore) => {
    setHealthScores(prev => {
      const updated = { ...prev, [id]: newScore };
      localStorage.setItem('client_pl_health_scores', JSON.stringify(updated));
      return updated;
    });
  };

  const getHealthStyle = (score) => {
    switch (score) {
      case 'Healthy':
        return { bg: '#dcfce7', color: '#15803d', border: '#86efac' };
      case 'Moderate':
        return { bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
      case 'Risky':
        return { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
    }
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const enrichedExpenses = useMemo(() => {
    return expenses.map(exp => {
      const clientExpenses = globalExpenses.filter(ge => {
        const orderIdMatch = ge.orderId ? String(ge.orderId) === String(exp.id).replace('order_', '') : ge.orderName === exp.orderName;
        return orderIdMatch && ge.expenseType !== 'Expert-Request' && ge.status === 'Settled';
      });
      const calculatedOtherCost = clientExpenses.reduce((sum, current) => sum + current.amount, 0);
      return { ...exp, otherCost: exp.otherCost + calculatedOtherCost };
    });
  }, [expenses, globalExpenses]);

  const filteredExpenses = enrichedExpenses.filter(exp =>
    (exp.division && exp.division.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (exp.orderName && exp.orderName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (exp.csResponsible && exp.csResponsible.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (exp.clientName && exp.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sorting Logic
  const sortedExpenses = useMemo(() => {
    let sortableItems = [...filteredExpenses];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle calculated Net Revenue sorting
        if (sortConfig.key === 'netRevenue') {
          aValue = a.totalReceived - a.totalSessionCost - a.otherCost;
          bValue = b.totalReceived - b.totalSessionCost - b.otherCost;
        }

        // Handle Health Score sorting
        if (sortConfig.key === 'healthScore') {
          const rank = { 'Healthy': 3, 'Moderate': 2, 'Risky': 1 };
          const aScore = healthScores[a.id] || (a.totalReceived - a.totalSessionCost - a.otherCost > 4000 ? 'Healthy' : ((a.totalReceived - a.totalSessionCost - a.otherCost >= 1000) ? 'Moderate' : 'Risky'));
          const bScore = healthScores[b.id] || (b.totalReceived - b.totalSessionCost - b.otherCost > 4000 ? 'Healthy' : ((b.totalReceived - b.totalSessionCost - b.otherCost >= 1000) ? 'Moderate' : 'Risky'));
          aValue = rank[aScore] || 0;
          bValue = rank[bScore] || 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredExpenses, sortConfig, healthScores]);

  // Pagination Logic
  const totalItems = sortedExpenses.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedExpenses = sortedExpenses.slice(startIndex, startIndex + rowsPerPage);

  // Summary Logic
  const sumOrderAmount = filteredExpenses.reduce((sum, e) => sum + e.totalOrderAmount, 0);
  const sumReceived = filteredExpenses.reduce((sum, e) => sum + e.totalReceived, 0);
  const sumDue = filteredExpenses.reduce((sum, e) => sum + e.totalDue, 0);

  const totalProfit = filteredExpenses.reduce((sum, e) => {
    return sum + (e.totalReceived - e.totalSessionCost - e.otherCost);
  }, 0);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <i className='bx bx-sort' style={{ color: '#cbd5e1', marginLeft: '4px' }}></i>;
    return sortConfig.direction === 'asc' 
      ? <i className='bx bx-sort-up' style={{ color: '#3b82f6', marginLeft: '4px' }}></i> 
      : <i className='bx bx-sort-down' style={{ color: '#3b82f6', marginLeft: '4px' }}></i>;
  };

  const formatCurrency = (amount) => `$${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <main className="main-content expense-tracker-page">
      <style>{`
        .expense-tracker-page .table-container {
          overflow-x: auto;
          width: 100%;
        }
        .expense-tracker-page .data-table {
          table-layout: fixed;
          width: max-content;
          min-width: 100%;
        }
        .expense-tracker-page .data-table th,
        .expense-tracker-page .data-table td {
          font-size: 12px !important;
          padding: 6px 8px !important;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .expense-tracker-page .data-table th {
          resize: horizontal;
          min-width: 80px;
          width: 100px;
        }
        .expense-tracker-page .badge {
          font-size: 11px !important;
          padding: 3px 8px !important;
        }
        .text-right { text-align: right !important; }
        .et-stat-card {
          flex: 1;
          background: white;
          border-radius: 10px;
          padding: 1rem 1.25rem;
          border: 1px solid var(--border-color);
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          gap: 0.85rem;
          border-left: 4px solid;
        }
        .et-stat-icon {
          width: 40px; height: 40px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
          flex-shrink: 0;
        }
        .et-stat-label { font-size: 0.72rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
        .et-stat-value { font-size: 1.15rem; font-weight: 800; margin-top: 0.1rem; }
      `}</style>

      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a', fontWeight: '700' }}>Client P&amp;L</h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>Revenue vs. cost breakdown per client order</p>
        </div>
        <button className="btn-outline" style={{ borderColor: 'var(--red)', color: 'var(--red)', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => {
          if (window.confirm('Are you sure you want to delete all expenses on this page?')) {
            resetExpenses();
            window.location.reload();
          }
        }}>
          <i className='bx bx-reset'></i> Reset Expenses
        </button>
      </div>

      {/* Summary Dashboard */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Order Value', value: formatCurrency(sumOrderAmount), color: '#1e40af', bg: '#eff6ff', icon: 'bx-file-blank', border: '#3b82f6' },
          { label: 'Total Received', value: formatCurrency(sumReceived), color: '#15803d', bg: '#f0fdf4', icon: 'bx-check-circle', border: '#22c55e' },
          { label: 'Total Due', value: formatCurrency(sumDue), color: '#b45309', bg: '#fffbeb', icon: 'bx-time-five', border: '#f59e0b' },
          { label: 'Net Revenue', value: formatCurrency(totalProfit), color: totalProfit >= 0 ? '#0369a1' : '#b91c1c', bg: totalProfit >= 0 ? '#f0f9ff' : '#fff5f5', icon: totalProfit >= 0 ? 'bx-trending-up' : 'bx-trending-down', border: totalProfit >= 0 ? '#0ea5e9' : '#ef4444' },
        ].map(s => (
          <div key={s.label} className="et-stat-card" style={{ borderLeftColor: s.border }}>
            <div className="et-stat-icon" style={{ background: s.bg, color: s.color }}>
              <i className={`bx ${s.icon}`}></i>
            </div>
            <div>
              <div className="et-stat-label">{s.label}</div>
              <div className="et-stat-value" style={{ color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="search-input-wrapper">
          <i className='bx bx-search'></i>
          <input
            type="text"
            className="search-input"
            placeholder="Search Division, Order or CS Responsible..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="text-right" style={{ width: '50px' }}>S. NO.</th>
              <th onClick={() => requestSort('division')} style={{ cursor: 'pointer' }}>DIVISION {getSortIcon('division')}</th>
              <th onClick={() => requestSort('csResponsible')} style={{ cursor: 'pointer' }}>CS RESPONSIBLE {getSortIcon('csResponsible')}</th>
              <th onClick={() => requestSort('orderName')} style={{ cursor: 'pointer' }}>ORDER NAME {getSortIcon('orderName')}</th>
              <th onClick={() => requestSort('orderStatus')} style={{ cursor: 'pointer' }}>ORDER STATUS {getSortIcon('orderStatus')}</th>
              <th className="text-right" onClick={() => requestSort('startDate')} style={{ cursor: 'pointer' }}>START DATE {getSortIcon('startDate')}</th>
              <th className="text-right" onClick={() => requestSort('endDate')} style={{ cursor: 'pointer' }}>END DATE {getSortIcon('endDate')}</th>
              <th className="text-right" onClick={() => requestSort('engagements')} style={{ cursor: 'pointer' }}>ENGAGEMENTS {getSortIcon('engagements')}</th>
              <th className="text-right" onClick={() => requestSort('sessionCount')} style={{ cursor: 'pointer' }}>SESSION COUNT {getSortIcon('sessionCount')}</th>
              <th className="text-right" onClick={() => requestSort('contractAmount')} style={{ cursor: 'pointer' }}>CONTRACT AMOUNT {getSortIcon('contractAmount')}</th>
              <th className="text-right" onClick={() => requestSort('totalReceived')} style={{ cursor: 'pointer' }}>AMOUNT RECEIVED {getSortIcon('totalReceived')}</th>
              <th className="text-right" onClick={() => requestSort('totalDue')} style={{ cursor: 'pointer' }}>AMOUNT DUE {getSortIcon('totalDue')}</th>
              <th className="text-right" onClick={() => requestSort('totalSessionCost')} style={{ cursor: 'pointer' }}>SESSION COST {getSortIcon('totalSessionCost')}</th>
              <th className="text-right" onClick={() => requestSort('otherCost')} style={{ cursor: 'pointer' }}>OTHER COST {getSortIcon('otherCost')}</th>
              <th className="text-right" onClick={() => requestSort('netRevenue')} style={{ cursor: 'pointer' }}>NET REVENUE {getSortIcon('netRevenue')}</th>
              <th className="text-center" onClick={() => requestSort('healthScore')} style={{ cursor: 'pointer' }}>HEALTH SCORE {getSortIcon('healthScore')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedExpenses.map((exp, index) => {
              const netRevenue = exp.totalReceived - exp.totalSessionCost - exp.otherCost;
              const margin = exp.totalReceived > 0 ? (netRevenue / exp.totalReceived) * 100 : 0;
              let revenueColor = 'var(--red)';
              if (margin > 40) revenueColor = 'var(--green)';
              else if (margin >= 11) revenueColor = 'var(--orange)';

              const currentScore = healthScores[exp.id] || (margin > 40 ? 'Healthy' : (margin >= 11 ? 'Moderate' : 'Risky'));
              const scoreStyle = getHealthStyle(currentScore);

              return (
                <tr key={exp.id}>
                  <td className="text-right">{startIndex + index + 1}</td>

                  {/* Division (hyperlinked) */}
                  <td 
                    style={{ cursor: 'pointer', color: '#0284c7', fontWeight: '600' }}
                    onClick={() => {
                      const divId = exp.divisionId || exp.id;
                      navigate(`/corporate/division/edit?id=${divId}`, { 
                        state: { 
                          division: { 
                            id: divId,
                            divisionName: exp.division, 
                            clientName: exp.clientName 
                          } 
                        } 
                      });
                    }}
                    title={`Open Division: ${exp.division}`}
                  >
                    <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                      {exp.division}
                    </span>
                  </td>

                  {/* CS Responsible */}
                  <td>{exp.csResponsible || 'Unassigned'}</td>

                  {/* Order Name (hyperlinked) */}
                  <td 
                    style={{ cursor: 'pointer', color: '#0284c7', fontWeight: '500' }}
                    onClick={() => {
                      const cleanOrderId = String(exp.id).replace('order_', '');
                      navigate(`/corporate/division/order/edit/${cleanOrderId}`, { 
                        state: { 
                          edit: true, 
                          orderId: cleanOrderId, 
                          clientName: exp.clientName, 
                          divisionName: exp.division 
                        } 
                      });
                    }}
                    title={`Open Order: ${exp.orderName}`}
                  >
                    <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                      {exp.orderName}
                    </span>
                  </td>

                  {/* Order Status */}
                  <td>
                    <span 
                      className={`badge badge-${exp.orderStatus === 'Completed' || exp.orderStatus === 'Active' ? 'success' : (exp.orderStatus === 'Draft' ? 'warning' : (exp.orderStatus === 'In Progress' ? 'info' : 'danger'))}`}
                      style={exp.orderStatus === 'Draft' ? { background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' } : {}}
                    >
                      {exp.orderStatus === 'Draft' && <i className='bx bx-edit-alt' style={{ marginRight: '3px', fontSize: '0.8rem' }}></i>}
                      {exp.orderStatus}
                    </span>
                  </td>

                  {/* Start Date */}
                  <td className="text-right">{exp.startDate || '-'}</td>

                  {/* End Date */}
                  <td className="text-right">{exp.endDate || '-'}</td>

                  {/* Engagements */}
                  <td className="text-right">{Number(exp.engagements || 0).toLocaleString('en-US')}</td>

                  {/* Session Count */}
                  <td className="text-right">{Number(exp.sessionCount || 0).toLocaleString('en-US')}</td>

                  {/* Contract Amount */}
                  <td className="text-right" style={{ fontWeight: '600' }}>
                    {formatCurrency(exp.contractAmount)}
                  </td>

                  {/* Amount Received (hyperlinked to client-payments) */}
                  <td 
                    className="text-right" 
                    style={{ cursor: 'pointer', color: 'var(--success)', fontWeight: '600' }} 
                    onClick={() => navigate(`/client-payments?client=${encodeURIComponent(exp.clientName)}`)}
                    title="View in Accounts Receivable"
                  >
                    {formatCurrency(exp.totalReceived)}
                  </td>

                  {/* Amount Due (hyperlinked to client-payments) */}
                  <td 
                    className="text-right" 
                    style={{ cursor: 'pointer', color: 'var(--warning)', fontWeight: '600' }} 
                    onClick={() => navigate(`/client-payments?client=${encodeURIComponent(exp.clientName)}`)}
                    title="View in Accounts Receivable"
                  >
                    {formatCurrency(exp.totalDue)}
                  </td>

                  {/* Session Cost */}
                  <td className="text-right" style={{ color: '#64748b' }}>
                    {formatCurrency(exp.totalSessionCost)}
                  </td>

                  {/* Other Cost (hyperlinked to expense-approval) */}
                  <td 
                    className="text-right" 
                    style={{ cursor: 'pointer', color: '#64748b' }} 
                    onClick={() => navigate(`/expense-approval?client=${encodeURIComponent(exp.clientName)}`)}
                    title="View in Expense Approval"
                  >
                    {formatCurrency(exp.otherCost)}
                  </td>

                  {/* Net Revenue */}
                  <td className="text-right" style={{ fontWeight: '700', color: revenueColor }}>
                    {formatCurrency(netRevenue)}
                  </td>

                  {/* Health Score Dropdown */}
                  <td className="text-center">
                    <select
                      value={currentScore}
                      onChange={(e) => handleHealthScoreChange(exp.id, e.target.value)}
                      style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        border: `1px solid ${scoreStyle.border}`,
                        background: scoreStyle.bg,
                        color: scoreStyle.color,
                        outline: 'none',
                        appearance: 'auto',
                        textAlign: 'center'
                      }}
                    >
                      <option value="Healthy" style={{ background: '#ffffff', color: '#15803d', fontWeight: '600' }}>Healthy</option>
                      <option value="Moderate" style={{ background: '#ffffff', color: '#b45309', fontWeight: '600' }}>Moderate</option>
                      <option value="Risky" style={{ background: '#ffffff', color: '#b91c1c', fontWeight: '600' }}>Risky</option>
                    </select>
                  </td>
                </tr>
              );
            })}
            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan="16" style={{ textAlign: 'center', padding: '2rem' }}>No expense records found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        {totalItems > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid var(--border-color)', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span>
                Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, totalItems)} of {totalItems} entries
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label>Rows per page:</label>
                <select
                  className="form-control"
                  style={{ width: 'auto', padding: '0.25rem 0.5rem' }}
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn-outline"
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                className="btn-outline"
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default ExpenseTracker;
