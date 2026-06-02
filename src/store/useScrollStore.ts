import { create } from 'zustand';

interface ScrollState {
  progress: number;
  skillsIntro: number;
  knowledgeProgress: number;
  knowledgeApproach: number;
  knowledgeExit: number;
  certificatesProgress: number;
  contactProgress: number;
  avatarBlend: number;
  // performance.now() timestamp (ms) at which the hero intro begins — set once
  // the WebGL scene has loaded + compiled, so every intro clock (DOM tween,
  // avatar fade, logo-ring expand) shares one origin and none starts mid-stall.
  heroStartedAt: number | null;
  setProgress: (p: number) => void;
  setSkillsIntro: (p: number) => void;
  setKnowledgeProgress: (p: number) => void;
  setKnowledgeApproach: (p: number) => void;
  setKnowledgeExit: (p: number) => void;
  setCertificatesProgress: (p: number) => void;
  setContactProgress: (p: number) => void;
  setAvatarBlend: (p: number) => void;
  setHeroStartedAt: (t: number | null) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  progress: 0,
  skillsIntro: 0,
  knowledgeProgress: 0,
  knowledgeApproach: 0,
  knowledgeExit: 0,
  certificatesProgress: 0,
  contactProgress: 0,
  avatarBlend: 0,
  heroStartedAt: null,
  setProgress: (p) => set({ progress: p }),
  setSkillsIntro: (p) => set({ skillsIntro: p }),
  setKnowledgeProgress: (p) => set({ knowledgeProgress: p }),
  setKnowledgeApproach: (p) => set({ knowledgeApproach: p }),
  setKnowledgeExit: (p) => set({ knowledgeExit: p }),
  setCertificatesProgress: (p) => set({ certificatesProgress: p }),
  setContactProgress: (p) => set({ contactProgress: p }),
  setAvatarBlend: (p) => set({ avatarBlend: p }),
  setHeroStartedAt: (t) => set({ heroStartedAt: t }),
}));
