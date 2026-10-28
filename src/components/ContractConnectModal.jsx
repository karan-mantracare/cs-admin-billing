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

export default function ContractConnectModal({ 
  isOpen, 
  onClose, 
  onConnect, 
  divisionId, 
  orderId, 
  existingContracts = [] 
}) {
  const [activeTab, setActiveTab] = useState('connect'); // 'connect' | 'create'
  const [availableContracts, setAvailableContracts] = useState([]);
  const [selectedContractIds, setSelectedContractIds] = useState([]);

  // Create form state
  const [onboardingCompanies, setOnboardingCompanies] = useState([]);
  const [companyMode, setCompanyMode] = useState('onboarding');
  const [selectedOnboardingIndex, setSelectedOnboardingIndex] = useState(0);

  const [formData, setFormData] = useState({
    companyName: '',
    taxDetails: '',
    address: '',
    contractValue: '1500',
    contractCurrency: 'EUR',
    currencyExchangeValue: '0.86',
    paymentDueDays: '15',
    billFrom: 'MCHI',
    receivingBankName: 'AirWallex',
    billingDate: new Date().toISOString().split('T')[0],
    bankDetailsLink: getBankDetailsLink('MCHI', 'AirWallex', 'EUR'),
    remarks: '',
    fileName: '',
    fileSize: ''
  });

  const [errors, setErrors] = useState({});
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const currencyDropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(e.target)) {
        setIsCurrencyDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadAvailableContracts();
      loadOnboardingCompanies();
      setSelectedContractIds([]);
      setActiveTab('connect');
      setErrors({});
    }
  }, [isOpen, divisionId, orderId, existingContracts]);

  const loadAvailableContracts = () => {
    try {
      const savedStr = localStorage.getItem('division_contracts');
      if (savedStr) {
        const all = JSON.parse(savedStr);
        const existingIds = (existingContracts || []).map(c => c.id);
        const available = all.filter(c => 
          String(c.divisionId) === String(divisionId) &&
          (!c.orderId || String(c.orderId) === String(orderId)) &&
          !existingIds.includes(c.id)
        );
        setAvailableContracts(available);
      } else {
        setAvailableContracts([]);
      }
    } catch (e) {
      console.error('Failed to load division_contracts', e);
      setAvailableContracts([]);
    }
  };

  const loadOnboardingCompanies = () => {
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
    if (companies.length > 0) {
      const first = companies[0];
      setFormData(prev => ({
        ...prev,
        companyName: first.companyName,
        taxDetails: first.taxDetails,
        address: first.address
      }));
      setCompanyMode('onboarding');
      setSelectedOnboardingIndex(0);
    } else {
      setCompanyMode('custom');
    }
  };

  // Bank link update
  useEffect(() => {
    if (formData.billFrom && formData.receivingBankName) {
      const link = getBankDetailsLink(formData.billFrom, formData.receivingBankName, formData.contractCurrency);
      if (link) {
        setFormData(prev => ({ ...prev, bankDetailsLink: link }));
      }
    }
  }, [formData.billFrom, formData.receivingBankName, formData.contractCurrency]);

  if (!isOpen) return null;

  // Live calculation
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + ' KB'
      }));
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
    if (activeTab === 'connect') {
      if (selectedContractIds.length === 0) {
        alert('Please select at least one contract to attach.');
        return;
      }
      const connected = availableContracts.filter(c => selectedContractIds.includes(c.id));
      onConnect(connected, 'connect');
    } else {
      if (!validate()) return;
      const newContract = {
        id: Date.now() + Math.random(),
        divisionId: divisionId || '',
        orderId: orderId || '',
        orderName: '',
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
        fileName: formData.fileName,
        fileSize: formData.fileSize,
        createdAt: new Date().toISOString().split('T')[0],
        isDirectlyUploaded: true
      };
      onConnect([newContract], 'create');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.65rem 0.85rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    outline: 'none',
    color: '#0f172a',
    backgroundColor: '#ffffff',
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
    }} onClick={onClose}>
      
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: activeTab === 'create' ? '680px' : '560px',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'max-width 0.2s ease'
      }} onClick={e => e.stopPropagation()}>

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#e0f2fe', color: '#0284c7', width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bx bx-file-blank" style={{ fontSize: '1.4rem' }}></i>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '700' }}>
                Attach Contract to Order
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Connect a division contract or create and attach a new contract option.
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.4rem' }}
          >
            <i className="bx bx-x"></i>
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button
            type="button"
            onClick={() => setActiveTab('connect')}
            style={{
              flex: 1,
              padding: '0.9rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'connect' ? '2px solid #0284c7' : '2px solid transparent',
              color: activeTab === 'connect' ? '#0284c7' : '#64748b',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <i className="bx bx-link"></i>
            Connect Existing ({availableContracts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            style={{
              flex: 1,
              padding: '0.9rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'create' ? '2px solid #0284c7' : '2px solid transparent',
              color: activeTab === 'create' ? '#0284c7' : '#64748b',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <i className="bx bx-plus-circle"></i>
            Create & Attach New
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          {activeTab === 'connect' ? (
            <div>
              <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.85rem' }}>
                Select contract(s) created under this division to attach them to this order.
              </p>
              {availableContracts.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  <i className="bx bx-folder-open" style={{ fontSize: '2.5rem', color: '#94a3b8', marginBottom: '0.5rem' }}></i>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontWeight: '600', fontSize: '0.95rem' }}>No unlinked contracts found</p>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Switch to the "Create & Attach New" tab to set up a contract for this order.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {availableContracts.map(c => {
                    const isSelected = selectedContractIds.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedContractIds(prev => prev.filter(id => id !== c.id));
                          } else {
                            setSelectedContractIds(prev => [...prev, c.id]);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '1rem',
                          background: isSelected ? '#f0f9ff' : '#ffffff',
                          border: isSelected ? '1px solid #0284c7' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          style={{ accentColor: '#0284c7', width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.95rem' }}>{c.companyName}</span>
                            <span style={{ fontWeight: '700', color: '#0284c7', fontSize: '0.95rem' }}>
                              {c.contractValue?.toLocaleString()} {c.contractCurrency}
                              {c.amountInUSD ? <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '400', marginLeft: '0.4rem' }}>(${c.amountInUSD} USD)</span> : null}
                            </span>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>
                            <span><strong>Bill From:</strong> {c.billFrom}</span>
                            <span><strong>Bank:</strong> {c.receivingBankName}</span>
                            <span><strong>Billing Date:</strong> {c.billingDate}</span>
                            <span><strong>Due:</strong> {c.paymentDueDays} days</span>
                            {c.fileName && <span style={{ color: '#0284c7' }}><i className="bx bx-paperclip"></i> {c.fileName}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Create Form Tab */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Company Selection */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <i className="bx bx-buildings" style={{ color: '#0284c7' }}></i>
                    Client Company / Entity <Tooltip text="Select from Onboarding form or enter custom company details." align="left" />
                  </span>
                  
                  <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '6px', padding: '2px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setCompanyMode('onboarding');
                        if (onboardingCompanies.length > 0) handleSelectOnboardingCompany(0);
                      }}
                      style={{
                        border: 'none',
                        background: companyMode === 'onboarding' ? '#ffffff' : 'transparent',
                        color: companyMode === 'onboarding' ? '#0f172a' : '#64748b',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        padding: '0.3rem 0.65rem',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Onboarding ({onboardingCompanies.length})
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
                        cursor: 'pointer'
                      }}
                    >
                      Custom Company
                    </button>
                  </div>
                </div>

                {companyMode === 'onboarding' ? (
                  onboardingCompanies.length > 0 ? (
                    <div>
                      <select
                        value={selectedOnboardingIndex}
                        onChange={(e) => handleSelectOnboardingCompany(parseInt(e.target.value, 10))}
                        style={inputStyle}
                      >
                        {onboardingCompanies.map((c, idx) => (
                          <option key={idx} value={idx}>
                            {c.companyName} {c.taxDetails ? `(GST: ${c.taxDetails})` : ''}
                          </option>
                        ))}
                      </select>
                      {formData.companyName && (
                        <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', color: '#475569' }}>
                          <div style={{ fontWeight: '600', color: '#0f172a' }}>{formData.companyName}</div>
                          {formData.taxDetails && <div>Tax/GST: {formData.taxDetails}</div>}
                          {formData.address && <div>Address: {formData.address}</div>}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: '0.75rem', background: '#fffbeb', border: '1px dashed #f59e0b', borderRadius: '6px', color: '#b45309', fontSize: '0.8rem' }}>
                      No company details found in onboarding form. Use Custom Company.
                    </div>
                  )
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={labelStyle}>Company Name <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        type="text"
                        name="companyName"
                        placeholder="Enter Company Name"
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
                          placeholder="Registered address"
                          value={formData.address}
                          onChange={handleInputChange}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Financial Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Contract Value <Tooltip text="Total contract value." align="left" /></label>
                  <input
                    type="number"
                    name="contractValue"
                    placeholder="1500"
                    value={formData.contractValue}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Contract Currency <span style={{ color: '#ef4444' }}>*</span> <Tooltip text="Currency stipulated in contract." align="right" /></label>
                  <div style={{ position: 'relative' }} ref={currencyDropdownRef}>
                    <div
                      onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                      style={{ ...inputStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    >
                      <span>{formData.contractCurrency || 'Select Currency'}</span>
                      <i className={`bx bx-chevron-${isCurrencyDropdownOpen ? 'up' : 'down'}`} style={{ color: '#64748b' }}></i>
                    </div>
                    {isCurrencyDropdownOpen && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '4px', zIndex: 20, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxHeight: '180px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '0.4rem', borderBottom: '1px solid #e2e8f0' }}>
                          <input
                            type="text"
                            autoFocus
                            placeholder="Search..."
                            value={currencySearch}
                            onChange={(e) => setCurrencySearch(e.target.value)}
                            style={{ width: '100%', padding: '0.3rem', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.8rem', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div style={{ overflowY: 'auto' }}>
                          {currenciesList.filter(c => c.code.toLowerCase().includes(currencySearch.toLowerCase()) || c.name.toLowerCase().includes(currencySearch.toLowerCase())).map(c => (
                            <div
                              key={c.code}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, contractCurrency: c.code }));
                                setIsCurrencyDropdownOpen(false);
                                setCurrencySearch('');
                              }}
                              style={{ padding: '0.45rem 0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Currency Exchange Value (USD to {formData.contractCurrency || 'EUR'}) <Tooltip text="Exchange rate." align="left" /></label>
                  <input
                    type="number"
                    step="0.0001"
                    name="currencyExchangeValue"
                    placeholder="0.86"
                    value={formData.currencyExchangeValue}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Payment Due (in Days) <span style={{ color: '#ef4444' }}>*</span> <Tooltip text="Payment due days." align="right" /></label>
                  <input
                    type="number"
                    name="paymentDueDays"
                    placeholder="15"
                    value={formData.paymentDueDays}
                    onChange={handleInputChange}
                    style={{ ...inputStyle, borderColor: errors.paymentDueDays ? '#ef4444' : '#cbd5e1' }}
                  />
                </div>
              </div>

              {/* Amount in USD box */}
              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.95rem', color: '#0369a1', fontWeight: '600' }}>Amount in USD -</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0284c7' }}>
                    ${amountInUSD}
                  </span>
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                  <i className="bx bx-dollar"></i>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Bill From <span style={{ color: '#ef4444' }}>*</span> <Tooltip text="Internal company." align="left" /></label>
                  <select
                    name="billFrom"
                    value={formData.billFrom}
                    onChange={handleInputChange}
                    style={{ ...inputStyle, borderColor: errors.billFrom ? '#ef4444' : '#cbd5e1' }}
                  >
                    <option value="MCHI">MCHI</option>
                    <option value="MCC">MCC</option>
                    <option value="MR UK">MR UK</option>
                    <option value="MCHPL">MCHPL</option>
                    <option value="MRC UAE">MRC UAE</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Receiving Bank Name <span style={{ color: '#ef4444' }}>*</span> <Tooltip text="Receiving bank." align="right" /></label>
                  <select
                    name="receivingBankName"
                    value={formData.receivingBankName}
                    onChange={handleInputChange}
                    style={{ ...inputStyle, borderColor: errors.receivingBankName ? '#ef4444' : '#cbd5e1' }}
                  >
                    <option value="AirWallex">AirWallex</option>
                    <option value="ICICI">ICICI</option>
                    <option value="Wise">Wise</option>
                    <option value="Mercury">Mercury</option>
                    <option value="ENBD">ENBD</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Billing Date <span style={{ color: '#ef4444' }}>*</span> <Tooltip text="Billing date." align="left" /></label>
                  <input
                    type="date"
                    name="billingDate"
                    value={formData.billingDate}
                    onChange={handleInputChange}
                    style={{ ...inputStyle, borderColor: errors.billingDate ? '#ef4444' : '#cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Bank Details link <span style={{ color: '#ef4444' }}>*</span> <Tooltip text="Google drive link." align="right" /></label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="url"
                      name="bankDetailsLink"
                      readOnly
                      value={formData.bankDetailsLink}
                      style={{ ...inputStyle, backgroundColor: '#f8fafc', paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.bankDetailsLink) {
                          navigator.clipboard.writeText(formData.bankDetailsLink);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        }
                      }}
                      style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: copiedLink ? '#10b981' : '#64748b' }}
                    >
                      <i className={copiedLink ? "bx bx-check" : "bx bx-copy"}></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Document upload */}
              <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '0.75rem' }}>
                <label style={labelStyle}>Contract Agreement File (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.doc,.docx,image/*" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    style={{ padding: '0.45rem 0.8rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    <i className="bx bx-upload" style={{ marginRight: '0.35rem', color: '#0284c7' }}></i>
                    {formData.fileName ? 'Change File' : 'Upload Agreement'}
                  </button>
                  {formData.fileName && (
                    <span style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: '500' }}>
                      {formData.fileName} ({formData.fileSize})
                    </span>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Modal Footer */}
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
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
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
              gap: '0.4rem'
            }}
          >
            {activeTab === 'connect' ? (
              <>
                <i className="bx bx-link" style={{ fontSize: '1.1rem' }}></i>
                Attach Selected ({selectedContractIds.length})
              </>
            ) : (
              <>
                <i className="bx bx-save" style={{ fontSize: '1.1rem' }}></i>
                Save Details
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
