import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Color, MathUtils, MeshStandardMaterial } from 'three';
import type { Group, Material, Mesh } from 'three';
import { useScrollStore } from '../store/useScrollStore';
import { smoothstep } from './lib/math';

const ABOUT_YAW = Math.PI / 5;
// Avatar fades in just before text starts (text begins at 0.5 s)
const FADE_START = 0.2;
const FADE_END = 1.0;

export function Avatar() {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const { nodes } = useGLTF('/models/avatar.glb') as unknown as {
    nodes: { mesh_0: Mesh };
  };

  const material = useMemo(() => {
    const src = nodes.mesh_0.material;
    const sources = Array.isArray(src) ? src : [src];
    const cloned = sources.map((m) => {
      const c = (m as Material).clone() as MeshStandardMaterial;
      if (c.color instanceof Color) {
        c.color.r = Math.min(1, c.color.r * 1.25);
        c.color.g = Math.min(1, c.color.g * 1.25);
        c.color.b = Math.min(1, c.color.b * 1.25);
      }
      c.transparent = true;
      c.opacity = 0;
      return c;
    });
    return Array.isArray(src) ? cloned : cloned[0];
  }, [nodes]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const mesh = meshRef.current;
    if (!group || !mesh) return;

    const t = state.clock.elapsedTime;

    // Delayed fade-in after hero text finishes
    const fadeProgress = Math.min(1, Math.max(0, (t - FADE_START) / (FADE_END - FADE_START)));
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      (m as MeshStandardMaterial).opacity = fadeProgress;
    }

    group.position.y = Math.sin(t * 0.6) * 0.05;
    const progress = useScrollStore.getState().progress;
    const yawTarget = smoothstep(0.41 / 28.25, 0.82 / 28.25, progress) * ABOUT_YAW;
    group.rotation.y = MathUtils.damp(group.rotation.y, yawTarget, 4, delta);
  });

  return (
    <group ref={groupRef} dispose={null}>
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        geometry={nodes.mesh_0.geometry}
        material={material}
      />
    </group>
  );
}

useGLTF.preload('/models/avatar.glb');
