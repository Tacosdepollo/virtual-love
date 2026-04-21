import React, { useEffect, useState } from "react";
import Markdown from 'react-markdown';
import { db, handleFirestoreError, OperationType, auth } from "../lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { getCachedQuery } from "../lib/cache";
import { Character, Language, UserStats, World } from "../types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MessageSquare, User, Sparkles, Plus, Search, Filter, ShieldAlert, Globe } from "lucide-react";
import { motion } from "motion/react";
import { t } from "../translations";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";
import { audioManager } from "../lib/audio";
import AdSenseFluid from "./AdSenseFluid";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import PublicProfileDialog from "./PublicProfileDialog";
import EditWorldDialog from "./EditWorldDialog";

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
  const [mode, setMode] = useState<'characters' | 'worlds'>('characters');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNSFW, setShowNSFW] = useState(false);
  
  // Moderation state
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);
  const [deleteReason, setDeleteReason] = useState(MODERATION_REASONS[0]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const [editingWorld, setEditingWorld] = useState<World | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (mode === 'characters') {
          const q = query(
            collection(db, "characters"),
            where("isPublic", "==", true),
            orderBy("chatCount", "desc"),
            limit(100)
          );
          const chars = await getCachedQuery<Character>(q, "explore_public_chars", 30 * 60 * 1000);
          setCharacters(chars);
        } else {
          if (!auth.currentUser) return;
          
          // Fetch public worlds
          const publicQuery = query(
            collection(db, "worlds"),
            where("isPublic", "==", true),
            limit(100)
          );
          
          // Fetch user's private worlds
          const privateQuery = query(
            collection(db, "worlds"),
            where("creatorId", "==", auth.currentUser.uid),
            limit(100)
          );

          const [publicSnapshot, privateSnapshot] = await Promise.all([
            getDocs(publicQuery),
            getDocs(privateQuery)
          ]);

          const publicWorlds = publicSnapshot.docs.map(doc => doc.data() as World);
          const privateWorlds = privateSnapshot.docs.map(doc => doc.data() as World).filter(w => !w.isPublic);
          
          const allWorlds = [...publicWorlds, ...privateWorlds];
          // Deduplicate
          const uniqueWorlds = Array.from(new Map(allWorlds.map(w => [w.id, w])).values());
          
          // Sort client-side
          uniqueWorlds.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
          setWorlds(uniqueWorlds);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, mode);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mode]);

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
        </div>

        <div className="flex gap-4 border-b border-zinc-800 pb-2">
          <button
            onClick={() => setMode('characters')}
            className={cn(
              "text-lg font-bold pb-2 border-b-2 transition-colors",
              mode === 'characters' ? "text-[var(--brand)] border-[var(--brand)]" : "text-zinc-500 border-transparent hover:text-zinc-300"
            )}
          >
            {t('characters', language)}
          </button>
          <button
            onClick={() => setMode('worlds')}
            className={cn(
              "text-lg font-bold pb-2 border-b-2 transition-colors",
              mode === 'worlds' ? "text-[var(--brand)] border-[var(--brand)]" : "text-zinc-500 border-transparent hover:text-zinc-300"
            )}
          >
            {t('worlds', language)}
          </button>
        </div>

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
        {mode === 'characters' && (
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
        )}
        
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-[4/5] bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : mode === 'characters' ? (
          <div className="space-y-12">
            {(() => {
              let charsToRender = selectedCategory === 'All' 
                ? characters 
                : groupedCharacters[selectedCategory] || [];
                
              charsToRender = charsToRender.filter(char => {
                const matchesSearch = char.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                     char.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                     char.traits.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                     (char.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
                const matchesNSFW = showNSFW ? true : !char.isNSFW;
                return matchesSearch && matchesNSFW;
              });

              if (charsToRender.length === 0) {
                 return (
                   <div className="text-center py-12 text-zinc-500">
                     {language === 'es' ? 'No se encontraron personajes.' : 'No characters found.'}
                   </div>
                 );
              }

              return (
                <div className="space-y-4">
                  {selectedCategory !== 'All' && (
                    <h2 className="text-2xl font-bold font-heading text-zinc-100 capitalize">{selectedCategory}</h2>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                    {charsToRender.map((char, idx) => (
                      <React.Fragment key={char.id}>
                        {idx > 0 && idx % 7 === 0 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group col-span-1"
                          >
                            <AdSenseFluid />
                          </motion.div>
                        )}
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
                          <Card className="bg-zinc-900/20 backdrop-blur-sm border-zinc-800/50 hover:border-[var(--brand)]/50 transition-all cursor-pointer h-full flex flex-col overflow-hidden rounded-2xl group" onClick={() => setSelectedCharacter(char)}>
                            <div className="relative w-full aspect-square overflow-hidden rounded-t-2xl bg-zinc-800">
                              {char.avatarUrl ? (
                                <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-[var(--brand)] bg-zinc-800">
                                  {char.name[0]}
                                </div>
                              )}
                              <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                                <div className="flex items-center gap-1 text-xs font-medium text-zinc-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-xl">
                                  <MessageSquare className="w-3 h-3" />
                                  {char.chatCount || 0}
                                </div>
                                {char.isNSFW && (
                                  <Badge variant="destructive" className="text-[10px] py-0 px-1.5 h-5 bg-red-500/80 backdrop-blur-md text-white border-0 shadow-xl">
                                    NSFW
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <CardHeader className="pt-4 pb-0">
                              <CardTitle className="text-xl font-bold font-heading text-zinc-100 group-hover:text-[var(--brand)] transition-colors line-clamp-1">
                                {char.name}
                              </CardTitle>
                              <CardDescription className="line-clamp-2 text-zinc-400 text-sm mt-1">
                                {char.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 pb-2">
                            </CardContent>
                            <CardFooter className="pt-0 pb-4 flex items-center justify-between mt-auto px-4">
                              <div 
                                className="flex items-center gap-2 text-xs text-[var(--brand)] hover:opacity-80 cursor-pointer transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCreatorId(char.creatorId);
                                }}
                              >
                                <User className="w-3.5 h-3.5" />
                                <span className="line-clamp-1 max-w-[120px]">{char.creatorName}</span>
                              </div>
                              <Button variant="ghost" size="sm" className="text-[var(--brand)] hover:bg-[var(--brand)]/10 gap-1 h-8 px-2">
                                {language === 'es' ? 'Ver' : 'View'}
                                <Sparkles className="w-3.5 h-3.5" />
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
            {worlds.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.description.toLowerCase().includes(searchQuery.toLowerCase())).map((world, idx) => (
              <React.Fragment key={world.id}>
                {idx > 0 && idx % 7 === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group col-span-1"
                  >
                    <AdSenseFluid />
                  </motion.div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="bg-zinc-900/20 backdrop-blur-sm border-zinc-800/50 hover:border-[var(--brand)]/50 transition-all cursor-pointer h-full flex flex-col overflow-hidden rounded-2xl" onClick={() => setSelectedWorld(world)}>
                    {world.bannerUrl && (
                      <div className="h-32 w-full overflow-hidden rounded-t-2xl shrink-0">
                        <img src={world.bannerUrl} alt={world.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <CardHeader className="pt-4 pb-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 shrink-0 rounded-xl bg-zinc-800 flex items-center justify-center">
                            <Globe className="w-4 h-4 text-[var(--brand)]" />
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-base font-bold text-zinc-100 line-clamp-1">{world.name}</CardTitle>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 pb-2">
                      <CardDescription className="text-zinc-400 line-clamp-2 text-xs mt-1">
                        {world.description}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="pt-0 pb-3 border-t border-zinc-800/30 flex justify-between items-center bg-zinc-900/10 mt-auto px-4">
                      <div 
                        className="flex items-center gap-1.5 text-xs text-[var(--brand)] hover:opacity-80 cursor-pointer transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCreatorId(world.creatorId);
                        }}
                      >
                        <User className="w-3.5 h-3.5" />
                        <span className="line-clamp-1 max-w-[80px]">{world.creatorName}</span>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Edit World Dialog */}
        {editingWorld && (
          <EditWorldDialog 
            world={editingWorld} 
            language={language} 
            onClose={() => setEditingWorld(null)} 
            onUpdate={(updatedWorld) => {
              setWorlds(worlds.map(w => w.id === updatedWorld.id ? updatedWorld : w));
            }}
          />
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

      {/* World Dialog */}
      <Dialog open={!!selectedWorld} onOpenChange={(open) => !open && setSelectedWorld(null)}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-2xl max-h-[80vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-heading flex items-center gap-3">
              <Globe className="w-6 h-6 text-[var(--brand)]" />
              {selectedWorld?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-[var(--brand)]">{t('worldDesc', language)}</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {selectedWorld?.description}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-[var(--brand)]">{t('worldLore', language)}</h3>
              <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50 text-sm text-zinc-300 leading-relaxed markdown-body">
                <Markdown>{selectedWorld?.expandedLore}</Markdown>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedWorld?.tags?.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-zinc-800 text-zinc-300">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-zinc-800">
            <Button 
              className="bg-[var(--brand)] hover:opacity-90 rounded-full"
              onClick={() => {
                setSelectedWorld(null);
                onCreateCharacter();
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              {language === 'es' ? 'Crear Personaje en este Mundo' : 'Create Character in this World'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
        preloadedCharacters={characters}
        preloadedWorlds={worlds}
      />
    </div>
  );
}
