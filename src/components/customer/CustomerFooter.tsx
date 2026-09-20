import React from 'react';
import { Sparkles, Phone, Mail, MapPin, Clock, ShieldCheck, Heart } from 'lucide-react';

interface CustomerFooterProps {
  onNavigate: (page: string) => void;
}

export const CustomerFooter: React.FC<CustomerFooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 pt-12 pb-28 sm:pb-36 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-stone-800">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 font-black text-sm flex items-center justify-center">
                🍿
              </div>
              <span className="font-display font-black text-lg text-white">
                Ruckyn Antee Popcorn
              </span>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed">
              Hand-crafted artisan popcorn popped fresh to order using copper kettles and real ingredients.
            </p>
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Realtime Kitchen Powered by Supabase</span>
            </div>
          </div>

          {/* Quick Menu */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-amber-400 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('menu')} className="hover:text-amber-400 transition-colors">
                  Gourmet Popcorn Menu
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('my-orders')} className="hover:text-amber-400 transition-colors">
                  My Orders & Receipts
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tracking')} className="hover:text-amber-400 transition-colors">
                  Live Courier Tracking
                </button>
              </li>
            </ul>
          </div>

          {/* Flavors */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Signature Flavors</h4>
            <ul className="space-y-2 text-stone-400">
              <li>Artisan Salted Caramel Gold</li>
              <li>Aged Wisconsin Cheddar Supreme</li>
              <li>Ruckyn Classic Chicago Duo</li>
              <li>Black Truffle & Rosemary Herb</li>
              <li>Smoked Jalapeño Crunch</li>
            </ul>
          </div>

          {/* Hours & Contact */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Kitchen & Delivery</h4>
            <div className="space-y-2 text-stone-400">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Open Daily: 8:00 AM – 10:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>+2349113050470</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>orders@ruckynpopcorn.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Rummawa Quarters, Ungoggo LGA, Kano State</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-stone-500 gap-2">
          <p>© {new Date().getFullYear()} Ruckyn Antee Popcorn. All rights reserved. | Developed by Abubakar Muhammad Barde</p>
          <div className="flex items-center gap-4">
            <span className="text-[11px]">Backend Database: Supabase PostgreSQL</span>
            <span className="text-[11px]">•</span>
            <span className="text-[11px]">Auth: Supabase Auth</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
