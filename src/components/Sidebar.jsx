import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { resetData } = useGlobal();

  // All menu items collapsed by default
  const [expandedGroup, setExpandedGroup] = useState(null);

  const toggleGroup = (title) => {
    setExpandedGroup(prev => (prev === title ? null : title));
  };

  // Check route environment
  const isHome = location.pathname === '/home' || location.pathname === '/';

  // Check if current route is part of the Customer Success (CS) portal
  const isCsPortal = !isHome && (
    location.pathname.startsWith('/cs') || 
    location.pathname.startsWith('/calendar') || 
    location.pathname.startsWith('/hr-dash') || 
    location.pathname.startsWith('/edit')
  );

  // Home Hub Menu Structure (for /home)
  const homeMenuSections = [
    {
      title: 'Home',
      path: '/home',
      icon: 'bx-home-alt',
      isDirect: true
    },
    {
      isDivider: true
    },
    {
      title: 'CS',
      path: '/cs',
      icon: 'bx-calendar-event',
      isDirect: true,
      badge: 'Portal'
    },
    {
      title: 'Admin',
      path: '/admin',
      icon: 'bx-shield-quarter',
      isDirect: true,
      badge: 'Portal'
    }
  ];

  // Customer Success (CS) Menu Structure (from user screenshots)
  const csMenuSections = [
    {
      title: 'Home',
      path: '/cs/home',
      icon: 'bx-home-alt',
      isDirect: true
    },
    {
      title: 'Summary',
      icon: 'bx-bar-chart-alt-2',
      subItems: [
        { label: 'Overview', path: '/cs/summary/overview', icon: 'bx-bar-chart-alt-2' },
        { label: 'Service', path: '/cs/summary/service', icon: 'bx-cog' },
      ]
    },
    {
      title: 'Engagement',
      icon: 'bx-calendar',
      isProjectCategory: true,
      subItems: [
        { label: 'CS Calendar', path: '/calendar', icon: 'bx-calendar-event', isProjectModule: true },
        { label: 'HR Approval', path: '/hr-dash', icon: 'bx-user-circle', isProjectModule: true },
        { label: 'Webinar Editor', path: '/edit', icon: 'bx-edit', isProjectModule: true },
        { label: 'Overview', path: '/cs/engagement/overview', icon: 'bx-line-chart' },
      ]
    },
    {
      title: 'Program ROI',
      path: '/cs/program-roi',
      icon: 'bx-bar-chart-alt-2',
      isDirect: true
    },
    {
      title: 'Employees',
      path: '/cs/employees',
      icon: 'bx-group',
      isDirect: true
    },
    {
      isDivider: true
    },
    {
      title: 'Rewards',
      path: '/cs/rewards',
      icon: 'bx-sparkles',
      isDirect: true
    },
    {
      title: 'Feedback',
      path: '/cs/feedback',
      icon: 'bx-message-rounded-dots',
      isDirect: true
    },
    {
      title: 'Settings',
      path: '/cs/settings',
      icon: 'bx-cog',
      isDirect: true
    }
  ];

  // Admin Portal Menu Structure (from user screenshots)
  const adminMenuSections = [
    {
      title: 'Orders',
      icon: 'bx-clipboard',
      subItems: [
        { label: 'All Orders', path: '/orders/all', icon: 'bx-list-ul' },
        { label: 'Subscriptions', path: '/orders/subscriptions', icon: 'bx-refresh' },
        { label: 'Allotment', path: '/orders/allotment', icon: 'bx-cube' },
        { label: 'Allotment Request', path: '/orders/allotment-request', icon: 'bx-cube' },
        { label: 'Admin Logs', path: '/orders/admin-logs', icon: 'bx-file-blank' },
      ]
    },
    {
      title: 'Providers',
      icon: 'bx-group',
      subItems: [
        { label: 'All Providers', path: '/providers/all', icon: 'bx-group' },
        { label: 'Insurances', path: '/providers/insurances', icon: 'bx-shield' },
        { label: 'Billing', path: '/providers/billing', icon: 'bx-dollar-circle' },
        { label: 'Payments', path: '/providers/payments', icon: 'bx-credit-card' },
        { label: 'Efficiency', path: '/providers/efficiency', icon: 'bx-bar-chart-alt-2' },
        { label: 'Sessions', path: '/providers/sessions', icon: 'bx-time' },
        { label: 'Appointment Report', path: '/providers/appointment-report', icon: 'bx-calendar' },
        { label: 'Malicious Chat', path: '/providers/malicious-chat', icon: 'bx-error-alt' },
        { label: 'Country × service counts', path: '/providers/country-service-counts', icon: 'bx-globe' },
      ]
    },
    {
      title: 'Users',
      icon: 'bx-user-circle',
      subItems: [
        { label: 'All Users', path: '/users/all', icon: 'bx-user' },
        { label: 'Blocklist Rules', path: '/users/blocklist-rules', icon: 'bx-shield' },
        { label: 'Chat Rooms', path: '/users/chat-rooms', icon: 'bx-message-rounded-dots' },
        { label: 'Chat Groups', path: '/users/chat-groups', icon: 'bx-group' },
        { label: 'Complaints', path: '/users/complaints', icon: 'bx-flag' },
      ]
    },
    {
      title: 'Corporate',
      icon: 'bx-building',
      isProjectCategory: true,
      subItems: [
        { label: 'Clients', path: '/corporate', icon: 'bx-briefcase', isProjectModule: true },
        { label: 'Employees', path: '/corporate/employees', icon: 'bx-user-pin' },
        { label: 'Departments', path: '/corporate/departments', icon: 'bx-network-chart' },
        { label: 'Engagement Category', path: '/corporate/engagement-category', icon: 'bx-purchase-tag' },
        { label: 'Engagement Activity', path: '/corporate/engagement-activity', icon: 'bx-play-circle' },
        { label: 'Engagement Template', path: '/corporate/engagement-template', icon: 'bx-file' },
        { label: 'Profitability', path: '/expense-tracker', icon: 'bx-pie-chart-alt', isProjectModule: true },
        { label: 'Plans', path: '/corporate/plans', icon: 'bx-clipboard' },
        { label: 'Dedicated Providers', path: '/corporate/dedicated-providers', icon: 'bx-user-check' },
        { label: 'Insurance Partners', path: '/corporate/insurance-partners', icon: 'bx-user' },
        { label: 'SSO Partners', path: '/corporate/sso-partners', icon: 'bx-user' },
        { label: 'Wellness Events', path: '/calendar', icon: 'bx-play-circle', isProjectModule: true },
        { label: 'Session Requests', path: '/corporate/session-requests', icon: 'bx-time' },
        { label: 'Expense Approval', path: '/expense-approval', icon: 'bx-dollar-circle', isProjectModule: true },
        { label: 'Accounts Receivable', path: '/client-payments', icon: 'bx-dollar-circle', isProjectModule: true },
        { label: 'Expert Assignment', path: '/expert-assignment', icon: 'bx-group', isProjectModule: true },
      ]
    },
    {
      title: 'Products',
      icon: 'bx-cube',
      subItems: [
        { label: 'All Products', path: '/products/all', icon: 'bx-cube' },
        { label: 'Coupons', path: '/products/coupons', icon: 'bx-purchase-tag-alt' },
        { label: 'Preference Scores', path: '/products/preference-scores', icon: 'bx-star' },
        { label: 'Preference Test', path: '/products/preference-test', icon: 'bx-test-tube' },
        { label: 'Media', path: '/products/media', icon: 'bx-image' },
        { label: 'Media Category', path: '/products/media-category', icon: 'bx-purchase-tag' },
        { label: 'AHC', path: '/products/ahc', icon: 'bx-test-tube' },
        { label: 'Canned Responses', path: '/products/canned-responses', icon: 'bx-message-rounded-dots' },
      ]
    },
    {
      title: 'Refer & Earn',
      icon: 'bx-dollar-circle',
      subItems: [
        { label: 'Referral Config', path: '/refer/config', icon: 'bx-purchase-tag' },
        { label: 'Referred Users', path: '/refer/referred-users', icon: 'bx-group' },
        { label: 'Wallet Transactions', path: '/refer/wallet-transactions', icon: 'bx-credit-card' },
        { label: 'Wallet Balances', path: '/refer/wallet-balances', icon: 'bx-dollar-circle' },
      ]
    },
    {
      title: 'Pathway',
      icon: 'bx-map-pin',
      subItems: [
        { label: 'Pathway', path: '/pathway/overview', icon: 'bx-map-pin' },
        { label: 'Activity', path: '/pathway/activity', icon: 'bx-play-circle' },
        { label: 'Users', path: '/pathway/users', icon: 'bx-user' },
      ]
    },
    {
      title: 'Mantra AI Prompts',
      icon: 'bx-bulb',
      subItems: [
        { label: 'Knowledge Base', path: '/ai-prompts/knowledge-base', icon: 'bx-book-open' },
        { label: 'Prompt Management', path: '/ai-prompts/prompt-management', icon: 'bx-edit' },
        { label: 'Resources', path: '/ai-prompts/resources', icon: 'bx-folder' },
        { label: 'App Screens', path: '/ai-prompts/app-screens', icon: 'bx-mobile' },
        { label: 'AI Services', path: '/ai-prompts/services', icon: 'bx-folder' },
        { label: 'AI API Keys', path: '/ai-prompts/api-keys', icon: 'bx-key' },
      ]
    },
    {
      title: 'EHR',
      icon: 'bx-file-blank',
      subItems: [
        { label: 'Templates', path: '/ehr/templates', icon: 'bx-file' },
        { label: 'Submission', path: '/ehr/submission', icon: 'bx-navigation' },
        { label: 'Insurance', path: '/ehr/insurance', icon: 'bx-shield' },
        { label: 'Claims', path: '/ehr/claims', icon: 'bx-file-blank' },
        { label: 'Credit Usage', path: '/ehr/credit-usage', icon: 'bx-dollar-circle' },
        { label: 'Orders', path: '/ehr/orders', icon: 'bx-dollar-circle' },
        { label: 'Plans', path: '/ehr/plans', icon: 'bx-briefcase' },
        { label: 'Forms', path: '/ehr/forms', icon: 'bx-clipboard' },
      ]
    },
    {
      title: 'AI Analytics',
      icon: 'bx-chip',
      subItems: [
        { label: 'AI NoteTaker', path: '/ai-analytics/notetaker', icon: 'bx-edit' },
      ]
    },
    {
      title: 'Listing',
      icon: 'bx-folder',
      subItems: [
        { label: 'All Listings', path: '/listing/all', icon: 'bx-store' },
        { label: 'Directories', path: '/listing/directories', icon: 'bx-book-content' },
        { label: 'Reviews', path: '/listing/reviews', icon: 'bx-star' },
      ]
    }
  ];

  let activeMenu = adminMenuSections;
  if (isHome) {
    activeMenu = homeMenuSections;
  } else if (isCsPortal) {
    activeMenu = csMenuSections;
  }

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{ width: '270px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Sidebar Header */}
        <div style={{
          padding: '1.25rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
            >
              <i className='bx bx-menu'></i>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <i className='bx bx-heart-circle' style={{ color: '#0284c7', fontSize: '1.6rem' }}></i>
              <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0284c7', letterSpacing: '-0.02em' }}>
                Mantra<span style={{ color: '#38bdf8' }}>Care</span>
              </span>
            </div>
          </div>
        </div>

        {/* Portal Identifier / Switcher Banner */}
        <div style={{
          padding: '0.65rem 0.85rem',
          background: isHome ? '#f8fafc' : (isCsPortal ? '#f0fdf4' : '#eff6ff'),
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isHome ? '#6366f1' : (isCsPortal ? '#16a34a' : '#0284c7')
            }}></span>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: isHome ? '#4f46e5' : (isCsPortal ? '#15803d' : '#0369a1'), textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isHome ? 'Navigation Hub' : (isCsPortal ? 'CS Portal' : 'Admin Portal')}
            </span>
          </div>

          {!isHome ? (
            <Link
              to={isCsPortal ? '/admin' : '/cs'}
              onClick={onClose}
              style={{
                fontSize: '0.74rem',
                color: '#64748b',
                textDecoration: 'none',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem'
              }}
            >
              <span>{isCsPortal ? 'Go to Admin' : 'Go to CS'}</span>
              <i className='bx bx-right-arrow-alt'></i>
            </Link>
          ) : (
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: '600' }}>
              Select Portal
            </span>
          )}
        </div>

        {/* Sidebar Navigation */}
        <nav style={{ padding: '0.75rem 0.85rem', overflowY: 'auto', flex: '1 1 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {activeMenu.map((section, idx) => {
              // Divider item
              if (section.isDivider) {
                return <div key={`div-${idx}`} style={{ height: '1px', background: '#e2e8f0', margin: '0.6rem 0.25rem' }} />;
              }

              // Direct link item (like CS Home, Program ROI, Employees, Rewards, or /home links)
              if (section.isDirect) {
                const isActive = location.pathname === section.path;

                return (
                  <Link
                    key={section.title}
                    to={section.path}
                    onClick={onClose}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: isActive ? '#0284c7' : '#334155',
                      background: isActive ? '#f0f9ff' : 'transparent',
                      border: isActive ? '1px solid #bae6fd' : '1px solid transparent',
                      fontWeight: isActive ? '700' : '500',
                      fontSize: '0.92rem',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.color = '#0f172a';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#334155';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <i className={`bx ${section.icon}`} style={{ fontSize: '1.25rem', color: isActive ? '#0284c7' : '#64748b' }}></i>
                      <span>{section.title}</span>
                    </div>

                    {section.badge && (
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        padding: '0.12rem 0.5rem',
                        borderRadius: '4px',
                        background: '#e0f2fe',
                        color: '#0284c7',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em'
                      }}>
                        {section.badge}
                      </span>
                    )}
                  </Link>
                );
              }

              // Expandable Group item
              const isExpanded = expandedGroup === section.title;
              const hasProjectModules = section.isProjectCategory || section.subItems?.some(s => s.isProjectModule);

              return (
                <div key={section.title} style={{ marginBottom: '0.15rem' }}>
                  {/* Group Header Button */}
                  <div
                    onClick={() => toggleGroup(section.title)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      background: hasProjectModules ? '#f0f9ff' : (isExpanded ? '#f8fafc' : 'transparent'),
                      border: hasProjectModules ? '1px solid #bae6fd' : '1px solid transparent',
                      color: hasProjectModules ? '#0369a1' : (isExpanded ? '#0f172a' : '#334155'),
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      fontWeight: (isExpanded || hasProjectModules) ? '600' : '500',
                      fontSize: '0.92rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = hasProjectModules ? '#e0f2fe' : '#f1f5f9';
                      e.currentTarget.style.color = '#0f172a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = hasProjectModules ? '#f0f9ff' : (isExpanded ? '#f8fafc' : 'transparent');
                      e.currentTarget.style.color = hasProjectModules ? '#0369a1' : (isExpanded ? '#0f172a' : '#334155');
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <i className={`bx ${section.icon}`} style={{ fontSize: '1.25rem', color: hasProjectModules ? '#0284c7' : (isExpanded ? '#0f172a' : '#64748b') }}></i>
                      <span>{section.title}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {!isExpanded && hasProjectModules && (
                        <span style={{
                          fontSize: '0.65rem',
                          padding: '0.12rem 0.45rem',
                          borderRadius: '999px',
                          background: '#e0f2fe',
                          color: '#0284c7',
                          fontWeight: '700',
                          marginRight: '0.45rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em'
                        }}>
                          In Project
                        </span>
                      )}
                      <i className={`bx bx-chevron-${isExpanded ? 'down' : 'right'}`} style={{ fontSize: '1.2rem', color: isExpanded ? '#0f172a' : '#94a3b8' }}></i>
                    </div>
                  </div>

                  {/* Submenu Items (Expanded) */}
                  {isExpanded && (
                    <div style={{
                      padding: '0.25rem 0 0.35rem 1.6rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem'
                    }}>
                      {section.subItems?.map(item => {
                        const isActive = location.pathname === item.path;
                        const isProject = item.isProjectModule;

                        return (
                          <Link
                            key={item.label}
                            to={item.path}
                            onClick={onClose}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.65rem',
                              padding: '0.5rem 0.85rem',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              color: isActive ? '#0284c7' : (isProject ? '#0369a1' : '#475569'),
                              background: isActive ? '#f0f9ff' : (isProject ? '#e0f2fe' : 'transparent'),
                              border: isActive ? '1px solid #0284c7' : (isProject ? '1px solid #bae6fd' : '1px solid transparent'),
                              fontWeight: (isActive || isProject) ? '600' : '500',
                              fontSize: '0.88rem',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive) {
                                if (isProject) {
                                  e.currentTarget.style.background = '#bae6fd';
                                  e.currentTarget.style.color = '#0c4a6e';
                                } else {
                                  e.currentTarget.style.background = '#f8fafc';
                                  e.currentTarget.style.color = '#0f172a';
                                }
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) {
                                if (isProject) {
                                  e.currentTarget.style.background = '#e0f2fe';
                                  e.currentTarget.style.color = '#0369a1';
                                } else {
                                  e.currentTarget.style.background = 'transparent';
                                  e.currentTarget.style.color = '#475569';
                                }
                              }
                            }}
                          >
                            <i className={`bx ${item.icon}`} style={{ fontSize: '1.1rem', color: isActive ? '#0284c7' : (isProject ? '#0284c7' : '#64748b') }}></i>
                            <span>{item.label}</span>
                            {isProject && (
                              <span style={{
                                marginLeft: 'auto',
                                fontSize: '0.62rem',
                                fontWeight: '700',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '4px',
                                background: isActive ? '#0284c7' : '#bae6fd',
                                color: isActive ? '#ffffff' : '#0284c7',
                                letterSpacing: '0.02em',
                                textTransform: 'uppercase'
                              }}>
                                Active
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer with Logout & Reset */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid #f1f5f9',
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <button
            onClick={() => {
              if (window.confirm('Do you want to log out?')) {
                window.location.href = '/home';
              }
            }}
            style={{
              width: '100%',
              padding: '0.65rem 1rem',
              background: '#0284c7',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: '0 1px 3px rgba(2, 132, 199, 0.3)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#0369a1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#0284c7'; }}
          >
            Logout
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete all saved data and reset to defaults?')) {
                resetData();
                window.location.reload();
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.75rem',
              cursor: 'pointer',
              textAlign: 'center',
              padding: '0.2rem'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
          >
            Reset Demo Data
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
