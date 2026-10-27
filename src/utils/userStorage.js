/**
 * Utility to manage users, invitations, and division access.
 * Meets requirement:
 * "In the url if I am seinf ing ?user_id=(the user id)
 * fetch the data and access of that user.
 * user_id, Name, Email, Role, Division Access
 * if nothing is there, assume its Me Karan Hinduja - hinduja1988@gmail.com - Admin - All"
 */

export const DEFAULT_USER = {
  user_id: 'USR-001',
  name: 'Karan Hinduja',
  email: 'hinduja1988@gmail.com',
  role: 'Admin',
  divisionAccess: 'All',
  status: 'Active',
  isPrimary: true,
  invitedAt: '2026-01-01',
  notes: 'System Super Administrator with unrestricted workspace and financial access'
};

const INITIAL_USERS = [
  DEFAULT_USER,
  {
    user_id: 'USR-002',
    name: 'Priya Sharma',
    email: 'priya.hr@company.com',
    role: 'HR',
    divisionAccess: 'Healthcare',
    status: 'Pending',
    isPrimary: false,
    invitedAt: '2026-10-15',
    notes: 'HR Lead for Healthcare division webinar sign-offs'
  },
  {
    user_id: 'USR-003',
    name: 'Jane Smith',
    email: 'jane.smith@wellness.org',
    role: 'Customer Success',
    divisionAccess: 'Wellness',
    status: 'Active',
    isPrimary: true,
    invitedAt: '2026-09-10',
    notes: 'Primary CS Manager for Corporate Wellness clients'
  },
  {
    user_id: 'USR-004',
    name: 'Rahul Verma',
    email: 'rahul.bd@mantracare.com',
    role: 'Business Development',
    divisionAccess: 'All',
    status: 'Active',
    isPrimary: false,
    invitedAt: '2026-08-20',
    notes: 'BD Lead for corporate divisions and billing schedule setup'
  }
];

export const getAllUsers = () => {
  let stored = [];
  try {
    const raw = localStorage.getItem('mc_app_users');
    if (raw) {
      stored = JSON.parse(raw);
    }
  } catch {}

  if (!stored || stored.length === 0) {
    stored = [...INITIAL_USERS];
    try {
      localStorage.setItem('mc_app_users', JSON.stringify(stored));
    } catch {}
  }

  // Also collect and merge any invited or role users from division storage
  try {
    const allKeys = Object.keys(localStorage);
    allKeys.forEach((key) => {
      // 1. Division Invites
      if (key.startsWith('division_invites_')) {
        const divSuffix = key.replace('division_invites_', '');
        const invites = JSON.parse(localStorage.getItem(key) || '[]');
        if (Array.isArray(invites)) {
          invites.forEach((inv) => {
            if (inv.email && !stored.some((u) => u.email.toLowerCase() === inv.email.toLowerCase())) {
              stored.push({
                user_id: 'USR-INV-' + (inv.id ? String(inv.id).slice(-4) : Math.floor(Math.random() * 9000 + 1000)),
                name: inv.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
                email: inv.email,
                role: inv.role || 'HR',
                divisionAccess: isNaN(Number(divSuffix)) ? divSuffix : 'Healthcare',
                status: inv.status || 'Pending',
                invitedAt: inv.invitedAt || new Date().toISOString().split('T')[0],
                isPrimary: false
              });
            }
          });
        }
      }

      // 2. Division Roles
      if (key.startsWith('division_roles_')) {
        const divSuffix = key.replace('division_roles_', '');
        const roles = JSON.parse(localStorage.getItem(key) || '[]');
        if (Array.isArray(roles)) {
          roles.forEach((r) => {
            if (r.email && !stored.some((u) => u.email.toLowerCase() === r.email.toLowerCase())) {
              stored.push({
                user_id: 'USR-ROL-' + (r.id ? String(r.id).slice(-4) : Math.floor(Math.random() * 9000 + 1000)),
                name: r.name || r.email.split('@')[0],
                email: r.email,
                role: r.role || 'Customer Success',
                divisionAccess: isNaN(Number(divSuffix)) ? divSuffix : 'All',
                status: 'Active',
                invitedAt: new Date().toISOString().split('T')[0],
                isPrimary: Boolean(r.isPrimary)
              });
            }
          });
        }
      }
    });
  } catch {}

  return stored;
};

export const getUserById = (userId) => {
  if (!userId || String(userId).trim() === '') {
    return DEFAULT_USER;
  }

  const query = String(userId).trim().toLowerCase();
  const all = getAllUsers();

  const found = all.find(
    (u) =>
      String(u.user_id).toLowerCase() === query ||
      String(u.id).toLowerCase() === query ||
      u.email.toLowerCase() === query ||
      u.name.toLowerCase() === query
  );

  if (found) {
    return found;
  }

  // If not found in list, return default Karan Hinduja as specified by requirement
  return DEFAULT_USER;
};

export const saveUser = (user) => {
  const all = getAllUsers();
  const index = all.findIndex(
    (u) =>
      u.user_id === user.user_id ||
      (user.email && u.email.toLowerCase() === user.email.toLowerCase())
  );

  let updated;
  if (index >= 0) {
    updated = [...all];
    updated[index] = { ...updated[index], ...user };
  } else {
    updated = [
      {
        user_id: user.user_id || 'USR-' + Date.now().toString().slice(-4),
        status: user.status || 'Active',
        invitedAt: user.invitedAt || new Date().toISOString().split('T')[0],
        ...user
      },
      ...all
    ];
  }

  try {
    localStorage.setItem('mc_app_users', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch {}

  return updated;
};

export const deleteUser = (userId) => {
  const all = getAllUsers();
  const updated = all.filter((u) => u.user_id !== userId && u.email !== userId);
  try {
    localStorage.setItem('mc_app_users', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch {}
  return updated;
};
