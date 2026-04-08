import React, { useState, useEffect } from "react";
import { Message, Personality, ChatSession, Language, AppTheme } from "./types";
import { generateChatResponse } from "./services/aiService";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import PersonalitySettings from "./components/PersonalitySettings";
import { Dialog, DialogContent } from "./components/ui/dialog";
import { Button } from "./components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Heart, Menu, X } from "lucide-react";
import { t } from "./translations";

const DEFAULT_PERSONALITY: Personality = {
  name: "Luna",
  description: "Una chica alegre, creativa y un poco sarcástica que ama hablar de todo.",
  traits: ["Alegre", "Sarcástica", "Creativa", "Empática"],
  style: "Informal, usa algunos emojis, habla como una amiga cercana.",
  customInstructions: "Sé lo más humana posible. No tengas miedo de bromear o ser directa.",
};

const STORAGE_KEY = "gams_sessions";
const LANG_STORAGE_KEY = "gams_language";

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [language, setLanguage] = useState<Language>('es');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load state from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem(LANG_STORAGE_KEY) as Language;
    if (savedLang) setLanguage(savedLang);

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) {
        setCurrentSessionId(parsed[0].id);
      }
    } else {
      // Create initial session
      const initialSession: ChatSession = {
        id: crypto.randomUUID(),
        title: "Luna",
        personality: DEFAULT_PERSONALITY,
        messages: [],
        theme: 'indigo',
        lastUpdated: Date.now(),
      };
      setSessions([initialSession]);
      setCurrentSessionId(initialSession.id);
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  // Save language to localStorage
  useEffect(() => {
    localStorage.setItem(LANG_STORAGE_KEY, language);
  }, [language]);

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  const handleSendMessage = async (content: string) => {
    if (!currentSession) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    const updatedMessages = [...currentSession.messages, userMessage];
    
    // Update local state immediately
    const updatedSessions = sessions.map((s) =>
      s.id === currentSessionId
        ? { ...s, messages: updatedMessages, lastUpdated: Date.now() }
        : s
    );
    setSessions(updatedSessions);
    setIsLoading(true);

    try {
      const aiResponseContent = await generateChatResponse(
        updatedMessages,
        currentSession.personality,
        language
      );

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: aiResponseContent,
        timestamp: Date.now(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...updatedMessages, aiMessage], lastUpdated: Date.now() }
            : s
        )
      );
    } catch (error) {
      console.error("Error generating response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSession = () => {
    const name = language === 'es' ? "Nueva Amiga" : "New Friend";
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: name,
      personality: { ...DEFAULT_PERSONALITY, name },
      messages: [],
      theme: 'indigo',
      lastUpdated: Date.now(),
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
    setIsSettingsOpen(true);
  };

  const handleDeleteSession = (id: string) => {
    if (!window.confirm(t('deleteConfirm', language))) return;
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    if (currentSessionId === id && filtered.length > 0) {
      setCurrentSessionId(filtered[0].id);
    }
  };

  const handleSavePersonality = (personality: Personality, theme: AppTheme, newLang: Language) => {
    setLanguage(newLang);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? { ...s, personality, title: personality.name, theme: theme || s.theme }
          : s
      )
    );
    setIsSettingsOpen(false);
  };

  return (
    <div 
      className="flex h-[100dvh] w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans"
      data-theme={currentSession?.theme || 'indigo'}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--brand)]/10 blur-[120px] rounded-full transition-colors duration-500" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        language={language}
        onSelectSession={(id) => {
          setCurrentSessionId(id);
          setIsSidebarOpen(false);
        }}
        onNewSession={() => {
          handleNewSession();
          setIsSidebarOpen(false);
        }}
        onDeleteSession={handleDeleteSession}
        onOpenSettings={() => {
          setIsSettingsOpen(true);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 relative flex flex-col p-2 md:p-4 lg:p-6 overflow-hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-2 md:hidden border-b border-zinc-800 mb-2">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[var(--brand)] transition-colors" />
            <span className="font-bold text-sm truncate max-w-[150px]">
              {currentSession?.title || t('appName', language)}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
            <Sparkles className="w-5 h-5 text-[var(--brand)] transition-colors opacity-80" />
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {currentSession ? (
            <motion.div
              key={currentSession.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <ChatWindow
                messages={currentSession.messages}
                personality={currentSession.personality}
                language={language}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <Heart className="w-20 h-20 text-[var(--brand)]/20 animate-pulse transition-colors" />
                <Sparkles className="absolute top-0 right-0 w-8 h-8 text-[var(--brand)] animate-bounce transition-colors" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight font-heading">{t('welcome', language)}</h1>
                <p className="text-zinc-400 max-w-md">
                  {t('welcomeSub', language)}
                </p>
              </div>
              <button
                onClick={handleNewSession}
                className="px-8 py-4 bg-[var(--brand)] hover:opacity-90 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-[var(--brand)]/20"
              >
                {t('startNow', language)}
              </button>
            </div>
          )}
        </AnimatePresence>
      </main>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl p-0 bg-transparent border-none w-[95vw] md:w-full">
          {currentSession && (
            <PersonalitySettings
              personality={currentSession.personality}
              theme={currentSession.theme || 'indigo'}
              language={language}
              onSave={handleSavePersonality}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
