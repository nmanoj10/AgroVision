// src/components/chat/ChatInput.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { getSpeechRecognition, isSpeechRecognitionSupported, toSpeechLocale } from '../../utils/speech';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  language: string;
}

export const ChatInput = ({ onSendMessage, isLoading, language }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const baseMessageRef = useRef('');
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  useEffect(() => {
    if (!isSpeechRecognitionSupported()) {
      setSpeechSupported(false);
      return;
    }

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = toSpeechLocale(language);

    recognition.onresult = (event: any) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result[0]?.transcript || '';
        if (result.isFinal) {
          finalTranscriptRef.current += `${transcript} `;
        } else {
          interimTranscript += transcript;
        }
      }

      const base = baseMessageRef.current ? `${baseMessageRef.current} ` : '';
      const combined = `${base}${finalTranscriptRef.current}${interimTranscript}`.trim();
      setMessage(combined);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    setSpeechSupported(true);

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [language]);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
      if (isRecording && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    baseMessageRef.current = message.trim();
    finalTranscriptRef.current = '';
    recognitionRef.current.lang = toSpeechLocale(language);

    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch {
      setIsRecording(false);
    }
  };

  return (
    <div className="relative p-4 bg-bg-primary/80 backdrop-blur-md border-t border-border-color">
      {isRecording && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-accent-red text-white rounded-full text-xs font-bold animate-pulse flex items-center gap-2 shadow-lg">
          <div className="h-2 w-2 bg-white rounded-full animate-ping" />
          Listening...
        </div>
      )}

      <div className="max-w-4xl mx-auto flex items-end gap-3">
        <button
          onClick={toggleRecording}
          disabled={!speechSupported}
          className={`p-3 rounded-xl transition-all shrink-0 ${
            isRecording 
              ? 'bg-accent-red text-white shadow-glow-lg scale-110' 
              : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-text-primary'
          } ${!speechSupported ? 'opacity-50 cursor-not-allowed hover:bg-white/5 hover:text-text-muted' : ''}`}
        >
          {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about farming..."
            className="w-full bg-bg-card border border-border-color rounded-2xl px-4 py-3 text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent-green transition-all resize-none"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          className="p-3 rounded-xl bg-accent-green text-bg-primary hover:shadow-glow transition-all disabled:opacity-50 disabled:scale-100 active:scale-90 shrink-0"
        >
          <Send className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};
