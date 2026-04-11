import React, { useState, useRef, useEffect } from "react";
import { Message, Personality, Language } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Send, User, Bot, Loader2, Pin, PinOff, BrainCircuit, X, Edit2, RefreshCw, CheckSquare, Square, Download, Check, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { t } from "../translations";
import { audioManager } from "../lib/audio";
import Markdown from "react-markdown";
import { toJpeg } from 'html-to-image';

interface ChatWindowProps {
  messages: Message[];
  personality: Personality;
  language: Language;
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  coreThoughts?: string[];
  onToggleCoreThought?: (messageId: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onRegenerateMessage?: (messageId: string) => void;
  onConfigureCharacter?: () => void;
}

export default function ChatWindow({ 
  messages, 
  personality, 
  language, 
  onSendMessage, 
  isLoading,
  coreThoughts = [],
  onToggleCoreThought,
  onEditMessage,
  onRegenerateMessage,
  onConfigureCharacter
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Edit State
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Select/Export State
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const exportContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && !editingMessageId && !isSelectMode) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading, editingMessageId, isSelectMode]);

  useEffect(() => {
    let timeout: any;
    const playTypingSound = () => {
      if (isLoading) {
        const randomStart = Math.random() * 13;
        audioManager.play('typing', 0.1, randomStart, 2);
        timeout = setTimeout(playTypingSound, 2000);
      }
    };
    
    if (isLoading) {
      playTypingSound();
    }
    
    return () => {
      clearTimeout(timeout);
      audioManager.stop('typing');
    };
  }, [isLoading]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      audioManager.play('click');
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleSaveEdit = (messageId: string) => {
    if (editContent.trim() && onEditMessage) {
      onEditMessage(messageId, editContent.trim());
    }
    setEditingMessageId(null);
  };

  const toggleSelection = (messageId: string) => {
    setSelectedMessageIds(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleExportJPG = async () => {
    if (selectedMessageIds.length === 0 || !exportContainerRef.current) return;
    
    try {
      audioManager.play('pop');
      const dataUrl = await toJpeg(exportContainerRef.current, {
        backgroundColor: '#09090b', // zinc-950
        pixelRatio: 2, // High resolution
        quality: 0.9,
      });
      
      const link = document.createElement('a');
      link.download = `GimsAI-${personality.name}-${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
      
      // Reset selection
      setIsSelectMode(false);
      setSelectedMessageIds([]);
    } catch (error) {
      console.error("Error exporting image:", error);
      alert(language === 'es' ? "Error al exportar la imagen." : "Error exporting image.");
    }
  };

  // Get selected messages in order
  const selectedMessages = messages.filter(m => selectedMessageIds.includes(m.id));

  return (
    <div className="flex flex-col flex-1 min-h-0 max-w-4xl mx-auto w-full bg-zinc-950/10 backdrop-blur-sm rounded-2xl border border-zinc-800/30 overflow-hidden shadow-2xl relative">
      {/* Header */}
      <div className="flex p-4 border-b border-zinc-800/30 bg-zinc-900/20 items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-[var(--brand)]/50">
            <AvatarImage src={personality.avatarUrl} referrerPolicy="no-referrer" />
            <AvatarFallback className="bg-[var(--brand)] text-white">
              {personality.name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-zinc-100 font-heading">{personality.name}</h2>
            <p className="text-xs text-[var(--brand)] flex items-center gap-1 opacity-80">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {t('online', language)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {coreThoughts.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full">
              <BrainCircuit className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-purple-300">
                {coreThoughts.length}/6 {t('coreThoughts', language)}
              </span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              if (isSelectMode) setSelectedMessageIds([]);
            }}
            className={cn("gap-2 rounded-full", isSelectMode && "bg-zinc-800")}
          >
            {isSelectMode ? <X className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
            <span className="hidden sm:inline">{language === 'es' ? 'Seleccionar' : 'Select'}</span>
          </Button>

          {onConfigureCharacter && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onConfigureCharacter}
              className="rounded-full"
              title={language === 'es' ? 'Configurar Personaje' : 'Configure Character'}
            >
              <Settings className="w-4 h-4 text-zinc-400" />
            </Button>
          )}
        </div>
      </div>

      {/* Core Thoughts Bar */}
      <AnimatePresence>
        {coreThoughts.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-purple-950/20 border-b border-purple-500/10 overflow-hidden"
          >
            <div className="p-2 flex gap-2 overflow-x-auto custom-scrollbar">
              {coreThoughts.map(id => {
                const msg = messages.find(m => m.id === id);
                if (!msg) return null;
                return (
                  <div 
                    key={id} 
                    className="shrink-0 max-w-[200px] bg-purple-900/30 border border-purple-500/20 rounded-lg p-2 relative group"
                  >
                    <p className="text-[10px] text-zinc-300 line-clamp-2 italic">"{msg.content}"</p>
                    <button 
                      onClick={() => onToggleCoreThought?.(id)}
                      className="absolute -top-1 -right-1 bg-purple-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <ScrollArea ref={scrollRef} className="flex-1 min-h-0 p-4 lg:p-6">
        <div className="space-y-6">
          <AnimatePresence initial={false}>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-10 space-y-4"
              >
                <div className="w-16 h-16 bg-[var(--brand)]/10 rounded-full flex items-center justify-center mx-auto">
                  <Bot className="w-8 h-8 text-[var(--brand)] opacity-80" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-zinc-200 font-heading">{t('greet', language, { name: personality.name })}</h3>
                  <p className="text-zinc-400 max-w-xs mx-auto text-sm">
                    {t('greetSub', language, { name: personality.name })}
                  </p>
                </div>
              </motion.div>
            )}

            {messages.map((msg, idx) => {
              const isSelected = selectedMessageIds.includes(msg.id);
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={cn(
                    "flex gap-3 max-w-[85%] relative transition-all duration-200",
                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto",
                    isSelectMode && "cursor-pointer hover:bg-zinc-800/30 p-2 rounded-xl -mx-2",
                    isSelected && "bg-zinc-800/50 ring-1 ring-[var(--brand)]/50"
                  )}
                  onClick={() => isSelectMode && toggleSelection(msg.id)}
                >
                  {isSelectMode && (
                    <div className="absolute top-1/2 -translate-y-1/2 -left-8">
                      {isSelected ? <CheckSquare className="w-5 h-5 text-[var(--brand)]" /> : <Square className="w-5 h-5 text-zinc-500" />}
                    </div>
                  )}

                  <Avatar className={cn(
                    "w-8 h-8 shrink-0 mt-1",
                    msg.role === "user" ? "border-zinc-700" : "border-[var(--brand)]/30"
                  )}>
                    {msg.role === "user" ? (
                      <AvatarFallback className="bg-zinc-800 text-zinc-400"><User className="w-4 h-4" /></AvatarFallback>
                    ) : (
                      <>
                        <AvatarImage src={personality.avatarUrl} referrerPolicy="no-referrer" />
                        <AvatarFallback className="bg-[var(--brand)] text-white">{personality.name[0]}</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  
                  <div className={cn(
                    "space-y-1 group relative",
                    msg.role === "user" ? "items-end" : "items-start",
                    "w-full"
                  )}>
                    {editingMessageId === msg.id ? (
                      <div className="flex flex-col gap-2 w-full min-w-[250px]">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-100 focus:ring-1 focus:ring-[var(--brand)] outline-none resize-y min-h-[80px]"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setEditingMessageId(null)}>
                            {language === 'es' ? 'Cancelar' : 'Cancel'}
                          </Button>
                          <Button size="sm" className="bg-[var(--brand)]" onClick={() => handleSaveEdit(msg.id)}>
                            {language === 'es' ? 'Guardar' : 'Save'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className={cn(
                        "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm markdown-body",
                        msg.role === "user" 
                          ? "bg-[var(--brand)] text-white rounded-tr-none" 
                          : "bg-zinc-800/80 text-zinc-100 rounded-tl-none border border-zinc-700/50",
                        coreThoughts.includes(msg.id) && "border-purple-500/50 ring-1 ring-purple-500/30"
                      )}>
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    {!isSelectMode && editingMessageId !== msg.id && (
                      <div className={cn(
                        "absolute top-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-1 z-10",
                        msg.role === "user" ? "-left-10" : "-right-10"
                      )}>
                        {/* Pin */}
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleCoreThought?.(msg.id); }}
                          className={cn(
                            "p-1.5 rounded-full bg-zinc-900/80 border border-zinc-700 shadow-lg hover:bg-zinc-800",
                            coreThoughts.includes(msg.id) && "text-purple-400 border-purple-500/50"
                          )}
                          title={coreThoughts.includes(msg.id) ? t('unpinThought', language) : t('pinThought', language)}
                        >
                          {coreThoughts.includes(msg.id) ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                        </button>
                        
                        {/* Edit */}
                        {onEditMessage && (
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setEditContent(msg.content);
                              setEditingMessageId(msg.id);
                            }}
                            className="p-1.5 rounded-full bg-zinc-900/80 border border-zinc-700 shadow-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                            title={language === 'es' ? 'Editar' : 'Edit'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Regenerate (Only for AI) */}
                        {msg.role === "assistant" && onRegenerateMessage && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onRegenerateMessage(msg.id); }}
                            className="p-1.5 rounded-full bg-zinc-900/80 border border-zinc-700 shadow-lg hover:bg-zinc-800 text-zinc-400 hover:text-[var(--brand)]"
                            title={language === 'es' ? 'Regenerar' : 'Regenerate'}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    {!editingMessageId && (
                      <span className="text-[10px] text-zinc-500 px-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 mr-auto"
              >
                <Avatar className="w-8 h-8 border-[var(--brand)]/30">
                  <AvatarImage src={personality.avatarUrl} referrerPolicy="no-referrer" />
                  <AvatarFallback className="bg-[var(--brand)] text-white">{personality.name[0]}</AvatarFallback>
                </Avatar>
                <div className="bg-zinc-800/80 px-4 py-3 rounded-2xl rounded-tl-none border border-zinc-700/50">
                  <Loader2 className="w-4 h-4 text-[var(--brand)] opacity-80 animate-spin" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Input Area / Export Area */}
      <div className="p-4 bg-zinc-900/40 backdrop-blur-md border-t border-zinc-800/30 shrink-0">
        {isSelectMode ? (
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <span className="text-sm text-zinc-400">
              {selectedMessageIds.length} {language === 'es' ? 'mensajes seleccionados' : 'messages selected'}
            </span>
            <Button 
              onClick={handleExportJPG}
              disabled={selectedMessageIds.length === 0}
              className="bg-[var(--brand)] hover:opacity-90 gap-2 rounded-full"
            >
              <Download className="w-4 h-4" />
              {language === 'es' ? 'Exportar JPG' : 'Export JPG'}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 max-w-3xl mx-auto">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={t('inputPlaceholder', language, { name: personality.name })}
              className="bg-zinc-800 border-zinc-700 focus:ring-[var(--brand)] text-zinc-100 h-12"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-[var(--brand)] hover:opacity-90 h-12 w-12 rounded-full shrink-0 p-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Hidden Export Container */}
      <div className="absolute top-[-9999px] left-[-9999px] pointer-events-none">
        <div 
          ref={exportContainerRef} 
          className="bg-[#09090b] p-8 w-[600px] flex flex-col gap-6 font-sans"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 pb-6 border-b border-zinc-800">
            <Avatar className="w-16 h-16 border-2 border-[var(--brand)]/50">
              <AvatarImage src={personality.avatarUrl} referrerPolicy="no-referrer" />
              <AvatarFallback className="bg-[var(--brand)] text-white text-2xl">
                {personality.name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-zinc-100">{personality.name}</h2>
              <p className="text-zinc-400 text-sm">Gims.ai - Virtual Love</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-6">
            {selectedMessages.map((msg) => (
              <div
                key={`export-${msg.id}`}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <Avatar className={cn(
                  "w-10 h-10 shrink-0 mt-1",
                  msg.role === "user" ? "border-zinc-700" : "border-[var(--brand)]/30"
                )}>
                  {msg.role === "user" ? (
                    <AvatarFallback className="bg-zinc-800 text-zinc-400"><User className="w-5 h-5" /></AvatarFallback>
                  ) : (
                    <>
                      <AvatarImage src={personality.avatarUrl} referrerPolicy="no-referrer" />
                      <AvatarFallback className="bg-[var(--brand)] text-white">{personality.name[0]}</AvatarFallback>
                    </>
                  )}
                </Avatar>
                
                <div className={cn(
                  "px-5 py-4 rounded-3xl text-[15px] leading-relaxed shadow-sm markdown-body",
                  msg.role === "user" 
                    ? "bg-[var(--brand)] text-white rounded-tr-none" 
                    : "bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700/50"
                )}>
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
            ))}
          </div>

          {/* Footer / Watermark */}
          <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-center gap-2 text-zinc-500">
            <span className="font-bold text-lg text-zinc-300">Gims.ai</span>
            <span>•</span>
            <span>Crea tu propia historia</span>
          </div>
        </div>
      </div>
    </div>
  );
}
