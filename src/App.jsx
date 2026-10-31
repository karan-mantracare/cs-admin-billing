import { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useGlobal } from './context/GlobalContext';
import Home from './pages/Home';
import CsPortal from './pages/CsPortal';
import Dashboard from './pages/Dashboard';
import EditWebinar from './pages/EditWebinar';
// import Clients from './pages/Clients';
// import Clients1 from './pages/Clients1';
import ClientPayments from './pages/ClientPayments';
import ExpenseTracker from './pages/ExpenseTracker';
import ExpenseApproval from './pages/ExpenseApproval';
import ExpertAssignment from './pages/ExpertAssignment';
import Sidebar from './components/Sidebar';
import HrDash from './pages/HrDash';
import Corporate from './pages/Corporate';
import EditCorporate from './pages/EditCorporate';
import EditDivision from './pages/EditDivision';
import ClientOnboardingPage from './pages/ClientOnboardingPage';
import ClientFeedbackPage from './pages/ClientFeedbackPage';
import AddOrder from './pages/AddOrder';
import ModuleSummaryPage from './pages/ModuleSummaryPage';
import CsFeedback from './pages/CsFeedback';
import UserPage from './pages/UserPage';
import AcceptInvite from './pages/AcceptInvite';
import ClientCadence from './pages/ClientCadence';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('logged_in_user');
      if (stored) return JSON.parse(stored);
    } catch {}
    return { name: 'Priya Sharma', company: 'Nova FinTech Solutions' };
  });

  useEffect(() => {
    const handleUserUpdate = () => {
      try {
        const stored = localStorage.getItem('logged_in_user');
        if (stored) setCurrentUser(JSON.parse(stored));
      } catch {}
    };
    window.addEventListener('storage', handleUserUpdate);
    window.addEventListener('user-profile-updated', handleUserUpdate);
    return () => {
      window.removeEventListener('storage', handleUserUpdate);
      window.removeEventListener('user-profile-updated', handleUserUpdate);
    };
  }, []);

  const { clients } = useGlobal();

  // List of all clients added in Corporate Tab
  const corporateClientNames = useMemo(() => {
    const list = new Set();
    
    // 1. From GlobalContext clients (Corporate Tab)
    if (Array.isArray(clients)) {
      clients.forEach((c) => {
        const name = c.name || c.companyName || c.clientName || c.corporateName;
        if (name && typeof name === 'string' && name.trim() && name !== 'N/A' && name !== 'All') {
          list.add(name.trim());
        }
      });
    }

    // 2. Also check localStorage cs-admin-clients directly
    try {
      const stored = JSON.parse(localStorage.getItem('cs-admin-clients') || '[]');
      if (Array.isArray(stored)) {
        stored.forEach((c) => {
          const name = c.name || c.companyName || c.clientName || c.corporateName;
          if (name && typeof name === 'string' && name.trim() && name !== 'N/A' && name !== 'All') {
            list.add(name.trim());
          }
        });
      }
    } catch {}

    // 3. Fallbacks if no clients have been created yet
    if (list.size === 0) {
      list.add('TechCorp Solutions');
      list.add('Corporate 1');
      list.add('Corporate 2');
    }

    if (currentUser?.company && typeof currentUser.company === 'string' && currentUser.company.trim()) {
      list.add(currentUser.company.trim());
    }

    return Array.from(list);
  }, [clients, currentUser?.company]);

  const handleCompanySelect = (newCompany) => {
    if (!newCompany) return;
    const updatedUser = {
      ...currentUser,
      company: newCompany
    };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('logged_in_user', JSON.stringify(updatedUser));
      localStorage.setItem('selected_company', newCompany);
    } catch {}
    window.dispatchEvent(new Event('user-profile-updated'));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('company-changed', { detail: { company: newCompany } }));
  };

  const isStandaloneClientView =
    location.pathname.startsWith('/client-onboarding') ||
    location.pathname.startsWith('/feedback-form') ||
    location.pathname.startsWith('/client-feedback') ||
    location.pathname.startsWith('/cs/feedback-form');

  const isCsRoute = location.pathname.startsWith('/cs') || 
                    location.pathname.startsWith('/calendar') || 
                    location.pathname.startsWith('/hr-dash') || 
                    location.pathname.startsWith('/edit') ||
                    location.pathname.startsWith('/cadence') ||
                    location.pathname.startsWith('/feedback');

  const isAdminRoute = location.pathname.startsWith('/admin') ||
                      location.pathname.startsWith('/orders') || 
                      location.pathname.startsWith('/corporate') || 
                      location.pathname.startsWith('/client-payments') || 
                      location.pathname.startsWith('/billing-and-payments') || 
                      location.pathname.startsWith('/accounts-receivable') || 
                      location.pathname.startsWith('/expense') || 
                      location.pathname.startsWith('/client-pl') || 
                      location.pathname.startsWith('/profitability') || 
                      location.pathname.startsWith('/expert') || 
                      location.pathname.startsWith('/providers') || 
                      location.pathname.startsWith('/users') || 
                      location.pathname.startsWith('/products') || 
                      location.pathname.startsWith('/refer') || 
                      location.pathname.startsWith('/pathway') || 
                      location.pathname.startsWith('/ai') || 
                      location.pathname.startsWith('/ehr') || 
                      location.pathname.startsWith('/listing');

  return (
    <div className="layout">
      {!isStandaloneClientView && (
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      )}
      
      {!isStandaloneClientView && (
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <i className='bx bx-menu'></i>
            </button>
            <div className="logo" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
              <i className='bx bx-heart-circle'></i>
            <span>MantraCare</span>
          </div>
        </div>

        {/* Global Portal Switcher */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
          <NavLink
            to="/home"
            style={({ isActive }) => ({
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: isActive ? '#0284c7' : '#64748b',
              background: isActive ? '#ffffff' : 'transparent',
              boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease'
            })}
          >
            <i className='bx bx-home-alt'></i>
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/cs/home"
            style={() => ({
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: isCsRoute ? '#0284c7' : '#64748b',
              background: isCsRoute ? '#ffffff' : 'transparent',
              boxShadow: isCsRoute ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease'
            })}
          >
            <i className='bx bx-calendar-event'></i>
            <span>CS Portal</span>
          </NavLink>

          <NavLink
            to="/admin"
            style={() => ({
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: isAdminRoute ? '#0284c7' : '#64748b',
              background: isAdminRoute ? '#ffffff' : 'transparent',
              boxShadow: isAdminRoute ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease'
            })}
          >
            <i className='bx bx-shield-quarter'></i>
            <span>Admin Portal</span>
          </NavLink>
        </nav>

        <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Company Selector (Clients from Corporate Tab) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '0.28rem 0.55rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}>
            <i className="bx bx-buildings" style={{ color: '#0284c7', fontSize: '1rem' }}></i>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>Company:</span>
            <select
              value={currentUser.company || ''}
              onChange={(e) => handleCompanySelect(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontWeight: '700',
                fontSize: '0.82rem',
                color: '#0f172a',
                cursor: 'pointer',
                minWidth: '120px',
                maxWidth: '180px'
              }}
              title="Select Company (from Corporate Clients list)"
            >
              {corporateClientNames.map((compName) => (
                <option key={compName} value={compName}>
                  {compName}
                </option>
              ))}
            </select>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '0.3rem 0.65rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            color: '#475569',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}>
            <i className="bx bx-user" style={{ color: '#0284c7' }}></i>
            <span>Logged in: <strong style={{ color: '#0f172a' }}>{currentUser.name || 'Priya Sharma'}</strong> ({currentUser.company || 'Nova FinTech Solutions'})</span>
          </div>
          <div className="avatar" title={currentUser.name || 'User'}>
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </header>
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/cs" element={<Navigate to="/cs/home" replace />} />
        <Route path="/cs/home" element={<CsPortal />} />
        <Route path="/cs/cadence" element={<ClientCadence />} />
        <Route path="/cadence" element={<Navigate to="/cs/cadence" replace />} />
        <Route path="/cs/feedback" element={<CsFeedback />} />
        <Route path="/feedback" element={<Navigate to="/cs/feedback" replace />} />
        <Route path="/cs/*" element={<ModuleSummaryPage defaultModule="Customer Success" />} />
        <Route path="/admin" element={<Navigate to="/orders/all" replace />} />
        <Route path="/calendar" element={<Dashboard />} />
        <Route path="/edit" element={<EditWebinar />} />
        <Route path="/hr-dash" element={<HrDash />} />
        {/* <Route path="/clients" element={<Clients />} /> */}
        {/* <Route path="/clients-1" element={<Clients1 />} /> */}
        <Route path="/corporate" element={<Corporate />} />
        <Route path="/corporate/edit" element={<EditCorporate />} />
        <Route path="/corporate/edit/:id" element={<EditCorporate />} />
        <Route path="/corporate/division/edit" element={<EditDivision />} />
        <Route path="/corporate/division/edit/:id" element={<EditDivision />} />
        <Route path="/corporate/division/order/add" element={<AddOrder />} />
        <Route path="/corporate/division/order/add/:orderId" element={<AddOrder />} />
        <Route path="/corporate/division/order/edit/:orderId" element={<AddOrder />} />
        <Route path="/client-onboarding/:id" element={<ClientOnboardingPage />} />
        <Route path="/feedback-form/:id" element={<ClientFeedbackPage />} />
        <Route path="/feedback-form" element={<ClientFeedbackPage />} />
        <Route path="/client-feedback/:id" element={<ClientFeedbackPage />} />
        <Route path="/client-feedback" element={<ClientFeedbackPage />} />
        <Route path="/cs/feedback-form/:id" element={<ClientFeedbackPage />} />
        <Route path="/cs/feedback-form" element={<ClientFeedbackPage />} />
        <Route path="/client-payments" element={<ClientPayments />} />
        <Route path="/billing-and-payments" element={<ClientPayments />} />
        <Route path="/accounts-receivable" element={<ClientPayments />} />
        <Route path="/expert-assignment" element={<ExpertAssignment />} />
        <Route path="/expense-tracker" element={<ExpenseTracker />} />
        <Route path="/client-pl" element={<ExpenseTracker />} />
        <Route path="/profitability" element={<ExpenseTracker />} />
        <Route path="/expense-approval" element={<ExpenseApproval />} />

        {/* Sidebar Modules with Project Summary and Live Workspaces */}
        <Route path="/orders/*" element={<ModuleSummaryPage defaultModule="Orders" />} />
        <Route path="/providers/*" element={<ModuleSummaryPage defaultModule="Providers" />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/users" element={<UserPage />} />
        <Route path="/users/all" element={<UserPage />} />
        <Route path="/users/*" element={<ModuleSummaryPage defaultModule="Users" />} />
        <Route path="/corporate/:section" element={<ModuleSummaryPage defaultModule="Corporate" />} />
        <Route path="/products/*" element={<ModuleSummaryPage defaultModule="Products" />} />
        <Route path="/refer/*" element={<ModuleSummaryPage defaultModule="Refer & Earn" />} />
        <Route path="/pathway/*" element={<ModuleSummaryPage defaultModule="Pathway" />} />
        <Route path="/ai-prompts/*" element={<ModuleSummaryPage defaultModule="Mantra AI Prompts" />} />
        <Route path="/ehr/*" element={<ModuleSummaryPage defaultModule="EHR" />} />
        <Route path="/ai-analytics/*" element={<ModuleSummaryPage defaultModule="AI Analytics" />} />
        <Route path="/listing/*" element={<ModuleSummaryPage defaultModule="Listing" />} />
      </Routes>
    </div>
  );
}

export default App;
