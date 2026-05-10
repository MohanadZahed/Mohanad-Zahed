import { Microchip } from './Microchip';
import { skills, type Skill, type SkillCategory } from './skills.data';

const CATEGORY_ORDER: SkillCategory[] = ['frontend', 'backend', 'devops', 'ai'];

function fnv(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rand01(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function span(skill: Skill): { col: number; row: number } {
  const r = rand01(fnv(skill.id));
  switch (skill.size) {
    case 'lg':
      return { col: 2, row: 2 };
    case 'md':
      return r < 0.5 ? { col: 2, row: 1 } : { col: 1, row: 2 };
    case 'sm':
    default:
      return { col: 1, row: 1 };
  }
}

export function ChipScatter() {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: skills.filter((s) => s.category === cat),
  }));

  return (
    <div className='relative z-10 px-6 sm:px-12 pt-28 pb-12 mx-auto flex flex-col gap-16' style={{ maxWidth: '125rem' }}>
      {grouped.map(({ category, items }) => (
        <div
          key={category}
          className='grid'
          style={{
            gap: 'calc(var(--spacing) * 6)',
            gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
            gridAutoRows: '64px',
            gridAutoFlow: 'dense',
          }}
        >
          {items.map((s) => {
            const sp = span(s);
            return (
              <div
                key={s.id}
                style={{
                  gridColumn: `span ${sp.col}`,
                  gridRow: `span ${sp.row}`,
                }}
              >
                <Microchip skill={s} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
