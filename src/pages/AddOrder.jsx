import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import BillingDetailsModal from '../components/BillingDetailsModal';
import DocumentUploadModal from '../components/DocumentUploadModal';
import PaymentSummaryModal from '../components/PaymentSummaryModal';
import PaymentScheduleModal from '../components/PaymentScheduleModal';
import AddExpenseModal from '../components/AddExpenseModal';
import ViewExpensesModal from '../components/ViewExpensesModal';

function AddOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, expenses, updateExpense } = useGlobal();
  const isEditMode = location.state?.edit === true;
  const tempSessionId = useRef(`temp_${Date.now()}`).current;
  
  const [formData, setFormData] = useState({
    contractDetails: {
      product: '',
      sessionLimits: '',
      isSessionUnlimited: false,
      documents: [],
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

    if (isEditMode && location.state?.orderId) {
      const saved = localStorage.getItem('division_orders');
      if (saved) {
        const orders = JSON.parse(saved);
        const order = orders.find(o => o.id === location.state.orderId);
        if (order && order.contractDetails) {
          setFormData(order);
        }
      }
    }
  }, [isEditMode, location.state]);

  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isPaymentSummaryOpen, setIsPaymentSummaryOpen] = useState(false);
  const [isPaymentScheduleOpen, setIsPaymentScheduleOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isViewExpensesModalOpen, setIsViewExpensesModalOpen] = useState(false);
  const [editExpenseData, setEditExpenseData] = useState(null);
  const [paymentDueBadge, setPaymentDueBadge] = useState(null);

  // Calculate Payment Due from stored payments filtered by this orderId
  useEffect(() => {
    const orderId = location.state?.orderId;
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
  }, [location.state?.orderId, formData.billingDetails, formData.amount]);
  
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
  
  const removeDocument = (id) => {
    setFormData(prev => ({
      ...prev,
      contractDetails: {
        ...prev.contractDetails,
        documents: prev.contractDetails.documents.filter(doc => doc.id !== id)
      }
    }));
  };

  const [expandedSections, setExpandedSections] = useState({
    contractDetails: false,
    planSchedule: true,
    details: true,
    addOns: true,
    appConfig: true,
    accessSecurity: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', background: '#f1f5f9', minHeight: '100vh' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#64748b', marginRight: '1rem' }}
        >
          <i className='bx bx-arrow-back'></i>
        </button>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>{isEditMode ? 'Edit Order' : 'Add Order'}</h1>
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
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsPaymentScheduleOpen(true);
              }}
              style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.4rem 0.75rem', color: '#0f172a', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
              onMouseLeave={(e) => e.target.style.background = 'white'}
            >
              <i className='bx bx-calendar'></i> View Payment Schedule
            </button>
          </div>

          <i className={`bx bx-chevron-${expandedSections.contractDetails ? 'up' : 'down'}`} style={{ fontSize: '1.5rem', color: '#94a3b8' }}></i>
        </div>
        
        {expandedSections.contractDetails && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Product <span style={{color: '#ef4444'}}>*</span></label>
            <input 
              type="text" 
              placeholder="e.g. EAP;Listener" 
              style={inputStyle} 
              value={formData.contractDetails.product} 
              onChange={e => setFormData({...formData, contractDetails: {...formData.contractDetails, product: e.target.value}})} 
            />
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>Separate products by ";"</p>
            {formData.contractDetails.product.trim() && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {formData.contractDetails.product.split(';').map((prod, idx) => prod.trim() ? (
                  <span key={idx} style={{ background: '#e0f2fe', color: '#0284c7', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid #bae6fd' }}>
                    {prod.trim()}
                  </span>
                ) : null)}
              </div>
            )}
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{...labelStyle, marginBottom: 0}}>Overall session limits <span style={{color: '#ef4444'}}>*</span></label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#0f172a', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={formData.contractDetails.isSessionUnlimited} 
                  onChange={e => setFormData({...formData, contractDetails: {...formData.contractDetails, isSessionUnlimited: e.target.checked}})} 
                />
                Unlimited
              </label>
            </div>
            <input 
              type="number" 
              placeholder="Check the box if Unlimited" 
              style={{...inputStyle, backgroundColor: formData.contractDetails.isSessionUnlimited ? '#f1f5f9' : 'white'}} 
              disabled={formData.contractDetails.isSessionUnlimited}
              value={formData.contractDetails.isSessionUnlimited ? ((formData.contractDetails.product.split(';').filter(p => p.trim()).length) * 48 * (parseInt(formData.employees) || 0)) : formData.contractDetails.sessionLimits} 
              onChange={e => setFormData({...formData, contractDetails: {...formData.contractDetails, sessionLimits: e.target.value}})} 
            />
          </div>
          <div>
            <label style={labelStyle}>No of Employees <span style={{color: '#ef4444'}}>*</span></label>
            <input type="number" style={inputStyle} value={formData.employees} onChange={e => {
              let val = e.target.value;
              if (val.length > 1 && val.startsWith('0')) {
                val = val.replace(/^0+/, '');
              }
              setFormData({...formData, employees: val});
            }} placeholder="e.g. 100" />
          </div>
          <div>
            <label style={labelStyle}>Billing Details <span style={{color: '#ef4444'}}>*</span></label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                onClick={() => setIsBillingModalOpen(true)}
                style={{ 
                  flex: 1, padding: '0.6rem', background: '#0ea5e9', color: 'white', 
                  border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' 
                }}
              >
                {formData.billingDetails ? 'Edit Billing Details' : 'Add Billing Details'}
              </button>
              {formData.billingDetails && (
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a' }}>
                  ${formData.amount}
                </div>
              )}
            </div>
          </div>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{...labelStyle, marginBottom: 0}}>Documents <span style={{color: '#ef4444'}}>*</span></label>
              <button 
                onClick={() => setIsDocModalOpen(true)}
                style={{ padding: '0.4rem 0.8rem', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '500' }}
              >
                <i className='bx bx-plus' style={{ marginRight: '0.25rem' }}></i>Upload Document
              </button>
            </div>
            
            {(!formData.contractDetails.documents || formData.contractDetails.documents.length === 0) && (
              <div style={{ width: '100%', padding: '1.5rem', border: '1px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', background: '#f8fafc', color: '#94a3b8', fontSize: '0.85rem' }}>
                No documents uploaded yet.
              </div>
            )}
            
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
            <input type="date" style={inputStyle} value={formData.planStart} onChange={e => setFormData({...formData, planStart: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>Plan End</label>
            <input type="date" style={inputStyle} value={formData.planEnd} onChange={e => setFormData({...formData, planEnd: e.target.value})} />
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

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', marginBottom: '2rem', gap: '1rem' }}>
        <button 
          onClick={() => setIsViewExpensesModalOpen(true)}
          className="btn-outline" 
          style={{ padding: '0.6rem 1.5rem', background: 'white', color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: '6px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <i className='bx bx-list-ul'></i> View Expenses
        </button>
        
        <button 
          onClick={() => {
            setEditExpenseData(null);
            setIsAddExpenseModalOpen(true);
          }}
          className="btn-outline" 
          style={{ padding: '0.6rem 1.5rem', background: 'white', color: '#10b981', border: '1px solid #10b981', borderRadius: '6px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <i className='bx bx-plus'></i> Add Expenses
        </button>

        <button 
          onClick={() => {
            const saved = localStorage.getItem('division_orders');
            let orders = saved ? JSON.parse(saved) : [];

            if (isEditMode) {
              orders = orders.map(o => o.id === location.state.orderId ? { ...o, ...formData, id: location.state.orderId, status: o.status || 'Active' } : o);
              showToast('Order Updated!', 5000);
            } else {
              const newOrderId = Date.now();
              const newOrder = { 
                ...formData, 
                id: newOrderId, 
                status: 'Active',
                divisionName: location.state?.divisionName || '',
                clientName: location.state?.clientName || '',
                divisionId: location.state?.divisionId || ''
              };
              orders.push(newOrder);

              // Link any expenses added during this session to the new order
              const sessionExpenses = expenses.filter(e => e.orderId === tempSessionId);
              sessionExpenses.forEach(exp => {
                updateExpense(exp.id, { orderId: newOrderId });
              });

              showToast('Order Created!', 5000);
            }
            
            localStorage.setItem('division_orders', JSON.stringify(orders));
            navigate(-1);
          }}
          className="btn-primary" 
          style={{ padding: '0.6rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' }}
        >
          {isEditMode ? 'Save Changes' : 'Create Order'}
        </button>
      </div>

      {/* Modals */}
      <BillingDetailsModal 
        isOpen={isBillingModalOpen} 
        onClose={() => setIsBillingModalOpen(false)} 
        initialData={formData.billingDetails || {}}
        onSave={(data) => {
          setFormData(prev => ({
            ...prev, 
            billingDetails: data,
            amount: data.amountInUSD // sync amount
          }));
        }} 
      />
      <DocumentUploadModal 
        isOpen={isDocModalOpen} 
        onClose={() => setIsDocModalOpen(false)} 
        onSave={addDocument} 
      />
      <PaymentSummaryModal
        isOpen={isPaymentSummaryOpen}
        onClose={() => setIsPaymentSummaryOpen(false)}
        contractValue={formData.billingDetails?.amountInUSD || formData.amount}
        orderId={location.state?.orderId}
      />
      <PaymentScheduleModal
        isOpen={isPaymentScheduleOpen}
        onClose={() => setIsPaymentScheduleOpen(false)}
        orderId={location.state?.orderId}
      />
      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        orderId={location.state?.orderId || tempSessionId}
        clientName={location.state?.clientName || formData.billingDetails?.billFrom || formData.appConfig?.domain || 'Current Order'}
        editExpenseData={editExpenseData}
      />
      <ViewExpensesModal
        isOpen={isViewExpensesModalOpen}
        onClose={() => setIsViewExpensesModalOpen(false)}
        orderId={location.state?.orderId || tempSessionId}
        orderName={`${location.state?.divisionName || formData.divisionName || 'Unknown'} | ${formData.planStart} - ${formData.plan}`}
        onEditExpense={(expense) => {
          setIsViewExpensesModalOpen(false);
          setEditExpenseData(expense);
          setIsAddExpenseModalOpen(true);
        }}
      />
    </main>
  );
}

export default AddOrder;
