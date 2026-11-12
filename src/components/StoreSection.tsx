import React, { useState } from 'react';
import {
  Store,
  Tag,
  Plus,
  Coins,
  Sparkles,
  ShoppingBag,
  Layers,
  X,
  Repeat,
  Image as ImageIcon,
  Disc,
  Shirt,
  Gift,
  AlertCircle,
  CheckCircle2,
  ListMusic,
  ExternalLink,
  Trash2,
  Eye,
  Heart,
  Palette,
  Crown,
  Flame,
  Sliders,
  Check,
  RotateCw,
  ShieldCheck,
  Link as LinkIcon,
  Package,
  History,
  ArrowRightLeft,
  Boxes,
  FileText,
  UserCheck,
  ShoppingCart,
  Send
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, CurrencyType, AlbumTrack, Photocard, ProductVariant, InventoryItem, TradeOffer } from '../types';
import { ProductDetailsModal } from './ProductDetailsModal';
import { FileUploadButton } from './FileUploadButton';
import { AvatarWithFrame } from './AvatarWithFrame';
import { Photocard3DViewer, PRESET_TEXTURES } from './Photocard3DViewer';

export type StoreSectionMode =
  | 'official'
  | 'fashion'
  | 'outlet'
  | 'inventory'
  | 'wishlist'
  | 'history'
  | 'trades'
  | 'admin_inventory';

interface StoreSectionProps {
  initialSearchQuery?: string;
  initialSelectedProductId?: string | null;
}

export const StoreSection: React.FC<StoreSectionProps> = ({
  initialSearchQuery = '',
  initialSelectedProductId = null
}) => {
  const {
    currentUser,
    products,
    inventory,
    userProfile,
    showcaseItems,
    userWishlist,
    userBiases,
    addToWishlist,
    removeFromWishlist,
    updateCustomization,
    isPrivileged,
    addProductToStore,
    deleteProduct,
    buyProduct,
    buyProductAtomic,
    listItemInOutlet,
    buyOutletProduct,
    giftItemToUser,
    primaryButtonColor,
    showToast,
    // Authorized Vendors & Coupons
    vendorsList,
    myVendorApplication,
    applyForVendor,
    reviewVendorStatus,
    isApprovedVendor,
    discountCoupons,
    createDiscountCoupon,
    // Advanced Store Features
    purchaseHistory,
    inventoryMovements,
    restockProduct,
    createProductVariant,
    productVariants,
    tradeOffers,
    submitTradeOffer,
    respondToTradeOffer,
    userAlbums,
    userPhotocards,
    openAlbum,
    allProfiles,
    toggleShowcaseItem
  } = useApp();

  const [storeMode, setStoreMode] = useState<StoreSectionMode>('official');
  const [filterCategory, setFilterCategory] = useState<'all' | 'album' | 'photocard' | 'frame' | 'bundle' | 'merch'>('all');
  const [searchFilter, setSearchFilter] = useState(initialSearchQuery);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<Product | null>(null);
  const [previewingFrameProduct, setPreviewingFrameProduct] = useState<Product | null>(null);

  // Purchase confirmation & receipt state
  const [confirmPurchaseProduct, setConfirmPurchaseProduct] = useState<Product | null>(null);
  const [purchaseReceipt, setPurchaseReceipt] = useState<{ product: Product; date: string; amount: number; currency: string } | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  React.useEffect(() => {
    if (initialSelectedProductId) {
      const found = products.find((p) => p.id === initialSelectedProductId);
      if (found) {
        setSelectedProductForDetails(found);
      }
    }
  }, [initialSelectedProductId, products]);

  // Vendor system state
  const [isVendorPanelOpen, setIsVendorPanelOpen] = useState(false);
  const [isApplyVendorOpen, setIsApplyVendorOpen] = useState(false);
  const [vendorNameInput, setVendorNameInput] = useState('');
  const [vendorDescInput, setVendorDescInput] = useState('');
  const [vendorTypesInput, setVendorTypesInput] = useState('merch, photocard, ropa');
  const [vendorContactInput, setVendorContactInput] = useState('');

  // Coupon manager state for admins
  const [isCouponManagerOpen, setIsCouponManagerOpen] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState<number>(10);
  const [newCouponMinCoins, setNewCouponMinCoins] = useState<number>(0);
  const [newCouponMaxUses, setNewCouponMaxUses] = useState<number>(100);

  // Bias Filter State
  const [selectedBiasArtist, setSelectedBiasArtist] = useState<string | null>(null);

  // Quick 3D Photocard inspector modal
  const [viewing3DProduct, setViewing3DProduct] = useState<Product | null>(null);

  // Add Product Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // Requested: escoger el tipo de producto que sera: general, album, photocard, bundle, frame
  const [productType, setProductType] = useState<'general' | 'album' | 'photocard' | 'bundle' | 'frame'>('general');
  const [isFashionCategory, setIsFashionCategory] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrlInput, setNewImageUrlInput] = useState('');
  const [tagsList, setTagsList] = useState<string[]>(['oficial']);
  const [tagInput, setTagInput] = useState('');
  const [stockType, setStockType] = useState<'unlimited' | 'fixed'>('fixed');
  const [stockCount, setStockCount] = useState<number>(20);
  const [associatedArtistsInput, setAssociatedArtistsInput] = useState('');
  const [currencyType, setCurrencyType] = useState<CurrencyType>('coins');
  const [priceCoins, setPriceCoins] = useState<number>(1500);
  const [priceGems, setPriceGems] = useState<number>(15);

  // Photocard-specific creation state
  const [pcArtist, setPcArtist] = useState('Hana Star');
  const [pcFrontImage, setPcFrontImage] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&fit=crop');
  const [pcBackImage, setPcBackImage] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80');
  const [pcRarity, setPcRarity] = useState<'comun' | 'rara' | 'ultra_rara' | 'preventa_exclusiva'>('rara');
  const [pcFinishEffect, setPcFinishEffect] = useState<'holographic' | 'neutral'>('holographic');
  const [pcTextureUrl, setPcTextureUrl] = useState('');
  const [pcLighting, setPcLighting] = useState<number>(100);
  const [pcBrightness, setPcBrightness] = useState<number>(100);

  // Frame-specific creation state
  const [frameStyleChoice, setFrameStyleChoice] = useState('cyber_neon');
  const [frameDefaultColor, setFrameDefaultColor] = useState('#ec4899');
  const [frameCustomBorderUrl, setFrameCustomBorderUrl] = useState('');

  // Bundle-specific creation state
  const [isOutletBundle, setIsOutletBundle] = useState(false);
  const [bundleSelectedProductIds, setBundleSelectedProductIds] = useState<string[]>([]);
  const [bundleLinkInput, setBundleLinkInput] = useState('');
  const [bundleItemsText, setBundleItemsText] = useState('1x Álbum Oficial ECLIPSE, 2x Photocards Holográficas, 1x Póster Exclusivo');
  const [bundleDiscount, setBundleDiscount] = useState<number>(15);

  // Album-specific creation state
  const [albumType, setAlbumType] = useState<'full' | 'mini' | 'single'>('full');
  const [photocardsPerUnbox, setPhotocardsPerUnbox] = useState<number>(2);
  const [isPreorder, setIsPreorder] = useState(false);
  const [albumTracks, setAlbumTracks] = useState<AlbumTrack[]>([
    { trackNumber: 1, title: 'Title Track', duration: '3:20', versionType: 'original' },
    { trackNumber: 2, title: 'Track 02', duration: '3:05', versionType: 'original' },
    { trackNumber: 3, title: 'Track 03', duration: '3:15', versionType: 'original' },
    { trackNumber: 4, title: 'Track 04', duration: '2:50', versionType: 'original' },
    { trackNumber: 5, title: 'Track 05', duration: '3:40', versionType: 'original' },
    { trackNumber: 6, title: 'Track 06', duration: '3:10', versionType: 'original' },
    { trackNumber: 7, title: 'Track 07', duration: '3:30', versionType: 'original' },
    { trackNumber: 8, title: 'Outro', duration: '2:15', versionType: 'original' }
  ]);
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackDuration, setNewTrackDuration] = useState('3:15');
  const [newTrackVersion, setNewTrackVersion] = useState<'original' | 'remix' | 'instrumental' | 'acoustic' | 'live'>('original');

  // Album photocards pool (up to 20) with mandatory backImage support - no hardcoded demo cards
  const [photocardsPool, setPhotocardsPool] = useState<Photocard[]>([]);
  const [newPcName, setNewPcName] = useState('');
  const [newPcArtist, setNewPcArtist] = useState('');
  const [newPcImage, setNewPcImage] = useState('');
  const [newPcBackImage, setNewPcBackImage] = useState('');
  const [newPcRarity, setNewPcRarity] = useState<'comun' | 'rara' | 'ultra_rara' | 'preventa_exclusiva'>('rara');

  // Preorder exclusive photocards
  const [preorderBenefitCards, setPreorderBenefitCards] = useState<Photocard[]>([]);
  const [newPreorderPcName, setNewPreorderPcName] = useState('');
  const [newPreorderPcImg, setNewPreorderPcImg] = useState('');

  // Resell modal state
  const [isResellModalOpen, setIsResellModalOpen] = useState(false);
  const [resellItemId, setResellItemId] = useState('');
  const [resalePriceInput, setResalePriceInput] = useState<number>(300);

  // Gift modal state
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [giftItemId, setGiftItemId] = useState('');
  const [giftTargetUser, setGiftTargetUser] = useState('');
  const [giftNote, setGiftNote] = useState('');

  // Restock modal state
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [productToRestock, setProductToRestock] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(20);
  const [restockReason, setRestockReason] = useState<string>('Reposición oficial');

  // Variant modal state
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [productForVariant, setProductForVariant] = useState<Product | null>(null);
  const [varName, setVarName] = useState('');
  const [varType, setVarType] = useState('version');
  const [varPriceCoins, setVarPriceCoins] = useState<number>(1000);
  const [varPriceGems, setVarPriceGems] = useState<number>(10);
  const [varStock, setVarStock] = useState<number>(15);

  // Trade modal state
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeTargetUser, setTradeTargetUser] = useState('');
  const [tradeOfferedItemId, setTradeOfferedItemId] = useState('');
  const [tradeRequestedItemName, setTradeRequestedItemName] = useState('');
  const [tradeNote, setTradeNote] = useState('');
  const [tradeFilter, setTradeFilter] = useState<'all' | 'received' | 'sent'>('all');

  // Inventory tab category filter
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<'all' | 'album' | 'photocard' | 'frame' | 'merch'>('all');

  const canAddOfficial = isPrivileged();

  const handleInitiatePurchase = (prod: Product) => {
    if (prod.stockCount <= 0) {
      showToast('Este producto se encuentra agotado.');
      return;
    }
    setConfirmPurchaseProduct(prod);
  };

  const handleExecutePurchase = async () => {
    if (!confirmPurchaseProduct || isPurchasing) return;
    setIsPurchasing(true);
    try {
      const prod = confirmPurchaseProduct;
      let success = false;
      if (prod.isOutlet) {
        success = await buyOutletProduct(prod.id);
      } else {
        success = await buyProduct(prod.id);
      }
      if (success) {
        setPurchaseReceipt({
          product: prod,
          date: new Date().toLocaleString(),
          amount: prod.currencyType === 'gems' ? (prod.priceGems || 10) : prod.priceCoins,
          currency: prod.currencyType === 'gems' ? 'Gems' : 'Coins'
        });
      }
    } catch {
      showToast('Ocurrió un error al procesar la compra.');
    } finally {
      setIsPurchasing(false);
      setConfirmPurchaseProduct(null);
    }
  };

  // Filter products by mode, search & tag with strict out-of-stock rules
  const filteredProducts = products.filter((p) => {
    // Outlet rule: If stock is 0, completely hide from catalog and search!
    if (p.isOutlet && p.stockCount <= 0) {
      return false;
    }

    if (storeMode === 'official') {
      if (p.isOutlet) return false;
      if (p.category === 'fashion') return false;
    }
    if (storeMode === 'fashion') {
      if (p.isOutlet) return false;
      if (p.category !== 'fashion' && !p.tags.includes('fashion')) return false;
    }
    if (storeMode === 'outlet') {
      if (!p.isOutlet) return false;
    }

    if (filterCategory === 'album' && !p.isAlbum) return false;
    if (filterCategory === 'photocard' && p.category !== 'photocard' && !p.tags.includes('photocard')) return false;
    if (filterCategory === 'frame' && p.category !== 'frame' && !p.frameStyle && !p.tags.includes('marco') && !p.tags.includes('frame')) return false;
    if (filterCategory === 'bundle' && p.category !== 'bundle' && !p.tags.includes('bundle') && !p.tags.includes('paquete')) return false;
    if (filterCategory === 'merch' && (p.isAlbum || p.category === 'frame' || p.category === 'fashion' || p.tags.includes('marco') || p.tags.includes('bundle'))) return false;

    // FILTRO POR BIAS: Al hacer click en el avatar del bias, solo aparecen productos de este artista
    if (selectedBiasArtist) {
      const target = selectedBiasArtist.toLowerCase().trim();
      const matchArtist =
        p.associatedArtists?.some((a) => a.toLowerCase().trim() === target || a.toLowerCase().includes(target)) ||
        p.name.toLowerCase().includes(target) ||
        p.description?.toLowerCase().includes(target) ||
        p.tags?.some((t) => t.toLowerCase().trim() === target);
      if (!matchArtist) return false;
    }

    if (searchFilter) {
      const match =
        p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchFilter.toLowerCase()));
      if (!match) return false;
    }

    if (selectedTag !== 'all') {
      if (!p.tags.includes(selectedTag)) return false;
    }

    return true;
  });

  const handleAddImageUrl = (url: string) => {
    if (!url.trim()) return;
    if (imageUrls.length >= 10) {
      showToast('Límite de 10 imágenes alcanzado.');
      return;
    }
    setImageUrls([...imageUrls, url.trim()]);
    setNewImageUrlInput('');
  };

  const handleTagKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase();
      if (val && !tagsList.includes(val)) {
        setTagsList([...tagsList, val]);
        setTagInput('');
      }
    }
  };

  // Add Photocard to Pool (up to 20) with mandatory backImage support
  const handleAddPhotocardToPool = () => {
    if (!newPcName.trim() || !newPcImage.trim()) {
      showToast('Ingresa el nombre y la imagen frontal de la photocard.');
      return;
    }
    if (photocardsPool.length >= 20) {
      showToast('Máximo 20 photocards permitidas en la colección del álbum.');
      return;
    }
    setPhotocardsPool([
      ...photocardsPool,
      {
        id: 'pc-' + Date.now(),
        name: newPcName.trim(),
        artist: newPcArtist.trim() || 'Artista',
        image: newPcImage.trim(),
        backImage: newPcBackImage.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500',
        rarity: newPcRarity
      }
    ]);
    setNewPcName('');
    setNewPcArtist('');
    setNewPcImage('');
    setNewPcBackImage('');
  };

  // Add Preorder Photocard
  const handleAddPreorderBenefit = () => {
    if (!newPreorderPcName.trim() || !newPreorderPcImg.trim()) return;
    setPreorderBenefitCards([
      ...preorderBenefitCards,
      {
        id: 'pc-pre-' + Date.now(),
        name: newPreorderPcName.trim(),
        artist: 'Exclusiva Preventa',
        image: newPreorderPcImg.trim(),
        backImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500',
        rarity: 'preventa_exclusiva',
        isPreorderBenefit: true
      }
    ]);
    setNewPreorderPcName('');
    setNewPreorderPcImg('');
  };

  // Add Track
  const handleAddTrack = () => {
    if (!newTrackTitle.trim()) return;
    setAlbumTracks([
      ...albumTracks,
      {
        trackNumber: albumTracks.length + 1,
        title: newTrackTitle.trim(),
        duration: newTrackDuration || '3:15',
        versionType: newTrackVersion
      }
    ]);
    setNewTrackTitle('');
  };

  // Bundle product selection helpers
  const handleAddProductToBundle = (productId: string) => {
    if (!productId) return;
    if (bundleSelectedProductIds.includes(productId)) {
      showToast('Este producto ya está añadido al bundle.');
      return;
    }
    const nextIds = [...bundleSelectedProductIds, productId];
    setBundleSelectedProductIds(nextIds);
    const names = nextIds.map((id) => {
      const p = products.find((pr) => pr.id === id);
      if (p) return p.name;
      const s = showcaseItems.find((sc) => sc.id === id);
      if (s) return s.name || s.productName;
      return id;
    });
    setBundleItemsText(names.join(', '));
    showToast('Producto añadido al bundle.');
  };

  const handleAddBundleProductByLink = () => {
    if (!bundleLinkInput.trim()) return;
    let id = bundleLinkInput.trim();
    if (id.includes('#product-')) {
      id = id.split('#product-')[1];
    } else if (id.includes('/product/')) {
      id = id.split('/product/')[1];
    }
    id = id.split('?')[0].split('#')[0].trim();

    if (isOutletBundle) {
      const inShowcase = showcaseItems.find((s) => s.id === id || s.productId === id) ||
        inventory.find((inv) => (userProfile.showcaseItemIds || []).includes(inv.id) && (inv.id === id || inv.productId === id));
      if (!inShowcase) {
        showToast('En el Outlet, solo puedes crear bundles con productos de tu vitrina de merch.');
        return;
      }
      handleAddProductToBundle(inShowcase.id);
    } else {
      const found = products.find((p) => p.id === id);
      if (!found) {
        showToast('No se encontró ningún producto con ese enlace o ID.');
        return;
      }
      handleAddProductToBundle(found.id);
    }
    setBundleLinkInput('');
  };

  const handleRemoveBundleProduct = (idToRemove: string) => {
    const nextIds = bundleSelectedProductIds.filter((id) => id !== idToRemove);
    setBundleSelectedProductIds(nextIds);
    const names = nextIds.map((id) => {
      const p = products.find((pr) => pr.id === id);
      if (p) return p.name;
      const s = showcaseItems.find((sc) => sc.id === id);
      if (s) return s.name || s.productName;
      return id;
    });
    setBundleItemsText(names.join(', '));
  };

  // Submit product creation
  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedStock = Math.max(1, Math.floor(Number(stockCount) || 1));
    if (!stockCount || Number(stockCount) < 1) {
      showToast('Debes seleccionar la cantidad de copias que tendrá este producto (mínimo 1 copia).');
      return;
    }

    // 1. PHOTOCARD PRODUCT CREATION
    if (productType === 'photocard') {
      if (!prodName.trim()) {
        showToast('Ingresa un nombre para la photocard.');
        return;
      }
      if (!pcFrontImage.trim()) {
        showToast('Adjunta una imagen frontal para la photocard.');
        return;
      }

      const artists = pcArtist.trim() ? [pcArtist.trim()] : ['Artista YM-ki'];

      const photocardObj: Photocard = {
        id: 'pc-' + Date.now(),
        name: prodName.trim(),
        artist: pcArtist.trim() || 'Artista YM-ki',
        image: pcFrontImage.trim(),
        backImage: pcBackImage.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
        rarity: pcRarity,
        finishEffect: pcFinishEffect,
        textureUrl: pcTextureUrl.trim() || undefined,
        lightingIntensity: pcLighting,
        brightness: pcBrightness,
        isHolographic: pcFinishEffect === 'holographic'
      };

      addProductToStore({
        name: prodName.trim(),
        description: prodDesc.trim() || `Photocard coleccionable oficial de ${pcArtist} con acabado ${pcFinishEffect === 'holographic' ? 'holográfico' : 'neutral'}.`,
        images: [pcFrontImage.trim(), pcBackImage.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80'],
        tags: ['photocard', pcFinishEffect, pcRarity, ...artists, ...tagsList],
        stockType: 'fixed',
        stockCount: parsedStock,
        associatedArtists: artists,
        currencyType,
        priceCoins,
        priceGems,
        createdBy: userProfile.username,
        isOutlet: false,
        category: 'photocard',
        finishEffect: pcFinishEffect,
        textureUrl: pcTextureUrl.trim() || undefined,
        lightingIntensity: pcLighting,
        brightness: pcBrightness,
        photocardData: photocardObj
      });

      setIsAddModalOpen(false);
      setProdName('');
      setProdDesc('');
      showToast('¡Photocard 3D creada y añadida al catálogo!');
      return;
    }

    // 2. MARCO DE PERFIL (FRAME)
    if (productType === 'frame') {
      if (!prodName.trim()) {
        showToast('Ingresa un nombre para el marco.');
        return;
      }
      const artistsList = associatedArtistsInput
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      const frameImg = frameCustomBorderUrl.trim() || imageUrls[0] || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500';

      addProductToStore({
        name: prodName.trim(),
        description: prodDesc.trim() || 'Marco de perfil coleccionable para avatares en YM-ki.',
        images: [frameImg],
        tags: ['marco', 'frame', 'avatar', frameStyleChoice, ...tagsList],
        stockType: 'fixed',
        stockCount: parsedStock,
        associatedArtists: artistsList,
        currencyType,
        priceCoins,
        priceGems,
        createdBy: userProfile.username,
        isOutlet: false,
        category: 'frame',
        isFrame: true,
        frameStyle: frameStyleChoice,
        frameConfig: {
          style: frameStyleChoice,
          defaultColor: frameDefaultColor,
          transparentImageUrl: frameCustomBorderUrl.trim() || undefined,
          rarity: 'permanente'
        }
      });

      setIsAddModalOpen(false);
      setProdName('');
      setProdDesc('');
      setImageUrls([]);
      showToast('¡Marco de avatar publicado en la tienda!');
      return;
    }

    // 3. BUNDLE / PAQUETE DE PRODUCTOS
    if (productType === 'bundle') {
      if (!prodName.trim()) {
        showToast('Ingresa un nombre para el paquete o bundle.');
        return;
      }

      if (isOutletBundle && bundleSelectedProductIds.length === 0) {
        showToast('Para el Outlet, debes seleccionar artículos de tu vitrina de merch.');
        return;
      }

      const artistsList = associatedArtistsInput
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      const itemsList = bundleSelectedProductIds.length > 0
        ? bundleSelectedProductIds.map((id) => {
            const p = products.find((pr) => pr.id === id);
            if (p) return p.name;
            const s = showcaseItems.find((sc) => sc.id === id);
            if (s) return s.name;
            return id;
          })
        : bundleItemsText.split(',').map((it) => it.trim()).filter(Boolean);

      const bundleImages = imageUrls.length > 0
        ? imageUrls
        : bundleSelectedProductIds.map((id) => {
            const p = products.find((pr) => pr.id === id);
            if (p && p.images && p.images[0]) return p.images[0];
            const s = showcaseItems.find((sc) => sc.id === id);
            if (s && s.image) return s.image;
            return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500';
          }).slice(0, 3);

      addProductToStore({
        name: prodName.trim(),
        description: prodDesc.trim() || `Bundle oficial que incluye: ${itemsList.join(', ')}. Descuento especial del ${bundleDiscount}%.`,
        images: bundleImages.length > 0 ? bundleImages : ['https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500'],
        tags: isOutletBundle ? ['bundle', 'outlet', 'vitrina', ...tagsList] : ['bundle', 'paquete', 'combo', ...tagsList],
        stockType: 'fixed',
        stockCount: parsedStock,
        associatedArtists: artistsList,
        currencyType,
        priceCoins,
        priceGems,
        createdBy: userProfile.username,
        isOutlet: isOutletBundle,
        resellerUsername: isOutletBundle ? userProfile.username : undefined,
        category: isOutletBundle ? 'outlet' : 'bundle',
        isBundle: true,
        bundleItemNames: itemsList,
        bundleProductIds: bundleSelectedProductIds,
        discountPercent: bundleDiscount
      });

      setIsAddModalOpen(false);
      setProdName('');
      setProdDesc('');
      setImageUrls([]);
      setBundleSelectedProductIds([]);
      showToast(isOutletBundle ? '¡Bundle del Outlet publicado!' : '¡Paquete de productos / Bundle publicado!');
      return;
    }

    // 4. GENERAL O ÁLBUM
    if (!prodName.trim()) {
      showToast('Ingresa un nombre para el producto.');
      return;
    }
    if (imageUrls.length === 0) {
      showToast('Adjunta al menos una imagen o portada.');
      return;
    }

    // ALBUM VALIDATIONS AS EXPLICITLY REQUESTED:
    if (productType === 'album') {
      // 1. Price limit validation: "Un album no puede costar mas 20,000 coins"
      if (priceCoins > 20000) {
        showToast('Error: Un álbum no puede costar más de 20,000 Coins.');
        return;
      }

      // 2. Track count validations:
      if (albumType === 'full' && albumTracks.length < 8) {
        showToast(`Error: Un Full Álbum debe tener al menos 8 canciones (actualmente tiene ${albumTracks.length}).`);
        return;
      }

      if (albumType === 'mini' && (albumTracks.length < 4 || albumTracks.length > 7)) {
        showToast(`Error: Un Mini Álbum debe tener entre 4 y 7 canciones (actualmente tiene ${albumTracks.length}).`);
        return;
      }

      if (albumType === 'single') {
        if (albumTracks.length < 1 || albumTracks.length > 3) {
          showToast(`Error: Un Single solo puede tener 1 canción y un máximo de 2 versiones adicionales (1 a 3 pistas en total). Actualmente tiene ${albumTracks.length}.`);
          return;
        }
      }

      // 3. Photocards validation: "Adjuntar un maximo de 20 photocards (fotos)"
      if (photocardsPool.length === 0) {
        showToast('Debes adjuntar al menos 1 photocard para la colección del álbum.');
        return;
      }
      if (photocardsPool.length > 20) {
        showToast('Máximo 20 photocards permitidas.');
        return;
      }
    }

    const artistsList = associatedArtistsInput
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const category = productType === 'album'
      ? 'album'
      : isFashionCategory
      ? 'fashion'
      : 'general';

    addProductToStore({
      name: prodName.trim(),
      description: prodDesc.trim(),
      images: imageUrls,
      tags: productType === 'album' ? [...tagsList, 'álbum', albumType] : tagsList,
      stockType: 'fixed',
      stockCount: parsedStock,
      associatedArtists: artistsList,
      currencyType,
      priceCoins,
      priceGems,
      createdBy: userProfile.username,
      isOutlet: false,
      category,
      isAlbum: productType === 'album',
      albumType: productType === 'album' ? albumType : undefined,
      tracks: productType === 'album' ? albumTracks : undefined,
      photocardsPool: productType === 'album' ? photocardsPool : undefined,
      photocardsPerUnbox: productType === 'album' ? photocardsPerUnbox : undefined,
      isPreorder: productType === 'album' ? isPreorder : false,
      preorderBenefitPhotocards: productType === 'album' && isPreorder ? preorderBenefitCards : undefined
    });

    setIsAddModalOpen(false);
    setProdName('');
    setProdDesc('');
    setImageUrls([]);
    showToast(productType === 'album' ? '¡Álbum oficial creado y publicado!' : 'Producto publicado.');
  };

  const handleResellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resellItemId) return;
    listItemInOutlet(resellItemId, resalePriceInput);
    setIsResellModalOpen(false);
  };

  const handleGiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftItemId || !giftTargetUser.trim()) return;
    giftItemToUser(giftTargetUser.trim(), giftItemId, giftNote.trim());
    setIsGiftModalOpen(false);
    setGiftTargetUser('');
    setGiftNote('');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner - Solid Color */}
      <div className="rounded-2xl p-6 sm:p-8 bg-slate-900 border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Store className="w-3.5 h-3.5" />
            Tienda Oficial, Fashion & Outlet
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Mercancía, Álbumes & Moda
          </h1>
          <p className="text-sm text-slate-300">
            Adquiere álbumes con photocards coleccionables aleatorias, indumentaria de pasarela en la sección Fashion, o vende y compra en el Outlet (recibiendo el 90% de ganancia).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Admin Tools: Vendor Approval Panel & Coupon Manager */}
          {isPrivileged() && (
            <>
              <button
                onClick={() => setIsVendorPanelOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-white font-bold text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow cursor-pointer active:scale-95"
              >
                <Crown className="w-4 h-4 text-amber-400" />
                Proveedores
                {vendorsList.filter((v) => v.status === 'pending').length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                    {vendorsList.filter((v) => v.status === 'pending').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsCouponManagerOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-white font-bold text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow cursor-pointer active:scale-95"
              >
                <Tag className="w-4 h-4 text-indigo-400" />
                Cupones ({discountCoupons.length})
              </button>
            </>
          )}

          {/* User Vendor Application / Status */}
          <button
            onClick={() => setIsApplyVendorOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-white font-bold text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow cursor-pointer active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {myVendorApplication
              ? myVendorApplication.status === 'approved'
                ? 'Proveedor Oficial ✅'
                : myVendorApplication.status === 'pending'
                ? 'Solicitud Proveedor ⏳'
                : 'Reintentar Proveedor'
              : 'Ser Proveedor Oficial'}
          </button>

          {canAddOfficial && (
            <button
              onClick={() => {
                setProductType('general');
                setIsFashionCategory(false);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-bold text-xs bg-indigo-600 hover:bg-indigo-500 shadow cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Nuevo Producto
            </button>
          )}

          {inventory.length > 0 && (
            <>
              <button
                onClick={() => setIsResellModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-bold text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow cursor-pointer active:scale-95"
              >
                <Repeat className="w-4 h-4 text-amber-400" />
                Vender en Outlet (90%)
              </button>

              <button
                onClick={() => setIsGiftModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-bold text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow cursor-pointer active:scale-95"
              >
                <Gift className="w-4 h-4 text-pink-400" />
                Regalar Item
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mode Navigation Tabs (Visible for ALL users) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setStoreMode('official')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer transition active:scale-95 ${
            storeMode === 'official'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          Tienda Oficial
        </button>

        {/* Fashion Section (Visible for ALL users) */}
        <button
          onClick={() => setStoreMode('fashion')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer transition active:scale-95 ${
            storeMode === 'fashion'
              ? 'bg-rose-600 text-white shadow'
              : 'bg-slate-900 text-rose-400 hover:text-white border border-slate-800'
          }`}
        >
          <Shirt className="w-4 h-4" />
          Sección Fashion ({products.filter((p) => p.category === 'fashion').length})
        </button>

        {/* Outlet & Reventa (90% payout) */}
        <button
          onClick={() => setStoreMode('outlet')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer transition active:scale-95 ${
            storeMode === 'outlet'
              ? 'bg-amber-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Repeat className="w-4 h-4 text-amber-400" />
          Outlet & Reventa ({products.filter((p) => p.isOutlet).length})
        </button>

        {/* Mi Inventario Individual */}
        <button
          onClick={() => setStoreMode('inventory')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer transition active:scale-95 ${
            storeMode === 'inventory'
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-slate-900 text-emerald-400 hover:text-white border border-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          Mi Inventario ({inventory.length + (userAlbums?.length || 0) + (userPhotocards?.length || 0)})
        </button>

        {/* Lista de Deseos & Carrito */}
        <button
          onClick={() => setStoreMode('wishlist')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer transition active:scale-95 ${
            storeMode === 'wishlist'
              ? 'bg-pink-600 text-white shadow'
              : 'bg-slate-900 text-pink-400 hover:text-white border border-slate-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          Deseos & Carrito ({userWishlist.length})
        </button>

        {/* Historial de Compras & Transacciones */}
        <button
          onClick={() => setStoreMode('history')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer transition active:scale-95 ${
            storeMode === 'history'
              ? 'bg-cyan-600 text-white shadow'
              : 'bg-slate-900 text-cyan-400 hover:text-white border border-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          Historial ({purchaseHistory.length})
        </button>

        {/* Sistema de Intercambios (Trades) */}
        <button
          onClick={() => setStoreMode('trades')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer transition active:scale-95 ${
            storeMode === 'trades'
              ? 'bg-purple-600 text-white shadow'
              : 'bg-slate-900 text-purple-400 hover:text-white border border-slate-800'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          Intercambios ({tradeOffers.length})
        </button>

        {/* Panel de Administración de Inventario */}
        {canAddOfficial && (
          <button
            onClick={() => setStoreMode('admin_inventory')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer transition active:scale-95 ${
              storeMode === 'admin_inventory'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'bg-slate-900 text-amber-400 hover:text-white border border-slate-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            Panel de Inventario & Reposiciones
          </button>
        )}
      </div>

      {/* Outlet Notice: 90% payout rule */}
      {storeMode === 'outlet' && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Regla del Outlet:</strong> Los usuarios que venden en el Outlet consiguen el <strong>90% de la paga</strong> tras la compra (10% tarifa de plataforma).
            </span>
          </div>
          <span className="font-extrabold text-[11px] bg-amber-500/20 px-2 py-0.5 rounded">
            90% Pago Vendedor
          </span>
        </div>
      )}
      {/* Store Catalog (Official, Fashion, Outlet) */}
      {(storeMode === 'official' || storeMode === 'fashion' || storeMode === 'outlet') && (
        <>
          {/* SECCIÓN DE FILTRADO POR BIASES (Club de Fans -> Tienda) */}
      {userBiases && userBiases.length > 0 ? (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 border border-purple-500/30 shadow-lg space-y-3.5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300">
                <Crown className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  Filtrar Artículos por tus Biases
                  <span className="text-[10px] text-purple-300 font-semibold hidden sm:inline">
                    (Haz clic en su foto de perfil para ver solo sus productos)
                  </span>
                </h3>
              </div>
            </div>

            {selectedBiasArtist && (
              <button
                type="button"
                onClick={() => setSelectedBiasArtist(null)}
                className="self-start sm:self-auto px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer flex items-center gap-1.5 active:scale-95 shadow"
              >
                <X className="w-3.5 h-3.5 text-red-400" />
                Mostrar Todos los Productos
              </button>
            )}
          </div>

          {/* Carrusel horizontal de avatares de Biases */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1.5 scrollbar-thin">
            {userBiases.map((bias) => {
              const isSelected = selectedBiasArtist === bias.artistUsername;
              const roleTitle =
                bias.role === 'bias'
                  ? 'Bias ⭐'
                  : bias.role === 'bias_wrecker'
                  ? 'Bias Wrecker 🔥'
                  : 'Least Bias 💫';
              const ringColor =
                bias.role === 'bias' ? '#f59e0b' : bias.role === 'bias_wrecker' ? '#f43f5e' : '#06b6d4';

              return (
                <button
                  key={`${bias.clubId}-${bias.artistUsername}`}
                  type="button"
                  onClick={() => setSelectedBiasArtist(isSelected ? null : bias.artistUsername)}
                  className={`flex items-center gap-3 p-2.5 pr-4 rounded-2xl border transition active:scale-95 cursor-pointer shrink-0 text-left relative ${
                    isSelected
                      ? 'bg-purple-950/70 border-2 border-amber-400 shadow-xl shadow-purple-500/20 ring-2 ring-amber-400/30'
                      : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 hover:border-slate-700 shadow-sm'
                  }`}
                  title={`Filtrar por ${bias.artistNickname || bias.artistUsername}`}
                >
                  <div className="relative">
                    <img
                      src={bias.artistAvatar}
                      alt={bias.artistNickname}
                      className="w-12 h-12 rounded-full object-cover shadow-md border-2"
                      style={{ borderColor: ringColor }}
                    />
                    <span
                      className="absolute -bottom-1 -right-1 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-black text-white shadow-md flex items-center justify-center"
                      style={{ backgroundColor: ringColor }}
                    >
                      {bias.role === 'bias' ? '⭐' : bias.role === 'bias_wrecker' ? '🔥' : '💫'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white max-w-[130px] truncate block">
                      {bias.artistNickname || bias.artistUsername}
                    </span>
                    <span
                      className="text-[10px] font-bold block"
                      style={{ color: ringColor }}
                    >
                      {roleTitle}
                    </span>
                    <span className="text-[9px] text-slate-400 block truncate max-w-[130px]">
                      {bias.clubName}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-1" />
                  )}
                </button>
              );
            })}
          </div>

          {selectedBiasArtist && (
            <div className="text-xs text-amber-300 font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 border-t border-purple-500/20">
              <span className="flex items-center gap-1.5">
                <span>🎯</span>
                <span>
                  Filtro activo: Mostrando únicamente productos asociados a <strong>@{selectedBiasArtist}</strong>
                </span>
              </span>
              <span className="text-[11px] text-slate-400">
                {filteredProducts.length} producto(s) encontrado(s)
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">💡</span>
            <span>
              <strong>Filtro por Biases:</strong> Visita la sección <strong>Club de Fans</strong> y añade a tus artistas favoritos como <strong>Bias</strong>, <strong>Bias Wrecker</strong> o <strong>Least Bias</strong> para filtrar aquí sus productos exclusivos con un solo clic.
            </span>
          </div>
        </div>
      )}

      {/* Subcategory Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'album', label: 'Álbumes 💿' },
          { id: 'photocard', label: 'Photocards 🎴' },
          { id: 'frame', label: 'Marcos de Perfil 🎨' },
          { id: 'bundle', label: 'Paquetes / Bundles 🎁' },
          { id: 'merch', label: 'Merchandising ✨' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
              filterCategory === cat.id
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredProducts.map((p) => {
          const isAlbum = p.isAlbum;
          const isPre = p.isPreorder;
          const isOutOfStock = p.stockCount <= 0;
          const isDeletable = isPrivileged() || p.createdBy === currentUser || p.resellerUsername === currentUser;
          const isFrame = p.category === 'frame' || Boolean(p.frameStyle) || p.tags.includes('marco');
          const isInWishlist = userWishlist.some((w) => w.productId === p.id);

          return (
            <div
              key={p.id}
              onClick={() => setSelectedProductForDetails(p)}
              className={`bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between transition hover:border-indigo-500/50 hover:shadow-lg relative group cursor-pointer ${
                isOutOfStock ? 'opacity-80 grayscale-[25%]' : ''
              }`}
            >
              <div>
                <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  {/* Out of Stock Overlay Badge */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="bg-red-600/90 text-white font-black text-xs px-3 py-1 rounded-xl shadow-lg uppercase tracking-wider border border-red-400/40">
                        AGOTADO
                      </span>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
                    {isAlbum && (
                      <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow uppercase">
                        {p.albumType} Álbum
                      </span>
                    )}
                    {isPre && (
                      <span className="bg-pink-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow uppercase">
                        Preventa
                      </span>
                    )}
                    {p.category === 'fashion' && (
                      <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow uppercase">
                        Fashion
                      </span>
                    )}
                    {p.category === 'photocard' && (
                      <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow uppercase flex items-center gap-1">
                        <RotateCw className="w-2.5 h-2.5" />
                        Photocard 3D
                      </span>
                    )}
                    {p.category === 'bundle' && (
                      <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow uppercase">
                        Bundle 🎁
                      </span>
                    )}
                    {isFrame && (
                      <span className="bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow uppercase">
                        Marco Avatar
                      </span>
                    )}
                    {p.isOutlet && (
                      <span className="bg-amber-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow uppercase">
                        Outlet (90%)
                      </span>
                    )}
                  </div>

                  {/* Top Right Action Overlay: Wishlist + Delete */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const link = `${window.location.origin}?section=store&product=${p.id}`;
                        navigator.clipboard.writeText(link).then(() => {
                          showToast('¡Enlace del artículo copiado al portapapeles!');
                        }).catch(() => {
                          showToast(`ID del producto: ${p.id}`);
                        });
                      }}
                      title="Copiar enlace de este artículo"
                      className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-md transition active:scale-90 cursor-pointer"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isInWishlist) {
                          removeFromWishlist(p.id);
                        } else {
                          addToWishlist(p.id);
                        }
                      }}
                      title={isInWishlist ? 'Quitar de lista de deseos' : 'Guardar en lista de deseos'}
                      className={`p-2 rounded-xl backdrop-blur-md transition active:scale-90 cursor-pointer ${
                        isInWishlist
                          ? 'bg-pink-600 text-white shadow-lg'
                          : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-pink-400 border border-slate-700/60'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isInWishlist ? 'fill-current' : ''}`} />
                    </button>

                    {isDeletable && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProductToDelete(p);
                        }}
                        title="Eliminar producto de la tienda"
                        className="p-2 rounded-xl bg-red-600/90 hover:bg-red-600 text-white shadow-lg transition active:scale-90 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-extrabold text-white line-clamp-1 group-hover:text-indigo-300 transition">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {p.description}
                  </p>

                  {isAlbum && (
                    <div className="text-[11px] text-indigo-400 font-bold flex items-center gap-2 pt-1">
                      <Disc className="w-3.5 h-3.5" />
                      <span>{p.tracks?.length || 0} tracks</span>
                      <span>•</span>
                      <span>{p.photocardsPerUnbox || 2} photocards al abrir</span>
                    </div>
                  )}

                  {p.category === 'bundle' && p.bundleItemNames && p.bundleItemNames.length > 0 && (
                    <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 pt-1">
                      <span>🎁 Incluye {p.bundleItemNames.length} artículos</span>
                      {p.discountPercent ? <span className="text-amber-400">(-{p.discountPercent}%)</span> : null}
                    </div>
                  )}

                  {p.isOutlet && p.resellerUsername && (
                    <div className="text-[11px] text-amber-400 font-semibold">
                      Vendedor: @{p.resellerUsername}
                    </div>
                  )}

                  {/* Stock Copies Indicator & Low Stock Warning */}
                  <div className="pt-1 flex items-center gap-2">
                    {p.stockCount > 0 && p.stockCount <= 5 ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                        ¡Últimas {p.stockCount} {p.stockCount === 1 ? 'copia' : 'copias'}!
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {p.stockCount > 0 ? `${p.stockCount} copias disponibles` : 'Sin stock'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 pt-0" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-sm font-extrabold">
                    {p.currencyType === 'gems' ? (
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Sparkles className="w-4 h-4" />
                        {p.priceGems?.toLocaleString() || 10} Gems
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400">
                        <Coins className="w-4 h-4" />
                        {p.priceCoins.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Photocard 3D interactive viewer trigger */}
                    {(p.category === 'photocard' || p.photocardData) && (
                      <button
                        type="button"
                        onClick={() => setViewing3DProduct(p)}
                        title="Ver Photocard en 3D interactivo"
                        className="p-2 rounded-xl text-xs font-bold text-pink-300 hover:text-white bg-pink-950/60 hover:bg-pink-900 border border-pink-500/30 cursor-pointer transition active:scale-95 flex items-center gap-1 shadow"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-pink-400" />
                        <span className="text-[11px] font-black">3D</span>
                      </button>
                    )}

                    {isFrame && (
                      <button
                        type="button"
                        onClick={() => setPreviewingFrameProduct(p)}
                        title="Probar en mi Avatar en tiempo real"
                        className="p-2 rounded-xl text-xs font-bold text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 cursor-pointer transition active:scale-95 flex items-center gap-1"
                      >
                        <Palette className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px]">Probar</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedProductForDetails(p)}
                      title="Ver detalles completos y reseñas"
                      className="p-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer transition active:scale-95"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      disabled={isOutOfStock}
                      onClick={() => {
                        if (isOutOfStock) return;
                        handleInitiatePurchase(p);
                      }}
                      style={!isOutOfStock ? { backgroundColor: primaryButtonColor } : undefined}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 shadow ${
                        isOutOfStock
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          : 'text-white cursor-pointer hover:opacity-90'
                      }`}
                    >
                      {isOutOfStock ? 'Agotado' : isAlbum ? 'Comprar' : 'Comprar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-sm">
              No se encontraron productos en esta sección.
            </div>
          )}
        </>
      )}

      {/* VIEW: MI INVENTARIO INDIVIDUAL */}
      {storeMode === 'inventory' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header & Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase text-emerald-400 tracking-wider">
                <Package className="w-4 h-4" /> Mi Inventario Personal
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1">Colección de Artículos & Merch</h2>
              <p className="text-xs text-slate-400">
                Tienes {inventory.length + (userAlbums?.length || 0) + (userPhotocards?.length || 0)} artículo(s) guardados en tu cuenta.
              </p>
            </div>

            {/* Sub-filter chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'album', label: 'Álbumes 💿' },
                { id: 'photocard', label: 'Photocards 🎴' },
                { id: 'frame', label: 'Marcos 🎨' },
                { id: 'merch', label: 'Merch & Ropa ✨' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setInventoryCategoryFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                    inventoryCategoryFilter === f.id
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inventory Items Grid */}
          {inventory.length === 0 && (userAlbums?.length || 0) === 0 && (userPhotocards?.length || 0) === 0 ? (
            <div className="text-center py-16 bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <Package className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-white">Tu inventario está vacío</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Aún no has adquirido ningún álbum, photocard o artículo oficial. Explora la tienda para comenzar tu colección.
                </p>
              </div>
              <button
                onClick={() => setStoreMode('official')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow active:scale-95 cursor-pointer"
              >
                Ir a la Tienda Oficial
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {inventory
                .filter((item) => {
                  if (inventoryCategoryFilter === 'all') return true;
                  if (inventoryCategoryFilter === 'album') return item.isAlbum || item.category === 'album';
                  if (inventoryCategoryFilter === 'photocard') return item.category === 'photocard' || item.photocardData;
                  if (inventoryCategoryFilter === 'frame') return item.category === 'frame' || item.frameStyle;
                  if (inventoryCategoryFilter === 'merch') return !item.isAlbum && item.category !== 'photocard' && item.category !== 'frame';
                  return true;
                })
                .map((item) => {
                  const isInShowcase = (userProfile.showcaseItemIds || []).includes(item.id);
                  const isFrame = item.category === 'frame' || !!item.frameStyle;
                  const isAlbumItem = item.isAlbum || item.category === 'album';

                  return (
                    <div
                      key={item.id}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between transition group"
                    >
                      <div>
                        <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500'}
                            alt={item.productName || item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {isInShowcase && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-pink-500 text-white shadow">
                                En Vitrina ✨
                              </span>
                            )}
                            {item.isListedInOutlet && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-slate-950 shadow">
                                En Outlet (${item.outletPrice} Coins)
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-3.5 space-y-1.5">
                          <h4 className="text-xs font-black text-white line-clamp-1">{item.productName || item.name}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{item.description || 'Artículo en tu inventario'}</p>
                          <span className="text-[10px] text-slate-500 block">
                            Adquirido: {item.purchasedAt ? new Date(item.purchasedAt).toLocaleDateString() : 'Recientemente'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-3.5 pt-0 border-t border-slate-800/80 mt-2 flex flex-col gap-1.5">
                        {isFrame && (
                          <button
                            onClick={() => {
                              updateCustomization({ frameStyle: item.frameStyle || 'cyber_neon' });
                              showToast('¡Marco equipado en tu avatar!');
                            }}
                            className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Palette className="w-3.5 h-3.5" /> Equipar Marco
                          </button>
                        )}

                        {isAlbumItem && (
                          <button
                            onClick={() => {
                              const cards = openAlbum(item.id);
                              showToast(`¡Álbum abierto! Obtuviste ${cards.length} photocards coleccionables.`);
                            }}
                            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Disc className="w-3.5 h-3.5" /> Abrir Álbum (Unbox)
                          </button>
                        )}

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => toggleShowcaseItem(item.id)}
                            className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition cursor-pointer active:scale-95 text-center ${
                              isInShowcase
                                ? 'bg-pink-950/60 text-pink-300 border border-pink-500/40'
                                : 'bg-slate-800 text-slate-300 hover:text-white'
                            }`}
                          >
                            {isInShowcase ? 'Quitar Vitrina' : '+ Vitrina'}
                          </button>

                          <button
                            onClick={() => {
                              setResellItemId(item.id);
                              setResalePriceInput(item.pricePaid ? Math.round(item.pricePaid * 0.9) : 300);
                              setIsResellModalOpen(true);
                            }}
                            className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-amber-950/60 text-amber-300 hover:bg-amber-900 border border-amber-500/40 transition cursor-pointer active:scale-95 text-center"
                          >
                            Outlet 90%
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => {
                              setGiftItemId(item.id);
                              setIsGiftModalOpen(true);
                            }}
                            className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer active:scale-95 text-center flex items-center justify-center gap-1"
                          >
                            <Gift className="w-3 h-3 text-pink-400" /> Regalar
                          </button>

                          <button
                            onClick={() => {
                              setTradeOfferedItemId(item.id);
                              setIsTradeModalOpen(true);
                            }}
                            className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-purple-950/60 hover:bg-purple-900 text-purple-300 border border-purple-500/40 transition cursor-pointer active:scale-95 text-center flex items-center justify-center gap-1"
                          >
                            <ArrowRightLeft className="w-3 h-3 text-purple-400" /> Trade
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

      {/* VIEW: LISTA DE DESEOS & CARRITO */}
      {storeMode === 'wishlist' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase text-pink-400 tracking-wider">
                <Heart className="w-4 h-4" /> Lista de Deseos & Carrito
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1">Tus Artículos Guardados</h2>
              <p className="text-xs text-slate-400">
                Monitorea existencias, precios y promociones exclusivas para tu selección de compras.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                {userWishlist.length} artículo(s)
              </span>
            </div>
          </div>

          {userWishlist.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center mx-auto text-pink-400">
                <Heart className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-white">Tu lista de deseos está vacía</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Haz clic en el corazón de cualquier artículo de la tienda para guardarlo aquí y comprarlo en cualquier momento.
                </p>
              </div>
              <button
                onClick={() => setStoreMode('official')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow active:scale-95 cursor-pointer"
              >
                Explorar Tienda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userWishlist.map((wish) => {
                const prod = products.find((p) => p.id === wish.productId);
                const title = wish.productName || prod?.name || 'Artículo Guardado';
                const image = wish.productImage || prod?.images?.[0] || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500';
                const priceCoins = wish.priceCoins ?? prod?.priceCoins ?? 1000;
                const isOutOfStock = prod ? prod.stockCount <= 0 : false;

                return (
                  <div
                    key={wish.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4 justify-between shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <img src={image} alt={title} className="w-16 h-16 rounded-xl object-cover border border-slate-800" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-white line-clamp-1">{title}</h4>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                          <Coins className="w-3.5 h-3.5" />
                          <span>{priceCoins.toLocaleString()} Coins</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isOutOfStock ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-400'
                          }`}
                        >
                          {isOutOfStock ? 'Agotado temporalmente' : 'En Stock ✓'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => {
                          if (prod) {
                            setSelectedProductForDetails(prod);
                          } else {
                            buyProductAtomic(wish.productId);
                          }
                        }}
                        disabled={isOutOfStock}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                          isOutOfStock
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow'
                        }`}
                      >
                        Comprar
                      </button>

                      <button
                        onClick={() => removeFromWishlist(wish.productId)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 text-xs font-bold transition cursor-pointer text-center"
                        title="Quitar de deseos"
                      >
                        <Trash2 className="w-3.5 h-3.5 mx-auto" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW: HISTORIAL DE COMPRAS & TRANSACCIONES */}
      {storeMode === 'history' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header & Metrics */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase text-cyan-400 tracking-wider">
                  <History className="w-4 h-4" /> Historial de Compras & Transacciones
                </div>
                <h2 className="text-xl font-extrabold text-white mt-1">Registro de Pedidos Verificados</h2>
                <p className="text-xs text-slate-400">
                  Todas las compras realizadas con Coins o Gems en la tienda oficial, sección fashion y outlet.
                </p>
              </div>

              <span className="text-xs font-bold text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                {purchaseHistory.length} transacciones registradas
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-bold block">Total de Compras</span>
                <span className="text-lg font-black text-white">{purchaseHistory.length}</span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-bold block">Total Invertido en Coins</span>
                <span className="text-lg font-black text-amber-400">
                  {purchaseHistory
                    .filter((p) => p.currencyUsed === 'coins')
                    .reduce((a, b) => a + (b.totalPaid || 0), 0)
                    .toLocaleString()}{' '}
                  Coins
                </span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-bold block">Total Invertido en Gems</span>
                <span className="text-lg font-black text-cyan-400">
                  {purchaseHistory
                    .filter((p) => p.currencyUsed === 'gems')
                    .reduce((a, b) => a + (b.totalPaid || 0), 0)
                    .toLocaleString()}{' '}
                  Gems
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          {purchaseHistory.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
              <History className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-extrabold text-white">Sin compras registradas</h3>
              <p className="text-xs text-slate-400">Tus transacciones de compra aparecerán registradas en este panel.</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5 font-bold">Fecha & Hora</th>
                      <th className="p-3.5 font-bold">Artículo Adquirido</th>
                      <th className="p-3.5 font-bold">Cantidad</th>
                      <th className="p-3.5 font-bold">Moneda / Total</th>
                      <th className="p-3.5 font-bold">Cupón</th>
                      <th className="p-3.5 font-bold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {purchaseHistory.map((pur) => (
                      <tr key={pur.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 text-slate-400">
                          {pur.purchasedAt ? new Date(pur.purchasedAt).toLocaleString() : 'Reciente'}
                        </td>
                        <td className="p-3.5 font-bold text-white">{pur.productName}</td>
                        <td className="p-3.5">{pur.quantity || 1}x</td>
                        <td className="p-3.5 font-bold">
                          {pur.currencyUsed === 'gems' ? (
                            <span className="text-cyan-400">{pur.totalPaid} Gems</span>
                          ) : (
                            <span className="text-amber-400">{pur.totalPaid.toLocaleString()} Coins</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {pur.couponCode ? (
                            <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold text-[10px]">
                              {pur.couponCode}
                            </span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                            <CheckCircle2 className="w-3 h-3" /> Verificado
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: SISTEMA DE INTERCAMBIOS (TRADES) */}
      {storeMode === 'trades' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase text-purple-400 tracking-wider">
                <ArrowRightLeft className="w-4 h-4" /> Sistema de Intercambios
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1">Intercambio de Artículos & Photocards</h2>
              <p className="text-xs text-slate-400">
                Propón intercambios directos con otros usuarios y completa tu colección sin intermediarios.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTradeModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Proponer Intercambio
              </button>
            </div>
          </div>

          {/* Subtabs: All, Received, Sent */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            {[
              { id: 'all', label: `Todos (${tradeOffers.length})` },
              {
                id: 'received',
                label: `Recibidos (${tradeOffers.filter((t) => t.toUser.toLowerCase() === currentUser?.toLowerCase()).length})`
              },
              {
                id: 'sent',
                label: `Enviados (${tradeOffers.filter((t) => t.fromUser.toLowerCase() === currentUser?.toLowerCase()).length})`
              }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTradeFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                  tradeFilter === tab.id
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Trade Offers List */}
          {tradeOffers.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
                <ArrowRightLeft className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-white">Sin intercambios activos</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Propón un intercambio ofreciendo cualquier artículo de tu inventario a cambio de uno que desees.
                </p>
              </div>
              <button
                onClick={() => setIsTradeModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow active:scale-95 cursor-pointer"
              >
                Proponer Primer Trade
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tradeOffers
                .filter((offer) => {
                  if (tradeFilter === 'received') return offer.toUser.toLowerCase() === currentUser?.toLowerCase();
                  if (tradeFilter === 'sent') return offer.fromUser.toLowerCase() === currentUser?.toLowerCase();
                  return true;
                })
                .map((offer) => {
                  const isRecipient = offer.toUser.toLowerCase() === currentUser?.toLowerCase();
                  const isPending = offer.status === 'pending';

                  return (
                    <div
                      key={offer.id}
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Header users */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-300">
                            De: <strong className="text-purple-400">@{offer.fromUser}</strong> → Para:{' '}
                            <strong className="text-indigo-400">@{offer.toUser}</strong>
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              offer.status === 'accepted'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : offer.status === 'declined'
                                ? 'bg-red-950 text-red-400 border border-red-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {offer.status === 'accepted' ? 'Aceptado ✓' : offer.status === 'declined' ? 'Rechazado ✕' : 'Pendiente ⏳'}
                          </span>
                        </div>

                        {/* Trade Visual */}
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Ofrece:</span>
                            <span className="font-extrabold text-white block">{offer.offeredItemName}</span>
                          </div>
                          <ArrowRightLeft className="w-5 h-5 text-purple-400 flex-shrink-0" />
                          <div className="space-y-1 text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Pide a cambio:</span>
                            <span className="font-extrabold text-amber-400 block">{offer.requestedItemName}</span>
                          </div>
                        </div>

                        {offer.note && (
                          <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
                            "{offer.note}"
                          </p>
                        )}
                      </div>

                      {/* Action buttons if current user is recipient and offer is pending */}
                      {isRecipient && isPending && (
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                          <button
                            onClick={() => respondToTradeOffer(offer.id, 'accepted')}
                            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition active:scale-95 cursor-pointer text-center"
                          >
                            Aceptar Intercambio
                          </button>
                          <button
                            onClick={() => respondToTradeOffer(offer.id, 'declined')}
                            className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-400 font-bold text-xs transition active:scale-95 cursor-pointer text-center"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* VIEW: PANEL DE ADMINISTRACIÓN DE INVENTARIO */}
      {storeMode === 'admin_inventory' && canAddOfficial && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header & Metrics */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase text-amber-400 tracking-wider">
                  <Boxes className="w-4 h-4" /> Panel de Control de Inventario & Reposiciones
                </div>
                <h2 className="text-xl font-extrabold text-white mt-1">Gestión Centralizada de Stock & Variantes</h2>
                <p className="text-xs text-slate-400">
                  Supervisa existencias, repón unidades agotadas, crea variantes de edición y audita el historial de movimientos.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setProductType('general');
                    setIsAddModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Nuevo Producto
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-bold block">Total de Productos</span>
                <span className="text-lg font-black text-white">{products.length}</span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-bold block">Productos Agotados</span>
                <span className="text-lg font-black text-rose-400">
                  {products.filter((p) => p.stockCount <= 0).length}
                </span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-bold block">Unidades en Stock</span>
                <span className="text-lg font-black text-emerald-400">
                  {products.reduce((a, b) => a + (b.stockCount || 0), 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-bold block">Movimientos Auditados</span>
                <span className="text-lg font-black text-amber-400">{inventoryMovements.length}</span>
              </div>
            </div>
          </div>

          {/* Products Stock Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-400" />
                Catálogo de Productos & Reposición
              </h3>
              <span className="text-xs text-slate-400">{products.length} productos listados</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 font-bold">Producto</th>
                    <th className="p-3.5 font-bold">Categoría</th>
                    <th className="p-3.5 font-bold">Precio</th>
                    <th className="p-3.5 font-bold">Stock Actual</th>
                    <th className="p-3.5 font-bold">Variantes</th>
                    <th className="p-3.5 font-bold text-right">Acciones de Inventario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {products.map((p) => {
                    const isOutOfStock = p.stockCount <= 0;
                    const variants = productVariants[p.id] || [];

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={p.images?.[0] || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500'}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-800"
                            />
                            <div>
                              <span className="font-extrabold text-white block">{p.name}</span>
                              <span className="text-[10px] text-slate-500">ID: {p.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 uppercase text-[10px] text-slate-400 font-bold">{p.category}</td>
                        <td className="p-3.5 font-bold text-amber-400">
                          {p.currencyType === 'gems' ? `${p.priceGems} Gems` : `${p.priceCoins.toLocaleString()} Coins`}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-black ${
                              isOutOfStock
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : p.stockCount <= 5
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {isOutOfStock ? '0 AGOTADO' : `${p.stockCount} uds.`}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {variants.length > 0 ? (
                            <div className="space-y-1">
                              {variants.map((v) => (
                                <span
                                  key={v.id}
                                  className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-950 text-slate-300 border border-slate-800 mr-1"
                                >
                                  {v.name} ({v.stockCount} uds)
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-600">Sin variantes</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setProductToRestock(p);
                                setRestockAmount(20);
                                setIsRestockModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-[11px] transition active:scale-95 cursor-pointer shadow"
                            >
                              + Reponer Stock
                            </button>

                            <button
                              onClick={() => {
                                setProductForVariant(p);
                                setVarName('');
                                setVarPriceCoins(p.priceCoins);
                                setIsVariantModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-[11px] transition active:scale-95 cursor-pointer border border-slate-700"
                            >
                              + Variante
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Movements Log Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Historial de Movimientos de Inventario (Auditoría)
              </h3>
              <span className="text-xs text-slate-400">{inventoryMovements.length} movimientos</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3 font-bold">Fecha</th>
                    <th className="p-3 font-bold">Tipo</th>
                    <th className="p-3 font-bold">Cantidad</th>
                    <th className="p-3 font-bold">Stock Ant. → Nuevo</th>
                    <th className="p-3 font-bold">Motivo</th>
                    <th className="p-3 font-bold">Responsable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {inventoryMovements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 text-slate-400">
                        {mov.createdAt ? new Date(mov.createdAt).toLocaleString() : 'Reciente'}
                      </td>
                      <td className="p-3 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-black ${
                            mov.movementType === 'restock'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : mov.movementType === 'purchase'
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {mov.movementType}
                        </span>
                      </td>
                      <td className="p-3 font-bold">{mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}</td>
                      <td className="p-3 font-mono text-slate-400">
                        {mov.previousStock} → <strong className="text-white">{mov.newStock}</strong>
                      </td>
                      <td className="p-3 text-slate-300">{mov.reason || 'Sin motivo especificado'}</td>
                      <td className="p-3 font-bold text-slate-400">@{mov.createdBy || 'Sistema'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div
            className={`bg-slate-900 border border-slate-800 rounded-3xl w-full p-5 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto animate-fadeIn ${
              productType === 'photocard' || productType === 'frame' ? 'max-w-5xl' : 'max-w-2xl'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-400" />
                  {productType === 'photocard' && 'Crear Photocard 3D para el Mercado'}
                  {productType === 'album' && 'Crear Nuevo Álbum Musical Oficial'}
                  {productType === 'bundle' && 'Crear Paquete de Productos / Bundle'}
                  {productType === 'frame' && 'Crear Marco de Perfil para la Tienda'}
                  {productType === 'general' && 'Publicar Producto General en Tienda'}
                </h3>
                <p className="text-xs text-slate-400">Panel exclusivo para administradores de YM-ki.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector de Tipo de Producto (Requerido: general, album, photocard, bundle, frame) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Selecciona el Tipo de Producto
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setProductType('general')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 text-center flex items-center justify-center gap-1 ${
                    productType === 'general'
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span>📦</span>
                  <span>General</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProductType('album')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 text-center flex items-center justify-center gap-1 ${
                    productType === 'album'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span>💿</span>
                  <span>Álbum</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProductType('photocard')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 text-center flex items-center justify-center gap-1 ${
                    productType === 'photocard'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg ring-1 ring-pink-400/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span>🎴</span>
                  <span>Photocard 3D</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProductType('bundle')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 text-center flex items-center justify-center gap-1 ${
                    productType === 'bundle'
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span>🎁</span>
                  <span>Bundle</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProductType('frame')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 text-center flex items-center justify-center gap-1 ${
                    productType === 'frame'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg ring-1 ring-purple-400/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span>🖼️</span>
                  <span>Marco</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateProductSubmit} className="space-y-4">
              {/* CASO 1: CREACIÓN DE PHOTOCARD 3D CON VISTA PREVIA Y CONTROLES DINÁMICOS */}
              {productType === 'photocard' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Columna Izquierda: Formulario de Configuración */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Nombre y Artista */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">
                          Nombre de la Photocard *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Photocard Especial Miki Holográfica"
                          value={prodName}
                          onChange={(e) => setProdName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">
                          Artista Representado *
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            required
                            placeholder="Nombre del artista..."
                            value={pcArtist}
                            onChange={(e) => setPcArtist(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                          />
                          <select
                            onChange={(e) => {
                              if (e.target.value) setPcArtist(e.target.value);
                            }}
                            className="px-2 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs cursor-pointer"
                            defaultValue=""
                          >
                            <option value="" disabled>Elegir</option>
                            <option value="Hana Star">Hana</option>
                            <option value="Minji Dream">Minji</option>
                            <option value="Ren Beat">Ren</option>
                            <option value="Kai Voltage">Kai</option>
                            <option value="Sora Dance">Sora</option>
                            <option value="Jin Vocal">Jin</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Rareza y Precio */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Rareza</label>
                        <select
                          value={pcRarity}
                          onChange={(e) => setPcRarity(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                        >
                          <option value="comun">Común ⚪</option>
                          <option value="rara">Rara 🟣</option>
                          <option value="ultra_rara">Ultra Rara 🟡</option>
                          <option value="preventa_exclusiva">Preventa Exclusiva 💖</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Precio en Coins</label>
                        <input
                          type="number"
                          min={50}
                          value={priceCoins}
                          onChange={(e) => setPriceCoins(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Stock Inicial</label>
                        <input
                          type="number"
                          min={1}
                          value={stockCount}
                          onChange={(e) => setStockCount(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                        />
                      </div>
                    </div>

                    {/* Imágenes Frontal y Trasera */}
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-extrabold text-slate-300">
                            Imagen Frontal (Foto del Artista) *
                          </label>
                          <FileUploadButton
                            onUploadSuccess={(url) => setPcFrontImage(url)}
                            label="Subir foto frontal"
                            className="scale-90 origin-right"
                          />
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="https://images.unsplash.com/ o sube tu foto..."
                          value={pcFrontImage}
                          onChange={(e) => setPcFrontImage(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-extrabold text-slate-300">
                            Imagen Trasera / Reverso 3D
                          </label>
                          <FileUploadButton
                            onUploadSuccess={(url) => setPcBackImage(url)}
                            label="Subir reverso"
                            className="scale-90 origin-right"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="URL del reverso oficial o sube tu foto..."
                          value={pcBackImage}
                          onChange={(e) => setPcBackImage(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    </div>

                    {/* REQUERIMIENTO: SELECCIÓN DE EFECTO (HOLOGRÁFICO O NEUTRAL) */}
                    <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider block">
                        Efecto de Acabado de la Photocard
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPcFinishEffect('holographic')}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition active:scale-95 ${
                            pcFinishEffect === 'holographic'
                              ? 'bg-gradient-to-br from-pink-950/70 via-purple-900/50 to-indigo-950/70 border-pink-500 shadow-md ring-2 ring-pink-500/20'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-extrabold text-white">
                            <span>🌈</span>
                            <span>Efecto Holográfico</span>
                          </div>
                          <p className="text-[10px] text-pink-300 mt-1">
                            Reflejos prismáticos iridiscentes y destello metálico al rotar.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPcFinishEffect('neutral')}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition active:scale-95 ${
                            pcFinishEffect === 'neutral'
                              ? 'bg-slate-800 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-extrabold text-white">
                            <span>🛡️</span>
                            <span>Acabado Neutral / Mate</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Acabado fotográfico sobrio, libre de brillos prismáticos.
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* REQUERIMIENTO: HERRAMIENTA DE CARGA DE IMÁGENES PARA TEXTURIZAR EL EFECTO */}
                    <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-pink-400" />
                          Textura del Efecto Holográfico
                        </label>
                        <FileUploadButton
                          onUploadSuccess={(url) => setPcTextureUrl(url)}
                          label="Subir textura desde PC"
                          className="scale-90 origin-right"
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="O pega URL de textura (PNG/JPG transparente)..."
                        value={pcTextureUrl}
                        onChange={(e) => setPcTextureUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      />

                      {/* Presets rápidos de texturas */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[11px] text-slate-400 font-semibold block">
                          Presets de texturas disponibles:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_TEXTURES.map((preset) => {
                            const isSelected = pcTextureUrl === preset.url;
                            return (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => setPcTextureUrl(preset.url)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer active:scale-95 flex items-center gap-1 ${
                                  isSelected
                                    ? 'bg-pink-600 border-pink-400 text-white shadow'
                                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                                }`}
                              >
                                {preset.name}
                              </button>
                            );
                          })}
                          {pcTextureUrl && (
                            <button
                              type="button"
                              onClick={() => setPcTextureUrl('')}
                              className="px-2 py-1 rounded-lg text-[11px] text-red-400 hover:text-white bg-red-950/40 border border-red-800/60 cursor-pointer"
                            >
                              ✕ Quitar textura
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* REQUERIMIENTO: CONTROLES DE ILUMINACIÓN Y BRILLO AJUSTABLES */}
                    <div className="space-y-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider block">
                          Controles de Iluminación y Brillo
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setPcLighting(100);
                            setPcBrightness(100);
                          }}
                          className="text-[10px] text-indigo-400 hover:text-white underline cursor-pointer"
                        >
                          Restablecer 100%
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Iluminación */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-300 font-semibold">Intensidad de Luz:</span>
                            <span className="font-extrabold text-amber-300">{pcLighting}%</span>
                          </div>
                          <input
                            type="range"
                            min={20}
                            max={200}
                            value={pcLighting}
                            onChange={(e) => setPcLighting(Number(e.target.value))}
                            className="w-full accent-amber-400 cursor-pointer"
                          />
                        </div>

                        {/* Brillo */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-300 font-semibold">Brillo Global:</span>
                            <span className="font-extrabold text-pink-300">{pcBrightness}%</span>
                          </div>
                          <input
                            type="range"
                            min={50}
                            max={150}
                            value={pcBrightness}
                            onChange={(e) => setPcBrightness(Number(e.target.value))}
                            className="w-full accent-pink-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Descripción Opcional</label>
                      <textarea
                        rows={2}
                        placeholder="Detalles sobre esta edición especial de la photocard..."
                        value={prodDesc}
                        onChange={(e) => setProdDesc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Columna Derecha: Vista Previa 3D Dinámica Interactiva */}
                  <div className="lg:col-span-5 lg:sticky lg:top-2 space-y-3">
                    <div className="p-4 rounded-3xl bg-slate-950/90 border border-purple-500/30 shadow-2xl flex flex-col items-center justify-center space-y-3">
                      <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-xs font-extrabold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                          <RotateCw className="w-3.5 h-3.5 text-pink-400 animate-spin-slow" />
                          Vista Previa 3D en Vivo
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          {pcFinishEffect === 'holographic' ? 'Holográfica' : 'Neutral'}
                        </span>
                      </div>

                      {/* Visor 3D con controles y rotación */}
                      <Photocard3DViewer
                        photocard={{
                          id: 'create-pc-preview',
                          name: prodName || 'Vista Previa Photocard',
                          artist: pcArtist || 'Artista YM-ki',
                          image: pcFrontImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&fit=crop',
                          backImage: pcBackImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500',
                          rarity: pcRarity,
                          finishEffect: pcFinishEffect,
                          textureUrl: pcTextureUrl.trim() || undefined,
                          lightingIntensity: pcLighting,
                          brightness: pcBrightness,
                          isHolographic: pcFinishEffect === 'holographic'
                        }}
                        interactive={true}
                        showControls={true}
                        defaultLighting={pcLighting}
                        defaultBrightness={pcBrightness}
                        defaultFinish={pcFinishEffect}
                        defaultTexture={pcTextureUrl}
                        onLightingChange={(v) => setPcLighting(v)}
                        onBrightnessChange={(v) => setPcBrightness(v)}
                        onFinishChange={(v) => setPcFinishEffect(v)}
                        onTextureChange={(v) => setPcTextureUrl(v)}
                      />

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 text-center w-full">
                        ✨ Arrastra la photocard para girarla en 360° y comprueba el efecto holográfico, la iluminación y la textura antes de publicarla.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CASO 2: CREACIÓN DE BUNDLE / PAQUETE DE PRODUCTOS */}
              {productType === 'bundle' && (
                <div className="space-y-4">
                  {/* Outlet vs Official Store Bundle Toggle */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-white block">Destino del Paquete / Bundle</span>
                      <span className="text-[11px] text-slate-400">
                        {isOutletBundle
                          ? 'Outlet Comunitario: Solo permite armar bundles con productos de tu vitrina de merch.'
                          : 'Tienda Oficial: Selecciona cualquier producto existente del catálogo mediante enlaces o búsqueda.'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsOutletBundle(false);
                          setBundleSelectedProductIds([]);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                          !isOutletBundle ? 'bg-indigo-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        Tienda Oficial
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOutletBundle(true);
                          setBundleSelectedProductIds([]);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                          isOutletBundle ? 'bg-amber-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        Outlet (Vitrina Merch)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">
                      Nombre del Paquete / Bundle *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isOutletBundle ? "Ej. Pack Outlet Merch: Photocards + Camiseta Exclusiva" : "Ej. Megapack Coleccionista: Álbum + 3 Photocards + Póster"}
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                    />
                  </div>

                  {/* REQUERIMIENTO: SELECCIÓN DE PRODUCTOS EXISTENTES MEDIANTE ENLACES O SELECTOR */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5" />
                        Añadir Productos Existentes al Bundle por Enlace o Selector
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {bundleSelectedProductIds.length} artículos en bundle
                      </span>
                    </div>

                    {/* Paste Link Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={isOutletBundle ? "Pegar enlace de artículo copiado o ID de tu vitrina..." : "Pegar enlace de artículo copiado o ID (ej. #product-prod-123)..."}
                        value={bundleLinkInput}
                        onChange={(e) => setBundleLinkInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddBundleProductByLink();
                          }
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddBundleProductByLink}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition active:scale-95 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Añadir por Enlace
                      </button>
                    </div>

                    {/* Dropdown Selector */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">
                        {isOutletBundle
                          ? 'Seleccionar únicamente de tu Vitrina de Merch (Outlet):'
                          : 'O seleccionar de los productos existentes de la tienda:'}
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddProductToBundle(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs cursor-pointer"
                      >
                        <option value="" disabled>
                          {isOutletBundle
                            ? '-- Seleccionar artículo de tu Vitrina de Merch --'
                            : '-- Seleccionar producto existente de la tienda --'}
                        </option>
                        {isOutletBundle ? (
                          showcaseItems.length === 0 ? (
                            <option value="" disabled>No tienes artículos en tu vitrina de merch todavía.</option>
                          ) : (
                            showcaseItems.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name || item.productName || 'Artículo de vitrina'} ({item.category || 'Merch'})
                              </option>
                            ))
                          )
                        ) : (
                          products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — {p.priceCoins.toLocaleString()} Coins ({p.category})
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* Selected Products List Chips */}
                    {bundleSelectedProductIds.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800">
                        <span className="text-[11px] text-slate-300 font-bold block">Artículos seleccionados:</span>
                        <div className="flex flex-wrap gap-2">
                          {bundleSelectedProductIds.map((id) => {
                            const p = products.find((pr) => pr.id === id);
                            const s = showcaseItems.find((sc) => sc.id === id);
                            const name = p?.name || s?.name || s?.productName || id;
                            const img = p?.images?.[0] || s?.image;

                            return (
                              <div
                                key={id}
                                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs shadow"
                              >
                                {img && (
                                  <img src={img} alt={name} className="w-6 h-6 rounded-lg object-cover" />
                                )}
                                <span className="font-semibold text-slate-200">{name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBundleProduct(id)}
                                  className="text-red-400 hover:text-white p-1 rounded hover:bg-red-950/60 transition cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">
                      Detalle de Artículos Incluidos (Texto descriptivo) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Ej. 1x Álbum The 1st Full Album, 2x Photocards Raras Holográficas, 1x Póster Oficial Firmado"
                      value={bundleItemsText}
                      onChange={(e) => setBundleItemsText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Precio en Coins</label>
                      <input
                        type="number"
                        min={100}
                        value={priceCoins}
                        onChange={(e) => setPriceCoins(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Descuento (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={80}
                        value={bundleDiscount}
                        onChange={(e) => setBundleDiscount(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Stock Inicial</label>
                      <input
                        type="number"
                        min={1}
                        value={stockCount}
                        onChange={(e) => setStockCount(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                      />
                    </div>
                  </div>

                  {/* Galería de imágenes para el bundle */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">
                        Imágenes de la vitrina del Bundle (opcional si ya seleccionaste artículos)
                      </label>
                      <FileUploadButton
                        onUploadSuccess={(url) => handleAddImageUrl(url)}
                        label="Subir foto del paquete"
                        className="scale-90 origin-right"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="O pegar URL: https://images.unsplash.com/..."
                        value={newImageUrlInput}
                        onChange={(e) => setNewImageUrlInput(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddImageUrl(newImageUrlInput)}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold cursor-pointer active:scale-95"
                      >
                        Agregar
                      </button>
                    </div>

                    {imageUrls.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 pt-1">
                        {imageUrls.map((url, i) => (
                          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-700">
                            <img src={url} alt="bundle" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-xs cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Artistas Asociados</label>
                    <input
                      type="text"
                      placeholder="Ej. Hana Star, Jin, Trainee Team"
                      value={associatedArtistsInput}
                      onChange={(e) => setAssociatedArtistsInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Descripción del Bundle</label>
                    <textarea
                      rows={2}
                      placeholder="Detalles sobre el contenido del paquete..."
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                    />
                  </div>
                </div>
              )}

              {/* CASO 3: CREACIÓN DE MARCO DE PERFIL (FRAME) CON VISTA PREVIA EXCLUSIVA DEL COMPRADOR */}
              {productType === 'frame' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Columna Izquierda: Configuración del Marco */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Nombre del Marco *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Marco Cyber Neón Rosa, Prisma Celestial YM-ki"
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Estilo del Marco (Efectos Dinámicos)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'cyber_neon', label: 'Cyber Neón', icon: '⚡' },
                          { id: 'gold_star', label: 'Estrellas de Oro', icon: '⭐' },
                          { id: 'prism_diamond', label: 'Prisma Diamante', icon: '💎' },
                          { id: 'sakura', label: 'Flor de Cerezo', icon: '🌸' },
                          { id: 'flame_fire', label: 'Llama Ígnea', icon: '🔥' },
                          { id: 'hologram_matrix', label: 'Matriz Holograma', icon: '🔮' }
                        ].map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setFrameStyleChoice(st.id)}
                            className={`p-2.5 rounded-xl border text-left text-xs font-bold transition cursor-pointer active:scale-95 flex items-center gap-2 ${
                              frameStyleChoice === st.id
                                ? 'bg-purple-600 border-purple-400 text-white shadow'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <span>{st.icon}</span>
                            <span>{st.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Color Principal del Marco</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={frameDefaultColor}
                            onChange={(e) => setFrameDefaultColor(e.target.value)}
                            className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={frameDefaultColor}
                            onChange={(e) => setFrameDefaultColor(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Moneda y Precio</label>
                        <div className="flex items-center gap-2">
                          <select
                            value={currencyType}
                            onChange={(e) => setCurrencyType(e.target.value as CurrencyType)}
                            className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                          >
                            <option value="coins">Coins</option>
                            <option value="gems">Gems</option>
                          </select>
                          <input
                            type="number"
                            min={1}
                            value={currencyType === 'gems' ? priceGems : priceCoins}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              if (currencyType === 'gems') setPriceGems(val);
                              else setPriceCoins(val);
                            }}
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Cantidad de Copias / Stock Inicial *</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={stockCount}
                        onChange={(e) => setStockCount(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300">Borde / Gráfico PNG Transparente (Opcional)</label>
                        <FileUploadButton
                          onUploadSuccess={(url) => setFrameCustomBorderUrl(url)}
                          label="Subir PNG transparente"
                          className="scale-90 origin-right"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="https://... imagen PNG transparente circular"
                        value={frameCustomBorderUrl}
                        onChange={(e) => setFrameCustomBorderUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Descripción del Marco</label>
                      <textarea
                        rows={2}
                        placeholder="Detalles sobre este marco coleccionable..."
                        value={prodDesc}
                        onChange={(e) => setProdDesc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Columna Derecha: VISTA PREVIA EXCLUSIVA CON LA FOTO DE PERFIL DEL USUARIO */}
                  <div className="lg:col-span-5 lg:sticky lg:top-2 space-y-3">
                    <div className="p-6 rounded-3xl bg-slate-950/90 border border-purple-500/30 shadow-2xl flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-xs font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5" />
                          Vista Previa de Comprador
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          En Vivo
                        </span>
                      </div>

                      {/* Live Avatar Preview strictly using buyer's avatar */}
                      <div className="py-4">
                        <AvatarWithFrame
                          src={userProfile.avatar}
                          avatarUrl={userProfile.avatar}
                          frameStyle={frameStyleChoice}
                          frameCustomColor={frameDefaultColor}
                          transparentFrame={frameCustomBorderUrl.trim() || undefined}
                          size="2xl"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm font-extrabold text-white">
                          {prodName || 'Vista Previa del Marco'}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Probándose con tu foto de perfil: <span className="text-indigo-400 font-bold">@{userProfile.username}</span>
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 text-center w-full">
                        ✨ Al crear o comprar un marco, solo se ve la vista previa de esta con la foto de perfil del usuario que está comprando.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CASO 3: CREACIÓN DE ÁLBUM MUSICAL (REGLAS ESTRICTAS DE YM-KI) */}
              {productType === 'album' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">
                      Título Oficial del Álbum *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. The 1st Full Album [ECLIPSE]"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider block">
                        Tipo de Álbum & Reglas de Validación
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setAlbumType('full')}
                          className={`p-2.5 rounded-lg border text-xs font-bold cursor-pointer transition ${
                            albumType === 'full'
                              ? 'border-indigo-500 bg-indigo-500/20 text-white'
                              : 'border-slate-800 text-slate-400'
                          }`}
                        >
                          Full Álbum (≥8 tracks)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAlbumType('mini')}
                          className={`p-2.5 rounded-lg border text-xs font-bold cursor-pointer transition ${
                            albumType === 'mini'
                              ? 'border-indigo-500 bg-indigo-500/20 text-white'
                              : 'border-slate-800 text-slate-400'
                          }`}
                        >
                          Mini Álbum (4-7 tracks)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAlbumType('single')}
                          className={`p-2.5 rounded-lg border text-xs font-bold cursor-pointer transition ${
                            albumType === 'single'
                              ? 'border-indigo-500 bg-indigo-500/20 text-white'
                              : 'border-slate-800 text-slate-400'
                          }`}
                        >
                          Single (1 track + máx 2 ver.)
                        </button>
                      </div>
                    </div>

                    {/* Album Price: Max 20,000 Coins Rule */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-300">
                          Precio en Coins (Máximo permitido: 20,000 Coins)
                        </label>
                        <span className="text-xs font-extrabold text-amber-400">
                          {priceCoins} / 20,000 Coins
                        </span>
                      </div>
                      <input
                        type="number"
                        max={20000}
                        min={100}
                        value={priceCoins}
                        onChange={(e) => setPriceCoins(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
                      />
                    </div>

                    {/* Photocards limit per unboxed album */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        Límite de photocards que salen por álbum comprado
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={photocardsPerUnbox}
                        onChange={(e) => setPhotocardsPerUnbox(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
                      />
                    </div>

                    {/* Preorder Checkbox */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="preorder-check"
                        checked={isPreorder}
                        onChange={(e) => setIsPreorder(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-pink-600 focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="preorder-check" className="text-xs font-bold text-pink-400 cursor-pointer">
                        Álbum en Preventa (Incluye beneficios exclusivos de preventa)
                      </label>
                    </div>

                    {/* Preorder cards */}
                    {isPreorder && (
                      <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-500/30 space-y-2">
                        <label className="text-xs font-extrabold text-pink-400 uppercase tracking-wider block">
                          Beneficios Exclusivos de Preventa (Photocards de Preventa: {preorderBenefitCards.length})
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Nombre photocard preventa..."
                            value={newPreorderPcName}
                            onChange={(e) => setNewPreorderPcName(e.target.value)}
                            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                          />
                          <input
                            type="text"
                            placeholder="URL foto de preventa..."
                            value={newPreorderPcImg}
                            onChange={(e) => setNewPreorderPcImg(e.target.value)}
                            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddPreorderBenefit}
                          className="px-3 py-1.5 rounded-lg bg-pink-600 text-white text-xs font-bold cursor-pointer active:scale-95"
                        >
                          + Añadir Photocard de Preventa
                        </button>
                      </div>
                    )}

                    {/* Photocards Pool Attachment (up to 20 photocards) */}
                    <div className="space-y-2 border-t border-slate-800 pt-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                          Colección de Photocards del Álbum ({photocardsPool.length}/20)
                        </label>
                        <span className="text-[11px] text-slate-400">Máximo 20 photocards</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Nombre de la photocard..."
                          value={newPcName}
                          onChange={(e) => setNewPcName(e.target.value)}
                          className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Artista..."
                          value={newPcArtist}
                          onChange={(e) => setNewPcArtist(e.target.value)}
                          className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                        <select
                          value={newPcRarity}
                          onChange={(e) => setNewPcRarity(e.target.value as any)}
                          className="px-2 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                        >
                          <option value="comun">Común</option>
                          <option value="rara">Rara</option>
                          <option value="ultra_rara">Ultra Rara</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="URL Imagen Frontal..."
                          value={newPcImage}
                          onChange={(e) => setNewPcImage(e.target.value)}
                          className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                        <input
                          type="text"
                          placeholder="URL Imagen Trasera (Reverso 3D)..."
                          value={newPcBackImage}
                          onChange={(e) => setNewPcBackImage(e.target.value)}
                          className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleAddPhotocardToPool}
                          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold cursor-pointer active:scale-95 shadow"
                        >
                          + Añadir Photocard Dual-Side (3D)
                        </button>
                      </div>

                      {/* Photocards thumbnails */}
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-32 overflow-y-auto pt-1">
                        {photocardsPool.map((pc, i) => (
                          <div key={i} className="relative aspect-[2/3] rounded-lg overflow-hidden border border-slate-700 group">
                            <img src={pc.image} alt={pc.name} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setPhotocardsPool(photocardsPool.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tracks Builder */}
                    <div className="space-y-2 border-t border-slate-800 pt-3">
                      <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                        Archivos de Audio & Tracklist ({albumTracks.length} tracks)
                      </label>

                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Título canción..."
                          value={newTrackTitle}
                          onChange={(e) => setNewTrackTitle(e.target.value)}
                          className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Duración (ej. 3:25)..."
                          value={newTrackDuration}
                          onChange={(e) => setNewTrackDuration(e.target.value)}
                          className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                        <select
                          value={newTrackVersion}
                          onChange={(e) => setNewTrackVersion(e.target.value as any)}
                          className="px-2 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                        >
                          <option value="original">Original</option>
                          <option value="remix">Remix</option>
                          <option value="instrumental">Instrumental</option>
                          <option value="acoustic">Acústico</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddTrack}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold cursor-pointer active:scale-95"
                      >
                        + Añadir Canción al Álbum
                      </button>

                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {albumTracks.map((tr, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 text-xs text-slate-300">
                            <span>{i + 1}. {tr.title} ({tr.duration}) - {tr.versionType}</span>
                            <button
                              type="button"
                              onClick={() => setAlbumTracks(albumTracks.filter((_, idx) => idx !== i))}
                              className="text-red-400 hover:text-red-300 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Portada Álbum */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">
                        Portada Oficial del Álbum *
                      </label>
                      <FileUploadButton
                        onUploadSuccess={(url) => handleAddImageUrl(url)}
                        label="Subir portada"
                        className="scale-90 origin-right"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="O pegar URL: https://images.unsplash.com/..."
                        value={newImageUrlInput}
                        onChange={(e) => setNewImageUrlInput(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddImageUrl(newImageUrlInput)}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold cursor-pointer active:scale-95"
                      >
                        Agregar
                      </button>
                    </div>

                    {imageUrls.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 pt-1">
                        {imageUrls.map((url, i) => (
                          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-700">
                            <img src={url} alt="album cover" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-xs cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Artistas Asociados</label>
                    <input
                      type="text"
                      placeholder="Ej. Hana Star, Jin, Trainee Team"
                      value={associatedArtistsInput}
                      onChange={(e) => setAssociatedArtistsInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Descripción / Detalles del Álbum</label>
                    <textarea
                      rows={2}
                      placeholder="Detalles sobre el concepto del álbum, letras y créditos..."
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                    />
                  </div>
                </div>
              )}

              {/* CASO 4: CREACIÓN DE PRODUCTO GENERAL / SIN CATEGORÍA */}
              {productType === 'general' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Sudadera Oficial YM-ki Records o Lightstick"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                    />
                  </div>

                  {/* Images Attachment */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">
                        Imágenes del Producto *
                      </label>
                      <FileUploadButton
                        onUploadSuccess={(url) => handleAddImageUrl(url)}
                        label="Subir desde dispositivo"
                        className="scale-90 origin-right"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="O pegar URL directa: https://images.unsplash.com/..."
                        value={newImageUrlInput}
                        onChange={(e) => setNewImageUrlInput(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddImageUrl(newImageUrlInput)}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold cursor-pointer active:scale-95"
                      >
                        Agregar
                      </button>
                    </div>

                    {imageUrls.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 pt-1">
                        {imageUrls.map((url, i) => (
                          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-700">
                            <img src={url} alt="prod" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-xs cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Artistas Asociados (separados por coma)</label>
                    <input
                      type="text"
                      placeholder="Ej. Jin Vocal, Hana Star, Minji"
                      value={associatedArtistsInput}
                      onChange={(e) => setAssociatedArtistsInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Precio en Coins</label>
                      <input
                        type="number"
                        min={10}
                        value={priceCoins}
                        onChange={(e) => setPriceCoins(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Stock Inicial</label>
                      <input
                        type="number"
                        min={1}
                        value={stockCount}
                        onChange={(e) => setStockCount(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Descripción / Detalles</label>
                    <textarea
                      rows={2}
                      placeholder="Detalles sobre el producto, materiales, dimensiones..."
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Botones de Envío */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg cursor-pointer active:scale-95 transition"
                >
                  {productType === 'photocard' && 'Añadir Photocard al Mercado'}
                  {productType === 'album' && 'Publicar Álbum Oficial'}
                  {productType === 'bundle' && 'Publicar Paquete / Bundle'}
                  {productType === 'general' && 'Publicar Producto General'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESELL IN OUTLET MODAL (90% payout) */}
      {isResellModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Repeat className="w-5 h-5 text-amber-500" />
                Vender en Outlet (90% Ganancia)
              </h3>
              <button
                onClick={() => setIsResellModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResellSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Selecciona el artículo de tu inventario</label>
                <select
                  required
                  value={resellItemId}
                  onChange={(e) => setResellItemId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                >
                  <option value="">-- Escoger de tu colección --</option>
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.productName} (Pagaste {item.pricePaid} Coins)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Precio de Venta en Coins</label>
                <input
                  type="number"
                  min={10}
                  value={resalePriceInput}
                  onChange={(e) => setResalePriceInput(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                />
              </div>

              {/* 90% breakdown */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Precio de venta al comprador:</span>
                  <span className="font-bold text-white">{resalePriceInput} Coins</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tarifa de plataforma (10%):</span>
                  <span>-{Math.floor(resalePriceInput * 0.10)} Coins</span>
                </div>
                <div className="flex justify-between text-amber-400 font-extrabold pt-1 border-t border-slate-800">
                  <span>Tu pago neto al venderse (90%):</span>
                  <span>{Math.floor(resalePriceInput * 0.90)} Coins</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsResellModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow cursor-pointer active:scale-95"
                >
                  Listar en Outlet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GIFT ITEM MODAL */}
      {isGiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-pink-500" />
                Regalar Artículo a un Usuario
              </h3>
              <button
                onClick={() => setIsGiftModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGiftSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Artículo de tu inventario para regalar</label>
                <select
                  required
                  value={giftItemId}
                  onChange={(e) => setGiftItemId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                >
                  <option value="">-- Seleccionar item --</option>
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.productName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Usuario destinatario</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. usuario o @fan_luna"
                  value={giftTargetUser}
                  onChange={(e) => setGiftTargetUser(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Mensaje de dedicatoria (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. ¡Feliz comeback! Que lo disfrutes mucho ✨"
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGiftModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow cursor-pointer active:scale-95"
                >
                  Enviar Regalo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PRODUCT CONFIRMATION MODAL */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">¿Eliminar producto de la tienda?</h3>
                <p className="text-xs text-slate-400">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-3">
              {productToDelete.images && productToDelete.images[0] && (
                <img
                  src={productToDelete.images[0]}
                  alt={productToDelete.name}
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-white truncate">{productToDelete.name}</h4>
                <p className="text-xs text-slate-400">
                  {productToDelete.isOutlet
                    ? 'Outlet / Reventa'
                    : productToDelete.category === 'fashion'
                    ? 'Sección Fashion'
                    : productToDelete.isAlbum
                    ? 'Álbum Oficial'
                    : 'Producto Oficial'}{' '}
                  • {productToDelete.priceCoins.toLocaleString()} Coins
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              ¿Estás seguro de que deseas eliminar este producto? Se retirará permanentemente de la tienda oficial y del catálogo.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white cursor-pointer active:scale-95 shadow-md flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Sí, eliminar producto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FRAME LIVE PREVIEW MODAL */}
      {previewingFrameProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setPreviewingFrameProduct(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                <Palette className="w-3.5 h-3.5" /> Probador de Marcos en Vivo
              </span>
              <h3 className="text-lg font-black text-white">{previewingFrameProduct.name}</h3>
              <p className="text-xs text-slate-400">
                Visualiza cómo lucirá este marco directamente en tu avatar de perfil antes de adquirirlo.
              </p>
            </div>

            {/* Avatar Preview with this frame */}
            <div className="flex flex-col items-center justify-center py-6 bg-slate-950/80 rounded-2xl border border-slate-800">
              <AvatarWithFrame
                src={userProfile.avatar}
                avatarUrl={userProfile.avatar}
                frameStyle={previewingFrameProduct.frameStyle || previewingFrameProduct.frameConfig?.style || 'cyber_neon'}
                frameCustomColor={userProfile.customFrameColor || userProfile.ringColor}
                size="2xl"
              />
              <span className="text-xs font-bold text-slate-400 mt-4">
                Vista previa con tu avatar actual
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Precio del marco:</span>
                <span className="font-extrabold flex items-center gap-1">
                  {previewingFrameProduct.currencyType === 'gems' ? (
                    <span className="text-cyan-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {previewingFrameProduct.priceGems || 10} Gems
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      {previewingFrameProduct.priceCoins.toLocaleString()} Coins
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Estado de posesión:</span>
                <span className="font-bold text-indigo-400">
                  {userProfile.ownedFrames?.includes(previewingFrameProduct.frameStyle || '')
                    ? 'Ya posees este marco ✓'
                    : 'No desbloqueado'}
                </span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setPreviewingFrameProduct(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition active:scale-95"
              >
                Cerrar
              </button>

              {userProfile.ownedFrames?.includes(previewingFrameProduct.frameStyle || '') ? (
                <button
                  type="button"
                  onClick={async () => {
                    await updateCustomization({ currentFrame: previewingFrameProduct.frameStyle });
                    showToast(`Marco "${previewingFrameProduct.name}" equipado con éxito.`);
                    setPreviewingFrameProduct(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg cursor-pointer transition active:scale-95"
                >
                  Equipar Ahora
                </button>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    const success = await buyProduct(previewingFrameProduct.id);
                    if (success) {
                      await updateCustomization({ currentFrame: previewingFrameProduct.frameStyle });
                      showToast(`¡Marco adquirido y equipado exitosamente!`);
                      setPreviewingFrameProduct(null);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-lg cursor-pointer transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Comprar y Equipar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3D PHOTOCARD DEDICATED VISUALIZER MODAL */}
      {viewing3DProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setViewing3DProduct(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/40">
                <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
                Visor Interactivo Photocard 3D
              </span>
              <h3 className="text-lg font-black text-white">{viewing3DProduct.name}</h3>
              <p className="text-xs text-slate-400">
                {viewing3DProduct.associatedArtists?.join(', ') || 'Colección Oficial YM-ki'} •{' '}
                {viewing3DProduct.finishEffect === 'neutral' ? 'Acabado Neutral / Mate' : 'Efecto Holográfico Prisma'}
              </p>
            </div>

            {/* 3D Interactive Viewer Component */}
            <div className="flex flex-col items-center justify-center py-4 bg-slate-950/80 rounded-2xl border border-slate-800">
              <Photocard3DViewer
                photocard={
                  viewing3DProduct.photocardData || {
                    id: viewing3DProduct.id,
                    name: viewing3DProduct.name,
                    artist: viewing3DProduct.associatedArtists?.[0] || 'Artista Oficial',
                    image: viewing3DProduct.images[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
                    backImage: viewing3DProduct.images[1] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500',
                    rarity: (viewing3DProduct.tags.find((t) => ['comun', 'rara', 'ultra_rara', 'preventa_exclusiva'].includes(t)) as any) || 'rara',
                    finishEffect: viewing3DProduct.finishEffect || 'holographic',
                    textureUrl: viewing3DProduct.textureUrl,
                    lightingIntensity: viewing3DProduct.lightingIntensity,
                    brightness: viewing3DProduct.brightness,
                    isHolographic: viewing3DProduct.finishEffect !== 'neutral'
                  }
                }
                interactive={true}
                showControls={true}
              />
            </div>

            {/* Price & Purchase bar */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block font-semibold">Precio Oficial</span>
                <div className="text-base font-black flex items-center gap-1.5 text-amber-400">
                  {viewing3DProduct.currencyType === 'gems' ? (
                    <span className="text-cyan-400 flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      {viewing3DProduct.priceGems || 10} Gems
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <Coins className="w-4 h-4" />
                      {viewing3DProduct.priceCoins.toLocaleString()} Coins
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewing3DProduct(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition active:scale-95"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  disabled={viewing3DProduct.stockCount <= 0}
                  onClick={() => {
                    handleInitiatePurchase(viewing3DProduct);
                    setViewing3DProduct(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-black shadow-lg cursor-pointer transition active:scale-95 flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Comprar Photocard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT DETAILS & REVIEWS MODAL */}
      <ProductDetailsModal
        product={selectedProductForDetails}
        isOpen={!!selectedProductForDetails}
        onClose={() => setSelectedProductForDetails(null)}
        onBuy={(prod) => {
          handleInitiatePurchase(prod);
        }}
      />

      {/* MODAL: SOLICITUD DE PROVEEDOR (USUARIO) */}
      {isApplyVendorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Solicitud de Proveedor Autorizado
              </h3>
              <button
                onClick={() => setIsApplyVendorOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Application Status Card if exists */}
            {myVendorApplication && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                  myVendorApplication.status === 'approved'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : myVendorApplication.status === 'pending'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>Estado actual de tu solicitud:</span>
                  <span className="uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full bg-slate-900">
                    {myVendorApplication.status === 'approved'
                      ? '✅ Aprobado'
                      : myVendorApplication.status === 'pending'
                      ? '⏳ En Revisión'
                      : '❌ Rechazado'}
                  </span>
                </div>
                <p className="text-[11px] opacity-90">
                  {myVendorApplication.status === 'approved'
                    ? '¡Felicidades! Eres un Proveedor Autorizado de YM-ki. Tienes insignia oficial y permisos para publicar productos de catálogo.'
                    : myVendorApplication.status === 'pending'
                    ? 'Tu solicitud está siendo revisada por los Directores y CEOs. Te notificaremos en cuanto haya una resolución.'
                    : `Tu solicitud fue rechazada. Motivo: ${myVendorApplication.rejectionReason || 'No cumple con las pautas de calidad.'}`}
                </p>
              </div>
            )}

            {/* Application Form */}
            {(!myVendorApplication || myVendorApplication.status === 'rejected') && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!vendorNameInput.trim() || !vendorDescInput.trim() || !vendorContactInput.trim()) {
                    showToast('Por favor completa todos los campos requeridos.');
                    return;
                  }
                  const productTypes = vendorTypesInput
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean);

                  const ok = await applyForVendor({
                    vendorName: vendorNameInput.trim(),
                    description: vendorDescInput.trim(),
                    productTypes,
                    contactInfo: vendorContactInput.trim()
                  });

                  if (ok) {
                    setIsApplyVendorOpen(false);
                    setVendorNameInput('');
                    setVendorDescInput('');
                    setVendorContactInput('');
                  }
                }}
                className="space-y-3.5"
              >
                <p className="text-xs text-slate-300 leading-relaxed">
                  Los proveedores autorizados pueden listar mercancía oficial, álbumes y prendas de moda en la plataforma, con control de inventario y variantes.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre comercial o de tu Marca:
                  </label>
                  <input
                    type="text"
                    required
                    value={vendorNameInput}
                    onChange={(e) => setVendorNameInput(e.target.value)}
                    placeholder="Ej: StarLight Merch Co."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Descripción de tus productos y experiencia:
                  </label>
                  <textarea
                    required
                    value={vendorDescInput}
                    onChange={(e) => setVendorDescInput(e.target.value)}
                    placeholder="Describe los productos que comercializas, tiempos de entrega y calidad..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white min-h-[70px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipos de productos que provees (separados por coma):
                  </label>
                  <input
                    type="text"
                    value={vendorTypesInput}
                    onChange={(e) => setVendorTypesInput(e.target.value)}
                    placeholder="Ej: photocards, álbumes, ropa, lightsticks"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Información de contacto (Email, Red social o WhatsApp):
                  </label>
                  <input
                    type="text"
                    required
                    value={vendorContactInput}
                    onChange={(e) => setVendorContactInput(e.target.value)}
                    placeholder="contacto@mimarcamerch.com / @instagram_vendor"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsApplyVendorOpen(false)}
                    className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer"
                  >
                    Enviar Solicitud
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: PANEL DE PROVEEDORES (ADMINISTRADORES) */}
      {isVendorPanelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" /> Panel de Proveedores Autorizados
                </h3>
                <p className="text-xs text-slate-400">
                  Revisa y aprueba solicitudes de proveedores para publicar en la tienda.
                </p>
              </div>
              <button
                onClick={() => setIsVendorPanelOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {vendorsList.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">
                  No hay solicitudes de proveedores registradas.
                </p>
              ) : (
                vendorsList.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{app.vendorName}</h4>
                          <span className="text-xs text-indigo-400">@{app.username}</span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Contacto: {app.contactInfo} · Fecha: {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          app.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : app.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{app.description}</p>

                    <div className="flex flex-wrap gap-1 text-[10px]">
                      {app.productTypes.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {t}
                        </span>
                      ))}
                    </div>

                    {app.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={async () => {
                            const reason = prompt('Motivo de rechazo (opcional):') || undefined;
                            await reviewVendorStatus(app.id, 'rejected', reason);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30 text-xs font-bold cursor-pointer"
                        >
                          Rechazar
                        </button>
                        <button
                          onClick={async () => {
                            await reviewVendorStatus(app.id, 'approved');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow cursor-pointer"
                        >
                          Aprobar Proveedor
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GESTIÓN DE CUPONES DE DESCUENTO (ADMINISTRADORES) */}
      {isCouponManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-400" /> Cupones de Descuento
              </h3>
              <button
                onClick={() => setIsCouponManagerOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Create Coupon Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newCouponCode.trim() || newCouponDiscount <= 0) return;
                const ok = await createDiscountCoupon({
                  code: newCouponCode.trim().toUpperCase(),
                  discountPercent: newCouponDiscount,
                  minPurchaseCoins: newCouponMinCoins,
                  maxUses: newCouponMaxUses
                });
                if (ok) {
                  setNewCouponCode('');
                  setNewCouponDiscount(10);
                }
              }}
              className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3"
            >
              <h4 className="text-xs font-bold text-indigo-300">Crear Nuevo Cupón:</h4>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Código del Cupón:</label>
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="EJ: YMKI25"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">% de Descuento (1-100):</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Compra Mínima (Coins):</label>
                  <input
                    type="number"
                    min={0}
                    value={newCouponMinCoins}
                    onChange={(e) => setNewCouponMinCoins(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Usos Máximos:</label>
                  <input
                    type="number"
                    min={1}
                    value={newCouponMaxUses}
                    onChange={(e) => setNewCouponMaxUses(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer"
              >
                Crear Cupón
              </button>
            </form>

            {/* Active Coupons List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300">Cupones Existentes ({discountCoupons.length}):</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {discountCoupons.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-black text-amber-400 tracking-wider">{c.code}</span>
                      <span className="text-[11px] text-slate-400 ml-2">
                        {c.discountPercent}% OFF · Mín: {c.minPurchaseCoins} Coins
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Usos: {c.usedCount ?? c.usesCount ?? 0}/{c.maxUses}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESTOCK MODAL */}
      {isRestockModalOpen && productToRestock && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-emerald-400" /> Reponer Stock Oficial
                </h3>
                <p className="text-xs text-slate-400">{productToRestock.name}</p>
              </div>
              <button
                onClick={() => {
                  setIsRestockModalOpen(false);
                  setProductToRestock(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
              <img
                src={productToRestock.images?.[0] || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500'}
                alt={productToRestock.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="text-xs">
                <span className="font-bold text-white block">{productToRestock.name}</span>
                <span className="text-slate-400">
                  Stock actual:{' '}
                  <strong className={productToRestock.stockCount <= 0 ? 'text-red-400' : 'text-emerald-400'}>
                    {productToRestock.stockCount} uds.
                  </strong>
                </span>
              </div>
            </div>

            {/* Quick Increment Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Cantidad a Añadir:</label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRestockAmount(amt)}
                    className={`py-1.5 rounded-xl text-xs font-black transition cursor-pointer active:scale-95 border ${
                      restockAmount === amt
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={1}
                value={restockAmount}
                onChange={(e) => setRestockAmount(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold mt-2"
                placeholder="Cantidad personalizada"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Motivo / Razón de Reposición:</label>
              <input
                type="text"
                value={restockReason}
                onChange={(e) => setRestockReason(e.target.value)}
                placeholder="Ej. Nueva tirada de álbumes de preventa"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <button
              onClick={async () => {
                await restockProduct(productToRestock.id, restockAmount, restockReason);
                setIsRestockModalOpen(false);
                setProductToRestock(null);
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition active:scale-95 cursor-pointer"
            >
              Confirmar Reposición (+{restockAmount} uds)
            </button>
          </div>
        </div>
      )}

      {/* CREATE VARIANT MODAL */}
      {isVariantModalOpen && productForVariant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-400" /> Añadir Variante de Producto
                </h3>
                <p className="text-xs text-slate-400">{productForVariant.name}</p>
              </div>
              <button
                onClick={() => {
                  setIsVariantModalOpen(false);
                  setProductForVariant(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Nombre de la Variante:</label>
                <input
                  type="text"
                  required
                  value={varName}
                  onChange={(e) => setVarName(e.target.value)}
                  placeholder="Ej: Versión Eclipse, Color Rosa Pastel, Edición Limitada"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Tipo de Variante:</label>
                  <select
                    value={varType}
                    onChange={(e) => setVarType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="version">Versión Musical</option>
                    <option value="color">Color</option>
                    <option value="edition">Edición Especial</option>
                    <option value="rarity">Rareza</option>
                    <option value="size">Talla / Tamaño</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Stock Inicial:</label>
                  <input
                    type="number"
                    min={1}
                    value={varStock}
                    onChange={(e) => setVarStock(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Precio (Coins):</label>
                  <input
                    type="number"
                    min={10}
                    value={varPriceCoins}
                    onChange={(e) => setVarPriceCoins(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Precio (Gems):</label>
                  <input
                    type="number"
                    min={0}
                    value={varPriceGems}
                    onChange={(e) => setVarPriceGems(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={async () => {
                if (!varName.trim()) {
                  showToast('Escribe el nombre de la variante.');
                  return;
                }
                await createProductVariant(productForVariant.id, {
                  name: varName.trim(),
                  variantType: varType,
                  stockCount: varStock,
                  priceCoins: varPriceCoins,
                  priceGems: varPriceGems
                });
                setIsVariantModalOpen(false);
                setProductForVariant(null);
                setVarName('');
              }}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow transition active:scale-95 cursor-pointer"
            >
              Guardar Variante
            </button>
          </div>
        </div>
      )}

      {/* CREATE TRADE OFFER MODAL */}
      {isTradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-purple-400" /> Proponer Intercambio (Trade)
                </h3>
                <p className="text-xs text-slate-400">Intercambia un artículo de tu inventario con otro usuario.</p>
              </div>
              <button
                onClick={() => {
                  setIsTradeModalOpen(false);
                  setTradeTargetUser('');
                  setTradeOfferedItemId('');
                  setTradeRequestedItemName('');
                  setTradeNote('');
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Usuario Destinatario (@nombre):</label>
                <input
                  type="text"
                  required
                  value={tradeTargetUser}
                  onChange={(e) => setTradeTargetUser(e.target.value)}
                  placeholder="Ej: Miki, CeoNova, etc."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Artículo de tu inventario a ofrecer:</label>
                <select
                  value={tradeOfferedItemId}
                  onChange={(e) => setTradeOfferedItemId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">-- Selecciona un artículo --</option>
                  {inventory.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.productName || inv.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Artículo que solicitas a cambio:</label>
                <input
                  type="text"
                  required
                  value={tradeRequestedItemName}
                  onChange={(e) => setTradeRequestedItemName(e.target.value)}
                  placeholder="Ej: Photocard Ultra Rara Miki Concept A"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Nota o mensaje adjunto (opcional):</label>
                <textarea
                  rows={2}
                  value={tradeNote}
                  onChange={(e) => setTradeNote(e.target.value)}
                  placeholder="Ej: Tengo repetida esta carta, ¿te gustaría cambiarla?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white resize-none"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (!tradeTargetUser.trim() || !tradeOfferedItemId || !tradeRequestedItemName.trim()) {
                  showToast('Por favor completa el usuario destinatario, el artículo a ofrecer y el solicitado.');
                  return;
                }
                const ok = submitTradeOffer(
                  tradeTargetUser.trim().replace(/^@/, ''),
                  tradeOfferedItemId,
                  tradeRequestedItemName.trim(),
                  tradeNote.trim()
                );
                if (ok) {
                  setIsTradeModalOpen(false);
                  setTradeTargetUser('');
                  setTradeOfferedItemId('');
                  setTradeRequestedItemName('');
                  setTradeNote('');
                }
              }}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow transition active:scale-95 cursor-pointer"
            >
              Enviar Oferta de Trade
            </button>
          </div>
        </div>
      )}

      {/* PURCHASE CONFIRMATION MODAL */}
      {confirmPurchaseProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-400" />
                Confirmar Compra
              </h3>
              <button
                disabled={isPurchasing}
                onClick={() => setConfirmPurchaseProduct(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-4 items-center bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <img
                src={confirmPurchaseProduct.images[0]}
                alt={confirmPurchaseProduct.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{confirmPurchaseProduct.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-1">{confirmPurchaseProduct.description}</p>
                <div className="mt-1 text-xs font-black text-amber-400 flex items-center gap-1">
                  {confirmPurchaseProduct.currencyType === 'gems' ? (
                    <span className="text-cyan-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {confirmPurchaseProduct.priceGems || 10} Gems
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      {confirmPurchaseProduct.priceCoins.toLocaleString()} Coins
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              ¿Estás seguro de adquirir 1 copia de este producto? Se descontará el importe directamente de tu saldo.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isPurchasing}
                onClick={() => setConfirmPurchaseProduct(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition active:scale-95 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPurchasing}
                onClick={handleExecutePurchase}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isPurchasing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirmar y Pagar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PURCHASE RECEIPT MODAL */}
      {purchaseReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">¡Compra Exitosa!</h3>
              <p className="text-xs text-slate-400">El producto ha sido añadido a tu inventario.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-left text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-800/80">
                <span className="text-slate-400">Artículo</span>
                <span className="font-bold text-white truncate max-w-[180px]">{purchaseReceipt.product.name}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-800/80">
                <span className="text-slate-400">Total pagado</span>
                <span className="font-bold text-amber-400">{purchaseReceipt.amount.toLocaleString()} {purchaseReceipt.currency}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-800/80">
                <span className="text-slate-400">Fecha y hora</span>
                <span className="text-slate-300">{purchaseReceipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estado</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Entregado en Inventario
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPurchaseReceipt(null)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg"
            >
              Cerrar Comprobante
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
