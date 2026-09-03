import { Link, useLocation } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { useState } from 'react';

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { resetData } = useGlobal();

  const [openGroups, setOpenGroups] = useState({
    'Session Management': false,
    'Client Billing': false,
    'Management': false
  });

  const toggleGroup = (group) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const menuGroups = [
    {
      title: 'Session Management',
      subGroups: [
        {
          title: 'cs-mantra',
          links: [
            { path: '/calendar', label: 'CS Calendar', icon: 'bx-calendar' },
            { path: '/hr-dash', label: 'HR Calendar', icon: 'bx-user-circle' },
          ]
        },
        {
          title: 'Admin-Mantra',
          links: [
            { path: '/event-approval', label: 'Event Approval', icon: 'bx-check-shield' },
            { path: '/expert-assignment', label: 'Expert Assignment', icon: 'bx-user-plus' },
          ]
        }
      ]
    },
    {
      title: 'Client Billing',
      links: [
        { path: '/clients', label: 'Client 1', icon: 'bx-group' },
        { path: '/clients-1', label: 'Client 2', icon: 'bx-user' },
        { path: '/client-payments', label: 'Client Payment', icon: 'bx-credit-card' },
      ]
    },
    {
      title: 'Management',
      links: [
        { path: '/expense-approval', label: 'Expense Approval', icon: 'bx-receipt' },
        { path: '/expense-tracker', label: 'Client P&L', icon: 'bx-money' },
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
                  <div style={{ marginTop: '0.5rem' }}>
                    {group.subGroups ? (
                      group.subGroups.map(subGroup => (
                        <div key={subGroup.title} style={{ marginBottom: '0.75rem' }}>
                          <div style={{ padding: '0.25rem 1.25rem 0.25rem 2rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {subGroup.title}
                          </div>
                          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                            {subGroup.links.map(link => (
                              <li key={link.path}>
                                <Link
                                  to={link.path}
                                  className={`nav-link ${location.pathname === link.path || (link.path === '/calendar' && location.pathname === '/') ? 'active' : ''}`}
                                  onClick={onClose}
                                  style={{ paddingLeft: '2.5rem' }}
                                >
                                  <i className={`bx ${link.icon}`}></i>
                                  <span>{link.label}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    ) : (
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
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
