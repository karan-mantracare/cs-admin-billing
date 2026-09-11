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
    bankDetailsLink: '',
    billingDate: ''
  });

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

  useEffect(() => {
    if (isOpen) {
      let hrEntity = '';
      let hrTax = '';
      
      try {
        const savedData = localStorage.getItem('onboardingFiled_' + (initialData?.id || '1'));
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
    if (!formData.billingDate) newErrors.billingDate = 'Billing Date is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
        background: 'white', borderRadius: '12px', width: '90%', maxWidth: '500px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0369a1, #0ea5e9)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.05rem', color: 'white', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className='bx bx-spreadsheet'></i> Billing Details
            </h2>
            <p style={{ margin: '0.15rem 0 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem' }}>Configure contract and payment method</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '6px', width: '30px', height: '30px', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <div style={{ padding: '1.25rem' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          
            {/* Row 1 */}
            {(!formData.billingEntity && !formData.taxDetails) ? (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '1rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <i className='bx bx-error-circle' style={{ color: '#ef4444', fontSize: '1.5rem' }}></i>
                  <div>
                    <h4 style={{ margin: 0, color: '#991b1b', fontSize: '0.9rem', fontWeight: '600' }}>Onboarding form is pending</h4>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#b91c1c', fontSize: '0.8rem' }}>Client's Entity and Tax Details are unavailable.</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    const url = `${window.location.origin}/client-onboarding/${initialData?.id || '1'}`;
                    navigator.clipboard.writeText(url);
                    const btn = e.currentTarget;
                    const originalText = btn.innerHTML;
                    btn.innerHTML = `<i class='bx bx-check'></i> Copied`;
                    setTimeout(() => { btn.innerHTML = originalText; }, 2000);
                  }}
                  style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '500', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  <i className='bx bx-copy'></i> Form Link
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Billing Entity (from HR)</label>
                  <input type="text" style={{...inputStyle, backgroundColor: '#f1f5f9'}} value={formData.billingEntity} readOnly />
                </div>
                <div>
                  <label style={labelStyle}>Tax Details (from HR)</label>
                  <input type="text" style={{...inputStyle, backgroundColor: '#f1f5f9'}} value={formData.taxDetails} readOnly />
                </div>
              </div>
            )}

            {/* Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Contract Value</label>
                <input type="number" name="contractValue" style={{...inputStyle, borderColor: errors.contractValue ? '#ef4444' : '#cbd5e1'}} value={formData.contractValue} onChange={handleChange} placeholder="0.00" />
                {errors.contractValue && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.contractValue}</div>}
              </div>

              <div>
                <label style={labelStyle}>Client Currency <span style={{color: '#ef4444'}}>*</span></label>
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
                <label style={labelStyle}>Currency Exchange Value (USD to {formData.clientCurrency || 'Client Currency'})</label>
                <input type="number" name="currencyExchangeValue" style={inputStyle} value={formData.currencyExchangeValue} onChange={handleChange} placeholder="1.0" step="0.01" />
              </div>

              <div>
                <label style={labelStyle}>Payment Due (in Days) <span style={{color: '#ef4444'}}>*</span></label>
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
                <label style={labelStyle}>Bill From <span style={{color: '#ef4444'}}>*</span></label>
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
                <label style={labelStyle}>Receiving Bank Name <span style={{color: '#ef4444'}}>*</span></label>
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
                <label style={labelStyle}>Billing Date <span style={{color: '#ef4444'}}>*</span></label>
                <input type="date" max="9999-12-31" name="billingDate" style={{...inputStyle, borderColor: errors.billingDate ? '#ef4444' : '#cbd5e1'}} value={formData.billingDate} onChange={handleChange} />
                {errors.billingDate && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.billingDate}</div>}
              </div>
              
              <div>
                <label style={labelStyle}>Bank Details link <span style={{color: '#ef4444'}}>*</span></label>
                <input type="url" name="bankDetailsLink" style={{...inputStyle, backgroundColor: '#f1f5f9', borderColor: errors.bankDetailsLink ? '#ef4444' : '#cbd5e1'}} value={formData.bankDetailsLink} readOnly placeholder="Auto-populated based on selection" />
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
              style={{ padding: '0.5rem 1.25rem', background: 'linear-gradient(135deg, #0369a1, #0ea5e9)', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'white', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
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
