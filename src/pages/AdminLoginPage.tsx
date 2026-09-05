import { useState, useEffect } from 'react';
import { Shield, Lock, Mail, User, Key, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, UserPlus, LogIn, ShieldCheck, Clock, RefreshCw, KeyRound } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { checkIsAdmin } from '../utils/roleUtils';
import { authApi } from '../api/auth';

interface AdminLoginPageProps {
  onLoginSuccess?: () => void;
}

export function AdminLoginPage({ onLoginSuccess }: AdminLoginPageProps) {
  const { login, adminLogin, adminRegister, sendOtp, verifyOtp } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'verify' | 'forgot' | 'reset_password'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [adminSecretKey, setAdminSecretKey] = useState('');

  // OTP Verification states
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 5-minute countdown timer effect
  useEffect(() => {
    let timer: any;
    if ((activeTab === 'verify' || activeTab === 'reset_password') && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeTab, timeLeft]);

  const navigateToDashboard = () => {
    if (onLoginSuccess) {
      onLoginSuccess();
    } else {
      // Stay on the intended admin section after reload/login (e.g. /admin/orders)
      const path = window.location.pathname.replace(/\/+$/, '');
      const target =
        path.startsWith('/admin/') && path !== '/admin/login' ? path : '/admin';
      window.history.pushState({}, '', target);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      try {
        await adminLogin({ email: email.trim(), password });
      } catch (err: any) {
        // Check if unverified
        const rawErr = err?.response?.data || err;
        if (rawErr?.isEmailVerified === false || rawErr?.message?.includes('not verified')) {
          setError('Admin account is not verified yet. A 6-digit OTP has been sent to your email.');
          setActiveTab('verify');
          setTimeLeft(300);
          setIsLoading(false);
          return;
        }
        await login({ email: email.trim(), password });
      }

      const currentUser = useAuthStore.getState().user;
      const isAdminUser = checkIsAdmin(currentUser);

      if (currentUser && isAdminUser) {
        setSuccess('Admin authenticated! Redirecting to dashboard...');
        setTimeout(navigateToDashboard, 400);
        return;
      } else {
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
      await adminRegister({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        adminSecretKey: adminSecretKey.trim() || undefined,
      });

      setSuccess('Admin account created! Please enter the 6-digit OTP sent to your email.');
      setActiveTab('verify');
      setTimeLeft(300);
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

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!otp.trim() || otp.trim().length < 6) {
      setError('Please enter the complete 6-digit OTP code.');
      setIsLoading(false);
      return;
    }

    try {
      await verifyOtp(email.trim(), otp.trim());
      const currentUser = useAuthStore.getState().user;
      if (currentUser && checkIsAdmin(currentUser)) {
        setSuccess('Admin OTP verified! Redirecting to dashboard...');
        setTimeout(navigateToDashboard, 400);
      } else {
        setError('Access Denied: Only authorized administrators can access the Admin Portal.');
        useAuthStore.getState().logout();
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired OTP code. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const res = await sendOtp(email.trim());
      setSuccess(res?.message || 'A new 6-digit OTP has been sent to your admin email.');
      setTimeLeft(300);
    } catch (err: any) {
      setError(err?.message || 'Failed to resend OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!email.trim()) {
      setError('Please enter your registered admin email address.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await authApi.forgotPassword(email.trim());
      setSuccess(res.message || 'Password reset 6-digit OTP code sent to your email.');
      setActiveTab('reset_password');
      setTimeLeft(300);
      setOtp('');
      setPassword('');
    } catch (err: any) {
      setError(err?.message || 'No registered account found with this email address.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!otp.trim() || otp.trim().length < 6) {
      setError('Please enter the 6-digit OTP code.');
      setIsLoading(false);
      return;
    }

    if (!password || password.length < 8) {
      setError('New password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await authApi.resetPassword(otp.trim(), password, email.trim());
      setSuccess(res.message || 'Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        setActiveTab('login');
        setPassword('');
        setOtp('');
        setSuccess('Password has been reset successfully. Please log in with your new password.');
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired OTP code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-3 sm:p-6 animate-in fade-in duration-300">
      {/* Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-crimson/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl space-y-4 sm:space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1.5 sm:space-y-2">
          <div className="w-11 h-11 sm:w-14 sm:h-14 bg-brand-crimson text-white rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-brand-crimson/30">
            <Shield className="w-5 h-5 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-white font-display tracking-tight">
              NiaKylie Admin Portal
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Management & Executive Control Center</p>
          </div>
        </div>

        {/* Tab Toggle (Sign In vs Register Admin) — hidden in verify / forgot / reset modes */}
        {(activeTab === 'login' || activeTab === 'register') && (
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
        )}

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

        {/* ── FORGOT PASSWORD STEP 1 ─────────────────────────────── */}
        {activeTab === 'forgot' ? (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-brand-crimson/20 text-brand-crimson flex items-center justify-center mx-auto mb-2 border border-brand-crimson/30">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">Forgot Admin Password?</h3>
              <p className="text-xs text-slate-400">
                Enter your registered admin email address to receive a 6-digit password reset OTP code.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                Registered Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email address"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl pl-10 pr-4 py-3 text-xs font-medium outline-none focus:border-brand-crimson"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg shadow-brand-crimson/20 flex items-center justify-center space-x-2 uppercase tracking-wider transition-all disabled:opacity-60"
            >
              <span>{isLoading ? 'CHECKING EMAIL...' : 'SEND RESET OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Return to Admin Login
              </button>
            </div>
          </form>
        ) : activeTab === 'reset_password' ? (
          /* ── RESET PASSWORD STEP 2 ─────────────────────────────── */
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-brand-crimson/20 text-brand-crimson flex items-center justify-center mx-auto mb-2 border border-brand-crimson/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">Enter Reset OTP & New Password</h3>
              <p className="text-xs text-slate-400">
                We sent a 6-digit code to <strong className="text-slate-200">{email}</strong>
              </p>
            </div>

            {/* Countdown Timer Badge */}
            <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs">
              <div className="flex items-center space-x-2 text-slate-400">
                <Clock className="w-4 h-4 text-brand-crimson" />
                <span className="font-bold">Reset Code Expires In:</span>
              </div>
              <span className={`font-mono font-extrabold ${timeLeft > 0 ? 'text-brand-crimson' : 'text-rose-500'}`}>
                {timeLeft > 0 ? formatTimer(timeLeft) : 'EXPIRED'}
              </span>
            </div>

            {/* 6-Digit OTP Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block text-center">
                6-Digit Security OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[12px] font-mono text-xl font-extrabold py-3 bg-slate-950 border border-slate-800 text-white rounded-2xl focus:border-brand-crimson outline-none uppercase"
              />
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                New Security Password (min 8 chars)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl pl-10 pr-10 py-3 text-xs font-medium outline-none focus:border-brand-crimson"
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
              disabled={isLoading || timeLeft === 0}
              className="w-full bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg shadow-brand-crimson/20 flex items-center justify-center space-x-2 uppercase tracking-wider transition-all disabled:opacity-60"
            >
              <span>{isLoading ? 'RESETTING PASSWORD...' : 'RESET PASSWORD'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Return to Admin Login
              </button>
            </div>
          </form>
        ) : activeTab === 'verify' ? (
          /* OTP VERIFICATION FORM */
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-brand-crimson/20 text-brand-crimson flex items-center justify-center mx-auto mb-2 border border-brand-crimson/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">Verify Admin OTP</h3>
              <p className="text-xs text-slate-400">
                Enter the 6-digit code sent to <strong className="text-slate-200">{email}</strong>
              </p>
            </div>

            {/* Countdown Timer Badge */}
            <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs">
              <div className="flex items-center space-x-2 text-slate-400">
                <Clock className="w-4 h-4 text-brand-crimson" />
                <span className="font-bold">OTP Expires In:</span>
              </div>
              <span className={`font-mono font-extrabold ${timeLeft > 0 ? 'text-brand-crimson' : 'text-rose-500'}`}>
                {timeLeft > 0 ? formatTimer(timeLeft) : 'EXPIRED'}
              </span>
            </div>

            {/* 6-Digit OTP Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block text-center">
                6-Digit Security Code
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[12px] font-mono text-xl font-extrabold py-3 bg-slate-950 border border-slate-800 text-white rounded-2xl focus:border-brand-crimson outline-none uppercase"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || timeLeft === 0}
              className="w-full bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg shadow-brand-crimson/20 flex items-center justify-center space-x-2 uppercase tracking-wider transition-all disabled:opacity-60"
            >
              <span>{isLoading ? 'VERIFYING...' : 'VERIFY OTP & ACCESS DASHBOARD'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Resend OTP button */}
            <div className="text-center pt-1 flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ← Back to Login
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="inline-flex items-center space-x-1.5 text-brand-crimson hover:text-white font-extrabold transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Resend OTP Code</span>
              </button>
            </div>
          </form>
        ) : activeTab === 'login' ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
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

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                  Security Password
                </label>
                <button
                  type="button"
                  onClick={() => { setActiveTab('forgot'); setError(''); setSuccess(''); }}
                  className="text-xs font-extrabold text-brand-crimson hover:text-white transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
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
