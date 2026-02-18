import { useState } from 'react';
import { useWebSocket } from '../../services/websocket';

interface User {
  name: string;
  email: string;
  role: string;
}

export function Navbar() {
  const [user] = useState<User>({
    name: 'Usuario',
    email: 'usuario@empresa.com',
    role: 'Admin'
  });

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useWebSocket();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <input
          type="search"
          placeholder="Buscar..."
          className="bg-slate-100 rounded-lg px-4 py-2 w-80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-700"
          >
            <span className="text-xl">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 max-h-96 overflow-y-auto">
              <div className="p-3 border-b border-slate-200 flex justify-between items-center">
                <span className="font-semibold text-slate-800">Notificaciones</span>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline">
                    Marcar todo leído
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm">
                  Sin notificaciones
                </div>
              ) : (
                notifications.slice(0, 20).map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => markAsRead(n.id)}
                    className={`p-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 ${!n.read ? 'bg-blue-50' : ''}`}
                  >
                    <div className="font-medium text-sm text-slate-800">{n.title}</div>
                    <div className="text-xs text-slate-500">{n.message}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(n.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user.name.charAt(0)}
          </div>
          <div className="text-sm">
            <div className="font-medium text-slate-800">{user.name}</div>
            <div className="text-slate-500">{user.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
