import React from 'react';
import { useOrders } from '../../context/OrderContext';
import { Bell, X, CheckCircle, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Play a pleasant Web Audio API notification chime
const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play a delightful chime chord (C5 and G5)
    const playTone = (freq: number, delay: number, duration: number) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + duration);
      }, delay);
    };

    playTone(523.25, 0, 0.25);   // C5
    playTone(659.25, 100, 0.25); // E5
    playTone(783.99, 200, 0.35); // G5
  } catch (e) {
    // AudioContext blocked before user interaction or not supported
    console.warn('Audio chime note played check:', e);
  }
};

export const RealtimeAlertToast: React.FC = () => {
  const { lastRealtimeAlert, clearRealtimeAlert } = useOrders();

  // Play sound whenever a new alert arrives
  React.useEffect(() => {
    if (lastRealtimeAlert) {
      playNotificationSound();
    }
  }, [lastRealtimeAlert?.timestamp]);

  return (
    <AnimatePresence>
      {lastRealtimeAlert && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 max-w-md bg-stone-900 text-white p-4 rounded-xl shadow-2xl border border-amber-500/40 flex items-start gap-3 backdrop-blur-md"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 relative">
            <Radio className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
          </div>
          <div className="flex-1 pr-2">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Supabase Realtime Event
              </span>
              <span className="text-[10px] text-stone-400">Just now</span>
            </div>
            <p className="text-sm font-medium text-stone-100 leading-snug">
              {lastRealtimeAlert.message}
            </p>
          </div>
          <button
            onClick={clearRealtimeAlert}
            className="text-stone-400 hover:text-white p-1 rounded-md transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
