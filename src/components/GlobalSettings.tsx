import React, { useState } from "react";
import { AppTheme, Language, Intensity } from "../types";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Settings, Palette, Check, Globe, User, Zap, AlertTriangle, Trash2 } from "lucide-react";
import { cn } from "../lib/utils";
import { t } from "../translations";
import { Input } from "./ui/input";

interface GlobalSettingsProps {
  theme: AppTheme;
  language: Language;
  intensity: Intensity;
  displayName: string;
  onSave: (language: Language, displayName: string, intensity: Intensity) => void;
  onResetAccount: () => void;
}

const THEMES: { id: AppTheme; color: string; name: { es: string; en: string } }[] = [];

export default function GlobalSettings({ language, intensity, displayName, onSave, onResetAccount }: Omit<GlobalSettingsProps, 'theme'>) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);
  const [selectedIntensity, setSelectedIntensity] = useState<Intensity>(intensity || 'medium');
  const [newDisplayName, setNewDisplayName] = useState(displayName);

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-2xl bg-zinc-950/50 backdrop-blur-xl text-zinc-100 overflow-hidden rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold font-heading">
          <Settings className="w-6 h-6 text-[var(--brand)]" />
          {selectedLanguage === 'es' ? 'Ajustes Globales' : 'Global Settings'}
        </CardTitle>
        <CardDescription className="text-zinc-400">
          {selectedLanguage === 'es' 
            ? 'Personaliza tu experiencia en GIMS.ai' 
            : 'Customize your experience on GIMS.ai'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-zinc-300">
            <User className="w-4 h-4" />
            {t('username', selectedLanguage)}
          </Label>
          <Input
            value={newDisplayName}
            onChange={(e) => setNewDisplayName(e.target.value)}
            placeholder={t('username', selectedLanguage)}
            className="bg-zinc-900 border-zinc-800 focus:ring-[var(--brand)] h-12 rounded-xl"
          />
        </div>

        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-zinc-300">
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
                  "flex-1 h-12 rounded-xl transition-all",
                  selectedLanguage === lang ? "bg-[var(--brand)] text-white" : "border-zinc-800 text-zinc-400 hover:text-zinc-200"
                )}
              >
                {lang === 'es' ? 'Español' : 'English'}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-zinc-300">
            <Zap className="w-4 h-4" />
            {t('intensity', selectedLanguage)}
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {(['low', 'medium', 'high', 'extreme'] as Intensity[]).map((level) => (
              <Button
                key={level}
                variant={selectedIntensity === level ? "default" : "outline"}
                onClick={() => setSelectedIntensity(level)}
                className={cn(
                  "h-10 rounded-xl text-xs transition-all",
                  selectedIntensity === level 
                    ? "bg-amber-500 text-white border-amber-500" 
                    : "border-zinc-800 text-zinc-400 hover:text-zinc-200"
                )}
              >
                {t(`intensity${level.charAt(0).toUpperCase() + level.slice(1)}` as any, selectedLanguage)}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => onSave(selectedLanguage, newDisplayName, selectedIntensity)}
            className="w-full bg-[var(--brand)] hover:opacity-90 text-white font-bold py-6 rounded-xl shadow-lg shadow-[var(--brand)]/20"
          >
            {selectedLanguage === 'es' ? 'Guardar Cambios' : 'Save Changes'}
          </Button>

          <div className="pt-4 border-t border-zinc-800/50">
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                {selectedLanguage === 'es' ? 'Zona de Peligro' : 'Danger Zone'}
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                {selectedLanguage === 'es' 
                  ? 'Esta acción borrará todas tus conversaciones, inventario y reseteará tus monedas. Solo úsalo para pruebas.' 
                  : 'This action will delete all your conversations, inventory and reset your coins. Only use for testing.'}
              </p>
              <Button
                variant="outline"
                onClick={onResetAccount}
                className="w-full border-red-500/30 hover:bg-red-500/10 text-red-400 hover:text-red-300 gap-2 h-10 rounded-xl text-xs"
              >
                <Trash2 className="w-4 h-4" />
                {selectedLanguage === 'es' ? 'Resetear Cuenta' : 'Reset Account'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
