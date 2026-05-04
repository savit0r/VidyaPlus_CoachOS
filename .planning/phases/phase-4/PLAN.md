# Phase 4: Fee Collection & Payments — Execution Plan

## Goal
Generate dues from fee plans, record payments with different modes (cash/UPI/bank), track balances, and provide a fee dashboard for the institute owner.

## Requirements
- **PAY-01**: Auto-generate fee records (dues) from fee plans per billing period
- **PAY-02**: Record payments with mode (cash/UPI/bank/cheque) and reference number
- **PAY-03**: Fee dashboard with collection summary and overdue alerts
- **PAY-04**: Per-student fee ledger (all dues, payments, balance)
- **PAY-05**: Auto-numbered receipts for each payment

## Open Questions

> [!WARNING]
> **Clarification needed before execution:**
> 1. Should fee dues be generated automatically via a cron job, or triggered manually by the owner for now (e.g., "Generate Monthly Dues" button)?
> 2. For receipts, should we generate a PDF buffer on the backend, or a simple printable HTML view on the frontend?

## Proposed Changes

### Database & API Layer

#### [MODIFY] apps/api/prisma/schema.prisma
Ensure `FeeRecord`, `Payment`, and `Receipt` models are properly structured. Add relations if not complete (e.g., Payment to Receipt). Add `receiptNumber` logic.

#### [NEW] apps/api/src/modules/fees/fee.controller.ts
- `generateDues(req, res)`: Creates `FeeRecord` entries for active enrollments based on fee plans.
- `recordPayment(req, res)`: Handles payment creation, updates FeeRecord balance/status, generates Receipt.
- `getDashboardSummary(req, res)`: Aggregates collection vs outstanding, overdue list.
- `getStudentLedger(req, res)`: Fetches all fee records and payments for a specific student.

#### [NEW] apps/api/src/modules/fees/fee.routes.ts
Register new routes with proper permission checks (`fees.view`, `fees.collect`).

#### [MODIFY] apps/api/src/app.ts
Import and register the new `/api/v1/fees` routes.

---

### Frontend (Owner Portal)

#### [NEW] apps/web/src/features/fees/FeeDashboardPage.tsx
Fee dashboard showing:
- Top KPIs: Total Collected, Total Outstanding, Overdue Amount
- Overdue list table
- Recent transactions list

#### [NEW] apps/web/src/features/fees/StudentLedgerPage.tsx
A per-student view showing:
- Their active fee plans
- History of dues and payments
- A "Record Payment" modal with mode selection (Cash/UPI/etc.) and amount input.

#### [NEW] apps/web/src/features/fees/ReceiptView.tsx
A printable view for a generated receipt.

#### [MODIFY] apps/web/src/App.tsx
Wire up the `FeeDashboardPage` to the `/fees` or `/finance` route, replacing the placeholder.

## Verification Plan

### Automated Tests
- Test API `POST /api/v1/fees/dues/generate` manually via shell/Postman.
- Test API `POST /api/v1/fees/payments` to ensure balance calculations and statuses update correctly.

### Manual Verification
- Verify the Fee Dashboard UI renders the correct KPIs.
- Verify making a payment via the Student Ledger UI properly decreases the outstanding balance and generates a receipt number.
