import React, { useState } from 'react';
import { X, UserCheck, Save, Sparkles, CheckCircle2, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CeoInfo } from '../types';

interface CeoProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CeoProfileEditModal: React.FC<CeoProfileEditModalProps> = ({
  isOpen,
  onClose
}) => {
  const { ceosList, updateCeoProfile, currentUser, userProfile, showToast } = useApp();

  // Find or create CEO record for this admin
  const currentCeo =
    ceosList.find((c) => c.username === currentUser || c.name.toLowerCase().includes(currentUser?.toLowerCase() || '')) ||
    ceosList[0];

  const [title, setTitle] = useState(currentCeo.title);
  const [specialty, setSpecialty] = useState(currentCeo.specialty);
  const [motto, setMotto] = useState(currentCeo.motto);
  const [bio, setBio] = useState(currentCeo.bio);
  const [criteria, setCriteria] = useState<string[]>(currentCeo.criteria || []);
  const [newCriterion, setNewCriterion] = useState('');

  if (!isOpen) return null;

  const handleAddCriterion = () => {
    if (!newCriterion.trim()) return;
    setCriteria([...criteria, newCriterion.trim()]);
    setNewCriterion('');
  };

  const handleRemoveCriterion = (idx: number) => {
    setCriteria(criteria.filter((_, i) => i !== idx));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCeoProfile(currentCeo.id, {
      title: title.trim(),
      specialty: specialty.trim(),
      motto: motto.trim(),
      bio: bio.trim(),
      criteria
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Editar Ficha de CEO Evaluador</h3>
              <p className="text-xs text-slate-400">
                Información mostrada a los aspirantes al seleccionar evaluador en Audiciones.
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

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Cargo / Título Directivo:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              placeholder="Ej: Director Artístico & Productor Jefe"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Especialidad Principal:
            </label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              placeholder="Ej: Voz, Rap, Performance, Coreografía..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Lema Inspiracional:
            </label>
            <input
              type="text"
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white italic"
              placeholder="Frase inspiracional que verán los aspirantes..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Biografía & Trayectoria:
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white min-h-[70px]"
              placeholder="Tu visión artística y lo que buscas en un aspirante..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Criterios de Evaluación Prioritarios:
            </label>
            <div className="space-y-1.5 mb-2">
              {criteria.map((cr, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-slate-800/60 rounded-xl text-xs text-slate-200 border border-slate-700/60"
                >
                  <span className="truncate pr-2">✓ {cr}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCriterion(idx)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newCriterion}
                onChange={(e) => setNewCriterion(e.target.value)}
                placeholder="Añadir nuevo criterio (ej: Control vocal dinámico)..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
              />
              <button
                type="button"
                onClick={handleAddCriterion}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Guardar Ficha de CEO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
