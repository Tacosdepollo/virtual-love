import React, { useState, useEffect } from "react";
import { Info, X, ExternalLink, Volume2, VolumeX, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { adMobService } from "../services/adMobService";

interface AdMobInterstitialProps {
  onClose: () => void;
  language?: "es" | "en";
}

export default function AdMobInterstitial({ onClose, language = "es" }: AdMobInterstitialProps) {
  const [timeLeft, setTimeLeft] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [config] = useState(adMobService.getConfig());
  
  useEffect(() => {
    adMobService.trackRequest();
    adMobService.trackImpression();

    if (adMobService.isCapacitor()) {
      adMobService.showNativeInterstitial();
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanSkip(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    adMobService.trackClick();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-8">
      {/* Container simulating a mobile phone display or clean centered popup modal */}
      <div className="relative bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col aspect-[9/16] max-h-[85vh] sm:max-h-[750px]">
        
        {/* Top Header info */}
        <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EA4335] animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-300">
              AdMob Interstitial • {config.testMode ? "TEST AD" : "PRODUCTION"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-black/40 backdrop-blur-sm rounded-full border border-white/10 text-white hover:bg-black/60 transition-colors"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {canSkip ? (
              <button 
                onClick={onClose}
                className="p-2 bg-amber-500 rounded-full border border-amber-600 text-black hover:bg-amber-600 transition-colors flex items-center justify-center font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/15 text-zinc-300 font-mono text-xs font-bold">
                {language === "es" ? `Saltar en ${timeLeft}s` : `Skip in ${timeLeft}s`}
              </div>
            )}
          </div>
        </div>

        {/* Ad Hero Image */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-zinc-900 border-b border-zinc-800/60">
          <img 
            src="https://picsum.photos/seed/mobilead/880/1440" 
            alt="Main ad display" 
            className="w-full h-full object-cover select-none pointer-events-none filter brightness-[0.75]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-black/30" />

          {/* Centered Ad Label */}
          <div className="absolute inset-x-4 bottom-24 bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center space-y-2">
            <h3 className="text-white font-extrabold text-lg sm:text-xl font-heading tracking-tight">
              GIMS.ai Realtime Premium
            </h3>
            <p className="text-zinc-300 text-xs line-clamp-2">
              {language === "es" 
                ? "Chatea con personajes de anime, mundos medievales, mentores y mucho más. El juego de rol definitivo."
                : "Chat with anime girls, medieval lore wizards, coaches, and more. Ultimate AI roleplay game."}
            </p>
          </div>
        </div>

        {/* Lower Banner Controls */}
        <div className="p-4 bg-zinc-950 flex flex-col gap-3 relative shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
              <img 
                src="https://picsum.photos/seed/gimslogo/120/120" 
                alt="Logo preview" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-bold text-sm tracking-tight truncate">GIMS.ai Play Store App</h4>
              <p className="text-zinc-500 text-xs truncate">Google AdMob Partner App</p>
            </div>
            
            <a 
              href="#"
              onClick={handleClick}
              className="bg-[#4285F4] hover:bg-[#4285F4]/90 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-[#4285F4]/20 transition-all flex items-center gap-1"
            >
              INSTALL
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="text-[9px] text-zinc-500 text-center flex items-center justify-center gap-1 opacity-80 mt-1">
            <ShieldAlert className="w-3 h-3" />
            <span>Interactive AdMob Ad. Click INSTALL to visit Google Play Store.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
