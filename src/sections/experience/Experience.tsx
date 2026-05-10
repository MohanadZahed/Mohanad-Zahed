import { EXPERIENCE } from '../../data/experience';
import { CompanyBlock } from './CompanyBlock';

export function Experience() {
  return (
    <section
      id='experience'
      aria-labelledby='experience-h2'
      className='experience-section relative'
    >
      <div className='mx-auto max-w-[1472px] px-6 pb-6 pt-24 md:pt-32'>
        <p className='font-mono text-xs uppercase tracking-[0.32em] text-secondary'>
          Berufserfahrung
        </p>
        <h2
          id='experience-h2'
          className='mt-3 font-mono text-3xl font-semibold text-tertiary md:text-5xl'
        >
          Where I&apos;ve shipped.
        </h2>
        <p className='mt-4 max-w-2xl font-mono text-sm leading-relaxed text-tertiary/70 md:text-base'>
          Three companies, twelve projects, eight years. Each card stacks as you scroll —
          the most recent rests on top, the rest fan out as tabs.
        </p>
      </div>

      <div className='space-y-[6vh] pb-[10vh]'>
        {EXPERIENCE.map((company) => (
          <CompanyBlock key={company.id} company={company} />
        ))}
      </div>
    </section>
  );
}
