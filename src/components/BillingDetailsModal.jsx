import React, { useState, useEffect } from 'react';

function BillingDetailsModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    billingEntity: 'HR Provided Entity', // Mock default or pass from props
    taxDetails: 'GST-1234', // Mock default
    contractValue: '',
    clientCurrency: '',
    currencyExchangeValue: '1',
    paymentDueDays: '',
    billFrom: '',
    receivingBankName: '',
    bankDetailsLink: ''
  });

  const [activeTab, setActiveTab] = useState('billing');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'SGD', name: 'Singapore Dollar' }
  ];

  const filteredCurrencies = currencies.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      let hrEntity = 'HR Provided Entity';
      let hrTax = 'GST-1234';
      
      try {
        // We look for 'onboardingFiled_1' (as used in ClientOnboardingWizard)
        // In a real app, this might dynamically depend on a division/client ID passed in
        const savedData = localStorage.getItem('onboardingFiled_1');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          if (parsedData.billingDetails) {
            hrEntity = parsedData.billingDetails.companyName || hrEntity;
            hrTax = parsedData.billingDetails.gstNumber || hrTax;
          }
        }
      } catch (e) {
        console.error("Could not parse onboarding data", e);
      }

      setFormData(prev => ({
        ...prev,
        ...initialData,
        billingEntity: initialData?.billingEntity || hrEntity,
        taxDetails: initialData?.taxDetails || hrTax
      }));
      setErrors({});
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Calculate Amount in USD
  const contractVal = parseFloat(formData.contractValue) || 0;
  const exchangeVal = parseFloat(formData.currencyExchangeValue) || 1;
  const amountInUSD = exchangeVal !== 0 ? (contractVal / exchangeVal).toFixed(2) : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSave = () => {
    let newErrors = {};
    if (!formData.billFrom) newErrors.billFrom = 'Bill From entity is required.';
    if (!formData.clientCurrency) newErrors.clientCurrency = 'Client Currency is required.';
    if (contractVal === 0) newErrors.contractValue = 'Contract value cannot be 0.';
    if (!formData.paymentDueDays) newErrors.paymentDueDays = 'Payment Due (in Days) is required.';
    if (!formData.receivingBankName) newErrors.receivingBankName = 'Receiving Bank Name is required.';
    if (!formData.bankDetailsLink) newErrors.bankDetailsLink = 'Bank Details Link is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.billFrom || newErrors.clientCurrency || newErrors.contractValue || newErrors.paymentDueDays) {
        setActiveTab('billing');
      } else {
        setActiveTab('paymentMethod');
      }
      return;
    }
    onSave({ ...formData, amountInUSD });
    onClose();
  };

  // Common styles
  const inputStyle = {
    width: '100%',
    padding: '0.5rem',
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
    fontWeight: '500',
    marginBottom: '0.25rem'
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        background: 'white', borderRadius: '8px', width: '90%', maxWidth: '500px',
        padding: '1.25rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Billing Details</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>
            &times;
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <button 
            style={{ background: 'none', border: 'none', padding: '0.5rem 0', fontWeight: '600', color: activeTab === 'billing' ? '#0ea5e9' : '#64748b', borderBottom: activeTab === 'billing' ? '2px solid #0ea5e9' : '2px solid transparent', cursor: 'pointer' }}
            onClick={() => setActiveTab('billing')}
          >
            Billing Details
          </button>
          <button 
            style={{ background: 'none', border: 'none', padding: '0.5rem 0', fontWeight: '600', color: activeTab === 'paymentMethod' ? '#0ea5e9' : '#64748b', borderBottom: activeTab === 'paymentMethod' ? '2px solid #0ea5e9' : '2px solid transparent', cursor: 'pointer' }}
            onClick={() => setActiveTab('paymentMethod')}
          >
            Payment Method
          </button>
        </div>

        {activeTab === 'billing' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Bill From <span style={{color: '#ef4444'}}>*</span></label>
            <select name="billFrom" style={{...inputStyle, borderColor: errors.billFrom ? '#ef4444' : '#cbd5e1'}} value={formData.billFrom} onChange={handleChange}>
              <option value="" disabled hidden>Select Entity</option>
              <option value="MCC">MCC</option>
              <option value="MCH I">MCH I</option>
              <option value="MCHPL">MCHPL</option>
              <option value="MRC">MRC</option>
              <option value="MR">MR</option>
            </select>
            {errors.billFrom && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.billFrom}</div>}
          </div>

          <div>
            <label style={labelStyle}>Billing Entity (from HR)</label>
            <input type="text" style={{...inputStyle, backgroundColor: '#f1f5f9'}} value={formData.billingEntity} readOnly />
          </div>
          
          <div>
            <label style={labelStyle}>Tax Details (from HR)</label>
            <input type="text" style={{...inputStyle, backgroundColor: '#f1f5f9'}} value={formData.taxDetails} readOnly />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Contract Value</label>
              <input type="number" name="contractValue" style={{...inputStyle, borderColor: errors.contractValue ? '#ef4444' : '#cbd5e1'}} value={formData.contractValue} onChange={handleChange} placeholder="0.00" />
              {errors.contractValue && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.contractValue}</div>}
            </div>

            <div>
              <label style={labelStyle}>Client Currency <span style={{color: '#ef4444'}}>*</span></label>
              <div style={{ position: 'relative' }}>
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{...inputStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'white', borderColor: errors.clientCurrency ? '#ef4444' : '#cbd5e1'}}
                >
                  <span style={{ color: formData.clientCurrency ? '#0f172a' : '#94a3b8' }}>{formData.clientCurrency || 'Select Currency'}</span>
                  <i className={`bx bx-chevron-${isDropdownOpen ? 'up' : 'down'}`} style={{ color: '#64748b' }}></i>
                </div>
                {errors.clientCurrency && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', position: 'absolute' }}>{errors.clientCurrency}</div>}
                
                {isDropdownOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '4px', zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxHeight: '200px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
                      <input 
                        type="text" 
                        autoFocus
                        placeholder="Search currency..." 
                        style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div style={{ overflowY: 'auto' }}>
                      {filteredCurrencies.map(c => (
                        <div 
                          key={c.code} 
                          onClick={() => {
                            setFormData(prev => ({ ...prev, clientCurrency: c.code }));
                            setErrors(prev => ({ ...prev, clientCurrency: null }));
                            setIsDropdownOpen(false);
                            setSearchTerm('');
                          }}
                          style={{ padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.85rem', color: '#0f172a', background: formData.clientCurrency === c.code ? '#f1f5f9' : 'white' }}
                          onMouseEnter={e => e.target.style.background = '#f8fafc'}
                          onMouseLeave={e => e.target.style.background = formData.clientCurrency === c.code ? '#f1f5f9' : 'white'}
                        >
                          <strong>{c.code}</strong> - {c.name}
                        </div>
                      ))}
                      {filteredCurrencies.length === 0 && (
                        <div style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>No currencies found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Currency Exchange Value (USD to {formData.clientCurrency || 'Client Currency'})</label>
              <input type="number" name="currencyExchangeValue" style={inputStyle} value={formData.currencyExchangeValue} onChange={handleChange} placeholder="1.0" step="0.01" />
            </div>

            <div>
              <label style={labelStyle}>Payment Due (in Days) <span style={{color: '#ef4444'}}>*</span></label>
              <input type="number" name="paymentDueDays" style={{...inputStyle, borderColor: errors.paymentDueDays ? '#ef4444' : '#cbd5e1'}} value={formData.paymentDueDays} onChange={handleChange} placeholder="e.g. 30" />
              {errors.paymentDueDays && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.paymentDueDays}</div>}
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <label style={{...labelStyle, marginBottom: 0}}>Amount in USD</label>
            <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0ea5e9' }}>
              ${amountInUSD}
            </div>
          </div>
        </div>
        )}

        {activeTab === 'paymentMethod' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Company Name</label>
              <input type="text" style={{...inputStyle, backgroundColor: '#f1f5f9'}} value={formData.billFrom || 'N/A'} readOnly />
            </div>
            <div>
              <label style={labelStyle}>Receiving Bank Name <span style={{color: '#ef4444'}}>*</span></label>
              <input type="text" name="receivingBankName" style={{...inputStyle, borderColor: errors.receivingBankName ? '#ef4444' : '#cbd5e1'}} value={formData.receivingBankName} onChange={handleChange} placeholder="e.g. Chase Bank" />
              {errors.receivingBankName && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.receivingBankName}</div>}
            </div>
            <div>
              <label style={labelStyle}>Bank Details link <span style={{color: '#ef4444'}}>*</span></label>
              <input type="url" name="bankDetailsLink" style={{...inputStyle, borderColor: errors.bankDetailsLink ? '#ef4444' : '#cbd5e1'}} value={formData.bankDetailsLink} onChange={handleChange} placeholder="https://..." />
              {errors.bankDetailsLink && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.bankDetailsLink}</div>}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button 
            onClick={onClose}
            style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', color: '#475569' }}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            style={{ padding: '0.5rem 1rem', background: '#0ea5e9', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'white', fontWeight: '500' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default BillingDetailsModal;
