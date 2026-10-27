import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

function ModuleSummaryPage({ defaultModule = 'Admin Portal', defaultSubmodule = 'Overview' }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract path info
  const pathParts = location.pathname.split('/').filter(Boolean);
  
  // Format helpers
  const formatGroup = (g) => {
    const map = {
      'cs': 'Customer Success',
      'ai-prompts': 'Mantra AI Prompts',
      'ehr': 'EHR',
      'refer': 'Refer & Earn',
      'pathway': 'Pathway',
      'corporate': 'Corporate',
      'orders': 'Orders',
      'providers': 'Providers',
      'users': 'Users',
      'products': 'Products',
      'ai-analytics': 'AI Analytics',
      'listing': 'Listing'
    };
    return map[g.toLowerCase()] || g.charAt(0).toUpperCase() + g.slice(1);
  };

  const formatSub = (s) => {
    if (!s) return 'Overview';
    return s.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  let groupName = defaultModule;
  let subName = defaultSubmodule;

  if (pathParts.length === 1) {
    groupName = formatGroup(pathParts[0]);
    subName = 'Overview';
  } else if (pathParts.length === 2) {
    groupName = formatGroup(pathParts[0]);
    subName = formatSub(pathParts[1]);
  } else if (pathParts.length >= 3) {
    if (pathParts[0] === 'cs') {
      groupName = `CS • ${formatSub(pathParts[1])}`;
      subName = formatSub(pathParts[2]);
    } else {
      groupName = `${formatGroup(pathParts[0])} • ${formatSub(pathParts[1])}`;
      subName = formatSub(pathParts[2]);
    }
  }

  const pageTitle = `${groupName} — ${subName}`;
  const isCs = location.pathname.startsWith('/cs') || defaultModule === 'Customer Success';

  // Live core modules separated by portal context
  const csLiveModules = [
    {
      title: 'CS Calendar',
      category: 'Customer Success',
      path: '/calendar',
      icon: 'bx-calendar',
      badge: 'Live & Active',
      color: '#0284c7',
      bg: '#e0f2fe',
      desc: 'Interactive schedule of client webinars, trainer assignments, session tracking, and real-time attendance logs.'
    },
    {
      title: 'HR Approval',
      category: 'Customer Success',
      path: '/hr-dash',
      icon: 'bx-user-circle',
      badge: 'Live & Active',
      color: '#0d9488',
      bg: '#ccfbf1',
      desc: 'HR stakeholder approvals, budget & remarks verification, and corporate session sign-offs.'
    },
    {
      title: 'Webinar Session Editor',
      category: 'Customer Success',
      path: '/edit',
      icon: 'bx-edit',
      badge: 'Live & Active',
      color: '#6366f1',
      bg: '#e0e7ff',
      desc: 'Create and configure webinar events, define budget and remarks, set trainers, and manage client attendees.'
    }
  ];

  const adminLiveModules = [
    {
      title: 'Accounts Receivable',
      category: 'Billing & Payments',
      path: '/client-payments',
      icon: 'bx-dollar-circle',
      badge: 'Live & Active',
      color: '#0284c7',
      bg: '#e0f2fe',
      desc: 'Invoice schedules preview, manual invoice remarks, currency conversions, billing copy message, and payment logging.'
    },
    {
      title: 'Corporate Clients',
      category: 'Client Operations',
      path: '/corporate',
      icon: 'bx-buildings',
      badge: 'Live & Active',
      color: '#16a34a',
      bg: '#dcfce7',
      desc: 'Enterprise accounts, division management, inline expandable onboarding forms, and team invite management.'
    },
    {
      title: 'Expense Approval',
      category: 'Finance & Compliance',
      path: '/expense-approval',
      icon: 'bx-receipt',
      badge: 'Live & Active',
      color: '#8b5cf6',
      bg: '#f3e8ff',
      desc: 'Corporate wellness budget validation, expense claims queue, budget & remarks tracker, and manager approvals.'
    },
    {
      title: 'Expert Assignment',
      category: 'Provider Network',
      path: '/expert-assignment',
      icon: 'bx-user-plus',
      badge: 'Live & Active',
      color: '#ea580c',
      bg: '#ffedd5',
      desc: 'Dedicated doctor and therapist matching, session allocation limits, and corporate capacity management.'
    },
    {
      title: 'Client P&L',
      category: 'Profitability Analysis',
      path: '/expense-tracker',
      icon: 'bx-pie-chart-alt',
      badge: 'Live & Active',
      color: '#0d9488',
      bg: '#ccfbf1',
      desc: 'Revenue vs. session cost breakdown, corporate wellness margin tracking, and webinar financial reports.'
    }
  ];

  const liveModules = isCs ? csLiveModules : adminLiveModules;

  // Dynamic sample test data records based on the current module
  const [testSearch, setTestSearch] = useState('');
  const [testFilter, setTestFilter] = useState('All');

  const sampleTestRecords = [
    {
      id: 'REC-101',
      name: `${subName} Standard Configuration`,
      type: groupName,
      status: 'Active',
      updated: 'Today, 11:45 AM',
      author: 'Admin System',
      tag: 'Verified'
    },
    {
      id: 'REC-102',
      name: `${subName} Corporate Enterprise Tier`,
      type: groupName,
      status: 'Pending Test',
      updated: '26 Oct 2026',
      author: 'MantraCare CS',
      tag: 'Staging'
    },
    {
      id: 'REC-103',
      name: `${subName} International Multi-Region Profile`,
      type: groupName,
      status: 'Active',
      updated: '24 Oct 2026',
      author: 'Compliance Lead',
      tag: 'Production'
    }
  ];

  return (
    <main style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto', color: '#0f172a' }}>
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
        <Link to={isCs ? "/cs/home" : "/orders/all"} style={{ color: '#0284c7', textDecoration: 'none' }}>
          {isCs ? 'CS Portal' : 'Admin Portal'}
        </Link>
        <span>/</span>
        <span style={{ color: '#64748b' }}>{groupName}</span>
        <span>/</span>
        <span style={{ color: '#0f172a', fontWeight: '600' }}>{subName}</span>
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
        <div style={{ maxWidth: '720px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.2)', padding: '0.3rem 0.85rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.85rem' }}>
            <i className={`bx ${isCs ? 'bx-calendar-star' : 'bx-check-circle'}`}></i>
            <span>{isCs ? 'MantraCare CS • Active Operations' : 'MantraCare Admin Portal • Active Project'}</span>
          </div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.9rem', fontWeight: '700', letterSpacing: '-0.02em', color: 'white' }}>
            {pageTitle}
          </h1>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#e0f2fe', lineHeight: '1.5' }}>
            {isCs 
              ? `Interactive test preview and architectural summary for the ${groupName} module. Manage client wellness webinars, trainer allocations, and HR approvals.`
              : `Interactive test preview and architectural summary for the ${groupName} engine. This project establishes the unified operating platform for corporate wellness operations, billing, and provider management.`
            }
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {isCs ? (
            <>
              <button
                onClick={() => navigate('/calendar')}
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
                <i className='bx bx-calendar'></i> CS Calendar
              </button>
              <button
                onClick={() => navigate('/hr-dash')}
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
                <i className='bx bx-user-circle'></i> HR Approval
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/corporate')}
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
                <i className='bx bx-buildings'></i> Corporate Clients
              </button>
              <button
                onClick={() => navigate('/client-payments')}
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
                <i className='bx bx-dollar-circle'></i> Accounts Receivable
              </button>
            </>
          )}
        </div>
      </div>

      {/* Interactive Test & Data Preview Card */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#eff6ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className='bx bx-vial'></i>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                {subName} • Test & Telemetry Preview
              </h3>
            </div>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              Simulated workspace records and pipeline status for {groupName} / {subName}.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <i className='bx bx-search' style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
              <input
                type="text"
                placeholder={`Search ${subName.toLowerCase()}...`}
                value={testSearch}
                onChange={(e) => setTestSearch(e.target.value)}
                style={{ padding: '0.45rem 0.75rem 0.45rem 2.2rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>
            <button
              style={{
                padding: '0.45rem 0.9rem',
                background: '#0284c7',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              onClick={() => alert(`Test action triggered for ${subName}`)}
            >
              <i className='bx bx-plus'></i> New {subName} Record
            </button>
          </div>
        </div>

        {/* Test Records Table */}
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.65rem 1rem' }}>Record ID</th>
                <th style={{ padding: '0.65rem 1rem' }}>Config / Item Name</th>
                <th style={{ padding: '0.65rem 1rem' }}>Module Group</th>
                <th style={{ padding: '0.65rem 1rem' }}>Status</th>
                <th style={{ padding: '0.65rem 1rem' }}>Environment</th>
                <th style={{ padding: '0.65rem 1rem' }}>Last Activity</th>
                <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sampleTestRecords
                .filter(r => !testSearch || r.name.toLowerCase().includes(testSearch.toLowerCase()) || r.id.toLowerCase().includes(testSearch.toLowerCase()))
                .map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#0284c7' }}>{row.id}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#1e293b', fontWeight: '500' }}>{row.name}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{row.type}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: '600',
                        background: row.status === 'Active' ? '#f0fdf4' : '#fffbeb',
                        color: row.status === 'Active' ? '#15803d' : '#b45309'
                      }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>
                      <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '500' }}>
                        {row.tag}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{row.updated}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => alert(`Executing test simulation for ${row.name}...`)}
                        style={{
                          background: 'none',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          padding: '0.25rem 0.6rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#0284c7',
                          cursor: 'pointer'
                        }}
                      >
                        Run Test
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Mission & Scope Cards */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className='bx bx-layer' style={{ color: '#0284c7' }}></i>
          What We Are Doing In This Project
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '1rem' }}>
              <i className='bx bx-receipt'></i>
            </div>
            <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
              Smart Invoicing & Remarks
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' }}>
              Full accounts receivable ledger with dynamic schedules, multi-currency conversions, instant invoice remark tooltips, and copyable billing summaries.
            </p>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '1rem' }}>
              <i className='bx bx-group'></i>
            </div>
            <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
              Access Roles & Invitations
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' }}>
              Granular role assignment for HR, Customer Success (CS), and Business Development (BD) with quick email invites and direct link sharing.
            </p>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '1rem' }}>
              <i className='bx bx-check-shield'></i>
            </div>
            <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
              Budget & Remarks Approvals
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' }}>
              Automated webinar and event approval flow verifying budgets, remarks, escalation trees, and division contract allowances.
            </p>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '1rem' }}>
              <i className='bx bx-expand-alt'></i>
            </div>
            <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
              Client Onboarding Portal
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' }}>
              Interactive inline expandable forms with live logs, SPOC management, billing entity records, and client form sharing links.
            </p>
          </div>
        </div>
      </div>

      {/* Active Live Modules in the Project */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Live Production Workspaces
            </h2>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              {isCs 
                ? 'Click any Customer Success module below to interact with client schedules, approvals, and webinars.'
                : 'Click any Admin module below to interact with client operations, billing, and financial features.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {liveModules.map((item) => (
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
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem' }}>
                    <i className={`bx ${item.icon}`}></i>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: '600', padding: '0.2rem 0.6rem', borderRadius: '999px', background: '#dcfce7', color: '#15803d' }}>
                    {item.badge}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>
                  {item.category}
                </div>
                <h4 style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                  {item.title}
                </h4>
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

      {/* System Architecture & Status Telemetry */}
      <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.2)' }}></div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' }}>
              MantraCare Platform Core Services: Operational
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Current Route: <code style={{ background: '#e2e8f0', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>{location.pathname}</code> • Client Session Active
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(isCs ? '/calendar' : '/client-payments')}
          style={{
            padding: '0.5rem 1rem',
            background: '#0284c7',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.82rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <span>{isCs ? 'Launch CS Calendar' : 'View Invoicing Dashboard'}</span>
          <i className='bx bx-chevron-right'></i>
        </button>
      </div>
    </main>
  );
}

export default ModuleSummaryPage;
