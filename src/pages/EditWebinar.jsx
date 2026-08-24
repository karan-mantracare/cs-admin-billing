import { useState } from 'react';
import { Link } from 'react-router-dom';
import ApprovalModal from '../components/ApprovalModal';

function EditWebinar() {
  const [status, setStatus] = useState('tentative');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
            {(status === 'tentative' || status === 'complete') && (
              <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                {status === 'complete' ? 'Update Participant Count' : (isLocked ? 'Update Details' : 'Request Approval')}
              </button>
            )}
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
    </main>
  );
}

export default EditWebinar;
