import React, { useState } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Palette,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Send,
  Lock,
  CheckCircle2,
  Coins,
  Crown,
  Edit3,
  AlertCircle,
  X,
  Check,
  Save,
  Bell,
  Sliders,
  Shield,
  Layers,
  History,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AccountType, ButtonThemeConfig, AdminDelegations } from '../types';

export const ConfigurationSection: React.FC = () => {
  const {
    userProfile,
    updateProfile,
    themeMode,
    setThemeMode,
    primaryButtonColor,
    setPrimaryButtonColor,
    buttonTheme,
    updateButtonTheme,
    themeGradient,
    themeBannerGradient,
    upgradeToPremiumFan,
    requestCeoUpgrade,
    ceoRequests,
    approveCeoRequest,
    rejectCeoRequest,
    firstRegisteredUser,
    isPrimaryCeo,
    changeUsername,
    allProfiles,
    ceosList,
    currentUser,
    auditionPassCodes,
    redeemRoleCode,
    cleanGhostPosts,
    isPrivileged,
    adminDelegations,
    delegateAdminPermissions,
    adminAuditLog,
    notificationPreferences,
    toggleNotificationPreference,
    showToast
  } = useApp();

  const [selectedRole, setSelectedRole] = useState<AccountType>(userProfile.accountType);
  const [selectedCeoId, setSelectedCeoId] = useState<string>(ceosList[0]?.id || 'ceo-miki');
  const [ceoRequestReason, setCeoRequestReason] = useState<string>('');
  const [codeToRedeem, setCodeToRedeem] = useState<string>('');

  // Username change in configuration
  const [isChangingUsername, setIsChangingUsername] = useState(false);
  const [newUsernameInput, setNewUsernameInput] = useState(userProfile.username);
  const [usernameStatusMsg, setUsernameStatusMsg] = useState('');
  const [isSubmittingUsername, setIsSubmittingUsername] = useState(false);

  // Button Color Customization Engine State
  const [btnBgColor, setBtnBgColor] = useState(buttonTheme?.bgColor || '#6366f1');
  const [btnTextColor, setBtnTextColor] = useState(buttonTheme?.textColor || '#ffffff');
  const [btnBorderColor, setBtnBorderColor] = useState(buttonTheme?.borderColor || '#6366f1');
  const [btnHoverBgColor, setBtnHoverBgColor] = useState(buttonTheme?.hoverBgColor || '#4f46e5');
  const [btnActiveBgColor, setBtnActiveBgColor] = useState(buttonTheme?.activeBgColor || '#4338ca');

  // Secondary Admin delegation state (Super Admin only)
  const allAdmins = Object.keys(allProfiles).filter(
    (u) => allProfiles[u].accountType === 'admin' && u !== firstRegisteredUser
  );
  const [selectedAdminForDelegation, setSelectedAdminForDelegation] = useState<string>(allAdmins[0] || '');
  const currentDelegation: AdminDelegations = adminDelegations[selectedAdminForDelegation] || {
    canApproveArtist: true,
    canApproveTrainee: true,
    canManageAuditions: true,
    canManageStore: false,
    canManageSurvival: true
  };
  const [delPerms, setDelPerms] = useState<AdminDelegations>(currentDelegation);

  const isAdmin = isPrivileged();
  const isPrimary = isPrimaryCeo();
  const currentRole = userProfile.accountType;
  const isPrivilegedUser =
    currentRole === 'admin' ||
    currentRole === 'artista' ||
    currentRole === 'premium_fan';

  // Preset button themes
  const presetPalettes: { name: string; bg: string; text: string; border: string; hover: string; active: string }[] = [
    { name: 'YM-ki Indigo', bg: '#6366f1', text: '#ffffff', border: '#6366f1', hover: '#4f46e5', active: '#4338ca' },
    { name: 'Electric Violet', bg: '#8b5cf6', text: '#ffffff', border: '#8b5cf6', hover: '#7c3aed', active: '#6d28d9' },
    { name: 'Cyber Rose', bg: '#ec4899', text: '#ffffff', border: '#ec4899', hover: '#db2777', active: '#be185d' },
    { name: 'Emerald Idol', bg: '#10b981', text: '#ffffff', border: '#10b981', hover: '#059669', active: '#047857' },
    { name: 'Gold Luxury', bg: '#f59e0b', text: '#000000', border: '#d97706', hover: '#d97706', active: '#b45309' },
    { name: 'Crimson Flame', bg: '#ef4444', text: '#ffffff', border: '#ef4444', hover: '#dc2626', active: '#b91c1c' },
    { name: 'Dark Slate', bg: '#334155', text: '#f8fafc', border: '#475569', hover: '#1e293b', active: '#0f172a' }
  ];

  const handleApplyPreset = (p: typeof presetPalettes[0]) => {
    setBtnBgColor(p.bg);
    setBtnTextColor(p.text);
    setBtnBorderColor(p.border);
    setBtnHoverBgColor(p.hover);
    setBtnActiveBgColor(p.active);
  };

  const handleSaveButtonTheme = () => {
    updateButtonTheme({
      bgColor: btnBgColor,
      textColor: btnTextColor,
      borderColor: btnBorderColor,
      hoverBgColor: btnHoverBgColor,
      activeBgColor: btnActiveBgColor
    });
    setPrimaryButtonColor(btnBgColor);
    showToast('¡Configuración global de botones guardada y aplicada en toda la plataforma!');
  };

  const handleRoleSelection = (role: AccountType) => {
    setSelectedRole(role);
  };

  const handleApplyRoleChange = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRole === 'fan') {
      updateProfile({ accountType: 'fan' });
      showToast('Cuenta cambiada a Fan Estándar.');
      return;
    }

    if (selectedRole === 'diseñador') {
      updateProfile({ accountType: 'diseñador' });
      showToast('¡Cuenta configurada como Diseñador Oficial! Tienes permiso para Crear Revistas.');
      return;
    }

    if (selectedRole === 'premium_fan') {
      upgradeToPremiumFan();
      return;
    }

    if (selectedRole === 'artista' || selectedRole === 'admin') {
      if (!ceoRequestReason.trim()) {
        showToast('Por favor escribe el motivo o propuesta de tu postulación.');
        return;
      }
      requestCeoUpgrade(selectedCeoId, selectedRole, ceoRequestReason.trim());
      setCeoRequestReason('');
    }
  };

  const pendingRequestsForUser = ceoRequests.filter((r) => r.username === currentUser);
  const pendingRequestsForCeo = ceoRequests.filter((r) => r.status === 'pending');

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-16 animate-fadeIn text-slate-100">
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-indigo-400" /> Configuración General & Personalización Total
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Ajusta colores centralizados de botones, modo claro/oscuro, notificaciones, membresías y permisos de administración.
        </p>
      </div>

      {/* PANEL 0: MI CUENTA & IDENTIFICADOR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white uppercase tracking-wider">
                Perfil de Usuario
              </span>
              {isPrimary && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-sm">
                  <Crown className="w-3.5 h-3.5 text-amber-400" /> Super Admin / CEO Fundador
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Identificador único de cuenta en YM-ki Records.
            </p>
          </div>

          {!isChangingUsername && (
            <button
              type="button"
              onClick={() => {
                setNewUsernameInput(userProfile.username);
                setUsernameStatusMsg('');
                setIsChangingUsername(true);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-400" /> Cambiar Nombre de Usuario
            </button>
          )}
        </div>

        {!isChangingUsername ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm font-bold text-indigo-300">
              @{userProfile.username}
            </div>
            <span className="text-xs text-slate-400">
              Apodo: <strong className="text-white">{userProfile.nickname}</strong>
            </span>
            <span className="text-xs text-slate-400">
              Rol: <span className="capitalize text-pink-400 font-bold">{userProfile.accountType}</span>
            </span>
          </div>
        ) : (
          <div className="p-4 bg-slate-950 border border-indigo-500/40 rounded-2xl space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">
                Elige tu nuevo nombre de usuario:
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold text-sm">@</span>
              <input
                type="text"
                value={newUsernameInput}
                onChange={(e) => {
                  setNewUsernameInput(e.target.value);
                  setUsernameStatusMsg('');
                }}
                placeholder="Nuevo nombre de usuario..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            {usernameStatusMsg && (
              <p className="text-[11px] text-red-400 font-medium">{usernameStatusMsg}</p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                disabled={isSubmittingUsername || newUsernameInput.trim().length < 3}
                onClick={async () => {
                  setIsSubmittingUsername(true);
                  setUsernameStatusMsg('');
                  const res = await changeUsername(newUsernameInput.trim());
                  setIsSubmittingUsername(false);
                  if (res.success) {
                    setIsChangingUsername(false);
                  } else if (res.error) {
                    setUsernameStatusMsg(res.error);
                  }
                }}
                style={{ backgroundColor: primaryButtonColor }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 shadow cursor-pointer active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                {isSubmittingUsername ? 'Guardando...' : 'Guardar Nombre de Usuario'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsChangingUsername(false);
                  setNewUsernameInput(userProfile.username);
                  setUsernameStatusMsg('');
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition active:scale-95 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PANEL 1: MOTOR CENTRALIZADO DE PERSONALIZACIÓN DE BOTONES */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                Motor Centralizado de Color de Botones
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md font-bold uppercase">
                  Tokens Globales
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Personaliza fondo, texto, bordes, estados hover y active de todos los botones de la plataforma.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveButtonTheme}
            style={{ backgroundColor: btnBgColor, color: btnTextColor }}
            className="px-5 py-2.5 rounded-2xl font-black text-xs shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-1.5 border border-white/20 self-start sm:self-auto"
          >
            <Save className="w-4 h-4" /> Guardar y Aplicar Cambios
          </button>
        </div>

        {/* Preset Palettes */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">
            Paletas Rápidas Prediseñadas:
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {presetPalettes.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 hover:border-slate-500 cursor-pointer active:scale-95 bg-slate-950"
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs"
                  style={{ backgroundColor: p.bg }}
                />
                <span className="text-slate-300">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-2">
          {/* Fondo */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              Color de Fondo
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={btnBgColor}
                onChange={(e) => setBtnBgColor(e.target.value)}
                className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-slate-700"
              />
              <span className="text-xs font-mono font-bold text-white uppercase">{btnBgColor}</span>
            </div>
          </div>

          {/* Texto */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              Color de Texto
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={btnTextColor}
                onChange={(e) => setBtnTextColor(e.target.value)}
                className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-slate-700"
              />
              <span className="text-xs font-mono font-bold text-white uppercase">{btnTextColor}</span>
            </div>
          </div>

          {/* Borde */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              Color del Borde
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={btnBorderColor}
                onChange={(e) => setBtnBorderColor(e.target.value)}
                className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-slate-700"
              />
              <span className="text-xs font-mono font-bold text-white uppercase">{btnBorderColor}</span>
            </div>
          </div>

          {/* Hover */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              Hover (Cursor Encima)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={btnHoverBgColor}
                onChange={(e) => setBtnHoverBgColor(e.target.value)}
                className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-slate-700"
              />
              <span className="text-xs font-mono font-bold text-white uppercase">{btnHoverBgColor}</span>
            </div>
          </div>

          {/* Active */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              Active (Presionado)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={btnActiveBgColor}
                onChange={(e) => setBtnActiveBgColor(e.target.value)}
                className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-slate-700"
              />
              <span className="text-xs font-mono font-bold text-white uppercase">{btnActiveBgColor}</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Sample Buttons */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
            Demostración en Vivo de Botones con la Configuración Seleccionada:
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              style={{
                backgroundColor: btnBgColor,
                color: btnTextColor,
                borderColor: btnBorderColor
              }}
              className="px-5 py-2.5 rounded-xl font-black text-xs border shadow transition active:scale-95 cursor-pointer"
            >
              Botón Principal
            </button>

            <button
              type="button"
              style={{
                backgroundColor: `${btnBgColor}20`,
                color: btnBgColor,
                borderColor: `${btnBgColor}50`
              }}
              className="px-5 py-2.5 rounded-xl font-bold text-xs border shadow-xs transition active:scale-95 cursor-pointer"
            >
              Botón Secundario
            </button>

            <button
              type="button"
              disabled
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60"
            >
              Botón Deshabilitado
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PANEL 2: MODO CLARO / OSCURO */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sun className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Modo de Interfaz (Claro & Oscuro)
            </h3>
          </div>

          <p className="text-xs text-slate-300">
            Ambos modos ofrecen la misma calidad visual, legibilidad optimizada y contraste equilibrado en tarjetas, ventanas y tablas.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer active:scale-95 ${
                themeMode === 'dark'
                  ? 'border-indigo-500 bg-indigo-500/20 text-white shadow'
                  : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400" /> Modo Oscuro
            </button>

            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer active:scale-95 ${
                themeMode === 'light'
                  ? 'border-indigo-500 bg-indigo-500/20 text-white shadow'
                  : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-400" /> Modo Claro
            </button>
          </div>
        </div>

        {/* PANEL 3: PREFERENCIAS DE NOTIFICACIONES */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Bell className="w-5 h-5 text-pink-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Preferencias de Notificaciones
            </h3>
          </div>

          <p className="text-xs text-slate-300">
            Elige las categorías de alertas que deseas recibir en tu centro de notificaciones:
          </p>

          <div className="space-y-2 pt-1">
            {[
              { id: 'account', label: 'Cuenta & Seguridad (Ascensos, códigos, roles)' },
              { id: 'community', label: 'Comunidad & Foros (Comentarios, likes)' },
              { id: 'message', label: 'Mensajes Privados & Chats grupales' },
              { id: 'audition', label: 'Centro de Audiciones (Revisiones, veredictos)' },
              { id: 'survival', label: 'Survival Shows (Rondas, votos, episodios)' },
              { id: 'store', label: 'Tienda Oficial & Outlet (Ventas, entregas)' }
            ].map((cat) => {
              const active = notificationPreferences[cat.id] ?? true;
              return (
                <div
                  key={cat.id}
                  onClick={() => toggleNotificationPreference(cat.id)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition"
                >
                  <span className="text-xs font-medium text-slate-200">{cat.label}</span>
                  <div
                    className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 ${
                      active ? 'bg-indigo-600 justify-end' : 'bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* PANEL 4: SUPER ADMIN & DELEGACIÓN DE PERMISOS (SUPER ADMIN EXCLUSIVO) */}
      {isPrimary && (
        <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  Panel del Super Admin / Administrador Principal
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md font-bold uppercase">
                    Control Absoluto
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Como primer usuario registrado (@{firstRegisteredUser}), eres el único facultado para aprobar administradores y delegar permisos.
                </p>
              </div>
            </div>
          </div>

          {/* Pending Admin Upgrade Requests */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" /> Solicitudes de Nuevos Administradores ({pendingRequestsForCeo.length})
            </h4>

            {pendingRequestsForCeo.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center bg-slate-950 rounded-xl border border-slate-800">
                No hay solicitudes de nuevos administradores pendientes en este momento.
              </p>
            ) : (
              pendingRequestsForCeo.map((req) => (
                <div
                  key={req.id}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <span className="font-bold text-xs text-white">@{req.username}</span>
                    <p className="text-xs text-slate-300 mt-1">"{req.reason}"</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => approveCeoRequest(req.id)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow cursor-pointer active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" /> Aprobar como Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectCeoRequest(req.id)}
                      className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer active:scale-95"
                    >
                      <X className="w-3.5 h-3.5" /> Rechazar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Delegation of Permissions to Secondary Admins */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Delegación de Permisos a Administradores Secundarios
            </h4>

            {allAdmins.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center bg-slate-950 rounded-xl border border-slate-800">
                Actualmente no hay administradores secundarios registrados.
              </p>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-300">Administrador:</label>
                  <select
                    value={selectedAdminForDelegation}
                    onChange={(e) => {
                      setSelectedAdminForDelegation(e.target.value);
                      setDelPerms(adminDelegations[e.target.value] || currentDelegation);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  >
                    {allAdmins.map((u) => (
                      <option key={u} value={u}>
                        @{u}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Permission checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'canApproveArtist', label: 'Permiso para Aprobar Artistas' },
                    { key: 'canApproveTrainee', label: 'Permiso para Aprobar Trainees' },
                    { key: 'canManageAuditions', label: 'Gestión Completa de Audiciones' },
                    { key: 'canManageStore', label: 'Gestión y Publicación en Tienda' },
                    { key: 'canManageSurvival', label: 'Gestión y Rondas de Survival' }
                  ].map((perm) => (
                    <label key={perm.key} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(delPerms[perm.key as keyof AdminDelegations])}
                        onChange={(e) =>
                          setDelPerms({
                            ...delPerms,
                            [perm.key]: e.target.checked
                          })
                        }
                        className="rounded bg-slate-800 border-slate-700 text-indigo-600"
                      />
                      <span className="text-slate-300">{perm.label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      delegateAdminPermissions(selectedAdminForDelegation, delPerms);
                      showToast(`Permisos delegados con éxito a @${selectedAdminForDelegation}`);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow active:scale-95 cursor-pointer"
                  >
                    Guardar Delegación de Permisos
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Audit Log */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History className="w-4 h-4" /> Registro de Auditoría Administrativa ({adminAuditLog.length})
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {adminAuditLog.map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white">@{log.adminUsername}</span>: {log.action}
                    {log.targetUser && <span className="text-slate-400"> (para @{log.targetUser})</span>}
                  </div>
                  <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PANEL 5: TIPO DE CUENTA & AUDICIONES */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Tipo de Cuenta & Solicitud al CEO
          </h3>
        </div>

        <form onSubmit={handleApplyRoleChange} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Seleccionar Modo de Cuenta:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div
                onClick={() => handleRoleSelection('fan')}
                className={`p-3 rounded-2xl border cursor-pointer transition ${
                  selectedRole === 'fan' ? 'border-indigo-500 bg-indigo-500/20' : 'border-slate-800 bg-slate-800/50'
                }`}
              >
                <span className="text-xs font-bold text-white block">Fan Estándar</span>
                <span className="text-[10px] text-slate-400">Comunidad & Foros</span>
              </div>

              <div
                onClick={() => handleRoleSelection('premium_fan')}
                className={`p-3 rounded-2xl border cursor-pointer transition ${
                  selectedRole === 'premium_fan' ? 'border-amber-500 bg-amber-500/20' : 'border-slate-800 bg-slate-800/50'
                }`}
              >
                <span className="text-xs font-bold text-amber-300 block">Premium Fan</span>
                <span className="text-[10px] text-amber-400">10,000 Coins</span>
              </div>

              <div
                onClick={() => handleRoleSelection('artista')}
                className={`p-3 rounded-2xl border cursor-pointer transition ${
                  selectedRole === 'artista' ? 'border-pink-500 bg-pink-500/20' : 'border-slate-800 bg-slate-800/50'
                }`}
              >
                <span className="text-xs font-bold text-pink-300 block">Artista Oficial</span>
                <span className="text-[10px] text-slate-400">Vía Permiso CEO</span>
              </div>

              <div
                onClick={() => handleRoleSelection('admin')}
                className={`p-3 rounded-2xl border cursor-pointer transition ${
                  selectedRole === 'admin' ? 'border-cyan-500 bg-cyan-500/20' : 'border-slate-800 bg-slate-800/50'
                }`}
              >
                <span className="text-xs font-bold text-cyan-300 block">CEO / Admin</span>
                <span className="text-[10px] text-slate-400">Vía Super Admin</span>
              </div>
            </div>
          </div>

          {(selectedRole === 'artista' || selectedRole === 'admin') && currentRole !== selectedRole && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <label className="text-xs font-bold text-slate-300 block">
                Motivo o justificación de tu postulación:
              </label>
              <textarea
                value={ceoRequestReason}
                onChange={(e) => setCeoRequestReason(e.target.value)}
                placeholder="Explica tu visión, capacidades o propuesta..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white min-h-[70px]"
                required
              />
            </div>
          )}

          <button
            type="submit"
            style={{ backgroundColor: primaryButtonColor }}
            className="w-full py-2.5 text-white font-bold rounded-xl text-xs shadow cursor-pointer active:scale-95"
          >
            Aplicar Modo de Cuenta
          </button>
        </form>

        {/* Canje de Código de Audición */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Activar Modo Trainee o Artista mediante Código de Audición
          </h4>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!codeToRedeem.trim()) return;
              const res = redeemRoleCode(codeToRedeem.trim());
              if (res.success) setCodeToRedeem('');
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={codeToRedeem}
              onChange={(e) => setCodeToRedeem(e.target.value.toUpperCase())}
              placeholder="Ej. YM-ART-849201"
              className="flex-1 uppercase font-mono px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
            />
            <button
              type="submit"
              style={{ backgroundColor: primaryButtonColor }}
              className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow active:scale-95 cursor-pointer"
            >
              Canjear
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
