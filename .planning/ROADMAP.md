# CoachOS v1 Roadmap

## Milestone 1: Core Platform

### Overview

| # | Phase | Goal | Requirements | Status |
|---|-------|------|-------------|--------|
| 1 | Foundation & Setup | Multi-tenant backend, auth, Super Admin console | FOUND-01→05 | ✅ Complete |
| 2 | Students, Batches & Fee Plans | Student CRUD, batch scheduling, fee plan config | STU-01→05, BATCH-01→04, FEE-01→03 | ✅ Complete |
| 3 | Attendance System | Mark/view attendance with calendar, locking, stats | ATT-01→04 | 🔲 Next |
| 4 | Fee Collection & Payments | Auto-generate dues, record payments, receipts | PAY-01→05 | 🔲 Pending |
| 5 | Staff & Delegation Engine | Add staff, custom roles, permission-scoped UI | STAFF-01→05 | 🔲 Pending |
| 6 | Notifications | In-app alerts for fees and attendance | NOTIF-01→03 | 🔲 Pending |
| 7 | Reports & Settings | Financial/attendance analytics, institute config | REPORT-01→02, SET-01→02 | 🔲 Pending |

---

### Phase 1: Foundation & Setup ✅
**Goal:** Multi-tenant backend with JWT auth, Super Admin console, Owner dashboard shell
**Requirements:** FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05
**Status:** Complete
**Success Criteria:**
1. ✅ Super Admin can login and see platform KPIs
2. ✅ Super Admin can CRUD institutes with owner creation
3. ✅ Owner can login and see dashboard with all 9 sidebar modules
4. ✅ Tenant isolation prevents cross-institute data access

---

### Phase 2: Students, Batches & Fee Plans ✅
**Goal:** Core operational data management — students, batches, fee structures
**Requirements:** STU-01→05, BATCH-01→04, FEE-01→03
**Status:** Complete
**Success Criteria:**
1. ✅ Owner can add student with auto-generated code, enrolled into batches
2. ✅ Batch creation with conflict detection (teacher/room double-booking)
3. ✅ Fee plans created with monthly/quarterly/course/installment frequencies
4. ✅ Plan limits enforced (max students per subscription)
5. ✅ UI pages: Students list, Batches grid, Fee Plans grid

---

### Phase 3: Attendance System 🔲
**Goal:** Daily batch attendance marking with calendar view and locking
**Requirements:** ATT-01, ATT-02, ATT-03, ATT-04
**UI hint:** yes
**Success Criteria:**
1. Owner/Teacher can select a batch and mark today's attendance (present/absent/late)
2. Attendance calendar shows daily status with color-coded cells
3. Attendance auto-locks after 24 hours; Owner can override
4. Student profile shows 30-day attendance summary (present %, absent count)

**Plans:**
- `3.1` — Attendance API (mark, list by batch+date, update, lock logic)
- `3.2` — Attendance UI (batch selector, student checklist, calendar heatmap)
- `3.3` — Attendance stats integration (student profile, dashboard KPIs)

---

### Phase 4: Fee Collection & Payments 🔲
**Goal:** Generate dues from fee plans, record payments, track balances
**Requirements:** PAY-01, PAY-02, PAY-03, PAY-04, PAY-05
**UI hint:** yes
**Success Criteria:**
1. Fee records auto-generated per billing period (monthly dues on due day)
2. Owner can record payment with mode (cash/UPI/etc) and reference
3. Fee dashboard shows collection vs outstanding with overdue highlights
4. Per-student ledger shows all dues, payments, and running balance
5. Receipts auto-numbered per institute

**Plans:**
- `4.1` — Fee record generation engine (cron/manual trigger)
- `4.2` — Payment recording API with idempotency
- `4.3` — Fee dashboard UI (collection summary, overdue list)
- `4.4` — Student fee ledger UI
- `4.5` — Receipt generation

---

### Phase 5: Staff & Delegation Engine 🔲
**Goal:** Owner can add staff with role-based permissions, staff see scoped UI
**Requirements:** STAFF-01, STAFF-02, STAFF-03, STAFF-04, STAFF-05
**UI hint:** yes
**Success Criteria:**
1. Owner can add teacher/accountant with default permissions
2. Owner can create custom admin role with any permission combination
3. Staff login shows only permitted sidebar modules
4. API endpoints enforce permission checks (e.g., accountant can't mark attendance)
5. Owner can revoke/modify staff permissions

**Plans:**
- `5.1` — Staff CRUD API (add teacher/accountant/custom with permissions)
- `5.2` — Staff management UI (add staff form, permission matrix toggle grid)
- `5.3` — Permission-scoped sidebar and route guards
- `5.4` — Staff login flow testing

---

### Phase 6: Notifications 🔲
**Goal:** In-app notification system for fee reminders and absence alerts
**Requirements:** NOTIF-01, NOTIF-02, NOTIF-03
**UI hint:** yes
**Success Criteria:**
1. Notification bell shows unread count in header
2. Fee reminder auto-created 3 days before due date
3. Absence notification created same day for absent students
4. Notification list with read/unread state

**Plans:**
- `6.1` — Notification API and auto-generation triggers
- `6.2` — Notification UI (bell dropdown, notification list page)

---

### Phase 7: Reports & Settings 🔲
**Goal:** Analytics dashboards and institute configuration
**Requirements:** REPORT-01, REPORT-02, SET-01, SET-02
**UI hint:** yes
**Success Criteria:**
1. Fee collection report with daily/monthly view, filterable by batch
2. Attendance report per student and per batch with trend charts
3. Owner can edit institute profile (name, address, logo upload)
4. Owner can set academic year and notification preferences

**Plans:**
- `7.1` — Report APIs (fee collection aggregation, attendance analytics)
- `7.2` — Report UI (charts, tables, export-ready)
- `7.3` — Settings page UI (institute profile form, preferences)

---

*Last updated: 2026-05-04*
