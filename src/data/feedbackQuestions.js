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
    id: 'bdCommitment',
    pillarGroup: 'BD',
    title: 'BD Commitment vs. Actual Service Delivery: *',
    description: 'How well did actual operational execution align with deliverables, promised scope, and timelines agreed during the Business Development / sales phase?',
    shortLabel: 'BD Commitment vs Delivery',
    category: 'Sales & Onboarding Alignment',
    icon: 'bx-briefcase-alt-2',
    allowNotApplicable: false,
    lowRatingTags: [
      'Scope of services mismatched',
      'Delayed onboarding & kickoff',
      'Deliverables promised were missing',
      'Billing or pricing miscommunication'
    ]
  },
  {
    id: 'csSupport',
    pillarGroup: 'CS',
    title: 'Customer Success (CS) Support & Account Management: *',
    description: 'Responsiveness, proactiveness, and helpfulness of your dedicated Customer Success SPOC in resolving queries, managing account requests, and reviewing health metrics:',
    shortLabel: 'CS Support & Responsiveness',
    category: 'Customer Success Operations',
    icon: 'bx-user-voice',
    allowNotApplicable: false,
    lowRatingTags: [
      'Slow response to emails / queries',
      'Need more proactive follow-ups',
      'Escalations remained unresolved',
      'Need more frequent status reviews'
    ]
  },
  {
    id: 'techSupport',
    pillarGroup: 'Tech',
    title: 'Tech & App Support (Platform Reliability & Usability): *',
    description: 'Ease of use, app speed, uptime reliability, and technical assistance for the MantraCare employee mobile app and corporate portal:',
    shortLabel: 'Tech & App Support',
    category: 'Product & Technology',
    icon: 'bx-laptop',
    allowNotApplicable: false,
    lowRatingTags: [
      'Login / OTP verification issues',
      'App performance / slow loading',
      'Feature bugs or app crashes',
      'Portal navigation was confusing'
    ]
  },
  {
    id: 'hotlineCallQuality',
    pillarGroup: 'Hotline',
    title: 'Hotline: Call Quality & Pickup Ratio: *',
    description: 'Immediate call pickup speed, zero connection dropouts, audio clarity, and 24/7 helpline accessibility when employees call in:',
    shortLabel: 'Hotline: Call Quality',
    category: 'Helpline & Assistance',
    icon: 'bx-phone-call',
    allowNotApplicable: true,
    lowRatingTags: [
      'High wait time before call answered',
      'Frequent dropped / disconnected calls',
      'Audio line crackling or lag',
      'Pickup delays during peak hours'
    ]
  },
  {
    id: 'hotlineCallSupport',
    pillarGroup: 'Hotline',
    title: 'Hotline: Counselor & Agent Call Support: *',
    description: 'Empathy, active listening, problem handling, and professionalism displayed by helpline agents when handling employee situations:',
    shortLabel: 'Hotline: Call Support',
    category: 'Helpline & Assistance',
    icon: 'bx-support',
    allowNotApplicable: true,
    lowRatingTags: [
      'Agent sounded rushed or impatient',
      'Lacked active empathy & understanding',
      'Inadequate clinical / wellness guidance',
      'Tone was perceived as unprofessional'
    ]
  },
  {
    id: 'hotlineOpsResponse',
    pillarGroup: 'Hotline',
    title: 'Hotline: Ops Response to Queries & Follow-ups: *',
    description: 'Operational turnaround speed and efficiency in closing ticket escalations, scheduled callbacks, and resolving employee queries:',
    shortLabel: 'Hotline: Ops Response',
    category: 'Helpline & Assistance',
    icon: 'bx-time-five',
    allowNotApplicable: true,
    lowRatingTags: [
      'Scheduled callback was delayed / missed',
      'Ticket escalation took days to resolve',
      'Lack of clear status communication',
      'Operations resolution was incomplete'
    ]
  },
  {
    id: 'oneOnOneSessions',
    pillarGroup: '1-on-1',
    title: '1-on-1 Individual Sessions: *',
    description: 'Quality, punctuality, practitioner expertise, confidentiality, and employee satisfaction with individual 1-on-1 sessions:',
    shortLabel: '1-on-1 Sessions',
    category: 'Clinical & Wellness Care',
    icon: 'bx-user-pin',
    allowNotApplicable: true,
    lowRatingTags: [
      'Limited expert slot availability',
      'Expert rescheduled / cancelled sessions',
      'Consultation quality was inconsistent',
      'Feedback from employees was mixed'
    ]
  },
  {
    id: 'webinarTopic',
    pillarGroup: 'Webinars',
    title: 'Webinars: Topic Relevance & Variety: *',
    description: 'Alignment of webinar themes with workforce wellness priorities, mental health awareness, and employee interest:',
    shortLabel: 'Webinars: Topic Relevance',
    category: 'Engagement & Activities',
    icon: 'bx-list-check',
    allowNotApplicable: true,
    lowRatingTags: [
      'Topics too generic or repetitive',
      'Did not resonate with workforce needs',
      'Need more specialized wellness themes',
      'Too few topics to choose from'
    ]
  },
  {
    id: 'webinarContent',
    pillarGroup: 'Webinars',
    title: 'Webinars: Content Depth & Presentation Quality: *',
    description: 'Practicality, visual presentation, depth of actionable health takeaways, and reference materials provided to attendees:',
    shortLabel: 'Webinars: Content Quality',
    category: 'Engagement & Activities',
    icon: 'bx-slideshow',
    allowNotApplicable: true,
    lowRatingTags: [
      'Slides were text-heavy & hard to follow',
      'Lack of actionable everyday tips',
      'Content was too theoretical/basic',
      'Resource guides / recordings delayed'
    ]
  },
  {
    id: 'webinarExpert',
    pillarGroup: 'Webinars',
    title: 'Webinars: Trainer / Expert Engagement & Q&A: *',
    description: 'Speaker energy, subject mastery, audience engagement, and effectiveness in answering live employee questions:',
    shortLabel: 'Webinars: Expert Engagement',
    category: 'Engagement & Activities',
    icon: 'bx-broadcast',
    allowNotApplicable: true,
    lowRatingTags: [
      'Speaker lacked dynamic engagement',
      'Audience Q&A was rushed or skipped',
      'Session started late or ran overtime',
      'Could not answer complex attendee queries'
    ]
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
