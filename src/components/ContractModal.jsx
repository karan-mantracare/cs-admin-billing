import React, { useState, useEffect, useRef } from 'react';
import { currenciesList, getBankDetailsLink } from '../utils/bankDetailsData';

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
      <i className="bx bx-info-circle" style={{ color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', verticalAlign: 'middle' }}></i>
      {isVisible && (
        <div style={{
          position: 'absolute',
          bottom: '120%',
          ...posStyles,
          backgroundColor: '#1e293b',
          color: 'white',
          padding: '0.4rem 0.6rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          whiteSpace: 'normal',
          width: 'max-content',
          maxWidth: '220px',
          zIndex: 100,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          pointerEvents: 'none',
          lineHeight: '1.3'
        }}>
          {text}
          <div style={{
            position: 'absolute',
            top: '100%',
            ...arrowStyles,
            borderWidth: '4px',
            borderStyle: 'solid',
            borderColor: '#1e293b transparent transparent transparent'
          }} />
        </div>
      )}
    </div>
  );
};

export default function ContractModal({ 
  isOpen, 
  onClose, 
  onSave, 
  divisionId, 
  initialData = null, 
  isReadOnly = false 
}) {
  const [onboardingCompanies, setOnboardingCompanies] = useState([]);
  const [companyMode, setCompanyMode] = useState('onboarding'); // 'onboarding' | 'custom'
  const [selectedOnboardingIndex, setSelectedOnboardingIndex] = useState(0);

  const [formData, setFormData] = useState({
    companyName: '',
    taxDetails: '',
    address: '',
    contractValue: '',
    contractCurrency: 'EUR',
    currencyExchangeValue: '0.86',
    paymentDueDays: '15',
    billFrom: 'MCHI',
    receivingBankName: 'AirWallex',
    billingDate: '',
    bankDetailsLink: '',
    remarks: ''
  });

  const [errors, setErrors] = useState({});
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const currencyDropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(e.target)) {
        setIsCurrencyDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load onboarding companies for division
  useEffect(() => {
    if (isOpen) {
      const companies = [];
      try {
        const targetId = divisionId || '1';
        const savedData = localStorage.getItem('onboardingFiled_' + targetId);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (parsed.billingDetails) {
            if (parsed.billingDetails.companies && parsed.billingDetails.companies.length > 0) {
              parsed.billingDetails.companies.forEach((comp, idx) => {
                if (comp.companyName && comp.companyName.trim()) {
                  companies.push({
                    id: comp.id || idx + 1,
                    companyName: comp.companyName,
                    taxDetails: comp.gstNumber || '',
                    address: comp.address || ''
                  });
                }
              });
            } else if (parsed.billingDetails.companyName) {
              companies.push({
                id: 1,
                companyName: parsed.billingDetails.companyName,
                taxDetails: parsed.billingDetails.gstNumber || '',
                address: parsed.billingDetails.address || ''
              });
            }
          }
        }
      } catch (err) {
        console.error('Error loading onboarding companies:', err);
      }
      setOnboardingCompanies(companies);

      if (initialData) {
        setFormData({
          companyName: initialData.companyName || '',
          taxDetails: initialData.taxDetails || initialData.gstNumber || '',
          address: initialData.address || '',
          contractValue: initialData.contractValue !== undefined ? initialData.contractValue : '',
          contractCurrency: initialData.contractCurrency || 'EUR',
          currencyExchangeValue: initialData.currencyExchangeValue !== undefined ? initialData.currencyExchangeValue : '0.86',
          paymentDueDays: initialData.paymentDueDays !== undefined ? initialData.paymentDueDays : '15',
          billFrom: initialData.billFrom || 'MCHI',
          receivingBankName: initialData.receivingBankName || 'AirWallex',
          billingDate: initialData.billingDate || '',
          bankDetailsLink: initialData.bankDetailsLink || '',
          remarks: initialData.remarks || ''
        });
        setCompanyMode(initialData.companySource === 'custom' ? 'custom' : (companies.length > 0 ? 'onboarding' : 'custom'));
      } else {
        // Defaults matching user's screenshot
        const firstComp = companies[0];
        const defaultDate = new Date().toISOString().split('T')[0];
        setFormData({
          companyName: firstComp ? firstComp.companyName : '',
          taxDetails: firstComp ? firstComp.taxDetails : '',
          address: firstComp ? firstComp.address : '',
          contractValue: '1500',
          contractCurrency: 'EUR',
          currencyExchangeValue: '0.86',
          paymentDueDays: '15',
          billFrom: 'MCHI',
          receivingBankName: 'AirWallex',
          billingDate: defaultDate,
          bankDetailsLink: getBankDetailsLink('MCHI', 'AirWallex', 'EUR'),
          remarks: ''
        });
        setCompanyMode(companies.length > 0 ? 'onboarding' : 'custom');
        setSelectedOnboardingIndex(0);
      }
      setErrors({});
    }
  }, [isOpen, divisionId, initialData]);

  // Recalculate bank link whenever Bill From, Receiving Bank or Currency changes
  useEffect(() => {
    if (formData.billFrom && formData.receivingBankName) {
      const link = getBankDetailsLink(formData.billFrom, formData.receivingBankName, formData.contractCurrency);
      if (link) {
        setFormData(prev => ({ ...prev, bankDetailsLink: link }));
      }
    }
  }, [formData.billFrom, formData.receivingBankName, formData.contractCurrency]);

  if (!isOpen) return null;

  // Live amount in USD calculation
  const val = parseFloat(formData.contractValue) || 0;
  const curr = formData.contractCurrency || 'EUR';
  let amountInUSD = '0.00';
  if (curr.toUpperCase() === 'USD') {
    amountInUSD = val.toFixed(2);
  } else {
    const ex = parseFloat(formData.currencyExchangeValue) || 1;
    amountInUSD = ex > 0 ? (val / ex).toFixed(2) : '0.00';
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSelectOnboardingCompany = (idx) => {
    setSelectedOnboardingIndex(idx);
    const comp = onboardingCompanies[idx];
    if (comp) {
      setFormData(prev => ({
        ...prev,
        companyName: comp.companyName,
        taxDetails: comp.taxDetails,
        address: comp.address
      }));
    }
  };



  const handleCopyBankLink = () => {
    if (formData.bankDetailsLink) {
      navigator.clipboard.writeText(formData.bankDetailsLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.companyName.trim()) newErrors.companyName = 'Company Name is required';
    if (!formData.contractCurrency) newErrors.contractCurrency = 'Currency is required';
    if (!formData.paymentDueDays) newErrors.paymentDueDays = 'Payment Due Days is required';
    if (!formData.billFrom) newErrors.billFrom = 'Bill From is required';
    if (!formData.receivingBankName) newErrors.receivingBankName = 'Receiving Bank Name is required';
    if (!formData.billingDate) newErrors.billingDate = 'Billing Date is required';
    if (!formData.bankDetailsLink) newErrors.bankDetailsLink = 'Bank Details link is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (isReadOnly) {
      onClose();
      return;
    }
    if (!validate()) return;

    const savedContract = {
      id: initialData?.id || (Date.now() + Math.random()),
      divisionId: divisionId || initialData?.divisionId || '',
      orderId: initialData?.orderId || '',
      orderName: initialData?.orderName || '',
      companySource: companyMode,
      companyName: formData.companyName.trim(),
      taxDetails: formData.taxDetails.trim(),
      address: formData.address.trim(),
      contractValue: parseFloat(formData.contractValue) || 0,
      contractCurrency: formData.contractCurrency,
      currencyExchangeValue: parseFloat(formData.currencyExchangeValue) || 1,
      paymentDueDays: parseInt(formData.paymentDueDays, 10) || 15,
      amountInUSD: parseFloat(amountInUSD) || 0,
      billFrom: formData.billFrom,
      receivingBankName: formData.receivingBankName,
      billingDate: formData.billingDate,
      bankDetailsLink: formData.bankDetailsLink,
      remarks: formData.remarks,
      createdAt: initialData?.createdAt || new Date().toISOString().split('T')[0]
    };

    onSave(savedContract);
  };

  const filteredCurrencies = currenciesList.filter(c => 
    c.code.toLowerCase().includes(currencySearch.toLowerCase()) || 
    c.name.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const inputStyle = {
    width: '100%',
    padding: '0.65rem 0.85rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    outline: 'none',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    transition: 'all 0.15s ease',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#334155',
    marginBottom: '0.35rem'
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bx bx-file-blank" style={{ color: '#0284c7', fontSize: '1.35rem' }}></i>
              {isReadOnly ? 'Contract Details' : (initialData ? 'Edit Contract Option' : 'Create Contract Option')}
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Configure client company details, financial terms, and internal bank links.
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              fontSize: '1.4rem',
              display: 'flex',
              alignItems: 'center',
              padding: '0.2rem',
              borderRadius: '4px'
            }}
          >
            <i className="bx bx-x"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Section 1: Company Selection */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <i className="bx bx-buildings" style={{ color: '#0284c7' }}></i>
                Client Company / Entity <Tooltip text="Select the company from the Onboarding form or enter custom details." align="left" />
              </span>
              
              {!isReadOnly && (
                <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '6px', padding: '2px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setCompanyMode('onboarding');
                      if (onboardingCompanies.length > 0) {
                        handleSelectOnboardingCompany(0);
                      }
                    }}
                    style={{
                      border: 'none',
                      background: companyMode === 'onboarding' ? '#ffffff' : 'transparent',
                      color: companyMode === 'onboarding' ? '#0f172a' : '#64748b',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      boxShadow: companyMode === 'onboarding' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                    Onboarding Companies ({onboardingCompanies.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompanyMode('custom')}
                    style={{
                      border: 'none',
                      background: companyMode === 'custom' ? '#ffffff' : 'transparent',
                      color: companyMode === 'custom' ? '#0f172a' : '#64748b',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      boxShadow: companyMode === 'custom' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                    Custom Company
                  </button>
                </div>
              )}
            </div>

            {companyMode === 'onboarding' ? (
              onboardingCompanies.length > 0 ? (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={labelStyle}>
                      Select Company from Onboarding <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={selectedOnboardingIndex}
                      disabled={isReadOnly}
                      onChange={(e) => handleSelectOnboardingCompany(parseInt(e.target.value, 10))}
                      style={inputStyle}
                    >
                      {onboardingCompanies.map((c, idx) => (
                        <option key={idx} value={idx}>
                          {c.companyName} {c.taxDetails ? `(GST/Tax: ${c.taxDetails})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.companyName && (
                    <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.85rem', background: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', color: '#475569' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{formData.companyName}</div>
                      {formData.taxDetails && <div style={{ marginTop: '0.2rem' }}><strong>Tax/GST:</strong> {formData.taxDetails}</div>}
                      {formData.address && <div style={{ marginTop: '0.2rem' }}><strong>Address:</strong> {formData.address}</div>}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '0.85rem', background: '#fffbeb', border: '1px dashed #f59e0b', borderRadius: '6px', color: '#b45309', fontSize: '0.8rem' }}>
                  <i className="bx bx-info-circle" style={{ marginRight: '0.35rem' }}></i>
                  No company details found in the Onboarding form. Switched to Custom Company entry.
                </div>
              )
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>
                    Company Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    disabled={isReadOnly}
                    placeholder="Enter Company / Client Entity Name"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    style={{ ...inputStyle, borderColor: errors.companyName ? '#ef4444' : '#cbd5e1' }}
                  />
                  {errors.companyName && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.companyName}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={labelStyle}>Tax / GST Number</label>
                    <input
                      type="text"
                      name="taxDetails"
                      disabled={isReadOnly}
                      placeholder="e.g. 29ABCDE1234F1Z5"
                      value={formData.taxDetails}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Company Address</label>
                    <input
                      type="text"
                      name="address"
                      disabled={isReadOnly}
                      placeholder="Registered billing address"
                      value={formData.address}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Screenshot Financial Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Row 1: Contract Value & Contract Currency */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>
                  Contract Value <Tooltip text="Enter total contract value in the contract currency." align="left" />
                </label>
                <input
                  type="number"
                  name="contractValue"
                  disabled={isReadOnly}
                  placeholder="1500"
                  value={formData.contractValue}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Contract Currency <span style={{ color: '#ef4444' }}>*</span> 
                  <Tooltip text="Currency specified in the contract agreement." align="right" />
                </label>
                <div style={{ position: 'relative' }} ref={currencyDropdownRef}>
                  <div
                    onClick={() => !isReadOnly && setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                    style={{
                      ...inputStyle,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: isReadOnly ? 'default' : 'pointer',
                      background: '#ffffff',
                      borderColor: errors.contractCurrency ? '#ef4444' : '#cbd5e1'
                    }}
                  >
                    <span style={{ fontWeight: '500' }}>{formData.contractCurrency || 'Select Currency'}</span>
                    <i className={`bx bx-chevron-${isCurrencyDropdownOpen ? 'up' : 'down'}`} style={{ color: '#64748b' }}></i>
                  </div>
                  {errors.contractCurrency && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.contractCurrency}</span>}

                  {isCurrencyDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      marginTop: '4px',
                      zIndex: 20,
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      maxHeight: '190px',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <div style={{ padding: '0.4rem', borderBottom: '1px solid #e2e8f0' }}>
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search currency..."
                          value={currencySearch}
                          onChange={(e) => setCurrencySearch(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.35rem 0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            outline: 'none',
                            fontSize: '0.8rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div style={{ overflowY: 'auto' }}>
                        {filteredCurrencies.map(c => (
                          <div
                            key={c.code}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, contractCurrency: c.code }));
                              setIsCurrencyDropdownOpen(false);
                              setCurrencySearch('');
                            }}
                            style={{
                              padding: '0.45rem 0.75rem',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              color: '#0f172a',
                              background: formData.contractCurrency === c.code ? '#eff6ff' : '#ffffff'
                            }}
                            onMouseEnter={e => e.target.style.background = '#f8fafc'}
                            onMouseLeave={e => e.target.style.background = formData.contractCurrency === c.code ? '#eff6ff' : '#ffffff'}
                          >
                            <strong>{c.code}</strong> - {c.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: Currency Exchange Value & Payment Due */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>
                  Currency Exchange Value (USD to {formData.contractCurrency || 'EUR'}) 
                  <Tooltip text={`Exchange rate for USD to ${formData.contractCurrency || 'EUR'}. Amount in USD = Contract Value / Exchange Value`} align="left" />
                </label>
                <input
                  type="number"
                  step="0.0001"
                  name="currencyExchangeValue"
                  disabled={isReadOnly}
                  placeholder="0.86"
                  value={formData.currencyExchangeValue}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Payment Due (in Days) <span style={{ color: '#ef4444' }}>*</span> 
                  <Tooltip text="Payment credit duration in days from invoice date." align="right" />
                </label>
                <input
                  type="number"
                  name="paymentDueDays"
                  disabled={isReadOnly}
                  placeholder="15"
                  value={formData.paymentDueDays}
                  onChange={handleInputChange}
                  style={{ ...inputStyle, borderColor: errors.paymentDueDays ? '#ef4444' : '#cbd5e1' }}
                />
                {errors.paymentDueDays && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.paymentDueDays}</span>}
              </div>
            </div>

            {/* Row 3: Live Highlighted Amount in USD Box (matches screenshot) */}
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              border: '1px solid #bae6fd',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.95rem', color: '#0369a1', fontWeight: '600' }}>Amount in USD -</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0284c7' }}>
                  ${amountInUSD}
                </span>
              </div>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
                fontSize: '1.2rem'
              }}>
                <i className="bx bx-dollar"></i>
              </div>
            </div>

            {/* Row 4: Bill From & Receiving Bank Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>
                  Bill From <span style={{ color: '#ef4444' }}>*</span> 
                  <Tooltip text="Internal billing company/entity as per contract." align="left" />
                </label>
                <select
                  name="billFrom"
                  disabled={isReadOnly}
                  value={formData.billFrom}
                  onChange={handleInputChange}
                  style={{ ...inputStyle, borderColor: errors.billFrom ? '#ef4444' : '#cbd5e1' }}
                >
                  <option value="" disabled hidden>Select Company</option>
                  <option value="MCHI">MCHI</option>
                  <option value="MCC">MCC</option>
                  <option value="MR UK">MR UK</option>
                  <option value="MCHPL">MCHPL</option>
                  <option value="MRC UAE">MRC UAE</option>
                </select>
                {errors.billFrom && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.billFrom}</span>}
              </div>

              <div>
                <label style={labelStyle}>
                  Receiving Bank Name <span style={{ color: '#ef4444' }}>*</span> 
                  <Tooltip text="Receiving bank account for client payment transfers." align="right" />
                </label>
                <select
                  name="receivingBankName"
                  disabled={isReadOnly}
                  value={formData.receivingBankName}
                  onChange={handleInputChange}
                  style={{ ...inputStyle, borderColor: errors.receivingBankName ? '#ef4444' : '#cbd5e1' }}
                >
                  <option value="" disabled hidden>Select Bank</option>
                  <option value="AirWallex">AirWallex</option>
                  <option value="ICICI">ICICI</option>
                  <option value="Wise">Wise</option>
                  <option value="Mercury">Mercury</option>
                  <option value="ENBD">ENBD</option>
                </select>
                {errors.receivingBankName && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.receivingBankName}</span>}
              </div>
            </div>

            {/* Row 5: Billing Date & Bank Details link */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>
                  Billing Date <span style={{ color: '#ef4444' }}>*</span> 
                  <Tooltip text="Date when the billing will be issued." align="left" />
                </label>
                <input
                  type="date"
                  name="billingDate"
                  disabled={isReadOnly}
                  value={formData.billingDate}
                  onChange={handleInputChange}
                  style={{ ...inputStyle, borderColor: errors.billingDate ? '#ef4444' : '#cbd5e1' }}
                />
                {errors.billingDate && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.billingDate}</span>}
              </div>

              <div>
                <label style={labelStyle}>
                  Bank Details link <span style={{ color: '#ef4444' }}>*</span> 
                  <Tooltip text="Official Google Drive link containing bank account and swift details." align="right" />
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="url"
                    name="bankDetailsLink"
                    readOnly
                    placeholder="https://drive.google.com/..."
                    value={formData.bankDetailsLink}
                    style={{
                      ...inputStyle,
                      backgroundColor: '#f8fafc',
                      paddingRight: '2.5rem',
                      borderColor: errors.bankDetailsLink ? '#ef4444' : '#cbd5e1',
                      color: '#0f172a'
                    }}
                  />
                  <button
                    type="button"
                    title="Copy Bank Link"
                    onClick={handleCopyBankLink}
                    style={{
                      position: 'absolute',
                      right: '6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: copiedLink ? '#10b981' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                      borderRadius: '4px'
                    }}
                  >
                    <i className={copiedLink ? "bx bx-check" : "bx bx-copy"} style={{ fontSize: '1.2rem' }}></i>
                  </button>
                </div>
                {errors.bankDetailsLink && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.bankDetailsLink}</span>}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer (matches screenshot) */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: '#ffffff',
          borderBottomLeftRadius: '12px',
          borderBottomRightRadius: '12px'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.55rem 1.25rem',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: '#475569',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            Cancel
          </button>

          {!isReadOnly && (
            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: '0.55rem 1.25rem',
                backgroundColor: '#0284c7',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0369a1'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0284c7'}
            >
              <i className="bx bx-save" style={{ fontSize: '1.1rem' }}></i>
              Save Details
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
