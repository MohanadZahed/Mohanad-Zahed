import { FONTS, FONT_IDS, useFontStore, type FontId } from '../store/useFontStore';

export function FontSwitcher() {
  const font = useFontStore((s) => s.font);
  const setFont = useFontStore((s) => s.setFont);

  return (
    <div
      className='pointer-events-auto relative flex items-center rounded-full text-sm select-none'
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.35)',
        // Keep the control chrome on the fixed terminal font so the label
        // stays stable while the rest of the site changes.
        fontFamily: 'var(--font-terminal)',
      }}
    >
      <select
        aria-label='Font switcher'
        value={font}
        onChange={(e) => setFont(e.target.value as FontId)}
        className='cursor-pointer appearance-none bg-transparent py-1.5 pr-8 pl-4 tracking-wider focus:outline-none'
        style={{ color: 'var(--color-tertiary)' }}
      >
        {FONT_IDS.map((id) => (
          <option
            key={id}
            value={id}
            // Preview each font in its own family (honoured by most desktop
            // browsers; harmless where the native menu ignores it).
            style={{ fontFamily: FONTS[id].stack, color: '#111', backgroundColor: '#f3eed6' }}
          >
            {FONTS[id].label}
          </option>
        ))}
      </select>
      <span
        aria-hidden='true'
        className='pointer-events-none absolute right-3 text-xs'
        style={{ color: 'rgba(245, 241, 218, 0.55)' }}
      >
        ▾
      </span>
    </div>
  );
}
