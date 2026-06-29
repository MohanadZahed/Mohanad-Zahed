import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FlipLink } from '../components/FlipLink';
import { useScrollStore } from '../store/useScrollStore';
import { useT } from '../i18n/useT';
import { useFitText } from '../hooks/useFitText';
import { rafThrottle } from '../lib/rafThrottle';

gsap.registerPlugin(ScrollTrigger);

export function Contact() {
  const { t } = useT();
  const sectionRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const truckRef = useRef<HTMLImageElement>(null);

  // Heading is centered + shrink-to-content, so budget the parent box (the
  // `max-w-full` row, which clamps to the column width when the nowrap text
  // overflows) rather than its own text-width box.
  const fitHeadline = useFitText<HTMLHeadingElement>({
    text: t('contact.headline'),
    widthFrom: 'parent',
  });

  // Merge the fit callback ref with headlineRef (used below for the clip-path).
  const setHeadline = (node: HTMLHeadingElement | null) => {
    headlineRef.current = node;
    fitHeadline(node);
  };

  useEffect(() => {
    const section = sectionRef.current;
    const row = rowRef.current;
    const headline = headlineRef.current;
    const truck = truckRef.current;
    if (!section || !row || !headline || !truck) return;

    const rmq = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Cache the row width and re-measure only on resize — reading offsetWidth
    // inside apply() (which runs every scroll tick, right after writing the
    // truck transform) forces a synchronous layout flush on every frame.
    let rowW = row.offsetWidth;
    const measure = rafThrottle(() => {
      rowW = row.offsetWidth;
      apply(useScrollStore.getState().contactProgress);
    });

    const apply = (p: number) => {
      // truck ends with its left edge at the right side of the text, fully clearing it
      const x = p * rowW;
      truck.style.transform = `translate3d(${x}px, -50%, 0)`;
      headline.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
    };

    if (rmq.matches) {
      apply(1);
      return;
    }

    window.addEventListener('resize', measure);

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
      window.removeEventListener('resize', measure);
      measure.cancel();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id='Contact'
      aria-labelledby='contact-h2'
      className='relative isolate flex flex-col min-h-150 md:min-h-170.5 md:h-170.5'
      style={{
        background:
          'radial-gradient(ellipse at 50% 110%, rgba(0,65,109,0.45) 0%, transparent 65%), linear-gradient(to bottom, #0d1117 0%, #060d16 100%)',
      }}
    >
      <img
        src='/textures/minime-coffee.png'
        alt=''
        className='absolute left-3 sm:left-6 w-20 sm:w-32 md:w-48 pointer-events-none select-none z-100 bottom-[93%] sm:bottom-[86%]'
      />

      <div className='flex-1 flex items-center justify-center'>
        <div className='w-full px-5 sm:px-10 md:px-16 max-w-2xl text-center'>
          <div className='flex justify-center'>
            <div ref={rowRef} className='relative inline-block max-w-full'>
              <h2
                ref={setHeadline}
                id='contact-h2'
                className='font-semibold uppercase text-zinc-100 whitespace-nowrap text-[clamp(2.5rem,7vw,3.25rem)] sm:text-[4rem] md:text-[4.75rem]'
                style={{ clipPath: 'inset(0 100% 0 0)', lineHeight: 'normal' }}
              >
                {t('contact.headline')}
              </h2>
              <img
                ref={truckRef}
                src='/textures/minime-truck.png'
                alt=''
                className='absolute left-0 top-1/2 w-16 sm:w-28 md:w-48 pointer-events-none select-none'
                style={{ transform: 'translate3d(0, -50%, 0)' }}
              />
            </div>
          </div>

          <p className='mt-6 text-sm sm:text-lg text-zinc-400 leading-relaxed'>
            {t('contact.subhead')}
          </p>

          <p className='mt-8 text-zinc-400'>
            Email:&nbsp;
            <a
              href='mailto:mzahed-p@outlook.com'
              className='text-[var(--color-accent-sky)] underline-offset-4 hover:underline'
            >
              mzahed-p@outlook.com
            </a>
          </p>

          <div className='mt-6 flex flex-wrap justify-center gap-4'>
            <FlipLink text={t('contact.getInTouch')} href='mailto:mzahed-p@outlook.com' />
            <FlipLink
              text={t('contact.linkedin')}
              href='https://www.linkedin.com/in/m-zahed/'
              external
            />
            <FlipLink
              text={t('contact.xing')}
              href='https://www.xing.com/profile/Mohanad_Zahed'
              external
            />
          </div>

          <img
            src='/textures/minime-programming.png'
            alt=''
            className='mx-auto w-28 sm:w-32 md:w-36 pointer-events-none select-none -scale-x-100'
          />
        </div>
      </div>

      <footer className='relative z-10 pb-6 px-5 sm:px-10 md:px-16 text-center text-xs text-zinc-500'>
        <p>{t('contact.copyright')}</p>
        <p className='mt-1'>
          {t('contact.builtWith')} · v{__APP_VERSION__}
        </p>
      </footer>
    </section>
  );
}
