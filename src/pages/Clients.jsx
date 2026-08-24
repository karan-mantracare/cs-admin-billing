import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Clients() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    plan: 'Comprehensive Wellness (Therapy, Weight, Dia...',
    programCode: 'mantrainternal-',
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
              <div className="form-group summary-box" onClick={() => navigate('/client-payments?client=Comprehensive%20Wellness')} title="Go to Client Payments" style={{ cursor: 'pointer' }}>
                <div className="summary-content">
                  <div className="summary-item">
                    <span>Total Received:</span>
                    <strong>${formData.totalReceived}</strong>
                  </div>
                  <div className="summary-item due">
                    <span>Total Due:</span>
                    <strong>${(parseFloat(formData.amount || 0) - parseFloat(formData.totalReceived || 0)).toFixed(2)}</strong>
                  </div>
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
    </main>
  );
}

export default Clients;
