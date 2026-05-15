import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FlipLink } from '../components/FlipLink';
import { useScrollStore } from '../store/useScrollStore';
import { useT } from '../i18n/useT';

gsap.registerPlugin(ScrollTrigger);

export function Contact() {
  const { t } = useT();
  const sectionRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const truckRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const row = rowRef.current;
    const headline = headlineRef.current;
    const truck = truckRef.current;
    if (!section || !row || !headline || !truck) return;

    const rmq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const apply = (p: number) => {
      const rowW = row.offsetWidth;
      // truck ends with its left edge at the right side of the text, fully clearing it
      const x = p * rowW;
      truck.style.transform = `translate3d(${x}px, -50%, 0)`;
      headline.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
    };

    if (rmq.matches) {
      apply(1);
      return;
    }

    apply(useScrollStore.getState().contactProgress);

    // Use the section as trigger so progress reaches 1 by the time the page ends
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      end: 'bottom bottom',
      onUpdate: (self) => {
        useScrollStore.getState().setContactProgress(self.progress);
      },
    });

    const unsubscribe = useScrollStore.subscribe((state, prev) => {
      if (state.contactProgress === prev.contactProgress) return;
      apply(state.contactProgress);
    });

    return () => {
      trigger.kill();
      unsubscribe();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby='contact-h2'
      className='relative flex flex-col'
      style={{
        height: '750px',
        background:
          'radial-gradient(ellipse at 50% 110%, rgba(0,65,109,0.45) 0%, transparent 65%), linear-gradient(to bottom, #0d1117 0%, #060d16 100%)',
      }}
    >
      <img
        src='/textures/minime-coffee.png'
        alt=''
        className='absolute left-6 w-32 sm:w-40 md:w-48 pointer-events-none select-none z-100'
        style={{ top: '-192px' }}
      />

      <div className='flex-1 flex items-center justify-center'>
        <div className='px-8 sm:px-16 max-w-2xl text-center'>
          <div className='flex justify-center'>
            <div ref={rowRef} className='relative inline-block'>
              <h2
                ref={headlineRef}
                id='contact-h2'
                className='text-4xl sm:text-5xl md:text-6xl font-semibold text-zinc-100 whitespace-nowrap'
                style={{ clipPath: 'inset(0 100% 0 0)', lineHeight: 'normal' }}
              >
                {t('contact.headline')}
              </h2>
              <img
                ref={truckRef}
                src='/textures/minime-truck.png'
                alt=''
                className='absolute left-0 top-1/2 w-24 sm:w-28 md:w-48 pointer-events-none select-none'
                style={{ transform: 'translate3d(0, -50%, 0)' }}
              />
            </div>
          </div>

          <p className='mt-6 text-lg text-zinc-400 leading-relaxed'>
            {t('contact.subhead')}
          </p>

          <p className='mt-8 text-zinc-400'>
            <a
              href='mailto:mzahed-p@outlook.com'
              className='text-[var(--color-accent-sky)] underline-offset-4 hover:underline'
            >
              mzahed-p@outlook.com
            </a>
          </p>

          <div className='mt-6 flex flex-wrap justify-center gap-4'>
            <FlipLink text={t('contact.getInTouch')} href='mailto:mzahed-p@outlook.com' />
            <FlipLink text={t('contact.linkedin')} href='https://www.linkedin.com/in/m-zahed/' external />
          </div>

          <img
            src='/textures/minime-programming.png'
            alt=''
            className='mx-auto mt-8 w-28 sm:w-32 md:w-36 pointer-events-none select-none -scale-x-100'
          />
        </div>
      </div>

      <footer className='relative z-10 pb-6 px-8 sm:px-16 text-center text-xs text-zinc-500'>
        <p>{t('contact.copyright')}</p>
        <p className='mt-1'>{t('contact.builtWith')}</p>
      </footer>
    </section>
  );
}
