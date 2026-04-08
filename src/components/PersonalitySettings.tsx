import React, { useState } from "react";
import { Personality } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Sparkles } from "lucide-react";

interface PersonalitySettingsProps {
  personality: Personality;
  onSave: (personality: Personality) => void;
}

export default function PersonalitySettings({ personality, onSave }: PersonalitySettingsProps) {
  const [edited, setEdited] = useState<Personality>(personality);
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
    <Card className="w-full max-w-2xl mx-auto border-none shadow-2xl bg-zinc-950/50 backdrop-blur-xl text-zinc-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          Configurar Personalidad
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Define cómo quieres que sea tu amiga virtual. Sé específico para mejores resultados.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={edited.name}
            onChange={(e) => setEdited({ ...edited, name: e.target.value })}
            placeholder="Ej: Luna, Elena, Sophie..."
            className="bg-zinc-900 border-zinc-800 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción General</Label>
          <Textarea
            id="description"
            value={edited.description}
            onChange={(e) => setEdited({ ...edited, description: e.target.value })}
            placeholder="Ej: Una chica alegre que ama la música indie y los videojuegos retro."
            className="bg-zinc-900 border-zinc-800 focus:ring-indigo-500 min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Rasgos de Personalidad</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {edited.traits.map((trait) => (
              <Badge
                key={trait}
                variant="secondary"
                className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-3 py-1 flex items-center gap-1"
              >
                {trait}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-indigo-100"
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
              placeholder="Añadir rasgo (ej: Sarcástica, Cariñosa...)"
              className="bg-zinc-900 border-zinc-800 focus:ring-indigo-500"
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
            placeholder="Ej: Informal, usa muchos emojis, habla con jerga juvenil..."
            className="bg-zinc-900 border-zinc-800 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructions">Instrucciones Especiales (Libertad)</Label>
          <Textarea
            id="instructions"
            value={edited.customInstructions}
            onChange={(e) => setEdited({ ...edited, customInstructions: e.target.value })}
            placeholder="Ej: No tengas miedo de ser directa. Sé lo más humana posible."
            className="bg-zinc-900 border-zinc-800 focus:ring-indigo-500 min-h-[80px]"
          />
        </div>

        <Button
          onClick={() => onSave(edited)}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-6"
        >
          Guardar Personalidad
        </Button>
      </CardContent>
    </Card>
  );
}
