# CoachOS — Project State

## Current Position
- **Milestone:** 1 (Core Platform)
- **Current Phase:** 7 (Reports & Settings)
- **Phase Status:** NOT_STARTED
- **Next Action:** Plan Phase 7

## Phase Progress

| Phase | Name | Status | Plans | Completed |
|-------|------|--------|-------|-----------|
| 1 | Foundation & Setup | ✅ COMPLETE | 3/3 | 2026-05-04 |
| 2 | Students, Batches & Fee Plans | ✅ COMPLETE | 3/3 | 2026-05-04 |
| 3 | Attendance System | ✅ COMPLETE | 3/3 | 2026-05-04 |
| 4 | Fee Collection & Payments | ✅ COMPLETE | 5/5 | 2026-05-04 |
| 5 | Staff & Delegation Engine | ✅ COMPLETE | 4/4 | 2026-05-04 |
| 6 | Notifications | ✅ COMPLETE | 2/2 | 2026-05-04 |
| 7 | Reports & Settings | 🔲 NOT_STARTED | 0/3 | — |

## What Was Built

### Phase 1 Deliverables
- Neon PostgreSQL schema (13 tables, Prisma)
- JWT auth with refresh tokens, OTP-ready
- Super Admin APIs: institute CRUD, plan management, KPIs, audit logging
- Admin Console (apps/admin): dark theme login, dashboard with live KPIs, institute management
- Owner dashboard shell with 9-module sidebar

### Phase 6 Deliverables
- Notification bell unreadCount displays on header with live updates
- Absence alerts auto-generated for owner(s) when students are marked absent
- Scan Upcoming Dues manually generates fee reminder notifications
- Notification list page with filterable alerts and Mark All Read option

### Phase 5 Deliverables
- Staff & Delegation Engine CRUD (add, update, delete, permissions)
- Staff Salary Payroll management (baseSalary, Payroll record, history)
- Complete UI support for permissions checklists and payroll ledger

### Phase 4 Deliverables
- Fee Controller (dues generation, record payments, dashboard stats, ledger)
- Fee routes with proper permissions
- React FeeDashboardPage with collection KPIs and overdue list
- React StudentLedgerPage with history and "Record Payment" modal
- Printable ReceiptView

### Phase 3 Deliverables
- Attendance Controller (bulk mark, student summary, calendar view)
- Attendance Route Registration
- React AttendancePage with bulk toggle UI & calendar heatmap
- Prisma schema updated (Holiday relation fixed)

### Phase 2 Deliverables
- Student CRUD API (auto-code VP-YY-NNNN, plan limits, search, batch enrollment)
- Batch CRUD API (conflict detection for teacher/room, capacity enforcement)
- Fee Plan CRUD API (monthly/quarterly/course/installment, deletion protection)
- Students list page (searchable table, status badges, parent info, batch chips)
- Batches page (card grid, day chips, capacity bar, teacher display)
- Fee Plans page (card grid, frequency badges, create modal)

## Active Decisions
- Using file-based token storage in localStorage (web) / separate keys for admin
- Soft-delete pattern for students, batches, fee plans
- Audit logging on all mutations

## Known Issues
- Neon DB cold starts cause occasional connection drops (auto-retries handle it)
- Browser automation (subagent) struggles with login form on 5173 (rate limiting)

## Environment
- API: http://localhost:3001 (running)
- Admin: http://localhost:5174 (running)
- Web: http://localhost:5173 (running)
- DB: Neon PostgreSQL (shared, connection pooling)

---
*Last updated: 2026-05-04T09:41:00Z*
