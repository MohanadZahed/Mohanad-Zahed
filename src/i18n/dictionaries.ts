import en from '../locales/en.json';
import de from '../locales/de.json';
import type { Locale } from '../store/useLocaleStore';

export const DICTIONARIES: Record<Locale, unknown> = { en, de };
