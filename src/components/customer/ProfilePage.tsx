import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Lock, LogOut, CheckCircle, Shield } from 'lucide-react';

interface ProfilePageProps {
  onBrowseMenu: () => void;
  onOpenAdmin?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBrowseMenu, onOpenAdmin }) => {
  const { user, role, updateProfile, signOut, resetPassword } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [defaultAddress, setDefaultAddress] = useState(user?.default_address || '');
  const [defaultCity, setDefaultCity] = useState(user?.default_city || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await updateProfile({
      full_name: fullName,
      phone,
      default_address: defaultAddress,
      default_city: defaultCity,
    });
    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleResetPassword = async () => {
    if (user?.email) {
      await resetPassword(user.email);
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
          Account Settings
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display tracking-tight">
          Customer Profile
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
          Manage your contact information and default delivery address.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          Profile updated and saved to Supabase profiles table!
        </div>
      )}

      {resetSuccess && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4 text-blue-600" />
          Password reset link dispatched to your email!
        </div>
      )}

      {/* Role Badge Card */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-800 font-black text-lg flex items-center justify-center">
            {user?.full_name?.charAt(0) || 'C'}
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900">{user?.full_name || 'Guest'}</h2>
            <p className="text-xs text-stone-500">{user?.email || 'customer@example.com'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
            Role: {role}
          </span>
          {role === 'admin' && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold rounded-lg shadow-xs flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5" /> Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Edit Details Form */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-5">
        <h3 className="text-base font-bold text-stone-900 font-display">Personal Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Registered Email (Supabase Auth)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-100 text-stone-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 801 234 5678"
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-stone-100">
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
            Default Delivery Location
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Street Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={defaultAddress}
                  onChange={(e) => setDefaultAddress(e.target.value)}
                  placeholder="742 Evergreen Terrace, Apt 4B"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">City / Region</label>
              <input
                type="text"
                value={defaultCity}
                onChange={(e) => setDefaultCity(e.target.value)}
                placeholder="Metro City"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={handleResetPassword}
            className="text-xs font-semibold text-amber-700 hover:underline inline-flex items-center gap-1"
          >
            <Lock className="w-3.5 h-3.5" /> Send Password Reset Email
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>

      {/* Logout button */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={onBrowseMenu}
          className="text-xs font-semibold text-stone-600 hover:text-stone-900"
        >
          ← Return to Menu
        </button>
        <button
          onClick={() => signOut()}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1.5 hover:underline"
        >
          <LogOut className="w-4 h-4" /> Sign Out of Ruckyn Antee
        </button>
      </div>
    </div>
  );
};
