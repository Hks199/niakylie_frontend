import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, Package, Tag, X, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

export function NotificationListener() {
  const { isAuthenticated, token, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Function to show toast
  const addToast = (notif: { title: string; message: string; type?: string; id?: string }) => {
    const newToast: ToastNotification = {
      id: notif.id || String(Date.now()) + Math.random().toString(36).substring(2, 5),
      title: notif.title || '🔔 New Notification',
      message: notif.message || 'You have a new update from NIAKYLIE.',
      type: notif.type || 'system',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setToasts((prev) => [newToast, ...prev].slice(0, 3));

    // Native browser desktop notification push pop-up
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted' &&
      user?.notificationPreferences?.push !== false
    ) {
      try {
        new Notification(newToast.title, {
          body: newToast.message,
          icon: '/favicon.ico',
        });
      } catch {
        // Ignore native error
      }
    }

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      removeToast(newToast.id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Establish SSE Connection
  useEffect(() => {
    if (!isAuthenticated) return;

    let authToken = localStorage.getItem('access_token') || token;
    if (!authToken) {
      try {
        const stored = localStorage.getItem('niakylie-auth-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          authToken = parsed?.state?.token || null;
        }
      } catch {
        // Ignore parse errors
      }
    }

    if (!authToken || authToken === 'mock_admin_jwt_token_2026') return;

    // Backend API Base URL
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_URL ||
      'http://localhost:3000/api/v1';

    const sseUrl = `${baseUrl}/notifications/stream?token=${encodeURIComponent(authToken)}`;

    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(sseUrl);

      const handleIncomingEvent = (eventData: string) => {
        try {
          const parsed = JSON.parse(eventData);
          if (parsed) {
            queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
            queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });

            const notifPayload = parsed.data || parsed;
            addToast({
              id: notifPayload._id || notifPayload.id,
              title: notifPayload.title,
              message: notifPayload.message,
              type: notifPayload.type,
            });
          }
        } catch {
          queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
          queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
        }
      };

      eventSource.onmessage = (event) => handleIncomingEvent(event.data);

      eventSource.addEventListener('notification', (event: any) => handleIncomingEvent(event.data));

      eventSource.onerror = () => {
        // EventSource will automatically retry connection
      };
    } catch {
      // Fallback polling will handle updates
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [isAuthenticated, token, queryClient, user]);

  // 2. Active Fallback Polling (Every 6 seconds) to ensure zero delay
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    }, 6000);

    return () => clearInterval(interval);
  }, [isAuthenticated, queryClient]);

  if (toasts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'order_update':
        return <Package className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />;
      case 'offer':
      case 'coupon':
      case 'price_drop':
        return <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />;
      case 'system':
      case 'back_in_stock':
        return <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 font-bold animate-pulse" />;
      default:
        return <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-brand-crimson" />;
    }
  };

  return (
    <div
      aria-live="assertive"
      className="fixed top-14 sm:top-20 inset-x-2 sm:inset-x-auto sm:right-4 sm:max-w-sm z-[9999] flex flex-col space-y-2 sm:space-y-3 pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-white/95 backdrop-blur-md border border-brand-crimson/30 shadow-2xl rounded-xl sm:rounded-2xl p-2.5 sm:p-4 transition-all duration-300 transform translate-x-0 animate-in slide-in-from-top-4 flex items-start space-x-2.5 sm:space-x-3.5 relative overflow-hidden group"
        >
          {/* Subtle top accent border */}
          <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-brand-crimson via-purple-500 to-emerald-500" />

          <div className="p-1.5 sm:p-2.5 bg-slate-50 border border-slate-100 rounded-lg sm:rounded-xl flex-shrink-0 mt-0.5">
            {getIcon(toast.type)}
          </div>

          <div className="flex-1 min-w-0 pr-5 sm:pr-6 space-y-0.5 sm:space-y-1">
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              <h4 className="font-extrabold text-[11px] sm:text-xs text-brand-slate-dark leading-snug truncate">
                {toast.title}
              </h4>
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium whitespace-nowrap">
                {toast.createdAt}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-600 leading-snug sm:leading-relaxed font-medium line-clamp-2">
              {toast.message}
            </p>
            <a
              href="/account/notifications"
              className="inline-block text-[10px] sm:text-[11px] font-extrabold text-brand-crimson hover:underline pt-0.5"
            >
              View Details →
            </a>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md sm:rounded-lg hover:bg-slate-100"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default NotificationListener;
