import DashboardDrillDown from './components/DashboardDrillDown.tsx';

export default function DashboardPage() {
  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-ink tracking-tight">Dashboard</h1>
          <p className="text-base text-steel mt-1">
            Manage your batches, students, and staff in one place.
          </p>
        </div>
      </div>

      {/* Main Grid-Based Drill-Down UI */}
      <DashboardDrillDown />
    </div>
  );
}
