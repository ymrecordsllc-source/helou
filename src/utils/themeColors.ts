/**
 * Helper to generate harmonious darker shades, gradients and CSS variables
 * based on the user-selected button/theme color.
 */

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) {
    return { r: 99, g: 102, b: 241 }; // fallback indigo
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function getDarkerShade(hex: string, factor = 0.4): string {
  const { r, g, b } = hexToRgb(hex);
  // factor 0 to 1 where 0 is unchanged, 1 is black
  return rgbToHex(r * (1 - factor), g * (1 - factor), b * (1 - factor));
}

export function getLighterShade(hex: string, factor = 0.25): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * factor, g + (255 - g) * factor, b + (255 - b) * factor);
}

export interface ThemeColors {
  primary: string;
  dark: string;
  darker: string;
  light: string;
  glow: string;
  gradient: string;
  bannerGradient: string;
}

export function computeThemeColors(hex: string): ThemeColors {
  const validHex = hex && hex.startsWith('#') ? hex : '#6366f1';
  const { r, g, b } = hexToRgb(validHex);
  const dark = getDarkerShade(validHex, 0.42);
  const darker = getDarkerShade(validHex, 0.72);
  const light = getLighterShade(validHex, 0.22);
  const glow = `rgba(${r}, ${g}, ${b}, 0.25)`;

  return {
    primary: validHex,
    dark,
    darker,
    light,
    glow,
    gradient: validHex,
    bannerGradient: dark
  };
}

export function applyThemeToDocument(hex: string, buttonTheme?: {
  bgColor: string;
  textColor: string;
  borderColor: string;
  hoverBgColor: string;
  activeBgColor: string;
}) {
  const theme = computeThemeColors(hex);
  const root = document.documentElement;

  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--theme-primary', theme.primary);
  root.style.setProperty('--theme-dark', theme.dark);
  root.style.setProperty('--theme-darker', theme.darker);
  root.style.setProperty('--theme-light', theme.light);
  root.style.setProperty('--theme-glow', theme.glow);
  root.style.setProperty('--theme-gradient', theme.primary);
  root.style.setProperty('--theme-banner', theme.dark);

  // Apply button theme tokens
  const btnBg = buttonTheme?.bgColor || theme.primary;
  const btnText = buttonTheme?.textColor || '#ffffff';
  const btnBorder = buttonTheme?.borderColor || btnBg;
  const btnHover = buttonTheme?.hoverBgColor || getDarkerShade(btnBg, 0.15);
  const btnActive = buttonTheme?.activeBgColor || getDarkerShade(btnBg, 0.3);

  root.style.setProperty('--btn-bg', btnBg);
  root.style.setProperty('--btn-text', btnText);
  root.style.setProperty('--btn-border', btnBorder);
  root.style.setProperty('--btn-hover-bg', btnHover);
  root.style.setProperty('--btn-active-bg', btnActive);
}
