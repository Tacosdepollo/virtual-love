import React, { useState, useRef, useEffect } from "react";
import { Message, Personality } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Send, User, Bot, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface ChatWindowProps {
  messages: Message[];
  personality: Personality;
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

export default function ChatWindow({ messages, personality, onSendMessage, isLoading }: ChatWindowProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-zinc-950/30 backdrop-blur-sm rounded-2xl border border-zinc-800/50 overflow-hidden shadow-2xl">
      {/* Header - Hidden on mobile as App.tsx provides a mobile header */}
      <div className="hidden md:flex p-4 border-b border-zinc-800 bg-zinc-900/50 items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-[var(--brand)]/50">
            <AvatarFallback className="bg-[var(--brand)] text-white">
              {personality.name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-zinc-100">{personality.name}</h2>
            <p className="text-xs text-[var(--brand)] flex items-center gap-1 opacity-80">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              En línea
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4 lg:p-6">
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
                  <h3 className="text-xl font-semibold text-zinc-200">¡Saluda a {personality.name}!</h3>
                  <p className="text-zinc-400 max-w-xs mx-auto text-sm">
                    Tu nueva amiga virtual está lista para charlar. ¿De qué quieres hablar hoy?
                  </p>
                </div>
              </motion.div>
            )}

            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <Avatar className={cn(
                  "w-8 h-8 shrink-0 mt-1",
                  msg.role === "user" ? "border-zinc-700" : "border-[var(--brand)]/30"
                )}>
                  {msg.role === "user" ? (
                    <AvatarFallback className="bg-zinc-800 text-zinc-400"><User className="w-4 h-4" /></AvatarFallback>
                  ) : (
                    <AvatarFallback className="bg-[var(--brand)] text-white">{personality.name[0]}</AvatarFallback>
                  )}
                </Avatar>
                
                <div className={cn(
                  "space-y-1",
                  msg.role === "user" ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                    msg.role === "user" 
                      ? "bg-[var(--brand)] text-white rounded-tr-none" 
                      : "bg-zinc-800/80 text-zinc-100 rounded-tl-none border border-zinc-700/50"
                  )}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-zinc-500 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 mr-auto"
              >
                <Avatar className="w-8 h-8 border-[var(--brand)]/30">
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

      {/* Input Area */}
      <div className="p-4 bg-zinc-900/80 backdrop-blur-md border-t border-zinc-800">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Escribe un mensaje a ${personality.name}...`}
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
      </div>
    </div>
  );
}
