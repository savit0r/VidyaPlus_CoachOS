import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  TrendingUp, IndianRupee, Calendar, BarChart2, CheckCircle2,
  AlertCircle, RefreshCw, Loader2, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface FeeSummary {
  totalDues: number;
  totalCollected: number;
  totalOutstanding: number;
  batchSummary: {
    batchId: string;
    batchName: string;
    collected: number;
    outstanding: number;
    total: number;
  }[];
  monthSummary: {
    month: string;
    collected: number;
    outstanding: number;
  }[];
}

interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  attendanceRate: number;
  batchSummary: {
    batchId: string;
    batchName: string;
    attendanceRate: number;
    total: number;
    present: number;
    absent: number;
    late: number;
  }[];
}

export default function ReportsPage() {
  const [feeData, setFeeData] = useState<FeeSummary | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'financial' | 'attendance'>('financial');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [fRes, aRes] = await Promise.all([
        api.get('/reports/fee-summary'),
        api.get('/reports/attendance-summary'),
      ]);
      setFeeData(fRes.data.data);
      setAttendanceData(aRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary-500" /> Institute Analytics Hub
          </h1>
          <p className="text-sm text-surface-500 mt-1">Cross-module operational and financial breakdown reports</p>
        </div>
        <button onClick={fetchReports}
          className="flex items-center gap-2 px-4 py-2.5 bg-surface-100 text-surface-700 hover:bg-surface-200 rounded-xl border border-surface-200 text-sm font-medium transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-surface-100 border border-surface-200 rounded-xl mb-8 max-w-sm">
        <button onClick={() => setActiveTab('financial')}
          className={`flex-1 py-2 text-center text-sm font-medium rounded-lg transition-all ${activeTab === 'financial' ? 'bg-white text-surface-900 shadow-sm font-semibold' : 'text-surface-500 hover:text-surface-800'}`}>
          Financial Overview
        </button>
        <button onClick={() => setActiveTab('attendance')}
          className={`flex-1 py-2 text-center text-sm font-medium rounded-lg transition-all ${activeTab === 'attendance' ? 'bg-white text-surface-900 shadow-sm font-semibold' : 'text-surface-500 hover:text-surface-800'}`}>
          Attendance Trends
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      )}

      {!loading && activeTab === 'financial' && feeData && (
        <div className="space-y-8 animate-fade-in">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-surface-100 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500 font-medium">Total Dues Generated</p>
                <h3 className="text-2xl font-bold text-surface-900 mt-1.5">₹{feeData.totalDues.toLocaleString()}</h3>
                <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md font-medium inline-block mt-2">All Billing Periods</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 bg-white border border-surface-100 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500 font-medium">Total Fees Collected</p>
                <h3 className="text-2xl font-bold text-accent-700 mt-1.5">₹{feeData.totalCollected.toLocaleString()}</h3>
                <span className="text-xs text-accent-700 bg-accent-50 px-2 py-0.5 rounded-md font-medium inline-block mt-2">Received</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent-50 flex items-center justify-center text-accent-600">
                <ArrowUpRight className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 bg-white border border-surface-100 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500 font-medium">Total Balance Outstanding</p>
                <h3 className="text-2xl font-bold text-danger-600 mt-1.5">₹{feeData.totalOutstanding.toLocaleString()}</h3>
                <span className="text-xs text-danger-700 bg-danger-50 px-2 py-0.5 rounded-md font-medium inline-block mt-2">Awaiting Payment</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-danger-50 flex items-center justify-center text-danger-600">
                <ArrowDownRight className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Batch Performance Breakdown */}
          <div className="bg-white rounded-2xl shadow-card border border-surface-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
              <h3 className="font-bold text-surface-900">Breakdown by Batch</h3>
              <span className="text-xs font-semibold text-primary-700 bg-primary-50/50 px-2.5 py-1 rounded-lg">Financial Performance</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-50 text-xs uppercase tracking-wider text-surface-500 font-medium border-b border-surface-100">
                    <th className="px-6 py-3">Batch Name</th>
                    <th className="px-6 py-3">Paid Collections</th>
                    <th className="px-6 py-3">Pending Balances</th>
                    <th className="px-6 py-3">Total Billings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {feeData.batchSummary.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-surface-400">No batch records found.</td></tr>
                  ) : (
                    feeData.batchSummary.map(b => (
                      <tr key={b.batchId} className="hover:bg-surface-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-surface-900">{b.batchName}</td>
                        <td className="px-6 py-4 font-bold text-accent-700">₹{b.collected.toLocaleString()}</td>
                        <td className="px-6 py-4 font-bold text-danger-600">₹{b.outstanding.toLocaleString()}</td>
                        <td className="px-6 py-4 font-bold text-surface-700">₹{b.total.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!loading && activeTab === 'attendance' && attendanceData && (
        <div className="space-y-8 animate-fade-in">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 bg-white border border-surface-100 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500 font-medium">Total Attendance Rate</p>
                <h3 className="text-3xl font-bold text-surface-900 mt-1.5">{attendanceData.attendanceRate}%</h3>
                <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md font-medium inline-block mt-2">Cumulative</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                <BarChart2 className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 bg-white border border-surface-100 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500 font-medium">Present Checkins</p>
                <h3 className="text-2xl font-bold text-accent-700 mt-1.5">{attendanceData.present}</h3>
                <span className="text-xs text-accent-700 bg-accent-50 px-2 py-0.5 rounded-md font-medium inline-block mt-2">Sessions Attended</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent-50 flex items-center justify-center text-accent-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 bg-white border border-surface-100 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500 font-medium">Absences Logged</p>
                <h3 className="text-2xl font-bold text-danger-600 mt-1.5">{attendanceData.absent}</h3>
                <span className="text-xs text-danger-700 bg-danger-50 px-2 py-0.5 rounded-md font-medium inline-block mt-2">Missed Sessions</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-danger-50 flex items-center justify-center text-danger-600">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 bg-white border border-surface-100 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500 font-medium">Late Entries</p>
                <h3 className="text-2xl font-bold text-surface-700 mt-1.5">{attendanceData.late}</h3>
                <span className="text-xs text-surface-500 bg-surface-100 px-2 py-0.5 rounded-md font-medium inline-block mt-2">Delayed Arrival</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center text-surface-600">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Attendance breakdown by batch */}
          <div className="bg-white rounded-2xl shadow-card border border-surface-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
              <h3 className="font-bold text-surface-900">Attendance by Batch</h3>
              <span className="text-xs font-semibold text-primary-700 bg-primary-50/50 px-2.5 py-1 rounded-lg">Student Attendance Matrix</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-50 text-xs uppercase tracking-wider text-surface-500 font-medium border-b border-surface-100">
                    <th className="px-6 py-3">Batch Name</th>
                    <th className="px-6 py-3">Attendance Rate</th>
                    <th className="px-6 py-3">Present</th>
                    <th className="px-6 py-3">Absent</th>
                    <th className="px-6 py-3">Total Records</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {attendanceData.batchSummary.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-surface-400">No attendance trends found.</td></tr>
                  ) : (
                    attendanceData.batchSummary.map(b => (
                      <tr key={b.batchId} className="hover:bg-surface-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-surface-900">{b.batchName}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded-lg ${b.attendanceRate >= 75 ? 'bg-accent-50 text-accent-700' : 'bg-danger-50 text-danger-700'}`}>
                            {b.attendanceRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-accent-700">{b.present}</td>
                        <td className="px-6 py-4 font-medium text-danger-600">{b.absent}</td>
                        <td className="px-6 py-4 text-surface-600 font-medium">{b.total}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
