import { useCallback } from 'react';
import { useLocaleStore } from '../store/useLocaleStore';
import { DICTIONARIES } from './dictionaries';

function resolve(dict: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict);
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in vars ? String(vars[name]) : `{${name}}`,
  );
}

export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  const dict = DICTIONARIES[locale];

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const value = resolve(dict, key);
      if (typeof value === 'string') return interpolate(value, vars);
      if (import.meta.env.DEV) {
        console.warn(`[i18n] missing key: ${key} (locale=${locale})`);
      }
      return key;
    },
    [dict, locale],
  );

  const tArray = useCallback(
    (key: string): readonly string[] => {
      const value = resolve(dict, key);
      if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
        return value as string[];
      }
      if (import.meta.env.DEV) {
        console.warn(`[i18n] missing array key: ${key} (locale=${locale})`);
      }
      return [];
    },
    [dict, locale],
  );

  return { t, tArray, locale };
}
