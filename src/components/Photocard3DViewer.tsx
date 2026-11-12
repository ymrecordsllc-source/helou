import React, { useState, useRef, useEffect } from 'react';
import {
  RotateCw,
  Sparkles,
  ShieldCheck,
  Sun,
  Lightbulb,
  Play,
  Pause,
  Upload,
  Image as ImageIcon,
  Sliders,
  Check
} from 'lucide-react';
import { Photocard } from '../types';
import { FileUploadButton } from './FileUploadButton';

export interface Photocard3DViewerProps {
  photocard: Photocard;
  className?: string;
  autoRotate?: boolean;
  interactive?: boolean;
  showDetails?: boolean;
  showControls?: boolean;
  finishEffect?: 'holographic' | 'neutral';
  textureUrl?: string;
  lightingIntensity?: number;
  brightness?: number;
  defaultLighting?: number;
  defaultBrightness?: number;
  defaultFinish?: 'holographic' | 'neutral';
  defaultTexture?: string;
  onLightingChange?: (val: number) => void;
  onBrightnessChange?: (val: number) => void;
  onFinishEffectChange?: (effect: 'holographic' | 'neutral') => void;
  onFinishChange?: (effect: 'holographic' | 'neutral') => void;
  onTextureChange?: (url: string) => void;
}

const DEFAULT_CARD_BACK =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80';

// Preset high quality textures for holographic / card finish effects
export const PRESET_TEXTURES = [
  {
    id: 'prism-holo',
    name: 'Prisma Holográfico',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'gold-glitter',
    name: 'Foil Glitter Oro',
    url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'cosmic-stars',
    name: 'Estrellas Cósmicas',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'rainbow-film',
    name: 'Película Iridiscente',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80'
  }
];

export const Photocard3DViewer: React.FC<Photocard3DViewerProps> = ({
  photocard,
  className = '',
  autoRotate: initialAutoRotate = false,
  showDetails = true,
  showControls = true,
  finishEffect: controlledFinishEffect,
  textureUrl: controlledTextureUrl,
  lightingIntensity: controlledLighting,
  brightness: controlledBrightness,
  onLightingChange,
  onBrightnessChange,
  onFinishEffectChange,
  onFinishChange,
  onTextureChange
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(initialAutoRotate);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  // Lighting & Brightness local state (synced with props if provided)
  const [localLighting, setLocalLighting] = useState<number>(
    controlledLighting !== undefined ? controlledLighting : photocard.lightingIntensity ?? 100
  );
  const [localBrightness, setLocalBrightness] = useState<number>(
    controlledBrightness !== undefined ? controlledBrightness : photocard.brightness ?? 100
  );

  // Finish effect ('holographic' vs 'neutral')
  const [localFinishEffect, setLocalFinishEffect] = useState<'holographic' | 'neutral'>(
    controlledFinishEffect !== undefined
      ? controlledFinishEffect
      : photocard.finishEffect || (photocard.isHolographic === false ? 'neutral' : 'holographic')
  );

  // Texture overlay
  const [localTextureUrl, setLocalTextureUrl] = useState<string>(
    controlledTextureUrl !== undefined
      ? controlledTextureUrl
      : photocard.textureUrl || ''
  );

  const [showSlidersPanel, setShowSlidersPanel] = useState(false);

  // Sync external prop updates
  useEffect(() => {
    if (controlledLighting !== undefined) setLocalLighting(controlledLighting);
  }, [controlledLighting]);

  useEffect(() => {
    if (controlledBrightness !== undefined) setLocalBrightness(controlledBrightness);
  }, [controlledBrightness]);

  useEffect(() => {
    if (controlledFinishEffect !== undefined) setLocalFinishEffect(controlledFinishEffect);
  }, [controlledFinishEffect]);

  useEffect(() => {
    if (controlledTextureUrl !== undefined) setLocalTextureUrl(controlledTextureUrl);
  }, [controlledTextureUrl]);

  const cardRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const autoRotateAngleRef = useRef(0);

  const dragStartRef = useRef<{ startX: number; startY: number; initialRotX: number; initialRotY: number }>({
    startX: 0,
    startY: 0,
    initialRotX: 0,
    initialRotY: 0
  });

  const frontImage = photocard.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&fit=crop';
  const backImage = photocard.backImage || DEFAULT_CARD_BACK;

  // Dynamic Auto-Rotation Loop
  useEffect(() => {
    if (!isAutoRotating || isDragging) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const animate = () => {
      autoRotateAngleRef.current += 1.0;
      const angle = autoRotateAngleRef.current;
      // Gentle smooth oscillation for 3D inspection
      const dynamicY = Math.sin((angle * Math.PI) / 180) * 38;
      const dynamicX = Math.cos((angle * Math.PI) / 220) * 12;

      setRotateY(dynamicY + (isFlipped ? 180 : 0));
      setRotateX(dynamicX);

      // Dynamically move light reflections across the card
      const lightX = 50 + Math.sin((angle * Math.PI) / 180) * 35;
      const lightY = 50 + Math.cos((angle * Math.PI) / 180) * 30;
      setGlarePosition({ x: lightX, y: lightY, opacity: 0.65 });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isAutoRotating, isDragging, isFlipped]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    if (isAutoRotating) setIsAutoRotating(false);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialRotX: rotateX,
      initialRotY: rotateY
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      const newRotY = dragStartRef.current.initialRotY + deltaX * 0.75;
      const newRotX = Math.max(-60, Math.min(60, dragStartRef.current.initialRotX - deltaY * 0.75));

      setRotateX(newRotX);
      setRotateY(newRotY);

      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setGlarePosition({ x, y, opacity: 0.75 });
      }
    } else if (cardRef.current && !isAutoRotating) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const tiltX = (y - 50) * -0.25;
      const tiltY = (x - 50) * 0.35 + (isFlipped ? 180 : 0);
      setRotateX(tiltX);
      setRotateY(tiltY);
      setGlarePosition({ x, y, opacity: 0.55 });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {
      // Ignore if not captured
    }
    setIsDragging(false);

    if (!isAutoRotating) {
      const normalizedY = ((rotateY % 360) + 360) % 360;
      const shouldFlip = normalizedY > 90 && normalizedY < 270;
      setIsFlipped(shouldFlip);
      setRotateX(0);
      setRotateY(shouldFlip ? 180 : 0);
      setGlarePosition((prev) => ({ ...prev, opacity: 0.15 }));
    }
  };

  const handlePointerLeave = () => {
    if (!isDragging && !isAutoRotating) {
      setRotateX(0);
      setRotateY(isFlipped ? 180 : 0);
      setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
    }
  };

  const toggleFlip = () => {
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);
    setRotateX(0);
    setRotateY(nextFlipped ? 180 : 0);
  };

  const resetPosition = () => {
    setIsAutoRotating(false);
    setIsFlipped(false);
    setRotateX(0);
    setRotateY(0);
    setGlarePosition({ x: 50, y: 50, opacity: 0 });
  };

  const handleLightingChangeInternal = (val: number) => {
    setLocalLighting(val);
    onLightingChange?.(val);
  };

  const handleBrightnessChangeInternal = (val: number) => {
    setLocalBrightness(val);
    onBrightnessChange?.(val);
  };

  const handleFinishEffectChangeInternal = (effect: 'holographic' | 'neutral') => {
    setLocalFinishEffect(effect);
    onFinishEffectChange?.(effect);
    onFinishChange?.(effect);
  };

  const handleTextureChangeInternal = (url: string) => {
    setLocalTextureUrl(url);
    onTextureChange?.(url);
  };

  // Shadow calculation based on 3D rotation
  const shadowX = -rotateY * 0.4;
  const shadowY = rotateX * 0.4 + 16;
  const shadowBlur = 24 + Math.abs(rotateX) + Math.abs(rotateY * 0.1);

  // Lighting scale factor (20% to 200%)
  const lightFactor = localLighting / 100;
  // Brightness factor (50% to 150%)
  const brightnessFactor = localBrightness / 100;

  return (
    <div className={`flex flex-col items-center select-none w-full ${className}`}>
      {/* 3D Scene Viewport */}
      <div
        className="w-64 sm:w-72 h-96 relative cursor-grab active:cursor-grabbing touch-none photocard-3d-scene flex items-center justify-center p-3"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        {/* Dynamic Card Body with user lighting & brightness filters */}
        <div
          ref={cardRef}
          className="w-full h-full relative rounded-2xl photocard-3d-card transition-shadow"
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transition: isDragging || isAutoRotating ? 'none' : 'transform 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
            filter: `brightness(${brightnessFactor}) contrast(104%)`,
            boxShadow: `${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0, 0, 0, 0.45)`
          }}
        >
          {/* Card Physical Edge Highlight */}
          <div className="absolute inset-0 rounded-2xl border-2 border-white/20 pointer-events-none z-30" />

          {/* FRONT FACE */}
          <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/80 photocard-face shadow-inner flex flex-col justify-between">
            <img
              src={frontImage}
              alt={photocard.name}
              className="w-full h-full object-cover select-none pointer-events-none"
              draggable={false}
            />

            {/* Custom Texture Map Layer (if textured image loaded) */}
            {localTextureUrl && (
              <div
                className="absolute inset-0 pointer-events-none rounded-2xl mix-blend-overlay opacity-70 transition-opacity"
                style={{
                  backgroundImage: `url(${localTextureUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: localFinishEffect === 'holographic' ? 'hue-rotate(20deg) contrast(120%)' : 'grayscale(100%)'
                }}
              />
            )}

            {/* Holographic vs Neutral Sheen Reflection */}
            {localFinishEffect === 'holographic' ? (
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-150 rounded-2xl mix-blend-color-dodge"
                style={{
                  opacity: Math.min(1, glarePosition.opacity * lightFactor),
                  background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 215, 0, 0.55) 20%, rgba(236, 72, 153, 0.45) 40%, rgba(99, 102, 241, 0.35) 60%, transparent 80%)`
                }}
              />
            ) : (
              /* Neutral Matte Finish: Soft Clean Specular Highlight without rainbow interference */
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-150 rounded-2xl mix-blend-soft-light"
                style={{
                  opacity: Math.min(1, glarePosition.opacity * lightFactor * 0.7),
                  background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.75) 0%, rgba(240, 240, 245, 0.25) 40%, transparent 75%)`
                }}
              />
            )}

            {/* Front Card Badge & Metadata overlay */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/70 text-white backdrop-blur-md border border-white/20">
                {photocard.rarity ? photocard.rarity.replace('_', ' ') : 'Photocard'}
              </span>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md border flex items-center gap-1 ${
                  localFinishEffect === 'holographic'
                    ? 'bg-purple-900/80 text-pink-300 border-pink-400/30'
                    : 'bg-slate-900/80 text-slate-300 border-slate-500/30'
                }`}
              >
                {localFinishEffect === 'holographic' ? '✦ Holo' : '🛡️ Neutral'}
              </span>
            </div>

            {showDetails && (
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-10">
                <p className="text-white text-xs font-black truncate">{photocard.name}</p>
                <p className="text-slate-300 text-[11px] font-medium truncate">{photocard.artist}</p>
              </div>
            )}
          </div>

          {/* BACK FACE */}
          <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden bg-slate-950 border border-indigo-500/50 photocard-face photocard-face-back shadow-inner flex flex-col justify-between p-3.5">
            <img
              src={backImage}
              alt={`${photocard.name} Reverso`}
              className="absolute inset-0 w-full h-full object-cover opacity-100 select-none pointer-events-none"
              draggable={false}
            />

            {/* Texture overlay on back if applied */}
            {localTextureUrl && (
              <div
                className="absolute inset-0 pointer-events-none rounded-2xl mix-blend-overlay opacity-40"
                style={{
                  backgroundImage: `url(${localTextureUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            )}

            {/* Sheen on back face */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-150 rounded-2xl mix-blend-color-dodge"
              style={{
                opacity: Math.min(1, glarePosition.opacity * lightFactor * 0.7),
                background:
                  localFinishEffect === 'holographic'
                    ? `radial-gradient(circle at ${100 - glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.8) 0%, rgba(99, 102, 241, 0.4) 35%, transparent 75%)`
                    : `radial-gradient(circle at ${100 - glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.5) 0%, transparent 60%)`
              }}
            />

            {/* Elegant Corner Badges (non-intrusive) */}
            <div className="relative z-10 w-full flex items-center justify-between text-xs pointer-events-none">
              <span className="font-extrabold tracking-widest text-[10px] px-2 py-0.5 rounded-md bg-black/60 text-indigo-300 backdrop-blur-sm border border-indigo-400/30">
                YM-KI RECORDS
              </span>
              <span className="p-1 rounded-full bg-black/60 backdrop-blur-sm border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </span>
            </div>

            <div className="relative z-10 w-full flex items-center justify-between text-[10px] text-white/90 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 pointer-events-none">
              <span className="font-bold truncate max-w-[140px]">{photocard.name}</span>
              <span className="font-mono text-amber-300 font-bold">REVERSO OFICIAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3 w-full max-w-sm">
        <button
          type="button"
          onClick={toggleFlip}
          className="theme-btn px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" />
          {isFlipped ? 'Frontal' : 'Reverso'}
        </button>

        <button
          type="button"
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer border ${
            isAutoRotating
              ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/20 shadow'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
          }`}
          title="Giro automático dinámico para validar brillo y reflejo"
        >
          {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isAutoRotating ? 'Pausar Giro' : 'Auto-Giro 3D'}
        </button>

        <button
          type="button"
          onClick={resetPosition}
          className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
          title="Centrar tarjeta"
        >
          Centrar
        </button>

        {showControls && (
          <button
            type="button"
            onClick={() => setShowSlidersPanel(!showSlidersPanel)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer border ${
              showSlidersPanel
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-800 border-slate-700 text-indigo-300 hover:text-white'
            }`}
            title="Ajustes de iluminación, brillo y textura"
          >
            <Sliders className="w-3.5 h-3.5" />
            Controles
          </button>
        )}
      </div>

      {/* Expandable Controls Panel: Lighting, Brightness, Effect & Texture */}
      {showControls && (showSlidersPanel || true) && (
        <div className="w-full max-w-sm mt-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 animate-fadeIn text-xs">
          {/* Finish Effect Selector: Holographic vs Neutral */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
              <span>Efecto Visual de la Photocard:</span>
              <span className="text-indigo-400 font-extrabold uppercase text-[10px]">
                {localFinishEffect === 'holographic' ? 'Holográfico 🌈' : 'Neutral / Mate 🛡️'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFinishEffectChangeInternal('holographic')}
                className={`py-1.5 px-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                  localFinishEffect === 'holographic'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-pink-400/50 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                Holográfico
              </button>
              <button
                type="button"
                onClick={() => handleFinishEffectChangeInternal('neutral')}
                className={`py-1.5 px-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                  localFinishEffect === 'neutral'
                    ? 'bg-slate-700 text-white border-slate-400 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
                Neutral (Mate)
              </button>
            </div>
          </div>

          {/* Sliders: Light Intensity & Brightness */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
            {/* Lighting Intensity */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-slate-300 text-[11px]">
                <span className="flex items-center gap-1 font-semibold">
                  <Lightbulb className="w-3 h-3 text-amber-400" /> Iluminación
                </span>
                <span className="text-amber-400 font-mono font-bold text-[10px]">{localLighting}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                step="5"
                value={localLighting}
                onChange={(e) => handleLightingChangeInternal(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Brightness */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-slate-300 text-[11px]">
                <span className="flex items-center gap-1 font-semibold">
                  <Sun className="w-3 h-3 text-indigo-400" /> Brillo
                </span>
                <span className="text-indigo-400 font-mono font-bold text-[10px]">{localBrightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                step="5"
                value={localBrightness}
                onChange={(e) => handleBrightnessChangeInternal(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          {/* Texture Overlay Tool */}
          <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-pink-400" /> Textura del Efecto:
              </span>
              {localTextureUrl && (
                <button
                  type="button"
                  onClick={() => handleTextureChangeInternal('')}
                  className="text-[10px] text-red-400 hover:text-red-300 underline cursor-pointer"
                >
                  Quitar textura
                </button>
              )}
            </div>

            {/* Presets and Upload button */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {PRESET_TEXTURES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTextureChangeInternal(t.url)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition cursor-pointer flex items-center gap-1 ${
                    localTextureUrl === t.url
                      ? 'bg-pink-600 border-pink-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {localTextureUrl === t.url && <Check className="w-2.5 h-2.5 inline" />}
                  {t.name}
                </button>
              ))}

              <FileUploadButton
                onFileUploaded={(url) => handleTextureChangeInternal(url)}
                className="text-[10px] py-1 px-2.5 rounded-lg bg-indigo-600/40 hover:bg-indigo-600/60 border border-indigo-500/50 text-indigo-200"
              />
            </div>

            {/* Optional URL input for custom texture */}
            <input
              type="text"
              placeholder="O pega URL de textura (glitter, foil, estrellas...)"
              value={localTextureUrl}
              onChange={(e) => handleTextureChangeInternal(e.target.value)}
              className="w-full px-2.5 py-1 text-[11px] rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>
      )}

      <p className="text-[11px] text-slate-400 light-theme:text-slate-500 mt-2 flex items-center gap-1 text-center">
        <span>💡 Arrastra la tarjeta con el cursor en cualquier ángulo para rotarla dinámicamente</span>
      </p>
    </div>
  );
};
