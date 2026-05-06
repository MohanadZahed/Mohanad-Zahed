import { create } from 'zustand';

interface ScrollState {
  progress: number;
  notebookProgress: number;
  notebookHandoff: number;
  setProgress: (p: number) => void;
  setNotebookProgress: (p: number) => void;
  setNotebookHandoff: (p: number) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  progress: 0,
  notebookProgress: 0,
  notebookHandoff: 0,
  setProgress: (p) => set({ progress: p }),
  setNotebookProgress: (p) => set({ notebookProgress: p }),
  setNotebookHandoff: (p) => set({ notebookHandoff: p }),
}));
