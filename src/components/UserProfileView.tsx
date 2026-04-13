import React, { useState, useRef } from 'react';
import { UserStats, Language } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Save, User, Image as ImageIcon, Upload } from 'lucide-react';
import { t } from '../translations';
import { motion } from 'motion/react';

interface UserProfileViewProps {
  language: Language;
  userStats: UserStats;
  onSaveProfile: (profile: NonNullable<UserStats['profile']>) => void;
}

export default function UserProfileView({ language, userStats, onSaveProfile }: UserProfileViewProps) {
  const [displayName, setDisplayName] = useState(userStats.profile?.displayName || '');
  const [avatarUrl, setAvatarUrl] = useState(userStats.profile?.avatarUrl || '');
  const [bio, setBio] = useState(userStats.profile?.bio || '');
  const [persona, setPersona] = useState(userStats.profile?.persona || '');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setUploadError(null);
    await onSaveProfile({
      displayName,
      avatarUrl,
      bio,
      persona
    });
    setIsSaving(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 500KB to fit in Firestore safely)
    if (file.size > 500 * 1024) {
      setUploadError(language === 'es' ? 'La imagen es demasiado grande. El tamaño máximo es 500KB.' : 'Image is too large. Maximum size is 500KB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold font-heading tracking-tight text-zinc-100">
            {language === 'es' ? 'Tu Perfil' : 'Your Profile'}
          </h1>
          <p className="text-zinc-400">
            {language === 'es' ? 'Personaliza cómo te ven los demás y cómo te tratan los personajes de IA.' : 'Customize how others see you and how AI characters treat you.'}
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 md:p-8 space-y-8"
        >
          {/* Avatar Section */}
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="w-24 h-24 border-4 border-zinc-800">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-zinc-800 text-3xl">
                {displayName ? displayName[0].toUpperCase() : <User className="w-10 h-10 text-zinc-500" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2 w-full">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                {language === 'es' ? 'Foto de perfil' : 'Profile Picture'}
              </label>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input 
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://ejemplo.com/foto.jpg"
                    className="bg-zinc-950 border-zinc-800 flex-1"
                  />
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-zinc-800 hover:bg-zinc-800 gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline">{language === 'es' ? 'Subir' : 'Upload'}</span>
                  </Button>
                </div>
                {uploadError && (
                  <p className="text-xs text-red-500">{uploadError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Name Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              {language === 'es' ? 'Nombre a mostrar' : 'Display Name'}
            </label>
            <Input 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={language === 'es' ? 'Tu nombre...' : 'Your name...'}
              className="bg-zinc-950 border-zinc-800"
            />
          </div>

          {/* Bio Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              {language === 'es' ? 'Biografía (Pública)' : 'Bio (Public)'}
            </label>
            <Textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={language === 'es' ? 'Cuéntanos un poco sobre ti...' : 'Tell us a bit about yourself...'}
              className="bg-zinc-950 border-zinc-800 min-h-[100px] resize-none"
            />
          </div>

          {/* Persona Section (For AI) */}
          <div className="space-y-2 pt-4 border-t border-zinc-800/50">
            <label className="text-sm font-medium text-[var(--brand)] flex items-center gap-2">
              {language === 'es' ? 'Descripción para el Bot (Persona)' : 'Bot Description (Persona)'}
            </label>
            <p className="text-xs text-zinc-500 mb-2">
              {language === 'es' 
                ? 'Esta descripción se enviará a los personajes de IA para que sepan quién eres y cómo tratarte. ¡Crea tu propio personaje!' 
                : 'This description will be sent to AI characters so they know who you are and how to treat you. Create your own persona!'}
            </p>
            <Textarea 
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              placeholder={language === 'es' ? 'Ej: Soy un valiente caballero de la mesa redonda...' : 'Ex: I am a brave knight of the round table...'}
              className="bg-zinc-950 border-[var(--brand)]/20 focus-visible:ring-[var(--brand)] min-h-[120px] resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-[var(--brand)] hover:opacity-90 text-black gap-2 px-8 rounded-full"
            >
              <Save className="w-4 h-4" />
              {isSaving ? (language === 'es' ? 'Guardando...' : 'Saving...') : (language === 'es' ? 'Guardar Perfil' : 'Save Profile')}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
