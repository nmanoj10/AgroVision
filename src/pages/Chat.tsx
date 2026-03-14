// src/pages/Chat.tsx

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ChatMessage } from '../components/chat/ChatMessage';
import { ChatInput } from '../components/chat/ChatInput';
import { LanguageSelector } from '../components/chat/LanguageSelector';
import { chatService } from '../services/chatService';
import { ChatMessage as ChatMessageType } from '../types';
import { toSpeechLocale } from '../utils/speech';

const PROMPT_CHIPS = [
  "🌿 Identify my crop disease",
  "💊 Best pesticide for blight",
  "🌤️ Weather impact on crops",
  "🏛️ Government schemes for farmers",
  "💰 High yield crop suggestions",
  "🐛 Organic pest control methods",
];

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: '1',
      role: 'bot',
      content: "Hello! I'm AgroBot 🌿 I can help you with crop diseases, pesticides, weather risks, and farming advice. What's on your mind today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [autoSpeak, setAutoSpeak] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const reply = await chatService.sendMessage(content, language);
      const botMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: reply,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
      if (autoSpeak && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(botMessage.content);
        utterance.lang = toSpeechLocale(language);
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-12rem)] flex flex-col max-w-5xl mx-auto">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-color bg-bg-secondary/50 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent-green/10 flex items-center justify-center text-accent-green border border-accent-green/20">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                AgroBot
                <span className="h-2 w-2 rounded-full bg-accent-green animate-pulse" />
              </h2>
              <p className="text-xs text-text-muted">AI Agricultural Assistant • Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoSpeak((prev) => !prev)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                autoSpeak
                  ? 'bg-accent-green/10 border-accent-green/30 text-accent-green'
                  : 'bg-white/5 border-white/10 text-text-secondary hover:text-text-primary'
              }`}
              aria-pressed={autoSpeak}
            >
              {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              Voice replies
            </button>
            <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-bg-card/30">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChatMessage message={msg} language={language} />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <div className="flex gap-4 mb-6">
              <div className="h-10 w-10 rounded-xl bg-accent-green/10 flex items-center justify-center text-accent-green shrink-0 border border-accent-green/20">
                <Bot className="h-6 w-6" />
              </div>
              <div className="bg-bg-card border border-border-color p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
                <div className="h-1.5 w-1.5 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-1.5 w-1.5 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-1.5 w-1.5 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Chips */}
        <div className="p-4 bg-bg-card/30 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2">
          {PROMPT_CHIPS.map((chip, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(chip)}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-text-secondary hover:bg-accent-green/10 hover:text-accent-green hover:border-accent-green/30 transition-all flex items-center gap-2"
            >
              <Sparkles className="h-3 w-3" />
              {chip}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} language={language} />
      </div>
    </DashboardLayout>
  );
}
