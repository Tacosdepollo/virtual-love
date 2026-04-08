import React, { useState } from "react";
import { Personality, AppTheme, Language } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { X, Plus, Sparkles, Palette, Check, Globe } from "lucide-react";
import { cn } from "../lib/utils";
import { t } from "../translations";

interface PersonalitySettingsProps {
  personality: Personality;
  theme: AppTheme;
  language: Language;
  onSave: (personality: Personality, theme: AppTheme, language: Language) => void;
}

const THEMES: { id: AppTheme; color: string; name: { es: string; en: string } }[] = [
  { id: 'indigo', color: 'bg-indigo-500', name: { es: 'Índigo', en: 'Indigo' } },
  { id: 'rose', color: 'bg-rose-500', name: { es: 'Rosa', en: 'Rose' } },
  { id: 'emerald', color: 'bg-emerald-500', name: { es: 'Esmeralda', en: 'Emerald' } },
  { id: 'amber', color: 'bg-amber-500', name: { es: 'Ámbar', en: 'Amber' } },
  { id: 'sky', color: 'bg-sky-500', name: { es: 'Cielo', en: 'Sky' } },
  { id: 'violet', color: 'bg-violet-500', name: { es: 'Violeta', en: 'Violet' } },
];

export default function PersonalitySettings({ personality, theme, language, onSave }: PersonalitySettingsProps) {
  const [edited, setEdited] = useState<Personality>(personality);
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(theme);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);
  const [newTrait, setNewTrait] = useState("");

  const handleAddTrait = () => {
    if (newTrait.trim() && !edited.traits.includes(newTrait.trim())) {
      setEdited({ ...edited, traits: [...edited.traits, newTrait.trim()] });
      setNewTrait("");
    }
  };

  const handleRemoveTrait = (trait: string) => {
    setEdited({ ...edited, traits: edited.traits.filter((t) => t !== trait) });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-2xl bg-zinc-950/50 backdrop-blur-xl text-zinc-100 max-h-[90vh] flex flex-col">
      <CardHeader className="shrink-0">
        <CardTitle className="flex items-center gap-2 text-2xl font-bold font-heading">
          <Sparkles className="w-6 h-6 text-[var(--brand)]" />
          {selectedLanguage === 'es' ? 'Configurar Personalidad' : 'Configure Personality'}
        </CardTitle>
        <CardDescription className="text-zinc-400">
          {selectedLanguage === 'es' 
            ? 'Define cómo quieres que sea tu amiga virtual. Sé específico para mejores resultados.' 
            : 'Define how you want your virtual friend to be. Be specific for better results.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 overflow-y-auto flex-1 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">{t('personalityName', selectedLanguage)}</Label>
            <Input
              id="name"
              value={edited.name}
              onChange={(e) => setEdited({ ...edited, name: e.target.value })}
              placeholder="Ej: Luna, Elena, Sophie..."
              className="bg-zinc-900 border-zinc-800 focus:ring-[var(--brand)]"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
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
                    "flex-1",
                    selectedLanguage === lang ? "bg-[var(--brand)]" : "border-zinc-800"
                  )}
                >
                  {lang === 'es' ? 'Español' : 'English'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            {t('theme', selectedLanguage)}
          </Label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTheme(t.id)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all",
                  selectedTheme === t.id 
                    ? "border-[var(--brand)] bg-[var(--brand)]/10" 
                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                )}
              >
                <div className={cn("w-6 h-6 rounded-full", t.color)}>
                  {selectedTheme === t.id && <Check className="w-4 h-4 text-white m-auto" />}
                </div>
                <span className="text-[10px] text-zinc-400">{t.name[selectedLanguage]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t('personalityDesc', selectedLanguage)}</Label>
          <Textarea
            id="description"
            value={edited.description}
            onChange={(e) => setEdited({ ...edited, description: e.target.value })}
            placeholder={selectedLanguage === 'es' ? "Ej: Una chica alegre..." : "Ex: A cheerful girl..."}
            className="bg-zinc-900 border-zinc-800 focus:ring-[var(--brand)] min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label>{t('personalityTraits', selectedLanguage)}</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {edited.traits.map((trait) => (
              <Badge
                key={trait}
                variant="secondary"
                className="bg-[var(--brand)]/20 text-[var(--brand)] border-[var(--brand)]/30 px-3 py-1 flex items-center gap-1"
              >
                {trait}
                <X
                  className="w-3 h-3 cursor-pointer hover:opacity-80"
                  onClick={() => handleRemoveTrait(trait)}
                />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTrait}
              onChange={(e) => setNewTrait(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTrait()}
              placeholder={selectedLanguage === 'es' ? "Añadir rasgo..." : "Add trait..."}
              className="bg-zinc-900 border-zinc-800 focus:ring-[var(--brand)]"
            />
            <Button
              onClick={handleAddTrait}
              variant="outline"
              className="border-zinc-800 hover:bg-zinc-800"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="style">{t('personalityStyle', selectedLanguage)}</Label>
          <Input
            id="style"
            value={edited.style}
            onChange={(e) => setEdited({ ...edited, style: e.target.value })}
            placeholder={selectedLanguage === 'es' ? "Ej: Informal..." : "Ex: Informal..."}
            className="bg-zinc-900 border-zinc-800 focus:ring-[var(--brand)]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructions">{t('personalityInstructions', selectedLanguage)}</Label>
          <Textarea
            id="instructions"
            value={edited.customInstructions}
            onChange={(e) => setEdited({ ...edited, customInstructions: e.target.value })}
            placeholder={selectedLanguage === 'es' ? "Ej: No tengas miedo..." : "Ex: Don't be afraid..."}
            className="bg-zinc-900 border-zinc-800 focus:ring-[var(--brand)] min-h-[80px]"
          />
        </div>

        <Button
          onClick={() => onSave(edited, selectedTheme, selectedLanguage)}
          className="w-full bg-[var(--brand)] hover:opacity-90 text-white font-semibold py-6"
        >
          {t('save', selectedLanguage)}
        </Button>
      </CardContent>
    </Card>
  );
}
