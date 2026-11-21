import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PRIMARY_REASONS, URGENCY_LEVELS } from '../data/sensitiveCasesData';

export default function ManagerReferralPage() {
  const [searchParams] = useSearchParams();
  const rawDivisionId = searchParams.get('divisionId') || searchParams.get('division') || searchParams.get('id') || 'DIV-101';

  // Form State
  const [formData, setFormData] = useState({
    managerName: '',
    managerEmail: '',
    divisionId: rawDivisionId,
    memberName: '',
    memberPhone: '',
    memberEmail: '',
    employeeId: '',
    primaryReason: '',
    urgencyLevel: '',
    remarks: '',
    consentConfirmed: false
  });

  const [submitted, setSubmitted] = useState(false);
  const [submittedCaseId, setSubmittedCaseId] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (rawDivisionId) {
      setFormData(prev => ({ ...prev, divisionId: rawDivisionId }));
    }
  }, [rawDivisionId]);

  const validate = () => {
    const errs = {};
    if (!formData.managerName.trim()) errs.managerName = 'Full Name is required';
    if (!formData.managerEmail.trim()) errs.managerEmail = 'Email Address is required';
    if (!formData.memberName.trim()) errs.memberName = 'Team member Full Name is required';
    if (!formData.memberPhone.trim()) errs.memberPhone = 'Phone Number is required';
    if (!formData.memberEmail.trim()) errs.memberEmail = 'Team member Email Address is required';
    if (!formData.primaryReason) errs.primaryReason = 'Please select a primary reason';
    if (!formData.urgencyLevel) errs.urgencyLevel = 'Please select an urgency level';
    
    // Remarks mandatory when "Other" is selected
    if (formData.primaryReason === 'Other' && !formData.remarks.trim()) {
      errs.remarks = 'Remarks are mandatory when "Other" is selected';
    }

    if (!formData.consentConfirmed) errs.consentConfirmed = 'Manager consent & acknowledgment is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newCaseId = `MR-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReferralRecord = {
      id: newCaseId,
      divisionId: formData.divisionId || 'DIV-101',
      corporate: 'TechCorp Solutions',
      division: formData.divisionId || 'Engineering',
      managerName: formData.managerName.trim(),
      managerEmail: formData.managerEmail.trim(),
      memberName: formData.memberName.trim(),
      memberPhone: formData.memberPhone.trim(),
      memberEmail: formData.memberEmail.trim(),
      employeeId: formData.employeeId.trim() || 'N/A',
      primaryReason: formData.primaryReason,
      urgencyLevel: formData.urgencyLevel,
      severity: formData.urgencyLevel,
      status: 'New Referral',
      remarks: formData.remarks.trim() || 'Submitted via Secure Manager Referral Portal',
      isHighestPriority: formData.urgencyLevel === 'Emergency' || formData.urgencyLevel === 'Severe',
      referredDate: new Date().toISOString().split('T')[0],
      assignedClinician: 'Triage Pending (Clinical Lead)',
      consentProvided: true,
      timeline: [
        {
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: `${formData.managerName} (Manager)`,
          action: `Manager Referral submitted for ${formData.memberName} under Division ${formData.divisionId}. Primary concern: ${formData.primaryReason}.`
        }
      ]
    };

    // Save into localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('sensitive_cases_manager_referrals') || '[]');
      const updated = [newReferralRecord, ...existing];
      localStorage.setItem('sensitive_cases_manager_referrals', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('referrals-updated', { detail: newReferralRecord }));
    } catch (err) {
      console.error('Error saving referral to storage:', err);
    }

    setSubmittedCaseId(newCaseId);
    setSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      managerName: '',
      managerEmail: '',
      divisionId: rawDivisionId,
      memberName: '',
      memberPhone: '',
      memberEmail: '',
      employeeId: '',
      primaryReason: '',
      urgencyLevel: '',
      remarks: '',
      consentConfirmed: false
    });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box'
    }}>
      
      {/* Top Shield Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem', maxWidth: '580px' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          background: '#ecfdf5',
          color: '#059669',
          border: '1px solid #a7f3d0',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          marginBottom: '0.85rem',
          boxShadow: '0 2px 5px rgba(5, 150, 105, 0.15)'
        }}>
          <i className='bx bx-shield-quarter'></i>
        </div>
        <h1 style={{
          margin: '0 0 0.4rem 0',
          fontSize: '1.05rem',
          fontWeight: '800',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#0f172a'
        }}>
          MantraCare Referral
        </h1>
        <p style={{
          margin: 0,
          fontSize: '0.85rem',
          color: '#64748b',
          lineHeight: 1.5
        }}>
          Securely connect your team members with professional behavioral health and wellness support.
        </p>
      </div>

      {/* Main Card Container */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '680px',
        padding: '2.5rem',
        boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05), 0 2px 6px -1px rgba(0,0,0,0.02)',
        border: '1px solid #f1f5f9',
        boxSizing: 'border-box'
      }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#059669',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              marginBottom: '1.25rem'
            }}>
              <i className='bx bx-check'></i>
            </div>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.45rem', fontWeight: '800', color: '#0f172a' }}>
              Referral Submitted Successfully
            </h2>
            <div style={{
              display: 'inline-block',
              background: '#f1f5f9',
              color: '#0284c7',
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '0.88rem',
              marginBottom: '1rem'
            }}>
              Reference Case ID: {submittedCaseId}
            </div>
            <p style={{ margin: '0 auto 1.75rem auto', maxWidth: '500px', fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
              Thank you, <strong>{formData.managerName}</strong>. Your referral for <strong>{formData.memberName}</strong> under Division <strong>{formData.divisionId}</strong> has been encrypted and routed directly to the MantraCare Clinical Care Team. A licensed specialist will initiate intake within the assigned priority SLA.
            </p>
            <button
              onClick={handleReset}
              style={{
                padding: '0.7rem 1.6rem',
                background: '#18181b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
            >
              Submit Another Referral
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            
            {/* Section 1: Manager Information */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{
                margin: '0 0 1rem 0',
                fontSize: '0.8rem',
                fontWeight: '800',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#0f172a'
              }}>
                1. Manager Information
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.35rem' }}>
                    Full Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={formData.managerName}
                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: errors.managerName ? '1px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                  {errors.managerName && <span style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '0.2rem', display: 'block' }}>{errors.managerName}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.35rem' }}>
                    Email Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="jane@company.com"
                    value={formData.managerEmail}
                    onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: errors.managerEmail ? '1px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                  {errors.managerEmail && <span style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '0.2rem', display: 'block' }}>{errors.managerEmail}</span>}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.35rem' }}>
                  Division ID <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '400' }}>(Auto-selected from division link)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. DIV-101"
                  value={formData.divisionId}
                  onChange={(e) => setFormData({ ...formData, divisionId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    background: '#f8fafc',
                    fontWeight: '600',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Section 2: Team Member Profile */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{
                margin: '0 0 1rem 0',
                fontSize: '0.8rem',
                fontWeight: '800',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#0f172a'
              }}>
                2. Team Member Profile
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.35rem' }}>
                    Full Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John Smith"
                    value={formData.memberName}
                    onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: errors.memberName ? '1px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                  {errors.memberName && <span style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '0.2rem', display: 'block' }}>{errors.memberName}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.35rem' }}>
                    Phone Number <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.memberPhone}
                    onChange={(e) => setFormData({ ...formData, memberPhone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: errors.memberPhone ? '1px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                  {errors.memberPhone && <span style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '0.2rem', display: 'block' }}>{errors.memberPhone}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.35rem' }}>
                    Email Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="john@company.com"
                    value={formData.memberEmail}
                    onChange={(e) => setFormData({ ...formData, memberEmail: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: errors.memberEmail ? '1px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                  {errors.memberEmail && <span style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '0.2rem', display: 'block' }}>{errors.memberEmail}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.35rem' }}>
                    Employee ID <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '400' }}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="EMP12345"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Support Needs */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{
                margin: '0 0 1rem 0',
                fontSize: '0.8rem',
                fontWeight: '800',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#0f172a'
              }}>
                3. Support Needs
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.35rem' }}>
                    Primary Reason <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formData.primaryReason}
                    onChange={(e) => setFormData({ ...formData, primaryReason: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: errors.primaryReason ? '1px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      color: formData.primaryReason ? '#0f172a' : '#64748b',
                      background: 'white',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  >
                    <option value="" disabled>Please select one</option>
                    {PRIMARY_REASONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {errors.primaryReason && <span style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '0.2rem', display: 'block' }}>{errors.primaryReason}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.35rem' }}>
                    Urgency Level <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formData.urgencyLevel}
                    onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: errors.urgencyLevel ? '1px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      color: formData.urgencyLevel ? '#0f172a' : '#64748b',
                      background: 'white',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  >
                    <option value="" disabled>Please select one</option>
                    {URGENCY_LEVELS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  {errors.urgencyLevel && <span style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '0.2rem', display: 'block' }}>{errors.urgencyLevel}</span>}
                </div>
              </div>

              {/* Remarks Field (Mandatory if 'Other' is selected, otherwise optional) */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.35rem' }}>
                  Remarks {formData.primaryReason === 'Other' ? (
                    <span style={{ color: '#ef4444' }}>* (Mandatory when "Other" is selected)</span>
                  ) : (
                    <span style={{ color: '#64748b', fontWeight: '400' }}>(Optional)</span>
                  )}
                </label>
                <textarea
                  rows="3"
                  placeholder={formData.primaryReason === 'Other' ? "Please specify details for 'Other' reason (Mandatory)..." : "Specific context, behavioral observations, or notes for the clinical intake team..."}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: errors.remarks ? '1px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    boxSizing: 'border-box',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
                {errors.remarks && <span style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '0.2rem', display: 'block' }}>{errors.remarks}</span>}
              </div>

              {/* Consent Box */}
              <div style={{
                padding: '1.15rem 1.25rem',
                borderRadius: '10px',
                border: errors.consentConfirmed ? '1px solid #fecaca' : '1px solid #e2e8f0',
                background: errors.consentConfirmed ? '#fef2f2' : '#ffffff',
                marginBottom: '1.5rem',
                boxSizing: 'border-box'
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.consentConfirmed}
                    onChange={(e) => setFormData({ ...formData, consentConfirmed: e.target.checked })}
                    style={{
                      width: '18px',
                      height: '18px',
                      marginTop: '0.15rem',
                      accentColor: '#18181b',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  />
                  <div>
                    <span style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>
                      Manager Consent &amp; Acknowledgment <span style={{ color: '#ef4444' }}>*</span>
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, display: 'block' }}>
                      I confirm that I have informed the employee about this referral and they have agreed to be contacted by MantraCare. I understand that all clinical information remains strictly confidential.
                    </span>
                  </div>
                </label>
                {errors.consentConfirmed && <span style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '0.4rem', display: 'block', marginLeft: '1.9rem' }}>{errors.consentConfirmed}</span>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  background: '#18181b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#09090b'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#18181b'}
              >
                Submit Secure Referral
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#94a3b8' }}>
        Secured by MantraCare &copy; 2026
      </div>

    </div>
  );
}
