export const STANDARD_RATING_OPTIONS = [
  { label: 'Very satisfied', value: 'Very satisfied', color: '#166534', bg: '#dcfce7', icon: 'bx-smile' },
  { label: 'Satisfied', value: 'Satisfied', color: '#0369a1', bg: '#e0f2fe', icon: 'bx-happy' },
  { label: 'Neutral', value: 'Neutral', color: '#854d0e', bg: '#fef3c7', icon: 'bx-meh' },
  { label: 'Dissatisfied', value: 'Dissatisfied', color: '#c2410c', bg: '#ffedd5', icon: 'bx-sad' },
  { label: 'Very dissatisfied', value: 'Very dissatisfied', color: '#991b1b', bg: '#fee2e2', icon: 'bx-angry' }
];

export const NOT_APPLICABLE_OPTION = {
  label: 'Not a part of SOW / No session done',
  value: 'Not a part of SOW / No session done',
  color: '#475569',
  bg: '#f1f5f9',
  icon: 'bx-minus-circle'
};

export const PILLAR_QUESTIONS = [
  {
    id: 'onboardingDelivery',
    pillarGroup: 'Onboarding',
    title: 'Onboarding & Delivery: *',
    questionText: 'How well was the program implemented against the agreed scope and timelines?',
    description: 'How well was the program implemented against the agreed scope and timelines?',
    shortLabel: 'Onboarding & Delivery',
    category: 'Onboarding & delivery',
    icon: 'bx-rocket',
    allowNotApplicable: true,
    lowRatingTags: [
      'Scope or services differed from what was agreed',
      'Delayed onboarding or kickoff',
      'Promised services or deliverables were missing',
      'Billing or pricing communication was unclear'
    ],
    scoreGuidance: '5 = Fully met/exceeded; 4 = Met with minor gaps; 3 = Partially met; 2 = Major gaps; 1 = Not delivered / materially off-scope; N/A = excluded.',
    goodGuidance: 'Rating 4–5, with scope, timelines and deliverables substantially met.',
    urgentGuidance: 'Rating 1, or a critical contractual/service gap that blocks launch or delivery.',
    escalationRequired: 'Escalate rating 1 to the program owner and account lead immediately; rating 2 to the owner for a dated corrective action plan.',
    priorityGuidance: 'High priority if launch, contractual scope, compliance or material delivery is affected.'
  },
  {
    id: 'csSupport',
    pillarGroup: 'CS',
    title: 'CS Support & Responsiveness: *',
    questionText: "How satisfied are you with the CS team's responsiveness, communication and proactive support?",
    description: "How satisfied are you with the CS team's responsiveness, communication and proactive support?",
    shortLabel: 'CS Support',
    category: 'CS support',
    icon: 'bx-user-voice',
    allowNotApplicable: true,
    lowRatingTags: [
      'Slow response to emails or queries',
      'Lack of proactive follow-ups',
      'Escalations remained unresolved',
      'Infrequent status updates or review meetings'
    ],
    scoreGuidance: '5 = Consistently proactive and responsive; 4 = Responsive with minor delays; 3 = Adequate/inconsistent; 2 = Slow or reactive; 1 = Unresponsive / unresolved critical concerns; N/A = excluded.',
    goodGuidance: 'Rating 4–5 and no unresolved high-impact concern.',
    urgentGuidance: 'Rating 1, or a critical client concern remains unanswered beyond the agreed SLA.',
    escalationRequired: 'Rating 1: immediate account-lead review. Rating 2: CS manager review and documented recovery action.',
    priorityGuidance: 'Escalate repeated missed commitments, unresolved complaints or risk to client relationship.'
  },
  {
    id: 'employeeAwareness',
    pillarGroup: 'Awareness',
    title: 'Employee Awareness & Access: *',
    questionText: 'How effectively are employees informed about and able to access the services?',
    description: 'How effectively are employees informed about and able to access the services?',
    shortLabel: 'Employee Awareness & Access',
    category: 'Employee awareness & access',
    icon: 'bx-group',
    allowNotApplicable: true,
    lowRatingTags: [
      'Limited employee awareness of services',
      'Insufficient communication or promotional material',
      'Employees unclear about how to access services',
      'Low participation despite communication'
    ],
    scoreGuidance: '5 = Employees clearly informed and access easily; 4 = Good awareness with minor gaps; 3 = Mixed awareness/access; 2 = Significant access or awareness gaps; 1 = Most employees cannot understand/access services; N/A = excluded.',
    goodGuidance: 'Rating 4–5 and no widespread access barrier.',
    urgentGuidance: 'Rating 1, or a widespread access barrier prevents employees from using the service.',
    escalationRequired: 'Escalate systemic access issues to operations/product; agree communication or access fix and owner.',
    priorityGuidance: 'Urgent when access failure affects a large employee group or prevents service utilization.'
  },
  {
    id: 'hotlineSupport',
    pillarGroup: 'Hotline',
    title: 'Hotline Support: *',
    questionText: 'How would you rate the accessibility and responsiveness of the employee support hotline?',
    description: 'How would you rate the accessibility and responsiveness of the employee support hotline?',
    shortLabel: 'Hotline Support',
    category: 'Hotline support',
    icon: 'bx-phone-call',
    allowNotApplicable: true,
    lowRatingTags: [
      'Long wait time before calls were answered',
      'Frequent dropped or disconnected calls',
      'Hotline availability was limited',
      'Delays during peak hours'
    ],
    scoreGuidance: '5 = Easily reachable and timely; 4 = Minor delays; 3 = Sometimes difficult to reach; 2 = Frequent delays/dropped calls; 1 = Unavailable or consistently failing; N/A = excluded.',
    goodGuidance: 'Rating 4–5 with reliable availability and response.',
    urgentGuidance: 'Rating 1, or hotline outage / repeated inability to reach support.',
    escalationRequired: 'Notify service operations immediately for outage or repeated call failures; provide workaround and restoration ETA.',
    priorityGuidance: 'Treat prolonged outage or inability to reach urgent support as critical.'
  },
  {
    id: 'appExperience',
    pillarGroup: 'Tech',
    title: 'App Experience & Usability: *',
    questionText: 'How easy is the app for employees to access, navigate and use?',
    description: 'How easy is the app for employees to access, navigate and use?',
    shortLabel: 'App Experience',
    category: 'App experience',
    icon: 'bx-mobile',
    allowNotApplicable: true,
    lowRatingTags: [
      'Login or OTP verification issues',
      'App performance or slow loading',
      'Navigation was confusing',
      'Features were difficult to use'
    ],
    scoreGuidance: '5 = Seamless and intuitive; 4 = Easy with minor friction; 3 = Usable but some friction; 2 = Frequent usability issues; 1 = App unusable for core tasks; N/A = excluded.',
    goodGuidance: 'Rating 4–5 and no material barrier to core user journeys.',
    urgentGuidance: 'Rating 1, or a widespread app failure blocks sign-in or core service access.',
    escalationRequired: 'Route technical defects to product/engineering; communicate workaround, owner and target fix date.',
    priorityGuidance: 'Escalate widespread or recurring defects, especially those affecting service access.'
  },
  {
    id: 'technicalSupport',
    pillarGroup: 'Tech',
    title: 'Technical Support & Resolution: *',
    questionText: 'How effectively are app, login or access-related technical issues resolved?',
    description: 'How effectively are app, login or access-related technical issues resolved?',
    shortLabel: 'Technical Support',
    category: 'Technical support',
    icon: 'bx-wrench',
    allowNotApplicable: true,
    lowRatingTags: [
      'Delayed resolution of technical issues',
      'Login or access issues remained unresolved',
      'Unclear troubleshooting instructions',
      'Recurring technical issues'
    ],
    scoreGuidance: '5 = Resolved quickly and permanently; 4 = Resolved with minor delay; 3 = Resolved but inconsistently; 2 = Slow / recurring unresolved issues; 1 = Critical issue unresolved or no support; N/A = excluded.',
    goodGuidance: 'Rating 4–5 and no recurring unresolved technical issue.',
    urgentGuidance: 'Rating 1, security/privacy concern, or an outage preventing access for multiple users.',
    escalationRequired: 'Immediately route security/privacy incidents through the designated incident process; other critical failures to technical lead.',
    priorityGuidance: 'Security/privacy concerns and broad outages require immediate escalation irrespective of average score.'
  },
  {
    id: 'serviceExperience',
    pillarGroup: 'Service',
    title: 'Service Experience & Quality: *',
    questionText: 'Based on employee feedback, how would you rate the quality and relevance of the services?',
    description: 'Based on employee feedback, how would you rate the quality and relevance of the services?',
    shortLabel: 'Service Experience',
    category: 'Service experience',
    icon: 'bx-badge-check',
    allowNotApplicable: true,
    lowRatingTags: [
      'Services did not meet employee expectations',
      'Quality of services was inconsistent',
      'Limited service options or accessibility',
      'Mixed employee feedback'
    ],
    scoreGuidance: '5 = Consistently high-quality and relevant; 4 = Good quality/relevance; 3 = Mixed; 2 = Often below expectations; 1 = Consistently poor / unsuitable; N/A = excluded.',
    goodGuidance: 'Rating 4–5 and feedback indicates services meet employee needs.',
    urgentGuidance: 'Rating 1, or credible report of unsafe, inappropriate or materially poor service.',
    escalationRequired: 'Escalate quality/suitability concerns to service owner; follow safeguarding or incident protocol for safety-related reports.',
    priorityGuidance: 'Safety, professional-conduct or safeguarding concerns are critical regardless of rating.'
  },
  {
    id: 'utilizationReporting',
    pillarGroup: 'Reporting',
    title: 'Utilization & Reporting Insights: *',
    questionText: 'Are utilization reports and insights timely, clear and useful?',
    description: 'Are utilization reports and insights timely, clear and useful?',
    shortLabel: 'Utilization & Reporting',
    category: 'Utilization & reporting',
    icon: 'bx-bar-chart-alt-2',
    allowNotApplicable: true,
    lowRatingTags: [
      'Reports were delayed or incomplete',
      'Data or metrics were unclear',
      'Reports lacked actionable insights',
      'Limited service-wise or department-wise analysis'
    ],
    scoreGuidance: '5 = Timely, accurate and actionable; 4 = Clear and timely with minor gaps; 3 = Adequate but limited insight; 2 = Delayed/incomplete or unclear; 1 = Materially inaccurate/missing reporting; N/A = excluded.',
    goodGuidance: 'Rating 4–5 and reporting is accurate, timely and useful.',
    urgentGuidance: 'Rating 1, material data discrepancy, or repeated missed reporting deadline affecting decisions.',
    escalationRequired: 'Escalate data integrity issues to reporting owner; validate source data and issue corrected report with timeline.',
    priorityGuidance: 'Escalate suspected privacy breach or material data integrity issue immediately.'
  },
  {
    id: 'oneOnOneSessions',
    pillarGroup: '1-on-1',
    title: '1-on-1 Individual Sessions: *',
    questionText: 'Were individual sessions timely, useful, confidential and delivered by suitable experts?',
    description: 'Were individual sessions timely, useful, confidential and delivered by suitable experts?',
    shortLabel: '1-on-1 Individual Sessions',
    category: '1-on-1 individual sessions',
    icon: 'bx-user-pin',
    allowNotApplicable: true,
    lowRatingTags: [
      'Limited expert slot availability',
      'Experts rescheduled or cancelled sessions',
      'Consultation quality was inconsistent',
      'Mixed employee feedback'
    ],
    scoreGuidance: '5 = Timely, useful, confidential and well-matched; 4 = Good with minor scheduling gaps; 3 = Mixed experience; 2 = Frequent delays/cancellations or quality concerns; 1 = Serious service failure / confidentiality concern; N/A = excluded.',
    goodGuidance: 'Rating 4–5 and no confidentiality, suitability or repeated scheduling concern.',
    urgentGuidance: 'Rating 1, confidentiality breach, safeguarding concern, or report of immediate risk to an individual.',
    escalationRequired: 'Route confidentiality/safeguarding concerns through the authorized clinical/privacy escalation pathway immediately; do not put sensitive case details in this HR score sheet.',
    priorityGuidance: 'Clinical safety, confidentiality and safeguarding concerns override numeric score and require restricted handling.'
  },
  {
    id: 'webinarTopicsVariety',
    pillarGroup: 'Webinars',
    title: 'Webinar Topics & Variety: *',
    questionText: 'Were webinar topics relevant to employees and varied enough?',
    description: 'Were webinar topics relevant to employees and varied enough?',
    shortLabel: 'Webinar Topics & Variety',
    category: 'Webinar topics & variety',
    icon: 'bx-slideshow',
    allowNotApplicable: true,
    lowRatingTags: [
      'Topics were too generic or repetitive',
      'Topics did not resonate with workforce needs',
      'More specialized wellness themes were needed',
      'Too few topics to choose from'
    ],
    scoreGuidance: '5 = Highly relevant and varied; 4 = Relevant with good variety; 3 = Some topics resonate; 2 = Often generic/repetitive; 1 = Consistently irrelevant; N/A = excluded.',
    goodGuidance: 'Rating 4–5 and topics align with employee needs.',
    urgentGuidance: 'Normally not urgent on its own; urgent only if content is unsafe, discriminatory or materially inappropriate.',
    escalationRequired: 'Use ratings 1–2 to refresh the topic calendar and validate needs with HR; escalate inappropriate content to program owner.',
    priorityGuidance: 'Usually improvement priority, not urgent, unless there is a content safety or conduct concern.'
  },
  {
    id: 'issueResolution',
    pillarGroup: 'Resolution',
    title: 'Issue & Escalation Resolution: *',
    questionText: 'How effectively are queries and escalations resolved?',
    description: 'How effectively are queries and escalations resolved?',
    shortLabel: 'Issue Resolution',
    category: 'Issue resolution',
    icon: 'bx-check-shield',
    allowNotApplicable: true,
    lowRatingTags: [
      'Delayed query or ticket resolution',
      'Unclear ownership of issues',
      'Lack of regular resolution updates',
      'Repeated issues without corrective action'
    ],
    scoreGuidance: '5 = Resolved within SLA with clear ownership; 4 = Resolved with minor delay; 3 = Resolved but inconsistent; 2 = Delayed / unclear ownership; 1 = Critical issue unresolved or repeated failure; N/A = excluded.',
    goodGuidance: 'Rating 4–5 and no overdue high-impact issue.',
    urgentGuidance: 'Rating 1, unresolved high-impact issue beyond SLA, or repeat failure affecting employees/client operations.',
    escalationRequired: 'Rating 1: immediate escalation to accountable service owner and account lead. Rating 2: corrective action with owner and due date.',
    priorityGuidance: 'Escalate repeat incidents, overdue critical tickets and issues with material employee impact.'
  },
  {
    id: 'overallSatisfaction',
    pillarGroup: 'Overall',
    title: 'Overall Program Satisfaction: *',
    questionText: 'Overall, how satisfied are you with the program and partnership?',
    description: 'Overall, how satisfied are you with the program and partnership?',
    shortLabel: 'Overall Satisfaction',
    category: 'Overall satisfaction',
    icon: 'bx-star',
    allowNotApplicable: false,
    lowRatingTags: [
      'Overall service delivery did not meet expectations',
      'CS support needs improvement',
      'Employee adoption or engagement was low',
      'Overall program value did not meet expectations'
    ],
    scoreGuidance: '5 = Very satisfied; 4 = Satisfied; 3 = Neither satisfied nor dissatisfied; 2 = Dissatisfied; 1 = Very dissatisfied.',
    goodGuidance: 'Rating 4–5 and no urgent trigger in any other response.',
    urgentGuidance: 'Rating 1, or rating 2 together with a specific material unresolved concern.',
    escalationRequired: 'Rating 1: account lead/CS manager review. Compare with detailed ratings and open feedback before agreeing recovery plan.',
    priorityGuidance: 'A low overall score should trigger a review; do not use it as the only basis for escalation.'
  }
];

export const GENERAL_SUGGESTION_TAGS = [
  'More interactive wellness webinars',
  'Faster query response time',
  'Enhanced app loading speed',
  'Expanded specialist doctor network',
  'Detailed monthly employee participation reports',
  'Flexible trainer webinar scheduling',
  'Custom corporate fitness challenges'
];
