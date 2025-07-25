import { useEffect, useState } from 'react';
import { Bell, X, Trophy, Star, Target, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  type: 'achievement' | 'mission' | 'trade' | 'system';
  title: string;
  message: string;
  icon?: React.ReactNode;
  timestamp: number;
  read: boolean;
}

export const NotificationSystem = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      // Simular notificaciones iniciales
      const initialNotifications: Notification[] = [
        {
          id: '1',
          type: 'achievement',
          title: '¡Nuevo Logro Desbloqueado!',
          message: 'Has obtenido el logro "Primer Trade"',
          icon: <Trophy className="w-5 h-5 text-yellow-400" />,
          timestamp: Date.now() - 300000, // 5 minutos atrás
          read: false
        },
        {
          id: '2',
          type: 'mission',
          title: 'Misión Completada',
          message: 'Has completado la misión diaria "Completa 3 trades"',
          icon: <Target className="w-5 h-5 text-green-400" />,
          timestamp: Date.now() - 600000, // 10 minutos atrás
          read: false
        }
      ];
      
      setNotifications(initialNotifications);
      setUnreadCount(initialNotifications.filter(n => !n.read).length);
    }
  }, [user]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const removeNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 10)); // Mantener solo 10
    setUnreadCount(prev => prev + 1);
  };

  // Función para ser llamada desde otros componentes
  const showAchievementNotification = (achievementName: string, xpReward: number) => {
    addNotification({
      type: 'achievement',
      title: '¡Nuevo Logro Desbloqueado!',
      message: `Has obtenido "${achievementName}" (+${xpReward} XP)`,
      icon: <Trophy className="w-5 h-5 text-yellow-400" />
    });
  };

  const showMissionNotification = (missionDescription: string, xpReward: number) => {
    addNotification({
      type: 'mission',
      title: 'Misión Completada',
      message: `${missionDescription} (+${xpReward} XP)`,
      icon: <Target className="w-5 h-5 text-green-400" />
    });
  };

  const showTradeNotification = (isProfit: boolean, amount: number) => {
    addNotification({
      type: 'trade',
      title: isProfit ? 'Trade Exitoso' : 'Trade Cerrado',
      message: `${isProfit ? 'Ganancia' : 'Pérdida'} de ${amount.toFixed(2)}%`,
      icon: <Star className={`w-5 h-5 ${isProfit ? 'text-green-400' : 'text-red-400'}`} />
    });
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'Ahora';
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'bg-yellow-400/10 border-yellow-400/30';
      case 'mission':
        return 'bg-green-400/10 border-green-400/30';
      case 'trade':
        return 'bg-blue-400/10 border-blue-400/30';
      default:
        return 'bg-card/50 border-border';
    }
  };

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-card/50 border border-border hover:border-primary/30 transition-colors"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 max-h-96 bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-xl overflow-hidden z-50">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground">Notificaciones</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:text-accent transition-colors"
                  >
                    Marcar todo como leído
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-muted/20 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-border/50 transition-all duration-200 hover:bg-muted/10 ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${getNotificationBgColor(notification.type)}`}>
                        {notification.icon || <Zap className="w-5 h-5 text-primary" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${
                          !notification.read ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatTimeAgo(notification.timestamp)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {!notification.read && (
                        <div className="w-2 h-2 bg-accent rounded-full" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="p-1 hover:bg-muted/20 rounded transition-colors"
                      >
                        <X className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Exportar funciones para usar desde otros componentes
export const useNotifications = () => {
  // Esta función se puede expandir para manejar notificaciones globalmente
  return {
    showAchievementNotification: (name: string, xp: number) => {
      // Implementar lógica global de notificaciones
    },
    showMissionNotification: (description: string, xp: number) => {
      // Implementar lógica global de notificaciones
    },
    showTradeNotification: (isProfit: boolean, amount: number) => {
      // Implementar lógica global de notificaciones
    }
  };
};