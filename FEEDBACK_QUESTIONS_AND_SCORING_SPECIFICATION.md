# Customer Success (CS) Feedback Framework, Scoring Logic & Escalation Protocol

> **Document Status**: Draft for Internal Team Review & Vetting  
> **Prepared For**: Customer Success, Operations, and Product Leadership  
> **System Reference**: MantraCare CS Admin Portal (`/cs/feedback` & `/feedback-form/:id`)  
> **Last Updated**: October 2026  

---

## 1. Why This Document Is Needed (Executive Summary)

### Context & Objective
To maintain high enterprise client retention and deliver consistently exceptional healthcare services, our Customer Success and Operations teams require an objective, data-driven feedback mechanism. This document details the **10-pillar client evaluation framework**, the **scoring matrix**, the **suggested replies/diagnostic tags**, and the exact **mathematical algorithms** used to compute **Positive Sentiment** and trigger **Escalation Alerts**.

### Key Business Objectives for Team Vetting
1. **Standardized Quality Assessment**: Eliminates subjective client health assessments by replacing anecdotal reviews with standardized 1-to-5 point quantitative evaluations across all service touchpoints.
2. **Actionable Diagnostics via Suggested Replies**: Instead of ambiguous negative feedback, clients who indicate dissatisfaction are provided targeted, pre-defined operational tags (e.g., *"Scope of services mismatched"*, *"Pickup delays during peak hours"*, *"Scheduled callback delayed"*). This immediately isolates root causes for internal resolution.
3. **Automated Risk Early-Warning**: Automatically flags deteriorating client accounts before quarterly business reviews (QBRs) or renewal cycles by triggering **Escalation Alerts** when composite scores drop below defined SLA thresholds.
4. **Alignment Across Stakeholders**: Ensures sales (BD), account management (CS), product/tech, clinical operations, and helpline dispatch share identical definitions of quality, escalation triggers, and sentiment health.

---

## 2. Feedback Questions & Scoring Matrix

Each feedback evaluation assesses 12 core operational dimensions.

* **Rating Scale**: 
  * **Rating 5**: Very satisfied / Fully met/exceeded (`5 Points`)
  * **Rating 4**: Satisfied / Met with minor gaps (`4 Points`)
  * **Rating 3**: Neutral / Partially met (`3 Points`)
  * **Rating 2**: Dissatisfied / Major gaps (`2 Points`)
  * **Rating 1**: Very dissatisfied / Not delivered (`1 Point`)
  * **N/A**: Not a part of SOW / No session done (`Excluded from average; permitted on Questions 1–11`)

### Master Questions Table (12 Dimensions)

> **Behavior Rules for Suggested Answers (Diagnostic Tags)**:
> 1. **Trigger Conditions**: The suggested diagnostic tags appear whenever a user selects **`Neutral` (Score 3)**, **`Dissatisfied` (Score 2)**, or **`Very dissatisfied` (Score 1)**. They do **not** appear if the user selects `Very satisfied` or `Satisfied`.
> 2. **Multi-Select & Free-Text**: Users can tap multiple tags and/or type custom notes.

| Q No. | Feedback Area | Question for HR | Rating | Reasons for ratings 1, 2 and 3 (Diagnostic Tags) | Score for Each Response Option | Impact on Total Score | When Feedback is GOOD | When to Mark URGENT | Escalation / Action Required | Priority Classification Guidance |
| :---: | :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Q1** | **Onboarding & delivery** | *How well was the program implemented against the agreed scope and timelines?* | 1–5 / N/A | • Scope or services differed from what was agreed<br>• Delayed onboarding or kickoff<br>• Promised services or deliverables were missing<br>• Billing or pricing communication was unclear | 5 = Fully met/exceeded<br>4 = Met with minor gaps<br>3 = Partially met<br>2 = Major gaps<br>1 = Not delivered / materially off-scope<br>N/A = Excluded | Each valid rating contributes equally: average of all valid ratings (1 of 12 scored items). | Rating 4–5, with scope, timelines and deliverables substantially met. | Rating 1, or a critical contractual/service gap that blocks launch or delivery. | Escalate rating 1 to the program owner and account lead immediately; rating 2 to the owner for a dated corrective action plan. | High priority if launch, contractual scope, compliance or material delivery is affected. |
| **Q2** | **CS support** | *How satisfied are you with the CS team's responsiveness, communication and proactive support?* | 1–5 / N/A | • Slow response to emails or queries<br>• Lack of proactive follow-ups<br>• Escalations remained unresolved<br>• Infrequent status updates or review meetings | 5 = Consistently proactive and responsive<br>4 = Responsive with minor delays<br>3 = Adequate/inconsistent<br>2 = Slow or reactive<br>1 = Unresponsive / unresolved critical concerns<br>N/A = Excluded | Equal-weight item: included in overall average only when a 1–5 rating is provided. | Rating 4–5 and no unresolved high-impact concern. | Rating 1, or a critical client concern remains unanswered beyond the agreed SLA. | Rating 1: immediate account-lead review. Rating 2: CS manager review and documented recovery action. | Escalate repeated missed commitments, unresolved complaints or risk to client relationship. |
| **Q3** | **Employee awareness & access** | *How effectively are employees informed about and able to access the services?* | 1–5 / N/A | • Limited employee awareness of services<br>• Insufficient communication or promotional material<br>• Employees unclear about how to access services<br>• Low participation despite communication | 5 = Employees clearly informed and access easily<br>4 = Good awareness with minor gaps<br>3 = Mixed awareness/access<br>2 = Significant access or awareness gaps<br>1 = Most employees cannot understand/access services<br>N/A = Excluded | Equal-weight item in overall average; N/A is not counted. | Rating 4–5 and no widespread access barrier. | Rating 1, or a widespread access barrier prevents employees from using the service. | Escalate systemic access issues to operations/product; agree communication or access fix and owner. | Urgent when access failure affects a large employee group or prevents service utilization. |
| **Q4** | **Hotline support** | *How would you rate the accessibility and responsiveness of the employee support hotline?* | 1–5 / N/A | • Long wait time before calls were answered<br>• Frequent dropped or disconnected calls<br>• Hotline availability was limited<br>• Delays during peak hours | 5 = Easily reachable and timely<br>4 = Minor delays<br>3 = Sometimes difficult to reach<br>2 = Frequent delays/dropped calls<br>1 = Unavailable or consistently failing<br>N/A = Excluded | Equal-weight item in overall average; N/A is not counted. | Rating 4–5 with reliable availability and response. | Rating 1, or hotline outage / repeated inability to reach support. | Notify service operations immediately for outage or repeated call failures; provide workaround and restoration ETA. | Treat prolonged outage or inability to reach urgent support as critical. |
| **Q5** | **App experience** | *How easy is the app for employees to access, navigate and use?* | 1–5 / N/A | • Login or OTP verification issues<br>• App performance or slow loading<br>• Navigation was confusing<br>• Features were difficult to use | 5 = Seamless and intuitive<br>4 = Easy with minor friction<br>3 = Usable but some friction<br>2 = Frequent usability issues<br>1 = App unusable for core tasks<br>N/A = Excluded | Equal-weight item in overall average; N/A is not counted. | Rating 4–5 and no material barrier to core user journeys. | Rating 1, or a widespread app failure blocks sign-in or core service access. | Route technical defects to product/engineering; communicate workaround, owner and target fix date. | Escalate widespread or recurring defects, especially those affecting service access. |
| **Q6** | **Technical support** | *How effectively are app, login or access-related technical issues resolved?* | 1–5 / N/A | • Delayed resolution of technical issues<br>• Login or access issues remained unresolved<br>• Unclear troubleshooting instructions<br>• Recurring technical issues | 5 = Resolved quickly and permanently<br>4 = Resolved with minor delay<br>3 = Resolved but inconsistently<br>2 = Slow / recurring unresolved issues<br>1 = Critical issue unresolved or no support<br>N/A = Excluded | Equal-weight item in overall average; N/A is not counted. | Rating 4–5 and no recurring unresolved technical issue. | Rating 1, security/privacy concern, or an outage preventing access for multiple users. | Immediately route security/privacy incidents through designated incident process; other critical failures to technical lead. | Security/privacy concerns and broad outages require immediate escalation irrespective of average score. |
| **Q7** | **Service experience** | *Based on employee feedback, how would you rate the quality and relevance of the services?* | 1–5 / N/A | • Services did not meet employee expectations<br>• Quality of services was inconsistent<br>• Limited service options or accessibility<br>• Mixed employee feedback | 5 = Consistently high-quality and relevant<br>4 = Good quality/relevance<br>3 = Mixed<br>2 = Often below expectations<br>1 = Consistently poor / unsuitable<br>N/A = Excluded | Equal-weight item in overall average; N/A is not counted. | Rating 4–5 and feedback indicates services meet employee needs. | Rating 1, or credible report of unsafe, inappropriate or materially poor service. | Escalate quality/suitability concerns to service owner; follow safeguarding or incident protocol for safety-related reports. | Safety, professional-conduct or safeguarding concerns are critical regardless of rating. |
| **Q8** | **Utilization & reporting** | *Are utilization reports and insights timely, clear and useful?* | 1–5 / N/A | • Reports were delayed or incomplete<br>• Data or metrics were unclear<br>• Reports lacked actionable insights<br>• Limited service-wise or department-wise analysis | 5 = Timely, accurate and actionable<br>4 = Clear and timely with minor gaps<br>3 = Adequate but limited insight<br>2 = Delayed/incomplete or unclear<br>1 = Materially inaccurate/missing reporting<br>N/A = Excluded | Equal-weight item in overall average; N/A is not counted. | Rating 4–5 and reporting is accurate, timely and useful. | Rating 1, material data discrepancy, or repeated missed reporting deadline affecting decisions. | Escalate data integrity issues to reporting owner; validate source data and issue corrected report with timeline. | Escalate suspected privacy breach or material data integrity issue immediately. |
| **Q9** | **1-on-1 individual sessions** | *Were individual sessions timely, useful, confidential and delivered by suitable experts?* | 1–5 / N/A | • Limited expert slot availability<br>• Experts rescheduled or cancelled sessions<br>• Consultation quality was inconsistent<br>• Mixed employee feedback | 5 = Timely, useful, confidential and well-matched<br>4 = Good with minor scheduling gaps<br>3 = Mixed experience<br>2 = Frequent delays/cancellations or quality concerns<br>1 = Serious service failure / confidentiality concern<br>N/A = Excluded | Equal-weight item in overall average; N/A is not counted. | Rating 4–5 and no confidentiality, suitability or repeated scheduling concern. | Rating 1, confidentiality breach, safeguarding concern, or report of immediate risk to an individual. | Route confidentiality/safeguarding concerns through authorized clinical/privacy escalation pathway immediately; do not put sensitive case details in this HR score sheet. | Clinical safety, confidentiality and safeguarding concerns override numeric score and require restricted handling. |
| **Q10** | **Webinar topics & variety** | *Were webinar topics relevant to employees and varied enough?* | 1–5 / N/A | • Topics were too generic or repetitive<br>• Topics did not resonate with workforce needs<br>• More specialized wellness themes were needed<br>• Too few topics to choose from | 5 = Highly relevant and varied<br>4 = Relevant with good variety<br>3 = Some topics resonate<br>2 = Often generic/repetitive<br>1 = Consistently irrelevant<br>N/A = Excluded | Equal-weight item in overall average; N/A is not counted. | Rating 4–5 and topics align with employee needs. | Normally not urgent on its own; urgent only if content is unsafe, discriminatory or materially inappropriate. | Use ratings 1–2 to refresh topic calendar and validate needs with HR; escalate inappropriate content to program owner. | Usually improvement priority, not urgent, unless there is a content safety or conduct concern. |
| **Q11** | **Issue resolution** | *How effectively are queries and escalations resolved?* | 1–5 / N/A | • Delayed query or ticket resolution<br>• Unclear ownership of issues<br>• Lack of regular resolution updates<br>• Repeated issues without corrective action | 5 = Resolved within SLA with clear ownership<br>4 = Resolved with minor delay<br>3 = Resolved but inconsistent<br>2 = Delayed / unclear ownership<br>1 = Critical issue unresolved or repeated failure<br>N/A = Excluded | Equal-weight item in overall average; N/A is not counted. | Rating 4–5 and no overdue high-impact issue. | Rating 1, unresolved high-impact issue beyond SLA, or repeat failure affecting employees/client operations. | Rating 1: immediate escalation to accountable service owner and account lead. Rating 2: corrective action with owner and due date. | Escalate repeat incidents, overdue critical tickets and issues with material employee impact. |
| **Q12** | **Overall satisfaction** | *Overall, how satisfied are you with the program and partnership?* | 1–5 *(Mandatory)* | • Overall service delivery did not meet expectations<br>• CS support needs improvement<br>• Employee adoption or engagement was low<br>• Overall program value did not meet expectations | 5 = Very satisfied<br>4 = Satisfied<br>3 = Neither satisfied nor dissatisfied<br>2 = Dissatisfied<br>1 = Very dissatisfied | Equal-weight item in overall average. Summary signal reviewed alongside service-specific ratings. | Rating 4–5 and no urgent trigger in any other response. | Rating 1, or rating 2 together with a specific material unresolved concern. | Rating 1: account lead/CS manager review. Compare with detailed ratings and open feedback before agreeing recovery plan. | A low overall score should trigger a review; do not use it as the only basis for escalation. |

---

### Additional Open Feedback & Suggested Replies
In addition to the 10 rating pillars, the survey captures general recommendations and an explicit callback request:

* **General Suggestion Quick-Add Tags** (Suggested answers for improvements):
  1. `More interactive wellness webinars`
  2. `Faster query response time`
  3. `Enhanced app loading speed`
  4. `Expanded specialist doctor network`
  5. `Detailed monthly employee participation reports`
  6. `Flexible trainer webinar scheduling`
  7. `Custom corporate fitness challenges`
* **Direct Escalation Checkbox**:
  * *"I would like a Customer Success Manager to contact me regarding this feedback"* (`wantsFollowUp: true/false`).

---

## 3. Calculations Logic

### 3.1 Individual Submission Score Calculation

#### 1. Plain-Language & Mathematical Formula
The **Submission Average Score** ($S_i$) represents the overall satisfaction rating of a client organization for a single feedback submission on a standard **1.0 to 5.0 scale**.

$$\text{Submission Average Score } (S_i) = \frac{\text{Total Points Earned across Valid Questions}}{\text{Total Count of Valid Scored Questions}} = \frac{\sum_{q=1}^{N_{\text{valid}}} \text{Points}(r_{i, q})}{N_{\text{valid}}}$$

Where:
* **Points Mapping**:
  * `Very satisfied` = **5 points**
  * `Satisfied` = **4 points**
  * `Neutral` = **3 points**
  * `Dissatisfied` = **2 points**
  * `Very dissatisfied` = **1 point**
  * `Not a part of SOW / No session done` = **Null / 0 points** *(Strictly excluded from both numerator and denominator)*
* **$N_{\text{valid}}$ (The Denominator)**: The number of questions answered with a valid 1–5 rating. Any question marked as *"Not a part of SOW"* or left blank is **completely omitted** so that it does not penalize clients who did not purchase that service.
* **Rounding**: The final average is rounded to **1 decimal place** (e.g., $4.666... \rightarrow 4.7$).

#### 2. Code Reference (`calculateFeedbackScore`)
In `src/pages/CsFeedback.jsx`:
```javascript
const calculateFeedbackScore = (ratingsMap) => {
  if (!ratingsMap) return { score: 0, text: 'N/A' };
  const scoreMap = { 'Very satisfied': 5, 'Satisfied': 4, 'Neutral': 3, 'Dissatisfied': 2, 'Very dissatisfied': 1 };
  let total = 0, count = 0;
  Object.values(ratingsMap).forEach(v => {
    if (scoreMap[v]) {
      total += scoreMap[v];
      count++;
    }
  });
  if (count === 0) return { score: 0, text: 'N/A' };
  const avg = Number((total / count).toFixed(1));
  if (avg >= 4.5) return { score: avg, text: 'Very Satisfied', color: '#166534', bg: '#dcfce7' };
  if (avg >= 3.8) return { score: avg, text: 'Satisfied', color: '#0369a1', bg: '#e0f2fe' };
  if (avg >= 3.0) return { score: avg, text: 'Neutral', color: '#854d0e', bg: '#fef3c7' };
  return { score: avg, text: 'Low / Escalation', color: '#991b1b', bg: '#fee2e2' };
};
```

#### 3. Sentiment Classification Bands
* **Very Satisfied (Positive)**: $S_i \ge 4.5$ (e.g., 4.5 – 5.0)
* **Satisfied (Positive)**: $3.8 \le S_i < 4.5$ (e.g., 3.8 – 4.4)
* **Neutral (Neutral)**: $3.0 \le S_i < 3.8$ (e.g., 3.0 – 3.7)
* **Low / Escalation (Alert Trigger)**: $S_i < 3.0$ (e.g., 1.0 – 2.9)

---

#### 4. Step-by-Step Calculation Examples

##### Example 1: Full-Scope Client with Mixed High Ratings (Positive Sentiment)
A client subscribed to all services submits ratings across all 10 questions:

| Question Pillar | Client Response | Points Earned | Counted in Denominator? |
| :--- | :--- | :---: | :---: |
| Q1. BD Commitment | Very satisfied | 5 | Yes |
| Q2. CS Support | Very satisfied | 5 | Yes |
| Q3. Tech & App Support | Satisfied | 4 | Yes |
| Q4. Hotline Call Quality | Satisfied | 4 | Yes |
| Q5. Hotline Agent Support | Neutral | 3 | Yes |
| Q6. Hotline Ops Response | Satisfied | 4 | Yes |
| Q7. 1-on-1 Sessions | Very satisfied | 5 | Yes |
| Q8. Webinar Topic Variety | Satisfied | 4 | Yes |
| Q9. Webinar Content Quality | Very satisfied | 5 | Yes |
| Q10. Webinar Expert Engagement | Satisfied | 4 | Yes |
| **Totals** | **10 Answers** | **Sum = 43** | **$N_{\text{valid}} = 10$** |

* **Calculation**:
  $$S_i = \frac{5 + 5 + 4 + 4 + 3 + 4 + 5 + 4 + 5 + 4}{10} = \frac{43}{10} = 4.3$$
* **Result**: **4.3 / 5.0**
* **Sentiment Tier**: **`Satisfied`** (Falls in $3.8 \le S_i < 4.5$).
* **Contribution**: Counts as **Positive Sentiment** in corporate metrics.

---

##### Example 2: Client with SOW Exclusions (Helpline & 1-on-1 Not Included)
A corporate client whose contract only covers App Access and Wellness Webinars (no hotline or 1-on-1 clinical sessions):

| Question Pillar | Client Response | Points Earned | Counted in Denominator? |
| :--- | :--- | :---: | :---: |
| Q1. BD Commitment | Very satisfied | 5 | Yes |
| Q2. CS Support | Very satisfied | 5 | Yes |
| Q3. Tech & App Support | Satisfied | 4 | Yes |
| Q4. Hotline Call Quality | *Not a part of SOW* | 0 (Ignored) | **No (Excluded)** |
| Q5. Hotline Agent Support | *Not a part of SOW* | 0 (Ignored) | **No (Excluded)** |
| Q6. Hotline Ops Response | *Not a part of SOW* | 0 (Ignored) | **No (Excluded)** |
| Q7. 1-on-1 Sessions | *Not a part of SOW* | 0 (Ignored) | **No (Excluded)** |
| Q8. Webinar Topic Variety | Very satisfied | 5 | Yes |
| Q9. Webinar Content Quality | Satisfied | 4 | Yes |
| Q10. Webinar Expert Engagement | Very satisfied | 5 | Yes |
| **Totals** | **6 Scored + 4 SOW N/A** | **Sum = 28** | **$N_{\text{valid}} = 6$** |

* **Calculation**:
  $$S_i = \frac{5 + 5 + 4 + 5 + 4 + 5}{6} = \frac{28}{6} \approx 4.666... \rightarrow \mathbf{4.7}$$
  *(Notice: The denominator is **6**, not 10. The 4 non-SOW questions do not distort the score).*
* **Result**: **4.7 / 5.0**
* **Sentiment Tier**: **`Very Satisfied`** (Falls in $S_i \ge 4.5$).
* **Contribution**: Counts as **Positive Sentiment**.

---

##### Example 3: At-Risk Account (Escalation Alert Triggered)
A client with multiple operational bottlenecks during rollout:

| Question Pillar | Client Response | Points Earned | Counted in Denominator? |
| :--- | :--- | :---: | :---: |
| Q1. BD Commitment | Dissatisfied | 2 | Yes |
| Q2. CS Support | Neutral | 3 | Yes |
| Q3. Tech & App Support | Very dissatisfied | 1 | Yes |
| Q4. Hotline Call Quality | Dissatisfied | 2 | Yes |
| Q5. Hotline Agent Support | Neutral | 3 | Yes |
| Q6. Hotline Ops Response | Dissatisfied | 2 | Yes |
| Q7. 1-on-1 Sessions | Dissatisfied | 2 | Yes |
| Q8. Webinar Topic Variety | Neutral | 3 | Yes |
| Q9. Webinar Content Quality | Dissatisfied | 2 | Yes |
| Q10. Webinar Expert Engagement | Neutral | 3 | Yes |
| **Totals** | **10 Answers** | **Sum = 23** | **$N_{\text{valid}} = 10$** |

* **Calculation**:
  $$S_i = \frac{2 + 3 + 1 + 2 + 3 + 2 + 2 + 3 + 2 + 3}{10} = \frac{23}{10} = \mathbf{2.3}$$
* **Result**: **2.3 / 5.0**
* **Sentiment Tier**: **`Low / Escalation`** ($S_i < 3.0$).
* **Contribution**:
  * Triggers an immediate **Escalation Alert** on the CS Admin Dashboard.
  * Dispatches alert to CS SPOC and initiates Tier 3/Tier 4 resolution workflow.

---

### 3.2 Positive Sentiment Calculation Logic

#### Definition
**Positive Sentiment** measures the percentage of surveyed client organizations whose overall operational experience meets or exceeds our quality benchmark ($S_i \ge 3.8 / 5.0$).

#### Formula
$$\text{Positive Sentiment \%} = \left( \frac{N_{\text{Very Satisfied}} + N_{\text{Satisfied}}}{N_{\text{Total Submissions}}} \right) \times 100$$

Where:
* $N_{\text{Very Satisfied}} = \text{Count of submissions where } S_i \ge 4.5$
* $N_{\text{Satisfied}} = \text{Count of submissions where } 3.8 \le S_i < 4.5$
* $N_{\text{Total Submissions}} = \text{Total number of completed feedback submissions}$

#### What Contributes to Positive Sentiment?
1. **Questions & Scores Contributing**:
   * Every question rated **5 ("Very satisfied")** or **4 ("Satisfied")** directly pulls the arithmetic average $S_i$ into the positive band ($\ge 3.8$).
   * A submission where all 10 questions are rated "Satisfied" (4.0) achieves a score of **4.0/5.0**, qualifying as **Positive Sentiment**.
   * If a client rates 8 questions as "Very satisfied" (5.0) and 2 questions as "Neutral" (3.0), the score is $(8 \times 5 + 2 \times 3) / 10 = 4.6 / 5.0$, qualifying as **Very Satisfied (Positive Sentiment)**.
2. **Neutral Scores Dampening Sentiment**:
   * Neutral ratings (3.0) do **not** contribute to Positive Sentiment. If a submission's average is 3.5, it is classified under the **Neutral** tier and reduces the overall Positive Sentiment percentage.
3. **Exclusion of Non-SOW Modules**:
   * If a client does not have Hotline or 1-on-1 sessions included in their contract and marks *"Not a part of SOW"*, those questions are excluded from the denominator. This ensures their Positive Sentiment score is evaluated solely against the services they actually receive.

---

### 3.3 Escalation Alerts Calculation Logic

#### Definition
An **Escalation Alert** is a high-priority operational flag indicating that a corporate client's service experience is failing, requiring immediate intervention by the CS SPOC and Account Leadership.

#### Calculation Formula
$$\text{Total Escalation Alerts} = \sum_{i=1}^{N_{\text{Total Submissions}}} \mathbb{I}(S_i < 3.0)$$

Where $\mathbb{I}$ is an indicator function equal to $1$ when $S_i < 3.0$ and $0$ otherwise.

#### Trigger Hierarchy & Contributing Factors

An account enters the **Escalation Alert** state through primary and secondary alert triggers:

1. **Primary Metric Trigger (Overall Score < 3.0)**:
   * Any client submission yielding an average score $S_i < 3.0$ is automatically classified as **`Low / Escalation`**.
   * It is immediately incremented into the dashboard's **Escalation Alerts** counter with a red badge alert.
2. **Micro / Question-Level Escalation Flags**:
   * Even if a client's composite score is above 3.0, any individual pillar receiving a rating of **"Dissatisfied" (Score: 2)** or **"Very dissatisfied" (Score: 1)** triggers an inline alert:
     * Forces or suggests root-cause selection via `lowRatingTags` (e.g., *"Scope of services mismatched"*, *"High wait time before call answered"*).
     * Compels the client to provide specific remarks in the low-rating text field.
3. **Explicit Follow-up Escalation**:
   * When the client checks the box *"I would like a Customer Success Manager to contact me regarding this feedback"* (`wantsFollowUp === true`), the submission is tagged with an urgent callback priority flag regardless of numerical score.

#### Operational Workflow upon Escalation Alert
When an Escalation Alert is registered in `/cs/feedback`:
1. **Immediate Notification**: CS SPOC receives an alert on the client submission profile.
2. **Root Cause Extraction**: The selected suggested tags and remarks are summarized directly in the feedback inspection drawer.
3. **Escalation Matrix Activation**: The ticket maps into the standard **8-Tier Customer Service Escalation Matrix** (detailed in Section 4).

---

## 4. Operational Escalation Protocol (8-Tier Matrix)

When a low rating (Score 1 or 2) or composite score ($S_i < 3.0$) occurs, resolution follows the corporate **8-Tier Service Escalation Matrix**:

| Tier | Role Responsible | Initial Acknowledgment SLA | Maximum Resolution SLA | Escalation Trigger Conditions |
| :---: | :--- | :---: | :---: | :--- |
| **Tier 1** | **Call Center Representative / Helpdesk** | 15 Minutes | 2 Hours | Standard queries, password resets, minor app guidance, general session inquiries. |
| **Tier 2** | **Call Center Support Manager** | 30 Minutes | 4 Hours | Unresolved Tier 1 queries, repetitive app crash reports, counselor non-arrival within 10 min. |
| **Tier 3** | **Dedicated CS SPOC / Account Manager** | 1 Hour | 8 Hours | Client HR complaint, low feedback rating on BD or CS support, missed SLA callbacks. |
| **Tier 4** | **Senior CS Manager / Team Lead** | 2 Hours | 16 Hours | QBR escalation, dissatisfaction on contract scope, recurring tech outage, score < 3.0. |
| **Tier 5** | **Head of Operations / Clinical Director** | 4 Hours | 24 Hours | Clinical misconduct, hotline downtime, medical privacy breach, provider cancellation. |
| **Tier 6** | **VP of Customer Success & Operations** | 6 Hours | 36 Hours | Formal breach notice risk, corporate contract cancellation threat, severe HR dispute. |
| **Tier 7** | **Chief Operating Officer (COO)** | 12 Hours | 48 Hours | Legal threat, enterprise contract dispute > ₹10L ARR, widespread platform-level blackout. |
| **Tier 8** | **Chief Executive Officer (CEO)** | 24 Hours | 72 Hours | Board-level partner escalation, catastrophic service failure, strategic enterprise loss risk. |

---

## 5. Review & Vetting Checklist for Team

Please review the following items with the team and confirm approval or required adjustments:

- [ ] **Pillar Relevance**: Are all 10 evaluation dimensions aligned with client contract commitments?
- [ ] **Mandatory vs. SOW Exclusion**: Is the rule appropriate that BD, CS Support, and Tech Support cannot be skipped (`allowNotApplicable: false`), while Hotline, 1-on-1, and Webinars permit SOW exclusion (`allowNotApplicable: true`)?
- [ ] **Diagnostic Tags Accuracy**: Do the pre-defined suggested reply tags in Table 2 capture 90%+ of typical operational issues seen by your teams?
- [ ] **Thresholds**: 
  - Positive Sentiment benchmark: $\ge 3.8 / 5.0$ (Very Satisfied + Satisfied)
  - Neutral band: $3.0 - 3.7 / 5.0$
  - Escalation Alert threshold: $< 3.0 / 5.0$
- [ ] **SLA Protocol**: Is the response and resolution timeline in the 8-tier matrix feasible for operational staffing?

---
*Document generated for internal review and team vetting. File: `FEEDBACK_QUESTIONS_AND_SCORING_SPECIFICATION.md`*
