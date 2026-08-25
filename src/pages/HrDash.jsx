import { useState } from 'react';
import { Link } from 'react-router-dom';
import ApprovalModal from '../components/ApprovalModal';
import { useGlobal } from '../context/GlobalContext';

function HrDash() {
  const { addEvent, addComment, events } = useGlobal();
  const pageTitle = "Mindfulness Webinar-1";
  const currentEvent = events.find(ev => ev.sessionName === pageTitle);

  const [status, setStatus] = useState(currentEvent ? currentEvent.status.toLowerCase() : 'tentative');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  
  // Comments state
  const eventComments = currentEvent && currentEvent.comments ? currentEvent.comments : [];
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(5);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [newComment, setNewComment] = useState({ name: '', text: '' });

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
    expertExp: '',
    genderPref: '',
    budget: '',
    otherCosts: '',
    participantCount: ''
  });
  const [isLocked, setIsLocked] = useState(false);

  const [pageDate, setPageDate] = useState("2026-08-25");

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
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              {isLocked ? 'Update Details' : 'Request Session'}
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
              <h3 className="stats-value">{modalData.participantCount || '0'}</h3>
            </div>
            <button className="stats-action"><i className='bx bx-log-in-circle'></i></button>
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
        isHrRole={true}
        onSubmit={(data) => {
          addEvent({
            submittedOn: new Date().toISOString().split('T')[0],
            sessionName: pageTitle,
            clientName: 'MantraCare Internal',
            sessionDate: pageDate,
            sessionType: data.sessionType,
            location: data.sessionLocation || 'Online',
            expertExp: parseInt(data.expertExp) || 0,
            genderPref: data.genderPref,
            budget: 0,
            otherCosts: 0,
            requirements: 'Generated from HR Dash flow.',
            status: 'hr_requested',
            createdBy: 'HR-Rakesh'
          });
        }}
      />

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
                alert('Event not found. Cannot add comment.');
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
                    onChange={(e) => setNewComment({...newComment, name: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Comment <span className="text-red">*</span></label>
                  <textarea 
                    className="form-control" 
                    required
                    rows="4"
                    value={newComment.text}
                    onChange={(e) => setNewComment({...newComment, text: e.target.value})}
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
    </main>
  );
}

export default HrDash;
