import { useEffect, useLayoutEffect, useRef } from 'react';
import { useScrollStore } from '../../store/useScrollStore';
import { lerp } from '../../scene/lib/math';
import { CertificateCard } from './CertificateCard';
import { CERTIFICATES } from './certificates.data';
import {
  computeCertificatesLayout,
  PHASE_A_FRACTION,
} from './certificates.constants';

export function CertificateStrip() {
  const stripRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const xCentreRef = useRef(0);
  const xOffscreenRef = useRef(0);

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

      const lastCardLeft =
        sidePad +
        headerW +
        gap +
        (CERTIFICATES.length - 1) * (cardW + gap);
      const lastCardCentre = lastCardLeft + cardW / 2;
      const lastCardRight = lastCardLeft + cardW;

      xCentreRef.current = Math.max(0, lastCardCentre - viewportW / 2);
      xOffscreenRef.current = Math.max(
        xCentreRef.current,
        lastCardRight + sidePad,
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const apply = (p: number) => {
      const phaseA = PHASE_A_FRACTION;
      const xCentre = xCentreRef.current;
      const xOff = xOffscreenRef.current;
      const x =
        p <= phaseA
          ? lerp(0, xCentre, phaseA > 0 ? p / phaseA : 0)
          : lerp(xCentre, xOff, (p - phaseA) / (1 - phaseA));
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
          <span className='certificates-header__eyebrow'>Zertifikate</span>
          <h2 id='certificates-h2' className='certificates-header__title'>
            ich habe <em>{CERTIFICATES.length}</em>
            <br />
            Zertifikate
          </h2>
          <p className='certificates-header__sub'>
            Continuing education in architecture, delivery, testing, and language —
            scroll left to leaf through them.
          </p>
        </div>

        {CERTIFICATES.map((cert, i) => (
          <CertificateCard key={cert.id} cert={cert} index={i} />
        ))}
      </div>
    </div>
  );
}
