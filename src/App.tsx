import React, { useState, useEffect } from "react";
import { Message, Character, ChatSession, Language, AppTheme, Personality, Intensity, UserStats, AppFont, ShopItem, AppNotification } from "./types";
import { generateChatResponse, moderateCharacter } from "./services/aiService";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import ExploreView from "./components/ExploreView";
import ShopView from "./components/ShopView";
import PersonalizationView from "./components/PersonalizationView";
import CreateCharacterView from "./components/CreateCharacterView";
import LegalView from "./components/LegalView";
import GlobalSettings from "./components/GlobalSettings";
import ErrorBoundary from "./components/ErrorBoundary";
import RewardedAd from "./components/RewardedAd";
import { SHOP_ITEMS } from "./components/ShopView";
import { Dialog, DialogContent } from "./components/ui/dialog";
import { Button } from "./components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Heart, Menu, X, LogIn, Compass, MessageSquare, Plus, Settings, ShoppingBag, Palette, Coins, Bell } from "lucide-react";
import { t } from "./translations";
import { auth, db, signInWithGoogle, handleFirestoreError, OperationType } from "./lib/firebase";
import { onAuthStateChanged, User, updateProfile } from "firebase/auth";
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, getDoc, setDoc, deleteDoc, Timestamp, arrayUnion } from "firebase/firestore";
import { cn } from "./lib/utils";
import { audioManager } from "./lib/audio";
import { getFullContext, updateConversationContext, updateCentralMemories } from './services/memoryService';
import { getCachedDoc } from "./lib/cache";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const LANG_STORAGE_KEY = "gams_language";
const THEME_STORAGE_KEY = "gams_theme";
const FONT_STORAGE_KEY = "gams_font";
const INTENSITY_STORAGE_KEY = "gams_intensity";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [language, setLanguage] = useState<Language>('es');
  const [theme, setTheme] = useState<AppTheme>('sky');
  const [font, setFont] = useState<AppFont>('sans');
  const [intensity, setIntensity] = useState<Intensity>('medium');
  const [view, setView] = useState<'explore' | 'chat' | 'legal' | 'shop' | 'personalization' | 'create'>('explore');
  const [userStats, setUserStats] = useState<UserStats>({
    coins: 1000, // Initial coins for testing
    purchasedItems: [],
    currentFont: 'sans',
    unlockedThemes: [],
    themeOpacity: 0.6
  });
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPersonalitySettingsOpen, setIsPersonalitySettingsOpen] = useState(false);
  const [isGlobalSettingsOpen, setIsGlobalSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // Sync user to Firestore
        const userDoc = doc(db, "users", u.uid);
        getDoc(userDoc).then(snap => {
          if (!snap.exists() || !snap.data().stats) {
            setDoc(userDoc, {
              uid: u.uid,
              displayName: u.displayName,
              email: u.email,
              photoURL: u.photoURL,
              createdAt: Timestamp.now(),
              stats: {
                coins: 1000,
                purchasedItems: [],
                currentFont: 'sans',
                unlockedThemes: [],
                themeOpacity: 0.6,
                subscription: undefined
              }
            }, { merge: true });
          } else {
            setDoc(userDoc, {
              uid: u.uid,
              displayName: u.displayName,
              email: u.email,
              photoURL: u.photoURL,
            }, { merge: true });
          }
        });
      } else {
        setSessions([]);
        setCurrentSessionId("");
        setView('explore');
        setNotifications([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Notifications Listener
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
      setNotifications(notifs);
    }, (error) => {
      console.error("Error fetching notifications:", error);
    });
    return () => unsubscribe();
  }, [user]);

  // Load language and theme
  useEffect(() => {
    const savedLang = localStorage.getItem(LANG_STORAGE_KEY) as Language;
    if (savedLang) setLanguage(savedLang);
    
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme;
    if (savedTheme) setTheme(savedTheme);

    const savedFont = localStorage.getItem(FONT_STORAGE_KEY) as AppFont;
    if (savedFont) setFont(savedFont);

    const savedIntensity = localStorage.getItem(INTENSITY_STORAGE_KEY) as Intensity;
    if (savedIntensity) setIntensity(savedIntensity);
  }, []);

  // Sync user stats from Firestore
  useEffect(() => {
    if (!user) return;
    const userDoc = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userDoc, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.stats) {
          setUserStats(data.stats);
        }
      }
    });
    return () => unsubscribe();
  }, [user]);

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
      // Usamos caché con TTL de 1 hora para personajes, ya que rara vez cambian
      getCachedDoc<Character>(charDoc, 60 * 60 * 1000).then(data => {
        if (data) {
          setActiveCharacter(data);
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

    const chatDoc = doc(db, "chats", currentSession.id);
    
    // Optimistic UI update
    const updatedMessages = [...currentSession.messages, userMessage];
    setSessions(sessions.map(s => s.id === currentSession.id ? { ...s, messages: updatedMessages } : s));

    await updateDoc(chatDoc, {
      messages: arrayUnion(userMessage),
      lastUpdated: Date.now()
    });

    setIsLoading(true);
    audioManager.play('typing', 0.2);

    try {
      const aiResponseContent = await generateChatResponse(
        updatedMessages,
        activeCharacter,
        language,
        currentSession.coreThoughts || [],
        intensity,
        user.uid
      );

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: aiResponseContent,
        timestamp: Date.now(),
      };

      await updateDoc(chatDoc, {
        messages: arrayUnion(aiMessage),
        lastUpdated: Date.now()
      });

      await updateConversationContext(
        activeCharacter.id,
        user.uid,
        content,
        aiResponseContent,
        currentSession.summary
      );

      const messageCount = (currentSession.messages?.length || 0) + 2;
      if (messageCount % 10 === 0) {
        const fullDialogue = `${content}\n${aiResponseContent}`;
        const currentCentral = await getFullContext(activeCharacter.id, user.uid);
        await updateCentralMemories(
          activeCharacter.id,
          user.uid,
          fullDialogue,
          currentCentral as any
        );
      }

    } catch (error) {
      console.error("Error generating response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!currentSession || !user) return;

    const updatedMessages = currentSession.messages.map(msg => 
      msg.id === messageId ? { ...msg, content: newContent } : msg
    );

    // Optimistic UI update
    setSessions(sessions.map(s => s.id === currentSession.id ? { ...s, messages: updatedMessages } : s));

    const chatDoc = doc(db, "chats", currentSession.id);
    await updateDoc(chatDoc, {
      messages: updatedMessages,
      lastUpdated: Date.now()
    });
  };

  const handleRegenerateMessage = async (messageId: string) => {
    if (!currentSession || !activeCharacter || !user) return;

    const msgIndex = currentSession.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    const messagesUpTo = currentSession.messages.slice(0, msgIndex);

    setIsLoading(true);
    audioManager.play('typing', 0.2);

    try {
      const aiResponseContent = await generateChatResponse(
        messagesUpTo,
        activeCharacter,
        language,
        currentSession.coreThoughts || [],
        intensity,
        user.uid
      );

      const updatedMessages = currentSession.messages.map(msg => 
        msg.id === messageId ? { ...msg, content: aiResponseContent, timestamp: Date.now() } : msg
      );

      setSessions(sessions.map(s => s.id === currentSession.id ? { ...s, messages: updatedMessages } : s));

      const chatDoc = doc(db, "chats", currentSession.id);
      await updateDoc(chatDoc, {
        messages: updatedMessages,
        lastUpdated: Date.now()
      });

    } catch (error) {
      console.error("Error regenerating response:", error);
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
      audioManager.play('pop');
      return;
    }

    // Create new session
    audioManager.play('pop');
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
    audioManager.play('click');
    setActiveCharacter(null);
    setView('create');
  };

  const handleSaveCharacter = async (personality: Personality, characterTheme: AppTheme, newLang: Language) => {
    if (!user) return;
    
    setIsLoading(true);
    
    // Automated Moderation
    const moderationResult = await moderateCharacter(personality, language);
    if (!moderationResult.isApproved) {
      setIsLoading(false);
      const reason = moderationResult.reason || "Violación de Términos y Condiciones";
      alert(language === 'es' ? `Tu personaje no fue aprobado: ${reason}` : `Your character was not approved: ${reason}`);
      
      // Create notification for the user
      await addDoc(collection(db, "notifications"), {
        userId: user.uid,
        title: language === 'es' ? "Personaje Rechazado" : "Character Rejected",
        message: language === 'es' ? `Tu personaje "${personality.name}" fue rechazado por: ${reason}` : `Your character "${personality.name}" was rejected due to: ${reason}`,
        type: 'moderation',
        read: false,
        createdAt: Date.now()
      });
      return;
    }

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
    
    setIsLoading(false);
    // Redirect to explore or chat is handled by handleSelectCharacter for new bots
    // For existing bots, we might want to stay or go back
    if (activeCharacter) {
      setView('chat');
    }
  };

  const handleDeleteCharacterAdmin = async (character: Character, reason: string) => {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, "characters", character.id));
      
      // Create notification for the creator
      await addDoc(collection(db, "notifications"), {
        userId: character.creatorId,
        title: language === 'es' ? "Personaje Eliminado por Moderación" : "Character Deleted by Moderation",
        message: language === 'es' 
          ? `Tu personaje "${character.name}" ha sido eliminado por infringir nuestros Términos y Condiciones. Razón: ${reason}` 
          : `Your character "${character.name}" has been deleted for violating our Terms and Conditions. Reason: ${reason}`,
        type: 'moderation',
        read: false,
        createdAt: Date.now()
      });

      if (activeCharacter?.id === character.id) {
        setActiveCharacter(null);
        setCurrentSessionId("");
        setView('explore');
      }
    } catch (error) {
      console.error("Error deleting character as admin:", error);
    }
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

  const handleSaveGlobalSettings = async (newLang: Language, newDisplayName: string, newIntensity: Intensity) => {
    audioManager.play('click');
    setLanguage(newLang);
    setIntensity(newIntensity);
    localStorage.setItem(LANG_STORAGE_KEY, newLang);
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

  const handleResetAccount = async () => {
    if (!user) return;
    
    const confirmMsg = language === 'es' 
      ? "¿ESTÁS SEGURO? Esto borrará todas tus conversaciones y reseteará tu inventario y monedas. Esta acción no se puede deshacer."
      : "ARE YOU SURE? This will delete all your conversations and reset your inventory and coins. This action cannot be undone.";
    
    if (window.confirm(confirmMsg)) {
      try {
        setIsLoading(true);
        audioManager.play('click');

        // 1. Delete all chats
        const chatDocs = sessions.filter(s => s.userId === user.uid);
        for (const session of chatDocs) {
          await deleteDoc(doc(db, "chats", session.id));
        }

        // 2. Reset user stats
        const initialStats: UserStats = {
          coins: 1000,
          purchasedItems: [],
          currentFont: 'sans',
          unlockedThemes: [],
          themeOpacity: 0.6,
          subscription: undefined
        };
        
        await updateDoc(doc(db, "users", user.uid), { stats: initialStats });
        setUserStats(initialStats);
        setTheme('sky');
        setFont('sans');
        localStorage.setItem(THEME_STORAGE_KEY, 'sky');
        localStorage.setItem(FONT_STORAGE_KEY, 'sans');

        setCurrentSessionId("");
        setView('explore');
        setIsGlobalSettingsOpen(false);
        
        alert(language === 'es' ? "Cuenta reseteada con éxito." : "Account reset successfully.");
      } catch (error) {
        console.error("Error resetting account:", error);
        alert(language === 'es' ? "Error al resetear la cuenta." : "Error resetting account.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBuyItem = async (item: ShopItem) => {
    if (!user || userStats.coins < item.price) return;
    
    // Prevent duplicate purchases
    if (userStats.purchasedItems.includes(item.id)) {
      alert(language === 'es' ? 'Ya posees este artículo.' : 'You already own this item.');
      return;
    }

    audioManager.play('pop');
    const newStats = {
      ...userStats,
      coins: userStats.coins - item.price,
      purchasedItems: [...userStats.purchasedItems, item.id],
      unlockedThemes: item.type === 'theme' ? Array.from(new Set([...userStats.unlockedThemes, item.value as AppTheme])) : userStats.unlockedThemes
    };

    setUserStats(newStats);
    await updateDoc(doc(db, "users", user.uid), { stats: newStats });
  };

  const handleDeleteTheme = async (themeToDelete: AppTheme) => {
    if (!user) return;
    if (['rose', 'emerald', 'amber', 'sky', 'space', 'retro'].includes(themeToDelete)) {
      alert(language === 'es' ? 'No puedes eliminar temas básicos.' : 'You cannot delete basic themes.');
      return;
    }

    if (window.confirm(language === 'es' ? `¿Eliminar tema ${themeToDelete}?` : `Delete theme ${themeToDelete}?`)) {
      audioManager.play('click');
      
      // Find the shop item ID for this theme to remove it from purchasedItems too
      const shopItem = SHOP_ITEMS.find(item => item.type === 'theme' && item.value === themeToDelete);
      
      const newStats = {
        ...userStats,
        unlockedThemes: userStats.unlockedThemes.filter(t => t !== themeToDelete),
        purchasedItems: shopItem ? userStats.purchasedItems.filter(id => id !== shopItem.id) : userStats.purchasedItems
      };

      if (theme === themeToDelete) {
        setTheme('sky');
        localStorage.setItem(THEME_STORAGE_KEY, 'sky');
      }

      setUserStats(newStats);
      await updateDoc(doc(db, "users", user.uid), { stats: newStats });
    }
  };

  const handleApplyTheme = (newTheme: AppTheme) => {
    audioManager.play('click');
    setTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  const handleApplyFont = (newFont: AppFont) => {
    audioManager.play('click');
    setFont(newFont);
    localStorage.setItem(FONT_STORAGE_KEY, newFont);
  };

  const isAdmin = user?.email === 'dav1degante@gmail.com';

  const handleAddCoins = async (amount: number) => {
    if (!user || !isAdmin) return;
    audioManager.play('pop');
    const newStats = {
      ...userStats,
      coins: userStats.coins + amount,
    };
    setUserStats(newStats);
    await updateDoc(doc(db, "users", user.uid), { stats: newStats });
  };

  const handleUpdateOpacity = async (opacity: number) => {
    if (!user) return;
    const newStats = {
      ...userStats,
      themeOpacity: opacity,
    };
    setUserStats(newStats);
    await updateDoc(doc(db, "users", user.uid), { stats: newStats });
  };

  const handleAdComplete = async (reward: number) => {
    if (!user) return;
    audioManager.play('pop');
    const newStats = {
      ...userStats,
      coins: userStats.coins + reward,
    };
    setUserStats(newStats);
    await updateDoc(doc(db, "users", user.uid), { stats: newStats });
    setShowAd(false);
  };

  const handleSubscribe = async () => {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    // Stripe logic removed as per user request. PayPal is the primary payment method.
  };

  const handleClaimDaily = async () => {
    if (!user || !userStats.subscription?.active) return;
    
    const today = new Date().setHours(0, 0, 0, 0);
    if (userStats.subscription.lastClaimDate >= today) {
      alert(t('alreadyClaimed', language));
      return;
    }

    audioManager.play('pop');
    const newStats: UserStats = {
      ...userStats,
      coins: userStats.coins + 33,
      subscription: {
        ...userStats.subscription,
        lastClaimDate: Date.now()
      }
    };
    setUserStats(newStats);
    await updateDoc(doc(db, "users", user.uid), { stats: newStats });
  };

  return (
    <PayPalScriptProvider options={{ 
      clientId: (import.meta as any).env.VITE_PAYPAL_CLIENT_ID || "test",
      currency: "USD",
      intent: "capture"
    }}>
      <ErrorBoundary>
        <div 
          className="flex h-[100dvh] w-full bg-[#050505] text-zinc-100 overflow-hidden font-sans"
          data-theme={theme}
          style={{ 
            fontFamily: `var(--font-${font})`,
            '--bg-opacity': userStats.themeOpacity ?? 0.6
          } as React.CSSProperties}
        >
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute inset-0 opacity-[var(--bg-opacity)] transition-opacity duration-500"
            style={{ 
              backgroundImage: 'var(--bg-image)', 
              backgroundRepeat: 'repeat',
              backgroundSize: 'var(--bg-size, auto)'
            } as React.CSSProperties}
          />
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--brand)]/10 blur-[120px] rounded-full transition-colors duration-500" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
        </div>

        {user && (
          <Sidebar
            sessions={sessions.map(s => ({ ...s, title: s.characterName } as any))}
            currentSessionId={currentSessionId}
            language={language}
            onSelectSession={(id) => {
              audioManager.play('pop');
              setCurrentSessionId(id);
              setView('chat');
              setIsSidebarOpen(false);
            }}
            onNewSession={() => {
              audioManager.play('click');
              setView('explore');
              setIsSidebarOpen(false);
            }}
            onDeleteSession={async (id) => {
              if (window.confirm(t('deleteConfirm', language))) {
                audioManager.play('click');
                await deleteDoc(doc(db, "chats", id));
                if (currentSessionId === id) {
                  setCurrentSessionId("");
                  setView('explore');
                }
              }
            }}
            onOpenSettings={() => {
              audioManager.play('click');
              setIsGlobalSettingsOpen(true);
            }}
            onOpenLegal={() => {
              audioManager.play('click');
              setView('legal');
              setIsSidebarOpen(false);
            }}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 relative flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800/30 bg-zinc-950/20 backdrop-blur-xl z-10">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="w-6 h-6" />
              </Button>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                audioManager.play('click');
                setView('explore');
              }}>
                <Heart className="w-6 h-6 text-[var(--brand)]" />
                <span className="text-xl font-bold font-heading tracking-tight">GIMS.ai</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                className={cn("gap-2 rounded-full", view === 'create' && "text-[var(--brand)] bg-[var(--brand)]/10")}
                onClick={() => {
                  audioManager.play('click');
                  setView('create');
                }}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'es' ? 'Crear' : 'Create'}</span>
              </Button>

              <Button 
                variant="ghost" 
                className={cn("gap-2 rounded-full", view === 'explore' && "text-[var(--brand)] bg-[var(--brand)]/10")}
                onClick={() => {
                  audioManager.play('click');
                  setView('explore');
                }}
              >
                <Compass className="w-4 h-4" />
                <span className="hidden sm:inline">{t('search', language)}</span>
              </Button>

              <Button 
                variant="ghost" 
                className={cn("gap-2 rounded-full", view === 'shop' && "text-[var(--brand)] bg-[var(--brand)]/10")}
                onClick={() => {
                  audioManager.play('click');
                  setView('shop');
                }}
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">{t('shop', language)}</span>
              </Button>

              <Button 
                variant="ghost" 
                className={cn("gap-2 rounded-full", view === 'personalization' && "text-[var(--brand)] bg-[var(--brand)]/10")}
                onClick={() => {
                  audioManager.play('click');
                  setView('personalization');
                }}
              >
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">{t('personalization', language)}</span>
              </Button>
              
              {!user ? (
                <Button onClick={signInWithGoogle} className="bg-[var(--brand)] hover:opacity-90 gap-2 rounded-full">
                  <LogIn className="w-4 h-4" />
                  {language === 'es' ? 'Entrar' : 'Login'}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <div 
                    className={cn(
                      "flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800 cursor-pointer hover:border-amber-500/50 transition-colors group relative overflow-hidden",
                      isAdmin && "hover:border-amber-500"
                    )}
                    onClick={() => {
                      if (isAdmin) {
                        handleAddCoins(1000);
                      } else {
                        setShowAd(true);
                      }
                    }}
                    title={isAdmin ? (language === 'es' ? "Click para +1000 monedas (Admin)" : "Click for +1000 coins (Admin)") : (language === 'es' ? "Ver anuncio para ganar monedas" : "Watch ad to earn coins")}
                  >
                    <div className="absolute inset-0 bg-amber-500/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                    <Coins className="w-4 h-4 text-amber-400 relative z-10" />
                    <span className="text-sm font-bold text-amber-100 relative z-10">{userStats.coins}</span>
                    {!isAdmin && <Plus className="w-3 h-3 text-amber-500 ml-0.5 relative z-10" />}
                  </div>
                  <div className="relative">
                    <Button variant="ghost" size="icon" className="rounded-full relative" onClick={() => setIsNotificationsOpen(true)}>
                      <Bell className="w-5 h-5 text-zinc-400" />
                      {notifications.filter(n => !n.read).length > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={handleNewCharacter}>
                    <Plus className="w-5 h-5 text-[var(--brand)]" />
                  </Button>
                  {view === 'chat' && currentSession && activeCharacter && (activeCharacter.creatorId === user.uid || isAdmin) && (
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setView('create')}>
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
                  isAdmin={isAdmin}
                  onDeleteCharacter={handleDeleteCharacterAdmin}
                />
              </motion.div>
            ) : view === 'shop' ? (
              <motion.div
                key="shop"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <ShopView 
                  language={language} 
                  userStats={userStats}
                  userId={user?.uid}
                  onBuy={handleBuyItem}
                  onAddCoins={async (amount) => {
                    if (!user) return;
                    audioManager.play('pop');
                    const newStats = {
                      ...userStats,
                      coins: userStats.coins + amount,
                    };
                    setUserStats(newStats);
                    await updateDoc(doc(db, "users", user.uid), { stats: newStats });
                  }}
                  onSubscribe={handleSubscribe}
                  onClaimDaily={handleClaimDaily}
                />
              </motion.div>
            ) : view === 'personalization' ? (
              <motion.div
                key="personalization"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <PersonalizationView 
                  language={language} 
                  userStats={userStats}
                  currentTheme={theme}
                  currentFont={font}
                  onApplyTheme={handleApplyTheme}
                  onDeleteTheme={handleDeleteTheme}
                  onApplyFont={handleApplyFont}
                  onUpdateOpacity={handleUpdateOpacity}
                />
              </motion.div>
            ) : view === 'create' ? (
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <CreateCharacterView 
                  personality={activeCharacter || { name: "", traits: [], tags: [], style: "", description: "", isPublic: true, isNSFW: false }}
                  theme={theme}
                  language={language}
                  onSave={handleSaveCharacter}
                  onDelete={handleDeleteCharacter}
                  isCreator={!activeCharacter || activeCharacter.creatorId === user?.uid || isAdmin}
                  onBack={() => setView('explore')}
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
                    onEditMessage={handleEditMessage}
                    onRegenerateMessage={handleRegenerateMessage}
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
              language={language}
              intensity={intensity}
              displayName={user?.displayName || ""}
              onSave={handleSaveGlobalSettings}
              onResetAccount={handleResetAccount}
            />
          </DialogContent>
        </Dialog>

        {/* Notifications Dialog */}
        <Dialog open={isNotificationsOpen} onOpenChange={(open) => {
          setIsNotificationsOpen(open);
          if (!open) {
            // Mark all as read when closing
            notifications.forEach(n => {
              if (!n.read) {
                updateDoc(doc(db, "notifications", n.id), { read: true });
              }
            });
          }
        }}>
          <DialogContent className="max-w-md bg-zinc-950 border-zinc-800 text-zinc-100 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-xl font-bold font-heading mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[var(--brand)]" />
              {language === 'es' ? 'Notificaciones' : 'Notifications'}
            </h2>
            {notifications.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">
                {language === 'es' ? 'No tienes notificaciones.' : 'You have no notifications.'}
              </p>
            ) : (
              <div className="space-y-3">
                {notifications.map(n => (
                  <div key={n.id} className={cn("p-4 rounded-xl border", n.read ? "bg-zinc-900/50 border-zinc-800/50" : "bg-zinc-900 border-[var(--brand)]/30")}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-zinc-100">{n.title}</h3>
                      <span className="text-xs text-zinc-500 whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Rewarded Ad Overlay */}
        {showAd && (
          <RewardedAd 
            language={language}
            onComplete={handleAdComplete}
            onClose={() => setShowAd(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  </PayPalScriptProvider>
  );
}
