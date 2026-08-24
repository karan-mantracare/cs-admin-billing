import { Link, useLocation } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { resetData } = useGlobal();

  const links = [
    { path: '/calendar', label: 'Calendar', icon: 'bx-calendar' },
    { path: '/clients', label: 'Clients', icon: 'bx-group' },
    { path: '/clients-1', label: 'Test Billing (Clients 1)', icon: 'bx-layer' },
    { path: '/client-payments', label: 'Client Payments', icon: 'bx-credit-card' },
    { path: '/event-approval', label: 'Event Approval', icon: 'bx-check-shield' },
    { path: '/expert-assignment', label: 'Expert Assignment', icon: 'bx-user-plus' },
    { path: '/expense-approval', label: 'Expense Approval', icon: 'bx-receipt' },
    { path: '/expense-tracker', label: 'Expense Tracker', icon: 'bx-money' },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <i className='bx bx-heart-circle'></i>
            <span>MantraCare</span>
          </div>
          <button className="close-btn" onClick={onClose}><i className='bx bx-x'></i></button>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {links.map((link) => (
              <li key={link.path}>
                <Link 
                  to={link.path} 
                  className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <i className={`bx ${link.icon}`}></i>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
          <button 
            className="btn-outline" 
            style={{ width: '100%', borderColor: 'var(--red)', color: 'var(--red)', justifyContent: 'center' }}
            onClick={() => {
              if (window.confirm('Are you sure you want to delete all saved data and reset to defaults?')) {
                resetData();
                window.location.reload();
              }
            }}
          >
            <i className='bx bx-reset'></i> Reset Data
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
