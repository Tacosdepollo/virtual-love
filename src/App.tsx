import React, { useState, useEffect } from "react";
import { Message, Personality, ChatSession } from "@/types";
import { generateChatResponse } from "@/services/aiService";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import PersonalitySettings from "@/components/PersonalitySettings";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Heart } from "lucide-react";

const DEFAULT_PERSONALITY: Personality = {
  name: "Luna",
  description: "Una chica alegre, creativa y un poco sarcástica que ama hablar de todo.",
  traits: ["Alegre", "Sarcástica", "Creativa", "Empática"],
  style: "Informal, usa algunos emojis, habla como una amiga cercana.",
  customInstructions: "Sé lo más humana posible. No tengas miedo de bromear o ser directa.",
};

const STORAGE_KEY = "amiga_virtual_sessions";

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load sessions from localStorage
  useEffect(() => {
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
        currentSession.personality
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
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: "Nueva Amiga",
      personality: { ...DEFAULT_PERSONALITY, name: "Nueva Amiga" },
      messages: [],
      lastUpdated: Date.now(),
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
    setIsSettingsOpen(true);
  };

  const handleDeleteSession = (id: string) => {
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    if (currentSessionId === id && filtered.length > 0) {
      setCurrentSessionId(filtered[0].id);
    }
  };

  const handleSavePersonality = (personality: Personality) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? { ...s, personality, title: personality.name }
          : s
      )
    );
    setIsSettingsOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 relative flex flex-col p-4 lg:p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentSession ? (
            <motion.div
              key={currentSession.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 h-full"
            >
              <ChatWindow
                messages={currentSession.messages}
                personality={currentSession.personality}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <Heart className="w-20 h-20 text-indigo-500/20 animate-pulse" />
                <Sparkles className="absolute top-0 right-0 w-8 h-8 text-indigo-400 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Bienvenido a Amiga Virtual</h1>
                <p className="text-zinc-400 max-w-md">
                  Crea una personalidad única y empieza a charlar. Tu nueva amiga te está esperando.
                </p>
              </div>
              <button
                onClick={handleNewSession}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/20"
              >
                Empezar ahora
              </button>
            </div>
          )}
        </AnimatePresence>
      </main>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl p-0 bg-transparent border-none">
          {currentSession && (
            <PersonalitySettings
              personality={currentSession.personality}
              onSave={handleSavePersonality}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
