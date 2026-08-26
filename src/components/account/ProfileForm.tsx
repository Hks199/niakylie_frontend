import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save } from 'lucide-react';
import { profileApi } from '../../api/profile';
import { useAuthStore } from '../../store/useAuthStore';
import { User } from '../../types/auth';

export function ProfileForm() {
  const { setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Only firstName and lastName are editable via PATCH /users/profile
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const { isLoading, data: profile } = useQuery<User>({
    queryKey: ['profile'],
    queryFn: async () => {
      const data = await profileApi.getProfile();
      // Hydrate form fields from API response
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
      // Keep auth store in sync
      setUser(data);
      return data;
    },
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      // Backend PATCH /users/profile only accepts firstName and lastName
      const updated = await profileApi.updateProfile({ firstName, lastName });
      setUser(updated);
      queryClient.setQueryData(['profile'], updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      if (err?.errors) {
        const messages = Object.values(err.errors as Record<string, string[]>).flat().join(' · ');
        setErrorMsg(messages);
      } else {
        setErrorMsg(err?.message || 'Failed to save profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-brand-crimson" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-brand-slate-dark">Profile Information</h2>
        <p className="text-xs text-slate-500 mt-0.5">Update your name. Email changes are not yet supported via this panel.</p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
          {errorMsg}
        </div>
      )}

      {/* Avatar Info */}
      {profile && (
        <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-gray-100">
          <div className="w-14 h-14 rounded-full bg-brand-crimson flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0 shadow-md">
            {(profile.firstName?.[0] || '').toUpperCase()}{(profile.lastName?.[0] || '').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-sm text-brand-slate-dark truncate">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="text-xs text-slate-500 truncate">{profile.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              {profile.roles?.map((r) => (
                <span key={r} className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-brand-crimson/10 text-brand-crimson uppercase">
                  {r}
                </span>
              ))}
              {profile.isEmailVerified && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 uppercase">✓ Verified</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">First Name</label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="e.g. Priya"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:border-brand-crimson focus:ring-2 focus:ring-brand-crimson/10"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Last Name</label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="e.g. Sharma"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:border-brand-crimson focus:ring-2 focus:ring-brand-crimson/10"
          />
        </div>

        {/* Email — read-only, dedicated endpoint needed to change */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</label>
          <input
            type="email"
            readOnly
            value={profile?.email || ''}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium outline-none bg-slate-50 text-slate-500 cursor-not-allowed"
          />
          <p className="text-[10px] text-slate-400">Email cannot be changed from this panel.</p>
        </div>

        {/* Phone — read-only (no PATCH endpoint for phone) */}
        {profile?.phone && (
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Phone</label>
            <input
              type="tel"
              readOnly
              value={profile.phone}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium outline-none bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>
        )}
      </div>

      {/* Reward Points + Wallet */}
      {profile && (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
            <p className="text-[10px] uppercase font-extrabold text-amber-700 tracking-wider">Reward Points</p>
            <p className="text-2xl font-extrabold text-amber-600">{profile.rewardPoints ?? 0}</p>
          </div>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
            <p className="text-[10px] uppercase font-extrabold text-emerald-700 tracking-wider">Wallet Balance</p>
            <p className="text-2xl font-extrabold text-emerald-600">₹{profile.wallet?.balance ?? 0}</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className={`flex items-center space-x-2 font-extrabold text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider transition-all ${
          saved
            ? 'bg-emerald-600 text-white'
            : 'bg-brand-crimson hover:bg-brand-crimson-dark text-white shadow-md'
        } disabled:opacity-70`}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        <span>{saved ? 'PROFILE SAVED ✓' : 'SAVE CHANGES'}</span>
      </button>
    </form>
  );
}

export default ProfileForm;
