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

Each feedback evaluation assesses 10 core operational pillars grouped into 5 service categories.

* **Rating Scale**: 
  * **Very satisfied** = `5 Points`
  * **Satisfied** = `4 Points`
  * **Neutral** = `3 Points`
  * **Dissatisfied** = `2 Points`
  * **Very dissatisfied** = `1 Point`
  * **Not a part of SOW / No session done** = `N/A` (Excluded from arithmetic average, only permitted on eligible questions)

### Master Questions Table

> **Behavior Rules for Suggested Answers (Diagnostic Tags)**:
> 1. **Trigger Conditions**: The suggested answer tags (and the accompanying *"Help us understand what went wrong"* remark box) appear whenever a user selects **`Neutral` (Score 3)**, **`Dissatisfied` (Score 2)**, or **`Very dissatisfied` (Score 1)**. They do **not** appear if the user selects `Very satisfied` or `Satisfied`.
> 2. **Consistency Across Options**: For any given question, **the suggested tags remain identical** whether the respondent selects `Neutral`, `Dissatisfied`, or `Very dissatisfied`. (Each question has its own tailored set of 4 tags specific to its operational domain).
> 3. **Multi-Select & Free-Text**: Users can tap multiple tags (which concatenate into the remarks field) and/or type custom notes.

| Q No. | Category | Question | Options | Suggested ans for Options (Low Rating / Diagnostic Tags) | Score for each option |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **Q1** | **Sales & Onboarding Alignment** | **BD Commitment vs. Actual Service Delivery**<br><br>*How well did actual operational execution align with deliverables, promised scope, and timelines agreed during the Business Development / sales phase?* | • Very satisfied<br>• Satisfied<br>• Neutral<br>• Dissatisfied<br>• Very dissatisfied<br>*(Mandatory – SOW N/A not allowed)* | • Scope of services mismatched<br>• Delayed onboarding & kickoff<br>• Deliverables promised were missing<br>• Billing or pricing miscommunication | • Very satisfied: **5**<br>• Satisfied: **4**<br>• Neutral: **3**<br>• Dissatisfied: **2**<br>• Very dissatisfied: **1** |
| **Q2** | **Customer Success Operations** | **Customer Success (CS) Support & Account Management**<br><br>*Responsiveness, proactiveness, and helpfulness of your dedicated Customer Success SPOC in resolving queries, managing account requests, and reviewing health metrics:* | • Very satisfied<br>• Satisfied<br>• Neutral<br>• Dissatisfied<br>• Very dissatisfied<br>*(Mandatory – SOW N/A not allowed)* | • Slow response to emails / queries<br>• Need more proactive follow-ups<br>• Escalations remained unresolved<br>• Need more frequent status reviews | • Very satisfied: **5**<br>• Satisfied: **4**<br>• Neutral: **3**<br>• Dissatisfied: **2**<br>• Very dissatisfied: **1** |
| **Q3** | **Product & Technology** | **Tech & App Support (Platform Reliability & Usability)**<br><br>*Ease of use, app speed, uptime reliability, and technical assistance for the MantraCare employee mobile app and corporate portal:* | • Very satisfied<br>• Satisfied<br>• Neutral<br>• Dissatisfied<br>• Very dissatisfied<br>*(Mandatory – SOW N/A not allowed)* | • Login / OTP verification issues<br>• App performance / slow loading<br>• Feature bugs or app crashes<br>• Portal navigation was confusing | • Very satisfied: **5**<br>• Satisfied: **4**<br>• Neutral: **3**<br>• Dissatisfied: **2**<br>• Very dissatisfied: **1** |
| **Q4** | **Helpline & Assistance** | **Hotline: Call Quality & Pickup Ratio**<br><br>*Immediate call pickup speed, zero connection dropouts, audio clarity, and 24/7 helpline accessibility when employees call in:* | • Very satisfied<br>• Satisfied<br>• Neutral<br>• Dissatisfied<br>• Very dissatisfied<br>• Not a part of SOW / No session done | • High wait time before call answered<br>• Frequent dropped / disconnected calls<br>• Audio line crackling or lag<br>• Pickup delays during peak hours | • Very satisfied: **5**<br>• Satisfied: **4**<br>• Neutral: **3**<br>• Dissatisfied: **2**<br>• Very dissatisfied: **1**<br>• Not a part of SOW: **Excluded (N/A)** |
| **Q5** | **Helpline & Assistance** | **Hotline: Counselor & Agent Call Support**<br><br>*Empathy, active listening, problem handling, and professionalism displayed by helpline agents when handling employee situations:* | • Very satisfied<br>• Satisfied<br>• Neutral<br>• Dissatisfied<br>• Very dissatisfied<br>• Not a part of SOW / No session done | • Agent sounded rushed or impatient<br>• Lacked active empathy & understanding<br>• Inadequate clinical / wellness guidance<br>• Tone was perceived as unprofessional | • Very satisfied: **5**<br>• Satisfied: **4**<br>• Neutral: **3**<br>• Dissatisfied: **2**<br>• Very dissatisfied: **1**<br>• Not a part of SOW: **Excluded (N/A)** |
| **Q6** | **Helpline & Assistance** | **Hotline: Ops Response to Queries & Follow-ups**<br><br>*Operational turnaround speed and efficiency in closing ticket escalations, scheduled callbacks, and resolving employee queries:* | • Very satisfied<br>• Satisfied<br>• Neutral<br>• Dissatisfied<br>• Very dissatisfied<br>• Not a part of SOW / No session done | • Scheduled callback was delayed / missed<br>• Ticket escalation took days to resolve<br>• Lack of clear status communication<br>• Operations resolution was incomplete | • Very satisfied: **5**<br>• Satisfied: **4**<br>• Neutral: **3**<br>• Dissatisfied: **2**<br>• Very dissatisfied: **1**<br>• Not a part of SOW: **Excluded (N/A)** |
| **Q7** | **Clinical & Wellness Care** | **1-on-1 Individual Sessions**<br><br>*Quality, punctuality, practitioner expertise, confidentiality, and employee satisfaction with individual 1-on-1 sessions:* | • Very satisfied<br>• Satisfied<br>• Neutral<br>• Dissatisfied<br>• Very dissatisfied<br>• Not a part of SOW / No session done | • Limited expert slot availability<br>• Expert rescheduled / cancelled sessions<br>• Consultation quality was inconsistent<br>• Feedback from employees was mixed | • Very satisfied: **5**<br>• Satisfied: **4**<br>• Neutral: **3**<br>• Dissatisfied: **2**<br>• Very dissatisfied: **1**<br>• Not a part of SOW: **Excluded (N/A)** |
| **Q8** | **Engagement & Activities** | **Webinars: Topic Relevance & Variety**<br><br>*Alignment of webinar themes with workforce wellness priorities, mental health awareness, and employee interest:* | • Very satisfied<br>• Satisfied<br>• Neutral<br>• Dissatisfied<br>• Very dissatisfied<br>• Not a part of SOW / No session done | • Topics too generic or repetitive<br>• Did not resonate with workforce needs<br>• Need more specialized wellness themes<br>• Too few topics to choose from | • Very satisfied: **5**<br>• Satisfied: **4**<br>• Neutral: **3**<br>• Dissatisfied: **2**<br>• Very dissatisfied: **1**<br>• Not a part of SOW: **Excluded (N/A)** |
| **Q9** | **Engagement & Activities** | **Webinars: Content Depth & Presentation Quality**<br><br>*Practicality, visual presentation, depth of actionable health takeaways, and reference materials provided to attendees:* | • Very satisfied<br>• Satisfied<br>• Neutral<br>• Dissatisfied<br>• Very dissatisfied<br>• Not a part of SOW / No session done | • Slides were text-heavy & hard to follow<br>• Lack of actionable everyday tips<br>• Content was too theoretical/basic<br>• Resource guides / recordings delayed | • Very satisfied: **5**<br>• Satisfied: **4**<br>• Neutral: **3**<br>• Dissatisfied: **2**<br>• Very dissatisfied: **1**<br>• Not a part of SOW: **Excluded (N/A)** |
| **Q10** | **Engagement & Activities** | **Webinars: Trainer / Expert Engagement & Q&A**<br><br>*Speaker energy, subject mastery, audience engagement, and effectiveness in answering live employee questions:* | • Very satisfied<br>• Satisfied<br>• Neutral<br>• Dissatisfied<br>• Very dissatisfied<br>• Not a part of SOW / No session done | • Speaker lacked dynamic engagement<br>• Audience Q&A was rushed or skipped<br>• Session started late or ran overtime<br>• Could not answer complex attendee queries | • Very satisfied: **5**<br>• Satisfied: **4**<br>• Neutral: **3**<br>• Dissatisfied: **2**<br>• Very dissatisfied: **1**<br>• Not a part of SOW: **Excluded (N/A)** |

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
