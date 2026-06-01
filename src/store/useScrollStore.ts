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
  setProgress: (p: number) => void;
  setSkillsIntro: (p: number) => void;
  setKnowledgeProgress: (p: number) => void;
  setKnowledgeApproach: (p: number) => void;
  setKnowledgeExit: (p: number) => void;
  setCertificatesProgress: (p: number) => void;
  setContactProgress: (p: number) => void;
  setAvatarBlend: (p: number) => void;
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
  setProgress: (p) => set({ progress: p }),
  setSkillsIntro: (p) => set({ skillsIntro: p }),
  setKnowledgeProgress: (p) => set({ knowledgeProgress: p }),
  setKnowledgeApproach: (p) => set({ knowledgeApproach: p }),
  setKnowledgeExit: (p) => set({ knowledgeExit: p }),
  setCertificatesProgress: (p) => set({ certificatesProgress: p }),
  setContactProgress: (p) => set({ contactProgress: p }),
  setAvatarBlend: (p) => set({ avatarBlend: p }),
}));
