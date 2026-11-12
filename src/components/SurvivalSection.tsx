import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Vote,
  Trophy,
  Users,
  Video,
  Music,
  CheckCircle2,
  Calendar,
  X,
  ExternalLink,
  Sparkles,
  Shield,
  Clock,
  Mic,
  Activity,
  Layers,
  ChevronRight,
  ClipboardList,
  Award,
  PlayCircle,
  BarChart3,
  Sliders,
  Send,
  UserCheck,
  Check,
  Ban,
  Star,
  ShoppingBag,
  MessageSquare,
  Settings,
  HelpCircle,
  FileText,
  Upload,
  UserMinus,
  Building2,
  Bell,
  Heart,
  ChevronLeft,
  Search,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  SurvivalShow,
  SurvivalParticipant,
  SurvivalStage,
  SurvivalApplication,
  SurvivalRound,
  SurvivalSubmission,
  SurvivalEpisode,
  SurvivalAuditionQuestion,
  SurvivalQuestionOption,
  SurvivalJudge,
  Product
} from '../types';
import { FileUploadButton } from './FileUploadButton';

export const SurvivalSection: React.FC = () => {
  const {
    userProfile,
    currentUser,
    isPrivileged,
    primaryButtonColor,
    survivals,
    createSurvivalShow,
    updateSurvivalShow,
    deleteSurvivalShow,
    reviewSurvivalApplication,
    submitSurvivalApplication,
    submitSurvivalMission,
    voteSurvivalParticipant,
    voteSurvivalRound,
    gradeSurvivalParticipant,
    addSurvivalEpisode,
    updateSurvivalParticipantStatus,
    toggleSurvivalFollow,
    toggleSurvivalFavorite,
    addSurvivalComment,
    partners,
    products,
    addProductToStore,
    advanceSurvivalStage,
    buyProduct,
    showToast,
    allProfiles
  } = useApp();

  const isAdmin = isPrivileged();
  const isFan = userProfile.accountType === 'fan';

  const [selectedSurvivalId, setSelectedSurvivalId] = useState<string>(() => survivals[0]?.id || '');
  const currentShow = survivals.find((s) => s.id === selectedSurvivalId) || survivals[0] || null;

  // Determine user roles in the current show
  const isCreator = currentShow?.createdBy === currentUser;
  const isJudge = currentShow?.judges?.some((j) => j.username === currentUser) || false;
  const isCreatorOrAdmin = isAdmin || isCreator;
  const isJudgeOrAdmin = isAdmin || isCreator || isJudge;
  const isParticipant = currentShow?.participants?.some((p) => p.username === currentUser) || false;

  // Global Section Sub-View: 'show' | 'mis_survivals'
  const [mainView, setMainView] = useState<'show' | 'mis_survivals'>('show');

  // Active Tab inside a Show
  // Aspirante tabs: 'episodios' | 'entregar_trabajo' | 'mis_equipos' | 'mi_historial' | 'votos_stats' | 'comentarios'
  // Fan tabs: 'perfil_aspirantes' | 'mis_votos' | 'comentarios' | 'tienda'
  // Judge/Admin tabs: 'votos_stats' | 'editar_rondas' | 'aspirantes_admin' | 'tienda' | 'configuracion' | 'audiciones' | 'comentarios'
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (isParticipant) return 'episodios';
    if (isJudgeOrAdmin) return 'votos_stats';
    return 'perfil_aspirantes';
  });

  const [selectedRoundIndex, setSelectedRoundIndex] = useState<number>(0);
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [candidateSearch, setCandidateSearch] = useState<string>('');
  const [newCommentText, setNewCommentText] = useState<string>('');

  // Modals
  const [isCreateShowModalOpen, setIsCreateShowModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSubmitMissionModalOpen, setIsSubmitMissionModalOpen] = useState(false);
  const [isJudgeGradeModalOpen, setIsJudgeGradeModalOpen] = useState(false);
  const [isAddEpisodeModalOpen, setIsAddEpisodeModalOpen] = useState(false);
  const [isAddMerchModalOpen, setIsAddMerchModalOpen] = useState(false);
  const [viewingAuditionParticipant, setViewingAuditionParticipant] = useState<SurvivalParticipant | null>(null);
  const [selectedApplicantToReview, setSelectedApplicantToReview] = useState<SurvivalApplication | null>(null);
  const [participantToGrade, setParticipantToGrade] = useState<SurvivalParticipant | null>(null);

  // WIZARD STATE FOR CREATING A SURVIVAL SHOW
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [newShowTitle, setNewShowTitle] = useState('');
  const [newShowBanner, setNewShowBanner] = useState('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200');
  const [newShowIcon, setNewShowIcon] = useState('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300');
  const [newShowJudges, setNewShowJudges] = useState<string[]>([]);
  const [judgeUsernameInput, setJudgeUsernameInput] = useState('');
  const [castingStartDate, setCastingStartDate] = useState('');
  const [castingEndDate, setCastingEndDate] = useState('');
  const [useYmkiCompany, setUseYmkiCompany] = useState(true);
  const [selectedPartnerCompany, setSelectedPartnerCompany] = useState('');
  const [targetApplicantsCount, setTargetApplicantsCount] = useState<number>(24);
  const [extendCastingIfUnderTarget, setExtendCastingIfUnderTarget] = useState(true);
  const [totalRoundsCount, setTotalRoundsCount] = useState<number>(3);

  // Per-Round configurations in Wizard
  interface RoundDraft {
    name: string;
    rules: string;
    isTeamBased: boolean;
    eliminationsCount: number;
    decisionSystem: 'votes' | 'judges' | 'contestants' | 'combined';
  }

  const [roundsDraft, setRoundsDraft] = useState<RoundDraft[]>([
    {
      name: 'Ronda 1: Evaluación Inicial de Talento',
      rules: 'Presentación individual de habilidades en canto, rap o baile.',
      isTeamBased: false,
      eliminationsCount: 4,
      decisionSystem: 'combined'
    },
    {
      name: 'Ronda 2: Batalla de Concepto por Equipos',
      rules: 'Desafío grupal con coreografía coordinada y armonías vocales.',
      isTeamBased: true,
      eliminationsCount: 6,
      decisionSystem: 'judges'
    },
    {
      name: 'Ronda 3: Gran Final & Debut Showcase',
      rules: 'Presentaciones en vivo de temas inéditos producidos por YM-ki Records.',
      isTeamBased: false,
      eliminationsCount: 8,
      decisionSystem: 'votes'
    }
  ]);

  // Sync draft array length when totalRoundsCount changes
  const handleRoundsCountChange = (count: number) => {
    const num = Math.min(6, Math.max(1, count));
    setTotalRoundsCount(num);
    setRoundsDraft((prev) => {
      const updated = [...prev];
      while (updated.length < num) {
        const nextIdx = updated.length + 1;
        updated.push({
          name: `Ronda ${nextIdx}: Misión ${nextIdx}`,
          rules: 'Evaluación de habilidades y disciplina escénica.',
          isTeamBased: nextIdx % 2 === 0,
          eliminationsCount: 4,
          decisionSystem: 'combined'
        });
      }
      return updated.slice(0, num);
    });
  };

  // Dynamic Application Form state
  const [formResponses, setFormResponses] = useState<Record<string, any>>({
    name: userProfile.nickname || '',
    age: String(userProfile.idCard?.age || 19),
    specialty: userProfile.idCard?.specialties?.[0] || 'vocal',
    audition_media: '',
    motto: ''
  });

  // New Custom Audition Question builder state (for "Mis Survivals" section)
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'text' | 'options' | 'file'>('text');
  const [newQuestionRequired, setNewQuestionRequired] = useState(true);
  const [newQuestionOptions, setNewQuestionOptions] = useState<SurvivalQuestionOption[]>([
    { id: 'opt-1', text: 'Opción 1', type: 'neutral', isCorrect: false },
    { id: 'opt-2', text: 'Opción 2', type: 'correct', isCorrect: true }
  ]);
  const [tempOptionText, setTempOptionText] = useState('');
  const [tempOptionType, setTempOptionType] = useState<'correct' | 'neutral'>('neutral');

  // Mission Submission Form state
  const [missionTitle, setMissionTitle] = useState('');
  const [missionMediaUrl, setMissionMediaUrl] = useState('');
  const [missionNotes, setMissionNotes] = useState('');

  // Judge Grade state
  const [judgeScore, setJudgeScore] = useState<number>(85);
  const [judgeFeedback, setJudgeFeedback] = useState('');

  // Episode state
  const [epNumber, setEpNumber] = useState(1);
  const [epTitle, setEpTitle] = useState('');
  const [epDesc, setEpDesc] = useState('');
  const [epVideoUrl, setEpVideoUrl] = useState('');
  const [epThumbnail, setEpThumbnail] = useState('');

  // Merch Product creation state
  const [newMerchName, setNewMerchName] = useState('');
  const [newMerchDesc, setNewMerchDesc] = useState('');
  const [newMerchImage, setNewMerchImage] = useState('');
  const [newMerchPriceCoins, setNewMerchPriceCoins] = useState(1200);
  const [newMerchPriceGems, setNewMerchPriceGems] = useState(12);

  const stage: SurvivalStage = currentShow?.stage || 'applications';
  const participants = currentShow?.participants || [];
  const applications = currentShow?.applications || [];
  const myApplication = applications.find((a) => a.applicantUsername === currentUser);
  const followers = currentShow?.followers || [];
  const isFollowing = currentUser ? followers.includes(currentUser) : false;

  const rounds: SurvivalRound[] = currentShow?.rounds && currentShow.rounds.length > 0 ? currentShow.rounds : [];
  const currentRound = rounds[selectedRoundIndex] || rounds[0];

  // Fans 3 Favorites
  const fanFavoritesMap = currentShow?.fanFavorites || {};
  const myFavorites: string[] = currentUser ? fanFavoritesMap[currentUser] || [] : [];

  // Filter participants
  const filteredParticipants = participants
    .filter((p) => {
      if (specialtyFilter !== 'all' && p.specialty !== specialtyFilter) return false;
      if (candidateSearch.trim()) {
        const query = candidateSearch.toLowerCase();
        return p.name.toLowerCase().includes(query) || p.username.toLowerCase().includes(query);
      }
      return true;
    })
    .sort((a, b) => b.votes - a.votes);

  // Handle Wizard Submission
  const handleFinishWizard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShowTitle.trim()) {
      showToast('Por favor escribe el nombre del Survival.');
      return;
    }

    const builtRounds: SurvivalRound[] = roundsDraft.map((r, i) => ({
      id: `round-${Date.now()}-${i + 1}`,
      roundNumber: i + 1,
      name: r.name,
      title: r.name,
      description: r.rules,
      mission: r.rules,
      startDate: castingStartDate || new Date().toISOString().split('T')[0],
      endDate: castingEndDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      rules: r.rules,
      status: i === 0 ? 'active' : 'upcoming',
      isTeamBased: r.isTeamBased,
      eliminationsCount: r.eliminationsCount,
      decisionSystem: r.decisionSystem,
      evaluationMode: r.decisionSystem,
      evaluationWeights: {
        fanVotes: r.decisionSystem === 'votes' ? 100 : r.decisionSystem === 'combined' ? 40 : 0,
        judges: r.decisionSystem === 'judges' ? 100 : r.decisionSystem === 'combined' ? 40 : 0,
        contestants: r.decisionSystem === 'contestants' ? 100 : r.decisionSystem === 'combined' ? 20 : 0
      },
      submissions: []
    }));

    const judgesListObjects: SurvivalJudge[] = newShowJudges.map((u) => {
      const p = allProfiles[u];
      return {
        username: u,
        name: p?.nickname || `@${u}`,
        avatar: p?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        canManageTeams: true,
        canGrade: true,
        canReviewSubmissions: true
      };
    });

    createSurvivalShow({
      title: newShowTitle.trim(),
      subtitle: `Organizado por ${useYmkiCompany ? 'YM-ki Records' : selectedPartnerCompany || 'YM-ki Records'}`,
      description: `Temporada oficial con ${totalRoundsCount} rondas eliminatorias y cupo para ${targetApplicantsCount} aspirantes.`,
      banner: newShowBanner.trim() || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200',
      icon: newShowIcon.trim() || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300',
      rules: `Casting abierto hasta alcanzar ${targetApplicantsCount} aspirantes. Sistema de evaluación oficial.`,
      deadline: castingEndDate || '2026-12-31',
      castingStartDate: castingStartDate || new Date().toISOString().split('T')[0],
      castingEndDate: castingEndDate || '2026-12-31',
      companyInCharge: useYmkiCompany ? 'YM-ki Records' : selectedPartnerCompany || 'YM-ki Records',
      targetApplicantsCount,
      extendCastingIfUnderTarget,
      totalRoundsCount,
      maxParticipants: targetApplicantsCount,
      stage: 'applications',
      status: 'open',
      createdBy: currentUser || 'Admin',
      participants: [],
      applications: [],
      rounds: builtRounds,
      teams: [],
      judges: judgesListObjects,
      episodes: [],
      applicationFormConfig: [],
      customAuditionQuestions: [
        {
          id: 'q-default-1',
          question: '¿Por qué deberías ser elegido(a) para este Survival?',
          type: 'text',
          required: true
        },
        {
          id: 'q-default-2',
          question: '¿Cuál es tu principal fortaleza escénica?',
          type: 'options',
          required: true,
          options: [
            { id: 'o-1', text: 'Técnica vocal & rango', type: 'neutral', isCorrect: false },
            { id: 'o-2', text: 'Precisión y energía en baile', type: 'neutral', isCorrect: false },
            { id: 'o-3', text: 'Flow y presencia en rap', type: 'neutral', isCorrect: false },
            { id: 'o-4', text: 'Carisma y concepto all-rounder', type: 'correct', isCorrect: true }
          ]
        }
      ]
    });

    setIsCreateShowModalOpen(false);
    setWizardStep(1);
    setNewShowTitle('');
    setNewShowJudges([]);
    showToast(`¡Survival "${newShowTitle}" creado con éxito!`);
  };

  // Handle Audition Application Submit
  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShow) return;
    if (isFan) {
      showToast('Las cuentas de fans no pueden postularse como aspirantes.');
      return;
    }
    if (!formResponses['name']?.trim() || !formResponses['audition_media']?.trim()) {
      showToast('Por favor completa tu nombre artístico y el enlace/archivo de audición.');
      return;
    }

    const success = submitSurvivalApplication(currentShow.id, formResponses);
    if (success) {
      setIsApplyModalOpen(false);
      showToast('¡Postulación enviada exitosamente para evaluación de jueces!');
    }
  };

  // Add Custom Audition Question in "Mis Survivals"
  const handleAddCustomQuestion = () => {
    if (!currentShow || !newQuestionText.trim()) {
      showToast('Introduce el texto de la pregunta.');
      return;
    }

    const newQ: SurvivalAuditionQuestion = {
      id: 'q-' + Date.now(),
      question: newQuestionText.trim(),
      type: newQuestionType,
      required: newQuestionRequired,
      options: newQuestionType === 'options' ? newQuestionOptions : undefined
    };

    const updatedQuestions = [...(currentShow.customAuditionQuestions || []), newQ];
    updateSurvivalShow(currentShow.id, { customAuditionQuestions: updatedQuestions });

    setNewQuestionText('');
    setNewQuestionType('text');
    setNewQuestionOptions([
      { id: 'opt-1', text: 'Opción 1', type: 'neutral', isCorrect: false },
      { id: 'opt-2', text: 'Opción 2', type: 'correct', isCorrect: true }
    ]);
    showToast('¡Nueva pregunta agregada al formulario de audición!');
  };

  // Handle Mission Submit
  const handleMissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShow || !currentRound) return;
    if (!missionMediaUrl.trim()) {
      showToast('Debes ingresar el enlace o subir tu archivo de performance.');
      return;
    }
    submitSurvivalMission(currentShow.id, currentRound.id, missionMediaUrl.trim(), missionNotes.trim());
    setIsSubmitMissionModalOpen(false);
    setMissionTitle('');
    setMissionMediaUrl('');
    setMissionNotes('');
  };

  // Handle Judge Grade
  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShow || !currentRound || !participantToGrade) return;
    gradeSurvivalParticipant(currentShow.id, currentRound.id, participantToGrade.username, judgeScore);
    setIsJudgeGradeModalOpen(false);
    setParticipantToGrade(null);
    setJudgeFeedback('');
  };

  // Handle Add Merch to Survival
  const handleAddMerchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShow || !newMerchName.trim()) return;

    addProductToStore({
      name: newMerchName.trim(),
      description: newMerchDesc.trim() || `Merchandise oficial del show ${currentShow.title}.`,
      category: 'merch',
      priceCoins: newMerchPriceCoins,
      priceGems: newMerchPriceGems,
      images: [newMerchImage || currentShow.icon || currentShow.banner],
      tags: ['survival_merch', currentShow.id, 'oficial'],
      stockCount: 50,
      stockType: 'fixed',
      associatedArtists: [currentShow.title],
      isOutlet: false,
      createdBy: currentUser || 'Admin'
    });

    setIsAddMerchModalOpen(false);
    setNewMerchName('');
    setNewMerchDesc('');
    setNewMerchImage('');
    showToast('Producto de Merch añadido a la tienda del Survival.');
  };

  // Merch items for this survival
  const survivalMerch = products.filter(
    (p) => p.tags?.includes('survival_merch') || p.tags?.includes(currentShow?.id || '')
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Main Navigation Header */}
      <div className="rounded-3xl p-6 sm:p-8 bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl relative z-10">
          <div
            style={{
              backgroundColor: `${primaryButtonColor}20`,
              borderColor: `${primaryButtonColor}50`,
              color: primaryButtonColor
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm"
          >
            <Flame className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            Ecosistema de Supervivencia & Casting Idol
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Survivals, Misiones & Audiciones
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Crea tu propio reality show con temporadas de casting, rondas con reglas personalizadas, evaluación de jurados, tienda exclusiva para seguidores y votaciones comunitarias.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          {/* Create Survival Wizard Trigger */}
          <button
            onClick={() => {
              setWizardStep(1);
              setIsCreateShowModalOpen(true);
            }}
            style={{ backgroundColor: primaryButtonColor }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-extrabold text-xs shadow-lg hover:opacity-90 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Crear Survival
          </button>

          {/* Toggle Mis Survivals / Ver Shows */}
          {(isCreatorOrAdmin || isJudge) && (
            <button
              onClick={() => setMainView((v) => (v === 'show' ? 'mis_survivals' : 'show'))}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition active:scale-95 cursor-pointer border ${
                mainView === 'mis_survivals'
                  ? 'bg-amber-600 text-white border-amber-500 shadow'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              {mainView === 'mis_survivals' ? 'Ver Show en Vivo' : 'Mis Survivals (Panel)'}
            </button>
          )}

          {/* Follow Survival button */}
          {currentShow && (
            <button
              onClick={() => toggleSurvivalFollow(currentShow.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer border ${
                isFollowing
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                  : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="Notificarme cuando abran votaciones o nuevos episodios"
            >
              <Bell className={`w-3.5 h-3.5 ${isFollowing ? 'text-indigo-400 fill-indigo-400' : ''}`} />
              {isFollowing ? `Siguiendo (${followers.length})` : `Seguir (${followers.length})`}
            </button>
          )}

          {/* Stage 1: Apply Button (Hidden for Fans!) */}
          {stage === 'applications' && !isFan && (
            <button
              onClick={() => setIsApplyModalOpen(true)}
              disabled={!!myApplication}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-xs shadow transition active:scale-95 cursor-pointer ${
                myApplication
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              {myApplication ? '✓ Postulación Enviada' : 'Aplicar al Survival (Formulario)'}
            </button>
          )}
        </div>
      </div>

      {/* Show Selector Bar if multiple shows exist */}
      {survivals.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {survivals.map((show) => {
            const isSelected = currentShow?.id === show.id;
            return (
              <button
                key={show.id}
                onClick={() => {
                  setSelectedSurvivalId(show.id);
                  setMainView('show');
                }}
                style={isSelected ? { backgroundColor: primaryButtonColor } : undefined}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 active:scale-95 cursor-pointer flex-shrink-0 ${
                  isSelected
                    ? 'text-white shadow'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <img src={show.icon || show.banner} alt="icon" className="w-4 h-4 rounded-full object-cover" />
                <span>{show.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 font-normal">
                  {show.stage === 'applications' ? 'Casting' : 'En Competencia'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* EMPTY STATE WHEN NO SURVIVALS EXIST */}
      {survivals.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-14 text-center shadow-2xl space-y-6 max-w-2xl mx-auto my-8 animate-fadeIn">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Flame className="w-10 h-10 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">No hay ningún Survival activo todavía</h2>
            <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              Organiza tu propio reality de supervivencia idol: define temporada de casting, preguntas personalizadas, rondas eliminatorias con reglas por equipos o votos, y desbloquea una tienda exclusiva de merch.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setWizardStep(1);
              setIsCreateShowModalOpen(true);
            }}
            style={{ backgroundColor: primaryButtonColor }}
            className="px-8 py-3.5 rounded-2xl text-white font-black text-sm shadow-xl hover:opacity-95 transition active:scale-95 inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Crear Nuevo Survival Show (Asistente Paso a Paso)
          </button>
        </div>
      )}

      {/* VIEW A: "MIS SURVIVALS" ADMIN & OWNER PANEL */}
      {mainView === 'mis_survivals' && currentShow && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-1">
                <Settings className="w-4 h-4" /> Panel del Administrador & Creador Dueño
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{currentShow.title}</h2>
              <p className="text-xs text-slate-400 mt-1">
                Empresa a cargo: <strong className="text-indigo-400">{currentShow.companyInCharge || 'YM-ki Records'}</strong> · Jueces: {currentShow.judges?.map((j) => `@${j.username}`).join(', ') || 'Ninguno'}
              </p>
            </div>

            {/* Stage Transition Control */}
            <div className="flex items-center gap-2">
              {stage === 'applications' ? (
                <button
                  onClick={() => {
                    advanceSurvivalStage(currentShow.id, 'competition');
                    showToast('¡El programa ha iniciado oficialmente con los aspirantes recolectados!');
                    setMainView('show');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <PlayCircle className="w-4 h-4" />
                  Iniciar Programa con Aspirantes Seleccionados
                </button>
              ) : (
                <button
                  onClick={() => advanceSurvivalStage(currentShow.id, 'applications')}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-700"
                >
                  Volver a Etapa de Casting
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block font-bold">Meta de Aspirantes</span>
              <span className="text-xl font-black text-white">
                {participants.length} / {currentShow.targetApplicantsCount || currentShow.maxParticipants || 24}
              </span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block font-bold">Postulaciones Recibidas</span>
              <span className="text-xl font-black text-amber-400">{applications.length}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block font-bold">Casting Fin</span>
              <span className="text-sm font-black text-indigo-400 mt-1 block">
                {currentShow.castingEndDate || currentShow.deadline}
              </span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block font-bold">Total de Rondas</span>
              <span className="text-xl font-black text-rose-400">{rounds.length}</span>
            </div>
          </div>

          {/* BUILDER: Personalizar Formulario de Audición */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-indigo-400" />
                  Personalizar Formulario de Audición
                </h3>
                <p className="text-xs text-slate-400">
                  Agrega preguntas de texto, opciones con respuesta correcta o neutral, o solicitud de archivos para que los aspirantes respondan al postular.
                </p>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {(currentShow.customAuditionQuestions || []).map((q, qIndex) => (
                <div key={q.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-amber-400">P{qIndex + 1}.</span>
                      <strong className="text-white text-sm">{q.question}</strong>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                        {q.type === 'text' ? 'Texto Libre' : q.type === 'options' ? 'Opciones' : 'Archivo / Media'}
                      </span>
                      {q.required && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 font-bold border border-rose-800">
                          Obligatoria
                        </span>
                      )}
                    </div>

                    {q.options && q.options.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {q.options.map((opt) => (
                          <span
                            key={opt.id}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                              opt.type === 'correct' || opt.isCorrect
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {opt.text} {opt.type === 'correct' ? '✓ (Correcta)' : '· (Neutral)'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      const updated = (currentShow.customAuditionQuestions || []).filter((item) => item.id !== q.id);
                      updateSurvivalShow(currentShow.id, { customAuditionQuestions: updated });
                      showToast('Pregunta eliminada.');
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg cursor-pointer transition"
                    title="Eliminar pregunta"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Question Form */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <span className="text-xs font-bold text-slate-300 uppercase block">
                + Añadir Nueva Pregunta al Formulario
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-slate-400 font-bold">Pregunta</label>
                  <input
                    type="text"
                    placeholder="Ej. ¿Cuántos años de experiencia tienes entrenando baile?"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Tipo de Respuesta</label>
                  <select
                    value={newQuestionType}
                    onChange={(e) => setNewQuestionType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="text">Texto Libre</option>
                    <option value="options">Pregunta con Opciones</option>
                    <option value="file">Adjuntar Archivo / Video</option>
                  </select>
                </div>
              </div>

              {/* If Options: Add options with correct/neutral tags */}
              {newQuestionType === 'options' && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <label className="text-xs font-bold text-slate-300 block">
                    Opciones Disponibles ({newQuestionOptions.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {newQuestionOptions.map((opt, i) => (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                          opt.type === 'correct'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <span>{opt.text}</span>
                        <span className="text-[10px] opacity-80">
                          ({opt.type === 'correct' ? 'Correcta' : 'Neutral'})
                        </span>
                        <button
                          type="button"
                          onClick={() => setNewQuestionOptions(newQuestionOptions.filter((_, idx) => idx !== i))}
                          className="hover:text-red-400 cursor-pointer ml-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Texto de la opción..."
                      value={tempOptionText}
                      onChange={(e) => setTempOptionText(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                    />
                    <select
                      value={tempOptionType}
                      onChange={(e) => setTempOptionType(e.target.value as any)}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                    >
                      <option value="neutral">Neutral</option>
                      <option value="correct">Respuesta Correcta</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (tempOptionText.trim()) {
                          setNewQuestionOptions([
                            ...newQuestionOptions,
                            {
                              id: 'opt-' + Date.now(),
                              text: tempOptionText.trim(),
                              type: tempOptionType,
                              isCorrect: tempOptionType === 'correct'
                            }
                          ]);
                          setTempOptionText('');
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
                    >
                      + Añadir Opción
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-bold">
                  <input
                    type="checkbox"
                    checked={newQuestionRequired}
                    onChange={(e) => setNewQuestionRequired(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-950"
                  />
                  Respuesta Obligatoria
                </label>

                <button
                  type="button"
                  onClick={handleAddCustomQuestion}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow active:scale-95 cursor-pointer"
                >
                  Guardar Pregunta en Formulario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: MAIN SURVIVAL WORKSPACE */}
      {mainView === 'show' && currentShow && (
        <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl space-y-0">
          {/* Cover Banner */}
          <div className="relative h-60 sm:h-72 w-full bg-slate-950 overflow-hidden">
            <img src={currentShow.banner} alt={currentShow.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent p-6 sm:p-8 flex flex-col justify-end">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                    stage === 'applications' ? 'bg-amber-600 text-white' : 'bg-rose-600 text-white animate-pulse'
                  }`}
                >
                  {stage === 'applications' ? 'Etapa 1: Temporada de Casting' : 'Etapa 2: Competencia Oficial'}
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800/90 text-slate-200 border border-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  {currentShow.companyInCharge || 'YM-ki Records'}
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800/90 text-slate-200 border border-slate-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  {participants.length} Aspirantes Admitidos
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800/90 text-slate-200 border border-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Casting: {currentShow.castingStartDate || 'Inicio'} → {currentShow.castingEndDate || currentShow.deadline}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={currentShow.icon || currentShow.banner}
                  alt="icon"
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
                />
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{currentShow.title}</h2>
                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-1 max-w-2xl font-medium">
                    {currentShow.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ROLE-BASED TABS NAVIGATION */}
          <div className="p-3 sm:p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/95 backdrop-blur-md">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none">
              {/* TABS FOR ASPIRANTES (CONTESTANTS) */}
              {isParticipant && (
                <>
                  <button
                    onClick={() => setActiveTab('episodios')}
                    style={activeTab === 'episodios' ? { backgroundColor: primaryButtonColor } : undefined}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'episodios' ? 'text-white shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 text-rose-400" />
                    Episodios ({currentShow.episodes?.length || 0})
                  </button>

                  <button
                    onClick={() => setActiveTab('entregar_trabajo')}
                    style={activeTab === 'entregar_trabajo' ? { backgroundColor: primaryButtonColor } : undefined}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'entregar_trabajo' ? 'text-white shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5 text-indigo-400" />
                    Entregar Trabajo
                  </button>

                  <button
                    onClick={() => setActiveTab('mis_equipos')}
                    style={activeTab === 'mis_equipos' ? { backgroundColor: primaryButtonColor } : undefined}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'mis_equipos' ? 'text-white shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    Mis Equipos
                  </button>

                  <button
                    onClick={() => setActiveTab('mi_historial')}
                    style={activeTab === 'mi_historial' ? { backgroundColor: primaryButtonColor } : undefined}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'mi_historial' ? 'text-white shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    Mi Historial
                  </button>

                  <button
                    onClick={() => setActiveTab('votos_stats')}
                    style={activeTab === 'votos_stats' ? { backgroundColor: primaryButtonColor } : undefined}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'votos_stats' ? 'text-white shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                    Votos & Estadísticas
                  </button>

                  <button
                    onClick={() => setActiveTab('comentarios')}
                    style={activeTab === 'comentarios' ? { backgroundColor: primaryButtonColor } : undefined}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'comentarios' ? 'text-white shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
                    Comentarios ({currentShow.comments?.length || 0})
                  </button>
                </>
              )}

              {/* TABS FOR FANS & NORMAL USERS (NOT PARTICIPANTS, NOT JUDGE/ADMIN) */}
              {!isParticipant && !isJudgeOrAdmin && (
                <>
                  <button
                    onClick={() => setActiveTab('perfil_aspirantes')}
                    style={activeTab === 'perfil_aspirantes' ? { backgroundColor: primaryButtonColor } : undefined}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'perfil_aspirantes' ? 'text-white shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    Perfil de Aspirantes ({participants.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('votos_stats')}
                    style={activeTab === 'votos_stats' ? { backgroundColor: primaryButtonColor } : undefined}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'votos_stats' ? 'text-white shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Vote className="w-3.5 h-3.5 text-indigo-400" />
                    Mis Votos & Estadísticas
                  </button>

                  <button
                    onClick={() => setActiveTab('tienda')}
                    style={activeTab === 'tienda' ? { backgroundColor: primaryButtonColor } : undefined}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'tienda' ? 'text-white shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                    Tienda Oficial Survival
                  </button>

                  <button
                    onClick={() => setActiveTab('comentarios')}
                    style={activeTab === 'comentarios' ? { backgroundColor: primaryButtonColor } : undefined}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'comentarios' ? 'text-white shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
                    Comentarios ({currentShow.comments?.length || 0})
                  </button>
                </>
              )}

              {/* TABS FOR JUDGES & ADMINS */}
              {isJudgeOrAdmin && !isParticipant && (
                <>
                  <button
                    onClick={() => setActiveTab('votos_stats')}
                    style={activeTab === 'votos_stats' ? { backgroundColor: primaryButtonColor } : undefined}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'votos_stats' ? 'text-white shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                    Votos & Estadísticas
                  </button>

                  <button
                    onClick={() => setActiveTab('editar_rondas')}
                    style={activeTab === 'editar_rondas' ? { backgroundColor: primaryButtonColor } : undefined}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'editar_rondas' ? 'text-white shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    Editar Rondas ({rounds.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('aspirantes_admin')}
                    style={activeTab === 'aspirantes_admin' ? { backgroundColor: primaryButtonColor } : undefined}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'aspirantes_admin' ? 'text-white shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    Aspirantes ({participants.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('audiciones')}
                    style={activeTab === 'audiciones' ? { backgroundColor: primaryButtonColor } : undefined}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'audiciones' ? 'text-white shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <ClipboardList className="w-3.5 h-3.5 text-rose-400" />
                    Audiciones ({applications.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('tienda')}
                    style={activeTab === 'tienda' ? { backgroundColor: primaryButtonColor } : undefined}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'tienda' ? 'text-white shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                    Tienda (Añadir Merch)
                  </button>

                  <button
                    onClick={() => setActiveTab('comentarios')}
                    style={activeTab === 'comentarios' ? { backgroundColor: primaryButtonColor } : undefined}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'comentarios' ? 'text-white shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
                    Comentarios
                  </button>
                </>
              )}
            </div>

            {/* Quick Actions Right Side */}
            <div className="flex items-center gap-2">
              {isJudgeOrAdmin && (
                <button
                  onClick={() => setIsAddEpisodeModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Episodio
                </button>
              )}
            </div>
          </div>

          {/* TAB CONTENT 1: PERFIL DE ASPIRANTES & ELECCIÓN DE TOP 3 FAVORITOS */}
          {(activeTab === 'perfil_aspirantes' || activeTab === 'aspirantes_admin') && (
            <div className="p-6 sm:p-8 space-y-6">
              {/* Header with Top 3 Favorites Info for Fans */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    Aspirantes Oficiales & Tus 3 Favoritos
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Apoya a tus favoritos: Cada fan puede escoger hasta <strong className="text-amber-400 font-bold">3 favoritos</strong> oficiales.
                    {myFavorites.length > 0 && (
                      <span className="text-white ml-2">
                        Has elegido: {myFavorites.map((u) => `@${u}`).join(', ')} ({myFavorites.length}/3)
                      </span>
                    )}
                  </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre..."
                      value={candidateSearch}
                      onChange={(e) => setCandidateSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <select
                    value={specialtyFilter}
                    onChange={(e) => setSpecialtyFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  >
                    <option value="all">Todas Especialidades</option>
                    <option value="vocal">Vocal</option>
                    <option value="rap">Rap</option>
                    <option value="baile">Baile</option>
                    <option value="all_rounder">All-Rounder</option>
                  </select>
                </div>
              </div>

              {/* Contestants Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredParticipants.map((p, idx) => {
                  const isFav = myFavorites.includes(p.username);
                  return (
                    <div
                      key={p.id}
                      className={`rounded-2xl p-4 border transition flex flex-col justify-between ${
                        isFav
                          ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-950/30'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900">
                          <img
                            src={p.auditionMedia.startsWith('http') ? p.auditionMedia : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-black text-amber-400 border border-amber-500/40">
                            #{idx + 1}
                          </div>
                          {isFav && (
                            <div className="absolute top-2 right-2 bg-amber-500 text-black px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 shadow">
                              <Star className="w-3 h-3 fill-black" /> Favorito
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-black text-white">{p.name}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold uppercase">
                              {p.specialty}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">@{p.username} · {p.age} años</span>
                          {p.motto && (
                            <p className="text-[11px] text-slate-400 italic line-clamp-2 mt-1">"{p.motto}"</p>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between gap-2">
                        {/* Vote Button */}
                        <button
                          onClick={() => voteSurvivalParticipant(currentShow.id, p.id)}
                          className="flex-1 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Vote className="w-3.5 h-3.5" />
                          Votar ({p.votes})
                        </button>

                        {/* Top 3 Favorite Toggle for Fans */}
                        <button
                          onClick={() => toggleSurvivalFavorite(currentShow.id, p.username)}
                          className={`p-2 rounded-xl transition cursor-pointer active:scale-95 ${
                            isFav
                              ? 'bg-amber-500 text-black shadow-md'
                              : 'bg-slate-800 text-slate-400 hover:text-amber-400'
                          }`}
                          title={isFav ? 'Retirar de favoritos' : 'Añadir a tus 3 favoritos'}
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'fill-black' : ''}`} />
                        </button>

                        {/* Judges / Admin can ONLY remove/eliminate contestants */}
                        {isJudgeOrAdmin && (
                          <button
                            onClick={() => {
                              updateSurvivalParticipantStatus(currentShow.id, p.id, 'eliminated');
                              showToast(`@${p.username} ha sido retirado(a) del survival.`);
                            }}
                            className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 hover:text-white transition cursor-pointer active:scale-95"
                            title="Sacar Aspirante del Survival (Solo Jurados / Admins)"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredParticipants.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No hay aspirantes registrados con los filtros seleccionados.
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT 2: VOTOS & ESTADÍSTICAS */}
          {activeTab === 'votos_stats' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    Tabla de Posiciones & Resultados de Votaciones
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Ranking actualizado con votos de la comunidad, calificaciones del jurado y estadísticas generales.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {participants
                  .sort((a, b) => b.votes - a.votes)
                  .map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                            idx === 0
                              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                              : idx === 1
                              ? 'bg-slate-300 text-black'
                              : idx === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <strong className="text-sm font-bold text-white block">{p.name}</strong>
                          <span className="text-xs text-slate-400">@{p.username} · {p.specialty.toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-sm font-black text-indigo-400">{p.votes} votos</span>
                          <span className="text-[10px] text-slate-500 block">Comunidad Oficial</span>
                        </div>

                        {/* If Judge/Admin, button to grade */}
                        {isJudgeOrAdmin && currentRound && (
                          <button
                            onClick={() => {
                              setParticipantToGrade(p);
                              setIsJudgeGradeModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
                          >
                            Calificar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT 3: EPISODIOS */}
          {activeTab === 'episodios' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Video className="w-4 h-4 text-rose-500" />
                  Transmisión de Episodios Oficiales
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(currentShow.episodes || []).map((ep) => (
                  <div key={ep.id} className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 space-y-3 p-4">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900">
                      <img src={ep.thumbnail || currentShow.banner} alt={ep.title} className="w-full h-full object-cover" />
                      <a
                        href={ep.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/20 transition group"
                      >
                        <PlayCircle className="w-12 h-12 text-white group-hover:scale-110 transition shadow-lg" />
                      </a>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800">
                        Episodio #{ep.episodeNumber}
                      </span>
                      <h4 className="text-sm font-black text-white mt-1">{ep.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{ep.description}</p>
                    </div>
                  </div>
                ))}

                {(currentShow.episodes || []).length === 0 && (
                  <div className="col-span-2 text-center py-12 text-slate-500 text-xs">
                    Aún no se han emitido episodios para este Survival.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT 4: ENTREGAR TRABAJO (CONTESTANTS) */}
          {activeTab === 'entregar_trabajo' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <h3 className="text-base font-black text-white">Subir Entrega de Ronda Actual</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ronda activa: <strong className="text-indigo-400">{currentRound?.title || 'Ronda Inicial'}</strong>
                </p>
              </div>

              <form onSubmit={handleMissionSubmit} className="space-y-4 max-w-xl text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Título de tu Performance o Trabajo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Performance Vocal - ECLIPSE"
                    value={missionTitle}
                    onChange={(e) => setMissionTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-bold">Enlace o Archivo de Video/Audio</label>
                    <FileUploadButton
                      onUploadSuccess={(url) => setMissionMediaUrl(url)}
                      label="Subir Archivo"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="URL de YouTube, Drive o sube desde tu dispositivo..."
                    value={missionMediaUrl}
                    onChange={(e) => setMissionMediaUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Notas de la Entrega</label>
                  <textarea
                    rows={3}
                    placeholder="Describe los arreglos, técnicas empleadas y notas para el jurado..."
                    value={missionNotes}
                    onChange={(e) => setMissionNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <button
                  type="submit"
                  style={{ backgroundColor: primaryButtonColor }}
                  className="px-5 py-2.5 rounded-xl text-white font-extrabold text-xs shadow active:scale-95 cursor-pointer"
                >
                  Enviar Trabajo Oficial
                </button>
              </form>
            </div>
          )}

          {/* TAB CONTENT 5: MIS EQUIPOS */}
          {activeTab === 'mis_equipos' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <h3 className="text-base font-black text-white">Equipos Asignados de la Ronda</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Revisa tu equipo asignado, compañeros y concepto de la batalla grupal.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(currentShow.teams && currentShow.teams.length > 0
                  ? currentShow.teams
                  : [
                      { id: 't-1', name: 'Equipo Eclipse (Vocal Focus)', members: participants.slice(0, 3).map((p) => p.username), mission: 'Armonía y afinación' },
                      { id: 't-2', name: 'Equipo Horizon (Dance Focus)', members: participants.slice(3, 6).map((p) => p.username), mission: 'Sincronización y fuerza' }
                    ]
                ).map((team) => (
                  <div key={team.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-white">{team.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-bold border border-indigo-800">
                        {team.members.length} Integrantes
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Misión: {team.mission}</p>
                    <div className="space-y-1 pt-2 border-t border-slate-800">
                      <span className="text-[11px] text-slate-400 font-bold block">Miembros:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {team.members.map((u) => (
                          <span
                            key={u}
                            className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                              u === currentUser ? 'bg-amber-950 text-amber-300 border-amber-700' : 'bg-slate-900 text-slate-300 border-slate-700'
                            }`}
                          >
                            @{u} {u === currentUser ? '(Tú)' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT 6: MI HISTORIAL */}
          {activeTab === 'mi_historial' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <h3 className="text-base font-black text-white">Mi Historial en el Survival</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Registro de tus entregas, calificaciones de jueces y avance de rondas.
                </p>
              </div>

              <div className="space-y-3">
                {rounds.map((r) => {
                  const mySub = r.submissions?.find((s) => s.participantUsername === currentUser);
                  return (
                    <div key={r.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm font-bold text-white">Ronda {r.roundNumber}: {r.title}</strong>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                          {mySub ? '✓ Trabajo Entregado' : 'Pendiente de Entrega'}
                        </span>
                      </div>
                      {mySub && (
                        <div className="text-xs text-slate-400">
                          Enlace: <a href={mySub.workUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">{mySub.workUrl}</a>
                          {mySub.notes && <p className="mt-1 italic">"{mySub.notes}"</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB CONTENT 7: TIENDA EXCLUSIVA SURVIVAL (MERCH DE ASPIRANTES) */}
          {activeTab === 'tienda' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    Tienda Oficial & Merch del Survival
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Exclusivo para seguidores del programa: Adquiere photocards oficiales, kits de apoyo y prendas de los aspirantes.
                  </p>
                </div>

                {/* If Judge/Admin: Button to add Merch Product */}
                {isJudgeOrAdmin && (
                  <button
                    onClick={() => setIsAddMerchModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Añadir Producto de Merch
                  </button>
                )}
              </div>

              {/* Survival Merch Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {survivalMerch.map((prod) => (
                  <div key={prod.id} className="rounded-2xl p-4 bg-slate-950 border border-slate-800 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900">
                        <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white line-clamp-1">{prod.name}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">{prod.description}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 mt-3 flex items-center justify-between">
                      <span className="text-xs font-black text-amber-400">{prod.priceCoins} 🪙 / {prod.priceGems} 💎</span>
                      <button
                        onClick={() => buyProduct(prod.id, 'coins')}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold active:scale-95 cursor-pointer"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                ))}

                {survivalMerch.length === 0 && (
                  <div className="col-span-full text-center py-12 text-slate-500 text-xs">
                    Aún no se ha añadido mercancía para este Survival. {isJudgeOrAdmin ? 'Pulsa "Añadir Producto de Merch" arriba.' : ''}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT 8: EDITAR RONDAS (JUDGES/ADMINS) */}
          {activeTab === 'editar_rondas' && isJudgeOrAdmin && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Personalización & Edición de Rondas
                  </h3>
                  <p className="text-xs text-slate-400">
                    Modifica reglas, número de eliminaciones y sistema de decisión de cada ronda.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {rounds.map((r, i) => (
                  <div key={r.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-indigo-400">Ronda {r.roundNumber}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                        {r.isTeamBased ? 'Por Equipos' : 'Individual'} · {r.eliminationsCount || 4} eliminados
                      </span>
                    </div>
                    <input
                      type="text"
                      value={r.name}
                      onChange={(e) => {
                        const updated = rounds.map((rd) => (rd.id === r.id ? { ...rd, name: e.target.value } : rd));
                        updateSurvivalShow(currentShow.id, { rounds: updated });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm"
                    />
                    <textarea
                      rows={2}
                      value={r.rules}
                      onChange={(e) => {
                        const updated = rounds.map((rd) => (rd.id === r.id ? { ...rd, rules: e.target.value } : rd));
                        updateSurvivalShow(currentShow.id, { rounds: updated });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT 9: AUDICIONES (REVISIÓN DE ASPIRANTES POR CREADOR Y JUECES) */}
          {activeTab === 'audiciones' && isJudgeOrAdmin && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-amber-400" />
                    Revisión Oficial de Audiciones ({applications.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Evalúa las audiciones enviadas. Puedes <strong className="text-emerald-400">Admitir</strong> al aspirante, dejarlo en <strong className="text-amber-400">Lista de Opciones</strong>, o <strong className="text-rose-400">Rechazar</strong>.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm font-black">{app.applicantNickname}</strong>
                        <span className="text-slate-400">@{app.applicantUsername}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                            app.status === 'accepted'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : app.status === 'shortlist'
                              ? 'bg-amber-950 text-amber-300 border border-amber-700'
                              : app.status === 'rejected'
                              ? 'bg-rose-950 text-rose-300 border border-rose-700'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {app.status === 'accepted'
                            ? 'Admitido'
                            : app.status === 'shortlist'
                            ? 'Lista de Opciones'
                            : app.status === 'rejected'
                            ? 'Rechazado'
                            : 'Pendiente'}
                        </span>
                      </div>

                      <div className="text-slate-300 space-y-1 pt-1">
                        <div>
                          <span className="text-slate-500 font-bold">Especialidad: </span>
                          <span className="uppercase text-amber-400">{app.responses['specialty'] || 'Vocal'}</span> · Edad: {app.responses['age'] || '20'}
                        </div>
                        {app.responses['audition_media'] && (
                          <div>
                            <span className="text-slate-500 font-bold">Audición: </span>
                            <a
                              href={app.responses['audition_media']}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-400 hover:underline"
                            >
                              Ver Grabación / Video
                            </a>
                          </div>
                        )}
                        {app.responses['motto'] && (
                          <p className="italic text-slate-400">"{app.responses['motto']}"</p>
                        )}
                      </div>
                    </div>

                    {/* Actions: Admitir, Lista de Opciones, Rechazar */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          reviewSurvivalApplication(currentShow.id, app.id, 'accepted');
                          showToast(`¡@${app.applicantUsername} admitido(a) oficialmente al Survival!`);
                        }}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs cursor-pointer active:scale-95"
                      >
                        ✓ Admitir
                      </button>
                      <button
                        onClick={() => {
                          reviewSurvivalApplication(currentShow.id, app.id, 'shortlist');
                          showToast(`@${app.applicantUsername} colocado en lista de opciones.`);
                        }}
                        className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs cursor-pointer active:scale-95"
                      >
                        ★ Lista de Opciones
                      </button>
                      <button
                        onClick={() => {
                          reviewSurvivalApplication(currentShow.id, app.id, 'rejected');
                          showToast(`Postulación de @${app.applicantUsername} rechazada.`);
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 font-bold text-xs cursor-pointer active:scale-95"
                      >
                        ✕ Rechazar
                      </button>
                    </div>
                  </div>
                ))}

                {applications.length === 0 && (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No se han recibido postulaciones aún.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT 10: COMENTARIOS */}
          {activeTab === 'comentarios' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-pink-400" />
                  Muro de Comentarios & Debate en Vivo
                </h3>
              </div>

              {/* Add Comment */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe un comentario sobre el survival..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newCommentText.trim()) {
                      addSurvivalComment(currentShow.id, newCommentText);
                      setNewCommentText('');
                    }
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newCommentText.trim()) {
                      addSurvivalComment(currentShow.id, newCommentText);
                      setNewCommentText('');
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-extrabold text-xs cursor-pointer active:scale-95"
                >
                  Publicar
                </button>
              </div>

              <div className="space-y-2 pt-2">
                {(currentShow.comments || []).map((com) => (
                  <div key={com.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-white font-black">@{com.author}</strong>
                      <span className="text-[10px] text-slate-500">
                        {new Date(com.date).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                    <p className="text-slate-300">{com.text}</p>
                  </div>
                ))}

                {(currentShow.comments || []).length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    Sé el primero en comentar sobre este Survival.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MULTI-STEP CREATION WIZARD MODAL */}
      {isCreateShowModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overflow-y-auto flex items-start justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-auto sm:my-8 max-h-[88vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-800">
                  Paso {wizardStep} de {totalRoundsCount + 1}
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  {wizardStep === 1
                    ? 'Crear Nuevo Survival Show (Datos Generales)'
                    : `Personalizar Ronda ${wizardStep - 1} de ${totalRoundsCount}`}
                </h3>
              </div>
              <button
                onClick={() => setIsCreateShowModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: GENERAL INFO */}
            {wizardStep === 1 && (
              <div className="space-y-4 text-xs">
                {/* Nombre */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Nombre del Survival *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. YM-ki Idol Awakening 2026"
                    value={newShowTitle}
                    onChange={(e) => setNewShowTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                {/* Banner & Icon with FileUploadButton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-300 font-bold">Banner Oficial</label>
                      <FileUploadButton
                        onUploadSuccess={(url) => setNewShowBanner(url)}
                        label="Subir Banner"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="URL o sube desde tu dispositivo..."
                      value={newShowBanner}
                      onChange={(e) => setNewShowBanner(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-300 font-bold">Ícono / Logo del Show</label>
                      <FileUploadButton
                        onUploadSuccess={(url) => setNewShowIcon(url)}
                        label="Subir Ícono"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="URL o sube imagen circular..."
                      value={newShowIcon}
                      onChange={(e) => setNewShowIcon(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                </div>

                {/* Añadir Jueces (por nombre de usuario) */}
                <div className="space-y-2">
                  <label className="text-slate-300 font-bold block">
                    Añadir Jueces (por nombre de usuario)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ej. miki, ako, jin..."
                      value={judgeUsernameInput}
                      onChange={(e) => setJudgeUsernameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && judgeUsernameInput.trim()) {
                          e.preventDefault();
                          const u = judgeUsernameInput.trim().replace(/^@/, '');
                          if (!newShowJudges.includes(u)) {
                            setNewShowJudges([...newShowJudges, u]);
                          }
                          setJudgeUsernameInput('');
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const u = judgeUsernameInput.trim().replace(/^@/, '');
                        if (u && !newShowJudges.includes(u)) {
                          setNewShowJudges([...newShowJudges, u]);
                          setJudgeUsernameInput('');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                    >
                      + Añadir Juez
                    </button>
                  </div>

                  {newShowJudges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {newShowJudges.map((j) => (
                        <span
                          key={j}
                          className="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-700 font-bold flex items-center gap-1.5"
                        >
                          @{j}
                          <button
                            type="button"
                            onClick={() => setNewShowJudges(newShowJudges.filter((item) => item !== j))}
                            className="hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cuánto dura la temporada de castings (Inicio y Fin) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Fecha Inicio de Casting</label>
                    <input
                      type="date"
                      value={castingStartDate}
                      onChange={(e) => setCastingStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Fecha Fin de Casting</label>
                    <input
                      type="date"
                      value={castingEndDate}
                      onChange={(e) => setCastingEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                </div>

                {/* Empresa a Cargo */}
                <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="text-slate-300 font-bold block">Empresa a Cargo</label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                    <input
                      type="checkbox"
                      checked={useYmkiCompany}
                      onChange={(e) => setUseYmkiCompany(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 bg-slate-900"
                    />
                    Empresa oficial YM-ki Records
                  </label>

                  {!useYmkiCompany && (
                    <div className="pt-2">
                      <label className="text-[11px] text-slate-400 block mb-1">
                        O selecciona una de las empresas aliadas:
                      </label>
                      <select
                        value={selectedPartnerCompany}
                        onChange={(e) => setSelectedPartnerCompany(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                      >
                        <option value="">-- Escoger Empresa Aliada --</option>
                        {partners.map((p) => (
                          <option key={p.id} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Cuántos aspirantes se necesitan & Extender casting toggle */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Aspirantes Requeridos</label>
                    <input
                      type="number"
                      min={6}
                      max={99}
                      value={targetApplicantsCount}
                      onChange={(e) => setTargetApplicantsCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">¿Cuántas rondas tendrá?</label>
                    <select
                      value={totalRoundsCount}
                      onChange={(e) => handleRoundsCountChange(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                    >
                      <option value={1}>1 Ronda</option>
                      <option value={2}>2 Rondas</option>
                      <option value={3}>3 Rondas</option>
                      <option value={4}>4 Rondas</option>
                      <option value={5}>5 Rondas</option>
                      <option value={6}>6 Rondas</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                    <input
                      type="checkbox"
                      checked={extendCastingIfUnderTarget}
                      onChange={(e) => setExtendCastingIfUnderTarget(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 bg-slate-900"
                    />
                    ¿Extender tiempo de casting si no se cumple con la meta de aspirantes?
                  </label>
                </div>

                {/* Next Button */}
                <div className="pt-4 flex justify-end border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      if (!newShowTitle.trim()) {
                        showToast('Introduce el nombre del survival.');
                        return;
                      }
                      setWizardStep(2);
                    }}
                    style={{ backgroundColor: primaryButtonColor }}
                    className="px-6 py-2.5 rounded-xl text-white font-black text-xs shadow cursor-pointer active:scale-95 flex items-center gap-1.5"
                  >
                    Siguiente: Personalizar Ronda 1
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2..N: CUSTOMIZE EACH ROUND */}
            {wizardStep > 1 && wizardStep <= totalRoundsCount + 1 && (
              <div className="space-y-4 text-xs">
                {(() => {
                  const roundIndex = wizardStep - 2;
                  const currentDraft = roundsDraft[roundIndex] || {
                    name: `Ronda ${roundIndex + 1}`,
                    rules: 'Reglas de la ronda',
                    isTeamBased: false,
                    eliminationsCount: 4,
                    decisionSystem: 'combined'
                  };

                  const updateCurrentDraft = (patch: Partial<RoundDraft>) => {
                    setRoundsDraft((prev) => {
                      const copy = [...prev];
                      copy[roundIndex] = { ...copy[roundIndex], ...patch };
                      return copy;
                    });
                  };

                  return (
                    <>
                      <div className="space-y-1">
                        <label className="text-slate-300 font-bold">Nombre de la Ronda</label>
                        <input
                          type="text"
                          required
                          value={currentDraft.name}
                          onChange={(e) => updateCurrentDraft({ name: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-bold">Reglas de la Ronda</label>
                        <textarea
                          rows={3}
                          required
                          value={currentDraft.rules}
                          onChange={(e) => updateCurrentDraft({ rules: e.target.value })}
                          placeholder="Escoge o redacta las reglas obligatorias de esta ronda..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-slate-300 font-bold">Modalidad</label>
                          <select
                            value={currentDraft.isTeamBased ? 'equipos' : 'individual'}
                            onChange={(e) => updateCurrentDraft({ isTeamBased: e.target.value === 'equipos' })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                          >
                            <option value="individual">Individual</option>
                            <option value="equipos">Por Equipos</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-300 font-bold">¿Cuántos se eliminarán?</label>
                          <input
                            type="number"
                            min={0}
                            max={30}
                            value={currentDraft.eliminationsCount}
                            onChange={(e) => updateCurrentDraft({ eliminationsCount: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-bold">Sistema de Decisión / Evaluación</label>
                        <select
                          value={currentDraft.decisionSystem}
                          onChange={(e) => updateCurrentDraft({ decisionSystem: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                        >
                          <option value="votes">Por Votaciones de la Comunidad / Fans</option>
                          <option value="judges">Decisión Exclusiva de Jueces</option>
                          <option value="contestants">Los Mismos Aspirantes Decidirán</option>
                          <option value="combined">Sistema Combinado (Fans + Jueces + Aspirantes)</option>
                        </select>
                      </div>

                      {/* Navigation Buttons */}
                      <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setWizardStep((s) => s - 1)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                        >
                          Atrás
                        </button>

                        {wizardStep < totalRoundsCount + 1 ? (
                          <button
                            type="button"
                            onClick={() => setWizardStep((s) => s + 1)}
                            style={{ backgroundColor: primaryButtonColor }}
                            className="px-5 py-2.5 rounded-xl text-white font-black shadow cursor-pointer active:scale-95 flex items-center gap-1.5"
                          >
                            Siguiente: Ronda {roundIndex + 2}
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleFinishWizard}
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-lg cursor-pointer active:scale-95 flex items-center gap-1.5"
                          >
                            ✓ Finalizar y Publicar Survival
                          </button>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AUDITION APPLICATION MODAL FOR USERS */}
      {isApplyModalOpen && currentShow && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overflow-y-auto flex items-start justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-auto sm:my-8 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-black text-white text-base flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-amber-400" />
                  Formulario de Postulación al Survival
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{currentShow.title}</p>
              </div>
              <button onClick={() => setIsApplyModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Nombre Artístico</label>
                  <input
                    type="text"
                    required
                    value={formResponses['name'] || ''}
                    onChange={(e) => setFormResponses({ ...formResponses, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Edad</label>
                  <input
                    type="number"
                    min={14}
                    max={40}
                    required
                    value={formResponses['age'] || ''}
                    onChange={(e) => setFormResponses({ ...formResponses, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Especialidad Principal</label>
                <select
                  value={formResponses['specialty'] || 'vocal'}
                  onChange={(e) => setFormResponses({ ...formResponses, specialty: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="vocal">Vocal</option>
                  <option value="rap">Rap</option>
                  <option value="baile">Baile</option>
                  <option value="all_rounder">All-Rounder</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold">Enlace o Archivo de Audición *</label>
                  <FileUploadButton
                    onUploadSuccess={(url) => setFormResponses({ ...formResponses, audition_media: url })}
                    label="Subir Archivo"
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="URL o sube desde tu dispositivo..."
                  value={formResponses['audition_media'] || ''}
                  onChange={(e) => setFormResponses({ ...formResponses, audition_media: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Lema / Mensaje para el Fandom</label>
                <textarea
                  rows={2}
                  placeholder="Tu mensaje de determinación..."
                  value={formResponses['motto'] || ''}
                  onChange={(e) => setFormResponses({ ...formResponses, motto: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              {/* DYNAMIC CUSTOM QUESTIONS CONFIGURED BY THE OWNER */}
              {(currentShow.customAuditionQuestions || []).map((q) => (
                <div key={q.id} className="space-y-1 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="text-slate-300 font-bold block">
                    {q.question} {q.required && <span className="text-rose-400">*</span>}
                  </label>

                  {q.type === 'text' && (
                    <input
                      type="text"
                      required={q.required}
                      placeholder="Tu respuesta..."
                      value={formResponses[q.id] || ''}
                      onChange={(e) => setFormResponses({ ...formResponses, [q.id]: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  )}

                  {q.type === 'options' && q.options && (
                    <div className="space-y-1.5 pt-1">
                      {q.options.map((opt) => (
                        <label
                          key={opt.id}
                          className="flex items-center gap-2 text-slate-300 cursor-pointer font-medium"
                        >
                          <input
                            type="radio"
                            name={q.id}
                            required={q.required}
                            value={opt.text}
                            checked={formResponses[q.id] === opt.text}
                            onChange={(e) => setFormResponses({ ...formResponses, [q.id]: e.target.value })}
                            className="text-amber-500 bg-slate-900"
                          />
                          {opt.text}
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === 'file' && (
                    <div className="space-y-1.5">
                      <FileUploadButton
                        onUploadSuccess={(url) => setFormResponses({ ...formResponses, [q.id]: url })}
                        label="Adjuntar Archivo"
                      />
                      <input
                        type="text"
                        required={q.required}
                        placeholder="URL de archivo adjunto..."
                        value={formResponses[q.id] || ''}
                        onChange={(e) => setFormResponses({ ...formResponses, [q.id]: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black shadow cursor-pointer active:scale-95"
                >
                  Enviar Postulación Oficial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MERCH PRODUCT */}
      {isAddMerchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-white text-base">Añadir Merch al Survival</h3>
              <button onClick={() => setIsAddMerchModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMerchSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Photocard Especial Top 9 o Lightstick"
                  value={newMerchName}
                  onChange={(e) => setNewMerchName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold">Imagen del Producto</label>
                  <FileUploadButton
                    onUploadSuccess={(url) => setNewMerchImage(url)}
                    label="Subir Foto"
                  />
                </div>
                <input
                  type="text"
                  placeholder="URL o sube desde tu dispositivo..."
                  value={newMerchImage}
                  onChange={(e) => setNewMerchImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Precio Coins 🪙</label>
                  <input
                    type="number"
                    min={100}
                    value={newMerchPriceCoins}
                    onChange={(e) => setNewMerchPriceCoins(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Precio Gemas 💎</label>
                  <input
                    type="number"
                    min={1}
                    value={newMerchPriceGems}
                    onChange={(e) => setNewMerchPriceGems(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre este artículo oficial..."
                  value={newMerchDesc}
                  onChange={(e) => setNewMerchDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddMerchModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow cursor-pointer active:scale-95"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD EPISODE */}
      {isAddEpisodeModalOpen && currentShow && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-white text-base">Publicar Nuevo Episodio</h3>
              <button onClick={() => setIsAddEpisodeModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!epTitle.trim()) return;
                addSurvivalEpisode(currentShow.id, {
                  episodeNumber: epNumber,
                  title: epTitle.trim(),
                  description: epDesc.trim() || 'Transmisión oficial del episodio.',
                  videoUrl: epVideoUrl.trim() || 'https://youtube.com',
                  thumbnail: epThumbnail.trim() || currentShow.banner,
                  broadcastDate: new Date().toLocaleDateString('es-MX')
                });
                setIsAddEpisodeModalOpen(false);
                setEpTitle('');
                setEpDesc('');
                setEpVideoUrl('');
                setEpThumbnail('');
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Episodio #</label>
                  <input
                    type="number"
                    min={1}
                    value={epNumber}
                    onChange={(e) => setEpNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-slate-300 font-bold">Título</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Misión 1: Primera Eliminación"
                    value={epTitle}
                    onChange={(e) => setEpTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Enlace del Video (YouTube / MP4)</label>
                <input
                  type="text"
                  required
                  placeholder="https://youtube.com/watch?v=..."
                  value={epVideoUrl}
                  onChange={(e) => setEpVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold">Miniatura</label>
                  <FileUploadButton
                    onUploadSuccess={(url) => setEpThumbnail(url)}
                    label="Subir Miniatura"
                  />
                </div>
                <input
                  type="text"
                  placeholder="URL o sube desde tu dispositivo..."
                  value={epThumbnail}
                  onChange={(e) => setEpThumbnail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Descripción</label>
                <textarea
                  rows={2}
                  value={epDesc}
                  onChange={(e) => setEpDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEpisodeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow cursor-pointer active:scale-95"
                >
                  Publicar Episodio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: JUDGE GRADE */}
      {isJudgeGradeModalOpen && participantToGrade && currentRound && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-white text-base">
                Evaluar a {participantToGrade.name} ({currentRound.title})
              </h3>
              <button onClick={() => setIsJudgeGradeModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4 text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-300">
                  <span>Puntuación del Jurado (0 - 100)</span>
                  <span className="text-base font-black text-amber-400">{judgeScore} / 100</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={judgeScore}
                  onChange={(e) => setJudgeScore(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Feedback / Comentario del Juez</label>
                <textarea
                  rows={3}
                  placeholder="Retroalimentación técnica sobre afinación, presencia escénica o dicción..."
                  value={judgeFeedback}
                  onChange={(e) => setJudgeFeedback(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsJudgeGradeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black shadow cursor-pointer active:scale-95"
                >
                  Registrar Calificación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
