# CoachOS — Coaching Center ERP SaaS

## What This Is

CoachOS is a multi-tenant ERP SaaS platform for coaching institutes and individual tutors in India. It manages the entire operational lifecycle: student enrollment, batch scheduling, attendance tracking, fee collection, staff delegation, and parent communication — all from a single unified dashboard.

## Core Value

**The ONE thing that must work:** An institute owner can manage students, batches, attendance, and fees from a single dashboard, with the ability to delegate operations to staff using granular role-based permissions.

## Context

### Problem Space
Coaching institutes (1-teacher tutor to 100+ staff centers) in India manage operations through WhatsApp groups, Excel sheets, and manual registers. No affordable ERP exists that handles the combination of: batch scheduling with conflict detection, fee tracking with Indian payment modes (UPI, cash), attendance with parent notifications, and a delegation engine that lets owners scale from solo to multi-staff.

### Target Users
1. **Individual Tutors** — Solo operators managing 10-50 students
2. **Small Institutes** — 2-10 staff, 50-200 students
3. **Large Coaching Centers** — 10+ staff, 200-1000+ students

### Technical Stack
- **Monorepo:** Turborepo with 3 apps
  - `apps/api` — Express + Prisma + TypeScript (Port 3001)
  - `apps/web` — Vite + React + TypeScript (Port 5173) — Owner/Staff portal
  - `apps/admin` — Vite + React + TypeScript (Port 5174) — Super Admin console
- **Database:** Neon PostgreSQL (13 tables, shared DB)
- **Auth:** JWT (access + refresh tokens), phone+password login, OTP ready
- **Styling:** Tailwind CSS v4
- **State:** Zustand
- **Shared types:** `packages/shared` — roles, permissions, statuses, fee types

### Delegation Engine (Key Business Differentiator)
The Owner has ALL 18 permissions by default. When scaling, they can:
- Add **Teachers** (default: view students, mark attendance)
- Add **Accountants** (default: view students, collect fees, view reports)
- Add **Staff** (default: view/add/edit students, attendance, notifications, reports)
- Create **Custom Admin roles** with any combination of 18 granular permissions
- Permissions: `students.view/add/edit/delete`, `fees.view/collect/edit/delete`, `attendance.view/mark/edit`, `notifications.view/send`, `reports.view/export`, `staff.view/manage`, `settings.manage`

## Requirements

### Validated
- ✓ Multi-tenant foundation (institute isolation via instituteId) — Phase 1
- ✓ JWT authentication with role-based access control — Phase 1
- ✓ Super Admin API (CRUD institutes, plans, KPIs, audit logging) — Phase 1
- ✓ Super Admin Console UI (dark theme, login, dashboard, institute management) — Phase 1
- ✓ Owner dashboard shell with sidebar (all 9 modules visible) — Phase 1
- ✓ Student CRUD API (create with auto-code, search, batch enrollment, plan limits) — Phase 2
- ✓ Batch CRUD API (with teacher/room conflict detection, capacity enforcement) — Phase 2
- ✓ Fee Plan CRUD API (monthly/quarterly/course/installment, due day config) — Phase 2
- ✓ Students list page UI (search, filter, pagination, batch chips, parent info) — Phase 2
- ✓ Batches page UI (card grid, day chips, capacity bar, conflict display) — Phase 2
- ✓ Fee Plans page UI (card grid, frequency badges, active student count) — Phase 2

### Active
- [ ] **ATT-01**: Owner/Teacher can mark batch attendance (present/absent/late per student)
- [ ] **ATT-02**: Attendance calendar view (daily/weekly/monthly, absent highlights)
- [ ] **ATT-03**: Attendance lock (prevent edits after 24h or admin override)
- [ ] **FEE-01**: Generate fee records (dues) from fee plans (auto-generation per period)
- [ ] **FEE-02**: Record payments (cash/UPI/bank/cheque with mode tracking)
- [ ] **FEE-03**: Fee dashboard (collection summary, overdue alerts, per-student ledger)
- [ ] **FEE-04**: Receipt generation (auto-numbered, PDF-ready structure)
- [ ] **STAFF-01**: Owner can add staff (teacher/accountant/custom role)
- [ ] **STAFF-02**: Owner can assign granular permissions to custom roles
- [ ] **STAFF-03**: Staff login with role-scoped sidebar (see only permitted modules)
- [ ] **NOTIF-01**: In-app notifications for fee reminders and absence alerts
- [ ] **REPORT-01**: Fee collection report (daily/monthly, by batch/student)
- [ ] **REPORT-02**: Attendance analytics (per student, per batch, trends)
- [ ] **SETTINGS-01**: Institute profile editing (name, address, logo, academic year)

### Out of Scope
- Mobile app — web-first approach for v1
- Online payment gateway (Razorpay) — schema ready, integration deferred
- WhatsApp/SMS notifications — mocked for v1, real integration in v2
- Student/Parent portal — v2 feature
- Timetable auto-generation — manual batch scheduling in v1
- Multi-branch support — single institute per tenant in v1

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Separate Admin console app | Decouple platform admin from institute operations | ✓ Implemented |
| Owner sees all modules from day 1 | No feature gating — simplicity over paywalls | ✓ Implemented |
| Delegation via permissions not roles | Custom admin roles with any permission combo | ✓ Schema ready |
| Neon PostgreSQL shared DB | Cost-effective, row-level tenant isolation | ✓ Implemented |
| Auto student code (VP-YY-NNNN) | Institute-scoped sequential codes | ✓ Implemented |
| Conflict detection for batches | Prevent teacher/room double-booking | ✓ Implemented |

## Credentials

| App | URL | Login |
|-----|-----|-------|
| API | http://localhost:3001/api/health | — |
| Admin Console | http://localhost:5174 | admin@vidyaplus.in / Admin@2026 |
| Institute Web | http://localhost:5173 | 9876543210 / Owner@2026 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

---
*Last updated: 2026-05-04 after Phase 2 completion*
