import React, { useState } from 'react';
import {
  UserCheck,
  Upload,
  Trash2,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Palette,
  ShieldAlert,
  Save,
  ArrowLeft,
  Edit3,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCcw,
  Sliders,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarWithFrame } from './AvatarWithFrame';
import { FileUploadButton } from './FileUploadButton';

interface ProfileCustomizeSectionProps {
  onBack: () => void;
}

export const ProfileCustomizeSection: React.FC<ProfileCustomizeSectionProps> = ({ onBack }) => {
  const {
    userProfile,
    currentUser,
    updateProfile,
    updateCustomization,
    fanClubs,
    changeUsername,
    allProfiles,
    removeFrame,
    canUploadGif,
    primaryButtonColor,
    showToast,
    userStatus,
    updateUserStatus,
    clearUserStatus
  } = useApp();

  const [nickname, setNickname] = useState(userProfile.nickname || userProfile.username);
  const [description, setDescription] = useState(userProfile.description || '');

  // User status state
  const [statusText, setStatusText] = useState(userStatus?.text || '');
  const [statusEmoji, setStatusEmoji] = useState(userStatus?.emoji || '✨');
  const [statusVisibility, setStatusVisibility] = useState<'public' | 'followers' | 'private'>(userStatus?.visibility || 'public');
  const [statusDuration, setStatusDuration] = useState<number>(0);

  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatar);
  const [bannerUrl, setBannerUrl] = useState(userProfile.banner);
  const [ringColor, setRingColor] = useState(userProfile.ringColor || '#6366f1');
  const [transparentFrame, setTransparentFrame] = useState<string | null>(
    userProfile.transparentFrame
  );

  // New Frame & Customization state
  const [selectedFrame, setSelectedFrame] = useState<string>(
    userProfile.selectedFrameId || 'cyber_neon'
  );
  const [customFrameColor, setCustomFrameColor] = useState<string>(
    userProfile.customFrameColor || userProfile.ringColor || '#6366f1'
  );
  const [customTransparentFrame, setCustomTransparentFrame] = useState<string | null>(
    userProfile.customTransparentFrame || userProfile.transparentFrame || null
  );
  const [frameScale, setFrameScale] = useState<number>(userProfile.frameScale ?? 1.08);
  const [frameOffsetX, setFrameOffsetX] = useState<number>(userProfile.frameOffsetX ?? 0);
  const [frameOffsetY, setFrameOffsetY] = useState<number>(userProfile.frameOffsetY ?? 0);

  // Fandom Tags display state
  const [fandomDisplayMode, setFandomDisplayMode] = useState<'beside_username' | 'description'>(
    userProfile.fandomDisplayMode || 'beside_username'
  );
  const [displayedFandomTags, setDisplayedFandomTags] = useState<string[]>(
    userProfile.displayedFandomTags || []
  );

  // Username change state
  const [isChangingUsername, setIsChangingUsername] = useState(false);
  const [newUsernameInput, setNewUsernameInput] = useState(userProfile.username);
  const [usernameStatusMsg, setUsernameStatusMsg] = useState('');
  const [isSubmittingUsername, setIsSubmittingUsername] = useState(false);

  // Privileged fields (for Artista, Admin and Premium Fan)
  const isPrivilegedUser =
    userProfile.accountType === 'artista' ||
    userProfile.accountType === 'admin' ||
    userProfile.accountType === 'premium_fan' ||
    userProfile.isFounder;

  const [profileBgColor, setProfileBgColor] = useState(
    userProfile.profileBgColor || '#1e293b'
  );
  const [badgeAdminColor, setBadgeAdminColor] = useState(
    userProfile.badgeAdminColor || '#ec4899'
  );
  const [badgeVerifiedColor, setBadgeVerifiedColor] = useState(
    userProfile.badgeVerifiedColor || '#38bdf8'
  );
  const [animal, setAnimal] = useState(userProfile.animal || 'Zorro 🦊');
  const [allowMessages, setAllowMessages] = useState(
    userProfile.allowMessages !== false
  );

  // File upload with GIF restriction rule
  const handleImageFile = (
    file: File,
    target: 'avatar' | 'banner' | 'frame'
  ) => {
    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');

    if (isGif) {
      if (!canUploadGif()) {
        showToast(
          'Los GIFs como banner o foto de perfil solo están permitidos para Administradores, Artistas o Foros Verificados. Las cuentas estándar no pueden adjuntar GIFs.'
        );
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (target === 'avatar') setAvatarUrl(reader.result);
        if (target === 'banner') setBannerUrl(reader.result);
        if (target === 'frame') setTransparentFrame(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const userJoinedClubs = fanClubs.filter((fc) => fc.members.includes(currentUser || ''));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      nickname: nickname.trim() || userProfile.username,
      description: description.trim(),
      avatar: avatarUrl,
      banner: bannerUrl,
      ringColor: customFrameColor,
      transparentFrame: customTransparentFrame,
      customTransparentFrame,
      frameScale,
      frameOffsetX,
      frameOffsetY,
      customFrameColor,
      selectedFrameId: selectedFrame,
      fandomDisplayMode,
      displayedFandomTags,
      profileBgColor: isPrivilegedUser ? profileBgColor : userProfile.profileBgColor,
      badgeAdminColor: isPrivilegedUser ? badgeAdminColor : userProfile.badgeAdminColor,
      badgeVerifiedColor: isPrivilegedUser ? badgeVerifiedColor : userProfile.badgeVerifiedColor,
      animal: isPrivilegedUser ? animal.trim() : userProfile.animal,
      allowMessages: isPrivilegedUser ? allowMessages : userProfile.allowMessages
    });

    await updateCustomization({
      currentFrame: selectedFrame,
      frameCustomColor: customFrameColor,
      customTransparentFrame,
      frameScale,
      frameOffsetX,
      frameOffsetY,
      fandomDisplayMode,
      displayedFandomTags
    });

    showToast('Perfil y personalización de marco actualizados correctamente.');
    onBack();
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto pb-12 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-indigo-400" /> Personalizar Perfil y Marco
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Banner Preview & Single Clean Upload */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">Banner de Perfil:</label>
          <div
            className="relative w-full h-36 rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center group"
            style={{ backgroundImage: `url("${bannerUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition flex items-center justify-center">
              <label className="cursor-pointer px-4 py-2 bg-slate-900/80 hover:bg-slate-900 border border-slate-700 text-white rounded-xl text-xs font-semibold shadow transition flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-400" /> Cambiar Banner desde Galería
                <input
                  type="file"
                  accept={canUploadGif() ? 'image/*' : 'image/png,image/jpeg,image/webp'}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageFile(f, 'banner');
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Avatar & Outer Frame Section with Live Preview */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col sm:flex-row items-center gap-6 shadow-xl">
          <div className="flex flex-col items-center gap-2">
            {/* Real Avatar with live frame and custom parameters preview */}
            <AvatarWithFrame
              avatarUrl={avatarUrl}
              size="2xl"
              frameStyle={selectedFrame}
              ringColor={customFrameColor}
              frameCustomColor={customFrameColor}
              transparentFrame={customTransparentFrame}
              frameScale={frameScale}
              frameOffsetX={frameOffsetX}
              frameOffsetY={frameOffsetY}
            />

            {(selectedFrame !== 'none' || customTransparentFrame) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFrame('none');
                  setCustomTransparentFrame(null);
                  setTransparentFrame(null);
                  removeFrame();
                }}
                className="mt-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 rounded-xl text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Quitar Marco
              </button>
            )}
          </div>

          <div className="flex-1 space-y-3 w-full">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Foto de Perfil / Avatar:
              </label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-semibold shadow transition flex items-center gap-2 active:scale-95">
                  <Upload className="w-3.5 h-3.5 text-indigo-400" /> Subir foto desde dispositivo
                  <input
                    type="file"
                    accept={canUploadGif() ? 'image/*' : 'image/png,image/jpeg,image/webp'}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImageFile(f, 'avatar');
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Frame Style Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">
                Marco de Avatar Decorativo:
              </label>
              <select
                value={selectedFrame}
                onChange={(e) => setSelectedFrame(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
              >
                <option value="cyber_neon">⚡ Ciberpunk Neón (Borde pulsante y aura)</option>
                <option value="gold_star">⭐ Estrella Dorada (Borde estelar brillante)</option>
                <option value="prism_diamond">💎 Diamante Prisma (Efecto translúcido irisado)</option>
                <option value="sakura">🌸 Flores Sakura (Pétalos y aura suave)</option>
                <option value="custom_png">✨ Marco PNG de Galería / Tienda</option>
                <option value="none">Sin marco decorativo</option>
              </select>
            </div>

            {/* Color Picker & HEX Input with Reset Button */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Color del Marco / Aura (HEX):
                </label>
                <button
                  type="button"
                  onClick={() => setCustomFrameColor('#6366f1')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Restaurar por defecto
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customFrameColor}
                  onChange={(e) => setCustomFrameColor(e.target.value)}
                  className="w-10 h-9 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={customFrameColor}
                  onChange={(e) => setCustomFrameColor(e.target.value)}
                  placeholder="#6366f1"
                  className="w-28 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase"
                />
                <span className="text-[11px] text-slate-400">Previsualización inmediata</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Attachment for Administradores & Artistas */}
        {isPrivilegedUser && (
          <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/40 rounded-2xl space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                Adjuntar Marco PNG de tu Galería (Exclusivo Administradores & Artistas)
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                {userProfile.accountType === 'admin' ? '👑 Admin' : '🎤 Artista'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Como administrador o artista, puedes subir directamente cualquier marco en formato PNG transparente desde tu dispositivo y ajustarlo en tiempo real a tu avatar.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 active:scale-95">
                <Upload className="w-4 h-4" /> Seleccionar Marco PNG de Galería
                <input
                  type="file"
                  accept="image/png,image/webp,image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setCustomTransparentFrame(reader.result);
                          setSelectedFrame('custom_png');
                        }
                      };
                      reader.readAsDataURL(f);
                    }
                  }}
                  className="hidden"
                />
              </label>

              {customTransparentFrame && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomTransparentFrame(null);
                    if (selectedFrame === 'custom_png') setSelectedFrame('none');
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Quitar Marco de Galería
                </button>
              )}
            </div>

            {customTransparentFrame && (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Escala del Marco:
                    </span>
                    <span className="font-mono text-indigo-400 font-bold">{frameScale.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.8}
                    max={1.5}
                    step={0.02}
                    value={frameScale}
                    onChange={(e) => setFrameScale(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Desplazamiento X:</span>
                      <span className="font-mono">{frameOffsetX}px</span>
                    </div>
                    <input
                      type="range"
                      min={-30}
                      max={30}
                      step={1}
                      value={frameOffsetX}
                      onChange={(e) => setFrameOffsetX(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Desplazamiento Y:</span>
                      <span className="font-mono">{frameOffsetY}px</span>
                    </div>
                    <input
                      type="range"
                      min={-30}
                      max={30}
                      step={1}
                      value={frameOffsetY}
                      onChange={(e) => setFrameOffsetY(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Basic fields */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-white mb-0.5">
                  Nombre de Usuario (ID oficial único):
                </label>
                <span className="text-[11px] text-slate-400">
                  Tu identificador en la red social, foros y créditos.
                </span>
              </div>
              {!isChangingUsername && (
                <button
                  type="button"
                  onClick={() => {
                    setNewUsernameInput(userProfile.username);
                    setUsernameStatusMsg('');
                    setIsChangingUsername(true);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" /> Cambiar Nombre de Usuario
                </button>
              )}
            </div>

            {!isChangingUsername ? (
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-mono text-indigo-300 font-bold">
                  @{userProfile.username}
                </span>
                <span className="text-[11px] text-slate-500 italic">
                  (Para cambiar tu nombre de usuario pulsa el botón de arriba)
                </span>
              </div>
            ) : (
              <div className="p-3 bg-slate-950 border border-indigo-500/40 rounded-xl space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-300">
                    Introduce tu nuevo nombre de usuario:
                  </span>
                  {newUsernameInput.trim().length >= 3 && (
                    newUsernameInput.trim().toLowerCase() === (currentUser || '').toLowerCase() ? (
                      <span className="text-[11px] text-slate-400 font-medium">Nombre actual</span>
                    ) : Object.keys(allProfiles).some(
                        (u) => u.trim().toLowerCase() === newUsernameInput.trim().toLowerCase()
                      ) ? (
                      <span className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> No disponible (Ya existe)
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ¡Disponible! ✓
                      </span>
                    )
                  )}
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
                    className={`flex-1 bg-slate-900 border rounded-xl px-3 py-2 text-xs text-white outline-none transition ${
                      newUsernameInput.trim().length >= 3 &&
                      newUsernameInput.trim().toLowerCase() !== (currentUser || '').toLowerCase() &&
                      Object.keys(allProfiles).some(
                        (u) => u.trim().toLowerCase() === newUsernameInput.trim().toLowerCase()
                      )
                        ? 'border-red-500/80'
                        : newUsernameInput.trim().length >= 3 &&
                          newUsernameInput.trim().toLowerCase() !== (currentUser || '').toLowerCase()
                        ? 'border-emerald-500/60'
                        : 'border-slate-700 focus:border-indigo-500'
                    }`}
                  />
                </div>

                {/* Validation message if taken */}
                {newUsernameInput.trim().length >= 3 &&
                  newUsernameInput.trim().toLowerCase() !== (currentUser || '').toLowerCase() &&
                  Object.keys(allProfiles).some(
                    (u) => u.trim().toLowerCase() === newUsernameInput.trim().toLowerCase()
                  ) && (
                    <p className="text-[11px] text-red-400 font-medium">
                      ❌ Nadie se puede poner un nombre de usuario existente. Por favor elige otro diferente.
                    </p>
                  )}

                {usernameStatusMsg && (
                  <p className="text-[11px] text-red-400 font-medium">{usernameStatusMsg}</p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={
                      isSubmittingUsername ||
                      newUsernameInput.trim().length < 3 ||
                      newUsernameInput.trim().toLowerCase() === (currentUser || '').toLowerCase() ||
                      Object.keys(allProfiles).some(
                        (u) =>
                          u.trim().toLowerCase() === newUsernameInput.trim().toLowerCase() &&
                          u.trim().toLowerCase() !== (currentUser || '').toLowerCase()
                      )
                    }
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
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 shadow ${
                      newUsernameInput.trim().length < 3 ||
                      newUsernameInput.trim().toLowerCase() === (currentUser || '').toLowerCase() ||
                      Object.keys(allProfiles).some(
                        (u) =>
                          u.trim().toLowerCase() === newUsernameInput.trim().toLowerCase() &&
                          u.trim().toLowerCase() !== (currentUser || '').toLowerCase()
                      )
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:opacity-90 active:scale-95 cursor-pointer'
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSubmittingUsername ? 'Guardando...' : 'Confirmar Nuevo Usuario'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingUsername(false);
                      setNewUsernameInput(userProfile.username);
                      setUsernameStatusMsg('');
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition active:scale-95 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nickname / Apodo Público:
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Descripción Personal:
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Escribe algo sobre tu talento, aficiones o música favorita..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white min-h-[80px]"
          />
        </div>

        {/* Privileged Customization for Artist, Admin or Premium Fan */}
        {isPrivilegedUser && (
          <div className="p-5 bg-slate-900 border border-indigo-500/30 rounded-3xl space-y-4">
            <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Opciones Especiales (Artista / Administrador / Premium Fan VIP)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Color Fondo de Perfil:
                </label>
                <input
                  type="color"
                  value={profileBgColor}
                  onChange={(e) => setProfileBgColor(e.target.value)}
                  className="w-full h-9 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Color Insignia Corona/Mic:
                </label>
                <input
                  type="color"
                  value={badgeAdminColor}
                  onChange={(e) => setBadgeAdminColor(e.target.value)}
                  className="w-full h-9 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Color Insignia Verificado:
                </label>
                <input
                  type="color"
                  value={badgeVerifiedColor}
                  onChange={(e) => setBadgeVerifiedColor(e.target.value)}
                  className="w-full h-9 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Animal Representativo:
              </label>
              <input
                type="text"
                value={animal}
                onChange={(e) => setAnimal(e.target.value)}
                placeholder="Ej: Zorro 🦊, Lobo 🐺, Conejo 🐰..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="allow-messages-check"
                checked={allowMessages}
                onChange={(e) => setAllowMessages(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-800"
              />
              <label
                htmlFor="allow-messages-check"
                className="text-xs text-slate-300 cursor-pointer"
              >
                Permitir mensajes de fans pagados a través de mi club
              </label>
            </div>
          </div>
        )}

        {/* FANDOM TAGS & CLUBS SECTION */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-pink-400" /> Fandom Tags e Insignias de Club
            </h4>
            <span className="text-[11px] text-slate-400">Personalización de presencia social</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Modo de Visualización de Fandom Tags:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFandomDisplayMode('beside_username')}
                className={`p-3 rounded-2xl border text-xs font-bold text-left transition cursor-pointer flex items-center gap-2.5 ${
                  fandomDisplayMode === 'beside_username'
                    ? 'border-indigo-500 bg-indigo-500/20 text-white shadow'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shrink-0" />
                <div>
                  <div className="font-bold">Opción B: Junto al Nombre</div>
                  <div className="text-[10px] text-slate-400 font-normal">Se muestra al lado de @{currentUser}</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFandomDisplayMode('description')}
                className={`p-3 rounded-2xl border text-xs font-bold text-left transition cursor-pointer flex items-center gap-2.5 ${
                  fandomDisplayMode === 'description'
                    ? 'border-indigo-500 bg-indigo-500/20 text-white shadow'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shrink-0" />
                <div>
                  <div className="font-bold">Opción A: En la Descripción</div>
                  <div className="text-[10px] text-slate-400 font-normal">Se lista en la biografía del perfil</div>
                </div>
              </button>
            </div>
          </div>

          {/* Joined Clubs / Tags selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Clubes a los que perteneces ({userJoinedClubs.length}):
            </label>
            {userJoinedClubs.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-950 rounded-xl">
                Aún no te has unido a ningún club de fans. Únete a clubes en la sección "Fans" para desbloquear sus fandom tags.
              </p>
            ) : (
              <div className="space-y-2">
                {userJoinedClubs.map((club) => {
                  const tagId = club.id;
                  const isChecked = displayedFandomTags.length === 0 || displayedFandomTags.includes(tagId);
                  return (
                    <label
                      key={club.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDisplayedFandomTags([...displayedFandomTags.filter((t) => t !== tagId), tagId]);
                            } else {
                              setDisplayedFandomTags(displayedFandomTags.filter((t) => t !== tagId));
                            }
                          }}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700 cursor-pointer"
                        />
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2 py-0.5 rounded-md text-[11px] font-black"
                            style={{ backgroundColor: `${club.tagColor || '#6366f1'}25`, color: club.tagColor || '#818cf8' }}
                          >
                            {club.tagIcon || '✨'} {club.fandomName}
                          </span>
                          <span className="text-xs text-slate-300 font-semibold">{club.name}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {isChecked ? 'Mostrando en perfil' : 'Oculto'}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 3.8 ESTADOS PERSONALIZADOS (CUSTOM STATUS) */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Estado Personalizado en Perfil
            </h3>
            {userStatus && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Activo
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                ¿Qué estás haciendo o sintiendo? (Texto breve)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={statusEmoji}
                  onChange={(e) => setStatusEmoji(e.target.value)}
                  placeholder="✨"
                  className="w-14 text-center p-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-base"
                  maxLength={4}
                />
                <input
                  type="text"
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  placeholder="Ej: En el estudio grabando nuevas melodías..."
                  className="flex-1 p-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  maxLength={100}
                />
              </div>
            </div>

            {/* Presets */}
            <div>
              <span className="text-[11px] font-medium text-slate-400 block mb-1.5">Estados rápidos predefinidos:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { emoji: '🎧', text: 'Escuchando los nuevos lanzamientos' },
                  { emoji: '🎤', text: 'Ensayando para el escenario' },
                  { emoji: '💡', text: 'Componiendo nuevas letras' },
                  { emoji: '✨', text: 'Conectado y disponible' },
                  { emoji: '🔥', text: 'Entusiasmado por el próximo comeback' },
                  { emoji: '☕', text: 'Descansando con una taza de té' }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setStatusEmoji(preset.emoji);
                      setStatusText(preset.text);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700 flex items-center gap-1 transition"
                  >
                    <span>{preset.emoji}</span>
                    <span className="truncate max-w-[140px]">{preset.text}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Duración del estado:
                </label>
                <select
                  value={statusDuration}
                  onChange={(e) => setStatusDuration(Number(e.target.value))}
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                >
                  <option value={0}>Sin límite (Permanente)</option>
                  <option value={2}>2 horas</option>
                  <option value={12}>12 horas</option>
                  <option value={24}>24 horas (1 día)</option>
                  <option value={72}>3 días</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Visibilidad:
                </label>
                <select
                  value={statusVisibility}
                  onChange={(e) => setStatusVisibility(e.target.value as any)}
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                >
                  <option value="public">Público (Todo el mundo)</option>
                  <option value="followers">Solo seguidores</option>
                  <option value="private">Privado (Solo yo)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={async () => {
                  if (!statusText.trim()) {
                    showToast('Escribe un texto para tu estado.');
                    return;
                  }
                  await updateUserStatus(statusText, statusEmoji, statusVisibility, statusDuration);
                }}
                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Actualizar Estado
              </button>

              {userStatus && (
                <button
                  type="button"
                  onClick={async () => {
                    await clearUserStatus();
                    setStatusText('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Borrar Estado
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs transition shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <Save className="w-4 h-4" /> Guardar Todos los Cambios
        </button>
      </form>
    </div>
  );
};
