import React from "react";
import { ChatSession, Language } from "../types";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { MessageSquare, Plus, Trash2, Settings, Heart, X } from "lucide-react";
import { cn } from "../lib/utils";
import { t } from "../translations";
import { audioManager } from "../lib/audio";

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  language: Language;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onOpenSettings: () => void;
  onOpenLegal: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  sessions,
  currentSessionId,
  language,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onOpenSettings,
  onOpenLegal,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-zinc-950 border-r border-zinc-800 flex flex-col transition-transform duration-300 md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[var(--brand)]" />
            <span className="font-bold">{t('appName', language)}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

      <ScrollArea className="flex-1 px-2 mt-4">
        <div className="space-y-1">
          <h3 className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            {t('sidebarTitle', language)}
          </h3>
          {sessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                currentSessionId === session.id
                  ? "bg-[var(--brand)]/20 text-zinc-100 border border-[var(--brand)]/30"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              )}
              onClick={() => {
                audioManager.play('pop');
                onSelectSession(session.id);
              }}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="flex-1 truncate text-sm">{(session as any).title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  audioManager.play('click');
                  onDeleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-zinc-800 space-y-1">
        <a 
          href="https://discord.gg/mCQ2MmQKSH" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-[#5865F2]/20 transition-colors text-sm font-medium group"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#5865F2] group-hover:text-[#5865F2]">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </div>
          {t('joinDiscord', language)}
        </a>
        <Button
          variant="ghost"
          onClick={onOpenSettings}
          className="w-full justify-start gap-2 text-zinc-400 hover:text-[var(--brand)] hover:bg-[var(--brand)]/10"
        >
          <Settings className="w-4 h-4" />
          {t('settings', language)}
        </Button>
        <Button
          variant="ghost"
          onClick={onOpenLegal}
          className="w-full justify-start gap-2 text-zinc-500 hover:text-zinc-300 text-xs mt-1"
        >
          {t('legal', language)}
        </Button>
      </div>
    </div>
    </>
  );
}
