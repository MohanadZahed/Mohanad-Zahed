import { create } from 'zustand';

interface ScrollState {
  progress: number;
  skillsIntro: number;
  knowledgeProgress: number;
  knowledgeApproach: number;
  knowledgeBeige: number;
  knowledgeExit: number;
  certificatesProgress: number;
  contactProgress: number;
  avatarBlend: number;
  // Live (damped) uniform scale of the avatar+orbit anchor group, published each
  // frame by Scene.tsx. Read by LogoPlane (which has no direct anchor ref) to
  // convert the viewport-fraction orbit cap from world space into the anchor's
  // local space (local radius = worldCap / anchorScale).
  anchorScale: number;
  // User-driven angular offset (radians) added to the logo ring's spin. Written
  // every frame by LogoRingControls (mouse grab-drag + momentum decay) and read
  // by LogoPlane via getState(). Additive: when momentum decays to 0 the ring
  // returns to its pure idle/scroll spin with no seam.
  logoSpin: number;
  // performance.now() timestamp (ms) at which the hero intro begins — set once
  // the WebGL scene has loaded + compiled, so every intro clock (DOM tween,
  // avatar fade, logo-ring expand) shares one origin and none starts mid-stall.
  heroStartedAt: number | null;
  // True while the MOZ nav menu (MozNav) is open. The scroll-direction show/hide
  // of fixed UI chrome (parked MOZ mark + LanguageSwitcher) freezes while it's
  // set, so the mark/switcher don't slide out from under the open dropdown.
  navMenuOpen: boolean;
  setProgress: (p: number) => void;
  setSkillsIntro: (p: number) => void;
  setKnowledgeProgress: (p: number) => void;
  setKnowledgeApproach: (p: number) => void;
  setKnowledgeBeige: (p: number) => void;
  setKnowledgeExit: (p: number) => void;
  setCertificatesProgress: (p: number) => void;
  setContactProgress: (p: number) => void;
  setAvatarBlend: (p: number) => void;
  setAnchorScale: (s: number) => void;
  setLogoSpin: (p: number) => void;
  setHeroStartedAt: (t: number | null) => void;
  setNavMenuOpen: (open: boolean) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  progress: 0,
  skillsIntro: 0,
  knowledgeProgress: 0,
  knowledgeApproach: 0,
  knowledgeBeige: 0,
  knowledgeExit: 0,
  certificatesProgress: 0,
  contactProgress: 0,
  avatarBlend: 0,
  anchorScale: 1,
  logoSpin: 0,
  heroStartedAt: null,
  navMenuOpen: false,
  setProgress: (p) => set({ progress: p }),
  setSkillsIntro: (p) => set({ skillsIntro: p }),
  setKnowledgeProgress: (p) => set({ knowledgeProgress: p }),
  setKnowledgeApproach: (p) => set({ knowledgeApproach: p }),
  setKnowledgeBeige: (p) => set({ knowledgeBeige: p }),
  setKnowledgeExit: (p) => set({ knowledgeExit: p }),
  setCertificatesProgress: (p) => set({ certificatesProgress: p }),
  setContactProgress: (p) => set({ contactProgress: p }),
  setAvatarBlend: (p) => set({ avatarBlend: p }),
  setAnchorScale: (s) => set({ anchorScale: s }),
  setLogoSpin: (p) => set({ logoSpin: p }),
  setHeroStartedAt: (t) => set({ heroStartedAt: t }),
  setNavMenuOpen: (open) => set({ navMenuOpen: open }),
}));
