import React, { useState } from 'react';
import {
  Mic,
  Music,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  UserCheck,
  X,
  Send,
  Upload,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CeoInfo, AuditionSubmission } from '../types';

interface AuditionsSectionProps {
  onSelectAuditionToReview?: (aud: AuditionSubmission) => void;
}

export const AuditionsSection: React.FC<AuditionsSectionProps> = ({
  onSelectAuditionToReview
}) => {
  const {
    userProfile,
    auditions,
    submitAudition,
    ceosList,
    allProfiles,
    themeBannerGradient,
    themeGradient,
    primaryButtonColor,
    showToast
  } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [modalidad, setModalidad] = useState<'vocal-rap' | 'bailarin' | 'staff' | 'mixta'>('vocal-rap');
  const [pseudonym, setPseudonym] = useState('');

  // ONLY USERS WITH ADMIN PERMISSIONS APPEAR IN CEO SELECTION AS REQUESTED!
  const adminCeos = ceosList.filter((c) => {
    const prof = allProfiles[c.username];
    if (prof && prof.accountType === 'admin') return true;
    if (c.id === 'ceo-miki') return true;
    return false;
  });

  const [selectedCeo, setSelectedCeo] = useState<CeoInfo>(
    adminCeos[0] || ceosList[0]
  );

  const [inspectingCeo, setInspectingCeo] = useState<CeoInfo | null>(null);
  const [confirmedCeoInModal, setConfirmedCeoInModal] = useState<boolean>(false);

  const [uploadedFileNames, setUploadedFileNames] = useState<string[]>([]);
  const [danceStyle, setDanceStyle] = useState('');
  const [staffArea, setStaffArea] = useState('Producción');
  const [staffExp, setStaffExp] = useState('');

  const calcAge = (dobString?: string) => {
    if (!dobString) return null;
    const d = new Date(dobString);
    if (isNaN(d.getTime())) return null;
    const t = new Date();
    let age = t.getFullYear() - d.getFullYear();
    if (t < new Date(t.getFullYear(), d.getMonth(), d.getDate())) age--;
    return age;
  };

  const handleOpenCeoDetails = (ceo: CeoInfo) => {
    setInspectingCeo(ceo);
    setConfirmedCeoInModal(selectedCeo.id === ceo.id);
  };

  const handleConfirmCeoSelection = () => {
    if (!inspectingCeo) return;
    if (confirmedCeoInModal) {
      setSelectedCeo(inspectingCeo);
      showToast(`Has seleccionado a ${inspectingCeo.name} como tu evaluador oficial.`);
      setInspectingCeo(null);
    } else {
      showToast('Por favor marca la casilla de confirmación para seleccionar a este CEO.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setUploadedFileNames(files.map((f) => f.name));
  };

  const handleSubmitAuditionForm = (e: React.FormEvent) => {
    e.preventDefault();

    const age = calcAge(userProfile.dob);
    if (age !== null && age < 8) {
      showToast('Debes tener al menos 8 años cumplidos para audicionar en YM-ki.');
      return;
    }

    if (uploadedFileNames.length === 0) {
      showToast('Adjunta al menos un archivo o video para tu audición.');
      return;
    }

    const modalidadLabels = {
      'vocal-rap': 'Vocal / Rap',
      bailarin: 'Bailarín',
      staff: 'Staff Técnico',
      mixta: 'Mixta (Canto + Baile)'
    };

    submitAudition({
      modalidad: modalidadLabels[modalidad],
      pseudonym: pseudonym.trim() || undefined,
      ceoId: selectedCeo.id,
      ceoName: selectedCeo.name,
      files: uploadedFileNames
    });

    setIsFormOpen(false);
    setUploadedFileNames([]);
    setPseudonym('');
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-12 animate-fadeIn">
      {/* Hero Card with dynamic theme banner gradient */}
      <div
        style={{ background: themeBannerGradient }}
        className="relative rounded-3xl overflow-hidden border border-white/20 p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 theme-banner transition-all duration-300"
      >
        <div className="space-y-3 max-w-xl text-white">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30 backdrop-blur-sm">
            <Mic className="w-3.5 h-3.5" /> Centro Oficial de Audiciones YM-ki
          </div>
          <h2 className="text-3xl font-extrabold text-white drop-shadow">
            Tu Talento Merece Ser Escuchado
          </h2>
          <p className="text-sm text-white/90 leading-relaxed drop-shadow-sm">
            Postúlate directamente ante los directores administradores de YM-ki Entertainment. Elige al CEO que
            evaluará tu material en cualquiera de las 4 modalidades artísticas.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          style={{ color: '#000000' }}
          className="px-6 py-3 bg-white hover:bg-slate-100 text-black font-extrabold rounded-2xl shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <Send className="w-4 h-4 text-black" /> Postularse Ahora
        </button>
      </div>

      {/* Rules */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" /> Normas y Requisitos Oficiales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">Edad Mínima:</strong>
              <span className="text-slate-400">Todo aspirante debe tener al menos 8 años cumplidos.</span>
            </div>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">Duración Vocal/Rap:</strong>
              <span className="text-slate-400">Máximo 4 minutos en total (+10s de tolerancia).</span>
            </div>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">100% Auténtico:</strong>
              <span className="text-slate-400">Sin playback sobrepuesto ni edición distorsiva.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audition Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-white max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" /> Formulario de Audición YM-ki
                </h3>
                <p className="text-xs text-slate-400">
                  Solo los usuarios con permisos de administrador son CEOs evaluadores disponibles.
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAuditionForm} className="flex flex-col gap-4">
              {/* CEO SELECTION: ONLY USERS WITH ADMIN ROLE */}
              <div className="p-4 bg-slate-800/70 border border-indigo-500/30 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                      CEO Evaluador Asignado:
                    </label>
                    <span className="text-sm font-extrabold text-white">
                      {selectedCeo.name} — <span className="text-slate-400 font-normal text-xs">{selectedCeo.title}</span>
                    </span>
                  </div>
                  <span className="text-[11px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-semibold">
                    Confirmado ✓
                  </span>
                </div>

                <div className="text-xs text-slate-400">
                  Haz clic en un CEO para ver su descripción detallada, criterios y confirmar tu elección:
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {adminCeos.map((ceo) => {
                    const isSelected = selectedCeo.id === ceo.id;
                    return (
                      <div
                        key={ceo.id}
                        onClick={() => handleOpenCeoDetails(ceo)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition flex flex-col items-center text-center gap-1.5 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-600/20 shadow-md ring-1 ring-indigo-500'
                            : 'border-slate-700 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <img
                          src={ceo.avatar}
                          alt={ceo.name}
                          className="w-12 h-12 rounded-full object-cover border border-slate-600"
                        />
                        <div>
                          <h5 className="text-xs font-bold text-white">{ceo.name}</h5>
                          <span className="text-[10px] text-slate-400 block line-clamp-1">
                            {ceo.specialty.split(',')[0]}
                          </span>
                        </div>
                        <span className="text-[10px] text-indigo-400 font-medium hover:underline">
                          Ver ficha & confirmar
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modality selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Modalidad de Audición:
                </label>
                <select
                  value={modalidad}
                  onChange={(e) => setModalidad(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="vocal-rap">Vocal / Rap</option>
                  <option value="bailarin">Bailarín</option>
                  <option value="staff">Staff Técnico / Producción</option>
                  <option value="mixta">Mixta (Canto + Baile)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Seudónimo o Nombre Artístico (opcional):
                </label>
                <input
                  type="text"
                  value={pseudonym}
                  onChange={(e) => setPseudonym(e.target.value)}
                  placeholder="Ej: LunarEcho, StarVoice"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              {modalidad === 'bailarin' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Estilo de Baile:
                  </label>
                  <input
                    type="text"
                    value={danceStyle}
                    onChange={(e) => setDanceStyle(e.target.value)}
                    placeholder="Ej: Urban Choreography, Contemporary, K-pop..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
              )}

              {modalidad === 'staff' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Área de Especialidad:
                    </label>
                    <select
                      value={staffArea}
                      onChange={(e) => setStaffArea(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    >
                      <option>Producción Musical</option>
                      <option>Diseño Gráfico & Concept Art</option>
                      <option>Edición & Color Grading de Video</option>
                      <option>Maquillaje, Estilismo & A&R</option>
                      <option>Community Manager & Estrategia Fandom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Experiencia y Motivación:
                    </label>
                    <textarea
                      value={staffExp}
                      onChange={(e) => setStaffExp(e.target.value)}
                      placeholder="Cuéntanos proyectos previos, herramientas que dominas..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white min-h-[60px]"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Archivos de Audio o Video (máximo 4 min en total):
                </label>
                <div className="p-4 bg-slate-800/60 border border-dashed border-slate-700 rounded-xl text-center flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-slate-400" />
                  <label className="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition">
                    Seleccionar Archivos
                    <input
                      type="file"
                      accept="audio/*,video/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {uploadedFileNames.length > 0 ? (
                    <div className="text-xs text-emerald-400 font-medium mt-1">
                      {uploadedFileNames.length} archivo(s): {uploadedFileNames.join(', ')}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      Formatos MP3, WAV, MP4 o MOV.
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ background: themeGradient }}
                  className="theme-btn flex-1 py-2.5 text-white font-bold rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Enviar Postulación al {selectedCeo.name}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CEO DETAIL & CONFIRMATION MODAL */}
      {inspectingCeo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setInspectingCeo(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <img
                src={inspectingCeo.avatar}
                alt={inspectingCeo.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-lg"
              />
              <div>
                <h3 className="text-xl font-bold text-white">{inspectingCeo.name}</h3>
                <p className="text-xs text-indigo-400 font-semibold">{inspectingCeo.title}</p>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Especialidad: {inspectingCeo.specialty}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border-l-4 border-indigo-500 text-xs italic text-slate-300">
              "{inspectingCeo.motto}"
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Trayectoria & Visión Artística:
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {inspectingCeo.bio}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Criterios de Evaluación Prioritarios:
              </h4>
              <ul className="space-y-1 text-xs text-slate-300">
                {inspectingCeo.criteria.map((cr, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>{cr}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-indigo-950/40 border border-indigo-500/40 rounded-xl flex items-center gap-3">
              <input
                type="checkbox"
                id="confirm-ceo-check"
                checked={confirmedCeoInModal}
                onChange={(e) => setConfirmedCeoInModal(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-800 cursor-pointer"
              />
              <label
                htmlFor="confirm-ceo-check"
                className="text-xs text-white font-semibold cursor-pointer select-none"
              >
                Confirmar a {inspectingCeo.name} como mi evaluador oficial para mi audición.
              </label>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setInspectingCeo(null)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleConfirmCeoSelection}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
              >
                Aplicar y Seleccionar CEO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSIONS HISTORY WITH "CALIFICADO" O "SIN CALIFICAR" LEGEND */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-400" /> Mis Audiciones Enviadas
        </h3>
        <p className="text-xs text-slate-400">
          Haz clic sobre cualquier audición para abrir la ventana con su detalle y resolución oficial.
        </p>

        {auditions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs bg-slate-800/40 rounded-xl border border-slate-800">
            Aún no has enviado ninguna audición. ¡Haz clic en "Postularse Ahora" para dar el paso!
          </div>
        ) : (
          <div className="space-y-3">
            {auditions.map((aud) => (
              <div
                key={aud.id}
                onClick={() => onSelectAuditionToReview && onSelectAuditionToReview(aud)}
                className="p-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 rounded-2xl cursor-pointer transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm group-hover:text-indigo-300 transition">
                      Modalidad: {aud.modalidad}
                    </span>
                    {aud.pseudonym && (
                      <span className="text-[11px] text-indigo-300">
                        (Seudónimo: {aud.pseudonym})
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400 block mt-0.5">
                    Evaluado por: <strong className="text-indigo-400">{aud.ceoName}</strong> ·{' '}
                    {new Date(aud.date).toLocaleDateString('es-MX')} · {aud.files.length} archivo(s)
                  </span>
                </div>

                {/* LEGEND: "CALIFICADO" O "SIN CALIFICAR" COMO SE SOLICITÓ */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                      aud.evaluated
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    }`}
                  >
                    {aud.evaluated ? 'Calificado' : 'Sin calificar'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
