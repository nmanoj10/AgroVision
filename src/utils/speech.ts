export const SPEECH_LOCALE_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN',
  kn: 'kn-IN',
  gu: 'gu-IN',
};

export const toSpeechLocale = (languageCode: string) =>
  SPEECH_LOCALE_MAP[languageCode] || languageCode || 'en-IN';

export const getSpeechRecognition = () =>
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;

export const isSpeechRecognitionSupported = () => Boolean(getSpeechRecognition());
