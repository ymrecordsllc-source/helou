import React, { useState, useEffect } from 'react';
import {
  Handshake,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Upload,
  Link,
  Users,
  Building2,
  Sparkles,
  MessageSquare,
  Search,
  Filter,
  ArrowRight,
  Eye,
  Send,
  Calendar,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CollaborationProject, CollaborationType, CollaborationStatus } from '../types';

interface CollaborationsSectionProps {
  onOpenChatWithUser?: (username: string) => void;
  onOpenUserProfile?: (username: string) => void;
  onGoToChatsGroup?: (groupId: string) => void;
}

export const CollaborationsSection: React.FC<CollaborationsSectionProps> = ({
  onOpenChatWithUser,
  onOpenUserProfile,
  onGoToChatsGroup
}) => {
  const {
    currentUser,
    userProfile,
    allProfiles,
    showToast,
    partners,
    primaryButtonColor
  } = useApp();

  const [collaborations, setCollaborations] = useState<CollaborationProject[]>([]);
  const [activeTab, setActiveTab] = useState<
    'activas' | 'recibidas' | 'enviadas' | 'finalizadas' | 'todas'
  >('activas');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // New Collaboration Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [collabType, setCollabType] = useState<CollaborationType>('musical');
  const [collabDescription, setCollabDescription] = useState('');
  const [collabObjective, setCollabObjective] = useState('');
  const [targetUsernameOrCompany, setTargetUsernameOrCompany] = useState('');
  const [isCompanyCollaboration, setIsCompanyCollaboration] = useState(false);
  const [companyA, setCompanyA] = useState('');
  const [companyB, setCompanyB] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [requirements, setRequirements] = useState('');
  const [attachmentLink, setAttachmentLink] = useState('');

  // Selected Project for details view & progress updates
  const [selectedCollab, setSelectedCollab] = useState<CollaborationProject | null>(null);
  const [progressUpdateText, setProgressUpdateText] = useState('');
  const [progressUpdateFile, setProgressUpdateFile] = useState('');

  const loadCollaborations = async () => {
    try {
      const res = await fetch('/api/collaborations');
      if (res.ok) {
        const data = await res.json();
        if (data.collaborations) {
          setCollaborations(data.collaborations);
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadCollaborations();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !targetUsernameOrCompany.trim() || !collabDescription.trim()) {
      showToast('Por favor completa los campos obligatorios.');
      return;
    }

    try {
      const res = await fetch('/api/collaborations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          type: collabType,
          description: collabDescription,
          objective: collabObjective,
          creatorUsername: currentUser,
          targetUsernameOrCompany: targetUsernameOrCompany.trim().replace(/^@/, ''),
          isCompanyCollaboration,
          companyA: isCompanyCollaboration ? companyA : undefined,
          companyB: isCompanyCollaboration ? companyB : undefined,
          startDate,
          endDate: endDate || undefined,
          requirements: requirements || undefined,
          attachments: attachmentLink ? [attachmentLink.trim()] : []
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Propuesta de colaboración enviada.');
        setIsCreateModalOpen(false);
        setProjectName('');
        setCollabDescription('');
        setCollabObjective('');
        setTargetUsernameOrCompany('');
        setAttachmentLink('');
        loadCollaborations();
      } else {
        showToast(data.error || 'Error al crear colaboración.');
      }
    } catch {
      showToast('Error de conexión.');
    }
  };

  const handleUpdateStatus = async (collabId: string, status: CollaborationStatus) => {
    try {
      const res = await fetch(`/api/collaborations/${collabId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, responderUsername: currentUser })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(
          status === 'aceptada'
            ? '¡Colaboración aceptada! Se ha habilitado el espacio y chat de trabajo.'
            : `Estado actualizado a "${status}".`
        );
        loadCollaborations();
        if (selectedCollab?.id === collabId) {
          setSelectedCollab(data.collaboration);
        }
      } else {
        showToast(data.error || 'Error al actualizar estado.');
      }
    } catch {
      showToast('Error de conexión.');
    }
  };

  const handleAddProgressUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollab || !progressUpdateText.trim()) return;

    try {
      const res = await fetch(`/api/collaborations/${selectedCollab.id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: currentUser,
          text: progressUpdateText.trim(),
          fileUrl: progressUpdateFile.trim() || undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Avance del proyecto compartido.');
        setProgressUpdateText('');
        setProgressUpdateFile('');
        setSelectedCollab(data.collaboration);
        loadCollaborations();
      } else {
        showToast(data.error || 'Error al publicar avance.');
      }
    } catch {
      showToast('Error al enviar avance.');
    }
  };

  const handleToggleShowcase = async (collabId: string, currentShowcase: boolean) => {
    try {
      const res = await fetch(`/api/collaborations/${collabId}/showcase`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicShowcase: !currentShowcase })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(
          !currentShowcase
            ? 'Colaboración fijada en vitrina pública de perfil.'
            : 'Colaboración retirada de vitrina pública.'
        );
        loadCollaborations();
        if (selectedCollab?.id === collabId) {
          setSelectedCollab(data.collaboration);
        }
      }
    } catch {
      showToast('Error al actualizar vitrina.');
    }
  };

  // Filter collaborations
  const filteredCollabs = collaborations.filter((c) => {
    const isMine = c.creatorUsername === currentUser;
    const isTarget = c.targetUsernameOrCompany === currentUser;
    const isParticipant = (c.participants || []).includes(currentUser);

    if (activeTab === 'activas') {
      if (c.status !== 'aceptada' && c.status !== 'en_desarrollo') return false;
      if (!isMine && !isTarget && !isParticipant) return false;
    } else if (activeTab === 'recibidas') {
      if (!isTarget || c.status !== 'enviada') return false;
    } else if (activeTab === 'enviadas') {
      if (!isMine) return false;
    } else if (activeTab === 'finalizadas') {
      if (c.status !== 'finalizada') return false;
      if (!isMine && !isTarget && !isParticipant) return false;
    }

    if (typeFilter !== 'all' && c.type !== typeFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.projectName.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchUsers =
        c.creatorUsername.toLowerCase().includes(q) ||
        c.targetUsernameOrCompany.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchUsers) return false;
    }

    return true;
  });

  const receivedCount = collaborations.filter(
    (c) => c.targetUsernameOrCompany === currentUser && c.status === 'enviada'
  ).length;

  const getStatusBadge = (status: CollaborationStatus) => {
    switch (status) {
      case 'aceptada':
      case 'en_desarrollo':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
            En Desarrollo
          </span>
        );
      case 'enviada':
      case 'pendiente':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
            Pendiente de Respuesta
          </span>
        );
      case 'finalizada':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
            Finalizada con Éxito
          </span>
        );
      case 'rechazada':
      case 'cancelada':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950 border border-indigo-500/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <Handshake className="w-4 h-4 text-pink-400" /> Plataforma Integral de Colaboraciones
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Alianzas, Producción & Proyectos Conjuntos
            </h1>
            <p className="text-sm text-slate-300">
              Crea propuestas de co-producción musical, composición, coreografía, diseño y alianzas
              entre empresas y artistas. Al ser aceptada, se crea automáticamente un espacio y chat de trabajo.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" /> Proponer Colaboración
          </button>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'activas', label: 'Proyectos Activos' },
            { id: 'recibidas', label: 'Propuestas Recibidas', badge: receivedCount },
            { id: 'enviadas', label: 'Mis Solicitudes' },
            { id: 'finalizadas', label: 'Finalizadas' },
            { id: 'todas', label: 'Explorar Todas' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-pink-500 text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar proyecto..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs rounded-xl px-3 py-2 text-white font-medium focus:outline-none"
          >
            <option value="all">Todos los Tipos</option>
            <option value="musical">Producción Musical</option>
            <option value="composicion">Composición</option>
            <option value="coreografia">Coreografía</option>
            <option value="fotografia">Fotografía / Visual</option>
            <option value="diseno">Diseño Gráfico / Fashion</option>
            <option value="empresa">Alianza Empresarial</option>
            <option value="grupo">Participación en Grupo</option>
            <option value="especial">Proyecto Especial</option>
          </select>
        </div>
      </div>

      {/* Collaborations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCollabs.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/60 rounded-3xl border border-slate-800">
            No hay colaboraciones en la pestaña {activeTab}.
          </div>
        ) : (
          filteredCollabs.map((collab) => {
            const isMine = collab.creatorUsername === currentUser;
            const isTarget = collab.targetUsernameOrCompany === currentUser;
            const isParticipant = (collab.participants || []).includes(currentUser);

            return (
              <div
                key={collab.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-indigo-400 border border-indigo-500/20">
                      {collab.type}
                    </span>
                    {getStatusBadge(collab.status)}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white line-clamp-1">{collab.projectName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span>De @{collab.creatorUsername}</span>
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      <span className="text-amber-300 font-semibold">@{collab.targetUsernameOrCompany}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3">{collab.description}</p>

                  {collab.objective && (
                    <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-300">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                        Objetivo:
                      </span>
                      {collab.objective}
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-400" /> {collab.startDate}
                    </span>
                    {collab.participants && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-pink-400" /> {collab.participants.length} participante(s)
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  {/* If recipient and proposal pending */}
                  {isTarget && collab.status === 'enviada' && (
                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={() => handleUpdateStatus(collab.id, 'aceptada')}
                        className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition active:scale-95 cursor-pointer"
                      >
                        Aceptar
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(collab.id, 'rechazada')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-rose-300 font-semibold text-xs transition cursor-pointer"
                      >
                        Rechazar
                      </button>
                    </div>
                  )}

                  {/* If active or finished */}
                  <div className="flex items-center justify-between gap-2 w-full">
                    <button
                      onClick={() => setSelectedCollab(collab)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" /> Detalles & Avances ({collab.progressUpdates?.length || 0})
                    </button>

                    {collab.chatGroupId && (
                      <button
                        onClick={() => onGoToChatsGroup && onGoToChatsGroup(collab.chatGroupId!)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1 shadow cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Chat de Proyecto
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: DETALLES Y AVANCES DE COLABORACIÓN */}
      {selectedCollab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                  Colaboración {selectedCollab.type}
                </span>
                <h3 className="text-base font-bold text-white">{selectedCollab.projectName}</h3>
              </div>
              <button
                onClick={() => setSelectedCollab(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-800/60 rounded-2xl border border-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Iniciador</span>
                <span className="text-indigo-300 font-bold">@{selectedCollab.creatorUsername}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Destinatario</span>
                <span className="text-amber-300 font-bold">@{selectedCollab.targetUsernameOrCompany}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Estado</span>
                {getStatusBadge(selectedCollab.status)}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Fecha Inicio</span>
                <span className="text-slate-200">{selectedCollab.startDate}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-200 mb-1">Descripción del Proyecto</h4>
              <p className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
                {selectedCollab.description}
              </p>
            </div>

            {selectedCollab.requirements && (
              <div>
                <h4 className="font-bold text-slate-200 mb-1">Requisitos Técnicos o Artísticos</h4>
                <p className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-slate-300">
                  {selectedCollab.requirements}
                </p>
              </div>
            )}

            {/* Public Showcase Toggle */}
            <div className="flex items-center justify-between p-3 bg-purple-950/20 border border-purple-500/30 rounded-2xl">
              <div>
                <h4 className="font-bold text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" /> Vitrina Pública en Perfiles
                </h4>
                <p className="text-[11px] text-slate-400">
                  Permite que esta colaboración finalizada aparezca con orgullo en tu perfil público.
                </p>
              </div>
              <button
                onClick={() => handleToggleShowcase(selectedCollab.id, selectedCollab.publicShowcase)}
                className={`px-3 py-1.5 rounded-xl font-bold transition text-xs cursor-pointer ${
                  selectedCollab.publicShowcase
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {selectedCollab.publicShowcase ? 'Público en Perfil' : 'Oculto'}
              </button>
            </div>

            {/* Status Change (Finish project) */}
            {(selectedCollab.creatorUsername === currentUser ||
              selectedCollab.targetUsernameOrCompany === currentUser) &&
              (selectedCollab.status === 'aceptada' || selectedCollab.status === 'en_desarrollo') && (
                <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-2xl border border-slate-700">
                  <span>¿Han completado el proyecto con éxito?</span>
                  <button
                    onClick={() => handleUpdateStatus(selectedCollab.id, 'finalizada')}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition cursor-pointer"
                  >
                    Marcar como Finalizada
                  </button>
                </div>
              )}

            {/* Progress Updates Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" /> Historial de Avances & Archivos Compartidos
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(!selectedCollab.progressUpdates || selectedCollab.progressUpdates.length === 0) ? (
                  <p className="text-slate-500 text-center py-4">Aún no se han publicado avances.</p>
                ) : (
                  selectedCollab.progressUpdates.map((upd) => (
                    <div
                      key={upd.id}
                      className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-indigo-300">@{upd.author}</span>
                        <span>{upd.timestamp.split('T')[0]}</span>
                      </div>
                      <p className="text-slate-200">{upd.text}</p>
                      {upd.fileUrl && (
                        <a
                          href={upd.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-pink-400 hover:underline pt-1"
                        >
                          <Link className="w-3 h-3" /> Ver archivo adjunto ({upd.fileUrl})
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add Progress Update Form */}
              <form onSubmit={handleAddProgressUpdate} className="space-y-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  value={progressUpdateText}
                  onChange={(e) => setProgressUpdateText(e.target.value)}
                  placeholder="Escribe una actualización del avance..."
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={progressUpdateFile}
                    onChange={(e) => setProgressUpdateFile(e.target.value)}
                    placeholder="Enlace o archivo (opcional)"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Publicar Avance
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREAR PROPUESTA DE COLABORACIÓN */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreateSubmit}
            className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white max-h-[90vh] overflow-y-auto text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Handshake className="w-5 h-5 text-indigo-400" /> Nueva Propuesta de Colaboración
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
              <label className="block text-slate-300 font-bold mb-1">Nombre del Proyecto *</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                placeholder="ej: Single Debut: Golden Skyline"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Tipo de Colaboración *</label>
                <select
                  value={collabType}
                  onChange={(e) => setCollabType(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="musical">Producción Musical</option>
                  <option value="composicion">Composición de Letras</option>
                  <option value="coreografia">Coreografía & Baile</option>
                  <option value="fotografia">Fotografía & Concepto Visual</option>
                  <option value="diseno">Diseño Gráfico & Fashion</option>
                  <option value="empresa">Colaboración entre Empresas</option>
                  <option value="grupo">Participación en Grupo</option>
                  <option value="especial">Proyecto Especial</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Destinatario (Usuario o Empresa) *</label>
                <input
                  type="text"
                  value={targetUsernameOrCompany}
                  onChange={(e) => setTargetUsernameOrCompany(e.target.value)}
                  required
                  placeholder="ej: usuario_destinatario o nombre de empresa"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Descripción del Proyecto *</label>
              <textarea
                value={collabDescription}
                onChange={(e) => setCollabDescription(e.target.value)}
                rows={3}
                required
                placeholder="Explica detalladamente la idea, propuesta y responsabilidades mutuas..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white resize-none placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Objetivo del Proyecto</label>
              <input
                type="text"
                value={collabObjective}
                onChange={(e) => setCollabObjective(e.target.value)}
                placeholder="ej: Lanzamiento oficial conjunto en plataformas y gala de premios"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Fecha de Inicio</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Fecha de Finalización Estimada</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Requisitos Específicos</label>
              <input
                type="text"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="ej: Formato WAV 24-bit, dominio de técnica vocal lírica"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Enlace a Archivos o Demo (Opcional)</label>
              <input
                type="text"
                value={attachmentLink}
                onChange={(e) => setAttachmentLink(e.target.value)}
                placeholder="https://... o enlace a archivo/audio"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow"
              >
                Enviar Solicitud
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
