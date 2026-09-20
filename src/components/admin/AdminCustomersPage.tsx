import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { User, Mail, Phone, MapPin, ShoppingBag, DollarSign, Calendar, Search } from 'lucide-react';
import { formatNaira } from '../../lib/currency';

export const AdminCustomersPage: React.FC = () => {
  const { orders } = useOrders();
  const [search, setSearch] = useState('');

  // Aggregate unique customer metrics from orders
  const customerMap = new Map<
    string,
    {
      name: string;
      email: string;
      phone: string;
      city: string;
      totalOrders: number;
      totalSpent: number;
      lastOrderDate: string;
    }
  >();

  orders.forEach((order) => {
    const key = order.customer_email || order.customer_name || order.customer_id || 'unknown';
    const existing = customerMap.get(key);
    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += order.total;
      if (new Date(order.created_at) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = order.created_at;
      }
    } else {
      customerMap.set(key, {
        name: order.customer_name || 'Customer',
        email: order.customer_email || '',
        phone: order.customer_phone || order.phone || '',
        city: order.delivery_city || 'Local Delivery',
        totalOrders: 1,
        totalSpent: order.total,
        lastOrderDate: order.created_at,
      });
    }
  });

  const customerList = Array.from(customerMap.values()).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 font-display">
            Customer Directory
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Profiles stored in Supabase <code>profiles</code> table and ordering frequency.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, city..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Contact Details</th>
                <th className="p-4">Delivery Region</th>
                <th className="p-4 text-center">Lifetime Orders</th>
                <th className="p-4 text-right">Total Spent</th>
                <th className="p-4 text-right">Last Popcorn Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {customerList.map((cust, idx) => (
                <tr key={idx} className="hover:bg-amber-50/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center">
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-stone-900 block text-sm">{cust.name}</span>
                        <span className="text-[10px] text-amber-700 font-semibold uppercase">
                          Registered Customer
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-stone-600 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      <span>{cust.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{cust.phone}</span>
                    </div>
                  </td>

                  <td className="p-4 text-stone-700 font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>{cust.city}</span>
                    </div>
                  </td>

                  <td className="p-4 text-center font-bold text-stone-900">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800">
                      {cust.totalOrders}
                    </span>
                  </td>

                  <td className="p-4 text-right font-black text-amber-800 text-sm">
                    {formatNaira(cust.totalSpent)}
                  </td>

                  <td className="p-4 text-right text-stone-500 text-[11px]">
                    {new Date(cust.lastOrderDate).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
