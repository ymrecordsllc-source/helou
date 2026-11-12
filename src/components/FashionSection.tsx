import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  BookOpen,
  Heart,
  Layers,
  X,
  ShoppingBag,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Palette,
  Camera,
  UserCheck,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Magazine, Product } from '../types';
import { FileUploadButton } from './FileUploadButton';

const SOLID_PALETTES = [
  { name: 'Carmín Editorial', color: '#e11d48' },
  { name: 'Azul Real Eléctrico', color: '#2563eb' },
  { name: 'Esmeralda Runway', color: '#059669' },
  { name: 'Púrpura Alta Costura', color: '#7c3aed' },
  { name: 'Ámbar Urbano', color: '#d97706' },
  { name: 'Rosa Neón', color: '#db2777' },
  { name: 'Negro Obsidiana', color: '#0f172a' }
];

interface FashionSectionProps {
  onGoToStoreProduct?: (productId: string) => void;
  onOpenUserProfile?: (username: string) => void;
}

export const FashionSection: React.FC<FashionSectionProps> = ({
  onGoToStoreProduct,
  onOpenUserProfile
}) => {
  const {
    userProfile,
    canCreateMagazine,
    magazines,
    createMagazine,
    likeMagazine,
    deleteMagazine,
    products,
    buyProduct,
    showToast
  } = useApp();

  // Create Magazine Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'editorial_minimal' | 'streetwear_pop'>('editorial_minimal');
  const [themeColor, setThemeColor] = useState('#e11d48');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [issueNumber, setIssueNumber] = useState('Vol. 01');
  const [modelName, setModelName] = useState('');
  const [modelImage, setModelImage] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [editorialNotes, setEditorialNotes] = useState('');
  const [photoshoots, setPhotoshoots] = useState<string[]>([]);
  const [newShootUrl, setNewShootUrl] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Reader Modal
  const [readingMagazine, setReadingMagazine] = useState<Magazine | null>(null);
  const [readerPage, setReaderPage] = useState<number>(0);

  const canCreate = canCreateMagazine();

  // Available fashion products for promotion
  const fashionProducts = products.filter((p) => !p.isOutlet);

  const handleAddPhotoshoot = () => {
    if (!newShootUrl.trim()) return;
    if (photoshoots.length >= 6) {
      showToast('Máximo 6 fotos para la sesión fotográfica.');
      return;
    }
    setPhotoshoots([...photoshoots, newShootUrl.trim()]);
    setNewShootUrl('');
  };

  const handleToggleProduct = (prodId: string) => {
    if (selectedProductIds.includes(prodId)) {
      setSelectedProductIds(selectedProductIds.filter((id) => id !== prodId));
    } else {
      if (selectedProductIds.length >= 2) {
        showToast('Máximo 2 productos de la tienda para promocionar.');
        return;
      }
      setSelectedProductIds([...selectedProductIds, prodId]);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Ingresa un título para la revista.');
      return;
    }
    if (!coverImage.trim()) {
      showToast('Proporciona una imagen para la portada.');
      return;
    }

    createMagazine({
      title: title.trim(),
      subtitle: subtitle.trim() || 'Edición Oficial YM-ki Fashion',
      issueNumber: issueNumber.trim() || 'Edición Especial',
      template: selectedTemplate,
      themeColor,
      modelFaceClaimName: modelName.trim() || 'Top Model YM-ki',
      modelFaceClaimImage: modelImage.trim() || coverImage.trim(),
      coverImage: coverImage.trim(),
      photoshoots: photoshoots.length > 0 ? photoshoots : [coverImage.trim()],
      promotedProductIds: selectedProductIds,
      editorialNotes: editorialNotes.trim() || 'Sesión fotográfica exclusiva para YM-ki Fashion.',
      createdBy: userProfile.username,
      authorRole: userProfile.accountType === 'admin' ? 'admin' : 'diseñador'
    });

    // Reset
    setIsCreateModalOpen(false);
    setTitle('');
    setSubtitle('');
    setModelName('');
    setModelImage('');
    setCoverImage('');
    setEditorialNotes('');
    setPhotoshoots([]);
    setSelectedProductIds([]);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner - 100% Solid Color, No Gradients */}
      <div className="rounded-2xl p-6 sm:p-8 bg-slate-900 border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-pink-500/10 text-pink-500 border border-pink-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            YM-ki Fashion & Alta Costura
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Revistas, Pasarela & Estilismo
          </h1>
          <p className="text-sm text-slate-300">
            Explora las colecciones oficiales, sesiones fotográficas de modelos y productos de moda exclusivos promovidos por nuestros directores y diseñadores.
          </p>
        </div>

        {/* Action Button: Visible ONLY for admin and diseñador */}
        {canCreate && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm bg-rose-600 hover:bg-rose-500 shadow-sm cursor-pointer whitespace-nowrap active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Crear Revista
          </button>
        )}
      </div>

      {/* Magazine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {magazines.map((mag) => {
          const isLiked = mag.likedBy.includes(userProfile.username);
          return (
            <div
              key={mag.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm flex flex-col transition hover:border-slate-700"
            >
              {/* Cover Image Container */}
              <div className="relative aspect-[3/4] w-full bg-slate-950 overflow-hidden group">
                <img
                  src={mag.coverImage}
                  alt={mag.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                {/* Solid Color Banner Badge */}
                <div
                  style={{ backgroundColor: mag.themeColor }}
                  className="absolute top-3 left-3 text-white text-[11px] font-extrabold px-3 py-1 rounded-lg uppercase tracking-wider shadow"
                >
                  {mag.issueNumber}
                </div>

                {/* Template badge */}
                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                  {mag.template === 'editorial_minimal' ? 'Editorial Minimal' : 'Streetwear Pop'}
                </div>

                {/* Quick Read Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-4">
                  <button
                    onClick={() => {
                      setReadingMagazine(mag);
                      setReaderPage(0);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-white text-slate-950 shadow-lg active:scale-95 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    Abrir Revista
                  </button>
                </div>
              </div>

              {/* Info Container */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                    <span className="font-semibold text-slate-300">Modelo:</span>
                    <span className="text-white font-bold">{mag.modelFaceClaimName}</span>
                  </div>

                  <h3 className="text-lg font-extrabold text-white leading-snug line-clamp-1">
                    {mag.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {mag.subtitle}
                  </p>
                </div>

                {/* Bottom Bar: Products count & Likes */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Tag className="w-3.5 h-3.5 text-rose-400" />
                    <span>{mag.promotedProductIds?.length || 0} prendas promocionadas</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => likeMagazine(mag.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95 ${
                        isLiked
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{mag.likes}</span>
                    </button>

                    <button
                      onClick={() => {
                        setReadingMagazine(mag);
                        setReaderPage(0);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white cursor-pointer active:scale-95"
                    >
                      Leer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE MAGAZINE MODAL (Admins & Diseñadores) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 p-5 sm:p-6 shrink-0">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-500" />
                  Crear Nueva Revista Fashion
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Exclusivo para administradores y diseñadores oficiales.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 pr-3">
              {/* 1. Escolha de Plantilla (2 plantillas) */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                  1. Escoge la Plantilla de Diseño
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedTemplate('editorial_minimal')}
                    className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      selectedTemplate === 'editorial_minimal'
                        ? 'border-rose-500 bg-rose-500/10 text-white shadow'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-extrabold text-sm text-white mb-1">
                      Editorial Minimalista
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Líneas limpias, tipografía sobria, enfoque en retrato principal y estética de pasarela sobria.
                    </p>
                  </div>

                  <div
                    onClick={() => setSelectedTemplate('streetwear_pop')}
                    className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      selectedTemplate === 'streetwear_pop'
                        ? 'border-blue-500 bg-blue-500/10 text-white shadow'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-extrabold text-sm text-white mb-1">
                      Streetwear Glam & Pop
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Diseño dinámico de revista urbana, cuadrícula fotográfica, colores de impacto y stickers de moda.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Color Sólido del Tema */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                  2. Color Sólido Principal de la Revista
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {SOLID_PALETTES.map((p) => (
                    <button
                      key={p.color}
                      type="button"
                      onClick={() => setThemeColor(p.color)}
                      style={{ backgroundColor: p.color }}
                      className={`w-8 h-8 rounded-full border-2 transition cursor-pointer active:scale-95 ${
                        themeColor === p.color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                      title={p.name}
                    />
                  ))}
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-xs text-slate-400">Personalizado:</span>
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Datos Generales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Título de la Revista</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. YM-VOGUE: Neon Horizon"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Número de Edición</label>
                  <input
                    type="text"
                    placeholder="Ej. Vol. 04 / Invierno 2026"
                    value={issueNumber}
                    onChange={(e) => setIssueNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-300">Subtítulo / Lema de Portada</label>
                  <input
                    type="text"
                    placeholder="Ej. Vanguardia textil y siluetas futuristas de alta costura"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                  />
                </div>
              </div>

              {/* 4. Modelo Face Claim */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Nombre del Modelo (Face Claim)</label>
                  <input
                    type="text"
                    placeholder="Ej. Aria Thorne (@aria)"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">Imagen de Portada</label>
                    <FileUploadButton
                      onUploadSuccess={(url) => setCoverImage(url)}
                      label="Subir Imagen"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="URL o sube desde tu dispositivo..."
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                  />
                </div>
              </div>

              {/* 5. Photoshoots / Imágenes de la sesión (Hasta 6) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                    5. Fotos del Photoshoot / Páginas Interiores ({photoshoots.length}/6)
                  </label>
                  <FileUploadButton
                    onUploadSuccess={(url) => {
                      if (photoshoots.length < 6) {
                        setPhotoshoots((prev) => [...prev, url]);
                      }
                    }}
                    label="Subir desde galería"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="O pegar URL de foto para la sesión fotográfica..."
                    value={newShootUrl}
                    onChange={(e) => setNewShootUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhotoshoot}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer active:scale-95"
                  >
                    Agregar Foto
                  </button>
                </div>

                {photoshoots.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
                    {photoshoots.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-700 group">
                        <img src={url} alt="shoot" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotoshoots(photoshoots.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 6. Promocionar Productos de la Tienda (Máximo 2) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                    6. Productos para promocionar en la revista (Máximo 2)
                  </label>
                  <span className="text-xs text-rose-400 font-bold">
                    {selectedProductIds.length}/2 seleccionados
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {fashionProducts.map((p) => {
                    const isSelected = selectedProductIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleToggleProduct(p.id)}
                        className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                          isSelected
                            ? 'border-rose-500 bg-rose-500/15 text-white'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{p.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {p.category === 'fashion' ? 'Categoría Fashion' : 'Tienda Oficial'} • {p.priceCoins} Coins
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 7. Notas Editoriales */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Notas Editoriales / Entrevista</label>
                <textarea
                  rows={3}
                  placeholder="Detalles sobre el concepto del photoshoot, marcas involucradas o entrevista al modelo..."
                  value={editorialNotes}
                  onChange={(e) => setEditorialNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold shadow-md cursor-pointer active:scale-95"
                >
                  Publicar Revista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MAGAZINE READER MODAL */}
      {readingMagazine && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
            {/* Top Toolbar */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  style={{ backgroundColor: readingMagazine.themeColor }}
                  className="w-3.5 h-3.5 rounded-full"
                />
                <div>
                  <h3 className="text-sm font-extrabold text-white">{readingMagazine.title}</h3>
                  <p className="text-[11px] text-slate-400">{readingMagazine.issueNumber} • Modelo: {readingMagazine.modelFaceClaimName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => likeMagazine(readingMagazine.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:text-white cursor-pointer active:scale-95"
                >
                  <Heart className={`w-4 h-4 ${readingMagazine.likedBy.includes(userProfile.username) ? 'text-rose-500 fill-rose-500' : ''}`} />
                  <span>{readingMagazine.likes}</span>
                </button>

                <button
                  onClick={() => setReadingMagazine(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Reader Content Pages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
              {readerPage === 0 && (
                /* Cover Page */
                <div className="max-w-xl mx-auto space-y-6 animate-fadeIn text-center">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                    <img
                      src={readingMagazine.coverImage}
                      alt={readingMagazine.title}
                      className="w-full h-full object-cover"
                    />
                    <div
                      style={{ backgroundColor: readingMagazine.themeColor }}
                      className="absolute top-4 left-4 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg tracking-widest uppercase"
                    >
                      {readingMagazine.issueNumber}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                      {readingMagazine.title}
                    </h1>
                    <p className="text-sm sm:text-base text-slate-300 italic">
                      "{readingMagazine.subtitle}"
                    </p>
                    <p className="text-xs text-rose-400 font-bold uppercase tracking-wider">
                      Modelo: {readingMagazine.modelFaceClaimName}
                    </p>
                  </div>
                </div>
              )}

              {readerPage === 1 && (
                /* Editorial & Photoshoot Spread */
                <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
                  <div className="border-l-4 pl-4 space-y-2" style={{ borderColor: readingMagazine.themeColor }}>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Editorial & Visión
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      Notas del Diseñador
                    </h2>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    {readingMagazine.editorialNotes}
                  </p>

                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                      Sesión Fotográfica Oficial (Photoshoot)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {readingMagazine.photoshoots.map((img, i) => (
                        <div key={i} className="aspect-[4/5] rounded-xl overflow-hidden border border-slate-800 shadow-md">
                          <img src={img} alt="photoshoot" className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {readerPage === 2 && (
                /* Promoted Products Spread */
                <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
                  <div className="text-center space-y-2">
                    <span
                      style={{ color: readingMagazine.themeColor }}
                      className="text-xs font-extrabold uppercase tracking-widest"
                    >
                      Colección en Pasarela
                    </span>
                    <h2 className="text-2xl font-extrabold text-white">
                      Prendas Oficiales Promocionadas
                    </h2>
                    <p className="text-xs text-slate-400">
                      Piezas de moda utilizadas en esta edición disponibles en la Tienda Oficial.
                    </p>
                  </div>

                  {readingMagazine.promotedProductIds?.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-sm">
                      No hay productos vinculados en esta edición.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {readingMagazine.promotedProductIds.map((pid) => {
                        const prod = products.find((p) => p.id === pid);
                        if (!prod) return null;
                        return (
                          <div
                            key={prod.id}
                            className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-md flex flex-col justify-between"
                          >
                            <div className="aspect-square bg-slate-950">
                              <img
                                src={prod.images[0]}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-4 space-y-3">
                              <div>
                                <h4 className="text-sm font-extrabold text-white line-clamp-1">
                                  {prod.name}
                                </h4>
                                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                                  {prod.description}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                                <span className="text-xs font-extrabold text-amber-400">
                                  {prod.priceCoins} Coins
                                </span>
                                <button
                                  onClick={() => {
                                    buyProduct(prod.id);
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer active:scale-95"
                                >
                                  Comprar Prenda
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <button
                disabled={readerPage === 0}
                onClick={() => setReaderPage((p) => Math.max(0, p - 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
                Página Anterior
              </button>

              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((idx) => (
                  <div
                    key={idx}
                    onClick={() => setReaderPage(idx)}
                    className={`w-2.5 h-2.5 rounded-full cursor-pointer transition ${
                      readerPage === idx ? 'bg-white scale-125' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <button
                disabled={readerPage === 2}
                onClick={() => setReaderPage((p) => Math.min(2, p + 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer active:scale-95"
              >
                Siguiente Página
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
