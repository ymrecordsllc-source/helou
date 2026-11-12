import React, { useState } from 'react';
import {
  Trophy,
  Plus,
  Vote,
  Award,
  Calendar,
  X,
  CheckCircle2,
  Users,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AwardEvent, AwardCategory, AwardNominee } from '../types';
import { FileUploadButton } from './FileUploadButton';

export const AwardsSection: React.FC = () => {
  const {
    userProfile,
    isPrivileged,
    awards,
    userAwardVotes,
    userVotedNominees,
    ceosList,
    createAwardEvent,
    deleteAwardEvent,
    createAwardCategory,
    deleteAwardCategory,
    voteAwardNominee,
    grantAwardReward,
    showToast
  } = useApp();

  const [selectedEvent, setSelectedEvent] = useState<AwardEvent | null>(() => awards[0] || null);
  const [selectedCategory, setSelectedCategory] = useState<AwardCategory | null>(() => awards[0]?.categories[0] || null);

  // Tab in category view: 'vote' vs 'my_votes'
  const [categoryViewTab, setCategoryViewTab] = useState<'vote' | 'my_votes'>('vote');

  // Modals for Admins
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [isGrantRewardModalOpen, setIsGrantRewardModalOpen] = useState(false);

  // Grant digital reward state
  const [grantWinnerUsername, setGrantWinnerUsername] = useState('');
  const [grantTrophyName, setGrantTrophyName] = useState('Trofeo de Oro Oficial');
  const [grantTrophyIcon, setGrantTrophyIcon] = useState('🏆');
  const [grantTitle, setGrantTitle] = useState('Ganador de Categoría 2026');
  const [grantCeoSignature, setGrantCeoSignature] = useState('Dirección Oficial YM-ki');
  const [isGrantingReward, setIsGrantingReward] = useState(false);

  // Delete Confirmations State
  const [eventToDelete, setEventToDelete] = useState<AwardEvent | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{ eventId: string; category: AwardCategory } | null>(null);

  // New Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventBanner, setEventBanner] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');

  // New Category Form State
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [targetEventId, setTargetEventId] = useState<string>(() => awards[0]?.id || '');
  const [catVoteLimit, setCatVoteLimit] = useState<number>(3);
  const [nomineesList, setNomineesList] = useState<AwardNominee[]>([
    {
      id: 'nom-1',
      name: 'YM-ki All Stars',
      subtitle: 'Comeback Oficial',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300',
      votes: 0
    }
  ]);
  const [newNomName, setNewNomName] = useState('');
  const [newNomSub, setNewNomSub] = useState('');
  const [newNomImg, setNewNomImg] = useState('');

  const isAdmin = isPrivileged();

  const activeEvent = selectedEvent || awards[0] || null;
  const activeCategory = selectedCategory || activeEvent?.categories[0] || null;

  const voteKey = activeCategory ? `${userProfile.username}_${activeCategory.id}` : '';
  const myVotesCount = userAwardVotes[voteKey] || 0;
  const myVotedNomineeNames = userVotedNominees[voteKey] || [];
  const voteLimit = activeCategory?.votesLimitPerUser || 1;
  const votesRemaining = Math.max(0, voteLimit - myVotesCount);

  const handleVote = (nomineeId: string) => {
    if (!activeEvent || !activeCategory) return;
    voteAwardNominee(activeEvent.id, activeCategory.id, nomineeId);
  };

  const handleAddNominee = () => {
    if (!newNomName.trim()) return;
    setNomineesList([
      ...nomineesList,
      {
        id: 'nom-' + Date.now(),
        name: newNomName.trim(),
        subtitle: newNomSub.trim() || 'Nominado Oficial',
        image: newNomImg.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
        votes: 0
      }
    ]);
    setNewNomName('');
    setNewNomSub('');
    setNewNomImg('');
  };

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    createAwardEvent({
      title: eventTitle.trim(),
      description: eventDesc.trim() || 'Gran premiación anual de la comunidad YM-ki.',
      banner: eventBanner.trim() || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200',
      startDate: eventStart || new Date().toISOString().slice(0, 10),
      endDate: eventEnd || '2026-12-31',
      isActive: true,
      categories: [],
      createdBy: userProfile.username
    });
    setIsNewEventModalOpen(false);
    setEventTitle('');
    setEventDesc('');
    setEventBanner('');
  };

  const handleCreateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventToAssign = awards.find((a) => a.id === targetEventId) || activeEvent;
    if (!eventToAssign || !catName.trim()) {
      showToast('Por favor selecciona una premiación y escribe el nombre de la categoría.');
      return;
    }
    createAwardCategory(eventToAssign.id, {
      name: catName.trim(),
      description: catDesc.trim() || 'Vota por tu favorito.',
      votesLimitPerUser: catVoteLimit,
      nominees: nomineesList
    });
    setIsNewCategoryModalOpen(false);
    setCatName('');
    setCatDesc('');
    setNomineesList([]);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Banner */}
      <div className="rounded-2xl p-6 sm:p-8 bg-slate-900 border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Trophy className="w-3.5 h-3.5" />
            Premiaciones Oficiales & Gala Anual
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Votaciones & Reconocimientos
          </h1>
          <p className="text-sm text-slate-300">
            Participa con tu voto en las diferentes categorías oficiales para premiar a los mejores artistas, MVs, coreografías y producciones del año.
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsNewEventModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-bold text-xs bg-amber-600 hover:bg-amber-500 shadow cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Nueva Premiación
            </button>
            {activeEvent && (
              <button
                onClick={() => setIsNewCategoryModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-bold text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Nueva Categoría
              </button>
            )}
            {activeEvent && activeCategory && (
              <button
                onClick={() => {
                  setGrantWinnerUsername('');
                  setGrantTrophyName(`Trofeo Oficial - ${activeCategory.name}`);
                  setGrantTitle(`Ganador(a) ${activeCategory.name} 2026`);
                  setIsGrantRewardModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-amber-200 font-bold text-xs bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 shadow cursor-pointer active:scale-95"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                Otorgar Galardones
              </button>
            )}
            {activeEvent && (
              <button
                type="button"
                onClick={() => setEventToDelete(activeEvent)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-red-300 hover:text-white font-bold text-xs bg-red-950/60 hover:bg-red-900 border border-red-500/40 shadow cursor-pointer active:scale-95 transition"
                title="Eliminar Premiación (Solo Administradores)"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                Eliminar Premiación
              </button>
            )}
          </div>
        )}
      </div>

      {/* Select Award Event pills if multiple exist */}
      {awards.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {awards.map((ev) => (
            <button
              key={ev.id}
              onClick={() => {
                setSelectedEvent(ev);
                setSelectedCategory(ev.categories[0] || null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition active:scale-95 ${
                activeEvent?.id === ev.id
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {ev.title}
            </button>
          ))}
        </div>
      )}

      {/* Main Award Content */}
      {activeEvent ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Categories List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Categorías de Premiación</span>
                <span className="text-amber-400 font-bold">{activeEvent.categories.length}</span>
              </h3>

              <div className="space-y-2">
                {activeEvent.categories.map((cat) => {
                  const isSelected = activeCategory?.id === cat.id;
                  const catVotes = userAwardVotes[`${userProfile.username}_${cat.id}`] || 0;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCategoryViewTab('vote');
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between active:scale-98 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/15 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-extrabold line-clamp-1">{cat.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Límite: {cat.votesLimitPerUser} votos por fan
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {catVotes > 0 && (
                          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                            Votaste ({catVotes})
                          </span>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCategoryToDelete({ eventId: activeEvent.id, category: cat });
                            }}
                            className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/60 transition cursor-pointer"
                            title="Eliminar Categoría (Solo Administradores)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    </div>
                  );
                })}

                {activeEvent.categories.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">
                    Aún no se han añadido categorías a esta premiación.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Category Voting & Nominees View */}
          <div className="lg:col-span-8 space-y-5">
            {activeCategory ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      Categoría en Votación
                    </span>
                    <h2 className="text-xl font-extrabold text-white">
                      {activeCategory.name}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {activeCategory.description}
                    </p>
                  </div>

                  {/* Tabs: "Votar" vs "Mis Votos" */}
                  <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setCategoryViewTab('vote')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95 ${
                        categoryViewTab === 'vote'
                          ? 'bg-amber-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Votar
                    </button>
                    <button
                      onClick={() => setCategoryViewTab('my_votes')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95 ${
                        categoryViewTab === 'my_votes'
                          ? 'bg-amber-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Mis Votos ({myVotesCount}/{voteLimit})
                    </button>
                  </div>
                </div>

                {/* Voting Status Banner */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Vote className="w-4 h-4 text-amber-400" />
                    <span>Límite configurado por administración: <strong>{voteLimit} votos</strong> por persona.</span>
                  </div>
                  <div className="text-amber-400 font-extrabold">
                    {votesRemaining > 0 ? `${votesRemaining} votos restantes` : 'Límite alcanzado'}
                  </div>
                </div>

                {/* Tab: Votar (Nominees List) */}
                {categoryViewTab === 'vote' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {activeCategory.nominees.map((nom) => (
                      <div
                        key={nom.id}
                        className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col justify-between shadow transition hover:border-slate-700"
                      >
                        <div className="relative aspect-square w-full overflow-hidden bg-slate-900">
                          <img
                            src={nom.image}
                            alt={nom.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-bold text-white">
                            {nom.votes} votos
                          </div>
                        </div>

                        <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-extrabold text-white line-clamp-1">
                              {nom.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {nom.subtitle}
                            </p>
                          </div>

                          <button
                            disabled={votesRemaining <= 0}
                            onClick={() => handleVote(nom.id)}
                            className="w-full mt-2 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-amber-600 hover:bg-amber-500 text-white shadow"
                          >
                            <Vote className="w-3.5 h-3.5" />
                            Votar ({nom.votes})
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab: Mis Votos */}
                {categoryViewTab === 'my_votes' && (
                  <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Historial de Votos en esta Categoría
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-slate-300">
                      <div>Votos emitidos: <strong className="text-white">{myVotesCount}</strong></div>
                      <div>Límite permitido: <strong className="text-white">{voteLimit}</strong></div>
                      <div>Disponibles: <strong className="text-emerald-400">{votesRemaining}</strong></div>
                    </div>

                    {myVotedNomineeNames.length > 0 ? (
                      <div className="space-y-2 pt-2">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                          Nominados por los que has votado:
                        </p>
                        {myVotedNomineeNames.map((name, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-white"
                          >
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            {name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 py-4 text-center">
                        Aún no has emitido ningún voto en esta categoría.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-sm">
                Selecciona una categoría para ver los nominados y votar.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-sm">
          No hay premiaciones activas.
        </div>
      )}

      {/* CREATE EVENT MODAL (Admins Only) */}
      {isNewEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Nueva Premiación Oficial
              </h3>
              <button
                onClick={() => setIsNewEventModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Título de la Premiación</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. YM-ki Performance Awards 2026"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Banner Oficial</label>
                  <FileUploadButton
                    onUploadSuccess={(url) => setEventBanner(url)}
                    label="Subir Banner desde dispositivo"
                    className="scale-90 origin-right"
                  />
                </div>
                <input
                  type="text"
                  placeholder="O pegar URL: https://images.unsplash.com/..."
                  value={eventBanner}
                  onChange={(e) => setEventBanner(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Fecha Inicio</label>
                  <input
                    type="date"
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Fecha Cierre</label>
                  <input
                    type="date"
                    value={eventEnd}
                    onChange={(e) => setEventEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Descripción de la gala y bases..."
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow cursor-pointer active:scale-95"
                >
                  Crear Premiación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CATEGORY MODAL (Admins Only) */}
      {isNewCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Nueva Categoría de Premiación
              </h3>
              <button
                onClick={() => setIsNewCategoryModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategorySubmit} className="space-y-4">
              {/* Event Selector (Añadido selector de premiación) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  ¿A qué Premiación pertenecerá esta categoría? (Selector Oficial)
                </label>
                <select
                  value={targetEventId || activeEvent?.id || ''}
                  onChange={(e) => setTargetEventId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-amber-500"
                >
                  {awards.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev.isActive ? 'Activa' : 'Cerrada'})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400">
                  Elige a cuál de los eventos oficiales de premiación quedará asociada esta categoría.
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Nombre de la Categoría</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Mejor Solista Femenino"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  Límite de Votos por Persona (Configuración de Admin)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={catVoteLimit}
                  onChange={(e) => setCatVoteLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                />
                <span className="text-[11px] text-slate-400">
                  Cuántos votos como máximo puede emitir cada usuario en esta categoría.
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Descripción de la Categoría</label>
                <textarea
                  rows={2}
                  placeholder="Criterios y elegibilidad..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                />
              </div>

              {/* Add Nominees */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                  Añadir Nominados ({nomineesList.length})
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nombre del nominado..."
                    value={newNomName}
                    onChange={(e) => setNewNomName(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Subtítulo / Canción..."
                    value={newNomSub}
                    onChange={(e) => setNewNomSub(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <FileUploadButton
                    onUploadSuccess={(url) => setNewNomImg(url)}
                    label="Subir Foto"
                  />
                  <input
                    type="text"
                    placeholder="O pegar URL de foto..."
                    value={newNomImg}
                    onChange={(e) => setNewNomImg(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddNominee}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold cursor-pointer active:scale-95"
                  >
                    + Añadir
                  </button>
                </div>

                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {nomineesList.map((nom, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 text-xs text-slate-300">
                      <span>{nom.name} ({nom.subtitle})</span>
                      <button
                        type="button"
                        onClick={() => setNomineesList(nomineesList.filter((_, idx) => idx !== i))}
                        className="text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow cursor-pointer active:scale-95"
                >
                  Guardar Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRANT DIGITAL REWARD MODAL (Admins & Founders) */}
      {isGrantRewardModalOpen && activeEvent && activeCategory && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" /> Otorgar Galardón Digital Oficial
              </h3>
              <button
                onClick={() => setIsGrantRewardModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-amber-500/20 text-xs text-amber-300">
              Esta acción otorga al ganador un <strong>Trofeo Digital</strong> en su vitrina y perfil, un <strong>Certificado Oficial con firma CEO</strong>, e insignias conmemorativas.
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!grantWinnerUsername.trim()) {
                  showToast('Ingresa el nombre de usuario del ganador.');
                  return;
                }
                setIsGrantingReward(true);
                const ok = await grantAwardReward(
                  activeEvent.id,
                  activeCategory.id,
                  grantWinnerUsername.trim(),
                  grantTrophyName.trim(),
                  grantTitle.trim()
                );
                setIsGrantingReward(false);
                if (ok) {
                  setIsGrantRewardModalOpen(false);
                  setGrantWinnerUsername('');
                }
              }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Usuario del Ganador / Artista (@):</label>
                <input
                  type="text"
                  required
                  placeholder="ej: usuario o trainee_artist"
                  value={grantWinnerUsername}
                  onChange={(e) => setGrantWinnerUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Nombre del Trofeo Digital:</label>
                <input
                  type="text"
                  required
                  value={grantTrophyName}
                  onChange={(e) => setGrantTrophyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Ícono del Galardón:</label>
                  <select
                    value={grantTrophyIcon}
                    onChange={(e) => setGrantTrophyIcon(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="🏆">🏆 Trofeo Dorado</option>
                    <option value="🥇">🥇 Medalla de Oro</option>
                    <option value="💎">💎 Diamante Platino</option>
                    <option value="👑">👑 Corona Real</option>
                    <option value="⭐">⭐ Estrella Suprema</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Firma Oficial CEO:</label>
                  <select
                    value={grantCeoSignature}
                    onChange={(e) => setGrantCeoSignature(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Dirección Oficial YM-ki">👑 Dirección Oficial YM-ki</option>
                    <option value="Comité Ejecutivo YM-ki">⭐ Comité Ejecutivo YM-ki</option>
                    {ceosList.map((c) => (
                      <option key={c.id} value={c.name}>
                        👑 {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Título de Reconocimiento Público:</label>
                <input
                  type="text"
                  required
                  value={grantTitle}
                  onChange={(e) => setGrantTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGrantRewardModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isGrantingReward}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow-lg cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  {isGrantingReward ? 'Otorgando...' : 'Otorgar Galardón'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Event Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/30">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">¿Eliminar Premiación?</h3>
                <p className="text-xs text-slate-400">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              Se eliminará permanentemente la premiación <strong className="text-white font-bold">"{eventToDelete.title}"</strong> con todas sus {eventToDelete.categories.length} categorías y los votos registrados.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAwardEvent(eventToDelete.id);
                  if (activeEvent?.id === eventToDelete.id) {
                    setSelectedEvent(null);
                    setSelectedCategory(null);
                  }
                  setEventToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-lg shadow-red-950 transition active:scale-95 cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/30">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">¿Eliminar Categoría?</h3>
                <p className="text-xs text-slate-400">Esta acción es permanente.</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              Se eliminará la categoría <strong className="text-white font-bold">"{categoryToDelete.category.name}"</strong> con todos sus nominados y registros de votos.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAwardCategory(categoryToDelete.eventId, categoryToDelete.category.id);
                  if (activeCategory?.id === categoryToDelete.category.id) {
                    setSelectedCategory(null);
                  }
                  setCategoryToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-lg shadow-red-950 transition active:scale-95 cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
