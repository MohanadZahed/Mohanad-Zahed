import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { Group, Mesh, SRGBColorSpace, Vector3 } from 'three'
import { useScrollStore } from '../store/useScrollStore'
import { logoPosition } from './lib/logoPosition'

interface LogoPlaneProps {
  index: number
  total: number
  texturePath: string
  color: string
}

const target = new Vector3()

export function LogoPlane({ index, total, texturePath, color }: LogoPlaneProps) {
  const groupRef = useRef<Group>(null)
  const meshRef = useRef<Mesh>(null)
  const texture = useTexture(texturePath, (t) => {
    const tex = Array.isArray(t) ? t[0] : t
    tex.colorSpace = SRGBColorSpace
  })

  useFrame(({ camera, clock }) => {
    const group = groupRef.current
    const mesh = meshRef.current
    if (!group || !mesh) return
    const progress = useScrollStore.getState().progress
    const [x, y, z] = logoPosition(index, total, progress, clock.elapsedTime)
    target.set(x, y, z)
    group.position.lerp(target, 0.1)
    mesh.lookAt(camera.position)
  })

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <planeGeometry args={[0.45, 0.45]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>
      <pointLight color={color} intensity={0.6} distance={3.5} decay={2} />
    </group>
  )
}
