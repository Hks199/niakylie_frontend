import { useState, useEffect } from 'react';
import { X, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, Clock, RefreshCw, KeyRound } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from '../../api/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'verify' | 'forgot' | 'reset_password'>('login');
  const { login, register, sendOtp, verifyOtp, isLoading } = useAuthStore();

  // Shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Register-only fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // OTP Verification & Reset fields
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  // Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  // 5-minute countdown timer effect
  useEffect(() => {
    let timer: any;
    if ((mode === 'verify' || mode === 'reset_password') && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [mode, timeLeft]);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setOtp('');
    setTimeLeft(300);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleClose = () => {
    resetForm();
    setMode(initialMode);
    onClose();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'login') {
        await login({ email, password });
        setSuccessMsg('Logged in successfully! Welcome back 👋');
        resetForm();
        setTimeout(() => onClose(), 900);
      } else if (mode === 'register') {
        const res = await register({ email, password, firstName, lastName });
        setSuccessMsg(res.message || 'Account created! Please verify your email with the 6-digit OTP.');
        setMode('verify');
        setTimeLeft(300);
        setPassword('');
      }
    } catch (err: any) {
      // Check if account is unverified
      const rawError = err?.response?.data || err;
      if (rawError?.isEmailVerified === false || rawError?.message?.includes('not verified')) {
        setErrorMsg('Your account is not verified yet. An OTP has been sent to your email.');
        setMode('verify');
        setTimeLeft(300);
        return;
      }

      if (err?.errors) {
        const messages = Object.values(err.errors as Record<string, string[]>)
          .flat()
          .join(' · ');
        setErrorMsg(messages);
      } else {
        setErrorMsg(err?.message || 'Something went wrong. Please try again.');
      }
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otp.trim() || otp.trim().length < 6) {
      setErrorMsg('Please enter the complete 6-digit OTP code.');
      return;
    }

    try {
      await verifyOtp(email, otp.trim());
      setSuccessMsg('Email verified successfully! Logged in 👋');
      resetForm();
      setTimeout(() => onClose(), 900);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Invalid or expired OTP code. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await sendOtp(email);
      setSuccessMsg(res?.message || 'A new 6-digit OTP has been sent to your email.');
      setTimeLeft(300); // Reset timer to 5 minutes
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to resend OTP. Please try again.');
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLocalLoading(true);

    if (!email.trim()) {
      setErrorMsg('Please enter your registered email address.');
      setIsLocalLoading(false);
      return;
    }

    try {
      const res = await authApi.forgotPassword(email.trim());
      setSuccessMsg(res.message || 'OTP code sent to your email address.');
      setMode('reset_password');
      setTimeLeft(300);
      setOtp('');
      setPassword('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'No registered account found with this email address.');
    } finally {
      setIsLocalLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLocalLoading(true);

    if (!otp.trim() || otp.trim().length < 6) {
      setErrorMsg('Please enter the complete 6-digit OTP code.');
      setIsLocalLoading(false);
      return;
    }

    if (!password || password.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      setIsLocalLoading(false);
      return;
    }

    try {
      const res = await authApi.resetPassword(otp.trim(), password, email.trim());
      setSuccessMsg(res.message || 'Password reset successfully! Redirecting to login UI...');
      setTimeout(() => {
        resetForm();
        setMode('login');
        setSuccessMsg('Password reset successfully! Please log in with your new password.');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Invalid or expired OTP code. Please try again.');
    } finally {
      setIsLocalLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white text-left align-middle shadow-2xl transition-all animate-in zoom-in-95 duration-200 border border-gray-100">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="bg-gradient-to-r from-brand-slate-dark to-slate-900 text-white p-6 pt-8 text-center relative">
            <span className="text-2xl font-extrabold font-display tracking-tight text-brand-crimson">
              NiaKylie
            </span>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              {mode === 'login'
                ? 'Welcome back! Login to your account'
                : mode === 'register'
                ? 'Join NiaKylie Fashion Community'
                : mode === 'verify'
                ? 'Verify your email with OTP'
                : mode === 'forgot'
                ? 'Reset Your Account Password'
                : 'Enter OTP & Set New Password'}
            </p>

            {/* Mode Switch Tabs — hidden on verify / forgot / reset screens */}
            {(mode === 'login' || mode === 'register') && (
              <div className="flex bg-white/10 p-1 rounded-xl mt-6 border border-white/10">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    mode === 'login' ? 'bg-brand-crimson text-white shadow-sm' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  LOGIN
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    mode === 'register' ? 'bg-brand-crimson text-white shadow-sm' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  REGISTER
                </button>
              </div>
            )}
          </div>

          {/* ── FORGOT PASSWORD (STEP 1: ENTER EMAIL) ──────────────── */}
          {mode === 'forgot' ? (
            <form onSubmit={handleForgotPasswordSubmit} className="p-6 space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-brand-crimson/10 text-brand-crimson flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-brand-slate-dark text-base">Forgot Your Password?</h3>
                <p className="text-xs text-slate-500">
                  Enter your registered email address to receive a 6-digit password reset OTP code.
                </p>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Banner */}
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Registered Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 rounded-xl focus:border-brand-crimson focus:ring-2 focus:ring-brand-crimson/10 outline-none"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLocalLoading}
                className="w-full bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all uppercase tracking-wider disabled:opacity-50"
              >
                <span>{isLocalLoading ? 'SENDING OTP...' : 'SEND RESET OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          ) : mode === 'reset_password' ? (
            /* ── RESET PASSWORD (STEP 2: ENTER OTP & NEW PASSWORD) ──── */
            <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-brand-crimson/10 text-brand-crimson flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-brand-slate-dark text-base">Enter Reset OTP Code</h3>
                <p className="text-xs text-slate-500">
                  We sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Banner */}
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Countdown Timer Badge */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                <div className="flex items-center space-x-2 text-slate-600">
                  <Clock className="w-4 h-4 text-brand-crimson" />
                  <span className="font-bold">Reset Code Expires In:</span>
                </div>
                <span className={`font-mono font-extrabold ${timeLeft > 0 ? 'text-brand-crimson' : 'text-red-600'}`}>
                  {timeLeft > 0 ? formatTimer(timeLeft) : 'EXPIRED'}
                </span>
              </div>

              {/* 6-Digit OTP Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className="w-full text-center tracking-[12px] font-mono text-xl font-extrabold py-3 border border-gray-300 rounded-2xl focus:border-brand-crimson focus:ring-2 focus:ring-brand-crimson/10 outline-none uppercase bg-slate-50"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password (min 8 chars)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 rounded-xl focus:border-brand-crimson focus:ring-2 focus:ring-brand-crimson/10 outline-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLocalLoading || timeLeft === 0}
                className="w-full bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all uppercase tracking-wider disabled:opacity-50"
              >
                <span>{isLocalLoading ? 'RESETTING PASSWORD...' : 'RESET PASSWORD'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          ) : mode === 'verify' ? (
            /* ── OTP Verification Screen ─────────────────────────────── */
            <form onSubmit={handleVerifySubmit} className="p-6 space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-brand-crimson/10 text-brand-crimson flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-brand-slate-dark text-base">Enter Verification OTP</h3>
                <p className="text-xs text-slate-500">
                  We sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Banner */}
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Countdown Timer Badge */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                <div className="flex items-center space-x-2 text-slate-600">
                  <Clock className="w-4 h-4 text-brand-crimson" />
                  <span className="font-bold">OTP Expires In:</span>
                </div>
                <span className={`font-mono font-extrabold ${timeLeft > 0 ? 'text-brand-crimson' : 'text-red-600'}`}>
                  {timeLeft > 0 ? formatTimer(timeLeft) : 'EXPIRED'}
                </span>
              </div>

              {/* 6-Digit OTP Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className="w-full text-center tracking-[12px] font-mono text-xl font-extrabold py-3 border border-gray-300 rounded-2xl focus:border-brand-crimson focus:ring-2 focus:ring-brand-crimson/10 outline-none uppercase bg-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || timeLeft === 0}
                className="w-full bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all uppercase tracking-wider disabled:opacity-50"
              >
                <span>{isLoading ? 'VERIFYING...' : 'VERIFY & CONTINUE'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Resend OTP button */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="inline-flex items-center space-x-1.5 text-xs text-brand-crimson hover:text-brand-crimson-dark font-extrabold transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Resend New OTP Code</span>
                </button>
              </div>
            </form>
          ) : (
            /* ── Login / Register Form ─────────────────────────────── */
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Error Banner */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Banner */}
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Register: First Name + Last Name */}
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">First Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Priya"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-brand-crimson focus:ring-2 focus:ring-brand-crimson/10 outline-none"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Last Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Sharma"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-brand-crimson focus:ring-2 focus:ring-brand-crimson/10 outline-none"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-brand-crimson focus:ring-2 focus:ring-brand-crimson/10 outline-none"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {mode === 'register' ? 'Password (min 8 chars)' : 'Password'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                      className="text-xs font-bold text-brand-crimson hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={mode === 'register' ? 8 : undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-brand-crimson focus:ring-2 focus:ring-brand-crimson/10 outline-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-crimson hover:bg-brand-crimson-dark text-white font-bold text-xs py-3 rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all uppercase tracking-wider disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? 'Processing...' : mode === 'login' ? 'CONTINUE TO LOGIN' : 'CREATE ACCOUNT'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
