import React from 'react';
import {
  X,
  Settings,
  User,
  Sparkles,
  Shield,
  Coins,
  Layers,
  LogOut,
  FolderOpen,
  CreditCard,
  UserCheck,
  Flame,
  Calendar,
  Award,
  Handshake,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarWithFrame } from './AvatarWithFrame';
import { UserBadges } from './UserBadges';

import { AppSection } from './Navbar';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToSection: (section: AppSection) => void;
  onOpenMerchShowcase: () => void;
  onOpenCoinsModal: () => void;
  onOpenCeoEditModal: () => void;
  onSelectForum: (forumId: string) => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  onGoToSection,
  onOpenMerchShowcase,
  onOpenCoinsModal,
  onOpenCeoEditModal,
  onSelectForum
}) => {
  const { userProfile, forums, fanClubs, logout, showToast } = useApp();

  if (!isOpen) return null;

  const isAdmin = userProfile.accountType === 'admin';
  const isTraineeOrArtist =
    userProfile.accountType === 'trainee' ||
    userProfile.accountType === 'artista' ||
    userProfile.accountType === 'admin';

  const joinedForums = forums.filter((f) => f.isJoined);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fadeIn"
      />

      {/* Drawer */}
      <aside className="fixed top-0 left-0 bottom-0 z-50 w-80 bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col justify-between animate-slideRight">
        {/* Top Header */}
        <div>
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AvatarWithFrame
                src={userProfile.avatar}
                size="md"
                ringColor={userProfile.ringColor}
                transparentFrame={userProfile.transparentFrame}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h3 className="text-sm font-bold text-white truncate">
                    {userProfile.nickname || userProfile.username}
                  </h3>
                  <UserBadges user={userProfile} fanClubs={fanClubs} showFandomBadges={false} />
                </div>
                <span className="text-[11px] text-slate-400 block truncate">
                  @{userProfile.username} ({userProfile.accountType})
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links */}
          <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-3 py-1">
              Ajustes & Herramientas
            </div>

            {/* Go to Configuration Page (now full page as requested!) */}
            <button
              onClick={() => {
                onClose();
                onGoToSection('configuracion');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition"
            >
              <Settings className="w-4 h-4 text-indigo-400" /> Configuración de Cuenta & Tema
            </button>

            {/* Option to edit CEO evaluator profile: ONLY FOR ADMINS AS REQUESTED! */}
            {isAdmin && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCeoEditModal();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition shadow-sm"
              >
                <UserCheck className="w-4 h-4 text-indigo-400" /> Editar Perfil de CEO Evaluador
              </button>
            )}

            {/* ID-Card if Trainee or Artist */}
            {isTraineeOrArtist && (
              <button
                onClick={() => {
                  onClose();
                  onGoToSection('idcard');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition shadow-sm"
              >
                <CreditCard className="w-4 h-4 text-amber-400" /> Mi ID-Card Oficial
              </button>
            )}

            {/* Calendario General */}
            <button
              onClick={() => {
                onClose();
                onGoToSection('calendario');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-cyan-300 hover:text-white bg-slate-800/50 hover:bg-cyan-600/20 border border-slate-700/60 transition active:scale-95"
            >
              <Calendar className="w-4 h-4 text-cyan-400" /> Calendario Oficial Automatizado
            </button>

            {/* Colaboraciones */}
            <button
              onClick={() => {
                onClose();
                onGoToSection('colaboraciones');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-purple-300 hover:text-white bg-slate-800/50 hover:bg-purple-600/20 border border-slate-700/60 transition active:scale-95"
            >
              <Handshake className="w-4 h-4 text-purple-400" /> Sistema de Colaboraciones
            </button>

            {/* Logros & Insignias */}
            <button
              onClick={() => {
                onClose();
                onGoToSection('logros');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-300 hover:text-white bg-slate-800/50 hover:bg-amber-600/20 border border-slate-700/60 transition active:scale-95"
            >
              <Award className="w-4 h-4 text-amber-400" /> Vitrina de Logros & Recompensas
            </button>

            {/* Moderación (Admins) */}
            {isAdmin && (
              <button
                onClick={() => {
                  onClose();
                  onGoToSection('moderacion');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 transition active:scale-95"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" /> Panel de Moderación & Denuncias
              </button>
            )}

            {/* Fashion & Revistas */}
            <button
              onClick={() => {
                onClose();
                onGoToSection('fashion');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-slate-800/50 hover:bg-rose-600/20 border border-slate-700/60 transition active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-rose-400" /> Fashion & Revistas Oficiales
            </button>

            {/* Lanzamientos */}
            <button
              onClick={() => {
                onClose();
                onGoToSection('lanzamientos');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-indigo-300 hover:text-white bg-slate-800/50 hover:bg-indigo-600/20 border border-slate-700/60 transition active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" /> Hub de Lanzamientos
            </button>

            {/* Premiaciones */}
            <button
              onClick={() => {
                onClose();
                onGoToSection('premiaciones');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-300 hover:text-white bg-slate-800/50 hover:bg-amber-600/20 border border-slate-700/60 transition active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> Premiaciones & Votaciones
            </button>

            {/* Charts & Rankings */}
            <button
              onClick={() => {
                onClose();
                onGoToSection('charts');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-emerald-300 hover:text-white bg-slate-800/50 hover:bg-emerald-600/20 border border-slate-700/60 transition active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" /> Charts & Rankings Oficiales
            </button>

            {/* Survival */}
            <button
              onClick={() => {
                onClose();
                onGoToSection('survival');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-slate-800/50 hover:bg-rose-600/20 border border-slate-700/60 transition active:scale-95"
            >
              <Flame className="w-4 h-4 text-rose-400" /> Supervivencia (Survival)
            </button>

            {/* Partners */}
            <button
              onClick={() => {
                onClose();
                onGoToSection('partners');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-cyan-300 hover:text-white bg-slate-800/50 hover:bg-cyan-600/20 border border-slate-700/60 transition active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" /> Partners & Empresas Aliadas
            </button>

            {/* Customize Profile */}
            <button
              onClick={() => {
                onClose();
                onGoToSection('customize');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition active:scale-95"
            >
              <User className="w-4 h-4 text-indigo-400" /> Personalizar Perfil & Marco
            </button>

            {/* Dedicated Merch Showcase */}
            <button
              onClick={() => {
                onClose();
                onOpenMerchShowcase();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> Mi Vitrina de Merch
            </button>

            {/* Coins Wallet */}
            <button
              onClick={() => {
                onClose();
                onOpenCoinsModal();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition"
            >
              <Coins className="w-4 h-4 text-amber-400" /> Cartera YM-Coins ({userProfile.coins.toLocaleString()})
            </button>

            <button
              onClick={() => {
                onClose();
                showToast('Privacidad: Tu perfil y publicaciones son visibles para la comunidad.');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition"
            >
              <Shield className="w-4 h-4 text-emerald-400" /> Privacidad & Términos
            </button>

            {/* Joined forums */}
            <div className="pt-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-3 py-1 flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5" /> Foros a los que te has unido
              </div>
              <div className="mt-1 space-y-1">
                {joinedForums.length === 0 ? (
                  <span className="text-xs text-slate-500 px-3 py-1 block">
                    No te has unido a ningún foro todavía.
                  </span>
                ) : (
                  joinedForums.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        onClose();
                        onSelectForum(f.id);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition truncate block"
                    >
                      {f.name} {f.isFandomForum && `[⭐ ${f.fandomName}]`}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/30 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
};
