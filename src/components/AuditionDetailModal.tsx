import React, { useState } from 'react';
import {
  X,
  Mic,
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuditionSubmission } from '../types';

interface AuditionDetailModalProps {
  audition: AuditionSubmission | null;
  onClose: () => void;
  onReaudition?: () => void;
}

export const AuditionDetailModal: React.FC<AuditionDetailModalProps> = ({
  audition,
  onClose,
  onReaudition
}) => {
  const {
    currentUser,
    userProfile,
    evaluateAudition,
    ceosList
  } = useApp();

  const [evaluatorFeedback, setEvaluatorFeedback] = useState('');

  if (!audition) return null;

  // Check if current user is the evaluator CEO for this audition
  const ceoRecord = ceosList.find((c) => c.id === audition.ceoId);
  const isEvaluator =
    userProfile.accountType === 'admin' ||
    ceoRecord?.username === currentUser ||
    audition.ceoName.toLowerCase().includes(currentUser?.toLowerCase() || '');

  const isStaffAudition = audition.modalidad.toLowerCase().includes('staff');
  const isEvaluated = audition.evaluated;

  const handleEvaluate = (result: 'trainee' | 'artista' | 'rejected' | 'accepted_staff') => {
    evaluateAudition(audition.id, result, evaluatorFeedback.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Detalle de Audición #{audition.id}</h3>
              <p className="text-xs text-slate-400">
                Postulante: @{audition.applicantUsername} · Modalidad: {audition.modalidad}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audition Details Header */}
        <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Estado de Evaluación:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isEvaluated
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {isEvaluated ? 'Calificado' : 'Sin calificar'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">CEO Evaluador:</span>
            <span className="font-bold text-white">{audition.ceoName}</span>
          </div>

          {audition.pseudonym && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Seudónimo:</span>
              <span className="font-semibold text-indigo-300">{audition.pseudonym}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Fecha de Envío:</span>
            <span className="text-slate-300">
              {new Date(audition.date).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Archivos Adjuntos ({audition.files.length}):</span>
            <div className="flex flex-wrap gap-1">
              {audition.files.map((f, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[11px] text-slate-300 flex items-center gap-1"
                >
                  <FileText className="w-3 h-3 text-indigo-400" /> {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RESULT PRESENTATION (If already evaluated) */}
        {isEvaluated && (
          <div className="p-4 rounded-2xl border text-xs space-y-2 bg-slate-800/80 border-slate-700">
            <h4 className="font-bold text-sm flex items-center gap-2">
              {audition.result === 'trainee' && (
                <span className="text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" /> ¡Aceptado como Trainee Oficial!
                </span>
              )}
              {audition.result === 'artista' && (
                <span className="text-pink-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-pink-400" /> ¡Aprobado con honores como Artista Oficial!
                </span>
              )}
              {audition.result === 'accepted_staff' && (
                <span className="text-cyan-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" /> ¡Aceptado como Staff de Gestión!
                </span>
              )}
              {audition.result === 'rejected' && (
                <span className="text-red-400 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-red-400" /> Audición No Superada
                </span>
              )}
            </h4>

            {/* User message based on result */}
            {audition.result === 'trainee' && (
              <p className="text-slate-300 leading-relaxed">
                ¡Felicidades! Has sido aceptado como <strong>Trainee</strong> de YM-ki Entertainment.
                Tu cuenta ha cambiado al modo Trainee y se ha habilitado tu acceso a la <strong>ID-Card</strong> oficial y tareas de entrenamiento.
              </p>
            )}

            {audition.result === 'artista' && (
              <p className="text-slate-300 leading-relaxed">
                ¡Increíble desempeño! Has sido promovido directamente a <strong>Artista Oficial</strong>.
                Tu cuenta ha cambiado a modo Artista, con tu insignia de micrófono verificada y acceso completo a tu club de fans.
              </p>
            )}

            {audition.result === 'accepted_staff' && (
              <p className="text-slate-300 leading-relaxed">
                Tu postulación para <strong>Staff de Producción</strong> ha sido aprobada. Bienvenido al equipo técnico de YM-ki Entertainment.
              </p>
            )}

            {audition.result === 'rejected' && (
              <div className="space-y-3 pt-1">
                <p className="text-slate-400">
                  En esta ocasión tu material no alcanzó la calificación requerida por la mesa directiva. Te animamos a pulir tu técnica y postularte nuevamente.
                </p>
                {onReaudition && (
                  <button
                    onClick={() => {
                      onClose();
                      onReaudition();
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Volver a Audicionar
                  </button>
                )}
              </div>
            )}

            {audition.evaluatorNote && (
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700 text-slate-300 mt-2">
                <strong className="text-indigo-400 block text-[10px] uppercase">Nota del Evaluador:</strong>
                <p className="text-xs mt-0.5">{audition.evaluatorNote}</p>
              </div>
            )}
          </div>
        )}

        {/* CEO EVALUATION CONTROLS (If current user is Evaluator & audition is un-evaluated) */}
        {!isEvaluated && isEvaluator && (
          <div className="p-4 bg-indigo-950/40 border border-indigo-500/40 rounded-2xl space-y-3 text-xs">
            <h4 className="font-bold text-indigo-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-indigo-400" /> Panel de Decisión del CEO
            </h4>
            <p className="text-slate-300 text-[11px]">
              Evalúa el material del aspirante. La decisión actualizará inmediatamente el rol y estado de cuenta del usuario:
            </p>

            <textarea
              value={evaluatorFeedback}
              onChange={(e) => setEvaluatorFeedback(e.target.value)}
              placeholder="Comentarios o feedback para el aspirante (opcional)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white min-h-[60px]"
            />

            {/* Options according to prompt requirements:
                If staff: 'aceptar', 'rechazar'
                If artistic: 'aceptar como trainee', 'rechazar', 'aceptar como artista' */}
            {isStaffAudition ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleEvaluate('accepted_staff')}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Aceptar como Staff
                </button>
                <button
                  type="button"
                  onClick={() => handleEvaluate('rejected')}
                  className="py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" /> Rechazar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleEvaluate('trainee')}
                  className="py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-[11px] transition shadow flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Aceptar como Trainee
                </button>
                <button
                  type="button"
                  onClick={() => handleEvaluate('artista')}
                  className="py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-[11px] transition shadow flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Aceptar como Artista
                </button>
                <button
                  type="button"
                  onClick={() => handleEvaluate('rejected')}
                  className="py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-[11px] transition shadow flex items-center justify-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" /> Rechazar
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
