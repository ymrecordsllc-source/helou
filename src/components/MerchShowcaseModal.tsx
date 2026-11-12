import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Lock,
  CheckCircle2,
  Plus,
  ShoppingBag,
  Disc,
  Play,
  Heart,
  Gift,
  Coins,
  Shirt,
  Layers,
  Award,
  Star,
  Tag,
  Eye,
  Filter,
  Package,
  Send,
  Trash2,
  FolderPlus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserAlbum, UserPhotocard, Photocard, ShowcaseItem, WishlistItem } from '../types';
import { UnboxAlbumModal } from './UnboxAlbumModal';
import { MusicPlayerModal } from './MusicPlayerModal';

interface MerchShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToStore?: () => void;
}

export const MerchShowcaseModal: React.FC<MerchShowcaseModalProps> = ({
  isOpen,
  onClose,
  onGoToStore
}) => {
  const {
    userProfile,
    currentUser,
    inventory,
    userAlbums,
    userPhotocards,
    openAlbum,
    listPhotocardInOutlet,
    giftPhotocardToUser,
    toggleShowcaseItem,
    setMerchPrivate,
    showcaseItems,
    saveShowcaseItems,
    userWishlist,
    removeFromWishlist,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'showcase' | 'wishlist' | 'albums' | 'photocards'>('showcase');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedPersonalCategory, setSelectedPersonalCategory] = useState<string>('all');
  const [newPersonalCategoryName, setNewPersonalCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Detail viewer modal
  const [inspectingItem, setInspectingItem] = useState<ShowcaseItem | null>(null);

  // Unboxing modal state
  const [unboxingAlbumName, setUnboxingAlbumName] = useState('');
  const [unboxedCards, setUnboxedCards] = useState<Photocard[]>([]);
  const [isUnboxModalOpen, setIsUnboxModalOpen] = useState(false);

  // Audio player state
  const [listeningAlbum, setListeningAlbum] = useState<UserAlbum | null>(null);

  // Resell photocard modal state
  const [sellingPhotocard, setSellingPhotocard] = useState<UserPhotocard | null>(null);
  const [cardResalePrice, setCardResalePrice] = useState<number>(400);

  // Gift photocard modal state
  const [giftingPhotocard, setGiftingPhotocard] = useState<UserPhotocard | null>(null);
  const [giftTargetUser, setGiftTargetUser] = useState('');
  const [giftNote, setGiftNote] = useState('');

  if (!isOpen) return null;

  const showcaseIds = userProfile.showcaseItemIds || [];

  // Compute all personal categories currently used
  const personalCategories = Array.from(
    new Set(showcaseItems.map((i) => i.personalCategory).filter(Boolean) as string[])
  );

  const handleOpenAlbum = (album: UserAlbum) => {
    const cards = openAlbum(album.id);
    if (cards && cards.length > 0) {
      setUnboxingAlbumName(album.albumName);
      setUnboxedCards(cards);
      setIsUnboxModalOpen(true);
    }
  };

  const handleConfirmSellCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellingPhotocard) return;
    listPhotocardInOutlet(sellingPhotocard.id, cardResalePrice);
    setSellingPhotocard(null);
  };

  const handleConfirmGiftCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftingPhotocard || !giftTargetUser.trim()) return;
    giftPhotocardToUser(giftTargetUser.trim(), giftingPhotocard.id, giftNote.trim());
    setGiftingPhotocard(null);
    setGiftTargetUser('');
    setGiftNote('');
  };

  // Add an item from inventory to showcase
  const handleAddToVitrina = (item: any, type: ShowcaseItem['type']) => {
    const isAlready = showcaseItems.some((s) => s.id === item.id);
    if (isAlready) {
      showToast('Este artículo ya está en tu vitrina.');
      return;
    }

    const newItem: ShowcaseItem = {
      id: item.id,
      productId: item.productId,
      type,
      title: item.productName || item.name || item.albumName || 'Artículo de Colección',
      category: item.category || type,
      artistOrCollection: (item.associatedArtists && item.associatedArtists[0]) || item.artist || 'YM-ki Records',
      image: item.image || item.coverImage || '',
      isFeatured: false,
      personalCategory: selectedPersonalCategory !== 'all' ? selectedPersonalCategory : undefined,
      order: showcaseItems.length + 1,
      isOwned: true,
      dateAdded: new Date().toISOString(),
      description: item.description || ''
    };

    saveShowcaseItems([newItem, ...showcaseItems]);
  };

  const handleRemoveFromVitrina = (itemId: string) => {
    saveShowcaseItems(showcaseItems.filter((i) => i.id !== itemId));
    showToast('Artículo retirado de tu vitrina (permanece seguro en tu inventario).');
  };

  const handleToggleFeatured = (itemId: string) => {
    saveShowcaseItems(
      showcaseItems.map((i) => (i.id === itemId ? { ...i, isFeatured: !i.isFeatured } : i))
    );
  };

  const handleSetItemPersonalCategory = (itemId: string, catName: string) => {
    saveShowcaseItems(
      showcaseItems.map((i) => (i.id === itemId ? { ...i, personalCategory: catName || undefined } : i))
    );
  };

  const filteredShowcaseItems = showcaseItems.filter((item) => {
    if (selectedCategoryFilter !== 'all' && item.type !== selectedCategoryFilter) return false;
    if (selectedPersonalCategory !== 'all' && item.personalCategory !== selectedPersonalCategory) return false;
    return true;
  });

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-fadeIn">
        <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white max-h-[92vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-amber-500/20 to-pink-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">Vitrina Personal de Merchandising</h3>
                <p className="text-xs text-slate-400">
                  Exhibe todo tipo de productos oficiales: Ropa, Álbumes, Photocards, Paquetes, Posters y Deseos.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-4 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('showcase')}
              className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'showcase'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Mi Vitrina ({showcaseItems.length})
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'wishlist'
                  ? 'bg-pink-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4" />
              Lista de Deseos ({userWishlist.length})
            </button>

            <button
              onClick={() => setActiveTab('albums')}
              className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'albums'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Disc className="w-4 h-4" />
              Álbumes ({userAlbums.length})
            </button>

            <button
              onClick={() => setActiveTab('photocards')}
              className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'photocards'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              Photocards ({userPhotocards.length})
            </button>
          </div>

          {/* TAB 1: MI VITRINA PERSONAL DE MERCHANDISING */}
          {activeTab === 'showcase' && (
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              {/* Privacy Setting & Category Management */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">Privacidad de la Vitrina</span>
                      <p className="text-[11px] text-slate-400">
                        Oculta los artículos exhibidos para otros miembros.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userProfile.isMerchPrivate}
                      onChange={(e) => setMerchPrivate(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {/* Personal Category Creation */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-2">
                  {isCreatingCategory ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="text"
                        value={newPersonalCategoryName}
                        onChange={(e) => setNewPersonalCategoryName(e.target.value)}
                        placeholder="Nombre de categoría (ej: Streetwear)"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          if (newPersonalCategoryName.trim()) {
                            setSelectedPersonalCategory(newPersonalCategoryName.trim());
                            setNewPersonalCategoryName('');
                            setIsCreatingCategory(false);
                            showToast('Categoría personal lista para asignar.');
                          }
                        }}
                        className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                      >
                        OK
                      </button>
                      <button
                        onClick={() => setIsCreatingCategory(false)}
                        className="p-1.5 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <FolderPlus className="w-4 h-4 text-indigo-400" />
                        <div>
                          <span className="text-xs font-bold text-white block">Categorías Personales</span>
                          <span className="text-[11px] text-slate-400">
                            {personalCategories.length ? `${personalCategories.length} creadas` : 'Organiza por sección'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsCreatingCategory(true)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
                      >
                        + Crear Categoría
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-500 font-bold shrink-0">Filtrar:</span>
                {['all', 'merch', 'fashion', 'album', 'photocard', 'package', 'poster'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-xl font-bold uppercase tracking-wider shrink-0 transition ${
                      selectedCategoryFilter === cat
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'Todos los tipos' : cat}
                  </button>
                ))}

                {personalCategories.length > 0 && (
                  <>
                    <span className="text-slate-600 px-1">|</span>
                    {personalCategories.map((pCat) => (
                      <button
                        key={pCat}
                        onClick={() => setSelectedPersonalCategory(selectedPersonalCategory === pCat ? 'all' : pCat)}
                        className={`px-3 py-1 rounded-xl font-bold text-xs shrink-0 transition ${
                          selectedPersonalCategory === pCat
                            ? 'bg-indigo-600 text-white shadow'
                            : 'bg-slate-950 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        📁 {pCat}
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* EXHIBITED ITEMS GRID */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Artículos en Vitrina ({filteredShowcaseItems.length})
                  </span>
                  <span className="text-[11px] text-amber-400">
                    Marca con ⭐ tus artículos destacados
                  </span>
                </div>

                {filteredShowcaseItems.length === 0 ? (
                  <div className="py-12 text-center bg-slate-950 rounded-3xl border border-slate-800 space-y-3">
                    <Package className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-sm font-bold text-slate-300">Tu vitrina está esperando tus colecciones</p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Puedes añadir productos que has adquirido en tu inventario, ropa fashion, álbumes abiertos o photocards.
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        onClick={() => setActiveTab('albums')}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow"
                      >
                        Ver mis Álbumes
                      </button>
                      <button
                        onClick={() => setActiveTab('photocards')}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow"
                      >
                        Ver mis Photocards
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {filteredShowcaseItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setInspectingItem(item)}
                        className={`group relative bg-slate-950 rounded-2xl border p-3 flex flex-col justify-between transition cursor-pointer select-none shadow hover:shadow-xl ${
                          item.isFeatured
                            ? 'border-amber-500/80 bg-gradient-to-b from-amber-500/10 to-slate-950 ring-1 ring-amber-500/30'
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Top Badges */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            En Posesión ✓
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFeatured(item.id);
                            }}
                            className={`p-1 rounded-lg transition ${
                              item.isFeatured ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'
                            }`}
                            title="Destacar producto"
                          >
                            <Star className={`w-4 h-4 ${item.isFeatured ? 'fill-amber-400' : ''}`} />
                          </button>
                        </div>

                        {/* Image */}
                        <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-900 mb-2 relative">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {item.personalCategory && (
                            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-[9px] font-bold text-indigo-300">
                              📁 {item.personalCategory}
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                          <p className="text-[10px] text-slate-400 truncate">
                            {item.artistOrCollection || 'Colección Oficial'}
                          </p>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-900 mt-2">
                          <span className="text-[10px] font-bold uppercase text-slate-500">
                            {item.type}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromVitrina(item.id);
                            }}
                            className="p-1 rounded text-slate-600 hover:text-red-400 transition"
                            title="Quitar de vitrina"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* QUICK ADD FROM INVENTORY */}
              {inventory.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
                    Añadir Artículos Adquiridos desde tu Inventario ({inventory.length})
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                    {inventory.map((invItem) => {
                      const isAlready = showcaseItems.some((s) => s.id === invItem.id);
                      return (
                        <div
                          key={invItem.id}
                          className="flex items-center justify-between gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={invItem.image}
                              alt={invItem.productName}
                              className="w-10 h-10 rounded-xl object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-white truncate">{invItem.productName}</h5>
                              <span className="text-[10px] text-slate-400">{invItem.category || 'Merch'}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={isAlready}
                            onClick={() => handleAddToVitrina(invItem, (invItem.category as any) || 'merch')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                              isAlready
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer active:scale-95'
                            }`}
                          >
                            {isAlready ? 'En Vitrina ✓' : '+ Exhibir'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WISHLIST (LISTA DE DESEOS) */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div className="p-3.5 bg-pink-950/30 border border-pink-500/30 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500/20 text-pink-400 rounded-xl shrink-0">
                    <Heart className="w-5 h-5 fill-pink-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Tu Lista de Deseos Oficial</h4>
                    <p className="text-[11px] text-slate-300">
                      Artículos que deseas adquirir o que tus amigos y fans pueden regalarte, incluso si están agotados en tienda.
                    </p>
                  </div>
                </div>
                {onGoToStore && (
                  <button
                    onClick={() => {
                      onClose();
                      onGoToStore();
                    }}
                    className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
                  >
                    Explorar Tienda
                  </button>
                )}
              </div>

              {userWishlist.length === 0 ? (
                <div className="py-16 text-center bg-slate-950 rounded-3xl border border-slate-800 space-y-2">
                  <Heart className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-300">Tu lista de deseos está vacía</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Ve a la Tienda Oficial y presiona el ícono de corazón en cualquier producto para agregarlo a tus deseos.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {userWishlist.map((wish) => (
                    <div
                      key={wish.id}
                      className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={wish.image}
                          alt={wish.productName}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-pink-500/20 text-pink-300 border border-pink-500/30 inline-block mb-1">
                            Deseado ❤️
                          </span>
                          <h4 className="text-xs font-bold text-white truncate">{wish.productName}</h4>
                          <span className="text-[11px] font-bold text-amber-400">
                            {wish.currencyType === 'gems' ? `${wish.priceGems || 5} Gemas 💎` : `${wish.priceCoins} Coins 🪙`}
                          </span>
                          {wish.isSoldOut && (
                            <span className="text-[9px] text-red-400 block font-semibold">
                              (Agotado en Tienda - Acepta Regalos)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900">
                        <button
                          onClick={() => removeFromWishlist(wish.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs transition cursor-pointer"
                          title="Eliminar de lista de deseos"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MIS ÁLBUMES */}
          {activeTab === 'albums' && (
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Álbumes Adquiridos ({userAlbums.length})
                </span>
                <span className="text-[11px] text-indigo-400">
                  Ábrelos para descubrir photocards y reproducir canciones
                </span>
              </div>

              {userAlbums.length === 0 ? (
                <div className="py-12 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <Disc className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-300">Aún no has comprado ningún álbum</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Ve a la Tienda Oficial para adquirir Full Álbumes, Mini Álbumes o Singles con photocards exclusivas.
                  </p>
                  {onGoToStore && (
                    <button
                      onClick={() => {
                        onClose();
                        onGoToStore();
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl shadow cursor-pointer active:scale-95"
                    >
                      Ir a la Tienda de Álbumes
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userAlbums.map((album) => (
                    <div
                      key={album.id}
                      className="bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between shadow space-y-3"
                    >
                      <div className="flex gap-3">
                        <img
                          src={album.coverImage}
                          alt={album.albumName}
                          className="w-16 h-16 rounded-xl object-cover shadow"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-black text-white truncate">{album.albumName}</h4>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">
                            {album.albumType} • {album.tracks?.length || 0} pistas
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Adquirido: {new Date(album.purchasedAt).toLocaleDateString('es-MX')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                        {!album.isOpened ? (
                          <button
                            onClick={() => handleOpenAlbum(album)}
                            className="flex-1 py-1.5 bg-gradient-to-r from-amber-500 to-pink-500 text-slate-950 font-black text-xs rounded-xl shadow active:scale-95 cursor-pointer"
                          >
                            🎁 Abrir Álbum / Unbox
                          </button>
                        ) : (
                          <button
                            onClick={() => setListeningAlbum(album)}
                            className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5" /> Escuchar Pistas
                          </button>
                        )}

                        <button
                          onClick={() => handleAddToVitrina(album, 'album')}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
                        >
                          + Vitrina
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MIS PHOTOCARDS */}
          {activeTab === 'photocards' && (
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Photocards Coleccionadas ({userPhotocards.length})
                </span>
                <span className="text-[11px] text-purple-400">
                  Añádelas a tu vitrina, intercámbialas o regálalas
                </span>
              </div>

              {userPhotocards.length === 0 ? (
                <div className="py-12 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <Layers className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-300">Aún no tienes photocards</p>
                  <p className="text-[11px] text-slate-500">
                    Abre tus álbumes adquiridos en la pestaña "Álbumes" para desbloquear photocards exclusivas.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {userPhotocards.map((card) => (
                    <div
                      key={card.id}
                      className="bg-slate-950 rounded-2xl border border-slate-800 p-2.5 flex flex-col justify-between gap-2 shadow"
                    >
                      <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-slate-900 relative">
                        <img
                          src={card.image}
                          alt={card.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-black/75 backdrop-blur-sm text-amber-300">
                          {card.rarity}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h5 className="text-xs font-bold text-white truncate">{card.name}</h5>
                        <p className="text-[10px] text-slate-400 truncate">{card.artist}</p>
                      </div>

                      <div className="flex items-center gap-1 pt-1 border-t border-slate-900">
                        <button
                          onClick={() => handleAddToVitrina(card, 'photocard')}
                          className="flex-1 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded-lg"
                        >
                          + Vitrina
                        </button>
                        <button
                          onClick={() => setGiftingPhotocard(card)}
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-pink-400 rounded-lg text-xs"
                          title="Regalar a usuario"
                        >
                          <Gift className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ITEM INSPECTION MODAL */}
          {inspectingItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
              <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-white">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold truncate">{inspectingItem.title}</h3>
                  <button
                    onClick={() => setInspectingItem(null)}
                    className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-950">
                  <img
                    src={inspectingItem.image}
                    alt={inspectingItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Categoría:</span>
                    <strong className="text-white uppercase">{inspectingItem.type}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Colección / Artista:</span>
                    <strong className="text-white">{inspectingItem.artistOrCollection || 'YM-ki Records'}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Estado en Vitrina:</span>
                    <span className="text-emerald-400 font-bold">En Posesión ✓</span>
                  </div>

                  {/* Assign Personal Category */}
                  <div className="pt-2 border-t border-slate-800 space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">
                      Asignar Categoría Personal:
                    </label>
                    <select
                      value={inspectingItem.personalCategory || ''}
                      onChange={(e) => {
                        handleSetItemPersonalCategory(inspectingItem.id, e.target.value);
                        setInspectingItem({ ...inspectingItem, personalCategory: e.target.value || undefined });
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
                    >
                      <option value="">(Sin categoría personal)</option>
                      {personalCategories.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      handleToggleFeatured(inspectingItem.id);
                      setInspectingItem({ ...inspectingItem, isFeatured: !inspectingItem.isFeatured });
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      inspectingItem.isFeatured
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Star className="w-4 h-4" />
                    {inspectingItem.isFeatured ? 'Destacado ⭐' : 'Marcar Destacado'}
                  </button>

                  <button
                    onClick={() => {
                      handleRemoveFromVitrina(inspectingItem.id);
                      setInspectingItem(null);
                    }}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold"
                  >
                    Quitar de Vitrina
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* GIFT PHOTOCARD MODAL */}
          {giftingPhotocard && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
              <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-white">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <Gift className="w-4 h-4 text-pink-400" /> Regalar Photocard
                  </h4>
                  <button
                    onClick={() => setGiftingPhotocard(null)}
                    className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleConfirmGiftCard} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Destinatario (Username):</label>
                    <input
                      type="text"
                      value={giftTargetUser}
                      onChange={(e) => setGiftTargetUser(e.target.value)}
                      placeholder="ej: BobTheGreat"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Nota o dedicatoria:</label>
                    <input
                      type="text"
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      placeholder="¡Para tu colección!"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl shadow cursor-pointer active:scale-95"
                  >
                    Confirmar Envío de Regalo
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* UNBOXING ALBUM MODAL */}
          {isUnboxModalOpen && (
            <UnboxAlbumModal
              isOpen={isUnboxModalOpen}
              onClose={() => setIsUnboxModalOpen(false)}
              albumName={unboxingAlbumName}
              photocards={unboxedCards}
            />
          )}

          {/* MUSIC PLAYER MODAL */}
          {listeningAlbum && (
            <MusicPlayerModal
              album={listeningAlbum}
              onClose={() => setListeningAlbum(null)}
            />
          )}
        </div>
      </div>
    </>
  );
};
