# Phase 3: Attendance System — Execution Plan

## Goal
Owner/Teacher can mark batch attendance (present/absent/late per student), view attendance calendar, auto-lock after 24h, and see per-student attendance stats.

## Requirements
- ATT-01: Mark batch attendance (present/absent/late per student)
- ATT-02: Attendance calendar view (daily heatmap with absent highlights)
- ATT-03: Attendance lock after 24 hours (admin override available)
- ATT-04: Attendance summary per student (last 30 days stats)

## Plan 3.1 — Attendance API

### Files to Create/Modify
- `apps/api/src/modules/attendance/attendance.controller.ts` [NEW]
- `apps/api/src/modules/attendance/attendance.routes.ts` [NEW]
- `apps/api/src/app.ts` [MODIFY — register routes]

### API Endpoints
| Method | Path | Description | Permission |
|--------|------|-------------|------------|
| POST | `/attendance/mark` | Mark attendance for batch+date (bulk) | attendance.mark |
| GET | `/attendance/batch/:batchId` | Get attendance by batch+date range | attendance.view |
| GET | `/attendance/student/:studentId` | Get student attendance summary | attendance.view |
| GET | `/attendance/calendar/:batchId` | Calendar heatmap data (month view) | attendance.view |
| PATCH | `/attendance/:id` | Update single attendance record | attendance.edit |
| POST | `/attendance/lock` | Lock attendance for a batch+date | attendance.edit |

### Key Logic
1. **Bulk mark**: Accept array of `{ studentId, status }` for a batch+date
2. **Upsert pattern**: Use `@@unique([batchId, studentId, date])` to upsert
3. **Lock logic**: Records auto-lock 24h after marking; Owner can override
4. **Late submission flag**: If marking for a past date, set `isLateSubmission=true`
5. **Holiday check**: Skip dates that are holidays for the institute

## Plan 3.2 — Attendance UI

### Files to Create
- `apps/web/src/features/attendance/AttendancePage.tsx` [NEW]

### UI Components
1. **Batch selector** — dropdown to pick active batch
2. **Date picker** — defaults to today, can go back to mark missed days
3. **Student checklist** — shows all enrolled students with present/absent/late toggle
4. **Submit button** — marks attendance in bulk
5. **Calendar heatmap** — monthly grid showing attendance rates per day (green/yellow/red)
6. **Lock indicator** — shows if attendance is locked for the selected date

## Plan 3.3 — Stats Integration

### Dashboard KPIs
- Update DashboardPage to show "Today's Attendance" from API data
- Student profile (future) shows 30-day attendance breakdown

## Verification
- [ ] Mark attendance for JEE Mains Batch → verify records created
- [ ] Calendar shows color-coded cells for marked days
- [ ] Lock prevents editing after 24h
- [ ] Late submission flag set for backdated attendance
- [ ] API returns 403 for staff without attendance.mark permission

---
*Created: 2026-05-04*
