import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import ViewOnboardingModal from '../components/ViewOnboardingModal';
import PaymentSummaryModal from '../components/PaymentSummaryModal';
import PaymentScheduleModal from '../components/PaymentScheduleModal';
import ConfirmModal from '../components/ConfirmModal';
import DocumentUploadModal from '../components/DocumentUploadModal';
import { saveUser, getAllUsers, getUserById } from '../utils/userStorage';

function EditDivision() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id') || searchParams.get('divisionId');
  const targetDivisionId = paramId || queryId || location.state?.division?.id || location.state?.divisionId;

  const { clients, showToast } = useGlobal();

  // Resolve division from location.state or clients context or localStorage
  const division = useMemo(() => {
    if (location.state?.division) return location.state.division;
    if (targetDivisionId) {
      for (const c of (clients || [])) {
        if (c.divisions && Array.isArray(c.divisions)) {
          const found = c.divisions.find(d => String(d.id) === String(targetDivisionId));
          if (found) return { ...found, clientName: found.clientName || c.name };
        }
      }
      try {
        const savedClients = JSON.parse(localStorage.getItem('cs-admin-clients') || '[]');
        for (const c of savedClients) {
          if (c.divisions && Array.isArray(c.divisions)) {
            const found = c.divisions.find(d => String(d.id) === String(targetDivisionId));
            if (found) return { ...found, clientName: found.clientName || c.name };
          }
        }
      } catch (e) {}
      try {
        const savedOrders = JSON.parse(localStorage.getItem('division_orders') || '[]');
        const matchedOrder = savedOrders.find(o => String(o.divisionId) === String(targetDivisionId) || o.divisionName === targetDivisionId);
        if (matchedOrder) {
          return {
            id: targetDivisionId,
            divisionName: matchedOrder.divisionName || `Division #${targetDivisionId}`,
            clientName: matchedOrder.clientName || 'Corporate Client',
            status: 'Active'
          };
        }
      } catch (e) {}
    }
    return {
      id: targetDivisionId || '1',
      divisionName: targetDivisionId ? `Division #${targetDivisionId}` : 'Default Division',
      clientName: 'Corporate Client',
      status: 'Active'
    };
  }, [location.state, targetDivisionId, clients]);

  const [formData, setFormData] = useState({
    divisionName: division?.divisionName || '',
    clientName: division?.clientName || '',
    clientEmail: division?.clientEmail || '',
    remarks: division?.remarks || '',
    status: division?.status || 'Active',
    keySpoc: division.keySpoc || { name: '', email: '', contact: '' },
    escalationSpocs: division.escalationSpocs?.length ? division.escalationSpocs : [{ id: Date.now(), name: '', email: '', contact: '', designation: '' }],
    billingDetails: division.billingDetails || { companyName: '', gstNumber: '', address: '' },
    billingSpocs: division.billingSpocs?.length ? division.billingSpocs : [{ id: Date.now(), name: '', email: '', contact: '', department: 'Billing' }],
    expectations: division.expectations || ''
  });

  const [isOtherDetailsOpen, setIsOtherDetailsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFiled, setIsFiled] = useState(false);
  const [filedData, setFiledData] = useState(null);
  
  const [isOnboardingExpanded, setIsOnboardingExpanded] = useState(false);
  const [isEditingOnboarding, setIsEditingOnboarding] = useState(false);
  const [onboardingLogs, setOnboardingLogs] = useState(() => {
    const saved = localStorage.getItem('onboardingLogs_' + (division?.id || '1'));
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });
  const [onboardingFormState, setOnboardingFormState] = useState({
    keySpoc: division?.keySpoc || { name: '', email: '', contact: '' },
    escalationSpocs: division?.escalationSpocs?.length ? division.escalationSpocs : [{ id: 1, name: '', email: '', contact: '', designation: '' }],
    billingDetails: division?.billingDetails || { companyName: '', gstNumber: '', address: '' },
    billingSpocs: division?.billingSpocs?.length ? division.billingSpocs : [{ id: 1, name: '', email: '', contact: '', department: 'Billing' }],
    expectations: division?.expectations || ''
  });
  
  const [orders, setOrders] = useState([]);

  const [isPaymentSummaryOpen, setIsPaymentSummaryOpen] = useState(false);
  const [isPaymentScheduleOpen, setIsPaymentScheduleOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [divisionDocs, setDivisionDocs] = useState([]);
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm'
  });

  // Access & Roles: Invites state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ role: 'HR', email: '' });
  const [copiedInviteId, setCopiedInviteId] = useState(null);
  const [hoveredAction, setHoveredAction] = useState(null);
  const [invites, setInvites] = useState(() => {
    const saved = localStorage.getItem('division_invites_' + (division?.id || '1'));
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [
      { id: 1, email: 'priya.hr@company.com', role: 'HR', status: 'Pending', invitedAt: '2026-10-15' }
    ];
  });

  // Access & Roles: Role members state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    email: '',
    role: 'Customer Success',
    isPrimary: false
  });

  const [roles, setRoles] = useState(() => {
    const saved = localStorage.getItem('division_roles_' + (division?.id || '1'));
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    const savedByName = localStorage.getItem('division_roles_' + (division?.divisionName || 'testt'));
    if (savedByName) {
      try { return JSON.parse(savedByName); } catch (e) { return []; }
    }
    return division?.roles && Array.isArray(division.roles) && division.roles.length > 0 
      ? division.roles 
      : [
          {
            id: 1,
            name: 'Karan Hinduja',
            email: 'hinduja1988@gmail.com',
            role: 'Customer Success',
            isPrimary: true
          }
        ];
  });

  const handleOpenAddRole = () => {
    setEditingRoleId(null);
    setRoleForm({
      name: '',
      email: '',
      role: 'Customer Success',
      isPrimary: false
    });
    setIsRoleModalOpen(true);
  };

  const handleOpenEditRole = (r) => {
    setEditingRoleId(r.id);
    setRoleForm({
      name: r.name || '',
      email: r.email || '',
      role: r.role || 'Customer Success',
      isPrimary: Boolean(r.isPrimary)
    });
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = (e) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      showToast('Please enter a name for the role member', 'error');
      return;
    }
    let updated;
    if (editingRoleId) {
      updated = roles.map(r => r.id === editingRoleId ? { ...r, ...roleForm } : r);
      showToast('Role member updated successfully!');
    } else {
      const newRole = {
        id: Date.now(),
        ...roleForm
      };
      updated = [...roles, newRole];
      showToast('New role member added successfully!');
    }
    setRoles(updated);
    localStorage.setItem('division_roles_' + (division?.id || '1'), JSON.stringify(updated));
    localStorage.setItem('division_roles_' + (formData.divisionName || division?.divisionName || 'testt'), JSON.stringify(updated));
    
    // Sync to central user directory (/user)
    try {
      saveUser({
        user_id: editingRoleId ? 'USR-ROL-' + String(editingRoleId).slice(-4) : 'USR-ROL-' + String(Date.now()).slice(-4),
        name: roleForm.name.trim(),
        email: roleForm.email ? roleForm.email.trim() : `${roleForm.name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
        role: roleForm.role || 'Customer Success',
        divisionAccess: formData.divisionName || division?.divisionName || 'All',
        isPrimary: Boolean(roleForm.isPrimary),
        status: 'Active'
      });
    } catch {}

    window.dispatchEvent(new Event('storage'));
    setIsRoleModalOpen(false);
  };

  const handleDeleteRole = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Remove Role Member',
      message: 'Are you sure you want to remove this member from the division roles?',
      confirmText: 'Remove',
      onConfirm: () => {
        const updated = roles.filter(r => r.id !== id);
        setRoles(updated);
        localStorage.setItem('division_roles_' + (division?.id || '1'), JSON.stringify(updated));
        localStorage.setItem('division_roles_' + (formData.divisionName || division?.divisionName || 'testt'), JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        showToast('Role member removed');
      }
    });
  };

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.email.trim()) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    const newInvite = {
      id: Date.now(),
      email: inviteForm.email.trim(),
      role: inviteForm.role,
      status: 'Pending',
      invitedAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newInvite, ...invites];
    setInvites(updated);
    localStorage.setItem('division_invites_' + (division?.id || '1'), JSON.stringify(updated));
    
    // Sync to central user directory (/user)
    try {
      saveUser({
        user_id: 'USR-INV-' + String(newInvite.id).slice(-4),
        name: newInvite.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: newInvite.email,
        role: newInvite.role === 'CS' ? 'Customer Success' : newInvite.role === 'BD' ? 'Business Development' : newInvite.role || 'HR',
        divisionAccess: formData.divisionName || division?.divisionName || 'Healthcare',
        status: 'Pending',
        invitedAt: newInvite.invitedAt
      });
    } catch {}

    setIsInviteModalOpen(false);
    setInviteForm({ role: 'HR', email: '' });
    showToast(`Invitation sent to ${newInvite.email} successfully!`);
  };

  const handleResendInvite = (invite) => {
    showToast(`Invitation email resent to ${invite.email}!`);
  };

  const handleCopyInviteLink = (invite) => {
    const inviteLink = `${window.location.origin}/accept-invite?token=${encodeURIComponent(btoa(invite.email + ':' + invite.role))}&email=${encodeURIComponent(invite.email)}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(inviteLink);
    }
    setCopiedInviteId(invite.id);
    setTimeout(() => setCopiedInviteId(null), 2000);
    showToast('Invite link copied to clipboard!');
  };

  const handleDeleteInvite = (inviteId) => {
    const updated = invites.filter(inv => inv.id !== inviteId);
    setInvites(updated);
    localStorage.setItem('division_invites_' + (division?.id || '1'), JSON.stringify(updated));
    showToast('Invitation cancelled.');
  };

  const handleMarkInviteAccepted = (invite) => {
    const updated = invites.map(inv => inv.id === invite.id ? { ...inv, status: 'Accepted' } : inv);
    setInvites(updated);
    localStorage.setItem('division_invites_' + (division?.id || '1'), JSON.stringify(updated));

    // Also add to roles if not present
    if (!roles.some(r => r.email?.toLowerCase() === invite.email?.toLowerCase())) {
      const userObj = getUserById(invite.email);
      const newRole = {
        id: Date.now(),
        name: userObj?.name && userObj.name !== 'Karan Hinduja' ? userObj.name : invite.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: invite.email,
        role: invite.role === 'CS' ? 'Customer Success' : invite.role === 'BD' ? 'Business Development' : invite.role || 'HR',
        isPrimary: false
      };
      const updatedRoles = [...roles, newRole];
      setRoles(updatedRoles);
      localStorage.setItem('division_roles_' + (division?.id || '1'), JSON.stringify(updatedRoles));
      localStorage.setItem('division_roles_' + (formData.divisionName || division?.divisionName || 'testt'), JSON.stringify(updatedRoles));
      saveUser({ ...newRole, status: 'Active', divisionAccess: formData.divisionName || division?.divisionName || 'Healthcare' });
    }

    showToast(`Marked ${invite.email} as Accepted!`);
  };

  // Auto-sync accepted users and invites with userStorage and localStorage
  useEffect(() => {
    const syncRolesAndInvites = () => {
      try {
        const allUsers = getAllUsers();
        const divKey = 'division_invites_' + (division?.id || '1');
        const savedInvitesRaw = localStorage.getItem(divKey) || localStorage.getItem('division_invites_1');
        let currentInvites = savedInvitesRaw ? JSON.parse(savedInvitesRaw) : [
          { id: 1, email: 'priya.hr@company.com', role: 'HR', status: 'Pending', invitedAt: '2026-10-15' }
        ];

        // 1. Cross-reference invites with user directory
        let invitesModified = false;
        currentInvites = currentInvites.map((inv) => {
          const matchingUser = allUsers.find(u => u.email?.toLowerCase() === inv.email?.toLowerCase());
          if (matchingUser && (matchingUser.status === 'Active' || matchingUser.acceptedAt) && inv.status !== 'Accepted') {
            invitesModified = true;
            return { ...inv, status: 'Accepted', name: matchingUser.name };
          }
          return inv;
        });

        if (invitesModified) {
          setInvites(currentInvites);
          localStorage.setItem(divKey, JSON.stringify(currentInvites));
        }

        // 2. Cross-reference accepted invites with active roles list
        const roleKey = 'division_roles_' + (division?.id || '1');
        const savedRolesRaw = localStorage.getItem(roleKey) || localStorage.getItem('division_roles_1');
        let currentRoles = savedRolesRaw ? JSON.parse(savedRolesRaw) : [
          { id: 1, name: 'Karan Hinduja', email: 'hinduja1988@gmail.com', role: 'Customer Success', isPrimary: true }
        ];

        let rolesModified = false;
        currentInvites.forEach((inv) => {
          if (inv.status === 'Accepted') {
            if (!currentRoles.some(r => r.email?.toLowerCase() === inv.email?.toLowerCase())) {
              const matchingUser = allUsers.find(u => u.email?.toLowerCase() === inv.email?.toLowerCase());
              currentRoles.push({
                id: Date.now() + Math.floor(Math.random() * 100),
                name: matchingUser?.name || inv.name || inv.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                email: inv.email,
                role: inv.role === 'CS' ? 'Customer Success' : inv.role === 'BD' ? 'Business Development' : inv.role || 'HR',
                isPrimary: false
              });
              rolesModified = true;
            }
          }
        });

        if (rolesModified) {
          setRoles(currentRoles);
          localStorage.setItem(roleKey, JSON.stringify(currentRoles));
        }
      } catch (err) {
        console.warn('Error syncing roles and invites:', err);
      }
    };

    syncRolesAndInvites();
    window.addEventListener('storage', syncRolesAndInvites);
    window.addEventListener('focus', syncRolesAndInvites);
    return () => {
      window.removeEventListener('storage', syncRolesAndInvites);
      window.removeEventListener('focus', syncRolesAndInvites);
    };
  }, [division?.id]);

  useEffect(() => {
    const fetchDocs = () => {
      const saved = localStorage.getItem('division_documents');
      if (saved) {
        const allDocs = JSON.parse(saved);
        setDivisionDocs(allDocs.filter(d => String(d.divisionId) === String(division.id)));
      } else {
        setDivisionDocs([]);
      }
    };
    fetchDocs();
    window.addEventListener('storage', fetchDocs);
    return () => window.removeEventListener('storage', fetchDocs);
  }, [division.id]);

  const handleSaveDocument = (doc) => {
    const newDoc = {
      ...doc,
      divisionId: division.id,
      orderId: '',
      orderName: ''
    };
    
    const allDocs = JSON.parse(localStorage.getItem('division_documents') || '[]');
    allDocs.push(newDoc);
    localStorage.setItem('division_documents', JSON.stringify(allDocs));
    
    setDivisionDocs(prev => [...prev, newDoc]);
    setIsDocModalOpen(false);
  };

  const deleteDivisionDocument = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Document',
      message: 'Are you sure you want to delete this document from the division?',
      confirmText: 'Delete',
      onConfirm: () => {
        const allDocs = JSON.parse(localStorage.getItem('division_documents') || '[]');
        const updatedDocs = allDocs.filter(d => d.id !== id);
        localStorage.setItem('division_documents', JSON.stringify(updatedDocs));
        setDivisionDocs(prev => prev.filter(d => d.id !== id));
      }
    });
  };

  useEffect(() => {
    const fetchOrders = () => {
      const saved = localStorage.getItem('division_orders');
      if (saved) {
        const allOrders = JSON.parse(saved);
        setOrders(allOrders.filter(o => o.divisionName === formData.divisionName));
      } else {
        setOrders([]);
      }
    };
    
    fetchOrders();
    
    // Support cross-tab or fast navigation refreshes
    window.addEventListener('storage', fetchOrders);
    return () => window.removeEventListener('storage', fetchOrders);
  }, []);

  const deleteOrder = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Order',
      message: 'Are you sure you want to delete this order?',
      confirmText: 'Delete',
      onConfirm: () => {
        const updatedOrders = orders.filter(o => o.id !== id);
        setOrders(updatedOrders);
        localStorage.setItem('division_orders', JSON.stringify(updatedOrders));
      }
    });
  };

  const addOnboardingLog = (action, status = 'Info') => {
    const now = new Date();
    const timeStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
                    now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog = { action, time: timeStr, status, id: Date.now() };
    setOnboardingLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 5);
      localStorage.setItem('onboardingLogs_' + (division?.id || '1'), JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const checkFiledStatus = () => {
      const saved = localStorage.getItem('onboardingFiled_' + (division.id || '1'));
      if (saved) {
        setIsFiled(true);
        const parsed = JSON.parse(saved);
        setFiledData(parsed);
        setOnboardingFormState({
          keySpoc: parsed.keySpoc || { name: '', email: '', contact: '' },
          escalationSpocs: parsed.escalationSpocs?.length ? parsed.escalationSpocs : [{ id: 1, name: '', email: '', contact: '', designation: '' }],
          billingDetails: parsed.billingDetails || { companyName: '', gstNumber: '', address: '' },
          billingSpocs: parsed.billingSpocs?.length ? parsed.billingSpocs : [{ id: 1, name: '', email: '', contact: '', department: 'Billing' }],
          expectations: parsed.expectations || ''
        });
      }
    };
    
    checkFiledStatus();
    
    // Listen for changes from other tabs
    window.addEventListener('storage', checkFiledStatus);
    return () => window.removeEventListener('storage', checkFiledStatus);
  }, [division.id]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/client-onboarding/${division.id || '1'}`;
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      addOnboardingLog('Link copied to clipboard', 'Copied');
      if (showToast) showToast('Onboarding link copied to clipboard!', 3000);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleKeySpocChange = (e) => {
    const { name, value } = e.target;
    setOnboardingFormState(prev => ({
      ...prev,
      keySpoc: { ...prev.keySpoc, [name]: value }
    }));
  };

  const handleBillingDetailsChange = (e) => {
    const { name, value } = e.target;
    setOnboardingFormState(prev => ({
      ...prev,
      billingDetails: { ...prev.billingDetails, [name]: value }
    }));
  };

  const handleEscalationChange = (id, field, value) => {
    setOnboardingFormState(prev => ({
      ...prev,
      escalationSpocs: prev.escalationSpocs.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const addEscalationSpoc = () => {
    setOnboardingFormState(prev => ({
      ...prev,
      escalationSpocs: [...prev.escalationSpocs, { id: Date.now(), name: '', email: '', contact: '', designation: '' }]
    }));
  };

  const removeEscalationSpoc = (id) => {
    if (onboardingFormState.escalationSpocs.length <= 1) return;
    setOnboardingFormState(prev => ({
      ...prev,
      escalationSpocs: prev.escalationSpocs.filter(s => s.id !== id)
    }));
  };

  const handleBillingSpocChange = (id, field, value) => {
    setOnboardingFormState(prev => ({
      ...prev,
      billingSpocs: prev.billingSpocs.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const addBillingSpoc = () => {
    setOnboardingFormState(prev => ({
      ...prev,
      billingSpocs: [...prev.billingSpocs, { id: Date.now(), name: '', email: '', contact: '', department: 'Billing' }]
    }));
  };

  const removeBillingSpoc = (id) => {
    if (onboardingFormState.billingSpocs.length <= 1) return;
    setOnboardingFormState(prev => ({
      ...prev,
      billingSpocs: prev.billingSpocs.filter(s => s.id !== id)
    }));
  };

  const handleSaveOnboarding = () => {
    const dataToSave = {
      ...onboardingFormState,
      submittedAt: filedData?.submittedAt || new Date().toISOString()
    };
    localStorage.setItem('onboardingFiled_' + (division.id || '1'), JSON.stringify(dataToSave));
    setIsFiled(true);
    setFiledData(dataToSave);
    setIsEditingOnboarding(false);
    addOnboardingLog('Updated by Admin', 'Saved');
    if (showToast) showToast('Onboarding details updated successfully!', 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    localStorage.setItem('division_roles_' + (division?.id || '1'), JSON.stringify(roles));
    localStorage.setItem('division_roles_' + (formData.divisionName || division?.divisionName || 'testt'), JSON.stringify(roles));
    window.dispatchEvent(new Event('storage'));
    showToast('Division details and roles saved successfully!');
    navigate(-1);
  };

  return (
    <main className="main-content">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#003366', margin: 0, fontSize: '1.75rem', fontWeight: '600' }}>{division.divisionName || 'Division Name'}</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-outline" style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '6px', fontSize: '0.85rem' }}>
            Department
          </button>
          <button className="btn-outline" style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '6px', fontSize: '0.85rem' }}>
            Corporate Data
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '0.3rem', borderRadius: '4px', display: 'flex' }}>
              <i className='bx bx-briefcase' style={{ fontSize: '1.1rem' }}></i>
            </div>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Division Details</h3>
          </div>
          <span style={{ 
            background: formData.status === 'Active' ? '#dcfce7' : '#fee2e2', 
            color: formData.status === 'Active' ? '#166534' : '#991b1b', 
            padding: '0.3rem 0.8rem', 
            borderRadius: '20px', 
            fontSize: '0.85rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <i className={`bx ${formData.status === 'Active' ? 'bx-check-circle' : 'bx-x-circle'}`}></i>
            {formData.status}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
          {/* Form Fields - Left Side */}
          <div style={{ flex: 1 }}>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Division Name</label>
                <input type="text" className="form-control" name="divisionName" value={formData.divisionName} onChange={handleInputChange} style={{ padding: '0.5rem', fontSize: '0.85rem' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Client Name</label>
                <input type="text" className="form-control" name="clientName" value={formData.clientName} onChange={handleInputChange} style={{ padding: '0.5rem', fontSize: '0.85rem' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Client Email</label>
                <input type="email" className="form-control" name="clientEmail" value={formData.clientEmail} onChange={handleInputChange} style={{ padding: '0.5rem', fontSize: '0.85rem' }} />
              </div>
            </div>

            {/* Collapsible Section: Other Details */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
              <button 
                type="button"
                onClick={() => setIsOtherDetailsOpen(!isOtherDetailsOpen)}
                style={{ 
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '0.85rem 1.25rem', background: isOtherDetailsOpen ? '#f1f5f9' : '#f8fafc', border: 'none', cursor: 'pointer',
                  fontSize: '0.92rem', color: '#1e293b', fontWeight: '600', transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <i className='bx bx-slider-alt' style={{ color: '#0284c7', fontSize: '1.15rem' }}></i>
                  <span>Additional Details & Onboarding Form</span>
                </div>
                <i className={`bx ${isOtherDetailsOpen ? 'bx-chevron-up' : 'bx-chevron-down'}`} style={{ fontSize: '1.25rem', color: '#64748b' }}></i>
              </button>
              
              {isOtherDetailsOpen && (
                <div style={{ padding: '1.5rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Remarks */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Remarks</label>
                    <textarea 
                      className="form-control" 
                      name="remarks" 
                      value={formData.remarks} 
                      onChange={handleInputChange} 
                      rows="2"
                      style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                      placeholder="Internal notes about this division..."
                    ></textarea>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: 0 }} />

                  {/* Onboarding Form Card */}
                  <div style={{ 
                    padding: '1.35rem 1.5rem', 
                    background: '#ffffff', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.2s ease'
                  }}>
                    {/* Header Row: Icon + Title & Status + Action Group */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                      {/* Left: Icon & Title/Status */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', minWidth: '260px', flex: '1 1 auto' }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          background: '#eff6ff',
                          border: '1px solid #dbeafe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#2563eb',
                          flexShrink: 0
                        }}>
                          <i className='bx bx-id-card' style={{ fontSize: '1.45rem' }}></i>
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                            <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: '700' }}>
                              Onboarding Form
                            </h4>
                            {isFiled ? (
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.35rem', 
                                color: '#15803d', 
                                background: '#f0fdf4', 
                                border: '1px solid #bbf7d0', 
                                padding: '0.2rem 0.65rem', 
                                borderRadius: '999px', 
                                fontSize: '0.75rem', 
                                fontWeight: '600' 
                              }}>
                                <i className='bx bx-check-circle'></i>
                                Filed on {filedData?.submittedAt ? new Date(filedData.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '05 Sep 2026'}
                              </span>
                            ) : (
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.35rem', 
                                color: '#b45309', 
                                background: '#fffbeb', 
                                border: '1px solid #fde68a', 
                                padding: '0.2rem 0.65rem', 
                                borderRadius: '999px', 
                                fontSize: '0.75rem', 
                                fontWeight: '600' 
                              }}>
                                <i className='bx bx-time-five'></i>
                                Status: Pending submission
                              </span>
                            )}
                          </div>
                          <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                            Copy the link to share the onboarding form with the client or inspect submission details.
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions in a clean, unified horizontal row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {/* 1. Preview Link */}
                        <button
                          type="button"
                          onClick={() => window.open(`${window.location.origin}/client-onboarding/${division?.id || '1'}`, '_blank')}
                          title="Open onboarding form in new tab"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.45rem 0.85rem',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            color: '#475569',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.borderColor = '#94a3b8';
                            e.currentTarget.style.color = '#0f172a';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#ffffff';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.color = '#475569';
                          }}
                        >
                          <i className='bx bx-external-link' style={{ fontSize: '1rem' }}></i>
                          Preview
                        </button>

                        {/* 2. Copy Link Button */}
                        <button 
                          type="button"
                          onClick={handleCopyLink}
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '0.45rem', 
                            padding: '0.45rem 1.05rem', 
                            background: isCopied ? '#10b981' : '#2563eb', 
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.85rem', 
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: isCopied ? '0 1px 3px rgba(16, 185, 129, 0.3)' : '0 1px 3px rgba(37, 99, 235, 0.25)',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!isCopied) e.currentTarget.style.background = '#1d4ed8';
                          }}
                          onMouseLeave={(e) => {
                            if (!isCopied) e.currentTarget.style.background = '#2563eb';
                          }}
                        >
                          <i className={`bx ${isCopied ? 'bx-check' : 'bx-copy'}`} style={{ fontSize: '1rem' }}></i> 
                          {isCopied ? 'Copied!' : 'Copy the Link'}
                        </button>

                        {/* 3. Expand / Collapse Details Button */}
                        <button 
                          type="button"
                          onClick={() => setIsOnboardingExpanded(!isOnboardingExpanded)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.45rem 0.85rem',
                            background: isOnboardingExpanded ? '#eff6ff' : '#f8fafc',
                            border: `1px solid ${isOnboardingExpanded ? '#93c5fd' : '#cbd5e1'}`,
                            borderRadius: '8px',
                            color: isOnboardingExpanded ? '#1d4ed8' : '#334155',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          title={isOnboardingExpanded ? "Collapse onboarding details" : "Expand onboarding details"}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = isOnboardingExpanded ? '#dbeafe' : '#f1f5f9';
                            e.currentTarget.style.borderColor = isOnboardingExpanded ? '#60a5fa' : '#94a3b8';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isOnboardingExpanded ? '#eff6ff' : '#f8fafc';
                            e.currentTarget.style.borderColor = isOnboardingExpanded ? '#93c5fd' : '#cbd5e1';
                          }}
                        >
                          <span>{isOnboardingExpanded ? 'Hide Details' : 'View Details'}</span>
                          <i 
                            className='bx bx-chevron-down' 
                            style={{ 
                              fontSize: '1.2rem', 
                              transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                              transform: isOnboardingExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                            }}
                          ></i>
                        </button>
                      </div>
                    </div>

                    {/* Interactive URL Snippet Preview Bar */}
                    <div style={{
                      marginTop: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      padding: '0.4rem 0.85rem',
                      gap: '0.5rem'
                    }}>
                      <i className='bx bx-link' style={{ color: '#64748b', fontSize: '1.05rem', flexShrink: 0 }}></i>
                      <span style={{
                        fontSize: '0.82rem',
                        color: '#334155',
                        fontFamily: 'ui-monospace, monospace',
                        flex: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {`${window.location.origin}/client-onboarding/${division?.id || '1'}`}
                      </span>
                      {onboardingLogs && onboardingLogs.length > 0 && (
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                          <i className='bx bx-history'></i>
                          {onboardingLogs[0].action} • {onboardingLogs[0].time}
                        </span>
                      )}
                    </div>

                    {/* Inline Expandable Onboarding Fields */}
                    {isOnboardingExpanded && (
                      <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
                        {/* Action Header: Title + Edit / Save Toggle */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '0.75rem' }}>
                          <div>
                            <h4 style={{ margin: '0 0 0.2rem 0', color: '#1e293b', fontSize: '0.95rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <i className='bx bx-file' style={{ color: '#3b82f6', fontSize: '1.15rem' }}></i>
                              Onboarding Details {isEditingOnboarding && <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1d4ed8', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>Editing</span>}
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                              {isEditingOnboarding ? 'Edit client onboarding information below and click Save Changes.' : 'Review submitted onboarding fields or click Edit to modify.'}
                            </p>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {isEditingOnboarding ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (filedData) {
                                      setOnboardingFormState({
                                        keySpoc: filedData.keySpoc || { name: '', email: '', contact: '' },
                                        escalationSpocs: filedData.escalationSpocs?.length ? filedData.escalationSpocs : [{ id: 1, name: '', email: '', contact: '', designation: '' }],
                                        billingDetails: filedData.billingDetails || { companyName: '', gstNumber: '', address: '' },
                                        billingSpocs: filedData.billingSpocs?.length ? filedData.billingSpocs : [{ id: 1, name: '', email: '', contact: '', department: 'Billing' }],
                                        expectations: filedData.expectations || ''
                                      });
                                    }
                                    setIsEditingOnboarding(false);
                                  }}
                                  style={{ padding: '0.35rem 0.8rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '500' }}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSaveOnboarding}
                                  style={{ padding: '0.35rem 0.95rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                >
                                  <i className='bx bx-check' style={{ fontSize: '1rem' }}></i> Save Changes
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setIsEditingOnboarding(true)}
                                style={{ padding: '0.35rem 0.95rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                              >
                                <i className='bx bx-edit' style={{ fontSize: '1rem' }}></i> Edit
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Fields Content */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          
                          {/* 1. Key SPOC */}
                          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.82rem', color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <i className='bx bx-user' style={{ color: '#3b82f6' }}></i> Key SPOC
                            </h5>
                            {isEditingOnboarding ? (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Name</label>
                                  <input 
                                    type="text" 
                                    className="form-control" 
                                    name="name" 
                                    value={onboardingFormState.keySpoc?.name || ''} 
                                    onChange={handleKeySpocChange} 
                                    placeholder="Contact Name"
                                    style={{ fontSize: '0.85rem', padding: '0.45rem' }} 
                                  />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Email</label>
                                  <input 
                                    type="email" 
                                    className="form-control" 
                                    name="email" 
                                    value={onboardingFormState.keySpoc?.email || ''} 
                                    onChange={handleKeySpocChange} 
                                    placeholder="email@example.com"
                                    style={{ fontSize: '0.85rem', padding: '0.45rem' }} 
                                  />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Contact Number</label>
                                  <input 
                                    type="text" 
                                    className="form-control" 
                                    name="contact" 
                                    value={onboardingFormState.keySpoc?.contact || ''} 
                                    onChange={handleKeySpocChange} 
                                    placeholder="+1 234 567 890"
                                    style={{ fontSize: '0.85rem', padding: '0.45rem' }} 
                                  />
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Name</span>
                                  <span style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: '500' }}>{onboardingFormState.keySpoc?.name || <em style={{ color: '#94a3b8' }}>Not provided</em>}</span>
                                </div>
                                <div>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Email</span>
                                  <span style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: '500' }}>{onboardingFormState.keySpoc?.email || <em style={{ color: '#94a3b8' }}>Not provided</em>}</span>
                                </div>
                                <div>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Contact Number</span>
                                  <span style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: '500' }}>{onboardingFormState.keySpoc?.contact || <em style={{ color: '#94a3b8' }}>Not provided</em>}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 2. Escalation Contacts */}
                          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                              <h5 style={{ margin: 0, fontSize: '0.82rem', color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <i className='bx bx-group' style={{ color: '#f59e0b' }}></i> Escalation Contacts
                              </h5>
                              {isEditingOnboarding && (
                                <button
                                  type="button"
                                  onClick={addEscalationSpoc}
                                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', color: '#334155', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                >
                                  <i className='bx bx-plus'></i> Add Contact
                                </button>
                              )}
                            </div>

                            {onboardingFormState.escalationSpocs?.map((spoc, idx) => (
                              <div key={spoc.id || idx} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #f1f5f9', marginBottom: idx === onboardingFormState.escalationSpocs.length - 1 ? 0 : '0.75rem' }}>
                                {isEditingOnboarding ? (
                                  <div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                                      <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '0.72rem', color: '#64748b' }}>Name</label>
                                        <input type="text" className="form-control" value={spoc.name || ''} onChange={(e) => handleEscalationChange(spoc.id, 'name', e.target.value)} placeholder="Contact Name" style={{ fontSize: '0.82rem', padding: '0.4rem' }} />
                                      </div>
                                      <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '0.72rem', color: '#64748b' }}>Designation</label>
                                        <input type="text" className="form-control" value={spoc.designation || ''} onChange={(e) => handleEscalationChange(spoc.id, 'designation', e.target.value)} placeholder="e.g. Director" style={{ fontSize: '0.82rem', padding: '0.4rem' }} />
                                      </div>
                                      <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '0.72rem', color: '#64748b' }}>Email</label>
                                        <input type="email" className="form-control" value={spoc.email || ''} onChange={(e) => handleEscalationChange(spoc.id, 'email', e.target.value)} placeholder="email@example.com" style={{ fontSize: '0.82rem', padding: '0.4rem' }} />
                                      </div>
                                      <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '0.72rem', color: '#64748b' }}>Contact</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                          <input type="text" className="form-control" value={spoc.contact || ''} onChange={(e) => handleEscalationChange(spoc.id, 'contact', e.target.value)} placeholder="Phone" style={{ fontSize: '0.82rem', padding: '0.4rem' }} />
                                          {onboardingFormState.escalationSpocs.length > 1 && (
                                            <button type="button" onClick={() => removeEscalationSpoc(spoc.id)} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '0 0.5rem', borderRadius: '4px', cursor: 'pointer' }} title="Remove SPOC">
                                              <i className='bx bx-trash' style={{ fontSize: '0.95rem' }}></i>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                                    <div>
                                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>Name</span>
                                      <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '500' }}>{spoc.name || <em style={{ color: '#94a3b8' }}>-</em>}</span>
                                    </div>
                                    <div>
                                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>Designation</span>
                                      <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '500' }}>{spoc.designation || <em style={{ color: '#94a3b8' }}>-</em>}</span>
                                    </div>
                                    <div>
                                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>Email</span>
                                      <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '500' }}>{spoc.email || <em style={{ color: '#94a3b8' }}>-</em>}</span>
                                    </div>
                                    <div>
                                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>Contact</span>
                                      <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '500' }}>{spoc.contact || <em style={{ color: '#94a3b8' }}>-</em>}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* 3. Billing Details */}
                          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.82rem', color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <i className='bx bx-credit-card' style={{ color: '#10b981' }}></i> Billing Details
                            </h5>
                            {isEditingOnboarding ? (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Company Name</label>
                                  <input type="text" className="form-control" name="companyName" value={onboardingFormState.billingDetails?.companyName || ''} onChange={handleBillingDetailsChange} placeholder="Registered Entity" style={{ fontSize: '0.85rem', padding: '0.45rem' }} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label style={{ fontSize: '0.75rem', color: '#64748b' }}>GST / Tax Number</label>
                                  <input type="text" className="form-control" name="gstNumber" value={onboardingFormState.billingDetails?.gstNumber || ''} onChange={handleBillingDetailsChange} placeholder="Tax / GST ID" style={{ fontSize: '0.85rem', padding: '0.45rem' }} />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                                  <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Billing Address</label>
                                  <textarea className="form-control" rows="2" name="address" value={onboardingFormState.billingDetails?.address || ''} onChange={handleBillingDetailsChange} placeholder="Full Registered Address" style={{ fontSize: '0.85rem', padding: '0.45rem' }}></textarea>
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                                <div>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Company Name</span>
                                  <span style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: '500' }}>{onboardingFormState.billingDetails?.companyName || <em style={{ color: '#94a3b8' }}>Not provided</em>}</span>
                                </div>
                                <div>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>GST / Tax Number</span>
                                  <span style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: '500' }}>{onboardingFormState.billingDetails?.gstNumber || <em style={{ color: '#94a3b8' }}>Not provided</em>}</span>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Billing Address</span>
                                  <span style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: '500', whiteSpace: 'pre-wrap' }}>{onboardingFormState.billingDetails?.address || <em style={{ color: '#94a3b8' }}>Not provided</em>}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 4. Billing / Payment SPOCs */}
                          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                              <h5 style={{ margin: 0, fontSize: '0.82rem', color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <i className='bx bx-receipt' style={{ color: '#06b6d4' }}></i> Billing / Payment SPOCs
                              </h5>
                              {isEditingOnboarding && (
                                <button
                                  type="button"
                                  onClick={addBillingSpoc}
                                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', color: '#334155', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                >
                                  <i className='bx bx-plus'></i> Add SPOC
                                </button>
                              )}
                            </div>

                            {onboardingFormState.billingSpocs?.map((spoc, idx) => (
                              <div key={spoc.id || idx} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #f1f5f9', marginBottom: idx === onboardingFormState.billingSpocs.length - 1 ? 0 : '0.75rem' }}>
                                {isEditingOnboarding ? (
                                  <div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                                      <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '0.72rem', color: '#64748b' }}>Name</label>
                                        <input type="text" className="form-control" value={spoc.name || ''} onChange={(e) => handleBillingSpocChange(spoc.id, 'name', e.target.value)} placeholder="Contact Name" style={{ fontSize: '0.82rem', padding: '0.4rem' }} />
                                      </div>
                                      <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '0.72rem', color: '#64748b' }}>Department</label>
                                        <input type="text" className="form-control" value={spoc.department || ''} onChange={(e) => handleBillingSpocChange(spoc.id, 'department', e.target.value)} placeholder="Finance / Accounts" style={{ fontSize: '0.82rem', padding: '0.4rem' }} />
                                      </div>
                                      <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '0.72rem', color: '#64748b' }}>Email</label>
                                        <input type="email" className="form-control" value={spoc.email || ''} onChange={(e) => handleBillingSpocChange(spoc.id, 'email', e.target.value)} placeholder="email@example.com" style={{ fontSize: '0.82rem', padding: '0.4rem' }} />
                                      </div>
                                      <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '0.72rem', color: '#64748b' }}>Contact</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                          <input type="text" className="form-control" value={spoc.contact || ''} onChange={(e) => handleBillingSpocChange(spoc.id, 'contact', e.target.value)} placeholder="Phone" style={{ fontSize: '0.82rem', padding: '0.4rem' }} />
                                          {onboardingFormState.billingSpocs.length > 1 && (
                                            <button type="button" onClick={() => removeBillingSpoc(spoc.id)} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '0 0.5rem', borderRadius: '4px', cursor: 'pointer' }} title="Remove SPOC">
                                              <i className='bx bx-trash' style={{ fontSize: '0.95rem' }}></i>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                                    <div>
                                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>Name</span>
                                      <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '500' }}>{spoc.name || <em style={{ color: '#94a3b8' }}>-</em>}</span>
                                    </div>
                                    <div>
                                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>Department</span>
                                      <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '500' }}>{spoc.department || <em style={{ color: '#94a3b8' }}>-</em>}</span>
                                    </div>
                                    <div>
                                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>Email</span>
                                      <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '500' }}>{spoc.email || <em style={{ color: '#94a3b8' }}>-</em>}</span>
                                    </div>
                                    <div>
                                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>Contact</span>
                                      <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '500' }}>{spoc.contact || <em style={{ color: '#94a3b8' }}>-</em>}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* 5. Expectations */}
                          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.82rem', color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <i className='bx bx-message-square-detail' style={{ color: '#8b5cf6' }}></i> Expectations & Notes
                            </h5>
                            {isEditingOnboarding ? (
                              <textarea 
                                className="form-control" 
                                rows="3" 
                                value={onboardingFormState.expectations || ''} 
                                onChange={(e) => setOnboardingFormState(prev => ({ ...prev, expectations: e.target.value }))} 
                                placeholder="Any specific requirements or expectations from client..." 
                                style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                              ></textarea>
                            ) : (
                              <p style={{ margin: 0, fontSize: '0.88rem', color: '#0f172a', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                {onboardingFormState.expectations || <em style={{ color: '#94a3b8' }}>No expectations provided.</em>}
                              </p>
                            )}
                          </div>

                        </div>

                        {/* Bottom Action Footer for Edit Mode */}
                        {isEditingOnboarding && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                            <button
                              type="button"
                              onClick={() => {
                                if (filedData) {
                                  setOnboardingFormState({
                                    keySpoc: filedData.keySpoc || { name: '', email: '', contact: '' },
                                    escalationSpocs: filedData.escalationSpocs?.length ? filedData.escalationSpocs : [{ id: 1, name: '', email: '', contact: '', designation: '' }],
                                    billingDetails: filedData.billingDetails || { companyName: '', gstNumber: '', address: '' },
                                    billingSpocs: filedData.billingSpocs?.length ? filedData.billingSpocs : [{ id: 1, name: '', email: '', contact: '', department: 'Billing' }],
                                    expectations: filedData.expectations || ''
                                  });
                                }
                                setIsEditingOnboarding(false);
                              }}
                              style={{ padding: '0.45rem 1rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500' }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveOnboarding}
                              style={{ padding: '0.45rem 1.25rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                              <i className='bx bx-check' style={{ fontSize: '1.1rem' }}></i> Save Changes
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: 0 }} />

                  {/* Upload Documents V2 */}
                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem 0', color: '#1e293b', fontSize: '1rem' }}>Division Documents</h4>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Upload documents to this division. They can be linked to orders later.</p>
                      </div>
                      <button 
                        onClick={() => setIsDocModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
                      >
                        <i className='bx bx-upload'></i> Upload Document
                      </button>
                    </div>

                    {divisionDocs.length > 0 ? (
                      <div style={{ overflowX: 'auto', background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                              <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: '600' }}>Document Name</th>
                              <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: '600' }}>Order Name</th>
                              <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: '600' }}>Date</th>
                              <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: '600', width: '50px' }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {divisionDocs.map((doc, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '0.75rem 1rem', color: '#0f172a', fontWeight: '500' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <i className='bx bxs-file-pdf' style={{ color: '#ef4444', fontSize: '1.25rem' }}></i>
                                    {doc.name}
                                  </div>
                                </td>
                                <td style={{ padding: '0.75rem 1rem', color: doc.orderName ? '#0f172a' : '#94a3b8' }}>
                                  {doc.orderName || '— Unlinked —'}
                                </td>
                                <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{doc.date}</td>
                                <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                  <button onClick={() => deleteDivisionDocument(doc.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete Document">
                                    <i className='bx bx-trash' style={{ fontSize: '1.1rem' }}></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ padding: '1.5rem', textAlign: 'center', background: 'white', border: '1px dashed #cbd5e1', borderRadius: '6px', color: '#94a3b8', fontSize: '0.85rem' }}>
                        No documents uploaded for this division yet.
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
            
            {/* Active Status Toggle */}
            <div style={{ marginTop: '2rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>Active Status</label>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '1rem', 
                  background: formData.status === 'Active' ? '#f0fdf4' : '#f8fafc',
                  border: formData.status === 'Active' ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  transition: 'all 0.3s'
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: formData.status === 'Active' ? '#16a34a' : '#64748b', fontSize: '0.95rem', fontWeight: '600' }}>
                    {formData.status === 'Active' ? 'Active' : 'Inactive'}
                  </h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>
                    {formData.status === 'Active' ? 'Division can place and manage orders.' : 'Division is disabled. No orders can be placed.'}
                  </p>
                </div>
                
                {/* Toggle Switch */}
                <div 
                  onClick={() => setFormData({...formData, status: formData.status === 'Active' ? 'Inactive' : 'Active'})}
                  style={{
                    width: '44px',
                    height: '24px',
                    background: formData.status === 'Active' ? '#0ea5e9' : '#cbd5e1',
                    borderRadius: '12px',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: formData.status === 'Active' ? '22px' : '2px',
                    transition: 'left 0.3s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}></div>
                </div>
              </div>
            </div>

          </div>

          {/* Logo - Right Side */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '150px' }}>
            <div style={{ 
              width: '100px', height: '100px', 
              borderRadius: '50%', 
              background: '#f1f5f9', 
              border: '1px dashed #cbd5e1',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              marginBottom: '0.75rem'
            }}>
              <i className='bx bx-image' style={{ fontSize: '2rem', color: '#94a3b8' }}></i>
            </div>
            <button style={{ background: 'transparent', border: 'none', color: '#0ea5e9', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <i className='bx bx-edit-alt'></i> Change Logo
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
          <button className="btn-outline" onClick={() => navigate(-1)} style={{ border: 'none', color: '#64748b', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Discard</button>
          <button className="btn-primary" onClick={handleSaveChanges} style={{ padding: '0.4rem 1.25rem', background: '#6366f1', fontSize: '0.85rem' }}>Save Changes</button>
        </div>
      </div>
      
      {/* Access & Roles Section */}
      <div style={{ padding: '1.5rem 2rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', background: '#f0f9ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                <i className='bx bx-group'></i>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: '700' }}>Access & Roles</h2>
            </div>
            <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>Manage roles and permissions for corporate access</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button 
              type="button"
              onClick={() => {
                setInviteForm({ role: 'HR', email: '' });
                setIsInviteModalOpen(true);
              }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                padding: '0.5rem 1rem', 
                background: '#ffffff', 
                border: '1px solid #3b82f6', 
                color: '#2563eb', 
                borderRadius: '6px', 
                fontSize: '0.85rem', 
                fontWeight: '600', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#eff6ff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
            >
              <i className='bx bx-user-plus' style={{ fontSize: '1.1rem' }}></i> Invite
            </button>
            <button 
              className="btn-primary" 
              onClick={handleOpenAddRole}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#3b82f6', fontSize: '0.85rem', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              <i className='bx bx-plus'></i> New Role
            </button>
          </div>
        </div>

        {/* Roles List */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          {roles.map((r) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: 'white', borderBottom: '1px solid #f1f5f9' }}>
              {/* Avatar */}
              <div style={{ width: '36px', height: '36px', background: '#e0f2fe', color: '#0284c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.9rem', marginRight: '1.5rem' }}>
                {(r.name || 'U').charAt(0).toUpperCase()}
              </div>
              
              {/* Roles/Badges */}
              <div style={{ display: 'flex', gap: '0.5rem', marginRight: 'auto', minWidth: '220px', flexWrap: 'wrap' }}>
                <span style={{ 
                  background: r.role === 'Customer Success' ? '#e0f2fe' : r.role === 'HR' ? '#fdf2f8' : '#f0fdf4', 
                  color: r.role === 'Customer Success' ? '#0284c7' : r.role === 'HR' ? '#be185d' : '#15803d', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '999px', 
                  fontSize: '0.75rem', 
                  fontWeight: '600' 
                }}>
                  {r.role || 'Customer Success'}
                </span>
                {r.isPrimary && (
                  <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <i className='bx bx-star'></i> Primary CS
                  </span>
                )}
              </div>
              
              {/* Name */}
              <div style={{ width: '200px', fontSize: '0.9rem', color: '#334155', fontWeight: '500' }}>
                {r.name}
              </div>
              
              {/* Email */}
              <div style={{ width: '250px', fontSize: '0.85rem', color: '#64748b' }}>
                {r.email || '-'}
              </div>
              
              {/* Actions */}
              <div style={{ display: 'flex', gap: '1rem', color: '#94a3b8' }}>
                <button 
                  onClick={() => handleOpenEditRole(r)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  title="Edit Member"
                >
                  <i className='bx bx-pencil'></i>
                </button>
                <button 
                  onClick={() => handleDeleteRole(r.id)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                  title="Remove Member"
                >
                  <i className='bx bx-trash'></i>
                </button>
              </div>
            </div>
          ))}

          {/* Line Separated Invites Section */}
          <div style={{ borderTop: '1px solid #e2e8f0' }}>
            <div style={{ padding: '0.65rem 1rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <i className='bx bx-mail-send' style={{ fontSize: '1rem', color: '#2563eb' }}></i> Invited Users ({invites.length})
              </span>
            </div>

            {invites.length === 0 ? (
              <div style={{ padding: '1.25rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', background: 'white' }}>
                No pending invitations. Click <strong>Invite</strong> above to invite HR, CS, or BD members.
              </div>
            ) : (
              invites.map((invite) => (
                <div key={invite.id} style={{ display: 'flex', alignItems: 'center', padding: '0.85rem 1rem', background: 'white', borderBottom: '1px solid #f8fafc' }}>
                  {/* Icon Avatar */}
                  <div style={{ width: '36px', height: '36px', background: '#f1f5f9', color: '#64748b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.05rem', marginRight: '1.5rem' }}>
                    <i className='bx bx-envelope'></i>
                  </div>

                  {/* Role Badge */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginRight: 'auto', minWidth: '200px' }}>
                    <span style={{ 
                      background: invite.role === 'HR' ? '#fdf2f8' : invite.role === 'CS' ? '#e0f2fe' : '#f0fdf4', 
                      color: invite.role === 'HR' ? '#be185d' : invite.role === 'CS' ? '#0369a1' : '#15803d', 
                      border: `1px solid ${invite.role === 'HR' ? '#fbcfe8' : invite.role === 'CS' ? '#bae6fd' : '#bbf7d0'}`,
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '999px', 
                      fontSize: '0.75rem', 
                      fontWeight: '600' 
                    }}>
                      {invite.role === 'CS' ? 'Customer Success' : invite.role === 'BD' ? 'Business Development' : 'HR'}
                    </span>
                  </div>

                  {/* Invited User Email */}
                  <div style={{ width: '300px', fontSize: '0.85rem', color: '#1e293b', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <i className='bx bx-at' style={{ color: '#94a3b8' }}></i>
                    <span>{invite.email}</span>
                  </div>

                  {/* Status */}
                  <div style={{ width: '130px' }}>
                    {invite.status === 'Accepted' || invite.status === 'Active' ? (
                      <span style={{ 
                        background: '#dcfce7', 
                        color: '#15803d', 
                        border: '1px solid #86efac',
                        padding: '0.2rem 0.65rem', 
                        borderRadius: '999px', 
                        fontSize: '0.75rem', 
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <i className='bx bx-check-circle' style={{ fontSize: '0.85rem' }}></i> Accepted
                      </span>
                    ) : (
                      <span style={{ 
                        background: '#fef3c7', 
                        color: '#b45309', 
                        border: '1px solid #fde68a',
                        padding: '0.2rem 0.65rem', 
                        borderRadius: '999px', 
                        fontSize: '0.75rem', 
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <i className='bx bx-time-five' style={{ fontSize: '0.8rem' }}></i> Pending
                      </span>
                    )}
                  </div>

                  {/* Action (Mark Accepted, Resend Icon, Copy link icon) */}
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    {/* Mark as Accepted Action (if still Pending) */}
                    {invite.status !== 'Accepted' && invite.status !== 'Active' && (
                      <div style={{ position: 'relative', display: 'inline-flex' }}>
                        <button
                          type="button"
                          onClick={() => handleMarkInviteAccepted(invite)}
                          onMouseEnter={() => setHoveredAction(`${invite.id}-accept`)}
                          onMouseLeave={() => setHoveredAction(null)}
                          title="Mark as Accepted"
                          style={{
                            width: '32px',
                            height: '32px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            background: hoveredAction === `${invite.id}-accept` ? '#dcfce7' : '#f0fdf4',
                            border: `1px solid ${hoveredAction === `${invite.id}-accept` ? '#86efac' : '#bbf7d0'}`,
                            borderRadius: '6px',
                            color: '#16a34a',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <i className='bx bx-check' style={{ fontSize: '1.25rem' }}></i>
                        </button>

                        {hoveredAction === `${invite.id}-accept` && (
                          <div style={{
                            position: 'absolute',
                            bottom: 'calc(100% + 6px)',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#0f172a',
                            color: 'white',
                            fontSize: '0.72rem',
                            fontWeight: '600',
                            padding: '0.25rem 0.55rem',
                            borderRadius: '4px',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                            zIndex: 50,
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                          }}>
                            Mark as Accepted
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: 0,
                              height: 0,
                              borderLeft: '4px solid transparent',
                              borderRight: '4px solid transparent',
                              borderTop: '4px solid #0f172a'
                            }} />
                          </div>
                        )}
                      </div>
                    )}
                    {/* Resend Action */}
                    <div style={{ position: 'relative', display: 'inline-flex' }}>
                      <button
                        type="button"
                        onClick={() => handleResendInvite(invite)}
                        onMouseEnter={() => setHoveredAction(`${invite.id}-resend`)}
                        onMouseLeave={() => setHoveredAction(null)}
                        title="Resend"
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                          background: hoveredAction === `${invite.id}-resend` ? '#eff6ff' : '#f8fafc',
                          border: `1px solid ${hoveredAction === `${invite.id}-resend` ? '#bfdbfe' : '#e2e8f0'}`,
                          borderRadius: '6px',
                          color: '#2563eb',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <i className='bx bx-revision' style={{ fontSize: '1.05rem' }}></i>
                      </button>

                      {hoveredAction === `${invite.id}-resend` && (
                        <div style={{
                          position: 'absolute',
                          bottom: 'calc(100% + 6px)',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#0f172a',
                          color: 'white',
                          fontSize: '0.72rem',
                          fontWeight: '600',
                          padding: '0.25rem 0.55rem',
                          borderRadius: '4px',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                          zIndex: 50,
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                        }}>
                          Resend
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '4px solid transparent',
                            borderRight: '4px solid transparent',
                            borderTop: '4px solid #0f172a'
                          }} />
                        </div>
                      )}
                    </div>

                    {/* Copy Link Action */}
                    <div style={{ position: 'relative', display: 'inline-flex' }}>
                      <button
                        type="button"
                        onClick={() => handleCopyInviteLink(invite)}
                        onMouseEnter={() => setHoveredAction(`${invite.id}-copy`)}
                        onMouseLeave={() => setHoveredAction(null)}
                        title="Copy Link"
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                          background: copiedInviteId === invite.id ? '#f0fdf4' : (hoveredAction === `${invite.id}-copy` ? '#f1f5f9' : '#f8fafc'),
                          border: `1px solid ${copiedInviteId === invite.id ? '#bbf7d0' : (hoveredAction === `${invite.id}-copy` ? '#cbd5e1' : '#e2e8f0')}`,
                          borderRadius: '6px',
                          color: copiedInviteId === invite.id ? '#15803d' : '#475569',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <i className={`bx ${copiedInviteId === invite.id ? 'bx-check' : 'bx-copy'}`} style={{ fontSize: '1.05rem' }}></i>
                      </button>

                      {hoveredAction === `${invite.id}-copy` && (
                        <div style={{
                          position: 'absolute',
                          bottom: 'calc(100% + 6px)',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#0f172a',
                          color: 'white',
                          fontSize: '0.72rem',
                          fontWeight: '600',
                          padding: '0.25rem 0.55rem',
                          borderRadius: '4px',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                          zIndex: 50,
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                        }}>
                          {copiedInviteId === invite.id ? 'Copied!' : 'Copy Link'}
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '4px solid transparent',
                            borderRight: '4px solid transparent',
                            borderTop: '4px solid #0f172a'
                          }} />
                        </div>
                      )}
                    </div>

                    {/* Delete Action */}
                    <div style={{ position: 'relative', display: 'inline-flex' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteInvite(invite.id)}
                        onMouseEnter={() => setHoveredAction(`${invite.id}-delete`)}
                        onMouseLeave={() => setHoveredAction(null)}
                        title="Delete Invite"
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                          background: 'none',
                          border: 'none',
                          color: hoveredAction === `${invite.id}-delete` ? '#ef4444' : '#94a3b8',
                          cursor: 'pointer',
                          borderRadius: '6px',
                          transition: 'color 0.15s ease'
                        }}
                      >
                        <i className='bx bx-trash' style={{ fontSize: '1.05rem' }}></i>
                      </button>

                      {hoveredAction === `${invite.id}-delete` && (
                        <div style={{
                          position: 'absolute',
                          bottom: 'calc(100% + 6px)',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#0f172a',
                          color: 'white',
                          fontSize: '0.72rem',
                          fontWeight: '600',
                          padding: '0.25rem 0.55rem',
                          borderRadius: '4px',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                          zIndex: 50,
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                        }}>
                          Delete Invite
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '4px solid transparent',
                            borderRight: '4px solid transparent',
                            borderTop: '4px solid #0f172a'
                          }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Orders Section */}
      <div style={{ padding: '1.5rem 2rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', marginTop: '2rem' }}>
        
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className='bx bx-receipt' style={{ color: '#3b82f6' }}></i> Division Orders
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.82rem' }}>
              BD team can configure billing details and save as a draft order to create billing schedules & invoices.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {isFiled ? (
              <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', padding: '0.35rem 0.75rem', borderRadius: '20px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <i className='bx bx-check-circle'></i> Onboarding Filled (Billing Ready)
              </span>
            ) : (
              <span style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '0.35rem 0.75rem', borderRadius: '20px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <i className='bx bx-time'></i> Onboarding Pending
              </span>
            )}
            <button 
              onClick={() => navigate(`/corporate/division/order/add?divisionId=${division.id}`, { state: { clientName: formData.clientName, divisionName: formData.divisionName, divisionId: division.id } })} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600' }}
            >
              <i className='bx bx-plus'></i> Add Order / Draft
            </button>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <i className='bx bx-search' style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
            <input type="text" placeholder="Search orders..." style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.85rem' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: '#64748b' }}>
            <span>Total: <strong>{orders.length}</strong></span>
            <span>Rows:</span>
            <select style={{ padding: '0.4rem 2rem 0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', fontSize: '0.85rem', outline: 'none', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}>
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: 'white' }}>
                <th style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>ORDER ID <i className='bx bx-sort-alt-2' style={{ marginLeft: '4px', opacity: 0.7, fontSize: '0.8rem' }}></i></th>
                <th style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>PLAN NAME <i className='bx bx-sort-alt-2' style={{ marginLeft: '4px', opacity: 0.7, fontSize: '0.8rem' }}></i></th>
                <th style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>PROGRAM CODE <i className='bx bx-sort-alt-2' style={{ marginLeft: '4px', opacity: 0.7, fontSize: '0.8rem' }}></i></th>
                <th style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>PLAN START <i className='bx bx-sort-alt-2' style={{ marginLeft: '4px', opacity: 0.7, fontSize: '0.8rem' }}></i></th>
                <th style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>PLAN END <i className='bx bx-sort-alt-2' style={{ marginLeft: '4px', opacity: 0.7, fontSize: '0.8rem' }}></i></th>
                <th style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>EMPLOYEES <i className='bx bx-sort-alt-2' style={{ marginLeft: '4px', opacity: 0.7, fontSize: '0.8rem' }}></i></th>
                <th style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>STATUS <i className='bx bx-sort-alt-2' style={{ marginLeft: '4px', opacity: 0.7, fontSize: '0.8rem' }}></i></th>
                <th style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} style={{ background: 'white', borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', color: '#475569' }}>{order.id}</td>
                  <td style={{ padding: '1rem', color: '#475569' }}>{order.plan || '-'}</td>
                  <td style={{ padding: '1rem', color: '#475569' }}>{order.programCode || '-'}</td>
                  <td style={{ padding: '1rem', color: '#475569' }}>{order.planStart || '-'}</td>
                  <td style={{ padding: '1rem', color: '#475569' }}>{order.planEnd || '-'}</td>
                  <td style={{ padding: '1rem', color: '#475569' }}>{order.employees || '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      background: order.status === 'Active' ? '#dcfce7' : (order.status === 'Draft' ? '#fef3c7' : '#fee2e2'), 
                      color: order.status === 'Active' ? '#16a34a' : (order.status === 'Draft' ? '#b45309' : '#ef4444'), 
                      border: order.status === 'Draft' ? '1px solid #fde68a' : 'none',
                      borderRadius: '999px', 
                      fontSize: '0.75rem', 
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {order.status === 'Draft' && <i className='bx bx-edit-alt' style={{ fontSize: '0.8rem' }}></i>}
                      {order.status || 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button title="Edit Order" onClick={() => navigate(`/corporate/division/order/edit/${order.id}`, { state: { edit: true, orderId: order.id, clientName: formData.clientName, divisionName: formData.divisionName, divisionId: division.id } })} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #cbd5e1', background: 'white', color: '#64748b', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.35rem' }}>
                      <i className='bx bx-pencil' style={{ fontSize: '1rem' }}></i>
                    </button>
                    <button title="Delete Order" onClick={() => deleteOrder(order.id)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #fca5a5', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.35rem' }}>
                      <i className='bx bx-trash' style={{ fontSize: '1rem' }}></i>
                    </button>
                    <button title="Payment Summary" onClick={() => { setSelectedOrder(order); setIsPaymentSummaryOpen(true); }} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #93c5fd', background: '#eff6ff', color: '#3b82f6', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.35rem' }}>
                      <i className='bx bx-receipt' style={{ fontSize: '1rem' }}></i>
                    </button>
                    <button 
                      title="Create / View Billing Schedule" 
                      onClick={() => navigate('/client-payments', {
                        state: {
                          openAddSchedule: true,
                          corporate: formData.clientName,
                          division: formData.divisionName,
                          orderId: order.id,
                          orderName: order.orderName || `${formData.divisionName} | ${order.planStart || 'Order'} - ${order.plan || order.id}`
                        }
                      })} 
                      style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #a7f3d0', background: '#ecfdf5', color: '#059669', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <i className='bx bx-calendar-plus' style={{ fontSize: '1rem' }}></i>
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', background: '#f8fafc' }}>
                    <div style={{ maxWidth: '440px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                        <i className='bx bx-receipt'></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>No orders added yet</div>
                        <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
                          BD team can configure billing details and save as a draft order to create invoices & billing schedules immediately.
                        </div>
                      </div>
                      <button 
                        onClick={() => navigate(`/corporate/division/order/add?divisionId=${division.id}`, { state: { clientName: formData.clientName, divisionName: formData.divisionName, divisionId: division.id } })}
                        style={{ padding: '0.45rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}
                      >
                        <i className='bx bx-plus'></i> Add Order with Billing Details (Draft)
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Scrollbar Mock */}
          <div style={{ padding: '4px', background: '#f1f5f9', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ height: '8px', background: '#cbd5e1', borderRadius: '4px', margin: '0 4px', width: '90%' }}></div>
          </div>
          
          {/* Table Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc' }}>
            <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: '600' }}>Page 1 of 2</span>
            
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button style={{ padding: '0.4rem 0.75rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', color: '#94a3b8', cursor: 'not-allowed', fontSize: '0.85rem' }}><i className='bx bx-chevrons-left'></i></button>
              <button style={{ padding: '0.4rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', color: '#94a3b8', cursor: 'not-allowed', fontSize: '0.85rem', fontWeight: '500' }}>Previous</button>
              <button style={{ padding: '0.4rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', color: '#0f172a', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>Next</button>
              <button style={{ padding: '0.4rem 0.75rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', color: '#0f172a', cursor: 'pointer', fontSize: '0.85rem' }}><i className='bx bx-chevrons-right'></i></button>
            </div>
            
            <button onClick={() => navigate(`/corporate/division/order/add?divisionId=${division.id}`, { state: { clientName: formData.clientName, divisionName: formData.divisionName, divisionId: division.id } })} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
              <i className='bx bx-plus'></i> Add Order
            </button>
          </div>
        </div>
      </div>
      
      
      <ViewOnboardingModal 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        data={filedData || formData}
      />
      <PaymentSummaryModal
        isOpen={isPaymentSummaryOpen}
        onClose={() => setIsPaymentSummaryOpen(false)}
        contractValue={selectedOrder?.billingDetails?.amountInUSD || selectedOrder?.amount || 0}
        orderId={selectedOrder?.id}
        divisionId={division.id}
        onViewPaymentSchedule={() => {
          setIsPaymentSummaryOpen(false);
          setIsPaymentScheduleOpen(true);
        }}
        onViewBillingSchedule={() => {
          setIsPaymentSummaryOpen(false);
          navigate('/client-payments', { state: { filterOrderId: selectedOrder?.id } });
        }}
      />
      <PaymentScheduleModal 
        isOpen={isPaymentScheduleOpen}
        onClose={() => setIsPaymentScheduleOpen(false)}
        contractValue={selectedOrder?.amount || 0}
        orderId={selectedOrder?.id}
        divisionId={division.id}
      />
      
      <DocumentUploadModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onSave={handleSaveDocument}
      />

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Invite User Modal */}
      {isInviteModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            border: '1px solid #e2e8f0'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}>
                  <i className='bx bx-user-plus'></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: '700' }}>Invite User</h3>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>Send an invitation to join corporate access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '1.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.25rem',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#0f172a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
              >
                <i className='bx bx-x'></i>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSendInvite} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.45rem' }}>
                  Select Role (HR / CS / BD) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    background: 'white',
                    outline: 'none',
                    fontWeight: '500'
                  }}
                >
                  <option value="HR">HR</option>
                  <option value="CS">CS</option>
                  <option value="BD">BD</option>
                </select>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                  Role dictates permissions and access scope for this member.
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.45rem' }}>
                  Email ID <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. member@company.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    outline: 'none'
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                  An invitation email with access link will be delivered to this address.
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  style={{
                    padding: '0.55rem 1.1rem',
                    background: 'white',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    color: '#475569',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.55rem 1.25rem',
                    background: '#2563eb',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <i className='bx bx-send'></i> Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add / Edit Role Modal */}
      {isRoleModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                  <i className={`bx ${editingRoleId ? 'bx-edit' : 'bx-user-plus'}`}></i>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                  {editingRoleId ? 'Edit Role Member' : 'Add New Role Member'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.25rem' }}
              >
                <i className='bx bx-x'></i>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveRole} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Karan Hinduja"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. member@company.com"
                  value={roleForm.email}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, email: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>
                  Role
                </label>
                <select
                  value={roleForm.role}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, role: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    background: 'white',
                    outline: 'none'
                  }}
                >
                  <option value="Customer Success">Customer Success</option>
                  <option value="HR">HR</option>
                  <option value="Business Development">Business Development</option>
                </select>
              </div>

              {/* Primary CS Checkbox */}
              <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', margin: 0, fontSize: '0.88rem', color: '#1e293b', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={roleForm.isPrimary}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, isPrimary: e.target.checked }))}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span>Mark as Primary CS (☆ Primary CS)</span>
                </label>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', marginLeft: '1.6rem' }}>
                  If there are multiple Primary CS, the first one in the list is automatically selected as CS Responsible in Client P&L and reports.
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  style={{
                    padding: '0.55rem 1.1rem',
                    background: 'white',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    color: '#475569',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.55rem 1.25rem',
                    background: '#2563eb',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <i className='bx bx-check'></i> {editingRoleId ? 'Save Changes' : 'Add Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default EditDivision;
