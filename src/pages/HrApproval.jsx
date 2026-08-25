import { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import ApprovalModal from '../components/ApprovalModal';

function HrApproval() {
  const { events: allEvents, updateEventDetails } = useGlobal();
  const approvals = allEvents.filter(req => req.status === 'hr_requested');

  const [activeDetailsId, setActiveDetailsId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
  // State for the modal form
  const [modalData, setModalData] = useState({
    sessionType: '',
    sessionLocation: '',
    expertExp: '',
    genderPref: '',
    budget: '',
    otherCosts: '',
    participantCount: ''
  });

  const activeDetails = approvals.find(r => r.id === activeDetailsId);

  const openVerifyModal = (req) => {
    setActiveDetailsId(req.id);
    setIsLocked(false);
    setModalData({
      sessionType: req.sessionType || '',
      sessionLocation: req.location || '',
      expertExp: req.expertExp || '',
      genderPref: req.genderPref || '',
      budget: req.budget || '',
      otherCosts: req.otherCosts || '',
      participantCount: req.participantCount || ''
    });
    setIsModalOpen(true);
  };

  const handleVerifySubmit = (data) => {
    if (activeDetails) {
      updateEventDetails(activeDetails.id, {
        sessionType: data.sessionType,
        location: data.sessionLocation,
        expertExp: parseInt(data.expertExp) || 0,
        genderPref: data.genderPref,
        budget: parseFloat(data.budget) || 0,
        otherCosts: parseFloat(data.otherCosts) || 0,
        status: 'Pending'
      });
      setIsModalOpen(false);
      setActiveDetailsId(null);
    }
  };

  return (
    <main className="main-content">
      <div style={{ marginBottom: '2rem' }}>
        <h2>HR Approvals ({approvals.length})</h2>
        <p style={{ color: 'var(--text-muted)' }}>Verify HR requests and start the event approval process.</p>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>SUBMITTED ON</th>
              <th>SESSION NAME</th>
              <th>CLIENT</th>
              <th>SESSION DATE</th>
              <th>GENDER PREF</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {approvals.map((req) => (
              <tr key={req.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{req.submittedOn}</td>
                <td className="event-name">{req.sessionName}</td>
                <td>{req.clientName}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{req.sessionDate}</td>
                <td style={{ textTransform: 'capitalize' }}>{req.genderPref ? req.genderPref.replace('_', ' ') : '-'}</td>
                <td>
                  <span className="badge badge-warning" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--orange)', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '600' }}>
                    Pending Verification
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="icon-btn text-primary" title="Request Session (Send for Approval)" onClick={() => openVerifyModal(req)}>
                      <i className='bx bx-send'></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {approvals.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No pending HR requests</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reusing the Approval Modal */}
      {activeDetails && (
        <ApprovalModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setActiveDetailsId(null);
          }}
          pageTitle={activeDetails.sessionName}
          pageDate={activeDetails.sessionDate}
          modalData={modalData}
          setModalData={setModalData}
          isLocked={isLocked}
          setIsLocked={setIsLocked}
          status={activeDetails.status}
          isHrRole={false}
          onSubmit={handleVerifySubmit}
        />
      )}
    </main>
  );
}

export default HrApproval;
