import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Color, MathUtils, MeshStandardMaterial } from 'three';
import type { Group, Material, Mesh } from 'three';
import { useScrollStore } from '../store/useScrollStore';
import { AVATAR_FADE_START, AVATAR_FADE_END } from '../sections/hero.constants';

const ABOUT_YAW = Math.PI / 5;
// The GLB's origin sits near the avatar's feet. Shift the mesh down so its
// visual centre (torso) aligns with the parent group's origin — then the
// scene anchor positions the visible avatar, not a point below it. Exported
// so the Orbit can apply the same offset and stay co-centred with the avatar.
export const VISUAL_CENTER_OFFSET_Y = -0.9;
// Avatar fades in last — after the hero name, SVGs, title, and tagline have
// all resolved. Window lives in hero.constants so the whole intro tunes together.
const FADE_START = AVATAR_FADE_START;
const FADE_END = AVATAR_FADE_END;

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

    // Fade-in keyed off the shared intro clock (set once the scene is ready),
    // not the raw R3F clock — so the avatar appears at the right beat of the
    // sequence regardless of how long loading took. Hidden until the clock starts.
    const startedAt = useScrollStore.getState().heroStartedAt;
    const tIntro = startedAt == null ? 0 : (performance.now() - startedAt) / 1000;
    const fadeProgress = Math.min(1, Math.max(0, (tIntro - FADE_START) / (FADE_END - FADE_START)));
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      (m as MeshStandardMaterial).opacity = fadeProgress;
    }

    group.position.y = Math.sin(t * 0.6) * 0.05;
    const yawTarget = useScrollStore.getState().avatarBlend * ABOUT_YAW;
    group.rotation.y = MathUtils.damp(group.rotation.y, yawTarget, 4, delta);
  });

  return (
    <group ref={groupRef} dispose={null}>
      <mesh
        ref={meshRef}
        position={[0, VISUAL_CENTER_OFFSET_Y, 0]}
        castShadow
        receiveShadow
        geometry={nodes.mesh_0.geometry}
        material={material}
      />
    </group>
  );
}

useGLTF.preload('/models/avatar.glb');
