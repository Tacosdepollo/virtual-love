import React, { useState, useRef } from 'react';
import { UserStats, Language } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Save, User, Image as ImageIcon, Upload, Plus, Trash2, Pencil } from 'lucide-react';
import { t } from '../translations';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface UserProfileViewProps {
  language: Language;
  userStats: UserStats;
  onSaveProfile: (profile: NonNullable<UserStats['profile']>) => void;
}

export default function UserProfileView({ language, userStats, onSaveProfile }: UserProfileViewProps) {
  const [displayName, setDisplayName] = useState(userStats.profile?.displayName || '');
  const [avatarUrl, setAvatarUrl] = useState(userStats.profile?.avatarUrl || '');
  const [bio, setBio] = useState(userStats.profile?.bio || '');
  const [personas, setPersonas] = useState(userStats.profile?.personas || []);
  const [activePersonaId, setActivePersonaId] = useState(userStats.profile?.activePersonaId || '');
  const [editingPersonaId, setEditingPersonaId] = useState<string | null>(null);
  const [editingPersonaData, setEditingPersonaData] = useState({ name: '', description: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setUploadError(null);
    await onSaveProfile({
      displayName,
      avatarUrl,
      bio,
      personas,
      activePersonaId
    });
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
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
          <div className="space-y-4 pt-4 border-t border-zinc-800/50">
            <label className="text-sm font-medium text-[var(--brand)] flex items-center gap-2">
              {language === 'es' ? 'Tus Personas' : 'Your Personas'}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personas.map((p) => (
                <div key={p.id} className={cn("p-4 rounded-xl border flex flex-col gap-2", activePersonaId === p.id ? "bg-[var(--brand)]/10 border-[var(--brand)]" : "bg-zinc-950 border-zinc-800")}>
                  {editingPersonaId === p.id ? (
                    <div className="flex flex-col gap-2">
                      <Input 
                        value={editingPersonaData.name}
                        onChange={(e) => setEditingPersonaData({ ...editingPersonaData, name: e.target.value })}
                        placeholder={language === 'es' ? 'Nombre' : 'Name'}
                        className="bg-zinc-900 border-zinc-700 h-8 text-sm"
                      />
                      <Textarea 
                        value={editingPersonaData.description}
                        onChange={(e) => setEditingPersonaData({ ...editingPersonaData, description: e.target.value })}
                        placeholder={language === 'es' ? 'Descripción' : 'Description'}
                        className="bg-zinc-900 border-zinc-700 min-h-[80px] text-sm resize-none"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" className="flex-1 bg-[var(--brand)] text-black hover:bg-[var(--brand)]/90" onClick={() => {
                          setPersonas(personas.map(persona => persona.id === p.id ? { ...persona, name: editingPersonaData.name, description: editingPersonaData.description } : persona));
                          setEditingPersonaId(null);
                        }}>
                          {language === 'es' ? 'Guardar' : 'Save'}
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditingPersonaId(null)}>
                          {language === 'es' ? 'Cancelar' : 'Cancel'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-zinc-100">{p.name}</h4>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditingPersonaData({ name: p.name, description: p.description });
                            setEditingPersonaId(p.id);
                          }}>
                            <Pencil className="w-4 h-4 text-zinc-400" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => {
                            setPersonas(personas.filter(persona => persona.id !== p.id));
                            if (activePersonaId === p.id) setActivePersonaId('');
                          }}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{p.description}</p>
                      <Button 
                        variant={activePersonaId === p.id ? "default" : "outline"} 
                        size="sm" 
                        className={cn("mt-2 w-full", activePersonaId === p.id && "bg-[var(--brand)] text-black hover:bg-[var(--brand)]/90")} 
                        onClick={() => setActivePersonaId(p.id)}
                      >
                        {activePersonaId === p.id ? (language === 'es' ? 'Activa' : 'Active') : (language === 'es' ? 'Seleccionar' : 'Select')}
                      </Button>
                    </>
                  )}
                </div>
              ))}
              <Button variant="outline" className="h-full min-h-[100px]" onClick={() => {
                const newPersona = { id: Date.now().toString(), name: language === 'es' ? 'Nueva Persona' : 'New Persona', description: '' };
                setPersonas([...personas, newPersona]);
              }}>
                <Plus className="w-6 h-6 mr-2" />
                {language === 'es' ? 'Añadir Persona' : 'Add Persona'}
              </Button>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-[var(--brand)] hover:opacity-90 text-black gap-2 px-8 rounded-full"
            >
              <Save className="w-4 h-4" />
              {isSaving ? (language === 'es' ? 'Guardando...' : 'Saving...') : isSaved ? (language === 'es' ? '¡Guardado!' : 'Saved!') : (language === 'es' ? 'Guardar Perfil' : 'Save Profile')}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
