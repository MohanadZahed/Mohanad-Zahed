import { create } from 'zustand';

export type FontId =
  | 'roboto-mono'
  | 'inter'
  | 'space-grotesk'
  | 'jetbrains-mono'
  | 'lora'
  | 'syncopate'
  | 'archivo'
  | 'sora'
  | 'montserrat';

interface FontDef {
  label: string;
  stack: string;
}

// Roster of selectable site fonts. `stack` is the CSS font-family value written
// into the global `--font-mono` custom property; the loaded web fonts come from
// the Google Fonts <link> in index.html. The two manifesto code areas stay on
// the fixed `--font-terminal` token, so they are unaffected by this switch.
export const FONTS: Record<FontId, FontDef> = {
  'roboto-mono': {
    label: 'Roboto Mono',
    stack:
      "'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  inter: {
    label: 'Inter',
    stack: "'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  'space-grotesk': {
    label: 'Space Grotesk',
    stack: "'Space Grotesk', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  'jetbrains-mono': {
    label: 'JetBrains Mono',
    stack:
      "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  lora: {
    label: 'Lora',
    stack: "'Lora', Georgia, 'Times New Roman', serif",
  },
  syncopate: {
    label: 'Syncopate',
    stack: "'Syncopate', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  archivo: {
    label: 'Archivo',
    stack: "'Archivo', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  sora: {
    label: 'Sora',
    stack: "'Sora', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  montserrat: {
    label: 'Montserrat',
    stack: "'Montserrat', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
};

export const FONT_IDS = Object.keys(FONTS) as FontId[];

const STORAGE_KEY = 'font';
const DEFAULT_FONT: FontId = 'roboto-mono';

function getInitialFont(): FontId {
  if (typeof window === 'undefined') return DEFAULT_FONT;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && stored in FONTS) return stored as FontId;
  } catch {
    // localStorage may be unavailable (private mode, SSR-like contexts)
  }
  return DEFAULT_FONT;
}

// Inline style on the :root/html element overrides the @theme-generated
// `:root { --font-mono: ... }` rule, so every consumer of --font-mono updates.
function applyFont(id: FontId) {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty('--font-mono', FONTS[id].stack);
}

interface FontState {
  font: FontId;
  setFont: (font: FontId) => void;
}

const initial = getInitialFont();
applyFont(initial);

export const useFontStore = create<FontState>((set) => ({
  font: initial,
  setFont: (font) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, font);
    } catch {
      // ignore
    }
    applyFont(font);
    set({ font });
  },
}));
