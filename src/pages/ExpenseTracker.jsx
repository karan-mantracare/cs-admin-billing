import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';

function ExpenseTracker() {
  const navigate = useNavigate();
  const { expenses: allExpenses } = useGlobal();
  const globalExpenses = allExpenses.filter(exp => exp.sessionName !== 'Mindfulness Webinar-1');

  const [expenses] = useState([
    {
      id: 1,
      clientName: 'MantraCare Internal',
      divisionStatus: 'Active',
      orderStatus: 'In Progress',
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
      divisionStatus: 'Active',
      orderStatus: 'Completed',
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
      divisionStatus: 'Inactive',
      orderStatus: 'Cancelled',
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
      const clientExpenses = globalExpenses.filter(ge => ge.clientName === exp.clientName && ge.status === 'Approved');
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
    <main className="main-content">
      {/* Summary Dashboard */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div className="summary-box" style={{ flex: 1 }}>
          <div className="summary-item">
            <span>Total Order Amount</span>
            <strong>{formatCurrency(sumOrderAmount)}</strong>
          </div>
        </div>
        <div className="summary-box" style={{ flex: 1 }}>
          <div className="summary-item">
            <span style={{ color: 'var(--success)' }}>Total Received</span>
            <strong style={{ color: 'var(--success)' }}>{formatCurrency(sumReceived)}</strong>
          </div>
        </div>
        <div className="summary-box" style={{ flex: 1 }}>
          <div className="summary-item">
            <span style={{ color: 'var(--warning)' }}>Total Due</span>
            <strong style={{ color: 'var(--warning)' }}>{formatCurrency(sumDue)}</strong>
          </div>
        </div>
        <div className="summary-box" style={{ flex: 1 }}>
          <div className="summary-item">
            <span style={{ color: 'var(--blue)' }}>Net Profit</span>
            <strong style={{ color: 'var(--blue)' }}>{formatCurrency(totalProfit)}</strong>
          </div>
        </div>
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
              <th>DIVISION STATUS</th>
              <th>ORDER STATUS</th>
              <th>ORDER END DATE</th>
              <th>TOTAL ORDER AMOUNT</th>
              <th>TOTAL RECEIVED</th>
              <th>TOTAL DUE</th>
              <th>SESSION COST</th>
              <th>WEBINAR COST</th>
              <th>OTHER COST</th>
              <th>NET PROFIT</th>
            </tr>
          </thead>
          <tbody>
            {paginatedExpenses.map((exp, index) => {
              const netProfit = exp.totalReceived - exp.totalSessionCost - exp.totalWebinarCost - exp.otherCost;
              return (
                <tr key={exp.id}>
                  <td>{startIndex + index + 1}</td>
                  
                  {/* Routes to /clients */}
                  <td className="event-name" style={{ cursor: 'pointer' }} onClick={() => navigate('/clients')}>
                    {exp.clientName}
                  </td>
                  
                  <td>
                    <span className={`badge badge-${exp.divisionStatus === 'Active' ? 'success' : 'danger'}`}>
                      {exp.divisionStatus}
                    </span>
                  </td>
                  
                  {/* Routes to /clients */}
                  <td style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate('/clients')}>
                    {exp.orderStatus}
                  </td>
                  
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
                  
                  <td style={{ fontWeight: '600', color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {formatCurrency(netProfit)}
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
