export const PRIMARY_REASONS = [
  'Emotional / Mental Health',
  'Work Stress / Burnout',
  'Behavioural Change',
  'Performance Concern / Attendance',
  'Conflict / Relationship',
  'Substance Use',
  'Safety Concern',
  'Grief & Personal Loss',
  'Employee Requested',
  'Other'
];

export const URGENCY_LEVELS = [
  'Normal',
  'High',
  'Severe',
  'Emergency'
];

export const getUrgencyBadgeStyle = (level) => {
  const norm = (level || '').toLowerCase();
  if (norm.includes('emergency') || norm.includes('urgent') || norm.includes('sos') || norm.includes('critical')) {
    return { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };
  }
  if (norm.includes('severe')) {
    return { bg: '#ffedd5', color: '#c2410c', border: '#fdba74' };
  }
  if (norm.includes('high')) {
    return { bg: '#fef3c7', color: '#b45309', border: '#fcd34d' };
  }
  // Normal / Routine
  return { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
};
