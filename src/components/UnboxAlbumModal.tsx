import React, { useState } from 'react';
import { Sparkles, X, Check, Star, Award, RotateCw, Eye } from 'lucide-react';
import { Photocard } from '../types';
import { Photocard3DViewer } from './Photocard3DViewer';

interface UnboxAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  albumName: string;
  photocards?: Photocard[];
  cards?: Photocard[];
  onGoToMerch?: () => void;
}

export const UnboxAlbumModal: React.FC<UnboxAlbumModalProps> = ({
  isOpen,
  onClose,
  albumName,
  photocards,
  cards,
  onGoToMerch
}) => {
  const cardsList = (photocards && photocards.length > 0) ? photocards : (cards || []);
  const [selected3DCardIndex, setSelected3DCardIndex] = useState<number | null>(null);

  if (!isOpen || cardsList.length === 0) return null;

  const active3DCard = selected3DCardIndex !== null ? cardsList[selected3DCardIndex] : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-fadeIn relative my-auto max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-4 h-4 animate-spin" />
            ¡Unboxing Completado!
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Has abierto: {albumName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            ¡Felicidades! Se han revelado tus photocards coleccionables oficiales en 3D con reverso interactivo.
          </p>
        </div>

        {/* Interactive 3D Mode or Cards Grid */}
        {active3DCard ? (
          <div className="space-y-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 animate-spin" /> Vista 3D Oficial con Reverso
              </span>
              <button
                type="button"
                onClick={() => setSelected3DCardIndex(null)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
              >
                Volver a la galería
              </button>
            </div>

            <Photocard3DViewer
              photocard={active3DCard}
              showControls={true}
              showDetails={true}
              finishEffect={active3DCard.finishEffect || (active3DCard.isHolographic ? 'holographic' : 'neutral')}
            />

            {/* If more than 1 card, allow switching cards while in 3D */}
            {cardsList.length > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                {cardsList.map((c, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelected3DCardIndex(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selected3DCardIndex === idx
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Card {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={`grid gap-4 ${cardsList.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : cardsList.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {cardsList.map((card, i) => {
              const isPreorder = card.isPreorderBenefit || card.rarity === 'preventa_exclusiva';
              const isUltra = card.rarity === 'ultra_rara';
              return (
                <div
                  key={i}
                  className="bg-slate-950 rounded-2xl border border-slate-800 p-2.5 flex flex-col justify-between shadow-lg relative group transition hover:border-indigo-500/60"
                >
                  {/* Rarity & Preorder Badges */}
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 items-start">
                    {isPreorder && (
                      <span className="bg-pink-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow">
                        PREVENTA
                      </span>
                    )}
                    {isUltra && (
                      <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded shadow">
                        ULTRA RARA
                      </span>
                    )}
                  </div>

                  <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                    <img
                      src={card.image}
                      alt={card.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>

                  <div className="mt-2.5 text-center space-y-1">
                    <p className="text-xs font-bold text-white truncate">{card.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{card.artist} • {card.rarity.replace('_', ' ')}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelected3DCardIndex(i)}
                    className="mt-2 w-full py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-300 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Ver en 3D (Reverso)
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer active:scale-95"
          >
            Aceptar
          </button>
          {onGoToMerch && (
            <button
              onClick={() => {
                onClose();
                onGoToMerch();
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow cursor-pointer active:scale-95"
            >
              Ver en Mi Vitrina de Merch
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
