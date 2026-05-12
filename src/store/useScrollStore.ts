import { create } from 'zustand';

interface ScrollState {
  progress: number;
  notebookProgress: number;
  notebookHandoff: number;
  knowledgeProgress: number;
  certificatesProgress: number;
  contactProgress: number;
  setProgress: (p: number) => void;
  setNotebookProgress: (p: number) => void;
  setNotebookHandoff: (p: number) => void;
  setKnowledgeProgress: (p: number) => void;
  setCertificatesProgress: (p: number) => void;
  setContactProgress: (p: number) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  progress: 0,
  notebookProgress: 0,
  notebookHandoff: 0,
  knowledgeProgress: 0,
  certificatesProgress: 0,
  contactProgress: 0,
  setProgress: (p) => set({ progress: p }),
  setNotebookProgress: (p) => set({ notebookProgress: p }),
  setNotebookHandoff: (p) => set({ notebookHandoff: p }),
  setKnowledgeProgress: (p) => set({ knowledgeProgress: p }),
  setCertificatesProgress: (p) => set({ certificatesProgress: p }),
  setContactProgress: (p) => set({ contactProgress: p }),
}));
