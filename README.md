# CoachOS: Coaching Institute Management Platform

An enterprise-grade, multi-tenant software as a service (SaaS) tailored for modern coaching hubs.

## 🚀 Key Features

### Milestone 1 — Core Operations & Data Scope
- **Foundation & Setup**: Full multi-tenant context handling with JWT-based auth and tenant isolation.
- **Academic Management**: Robust Student Profile CRUD, Batch creation with conflict detection, and academic scheduling.
- **Attendance Management**: Attendance marking (Present, Absent, Late) with color-coded heatmap calendars and a 24-hour locking mechanism.
- **Fee Collection Engine**: Automatic generation of monthly, quarterly, and course-wide dues with ad-hoc receipts.
- **Role Delegation Platform**: Custom administrative roles, scoped routing views, and payroll tracking.
- **Notifications Hub**: Automatic alerts triggered for overdue payments and absence tracking.
- **Real-Time Dashboards**: Beautiful, dynamic financial metrics and attendance summaries.

## 🔧 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   cd vidyaplus2.0
   ```

2. **Configure Environment Variables**:
   Create an `.env` file in `apps/api/` with the following variables:
   ```env
   DATABASE_URL="postgresql://user:password@hostname/dbname?sslmode=require"
   JWT_ACCESS_SECRET="your-jwt-access-secret"
   JWT_REFRESH_SECRET="your-jwt-refresh-secret"
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Initialize database schema**:
   ```bash
   npm run db:generate --workspace=@coachOS/api
   npm run db:migrate --workspace=@coachOS/api
   npm run db:seed --workspace=@coachOS/api
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

## 📐 Architecture & Multi-Tenant Isolation
- **Tenant Scope Check**: Each database query is scoped across the user's `instituteId` context.
- **Cross-Tenant Coexistence**: A single user can hold different roles across separate institutes (e.g., teacher in Institute A and owner of Institute B) using their same phone number without any database collision.
- **Premium User Experience**: Responsive layout with a sticky flex sidebar that prevents overlap on any viewport size.
