import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal, GlobalContext } from '../context/GlobalContext';

function AddScheduleModal({ isOpen, onClose, onSave, mode = 'schedule', initialSelection = null }) {
  const navigate = useNavigate();
  const { globalData } = useContext(GlobalContext);

  const [formData, setFormData] = useState({
    corporate: '',
    division: '',
    orderName: '',
    paymentTerms: '',
    amount: ''
  });
  const [paymentTermError, setPaymentTermError] = useState('');
  
  const [corporates, setCorporates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [orders, setOrders] = useState([]);
  
  const [isCorpDropdownOpen, setIsCorpDropdownOpen] = useState(false);
  const [corpSearch, setCorpSearch] = useState('');
  
  const [isDivDropdownOpen, setIsDivDropdownOpen] = useState(false);
  const [divSearch, setDivSearch] = useState('');

  const { clients: globalClients } = useGlobal();

  // Load clients and orders from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      // 1. Load Corporates from GlobalContext
      const safeClients = Array.isArray(globalClients) ? globalClients : [];
      let uniqueCorps = [...new Set(safeClients.map(c => c?.name || c?.clientName).filter(Boolean))];

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
            if (cName && !uniqueCorps.includes(cName)) {
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
        const selCorp = initialSelection.corporate || initialSelection.clientName || '';
        const selDiv = initialSelection.division || initialSelection.divisionName || '';
        let selOrderName = initialSelection.orderName || '';

        // If orderId is passed but not orderName, find matching order
        if (initialSelection.orderId && !selOrderName) {
          const matched = loadedOrders.find(o => String(o.id) === String(initialSelection.orderId));
          if (matched) {
            const ps = matched.planStart || 'Unknown Date';
            const pn = matched.plan || matched.planName || matched.product || `Order #${matched.id}`;
            selOrderName = `${ps} & ${pn}`;
          }
        }

        setFormData(prev => ({
          ...prev,
          corporate: selCorp || prev.corporate,
          division: selDiv || prev.division,
          orderName: selOrderName || prev.orderName,
          paymentTerms: initialSelection.paymentTerms || prev.paymentTerms || '',
          amount: initialSelection.amount || prev.amount || ''
        }));
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

  // Dynamic % distribution & live schedule states
  const [pinnedPercentages, setPinnedPercentages] = useState({});
  const [tempPercentageInputs, setTempPercentageInputs] = useState({});
  const [customDates, setCustomDates] = useState({});
  const [customRemarks, setCustomRemarks] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setIsPreview(false);
      setPreviewInvoices([]);
      setHoveredSplitRow(null);
      setPinnedPercentages({});
      setTempPercentageInputs({});
      setCustomDates({});
      setCustomRemarks({});
    }
  }, [isOpen]);

  useEffect(() => {
    // When terms or order change, reset any pinned percentages
    setPinnedPercentages({});
    setTempPercentageInputs({});
    setCustomDates({});
  }, [formData.paymentTerms, formData.orderName]);

  if (!isOpen) return null;

  const filteredCorps = Array.isArray(corporates) ? corporates.filter(c => c && c.toLowerCase().includes(corpSearch.toLowerCase())) : [];
  const filteredDivs = Array.isArray(divisions) ? divisions.filter(d => d && d.toLowerCase().includes(divSearch.toLowerCase())) : [];
  
  const safeOrders = Array.isArray(orders) ? orders : [];
  const filteredOrders = safeOrders.filter(o => {
    const oCorp = o.corporate || o.clientName;
    const oDiv = o.division || o.divisionName;
    const matchCorp = !formData.corporate || !oCorp || oCorp === formData.corporate;
    const matchDiv = !formData.division || !oDiv || oDiv === formData.division;
    return matchCorp && matchDiv;
  });

  // Calculate currently selected order details for validation
  const selectedOrder = formData.orderName ? safeOrders.find(o => {
    const ps = o.planStart || 'Unknown Date';
    const pn = o.plan || o.planName || o.product || `Order #${o.id}`;
    const nameKey = `${ps} & ${pn}`;
    return nameKey === formData.orderName || String(o.id) === formData.orderName;
  }) : null;

  let maxPaymentTerms = 12; // Default flexible payment terms
  if (selectedOrder) {
    const planStart = selectedOrder.planStart || '';
    const planEnd = selectedOrder.planEnd || '';
    if (planStart && planEnd && planStart !== 'Unknown Date') {
      const d1 = new Date(planStart);
      const d2 = new Date(planEnd);
      if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
        const timeDiff = d2.getTime() - d1.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        const calculated = Math.round(daysDiff / 30.44);
        maxPaymentTerms = Math.max(1, calculated);
      }
    }
  }

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
    
    const terms = Number(formData.paymentTerms);
    if (!terms || terms <= 0) return [];

    const amountInUSD = Number(selectedOrder.billingDetails?.amountInUSD) || Number(selectedOrder.amount) || 0;
    const contractValue = Number(selectedOrder.billingDetails?.contractValue) || Number(selectedOrder.amount) || 0;
    const currency = selectedOrder.billingDetails?.clientCurrency || 'USD';
    const planStart = selectedOrder.planStart || '';
    const paymentDueDays = Number(selectedOrder.billingDetails?.paymentDue) || 30;

    const activeSplits = activeSplitsOverride || selectedOrder.billingDetails?.billingSplits?.filter(s => s.selected) || [];
    const hasMultiSplits = activeSplits.length > 1;

    const termSplits = recalculateSplits(terms, pinnedPercentages);
    const invoices = [];

    termSplits.forEach((termSplit, i) => {
      const termPct = termSplit.percentage;
      const termValue = Number(((contractValue * termPct) / 100).toFixed(2));
      const termUsd = Number(((amountInUSD * termPct) / 100).toFixed(2));

      const invoiceByDateStr = customDates[i]?.invoiceDate || getMonthlyDate(planStart, i);
      const dueByDateStr = customDates[i]?.dueByDate || getDueDate(invoiceByDateStr, paymentDueDays);

      if (hasMultiSplits) {
        let runningValSum = 0;
        let runningUsdSum = 0;

        activeSplits.forEach((split, sIdx) => {
          const compPct = Number(split.percentage) || 0;
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

          const remarkKey = `${i}-${split.companyName}`;
          const remarkVal = customRemarks[remarkKey] || customRemarks[i] || '';

          invoices.push({
            id: `INV-${Date.now()}-${i}-${sIdx}`,
            installmentNumber: i + 1,
            termIndex: i + 1,
            totalTerms: terms,
            splitIndex: sIdx + 1,
            totalSplits: activeSplits.length,
            clientName: formData.corporate || 'Unknown',
            orderId: String(selectedOrder.id),
            billingCompany: split.companyName,
            clientBillingEntity: split.companyName,
            taxId: split.taxId || '',
            splitPercentage: compPct,
            termPercentage: termPct,
            billFrom: selectedOrder.billingDetails?.billFrom || 'Unknown',
            amountDueUsd: splitUsd,
            amountDue: splitVal,
            currency: currency,
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
          clientName: formData.corporate || 'Unknown',
          orderId: String(selectedOrder.id),
          billingCompany: entityName,
          clientBillingEntity: entityName,
          taxId: taxId,
          billFrom: selectedOrder.billingDetails?.billFrom || 'Unknown',
          splitPercentage: 100,
          termPercentage: termPct,
          amountDueUsd: termUsd,
          amountDue: termValue,
          currency: currency,
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

  const handlePreview = () => {
    if (mode === 'schedule') {
      if (formData.paymentTerms && maxPaymentTerms > 0 && Number(formData.paymentTerms) > maxPaymentTerms) {
        setPaymentTermError(`Cannot exceed Plan Term (${maxPaymentTerms} months)`);
        return;
      }
      if (!formData.paymentTerms) {
        setPaymentTermError('Payment terms are required');
        return;
      }
      const invoices = generateInvoices();
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
      if (formData.paymentTerms && maxPaymentTerms > 0 && Number(formData.paymentTerms) > maxPaymentTerms) {
        setPaymentTermError(`Cannot exceed Plan Term (${maxPaymentTerms} months)`);
        return;
      }
      if (!formData.paymentTerms) {
        setPaymentTermError('Payment terms are required');
        return;
      }
      const invoices = generateInvoices();
      onSave({ formData, selectedOrder, mode, invoices });
      onClose();
    }
  };

  const handleSave = () => {
    onSave({ formData, selectedOrder, mode, invoices: previewInvoices });
    onClose();
  };

  const inputStyle = {
    width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px',
    border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', boxSizing: 'border-box',
    fontFamily: 'inherit'
  };

  if (isPreview) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
        display: 'flex', justifyContent: 'center', alignItems: 'center'
      }}>
        <div style={{
          background: 'white', borderRadius: '8px', width: '94%', maxWidth: '880px',
          padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Invoice Schedule Preview</h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Review schedule details. Remarks entered here will be added to the invoice.
              </p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>
              &times;
            </button>
          </div>

          {/* Multi-Entity / Company Header Banner on top of schedule */}
          {(() => {
            const activeSplits = selectedOrder?.billingDetails?.billingSplits?.filter(s => s.selected) || [];
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

            if (selectedOrder?.billingDetails?.billingEntity) {
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
                  <strong style={{ color: '#0f172a' }}>{selectedOrder.billingDetails.billingEntity}</strong>
                  {selectedOrder.billingDetails.taxDetails && (
                    <span style={{ color: '#64748b', marginLeft: '0.4rem' }}>({selectedOrder.billingDetails.taxDetails})</span>
                  )}
                </div>
              );
            }
            return null;
          })()}
          
          <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem' }}>S.No</th>
                  <th style={{ padding: '0.5rem' }}>Billed Entity</th>
                  <th style={{ padding: '0.5rem' }}>Invoice By Date</th>
                  <th style={{ padding: '0.5rem' }}>Due Date</th>
                  <th style={{ padding: '0.5rem' }}>Amount ({selectedOrder?.billingDetails?.clientCurrency || 'USD'})</th>
                  <th style={{ padding: '0.5rem' }}>Amount (USD)</th>
                  <th style={{ padding: '0.5rem', minWidth: '180px' }}>
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

                  return (
                    <tr 
                      key={inv.id || idx} 
                      style={{ 
                        background: rowBg,
                        borderBottom: isLastSplitInTerm ? '2px solid #cbd5e1' : '1px solid #f1f5f9' 
                      }}
                    >
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
                      <td style={{ padding: '0.6rem 0.5rem', color: '#334155', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                        {inv.invoiceByDate}
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem', color: '#334155', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                        {inv.dueByDate}
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem', color: '#0f172a', fontWeight: '700', whiteSpace: 'nowrap' }}>
                        {Number(inv.amountDue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem', color: '#059669', fontWeight: '700', whiteSpace: 'nowrap' }}>
                        ${Number(inv.amountDueUsd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button onClick={() => setIsPreview(false)} style={{ padding: '0.5rem 1rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
              Back
            </button>
            <button onClick={handleSave} style={{ padding: '0.5rem 1rem', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
              Add Schedule
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        background: 'white', 
        borderRadius: '12px', 
        width: '95%', 
        maxWidth: (selectedOrder && Number(formData.paymentTerms) > 0) ? '960px' : '520px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '1.5rem', 
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
        transition: 'max-width 0.25s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '700' }}>
              {mode === 'row' ? 'Add Row' : 'Add Invoice Schedule'}
            </h2>
            {selectedOrder && Number(formData.paymentTerms) > 0 && (
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Configure installments, dates, and split percentages with live auto-preview.
              </p>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>
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
                        setFormData(prev => ({ ...prev, corporate: corp, division: '', orderName: '', paymentTerms: '', amount: '' })); 
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
                        setFormData(prev => ({ ...prev, division: div, orderName: '', paymentTerms: '', amount: '' })); 
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
              style={{ ...inputStyle, color: formData.orderName ? '#0f172a' : '#64748b', background: formData.division ? 'white' : '#f1f5f9' }}
              value={formData.orderName}
              onChange={(e) => setFormData(prev => ({ ...prev, orderName: e.target.value }))}
              disabled={!formData.division}
            >
              <option value="" disabled hidden>Select Order</option>
              {filteredOrders.map(o => {
                const planStart = o.planStart || 'Unknown Date';
                const planName = o.plan || o.planName || o.product || `Order #${o.id}`;
                const isDraft = o.status === 'Draft';
                const statusTag = isDraft ? ' — [Draft: Ready to Bill]' : '';
                return (
                  <option key={o.id} value={`${planStart} & ${planName}`}>
                    {planStart} & {planName}{statusTag}
                  </option>
                );
              })}
            </select>

            {formData.division && filteredOrders.length === 0 && (
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

          {selectedOrder && (() => {
            const contractValue = Number(selectedOrder.billingDetails?.contractValue) || Number(selectedOrder.amount) || 0;
            const currency = selectedOrder.billingDetails?.clientCurrency || 'USD';
            const amountInUSD = Number(selectedOrder.billingDetails?.amountInUSD) || Number(selectedOrder.amount) || 0;
            const planStart = selectedOrder.planStart || '';
            const planEnd = selectedOrder.planEnd || '';
            
            const termDisplay = maxPaymentTerms > 0 
              ? `${maxPaymentTerms} Months (${planStart || 'Start'} to ${planEnd || 'Ongoing'})`
              : (planStart ? `${planStart} to ${planEnd || 'Ongoing'}` : 'Open Term');

            return (
              <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                
                {selectedOrder.status === 'Draft' && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', width: 'fit-content' }}>
                    <i className='bx bx-edit-alt'></i> Draft Order • Billing Details Configured
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Contract Value</label>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>{Number(contractValue).toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Currency</label>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>{currency}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Contract Value (USD)</label>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#10b981' }}>${Number(amountInUSD).toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.1rem' }}>Plan Term</label>
                    <div style={{ fontSize: '0.82rem', color: '#334155' }}>{termDisplay}</div>
                  </div>
                  {selectedOrder.billingDetails?.billingSplits?.filter(s => s.selected)?.length > 1 && (
                    <div style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#1e40af', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
                      Multi-Company: {selectedOrder.billingDetails.billingSplits.filter(s => s.selected).length} Entities
                    </div>
                  )}
                </div>
                
              </div>
            );
          })()}

          {mode === 'schedule' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', margin: 0 }}>
                  Payment Terms (Installments) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                {formData.paymentTerms && Number(formData.paymentTerms) > 0 && (
                  <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: '600' }}>
                    Monthly Back-to-Back Billing
                  </span>
                )}
              </div>
              <input 
                type="number"
                style={{ ...inputStyle, borderColor: paymentTermError ? '#ef4444' : '#cbd5e1' }}
                placeholder={maxPaymentTerms > 0 ? `Max ${maxPaymentTerms} installments (e.g. 6)` : "e.g. 6"}
                min="1"
                max={maxPaymentTerms || undefined}
                value={formData.paymentTerms}
                onChange={(e) => {
                  setPaymentTermError('');
                  const val = e.target.value;
                  if (maxPaymentTerms > 0 && Number(val) > maxPaymentTerms) {
                    setFormData(prev => ({ ...prev, paymentTerms: maxPaymentTerms }));
                    setPaymentTermError(`Cannot exceed Plan Term (${maxPaymentTerms} months)`);
                  } else {
                    setFormData(prev => ({ ...prev, paymentTerms: val }));
                  }
                }}
              />
              {paymentTermError && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{paymentTermError}</div>}
            </div>
          ) : (
            <div>
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

          {/* --- LIVE AUTO PREVIEW SCHEDULE TABLE WITH DYNAMIC PERCENTAGE REBALANCING --- */}
          {mode === 'schedule' && selectedOrder && Number(formData.paymentTerms) > 0 && (() => {
            const termsCount = Number(formData.paymentTerms);
            const splits = recalculateSplits(termsCount, pinnedPercentages);
            const contractValue = Number(selectedOrder.billingDetails?.contractValue) || Number(selectedOrder.amount) || 0;
            const amountInUSD = Number(selectedOrder.billingDetails?.amountInUSD) || Number(selectedOrder.amount) || 0;
            const currency = selectedOrder.billingDetails?.clientCurrency || 'USD';
            const planStart = selectedOrder.planStart || '';
            const paymentDueDays = Number(selectedOrder.billingDetails?.paymentDue) || 30;
            const activeSplits = selectedOrder.billingDetails?.billingSplits?.filter(s => s.selected) || [];
            const hasMultiSplits = activeSplits.length > 1;

            const hasPinned = Object.keys(pinnedPercentages).length > 0;

            return (
              <div style={{
                marginTop: '0.5rem',
                background: '#ffffff',
                border: '1px solid #bae6fd',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.08)'
              }}>
                {/* Auto Preview Header Bar */}
                <div style={{
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(to right, #f0f9ff, #f8fafc)',
                  borderBottom: '1px solid #e0f2fe',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <i className='bx bx-calendar-star' style={{ fontSize: '1.2rem', color: '#0284c7' }}></i>
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: '#0369a1' }}>
                        Schedule Auto-Preview ({termsCount} Back-to-Back Monthly Invoices)
                      </strong>
                      <span style={{ fontSize: '0.73rem', color: '#64748b', marginLeft: '0.5rem' }}>
                        Edit % on any invoice & click ✓ to auto-balance remaining
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {hasPinned && (
                      <button
                        type="button"
                        onClick={() => {
                          setPinnedPercentages({});
                          setTempPercentageInputs({});
                        }}
                        style={{
                          padding: '0.25rem 0.65rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '5px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#475569',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                        title="Reset all invoices back to equal distribution"
                      >
                        <i className='bx bx-reset'></i> Reset to Equal Split
                      </button>
                    )}
                    <span style={{
                      background: '#dcfce7',
                      color: '#15803d',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      border: '1px solid #bbf7d0'
                    }}>
                      Total: 100% • {currency} {contractValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Table Body */}
                <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <th style={{ padding: '0.55rem 0.65rem' }}>Invoice #</th>
                        <th style={{ padding: '0.55rem 0.65rem' }}>Invoice By Date</th>
                        <th style={{ padding: '0.55rem 0.65rem' }}>Due Date</th>
                        <th style={{ padding: '0.55rem 0.65rem', minWidth: '155px' }}>Share (%)</th>
                        <th style={{ padding: '0.55rem 0.65rem' }}>Amount ({currency})</th>
                        <th style={{ padding: '0.55rem 0.65rem' }}>Amount (USD)</th>
                        <th style={{ padding: '0.55rem 0.65rem', minWidth: '160px' }}>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {splits.map((split, idx) => {
                        const invDate = customDates[idx]?.invoiceDate || getMonthlyDate(planStart, idx);
                        const dueDate = customDates[idx]?.dueByDate || getDueDate(invDate, paymentDueDays);
                        const termAmt = Number(((contractValue * split.percentage) / 100).toFixed(2));
                        const termUsd = Number(((amountInUSD * split.percentage) / 100).toFixed(2));

                        const isPinned = split.isPinned;
                        const tempVal = tempPercentageInputs[idx];
                        const isDirty = tempVal !== undefined && Number(tempVal) !== split.percentage;
                        const displayVal = tempVal !== undefined ? tempVal : split.percentage;

                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                            <td style={{ padding: '0.55rem 0.65rem', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span>Invoice #{idx + 1}</span>
                                {isPinned && (
                                  <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: '700' }}>
                                    PINNED
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Invoice Date */}
                            <td style={{ padding: '0.45rem 0.65rem' }}>
                              <input 
                                type="date"
                                value={invDate}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const newDue = getDueDate(val, paymentDueDays);
                                  setCustomDates(prev => ({
                                    ...prev,
                                    [idx]: { ...(prev[idx] || {}), invoiceDate: val, dueByDate: newDue }
                                  }));
                                }}
                                style={{ padding: '0.3rem 0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '0.8rem', color: '#0f172a' }}
                              />
                            </td>

                            {/* Due Date */}
                            <td style={{ padding: '0.45rem 0.65rem' }}>
                              <input 
                                type="date"
                                value={dueDate}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCustomDates(prev => ({
                                    ...prev,
                                    [idx]: { ...(prev[idx] || {}), dueByDate: val }
                                  }));
                                }}
                                style={{ padding: '0.3rem 0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '0.8rem', color: '#0f172a' }}
                              />
                            </td>

                            {/* Percentage Control */}
                            <td style={{ padding: '0.45rem 0.65rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <div style={{ position: 'relative', width: '78px' }}>
                                  <input 
                                    type="number"
                                    step="0.01"
                                    min="0.1"
                                    max="99.9"
                                    value={displayVal}
                                    onChange={(e) => {
                                      setTempPercentageInputs(prev => ({ ...prev, [idx]: e.target.value }));
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        confirmPercentage(idx, displayVal, termsCount);
                                      }
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: '0.32rem 0.45rem',
                                      borderRadius: '5px',
                                      border: isPinned ? '1.5px solid #2563eb' : (isDirty ? '1.5px solid #f59e0b' : '1px solid #cbd5e1'),
                                      background: isPinned ? '#eff6ff' : '#ffffff',
                                      fontWeight: isPinned ? '700' : '600',
                                      color: isPinned ? '#1d4ed8' : '#0f172a',
                                      fontSize: '0.82rem',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                </div>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>%</span>

                                {/* Confirm Tick Button */}
                                {isDirty && (
                                  <button
                                    type="button"
                                    onClick={() => confirmPercentage(idx, displayVal, termsCount)}
                                    style={{
                                      padding: '0.3rem 0.5rem',
                                      background: '#10b981',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.9rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      boxShadow: '0 1px 3px rgba(16, 185, 129, 0.3)'
                                    }}
                                    title="Confirm percentage & auto-adjust remaining"
                                  >
                                    <i className='bx bx-check'></i>
                                  </button>
                                )}

                                {/* Reset Button */}
                                {isPinned && !isDirty && (
                                  <button
                                    type="button"
                                    onClick={() => resetPercentage(idx)}
                                    style={{
                                      padding: '0.3rem 0.45rem',
                                      background: '#f1f5f9',
                                      color: '#64748b',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.85rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                    title="Reset this invoice to auto equal split"
                                  >
                                    <i className='bx bx-undo'></i>
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Amount ({currency}) */}
                            <td style={{ padding: '0.55rem 0.65rem', whiteSpace: 'nowrap' }}>
                              <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.85rem' }}>
                                {termAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              {hasMultiSplits && (
                                <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                                  {activeSplits.map((s, sIdx) => {
                                    const partAmt = ((termAmt * (Number(s.percentage) || 0)) / 100).toFixed(2);
                                    return (
                                      <span key={sIdx} style={{ fontSize: '0.68rem', background: '#f1f5f9', color: '#475569', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: '500' }}>
                                        {s.companyName}: {partAmt}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </td>

                            {/* Amount (USD) */}
                            <td style={{ padding: '0.55rem 0.65rem', color: '#059669', fontWeight: '700', whiteSpace: 'nowrap' }}>
                              ${termUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>

                            {/* Remarks */}
                            <td style={{ padding: '0.45rem 0.65rem' }}>
                              <input 
                                type="text"
                                placeholder={`Remarks for Invoice #${idx + 1}...`}
                                value={customRemarks[idx] || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCustomRemarks(prev => ({ ...prev, [idx]: val }));
                                }}
                                style={{
                                  width: '100%',
                                  padding: '0.35rem 0.55rem',
                                  borderRadius: '5px',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '0.8rem',
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
              </div>
            );
          })()}

        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
          <button 
            type="button"
            onClick={onClose} 
            style={{ padding: '0.55rem 1.15rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
          >
            Cancel
          </button>
          
          {mode === 'schedule' && selectedOrder && Number(formData.paymentTerms) > 0 && (
            <button 
              type="button"
              onClick={handlePreview} 
              style={{ padding: '0.55rem 1.15rem', background: '#ffffff', color: '#0284c7', border: '1px solid #0284c7', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
            >
              Full Preview
            </button>
          )}

          <button 
            type="button"
            onClick={mode === 'schedule' ? handleSaveDirect : handlePreview} 
            style={{ 
              padding: '0.55rem 1.35rem', 
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
              gap: '0.35rem'
            }}
          >
            <i className='bx bx-check'></i> {mode === 'row' ? 'Add Row' : 'Add Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddScheduleModal;
