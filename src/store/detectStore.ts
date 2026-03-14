import { create } from 'zustand';
import { CropScan, DetectionResult } from '../types';
import { cropService } from '../services/cropService';

interface DetectState {
  result: DetectionResult | null;
  isLoading: boolean;
  loadingStep: string;
  error: string | null;
  scanHistory: CropScan[];
  detect: (file: File) => Promise<void>;
  resetResult: () => void;
  loadHistory: () => Promise<void>;
}

export const useDetectStore = create<DetectState>((set) => ({
  result: null,
  isLoading: false,
  loadingStep: '',
  error: null,
  scanHistory: [],
  detect: async (file: File) => {
    set({ isLoading: true, error: null, loadingStep: 'Running local trained model...' });

    try {
      const t1 = setTimeout(() => set({ loadingStep: 'Checking confidence threshold...' }), 3000);
      const t2 = setTimeout(() => set({ loadingStep: 'Using Gemini fallback if needed...' }), 7000);
      const t3 = setTimeout(() => set({ loadingStep: 'Preparing diagnosis and treatment...' }), 12000);
      const t4 = setTimeout(() => set({ loadingStep: 'Saving scan to database...' }), 18000);

      const result = await cropService.detect(file);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);

      cropService.getHistory().then((history) => set({ scanHistory: history }));

      set({
        result,
        isLoading: false,
        loadingStep: '',
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Detection failed - please try again',
        isLoading: false,
        loadingStep: '',
      });
    }
  },
  resetResult: () => set({ result: null, error: null }),
  loadHistory: async () => {
    const history = await cropService.getHistory();
    set({ scanHistory: history });
  },
}));
