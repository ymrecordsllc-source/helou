import React from 'react';

interface AvatarWithFrameProps {
  src?: string;
  avatarUrl?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  ringColor?: string;
  frameCustomColor?: string;
  transparentFrame?: string | null;
  frameStyle?: string;
  frameScale?: number;
  frameOffsetX?: number;
  frameOffsetY?: number;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const AvatarWithFrame: React.FC<AvatarWithFrameProps> = ({
  src,
  avatarUrl,
  alt = 'Avatar',
  size = 'md',
  ringColor = '#6366f1',
  frameCustomColor,
  transparentFrame,
  frameStyle,
  frameScale = 1.08,
  frameOffsetX = 0,
  frameOffsetY = 0,
  className = '',
  onClick
}) => {
  const sizeMap = {
    xs: { outer: 'w-7 h-7', inner: 'w-6 h-6', ringPad: 'p-0.5', frameInset: '-inset-1', borderWidth: 2 },
    sm: { outer: 'w-9 h-9', inner: 'w-8 h-8', ringPad: 'p-0.5', frameInset: '-inset-1', borderWidth: 2 },
    md: { outer: 'w-11 h-11', inner: 'w-10 h-10', ringPad: 'p-0.5', frameInset: '-inset-1.5', borderWidth: 2.5 },
    lg: { outer: 'w-16 h-16', inner: 'w-14 h-14', ringPad: 'p-1', frameInset: '-inset-2', borderWidth: 3 },
    xl: { outer: 'w-24 h-24', inner: 'w-20 h-20', ringPad: 'p-1.5', frameInset: '-inset-2.5', borderWidth: 3.5 },
    '2xl': { outer: 'w-32 h-32', inner: 'w-28 h-28', ringPad: 'p-2', frameInset: '-inset-3.5', borderWidth: 4 },
  };

  const currentSize = sizeMap[size];
  const fallbackSrc = '/default_avatar.jpg';
  const effectiveSrc = (src && src.trim()) ? src : (avatarUrl && avatarUrl.trim()) ? avatarUrl : fallbackSrc;
  const avatarSrc = effectiveSrc;
  const effectiveColor = frameCustomColor || ringColor || '#6366f1';

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${currentSize.outer} ${
        onClick ? 'cursor-pointer hover:opacity-95 transition-all active:scale-95' : ''
      } ${className}`}
    >
      {/* Decorative store frame styling overlays */}
      {frameStyle === 'cyber_neon' && (
        <div
          className="absolute -inset-1.5 rounded-full pointer-events-none animate-pulse opacity-85 z-10"
          style={{
            background: `radial-gradient(circle, transparent 55%, ${effectiveColor} 85%, #ec4899 100%)`,
            boxShadow: `0 0 14px ${effectiveColor}`
          }}
        />
      )}

      {frameStyle === 'gold_star' && (
        <div
          className="absolute -inset-2 rounded-full pointer-events-none z-10 border-2 border-dashed"
          style={{
            borderColor: effectiveColor,
            boxShadow: `0 0 16px ${effectiveColor}70`
          }}
        />
      )}

      {frameStyle === 'prism_diamond' && (
        <div
          className="absolute -inset-1.5 rounded-full pointer-events-none z-10"
          style={{
            border: `3px double ${effectiveColor}`,
            boxShadow: `0 0 20px ${effectiveColor}80`
          }}
        />
      )}

      {frameStyle === 'sakura' && (
        <div
          className="absolute -inset-1.5 rounded-full pointer-events-none z-10"
          style={{
            border: `2px solid ${effectiveColor}`,
            boxShadow: `0 0 12px ${effectiveColor}50`
          }}
        />
      )}

      {/* Main Base Ring Border */}
      <div
        className="absolute inset-0 rounded-full transition-all"
        style={{
          border: `${currentSize.borderWidth}px solid ${effectiveColor}`,
          boxShadow: `0 0 12px ${effectiveColor}40`
        }}
      />

      {/* Custom Transparent Frame Image (Uploaded PNG/WebP with alpha channel, gallery frame, or store PNG frame) */}
      {(transparentFrame || (frameStyle && (frameStyle.startsWith('data:') || frameStyle.startsWith('http') || frameStyle.includes('/')))) && (
        <div
          className={`absolute ${currentSize.frameInset} pointer-events-none rounded-full bg-contain bg-center bg-no-repeat z-20`}
          style={{
            backgroundImage: `url("${transparentFrame || frameStyle}")`,
            transform: `scale(${frameScale || 1.08}) translate(${frameOffsetX || 0}px, ${frameOffsetY || 0}px)`
          }}
        />
      )}

      {/* Internal Avatar Photo (Never fully blocked or distorted) */}
      <div className={`rounded-full overflow-hidden ${currentSize.inner} bg-slate-800 z-0`}>
        <img
          src={avatarSrc}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = fallbackSrc;
          }}
        />
      </div>
    </div>
  );
};
