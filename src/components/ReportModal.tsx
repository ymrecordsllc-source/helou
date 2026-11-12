import React, { useState } from 'react';
import {
  ShieldAlert,
  X,
  AlertTriangle,
  Upload,
  Link,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ReportItemType, ReportMotive } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUsername?: string;
  itemType: ReportItemType;
  itemId: string;
  itemTitle?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetUsername,
  itemType,
  itemId,
  itemTitle
}) => {
  const { currentUser, showToast } = useApp();

  const [motive, setMotive] = useState<ReportMotive>('acoso');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      showToast('Por favor describe lo ocurrido detalladamente.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/security/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterUsername: currentUser,
          reportedTargetUsername: targetUsername || 'anónimo/contenido',
          reportedItemType: itemType,
          reportedItemId: itemId,
          reportedItemTitle: itemTitle || `${itemType} #${itemId}`,
          motive,
          description: description.trim(),
          evidenceUrls: evidenceUrl ? [evidenceUrl.trim()] : [],
          screenshotUrl: evidenceUrl.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar reporte.');
      }

      setIsSuccess(true);
      showToast('Reporte enviado confidencialmente al equipo de moderación.');
      setTimeout(() => {
        setIsSuccess(false);
        setDescription('');
        setEvidenceUrl('');
        onClose();
      }, 1500);
    } catch (err: any) {
      showToast(err.message || 'No se pudo enviar el reporte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-rose-400">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <h3 className="text-base font-bold text-white">Denunciar Contenido o Usuario</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Reporte Registrado</h4>
            <p className="text-xs text-slate-300 max-w-sm">
              Tu denuncia ha sido radicada de forma 100% privada y confidencial. Los moderadores
              analizarán el caso y aplicarán las medidas disciplinarias correspondientes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
            {/* Target Reference Info */}
            <div className="p-3 bg-slate-800/60 border border-slate-700 rounded-2xl flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Elemento denunciado:
              </span>
              <p className="font-semibold text-slate-200">
                Tipo: <span className="text-indigo-400 uppercase">{itemType}</span>{' '}
                {targetUsername && (
                  <span>
                    • Usuario: <span className="text-amber-300">@{targetUsername}</span>
                  </span>
                )}
              </p>
              {itemTitle && (
                <p className="text-slate-400 text-[11px] truncate">
                  Referencia: {itemTitle}
                </p>
              )}
            </div>

            {/* Motive Selection */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Motivo del Reporte <span className="text-rose-400">*</span>
              </label>
              <select
                value={motive}
                onChange={(e) => setMotive(e.target.value as ReportMotive)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-rose-500"
              >
                <option value="acoso">Acoso o intimidación</option>
                <option value="suplantacion">Suplantación de identidad</option>
                <option value="spam">Spam / Publicidad no deseada</option>
                <option value="contenido_inapropiado">Contenido inapropiado u ofensivo</option>
                <option value="fraude">Fraude o engaño económico</option>
                <option value="manipulacion_votos">Manipulación de votaciones / Survival</option>
                <option value="uso_indebido">Uso indebido de la plataforma</option>
                <option value="incumplimiento_reglas">Incumplimiento de reglas oficiales</option>
                <option value="otro">Otro motivo</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Descripción detallada de lo ocurrido <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Explica con claridad los hechos, fechas aproximadas o contexto relevante..."
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            {/* Evidence URL / Screenshot */}
            <div>
              <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-indigo-400" /> Enlace de Evidencias o Captura (Opcional)
              </label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://... enlace a imagen, captura o drive"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Privacy notice */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2 text-[11px] text-amber-200/90">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Confidencialidad garantizada:</strong> Tu nombre de usuario nunca será
                revelado a la persona o autor del contenido denunciado.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold transition shadow-lg shadow-rose-900/30 flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Denuncia'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
