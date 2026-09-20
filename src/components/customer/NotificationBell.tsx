import React, { useState } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationsContext';

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
        aria-label="View Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 sm:hidden" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="fixed left-4 right-4 top-16 max-w-sm mx-auto sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 bg-white rounded-2xl shadow-2xl border border-stone-200 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700"
                    title="Clear all notifications"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-xs text-stone-500 text-center">No notifications yet.</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-stone-50 flex items-start gap-3 group ${
                      n.is_read ? 'bg-white' : 'bg-amber-50/50'
                    }`}
                  >
                    <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${n.is_read ? 'bg-stone-300' : 'bg-amber-500'}`} />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-stone-900">{n.title}</p>
                      <p className="text-[11px] text-stone-600 mt-0.5">{n.message}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!n.is_read && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="text-stone-400 hover:text-amber-600 p-1"
                          aria-label="Mark as read"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        aria-label="Delete notification"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
