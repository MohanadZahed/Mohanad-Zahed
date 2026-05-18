import { type MutableRefObject, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  MathUtils,
  MeshBasicMaterial,
  SRGBColorSpace,
  Vector3,
} from 'three';
import type { Mesh, Texture } from 'three';
import { useScrollStore } from '../store/useScrollStore';
import { smoothstep } from './lib/math';
import {
  KNOWLEDGE_BOTTOM_PROGRESS,
  KNOWLEDGE_CENTER_PROGRESS,
  KNOWLEDGE_PIN_END_PROGRESS,
  KNOWLEDGE_TOP_PROGRESS,
  PHASE,
} from '../sections/knowledge/knowledge.constants';

// Seven SVGs rendered left-to-right along the upper half of an ellipse behind
// the yoga avatar. Pixel dimensions drive plane aspect-correction only.
const SVG_ENTRIES = [
  { url: '/textures/math1.svg', w: 832, h: 1280 },
  { url: '/textures/math2.svg', w: 1536, h: 1024 },
  { url: '/textures/math3.svg', w: 1024, h: 1024 },
  { url: '/textures/math4.svg', w: 1024, h: 1024 },
  { url: '/textures/math5.svg', w: 1024, h: 1024 },
  { url: '/textures/math6.svg', w: 1024, h: 1024 },
  { url: '/textures/math7.svg', w: 1280, h: 832 },
] as const;
const TOTAL = SVG_ENTRIES.length;
const URLS = SVG_ENTRIES.map((e) => e.url);

// Upper-ellipse arc, centred a bit above the yogi's torso.
const ARC_RADIUS_X = 3.0;
const ARC_RADIUS_Y = 1.6;
const ARC_CENTER_Y = 0.4;
const ARC_Z = -0.6;

// Each plane's longest edge in world units. Seven planes along a 6u-wide arc.
const MAX_DIM_U = 1.7;

const HALO_SCALE = 1.7;
const HALO_Z_OFFSET = -0.05;
const HALO_OPACITY_MAX = 0.35;
const HALO_COLOR = new Color('#38bdf8');

const IDLE_ROT_MAX_RAD = (Math.PI / 180) * 25;
const IDLE_FLOAT_AMP = 0.22;
const IDLE_FLOAT_SPEED = 0.35;
const IDLE_ROT_SPEED = 0.22;
const IDLE_SCALE_AMP = 0.06;
const IDLE_SCALE_SPEED = 0.28;

const PROX_NEAR = 0.05;
const PROX_FAR = 0.9;
const PUSH_NDC_MAX = 0.06;

const BASE_COLOR = new Color('#38bdf8');
const GLOW_COLOR = new Color('#bae6fd');

type PointerRef = MutableRefObject<{ x: number; y: number; seen: boolean }>;

// Radial blue→transparent gradient on a canvas, shared by every halo plane.
function makeHaloTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, cx);
  g.addColorStop(0, 'rgba(120, 200, 255, 0.7)');
  g.addColorStop(0.45, 'rgba(56, 189, 248, 0.25)');
  g.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

interface MathSvgProps {
  index: number;
  texture: Texture;
  haloTexture: CanvasTexture;
  anchorX: number;
  anchorY: number;
  worldW: number;
  worldH: number;
  pointerRef: PointerRef;
  isCoarse: boolean;
  isReducedMotion: boolean;
}

function MathSvg({
  index,
  texture,
  haloTexture,
  anchorX,
  anchorY,
  worldW,
  worldH,
  pointerRef,
  isCoarse,
  isReducedMotion,
}: MathSvgProps) {
  const meshRef = useRef<Mesh>(null);
  const haloRef = useRef<Mesh>(null);
  const viewport = useThree((s) => s.viewport);
  const camera = useThree((s) => s.camera);

  const material = useMemo(() => {
    texture.colorSpace = SRGBColorSpace;
    return new MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      color: BASE_COLOR.clone(),
      opacity: 0,
    });
  }, [texture]);

  const haloMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        map: haloTexture,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        blending: AdditiveBlending,
        color: HALO_COLOR.clone(),
        opacity: 0,
      }),
    [haloTexture],
  );

  // Scratch allocations + per-instance phase offset (so the five SVGs don't
  // bob/rotate/breathe in unison).
  const refs = useMemo(
    () => ({
      worldPos: new Vector3(),
      glowTarget: new Color(),
      phase: (index * (Math.PI * 2)) / TOTAL,
    }),
    [index],
  );

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const halo = haloRef.current;
    if (!mesh) return;

    const t = state.clock.elapsedTime;
    const store = useScrollStore.getState();
    const globalProgress = store.progress;
    const expand = smoothstep(PHASE.BUBBLES_START, PHASE.BUBBLES_HOLD, store.knowledgeProgress);

    const visible =
      globalProgress >= KNOWLEDGE_TOP_PROGRESS && globalProgress < KNOWLEDGE_BOTTOM_PROGRESS;
    mesh.visible = visible;
    if (halo) halo.visible = visible;
    if (!visible) {
      material.opacity = 0;
      haloMaterial.opacity = 0;
      return;
    }

    // Mirror YogaAvatar's Y through entry/exit so the arc tracks the yogi.
    const totalScrollPx = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pxBeforeCenter = Math.max(0, KNOWLEDGE_CENTER_PROGRESS - globalProgress) * totalScrollPx;
    const pxPastPin = Math.max(0, globalProgress - KNOWLEDGE_PIN_END_PROGRESS) * totalScrollPx;
    const entryY = -(pxBeforeCenter / window.innerHeight) * viewport.height;
    const exitY = (pxPastPin / window.innerHeight) * viewport.height;
    const avatarY = entryY + exitY;

    const { phase } = refs;
    const idleY = isReducedMotion ? 0 : Math.sin(t * IDLE_FLOAT_SPEED + phase) * IDLE_FLOAT_AMP;
    const idleRotZ = isReducedMotion
      ? 0
      : Math.sin(t * IDLE_ROT_SPEED + phase * 0.7) * IDLE_ROT_MAX_RAD;
    const idleScale = isReducedMotion
      ? 1
      : 1 + Math.sin(t * IDLE_SCALE_SPEED + phase * 1.3) * IDLE_SCALE_AMP;

    // Rest anchor (before cursor push). Proximity is measured against this so
    // the shape doesn't chase itself. The arc collapses to (0, ARC_CENTER_Y)
    // when expand=0 (start of Knowledge) and reaches its full anchor at expand=1
    // — driven in lockstep with the KnowledgeBackground disc expansion.
    const restX = anchorX * expand;
    const restY = MathUtils.lerp(ARC_CENTER_Y, anchorY, expand) + avatarY + idleY;

    let prox = 0;
    let pushX = 0;
    let pushY = 0;
    if (!isCoarse && !isReducedMotion && pointerRef.current.seen) {
      refs.worldPos.set(restX, restY, ARC_Z).project(camera);
      const dx = pointerRef.current.x - refs.worldPos.x;
      const dy = pointerRef.current.y - refs.worldPos.y;
      const d = Math.hypot(dx, dy);
      prox = 1 - smoothstep(PROX_NEAR, PROX_FAR, d);
      if (prox > 0 && d > 1e-4) {
        const nx = dx / d;
        const ny = dy / d;
        const pushMag = PUSH_NDC_MAX * prox;
        pushX = -nx * pushMag * (viewport.width / 2);
        pushY = -ny * pushMag * (viewport.height / 2);
      }
    }

    const targetX = restX + pushX;
    const targetY = restY + pushY;
    // At rest the SVGs sit at 0.3 once fully expanded; cursor proximity
    // lifts them toward 1.0 while preserving the colour-glow lerp below.
    const REST_OPACITY = 0.3;
    const targetOpacity = expand * (REST_OPACITY + (1 - REST_OPACITY) * prox);

    mesh.position.x = MathUtils.damp(mesh.position.x, targetX, 4, delta);
    mesh.position.y = MathUtils.damp(mesh.position.y, targetY, 4, delta);
    mesh.position.z = ARC_Z;

    mesh.rotation.z = MathUtils.damp(mesh.rotation.z, idleRotZ, 3, delta);

    const nextScale = MathUtils.damp(mesh.scale.x, idleScale, 3, delta);
    mesh.scale.set(nextScale, nextScale, 1);

    material.opacity = MathUtils.damp(material.opacity, targetOpacity, 5, delta);

    refs.glowTarget.copy(BASE_COLOR).lerp(GLOW_COLOR, prox);
    material.color.lerp(refs.glowTarget, 0.08);

    if (halo) {
      halo.position.x = mesh.position.x;
      halo.position.y = mesh.position.y;
      halo.position.z = ARC_Z + HALO_Z_OFFSET;
      halo.scale.set(nextScale, nextScale, 1);
      haloMaterial.opacity = MathUtils.damp(
        haloMaterial.opacity,
        HALO_OPACITY_MAX * prox * expand,
        5,
        delta,
      );
    }
  });

  return (
    <>
      <mesh ref={haloRef} material={haloMaterial} visible={false} renderOrder={-2}>
        <planeGeometry args={[worldW * HALO_SCALE, worldH * HALO_SCALE]} />
      </mesh>
      <mesh ref={meshRef} material={material} visible={false} renderOrder={-1}>
        <planeGeometry args={[worldW, worldH]} />
      </mesh>
    </>
  );
}

export function MathBackdrop() {
  // Single window-level pointer listener shared across all five SVGs. The
  // Canvas wrapper is `pointer-events-none`, so R3F's built-in `pointer`
  // state never updates — we have to track ourselves.
  const pointerRef = useRef({ x: 0, y: 0, seen: false });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onMove = (e: PointerEvent) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      pointerRef.current.seen = true;
    };
    const onLeave = () => {
      pointerRef.current.seen = false;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
    };
  }, []);

  const { isCoarse, isReducedMotion } = useMemo(() => {
    if (typeof window === 'undefined') return { isCoarse: false, isReducedMotion: false };
    return {
      isCoarse: window.matchMedia('(pointer: coarse)').matches,
      isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    };
  }, []);

  const textures = useTexture(URLS) as Texture[];
  const haloTexture = useMemo(() => makeHaloTexture(), []);

  return (
    <>
      {SVG_ENTRIES.map((entry, i) => {
        const theta = Math.PI * (1 - i / (TOTAL - 1));
        const anchorX = ARC_RADIUS_X * Math.cos(theta);
        const anchorY = ARC_CENTER_Y + ARC_RADIUS_Y * Math.sin(theta);
        const maxPx = Math.max(entry.w, entry.h);
        const worldW = MAX_DIM_U * (entry.w / maxPx);
        const worldH = MAX_DIM_U * (entry.h / maxPx);
        return (
          <MathSvg
            key={entry.url}
            index={i}
            texture={textures[i]}
            haloTexture={haloTexture}
            anchorX={anchorX}
            anchorY={anchorY}
            worldW={worldW}
            worldH={worldH}
            pointerRef={pointerRef}
            isCoarse={isCoarse}
            isReducedMotion={isReducedMotion}
          />
        );
      })}
    </>
  );
}

useTexture.preload(URLS);
