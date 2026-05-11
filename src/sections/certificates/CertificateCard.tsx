import type { CSSProperties } from 'react';
import type { Certificate } from './certificates.data';
import { rotationForIndex } from './certificates.constants';

interface CertificateCardProps {
  cert: Certificate;
  index: number;
  /** When true, the card renders flat (no rotation) for stacked mobile / reduced-motion. */
  flat?: boolean;
}

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function formatDate(mmYYYY: string): string {
  const [mm, yyyy] = mmYYYY.split('/');
  const m = Number.parseInt(mm, 10);
  if (!Number.isFinite(m) || m < 1 || m > 12 || !yyyy) return mmYYYY;
  return `${MONTH_LABELS[m - 1]} ${yyyy}`;
}

export function CertificateCard({ cert, index, flat = false }: CertificateCardProps) {
  const rotation = flat ? 0 : rotationForIndex(index);
  const style: CSSProperties = { transform: `rotate(${rotation}deg)` };

  return (
    <article className='certificate-card' style={style} aria-label={cert.name}>
      <div className='certificate-card__inner'>
        <header className='certificate-card__header'>
          <span className='certificate-card__eyebrow'>Certificate of Achievement</span>
          <span className='certificate-card__index'>
            {String(index + 1).padStart(2, '0')}
          </span>
        </header>

        <div className='certificate-card__body'>
          <h3 className='certificate-card__title'>{cert.name}</h3>
          <p className='certificate-card__issuer'>{cert.issuer}</p>
        </div>

        <footer className='certificate-card__footer'>
          <div className='certificate-card__date'>
            <span className='certificate-card__date-label'>Issued</span>
            <span className='certificate-card__date-value'>{formatDate(cert.date)}</span>
          </div>
          <div className='certificate-card__seal' aria-hidden />
        </footer>
      </div>
    </article>
  );
}
