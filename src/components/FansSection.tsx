import React, { useState } from 'react';
import {
  Star,
  Users,
  Plus,
  Send,
  Lock,
  MessageCircle,
  Coins,
  ShieldAlert,
  Edit,
  Trash2,
  X,
  Palette,
  ShoppingBag,
  Sparkles,
  Gift,
  Check,
  RotateCcw,
  Upload,
  Eye,
  Flame,
  Heart,
  Crown,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarWithFrame } from './AvatarWithFrame';
import { UserBadges } from './UserBadges';
import { FileUploadButton } from './FileUploadButton';
import { Photocard3DViewer } from './Photocard3DViewer';
import { FanClub, FanClubExclusiveItem, Photocard, BiasRole } from '../types';

interface FansSectionProps {
  onOpenUserProfile: (username: string) => void;
  onOpenChatWithUser?: (username: string) => void;
}

export const FansSection: React.FC<FansSectionProps> = ({
  onOpenUserProfile,
  onOpenChatWithUser
}) => {
  const {
    fanClubs,
    currentUser,
    userProfile,
    isPrivileged,
    createFanClub,
    joinFanClub,
    leaveFanClub,
    emptyFanClubMembers,
    updateFanClub,
    addPrivateForumToClub,
    deletePrivateForumFromClub,
    claimClubExclusiveItem,
    buyClubExclusiveItem,
    addClubExclusiveItem,
    getProfileOf,
    sendChatMessage,
    addCoins,
    userBiases,
    setArtistBias,
    removeArtistBias,
    getBiasesForClub,
    themeGradient,
    showToast
  } = useApp();

  const [activeClub, setActiveClub] = useState<FanClub | null>(null);
  const [inspectingArtist, setInspectingArtist] = useState<string | null>(null);

  // Synchronized active club with real-time updates
  const currentActiveClub = activeClub ? (fanClubs.find((c) => c.id === activeClub.id) || activeClub) : null;

  // Create club modal
  const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);
  const [clubName, setClubName] = useState('');
  const [fandomName, setFandomName] = useState('');
  const [tagIcon, setTagIcon] = useState('');
  const [tagIconImg, setTagIconImg] = useState('');
  const [artistInput, setArtistInput] = useState('');
  const [associatedArtistsList, setAssociatedArtistsList] = useState<string[]>([]);
  const [messagePrice, setMessagePrice] = useState<number>(20);
  const [clubDesc, setClubDesc] = useState('');
  const [clubBanner, setClubBanner] = useState('');
  const [clubAvatar, setClubAvatar] = useState('');
  const [tagColor, setTagColor] = useState('#ec4899');

  // Club Exclusive Store: Add Item Modal
  const [isAddExclusiveItemOpen, setIsAddExclusiveItemOpen] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExDesc, setNewExDesc] = useState('');
  const [newExCategory, setNewExCategory] = useState<'photocard' | 'frame' | 'merch' | 'digital'>('photocard');
  const [newExImage, setNewExImage] = useState('');
  const [newExIsFree, setNewExIsFree] = useState(true);
  const [newExPrice, setNewExPrice] = useState(50);
  const [newExIsHolo, setNewExIsHolo] = useState(true);

  // 3D Photocard Full 360 Viewer
  const [viewing3DPhotocard, setViewing3DPhotocard] = useState<Photocard | null>(null);

  // Paid message modal
  const [isPaidMessageOpen, setIsPaidMessageOpen] = useState(false);
  const [paidMessageText, setPaidMessageText] = useState('');

  // Add private forum modal
  const [isPrivateForumOpen, setIsPrivateForumOpen] = useState(false);
  const [privateForumName, setPrivateForumName] = useState('');

  const canCreateClub = isPrivileged();

  // Artist press enter handler
  const handleArtistKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = artistInput.trim();
      if (val && !associatedArtistsList.includes(val)) {
        setAssociatedArtistsList([...associatedArtistsList, val]);
        setArtistInput('');
      }
    }
  };

  const handleCreateClubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalArtists = [...associatedArtistsList];
    if (artistInput.trim() && !finalArtists.includes(artistInput.trim())) {
      finalArtists.push(artistInput.trim());
    }

    if (finalArtists.length === 0) {
      showToast('Añade al menos un artista asociado (escribe el usuario y presiona Enter).');
      return;
    }

    createFanClub({
      name: clubName.trim(),
      fandomName: fandomName.trim(),
      artists: finalArtists,
      manager: currentUser || 'Manager',
      messagePrice: Number(messagePrice) || 20,
      tagIcon: tagIconImg || tagIcon || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&auto=format&fit=crop&q=80',
      tagIconImg: tagIconImg || undefined,
      tagColor,
      description: clubDesc.trim(),
      banner: clubBanner || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900&h=300&fit=crop',
      avatar: clubAvatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&h=120&fit=crop',
      exclusiveItems: []
    });

    setIsCreateClubOpen(false);
    setClubName('');
    setFandomName('');
    setTagIconImg('');
    setTagIcon('');
    setAssociatedArtistsList([]);
    setClubDesc('');
  };

  const handleCreateExclusiveItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentActiveClub) return;
    if (!newExName.trim()) {
      showToast('Ingresa el nombre del producto exclusivo.');
      return;
    }
    if (!newExImage) {
      showToast('Adjunta una imagen para el producto exclusivo.');
      return;
    }

    addClubExclusiveItem(currentActiveClub.id, {
      name: newExName.trim(),
      description: newExDesc.trim(),
      image: newExImage,
      category: newExCategory,
      isFreeForMembers: newExIsFree,
      priceCoins: newExIsFree ? 0 : Number(newExPrice) || 0,
      isHolographic: newExCategory === 'photocard' ? newExIsHolo : undefined
    });

    setIsAddExclusiveItemOpen(false);
    setNewExName('');
    setNewExDesc('');
    setNewExImage('');
    setNewExIsFree(true);
    setNewExPrice(50);
  };

  const handleSendPaidMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClub || !inspectingArtist || !paidMessageText.trim()) return;

    if (userProfile.coins < activeClub.messagePrice) {
      showToast(`Coins insuficientes. Este mensaje cuesta ${activeClub.messagePrice} Coins.`);
      return;
    }

    // Deduct coins
    addCoins(-activeClub.messagePrice);

    // Send fan chat message
    sendChatMessage(inspectingArtist, paidMessageText.trim(), true);

    setIsPaidMessageOpen(false);
    setPaidMessageText('');
    showToast(`¡Mensaje enviado a @${inspectingArtist}! Se descontaron ${activeClub.messagePrice} Coins.`);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-12 animate-fadeIn">
      {/* Top Header */}
      {!activeClub && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-400" /> Clubes de Fans Oficiales
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Apoya de cerca a tus artistas, únete a sus comunidades y porta la insignia de su fandom.
            </p>
          </div>

          {canCreateClub && (
            <button
              onClick={() => setIsCreateClubOpen(true)}
              style={{ color: '#000000' }}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-black font-bold text-xs rounded-2xl shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Crear Club de Fans
            </button>
          )}
        </div>
      )}

      {/* CLUBS GRID (When no club is active) */}
      {!activeClub && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fanClubs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 flex flex-col items-center justify-center gap-2 col-span-full">
              <Star className="w-10 h-10 text-slate-600" />
              <p className="text-base font-semibold text-slate-300">
                Aún no hay clubes de fans creados.
              </p>
              <p className="text-xs text-slate-500">
                Los artistas o administradores pueden crear un club oficial con su propia insignia.
              </p>
            </div>
          ) : (
            fanClubs.map((club) => {
              const isMember = club.members.includes(currentUser || '');
              return (
                <div
                  key={club.id}
                  onClick={() => setActiveClub(club)}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden shadow-xl cursor-pointer transition flex flex-col justify-between group"
                >
                  <div className="relative h-28 bg-slate-800">
                    <img src={club.banner} alt="" className="w-full h-full object-cover" />
                    <img
                      src={club.avatar}
                      alt=""
                      className="absolute -bottom-4 left-4 w-14 h-14 rounded-full border-4 border-slate-900 object-cover shadow-lg bg-slate-800"
                    />
                  </div>

                  <div className="p-5 pt-6 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">
                          {club.name}
                        </h3>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow flex items-center gap-1.5"
                          style={{ backgroundColor: club.tagColor || '#ec4899' }}
                        >
                          {club.tagIconImg || (club.tagIcon && (club.tagIcon.startsWith('data:') || club.tagIcon.startsWith('http'))) ? (
                            <img src={club.tagIconImg || club.tagIcon} alt="" className="w-3.5 h-3.5 rounded-full object-cover inline" />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-white/40 inline-block" />
                          )}
                          <span>{club.fandomName}</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                        {club.description}
                      </p>

                      <div className="mt-2 text-[11px] text-slate-500">
                        Artistas:{' '}
                        <strong className="text-slate-300">{club.artists.join(', ')}</strong>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        {club.members.length} miembros
                      </span>
                      {isMember && (
                        <span className="text-emerald-400 font-semibold text-[11px]">
                          ✓ Miembro
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ACTIVE CLUB DETAIL VIEW */}
      {currentActiveClub && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <button
            onClick={() => {
              setActiveClub(null);
              setInspectingArtist(null);
            }}
            className="self-start px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            ← Volver a Clubes de Fans
          </button>

          {/* Club Hero Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <img src={currentActiveClub.banner} alt="" className="w-full h-44 object-cover" />
            <div className="p-6 relative">
              <img
                src={currentActiveClub.avatar}
                alt=""
                className="w-20 h-20 rounded-full border-4 border-slate-900 object-cover absolute -top-10 left-6 shadow-xl bg-slate-800"
              />
              <div className="pt-8 sm:pt-0 sm:pl-28 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-extrabold text-white">{currentActiveClub.name}</h2>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow flex items-center gap-1.5"
                      style={{ backgroundColor: currentActiveClub.tagColor || '#ec4899' }}
                    >
                      {currentActiveClub.tagIconImg || (currentActiveClub.tagIcon && (currentActiveClub.tagIcon.startsWith('data:') || currentActiveClub.tagIcon.startsWith('http'))) ? (
                        <img src={currentActiveClub.tagIconImg || currentActiveClub.tagIcon} alt="" className="w-4 h-4 rounded-full object-cover inline" />
                      ) : (
                        <span className="w-3 h-3 rounded-full bg-white/40 inline-block" />
                      )}
                      <span>Fandom: {currentActiveClub.fandomName}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-xl mt-1.5 leading-relaxed">
                    {currentActiveClub.description}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-2 block">
                    <Users className="w-3 h-3 inline mr-1" /> {currentActiveClub.members.length} miembros oficiales
                  </span>
                </div>

                {currentActiveClub.members.includes(currentUser || '') ? (
                  <button
                    onClick={() => leaveFanClub(currentActiveClub.id)}
                    className="px-4 py-2 bg-slate-800 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl border border-red-500/30 transition cursor-pointer"
                  >
                    Salir del Club
                  </button>
                ) : (
                  <button
                    onClick={() => joinFanClub(currentActiveClub.id)}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-2xl shadow-lg transition active:scale-95 cursor-pointer"
                  >
                    Unirse al Club & Portar Fandom
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN DE BIASES DEL FANDOM (Hasta 3 artistas por grupo) */}
          {(() => {
            const clubBiases = getBiasesForClub(currentActiveClub.id);
            const myBias = clubBiases.find((b) => b.role === 'bias');
            const myWrecker = clubBiases.find((b) => b.role === 'bias_wrecker');
            const myLeastBias = clubBiases.find((b) => b.role === 'least_bias');

            return (
              <div className="bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-400" /> Tus Biases de {currentActiveClub.name}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {clubBiases.length}/3 asignados
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Personaliza tu alineación: Elige a tu <strong>Bias principal</strong>, al segundo como <strong>Bias Wrecker</strong> y al tercero como <strong>Least Bias</strong>. Se sincronizan con la tienda para filtrar sus productos oficiales.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Slot 1: Bias */}
                  <div className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    myBias
                      ? 'bg-amber-950/30 border-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/60 border-dashed border-slate-800'
                  }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      {myBias ? (
                        <img
                          src={myBias.artistAvatar}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 text-sm">
                          ⭐
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block">
                          1º Mi Bias
                        </span>
                        <p className="text-xs font-bold text-white truncate">
                          {myBias ? myBias.artistNickname : 'Sin asignar'}
                        </p>
                      </div>
                    </div>
                    {myBias && (
                      <button
                        type="button"
                        onClick={() => removeArtistBias(currentActiveClub.id, myBias.artistUsername)}
                        className="text-slate-400 hover:text-red-400 p-1 text-xs"
                        title="Quitar Bias"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Slot 2: Bias Wrecker */}
                  <div className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    myWrecker
                      ? 'bg-rose-950/30 border-rose-500/40 shadow-lg shadow-rose-500/10'
                      : 'bg-slate-950/60 border-dashed border-slate-800'
                  }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      {myWrecker ? (
                        <img
                          src={myWrecker.artistAvatar}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border-2 border-rose-400 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 text-sm">
                          🔥
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 block">
                          2º Bias Wrecker
                        </span>
                        <p className="text-xs font-bold text-white truncate">
                          {myWrecker ? myWrecker.artistNickname : 'Sin asignar'}
                        </p>
                      </div>
                    </div>
                    {myWrecker && (
                      <button
                        type="button"
                        onClick={() => removeArtistBias(currentActiveClub.id, myWrecker.artistUsername)}
                        className="text-slate-400 hover:text-red-400 p-1 text-xs"
                        title="Quitar Bias Wrecker"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Slot 3: Least Bias */}
                  <div className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    myLeastBias
                      ? 'bg-indigo-950/30 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-950/60 border-dashed border-slate-800'
                  }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      {myLeastBias ? (
                        <img
                          src={myLeastBias.artistAvatar}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border-2 border-indigo-400 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 text-sm">
                          💫
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 block">
                          3º Least Bias
                        </span>
                        <p className="text-xs font-bold text-white truncate">
                          {myLeastBias ? myLeastBias.artistNickname : 'Sin asignar'}
                        </p>
                      </div>
                    </div>
                    {myLeastBias && (
                      <button
                        type="button"
                        onClick={() => removeArtistBias(currentActiveClub.id, myLeastBias.artistUsername)}
                        className="text-slate-400 hover:text-red-400 p-1 text-xs"
                        title="Quitar Least Bias"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Associated Artists Section */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" /> Artistas Oficiales Asociados
              </h3>
              <span className="text-xs text-slate-400">
                Haz clic en un artista para gestionar tus biases
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {currentActiveClub.artists.map((artUsername) => {
                const artistProfile = getProfileOf(artUsername);
                const clubBiases = getBiasesForClub(currentActiveClub.id);
                const artistBias = clubBiases.find((b) => b.artistUsername === artUsername);
                const isSelected = inspectingArtist === artUsername;

                return (
                  <div
                    key={artUsername}
                    onClick={() => setInspectingArtist(artUsername)}
                    className={`p-4 rounded-2xl cursor-pointer transition flex items-center gap-3.5 shadow relative overflow-hidden ${
                      isSelected
                        ? 'bg-slate-800 border-2 border-indigo-500 shadow-indigo-500/20'
                        : artistBias
                        ? 'bg-slate-800/80 border border-purple-500/40 hover:border-purple-400'
                        : 'bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <AvatarWithFrame
                      src={artistProfile.avatar}
                      size="lg"
                      ringColor={artistProfile.ringColor}
                      transparentFrame={artistProfile.transparentFrame}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <h4 className="text-xs font-bold text-white truncate">
                          {artistProfile.nickname || artUsername}
                        </h4>
                        <UserBadges user={artistProfile} />
                      </div>
                      <span className="text-[11px] text-indigo-400 block mt-0.5 truncate">
                        @{artUsername}
                      </span>

                      {/* Visible Bias Badge on Card */}
                      {artistBias ? (
                        <div className="mt-1.5 flex items-center gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                              artistBias.role === 'bias'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : artistBias.role === 'bias_wrecker'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                            }`}
                          >
                            {artistBias.role === 'bias' && '⭐ Tu Bias'}
                            {artistBias.role === 'bias_wrecker' && '🔥 Bias Wrecker'}
                            {artistBias.role === 'least_bias' && '💫 Least Bias'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 block mt-1">
                          Toca para elegir como bias
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Amplified Artist Card if an artist is selected */}
          {inspectingArtist && (
            <div className="bg-slate-900 border border-indigo-500/50 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" /> Perfil & Elección de Bias
                </h4>
                <button
                  type="button"
                  onClick={() => setInspectingArtist(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {(() => {
                const prof = getProfileOf(inspectingArtist);
                const clubBiases = getBiasesForClub(currentActiveClub.id);
                const currentArtistBias = clubBiases.find((b) => b.artistUsername === inspectingArtist);
                const isClubFull = clubBiases.length >= 3;

                // Sequential slot recommendation based on user instruction:
                // "al hacer click en el perfil de un artista desde el club de fans aparece un boton para 'hacer mi bias', al segundo 'hacer mi bias wrecker', al tercero se puede añadir como 'least bias'"
                const nextSequentialRole: BiasRole =
                  clubBiases.length === 0
                    ? 'bias'
                    : clubBiases.length === 1
                    ? 'bias_wrecker'
                    : 'least_bias';

                return (
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <AvatarWithFrame
                      src={prof.avatar}
                      size="2xl"
                      ringColor={prof.ringColor}
                      transparentFrame={prof.transparentFrame}
                    />

                    <div className="flex-1 space-y-3 text-center md:text-left w-full">
                      <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                        <h3 className="text-xl font-bold text-white">
                          {prof.nickname || inspectingArtist}
                        </h3>
                        <UserBadges user={prof} />
                      </div>
                      <p className="text-xs text-indigo-400 font-medium">@{inspectingArtist}</p>
                      <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                        {prof.description}
                      </p>

                      {/* Current Bias Status Banner */}
                      {currentArtistBias ? (
                        <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-purple-900/40 border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {currentArtistBias.role === 'bias' ? '⭐' : currentArtistBias.role === 'bias_wrecker' ? '🔥' : '💫'}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-white">
                                {currentArtistBias.role === 'bias' && 'Este artista es actualmente tu BIAS principal'}
                                {currentArtistBias.role === 'bias_wrecker' && 'Este artista es actualmente tu BIAS WRECKER'}
                                {currentArtistBias.role === 'least_bias' && 'Este artista es actualmente tu LEAST BIAS'}
                              </p>
                              <span className="text-[11px] text-purple-300">
                                En el club: {currentActiveClub.name} (se reflejará en la tienda)
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeArtistBias(currentActiveClub.id, inspectingArtist)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 transition cursor-pointer"
                          >
                            Quitar de mis Biases
                          </button>
                        </div>
                      ) : (
                        /* Sequential button as requested + multi-role selector */
                        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                              <Heart className="w-3.5 h-3.5 text-rose-400" /> Asignar como Bias en este Grupo:
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">
                              {clubBiases.length}/3 asignados en {currentActiveClub.name}
                            </span>
                          </div>

                          {/* Primary sequential action button based on the number of biases currently set */}
                          {!isClubFull ? (
                            <button
                              type="button"
                              onClick={() => setArtistBias(currentActiveClub.id, inspectingArtist, nextSequentialRole)}
                              className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold shadow-lg flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer ${
                                nextSequentialRole === 'bias'
                                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950'
                                  : nextSequentialRole === 'bias_wrecker'
                                  ? 'bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-400 hover:to-rose-500 text-white'
                                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white'
                              }`}
                            >
                              {nextSequentialRole === 'bias' && '⭐ Hacer mi Bias'}
                              {nextSequentialRole === 'bias_wrecker' && '🔥 Hacer mi Bias Wrecker'}
                              {nextSequentialRole === 'least_bias' && '💫 Hacer mi Least Bias'}
                            </button>
                          ) : (
                            <p className="text-xs text-amber-300/90 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                              ⚠️ Ya tienes asignados los 3 puestos de bias en este grupo (Bias, Bias Wrecker y Least Bias). Puedes reasignar o reemplazar a uno de ellos haciendo clic en los botones inferiores.
                            </p>
                          )}

                          {/* Specific Role Buttons (Bias, Wrecker, Least Bias) */}
                          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800">
                            <button
                              type="button"
                              onClick={() => setArtistBias(currentActiveClub.id, inspectingArtist, 'bias')}
                              className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                            >
                              ⭐ Bias
                            </button>
                            <button
                              type="button"
                              onClick={() => setArtistBias(currentActiveClub.id, inspectingArtist, 'bias_wrecker')}
                              className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                            >
                              🔥 Wrecker
                            </button>
                            <button
                              type="button"
                              onClick={() => setArtistBias(currentActiveClub.id, inspectingArtist, 'least_bias')}
                              className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                            >
                              💫 Least Bias
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action to send paid message & profile */}
                      <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                        <button
                          type="button"
                          onClick={() => setIsPaidMessageOpen(true)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Coins className="w-3.5 h-3.5" /> Enviar Mensaje Exclusivo ({currentActiveClub.messagePrice} Coins)
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenUserProfile(inspectingArtist)}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
                        >
                          Ver Perfil Completo
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TIENDA EXCLUSIVA DEL CLUB DE FANS */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-pink-400" />
                  <h3 className="text-base font-extrabold text-white">
                    Tienda Exclusiva del Club: {currentActiveClub.fandomName}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Artículos especiales, marcos de perfil y photocards de bienvenida gratuitos y exclusivos para miembros oficiales.
                </p>
              </div>

              {currentActiveClub.members.includes(currentUser || '') && (currentActiveClub.manager === currentUser || isPrivileged()) && (
                <button
                  type="button"
                  onClick={() => setIsAddExclusiveItemOpen(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" /> + Añadir Artículo Exclusivo
                </button>
              )}
            </div>

            {!currentActiveClub.members.includes(currentUser || '') ? (
              <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-pink-500/20 text-center space-y-4 shadow-inner">
                <div className="w-14 h-14 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center mx-auto text-pink-400 shadow-md">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h4 className="text-base font-bold text-white">
                    Acceso Exclusivo para Miembros de {currentActiveClub.fandomName}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Al unirte a este club de fans desbloquearás de inmediato recompensas conmemorativas <span className="text-emerald-400 font-semibold">100% gratuitas</span> y acceso a merchandising oficial de edición limitada.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => joinFanClub(currentActiveClub.id)}
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition active:scale-95 cursor-pointer inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" /> Unirse al Club y Desbloquear Tienda
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {(!currentActiveClub.exclusiveItems || currentActiveClub.exclusiveItems.length === 0) ? (
                  <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                    No hay productos en la tienda exclusiva aún. ¡Pronto el club publicará artículos especiales!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentActiveClub.exclusiveItems.map((item) => {
                      const hasClaimed = item.claimedBy && item.claimedBy.includes(currentUser || '');
                      return (
                        <div
                          key={item.id}
                          className="bg-slate-950 border border-slate-800/90 hover:border-pink-500/40 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow transition-all duration-200 group"
                        >
                          <div className="space-y-3">
                            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                              />
                              <div className="absolute top-2 left-2 flex flex-col gap-1">
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/75 backdrop-blur-sm text-pink-300 border border-pink-500/30">
                                  {item.category === 'photocard' ? 'Photocard' : item.category === 'frame' ? 'Marco PNG' : item.category === 'merch' ? 'Merch' : 'Digital'}
                                </span>
                                {item.isHolographic && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 shadow">
                                    ✦ Holo
                                  </span>
                                )}
                              </div>

                              {item.isFreeForMembers && (
                                <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-slate-950 shadow-md">
                                  GRATIS
                                </span>
                              )}
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                                {item.name}
                              </h4>
                              <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                            {item.isFreeForMembers ? (
                              <div className="text-xs font-bold text-emerald-400">
                                Recompensa Gratuita
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-xs font-bold text-amber-300">
                                <Coins className="w-3.5 h-3.5 text-amber-400" />
                                <span>{item.priceCoins} Coins</span>
                              </div>
                            )}

                            <div className="flex items-center gap-1.5">
                              {item.category === 'photocard' && (
                                <button
                                  type="button"
                                  onClick={() => setViewing3DPhotocard({
                                    id: item.id,
                                    name: item.name,
                                    artist: currentActiveClub.artists[0] || currentActiveClub.name,
                                    image: item.image,
                                    backImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
                                    rarity: 'ultra_rara',
                                    albumName: currentActiveClub.name,
                                    isHolographic: item.isHolographic ?? true
                                  })}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition active:scale-95 cursor-pointer flex items-center gap-1"
                                  title="Ver en 3D 360°"
                                >
                                  <RotateCcw className="w-3 h-3" /> 360°
                                </button>
                              )}

                              {item.isFreeForMembers ? (
                                hasClaimed ? (
                                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" /> Ya Reclamado
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => claimClubExclusiveItem(currentActiveClub.id, item.id)}
                                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition active:scale-95 cursor-pointer flex items-center gap-1"
                                  >
                                    <Gift className="w-3.5 h-3.5" /> Reclamar Gratis
                                  </button>
                                )
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => buyClubExclusiveItem(currentActiveClub.id, item.id)}
                                  className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow transition active:scale-95 cursor-pointer"
                                >
                                  Comprar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Private Forums of the club */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-pink-400" /> Foros Privados del Club (Máx 2)
              </h3>
              {(currentActiveClub.manager === currentUser || isPrivileged()) && (
                <button
                  onClick={() => setIsPrivateForumOpen(true)}
                  disabled={currentActiveClub.privateForums.length >= 2}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                    currentActiveClub.privateForums.length >= 2
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-pink-600 hover:bg-pink-500 text-white shadow'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" /> Añadir Foro Privado
                </button>
              )}
            </div>

            {currentActiveClub.privateForums.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">
                No hay foros privados en este club.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {currentActiveClub.privateForums.map((pfName, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-800/60 border border-pink-500/20 rounded-xl flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-white flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-pink-400" /> {pfName}
                    </span>
                    {(currentActiveClub.manager === currentUser || isPrivileged()) && (
                      <button
                        onClick={() => deletePrivateForumFromClub(currentActiveClub.id, idx)}
                        className="text-red-400 hover:underline text-xs"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CREAR CLUB DE FANS */}
      {isCreateClubOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <form
            onSubmit={handleCreateClubSubmit}
            className="my-auto relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white max-h-[88vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" /> Crear Club de Fans Oficial
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateClubOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre del Club de Fans:
              </label>
              <input
                type="text"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                placeholder="Ej: Starlight Oficial Fanclub"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre del Fandom (insignia de miembros):
              </label>
              <input
                type="text"
                value={fandomName}
                onChange={(e) => setFandomName(e.target.value)}
                placeholder="Ej: Starlights, Echoes, Beats..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                required
              />
            </div>

            {/* Associated Artists */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Artistas asociados (escribe el usuario y presiona Enter):
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-800 border border-slate-700 rounded-xl items-center mb-1.5">
                {associatedArtistsList.map((art) => (
                  <span
                    key={art}
                    className="inline-flex items-center gap-1 bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-lg text-xs"
                  >
                    @{art}
                    <button
                      type="button"
                      onClick={() =>
                        setAssociatedArtistsList(associatedArtistsList.filter((x) => x !== art))
                      }
                      className="hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={artistInput}
                  onChange={(e) => setArtistInput(e.target.value)}
                  onKeyDown={handleArtistKeydown}
                  placeholder="Escribe usuario y pulsa Enter (ej: AlexBeats)..."
                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none min-w-[140px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Costo por mensaje (Coins):
                </label>
                <input
                  type="number"
                  min="0"
                  value={messagePrice}
                  onChange={(e) => setMessagePrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Color de Insignia de Fandom:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tagColor}
                    onChange={(e) => setTagColor(e.target.value)}
                    className="w-12 h-10 bg-slate-800 border border-slate-700 rounded-xl p-1 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={tagColor}
                    onChange={(e) => setTagColor(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Fandom Tag Insignia File Attachment (PNG / animated GIF) */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-200">
                  Insignia Oficial del Fandom (Adjuntar Imagen o GIF animado):
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Las insignias oficiales de fandom no son emojis; son imágenes o GIFs animados que se muestran en el perfil de cada fan.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <label className="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-2 active:scale-95">
                  <Upload className="w-4 h-4" /> Adjuntar Insignia (PNG / GIF)
                  <input
                    type="file"
                    accept="image/png,image/gif,image/jpeg,image/webp"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') {
                            setTagIconImg(reader.result);
                            setTagIcon(reader.result);
                          }
                        };
                        reader.readAsDataURL(f);
                      }
                    }}
                    className="hidden"
                  />
                </label>
                {tagIconImg && (
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Insignia cargada
                  </span>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400">Previsualización de insignia:</span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-black shadow-sm flex items-center gap-2"
                  style={{ backgroundColor: tagColor, color: '#ffffff' }}
                >
                  {tagIconImg ? (
                    <img
                      src={tagIconImg}
                      alt="Badge preview"
                      className="w-4 h-4 rounded-full object-cover ring-1 ring-white/50"
                    />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full bg-white/40 inline-block" />
                  )}
                  <span>{fandomName.trim() || 'FANDOM'}</span>
                </span>
              </div>
            </div>

            {/* Direct File Upload for Club Avatar & Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Foto / Icono del Club:</label>
                </div>
                <FileUploadButton
                  onUploadSuccess={(url) => setClubAvatar(url)}
                  label={clubAvatar ? "✓ Icono Cargado (Cambiar)" : "Subir Icono del Club"}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Banner del Club:</label>
                </div>
                <FileUploadButton
                  onUploadSuccess={(url) => setClubBanner(url)}
                  label={clubBanner ? "✓ Banner Cargado (Cambiar)" : "Subir Banner del Club"}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Descripción del Club:
              </label>
              <textarea
                value={clubDesc}
                onChange={(e) => setClubDesc(e.target.value)}
                placeholder="Descripción, lema y objetivos del club..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white min-h-[70px]"
                required
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateClubOpen(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{ background: themeGradient }}
                className="theme-btn flex-1 py-2 text-white rounded-xl text-xs font-bold transition shadow-lg cursor-pointer"
              >
                Crear Club de Fans
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: MENSAJE PAGADO A ARTISTA */}
      {isPaidMessageOpen && inspectingArtist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSendPaidMessage}
            className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2 text-amber-400">
                <Coins className="w-5 h-5" /> Mensaje Exclusivo para @{inspectingArtist}
              </h3>
              <button
                type="button"
                onClick={() => setIsPaidMessageOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Costo de envío prioritario:{' '}
              <strong className="text-amber-400">{activeClub?.messagePrice} Coins</strong> (Tu saldo:{' '}
              {userProfile.coins.toLocaleString()} Coins).
            </p>

            <textarea
              value={paidMessageText}
              onChange={(e) => setPaidMessageText(e.target.value)}
              placeholder="Escribe tu mensaje especial para el artista..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white min-h-[90px]"
              required
            />

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsPaidMessageOpen(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg"
              >
                Pagar y Enviar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: AÑADIR FORO PRIVADO */}
      {isPrivateForumOpen && activeClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!privateForumName.trim()) return;
              addPrivateForumToClub(activeClub.id, privateForumName.trim());
              setIsPrivateForumOpen(false);
              setPrivateForumName('');
            }}
            className="relative w-full max-w-sm bg-slate-900 border border-pink-500/40 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-pink-300">
                <Lock className="w-4 h-4" /> Nuevo Foro Privado
              </h3>
              <button
                type="button"
                onClick={() => setIsPrivateForumOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre del Foro Privado:
              </label>
              <input
                type="text"
                value={privateForumName}
                onChange={(e) => setPrivateForumName(e.target.value)}
                placeholder="Ej: Backstage & Ensayos VIP"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPrivateForumOpen(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition"
              >
                Crear Foro Privado
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
