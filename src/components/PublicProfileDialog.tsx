import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User, Bot } from 'lucide-react';
import { Language, UserProfile, Character } from '../types';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ScrollArea } from './ui/scroll-area';

interface PublicProfileDialogProps {
  userId: string | null;
  creatorName?: string;
  language: Language;
  onClose: () => void;
}

export default function PublicProfileDialog({ userId, creatorName, language, onClose }: PublicProfileDialogProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        // Fetch Profile from public_profiles
        const profileDoc = await getDoc(doc(db, 'public_profiles', userId));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as UserProfile);
        } else {
          setProfile({
            displayName: creatorName || 'Usuario Anónimo',
            avatarUrl: '',
            bio: language === 'es' ? 'Este usuario aún no ha escrito una biografía.' : 'This user has not written a bio yet.',
          });
        }

        // Fetch Characters
        const q = query(
          collection(db, 'characters'),
          where('creatorId', '==', userId),
          where('isPublic', '==', true)
        );
        const charsSnap = await getDocs(q);
        const chars = charsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Character));
        setCharacters(chars);

      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, language]);

  return (
    <Dialog open={!!userId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-heading">
            {language === 'es' ? 'Perfil de Usuario' : 'User Profile'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6 flex flex-col items-center text-center space-y-4 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="w-24 h-24 rounded-full bg-zinc-800 animate-pulse" />
          ) : error ? (
            <p className="text-zinc-500">
              {language === 'es' ? 'No se pudo cargar el perfil.' : 'Could not load profile.'}
            </p>
          ) : profile ? (
            <>
              <Avatar className="w-24 h-24 border-4 border-zinc-800">
                <AvatarImage src={profile.avatarUrl} referrerPolicy="no-referrer" />
                <AvatarFallback className="bg-zinc-800 text-3xl">
                  {profile.displayName ? profile.displayName[0].toUpperCase() : <User className="w-10 h-10 text-zinc-500" />}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[var(--brand)]">
                  {profile.displayName || 'Usuario Anónimo'}
                </h3>
                <p className="text-sm text-zinc-400 max-w-sm">
                  {profile.bio || (language === 'es' ? 'Sin biografía.' : 'No bio.')}
                </p>
              </div>

              {characters.length > 0 && (
                <div className="w-full mt-6 pt-6 border-t border-zinc-800/50 text-left">
                  <h4 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    {language === 'es' ? 'Bots Creados' : 'Created Bots'}
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {characters.map(char => (
                      <div key={char.id} className="flex flex-col items-center gap-2 text-center group">
                        <Avatar className="w-16 h-16 border-2 border-zinc-800 group-hover:border-[var(--brand)]/50 transition-colors">
                          <AvatarImage src={char.avatarUrl} referrerPolicy="no-referrer" />
                          <AvatarFallback className="bg-zinc-800 text-xl font-bold text-[var(--brand)]">
                            {char.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-zinc-400 group-hover:text-zinc-200 line-clamp-2 leading-tight">
                          {char.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
