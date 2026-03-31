import { X, Megaphone } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  timestamp: string;
}

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
}

export function NotificationsDrawer({ open, onClose, notifications }: NotificationsDrawerProps) {
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/30" onClick={onClose} />
      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4 space-y-4" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">No notifications yet</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="flex gap-3 items-start">
                <div className="mt-0.5 flex-shrink-0 h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <Megaphone className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-800 font-medium">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{n.timestamp}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
