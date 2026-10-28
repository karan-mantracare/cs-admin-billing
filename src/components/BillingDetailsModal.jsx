import React, { useState, useEffect, useRef } from 'react';

const BANK_DETAILS_CSV = `company;bank;bank link;default;accepted currency
MCC;AirWallex;https://drive.google.com/file/d/117mGedlJb_piH4TW1SubSRYkwAuPDfZG/view?usp=drive_link;0;AUD
MCHI;AirWallex;https://drive.google.com/file/d/1QHtoaXjD2hdOZK83CFndUnWjbgerqJ7q/view?usp=drive_link;0;AUD
MCC;AirWallex;https://drive.google.com/file/d/1Btl-pf-h4gncrX1YsR8NsZn74JkkMnwg/view?usp=drive_link;0;AUD, AED, CAD, CHF, CNY, CZK, DKK, EUR, HKD, HUF, ILS, JPY, MXN, NOK, NZD, PLN, RON, SEK, SGD, USD, GBP and ZAR
MCHI;AirWallex;https://drive.google.com/file/d/1QhXVG_Qb1Tw7bm_9apMxLFnctpGYWpEf/view?usp=sharing;0;AUD, AED, CAD, CHF, CNY, CZK, DKK, EUR, HKD, HUF, ILS, JPY, MXN, NOK, NZD, PLN, RON, SEK, SGD, USD, GBP and ZAR
MCHPL;ICICI;https://drive.google.com/file/d/1J7DCpvwqbFDB-04L_Trt8Jy8GZN68Iy9/view?usp=drive_link;0;INR
MCHI;AirWallex;https://drive.google.com/file/d/1wns1H0nHteKsYkXgrMXuFPkOv7Bmxzxi/view?usp=drive_link;0;MXN
MR UK;AirWallex;https://drive.google.com/file/d/1_51-z8D6WtS8GeBO-jaQyB6_WanFkz57/view?usp=drive_link;1;AUD, AED, CAD, CHF, CNY, CZK, DKK, EUR, HKD, HUF, ILS, JPY, MXN, NOK, NZD, PLN, RON, SEK, SGD, USD, GBP and ZAR
MCC;AirWallex;https://drive.google.com/file/d/1zgoO2KC4pmfAmL7qbkOYtRYYInURDJsT/view?usp=drive_link;0;AUD, AED, CAD, CHF, CNY, CZK, DKK, EUR, HKD, HUF, ILS, JPY, MXN, NOK, NZD, PLN, RON, SEK, SGD, USD, GBP and ZAR
MCHI;AirWallex;https://drive.google.com/file/d/1GZ59moByw5zONAOJu3vIa43wD0vbrnJ2/view?usp=drive_link;0;AUD, AED, CAD, CHF, CNY, CZK, DKK, EUR, HKD, HUF, ILS, JPY, MXN, NOK, NZD, PLN, RON, SEK, SGD, USD, GBP and ZAR
MCC;AirWallex;https://drive.google.com/file/d/1IQrgJRFXHZxAnNDRP_83RpDjXCTYaJyO/view?usp=drive_link;0;AUD, AED, CAD, CHF, CNY, CZK, DKK, EUR, HKD, HUF, ILS, JPY, MXN, NOK, NZD, PLN, RON, SEK, SGD, USD, GBP and ZAR
MR UK;Wise;https://drive.google.com/file/d/1wavakG1SDI_BFfnO-tYfFpBWgr2nGOzd/view?usp=drive_link;0;PHP
MCC;Mercury;https://drive.google.com/file/d/1pxAys0dKdoxtK_IY1v6AwbiSr2F9kzjs/view?usp=drive_link;0;AUD, AED, CAD, CHF, CNY, CZK, DKK, EUR, HKD, HUF, ILS, JPY, MXN, NOK, NZD, PLN, RON, SEK, SGD, USD, GBP and ZAR
MRC UAE;ENBD;https://drive.google.com/drive/folders/1ki8U9pAr2XetaTST-S3JgswBilZf7So3?usp=sharing;1;AED
MCC;AirWallex;https://drive.google.com/file/d/1jCS2dNr1d010iZ-VH-d6S6tSNGZz94p7/view?usp=drive_link;0;AED
MCHI;AirWallex;https://drive.google.com/file/d/1gQC0kagkN_uZBGQL1jSzh7e1bYaUld1h/view?usp=drive_link;0;AED
MR UK;AirWallex;https://drive.google.com/file/d/1N-TxfYFCQ12g_mat0lcj88YU7rzBCA3m/view?usp=drive_link;0;AUD, AED, CAD, CHF, CNY, CZK, DKK, EUR, HKD, HUF, ILS, JPY, MXN, NOK, NZD, PLN, RON, SEK, SGD, USD, GBP and ZAR
MCC;AirWallex;https://drive.google.com/file/d/1u8wAUz8H6kkYxpeguTuC2rXsRO3oBLad/view?usp=drive_link;0;GBP
MCC;AirWallex;https://drive.google.com/file/d/1IQrgJRFXHZxAnNDRP_83RpDjXCTYaJyO/view?usp=drive_link;1;AUD, AED, CAD, CHF, CNY, CZK, DKK, EUR, HKD, HUF, ILS, JPY, MXN, NOK, NZD, PLN, RON, SEK, SGD, USD, GBP and ZAR
MR UK;AirWallex;https://drive.google.com/file/d/1MsRPivodBnZEXNinp5rhI55o1qONNL-a/view?usp=drive_link;0;AUD, AED, CAD, CHF, CNY, CZK, DKK, EUR, HKD, HUF, ILS, JPY, MXN, NOK, NZD, PLN, RON, SEK, SGD, USD, GBP and ZAR
MCHI;AirWallex;https://drive.google.com/file/d/1qGVE9gBD67kAyk1qtr1NDGZBZefjTOsy/view?usp=drive_link;1;AUD, AED, CAD, CHF, CNY, CZK, DKK, EUR, HKD, HUF, ILS, JPY, MXN, NOK, NZD, PLN, RON, SEK, SGD, USD, GBP and ZAR
MCC;AirWallex;https://drive.google.com/file/d/1LSWVAatdx82Wb22QZWO5hUB-1VKybuUT/view?usp=drive_link;0;AUD, AED, CAD, CHF, CNY, CZK, DKK, EUR, HKD, HUF, ILS, JPY, MXN, NOK, NZD, PLN, RON, SEK, SGD, USD, GBP and ZAR
MCC;Wise;https://drive.google.com/file/d/1tmHp04ed2TvXZPP3RYzk4asGn12TCWRw/view?usp=drive_link;0;PHP
MCHI;Wise;https://drive.google.com/file/d/17i3QLWyueV5LC8g_58JDiB5JxcEWO2pR/view?usp=drive_link;0;PHP
MCHI;Wise;https://drive.google.com/file/d/1Itmlx1UehHESj1hr9Hr-gCCUbPIWu4LQ/view?usp=drive_link;0;SGD`;

const parseBankDetails = () => {
  const rows = BANK_DETAILS_CSV.split('\n').filter(Boolean).slice(1);
  return rows.map(row => {
    const [company, bank, link, isDefault, acceptedCurrencies] = row.split(';');
    const currenciesList = acceptedCurrencies ? acceptedCurrencies.split(',').map(c => c.replace(' and ', '').trim()) : [];
    return { company, bank, link, isDefault: isDefault === '1', currencies: currenciesList };
  });
};

const bankData = parseBankDetails();

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
      <i className="bx bx-info-circle" style={{ color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}></i>
      {isVisible && (
        <div style={{
          position: 'absolute',
          bottom: '120%',
          ...posStyles,
          marginBottom: '5px',
          backgroundColor: '#334155',
          color: 'white',
          padding: '5px 8px',
          borderRadius: '4px',
          fontSize: '0.65rem',
          fontWeight: '400',
          whiteSpace: 'normal',
          width: 'max-content',
          maxWidth: '180px',
          textAlign: align === 'center' ? 'center' : (align === 'right' ? 'right' : 'left'),
          zIndex: 9999,
          pointerEvents: 'none',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          {text}
          <div style={{
            position: 'absolute',
            top: '100%',
            ...arrowStyles,
            borderWidth: '4px',
            borderStyle: 'solid',
            borderColor: '#334155 transparent transparent transparent'
          }}></div>
        </div>
      )}
    </div>
  );
};

function BillingDetailsModal({ isOpen, onClose, onSave, initialData, divisionId, openAddCompany }) {
  const [formData, setFormData] = useState({
    billingEntity: 'HR Provided Entity', // Mock default or pass from props
    taxDetails: 'GST-1234', // Mock default
    billingAddress: '',
    contractValue: '',
    clientCurrency: '',
    currencyExchangeValue: '1',
    paymentDueDays: '',
    billFrom: '',
    receivingBankName: '',
    bankDetailsLink: '',
    billingDate: ''
  });

  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [newCompanyForm, setNewCompanyForm] = useState({ companyName: '', taxDetails: '', address: '' });
  const [companyError, setCompanyError] = useState('');

  const [billingSplits, setBillingSplits] = useState([]);
  const [isSplitCollapsed, setIsSplitCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'SGD', name: 'Singapore Dollar' },
    { code: 'AED', name: 'UAE Dirham' },
    { code: 'PHP', name: 'Philippine Peso' }
  ];

  const filteredCurrencies = currencies.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [errors, setErrors] = useState({});
  const [divisionContracts, setDivisionContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState('');

  useEffect(() => {
    if (isOpen) {
      let hrEntity = '';
      let hrTax = '';
      let hrAddress = '';
      let companiesFromOnboarding = [];
      const targetId = divisionId || initialData?.id || '1';
      
      try {
        const savedData = localStorage.getItem('onboardingFiled_' + targetId);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          if (parsedData.billingDetails) {
            hrEntity = parsedData.billingDetails.companyName || hrEntity;
            hrTax = parsedData.billingDetails.gstNumber || hrTax;
            hrAddress = parsedData.billingDetails.address || hrAddress;
            if (parsedData.billingDetails.companies?.length) {
              companiesFromOnboarding = parsedData.billingDetails.companies.filter(c => c.companyName && c.companyName.trim()).map(c => ({
                id: c.id || ('onb_' + Math.random()),
                companyName: c.companyName,
                taxDetails: c.gstNumber || '',
                address: c.address || '',
                source: 'onboarding'
              }));
            } else if (parsedData.billingDetails.companyName) {
              companiesFromOnboarding = [{
                id: 'onb_1',
                companyName: parsedData.billingDetails.companyName,
                taxDetails: parsedData.billingDetails.gstNumber || '',
                address: parsedData.billingDetails.address || '',
                source: 'onboarding'
              }];
            }
          }
        }
      } catch (e) {
        console.error("Could not parse onboarding data", e);
      }

      // Load custom companies
      let customCompaniesList = [];
      try {
        const savedCustom = localStorage.getItem('custom_companies_' + targetId);
        if (savedCustom) {
          customCompaniesList = JSON.parse(savedCustom);
        }
      } catch (e) {
        console.error("Could not parse custom companies", e);
      }

      // Merge pool of companies
      const mergedPool = [...companiesFromOnboarding];
      customCompaniesList.forEach(cc => {
        if (!mergedPool.find(m => m.companyName?.toLowerCase() === cc.companyName?.toLowerCase())) {
          mergedPool.push(cc);
        }
      });

      // Load division contracts
      try {
        const contractsStr = localStorage.getItem('division_contracts');
        if (contractsStr) {
          const allC = JSON.parse(contractsStr);
          const divContracts = allC.filter(c => String(c.divisionId) === String(targetId));
          setDivisionContracts(divContracts);
          
          divContracts.forEach(dc => {
            if (dc.companyEntities && dc.companyEntities.length > 0) {
              dc.companyEntities.forEach(ce => {
                if (!mergedPool.find(m => m.companyName?.toLowerCase() === ce.companyName?.toLowerCase())) {
                  mergedPool.push({
                    id: ce.id || ('custom_' + Math.random()),
                    companyName: ce.companyName,
                    taxDetails: ce.taxDetails || '',
                    address: ce.address || '',
                    source: 'custom'
                  });
                }
              });
            } else if (dc.companyName && !mergedPool.find(m => m.companyName?.toLowerCase() === dc.companyName?.toLowerCase())) {
              mergedPool.push({
                id: 'custom_' + dc.id,
                companyName: dc.companyName,
                taxDetails: dc.taxDetails || '',
                address: dc.address || '',
                source: 'custom'
              });
            }
          });
        } else {
          setDivisionContracts([]);
        }
      } catch (e) {
        setDivisionContracts([]);
      }

      setAvailableCompanies(mergedPool);

      // Initialize billingSplits
      if (initialData?.billingSplits?.length) {
        setBillingSplits(initialData.billingSplits);
      } else if (companiesFromOnboarding.length > 1) {
        const count = companiesFromOnboarding.length;
        const base = Math.floor(100 / count);
        const remainder = 100 - (base * count);
        const generated = companiesFromOnboarding.map((comp, idx) => ({
          id: comp.id || idx + 1,
          companyName: comp.companyName,
          gstNumber: comp.taxDetails || comp.gstNumber || '',
          address: comp.address || '',
          selected: true,
          percentage: idx === count - 1 ? (base + remainder) : base
        }));
        setBillingSplits(generated);
      } else {
        setBillingSplits([]);
      }

      if (initialData?.linkedContract?.id) {
        setSelectedContractId(String(initialData.linkedContract.id));
      }

      setFormData(prev => ({
        ...prev,
        ...initialData,
        billingEntity: initialData?.billingEntity || hrEntity,
        taxDetails: initialData?.taxDetails || hrTax,
        billingAddress: initialData?.billingAddress || initialData?.linkedContract?.address || hrAddress || '',
        isLinkedFromContract: !!initialData?.linkedContract
      }));
      setErrors({});

      if (openAddCompany) {
        setIsAddingCompany(true);
      } else {
        setIsAddingCompany(false);
      }
      setCompanyError('');
      setNewCompanyForm({ companyName: '', taxDetails: '', address: '' });
    }
  }, [initialData, isOpen, openAddCompany]);

  // Compute Bank Details Link
  useEffect(() => {
    if (formData.billFrom && formData.receivingBankName && formData.clientCurrency) {
      const { billFrom, receivingBankName, clientCurrency } = formData;
      const matchingRows = bankData.filter(r => r.company.toLowerCase().replace(/\s/g, '') === billFrom.toLowerCase().replace(/\s/g, '') && r.bank.toLowerCase() === receivingBankName.toLowerCase());
      
      let link = '';
      if (matchingRows.length > 0) {
        const exactMatch = matchingRows.find(r => r.currencies.includes(clientCurrency));
        if (exactMatch) {
          link = exactMatch.link;
        } else {
          const defaultMatch = matchingRows.find(r => r.isDefault);
          if (defaultMatch) {
            link = defaultMatch.link;
          } else {
            link = matchingRows[0].link; // Fallback
          }
        }
      }
      setFormData(prev => ({ ...prev, bankDetailsLink: link }));
    }
  }, [formData.billFrom, formData.receivingBankName, formData.clientCurrency]);

  if (!isOpen) return null;

  // Calculate Amount in USD
  const contractVal = parseFloat(formData.contractValue) || 0;
  const exchangeVal = parseFloat(formData.currencyExchangeValue) || 1;
  const amountInUSD = exchangeVal !== 0 ? (contractVal / exchangeVal).toFixed(2) : 0;

  // Split calculations and actions
  const totalPercentage = billingSplits
    .filter(s => s.selected)
    .reduce((sum, s) => sum + (Number(s.percentage) || 0), 0);

  const applyEqualSplit = () => {
    const selectedCompanies = billingSplits.filter(s => s.selected);
    const selectedCount = selectedCompanies.length;
    if (selectedCount === 0) return;

    const base = Math.floor(100 / selectedCount);
    const remainder = 100 - (base * selectedCount);
    let selectedIdx = 0;

    setBillingSplits(prev => prev.map(s => {
      if (!s.selected) return { ...s, percentage: 0 };
      const isLast = (selectedIdx === selectedCount - 1);
      const pct = isLast ? (base + remainder) : base;
      selectedIdx++;
      return { ...s, percentage: pct };
    }));

    if (errors.billingSplits) {
      setErrors(prev => ({ ...prev, billingSplits: null }));
    }
  };

  const toggleCompanySelection = (id) => {
    setBillingSplits(prev => prev.map(s => {
      if (s.id === id) {
        const nextSelected = !s.selected;
        return { 
          ...s, 
          selected: nextSelected, 
          percentage: nextSelected ? (s.percentage || 0) : 0 
        };
      }
      return s;
    }));
  };

  const handlePercentageChange = (id, newPctVal) => {
    const val = newPctVal === '' ? '' : Math.max(0, Math.min(100, Number(newPctVal) || 0));
    setBillingSplits(prev => prev.map(s => s.id === id ? { ...s, percentage: val } : s));
    if (errors.billingSplits) {
      setErrors(prev => ({ ...prev, billingSplits: null }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSaveNewCompany = () => {
    if (!newCompanyForm.companyName.trim()) {
      setCompanyError('Company Name is required.');
      return;
    }

    const targetId = divisionId || initialData?.id || '1';
    const newComp = {
      id: 'custom_' + Date.now(),
      companyName: newCompanyForm.companyName.trim(),
      taxDetails: newCompanyForm.taxDetails.trim(),
      address: newCompanyForm.address.trim(),
      source: 'custom'
    };

    // Save to custom_companies
    let currentCustom = [];
    try {
      const saved = localStorage.getItem('custom_companies_' + targetId);
      if (saved) currentCustom = JSON.parse(saved);
    } catch (e) {}

    const updatedCustom = [...currentCustom, newComp];
    localStorage.setItem('custom_companies_' + targetId, JSON.stringify(updatedCustom));

    setAvailableCompanies(prev => [...prev, newComp]);
    
    // Auto-select this company as billing entity
    setFormData(prev => ({
      ...prev,
      billingEntity: newComp.companyName,
      taxDetails: newComp.taxDetails,
      billingAddress: newComp.address,
      companyName: newComp.companyName,
      isLinkedFromContract: false,
      isCustomCompany: true
    }));

    // Update billing splits if applicable
    if (billingSplits.length > 0) {
      setBillingSplits(prev => [...prev, {
        id: newComp.id,
        companyName: newComp.companyName,
        gstNumber: newComp.taxDetails,
        address: newComp.address,
        percentage: 0,
        selected: true
      }]);
    } else {
      setBillingSplits([{
        id: newComp.id,
        companyName: newComp.companyName,
        gstNumber: newComp.taxDetails,
        address: newComp.address,
        percentage: 100,
        selected: true
      }]);
    }

    setNewCompanyForm({ companyName: '', taxDetails: '', address: '' });
    setCompanyError('');
    setIsAddingCompany(false);
  };

  const handleSave = () => {
    let newErrors = {};
    if (!formData.billFrom) newErrors.billFrom = 'Bill From entity is required.';
    if (!formData.clientCurrency) newErrors.clientCurrency = 'Client Currency is required.';
    if (contractVal === 0) newErrors.contractValue = 'Contract value cannot be 0.';
    if (!formData.paymentDueDays) newErrors.paymentDueDays = 'Payment Due (in Days) is required.';
    if (!formData.receivingBankName) newErrors.receivingBankName = 'Receiving Bank Name is required.';
    if (!formData.bankDetailsLink) newErrors.bankDetailsLink = 'Bank Details Link is required.';
    if (!formData.billingDate) newErrors.billingDate = 'Billing Date is required.';

    if (billingSplits.length > 1) {
      const selectedEntities = billingSplits.filter(s => s.selected);
      if (selectedEntities.length === 0) {
        newErrors.billingSplits = 'Please select at least one company entity for billing.';
      } else if (totalPercentage !== 100) {
        newErrors.billingSplits = `Total billing split percentage must equal 100% (currently ${totalPercentage}%). Use "Equal Split" or adjust manually.`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Attach calculated splits and updated entity information
    let updatedEntity = formData.billingEntity;
    let updatedTax = formData.taxDetails;
    let finalSplits = [];

    if (billingSplits.length > 1) {
      finalSplits = billingSplits.map(s => ({
        ...s,
        splitAmount: s.selected ? Number(((contractVal * (Number(s.percentage) || 0)) / 100).toFixed(2)) : 0
      }));

      const selectedList = finalSplits.filter(s => s.selected);
      if (selectedList.length === 1) {
        updatedEntity = selectedList[0].companyName;
        updatedTax = selectedList[0].gstNumber || formData.taxDetails;
      } else if (selectedList.length > 1) {
        updatedEntity = `${selectedList[0].companyName} (+${selectedList.length - 1} entities)`;
        updatedTax = selectedList.map(s => s.gstNumber).filter(Boolean).join(', ') || formData.taxDetails;
      }
    }

    onSave({ 
      ...formData, 
      billingEntity: updatedEntity,
      taxDetails: updatedTax,
      amountInUSD,
      billingSplits: finalSplits
    });
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
        background: 'white', borderRadius: '12px', width: '90%', maxWidth: '560px', maxHeight: '90vh',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0369a1, #0ea5e9)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.05rem', color: 'white', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className='bx bx-spreadsheet'></i> Billing Details
            </h2>
            <p style={{ margin: '0.15rem 0 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem' }}>Configure contract, entities and payment method</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '6px', width: '30px', height: '30px', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          
            {/* Add Company Inline Form */}
            {isAddingCompany && (
              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #0284c7',
                borderRadius: '8px',
                padding: '0.85rem',
                marginBottom: '0.75rem',
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.08)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <i className='bx bx-plus-circle'></i> Add Company to Order
                  </span>
                  <button 
                    type="button" 
                    onClick={() => { setIsAddingCompany(false); setCompanyError(''); }}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem', lineHeight: '1' }}
                  >
                    ×
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '0.2rem' }}>
                      Company Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      value={newCompanyForm.companyName}
                      onChange={e => setNewCompanyForm({ ...newCompanyForm, companyName: e.target.value })}
                      placeholder="e.g. Acme Health Corp"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '0.2rem' }}>
                      Tax / GST Number
                    </label>
                    <input 
                      type="text" 
                      value={newCompanyForm.taxDetails}
                      onChange={e => setNewCompanyForm({ ...newCompanyForm, taxDetails: e.target.value })}
                      placeholder="e.g. GSTIN987654321"
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '0.2rem' }}>
                      Billing Address
                    </label>
                    <input 
                      type="text" 
                      value={newCompanyForm.address}
                      onChange={e => setNewCompanyForm({ ...newCompanyForm, address: e.target.value })}
                      placeholder="e.g. Registered office address, city, country"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {companyError && (
                  <div style={{ color: '#ef4444', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <i className='bx bx-error-circle'></i> {companyError}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => { setIsAddingCompany(false); setCompanyError(''); }}
                    style={{ padding: '0.35rem 0.75rem', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '500' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={handleSaveNewCompany}
                    style={{ padding: '0.35rem 0.85rem', background: '#0284c7', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <i className='bx bx-check'></i> Save & Select Company
                  </button>
                </div>
              </div>
            )}

            {/* Unified Company & Contract Selection (One Dropdown) */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ ...labelStyle, marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <i className='bx bx-buildings' style={{ color: '#0284c7', fontSize: '1rem' }}></i>
                  Billing Entity / Company
                  {formData.isLinkedFromContract ? (
                    <span style={{ fontSize: '0.68rem', background: '#dbeafe', color: '#1e40af', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                      <i className='bx bx-link' style={{ marginRight: '0.15rem' }}></i>Linked from Contract
                    </span>
                  ) : formData.isCustomCompany ? (
                    <span style={{ fontSize: '0.68rem', background: '#f5f3ff', color: '#6d28d9', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                      Custom Entity
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.68rem', background: '#f1f5f9', color: '#475569', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: '500' }}>
                      from Onboarding
                    </span>
                  )}
                </label>

                {!isAddingCompany && (
                  <button
                    type="button"
                    onClick={() => { setIsAddingCompany(true); setCompanyError(''); }}
                    style={{
                      background: 'none',
                      border: '1px solid #0284c7',
                      color: '#0284c7',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <i className='bx bx-plus'></i> Add Company
                  </button>
                )}
              </div>

              {/* ONE Single Dropdown */}
              <select
                value={
                  formData.isLinkedFromContract && selectedContractId 
                    ? `contract_${selectedContractId}` 
                    : (formData.billingEntity ? `company_${formData.billingEntity}` : '')
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;

                  if (val.startsWith('contract_')) {
                    const cId = val.replace('contract_', '');
                    setSelectedContractId(cId);
                    const found = divisionContracts.find(c => String(c.id) === String(cId));
                    if (found) {
                      if (found.companyEntities && found.companyEntities.length > 0) {
                        setBillingSplits(found.companyEntities.map((ent, idx) => ({
                          id: ent.id || idx + 1,
                          companyName: ent.companyName,
                          gstNumber: ent.taxDetails || ent.gstNumber || '',
                          address: ent.address || '',
                          percentage: Number(ent.percentage) || 0,
                          selected: true
                        })));
                        setIsSplitCollapsed(false);
                      } else if (found.billingSplits && found.billingSplits.length > 0) {
                        setBillingSplits(found.billingSplits.map((ent, idx) => ({
                          id: ent.id || idx + 1,
                          companyName: ent.companyName,
                          gstNumber: ent.taxDetails || ent.gstNumber || '',
                          address: ent.address || '',
                          percentage: Number(ent.percentage) || 0,
                          selected: true
                        })));
                        setIsSplitCollapsed(false);
                      } else {
                        setBillingSplits([]);
                      }

                      setFormData(prev => ({
                        ...prev,
                        billingEntity: found.companyName,
                        taxDetails: found.taxDetails || '',
                        billingAddress: found.address || '',
                        companyName: found.companyName,
                        contractValue: found.contractValue !== undefined ? String(found.contractValue) : '',
                        clientCurrency: found.contractCurrency || '',
                        currencyExchangeValue: found.currencyExchangeValue !== undefined ? String(found.currencyExchangeValue) : '1',
                        paymentDueDays: found.paymentDueDays !== undefined ? String(found.paymentDueDays) : '',
                        billFrom: found.billFrom || '',
                        receivingBankName: found.receivingBankName || '',
                        billingDate: found.billingDate || '',
                        bankDetailsLink: found.bankDetailsLink || '',
                        linkedContract: found,
                        isLinkedFromContract: true,
                        isCustomCompany: false
                      }));
                      setErrors({});
                    }
                  } else if (val.startsWith('company_')) {
                    const compName = val.replace('company_', '');
                    setSelectedContractId('');
                    const foundComp = availableCompanies.find(c => c.companyName === compName);
                    if (foundComp) {
                      setFormData(prev => ({
                        ...prev,
                        billingEntity: foundComp.companyName,
                        taxDetails: foundComp.taxDetails || '',
                        billingAddress: foundComp.address || '',
                        companyName: foundComp.companyName,
                        linkedContract: null,
                        isLinkedFromContract: false,
                        isCustomCompany: foundComp.source === 'custom'
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        billingEntity: compName,
                        linkedContract: null,
                        isLinkedFromContract: false
                      }));
                    }
                  }
                }}
                style={{ ...inputStyle, background: 'white', borderColor: '#cbd5e1', fontWeight: '500' }}
              >
                <option value="" disabled hidden>-- Select Company or Linked Contract --</option>
                
                {divisionContracts.length > 0 && (
                  <optgroup label="📋 Division Contracts (Auto-fills contract & banking details)">
                    {divisionContracts.map(c => {
                      const taxSnippet = c.taxDetails ? ` • Tax: ${c.taxDetails}` : '';
                      const splitsSnippet = c.companyEntities?.length > 1 ? ` (${c.companyEntities.length} entities)` : '';
                      return (
                        <option key={`contract_${c.id}`} value={`contract_${c.id}`}>
                          {c.companyName}{splitsSnippet}{taxSnippet} • {c.contractValue?.toLocaleString()} {c.contractCurrency} ({c.billFrom} / {c.receivingBankName})
                        </option>
                      );
                    })}
                  </optgroup>
                )}

                {availableCompanies.length > 0 && (
                  <optgroup label="🏢 Companies (From Onboarding & Custom)">
                    {availableCompanies.map((c, idx) => (
                      <option key={`company_${c.id || idx}`} value={`company_${c.companyName}`}>
                        {c.companyName} {c.taxDetails ? `(Tax: ${c.taxDetails})` : ''} [{c.source === 'custom' ? 'Custom' : 'Onboarding'}]
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>

              {/* Tax Details and Billing Address (Editable so user can complete missing info) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Tax / GST Details</label>
                  <input 
                    type="text" 
                    name="taxDetails"
                    style={inputStyle} 
                    value={formData.taxDetails || ''} 
                    onChange={handleChange}
                    placeholder="e.g. GSTIN / Tax ID" 
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Billing Address</label>
                  <input 
                    type="text" 
                    name="billingAddress"
                    style={inputStyle} 
                    value={formData.billingAddress || ''} 
                    onChange={handleChange}
                    placeholder="e.g. Street address, city, country" 
                  />
                </div>
              </div>
            </div>

            {/* Note banner when remaining financial / bank details need completion */}
            {(!formData.contractValue || !formData.billFrom || !formData.receivingBankName) && (
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '6px',
                padding: '0.55rem 0.75rem',
                fontSize: '0.76rem',
                color: '#92400e',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <i className='bx bx-info-circle' style={{ fontSize: '1rem', color: '#f59e0b', flexShrink: 0 }}></i>
                <span>
                  <strong>Tip:</strong> If bank details or financial terms are not set, please update the remaining information below (Contract Value, Currency, Payment Due Days, Bill From, and Receiving Bank) to complete billing.
                </span>
              </div>
            )}

            {/* Multi-Entity Billing Split (Collapse & Expand) */}
            {billingSplits.length > 1 && (
              <div style={{
                background: '#f8fafc',
                border: errors.billingSplits ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'all 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
                {/* Collapse / Expand Header */}
                <div 
                  onClick={() => setIsSplitCollapsed(!isSplitCollapsed)}
                  style={{
                    padding: '0.65rem 0.85rem',
                    background: '#f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderBottom: isSplitCollapsed ? 'none' : '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className='bx bx-git-branch' style={{ color: '#0284c7', fontSize: '1.15rem' }}></i>
                    <div>
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0f172a' }}>
                        Multi-Entity Billing Allocation
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '0.35rem' }}>
                        ({billingSplits.length} companies mapped)
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      background: totalPercentage === 100 ? '#dcfce7' : '#fee2e2',
                      color: totalPercentage === 100 ? '#166534' : '#991b1b',
                      border: totalPercentage === 100 ? '1px solid #bbf7d0' : '1px solid #fecaca'
                    }}>
                      {totalPercentage === 100 ? '100% Split' : `${totalPercentage}% / 100%`}
                    </span>
                    <i className={`bx bx-chevron-${isSplitCollapsed ? 'down' : 'up'}`} style={{ color: '#64748b', fontSize: '1.2rem' }}></i>
                  </div>
                </div>

                {/* Collapsible Content */}
                {!isSplitCollapsed && (
                  <div style={{ padding: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b' }}>
                        Select entities and specify the <strong>% of billing</strong>. Use <strong>Equal Split</strong> for even rounding.
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          applyEqualSplit();
                        }}
                        style={{
                          background: '#0284c7',
                          color: 'white',
                          border: 'none',
                          padding: '0.3rem 0.65rem',
                          borderRadius: '5px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
                        }}
                        title="Distribute 100% evenly (e.g. 33, 33, 34 for 3 companies)"
                      >
                        <i className='bx bx-calculator'></i> Equal Split
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {billingSplits.map((split, index) => {
                        const splitAmt = contractVal > 0 
                          ? ((contractVal * (Number(split.percentage) || 0)) / 100).toFixed(2)
                          : '0.00';
                        return (
                          <div 
                            key={split.id || index}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.5rem 0.65rem',
                              background: split.selected ? 'white' : '#f8fafc',
                              border: split.selected ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                              borderRadius: '6px',
                              gap: '0.5rem'
                            }}
                          >
                            {/* Checkbox and Company info */}
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1, minWidth: 0, margin: 0 }}>
                              <input 
                                type="checkbox"
                                checked={!!split.selected}
                                onChange={() => toggleCompanySelection(split.id)}
                                style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#0284c7' }}
                              />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: split.selected ? '#0f172a' : '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {split.companyName}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                  Tax / GST: {split.gstNumber || 'N/A'}
                                </div>
                              </div>
                            </label>

                            {/* Percentage input and calculated amount */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                <input 
                                  type="number"
                                  min="0"
                                  max="100"
                                  disabled={!split.selected}
                                  value={split.percentage === '' ? '' : split.percentage}
                                  onChange={(e) => handlePercentageChange(split.id, e.target.value)}
                                  style={{
                                    width: '56px',
                                    padding: '0.3rem 0.4rem',
                                    paddingRight: '1rem',
                                    borderRadius: '4px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.82rem',
                                    fontWeight: '700',
                                    textAlign: 'right',
                                    background: split.selected ? 'white' : '#f1f5f9',
                                    color: split.selected ? '#0f172a' : '#94a3b8',
                                    outline: 'none'
                                  }}
                                  placeholder="0"
                                />
                                <span style={{ position: 'absolute', right: '4px', fontSize: '0.75rem', color: '#64748b', fontWeight: '600', pointerEvents: 'none' }}>%</span>
                              </div>
                              <div style={{ width: '90px', textAlign: 'right', fontSize: '0.78rem', color: split.selected ? '#0369a1' : '#94a3b8', fontWeight: '600' }}>
                                {formData.clientCurrency || '$'} {splitAmt}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Total Split Validation Footer */}
                    <div style={{ marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                      <span style={{ color: totalPercentage === 100 ? '#166534' : '#dc2626', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <i className={`bx ${totalPercentage === 100 ? 'bx-check-circle' : 'bx-error-circle'}`}></i>
                        {totalPercentage === 100 
                          ? 'Total Split: 100% (Balanced)' 
                          : `Total Split: ${totalPercentage}% (${totalPercentage > 100 ? `Over by ${totalPercentage - 100}%` : `Remaining ${100 - totalPercentage}%`})`}
                      </span>
                      {contractVal > 0 && (
                        <span style={{ color: '#475569', fontWeight: '500' }}>
                          Contract: <strong>{formData.clientCurrency || '$'} {contractVal.toFixed(2)}</strong>
                        </span>
                      )}
                    </div>
                    {errors.billingSplits && (
                      <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.35rem', fontWeight: '500' }}>
                        <i className='bx bx-error-circle' style={{ marginRight: '0.25rem' }}></i>
                        {errors.billingSplits}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Contract Value <Tooltip text="Total contract value." align="left" /></label>
                <input type="number" name="contractValue" style={{...inputStyle, borderColor: errors.contractValue ? '#ef4444' : '#cbd5e1'}} value={formData.contractValue} onChange={handleChange} placeholder="0.00" />
                {errors.contractValue && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.contractValue}</div>}
              </div>

              <div>
                <label style={labelStyle}>Contract Currency <span style={{color: '#ef4444'}}>*</span> <Tooltip text="Currency as per the contract. This will be used in billing as well." align="right" /></label>
                <div style={{ position: 'relative' }} ref={dropdownRef}>
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

            {/* Row 3 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Currency Exchange Value (USD to {formData.clientCurrency || 'Contract Currency'}) <Tooltip text={`Search for USD to ${formData.clientCurrency || 'Contract Currency'} in Google and update the value here.`} align="left" /></label>
                <input type="number" name="currencyExchangeValue" style={inputStyle} value={formData.currencyExchangeValue} onChange={handleChange} placeholder="1.0" step="0.01" />
              </div>

              <div>
                <label style={labelStyle}>Payment Due (in Days) <span style={{color: '#ef4444'}}>*</span> <Tooltip text="The credit period that will be provided to the client to pay the invoice." align="right" /></label>
                <input type="number" name="paymentDueDays" style={{...inputStyle, borderColor: errors.paymentDueDays ? '#ef4444' : '#cbd5e1'}} value={formData.paymentDueDays} onChange={handleChange} placeholder="e.g. 30" />
                {errors.paymentDueDays && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.paymentDueDays}</div>}
              </div>
            </div>

            {/* Row 4 */}
            <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: '600' }}>Amount in USD -</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0284c7' }}>
                  ${amountInUSD}
                </span>
              </div>
              <i className='bx bx-dollar-circle' style={{ fontSize: '1.5rem', color: '#bae6fd' }}></i>
            </div>
            
            {/* Row 5 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Bill From <span style={{color: '#ef4444'}}>*</span> <Tooltip text="As per the contract, select our company." align="left" /></label>
                <select name="billFrom" style={{...inputStyle, borderColor: errors.billFrom ? '#ef4444' : '#cbd5e1'}} value={formData.billFrom} onChange={handleChange}>
                  <option value="" disabled hidden>Select Company</option>
                  <option value="MCC">MCC</option>
                  <option value="MCHI">MCHI</option>
                  <option value="MCHPL">MCHPL</option>
                  <option value="MRC UAE">MRC UAE</option>
                  <option value="MR UK">MR UK</option>
                </select>
                {errors.billFrom && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.billFrom}</div>}
              </div>

              <div>
                <label style={labelStyle}>Receiving Bank Name <span style={{color: '#ef4444'}}>*</span> <Tooltip text="Select the bank that will be used to receive the amount." align="right" /></label>
                <select name="receivingBankName" style={{...inputStyle, borderColor: errors.receivingBankName ? '#ef4444' : '#cbd5e1'}} value={formData.receivingBankName} onChange={handleChange}>
                  <option value="" disabled hidden>Select Bank</option>
                  <option value="AirWallex">AirWallex</option>
                  <option value="ICICI">ICICI</option>
                  <option value="Wise">Wise</option>
                  <option value="Mercury">Mercury</option>
                  <option value="ENBD">ENBD</option>
                </select>
                {errors.receivingBankName && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.receivingBankName}</div>}
              </div>
            </div>

            {/* Row 6 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Billing Date <span style={{color: '#ef4444'}}>*</span> <Tooltip text="From this date, the billing will start. It has no relation to the plan start date." align="left" /></label>
                <input type="date" max="9999-12-31" name="billingDate" style={{...inputStyle, borderColor: errors.billingDate ? '#ef4444' : '#cbd5e1'}} value={formData.billingDate} onChange={handleChange} />
                {errors.billingDate && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.billingDate}</div>}
              </div>
              
              <div>
                <label style={labelStyle}>Bank Details link <span style={{color: '#ef4444'}}>*</span> <Tooltip text="This is the bank details link. Verify the bank. For any concerns, reach out to the product team." align="right" /></label>
                <div style={{ position: 'relative' }}>
                  <input type="url" name="bankDetailsLink" style={{...inputStyle, backgroundColor: '#f1f5f9', borderColor: errors.bankDetailsLink ? '#ef4444' : '#cbd5e1', paddingRight: '2.5rem'}} value={formData.bankDetailsLink} readOnly placeholder="Auto-populated based on selection" />
                  <button 
                    type="button" 
                    title="Copy Link"
                    onClick={(e) => {
                      e.preventDefault();
                      if(formData.bankDetailsLink) {
                        navigator.clipboard.writeText(formData.bankDetailsLink);
                        const icon = e.currentTarget.querySelector('i');
                        icon.className = 'bx bx-check';
                        setTimeout(() => { icon.className = 'bx bx-copy'; }, 2000);
                      }
                    }}
                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <i className="bx bx-copy" style={{ fontSize: '1.2rem' }}></i>
                  </button>
                </div>
                {errors.bankDetailsLink && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.bankDetailsLink}</div>}
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', marginTop: '0.5rem' }}>
            <button 
              onClick={onClose}
              style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', color: '#475569', fontWeight: '500', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              style={{ 
                padding: '0.5rem 1.25rem', 
                background: 'linear-gradient(135deg, #0369a1, #0ea5e9)', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                color: 'white', 
                fontWeight: '600', 
                fontSize: '0.85rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem' 
              }}
            >
              <i className='bx bx-save'></i> Save Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BillingDetailsModal;
