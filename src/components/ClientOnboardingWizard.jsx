import React, { useState } from 'react';

const steps = [
  { id: 1, title: 'Key SPOC' },
  { id: 2, title: 'Escalation' },
  { id: 3, title: 'Billing' },
  { id: 4, title: 'Payment SPOC' },
  { id: 5, title: 'Expectations' }
];

function ClientOnboardingWizard({ onClose, onSuccess, initialData = {} }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const getInitialCompany = () => {
    if (initialData.billingDetails?.companyName) {
      return {
        id: initialData.billingDetails.companies?.[0]?.id || Date.now(),
        companyName: initialData.billingDetails.companyName,
        gstNumber: initialData.billingDetails.gstNumber || '',
        address: initialData.billingDetails.address || '',
        isPrimary: true
      };
    }
    if (initialData.billingDetails?.companies?.length) {
      const first = initialData.billingDetails.companies[0];
      return {
        id: first.id || Date.now(),
        companyName: first.companyName || '',
        gstNumber: first.gstNumber || '',
        address: first.address || '',
        isPrimary: true
      };
    }
    return {
      id: Date.now(),
      companyName: '',
      gstNumber: '',
      address: '',
      isPrimary: true
    };
  };

  const [formData, setFormData] = useState(() => {
    const initialCompany = getInitialCompany();
    return {
      keySpoc: initialData.keySpoc || { name: '', email: '', contact: '' },
      escalationSpocs: initialData.escalationSpocs?.length ? initialData.escalationSpocs : [{ id: Date.now(), name: '', email: '', contact: '', designation: '' }],
      billingDetails: {
        companies: [initialCompany],
        companyName: initialCompany.companyName,
        gstNumber: initialCompany.gstNumber,
        address: initialCompany.address
      },
      billingSpocs: initialData.billingSpocs?.length ? initialData.billingSpocs : [{ id: Date.now(), name: '', email: '', contact: '', department: 'Billing' }],
      expectations: initialData.expectations || ''
    };
  });

  const progressPercentage = ((currentStep) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    // Submit logic goes here
    setIsSubmitted(true);
    
    const dataToSave = {
      ...formData,
      submittedAt: new Date().toISOString()
    };
    
    if (initialData.id) {
      localStorage.setItem('onboardingFiled_' + initialData.id, JSON.stringify(dataToSave));
    } else {
      localStorage.setItem('onboardingFiled_1', JSON.stringify(dataToSave));
    }
    if (onSuccess) {
      onSuccess(dataToSave);
    }
  };

  // State Updaters
  const handleKeySpocChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, keySpoc: { ...prev.keySpoc, [name]: value } }));
  };

  const handleEscalationSpocChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      escalationSpocs: prev.escalationSpocs.map(spoc => spoc.id === id ? { ...spoc, [field]: value } : spoc)
    }));
  };

  const addEscalationSpoc = () => {
    setFormData(prev => ({
      ...prev,
      escalationSpocs: [...prev.escalationSpocs, { id: Date.now(), name: '', email: '', contact: '', designation: '' }]
    }));
  };

  const removeEscalationSpoc = (id) => {
    setFormData(prev => ({
      ...prev,
      escalationSpocs: prev.escalationSpocs.filter(spoc => spoc.id !== id)
    }));
  };

  const handleBillingFieldChange = (field, value) => {
    setFormData(prev => {
      const updated = {
        ...prev.billingDetails,
        [field]: value
      };
      const comp = {
        id: prev.billingDetails.companies?.[0]?.id || Date.now(),
        companyName: field === 'companyName' ? value : (updated.companyName || ''),
        gstNumber: field === 'gstNumber' ? value : (updated.gstNumber || ''),
        address: field === 'address' ? value : (updated.address || ''),
        isPrimary: true
      };
      updated.companies = [comp];
      return {
        ...prev,
        billingDetails: updated
      };
    });
  };

  const handleBillingDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, billingDetails: { ...prev.billingDetails, [name]: value } }));
  };

  const handleBillingSpocChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      billingSpocs: prev.billingSpocs.map(spoc => spoc.id === id ? { ...spoc, [field]: value } : spoc)
    }));
  };

  const addBillingSpoc = () => {
    setFormData(prev => ({
      ...prev,
      billingSpocs: [...prev.billingSpocs, { id: Date.now(), name: '', email: '', contact: '', department: 'Billing' }]
    }));
  };

  const removeBillingSpoc = (id) => {
    setFormData(prev => ({
      ...prev,
      billingSpocs: prev.billingSpocs.filter(spoc => spoc.id !== id)
    }));
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="wizard-step animate-fade-in" style={{ padding: '1rem 0' }}>
            <h2 style={{ color: '#0f172a', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '600' }}>Key Contact Details</h2>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>Please provide the <strong>primary point of contact (POC)</strong>.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '10px', color: '#475569', fontWeight: '500' }}>Full Name</label>
                <input type="text" name="name" value={formData.keySpoc.name} onChange={handleKeySpocChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '10px', outline: 'none' }} placeholder="e.g. Jane Doe" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '10px', color: '#475569', fontWeight: '500' }}>Email Address</label>
                <input type="email" name="email" value={formData.keySpoc.email} onChange={handleKeySpocChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '10px', outline: 'none' }} placeholder="jane.doe@company.com" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '10px', color: '#475569', fontWeight: '500' }}>Contact Number</label>
                <input type="text" name="contact" value={formData.keySpoc.contact} onChange={handleKeySpocChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '10px', outline: 'none' }} placeholder="+1 (555) 000-0000" />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="wizard-step animate-fade-in" style={{ padding: '1rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ color: '#0f172a', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '600' }}>Escalation Matrix</h2>
                <p style={{ color: '#64748b' }}>Provide details for escalation points of contact.</p>
              </div>
              <button onClick={addEscalationSpoc} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }} className="hover:bg-slate-200">
                <i className='bx bx-plus'></i> Add Person
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {formData.escalationSpocs.map((spoc, index) => (
                <div key={spoc.id} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#334155', fontSize: '10px' }}>Escalation Contact {index + 1}</h4>
                  
                  {formData.escalationSpocs.length > 1 && (
                    <button onClick={() => removeEscalationSpoc(spoc.id)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <i className='bx bx-trash' style={{ fontSize: '14px' }}></i>
                    </button>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '10px', color: '#475569', fontWeight: '500' }}>Name</label>
                      <input type="text" value={spoc.name} onChange={(e) => handleEscalationSpocChange(spoc.id, 'name', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '10px', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '10px', color: '#475569', fontWeight: '500' }}>Designation</label>
                      <input type="text" value={spoc.designation} onChange={(e) => handleEscalationSpocChange(spoc.id, 'designation', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '10px', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '10px', color: '#475569', fontWeight: '500' }}>Email</label>
                      <input type="email" value={spoc.email} onChange={(e) => handleEscalationSpocChange(spoc.id, 'email', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '10px', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '10px', color: '#475569', fontWeight: '500' }}>Contact Number</label>
                      <input type="text" value={spoc.contact} onChange={(e) => handleEscalationSpocChange(spoc.id, 'contact', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '10px', outline: 'none' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        const billing = formData.billingDetails || {};
        return (
          <div className="wizard-step animate-fade-in" style={{ padding: '1rem 0' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ color: '#0f172a', marginBottom: '0.25rem', fontSize: '14px', fontWeight: '600' }}>Company Information / Billing Details</h2>
              <p style={{ color: '#64748b', fontSize: '11px', margin: 0 }}>Provide the registered company legal entity for invoicing and contracts.</p>
            </div>
            
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ 
                  background: '#dbeafe', 
                  color: '#1e40af', 
                  fontSize: '10px', 
                  fontWeight: '700', 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}>
                  Registered Entity
                </span>
                <h4 style={{ margin: 0, color: '#334155', fontSize: '12px', fontWeight: '600' }}>
                  {billing.companyName || 'Entity Details'}
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '10px', color: '#475569', fontWeight: '500' }}>Company Name (Legal) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input 
                    type="text" 
                    value={billing.companyName || ''} 
                    onChange={(e) => handleBillingFieldChange('companyName', e.target.value)} 
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', outline: 'none', boxSizing: 'border-box' }} 
                    placeholder="e.g. MantraCare Inc." 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '10px', color: '#475569', fontWeight: '500' }}>GST / Tax Number / VAT Number <span style={{ color: '#ef4444' }}>*</span></label>
                  <input 
                    type="text" 
                    value={billing.gstNumber || ''} 
                    onChange={(e) => handleBillingFieldChange('gstNumber', e.target.value)} 
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', outline: 'none', boxSizing: 'border-box' }} 
                    placeholder="Enter tax / VAT ID" 
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '10px', color: '#475569', fontWeight: '500' }}>Registered Address</label>
                  <textarea 
                    rows="3" 
                    value={billing.address || ''} 
                    onChange={(e) => handleBillingFieldChange('address', e.target.value)} 
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} 
                    placeholder="Full postal address with city, state, and zip code" 
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="wizard-step animate-fade-in" style={{ padding: '1rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ color: '#0f172a', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '600' }}>Billing & Payment Contacts</h2>
                <p style={{ color: '#64748b' }}>Who should receive the invoices and payment reminders?</p>
              </div>
              <button onClick={addBillingSpoc} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }} className="hover:bg-slate-200">
                <i className='bx bx-plus'></i> Add Person
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {formData.billingSpocs.map((spoc, index) => (
                <div key={spoc.id} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#334155', fontSize: '10px' }}>Finance Contact {index + 1}</h4>
                  
                  {formData.billingSpocs.length > 1 && (
                    <button onClick={() => removeBillingSpoc(spoc.id)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <i className='bx bx-trash' style={{ fontSize: '14px' }}></i>
                    </button>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '10px', color: '#475569', fontWeight: '500' }}>Name</label>
                      <input type="text" value={spoc.name} onChange={(e) => handleBillingSpocChange(spoc.id, 'name', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '10px', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '10px', color: '#475569', fontWeight: '500' }}>Department Focus</label>
                      <div style={{ position: 'relative' }}>
                        <select value={spoc.department} onChange={(e) => handleBillingSpocChange(spoc.id, 'department', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '10px', outline: 'none', appearance: 'none', background: 'white' }}>
                          <option value="Billing">Billing Only (Invoices)</option>
                          <option value="Payment">Payment Only (Remittances)</option>
                          <option value="Both">Both (Billing & Payment)</option>
                        </select>
                        <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '10px', color: '#475569', fontWeight: '500' }}>Email</label>
                      <input type="email" value={spoc.email} onChange={(e) => handleBillingSpocChange(spoc.id, 'email', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '10px', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '10px', color: '#475569', fontWeight: '500' }}>Contact Number</label>
                      <input type="text" value={spoc.contact} onChange={(e) => handleBillingSpocChange(spoc.id, 'contact', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '10px', outline: 'none' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="wizard-step animate-fade-in" style={{ padding: '1rem 0' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ color: '#0f172a', marginBottom: '0.35rem', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className='bx bx-notepad' style={{ color: '#6366f1', fontSize: '1.25rem' }}></i> Client Expectations & Operational Notes
              </h2>
              <p style={{ color: '#64748b', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                Please outline any specific delivery expectations, SLA requirements, reporting cadences, or special requests we should be aware of.
              </p>
            </div>

            {/* Quick helper prompts */}
            <div style={{ marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                Quick Topics (click to insert):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {[
                  '• SLA & Response Times: ',
                  '• Weekly Reporting Schedule: ',
                  '• Escalation Contact Protocol: ',
                  '• Specific Exclusions / Boundaries: '
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setFormData(prev => {
                        const current = prev.expectations ? prev.expectations.trim() + '\n' : '';
                        return { ...prev, expectations: current + tag };
                      });
                    }}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '16px',
                      padding: '0.25rem 0.65rem',
                      fontSize: '11px',
                      color: '#334155',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                  >
                    + {tag.replace('• ', '').replace(': ', '')}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <textarea 
                name="expectations" 
                value={formData.expectations} 
                onChange={(e) => setFormData(prev => ({...prev, expectations: e.target.value}))} 
                rows="8" 
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  borderRadius: '10px', 
                  border: '1.5px solid #cbd5e1', 
                  fontSize: '14px', 
                  lineHeight: '1.6',
                  outline: 'none', 
                  resize: 'vertical',
                  minHeight: '200px',
                  color: '#0f172a',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  transition: 'border-color 0.15s ease'
                }} 
                onFocus={(e) => { e.target.style.borderColor = '#6366f1'; }}
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; }}
                placeholder="Write your expectations, special requests, team cadence, or operational requirements here in detail..." 
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.35rem', fontSize: '11px', color: '#94a3b8' }}>
                {formData.expectations ? `${formData.expectations.length} characters` : '0 characters'}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '60vh', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem' }} className="animate-fade-in">
        <div style={{ width: '80px', height: '80px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', marginBottom: '1.5rem' }}>
          <i className='bx bx-check' style={{ fontSize: '3rem' }}></i>
        </div>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: '24px', color: '#0f172a', fontWeight: '700' }}>Thank You!</h1>
        <p style={{ margin: '0 0 2rem 0', fontSize: '14px', color: '#64748b', maxWidth: '400px', lineHeight: '1.6' }}>
          Your {initialData.divisionName ? <><strong style={{color: '#0f172a'}}>{initialData.divisionName}</strong> </> : ''}onboarding details have been successfully submitted. Our team will review the information and get in touch if we need anything else.
        </p>
        <button 
          onClick={onClose}
          style={{ 
            padding: '0.75rem 2rem', background: '#0f172a', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.2)'
          }}
        >
          Close Window
        </button>
        <style dangerouslySetInnerHTML={{__html: `
          .animate-fade-in {
            animation: fadeIn 0.4s ease-out forwards;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'auto', maxHeight: '90vh' }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
          <i className='bx bx-x' style={{ fontSize: '14px' }}></i>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: '#e0f2fe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <i className='bx bx-buildings' style={{ fontSize: '14px' }}></i>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '14px', color: '#0f172a', fontWeight: '700' }}>MantraCare Client Onboarding</h1>
            <p style={{ margin: 0, fontSize: '10px', color: '#64748b' }}>Setup your {initialData.divisionName ? <strong style={{color: '#475569'}}>{initialData.divisionName}</strong> : 'Division Name'} account.</p>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '10px', fontWeight: '500', color: '#475569' }}>
            <span>Step {currentStep} of {steps.length}: {steps[currentStep-1].title}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#3b82f6', width: `${progressPercentage}%`, transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: '3px' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content Scrollable Area */}
      <div style={{ padding: '0 1.5rem', overflowY: 'auto', flex: 1, backgroundColor: '#ffffff' }}>
        {renderStepContent()}
      </div>

      {/* Footer Navigation */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={handleBack} 
          disabled={currentStep === 1}
          style={{ 
            padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', color: currentStep === 1 ? '#94a3b8' : '#475569', fontWeight: '600', cursor: currentStep === 1 ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <i className='bx bx-left-arrow-alt'></i> Back
        </button>
        
        {currentStep < steps.length ? (
          <button 
            onClick={handleNext}
            style={{ 
              padding: '0.75rem 1.5rem', background: '#0f172a', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.2)'
            }}
          >
            Next <i className='bx bx-right-arrow-alt'></i>
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            style={{ 
              padding: '0.75rem 2rem', background: '#10b981', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
            }}
          >
            <i className='bx bx-check'></i> Complete & Submit
          </button>
        )}
      </div>
      
      {/* Simple fade-in animation style */}
      <style dangerouslySetInnerHTML={{__html: `
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

export default ClientOnboardingWizard;
