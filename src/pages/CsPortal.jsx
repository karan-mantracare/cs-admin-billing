import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

function CsPortal() {
  const navigate = useNavigate();

  const csWorkflows = [
    {
      title: 'CS Calendar',
      icon: 'bx-calendar',
      path: '/calendar',
      status: 'Active',
      color: '#0284c7',
      bg: '#e0f2fe',
      desc: 'Interactive calendar of all corporate webinars, trainer assignments, session tracking, and real-time attendance logs.'
    },
    {
      title: 'HR Approval & Calendar',
      icon: 'bx-user-circle',
      path: '/hr-dash',
      status: 'Active',
      color: '#0d9488',
      bg: '#ccfbf1',
      desc: 'Client HR approval queue, session validation, remarks verification, and corporate budget sign-offs.'
    },
    {
      title: 'Webinar Session Editor',
      icon: 'bx-edit',
      path: '/edit',
      status: 'Active',
      color: '#6366f1',
      bg: '#e0e7ff',
      desc: 'Configure webinar dates, budget and remarks, trainer allocations, attendee limits, and meeting link dispatches.'
    },
    {
      title: 'CS Feedback & Escalation',
      icon: 'bx-message-square-detail',
      path: '/cs/feedback',
      status: 'Active',
      color: '#034ea2',
      bg: '#eff6ff',
      desc: 'Client satisfaction surveys, CS service ratings, and the standard 8-tier customer support escalation matrix protocol.'
    }
  ];

  return (
    <main style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto', color: '#0f172a' }}>
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
        <Link to="/home" style={{ color: '#0284c7', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <span style={{ color: '#0f172a', fontWeight: '600' }}>Customer Success (CS) Portal</span>
      </div>

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        borderRadius: '16px',
        padding: '2.25rem 2.5rem',
        color: 'white',
        boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.25)',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.2)', padding: '0.3rem 0.85rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.85rem' }}>
            <i className='bx bx-calendar-star'></i>
            <span>MantraCare CS • Customer Success Operations</span>
          </div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.9rem', fontWeight: '700', letterSpacing: '-0.02em', color: 'white' }}>
            Customer Success (CS) Portal
          </h1>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#e0f2fe', lineHeight: '1.5' }}>
            Manage client wellness calendars, upcoming webinar schedules, trainer dispatches, and corporate HR approvals.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/home')}
            style={{
              padding: '0.65rem 1.25rem',
              background: 'white',
              color: '#0284c7',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <i className='bx bx-home-alt'></i> Home Hub
          </button>
          <button
            onClick={() => navigate('/admin')}
            style={{
              padding: '0.65rem 1.25rem',
              background: 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <i className='bx bx-shield-quarter'></i> Switch to Admin
          </button>
        </div>
      </div>

      {/* Live CS Workspaces Cards */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className='bx bx-calendar-event' style={{ color: '#0284c7' }}></i>
            Live Production Workspaces
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            Click any Customer Success module below to interact with live calendar, approval, and webinar workflows.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {csWorkflows.map((item) => (
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
                    {item.status}
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
    </main>
  );
}

export default CsPortal;
