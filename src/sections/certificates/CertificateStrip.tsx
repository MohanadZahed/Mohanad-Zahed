import { useEffect, useLayoutEffect, useRef } from 'react';
import { useScrollStore } from '../../store/useScrollStore';
import { lerp } from '../../scene/lib/math';
import { CertificateCard } from './CertificateCard';
import { CERTIFICATES } from './certificates.data';
import { computeCertificatesLayout } from './certificates.constants';
import { useT } from '../../i18n/useT';
import { rafThrottle } from '../../lib/rafThrottle';

export function CertificateStrip() {
  const { t } = useT();
  const stripRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const xVisibleRef = useRef(0);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const strip = stripRef.current;
    if (!stage || !strip) return;

    const measure = () => {
      const viewportW = stage.clientWidth;
      const { cardW, cardH, gap, headerW, sidePad } = computeCertificatesLayout(viewportW);

      stage.style.setProperty('--cert-card-w', `${cardW}px`);
      stage.style.setProperty('--cert-card-h', `${cardH}px`);
      stage.style.setProperty('--cert-gap', `${gap}px`);
      stage.style.setProperty('--cert-header-w', `${headerW}px`);
      stage.style.setProperty('--cert-pad', `${sidePad}px`);

      const lastCardLeft = sidePad + headerW + gap + (CERTIFICATES.length - 1) * (cardW + gap);
      const lastCardRight = lastCardLeft + cardW;

      xVisibleRef.current = Math.max(0, lastCardRight + sidePad - viewportW);
    };

    const onResize = rafThrottle(measure);
    measure();
    const ro = new ResizeObserver(onResize);
    ro.observe(stage);
    window.addEventListener('resize', onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      onResize.cancel();
    };
  }, []);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const apply = (p: number) => {
      const x = lerp(0, xVisibleRef.current, p);
      strip.style.transform = `translate3d(${-x}px, 0, 0)`;
    };

    apply(useScrollStore.getState().certificatesProgress);

    const unsubscribe = useScrollStore.subscribe((state, prev) => {
      if (state.certificatesProgress === prev.certificatesProgress) return;
      apply(state.certificatesProgress);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div ref={stageRef} className='certificates-stage'>
      <div ref={stripRef} className='certificates-strip'>
        <div className='certificates-header'>
          <h2 id='certificates-h2' className='certificates-header__title'>
            {t('certificates.heading')}
          </h2>
          <p className='certificates-header__sub'>{t('certificates.subhead')}</p>
        </div>

        {CERTIFICATES.map((cert, i) => (
          <CertificateCard key={cert.id} cert={cert} index={i} />
        ))}
      </div>
    </div>
  );
}
