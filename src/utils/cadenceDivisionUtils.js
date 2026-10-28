import { getPrimaryCS } from './roleUtils.js';

/**
 * Validates an email address.
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
  return re.test(email.trim());
}

/**
 * Retrieves all corporate divisions available in the system.
 */
export function getAllCorporateDivisions(clients = []) {
  const divisionMap = new Map();

  // Helper to construct a clean division-specific ID
  const makeDivId = (corpId, rawDivId, divName) => {
    if (rawDivId && String(rawDivId) !== String(corpId)) {
      return String(rawDivId);
    }
    // Check if EditDivision's standard ID div_${corpId} exists in localStorage
    if (corpId && localStorage.getItem(`onboardingFiled_div_${corpId}`)) {
      return `div_${corpId}`;
    }
    const cleanName = (divName || 'division').toLowerCase().replace(/[^a-z0-9]+/g, '_');
    return `div_${corpId}_${cleanName}`;
  };

  // 1. From clients in context
  (clients || []).forEach(corp => {
    const corpName = corp.name || corp.clientName || 'Corporate Client';
    const corpId = String(corp.id || '1');

    // Corporate explicit divisions array
    if (corp.divisions && Array.isArray(corp.divisions)) {
      corp.divisions.forEach(d => {
        const divName = d.divisionName || d.name;
        if (divName) {
          const divId = makeDivId(corpId, d.id, divName);
          const key = `${corpName}__${divName}`;
          if (!divisionMap.has(key)) {
            divisionMap.set(key, {
              id: divId,
              divisionId: divId,
              divisionName: divName,
              corporateName: corpName,
              corporateId: corpId,
              clientEmail: d.clientEmail || '',
              clientName: d.clientName || '',
              keySpoc: d.keySpoc || null,
              onboarding: d.onboarding || d.onboardingRecord || null,
              label: `${corpName} — ${divName}`
            });
          }
        }
      });
    }

    // Corporate primary division if named
    if (corp.divisionName) {
      const divName = corp.divisionName;
      const key = `${corpName}__${divName}`;
      if (!divisionMap.has(key)) {
        let matchedDivId = null;
        if (corp.divisions && Array.isArray(corp.divisions)) {
          const found = corp.divisions.find(d => (d.divisionName || d.name) === divName);
          if (found?.id) matchedDivId = found.id;
        }
        if (!matchedDivId && corpId && localStorage.getItem(`onboardingFiled_div_${corpId}`)) {
          matchedDivId = `div_${corpId}`;
        }
        const divId = makeDivId(corpId, matchedDivId || corp.divisionId, divName);
        divisionMap.set(key, {
          id: divId,
          divisionId: divId,
          divisionName: divName,
          corporateName: corpName,
          corporateId: corpId,
          clientEmail: '',
          clientName: '',
          keySpoc: null,
          onboarding: null, // Strictly division's own onboarding; never company onboarding
          label: `${corpName} — ${divName}`
        });
      }
    }
  });

  // 2. From localStorage cs-admin-clients
  try {
    const saved = JSON.parse(localStorage.getItem('cs-admin-clients') || '[]');
    saved.forEach(corp => {
      const corpName = corp.name || corp.clientName || 'Corporate Client';
      const corpId = String(corp.id || '1');

      if (corp.divisions && Array.isArray(corp.divisions)) {
        corp.divisions.forEach(d => {
          const divName = d.divisionName || d.name;
          if (divName) {
            const divId = makeDivId(corpId, d.id, divName);
            const key = `${corpName}__${divName}`;
            if (!divisionMap.has(key)) {
              divisionMap.set(key, {
                id: divId,
                divisionId: divId,
                divisionName: divName,
                corporateName: corpName,
                corporateId: corpId,
                clientEmail: d.clientEmail || '',
                clientName: d.clientName || '',
                keySpoc: d.keySpoc || null,
                onboarding: d.onboarding || d.onboardingRecord || null,
                label: `${corpName} — ${divName}`
              });
            }
          }
        });
      }

      if (corp.divisionName) {
        const divName = corp.divisionName;
        const key = `${corpName}__${divName}`;
        if (!divisionMap.has(key)) {
          let matchedDivId = null;
          if (corp.divisions && Array.isArray(corp.divisions)) {
            const found = corp.divisions.find(d => (d.divisionName || d.name) === divName);
            if (found?.id) matchedDivId = found.id;
          }
          if (!matchedDivId && corpId && localStorage.getItem(`onboardingFiled_div_${corpId}`)) {
            matchedDivId = `div_${corpId}`;
          }
          const divId = makeDivId(corpId, matchedDivId || corp.divisionId, divName);
          divisionMap.set(key, {
            id: divId,
            divisionId: divId,
            divisionName: divName,
            corporateName: corpName,
            corporateId: corpId,
            clientEmail: '',
            clientName: '',
            keySpoc: null,
            onboarding: null, // Strictly division's own onboarding; never company onboarding
            label: `${corpName} — ${divName}`
          });
        }
      }
    });
  } catch {}

  // 3. From division_orders in localStorage
  try {
    const orders = JSON.parse(localStorage.getItem('division_orders') || '[]');
    orders.forEach(o => {
      const corpName = o.corporate || o.clientName || 'Corporate Client';
      const divName = o.division || o.divisionName;
      if (divName) {
        const key = `${corpName}__${divName}`;
        if (!divisionMap.has(key)) {
          const divId = o.divisionId ? String(o.divisionId) : makeDivId('order', null, divName);
          divisionMap.set(key, {
            id: divId,
            divisionId: divId,
            divisionName: divName,
            corporateName: corpName,
            corporateId: o.corporateId ? String(o.corporateId) : '',
            clientEmail: o.clientEmail || '',
            clientName: o.clientName || '',
            onboarding: o.onboarding || null,
            label: `${corpName} — ${divName}`
          });
        }
      }
    });
  } catch {}

  // 4. Default Seed Divisions if no corporate divisions found
  if (divisionMap.size === 0) {
    divisionMap.set('TechVision Global Inc.__testt', {
      id: 'div_tv_testt',
      divisionId: 'div_tv_testt',
      divisionName: 'testt',
      corporateName: 'TechVision Global Inc.',
      corporateId: '1',
      clientEmail: '',
      clientName: '',
      label: 'TechVision Global Inc. — testt'
    });
    divisionMap.set('Apex Health Corp__Corp 2 Div 1', {
      id: 'div_ah_corp2div1',
      divisionId: 'div_ah_corp2div1',
      divisionName: 'Corp 2 Div 1',
      corporateName: 'Apex Health Corp',
      corporateId: '2',
      clientEmail: '',
      clientName: '',
      label: 'Apex Health Corp — Corp 2 Div 1'
    });
  }

  return Array.from(divisionMap.values());
}

/**
 * Loads the onboarding record specifically for the selected DIVISION.
 * Requirement:
 * "Since the division is selected, it should refer to the Onboarding form of the Division and not the Company"
 */
export function getDivisionOnboardingDetails(division) {
  if (!division) {
    return {
      spocs: [],
      primaryCS: null,
      onboardingRecord: null,
      hasMissingData: true,
      hasOnboardingForm: false,
      missingReason: 'No division selected.'
    };
  }

  const divId = String(division.divisionId || division.id || '');
  const divName = division.divisionName || '';
  const corpName = division.corporateName || division.clientName || '';
  const corpId = String(division.corporateId || '');

  // 1. Locate Onboarding Record SPECIFIC to this Division (NEVER fallback to Company-level)
  let onboardingRecord = null;
  let onboardingSource = null;

  // Direct properties on division object
  if (division.onboarding && (division.onboarding.keySpoc || division.onboarding.spocs || division.onboarding.escalationSpocs)) {
    onboardingRecord = division.onboarding;
    onboardingSource = 'division_object';
  } else if (division.onboardingRecord && (division.onboardingRecord.keySpoc || division.onboardingRecord.spocs)) {
    onboardingRecord = division.onboardingRecord;
    onboardingSource = 'division_object';
  } else if (division.filedData && (division.filedData.keySpoc || division.filedData.spocs)) {
    onboardingRecord = division.filedData;
    onboardingSource = 'division_object';
  }

  // Check division-scoped keys in localStorage (strictly excluding company-level generic keys)
  if (!onboardingRecord) {
    const candidateKeys = [
      divId ? `onboardingFiled_${divId}` : null,
      divId && !divId.startsWith('div_') ? `onboardingFiled_div_${divId}` : null,
      corpId ? `onboardingFiled_div_${corpId}` : null,
      (corpId && divName) ? `onboardingFiled_${corpId}_${divName}` : null,
      (corpId && divName) ? `onboardingFiled_div_${corpId}_${divName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}` : null,
      (corpName && divName) ? `onboardingFiled_${corpName}_${divName}` : null,
      (divName && divName !== corpName && divName !== 'Corporate Client') ? `onboardingFiled_${divName}` : null
    ].filter(Boolean);

    for (const key of candidateKeys) {
      if (key === 'onboardingFiled_1') continue;
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && (parsed.keySpoc || parsed.spocs || parsed.billingSpocs || parsed.escalationSpocs)) {
            onboardingRecord = parsed;
            onboardingSource = key;
            break;
          }
        } catch {}
      }
    }
  }

  // Also check division_orders in localStorage
  if (!onboardingRecord) {
    try {
      const orders = JSON.parse(localStorage.getItem('division_orders') || '[]');
      const matchedOrder = orders.find(o => 
        (divId && String(o.divisionId) === String(divId)) || 
        (corpId && String(o.corporateId) === String(corpId)) ||
        (divName && (o.division === divName || o.divisionName === divName))
      );
      if (matchedOrder?.onboarding && (matchedOrder.onboarding.keySpoc || matchedOrder.onboarding.spocs)) {
        onboardingRecord = matchedOrder.onboarding;
        onboardingSource = 'division_order';
      }
    } catch {}
  }

  // Exhaustive search through all keys in localStorage starting with onboardingFiled_
  if (!onboardingRecord) {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith('onboardingFiled_') || k === 'onboardingFiled_1') continue;

        const raw = localStorage.getItem(k);
        if (!raw) continue;
        let parsed = null;
        try {
          parsed = JSON.parse(raw);
        } catch {}
        if (!parsed || (!parsed.keySpoc && !parsed.spocs && !parsed.escalationSpocs)) continue;

        const cleanDivName = divName ? divName.toLowerCase().replace(/[^a-z0-9]+/g, '') : '';
        const cleanK = k.toLowerCase().replace(/[^a-z0-9]+/g, '');

        const matchesDivId = divId && k.includes(divId);
        const matchesCorpId = corpId && corpId !== '1' && k.includes(corpId);
        const matchesDivName = cleanDivName && cleanK.includes(cleanDivName);

        if (matchesDivId || matchesCorpId || matchesDivName) {
          onboardingRecord = parsed;
          onboardingSource = k;
          break;
        }
      }
    } catch {}
  }

  // Extract all available SPOC contacts from the division's onboarding record
  const spocs = [];
  const seenSpocEmails = new Set();

  if (onboardingRecord) {
    // 1. Key SPOC from Division Onboarding Form
    if (onboardingRecord.keySpoc && onboardingRecord.keySpoc.email) {
      const email = onboardingRecord.keySpoc.email.trim();
      const normEmail = email.toLowerCase();
      if (isValidEmail(email) && !seenSpocEmails.has(normEmail)) {
        seenSpocEmails.add(normEmail);
        spocs.push({
          id: 'spoc_div_key',
          name: onboardingRecord.keySpoc.name?.trim() || `${divName} Key SPOC`,
          email: email,
          role: 'Key SPOC (Division Onboarding)',
          phone: onboardingRecord.keySpoc.contact || '',
          source: 'Division Onboarding'
        });
      }
    }

    // 2. Escalation SPOCs from Division Onboarding Form
    if (Array.isArray(onboardingRecord.escalationSpocs)) {
      onboardingRecord.escalationSpocs.forEach((spoc, idx) => {
        if (spoc && spoc.email) {
          const email = spoc.email.trim();
          const normEmail = email.toLowerCase();
          if (isValidEmail(email) && !seenSpocEmails.has(normEmail)) {
            seenSpocEmails.add(normEmail);
            spocs.push({
              id: `spoc_div_esc_${spoc.id || idx}`,
              name: spoc.name?.trim() || spoc.designation || 'Escalation SPOC',
              email: email,
              role: `${spoc.designation || 'Escalation SPOC'} (Division Onboarding)`,
              phone: spoc.contact || '',
              source: 'Division Onboarding'
            });
          }
        }
      });
    }

    // 3. Billing SPOCs from Division Onboarding Form
    if (Array.isArray(onboardingRecord.billingSpocs)) {
      onboardingRecord.billingSpocs.forEach((spoc, idx) => {
        if (spoc && spoc.email) {
          const email = spoc.email.trim();
          const normEmail = email.toLowerCase();
          if (isValidEmail(email) && !seenSpocEmails.has(normEmail)) {
            seenSpocEmails.add(normEmail);
            spocs.push({
              id: `spoc_div_bill_${spoc.id || idx}`,
              name: spoc.name?.trim() || 'Billing SPOC',
              email: email,
              role: `${spoc.department || 'Billing SPOC'} (Division Onboarding)`,
              phone: spoc.contact || '',
              source: 'Division Onboarding'
            });
          }
        }
      });
    }

    // 4. Any explicit spocs array on Division Onboarding Form
    if (Array.isArray(onboardingRecord.spocs)) {
      onboardingRecord.spocs.forEach((spoc, idx) => {
        if (spoc && spoc.email) {
          const email = spoc.email.trim();
          const normEmail = email.toLowerCase();
          if (isValidEmail(email) && !seenSpocEmails.has(normEmail)) {
            seenSpocEmails.add(normEmail);
            spocs.push({
              id: `spoc_div_gen_${spoc.id || idx}`,
              name: spoc.name?.trim() || 'SPOC Contact',
              email: email,
              role: `${spoc.role || 'SPOC Contact'} (Division Onboarding)`,
              phone: spoc.phone || spoc.contact || '',
              source: 'Division Onboarding'
            });
          }
        }
      });
    }
  }

  // If division has not filled its formal onboarding form, check if division record itself has a contact
  const hasOnboardingForm = Boolean(onboardingRecord);
  if (!hasOnboardingForm) {
    if (division.clientEmail && isValidEmail(division.clientEmail)) {
      const norm = division.clientEmail.trim().toLowerCase();
      if (!seenSpocEmails.has(norm)) {
        seenSpocEmails.add(norm);
        spocs.push({
          id: 'spoc_div_record',
          name: division.clientName || `${divName} Contact`,
          email: division.clientEmail.trim(),
          role: 'Division Contact (Onboarding Form Pending)',
          phone: '',
          source: 'Division Record'
        });
      }
    } else if (division.keySpoc?.email && isValidEmail(division.keySpoc.email)) {
      const norm = division.keySpoc.email.trim().toLowerCase();
      if (!seenSpocEmails.has(norm)) {
        seenSpocEmails.add(norm);
        spocs.push({
          id: 'spoc_div_key_prop',
          name: division.keySpoc.name || `${divName} SPOC`,
          email: division.keySpoc.email.trim(),
          role: 'Division SPOC (Onboarding Form Pending)',
          phone: division.keySpoc.contact || '',
          source: 'Division Record'
        });
      }
    }
  }

  // Resolve Primary CS specifically for this division
  const csName = getPrimaryCS(divId, divName, corpName);

  // Locate CS email in division_roles or default
  let csEmail = 'cs-lead@mantracare.com';
  const roleKeys = [
    divId ? `division_roles_${divId}` : null,
    divName ? `division_roles_${divName}` : null
  ].filter(Boolean);

  for (const rk of roleKeys) {
    const rawRoles = localStorage.getItem(rk);
    if (rawRoles) {
      try {
        const parsed = JSON.parse(rawRoles);
        if (Array.isArray(parsed)) {
          const matched = parsed.find(r => r.name === csName || r.isPrimary || r.primary);
          if (matched?.email && isValidEmail(matched.email)) {
            csEmail = matched.email.trim();
            break;
          }
        }
      } catch {}
    }
  }

  const primaryCS = {
    name: csName,
    email: csEmail
  };

  const hasMissingData = !hasOnboardingForm || spocs.length === 0 || !primaryCS.email;
  const missingReason = !hasOnboardingForm
    ? `Onboarding form has not been filed yet for division "${divName}". (Referring to the Division's Onboarding form, not the Company).`
    : (spocs.length === 0 ? `No SPOC contacts found in the onboarding form for division "${divName}".` : null);

  return {
    divisionId: divId,
    divisionName: divName,
    corporateName: corpName,
    spocs,
    primaryCS,
    onboardingRecord,
    hasOnboardingForm,
    isDivisionOnboardingFilled: hasOnboardingForm,
    onboardingSource,
    hasMissingData,
    missingReason,
    onboardingUrl: `/client-onboarding/${onboardingSource ? onboardingSource.replace('onboardingFiled_', '') : (divId || ('div_' + (corpId || 'c') + '_' + (divName.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'default')))}`,
    divisionEditUrl: `/corporate/division/edit?id=${onboardingSource ? onboardingSource.replace('onboardingFiled_', '') : (divId || 'default')}`
  };
}

/**
 * Gets the current authenticated scheduling CS user.
 */
export function getAuthenticatedSchedulingUser() {
  try {
    const raw = localStorage.getItem('currentUser');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.email || parsed.name)) {
        return {
          name: parsed.name || 'Karan Hinduja',
          email: parsed.email || 'cs-lead@mantracare.com',
          role: parsed.role || 'CS Lead'
        };
      }
    }
  } catch {}

  return {
    name: 'Karan Hinduja',
    email: 'cs-lead@mantracare.com',
    role: 'CS Lead (Scheduling CS)'
  };
}

/**
 * Assembles and deduplicates the list of attendees.
/**
 * Assembles and deduplicates the list of attendees.
 * Displays each attendee with their role chip: SPOC, Scheduling CS, Primary CS, Client Team, Guest.
 */
export function buildAttendeeList({ 
  selectedSpocs = [], 
  primaryCS, 
  schedulingUser,
  customAttendees = [],
  excludedEmails = []
}) {
  const attendeeMap = new Map();
  const excludedSet = new Set((excludedEmails || []).map(e => String(e).trim().toLowerCase()));

  // Helper to add/merge attendee
  const addAttendee = (email, name, roleType, isRequired = false, isRemovable = true, metadata = {}) => {
    if (!email) return;
    const cleanEmail = email.trim();
    const normKey = cleanEmail.toLowerCase();
    if (!isValidEmail(cleanEmail) || excludedSet.has(normKey)) return;

    if (attendeeMap.has(normKey)) {
      // Merge roles if duplicate
      const existing = attendeeMap.get(normKey);
      if (!existing.roles.includes(roleType)) {
        existing.roles.push(roleType);
      }
      if (name && (!existing.name || existing.name === cleanEmail)) {
        existing.name = name;
      }
      if (isRequired) existing.isRequired = true;
    } else {
      attendeeMap.set(normKey, {
        id: metadata.id || `att_${normKey}`,
        email: cleanEmail,
        name: name || cleanEmail,
        roles: [roleType],
        isRequired,
        isRemovable,
        source: metadata.source || 'System'
      });
    }
  };

  // 1. Add selected SPOCs
  (selectedSpocs || []).forEach(spoc => {
    addAttendee(spoc.email, spoc.name, 'SPOC', true, true, { id: spoc.id, source: spoc.source || 'Division Onboarding' });
  });

  // 2. Add Authenticated Scheduling CS User
  if (schedulingUser?.email) {
    addAttendee(schedulingUser.email, schedulingUser.name || 'Scheduling CS', 'Scheduling CS', false, true, { id: 'att_sched_cs', source: 'Scheduling CS' });
  }

  // 3. Add Division Primary CS (if different from Scheduling CS)
  if (primaryCS?.email) {
    addAttendee(primaryCS.email, primaryCS.name || 'Primary CS', 'Primary CS', false, true, { id: 'att_primary_cs', source: 'Primary CS' });
  }

  // 4. Add Custom Added Attendees
  (customAttendees || []).forEach(ca => {
    addAttendee(ca.email, ca.name, ca.role || 'Guest', ca.role === 'SPOC', true, { id: ca.id, source: ca.source || 'Custom Added' });
  });

  return Array.from(attendeeMap.values());
}
