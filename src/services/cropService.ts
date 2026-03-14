// src/services/cropService.ts — Real backend integration
import { CropScan, DetectionResult } from '../types';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const cropService = {
  detect: async (imageFile: File): Promise<DetectionResult> => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const userId = localStorage.getItem('agro_user_id') || 'anonymous';

    try {
      const response = await axios.post(`${BACKEND_URL}/api/detect`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-user-id': userId,
        },
        timeout: 120000, // 2 min — allow time for retries inside server
      });

      const { data } = response;

      if (!data.success) {
        throw new Error(data.message || 'Detection failed');
      }

      return {
        success: true,
        source: data.source,
        scanId: data.scanId,
        modelStatus: data.modelStatus,
        data: data.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;

        if (status === 429) {
          throw new Error(`⏳ Rate limit reached — ${data?.hint || 'Please wait 1–2 minutes before trying again.'}`);
        }

        const msg = data?.message || data?.hint || error.message;
        throw new Error(`Detection failed: ${msg}`);
      }
      throw error;
    }
  },

  getHistory: async (): Promise<CropScan[]> => {
    const userId = localStorage.getItem('agro_user_id') || 'anonymous';

    try {
      const response = await axios.get(`${BACKEND_URL}/api/scans`, {
        headers: { 'x-user-id': userId },
        timeout: 10000,
      });

      if (!response.data.success) return [];

      return response.data.scans.map((s: any) => ({
        id: s.id,
        imageUrl: s.imageUrl || '',
        detectedDisease: s.detectedDisease,
        severity: s.severity,
        source: s.source,
        confidence: s.confidence,
        isHealthy: s.isHealthy,
        createdAt: s.createdAt,
      }));
    } catch {
      // Return empty history if backend unavailable
      return [];
    }
  },

  getRelatedScans: async (disease: string, limit = 6): Promise<CropScan[]> => {
    const userId = localStorage.getItem('agro_user_id') || 'anonymous';

    try {
      const response = await axios.get(`${BACKEND_URL}/api/scans/related`, {
        params: { disease, limit },
        headers: { 'x-user-id': userId },
        timeout: 10000,
      });

      if (!response.data.success) return [];

      return response.data.scans.map((s: any) => ({
        id: s.id,
        imageUrl: s.imageUrl || '',
        detectedDisease: s.detectedDisease,
        severity: s.severity,
        source: s.source,
        confidence: s.confidence,
        isHealthy: s.isHealthy,
        createdAt: s.createdAt,
      }));
    } catch {
      return [];
    }
  },

  checkBackendHealth: async (): Promise<{
    connected: boolean;
    dbConnected: boolean;
    geminiReady: boolean;
  }> => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/health`, { timeout: 5000 });
      return {
        connected: true,
        dbConnected: response.data.database?.connected || false,
        geminiReady: response.data.gemini || false,
      };
    } catch {
      return { connected: false, dbConnected: false, geminiReady: false };
    }
  },
};
