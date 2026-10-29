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
  onSaveAndSchedule,
  divisionId, 
  initialData = null, 
  isReadOnly = false 
}) {
  // All available companies (from onboarding + custom)
  const [allCompanies, setAllCompanies] = useState([]);
  // Mode: 'select' (choose onboarding entity) vs 'custom' (create new custom entity)
  const [entityMode, setEntityMode] = useState('select');
  // Selected company for this contract
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Dropdown state
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  const [customForm, setCustomForm] = useState({ companyName: '', taxDetails: '', address: '' });
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

  // Close dropdowns on outside click
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

  // Load companies for division
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

      // Add any custom entities from initialData if editing
      if (initialData?.companyEntities && initialData.companyEntities.length > 0) {
        initialData.companyEntities.forEach(ce => {
          if (!companies.find(c => c.id === ce.id || c.companyName === ce.companyName)) {
            companies.push({
              id: ce.id || ('custom_' + Math.random()),
              companyName: ce.companyName,
              taxDetails: ce.taxDetails || '',
              address: ce.address || '',
              source: ce.source || 'custom'
            });
          }
        });
        setAllCompanies(companies);
        const isCustom = ceFirst.source === 'custom' || (!companies.find(c => c.source === 'onboarding' && c.companyName === ceFirst.companyName));
        if (isCustom) {
          setEntityMode('custom');
          setCustomForm({
            companyName: ceFirst.companyName || initialData.companyName || '',
            taxDetails: ceFirst.taxDetails || initialData.taxDetails || '',
            address: ceFirst.address || initialData.address || ''
          });
          setSelectedCompany(ceFirst);
        } else {
          setEntityMode('select');
          const onboardingComp = companies.find(c => c.source === 'onboarding') || (companies.length > 0 ? companies[0] : null);
          const match = companies.find(c => c.id === ceFirst.id || c.companyName === ceFirst.companyName);
          setSelectedCompany(match || onboardingComp || ceFirst);
          setCustomForm({ companyName: '', taxDetails: '', address: '' });
        }
      } else if (initialData?.companyName) {
        const found = companies.find(c => c.companyName === initialData.companyName);
        if (found && found.source !== 'custom') {
          setAllCompanies(companies);
          setEntityMode('select');
          setSelectedCompany(found);
          setCustomForm({ companyName: '', taxDetails: '', address: '' });
        } else {
          const custom = {
            id: 'custom_1',
            companyName: initialData.companyName,
            taxDetails: initialData.taxDetails || '',
            address: initialData.address || '',
            source: 'custom'
          };
          setAllCompanies([custom, ...companies]);
          setEntityMode('custom');
          setCustomForm({
            companyName: initialData.companyName || '',
            taxDetails: initialData.taxDetails || '',
            address: initialData.address || ''
          });
          setSelectedCompany(custom);
        }
      } else {
        // Creating NEW contract: Auto-select company from Onboarding
        setAllCompanies(companies);
        setEntityMode('select');
        const onboardingComp = companies.find(c => c.source === 'onboarding') || (companies.length > 0 ? companies[0] : null);
        setSelectedCompany(onboardingComp);
        setCustomForm({ companyName: '', taxDetails: '', address: '' });
      }

      if (initialData) {
        setFormData({
          contractValue: initialData.contractValue !== undefined ? initialData.contractValue : '1500',
          contractCurrency: initialData.contractCurrency || 'EUR',
          currencyExchangeValue: initialData.currencyExchangeValue !== undefined ? initialData.currencyExchangeValue : '0.86',
          paymentDueDays: initialData.paymentDueDays !== undefined ? initialData.paymentDueDays : '15',
          billFrom: initialData.billFrom || 'MCHI',
          receivingBankName: initialData.receivingBankName || 'AirWallex',
          billingDate: initialData.billingDate || new Date().toISOString().split('T')[0],
          bankDetailsLink: initialData.bankDetailsLink || '',
          remarks: initialData.remarks || ''
        });
      } else {
        const defaultDate = new Date().toISOString().split('T')[0];
        setFormData({
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
        setCustomForm({ companyName: '', taxDetails: '', address: '' });
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

  const handleSelectCompany = (comp) => {
    setSelectedCompany(comp);
    setIsCompanyDropdownOpen(false);
    if (errors.company) setErrors(prev => ({ ...prev, company: null }));
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
    if (entityMode === 'select') {
      if (!selectedCompany) {
        newErrors.company = 'Please select a company / entity from Onboarding';
      }
    } else {
      if (!customForm.companyName.trim()) {
        newErrors.customCompanyName = 'Company / Entity Name is required';
      }
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

  const handleSave = (andSchedule = false) => {
    if (isReadOnly) {
      onClose();
      return;
    }
    if (!validate()) return;

    let targetEntity = selectedCompany;
    if (entityMode === 'custom') {
      targetEntity = {
        id: initialData?.companyEntities?.[0]?.id || ('custom_' + Date.now()),
        companyName: customForm.companyName.trim(),
        taxDetails: customForm.taxDetails.trim(),
        address: customForm.address.trim(),
        source: 'custom'
      };
      setAllCompanies(prev => {
        if (!prev.find(c => c.companyName === targetEntity.companyName)) {
          return [...prev, targetEntity];
        }
        return prev;
      });
    }

    const savedContract = {
      id: initialData?.id || (Date.now() + Math.random()),
      divisionId: divisionId || initialData?.divisionId || '',
      orderId: initialData?.orderId || '',
      orderName: initialData?.orderName || '',
      companyEntities: targetEntity ? [targetEntity] : [],
      billingSplits: targetEntity ? [{ ...targetEntity, selected: true }] : [],
      companyName: targetEntity?.companyName || '',
      taxDetails: targetEntity?.taxDetails || '',
      address: targetEntity?.address || '',
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

    if (andSchedule && onSaveAndSchedule) {
      onSaveAndSchedule(savedContract);
    } else if (onSave) {
      onSave(savedContract, andSchedule);
    }
  };

  const filteredCurrencies = currenciesList.filter(c => 
    c.code.toLowerCase().includes(currencySearch.toLowerCase()) || 
    c.name.toLowerCase().includes(currencySearch.toLowerCase())
  );

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
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
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
              Select an Onboarding company or create a custom entity, and set commercial terms.
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

          {/* Section 1: Company / Entity Selection or Creation */}
          <div style={{ background: '#f8fafc', border: (errors.company || errors.customCompanyName) ? '1px solid #ef4444' : '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>
                <i className="bx bx-buildings" style={{ color: '#0284c7' }}></i>
                Company / Entity <span style={{ color: '#ef4444' }}>*</span>
                <Tooltip text="Select an existing company from Onboarding or create a custom company entity." align="left" />
              </label>
            </div>

            {/* Option Selector: Select Existing vs Create Custom */}
            {!isReadOnly && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1rem' }}>
                <div
                  onClick={() => {
                    setEntityMode('select');
                    const onboardingComp = allCompanies.find(c => c.source === 'onboarding') || (allCompanies.length > 0 ? allCompanies[0] : null);
                    if (onboardingComp) {
                      setSelectedCompany(onboardingComp);
                    }
                    if (errors.customCompanyName) setErrors(prev => ({ ...prev, customCompanyName: null }));
                    if (errors.company) setErrors(prev => ({ ...prev, company: null }));
                  }}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: entityMode === 'select' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    background: entityMode === 'select' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <input
                    type="radio"
                    name="entityMode"
                    checked={entityMode === 'select'}
                    onChange={() => {
                      setEntityMode('select');
                      const onboardingComp = allCompanies.find(c => c.source === 'onboarding') || (allCompanies.length > 0 ? allCompanies[0] : null);
                      if (onboardingComp) {
                        setSelectedCompany(onboardingComp);
                      }
                      if (errors.customCompanyName) setErrors(prev => ({ ...prev, customCompanyName: null }));
                      if (errors.company) setErrors(prev => ({ ...prev, company: null }));
                    }}
                    style={{ accentColor: '#0284c7', cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: '700', color: entityMode === 'select' ? '#1e40af' : '#334155' }}>
                      Select from Onboarding
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Choose pre-configured entity
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setEntityMode('custom');
                    if (errors.company) setErrors(prev => ({ ...prev, company: null }));
                  }}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: entityMode === 'custom' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    background: entityMode === 'custom' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <input
                    type="radio"
                    name="entityMode"
                    checked={entityMode === 'custom'}
                    onChange={() => setEntityMode('custom')}
                    style={{ accentColor: '#0284c7', cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: '700', color: entityMode === 'custom' ? '#1e40af' : '#334155' }}>
                      Create Custom Entity
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Specify new company, tax & address
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 1: Select from Onboarding */}
            {entityMode === 'select' && (
              <div>
                {/* If multiple onboarding companies exist in legacy data, show quick selector tabs */}
                {allCompanies.filter(c => c.source === 'onboarding').length > 1 && (
                  <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                    {allCompanies.filter(c => c.source === 'onboarding').map(c => {
                      const isSel = selectedCompany && (selectedCompany.id === c.id || selectedCompany.companyName === c.companyName);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedCompany(c);
                            if (errors.company) setErrors(prev => ({ ...prev, company: null }));
                          }}
                          style={{
                            padding: '0.3rem 0.65rem',
                            borderRadius: '5px',
                            border: isSel ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                            background: isSel ? '#eff6ff' : '#ffffff',
                            color: isSel ? '#0284c7' : '#475569',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          {c.companyName}
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedCompany ? (
                  <div style={{
                    padding: '0.9rem 1.1rem',
                    background: '#f8fafc',
                    border: '1.5px solid #bfdbfe',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          background: '#dbeafe',
                          color: '#1e40af',
                          fontSize: '0.68rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}>
                          Onboarding Entity
                        </span>
                        <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>
                          {selectedCompany.companyName}
                        </span>
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#16a34a', fontSize: '0.75rem', fontWeight: '600' }}>
                        <i className="bx bx-check-circle" style={{ fontSize: '0.95rem' }}></i> Active from Onboarding
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: '500', marginBottom: '0.15rem' }}>
                          GST / Tax Number / VAT
                        </span>
                        <span style={{ color: '#0f172a', fontWeight: '600' }}>
                          {selectedCompany.taxDetails || <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 'normal' }}>Not specified</span>}
                        </span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: '500', marginBottom: '0.15rem' }}>
                          Registered Address
                        </span>
                        <span style={{ color: '#334155', fontWeight: '500', lineHeight: '1.4' }}>
                          {selectedCompany.address || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not specified</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '1rem',
                    background: '#fffbeb',
                    border: '1px solid #fef3c7',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    color: '#92400e',
                    fontSize: '0.82rem',
                    lineHeight: '1.5'
                  }}>
                    <i className="bx bx-info-circle" style={{ fontSize: '1.25rem', color: '#d97706', flexShrink: 0, marginTop: '2px' }}></i>
                    <div>
                      <div style={{ fontWeight: '700', marginBottom: '0.2rem' }}>No Onboarding Entity Found</div>
                      <div>No registered entity details were found in the Onboarding form for this division yet. You can complete the Onboarding form or select <strong>Create Custom Entity</strong> above to add company details for this contract.</div>
                    </div>
                  </div>
                )}

                {errors.company && (
                  <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                    <i className="bx bx-error-circle" style={{ marginRight: '0.25rem' }}></i>
                    {errors.company}
                  </div>
                )}
              </div>
            )}

            {/* Mode 2: Create Custom Entity */}
            {entityMode === 'custom' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.85rem' }}>
                <div>
                  <label style={{ ...labelStyle, fontSize: '0.8rem' }}>
                    Custom Company / Entity Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    placeholder="e.g. Acme Germany GmbH"
                    value={customForm.companyName}
                    onChange={(e) => {
                      setCustomForm({ ...customForm, companyName: e.target.value });
                      if (errors.customCompanyName) setErrors(prev => ({ ...prev, customCompanyName: null }));
                    }}
                    style={inputStyle}
                  />
                  {errors.customCompanyName && (
                    <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      <i className="bx bx-error-circle" style={{ marginRight: '0.25rem' }}></i>
                      {errors.customCompanyName}
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ ...labelStyle, fontSize: '0.8rem' }}>Tax / GST Number</label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      placeholder="e.g. DE123456789"
                      value={customForm.taxDetails}
                      onChange={(e) => setCustomForm({ ...customForm, taxDetails: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, fontSize: '0.8rem' }}>Registered Address</label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      placeholder="e.g. Berlin, Germany"
                      value={customForm.address}
                      onChange={(e) => setCustomForm({ ...customForm, address: e.target.value })}
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

            {/* Remarks (Invoice Notes) */}
            <div style={{ marginTop: '0.85rem' }}>
              <label style={labelStyle}>
                Remarks <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '400' }}>(Appears on invoice & billing details)</span>
              </label>
              <textarea
                name="remarks"
                disabled={isReadOnly}
                rows="2"
                placeholder="e.g. Monthly subscription fee, Milestone 1, etc."
                value={formData.remarks || ''}
                onChange={handleInputChange}
                style={{ ...inputStyle, resize: 'vertical', minHeight: '52px' }}
              />
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
          {!isReadOnly && (
            <button
              type="button"
              onClick={() => handleSave(true)}
              style={{
                padding: '0.55rem 1.25rem',
                backgroundColor: '#ecfdf5',
                border: '1.5px solid #a7f3d0',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#059669',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#d1fae5';
                e.currentTarget.style.borderColor = '#6ee7b7';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#ecfdf5';
                e.currentTarget.style.borderColor = '#a7f3d0';
              }}
              title="Save contract and schedule billing in Accounts Receivable"
            >
              <i className="bx bx-calendar-plus" style={{ fontSize: '1.1rem' }}></i>
              Save and Schedule Billing
            </button>
          )}

          {!isReadOnly && (
            <button
              type="button"
              onClick={() => handleSave(false)}
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
