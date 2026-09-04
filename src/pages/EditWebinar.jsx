import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import ApprovalModal from '../components/ApprovalModal';
import ExpertProfileModal from '../components/ExpertProfileModal';
import ChangeExpertModal from '../components/ChangeExpertModal';
import ConfirmModal from '../components/ConfirmModal';
import { useGlobal } from '../context/GlobalContext';

function EditWebinar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('id');
  const userRole = searchParams.get('role');
  const { addExpense, addEvent, addComment, updateEventDetails, events, expenses, updateExpenseStatus, updateExpense, deleteEvent, requestReschedule, updateEventStatus: _unusedStatus, showToast } = useGlobal();

  const currentEvent = eventId
    ? events.find(ev => ev.id.toString() === eventId)
    : events.find(ev => ev.sessionName === "Mindfulness Webinar-1");

  const pageTitle = currentEvent ? currentEvent.sessionName : "Mindfulness Webinar-1";

  const [status, setStatus] = useState(currentEvent ? currentEvent.status.toLowerCase() : 'tentative');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOtherExpModalOpen, setIsOtherExpModalOpen] = useState(false);

  // Reschedule State
  const [showReschedulePrompt, setShowReschedulePrompt] = useState(false);
  const [showRescheduleDatepicker, setShowRescheduleDatepicker] = useState(false);
  const [newRescheduleDate, setNewRescheduleDate] = useState('');

  // New Other Expense state
  const [resubmitExpId, setResubmitExpId] = useState(null);
  const [viewRejectExpense, setViewRejectExpense] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return { bg: 'transparent', text: '#059669' };
      case 'Rejected': return { bg: 'transparent', text: '#dc2626' };
      case 'Settled': return { bg: 'transparent', text: '#4f46e5' };
      case 'Disbursed': return { bg: 'transparent', text: '#4f46e5' };
      default: return { bg: 'transparent', text: '#d97706' }; // Pending Approval
    }
  };

  const [otherExpData, setOtherExpData] = useState({
    expenseType: 'Standee',
    details: '',
    amount: '',
    deliveredBy: ''
  });
  const [isSessionInfoOpen, setIsSessionInfoOpen] = useState(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);

  // Comments state
  const eventComments = currentEvent && currentEvent.comments ? currentEvent.comments : [];
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(5);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [newComment, setNewComment] = useState({ name: '', text: '' });

  // Expert Details Collapse State
  const [isExpertDetailsOpen, setIsExpertDetailsOpen] = useState(false);
  const [isExpenseDetailsOpen, setIsExpenseDetailsOpen] = useState(false);

  // New Modals State
  const [isExpertProfileOpen, setIsExpertProfileOpen] = useState(false);
  const [selectedExpertProfile, setSelectedExpertProfile] = useState('');
  const [isChangeExpertOpen, setIsChangeExpertOpen] = useState(false);
  const [isConfirmChangeExpertOpen, setIsConfirmChangeExpertOpen] = useState(false);
  const [changeExpertData, setChangeExpertData] = useState(null);
  const [editingRequestId, setEditingRequestId] = useState(null);

  // Final Payment Modal State
  const [isFinalPaymentModalOpen, setIsFinalPaymentModalOpen] = useState(false);
  const [finalPaymentData, setFinalPaymentData] = useState({
    sessionProvider: '',
    sessionDuration: '',
    sessionDate: '',
    sessionCost: '',
    participantCount: ''
  });

  const providerDetails = currentEvent && currentEvent.assignedExpert ? {
    name: currentEvent.assignedExpert,
    location: 'New York, USA',
    expertise: 'Mindfulness, CBT',
    exp: '10 Years',
    language: 'English, Spanish',
    photo: 'https://i.pravatar.cc/150?u=sarah',
    link: 'https://mantracare.org'
  } : null;

  // Lifted modal state
  const [modalData, setModalData] = useState({
    sessionType: '',
    sessionLocation: '',
    sessionTime: '',
    expertExp: '',
    genderPref: '',
    budget: '',
    otherCosts: '',
    participantCount: ''
  });
  const [isLocked, setIsLocked] = useState(false);

  const [pageDate, setPageDate] = useState(currentEvent ? currentEvent.sessionDate : "2026-08-25");

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const sessionDateObj = new Date(pageDate);
  sessionDateObj.setHours(0, 0, 0, 0);
  const isAddFinalPaymentDisabled = sessionDateObj > todayDate;

  useEffect(() => {
    if (currentEvent) {
      setStatus(currentEvent.status.toLowerCase());
      setModalData(prev => ({
        ...prev,
        sessionType: currentEvent.sessionType === 'seminar' ? 'onsite' : (currentEvent.sessionType === 'webinar' ? 'online' : (currentEvent.sessionType || '')),
        sessionLocation: currentEvent.location || ''
      }));
    }
  }, [currentEvent]);

  const getStatusLabel = (s = status) => {
    if (s === 'tentative' || s === 'pending_confirmation') return 'Tentative';
    if (s === 'provider_allocation_pending') return 'Event Approved';
    if (s === 'expert_change_requested') return 'Change Requested';
    if (s === 'event_scheduled') return 'Expert Assigned';
    if (s === 'reschedule_requested') return 'Reschedule Requested';
    if (s === 'date_change_requested') return 'Date Change Requested';
    if (s === 'completed' || s === 'complete' || s === 'event_completed') return 'Completed';
    if (s === 'canceled_by_cs') return 'Canceled by CS';
    if (s === 'canceled_by_hr') return 'Canceled by HR';
    return s;
  };

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
              <input
                type="date"
                value={pageDate}
                onChange={(e) => setPageDate(e.target.value)}
                className="form-control"
                disabled={status === 'complete' || status === 'completed' || status === 'event_completed' || status === 'canceled_by_cs' || status === 'canceled_by_hr'}
              />
            </div>
            <div className="status-box" style={{ padding: '0.4rem 1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontWeight: '500', color: 'var(--primary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
              {getStatusLabel()}
              {(() => {
                if (!currentEvent || !currentEvent.expertRequests || currentEvent.expertRequests.length <= 1) return null;
                const reqs = currentEvent.expertRequests;
                const approvedCount = reqs.filter(r => r.status === 'event_scheduled' || r.status === 'complete' || r.status === 'completed' || r.assignedExpert).length;
                if (approvedCount > 0 && approvedCount < reqs.length) {
                  return ` (${approvedCount} / ${reqs.length})`;
                }
                return null;
              })()}
            </div>
          </div>
        </div>
        <p className="edit-description">
          To guide participants in cultivating present-moment awareness, reducing stress, and enhancing overall well-being through practical mindfulness techniques.
        </p>
      </div>

      <div className="section-card">
        <div className="section-title">
          <i className='bx bx-info-circle'></i>
          <h2>About Mindfulness Webinar-1 :</h2>
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
              <h3 className="stats-value">{currentEvent?.participantCount || '0'}</h3>
            </div>
          </div>
        </div>

        {(status === 'approved' || status === 'complete' || status === 'special_approval') && (
          <div className="small-card" style={{ marginBottom: 0 }}>
            <div className="stats-box">
              <div>
                <span className="stats-label">Expert Assigned</span>
                {currentEvent && currentEvent.assignedExpert ? (
                  <h3 className="stats-value" style={{ cursor: 'pointer', color: 'var(--primary)', textDecoration: 'underline', fontSize: '1.1rem', marginTop: '0.25rem' }} onClick={() => setIsProviderModalOpen(true)}>
                    {currentEvent.assignedExpert}
                  </h3>
                ) : (
                  <h3 className="stats-value" style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Expert not assigned</h3>
                )}
              </div>
              <button
                className="stats-action"
                title={currentEvent && currentEvent.assignedExpert ? "View Provider" : "Simulate Assignment"}
                onClick={() => {
                  if (currentEvent && currentEvent.assignedExpert) setIsProviderModalOpen(true);
                }}
              >
                <i className={`bx ${(currentEvent && currentEvent.assignedExpert) ? 'bx-user-check' : 'bx-user-plus'}`}></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Expert Details Table */}
      <div className="section-card">
        <div
          className="section-title"
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          onClick={() => setIsExpertDetailsOpen(!isExpertDetailsOpen)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className='bx bx-user'></i>
            <h2 style={{ margin: 0, border: 'none', padding: 0 }}>Expert Details :</h2>
            {(() => {
              if (userRole === 'hr') return null;
              const reqs = currentEvent?.expertRequests || ((currentEvent?.status && currentEvent.status !== 'tentative') ? [currentEvent] : []);
              const totalCost = reqs.reduce((sum, req) => sum + (parseFloat(req.expertCost) || 0), 0);
              return (
                <span style={{ marginLeft: '1rem', fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: '500', background: 'var(--bg-light)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                  Total Expert Cost: USD {totalCost}
                </span>
              );
            })()}
          </div>
          <i className={`bx bx-chevron-${isExpertDetailsOpen ? 'up' : 'down'}`} style={{ fontSize: '1.5rem', color: 'var(--primary)' }}></i>
        </div>
        {isExpertDetailsOpen && (
          <div className="section-content">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Session Type</th>
                    <th>Location</th>
                    {userRole !== 'hr' && (
                      <>
                        <th>Time</th>
                        <th>Expert Details</th>
                        <th>Budget (USD)</th>
                        <th>Status</th>
                      </>
                    )}
                    <th>Expert Name</th>
                    {userRole !== 'hr' && (
                      <>
                        <th>Price (USD)</th>
                        <th>Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const reqs = currentEvent?.expertRequests ||
                      ((currentEvent?.status && currentEvent.status !== 'tentative') ? [currentEvent] : []);
                    if (reqs.length === 0) {
                      return (
                        <tr>
                          <td colSpan={userRole === 'hr' ? 3 : 9} style={{ textAlign: 'center', padding: '2rem' }}>No request details available.</td>
                        </tr>
                      );
                    }
                    return reqs.map((req, idx) => (
                      <tr key={idx}>
                        <td>
                          <span style={{
                            color: (req.sessionType || 'webinar').toLowerCase() === 'onsite' ? 'var(--orange)' : 'var(--primary)',
                            fontWeight: '500',
                            textTransform: 'capitalize'
                          }}>
                            {req.sessionType || 'Webinar'}
                          </span>
                        </td>
                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={req.location || 'Online'}>
                          {req.location || 'Online'}
                        </td>
                        {userRole !== 'hr' && (
                          <>
                            <td>{req.sessionTime || 'TBD'}</td>
                            <td>{req.expertExp ? `${req.expertExp} Years Exp` : '-'}</td>
                            <td>${req.budget || 0}</td>
                            <td>{getStatusLabel(req.status || currentEvent.status)}</td>
                          </>
                        )}
                        <td>
                          {req.assignedExpert ? (
                            <a href="#" onClick={(e) => { e.preventDefault(); setSelectedExpertProfile(req.assignedExpert); setIsExpertProfileOpen(true); }} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>
                              {req.assignedExpert}
                            </a>
                          ) : '-'}
                        </td>
                        {userRole !== 'hr' && (
                          <>
                            <td>${req.expertCost || 0}</td>
                            <td>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button className="btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }} onClick={() => {
                              if (req.assignedExpert) {
                                setChangeExpertData({
                                  sessionName: currentEvent.sessionName,
                                  sessionDate: currentEvent.sessionDate,
                                  sessionTime: req.sessionTime || 'TBD',
                                  sessionType: req.sessionType || 'Webinar',
                                  location: req.location || 'Online',
                                  assignedExpert: req.assignedExpert,
                                  requestId: req.id
                                });
                                setIsConfirmChangeExpertOpen(true);
                              } else {
                                setEditingRequestId(req.id || null);
                                setModalData({
                                  sessionType: req.sessionType || 'webinar',
                                  sessionLocation: req.location || 'Online',
                                  sessionTime: req.sessionTime || '',
                                  expertExp: req.expertExp || '',
                                  budget: req.budget || '',
                                  language: req.language || '',
                                  participantCount: currentEvent.participantCount || '',
                                  status: req.status,
                                  rejectionReason: req.rejectionReason
                                });
                                setIsModalOpen(true);
                              }
                            }}>
                              {req.status === 'rejected' ? <><i className='bx bx-show'></i> View</> : 'Edit'}
                            </button>
                          </div>
                        </td>
                          </>
                        )}
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
            {userRole !== 'hr' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button
                className="btn-outline"
                style={{ opacity: isAddFinalPaymentDisabled ? 0.5 : 1, cursor: isAddFinalPaymentDisabled ? 'not-allowed' : 'pointer' }}
                disabled={isAddFinalPaymentDisabled}
                onClick={() => {
                  if (isAddFinalPaymentDisabled) return;
                  // Determine provider and cost based on the first request if available
                  const firstReq = (currentEvent?.expertRequests && currentEvent.expertRequests.length > 0) ? currentEvent.expertRequests[0] : {};
                  setFinalPaymentData({
                    sessionProvider: firstReq.assignedExpert || currentEvent?.assignedExpert || '',
                    sessionDuration: '',
                    sessionDate: pageDate,
                    sessionCost: firstReq.expertCost ? firstReq.expertCost.toString() : '',
                    participantCount: currentEvent?.participantCount ? currentEvent.participantCount.toString() : ''
                  });
                  setIsFinalPaymentModalOpen(true);
                }}
              >
                Mark As Complete
              </button>
              <button className="btn-primary" onClick={() => {
                setIsLocked(false);
                setEditingRequestId(null);
                if (currentEvent?.expertRequests && currentEvent.expertRequests.length > 0) {
                  const lastReq = currentEvent.expertRequests[currentEvent.expertRequests.length - 1];
                  setModalData({
                    sessionType: lastReq.sessionType || 'online',
                    sessionLocation: lastReq.location || 'Online',
                    sessionTime: lastReq.sessionTime || '',
                    expertExp: lastReq.expertExp || '',
                    budget: lastReq.budget || '',
                    language: lastReq.language || '',
                    participantCount: currentEvent.participantCount || ''
                  });
                } else {
                  setModalData({
                    sessionType: 'online',
                    sessionLocation: 'Online',
                    sessionTime: '',
                    expertExp: '',
                    budget: '',
                    language: '',
                    participantCount: currentEvent?.participantCount || ''
                  });
                }
                setIsModalOpen(true);
              }}>Add Request</button>
            </div>
            )}
          </div>
        )}
      </div>

      {/* Expense Details Table */}
      {userRole !== 'hr' && (
      <div className="section-card">
        <div
          className="section-title"
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          onClick={() => setIsExpenseDetailsOpen(!isExpenseDetailsOpen)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className='bx bx-credit-card'></i>
            <h2 style={{ margin: 0, border: 'none', padding: 0 }}>Expense Details :</h2>
            {(() => {
              const sessionExpenses = expenses.filter(exp => exp.sessionName === pageTitle && exp.sessionDate === pageDate);
              const approvedExpenses = sessionExpenses.filter(exp => exp.status === 'Approved' || exp.status === 'Settled' || exp.status === 'Disbursed');
              if (approvedExpenses.length > 0) {
                const totalCost = approvedExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
                return (
                  <span style={{ marginLeft: '1rem', fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: '500', background: 'var(--bg-light)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                    Total Expense: USD {totalCost.toFixed(2)}
                  </span>
                );
              }
              return null;
            })()}
          </div>
          <i className={`bx bx-chevron-${isExpenseDetailsOpen ? 'up' : 'down'}`} style={{ fontSize: '1.5rem', color: 'var(--primary)' }}></i>
        </div>
        {isExpenseDetailsOpen && (
          <div className="section-content">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Expense Type</th>
                    <th>Details</th>
                    <th>Amount (USD)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const sessionExpenses = expenses.filter(exp => exp.sessionName === pageTitle && exp.sessionDate === pageDate);
                    if (sessionExpenses.length === 0) {
                      return (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No expenses available.</td>
                        </tr>
                      );
                    }
                    return sessionExpenses.map((exp, idx) => (
                      <tr key={idx}>
                        <td>{exp.expenseType}</td>
                        <td>{exp.details}</td>
                        <td>${parseFloat(exp.amount).toFixed(2)}</td>
                        <td>
                          <span
                            className={`status-badge ${(exp.status === 'Disbursed' ? 'Settled' : (exp.status || 'Pending')).toLowerCase().replace(' ', '-')}`}
                            style={{
                              background: 'transparent',
                              color: getStatusColor(exp.status === 'Pending' || exp.status === 'Pending Approval' ? 'Pending Approval' : exp.status).text,
                              padding: 0,
                              fontWeight: 500
                            }}
                          >
                            {(exp.status === 'Pending' || exp.status === 'Pending Approval') ? 'Pending Approval' : (exp.status === 'Disbursed' ? 'Settled' : exp.status)}
                          </span>
                        </td>
                        <td>
                          {exp.status === 'Approved' && (
                            <button
                              className="btn-outline"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              onClick={() => {
                                updateExpenseStatus(exp.id, 'Settled');
                                showToast('Expense marked as settled', 3000);
                              }}
                              title="Mark as Settled"
                            >
                              <i className='bx bx-check-double'></i> Settle
                            </button>
                          )}
                          {exp.status === 'Rejected' && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                className="btn-outline"
                                style={{ padding: '0.2rem 0.5rem', fontSize: '1.2rem', color: '#64748b' }}
                                onClick={() => setViewRejectExpense(exp)}
                                title="View Rejection Reason"
                              >
                                <i className='bx bx-show'></i>
                              </button>
                              <button
                                className="btn-outline"
                                style={{ padding: '0.2rem 0.5rem', fontSize: '1.2rem', color: '#3b82f6' }}
                                onClick={() => {
                                  setResubmitExpId(exp.id);
                                  setOtherExpData({
                                    expenseType: exp.expenseType,
                                    details: exp.details,
                                    amount: exp.amount,
                                    deliveredBy: exp.deliveredBy || ''
                                  });
                                  setIsOtherExpModalOpen(true);
                                }}
                                title="Resubmit Expense"
                              >
                                <i className='bx bx-revision'></i>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn-primary" onClick={() => setIsOtherExpModalOpen(true)}>Add Expense</button>
            </div>
          </div>
        )}
      </div>
      )}

      <div className="section-card comments-card">
        <div className="section-title">
          <i className='bx bx-message-square-detail'></i>
          <h2>Comments : ({eventComments.length})</h2>
        </div>
        <div className="section-content" style={{ padding: '0' }}>
          {eventComments.length === 0 ? (
            <div className="text-center" style={{ padding: '2rem' }}>
              <p className="no-comments" style={{ color: 'var(--text-muted)' }}>No comments yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {eventComments.slice(0, visibleCommentsCount).map((comment, idx) => (
                <div key={idx} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{comment.name}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{comment.date}</span>
                  </div>
                  <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{comment.text}</p>
                </div>
              ))}
            </div>
          )}
          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <button className="btn-primary" onClick={() => setIsCommentModalOpen(true)}>Add Comment</button>
            {visibleCommentsCount < eventComments.length && (
              <button
                className="btn-outline"
                onClick={() => setVisibleCommentsCount(prev => prev + 5)}
              >
                Show More
              </button>
            )}
          </div>
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
        onSubmit={(data) => {
          const finalSessionType = (currentEvent && currentEvent.sessionType === 'seminar') ? 'onsite' : data.sessionType;

          if (currentEvent && currentEvent.id) {
            const isSubmitForApproval = currentEvent.status === 'hr_requested' || currentEvent.status === 'tentative';

            const existingReqs = currentEvent.expertRequests ||
              ((currentEvent.status && currentEvent.status !== 'tentative') ? [currentEvent] : []);

            let updatedReqs;
            if (editingRequestId) {
              updatedReqs = existingReqs.map(req => {
                if (req.id === editingRequestId) {
                  const isRejected = req.status === 'rejected';
                  return {
                    ...req,
                    sessionType: finalSessionType,
                    location: data.sessionLocation || 'Online',
                    sessionTime: data.sessionTime || '',
                    expertExp: parseInt(data.expertExp) || 0,
                    budget: parseFloat(data.budget) || 0,
                    language: data.language || 'English',
                    status: isRejected ? 'provider_allocation_pending' : req.status,
                    rejectionReason: isRejected ? null : req.rejectionReason
                  };
                }
                return req;
              });
              setEditingRequestId(null);
            } else {
              const newReq = {
                id: Date.now(),
                sessionType: finalSessionType,
                location: data.sessionLocation || 'Online',
                sessionTime: data.sessionTime || '',
                expertExp: parseInt(data.expertExp) || 0,
                budget: parseFloat(data.budget) || 0,
                language: data.language || 'English',
                status: isSubmitForApproval ? 'pending_confirmation' : currentEvent.status,
                assignedExpert: null,
                expertCost: 0
              };
              updatedReqs = [...existingReqs, newReq];
            }

            updateEventDetails(currentEvent.id, {
              expertRequests: updatedReqs,
              sessionType: finalSessionType,
              location: data.sessionLocation || 'Online',
              sessionTime: data.sessionTime || '',
              expertExp: parseInt(data.expertExp) || 0,
              genderPref: data.genderPref,
              budget: parseFloat(data.budget) || 0,
              otherCosts: parseFloat(data.otherCosts) || 0,
              participantCount: data.participantCount !== undefined ? data.participantCount : (currentEvent.participantCount || 0),
              status: isSubmitForApproval ? 'pending_confirmation' : currentEvent.status,
              requirements: currentEvent.requirements || 'Generated from Edit Webinar flow.'
            });
          } else {
            addEvent({
              submittedOn: new Date().toISOString().split('T')[0],
              sessionName: pageTitle,
              clientName: 'MantraCare Internal',
              sessionDate: pageDate,
              sessionType: finalSessionType,
              location: data.sessionLocation || 'Online',
              sessionTime: data.sessionTime || '',
              expertExp: parseInt(data.expertExp) || 0,
              genderPref: data.genderPref,
              budget: parseFloat(data.budget) || 0,
              otherCosts: parseFloat(data.otherCosts) || 0,
              requirements: 'Generated from Edit Webinar flow.'
            });
          }
        }}
      />

      {/* Add Other Session Exp Modal */}
      {isOtherExpModalOpen && (
        <div className="modal-overlay" onClick={() => { setIsOtherExpModalOpen(false); setResubmitExpId(null); }}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>{resubmitExpId ? 'Resubmit Expense' : 'Add Other Expense'}</h2>
              <button className="close-btn" onClick={() => { setIsOtherExpModalOpen(false); setResubmitExpId(null); }}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (resubmitExpId) {
                  updateExpense(resubmitExpId, {
                    expenseType: otherExpData.expenseType,
                    details: otherExpData.details,
                    deliveredBy: otherExpData.deliveredBy,
                    amount: parseFloat(otherExpData.amount)
                  });
                  showToast("Expense Resubmitted Successfully!", 3000);
                } else {
                  addExpense({
                    date: new Date().toISOString().split('T')[0],
                    clientName: 'MantraCare Internal',
                    sessionName: pageTitle,
                    sessionDate: pageDate,
                    addedBy: 'Admin',
                    expenseType: otherExpData.expenseType,
                    details: otherExpData.details,
                    deliveredBy: otherExpData.deliveredBy,
                    amount: parseFloat(otherExpData.amount)
                  });
                  showToast("Expense Request Sent Successfully!", 3000);
                  setModalData(prev => ({ ...prev, otherCosts: (parseFloat(prev.otherCosts || 0) + parseFloat(otherExpData.amount)).toString() }));
                }
                setIsOtherExpModalOpen(false);
                setOtherExpData({ expenseType: 'Standee', details: '', amount: '', deliveredBy: '' });
                setResubmitExpId(null);
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
                      onChange={(e) => setOtherExpData({ ...otherExpData, expenseType: e.target.value })}
                    >
                      <option value="Standee">Standee</option>
                      <option value="Travel">Travel</option>
                      <option value="Flyers">Flyers</option>
                      <option value="Rewards">Rewards</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label>Delivery By <span className="text-red">*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={otherExpData.deliveredBy}
                      onChange={(e) => setOtherExpData({ ...otherExpData, deliveredBy: e.target.value })}
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
                      onChange={(e) => setOtherExpData({ ...otherExpData, details: e.target.value })}
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
                      onChange={(e) => setOtherExpData({ ...otherExpData, amount: e.target.value })}
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
      {isProviderModalOpen && providerDetails && (
        <div className="modal-overlay" onClick={() => setIsProviderModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Provider Details</h2>
              <button className="close-btn" onClick={() => setIsProviderModalOpen(false)}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <div className="modal-body text-center">
              <img src={providerDetails.photo} alt={providerDetails.name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem', border: '3px solid var(--primary-light)' }} />
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', fontSize: '1.25rem' }}>{providerDetails.name}</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: '500' }}>{providerDetails.expertise}</p>

              <div style={{ textAlign: 'left', background: 'var(--bg-main)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <p style={{ margin: '0 0 0.75rem 0' }}><i className='bx bx-map text-primary' style={{ marginRight: '8px' }}></i><strong>Location:</strong> {providerDetails.location}</p>
                <p style={{ margin: '0 0 0.75rem 0' }}><i className='bx bx-briefcase text-primary' style={{ marginRight: '8px' }}></i><strong>Experience:</strong> {providerDetails.exp}</p>
                <p style={{ margin: '0 0 0.75rem 0' }}><i className='bx bx-world text-primary' style={{ marginRight: '8px' }}></i><strong>Language:</strong> {providerDetails.language}</p>
                <p style={{ margin: '0' }}><i className='bx bx-link-external text-primary' style={{ marginRight: '8px' }}></i><strong>Other Info:</strong> <a href={providerDetails.link} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>View Profile URL</a></p>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <button className="btn-outline" onClick={() => setIsProviderModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Comment Modal */}
      {isCommentModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCommentModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Add Comment</h2>
              <button className="close-btn" onClick={() => setIsCommentModalOpen(false)}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (currentEvent && currentEvent.id) {
                addComment(currentEvent.id, {
                  name: newComment.name,
                  text: newComment.text,
                  date: new Date().toISOString().split('T')[0]
                });
                setNewComment({ name: '', text: '' });
                setIsCommentModalOpen(false);
              } else {
                showToast('Event not found. Cannot add comment.', 3000);
              }
            }}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Name <span className="text-red">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={newComment.name}
                    onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Comment <span className="text-red">*</span></label>
                  <textarea
                    className="form-control"
                    required
                    rows="4"
                    value={newComment.text}
                    onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-outline" onClick={() => setIsCommentModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Post Comment</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Reschedule Prompt Modal */}
      {showReschedulePrompt && (
        <div className="modal-overlay" onClick={() => { setShowReschedulePrompt(false); setShowRescheduleDatepicker(false); }}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Action Not Allowed</h2>
              <button className="close-btn" onClick={() => { setShowReschedulePrompt(false); setShowRescheduleDatepicker(false); }}><i className='bx bx-x'></i></button>
            </div>
            <div className="modal-body text-center">
              {!showRescheduleDatepicker ? (
                <>
                  <p style={{ marginBottom: '1.5rem', lineHeight: '1.5' }}>
                    Since the expert is assigned it can not be Deleted. Do you instead want to raise a reschedule request?
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button className="btn-primary" onClick={() => setShowRescheduleDatepicker(true)}>Yes</button>
                    <button className="btn-outline" onClick={() => setShowReschedulePrompt(false)}>No</button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ marginBottom: '1rem' }}>Please select a new date:</p>
                  <input
                    type="date"
                    className="form-control"
                    value={newRescheduleDate}
                    onChange={e => setNewRescheduleDate(e.target.value)}
                    style={{ marginBottom: '1.5rem', width: '100%' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button className="btn-primary" onClick={() => {
                      if (!newRescheduleDate) { showToast('Please select a date.', 3000); return; }
                      if (currentEvent && currentEvent.id) {
                        requestReschedule(currentEvent.id, newRescheduleDate);
                        showToast("Request sent to the Team.", 5000);
                        setShowReschedulePrompt(false);
                        setShowRescheduleDatepicker(false);
                        setNewRescheduleDate('');
                      }
                    }}>Submit Request</button>
                    <button className="btn-outline" onClick={() => { setShowReschedulePrompt(false); setShowRescheduleDatepicker(false); setNewRescheduleDate(''); }}>Cancel</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Final Payment Modal */}
      {isFinalPaymentModalOpen && (
        <div className="modal-overlay" onClick={() => setIsFinalPaymentModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Submit Details</h2>
              <button className="close-btn" onClick={() => setIsFinalPaymentModalOpen(false)}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (currentEvent && currentEvent.id) {
                updateEventDetails(currentEvent.id, {
                  participantCount: parseInt(finalPaymentData.participantCount, 10),
                  status: 'completed'
                });
                setStatus('completed');
              }
              showToast("Final payment details submitted.", 5000);
              setIsFinalPaymentModalOpen(false);
            }}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Session Provider</label>
                  <input type="text" className="form-control" value={finalPaymentData.sessionProvider} readOnly />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Session Duration (mins) <span className="text-red">*</span></label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    value={finalPaymentData.sessionDuration}
                    onChange={(e) => setFinalPaymentData({ ...finalPaymentData, sessionDuration: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Session Date</label>
                  <input type="date" className="form-control" value={finalPaymentData.sessionDate} readOnly />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Session Cost (USD)</label>
                  <input type="number" className="form-control" value={finalPaymentData.sessionCost} readOnly />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Participant Count <span className="text-red">*</span></label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    value={finalPaymentData.participantCount}
                    onChange={(e) => setFinalPaymentData({ ...finalPaymentData, participantCount: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-outline" onClick={() => setIsFinalPaymentModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Details</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ExpertProfileModal
        isOpen={isExpertProfileOpen}
        onClose={() => setIsExpertProfileOpen(false)}
        expertName={selectedExpertProfile}
      />

      <ConfirmModal
        isOpen={isConfirmChangeExpertOpen}
        onClose={() => setIsConfirmChangeExpertOpen(false)}
        title="Confirm Expert Change"
        message="Expert Assigned, do you want to change the Expert?"
        confirmText="Request Change"
        onConfirm={() => {
          setIsChangeExpertOpen(true);
        }}
      />

      <ChangeExpertModal
        isOpen={isChangeExpertOpen}
        onClose={() => setIsChangeExpertOpen(false)}
        sessionData={changeExpertData}
        onSubmitRequest={(reason) => {
          if (currentEvent && currentEvent.id && changeExpertData) {
            const existingReqs = currentEvent.expertRequests || [];
            const updatedReqs = existingReqs.map(req =>
              req.id === changeExpertData.requestId ? {
                ...req,
                status: 'expert_change_requested',
                changeReason: reason
              } : req
            );
            updateEventDetails(currentEvent.id, {
              expertRequests: updatedReqs
            });
            showToast("Expert change requested successfully.", 5000);
            setIsChangeExpertOpen(false);
          }
        }}
      />
      {/* View Rejection Details Modal */}
      {viewRejectExpense && (
        <div className="modal-overlay" onClick={() => setViewRejectExpense(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Rejection Details</h2>
              <button className="close-btn" onClick={() => setViewRejectExpense(null)}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--text-light)', display: 'block', marginBottom: '0.25rem' }}>Reason for Rejection:</strong>
                <p style={{ margin: 0, color: 'var(--text-main)', background: 'var(--bg-light)', padding: '0.75rem', borderRadius: '4px' }}>
                  {viewRejectExpense.rejectReason || 'No reason provided.'}
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-light)', display: 'block', marginBottom: '0.25rem' }}>Rejected By:</strong>
                <p style={{ margin: 0, color: 'var(--text-main)' }}>Admin</p>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={() => setViewRejectExpense(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default EditWebinar;
