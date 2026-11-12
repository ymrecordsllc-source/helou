import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Play,
  Film,
  Music,
  ExternalLink,
  Calendar,
  X,
  Volume2,
  VolumeX,
  Clock,
  ListMusic
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Release, AlbumTrack } from '../types';
import { musicEngine } from '../utils/audioPlayer';
import { FileUploadButton } from './FileUploadButton';

export const ReleasesSection: React.FC = () => {
  const {
    userProfile,
    isPrivileged,
    releases,
    createRelease,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'released' | 'upcoming'>('released');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Active media modals
  const [viewingVideo, setViewingVideo] = useState<{ title: string; url: string; type: 'MV' | 'Trailer' } | null>(null);
  const [viewingTracklistRelease, setViewingTracklistRelease] = useState<Release | null>(null);

  // Audio player state inside tracklist modal
  const [playingTrackIndex, setPlayingTrackIndex] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Creation form state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [type, setType] = useState<'single' | 'mini' | 'full' | 'mv' | 'trailer'>('mv');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [mvUrl, setMvUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tracks, setTracks] = useState<AlbumTrack[]>([
    { trackNumber: 1, title: 'Title Track', duration: '3:20' }
  ]);
  const [newTrackTitle, setNewTrackTitle] = useState('');

  const isAdmin = isPrivileged();

  const handleAddTrack = () => {
    if (!newTrackTitle.trim()) return;
    setTracks([
      ...tracks,
      { trackNumber: tracks.length + 1, title: newTrackTitle.trim(), duration: '3:15' }
    ]);
    setNewTrackTitle('');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim() || !releaseDate) {
      showToast('Por favor completa los campos requeridos.');
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const isAlreadyReleased = releaseDate <= today;

    createRelease({
      title: title.trim(),
      artist: artist.trim(),
      releaseDate,
      isReleased: isAlreadyReleased,
      thumbnail: thumbnail.trim() || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
      type,
      youtubeUrl: youtubeUrl.trim() || 'https://youtube.com',
      tiktokUrl: tiktokUrl.trim() || 'https://tiktok.com',
      trailerUrl: trailerUrl.trim() || 'https://youtube.com',
      mvUrl: mvUrl.trim() || 'https://youtube.com',
      albumName: title.trim(),
      tracklist: tracks,
      description: description.trim() || 'Lanzamiento oficial de YM-ki Entertainment.'
    });

    setIsCreateModalOpen(false);
    setTitle('');
    setArtist('');
    setReleaseDate('');
    setThumbnail('');
    setDescription('');
    showToast('Lanzamiento programado exitosamente.');
  };

  // Filter releases by tab
  const filteredReleases = releases.filter((r) =>
    activeTab === 'released' ? r.isReleased : !r.isReleased
  );

  const handlePlayTrackAudio = (track: AlbumTrack, idx: number) => {
    if (playingTrackIndex === idx && isPlayingAudio) {
      musicEngine.pause();
      setIsPlayingAudio(false);
    } else {
      setPlayingTrackIndex(idx);
      setIsPlayingAudio(true);
      musicEngine.playTrack(
        track.title,
        track.trackNumber,
        undefined,
        () => setIsPlayingAudio(false)
      );
    }
  };

  const closeTracklistModal = () => {
    musicEngine.stop();
    setIsPlayingAudio(false);
    setPlayingTrackIndex(null);
    setViewingTracklistRelease(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Banner */}
      <div className="rounded-2xl p-6 sm:p-8 bg-slate-900 border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Lanzamientos & Estrenos Oficiales
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Hub de Comebacks & Novedades
          </h1>
          <p className="text-sm text-slate-300">
            Consulta los últimos MVs, trailers conceptuales, álbumes estrenados y lanzamientos programados para nuestros artistas y trainees.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm bg-indigo-600 hover:bg-indigo-500 shadow cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Crear Lanzamiento
          </button>
        )}
      </div>

      {/* Tabs: "Ya salió" vs "Aún no sale" */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('released')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer transition active:scale-95 ${
            activeTab === 'released'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Ya Salió ({releases.filter((r) => r.isReleased).length})
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer transition active:scale-95 ${
            activeTab === 'upcoming'
              ? 'bg-amber-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Aún No Sale ({releases.filter((r) => !r.isReleased).length})
        </button>
      </div>

      {/* Releases Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReleases.map((rel) => (
          <div
            key={rel.id}
            className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div>
              {/* Thumbnail */}
              <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                <img
                  src={rel.thumbnail}
                  alt={rel.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-extrabold text-white uppercase tracking-wider">
                  {rel.type.toUpperCase()}
                </div>

                <div
                  className={`absolute top-3 right-3 text-[11px] font-extrabold px-2.5 py-1 rounded-md ${
                    rel.isReleased
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  {rel.isReleased ? 'Disponible' : 'Próximamente'}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Estreno: {rel.releaseDate}</span>
                  <span>•</span>
                  <span className="font-bold text-white">{rel.artist}</span>
                </div>

                <h3 className="text-base font-extrabold text-white leading-snug">
                  {rel.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {rel.description}
                </p>
              </div>
            </div>

            {/* Actions for fans and artists */}
            <div className="p-5 pt-0 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {/* Ver Trailer */}
                <button
                  onClick={() => setViewingVideo({ title: `${rel.title} (Trailer)`, url: rel.trailerUrl || 'https://youtube.com', type: 'Trailer' })}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <Film className="w-3.5 h-3.5 text-pink-400" />
                  Ver Trailer
                </button>

                {/* Ver MV */}
                <button
                  onClick={() => setViewingVideo({ title: `${rel.title} (Official MV)`, url: rel.mvUrl || 'https://youtube.com', type: 'MV' })}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  Ver MV
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Visitar YouTube */}
                <a
                  href={rel.youtubeUrl || 'https://youtube.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 transition text-center cursor-pointer active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  YouTube
                </a>

                {/* Visitar TikTok: SOLO SI YA SALIÓ */}
                {rel.isReleased ? (
                  <a
                    href={rel.tiktokUrl || 'https://tiktok.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600/30 transition text-center cursor-pointer active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    TikTok
                  </a>
                ) : (
                  <div
                    title="TikTok disponible tras el estreno oficial"
                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-[11px] font-bold bg-slate-950 text-slate-600 border border-slate-800 cursor-not-allowed text-center"
                  >
                    TikTok (Bloqueado)
                  </div>
                )}
              </div>

              {/* Ver Álbum (Tracklist) */}
              <button
                onClick={() => setViewingTracklistRelease(rel)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer active:scale-95"
              >
                <ListMusic className="w-4 h-4" />
                Ver Álbum (Tracklist)
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredReleases.length === 0 && (
        <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-sm">
          No hay lanzamientos registrados en esta categoría.
        </div>
      )}

      {/* TRACKLIST & AUDIO PLAYER MODAL */}
      {viewingTracklistRelease && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={viewingTracklistRelease.thumbnail}
                  alt="cover"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-800"
                />
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    {viewingTracklistRelease.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {viewingTracklistRelease.artist} • Tracklist Oficial
                  </p>
                </div>
              </div>
              <button
                onClick={closeTracklistModal}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tracks List with Synthesized Audio Preview */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {(viewingTracklistRelease.tracklist || []).map((tr, idx) => {
                const isThisPlaying = playingTrackIndex === idx && isPlayingAudio;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between transition ${
                      isThisPlaying
                        ? 'border-indigo-500 bg-indigo-500/15'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold text-slate-500 w-5">
                        {String(tr.trackNumber).padStart(2, '0')}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white">{tr.title}</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {tr.duration}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePlayTrackAudio(tr, idx)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95 ${
                        isThisPlaying
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {isThisPlaying ? (
                        <>
                          <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          Escuchar
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={closeTracklistModal}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
              >
                Cerrar Tracklist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO PREVIEW MODAL */}
      {viewingVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400" />
                {viewingVideo.title}
              </h3>
              <button
                onClick={() => setViewingVideo(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black rounded-xl overflow-hidden flex flex-col items-center justify-center p-6 text-center space-y-3 border border-slate-800">
              <Play className="w-12 h-12 text-indigo-400 animate-pulse" />
              <p className="text-sm font-bold text-white">Reproductor Cinemático Oficial</p>
              <p className="text-xs text-slate-400 max-w-md">
                Transmisión directa desde los servidores oficiales de YM-ki Media Network.
              </p>
              <a
                href={viewingVideo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer active:scale-95"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir en YouTube Oficial
              </a>
            </div>
          </div>
        </div>
      )}

      {/* CREATE RELEASE MODAL (Admins Only) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-500" />
                Crear Nuevo Lanzamiento Oficial
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Título del Lanzamiento</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. ECLIPSE (Official MV)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Artista / Grupo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. YM-ki All Stars"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Fecha de Lanzamiento</label>
                  <input
                    type="date"
                    required
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Formato / Tipo</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                  >
                    <option value="mv">Video Musical (MV)</option>
                    <option value="trailer">Trailer / Teaser</option>
                    <option value="single">Single Álbum</option>
                    <option value="mini">Mini Álbum</option>
                    <option value="full">Full Álbum</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Miniatura / Portada</label>
                  <FileUploadButton
                    onUploadSuccess={(url) => setThumbnail(url)}
                    label="Subir Imagen"
                  />
                </div>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/ o sube tu imagen..."
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Link YouTube</label>
                  <input
                    type="text"
                    placeholder="https://youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Link TikTok (Solo activo tras salida)</label>
                  <input
                    type="text"
                    placeholder="https://tiktok.com/@ymki/..."
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                  />
                </div>
              </div>

              {/* Tracklist Builder */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                  Tracklist del Álbum / Lanzamiento ({tracks.length} canciones)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Título de la canción..."
                    value={newTrackTitle}
                    onChange={(e) => setNewTrackTitle(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddTrack}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer active:scale-95"
                  >
                    Añadir Track
                  </button>
                </div>

                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {tracks.map((tr, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 text-xs text-slate-300">
                      <span>{i + 1}. {tr.title}</span>
                      <button
                        type="button"
                        onClick={() => setTracks(tracks.filter((_, idx) => idx !== i))}
                        className="text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Descripción / Concepto</label>
                <textarea
                  rows={2}
                  placeholder="Detalles del concepto estético, equipo de producción..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow cursor-pointer active:scale-95"
                >
                  Guardar Lanzamiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
