# CoachOS — Coaching Center ERP SaaS

## What This Is

CoachOS is a multi-tenant ERP SaaS platform for coaching institutes and individual tutors in India. It manages the entire operational lifecycle: student enrollment, batch scheduling, attendance tracking, fee collection, staff delegation, and parent communication — all from a single unified dashboard.

## Core Value

**The ONE thing that must work:** An institute owner can manage students, batches, attendance, and fees from a single dashboard, with the ability to delegate operations to staff using granular role-based permissions.

## Context

### Current State
Milestone 1.0 (Core Platform) is successfully shipped. The platform is fully operational for institutes to manage their day-to-day operations. The **Delegation Engine** is a core differentiator, allowing owners to safely scale by delegating tasks to Teachers and Accountants with granular security.

### Technical Stack
- **Monorepo:** Turborepo with 3 apps
  - `apps/api` — Express + Prisma + TypeScript (Port 3001)
  - `apps/web` — Vite + React + TypeScript (Port 5173) — Owner/Staff portal
  - `apps/admin` — Vite + React + TypeScript (Port 5174) — Super Admin console
- **Database:** Neon PostgreSQL (13 tables, shared DB)
- **Auth:** JWT (access + refresh tokens), phone+password login
- **Styling:** Tailwind CSS v4 (Mintlify design system)
- **State:** Zustand

## Requirements

### Validated (v1.0 Core Platform)
- ✓ Multi-tenant foundation & institute isolation
- ✓ JWT authentication & Role-Based Access Control
- ✓ Super Admin Console & Institute Management
- ✓ Student CRUD & Auto-generated Student Codes
- ✓ Batch Scheduling with Conflict Detection
- ✓ Fee Plan Configuration (Monthly/Quarterly/Course)
- ✓ Attendance Marking (Present/Absent/Late) with 24h Lock
- ✓ Fee Collection Engine & Auto-generated Dues
- ✓ Financial Dashboard & Per-student Fee Ledger
- ✓ Staff Delegation Engine with Custom Roles
- ✓ In-App Notifications for Dues & Absences
- ✓ Reports (Financial Analytics & Attendance Trends)

### Active (v2.0 Scale & Engagement)
- [ ] **PAY-06**: Online payment gateway integration (Razorpay)
- [ ] **NOTIF-04**: Real-world notification delivery (WhatsApp/SMS API)
- [ ] **PORTAL-01**: Student/Parent self-service portal (Mobile-friendly)
- [ ] **TIMETABLE-01**: Automated timetable generation and room optimization
- [ ] **MULTI-01**: Multi-branch support for large institute chains
- [ ] **MOBILE-01**: Native mobile app for staff and students

### Out of Scope
- Content/course management (LMS features) — focus remains on operations
- Advanced accounting/GST — focused on fee tracking only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Separate Admin console app | Decouple platform admin from institute operations | ✓ Good |
| Delegation via permissions not roles | Custom admin roles with any permission combo | ✓ Good |
| Mintlify Design System | Developer-grade, high-fidelity UI aesthetics | ✓ Good |
| Teacher Data Isolation | Backend filters students/batches by assigned teacher | ✓ Good |

---
*Last updated: 2026-05-16 after v1.0 Milestone completion*
