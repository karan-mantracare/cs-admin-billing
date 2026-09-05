import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ClientOnboardingWizard from '../components/ClientOnboardingWizard';

function ClientOnboardingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { initialData } = location.state || {};
  
  const mergedData = { ...initialData, id: id || '1' };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#f1f5f9',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <ClientOnboardingWizard 
        onClose={() => navigate(-1)} 
        initialData={mergedData} 
      />
    </div>
  );
}

export default ClientOnboardingPage;
