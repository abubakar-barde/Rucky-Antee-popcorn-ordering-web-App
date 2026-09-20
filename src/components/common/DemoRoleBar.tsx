import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { ShieldCheck, User, Sparkles, Database, CheckCircle2 } from 'lucide-react';

interface DemoRoleBarProps {
  currentView: 'customer' | 'admin';
  onSwitchView: (view: 'customer' | 'admin') => void;
}

export const DemoRoleBar: React.FC<DemoRoleBarProps> = ({ currentView, onSwitchView }) => {
  const { user, role, setShowAuthModal } = useAuth();
  const supabaseConnected = isSupabaseConfigured();

  return (
    <header className="bg-stone-900 text-stone-300 text-xs px-3 py-1.5 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 z-40">
      {/* Brand tag & Supabase status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-semibold text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ruckyn Antee Popcorn</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-stone-800/80 border border-stone-700/60 text-[11px]">
          <Database className="w-3 h-3 text-amber-400" />
          <span>Backend: Supabase</span>
          {supabaseConnected ? (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Live
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-300 font-medium" title="Configure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> Awaiting Keys
            </span>
          )}
        </div>
      </div>

      {/* Role and User controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* User state */}
        <div className="flex items-center gap-1.5 text-stone-300">
          {user ? (
            <>
              <span className="hidden md:inline text-stone-400">Signed in:</span>
              <span className="font-medium text-stone-100">{user.full_name}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  role === 'admin'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {role}
              </span>
            </>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-amber-400 hover:underline font-medium"
            >
              Sign In / Register
            </button>
          )}
        </div>

        {/* View Switcher: Admin button is hidden from customer view unless authenticated user has 'admin' role */}
        {role === 'admin' && (
          <div className="flex items-center bg-stone-800 rounded-lg p-0.5 border border-stone-700">
            <button
              id="role-switch-admin"
              onClick={() => onSwitchView('admin')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all ${
                currentView === 'admin'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Admin Dashboard</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
