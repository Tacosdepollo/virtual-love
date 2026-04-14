import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { World, Language } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Image as ImageIcon } from 'lucide-react';

interface EditWorldDialogProps {
  world: World;
  language: Language;
  onClose: () => void;
  onUpdate: (updatedWorld: World) => void;
}

export default function EditWorldDialog({ world, language, onClose, onUpdate }: EditWorldDialogProps) {
  const [name, setName] = useState(world.name);
  const [description, setDescription] = useState(world.description);
  const [bannerUrl, setBannerUrl] = useState(world.bannerUrl || '');
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const worldRef = doc(db, 'worlds', world.id);
      await updateDoc(worldRef, {
        name,
        description,
        bannerUrl
      });
      onUpdate({ ...world, name, description, bannerUrl });
      onClose();
    } catch (error) {
      console.error("Error updating world:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>{language === 'es' ? 'Editar Mundo' : 'Edit World'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="bg-zinc-900 border-zinc-800" />
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="bg-zinc-900 border-zinc-800" />
          <Input type="file" accept="image/*" ref={bannerInputRef} onChange={handleBannerUpload} className="hidden" />
          <Button onClick={() => bannerInputRef.current?.click()} variant="outline" className="w-full text-black">
            <ImageIcon className="w-4 h-4 mr-2" />
            {language === 'es' ? 'Cambiar banner' : 'Change banner'}
          </Button>
          {bannerUrl && <img src={bannerUrl} alt="Banner" className="h-32 w-full object-cover rounded-lg" />}
          <Button onClick={handleSave} disabled={isSaving} className="w-full bg-[var(--brand)] text-black">
            {isSaving ? (language === 'es' ? 'Guardando...' : 'Saving...') : (language === 'es' ? 'Guardar' : 'Save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
