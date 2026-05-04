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
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 40%, #1e1b4b 100%)' }}>
      
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-20"
           style={{ background: 'radial-gradient(ellipse, rgba(99, 102, 241, 0.3), transparent 70%)' }} />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
               style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">CoachOS Admin</h1>
          <p className="text-surface-400 text-sm mt-1">Super Admin Console</p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-danger-500/10 border border-danger-500/20 rounded-lg px-4 py-3 text-danger-400 text-sm animate-scale-in">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-300 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                placeholder="admin@vidyaplus.in"
                required
                className="w-full px-4 py-3 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-admin-500/50 focus:border-admin-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-surface-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-admin-500/50 focus:border-admin-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: isLoading ? '#4338ca' : 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
              onMouseEnter={(e) => { if (!isLoading) (e.target as HTMLElement).style.background = 'linear-gradient(135deg, #818cf8, #6366f1)'; }}
              onMouseLeave={(e) => { if (!isLoading) (e.target as HTMLElement).style.background = 'linear-gradient(135deg, #6366f1, #4f46e5)'; }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In to Console'
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-surface-700/50 text-center">
            <p className="text-surface-500 text-xs">
              This console is restricted to CoachOS platform operators only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
