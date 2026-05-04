import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import {
  Calendar, CheckCircle2, XCircle, Clock, Users, ChevronLeft, ChevronRight,
  Loader2, Lock, AlertTriangle, BookOpen,
} from 'lucide-react';

const STATUS_CONFIG = {
  present: { label: 'P', color: 'bg-accent-500 text-white', ring: 'ring-accent-500', icon: CheckCircle2 },
  absent: { label: 'A', color: 'bg-danger-500 text-white', ring: 'ring-danger-500', icon: XCircle },
  late: { label: 'L', color: 'bg-warn-500 text-white', ring: 'ring-warn-500', icon: Clock },
} as const;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Batch { id: string; name: string; subject: string | null; daysJson: string[]; enrolledStudents: number }
interface StudentRow { userId: string; studentProfileId: string; name: string; phone: string; studentCode: string; status: string | null; note: string | null; recordId: string | null; isLocked: boolean }
interface CalendarDay { present: number; absent: number; late: number; total: number; isLocked: boolean }

export default function AttendancePage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [summary, setSummary] = useState<{ total: number; present: number; absent: number; late: number; unmarked: number } | null>(null);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [calendarData, setCalendarData] = useState<Record<string, CalendarDay>>({});
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [holidays, setHolidays] = useState<{ date: string; name: string }[]>([]);

  // Fetch batches
  useEffect(() => {
    api.get('/batches').then(({ data }) => {
      const active = data.data.filter((b: any) => b.status === 'active');
      setBatches(active);
      if (active.length > 0 && !selectedBatch) setSelectedBatch(active[0].id);
    }).catch(console.error);
  }, []);

  // Fetch attendance for selected batch + date
  const fetchAttendance = useCallback(async () => {
    if (!selectedBatch || !selectedDate) return;
    setLoading(true);
    setSaved(false);
    try {
      const { data } = await api.get(`/attendance/batch/${selectedBatch}`, { params: { date: selectedDate } });
      setStudents(data.data.students);
      setSummary(data.data.summary);
      // Initialize attendance map from existing records
      const map: Record<string, string> = {};
      data.data.students.forEach((s: StudentRow) => {
        if (s.status) map[s.userId] = s.status;
      });
      setAttendance(map);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [selectedBatch, selectedDate]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  // Fetch calendar heatmap
  const fetchCalendar = useCallback(async () => {
    if (!selectedBatch) return;
    try {
      const { data } = await api.get(`/attendance/calendar/${selectedBatch}`, { params: { month: calendarMonth, year: calendarYear } });
      setCalendarData(data.data.calendar);
      setHolidays(data.data.holidays);
    } catch (err) { console.error(err); }
  }, [selectedBatch, calendarMonth, calendarYear]);

  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

  // Toggle attendance status
  const cycleStatus = (userId: string) => {
    const current = attendance[userId];
    const next = !current ? 'present' : current === 'present' ? 'absent' : current === 'absent' ? 'late' : 'present';
    setAttendance(prev => ({ ...prev, [userId]: next }));
    setSaved(false);
  };

  // Mark all as present
  const markAllPresent = () => {
    const map: Record<string, string> = {};
    students.forEach(s => { map[s.userId] = 'present'; });
    setAttendance(map);
    setSaved(false);
  };

  // Save attendance
  const handleSave = async () => {
    if (!selectedBatch) return;
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({ studentId, status }));
      if (records.length === 0) return;
      await api.post('/attendance/mark', { batchId: selectedBatch, date: selectedDate, records });
      setSaved(true);
      fetchAttendance();
      fetchCalendar();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to save';
      alert(msg);
    } finally { setSaving(false); }
  };

  // Calendar rendering
  const renderCalendar = () => {
    const firstDay = new Date(calendarYear, calendarMonth - 1, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} />);
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const data = calendarData[dateStr];
      const holiday = holidays.find(h => h.date === dateStr);
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const isSelected = dateStr === selectedDate;

      let bg = 'bg-surface-100 text-surface-400';
      if (holiday) bg = 'bg-purple-50 text-purple-600';
      else if (data) {
        const rate = data.total > 0 ? (data.present + data.late) / data.total : 0;
        bg = rate >= 0.9 ? 'bg-accent-100 text-accent-700' : rate >= 0.7 ? 'bg-warn-100 text-warn-700' : 'bg-danger-100 text-danger-700';
      }

      cells.push(
        <button key={day} onClick={() => { setSelectedDate(dateStr); }}
          className={`w-9 h-9 rounded-lg text-xs font-medium transition-all ${bg} ${isSelected ? 'ring-2 ring-primary-500 ring-offset-1' : ''} ${isToday ? 'font-bold' : ''} hover:ring-2 hover:ring-primary-300`}
          title={holiday ? `🎉 ${holiday.name}` : data ? `P:${data.present} A:${data.absent} L:${data.late}` : 'No data'}>
          {day}
        </button>
      );
    }
    return cells;
  };

  const markedCount = Object.keys(attendance).length;
  const isAllLocked = students.length > 0 && students.every(s => s.isLocked);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Attendance</h1>
          <p className="text-sm text-surface-500 mt-1">Mark and track daily attendance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Marking Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Batch + Date Selectors */}
          <div className="bg-white rounded-xl shadow-card p-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-surface-600 mb-1.5">Batch</label>
                <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-surface-200 rounded-xl text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 shadow-sm">
                  {batches.length === 0 && <option>No batches found</option>}
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name} {b.subject ? `(${b.subject})` : ''}</option>)}
                </select>
              </div>
              <div className="w-44">
                <label className="block text-sm font-medium text-surface-600 mb-1.5">Date</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-surface-200 rounded-xl text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 shadow-sm" />
              </div>
              <button onClick={markAllPresent}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 transition-all whitespace-nowrap">
                Mark All Present
              </button>
            </div>
          </div>

          {/* Summary Bar */}
          {summary && !loading && (
            <div className="flex gap-3">
              {[
                { label: 'Total', value: summary.total, color: 'bg-surface-100 text-surface-600' },
                { label: 'Present', value: summary.present, color: 'bg-accent-50 text-accent-600' },
                { label: 'Absent', value: summary.absent, color: 'bg-danger-50 text-danger-600' },
                { label: 'Late', value: summary.late, color: 'bg-warn-50 text-warn-600' },
                { label: 'Unmarked', value: summary.unmarked, color: 'bg-surface-50 text-surface-500' },
              ].map(s => (
                <div key={s.label} className={`flex-1 rounded-xl px-3 py-2 text-center ${s.color}`}>
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Student List */}
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
              </div>
            ) : students.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                <p className="text-surface-500 font-medium">No students enrolled</p>
                <p className="text-sm text-surface-400 mt-1">Enroll students in this batch first</p>
              </div>
            ) : (
              <>
                {isAllLocked && (
                  <div className="flex items-center gap-2 px-5 py-3 bg-warn-50 border-b border-warn-200 text-warn-600 text-sm">
                    <Lock className="w-4 h-4" /> Attendance is locked for this date
                  </div>
                )}
                <div className="divide-y divide-surface-100">
                  {students.map(student => {
                    const currentStatus = attendance[student.userId];
                    const config = currentStatus ? STATUS_CONFIG[currentStatus as keyof typeof STATUS_CONFIG] : null;
                    return (
                      <div key={student.userId}
                        className={`flex items-center justify-between px-5 py-3 transition-colors ${currentStatus ? 'bg-surface-50/50' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-semibold">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-surface-900">{student.name}</p>
                            <p className="text-xs text-surface-400">{student.studentCode}</p>
                          </div>
                        </div>

                        {/* Status Toggle Buttons */}
                        <div className="flex items-center gap-2">
                          {student.isLocked && <Lock className="w-3.5 h-3.5 text-surface-400" />}
                          {(['present', 'absent', 'late'] as const).map(status => {
                            const sc = STATUS_CONFIG[status];
                            const isActive = currentStatus === status;
                            return (
                              <button key={status} onClick={() => !student.isLocked && setAttendance(prev => ({ ...prev, [student.userId]: status }))}
                                disabled={student.isLocked}
                                className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                                  isActive ? sc.color : 'bg-surface-100 text-surface-400 hover:bg-surface-200'
                                } ${student.isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                title={status.charAt(0).toUpperCase() + status.slice(1)}>
                                {sc.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Save Button */}
                <div className="px-5 py-4 border-t border-surface-200 bg-surface-50 flex items-center justify-between">
                  <p className="text-sm text-surface-500">{markedCount}/{students.length} marked</p>
                  <div className="flex items-center gap-3">
                    {saved && <span className="text-sm text-accent-500 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Saved!</span>}
                    <button onClick={handleSave} disabled={saving || markedCount === 0 || isAllLocked}
                      className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 shadow-sm transition-all">
                      {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><CheckCircle2 className="w-4 h-4" /> Save Attendance</>}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column — Calendar Heatmap */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-surface-900">Calendar</h3>
              <div className="flex items-center gap-1">
                <button onClick={() => { if (calendarMonth === 1) { setCalendarMonth(12); setCalendarYear(y => y - 1); } else { setCalendarMonth(m => m - 1); } }}
                  className="p-1 rounded hover:bg-surface-100"><ChevronLeft className="w-4 h-4 text-surface-400" /></button>
                <span className="text-sm font-medium text-surface-700 w-28 text-center">{MONTHS[calendarMonth - 1]} {calendarYear}</span>
                <button onClick={() => { if (calendarMonth === 12) { setCalendarMonth(1); setCalendarYear(y => y + 1); } else { setCalendarMonth(m => m + 1); } }}
                  className="p-1 rounded hover:bg-surface-100"><ChevronRight className="w-4 h-4 text-surface-400" /></button>
              </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map(d => <div key={d} className="text-center text-xs text-surface-400 font-medium py-1">{d}</div>)}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 mt-4 text-xs text-surface-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-accent-200" /> &gt;90%</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-warn-200" /> 70-90%</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-danger-200" /> &lt;70%</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-200" /> Holiday</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
