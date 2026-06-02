import { useLocaleStore, type Locale } from '../store/useLocaleStore';

const LOCALES: readonly Locale[] = ['en', 'de'];

export function LanguageSwitcher() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <div
      role='group'
      aria-label='Language switcher'
      className='fixed top-4 right-4 z-50 pointer-events-auto font-mono text-sm select-none flex items-center gap-2 rounded-full px-3 py-1.5'
      style={{
        mixBlendMode: 'normal',
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.35)',
      }}
    >
      {LOCALES.map((l, i) => (
        <span key={l} className='flex items-center'>
          {i > 0 && (
            <span aria-hidden='true' className='mr-2 text-tertiary/40'>
              |
            </span>
          )}
          <button
            type='button'
            onClick={() => setLocale(l)}
            aria-pressed={locale === l}
            aria-label={l === 'en' ? 'Switch to English' : 'Switch to German'}
            className='uppercase tracking-wider transition-colors px-1 cursor-pointer'
            style={{
              color: locale === l ? 'var(--color-tertiary)' : 'rgba(245, 241, 218, 0.55)',
              fontWeight: locale === l ? 700 : 500,
            }}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
