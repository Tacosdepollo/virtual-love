import React from "react";
import { Language, UserStats, AppTheme, AppFont } from "../types";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Palette, Type, Check, Sparkles, Trash2 } from "lucide-react";
import { t } from "../translations";
import { cn } from "../lib/utils";

interface PersonalizationViewProps {
  language: Language;
  userStats: UserStats;
  currentTheme: AppTheme;
  currentFont: AppFont;
  onApplyTheme: (theme: AppTheme) => void;
  onDeleteTheme: (theme: AppTheme) => void;
  onApplyFont: (font: AppFont) => void;
  onUpdateOpacity: (opacity: number) => void;
}

const DEFAULT_THEMES: AppTheme[] = ['rose', 'emerald', 'amber', 'sky', 'space', 'retro', 'cyberpunk'];
const DEFAULT_FONTS: AppFont[] = ['sans'];

export default function PersonalizationView({ 
  language, 
  userStats, 
  currentTheme, 
  currentFont,
  onApplyTheme,
  onDeleteTheme,
  onApplyFont,
  onUpdateOpacity
}: PersonalizationViewProps) {
  
  const allThemes = Array.from(new Set([...DEFAULT_THEMES, ...userStats.unlockedThemes]));
  const allFonts = Array.from(new Set([
    ...DEFAULT_FONTS, 
    'audiowide', 'jacquard', 'montecarlo', 'saira', 'silkscreen',
    'playfair', 'montserrat', 'oswald', 'lobster', 'pacifico', 
    'righteous', 'bangers', 'orbitron', 'press-start', 'dancing-script'
  ])).filter(f => 
    f === 'sans' || userStats.purchasedItems.some(id => id === `font_${f}`)
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
      <div className="bg-zinc-900/20 p-6 rounded-2xl border border-zinc-800/50 backdrop-blur-xl">
        <h1 className="text-3xl font-bold font-heading text-zinc-100 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-[var(--brand)]" />
          {t('personalization', language)}
        </h1>
        <p className="text-zinc-400 mt-1">Gestiona tus temas y fuentes adquiridos.</p>
        
        <div className="mt-6 space-y-2 max-w-xs">
          <div className="flex justify-between text-sm font-medium text-zinc-300">
            <span>Opacidad de Textura</span>
            <span>{Math.round((userStats.themeOpacity ?? 0.6) * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            value={userStats.themeOpacity ?? 0.6}
            onChange={(e) => onUpdateOpacity(parseFloat(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--brand)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Themes Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-100 font-bold text-xl">
            <Palette className="w-5 h-5 text-[var(--brand)]" />
            {t('theme', language)}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allThemes.map((themeName) => (
              <div
                key={themeName}
                onClick={() => onApplyTheme(themeName)}
                className={cn(
                  "group relative aspect-square rounded-xl border-2 transition-all overflow-hidden cursor-pointer",
                  currentTheme === themeName 
                    ? "border-[var(--brand)] ring-2 ring-[var(--brand)]/20" 
                    : "border-zinc-800 hover:border-zinc-700"
                )}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onApplyTheme(themeName);
                  }
                }}
              >
                <div 
                  className="absolute inset-0" 
                  data-theme={themeName}
                  style={{ 
                    backgroundImage: 'var(--bg-image)', 
                    backgroundRepeat: 'repeat',
                    backgroundSize: 'var(--bg-size, auto)',
                    backgroundColor: 'var(--brand)',
                    opacity: 0.8
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                  {currentTheme === themeName && (
                    <div className="bg-[var(--brand)] text-white p-1 rounded-full shadow-lg">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase tracking-tighter text-white drop-shadow-md">
                  {themeName}
                </span>
                {!DEFAULT_THEMES.includes(themeName) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTheme(themeName);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Fonts Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-100 font-bold text-xl">
            <Type className="w-5 h-5 text-[var(--brand)]" />
            {t('font', language)}
          </div>
          <div className="space-y-3">
            {allFonts.map((fontName) => (
              <button
                key={fontName}
                onClick={() => onApplyFont(fontName as AppFont)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between",
                  currentFont === fontName 
                    ? "border-[var(--brand)] bg-[var(--brand)]/5" 
                    : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                )}
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{fontName}</span>
                  <p className="text-lg text-zinc-100" style={{ fontFamily: `var(--font-${fontName})` }}>
                    The quick brown fox jumps over the lazy dog
                  </p>
                </div>
                {currentFont === fontName && (
                  <div className="bg-[var(--brand)] text-white p-1 rounded-full">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
