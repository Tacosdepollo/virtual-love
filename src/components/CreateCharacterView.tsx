import React, { useState, useEffect, useRef } from "react";
import { Personality, AppTheme, Language, World, UserStats } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { X, Plus, Sparkles, Palette, Check, Globe, Trash2, AlertTriangle, Upload, Camera, HelpCircle, ArrowLeft, Coins, Image as ImageIcon, Mic, User } from "lucide-react";
import { cn } from "../lib/utils";
import { t } from "../translations";
import CharacterCreationHelp from "./CharacterCreationHelp";
import { collection, getDocs, query, where, or } from "firebase/firestore";
import { db, auth } from "../lib/firebase";

interface CreateCharacterViewProps {
  personality: Personality;
  theme: AppTheme;
  language: Language;
  onSave: (personality: Personality, theme: AppTheme, language: Language) => void;
  onDelete?: () => void;
  isCreator?: boolean;
  onBack: () => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  userStats?: UserStats;
  onDeductCoins?: (amount: number) => void;
}

const THEMES: { id: AppTheme; color: string; name: { es: string; en: string } }[] = [
  { id: 'rose', color: 'bg-rose-500', name: { es: 'Rosa', en: 'Rose' } },
  { id: 'emerald', color: 'bg-emerald-500', name: { es: 'Esmeralda', en: 'Emerald' } },
  { id: 'amber', color: 'bg-amber-500', name: { es: 'Ámbar', en: 'Amber' } },
  { id: 'sky', color: 'bg-sky-500', name: { es: 'Cielo', en: 'Sky' } },
  { id: 'space', color: 'bg-indigo-900', name: { es: 'Espacio', en: 'Space' } },
  { id: 'retro', color: 'bg-zinc-800', name: { es: 'Retro', en: 'Retro' } },
];

export default function CreateCharacterView({ 
  personality, 
  theme, 
  language, 
  onSave, 
  onDelete, 
  isCreator,
  onBack,
  showToast,
  userStats,
  onDeductCoins
}: CreateCharacterViewProps) {
  const [mode, setMode] = useState<'character' | 'world'>('character');
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

  // World state
  const [worldName, setWorldName] = useState("");
  const [worldDesc, setWorldDesc] = useState("");
  const [worldTags, setWorldTags] = useState<string[]>([]);
  const [bannerUrl, setBannerUrl] = useState("");
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [newWorldTag, setNewWorldTag] = useState("");
  const [isWorldPublic, setIsWorldPublic] = useState(true);
  const [isGeneratingLore, setIsGeneratingLore] = useState(false);
  const [availableWorlds, setAvailableWorlds] = useState<World[]>([]);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check size (max 500KB)
    if (file.size > 500 * 1024) {
      if (showToast) showToast(selectedLanguage === 'es' ? 'La imagen es demasiado grande. Máximo 500KB.' : 'Image is too large. Max 500KB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const fetchWorlds = async () => {
      if (!auth.currentUser) return;
      try {
        // Fetch public worlds
        const publicQuery = query(
          collection(db, "worlds"),
          where("isPublic", "==", true)
        );
        
        // Fetch user's worlds and filter private ones client-side
        const privateQuery = query(
          collection(db, "worlds"),
          where("creatorId", "==", auth.currentUser.uid)
        );

        const [publicSnapshot, privateSnapshot] = await Promise.all([
          getDocs(publicQuery),
          getDocs(privateQuery)
        ]);

        const publicWorlds = publicSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as World));
        const privateWorlds = privateSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as World)).filter(w => !w.isPublic);
        
        // Combine and deduplicate just in case
        const allWorlds = [...publicWorlds, ...privateWorlds];
        const uniqueWorlds = Array.from(new Map(allWorlds.map(w => [w.id, w])).values());
        
        setAvailableWorlds(uniqueWorlds);
      } catch (error) {
        console.error("Error fetching worlds:", error);
      }
    };
    fetchWorlds();
  }, []);

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

  const handlePromptImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      if (showToast) {
        showToast(selectedLanguage === 'es' ? "La imagen es demasiado grande (máx 5MB)" : "Image is too large (max 5MB)", 'error');
      } else {
        alert(selectedLanguage === 'es' ? "La imagen es demasiado grande (máx 5MB)" : "Image is too large (max 5MB)");
      }
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        const newPrompts = [...(edited.prompts || [])];
        newPrompts[index].avatarUrl = dataUrl;
        setEdited({ ...edited, prompts: newPrompts });
        
        setIsUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      if (showToast) {
        showToast(selectedLanguage === 'es' ? "La imagen es demasiado grande (máx 5MB)" : "Image is too large (max 5MB)", 'error');
      } else {
        alert(selectedLanguage === 'es' ? "La imagen es demasiado grande (máx 5MB)" : "Image is too large (max 5MB)");
      }
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setEdited({ ...edited, avatarUrl: dataUrl } as any);
        setIsUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-heading text-zinc-100 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-[var(--brand)]" />
              {selectedLanguage === 'es' ? 'Crear Personaje' : 'Create Character'}
            </h1>
            <p className="text-zinc-300">
              {selectedLanguage === 'es' 
                ? 'Define la personalidad y apariencia de tu nuevo bot.' 
                : 'Define the personality and appearance of your new bot.'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className={cn("rounded-full transition-colors border-zinc-800", showHelp ? "text-[var(--brand)] bg-[var(--brand)]/10" : "text-zinc-500")}
              onClick={() => setShowHelp(!showHelp)}
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
            <Button variant="ghost" className="gap-2 text-zinc-400 hover:text-zinc-100" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
              {selectedLanguage === 'es' ? 'Volver' : 'Back'}
            </Button>
          </div>
        </div>

        {showHelp && (
          <div className="animate-in fade-in slide-in-from-top-4">
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

        <div className="flex gap-4 border-b border-zinc-800 pb-2">
          <button
            onClick={() => setMode('character')}
            className={cn(
              "text-lg font-bold pb-2 border-b-2 transition-colors",
              mode === 'character' ? "text-[var(--brand)] border-[var(--brand)]" : "text-zinc-500 border-transparent hover:text-zinc-300"
            )}
          >
            {t('createCharacterTab', selectedLanguage)}
          </button>
          <button
            onClick={() => setMode('world')}
            className={cn(
              "text-lg font-bold pb-2 border-b-2 transition-colors",
              mode === 'world' ? "text-[var(--brand)] border-[var(--brand)]" : "text-zinc-500 border-transparent hover:text-zinc-300"
            )}
          >
            {t('createWorldTab', selectedLanguage)}
          </button>
        </div>

        {mode === 'character' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-zinc-900/40 border-zinc-800/50 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg text-[var(--brand)]">{selectedLanguage === 'es' ? 'Información Básica' : 'Basic Information'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[var(--brand)] font-bold">{t('personalityName', selectedLanguage)}</Label>
                    <Input
                      id="name"
                      value={edited.name}
                      onChange={(e) => setEdited({ ...edited, name: e.target.value })}
                      placeholder="Ej: Luna, Elena, Sophie..."
                      className="bg-zinc-950 border-zinc-800 focus:ring-[var(--brand)] h-12 rounded-xl text-zinc-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[var(--brand)] font-bold">{t('selectWorld', selectedLanguage)}</Label>
                    <div className="flex gap-2">
                      <select
                        value={(edited as any).worldId || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setEdited({ ...edited, worldId: undefined, worldName: undefined } as any);
                          } else {
                            const selectedWorldObj = availableWorlds.find(w => w.id === val);
                            setEdited({ ...edited, worldId: val, worldName: selectedWorldObj ? selectedWorldObj.name : undefined } as any);
                          }
                        }}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:ring-[var(--brand)] h-12 rounded-xl text-zinc-100 px-3"
                      >
                        <option value="">{t('noWorld', selectedLanguage)}</option>
                        {/* We will populate this with actual worlds in a moment */}
                        <optgroup label={selectedLanguage === 'es' ? 'Tus Mundos' : 'Your Worlds'}>
                           {availableWorlds.filter(w => w.creatorId === auth.currentUser?.uid).map(w => (
                             <option key={w.id} value={w.id}>{w.name}</option>
                           ))}
                        </optgroup>
                        <optgroup label={selectedLanguage === 'es' ? 'Mundos Públicos' : 'Public Worlds'}>
                           {availableWorlds.filter(w => w.creatorId !== auth.currentUser?.uid).map(w => (
                             <option key={w.id} value={w.id}>{w.name}</option>
                           ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="avatarUrl" className="text-[var(--brand)] font-bold">Avatar</Label>
                    <div className="flex gap-2">
                      <div className="relative shrink-0">
                        <label className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center cursor-pointer relative group block">
                          {(edited as any).avatarUrl ? (
                            <>
                              <img 
                                src={(edited as any).avatarUrl} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Upload className="w-4 h-4 text-white" />
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-zinc-400 hover:text-zinc-200">
                              <Camera className="w-5 h-5 text-zinc-500" />
                            </div>
                          )}
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
                        className="bg-zinc-950 border-zinc-800 focus:ring-[var(--brand)] h-12 rounded-xl flex-1 text-zinc-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[var(--brand)] font-bold">{t('personalityDesc', selectedLanguage)}</Label>
                  <Textarea
                    id="description"
                    value={edited.description}
                    onChange={(e) => setEdited({ ...edited, description: e.target.value })}
                    placeholder={selectedLanguage === 'es' ? "Ej: Una chica alegre..." : "Ex: A cheerful girl..."}
                    className="bg-zinc-950 border-zinc-800 focus:ring-[var(--brand)] min-h-[120px] rounded-xl text-zinc-100"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 border-zinc-800/50 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg text-[var(--brand)]">{selectedLanguage === 'es' ? 'Personalidad y Estilo' : 'Personality & Style'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[var(--brand)] font-bold">{t('personalityTraits', selectedLanguage)}</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {edited.traits.map((trait) => (
                      <Badge
                        key={trait}
                        variant="secondary"
                        className="bg-[var(--brand)]/10 text-[var(--brand)] border-[var(--brand)]/20 px-3 py-1.5 flex items-center gap-2 rounded-lg"
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
                      className="bg-zinc-950 border-zinc-800 focus:ring-[var(--brand)] h-11 rounded-xl text-zinc-100"
                    />
                    <Button
                      onClick={handleAddTrait}
                      variant="outline"
                      className="border-zinc-800 hover:bg-zinc-800 h-11 w-11 p-0 rounded-xl"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="style" className="text-[var(--brand)] font-bold">{t('personalityStyle', selectedLanguage)}</Label>
                  <Input
                    id="style"
                    value={edited.style}
                    onChange={(e) => setEdited({ ...edited, style: e.target.value })}
                    placeholder={selectedLanguage === 'es' ? "Ej: Informal, sarcástico..." : "Ex: Informal, sarcastic..."}
                    className="bg-zinc-950 border-zinc-800 focus:ring-[var(--brand)] h-11 rounded-xl text-zinc-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions" className="text-[var(--brand)] font-bold">{t('personalityInstructions', selectedLanguage)}</Label>
                  <Textarea
                    id="instructions"
                    value={edited.customInstructions}
                    onChange={(e) => setEdited({ ...edited, customInstructions: e.target.value })}
                    placeholder={selectedLanguage === 'es' ? "Instrucciones detalladas para la IA..." : "Detailed instructions for the AI..."}
                    className="bg-zinc-950 border-zinc-800 focus:ring-[var(--brand)] min-h-[100px] rounded-xl text-zinc-100"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <Label className="text-[var(--brand)] font-bold text-base">{selectedLanguage === 'es' ? 'Personajes Adicionales para el Chat Grupal' : 'Additional Characters for Group Chat'}</Label>
                    <span className="text-xs text-zinc-400">
                      {selectedLanguage === 'es' 
                        ? 'Agrega personificaciones extra. La IA simulará una conversación grupal dinámica con ellos.' 
                        : 'Add extra personifications. The AI will simulate a dynamic group conversation with them.'}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {edited.prompts?.map((prompt, index) => (
                      <div key={prompt.id} className="flex gap-3 items-start bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/80 shadow-md">
                        <div className="relative shrink-0 mt-1">
                          <label className="w-11 h-11 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center cursor-pointer relative group block">
                            {prompt.avatarUrl ? (
                              <>
                                <img 
                                  src={prompt.avatarUrl} 
                                  alt="Preview" 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Upload className="w-4 h-4 text-white" />
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200">
                                <Upload className="w-4 h-4" />
                              </div>
                            )}
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={(e) => handlePromptImageUpload(e, index)}
                              disabled={isUploading}
                            />
                          </label>
                        </div>
                        <div className="flex-1 flex flex-col sm:flex-row gap-3 min-w-0">
                          <Input
                            value={prompt.name}
                            onChange={(e) => {
                              const newPrompts = [...(edited.prompts || [])];
                              newPrompts[index].name = e.target.value;
                              setEdited({ ...edited, prompts: newPrompts });
                            }}
                            placeholder={selectedLanguage === 'es' ? "Nombre del personaje..." : "Character name..."}
                            className="bg-zinc-950 border-zinc-800 w-full sm:w-[200px] h-10 text-zinc-100 rounded-xl"
                          />
                          <Textarea
                            value={prompt.content}
                            onChange={(e) => {
                              const newPrompts = [...(edited.prompts || [])];
                              newPrompts[index].content = e.target.value;
                              setEdited({ ...edited, prompts: newPrompts });
                            }}
                            placeholder={selectedLanguage === 'es' ? "Describe su personalidad, comportamiento o prompt..." : "Describe their personality, behavior, or prompt..."}
                            className="bg-zinc-950 border-zinc-800 flex-1 min-h-[44px] text-zinc-100 rounded-xl py-2 resize-none"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEdited({ ...edited, prompts: edited.prompts?.filter((_, i) => i !== index) });
                          }}
                          className="text-zinc-500 hover:text-red-500 shrink-0 mt-1"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEdited({
                          ...edited,
                          prompts: [...(edited.prompts || []), { id: Date.now().toString(), name: '', content: '' }]
                        });
                      }}
                      className="w-full border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 rounded-xl py-5 font-medium transition-all"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {selectedLanguage === 'es' ? 'Añadir Personaje Grupal Extra' : 'Add Extra Group Character'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 border-zinc-800/50 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg text-[var(--brand)] flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[var(--brand)]" />
                  {selectedLanguage === 'es' ? 'Mensaje Inicial, Contexto y Fondo' : 'Initial Message, Context & Background'}
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  {selectedLanguage === 'es' 
                    ? 'Configura opciones avanzadas para mejorar la experiencia de conversación y el aspecto visual.' 
                    : 'Configure advanced settings to improve the chat experience and visual appearance.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Initial Message */}
                <div className="space-y-2">
                  <Label htmlFor="initialMessage" className="text-[var(--brand)] font-bold">
                    {selectedLanguage === 'es' ? 'Mensaje Inicial (Saludo)' : 'Initial Message (Greeting)'}
                  </Label>
                  <Textarea
                    id="initialMessage"
                    value={edited.initialMessage || ""}
                    onChange={(e) => setEdited({ ...edited, initialMessage: e.target.value })}
                    placeholder={selectedLanguage === 'es' 
                      ? "Ej: ¡Hola! Soy Elena, tu compañera de hoy. ¿De qué te gustaría hablar?" 
                      : "Ex: Hello! I'm Elena, your companion today. What would you like to talk about?"}
                    className="bg-zinc-950 border-zinc-800 focus:ring-[var(--brand)] min-h-[80px] rounded-xl text-zinc-100"
                  />
                  <p className="text-[10px] text-zinc-500">
                    {selectedLanguage === 'es'
                      ? "Este mensaje se mostrará automáticamente al iniciar un nuevo chat."
                      : "This message will be shown automatically when starting a new chat."}
                  </p>
                </div>

                {/* System Context Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt" className="text-[var(--brand)] font-bold">
                    {selectedLanguage === 'es' ? 'Prompt de Contexto (Sistema)' : 'System Context Prompt'}
                  </Label>
                  <Textarea
                    id="systemPrompt"
                    value={edited.systemPrompt || ""}
                    onChange={(e) => setEdited({ ...edited, systemPrompt: e.target.value })}
                    placeholder={selectedLanguage === 'es'
                      ? "Ej: La conversación se sitúa en una cafetería acogedora en París, en una tarde lluviosa. Mantén un tono misterioso pero amigable."
                      : "Ex: The conversation takes place in a cozy coffee shop in Paris on a rainy afternoon. Keep a mysterious but friendly tone."}
                    className="bg-zinc-950 border-zinc-800 focus:ring-[var(--brand)] min-h-[100px] rounded-xl text-zinc-100"
                  />
                  <p className="text-[10px] text-zinc-500">
                    {selectedLanguage === 'es'
                      ? "Define las circunstancias o la situación inicial de la conversación. Esto guía al modelo IA."
                      : "Define the circumstances or the starting scenario for the conversation. This guides the AI model."}
                  </p>
                </div>

                {/* Custom Background Image Option */}
                <div className="space-y-2">
                  <Label htmlFor="bgImageUrl" className="text-[var(--brand)] font-bold">
                    {selectedLanguage === 'es' ? 'Fondo Personalizado (URL)' : 'Custom Background Image (URL)'}
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative shrink-0">
                      <label className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center cursor-pointer relative group block">
                        {edited.bgImageUrl ? (
                          <>
                            <img 
                              src={edited.bgImageUrl} 
                              alt="Fondo Preview" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Upload className="w-4 h-4 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-zinc-400 hover:text-zinc-200">
                            <ImageIcon className="w-5 h-5 text-zinc-500" />
                          </div>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            if (file.size > 5 * 1024 * 1024) {
                              if (showToast) {
                                showToast(selectedLanguage === 'es' ? "La imagen es demasiado grande (máx 5MB)" : "Image is too large (max 5MB)", 'error');
                              }
                              return;
                            }

                            setIsUploading(true);
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const MAX_WIDTH = 800;
                                const MAX_HEIGHT = 800;
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
                                const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                                setEdited({ ...edited, bgImageUrl: dataUrl });
                                setIsUploading(false);
                              };
                              img.src = event.target?.result as string;
                            };
                            reader.readAsDataURL(file);
                          }}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                    <Input
                      id="bgImageUrl"
                      value={edited.bgImageUrl || ""}
                      onChange={(e) => setEdited({ ...edited, bgImageUrl: e.target.value })}
                      placeholder={selectedLanguage === 'es' ? "Pega una URL de imagen para el fondo de la app..." : "Paste an image URL for the app background..."}
                      className="bg-zinc-950 border-zinc-800 focus:ring-[var(--brand)] h-12 rounded-xl flex-1 text-zinc-100 text-sm"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    {selectedLanguage === 'es'
                      ? "La imagen se aplicará de fondo a la aplicación completa cuando estés chateando con este personaje."
                      : "The image will be set as the full app background while chatting with this character."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 border-zinc-800/50 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg text-[var(--brand)] flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  {t('voiceDesign', selectedLanguage)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-[var(--brand)]/10 border border-[var(--brand)]/20 p-4 rounded-xl text-sm text-[var(--brand)]">
                    {selectedLanguage === 'es' 
                      ? 'Selecciona una de las voces inmersivas y súper rápidas impulsadas por Gemini.'
                      : 'Select one of the immersive and super-fast voices powered by Gemini.'}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[var(--brand)] font-bold">{selectedLanguage === 'es' ? 'Voz' : 'Voice'}</Label>
                    <div className="flex bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-[var(--brand)] focus-within:border-[var(--brand)]">
                      <select
                        value={edited.voiceConfig?.description || "Kore"}
                        onChange={(e) => setEdited({
                          ...edited,
                          voiceConfig: { ...(edited.voiceConfig || {}), description: e.target.value }
                        })}
                        className="w-full bg-transparent h-12 px-3 text-zinc-100 outline-none appearance-none"
                      >
                        <option value="Kore">Kore ({selectedLanguage === 'es' ? 'Femenina, Suave' : 'Female, Soft'})</option>
                        <option value="Puck">Puck ({selectedLanguage === 'es' ? 'Femenina, Enérgica' : 'Female, Energetic'})</option>
                        <option value="Zephyr">Zephyr ({selectedLanguage === 'es' ? 'Femenina, Profunda' : 'Female, Deep'})</option>
                        <option value="Charon">Charon ({selectedLanguage === 'es' ? 'Masculina, Grave' : 'Male, Deep'})</option>
                        <option value="Fenrir">Fenrir ({selectedLanguage === 'es' ? 'Masculina, Rasposa' : 'Male, Raspy'})</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    className="w-full bg-[var(--brand)] hover:opacity-90 text-white rounded-xl py-6 font-bold flex items-center justify-center gap-2"
                    onClick={async () => {
                      const desc = edited.voiceConfig?.description || "Kore";
                      const { playSpeech } = await import("../services/ttsService");
                      const sampleText = selectedLanguage === 'es' 
                        ? `Hola, mi nombre es ${edited.name || 'tu creación'}. ¿Qué te parece mi voz?`
                        : `Hello, my name is ${edited.name || 'your creation'}. How do you like my voice?`;
                      playSpeech(sampleText, desc, selectedLanguage);
                    }}
                  >
                    <Mic className="w-5 h-5" />
                    {t('voicePreview', selectedLanguage)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Settings & Actions */}
          <div className="space-y-6">
            <Card className="bg-zinc-900/40 border-zinc-800/50 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg text-[var(--brand)]">{selectedLanguage === 'es' ? 'Configuración' : 'Settings'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-[var(--brand)] font-bold">
                    <Globe className="w-4 h-4 text-zinc-400" />
                    {t('visibility', selectedLanguage)}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[true, false].map((isPub) => (
                      <Button
                        key={String(isPub)}
                        variant={edited.isPublic === isPub ? "default" : "outline"}
                        onClick={() => setEdited({ ...edited, isPublic: isPub })}
                        className={cn(
                          "rounded-xl h-10 text-xs",
                          edited.isPublic === isPub ? "bg-[var(--brand)] text-black" : "border-zinc-800"
                        )}
                      >
                        {isPub ? t('public', selectedLanguage) : t('private', selectedLanguage)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-[var(--brand)] font-bold">
                    <AlertTriangle className="w-4 h-4 text-zinc-400" />
                    {t('contentRating', selectedLanguage)}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[false, true].map((isNsfw) => (
                      <Button
                        key={String(isNsfw)}
                        variant={edited.isNSFW === isNsfw ? "default" : "outline"}
                        onClick={() => setEdited({ ...edited, isNSFW: isNsfw })}
                        className={cn(
                          "rounded-xl h-10 text-xs",
                          edited.isNSFW === isNsfw ? "bg-[var(--brand)] text-black" : "border-zinc-800"
                        )}
                      >
                        {isNsfw ? t('nsfw', selectedLanguage) : t('sfw', selectedLanguage)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[var(--brand)] font-bold">{t('tags', selectedLanguage)}</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(edited.tags || []).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-purple-500/10 text-purple-400 border-purple-500/20 px-2 py-1 flex items-center gap-1 rounded-md text-[10px]"
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
                      placeholder={selectedLanguage === 'es' ? "Tag..." : "Tag..."}
                      className="bg-zinc-950 border-zinc-800 focus:ring-[var(--brand)] h-10 rounded-xl text-xs text-zinc-100"
                    />
                    <Button
                      onClick={handleAddTag}
                      variant="outline"
                      className="border-zinc-800 hover:bg-zinc-800 h-10 w-10 p-0 rounded-xl"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={() => onSave(edited, selectedTheme, selectedLanguage)}
                className="w-full bg-[var(--brand)] hover:opacity-90 text-white font-bold py-7 rounded-2xl shadow-lg shadow-[var(--brand)]/20 text-lg"
              >
                {t('save', selectedLanguage)}
              </Button>

              {isCreator && onDelete && (
                <div className="space-y-3">
                  {!showDeleteConfirm ? (
                    <Button
                      variant="ghost"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full text-zinc-500 hover:text-red-400 hover:bg-red-400/10 gap-2 h-12 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                      {selectedLanguage === 'es' ? 'Eliminar Personaje' : 'Delete Character'}
                    </Button>
                  ) : (
                    <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl space-y-4 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-red-400">
                            {selectedLanguage === 'es' ? '¿Estás seguro?' : 'Are you sure?'}
                          </p>
                          <p className="text-[10px] text-zinc-400 leading-tight">
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
                          className="flex-1 bg-red-500 hover:bg-red-600 h-10 rounded-xl text-xs"
                        >
                          {selectedLanguage === 'es' ? 'Eliminar' : 'Delete'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 border-zinc-800 hover:bg-zinc-800 h-10 rounded-xl text-xs"
                        >
                          {selectedLanguage === 'es' ? 'Cancelar' : 'Cancel'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="bg-zinc-900/40 border-zinc-800/50 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg text-[var(--brand)]">{t('createWorldTab', selectedLanguage)}</CardTitle>
                <CardDescription className="text-zinc-400">
                  {selectedLanguage === 'es' ? 'Crea un universo detallado para tus personajes.' : 'Create a detailed universe for your characters.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="worldName" className="text-[var(--brand)] font-bold">{t('worldName', selectedLanguage)}</Label>
                  <Input
                    id="worldName"
                    value={worldName}
                    onChange={(e) => setWorldName(e.target.value)}
                    placeholder="Ej: CyberCity 2077, Hogwarts..."
                    className="bg-zinc-950 border-zinc-800 focus:ring-[var(--brand)] h-12 rounded-xl text-zinc-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="worldDesc" className="text-[var(--brand)] font-bold">{t('worldDesc', selectedLanguage)}</Label>
                  <Textarea
                    id="worldDesc"
                    value={worldDesc}
                    onChange={(e) => setWorldDesc(e.target.value)}
                    placeholder={t('worldDescPlaceholder', selectedLanguage)}
                    className="bg-zinc-950 border-zinc-800 focus:ring-[var(--brand)] min-h-[120px] resize-none rounded-xl text-zinc-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[var(--brand)] font-bold">{t('tags', selectedLanguage)}</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {worldTags.map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-[var(--brand)] text-black hover:bg-[var(--brand)]/80 rounded-lg py-1 px-3">
                        {tag}
                        <button onClick={() => setWorldTags(worldTags.filter(t => t !== tag))} className="ml-2 hover:text-black/70">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newWorldTag}
                      onChange={(e) => setNewWorldTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newWorldTag.trim() && !worldTags.includes(newWorldTag.trim())) {
                            setWorldTags([...worldTags, newWorldTag.trim()]);
                            setNewWorldTag("");
                          }
                        }
                      }}
                      placeholder={selectedLanguage === 'es' ? "Añadir etiqueta..." : "Add tag..."}
                      className="bg-zinc-950 border-zinc-800 focus:ring-[var(--brand)] h-10 rounded-xl"
                    />
                    <Button 
                      type="button" 
                      onClick={() => {
                        if (newWorldTag.trim() && !worldTags.includes(newWorldTag.trim())) {
                          setWorldTags([...worldTags, newWorldTag.trim()]);
                          setNewWorldTag("");
                        }
                      }}
                      variant="outline" 
                      className="border-zinc-800 hover:bg-zinc-800 h-10 rounded-xl px-4"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      ref={bannerInputRef}
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      variant="outline"
                      className="w-full bg-zinc-950 border-zinc-800 hover:bg-zinc-900"
                    >
                      {bannerUrl ? (
                        <span className="text-emerald-500">{selectedLanguage === 'es' ? 'Imagen cargada' : 'Image uploaded'}</span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          {selectedLanguage === 'es' ? 'Subir banner' : 'Upload banner'}
                        </span>
                      )}
                    </Button>
                  </div>
                  {bannerUrl && (
                    <div className="mt-2 h-32 w-full overflow-hidden rounded-xl border border-zinc-800">
                      <img src={bannerUrl} alt="Banner preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-zinc-200">{t('visibility', selectedLanguage)}</Label>
                    <p className="text-xs text-zinc-500">
                      {selectedLanguage === 'es' ? '¿Otros pueden usar este mundo?' : 'Can others use this world?'}
                    </p>
                  </div>
                  <div className="flex bg-zinc-900 rounded-lg p-1">
                    <button
                      onClick={() => setIsWorldPublic(true)}
                      className={cn(
                        "px-4 py-1.5 rounded-md text-xs font-medium transition-all",
                        isWorldPublic ? "bg-[var(--brand)] text-black shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      {t('public', selectedLanguage)}
                    </button>
                    <button
                      onClick={() => setIsWorldPublic(false)}
                      className={cn(
                        "px-4 py-1.5 rounded-md text-xs font-medium transition-all",
                        !isWorldPublic ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      {t('private', selectedLanguage)}
                    </button>
                  </div>
                </div>

                <Button 
                  onClick={async () => {
                    if (!worldName.trim() || !worldDesc.trim()) {
                      if (showToast) showToast(selectedLanguage === 'es' ? "Nombre y descripción son requeridos" : "Name and description are required", 'error');
                      return;
                    }

                    // Creation is free now, no coin check or deduction needed
                    setIsGeneratingLore(true);
                    
                    try {
                      const { generateWorldLore } = await import('../services/aiService');
                      const expandedLore = await generateWorldLore(worldDesc, selectedLanguage);
                      
                      const { auth, db } = await import('../lib/firebase');
                      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
                      
                      if (!auth.currentUser) throw new Error("Not authenticated");
                      
                      const worldId = `world_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                      
                      await setDoc(doc(db, "worlds", worldId), {
                        id: worldId,
                        name: worldName,
                        description: worldDesc,
                        expandedLore,
                        creatorId: auth.currentUser.uid,
                        creatorName: auth.currentUser.displayName || "User",
                        isPublic: isWorldPublic,
                        tags: worldTags,
                        usageCount: 0,
                        createdAt: serverTimestamp(),
                        bannerUrl: bannerUrl
                      });
                      
                      if (showToast) showToast(selectedLanguage === 'es' ? "Mundo creado exitosamente" : "World created successfully", 'success');
                      
                      // Reset form
                      setWorldName("");
                      setWorldDesc("");
                      setWorldTags([]);
                      setMode('character');
                      
                    } catch (error) {
                      console.error("Error creating world:", error);
                      if (showToast) showToast(selectedLanguage === 'es' ? "Error al crear el mundo" : "Error creating world", 'error');
                    } finally {
                      setIsGeneratingLore(false);
                    }
                  }}
                  disabled={isGeneratingLore || !worldName.trim() || !worldDesc.trim()}
                  className="w-full bg-[var(--brand)] hover:opacity-90 text-black font-bold h-12 rounded-xl text-base shadow-lg shadow-[var(--brand)]/20"
                >
                  {isGeneratingLore ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                      {t('generatingLore', selectedLanguage)}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      {selectedLanguage === 'es' ? 'Crear Mundo' : 'Create World'}
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
