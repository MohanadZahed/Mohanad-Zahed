import { EXPERIENCE } from '../../data/experience';
import { CompanyBlock } from './CompanyBlock';
import { useT } from '../../i18n/useT';

export function Experience() {
  const { t } = useT();
  return (
    <section
      id='experience'
      aria-labelledby='experience-h2'
      className='experience-section relative'
    >
      <div className='mx-auto max-w-[1472px] px-4 pb-6 pt-20 sm:px-6 sm:pt-24 md:pt-32  mb-7'>
        <p className='font-mono text-xs uppercase tracking-[0.32em] text-quaternary'>
          {t('experience.eyebrow')}
        </p>
        <h2
          id='experience-h2'
          className='mt-3 font-mono text-3xl font-semibold text-secondary md:text-5xl'
        >
          {t('experience.heading')}
        </h2>
        <p className='mt-4 max-w-2xl font-mono text-sm leading-relaxed text-tertiary/70 md:text-base'>
          {t('experience.subhead')}
        </p>
      </div>

      <div className='space-y-[6svh] pb-[10svh]'>
        {EXPERIENCE.map((company) => (
          <CompanyBlock key={company.id} company={company} />
        ))}
      </div>
    </section>
  );
}
