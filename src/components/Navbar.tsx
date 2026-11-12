import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Music,
  MessageSquare,
  Mic,
  MessageCircle,
  Star,
  Store,
  Coins,
  Search,
  LogOut,
  Bell,
  CreditCard,
  Settings,
  Sun,
  Moon,
  Sparkles,
  Radio,
  Trophy,
  Shirt,
  Flame,
  TrendingUp,
  Building2,
  Calendar,
  Award,
  Handshake,
  ShieldAlert,
  ChevronDown,
  Users,
  Compass,
  Palette
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarWithFrame } from './AvatarWithFrame';

export type AppSection =
  | 'foros'
  | 'audiciones'
  | 'chats'
  | 'fans'
  | 'tienda'
  | 'fashion'
  | 'lanzamientos'
  | 'premiaciones'
  | 'survival'
  | 'charts'
  | 'partners'
  | 'calendario'
  | 'colaboraciones'
  | 'logros'
  | 'moderacion'
  | 'idcard'
  | 'configuracion'
  | 'customize';

interface NavbarProps {
  currentSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  onOpenSidebar: () => void;
  onOpenCoinsModal: () => void;
  onOpenSearchModal: () => void;
  onOpenNotificationsModal: () => void;
}

interface NavItem {
  id: AppSection;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  badge?: string | number;
  hide?: boolean;
}

interface NavCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  items: NavItem[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSection,
  onSelectSection,
  onOpenSidebar,
  onOpenCoinsModal,
  onOpenSearchModal,
  onOpenNotificationsModal
}) => {
  const {
    userProfile,
    notifications,
    currentUser,
    themeMode,
    setThemeMode,
    primaryButtonColor,
    isUnlimitedBalance,
    logout
  } = useApp();

  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const isTraineeOrArtist =
    userProfile.accountType === 'trainee' ||
    userProfile.accountType === 'artista' ||
    userProfile.accountType === 'admin';

  const hasUnlimited = isUnlimitedBalance();

  const unreadNotifsCount = notifications.filter(
    (n) => n.recipient === currentUser && !n.read
  ).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenCategory(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const categories: NavCategory[] = [
    {
      id: 'comunidad',
      label: 'Comunidad',
      icon: Users,
      items: [
        { id: 'foros', label: 'Foros y Muros', icon: MessageSquare },
        { id: 'chats', label: 'Chats y Mensajes', icon: MessageCircle },
        { id: 'fans', label: 'Clubes de Fans', icon: Star },
        { id: 'colaboraciones', label: 'Colaboraciones', icon: Handshake }
      ]
    },
    {
      id: 'artistas',
      label: 'Artistas',
      icon: Sparkles,
      items: [
        {
          id: 'audiciones',
          label: 'Centro de Audiciones',
          icon: Mic,
          hide: userProfile.accountType === 'fan'
        },
        { id: 'lanzamientos', label: 'Lanzamientos Musicales', icon: Radio },
        { id: 'charts', label: 'Rankings y Charts', icon: TrendingUp },
        {
          id: 'idcard',
          label: 'Mi ID-Card Oficial',
          icon: CreditCard,
          hide: !isTraineeOrArtist
        }
      ]
    },
    {
      id: 'entretenimiento',
      label: 'Entretenimiento',
      icon: Flame,
      items: [
        { id: 'survival', label: 'Programa Survival', icon: Flame },
        { id: 'premiaciones', label: 'Premiaciones y Votos', icon: Trophy },
        { id: 'calendario', label: 'Calendario Oficial', icon: Calendar },
        { id: 'logros', label: 'Misiones y Logros', icon: Award }
      ]
    },
    {
      id: 'tienda',
      label: 'Tienda',
      icon: Store,
      items: [
        { id: 'tienda', label: 'Tienda Oficial y Outlet', icon: Store },
        { id: 'fashion', label: 'Moda y Revistas', icon: Shirt },
        { id: 'customize', label: 'Personalizar Avatar y Perfil', icon: Palette }
      ]
    },
    {
      id: 'administracion',
      label: 'Administración',
      icon: ShieldAlert,
      items: [
        {
          id: 'moderacion',
          label: 'Moderación y Reportes',
          icon: ShieldAlert,
          hide: userProfile.accountType !== 'admin'
        },
        { id: 'partners', label: 'Alianzas y Partners', icon: Building2 },
        { id: 'configuracion', label: 'Configuración General', icon: Settings }
      ]
    }
  ];

  const getCategoryOfSection = (section: AppSection): string | undefined => {
    return categories.find((cat) => cat.items.some((item) => item.id === section))?.id;
  };

  const activeCategory = getCategoryOfSection(currentSection);

  const handleItemClick = (secId: AppSection) => {
    onSelectSection(secId);
    setOpenCategory(null);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-2 sm:px-4 py-2 flex items-center justify-between gap-2 shadow-md">
      {/* Left Menu & Brand */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer active:scale-95"
          title="Menú de cuenta"
        >
          <Menu className="w-5 h-5" style={{ color: primaryButtonColor }} />
        </button>

        <div
          onClick={() => onSelectSection('foros')}
          className="flex items-center gap-2 cursor-pointer select-none active:scale-95 transition"
        >
          <div
            style={{ backgroundColor: primaryButtonColor }}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow"
          >
            <Music className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-white hidden lg:inline">
            YM-ki <span style={{ color: primaryButtonColor }}>Web</span>
          </span>
        </div>
      </div>

      {/* Center Categorized Navigation Bar (Touch and Click Friendly) */}
      <div ref={navRef} className="relative flex items-center gap-1 sm:gap-2">
        <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800/80 shadow-inner overflow-x-auto max-w-[55vw] sm:max-w-none scrollbar-none">
          {categories.map((cat) => {
            const CatIcon = cat.icon;
            const isCategoryActive = activeCategory === cat.id;
            const isOpen = openCategory === cat.id;
            const visibleItems = cat.items.filter((it) => !it.hide);
            if (visibleItems.length === 0) return null;

            return (
              <div key={cat.id} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenCategory(isOpen ? null : cat.id)}
                  style={
                    isCategoryActive
                      ? { backgroundColor: primaryButtonColor, color: '#ffffff' }
                      : undefined
                  }
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer active:scale-95 select-none ${
                    isCategoryActive
                      ? 'shadow-md text-white font-black'
                      : isOpen
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                  aria-expanded={isOpen}
                  title={`Categoría: ${cat.label}`}
                >
                  <CatIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="whitespace-nowrap">{cat.label}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu for Category */}
                {isOpen && (
                  <div className="absolute top-full left-0 mt-2 z-50 w-56 sm:w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 animate-fadeIn space-y-1">
                    <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      {cat.label}
                    </div>
                    {visibleItems.map((item) => {
                      const ItemIcon = item.icon;
                      const isItemActive = currentSection === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleItemClick(item.id)}
                          style={
                            isItemActive
                              ? { backgroundColor: `${primaryButtonColor}25`, color: primaryButtonColor }
                              : undefined
                          }
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                            isItemActive
                              ? 'border border-indigo-500/30'
                              : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <ItemIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {isItemActive && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Right User Bar: All buttons and icons reflect primaryButtonColor */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Global Search */}
        <button
          onClick={onOpenSearchModal}
          className="p-2 rounded-xl hover:bg-slate-800 transition active:scale-95 cursor-pointer"
          title="Buscar en la plataforma"
        >
          <Search className="w-4 h-4" style={{ color: primaryButtonColor }} />
        </button>

        {/* Theme quick toggle */}
        <button
          onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl hover:bg-slate-800 transition active:scale-95 cursor-pointer"
          title={themeMode === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
        >
          {themeMode === 'dark' ? (
            <Sun className="w-4 h-4" style={{ color: primaryButtonColor }} />
          ) : (
            <Moon className="w-4 h-4" style={{ color: primaryButtonColor }} />
          )}
        </button>

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotificationsModal}
          className="relative p-2 rounded-xl hover:bg-slate-800 transition active:scale-95 cursor-pointer"
          title="Bandeja de Notificaciones y Audiciones"
        >
          <Bell className="w-4 h-4" style={{ color: primaryButtonColor }} />
          {unreadNotifsCount > 0 && (
            <span
              style={{ backgroundColor: primaryButtonColor }}
              className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold rounded-full flex items-center justify-center text-white shadow"
            >
              {unreadNotifsCount}
            </span>
          )}
        </button>

        {/* Coins Wallet Badge */}
        <div
          onClick={onOpenCoinsModal}
          style={{
            borderColor: `${primaryButtonColor}50`,
            backgroundColor: `${primaryButtonColor}18`,
            color: primaryButtonColor
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border cursor-pointer hover:opacity-90 transition select-none shadow-sm active:scale-95"
          title={hasUnlimited ? 'Coins y Gemas Ilimitadas (Admin/Artista)' : 'Ver Cartera de YM-Coins'}
        >
          <Coins className="w-4 h-4 flex-shrink-0" style={{ color: primaryButtonColor }} />
          <span className="text-xs font-black hidden sm:inline">
            {hasUnlimited ? '∞ Ilimitadas' : userProfile.coins.toLocaleString('es-MX')}
          </span>
        </div>

        {/* User Profile Button */}
        <button
          onClick={() => onSelectSection('customize')}
          className="flex items-center gap-1.5 py-1 px-1.5 rounded-full hover:bg-slate-800 transition text-left cursor-pointer active:scale-95"
          title="Personalizar perfil"
        >
          <AvatarWithFrame
            src={userProfile.avatar}
            size="sm"
            ringColor={primaryButtonColor}
            transparentFrame={userProfile.transparentFrame}
          />
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition cursor-pointer active:scale-95"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" style={{ color: primaryButtonColor }} />
        </button>
      </div>
    </header>
  );
};
