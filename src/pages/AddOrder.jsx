import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import DocumentUploadModal from '../components/DocumentUploadModal';
import DocumentConnectModalV2 from '../components/DocumentConnectModalV2';
import PaymentSummaryModal from '../components/PaymentSummaryModal';
import ConfirmModal from '../components/ConfirmModal';
import PaymentScheduleModal from '../components/PaymentScheduleModal';
import AddExpenseModal from '../components/AddExpenseModal';
import ViewExpensesModal from '../components/ViewExpensesModal';

const Tooltip = ({ text, align = 'center' }) => {
  const [isVisible, setIsVisible] = useState(false);

  let posStyles = { left: '50%', transform: 'translateX(-50%)' };
  let arrowStyles = { left: '50%', transform: 'translateX(-50%)' };
  
  if (align === 'right') {
    posStyles = { right: '-10px', transform: 'none' };
    arrowStyles = { right: '14px', transform: 'none' };
  } else if (align === 'left') {
    posStyles = { left: '-10px', transform: 'none' };
    arrowStyles = { left: '14px', transform: 'none' };
  }

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block', marginLeft: '4px' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <i className="bx bx-info-circle" style={{ color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}></i>
      {isVisible && (
        <div style={{
          position: 'absolute',
          bottom: '120%',
          ...posStyles,
          marginBottom: '5px',
          backgroundColor: '#334155',
          color: 'white',
          padding: '5px 8px',
          borderRadius: '4px',
          fontSize: '0.65rem',
          fontWeight: '400',
          whiteSpace: 'normal',
          width: 'max-content',
          maxWidth: '180px',
          textAlign: align === 'center' ? 'center' : (align === 'right' ? 'right' : 'left'),
          zIndex: 9999,
          pointerEvents: 'none',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          {text}
          <div style={{
            position: 'absolute',
            top: '100%',
            ...arrowStyles,
            borderWidth: '4px',
            borderStyle: 'solid',
            borderColor: '#334155 transparent transparent transparent'
          }}></div>
        </div>
      )}
    </div>
  );
};

function AddOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId: paramOrderId } = useParams();
  const [searchParams] = useSearchParams();
  const queryOrderId = searchParams.get('orderId') || searchParams.get('id');
  const effectiveOrderId = paramOrderId || queryOrderId || location.state?.orderId;
  const isEditMode = Boolean(
    location.state?.edit === true || 
    paramOrderId || 
    location.pathname.includes('/order/edit') || 
    searchParams.get('edit') === 'true' ||
    (queryOrderId && queryOrderId !== '')
  );
  const { showToast, expenses, updateExpense, events, updateExpenseStatus } = useGlobal();
  const tempSessionId = useRef(`temp_${Date.now()}`).current;
  
  const [formData, setFormData] = useState({
    contractDetails: {
      sessionLimits: '',
      checkSessions: false,
      documents: [],
      v2Documents: [],
      contracts: [],
      remarks: ''
    },
    plan: 'Select Plan',
    programCode: '',
    employees: '',
    planStart: '',
    planEnd: '',
    amount: '',
    billingDetails: null,
    countryCode: 'India',
    providerCostLevel: 'Standard',
    
    description: '',
    domains: '',
    remarks: '',
    
    addOns: {
      coupons: false,
      corporateWallet: false,
      limitedSession: false
    },
    
    appConfig: {
      pathways: true,
      trackers: 'All',
      tiles: 'Select tiles',
      monetization: 'Select monetization features'
    },
    
    access: {
      employeeRestriction: false,
      autoInvite: false,
      otp: false
    }
  });

  useEffect(() => {
    // Force scroll to top on mount
    window.scrollTo(0, 0);

    if (isEditMode && effectiveOrderId) {
      const saved = localStorage.getItem('division_orders');
      if (saved) {
        try {
          const orders = JSON.parse(saved);
          const order = orders.find(o => String(o.id) === String(effectiveOrderId));
          if (order) {
            setFormData(prev => ({
              ...prev,
              ...order,
              divisionName: order.divisionName || prev.divisionName || location.state?.divisionName || '',
              clientName: order.clientName || prev.clientName || location.state?.clientName || '',
              divisionId: order.divisionId || prev.divisionId || location.state?.divisionId || '',
              contractDetails: {
                ...prev.contractDetails,
                ...(order.contractDetails || {}),
                contracts: order.contractDetails?.contracts || (() => {
                  try {
                    const allContracts = JSON.parse(localStorage.getItem('division_contracts') || '[]');
                    return allContracts.filter(c => String(c.orderId) === String(effectiveOrderId));
                  } catch (e) {
                    return [];
                  }
                })()
              },
              addOns: {
                ...prev.addOns,
                ...(order.addOns || {})
              },
              appConfig: {
                ...prev.appConfig,
                ...(order.appConfig || {})
              },
              access: {
                ...prev.access,
                ...(order.access || {})
              }
            }));
          }
        } catch (e) {
          console.error("Error loading order:", e);
        }
      }
    } else {
      const targetDivId = location.state?.divisionId || searchParams.get('divisionId') || '1';
      setFormData(prev => ({
        ...prev,
        divisionId: targetDivId,
        clientName: location.state?.clientName || prev.clientName || 'Corporate Client',
        divisionName: location.state?.divisionName || prev.divisionName || `Division #${targetDivId}`
      }));
    }
  }, [isEditMode, effectiveOrderId, location.state, searchParams]);

  // Division Contracts State (Single source of truth from Division page)
  const resolvedDivisionId = useMemo(() => {
    return (
      location.state?.divisionId || 
      searchParams.get('divisionId') || 
      formData.divisionId || 
      '1'
    );
  }, [location.state, searchParams, formData.divisionId]);

  const [divisionContracts, setDivisionContracts] = useState([]);
  const [selectedContractIds, setSelectedContractIds] = useState([]);
  const [isContractsDropdownOpen, setIsContractsDropdownOpen] = useState(false);
  const [contractSearch, setContractSearch] = useState('');
  const contractsDropdownRef = useRef(null);

  // Close contracts dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (contractsDropdownRef.current && !contractsDropdownRef.current.contains(e.target)) {
        setIsContractsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDivisionContracts = useMemo(() => {
    if (!contractSearch.trim()) return divisionContracts;
    const q = contractSearch.toLowerCase();
    return divisionContracts.filter(c => 
      (c.companyName && c.companyName.toLowerCase().includes(q)) ||
      (c.taxDetails && c.taxDetails.toLowerCase().includes(q)) ||
      (c.contractCurrency && c.contractCurrency.toLowerCase().includes(q)) ||
      (c.billFrom && c.billFrom.toLowerCase().includes(q)) ||
      (c.receivingBankName && c.receivingBankName.toLowerCase().includes(q))
    );
  }, [divisionContracts, contractSearch]);

  // Load contracts for this division
  const loadDivisionContracts = () => {
    try {
      const saved = localStorage.getItem('division_contracts');
      let all = saved ? JSON.parse(saved) : [];

      // Seed realistic demo contracts for division '1' if completely empty
      if ((!all || all.length === 0) && (String(resolvedDivisionId) === '1' || resolvedDivisionId === 1)) {
        all = [
          {
            id: 'cnt_demo_1',
            divisionId: '1',
            companyName: 'Acme Global Corp (US)',
            taxDetails: 'US-EIN-9876543',
            contractValue: 12000,
            contractCurrency: 'USD',
            currencyExchangeValue: 1,
            amountInUSD: 12000,
            billFrom: 'MCC',
            receivingBankName: 'AirWallex',
            billingDate: new Date().toISOString().split('T')[0],
            paymentDueDays: 30,
            orderId: '',
            orderName: ''
          },
          {
            id: 'cnt_demo_2',
            divisionId: '1',
            companyName: 'Acme Solutions Pvt Ltd (India)',
            taxDetails: 'GSTIN27AABCU9603R1ZM',
            contractValue: 350000,
            contractCurrency: 'INR',
            currencyExchangeValue: 83.5,
            amountInUSD: 4191.62,
            billFrom: 'MCHPL',
            receivingBankName: 'ICICI',
            billingDate: new Date().toISOString().split('T')[0],
            paymentDueDays: 15,
            orderId: '',
            orderName: ''
          }
        ];
        localStorage.setItem('division_contracts', JSON.stringify(all));
      }

      const forThisDiv = all.filter(c => String(c.divisionId) === String(resolvedDivisionId));
      setDivisionContracts(forThisDiv);
      return forThisDiv;
    } catch (e) {
      console.error('Failed to load division_contracts:', e);
      setDivisionContracts([]);
      return [];
    }
  };

  useEffect(() => {
    loadDivisionContracts();
    window.addEventListener('storage', loadDivisionContracts);
    return () => window.removeEventListener('storage', loadDivisionContracts);
  }, [resolvedDivisionId]);

  // Sync selected contract IDs on order load
  useEffect(() => {
    if (formData.contractDetails?.contracts && formData.contractDetails.contracts.length > 0) {
      setSelectedContractIds(formData.contractDetails.contracts.map(c => c.id));
    } else if (effectiveOrderId && divisionContracts.length > 0) {
      const linked = divisionContracts.filter(c => String(c.orderId) === String(effectiveOrderId));
      if (linked.length > 0) {
        setSelectedContractIds(linked.map(c => c.id));
      }
    }
  }, [effectiveOrderId, divisionContracts.length]);

  // Helper to recompute order amount & billing details when contracts are selected/deselected
  const updateOrderFromSelectedContracts = (newSelectedIds, currentContracts = divisionContracts) => {
    const selected = currentContracts.filter(c => newSelectedIds.includes(c.id));
    const totalUSD = selected.reduce((sum, c) => {
      const val = Number(c.amountInUSD) || Number(c.contractValue) || 0;
      return sum + val;
    }, 0);

    const primary = selected[0] || null;

    setFormData(prev => ({
      ...prev,
      amount: totalUSD > 0 ? totalUSD.toFixed(2) : '',
      contractDetails: {
        ...prev.contractDetails,
        contracts: selected
      },
      billingDetails: selected.length > 0 ? {
        billingEntity: selected.map(c => c.companyName).join(', '),
        companyName: selected.map(c => c.companyName).join(', '),
        taxDetails: selected.map(c => c.taxDetails).filter(Boolean).join(', ') || 'N/A',
        contractValue: totalUSD.toFixed(2),
        clientCurrency: selected.every(c => c.contractCurrency === primary?.contractCurrency) 
          ? (primary?.contractCurrency || 'USD') 
          : 'USD',
        currencyExchangeValue: '1',
        amountInUSD: totalUSD.toFixed(2),
        paymentDueDays: primary?.paymentDueDays || '30',
        paymentDue: primary?.paymentDueDays || '30',
        billFrom: selected.map(c => c.billFrom).filter(Boolean).join(', ') || 'MCC',
        receivingBankName: selected.map(c => c.receivingBankName).filter(Boolean).join(', ') || '',
        bankDetailsLink: primary?.bankDetailsLink || '',
        billingDate: primary?.billingDate || new Date().toISOString().split('T')[0],
        billingSplits: selected.map(c => ({
          id: c.id,
          companyName: c.companyName,
          taxDetails: c.taxDetails,
          contractValue: c.contractValue,
          contractCurrency: c.contractCurrency,
          amountInUSD: c.amountInUSD,
          billFrom: c.billFrom,
          receivingBankName: c.receivingBankName,
          bankDetailsLink: c.bankDetailsLink,
          selected: true
        }))
      } : null
    }));
  };

  const handleToggleContract = (contractId) => {
    setSelectedContractIds(prev => {
      const isSelected = prev.includes(contractId);
      const newSelected = isSelected ? prev.filter(id => id !== contractId) : [...prev, contractId];
      updateOrderFromSelectedContracts(newSelected);
      return newSelected;
    });
  };

  const handleSelectAllContracts = () => {
    const allIds = divisionContracts.map(c => c.id);
    setSelectedContractIds(allIds);
    updateOrderFromSelectedContracts(allIds);
  };

  const handleDeselectAllContracts = () => {
    setSelectedContractIds([]);
    updateOrderFromSelectedContracts([]);
  };


  const syncDivisionContractsMapping = (targetOrderId, targetOrderName, selectedContracts) => {
    try {
      const allDivContracts = JSON.parse(localStorage.getItem('division_contracts') || '[]');
      const selectedIds = (selectedContracts || []).map(c => c.id);

      (selectedContracts || []).forEach(sc => {
        if (!allDivContracts.find(c => c.id === sc.id)) {
          allDivContracts.push({ ...sc, divisionId: resolvedDivisionId });
        }
      });

      const updated = allDivContracts.map(c => {
        if (selectedIds.includes(c.id)) {
          return { ...c, orderId: targetOrderId, orderName: targetOrderName };
        }
        if (String(c.orderId) === String(targetOrderId) && !selectedIds.includes(c.id)) {
          return { ...c, orderId: '', orderName: '' };
        }
        return c;
      });

      localStorage.setItem('division_contracts', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Failed to sync division contracts mapping', e);
    }
  };

  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isDocModalV2Open, setIsDocModalV2Open] = useState(false);
  const [isPaymentSummaryOpen, setIsPaymentSummaryOpen] = useState(false);
  const [isPaymentScheduleOpen, setIsPaymentScheduleOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [viewingExpense, setViewingExpense] = useState(null);
  const [editExpenseData, setEditExpenseData] = useState(null);
  const [paymentDueBadge, setPaymentDueBadge] = useState(null);
  
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm'
  });
  const [revokingExpenseId, setRevokingExpenseId] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const productDropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target)) {
        setIsProductDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate Payment Due from stored payments filtered by this orderId
  useEffect(() => {
    const orderId = effectiveOrderId;
    if (!orderId) return;
    try {
      const contractVal = Number(formData.billingDetails?.amountInUSD || formData.amount) || 0;
      const savedPayments = localStorage.getItem('client_payments');
      if (savedPayments) {
        const allPayments = JSON.parse(savedPayments);
        const orderPayments = allPayments.filter(p => String(p.orderId) === String(orderId));
        const totalPaid = orderPayments.reduce((acc, curr) => acc + (Number(curr.totalPaid) || 0), 0);
        setPaymentDueBadge(Math.max(0, contractVal - totalPaid));
      } else {
        setPaymentDueBadge(contractVal);
      }
    } catch (e) {
      console.error('Failed to calculate payment due', e);
    }
  }, [effectiveOrderId, formData.billingDetails, formData.amount]);
  
  const addDocument = (newDoc) => {
    setFormData(prev => ({
      ...prev,
      contractDetails: {
        ...prev.contractDetails,
        documents: [...(prev.contractDetails.documents || []), newDoc]
      }
    }));
    setIsDocModalOpen(false);
  };

  const addV2Documents = (docs) => {
    setFormData(prev => {
      const existing = prev.contractDetails.v2Documents || [];
      const newDocs = docs.filter(d => !existing.find(ed => ed.id === d.id));
      return {
        ...prev,
        contractDetails: {
          ...prev.contractDetails,
          v2Documents: [...existing, ...newDocs]
        }
      };
    });
    setIsDocModalV2Open(false);
  };

  const removeOrderContract = (contract) => {
    handleToggleContract(contract.id);
  };
  
  const removeDocument = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Document',
      message: 'Are you sure you want to delete this document?',
      confirmText: 'Delete',
      onConfirm: () => {
        setFormData(prev => ({
          ...prev,
          contractDetails: {
            ...prev.contractDetails,
            documents: prev.contractDetails.documents.filter(doc => doc.id !== id)
          }
        }));
      }
    });
  };

  const removeV2Document = (doc) => {
    const isDirect = doc.isDirectlyUploaded;
    const title = isDirect ? 'Delete Document' : 'Disconnect Document';
    const message = isDirect 
      ? 'Are you sure you want to delete this document? It will be removed from both the Division and this Order.' 
      : 'Are you sure you want to disconnect this document from this order?';
    
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      confirmText: isDirect ? 'Delete' : 'Disconnect',
      onConfirm: () => {
        setFormData(prev => ({
          ...prev,
          contractDetails: {
            ...prev.contractDetails,
            v2Documents: prev.contractDetails.v2Documents.filter(d => d.id !== doc.id)
          }
        }));
      }
    });
  };

  const [expandedSections, setExpandedSections] = useState({
    contractDetails: false,
    planSchedule: true,
    details: true,
    addOns: true,
    appConfig: true,
    accessSecurity: true,
    expenseDetails: true
  });

  const orderExpenses = (expenses || []).filter(exp => {
    const targetOrderId = effectiveOrderId || tempSessionId;
    if (String(exp.orderId) === String(targetOrderId)) return true;
    if (exp.eventId && formData.orderName) {
      const relatedEvent = events?.find(ev => String(ev.id) === String(exp.eventId));
      if (relatedEvent && String(relatedEvent.orderName) === String(formData.orderName)) {
        return true;
      }
    }
    return false;
  });

  const formatCurrency = (amount) => {
    const num = Number(amount);
    return isNaN(num) ? amount : `$${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#dcfce7', color: '#166534' }}>Approved</span>;
      case 'Rejected':
        return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#fee2e2', color: '#991b1b' }}>Rejected</span>;
      case 'Settled':
        return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#e0e7ff', color: '#3730a3' }}>Settled</span>;
      case 'Revoked':
        return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#f3f4f6', color: '#4b5563' }}>Revoked</span>;
      default:
        return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#fef3c7', color: '#92400e' }}>{status || 'Pending'}</span>;
    }
  };

  const handleSettleExpense = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Settle Expense',
      message: 'Are you sure you want to mark this expense as settled? Once settled, the expense can not be revoked.',
      confirmText: 'Confirm Settle',
      onConfirm: () => {
        updateExpenseStatus(id, 'Settled', 'Expense settled by CS');
        showToast('Expense marked as settled', 5000);
      }
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addMonthsToPlanStart = (months) => {
    if (!formData.planStart) {
      showToast('Please select Plan Start first.', 3000);
      return;
    }
    const startDate = new Date(formData.planStart);
    startDate.setMonth(startDate.getMonth() + months);
    const yyyy = startDate.getFullYear();
    const mm = String(startDate.getMonth() + 1).padStart(2, '0');
    const dd = String(startDate.getDate()).padStart(2, '0');
    setFormData(prev => ({ ...prev, planEnd: `${yyyy}-${mm}-${dd}` }));
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <div 
      onClick={onChange}
      style={{
        width: '44px',
        height: '24px',
        background: checked ? '#0ea5e9' : '#cbd5e1',
        borderRadius: '12px',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.3s',
        flexShrink: 0
      }}
    >
      <div style={{
        width: '20px',
        height: '20px',
        background: 'white',
        borderRadius: '50%',
        position: 'absolute',
        top: '2px',
        left: checked ? '22px' : '2px',
        transition: 'left 0.3s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }}></div>
    </div>
  );

  const inputStyle = {
    width: '100%',
    padding: '0.6rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    outline: 'none',
    color: '#0f172a'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.8rem',
    color: '#64748b',
    marginBottom: '0.3rem',
    fontWeight: '500'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: '#0f172a',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    userSelect: 'none'
  };
  
  const iconBoxStyle = {
    width: '32px',
    height: '32px',
    background: '#f0f9ff',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#0ea5e9'
  };

  const handleAddOnToggle = (key) => {
    setFormData(prev => ({
      ...prev,
      addOns: { ...prev.addOns, [key]: !prev.addOns[key] }
    }));
  };

  const handleConfigToggle = (key) => {
    setFormData(prev => ({
      ...prev,
      appConfig: { ...prev.appConfig, [key]: !prev.appConfig[key] }
    }));
  };

  const handleAccessToggle = (key) => {
    setFormData(prev => ({
      ...prev,
      access: { ...prev.access, [key]: !prev.access[key] }
    }));
  };

  const getPendingFields = () => {
    const pending = [];
    if (formData.contractDetails.checkSessions && !formData.contractDetails.sessionLimits) pending.push('Session Limits');
    if (!formData.employees) pending.push('No of Employees');
    return pending;
  };

  const pendingFields = getPendingFields();
  const isCreateDisabled = pendingFields.length > 0;

  const saveDraftInternal = () => {
    try {
      const saved = localStorage.getItem('division_orders');
      let orders = saved ? JSON.parse(saved) : [];

      let targetOrderId;
      let targetOrderName;
      const resolvedClientName = location.state?.clientName || formData.clientName || '';
      const resolvedDivisionName = location.state?.divisionName || formData.divisionName || '';

      if (isEditMode && effectiveOrderId) {
        targetOrderId = effectiveOrderId;
        targetOrderName = formData.orderName || `${resolvedDivisionName || 'Draft Order'} | ${formData.planStart || 'Draft'} - ${formData.plan || 'Draft'}`;
        orders = orders.map(o => String(o.id) === String(targetOrderId) ? { 
          ...o, 
          ...formData, 
          id: targetOrderId, 
          status: 'Draft',
          clientName: resolvedClientName,
          divisionName: resolvedDivisionName
        } : o);
      } else {
        targetOrderId = Date.now();
        targetOrderName = `${resolvedDivisionName || 'Draft Order'} | ${formData.planStart || 'Draft'} - ${formData.plan || 'Draft'}`;
        const newDraftOrder = { 
          ...formData, 
          id: targetOrderId, 
          status: 'Draft',
          divisionName: resolvedDivisionName,
          clientName: resolvedClientName,
          divisionId: location.state?.divisionId || formData.divisionId || searchParams.get('divisionId') || '',
          sessionCount: formData.sessionCount || 0
        };
        orders.push(newDraftOrder);

        // Link any expenses added during this session to the new draft order
        const sessionExpenses = expenses.filter(e => e.orderId === tempSessionId);
        sessionExpenses.forEach(exp => {
          updateExpense(exp.id, { orderId: targetOrderId });
        });
      }

      localStorage.setItem('division_orders', JSON.stringify(orders));

      // Process V2 documents connecting/saving
      if (formData.contractDetails?.v2Documents) {
        const allDivDocs = JSON.parse(localStorage.getItem('division_documents') || '[]');
        const v2Ids = formData.contractDetails.v2Documents.map(d => d.id);

        formData.contractDetails.v2Documents.forEach(doc => {
          if (!allDivDocs.find(d => d.id === doc.id)) {
            allDivDocs.push(doc);
          }
        });

        const updatedDivDocs = allDivDocs.map(d => {
          if (v2Ids.includes(d.id)) {
            return { ...d, orderId: targetOrderId, orderName: targetOrderName };
          }
          if (String(d.orderId) === String(targetOrderId) && !v2Ids.includes(d.id)) {
            if (d.isDirectlyUploaded) {
              return null;
            }
            return { ...d, orderId: '', orderName: '' };
          }
          return d;
        }).filter(Boolean);

        localStorage.setItem('division_documents', JSON.stringify(updatedDivDocs));
      }

      // Sync mapped contracts to division_contracts table
      syncDivisionContractsMapping(targetOrderId, targetOrderName, formData.contractDetails?.contracts || []);

      return { targetOrderId, targetOrderName, clientName: resolvedClientName, divisionName: resolvedDivisionName };
    } catch (e) {
      console.error("Error saving draft:", e);
      return null;
    }
  };

  const handleSaveAsDraft = () => {
    saveDraftInternal();
    showToast('Order saved as draft!', 4000);
    navigate(-1);
  };

  const handleSaveDraftAndCreateSchedule = () => {
    const res = saveDraftInternal();
    showToast('Draft order saved! Opening billing schedule...', 3500);
    navigate('/client-payments', {
      state: {
        openAddSchedule: true,
        corporate: res?.clientName || location.state?.clientName || formData.clientName || '',
        division: res?.divisionName || location.state?.divisionName || formData.divisionName || '',
        orderId: res?.targetOrderId || Date.now(),
        orderName: res?.targetOrderName || 'Draft Order'
      }
    });
  };

  const handleCreateOrPublishOrder = () => {
    if (isCreateDisabled) return;
    const saved = localStorage.getItem('division_orders');
    let orders = saved ? JSON.parse(saved) : [];

    let targetOrderId;
    if (isEditMode && effectiveOrderId) {
      targetOrderId = effectiveOrderId;
      const wasDraft = orders.find(o => String(o.id) === String(targetOrderId))?.status === 'Draft';
      orders = orders.map(o => String(o.id) === String(targetOrderId) ? { 
        ...o, 
        ...formData, 
        id: targetOrderId, 
        status: 'Active' 
      } : o);
      showToast(wasDraft ? 'Order Published & Activated!' : 'Order Updated!', 5000);
    } else {
      targetOrderId = Date.now();
      const newOrder = { 
        ...formData, 
        id: targetOrderId, 
        status: 'Active',
        divisionName: location.state?.divisionName || formData.divisionName || '',
        clientName: location.state?.clientName || formData.clientName || '',
        divisionId: location.state?.divisionId || formData.divisionId || searchParams.get('divisionId') || '',
        sessionCount: 0
      };
      orders.push(newOrder);

      // Link any expenses added during this session to the new order
      const sessionExpenses = expenses.filter(e => e.orderId === tempSessionId);
      sessionExpenses.forEach(exp => {
        updateExpense(exp.id, { orderId: targetOrderId });
      });

      showToast('Order Created!', 5000);
    }
    
    localStorage.setItem('division_orders', JSON.stringify(orders));
    
    // Process V2 documents connecting/saving
    if (formData.contractDetails?.v2Documents) {
      const targetOrderName = `${location.state?.divisionName || formData.divisionName || 'Unknown'} | ${formData.planStart} - ${formData.plan}`;
      
      const allDivDocs = JSON.parse(localStorage.getItem('division_documents') || '[]');
      const v2Ids = formData.contractDetails.v2Documents.map(d => d.id);
      
      formData.contractDetails.v2Documents.forEach(doc => {
        if (!allDivDocs.find(d => d.id === doc.id)) {
          allDivDocs.push(doc);
        }
      });
      
      const updatedDivDocs = allDivDocs.map(d => {
        if (v2Ids.includes(d.id)) {
          return { ...d, orderId: targetOrderId, orderName: targetOrderName };
        }
        if (String(d.orderId) === String(targetOrderId) && !v2Ids.includes(d.id)) {
          if (d.isDirectlyUploaded) {
            return null;
          }
          return { ...d, orderId: '', orderName: '' };
        }
        return d;
      }).filter(Boolean);
      
      localStorage.setItem('division_documents', JSON.stringify(updatedDivDocs));
    }

    // Sync mapped contracts to division_contracts table
    const targetOrderName = `${location.state?.divisionName || formData.divisionName || 'Unknown'} | ${formData.planStart || 'Active'} - ${formData.plan || 'Standard'}`;
    syncDivisionContractsMapping(targetOrderId, targetOrderName, formData.contractDetails?.contracts || []);

    navigate(-1);
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', background: '#f1f5f9', minHeight: '100vh' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button 
            type="button"
            onClick={() => navigate(-1)} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#64748b', marginRight: '1rem', display: 'flex', alignItems: 'center' }}
          >
            <i className='bx bx-arrow-back'></i>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>{isEditMode ? 'Edit Order' : 'Add Order'}</h1>
            {formData.status === 'Draft' && (
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: '600', 
                background: '#fef3c7', 
                color: '#b45309', 
                border: '1px solid #fde68a', 
                padding: '0.2rem 0.65rem', 
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <i className='bx bx-edit-alt' style={{ fontSize: '0.85rem' }}></i> Draft
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleSaveAsDraft}
            style={{
              padding: '0.55rem 1.25rem',
              background: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(245, 158, 11, 0.1)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#fde68a'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#fef3c7'}
          >
            <i className='bx bx-file-blank' style={{ fontSize: '1.1rem' }}></i>
            Save As Draft
          </button>

          <button
            type="button"
            onClick={handleSaveDraftAndCreateSchedule}
            title="Save draft order with billing details and jump directly to creating payment schedule"
            style={{
              padding: '0.55rem 1.25rem',
              background: '#059669',
              color: 'white',
              border: '1px solid #047857',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(5, 150, 105, 0.2)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#047857'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#059669'}
          >
            <i className='bx bx-calendar-plus' style={{ fontSize: '1.1rem' }}></i>
            Save Draft & Create Schedule
          </button>
        </div>
      </div>

      {/* Contract Details (CSM) */}
      <div style={{...cardStyle, borderLeft: '4px solid #ef4444'}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedSections.contractDetails ? '1.5rem' : '0', cursor: 'pointer' }} onClick={() => toggleSection('contractDetails')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a', fontSize: '1rem', fontWeight: '700' }}>
            <div style={{...iconBoxStyle, background: '#fef2f2', color: '#ef4444'}}><i className='bx bx-edit'></i></div>
            <div>
              <span style={{ display: 'block' }}>Contract Details</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginLeft: 'auto', marginRight: '1rem' }}>
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setIsPaymentSummaryOpen(true);
              }}
              style={{ display: 'flex', flexDirection: 'column', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.35rem 0.85rem', background: '#fff5f5', cursor: 'pointer', transition: 'background 0.2s', minWidth: '110px' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#fff5f5'}
            >
              <span style={{ fontSize: '0.6rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <i className='bx bx-error-circle' style={{ fontSize: '0.75rem' }}></i>Payment Due
              </span>
              <span style={{ fontSize: '0.95rem', color: '#ef4444', fontWeight: '800', marginTop: '0.1rem' }}>
                {paymentDueBadge !== null ? `$ ${paymentDueBadge.toFixed(2)}` : '$ —'}
              </span>
            </div>
            

          </div>

          <i className={`bx bx-chevron-${expandedSections.contractDetails ? 'up' : 'down'}`} style={{ fontSize: '1.5rem', color: '#94a3b8' }}></i>
        </div>
        
        {expandedSections.contractDetails && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', minHeight: '24px' }}>
              <label style={{...labelStyle, marginBottom: 0}}>Overall session limits</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#334155', cursor: 'pointer', fontWeight: '500' }}>
                <input 
                  type="checkbox" 
                  checked={formData.contractDetails.checkSessions} 
                  onChange={e => setFormData({...formData, contractDetails: {...formData.contractDetails, checkSessions: e.target.checked}})} 
                  style={{ accentColor: '#0ea5e9', width: '14px', height: '14px', cursor: 'pointer' }}
                />
                Check Sessions
                <Tooltip text="If checked, the total sessions used will be monitored and a notification will appear in the payment summary if the limit is exceeded." align="center" />
              </label>
            </div>
            <input 
              type="number" 
              placeholder="Enter session limit" 
              style={{...inputStyle, backgroundColor: 'white'}} 
              value={formData.contractDetails.sessionLimits} 
              onChange={e => setFormData({...formData, contractDetails: {...formData.contractDetails, sessionLimits: e.target.value}})} 
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.4rem', minHeight: '24px' }}>
              <label style={{...labelStyle, marginBottom: 0}}>No of Employees <span style={{color: '#ef4444'}}>*</span></label>
            </div>
            <input type="number" style={inputStyle} value={formData.employees} onChange={e => {
              let val = e.target.value;
              if (val.length > 1 && val.startsWith('0')) {
                val = val.replace(/^0+/, '');
              }
              setFormData({...formData, employees: val});
            }} placeholder="e.g. 100" />
          </div>

          {/* Division Contracts & Order Value */}
          <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <label style={{ ...labelStyle, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.95rem', fontWeight: '700' }}>
                  <i className='bx bx-file-blank' style={{ color: '#0284c7', fontSize: '1.2rem' }}></i>
                  Division Contracts & Commercial Value
                  <Tooltip text="Commercial contracts are created and maintained at the Division level. Select which contracts belong to this order. The total order value adds up automatically." align="left" />
                </label>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Select the division contracts applicable to this order from the dropdown below. Amount automatically calculates from selected contracts.
                </div>
              </div>
            </div>

            {/* Total Order Value Calculation Banner */}
            <div style={{
              padding: '1rem 1.25rem',
              borderRadius: '10px',
              border: selectedContractIds.length > 0 ? '1px solid #93c5fd' : '1px solid #e2e8f0',
              background: selectedContractIds.length > 0 
                ? 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)' 
                : '#f8fafc',
              marginBottom: '1rem',
              boxShadow: selectedContractIds.length > 0 ? '0 2px 4px rgba(37, 99, 235, 0.06)' : 'none'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '10px',
                    background: selectedContractIds.length > 0 ? '#dbeafe' : '#e2e8f0',
                    color: selectedContractIds.length > 0 ? '#1d4ed8' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    <i className='bx bx-calculator'></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Total Order Value (Sum of Selected Contracts)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.15rem' }}>
                      <span style={{ fontSize: '1.6rem', color: selectedContractIds.length > 0 ? '#0f172a' : '#64748b', fontWeight: '800' }}>
                        ${selectedContractIds.length > 0 ? (Number(formData.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>USD</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>Selected Contracts</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: selectedContractIds.length > 0 ? '#0284c7' : '#94a3b8' }}>
                      {selectedContractIds.length} of {divisionContracts.length} selected
                    </div>
                  </div>
                  {selectedContractIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSaveDraftAndCreateSchedule}
                      style={{ padding: '0.45rem 0.9rem', background: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <i className='bx bx-calendar-plus'></i> Schedule Billing
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Contracts Multi-Select Dropdown Container */}
            <div style={{ position: 'relative', marginBottom: '0.75rem' }} ref={contractsDropdownRef}>
              <label style={{ ...labelStyle, fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '600' }}>
                Select Contracts (Multi-Select)
              </label>

              {/* Dropdown Header Trigger */}
              <div
                onClick={() => setIsContractsDropdownOpen(!isContractsDropdownOpen)}
                style={{
                  ...inputStyle,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#ffffff',
                  minHeight: '44px',
                  padding: '0.5rem 0.85rem',
                  border: isContractsDropdownOpen ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                  boxShadow: isContractsDropdownOpen ? '0 0 0 3px rgba(2, 132, 199, 0.12)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                  {selectedContractIds.length === 0 ? (
                    <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                      -- Click to select contracts from this division --
                    </span>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <span style={{
                        background: '#e0f2fe',
                        color: '#0369a1',
                        padding: '0.15rem 0.55rem',
                        borderRadius: '20px',
                        fontSize: '0.74rem',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <i className='bx bx-check'></i>
                        {selectedContractIds.length} of {divisionContracts.length} selected
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' }}>
                        {divisionContracts
                          .filter(c => selectedContractIds.includes(c.id))
                          .map(c => c.companyName)
                          .join(', ')}
                      </span>
                    </div>
                  )}
                </div>
                <i className={`bx bx-chevron-${isContractsDropdownOpen ? 'up' : 'down'}`} style={{ color: '#64748b', fontSize: '1.25rem', marginLeft: '0.5rem' }}></i>
              </div>

              {/* Dropdown Menu Panel */}
              {isContractsDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  marginTop: '5px',
                  zIndex: 50,
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                  maxHeight: '380px',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  {/* Select All & Summary Action Bar */}
                  <div style={{
                    padding: '0.65rem 0.9rem',
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0, fontSize: '0.82rem', fontWeight: '700', color: '#0f172a' }}>
                      <input
                        type="checkbox"
                        checked={divisionContracts.length > 0 && selectedContractIds.length === divisionContracts.length}
                        onChange={() => {
                          if (selectedContractIds.length === divisionContracts.length) {
                            handleDeselectAllContracts();
                          } else {
                            handleSelectAllContracts();
                          }
                        }}
                        style={{ accentColor: '#0284c7', width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <span>Select All ({divisionContracts.length})</span>
                    </label>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                        {selectedContractIds.length} selected
                      </span>
                      {selectedContractIds.length > 0 && (
                        <button
                          type="button"
                          onClick={handleDeselectAllContracts}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Search input if more than 3 contracts */}
                  {divisionContracts.length > 3 && (
                    <div style={{ padding: '0.5rem 0.85rem', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
                      <div style={{ position: 'relative' }}>
                        <i className='bx bx-search' style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.95rem' }}></i>
                        <input
                          type="text"
                          placeholder="Search contract by company, tax ID, currency..."
                          value={contractSearch}
                          onChange={(e) => setContractSearch(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.35rem 0.5rem 0.35rem 1.8rem',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            outline: 'none',
                            fontSize: '0.8rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Contracts Dropdown Options List */}
                  <div style={{ overflowY: 'auto', maxHeight: '280px' }}>
                    {filteredDivisionContracts.length === 0 ? (
                      <div style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.82rem' }}>
                        {divisionContracts.length === 0
                          ? 'No contracts found for this Division. Please create contracts on the Division page.'
                          : 'No matching contracts found.'}
                      </div>
                    ) : (
                      filteredDivisionContracts.map((cnt) => {
                        const isSelected = selectedContractIds.includes(cnt.id);
                        const cntAmountUSD = Number(cnt.amountInUSD || cnt.contractValue || 0);

                        return (
                          <div
                            key={cnt.id}
                            onClick={() => handleToggleContract(cnt.id)}
                            style={{
                              padding: '0.65rem 0.9rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              background: isSelected ? '#f0f9ff' : '#ffffff',
                              borderBottom: '1px solid #f1f5f9',
                              gap: '0.75rem',
                              transition: 'background 0.12s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = isSelected ? '#e0f2fe' : '#f8fafc'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = isSelected ? '#f0f9ff' : '#ffffff'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                style={{ accentColor: '#0284c7', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                              />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                  <span style={{ fontWeight: '700', fontSize: '0.86rem', color: '#0f172a' }}>
                                    {cnt.companyName}
                                  </span>
                                  {cnt.taxDetails && (
                                    <span style={{ fontSize: '0.68rem', color: '#64748b', background: '#f1f5f9', padding: '0.05rem 0.35rem', borderRadius: '3px', border: '1px solid #e2e8f0' }}>
                                      Tax: {cnt.taxDetails}
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
                                  <span>Bill From: <strong>{cnt.billFrom || 'MCC'}</strong></span>
                                  <span>•</span>
                                  <span>Bank: <strong>{cnt.receivingBankName || 'AirWallex'}</strong></span>
                                  <span>•</span>
                                  <span>Net <strong>{cnt.paymentDueDays || 30}d</strong></span>
                                </div>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: isSelected ? '#0369a1' : '#0f172a' }}>
                                {Number(cnt.contractValue).toLocaleString()} {cnt.contractCurrency}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>
                                ≈ ${cntAmountUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Contracts Preview Chips */}
            {selectedContractIds.length > 0 && (
              <div style={{
                padding: '0.75rem 0.9rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <i className='bx bx-check-double'></i> Active Contracts:
                </span>
                {divisionContracts.filter(c => selectedContractIds.includes(c.id)).map(c => {
                  const cntAmountUSD = Number(c.amountInUSD || c.contractValue || 0);
                  return (
                    <span 
                      key={c.id} 
                      style={{
                        background: '#ffffff',
                        color: '#1e40af',
                        border: '1px solid #bfdbfe',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                      }}
                    >
                      <span>{c.companyName}</span>
                      <strong style={{ color: '#0284c7' }}>
                        ({Number(c.contractValue).toLocaleString()} {c.contractCurrency} ≈ ${cntAmountUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                      </strong>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleContract(c.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '0 2px',
                          fontSize: '0.95rem',
                          lineHeight: 1,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                        title="Remove from order"
                      >
                        <i className='bx bx-x'></i>
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{...labelStyle, marginBottom: 0}}>Documents</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => setIsDocModalOpen(true)}
                  style={{ padding: '0.4rem 0.8rem', background: 'white', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '500' }}
                >
                  <i className='bx bx-plus' style={{ marginRight: '0.25rem' }}></i>Upload Document V1
                </button>
                <button 
                  onClick={() => setIsDocModalV2Open(true)}
                  style={{ padding: '0.4rem 0.8rem', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <i className='bx bx-link'></i> Upload Document V2
                </button>
              </div>
            </div>
            
            {(!formData.contractDetails.documents || formData.contractDetails.documents.length === 0) && (!formData.contractDetails.v2Documents || formData.contractDetails.v2Documents.length === 0) && (
              <div style={{ width: '100%', padding: '1.5rem', border: '1px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', background: '#f8fafc', color: '#94a3b8', fontSize: '0.85rem' }}>
                No documents uploaded yet.
              </div>
            )}
            
            {/* Legacy V1 Documents */}
            {(formData.contractDetails.documents || []).map((doc) => (
              <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '0.5rem', background: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <i className='bx bxs-file-pdf' style={{ color: '#ef4444', fontSize: '1.25rem' }}></i>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <span style={{ color: '#0ea5e9', fontWeight: '600' }}>{doc.type === 'Others' ? doc.otherType : doc.type}</span>
                    <span style={{ color: '#cbd5e1' }}>|</span>
                    <span style={{ fontWeight: '500', color: '#0f172a' }}>{doc.name}</span>
                    <span style={{ color: '#cbd5e1' }}>|</span>
                    <span style={{ color: '#64748b' }}>{doc.date}</span>
                  </div>
                </div>
                <button onClick={() => removeDocument(doc.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <i className='bx bx-trash' style={{ fontSize: '1.1rem' }}></i>
                </button>
              </div>
            ))}
            
            {/* V2 Documents */}
            {(formData.contractDetails.v2Documents || []).map((doc) => (
              <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', border: '1px solid #bae6fd', borderRadius: '8px', marginBottom: '0.5rem', background: '#f0f9ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <i className='bx bxs-file-pdf' style={{ color: '#0ea5e9', fontSize: '1.25rem' }}></i>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <span style={{ color: '#0284c7', fontWeight: '600' }}>{doc.type === 'Others' ? doc.otherType : doc.type} (V2)</span>
                    <span style={{ color: '#cbd5e1' }}>|</span>
                    <span style={{ fontWeight: '500', color: '#0f172a' }}>{doc.name}</span>
                  </div>
                </div>
                <button onClick={() => removeV2Document(doc)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <i className='bx bx-trash' style={{ fontSize: '1.1rem' }}></i>
                </button>
              </div>
            ))}
          </div>



          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Remarks</label>
            <textarea 
              rows="2" 
              placeholder="Add any internal remarks..."
              style={{...inputStyle, resize: 'vertical'}} 
              value={formData.contractDetails.remarks} 
              onChange={e => setFormData({...formData, contractDetails: {...formData.contractDetails, remarks: e.target.value}})}
            />
          </div>
        </div>
        )}
      </div>

      {/* Plan & Schedule */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedSections.planSchedule ? '1.5rem' : '0', cursor: 'pointer' }} onClick={() => toggleSection('planSchedule')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a', fontSize: '1rem', fontWeight: '700' }}>
            <div style={iconBoxStyle}><i className='bx bx-calendar-event'></i></div>
            <span>Plan & Schedule</span>
          </div>
          <i className={`bx bx-chevron-${expandedSections.planSchedule ? 'up' : 'down'}`} style={{ fontSize: '1.5rem', color: '#94a3b8' }}></i>
        </div>
        
        {expandedSections.planSchedule && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Plan</label>
            <select style={inputStyle} value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})}>
              <option>Select Plan</option>
              <option>Basic EAP</option>
              <option>Premium EAP</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Program Code</label>
            <input type="text" style={inputStyle} value={formData.programCode} onChange={e => setFormData({...formData, programCode: e.target.value})} />
          </div>
          
          <div>
            <label style={labelStyle}>Plan Start</label>
            <input type="date" max="9999-12-31" style={inputStyle} value={formData.planStart} onChange={e => setFormData({...formData, planStart: e.target.value})} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <label style={{ margin: 0, fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>Plan End</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button type="button" onClick={() => addMonthsToPlanStart(3)} style={{ fontSize: '0.7rem', color: '#0ea5e9', background: '#e0f2fe', border: 'none', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer' }}>+3M</button>
                <button type="button" onClick={() => addMonthsToPlanStart(6)} style={{ fontSize: '0.7rem', color: '#0ea5e9', background: '#e0f2fe', border: 'none', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer' }}>+6M</button>
                <button type="button" onClick={() => addMonthsToPlanStart(12)} style={{ fontSize: '0.7rem', color: '#0ea5e9', background: '#e0f2fe', border: 'none', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer' }}>+12M</button>
              </div>
            </div>
            <input type="date" max="9999-12-31" style={inputStyle} value={formData.planEnd} onChange={e => setFormData({...formData, planEnd: e.target.value})} />
          </div>
          
          <div>
            <label style={labelStyle}>Country Code</label>
            <select style={inputStyle} value={formData.countryCode} onChange={e => setFormData({...formData, countryCode: e.target.value})}>
              <option>India</option>
              <option>USA</option>
              <option>UK</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Provider Cost Level</label>
            <select style={inputStyle} value={formData.providerCostLevel} onChange={e => setFormData({...formData, providerCostLevel: e.target.value})}>
              <option>Standard</option>
              <option>Premium</option>
            </select>
          </div>
        </div>
        )}
      </div>

      {/* Details */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedSections.details ? '1.5rem' : '0', cursor: 'pointer' }} onClick={() => toggleSection('details')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a', fontSize: '1rem', fontWeight: '700' }}>
            <div style={iconBoxStyle}><i className='bx bx-file-blank'></i></div>
            <span>Details</span>
          </div>
          <i className={`bx bx-chevron-${expandedSections.details ? 'up' : 'down'}`} style={{ fontSize: '1.5rem', color: '#94a3b8' }}></i>
        </div>
        
        {expandedSections.details && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea 
              rows="3" 
              style={{...inputStyle, resize: 'vertical'}} 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div>
            <label style={labelStyle}>Domains</label>
            <input 
              type="text" 
              placeholder="e.g. acme.com, acme.co.in" 
              style={inputStyle} 
              value={formData.domains} 
              onChange={e => setFormData({...formData, domains: e.target.value})}
            />
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>Comma-separated list of email domains allowed to sign up.</p>
          </div>
          <div>
            <label style={labelStyle}>Remarks</label>
            <textarea 
              rows="3" 
              style={{...inputStyle, resize: 'vertical'}} 
              value={formData.remarks} 
              onChange={e => setFormData({...formData, remarks: e.target.value})}
            />
          </div>
        </div>
        )}
      </div>

      {/* Optional Add-ons */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedSections.addOns ? '1.5rem' : '0', cursor: 'pointer' }} onClick={() => toggleSection('addOns')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a', fontSize: '1rem', fontWeight: '700' }}>
            <div style={iconBoxStyle}><i className='bx bx-extension'></i></div>
            <span>Optional Add-ons</span>
          </div>
          <i className={`bx bx-chevron-${expandedSections.addOns ? 'up' : 'down'}`} style={{ fontSize: '1.5rem', color: '#94a3b8' }}></i>
        </div>
        
        {expandedSections.addOns && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '32px', height: '32px', background: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', color: '#64748b' }}>
                <i className='bx bx-purchase-tag-alt'></i>
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', color: '#334155', fontSize: '0.9rem' }}>Coupons</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>Restrict checkout to specific product coupons instead of allowing all.</p>
              </div>
            </div>
            <ToggleSwitch checked={formData.addOns.coupons} onChange={() => handleAddOnToggle('coupons')} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '32px', height: '32px', background: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', color: '#64748b' }}>
                <i className='bx bx-wallet'></i>
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', color: '#334155', fontSize: '0.9rem' }}>Corporate Wallet</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>Allow employees to use a pre-funded corporate wallet balance for sessions.</p>
              </div>
            </div>
            <ToggleSwitch checked={formData.addOns.corporateWallet} onChange={() => handleAddOnToggle('corporateWallet')} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '32px', height: '32px', background: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', color: '#64748b' }}>
                <i className='bx bx-message-rounded-dots'></i>
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', color: '#334155', fontSize: '0.9rem' }}>Limited Session Model</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>Optionally configure a product and form link for services that should allow session requests.</p>
              </div>
            </div>
            <ToggleSwitch checked={formData.addOns.limitedSession} onChange={() => handleAddOnToggle('limitedSession')} />
          </div>

        </div>
        )}
      </div>

      {/* App Configuration */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedSections.appConfig ? '1.5rem' : '0', cursor: 'pointer' }} onClick={() => toggleSection('appConfig')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a', fontSize: '1rem', fontWeight: '700' }}>
            <div style={iconBoxStyle}><i className='bx bx-slider-alt'></i></div>
            <span>App Configuration</span>
          </div>
          <i className={`bx bx-chevron-${expandedSections.appConfig ? 'up' : 'down'}`} style={{ fontSize: '1.5rem', color: '#94a3b8' }}></i>
        </div>
        
        {expandedSections.appConfig && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: formData.appConfig.pathways ? '#f0fdf4' : '#f8fafc', border: formData.appConfig.pathways ? '1px solid #bbf7d0' : '1px solid #e2e8f0', borderRadius: '8px', transition: 'all 0.3s' }}>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', color: formData.appConfig.pathways ? '#16a34a' : '#334155', fontSize: '0.9rem' }}>Pathways enabled</h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>Allow employees to access guided pathway content.</p>
            </div>
            <ToggleSwitch checked={formData.appConfig.pathways} onChange={() => handleConfigToggle('pathways')} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{...labelStyle, textTransform: 'uppercase'}}>TRACKERS</label>
              <select style={inputStyle} value={formData.appConfig.trackers} onChange={e => setFormData({...formData, appConfig: {...formData.appConfig, trackers: e.target.value}})}>
                <option>All</option>
                <option>None</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Customized Tiles (only these will be visible to the user)</label>
              <select style={inputStyle} value={formData.appConfig.tiles} onChange={e => setFormData({...formData, appConfig: {...formData.appConfig, tiles: e.target.value}})}>
                <option>Select tiles</option>
                <option>Tile 1</option>
                <option>Tile 2</option>
              </select>
            </div>
            <div>
              <label style={{...labelStyle, textTransform: 'uppercase'}}>MONETIZATION</label>
              <select style={inputStyle} value={formData.appConfig.monetization} onChange={e => setFormData({...formData, appConfig: {...formData.appConfig, monetization: e.target.value}})}>
                <option>Select monetization features</option>
                <option>Feature 1</option>
                <option>Feature 2</option>
              </select>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Access & Security */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedSections.accessSecurity ? '1.5rem' : '0', cursor: 'pointer' }} onClick={() => toggleSection('accessSecurity')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a', fontSize: '1rem', fontWeight: '700' }}>
            <div style={iconBoxStyle}><i className='bx bx-shield-quarter'></i></div>
            <span>Access & Security</span>
          </div>
          <i className={`bx bx-chevron-${expandedSections.accessSecurity ? 'up' : 'down'}`} style={{ fontSize: '1.5rem', color: '#94a3b8' }}></i>
        </div>
        
        {expandedSections.accessSecurity && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', color: '#334155', fontSize: '0.9rem' }}>Employee list restriction</h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>Only employees present in the uploaded employee list can sign up.</p>
            </div>
            <ToggleSwitch checked={formData.access.employeeRestriction} onChange={() => handleAccessToggle('employeeRestriction')} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', color: '#334155', fontSize: '0.9rem' }}>Auto invite</h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>Show a join offer on app open to users with a pending invite or matching email domain.</p>
            </div>
            <ToggleSwitch checked={formData.access.autoInvite} onChange={() => handleAccessToggle('autoInvite')} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', color: '#334155', fontSize: '0.9rem' }}>Enforce OTP verification</h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>Require employees to verify via OTP before accessing the platform.</p>
            </div>
            <ToggleSwitch checked={formData.access.otp} onChange={() => handleAccessToggle('otp')} />
          </div>

        </div>
        )}
      </div>

      {/* Expense Details Section */}
      <div style={cardStyle}>
        <div 
          onClick={() => toggleSection('expenseDetails')}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedSections.expenseDetails ? '1.5rem' : '0', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a', fontWeight: '700', fontSize: '1rem' }}>
            <div style={iconBoxStyle}><i className='bx bx-credit-card-front'></i></div>
            <span>Expense Details</span>
          </div>
          <i className={`bx bx-chevron-${expandedSections.expenseDetails ? 'up' : 'down'}`} style={{ fontSize: '1.5rem', color: '#94a3b8' }}></i>
        </div>
        
        {expandedSections.expenseDetails && (
        <div style={{ marginTop: '0.5rem' }}>
          {orderExpenses.length === 0 ? (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '3rem 1rem', textAlign: 'center', color: '#0f172a', fontWeight: '500', fontSize: '0.9rem' }}>
              <p style={{ margin: 0 }}>No expenses available.</p>
            </div>
          ) : (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expense Type</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount (USD)</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orderExpenses.map((exp, index) => (
                    <tr key={exp.id} style={{ borderBottom: index === orderExpenses.length - 1 ? 'none' : '1px solid #e2e8f0', background: 'white' }}>
                      <td style={{ padding: '0.75rem 1rem', color: '#334155', fontWeight: '500' }}>{exp.expenseType}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={exp.details}>{exp.details || '-'}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#0f172a', fontWeight: '600' }}>{formatCurrency(exp.amount)}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{getStatusBadge(exp.status)}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', display: 'flex', gap: '0.25rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button 
                          onClick={() => setViewingExpense(exp)}
                          style={{ padding: '0.35rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: '1.2rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          title="View Details"
                        >
                          <i className='bx bx-show'></i>
                        </button>
                        {exp.status === 'Approved' && (
                          <>
                            <button 
                              onClick={() => handleSettleExpense(exp.id)}
                              style={{ padding: '0.35rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#10b981', fontSize: '1.2rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Settle Expense"
                            >
                              <i className='bx bx-check-double'></i>
                            </button>
                            <button 
                              onClick={() => setRevokingExpenseId(exp.id)}
                              style={{ padding: '0.35rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#f59e0b', fontSize: '1.2rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: '0.25rem' }}
                              title="Revoke Expense"
                            >
                              <i className='bx bx-undo'></i>
                            </button>
                          </>
                        )}
                        {(exp.status === 'Rejected' || exp.status === 'Revoked') && (
                          <button 
                            onClick={() => {
                              setEditExpenseData(exp);
                              setIsAddExpenseModalOpen(true);
                            }}
                            style={{ padding: '0.35rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: '1.2rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: '0.25rem' }}
                            title="Edit & Resubmit"
                          >
                            <i className='bx bx-edit'></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button 
              onClick={() => {
                setEditExpenseData(null);
                setIsAddExpenseModalOpen(true);
              }}
              style={{ padding: '0.5rem 1.25rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 1px 2px rgba(99, 102, 241, 0.2)' }}
            >
              Add Expense
            </button>
          </div>
        </div>
        )}
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '1.5rem', marginBottom: '2.5rem', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
          <button 
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: '0.6rem 1.25rem',
              background: '#fff',
              border: '1px solid #cbd5e1',
              color: '#64748b',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveAsDraft}
            style={{
              padding: '0.6rem 1.35rem',
              background: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(245, 158, 11, 0.1)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#fde68a'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#fef3c7'}
          >
            <i className='bx bx-file-blank' style={{ fontSize: '1.1rem' }}></i>
            Save As Draft
          </button>

          <button
            type="button"
            onClick={handleSaveDraftAndCreateSchedule}
            title="Save draft order with billing details and immediately generate payment schedule"
            style={{
              padding: '0.6rem 1.35rem',
              background: '#059669',
              color: 'white',
              border: '1px solid #047857',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(5, 150, 105, 0.2)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#047857'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#059669'}
          >
            <i className='bx bx-calendar-plus' style={{ fontSize: '1.1rem' }}></i>
            Save Draft & Create Schedule
          </button>

          <button 
            type="button"
            title={isCreateDisabled ? `Pending: ${pendingFields.join(', ')}` : ''}
            onClick={handleCreateOrPublishOrder}
            className="btn-primary" 
            style={{ 
              padding: '0.6rem 1.5rem', 
              background: isCreateDisabled ? '#94a3b8' : '#3b82f6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              fontSize: '0.95rem', 
              fontWeight: '600', 
              cursor: isCreateDisabled ? 'not-allowed' : 'pointer',
              opacity: isCreateDisabled ? 0.7 : 1,
              transition: 'all 0.15s ease'
            }}
          >
            {isEditMode ? (formData.status === 'Draft' ? 'Publish Order' : 'Save Changes') : 'Create Order'}
          </button>
        </div>
      </div>

      {/* Modals */}
      <DocumentUploadModal 
        isOpen={isDocModalOpen} 
        onClose={() => setIsDocModalOpen(false)} 
        onSave={addDocument} 
      />
      
      <DocumentConnectModalV2 
        isOpen={isDocModalV2Open}
        onClose={() => setIsDocModalV2Open(false)}
        onConnect={addV2Documents}
        divisionId={formData.divisionId || location.state?.divisionId || ''}
        orderId={isEditMode ? effectiveOrderId : ''}
        existingV2Docs={formData.contractDetails?.v2Documents || []}
      />

      <PaymentSummaryModal
        isOpen={isPaymentSummaryOpen}
        onClose={() => setIsPaymentSummaryOpen(false)}
        contractValue={formData.billingDetails?.amountInUSD || formData.amount}
        orderId={effectiveOrderId}
        divisionId={formData.divisionId || location.state?.divisionId}
        onViewPaymentSchedule={() => {
          if (!effectiveOrderId) {
            showToast('Please complete the order completion process first.', 5000);
            return;
          }
          setIsPaymentSummaryOpen(false);
          setIsPaymentScheduleOpen(true);
        }}
        onViewBillingSchedule={() => {
          if (!effectiveOrderId) {
            showToast('Please complete the order completion process first.', 5000);
            return;
          }
          setIsPaymentSummaryOpen(false);
          navigate('/client-payments', { state: { filterOrderId: effectiveOrderId } });
        }}
      />
      <PaymentScheduleModal
        isOpen={isPaymentScheduleOpen}
        onClose={() => setIsPaymentScheduleOpen(false)}
        orderId={effectiveOrderId}
      />
      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        orderId={effectiveOrderId || tempSessionId}
        orderName={`${location.state?.divisionName || formData.divisionName || 'Unknown'} | ${formData.planStart} - ${formData.plan}`}
        clientName={formData.clientName || location.state?.clientName || formData.billingDetails?.billFrom || formData.appConfig?.domain || 'Current Order'}
        editExpenseData={editExpenseData}
      />
      <ViewExpensesModal
        isOpen={!!viewingExpense}
        onClose={() => setViewingExpense(null)}
        viewingExpense={viewingExpense}
      />
      
      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
      {/* Revoke Reason Modal */}
      {revokingExpenseId !== null && (
        <div className="modal-overlay" onClick={() => { setRevokingExpenseId(null); setRevokeReason(''); }}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Provide Revocation Reason</h2>
              <button className="close-btn" onClick={() => { setRevokingExpenseId(null); setRevokeReason(''); }}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              updateExpenseStatus(revokingExpenseId, 'Revoked', revokeReason);
              showToast("Expense request revoked.", 3000);
              setRevokingExpenseId(null);
              setRevokeReason('');
            }}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Reason for revocation <span className="text-red">*</span></label>
                  <textarea 
                    className="form-control" 
                    rows="4" 
                    required 
                    placeholder="Please explain why this expense is being revoked..."
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-outline" onClick={() => { setRevokingExpenseId(null); setRevokeReason(''); }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: '#f59e0b', borderColor: '#f59e0b' }}>Confirm Revoke</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default AddOrder;
