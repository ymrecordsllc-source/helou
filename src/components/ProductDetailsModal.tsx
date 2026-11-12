import React, { useState } from 'react';
import {
  X,
  Star,
  Coins,
  Sparkles,
  ShoppingBag,
  Disc,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  Tag,
  ShieldCheck,
  Send
} from 'lucide-react';
import { Product, ProductReview, Photocard } from '../types';
import { useApp } from '../context/AppContext';
import { Photocard3DViewer } from './Photocard3DViewer';
import { AvatarWithFrame } from './AvatarWithFrame';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onBuy: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onBuy
}) => {
  const {
    currentUser,
    userProfile,
    isPrivileged,
    inventory,
    productReviews,
    addProductReview,
    deleteProductReview,
    primaryButtonColor,
    showToast,
    productVariants,
    validateCoupon,
    buyProductAtomic
  } = useApp();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [show3DPhotocards, setShow3DPhotocards] = useState(false);
  const [selected3DPcIndex, setSelected3DPcIndex] = useState(0);

  // Variants & Coupon State
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent: number;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  // Review form state
  const [userRating, setUserRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  if (!isOpen || !product) return null;

  const variants = productVariants[product.id] || [];
  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) || (variants.length > 0 ? variants[0] : null);

  const currentPrice = selectedVariant ? selectedVariant.priceCoins : product.priceCoins;
  const currentStock = selectedVariant ? selectedVariant.stockCount : product.stockCount;
  const isOutOfStock = currentStock <= 0;
  const finalPrice = appliedCoupon ? appliedCoupon.finalAmount : currentPrice;

  const isAlbum = product.isAlbum;
  const hasPurchased = inventory.some(
    (item) => item.productName === product.name || item.productId === product.id
  );

  // Reviews for this product
  const reviews = productReviews[product.id] || [];
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      showToast('Por favor escribe tu opinión sobre el producto.');
      return;
    }
    setIsSubmittingReview(true);
    await addProductReview(product.id, userRating, reviewComment.trim());
    setReviewComment('');
    setIsSubmittingReview(false);
  };

  const pool: Photocard[] = product.photocardsPool || [];
  const isPhotocard = product.category === 'photocard' || !!product.photocardData;
  const singlePhotocard: Photocard | undefined =
    product.photocardData ||
    (isPhotocard
      ? {
          id: product.id,
          name: product.name,
          artist: product.associatedArtists?.[0] || 'Artista Oficial',
          image: product.images[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
          backImage: product.images[1] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500',
          rarity: (product.tags.find((t) => ['comun', 'rara', 'ultra_rara', 'preventa_exclusiva'].includes(t)) as any) || 'rara',
          finishEffect: product.finishEffect || 'holographic',
          textureUrl: product.textureUrl,
          lightingIntensity: product.lightingIntensity,
          brightness: product.brightness,
          isHolographic: product.finishEffect !== 'neutral'
        }
      : undefined);

  const current3DPc: Photocard | undefined = isPhotocard ? singlePhotocard : pool[selected3DPcIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto relative text-slate-100">
        {/* Header with Close */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {isAlbum ? <Disc className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                {product.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>
                  {isPhotocard
                    ? 'Photocard 3D Coleccionable'
                    : product.category === 'fashion'
                    ? 'Moda Fashion'
                    : isAlbum
                    ? 'Álbum Musical Oficial'
                    : 'Mercancía Oficial'}
                </span>
                {product.isOutlet && <span className="text-amber-400 font-bold">• Outlet & Reventa</span>}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout: 2 Columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Left Column: Gallery or 3D Photocard Viewer */}
          <div className="space-y-4">
            {(show3DPhotocards || isPhotocard) && current3DPc ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {isPhotocard
                      ? `Photocard 3D (${current3DPc.finishEffect === 'neutral' ? 'Neutral / Mate' : 'Holográfica'})`
                      : `Photocard 3D (${selected3DPcIndex + 1}/${pool.length})`}
                  </span>
                  {!isPhotocard && (
                    <button
                      onClick={() => setShow3DPhotocards(false)}
                      className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Volver a fotos del producto
                    </button>
                  )}
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
                  <Photocard3DViewer
                    photocard={current3DPc}
                    interactive={true}
                    showControls={true}
                  />
                </div>

                {/* Photocard Selector Navigation for albums */}
                {!isPhotocard && pool.length > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      onClick={() => setSelected3DPcIndex((prev) => (prev > 0 ? prev - 1 : pool.length - 1))}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-300">
                      {current3DPc.name} ({current3DPc.rarity})
                    </span>
                    <button
                      onClick={() => setSelected3DPcIndex((prev) => (prev < pool.length - 1 ? prev + 1 : 0))}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Main Image */}
                <div className="relative aspect-square w-full rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center">
                  <img
                    src={product.images[activeImageIndex] || product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="px-4 py-2 rounded-xl bg-red-600/90 text-white font-black text-sm tracking-widest shadow-xl uppercase border border-red-400/40">
                        AGOTADO
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnails row */}
                {product.images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 cursor-pointer transition ${
                          activeImageIndex === idx
                            ? 'border-indigo-500 scale-105 shadow-md'
                            : 'border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* 3D Photocard exploration trigger for albums */}
                {isAlbum && pool.length > 0 && (
                  <button
                    onClick={() => {
                      setSelected3DPcIndex(0);
                      setShow3DPhotocards(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-black text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                  >
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Explorar Photocards de la Colección en 3D ({pool.length})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Information, Specs & Buy Button */}
          <div className="space-y-5">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              {isPhotocard && (
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Photocard 3D {singlePhotocard?.finishEffect === 'neutral' ? '(Neutral)' : '(Holográfica)'}
                </span>
              )}
              {product.category === 'bundle' && (
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow">
                  Bundle 🎁
                </span>
              )}
              {product.isAlbum && (
                <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow">
                  {product.albumType} Álbum
                </span>
              )}
              {product.isPreorder && (
                <span className="bg-pink-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow">
                  Preventa Exclusiva
                </span>
              )}
              {product.category === 'fashion' && (
                <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow">
                  Pasarela Fashion
                </span>
              )}
              {product.isOutlet && (
                <span className="bg-amber-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow">
                  Outlet (Reventa)
                </span>
              )}
              {isOutOfStock ? (
                <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  Agotado
                </span>
              ) : (
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  Stock: {product.stockCount} disponibles
                </span>
              )}
            </div>

            {/* Ratings Summary */}
            <div className="flex items-center gap-3">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      averageRating && Number(averageRating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-300">
                {averageRating ? `${averageRating} / 5.0` : 'Sin reseñas'}
              </span>
              <span className="text-xs text-slate-500">
                ({reviews.length} {reviews.length === 1 ? 'opinión' : 'opiniones'})
              </span>
            </div>

            {/* Product Variants Selector (Talla, Edición, Color, etc.) */}
            {variants.length > 0 && (
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Seleccionar Variante / Edición:</span>
                  <span className="text-[11px] text-slate-400">
                    Stock: {currentStock} unid.
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const isVarOutOfStock = v.stockCount <= 0;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        disabled={isVarOutOfStock}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                            : isVarOutOfStock
                            ? 'bg-slate-900 border-slate-800 text-slate-600 line-through cursor-not-allowed'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
                        }`}
                      >
                        <span>{v.title || v.name}</span>
                        <span className="text-[10px] opacity-75">({v.priceCoins} Coins)</span>
                        {isVarOutOfStock && <span className="text-[9px] text-red-400 font-bold ml-1">Agotado</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Box with Coupon Discount */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Precio a pagar</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xl font-black text-amber-400">
                    <Coins className="w-5 h-5 text-amber-400" />
                    <span>{finalPrice.toLocaleString('es-MX')} Coins</span>
                  </div>
                  {appliedCoupon && (
                    <span className="text-xs text-slate-500 line-through">
                      {currentPrice.toLocaleString('es-MX')} Coins
                    </span>
                  )}
                </div>
                {appliedCoupon && (
                  <span className="text-[11px] font-bold text-emerald-400 block mt-0.5">
                    Ahorras {appliedCoupon.discountAmount.toLocaleString('es-MX')} Coins ({appliedCoupon.discountPercent}% OFF)
                  </span>
                )}
              </div>

              {product.isOutlet && product.resellerUsername && (
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Vendedor</span>
                  <span className="text-xs font-bold text-amber-300">@{product.resellerUsername}</span>
                </div>
              )}
            </div>

            {/* Discount Coupon Code Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" /> Cupón de Descuento:
                </span>
                {appliedCoupon && (
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponCodeInput('');
                      showToast('Cupón removido.');
                    }}
                    className="text-[10px] text-red-400 hover:underline cursor-pointer"
                  >
                    Quitar cupón
                  </button>
                )}
              </div>

              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => {
                      setCouponCodeInput(e.target.value.toUpperCase());
                      setCouponError(null);
                    }}
                    placeholder="Código (ej: YMKI10, BIENVENIDO)..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white uppercase placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    disabled={isValidatingCoupon || !couponCodeInput.trim()}
                    onClick={async () => {
                      setIsValidatingCoupon(true);
                      setCouponError(null);
                      const res = await validateCoupon(couponCodeInput.trim(), currentPrice);
                      setIsValidatingCoupon(false);
                      if (res.valid) {
                        setAppliedCoupon({
                          code: couponCodeInput.trim(),
                          discountPercent: res.discountPercent,
                          discountAmount: res.discountAmount,
                          finalAmount: res.finalAmount
                        });
                        showToast(`¡Cupón aplicado! -${res.discountPercent}%`);
                      } else {
                        setCouponError(res.error || 'Cupón inválido o expirado.');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow cursor-pointer"
                  >
                    {isValidatingCoupon ? 'Validando...' : 'Aplicar'}
                  </button>
                </div>
              ) : (
                <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-400">
                  <span className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Cupón {appliedCoupon.code} aplicado
                  </span>
                  <span className="font-bold">-{appliedCoupon.discountPercent}%</span>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" /> {couponError}
                </p>
              )}
            </div>

            {/* Buy Action Button */}
            <div>
              <button
                disabled={isOutOfStock || isBuying}
                onClick={async () => {
                  if (isOutOfStock) return;
                  setIsBuying(true);
                  const res = await buyProductAtomic(
                    product.id,
                    selectedVariant?.id,
                    1,
                    'coins',
                    appliedCoupon?.code
                  );
                  setIsBuying(false);
                  if (res.success) {
                    showToast('¡Compra realizada con éxito!');
                    onBuy(product);
                    onClose();
                  } else {
                    showToast(res.error || 'Error al procesar la compra.');
                  }
                }}
                style={!isOutOfStock ? { backgroundColor: primaryButtonColor } : undefined}
                className={`w-full py-3 px-5 rounded-2xl font-black text-sm tracking-wide shadow-lg transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                    : 'text-white hover:opacity-95'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {isBuying
                  ? 'Procesando compra segura...'
                  : isOutOfStock
                  ? 'Producto Agotado'
                  : isAlbum
                  ? 'Comprar Álbum & Abrir Photocards'
                  : 'Comprar Producto Ahora'}
              </button>
              {isOutOfStock && (
                <p className="text-[11px] text-slate-500 text-center mt-1.5">
                  Este artículo está actualmente sin stock en el almacén oficial.
                </p>
              )}
            </div>

            {/* Description & Specifications */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Descripción & Detalles
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                {product.description || 'Sin descripción detallada.'}
              </p>
            </div>

            {/* Package Contents / Álbum Tracklist */}
            {isAlbum && (
              <div className="space-y-2 p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Disc className="w-3.5 h-3.5" />
                  Contenido del Paquete & Tracklist
                </h4>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  <li>
                    <strong>Photocards incluidas:</strong> {product.photocardsPerUnbox || 2} photocards coleccionables aleatorias al abrir.
                  </li>
                  {product.isPreorder && (
                    <li className="text-pink-300">
                      <strong>Beneficio de preventa:</strong> Photocard exclusiva de preventa asegurada.
                    </li>
                  )}
                  <li>
                    <strong>Tracklist oficial ({product.tracks?.length || 0} canciones):</strong>
                    <div className="mt-2 space-y-1 max-h-36 overflow-y-auto pl-2">
                      {product.tracks?.map((t, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] text-slate-400 py-0.5 border-b border-slate-800/50">
                          <span>{t.trackNumber}. {t.title}</span>
                          <span className="text-slate-500">{t.duration}</span>
                        </div>
                      ))}
                    </div>
                  </li>
                </ul>
              </div>
            )}

            {/* Associated Artists & Tags */}
            <div className="space-y-2">
              {product.associatedArtists && product.associatedArtists.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-semibold">Artistas:</span>
                  {product.associatedArtists.map((art, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-xs font-medium"
                    >
                      {art}
                    </span>
                  ))}
                </div>
              )}

              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <Tag className="w-3 h-3 text-slate-500" />
                  {product.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 text-[11px]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="pt-6 border-t border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              Reseñas & Opiniones de la Comunidad ({reviews.length})
            </h3>
            {hasPurchased && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> Compraste este producto
              </span>
            )}
          </div>

          {/* Add Review Form */}
          <form
            onSubmit={handleReviewSubmit}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                Deja tu valoración sobre este artículo:
              </span>

              {/* Star Rating Selector */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setUserRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 cursor-pointer transition transform hover:scale-110"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        (hoverRating || userRating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Escribe tu opinión sobre el producto, empaque, photocards o calidad..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isSubmittingReview || !reviewComment.trim()}
                style={{ backgroundColor: primaryButtonColor }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Publicar
              </button>
            </div>
          </form>

          {/* Reviews List */}
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4 bg-slate-950/40 rounded-xl border border-slate-800/40">
                Aún no hay reseñas para este artículo. ¡Sé el primero en valorar tu compra!
              </p>
            ) : (
              reviews.map((rev) => {
                const canDelete =
                  isPrivileged() || rev.username === currentUser;
                return (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AvatarWithFrame
                          src={rev.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          size="xs"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">
                              @{rev.username}
                            </span>
                            {rev.verifiedBuyer && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Comprador Verificado
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">{rev.createdAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                rev.rating >= s
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>

                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => deleteProductReview(product.id, rev.id)}
                            className="text-slate-500 hover:text-red-400 transition cursor-pointer p-1"
                            title="Eliminar reseña"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 pl-8 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
