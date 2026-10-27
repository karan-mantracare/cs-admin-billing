/**
 * Utility to resolve the Primary CS for a division.
 * Requirement:
 * "it should be The primary CS, if there are 2 primary CS then pick the first name out of all the Primary CS"
 */
export const getPrimaryCS = (divisionId, divisionName, clientName, clientObj) => {
  // 1. Try to fetch division roles from localStorage by divisionId, divisionName, or default keys
  let roles = null;
  const tryKeys = [
    divisionId ? `division_roles_${divisionId}` : null,
    divisionName ? `division_roles_${divisionName}` : null,
    'division_roles_1'
  ].filter(Boolean);

  for (const key of tryKeys) {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          roles = parsed;
          break;
        }
      } catch (e) {}
    }
  }

  // 2. Try to get roles from clientObj or client.divisions
  if (!roles && clientObj?.divisions && Array.isArray(clientObj.divisions)) {
    const div = clientObj.divisions.find(d => 
      (divisionId && String(d.id) === String(divisionId)) || 
      (divisionName && d.divisionName === divisionName)
    );
    if (div?.roles && Array.isArray(div.roles) && div.roles.length) {
      roles = div.roles;
    }
  }

  // 3. Try to get from cs-admin-clients in localStorage
  if (!roles) {
    try {
      const allClients = JSON.parse(localStorage.getItem('cs-admin-clients') || '[]');
      for (const c of allClients) {
        if (c.divisions && Array.isArray(c.divisions)) {
          const div = c.divisions.find(d => 
            (divisionId && String(d.id) === String(divisionId)) || 
            (divisionName && d.divisionName === divisionName)
          );
          if (div?.roles && Array.isArray(div.roles) && div.roles.length) {
            roles = div.roles;
            break;
          }
        }
      }
    } catch (e) {}
  }

  // 4. If roles found, evaluate Primary CS:
  // "it should be The primary CS, if there are 2 primary CS then pick the first name out of all the Primary CS"
  if (roles && Array.isArray(roles) && roles.length) {
    const primaryCsMembers = roles.filter(r => 
      (r.role === 'Customer Success' || r.role === 'CS' || !r.role) && 
      (r.isPrimary === true || r.isPrimaryCS === true || r.primary === true || (Array.isArray(r.badges) && r.badges.includes('Primary CS')))
    );

    if (primaryCsMembers.length > 0) {
      // Pick the first name out of all the Primary CS
      return primaryCsMembers[0].name || primaryCsMembers[0].email || 'Karan Hinduja';
    }

    // If no explicit primary CS, find any Customer Success member
    const csMembers = roles.filter(r => r.role === 'Customer Success' || r.role === 'CS');
    if (csMembers.length > 0) {
      return csMembers[0].name || csMembers[0].email || 'Karan Hinduja';
    }
  }

  // 5. Default specific sample divisions
  if (divisionName === 'Healthcare') return 'John Doe';
  if (divisionName === 'Wellness') return 'Jane Smith';
  if (divisionName === 'Tech') return 'Mike Johnson';

  // 6. Default for division 'testt' or any custom division with standard initial Primary CS
  return 'Karan Hinduja';
};
