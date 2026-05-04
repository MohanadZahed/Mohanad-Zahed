import { Suspense } from 'react'
import { techStack } from '../data/techStack'
import { LogoPlane } from './LogoPlane'

export function Orbit() {
  const total = techStack.length
  return (
    <Suspense fallback={null}>
      {techStack.map((item, index) => (
        <LogoPlane
          key={item.id}
          index={index}
          total={total}
          texturePath={item.texturePath}
          color={item.color}
        />
      ))}
    </Suspense>
  )
}
