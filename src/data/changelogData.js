export const CHANGELOG_DATA = [
  {
    id: 'cl-dynamic-schedule',
    date: '2026-10-27',
    formattedDate: 'Oct 27, 2026',
    page: 'Admin',
    subPage: 'Accounts Receivable / Add Schedule',
    summary: 'Live Auto-Preview with dynamic % rebalancing & back-to-back monthly scheduling',
    details: 'Added live auto-preview schedule generator with flexible % rebalancing (e.g. 50% upfront on Invoice 1 + 5 monthly back-to-back at 10%), inline confirmation checkmark (✓), undo (↺), and standardized "Invoice By Date".',
    plainLanguage: 'When scheduling invoice payments for an order, a live schedule table appears dynamically inside the modal. You can set custom percentages on any invoice (e.g. 50% on Invoice 1) and click the checkmark—the remaining invoices automatically calculate and rebalance equally (10% each across the next 5 back-to-back monthly installments). You can also edit dates and remarks directly inline, or reset back to equal distribution.',
    highlights: [
      'Live auto-preview table inside Add Schedule modal with instant calculation',
      'Dynamic % rebalancing algorithm: locks edited rows and automatically distributes remainder equally to reach exactly 100%',
      'Single-click confirmation (✓) and undo reset (↺) per invoice row',
      'Consecutive monthly back-to-back date scheduling based on payment terms',
      'Renamed and standardized table and edit labels to "Invoice By Date" alongside "Due By Date"'
    ],
    path: '/client-payments',
    linkText: 'Accounts Receivable'
  },
  {
    id: 'cl-multicompany-billing',
    date: '2026-10-27',
    formattedDate: 'Oct 27, 2026',
    page: 'Admin',
    subPage: 'Multi-Company Billing Split',
    summary: 'Multi-company invoice scheduling with independent remarks & entity mapping',
    details: 'Supported multi-company order billing splits (e.g. 33%, 33%, 34%) with entity badges, individual installment calculations, and separate remarks per company invoice.',
    plainLanguage: 'For client orders requiring billing across multiple entities (e.g., MCC, MCHI, MRC - FZCO), the system now accurately distributes each installment across all selected companies according to their split percentage, generating independent invoice line items with company badges, individual amounts, and entity-specific remarks.',
    highlights: [
      'Added multi-company allocation in onboarding and billing setup with 1-click Equal Split',
      'Accurate per-entity installment breakdown in both live preview and full preview',
      'Independent remarks input for each billing entity invoice line item',
      'Clean entity badges and split percentages shown throughout the schedule'
    ],
    path: '/client-payments',
    linkText: 'Accounts Receivable'
  },
  {
    id: 'cl-in-modal-delete',
    date: '2026-10-27',
    formattedDate: 'Oct 27, 2026',
    page: 'Admin',
    subPage: 'Edit Scheduled Payment',
    summary: 'Redesigned Edit Scheduled Payment with in-modal delete confirmation',
    details: 'Replaced generic browser alert/confirm with an elegant in-modal confirmation card, updated fields to "Invoice By Date", and improved currency conversion display.',
    plainLanguage: 'Editing scheduled payments now features a safer and cleaner experience. Clicking "Delete Invoice" displays an in-modal confirmation card with warning details and red confirm button instead of standard browser popups. Standardized date fields to "Invoice By Date" and "Due By Date".',
    highlights: [
      'Built-in in-modal delete confirmation dialog with smooth slide/fade animation',
      'Standardized label to "Invoice By Date"',
      'Dynamic USD conversion display with auto-calculation badge',
      'Entity badge indicator showing corporate/billing company name and percentage'
    ],
    path: '/client-payments',
    linkText: 'Accounts Receivable'
  },
  {
    id: 'cl-users',
    date: '2026-10-27',
    formattedDate: 'Oct 27, 2026',
    page: 'Admin',
    subPage: 'User Access Management',
    summary: 'Created /user page with ?user_id URL query resolution and invitation directory',
    details: 'Implemented http://localhost:5173/user resolving user data and division access via ?user_id URL query parameters with automatic fallback to Karan Hinduja (Admin, All). Synchronized with division role invites.',
    plainLanguage: 'A dedicated User Access Management page is now available at /user. Appending ?user_id= to the URL automatically inspects that user profile (ID, Name, Email, Role, Division Access). If no user_id is provided, it defaults to Karan Hinduja with full Admin privileges. All users invited or assigned across corporate divisions are automatically tracked in the directory.',
    highlights: [
      'URL query resolution: ?user_id=XYZ fetches user data and division access immediately',
      'Intelligent default fallback: defaults to Karan Hinduja (hinduja1988@gmail.com, Admin, All Divisions)',
      'Central user directory synchronizing with division role assignments and pending email invites',
      'Interactive Invite / Add User modal with role and division access selectors',
      'One-click access link generator and shareable URLs'
    ],
    path: '/user',
    linkText: 'User Management'
  },
  {
    id: 'cl-0',
    date: '2026-10-27',
    formattedDate: 'Oct 27, 2026',
    page: 'CS',
    subPage: 'Feedback & Escalation',
    summary: 'Created CS Feedback survey form and 8-tier Service Escalation Matrix',
    details: 'Implemented http://localhost:5173/cs/feedback with an interactive multi-step survey assessing app satisfaction, responsiveness, helpfulness, and resolution timeliness, coupled with the standard 8-tier customer service escalation matrix table.',
    plainLanguage: 'Clients and customer success team members can now access the dedicated Feedback portal at /cs/feedback. It features an interactive satisfaction questionnaire with instant recording, along with an authoritative 8-tier Escalation Matrix detailing role timelines, complaint workflows, and trigger conditions.',
    highlights: [
      'Multi-step satisfaction questionnaire (App Satisfaction, Responsiveness, Helpfulness, Resolution Timeliness)',
      'Clean radio button selections with instant progress feedback and answer validation',
      '8-tier Customer Service Escalation Matrix with timelines from 15m to Resolution',
      'Detailed complaint workflows and escalation trigger definitions for all operational roles',
      'Accessible from CS Portal, Sidebar, and Home change log'
    ],
    path: '/cs/feedback',
    linkText: 'CS Feedback'
  },
  {
    id: 'cl-1',
    date: '2026-10-27',
    formattedDate: 'Oct 27, 2026',
    page: 'Admin',
    subPage: 'Client P&L',
    summary: 'Hyperlinked Amount Received and Due to Accounts Receivable with filter',
    details: 'Clicking on Amount Received or Amount Due in the Client P&L table now automatically opens Accounts Receivable (Client Payments) and filters specifically for that Order ID and payment status.',
    plainLanguage: 'You can now click directly on the Amount Received or Amount Due figures in the Client P&L report. The system will instantly jump to the Accounts Receivable ledger and show only the matching invoices for that order, highlighting either received payments or pending due amounts.',
    highlights: [
      'Amount Received is hyperlinked in green and filters for received/paid payments',
      'Amount Due is hyperlinked in amber and filters for pending/overdue invoices',
      'Accounts Receivable displays an active filter banner with a 1-click Clear Filter button',
      'Synchronized with the universal search bar for seamless navigation'
    ],
    path: '/expense-tracker',
    linkText: 'Client P&L'
  },
  {
    id: 'cl-2',
    date: '2026-10-27',
    formattedDate: 'Oct 27, 2026',
    page: 'Admin',
    subPage: 'Client P&L',
    summary: 'Custom styled Health Score dropdown replacing native select',
    details: 'Replaced the OS-native select box with a custom popover dropdown with glowing color-coded status dots, active checkmarks, and smart upward/downward positioning.',
    plainLanguage: 'The Health Score column in Client P&L used to open a harsh default browser box. It has been replaced with a modern card dropdown with rounded corners, colored indicator dots (Healthy, Moderate, Risky), and smart positioning so it never gets clipped at the bottom of the table.',
    highlights: [
      'Soft pill trigger with animated chevron icon',
      'Options with status dots: 🟢 Healthy, 🟡 Moderate, 🔴 Risky',
      'Active checkmark on selected option',
      'Smart upward flip when opened on the last rows of the table'
    ],
    path: '/expense-tracker',
    linkText: 'Client P&L'
  },
  {
    id: 'cl-3',
    date: '2026-10-27',
    formattedDate: 'Oct 27, 2026',
    page: 'Admin',
    subPage: 'Division / Add Order',
    summary: 'BD onboarding & draft order flow for billing schedule generation',
    details: 'Enabled BD teams to fill division onboarding, save orders as drafts with billing details without blocking validation, and immediately create billing schedules.',
    plainLanguage: 'Previously, BD team members could not create an invoice schedule for new clients because creating an order required all operational details (like final employee lists or session counts). Now, BD can auto-populate company billing details from onboarding, save the order as a Draft, and generate billing schedules right away.',
    highlights: [
      'Auto-imports company name, GST, and address from division onboarding into the order',
      'Save Draft & Create Schedule action button saves progress and opens schedule creation',
      'Accounts Receivable schedule generator now supports Draft orders',
      'Orders table in Division page shows Onboarding Filled vs. Pending badges'
    ],
    path: '/corporate',
    linkText: 'Corporate Clients'
  },
  {
    id: 'cl-4',
    date: '2026-10-27',
    formattedDate: 'Oct 27, 2026',
    page: 'Admin',
    subPage: 'Accounts Receivable',
    summary: 'Deep URL routing with order ID and corporate client ID',
    details: 'In Accounts Receivable, Order ID is hyperlinked to Edit Order and Client Name is hyperlinked to Edit Corporate, preserving IDs in the URL for multi-tab stability.',
    plainLanguage: 'All order IDs and client names in the Accounts Receivable ledger are now clickable links that open their respective edit pages with IDs preserved in the URL bar, ensuring bookmarking and multi-tab workflows work without conflicts.',
    highlights: [
      'Order ID links directly to /corporate/division/order/edit/:id',
      'Client name links directly to /corporate/edit?id=:id',
      'URL parameters prevent state loss on refresh or browser back/forward'
    ],
    path: '/client-payments',
    linkText: 'Accounts Receivable'
  },
  {
    id: 'cl-5',
    date: '2026-10-27',
    formattedDate: 'Oct 27, 2026',
    page: 'Home',
    subPage: 'Portal Summary & Landing',
    summary: 'Separated Live Production Workspaces between Admin and CS portals',
    details: 'Admin portal landing now shows only the 5 Admin workspaces, while the CS portal shows only the 3 CS workspaces, avoiding confusion across teams.',
    plainLanguage: 'The landing pages were previously mixing Admin and CS workspace links together. They are now cleanly separated: the CS portal shows CS-specific tools, and the Admin portal shows enterprise billing and approval tools.',
    highlights: [
      'CS Portal displays: CS Calendar, HR Approval & Calendar, Webinar Session Editor',
      'Admin Portal displays: Corporate Clients, Accounts Receivable, Expert Assignment, Expense Approval, Client P&L',
      'Home dashboard provides unified access to both'
    ],
    path: '/home',
    linkText: 'Home Page'
  },
  {
    id: 'cl-6',
    date: '2026-10-27',
    formattedDate: 'Oct 27, 2026',
    page: 'Admin',
    subPage: 'Client P&L',
    summary: 'Dynamic Primary CS resolution based on Access & Roles',
    details: 'The CS Responsible column now dynamically evaluates assigned roles. When multiple Primary CS members exist, the system automatically selects the first primary CS name.',
    plainLanguage: 'Instead of showing static or test placeholder names in Client P&L reports, the system now automatically pulls the real Primary Customer Success manager assigned in the division role settings.',
    highlights: [
      'Inspects corporate and division Access & Roles permissions',
      'Prioritizes users tagged with the Primary CS role',
      'Falls back safely if multiple roles are configured'
    ],
    path: '/expense-tracker',
    linkText: 'Client P&L'
  },
  {
    id: 'cl-7',
    date: '2026-10-27',
    formattedDate: 'Oct 27, 2026',
    page: 'CS',
    subPage: 'Expert Assignment',
    summary: 'Displayed CS remarks below session duration',
    details: 'Special notes and operational remarks entered by the CS team are now visible directly below the duration field in the trainer/expert allocation grid.',
    plainLanguage: 'Trainers and coordinators can now see the CS team instructions and remarks right underneath the session duration in Expert Assignment, ensuring trainers have full context for delivery.',
    highlights: [
      'Shows remarks text with an informative icon under duration',
      'Preserves space without expanding row heights excessively',
      'Updates dynamically when sessions are modified'
    ],
    path: '/expert-assignment',
    linkText: 'Expert Assignment'
  },
  {
    id: 'cl-8',
    date: '2026-10-26',
    formattedDate: 'Oct 26, 2026',
    page: 'Admin',
    subPage: 'Corporate / Division',
    summary: 'Document Upload V2 with order linking and direct uploads',
    details: 'Implemented Document Upload V2 allowing teams to upload agreements and contracts to divisions and link/unlink them to specific orders.',
    plainLanguage: 'You can now upload master agreements or rate cards once to a client division, and easily attach or detach them to any order without re-uploading the file multiple times.',
    highlights: [
      'Central division document repository',
      'Order attachment modal with quick link/unlink toggles',
      'Document type tagging (Contract, SOW, Addendum)'
    ],
    path: '/corporate',
    linkText: 'Corporate Clients'
  },
  {
    id: 'cl-9',
    date: '2026-10-26',
    formattedDate: 'Oct 26, 2026',
    page: 'Admin',
    subPage: 'Expense Approval',
    summary: 'Revoke, edit, and resubmit expense claims with audit logs',
    details: 'Enabled managers and CS to revoke, update, or resubmit corporate event expenses with reason tracking and activity histories.',
    plainLanguage: 'If an expense was submitted with the wrong amount or missing receipts, you can now revoke it with an explanation, edit the fields, and resubmit for approval with a full audit log history.',
    highlights: [
      'Revoke button with reason prompt modal',
      'Complete timeline of status changes (Submitted, Revoked, Approved)',
      'Budget vs. actual spend recalculation'
    ],
    path: '/expense-approval',
    linkText: 'Expense Approval'
  },
  {
    id: 'cl-10',
    date: '2026-10-25',
    formattedDate: 'Oct 25, 2026',
    page: 'CS',
    subPage: 'CS Calendar',
    summary: 'Enforced 3-day minimum trainer preparation lead time',
    details: 'Automated a validation constraint requiring that trainer material delivery dates must be scheduled at least 3 business days before live sessions.',
    plainLanguage: 'To prevent last-minute trainer cancellations or unprepared sessions, the calendar now enforces that trainers must receive all session decks and materials at least 3 days prior to the event.',
    highlights: [
      'Prevents invalid dates during webinar session creation',
      'Clear helper tooltip explaining lead time requirement',
      'Reduces delivery escalations'
    ],
    path: '/calendar',
    linkText: 'CS Calendar'
  }
];
