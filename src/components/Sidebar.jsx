import { Link, useLocation } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { useState } from 'react';

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { resetData } = useGlobal();

  const [openGroups, setOpenGroups] = useState({
    'CS': false,
    'HR Dash': false,
    'Admin Dash': false
  });

  const toggleGroup = (group) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const menuGroups = [
    {
      title: 'CS',
      links: [
        { path: '/calendar', label: 'Calendar', icon: 'bx-calendar' },
        { path: '/hr-approval', label: 'HR Approval', icon: 'bx-check-square' },
      ]
    },
    {
      title: 'HR Dash',
      links: [
        { path: '/hr-dash', label: 'Hr Dash', icon: 'bx-user-circle' },
      ]
    },
    {
      title: 'Admin Dash',
      links: [
        { path: '/event-approval', label: 'Event Approval', icon: 'bx-check-shield' },
        { path: '/expert-assignment', label: 'Expert Assignment', icon: 'bx-user-plus' },
        { path: '/clients', label: 'Clients', icon: 'bx-group' },
        { path: '/clients-1', label: 'Clients 1', icon: 'bx-user-detail' },
        { path: '/client-payments', label: 'Client Payments', icon: 'bx-credit-card' },
        { path: '/expense-approval', label: 'Expense Approval', icon: 'bx-receipt' },
        { path: '/expense-tracker', label: 'Expense Tracker', icon: 'bx-money' },
      ]
    }
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {menuGroups.map(group => (
              <div key={group.title} className="menu-group">
                <div 
                  className="group-header"
                  onClick={() => toggleGroup(group.title)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.5rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem',
                    fontWeight: '600', textTransform: 'uppercase', cursor: 'pointer',
                    letterSpacing: '0.05em'
                  }}
                >
                  <span>{group.title}</span>
                  <i className={`bx bx-chevron-${openGroups[group.title] ? 'up' : 'down'}`}></i>
                </div>
                
                {openGroups[group.title] && (
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {group.links.map(link => (
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
                )}
              </div>
            ))}
          </div>
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
