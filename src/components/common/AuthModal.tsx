import { useState } from 'react';
import { X, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2, MailCheck } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  const { login, register, isLoading } = useAuthStore();

  // Shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Register-only fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  // Dev email verification token (only returned in dev mode)
  const [verificationToken, setVerificationToken] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setErrorMsg('');
    setSuccessMsg('');
    setVerificationToken('');
  };

  const handleClose = () => {
    resetForm();
    setMode(initialMode);
    onClose();
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
        setSuccessMsg(res.message || 'Account created! Please verify your email to continue.');
        // In dev mode, the verificationToken is returned in the response — surface it
        if (res.verificationToken) {
          setVerificationToken(res.verificationToken);
        }
        setMode('verify');
        setPassword('');
      }
    } catch (err: any) {
      // Surface field-level validation errors from backend
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
                : 'Verify your email address'}
            </p>

            {/* Mode Switch Tabs — hidden on verify screen */}
            {mode !== 'verify' && (
              <div className="flex bg-white/10 p-1 rounded-xl mt-6 border border-white/10">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(''); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    mode === 'login' ? 'bg-brand-crimson text-white shadow-sm' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  LOGIN
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMsg(''); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    mode === 'register' ? 'bg-brand-crimson text-white shadow-sm' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  REGISTER
                </button>
              </div>
            )}
          </div>

          {/* ── Email Verify Screen ────────────────────────────────── */}
          {mode === 'verify' ? (
            <div className="p-6 space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <MailCheck className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-brand-slate-dark text-sm">Check your inbox</h3>
                <p className="text-xs text-slate-500 mt-1">
                  We sent a verification email to <strong>{email}</strong>.
                  Click the link in the email to activate your account.
                </p>
              </div>

              {/* Dev-mode verification token helper */}
              {verificationToken && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left space-y-1">
                  <p className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">
                    ⚙️ Dev Mode — Verification Token
                  </p>
                  <p className="text-[10px] text-amber-600 break-all font-mono">{verificationToken}</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => { setMode('login'); setVerificationToken(''); }}
                className="w-full bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider transition-all"
              >
                GO TO LOGIN
              </button>
            </div>
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

              {/* Register: First Name + Last Name (two separate fields) */}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {mode === 'register' ? 'Password (min 8 chars)' : 'Password'}
                </label>
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
