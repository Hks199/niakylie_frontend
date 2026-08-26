import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Check, X, Loader2 } from 'lucide-react';
import { addressesApi } from '../../api/addresses';
import { Address } from '../../types/auth';

interface AddressStepProps {
  selectedAddressId: string;
  onSelectAddress: (id: string) => void;
  onNext: () => void;
}

const STATES = ['Andhra Pradesh', 'Delhi', 'Goa', 'Gujarat', 'Karnataka', 'Kerala', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'];

const INITIAL_FORM = {
  street: '',
  city: '',
  state: 'Maharashtra',
  postalCode: '',
  country: 'India',
  phone: '',
  isDefault: false,
};

export function AddressStep({ selectedAddressId, onSelectAddress, onNext }: AddressStepProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);

  const { isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const data = await addressesApi.getAddresses();
      setAddresses(data);
      const def = data.find((a) => a.isDefault);
      if (def && !selectedAddressId) onSelectAddress(def._id);
      return data;
    },
  });

  const [form, setForm] = useState(INITIAL_FORM);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addressesApi.createAddress({ ...form, isDefault: addresses.length === 0 });
      const refreshed = await addressesApi.getAddresses();
      setAddresses(refreshed);
      if (refreshed.length > 0) {
        onSelectAddress(refreshed[refreshed.length - 1]._id);
      }
      setForm(INITIAL_FORM);
      setShowAddForm(false);
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
    <div className="space-y-4">
      <h2 className="text-lg font-extrabold text-brand-slate-dark mb-4">Select Delivery Address</h2>

      {/* Address Cards */}
      {addresses.map((addr) => {
        const isSelected = selectedAddressId === addr._id;
        return (
          <button
            key={addr._id}
            onClick={() => onSelectAddress(addr._id)}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
              isSelected ? 'border-brand-crimson bg-brand-crimson/5 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {addr.isDefault && (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md uppercase">Default</span>
                  )}
                </div>
                <p className="font-bold text-xs text-brand-slate-dark">{addr.street}</p>
                <p className="text-xs text-slate-500">{addr.city}, {addr.state} — {addr.postalCode}</p>
                <p className="text-xs text-slate-500">{addr.country}</p>
                <p className="text-xs text-slate-500">📱 {addr.phone}</p>
              </div>
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-brand-crimson flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </button>
        );
      })}

      {/* Add New Address Button */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center space-x-2 border-2 border-dashed border-gray-300 hover:border-brand-crimson text-slate-500 hover:text-brand-crimson font-bold text-xs rounded-2xl py-4 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ ADD NEW ADDRESS</span>
        </button>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-brand-slate-dark">Add New Delivery Address</h3>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveAddress} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Street Address *</label>
              <input
                required
                placeholder="Flat / Building / Street"
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-crimson"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">City *</label>
                <input
                  required
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-crimson"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Postal Code *</label>
                <input
                  required
                  placeholder="Pincode"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-crimson"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">State *</label>
                <select
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-crimson bg-white"
                >
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Phone *</label>
                <input
                  required
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-crimson"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>SAVE ADDRESS</span>}
            </button>
          </form>
        </div>
      )}

      {/* Next Step Button */}
      <button
        onClick={onNext}
        disabled={!selectedAddressId}
        className="w-full bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-md disabled:opacity-50 mt-4"
      >
        CONTINUE TO PAYMENT →
      </button>
    </div>
  );
}

export default AddressStep;
