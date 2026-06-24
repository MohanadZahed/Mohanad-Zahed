import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollStore } from '../../store/useScrollStore';
import { CertificateStrip } from './CertificateStrip';
import { CertificateCard } from './CertificateCard';
import { CERTIFICATES } from './certificates.data';
import { SECTION_VH, STACK_BREAKPOINT_PX } from './certificates.constants';
import { useT } from '../../i18n/useT';
import { useFitText } from '../../hooks/useFitText';

gsap.registerPlugin(ScrollTrigger);

export function Certificates() {
  const { t } = useT();
  const fitHeading = useFitText<HTMLHeadingElement>({ text: t('certificates.heading') });
  const sectionRef = useRef<HTMLElement>(null);
  const [isCompact, setIsCompact] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${STACK_BREAKPOINT_PX - 1}px)`);
    const rmq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setIsCompact(mq.matches);
      setReduceMotion(rmq.matches);
    };
    sync();
    mq.addEventListener('change', sync);
    rmq.addEventListener('change', sync);
    return () => {
      mq.removeEventListener('change', sync);
      rmq.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (isCompact || reduceMotion) {
      useScrollStore.getState().setCertificatesProgress(0);
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        useScrollStore.getState().setCertificatesProgress(self.progress);
      },
    });

    return () => trigger.kill();
  }, [isCompact, reduceMotion]);

  if (isCompact || reduceMotion) {
    return (
      <section
        ref={sectionRef}
        id='Certificates'
        aria-labelledby='certificates-h2'
        className='certificates-section relative'
      >
        <div className='certificates-fallback'>
          <header className='max-w-md text-center'>
            <span className='certificates-header__eyebrow block'>{t('certificates.eyebrow')}</span>
            <h2 id='certificates-h2' ref={fitHeading} className='certificates-header__title mt-3 text-balance'>
              {t('certificates.heading')}
            </h2>
          </header>
          {CERTIFICATES.map((cert, i) => (
            <CertificateCard key={cert.id} cert={cert} index={i} flat />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id='Certificates'
      aria-labelledby='certificates-h2'
      className='certificates-section relative'
      style={{ height: `${SECTION_VH}svh` }}
    >
      <CertificateStrip />
    </section>
  );
}
