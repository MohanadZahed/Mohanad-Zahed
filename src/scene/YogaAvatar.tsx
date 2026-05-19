import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Color, MathUtils, MeshStandardMaterial } from 'three';
import type { Group, Material, Mesh } from 'three';
import { useScrollStore } from '../store/useScrollStore';
import { lerp, smoothstep } from './lib/math';

const SPIN_START = 0.1;
const SPIN_END = 0.4;
const FLOAT_AMPLITUDE = 0.04;
const FLOAT_SPEED = 0.5;
const Y_REST = 0;

export function YogaAvatar() {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const viewport = useThree((s) => s.viewport);
  const { nodes } = useGLTF('/models/avatar-yoga.glb') as unknown as {
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
    const store = useScrollStore.getState();
    const sectionProgress = store.knowledgeProgress;
    const approach = store.knowledgeApproach;
    const exit = store.knowledgeExit;

    const visible = approach > 0 && exit < 1;
    const opacity = visible ? 1 : 0;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      (m as MeshStandardMaterial).opacity = opacity;
    }
    group.visible = visible;

    // Entry: avatar rides up from below as the section approaches viewport top
    // (approach 0→1). Exit: avatar rides up out as the section bottom passes
    // viewport top (exit 0→1). Section-local triggers so the choreography
    // works on any page height.
    const entryY = -(1 - approach) * viewport.height;
    const exitY = exit * viewport.height;

    group.position.x = 0;
    group.position.z = 0;
    group.position.y = Y_REST + Math.sin(t * FLOAT_SPEED) * FLOAT_AMPLITUDE + entryY + exitY;

    const spin = smoothstep(SPIN_START, SPIN_END, sectionProgress);
    const yawTarget = lerp(Math.PI, 0, spin);
    group.rotation.y = MathUtils.damp(group.rotation.y, yawTarget, 4, delta);
  });

  return (
    <group ref={groupRef} dispose={null} visible={false}>
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

useGLTF.preload('/models/avatar-yoga.glb');
