import React, { useState, useEffect } from "react";
import { Message, Character, ChatSession, Language, AppTheme, Personality, Intensity } from "./types";
import { generateChatResponse } from "./services/aiService";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import ExploreView from "./components/ExploreView";
import LegalView from "./components/LegalView";
import PersonalitySettings from "./components/PersonalitySettings";
import GlobalSettings from "./components/GlobalSettings";
import ErrorBoundary from "./components/ErrorBoundary";
import { Dialog, DialogContent } from "./components/ui/dialog";
import { Button } from "./components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Heart, Menu, X, LogIn, Compass, MessageSquare, Plus, Settings } from "lucide-react";
import { t } from "./translations";
import { auth, db, signInWithGoogle, handleFirestoreError, OperationType } from "./lib/firebase";
import { onAuthStateChanged, User, updateProfile } from "firebase/auth";
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, getDoc, setDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { cn } from "./lib/utils";

const LANG_STORAGE_KEY = "gams_language";
const THEME_STORAGE_KEY = "gams_theme";
const INTENSITY_STORAGE_KEY = "gams_intensity";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [language, setLanguage] = useState<Language>('es');
  const [theme, setTheme] = useState<AppTheme>('indigo');
  const [intensity, setIntensity] = useState<Intensity>('medium');
  const [view, setView] = useState<'explore' | 'chat' | 'legal'>('explore');
  const [isPersonalitySettingsOpen, setIsPersonalitySettingsOpen] = useState(false);
  const [isGlobalSettingsOpen, setIsGlobalSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // Sync user to Firestore
        const userDoc = doc(db, "users", u.uid);
        setDoc(userDoc, {
          uid: u.uid,
          displayName: u.displayName,
          email: u.email,
          photoURL: u.photoURL,
          createdAt: Timestamp.now()
        }, { merge: true });
      } else {
        setSessions([]);
        setCurrentSessionId("");
        setView('explore');
      }
    });
    return () => unsubscribe();
  }, []);

  // Load language and theme
  useEffect(() => {
    const savedLang = localStorage.getItem(LANG_STORAGE_KEY) as Language;
    if (savedLang) setLanguage(savedLang);
    
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme;
    if (savedTheme) setTheme(savedTheme);

    const savedIntensity = localStorage.getItem(INTENSITY_STORAGE_KEY) as Intensity;
    if (savedIntensity) setIntensity(savedIntensity);
  }, []);

  // Sessions Listener
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "chats"),
      where("userId", "==", user.uid),
      orderBy("lastUpdated", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sess = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatSession));
      setSessions(sess);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "chats");
    });

    return () => unsubscribe();
  }, [user]);

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  // Sync active character when session changes
  useEffect(() => {
    if (currentSession) {
      const charDoc = doc(db, "characters", currentSession.characterId);
      getDoc(charDoc).then(snap => {
        if (snap.exists()) {
          setActiveCharacter({ id: snap.id, ...snap.data() } as Character);
        }
      });
    }
  }, [currentSessionId]);

  const handleSendMessage = async (content: string) => {
    if (!currentSession || !activeCharacter || !user) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    const updatedMessages = [...currentSession.messages, userMessage];
    const chatDoc = doc(db, "chats", currentSession.id);
    
    await updateDoc(chatDoc, {
      messages: updatedMessages,
      lastUpdated: Date.now()
    });

    setIsLoading(true);

    try {
      const aiResponseContent = await generateChatResponse(
        updatedMessages,
        activeCharacter,
        language,
        currentSession.coreThoughts || [],
        intensity
      );

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: aiResponseContent,
        timestamp: Date.now(),
      };

      await updateDoc(chatDoc, {
        messages: [...updatedMessages, aiMessage],
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error("Error generating response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCharacter = async (character: Character) => {
    if (!user) {
      await signInWithGoogle();
      return;
    }

    // Check if session already exists for this character
    const existing = sessions.find(s => s.characterId === character.id);
    if (existing) {
      setCurrentSessionId(existing.id);
      setView('chat');
      return;
    }

    // Create new session
    const chatRef = await addDoc(collection(db, "chats"), {
      userId: user.uid,
      characterId: character.id,
      characterName: character.name,
      messages: [],
      coreThoughts: [],
      theme: theme,
      lastUpdated: Date.now()
    });

    // Increment chat count ONLY for new sessions (Optimization)
    const charRef = doc(db, "characters", character.id);
    updateDoc(charRef, {
      chatCount: (character.chatCount || 0) + 1
    });

    setCurrentSessionId(chatRef.id);
    setView('chat');
  };

  const handleToggleCoreThought = async (messageId: string) => {
    if (!currentSession) return;
    
    const currentThoughts = currentSession.coreThoughts || [];
    let newThoughts = [...currentThoughts];
    
    if (currentThoughts.includes(messageId)) {
      newThoughts = newThoughts.filter(id => id !== messageId);
    } else {
      if (currentThoughts.length >= 6) {
        alert(t('coreThoughtsLimit', language));
        return;
      }
      newThoughts.push(messageId);
    }
    
    const chatDoc = doc(db, "chats", currentSession.id);
    await updateDoc(chatDoc, {
      coreThoughts: newThoughts,
      lastUpdated: Date.now()
    });
  };

  const handleNewCharacter = () => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    setActiveCharacter(null);
    setIsPersonalitySettingsOpen(true);
  };

  const handleSaveCharacter = async (personality: Personality, characterTheme: AppTheme, newLang: Language) => {
    if (!user) return;
    
    const charData: any = {
      name: personality.name,
      description: personality.description,
      traits: personality.traits,
      tags: personality.tags || [],
      style: personality.style,
      customInstructions: personality.customInstructions || "",
      avatarUrl: personality.avatarUrl || "",
      isPublic: personality.isPublic,
      isNSFW: personality.isNSFW,
    };

    if (activeCharacter) {
      // Update existing
      const charRef = doc(db, "characters", activeCharacter.id);
      await updateDoc(charRef, charData);
      setActiveCharacter({ ...activeCharacter, ...charData });
    } else {
      // Create new
      charData.creatorId = user.uid;
      charData.creatorName = user.displayName || "Anonymous";
      charData.chatCount = 0;
      charData.createdAt = Timestamp.now();
      
      const charRef = await addDoc(collection(db, "characters"), charData);
      handleSelectCharacter({ id: charRef.id, ...charData } as Character);
    }
    
    setIsPersonalitySettingsOpen(false);
  };

  const handleDeleteCharacter = async () => {
    if (!activeCharacter || !user) return;
    
    try {
      await deleteDoc(doc(db, "characters", activeCharacter.id));
      
      // Also delete associated chats for this user (optional, but cleaner)
      const chatToDelete = sessions.find(s => s.characterId === activeCharacter.id);
      if (chatToDelete) {
        await deleteDoc(doc(db, "chats", chatToDelete.id));
      }

      setIsPersonalitySettingsOpen(false);
      setActiveCharacter(null);
      setCurrentSessionId("");
      setView('explore');
    } catch (error) {
      console.error("Error deleting character:", error);
    }
  };

  const handleSaveGlobalSettings = async (newTheme: AppTheme, newLang: Language, newDisplayName: string, newIntensity: Intensity) => {
    setTheme(newTheme);
    setLanguage(newLang);
    setIntensity(newIntensity);
    localStorage.setItem(LANG_STORAGE_KEY, newLang);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    localStorage.setItem(INTENSITY_STORAGE_KEY, newIntensity);

    if (user && newDisplayName !== user.displayName) {
      try {
        await updateProfile(user, { displayName: newDisplayName });
        await updateDoc(doc(db, "users", user.uid), { displayName: newDisplayName });
        // Refresh local user state
        setUser({ ...user, displayName: newDisplayName } as User);
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }

    setIsGlobalSettingsOpen(false);
  };

  return (
    <ErrorBoundary>
      <div 
        className="flex h-[100dvh] w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans"
        data-theme={theme}
      >
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--brand)]/10 blur-[120px] rounded-full transition-colors duration-500" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
        </div>

        {user && (
          <Sidebar
            sessions={sessions.map(s => ({ ...s, title: s.characterName } as any))}
            currentSessionId={currentSessionId}
            language={language}
            onSelectSession={(id) => {
              setCurrentSessionId(id);
              setView('chat');
              setIsSidebarOpen(false);
            }}
            onNewSession={() => {
              setView('explore');
              setIsSidebarOpen(false);
            }}
            onDeleteSession={async (id) => {
              if (window.confirm(t('deleteConfirm', language))) {
                await deleteDoc(doc(db, "chats", id));
                if (currentSessionId === id) {
                  setCurrentSessionId("");
                  setView('explore');
                }
              }
            }}
            onOpenSettings={() => setIsGlobalSettingsOpen(true)}
            onOpenLegal={() => {
              setView('legal');
              setIsSidebarOpen(false);
            }}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 relative flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md z-10">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="w-6 h-6" />
              </Button>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('explore')}>
                <Heart className="w-6 h-6 text-[var(--brand)]" />
                <span className="text-xl font-bold font-heading tracking-tight">GIMS.ai</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                className={cn("gap-2 rounded-full", view === 'explore' && "text-[var(--brand)] bg-[var(--brand)]/10")}
                onClick={() => setView('explore')}
              >
                <Compass className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'es' ? 'Explorar' : 'Explore'}</span>
              </Button>
              
              {!user ? (
                <Button onClick={signInWithGoogle} className="bg-[var(--brand)] hover:opacity-90 gap-2 rounded-full">
                  <LogIn className="w-4 h-4" />
                  {language === 'es' ? 'Entrar' : 'Login'}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={handleNewCharacter}>
                    <Plus className="w-5 h-5 text-[var(--brand)]" />
                  </Button>
                  {view === 'chat' && currentSession && activeCharacter && activeCharacter.creatorId === user.uid && (
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsPersonalitySettingsOpen(true)}>
                      <Settings className="w-5 h-5 text-zinc-400" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {view === 'explore' ? (
              <motion.div
                key="explore"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <ExploreView 
                  language={language} 
                  onSelectCharacter={handleSelectCharacter}
                  onCreateCharacter={handleNewCharacter}
                />
              </motion.div>
            ) : view === 'legal' ? (
              <motion.div
                key="legal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <LegalView 
                  language={language} 
                  onBack={() => setView('explore')} 
                />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col p-2 md:p-4 lg:p-6 overflow-hidden"
              >
                {currentSession && activeCharacter ? (
                  <ChatWindow
                    messages={currentSession.messages}
                    personality={activeCharacter as any}
                    language={language}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    coreThoughts={currentSession.coreThoughts}
                    onToggleCoreThought={handleToggleCoreThought}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <Button onClick={() => setView('explore')} variant="outline">
                      {language === 'es' ? 'Selecciona un personaje' : 'Select a character'}
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Global Settings Dialog */}
        <Dialog open={isGlobalSettingsOpen} onOpenChange={setIsGlobalSettingsOpen}>
          <DialogContent className="max-w-md p-0 bg-transparent border-none w-[95vw]">
            <GlobalSettings
              theme={theme}
              language={language}
              intensity={intensity}
              displayName={user?.displayName || ""}
              onSave={handleSaveGlobalSettings}
            />
          </DialogContent>
        </Dialog>

        {/* Personality Settings Dialog (Character Creation/Editing) */}
        <Dialog open={isPersonalitySettingsOpen} onOpenChange={setIsPersonalitySettingsOpen}>
          <DialogContent className="max-w-2xl p-0 bg-transparent border-none w-[95vw] md:w-full">
            <PersonalitySettings
              personality={activeCharacter || { name: "", traits: [], tags: [], style: "", description: "", isPublic: true, isNSFW: false }}
              theme={theme}
              language={language}
              onSave={handleSaveCharacter}
              onDelete={handleDeleteCharacter}
              isCreator={!activeCharacter || activeCharacter.creatorId === user?.uid}
            />
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
}
