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

  useEffect(() => {
    if (!isOpen) {
      setIsPreview(false);
      setPreviewInvoices([]);
    }
  }, [isOpen]);

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
        // Calculate the difference in days and divide by average days in a month (30.44)
        const timeDiff = d2.getTime() - d1.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        const calculated = Math.round(daysDiff / 30.44);
        maxPaymentTerms = Math.max(1, calculated);
      }
    }
  }

  const generateInvoices = () => {
    if (!selectedOrder) return [];
    
    const terms = Number(formData.paymentTerms);
    if (!terms || terms <= 0) return [];

    const amountInUSD = Number(selectedOrder.billingDetails?.amountInUSD) || Number(selectedOrder.amount) || 0;
    const contractValue = Number(selectedOrder.billingDetails?.contractValue) || Number(selectedOrder.amount) || 0;
    const currency = selectedOrder.billingDetails?.clientCurrency || 'USD';
    const planStart = selectedOrder.planStart || '';
    const planEnd = selectedOrder.planEnd || '';
    const paymentDueDays = Number(selectedOrder.billingDetails?.paymentDue) || 30;

    let startDate = new Date(planStart);
    if (isNaN(startDate.getTime())) startDate = new Date();
    
    let endDate = new Date(planEnd);
    if (isNaN(endDate.getTime())) endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000); // default 1 year

    const durationDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    const intervalDays = durationDays / terms;

    const usdPerTerm = amountInUSD / terms;
    const valuePerTerm = contractValue / terms;

    const invoices = [];
    for (let i = 0; i < terms; i++) {
      const invoiceDate = new Date(startDate.getTime() + i * intervalDays * 24 * 60 * 60 * 1000);
      const dueDate = new Date(invoiceDate.getTime() + paymentDueDays * 24 * 60 * 60 * 1000);
      
      invoices.push({
        id: `INV-${Date.now()}-${i}`,
        clientName: formData.corporate || 'Unknown',
        orderId: String(selectedOrder.id),
        billingCompany: selectedOrder.billingDetails?.billFrom || 'Unknown',
        amountDueUsd: usdPerTerm,
        amountDue: valuePerTerm,
        currency: currency,
        status: 'To be Raised',
        invoiceByDate: invoiceDate.toISOString().split('T')[0],
        dueByDate: dueDate.toISOString().split('T')[0],
        invoiceDate: '', // Will be set when actually raised
        totalPaid: 0,
        dueAmount: usdPerTerm,
        overdueDays: 0,
        remarks: ''
      });
    }
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
          background: 'white', borderRadius: '8px', width: '92%', maxWidth: '820px',
          padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
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
          
          <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem' }}>S.No</th>
                  <th style={{ padding: '0.5rem' }}>Invoice Date</th>
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
                {previewInvoices.map((inv, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.5rem', color: '#334155' }}>{idx + 1}</td>
                    <td style={{ padding: '0.5rem', color: '#334155', whiteSpace: 'nowrap' }}>{inv.invoiceByDate}</td>
                    <td style={{ padding: '0.5rem', color: '#334155', whiteSpace: 'nowrap' }}>{inv.dueByDate}</td>
                    <td style={{ padding: '0.5rem', color: '#334155', whiteSpace: 'nowrap' }}>{Number(inv.amountDue).toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: '0.5rem', color: '#10b981', fontWeight: '600', whiteSpace: 'nowrap' }}>${Number(inv.amountDueUsd).toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: '0.35rem 0.5rem' }}>
                      <input 
                        type="text" 
                        value={inv.remarks || ''} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setPreviewInvoices(prev => prev.map((item, i) => i === idx ? { ...item, remarks: val } : item));
                        }}
                        placeholder="Enter remarks..."
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
                ))}
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
        background: 'white', borderRadius: '8px', width: '90%', maxWidth: '500px',
        padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{mode === 'row' ? 'Add Row' : 'Add Schedule'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>
            &times;
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          
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
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                
                {selectedOrder.status === 'Draft' && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', width: 'fit-content' }}>
                    <i className='bx bx-edit-alt'></i> Draft Order • Billing Details Configured
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Contract Value</label>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a' }}>{Number(contractValue).toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Currency</label>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a' }}>{currency}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Contract Value (USD)</label>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#10b981' }}>${Number(amountInUSD).toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.75rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Plan Term</label>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>{termDisplay}</div>
                </div>
                
              </div>
            );
          })()}

          {mode === 'schedule' ? (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                Payment Terms (Installments) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                type="number"
                style={{ ...inputStyle, borderColor: paymentTermError ? '#ef4444' : '#cbd5e1' }}
                placeholder={maxPaymentTerms > 0 ? `Max ${maxPaymentTerms}` : "e.g. 12"}
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

        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={onClose} style={{ padding: '0.5rem 1rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
            Cancel
          </button>
          <button onClick={handlePreview} style={{ padding: '0.5rem 1rem', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
            {mode === 'row' ? 'Add Row' : 'Preview'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddScheduleModal;
