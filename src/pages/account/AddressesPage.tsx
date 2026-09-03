import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Plus, Trash2, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { addressesApi } from '../../api/addresses';
import { Address } from '../../types/auth';
import { INDIAN_STATES_AND_UTS } from '../../constants/indiaStates';

const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Singapore'];

const INITIAL_FORM = {
  street: '',
  city: '',
  state: 'Chhattisgarh',
  postalCode: '',
  country: 'India',
  phone: '',
  isDefault: false,
};

export function AddressesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // GET /users/profile/addresses — returns Address[]
  const { data: addresses = [], isLoading, refetch } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: () => addressesApi.getAddresses(),
  });

  const resetForm = () => setForm(INITIAL_FORM);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      // POST /users/profile/addresses — returns updated User; we refetch addresses
      await addressesApi.createAddress(form);
      setSuccessMsg('Address saved successfully!');
      resetForm();
      setShowAddModal(false);
      refetch();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: any) {
      if (err?.errors) {
        setErrorMsg(Object.values(err.errors as Record<string, string[]>).flat().join(' · '));
      } else {
        setErrorMsg(err?.message || 'Failed to save address.');
      }
    } finally {
      setSaving(false);
    }
  };

  // DELETE /users/profile/addresses/:addressId
  const handleDeleteAddress = async (addressId: string) => {
    setDeletingId(addressId);
    try {
      await addressesApi.deleteAddress(addressId);
      refetch();
    } finally {
      setDeletingId(null);
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
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-extrabold text-brand-slate-dark font-display">Saved Addresses</h2>
          <p className="text-xs text-slate-500">Manage your delivery addresses for faster checkout</p>
        </div>
        <button
          onClick={() => { resetForm(); setErrorMsg(''); setShowAddModal(true); }}
          className="flex items-center justify-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span>ADD NEW ADDRESS</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Address Cards */}
      {addresses.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <MapPin className="w-6 h-6" />
          </div>
          <p className="font-extrabold text-sm text-brand-slate-dark">No saved addresses yet</p>
          <p className="text-xs text-slate-400">Add a delivery address to speed up checkout.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr: Address) => (
            <div key={addr._id} className="p-5 rounded-2xl border border-gray-200 hover:border-brand-crimson/40 transition-all bg-white space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {addr.isDefault && (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md uppercase">
                      DEFAULT
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteAddress(addr._id)}
                  disabled={deletingId === addr._id}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Delete Address"
                >
                  {deletingId === addr._id
                    ? <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                    : <Trash2 className="w-4 h-4" />}
                </button>
              </div>

              <div className="space-y-0.5">
                <p className="text-xs text-slate-600">{addr.street}</p>
                <p className="text-xs text-slate-600">{addr.city}, {addr.state} — <span className="font-bold">{addr.postalCode}</span></p>
                <p className="text-xs text-slate-600">{addr.country}</p>
                <p className="text-xs text-slate-500 mt-1">📱 {addr.phone}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Address Modal ─────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => { resetForm(); setShowAddModal(false); }}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl z-50 border border-gray-100 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-extrabold text-base text-brand-slate-dark">Add New Delivery Address</h3>
                <button
                  onClick={() => { resetForm(); setShowAddModal(false); }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveAddress} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Street Address *</label>
                  <input
                    required
                    placeholder="e.g. Flat 402, Royal Heights, Bandra West"
                    value={form.street}
                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-crimson"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">City *</label>
                    <input
                      required
                      placeholder="e.g. Mumbai"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-crimson"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Postal Code *</label>
                    <input
                      required
                      placeholder="e.g. 400050"
                      value={form.postalCode}
                      onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-crimson"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">State *</label>
                    <select
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-crimson bg-white"
                    >
                      {INDIAN_STATES_AND_UTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Country *</label>
                    <select
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-crimson bg-white"
                    >
                      {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Delivery Phone *</label>
                  <input
                    required
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-crimson"
                  />
                </div>

                <label className="flex items-center space-x-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                    className="accent-brand-crimson w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-slate-600">Set as default delivery address</span>
                </label>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>SAVE ADDRESS</span>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddressesPage;
