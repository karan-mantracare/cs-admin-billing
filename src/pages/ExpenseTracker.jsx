import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';

function ExpenseTracker() {
  const navigate = useNavigate();
  const { expenses: allExpenses } = useGlobal();
  const globalExpenses = allExpenses;

  const [expenses] = useState([
    {
      id: 1,
      clientName: 'MantraCare Internal',
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
      clientName: 'Comprehensive Wellness',
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
      clientName: 'Tech Corp LLC',
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

  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const enrichedExpenses = useMemo(() => {
    return expenses.map(exp => {
      const clientExpenses = globalExpenses.filter(ge => ge.clientName === exp.clientName && (ge.status === 'Approved' || ge.status === 'Settled' || ge.status === 'Disbursed'));
      const calculatedOtherCost = clientExpenses.reduce((sum, current) => sum + current.amount, 0);
      return { ...exp, otherCost: exp.otherCost + calculatedOtherCost };
    });
  }, [expenses, globalExpenses]);

  const filteredExpenses = enrichedExpenses.filter(exp =>
    exp.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalItems = filteredExpenses.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + rowsPerPage);

  // Summary Logic
  const sumOrderAmount = filteredExpenses.reduce((sum, e) => sum + e.totalOrderAmount, 0);
  const sumReceived = filteredExpenses.reduce((sum, e) => sum + e.totalReceived, 0);
  const sumDue = filteredExpenses.reduce((sum, e) => sum + e.totalDue, 0);

  const totalProfit = filteredExpenses.reduce((sum, e) => {
    return sum + (e.totalReceived - e.totalSessionCost - e.totalWebinarCost - e.otherCost);
  }, 0);

  const formatCurrency = (amount) => `$${amount.toLocaleString()}`;

  return (
    <main className="main-content expense-tracker-page">
      <style>{`
        .expense-tracker-page .data-table th,
        .expense-tracker-page .data-table td {
          font-size: 10px !important;
          padding: 4px 6px !important;
        }
        .expense-tracker-page .badge {
          font-size: 10px !important;
          padding: 2px 6px !important;
        }
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
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a', fontWeight: '700' }}>Client P&amp;L</h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>Revenue vs. cost breakdown per client order</p>
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
            placeholder="Search Client Name..."
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
              <th>S. NO.</th>
              <th>CLIENT NAME</th>
              <th>DIVISION</th>
              <th>DIVISION STATUS</th>
              <th>CS RESPONSIBLE</th>
              <th>ORDER NAME</th>
              <th>ORDER ACTIVE</th>
              <th>ORDER STATUS</th>
              <th>START DATE</th>
              <th>END DATE</th>
              <th>EMPLOYEE COVERED</th>
              <th>ENGAGEMENTS</th>
              <th>CONTRACT AMOUNT</th>
              <th>SESSION COUNT</th>
              <th>ORDER END DATE</th>
              <th>TOTAL ORDER AMOUNT</th>
              <th>TOTAL RECEIVED</th>
              <th>TOTAL DUE</th>
              <th>SESSION COST</th>
              <th>WEBINAR COST</th>
              <th>OTHER COST</th>
              <th>NET REVENUE</th>
            </tr>
          </thead>
          <tbody>
            {paginatedExpenses.map((exp, index) => {
              const netRevenue = exp.totalReceived - exp.totalSessionCost - exp.totalWebinarCost - exp.otherCost;
              const margin = exp.totalReceived > 0 ? (netRevenue / exp.totalReceived) * 100 : 0;
              let revenueColor = 'var(--red)';
              if (margin > 50) revenueColor = 'var(--green)';
              else if (margin >= 11) revenueColor = 'var(--orange)';

              return (
                <tr key={exp.id}>
                  <td>{startIndex + index + 1}</td>

                  {/* Routes to /clients */}
                  <td className="event-name" style={{ cursor: 'pointer' }} onClick={() => navigate('/clients')}>
                    {exp.clientName}
                  </td>

                  <td>{exp.division}</td>

                  <td>
                    <span className={`badge badge-${exp.divisionStatus === 'Active' ? 'success' : 'danger'}`}>
                      {exp.divisionStatus}
                    </span>
                  </td>

                  <td>{exp.csResponsible}</td>
                  <td>{exp.orderName}</td>
                  <td>{exp.orderActive}</td>

                  {/* Routes to /clients */}
                  <td style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate('/clients')}>
                    {exp.orderStatus}
                  </td>

                  <td>{exp.startDate}</td>
                  <td>{exp.endDate}</td>
                  <td>{exp.employeeCovered}</td>
                  <td>{exp.engagements}</td>
                  <td>{formatCurrency(exp.contractAmount)}</td>
                  <td>{exp.sessionCount}</td>

                  {/* Routes to /clients */}
                  <td style={{ cursor: 'pointer', color: 'var(--primary)', whiteSpace: 'nowrap' }} onClick={() => navigate('/clients')}>
                    {exp.orderEndDate}
                  </td>

                  {/* Routes to /clients */}
                  <td style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate('/clients')}>
                    {formatCurrency(exp.totalOrderAmount)}
                  </td>

                  {/* Routes to /client-payments */}
                  <td style={{ cursor: 'pointer', color: 'var(--success)', fontWeight: '500' }} onClick={() => navigate(`/client-payments?client=${encodeURIComponent(exp.clientName)}`)}>
                    {formatCurrency(exp.totalReceived)}
                  </td>

                  {/* Routes to /client-payments */}
                  <td style={{ cursor: 'pointer', color: 'var(--warning)', fontWeight: '500' }} onClick={() => navigate(`/client-payments?client=${encodeURIComponent(exp.clientName)}`)}>
                    {formatCurrency(exp.totalDue)}
                  </td>

                  <td>{formatCurrency(exp.totalSessionCost)}</td>

                  {/* Routes to /event-approval */}
                  <td style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate(`/event-approval?client=${encodeURIComponent(exp.clientName)}`)}>
                    {formatCurrency(exp.totalWebinarCost)}
                  </td>

                  {/* Routes to /expense-approval */}
                  <td style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate(`/expense-approval?client=${encodeURIComponent(exp.clientName)}`)}>
                    {formatCurrency(exp.otherCost)}
                  </td>

                  <td style={{ fontWeight: '600', color: revenueColor }}>
                    {formatCurrency(netRevenue)}
                  </td>
                </tr>
              );
            })}
            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan="12" style={{ textAlign: 'center', padding: '2rem' }}>No expense records found</td>
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
