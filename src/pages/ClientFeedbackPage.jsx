import React from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ClientFeedbackWizard from '../components/ClientFeedbackWizard';

function ClientFeedbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { initialData } = location.state || {};

  const queryCompany = searchParams.get('company');
  const queryCompanyId = searchParams.get('companyId') || searchParams.get('corporateId');
  const companyId = id || queryCompanyId || initialData?.corporateId || initialData?.id || '1';

  // 1. Prioritize direct lookup by submission/form ID in mc_cs_feedback_submissions
  let submissionEntry = null;
  try {
    const storedSubs = JSON.parse(localStorage.getItem('mc_cs_feedback_submissions') || '[]');
    if (Array.isArray(storedSubs)) {
      submissionEntry = storedSubs.find((s) => String(s.id).toLowerCase() === String(companyId).toLowerCase());
    }
  } catch {}

  let matchedClient = null;
  let resolvedCompany = submissionEntry?.clientDetails?.company || queryCompany || '';
  let defaultSpoc = submissionEntry?.clientDetails?.name || searchParams.get('hrName') || '';
  let defaultRole = submissionEntry?.clientDetails?.designation || submissionEntry?.clientDetails?.hrRole || searchParams.get('hrRole') || 'HR';
  let defaultDivision = submissionEntry?.clientDetails?.selectedDivision || searchParams.get('division') || '';
  let defaultCsSpoc = submissionEntry?.clientDetails?.csSpocName || searchParams.get('csSpoc') || '';

  // 2. If not a direct submission ID, check cs-admin-clients by ID or Company Name
  if (!matchedClient && !submissionEntry) {
    try {
      const stored = JSON.parse(localStorage.getItem('cs-admin-clients') || '[]');
      if (Array.isArray(stored)) {
        matchedClient = stored.find(
          (c) =>
            String(c.id) === String(companyId) ||
            String(c.corporateId) === String(companyId) ||
            String(c.companyId) === String(companyId) ||
            (queryCompany && (c.companyName || c.clientName || '').toLowerCase().trim() === queryCompany.toLowerCase().trim())
        );
      }
    } catch {}
  }

  if (matchedClient) {
    if (!resolvedCompany) {
      resolvedCompany = matchedClient.companyName || matchedClient.clientName || matchedClient.name || '';
    }
    if (!defaultSpoc) {
      defaultSpoc = matchedClient.keySpoc?.name || matchedClient.spocName || '';
    }
    if (!defaultDivision && Array.isArray(matchedClient.divisions) && matchedClient.divisions.length > 0) {
      const first = matchedClient.divisions[0];
      defaultDivision = typeof first === 'string' ? first : first.name || first.divisionName || '';
    }
  }

  // 3. Fallback lookup in feedback submissions by company name if still not resolved
  if (!resolvedCompany) {
    try {
      const storedSubs = JSON.parse(localStorage.getItem('mc_cs_feedback_submissions') || '[]');
      const matchSub = (Array.isArray(storedSubs) ? storedSubs : []).find(s => 
        (s.clientDetails?.company || '').toLowerCase().trim() === String(companyId).toLowerCase().trim() ||
        (queryCompany && (s.clientDetails?.company || '').toLowerCase().trim() === queryCompany.toLowerCase().trim())
      );
      if (matchSub?.clientDetails?.company) {
        resolvedCompany = matchSub.clientDetails.company;
        if (!defaultSpoc) defaultSpoc = matchSub.clientDetails.name || '';
        if (!defaultDivision) defaultDivision = matchSub.clientDetails.selectedDivision || '';
      }
    } catch {}
  }

  // 3. Fallback to initialData or cleaned ID (never overwrite explicit queryCompany with stored[0])
  if (!resolvedCompany) {
    resolvedCompany = initialData?.company || initialData?.companyName || '';
  }

  if (!resolvedCompany) {
    if (companyId && !String(companyId).startsWith('CORP-ALL') && String(companyId) !== '1') {
      resolvedCompany = String(companyId).startsWith('CORP-') ? String(companyId).replace('CORP-', '') : `Company #${companyId}`;
    } else {
      try {
        const stored = JSON.parse(localStorage.getItem('cs-admin-clients') || '[]');
        if (Array.isArray(stored) && stored.length > 0) {
          resolvedCompany = stored[0].companyName || stored[0].clientName || 'TechCorp Solutions';
        }
      } catch {}
    }
  }

  if (!resolvedCompany) {
    resolvedCompany = 'Corporate Partner';
  }

  const queryHrName = searchParams.get('hrName') || initialData?.hrName || initialData?.name || defaultSpoc || '';
  const queryHrEmail = searchParams.get('hrEmail') || initialData?.hrEmail || matchedClient?.keySpoc?.email || '';
  const queryHrRole = searchParams.get('hrRole') || initialData?.hrRole || initialData?.designation || defaultRole || matchedClient?.keySpoc?.designation || 'HR';
  const queryDivision = searchParams.get('division') || initialData?.division || defaultDivision || 'All Divisions';
  const queryCsSpoc = searchParams.get('csSpoc') || searchParams.get('csSpocName') || defaultCsSpoc || initialData?.csSpocName || matchedClient?.csSpoc || 'Karan Hinduja';

  const mergedData = {
    ...initialData,
    id: companyId,
    submissionId: submissionEntry?.id || companyId,
    corporateId: submissionEntry?.clientDetails?.corporateId || companyId,
    companyId: companyId,
    company: resolvedCompany,
    name: queryHrName,
    hrName: queryHrName,
    email: queryHrEmail,
    hrEmail: queryHrEmail,
    designation: queryHrRole,
    hrRole: queryHrRole,
    division: queryDivision,
    csSpocName: queryCsSpoc,
    status: submissionEntry?.status || 'Pending'
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#f1f5f9',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        overflowY: 'auto'
      }}
    >
      <ClientFeedbackWizard
        onClose={() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/cs/feedback');
          }
        }}
        initialData={mergedData}
      />
    </div>
  );
}

export default ClientFeedbackPage;
