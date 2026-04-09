import React, { useState } from "react";
import { AppTheme, Language } from "../types";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Settings, Palette, Check, Globe } from "lucide-react";
import { cn } from "../lib/utils";
import { t } from "../translations";

interface GlobalSettingsProps {
  theme: AppTheme;
  language: Language;
  onSave: (theme: AppTheme, language: Language) => void;
}

const THEMES: { id: AppTheme; color: string; name: { es: string; en: string } }[] = [
  { id: 'indigo', color: 'bg-indigo-500', name: { es: 'Índigo', en: 'Indigo' } },
  { id: 'rose', color: 'bg-rose-500', name: { es: 'Rosa', en: 'Rose' } },
  { id: 'emerald', color: 'bg-emerald-500', name: { es: 'Esmeralda', en: 'Emerald' } },
  { id: 'amber', color: 'bg-amber-500', name: { es: 'Ámbar', en: 'Amber' } },
  { id: 'sky', color: 'bg-sky-500', name: { es: 'Cielo', en: 'Sky' } },
  { id: 'violet', color: 'bg-violet-500', name: { es: 'Violeta', en: 'Violet' } },
];

export default function GlobalSettings({ theme, language, onSave }: GlobalSettingsProps) {
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(theme);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-2xl bg-zinc-950/50 backdrop-blur-xl text-zinc-100 overflow-hidden rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold font-heading">
          <Settings className="w-6 h-6 text-[var(--brand)]" />
          {selectedLanguage === 'es' ? 'Ajustes Globales' : 'Global Settings'}
        </CardTitle>
        <CardDescription className="text-zinc-400">
          {selectedLanguage === 'es' 
            ? 'Personaliza tu experiencia en Gams.ia' 
            : 'Customize your experience on Gams.ia'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-zinc-300">
            <Globe className="w-4 h-4" />
            {t('language', selectedLanguage)}
          </Label>
          <div className="flex gap-2">
            {(['es', 'en'] as Language[]).map((lang) => (
              <Button
                key={lang}
                variant={selectedLanguage === lang ? "default" : "outline"}
                onClick={() => setSelectedLanguage(lang)}
                className={cn(
                  "flex-1 h-12 rounded-xl transition-all",
                  selectedLanguage === lang ? "bg-[var(--brand)] text-white" : "border-zinc-800 text-zinc-400 hover:text-zinc-200"
                )}
              >
                {lang === 'es' ? 'Español' : 'English'}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-zinc-300">
            <Palette className="w-4 h-4" />
            {t('theme', selectedLanguage)}
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTheme(t.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                  selectedTheme === t.id 
                    ? "border-[var(--brand)] bg-[var(--brand)]/10" 
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                )}
              >
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", t.color)}>
                  {selectedTheme === t.id && <Check className="w-4 h-4 text-white" />}
                </div>
                <span className="text-[10px] font-medium text-zinc-400">{t.name[selectedLanguage]}</span>
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={() => onSave(selectedTheme, selectedLanguage)}
          className="w-full bg-[var(--brand)] hover:opacity-90 text-white font-bold py-6 rounded-xl shadow-lg shadow-[var(--brand)]/20"
        >
          {selectedLanguage === 'es' ? 'Guardar Cambios' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
}
