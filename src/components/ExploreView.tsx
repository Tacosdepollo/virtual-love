import React, { useEffect, useState } from "react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, query, where, orderBy, onSnapshot, limit } from "firebase/firestore";
import { Character, Language } from "../types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MessageSquare, User, Sparkles, Plus } from "lucide-react";
import { motion } from "motion/react";
import { t } from "../translations";

interface ExploreViewProps {
  language: Language;
  onSelectCharacter: (character: Character) => void;
  onCreateCharacter: () => void;
}

export default function ExploreView({ language, onSelectCharacter, onCreateCharacter }: ExploreViewProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "characters"),
      where("isPublic", "==", true),
      orderBy("chatCount", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Character));
      setCharacters(chars);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "characters");
    });

    return () => unsubscribe();
  }, []);

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

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((char, idx) => (
              <motion.div
                key={char.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-zinc-900/40 border-zinc-800 hover:border-[var(--brand)]/50 transition-all cursor-pointer group h-full flex flex-col overflow-hidden rounded-2xl" onClick={() => onSelectCharacter(char)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <Avatar className="w-16 h-16 border-2 border-[var(--brand)]/20 group-hover:border-[var(--brand)]/50 transition-colors">
                        <AvatarImage src={char.avatarUrl} referrerPolicy="no-referrer" />
                        <AvatarFallback className="bg-zinc-800 text-2xl font-bold text-[var(--brand)]">
                          {char.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-1 text-xs text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-full">
                        <MessageSquare className="w-3 h-3" />
                        {char.chatCount || 0}
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
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <User className="w-3 h-3" />
                      {char.creatorName}
                    </div>
                    <Button variant="ghost" size="sm" className="text-[var(--brand)] hover:bg-[var(--brand)]/10 gap-1">
                      {language === 'es' ? 'Chatear' : 'Chat'}
                      <Sparkles className="w-3 h-3" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
