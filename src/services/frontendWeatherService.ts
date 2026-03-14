import axios from 'axios';
import { WeatherData } from '../types';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const frontendWeatherService = {
  getWeather: async (location: string): Promise<WeatherData> => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/weather`, {
        params: { location },
        timeout: 15000,
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Weather lookup failed');
      }

      return response.data.data as WeatherData;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        throw new Error(data?.message || error.message || 'Weather lookup failed');
      }
      throw error;
    }
  },
};
