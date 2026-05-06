import { useScrollStore } from '../store/useScrollStore';
import { Typewriter } from '../components/Typewriter';

const TRIGGER_PROGRESS = 0.24;

export function Notebook() {
  const progress = useScrollStore((s) => s.progress);
  const started = progress >= TRIGGER_PROGRESS;

  return (
    <section aria-labelledby='notebook-h2' className='relative min-h-screen'>
      <div className='relative h-full flex items-center justify-center' style={{ zIndex: 1 }}>
        <div
          className='text-tertiary'
          style={{
            paddingLeft: 'clamp(1.5rem, 6vw, 6rem)',
            paddingRight: 'clamp(1.5rem, 6vw, 6rem)',
            paddingTop: 'clamp(4rem, 10vh, 8rem)',
            paddingBottom: 'clamp(4rem, 10vh, 8rem)',
          }}
        >
          <Typewriter
            as='h2'
            id='notebook-h2'
            text='elevate your system'
            start={started}
            cursorMode='hide'
            className='font-bold uppercase'
            style={{
              fontSize: 'clamp(2rem, 5vw, 4.5rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.05vw',
            }}
          />
        </div>
      </div>
    </section>
  );
}
