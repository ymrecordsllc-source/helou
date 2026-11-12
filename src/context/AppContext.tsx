import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Forum,
  Post,
  FanClub,
  FanClubExclusiveItem,
  ChatMessage,
  Product,
  InventoryItem,
  TradeOffer,
  AuditionSubmission,
  CeoUpgradeRequest,
  AccountType,
  CeoInfo,
  IdCardData,
  ChatGroup,
  ChatSubgroupType,
  NotificationItem,
  CurrencyType,
  Magazine,
  Release,
  AwardEvent,
  AwardCategory,
  Photocard,
  AlbumTrack,
  UserAlbum,
  UserPhotocard,
  SurvivalShow,
  SurvivalParticipant,
  AuditionPassCode,
  PartnerCompany,
  ChartEntry,
  ProductReview,
  ButtonThemeConfig,
  AdminDelegations,
  AdminAuditEntry,
  SurvivalStage,
  SurvivalRound,
  SurvivalApplication,
  SurvivalSubmission,
  SurvivalJudge,
  SurvivalTeam,
  SurvivalEpisode,
  Mission,
  EconomyLedgerEntry,
  WishlistItem,
  ShowcaseItem,
  MissionRequirementType,
  DigitalTrophy,
  WinnerCertificate,
  BiasRole,
  UserBias,
  ReactionType,
  NestedComment,
  CommunityPoll,
  UserStatus,
  FollowRelation,
  SavedCollection,
  SavedPostItem,
  VendorApplication,
  VendorStatus,
  ProductVariant,
  InventoryMovement,
  DiscountCoupon,
  ProductPurchaseRecord
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_CEOS } from '../data/ceos';
import {
  INITIAL_PRODUCTS,
  INITIAL_MAGAZINES,
  INITIAL_RELEASES,
  INITIAL_AWARDS,
  INITIAL_PHOTOCARDS_ECLIPSE,
  INITIAL_SURVIVALS
} from '../data/initialData';
import { computeThemeColors, applyThemeToDocument } from '../utils/themeColors';

const DEFAULT_AVATAR = '/default_avatar.jpg';
const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900&h=300&fit=crop';
const DEFAULT_FORUM_AVATAR = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&h=120&fit=crop';

function load<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function save(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error for key:', key, e);
  }
}

export const getStoredAuthToken = (): string | null => {
  try {
    return localStorage.getItem('ym_auth_token');
  } catch {
    return null;
  }
};

export const apiFetch = async (url: string, init?: RequestInit): Promise<Response> => {
  try {
    const token = getStoredAuthToken();
    const headers = new Headers(init?.headers || {});
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return await fetch(url, { ...init, headers });
  } catch (err) {
    console.warn('API fetch warning:', err);
    return new Response(JSON.stringify({ error: 'Error de conexión con el servidor.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export function generateMatricula(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `YM-${year}-${rand}`;
}

export function defaultProfile(username: string): UserProfile {
  const isFounder = username.toLowerCase().includes('founder');
  const isCoCeo = username.toLowerCase().includes('co-ceo') || username.toLowerCase().includes('coceo');
  const isAdmin = isFounder || isCoCeo || username === 'Administración' || username === 'admin';
  const isDesigner = username.toLowerCase().includes('diseñador') || username.toLowerCase().includes('designer');

  // Known artist presets for club biases
  const knownArtists: Record<string, { nickname: string; avatar: string; animal?: string; ringColor?: string }> = {
    'Hana Star': {
      nickname: 'Hana Star 🌸',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
      animal: 'Cisne 🦢',
      ringColor: '#ec4899'
    },
    'Minji Dream': {
      nickname: 'Minji Dream 💫',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces',
      animal: 'Gatito 🐱',
      ringColor: '#a855f7'
    },
    'Ren Beat': {
      nickname: 'Ren Beat ⚡',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=faces',
      animal: 'Pantera 🐆',
      ringColor: '#06b6d4'
    },
    'Kai Voltage': {
      nickname: 'Kai Voltage 🔥',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
      animal: 'Tigre 🐯',
      ringColor: '#f97316'
    },
    'Sora Dance': {
      nickname: 'Sora Dance 🩰',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
      animal: 'Mariposa 🦋',
      ringColor: '#8b5cf6'
    },
    'Jin Vocal': {
      nickname: 'Jin Vocal 🎤',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces',
      animal: 'Halcón 🦅',
      ringColor: '#3b82f6'
    }
  };

  const artistPreset = knownArtists[username];

  return {
    username,
    nickname: artistPreset?.nickname || username,
    avatar: artistPreset?.avatar || DEFAULT_AVATAR,
    banner: DEFAULT_BANNER,
    description: isFounder
      ? 'CEO Fundador de YM-ki Records.'
      : artistPreset
      ? `Artista oficial de YM-ki Records. Voz, talento y pasión por la música.`
      : 'Miembro de la comunidad artística YM-ki Web.',
    ringColor: artistPreset?.ringColor || '#6366f1',
    transparentFrame: null,
    accountType: isAdmin ? 'admin' : isDesigner ? 'diseñador' : artistPreset ? 'artista' : 'fan',
    isFounder,
    isCoCeo,
    traineeRank: 'trainee c',
    profileBgColor: isFounder ? '#0f172a' : '#1e293b',
    badgeAdminColor: '#ec4899',
    badgeVerifiedColor: '#38bdf8',
    animal: artistPreset?.animal || 'Zorro 🦊',
    allowMessages: true,
    coins: isAdmin ? 999999 : 3500,
    gems: isAdmin ? 9999 : 50,
    dob: '2004-06-15',
    isMerchPrivate: false,
    showcaseItemIds: [],
    completedMissions: [],
    fandomDisplayMode: 'beside_username',
    displayedFandomTags: [],
    ownedFrames: isFounder ? ['frame-cyber-neon', 'frame-gold-star', 'frame-prism-diamond'] : [],
    selectedFrameId: isFounder ? 'frame-gold-star' : null,
    customFrameColor: isFounder ? '#eab308' : undefined,
    idCard: {
      pseudonym: username,
      age: 20,
      gender: 'No especificado',
      matricula: generateMatricula(),
      faceclaim: DEFAULT_AVATAR,
      cardColor: isFounder ? '#000000' : '#4f46e5',
      stripeColor: '#ec4899',
      specialties: ['vocal', 'all_rounder'],
      specialty: 'all_rounder',
      rank: isAdmin ? 'ceo' : (artistPreset ? 'artista' : 'trainee c'),
      backPhrase: 'YM-ki Entertainment · Official ID Pass',
      layoutStyle: 'horizontal'
    }
  };
}

interface AppContextType {
  currentUser: string | null;
  userProfile: UserProfile;
  allProfiles: Record<string, UserProfile>;
  themeMode: 'dark' | 'light';
  setThemeMode: (mode: 'dark' | 'light') => void;
  primaryButtonColor: string;
  setPrimaryButtonColor: (color: string) => void;
  themeGradient: string;
  themeBannerGradient: string;
  themeDarkColor: string;
  ceosList: CeoInfo[];
  forums: Forum[];
  posts: Post[];
  fanClubs: FanClub[];
  chats: Record<string, ChatMessage[]>;
  chatGroups: ChatGroup[];
  products: Product[];
  inventory: InventoryItem[];
  tradeOffers: TradeOffer[];
  auditions: AuditionSubmission[];
  notifications: NotificationItem[];
  ceoRequests: CeoUpgradeRequest[];
  firstRegisteredUser: string;
  friendRequestsSent: Record<string, boolean>;
  viewingProfileUser: UserProfile | null;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  getProfileOf: (username: string) => UserProfile;
  isPrivileged: (username?: string) => boolean;
  isPrimaryCeo: () => boolean;
  isDesigner: (username?: string) => boolean;
  canCreateMagazine: (username?: string) => boolean;
  canUploadGif: (username?: string) => boolean;
  authToken: string | null;
  login: (username: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    username: string,
    nickname: string,
    dob: string,
    email?: string,
    password?: string,
    acceptedTerms?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  changeUsername: (newUsername: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  logoutAll: () => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => void;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  removeFrame: () => void;
  updateIdCard: (data: Partial<IdCardData>) => void;
  updateCeoProfile: (ceoId: string, patch: Partial<CeoInfo>) => void;
  upgradeToPremiumFan: () => boolean;
  requestCeoUpgrade: (ceoId: string, requestedRole: 'artista' | 'admin' | 'diseñador', reason: string) => void;
  approveCeoRequest: (requestId: string) => void;
  rejectCeoRequest: (requestId: string) => void;
  addCoins: (coins: number, gems?: number) => void;
  addGems: (gems: number) => void;
  transferCoins: (targetUsername: string, amount: number) => boolean;
  claimDailyCoins: () => boolean;
  completeMission: (missionId: string, rewardCoins: number) => void;
  sendFriendRequest: (targetUsername: string) => boolean;
  setViewingProfileUser: (user: UserProfile | null) => void;
  openProfileByUsername: (username: string) => void;
  createForum: (data: Partial<Forum>) => void;
  createFandomForum: (fanClubId: string, name: string, description: string) => boolean;
  editForum: (forumId: string, data: Partial<Forum>) => void;
  deleteForum: (forumId: string) => void;
  joinForum: (forumId: string) => void;
  leaveForum: (forumId: string) => void;
  createPost: (data: Omit<Post, 'id' | 'timestamp' | 'likes' | 'dislikes' | 'comments'>) => void;
  reactPost: (postId: number, type: 'like' | 'dislike') => void;
  votePoll: (postId: number, option: 'option1' | 'option2') => void;
  addComment: (postId: number, text: string) => void;
  createFanClub: (data: Omit<FanClub, 'id' | 'members' | 'privateForums'>) => void;
  joinFanClub: (clubId: string) => void;
  leaveFanClub: (clubId: string) => void;
  emptyFanClubMembers: (clubId: string) => void;
  updateFanClub: (clubId: string, patch: Partial<FanClub>) => void;
  addPrivateForumToClub: (clubId: string, forumName: string) => boolean;
  deletePrivateForumFromClub: (clubId: string, index: number) => void;
  claimClubExclusiveItem: (clubId: string, itemId: string) => boolean;
  buyClubExclusiveItem: (clubId: string, itemId: string) => boolean;
  addClubExclusiveItem: (clubId: string, item: Omit<FanClubExclusiveItem, 'id' | 'clubId' | 'claimedBy'>) => void;
  // Biases (Clubes de Fans & Tienda)
  userBiases: UserBias[];
  setArtistBias: (clubId: string, artistUsername: string, role: BiasRole) => { success: boolean; message: string };
  removeArtistBias: (clubId: string, artistUsername: string) => void;
  getBiasesForClub: (clubId: string) => UserBias[];
  sendChatMessage: (toUsername: string, text: string, isFanMessage?: boolean, gift?: { name: string; icon: string; coinValue: number }, attachmentUrl?: string, replyToId?: string, replyToText?: string) => void;
  editChatMessage: (messageId: string, newText: string) => Promise<boolean>;
  deleteChatMessage: (messageId: string) => Promise<boolean>;
  toggleMuteConversation: (username: string) => void;
  // Group chats
  createChatGroup: (name: string, duration: 'temporary' | 'permanent', isAdvanced: boolean, icon?: string) => void;
  addCategoryToGroup: (groupId: string, categoryName: string) => void;
  addSubgroupToCategory: (groupId: string, categoryId: string, name: string, type: ChatSubgroupType, icon?: string) => void;
  sendGroupMessage: (groupId: string, text: string, subgroupId?: string, attachment?: string) => void;
  setSubgroupPinnedWeeklyMessage: (groupId: string, subgroupId: string, message: string) => void;
  submitTraineeTask: (groupId: string, subgroupId: string, taskTitle: string, attachmentUrl: string) => void;
  gradeTraineeTask: (groupId: string, subgroupId: string, messageId: string, grade: number, coinsAwarded: number, feedback: string) => void;
  promoteMemberInGroup: (groupId: string, subgroupId: string, memberUsername: string, newLevel: string) => void;
  // Store
  addProductToStore: (data: Omit<Product, 'id' | 'createdAt'>) => boolean;
  deleteProduct: (productId: string) => boolean;
  buyProduct: (productId: string, chosenCurrency?: 'coins' | 'gems') => boolean;
  listItemInOutlet: (inventoryItemId: string, resalePrice: number) => boolean;
  buyOutletProduct: (outletProductId: string) => boolean;
  toggleShowcaseItem: (inventoryItemId: string) => boolean;
  setMerchPrivate: (isPrivate: boolean) => void;
  // Albums, Photocards & Gifting
  userAlbums: UserAlbum[];
  userPhotocards: UserPhotocard[];
  openAlbum: (userAlbumId: string) => Photocard[];
  listPhotocardInOutlet: (userPhotocardId: string, resalePrice: number) => boolean;
  giftItemToUser: (targetUsername: string, inventoryItemId: string, note?: string) => boolean;
  giftPhotocardToUser: (targetUsername: string, userPhotocardId: string, note?: string) => boolean;
  // Magazines (Fashion)
  magazines: Magazine[];
  createMagazine: (data: Omit<Magazine, 'id' | 'createdAt' | 'likes' | 'likedBy'>) => void;
  likeMagazine: (magazineId: string) => void;
  deleteMagazine: (magazineId: string) => void;
  // Releases (Lanzamientos)
  releases: Release[];
  createRelease: (data: Omit<Release, 'id' | 'createdAt'>) => void;
  // Awards (Premiaciones)
  awards: AwardEvent[];
  userAwardVotes: Record<string, number>;
  userVotedNominees: Record<string, string[]>;
  createAwardEvent: (data: Omit<AwardEvent, 'id' | 'createdAt'>) => void;
  deleteAwardEvent: (eventId: string) => void;
  createAwardCategory: (eventId: string, category: Omit<AwardCategory, 'id'>) => void;
  deleteAwardCategory: (eventId: string, categoryId: string) => void;
  voteAwardNominee: (eventId: string, categoryId: string, nomineeId: string) => boolean;
  // Auditions & Evaluation
  submitAudition: (data: Omit<AuditionSubmission, 'id' | 'date' | 'status' | 'evaluated' | 'applicantUsername'>) => void;
  evaluateAudition: (auditionId: number, result: 'trainee' | 'artista' | 'rejected' | 'accepted_staff', note?: string) => void;
  markNotificationRead: (notifId: string) => void;
  submitTradeOffer: (targetUser: string, offeredItemId: string, requestedItemId: string, note: string) => boolean;
  respondToTradeOffer: (offerId: string, response: 'accepted' | 'declined') => void;
  // Partners
  partners: PartnerCompany[];
  addPartner: (data: Omit<PartnerCompany, 'id' | 'createdAt'>) => Promise<void>;
  updatePartner: (id: string, patch: Partial<PartnerCompany>) => Promise<void>;
  deletePartner: (id: string) => Promise<void>;
  // Charts
  charts: ChartEntry[];
  addChartEntry: (data: Omit<ChartEntry, 'id' | 'createdAt'>) => Promise<void>;
  updateChartEntry: (id: string, patch: Partial<ChartEntry>) => Promise<void>;
  deleteChartEntry: (id: string) => Promise<void>;
  // Reviews
  productReviews: Record<string, ProductReview[]>;
  addProductReview: (productId: string, rating: number, comment: string) => Promise<void>;
  deleteProductReview: (productId: string, reviewId: string) => Promise<void>;
  // Button Theme
  buttonTheme: ButtonThemeConfig;
  updateButtonTheme: (theme: Partial<ButtonThemeConfig>) => void;
  // Super Admin & Delegations
  adminDelegations: Record<string, AdminDelegations>;
  delegateAdminPermissions: (targetAdmin: string, perms: AdminDelegations) => Promise<void>;
  adminAuditLog: AdminAuditEntry[];
  userRequests: any[];
  submitUserRoleRequest: (requestedRole: string, reason: string) => Promise<void>;
  reviewUserRoleRequest: (requestId: string, action: 'approve' | 'reject') => Promise<void>;
  // Notifications
  notificationPreferences: Record<string, boolean>;
  toggleNotificationPreference: (category: string) => void;
  deleteNotification: (id: string) => void;
  markAllNotificationsRead: () => void;
  // Survival Shows Stages & Rondas
  survivals: SurvivalShow[];
  createSurvivalShow: (data: Omit<SurvivalShow, 'id' | 'createdAt'>) => void;
  updateSurvivalShow: (survivalId: string, updates: Partial<SurvivalShow>) => void;
  deleteSurvivalShow: (survivalId: string) => void;
  registerToSurvival: (survivalId: string, participant: Omit<SurvivalParticipant, 'id' | 'survivalId' | 'username' | 'status' | 'votes' | 'voters' | 'createdAt'>) => boolean;
  voteSurvivalParticipant: (survivalId: string, participantId: string) => boolean;
  updateSurvivalParticipantStatus: (survivalId: string, participantId: string, status: SurvivalParticipant['status']) => void;
  advanceSurvivalStage: (survivalId: string, nextStage: SurvivalStage) => void;
  submitSurvivalApplication: (survivalId: string, responses: Record<string, string>) => boolean;
  reviewSurvivalApplication: (survivalId: string, applicationId: string, status: 'accepted' | 'rejected' | 'shortlist') => void;
  submitSurvivalMission: (survivalId: string, roundId: string, workUrl: string, notes: string) => void;
  voteSurvivalRound: (survivalId: string, roundId: string, targetUsername: string, mode: 'fan' | 'contestant') => boolean;
  gradeSurvivalParticipant: (survivalId: string, roundId: string, participantUsername: string, score: number) => void;
  addSurvivalEpisode: (survivalId: string, ep: Omit<SurvivalEpisode, 'id' | 'publishedAt'>) => void;
  toggleSurvivalFollow: (survivalId: string) => void;
  toggleSurvivalFavorite: (survivalId: string, contestantUsername: string) => void;
  addSurvivalComment: (survivalId: string, text: string) => void;
  // Audition Codes & Role Activation
  auditionPassCodes: AuditionPassCode[];
  redeemRoleCode: (code: string) => { success: boolean; message: string };
  // Ghost Posts Cleanup
  cleanGhostPosts: () => void;
  isUnlimitedBalance: (username?: string) => boolean;
  // Virtual Economy & Missions
  missions: Mission[];
  userLedger: EconomyLedgerEntry[];
  fetchLedger: () => Promise<void>;
  claimMissionReward: (missionId: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  transferGems: (recipientUsername: string, amount: number, message?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  trackMissionActivity: (actionType: MissionRequirementType, count?: number) => void;
  createMission: (data: Partial<Mission>) => Promise<boolean>;
  updateMission: (id: string, data: Partial<Mission>) => Promise<boolean>;
  deleteMission: (id: string) => Promise<boolean>;
  // Wishlist & Gifting
  userWishlist: WishlistItem[];
  addToWishlist: (productId: string, notes?: string) => Promise<boolean>;
  removeFromWishlist: (wishId: string) => Promise<boolean>;
  giftWishlistItem: (recipientUsername: string, wishId: string) => Promise<boolean>;
  // Showcase Vitrina Personal
  showcaseItems: ShowcaseItem[];
  saveShowcaseItems: (items: ShowcaseItem[]) => Promise<boolean>;
  // Customization & Frames
  updateCustomization: (params: any) => Promise<boolean>;
  // Security & Moderation
  reportUser: (reportedUsername: string, reason: string, category?: string, proofUrl?: string) => Promise<boolean>;
  blockUser: (targetUsername: string, action?: 'block' | 'unblock') => Promise<boolean>;
  blockedUsers: string[];
  grantAwardReward: (awardId: string, categoryId: string, winnerUsername: string, trophyName: string, title?: string) => Promise<boolean>;
  // 19. Sistema de Seguidores & Social Feed
  userFollowers: Array<{ username: string; profile: UserProfile | null; followedAt: string }>;
  userFollowing: Array<{ username: string; profile: UserProfile | null; followedAt: string }>;
  followUser: (targetUsername: string) => Promise<boolean>;
  unfollowUser: (targetUsername: string) => Promise<boolean>;
  isFollowingUser: (targetUsername: string) => boolean;
  getFollowInfo: (username: string) => Promise<{ followersCount: number; followingCount: number; followers: any[]; following: any[] }>;
  // Estados Personalizados
  userStatus: UserStatus | null;
  updateUserStatus: (text: string, emoji?: string, visibility?: 'public' | 'followers' | 'private', durationHours?: number) => Promise<boolean>;
  clearUserStatus: () => Promise<boolean>;
  // Reacciones y Comentarios Anidados
  reactToPost: (postId: number, reaction: ReactionType) => Promise<void>;
  addNestedComment: (postId: number, text: string, parentCommentId?: string) => Promise<boolean>;
  editNestedComment: (postId: number, commentId: string, text: string) => Promise<boolean>;
  deleteNestedComment: (postId: number, commentId: string) => Promise<boolean>;
  // Encuestas Comunitarias
  voteCommunityPoll: (postId: number, optionId: string) => Promise<boolean>;
  // Guardados y Colecciones
  savedCollections: SavedCollection[];
  savedPosts: SavedPostItem[];
  createSavedCollection: (name: string, description?: string) => Promise<boolean>;
  deleteSavedCollection: (id: string) => Promise<boolean>;
  toggleSavePost: (postId: number, collectionId?: string) => Promise<boolean>;
  isPostSaved: (postId: number) => boolean;
  // Destacar y Compartir
  togglePinPost: (postId: number) => Promise<boolean>;
  sharePostToFeed: (postId: number, quoteText?: string, targetForumId?: string) => Promise<boolean>;
  shareProductToFeed: (productId: string, note?: string) => Promise<boolean>;
  // Proveedores Autorizados
  vendorsList: VendorApplication[];
  myVendorApplication: VendorApplication | null;
  applyForVendor: (data: { vendorName: string; description: string; productTypes: string[]; catalogUrl?: string; contactInfo: string }) => Promise<boolean>;
  reviewVendorStatus: (vendorId: string, status: VendorStatus, rejectionReason?: string) => Promise<boolean>;
  isApprovedVendor: (username?: string) => boolean;
  // Tienda Avanzada, Variantes y Cupones
  productVariants: Record<string, ProductVariant[]>;
  discountCoupons: DiscountCoupon[];
  validateCoupon: (code: string, amount: number) => Promise<{ valid: boolean; discountPercent: number; discountAmount: number; finalAmount: number; error?: string }>;
  buyProductAtomic: (productId: string, variantId?: string, quantity?: number, currency?: 'coins' | 'gems', couponCode?: string) => Promise<{ success: boolean; error?: string; remainingStock?: number }>;
  purchaseHistory: ProductPurchaseRecord[];
  createDiscountCoupon: (coupon: { code: string; discountPercent: number; minPurchaseCoins?: number; maxUses?: number; expiresAt?: string }) => Promise<boolean>;
  inventoryMovements: InventoryMovement[];
  restockProduct: (productId: string, additionalStock: number, reason?: string) => Promise<boolean>;
  createProductVariant: (productId: string, variant: Omit<ProductVariant, 'id' | 'productId'>) => Promise<boolean>;
  // Transferencias Atómicas
  transferCurrencyAtomic: (recipient: string, currency: 'coins' | 'gems', amount: number, reason?: string) => Promise<{ success: boolean; error?: string; message?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Theme mode (Dark / Light)
  const [themeMode, setThemeModeState] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('ym_theme') as 'dark' | 'light') || 'dark';
  });

  const setThemeMode = (mode: 'dark' | 'light') => {
    setThemeModeState(mode);
    localStorage.setItem('ym_theme', mode);
    if (mode === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  };

  useEffect(() => {
    if (themeMode === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [themeMode]);

  // Primary button / Accent color
  const [primaryButtonColor, setPrimaryButtonColorState] = useState<string>(() => {
    return localStorage.getItem('ym_primary_color') || '#6366f1';
  });

  const themeColors = computeThemeColors(primaryButtonColor);
  const themeGradient = themeColors.gradient;
  const themeBannerGradient = themeColors.bannerGradient;
  const themeDarkColor = themeColors.dark;

  const setPrimaryButtonColor = (color: string) => {
    setPrimaryButtonColorState(color);
    localStorage.setItem('ym_primary_color', color);
    applyThemeToDocument(color);
  };

  useEffect(() => {
    applyThemeToDocument(primaryButtonColor);
  }, [primaryButtonColor]);

  // Authentication token state
  const [authToken, setAuthToken] = useState<string | null>(getStoredAuthToken);

  // Current session user
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('ym_current_user');
  });

  // Profiles database
  const [allProfiles, setAllProfiles] = useState<Record<string, UserProfile>>(() => {
    const saved = load<Record<string, UserProfile>>('ym_user_profiles', {});
    delete saved['ceo_miki'];
    delete saved['CEO Miki'];
    delete saved['ceo_yako'];
    delete saved['CEO Yako'];
    return saved;
  });

  const getProfileOf = (username: string): UserProfile => {
    if (username === currentUser && userProfile) return userProfile;
    if (allProfiles[username]) return allProfiles[username];
    return defaultProfile(username);
  };

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const u = localStorage.getItem('ym_current_user') || 'Aspirante';
    const savedSingle = load<UserProfile | null>('ym_current_user_profile', null);
    const savedCard = load<IdCardData | null>('ym_id_card_' + u, null);
    if (savedSingle && (savedSingle.username === u || savedSingle.username.toLowerCase() === u.toLowerCase())) {
      if (savedCard) savedSingle.idCard = savedCard;
      return savedSingle;
    }
    const db = load<Record<string, UserProfile>>('ym_user_profiles', {});
    if (db[u]) {
      const p = { ...db[u] };
      if (savedCard) p.idCard = savedCard;
      return p;
    }
    const def = defaultProfile(u);
    if (savedCard) def.idCard = savedCard;
    return def;
  });

  // CEOs list (managed by admins)
  const [ceosList, setCeosList] = useState<CeoInfo[]>(() => {
    return load<CeoInfo[]>('ym_ceos', INITIAL_CEOS);
  });

  // Forums
  const [forums, setForums] = useState<Forum[]>(() => {
    return load<Forum[]>('ym_forums', [
      {
        id: 'general',
        name: 'Comunidad General',
        description: 'Punto de encuentro oficial para todos los talentos y fans de YM-ki Web.',
        banner: DEFAULT_BANNER,
        avatar: DEFAULT_FORUM_AVATAR,
        creator: 'Dirección YM-ki',
        followers: 120,
        isJoined: true,
        bgType: 'solid',
        bgValue: '#0f172a',
        isOfficial: true
      }
    ]);
  });

  // Helper to validate and purge ghost posts
  const isRealPost = (p: any): p is Post => {
    return Boolean(
      p &&
      p.id &&
      p.author &&
      p.author !== 'null' &&
      p.author !== 'undefined' &&
      (String(p.title || '').trim() || String(p.content || '').trim())
    );
  };

  // Clean posts feed (strictly filtering out ghost posts)
  const [posts, setPosts] = useState<Post[]>(() => {
    const raw = load<Post[]>('ym_posts', []);
    return raw.filter(isRealPost);
  });

  // Survival Shows (Supervivencia & Audiciones Globales - sin predeterminados)
  const [survivals, setSurvivals] = useState<SurvivalShow[]>(() => {
    const saved = load<SurvivalShow[]>('ym_survivals', []);
    return (saved || []).filter((s) => s.id !== 'surv-project-rising-2026');
  });

  // Audition Pass Codes (Códigos automáticos para Trainee o Artista)
  const [auditionPassCodes, setAuditionPassCodes] = useState<AuditionPassCode[]>(() => {
    return load<AuditionPassCode[]>('ym_audition_pass_codes', []);
  });

  // Default Multichannel Servers (editables solo por administradores)
  const OFFICIAL_DEFAULT_GROUPS: ChatGroup[] = [
    {
      id: 'group-default-trainees',
      name: 'Sede de Entrenamiento Trainees',
      icon: '🥋',
      creator: 'Administración',
      createdBy: 'Administración',
      duration: 'permanent',
      isAdvanced: true,
      isOfficial: true,
      members: [],
      categories: [
        {
          id: 'cat-trainee-eval',
          name: 'Entrenamiento & Evaluación',
          subgroups: [
            {
              id: 'sub-trainee-general',
              name: 'general-trainees',
              icon: '🥋',
              type: 'general',
              messages: [
                {
                  id: 'm-tr-1',
                  sender: 'SISTEMA OFICIAL YM-ki',
                  text: 'Bienvenidos a la Sede Oficial de Trainees. En este servidor se evalúan misiones y se gestionan los ascensos de rango oficiales (-c hasta +ss).',
                  timestamp: '12:00'
                }
              ]
            },
            {
              id: 'sub-trainee-tasks',
              name: 'evaluaciones-semanales',
              icon: '📋',
              type: 'task_submission',
              pinnedWeeklyMessage: 'Misión Semanal: Grabar pista de voz o video de 60 segundos demostrando tu especialidad.',
              messages: []
            },
            {
              id: 'sub-trainee-debut',
              name: 'consejos-debut',
              icon: '✨',
              type: 'general',
              messages: []
            }
          ]
        }
      ],
      messages: []
    },
    {
      id: 'group-default-artistas',
      name: 'Lounge Oficial de Artistas',
      icon: '🎙️',
      creator: 'Administración',
      createdBy: 'Administración',
      duration: 'permanent',
      isAdvanced: true,
      isOfficial: true,
      members: [],
      categories: [
        {
          id: 'cat-artist-lounge',
          name: 'Salón de Artistas',
          subgroups: [
            {
              id: 'sub-artist-general',
              name: 'charla-artistas',
              icon: '🎙️',
              type: 'general',
              messages: [
                {
                  id: 'm-art-1',
                  sender: 'SISTEMA OFICIAL YM-ki',
                  text: 'Espacio exclusivo para artistas oficiales de YM-ki Entertainment. Planificación de lanzamientos y comebacks.',
                  timestamp: '12:00'
                }
              ]
            },
            {
              id: 'sub-artist-collab',
              name: 'colaboraciones-musica',
              icon: '🎵',
              type: 'general',
              messages: []
            }
          ]
        }
      ],
      messages: []
    },
    {
      id: 'group-default-ceos',
      name: 'Directorio Ejecutivo CEOs',
      icon: '👑',
      creator: 'Administración',
      createdBy: 'Administración',
      duration: 'permanent',
      isAdvanced: true,
      isOfficial: true,
      members: [],
      categories: [
        {
          id: 'cat-ceo-cabinet',
          name: 'Gabinete Directivo',
          subgroups: [
            {
              id: 'sub-ceo-strategy',
              name: 'estrategia-discografica',
              icon: '👑',
              type: 'general',
              messages: [
                {
                  id: 'm-ceo-1',
                  sender: 'SISTEMA OFICIAL YM-ki',
                  text: 'Directorio Ejecutivo de CEOs. Gestión de agencias, presupuestos y audiciones.',
                  timestamp: '12:00'
                }
              ]
            },
            {
              id: 'sub-ceo-auditions',
              name: 'audiciones-admision',
              icon: '🔍',
              type: 'general',
              messages: []
            }
          ]
        }
      ],
      messages: []
    }
  ];

  // Fan clubs (predeterminados eliminados según requerimiento)
  const [fanClubs, setFanClubs] = useState<FanClub[]>(() => {
    const saved = load<FanClub[]>('ym_fan_clubs', []);
    const defaultClubIds = ['fc-starlight', 'fc-cybervision', 'fc-eclipse-group'];
    return (saved || []).filter((c) => !defaultClubIds.includes(c.id));
  });

  // Direct Chats
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(() => {
    return load<Record<string, ChatMessage[]>>('ym_chats_dict', {});
  });

  // Groups and Advanced Servers with default official servers
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>(() => {
    const saved = load<ChatGroup[]>('ym_chat_groups', []);
    const existingIds = new Set((saved || []).map((g) => g.id));
    const merged = [...(saved || [])];
    for (const defGroup of OFFICIAL_DEFAULT_GROUPS) {
      if (!existingIds.has(defGroup.id)) {
        merged.unshift(defGroup);
      }
    }
    return merged;
  });

  // Store products (productos estándar eliminados según requerimiento)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = load<Product[]>('ym_products', []);
    const standardProductIds = [
      'prod-pc-hana-holo',
      'prod-pc-minji-neutral',
      'prod-bundle-miki-superpack',
      'prod-general-ren-varsity'
    ];
    return (saved || []).filter((p) => !standardProductIds.includes(p.id));
  });

  // Inventory
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    return load<InventoryItem[]>('ym_inventory', []);
  });

  // User Albums
  const [userAlbums, setUserAlbums] = useState<UserAlbum[]>(() => {
    return load<UserAlbum[]>('ym_user_albums', []);
  });

  // User Photocards
  const [userPhotocards, setUserPhotocards] = useState<UserPhotocard[]>(() => {
    return load<UserPhotocard[]>('ym_user_photocards', []);
  });

  // Magazines (Fashion - sin revistas predeterminadas)
  const [magazines, setMagazines] = useState<Magazine[]>(() => {
    const saved = load<Magazine[]>('ym_magazines', []);
    const defaultIds = new Set(['mag-1', 'mag-2']);
    return (saved || []).filter((m) => !defaultIds.has(m.id));
  });

  // Releases (Lanzamientos - sin lanzamientos predeterminados)
  const [releases, setReleases] = useState<Release[]>(() => {
    const saved = load<Release[]>('ym_releases', []);
    const defaultIds = new Set(['rel-1', 'rel-2']);
    return (saved || []).filter((r) => !defaultIds.has(r.id));
  });

  // Awards (Premiaciones)
  const [awards, setAwards] = useState<AwardEvent[]>(() => {
    return load<AwardEvent[]>('ym_awards', INITIAL_AWARDS);
  });

  // User Award Votes: key = `${username}_${categoryId}` -> number of votes
  const [userAwardVotes, setUserAwardVotes] = useState<Record<string, number>>(() => {
    return load<Record<string, number>>('ym_award_user_votes', {});
  });

  // User Voted Nominees: key = `${username}_${categoryId}` -> nominee names array
  const [userVotedNominees, setUserVotedNominees] = useState<Record<string, string[]>>(() => {
    return load<Record<string, string[]>>('ym_award_voted_nominees', {});
  });

  // Trade offers
  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>(() => {
    return load<TradeOffer[]>('ym_trades', []);
  });

  // Auditions
  const [auditions, setAuditions] = useState<AuditionSubmission[]>(() => {
    return load<AuditionSubmission[]>('ym_auditions', []);
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    return load<NotificationItem[]>('ym_notifications', []);
  });

  // CEO Upgrade Requests
  const [ceoRequests, setCeoRequests] = useState<CeoUpgradeRequest[]>(() => {
    return load<CeoUpgradeRequest[]>('ym_ceo_requests', []);
  });

  // First Registered User (Primary CEO & Administrator)
  const [firstRegisteredUser, setFirstRegisteredUser] = useState<string>(() => {
    const val = load<string>('ym_first_registered_user', '');
    if (val === 'ceo_miki' || val === 'CEO Miki' || val === 'ceo_yako' || val === 'CEO Yako') {
      return '';
    }
    return val;
  });

  // Friend requests sent
  const [friendRequestsSent, setFriendRequestsSent] = useState<Record<string, boolean>>(() => {
    return load<Record<string, boolean>>('ym_friend_requests', {});
  });

  // Active profile modal
  const [viewingProfileUser, setViewingProfileUser] = useState<UserProfile | null>(null);

  // Partners
  const [partners, setPartners] = useState<PartnerCompany[]>(() => {
    return load<PartnerCompany[]>('ym_partners', []);
  });

  // Charts
  const [charts, setCharts] = useState<ChartEntry[]>(() => {
    return load<ChartEntry[]>('ym_charts', []);
  });

  // Product reviews
  const [productReviews, setProductReviews] = useState<Record<string, ProductReview[]>>(() => {
    return load<Record<string, ProductReview[]>>('ym_reviews', {});
  });

  // Button theme customization
  const [buttonTheme, setButtonThemeState] = useState<ButtonThemeConfig>(() => {
    return load<ButtonThemeConfig>('ym_button_theme', {
      bgColor: '#6366f1',
      textColor: '#ffffff',
      borderColor: '#6366f1',
      hoverBgColor: '#4f46e5',
      activeBgColor: '#4338ca'
    });
  });

  // Admin delegations & audit log & user requests
  const [adminDelegations, setAdminDelegations] = useState<Record<string, AdminDelegations>>(() => {
    return load<Record<string, AdminDelegations>>('ym_admin_delegations', {});
  });

  const [adminAuditLog, setAdminAuditLog] = useState<AdminAuditEntry[]>(() => {
    return load<AdminAuditEntry[]>('ym_admin_audit_log', []);
  });

  const [userRequests, setUserRequests] = useState<any[]>(() => {
    return load<any[]>('ym_user_requests', []);
  });

  // Virtual Economy, Missions, Wishlist & Showcase States
  const [missions, setMissions] = useState<Mission[]>(() => {
    return load<Mission[]>('ym_missions', []);
  });

  const [userLedger, setUserLedger] = useState<EconomyLedgerEntry[]>(() => {
    return load<EconomyLedgerEntry[]>('ym_economy_ledger', []);
  });

  const [userWishlist, setUserWishlist] = useState<WishlistItem[]>(() => {
    return load<WishlistItem[]>('ym_user_wishlist', []);
  });

  const [showcaseItems, setShowcaseItems] = useState<ShowcaseItem[]>(() => {
    return load<ShowcaseItem[]>('ym_showcase_items', []);
  });

  const [blockedUsers, setBlockedUsers] = useState<string[]>(() => {
    return load<string[]>('ym_blocked_users', []);
  });

  // Notification preferences
  const [notificationPreferences, setNotificationPreferences] = useState<Record<string, boolean>>(() => {
    return load<Record<string, boolean>>('ym_notif_prefs', {
      account: true,
      community: true,
      message: true,
      audition: true,
      survival: true,
      store: true
    });
  });

  // User Biases per group (Bias, Bias Wrecker, Least Bias)
  const [userBiases, setUserBiases] = useState<UserBias[]>(() => {
    const cur = localStorage.getItem('ym_current_user') || 'Aspirante';
    return load<UserBias[]>('ym_user_biases_' + cur, []);
  });

  useEffect(() => {
    if (currentUser) {
      save('ym_user_biases_' + currentUser, userBiases);
    }
  }, [userBiases, currentUser]);

  useEffect(() => {
    if (currentUser) {
      const userSavedBiases = load<UserBias[]>('ym_user_biases_' + currentUser, []);
      setUserBiases(userSavedBiases);
    }
  }, [currentUser]);

  // Social, Followers, Status & Saved States
  const [userFollowers, setUserFollowers] = useState<Array<{ username: string; profile: UserProfile | null; followedAt: string }>>([]);
  const [userFollowing, setUserFollowing] = useState<Array<{ username: string; profile: UserProfile | null; followedAt: string }>>([]);
  const [userStatus, setUserStatusState] = useState<UserStatus | null>(null);
  const [savedCollections, setSavedCollections] = useState<SavedCollection[]>([]);
  const [savedPosts, setSavedPosts] = useState<SavedPostItem[]>([]);
  const [vendorsList, setVendorsList] = useState<VendorApplication[]>([]);
  const [productVariants, setProductVariants] = useState<Record<string, ProductVariant[]>>({});
  const [discountCoupons, setDiscountCoupons] = useState<DiscountCoupon[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<ProductPurchaseRecord[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>(() => {
    return load<InventoryMovement[]>('ym_inventory_movements', []);
  });

  useEffect(() => {
    save('ym_inventory_movements', inventoryMovements);
  }, [inventoryMovements]);

  // Sync to local storage
  useEffect(() => { save('ym_forums', forums); }, [forums]);
  useEffect(() => { save('ym_posts', posts); }, [posts]);
  useEffect(() => { save('ym_fan_clubs', fanClubs); }, [fanClubs]);
  useEffect(() => { save('ym_chats_dict', chats); }, [chats]);
  useEffect(() => { save('ym_chat_groups', chatGroups); }, [chatGroups]);
  useEffect(() => { save('ym_products', products); }, [products]);
  useEffect(() => { save('ym_inventory', inventory); }, [inventory]);
  useEffect(() => { save('ym_user_albums', userAlbums); }, [userAlbums]);
  useEffect(() => { save('ym_user_photocards', userPhotocards); }, [userPhotocards]);
  useEffect(() => { save('ym_magazines', magazines); }, [magazines]);
  useEffect(() => { save('ym_releases', releases); }, [releases]);
  useEffect(() => { save('ym_awards', awards); }, [awards]);
  useEffect(() => { save('ym_award_user_votes', userAwardVotes); }, [userAwardVotes]);
  useEffect(() => { save('ym_award_voted_nominees', userVotedNominees); }, [userVotedNominees]);
  useEffect(() => { save('ym_trades', tradeOffers); }, [tradeOffers]);
  useEffect(() => { save('ym_auditions', auditions); }, [auditions]);
  useEffect(() => { save('ym_notifications', notifications); }, [notifications]);
  useEffect(() => { save('ym_ceos', ceosList); }, [ceosList]);
  useEffect(() => { save('ym_ceo_requests', ceoRequests); }, [ceoRequests]);
  useEffect(() => { save('ym_first_registered_user', firstRegisteredUser); }, [firstRegisteredUser]);
  useEffect(() => { save('ym_friend_requests', friendRequestsSent); }, [friendRequestsSent]);
  useEffect(() => { save('ym_survivals', survivals); }, [survivals]);
  useEffect(() => { save('ym_audition_pass_codes', auditionPassCodes); }, [auditionPassCodes]);
  useEffect(() => { save('ym_partners', partners); }, [partners]);
  useEffect(() => { save('ym_charts', charts); }, [charts]);
  useEffect(() => { save('ym_reviews', productReviews); }, [productReviews]);
  useEffect(() => { save('ym_button_theme', buttonTheme); }, [buttonTheme]);
  useEffect(() => { save('ym_admin_delegations', adminDelegations); }, [adminDelegations]);
  useEffect(() => { save('ym_admin_audit_log', adminAuditLog); }, [adminAuditLog]);
  useEffect(() => { save('ym_user_requests', userRequests); }, [userRequests]);
  useEffect(() => { save('ym_notif_prefs', notificationPreferences); }, [notificationPreferences]);

  // Keep active profile and allProfiles synchronized to localStorage & backend
  useEffect(() => {
    if (userProfile && userProfile.username) {
      const u = userProfile.username;
      save('ym_current_user_profile', userProfile);
      setAllProfiles((prev) => {
        const updated = { ...prev, [u]: userProfile };
        save('ym_user_profiles', updated);
        return updated;
      });
      apiFetch(`/api/users/${encodeURIComponent(u)}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userProfile)
      }).catch(() => {});
    }
  }, [userProfile]);

  useEffect(() => {
    if (allProfiles && Object.keys(allProfiles).length > 0) {
      save('ym_user_profiles', allProfiles);
    }
  }, [allProfiles]);

  // Apply button theme dynamically on document
  useEffect(() => {
    applyThemeToDocument(primaryButtonColor, buttonTheme);
  }, [primaryButtonColor, buttonTheme]);

  // Validate active session token on startup
  useEffect(() => {
    const token = getStoredAuthToken();
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.success && data.user) {
            setCurrentUser(data.user.username);
            save('ym_current_user', data.user.username);
            if (data.profile) {
              setUserProfile(data.profile);
              setAllProfiles((prev) => ({ ...prev, [data.user.username]: data.profile }));
            }
          } else {
            // Invalid or expired token: clear it
            localStorage.removeItem('ym_auth_token');
            setAuthToken(null);
          }
        })
        .catch((err) => {
          console.warn('Could not verify session with server:', err);
        });
    }
  }, []);

  // Cross-device synchronization via server API
  useEffect(() => {
    const defaultProductIds = new Set([
      'prod-fashion-1',
      'prod-fashion-2',
      'prod-fashion-3',
      'prod-album-1',
      'prod-album-2',
      'prod-album-3'
    ]);
    const defaultMagIds = new Set(['mag-1', 'mag-2']);
    const defaultRelIds = new Set(['rel-1', 'rel-2']);
    const defaultSurvIds = new Set(['surv-project-rising-2026']);

    apiFetch('/api/state')
      .then((res) => (res && res.ok ? res.json() : null))
      .then((serverData) => {
        if (!serverData) return;
        if (serverData.firstRegisteredUser) {
          setFirstRegisteredUser(serverData.firstRegisteredUser);
        }
        if (serverData.ceoRequests && Array.isArray(serverData.ceoRequests)) {
          setCeoRequests(serverData.ceoRequests);
        }
        if (serverData.survivals && Array.isArray(serverData.survivals)) {
          const localSurvs = load<SurvivalShow[]>('ym_survivals', []);
          const map = new Map<string, SurvivalShow>();
          for (const s of localSurvs) map.set(s.id, s);
          for (const s of serverData.survivals) {
            if (!defaultSurvIds.has(s.id)) {
              map.set(s.id, { ...(map.get(s.id) || {}), ...s });
            }
          }
          const mergedSurvs = Array.from(map.values());
          setSurvivals(mergedSurvs);
          save('ym_survivals', mergedSurvs);
        }
        if (serverData.allProfiles && Object.keys(serverData.allProfiles).length > 0) {
          const localProfiles = load<Record<string, UserProfile>>('ym_user_profiles', {});
          const mergedProfiles = { ...serverData.allProfiles, ...localProfiles };
          setAllProfiles(mergedProfiles);
          save('ym_user_profiles', mergedProfiles);

          const currentUserKey = localStorage.getItem('ym_current_user') || currentUser;
          if (currentUserKey) {
            const savedSingle = load<UserProfile | null>('ym_current_user_profile', null);
            const savedCard = load<IdCardData | null>('ym_id_card_' + currentUserKey, null);
            setUserProfile((prev) => {
              const current = savedSingle || prev || defaultProfile(currentUserKey);
              const result = {
                ...defaultProfile(currentUserKey),
                ...(serverData.allProfiles[currentUserKey] || {}),
                ...current
              };
              if (savedCard) {
                result.idCard = savedCard;
              }
              save('ym_current_user_profile', result);
              return result;
            });
          }
        }
        if (serverData.auditionPassCodes && serverData.auditionPassCodes.length > 0) {
          setAuditionPassCodes(serverData.auditionPassCodes);
        }
        if (serverData.posts && serverData.posts.length > 0) {
          setPosts(serverData.posts.filter(isRealPost));
        }
        if (serverData.magazines && Array.isArray(serverData.magazines)) {
          setMagazines(serverData.magazines.filter((m: any) => !defaultMagIds.has(m.id)));
        }
        if (serverData.releases && Array.isArray(serverData.releases)) {
          setReleases(serverData.releases.filter((r: any) => !defaultRelIds.has(r.id)));
        }
        if (serverData.products && Array.isArray(serverData.products)) {
          const deletedSet = new Set(load<string[]>('ym_deleted_products', []));
          const localProducts = load<Product[]>('ym_products', []);
          const map = new Map<string, Product>();
          for (const p of serverData.products) {
            if (!deletedSet.has(p.id) && !defaultProductIds.has(p.id)) {
              map.set(p.id, p);
            }
          }
          for (const p of localProducts) {
            if (!deletedSet.has(p.id) && !defaultProductIds.has(p.id)) {
              map.set(p.id, p);
            }
          }
          const finalProds = Array.from(map.values());
          setProducts(finalProds);
          save('ym_products', finalProds);
        }
        if (serverData.awards && Array.isArray(serverData.awards)) {
          const deletedEvents = new Set(load<string[]>('ym_deleted_award_events', []));
          const localAwards = load<AwardEvent[]>('ym_awards', []);
          const map = new Map<string, AwardEvent>();
          for (const a of serverData.awards) {
            if (!deletedEvents.has(a.id)) map.set(a.id, a);
          }
          for (const a of localAwards) {
            if (!deletedEvents.has(a.id)) map.set(a.id, a);
          }
          const finalAwards = Array.from(map.values());
          setAwards(finalAwards);
          save('ym_awards', finalAwards);
        }
        if (serverData.partners && Array.isArray(serverData.partners)) {
          setPartners(serverData.partners);
        }
        if (serverData.charts && Array.isArray(serverData.charts)) {
          setCharts(serverData.charts);
        }
        if (serverData.reviews && typeof serverData.reviews === 'object') {
          setProductReviews(serverData.reviews);
        }
        if (serverData.adminDelegations && typeof serverData.adminDelegations === 'object') {
          setAdminDelegations(serverData.adminDelegations);
        }
        if (serverData.adminAuditLog && Array.isArray(serverData.adminAuditLog)) {
          setAdminAuditLog(serverData.adminAuditLog);
        }
        if (serverData.userRequests && Array.isArray(serverData.userRequests)) {
          setUserRequests(serverData.userRequests);
        }
        if (serverData.missions && Array.isArray(serverData.missions)) {
          setMissions(serverData.missions);
        }
        if (serverData.economyLedger && Array.isArray(serverData.economyLedger)) {
          setUserLedger(serverData.economyLedger);
        }
        if (serverData.wishlists && typeof serverData.wishlists === 'object') {
          const userWish = serverData.wishlists[currentUser || ''] || [];
          setUserWishlist(userWish);
        }
        if (serverData.showcaseCollections && typeof serverData.showcaseCollections === 'object') {
          const userShowcase = serverData.showcaseCollections[currentUser || ''] || [];
          setShowcaseItems(userShowcase);
        }
        if (serverData.blockedUsers && typeof serverData.blockedUsers === 'object') {
          const userBlocked = serverData.blockedUsers[currentUser || ''] || [];
          setBlockedUsers(userBlocked);
        }
        if (serverData.vendors && Array.isArray(serverData.vendors)) {
          setVendorsList(serverData.vendors);
        }
        if (serverData.discountCoupons && Array.isArray(serverData.discountCoupons)) {
          setDiscountCoupons(serverData.discountCoupons);
        }
        if (serverData.productVariants && typeof serverData.productVariants === 'object') {
          setProductVariants(serverData.productVariants);
        }
        if (serverData.savedCollections && typeof serverData.savedCollections === 'object') {
          setSavedCollections(serverData.savedCollections[currentUser || ''] || []);
        }
        if (serverData.savedPosts && typeof serverData.savedPosts === 'object') {
          setSavedPosts(serverData.savedPosts[currentUser || ''] || []);
        }
        if (serverData.userStatuses && typeof serverData.userStatuses === 'object') {
          setUserStatusState(serverData.userStatuses[currentUser || ''] || null);
        }
      })
      .catch(() => {});
  }, [currentUser]);

  // Auto-join default official server based on accountType
  useEffect(() => {
    if (!currentUser || !userProfile.accountType) return;
    let targetGroupId: string | null = null;
    if (userProfile.accountType === 'trainee') targetGroupId = 'group-default-trainees';
    else if (userProfile.accountType === 'artista') targetGroupId = 'group-default-artistas';
    else if (userProfile.accountType === 'admin') targetGroupId = 'group-default-ceos';

    if (!targetGroupId) return;

    setChatGroups((prev) =>
      prev.map((g) => {
        if (g.id === targetGroupId) {
          if (!g.members.includes(currentUser)) {
            return { ...g, members: [...g.members, currentUser] };
          }
        }
        return g;
      })
    );
  }, [currentUser, userProfile.accountType]);

  const fetchFollowersData = async (user = currentUser) => {
    if (!user) return;
    try {
      const res = await apiFetch(`/api/followers/${encodeURIComponent(user)}`);
      if (res && res.ok) {
        const data = await res.json();
        setUserFollowers(data.followers || []);
        setUserFollowing(data.following || []);
      }
    } catch {}
  };

  useEffect(() => {
    if (currentUser) {
      fetchFollowersData(currentUser);
      apiFetch(`/api/store/purchases/${encodeURIComponent(currentUser)}`)
        .then((r) => (r && r.ok ? r.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.purchases)) setPurchaseHistory(data.purchases);
        })
        .catch(() => {});
      apiFetch('/api/store/movements')
        .then((r) => (r && r.ok ? r.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.movements)) setInventoryMovements(data.movements);
        })
        .catch(() => {});
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      save('ym_current_user', currentUser);
      const updatedAll = { ...allProfiles, [currentUser]: userProfile };
      setAllProfiles(updatedAll);
      save('ym_user_profiles', updatedAll);
    }
  }, [userProfile, currentUser]);

  const isPrivileged = (username?: string) => {
    const u = username || currentUser;
    if (!u) return false;
    const prof = allProfiles[u] || (u === currentUser ? userProfile : defaultProfile(u));
    return prof.accountType === 'admin';
  };

  const isPrimaryCeo = () => {
    if (!currentUser) return false;
    if (firstRegisteredUser) {
      return currentUser.trim().toLowerCase() === firstRegisteredUser.trim().toLowerCase();
    }
    return isPrivileged();
  };

  const isUnlimitedBalance = (username?: string) => {
    const u = username || currentUser;
    if (!u) return false;
    const prof = allProfiles[u] || (u === currentUser ? userProfile : defaultProfile(u));
    return prof.accountType === 'admin' || prof.accountType === 'artista';
  };

  const isDesigner = (username?: string) => {
    const u = username || currentUser;
    if (!u) return false;
    const prof = allProfiles[u] || (u === currentUser ? userProfile : defaultProfile(u));
    return prof.accountType === 'diseñador';
  };

  const canCreateMagazine = (username?: string) => {
    const u = username || currentUser;
    if (!u) return false;
    const prof = allProfiles[u] || (u === currentUser ? userProfile : defaultProfile(u));
    return prof.accountType === 'admin' || prof.accountType === 'diseñador';
  };

  const canUploadGif = (username?: string) => {
    const u = username || currentUser;
    if (!u) return false;
    const prof = allProfiles[u] || (u === currentUser ? userProfile : defaultProfile(u));
    return prof.accountType === 'admin' || prof.accountType === 'diseñador' || prof.accountType === 'artista' || prof.accountType === 'premium_fan';
  };

  const login = async (username: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanUser = username.trim();
    if (!cleanUser) return { success: false, error: 'Usuario o correo requerido' };

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanUser, password: password || '' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const err = data.error || 'Credenciales inválidas.';
        showToast(err);
        return { success: false, error: err };
      }
      if (data.token) {
        localStorage.setItem('ym_auth_token', data.token);
        setAuthToken(data.token);
      }
      setUserProfile(data.profile);
      setAllProfiles((prev) => ({ ...prev, [data.username]: data.profile }));
      setCurrentUser(data.username);
      save('ym_current_user', data.username);
      showToast(`¡Bienvenido de nuevo, ${data.profile.nickname || data.username}!`);
      return { success: true };
    } catch {
      const err = 'Error de conexión con el servidor al iniciar sesión.';
      showToast(err);
      return { success: false, error: err };
    }
  };

  const register = async (
    username: string,
    nickname: string,
    dob: string,
    email?: string,
    password?: string,
    acceptedTerms?: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanUser = username.trim();
    if (!cleanUser) return { success: false, error: 'Nombre de usuario requerido' };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUser,
          nickname: nickname.trim() || cleanUser,
          dob,
          email: (email || `${cleanUser.toLowerCase()}@ymki.club`).trim(),
          password: password || '',
          acceptedTerms: acceptedTerms !== false
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const err = data.error || 'Error al completar el registro.';
        showToast(err);
        return { success: false, error: err };
      }
      if (data.token) {
        localStorage.setItem('ym_auth_token', data.token);
        setAuthToken(data.token);
      }
      setUserProfile(data.profile);
      setAllProfiles((prev) => ({ ...prev, [cleanUser]: data.profile }));
      setCurrentUser(cleanUser);
      save('ym_current_user', cleanUser);
      showToast(data.message || '¡Registro exitoso!');
      return { success: true };
    } catch {
      const err = 'Error de conexión con el servidor al registrar cuenta.';
      showToast(err);
      return { success: false, error: err };
    }
  };

  const changeUsername = async (newUsername: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'No has iniciado sesión.' };
    const oldClean = currentUser.trim();
    const newClean = newUsername.trim();

    if (!newClean) {
      return { success: false, error: 'El nombre de usuario no puede estar vacío.' };
    }
    if (newClean.length < 3) {
      return { success: false, error: 'El nombre de usuario debe contener al menos 3 caracteres.' };
    }
    if (newClean.length > 25) {
      return { success: false, error: 'El nombre de usuario no puede exceder 25 caracteres.' };
    }
    if (!/^[a-zA-Z0-9_.\-\s]+$/.test(newClean)) {
      return { success: false, error: 'El nombre de usuario solo puede contener letras, números, espacios, guiones y puntos.' };
    }
    if (oldClean.toLowerCase() === newClean.toLowerCase()) {
      return { success: false, error: 'El nuevo nombre de usuario es igual al actual.' };
    }

    // Check uniqueness across all existing accounts
    const isTaken = Object.keys(allProfiles).some(
      (u) => u.trim().toLowerCase() === newClean.toLowerCase() && u.trim().toLowerCase() !== oldClean.toLowerCase()
    );
    if (isTaken) {
      const err = `El nombre de usuario "${newClean}" ya está en uso por otra persona. Por favor elige otro.`;
      showToast(err);
      return { success: false, error: err };
    }

    try {
      const res = await fetch('/api/auth/change-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUsername: oldClean, newUsername: newClean })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const errMsg = data.error || 'Error en el servidor al cambiar nombre de usuario.';
        showToast(errMsg);
        return { success: false, error: errMsg };
      }
    } catch (e) {
      console.warn('Network sync warning while changing username:', e);
    }

    // Cascade state update locally
    setCurrentUser(newClean);
    setUserProfile((prev) => ({
      ...prev,
      username: newClean,
      idCard: prev.idCard ? { ...prev.idCard, pseudonym: newClean } : undefined
    }));

    setAllProfiles((prev) => {
      const copy = { ...prev };
      const currentObj = copy[oldClean] || defaultProfile(newClean);
      delete copy[oldClean];
      copy[newClean] = {
        ...currentObj,
        username: newClean,
        idCard: currentObj.idCard ? { ...currentObj.idCard, pseudonym: newClean } : undefined
      };
      save('ym_user_profiles', copy);
      return copy;
    });

    save('ym_current_user', newClean);

    if (firstRegisteredUser && firstRegisteredUser.toLowerCase() === oldClean.toLowerCase()) {
      setFirstRegisteredUser(newClean);
      save('ym_first_registered_user', newClean);
    }

    // Cascade to forums, posts, clubs, products, etc.
    setForums((prev) =>
      prev.map((f) => ({
        ...f,
        creator: f.creator === oldClean ? newClean : f.creator
      }))
    );

    setPosts((prev) =>
      prev.map((p) => ({
        ...p,
        author: p.author === oldClean ? newClean : p.author,
        comments: p.comments.map((c) => ({
          ...c,
          author: c.author === oldClean ? newClean : c.author
        }))
      }))
    );

    setFanClubs((prev) =>
      prev.map((fc) => ({
        ...fc,
        manager: fc.manager === oldClean ? newClean : fc.manager,
        artists: fc.artists.map((a) => (a === oldClean ? newClean : a)),
        members: fc.members.map((m) => (m === oldClean ? newClean : m))
      }))
    );

    setProducts((prev) =>
      prev.map((prod) => ({
        ...prod,
        createdBy: prod.createdBy === oldClean ? newClean : prod.createdBy,
        resellerUsername: prod.resellerUsername === oldClean ? newClean : prod.resellerUsername
      }))
    );

    setMagazines((prev) =>
      prev.map((m) => ({
        ...m,
        createdBy: m.createdBy === oldClean ? newClean : m.createdBy,
        likedBy: m.likedBy.map((u) => (u === oldClean ? newClean : u))
      }))
    );

    setReleases((prev) =>
      prev.map((r) => ({
        ...r,
        artist: r.artist === oldClean ? newClean : r.artist
      }))
    );

    setSurvivals((prev) =>
      prev.map((s) => ({
        ...s,
        createdBy: s.createdBy === oldClean ? newClean : s.createdBy,
        participants: s.participants.map((p) => ({
          ...p,
          username: p.username === oldClean ? newClean : p.username,
          voters: p.voters.map((v) => (v === oldClean ? newClean : v))
        }))
      }))
    );

    setAuditionPassCodes((prev) =>
      prev.map((c) => ({
        ...c,
        targetUsername: c.targetUsername === oldClean ? newClean : c.targetUsername
      }))
    );

    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        recipient: n.recipient === oldClean ? newClean : n.recipient
      }))
    );

    setCeoRequests((prev) =>
      prev.map((cr) => ({
        ...cr,
        username: cr.username === oldClean ? newClean : cr.username
      }))
    );

    showToast(`¡Tu nombre de usuario se ha cambiado exitosamente a @${newClean}!`);
    return { success: true };
  };

  const logout = async () => {
    const token = getStoredAuthToken();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.warn('Logout network error:', err);
      }
    }
    setAuthToken(null);
    setCurrentUser(null);
    localStorage.removeItem('ym_auth_token');
    localStorage.removeItem('ym_current_user');
    showToast('Sesión cerrada.');
  };

  const logoutAll = async () => {
    const token = getStoredAuthToken();
    if (token) {
      try {
        await fetch('/api/auth/logout-all', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.warn('Logout all network error:', err);
      }
    }
    setAuthToken(null);
    setCurrentUser(null);
    localStorage.removeItem('ym_auth_token');
    localStorage.removeItem('ym_current_user');
    showToast('Sesión cerrada en todos los dispositivos.');
  };

  const updateProfile = (patch: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const updated = { ...prev, ...patch };
      const u = updated.username;
      save('ym_current_user_profile', updated);
      setAllProfiles((allPrev) => {
        const nextAll = { ...allPrev, [u]: updated };
        save('ym_user_profiles', nextAll);
        return nextAll;
      });
      apiFetch(`/api/users/${encodeURIComponent(u)}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(() => {});
      return updated;
    });
    showToast('Perfil actualizado con éxito.');
  };

  const removeFrame = () => {
    setUserProfile((prev) => {
      const updated = {
        ...prev,
        transparentFrame: null,
        customTransparentFrame: null,
        selectedFrameId: null
      };
      save('ym_current_user_profile', updated);
      return updated;
    });
    showToast('Marco retirado de tu avatar.');
  };

  const updateIdCard = (data: Partial<IdCardData>) => {
    setUserProfile((prev) => {
      const currentCard = prev.idCard || {
        pseudonym: prev.nickname || prev.username,
        age: 20,
        gender: 'Femenino',
        matricula: generateMatricula(),
        faceclaim: prev.avatar,
        cardColor: '#6366f1',
        specialties: ['vocal']
      };
      const updatedCard = { ...currentCard, ...data };
      const updated = {
        ...prev,
        idCard: updatedCard
      };
      const u = updated.username;
      save('ym_current_user_profile', updated);
      setAllProfiles((allPrev) => {
        const nextAll = { ...allPrev, [u]: updated };
        save('ym_user_profiles', nextAll);
        return nextAll;
      });
      apiFetch(`/api/users/${encodeURIComponent(u)}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(() => {});
      return updated;
    });
    showToast('ID-Card actualizada con éxito.');
  };

  const updateCeoProfile = (ceoId: string, patch: Partial<CeoInfo>) => {
    setCeosList((prev) =>
      prev.map((c) => (c.id === ceoId ? { ...c, ...patch } : c))
    );
    showToast('Perfil del CEO actualizado.');
  };

  const upgradeToPremiumFan = () => {
    const price = 500;
    if (userProfile.coins < price) {
      showToast('Coins insuficientes para Fan Premium (Requiere 500 Coins).');
      return false;
    }
    setUserProfile((prev) => ({
      ...prev,
      coins: prev.coins - price,
      accountType: 'premium_fan'
    }));
    showToast('¡Felicidades! Has mejorado a membresía Fan Premium.');
    return true;
  };

  const requestCeoUpgrade = (
    ceoId: string,
    requestedRole: 'artista' | 'admin' | 'diseñador',
    reason: string
  ) => {
    if (!currentUser) return;
    const targetCeo = firstRegisteredUser || 'admin';
    const req: CeoUpgradeRequest = {
      id: 'req-' + Date.now(),
      username: currentUser,
      requestedRole,
      ceoId: ceoId || 'ceo-primary',
      ceoName: requestedRole === 'admin' ? `CEO Fundador (@${targetCeo})` : targetCeo,
      reason,
      date: new Date().toISOString(),
      status: 'pending'
    };

    setCeoRequests((prev) => [req, ...prev]);

    // Send notification to primary CEO
    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        recipient: targetCeo,
        type: 'system',
        title: '👑 Nueva Solicitud para CEO / Administrador',
        message: `@${currentUser} ha solicitado ser nombrado CEO / Administrador de YM-ki Records. Revisa su postulación en Configuración.`,
        date: new Date().toISOString(),
        read: false
      },
      ...prev
    ]);

    fetch('/api/ceo-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: currentUser,
        requestedRole,
        reason
      })
    }).catch(() => {});

    showToast(
      requestedRole === 'admin'
        ? `Solicitud para ser CEO enviada exclusivamente al CEO Fundador (@${targetCeo}).`
        : `Solicitud oficial enviada.`
    );
  };

  const approveCeoRequest = (requestId: string) => {
    if (!isPrimaryCeo()) {
      showToast('Solo el CEO Fundador / Primer Administrador puede aprobar solicitudes de nuevos CEOs.');
      return;
    }
    const req = ceoRequests.find((r) => r.id === requestId);
    if (!req) return;

    setCeoRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' } : r))
    );

    setAllProfiles((prev) => {
      const p = prev[req.username] || defaultProfile(req.username);
      const updatedUser = {
        ...p,
        accountType: 'admin' as AccountType,
        coins: 999999,
        gems: 9999
      };
      return { ...prev, [req.username]: updatedUser };
    });

    if (req.username === currentUser) {
      setUserProfile((prev) => ({
        ...prev,
        accountType: 'admin',
        coins: 999999,
        gems: 9999
      }));
    }

    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        recipient: req.username,
        type: 'system',
        title: '👑 ¡Solicitud de CEO Aprobada!',
        message: `¡Felicidades! Tu solicitud para ser CEO ha sido aprobada por el CEO Fundador (@${firstRegisteredUser}). Ahora tienes rango de Administrador y saldo ilimitado.`,
        date: new Date().toISOString(),
        read: false
      },
      ...prev
    ]);

    fetch(`/api/ceo-requests/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', reviewerUsername: currentUser })
    }).catch(() => {});

    showToast(`Solicitud aprobada: @${req.username} es ahora CEO / Administrador.`);
  };

  const rejectCeoRequest = (requestId: string) => {
    if (!isPrimaryCeo()) {
      showToast('Solo el CEO Fundador / Primer Administrador puede responder a las solicitudes.');
      return;
    }
    const req = ceoRequests.find((r) => r.id === requestId);
    if (!req) return;

    setCeoRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' } : r))
    );

    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        recipient: req.username,
        type: 'system',
        title: 'Solicitud de CEO Revisada',
        message: `Tu postulación para ser CEO ha sido revisada por el CEO Fundador (@${firstRegisteredUser}) y no ha sido aprobada en esta ocasión.`,
        date: new Date().toISOString(),
        read: false
      },
      ...prev
    ]);

    fetch(`/api/ceo-requests/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', reviewerUsername: currentUser })
    }).catch(() => {});

    showToast(`Solicitud de @${req.username} rechazada.`);
  };

  const addCoins = (coins: number, gems?: number) => {
    setUserProfile((prev) => ({
      ...prev,
      coins: prev.coins + coins,
      gems: prev.gems + (gems || 0)
    }));
    if (coins > 0) {
      showToast(`¡Se han añadido ${coins} Coins a tu cartera!`);
    } else if (gems && gems > 0) {
      showToast(`¡Se han añadido ${gems} Gems a tu cartera!`);
    }
  };

  const addGems = (gems: number) => {
    addCoins(0, gems);
  };

  const fetchLedger = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/economy/ledger/${currentUser}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.ledger)) {
        setUserLedger(data.ledger);
        save('ym_economy_ledger', data.ledger);
      }
    } catch {}
  };

  const claimMissionReward = async (missionId: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Inicia sesión para reclamar recompensas.' };

    try {
      const res = await fetch(`/api/missions/${missionId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || 'No fue posible reclamar la recompensa.');
        return { success: false, error: data.error };
      }

      if (data.profile) {
        setUserProfile(data.profile);
      }
      showToast(data.message || '¡Recompensa acreditada con éxito!');
      fetchLedger();
      return { success: true, message: data.message };
    } catch (e: any) {
      showToast('Error de conexión al reclamar.');
      return { success: false, error: e.message };
    }
  };

  const transferGems = async (
    recipientUsername: string,
    amount: number,
    message?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Inicia sesión.' };

    try {
      const res = await fetch('/api/economy/transfer-gems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderUsername: currentUser,
          recipientUsername,
          amount,
          message
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || 'Error al transferir Gemas.');
        return { success: false, error: data.error };
      }

      setUserProfile((prev) => ({ ...prev, gems: data.senderGems }));
      showToast(data.message || '¡Transferencia completada con éxito!');
      fetchLedger();
      return { success: true, message: data.message };
    } catch (e: any) {
      showToast('Error de conexión durante la transferencia.');
      return { success: false, error: e.message };
    }
  };

  const trackMissionActivity = (actionType: MissionRequirementType, count?: number) => {
    if (!currentUser) return;
    fetch('/api/missions/track-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: currentUser, actionType, count: count || 1 })
    }).catch(() => {});
  };

  const createMission = async (data: Partial<Mission>): Promise<boolean> => {
    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setMissions(resData.missions);
        showToast('Misión creada exitosamente.');
        return true;
      }
      showToast(resData.error || 'Error creando misión.');
      return false;
    } catch {
      return false;
    }
  };

  const updateMission = async (id: string, data: Partial<Mission>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/missions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setMissions(resData.missions);
        showToast('Misión actualizada.');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteMission = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/missions/${id}`, { method: 'DELETE' });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setMissions(resData.missions);
        showToast('Misión eliminada.');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const addToWishlist = async (productId: string, notes?: string): Promise<boolean> => {
    if (!currentUser) {
      showToast('Inicia sesión para gestionar tu lista de deseos.');
      return false;
    }
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, productId, notes })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserWishlist(data.wishlist);
        showToast('¡Artículo añadido a tu Lista de Deseos!');
        return true;
      }
      showToast(data.error || 'Error al añadir a lista de deseos.');
      return false;
    } catch {
      return false;
    }
  };

  const removeFromWishlist = async (wishId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch(`/api/wishlist/${currentUser}/${wishId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserWishlist(data.wishlist);
        showToast('Artículo retirado de tu lista de deseos.');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const giftWishlistItem = async (recipientUsername: string, wishId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch('/api/wishlist/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giverUsername: currentUser, recipientUsername, wishId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || '¡Obsequio enviado exitosamente!');
        fetchLedger();
        return true;
      }
      showToast(data.error || 'Error al enviar el obsequio.');
      return false;
    } catch {
      return false;
    }
  };

  const saveShowcaseItems = async (items: ShowcaseItem[]): Promise<boolean> => {
    if (!currentUser) return false;
    setShowcaseItems(items);
    try {
      const res = await fetch('/api/showcase/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, showcaseItems: items })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('¡Vitrina personal actualizada con éxito!');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updateCustomization = async (params: any): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch('/api/user/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, ...params })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserProfile(data.profile);
        setAllProfiles((prev) => ({ ...prev, [currentUser]: data.profile }));
        showToast('Personalización de marco y perfil guardada.');
        return true;
      }
      showToast(data.error || 'Error al guardar personalización.');
      return false;
    } catch {
      return false;
    }
  };

  const reportUser = async (reportedUsername: string, reason: string, category?: string, proofUrl?: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch('/api/security/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reporterUsername: currentUser, reportedUsername, reason, category, proofUrl })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'Reporte enviado a la administración.');
        return true;
      }
      showToast(data.error || 'Error al enviar reporte.');
      return false;
    } catch {
      return false;
    }
  };

  const blockUser = async (targetUsername: string, action: 'block' | 'unblock' = 'block'): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch('/api/security/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, targetUsername, action })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBlockedUsers(data.blockedUsers);
        showToast(action === 'block' ? `@${targetUsername} ha sido bloqueado.` : `@${targetUsername} desbloqueado.`);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const grantAwardReward = async (
    awardId: string,
    categoryId: string,
    winnerUsername: string,
    trophyName: string,
    title?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/awards/grant-rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          awardId,
          categoryId,
          winnerUsername,
          trophyName,
          recognitionTitle: title
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || '¡Galardón y trofeo digital entregados!');
        if (winnerUsername === currentUser) {
          setUserProfile(data.profile);
        }
        return true;
      }
      showToast(data.error || 'Error al entregar galardón.');
      return false;
    } catch {
      return false;
    }
  };

  const transferCoins = (targetUsername: string, amount: number) => {
    if (amount <= 0) return false;
    if (userProfile.coins < amount) {
      showToast('No tienes suficientes Coins.');
      return false;
    }
    const cleanTarget = targetUsername.replace('@', '').trim();
    if (cleanTarget === currentUser) {
      showToast('No puedes transferirte a ti mismo.');
      return false;
    }
    setUserProfile((prev) => ({ ...prev, coins: prev.coins - amount }));
    setAllProfiles((prev) => {
      const p = prev[cleanTarget] || defaultProfile(cleanTarget);
      return { ...prev, [cleanTarget]: { ...p, coins: p.coins + amount } };
    });
    showToast(`Has transferido ${amount} Coins a @${cleanTarget}.`);
    return true;
  };

  const claimDailyCoins = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (userProfile.lastDailyClaim === today) {
      showToast('Ya has reclamado tu recompensa diaria hoy.');
      return false;
    }
    setUserProfile((prev) => ({
      ...prev,
      coins: prev.coins + 150,
      gems: prev.gems + 2,
      lastDailyClaim: today
    }));
    showToast('¡Has reclamado 150 Coins y 2 Gemas diarias!');
    return true;
  };

  const completeMission = (missionId: string, rewardCoins: number) => {
    if (userProfile.completedMissions?.includes(missionId)) {
      showToast('Esta misión ya fue completada.');
      return;
    }
    setUserProfile((prev) => ({
      ...prev,
      coins: prev.coins + rewardCoins,
      completedMissions: [...(prev.completedMissions || []), missionId]
    }));
    showToast(`¡Misión completada! +${rewardCoins} Coins.`);
  };

  const sendFriendRequest = (targetUsername: string) => {
    if (friendRequestsSent[targetUsername]) {
      showToast(`Ya has enviado una solicitud de amistad a ${targetUsername}.`);
      return false;
    }
    setFriendRequestsSent((prev) => ({ ...prev, [targetUsername]: true }));
    showToast(`Solicitud de amistad enviada a ${targetUsername} con éxito.`);
    return true;
  };

  const openProfileByUsername = (username: string) => {
    const p = getProfileOf(username);
    setViewingProfileUser(p);
  };

  const createForum = (data: Partial<Forum>) => {
    const newF: Forum = {
      id: 'f-' + Date.now(),
      name: data.name || 'Nuevo Foro',
      description: data.description || '',
      banner: data.banner || DEFAULT_BANNER,
      avatar: data.avatar || DEFAULT_FORUM_AVATAR,
      creator: currentUser || 'Administración',
      followers: 1,
      isJoined: true,
      bgType: data.bgType || 'solid',
      bgValue: data.bgValue || '#0f172a',
      isOfficial: isPrivileged()
    };
    setForums((prev) => [newF, ...prev]);
    showToast(`Foro "${newF.name}" creado con éxito.`);
  };

  const createFandomForum = (fanClubId: string, name: string, description: string) => {
    const club = fanClubs.find((c) => c.id === fanClubId);
    if (!club) return false;
    const newF: Forum = {
      id: 'f-fandom-' + Date.now(),
      name,
      description,
      banner: club.banner || DEFAULT_BANNER,
      avatar: club.avatar || DEFAULT_FORUM_AVATAR,
      creator: currentUser || 'Manager',
      followers: 1,
      isJoined: true,
      bgType: 'solid',
      bgValue: '#0f172a',
      isOfficial: false,
      isFandomForum: true,
      fanClubId: club.id,
      fandomName: club.fandomName
    };
    setForums((prev) => [newF, ...prev]);
    setFanClubs((prev) =>
      prev.map((c) => (c.id === fanClubId ? { ...c, privateForums: [...c.privateForums, name] } : c))
    );
    showToast(`Foro de fandom "${name}" creado exitosamente.`);
    return true;
  };

  const editForum = (forumId: string, data: Partial<Forum>) => {
    setForums((prev) =>
      prev.map((f) => (f.id === forumId ? { ...f, ...data } : f))
    );
    showToast('Foro actualizado.');
  };

  const deleteForum = (forumId: string) => {
    setForums((prev) => prev.filter((f) => f.id !== forumId));
    setPosts((prev) => prev.filter((p) => p.forumId !== forumId));
    showToast('Foro eliminado.');
  };

  const joinForum = (forumId: string) => {
    setForums((prev) =>
      prev.map((f) => (f.id === forumId ? { ...f, isJoined: true, followers: f.followers + 1 } : f))
    );
    showToast('Te has unido al foro.');
  };

  const leaveForum = (forumId: string) => {
    setForums((prev) =>
      prev.map((f) => (f.id === forumId ? { ...f, isJoined: false, followers: Math.max(0, f.followers - 1) } : f))
    );
    showToast('Has salido del foro.');
  };

  const createPost = (data: Omit<Post, 'id' | 'timestamp' | 'likes' | 'dislikes' | 'comments'>) => {
    const newPost: Post = {
      ...data,
      id: Date.now(),
      timestamp: 'Justo ahora',
      likes: 0,
      dislikes: 0,
      comments: []
    };
    setPosts((prev) => [newPost, ...prev]);
    showToast('Publicación compartida.');
  };

  const reactPost = (postId: number, type: 'like' | 'dislike') => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        if (p.myReaction === type) {
          return {
            ...p,
            myReaction: null,
            likes: type === 'like' ? p.likes - 1 : p.likes,
            dislikes: type === 'dislike' ? p.dislikes - 1 : p.dislikes
          };
        }
        const wasLiked = p.myReaction === 'like';
        const wasDisliked = p.myReaction === 'dislike';
        return {
          ...p,
          myReaction: type,
          likes: type === 'like' ? p.likes + 1 : wasLiked ? p.likes - 1 : p.likes,
          dislikes: type === 'dislike' ? p.dislikes + 1 : wasDisliked ? p.dislikes - 1 : p.dislikes
        };
      })
    );
  };

  const votePoll = (postId: number, option: 'option1' | 'option2') => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId || p.pollVoters?.includes(currentUser || '')) return p;
        const currentVotes = p.pollVotes || { option1: 0, option2: 0 };
        return {
          ...p,
          pollVotes: {
            ...currentVotes,
            [option]: currentVotes[option] + 1
          },
          pollVoters: [...(p.pollVoters || []), currentUser || '']
        };
      })
    );
    showToast('Tu voto ha sido registrado.');
  };

  const addComment = (postId: number, text: string) => {
    if (!text.trim()) return;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: [
            ...p.comments,
            {
              author: currentUser || 'Usuario',
              text: text.trim(),
              timestamp: 'Justo ahora'
            }
          ]
        };
      })
    );
  };

  const createFanClub = (data: Omit<FanClub, 'id' | 'members' | 'privateForums'>) => {
    const newClub: FanClub = {
      ...data,
      id: 'fc-' + Date.now(),
      members: [currentUser || 'Usuario'],
      privateForums: []
    };
    setFanClubs((prev) => [newClub, ...prev]);
    showToast(`Club de fans "${newClub.name}" fundado con éxito.`);
  };

  const joinFanClub = (clubId: string) => {
    setFanClubs((prev) =>
      prev.map((c) => {
        if (c.id !== clubId) return c;
        if (c.members.includes(currentUser || '')) return c;
        return { ...c, members: [...c.members, currentUser || ''] };
      })
    );
    showToast('Te has unido al club de fans.');
  };

  const leaveFanClub = (clubId: string) => {
    setFanClubs((prev) =>
      prev.map((c) => {
        if (c.id !== clubId) return c;
        return { ...c, members: c.members.filter((m) => m !== currentUser) };
      })
    );
    // Leaving club removes tag strictly
    setUserProfile((prev) => ({
      ...prev,
      displayedFandomTags: (prev.displayedFandomTags || []).filter((t) => t !== clubId)
    }));
    if (currentUser) {
      fetch('/api/user/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser,
          displayedFandomTags: (userProfile.displayedFandomTags || []).filter((t) => t !== clubId)
        })
      }).catch(() => {});
    }
    showToast('Has dejado el club de fans y se retiró el Fandom Tag de tu perfil.');
  };

  const emptyFanClubMembers = (clubId: string) => {
    setFanClubs((prev) =>
      prev.map((c) => (c.id === clubId ? { ...c, members: [c.manager] } : c))
    );
    showToast('Miembros del club vaciados.');
  };

  const updateFanClub = (clubId: string, patch: Partial<FanClub>) => {
    setFanClubs((prev) =>
      prev.map((c) => (c.id === clubId ? { ...c, ...patch } : c))
    );
    showToast('Club de fans actualizado.');
  };

  const addPrivateForumToClub = (clubId: string, forumName: string) => {
    if (!forumName.trim()) return false;
    setFanClubs((prev) =>
      prev.map((c) =>
        c.id === clubId ? { ...c, privateForums: [...c.privateForums, forumName.trim()] } : c
      )
    );
    showToast(`Foro privado "${forumName}" añadido al club.`);
    return true;
  };

  const deletePrivateForumFromClub = (clubId: string, index: number) => {
    setFanClubs((prev) =>
      prev.map((c) => {
        if (c.id !== clubId) return c;
        const copy = [...c.privateForums];
        copy.splice(index, 1);
        return { ...c, privateForums: copy };
      })
    );
  };

  const claimClubExclusiveItem = (clubId: string, itemId: string): boolean => {
    if (!currentUser) {
      showToast('Inicia sesión para reclamar este producto.');
      return false;
    }
    const club = fanClubs.find((c) => c.id === clubId);
    if (!club) {
      showToast('Club de fans no encontrado.');
      return false;
    }
    if (!club.members.includes(currentUser)) {
      showToast('Debes ser miembro oficial de este club de fans para reclamar este beneficio.');
      return false;
    }
    const item = (club.exclusiveItems || []).find((it) => it.id === itemId);
    if (!item) {
      showToast('Producto exclusivo no encontrado.');
      return false;
    }
    if (!item.isFreeForMembers) {
      showToast('Este artículo no es gratuito. Debes adquirirlo con monedas.');
      return false;
    }
    if (item.claimedBy && item.claimedBy.includes(currentUser)) {
      showToast('Ya has reclamado este artículo exclusivo.');
      return false;
    }

    if (item.category === 'photocard') {
      const newPc: UserPhotocard = {
        id: 'upc-club-' + Date.now(),
        photocardId: item.id,
        name: item.name,
        artist: club.artists[0] || club.name,
        image: item.image,
        backImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
        rarity: 'ultra_rara',
        albumName: `Exclusivo Club ${club.name}`,
        isHolographic: item.isHolographic ?? true,
        acquiredAt: new Date().toISOString()
      };
      setUserPhotocards((prev) => [newPc, ...prev]);
    } else if (item.category === 'frame') {
      setUserProfile((prev) => ({
        ...prev,
        ownedFrames: Array.from(new Set([...(prev.ownedFrames || []), item.id])),
        transparentFrame: item.image,
        customTransparentFrame: item.image
      }));
    }

    const newInv: InventoryItem = {
      id: 'inv-club-' + Date.now(),
      productId: item.id,
      productName: item.name,
      name: item.name,
      description: item.description || `Exclusivo de ${club.name}`,
      image: item.image,
      category: item.category === 'frame' ? 'frame' : item.category === 'photocard' ? 'photocard' : 'merch',
      purchasedAt: new Date().toISOString(),
      pricePaid: 0,
      currencyUsed: 'coins',
      isResellable: false
    };
    setInventory((prev) => [newInv, ...prev]);

    setFanClubs((prev) =>
      prev.map((c) => {
        if (c.id !== clubId) return c;
        const updated = (c.exclusiveItems || []).map((it) => {
          if (it.id !== itemId) return it;
          return {
            ...it,
            claimedBy: [...(it.claimedBy || []), currentUser]
          };
        });
        return { ...c, exclusiveItems: updated };
      })
    );

    showToast(`¡Has reclamado "${item.name}" gratis por ser miembro del club!`);
    return true;
  };

  const buyClubExclusiveItem = (clubId: string, itemId: string): boolean => {
    if (!currentUser) {
      showToast('Inicia sesión para comprar este producto.');
      return false;
    }
    const club = fanClubs.find((c) => c.id === clubId);
    if (!club) {
      showToast('Club de fans no encontrado.');
      return false;
    }
    if (!club.members.includes(currentUser)) {
      showToast('Debes ser miembro oficial de este club de fans para adquirir productos exclusivos.');
      return false;
    }
    const item = (club.exclusiveItems || []).find((it) => it.id === itemId);
    if (!item) {
      showToast('Producto exclusivo no encontrado.');
      return false;
    }

    if (userProfile.coins < item.priceCoins) {
      showToast(`Monedas insuficientes. Cuesta ${item.priceCoins} Coins (tienes ${userProfile.coins}).`);
      return false;
    }

    addCoins(-item.priceCoins);

    if (item.category === 'photocard') {
      const newPc: UserPhotocard = {
        id: 'upc-club-' + Date.now(),
        photocardId: item.id,
        name: item.name,
        artist: club.artists[0] || club.name,
        image: item.image,
        backImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
        rarity: 'ultra_rara',
        albumName: `Exclusivo Club ${club.name}`,
        isHolographic: item.isHolographic ?? true,
        acquiredAt: new Date().toISOString()
      };
      setUserPhotocards((prev) => [newPc, ...prev]);
    } else if (item.category === 'frame') {
      setUserProfile((prev) => ({
        ...prev,
        ownedFrames: Array.from(new Set([...(prev.ownedFrames || []), item.id])),
        transparentFrame: item.image,
        customTransparentFrame: item.image
      }));
    }

    const newInv: InventoryItem = {
      id: 'inv-club-' + Date.now(),
      productId: item.id,
      productName: item.name,
      name: item.name,
      description: item.description || `Exclusivo de ${club.name}`,
      image: item.image,
      category: item.category === 'frame' ? 'frame' : item.category === 'photocard' ? 'photocard' : 'merch',
      purchasedAt: new Date().toISOString(),
      pricePaid: item.priceCoins,
      currencyUsed: 'coins',
      isResellable: true
    };
    setInventory((prev) => [newInv, ...prev]);

    showToast(`¡Has adquirido "${item.name}" con éxito por ${item.priceCoins} Coins!`);
    return true;
  };

  const addClubExclusiveItem = (
    clubId: string,
    itemData: Omit<FanClubExclusiveItem, 'id' | 'clubId' | 'claimedBy'>
  ) => {
    const newItem: FanClubExclusiveItem = {
      ...itemData,
      id: 'ex-item-' + Date.now(),
      clubId,
      claimedBy: []
    };
    setFanClubs((prev) =>
      prev.map((c) => {
        if (c.id !== clubId) return c;
        return {
          ...c,
          exclusiveItems: [...(c.exclusiveItems || []), newItem]
        };
      })
    );
    showToast(`Artículo "${newItem.name}" agregado a la Tienda Exclusiva del Club.`);
  };

  // Bias System Methods (Hasta 3 artistas por grupo: Bias, Bias Wrecker, Least Bias)
  const setArtistBias = (clubId: string, artistUsername: string, role: BiasRole): { success: boolean; message: string } => {
    const club = fanClubs.find((c) => c.id === clubId);
    const clubName = club?.name || 'Club de Fans';
    const artistProf = getProfileOf(artistUsername);

    const clubBiases = userBiases.filter((b) => b.clubId === clubId);
    const isAlreadyInClub = clubBiases.some((b) => b.artistUsername === artistUsername);

    // Rule: "Se pueden tener como bias hasta 3 artista de cada grupo."
    if (!isAlreadyInClub && clubBiases.length >= 3) {
      const msg = `Límite alcanzado: Ya tienes 3 artistas seleccionados en ${clubName} (máximo permitido).`;
      showToast(msg);
      return { success: false, message: msg };
    }

    const roleLabel =
      role === 'bias' ? 'Bias ⭐' : role === 'bias_wrecker' ? 'Bias Wrecker 🔥' : 'Least Bias 💫';

    // If another artist in this club already has this role, remove/vacate that previous role assignment
    let updated = userBiases.map((b) => {
      if (b.clubId === clubId && b.role === role && b.artistUsername !== artistUsername) {
        return null;
      }
      return b;
    }).filter(Boolean) as UserBias[];

    // Remove this artist's prior role in this club if reassigned
    updated = updated.filter((b) => !(b.clubId === clubId && b.artistUsername === artistUsername));

    const newBias: UserBias = {
      artistUsername,
      artistNickname: artistProf.nickname || artistUsername,
      artistAvatar: artistProf.avatar || DEFAULT_AVATAR,
      clubId,
      clubName,
      role,
      assignedAt: new Date().toISOString()
    };

    const nextBiases = [...updated, newBias];
    setUserBiases(nextBiases);
    setUserProfile((prev) => ({
      ...prev,
      userBiases: nextBiases
    }));

    const successMsg = `¡${artistProf.nickname || artistUsername} ahora es tu ${roleLabel} en ${clubName}!`;
    showToast(successMsg);
    return { success: true, message: successMsg };
  };

  const removeArtistBias = (clubId: string, artistUsername: string) => {
    const nextBiases = userBiases.filter((b) => !(b.clubId === clubId && b.artistUsername === artistUsername));
    setUserBiases(nextBiases);
    setUserProfile((prev) => ({
      ...prev,
      userBiases: nextBiases
    }));
    showToast('Artista retirado de tus biases.');
  };

  const getBiasesForClub = (clubId: string): UserBias[] => {
    return userBiases.filter((b) => b.clubId === clubId);
  };

  const sendChatMessage = (
    toUsername: string,
    text: string,
    isFanMessage = false,
    gift?: { name: string; icon: string; coinValue: number },
    attachmentUrl?: string,
    replyToId?: string,
    replyToText?: string
  ) => {
    if (!currentUser) return;
    const msg: ChatMessage = {
      id: 'm-' + Date.now(),
      from: currentUser,
      to: toUsername,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFanMessage,
      gift,
      attachmentUrl: attachmentUrl || undefined,
      attachmentType: attachmentUrl ? 'link' : undefined,
      replyToId: replyToId || undefined,
      replyToText: replyToText || undefined,
      status: 'sent'
    };

    const key1 = `${currentUser}_${toUsername}`;
    const key2 = `${toUsername}_${currentUser}`;

    setChats((prev) => {
      const existingKey = prev[key1] ? key1 : prev[key2] ? key2 : key1;
      const history = prev[existingKey] || [];
      return { ...prev, [existingKey]: [...history, msg] };
    });
    showToast('Mensaje enviado.');
  };

  const editChatMessage = async (messageId: string, newText: string): Promise<boolean> => {
    if (!currentUser || !newText.trim()) return false;
    try {
      const res = await fetch(`/api/chats/message/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, newText: newText.trim() })
      });
      if (res.ok) {
        setChats((prev) => {
          const next = { ...prev };
          for (const key of Object.keys(next)) {
            next[key] = next[key].map((m) =>
              m.id === messageId ? { ...m, text: newText.trim(), isEdited: true, editedAt: new Date().toISOString() } : m
            );
          }
          return next;
        });
        showToast('Mensaje editado.');
        return true;
      }
    } catch {
      showToast('Error al editar mensaje.');
    }
    return false;
  };

  const deleteChatMessage = async (messageId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch(`/api/chats/message/${messageId}?username=${encodeURIComponent(currentUser)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setChats((prev) => {
          const next = { ...prev };
          for (const key of Object.keys(next)) {
            next[key] = next[key].filter((m) => m.id !== messageId);
          }
          return next;
        });
        showToast('Mensaje eliminado.');
        return true;
      }
    } catch {
      showToast('Error al eliminar mensaje.');
    }
    return false;
  };

  const toggleMuteConversation = (targetUsername: string) => {
    const currentMuted = new Set(userProfile.mutedConversations || []);
    let isNowMuted = false;
    if (currentMuted.has(targetUsername)) {
      currentMuted.delete(targetUsername);
    } else {
      currentMuted.add(targetUsername);
      isNowMuted = true;
    }
    const updated = Array.from(currentMuted);
    setUserProfile((prev) => ({ ...prev, mutedConversations: updated }));
    showToast(isNowMuted ? `Conversación con @${targetUsername} silenciada.` : `Conversación con @${targetUsername} reactivada.`);
    fetch('/api/user/customization', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: currentUser, mutedConversations: updated })
    }).catch(() => {});
  };

  // Group chats
  const createChatGroup = (
    name: string,
    duration: 'temporary' | 'permanent',
    isAdvanced: boolean,
    icon?: string
  ) => {
    const newGroup: ChatGroup = {
      id: 'grp-' + Date.now(),
      name,
      icon,
      creator: currentUser || 'Usuario',
      isAdvanced,
      duration,
      members: [currentUser || 'Usuario'],
      categories: isAdvanced
        ? [
            {
              id: 'cat-main',
              name: 'GENERAL',
              subgroups: [
                { id: 'sub-ann', name: 'anuncios-oficiales', type: 'announcement', messages: [] },
                { id: 'sub-gen', name: 'chat-general', type: 'general', messages: [] }
              ]
            }
          ]
        : [],
      messages: []
    };
    setChatGroups((prev) => [newGroup, ...prev]);
    showToast(`Grupo "${name}" creado exitosamente.`);
  };

  const addCategoryToGroup = (groupId: string, categoryName: string) => {
    setChatGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          categories: [
            ...g.categories,
            { id: 'cat-' + Date.now(), name: categoryName.toUpperCase(), subgroups: [] }
          ]
        };
      })
    );
    showToast(`Categoría "${categoryName}" añadida.`);
  };

  const addSubgroupToCategory = (
    groupId: string,
    categoryId: string,
    name: string,
    type: ChatSubgroupType,
    icon?: string
  ) => {
    setChatGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          categories: g.categories.map((cat) => {
            if (cat.id !== categoryId) return cat;
            return {
              ...cat,
              subgroups: [
                ...cat.subgroups,
                { id: 'sub-' + Date.now(), name: name.toLowerCase().replace(/\s+/g, '-'), type, icon, messages: [] }
              ]
            };
          })
        };
      })
    );
    showToast(`Canal "#${name}" creado.`);
  };

  const sendGroupMessage = (
    groupId: string,
    text: string,
    subgroupId?: string,
    attachment?: string
  ) => {
    if (!currentUser) return;
    const msg = {
      id: 'gmsg-' + Date.now(),
      sender: currentUser,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment
    };
    setChatGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        if (!g.isAdvanced || !subgroupId) {
          return { ...g, messages: [...g.messages, msg] };
        }
        return {
          ...g,
          categories: g.categories.map((cat) => ({
            ...cat,
            subgroups: cat.subgroups.map((sub) =>
              sub.id === subgroupId ? { ...sub, messages: [...sub.messages, msg] } : sub
            )
          }))
        };
      })
    );
  };

  const setSubgroupPinnedWeeklyMessage = (groupId: string, subgroupId: string, message: string) => {
    setChatGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          categories: g.categories.map((cat) => ({
            ...cat,
            subgroups: cat.subgroups.map((sub) =>
              sub.id === subgroupId ? { ...sub, pinnedWeeklyMessage: message } : sub
            )
          }))
        };
      })
    );
    showToast('Mensaje semanal fijado.');
  };

  const submitTraineeTask = (groupId: string, subgroupId: string, taskTitle: string, attachmentUrl: string) => {
    if (!currentUser) return;
    const msg = {
      id: 'task-' + Date.now(),
      sender: currentUser,
      text: `Entregó la tarea: "${taskTitle}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: attachmentUrl,
      taskSubmission: { status: 'submitted' as const }
    };
    setChatGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          categories: g.categories.map((cat) => ({
            ...cat,
            subgroups: cat.subgroups.map((sub) =>
              sub.id === subgroupId ? { ...sub, messages: [...sub.messages, msg] } : sub
            )
          }))
        };
      })
    );
    showToast('¡Tarea enviada para revisión del staff!');
  };

  const gradeTraineeTask = (
    groupId: string,
    subgroupId: string,
    messageId: string,
    grade: number,
    coinsAwarded: number,
    feedback: string
  ) => {
    setChatGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          categories: g.categories.map((cat) => ({
            ...cat,
            subgroups: cat.subgroups.map((sub) => {
              if (sub.id !== subgroupId) return sub;
              return {
                ...sub,
                messages: sub.messages.map((m) => {
                  if (m.id !== messageId) return m;
                  return {
                    ...m,
                    taskSubmission: {
                      status: 'graded' as const,
                      grade,
                      pointsAwarded: 100,
                      coinsAwarded,
                      feedback
                    }
                  };
                })
              };
            })
          }))
        };
      })
    );
    showToast(`Tarea calificada (${grade}/3). Se otorgaron ${coinsAwarded} Coins.`);
  };

  const TRAINEE_RANKS_ORDER = [
    'trainee -c', 'trainee c', 'trainee +c',
    'trainee -b', 'trainee b', 'trainee +b',
    'trainee -a', 'trainee a', 'trainee +a',
    'trainee -s', 'trainee s', 'trainee +s',
    'trainee -ss', 'trainee ss', 'trainee +ss'
  ];

  const promoteMemberInGroup = (
    groupId: string,
    subgroupId: string,
    memberUsername: string,
    newLevel: string
  ) => {
    const targetProfile = allProfiles[memberUsername] || (memberUsername === currentUser ? userProfile : null);
    const currentRank = (targetProfile?.traineeRank || targetProfile?.idCard?.rank || 'trainee c').toLowerCase();
    const currentIndex = TRAINEE_RANKS_ORDER.indexOf(currentRank);
    const newIndex = TRAINEE_RANKS_ORDER.indexOf(newLevel.toLowerCase());

    const isDemotion = newIndex !== -1 && currentIndex !== -1 && newIndex < currentIndex;

    const promoMsgText = isDemotion
      ? `📉 Notificación de Evaluación: @${memberUsername} ha descendido al rango "${newLevel}". ¡No te rindas! Cada tropiezo en el camino es una oportunidad para pulir tu talento y brillar con más fuerza. La perseverancia forja a las grandes estrellas del escenario.`
      : `🎉 ¡Felicitaciones a @${memberUsername}! Ha ascendido de nivel a: "${newLevel}". Tu disciplina y talento te acercan al debut.`;

    const promoMsg = {
      id: 'promo-' + Date.now(),
      sender: 'SISTEMA OFICIAL YM-ki',
      text: promoMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      promotionInfo: {
        promotedMember: memberUsername,
        newLevel,
        isDemotion
      }
    };

    setChatGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          categories: g.categories.map((cat) => ({
            ...cat,
            subgroups: cat.subgroups.map((sub) =>
              sub.id === subgroupId ? { ...sub, messages: [...sub.messages, promoMsg] } : sub
            )
          }))
        };
      })
    );

    // Send persistent notification for the user
    const newNotification: NotificationItem = {
      id: 'notif-rank-' + Date.now(),
      recipient: memberUsername,
      recipientUsername: memberUsername,
      title: isDemotion ? 'Actualización de Rango en Evaluación' : '¡Ascenso de Rango Oficial!',
      message: isDemotion
        ? `Has descendido al rango "${newLevel}". ¡No te desanimes! Cada tropiezo es un paso hacia tu debut. La perseverancia y el esfuerzo diario forjan a las mejores estrellas.`
        : `¡Felicitaciones! Has ascendido oficialmente al rango "${newLevel}". Tu esfuerzo constante está rindiendo frutos.`,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString(),
      read: false,
      type: 'trainee_evaluation',
      linkSection: 'idcard'
    };
    setNotifications((prev) => [newNotification, ...prev]);

    // Update user profile rank & idCard
    const updatedTraineeRank = newLevel as any;
    if (memberUsername === currentUser) {
      setUserProfile((prev) => ({
        ...prev,
        traineeRank: updatedTraineeRank,
        idCard: prev.idCard ? { ...prev.idCard, rank: updatedTraineeRank } : undefined
      }));
    }

    setAllProfiles((prev) => {
      const existing = prev[memberUsername] || defaultProfile(memberUsername);
      return {
        ...prev,
        [memberUsername]: {
          ...existing,
          traineeRank: updatedTraineeRank,
          idCard: existing.idCard ? { ...existing.idCard, rank: updatedTraineeRank } : undefined
        }
      };
    });

    // Sync to backend
    apiFetch(`/api/users/${encodeURIComponent(memberUsername)}/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        traineeRank: updatedTraineeRank,
        idCardRank: updatedTraineeRank
      })
    }).catch(() => {});

    showToast(isDemotion ? `Rango de @${memberUsername} actualizado a ${newLevel}.` : `¡@${memberUsername} ha sido ascendido a ${newLevel}!`);
  };

  // Store: add product
  const addProductToStore = (data: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...data,
      id: 'prod-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Producto "${newProduct.name}" publicado exitosamente.`);
    return true;
  };

  // Store: delete product (admins or product creator/reseller)
  const deleteProduct = (productId: string): boolean => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return false;
    const isOwnerOrAdmin = isPrivileged() || userProfile.accountType === 'admin' || userProfile.isFounder || prod.createdBy === currentUser || prod.resellerUsername === currentUser;
    if (!isOwnerOrAdmin) {
      showToast('Solo administradores o el creador del producto pueden eliminarlo.');
      return false;
    }
    const deleted = load<string[]>('ym_deleted_products', []);
    if (!deleted.includes(productId)) {
      save('ym_deleted_products', [...deleted, productId]);
    }
    const updatedProducts = products.filter((p) => p.id !== productId);
    setProducts(updatedProducts);
    save('ym_products', updatedProducts);
    apiFetch(`/api/products/${encodeURIComponent(productId)}`, { method: 'DELETE' }).catch(() => {});
    // If it was an outlet product, unmark from inventory
    if (prod.isOutlet) {
      setInventory((prev) => {
        const updatedInv = prev.map((item) =>
          item.productId === prod.originalProductId || ('outlet-' + item.id === prod.id)
            ? { ...item, isListedInOutlet: false }
            : item
        );
        save('ym_inventory', updatedInv);
        return updatedInv;
      });
    }
    showToast(`Producto "${prod.name}" eliminado de la tienda.`);
    return true;
  };

  // Store: buy product
  const buyProduct = (productId: string, chosenCurrency?: 'coins' | 'gems') => {
    const product = products.find((p) => p.id === productId);
    if (!product) return false;
    if (product.stockType === 'fixed' && product.stockCount <= 0) {
      showToast('Producto agotado.');
      return false;
    }

    const payWithGems = chosenCurrency === 'gems' || (!chosenCurrency && product.currencyType === 'gems');
    const isUnlimited = isUnlimitedBalance();

    if (!isUnlimited) {
      if (payWithGems) {
        const requiredGems = product.priceGems || Math.ceil(product.priceCoins / 10) || 5;
        if (userProfile.gems < requiredGems) {
          showToast(`Gemas insuficientes (${requiredGems} Gemas requeridas).`);
          return false;
        }
        setUserProfile((prev) => ({ ...prev, gems: prev.gems - requiredGems }));
      } else {
        const requiredCoins = product.priceCoins;
        if (userProfile.coins < requiredCoins) {
          showToast(`Coins insuficientes (${requiredCoins} Coins requeridas).`);
          return false;
        }
        setUserProfile((prev) => ({ ...prev, coins: prev.coins - requiredCoins }));
      }
    }

    if (product.stockType === 'fixed') {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stockCount: p.stockCount - 1 } : p))
      );
    }

    const newItem: InventoryItem = {
      id: 'inv-' + Date.now(),
      productId: product.id,
      productName: product.name,
      image: product.images[0] || DEFAULT_FORUM_AVATAR,
      description: product.description,
      pricePaid: payWithGems ? (product.priceGems || 5) : product.priceCoins,
      purchasedAt: new Date().toISOString(),
      category: product.category
    };
    setInventory((prev) => [newItem, ...prev]);

    // Handle Frame purchase (Unlocks for fans / non-premium)
    if (product.isFrame) {
      setUserProfile((prev) => {
        const owned = prev.ownedFrames || [];
        const newOwned = owned.includes(productId) ? owned : [...owned, productId];
        return {
          ...prev,
          ownedFrames: newOwned,
          selectedFrameId: productId,
          customFrameColor: product.frameConfig?.defaultColor || prev.customFrameColor
        };
      });
      showToast(`¡Has adquirido el marco de perfil "${product.name}"! Ya está equipado en tu foto de perfil.`);
    }

    // Handle Album purchase
    if (product.isAlbum) {
      const newAlbum: UserAlbum = {
        id: 'ualbum-' + Date.now(),
        productId: product.id,
        albumName: product.name,
        albumType: product.albumType || 'full',
        coverImage: product.images[0] || DEFAULT_FORUM_AVATAR,
        associatedArtists: product.associatedArtists || [],
        tracks: product.tracks || [],
        purchasedAt: new Date().toISOString(),
        isPreorder: !!product.isPreorder,
        isOpened: false
      };
      setUserAlbums((prev) => [newAlbum, ...prev]);
      showToast(`¡Has adquirido el álbum "${product.name}"! Encuéntralo en Vitrina > Mis Álbumes.`);
    }

    // Server purchase sync & ledger recording
    if (currentUser) {
      apiFetch('/api/store/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, productId })
      })
        .then(() => fetchLedger())
        .catch(() => {});
      trackMissionActivity('collect_items', 1);
    }

    if (!product.isFrame && !product.isAlbum) {
      showToast(`¡Has comprado "${product.name}" exitosamente!`);
    }
    return true;
  };

  // Outlet: list item (Reseller gets 90% payout on sale)
  const listItemInOutlet = (inventoryItemId: string, resalePrice: number) => {
    const item = inventory.find((i) => i.id === inventoryItemId);
    if (!item) return false;
    if (resalePrice <= 0) {
      showToast('Precio inválido.');
      return false;
    }
    setInventory((prev) =>
      prev.map((i) => (i.id === inventoryItemId ? { ...i, isListedInOutlet: true, outletPrice: resalePrice } : i))
    );
    const outletProd: Product = {
      id: 'outlet-' + item.id,
      name: item.productName + ' [Outlet]',
      description: `Reventa oficial por @${currentUser}. ${item.description}`,
      images: [item.image],
      tags: ['outlet', 'segunda-mano', 'reventa'],
      stockType: 'fixed',
      stockCount: 1,
      associatedArtists: [],
      priceCoins: resalePrice,
      createdBy: currentUser || 'Usuario',
      isOutlet: true,
      resellerUsername: currentUser || 'Usuario',
      originalProductId: item.productId,
      createdAt: new Date().toISOString(),
      category: item.category || 'merch'
    };
    setProducts((prev) => [outletProd, ...prev]);
    showToast(`"${item.productName}" puesto en el Outlet. (Recibirás el 90% de la venta).`);
    return true;
  };

  // Outlet: buy product (seller gets exactly 90% of the sale)
  const buyOutletProduct = (outletProductId: string) => {
    const prod = products.find((p) => p.id === outletProductId);
    if (!prod || !prod.isOutlet || !prod.resellerUsername) return false;
    if (prod.resellerUsername === currentUser) {
      showToast('No puedes comprar tu propio producto.');
      return false;
    }
    if (userProfile.coins < prod.priceCoins) {
      showToast(`Coins insuficientes. Precio: ${prod.priceCoins} Coins.`);
      return false;
    }

    // Buyer pays
    setUserProfile((prev) => ({ ...prev, coins: prev.coins - prod.priceCoins }));

    // Seller receives 90% OF THE PAYOUT
    const seller = prod.resellerUsername;
    const sellerEarnings = Math.floor(prod.priceCoins * 0.90);
    const platformFee = prod.priceCoins - sellerEarnings;

    setAllProfiles((prev) => {
      const sellerProf = prev[seller] || defaultProfile(seller);
      return { ...prev, [seller]: { ...sellerProf, coins: sellerProf.coins + sellerEarnings } };
    });

    // Notify seller
    const sellerNotif: NotificationItem = {
      id: 'notif-outlet-' + Date.now(),
      recipient: seller,
      type: 'system',
      title: '¡Venta en Outlet concretada!',
      message: `@${currentUser} ha adquirido tu artículo "${prod.name}". Has recibido el 90% de la paga (${sellerEarnings.toLocaleString()} Coins, 10% tarifa de plataforma: ${platformFee} Coins).`,
      date: new Date().toISOString(),
      read: false
    };
    setNotifications((prev) => [sellerNotif, ...prev]);

    // Remove from products
    setProducts((prev) => prev.filter((p) => p.id !== outletProductId));

    // Add to buyer inventory
    const newItem: InventoryItem = {
      id: 'inv-' + Date.now(),
      productId: prod.originalProductId || prod.id,
      productName: prod.name.replace(' [Outlet]', '').replace(' [Segunda Mano / Outlet]', ''),
      image: prod.images[0],
      description: prod.description,
      pricePaid: prod.priceCoins,
      purchasedAt: new Date().toISOString(),
      category: prod.category || 'merch'
    };
    setInventory((prev) => [newItem, ...prev]);
    showToast(`¡Has adquirido el producto de @${seller} en el Outlet! (El vendedor recibió su 90%).`);
    return true;
  };

  const toggleShowcaseItem = (inventoryItemId: string) => {
    const currentList = userProfile.showcaseItemIds || [];
    if (currentList.includes(inventoryItemId)) {
      setUserProfile((prev) => ({
        ...prev,
        showcaseItemIds: currentList.filter((id) => id !== inventoryItemId)
      }));
      showToast('Item retirado de tu vitrina.');
      return true;
    } else {
      if (currentList.length >= 5) {
        showToast('Máximo 5 items en tu vitrina de merch.');
        return false;
      }
      setUserProfile((prev) => ({
        ...prev,
        showcaseItemIds: [...currentList, inventoryItemId]
      }));
      showToast('Item destacado en tu vitrina de merch.');
      return true;
    }
  };

  const setMerchPrivate = (isPrivate: boolean) => {
    setUserProfile((prev) => ({ ...prev, isMerchPrivate: isPrivate }));
    showToast(isPrivate ? 'Tu vitrina ahora es privada.' : 'Tu vitrina ahora es pública.');
  };

  // Open album & unbox random photocards
  const openAlbum = (userAlbumId: string): Photocard[] => {
    const userAlbum = userAlbums.find((a) => a.id === userAlbumId);
    if (!userAlbum) return [];
    if (userAlbum.isOpened && userAlbum.unboxedPhotocards?.length) {
      return userAlbum.unboxedPhotocards;
    }

    const prod = products.find((p) => p.id === userAlbum.productId);
    const pool = prod?.photocardsPool && prod.photocardsPool.length > 0
      ? prod.photocardsPool
      : INITIAL_PHOTOCARDS_ECLIPSE;

    const countToPull = prod?.photocardsPerUnbox || (userAlbum.albumType === 'single' ? 1 : userAlbum.albumType === 'mini' ? 2 : 3);
    const pulledCards: Photocard[] = [];
    const poolCopy = [...pool];

    for (let i = 0; i < countToPull; i++) {
      if (poolCopy.length === 0) break;
      const randIdx = Math.floor(Math.random() * poolCopy.length);
      pulledCards.push(poolCopy[randIdx]);
    }

    // Preorder benefits
    if (userAlbum.isPreorder && prod?.preorderBenefitPhotocards?.length) {
      pulledCards.push(...prod.preorderBenefitPhotocards);
    }

    // Convert pulled cards to user photocards collection
    const newCards: UserPhotocard[] = pulledCards.map((pc, idx) => ({
      id: 'upc-' + Date.now() + '-' + idx,
      photocardId: pc.id,
      name: pc.name,
      artist: pc.artist,
      image: pc.image,
      rarity: pc.rarity,
      albumName: userAlbum.albumName,
      isPreorderBenefit: !!pc.isPreorderBenefit,
      acquiredAt: new Date().toISOString()
    }));

    setUserPhotocards((prev) => [...newCards, ...prev]);
    setUserAlbums((prev) =>
      prev.map((a) => (a.id === userAlbumId ? { ...a, isOpened: true, unboxedPhotocards: pulledCards } : a))
    );

    showToast(`¡Álbum abierto! Obtuviste ${pulledCards.length} photocard${pulledCards.length > 1 ? 's' : ''}!`);
    return pulledCards;
  };

  // List photocard in Outlet
  const listPhotocardInOutlet = (userPhotocardId: string, resalePrice: number) => {
    const card = userPhotocards.find((c) => c.id === userPhotocardId);
    if (!card) return false;
    if (resalePrice <= 0) {
      showToast('Ingresa un precio válido en Coins.');
      return false;
    }
    setUserPhotocards((prev) =>
      prev.map((c) => (c.id === userPhotocardId ? { ...c, isListedInOutlet: true, outletPrice: resalePrice } : c))
    );
    const outletProd: Product = {
      id: 'outlet-pc-' + card.id,
      name: `Photocard: ${card.name} [Outlet]`,
      description: `Photocard oficial de ${card.artist} (${card.albumName || 'Álbum'}). Rareza: ${card.rarity}. Revendedor: @${currentUser}.`,
      images: [card.image],
      tags: ['photocard', 'outlet', 'reventa', card.artist.toLowerCase()],
      stockType: 'fixed',
      stockCount: 1,
      associatedArtists: [card.artist],
      priceCoins: resalePrice,
      createdBy: currentUser || 'Usuario',
      isOutlet: true,
      resellerUsername: currentUser || 'Usuario',
      createdAt: new Date().toISOString(),
      category: 'merch'
    };
    setProducts((prev) => [outletProd, ...prev]);
    showToast(`Photocard puesta en el Outlet por ${resalePrice} Coins (Recibirás el 90%: ${Math.floor(resalePrice * 0.90)} Coins).`);
    return true;
  };

  // Gift item to another user
  const giftItemToUser = (targetUsername: string, inventoryItemId: string, note?: string) => {
    const cleanTarget = targetUsername.replace('@', '').trim();
    if (!cleanTarget) {
      showToast('Escribe un nombre de usuario válido.');
      return false;
    }
    if (cleanTarget === currentUser) {
      showToast('No puedes regalarte un artículo a ti mismo.');
      return false;
    }
    const item = inventory.find((i) => i.id === inventoryItemId);
    if (!item) {
      showToast('Artículo no encontrado en tu inventario.');
      return false;
    }

    setInventory((prev) => prev.filter((i) => i.id !== inventoryItemId));

    const notif: NotificationItem = {
      id: 'gift-' + Date.now(),
      recipient: cleanTarget,
      type: 'gift',
      title: '🎁 ¡Has recibido un regalo oficial!',
      message: `@${currentUser} te ha obsequiado "${item.productName}". ${note ? `Mensaje adjunto: "${note}"` : ''}`,
      date: new Date().toISOString(),
      read: false
    };
    setNotifications((prev) => [notif, ...prev]);
    showToast(`¡Artículo regalado a @${cleanTarget} con éxito!`);
    return true;
  };

  // Gift photocard to another user
  const giftPhotocardToUser = (targetUsername: string, userPhotocardId: string, note?: string) => {
    const cleanTarget = targetUsername.replace('@', '').trim();
    if (!cleanTarget) {
      showToast('Escribe un nombre de usuario válido.');
      return false;
    }
    if (cleanTarget === currentUser) {
      showToast('No puedes regalarte una photocard a ti mismo.');
      return false;
    }
    const card = userPhotocards.find((c) => c.id === userPhotocardId);
    if (!card) {
      showToast('Photocard no encontrada.');
      return false;
    }

    setUserPhotocards((prev) => prev.filter((c) => c.id !== userPhotocardId));

    const notif: NotificationItem = {
      id: 'gift-pc-' + Date.now(),
      recipient: cleanTarget,
      type: 'gift',
      title: '🎁 ¡Has recibido una Photocard de regalo!',
      message: `@${currentUser} te ha regalado la photocard "${card.name}". ${note ? `Mensaje: "${note}"` : ''}`,
      date: new Date().toISOString(),
      read: false
    };
    setNotifications((prev) => [notif, ...prev]);
    showToast(`¡Photocard regalada a @${cleanTarget} con éxito!`);
    return true;
  };

  // Magazines (Fashion)
  const createMagazine = (data: Omit<Magazine, 'id' | 'createdAt' | 'likes' | 'likedBy'>) => {
    const newMag: Magazine = {
      ...data,
      id: 'mag-' + Date.now(),
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: []
    };
    setMagazines((prev) => [newMag, ...prev]);
    showToast(`¡Revista "${newMag.title}" publicada en la sección Fashion!`);
  };

  const likeMagazine = (magazineId: string) => {
    if (!currentUser) return;
    setMagazines((prev) =>
      prev.map((m) => {
        if (m.id !== magazineId) return m;
        const alreadyLiked = m.likedBy.includes(currentUser);
        return {
          ...m,
          likes: alreadyLiked ? m.likes - 1 : m.likes + 1,
          likedBy: alreadyLiked ? m.likedBy.filter((u) => u !== currentUser) : [...m.likedBy, currentUser]
        };
      })
    );
  };

  const deleteMagazine = (magazineId: string) => {
    setMagazines((prev) => prev.filter((m) => m.id !== magazineId));
    showToast('Revista eliminada.');
  };

  // Releases (Lanzamientos)
  const createRelease = (data: Omit<Release, 'id' | 'createdAt'>) => {
    const newRel: Release = {
      ...data,
      id: 'rel-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setReleases((prev) => [newRel, ...prev]);
    showToast(`¡Nuevo lanzamiento "${newRel.title}" publicado!`);
  };

  // Awards (Premiaciones)
  const createAwardEvent = (data: Omit<AwardEvent, 'id' | 'createdAt'>) => {
    const newAward: AwardEvent = {
      ...data,
      id: 'award-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setAwards((prev) => [newAward, ...prev]);
    showToast(`¡Premiación "${newAward.title}" inaugurada!`);
  };

  const createAwardCategory = (eventId: string, category: Omit<AwardCategory, 'id'>) => {
    const newCat: AwardCategory = {
      ...category,
      id: 'cat-' + Date.now()
    };
    setAwards((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, categories: [...ev.categories, newCat] } : ev))
    );
    showToast(`Categoría "${newCat.name}" añadida a la premiación.`);
  };

  const deleteAwardEvent = (eventId: string) => {
    const isAllowed = isPrivileged() || userProfile.accountType === 'admin' || userProfile.isFounder || (currentUser && currentUser.toLowerCase().includes('ceo'));
    if (!isAllowed) {
      showToast('Solo administradores pueden eliminar premiaciones.');
      return;
    }
    const deleted = load<string[]>('ym_deleted_award_events', []);
    if (!deleted.includes(eventId)) {
      save('ym_deleted_award_events', [...deleted, eventId]);
    }
    setAwards((prev) => {
      const updated = prev.filter((a) => a.id !== eventId);
      save('ym_awards', updated);
      return updated;
    });
    apiFetch(`/api/awards/${eventId}`, { method: 'DELETE' }).catch(() => {});
    showToast('Premiación eliminada.');
  };

  const deleteAwardCategory = (eventId: string, categoryId: string) => {
    const isAllowed = isPrivileged() || userProfile.accountType === 'admin' || userProfile.isFounder || (currentUser && currentUser.toLowerCase().includes('ceo'));
    if (!isAllowed) {
      showToast('Solo administradores pueden eliminar categorías.');
      return;
    }
    setAwards((prev) => {
      const updated = prev.map((ev) =>
        ev.id === eventId
          ? { ...ev, categories: ev.categories.filter((c) => c.id !== categoryId) }
          : ev
      );
      save('ym_awards', updated);
      return updated;
    });
    apiFetch(`/api/awards/${eventId}/categories/${categoryId}`, { method: 'DELETE' }).catch(() => {});
    showToast('Categoría eliminada de la premiación.');
  };

  const voteAwardNominee = (eventId: string, categoryId: string, nomineeId: string): boolean => {
    if (!currentUser) {
      showToast('Inicia sesión para votar.');
      return false;
    }
    const event = awards.find((e) => e.id === eventId);
    if (!event) return false;
    const category = event.categories.find((c) => c.id === categoryId);
    if (!category) return false;

    const voteKey = `${currentUser}_${categoryId}`;
    const votesCast = userAwardVotes[voteKey] || 0;
    const limit = category.votesLimitPerUser || 1;

    if (votesCast >= limit) {
      showToast(`Has alcanzado el límite de votos para esta categoría (${limit} voto${limit > 1 ? 's' : ''} máx).`);
      return false;
    }

    const nominee = category.nominees.find((n) => n.id === nomineeId);
    if (!nominee) return false;

    setAwards((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? {
              ...ev,
              categories: ev.categories.map((cat) =>
                cat.id === categoryId
                  ? {
                      ...cat,
                      nominees: cat.nominees.map((nom) =>
                        nom.id === nomineeId ? { ...nom, votes: nom.votes + 1 } : nom
                      )
                    }
                  : cat
              )
            }
          : ev
      )
    );

    const updatedTotal = votesCast + 1;
    setUserAwardVotes((prev) => ({ ...prev, [voteKey]: updatedTotal }));
    setUserVotedNominees((prev) => {
      const existing = prev[voteKey] || [];
      return { ...prev, [voteKey]: [...existing, nominee.name] };
    });

    showToast(`¡Voto registrado para ${nominee.name}! (${updatedTotal}/${limit} votos usados)`);
    return true;
  };

  // Auditions
  const submitAudition = (data: Omit<AuditionSubmission, 'id' | 'date' | 'status' | 'evaluated' | 'applicantUsername'>) => {
    const newAud: AuditionSubmission = {
      ...data,
      id: Date.now(),
      applicantUsername: currentUser || 'Aspirante',
      date: new Date().toISOString().slice(0, 10),
      status: 'Sin calificar',
      evaluated: false
    };
    setAuditions((prev) => [newAud, ...prev]);

    const ceoObj = ceosList.find((c) => c.id === data.ceoId);
    const targetAdmin = ceoObj ? ceoObj.username : (firstRegisteredUser || 'admin');

    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      recipient: targetAdmin,
      type: 'audition',
      title: 'Nueva Audición Recibida',
      message: `@${currentUser} ha enviado su postulación a tu despacho para evaluación.`,
      auditionId: newAud.id,
      date: new Date().toISOString(),
      read: false
    };
    setNotifications((prev) => [notif, ...prev]);
    showToast(`¡Audición enviada al ${data.ceoName}! Ha llegado a su bandeja para evaluación.`);
  };

  const evaluateAudition = (
    auditionId: number,
    result: 'trainee' | 'artista' | 'rejected' | 'accepted_staff',
    note?: string
  ) => {
    const aud = auditions.find((a) => a.id === auditionId);
    if (!aud) return;

    let statusText = 'Calificado';
    if (result === 'trainee') statusText = 'Aceptado como Trainee';
    if (result === 'artista') statusText = 'Aceptado como Artista';
    if (result === 'accepted_staff') statusText = 'Aceptado como Staff';
    if (result === 'rejected') statusText = 'Rechazado';

    setAuditions((prev) =>
      prev.map((a) =>
        a.id === auditionId
          ? {
              ...a,
              status: statusText,
              evaluated: true,
              result,
              evaluatorNote: note || ''
            }
          : a
      )
    );

    let generatedCode = '';
    if (result === 'trainee' || result === 'artista') {
      const codePrefix = result === 'artista' ? 'YM-ART' : 'YM-TRN';
      const randDigits = Math.floor(100000 + Math.random() * 900000);
      generatedCode = `${codePrefix}-${randDigits}`;

      const newPassCode: AuditionPassCode = {
        code: generatedCode,
        targetUsername: aud.applicantUsername,
        role: result,
        auditionId: aud.id,
        redeemed: false,
        createdAt: new Date().toISOString()
      };

      setAuditionPassCodes((prev) => [newPassCode, ...prev]);
    }

    const applicantNotif: NotificationItem = {
      id: 'notif-res-' + Date.now(),
      recipient: aud.applicantUsername,
      type: 'audition',
      title: result === 'trainee' || result === 'artista'
        ? `🎉 ¡Audición aprobada como ${result.toUpperCase()}!`
        : 'Resultado de tu Audición',
      message: result === 'trainee' || result === 'artista'
        ? `El ${aud.ceoName} ha aprobado tu audición como ${statusText}. Tu CÓDIGO OFICIAL DE ACTIVACIÓN es: "${generatedCode}". Ingrésalo en tu sección de Configuración para cambiar tu cuenta a modo ${result.toUpperCase()}. ${note ? `Nota del CEO: "${note}"` : ''}`
        : `El ${aud.ceoName} ha calificado tu postulación: "${statusText}". ${note ? `Nota: "${note}"` : ''}`,
      auditionId: aud.id,
      date: new Date().toISOString(),
      read: false
    };
    setNotifications((prev) => [applicantNotif, ...prev]);

    if (generatedCode) {
      showToast(`Audición aprobada. Código generado: "${generatedCode}" enviado a @${aud.applicantUsername}.`);
    } else {
      showToast(`Audición evaluada como "${statusText}".`);
    }
  };

  const redeemRoleCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      showToast('Por favor introduce un código.');
      return { success: false, message: 'Código vacío.' };
    }

    const match = auditionPassCodes.find((c) => c.code.toUpperCase() === cleanCode);
    if (!match) {
      showToast('Código de audición no válido o inexistente.');
      return { success: false, message: 'Código inválido o inexistente.' };
    }

    if (match.redeemed) {
      showToast('Este código ya ha sido canjeado anteriormente.');
      return { success: false, message: 'Este código ya ha sido utilizado.' };
    }

    // Mark code as redeemed
    setAuditionPassCodes((prev) =>
      prev.map((c) => (c.code.toUpperCase() === cleanCode ? { ...c, redeemed: true } : c))
    );

    // Apply role upgrade to current user
    const newRole = match.role;
    const initialCoins = newRole === 'artista' ? 999999 : userProfile.coins;
    const initialGems = newRole === 'artista' ? 9999 : userProfile.gems;

    setUserProfile((prev) => ({
      ...prev,
      accountType: newRole,
      coins: initialCoins,
      gems: initialGems,
      idCard: prev.idCard
        ? {
            ...prev.idCard,
            matricula: prev.idCard.matricula || generateMatricula()
          }
        : {
            pseudonym: prev.nickname,
            age: 20,
            matricula: generateMatricula(),
            faceclaim: prev.avatar,
            cardColor: '#6366f1',
            specialties: ['vocal']
          }
    }));

    if (currentUser) {
      setAllProfiles((prev) => {
        const prof = prev[currentUser] || defaultProfile(currentUser);
        return {
          ...prev,
          [currentUser]: {
            ...prof,
            accountType: newRole,
            coins: initialCoins,
            gems: initialGems
          }
        };
      });
    }

    showToast(`¡Código verificado! Tu cuenta ha cambiado oficialmente a modo: ${newRole.toUpperCase()}.`);
    return { success: true, message: `¡Felicidades! Ahora estás en modo ${newRole.toUpperCase()}.` };
  };

  // Clean ghost posts
  const cleanGhostPosts = () => {
    setPosts((prev) => prev.filter(isRealPost));
    showToast('Publicaciones fantasma depuradas.');
  };

  // Survival Shows Methods
  const createSurvivalShow = (data: Omit<SurvivalShow, 'id' | 'createdAt'>) => {
    const newShow: SurvivalShow = {
      ...data,
      id: 'surv-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setSurvivals((prev) => {
      const updated = [newShow, ...prev];
      save('ym_survivals', updated);
      return updated;
    });
    apiFetch('/api/survivals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newShow)
    }).catch(() => {});
    showToast(`¡Survival "${newShow.title}" creado exitosamente!`);
  };

  const registerToSurvival = (
    survivalId: string,
    participant: Omit<SurvivalParticipant, 'id' | 'survivalId' | 'username' | 'status' | 'votes' | 'voters' | 'createdAt'>
  ): boolean => {
    if (!currentUser) {
      showToast('Inicia sesión para inscribirte.');
      return false;
    }
    const show = survivals.find((s) => s.id === survivalId);
    if (!show) return false;
    if (show.status !== 'open') {
      showToast('Las inscripciones para este survival están cerradas.');
      return false;
    }
    if (show.participants.some((p) => p.username === currentUser)) {
      showToast('Ya estás registrado en este Survival.');
      return false;
    }
    if (show.participants.length >= show.maxParticipants) {
      showToast('El cupo para este survival está completo.');
      return false;
    }

    const newPart: SurvivalParticipant = {
      ...participant,
      id: 'part-' + Date.now(),
      survivalId,
      username: currentUser,
      status: 'approved',
      votes: 0,
      voters: [],
      createdAt: new Date().toISOString()
    };

    setSurvivals((prev) =>
      prev.map((s) =>
        s.id === survivalId ? { ...s, participants: [...s.participants, newPart] } : s
      )
    );

    // Notify survival creator
    const adminNotif: NotificationItem = {
      id: 'notif-surv-' + Date.now(),
      recipient: show.createdBy,
      type: 'audition',
      title: 'Nueva Inscripción a Survival',
      message: `@${currentUser} (${newPart.name}) se ha inscrito a "${show.title}" en especialidad ${newPart.specialty.toUpperCase()}.`,
      date: new Date().toISOString(),
      read: false
    };
    setNotifications((prev) => [adminNotif, ...prev]);

    showToast(`¡Inscripción enviada exitosamente al survival "${show.title}"!`);
    return true;
  };

  const voteSurvivalParticipant = (survivalId: string, participantId: string): boolean => {
    if (!currentUser) {
      showToast('Inicia sesión para votar.');
      return false;
    }
    const show = survivals.find((s) => s.id === survivalId);
    if (!show) return false;
    const part = show.participants.find((p) => p.id === participantId);
    if (!part) return false;
    if (part.voters.includes(currentUser)) {
      showToast('Ya has votado por este aspirante.');
      return false;
    }

    setSurvivals((prev) =>
      prev.map((s) =>
        s.id === survivalId
          ? {
              ...s,
              participants: s.participants.map((p) =>
                p.id === participantId
                  ? { ...p, votes: p.votes + 1, voters: [...p.voters, currentUser] }
                  : p
              )
            }
          : s
      )
    );

    showToast(`¡Voto registrado para ${part.name}!`);
    return true;
  };

  const updateSurvivalParticipantStatus = (
    survivalId: string,
    participantId: string,
    status: SurvivalParticipant['status']
  ) => {
    setSurvivals((prev) =>
      prev.map((s) =>
        s.id === survivalId
          ? {
              ...s,
              participants: s.participants.map((p) =>
                p.id === participantId ? { ...p, status } : p
              )
            }
          : s
      )
    );
    showToast(`Estado del participante actualizado.`);
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const submitTradeOffer = (
    targetUser: string,
    offeredItemId: string,
    requestedItemId: string,
    note: string
  ) => {
    const off = inventory.find((i) => i.id === offeredItemId);
    if (!off) return false;
    const newOffer: TradeOffer = {
      id: 'tr-' + Date.now(),
      fromUser: currentUser || 'Usuario',
      toUser: targetUser,
      offeredItemId,
      offeredItemName: off.productName,
      offeredItemImage: off.image,
      requestedItemId,
      requestedItemName: 'Item de ' + targetUser,
      note,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setTradeOffers((prev) => [newOffer, ...prev]);
    showToast(`¡Solicitud de trade enviada a @${targetUser}!`);
    return true;
  };

  const respondToTradeOffer = (offerId: string, response: 'accepted' | 'declined') => {
    setTradeOffers((prev) =>
      prev.map((offer) =>
        offer.id === offerId
          ? { ...offer, status: response }
          : offer
      )
    );
    showToast(response === 'accepted' ? '¡Intercambio aceptado con éxito!' : 'Oferta de intercambio rechazada.');
  };

  // Partners methods
  const addPartner = async (data: Omit<PartnerCompany, 'id' | 'createdAt'>) => {
    const newP: PartnerCompany = {
      ...data,
      id: 'partner-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setPartners((prev) => [...prev, newP]);
    try {
      await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newP)
      });
    } catch (e) {}
  };

  const updatePartner = async (id: string, patch: Partial<PartnerCompany>) => {
    setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p)));
    try {
      await fetch(`/api/partners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
    } catch (e) {}
  };

  const deletePartner = async (id: string) => {
    setPartners((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/partners/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  // Charts methods
  const addChartEntry = async (data: Omit<ChartEntry, 'id' | 'createdAt'>) => {
    const newE: ChartEntry = {
      ...data,
      id: 'chart-' + Date.now()
    };
    setCharts((prev) => [...prev, newE]);
    try {
      await fetch('/api/charts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newE)
      });
    } catch (e) {}
  };

  const updateChartEntry = async (id: string, patch: Partial<ChartEntry>) => {
    setCharts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    try {
      await fetch(`/api/charts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
    } catch (e) {}
  };

  const deleteChartEntry = async (id: string) => {
    setCharts((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/charts/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  // Product Reviews methods
  const addProductReview = async (productId: string, rating: number, comment: string) => {
    if (!currentUser) {
      showToast('Inicia sesión para dejar una reseña.');
      return;
    }
    const isVerified = inventory.some((item) => item.productId === productId);
    const newRev: ProductReview = {
      id: 'rev-' + Date.now(),
      productId,
      username: currentUser,
      nickname: userProfile.nickname || currentUser,
      avatar: userProfile.avatar || DEFAULT_AVATAR,
      rating,
      comment,
      verifiedBuyer: isVerified,
      createdAt: new Date().toISOString()
    };

    setProductReviews((prev) => {
      const existing = prev[productId] || [];
      const filtered = existing.filter((r) => r.username.toLowerCase() !== currentUser.toLowerCase());
      return {
        ...prev,
        [productId]: [newRev, ...filtered]
      };
    });

    try {
      await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser,
          rating,
          comment
        })
      });
    } catch (e) {}
    showToast('¡Reseña publicada con éxito!');
  };

  const deleteProductReview = async (productId: string, reviewId: string) => {
    setProductReviews((prev) => {
      const existing = prev[productId] || [];
      return {
        ...prev,
        [productId]: existing.filter((r) => r.id !== reviewId)
      };
    });
    try {
      await fetch(`/api/products/${productId}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterUsername: currentUser })
      });
    } catch (e) {}
    showToast('Reseña eliminada.');
  };

  // Button theme customization
  const updateButtonTheme = (patch: Partial<ButtonThemeConfig>) => {
    setButtonThemeState((prev) => {
      const updated = { ...prev, ...patch };
      save('ym_button_theme', updated);
      applyThemeToDocument(primaryButtonColor, updated);
      if (currentUser) {
        updateProfile({ buttonTheme: updated });
      }
      return updated;
    });
    showToast('Personalización de botones aplicada a toda la plataforma.');
  };

  // Super Admin delegations & requests
  const delegateAdminPermissions = async (targetAdmin: string, perms: AdminDelegations) => {
    setAdminDelegations((prev) => ({ ...prev, [targetAdmin]: perms }));
    setAdminAuditLog((prev) => [
      {
        id: 'audit-' + Date.now(),
        adminUsername: currentUser || 'Admin',
        action: 'DELEGATE_PERMISSIONS',
        targetUser: targetAdmin,
        details: `Permisos actualizados para @${targetAdmin}`,
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);
    try {
      await fetch('/api/admin/delegations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterUsername: currentUser,
          targetAdminUsername: targetAdmin,
          permissions: perms
        })
      });
    } catch (e) {}
    showToast(`Permisos delegados guardados para @${targetAdmin}`);
  };

  const submitUserRoleRequest = async (requestedRole: string, reason: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser,
          requestedRole,
          reason
        })
      });
      const data = await res.json();
      if (data.success && data.request) {
        setUserRequests((prev) => [data.request, ...prev]);
        showToast('Solicitud enviada al Administrador Principal.');
      }
    } catch (e) {
      showToast('Error al enviar la solicitud.');
    }
  };

  const reviewUserRoleRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reviewerUsername: currentUser
        })
      });
      const data = await res.json();
      if (data.success) {
        setUserRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r))
        );
        if (data.allProfiles) {
          setAllProfiles(data.allProfiles);
        }
        showToast(`Solicitud ${action === 'approve' ? 'aprobada' : 'rechazada'}.`);
      } else if (data.error) {
        showToast(data.error);
      }
    } catch (e) {
      showToast('Error de conexión.');
    }
  };

  // Notifications
  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.recipient === currentUser ? { ...n, read: true } : n))
    );
    showToast('Todas las notificaciones marcadas como leídas.');
  };

  const toggleNotificationPreference = (cat: string) => {
    setNotificationPreferences((prev) => {
      const updated = { ...prev, [cat]: !prev[cat] };
      save('ym_notif_prefs', updated);
      return updated;
    });
  };

  // Survival Shows Stages & Rondas Methods
  const advanceSurvivalStage = (survivalId: string, nextStage: SurvivalStage) => {
    setSurvivals((prev) =>
      prev.map((s) => (s.id === survivalId ? { ...s, stage: nextStage } : s))
    );
    showToast(`Etapa del survival actualizada a: ${nextStage.toUpperCase()}`);
  };

  const submitSurvivalApplication = (survivalId: string, responses: Record<string, string>): boolean => {
    if (!currentUser) {
      showToast('Inicia sesión para postularte.');
      return false;
    }
    const show = survivals.find((s) => s.id === survivalId);
    if (!show) return false;
    if (show.stage !== 'applications' && show.status !== 'open') {
      showToast('La recolección de aspirantes está cerrada.');
      return false;
    }
    const apps = show.applications || [];
    if (apps.some((a) => a.applicantUsername === currentUser)) {
      showToast('Ya has enviado tu solicitud para este survival.');
      return false;
    }
    if ((show.participants || []).length >= (show.maxParticipants || 40)) {
      showToast('Se ha alcanzado el límite máximo de aspirantes.');
      return false;
    }

    const newApp: SurvivalApplication = {
      id: 'app-' + Date.now(),
      survivalId,
      applicantUsername: currentUser,
      applicantNickname: userProfile.nickname || currentUser,
      applicantAvatar: userProfile.avatar || DEFAULT_AVATAR,
      responses,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    setSurvivals((prev) =>
      prev.map((s) =>
        s.id === survivalId
          ? { ...s, applications: [newApp, ...(s.applications || [])] }
          : s
      )
    );

    // Notify creator
    const notif: NotificationItem = {
      id: 'notif-app-' + Date.now(),
      recipient: show.createdBy,
      type: 'survival',
      category: 'survival',
      title: '📋 Nueva Solicitud de Aspirante',
      message: `@${currentUser} ha completado y enviado el formulario para "${show.title}".`,
      date: new Date().toISOString(),
      read: false
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast('¡Formulario enviado con éxito! El creador revisará tu solicitud.');
    return true;
  };

  const reviewSurvivalApplication = (survivalId: string, applicationId: string, status: 'accepted' | 'rejected' | 'shortlist') => {
    const show = survivals.find((s) => s.id === survivalId);
    if (!show) return;
    const targetApp = (show.applications || []).find((a) => a.id === applicationId);
    if (!targetApp) return;

    targetApp.status = status;

    let updatedParticipants = show.participants || [];
    if (status === 'accepted' && !updatedParticipants.some((p) => p.username === targetApp.applicantUsername)) {
      const applicantProf = allProfiles[targetApp.applicantUsername] || defaultProfile(targetApp.applicantUsername);
      const newPart: SurvivalParticipant = {
        id: 'part-' + Date.now(),
        survivalId,
        username: targetApp.applicantUsername,
        name: applicantProf.nickname || targetApp.applicantNickname,
        age: applicantProf.idCard?.age || 20,
        specialty: applicantProf.idCard?.specialties?.[0] || 'all_rounder',
        auditionMedia: targetApp.responses['audition_media'] || targetApp.responses['media'] || applicantProf.avatar,
        motto: targetApp.responses['motto'] || 'Aspirante oficial de YM-ki Records.',
        status: 'approved',
        votes: 0,
        voters: [],
        createdAt: new Date().toISOString()
      };
      updatedParticipants = [...updatedParticipants, newPart];
    }

    setSurvivals((prev) => {
      const nextShows = prev.map((s) =>
        s.id === survivalId
          ? {
              ...s,
              applications: (s.applications || []).map((a) =>
                a.id === applicationId ? { ...a, status } : a
              ),
              participants: updatedParticipants
            }
          : s
      );
      save('ym_survivals', nextShows);
      apiFetch(`/api/survivals/${encodeURIComponent(survivalId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applications: nextShows.find((s) => s.id === survivalId)?.applications,
          participants: updatedParticipants
        })
      }).catch(() => {});
      return nextShows;
    });

    // Notify applicant
    const notif: NotificationItem = {
      id: 'notif-rev-' + Date.now(),
      recipient: targetApp.applicantUsername,
      type: 'survival',
      category: 'survival',
      title: status === 'accepted'
        ? '🌟 ¡Has sido Aceptado en el Survival!'
        : status === 'shortlist'
        ? '📋 En Lista de Opciones para el Survival'
        : 'Solicitud de Survival Revisada',
      message: status === 'accepted'
        ? `¡Felicidades! Has sido aceptado oficialmente como participante en "${show.title}". Prepárate para la primera ronda.`
        : status === 'shortlist'
        ? `Tu audición para "${show.title}" ha sido preseleccionada y colocada en la lista de opciones.`
        : `Tu postulación para "${show.title}" fue revisada pero no fuiste seleccionado en esta ocasión.`,
      date: new Date().toISOString(),
      read: false
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(
      `Aspirante @${targetApp.applicantUsername} ${
        status === 'accepted' ? 'admitido en el programa' : status === 'shortlist' ? 'colocado en lista de opciones' : 'rechazado'
      }.`
    );
  };

  const updateSurvivalShow = (survivalId: string, updates: Partial<SurvivalShow>) => {
    setSurvivals((prev) => {
      const next = prev.map((s) => (s.id === survivalId ? { ...s, ...updates } : s));
      save('ym_survivals', next);
      apiFetch(`/api/survivals/${encodeURIComponent(survivalId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      }).catch(() => {});
      return next;
    });
    showToast('Survival actualizado.');
  };

  const deleteSurvivalShow = (survivalId: string) => {
    setSurvivals((prev) => {
      const next = prev.filter((s) => s.id !== survivalId);
      save('ym_survivals', next);
      apiFetch(`/api/survivals/${encodeURIComponent(survivalId)}`, { method: 'DELETE' }).catch(() => {});
      return next;
    });
    showToast('Survival eliminado.');
  };

  const toggleSurvivalFollow = (survivalId: string) => {
    if (!currentUser) return;
    const show = survivals.find((s) => s.id === survivalId);
    if (!show) return;
    const currentFollowers = show.followers || [];
    const isFollowing = currentFollowers.includes(currentUser);
    const updatedFollowers = isFollowing
      ? currentFollowers.filter((u) => u !== currentUser)
      : [...currentFollowers, currentUser];
    updateSurvivalShow(survivalId, { followers: updatedFollowers });
    if (!isFollowing) {
      showToast(`¡Ahora sigues "${show.title}"! Recibirás alertas exclusivas.`);
    } else {
      showToast(`Has dejado de seguir "${show.title}".`);
    }
  };

  const toggleSurvivalFavorite = (survivalId: string, contestantUsername: string) => {
    if (!currentUser) return;
    const show = survivals.find((s) => s.id === survivalId);
    if (!show) return;
    const fanFavs = show.fanFavorites || {};
    const myFavs: string[] = fanFavs[currentUser] || [];
    let updatedFavs: string[];
    if (myFavs.includes(contestantUsername)) {
      updatedFavs = myFavs.filter((u) => u !== contestantUsername);
      showToast(`@${contestantUsername} retirado de tus favoritos.`);
    } else {
      if (myFavs.length >= 3) {
        showToast('Solo puedes escoger hasta 3 favoritos para apoyar.');
        return;
      }
      updatedFavs = [...myFavs, contestantUsername];
      showToast(`¡@${contestantUsername} añadido a tus 3 favoritos oficiales!`);
    }
    const nextFanFavs = { ...fanFavs, [currentUser]: updatedFavs };
    updateSurvivalShow(survivalId, { fanFavorites: nextFanFavs });
  };

  const addSurvivalComment = (survivalId: string, text: string) => {
    if (!currentUser || !text.trim()) return;
    const show = survivals.find((s) => s.id === survivalId);
    if (!show) return;
    const newCom = {
      id: 'com-' + Date.now(),
      author: currentUser,
      text: text.trim(),
      date: new Date().toISOString()
    };
    const updatedComments = [...(show.comments || []), newCom];
    updateSurvivalShow(survivalId, { comments: updatedComments });
    showToast('Comentario publicado en el survival.');
  };

  const submitSurvivalMission = (survivalId: string, roundId: string, workUrl: string, notes: string) => {
    if (!currentUser) return;
    const submission: SurvivalSubmission = {
      id: 'sub-' + Date.now(),
      roundId,
      participantUsername: currentUser,
      workUrl,
      notes,
      submittedAt: new Date().toISOString()
    };

    setSurvivals((prev) =>
      prev.map((s) => {
        if (s.id !== survivalId) return s;
        return {
          ...s,
          rounds: (s.rounds || []).map((r) => {
            if (r.id !== roundId) return r;
            const existing = (r.submissions || []).filter((sub) => sub.participantUsername !== currentUser);
            return {
              ...r,
              submissions: [...existing, submission]
            };
          })
        };
      })
    );
    showToast('¡Entrega de misión enviada correctamente!');
  };

  const voteSurvivalRound = (survivalId: string, roundId: string, targetUsername: string, mode: 'fan' | 'contestant'): boolean => {
    if (!currentUser) {
      showToast('Inicia sesión para votar.');
      return false;
    }
    const show = survivals.find((s) => s.id === survivalId);
    if (!show) return false;
    const round = (show.rounds || []).find((r) => r.id === roundId);
    if (!round) return false;

    if (!round.evaluationSystem?.votingOpen) {
      showToast('Las votaciones para esta ronda se encuentran cerradas.');
      return false;
    }

    if (mode === 'contestant') {
      const isContestant = (show.participants || []).some((p) => p.username === currentUser);
      if (!isContestant) {
        showToast('Solo los participantes oficiales del survival pueden votar en esta modalidad.');
        return false;
      }
      if (!round.evaluationSystem.allowContestantSelfVote && targetUsername === currentUser) {
        showToast('No está permitido votarte a ti mismo en esta ronda.');
        return false;
      }
      const existingContestantVotes = round.contestantVotes || {};
      const currentVotedTargets = Object.entries(existingContestantVotes)
        .filter(([_, voters]) => voters.includes(currentUser))
        .map(([target]) => target);

      const maxVotes = round.evaluationSystem.votesPerUser || 1;
      if (currentVotedTargets.length >= maxVotes) {
        showToast(`Ya has utilizado tu límite de ${maxVotes} voto(s).`);
        return false;
      }

      setSurvivals((prev) =>
        prev.map((s) => {
          if (s.id !== survivalId) return s;
          return {
            ...s,
            rounds: (s.rounds || []).map((r) => {
              if (r.id !== roundId) return r;
              const voters = r.contestantVotes?.[targetUsername] || [];
              return {
                ...r,
                contestantVotes: {
                  ...r.contestantVotes,
                  [targetUsername]: [...voters, currentUser]
                }
              };
            })
          };
        })
      );
      showToast(`¡Voto de participante registrado para @${targetUsername}!`);
      return true;
    } else {
      // Fan voting
      const maxVotes = round.evaluationSystem?.votesPerUser || 3;
      const fanVotes = round.fanVotes || {};
      const totalUserVotes = Object.values(fanVotes).reduce(
        (sum, voters) => sum + voters.filter((v) => v === currentUser).length,
        0
      );
      if (totalUserVotes >= maxVotes) {
        showToast(`Has alcanzado tu límite de ${maxVotes} votos en esta ronda.`);
        return false;
      }

      setSurvivals((prev) =>
        prev.map((s) => {
          if (s.id !== survivalId) return s;
          return {
            ...s,
            rounds: (s.rounds || []).map((r) => {
              if (r.id !== roundId) return r;
              const voters = r.fanVotes?.[targetUsername] || [];
              return {
                ...r,
                fanVotes: {
                  ...r.fanVotes,
                  [targetUsername]: [...voters, currentUser]
                }
              };
            })
          };
        })
      );
      showToast(`¡Voto fan registrado para @${targetUsername}!`);
      return true;
    }
  };

  const gradeSurvivalParticipant = (survivalId: string, roundId: string, participantUsername: string, score: number) => {
    if (!currentUser) return;
    setSurvivals((prev) =>
      prev.map((s) => {
        if (s.id !== survivalId) return s;
        return {
          ...s,
          rounds: (s.rounds || []).map((r) => {
            if (r.id !== roundId) return r;
            const currentScores = r.judgesScores?.[currentUser] || {};
            return {
              ...r,
              judgesScores: {
                ...r.judgesScores,
                [currentUser]: {
                  ...currentScores,
                  [participantUsername]: score
                }
              }
            };
          })
        };
      })
    );
    showToast(`Evaluación de ${score} pts registrada para @${participantUsername}`);
  };

  const addSurvivalEpisode = (survivalId: string, ep: Omit<SurvivalEpisode, 'id' | 'publishedAt'>) => {
    const newEp: SurvivalEpisode = {
      ...ep,
      id: 'ep-' + Date.now(),
      publishedAt: new Date().toISOString()
    };
    setSurvivals((prev) =>
      prev.map((s) =>
        s.id === survivalId ? { ...s, episodes: [...(s.episodes || []), newEp] } : s
      )
    );
    showToast(`Episodio #${ep.episodeNumber} publicado.`);
  };

  // ==========================================
  // 19. SOCIAL, FOLLOWERS & EXTENDED PERSISTENCE
  // ==========================================
  const followUser = async (targetUsername: string): Promise<boolean> => {
    if (!currentUser) return false;
    if (currentUser.toLowerCase() === targetUsername.toLowerCase()) {
      showToast('No puedes seguirte a ti mismo.');
      return false;
    }
    try {
      const res = await fetch('/api/followers/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerUsername: currentUser, targetUsername })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || `Ahora sigues a @${targetUsername}`);
        fetchFollowersData(currentUser);
        return true;
      } else {
        showToast(data.error || 'No se pudo seguir al usuario.');
        return false;
      }
    } catch {
      showToast('Error de conexión al seguir usuario.');
      return false;
    }
  };

  const unfollowUser = async (targetUsername: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch('/api/followers/unfollow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerUsername: currentUser, targetUsername })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || `Has dejado de seguir a @${targetUsername}`);
        fetchFollowersData(currentUser);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const isFollowingUser = (targetUsername: string): boolean => {
    return userFollowing.some((f) => f.username.toLowerCase() === targetUsername.toLowerCase());
  };

  const getFollowInfo = async (username: string) => {
    try {
      const res = await fetch(`/api/followers/${encodeURIComponent(username)}`);
      if (res.ok) {
        const data = await res.json();
        return {
          followersCount: data.followersCount || 0,
          followingCount: data.followingCount || 0,
          followers: data.followers || [],
          following: data.following || []
        };
      }
    } catch {}
    return { followersCount: 0, followingCount: 0, followers: [], following: [] };
  };

  const updateUserStatus = async (
    text: string,
    emoji: string = '✨',
    visibility: 'public' | 'followers' | 'private' = 'public',
    durationHours?: number
  ): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch('/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, text, emoji, visibility, durationHours })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserStatusState(data.status);
        setUserProfile((prev) => ({ ...prev, userStatus: data.status }));
        showToast('Estado actualizado correctamente.');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const clearUserStatus = async (): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch(`/api/status/${encodeURIComponent(currentUser)}`, { method: 'DELETE' });
      if (res.ok) {
        setUserStatusState(null);
        setUserProfile((prev) => ({ ...prev, userStatus: null }));
        showToast('Estado eliminado.');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const reactToPost = async (postId: number, reaction: ReactionType) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/posts/${postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, reaction })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPosts((prev) =>
          prev.map((p) => {
            if (Number(p.id) === postId) {
              return {
                ...p,
                reactions: data.reactions,
                reactionCounts: data.reactionCounts,
                myReaction: data.myReaction,
                likes: Object.keys(data.reactions || {}).length
              };
            }
            return p;
          })
        );
      }
    } catch (e) {
      console.error('Error reacting to post:', e);
    }
  };

  const addNestedComment = async (postId: number, text: string, parentCommentId?: string): Promise<boolean> => {
    if (!currentUser || !text.trim()) return false;
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: currentUser, text, parentCommentId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPosts((prev) =>
          prev.map((p) => {
            if (Number(p.id) === postId) {
              return {
                ...p,
                nestedComments: data.nestedComments,
                comments: [...(p.comments || []), { author: currentUser, text: text.trim(), timestamp: new Date().toISOString() }]
              };
            }
            return p;
          })
        );
        showToast('Comentario publicado.');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const editNestedComment = async (postId: number, commentId: string, text: string): Promise<boolean> => {
    if (!currentUser || !text.trim()) return false;
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: currentUser, text })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPosts((prev) =>
          prev.map((p) => (Number(p.id) === postId ? { ...p, nestedComments: data.nestedComments } : p))
        );
        showToast('Comentario editado.');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteNestedComment = async (postId: number, commentId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}?author=${encodeURIComponent(currentUser)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPosts((prev) =>
          prev.map((p) => (Number(p.id) === postId ? { ...p, nestedComments: data.nestedComments } : p))
        );
        showToast('Comentario eliminado.');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const voteCommunityPoll = async (postId: number, optionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch(`/api/posts/${postId}/poll/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, optionId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPosts((prev) =>
          prev.map((p) => (Number(p.id) === postId ? { ...p, pollData: data.pollData } : p))
        );
        showToast('¡Voto registrado en la encuesta!');
        return true;
      } else {
        showToast(data.error || 'No se pudo registrar el voto.');
        return false;
      }
    } catch {
      return false;
    }
  };

  const createSavedCollection = async (name: string, description?: string): Promise<boolean> => {
    if (!currentUser || !name.trim()) return false;
    try {
      const res = await fetch('/api/saved/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, name, description })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSavedCollections((prev) => [...prev, data.collection]);
        showToast(`Colección "${name}" creada.`);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteSavedCollection = async (id: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch(`/api/saved/collections/${id}?username=${encodeURIComponent(currentUser)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSavedCollections((prev) => prev.filter((c) => c.id !== id));
        showToast('Colección eliminada.');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const toggleSavePost = async (postId: number, collectionId?: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch('/api/saved/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, postId, collectionId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.isSaved) {
          setSavedPosts((prev) => [
            ...prev,
            { id: 'sp-' + Date.now(), username: currentUser, postId, collectionId: collectionId || null, savedAt: new Date().toISOString() }
          ]);
          showToast('Publicación guardada en tu colección privada.');
        } else {
          setSavedPosts((prev) => prev.filter((s) => Number(s.postId) !== Number(postId)));
          showToast('Publicación eliminada de guardados.');
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const isPostSaved = (postId: number): boolean => {
    return savedPosts.some((s) => Number(s.postId) === Number(postId));
  };

  const togglePinPost = async (postId: number): Promise<boolean> => {
    if (!currentUser || userProfile.accountType !== 'admin') {
      showToast('Solo administradores pueden destacar anuncios.');
      return false;
    }
    try {
      const res = await fetch(`/api/posts/${postId}/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminUsername: currentUser })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPosts((prev) =>
          prev.map((p) => (Number(p.id) === postId ? { ...p, isPinned: data.isPinned } : p))
        );
        showToast(data.isPinned ? 'Publicación fijada como anuncio.' : 'Publicación desfijada.');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const sharePostToFeed = async (postId: number, quoteText?: string, targetForumId?: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch(`/api/posts/${postId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, quoteText, targetForumId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPosts((prev) => [data.sharedPost, ...prev]);
        showToast('Publicación compartida en el feed.');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const shareProductToFeed = async (productId: string, note?: string): Promise<boolean> => {
    if (!currentUser) return false;
    const prod = products.find((p) => p.id === productId);
    if (!prod) return false;
    try {
      createPost({
        author: currentUser,
        forumId: 'general',
        forumName: 'Comunidad General',
        tag: 'Merch',
        title: `Recomendación: ${prod.name}`,
        content: note || `¡Echa un vistazo a este artículo oficial en la tienda de YM-ki Records! Precio: ${prod.priceCoins} Coins.`,
        type: 'normal',
        promotedProductId: prod.id,
        sharedProductId: prod.id
      });
      showToast('Producto compartido en el feed de la comunidad.');
      return true;
    } catch {
      return false;
    }
  };

  // ==========================================
  // 20. PROVEEDORES AUTORIZADOS
  // ==========================================
  const myVendorApplication = vendorsList.find((v) => v.username.toLowerCase() === (currentUser || '').toLowerCase()) || null;

  const isApprovedVendor = (username: string = currentUser || ''): boolean => {
    if (!username) return false;
    const p = allProfiles[username];
    if (p && (p.accountType === 'admin' || p.isFounder)) return true;
    const v = vendorsList.find((item) => item.username.toLowerCase() === username.toLowerCase());
    return v?.status === 'aprobado';
  };

  const applyForVendor = async (data: { vendorName: string; description: string; productTypes: string[]; catalogUrl?: string; contactInfo: string }): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch('/api/vendors/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, ...data })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setVendorsList((prev) => [...prev, result.vendor]);
        showToast('Solicitud enviada para revisión de la administración.');
        return true;
      } else {
        showToast(result.error || 'No se pudo enviar la solicitud.');
        return false;
      }
    } catch {
      return false;
    }
  };

  const reviewVendorStatus = async (vendorId: string, status: VendorStatus, rejectionReason?: string): Promise<boolean> => {
    if (!currentUser || userProfile.accountType !== 'admin') {
      showToast('Solo administradores pueden evaluar proveedores.');
      return false;
    }
    try {
      const res = await fetch(`/api/vendors/${vendorId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminUsername: currentUser, status, rejectionReason })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVendorsList((prev) => prev.map((v) => (v.id === vendorId ? data.vendor : v)));
        showToast(`Estado de proveedor actualizado a "${status}".`);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // ==========================================
  // 21. TIENDA AVANZADA, CUPONES Y COMPRAS ATÓMICAS
  // ==========================================
  const validateCoupon = async (code: string, amount: number) => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, amount })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return {
          valid: true,
          discountPercent: data.discountPercent,
          discountAmount: data.discountAmount,
          finalAmount: data.finalAmount
        };
      }
      return { valid: false, discountPercent: 0, discountAmount: 0, finalAmount: amount, error: data.error };
    } catch (e: any) {
      return { valid: false, discountPercent: 0, discountAmount: 0, finalAmount: amount, error: 'Error validando cupón' };
    }
  };

  const createDiscountCoupon = async (couponData: { code: string; discountPercent: number; minPurchaseCoins?: number; maxUses?: number; expiresAt?: string }): Promise<boolean> => {
    if (!currentUser || userProfile.accountType !== 'admin') {
      showToast('Solo administradores pueden crear cupones.');
      return false;
    }
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminUsername: currentUser, ...couponData })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDiscountCoupons((prev) => [...prev, data.coupon]);
        showToast(`Cupón "${data.coupon.code}" creado con éxito.`);
        return true;
      } else {
        showToast(data.error || 'Error al crear cupón.');
        return false;
      }
    } catch {
      return false;
    }
  };

  const buyProductAtomic = async (
    productId: string,
    variantId?: string,
    quantity: number = 1,
    currency: 'coins' | 'gems' = 'coins',
    couponCode?: string
  ): Promise<{ success: boolean; error?: string; remainingStock?: number }> => {
    if (!currentUser) return { success: false, error: 'Debes iniciar sesión.' };
    try {
      const res = await apiFetch('/api/store/buy-atomic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerUsername: currentUser,
          productId,
          variantId,
          quantity,
          currency,
          couponCode
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserProfile((prev) => ({
          ...prev,
          coins: data.buyerCoins,
          gems: data.buyerGems
        }));
        if (data.inventoryItem) {
          setInventory((prev) => [data.inventoryItem, ...prev]);
        }
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id === productId && p.stockType === 'fixed') {
              return { ...p, stockCount: Math.max(0, p.stockCount - quantity) };
            }
            return p;
          })
        );
        if (data.purchase) {
          setPurchaseHistory((prev) => [data.purchase, ...prev]);
        }
        showToast('¡Compra realizada con éxito! Artículo añadido a tu inventario.');
        return { success: true, remainingStock: data.remainingStock };
      } else {
        showToast(data.error || 'No se pudo completar la compra.');
        return { success: false, error: data.error };
      }
    } catch (e: any) {
      showToast('Error de red al procesar compra.');
      return { success: false, error: e.message };
    }
  };

  const transferCurrencyAtomic = async (
    recipient: string,
    currency: 'coins' | 'gems',
    amount: number,
    reason?: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    if (!currentUser) return { success: false, error: 'Debes iniciar sesión.' };
    const cur = currency === 'gems' ? 'gems' : 'coins';
    const cleanRecipient = recipient.trim().replace(/^@/, '');
    if (!cleanRecipient) return { success: false, error: 'Destinatario requerido.' };
    if (cleanRecipient.toLowerCase() === currentUser.toLowerCase()) {
      showToast('No puedes transferir fondos a tu propia cuenta.');
      return { success: false, error: 'No puedes transferir a ti mismo.' };
    }

    try {
      const res = await apiFetch('/api/economy/transfer-atomic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: currentUser,
          recipient: cleanRecipient,
          currency: cur,
          amount,
          reason
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (cur === 'gems') {
          setUserProfile((prev) => ({ ...prev, gems: data.senderBalanceAfter }));
        } else {
          setUserProfile((prev) => ({ ...prev, coins: data.senderBalanceAfter }));
        }
        fetchLedger();
        showToast(data.message || `Transferencia de ${amount} ${cur} completada.`);
        return { success: true, message: data.message };
      }
    } catch {
      // Local execution fallback
    }

    const currentBal = cur === 'gems' ? (userProfile.gems || 0) : (userProfile.coins || 0);
    const isAdmin = isPrivileged() || userProfile.accountType === 'admin' || userProfile.isFounder;
    if (!isAdmin && currentBal < amount) {
      showToast(`Saldo insuficiente. Tienes ${currentBal} ${cur}.`);
      return { success: false, error: 'Saldo insuficiente' };
    }

    const newSenderBal = isAdmin ? currentBal : Math.max(0, currentBal - amount);
    if (cur === 'gems') {
      setUserProfile((prev) => {
        const u = { ...prev, gems: newSenderBal };
        save('ym_current_user_profile', u);
        return u;
      });
    } else {
      setUserProfile((prev) => {
        const u = { ...prev, coins: newSenderBal };
        save('ym_current_user_profile', u);
        return u;
      });
    }

    setAllProfiles((prev) => {
      const rec = prev[cleanRecipient] || defaultProfile(cleanRecipient);
      const updatedRec = {
        ...rec,
        coins: cur === 'coins' ? (rec.coins || 0) + amount : rec.coins,
        gems: cur === 'gems' ? (rec.gems || 0) + amount : rec.gems
      };
      const updated = { ...prev, [cleanRecipient]: updatedRec };
      save('ym_user_profiles', updated);
      return updated;
    });

    const txEntry: EconomyLedgerEntry = {
      id: 'tx-' + Date.now(),
      username: currentUser,
      type: cur === 'gems' ? 'transfer_gems_sent' : 'spend_coins',
      currency: cur,
      amount,
      balanceAfter: newSenderBal,
      reason: reason || `Transferencia enviada a @${cleanRecipient}`,
      relatedUser: cleanRecipient,
      timestamp: new Date().toISOString()
    };
    setUserLedger((prev) => {
      const updated = [txEntry, ...prev];
      save('ym_user_ledger', updated);
      return updated;
    });

    showToast(`¡Transferencia de ${amount} ${cur} a @${cleanRecipient} completada!`);
    return { success: true };
  };

  const restockProduct = async (productId: string, additionalStock: number, reason?: string): Promise<boolean> => {
    const qty = Number(additionalStock);
    if (!qty || qty <= 0) {
      showToast('Ingresa una cantidad válida para la reposición.');
      return false;
    }
    try {
      const res = await fetch(`/api/products/${productId}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ additionalStock: qty, reason, adminUsername: currentUser })
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, stockCount: data.product.stockCount, stockType: 'fixed' } : p)));
        if (data.movement) {
          setInventoryMovements((prev) => [data.movement, ...prev]);
        }
        showToast(`¡Stock repuesto! +${qty} unidades añadidas.`);
        return true;
      }
    } catch {}

    // Local fallback
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, stockCount: (p.stockCount || 0) + qty, stockType: 'fixed' } : p)));
    const fallbackMov: InventoryMovement = {
      id: 'mov-' + Date.now(),
      productId,
      movementType: 'restock',
      quantity: qty,
      previousStock: 0,
      newStock: qty,
      reason: reason || 'Reposición de inventario',
      createdAt: new Date().toISOString(),
      createdBy: currentUser || 'Admin'
    };
    setInventoryMovements((prev) => [fallbackMov, ...prev]);
    showToast(`¡Stock repuesto! +${qty} unidades.`);
    return true;
  };

  const createProductVariant = async (productId: string, variantData: Omit<ProductVariant, 'id' | 'productId'>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/products/${productId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variantData)
      });
      const data = await res.json();
      if (data.success && data.variants) {
        setProductVariants((prev) => ({
          ...prev,
          [productId]: data.variants
        }));
        showToast(`¡Variante "${variantData.name}" agregada!`);
        return true;
      }
    } catch {}

    const newV: ProductVariant = {
      id: 'var-' + Date.now(),
      productId,
      ...variantData
    };
    setProductVariants((prev) => ({
      ...prev,
      [productId]: [...(prev[productId] || []), newV]
    }));
    showToast(`¡Variante "${variantData.name}" agregada!`);
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        userProfile,
        allProfiles,
        themeMode,
        setThemeMode,
        primaryButtonColor,
        setPrimaryButtonColor,
        themeGradient,
        themeBannerGradient,
        themeDarkColor,
        ceosList,
        forums,
        posts,
        fanClubs,
        chats,
        chatGroups,
        products,
        inventory,
        tradeOffers,
        auditions,
        notifications,
        ceoRequests,
        firstRegisteredUser,
        friendRequestsSent,
        viewingProfileUser,
        toastMessage,
        showToast,
        getProfileOf,
        isPrivileged,
        isPrimaryCeo,
        isDesigner,
        canCreateMagazine,
        canUploadGif,
        authToken,
        login,
        register,
        changeUsername,
        logout,
        logoutAll,
        updateProfile,
        setUserProfile,
        removeFrame,
        updateIdCard,
        updateCeoProfile,
        upgradeToPremiumFan,
        requestCeoUpgrade,
        approveCeoRequest,
        rejectCeoRequest,
        addCoins,
        addGems,
        transferCoins,
        claimDailyCoins,
        completeMission,
        sendFriendRequest,
        setViewingProfileUser,
        openProfileByUsername,
        createForum,
        createFandomForum,
        editForum,
        deleteForum,
        joinForum,
        leaveForum,
        createPost,
        reactPost,
        votePoll,
        addComment,
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
        userBiases,
        setArtistBias,
        removeArtistBias,
        getBiasesForClub,
        sendChatMessage,
        editChatMessage,
        deleteChatMessage,
        toggleMuteConversation,
        createChatGroup,
        addCategoryToGroup,
        addSubgroupToCategory,
        sendGroupMessage,
        setSubgroupPinnedWeeklyMessage,
        submitTraineeTask,
        gradeTraineeTask,
        promoteMemberInGroup,
        addProductToStore,
        deleteProduct,
        buyProduct,
        listItemInOutlet,
        buyOutletProduct,
        toggleShowcaseItem,
        setMerchPrivate,
        userAlbums,
        userPhotocards,
        openAlbum,
        listPhotocardInOutlet,
        giftItemToUser,
        giftPhotocardToUser,
        magazines,
        createMagazine,
        likeMagazine,
        deleteMagazine,
        releases,
        createRelease,
        awards,
        userAwardVotes,
        userVotedNominees,
        createAwardEvent,
        deleteAwardEvent,
        createAwardCategory,
        deleteAwardCategory,
        voteAwardNominee,
        submitAudition,
        evaluateAudition,
        markNotificationRead,
        submitTradeOffer,
        respondToTradeOffer,
        partners,
        addPartner,
        updatePartner,
        deletePartner,
        charts,
        addChartEntry,
        updateChartEntry,
        deleteChartEntry,
        productReviews,
        addProductReview,
        deleteProductReview,
        buttonTheme,
        updateButtonTheme,
        adminDelegations,
        delegateAdminPermissions,
        adminAuditLog,
        userRequests,
        submitUserRoleRequest,
        reviewUserRoleRequest,
        notificationPreferences,
        toggleNotificationPreference,
        deleteNotification,
        markAllNotificationsRead,
        survivals,
        createSurvivalShow,
        updateSurvivalShow,
        deleteSurvivalShow,
        registerToSurvival,
        voteSurvivalParticipant,
        updateSurvivalParticipantStatus,
        advanceSurvivalStage,
        submitSurvivalApplication,
        reviewSurvivalApplication,
        submitSurvivalMission,
        voteSurvivalRound,
        gradeSurvivalParticipant,
        addSurvivalEpisode,
        toggleSurvivalFollow,
        toggleSurvivalFavorite,
        addSurvivalComment,
        auditionPassCodes,
        redeemRoleCode,
        cleanGhostPosts,
        isUnlimitedBalance,
        // Virtual Economy, Missions & Ledger
        missions,
        userLedger,
        fetchLedger,
        claimMissionReward,
        transferGems,
        trackMissionActivity,
        createMission,
        updateMission,
        deleteMission,
        // Wishlist & Gifting
        userWishlist,
        addToWishlist,
        removeFromWishlist,
        giftWishlistItem,
        // Showcase Vitrina Personal
        showcaseItems,
        saveShowcaseItems,
        // Customization & Frames
        updateCustomization,
        // Security & Moderation
        reportUser,
        blockUser,
        blockedUsers,
        grantAwardReward,
        // 19. Sistema de Seguidores & Social Feed
        userFollowers,
        userFollowing,
        followUser,
        unfollowUser,
        isFollowingUser,
        getFollowInfo,
        userStatus,
        updateUserStatus,
        clearUserStatus,
        reactToPost,
        addNestedComment,
        editNestedComment,
        deleteNestedComment,
        voteCommunityPoll,
        savedCollections,
        savedPosts,
        createSavedCollection,
        deleteSavedCollection,
        toggleSavePost,
        isPostSaved,
        togglePinPost,
        sharePostToFeed,
        shareProductToFeed,
        vendorsList,
        myVendorApplication,
        applyForVendor,
        reviewVendorStatus,
        isApprovedVendor,
        productVariants,
        discountCoupons,
        validateCoupon,
        buyProductAtomic,
        purchaseHistory,
        createDiscountCoupon,
        transferCurrencyAtomic,
        inventoryMovements,
        restockProduct,
        createProductVariant
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
