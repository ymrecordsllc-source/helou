import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  Sparkles,
  Disc3,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Edit2,
  Trash2,
  Play,
  Volume2,
  Music2,
  CheckCircle2,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChartEntry } from '../types';

export const ChartsSection: React.FC = () => {
  const { userProfile, charts, releases, addChartEntry, updateChartEntry, deleteChartEntry, showToast } = useApp();

  const isAdmin = userProfile.accountType === 'admin';

  // Subsections
  const [activeTab, setActiveTab] = useState<'main' | 'rookie' | 'releases'>('main');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Admin Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [formCategory, setFormCategory] = useState<'main' | 'rookie'>('main');
  const [formTitle, setFormTitle] = useState('');
  const [formArtist, setFormArtist] = useState('');
  const [formCover, setFormCover] = useState('');
  const [formAudio, setFormAudio] = useState('');
  const [formScore, setFormScore] = useState(100);
  const [formRank, setFormRank] = useState(1);
  const [formPreviousRank, setFormPreviousRank] = useState(1);
  const [formMovement, setFormMovement] = useState<'up' | 'down' | 'same' | 'new'>('new');
  const [formPeriod, setFormPeriod] = useState('Semana 45 - Noviembre 2026');
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [formNotes, setFormNotes] = useState('');

  // Main & Rookie lists
  const mainCharts = (charts || [])
    .filter((c) => c.category === 'main' && (isAdmin || c.isPublished))
    .sort((a, b) => a.rank - b.rank);

  const rookieCharts = (charts || [])
    .filter((c) => c.category === 'rookie' && (isAdmin || c.isPublished))
    .sort((a, b) => a.rank - b.rank);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormCategory(activeTab === 'rookie' ? 'rookie' : 'main');
    setFormTitle('');
    setFormArtist('');
    setFormCover('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop');
    setFormAudio('');
    setFormScore(980);
    setFormRank((charts?.length || 0) + 1);
    setFormPreviousRank(1);
    setFormMovement('new');
    setFormPeriod('Semana 45 - Noviembre 2026');
    setFormIsPublished(true);
    setFormNotes('Puntuación combinada de streaming digital y votación comunitaria');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (entry: ChartEntry) => {
    setEditingId(entry.id);
    setFormCategory(entry.category);
    setFormTitle(entry.title);
    setFormArtist(entry.artist);
    setFormCover(entry.coverImage);
    setFormAudio(entry.audioUrl || '');
    setFormScore(entry.score);
    setFormRank(entry.rank);
    setFormPreviousRank(entry.previousRank);
    setFormMovement(entry.movement);
    setFormPeriod(entry.period);
    setFormIsPublished(entry.isPublished);
    setFormNotes(entry.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmitChart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formArtist.trim()) {
      showToast('Título y artista son obligatorios.');
      return;
    }

    if (editingId) {
      await updateChartEntry(editingId, {
        category: formCategory,
        title: formTitle.trim(),
        artist: formArtist.trim(),
        coverImage: formCover.trim(),
        audioUrl: formAudio.trim(),
        score: Number(formScore),
        rank: Number(formRank),
        previousRank: Number(formPreviousRank),
        movement: formMovement,
        period: formPeriod.trim(),
        isPublished: formIsPublished,
        notes: formNotes.trim()
      });
      showToast('Entrada del Chart actualizada con éxito.');
    } else {
      await addChartEntry({
        category: formCategory,
        title: formTitle.trim(),
        artist: formArtist.trim(),
        coverImage: formCover.trim(),
        audioUrl: formAudio.trim(),
        score: Number(formScore),
        rank: Number(formRank),
        previousRank: Number(formPreviousRank),
        movement: formMovement,
        period: formPeriod.trim(),
        isPublished: formIsPublished,
        notes: formNotes.trim()
      });
      showToast('Canción agregada al Chart oficial.');
    }

    setIsModalOpen(false);
  };

  const handleDeleteChart = async (id: string, songName: string) => {
    await deleteChartEntry(id);
    showToast(`Canción "${songName}" retirada del ranking.`);
  };

  const renderMovementBadge = (entry: ChartEntry) => {
    if (entry.movement === 'new') {
      return (
        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider animate-pulse">
          NEW
        </span>
      );
    }
    if (entry.movement === 'up') {
      const diff = Math.max(1, entry.previousRank - entry.rank);
      return (
        <span className="flex items-center gap-0.5 text-emerald-400 font-bold text-xs">
          <ArrowUp className="w-3.5 h-3.5" /> +{diff}
        </span>
      );
    }
    if (entry.movement === 'down') {
      const diff = Math.max(1, entry.rank - entry.previousRank);
      return (
        <span className="flex items-center gap-0.5 text-rose-400 font-bold text-xs">
          <ArrowDown className="w-3.5 h-3.5" /> -{diff}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-0.5 text-slate-400 font-bold text-xs">
        <Minus className="w-3.5 h-3.5" /> =
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-slate-900 light-theme:bg-white p-6 sm:p-8 rounded-3xl border border-slate-800 light-theme:border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 light-theme:text-indigo-600 mb-1.5">
            <TrendingUp className="w-4 h-4" /> Clasificación Musical Oficial YM-ki Records
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white light-theme:text-slate-900 tracking-tight">
            Charts & Rankings Oficiales
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light-theme:text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Las canciones más reproducidas, valoradas y aclamadas por la comunidad global de fans de YM-ki Records, clasificadas en Main Charts, Rookie Charts y Nuevos Lanzamientos.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="theme-btn px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Añadir Entrada al Chart
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-900 light-theme:bg-white p-1.5 rounded-2xl border border-slate-800 light-theme:border-slate-200 max-w-md">
        <button
          onClick={() => setActiveTab('main')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'main'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 light-theme:text-slate-600 hover:text-white light-theme:hover:text-slate-900'
          }`}
        >
          <Award className="w-3.5 h-3.5" /> Main Charts
        </button>
        <button
          onClick={() => setActiveTab('rookie')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'rookie'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 light-theme:text-slate-600 hover:text-white light-theme:hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Rookie Charts
        </button>
        <button
          onClick={() => setActiveTab('releases')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'releases'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 light-theme:text-slate-600 hover:text-white light-theme:hover:text-slate-900'
          }`}
        >
          <Disc3 className="w-3.5 h-3.5" /> New Releases
        </button>
      </div>

      {/* MAIN & ROOKIE CHARTS LIST */}
      {(activeTab === 'main' || activeTab === 'rookie') && (
        <div className="bg-slate-900 light-theme:bg-white border border-slate-800 light-theme:border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          {/* Section banner */}
          <div className="p-5 border-b border-slate-800 light-theme:border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 light-theme:bg-slate-50">
            <div>
              <h3 className="text-sm font-black text-white light-theme:text-slate-900">
                {activeTab === 'main' ? 'Top Canciones YM-ki (Main Chart)' : 'Top Artistas Debutantes (Rookie Chart)'}
              </h3>
              <p className="text-[11px] text-slate-400 light-theme:text-slate-500">
                Actualizado semanalmente según reproducciones y evaluaciones verificadas
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Período Oficial:
              </span>
              <span className="text-[11px] font-bold text-indigo-400 light-theme:text-indigo-600 px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                Noviembre 2026
              </span>
            </div>
          </div>

          {/* Table of Entries */}
          {(activeTab === 'main' ? mainCharts : rookieCharts).length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Music2 className="w-10 h-10 text-slate-500 mx-auto" />
              <h4 className="text-sm font-bold text-white light-theme:text-slate-900">
                No hay clasificaciones publicadas en este ranking
              </h4>
              <p className="text-xs text-slate-400 light-theme:text-slate-500 max-w-sm mx-auto">
                Los administradores pueden publicar canciones y clasificaciones oficiales de la agencia.
              </p>
              {isAdmin && (
                <button
                  onClick={handleOpenAddModal}
                  className="theme-btn px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Canción
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 light-theme:divide-slate-200">
              {(activeTab === 'main' ? mainCharts : rookieCharts).map((entry, index) => (
                <div
                  key={entry.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-800/30 light-theme:hover:bg-slate-50 transition"
                >
                  {/* Rank & Movement */}
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <span
                      className={`text-lg sm:text-2xl font-black w-7 sm:w-9 text-center ${
                        entry.rank === 1
                          ? 'text-amber-400'
                          : entry.rank === 2
                          ? 'text-slate-300'
                          : entry.rank === 3
                          ? 'text-amber-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {entry.rank}
                    </span>

                    <div className="w-12 sm:w-14 flex items-center justify-center">
                      {renderMovementBadge(entry)}
                    </div>
                  </div>

                  {/* Cover & Song Info */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-slate-950 shrink-0 relative group shadow">
                      <img
                        src={entry.coverImage}
                        alt={entry.title}
                        className="w-full h-full object-cover"
                      />
                      {entry.audioUrl && (
                        <button
                          onClick={() => setPlayingId(playingId === entry.id ? null : entry.id)}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white"
                          title="Preescuchar"
                        >
                          {playingId === entry.id ? (
                            <Volume2 className="w-5 h-5 text-indigo-400 animate-pulse" />
                          ) : (
                            <Play className="w-5 h-5 fill-current" />
                          )}
                        </button>
                      )}
                    </div>

                    <div className="truncate">
                      <h4 className="text-xs sm:text-sm font-black text-white light-theme:text-slate-900 truncate flex items-center gap-2">
                        {entry.title}
                        {!entry.isPublished && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">
                            Borrador
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-400 light-theme:text-slate-600 truncate">
                        {entry.artist}
                      </p>
                      {entry.notes && (
                        <p className="text-[10px] text-slate-500 truncate hidden sm:block">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Score & Actions */}
                  <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-extrabold text-indigo-400 light-theme:text-indigo-600">
                        {entry.score.toLocaleString()} pts
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Previo: #{entry.previousRank}
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1 bg-slate-950/60 light-theme:bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => handleOpenEditModal(entry)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 transition"
                          title="Editar posición / puntuación"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteChart(entry.id, entry.title)}
                          className="p-1.5 text-slate-400 hover:text-red-400 transition"
                          title="Eliminar del ranking"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* NEW RELEASES CATALOG */}
      {activeTab === 'releases' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white light-theme:text-slate-900 flex items-center gap-2">
              <Disc3 className="w-4 h-4 text-pink-400" /> Catálogo de Nuevos Lanzamientos Oficiales
            </h3>
            <span className="text-xs text-slate-400">
              {releases ? releases.length : 0} producciones discográficas
            </span>
          </div>

          {!releases || releases.length === 0 ? (
            <div className="bg-slate-900 light-theme:bg-white p-12 rounded-3xl border border-slate-800 light-theme:border-slate-200 text-center space-y-2">
              <Disc3 className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400 light-theme:text-slate-500">
                No hay lanzamientos cargados en la discografía actualmente.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {releases.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-slate-900 light-theme:bg-white border border-slate-800 light-theme:border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:border-pink-500/50 transition flex flex-col justify-between"
                >
                  <div className="h-44 w-full relative overflow-hidden bg-slate-950">
                    <img
                      src={rel.thumbnail}
                      alt={rel.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-[10px] font-bold text-white uppercase border border-white/20">
                      {rel.type}
                    </div>
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-pink-600 text-white text-[10px] font-black">
                      {rel.isReleased ? 'DISPONIBLE' : 'PRÓXIMAMENTE'}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="text-base font-black text-white light-theme:text-slate-900 truncate">
                        {rel.title}
                      </h4>
                      <p className="text-xs font-semibold text-slate-400 light-theme:text-slate-600">
                        {rel.artist}
                      </p>
                      <p className="text-xs text-slate-400 light-theme:text-slate-500 mt-2 line-clamp-2">
                        {rel.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 light-theme:border-slate-200 flex items-center justify-between text-xs text-slate-400">
                      <span>Lanzamiento: {rel.releaseDate}</span>
                      {rel.youtubeUrl && (
                        <a
                          href={rel.youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-pink-400 hover:text-pink-300 font-bold"
                        >
                          Ver MV ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADMIN ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-900 light-theme:bg-white border border-slate-800 light-theme:border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-auto animate-fadeIn max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 light-theme:border-slate-200">
              <h3 className="text-base font-black text-white light-theme:text-slate-900">
                {editingId ? 'Editar Entrada del Chart' : 'Añadir Nueva Canción al Chart'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitChart} className="overflow-y-auto space-y-4 pt-4 pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 light-theme:text-slate-700 mb-1">
                  Categoría del Ranking
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full bg-slate-800 light-theme:bg-slate-50 border border-slate-700 light-theme:border-slate-300 rounded-xl p-3 text-xs text-white light-theme:text-slate-900"
                >
                  <option value="main">Main Chart (Clasificación General)</option>
                  <option value="rookie">Rookie Chart (Artistas Nuevos / Debutantes)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 light-theme:text-slate-700 mb-1">
                    Título de la Canción *
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ej: ECLIPSE, Starlight..."
                    className="w-full bg-slate-800 light-theme:bg-slate-50 border border-slate-700 light-theme:border-slate-300 rounded-xl p-3 text-xs text-white light-theme:text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 light-theme:text-slate-700 mb-1">
                    Artista / Agrupación *
                  </label>
                  <input
                    type="text"
                    value={formArtist}
                    onChange={(e) => setFormArtist(e.target.value)}
                    placeholder="Ej: YM-ki All Stars"
                    className="w-full bg-slate-800 light-theme:bg-slate-50 border border-slate-700 light-theme:border-slate-300 rounded-xl p-3 text-xs text-white light-theme:text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 light-theme:text-slate-700 mb-1">
                  Portada del Sencillo / Álbum (URL)
                </label>
                <input
                  type="url"
                  value={formCover}
                  onChange={(e) => setFormCover(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-800 light-theme:bg-slate-50 border border-slate-700 light-theme:border-slate-300 rounded-xl p-3 text-xs text-white light-theme:text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 light-theme:text-slate-700 mb-1">
                    Posición
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={formRank}
                    onChange={(e) => setFormRank(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-800 light-theme:bg-slate-50 border border-slate-700 light-theme:border-slate-300 rounded-xl p-3 text-xs text-white light-theme:text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 light-theme:text-slate-700 mb-1">
                    Posición Previa
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={formPreviousRank}
                    onChange={(e) => setFormPreviousRank(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-800 light-theme:bg-slate-50 border border-slate-700 light-theme:border-slate-300 rounded-xl p-3 text-xs text-white light-theme:text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 light-theme:text-slate-700 mb-1">
                    Puntos / Score
                  </label>
                  <input
                    type="number"
                    value={formScore}
                    onChange={(e) => setFormScore(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800 light-theme:bg-slate-50 border border-slate-700 light-theme:border-slate-300 rounded-xl p-3 text-xs text-white light-theme:text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 light-theme:text-slate-700 mb-1">
                    Indicador de Movimiento
                  </label>
                  <select
                    value={formMovement}
                    onChange={(e) => setFormMovement(e.target.value as any)}
                    className="w-full bg-slate-800 light-theme:bg-slate-50 border border-slate-700 light-theme:border-slate-300 rounded-xl p-3 text-xs text-white light-theme:text-slate-900"
                  >
                    <option value="new">Nuevo Ingreso (NEW)</option>
                    <option value="up">Subida (▲)</option>
                    <option value="down">Bajada (▼)</option>
                    <option value="same">Permanencia (=)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 light-theme:text-slate-700 mb-1">
                    Período / Semana
                  </label>
                  <input
                    type="text"
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(e.target.value)}
                    placeholder="Semana 45 - Noviembre 2026"
                    className="w-full bg-slate-800 light-theme:bg-slate-50 border border-slate-700 light-theme:border-slate-300 rounded-xl p-3 text-xs text-white light-theme:text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 light-theme:text-slate-700 mb-1">
                  Notas sobre el origen del dato o métrica
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ej: Registro manual de administración basado en streaming oficial"
                  className="w-full bg-slate-800 light-theme:bg-slate-50 border border-slate-700 light-theme:border-slate-300 rounded-xl p-3 text-xs text-white light-theme:text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chartPublished"
                  checked={formIsPublished}
                  onChange={(e) => setFormIsPublished(e.target.checked)}
                  className="rounded border-slate-700"
                />
                <label htmlFor="chartPublished" className="text-xs text-slate-300 light-theme:text-slate-700 font-semibold cursor-pointer">
                  Publicar en el ranking oficial inmediatamente
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 light-theme:border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-2xl text-xs font-bold bg-slate-800 light-theme:bg-slate-200 text-slate-300 light-theme:text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="theme-btn px-6 py-3 rounded-2xl text-xs font-bold shadow-lg"
                >
                  {editingId ? 'Guardar Cambios' : 'Añadir al Ranking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
