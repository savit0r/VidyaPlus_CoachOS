import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import {
  ArrowLeft, Building2, Users, BookOpen, CreditCard, Settings,
  Mail, Phone, MapPin, Calendar, Shield, Loader2, AlertTriangle,
  CheckCircle2, XCircle, Pencil, Trash2, UserCheck,
} from 'lucide-react';

interface InstituteDetail {
  id: string; name: string; subdomain: string; phone: string; email: string | null;
  address: string | null; logoUrl: string | null; status: string; academicYear: string | null;
  setupCompleted: boolean; createdAt: string; updatedAt: string;
  plan: { id: string; name: string; maxStudents: number; maxStaff: number; maxStorageMb: number; priceMonthly: string } | null;
  _count: { users: number; batches: number; studentProfiles: number; feePlans: number };
  users: { id: string; name: string; phone: string; email: string | null; role: string; status: string; lastLoginAt: string | null; createdAt: string }[];
}

const STATUS_ACTIONS: Record<string, { label: string; to: string; color: string }> = {
  active: { label: 'Suspend', to: 'suspended', color: 'bg-warn-500/10 text-warn-400 hover:bg-warn-500/20' },
  suspended: { label: 'Reactivate', to: 'active', color: 'bg-accent-500/10 text-accent-400 hover:bg-accent-500/20' },
  inactive: { label: 'Reactivate', to: 'active', color: 'bg-accent-500/10 text-accent-400 hover:bg-accent-500/20' },
};

const ROLE_BADGES: Record<string, string> = {
  owner: 'bg-admin-600/20 text-admin-300',
  teacher: 'bg-accent-500/15 text-accent-400',
  accountant: 'bg-warn-500/15 text-warn-400',
  staff: 'bg-surface-600/30 text-surface-300',
  student: 'bg-surface-700/30 text-surface-400',
  parent: 'bg-surface-700/30 text-surface-400',
};

export default function InstituteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [institute, setInstitute] = useState<InstituteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/super-admin/institutes/${id}`)
      .then(({ data }) => setInstitute(data.data))
      .catch(() => navigate('/institutes'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!institute) return;
    setUpdating(true);
    try {
      await api.patch(`/super-admin/institutes/${institute.id}`, { status: newStatus });
      setInstitute(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-admin-400 animate-spin" />
      </div>
    );
  }

  if (!institute) return null;

  const statusAction = STATUS_ACTIONS[institute.status];
  const owner = institute.users.find(u => u.role === 'owner');
  const staffMembers = institute.users.filter(u => u.role !== 'student' && u.role !== 'parent');

  return (
    <div className="animate-fade-in">
      {/* Back Button */}
      <button onClick={() => navigate('/institutes')} className="flex items-center gap-2 text-sm text-surface-400 hover:text-white mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Institutes
      </button>

      {/* Header Card */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-admin-600/20 flex items-center justify-center text-admin-300 text-xl font-bold">
              {institute.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{institute.name}</h1>
              <p className="text-sm text-surface-400">{institute.subdomain}.coachos.in</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-surface-500">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{institute.phone}</span>
                {institute.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{institute.email}</span>}
                {institute.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{institute.address}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              institute.status === 'active' ? 'bg-accent-500/10 text-accent-400'
              : institute.status === 'suspended' ? 'bg-warn-500/10 text-warn-400'
              : 'bg-danger-500/10 text-danger-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                institute.status === 'active' ? 'bg-accent-500' : institute.status === 'suspended' ? 'bg-warn-500' : 'bg-danger-500'
              }`} />
              {institute.status.charAt(0).toUpperCase() + institute.status.slice(1)}
            </span>

            {/* Action Buttons */}
            {statusAction && (
              <button
                onClick={() => handleStatusChange(statusAction.to)}
                disabled={updating}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${statusAction.color}`}
              >
                {updating ? 'Updating...' : statusAction.label}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface-800/30 rounded-xl p-1 w-fit">
        {[
          { key: 'overview', label: 'Overview', icon: Building2 },
          { key: 'users', label: `Users (${institute.users.length})`, icon: Users },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key ? 'bg-admin-600/20 text-admin-300' : 'text-surface-400 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Users', value: institute._count.users, icon: Users, color: '#6366f1' },
              { label: 'Students', value: institute._count.studentProfiles, icon: UserCheck, color: '#10b981' },
              { label: 'Batches', value: institute._count.batches, icon: BookOpen, color: '#f59e0b' },
              { label: 'Fee Plans', value: institute._count.feePlans, icon: CreditCard, color: '#ef4444' },
            ].map(stat => (
              <div key={stat.label} className="glass-card rounded-xl p-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: stat.color + '15' }}>
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-surface-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Plan Info */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-3">Subscription Plan</h3>
            {institute.plan ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">{institute.plan.name}</span>
                  <span className="text-sm text-admin-300">₹{Number(institute.plan.priceMonthly).toLocaleString()}/mo</span>
                </div>
                <div className="space-y-2 text-xs text-surface-400">
                  <div className="flex justify-between"><span>Max Students</span><span className="text-white">{institute.plan.maxStudents}</span></div>
                  <div className="flex justify-between"><span>Max Staff</span><span className="text-white">{institute.plan.maxStaff}</span></div>
                  <div className="flex justify-between"><span>Storage</span><span className="text-white">{(institute.plan.maxStorageMb / 1000).toFixed(1)} GB</span></div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-surface-500">No plan assigned</p>
            )}
          </div>

          {/* Owner Info */}
          {owner && (
            <div className="lg:col-span-3 glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-3">Owner</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-admin-600/20 flex items-center justify-center text-admin-300 font-bold">
                  {owner.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{owner.name}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-surface-400">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{owner.phone}</span>
                    {owner.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{owner.email}</span>}
                    <span>Last login: {owner.lastLoginAt ? new Date(owner.lastLoginAt).toLocaleDateString('en-IN') : 'Never'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-700/30">
                {['Name', 'Role', 'Phone', 'Status', 'Last Login', 'Joined'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-surface-400 uppercase tracking-wider px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staffMembers.map(user => (
                <tr key={user.id} className="border-b border-surface-800/20 hover:bg-surface-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-700 flex items-center justify-center text-xs font-medium text-surface-300">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        {user.email && <p className="text-xs text-surface-500">{user.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGES[user.role] || ROLE_BADGES.staff}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-surface-300">{user.phone}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${user.status === 'active' ? 'text-accent-400' : 'text-danger-400'}`}>
                      {user.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-surface-400">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                  </td>
                  <td className="px-5 py-3 text-sm text-surface-400">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
