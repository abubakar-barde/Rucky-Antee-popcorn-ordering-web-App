import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Bell, Radio, Database, Shield, CheckCircle2, Store } from 'lucide-react';

interface AdminHeaderProps {
  currentTabName: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ currentTabName }) => {
  const { user } = useAuth();
  const [storeOpen, setStoreOpen] = useState(true);
  const supabaseLive = isSupabaseConfigured();

  return (
    <header className="bg-white border-b border-stone-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-lg font-black text-stone-900 font-display tracking-tight">
          {currentTabName}
        </h1>
        <p className="text-[11px] text-stone-500">Ruckyn Antee Realtime Administration</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Store open status toggle */}
        <button
          onClick={() => setStoreOpen(!storeOpen)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors flex items-center gap-1.5 ${
            storeOpen
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
          }`}
          title="Toggle Store Accepting Orders"
        >
          <Store className="w-3.5 h-3.5" />
          <span>{storeOpen ? 'Kitchen: Accepting Orders' : 'Kitchen: Paused'}</span>
          <span
            className={`w-2 h-2 rounded-full ${storeOpen ? 'bg-emerald-500' : 'bg-rose-500'}`}
          />
        </button>

        {/* Supabase Channel Status indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold">
          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Supabase Realtime</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>

        {/* Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center">
            A
          </div>
          <div className="hidden md:block text-left text-xs">
            <span className="font-bold text-stone-900 block leading-tight">
              {user?.full_name || 'Admin'}
            </span>
            <span className="text-[10px] text-amber-700 font-bold uppercase">Store Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
};
