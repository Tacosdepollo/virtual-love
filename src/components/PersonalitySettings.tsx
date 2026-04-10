import React, { useState } from "react";
import { Personality, AppTheme, Language } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { X, Plus, Sparkles, Palette, Check, Globe, Trash2, AlertTriangle, Upload, Camera, HelpCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { t } from "../translations";
import CharacterCreationHelp from "./CharacterCreationHelp";

interface PersonalitySettingsProps {
  personality: Personality;
  theme: AppTheme;
  language: Language;
  onSave: (personality: Personality, theme: AppTheme, language: Language) => void;
  onDelete?: () => void;
  isCreator?: boolean;
}

const THEMES: { id: AppTheme; color: string; name: { es: string; en: string } }[] = [
  { id: 'rose', color: 'bg-rose-500', name: { es: 'Rosa', en: 'Rose' } },
  { id: 'emerald', color: 'bg-emerald-500', name: { es: 'Esmeralda', en: 'Emerald' } },
  { id: 'amber', color: 'bg-amber-500', name: { es: 'Ámbar', en: 'Amber' } },
  { id: 'sky', color: 'bg-sky-500', name: { es: 'Cielo', en: 'Sky' } },
  { id: 'space', color: 'bg-indigo-900', name: { es: 'Espacio', en: 'Space' } },
  { id: 'retro', color: 'bg-zinc-800', name: { es: 'Retro', en: 'Retro' } },
];

export default function PersonalitySettings({ personality, theme, language, onSave, onDelete, isCreator }: PersonalitySettingsProps) {
  const [edited, setEdited] = useState<Personality>({
    isPublic: true,
    isNSFW: false,
    ...personality
  });
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(theme);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);
  const [newTrait, setNewTrait] = useState("");
  const [newTag, setNewTag] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleAddTrait = () => {
    if (newTrait.trim() && !edited.traits.includes(newTrait.trim())) {
      setEdited({ ...edited, traits: [...edited.traits, newTrait.trim()] });
      setNewTrait("");
    }
  };

  const handleRemoveTrait = (trait: string) => {
    setEdited({ ...edited, traits: edited.traits.filter((t) => t !== trait) });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !edited.tags.includes(newTag.trim())) {
      setEdited({ ...edited, tags: [...edited.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setEdited({ ...edited, tags: edited.tags.filter((t) => t !== tag) });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(selectedLanguage === 'es' ? "La imagen es demasiado grande (máx 5MB)" : "Image is too large (max 5MB)");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize logic using canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to low-quality JPEG to save space in Firestore
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setEdited({ ...edited, avatarUrl: dataUrl } as any);
        setIsUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-2xl bg-zinc-950/50 backdrop-blur-xl text-zinc-100 max-h-[90vh] flex flex-col">
      <CardHeader className="shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold font-heading">
            <Sparkles className="w-6 h-6 text-[var(--brand)]" />
            {selectedLanguage === 'es' ? 'Configurar Personalidad' : 'Configure Personality'}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("rounded-full transition-colors", showHelp ? "text-[var(--brand)] bg-[var(--brand)]/10" : "text-zinc-500")}
            onClick={() => setShowHelp(!showHelp)}
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
        <CardDescription className="text-zinc-400">
          {selectedLanguage === 'es' 
            ? 'Define cómo quieres que sea tu amiga virtual. Sé específico para mejores resultados.' 
            : 'Define how you want your virtual friend to be. Be specific for better results.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 overflow-y-auto flex-1 custom-scrollbar relative">
        {showHelp && (
          <div className="absolute inset-x-0 top-0 z-50 p-4 animate-in fade-in slide-in-from-top-4">
            <div className="relative">
              <CharacterCreationHelp language={selectedLanguage} />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 rounded-full h-8 w-8 bg-black/20 hover:bg-black/40 text-white"
                onClick={() => setShowHelp(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
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
            <Label htmlFor="avatarUrl">Avatar</Label>
            <div className="flex gap-2">
              <div className="relative group shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center">
                  {((edited as any).avatarUrl) ? (
                    <img 
                      src={(edited as any).avatarUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Camera className="w-5 h-5 text-zinc-600" />
                  )}
                </div>
                <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Upload className="w-4 h-4 text-white" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
              <Input
                id="avatarUrl"
                value={(edited as any).avatarUrl || ""}
                onChange={(e) => setEdited({ ...edited, avatarUrl: e.target.value } as any)}
                placeholder={selectedLanguage === 'es' ? "O pega una URL..." : "Or paste a URL..."}
                className="bg-zinc-900 border-zinc-800 focus:ring-[var(--brand)] flex-1"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {t('visibility', selectedLanguage)}
            </Label>
            <div className="flex gap-2">
              {[true, false].map((isPub) => (
                <Button
                  key={String(isPub)}
                  variant={edited.isPublic === isPub ? "default" : "outline"}
                  onClick={() => setEdited({ ...edited, isPublic: isPub })}
                  className={cn(
                    "flex-1",
                    edited.isPublic === isPub ? "bg-[var(--brand)]" : "border-zinc-800"
                  )}
                >
                  {isPub ? t('public', selectedLanguage) : t('private', selectedLanguage)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {t('contentRating', selectedLanguage)}
            </Label>
            <div className="flex gap-2">
              {[false, true].map((isNsfw) => (
                <Button
                  key={String(isNsfw)}
                  variant={edited.isNSFW === isNsfw ? "default" : "outline"}
                  onClick={() => setEdited({ ...edited, isNSFW: isNsfw })}
                  className={cn(
                    "flex-1",
                    edited.isNSFW === isNsfw ? "bg-[var(--brand)]" : "border-zinc-800"
                  )}
                >
                  {isNsfw ? t('nsfw', selectedLanguage) : t('sfw', selectedLanguage)}
                </Button>
              ))}
            </div>
          </div>
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
          <Label>{t('tags', selectedLanguage)}</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(edited.tags || []).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-3 py-1 flex items-center gap-1"
              >
                {tag}
                <X
                  className="w-3 h-3 cursor-pointer hover:opacity-80"
                  onClick={() => handleRemoveTag(tag)}
                />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              placeholder={selectedLanguage === 'es' ? "Añadir etiqueta (ej: Anime, RPG)..." : "Add tag (ex: Anime, RPG)..."}
              className="bg-zinc-900 border-zinc-800 focus:ring-[var(--brand)]"
            />
            <Button
              onClick={handleAddTag}
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

        <div className="flex flex-col gap-3 pt-4 border-t border-zinc-800">
          <Button
            onClick={() => onSave(edited, selectedTheme, selectedLanguage)}
            className="w-full bg-[var(--brand)] hover:opacity-90 text-white font-semibold py-6"
          >
            {t('save', selectedLanguage)}
          </Button>

          {isCreator && onDelete && (
            <div className="space-y-3">
              {!showDeleteConfirm ? (
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full text-zinc-500 hover:text-red-400 hover:bg-red-400/10 gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {selectedLanguage === 'es' ? 'Eliminar Personaje' : 'Delete Character'}
                </Button>
              ) : (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-red-400">
                        {selectedLanguage === 'es' ? '¿Estás seguro?' : 'Are you sure?'}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {selectedLanguage === 'es' 
                          ? 'Esta acción es permanente y eliminará el personaje para todos los usuarios.' 
                          : 'This action is permanent and will delete the character for all users.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={onDelete}
                      className="flex-1 bg-red-500 hover:bg-red-600"
                    >
                      {selectedLanguage === 'es' ? 'Sí, eliminar permanentemente' : 'Yes, delete permanently'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 border-zinc-800 hover:bg-zinc-800"
                    >
                      {selectedLanguage === 'es' ? 'Cancelar' : 'Cancel'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
