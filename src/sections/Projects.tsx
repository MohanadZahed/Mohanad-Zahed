import { useScrollStore } from '../store/useScrollStore';
import { SECTION_VH } from './notebook/notebook.constants';

const HANDOFF_DISTANCE_VH = (1 - 0.82) * SECTION_VH;

export function Projects() {
  const handoff = useScrollStore((s) => s.notebookHandoff);
  const translateY = -handoff * HANDOFF_DISTANCE_VH;

  return (
    <section
      aria-labelledby='projects-h2'
      className='relative min-h-screen flex items-center bg-canvas-gradient'
      style={{
        transform: `translateY(${translateY}vh)`,
        zIndex: 20,
        willChange: 'transform',
      }}
    >
      <div className='px-8 sm:px-16 max-w-xl'>
        <h2 id='projects-h2' className='text-3xl sm:text-4xl font-semibold text-zinc-100'>
          Projects
        </h2>
        <p className='mt-4 text-zinc-400'>Coming soon.</p>
      </div>
    </section>
  );
}
