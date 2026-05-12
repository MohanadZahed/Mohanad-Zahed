import type { CSSProperties } from 'react';

type Props = {
  text: string;
  href: string;
  external?: boolean;
  ariaLabel?: string;
  className?: string;
};

export function FlipLink({ text, href, external, ariaLabel, className }: Props) {
  const chars = Array.from(text);
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      aria-label={ariaLabel ?? text}
      className={`flip-link${className ? ` ${className}` : ''}`}
    >
      <span className='flip-link__inner' aria-hidden='true'>
        {chars.map((ch, i) => {
          const display = ch === ' ' ? ' ' : ch;
          return (
            <span
              key={i}
              className='flip-link__clip'
              style={{ '--i': i } as CSSProperties}
            >
              <span className='flip-link__slide'>
                {display}
                <span className='flip-link__ghost'>{display}</span>
              </span>
            </span>
          );
        })}
      </span>
    </a>
  );
}
