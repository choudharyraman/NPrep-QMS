# NPrep QMS — Product Documentation
### Question Management System | Version 1.0

> **NPrep** is an EdTech platform for medical and nursing students in India, scaling towards **2.5 lakh (250,000) users** by year-end. This document covers the complete feature set of the NPrep Question Management System (QMS) — an internal tool built to manage student doubts at scale.

---

## Table of Contents

1. [Background & Problem Statement](#1-background--problem-statement)
2. [Solution Architecture](#2-solution-architecture)
3. [User Roles & Access Levels](#3-user-roles--access-levels)
4. [Feature Overview](#4-feature-overview)
5. [Student Features](#5-student-features)
6. [Faculty Features](#6-faculty-features)
7. [Operations (Ops) Features](#7-operations-ops-features)
8. [Analytics Features](#8-analytics-features)
9. [Platform & Infrastructure Features](#9-platform--infrastructure-features)
10. [Login Credentials (Demo)](#10-login-credentials-demo)
11. [Metrics & Expected Impact](#11-metrics--expected-impact)

---

## 1. Background & Problem Statement

As NPrep scaled beyond 1 lakh students, the **ad-hoc doubt-resolution model broke down**. The following problems were directly observed before this system was built:

| # | Problem | Impact |
|---|---------|--------|
| 1 | Students waited **18–72 hours** for answers — or never received one. | Student churn, poor learning outcomes, bad reviews. |
| 2 | The same doubt was asked **50–200 times** because there was no searchable history. | Faculty time wasted answering duplicates, database bloat. |
| 3 | Faculty spent **hours answering duplicates** instead of high-value, unique queries. | Low faculty morale, slow resolution rate. |
| 4 | The Operations team **manually copy-pasted** between WhatsApp groups, the NPrep app, and a Google Sheet. | Ops team burnout, high error rate, no audit trail. |
| 5 | **No analytics** existed on which topics confused the most students. | Curriculum gaps remained invisible; faculty couldn't improve content proactively. |

The NPrep QMS was built to systematically resolve all five of these issues with a unified platform.

---

## 2. Solution Architecture

The NPrep QMS is built as a **Progressive Web App (PWA)** using:

- **Framework:** React + TypeScript via Vite
- **Routing:** React Router v6
- **State Management:** Custom reactive `ticketStore` (in-memory, inspired by Zustand)
- **Local Storage:** Dexie.js (IndexedDB wrapper) for offline-first PWA behavior
- **Notifications:** Browser Push Notifications API for real-time faculty alerts
- **Styling:** Tailwind CSS with NPrep brand colors (`#1ba1f5` blue, `#0b163f` dark navy)
- **Charts:** Recharts (Bar, Area, Line charts for analytics)
- **Hosting:** Deployed on **Vercel** (SPA rewrites + Service Worker cache headers configured)
- **Repository:** GitHub (`choudharyraman/NPrep-QMS`)

---

## 3. User Roles & Access Levels

The QMS has three distinct user roles, each with a completely different dashboard and set of capabilities:

| Role | Who Uses It | Access | Demo Login |
|------|------------|--------|-----------|
| **Student** | B.Sc Nursing / MBBS students | Submit doubts, view replies, search past answers | `student@nprep.in` / `student123` |
| **Faculty** | Subject Matter Experts (SMEs) | Answer doubts, bulk reply, view clusters | `faculty@nprep.in` / `faculty123` |
| **Ops** | NPrep Operations Team | Monitor KPIs, escalate, manage faculty roster, review QA | `ops@nprep.in` / `ops123` |

All roles share a **Login Screen** with role-based routing — the user is automatically directed to their respective dashboard after authentication.

---

## 4. Feature Overview

```
NPrep QMS
├── Auth
│   ├── Login Page (Role-Based Routing)
│   └── Logout (All Views)
├── Student View
│   ├── My Doubts Feed
│   ├── Smart Submit (AI Deflection)
│   └── Was This Helpful? (QA Feedback Loop)
├── Faculty View
│   ├── Clustered Inbox
│   ├── Bulk Reply
│   ├── Browser Push Notifications
│   └── Ticket Detail View
├── Ops Command Centre
│   ├── Tab 1: Overview (KPIs + SLA Escalation)
│   ├── Tab 2: Roster & Payouts (Load Balancing)
│   └── Tab 3: QA / Disputed Tickets
└── Analytics View
    ├── Confusion Heatmap
    ├── 7-Day Trend
    ├── Drill-Down per Topic
    └── Faculty Performance Table
```

---

## 5. Student Features

### 5.1 Login & Role-Based Access
**Problem Solved:** Students, faculty, and ops all previously accessed different tools through different channels (WhatsApp, Google Forms, spreadsheets). There was no single sign-on.

**Feature:** A clean login screen with hardcoded demo credentials (and designed for real auth in production). After login, the system reads the user's `role` field and routes them to the appropriate dashboard. Students cannot access faculty or ops views.

---

### 5.2 My Doubts Feed
**Problem Solved:** Students had no visibility into their submitted doubts. After submitting a question on WhatsApp or a form, they never knew if it had been seen, assigned, or answered — until they checked hours later.

**Feature:** The student dashboard shows a real-time, reverse-chronological list of all their submitted doubts. Each ticket card shows:
- Subject and topic tags
- Current status badge (`Pending`, `In Progress`, `Answered`, `Resolved`)
- Time since submission
- Number of similar doubts from other students (showing they're not alone)
- A preview of the faculty reply (if available)

The student can tap any card to open the full **Ticket Detail View**, which shows the complete conversation thread.

---

### 5.3 Smart Submit — AI Deflection Engine
**Problem Solved:** The single biggest driver of faculty overload is **repeat questions**. The same doubt about beta-lactam antibiotics was submitted 50–200 times by different students. Faculty answered each one manually.

**Feature:** When a student taps the floating `+` button (floating action button) to ask a new doubt, they are first taken to the **Smart Submit modal**, which works as follows:

1. The student selects their **subject** and **topic** from a dropdown.
2. As they type their question (after 20+ characters), the system instantly searches the **resolved ticket database** for similar answers.
3. If a matching resolved answer is found (similarity > 80%), it is surfaced to the student in a "Did you find your answer?" card.
4. If the student selects "Yes, this helped!" → the doubt is resolved without creating a new ticket. This is the **deflection** event.
5. If the student selects "No, I need more help" → the doubt is submitted as a new ticket and routed to the appropriate faculty member.

**Impact:** Every deflected ticket saves ~15 minutes of faculty time. At scale, this single feature can eliminate 20–30% of total ticket volume.

---

### 5.4 "Was This Helpful?" Feedback Loop
**Problem Solved:** After faculty replied to a doubt, there was no way to know if the student actually understood the answer. A bad answer looked identical to a good one in the spreadsheet.

**Feature:** Once a faculty reply is posted, the student's ticket detail view shows two buttons: **"Yes, Resolved! ✅"** and **"No, Still Confused 🔄"**.
- If **Yes** → Ticket status is set to `resolved`. The thread is closed.
- If **No** → Ticket status is set back to `in_progress`, which:
  - Notifies the faculty that the answer was insufficient.
  - Automatically flags the ticket in the **Ops QA Queue** for review.

This creates a closed quality-control loop that didn't exist before.

---

## 6. Faculty Features

### 6.1 Clustered Inbox
**Problem Solved:** Faculty received hundreds of individual WhatsApp messages, with no grouping or prioritization. The highest-volume topics (e.g., 22 students asking about Inflammation) appeared identical to a single unique question.

**Feature:** The faculty inbox **automatically groups identical or near-identical doubts into clusters**. Instead of seeing 22 separate cards for "Inflammation," the faculty sees a single cluster card showing:
- The representative (clearest) version of the question
- How many students are in the cluster (e.g., "22 students")
- Whether it's an anomaly (volume spike) — flagged in red
- The subjects and topics affected

Faculty can expand the cluster to see all individual student questions inside it.

---

### 6.2 Bulk Reply
**Problem Solved:** Even when faculty recognized a duplicate question, they had to copy-paste their answer 22 times across 22 WhatsApp messages. This was the #1 cause of faculty frustration and burnout.

**Feature:** From within a cluster, faculty can write a single, detailed reply and tap **"Reply to All X Students"**. The system broadcasts the reply to every student in the cluster simultaneously, updating all their ticket statuses to `answered` in one action.

This single feature reduces the time to answer a cluster from 30+ minutes to under 2 minutes.

---

### 6.3 Browser Push Notifications
**Problem Solved:** Faculty had to manually open the app to check for new doubts. There was no proactive alerting, so high-priority questions could sit for hours before being noticed.

**Feature:** When faculty logs in, the app requests browser **Push Notification permission**. New high-volume clusters (anomalies with 15+ students) trigger a native browser notification even when the faculty member is on a different tab or browser window. The notification includes the topic, number of students, and a direct link to the cluster.

---

### 6.4 Ticket Detail View
**Problem Solved:** There was no structured view for a single student-faculty conversation thread. Everything happened in flat WhatsApp message chains with no context.

**Feature:** The Ticket Detail View provides a full, structured conversation thread for a single ticket, showing:
- Student's original question with image support
- Subject, topic, time submitted
- Faculty's reply formatted with rich text (markdown support for numbered lists, bold, etc.)
- "Was This Helpful?" action buttons
- Current ticket status

---

## 7. Operations (Ops) Features

The Ops Command Centre is a dedicated dashboard for the NPrep Operations team to manage the entire doubt-resolution pipeline. It is divided into three tabs.

### 7.1 Tab 1: Overview & SLA Health

#### KPI Dashboard
**Problem Solved:** The operations team had no real-time visibility into system health. They had to manually count rows in a Google Sheet to know how many doubts were pending.

**Feature:** Four live KPI cards update in real-time:
- **Total Tickets** — All time, with trend indicator
- **Pending Now** — Doubts currently awaiting a faculty reply
- **Overdue (>24h)** — Tickets that have breached the 24-hour SLA target (shown in red)
- **Resolved Today** — Total doubts answered, with deflection rate

#### SLA Health & Escalation Queue
**Problem Solved:** Ops had no way to identify *which specific tickets* were at risk of breaching SLA until it was already too late. They only found out when an angry student messaged on WhatsApp.

**Feature:** A **Escalation Queue** automatically surfaces all tickets that have been `pending` for more than 24 hours. Each card shows:
- The student's question
- Subject and topic
- Exact time pending (e.g., "32h pending") with a pulsing red indicator
- A one-click **"Escalate via WhatsApp"** button that pre-fills a formatted escalation message to the faculty WhatsApp group, ready to send

An SLA health banner shows the overall average resolution time versus the 4-hour target.

---

### 7.2 Tab 2: Roster & Payouts

#### Faculty Load Balancing Toggle
**Problem Solved:** When a faculty member was sick or unavailable, new tickets continued to be routed to them — sitting unanswered for days. Ops had no way to "pause" a faculty member without manually tracking it in a spreadsheet.

**Feature:** The Roster tab shows every faculty member with an **Active / Paused toggle switch**. When Ops marks a faculty member as "Paused":
- New tickets stop being routed to them.
- Their row dims visually, indicating their inactive status.
- This is reversible with a single click when they return.

This gives Ops real-time control over ticket routing without needing to call the faculty member.

#### Payout Calculator
**Problem Solved:** At the end of every month, the Ops team spent 2–3 full work days manually counting each faculty member's resolved tickets in the spreadsheet and calculating their variable payout. This was error-prone and delayed faculty payments.

**Feature:** The Payout Calculator is fully automated. It shows each faculty member's:
- Number of resolved tickets this month
- Payout rate (₹15 per resolved doubt, configurable)
- **Calculated monthly payout** (e.g., `28 tickets × ₹15 = ₹420`)

A **"Export Payouts CSV"** button generates a file formatted for direct upload to the finance team's payment gateway — eliminating the manual calculation entirely.

---

### 7.3 Tab 3: QA & Disputed Tickets

#### Quality Assurance Queue
**Problem Solved:** There was no quality control mechanism for faculty answers. A faculty member could reply with a vague, incorrect, or unhelpful answer, and it would be marked "answered" in the spreadsheet. Ops had no way to identify poor-quality replies.

**Feature:** The QA tab automatically surfaces all tickets where a student clicked **"No, Still Confused"** after a faculty reply. For each disputed ticket, the Ops team can see:
- The original student question
- The full faculty reply that was flagged
- The faculty member's name
- Time since the dispute was raised

Ops can then take one of three actions directly from the QA tab:
- **Reassign Ticket** — Route to a different, more qualified faculty member
- **Issue Warning** — Log a quality flag against the faculty member (for recurring offenders)
- **Force Resolve** — Mark the ticket as resolved if Ops determines the answer was actually correct

---

## 8. Analytics Features

### 8.1 Confusion Heatmap
**Problem Solved:** NPrep's curriculum team had no data on which topics confused the most students. They made content decisions based on gut feeling, not evidence. Chapters that needed the most explanation received the same attention as ones students found easy.

**Feature:** The **Confusion Heatmap** is a bar chart of ticket volume by topic, sorted by volume. It uses color-coding to distinguish normal volume from **anomalies** (statistically unusual spikes):
- 🔵 Blue bars → Normal volume topics
- 🔴 Red bars → Anomaly topics (volume spike, flagged for immediate curriculum attention)
- Dark bar → Currently selected topic (for drill-down)

An **anomaly banner** appears at the top of the screen when spikes are detected (e.g., "🚨 Anomalies: IV Drip Rate, Inflammation — students are confused!"), proactively alerting the curriculum team.

---

### 8.2 7-Day Trend Chart
**Problem Solved:** There was no visibility into whether doubt volume was growing, stable, or shrinking over time. The team couldn't tell if a curriculum update helped.

**Feature:** An area chart shows daily ticket submission volume over the past 7 days. This allows the team to correlate spikes with specific events (e.g., an exam announcement, a new module launch).

---

### 8.3 Topic Drill-Down
**Problem Solved:** Knowing that "Inflammation" has 88 tickets is useful, but actionable intelligence requires understanding *what specifically* about Inflammation students are confused about.

**Feature:** Clicking any bar in the Confusion Heatmap activates a **Drill-Down panel** that shows:
- Total ticket count for that topic
- Anomaly flag if applicable
- A sample of the 4 most recent, actual student questions from that topic, with student names and timestamps

This allows the curriculum team to read real student questions and design targeted revision content.

---

### 8.4 Subject Filters
**Problem Solved:** A nursing subject coordinator shouldn't have to wade through Pharmacology data to find their OB/GYN Nursing confusion hotspots.

**Feature:** Filter pills at the top of the analytics page allow users to filter the heatmap by subject (Anatomy, Physiology, Pharmacology, OB/GYN Nursing, etc.) or time period (Last 7 Days, Last 30 Days, All Time). Filters are applied instantly without a page reload.

---

### 8.5 Faculty Performance Table
**Problem Solved:** Managers had no way to compare faculty output or identify underperformers except by manually reviewing the Google Sheet.

**Feature:** A performance league table ranks all faculty members by:
- Total resolved tickets
- Average resolution time (green if ≤4h, amber if >4h)
- Subjects covered
- Current status (Active / Idle)

---

## 9. Platform & Infrastructure Features

### 9.1 PWA (Progressive Web App)
**Problem Solved:** Students in tier-2 and tier-3 cities often have unreliable internet connectivity. A standard web app would fail to load in low-signal areas, leading to students missing their answers.

**Feature:** The NPrep QMS is built as a full PWA:
- **Offline Support:** The app shell, previously loaded tickets, and faculty replies are cached and readable even without internet.
- **Installable:** Students and faculty can "Add to Home Screen" on Android/iOS for an app-like experience without going through the Play Store.
- **Service Worker:** Handles background sync and push notification delivery.

---

### 9.2 CSV Export
**Problem Solved:** The Operations team frequently needed to share ticket data with leadership or run analyses in Excel. Extracting data from a Google Sheet was manual and always had formatting inconsistencies.

**Feature:** The Ops dashboard includes a one-click **"Export CSV"** button that downloads a formatted CSV file of all tickets, including ID, student name, subject, topic, status, timestamps, and faculty replies. The filename includes the export date (`nprep-tickets-2026-05-22.csv`) for easy filing.

---

### 9.3 Global Logout (All Views)
**Problem Solved:** There was no secure session management. Faculty members on shared computers could inadvertently leave the portal open, exposing student data.

**Feature:** A **Logout button** is prominently placed in the top navigation bar of every view — Student, Faculty, Ops, and Analytics. Clicking it:
1. Clears the user session from `AuthContext`
2. Removes the stored user data from `localStorage`
3. Immediately redirects the user to the `/login` screen

---

## 10. Login Credentials (Demo)

| Role | Email | Password |
|------|-------|----------|
| Student | `student@nprep.in` | `student123` |
| Faculty | `faculty@nprep.in` | `faculty123` |
| Operations | `ops@nprep.in` | `ops123` |

> ⚠️ These are demo credentials hardcoded in the frontend. For production, these should be replaced with a backend authentication system (JWT/OAuth).

---

## 11. Metrics & Expected Impact

| Metric | Before QMS | After QMS (Projected) |
|--------|-----------|----------------------|
| Average doubt response time | 18–72 hours | **< 4 hours** |
| Repeat question ticket volume | 50–200x per topic | **Reduced by 20–30%** via Smart Deflection |
| Faculty time per duplicate cluster | 30+ minutes | **< 2 minutes** via Bulk Reply |
| Ops monthly payout calculation time | 2–3 full days | **< 5 minutes** via Payout Calculator |
| Ops escalation response time | Hours (manual monitoring) | **< 30 minutes** via SLA Escalation Queue |
| Curriculum confusion visibility | Zero (gut feeling) | **Real-time** via Confusion Heatmap |
| Quality control on faculty replies | None | **100% coverage** via QA/Disputed Queue |

---

*Documentation prepared for NPrep — Internal use only.*
*Version 1.0 | May 2026*
