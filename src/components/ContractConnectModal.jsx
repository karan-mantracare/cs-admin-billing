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

  // Create form state - Multi-select company pool and splits
  const [allCompanies, setAllCompanies] = useState([]);
  const [companySplits, setCompanySplits] = useState([]);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customForm, setCustomForm] = useState({ companyName: '', taxDetails: '', address: '' });
  const [customError, setCustomError] = useState('');
  const companyDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    contractValue: '1500',
    contractCurrency: 'EUR',
    currencyExchangeValue: '0.86',
    paymentDueDays: '15',
    billFrom: 'MCHI',
    receivingBankName: 'AirWallex',
    billingDate: new Date().toISOString().split('T')[0],
    bankDetailsLink: getBankDetailsLink('MCHI', 'AirWallex', 'EUR'),
    remarks: ''
  });

  const [errors, setErrors] = useState({});
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const currencyDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(e.target)) {
        setIsCurrencyDropdownOpen(false);
      }
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(e.target)) {
        setIsCompanyDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (isCompanyDropdownOpen) {
          setIsCompanyDropdownOpen(false);
        } else if (isCurrencyDropdownOpen) {
          setIsCurrencyDropdownOpen(false);
        } else {
          onClose();
        }
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isCompanyDropdownOpen, isCurrencyDropdownOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      loadAvailableContracts();
      loadCompanies();
      setSelectedContractIds([]);
      setActiveTab('connect');
      setErrors({});
      setIsAddingCustom(false);
      setCustomForm({ companyName: '', taxDetails: '', address: '' });
      setCustomError('');
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

  const loadCompanies = () => {
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
                  id: 'onb_' + (comp.id || idx + 1),
                  companyName: comp.companyName,
                  taxDetails: comp.gstNumber || '',
                  address: comp.address || '',
                  source: 'onboarding'
                });
              }
            });
          } else if (parsed.billingDetails.companyName) {
            companies.push({
              id: 'onb_1',
              companyName: parsed.billingDetails.companyName,
              taxDetails: parsed.billingDetails.gstNumber || '',
              address: parsed.billingDetails.address || '',
              source: 'onboarding'
            });
          }
        }
      }
    } catch (err) {
      console.error('Error loading onboarding companies:', err);
    }
    setAllCompanies(companies);
    if (companies.length > 0) {
      setCompanySplits([{ ...companies[0], percentage: 100 }]);
    } else {
      setCompanySplits([]);
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

  const toggleCompanySelection = (comp) => {
    const isSelected = companySplits.some(s => s.id === comp.id);
    let updated;
    if (isSelected) {
      updated = companySplits.filter(s => s.id !== comp.id);
    } else {
      updated = [...companySplits, { ...comp, percentage: 0 }];
    }

    if (updated.length > 0) {
      const count = updated.length;
      const base = Math.floor(100 / count);
      const remainder = 100 - (base * count);
      updated = updated.map((item, idx) => ({
        ...item,
        percentage: idx === count - 1 ? (base + remainder) : base
      }));
    }

    setCompanySplits(updated);
    if (errors.companies) setErrors(prev => ({ ...prev, companies: null }));
  };

  const handlePercentageChange = (id, newPercentage) => {
    const num = parseFloat(newPercentage) || 0;
    setCompanySplits(prev => prev.map(s => s.id === id ? { ...s, percentage: num } : s));
  };

  const applyEqualSplit = () => {
    const count = companySplits.length;
    if (count === 0) return;
    const base = Math.floor(100 / count);
    const remainder = 100 - (base * count);
    setCompanySplits(prev => prev.map((s, idx) => ({
      ...s,
      percentage: idx === count - 1 ? (base + remainder) : base
    })));
  };

  const handleAddCustomCompany = (e) => {
    e.preventDefault();
    if (!customForm.companyName.trim()) {
      setCustomError('Company Name is required');
      return;
    }
    const newComp = {
      id: 'custom_' + Date.now(),
      companyName: customForm.companyName.trim(),
      taxDetails: customForm.taxDetails.trim(),
      address: customForm.address.trim(),
      source: 'custom'
    };

    setAllCompanies(prev => [...prev, newComp]);
    const updated = [...companySplits, { ...newComp, percentage: 0 }];
    const count = updated.length;
    const base = Math.floor(100 / count);
    const remainder = 100 - (base * count);
    setCompanySplits(updated.map((item, idx) => ({
      ...item,
      percentage: idx === count - 1 ? (base + remainder) : base
    })));

    setCustomForm({ companyName: '', taxDetails: '', address: '' });
    setCustomError('');
    setIsAddingCustom(false);
  };

  const totalPercentage = companySplits.reduce((acc, s) => acc + (parseFloat(s.percentage) || 0), 0);

  const validate = () => {
    const newErrors = {};
    if (companySplits.length === 0) {
      newErrors.companies = 'Please select at least one company / entity';
    } else if (Math.round(totalPercentage) !== 100) {
      newErrors.companies = `Total percentage must equal 100% (currently ${totalPercentage}%)`;
    }

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
      const primaryName = companySplits.length === 1 
        ? companySplits[0].companyName
        : companySplits.map(s => `${s.companyName} (${s.percentage}%)`).join(', ');

      const primaryTax = companySplits.map(s => s.taxDetails).filter(Boolean).join(', ');
      const primaryAddress = companySplits.map(s => s.address).filter(Boolean).join(' | ');

      const newContract = {
        id: Date.now() + Math.random(),
        divisionId: divisionId || '',
        orderId: orderId || '',
        orderName: '',
        companyEntities: companySplits,
        billingSplits: companySplits.map(s => ({ ...s, selected: true })),
        companyName: primaryName,
        taxDetails: primaryTax,
        address: primaryAddress,
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
        createdAt: new Date().toISOString().split('T')[0],
        isDirectlyUploaded: true
      };
      onConnect([newContract], 'create');
    }
  };

  const filteredCompanies = allCompanies.filter(c => 
    c.companyName.toLowerCase().includes(companySearch.toLowerCase()) ||
    (c.taxDetails && c.taxDetails.toLowerCase().includes(companySearch.toLowerCase()))
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
              
              {/* Multi-Select Companies with Dropdown & Percentage Option */}
              <div style={{ background: '#f8fafc', border: errors.companies ? '1px solid #ef4444' : '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>
                    <i className="bx bx-buildings" style={{ color: '#0284c7' }}></i>
                    Select Companies / Entities (Multi-Select) <span style={{ color: '#ef4444' }}>*</span>
                    <Tooltip text="Select one or more companies from Onboarding or add custom entities. Then specify the percentage split." align="left" />
                  </label>

                  {!isAddingCustom && (
                    <button
                      type="button"
                      onClick={() => setIsAddingCustom(true)}
                      style={{
                        background: '#eff6ff',
                        color: '#0284c7',
                        border: '1px solid #bfdbfe',
                        borderRadius: '5px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        padding: '0.3rem 0.6rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <i className="bx bx-plus"></i> Add Custom Company
                    </button>
                  )}
                </div>

                {/* Inline Add Custom Company Form */}
                {isAddingCustom && (
                  <div style={{ background: '#ffffff', border: '1px solid #93c5fd', borderRadius: '6px', padding: '0.85rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e40af' }}>
                        <i className="bx bx-building-house" style={{ marginRight: '0.25rem' }}></i> New Custom Company
                      </span>
                      <button 
                        type="button" 
                        onClick={() => { setIsAddingCustom(false); setCustomError(''); }} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                      >
                        <i className="bx bx-x"></i>
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Company Name *"
                        value={customForm.companyName}
                        onChange={(e) => setCustomForm({ ...customForm, companyName: e.target.value })}
                        style={{ ...inputStyle, padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <input
                          type="text"
                          placeholder="Tax / GST Number"
                          value={customForm.taxDetails}
                          onChange={(e) => setCustomForm({ ...customForm, taxDetails: e.target.value })}
                          style={{ ...inputStyle, padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                        />
                        <input
                          type="text"
                          placeholder="Address"
                          value={customForm.address}
                          onChange={(e) => setCustomForm({ ...customForm, address: e.target.value })}
                          style={{ ...inputStyle, padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                        />
                      </div>
                      {customError && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{customError}</span>}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <button
                          type="button"
                          onClick={() => setIsAddingCustom(false)}
                          style={{ padding: '0.35rem 0.75rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', color: '#475569' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddCustomCompany}
                          style={{ padding: '0.35rem 0.75rem', background: '#0284c7', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', color: '#ffffff', fontWeight: '600' }}
                        >
                          Add & Select
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dropdown Input */}
                <div style={{ position: 'relative' }} ref={companyDropdownRef}>
                  <div
                    onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                    style={{
                      ...inputStyle,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <span style={{ color: companySplits.length > 0 ? '#0f172a' : '#94a3b8', fontSize: '0.85rem' }}>
                      {companySplits.length > 0 
                        ? `${companySplits.map(s => s.companyName).join(', ')} (${companySplits.length} selected)`
                        : '-- Click to select companies from Onboarding or Custom --'}
                    </span>
                    <i className={`bx bx-chevron-${isCompanyDropdownOpen ? 'up' : 'down'}`} style={{ color: '#64748b' }}></i>
                  </div>

                  {/* Dropdown Menu */}
                  {isCompanyDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      marginTop: '4px',
                      zIndex: 30,
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      maxHeight: '200px',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <div style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search company or tax ID..."
                          value={companySearch}
                          onChange={(e) => setCompanySearch(e.target.value)}
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
                        {filteredCompanies.length === 0 ? (
                          <div style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                            No companies found. Add a custom company above.
                          </div>
                        ) : (
                          filteredCompanies.map(c => {
                            const isChecked = companySplits.some(s => s.id === c.id);
                            return (
                              <div
                                key={c.id}
                                onClick={() => toggleCompanySelection(c)}
                                style={{
                                  padding: '0.5rem 0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  cursor: 'pointer',
                                  background: isChecked ? '#f0f9ff' : '#ffffff',
                                  borderBottom: '1px solid #f8fafc'
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  readOnly
                                  style={{ accentColor: '#0284c7', width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <span style={{ fontWeight: '600', fontSize: '0.85rem', color: '#0f172a' }}>{c.companyName}</span>
                                    <span style={{
                                      fontSize: '0.65rem',
                                      padding: '0.1rem 0.35rem',
                                      borderRadius: '3px',
                                      background: c.source === 'custom' ? '#f5f3ff' : '#eff6ff',
                                      color: c.source === 'custom' ? '#6d28d9' : '#1d4ed8',
                                      fontWeight: '600'
                                    }}>
                                      {c.source === 'custom' ? 'Custom' : 'Onboarding'}
                                    </span>
                                  </div>
                                  {c.taxDetails && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Tax: {c.taxDetails}</div>}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {errors.companies && (
                  <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                    <i className="bx bx-error-circle" style={{ marginRight: '0.25rem' }}></i>
                    {errors.companies}
                  </div>
                )}

                {/* Percentage Option Section */}
                {companySplits.length > 0 && (
                  <div style={{ marginTop: '0.85rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <i className="bx bx-pie-chart-alt-2" style={{ color: '#0284c7' }}></i>
                        Percentage Allocation ({companySplits.length} selected)
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: Math.round(totalPercentage) === 100 ? '#dcfce7' : '#fee2e2',
                          color: Math.round(totalPercentage) === 100 ? '#166534' : '#991b1b',
                          border: Math.round(totalPercentage) === 100 ? '1px solid #bbf7d0' : '1px solid #fecaca'
                        }}>
                          {Math.round(totalPercentage) === 100 ? '100% Split' : `${totalPercentage}% / 100%`}
                        </span>

                        {companySplits.length > 1 && (
                          <button
                            type="button"
                            onClick={applyEqualSplit}
                            style={{
                              background: '#0284c7',
                              color: '#ffffff',
                              border: 'none',
                              padding: '0.25rem 0.55rem',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Equal Split
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {companySplits.map((split) => {
                        const share = ((val * (parseFloat(split.percentage) || 0)) / 100).toFixed(2);
                        return (
                          <div
                            key={split.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.5rem 0.75rem',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              gap: '0.5rem'
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: '600', fontSize: '0.82rem', color: '#0f172a' }}>{split.companyName}</div>
                              {split.taxDetails && <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Tax/GST: {split.taxDetails}</div>}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="1"
                                  value={split.percentage}
                                  onChange={(e) => handlePercentageChange(split.id, e.target.value)}
                                  style={{
                                    width: '55px',
                                    padding: '0.3rem 0.4rem',
                                    borderRadius: '4px',
                                    border: '1px solid #cbd5e1',
                                    textAlign: 'right',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    color: '#0f172a'
                                  }}
                                />
                                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>%</span>
                              </div>

                              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0284c7', minWidth: '85px', textAlign: 'right' }}>
                                {share} {formData.contractCurrency}
                              </div>

                              {companySplits.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => toggleCompanySelection(split)}
                                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                                  title="Remove company"
                                >
                                  <i className="bx bx-trash" style={{ fontSize: '1rem' }}></i>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
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
