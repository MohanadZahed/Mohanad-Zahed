import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Color, MathUtils } from 'three'
import type { Group, Material, Mesh } from 'three'
import { useScrollStore } from '../store/useScrollStore'
import { smoothstep } from './lib/math'

const ABOUT_YAW = Math.PI / 5

export function Avatar() {
  const groupRef = useRef<Group>(null)
  const { nodes } = useGLTF('/models/avatar.glb') as unknown as {
    nodes: { mesh_0: Mesh }
  }

  const material = useMemo(() => {
    const src = nodes.mesh_0.material
    const sources = Array.isArray(src) ? src : [src]
    const cloned = sources.map((m) => {
      const c = (m as Material).clone()
      const colored = c as unknown as { color?: Color }
      if (colored.color instanceof Color) {
        colored.color.r = Math.min(1, colored.color.r * 1.25)
        colored.color.g = Math.min(1, colored.color.g * 1.25)
        colored.color.b = Math.min(1, colored.color.b * 1.25)
      }
      return c
    })
    return Array.isArray(src) ? cloned : cloned[0]
  }, [nodes])

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return
    const t = state.clock.elapsedTime
    group.position.y = Math.sin(t * 0.6) * 0.05
    const progress = useScrollStore.getState().progress
    const yawTarget = smoothstep(0.10, 0.20, progress) * ABOUT_YAW
    group.rotation.y = MathUtils.damp(group.rotation.y, yawTarget, 4, delta)
  })

  return (
    <group ref={groupRef} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.mesh_0.geometry}
        material={material}
      />
    </group>
  )
}

useGLTF.preload('/models/avatar.glb')
