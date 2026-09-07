import React, { useState, useEffect, useContext } from 'react';
import { useGlobal, GlobalContext } from '../context/GlobalContext';

function AddScheduleModal({ isOpen, onClose, onSave, mode = 'schedule' }) {
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
      const uniqueCorps = [...new Set(globalClients.map(c => c.name).filter(Boolean))];
      setCorporates(uniqueCorps);

      // 2. Load Orders from localStorage (division_orders)
      try {
        const divisionOrdersStr = localStorage.getItem('division_orders');
        if (divisionOrdersStr) {
          const loadedOrders = JSON.parse(divisionOrdersStr);
          setOrders(loadedOrders);
        } else {
          // Fallback mock data for testing if no orders exist yet
          setOrders([
            { id: 101, corporate: 'First Client', division: 'Tech', planStart: '2024-01-01', planName: 'Enterprise EAP' },
            { id: 102, corporate: 'Second Client', division: 'HR', planStart: '2024-06-01', planName: 'Wellness Workshop' }
          ]);
        }
      } catch (e) {
        console.error("Failed to load orders", e);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    // Update divisions when corporate changes
    if (formData.corporate) {
      // Find the selected corporate in globalClients
      const matchedClient = globalClients.find(c => c.name === formData.corporate);
      const divs = [];
      if (matchedClient && matchedClient.divisionName) {
        divs.push(matchedClient.divisionName);
      }
      setDivisions(divs.length > 0 ? divs : ['Default Division']);
    } else {
      setDivisions([]);
    }
  }, [formData.corporate, globalClients]);

  if (!isOpen) return null;

  const filteredCorps = corporates.filter(c => c.toLowerCase().includes(corpSearch.toLowerCase()));
  const filteredDivs = divisions.filter(d => d.toLowerCase().includes(divSearch.toLowerCase()));
  
  const filteredOrders = orders.filter(o => {
    // If corporate/division is provided but the order doesn't have it, we still show it (assume global orders for now)
    // Or if it strictly matches.
    const matchCorp = !formData.corporate || !o.corporate || o.corporate === formData.corporate;
    const matchDiv = !formData.division || !o.division || o.division === formData.division;
    return matchCorp && matchDiv;
  });

  // Calculate currently selected order details for validation
  const selectedOrder = formData.orderName ? orders.find(o => {
    const ps = o.planStart || 'Unknown Date';
    const pn = o.plan || o.planName || o.product || `Order #${o.id}`;
    return `${ps} & ${pn}` === formData.orderName;
  }) : null;

  let maxPaymentTerms = 0;
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
        maxPaymentTerms = Math.round(daysDiff / 30.44);
        maxPaymentTerms = Math.max(1, maxPaymentTerms);
      }
    }
  }

  const handleSave = () => {
    if (mode === 'schedule') {
      if (formData.paymentTerms && maxPaymentTerms > 0 && Number(formData.paymentTerms) > maxPaymentTerms) {
        setPaymentTermError(`Cannot exceed Plan Term (${maxPaymentTerms} months)`);
        return;
      }
      if (!formData.paymentTerms) {
        setPaymentTermError('Payment terms are required');
        return;
      }
    } else {
      if (!formData.amount || Number(formData.amount) <= 0) {
        alert("Please provide a valid amount");
        return;
      }
    }
    onSave({ formData, selectedOrder, mode });
    onClose();
  };

  const inputStyle = {
    width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px',
    border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', boxSizing: 'border-box',
    fontFamily: 'inherit'
  };

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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
              Order Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
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
                return (
                  <option key={o.id} value={`${planStart} & ${planName}`}>
                    {planStart} & {planName}
                  </option>
                );
              })}
            </select>
          </div>

          {selectedOrder && (() => {
            const contractValue = Number(selectedOrder.billingDetails?.contractValue) || 0;
            const currency = selectedOrder.billingDetails?.clientCurrency || 'USD';
            const amountInUSD = Number(selectedOrder.billingDetails?.amountInUSD) || 0;
            const planStart = selectedOrder.planStart || '';
            const planEnd = selectedOrder.planEnd || '';
            
            const termDisplay = maxPaymentTerms > 0 
              ? `${maxPaymentTerms} Months (${planStart} to ${planEnd})`
              : (planStart ? `${planStart} to ${planEnd || 'N/A'}` : 'N/A');

            return (
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Contract Value</label>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a' }}>{contractValue.toLocaleString()}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Currency</label>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a' }}>{currency}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Contract Value (USD)</label>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#10b981' }}>${Number(amountInUSD).toLocaleString()}</div>
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
          <button onClick={handleSave} style={{ padding: '0.5rem 1rem', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
            {mode === 'row' ? 'Add Row' : 'Add Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddScheduleModal;
