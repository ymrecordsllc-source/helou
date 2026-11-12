export type AccountType = 'fan' | 'premium_fan' | 'trainee' | 'artista' | 'admin' | 'diseñador';

export interface UserProfile {
  username: string;
  nickname: string;
  avatar: string;
  banner: string;
  description: string;
  ringColor: string; // Theme button / accent color
  transparentFrame: string | null;
  accountType: AccountType;
  profileBgColor: string;
  badgeAdminColor: string;
  badgeVerifiedColor: string;
  animal?: string;
  allowMessages: boolean;
  coins: number;
  gems: number;
  dob: string;
  isFounder?: boolean;
  isCoCeo?: boolean;
  traineeRank?: TraineeRank;
  isMerchPrivate: boolean;
  showcaseItemIds: string[]; // up to 10 item IDs
  lastDailyClaim?: string;
  completedMissions: string[];
  idCard?: IdCardData;
  buttonTheme?: ButtonThemeConfig;
  notificationPreferences?: Record<string, boolean>;
  // Customization & Frames expansion
  customTransparentFrame?: string | null;
  frameScale?: number;
  frameOffsetX?: number;
  frameOffsetY?: number;
  customFrameColor?: string;
  frameCustomColor?: string;
  ownedFrames?: string[];
  selectedFrameId?: string | null;
  // Fandom Tags display
  fandom?: string;
  fandomDisplayMode?: 'beside_username' | 'description';
  displayedFandomTags?: string[];
  // Awards digital rewards
  digitalTrophies?: DigitalTrophy[];
  winnerCertificates?: WinnerCertificate[];
  specialProfileBadges?: string[];
  recognitionTitles?: string[];
  // Sistema de Logros e Insignias (Módulo 14)
  unlockedAchievements?: Record<string, { unlockedAt: string; claimed: boolean }>;
  customBadges?: UserBadgeItem[];
  displayedBadges?: string[]; // IDs de insignias seleccionadas para mostrar públicamente
  // Calendario y Recordatorios (Módulo 15)
  calendarPreferences?: {
    notify24hBefore: boolean;
    notify1hBefore: boolean;
    notifyOnStart: boolean;
    notifyOnEnd: boolean;
    timeZone: string;
  };
  subscribedEventIds?: string[];
  // Mensajes y Moderación (Módulos 17 y 18)
  mutedConversations?: string[];
  blockedUsers?: string[];
  isSuspended?: boolean;
  suspensionReason?: string;
  suspensionExpires?: string;
  // Sistema de Biases por Grupo (Módulo Club de Fans & Tienda)
  userBiases?: UserBias[];
  // Social & Seguidores
  followersCount?: number;
  followingCount?: number;
  isVerified?: boolean;
  userStatus?: UserStatus | null;
  isVendorApproved?: boolean;
  vendorName?: string;
}

export type BiasRole = 'bias' | 'bias_wrecker' | 'least_bias';

export interface UserBias {
  artistUsername: string;
  artistNickname: string;
  artistAvatar: string;
  clubId: string;
  clubName: string;
  role: BiasRole;
  assignedAt: string;
}

export type TraineeRank = 
  | 'trainee -c' | 'trainee c' | 'trainee +c'
  | 'trainee -b' | 'trainee b' | 'trainee +b'
  | 'trainee -a' | 'trainee a' | 'trainee +a'
  | 'trainee -s' | 'trainee s' | 'trainee +s'
  | 'trainee -ss' | 'trainee ss' | 'trainee +ss';

export type IdCardRank = TraineeRank | 'artista' | 'ceo';

export type IdCardLayout = 'horizontal' | 'vertical';

export interface IdCardData {
  pseudonym: string;
  age: number;
  gender?: string; // Femenino, Masculino, No binario, etc.
  matricula: string; // YM-YYYY-XXXXXX
  faceclaim: string; // Image URL
  cardColor?: string; // Color hexadecimal o estilo degradado
  stripeColor?: string; // Para trainees: color de la franja decorativa
  specialties: ('vocal' | 'rap' | 'baile' | 'all_rounder')[];
  specialty?: 'vocal' | 'rap' | 'baile' | 'all_rounder';
  rank?: IdCardRank;
  backPhrase?: string;
  layoutStyle?: IdCardLayout;
  customBgUrl?: string;
}

export interface CeoInfo {
  id: string;
  name: string;
  username: string; // Linked admin username
  title: string;
  specialty: string;
  bio: string;
  avatar: string;
  motto: string;
  criteria: string[];
}

export interface Forum {
  id: string;
  name: string;
  description: string;
  banner?: string;
  avatar?: string;
  creator: string;
  followers: number;
  isJoined: boolean;
  bgType?: 'solid' | 'gradient' | 'image';
  bgValue?: string;
  isOfficial?: boolean;
  isFandomForum?: boolean;
  fanClubId?: string;
  fandomName?: string;
}

export type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'fire' | 'support' | 'cute';

export interface ReactionInfo {
  type: ReactionType;
  label: string;
  emoji: string;
}

export interface Post {
  id: number;
  author: string;
  forumId: string;
  forumName: string;
  tag: string;
  title: string;
  content: string;
  type: 'normal' | 'poll' | 'announcement';
  timestamp: string;
  likes: number;
  dislikes: number;
  myReaction?: 'like' | 'dislike' | null;
  comments: Comment[];
  pollVotes?: { option1: number; option2: number };
  pollVoters?: string[];
  isFandomOnly?: boolean;
  fandomName?: string;
  promotedProductId?: string;
  // Social Feed & Reactions Expansion
  reactions?: Record<string, ReactionType>; // username -> reaction
  reactionCounts?: Partial<Record<ReactionType, number>>;
  nestedComments?: NestedComment[];
  pollData?: CommunityPoll;
  isPinned?: boolean;
  pinnedBy?: string;
  pinnedAt?: string;
  shareCount?: number;
  originalPostId?: number;
  originalAuthor?: string;
  originalTitle?: string;
  originalContent?: string;
  sharedProductId?: string;
}

export interface Comment {
  id?: string;
  author: string;
  text: string;
  timestamp: string;
  parentCommentId?: string | null;
  isEdited?: boolean;
  editedAt?: string;
  reactions?: Record<string, ReactionType>;
  reactionCounts?: Partial<Record<ReactionType, number>>;
  replies?: Comment[];
}

export interface NestedComment extends Comment {
  id: string;
  postId: number;
  parentCommentId?: string | null;
  replies?: NestedComment[];
}

export interface FanClubExclusiveItem {
  id: string;
  clubId: string;
  name: string;
  description: string;
  image: string;
  category: 'photocard' | 'merch' | 'frame' | 'digital';
  priceCoins: number;
  priceGems?: number;
  isFreeForMembers: boolean;
  claimedBy?: string[];
  isHolographic?: boolean;
}

export interface FanClub {
  id: string;
  name: string;
  fandomName: string;
  artists: string[];
  manager: string;
  messagePrice: number;
  tagIcon: string;
  tagIconImg?: string;
  tagColor?: string;
  description: string;
  banner: string;
  avatar: string;
  privateForums: string[];
  members: string[];
  exclusiveItems?: FanClubExclusiveItem[];
}

export interface ChatMessage {
  id: string;
  from: string; // username
  to: string; // username
  text: string;
  timestamp: string;
  isFanMessage?: boolean;
  gift?: { name: string; icon: string; coinValue: number };
  attachmentUrl?: string;
  attachmentType?: 'image' | 'audio' | 'link' | 'file';
  replyToId?: string;
  replyToText?: string;
  isEdited?: boolean;
  editedAt?: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface TaskSubmission {
  status: 'submitted' | 'graded';
  grade?: number; // 1, 2, or 3 (3 = 10 de calificación / excelente)
  pointsAwarded?: number; // 100 points
  coinsAwarded?: number;
  feedback?: string;
}

export interface ChatGroupMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  attachment?: string;
  taskSubmission?: TaskSubmission;
  promotionInfo?: {
    promotedMember: string;
    newLevel: string;
  };
}

export type ChatSubgroupType = 'announcement' | 'promotions' | 'tasks' | 'general' | 'task_submission';

export interface ChatSubgroup {
  id: string;
  name: string;
  icon?: string;
  type: ChatSubgroupType;
  pinnedWeeklyMessage?: string;
  messages: ChatGroupMessage[];
}

export interface ChatGroupCategory {
  id: string;
  name: string;
  subgroups: ChatSubgroup[];
}

export interface ChatGroup {
  id: string;
  name: string;
  icon?: string;
  creator: string;
  createdBy?: string;
  isAdvanced: boolean; // Servidor avanzado con categorías y subgrupos
  isOfficial?: boolean; // Grupos oficiales predeterminados (editables solo por administradores)
  duration: 'temporary' | 'permanent';
  members: string[];
  categories: ChatGroupCategory[];
  messages: ChatGroupMessage[]; // For standard simple groups
}

export type CurrencyType = 'coins' | 'gems' | 'both';

export interface Photocard {
  id: string;
  name: string;
  artist: string;
  image: string;
  backImage: string;
  rarity: 'comun' | 'rara' | 'ultra_rara' | 'preventa_exclusiva';
  albumId?: string;
  albumName?: string;
  isPreorderBenefit?: boolean;
  isHolographic?: boolean;
  finishEffect?: 'holographic' | 'neutral';
  textureUrl?: string;
  lightingIntensity?: number;
  brightness?: number;
}

export interface AlbumTrack {
  trackNumber: number;
  title: string;
  duration: string;
  audioUrl?: string;
  versionType?: 'original' | 'remix' | 'instrumental' | 'acoustic' | 'live';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  tags: string[];
  stockType: 'unlimited' | 'fixed';
  stockCount: number;
  associatedArtists: string[];
  currencyType?: CurrencyType;
  priceCoins: number;
  priceGems?: number;
  createdBy: string;
  isOutlet: boolean;
  resellerUsername?: string;
  originalProductId?: string;
  createdAt: string;
  category?: 'general' | 'merch' | 'fashion' | 'album' | 'photocard' | 'frame' | 'bundle' | 'outlet';
  // Photocard specific product attributes
  photocardData?: Photocard;
  finishEffect?: 'holographic' | 'neutral';
  textureUrl?: string;
  lightingIntensity?: number;
  brightness?: number;
  // Profile frame attributes
  isFrame?: boolean;
  frameStyle?: string;
  frameConfig?: {
    style: string;
    defaultColor: string;
    transparentImageUrl?: string;
    rarity?: 'comun' | 'rara' | 'limitada' | 'permanente' | 'exclusiva';
  };
  // Bundles & promos
  isBundle?: boolean;
  bundleItemNames?: string[];
  bundleProductIds?: string[];
  discountPercent?: number;
  originalPriceCoins?: number;
  availableFrom?: string;
  availableUntil?: string;
  isFeatured?: boolean;
  isRecent?: boolean;
  // Album specific attributes
  isAlbum?: boolean;
  albumType?: 'full' | 'mini' | 'single';
  tracks?: AlbumTrack[];
  photocardsPool?: Photocard[];
  photocardsPerUnbox?: number;
  isPreorder?: boolean;
  preorderBenefitPhotocards?: Photocard[];
}

export interface UserAlbum {
  id: string;
  productId: string;
  albumName: string;
  albumType: 'full' | 'mini' | 'single';
  coverImage: string;
  associatedArtists: string[];
  tracks: AlbumTrack[];
  purchasedAt: string;
  isPreorder: boolean;
  isOpened: boolean;
  unboxedPhotocards?: Photocard[];
}

export interface UserPhotocard {
  id: string;
  photocardId: string;
  name: string;
  artist: string;
  image: string;
  backImage?: string;
  rarity: 'comun' | 'rara' | 'ultra_rara' | 'preventa_exclusiva';
  albumName?: string;
  isPreorderBenefit?: boolean;
  isHolographic?: boolean;
  acquiredAt: string;
  isListedInOutlet?: boolean;
  outletPrice?: number;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  name?: string;
  image: string;
  description: string;
  pricePaid: number;
  purchasedAt: string;
  isListedInOutlet?: boolean;
  outletPrice?: number;
  category?: 'general' | 'merch' | 'fashion' | 'album' | 'photocard' | 'frame' | 'bundle' | 'outlet';
  currencyUsed?: 'coins' | 'gems' | string;
  isResellable?: boolean;
  isAlbum?: boolean;
  frameStyle?: string;
  photocardData?: any;
}

export interface TradeOffer {
  id: string;
  fromUser: string;
  toUser: string;
  offeredItemId: string;
  offeredItemName: string;
  offeredItemImage: string;
  requestedItemId: string;
  requestedItemName: string;
  note: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface AuditionSubmission {
  id: number;
  applicantUsername: string;
  modalidad: string;
  pseudonym?: string;
  ceoId: string;
  ceoName: string;
  files: string[];
  date: string;
  status: string;
  evaluated: boolean;
  result?: 'trainee' | 'artista' | 'rejected' | 'accepted_staff';
  evaluatorNote?: string;
}

export type NotificationCategory =
  | 'cuenta'
  | 'perfil'
  | 'mensajes'
  | 'empresas'
  | 'artistas'
  | 'grupos'
  | 'tienda'
  | 'compras'
  | 'colecciones'
  | 'audiciones'
  | 'survival'
  | 'equipos'
  | 'evaluaciones'
  | 'votaciones'
  | 'episodios'
  | 'lanzamientos'
  | 'premiaciones'
  | 'calendario'
  | 'colaboraciones'
  | 'moderacion'
  | 'logros'
  | 'account'
  | 'community'
  | 'message'
  | 'audition'
  | 'store'
  | 'system';

export interface NotificationItem {
  id: string;
  recipient: string;
  recipientUsername?: string;
  sender?: string;
  type: string;
  category?: NotificationCategory;
  title: string;
  message: string;
  auditionId?: number;
  relatedId?: string;
  actionUrl?: string;
  actionSection?: string;
  linkSection?: string;
  date: string;
  timestamp?: string;
  read: boolean;
  metadata?: Record<string, any>;
}

export interface CeoUpgradeRequest {
  id: string;
  username: string;
  requestedRole: 'artista' | 'admin' | 'diseñador';
  ceoId: string;
  ceoName: string;
  reason: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Magazine (Revista Fashion)
export interface Magazine {
  id: string;
  title: string;
  subtitle: string;
  issueNumber: string;
  template: 'editorial_minimal' | 'streetwear_pop';
  themeColor: string; // Color sólido
  modelFaceClaimName: string;
  modelFaceClaimImage: string;
  coverImage: string;
  photoshoots: string[]; // Spreads e imágenes de diseño
  promotedProductIds: string[]; // Máximo 2 productos de la tienda (fashion u oficiales)
  editorialNotes: string;
  createdBy: string;
  authorRole: 'admin' | 'diseñador';
  createdAt: string;
  likes: number;
  likedBy: string[];
}

// Releases (Lanzamientos)
export interface Release {
  id: string;
  title: string;
  artist: string;
  releaseDate: string; // YYYY-MM-DD
  isReleased: boolean; // ya salio vs aun no sale
  thumbnail: string;
  type: 'single' | 'mini' | 'full' | 'mv' | 'trailer';
  youtubeUrl?: string;
  tiktokUrl?: string;
  trailerUrl?: string;
  mvUrl?: string;
  albumName?: string;
  tracklist?: AlbumTrack[];
  description: string;
  createdAt: string;
}

// Awards (Premiaciones)
export interface AwardNominee {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  votes: number;
}

export interface AwardCategory {
  id: string;
  name: string;
  description: string;
  nominees: AwardNominee[];
  votesLimitPerUser: number; // admin configurable limit (e.g. 1, 3, 5, 10)
}

export interface AwardEvent {
  id: string;
  title: string;
  description: string;
  banner: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  categories: AwardCategory[];
  createdBy: string;
  createdAt: string;
}

export interface ButtonThemeConfig {
  bgColor: string;
  textColor: string;
  borderColor: string;
  hoverBgColor: string;
  activeBgColor: string;
}

export interface AdminDelegations {
  canApproveArtist?: boolean;
  canApproveTrainee?: boolean;
  canApproveDesigner?: boolean;
  canApproveOther?: boolean;
  canManageAuditions?: boolean;
  canManageStore?: boolean;
  canManageSurvival?: boolean;
}

export interface AdminAuditEntry {
  id: string;
  adminUsername: string;
  action: string;
  targetUser?: string;
  targetUsername?: string;
  details: string;
  timestamp: string;
}

export interface PartnerLink {
  id: string;
  name: string;
  url: string;
}

export interface PartnerContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  notes?: string;
}

export interface PartnerCompany {
  id: string;
  name: string;
  logo: string;
  banner: string;
  description: string;
  links: PartnerLink[];
  contacts: PartnerContact[];
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChartEntry {
  id: string;
  category: 'main' | 'rookie';
  title: string;
  artist: string;
  coverImage: string;
  audioUrl?: string;
  score: number;
  rank: number;
  previousRank: number;
  movement: 'up' | 'down' | 'same' | 'new';
  period: string;
  isPublished: boolean;
  notes?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  username: string;
  nickname: string;
  avatar: string;
  rating: number; // 1 to 5
  comment: string;
  verifiedBuyer: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Survival Shows (Competencia de Talentos con Etapas, Rondas y Evaluaciones)
export type SurvivalStage = 'applications' | 'competition' | 'finished';

export interface FormFieldConfig {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'url' | 'file';
  placeholder?: string;
  options?: string[];
  required: boolean;
}

export interface SurvivalQuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  type?: 'correct' | 'neutral';
}

export interface SurvivalAuditionQuestion {
  id: string;
  question: string;
  type: 'text' | 'options' | 'file';
  options?: SurvivalQuestionOption[];
  required: boolean;
}

export interface SurvivalApplication {
  id: string;
  survivalId: string;
  applicantUsername: string;
  applicantNickname: string;
  applicantAvatar: string;
  responses: Record<string, any>;
  status: 'pending' | 'accepted' | 'rejected' | 'shortlist';
  submittedAt: string;
}

export interface EvaluationCriterion {
  id: string;
  name: string;
  weightPercentage: number;
}

export interface SurvivalRoundEvaluation {
  type: 'fan' | 'judges' | 'contestants' | 'combined';
  fanWeight?: number;
  judgesWeight?: number;
  contestantWeight?: number;
  criteria?: EvaluationCriterion[];
  votesPerUser?: number;
  allowContestantSelfVote?: boolean;
  isContestantVotePublic?: boolean;
  votingOpen: boolean;
  resultsPublished: boolean;
}

export interface SurvivalSubmission {
  id: string;
  roundId: string;
  participantUsername: string;
  teamId?: string;
  workUrl: string;
  notes: string;
  submittedAt: string;
}

export interface SurvivalJudge {
  username: string;
  name: string;
  avatar: string;
  canManageTeams: boolean;
  canGrade: boolean;
  canReviewSubmissions: boolean;
}

export interface SurvivalTeam {
  id: string;
  name: string;
  color?: string;
  members: string[];
  mission?: string;
}

export interface SurvivalEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  publishedAt: string;
  broadcastDate?: string;
}

export interface SurvivalRound {
  id: string;
  roundNumber: number;
  name: string;
  title?: string;
  description: string;
  mission: string;
  referenceMaterialUrl?: string;
  startDate: string;
  endDate: string;
  rules: string;
  status?: 'active' | 'upcoming' | 'completed';
  deadline?: string;
  isTeamBased?: boolean;
  eliminationsCount?: number;
  decisionSystem?: 'votes' | 'judges' | 'contestants' | 'combined';
  evaluationMode?: string;
  evaluationWeights?: { fanVotes?: number; judges?: number; contestants?: number };
  evaluationSystem?: SurvivalRoundEvaluation;
  submissions: SurvivalSubmission[];
  fanVotes?: Record<string, string[]>;
  contestantVotes?: Record<string, string[]>;
  judgesScores?: Record<string, Record<string, number>>;
  criteria?: any[];
}

export interface SurvivalParticipant {
  id: string;
  survivalId: string;
  username: string;
  name: string;
  age: number;
  specialty: 'vocal' | 'rap' | 'baile' | 'all_rounder';
  auditionMedia: string;
  motto: string;
  status: 'registered' | 'approved' | 'rejected' | 'eliminated' | 'finalist';
  votes: number;
  voters: string[];
  createdAt: string;
}

export interface SurvivalShow {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  banner: string;
  icon?: string;
  rules: string;
  deadline: string;
  castingStartDate?: string;
  castingEndDate?: string;
  companyInCharge?: string;
  targetApplicantsCount?: number;
  extendCastingIfUnderTarget?: boolean;
  totalRoundsCount?: number;
  maxParticipants: number;
  stage: SurvivalStage;
  status: 'open' | 'closed' | 'evaluating';
  createdBy: string;
  createdAt: string;
  applicationFormConfig: FormFieldConfig[];
  customAuditionQuestions?: SurvivalAuditionQuestion[];
  applications: SurvivalApplication[];
  participants: SurvivalParticipant[];
  rounds: SurvivalRound[];
  teams: SurvivalTeam[];
  judges: SurvivalJudge[];
  episodes: SurvivalEpisode[];
  publicSubmissionsAllowed?: boolean;
  followers?: string[];
  fanFavorites?: Record<string, string[]>;
  merchProductIds?: string[];
  comments?: Array<{ id: string; author: string; text: string; date: string }>;
}

export interface AuditionPassCode {
  code: string;
  targetUsername: string;
  role: 'trainee' | 'artista';
  auditionId: number;
  redeemed: boolean;
  createdAt: string;
}

// Digital Awards Rewards
export interface DigitalTrophy {
  id: string;
  awardTitle: string;
  categoryName: string;
  trophyName: string;
  icon: string;
  dateAwarded: string;
  rarity?: 'gold' | 'platinum' | 'diamond';
}

export interface WinnerCertificate {
  id: string;
  awardTitle: string;
  recipientName: string;
  categoryName: string;
  issuedAt: string;
  signatureCeo: string;
}

// Virtual Economy & Missions
export type MissionCategory = 'daily' | 'weekly' | 'monthly';

export type MissionRequirementType =
  | 'publish_posts'
  | 'write_comments'
  | 'join_fanclub'
  | 'collect_items'
  | 'survival_vote'
  | 'award_vote'
  | 'gem_transfer'
  | 'customize_profile'
  | 'listen_tracks';

export interface Mission {
  id: string;
  category: MissionCategory;
  title: string;
  description: string;
  reqType: MissionRequirementType;
  targetCount: number;
  rewardCoins: number;
  rewardGems: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  claimLimit?: number;
  createdAt: string;
}

export interface UserMissionClaim {
  id: string;
  username: string;
  missionId: string;
  periodKey: string;
  claimedAt: string;
  rewardCoins: number;
  rewardGems: number;
}

export interface EconomyLedgerEntry {
  id: string;
  username: string;
  type: 'earn_coins' | 'earn_gems' | 'spend_coins' | 'spend_gems' | 'transfer_gems_sent' | 'transfer_gems_received';
  currency: 'coins' | 'gems';
  amount: number;
  balanceAfter: number;
  reason: string;
  relatedUser?: string;
  timestamp: string;
}

// Vitrina Personal de Merchandising
export interface ShowcaseItem {
  id: string;
  productId?: string;
  type: 'photocard' | 'album' | 'merch' | 'fashion' | 'package' | 'poster' | 'accessory' | 'special';
  title: string;
  name?: string;
  productName?: string;
  category: string;
  artistOrCollection?: string;
  image: string;
  isFeatured?: boolean;
  personalCategory?: string;
  order: number;
  isOwned: boolean; // True = adquirido / en inventario; False = deseado
  dateAdded: string;
  description?: string;
}

// Wishlist
export interface WishlistItem {
  id: string;
  productId: string;
  username: string;
  productName: string;
  image: string;
  productImage?: string;
  priceCoins: number;
  priceGems?: number;
  currencyType?: CurrencyType;
  isSoldOut?: boolean;
  notes?: string;
  createdAt: string;
}

// ==========================================
// 14. SISTEMA DE LOGROS, INSIGNIAS Y RECOMPENSAS
// ==========================================
export type AchievementCategory =
  | 'actividad'
  | 'coleccion'
  | 'compras'
  | 'musical'
  | 'comunidad'
  | 'audiciones'
  | 'survival'
  | 'empresas'
  | 'especiales';

export interface UserBadgeItem {
  id: string;
  name: string;
  image: string;
  category?: string;
  rarity?: 'comun' | 'rara' | 'epica' | 'legendaria' | 'mitica';
  description?: string;
  unlockedAt: string;
}

export interface Achievement {
  id: string;
  category: AchievementCategory;
  title: string;
  description: string;
  icon: string; // Emoji, lucide icon identifier, or image URL
  reqType:
    | 'first_purchase'
    | 'photocards_count'
    | 'votes_count'
    | 'audition_completed'
    | 'survival_completed'
    | 'tracks_listened'
    | 'community_posts'
    | 'community_comments'
    | 'fanclub_joined'
    | 'merch_showcase'
    | 'gem_transfer'
    | 'profile_customized'
    | 'album_created'
    | 'collaboration_completed'
    | 'custom';
  targetCount: number;
  rewardCoins: number;
  rewardGems: number;
  rewardBadge?: {
    id: string;
    name: string;
    image: string;
    rarity?: 'comun' | 'rara' | 'epica' | 'legendaria' | 'mitica';
  };
  isSecret?: boolean;
  isCustomAdminCreated?: boolean;
  createdAt: string;
}

// ==========================================
// 15. CALENDARIO GENERAL AUTOMATIZADO
// ==========================================
export type CalendarCategory =
  | 'album'
  | 'comeback'
  | 'audicion'
  | 'convocatoria'
  | 'survival'
  | 'ronda'
  | 'episodio'
  | 'premiacion'
  | 'empresa'
  | 'concierto'
  | 'especial';

export interface CalendarEvent {
  id: string;
  name: string;
  image: string;
  description: string;
  category: CalendarCategory;
  startDate: string; // YYYY-MM-DD o ISO string
  endDate?: string;
  time?: string;
  company: string;
  relatedLink?: string;
  relatedSection?: string;
  isPrivate?: boolean;
  createdBy: string;
  isAutomated: boolean;
  sourceModule?: 'releases' | 'survival' | 'awards' | 'auditions' | 'manual';
  sourceId?: string;
  createdAt: string;
}

// ==========================================
// 17. SISTEMA DE REPORTES Y MODERACIÓN
// ==========================================
export type ReportItemType =
  | 'user'
  | 'profile'
  | 'perfil'
  | 'post'
  | 'comment'
  | 'message'
  | 'product'
  | 'company'
  | 'photocard'
  | 'album'
  | 'media'
  | 'survival'
  | 'team'
  | 'behavior';

export type ReportMotive =
  | 'acoso'
  | 'suplantacion'
  | 'spam'
  | 'contenido_inapropiado'
  | 'fraude'
  | 'manipulacion_votos'
  | 'uso_indebido'
  | 'incumplimiento_reglas'
  | 'otro';

export interface ModerationReport {
  id: string;
  reporterUsername: string; // Confidencial
  reportedTargetUsername: string;
  reportedItemType: ReportItemType;
  reportedItemId: string;
  reportedItemTitle?: string;
  motive: ReportMotive;
  description: string;
  evidenceUrls?: string[];
  screenshotUrl?: string;
  createdAt: string;
  status: 'pendiente' | 'en_revision' | 'resuelto' | 'rechazado' | 'urgente';
  assignedModerator?: string;
  resolution?: string;
  penaltyApplied?: string;
  updatedAt?: string;
}

export interface UserPenalty {
  id: string;
  targetUsername: string;
  type: 'warning' | 'remove_content' | 'hide_content' | 'suspend_user' | 'restrict_features' | 'temp_ban' | 'perm_ban';
  reason: string;
  appliedBy: string;
  appliedAt: string;
  expiresAt?: string;
  status: 'activa' | 'revocada' | 'apelada' | 'expirada';
  appeal?: {
    text: string;
    submittedAt: string;
    response?: string;
    status: 'pending' | 'accepted' | 'rejected';
    reviewedBy?: string;
  };
}

// ==========================================
// 18. SISTEMA DE COLABORACIONES
// ==========================================
export type CollaborationType =
  | 'musical'
  | 'produccion'
  | 'composicion'
  | 'coreografia'
  | 'fotografia'
  | 'diseno'
  | 'participacion_proyecto'
  | 'empresa'
  | 'grupo'
  | 'especial';

export type CollaborationStatus =
  | 'borrador'
  | 'enviada'
  | 'pendiente'
  | 'aceptada'
  | 'en_desarrollo'
  | 'finalizada'
  | 'cancelada'
  | 'rechazada';

export interface CollaborationProgressUpdate {
  id: string;
  author: string;
  text: string;
  fileUrl?: string;
  timestamp: string;
}

export interface CollaborationProject {
  id: string;
  projectName: string;
  type: CollaborationType;
  description: string;
  objective: string;
  creatorUsername: string;
  targetUsernameOrCompany: string;
  isCompanyCollaboration: boolean;
  companyA?: string;
  companyB?: string;
  startDate: string;
  endDate?: string;
  requirements?: string;
  attachments?: string[];
  status: CollaborationStatus;
  participants: string[];
  chatGroupId?: string;
  publicShowcase: boolean;
  showcaseInProfile?: boolean;
  progressUpdates: CollaborationProgressUpdate[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 19. SOCIAL, FOLLOWERS & EXTENDED PERSISTENCE
// ==========================================

export interface UserStatus {
  username: string;
  text: string;
  emoji: string;
  visibility: 'public' | 'followers' | 'private';
  expiresAt?: string | null;
  updatedAt: string;
}

export interface FollowRelation {
  id: string;
  followerUsername: string;
  followingUsername: string;
  followedAt: string;
}

export interface PollOption {
  id: string;
  text: string;
  label?: string;
  votesCount: number;
  votes?: number;
  percentage?: number;
}

export interface CommunityPoll {
  id: string;
  postId?: number;
  question: string;
  options: PollOption[];
  expiresAt?: string | null;
  allowChangeVote?: boolean;
  totalVotes: number;
  userVotedOptionId?: string | null;
  voters?: Record<string, string>; // username -> optionId
}

export interface SavedCollection {
  id: string;
  username: string;
  name: string;
  description?: string;
  createdAt: string;
  postsCount?: number;
}

export interface SavedPostItem {
  id: string;
  username: string;
  collectionId?: string | null;
  postId: number;
  savedAt: string;
}

// ==========================================
// 20. AUTHORIZED VENDORS & STORE EXPANSION
// ==========================================

export type VendorStatus =
  | 'pendiente'
  | 'aprobado'
  | 'rechazado'
  | 'suspendido'
  | 'revocado'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'revoked';

export interface VendorApplication {
  id: string;
  username: string;
  vendorName: string;
  description: string;
  productTypes: string[];
  catalogUrl?: string;
  contactInfo: string;
  status: VendorStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  appliedAt?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  title?: string;
  variantType: 'color' | 'size' | 'edition' | 'rarity' | 'version' | string;
  priceCoins?: number;
  priceGems?: number;
  stockCount: number;
  sku?: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  variantId?: string;
  movementType: 'purchase' | 'restock' | 'adjustment' | 'return';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  createdAt: string;
  createdBy?: string;
}

export interface DiscountCoupon {
  id: string;
  code: string;
  discountPercent: number;
  minPurchaseCoins?: number;
  maxUses: number;
  usesCount: number;
  usedCount?: number;
  isActive: boolean;
  expiresAt?: string;
  createdBy?: string;
  createdAt: string;
}

export interface ProductPurchaseRecord {
  id: string;
  buyerUsername: string;
  productId: string;
  variantId?: string;
  productName: string;
  quantity: number;
  currencyUsed: 'coins' | 'gems';
  totalPaid: number;
  couponCode?: string;
  purchasedAt: string;
}


