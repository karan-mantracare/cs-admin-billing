import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Clients1() {
  const navigate = useNavigate();
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [billingData, setBillingData] = useState({
    startDate: '',
    frequency: 'Monthly',
    contractTerm: '12',
    paymentTerm: 'Pre Pay'
  });

  const [formData, setFormData] = useState({
    plan: 'Test Billing',
    programCode: 'test-billing-',
    noOfEmployees: '500',
    planStart: '2026-06-01',
    planEnd: '2027-06-01',
    amount: '1000',
    totalReceived: '400',
    countryCode: 'India',
    providerCostLevel: '',
    description: '',
    domains: '',
    remarks: '',
    pathwaysEnabled: true,
    enabledFeatures: 'All',
    customizedTiles: 'Women Wellness, Fitness, Emotional Wellbeing, Yoga, Quit Smokin...',
    employeeListRestriction: true,
    autoInvite: false,
    enforceOTP: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <main className="main-content">
      <div className="edit-header-top">
        <div className="edit-title-group">
          <h1>Edit Order</h1>
        </div>
        <div className="edit-actions">
          <button className="btn-outline">Employee List</button>
        </div>
      </div>

      <form>
        {/* Section 1: Plan & Schedule */}
        <div className="section-card">
          <div className="section-title">
            <i className='bx bx-calendar-event'></i>
            <h2>Plan & Schedule</h2>
          </div>
          <div className="section-content">
            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="form-group">
                <label>Plan</label>
                <input type="text" className="form-control" name="plan" value={formData.plan} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Program Code</label>
                <input type="text" className="form-control" name="programCode" value={formData.programCode} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>No of Employees</label>
                <input type="number" className="form-control" name="noOfEmployees" value={formData.noOfEmployees} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Plan Start</label>
                <input type="date" className="form-control" name="planStart" value={formData.planStart} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Plan End</label>
                <input type="date" className="form-control" name="planEnd" value={formData.planEnd} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Amount (USD)</label>
                <input type="number" className="form-control" name="amount" value={formData.amount} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Country Code</label>
                <select className="form-control" name="countryCode" value={formData.countryCode} onChange={handleChange}>
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                </select>
              </div>
              <div className="form-group">
                <label>Provider Cost Level</label>
                <select className="form-control" name="providerCostLevel" value={formData.providerCostLevel} onChange={handleChange}>
                  <option value="">Select level</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div className="form-group summary-box" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsBillingModalOpen(true)}>
                <div style={{ textAlign: 'center', color: 'var(--primary)', fontWeight: 600, fontSize: '1.2rem' }}>
                  <i className='bx bx-cog' style={{ marginRight: '8px' }}></i>
                  Set Billing
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Details */}
        <div className="section-card">
          <div className="section-title">
            <i className='bx bx-file-blank'></i>
            <h2>Details</h2>
          </div>
          <div className="section-content">
            <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" name="description" rows="3" value={formData.description} onChange={handleChange}></textarea>
              </div>
              <div className="form-group">
                <label>Domains</label>
                <textarea className="form-control" name="domains" rows="2" placeholder="e.g. acme.com, acme.co.in" value={formData.domains} onChange={handleChange}></textarea>
                <span className="hint-text">Comma-separated list of email domains allowed to sign up.</span>
              </div>
              <div className="form-group">
                <label>Remarks</label>
                <textarea className="form-control" name="remarks" rows="2" value={formData.remarks} onChange={handleChange}></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: App Configuration */}
        <div className="section-card">
          <div className="section-title">
            <i className='bx bx-slider'></i>
            <h2>App Configuration</h2>
          </div>
          <div className="section-content">
            <div className={`setting-row ${formData.pathwaysEnabled ? 'enabled' : 'disabled'}`}>
              <div className="setting-info">
                <span className="setting-title">Pathways enabled</span>
                <span className="setting-desc">Allow employees to access guided pathway content.</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" name="pathwaysEnabled" checked={formData.pathwaysEnabled} onChange={handleChange} />
                <span className="slider"></span>
              </label>
            </div>
            
            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="form-group">
                <label>Enabled Features</label>
                <span className="hint-text" style={{ marginTop: '-4px', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.7rem' }}>TRACKERS</span>
                <select className="form-control" name="enabledFeatures" value={formData.enabledFeatures} onChange={handleChange}>
                  <option value="All">All</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              <div className="form-group">
                <label>Customized Tiles (only these will be visible to the user)</label>
                <input type="text" className="form-control" name="customizedTiles" value={formData.customizedTiles} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Access & Security */}
        <div className="section-card">
          <div className="section-title">
            <i className='bx bx-check-shield'></i>
            <h2>Access & Security</h2>
          </div>
          <div className="section-content">
            <div className={`setting-row ${formData.employeeListRestriction ? 'enabled' : 'disabled'}`}>
              <div className="setting-info">
                <span className="setting-title">Employee list restriction</span>
                <span className="setting-desc">Only employees present in the uploaded employee list can sign up.</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" name="employeeListRestriction" checked={formData.employeeListRestriction} onChange={handleChange} />
                <span className="slider"></span>
              </label>
            </div>
            
            <div className={`setting-row ${formData.autoInvite ? 'enabled' : 'disabled'}`}>
              <div className="setting-info">
                <span className="setting-title">Auto invite</span>
                <span className="setting-desc">Show a join offer on app open to users with a pending invite or matching email domain.</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" name="autoInvite" checked={formData.autoInvite} onChange={handleChange} />
                <span className="slider"></span>
              </label>
            </div>
            
            <div className={`setting-row ${formData.enforceOTP ? 'enabled' : 'disabled'}`}>
              <div className="setting-info">
                <span className="setting-title">Enforce OTP verification</span>
                <span className="setting-desc">Require employees to verify via OTP before accessing the platform.</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" name="enforceOTP" checked={formData.enforceOTP} onChange={handleChange} />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <button type="button" className="btn-primary" onClick={() => alert('Order Updated!')}>
            Update Order
          </button>
        </div>
      </form>

      {/* Set Billing Modal */}
      {isBillingModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBillingModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Set Billing</h2>
              <button className="close-btn" onClick={() => setIsBillingModalOpen(false)}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              navigate(`/client-payments?client=Test%20Billing&generate=true&start=${billingData.startDate}&freq=${billingData.frequency}&term=${billingData.contractTerm}&payTerm=${billingData.paymentTerm}&amount=${formData.amount}`);
            }}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Bill Start Date <span className="text-red">*</span></label>
                  <input 
                    type="date" 
                    className="form-control" 
                    required
                    value={billingData.startDate}
                    onChange={(e) => setBillingData({...billingData, startDate: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Frequency <span className="text-red">*</span></label>
                  <select className="form-control" required value={billingData.frequency} onChange={(e) => setBillingData({...billingData, frequency: e.target.value})}>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half Yearly">Half Yearly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Contract Term (Months) <span className="text-red">*</span></label>
                  <input 
                    type="number" 
                    className="form-control" 
                    required
                    min="1"
                    value={billingData.contractTerm}
                    onChange={(e) => setBillingData({...billingData, contractTerm: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Payment Term <span className="text-red">*</span></label>
                  <select className="form-control" required value={billingData.paymentTerm} onChange={(e) => setBillingData({...billingData, paymentTerm: e.target.value})}>
                    <option value="Pre Pay">Pre Pay</option>
                    <option value="Post Pay">Post Pay</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-outline" onClick={() => setIsBillingModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Generate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Clients1;
