import React, { useState } from "react";
import { Personality, AppTheme } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { X, Plus, Sparkles, Palette, Check } from "lucide-react";
import { cn } from "../lib/utils";

interface PersonalitySettingsProps {
  personality: Personality;
  theme: AppTheme;
  onSave: (personality: Personality, theme: AppTheme) => void;
}

const THEMES: { id: AppTheme; color: string; name: string }[] = [
  { id: 'indigo', color: 'bg-indigo-500', name: 'Índigo' },
  { id: 'rose', color: 'bg-rose-500', name: 'Rosa' },
  { id: 'emerald', color: 'bg-emerald-500', name: 'Esmeralda' },
  { id: 'amber', color: 'bg-amber-500', name: 'Ámbar' },
  { id: 'sky', color: 'bg-sky-500', name: 'Cielo' },
  { id: 'violet', color: 'bg-violet-500', name: 'Violeta' },
];

export default function PersonalitySettings({ personality, theme, onSave }: PersonalitySettingsProps) {
  const [edited, setEdited] = useState<Personality>(personality);
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(theme);
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
        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
          <Sparkles className="w-6 h-6 text-[var(--brand)]" />
          Configurar Personalidad
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Define cómo quieres que sea tu amiga virtual. Sé específico para mejores resultados.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 overflow-y-auto flex-1 custom-scrollbar">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={edited.name}
            onChange={(e) => setEdited({ ...edited, name: e.target.value })}
            placeholder="Ej: Luna, Elena, Sophie..."
            className="bg-zinc-900 border-zinc-800 focus:ring-[var(--brand)]"
          />
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Tema Visual
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
                <span className="text-[10px] text-zinc-400">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción General</Label>
          <Textarea
            id="description"
            value={edited.description}
            onChange={(e) => setEdited({ ...edited, description: e.target.value })}
            placeholder="Ej: Una chica alegre que ama la música indie y los videojuegos retro."
            className="bg-zinc-900 border-zinc-800 focus:ring-[var(--brand)] min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Rasgos de Personalidad</Label>
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
              placeholder="Añadir rasgo..."
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
          <Label htmlFor="style">Estilo de Comunicación</Label>
          <Input
            id="style"
            value={edited.style}
            onChange={(e) => setEdited({ ...edited, style: e.target.value })}
            placeholder="Ej: Informal, usa muchos emojis..."
            className="bg-zinc-900 border-zinc-800 focus:ring-[var(--brand)]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructions">Instrucciones Especiales (Libertad)</Label>
          <Textarea
            id="instructions"
            value={edited.customInstructions}
            onChange={(e) => setEdited({ ...edited, customInstructions: e.target.value })}
            placeholder="Ej: No tengas miedo de ser directa..."
            className="bg-zinc-900 border-zinc-800 focus:ring-[var(--brand)] min-h-[80px]"
          />
        </div>

        <Button
          onClick={() => onSave(edited, selectedTheme)}
          className="w-full bg-[var(--brand)] hover:opacity-90 text-white font-semibold py-6"
        >
          Guardar Cambios
        </Button>
      </CardContent>
    </Card>
  );
}
