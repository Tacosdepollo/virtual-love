import React, { useEffect, useState } from "react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { getCachedQuery } from "../lib/cache";
import { Character, Language, UserStats } from "../types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MessageSquare, User, Sparkles, Plus, Search, Filter, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import { t } from "../translations";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";
import { audioManager } from "../lib/audio";
import AdSenseFluid from "./AdSenseFluid";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import PublicProfileDialog from "./PublicProfileDialog";

interface ExploreViewProps {
  language: Language;
  onSelectCharacter: (character: Character) => void;
  onCreateCharacter: () => void;
  isAdmin?: boolean;
  onDeleteCharacter?: (character: Character, reason: string) => void;
  userStats?: UserStats;
}

const MODERATION_REASONS = [
  "Contenido sexual involucrando menores o apariencia de menores",
  "Promoción de odio, discriminación o acoso",
  "Representación de políticos vivos o dictadores",
  "Promoción de actos ilegales, autolesión, incesto o necrofilia",
  "Spam o contenido irrelevante"
];

export default function ExploreView({ language, onSelectCharacter, onCreateCharacter, isAdmin, onDeleteCharacter, userStats }: ExploreViewProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNSFW, setShowNSFW] = useState(false);
  
  // Moderation state
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);
  const [deleteReason, setDeleteReason] = useState(MODERATION_REASONS[0]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      const q = query(
        collection(db, "characters"),
        where("isPublic", "==", true),
        orderBy("chatCount", "desc"),
        limit(100)
      );

      try {
        // Usamos caché con TTL de 30 minutos para ahorrar lecturas masivas
        const chars = await getCachedQuery<Character>(q, "explore_public_chars", 30 * 60 * 1000);
        setCharacters(chars);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "characters");
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  // Group characters by tag
  const groupedCharacters = characters.reduce((acc, char) => {
    const category = (char.tags && char.tags.length > 0) ? char.tags[0] : (language === 'es' ? 'Otros' : 'Other');
    if (!acc[category]) acc[category] = [];
    acc[category].push(char);
    return acc;
  }, {} as Record<string, Character[]>);

  const categories = Object.keys(groupedCharacters).sort();

  const handleDeleteConfirm = () => {
    if (characterToDelete && onDeleteCharacter) {
      onDeleteCharacter(characterToDelete, deleteReason);
      setCharacterToDelete(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold font-heading tracking-tight text-zinc-100">
              {language === 'es' ? 'Explorar Personajes' : 'Explore Characters'}
            </h1>
            <p className="text-zinc-400">
              {language === 'es' ? 'Descubre y chatea con personalidades únicas creadas por la comunidad.' : 'Discover and chat with unique personalities created by the community.'}
            </p>
          </div>
          <Button onClick={onCreateCharacter} className="bg-[var(--brand)] hover:opacity-90 gap-2 h-12 px-6 rounded-full">
            <Plus className="w-5 h-5" />
            {language === 'es' ? 'Crear Personaje' : 'Create Character'}
          </Button>
        </div>

        <AdSenseFluid />

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length % 3 === 0) {
                  audioManager.play('search', 0.1);
                }
              }}
              placeholder={t('search', language)}
              className="pl-10 bg-zinc-900/20 backdrop-blur-sm border-zinc-800/50 focus:ring-[var(--brand)] h-12 rounded-xl"
            />
          </div>
          <Button
            variant={showNSFW ? "default" : "outline"}
            onClick={() => {
              audioManager.play('click');
              setShowNSFW(!showNSFW);
            }}
            className={cn(
              "h-12 px-6 rounded-xl gap-2",
              showNSFW ? "bg-red-500 hover:bg-red-600" : "border-zinc-800 text-zinc-400"
            )}
          >
            <Filter className="w-4 h-4" />
            {showNSFW ? t('nsfw', language) : t('sfw', language)}
          </Button>
        </div>

        {/* Category Buttons */}
        <div className="flex overflow-x-auto pb-2 gap-2 custom-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          <Button
            variant="ghost"
            onClick={() => setSelectedCategory('All')}
            className={cn(
              "rounded-full whitespace-nowrap px-6",
              selectedCategory === 'All' ? "bg-[var(--brand)] text-black hover:bg-[var(--brand)]/90" : "bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            )}
          >
            {language === 'es' ? 'Todos' : 'All'}
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant="ghost"
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "rounded-full whitespace-nowrap px-6 capitalize",
                selectedCategory === category ? "bg-[var(--brand)] text-black hover:bg-[var(--brand)]/90" : "bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              )}
            >
              {category}
            </Button>
          ))}
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {categories.filter(c => selectedCategory === 'All' || c === selectedCategory).map(category => {
              const categoryChars = groupedCharacters[category].filter(char => {
                const matchesSearch = char.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                     char.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                     char.traits.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                     (char.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
                const matchesNSFW = showNSFW ? true : !char.isNSFW;
                return matchesSearch && matchesNSFW;
              });

              if (categoryChars.length === 0) return null;

              return (
                <div key={category} className="space-y-4">
                  {selectedCategory === 'All' && (
                    <h2 className="text-2xl font-bold font-heading text-zinc-100 capitalize">{category}</h2>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryChars.map((char, idx) => (
                      <React.Fragment key={char.id}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="relative group"
                        >
                          {isAdmin && (
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCharacterToDelete(char);
                              }}
                              title="Moderar / Eliminar"
                            >
                              <ShieldAlert className="w-4 h-4" />
                            </Button>
                          )}
                          <Card className="bg-zinc-900/20 backdrop-blur-sm border-zinc-800/50 hover:border-[var(--brand)]/50 transition-all cursor-pointer h-full flex flex-col overflow-hidden rounded-2xl" onClick={() => setSelectedCharacter(char)}>
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <Avatar className="w-16 h-16 border-2 border-[var(--brand)]/20 group-hover:border-[var(--brand)]/50 transition-colors">
                                  <AvatarImage src={char.avatarUrl} referrerPolicy="no-referrer" />
                                  <AvatarFallback className="bg-zinc-800 text-2xl font-bold text-[var(--brand)]">
                                    {char.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-end gap-2">
                                  <div className="flex items-center gap-1 text-xs text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-full">
                                    <MessageSquare className="w-3 h-3" />
                                    {char.chatCount || 0}
                                  </div>
                                  {char.isNSFW && (
                                    <Badge variant="destructive" className="text-[10px] py-0 px-1.5 h-5 bg-red-500/20 text-red-400 border-red-500/30">
                                      NSFW
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <CardTitle className="text-xl font-bold font-heading mt-4 text-zinc-100 group-hover:text-[var(--brand)] transition-colors">
                                {char.name}
                              </CardTitle>
                              <CardDescription className="line-clamp-2 text-zinc-400 text-sm">
                                {char.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {char.traits.slice(0, 3).map(trait => (
                                  <span key={trait} className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-md">
                                    {trait}
                                  </span>
                                ))}
                              </div>
                            </CardContent>
                            <CardFooter className="pt-0 pb-4 flex items-center justify-between border-t border-zinc-800/50 mt-4">
                              <div 
                                className="flex items-center gap-2 text-xs text-[var(--brand)] hover:opacity-80 cursor-pointer transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCreatorId(char.creatorId);
                                }}
                              >
                                <User className="w-3 h-3" />
                                {char.creatorName}
                              </div>
                              <Button variant="ghost" size="sm" className="text-[var(--brand)] hover:bg-[var(--brand)]/10 gap-1">
                                {language === 'es' ? 'Ver' : 'View'}
                                <Sparkles className="w-3 h-3" />
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Mini Profile Dialog */}
        <Dialog open={!!selectedCharacter} onOpenChange={(open) => !open && setSelectedCharacter(null)}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold font-heading flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedCharacter?.avatarUrl} referrerPolicy="no-referrer" />
                  <AvatarFallback>{selectedCharacter?.name[0]}</AvatarFallback>
                </Avatar>
                {selectedCharacter?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-zinc-400 leading-relaxed">
                {selectedCharacter?.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedCharacter?.traits.map(trait => (
                  <Badge key={trait} variant="secondary" className="bg-zinc-800 text-zinc-300">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button 
                className="bg-[var(--brand)] hover:opacity-90 w-full rounded-full"
                onClick={() => {
                  if (selectedCharacter) {
                    onSelectCharacter(selectedCharacter);
                    setSelectedCharacter(null);
                  }
                }}
              >
                {language === 'es' ? 'Comenzar Chat' : 'Start Chat'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Moderation Dialog */}
      <Dialog open={!!characterToDelete} onOpenChange={(open) => !open && setCharacterToDelete(null)}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              Moderar Personaje
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-zinc-400">
              Estás a punto de eliminar el personaje <strong>{characterToDelete?.name}</strong>. Selecciona la razón (basada en los Términos y Condiciones) para notificar al creador:
            </p>
            <select 
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-100 focus:ring-1 focus:ring-red-500 outline-none"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            >
              {MODERATION_REASONS.map(reason => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setCharacterToDelete(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>Eliminar y Notificar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PublicProfileDialog 
        userId={selectedCreatorId} 
        creatorName={characters.find(c => c.creatorId === selectedCreatorId)?.creatorName}
        language={language} 
        onClose={() => setSelectedCreatorId(null)} 
      />
    </div>
  );
}
