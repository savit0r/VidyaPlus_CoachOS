import { useState } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { GraduationCap, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch {
      // Error handled in store
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Hero */}
      <div className="hero-backdrop flex-shrink-0 py-8 px-4 text-center border-b border-hairline">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-ink flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-brand-green" />
          </div>
          <div className="text-left">
            <h1 className="text-lg font-bold text-ink tracking-tight">VidyaPlus</h1>
            <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Staff Portal</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-ink tracking-tight">Staff Sign In</h2>
            <p className="text-sm text-steel">Use the credentials provided by your institute.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-lg bg-brand-error/10 border border-brand-error/20 text-sm text-brand-error font-medium animate-fade-in">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-ink-muted uppercase tracking-widest">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                placeholder="you@example.com"
                required
                className="input-field"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-ink-muted uppercase tracking-widest">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  placeholder="Enter your password"
                  required
                  className="input-field pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mint-btn-primary h-11 text-sm font-bold"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-stone">
            Contact your institute administrator for login credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
