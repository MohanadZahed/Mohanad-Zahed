import type { CSSProperties } from 'react';
import type { Skill, SkillCategory, SkillSize } from './skills.data';

const CATEGORY_COLOR: Record<SkillCategory, string> = {
  frontend: '#38bdf8',
  backend: '#a78bfa',
  ai: '#34d399',
  devops: '#f59e0b',
};

const SIZE_CLASS: Record<SkillSize, string> = {
  sm: 'chip--sm',
  md: 'chip--md',
  lg: 'chip--lg',
};

function levelColor(level: number): string {
  if (level <= 30) return '#ef4444';
  if (level <= 60) return '#fbbf24';
  return '#22c55e';
}

export function Microchip({ skill }: { skill: Skill }) {
  const barColor = levelColor(skill.level);
  const style = {
    '--bar-color': barColor,
    '--cat-color': CATEGORY_COLOR[skill.category],
  } as CSSProperties;

  return (
    <div
      className={`chip ${SIZE_CLASS[skill.size]}`}
      role='meter'
      aria-label={skill.label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={skill.level}
      style={style}
    >
      <span className='chip__pins chip__pins--top' aria-hidden />
      <span className='chip__pins chip__pins--bottom' aria-hidden />
      <div className='chip__head'>
        <span className='chip__cat-dot' aria-hidden />
        <span className='chip__label'>{skill.label}</span>
      </div>
      <div className='chip__bar'>
        <div className='chip__bar-fill' style={{ width: `${skill.level}%` }} />
      </div>
    </div>
  );
}
