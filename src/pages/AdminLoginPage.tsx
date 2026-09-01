import { useState } from 'react';
import { Shield, Lock, Mail, User, Key, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { checkIsAdmin } from '../utils/roleUtils';

interface AdminLoginPageProps {
  onLoginSuccess?: () => void;
}

export function AdminLoginPage({ onLoginSuccess }: AdminLoginPageProps) {
  const { login, adminLogin, adminRegister } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Form states initialized empty (No prefilled demo credentials)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [adminSecretKey, setAdminSecretKey] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigateToDashboard = () => {
    if (onLoginSuccess) {
      onLoginSuccess();
    } else {
      window.history.pushState({}, '', '/admin');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // 1. Try real Admin API login (POST /auth/admin/login)
      try {
        await adminLogin({ email: email.trim(), password });
      } catch {
        // Fallback to standard login endpoint (POST /auth/login)
        await login({ email: email.trim(), password });
      }

      const currentUser = useAuthStore.getState().user;
      const isAdminUser = checkIsAdmin(currentUser);

      // Strict role verification: only ADMIN / SUPER_ADMIN role permitted
      if (currentUser && isAdminUser) {
        setSuccess('Admin authenticated! Redirecting to dashboard...');
        setTimeout(navigateToDashboard, 400);
        return;
      } else {
        // Access Denied for customer accounts — log out and notify
        useAuthStore.getState().logout();
        setError('Access Denied: Only authorized administrators can access the Admin Portal.');
        setIsLoading(false);
        return;
      }
    } catch (_err: any) {
      const rawMsg = _err?.message || _err?.error;
      const errMsg = Array.isArray(rawMsg)
        ? rawMsg.join(' · ')
        : typeof rawMsg === 'string'
        ? rawMsg
        : 'Invalid admin credentials or server error. Access restricted to Administrators only.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError('Please fill in all required registration fields.');
      setIsLoading(false);
      return;
    }

    try {
      // Call POST /auth/admin/register
      await adminRegister({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        adminSecretKey: adminSecretKey.trim() || undefined,
      });

      setSuccess('Admin account created! Logging in...');

      // Auto login after registration
      try {
        await adminLogin({ email: email.trim(), password });
      } catch {
        await login({ email: email.trim(), password });
      }

      const currentUser = useAuthStore.getState().user;
      if (currentUser && checkIsAdmin(currentUser)) {
        setTimeout(navigateToDashboard, 400);
      } else {
        setActiveTab('login');
      }
    } catch (_err: any) {
      const rawMsg = _err?.message || _err?.error;
      const errMsg = Array.isArray(rawMsg)
        ? rawMsg.join(' · ')
        : typeof rawMsg === 'string'
        ? rawMsg
        : 'Failed to create admin account. Check secret key or credentials.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-crimson/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-brand-crimson text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-brand-crimson/30">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display tracking-tight">
              NiaKylie Admin Portal
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Management & Executive Control Center</p>
          </div>
        </div>

        {/* Tab Toggle (Sign In vs Register Admin) */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'login'
                ? 'bg-brand-crimson text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Admin Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setError(''); setSuccess(''); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'register'
                ? 'bg-brand-crimson text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Admin</span>
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  id="admin-login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email address"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl pl-10 pr-4 py-3 text-xs font-medium outline-none focus:border-brand-crimson transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                Security Password
              </label>
              <div className="relative">
                <input
                  id="admin-login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl pl-10 pr-10 py-3 text-xs font-medium outline-none focus:border-brand-crimson transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !!success}
              className="w-full bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg shadow-brand-crimson/20 flex items-center justify-center space-x-2 uppercase tracking-wider transition-all disabled:opacity-60 mt-2"
            >
              <span>{isLoading ? 'AUTHENTICATING...' : success ? 'REDIRECTING...' : 'LOG IN TO ADMIN DASHBOARD'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* REGISTER FORM (POST /auth/admin/register) */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">First Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl pl-9 pr-3 py-2.5 text-xs font-medium outline-none focus:border-brand-crimson"
                  />
                  <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl px-3 py-2.5 text-xs font-medium outline-none focus:border-brand-crimson"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Admin Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email address"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl pl-9 pr-3 py-2.5 text-xs font-medium outline-none focus:border-brand-crimson"
                />
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Password (Min 8 Chars)</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl pl-9 pr-9 py-2.5 text-xs font-medium outline-none focus:border-brand-crimson"
                />
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Admin Secret Key */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                Admin Registration Secret Key
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={adminSecretKey}
                  onChange={(e) => setAdminSecretKey(e.target.value)}
                  placeholder="Enter administrative registration key"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl pl-9 pr-3 py-2.5 text-xs font-mono outline-none focus:border-brand-crimson"
                />
                <Key className="w-3.5 h-3.5 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[10px] text-slate-500">Required by backend guard for administrative privileges.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !!success}
              className="w-full bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg shadow-brand-crimson/20 flex items-center justify-center space-x-2 uppercase tracking-wider transition-all disabled:opacity-60 mt-2"
            >
              <span>{isLoading ? 'CREATING ADMIN ACCOUNT...' : 'REGISTER NEW ADMINISTRATOR'}</span>
              <UserPlus className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Back link */}
        <div className="text-center pt-2 border-t border-slate-800">
          <a href="/" className="text-xs text-slate-500 hover:text-white transition-colors">
            ← Return to Customer Storefront
          </a>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
