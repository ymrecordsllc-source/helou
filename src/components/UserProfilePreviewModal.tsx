import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Flag,
  MessageCircle,
  Lock,
  ArrowLeftRight,
  Search,
  Sparkles,
  Award,
  Gift,
  ShieldBan,
  Heart,
  Coins,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarWithFrame } from './AvatarWithFrame';
import { UserBadges } from './UserBadges';
import { ReportModal } from './ReportModal';
import { InventoryItem, WishlistItem, CollaborationProject } from '../types';

interface UserProfilePreviewModalProps {
  onOpenChatWithUser?: (username: string) => void;
  onSearchProductInStore?: (query: string) => void;
}

export const UserProfilePreviewModal: React.FC<UserProfilePreviewModalProps> = ({
  onOpenChatWithUser,
  onSearchProductInStore
}) => {
  const {
    currentUser,
    userProfile,
    viewingProfileUser,
    setViewingProfileUser,
    fanClubs,
    friendRequestsSent,
    sendFriendRequest,
    inventory,
    products,
    submitTradeOffer,
    giftWishlistItem,
    reportUser,
    blockUser,
    blockedUsers,
    showToast,
    followUser,
    unfollowUser,
    isFollowingUser,
    getFollowInfo
  } = useApp();

  const [selectedMerchItem, setSelectedMerchItem] = useState<InventoryItem | null>(null);
  const [tradeOfferModalOpen, setTradeOfferModalOpen] = useState(false);
  const [offeredInventoryItemId, setOfferedInventoryItemId] = useState<string>('');
  const [tradeNote, setTradeNote] = useState('');

  // Follower system states
  const [followInfo, setFollowInfo] = useState<{
    followersCount: number;
    followingCount: number;
    followers: any[];
    following: any[];
  }>({ followersCount: 0, followingCount: 0, followers: [], following: [] });
  const [isFollowingState, setIsFollowingState] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState<'followers' | 'following' | null>(null);

  // Wishlist, gifting and collaborations states
  const [targetWishlist, setTargetWishlist] = useState<WishlistItem[]>([]);
  const [publicCollaborations, setPublicCollaborations] = useState<CollaborationProject[]>([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  const [selectedWishToGift, setSelectedWishToGift] = useState<WishlistItem | null>(null);
  const [isGiftingInProgress, setIsGiftingInProgress] = useState(false);

  // Reporting state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const isSelf = viewingProfileUser?.username === currentUser;
  const isBlocked = !!viewingProfileUser && blockedUsers?.includes(viewingProfileUser.username);

  // Fetch follow information
  useEffect(() => {
    if (!viewingProfileUser) return;
    getFollowInfo(viewingProfileUser.username).then((info) => {
      setFollowInfo(info);
    });
    setIsFollowingState(isFollowingUser(viewingProfileUser.username));
  }, [viewingProfileUser?.username, isFollowingUser]);

  // Fetch target user's wishlist and public collaborations
  useEffect(() => {
    if (!viewingProfileUser) return;
    if (!isSelf) {
      setIsLoadingWishlist(true);
      fetch(`/api/wishlist?username=${encodeURIComponent(viewingProfileUser.username)}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setTargetWishlist(Array.isArray(data) ? data : []))
        .catch(() => setTargetWishlist([]))
        .finally(() => setIsLoadingWishlist(false));
    }

    fetch('/api/collaborations')
      .then((res) => (res.ok ? res.json() : { collaborations: [] }))
      .then((data) => {
        const list = (data.collaborations || []).filter(
          (c: CollaborationProject) =>
            (c.creatorUsername === viewingProfileUser.username || c.targetUsernameOrCompany === viewingProfileUser.username) &&
            c.showcaseInProfile
        );
        setPublicCollaborations(list);
      })
      .catch(() => setPublicCollaborations([]));
  }, [viewingProfileUser?.username, isSelf]);

  if (!viewingProfileUser) return null;

  const hasSentRequest = !!friendRequestsSent[viewingProfileUser.username];

  const showcaseItems: InventoryItem[] = (viewingProfileUser.showcaseItemIds || [])
    .map((id) => {
      const inv = (inventory || []).find((i) => i.id === id);
      if (inv) return inv;
      const prod = (products || []).find((p) => p.id === id);
      if (prod) {
        return {
          id: prod.id,
          productId: prod.id,
          productName: prod.name,
          image: prod.images?.[0] || '',
          description: prod.description || '',
          pricePaid: prod.priceCoins || 0,
          purchasedAt: prod.createdAt || new Date().toISOString()
        } as InventoryItem;
      }
      return null;
    })
    .filter(Boolean) as InventoryItem[];

  const handleItemClick = (item: InventoryItem) => {
    setSelectedMerchItem(item);
  };

  const handleStartTrade = () => {
    if (!inventory.length) {
      showToast('No tienes ningún item en tu inventario para ofrecer en intercambio.');
      return;
    }
    setOfferedInventoryItemId(inventory[0].id);
    setTradeOfferModalOpen(true);
  };

  const handleConfirmTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMerchItem || !offeredInventoryItemId) return;
    submitTradeOffer(
      viewingProfileUser.username,
      offeredInventoryItemId,
      selectedMerchItem.id,
      tradeNote
    );
    setTradeOfferModalOpen(false);
    setSelectedMerchItem(null);
  };

  const handleSearchProduct = () => {
    if (!selectedMerchItem) return;
    const q = selectedMerchItem.productName;
    setSelectedMerchItem(null);
    setViewingProfileUser(null);
    if (onSearchProductInStore) {
      onSearchProductInStore(q);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg rounded-3xl border border-slate-700 shadow-2xl flex flex-col text-white max-h-[92vh] overflow-hidden"
        style={{
          backgroundColor: viewingProfileUser.profileBgColor || '#0f172a'
        }}
      >
        {/* Banner Header Image or Gradient */}
        <div className="relative w-full h-32 sm:h-36 bg-slate-950 overflow-hidden flex-shrink-0">
          {viewingProfileUser.banner ? (
            <img
              src={viewingProfileUser.banner}
              alt="Banner de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white/20 animate-pulse" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-black/30 pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => {
              setViewingProfileUser(null);
              setSelectedMerchItem(null);
            }}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition cursor-pointer z-10"
            title="Cerrar perfil"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Profile Content */}
        <div className="p-5 sm:p-6 pt-0 space-y-4 overflow-y-auto">
          {/* Profile Header with Avatar overlapping banner */}
          <div className="flex flex-col items-center text-center gap-2 -mt-12 z-10 relative">
            <AvatarWithFrame
              src={viewingProfileUser.avatar}
              size="2xl"
              frameStyle={viewingProfileUser.selectedFrameId || 'cyber_neon'}
              ringColor={viewingProfileUser.customFrameColor || viewingProfileUser.ringColor}
              frameCustomColor={viewingProfileUser.customFrameColor}
              transparentFrame={viewingProfileUser.customTransparentFrame || viewingProfileUser.transparentFrame}
              frameScale={viewingProfileUser.frameScale ?? 1.08}
              frameOffsetX={viewingProfileUser.frameOffsetX ?? 0}
              frameOffsetY={viewingProfileUser.frameOffsetY ?? 0}
            />

            <div>
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <h3 className="text-xl font-bold">{viewingProfileUser.nickname || viewingProfileUser.username}</h3>
                <UserBadges user={viewingProfileUser} fanClubs={fanClubs} />
                {viewingProfileUser.isVendorApproved && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Proveedor Oficial
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-300 mt-0.5">@{viewingProfileUser.username}</p>
            </div>

            {/* Fandom Badges & Tags */}
            {viewingProfileUser.fandom && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm">
                <Heart className="w-3.5 h-3.5 text-pink-400 fill-current" />
                <span>Fandom Oficial: {viewingProfileUser.fandom}</span>
              </div>
            )}
            {viewingProfileUser.displayedFandomTags && viewingProfileUser.displayedFandomTags.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
                {viewingProfileUser.displayedFandomTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Custom Status Pill */}
            {viewingProfileUser.userStatus && viewingProfileUser.userStatus.text && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-indigo-500/30 text-xs text-indigo-200 max-w-sm">
                <span className="text-sm">{viewingProfileUser.userStatus.emoji || '✨'}</span>
                <span className="truncate italic">"{viewingProfileUser.userStatus.text}"</span>
              </div>
            )}

          {/* Followers & Following Counters */}
          <div className="flex items-center justify-center gap-6 py-2 px-4 rounded-xl bg-slate-900/60 border border-slate-700/60 w-full max-w-xs">
            <button
              type="button"
              onClick={() => setShowFollowModal('followers')}
              className="flex flex-col items-center hover:opacity-80 transition cursor-pointer"
            >
              <span className="text-base font-black text-white">{followInfo.followersCount}</span>
              <span className="text-[11px] text-slate-400 font-medium">Seguidores</span>
            </button>
            <div className="w-px h-7 bg-slate-700" />
            <button
              type="button"
              onClick={() => setShowFollowModal('following')}
              className="flex flex-col items-center hover:opacity-80 transition cursor-pointer"
            >
              <span className="text-base font-black text-white">{followInfo.followingCount}</span>
              <span className="text-[11px] text-slate-400 font-medium">Siguiendo</span>
            </button>
          </div>

          <p className="text-sm text-slate-300 max-w-sm px-2">
            {viewingProfileUser.description || 'Sin descripción personal todavía.'}
          </p>

          {/* Artist details if applicable */}
          {(viewingProfileUser.accountType === 'artista' || viewingProfileUser.accountType === 'admin') && (
            <div className="flex items-center gap-3 text-xs bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-700">
              {viewingProfileUser.animal && (
                <span>🐾 Animal: <strong>{viewingProfileUser.animal}</strong></span>
              )}
              <span className="flex items-center gap-1">
                🎨 Aura:
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: viewingProfileUser.customFrameColor || viewingProfileUser.ringColor }}
                />
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {!isSelf && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={async () => {
                setIsFollowLoading(true);
                if (isFollowingState) {
                  const ok = await unfollowUser(viewingProfileUser.username);
                  if (ok) {
                    setIsFollowingState(false);
                    setFollowInfo((prev) => ({ ...prev, followersCount: Math.max(0, prev.followersCount - 1) }));
                  }
                } else {
                  const ok = await followUser(viewingProfileUser.username);
                  if (ok) {
                    setIsFollowingState(true);
                    setFollowInfo((prev) => ({ ...prev, followersCount: prev.followersCount + 1 }));
                  }
                }
                setIsFollowLoading(false);
              }}
              disabled={isFollowLoading}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition cursor-pointer shadow-lg active:scale-95 ${
                isFollowingState
                  ? 'bg-slate-800 text-indigo-300 border border-indigo-500/40 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/40'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="truncate">{isFollowingState ? 'Siguiendo' : 'Seguir'}</span>
            </button>

            <button
              onClick={() => {
                if (onOpenChatWithUser) {
                  onOpenChatWithUser(viewingProfileUser.username);
                  setViewingProfileUser(null);
                }
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Mensaje</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold border border-red-500/40 text-red-400 hover:bg-red-500/10 transition cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Reportar</span>
            </button>

            <button
              onClick={async () => {
                const nextAction = isBlocked ? 'unblock' : 'block';
                await blockUser(viewingProfileUser.username, nextAction);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isBlocked
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 hover:bg-amber-600/50'
                  : 'border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShieldBan className="w-3.5 h-3.5" />
              <span className="truncate">{isBlocked ? 'Desbloquear' : 'Bloquear'}</span>
            </button>
          </div>
        )}

        {/* Warning if blocked */}
        {isBlocked && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Has bloqueado a este usuario. Las interacciones y mensajes mutuos se encuentran restringidos.</span>
          </div>
        )}

        {/* Followers / Following List Modal */}
        {showFollowModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl flex flex-col gap-4 text-white max-h-[80vh]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold flex items-center gap-2 text-indigo-300">
                  <UserPlus className="w-4 h-4" />
                  {showFollowModal === 'followers' ? 'Seguidores de @' + viewingProfileUser.username : 'Cuentas que sigue @' + viewingProfileUser.username}
                </h4>
                <button
                  onClick={() => setShowFollowModal(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-96 pr-1">
                {(showFollowModal === 'followers' ? followInfo.followers : followInfo.following).length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">
                    {showFollowModal === 'followers' ? 'Aún no tiene seguidores.' : 'No sigue a ninguna cuenta todavía.'}
                  </p>
                ) : (
                  (showFollowModal === 'followers' ? followInfo.followers : followInfo.following).map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/30 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'}
                          alt={item.username}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700"
                        />
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-white line-clamp-1">{item.profile?.nickname || item.username}</span>
                            {item.profile?.isVerified && (
                              <CheckCircle2 className="w-3 h-3 text-sky-400" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block">@{item.username}</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-500">
                        {item.followedAt ? new Date(item.followedAt).toLocaleDateString() : 'Reciente'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* DIGITAL TROPHIES & CERTIFICATES */}
        {((viewingProfileUser.digitalTrophies && viewingProfileUser.digitalTrophies.length > 0) ||
          (viewingProfileUser.winnerCertificates && viewingProfileUser.winnerCertificates.length > 0)) && (
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4 space-y-3">
            <h4 className="text-sm font-bold flex items-center gap-2 text-amber-400">
              <Award className="w-4 h-4 text-amber-400" />
              Premios y Galardones Digitales Oficiales
            </h4>

            {/* Trophies */}
            {viewingProfileUser.digitalTrophies && viewingProfileUser.digitalTrophies.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Trofeos Digitales Otorgados:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {viewingProfileUser.digitalTrophies.map((trophy) => (
                    <div
                      key={trophy.id}
                      className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5"
                    >
                      <span className="text-2xl">{trophy.icon || '🏆'}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-amber-300 truncate">{trophy.trophyName}</div>
                        <div className="text-[10px] text-slate-400 truncate">{trophy.categoryName}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificates */}
            {viewingProfileUser.winnerCertificates && viewingProfileUser.winnerCertificates.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Certificados Oficiales con Firma CEO:
                </span>
                <div className="space-y-2">
                  {viewingProfileUser.winnerCertificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-3 rounded-xl bg-slate-950 border border-indigo-500/30 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-indigo-300">{cert.awardTitle}</div>
                        <div className="text-[11px] text-slate-400">{cert.categoryName}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Certificado Auténtico
                        </span>
                        <div className="text-[10px] text-slate-500 italic">Firma: {cert.signatureCeo}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PUBLIC BADGES & HONORS (MÓDULO 14) */}
        {viewingProfileUser.customBadges && viewingProfileUser.customBadges.length > 0 && (
          <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold flex items-center gap-2 text-indigo-300">
                <Award className="w-4 h-4 text-pink-400" />
                Insignias de Honor Desbloqueadas
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">Logros YM-ki</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {viewingProfileUser.customBadges
                .filter(b => !viewingProfileUser.displayedBadges || viewingProfileUser.displayedBadges.length === 0 || viewingProfileUser.displayedBadges.includes(b.id))
                .slice(0, 5)
                .map((badge) => (
                  <div
                    key={badge.id}
                    title={`${badge.name} (${badge.rarity || 'Oficial'})`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 shadow hover:border-indigo-400 transition"
                  >
                    <img
                      src={badge.image}
                      alt={badge.name}
                      className="w-6 h-6 rounded-lg object-cover ring-1 ring-white/20"
                    />
                    <div className="text-left">
                      <div className="text-xs font-bold text-white leading-tight">{badge.name}</div>
                      <div className="text-[9px] text-pink-400 uppercase font-semibold">{badge.rarity || 'Logro'}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* SHOWCASED COLLABORATIONS (MÓDULO 18) */}
        {publicCollaborations.length > 0 && (
          <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-4 space-y-2.5">
            <h4 className="text-sm font-bold flex items-center gap-2 text-emerald-400">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Proyectos y Colaboraciones Destacadas ({publicCollaborations.length})
            </h4>
            <div className="space-y-2">
              {publicCollaborations.map((collab) => (
                <div
                  key={collab.id}
                  className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <h5 className="text-xs font-bold text-white truncate">{collab.projectName}</h5>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{collab.description}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                    {collab.status === 'finalizada' ? 'Completado' : 'En Desarrollo'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PEER WISHLIST & GIFTING */}
        {!isSelf && targetWishlist.length > 0 && (
          <div className="bg-slate-900/80 border border-pink-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold flex items-center gap-2 text-pink-400">
                <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                Lista de Deseos ({targetWishlist.length})
              </h4>
              <span className="text-[11px] text-slate-400">Puedes regalarle un artículo</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {targetWishlist.map((wish) => (
                <div
                  key={wish.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={wish.image}
                      alt={wish.productName}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-900"
                    />
                    <div>
                      <h5 className="text-xs font-bold text-white line-clamp-1">{wish.productName}</h5>
                      <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                        <Coins className="w-3 h-3" /> {wish.priceCoins.toLocaleString()} Coins
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      if (userProfile.coins < wish.priceCoins) {
                        showToast(`Saldo insuficiente. Tienes ${userProfile.coins} Coins y el regalo cuesta ${wish.priceCoins}.`);
                        return;
                      }
                      setIsGiftingInProgress(true);
                      const ok = await giftWishlistItem(viewingProfileUser.username, wish.id);
                      setIsGiftingInProgress(false);
                      if (ok) {
                        setTargetWishlist((prev) => prev.filter((w) => w.id !== wish.id));
                      }
                    }}
                    disabled={isGiftingInProgress}
                    className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    Regalar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Merch Showcase (Vitrina de Merch) */}
        <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold flex items-center gap-2 text-amber-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Vitrina de Merch
              <span className="text-xs text-slate-400 font-normal">
                ({showcaseItems.length}/5 destacados)
              </span>
            </h4>
            {viewingProfileUser.isMerchPrivate && (
              <span className="text-[11px] text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full">
                <Lock className="w-3 h-3" /> Privada
              </span>
            )}
          </div>

          {viewingProfileUser.isMerchPrivate && !isSelf ? (
            <div className="py-6 flex flex-col items-center justify-center text-center text-slate-400 gap-2">
              <Lock className="w-8 h-8 text-slate-500" />
              <p className="text-sm">Esta vitrina de merch es privada por elección del usuario.</p>
            </div>
          ) : showcaseItems.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-sm">
              {isSelf
                ? 'Aún no has destacado productos. Ve a "Mi Vitrina de Merch" en el menú para seleccionarlos.'
                : 'Este usuario no tiene items exhibidos en su vitrina.'}
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {showcaseItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-slate-700 bg-white cursor-pointer hover:border-amber-400 hover:shadow-lg transition flex items-center justify-center p-1"
                  title={item.productName}
                >
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-center font-medium p-1">
                    Ver opciones
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal for clicked item inside Showcase */}
        {selectedMerchItem && !tradeOfferModalOpen && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <h5 className="text-xs font-bold text-slate-300">
                Opciones de Merch: <span className="text-white">{selectedMerchItem.productName}</span>
              </h5>
              <button
                onClick={() => setSelectedMerchItem(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cerrar
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white rounded-lg p-1 flex-shrink-0 flex items-center justify-center">
                <img
                  src={selectedMerchItem.image}
                  alt={selectedMerchItem.productName}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xs text-slate-300 line-clamp-2">
                {selectedMerchItem.description}
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              {!isSelf && (
                <button
                  onClick={handleStartTrade}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  Solicitar trade
                </button>
              )}

              <button
                onClick={handleSearchProduct}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition"
              >
                <Search className="w-3.5 h-3.5" />
                Buscar el producto
              </button>
            </div>
          </div>
        )}

        {/* Modal for Trade Offer */}
        {tradeOfferModalOpen && selectedMerchItem && (
          <form
            onSubmit={handleConfirmTrade}
            className="bg-slate-800 border border-indigo-500/40 rounded-xl p-4 flex flex-col gap-3 animate-fadeIn"
          >
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <h5 className="text-sm font-bold text-indigo-300 flex items-center gap-1.5">
                <ArrowLeftRight className="w-4 h-4" /> Proponer Trade con @{viewingProfileUser.username}
              </h5>
              <button
                type="button"
                onClick={() => setTradeOfferModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Solicitas:{' '}
              <strong className="text-white">{selectedMerchItem.productName}</strong>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Selecciona qué item de tu inventario ofreces a cambio:
              </label>
              <select
                value={offeredInventoryItemId}
                onChange={(e) => setOfferedInventoryItemId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                required
              >
                {inventory.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.productName} (Valor aprox. {inv.pricePaid} Coins)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Mensaje o nota para la propuesta (opcional):
              </label>
              <input
                type="text"
                value={tradeNote}
                onChange={(e) => setTradeNote(e.target.value)}
                placeholder="Ej: Te ofrezco este photocard exclusivo que buscabas..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setTradeOfferModalOpen(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg"
              >
                Enviar Propuesta
              </button>
            </div>
          </form>
        )}

        {/* UNIVERSAL REPORT MODAL (MÓDULO 17) */}
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          targetUsername={viewingProfileUser.username}
          itemType="perfil"
          itemId={viewingProfileUser.username}
          itemTitle={`Perfil de @${viewingProfileUser.username}`}
        />
        </div>
      </div>
    </div>
  );
};
