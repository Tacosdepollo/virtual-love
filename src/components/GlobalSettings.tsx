import React, { useState } from "react";
import { AppTheme, Language, Intensity } from "../types";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Settings, Palette, Check, Globe, User, Zap, AlertTriangle, Trash2, Mic } from "lucide-react";
import { cn } from "../lib/utils";
import { t } from "../translations";
import { Input } from "./ui/input";

interface GlobalSettingsProps {
  theme: AppTheme;
  language: Language;
  intensity: Intensity;
  displayName: string;
  autoPlayVoice?: boolean;
  onSave: (language: Language, displayName: string, intensity: Intensity, autoPlayVoice: boolean) => void;
  onResetAccount: () => void;
}

const THEMES: { id: AppTheme; color: string; name: { es: string; en: string } }[] = [];

export default function GlobalSettings({ language, intensity, displayName, autoPlayVoice, onSave, onResetAccount }: Omit<GlobalSettingsProps, 'theme'>) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);
  const [selectedIntensity, setSelectedIntensity] = useState<Intensity>(intensity || 'medium');
  const [newDisplayName, setNewDisplayName] = useState(displayName);
  const [autoPlay, setAutoPlay] = useState(autoPlayVoice || false);

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
      <CardContent className="space-y-4 p-4 sm:p-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-zinc-300 text-xs sm:text-sm">
            <User className="w-4 h-4" />
            {t('username', selectedLanguage)}
          </Label>
          <Input
            value={newDisplayName}
            onChange={(e) => setNewDisplayName(e.target.value)}
            placeholder={t('username', selectedLanguage)}
            className="bg-zinc-900 border-zinc-800 focus:ring-[var(--brand)] h-10 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-zinc-300 text-xs sm:text-sm">
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
                  "flex-1 h-10 rounded-xl text-xs sm:text-sm transition-all",
                  selectedLanguage === lang ? "bg-[var(--brand)] text-white" : "border-zinc-800 text-zinc-400 hover:text-zinc-200"
                )}
              >
                {lang === 'es' ? 'Español' : 'English'}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-zinc-300 text-xs sm:text-sm">
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
                  "h-9 rounded-xl text-xs transition-all",
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

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-zinc-300 text-xs sm:text-sm">
            <Mic className="w-4 h-4" />
            {t('voiceSettings', selectedLanguage)}
          </Label>
          <Button
            variant="outline"
            onClick={() => setAutoPlay(!autoPlay)}
            className={cn(
              "w-full h-10 rounded-xl justify-between px-3 text-xs transition-all",
              autoPlay ? "border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]" : "border-zinc-800 text-zinc-400"
            )}
          >
            <span>{t('autoPlayVoice', selectedLanguage)}</span>
            <div className={cn(
              "w-8 h-5 rounded-full p-0.5 transition-colors relative",
              autoPlay ? "bg-[var(--brand)]" : "bg-zinc-800"
            )}>
              <div className={cn(
                "w-4 h-4 rounded-full bg-white transition-transform",
                autoPlay ? "translate-x-3" : "translate-x-0"
              )} />
            </div>
          </Button>
        </div>

        <div className="space-y-3 pt-2">
          <Button
            onClick={() => onSave(selectedLanguage, newDisplayName, selectedIntensity, autoPlay)}
            className="w-full bg-[var(--brand)] hover:opacity-90 text-white font-bold py-4 h-11 rounded-xl shadow-lg shadow-[var(--brand)]/20 text-xs sm:text-sm"
          >
            {selectedLanguage === 'es' ? 'Guardar Cambios' : 'Save Changes'}
          </Button>

          <div className="pt-2 border-t border-zinc-800/50">
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                <AlertTriangle className="w-3.5 h-3.5" />
                {selectedLanguage === 'es' ? 'Zona de Peligro' : 'Danger Zone'}
              </div>
              <p className="text-[9px] text-zinc-500 leading-relaxed">
                {selectedLanguage === 'es' 
                  ? 'Esta acción borrará todas tus conversaciones, inventario y reseteará tus monedas.' 
                  : 'This action will delete all your conversations, inventory and reset your coins.'}
              </p>
              <Button
                variant="outline"
                onClick={onResetAccount}
                className="w-full border-red-500/30 hover:bg-red-500/10 text-red-400 hover:text-red-300 gap-2 h-8 rounded-xl text-[10px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {selectedLanguage === 'es' ? 'Resetear Cuenta' : 'Reset Account'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
