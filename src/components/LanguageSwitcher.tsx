import { useEffect, useRef } from 'react';
import { useLocaleStore, type Locale } from '../store/useLocaleStore';
import { useScrollStore } from '../store/useScrollStore';

const LOCALES: readonly Locale[] = ['en', 'de'];

// How far the switcher slides up (px) to clear the top edge when scrolling down.
const HIDE_OFFSET_PX = 96;
// Minimum scroll-progress delta before we commit to a direction — filters jitter.
const DIRECTION_THRESHOLD = 0.0015;

export function LanguageSwitcher() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    let lastProgress = useScrollStore.getState().progress;
    let hidden = false;

    const apply = () => {
      el.style.transform = hidden ? `translateY(-${HIDE_OFFSET_PX}px)` : 'translateY(0)';
      el.style.opacity = hidden ? '0' : '1';
    };
    apply();

    const unsubscribe = useScrollStore.subscribe((state) => {
      const p = state.progress;
      const delta = p - lastProgress;
      if (Math.abs(delta) < DIRECTION_THRESHOLD) return;
      const nextHidden = delta > 0; // scrolling down → hide, up → show
      lastProgress = p;
      if (nextHidden === hidden) return;
      hidden = nextHidden;
      apply();
    });

    return unsubscribe;
  }, []);

  return (
    <div
      ref={rootRef}
      id='LanguageSwitcher'
      role='group'
      aria-label='Language switcher'
      className='pointer-events-auto text-sm select-none flex items-center gap-2 rounded-full px-3 py-1.5'
      style={{
        fontFamily: 'var(--font-terminal)',
        mixBlendMode: 'normal',
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.35)',
        transition: 'transform 0.4s ease, opacity 0.4s ease',
        willChange: 'transform',
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
