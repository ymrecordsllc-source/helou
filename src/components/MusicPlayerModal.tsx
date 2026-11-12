import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  X,
  Music,
  Disc,
  Clock,
  Sparkles
} from 'lucide-react';
import { UserAlbum, AlbumTrack } from '../types';
import { musicEngine } from '../utils/audioPlayer';

interface MusicPlayerModalProps {
  album: UserAlbum | null;
  onClose: () => void;
}

export const MusicPlayerModal: React.FC<MusicPlayerModalProps> = ({ album, onClose }) => {
  if (!album) return null;

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);

  const tracks = album.tracks || [];
  const currentTrack = tracks[currentTrackIndex] || {
    trackNumber: 1,
    title: 'Pista Principal',
    duration: '3:20'
  };

  useEffect(() => {
    // Start playing first track on open
    startTrack(0);
    return () => {
      musicEngine.stop();
    };
  }, [album]);

  const startTrack = (idx: number) => {
    const tr = tracks[idx];
    if (!tr) return;
    setCurrentTrackIndex(idx);
    setIsPlaying(true);
    setCurrentTimeSec(0);

    musicEngine.playTrack(
      tr.title,
      tr.trackNumber,
      (sec) => setCurrentTimeSec(sec),
      () => handleNext()
    );
  };

  const togglePlay = () => {
    if (isPlaying) {
      musicEngine.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      musicEngine.playTrack(
        currentTrack.title,
        currentTrack.trackNumber,
        (sec) => setCurrentTimeSec(sec),
        () => handleNext()
      );
    }
  };

  const handleNext = () => {
    if (tracks.length === 0) return;
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    startTrack(nextIdx);
  };

  const handlePrev = () => {
    if (tracks.length === 0) return;
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    startTrack(prevIdx);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-fadeIn relative">
        <button
          onClick={() => {
            musicEngine.stop();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cover & Disc Animation */}
        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <img
              src={album.coverImage}
              alt={album.albumName}
              className="w-full h-full object-cover"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Disc className="w-16 h-16 text-indigo-400 animate-spin opacity-80" />
              </div>
            )}
          </div>

          <div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 mb-1">
              {album.albumType.toUpperCase()} ÁLBUM
            </div>
            <h3 className="text-lg font-extrabold text-white">
              {currentTrack.title}
            </h3>
            <p className="text-xs text-slate-400">
              {album.albumName} • {album.associatedArtists?.join(', ') || 'YM-ki Artistas'}
            </p>
          </div>
        </div>

        {/* Progress & Timing */}
        <div className="space-y-1">
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              style={{ width: `${Math.min(100, (currentTimeSec / 180) * 100)}%` }}
              className="bg-indigo-500 h-full transition-all duration-300"
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{formatTime(currentTimeSec)}</span>
            <span>{currentTrack.duration || '3:00'}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handlePrev}
            className="p-3 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 cursor-pointer active:scale-95 transition"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg cursor-pointer active:scale-95 transition"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>

          <button
            onClick={handleNext}
            className="p-3 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 cursor-pointer active:scale-95 transition"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Tracklist selection */}
        <div className="space-y-1 max-h-40 overflow-y-auto border-t border-slate-800 pt-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Lista de Canciones ({tracks.length})
          </p>
          {tracks.map((tr, i) => {
            const isSelected = currentTrackIndex === i;
            return (
              <div
                key={i}
                onClick={() => startTrack(i)}
                className={`p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer transition ${
                  isSelected
                    ? 'bg-indigo-600/20 text-white font-bold border border-indigo-500/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 text-center">{i + 1}</span>
                  <span className="truncate">{tr.title}</span>
                </div>
                <span>{tr.duration}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
