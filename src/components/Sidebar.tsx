import React from "react";
import { ChatSession, Language } from "../types";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { MessageSquare, Plus, Trash2, Settings, Heart, X } from "lucide-react";
import { cn } from "../lib/utils";
import { t } from "../translations";

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  language: Language;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onOpenSettings: () => void;
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

        <div className="p-4 space-y-4">
          <Button
            onClick={onNewSession}
            className="w-full bg-[var(--brand)] hover:opacity-90 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('newChat', language)}
          </Button>
        </div>

      <ScrollArea className="flex-1 px-2">
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
              onClick={() => onSelectSession(session.id)}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="flex-1 truncate text-sm">{session.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
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

      <div className="p-4 border-t border-zinc-800">
        <Button
          variant="ghost"
          onClick={onOpenSettings}
          className="w-full justify-start gap-2 text-zinc-400 hover:text-[var(--brand)] hover:bg-[var(--brand)]/10"
        >
          <Settings className="w-4 h-4" />
          {t('settings', language)}
        </Button>
      </div>
    </div>
    </>
  );
}
