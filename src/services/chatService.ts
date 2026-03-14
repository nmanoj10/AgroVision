import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const chatService = {
  sendMessage: async (message: string, language: string): Promise<string> => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/chat`,
        { message, language },
        { timeout: 60000 }
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Chat failed');
      }

      return response.data.reply as string;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;
        if (status === 429) {
          throw new Error(`Rate limit reached — ${data?.message || 'Please wait and try again.'}`);
        }
        throw new Error(data?.message || error.message || 'Chat failed');
      }
      throw error;
    }
  },
};
