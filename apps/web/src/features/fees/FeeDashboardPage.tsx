import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  Wallet, TrendingUp, AlertCircle, FileText, ChevronRight,
  Loader2, DollarSign, RefreshCw, Search, CheckCircle2, User,
  PlusCircle, CreditCard, ArrowUpRight, ArrowDownRight, LayoutDashboard,
  Users, UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FeeCollectionDrawer from './components/FeeCollectionDrawer';
import PayrollDrawer from './components/PayrollDrawer';

interface FinanceKPIs {
  revenue: {
    totalCollected: number;
    totalOutstanding: number;
    defaulters: number;
  };
  expense: {
    totalPaid: number;
    totalPending: number;
  };
}

interface SearchResult {
  id: string;
  name: string;
  type: 'student' | 'staff';
  subtext: string;
  code: string;
}

export default function FeeDashboardPage() {
  const [activeTab, setActiveTab] = useState<'revenue' | 'expense'>('revenue');
  const [kpis, setKpis] = useState<FinanceKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const fetchFinanceData = async () => {
    try {
      const { data } = await api.get('/fees/dashboard');
      setKpis({
        revenue: {
          totalCollected: data.data.kpis.totalCollected,
          totalOutstanding: data.data.kpis.totalOutstanding,
          defaulters: data.data.kpis.overdueRecordsCount
        },
        expense: {
          totalPaid: 45000, 
          totalPending: 12000
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const [studentRes, staffRes] = await Promise.all([
          api.get('/students', { params: { search: searchQuery, limit: 3 } }),
          api.get('/staff', { params: { search: searchQuery, limit: 2 } }).catch(() => ({ data: { data: [] } }))
        ]);

        const students = studentRes.data.data.map((s: any) => ({
          id: s.id, name: s.name, type: 'student', code: s.studentProfile?.studentCode || 'STU', subtext: 'Student Fee Collection'
        }));
        
        const staff = (staffRes.data?.data || []).map((s: any) => ({
          id: s.id, name: s.name, type: 'staff', code: s.employeeId || 'STAFF', subtext: 'Staff Salary Payout'
        }));

        setSearchResults([...students, ...staff]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (loading && !kpis) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        <p className="text-[11px] font-black text-steel uppercase tracking-[0.1em] mt-6">Syncing Financial Records...</p>
      </div>
    );
  }

  const netFlow = (kpis?.revenue.totalCollected || 0) - (kpis?.expense.totalPaid || 0);

  return (
    <div className="animate-fade-in pb-20 max-w-[1400px] mx-auto px-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8 pt-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-ink tracking-tighter">Finance Command Center</h1>
          <p className="text-sm text-slate font-medium">Developer-grade financial oversight for revenue and payroll.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-full sm:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              {isSearching ? <Loader2 className="w-3.5 h-3.5 text-brand-green animate-spin" /> : <Search className="w-3.5 h-3.5 text-steel group-focus-within:text-brand-green transition-colors" />}
            </div>
            <input
              type="text"
              placeholder="Search Student or Staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-5 bg-surface border border-hairline rounded-md text-sm font-medium focus:border-brand-green transition-all outline-none"
            />
            
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-canvas rounded-lg shadow-premium border border-hairline overflow-hidden z-[100] p-1.5 animate-slide-up">
                {searchResults.map(s => (
                  <button key={s.id} 
                    onClick={() => { 
                      if (s.type === 'student') setSelectedStudentId(s.id);
                      else setSelectedStaffId(s.id);
                      setSearchQuery(''); 
                      setSearchResults([]); 
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-surface flex items-center gap-4 rounded-md transition-all group/item">
                    <div className={`w-9 h-9 rounded-md flex items-center justify-center font-bold text-sm ${s.type === 'student' ? 'bg-brand-green-soft text-brand-green-deep' : 'bg-brand-tag/10 text-brand-tag'}`}>
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-ink group-hover/item:text-brand-green transition-colors">{s.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                         <span className="text-[10px] text-steel font-mono">{s.code}</span>
                         <span className="w-1 h-1 rounded-full bg-hairline" />
                         <span className="text-[10px] text-steel font-medium">{s.subtext}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-muted group-hover/item:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-surface p-1 rounded-full border border-hairline flex gap-1">
             <button onClick={() => setActiveTab('revenue')}
               className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === 'revenue' ? 'bg-primary text-on-primary shadow-sm' : 'text-steel hover:text-ink'}`}>
               Revenue
             </button>
             <button onClick={() => setActiveTab('expense')}
               className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === 'expense' ? 'bg-primary text-on-primary shadow-sm' : 'text-steel hover:text-ink'}`}>
               Expenses
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
         <div className="lg:col-span-2 hero-backdrop rounded-lg p-10 border border-hairline relative overflow-hidden group">
            <div className="relative z-10 flex flex-col h-full justify-between">
               <div className="flex items-center justify-between mb-8">
                  <div className="p-3 bg-white/40 backdrop-blur-md rounded-lg border border-white/20 shadow-sm">
                     <TrendingUp className="w-6 h-6 text-brand-green-deep" />
                  </div>
                  <div className="px-3 py-1 bg-brand-green text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                     Flow Positive
                  </div>
               </div>
               <div>
                  <p className="text-[11px] font-black text-steel uppercase tracking-[0.2em] mb-2">Net Financial Pulse</p>
                  <div className="flex items-baseline gap-3">
                     <h2 className="text-6xl font-black tracking-tighter text-ink font-mono">₹{netFlow.toLocaleString()}</h2>
                     <ArrowUpRight className="w-8 h-8 text-brand-green-deep animate-pulse" />
                  </div>
               </div>
               <div className="mt-12 grid grid-cols-2 gap-8 border-t border-hairline pt-10">
                  <div>
                     <p className="text-[10px] font-black text-steel uppercase tracking-widest mb-2">Total Collections</p>
                     <p className="text-xl font-black text-ink font-mono">₹{kpis?.revenue.totalCollected.toLocaleString()}</p>
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-steel uppercase tracking-widest mb-2">Payroll & Overheads</p>
                     <p className="text-xl font-black text-ink font-mono">₹{kpis?.expense.totalPaid.toLocaleString()}</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="mint-card p-10 flex flex-col justify-between">
            <div>
               <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-8 ${activeTab === 'revenue' ? 'bg-brand-green-soft text-brand-green-deep' : 'bg-rose-50 text-brand-error'}`}>
                  {activeTab === 'revenue' ? <UserCheck className="w-5.5 h-5.5" /> : <Users className="w-5.5 h-5.5" />}
               </div>
               <p className="text-[11px] font-black text-steel uppercase tracking-widest mb-2">{activeTab === 'revenue' ? 'Active Defaulters' : 'Staff Count'}</p>
               <h3 className="text-4xl font-black text-ink font-mono">{activeTab === 'revenue' ? kpis?.revenue.defaulters : '12'}</h3>
            </div>
            <div className="mt-10">
               <button className="mint-btn-secondary w-full text-[11px] uppercase tracking-widest">
                  {activeTab === 'revenue' ? 'Defaulter Wall' : 'Payroll Sheet'}
               </button>
            </div>
         </div>

         <div className="mint-card p-10 flex flex-col justify-between">
            <div>
               <div className="w-11 h-11 rounded-lg bg-surface text-ink border border-hairline flex items-center justify-center mb-8">
                  <CreditCard className="w-5.5 h-5.5" />
               </div>
               <p className="text-[11px] font-black text-steel uppercase tracking-widest mb-2">{activeTab === 'revenue' ? 'Overdue Receivables' : 'Pending Salaries'}</p>
               <h3 className="text-4xl font-black text-ink font-mono">₹{activeTab === 'revenue' ? kpis?.revenue.totalOutstanding.toLocaleString() : kpis?.expense.totalPending.toLocaleString()}</h3>
            </div>
            <div className="mt-10">
               <button className="mint-btn-primary w-full text-[11px] uppercase tracking-widest shadow-premium">
                  {activeTab === 'revenue' ? 'Send Reminders' : 'Disburse All'}
               </button>
            </div>
         </div>
      </div>

      <div className="space-y-10">
         <div className="flex items-center justify-between border-b border-hairline pb-4">
            <h2 className="text-sm font-black text-ink uppercase tracking-[0.1em]">{activeTab === 'revenue' ? 'Top Pending Collections' : 'Staff Payroll Quick-Actions'}</h2>
            <button onClick={fetchFinanceData} className="p-1.5 text-steel hover:text-ink transition-colors">
               <RefreshCw className="w-3.5 h-3.5" />
            </button>
         </div>

         {activeTab === 'revenue' ? (
            <div className="mint-card overflow-hidden">
                <div className="divide-y divide-hairline">
                  {[
                    { name: 'Rahul Sharma', code: 'STU001', amount: 5000, days: 12 },
                    { name: 'Priya Verma', code: 'STU014', amount: 3500, days: 5 },
                    { name: 'Arjun Gupta', code: 'STU022', amount: 2000, days: 2 }
                  ].map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-6 hover:bg-surface transition-all group cursor-pointer"
                      onClick={() => setSelectedStudentId('mock-student-id')}>
                       <div className="flex items-center gap-5">
                          <div className="w-10 h-10 rounded-lg bg-surface border border-hairline text-ink flex items-center justify-center font-black">
                             {d.name.charAt(0)}
                          </div>
                          <div>
                             <p className="text-sm font-black text-ink group-hover:text-brand-green-deep transition-colors">{d.name}</p>
                             <p className="text-[11px] font-medium text-slate uppercase tracking-widest mt-0.5 font-mono">{d.code} • {d.days}D OVERDUE</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-brand-error font-mono">₹{d.amount.toLocaleString()}</p>
                          <div className="flex items-center gap-1 justify-end text-[8px] font-black text-brand-green-deep uppercase mt-1.5 opacity-0 group-hover:opacity-100 transition-all tracking-wider">
                             Collect <ChevronRight className="w-2.5 h-2.5" />
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
            </div>
         ) : (
            <div className="mint-card overflow-hidden">
                <div className="divide-y divide-hairline">
                  {[
                    { name: 'Dr. Sameer Khan', role: 'Senior Faculty', amount: 45000, status: 'Pending' },
                    { name: 'Meera Deshmukh', role: 'Admin Staff', amount: 12000, status: 'Partial' }
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-6 hover:bg-surface transition-all group cursor-pointer"
                      onClick={() => setSelectedStaffId('mock-staff-id')}>
                       <div className="flex items-center gap-5">
                          <div className="w-10 h-10 rounded-lg bg-surface border border-hairline text-ink flex items-center justify-center font-black">
                             {s.name.charAt(0)}
                          </div>
                          <div>
                             <p className="text-sm font-black text-ink group-hover:text-brand-green-deep transition-colors">{s.name}</p>
                             <p className="text-[11px] font-medium text-slate uppercase tracking-widest mt-0.5">{s.role} • SALARY {s.status}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-ink font-mono">₹{s.amount.toLocaleString()}</p>
                          <div className="flex items-center gap-1 justify-end text-[8px] font-black text-brand-tag uppercase mt-1.5 opacity-0 group-hover:opacity-100 transition-all tracking-wider">
                             Disburse <ChevronRight className="w-2.5 h-2.5" />
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
            </div>
         )}
      </div>

      <FeeCollectionDrawer 
        studentId={selectedStudentId} 
        onClose={() => setSelectedStudentId(null)}
        onSuccess={fetchFinanceData}
      />

      <PayrollDrawer
        staffId={selectedStaffId}
        onClose={() => setSelectedStaffId(null)}
        onSuccess={fetchFinanceData}
      />
    </div>
  );
}
