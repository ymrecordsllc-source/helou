import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  Mic,
  ArrowRight,
  Trash2,
  CheckCheck,
  Flame,
  ShoppingBag,
  MessageSquare,
  Shield,
  Layers,
  Calendar,
  Handshake,
  ShieldAlert,
  Trophy,
  Sparkles,
  Radio,
  Settings,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NotificationItem, AuditionSubmission, NotificationCategory } from '../types';
import { AppSection } from './Navbar';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewAudition: (audition: AuditionSubmission) => void;
  onNavigateToSection?: (section: AppSection) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onViewAudition,
  onNavigateToSection
}) => {
  const {
    notifications,
    currentUser,
    userProfile,
    setUserProfile,
    auditions,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    primaryButtonColor,
    showToast
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // User notification preferences
  const [userPrefs, setUserPrefs] = useState<Record<string, boolean>>(
    userProfile.notificationPreferences || {
      cuenta: true,
      mensajes: true,
      tienda: true,
      audiciones: true,
      survival: true,
      lanzamientos: true,
      premiaciones: true,
      calendario: true,
      colaboraciones: true,
      moderacion: true,
      logros: true
    }
  );

  if (!isOpen) return null;

  const userNotifs = notifications.filter((n) => n.recipient === currentUser);

  const filteredNotifs = userNotifs.filter((n) => {
    if (onlyUnread && n.read) return false;
    if (activeCategory === 'all') return true;
    return (n.category || n.type) === activeCategory;
  });

  const unreadCount = userNotifs.filter((n) => !n.read).length;

  const handleInspectAudition = (notif: NotificationItem) => {
    markNotificationRead(notif.id);
    if (notif.auditionId) {
      const targetAudition = auditions.find((a) => a.id === notif.auditionId);
      if (targetAudition) {
        onViewAudition(targetAudition);
        onClose();
      }
    }
  };

  const handleActionClick = (notif: NotificationItem) => {
    markNotificationRead(notif.id);
    if (notif.actionSection && onNavigateToSection) {
      onNavigateToSection(notif.actionSection as AppSection);
      onClose();
    } else if (notif.auditionId) {
      handleInspectAudition(notif);
    }
  };

  const handleTogglePref = (catKey: string) => {
    const updated = { ...userPrefs, [catKey]: !userPrefs[catKey] };
    setUserPrefs(updated);
    setUserProfile((prev) => ({
      ...prev,
      notificationPreferences: updated
    }));

    fetch('/api/user/customization', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: currentUser,
        notificationPreferences: updated
      })
    }).catch(() => {});
  };

  const getCategoryIcon = (category?: string, type?: string) => {
    const c = category || type;
    switch (c) {
      case 'audition':
      case 'audiciones':
        return <Mic className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />;
      case 'survival':
      case 'equipos':
      case 'episodios':
      case 'votaciones':
        return <Flame className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />;
      case 'store':
      case 'tienda':
      case 'compras':
        return <ShoppingBag className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />;
      case 'message':
      case 'mensajes':
      case 'chat':
        return <MessageSquare className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />;
      case 'calendario':
        return <Calendar className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />;
      case 'colaboraciones':
        return <Handshake className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />;
      case 'moderacion':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />;
      case 'logros':
        return <Trophy className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />;
      case 'lanzamientos':
        return <Radio className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />;
      case 'premiaciones':
      case 'award':
        return <Sparkles className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />;
      default:
        return <Shield className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />;
    }
  };

  const categoryList: { id: string; label: string }[] = [
    { id: 'all', label: 'Todas' },
    { id: 'cuenta', label: 'Cuenta' },
    { id: 'mensajes', label: 'Mensajes' },
    { id: 'tienda', label: 'Tienda & Compras' },
    { id: 'audiciones', label: 'Audiciones' },
    { id: 'survival', label: 'Survival' },
    { id: 'calendario', label: 'Calendario' },
    { id: 'colaboraciones', label: 'Colaboraciones' },
    { id: 'moderacion', label: 'Moderación' },
    { id: 'logros', label: 'Logros' },
    { id: 'lanzamientos', label: 'Lanzamientos' },
    { id: 'premiaciones', label: 'Premiaciones' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black">Centro de Notificaciones</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-500 text-white animate-pulse">
                    {unreadCount} nuevas
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Audiciones, survival, colaboraciones, tienda, logros y seguridad
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`p-1.5 rounded-full transition cursor-pointer ${
                isSettingsOpen ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Configurar qué notificaciones recibir"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PREFERENCES PANEL (TOGGLEABLE) */}
        {isSettingsOpen ? (
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3 overflow-y-auto max-h-72 text-xs">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-indigo-400" /> Preferencias de Canales
              </span>
              <span className="text-[10px] text-slate-400">Activa o desactiva por módulo</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {Object.keys(userPrefs).map((key) => (
                <label
                  key={key}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-700/60 cursor-pointer"
                >
                  <span className="font-semibold capitalize text-slate-200">{key}</span>
                  <input
                    type="checkbox"
                    checked={userPrefs[key]}
                    onChange={() => handleTogglePref(key)}
                    className="w-3.5 h-3.5 rounded text-indigo-600"
                  />
                </label>
              ))}
            </div>

            <button
              onClick={() => setIsSettingsOpen(false)}
              className="w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
            >
              Listo
            </button>
          </div>
        ) : (
          <>
            {/* Category Filters & Mark All Read */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none max-w-[70%]">
                {categoryList.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex-shrink-0 cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOnlyUnread(!onlyUnread)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    onlyUnread ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  No leídas
                </button>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Todas leídas
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {filteredNotifs.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No tienes notificaciones en esta categoría.
                </div>
              ) : (
                filteredNotifs.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 text-xs ${
                      n.read
                        ? 'bg-slate-800/40 border-slate-800 text-slate-400'
                        : 'bg-slate-800/90 border-indigo-500/40 text-white shadow-md'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 pr-1 flex-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        {getCategoryIcon(n.category, n.type)}
                        <span className="truncate">{n.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-tight">{n.message}</p>
                      <span className="text-[9px] text-slate-500 block">
                        {new Date(n.date).toLocaleDateString('es-MX')} ·{' '}
                        {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {n.actionSection || n.auditionId ? (
                        <button
                          onClick={() => handleActionClick(n)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1 cursor-pointer"
                        >
                          Ver <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        !n.read && (
                          <button
                            onClick={() => markNotificationRead(n.id)}
                            className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[10px] font-semibold cursor-pointer"
                          >
                            Leído
                          </button>
                        )
                      )}

                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition cursor-pointer rounded-lg hover:bg-slate-700/50"
                        title="Eliminar notificación"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
