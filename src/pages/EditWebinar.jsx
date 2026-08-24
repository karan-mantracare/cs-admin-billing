import { useState } from 'react';
import { Link } from 'react-router-dom';
import ApprovalModal from '../components/ApprovalModal';

function EditWebinar() {
  const [status, setStatus] = useState('tentative');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOtherExpModalOpen, setIsOtherExpModalOpen] = useState(false);
  
  // New Other Expense state
  const [otherExpData, setOtherExpData] = useState({
    expenseType: 'Flight',
    details: '',
    amount: '',
    deliveredBy: ''
  });
  const [isSessionInfoOpen, setIsSessionInfoOpen] = useState(false);
  const [assignedExpert, setAssignedExpert] = useState(null);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  
  // Lifted modal state
  const [modalData, setModalData] = useState({
    sessionType: '',
    sessionLocation: '',
    expertExp: '',
    genderPref: '',
    budget: '',
    otherCosts: '',
    participantCount: ''
  });
  const [isLocked, setIsLocked] = useState(false);

  const pageTitle = "Mindfulness Webinar";
  const [pageDate, setPageDate] = useState("2026-04-08");

  return (
    <main className="main-content">
      <div className="edit-page-header card">
        <div className="edit-header-top">
          <div className="edit-title-group">
            <Link to="/" className="back-btn"><i className='bx bx-chevron-left'></i></Link>
            <h1>{pageTitle}</h1>
          </div>
          <div className="edit-actions">
            <div className="date-picker-wrapper">
              <input type="date" value={pageDate} onChange={(e) => setPageDate(e.target.value)} className="form-control" />
            </div>
            <select className="form-control status-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="tentative">Tentative</option>
              <option value="reschedule">Reschedule</option>
              <option value="approved">Approved</option>
              <option value="cancelled">Cancelled</option>
              <option value="complete">Complete</option>
              <option value="special_approval">Special_approval</option>
            </select>
            {(status === 'tentative' || status === 'complete' || status === 'special_approval') && (
              <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                {status === 'complete' ? 'Update Participant Count' : (isLocked ? 'Update Details' : 'Submit Request')}
              </button>
            )}
            <button className="btn-outline" onClick={() => setIsOtherExpModalOpen(true)} style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
              Add Other Expense
            </button>
          </div>
        </div>
        <p className="edit-description">
          To guide participants in cultivating present-moment awareness, reducing stress, and enhancing overall well-being through practical mindfulness techniques.
        </p>
      </div>

      <div className="section-card">
        <div className="section-title">
          <i className='bx bx-info-circle'></i>
          <h2>About Mindfulness Webinar :</h2>
        </div>
        <div className="section-content">
          <p>This enriching session is designed to introduce participants to the transformative power of mindfulness, guided by experienced facilitators. Explore the art of being fully present, cultivating awareness, and incorporating mindfulness practices into daily life.</p>
        </div>
      </div>

      <div className="section-card">
        <div className="section-title">
          <i className='bx bx-info-circle'></i>
          <h2>Steps for Launch :</h2>
        </div>
        <div className="section-content">
          <ul className="steps-list">
            <li><strong>Week 1: Announcement:</strong> Launch the awareness initiative by announcing the upcoming webinar through teasers and creatives.</li>
            <li><strong>Week 2: Promotional Activities:</strong> Send regular communications with information about mental health facts, statistics, and teaser content about what the webinar will cover.</li>
            <li><strong>Week 3: Testimonials or Stories:</strong> Feature testimonials or stories from individuals who have faced challenges or from those who have supported others. The goal is to humanise the issue to promote empathy.</li>
            <li><strong>Week 4: Webinar Session:</strong> Conduct the webinar, covering key topics, providing expert insights, and fostering an open discussion about mental health.</li>
          </ul>
        </div>
      </div>

      <div className="section-card">
        <div className="section-title">
          <i className='bx bx-info-circle'></i>
          <h2>Communication :</h2>
        </div>
        <div className="section-content">
          <h3 className="sub-heading">Creatives :</h3>
          <div className="creatives-grid">
            <div className="creative-item">
              <div className="creative-card c-yellow">
                <p>In a world of distractions, mindfulness is the ultimate superpower.</p>
              </div>
              <div className="creative-actions">
                <button className="c-action-btn"><i className='bx bx-cloud-download'></i></button>
                <button className="c-action-btn"><i className='bx bx-pencil'></i></button>
              </div>
            </div>
            <div className="creative-item">
              <div className="creative-card c-orange">
                <i className='bx bx-sun' style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#d97706' }}></i>
                <p>Every step is a meditation, every breath a prayer.</p>
              </div>
              <div className="creative-actions">
                <button className="c-action-btn"><i className='bx bx-cloud-download'></i></button>
                <button className="c-action-btn"><i className='bx bx-pencil'></i></button>
              </div>
            </div>
            <div className="creative-item">
              <div className="creative-card c-purple">
                <p>GROUNDED IN THE HERE AND NOW, MINDFULNESS ANCHORS THE SOUL.</p>
              </div>
              <div className="creative-actions">
                <button className="c-action-btn"><i className='bx bx-cloud-download'></i></button>
                <button className="c-action-btn"><i className='bx bx-pencil'></i></button>
              </div>
            </div>
            <div className="creative-item">
              <div className="creative-card c-green">
                <p>Finding magic in the moment. Mindfulness at its finest.</p>
              </div>
              <div className="creative-actions">
                <button className="c-action-btn"><i className='bx bx-cloud-download'></i></button>
                <button className="c-action-btn"><i className='bx bx-pencil'></i></button>
              </div>
            </div>
            <div className="creative-item">
              <div className="creative-card c-pink">
                <p>Embracing the beauty of simplicity through mindful living.</p>
              </div>
              <div className="creative-actions">
                <button className="c-action-btn"><i className='bx bx-cloud-download'></i></button>
                <button className="c-action-btn"><i className='bx bx-pencil'></i></button>
              </div>
            </div>
          </div>
          <h3 className="sub-heading mt-4">Messages & Slogans :</h3>
        </div>
      </div>

      <div className="stats-container" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="small-card" style={{ marginBottom: 0 }}>
          <div className="stats-box">
            <div>
              <span className="stats-label">Total Participants</span>
              <h3 className="stats-value">{modalData.participantCount || '0'}</h3>
            </div>
            <button className="stats-action"><i className='bx bx-log-in-circle'></i></button>
          </div>
        </div>

        <div className="small-card" style={{ marginBottom: 0 }}>
          <div className="stats-box">
            <div>
              <span className="stats-label">Session Cost</span>
              <h3 className="stats-value">{isLocked && modalData.budget ? modalData.budget : '0'}</h3>
            </div>
            <button className="stats-action"><i className='bx bx-log-in-circle'></i></button>
          </div>
        </div>

        <div className="small-card" style={{ marginBottom: 0 }}>
          <div className="stats-box">
            <div>
              <span className="stats-label">Other Cost</span>
              <h3 className="stats-value">{modalData.otherCosts ? modalData.otherCosts : '0'}</h3>
            </div>
            <button className="stats-action"><i className='bx bx-log-in-circle'></i></button>
          </div>
        </div>

        {(status === 'approved' || status === 'complete' || status === 'special_approval') && (
          <div className="small-card" style={{ marginBottom: 0 }}>
            <div className="stats-box">
              <div>
                <span className="stats-label">Expert Assigned</span>
                {assignedExpert ? (
                  <h3 className="stats-value" style={{ cursor: 'pointer', color: 'var(--primary)', textDecoration: 'underline', fontSize: '1.1rem', marginTop: '0.25rem' }} onClick={() => setIsProviderModalOpen(true)}>
                    {assignedExpert.name}
                  </h3>
                ) : (
                  <h3 className="stats-value" style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Expert not assigned</h3>
                )}
              </div>
              <button 
                className="stats-action" 
                title={assignedExpert ? "View Provider" : "Simulate Assignment"} 
                onClick={() => {
                  if (assignedExpert) setIsProviderModalOpen(true);
                  else setAssignedExpert({ name: 'Dr. Sarah Jenkins', location: 'New York, USA', expertise: 'Mindfulness, CBT', exp: '10 Years', language: 'English, Spanish', photo: 'https://i.pravatar.cc/150?u=sarah', link: 'https://mantracare.org' });
                }}
              >
                 <i className={`bx ${assignedExpert ? 'bx-user-check' : 'bx-user-plus'}`}></i>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="section-card comments-card">
        <div className="section-title">
          <i className='bx bx-info-circle'></i>
          <h2>Comments :</h2>
        </div>
        <div className="section-content text-center">
          <p className="no-comments">No comments yet</p>
          <button className="btn-primary mt-3">Add Comments</button>
        </div>
      </div>

      <ApprovalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        pageTitle={pageTitle}
        pageDate={pageDate}
        modalData={modalData}
        setModalData={setModalData}
        isLocked={isLocked}
        setIsLocked={setIsLocked}
        status={status}
      />

      {/* Add Other Session Exp Modal */}
      {isOtherExpModalOpen && (
        <div className="modal-overlay" onClick={() => setIsOtherExpModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Add Other Expense</h2>
              <button className="close-btn" onClick={() => setIsOtherExpModalOpen(false)}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                alert("Expense Request Sent Successfully!");
                setModalData(prev => ({ ...prev, otherCosts: (parseFloat(prev.otherCosts || 0) + parseFloat(otherExpData.amount)).toString() }));
                setIsOtherExpModalOpen(false);
                setOtherExpData({ expenseType: 'Flight', details: '', amount: '', deliveredBy: '' });
              }}
              style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}
            >
              <div className="modal-body" style={{ overflowY: 'auto' }}>
                {/* Section 1 */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}
                    onClick={() => setIsSessionInfoOpen(!isSessionInfoOpen)}
                  >
                    <h3 className="modal-section-title" style={{ margin: 0, border: 'none', padding: 0 }}>Section 1 - Session Information</h3>
                    <i className={`bx bx-chevron-${isSessionInfoOpen ? 'up' : 'down'}`} style={{ fontSize: '1.25rem', color: 'var(--primary)' }}></i>
                  </div>
                  
                  {isSessionInfoOpen && (
                    <>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Session Name</label>
                        <input type="text" className="form-control" readOnly value={pageTitle} />
                      </div>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Session Date</label>
                        <input type="date" className="form-control" readOnly value={pageDate} />
                      </div>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Client Name</label>
                        <input type="text" className="form-control" readOnly value="MantraCare Internal" />
                      </div>
                    </>
                  )}
                </div>

                {/* Section 2 */}
                <div>
                  <h3 className="modal-section-title">Section 2 - Expense Information</h3>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label>Expense Type <span className="text-red">*</span></label>
                  <select 
                    className="form-control" 
                    required 
                    value={otherExpData.expenseType} 
                    onChange={(e) => setOtherExpData({...otherExpData, expenseType: e.target.value})}
                  >
                    <option value="Flight">Flight</option>
                    <option value="Promotional">Promotional</option>
                    <option value="Goodies">Goodies</option>
                    <option value="Session Material">Session Material</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Delivery By <span className="text-red">*</span></label>
                  <input 
                    type="date" 
                    className="form-control" 
                    required
                    value={otherExpData.deliveredBy}
                    onChange={(e) => setOtherExpData({...otherExpData, deliveredBy: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Details <span className="text-red">*</span></label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required
                    maxLength="200"
                    placeholder="Brief description (max 200 chars)"
                    value={otherExpData.details}
                    onChange={(e) => setOtherExpData({...otherExpData, details: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Amount (USD) <span className="text-red">*</span></label>
                  <input 
                    type="number" 
                    className="form-control" 
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={otherExpData.amount}
                    onChange={(e) => setOtherExpData({...otherExpData, amount: e.target.value})}
                  />
                </div>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-outline" onClick={() => setIsOtherExpModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Request for Approval</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Provider Details Modal */}
      {isProviderModalOpen && assignedExpert && (
        <div className="modal-overlay" onClick={() => setIsProviderModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Provider Details</h2>
              <button className="close-btn" onClick={() => setIsProviderModalOpen(false)}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <div className="modal-body text-center">
              <img src={assignedExpert.photo} alt={assignedExpert.name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem', border: '3px solid var(--primary-light)' }} />
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', fontSize: '1.25rem' }}>{assignedExpert.name}</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: '500' }}>{assignedExpert.expertise}</p>
              
              <div style={{ textAlign: 'left', background: 'var(--bg-main)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <p style={{ margin: '0 0 0.75rem 0' }}><i className='bx bx-map text-primary' style={{ marginRight: '8px' }}></i><strong>Location:</strong> {assignedExpert.location}</p>
                <p style={{ margin: '0 0 0.75rem 0' }}><i className='bx bx-briefcase text-primary' style={{ marginRight: '8px' }}></i><strong>Experience:</strong> {assignedExpert.exp}</p>
                <p style={{ margin: '0 0 0.75rem 0' }}><i className='bx bx-world text-primary' style={{ marginRight: '8px' }}></i><strong>Language:</strong> {assignedExpert.language}</p>
                <p style={{ margin: '0' }}><i className='bx bx-link-external text-primary' style={{ marginRight: '8px' }}></i><strong>Other Info:</strong> <a href={assignedExpert.link} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>View Profile URL</a></p>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <button className="btn-outline" onClick={() => setIsProviderModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default EditWebinar;
