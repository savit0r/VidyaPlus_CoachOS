import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../../stores/auth.store';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAdminAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch { /* error handled by store */ }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
      {/* Abstract Background Accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-600/5 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/3" />

      <div className="relative w-full max-w-[440px] animate-fade-in">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-card border border-slate-100 mb-6 transition-transform hover:scale-105">
            <Shield className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">VidyaPlus</h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Super Admin Console</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-card p-10 border border-slate-100">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Operator Login</h2>
            <p className="text-slate-500 text-sm mt-2">Access the global platform management console</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center justify-between animate-fade-in">
              <span className="font-medium">{error}</span>
              <button onClick={clearError} className="ml-3 p-1 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0">✕</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[13px] font-semibold text-slate-700 ml-1">
                Admin Email
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  placeholder="operator@vidyaplus.com"
                  className="w-full bg-transparent px-5 py-4 text-slate-900 font-medium placeholder:text-slate-300 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="password" className="text-[13px] font-semibold text-slate-700">
                  Password
                </label>
                <a href="#" className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">Forgot?</a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  placeholder="••••••••"
                  className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30 active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Sign In to Admin Console'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-[11px] font-medium italic">
              Access restricted to CoachOS platform operators only.
            </p>
          </div>
        </div>

        <p className="text-center text-slate-400 text-[10px] font-semibold uppercase tracking-widest mt-8">
          © 2026 VidyaPlus Technologies
        </p>
      </div>
    </div>
  );
}
