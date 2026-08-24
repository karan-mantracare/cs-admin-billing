import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import EditWebinar from './pages/EditWebinar';
import Clients from './pages/Clients';
import Clients1 from './pages/Clients1';
import ClientPayments from './pages/ClientPayments';
import EventApproval from './pages/EventApproval';
import ExpenseTracker from './pages/ExpenseTracker';
import Sidebar from './components/Sidebar';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="layout">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <header className="topbar">
        <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
          <i className='bx bx-menu'></i>
        </button>
        <div className="logo">
          <i className='bx bx-heart-circle'></i>
          <span>MantraCare</span>
        </div>
        <div className="user-profile">
          <div className="avatar">U</div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/calendar" replace />} />
        <Route path="/calendar" element={<Dashboard />} />
        <Route path="/edit" element={<EditWebinar />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients-1" element={<Clients1 />} />
        <Route path="/client-payments" element={<ClientPayments />} />
        <Route path="/event-approval" element={<EventApproval />} />
        <Route path="/expence-tracker" element={<ExpenseTracker />} />
      </Routes>
    </div>
  );
}

export default App;
