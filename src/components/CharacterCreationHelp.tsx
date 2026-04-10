import React from "react";
import { Language } from "../types";
import { t } from "../translations";
import { Info, User, FileText, Sparkles, MessageSquare, ShieldCheck } from "lucide-react";

interface CharacterCreationHelpProps {
  language: Language;
}

export default function CharacterCreationHelp({ language }: CharacterCreationHelpProps) {
  const items = [
    { icon: User, title: t('personalityName', language), desc: t('creationHelpName', language) },
    { icon: FileText, title: t('personalityDesc', language), desc: t('creationHelpDesc', language) },
    { icon: Sparkles, title: t('personalityTraits', language), desc: t('creationHelpTraits', language) },
    { icon: MessageSquare, title: t('personalityStyle', language), desc: t('creationHelpStyle', language) },
    { icon: ShieldCheck, title: t('personalityInstructions', language), desc: t('creationHelpInstructions', language) },
  ];

  return (
    <div className="p-6 space-y-6 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl max-w-md">
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
        <div className="p-2 bg-[var(--brand)]/20 rounded-lg">
          <Info className="w-5 h-5 text-[var(--brand)]" />
        </div>
        <h2 className="text-xl font-bold font-heading text-zinc-100">{t('creationHelpTitle', language)}</h2>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-4 group">
            <div className="shrink-0 mt-1 p-1.5 bg-zinc-800 rounded-md group-hover:bg-zinc-700 transition-colors">
              <item.icon className="w-4 h-4 text-zinc-400 group-hover:text-[var(--brand)] transition-colors" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-200">{item.title}</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <p className="text-[10px] text-zinc-400 italic text-center">
          Recuerda: Cuanto más detallado seas, más realista será la personalidad de tu IA.
        </p>
      </div>
    </div>
  );
}
