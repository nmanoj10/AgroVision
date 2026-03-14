require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const CHAT_MODEL_CHAIN = ['gemini-2.0-flash'];

const LANGUAGE_NAME_MAP = {
  en: 'English',
  hi: 'Hindi',
  mr: 'Marathi',
  ta: 'Tamil',
  te: 'Telugu',
  bn: 'Bengali',
  kn: 'Kannada',
  gu: 'Gujarati',
};

function detectLanguageFromMessage(message) {
  if (!message || typeof message !== 'string') {
    return null;
  }

  const text = message.trim();
  if (!text) {
    return null;
  }

  if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bengali
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu'; // Gujarati
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn'; // Kannada
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Devanagari (Hindi/Marathi)
  return null;
}

function normalizeLanguage(code) {
  if (!code || typeof code !== 'string') {
    return { code: 'en', name: 'English' };
  }
  const cleaned = code.trim().toLowerCase();
  const short = cleaned.split('-')[0];
  return {
    code: short,
    name: LANGUAGE_NAME_MAP[short] || 'English',
  };
}

async function withRetry(fn, maxRetries = 1, delayMs = 2000) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const msg = err.message || '';
      const isModel = msg.includes('404') || msg.includes('not found') || msg.includes('MODEL_NOT_FOUND');
      if (isModel) {
        throw err;
      }
      if (attempt < maxRetries) {
        const waitMs = delayMs * attempt;
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
  }
  throw lastError;
}

function buildPrompt(message, languageName) {
  return `
You are AgroBot, an agricultural assistant for Indian farmers.
Reply ONLY in ${languageName}. Keep the answer short, clear, and practical.
If the user asks a question that needs steps, give 3-4 short steps.
Avoid markdown tables and do not switch languages.
If you cannot fully answer, say so briefly in ${languageName} and give the best safe guidance.

User: ${message}
Assistant:
`.trim();
}

function withTimeout(promise, timeoutMs) {
  if (!timeoutMs || timeoutMs <= 0) {
    return promise;
  }
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Chat timeout after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

async function generateChatResponse(message, languageCode) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  let preferredCode = languageCode;
  if (!preferredCode || preferredCode === 'auto') {
    preferredCode = detectLanguageFromMessage(message) || 'en';
  }
  const { name: languageName } = normalizeLanguage(preferredCode);
  const prompt = buildPrompt(message, languageName);
  const timeoutMs = Number(process.env.CHAT_TIMEOUT_MS || 15000);

  let lastError = null;
  for (const modelName of CHAT_MODEL_CHAIN) {
    try {
      const reply = await withRetry(async () => {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 256,
          },
        });
        const result = await withTimeout(model.generateContent(prompt), timeoutMs);
        return result.response.text().trim();
      }, 1, 1500);

      if (!reply) {
        throw new Error('Empty response from Gemini.');
      }

      return { reply, model: modelName, languageName };
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('All Gemini models failed.');
}

module.exports = { generateChatResponse };
