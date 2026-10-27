import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const csModules = [
    {
      title: 'CS Calendar',
      icon: 'bx-calendar',
      path: '/calendar',
      tag: 'Active Workflow',
      color: '#0284c7',
      bg: '#e0f2fe',
      desc: 'Interactive schedule of client webinars, trainer assignments, session tracking, and attendance logs.'
    },
    {
      title: 'HR Approval & Calendar',
      icon: 'bx-user-circle',
      path: '/hr-dash',
      tag: 'Active Workflow',
      color: '#0d9488',
      bg: '#ccfbf1',
      desc: 'HR stakeholder approvals, budget & remarks verification, and corporate session sign-offs.'
    },
    {
      title: 'Webinar Session Editor',
      icon: 'bx-edit',
      path: '/edit',
      tag: 'Active Tool',
      color: '#6366f1',
      bg: '#e0e7ff',
      desc: 'Create and configure webinar events, define budget and remarks, set trainers, and manage client attendees.'
    }
  ];

  const adminModules = [
    {
      title: 'Corporate Clients',
      icon: 'bx-buildings',
      path: '/corporate',
      tag: 'Active Workflow',
      color: '#16a34a',
      bg: '#dcfce7',
      desc: 'Enterprise accounts, division profiles, onboarding forms with live logs, role assignments, and email invites.'
    },
    {
      title: 'Accounts Receivable (Billing & Payments)',
      icon: 'bx-dollar-circle',
      path: '/client-payments',
      tag: 'Active Workflow',
      color: '#0284c7',
      bg: '#e0f2fe',
      desc: 'Full invoicing ledger, schedule preview with instant remarks tooltip, multi-currency conversion, and copy message.'
    },
    {
      title: 'Expert Assignment',
      icon: 'bx-user-plus',
      path: '/expert-assignment',
      tag: 'Active Workflow',
      color: '#ea580c',
      bg: '#ffedd5',
      desc: 'Doctor, therapist, and wellness coach allocation matrix with session quota tracking and enterprise limits.'
    },
    {
      title: 'Expense Approval',
      icon: 'bx-receipt',
      path: '/expense-approval',
      tag: 'Active Workflow',
      color: '#8b5cf6',
      bg: '#f3e8ff',
      desc: 'Corporate event expense claims validation, budget vs. actual spend checks, and manager sign-off queues.'
    },
    {
      title: 'Client P&L (Profitability)',
      icon: 'bx-pie-chart-alt',
      path: '/expense-tracker',
      tag: 'Active Workflow',
      color: '#0891b2',
      bg: '#cffafe',
      desc: 'Order revenue vs. trainer and session cost breakdown, net profit margin analysis, and corporate P&L reports.'
    }
  ];

  return (
    <main style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto', color: '#0f172a' }}>
      
      {/* Hero Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)',
        borderRadius: '16px',
        padding: '2.5rem',
        color: 'white',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
        marginBottom: '2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.15)', padding: '0.3rem 0.85rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '600', marginBottom: '0.85rem' }}>
            <i className='bx bx-check-circle' style={{ color: '#38bdf8' }}></i>
            <span>MantraCare Unified Platform • Project Portal</span>
          </div>
          <h1 style={{ margin: '0 0 0.6rem 0', fontSize: '2.1rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'white' }}>
            Enterprise Operations Hub
          </h1>
          <p style={{ margin: 0, fontSize: '1rem', color: '#cbd5e1', lineHeight: '1.6' }}>
            Centralized portal for Customer Success (CS) operations and Admin enterprise management. Select a workspace below to launch active workflows we are developing in this project.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/cs/home')}
            style={{
              padding: '0.75rem 1.4rem',
              background: '#0284c7',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.92rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            <i className='bx bx-calendar-event' style={{ fontSize: '1.1rem' }}></i>
            <span>Open CS Portal</span>
          </button>

          <button
            onClick={() => navigate('/admin')}
            style={{
              padding: '0.75rem 1.4rem',
              background: 'white',
              color: '#0f172a',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.92rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              transition: 'all 0.2s'
            }}
          >
            <i className='bx bx-shield-quarter' style={{ fontSize: '1.1rem', color: '#0284c7' }}></i>
            <span>Open Admin Portal</span>
          </button>
        </div>
      </div>

      {/* Section 1: Customer Success (CS) Portal */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                <i className='bx bx-calendar-check'></i>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
                Customer Success (CS) Workflows
              </h2>
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Active modules powering client engagement, webinars, and HR session approvals.
            </p>
          </div>

          <button
            onClick={() => navigate('/cs')}
            style={{
              background: 'none',
              border: '1px solid #cbd5e1',
              padding: '0.45rem 1rem',
              borderRadius: '6px',
              color: '#0284c7',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <span>View CS Overview</span>
            <i className='bx bx-right-arrow-alt'></i>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {csModules.map((item) => (
            <div
              key={item.title}
              onClick={() => navigate(item.path)}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 16px -2px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = item.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    <i className={`bx ${item.icon}`}></i>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: '600', padding: '0.2rem 0.6rem', borderRadius: '999px', background: '#dcfce7', color: '#15803d' }}>
                    {item.tag}
                  </span>
                </div>
                <h3 style={{ margin: '0 0 0.45rem 0', fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                  {item.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' }}>
                  {item.desc}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: item.color, fontWeight: '600', fontSize: '0.85rem', marginTop: '1.25rem' }}>
                <span>Launch {item.title}</span>
                <i className='bx bx-right-arrow-alt' style={{ fontSize: '1.1rem' }}></i>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Admin Portal Workflows */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                <i className='bx bx-shield-quarter'></i>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
                Admin Portal Workflows
              </h2>
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Active modules powering enterprise client operations, billing & invoicing, and financial approvals.
            </p>
          </div>

          <button
            onClick={() => navigate('/admin')}
            style={{
              background: '#0284c7',
              border: 'none',
              padding: '0.45rem 1rem',
              borderRadius: '6px',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 1px 3px rgba(2, 132, 199, 0.3)'
            }}
          >
            <span>Launch Admin Portal</span>
            <i className='bx bx-right-arrow-alt'></i>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {adminModules.map((item) => (
            <div
              key={item.title}
              onClick={() => navigate(item.path)}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 16px -2px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = item.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    <i className={`bx ${item.icon}`}></i>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: '600', padding: '0.2rem 0.6rem', borderRadius: '999px', background: '#dcfce7', color: '#15803d' }}>
                    {item.tag}
                  </span>
                </div>
                <h3 style={{ margin: '0 0 0.45rem 0', fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                  {item.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' }}>
                  {item.desc}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: item.color, fontWeight: '600', fontSize: '0.85rem', marginTop: '1.25rem' }}>
                <span>Launch Module</span>
                <i className='bx bx-right-arrow-alt' style={{ fontSize: '1.1rem' }}></i>
              </div>
            </div>
          ))}
        </div>
      </div>

    </main>
  );
}

export default Home;
