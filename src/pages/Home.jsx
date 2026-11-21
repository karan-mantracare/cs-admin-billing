import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CHANGELOG_DATA } from '../data/changelogData';

function Home() {
  const navigate = useNavigate();
  const [selectedLog, setSelectedLog] = useState(null);
  const [changelogFilter, setChangelogFilter] = useState('All');
  const [changelogSearch, setChangelogSearch] = useState('');

  // Pagination state for Change Log
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Always collapsed by default per requirements
  const [isCsOpen, setIsCsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Filtered change logs with pagination
  const filteredLogs = useMemo(() => {
    return CHANGELOG_DATA.filter(item => {
      if (changelogFilter !== 'All' && item.page !== changelogFilter) return false;
      if (changelogSearch.trim()) {
        const q = changelogSearch.toLowerCase();
        return (
          item.subPage.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.details.toLowerCase().includes(q) ||
          item.page.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [changelogFilter, changelogSearch]);

  const totalItems = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * rowsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + rowsPerPage);

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
      title: 'Client Feedback & Quality Evaluation',
      icon: 'bx-star',
      path: '/cs/feedback',
      tag: 'Active Workflow',
      color: '#034ea2',
      bg: '#eff6ff',
      desc: '12-dimension client feedback questionnaire, directory table, real-time score derivation, and 4-tier escalation protocol.'
    },
    {
      title: 'Client Cadence & Governance',
      icon: 'bx-line-chart',
      path: '/cadence',
      tag: 'Active Workflow',
      color: '#7c3aed',
      bg: '#f3e8ff',
      desc: 'Corporate communication cadence, milestone tracking, quarterly relationship reviews, and account health logs.'
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
      desc: 'Create and configure webinar events, allocate experts, settle expenses via symmetrical session modal, and track participants.'
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
      desc: 'Full invoicing ledger, flexible monthly & annual billing schedules, multi-currency conversion, and payment reminders.'
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
      title: 'Client Report',
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
      <div style={{
        marginBottom: '1.5rem',
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease'
      }}>
        <div
          onClick={() => setIsCsOpen(!isCsOpen)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
              <i className='bx bx-calendar-check'></i>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
                  Customer Success (CS) Workflows
                </h2>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '0.15rem 0.55rem', borderRadius: '999px', background: '#e0f2fe', color: '#0284c7' }}>
                  {csModules.length} Modules
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: '600', padding: '0.15rem 0.55rem', borderRadius: '999px', background: isCsOpen ? '#f1f5f9' : '#fef3c7', color: isCsOpen ? '#64748b' : '#92400e' }}>
                  {isCsOpen ? 'Expanded' : 'Collapsed'}
                </span>
              </div>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Active modules powering client engagement, webinars, and HR session approvals.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => navigate('/cs')}
              style={{
                background: 'none',
                border: '1px solid #cbd5e1',
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                color: '#0284c7',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <span>View CS Overview</span>
              <i className='bx bx-right-arrow-alt'></i>
            </button>

            <button
              type="button"
              onClick={() => setIsCsOpen(!isCsOpen)}
              style={{
                background: isCsOpen ? '#f8fafc' : '#0284c7',
                border: isCsOpen ? '1px solid #cbd5e1' : 'none',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                color: isCsOpen ? '#334155' : 'white',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: isCsOpen ? 'none' : '0 1px 3px rgba(2, 132, 199, 0.3)',
                transition: 'all 0.15s ease'
              }}
              title={isCsOpen ? 'Collapse CS Workflows' : 'Expand CS Workflows'}
            >
              <span>{isCsOpen ? 'Collapse' : 'Expand'}</span>
              <i className={`bx ${isCsOpen ? 'bx-chevron-up' : 'bx-chevron-down'}`} style={{ fontSize: '1.15rem' }}></i>
            </button>
          </div>
        </div>

        {isCsOpen && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.25rem',
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #f1f5f9'
          }}>
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
        )}
      </div>

      {/* Section 2: Admin Portal Workflows */}
      <div style={{
        marginBottom: '2rem',
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease'
      }}>
        <div
          onClick={() => setIsAdminOpen(!isAdminOpen)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
              <i className='bx bx-shield-quarter'></i>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
                  Admin Portal Workflows
                </h2>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '0.15rem 0.55rem', borderRadius: '999px', background: '#dcfce7', color: '#16a34a' }}>
                  {adminModules.length} Modules
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: '600', padding: '0.15rem 0.55rem', borderRadius: '999px', background: isAdminOpen ? '#f1f5f9' : '#fef3c7', color: isAdminOpen ? '#64748b' : '#92400e' }}>
                  {isAdminOpen ? 'Expanded' : 'Collapsed'}
                </span>
              </div>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Active modules powering enterprise client operations, billing & invoicing, and financial approvals.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              style={{
                background: '#0284c7',
                border: 'none',
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                color: 'white',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 1px 3px rgba(2, 132, 199, 0.3)',
                transition: 'all 0.15s ease'
              }}
            >
              <span>Launch Admin Portal</span>
              <i className='bx bx-right-arrow-alt'></i>
            </button>

            <button
              type="button"
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              style={{
                background: isAdminOpen ? '#f8fafc' : '#16a34a',
                border: isAdminOpen ? '1px solid #cbd5e1' : 'none',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                color: isAdminOpen ? '#334155' : 'white',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: isAdminOpen ? 'none' : '0 1px 3px rgba(22, 163, 74, 0.3)',
                transition: 'all 0.15s ease'
              }}
              title={isAdminOpen ? 'Collapse Admin Workflows' : 'Expand Admin Workflows'}
            >
              <span>{isAdminOpen ? 'Collapse' : 'Expand'}</span>
              <i className={`bx ${isAdminOpen ? 'bx-chevron-up' : 'bx-chevron-down'}`} style={{ fontSize: '1.15rem' }}></i>
            </button>
          </div>
        </div>

        {isAdminOpen && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.25rem',
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #f1f5f9'
          }}>
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
        )}
      </div>

      {/* Section 3: Project Change Log Table */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        marginBottom: '2rem'
      }}>
        {/* Table Header & Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                <i className='bx bx-history'></i>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
                Change Log
              </h2>
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Track what has changed across Home, CS, and Admin portals. Click the view icon to inspect details in easy language.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Filter by Page */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
              {['All', 'Home', 'CS', 'Admin'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setChangelogFilter(p);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: changelogFilter === p ? '#ffffff' : 'transparent',
                    color: changelogFilter === p ? '#0f172a' : '#64748b',
                    boxShadow: changelogFilter === p ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', width: '220px' }}>
              <i className='bx bx-search' style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
              <input
                type="text"
                placeholder="Search changes..."
                value={changelogSearch}
                onChange={(e) => {
                  setChangelogSearch(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Change Log Table */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: 'white' }}>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '600', width: '120px' }}>DATE</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '600', width: '110px' }}>PAGE</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '600', width: '190px' }}>SUB PAGE</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '600' }}>CHANGES</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '600', textAlign: 'center', width: '140px' }}>LINK</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log) => {
                const getPageBadge = (page) => {
                  if (page === 'Admin') return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
                  if (page === 'CS') return { bg: '#ecfeff', color: '#0e7490', border: '#a5f3fc' };
                  return { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
                };
                const badge = getPageBadge(log.page);

                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9', background: 'white' }}>
                    <td style={{ padding: '0.9rem 1rem', color: '#475569', fontWeight: '500', whiteSpace: 'nowrap' }}>
                      {log.formattedDate}
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`
                      }}>
                        {log.page}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontWeight: '600', color: '#0f172a' }}>
                      {log.subPage}
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                        <span style={{ color: '#334155', lineHeight: '1.4' }}>
                          {log.summary}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.3rem 0.65rem',
                            borderRadius: '6px',
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            color: '#0284c7',
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            flexShrink: 0,
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#e0f2fe';
                            e.currentTarget.style.borderColor = '#7dd3fc';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                          }}
                          title="View full change details in easy language"
                        >
                          <i className='bx bx-show' style={{ fontSize: '1rem' }}></i>
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => navigate(log.path)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          background: '#0284c7',
                          border: 'none',
                          color: 'white',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(2, 132, 199, 0.25)',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#0369a1'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#0284c7'}
                        title={`Open ${log.linkText || log.subPage}`}
                      >
                        <span>{log.linkText || 'Open'}</span>
                        <i className='bx bx-right-arrow-alt' style={{ fontSize: '1rem' }}></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paginatedLogs.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    No changes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid #f1f5f9',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Left: Entries Counter & Rows Per Page */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: '500' }}>
              Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + rowsPerPage, totalItems)} of {totalItems} entries
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <label style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '500' }}>Rows per page:</label>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  color: '#334155',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Right: Page Navigation Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              type="button"
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.82rem',
                fontWeight: '600',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: safeCurrentPage === 1 ? '#f8fafc' : 'white',
                color: safeCurrentPage === 1 ? '#94a3b8' : '#334155',
                cursor: safeCurrentPage === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                transition: 'all 0.15s ease'
              }}
            >
              <i className='bx bx-chevron-left'></i>
              <span>Previous</span>
            </button>

            {/* Numeric page buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) {
                  acc.push('ellipsis-' + p);
                }
                acc.push(p);
                return acc;
              }, [])
              .map((p) => {
                if (typeof p === 'string') {
                  return <span key={p} style={{ padding: '0 0.35rem', color: '#94a3b8', fontSize: '0.82rem' }}>...</span>;
                }
                const isActive = p === safeCurrentPage;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    style={{
                      minWidth: '32px',
                      height: '32px',
                      padding: '0 0.5rem',
                      borderRadius: '6px',
                      border: isActive ? 'none' : '1px solid #cbd5e1',
                      background: isActive ? '#0284c7' : 'white',
                      color: isActive ? 'white' : '#334155',
                      fontSize: '0.82rem',
                      fontWeight: isActive ? '700' : '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isActive ? '0 1px 3px rgba(2, 132, 199, 0.3)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {p}
                  </button>
                );
              })
            }

            <button
              type="button"
              disabled={safeCurrentPage === totalPages || totalItems === 0}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.82rem',
                fontWeight: '600',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: (safeCurrentPage === totalPages || totalItems === 0) ? '#f8fafc' : 'white',
                color: (safeCurrentPage === totalPages || totalItems === 0) ? '#94a3b8' : '#334155',
                cursor: (safeCurrentPage === totalPages || totalItems === 0) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                transition: 'all 0.15s ease'
              }}
            >
              <span>Next</span>
              <i className='bx bx-chevron-right'></i>
            </button>
          </div>
        </div>
      </div>

      {/* Change Details Popup Modal */}
      {selectedLog && (
        <div 
          onClick={() => setSelectedLog(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '620px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              animation: 'dropdownFadeIn 0.2s ease-out'
            }}
          >
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(to right, #0f172a, #1e293b)',
              padding: '1.25rem 1.5rem',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.72rem', background: '#38bdf8', color: '#0f172a', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    {selectedLog.page} Portal
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    • {selectedLog.subPage}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                    • {selectedLog.formattedDate}
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>
                  {selectedLog.summary}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem'
                }}
              >
                <i className='bx bx-x'></i>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Easy Language Explanation */}
              <div style={{
                background: '#f8fafc',
                borderLeft: '4px solid #0284c7',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.25rem'
              }}>
                <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <i className='bx bx-bulb'></i> In Plain Language (What & Why)
                </div>
                <p style={{ margin: 0, fontSize: '0.92rem', color: '#0f172a', lineHeight: '1.55' }}>
                  {selectedLog.plainLanguage || selectedLog.details}
                </p>
              </div>

              {/* Technical / Functional Details */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Implementation Summary
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: '1.5' }}>
                  {selectedLog.details}
                </p>
              </div>

              {/* Highlights List */}
              {selectedLog.highlights && selectedLog.highlights.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.85rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Key Highlights
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#334155', fontSize: '0.86rem', lineHeight: '1.6' }}>
                    {selectedLog.highlights.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '0.35rem' }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Ref: {selectedLog.id}
              </span>
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  style={{
                    padding: '0.45rem 1rem',
                    background: 'white',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    color: '#64748b',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const targetPath = selectedLog.path;
                    setSelectedLog(null);
                    navigate(targetPath);
                  }}
                  style={{
                    padding: '0.45rem 1.25rem',
                    background: '#0284c7',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <span>Open {selectedLog.linkText || 'Page'}</span>
                  <i className='bx bx-right-arrow-alt'></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

export default Home;
