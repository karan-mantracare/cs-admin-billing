export const CHANGELOG_DATA = [
  {
    id: 'cl-client-onboarding-multiple-spocs-20261121',
    date: '2026-11-21',
    formattedDate: 'Nov 21, 2026',
    page: 'Client Onboarding',
    subPage: 'Step 1 & 4: Multi-SPOC Management & Procurement Focus',
    summary: 'Added option to add multiple Key SPOCs in Step 1 and Procurement Department Focus in Step 4',
    details: 'Enhanced Step 1 (Key SPOC) of the MantraCare Client Onboarding Wizard to support adding multiple points of contact with a dedicated "+ Add SPOC" action, primary/secondary contact badges, removal controls, and clean responsive layout. Added "Procurement" department focus option in Step 4 (Payment SPOC) below "Both (Billing & Payment)". Synchronized data across Onboarding Filing, View Onboarding modal, Cadence Division utilities, and Division Edit view with backward compatibility.',
    plainLanguage: 'Clients and administrators can now add multiple Key SPOCs during onboarding rather than just a single contact, and select Procurement as Department Focus for finance and billing contacts.',
    highlights: [
      '+ Add SPOC Action: One-click addition of multiple Key SPOC contact cards in Step 1',
      'Primary & Key SPOC Badges: First contact automatically designated as Primary SPOC',
      'Department Focus: Added "Procurement" dropdown option in Step 4 for billing contacts',
      'Remove SPOC Control: Clean removal with confirmation safeguard ensuring at least one primary contact remains',
      'Universal Persistence: Saved contacts immediately reflect in Onboarding view modal and Division management'
    ],
    path: '/client-onboarding/1',
    linkText: 'Client Onboarding'
  },
  {
    id: 'cl-sensitive-cases-portal-and-hotline-intake-20261121',
    date: '2026-11-21',
    formattedDate: 'Nov 21, 2026',
    page: 'Admin / CS',
    subPage: 'Corporate / Sensitive Cases & CS Home Hotline Intake',
    summary: 'Added Sensitive Cases hub in Admin with Manager Referral & Critical cases tabs, and Hotline/Session intake in CS Home',
    details: 'Introduced a comprehensive Sensitive Cases portal under Corporate in the Admin dashboard with two dedicated tabs: Manager Referral and Critical cases. Features live status tracking, pagination (10-100), inline editable remarks, highest priority flagging, and a collapsible complete form details inspector. In CS Home, integrated a Manager Referral link copy workflow with corporate division mapping, and an urgent Report for Sensitive Cases intake modal featuring Source selection (Hotline Call / 1 on 1 Session) with conditional Caller Number input disabling.',
    plainLanguage: 'Added a dedicated Sensitive Cases page in Admin with tabs for Manager Referral and Critical cases. Added quick link shortcuts in CS Home to copy division-mapped referral links and report sensitive clinical crises directly, supporting both Hotline calls and 1 on 1 sessions.',
    highlights: [
      'Manager Referral & Critical Cases Tabs: Complete confidential triage table with real-time updates and pagination (10-100)',
      'Top Source Radio & Conditional Caller Number: Toggle between Hotline Call and 1 on 1 Session, automatically disabling Caller Number on Session',
      'Dedicated Source Column: Added live Source badges with icons in the Critical Cases table',
      'Collapsible Form Details: Case modal defaults to collapse mode with toggle to view complete multi-section manager and member details',
      'Public Referral Form Mapping: Division-mapped public referral form auto-loads into the Admin portal upon submission'
    ],
    path: '/corporate/sensitive-cases',
    linkText: 'Sensitive Cases'
  },
  {
    id: 'cl-workspace-and-home-default-collapse-20261121',
    date: '2026-11-21',
    formattedDate: 'Nov 21, 2026',
    page: 'Home',
    subPage: 'Workspace Overviews & Portal Workflows Collapse Controls',
    summary: 'Configured CS & Admin workflows on Home and Test & Scope preview cards on module overviews to be collapsed by default',
    details: 'To improve page density and eliminate vertical visual clutter, Customer Success (CS) Workflows and Admin Portal Workflows on the main Home dashboard, as well as the Test & Telemetry Preview table and What We Are Doing In This Project cards on module summary pages, now default to collapsed mode with smooth interactive expand/collapse toggles and status indicators.',
    plainLanguage: 'Collapsed heavy overview workflows and telemetry preview cards across Home and module workspaces by default so you can focus on primary actions immediately without excessive scrolling.',
    highlights: [
      'Always Collapsed by Default: CS & Admin workflow accordions and telemetry tables open in collapsed state',
      'Interactive Header Toggles: One-click header toggle bars with chevron icons and status badges',
      'Streamlined Workspace Density: Drastically reduces initial viewport scroll distance across dashboards'
    ],
    path: '/home',
    linkText: 'Home Dashboard'
  },
  {
    id: 'cl-tax-simplification-and-tds-deduction-20261121',
    date: '2026-11-21',
    formattedDate: 'Nov 21, 2026',
    page: 'Admin',
    subPage: 'Manage Invoice & Add Payment / Tax Details & TDS Deduction',
    summary: 'Streamlined invoice modal to Tax % and Tax Amount only, and added conditional TDS deduction entry in payment currency',
    details: 'Removed extraneous and redundant Tax Details fields in the Manage Invoice modal, keeping only Tax % and Tax Amount. In the Add Payment modal, enabled the TDS / Withholding tax input only when the TDS checkbox is selected, restricting input directly to the payment currency amount without unnecessary complex tax configuration.',
    plainLanguage: 'Simplified invoice tax inputs to only Tax % and Tax Amount, and updated Add Payment so TDS deduction amount can be entered cleanly when the TDS checkbox is selected.',
    highlights: [
      'Streamlined Invoice Taxes: Removed clutter to show only Tax % and Tax Amount',
      'Conditional TDS Input: Unlocks TDS deduction amount field only when TDS checkbox is active',
      'Strict Payment Currency Scoping: Enforces TDS deduction exclusively in the received payment currency'
    ],
    path: '/client-payments',
    linkText: 'Accounts Receivable'
  },
  {
    id: 'cl-quarterly-unlocked-installments-input-20261120',
    date: '2026-11-20',
    formattedDate: 'Nov 20, 2026',
    page: 'Admin',
    subPage: 'Add Invoice Schedule / Unlocked Quarterly & Multi-Cadence Installment Editing',
    summary: 'Unlocked Quarterly installment count input, allowing users to freely edit installments up to the calculated maximum',
    details: 'Previously, non-monthly frequencies like Quarterly were locked with a read-only input, disabled state, and lock icon. The installment count for Quarterly (and Bi-Annually / Annually) is now fully open and editable. The maximum count (e.g. 2 quarterly installments for an 8-month contract, or 4 for 12 months) is dynamically calculated and enforced as the upper ceiling without preventing users from adjusting the installment count down to 1 or any number within the permitted limit.',
    plainLanguage: 'Quarterly billing months are no longer locked! You can now freely edit the number of installments in Step 2. The input enforces the maximum limit (such as 2 quarters for an 8-month contract) while allowing you to choose 1, 2, or any valid count.',
    highlights: [
      'Unlocked Quarterly Inputs: Removed read-only/disabled constraints and lock icons across Quarterly, Bi-Annual, and Annual cadences',
      'Dynamic Upper Ceiling Enforcement: Prevents exceeding the maximum possible installments for that frequency (e.g., maximum 2 for an 8-month contract)',
      'Immediate Installment Recalculation: Adjusting installments immediately recalculates per-installment amounts and schedules accurately in preview',
      'Top Status Pill Consistency: Updated schedule configuration badge to indicate editable terms with edit icon'
    ],
    path: '/client-payments',
    linkText: 'Accounts Receivable'
  },
  {
    id: 'cl-contract-billing-start-date-schedule-calculation-20261120',
    date: '2026-11-20',
    formattedDate: 'Nov 20, 2026',
    page: 'Admin',
    subPage: 'Add Invoice Schedule / Contract Billing Start Date & Installment Calculation',
    summary: 'Calculated billing schedule installments and max terms from Contract Billing Start Date to Order End Date',
    details: 'Resolved an issue in AddScheduleModal where multi-contract schedules hardcoded the order planStart date (e.g., 2026-11-01) for all contracts rather than honoring each individual contract billingDate (e.g., 2027-03-01 for 2011 2nd corp). Each contract now calculates its effective month difference as (Contract Billing Start Date to Order End Date), correctly defaulting 2011 2nd corp to 8 monthly installments instead of 12. In addition, the generated invoices in the schedule preview now strictly start from the contract billingDate (01/03/2027 to 01/10/2027), ensuring installments never precede the contract effective billing date or cross the order plan end date.',
    plainLanguage: 'Fixed an issue where a contract with a later billing start date (e.g., March 1, 2027) was defaulted to 12 billing months using the order start date (November 1, 2026) and generated preview invoices starting in November. The system now calculates each contract billing schedule based on its own billing start date up to the order end date (e.g., 8 months from March to October), and begins the preview invoices on the contract billing start date.',
    highlights: [
      'Contract-Specific Month Duration: Billing schedule length is calculated as (Contract Billing Date to Order End Date), e.g., 8 months for March to October',
      'Accurate Invoice By Dates: Preview invoices for each contract start on its own billing start date instead of falling back to order planStart',
      'Dynamic Max Terms Validation: Independent month limits per contract row in Step 2 table prevents crossing order planEnd',
      'Division Contracts Enrichment: Auto-retrieves billingDate and paymentDueDays from division_contracts in localStorage for all linked and mapped contracts'
    ],
    path: '/client-payments',
    linkText: 'Accounts Receivable'
  },
  {
    id: 'cl-add-schedule-division-order-matching-20261120',
    date: '2026-11-20',
    formattedDate: 'Nov 20, 2026',
    page: 'Admin',
    subPage: 'Add Invoice Schedule / Division Order Discovery & Auto-Resolution',
    summary: 'Resolved issue where orders existing in a division were not found when selecting Corporate & Division in Add Schedule modal',
    details: 'Fixed a strict corporate matching check in AddScheduleModal that caused orders belonging to a selected division (e.g., 20-11) to be hidden if the corporate or client name field contained generic values or naming variations. When a division is selected, orders matching that division by name or ID are now immediately discovered and displayed. In addition, single-order divisions auto-select the order and populate its details automatically.',
    plainLanguage: 'Fixed an issue where selecting a division in the Add Invoice Schedule modal reported "No existing orders found" even though the order existed in that division. All orders under the selected division now appear immediately in the dropdown and auto-select if only one order exists.',
    highlights: [
      'Division-First Order Resolution: Guarantees orders belonging to a chosen division are never filtered out by corporate name discrepancies',
      'Case-Insensitive & ID Matching: Matches divisions by name or divisionId resiliently',
      'One-Click Auto-Selection: Auto-populates order details, plan dates, and billing terms when a division has one order',
      'Real-Time Storage Fallback: Ensures live division_orders are always accessible during schedule creation'
    ],
    path: '/client-payments',
    linkText: 'Accounts Receivable'
  },
  {
    id: 'cl-payment-summary-modal-action-icons-20261120',
    date: '2026-11-20',
    formattedDate: 'Nov 20, 2026',
    page: 'Admin',
    subPage: 'Payment Summary Modal / Action Icons & Create Schedule Integration',
    summary: 'Replaced text buttons with compact action icons, added Create Billing Schedule icon, and made View Billing Schedule conditional',
    details: 'Modernized the action footer of the Payment Summary modal across Edit Order and Division views by replacing the text-heavy "View Payment Schedule" and "View Billing Schedule" buttons with sleek, color-coded icon buttons with tooltips. Added a new "Create Billing Schedule" icon button (calendar-plus) that directly initiates the schedule builder for the active order. Made the "View Billing Schedule" icon (receipt) conditionally visible only when a billing schedule has actually been created for the order.',
    plainLanguage: 'The Payment Summary modal now uses sleek icon buttons instead of large text blocks in the footer. A new green "Create Billing Schedule" icon lets you instantly start scheduling billing for the order. The "View Billing Schedule" icon now only appears after a billing schedule has been created.',
    highlights: [
      'Compact Action Icons: Replaced bulky text buttons with clean, tooltip-enabled icon buttons for View Payment Schedule and View Billing Schedule',
      'Create Billing Schedule Action: Added a dedicated calendar-plus icon button to launch the schedule builder directly from Payment Summary',
      'Conditional Visibility: "View Billing Schedule" icon is only displayed when an existing billing schedule is detected for the order',
      'Cross-Page Integration: Fully wired across Edit Order (AddOrder.jsx) and Edit Division order tables'
    ],
    path: '/edit-order',
    linkText: 'Order Management'
  },
  {
    id: 'cl-invoice-schedule-preview-terms-sync-20261120',
    date: '2026-11-20',
    formattedDate: 'Nov 20, 2026',
    page: 'Admin',
    subPage: 'Add Invoice Schedule / Preview Installment Terms Synchronization',
    summary: 'Fixed issue where customized billing months (e.g. 5 installments) were not reflected in invoice schedule preview',
    details: 'Resolved a state synchronization issue in AddScheduleModal where editing the Billing Month for single or unlinked contracts in Step 2 updated formData.paymentTerms without synchronizing per-contract separateTerms. Consequently, generateInvoices fell back to stale or initial 1-month terms when entering the preview modal. Now, separateTerms and formData.paymentTerms are strictly synchronized across single-contract and multi-contract flows, ensuring invoice preview accurately renders all configured installment rows with balanced split percentages.',
    plainLanguage: 'Fixed an issue where configuring a schedule with multiple installments (e.g., 5 billing months) showed only 1 invoice row in the preview modal. The preview table now correctly generates and displays all configured invoice installments and equal split percentages.',
    highlights: [
      'Installment Terms Synchronization: Guaranteed 2-way sync between customized billing months and invoice generation terms',
      'Preview Accuracy: Invoice Schedule Preview generates the full count of installments (e.g., 5 monthly invoices instead of 1)',
      'Unlinked & Single Contract Support: Correctly applies customized monthly schedules to single and unlinked contract configurations',
      'Direct Save & Preview Consistency: Synchronizes terms across both Direct Save and full Preview Schedule actions'
    ],
    path: '/client-payments',
    linkText: 'Accounts Receivable'
  },
  {
    id: 'cl-payment-records-change-request-modal-20261113',
    date: '2026-11-13',
    formattedDate: 'Nov 13, 2026',
    page: 'Admin',
    subPage: 'Accounts Receivable / Payment Records Change & Deletion Request',
    summary: 'Added Action column to Payment Records with Change/Delete request modal, Update Amount numeric input, and reason tracking',
    details: 'Enhanced the Payment Records tab in Accounts Receivable with a dedicated Action column and "Request Change" workflow featuring an edit pencil icon and non-wrapping button layout. Clicking the action button opens a structured request modal with payment context (Order ID, Payment ID, Amount, Currency, Payment Date, Bank). Users can select between horizontal "Change" and "Delete" request type options. If Delete is selected, a required "Reason for deletion" field is displayed. If Change is selected, a required numeric "Update Amount" input and "Reason for change" fields are presented. Submitting persists the request state against the payment record, renders a status badge ("Change Requested" or "Delete Requested"), and enables request review or withdrawal.',
    plainLanguage: 'Finance and CS administrators can now request modifications or deletions directly from the Payment Records table. Clicking the edit "Request Change" button opens a clean form where users pick either Change (to specify an updated amount and reason) or Delete (to specify why a payment record should be deleted). The table instantly flags requested records with a color-coded status badge and allows reviewing or withdrawing requests.',
    highlights: [
      'New Action Column: Added ACTIONS column to the Payment Records ledger with edit icon button',
      'Request Change Modal: Modal capturing request type, payment record context, and justifications',
      'Horizontal Request Type Selection: Symmetrical side-by-side selection for Change and Delete options',
      'Update Amount Numeric Field: Streamlined input specifically for updated numerical amounts',
      'Delete Workflow: Dynamic form displaying required "Reason for deletion" when Delete is chosen',
      'Status Badges & State Persistence: Renders "Change Requested" and "Delete Requested" badges on affected records with option to withdraw'
    ],
    path: '/client-payments',
    linkText: 'Accounts Receivable'
  },
  {
    id: 'cl-webinar-session-settlement-modal-20261113',
    date: '2026-11-13',
    formattedDate: 'Nov 13, 2026',
    page: 'CS',
    subPage: 'Webinar Session Editor / Session Settlement & Symmetrical Summary Modal',
    summary: 'Realigned 5-row 2-column symmetrical session details modal with Approved on, editable Duration, Service dropdown, Participant Count, and payout disclaimer',
    details: 'Realigned the Confirm Session Settlement modal into 5 symmetrical 2-column rows: Row 1 (Session Date | Approved on), Row 2 (Session Name | Session Time), Row 3 (Session Type [Webinar] | Duration), Row 4 (Provider ID | Price USD), and Row 5 (Session Service | Participant Count). Added a dedicated payout disclaimer banner informing administrators that confirming and settling will disburse payment to the assigned provider. Duration supports inline pencil editing, and Participant Count accepts up to 10 digits.',
    plainLanguage: 'When administrators click the green tick in the Expert Details table to settle a session, they now see a perfectly realigned 5-row, 2-column modal: Row 1 (Session Date & Approved on), Row 2 (Session Name & Session Time), Row 3 (Session Type "Webinar" & Duration), Row 4 (Provider ID & Price USD), and Row 5 (Session Service dropdown & Participant Count). An explicit disclaimer banner informs administrators that confirming settlement initiates provider payout.',
    highlights: [
      'Realigned 5-Row Symmetrical Layout: Row 1 (Session Date | Approved on), Row 2 (Session Name | Session Time), Row 3 (Session Type | Duration), Row 4 (Provider ID | Price USD), Row 5 (Session Service | Participant Count)',
      'Payout Disclaimer Banner: Displays clear notice: "Disclaimer: When you click on confirm & settle the provider will be paid for this session."',
      'Approved On Attribution: Captures and displays approval timestamp directly alongside Session Date',
      'Session Service Dropdown: Select between Therapy, Yoga, Mindfulness, and Meditation directly in the form',
      'Inline Duration Editing: Displays duration (e.g., 60 Mins) with an edit pencil icon; clicking toggles active numeric input with a Mins suffix and quick [✓] save button',
      'Participant Count Input: Clean editable number input with a 10-digit upper boundary constraint',
      'Provider ID Attribution: Auto-resolves assigned expert provider IDs (e.g., P-101) directly into the summary table',
      'One-Click Status & Expense Settlement: Automatically updates event duration, sets participant count, completes event status, and marks expense as Settled with confirmation toast'
    ],
    path: '/edit',
    linkText: 'Webinar Session Editor'
  },
  {
    id: 'cl-billing-schedule-monthly-flex-and-annual-20261106',
    date: '2026-11-06',
    formattedDate: 'Nov 06, 2026',
    page: 'Admin',
    subPage: 'Add Billing Schedule / Flexible Monthly, Annual Payment & Schedule Simplification',
    summary: 'Enabled editable monthly installments capped at plan month difference, added Annually frequency option, and removed redundant switcher toggle',
    details: 'Enhanced Step 2 of the Add Invoice Schedule wizard to provide flexible installment counts for Monthly billing while preserving automated calculations for fixed intervals. When Monthly is chosen, Billing Month defaults to the exact month difference between Billing Start Date and Plan End Date (or 1 if plan end is unavailable), and allows user editing capped at that difference. Added a new "Annually" frequency option providing 1 installment per year on a 12-month cadence. Removed the "Same for all Contracts" switcher to present a clean, unified per-contract schedule table where all contracts can be configured individually or batch-updated.',
    plainLanguage: 'In the billing schedule setup, selecting Monthly now automatically calculates the month difference between the start and end dates and selects it as the default, while allowing users to customize the number of installments up to that maximum. If no plan end date exists, it defaults to 1. An "Annually" payment option is now available across master and per-contract selectors. The redundant "Same for all Contracts" button was removed in favor of a clean, consistent schedule configuration table.',
    highlights: [
      'Dynamic Month Difference Calculation: Automatically derives month span between Billing Start Date and Plan End Date as default for Monthly billing (defaults to 1 if plan end is unavailable)',
      'Editable Monthly Installments: Users can edit the installment count freely between 1 and the calculated month difference without exceeding the plan term',
      'Annual Payment Frequency: Added "Annually" billing frequency setting 1 installment per year on a 12-month schedule cadence',
      'Strict Capping & Warning: Values exceeding the plan month span are immediately clamped with validation error banners',
      'Removed Switcher Toggle: Eliminated the "Same for all Contracts" toggle button to maintain a clean, consistent per-contract schedule table',
      'Clear Visual Badges: Differentiates editable Monthly configuration from fixed Annually, Bi-Annually, and Quarterly intervals'
    ],
    path: '/client-payments',
    linkText: 'Accounts Receivable'
  },
  {
    id: 'cl-cs-feedback-12-questions-and-escalation-20261105',
    date: '2026-11-05',
    formattedDate: 'Nov 05, 2026',
    page: 'CS',
    subPage: 'Feedback & Escalation / 12-Dimension Evaluation Rubric & 4-Tier Escalation Protocol',
    summary: 'Upgraded to a 12-dimension feedback rubric, 4-tier escalation matrix with role-specific reachout mailto links, and two-part open feedback fields',
    details: 'Completely overhauled the CS Feedback and Escalation system. Expanded the evaluation questionnaire to 12 distinct dimensions with individual diagnostic tags and scoring criteria. Modernized the Escalation matrix into a 4-tier Support Protocol table detailing Tier 1 (Basic Support & First-Level), Tier 2 (Operational), Tier 3 (Senior Management), and Tier 4 (Executive-Level) with explicit triggers, acknowledgment TATs, action plan TATs, and direct mailto links for role points of contact. Replaced generic comments with two dedicated open feedback textareas for "What is working well?" and "What is the one improvement you would like us to prioritize?" with quick-insert tags. Renamed navigation tabs to "Feedback" and "Escalation", hid the "Summary" tab, and styled the Share Form button as a compact copy icon.',
    plainLanguage: 'The client feedback experience and escalation framework have been upgraded to enterprise standards. The questionnaire now includes 12 comprehensive questions covering implementation, CS support, employee access, helpline, app usability, technical troubleshooting, service quality, reporting, 1-on-1 sessions, webinars, issue resolution, and overall satisfaction. A dedicated 4-tier Escalation Protocol table provides clear resolution SLAs and direct email contact links for role owners. Clients can share structured qualitative feedback in two separate boxes: one for highlights and another for priority improvements with quick-tag suggestions.',
    highlights: [
      '12 Evaluation Dimensions: Comprehensive rubric covering Onboarding, CS Support, Employee Awareness, Hotline, Mobile App, Tech Support, Service Quality, Utilization, 1-on-1 Sessions, Webinars, Issue Resolution, and Overall Satisfaction',
      '4-Tier Escalation Protocol: Detailed matrix covering Tier 1 (Client Success SPOC), Tier 2 (CS Manager), Tier 3 (Head of Operations & BD SPOC), and Tier 4 (Founder / CEO) with defined triggers and resolution TATs',
      'Direct Role Reachout Links: Formatted "<Role> > Contact" mailto links connecting clients directly to assigned SPOCs and leadership',
      'Two-Part Open Feedback: Dedicated textareas for "What is working well?" and "What is the one improvement you would like us to prioritize?" with clickable suggestion tags',
      'Refined Navigation: Renamed tabs to "Feedback" and "Escalation", hid the redundant Summary tab, and added a sleek 38px Copy Icon button for sharing forms'
    ],
    path: '/cs/feedback',
    linkText: 'CS Feedback'
  },
  {
    id: 'cl-add-schedule-modal-stepper-and-table-redesign-20261031',
    date: '2026-10-31',
    formattedDate: 'Oct 31, 2026',
    page: 'Admin',
    subPage: 'Add Billing Schedule / 2-Step Wizard & Table Redesign',
    summary: 'Streamlined Add Invoice Schedule into a 2-step modal with Next navigation, collapsible Total Order Value dropdown, and per-contract table',
    details: 'Redesigned the Add Invoice Schedule modal to eliminate congestion. Step 1 focuses solely on Corporate, Division, and Order selection with a single "Next" action button. On clicking Next, Step 2 reveals an expandable "Total Order Value" summary dropdown, master and per-contract Billing Frequency selectors, and a responsive "Billing Month per Contract" table. For "Same for all Contracts" (and single contract), the Billing Month is strictly frozen (disabled & read-only with lock indicator) so users cannot manually edit it; it is strictly and automatically driven by the established Billing Frequency formula (Bi-Annually = 2, Monthly = start-to-end month span, Quarterly = max 4 milestones). Step 2 footer provides clear Back and Preview Schedule actions.',
    plainLanguage: 'Adding a billing schedule is now clean and uncluttered. Step 1 lets you choose the Corporate, Division, and Order, then click "Next". Step 2 neatly packs the Total Order Value into an expandable dropdown and presents all contracts in an organized table. When "Same for all Contracts" is active, the billing month is completely frozen so users cannot enter arbitrary values; only the selected Billing Frequency formula calculates the billing months.',
    highlights: [
      '2-Step Schedule Modal: Separated Order selection (Step 1) from schedule configuration (Step 2) to eliminate visual congestion',
      'Step 1 Exclusive Selectors: Corporate, Division, and Order dropdowns are displayed only on Step 1 and hidden on Step 2',
      'Flexible Monthly & Fixed Billing Month Calculation: When Monthly frequency is selected, the billing month defaults to the difference between Billing Start date and Plan end date (or 1 if plan end is unavailable) and can be edited without exceeding the plan term. Annually, Quarterly, and Bi-Annual frequencies remain fixed',
      'Automated Frequency Rules: Annually sets 1 installment per year, Bi-Annually freezes to 2 installments, Monthly calculates total month span, Quarterly calculates up to 4 installments',
      'Collapsible Order Value Dropdown: Total Order Value and plan terms are displayed in an expandable accordion dropdown with summary headers',
      'Contract Schedule Table: Replaced bulky tabs/cards with a structured table featuring Entity Name, Contract Value, Billing Frequency, Billing Month (with tooltip), and Per-Month calculations',
      'Streamlined Footers: Cancel button removed in favor of top-right "×"; Step 2 features Back, Direct Save, and Preview Schedule buttons',
      'Plan End Date Validation & Button Disabling: If entered installments cross the Plan End Date, an error banner is displayed and both Preview and Direct Save buttons are disabled (not-allowed cursor, reduced opacity) leaving only Back clickable'
    ],
    path: '/client-payments',
    linkText: 'Accounts Receivable'
  },
  {
    id: 'cl-billing-schedule-frequency-and-month-calc-20261031',
    date: '2026-10-31',
    formattedDate: 'Oct 31, 2026',
    page: 'Admin',
    subPage: 'Add Billing Schedule / Billing Frequency & Month Calculator',
    summary: 'Added Billing Month tooltip and automated Monthly, Quarterly, and Bi-Annually frequency calculations',
    details: 'Enhanced the Add Schedule modal in Accounts Receivable with a dedicated Tooltip on "Billing Month" ("This will break the total value in the entered months") and introduced an interactive Billing Frequency dropdown with options for Monthly, Quarterly, and Bi Anually. If Bi Anually is selected, Billing Month automatically sets to 2. If Monthly is selected, Billing Month resolves to the exact month difference between Billing Start Date and Plan End Date. If Quarterly is selected, Billing Month calculates up to a maximum of 4 installments, dividing the month span by 3 without decimals or floor-snapping to the closest quarterly milestone before Plan End.',
    plainLanguage: 'Users configuring billing schedules can now hover over the new info tooltip next to Billing Month to see that it divides the total contract value across the entered months. They can also select the Billing Frequency directly: Bi-Annually sets 2 installments; Monthly counts the total months between start and end dates; and Quarterly automatically calculates the optimal number of quarterly milestones (up to 4) before the plan ends.',
    highlights: [
      'Billing Month Tooltip: Displays "This will break the total value in the entered months" next to all Billing Month labels and contract cards',
      'Billing Frequency Dropdown: Select between Monthly, Quarterly, and Bi Anually with real-time plan term badges',
      'Bi Anually Rule: Automatically sets Billing Month to 2 semi-annual installments',
      'Monthly Rule: Calculates the full month span between Billing Start Date and Plan End Date',
      'Quarterly Rule: Computes month span divided by 3, floor-snapped to closest quarter before plan end (maximum 4 installments)',
      'Independent Per-Contract Frequency: Allows custom frequency selection per corporate entity in split-contract schedules'
    ],
    path: '/client-payments',
    linkText: 'Accounts Receivable'
  },
  {
    id: 'cl-cs-feedback-score-derivation-and-ux-20261031',
    date: '2026-10-31',
    formattedDate: 'Oct 31, 2026',
    page: 'CS',
    subPage: 'Feedback & Escalation / Score Explanation & Topbar Company Selector',
    summary: 'Added topbar corporate selector, streamlined direct form creation, compact table actions, and Score Explanation derivation modal',
    details: 'Added a persistent corporate client switcher dropdown in the top navigation bar with real-time storage event synchronization. Streamlined the "Open Form" flow to directly create pending submissions for the logged-in user under the active company without modal barriers. Enhanced the Share Form modal with Access & Roles user selection, prefilled designations, and corporate division dropdowns. Upgraded the Submissions table with compact Copy, View/Edit icon buttons, and a 3-dots action menu featuring a comprehensive Score Explanation modal detailing the 10-question rubric and mathematical derivation of Overall Satisfaction.',
    plainLanguage: 'CS managers can now switch companies instantly from the top menu bar. Clicking "Open Form" now directly creates and launches the feedback questionnaire in a new tab under the logged-in user with zero intermediate popups. The Share Form modal pulls users and divisions straight from the Corporate tab. In the Feedback table, action buttons are now sleek and compact, featuring a 3-dots menu with a full "Score Explanation" modal that walks through each question score and clearly demonstrates how the Overall Satisfaction rating was calculated.',
    highlights: [
      'Topbar Company Selector: Persistent dropdown on the right side of the top navbar sourcing corporate clients with instant profile synchronization',
      'Direct Open Form: 1-click generation of Pending feedback entries for the logged-in user and active company, directly opening /feedback-form/:id',
      'Streamlined Share Form: Access & Roles recipient selection with corporate role prefill, concise single-line recipient info, and company division dropdown',
      'Compact Table Actions: Replaced wide buttons with Copy icon, View/Edit icon, and a floating 3-dots action menu with smart overflow positioning',
      'Score Explanation Modal: Added 3rd option to the 3-dots menu showing each question, option scores (1-5 & SOW N/A), user selection, and step-by-step arithmetic derivation of Overall Satisfaction'
    ],
    path: '/cs/feedback',
    linkText: 'CS Feedback'
  },
  {
    id: 'cl-cs-feedback-standalone-portal-20261030',
    date: '2026-10-30',
    formattedDate: 'Oct 30, 2026',
    page: 'CS',
    subPage: 'Feedback & Escalation / Client Survey Form',
    summary: 'Launched standalone client survey portal at /feedback-form/:id with shareable links and corporate prefill',
    details: 'Created a clean, dedicated feedback submission portal at /feedback-form/:id powered by ClientFeedbackWizard. Automatically pre-populates HR contact, corporate entity, division, and CS SPOC from the submission record or URL parameters. Features clean step-by-step navigation, direct question rendering without redundant headers, and real-time validation.',
    plainLanguage: 'Corporate clients can now complete their satisfaction evaluation via a distraction-free, branded portal link (/feedback-form/:id). When CS managers share the link, the client HR name, company, and service division are automatically pre-filled. The multi-step wizard guides the client directly through service quality questions without requiring login credentials.',
    highlights: [
      'Dedicated route /feedback-form/:id with standalone clean view outside admin chrome',
      'Direct step-by-step evaluation flow starting immediately on evaluation questions',
      'Auto-resolves company profile, HR SPOC, and assigned CS manager from submission ID or URL query params',
      'Optional SOW exclusion tag ("Not a part of SOW / No session done") for non-subscribed services',
      'Captures additional open improvement suggestions and optional priority callback request'
    ],
    path: '/cs/feedback',
    linkText: 'CS Feedback'
  },
  {
    id: 'cl-cs-feedback-analytics-diagnostics-20261030',
    date: '2026-10-30',
    formattedDate: 'Oct 30, 2026',
    page: 'CS',
    subPage: 'Feedback & Escalation / Submissions & Sentiment',
    summary: 'Added Submissions Directory, CS Satisfaction Index (5.0), Positive Sentiment %, and Diagnostic Tags',
    details: 'Enhanced /cs/feedback with an end-to-end feedback tracking directory. Displays top KPI cards for Total Submissions, CS Satisfaction Index (out of 5.0), Positive Sentiment %, and active Escalation Alerts. Introduces 4 domain-specific diagnostic tags triggered whenever a client marks Neutral (3), Dissatisfied (2), or Very Dissatisfied (1). Supports Sentiment filtering (Positive, Neutral, Low), search, and CSV export.',
    plainLanguage: 'The CS Feedback portal now functions as a complete customer intelligence dashboard. CS leaders can monitor client sentiment in real-time, view the overall Satisfaction Index score, and catch at-risk accounts through Escalation Alerts. When clients rate any service 3 or below, intuitive diagnostic tags capture the exact operational reason (e.g., missed callbacks, slow app load, generic webinar topics), which are stored and exportable to CSV.',
    highlights: [
      'Top analytical cards: Total Submissions, CS Satisfaction Index (0-5.0), Positive Sentiment %, and Escalation Alerts count',
      'Dynamic diagnostic tags on Neutral (3), Dissatisfied (2), and Very Dissatisfied (1) ratings with custom remarks',
      'Submissions Directory with status tracking (Pending vs Submitted), sentiment badges, and detailed inspect drawer',
      'Sentiment filter dropdown (All, Positive, Neutral, Low / Escalation) and full-text search',
      '1-click "Share Feedback Form" modal generating pre-mapped links and instant clipboard copying',
      'CSV export functionality for corporate leadership and QBR presentations'
    ],
    path: '/cs/feedback',
    linkText: 'CS Feedback'
  },
  {
    id: 'cl-admin-per-contract-scheduling-20261029',
    date: '2026-10-29',
    formattedDate: 'Oct 29, 2026',
    page: 'Admin',
    subPage: 'Accounts Receivable / Per-Contract Scheduling',
    summary: 'Enabled independent billing schedules per contract with separate payment terms toggle and order sync',
    details: 'Added capability to configure independent billing schedules for each contract under a client order. When multiple contracts are attached, users can toggle "Add separate schedule for each contract", allowing customized installments, invoicing dates, and billing cycles per contract with instant order synchronization.',
    plainLanguage: 'Orders with multiple contracts (e.g., healthcare + mental wellness) often require different billing cadences. You can now toggle separate schedules for each contract within the same order. Each contract receives its own dedicated billing installment inputs, currency calculation, and due dates, eliminating the need to force all contracts into a single schedule.',
    highlights: [
      'Toggle "Add separate schedule for each contract" in Add Schedule modal',
      'Independent installment breakdown and payment terms for each attached contract',
      'Per-contract value, billing cycle, and dynamic USD calculation',
      'Automatic synchronization with master order records and client invoices ledger'
    ],
    path: '/client-payments',
    linkText: 'Accounts Receivable'
  },
  {
    id: 'cl-admin-unlinked-contracts-duplicate-warning-20261029',
    date: '2026-10-29',
    formattedDate: 'Oct 29, 2026',
    page: 'Admin',
    subPage: 'Accounts Receivable / Unlinked Contracts & Modals',
    summary: 'Added unlinked contract scheduling, rich duplicate schedule warnings, and auto-cascading schedule dates',
    details: 'Enabled direct scheduling of division contracts not yet linked to an order, automatically creating the underlying order reference. Replaced browser alert prompts with a rich custom Duplicate Schedule warning modal. Enhanced live preview with auto-cascading installment dates and auto-balancing percentage splits.',
    plainLanguage: 'You can now schedule invoices for contracts directly from Accounts Receivable even before an order is placed. If a schedule already exists, a clean warning modal alerts you instead of raw browser popups. In addition, changing an installment date automatically cascades down to subsequent monthly installments, and editing percentages rebalances remaining rows seamlessly.',
    highlights: [
      'Schedule unlinked contracts directly from the Accounts Receivable "Add Schedule" flow',
      'Automatic order generation and contract linking upon schedule creation',
      'Custom Duplicate Schedule Warning modal replacing default browser alerts',
      'Auto-cascading installment dates: adjusting an invoice date smoothly shifts subsequent monthly dates',
      'Modal stability improvements: fixed width jitter on billing month selection, Escape key and backdrop dismissal'
    ],
    path: '/client-payments',
    linkText: 'Accounts Receivable'
  },
  {
    id: 'cl-global-navbar-company-filter-20261029',
    date: '2026-10-29',
    formattedDate: 'Oct 29, 2026',
    page: 'Home',
    subPage: 'Navigation & Filters / Global UX',
    summary: 'Relocated Logged In user badge to top white navbar and refined single-company selector',
    details: 'Moved the Logged In profile badge to the universal top white header across all screens for consistent user identity display. Streamlined the company selection dropdown above user context, removing redundant All options and maintaining persistent client scoping across portal views.',
    plainLanguage: 'The user profile and session indicator has been moved up into the primary top navigation bar, keeping page headers cleaner and consistent across both CS and Admin tools. The company filter dropdown was also streamlined to focus directly on specific corporate accounts.',
    highlights: [
      'Universal Logged In user profile badge integrated into the top sticky navigation header',
      'Cleaner page headers without cluttered session chips',
      'Refined company dropdown selector for focused single-client filtering',
      'Preserved role indicators (Admin, CS SPOC) across all active workspaces'
    ],
    path: '/home',
    linkText: 'Home Page'
  },
  {
    id: 'cl-admin-division-order-contracts',
    date: '2026-10-28',
    formattedDate: 'Oct 28, 2026',
    page: 'Admin',
    subPage: 'Division & Orders / Contract Option',
    summary: 'Created Contract Option in Division & Orders with Onboarding entity selection, live USD calculation, and auto bank links',
    details: 'Introduced contract options connected between Admin Division and Orders. Supports selecting company from Onboarding form or entering custom company, tax, and address details, along with contract value, currency exchange rate, live Amount in USD, Bill From, Receiving Bank Name, Billing Date, and auto-populated bank details link.',
    plainLanguage: 'Teams can now configure and manage commercial contracts directly within Admin Division and connect them to Orders (mirroring the Document workflow). The new Contract modal enables picking client entities from the Onboarding form or adding custom company details with Tax/GST and registered addresses. Financial terms including Contract Value, Currency, Exchange Rate, live USD Amount conversion, Payment Due days, Bill From entity, Receiving Bank, Billing Date, and verified Bank Details Drive links with 1-click copy are seamlessly maintained and linked to Orders.',
    highlights: [
      'Entity Selection: Pick from Onboarding form companies or add custom company name, tax/GST, and registered address',
      'Financial Fields matching specification: Contract Value, Currency, Exchange Rate, and Payment Due days with descriptive tooltips',
      'Dynamic Amount in USD calculation box updating in real-time as values or currencies change',
      'Auto-populated Google Drive Bank Details link based on selected Bill From entity, Receiving Bank, and Currency with 1-click copy',
      'Division Contracts section in Edit Division with create, edit, view, and delete capabilities',
      'Contract Connect modal in Add / Edit Order allowing 1-click attachment of existing division contracts or immediate creation of new contracts',
      'Bidirectional order linking with division_contracts synchronization in localStorage'
    ],
    path: '/edit-division',
    linkText: 'Edit Division'
  },
  {
    id: 'cl-cadence-onetime-option',
    date: '2026-10-28',
    formattedDate: 'Oct 28, 2026',
    page: 'CS',
    subPage: 'Client Cadence / One-Time Scheduling',
    summary: 'Added "One time" cadence option without RRULE recurrence or end conditions',
    details: 'Added a "One time" frequency option to the Cadence Scheduler. Directly configures start date, start time, and duration without generating or sending RRULE, and omits the recurrence ending condition.',
    plainLanguage: 'Customer Success managers can now schedule single, non-recurring meetings via the Schedule Cadence modal. By selecting "One time", users simply choose the start date, start time, timezone, and duration. The system automatically omits the RRULE parameter and hides the recurrence ending condition section, creating a single calendar event with Google Meet / conference link and attendee synchronization.',
    highlights: [
      'Added "One time" button in Frequency & Recurrence Pattern section',
      'Start Date, Start Time, Timezone, and Duration controls fully preserved for single event booking',
      'Recurrence Ending Condition (Section 4) is hidden and not required for One-time meetings',
      'Payload excludes RRULE and creates a single calendar occurrence without recurring rules',
      'Preview and confirmation states clearly identify one-time meetings'
    ],
    path: '/cs/cadence',
    linkText: 'Client Cadence'
  },
  {
    id: 'cl-cadence-mom-workflow',
    date: '2026-10-28',
    formattedDate: 'Oct 28, 2026',
    page: 'CS',
    subPage: 'Client Cadence / Minutes of Meeting (MOM)',
    summary: 'Minutes of Meeting (MOM) capture on completion with Skip, View, and Edit options',
    details: 'Clicking "Mark Done" opens a dedicated MOM modal to capture summary, action items, decisions, and attendees. Supports skipping to add later, with "View MOM" and "Edit" badges on completed meetings.',
    plainLanguage: 'Customer Success teams can now document meeting outcomes seamlessly. When clicking "Mark Done", an interactive Minutes of Meeting modal prompts for key discussions, action items, and decisions. If you need to complete the meeting quickly, click "Skip for now & Complete"—a "MOM Pending" badge with "+ Add MOM" button appears so you can add it later. Completed meetings with MOM feature a "View MOM" modal with 1-click editing.',
    highlights: [
      'Interactive Minutes of Meeting (MOM) modal triggered on clicking "Mark Done"',
      'Fields for Meeting Summary, Action Items & Follow-ups, Key Decisions, and Attendees Present',
      '"Skip for now & Complete" option allowing CS SPOCs to complete meetings immediately and add MOM later',
      '"View MOM" modal with structured cards and 1-click toggle to edit saved details',
      'Dynamic "MOM Added" (blue) and "MOM Pending" (amber) status chips on completed meeting cards'
    ],
    path: '/cs/cadence',
    linkText: 'Client Cadence'
  },
  {
    id: 'cl-cadence-filters-next-7-days',
    date: '2026-10-28',
    formattedDate: 'Oct 28, 2026',
    page: 'CS',
    subPage: 'Client Cadence / Metric Filters & Next 7 Days',
    summary: 'Interactive top metric card filtering, Next 7 Days scope, and Reminder Email dispatch',
    details: 'Top metric cards now filter timeline and cadence data with active indicators. Replaced Google Meet branding on Upcoming Meetings with "Next 7 days" scope, and added "Send Reminder Email" button.',
    plainLanguage: 'Clicking any of the top 4 metric cards (Active Cadences, Upcoming Meetings, Weekly Recurring, Calendar API Status) instantly filters the timeline and master logs with an active filter bar. The Upcoming Meetings card now focuses on the "Next 7 days", filtering occurrences to the next 7 days. Added a dedicated "Send Reminder Email" button alongside "Send Acceptance Email" to notify attendees with date, time, and video meeting links.',
    highlights: [
      'Clickable top metric cards to filter Active Cadences, Next 7 Days, Weekly Recurring, or Activity Logs',
      'Replaced Google Meet card subtitle with "Next 7 days", scoping timeline occurrences to today through next 7 days',
      'Platform-agnostic conference link labels and tooltips in preparation for upcoming Microsoft Teams integration',
      'Dedicated "Send Reminder Email" button to notify all participants about upcoming meetings with joining links',
      'Active filter badge with single-click "Clear Filter" reset'
    ],
    path: '/cs/cadence',
    linkText: 'Client Cadence'
  },
  {
    id: 'cl-cs-cadence-routing-fix',
    date: '2026-10-28',
    formattedDate: 'Oct 28, 2026',
    page: 'CS',
    subPage: 'CS Portal / Client Cadence Workspace Routing',
    summary: 'Standardized Client Cadence route to /cs/cadence and restored CS Sidebar context',
    details: 'Updated workspace links to /cs/cadence and added automatic redirection from /cadence, ensuring the CS Portal navigation sidebar is always displayed instead of the Admin menu.',
    plainLanguage: 'Previously, opening the Client Cadence workspace routed to /cadence, which caused the left sidebar to show the Admin navigation menu. The workspace path is now standardized to /cs/cadence across the CS Portal, Sidebar, and Live Workspaces, with automatic redirection and proper CS Portal sidebar rendering.',
    highlights: [
      'Updated Client Cadence path to /cs/cadence in CS Portal, Sidebar, and Live Workspaces',
      'Automatic redirect from /cadence to /cs/cadence',
      'Fixed sidebar context detection so CS Portal navigation menu (Summary, Engagement, ROI) is properly shown'
    ],
    path: '/cs/cadence',
    linkText: 'Client Cadence'
  },
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
