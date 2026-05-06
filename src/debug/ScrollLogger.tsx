import { useScrollStore } from '../store/useScrollStore';

const SECTIONS = [
  { label: 'Hero', start: 0.0 },
  { label: 'About', start: 0.25 },
  { label: 'Skills', start: 0.5 },
  { label: 'Experience', start: 0.75 },
  { label: 'Contact', start: 1.0 },
];

function activeSection(progress: number) {
  let active = SECTIONS[0].label;
  for (const s of SECTIONS) {
    if (progress >= s.start) active = s.label;
  }
  return active;
}

export function ScrollLogger() {
  const progress = useScrollStore((s) => s.progress);

  return (
    <div className='fixed bottom-4 left-4 z-50 font-mono text-xs bg-black/70 text-green-400 rounded px-3 py-2 pointer-events-none select-none leading-5'>
      <div>
        progress: <span className='text-white'>{progress.toFixed(4)}</span>
      </div>
      <div>
        section: <span className='text-yellow-300'>{activeSection(progress)}</span>
      </div>
      <div className='mt-1 w-40 h-1 bg-white/20 rounded-full overflow-hidden'>
        <div
          className='h-full bg-green-400 rounded-full transition-none'
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
