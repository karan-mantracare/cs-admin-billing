import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal, GlobalContext } from '../context/GlobalContext';

const Tooltip = ({ text }) => {
  const [show, setShow] = useState(false);
  return (
    <span 
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: '5px', verticalAlign: 'middle' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <i 
        className="bx bx-info-circle" 
        style={{ color: '#0284c7', cursor: 'pointer', fontSize: '0.9rem', transition: 'color 0.15s' }}
        title={text}
      />
      {show && (
        <span style={{
          position: 'absolute',
          bottom: '135%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '0.4rem 0.65rem',
          borderRadius: '6px',
          fontSize: '0.73rem',
          fontWeight: '500',
          whiteSpace: 'normal',
          width: 'max-content',
          maxWidth: '220px',
          zIndex: 99999,
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
          pointerEvents: 'none',
          lineHeight: '1.35',
          textAlign: 'center'
        }}>
          {text}
          <span style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '5px',
            borderStyle: 'solid',
            borderColor: '#0f172a transparent transparent transparent'
          }} />
        </span>
      )}
    </span>
  );
};

function AddScheduleModal({ isOpen, onClose, onSave, mode = 'schedule', initialSelection = null }) {
  const navigate = useNavigate();
  const { globalData } = useContext(GlobalContext);

  const [formData, setFormData] = useState({
    corporate: '',
    division: '',
    orderName: '',
    orderId: '',
    paymentTerms: '1',
    amount: ''
  });
  const [paymentTermError, setPaymentTermError] = useState('');
  const [billingFrequency, setBillingFrequency] = useState('Monthly');
  const [contractFrequencies, setContractFrequencies] = useState({});
  const [step, setStep] = useState(1);
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);
  const [stepError, setStepError] = useState('');
  
  const [corporates, setCorporates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [unlinkedContract, setUnlinkedContract] = useState(null);
  
  const [isCorpDropdownOpen, setIsCorpDropdownOpen] = useState(false);
  const [corpSearch, setCorpSearch] = useState('');
  
  const [isDivDropdownOpen, setIsDivDropdownOpen] = useState(false);
  const [divSearch, setDivSearch] = useState('');

  const { clients: globalClients } = useGlobal();

  // Load clients and orders from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsOrderSummaryOpen(false);
      setStepError('');
      // 1. Load Corporates from GlobalContext
      const safeClients = Array.isArray(globalClients) ? globalClients : [];
      let uniqueCorps = [...new Set(safeClients.map(c => c?.name || c?.clientName).filter(Boolean))].filter(c => c !== 'N/A');

      // 2. Load Orders from localStorage (division_orders)
      let loadedOrders = [];
      try {
        const divisionOrdersStr = localStorage.getItem('division_orders');
        if (divisionOrdersStr) {
          loadedOrders = JSON.parse(divisionOrdersStr);
          setOrders(loadedOrders);
          // Also include any corporates from orders
          loadedOrders.forEach(o => {
            const cName = o.corporate || o.clientName;
            if (cName && cName !== 'N/A' && !uniqueCorps.includes(cName)) {
              uniqueCorps.push(cName);
            }
          });
        } else {
          loadedOrders = [
            { id: 101, corporate: 'First Client', division: 'Tech', planStart: '2024-01-01', planName: 'Enterprise EAP' },
            { id: 102, corporate: 'Second Client', division: 'HR', planStart: '2024-06-01', planName: 'Wellness Workshop' }
          ];
          setOrders(loadedOrders);
        }
      } catch (e) {
        console.error("Failed to load orders", e);
      }
      setCorporates(uniqueCorps);

      // 3. Pre-fill if initialSelection is passed
      if (initialSelection) {
        let selCorp = initialSelection.corporate || initialSelection.clientName || '';
        let selDiv = initialSelection.division || initialSelection.divisionName || '';
        let selOrderName = initialSelection.orderName || '';
        let selOrderId = initialSelection.orderId ? String(initialSelection.orderId) : '';

        if (initialSelection.contractSchedule) {
          const cnt = initialSelection.contractSchedule;
          setUnlinkedContract(cnt);
          if (!selCorp) selCorp = cnt.corporate || cnt.clientName || '';
          if (!selDiv) selDiv = cnt.division || cnt.divisionName || '';
          if (!selOrderId || selOrderId === 'Null') {
            selOrderId = cnt.orderId && cnt.orderId !== 'Null' ? String(cnt.orderId) : 'Null';
          }
          if (!selOrderName) {
            selOrderName = cnt.orderName || (cnt.companyName ? `[Unlinked Contract] ${cnt.companyName}` : 'Unlinked Contract');
          }
        } else {
          setUnlinkedContract(null);
        }

        // Match order by ID first
        let matchedOrder = null;
        if (selOrderId && selOrderId !== 'Null') {
          matchedOrder = loadedOrders.find(o => String(o.id) === selOrderId);
        }
        if (!matchedOrder && selOrderName && selOrderId !== 'Null') {
          matchedOrder = loadedOrders.find(o => {
            const ps = o.planStart || 'Unknown Date';
            const pn = o.plan || o.planName || o.product || `Order #${o.id}`;
            const nameKey = `${ps} & ${pn}`;
            return nameKey === selOrderName || o.orderName === selOrderName || String(o.id) === selOrderName;
          });
        }

        if (matchedOrder) {
          selOrderId = String(matchedOrder.id);
          const ps = matchedOrder.planStart || 'Unknown Date';
          const pn = matchedOrder.plan || matchedOrder.planName || matchedOrder.product || `Order #${matchedOrder.id}`;
          selOrderName = `${ps} & ${pn}`;
          if (!selCorp || selCorp === 'N/A') {
            selCorp = matchedOrder.corporate || matchedOrder.clientName || '';
          }
          if (!selDiv) {
            selDiv = matchedOrder.division || matchedOrder.divisionName || '';
          }
        }

        // If selCorp is 'N/A' or empty, resolve from client list or orders using division
        if (!selCorp || selCorp === 'N/A') {
          if (selDiv) {
            const matchedClient = safeClients.find(c => 
              (c.divisions && c.divisions.some(d => d.divisionName === selDiv || String(d.id) === String(selDiv))) ||
              c.divisionName === selDiv || c.name === selDiv
            );
            if (matchedClient) {
              selCorp = matchedClient.name || matchedClient.clientName || '';
            }
          }
          if (!selCorp || selCorp === 'N/A') {
            const matchedOrderFromDiv = loadedOrders.find(o => (o.division || o.divisionName) === selDiv && o.corporate && o.corporate !== 'N/A');
            if (matchedOrderFromDiv) {
              selCorp = matchedOrderFromDiv.corporate || matchedOrderFromDiv.clientName || '';
            }
          }
        }

        setFormData(prev => ({
          ...prev,
          corporate: (selCorp && selCorp !== 'N/A' ? selCorp : prev.corporate),
          division: selDiv || prev.division,
          orderName: selOrderName || prev.orderName,
          orderId: selOrderId || prev.orderId,
          paymentTerms: initialSelection.paymentTerms || prev.paymentTerms || '1',
          amount: initialSelection.amount || (initialSelection.contractSchedule?.contractValue || initialSelection.contractSchedule?.amount) || matchedOrder?.billingDetails?.contractValue || matchedOrder?.amount || prev.amount || ''
        }));
      } else {
        setUnlinkedContract(null);
      }
    }
  }, [isOpen, initialSelection, globalClients]);

  useEffect(() => {
    // Update divisions when corporate changes
    if (formData.corporate) {
      const safeClients = Array.isArray(globalClients) ? globalClients : [];
      const matchedClient = safeClients.find(c => (c.name === formData.corporate || c.clientName === formData.corporate));
      const divs = [];
      if (matchedClient) {
        if (matchedClient.divisions && Array.isArray(matchedClient.divisions)) {
          matchedClient.divisions.forEach(d => {
            if (d.divisionName) divs.push(d.divisionName);
          });
        }
        if (matchedClient.divisionName) {
          divs.push(matchedClient.divisionName);
        }
      }
      // Also add divisions from loaded orders under this corporate
      const safeOrders = Array.isArray(orders) ? orders : [];
      safeOrders.forEach(o => {
        const oCorp = o.corporate || o.clientName;
        const oDiv = o.division || o.divisionName;
        if (oCorp === formData.corporate && oDiv) {
          divs.push(oDiv);
        }
      });
      const uniqueDivs = [...new Set(divs.filter(Boolean))];
      setDivisions(uniqueDivs.length > 0 ? uniqueDivs : ['Default Division']);
    } else {
      setDivisions([]);
    }
  }, [formData.corporate, globalClients, orders]);

  const [isPreview, setIsPreview] = useState(false);
  const [previewInvoices, setPreviewInvoices] = useState([]);
  const [showRemarksTooltip, setShowRemarksTooltip] = useState(false);
  const [hoveredSplitRow, setHoveredSplitRow] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // Dynamic % distribution & live schedule states
  const [pinnedPercentages, setPinnedPercentages] = useState({});
  const [tempPercentageInputs, setTempPercentageInputs] = useState({});
  const [tempAmountInputs, setTempAmountInputs] = useState({});
  const [pinnedPreviewRows, setPinnedPreviewRows] = useState({});
  const [autoCascadeDates, setAutoCascadeDates] = useState(true);
  const [customDates, setCustomDates] = useState({});
  const [customRemarks, setCustomRemarks] = useState({});

  // Multiple contract scheduling scope: 'all_combined', 'all_separate', or specific contract.id
  const [contractScope, setContractScope] = useState('all_separate');
  const [separateTerms, setSeparateTerms] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setIsPreview(false);
      setPreviewInvoices([]);
      setHoveredSplitRow(null);
      setPinnedPercentages({});
      setTempPercentageInputs({});
      setTempAmountInputs({});
      setPinnedPreviewRows({});
      setAutoCascadeDates(true);
      setCustomDates({});
      setCustomRemarks({});
      setContractScope('all_separate');
      setSeparateTerms({});
    }
  }, [isOpen]);

  useEffect(() => {
    // When terms or order change, reset any pinned percentages
    setPinnedPercentages({});
    setTempPercentageInputs({});
    setTempAmountInputs({});
    setPinnedPreviewRows({});
    setCustomDates({});
  }, [formData.paymentTerms, formData.orderName, formData.orderId]);

  const filteredCorps = Array.isArray(corporates) ? corporates.filter(c => c && c.toLowerCase().includes(corpSearch.toLowerCase())) : [];
  const filteredDivs = Array.isArray(divisions) ? divisions.filter(d => d && d.toLowerCase().includes(divSearch.toLowerCase())) : [];
  
  const safeOrders = Array.isArray(orders) ? orders : [];
  const filteredOrders = safeOrders.filter(o => {
    const oCorp = o.corporate || o.clientName;
    const oDiv = o.division || o.divisionName;
    const matchDiv = !formData.division || !oDiv || oDiv === formData.division;
    const matchCorp = !formData.corporate || !oCorp || oCorp === formData.corporate || (matchDiv && (!oCorp || oCorp === 'N/A'));
    return matchCorp && matchDiv;
  });

  // Calculate currently selected order details for validation
  const selectedOrder = safeOrders.find(o => {
    if (formData.orderId && formData.orderId !== 'Null' && String(o.id) === String(formData.orderId)) return true;
    if (formData.orderName && formData.orderId !== 'Null') {
      const ps = o.planStart || 'Unknown Date';
      const pn = o.plan || o.planName || o.product || `Order #${o.id}`;
      const nameKey = `${ps} & ${pn}`;
      return nameKey === formData.orderName || String(o.id) === formData.orderName || o.orderName === formData.orderName;
    }
    return false;
  }) || (unlinkedContract ? {
    id: 'Null',
    corporate: formData.corporate || unlinkedContract.corporate || unlinkedContract.clientName || '',
    division: formData.division || unlinkedContract.division || unlinkedContract.divisionName || '',
    orderName: unlinkedContract.orderName || (unlinkedContract.companyName ? `[Unlinked Contract] ${unlinkedContract.companyName}` : 'Unlinked Contract'),
    planStart: unlinkedContract.startDate || unlinkedContract.contractStart || new Date().toISOString().split('T')[0],
    planEnd: unlinkedContract.endDate || unlinkedContract.contractEnd || '',
    amount: Number(unlinkedContract.contractValue) || Number(unlinkedContract.amount) || 0,
    billingDetails: {
      contractValue: Number(unlinkedContract.contractValue) || Number(unlinkedContract.amount) || 0,
      amountInUSD: Number(unlinkedContract.amountInUSD) || Number(unlinkedContract.contractValue) || Number(unlinkedContract.amount) || 0,
      clientCurrency: unlinkedContract.contractCurrency || unlinkedContract.currency || 'USD',
      billingEntity: unlinkedContract.companyName || 'Contract Entity',
      taxDetails: unlinkedContract.taxDetails || (unlinkedContract.companyEntities?.[0]?.taxDetails) || '',
      billFrom: unlinkedContract.billFrom || 'MCC',
      paymentDue: Number(unlinkedContract.paymentDueDays) || 30,
      billingSplits: [{
        id: String(unlinkedContract.id || 1),
        companyName: unlinkedContract.companyName || 'Contract Entity',
        taxDetails: unlinkedContract.taxDetails || (unlinkedContract.companyEntities?.[0]?.taxDetails) || '',
        contractValue: Number(unlinkedContract.contractValue) || Number(unlinkedContract.amount) || 0,
        contractCurrency: unlinkedContract.contractCurrency || unlinkedContract.currency || 'USD',
        amountInUSD: Number(unlinkedContract.amountInUSD) || Number(unlinkedContract.contractValue) || Number(unlinkedContract.amount) || 0,
        percentage: 100,
        billFrom: unlinkedContract.billFrom || 'MCC',
        receivingBankName: unlinkedContract.receivingBankName || '',
        bankDetailsLink: unlinkedContract.bankDetailsLink || '',
        selected: true
      }]
    },
    contracts: [{
      id: String(unlinkedContract.id || 1),
      companyName: unlinkedContract.companyName || 'Contract Entity',
      taxDetails: unlinkedContract.taxDetails || (unlinkedContract.companyEntities?.[0]?.taxDetails) || '',
      contractValue: Number(unlinkedContract.contractValue) || Number(unlinkedContract.amount) || 0,
      contractCurrency: unlinkedContract.contractCurrency || unlinkedContract.currency || 'USD',
      amountInUSD: Number(unlinkedContract.amountInUSD) || Number(unlinkedContract.contractValue) || Number(unlinkedContract.amount) || 0,
      percentage: 100,
      billFrom: unlinkedContract.billFrom || 'MCC',
      receivingBankName: unlinkedContract.receivingBankName || '',
      bankDetailsLink: unlinkedContract.bankDetailsLink || '',
      selected: true
    }]
  } : null);

  const availableContracts = React.useMemo(() => {
    if (!selectedOrder) return [];
    const splits = (selectedOrder.billingDetails?.billingSplits || []).filter(s => s && s.selected !== false);
    if (splits.length > 0) return splits;
    const directContracts = selectedOrder.contractDetails?.contracts || selectedOrder.contracts || [];
    if (directContracts.length > 0) {
      return directContracts.map((c, i) => ({
        id: c.id || String(i + 1),
        companyName: c.companyName || c.clientName || `Contract #${i + 1}`,
        taxDetails: c.taxDetails || c.taxId || '',
        contractValue: c.contractValue || c.amount || 0,
        contractCurrency: c.contractCurrency || selectedOrder.billingDetails?.clientCurrency || 'USD',
        amountInUSD: c.amountInUSD || c.amount || 0,
        percentage: c.percentage || 0,
        billFrom: c.billFrom || 'MCC',
        receivingBankName: c.receivingBankName || '',
        bankDetailsLink: c.bankDetailsLink || '',
        selected: true
      }));
    }
    // Also check division_contracts stored in localStorage linked to this order
    try {
      const allDivContracts = JSON.parse(localStorage.getItem('division_contracts') || '[]');
      const orderLinkedContracts = allDivContracts.filter(c => 
        (selectedOrder.id && String(c.orderId) === String(selectedOrder.id)) ||
        (selectedOrder.orderName && c.orderName === selectedOrder.orderName)
      );
      if (orderLinkedContracts.length > 0) {
        return orderLinkedContracts.map((c, i) => ({
          id: c.id || String(i + 1),
          companyName: c.companyName || c.clientName || `Contract #${i + 1}`,
          taxDetails: c.taxDetails || c.taxId || '',
          contractValue: c.contractValue || c.amount || 0,
          contractCurrency: c.contractCurrency || selectedOrder.billingDetails?.clientCurrency || 'USD',
          amountInUSD: c.amountInUSD || c.amount || 0,
          percentage: c.percentage || 0,
          billFrom: c.billFrom || 'MCC',
          receivingBankName: c.receivingBankName || '',
          bankDetailsLink: c.bankDetailsLink || '',
          selected: true
        }));
      }
    } catch (e) {}

    return [];
  }, [selectedOrder]);

  // Initialize separate terms for each available contract
  useEffect(() => {
    if (isOpen && availableContracts.length > 1) {
      setSeparateTerms(prev => {
        let changed = false;
        const next = { ...prev };
        availableContracts.forEach(c => {
          if (next[c.id] === undefined) {
            next[c.id] = formData.paymentTerms || '1';
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [isOpen, availableContracts, formData.paymentTerms]);

  const activeSingleContract = (contractScope !== 'all_combined' && contractScope !== 'all_separate')
    ? availableContracts.find(c => String(c.id) === String(contractScope))
    : null;

  const parseFlexibleDate = (dateStr) => {
    if (!dateStr || dateStr === 'Unknown Date') return null;
    if (typeof dateStr !== 'string') return new Date(dateStr);
    const trimmed = dateStr.trim();
    const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (dmyMatch) {
      const [, day, month, year] = dmyMatch;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  };

  const calculatePlanMonthDiff = (startStr, endStr) => {
    const d1 = parseFlexibleDate(startStr);
    const d2 = parseFlexibleDate(endStr);
    if (!d1 || !d2) return 12;

    const timeDiff = d2.getTime() - d1.getTime();
    if (timeDiff > 0) {
      const daysDiff = timeDiff / (1000 * 3600 * 24);
      const calculated = Math.round(daysDiff / 30.44);
      if (calculated > 0) return calculated;
    }

    let yearDiff = d2.getFullYear() - d1.getFullYear();
    let monthDiff = d2.getMonth() - d1.getMonth();
    let months = yearDiff * 12 + monthDiff;
    if (months < 0) {
      months = ((months % 12) + 12) % 12;
    }
    if (d2.getDate() >= 27 || d2.getDate() >= d1.getDate() - 1) {
      months += 1;
    }
    return Math.max(1, months);
  };

  let maxPaymentTerms = 12; // Default flexible payment terms
  if (selectedOrder) {
    const planStart = selectedOrder.planStart || '';
    const planEnd = selectedOrder.planEnd || '';
    if (planStart && planEnd && planStart !== 'Unknown Date') {
      maxPaymentTerms = calculatePlanMonthDiff(planStart, planEnd);
    }
  }

  const getFrequencyMonths = (freq, totalPlanMonths) => {
    const total = Math.max(1, Number(totalPlanMonths) || 12);
    if (freq === 'Bi Anually') {
      return 2;
    }
    if (freq === 'Monthly') {
      return total;
    }
    if (freq === 'Quarterly') {
      // User rule: max 4. Count Diff (Billing Start Date month - Plan End Month).
      // If divisible by 3 without decimal then select that number else reach out to closest month before Plan End.
      // E.g.: 7 / 3 = 2.33 -> 2
      const quarters = Math.floor(total / 3);
      return Math.min(4, Math.max(1, quarters));
    }
    return total;
  };

  const getCadenceOffset = (index, freq, totalPlanMonths) => {
    if (freq === 'Quarterly') {
      return index * 3;
    }
    if (freq === 'Bi Anually') {
      const step = Math.max(1, Math.floor((totalPlanMonths || 12) / 2));
      return index * step;
    }
    return index;
  };

  const handleFrequencyChange = (newFreq) => {
    setBillingFrequency(newFreq);
    const calculatedTerms = getFrequencyMonths(newFreq, maxPaymentTerms);
    setFormData(prev => ({ ...prev, paymentTerms: String(calculatedTerms) }));
    setSeparateTerms(prev => {
      const next = { ...prev };
      availableContracts.forEach(c => {
        next[c.id] = String(calculatedTerms);
      });
      return next;
    });
    setContractFrequencies(prev => {
      const next = { ...prev };
      availableContracts.forEach(c => {
        next[c.id] = newFreq;
      });
      return next;
    });
    setPaymentTermError('');
  };

  const handleContractFrequencyChange = (contractId, newFreq) => {
    setContractFrequencies(prev => ({ ...prev, [contractId]: newFreq }));
    const calculatedTerms = getFrequencyMonths(newFreq, maxPaymentTerms);
    setSeparateTerms(prev => ({ ...prev, [contractId]: String(calculatedTerms) }));
    setPaymentTermError('');
  };

  // --- Monthly Back-to-Back Date Helpers ---
  const getMonthlyDate = (baseDateStr, monthOffset) => {
    let d = baseDateStr ? new Date(baseDateStr) : new Date();
    if (isNaN(d.getTime())) d = new Date();
    
    const startDay = d.getDate();
    const res = new Date(d);
    res.setMonth(res.getMonth() + monthOffset);
    
    if (res.getDate() !== startDay) {
      res.setDate(0);
    }
    return res.toISOString().split('T')[0];
  };

  const getDueDate = (invoiceDateStr, dueDays) => {
    const d = new Date(invoiceDateStr);
    if (isNaN(d.getTime())) return invoiceDateStr;
    d.setDate(d.getDate() + (Number(dueDays) || 30));
    return d.toISOString().split('T')[0];
  };

  // --- Automatic Percentage Rebalancing ---
  const recalculateSplits = (termsCount, pinnedMap = {}) => {
    const terms = Number(termsCount) || 1;
    const result = [];
    
    let pinnedSum = 0;
    let pinnedCount = 0;
    for (let i = 0; i < terms; i++) {
      if (pinnedMap[i] !== undefined && pinnedMap[i] !== null && pinnedMap[i] !== '') {
        pinnedSum += Number(pinnedMap[i]);
        pinnedCount++;
      }
    }

    const unpinnedCount = terms - pinnedCount;
    const remainingPct = Math.max(0, 100 - pinnedSum);

    let unpinnedRunningSum = 0;
    let unpinnedEncountered = 0;

    for (let i = 0; i < terms; i++) {
      if (pinnedMap[i] !== undefined && pinnedMap[i] !== null && pinnedMap[i] !== '') {
        result.push({
          index: i,
          installmentNumber: i + 1,
          percentage: Number(pinnedMap[i]),
          isPinned: true
        });
      } else {
        unpinnedEncountered++;
        let pct = 0;
        if (unpinnedCount > 0) {
          if (unpinnedEncountered === unpinnedCount) {
            pct = Number((remainingPct - unpinnedRunningSum).toFixed(2));
          } else {
            pct = Number((remainingPct / unpinnedCount).toFixed(2));
            unpinnedRunningSum += pct;
          }
        }
        result.push({
          index: i,
          installmentNumber: i + 1,
          percentage: pct,
          isPinned: false
        });
      }
    }
    return result;
  };

  const confirmPercentage = (idx, valueStr, termsCount) => {
    const val = Number(valueStr);
    if (isNaN(val) || val <= 0) {
      alert("Please enter a valid percentage greater than 0");
      return;
    }
    
    let otherPinnedSum = 0;
    Object.keys(pinnedPercentages).forEach(key => {
      if (Number(key) !== idx) {
        otherPinnedSum += Number(pinnedPercentages[key]);
      }
    });

    const maxAllowed = Number((100 - otherPinnedSum).toFixed(2));
    if (val >= 100 || val > maxAllowed) {
      alert(`Cannot exceed available share. Maximum possible for this invoice is ${maxAllowed}%`);
      return;
    }

    setPinnedPercentages(prev => ({
      ...prev,
      [idx]: val
    }));

    setTempPercentageInputs(prev => {
      const n = { ...prev };
      delete n[idx];
      return n;
    });
  };

  const resetPercentage = (idx) => {
    setPinnedPercentages(prev => {
      const n = { ...prev };
      delete n[idx];
      return n;
    });
    setTempPercentageInputs(prev => {
      const n = { ...prev };
      delete n[idx];
      return n;
    });
  };

  const generateInvoices = (activeSplitsOverride = null) => {
    if (!selectedOrder) return [];
    
    const defaultTerms = Number(formData.paymentTerms) || 1;
    const planStart = selectedOrder.planStart || '';
    const paymentDueDays = Number(selectedOrder.billingDetails?.paymentDue) || 30;
    const orderTotalUsd = Number(selectedOrder.billingDetails?.amountInUSD) || Number(selectedOrder.amount) || 0;
    const orderContractVal = Number(selectedOrder.billingDetails?.contractValue) || Number(selectedOrder.amount) || 0;
    const defaultCurrency = selectedOrder.billingDetails?.clientCurrency || 'USD';

    let activeSplits = activeSplitsOverride || availableContracts;
    if (activeSplits.length === 0) {
      activeSplits = [{
        id: '1',
        companyName: selectedOrder.billingDetails?.billingEntity || selectedOrder.billingDetails?.companyName || selectedOrder.clientName || 'Entity',
        taxDetails: selectedOrder.billingDetails?.taxDetails || '',
        contractValue: orderContractVal,
        contractCurrency: defaultCurrency,
        amountInUSD: orderTotalUsd,
        percentage: 100,
        billFrom: selectedOrder.billingDetails?.billFrom || 'MCC',
        selected: true
      }];
    }

    const invoices = [];

    // CASE 1: Individual Single Contract Selected
    if (contractScope !== 'all_combined' && contractScope !== 'all_separate') {
      const targetContract = activeSplits.find(c => String(c.id) === String(contractScope));
      if (!targetContract) return [];

      const terms = defaultTerms;
      const contractVal = Number(targetContract.contractValue) || Number(targetContract.amountInUSD) || 0;
      const contractUsd = Number(targetContract.amountInUSD) || contractVal || 0;
      const curr = targetContract.contractCurrency || defaultCurrency;
      const entityName = targetContract.companyName || 'Entity';
      const taxId = targetContract.taxId || targetContract.taxDetails || '';
      const billFrom = targetContract.billFrom || selectedOrder.billingDetails?.billFrom || 'Unknown';

      const termSplits = recalculateSplits(terms, pinnedPercentages);
      termSplits.forEach((termSplit, i) => {
        const termPct = termSplit.percentage;
        const termValue = Number(((contractVal * termPct) / 100).toFixed(2));
        const termUsd = Number(((contractUsd * termPct) / 100).toFixed(2));
        const invoiceByDateStr = customDates[i]?.invoiceDate || getMonthlyDate(planStart, getCadenceOffset(i, billingFrequency, maxPaymentTerms));
        const dueByDateStr = customDates[i]?.dueByDate || getDueDate(invoiceByDateStr, paymentDueDays);
        const remarkVal = customRemarks[i] || '';

        invoices.push({
          id: `INV-${Date.now()}-${targetContract.id}-${i}`,
          installmentNumber: i + 1,
          termIndex: i + 1,
          totalTerms: terms,
          splitIndex: 1,
          totalSplits: 1,
          clientName: formData.corporate || selectedOrder.corporate || selectedOrder.clientName || 'Unknown',
          orderId: String(selectedOrder.id),
          orderName: selectedOrder.id === 'Null' ? '' : (selectedOrder.orderName || formData.orderName || ''),
          contractId: String(targetContract.id),
          billingCompany: entityName,
          clientBillingEntity: entityName,
          taxId: taxId,
          billFrom: billFrom,
          splitPercentage: 100,
          termPercentage: termPct,
          amountDueUsd: termUsd,
          amountDue: termValue,
          currency: curr,
          status: 'To be Raised',
          invoiceByDate: invoiceByDateStr,
          dueByDate: dueByDateStr,
          invoiceDate: '-',
          invoiceLink: '',
          totalPaid: 0,
          dueAmount: termUsd,
          overdueDays: 0,
          remarks: remarkVal
        });
      });

      return invoices;
    }

    // CASE 2: All Separate (Each contract gets its own schedule with its own installments)
    if (contractScope === 'all_separate') {
      activeSplits.forEach((contract, cIdx) => {
        const terms = Number(separateTerms[contract.id] !== undefined ? separateTerms[contract.id] : defaultTerms) || 1;
        const contractVal = Number(contract.contractValue) || Number(contract.amountInUSD) || 0;
        const contractUsd = Number(contract.amountInUSD) || contractVal || 0;
        const curr = contract.contractCurrency || defaultCurrency;
        const entityName = contract.companyName || `Entity #${cIdx + 1}`;
        const taxId = contract.taxId || contract.taxDetails || '';
        const billFrom = contract.billFrom || selectedOrder.billingDetails?.billFrom || 'Unknown';

        const termSplits = recalculateSplits(terms, {});
        termSplits.forEach((termSplit, i) => {
          const termPct = termSplit.percentage;
          const termValue = Number(((contractVal * termPct) / 100).toFixed(2));
          const termUsd = Number(((contractUsd * termPct) / 100).toFixed(2));
          const contractFreq = contractFrequencies[contract.id] || billingFrequency;
          const invoiceByDateStr = customDates[`${contract.id}-${i}`]?.invoiceDate || getMonthlyDate(planStart, getCadenceOffset(i, contractFreq, maxPaymentTerms));
          const dueByDateStr = customDates[`${contract.id}-${i}`]?.dueByDate || getDueDate(invoiceByDateStr, paymentDueDays);
          const remarkVal = customRemarks[`${contract.id}-${i}`] || customRemarks[i] || '';

          invoices.push({
            id: `INV-${Date.now()}-${contract.id}-${i}`,
            installmentNumber: i + 1,
            termIndex: i + 1,
            totalTerms: terms,
            splitIndex: cIdx + 1,
            totalSplits: activeSplits.length,
            clientName: formData.corporate || selectedOrder.corporate || selectedOrder.clientName || 'Unknown',
            orderId: String(selectedOrder.id),
            orderName: selectedOrder.id === 'Null' ? '' : (selectedOrder.orderName || formData.orderName || ''),
            contractId: String(contract.id),
            billingCompany: entityName,
            clientBillingEntity: entityName,
            taxId: taxId,
            billFrom: billFrom,
            splitPercentage: 100,
            termPercentage: termPct,
            amountDueUsd: termUsd,
            amountDue: termValue,
            currency: curr,
            status: 'To be Raised',
            invoiceByDate: invoiceByDateStr,
            dueByDate: dueByDateStr,
            invoiceDate: '-',
            invoiceLink: '',
            totalPaid: 0,
            dueAmount: termUsd,
            overdueDays: 0,
            remarks: remarkVal
          });
        });
      });

      return invoices;
    }

    // CASE 3: All Combined (Unified schedule proportional to split percentages)
    const terms = defaultTerms;
    const hasMultiSplits = activeSplits.length > 1;
    const termSplits = recalculateSplits(terms, pinnedPercentages);
    const totalSplitsUSD = activeSplits.reduce((acc, s) => acc + (Number(s.amountInUSD) || Number(s.contractValue) || 0), 0) || orderTotalUsd || 1;

    termSplits.forEach((termSplit, i) => {
      const termPct = termSplit.percentage;
      const termValue = Number(((orderContractVal * termPct) / 100).toFixed(2));
      const termUsd = Number(((orderTotalUsd * termPct) / 100).toFixed(2));

      const invoiceByDateStr = customDates[i]?.invoiceDate || getMonthlyDate(planStart, getCadenceOffset(i, billingFrequency, maxPaymentTerms));
      const dueByDateStr = customDates[i]?.dueByDate || getDueDate(invoiceByDateStr, paymentDueDays);

      if (hasMultiSplits) {
        let runningValSum = 0;
        let runningUsdSum = 0;

        activeSplits.forEach((split, sIdx) => {
          let compPct = Number(split.percentage);
          if (isNaN(compPct) || compPct <= 0) {
            const sVal = Number(split.amountInUSD) || Number(split.contractValue) || 0;
            compPct = totalSplitsUSD > 0 ? Number(((sVal / totalSplitsUSD) * 100).toFixed(2)) : Number((100 / activeSplits.length).toFixed(2));
          }

          let splitVal, splitUsd;

          if (sIdx === activeSplits.length - 1) {
            splitVal = Number((termValue - runningValSum).toFixed(2));
            splitUsd = Number((termUsd - runningUsdSum).toFixed(2));
          } else {
            splitVal = Number(((termValue * compPct) / 100).toFixed(2));
            splitUsd = Number(((termUsd * compPct) / 100).toFixed(2));
            runningValSum += splitVal;
            runningUsdSum += splitUsd;
          }

          const splitCurrency = split.contractCurrency || defaultCurrency;
          const remarkKey = `${i}-${split.companyName}`;
          const remarkVal = customRemarks[remarkKey] || customRemarks[i] || '';

          invoices.push({
            id: `INV-${Date.now()}-${i}-${sIdx}`,
            installmentNumber: i + 1,
            termIndex: i + 1,
            totalTerms: terms,
            splitIndex: sIdx + 1,
            totalSplits: activeSplits.length,
            clientName: formData.corporate || selectedOrder.corporate || selectedOrder.clientName || 'Unknown',
            orderId: String(selectedOrder.id),
            orderName: selectedOrder.id === 'Null' ? '' : (selectedOrder.orderName || formData.orderName || ''),
            contractId: String(split.id || ''),
            billingCompany: split.companyName,
            clientBillingEntity: split.companyName,
            taxId: split.taxId || split.taxDetails || '',
            splitPercentage: compPct,
            termPercentage: termPct,
            billFrom: split.billFrom || selectedOrder.billingDetails?.billFrom || 'Unknown',
            amountDueUsd: splitUsd,
            amountDue: splitVal,
            currency: splitCurrency,
            status: 'To be Raised',
            invoiceByDate: invoiceByDateStr,
            dueByDate: dueByDateStr,
            invoiceDate: '-',
            invoiceLink: '',
            totalPaid: 0,
            dueAmount: splitUsd,
            overdueDays: 0,
            remarks: remarkVal
          });
        });
      } else {
        const entityName = (activeSplits.length === 1 ? activeSplits[0].companyName : null) 
          || selectedOrder.billingDetails?.billingEntity 
          || selectedOrder.billingDetails?.companyName 
          || selectedOrder.clientName 
          || 'N/A';
        const taxId = (activeSplits.length === 1 ? activeSplits[0].taxId : null)
          || selectedOrder.billingDetails?.taxDetails 
          || '';

        const remarkVal = customRemarks[i] || '';

        invoices.push({
          id: `INV-${Date.now()}-${i}`,
          installmentNumber: i + 1,
          termIndex: i + 1,
          totalTerms: terms,
          totalSplits: 1,
          splitIndex: 1,
          clientName: formData.corporate || selectedOrder.corporate || selectedOrder.clientName || 'Unknown',
          orderId: String(selectedOrder.id),
          orderName: selectedOrder.id === 'Null' ? '' : (selectedOrder.orderName || formData.orderName || ''),
          contractId: String(activeSplits[0]?.id || (unlinkedContract?.id ? unlinkedContract.id : '')),
          billingCompany: entityName,
          clientBillingEntity: entityName,
          taxId: taxId,
          billFrom: selectedOrder.billingDetails?.billFrom || 'Unknown',
          splitPercentage: 100,
          termPercentage: termPct,
          amountDueUsd: termUsd,
          amountDue: termValue,
          currency: defaultCurrency,
          status: 'To be Raised',
          invoiceByDate: invoiceByDateStr,
          dueByDate: dueByDateStr,
          invoiceDate: '-',
          invoiceLink: '',
          totalPaid: 0,
          dueAmount: termUsd,
          overdueDays: 0,
          remarks: remarkVal
        });
      }
    });

    return invoices;
  };

  // --- Preview Schedule Customization Handlers (Scenario 1 & 2 support) ---
  const handlePreviewPercentageChange = (idx, newPctVal) => {
    const targetInv = previewInvoices[idx];
    if (!targetInv) return;

    const numPct = parseFloat(newPctVal);
    if (isNaN(numPct) || numPct <= 0) return;

    const targetContractId = targetInv.contractId;
    const sameContractIndices = previewInvoices
      .map((inv, i) => (String(inv.contractId) === String(targetContractId) ? i : -1))
      .filter(i => i !== -1);

    if (sameContractIndices.length <= 1) return; // single invoice is always 100%

    const contractObj = availableContracts.find(c => String(c.id) === String(targetContractId));
    const totalContractVal = contractObj 
      ? (Number(contractObj.contractValue) || Number(contractObj.amountInUSD) || 0)
      : sameContractIndices.reduce((sum, i) => sum + (Number(previewInvoices[i].amountDue) || 0), 0);
    const totalContractUsd = contractObj
      ? (Number(contractObj.amountInUSD) || totalContractVal || 0)
      : sameContractIndices.reduce((sum, i) => sum + (Number(previewInvoices[i].amountDueUsd) || 0), 0);

    const updatedPinned = { ...pinnedPreviewRows, [idx]: { isPinned: true, percentage: numPct } };
    setPinnedPreviewRows(updatedPinned);

    let pinnedPctSum = 0;
    const unpinnedIndices = [];
    sameContractIndices.forEach(i => {
      if (updatedPinned[i]?.isPinned) {
        pinnedPctSum += Number(updatedPinned[i].percentage);
      } else {
        unpinnedIndices.push(i);
      }
    });

    const remainingPct = Math.max(0, 100 - pinnedPctSum);
    const splitPerUnpinned = unpinnedIndices.length > 0 
      ? Number((remainingPct / unpinnedIndices.length).toFixed(2)) 
      : 0;

    setPreviewInvoices(prev => {
      return prev.map((item, i) => {
        if (!sameContractIndices.includes(i)) return item;

        let pct = 0;
        if (updatedPinned[i]?.isPinned) {
          pct = Number(updatedPinned[i].percentage);
        } else {
          const isLastUnpinned = unpinnedIndices[unpinnedIndices.length - 1] === i;
          if (isLastUnpinned) {
            pct = Number((remainingPct - (splitPerUnpinned * (unpinnedIndices.length - 1))).toFixed(2));
          } else {
            pct = splitPerUnpinned;
          }
        }

        const amtDue = Number(((totalContractVal * pct) / 100).toFixed(2));
        const amtDueUsd = Number(((totalContractUsd * pct) / 100).toFixed(2));

        return {
          ...item,
          termPercentage: pct,
          amountDue: amtDue,
          amountDueUsd: amtDueUsd,
          dueAmount: amtDueUsd
        };
      });
    });
  };

  const handlePreviewAmountChange = (idx, newAmtVal) => {
    const targetInv = previewInvoices[idx];
    if (!targetInv) return;

    const numAmt = parseFloat(newAmtVal);
    if (isNaN(numAmt) || numAmt <= 0) return;

    const targetContractId = targetInv.contractId;
    const sameContractIndices = previewInvoices
      .map((inv, i) => (String(inv.contractId) === String(targetContractId) ? i : -1))
      .filter(i => i !== -1);

    const contractObj = availableContracts.find(c => String(c.id) === String(targetContractId));
    const totalContractVal = contractObj 
      ? (Number(contractObj.contractValue) || Number(contractObj.amountInUSD) || 0)
      : sameContractIndices.reduce((sum, i) => sum + (Number(previewInvoices[i].amountDue) || 0), 0);

    if (totalContractVal <= 0) return;

    const calculatedPct = Number(((numAmt / totalContractVal) * 100).toFixed(2));
    handlePreviewPercentageChange(idx, calculatedPct);
  };

  const unpinPreviewRow = (idx) => {
    const updatedPinned = { ...pinnedPreviewRows };
    delete updatedPinned[idx];
    setPinnedPreviewRows(updatedPinned);

    const targetInv = previewInvoices[idx];
    if (!targetInv) return;
    const targetContractId = targetInv.contractId;
    const sameContractIndices = previewInvoices
      .map((inv, i) => (String(inv.contractId) === String(targetContractId) ? i : -1))
      .filter(i => i !== -1);

    const contractObj = availableContracts.find(c => String(c.id) === String(targetContractId));
    const totalContractVal = contractObj 
      ? (Number(contractObj.contractValue) || Number(contractObj.amountInUSD) || 0)
      : sameContractIndices.reduce((sum, i) => sum + (Number(previewInvoices[i].amountDue) || 0), 0);
    const totalContractUsd = contractObj
      ? (Number(contractObj.amountInUSD) || totalContractVal || 0)
      : sameContractIndices.reduce((sum, i) => sum + (Number(previewInvoices[i].amountDueUsd) || 0), 0);

    let pinnedPctSum = 0;
    const unpinnedIndices = [];
    sameContractIndices.forEach(i => {
      if (updatedPinned[i]?.isPinned) {
        pinnedPctSum += Number(updatedPinned[i].percentage);
      } else {
        unpinnedIndices.push(i);
      }
    });

    const remainingPct = Math.max(0, 100 - pinnedPctSum);
    const splitPerUnpinned = unpinnedIndices.length > 0 
      ? Number((remainingPct / unpinnedIndices.length).toFixed(2)) 
      : 0;

    setPreviewInvoices(prev => {
      return prev.map((item, i) => {
        if (!sameContractIndices.includes(i)) return item;
        let pct = 0;
        if (updatedPinned[i]?.isPinned) {
          pct = Number(updatedPinned[i].percentage);
        } else {
          const isLastUnpinned = unpinnedIndices[unpinnedIndices.length - 1] === i;
          if (isLastUnpinned) {
            pct = Number((remainingPct - (splitPerUnpinned * (unpinnedIndices.length - 1))).toFixed(2));
          } else {
            pct = splitPerUnpinned;
          }
        }
        const amtDue = Number(((totalContractVal * pct) / 100).toFixed(2));
        const amtDueUsd = Number(((totalContractUsd * pct) / 100).toFixed(2));
        return {
          ...item,
          termPercentage: pct,
          amountDue: amtDue,
          amountDueUsd: amtDueUsd,
          dueAmount: amtDueUsd
        };
      });
    });
  };

  const resetPreviewSplits = () => {
    setPinnedPreviewRows({});
    setTempPercentageInputs({});
    setTempAmountInputs({});
    const fresh = generateInvoices();
    if (fresh && fresh.length > 0) {
      setPreviewInvoices(prev => {
        return fresh.map((freshItem, i) => {
          const existing = prev[i];
          if (!existing) return freshItem;
          return {
            ...freshItem,
            invoiceByDate: existing.invoiceByDate,
            dueByDate: existing.dueByDate,
            remarks: existing.remarks
          };
        });
      });
    }
  };

  const handleInvoiceDateChange = (idx, val) => {
    const paymentDueDays = Number(selectedOrder?.billingDetails?.paymentDue) || 30;
    const newDue = getDueDate(val, paymentDueDays);

    setPreviewInvoices(prev => {
      if (!autoCascadeDates) {
        return prev.map((item, i) => i === idx ? { ...item, invoiceByDate: val, dueByDate: newDue } : item);
      }
      const targetContractId = prev[idx]?.contractId;
      const baseTermIndex = prev[idx]?.installmentNumber || (idx + 1);

      return prev.map((item, i) => {
        if (i === idx) {
          return { ...item, invoiceByDate: val, dueByDate: newDue };
        }
        if (i > idx && String(item.contractId) === String(targetContractId)) {
          const itemTermIndex = item.installmentNumber || (i + 1);
          const contractFreq = (targetContractId && contractFrequencies[targetContractId]) || billingFrequency;
          const step = contractFreq === 'Quarterly' ? 3 : (contractFreq === 'Bi Anually' ? Math.max(1, Math.floor((maxPaymentTerms || 12) / 2)) : 1);
          const monthOffset = (itemTermIndex - baseTermIndex) * step;
          const cascadedDate = getMonthlyDate(val, monthOffset);
          const cascadedDue = getDueDate(cascadedDate, paymentDueDays);
          return { ...item, invoiceByDate: cascadedDate, dueByDate: cascadedDue };
        }
        return item;
      });
    });
  };

  const handleNext = () => {
    if (!formData.corporate) {
      setStepError('Please select Corporate.');
      return;
    }
    if (!formData.division) {
      setStepError('Please select Division.');
      return;
    }
    if (!formData.orderName && !formData.orderId && !selectedOrder) {
      setStepError('Please select an Order.');
      return;
    }
    setStepError('');
    setStep(2);
  };

  const handlePreview = () => {
    if (mode === 'schedule') {
      if (!selectedOrder) {
        alert("Please select an Order to schedule billing.");
        return;
      }
      setPaymentTermError('');
      if (contractScope === 'all_separate' && availableContracts.length > 1) {
        for (const c of availableContracts) {
          const t = Number(separateTerms[c.id] !== undefined ? separateTerms[c.id] : formData.paymentTerms);
          if (!t || t <= 0) {
            setPaymentTermError(`Billing month for "${c.companyName}" is required`);
            return;
          }
          if (maxPaymentTerms > 0 && t > maxPaymentTerms) {
            setPaymentTermError(`Billing month for "${c.companyName}" cannot exceed Plan Term (${maxPaymentTerms} months)`);
            return;
          }
        }
      } else {
        if (formData.paymentTerms && maxPaymentTerms > 0 && Number(formData.paymentTerms) > maxPaymentTerms) {
          setPaymentTermError(`Cannot exceed Plan Term (${maxPaymentTerms} months)`);
          return;
        }
        if (!formData.paymentTerms || Number(formData.paymentTerms) <= 0) {
          setPaymentTermError('Billing month is required');
          return;
        }
      }
      const invoices = generateInvoices();
      if (!invoices || invoices.length === 0) {
        alert("Unable to generate schedule preview. Please check that order value and payment terms are valid.");
        return;
      }
      setPinnedPreviewRows({});
      setTempPercentageInputs({});
      setTempAmountInputs({});
      setAutoCascadeDates(true);
      setPreviewInvoices(invoices);
      setIsPreview(true);
    } else {
      if (!formData.amount || Number(formData.amount) <= 0) {
        alert("Please provide a valid amount");
        return;
      }
      onSave({ formData, selectedOrder, mode });
      onClose();
    }
  };

  const handleSaveDirect = () => {
    if (mode === 'schedule') {
      if (!selectedOrder) {
        alert("Please select an Order to schedule billing.");
        return;
      }
      setPaymentTermError('');
      if (contractScope === 'all_separate' && availableContracts.length > 1) {
        for (const c of availableContracts) {
          const t = Number(separateTerms[c.id] !== undefined ? separateTerms[c.id] : formData.paymentTerms);
          if (!t || t <= 0) {
            setPaymentTermError(`Billing month for "${c.companyName}" is required`);
            return;
          }
          if (maxPaymentTerms > 0 && t > maxPaymentTerms) {
            setPaymentTermError(`Billing month for "${c.companyName}" cannot exceed Plan Term (${maxPaymentTerms} months)`);
            return;
          }
        }
      } else {
        if (formData.paymentTerms && maxPaymentTerms > 0 && Number(formData.paymentTerms) > maxPaymentTerms) {
          setPaymentTermError(`Cannot exceed Plan Term (${maxPaymentTerms} months)`);
          return;
        }
        if (!formData.paymentTerms || Number(formData.paymentTerms) <= 0) {
          setPaymentTermError('Billing month is required');
          return;
        }
      }
      const invoices = generateInvoices();
      if (!invoices || invoices.length === 0) {
        alert("Unable to generate schedule. Please check that order value and payment terms are valid.");
        return;
      }
      const hasDuplicate = checkDuplicateWarning(invoices, () => {
        onSave({ formData, selectedOrder, mode, invoices });
        onClose();
      });
      if (hasDuplicate) return;

      onSave({ formData, selectedOrder, mode, invoices });
      onClose();
    }
  };

  const checkDuplicateWarning = (invoices, onProceed) => {
    try {
      const clientPayments = JSON.parse(localStorage.getItem('client_payments') || '[]');
      const contractIdsToCheck = [...new Set((invoices || []).map(inv => inv.contractId).filter(Boolean))];
      if (contractIdsToCheck.length > 0) {
        const existingMatches = clientPayments.filter(p => p && p.contractId && contractIdsToCheck.includes(String(p.contractId)));
        if (existingMatches.length > 0) {
          const existingTotal = existingMatches.reduce((sum, p) => sum + (Number(p.amountDueUsd) || Number(p.amountDue) || 0), 0);
          const newTotal = (invoices || []).reduce((sum, inv) => sum + (Number(inv.amountDueUsd) || Number(inv.amountDue) || 0), 0);
          const curr = invoices?.[0]?.currency || existingMatches[0]?.currency || 'USD';
          const entityName = invoices?.[0]?.clientBillingEntity || invoices?.[0]?.billingCompany || existingMatches[0]?.clientBillingEntity || formData.corporate || 'Contract Entity';

          setDuplicateWarning({
            existingMatches,
            existingCount: existingMatches.length,
            existingTotal,
            newCount: invoices.length,
            newTotal,
            currency: curr,
            contractName: entityName,
            invoices,
            onProceed
          });
          return true; // Found existing entries, opened warning modal
        }
      }
    } catch (e) {
      console.error('Error checking duplicate warning:', e);
    }
    return false;
  };

  const handleSave = () => {
    const hasDuplicate = checkDuplicateWarning(previewInvoices, () => {
      onSave({ formData, selectedOrder, mode, invoices: previewInvoices });
      onClose();
    });
    if (hasDuplicate) return;

    onSave({ formData, selectedOrder, mode, invoices: previewInvoices });
    onClose();
  };

  // Close modal on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        if (duplicateWarning) {
          setDuplicateWarning(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, duplicateWarning, onClose]);

  const renderDuplicateWarningModal = () => {
    if (!duplicateWarning) return null;

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.72)',
          backdropFilter: 'blur(5px)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.25rem',
          animation: 'fadeIn 0.15s ease-out'
        }}
        onClick={() => setDuplicateWarning(null)}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(245, 158, 11, 0.25)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'left'
          }}
        >
          {/* Top Amber Warning Accent Bar */}
          <div style={{ height: '5px', background: 'linear-gradient(90deg, #f59e0b, #d97706, #b45309)' }} />

          {/* Modal Header & Content */}
          <div style={{ padding: '1.5rem 1.75rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)'
              }}>
                <i className='bx bx-error-alt'></i>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#0f172a', lineHeight: '1.3' }}>
                    Existing Schedule Detected
                  </h3>
                  <button
                    type="button"
                    onClick={() => setDuplicateWarning(null)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.35rem', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                  >
                    <i className='bx bx-x'></i>
                  </button>
                </div>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: '#64748b', lineHeight: '1.4' }}>
                  Accounts Receivable already has active invoice line(s) for this contract.
                </p>
              </div>
            </div>

            {/* Context Card */}
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              {/* Contract Entity */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.65rem', marginBottom: '0.75rem', borderBottom: '1px dashed #fde68a' }}>
                <span style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Contract Entity
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#78350f', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <i className='bx bx-buildings' style={{ color: '#d97706' }}></i> {duplicateWarning.contractName}
                </span>
              </div>

              {/* Side-by-side stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.65rem', alignItems: 'center' }}>
                <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fde68a', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: '700', marginBottom: '0.2rem', textTransform: 'uppercase' }}>
                    Currently in AR
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#92400e' }}>
                    {duplicateWarning.existingCount} <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>lines</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: '600', marginTop: '0.2rem' }}>
                    {duplicateWarning.currency} {Number(duplicateWarning.existingTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div style={{ color: '#d97706', fontSize: '1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className='bx bx-plus' style={{ background: '#fef3c7', borderRadius: '50%', padding: '4px', border: '1px solid #fde68a' }}></i>
                </div>

                <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#1d4ed8', fontWeight: '700', marginBottom: '0.2rem', textTransform: 'uppercase' }}>
                    New to be Added
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e40af' }}>
                    +{duplicateWarning.newCount} <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>lines</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: '600', marginTop: '0.2rem' }}>
                    {duplicateWarning.currency} {Number(duplicateWarning.newTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Sample existing invoice tags */}
              {duplicateWarning.existingMatches && duplicateWarning.existingMatches.length > 0 && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px dashed #fde68a', fontSize: '0.74rem', color: '#92400e' }}>
                  <span style={{ fontWeight: '700' }}>Existing lines in table: </span>
                  {duplicateWarning.existingMatches.slice(0, 3).map((item, idx) => (
                    <span key={idx} style={{ background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', margin: '0 2px', border: '1px solid #fde68a', fontWeight: '600', display: 'inline-block', marginTop: '2px' }}>
                      #{String(item.id).slice(-6)} • {item.currency || duplicateWarning.currency} {Number(item.amountDue || item.amountDueUsd || 0).toLocaleString()} ({item.status || 'To be Raised'})
                    </span>
                  ))}
                  {duplicateWarning.existingMatches.length > 3 && (
                    <span style={{ fontStyle: 'italic', color: '#b45309', marginLeft: '4px' }}>+{duplicateWarning.existingMatches.length - 3} more</span>
                  )}
                </div>
              )}
            </div>

            {/* Clear explanation notice */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: '#f8fafc', padding: '0.75rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <i className='bx bx-info-circle' style={{ color: '#0284c7', fontSize: '1.1rem', marginTop: '1px', flexShrink: 0 }}></i>
              <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.45' }}>
                Generating this schedule will <strong>append {duplicateWarning.newCount} additional invoice line(s)</strong> without deleting previously recorded lines.
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div style={{
            padding: '0.85rem 1.5rem',
            background: '#f8fafc',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <button
              type="button"
              onClick={() => setDuplicateWarning(null)}
              style={{
                padding: '0.55rem 1.15rem',
                background: '#ffffff',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
            >
              Cancel & Review
            </button>

            <button
              type="button"
              onClick={() => {
                if (duplicateWarning.onProceed) {
                  duplicateWarning.onProceed();
                }
                setDuplicateWarning(null);
              }}
              style={{
                padding: '0.55rem 1.35rem',
                background: 'linear-gradient(135deg, #d97706, #b45309)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 6px rgba(180, 83, 9, 0.25)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.05)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'none'}
            >
              <i className='bx bx-check-circle' style={{ fontSize: '1rem' }}></i> Proceed & Generate Invoices
            </button>
          </div>
        </div>
      </div>
    );
  };

  const inputStyle = {
    width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px',
    border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', boxSizing: 'border-box',
    fontFamily: 'inherit'
  };

  if (!isOpen) return null;

  if (isPreview) {
    return (
      <div 
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'white', borderRadius: '8px', width: '95%', maxWidth: '980px',
            padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Invoice Schedule Preview</h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Review and customize schedule. You can edit invoice dates, amounts, percentages, and remarks. Remaining balances auto-balance.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.78rem',
                color: '#334155',
                cursor: 'pointer',
                userSelect: 'none',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '0.3rem 0.65rem',
                borderRadius: '6px'
              }}
              title="When checked, changing any invoice date will automatically roll all subsequent invoice dates forward (+1 month each)"
              >
                <input 
                  type="checkbox" 
                  checked={autoCascadeDates} 
                  onChange={(e) => setAutoCascadeDates(e.target.checked)} 
                  style={{ accentColor: '#0ea5e9', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: '600' }}>Auto-roll following dates (+1 mo)</span>
              </label>
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>
                &times;
              </button>
            </div>
          </div>

          {/* Multi-Entity / Company Header Banner on top of schedule */}
          {(() => {
            if (contractScope === 'all_separate' && availableContracts.length > 1) {
              const totalUsd = availableContracts.reduce((acc, c) => acc + (Number(c.amountInUSD) || Number(c.contractValue) || 0), 0);
              return (
                <div style={{
                  marginBottom: '1.25rem',
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(to right, #f0f9ff, #f8fafc)',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <i className='bx bx-git-branch' style={{ color: '#0284c7', fontSize: '1.15rem' }}></i>
                      <strong style={{ fontSize: '0.8rem', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Independent Multi-Contract Schedules ({availableContracts.length} Contracts)
                      </strong>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Combined USD Value: <strong style={{ color: '#059669' }}>${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {availableContracts.map((c, i) => {
                      const terms = separateTerms[c.id] || formData.paymentTerms || 1;
                      const cVal = Number(c.contractValue) || Number(c.amountInUSD) || 0;
                      const cCurr = c.contractCurrency || 'USD';
                      return (
                        <div key={c.id || i} style={{
                          background: 'white',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '6px',
                          border: '1px solid #bfdbfe',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a' }}>
                            {c.companyName}
                          </span>
                          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>
                            {terms} Billing Months
                          </span>
                          <span style={{ color: '#0284c7', fontSize: '0.78rem', fontWeight: '700' }}>
                            {cCurr} {Number(cVal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const activeSplits = availableContracts.length > 0
              ? availableContracts
              : (selectedOrder?.billingDetails?.billingSplits?.filter(s => s.selected) || []);

            if (activeSplits.length > 1) {
              const totalVal = Number(selectedOrder?.billingDetails?.contractValue || selectedOrder?.amount || 0);
              const curr = selectedOrder?.billingDetails?.clientCurrency || '$';
              return (
                <div style={{
                  marginBottom: '1.25rem',
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(to right, #f0f9ff, #f8fafc)',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <i className='bx bx-git-branch' style={{ color: '#0284c7', fontSize: '1.15rem' }}></i>
                      <strong style={{ fontSize: '0.8rem', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Multi-Company Billing Allocation ({activeSplits.length} Entities)
                      </strong>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Contract Total: <strong style={{ color: '#0f172a' }}>{curr} {totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {activeSplits.map((entity, i) => {
                      const shareAmt = ((totalVal * (Number(entity.percentage) || 0)) / 100).toFixed(2);
                      return (
                        <div key={entity.id || i} style={{
                          background: 'white',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '6px',
                          border: '1px solid #bfdbfe',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a' }}>
                            {entity.companyName}
                          </span>
                          <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>
                            {entity.percentage}%
                          </span>
                          <span style={{ color: '#0369a1', fontSize: '0.78rem', fontWeight: '700' }}>
                            {curr} {Number(shareAmt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            if (selectedOrder?.billingDetails?.billingEntity || activeSingleContract) {
              const entityName = activeSingleContract?.companyName || selectedOrder.billingDetails?.billingEntity;
              const taxDetails = activeSingleContract?.taxDetails || selectedOrder.billingDetails?.taxDetails;
              return (
                <div style={{
                  marginBottom: '1rem',
                  padding: '0.5rem 0.85rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.82rem'
                }}>
                  <span style={{ color: '#64748b' }}>Billing Entity:</span>
                  <strong style={{ color: '#0f172a' }}>{entityName}</strong>
                  {taxDetails && (
                    <span style={{ color: '#64748b', marginLeft: '0.4rem' }}>({taxDetails})</span>
                  )}
                </div>
              );
            }
            return null;
          })()}
          
          <div style={{ maxHeight: '420px', overflowY: 'auto', marginBottom: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left', position: 'sticky', top: 0, zIndex: 10 }}>
                  <th style={{ padding: '0.55rem 0.5rem' }}>S.No</th>
                  <th style={{ padding: '0.55rem 0.5rem' }}>Billed Entity</th>
                  <th style={{ padding: '0.55rem 0.5rem' }}>Invoice By Date</th>
                  <th style={{ padding: '0.55rem 0.5rem' }}>Due Date</th>
                  <th style={{ padding: '0.55rem 0.5rem', minWidth: '95px' }}>Split %</th>
                  <th style={{ padding: '0.55rem 0.5rem', minWidth: '125px' }}>Amount ({activeSingleContract ? (activeSingleContract.contractCurrency || 'USD') : 'Contract Currency'})</th>
                  <th style={{ padding: '0.55rem 0.5rem' }}>Amount (USD)</th>
                  <th style={{ padding: '0.55rem 0.5rem', minWidth: '160px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', position: 'relative' }}>
                      <span>Remarks</span>
                      <div 
                        style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
                        onMouseEnter={() => setShowRemarksTooltip(true)}
                        onMouseLeave={() => setShowRemarksTooltip(false)}
                      >
                        <i className='bx bxs-info-circle' style={{ fontSize: '1.05rem', color: '#0ea5e9' }}></i>
                        {showRemarksTooltip && (
                          <div style={{
                            position: 'absolute',
                            top: 'calc(100% + 6px)',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#0f172a',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
                            zIndex: 9999,
                            pointerEvents: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            lineHeight: '1.2'
                          }}>
                            <div style={{
                              position: 'absolute',
                              bottom: '100%',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: 0,
                              height: 0,
                              borderLeft: '5px solid transparent',
                              borderRight: '5px solid transparent',
                              borderBottom: '5px solid #0f172a'
                            }} />
                            <span>These remarks will be added on Invoice</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {previewInvoices.map((inv, idx) => {
                  const isLastSplitInTerm = !inv.totalSplits || inv.splitIndex === inv.totalSplits;
                  const rowBg = (inv.installmentNumber % 2 === 0) ? '#f8fafc' : '#ffffff';
                  const isPinned = Boolean(pinnedPreviewRows[idx]?.isPinned);

                  return (
                    <tr 
                      key={inv.id || idx} 
                      style={{ 
                        background: isPinned ? '#f0f9ff' : rowBg,
                        borderBottom: isLastSplitInTerm ? '2px solid #cbd5e1' : '1px solid #f1f5f9' 
                      }}
                    >
                      {/* S.No & Term # */}
                      <td style={{ padding: '0.6rem 0.5rem', color: '#334155', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.85rem' }}>{idx + 1}</span>
                          {inv.totalTerms > 1 && (
                            <span style={{
                              background: '#e2e8f0',
                              color: '#475569',
                              fontSize: '0.68rem',
                              padding: '0.1rem 0.35rem',
                              borderRadius: '4px',
                              fontWeight: '700'
                            }}>
                              Term #{inv.installmentNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Billed Entity */}
                      <td style={{ padding: '0.6rem 0.5rem', color: '#0f172a', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '5px',
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}>
                            <i className='bx bx-buildings'></i>
                            {inv.clientBillingEntity || inv.billingCompany}
                          </span>
                          {inv.splitPercentage && inv.splitPercentage < 100 && (
                            <span style={{
                              background: '#dbeafe',
                              color: '#1e40af',
                              padding: '0.12rem 0.38rem',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: '700'
                            }}>
                              {inv.splitPercentage}%
                            </span>
                          )}
                        </div>
                        {inv.taxId && (
                          <div style={{ fontSize: '0.69rem', color: '#64748b', marginTop: '0.2rem' }}>
                            Tax/GST: {inv.taxId}
                          </div>
                        )}
                      </td>

                      {/* Invoice By Date */}
                      <td style={{ padding: '0.45rem 0.5rem' }}>
                        <input 
                          type="date"
                          value={inv.invoiceByDate}
                          onChange={(e) => handleInvoiceDateChange(idx, e.target.value)}
                          style={{ padding: '0.3rem 0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '0.8rem', color: '#0f172a' }}
                          title={autoCascadeDates ? "Changing this date rolls forward subsequent dates automatically" : "Date for this invoice"}
                        />
                      </td>

                      {/* Due Date */}
                      <td style={{ padding: '0.45rem 0.5rem' }}>
                        <input 
                          type="date"
                          value={inv.dueByDate}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPreviewInvoices(prev => prev.map((item, i) => i === idx ? { ...item, dueByDate: val } : item));
                          }}
                          style={{ padding: '0.3rem 0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '0.8rem', color: '#0f172a' }}
                        />
                      </td>

                      {/* Split % Input */}
                      <td style={{ padding: '0.45rem 0.5rem', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <input 
                            type="number"
                            step="0.01"
                            min="0.1"
                            max="100"
                            value={tempPercentageInputs[idx] !== undefined ? tempPercentageInputs[idx] : (inv.termPercentage ? Number(inv.termPercentage).toFixed(2) : '')}
                            onFocus={() => {
                              setTempPercentageInputs(prev => ({ ...prev, [idx]: inv.termPercentage ? String(inv.termPercentage) : '' }));
                            }}
                            onChange={(e) => {
                              const v = e.target.value;
                              setTempPercentageInputs(prev => ({ ...prev, [idx]: v }));
                            }}
                            onBlur={(e) => {
                              const v = e.target.value;
                              if (v !== '' && !isNaN(Number(v))) {
                                handlePreviewPercentageChange(idx, Number(v));
                              }
                              setTempPercentageInputs(prev => {
                                const copy = { ...prev };
                                delete copy[idx];
                                return copy;
                              });
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.target.blur();
                              }
                            }}
                            style={{
                              width: '62px',
                              padding: '0.3rem 0.35rem',
                              borderRadius: '5px',
                              border: isPinned ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                              background: isPinned ? '#eff6ff' : '#ffffff',
                              fontWeight: isPinned ? '700' : '600',
                              color: isPinned ? '#1d4ed8' : '#0f172a',
                              fontSize: '0.82rem',
                              boxSizing: 'border-box'
                            }}
                            title={isPinned ? "Custom pinned % (click unlock to reset)" : "Edit % to auto-balance remaining"}
                          />
                          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>%</span>
                          {isPinned && (
                            <button
                              type="button"
                              onClick={() => unpinPreviewRow(idx)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#2563eb',
                                padding: '0 0.15rem',
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}
                              title="Unlock custom split for this invoice"
                            >
                              <i className='bx bx-lock-alt' style={{ fontSize: '0.9rem' }}></i>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Amount ({Currency}) Input */}
                      <td style={{ padding: '0.45rem 0.5rem', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>{inv.currency}</span>
                          <input 
                            type="number"
                            step="0.01"
                            min="0"
                            value={tempAmountInputs[idx] !== undefined ? tempAmountInputs[idx] : (inv.amountDue !== undefined ? Number(inv.amountDue).toFixed(2) : '')}
                            onFocus={() => {
                              setTempAmountInputs(prev => ({ ...prev, [idx]: inv.amountDue !== undefined ? String(inv.amountDue) : '' }));
                            }}
                            onChange={(e) => {
                              const v = e.target.value;
                              setTempAmountInputs(prev => ({ ...prev, [idx]: v }));
                            }}
                            onBlur={(e) => {
                              const v = e.target.value;
                              if (v !== '' && !isNaN(Number(v))) {
                                handlePreviewAmountChange(idx, Number(v));
                              }
                              setTempAmountInputs(prev => {
                                const copy = { ...prev };
                                delete copy[idx];
                                return copy;
                              });
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.target.blur();
                              }
                            }}
                            style={{
                              width: '88px',
                              padding: '0.3rem 0.4rem',
                              borderRadius: '5px',
                              border: isPinned ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                              background: isPinned ? '#eff6ff' : '#ffffff',
                              fontWeight: isPinned ? '700' : '600',
                              color: isPinned ? '#1d4ed8' : '#0f172a',
                              fontSize: '0.82rem',
                              boxSizing: 'border-box'
                            }}
                            title={isPinned ? "Custom pinned amount" : "Edit amount to auto-balance remaining"}
                          />
                        </div>
                      </td>

                      {/* Amount (USD) */}
                      <td style={{ padding: '0.6rem 0.5rem', color: '#059669', fontWeight: '700', whiteSpace: 'nowrap' }}>
                        ${Number(inv.amountDueUsd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Remarks */}
                      <td style={{ padding: '0.4rem 0.5rem' }}>
                        <input 
                          type="text" 
                          value={inv.remarks || ''} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setPreviewInvoices(prev => prev.map((item, i) => i === idx ? { ...item, remarks: val } : item));
                          }}
                          placeholder={`Remarks for ${inv.clientBillingEntity || 'invoice'}...`}
                          style={{
                            width: '100%',
                            padding: '0.4rem 0.6rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.82rem',
                            color: '#0f172a',
                            boxSizing: 'border-box'
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Balanced Summary Footer Bar */}
          {(() => {
            const totalScheduledUsd = previewInvoices.reduce((sum, inv) => sum + (Number(inv.amountDueUsd) || 0), 0);
            const isCustomized = Object.keys(pinnedPreviewRows).length > 0;
            return (
              <div style={{
                marginBottom: '1.25rem',
                padding: '0.65rem 0.85rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.8rem',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#475569', flexWrap: 'wrap' }}>
                  <span>Total Invoices: <strong style={{ color: '#0f172a' }}>{previewInvoices.length}</strong></span>
                  <span>
                    Scheduled USD Total: <strong style={{ color: '#059669' }}>${totalScheduledUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </span>
                  {isCustomized && (
                    <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }}>
                      {Object.keys(pinnedPreviewRows).length} Custom Split(s)
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    background: '#ecfdf5',
                    color: '#059669',
                    border: '1px solid #a7f3d0',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <i className='bx bx-check-circle'></i> 100% Balanced
                  </span>
                  {isCustomized && (
                    <button
                      type="button"
                      onClick={resetPreviewSplits}
                      style={{
                        background: '#ffffff',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                      title="Reset all rows back to equal splits"
                    >
                      <i className='bx bx-undo'></i> Reset Splits
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button onClick={() => setIsPreview(false)} style={{ padding: '0.5rem 1rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
              Back
            </button>
            <button onClick={handleSave} style={{ padding: '0.5rem 1rem', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
              Add Schedule
            </button>
          </div>
        </div>
        {renderDuplicateWarningModal()}
      </div>
    );
  }

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
        display: 'flex', justifyContent: 'center', alignItems: 'center'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white', 
          borderRadius: '12px', 
          width: '95%', 
          maxWidth: (step === 2 && mode === 'schedule') ? '840px' : '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.5rem', 
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
          transition: 'max-width 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '700' }}>
                {mode === 'row' ? 'Add Row' : 'Add Invoice Schedule'}
              </h2>
              {mode === 'schedule' && (
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '999px',
                  background: step === 1 ? '#eff6ff' : '#ecfdf5',
                  color: step === 1 ? '#2563eb' : '#059669',
                  border: `1px solid ${step === 1 ? '#bfdbfe' : '#a7f3d0'}`
                }}>
                  Step {step} of 2: {step === 1 ? 'Select Order' : 'Configure Schedule'}
                </span>
              )}
            </div>
            {mode === 'schedule' && step === 1 && (
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Select Corporate, Division and Order to configure billing schedule.
              </p>
            )}
            {mode === 'schedule' && step === 2 && (
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Review contract values, set billing frequencies and installment months.
              </p>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }} title="Close">
            &times;
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
              Corporate <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div 
              onClick={() => setIsCorpDropdownOpen(!isCorpDropdownOpen)}
              style={{ ...inputStyle, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ color: formData.corporate ? '#0f172a' : '#64748b' }}>{formData.corporate || 'Select Corporate'}</span>
              <i className={`bx bx-chevron-${isCorpDropdownOpen ? 'up' : 'down'}`} style={{ color: '#64748b' }}></i>
            </div>
            
            {isCorpDropdownOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '4px', zIndex: 10, maxHeight: '200px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
                  <input 
                    type="text" 
                    autoFocus
                    placeholder="Search corporate..." 
                    style={{ ...inputStyle, padding: '0.4rem' }}
                    value={corpSearch}
                    onChange={e => setCorpSearch(e.target.value)}
                  />
                </div>
                <div style={{ overflowY: 'auto' }}>
                    {filteredCorps.map((corp, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, corporate: corp, division: '', orderName: '', orderId: '', paymentTerms: '1', amount: '' })); 
                        setIsCorpDropdownOpen(false);
                        setCorpSearch('');
                      }}
                      style={{ padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.85rem', color: '#0f172a' }}
                      onMouseEnter={e => e.target.style.background = '#f1f5f9'}
                      onMouseLeave={e => e.target.style.background = 'white'}
                    >
                      {corp}
                    </div>
                  ))}
                  {filteredCorps.length === 0 && (
                    <div style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>No corporates found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
              Division <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div 
              onClick={() => { if (formData.corporate) setIsDivDropdownOpen(!isDivDropdownOpen); }}
              style={{ ...inputStyle, cursor: formData.corporate ? 'pointer' : 'not-allowed', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: formData.corporate ? 'white' : '#f1f5f9' }}
            >
              <span style={{ color: formData.division ? '#0f172a' : '#64748b' }}>{formData.division || 'Select Division'}</span>
              <i className={`bx bx-chevron-${isDivDropdownOpen ? 'up' : 'down'}`} style={{ color: '#64748b' }}></i>
            </div>
            
            {isDivDropdownOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '4px', zIndex: 10, maxHeight: '200px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
                  <input 
                    type="text" 
                    autoFocus
                    placeholder="Search division..." 
                    style={{ ...inputStyle, padding: '0.4rem' }}
                    value={divSearch}
                    onChange={e => setDivSearch(e.target.value)}
                  />
                </div>
                <div style={{ overflowY: 'auto' }}>
                  {filteredDivs.map((div, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        const divOrders = safeOrders.filter(o => {
                          const oDiv = o.division || o.divisionName;
                          return oDiv === div;
                        });
                        let autoOrder = null;
                        if (divOrders.length === 1) {
                          autoOrder = divOrders[0];
                        }
                        const autoPs = autoOrder ? (autoOrder.planStart || 'Unknown Date') : '';
                        const autoPn = autoOrder ? (autoOrder.plan || autoOrder.planName || autoOrder.product || `Order #${autoOrder.id}`) : '';
                        setFormData(prev => ({ 
                          ...prev, 
                          division: div, 
                          orderId: autoOrder ? String(autoOrder.id) : '', 
                          orderName: autoOrder ? `${autoPs} & ${autoPn}` : '', 
                          paymentTerms: prev.paymentTerms || '1', 
                          amount: autoOrder?.billingDetails?.contractValue || autoOrder?.amount || '' 
                        })); 
                        setIsDivDropdownOpen(false);
                        setDivSearch('');
                      }}
                      style={{ padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.85rem', color: '#0f172a' }}
                      onMouseEnter={e => e.target.style.background = '#f1f5f9'}
                      onMouseLeave={e => e.target.style.background = 'white'}
                    >
                      {div}
                    </div>
                  ))}
                  {filteredDivs.length === 0 && (
                    <div style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>No divisions found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', margin: 0 }}>
                Order Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              {formData.division && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(`/corporate/division/order/add`, { state: { clientName: formData.corporate, divisionName: formData.division } });
                  }}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  <i className='bx bx-plus'></i> New Draft Order
                </button>
              )}
            </div>
            <select 
              style={{ ...inputStyle, color: (formData.orderId || formData.orderName) ? '#0f172a' : '#64748b', background: formData.division ? 'white' : '#f1f5f9' }}
              value={formData.orderId || (selectedOrder ? String(selectedOrder.id) : '')}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'Null' && unlinkedContract) {
                  setFormData(prev => ({
                    ...prev,
                    orderId: 'Null',
                    orderName: unlinkedContract.orderName || (unlinkedContract.companyName ? `[Unlinked Contract] ${unlinkedContract.companyName}` : 'Unlinked Contract'),
                    amount: unlinkedContract.contractValue || unlinkedContract.amount || prev.amount
                  }));
                  return;
                }
                const matched = filteredOrders.find(o => String(o.id) === val);
                if (matched) {
                  const ps = matched.planStart || 'Unknown Date';
                  const pn = matched.plan || matched.planName || matched.product || `Order #${matched.id}`;
                  const orderMonths = calculatePlanMonthDiff(matched.planStart, matched.planEnd);
                  const terms = getFrequencyMonths(billingFrequency, orderMonths);
                  setFormData(prev => ({
                    ...prev,
                    orderId: String(matched.id),
                    orderName: `${ps} & ${pn}`,
                    paymentTerms: String(terms),
                    amount: matched.billingDetails?.contractValue || matched.amount || prev.amount
                  }));
                  setSeparateTerms(prev => {
                    const next = { ...prev };
                    availableContracts.forEach(c => {
                      next[c.id] = String(terms);
                    });
                    return next;
                  });
                } else {
                  setFormData(prev => ({ ...prev, orderId: '', orderName: '' }));
                }
              }}
              disabled={!formData.division}
            >
              <option value="" disabled hidden>Select Order</option>
              {unlinkedContract && (
                <option value="Null">
                  Unlinked Contract • {unlinkedContract.companyName || 'Contract'} ({unlinkedContract.contractCurrency || unlinkedContract.currency || 'USD'} {Number(unlinkedContract.contractValue || unlinkedContract.amount || 0).toLocaleString()})
                </option>
              )}
              {filteredOrders.map(o => {
                const planStart = o.planStart || 'Unknown Date';
                const planName = o.plan || o.planName || o.product || `Order #${o.id}`;
                const isDraft = o.status === 'Draft';
                const statusTag = isDraft ? ' — [Draft: Ready to Bill]' : '';
                return (
                  <option key={o.id} value={String(o.id)}>
                    {planStart} & {planName}{statusTag}
                  </option>
                );
              })}
            </select>

            {unlinkedContract && (formData.orderId === 'Null' || !formData.orderId) && (
              <div style={{ marginTop: '0.6rem', padding: '0.65rem 0.85rem', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', fontSize: '0.8rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className='bx bx-check-shield' style={{ fontSize: '1.1rem', color: '#059669' }}></i>
                <div>
                  <span style={{ fontWeight: '700' }}>Unlinked Contract Schedule:</span> Order ID is <strong>Null</strong>. When an Order is linked, all invoice lines will update automatically.
                </div>
              </div>
            )}

            {formData.division && filteredOrders.length === 0 && !unlinkedContract && (
              <div style={{ marginTop: '0.6rem', padding: '0.75rem 0.85rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '0.8rem', color: '#1e40af' }}>
                <div style={{ fontWeight: '700', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <i className='bx bx-info-circle' style={{ fontSize: '1rem', color: '#2563eb' }}></i> No existing orders found for this division
                </div>
                <div style={{ lineHeight: '1.4', color: '#1e3a8a', marginBottom: '0.5rem' }}>
                  BD team can create an order with billing details and save as draft to immediately generate the billing schedule and invoice.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(`/corporate/division/order/add`, { state: { clientName: formData.corporate, divisionName: formData.division } });
                  }}
                  style={{ padding: '0.4rem 0.85rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <i className='bx bx-plus'></i> Add Order with Billing Details (Draft)
                </button>
              </div>
            )}
          </div>

          {/* Step 1 Fields & Step 1 Footer */}
          {(step === 1 || mode === 'row') && (
            <div>
              {mode === 'row' && (
                <div style={{ marginTop: '0.75rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                    Amount ({selectedOrder?.billingDetails?.clientCurrency || 'USD'}) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="number"
                    style={inputStyle}
                    placeholder="e.g. 500"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
              )}

              {stepError && (
                <div style={{ marginTop: '0.85rem', padding: '0.55rem 0.85rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <i className='bx bx-error-circle' style={{ fontSize: '1rem' }}></i> {stepError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
                {mode === 'row' ? (
                  <button 
                    type="button"
                    onClick={handlePreview} 
                    style={{ 
                      padding: '0.55rem 1.35rem', 
                      background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      fontWeight: '600', 
                      fontSize: '0.85rem'
                    }}
                  >
                    <i className='bx bx-check'></i> Add Row
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={handleNext} 
                    style={{ 
                      padding: '0.6rem 1.6rem', 
                      background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      fontWeight: '600', 
                      fontSize: '0.88rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)'
                    }}
                  >
                    Next <i className='bx bx-right-arrow-alt' style={{ fontSize: '1.15rem' }}></i>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Total Order Value (in Dropdown), Contract Table, and Back | Preview Schedule */}
          {step === 2 && mode === 'schedule' && selectedOrder && (() => {
            const isSingleContract = Boolean(activeSingleContract);
            const contractValue = isSingleContract 
              ? (Number(activeSingleContract.contractValue) || Number(activeSingleContract.amountInUSD) || 0)
              : (Number(selectedOrder.billingDetails?.contractValue) || Number(selectedOrder.amount) || 0);
            const currency = isSingleContract
              ? (activeSingleContract.contractCurrency || 'USD')
              : (selectedOrder.billingDetails?.clientCurrency || 'USD');
            const amountInUSD = isSingleContract
              ? (Number(activeSingleContract.amountInUSD) || contractValue || 0)
              : (Number(selectedOrder.billingDetails?.amountInUSD) || Number(selectedOrder.amount) || 0);
            const planStart = selectedOrder.planStart || '';
            const planEnd = selectedOrder.planEnd || '';
            
            const termDisplay = maxPaymentTerms > 0 
              ? `${maxPaymentTerms} Months (${planStart || 'Start'} to ${planEnd || 'Ongoing'})`
              : (planStart ? `${planStart} to ${planEnd || 'Ongoing'}` : 'Open Term');

            const contractsList = availableContracts.length > 0 
              ? availableContracts 
              : [{
                  id: 'primary',
                  companyName: activeSingleContract?.companyName || selectedOrder?.clientName || formData.corporate || 'Primary Entity',
                  taxDetails: activeSingleContract?.taxDetails || '',
                  contractValue: contractValue,
                  contractCurrency: currency,
                  amountInUSD: amountInUSD
                }];

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* 1. Total Order Value Section (Collapsible Accordion / Dropdown) */}
                <div style={{
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden'
                }}>
                  <div 
                    onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
                    style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: isOrderSummaryOpen ? '#f1f5f9' : '#f8fafc',
                      transition: 'background 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <i className='bx bx-receipt' style={{ fontSize: '1.25rem', color: '#0284c7' }}></i>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                        Total Order Value:
                      </span>
                      <span style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0284c7' }}>
                        {currency} {Number(contractValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: '600', background: '#ecfdf5', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                        USD ${Number(amountInUSD).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        • {selectedOrder.orderName || formData.orderName} ({contractsList.length} {contractsList.length === 1 ? 'Contract' : 'Contracts'})
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#0284c7', fontWeight: '600' }}>
                      <span>{isOrderSummaryOpen ? 'Hide Details' : 'Show Details'}</span>
                      <i className={`bx bx-chevron-${isOrderSummaryOpen ? 'up' : 'down'}`} style={{ fontSize: '1.15rem' }}></i>
                    </div>
                  </div>

                  {isOrderSummaryOpen && (
                    <div style={{ padding: '0.85rem 1rem', borderTop: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {selectedOrder.status === 'Draft' && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>
                            <i className='bx bx-edit-alt'></i> Draft Order • Billing Details Configured
                          </div>
                        )}
                        {isSingleContract ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>
                            <i className='bx bx-check-circle'></i> Single Contract: {activeSingleContract.companyName}
                          </div>
                        ) : (
                          availableContracts.length > 1 && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>
                              <i className='bx bx-buildings'></i> Multi-Company: {availableContracts.length} Entities
                            </div>
                          )
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div>
                          <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>Contract Value</label>
                          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>{Number(contractValue).toLocaleString('en-US', { maximumFractionDigits: 2 })} {currency}</div>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>Currency</label>
                          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>{currency}</div>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>Value in USD</label>
                          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#10b981' }}>${Number(amountInUSD).toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>Plan Term</label>
                          <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>{termDisplay}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Contract Scope & Master Billing Frequency Bar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#ffffff',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  flexWrap: 'wrap',
                  gap: '0.6rem'
                }}>
                  {/* Multi-Contract Schedule Mode Switcher */}
                  {availableContracts.length > 1 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <i className='bx bx-git-branch' style={{ color: '#0284c7' }}></i>
                        Contract Schedule:
                      </span>
                      <div style={{ display: 'inline-flex', background: '#e2e8f0', padding: '2px', borderRadius: '6px', gap: '2px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentTermError('');
                            setContractScope('all_separate');
                            setSeparateTerms(prev => {
                              const next = { ...prev };
                              availableContracts.forEach(c => {
                                if (next[c.id] === undefined) {
                                  next[c.id] = formData.paymentTerms || '1';
                                }
                              });
                              return next;
                            });
                          }}
                          style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '5px',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            background: contractScope === 'all_separate' ? '#ffffff' : 'transparent',
                            color: contractScope === 'all_separate' ? '#0284c7' : '#64748b',
                            boxShadow: contractScope === 'all_separate' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                          }}
                        >
                          Different Schedule for each Contract
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentTermError('');
                            setContractScope('all_combined');
                          }}
                          style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '5px',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            background: contractScope === 'all_combined' ? '#ffffff' : 'transparent',
                            color: contractScope === 'all_combined' ? '#0284c7' : '#64748b',
                            boxShadow: contractScope === 'all_combined' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                          }}
                        >
                          Same for all Contracts
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <i className='bx bx-calendar' style={{ color: '#0284c7' }}></i>
                      Schedule Configuration
                    </div>
                  )}

                  {/* Master Frequency Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <i className='bx bx-calendar-event' style={{ color: '#0284c7' }}></i>
                      Billing Frequency:
                    </span>
                    <select
                      value={billingFrequency}
                      onChange={(e) => handleFrequencyChange(e.target.value)}
                      style={{
                        padding: '0.25rem 0.55rem',
                        borderRadius: '6px',
                        border: '1.5px solid #0284c7',
                        background: '#ffffff',
                        color: '#0369a1',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Bi Anually">Bi Anually</option>
                    </select>

                    <span style={{
                      fontSize: '0.73rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      fontWeight: '600',
                      border: '1px solid',
                      background: billingFrequency === 'Bi Anually' ? '#f0fdf4' : (billingFrequency === 'Quarterly' ? '#faf5ff' : '#eff6ff'),
                      color: billingFrequency === 'Bi Anually' ? '#16a34a' : (billingFrequency === 'Quarterly' ? '#7c3aed' : '#2563eb'),
                      borderColor: billingFrequency === 'Bi Anually' ? '#bbf7d0' : (billingFrequency === 'Quarterly' ? '#e9d5ff' : '#bfdbfe')
                    }}>
                      {billingFrequency === 'Bi Anually' && 'Bi Anually: Billing Month = 2'}
                      {billingFrequency === 'Monthly' && `Monthly: Billing Month = ${maxPaymentTerms || 12} (${maxPaymentTerms || 12} mo diff)`}
                      {billingFrequency === 'Quarterly' && `Quarterly: Billing Month = ${getFrequencyMonths('Quarterly', maxPaymentTerms)} (Max 4)`}
                    </span>
                  </div>
                </div>

                {/* 3. Billing Month per Contract - In a TABLE */}
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', color: '#334155' }}>
                        <th style={{ padding: '0.65rem 0.85rem', fontWeight: '700' }}>Entity / Contract Name</th>
                        <th style={{ padding: '0.65rem 0.85rem', fontWeight: '700' }}>Contract Value</th>
                        <th style={{ padding: '0.65rem 0.85rem', fontWeight: '700' }}>Billing Frequency</th>
                        <th style={{ padding: '0.65rem 0.85rem', fontWeight: '700' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                            Billing Month <span style={{ color: '#ef4444', marginRight: '2px' }}>*</span>
                            <Tooltip text="This will break the total value in the entered months" />
                          </span>
                        </th>
                        <th style={{ padding: '0.65rem 0.85rem', fontWeight: '700', textAlign: 'right' }}>Per Month / Installment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contractsList.map((c, idx) => {
                        const cVal = Number(c.contractValue) || Number(c.amountInUSD) || 0;
                        const cCurr = c.contractCurrency || currency || 'USD';
                        const isSeparate = availableContracts.length > 1 && contractScope === 'all_separate';
                        const termsVal = isSeparate
                          ? (separateTerms[c.id] !== undefined ? separateTerms[c.id] : (formData.paymentTerms || '1'))
                          : (formData.paymentTerms || '1');
                        const months = Number(termsVal) || 1;
                        const perMonthVal = Number((cVal / months).toFixed(2));
                        const currentFreq = (isSeparate && contractFrequencies[c.id]) || billingFrequency;

                        return (
                          <tr key={c.id || idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                            <td style={{ padding: '0.65rem 0.85rem', verticalAlign: 'middle' }}>
                              <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.84rem' }}>{c.companyName}</strong>
                              {c.taxDetails ? (
                                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.taxDetails}</span>
                              ) : (
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Contract ID: {c.id}</span>
                              )}
                            </td>
                            <td style={{ padding: '0.65rem 0.85rem', verticalAlign: 'middle', fontWeight: '700', color: '#0284c7' }}>
                              {cCurr} {Number(cVal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td style={{ padding: '0.65rem 0.85rem', verticalAlign: 'middle' }}>
                              {isSeparate ? (
                                <select
                                  value={currentFreq}
                                  onChange={(e) => handleContractFrequencyChange(c.id, e.target.value)}
                                  style={{
                                    padding: '0.25rem 0.45rem',
                                    borderRadius: '5px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.78rem',
                                    color: '#0369a1',
                                    background: '#ffffff',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="Monthly">Monthly</option>
                                  <option value="Quarterly">Quarterly</option>
                                  <option value="Bi Anually">Bi Anually</option>
                                </select>
                              ) : (
                                <span style={{ fontSize: '0.78rem', fontWeight: '600', color: '#475569', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                  {billingFrequency}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.65rem 0.85rem', verticalAlign: 'middle' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                <input 
                                  type="number"
                                  min="1"
                                  max={maxPaymentTerms || undefined}
                                  value={termsVal}
                                  onChange={(e) => {
                                    setPaymentTermError('');
                                    const val = e.target.value;
                                    if (maxPaymentTerms > 0 && Number(val) > maxPaymentTerms) {
                                      if (isSeparate) {
                                        setSeparateTerms(prev => ({ ...prev, [c.id]: maxPaymentTerms }));
                                      } else {
                                        setFormData(prev => ({ ...prev, paymentTerms: String(maxPaymentTerms) }));
                                      }
                                      setPaymentTermError(`Cannot exceed Plan Term (${maxPaymentTerms} months)`);
                                    } else {
                                      if (isSeparate) {
                                        setSeparateTerms(prev => ({ ...prev, [c.id]: val }));
                                      } else {
                                        setFormData(prev => ({ ...prev, paymentTerms: val }));
                                      }
                                    }
                                  }}
                                  placeholder={maxPaymentTerms > 0 ? `Max ${maxPaymentTerms}` : "e.g. 6"}
                                  style={{
                                    width: '70px',
                                    padding: '0.35rem 0.5rem',
                                    borderRadius: '6px',
                                    border: '1.5px solid #cbd5e1',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    color: '#0f172a',
                                    textAlign: 'center',
                                    boxSizing: 'border-box'
                                  }}
                                />
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>mo</span>
                              </div>
                            </td>
                            <td style={{ padding: '0.65rem 0.85rem', verticalAlign: 'middle', textAlign: 'right' }}>
                              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#059669' }}>
                                {cCurr} {Number(perMonthVal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                {months} {months === 1 ? 'installment' : 'installments'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0', fontWeight: '700', color: '#334155' }}>
                        <td style={{ padding: '0.65rem 0.85rem' }}>
                          Total: {contractsList.length} {contractsList.length === 1 ? 'Entity' : 'Entities'}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', color: '#0284c7' }}>
                          {currency} {Number(contractValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td colSpan="2" style={{ padding: '0.65rem 0.85rem' }}>
                          <span style={{ fontSize: '0.78rem', color: '#0284c7', background: '#eff6ff', padding: '0.2rem 0.55rem', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                            {contractsList.reduce((sum, c) => {
                              const isSep = availableContracts.length > 1 && contractScope === 'all_separate';
                              const m = Number(isSep ? (separateTerms[c.id] !== undefined ? separateTerms[c.id] : (formData.paymentTerms || 1)) : (formData.paymentTerms || 1)) || 1;
                              return sum + m;
                            }, 0)} Total Scheduled Invoices
                          </span>
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontSize: '0.78rem', color: '#64748b' }}>
                          Auto-calculated
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {paymentTermError && (
                  <div style={{ color: '#ef4444', fontSize: '0.8rem', padding: '0.5rem 0.75rem', background: '#fef2f2', borderRadius: '6px', border: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <i className='bx bx-error-circle'></i> {paymentTermError}
                  </div>
                )}

                {/* Step 2 Footer Buttons: Back | Preview Schedule (plus Direct Save) - Cancel removed */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                  <button 
                    type="button"
                    onClick={() => setStep(1)} 
                    style={{ 
                      padding: '0.55rem 1.25rem', 
                      background: '#ffffff', 
                      color: '#475569', 
                      border: '1.5px solid #cbd5e1', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      fontWeight: '600', 
                      fontSize: '0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <i className='bx bx-left-arrow-alt' style={{ fontSize: '1.1rem' }}></i> Back
                  </button>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button 
                      type="button"
                      onClick={handleSaveDirect} 
                      style={{ 
                        padding: '0.55rem 1.15rem', 
                        background: '#f8fafc', 
                        color: '#475569', 
                        border: '1px solid #cbd5e1', 
                        borderRadius: '6px', 
                        cursor: 'pointer', 
                        fontWeight: '600', 
                        fontSize: '0.85rem' 
                      }}
                      title="Save schedule directly without opening full preview"
                    >
                      Direct Save
                    </button>

                    <button 
                      type="button"
                      onClick={handlePreview} 
                      style={{ 
                        padding: '0.55rem 1.45rem', 
                        background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer', 
                        fontWeight: '600', 
                        fontSize: '0.85rem',
                        boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <i className='bx bx-show'></i> Preview Schedule
                    </button>
                  </div>
                </div>

              </div>
            );
          })()}
        </div>
      </div>
      {renderDuplicateWarningModal()}
    </div>
  );
}

export default AddScheduleModal;
