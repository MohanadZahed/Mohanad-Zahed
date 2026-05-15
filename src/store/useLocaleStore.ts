import { create } from 'zustand';

export type Locale = 'en' | 'de';

const STORAGE_KEY = 'locale';

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'de') return stored;
  } catch {
    // localStorage may be unavailable (private mode, SSR-like contexts)
  }
  const nav = window.navigator?.language?.toLowerCase() ?? '';
  return nav.startsWith('de') ? 'de' : 'en';
}

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const initial = getInitialLocale();

if (typeof document !== 'undefined') {
  document.documentElement.lang = initial;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: initial,
  setLocale: (locale) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
    set({ locale });
  },
}));
