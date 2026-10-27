import { useState } from 'react';
import { Routes, Route, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
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
import AddOrder from './pages/AddOrder';
import ModuleSummaryPage from './pages/ModuleSummaryPage';
import CsFeedback from './pages/CsFeedback';
import UserPage from './pages/UserPage';
import AcceptInvite from './pages/AcceptInvite';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isCsRoute = location.pathname.startsWith('/cs') || 
                    location.pathname.startsWith('/calendar') || 
                    location.pathname.startsWith('/hr-dash') || 
                    location.pathname.startsWith('/edit');

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
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
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

        <div className="user-profile">
          <div className="avatar">U</div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/cs" element={<Navigate to="/cs/home" replace />} />
        <Route path="/cs/home" element={<CsPortal />} />
        <Route path="/cs/feedback" element={<CsFeedback />} />
        <Route path="/feedback" element={<CsFeedback />} />
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
