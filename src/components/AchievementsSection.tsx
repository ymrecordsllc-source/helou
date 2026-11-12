import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  Lock,
  CheckCircle2,
  Gift,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  ShoppingBag,
  Flame,
  Music,
  Users,
  Building2,
  Mic,
  Star,
  Coins,
  ShieldAlert,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Achievement, AchievementCategory, UserBadgeItem } from '../types';

export const AchievementsSection: React.FC = () => {
  const {
    currentUser,
    userProfile,
    isPrivileged,
    addCoins,
    addGems,
    showToast,
    setUserProfile,
    primaryButtonColor,
    allProfiles,
    inventory,
    userPhotocards
  } = useApp();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'todos' | 'desbloqueados' | 'pendientes'>('todos');
  const [selectedBadgeToShowcase, setSelectedBadgeToShowcase] = useState<string[]>(
    userProfile.displayedBadges || []
  );

  // Admin Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<AchievementCategory>('actividad');
  const [formReqType, setFormReqType] = useState<any>('first_purchase');
  const [formTargetCount, setFormTargetCount] = useState(1);
  const [formRewardCoins, setFormRewardCoins] = useState(250);
  const [formRewardGems, setFormRewardGems] = useState(10);
  const [formBadgeName, setFormBadgeName] = useState('');
  const [formBadgeImage, setFormBadgeImage] = useState('');
  const [formIsSecret, setFormIsSecret] = useState(false);
  const [formIcon, setFormIcon] = useState('🏆');

  const isAdmin = userProfile.accountType === 'admin';

  // Load achievements from server
  const loadAchievements = async () => {
    try {
      const res = await fetch('/api/achievements');
      if (res.ok) {
        const data = await res.json();
        if (data.achievements) {
          setAchievements(data.achievements);
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const unlockedMap = userProfile.unlockedAchievements || {};

  // Auto-evaluation of requirements
  const checkRequirementMet = (ach: Achievement): boolean => {
    if (unlockedMap[ach.id]) return true;

    switch (ach.reqType) {
      case 'first_purchase':
        return inventory.length > 0;
      case 'photocards_count':
        return userPhotocards.length >= ach.targetCount;
      case 'tracks_listened':
        return true; // Auto-pass if active listening
      case 'audition_completed':
        return userProfile.accountType === 'trainee' || userProfile.accountType === 'artista';
      case 'profile_customized':
        return Boolean(userProfile.transparentFrame || userProfile.customTransparentFrame);
      default:
        return false;
    }
  };

  const handleClaimReward = async (ach: Achievement) => {
    if (!currentUser) return;

    try {
      const res = await fetch('/api/achievements/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser,
          achievementId: ach.id
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo reclamar el logro.');
      }

      showToast(`🎉 ¡Logro reclamado! +${ach.rewardCoins} Coins y +${ach.rewardGems} Gems.`);
      if (data.profile) {
        setUserProfile(data.profile);
      } else {
        setUserProfile((prev) => ({
          ...prev,
          coins: prev.coins + ach.rewardCoins,
          gems: prev.gems + ach.rewardGems,
          unlockedAchievements: {
            ...prev.unlockedAchievements,
            [ach.id]: { unlockedAt: new Date().toISOString(), claimed: true }
          }
        }));
      }
    } catch (err: any) {
      showToast(err.message || 'Error al reclamar logro.');
    }
  };

  const handleToggleDisplayedBadge = (badgeId: string) => {
    const current = new Set(userProfile.displayedBadges || []);
    if (current.has(badgeId)) {
      current.delete(badgeId);
    } else {
      if (current.size >= 5) {
        showToast('Máximo 5 insignias mostradas en tu perfil público.');
        return;
      }
      current.add(badgeId);
    }
    const updated = Array.from(current);
    setSelectedBadgeToShowcase(updated);
    setUserProfile((prev) => ({
      ...prev,
      displayedBadges: updated
    }));

    fetch('/api/user/customization', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: currentUser,
        displayedBadges: updated
      })
    }).catch(() => {});
  };

  const handleSaveAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        title: formTitle,
        description: formDescription,
        category: formCategory,
        reqType: formReqType,
        targetCount: Number(formTargetCount),
        rewardCoins: Number(formRewardCoins),
        rewardGems: Number(formRewardGems),
        icon: formIcon,
        isSecret: formIsSecret,
        adminUsername: currentUser,
        rewardBadge: formBadgeName
          ? {
              id: 'badge-' + Date.now(),
              name: formBadgeName,
              image:
                formBadgeImage ||
                'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=100&auto=format&fit=crop&q=80',
              rarity: 'epica'
            }
          : undefined
      };

      if (editingAchievement) {
        await fetch(`/api/achievements/${editingAchievement.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        showToast('Logro actualizado con éxito.');
      } else {
        await fetch('/api/achievements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        showToast('Nuevo logro creado con éxito.');
      }

      setIsCreateModalOpen(false);
      setEditingAchievement(null);
      loadAchievements();
    } catch {
      showToast('Error al guardar el logro.');
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    if (!confirm('¿Eliminar este logro oficialmente?')) return;
    try {
      await fetch(`/api/achievements/${id}`, { method: 'DELETE' });
      showToast('Logro eliminado.');
      loadAchievements();
    } catch {
      showToast('Error al eliminar logro.');
    }
  };

  const categories: { id: string; label: string; icon: any }[] = [
    { id: 'all', label: 'Todos', icon: Trophy },
    { id: 'actividad', label: 'Actividad', icon: Flame },
    { id: 'coleccion', label: 'Colección', icon: Award },
    { id: 'compras', label: 'Compras', icon: ShoppingBag },
    { id: 'musical', label: 'Musicales', icon: Music },
    { id: 'comunidad', label: 'Comunidad', icon: Users },
    { id: 'audiciones', label: 'Audiciones', icon: Mic },
    { id: 'survival', label: 'Survival', icon: Flame },
    { id: 'empresas', label: 'Empresas', icon: Building2 },
    { id: 'especiales', label: 'Especiales & Secretos', icon: Sparkles }
  ];

  // Filtering
  const filteredAchievements = achievements.filter((ach) => {
    const isUnlocked = Boolean(unlockedMap[ach.id]);
    if (activeCategory !== 'all' && ach.category !== activeCategory) return false;
    if (activeTab === 'desbloqueados' && !isUnlocked) return false;
    if (activeTab === 'pendientes' && isUnlocked) return false;
    return true;
  });

  const unlockedCount = Object.keys(unlockedMap).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <Trophy className="w-4 h-4 text-amber-400" /> Sistema Oficial de Logros & Recompensas
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Vitrina de Logros, Insignias & Honores
            </h1>
            <p className="text-sm text-slate-300">
              Desbloquea logros por tu actividad en audiciones, compras, colecciones, survivals y
              fandom. Equipa insignias públicas para lucir en tu perfil.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl px-5 py-3 text-center">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Desbloqueados</span>
              <span className="text-2xl font-black text-amber-400">
                {unlockedCount} / {achievements.length}
              </span>
            </div>

            {isAdmin && (
              <button
                onClick={() => {
                  setEditingAchievement(null);
                  setFormTitle('');
                  setFormDescription('');
                  setFormCategory('actividad');
                  setFormReqType('first_purchase');
                  setFormTargetCount(1);
                  setFormRewardCoins(250);
                  setFormRewardGems(10);
                  setFormBadgeName('');
                  setFormBadgeImage('');
                  setFormIsSecret(false);
                  setIsCreateModalOpen(true);
                }}
                className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Crear Logro Administrativo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Badges Public Showcase Selector */}
      {userProfile.customBadges && userProfile.customBadges.length > 0 && (
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-pink-400" /> Mis Insignias Desbloqueadas (Selecciona hasta 5 públicas)
              </h3>
              <p className="text-xs text-slate-400">
                Las insignias marcadas con borde brillante se mostrarán junto a tu foto de perfil.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-400">
              {selectedBadgeToShowcase.length} / 5 seleccionadas
            </span>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            {userProfile.customBadges.map((badge) => {
              const isSelected = selectedBadgeToShowcase.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  onClick={() => handleToggleDisplayedBadge(badge.id)}
                  className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-400 shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/40'
                      : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-500'
                  }`}
                >
                  <img
                    src={badge.image}
                    alt={badge.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">{badge.name}</span>
                    <span className="text-[10px] text-amber-300 font-semibold uppercase">
                      {badge.rarity || 'Insignia Oficial'}
                    </span>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs and Categories */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {(['todos', 'desbloqueados', 'pendientes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'todos' ? 'Todos los Logros' : tab === 'desbloqueados' ? 'Desbloqueados' : 'Por Desbloquear'}
            </button>
          ))}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-slate-700 text-white border border-indigo-500/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((ach) => {
          const isUnlocked = Boolean(unlockedMap[ach.id]);
          const canClaim = !isUnlocked && checkRequirementMet(ach);
          const isSecretMasked = ach.isSecret && !isUnlocked;

          return (
            <div
              key={ach.id}
              className={`relative rounded-3xl p-5 border flex flex-col justify-between transition-all duration-200 ${
                isUnlocked
                  ? 'bg-gradient-to-br from-slate-900 to-indigo-950/40 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                  : canClaim
                  ? 'bg-gradient-to-br from-slate-900 to-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-950/20 animate-pulse'
                  : 'bg-slate-900/70 border-slate-800 opacity-90'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                      {isSecretMasked ? '❓' : ach.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                        {ach.category}
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {isSecretMasked ? 'Logro Secreto Misterioso' : ach.title}
                      </h4>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingAchievement(ach);
                          setFormTitle(ach.title);
                          setFormDescription(ach.description);
                          setFormCategory(ach.category);
                          setFormReqType(ach.reqType);
                          setFormTargetCount(ach.targetCount);
                          setFormRewardCoins(ach.rewardCoins);
                          setFormRewardGems(ach.rewardGems);
                          setFormIsSecret(Boolean(ach.isSecret));
                          setFormIcon(ach.icon);
                          setIsCreateModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAchievement(ach.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-slate-800 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-300 mt-3 line-clamp-3">
                  {isSecretMasked
                    ? 'Este logro es un secreto de la agencia. Se revelará automáticamente cuando cumplas sus condiciones ocultas.'
                    : ach.description}
                </p>

                {/* Reward Preview */}
                {!isSecretMasked && (
                  <div className="mt-4 p-2.5 bg-slate-800/50 rounded-2xl flex items-center justify-between text-xs border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      {ach.rewardCoins > 0 && (
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Coins className="w-3.5 h-3.5" /> +{ach.rewardCoins}
                        </span>
                      )}
                      {ach.rewardGems > 0 && (
                        <span className="flex items-center gap-1 text-pink-400 font-bold">
                          💎 +{ach.rewardGems}
                        </span>
                      )}
                    </div>
                    {ach.rewardBadge && (
                      <span className="text-[10px] text-indigo-300 font-bold flex items-center gap-1">
                        <Award className="w-3 h-3 text-indigo-400" /> {ach.rewardBadge.name}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Status Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                {isUnlocked ? (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Desbloqueado y Reclamado
                  </div>
                ) : canClaim ? (
                  <button
                    onClick={() => handleClaimReward(ach)}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <Gift className="w-4 h-4" /> ¡Reclamar Recompensa!
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
                    <Lock className="w-3.5 h-3.5" /> Bloqueado (Progreso pendiente)
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Creation / Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSaveAchievement}
            className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-indigo-400" />{' '}
                {editingAchievement ? 'Editar Logro' : 'Crear Nuevo Logro'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Título del Logro</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
                placeholder="ej: Debut Ready"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Descripción</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                required
                rows={2}
                placeholder="Explica qué requisito debe cumplir el usuario..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Categoría</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                >
                  <option value="actividad">Actividad</option>
                  <option value="coleccion">Colección</option>
                  <option value="compras">Compras</option>
                  <option value="musical">Musicales</option>
                  <option value="comunidad">Comunidad</option>
                  <option value="audiciones">Audiciones</option>
                  <option value="survival">Survival</option>
                  <option value="empresas">Empresas</option>
                  <option value="especiales">Especiales & Secretos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Ícono (Emoji o Símbolo)</label>
                <input
                  type="text"
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                  placeholder="ej: 🏆, 🎤, 🎧, 💎"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Recompensa Coins</label>
                <input
                  type="number"
                  value={formRewardCoins}
                  onChange={(e) => setFormRewardCoins(Number(e.target.value))}
                  min={0}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Recompensa Gems</label>
                <input
                  type="number"
                  value={formRewardGems}
                  onChange={(e) => setFormRewardGems(Number(e.target.value))}
                  min={0}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>
            </div>

            {/* Insignia Reward */}
            <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-2">
              <label className="block text-xs font-bold text-slate-200">
                Insignia de Perfil Opcional (Badge)
              </label>
              <input
                type="text"
                value={formBadgeName}
                onChange={(e) => setFormBadgeName(e.target.value)}
                placeholder="Nombre de la insignia (ej: Photocard Master)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
              />
              <input
                type="url"
                value={formBadgeImage}
                onChange={(e) => setFormBadgeImage(e.target.value)}
                placeholder="URL de imagen para la insignia (opcional)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isSecretCheck"
                checked={formIsSecret}
                onChange={(e) => setFormIsSecret(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
              />
              <label htmlFor="isSecretCheck" className="text-xs text-slate-300 font-semibold cursor-pointer">
                Logro Secreto (Se oculta título y descripción hasta que sea desbloqueado)
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition"
              >
                Guardar Logro
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
