import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  UserPlus,
  Send,
  Gift,
  Lock,
  Sparkles,
  Inbox,
  Heart,
  Users,
  Plus,
  Hash,
  Volume2,
  FolderPlus,
  Pin,
  Award,
  Upload,
  CheckCircle2,
  Crown,
  MoreVertical,
  X,
  Edit2,
  Trash2,
  Reply,
  BellOff,
  Paperclip,
  ShieldAlert,
  Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarWithFrame } from './AvatarWithFrame';
import { UserBadges } from './UserBadges';
import { ReportModal } from './ReportModal';
import {
  ChatMessage,
  ChatGroup,
  ChatSubgroup,
  ChatSubgroupType
} from '../types';

interface ChatsSectionProps {
  onOpenUserProfile: (username: string) => void;
  activeChatTarget?: string | null;
}

export const ChatsSection: React.FC<ChatsSectionProps> = ({
  onOpenUserProfile,
  activeChatTarget
}) => {
  const {
    currentUser,
    userProfile,
    chats,
    chatGroups,
    allProfiles,
    createChatGroup,
    addCategoryToGroup,
    addSubgroupToCategory,
    sendGroupMessage,
    setSubgroupPinnedWeeklyMessage,
    submitTraineeTask,
    gradeTraineeTask,
    promoteMemberInGroup,
    sendChatMessage,
    editChatMessage,
    deleteChatMessage,
    toggleMuteConversation,
    getProfileOf,
    fanClubs,
    isPrivileged,
    addCoins,
    themeGradient,
    showToast
  } = useApp();

  const isCurrentArtist = userProfile.accountType === 'artista';
  const isCurrentAdmin = userProfile.accountType === 'admin';
  const isTrainee = userProfile.accountType === 'trainee';

  // Message edit & reply states
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageText, setEditingMessageText] = useState('');
  const [replyingToMessage, setReplyingToMessage] = useState<ChatMessage | null>(null);
  const [conversationSearchQuery, setConversationSearchQuery] = useState('');
  const [isSearchInsideOpen, setIsSearchInsideOpen] = useState(false);
  const [attachmentInputUrl, setAttachmentInputUrl] = useState('');
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [reportModalData, setReportModalData] = useState<{ id: string; user: string; text: string } | null>(null);

  // Mode: direct chats vs group servers
  const [chatMode, setChatMode] = useState<'direct' | 'groups'>('direct');

  // Direct chat artist tabs: "mensajes de fans" vs "bandeja de mensajes"
  const [artistTab, setArtistTab] = useState<'bandeja' | 'fans'>('bandeja');
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(
    activeChatTarget || null
  );

  // Group / Server state
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    chatGroups[0]?.id || null
  );
  const [selectedSubgroupId, setSelectedSubgroupId] = useState<string | null>(null);
  const [actionGroupId, setActionGroupId] = useState<string>('');

  // Input states
  const [messageInput, setMessageInput] = useState('');
  const [isNewDirectChatOpen, setIsNewDirectChatOpen] = useState(false);
  const [newDirectUsername, setNewDirectUsername] = useState('');

  // Create Group Modal
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDuration, setNewGroupDuration] = useState<'temporary' | 'permanent'>('permanent');
  const [newGroupIsAdvanced, setNewGroupIsAdvanced] = useState<boolean>(isCurrentAdmin);
  const [newGroupIcon, setNewGroupIcon] = useState('💬');

  // Advanced Group Context Menu (Click Derecho)
  const [groupContextMenu, setGroupContextMenu] = useState<{
    x: number;
    y: number;
    groupId: string;
  } | null>(null);

  // Add Category Modal
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [categoryNameInput, setCategoryNameInput] = useState('');

  // Add Subgroup Modal
  const [isAddSubgroupOpen, setIsAddSubgroupOpen] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState('');
  const [subgroupName, setSubgroupName] = useState('');
  const [subgroupIcon, setSubgroupIcon] = useState('');
  const [subgroupType, setSubgroupType] = useState<ChatSubgroupType>('general');

  // Edit Pinned Weekly Message (Tasks)
  const [isEditPinnedOpen, setIsEditPinnedOpen] = useState(false);
  const [pinnedInput, setPinnedInput] = useState('');

  // Trainee Task Submission Modal
  const [isTaskSubmitOpen, setIsTaskSubmitOpen] = useState(false);
  const [taskTitleInput, setTaskTitleInput] = useState('');
  const [taskAttachmentInput, setTaskAttachmentInput] = useState('');

  // Grade Task Modal (Admin grading)
  const [gradingMessageId, setGradingMessageId] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<number>(3); // 3 = 10, 2 = 7, 1 = 4
  const [gradingCoins, setGradingCoins] = useState<number>(100);
  const [gradingFeedback, setGradingFeedback] = useState('');

  // Member promotion modal (Promotions subchannel)
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [promotedUser, setPromotedUser] = useState('');
  const [promotionLevel, setPromotionLevel] = useState('trainee c');

  // Close context menu on global click
  useEffect(() => {
    const handleGlobalClick = () => setGroupContextMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // Direct conversations
  const userConversations: {
    partnerUsername: string;
    lastMessage: ChatMessage | null;
    isFanMessageThread: boolean;
  }[] = [];
  const partnersSet = new Set<string>();

  Object.entries(chats).forEach(([key, msgList]) => {
    if (!msgList || msgList.length === 0) return;
    const [u1, u2] = key.split('_');
    const partner = u1 === currentUser ? u2 : u2 === currentUser ? u1 : null;
    if (partner && !partnersSet.has(partner)) {
      partnersSet.add(partner);
      const last = msgList[msgList.length - 1];
      const hasFanMsg = msgList.some((m) => m.isFanMessage);
      userConversations.push({
        partnerUsername: partner,
        lastMessage: last,
        isFanMessageThread: hasFanMsg
      });
    }
  });

  if (activeChatTarget && !partnersSet.has(activeChatTarget)) {
    userConversations.unshift({
      partnerUsername: activeChatTarget,
      lastMessage: null,
      isFanMessageThread: false
    });
  }

  const displayedConversations = isCurrentArtist
    ? userConversations.filter((c) =>
        artistTab === 'fans' ? c.isFanMessageThread : !c.isFanMessageThread
      )
    : userConversations;

  const activeChatKey1 = `${currentUser}_${selectedChatUser}`;
  const activeChatKey2 = `${selectedChatUser}_${currentUser}`;
  const currentDirectMessages = chats[activeChatKey1] || chats[activeChatKey2] || [];
  const activePartnerProfile = selectedChatUser ? getProfileOf(selectedChatUser) : null;

  // Active group
  const activeGroup = chatGroups.find((g) => g.id === selectedGroupId);

  // Active subgroup in active group
  let activeSubgroup: ChatSubgroup | null = null;
  if (activeGroup?.isAdvanced) {
    for (const cat of activeGroup.categories) {
      const match = cat.subgroups.find((s) => s.id === selectedSubgroupId);
      if (match) {
        activeSubgroup = match;
        break;
      }
    }
    // Default to first subgroup if none selected
    if (!activeSubgroup && activeGroup.categories[0]?.subgroups[0]) {
      activeSubgroup = activeGroup.categories[0].subgroups[0];
    }
  }

  const handleSendDirectMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatUser || !messageInput.trim()) return;
    sendChatMessage(
      selectedChatUser,
      messageInput.trim(),
      false,
      undefined,
      attachmentInputUrl.trim() || undefined,
      replyingToMessage?.id,
      replyingToMessage?.text
    );
    setMessageInput('');
    setReplyingToMessage(null);
    setAttachmentInputUrl('');
    setIsAttachmentOpen(false);
  };

  const handleSaveEditMessage = async (messageId: string) => {
    if (!editingMessageText.trim()) return;
    const ok = await editChatMessage(messageId, editingMessageText.trim());
    if (ok) {
      setEditingMessageId(null);
      setEditingMessageText('');
    }
  };

  const handleDeleteDirectMessage = async (messageId: string) => {
    if (!confirm('¿Eliminar este mensaje?')) return;
    await deleteChatMessage(messageId);
  };

  const handleSendGroupMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup || !messageInput.trim()) return;

    if (activeGroup.isAdvanced && activeSubgroup) {
      if (activeSubgroup.type === 'announcement' && !isCurrentAdmin && activeGroup.creator !== currentUser) {
        showToast('Solo administradores o creadores del grupo pueden chatear en anuncios.');
        return;
      }
      sendGroupMessage(activeGroup.id, messageInput.trim(), activeSubgroup.id);
    } else {
      sendGroupMessage(activeGroup.id, messageInput.trim());
    }
    setMessageInput('');
  };

  const handleRightClickGroup = (e: React.MouseEvent, g: ChatGroup) => {
    e.preventDefault();
    if (!isCurrentAdmin && g.creator !== currentUser) return;
    if (!g.isAdvanced) return;
    setActionGroupId(g.id);
    setSelectedGroupId(g.id);
    setGroupContextMenu({
      x: e.clientX,
      y: e.clientY,
      groupId: g.id
    });
  };

  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    createChatGroup(newGroupName.trim(), newGroupDuration, newGroupIsAdvanced, newGroupIcon);
    setIsCreateGroupModalOpen(false);
    setNewGroupName('');
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gId = actionGroupId || selectedGroupId || chatGroups[0]?.id;
    if (!gId || !categoryNameInput.trim()) {
      showToast('Ingresa un nombre para la categoría.');
      return;
    }
    addCategoryToGroup(gId, categoryNameInput.trim());
    setIsAddCategoryOpen(false);
    setCategoryNameInput('');
  };

  const handleAddSubgroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gId = actionGroupId || selectedGroupId || chatGroups[0]?.id;
    if (!gId || !subgroupName.trim()) {
      showToast('Ingresa el nombre del subgrupo.');
      return;
    }

    const grp = chatGroups.find((g) => g.id === gId);
    let catId = targetCategoryId;
    if (!catId && grp?.categories?.length) {
      catId = grp.categories[0].id;
    }

    if (!catId) {
      // Si el grupo aún no tiene categoría, crearla automáticamente primero
      addCategoryToGroup(gId, 'GENERAL');
      setTimeout(() => {
        const freshGrp = chatGroups.find((g) => g.id === gId);
        const freshCatId = freshGrp?.categories?.[0]?.id || 'cat-general';
        addSubgroupToCategory(
          gId,
          freshCatId,
          subgroupName.trim(),
          subgroupType,
          subgroupIcon.trim() || undefined
        );
      }, 50);
    } else {
      addSubgroupToCategory(
        gId,
        catId,
        subgroupName.trim(),
        subgroupType,
        subgroupIcon.trim() || undefined
      );
    }
    setIsAddSubgroupOpen(false);
    setSubgroupName('');
  };

  const handleConfirmGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup || !activeSubgroup || !gradingMessageId) return;
    gradeTraineeTask(
      activeGroup.id,
      activeSubgroup.id,
      gradingMessageId,
      selectedGrade,
      gradingCoins,
      gradingFeedback
    );
    setGradingMessageId(null);
    setGradingFeedback('');
  };

  const handleConfirmPromotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup || !activeSubgroup || !promotedUser.trim()) return;
    promoteMemberInGroup(activeGroup.id, activeSubgroup.id, promotedUser.trim(), promotionLevel);
    setIsPromoteModalOpen(false);
  };

  const candidateMembers = Object.keys(allProfiles);

  return (
    <div className="flex flex-col gap-4 w-full max-w-6xl mx-auto h-[calc(100vh-140px)] min-h-[540px] animate-fadeIn">
      {/* Top Bar Mode Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setChatMode('direct')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              chatMode === 'direct'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" /> Mensajes Directos
          </button>
          <button
            onClick={() => setChatMode('groups')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              chatMode === 'groups'
                ? 'theme-btn text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
            style={chatMode === 'groups' ? { background: themeGradient } : undefined}
          >
            <Users className="w-3.5 h-3.5" /> Grupos & Servidores Comunitarios
          </button>
        </div>

        {chatMode === 'groups' && (
          <button
            onClick={() => setIsCreateGroupModalOpen(true)}
            style={{ background: themeGradient }}
            className="theme-btn px-3.5 py-1.5 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Crear Grupo {isCurrentAdmin && 'Avanzado'}
          </button>
        )}

        {chatMode === 'direct' && isCurrentArtist && (
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setArtistTab('bandeja')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                artistTab === 'bandeja' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              <Inbox className="w-3 h-3 inline mr-1" /> Bandeja de Mensajes
            </button>
            <button
              onClick={() => setArtistTab('fans')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                artistTab === 'fans' ? 'bg-pink-600 text-white' : 'text-slate-400'
              }`}
            >
              <Heart className="w-3 h-3 inline mr-1" /> Mensajes de Fans
            </button>
          </div>
        )}
      </div>

      {/* MODE 1: DIRECT CHATS */}
      {chatMode === 'direct' && (
        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          {/* Contacts Sidebar */}
          <div className="border-r border-slate-800 flex flex-col bg-slate-950/40">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-indigo-400" />
                {isCurrentArtist
                  ? artistTab === 'fans'
                    ? 'Mensajes de Fans'
                    : 'Bandeja de Entrada'
                  : 'Conversaciones'}
              </h3>
              <button
                onClick={() => setIsNewDirectChatOpen(true)}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {displayedConversations.length === 0 ? (
                <div className="py-12 px-4 text-center text-slate-500 text-xs">
                  No tienes conversaciones activas. Pulsa el botón + para escribir a un usuario.
                </div>
              ) : (
                displayedConversations.map((c) => {
                  const partnerProf = getProfileOf(c.partnerUsername);
                  const isSelected = selectedChatUser === c.partnerUsername;

                  return (
                    <div
                      key={c.partnerUsername}
                      onClick={() => setSelectedChatUser(c.partnerUsername)}
                      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition ${
                        isSelected
                          ? 'bg-indigo-600/20 border border-indigo-500/40'
                          : 'hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenUserProfile(c.partnerUsername);
                        }}
                        className="cursor-pointer hover:scale-105 transition"
                      >
                        <AvatarWithFrame
                          src={partnerProf.avatar}
                          size="sm"
                          ringColor={partnerProf.ringColor}
                          transparentFrame={partnerProf.transparentFrame}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white truncate">
                            {partnerProf.nickname || c.partnerUsername}
                          </span>
                          <UserBadges user={partnerProf} />
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {c.lastMessage?.text || 'Nueva conversación'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Direct Chat Pane */}
          <div className="col-span-2 flex flex-col bg-slate-900/60 justify-between">
            {selectedChatUser && activePartnerProfile ? (
              <>
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                  <div
                    onClick={() => onOpenUserProfile(selectedChatUser)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <AvatarWithFrame
                      src={activePartnerProfile.avatar}
                      size="md"
                      ringColor={activePartnerProfile.ringColor}
                      transparentFrame={activePartnerProfile.transparentFrame}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                          {activePartnerProfile.nickname || selectedChatUser}
                        </h4>
                        <UserBadges user={activePartnerProfile} fanClubs={fanClubs} />
                      </div>
                      <span className="text-[11px] text-emerald-400 font-medium">
                        ● En línea · Clic para ver perfil
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsSearchInsideOpen(!isSearchInsideOpen)}
                      className={`p-2 rounded-xl transition cursor-pointer ${
                        isSearchInsideOpen
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title="Buscar en la conversación"
                    >
                      <Search className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleMuteConversation(selectedChatUser)}
                      className={`p-2 rounded-xl transition cursor-pointer ${
                        (userProfile.mutedConversations || []).includes(selectedChatUser)
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title={
                        (userProfile.mutedConversations || []).includes(selectedChatUser)
                          ? 'Conversación silenciada'
                          : 'Silenciar conversación'
                      }
                    >
                      <BellOff className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() =>
                        setReportModalData({
                          id: selectedChatUser,
                          user: selectedChatUser,
                          text: `Conversación directa con @${selectedChatUser}`
                        })
                      }
                      className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition cursor-pointer"
                      title="Denunciar usuario o mensaje"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Conversation Search Bar */}
                {isSearchInsideOpen && (
                  <div className="p-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2 animate-fadeIn">
                    <Search className="w-4 h-4 text-slate-400 ml-2" />
                    <input
                      type="text"
                      value={conversationSearchQuery}
                      onChange={(e) => setConversationSearchQuery(e.target.value)}
                      placeholder="Buscar palabras dentro de esta conversación..."
                      className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                    {conversationSearchQuery && (
                      <button
                        onClick={() => setConversationSearchQuery('')}
                        className="text-slate-400 hover:text-white mr-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {currentDirectMessages
                    .filter((m) => {
                      if (!conversationSearchQuery.trim()) return true;
                      return m.text.toLowerCase().includes(conversationSearchQuery.toLowerCase());
                    })
                    .map((m) => {
                      const isOut = m.from === currentUser;
                      const isEditingThis = editingMessageId === m.id;

                      return (
                        <div
                          key={m.id}
                          className={`group relative flex flex-col ${isOut ? 'items-end' : 'items-start'}`}
                        >
                          {/* Reply Quote Banner */}
                          {m.replyToText && (
                            <div className="text-[10px] text-slate-400 italic mb-1 px-3 py-1 bg-slate-800/80 rounded-xl border-l-2 border-indigo-400 max-w-[70%] truncate">
                              Respondiendo a: "{m.replyToText}"
                            </div>
                          )}

                          {isEditingThis ? (
                            <div className="w-[80%] p-3 bg-slate-800 border border-indigo-500/50 rounded-2xl space-y-2">
                              <input
                                type="text"
                                value={editingMessageText}
                                onChange={(e) => setEditingMessageText(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                              />
                              <div className="flex justify-end gap-1.5 text-xs">
                                <button
                                  type="button"
                                  onClick={() => setEditingMessageId(null)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-700 text-slate-300"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditMessage(m.id)}
                                  className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-bold"
                                >
                                  Guardar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              className={`relative max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                                isOut
                                  ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{m.text}</p>

                              {/* Attachment preview / link */}
                              {m.attachmentUrl && (
                                <div className="mt-2 pt-2 border-t border-white/20">
                                  <a
                                    href={m.attachmentUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-[11px] font-semibold text-white transition underline"
                                  >
                                    <Paperclip className="w-3 h-3" /> Ver archivo / multimedia adjunta
                                  </a>
                                </div>
                              )}

                              {/* Action buttons on hover */}
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 bg-slate-950/80 px-1.5 py-0.5 rounded-lg border border-slate-700 shadow-md">
                                <button
                                  onClick={() => setReplyingToMessage(m)}
                                  className="p-1 hover:text-indigo-300 text-slate-400"
                                  title="Responder"
                                >
                                  <Reply className="w-3 h-3" />
                                </button>

                                {isOut ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingMessageId(m.id);
                                        setEditingMessageText(m.text);
                                      }}
                                      className="p-1 hover:text-amber-300 text-slate-400"
                                      title="Editar mensaje"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDirectMessage(m.id)}
                                      className="p-1 hover:text-rose-400 text-slate-400"
                                      title="Eliminar mensaje"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() =>
                                      setReportModalData({
                                        id: m.id,
                                        user: m.from,
                                        text: m.text
                                      })
                                    }
                                    className="p-1 hover:text-rose-400 text-slate-400"
                                    title="Reportar mensaje"
                                  >
                                    <ShieldAlert className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-1 text-[9px] text-slate-500 mt-0.5 px-1">
                            {m.isEdited && <span className="italic">(editado)</span>}
                            <span>{m.timestamp}</span>
                            {isOut && <span className="text-indigo-400 font-bold">✓✓</span>}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Replying Banner */}
                {replyingToMessage && (
                  <div className="px-4 py-2 bg-slate-800/90 border-t border-slate-700 flex items-center justify-between text-xs text-slate-300 animate-slideDown">
                    <span className="truncate flex items-center gap-1.5">
                      <Reply className="w-3.5 h-3.5 text-indigo-400" />
                      Respondiendo a @{replyingToMessage.from}: "{replyingToMessage.text}"
                    </span>
                    <button
                      onClick={() => setReplyingToMessage(null)}
                      className="text-slate-400 hover:text-white ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Attachment URL popover */}
                {isAttachmentOpen && (
                  <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center gap-2 animate-slideDown text-xs">
                    <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                    <input
                      type="url"
                      value={attachmentInputUrl}
                      onChange={(e) => setAttachmentInputUrl(e.target.value)}
                      placeholder="Pega el enlace de imagen, audio o documento..."
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs placeholder-slate-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setIsAttachmentOpen(false)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Send Message Form */}
                <form
                  onSubmit={handleSendDirectMessage}
                  className="p-3 border-t border-slate-800 flex items-center gap-2 bg-slate-950/40"
                >
                  <button
                    type="button"
                    onClick={() => setIsAttachmentOpen(!isAttachmentOpen)}
                    className={`p-2.5 rounded-2xl transition cursor-pointer ${
                      attachmentInputUrl
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title="Adjuntar multimedia o archivo"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Escribe un mensaje directo..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />

                  <button
                    type="submit"
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition shadow flex items-center justify-center cursor-pointer active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs p-6 text-center gap-2">
                <MessageCircle className="w-10 h-10 text-slate-600" />
                <p className="text-sm font-semibold text-slate-400">Selecciona o inicia una conversación</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: GRUPOS Y SERVIDORES AVANZADOS */}
      {chatMode === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-4 flex-1 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          {/* Channels Column (Left) */}
          <div className="border-r border-slate-800 flex flex-col bg-slate-950/70 p-3 space-y-4 overflow-y-auto">
            {/* List of groups / servers */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Grupos & Servidores:
                </span>
                <span className="text-[9px] text-slate-500">
                  Click derecho para opciones
                </span>
              </div>
              <div className="space-y-1">
                {chatGroups.map((g) => (
                  <div
                    key={g.id}
                    onContextMenu={(e) => handleRightClickGroup(e, g)}
                    onClick={() => {
                      setSelectedGroupId(g.id);
                      if (g.isAdvanced && g.categories[0]?.subgroups[0]) {
                        setSelectedSubgroupId(g.categories[0].subgroups[0].id);
                      }
                    }}
                    className={`p-2.5 rounded-2xl cursor-pointer transition flex items-center justify-between text-xs font-bold ${
                      selectedGroupId === g.id
                        ? 'theme-btn text-white shadow-lg'
                        : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                    }`}
                    style={selectedGroupId === g.id ? { background: themeGradient } : undefined}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base">{g.icon || '💬'}</span>
                      <span className="truncate">{g.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {g.isAdvanced && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-cyan-300 font-mono">
                          Multicanal
                        </span>
                      )}
                      {(isCurrentAdmin || g.creator === currentUser) && g.isAdvanced && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRightClickGroup(e, g);
                          }}
                          className="p-1 rounded-lg hover:bg-white/20 text-slate-300 hover:text-white"
                          title="Gestionar grupo (Click derecho o botón)"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Channels & Subgroups of Active Advanced Group */}
            {activeGroup?.isAdvanced && (
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between px-1 flex-wrap gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    CANALES Y SUBGRUPOS
                  </span>
                  {(activeGroup.isOfficial ? isCurrentAdmin : (isCurrentAdmin || activeGroup.creator === currentUser)) && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setActionGroupId(activeGroup.id);
                          setIsAddCategoryOpen(true);
                        }}
                        className="text-[10px] px-1.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 font-semibold border border-indigo-500/30 flex items-center gap-0.5 cursor-pointer"
                        title="Crear categoría"
                      >
                        <FolderPlus className="w-3 h-3" /> +Categoría
                      </button>
                      <button
                        onClick={() => {
                          setActionGroupId(activeGroup.id);
                          setTargetCategoryId(activeGroup.categories[0]?.id || '');
                          setIsAddSubgroupOpen(true);
                        }}
                        className="text-[10px] px-1.5 py-0.5 rounded-lg bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 font-semibold border border-pink-500/30 flex items-center gap-0.5 cursor-pointer"
                        title="Agregar subgrupo"
                      >
                        <Plus className="w-3 h-3" /> +Canal
                      </button>
                    </div>
                  )}
                </div>

                {activeGroup.categories.map((cat) => (
                  <div key={cat.id} className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 px-2 tracking-wider">
                      ▾ {cat.name}
                    </span>
                    <div className="space-y-0.5">
                      {cat.subgroups.map((sub) => {
                        const isSubActive = activeSubgroup?.id === sub.id;
                        const isImageIcon = Boolean(
                          sub.icon && (
                            sub.icon.startsWith('http') ||
                            sub.icon.startsWith('data:') ||
                            sub.icon.startsWith('/') ||
                            sub.icon.includes('.gif') ||
                            sub.icon.includes('.png') ||
                            sub.icon.includes('.jpg')
                          )
                        );
                        return (
                          <div
                            key={sub.id}
                            onClick={() => setSelectedSubgroupId(sub.id)}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer text-xs font-medium transition ${
                              isSubActive
                                ? 'bg-indigo-600/30 text-white font-bold border border-indigo-500/40'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`}
                          >
                            {isImageIcon ? (
                              <img src={sub.icon} alt="" className="w-4 h-4 rounded object-cover shrink-0" />
                            ) : (
                              <span>{sub.icon || <Hash className="w-3.5 h-3.5 text-slate-500" />}</span>
                            )}
                            <span className="truncate">#{sub.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Group Messages Panel */}
          <div className="col-span-3 flex flex-col bg-slate-900 justify-between">
            {activeGroup ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{activeGroup.icon || '💬'}</span>
                      <span>{activeGroup.name}</span>
                      {activeSubgroup && (
                        <span className="text-indigo-400 font-mono text-xs">
                          / #{activeSubgroup.name}
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {activeSubgroup?.type === 'announcement' && '📢 Canal de solo lectura/anuncios.'}
                      {activeSubgroup?.type === 'promotions' && '⭐ Canal de ascensión de nivel para trainees.'}
                      {activeSubgroup?.type === 'tasks' && '📝 Canal de tareas semanales & calificación.'}
                      {activeSubgroup?.type === 'general' && '💬 Canal de conversación abierta.'}
                      {!activeGroup.isAdvanced && `Grupo ${activeGroup.duration === 'temporary' ? 'Temporal' : 'Permanente'}.`}
                    </p>
                  </div>

                  {/* Actions for specific subgroup types */}
                  <div className="flex items-center gap-2">
                    {activeSubgroup?.type === 'promotions' && isCurrentAdmin && (
                      <button
                        onClick={() => setIsPromoteModalOpen(true)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1"
                      >
                        <Award className="w-3.5 h-3.5" /> Ascender Miembro
                      </button>
                    )}

                    {activeSubgroup?.type === 'tasks' && (
                      <>
                        {isCurrentAdmin && (
                          <button
                            onClick={() => {
                              setPinnedInput(activeSubgroup?.pinnedWeeklyMessage || '');
                              setIsEditPinnedOpen(true);
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700"
                          >
                            <Pin className="w-3 h-3 inline mr-1" /> Fijar Tarea
                          </button>
                        )}
                        {isTrainee && (
                          <button
                            onClick={() => setIsTaskSubmitOpen(true)}
                            className="px-3 py-1 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow"
                          >
                            <Upload className="w-3 h-3 inline mr-1" /> Enviar Tarea
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* PINNED WEEKLY TASK BANNER (If tasks channel) */}
                {activeSubgroup?.type === 'tasks' && activeSubgroup.pinnedWeeklyMessage && (
                  <div className="bg-amber-500/10 border-b border-amber-500/30 p-3 px-5 flex items-start gap-3">
                    <Pin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider block">
                        Tarea Semanal Fijada por Administración:
                      </span>
                      <p className="text-xs text-slate-200 mt-0.5">
                        {activeSubgroup.pinnedWeeklyMessage}
                      </p>
                    </div>
                  </div>
                )}

                {/* Messages list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {(() => {
                    const messagesList = activeGroup.isAdvanced
                      ? activeSubgroup?.messages || []
                      : activeGroup.messages || [];

                    if (messagesList.length === 0) {
                      return (
                        <div className="py-16 text-center text-slate-500 text-xs">
                          No hay mensajes todavía en este canal.
                        </div>
                      );
                    }

                    return messagesList.map((m) => {
                      const senderProf = getProfileOf(m.sender);
                      const isTask = !!m.taskSubmission;

                      return (
                        <div
                          key={m.id}
                          className={`p-3 rounded-2xl border text-xs ${
                            isTask
                              ? 'bg-amber-950/20 border-amber-500/40'
                              : 'bg-slate-800/60 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div
                              onClick={() => onOpenUserProfile(m.sender)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <strong className="text-indigo-400 hover:underline">
                                @{m.sender}
                              </strong>
                              <UserBadges user={senderProf} />
                            </div>
                            <span className="text-[10px] text-slate-500">
                              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p className="text-slate-200 whitespace-pre-wrap">{m.text}</p>

                          {m.attachment && (
                            <div className="mt-2 p-2 bg-black/40 rounded-xl text-xs text-indigo-300 border border-slate-700">
                              📎 Adjunto: {m.attachment}
                            </div>
                          )}

                          {/* Task grading controls for Admin */}
                          {isTask && m.taskSubmission && (
                            <div className="mt-2.5 pt-2 border-t border-amber-500/30 flex items-center justify-between flex-wrap gap-2">
                              {m.taskSubmission.status === 'graded' ? (
                                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Calificado: {m.taskSubmission.grade}/3 (+{m.taskSubmission.pointsAwarded} Puntos & +{m.taskSubmission.coinsAwarded} Coins)
                                </div>
                              ) : (
                                isCurrentAdmin && (
                                  <button
                                    onClick={() => setGradingMessageId(m.id)}
                                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow"
                                  >
                                    Calificar Tarea (Admin)
                                  </button>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendGroupMessage} className="p-3 border-t border-slate-800 flex gap-2 bg-slate-950/40">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={
                      activeSubgroup?.type === 'announcement' && !isCurrentAdmin
                        ? 'Solo administradores pueden publicar en este canal.'
                        : `Enviar mensaje a #${activeSubgroup?.name || activeGroup.name}...`
                    }
                    disabled={activeSubgroup?.type === 'announcement' && !isCurrentAdmin}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2 text-xs text-white disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={activeSubgroup?.type === 'announcement' && !isCurrentAdmin}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl transition shadow flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs p-6 text-center">
                Selecciona un grupo o servidor
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADVANCED GROUP CONTEXT MENU (Click derecho sobre grupo principal) */}
      {groupContextMenu && (
        <div
          className="fixed z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 w-52 text-xs text-white animate-fadeIn"
          style={{ top: groupContextMenu.y, left: groupContextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-400">
            OPCIONES DE SERVIDOR
          </div>
          <button
            onClick={() => {
              setIsAddCategoryOpen(true);
              setGroupContextMenu(null);
            }}
            className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 transition"
          >
            <FolderPlus className="w-3.5 h-3.5 text-indigo-400" /> Crear categoría de grupos
          </button>
          <button
            onClick={() => {
              const grp = chatGroups.find((g) => g.id === groupContextMenu.groupId);
              setTargetCategoryId(grp?.categories[0]?.id || '');
              setIsAddSubgroupOpen(true);
              setGroupContextMenu(null);
            }}
            className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 transition"
          >
            <Plus className="w-3.5 h-3.5 text-pink-400" /> Agregar subgrupo
          </button>
        </div>
      )}

      {/* MODAL: CREAR GRUPO */}
      {isCreateGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreateGroupSubmit}
            className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" /> Crear Nuevo Grupo
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateGroupModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre del Grupo:
              </label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Ej: Academia de Trainees YM-ki"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Icono o Emoji:
              </label>
              <input
                type="text"
                value={newGroupIcon}
                onChange={(e) => setNewGroupIcon(e.target.value)}
                placeholder="💬, ⭐, 🎤, 🎧"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Duración del Grupo:
              </label>
              <select
                value={newGroupDuration}
                onChange={(e) => setNewGroupDuration(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="permanent">Permanente</option>
                <option value="temporary">Temporal</option>
              </select>
            </div>

            {/* Administrador: Crear grupo avanzado multicanal */}
            {isCurrentAdmin && (
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/40 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Grupo Avanzado Multicanal
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Incluye categorías, subgrupos de anuncios, tareas y ascensos.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={newGroupIsAdvanced}
                  onChange={(e) => setNewGroupIsAdvanced(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
                />
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateGroupModalOpen(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow"
              >
                Crear Grupo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: AGREGAR CATEGORÍA */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleAddCategorySubmit}
            className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white"
          >
            <h3 className="text-sm font-bold flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-indigo-400" /> Crear Categoría de Grupos
            </h3>
            <input
              type="text"
              value={categoryNameInput}
              onChange={(e) => setCategoryNameInput(e.target.value)}
              placeholder="Ej: ENTRENAMIENTO VOCAL"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white uppercase"
              required
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddCategoryOpen(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
              >
                Crear Categoría
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: AGREGAR SUBGRUPO (Con tipo: anuncios, ascenciones, tareas, etc.) */}
      {isAddSubgroupOpen && activeGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleAddSubgroupSubmit}
            className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Plus className="w-4 h-4 text-pink-400" /> Añadir Subgrupo / Canal
              </h3>
              <button
                type="button"
                onClick={() => setIsAddSubgroupOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Categoría:
              </label>
              <select
                value={targetCategoryId}
                onChange={(e) => setTargetCategoryId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
              >
                {activeGroup.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre del Subgrupo:
              </label>
              <input
                type="text"
                value={subgroupName}
                onChange={(e) => setSubgroupName(e.target.value)}
                placeholder="Ej: entregas-semanales"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Icono del Canal (Emoji, o adjuntar Imagen / GIF):
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={subgroupIcon}
                  onChange={(e) => setSubgroupIcon(e.target.value)}
                  placeholder="Emoji, o URL de imagen / GIF..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
                />
                <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5 shrink-0 active:scale-95">
                  <Upload className="w-3.5 h-3.5 text-indigo-400" /> GIF / Foto
                  <input
                    type="file"
                    accept="image/*,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setSubgroupIcon(reader.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              {subgroupIcon && (subgroupIcon.startsWith('http') || subgroupIcon.startsWith('data:')) && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">Vista previa del icono:</span>
                  <img src={subgroupIcon} alt="Icon Preview" className="w-6 h-6 rounded-md object-cover border border-slate-700" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo de Subgrupo:
              </label>
              <select
                value={subgroupType}
                onChange={(e) => setSubgroupType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="announcement">📢 Grupo de Anuncios (Solo admins/creadores chatean)</option>
                <option value="promotions">⭐ Grupo de Ascenciones (Para ascender trainees de nivel)</option>
                <option value="tasks">📝 Tareas (Mensaje fijado semanal + entrega de tareas calificadas)</option>
                <option value="general">💬 General / Charla abierta</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddSubgroupOpen(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition shadow"
              >
                Crear Subgrupo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CALIFICAR TAREA (Admin con 3 botones de calificación: 3 = 10, etc.) */}
      {gradingMessageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleConfirmGrade}
            className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Award className="w-5 h-5" /> Calificar Tarea de Trainee
              </h3>
              <button
                type="button"
                onClick={() => setGradingMessageId(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Three grading buttons as requested */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Calificación Oficial:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGrade(3);
                    setGradingCoins(100);
                  }}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition ${
                    selectedGrade === 3
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-500'
                      : 'border-slate-700 bg-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-lg font-black">3 / 3</span>
                  <span className="text-[10px] font-bold">10/10 Excelente</span>
                  <span className="text-[9px] text-emerald-400">+100 Puntos</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedGrade(2);
                    setGradingCoins(50);
                  }}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition ${
                    selectedGrade === 2
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300 ring-2 ring-amber-500'
                      : 'border-slate-700 bg-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-lg font-black">2 / 3</span>
                  <span className="text-[10px] font-bold">7/10 Bueno</span>
                  <span className="text-[9px] text-amber-400">+70 Puntos</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedGrade(1);
                    setGradingCoins(20);
                  }}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition ${
                    selectedGrade === 1
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300 ring-2 ring-blue-500'
                      : 'border-slate-700 bg-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-lg font-black">1 / 3</span>
                  <span className="text-[10px] font-bold">4/10 Regular</span>
                  <span className="text-[9px] text-blue-400">+40 Puntos</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Coins a otorgar al Trainee:
              </label>
              <input
                type="number"
                min="0"
                value={gradingCoins}
                onChange={(e) => setGradingCoins(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Feedback y recomendaciones del Staff:
              </label>
              <textarea
                value={gradingFeedback}
                onChange={(e) => setGradingFeedback(e.target.value)}
                placeholder="Excelente afinación, trabajar la respiración..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white min-h-[60px]"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setGradingMessageId(null)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow"
              >
                Confirmar Calificación
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: FIJAR TAREA SEMANAL */}
      {isEditPinnedOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Pin className="w-4 h-4 text-amber-400" /> Fijar Mensaje de Tarea Semanal
            </h3>
            <textarea
              value={pinnedInput}
              onChange={(e) => setPinnedInput(e.target.value)}
              placeholder="Instrucciones de la tarea semanal obligatoria para trainees..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white min-h-[90px]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditPinnedOpen(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activeGroup && activeSubgroup) {
                    setSubgroupPinnedWeeklyMessage(activeGroup.id, activeSubgroup.id, pinnedInput);
                    setIsEditPinnedOpen(false);
                  }
                }}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
              >
                Fijar Tarea
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBIR TAREA DE TRAINEE */}
      {isTaskSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!activeGroup || !activeSubgroup || !taskTitleInput.trim()) return;
              submitTraineeTask(activeGroup.id, activeSubgroup.id, taskTitleInput.trim(), taskAttachmentInput.trim());
              setIsTaskSubmitOpen(false);
              setTaskTitleInput('');
              setTaskAttachmentInput('');
            }}
            className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-pink-400">
                <Upload className="w-4 h-4" /> Entrega de Tarea Semanal (Trainee)
              </h3>
              <button
                type="button"
                onClick={() => setIsTaskSubmitOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Título o Pieza Entregada:
              </label>
              <input
                type="text"
                value={taskTitleInput}
                onChange={(e) => setTaskTitleInput(e.target.value)}
                placeholder="Ej: Cover Vocal 'Miracle' - Semana 1"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Enlace o Archivo de Grabación:
              </label>
              <input
                type="text"
                value={taskAttachmentInput}
                onChange={(e) => setTaskAttachmentInput(e.target.value)}
                placeholder="URL de audio, video o nombre de archivo grabado..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsTaskSubmitOpen(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-xs transition shadow"
              >
                Enviar al Staff
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ASCENDER MIEMBRO (Promociones) */}
      {isPromoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleConfirmPromotion}
            className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-amber-400">
                <Award className="w-4 h-4" /> Ascensión Oficial de Trainee
              </h3>
              <button
                type="button"
                onClick={() => setIsPromoteModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Seleccionar Miembro:
              </label>
              <select
                value={promotedUser}
                onChange={(e) => setPromotedUser(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
                required
              >
                <option value="">Selecciona un usuario...</option>
                {candidateMembers.map((u) => (
                  <option key={u} value={u}>
                    @{u} ({allProfiles[u]?.accountType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Rango al que se Promueve / Ajusta (15 Rangos Oficiales):
              </label>
              <select
                value={promotionLevel}
                onChange={(e) => setPromotionLevel(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="trainee -c">Trainee -C (Nivel Inicial Base)</option>
                <option value="trainee c">Trainee C (Nivel Inicial)</option>
                <option value="trainee +c">Trainee +C (Nivel Inicial Alto)</option>
                <option value="trainee -b">Trainee -B (Nivel Intermedio Base)</option>
                <option value="trainee b">Trainee B (Nivel Intermedio)</option>
                <option value="trainee +b">Trainee +B (Nivel Intermedio Alto)</option>
                <option value="trainee -a">Trainee -A (Nivel Avanzado Preliminar)</option>
                <option value="trainee a">Trainee A (Nivel Avanzado)</option>
                <option value="trainee +a">Trainee +A (Nivel Avanzado Superior)</option>
                <option value="trainee -s">Trainee -S (Nivel Élite Pre-Debut)</option>
                <option value="trainee s">Trainee S (Nivel Élite)</option>
                <option value="trainee +s">Trainee +S (Nivel Élite Máximo)</option>
                <option value="trainee -ss">Trainee -SS (Candidato a Debut)</option>
                <option value="trainee ss">Trainee SS (Línea de Debut Oficial)</option>
                <option value="trainee +ss">Trainee +SS (Debut Inminente)</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsPromoteModalOpen(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow"
              >
                Publicar Ascensión
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: NUEVO CHAT DIRECTO */}
      {isNewDirectChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const target = newDirectUsername.trim();
              if (!target || target === currentUser) return;
              setSelectedChatUser(target);
              setIsNewDirectChatOpen(false);
              setNewDirectUsername('');
            }}
            className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-400" /> Iniciar Chat Directo
              </h3>
              <button
                type="button"
                onClick={() => setIsNewDirectChatOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              value={newDirectUsername}
              onChange={(e) => setNewDirectUsername(e.target.value)}
              placeholder="Nombre de usuario (ej: Hana Star)..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              required
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsNewDirectChatOpen(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
              >
                Iniciar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FLOATING CONTEXT MENU (Click Derecho o botón sobre grupo) */}
      {groupContextMenu && (
        <div
          style={{
            top: Math.min(window.innerHeight - 150, Math.max(10, groupContextMenu.y)),
            left: Math.min(window.innerWidth - 240, Math.max(10, groupContextMenu.x))
          }}
          className="fixed z-50 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 min-w-[220px] animate-fadeIn text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-800 uppercase tracking-wider">
            Gestionar Grupo Avanzado
          </div>
          <button
            type="button"
            onClick={() => {
              setActionGroupId(groupContextMenu.groupId);
              setIsAddCategoryOpen(true);
              setGroupContextMenu(null);
            }}
            className="px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-xl flex items-center gap-2 cursor-pointer transition"
          >
            <FolderPlus className="w-4 h-4 text-indigo-400" /> Crear categoría de grupos
          </button>
          <button
            type="button"
            onClick={() => {
              setActionGroupId(groupContextMenu.groupId);
              const grp = chatGroups.find((g) => g.id === groupContextMenu.groupId);
              setTargetCategoryId(grp?.categories[0]?.id || '');
              setIsAddSubgroupOpen(true);
              setGroupContextMenu(null);
            }}
            className="px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-xl flex items-center gap-2 cursor-pointer transition"
          >
            <Plus className="w-4 h-4 text-pink-400" /> Agregar subgrupo
          </button>
        </div>
      )}

      {/* Universal Report Modal */}
      {reportModalData && (
        <ReportModal
          isOpen={Boolean(reportModalData)}
          onClose={() => setReportModalData(null)}
          itemType="message"
          itemId={reportModalData.id}
          targetUsername={reportModalData.user}
          itemTitle={reportModalData.text}
        />
      )}
    </div>
  );
};
