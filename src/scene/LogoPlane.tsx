import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import {
  Group,
  Mesh,
  type MeshBasicMaterial,
  type PointLight,
  SRGBColorSpace,
  Vector3,
} from 'three';
import { useScrollStore } from '../store/useScrollStore';
import { logoPosition } from './lib/logoPosition';
import { LOGO_FADE_START, LOGO_FADE_END } from '../sections/hero.constants';

interface LogoPlaneProps {
  index: number;
  total: number;
  texturePath: string;
  color: string;
}

const LIGHT_BASE_INTENSITY = 0.6;
const target = new Vector3();

export function LogoPlane({ index, total, texturePath, color }: LogoPlaneProps) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const lightRef = useRef<PointLight>(null);
  const texture = useTexture(texturePath, (t) => {
    const tex = Array.isArray(t) ? t[0] : t;
    tex.colorSpace = SRGBColorSpace;
  });

  useFrame(({ camera, clock }) => {
    const group = groupRef.current;
    const mesh = meshRef.current;
    if (!group || !mesh) return;
    const progress = useScrollStore.getState().progress;
    const [x, y, z] = logoPosition(index, total, progress, clock.elapsedTime);

    // Ring appears only after the avatar has resolved (see hero.constants),
    // expanding out from the avatar's centre: scaling the target by `fade`
    // collapses it to the origin at fade 0 and grows it to full radius at 1.
    // Keyed off the shared intro clock (scene-ready), not the raw R3F clock.
    const startedAt = useScrollStore.getState().heroStartedAt;
    const tIntro = startedAt == null ? 0 : (performance.now() - startedAt) / 1000;
    const fade = Math.min(
      1,
      Math.max(0, (tIntro - LOGO_FADE_START) / (LOGO_FADE_END - LOGO_FADE_START)),
    );
    target.set(x * fade, y * fade, z * fade);
    group.position.lerp(target, 0.1);
    mesh.lookAt(camera.position);

    (mesh.material as MeshBasicMaterial).opacity = fade;
    if (lightRef.current) lightRef.current.intensity = LIGHT_BASE_INTENSITY * fade;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <planeGeometry args={[0.45, 0.45]} />
        <meshBasicMaterial map={texture} transparent opacity={0} toneMapped={false} />
      </mesh>
      <pointLight ref={lightRef} color={color} intensity={0} distance={3.5} decay={2} />
    </group>
  );
}
