import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import ViewOnboardingModal from '../components/ViewOnboardingModal';
import PaymentSummaryModal from '../components/PaymentSummaryModal';
import PaymentScheduleModal from '../components/PaymentScheduleModal';
import ConfirmModal from '../components/ConfirmModal';
import DocumentUploadModal from '../components/DocumentUploadModal';
import ContractModal from '../components/ContractModal';
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
          if (found) {
            const corpName = (found.clientName && found.clientName !== 'N/A') ? found.clientName : (c.name || c.clientName || 'Corporate Client');
            return { ...found, clientName: corpName };
          }
        }
      }
      try {
        const savedClients = JSON.parse(localStorage.getItem('cs-admin-clients') || '[]');
        for (const c of savedClients) {
          if (c.divisions && Array.isArray(c.divisions)) {
            const found = c.divisions.find(d => String(d.id) === String(targetDivisionId));
            if (found) {
              const corpName = (found.clientName && found.clientName !== 'N/A') ? found.clientName : (c.name || c.clientName || 'Corporate Client');
              return { ...found, clientName: corpName };
            }
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

  const [isDivisionDetailsOpen, setIsDivisionDetailsOpen] = useState(false);
  const [isAdditionalDetailsOpen, setIsAdditionalDetailsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [isContractsOpen, setIsContractsOpen] = useState(false);
  const [isAccessRolesOpen, setIsAccessRolesOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFiled, setIsFiled] = useState(false);
  const [filedData, setFiledData] = useState(null);
  
  const [isOnboardingExpanded, setIsOnboardingExpanded] = useState(true);
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
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedContractForEdit, setSelectedContractForEdit] = useState(null);
  const [divisionContracts, setDivisionContracts] = useState([]);
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

  useEffect(() => {
    const fetchContracts = () => {
      const saved = localStorage.getItem('division_contracts');
      if (saved) {
        try {
          const allContracts = JSON.parse(saved);
          setDivisionContracts(allContracts.filter(c => String(c.divisionId) === String(division.id)));
        } catch (e) {
          setDivisionContracts([]);
        }
      } else {
        setDivisionContracts([]);
      }
    };
    fetchContracts();
    window.addEventListener('storage', fetchContracts);
    return () => window.removeEventListener('storage', fetchContracts);
  }, [division.id]);

  const handleSaveContract = (contractData, shouldSchedule = false) => {
    const all = JSON.parse(localStorage.getItem('division_contracts') || '[]');
    const existingIndex = all.findIndex(c => c.id === contractData.id);
    let updated;
    let savedItem;
    if (existingIndex >= 0) {
      const existing = all[existingIndex];
      savedItem = { 
        ...existing, 
        ...contractData, 
        divisionId: division.id,
        orderId: contractData.orderId !== undefined ? contractData.orderId : (existing.orderId || ''),
        orderName: contractData.orderName !== undefined ? contractData.orderName : (existing.orderName || '')
      };
      updated = all.map(c => c.id === contractData.id ? savedItem : c);
    } else {
      savedItem = { ...contractData, divisionId: division.id, orderId: contractData.orderId || '', orderName: contractData.orderName || '' };
      updated = [...all, savedItem];
    }
    localStorage.setItem('division_contracts', JSON.stringify(updated));
    setDivisionContracts(updated.filter(c => String(c.divisionId) === String(division.id)));

    // Sync any existing Accounts Receivable record for this contract
    try {
      const clientPayments = JSON.parse(localStorage.getItem('client_payments') || '[]');
      const pIdx = clientPayments.findIndex(p => p.contractId === contractData.id);
      if (pIdx >= 0) {
        const existingP = clientPayments[pIdx];
        const targetOrder = contractData.orderId ? contractData.orderId : (existingP.orderId || 'Null');
        const updatedPayments = clientPayments.map(p => {
          if (p.contractId === contractData.id) {
            return {
              ...p,
              orderId: targetOrder,
              orderName: contractData.orderName !== undefined ? contractData.orderName : p.orderName,
              clientBillingEntity: contractData.companyName || p.clientBillingEntity,
              clientTaxDetails: contractData.taxDetails || (contractData.companyEntities?.[0]?.taxDetails) || p.clientTaxDetails,
              clientAddress: contractData.address || (contractData.companyEntities?.[0]?.address) || p.clientAddress,
              contractValue: Number(contractData.contractValue) || p.contractValue,
              paymentDueDays: contractData.paymentDueDays || p.paymentDueDays,
              billingCompany: contractData.billFrom || p.billingCompany,
              receivingBankName: contractData.receivingBankName || p.receivingBankName,
              bankDetailsLink: contractData.bankDetailsLink || p.bankDetailsLink,
              amountDueUsd: Number(contractData.amountInUSD) || p.amountDueUsd,
              amountDue: Number(contractData.contractValue) || p.amountDue,
              currency: contractData.contractCurrency || p.currency,
              remarks: contractData.remarks || p.remarks
            };
          }
          return p;
        });
        localStorage.setItem('client_payments', JSON.stringify(updatedPayments));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      console.error('Failed to sync client_payments on contract edit', err);
    }

    setIsContractModalOpen(false);
    setSelectedContractForEdit(null);

    if (shouldSchedule) {
      handleScheduleBilling(savedItem);
    } else {
      if (showToast) showToast('Contract saved successfully!', 3000);
    }
  };

  const mapContractToOrder = (contractId, selectedOrderId) => {
    try {
      const allContracts = JSON.parse(localStorage.getItem('division_contracts') || '[]');
      const allOrders = JSON.parse(localStorage.getItem('division_orders') || '[]');
      const targetOrder = allOrders.find(o => String(o.id) === String(selectedOrderId));
      const targetOrderName = targetOrder 
        ? `${targetOrder.planStart || 'Unknown Date'} & ${targetOrder.plan || targetOrder.planName || targetOrder.product || `Order #${targetOrder.id}`}`
        : '';

      const updatedContracts = allContracts.map(c => {
        if (String(c.id) === String(contractId)) {
          return {
            ...c,
            orderId: selectedOrderId ? String(selectedOrderId) : '',
            orderName: targetOrderName
          };
        }
        return c;
      });

      localStorage.setItem('division_contracts', JSON.stringify(updatedContracts));
      setDivisionContracts(updatedContracts.filter(c => String(c.divisionId) === String(division.id)));

      // Sync related invoice lines in Accounts Receivable (client_payments)
      try {
        const clientPayments = JSON.parse(localStorage.getItem('client_payments') || '[]');
        let modified = false;
        const updatedPayments = clientPayments.map(p => {
          if (p && String(p.contractId) === String(contractId)) {
            modified = true;
            return {
              ...p,
              orderId: selectedOrderId ? String(selectedOrderId) : 'Null',
              orderName: targetOrderName
            };
          }
          return p;
        });

        if (modified) {
          localStorage.setItem('client_payments', JSON.stringify(updatedPayments));
        }
      } catch (err) {
        console.error('Failed to sync client_payments on mapContractToOrder:', err);
      }

      window.dispatchEvent(new Event('storage'));
      if (showToast) showToast(`Contract mapped to ${targetOrderName || 'Order'}`, 3000);
    } catch (e) {
      console.error('Failed to map contract to order:', e);
    }
  };

  const handleScheduleBilling = (cnt) => {
    try {
      const existingPayments = JSON.parse(localStorage.getItem('client_payments') || '[]');
      const existingEntries = existingPayments.filter(p => p && String(p.contractId) === String(cnt.id));

      const doNavigate = () => {
        const clientName = formData.clientName || division.clientName || 'Client Name';
        const divisionName = formData.divisionName || division.divisionName || 'Division Name';

        navigate('/accounts-receivable', {
          state: {
            openAddSchedule: true,
            contractSchedule: cnt,
            corporate: clientName,
            division: divisionName,
            divisionId: division.id,
            orderId: cnt.orderId && cnt.orderId !== 'Null' ? String(cnt.orderId) : '',
            orderName: cnt.orderName || ''
          }
        });
      };

      if (existingEntries.length > 0) {
        setConfirmConfig({
          isOpen: true,
          title: 'Schedule Already Exists',
          message: `This contract already has ${existingEntries.length} invoice line(s) in Accounts Receivable. Do you want to proceed and create a new schedule / additional invoices for this contract?`,
          confirmText: 'Proceed to Schedule',
          cancelText: 'Cancel',
          onConfirm: () => {
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            doNavigate();
          }
        });
        return;
      }

      doNavigate();
    } catch (e) {
      console.error('Failed to initiate schedule for contract:', e);
      navigate('/accounts-receivable');
    }
  };

  const deleteDivisionContract = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Contract',
      message: 'Are you sure you want to delete this contract from the division?',
      confirmText: 'Delete',
      onConfirm: () => {
        const all = JSON.parse(localStorage.getItem('division_contracts') || '[]');
        const updated = all.filter(c => c.id !== id);
        localStorage.setItem('division_contracts', JSON.stringify(updated));
        setDivisionContracts(prev => prev.filter(c => c.id !== id));
        if (showToast) showToast('Contract removed', 3000);
      }
    });
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
          billingDetails: normalizeBillingCompanies(parsed.billingDetails),
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

  const normalizeBillingCompanies = (details) => {
    if (!details) return { companyName: '', gstNumber: '', address: '', companies: [] };
    const companies = details.companies?.length
      ? details.companies
      : details.companyName
        ? [{ id: Date.now(), companyName: details.companyName, gstNumber: details.gstNumber || '', address: details.address || '', isPrimary: true }]
        : [{ id: Date.now(), companyName: '', gstNumber: '', address: '', isPrimary: true }];
    return {
      ...details,
      companies,
      companyName: details.companyName || companies[0]?.companyName || '',
      gstNumber: details.gstNumber || companies[0]?.gstNumber || '',
      address: details.address || companies[0]?.address || ''
    };
  };

  const handleBillingDetailsChange = (e) => {
    const { name, value } = e.target;
    setOnboardingFormState(prev => ({
      ...prev,
      billingDetails: { ...prev.billingDetails, [name]: value }
    }));
  };

  const handleDivisionCompanyChange = (field, value) => {
    setOnboardingFormState(prev => {
      const billing = {
        ...(prev.billingDetails || {}),
        [field]: value
      };
      const singleComp = {
        id: prev.billingDetails?.companies?.[0]?.id || Date.now(),
        companyName: field === 'companyName' ? value : (billing.companyName || ''),
        gstNumber: field === 'gstNumber' ? value : (billing.gstNumber || ''),
        address: field === 'address' ? value : (billing.address || ''),
        isPrimary: true
      };
      billing.companies = [singleComp];
      billing.companyName = singleComp.companyName;
      billing.gstNumber = singleComp.gstNumber;
      billing.address = singleComp.address;
      return {
        ...prev,
        billingDetails: billing
      };
    });
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

      {/* Section 1: Division Details */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <button 
          type="button"
          onClick={() => setIsDivisionDetailsOpen(!isDivisionDetailsOpen)}
          style={{ 
            width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            padding: '0.85rem 1.25rem',
            background: isDivisionDetailsOpen ? '#f8fafc' : 'linear-gradient(90deg, #ffffff 80%, #f0f9ff 100%)',
            border: 'none', cursor: 'pointer', transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <i className='bx bx-briefcase' style={{ color: '#0284c7', fontSize: '1.25rem' }}></i>
            <span style={{ fontSize: '0.92rem', color: '#1e293b', fontWeight: '600' }}>Division Details</span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• Basic info, logo, remarks & status</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            background: formData.status === 'Active' ? '#f0fdf4' : '#fef2f2',
            padding: '0.35rem 0.85rem',
            borderRadius: '8px',
            border: formData.status === 'Active' ? '1px solid #bbf7d0' : '1px solid #fecaca',
            color: formData.status === 'Active' ? '#15803d' : '#991b1b'
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <i className={`bx ${formData.status === 'Active' ? 'bx-check-circle' : 'bx-x-circle'}`}></i>
              {formData.status}
            </span>
            <i className={`bx ${isDivisionDetailsOpen ? 'bx-chevron-up' : 'bx-chevron-down'}`} style={{ fontSize: '1.2rem', color: formData.status === 'Active' ? '#15803d' : '#991b1b' }}></i>
          </div>
        </button>

        {isDivisionDetailsOpen && (
          <div style={{ padding: '1.25rem', background: 'white', borderTop: '1px solid #e2e8f0' }}>

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

            {/* Section 1: Additional Details */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <button 
                type="button"
                onClick={() => setIsAdditionalDetailsOpen(!isAdditionalDetailsOpen)}
                style={{ 
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '0.85rem 1.25rem',
                  background: isAdditionalDetailsOpen ? '#f8fafc' : 'linear-gradient(90deg, #ffffff 80%, #f1f5f9 100%)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <i className='bx bx-slider-alt' style={{ color: '#64748b', fontSize: '1.2rem' }}></i>
                  <span style={{ fontSize: '0.92rem', color: '#1e293b', fontWeight: '600' }}>Additional Details</span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• Notes & Remarks</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  background: '#f1f5f9',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  color: '#334155'
                }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '600' }}>Remarks</span>
                  <i className={`bx ${isAdditionalDetailsOpen ? 'bx-chevron-up' : 'bx-chevron-down'}`} style={{ fontSize: '1.2rem', color: '#64748b' }}></i>
                </div>
              </button>
              
              {isAdditionalDetailsOpen && (
                <div style={{ padding: '1.25rem', background: 'white', borderTop: '1px solid #e2e8f0' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Remarks</label>
                    <textarea 
                      className="form-control" 
                      name="remarks" 
                      value={formData.remarks} 
                      onChange={handleInputChange} 
                      rows="3"
                      style={{ padding: '0.6rem', fontSize: '0.85rem' }}
                      placeholder="Internal notes about this division..."
                    ></textarea>
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
        )}
      </div>
      
      {/* Collapsible Sections: Onboarding, Documents, Contracts */}
      {/* Section 2: Onboarding Form */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <button 
                type="button"
                onClick={() => setIsOnboardingOpen(!isOnboardingOpen)}
                style={{ 
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '0.85rem 1.25rem',
                  background: isOnboardingOpen ? '#f8fafc' : 'linear-gradient(90deg, #ffffff 80%, #eff6ff 100%)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <i className='bx bx-id-card' style={{ color: '#2563eb', fontSize: '1.25rem' }}></i>
                  <span style={{ fontSize: '0.92rem', color: '#1e293b', fontWeight: '600' }}>Onboarding Form</span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• Client link & submission details</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  background: '#eff6ff',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8'
                }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <i className={`bx ${isFiled ? 'bx-check-circle' : 'bx-time-five'}`}></i>
                    {isFiled ? 'Form Filed' : 'Pending'}
                  </span>
                  <i className={`bx ${isOnboardingOpen ? 'bx-chevron-up' : 'bx-chevron-down'}`} style={{ fontSize: '1.2rem', color: '#2563eb' }}></i>
                </div>
              </button>
              
              {isOnboardingOpen && (
                <div style={{ padding: '1.25rem', background: 'white', borderTop: '1px solid #e2e8f0' }}>
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
                        {/* 1. Copy Link Button */}
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

                          {/* 3. Billing Details & Entities */}
                          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                              <h5 style={{ margin: 0, fontSize: '0.82rem', color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <i className='bx bx-credit-card' style={{ color: '#10b981' }}></i> Billing Details & Entities
                              </h5>
                            </div>

                            {isEditingOnboarding ? (
                              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#1e40af', background: '#dbeafe', padding: '0.1rem 0.4rem', borderRadius: '3px', textTransform: 'uppercase' }}>
                                    Primary Entity
                                  </span>
                                  <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                                    {onboardingFormState.billingDetails?.companyName || onboardingFormState.billingDetails?.companies?.[0]?.companyName || 'Entity Details'}
                                  </strong>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                                  <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '0.72rem', color: '#64748b' }}>Company Name</label>
                                    <input 
                                      type="text" 
                                      className="form-control" 
                                      value={onboardingFormState.billingDetails?.companyName || onboardingFormState.billingDetails?.companies?.[0]?.companyName || ''} 
                                      onChange={(e) => handleDivisionCompanyChange('companyName', e.target.value)} 
                                      placeholder="Registered Entity" 
                                      style={{ fontSize: '0.82rem', padding: '0.4rem' }} 
                                    />
                                  </div>
                                  <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '0.72rem', color: '#64748b' }}>GST / Tax Number</label>
                                    <input 
                                      type="text" 
                                      className="form-control" 
                                      value={onboardingFormState.billingDetails?.gstNumber || onboardingFormState.billingDetails?.companies?.[0]?.gstNumber || ''} 
                                      onChange={(e) => handleDivisionCompanyChange('gstNumber', e.target.value)} 
                                      placeholder="Tax / GST ID" 
                                      style={{ fontSize: '0.82rem', padding: '0.4rem' }} 
                                    />
                                  </div>
                                  <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                                    <label style={{ fontSize: '0.72rem', color: '#64748b' }}>Billing Address</label>
                                    <textarea 
                                      className="form-control" 
                                      rows="2" 
                                      value={onboardingFormState.billingDetails?.address || onboardingFormState.billingDetails?.companies?.[0]?.address || ''} 
                                      onChange={(e) => handleDivisionCompanyChange('address', e.target.value)} 
                                      placeholder="Full Registered Address" 
                                      style={{ fontSize: '0.82rem', padding: '0.4rem' }}
                                    ></textarea>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                                  <span style={{ fontSize: '0.68rem', fontWeight: '700', color: '#1e40af', background: '#dbeafe', padding: '0.1rem 0.35rem', borderRadius: '3px', textTransform: 'uppercase' }}>
                                    Primary Entity
                                  </span>
                                  <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                                    {onboardingFormState.billingDetails?.companyName || onboardingFormState.billingDetails?.companies?.[0]?.companyName || 'Unnamed Entity'}
                                  </strong>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                                  <div>
                                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>GST / Tax Number</span>
                                    <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '500' }}>
                                      {onboardingFormState.billingDetails?.gstNumber || onboardingFormState.billingDetails?.companies?.[0]?.gstNumber || <em style={{ color: '#94a3b8' }}>Not provided</em>}
                                    </span>
                                  </div>
                                  <div style={{ gridColumn: '1 / -1' }}>
                                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>Billing Address</span>
                                    <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '500', whiteSpace: 'pre-wrap' }}>
                                      {onboardingFormState.billingDetails?.address || onboardingFormState.billingDetails?.companies?.[0]?.address || <em style={{ color: '#94a3b8' }}>Not provided</em>}
                                    </span>
                                  </div>
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

                          {/* 5. Expectations & Notes */}
                          <div style={{ background: 'white', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <h5 style={{ margin: 0, fontSize: '0.85rem', color: '#334155', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <i className='bx bx-message-square-detail' style={{ color: '#8b5cf6', fontSize: '1.1rem' }}></i> Expectations & Operational Notes
                              </h5>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                SLA standards, reporting frequency & special delivery guidelines
                              </span>
                            </div>

                            {isEditingOnboarding ? (
                              <div>
                                <textarea 
                                  className="form-control" 
                                  rows="7" 
                                  value={onboardingFormState.expectations || ''} 
                                  onChange={(e) => setOnboardingFormState(prev => ({ ...prev, expectations: e.target.value }))} 
                                  placeholder="Record comprehensive expectations, SLA response windows, team coordination instructions, or specific exclusions..." 
                                  style={{ 
                                    width: '100%',
                                    fontSize: '0.92rem', 
                                    lineHeight: '1.6',
                                    padding: '0.85rem 1rem',
                                    minHeight: '160px',
                                    borderRadius: '8px',
                                    border: '1.5px solid #cbd5e1',
                                    color: '#0f172a',
                                    outline: 'none',
                                    resize: 'vertical'
                                  }}
                                ></textarea>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.45rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                                  <span>Press Enter for paragraph spacing. Rich details ensure smooth client handoff.</span>
                                  <span style={{ fontWeight: '500' }}>{onboardingFormState.expectations?.length || 0} characters</span>
                                </div>
                              </div>
                            ) : (
                              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                <p style={{ margin: 0, fontSize: '0.92rem', color: '#0f172a', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                  {onboardingFormState.expectations || <em style={{ color: '#94a3b8' }}>No expectations provided yet. Click "Edit Onboarding" to add operational guidelines.</em>}
                                </p>
                              </div>
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
                </div>
              )}
            </div>

            {/* Section 3: Division Documents */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <button 
                type="button"
                onClick={() => setIsDocumentsOpen(!isDocumentsOpen)}
                style={{ 
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '0.85rem 1.25rem',
                  background: isDocumentsOpen ? '#f8fafc' : 'linear-gradient(90deg, #ffffff 80%, #faf5ff 100%)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <i className='bx bx-folder' style={{ color: '#7c3aed', fontSize: '1.25rem' }}></i>
                  <span style={{ fontSize: '0.92rem', color: '#1e293b', fontWeight: '600' }}>Division Documents</span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• Upload and manage documents</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  background: '#faf5ff',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #e9d5ff',
                  color: '#6d28d9'
                }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '600' }}>
                    {divisionDocs.length} {divisionDocs.length === 1 ? 'Doc' : 'Docs'}
                  </span>
                  <i className={`bx ${isDocumentsOpen ? 'bx-chevron-up' : 'bx-chevron-down'}`} style={{ fontSize: '1.2rem', color: '#7c3aed' }}></i>
                </div>
              </button>
              
              {isDocumentsOpen && (
                <div style={{ padding: '1.25rem', background: 'white', borderTop: '1px solid #e2e8f0' }}>

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

            {/* Section 4: Division Contracts */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.25rem', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <button 
                type="button"
                onClick={() => setIsContractsOpen(!isContractsOpen)}
                style={{ 
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '0.85rem 1.25rem',
                  background: isContractsOpen ? '#f8fafc' : 'linear-gradient(90deg, #ffffff 80%, #ecfdf5 100%)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <i className='bx bx-file-blank' style={{ color: '#0284c7', fontSize: '1.25rem' }}></i>
                  <span style={{ fontSize: '0.92rem', color: '#1e293b', fontWeight: '600' }}>Division Contracts</span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• Legal entities & billing contracts</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  background: '#ecfdf5',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #a7f3d0',
                  color: '#047857'
                }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '600' }}>
                    {divisionContracts.length} {divisionContracts.length === 1 ? 'Contract' : 'Contracts'}
                  </span>
                  <i className={`bx ${isContractsOpen ? 'bx-chevron-up' : 'bx-chevron-down'}`} style={{ fontSize: '1.2rem', color: '#047857' }}></i>
                </div>
              </button>
              
              {isContractsOpen && (
                <div style={{ padding: '1.25rem', background: 'white', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem 0', color: '#1e293b', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <i className='bx bx-file-blank' style={{ color: '#0284c7' }}></i>
                          Division Contracts
                        </h4>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                          Manage contract options with onboarding company details, exchange rate, and bank info. Can be attached to orders.
                        </p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setSelectedContractForEdit(null);
                          setIsContractModalOpen(true);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
                      >
                        <i className='bx bx-plus'></i> Add Contract
                      </button>
                    </div>

                    {divisionContracts.length > 0 ? (
                      <div style={{ overflowX: 'auto', background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                              <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: '600' }}>Company / Entity</th>
                              <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: '600' }}>Contract Value</th>
                              <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: '600' }}>Amount in USD</th>
                              <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: '600' }}>Bill From / Bank</th>
                              <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: '600' }}>Billing Date</th>
                              <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: '600' }}>Order Name</th>
                              <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: '600', minWidth: '130px', textAlign: 'center' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {divisionContracts.map((cnt, idx) => (
                              <tr key={cnt.id || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '0.75rem 1rem', color: '#0f172a', fontWeight: '500' }}>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                    <i className='bx bx-buildings' style={{ color: '#0284c7', fontSize: '1.15rem', marginTop: '2px' }}></i>
                                    <div>
                                      {cnt.companyEntities && cnt.companyEntities.length > 1 ? (
                                        <div>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem' }}>
                                            <span style={{ fontWeight: '600', color: '#0f172a' }}>Multi-Company Split</span>
                                            <span style={{ fontSize: '0.68rem', background: '#e0f2fe', color: '#0369a1', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                                              {cnt.companyEntities.length} entities
                                            </span>
                                          </div>
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                            {cnt.companyEntities.map((ent, eIdx) => (
                                              <div key={ent.id || eIdx} style={{ fontSize: '0.75rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                <span style={{ fontWeight: '600', color: '#1e293b' }}>{ent.companyName}</span>
                                                {ent.percentage !== undefined && ent.percentage !== null && (
                                                  <span style={{ color: '#0284c7', fontWeight: '700', fontSize: '0.72rem' }}>({ent.percentage}%)</span>
                                                )}
                                                {ent.taxDetails && <span style={{ color: '#94a3b8' }}>• Tax: {ent.taxDetails}</span>}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ) : (
                                        <div>
                                          <div style={{ fontWeight: '600' }}>{cnt.companyName}</div>
                                          {cnt.taxDetails && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Tax/GST: {cnt.taxDetails}</div>}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '0.75rem 1rem', color: '#0f172a', fontWeight: '600' }}>
                                  {cnt.contractValue?.toLocaleString()} {cnt.contractCurrency}
                                </td>
                                <td style={{ padding: '0.75rem 1rem', color: '#0284c7', fontWeight: '700' }}>
                                  ${cnt.amountInUSD?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                </td>
                                <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>
                                  <div>{cnt.billFrom}</div>
                                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{cnt.receivingBankName}</div>
                                </td>
                                <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>
                                  <div>{cnt.billingDate}</div>
                                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Due: {cnt.paymentDueDays}d</div>
                                </td>
                                <td style={{ padding: '0.75rem 1rem', color: cnt.orderName ? '#0f172a' : '#94a3b8' }}>
                                  {cnt.orderName ? (
                                    <span 
                                      onClick={() => {
                                        if (cnt.orderId) {
                                          navigate(`/corporate/division/order/edit/${cnt.orderId}`, {
                                            state: { edit: true, orderId: cnt.orderId, clientName: formData.clientName, divisionName: formData.divisionName, divisionId: division.id }
                                          });
                                        }
                                      }}
                                      style={{ 
                                        background: '#eff6ff', 
                                        color: '#1d4ed8', 
                                        padding: '0.25rem 0.6rem', 
                                        borderRadius: '4px', 
                                        fontSize: '0.8rem', 
                                        fontWeight: '600',
                                        cursor: cnt.orderId ? 'pointer' : 'default',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        border: '1px solid #bfdbfe'
                                      }}
                                      title={cnt.orderId ? 'Click to view / edit order' : ''}
                                    >
                                      <i className='bx bx-receipt' style={{ fontSize: '0.9rem' }}></i>
                                      {cnt.orderName}
                                    </span>
                                  ) : (
                                    orders && orders.length > 0 ? (
                                      <select
                                        value=""
                                        onChange={(e) => {
                                          if (e.target.value) {
                                            mapContractToOrder(cnt.id, e.target.value);
                                          }
                                        }}
                                        style={{
                                          padding: '0.2rem 0.45rem',
                                          borderRadius: '4px',
                                          border: '1px dashed #93c5fd',
                                          background: '#eff6ff',
                                          color: '#1d4ed8',
                                          fontSize: '0.78rem',
                                          cursor: 'pointer',
                                          fontWeight: '600',
                                          outline: 'none',
                                          maxWidth: '190px'
                                        }}
                                        title="Click to link this contract to an Order"
                                      >
                                        <option value="" disabled>+ Link Order</option>
                                        {orders.map(o => (
                                          <option key={o.id} value={o.id}>
                                            #{o.id} • {o.planStart || 'Date'} ({o.plan || o.planName || o.product || 'Order'})
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem', background: '#f8fafc', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px dashed #cbd5e1' }}>
                                        — Unlinked —
                                      </span>
                                    )
                                  )}
                                </td>
                                <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                                    <button 
                                      type="button"
                                      onClick={() => handleScheduleBilling(cnt)}
                                      style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        color: '#059669', 
                                        cursor: 'pointer', 
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '4px',
                                        transition: 'background 0.15s ease'
                                      }}
                                      onMouseEnter={e => e.currentTarget.style.background = '#ecfdf5'}
                                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                      title="Schedule Billing"
                                    >
                                      <i className='bx bx-calendar-plus' style={{ fontSize: '1.15rem' }}></i>
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        setSelectedContractForEdit(cnt);
                                        setIsContractModalOpen(true);
                                      }}
                                      style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', padding: '4px' }}
                                      title="Edit Contract"
                                    >
                                      <i className='bx bx-edit-alt' style={{ fontSize: '1.1rem' }}></i>
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => deleteDivisionContract(cnt.id)} 
                                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} 
                                      title="Delete Contract"
                                    >
                                      <i className='bx bx-trash' style={{ fontSize: '1.1rem' }}></i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ padding: '1.5rem', textAlign: 'center', background: 'white', border: '1px dashed #cbd5e1', borderRadius: '6px', color: '#94a3b8', fontSize: '0.85rem' }}>
                        No contracts created for this division yet. Click "+ Add Contract" to create one.
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

      {/* Access & Roles Section */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <button 
          type="button"
          onClick={() => setIsAccessRolesOpen(!isAccessRolesOpen)}
          style={{ 
            width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            padding: '0.85rem 1.25rem',
            background: isAccessRolesOpen ? '#f8fafc' : 'linear-gradient(90deg, #ffffff 80%, #f0fdfa 100%)',
            border: 'none', cursor: 'pointer', transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <i className='bx bx-group' style={{ color: '#0d9488', fontSize: '1.25rem' }}></i>
            <span style={{ fontSize: '0.92rem', color: '#1e293b', fontWeight: '600' }}>Access & Roles</span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• Manage roles and permissions for corporate access</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            background: '#f0fdfa',
            padding: '0.35rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid #99f6e4',
            color: '#0f766e'
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <i className='bx bx-user-check'></i>
              {roles.length} Roles {invites?.length > 0 ? `• ${invites.length} Invites` : ''}
            </span>
            <i className={`bx ${isAccessRolesOpen ? 'bx-chevron-up' : 'bx-chevron-down'}`} style={{ fontSize: '1.2rem', color: '#0d9488' }}></i>
          </div>
        </button>

        {isAccessRolesOpen && (
          <div style={{ padding: '1.25rem', background: 'white', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: '700' }}>Roles & Corporate Permissions</h4>
                <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.82rem' }}>Invite stakeholders and manage individual role access</p>
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
        )}
      </div>
      
      {/* Orders Section */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <button 
          type="button"
          onClick={() => setIsOrdersOpen(!isOrdersOpen)}
          style={{ 
            width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            padding: '0.85rem 1.25rem',
            background: isOrdersOpen ? '#f8fafc' : 'linear-gradient(90deg, #ffffff 80%, #eef2ff 100%)',
            border: 'none', cursor: 'pointer', transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <i className='bx bx-receipt' style={{ color: '#4338ca', fontSize: '1.25rem' }}></i>
            <span style={{ fontSize: '0.92rem', color: '#1e293b', fontWeight: '600' }}>Division Orders</span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• BD billing configurations, draft & active orders</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            background: '#eef2ff',
            padding: '0.35rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid #c7d2fe',
            color: '#4338ca'
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <i className='bx bx-package'></i>
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
            </span>
            <i className={`bx ${isOrdersOpen ? 'bx-chevron-up' : 'bx-chevron-down'}`} style={{ fontSize: '1.2rem', color: '#4338ca' }}></i>
          </div>
        </button>

        {isOrdersOpen && (
          <div style={{ padding: '1.25rem', background: 'white', borderTop: '1px solid #e2e8f0' }}>
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
        )}
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

      <ContractModal
        isOpen={isContractModalOpen}
        onClose={() => {
          setIsContractModalOpen(false);
          setSelectedContractForEdit(null);
        }}
        onSave={handleSaveContract}
        onSaveAndSchedule={(data) => handleSaveContract(data, true)}
        divisionId={division.id}
        initialData={selectedContractForEdit}
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
