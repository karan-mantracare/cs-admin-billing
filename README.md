# MantraCare Admin & Customer Success (CS) Payment Operations Hub

An enterprise-grade operational management platform uniting **Customer Success (CS)** workflows, **Accounts Receivable (AR) & Billing Schedules**, **Corporate Client Governance**, and **Trainer & Webinar Session Settlement** into a unified single-page application.

---

## 🌟 Executive Summary

The platform provides end-to-end tooling for enterprise healthcare and wellness operations:
- **Accounts Receivable (AR)**: Automated and customized billing schedules, multi-contract billing, flexible monthly and annual schedules, multi-currency conversion (USD, INR, EUR), and automated payment reminders.
- **Customer Success (CS)**: 12-dimension client evaluation rubric, 4-tier Support Escalation Protocol with direct role mailto reachout links, dedicated `/feedback-form/:id` standalone survey portal, and client communication cadence governance.
- **Webinar & Expert Management**: Interactive calendar, trainer allocation, and session settlement via a 5-row symmetrical session details modal featuring inline duration editing, 10-digit participant count tracking, and one-click expense reconciliation.
- **Corporate & Division Portals**: Multi-entity corporate hierarchies, division contract mapping, onboarding wizards, and role-based access management.
- **Financial Controls & P&L**: Expense approval pipelines, budget vs. actual spend tracking, and corporate profitability analysis.

---

## 📑 Core Modules & Architecture

### 1. Accounts Receivable & Billing Schedules (`/client-payments`)
- **2-Step Schedule Creation Wizard**:
  - **Step 1 (Order Scoping)**: Select Corporate Client, Division, and associated Master Order.
  - **Step 2 (Schedule Configuration)**: Expandable Total Order Value accordion, master & per-contract Billing Frequency selection, dynamic month calculations, and responsive contract table.
- **Flexible Billing Cadence**:
  - **Monthly**: Dynamically calculates the month span between Billing Start Date and Plan End Date as default, while allowing users to customize installments capped at that term (defaults to 1 if plan end is unavailable).
  - **Annually**: Configures 1 installment per year on a 12-month schedule cadence.
  - **Quarterly & Bi-Annually**: Automated milestone generation (Quarterly up to 4 installments; Bi-Annually fixed at 2 installments).
- **Validation & Disabling Controls**: Warns when installment count exceeds plan term, displaying error banners and disabling Preview/Save actions to prevent invalid billing commitments.
- **Ledger Management**: Status indicators for Scheduled, Due, Paid, and Overdue milestones with one-click payment reminder copy tools and remarks preview tooltips.
- **Payment Records & Change Request Workflow**: Dedicated ACTIONS column on Payment Records with modal workflow to submit, track, and withdraw "Change" or "Delete" requests with mandatory justifications.

### 2. Customer Success & Feedback Governance (`/cs/feedback`, `/feedback-form/:id`)
- **12-Dimension Evaluation Rubric**: Comprehensive evaluation covering:
  1. Onboarding & Implementation
  2. CS Support & Responsiveness
  3. Employee Awareness & Engagement
  4. 24/7 Helpline & Crisis Access
  5. Mobile & Web Application Usability
  6. Technical Troubleshooting
  7. Healthcare & Wellness Service Quality
  8. Utilization & Analytics Reporting
  9. 1-on-1 Consultations (Therapy / Medical)
  10. Corporate Webinars & Workshops
  11. Issue Escalation Resolution Speed
  12. Overall Program Satisfaction & NPS
- **Dynamic Diagnostic Tags**: Activated automatically when a client provides a Neutral (3), Dissatisfied (2), or Very Dissatisfied (1) rating to log root-cause issues.
- **4-Tier Support Escalation Protocol**:
  - **Tier 1 (CS SPOC)**: Basic inquiries & session queries (Acknowledgment: < 2 hrs | Resolution: < 24 hrs).
  - **Tier 2 (CS Manager)**: Operational delays & trainer adjustments (Acknowledgment: < 1 hr | Resolution: < 12 hrs).
  - **Tier 3 (Head of Operations & BD SPOC)**: Service interruptions & SLA breaches (Acknowledgment: < 30 mins | Action Plan: < 6 hrs).
  - **Tier 4 (Founder / CEO)**: Contractual disputes & executive escalations (Immediate acknowledgment | Resolution: < 4 hrs).
  - Direct `<Role> > Contact` email links connecting stakeholders straight to designated points of contact.
- **Qualitative Insights**: Dual structured response fields for *"What is working well?"* and *"What is the one improvement you would like us to prioritize?"* with rapid-insert suggestion tags.
- **Score Derivation Modal**: Accessible via the 3-dots table action menu, providing mathematical breakdown of individual question scores into the composite CS Satisfaction rating.

### 3. Webinar Session Editor & Expense Settlement (`/edit`, `/calendar`)
- **Webinar Event Orchestration**: Configure corporate workshops, set dates/times, assign experts, establish session budgets, and track attendance.
- **Expert Details Settlement Flow**:
  - When clicking the checkmark/tick action in the Expert Details table, a structured **5-Row Symmetrical 2-Column Modal** appears:
    - **Row 1**: Session Date | Approved on
    - **Row 2**: Session Name | Session Time
    - **Row 3**: Session Type (Static: "Webinar") | Duration (with inline pencil edit toggle)
    - **Row 4**: Provider ID | Price (USD)
    - **Row 5**: Session Service (dropdown: Therapy, Yoga, Mindfulness, Meditation) | Participant Count (editable number field up to 10 digits)
  - Features a dedicated **Payout Disclaimer**: *"When you click on confirm & settle the provider will be paid for this session."*
  - Submitting the modal auto-saves the updated duration, selected service, and attendee count, marks the session as Completed, and transitions the linked expense to Settled.

### 4. Sensitive Cases & Manager Referral Portal (`/corporate/sensitive-cases`, `/home`, `/referral-form`)
- **Corporate Sensitive Cases Hub**: Specialized clinical crisis management and employee assistance program (EAP) operations.
  - **Manager Referral Tab**: Division ID (hyperlinked to division overview), Manager Name, Member Name, Primary Reason, Urgency Level, Status dropdown, inline editable remarks, View modal, and Mark as Highest Priority checkbox.
  - **Critical Cases Tab**: Dedicated **SOURCE** column (`Hotline Call` | `1 on 1 Session`), SLA response tracking, crisis category, assigned crisis lead, and emergency de-escalation timeline.
  - **Collapsible Form Details**: Detail inspect modal defaults to collapse mode, smoothly expanding to reveal complete manager profile, employee contact info, support needs, and clinical remarks.
  - **Division-Mapped Referral Links**: Interactive link sharing tool that automatically maps to single corporate divisions or presents a division selector, generating persistent `/referral-form?divisionId=...` public intake forms.
  - **Report for Sensitive Cases**: Inbound crisis intake modal in CS Home featuring top **Source** selection (`Hotline Call` / `1 on 1 Session`) with dynamic disabling of Caller Number on sessions.

### 5. Corporate Accounts & Divisions (`/corporate`)
- Multi-tier corporate entity structure supporting parent enterprises and independent regional/functional divisions.
- Contract attribution mapping orders to multiple contract scopes with independent currency, start/end dates, and billing terms.
- Automated client onboarding wizard (`/client-onboarding`) capturing HR contacts, company details, and service scopes.

### 6. Financial Operations & Profitability (`/expense-approval`, `/expense-tracker`)
- **Expense Approval Queue**: Validates trainer claims, verifies session completion, compares actual cost against pre-authorized budget, and records manager sign-offs.
- **Client P&L Tracker**: Real-time margin analytics comparing contract revenue against trainer fees and operational expenses.

### 7. Central Change Log & Portal Hub (`/`)
- Interactive enterprise dashboard providing instant access to all CS and Admin tools.
- Real-time **Change Log Table** categorizing recent product releases by date, module, and plain-language summaries with deep-linking directly to target workflows.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | [React 19](https://react.dev/) (Hooks, Context, Functional Components) |
| **Bundler & Dev Server** | [Vite 8](https://vitejs.dev/) with Fast HMR |
| **Routing** | [React Router v7](https://reactrouter.com/) |
| **Recurrence Engine** | [rrule](https://github.com/jakubroztocil/rrule) (Recurrence rules for recurring webinar cadences) |
| **Icons & Typography** | [Boxicons](https://boxicons.com/) |
| **Styling** | Modern CSS-in-JS inline responsive designs & modular utility styles |
| **Code Quality** | [Oxlint](https://oxc.rs/) for high-speed JS/JSX static analysis |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or pnpm / yarn)

### Installation
Clone the repository and install dependencies:
```bash
git clone git@github.com:karan1308/Admin-CS-Payment.git
cd Admin-CS-Payment
npm install
```

### Development
Start the local development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### Production Build
Build optimized production bundles to the `dist/` directory:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

### Linting & Code Quality
Run high-speed static code checks with Oxlint:
```bash
npm run lint
```

---

## 📁 Repository Structure

```text
Admin-CS-Payment/
├── index.html                   # HTML entry point with Boxicons integration
├── package.json                 # Dependencies and scripts (React 19, Vite, Oxlint)
├── vite.config.js               # Vite build configuration
├── src/
│   ├── App.jsx                  # Main application router and universal navbar
│   ├── main.jsx                 # Application bootstrapping
│   ├── index.css                # Global styles and typography resets
│   ├── components/              # Modular UI components & modals
│   │   ├── AddScheduleModal.jsx         # 2-step billing schedule wizard
│   │   ├── ClientFeedbackWizard.jsx     # 12-question feedback portal wizard
│   │   ├── ClientOnboardingWizard.jsx   # Corporate client onboarding workflow
│   │   ├── EditPaymentModal.jsx         # Payment adjustment modal
│   │   ├── ApprovalModal.jsx            # Multi-level approval dialog
│   │   └── ...
│   ├── data/                    # Seed data & centralized stores
│   │   ├── changelogData.js             # Universal system change logs
│   │   ├── feedbackQuestions.js         # 12-dimension rubric & escalation tiers
│   │   └── ...
│   └── pages/                   # Application views
│       ├── Home.jsx                     # Hub portal with Change Log & search
│       ├── ClientPayments.jsx           # Accounts Receivable ledger
│       ├── EditWebinar.jsx              # Webinar editor & 5-row settlement modal
│       ├── CsFeedback.jsx               # Feedback analytics & Escalation table
│       ├── ClientFeedbackPage.jsx       # Standalone survey portal (/feedback-form/:id)
│       ├── Corporate.jsx                # Corporate accounts & divisions
│       ├── ExpertAssignment.jsx         # Trainer allocation matrix
│       ├── ExpenseApproval.jsx          # Expense claim verification
│       ├── ExpenseTracker.jsx           # Client P&L and margin reporting
│       ├── HrDash.jsx                   # HR approvals and calendar
│       └── ...
└── README.md                    # Project documentation
```

---

## 📋 Recent Highlights & Changelog

### Nov 21, 2026: Sensitive Cases Portal & CS Home Hotline / Session Intake
- Added the **Sensitive Cases** hub under Corporate in the Admin Portal with two dedicated tabs: **Manager Referral** and **Critical cases**.
- Implemented real-time case triage, division mapping, pagination (10-100), inline editable remarks, and a collapsible **Complete Form Details** modal.
- Added **Report for Sensitive Cases** in CS Home featuring top **Source** radio buttons (**Hotline Call** | **1 on 1 Session**), dynamically disabling **Caller Number** when 1 on 1 Session is selected.
- Added a dedicated **SOURCE** column in the Critical Cases table with color-coded badges and icons.
- Replaced the admin "New Manager Referral" button with the **Manager Referral** division link generator matching the CS Home flow.

### Nov 21, 2026: Workspace Overviews & Workflows Default Collapse
- Configured **Customer Success (CS) Workflows** and **Admin Portal Workflows** on the Home dashboard to be collapsed by default.
- Configured **Test & Telemetry Preview** and **What We Are Doing In This Project** in module summary workspaces to be collapsed by default ("Always Collapse") with clean expand/collapse chevron toggles.

### Nov 21, 2026: Invoice Tax Simplification & Payment TDS Deduction
- Streamlined **Manage Invoice** modal to retain only **Tax %** and **Tax Amount**, removing redundant tax fields.
- Updated **Add Payment** modal to permit entering the TDS deduction amount strictly when the TDS checkbox is enabled in payment currency.

### Nov 20, 2026: Add Invoice Schedule Division Order Discovery & Auto-Resolution
- Fixed an issue where selecting a Division in the Add Invoice Schedule modal displayed *"No existing orders found for this division"* due to overly strict corporate name matching against orders.
- Ensured orders matching a selected division (by name or ID) are immediately found and listed in the Order dropdown.
- Single-order divisions now automatically select the order and pre-fill plan dates, order names, and billing terms.

### Nov 20, 2026: Payment Summary Modal Action Icons & Schedule Builder Integration
- Replaced the bulky "View Payment Schedule" and "View Billing Schedule" text buttons with sleek, color-coded icon action buttons with browser tooltips.
- Added a new **Create Billing Schedule** (`bx-calendar-plus`) icon button directly in the Payment Summary footer that launches schedule configuration for the active order.
- Made the **View Billing Schedule** (`bx-receipt`) icon conditionally visible only when an existing billing schedule is detected for that order.

### Nov 20, 2026: Invoice Schedule Preview Installment Terms Synchronization
- Fixed an issue where setting Billing Month to multiple installments (e.g., 5 months) in Step 2 of the schedule modal rendered only 1 invoice in the preview modal.
- Ensured 2-way synchronization between `formData.paymentTerms` and per-contract `separateTerms` across single-contract and multi-contract flows.
- Guaranteed preview accurately calculates and displays all configured invoice installment rows with auto-balanced split percentages.

### Nov 13, 2026: Payment Records Action Column & Change Request Workflow
- Added an **ACTIONS** column to the Payment Records ledger table with an edit pencil icon and non-wrapping button.
- Added **Request Change** modal supporting both horizontal **Change** and **Delete** request type cards.
- Dynamic field requirements: **Reason for deletion** (on Delete) or **Update Amount** (numeric field) + **Reason for change** (on Change).
- Persistent request status badges ("Change Requested", "Delete Requested") with option to withdraw requests.

### Nov 13, 2026: Symmetrical Webinar Session Settlement Modal & Session Service
- Replaced basic confirmation alerts with a realigned 5-row, 2-column symmetrical session details modal:
  - **Row 1**: Session Date | Approved on
  - **Row 2**: Session Name | Session Time
  - **Row 3**: Session Type (Static: "Webinar") | Duration (with inline edit pencil)
  - **Row 4**: Provider ID | Price (USD)
  - **Row 5**: Session Service (dropdown: Therapy, Yoga, Mindfulness, Meditation) | Participant Count (editable up to 10 digits)
- Added **Payout Disclaimer banner**: *"When you click on confirm & settle the provider will be paid for this session."*
- Completing the modal automatically updates event duration, service, sets attendee count, marks status as Completed, and marks expense as Settled.

### Nov 06, 2026: Flexible Monthly & Annual Billing Schedules
- **Flexible Monthly Billing**: Calculates start-to-end month span as default and allows user customization up to that maximum (defaults to 1 if plan end is unavailable).
- **Annual Billing**: Added `Annually` billing frequency providing 1 installment per year on a 12-month cadence.
- **Table Simplification**: Removed redundant "Same for all Contracts" switcher in favor of a clean per-contract schedule configuration table.

### Nov 05, 2026: 12-Dimension CS Feedback & 4-Tier Escalation Protocol
- Upgraded CS Feedback questionnaire to **12 standardized evaluation dimensions** with diagnostic tags.
- Replaced generic escalation text with a **4-tier Support Protocol table** featuring explicit acknowledgment/action TATs and direct role reachout email links.
- Introduced structured qualitative open response textareas for positive highlights and priority improvements.

---

## 🔒 Security & Data Integrity
- Strict validation prevents installment schedules from exceeding contractual plan terms.
- Local storage state management ensures synchronized company scoping across all tabs and portal routes.
- Modular component boundaries prevent unintended cascading state mutations.

---

## 📄 License

This repository is proprietary and confidential to MantraCare. All rights reserved.
