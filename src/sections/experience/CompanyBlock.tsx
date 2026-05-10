import type { ExperienceCompany } from '../../data/experience';
import { ProjectCard } from './ProjectCard';
import { CARD_MAX_W_PX, tagOffsetForProjectCount } from './experience.constants';

interface Props {
  company: ExperienceCompany;
}

export function CompanyBlock({ company }: Props) {
  const tagOffset = tagOffsetForProjectCount(company.projects.length);

  return (
    <section
      aria-labelledby={`company-${company.id}`}
      className='experience-company relative mx-auto w-full px-4 py-10 md:px-6'
      style={{ maxWidth: `${CARD_MAX_W_PX + 96}px` }}
    >
      <div className='relative rounded-xl border border-tertiary/40 bg-black/20 px-6 pb-6 pt-12 backdrop-blur-sm md:px-10 md:pt-14'>
        <h3
          id={`company-${company.id}`}
          className='absolute -top-3 left-6 bg-[var(--color-canvas-from)] px-3 font-mono text-sm uppercase tracking-[0.22em] text-secondary md:left-10 md:text-base'
        >
          {company.name}
        </h3>

        <header className='mb-10 flex flex-col gap-2 border-b border-tertiary/20 pb-6 font-mono text-tertiary md:flex-row md:items-baseline md:justify-between md:gap-6'>
          <p className='text-base text-tertiary md:text-lg'>{company.role}</p>
          <p className='text-sm text-tertiary/70'>
            {company.city} · {company.timeline}
          </p>
        </header>

        <div className='experience-stack flex flex-col gap-y-[4vh] md:gap-y-0'>
          {company.projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              total={company.projects.length}
              tagOffsetPx={tagOffset}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
