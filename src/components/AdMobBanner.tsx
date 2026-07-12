import React, { useState, useEffect } from "react";
import { Info, X, ExternalLink } from "lucide-react";
import { adMobService } from "../services/adMobService";

interface AdMobBannerProps {
  placement?: "top" | "bottom" | "inline";
}

export default function AdMobBanner({ placement = "inline" }: AdMobBannerProps) {
  const [visible, setVisible] = useState(true);
  const [config, setConfig] = useState(adMobService.getConfig());
  const [adContent, setAdContent] = useState({
    title: "GIMS.ai VIP Premium",
    desc: "Desbloquea voces ultra-reales de IA sin límites. ¡Únete hoy mismo con 50% de descuento!",
    cta: "Obtener Premium",
    img: "https://picsum.photos/seed/vip/400/100",
    link: "#"
  });

  useEffect(() => {
    adMobService.trackRequest();
    adMobService.trackImpression();

    const handleUpdate = () => {
      setConfig(adMobService.getConfig());
    };
    adMobService.registerCallback(handleUpdate);

    // Randomize mock ads for beautiful visual variety
    const ads = [
      {
        title: "GIMS.ai VIP Premium",
        desc: "Desbloquea voces ultra-reales de IA sin límites. ¡Únete hoy con 50% de descuento!",
        cta: "Obtener Premium",
        img: "https://photos.orun.dev/api/placeholder/400/100", 
        link: "#"
      },
      {
        title: "Creador de Personajes Pro",
        desc: "Crea mundos expandidos con prompts infinitos. ¡Dale vida a tus sueños de rol!",
        cta: "Explorar Mundos",
        img: "https://picsum.photos/seed/create/400/100",
        link: "#"
      },
      {
        title: "Google Pixel Fold 2",
        desc: "La innovación plegable definitiva. Diseñado con Gemini AI.",
        cta: "Saber Más",
        img: "https://picsum.photos/seed/pixel/400/100",
        link: "https://store.google.com"
      },
      {
        title: "Aventuras Interactivas 3D",
        desc: "Visualiza tus historias como mundos ilustrados en tiempo real.",
        cta: "Crear Juego",
        img: "https://picsum.photos/seed/adventure/400/100",
        link: "#"
      }
    ];

    const random = ads[Math.floor(Math.random() * ads.length)];
    setAdContent(random);

    return () => {
      adMobService.unregisterCallback(handleUpdate);
    };
  }, []);

  if (!visible) return null;

  const handleClick = () => {
    adMobService.trackClick();
  };

  return (
    <div 
      className={`w-full bg-zinc-950/90 border border-zinc-800/80 p-2 sm:p-3 relative overflow-hidden transition-all duration-300 shadow-md ${
        placement === "bottom" ? "border-t rounded-t-2xl" : "rounded-2xl"
      }`}
    >
      {/* Test Ad Indicator header */}
      <div className="absolute top-0 right-0 left-0 bg-[#4285F4]/10 border-b border-[#4285F4]/20 py-[2px] px-3 flex justify-between items-center text-[9px] font-bold text-[#4285F4] tracking-wider uppercase">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4] animate-pulse" />
          AdMob Active Banner • {config.testMode ? "TEST MODE" : "LIVE ID"}
        </span>
        <span className="font-mono text-[8px] opacity-85 select-all hidden sm:inline">
          {config.bannerUnitId}
        </span>
      </div>

      <div className="mt-4 flex gap-3 items-center relative">
        {/* Aspect Ratio 4:1 image */}
        <div className="w-20 sm:w-28 aspect-[4/1] rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
          <img 
            src={adContent.img} 
            alt="Ad Banner" 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Content text */}
        <div className="flex-1 min-w-0 pr-8">
          <h4 className="text-zinc-100 font-bold text-xs truncate sm:text-sm flex items-center gap-1.5">
            {adContent.title}
            <span className="bg-[#4285F4]/10 text-[#4285F4] font-semibold text-[8px] px-1 py-[1px] rounded tracking-wide border border-[#4285F4]/20">
              AD
            </span>
          </h4>
          <p className="text-zinc-400 text-[10px] sm:text-xs truncate sm:whitespace-normal line-clamp-1">
            {adContent.desc}
          </p>
        </div>

        {/* CTA Button and choices */}
        <div className="flex flex-col items-end gap-1.5 shrink-0 self-center">
          <a
            href={adContent.link}
            onClick={handleClick}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#4285F4] hover:bg-[#4285F4]/95 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm transition-all duration-200"
          >
            {adContent.cta}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Info & Close tools */}
        <div className="absolute top-[-3px] right-[-2px] flex items-center gap-1 text-zinc-500 hover:text-zinc-300 z-10">
          <button 
            title="Ad Info"
            className="p-[3px] hover:bg-zinc-800/80 rounded-full transition-colors"
          >
            <Info className="w-3 h-3 text-zinc-500" />
          </button>
          <button 
            title="Dismiss Ad"
            onClick={() => setVisible(false)}
            className="p-[3px] hover:bg-zinc-800/80 rounded-full transition-colors text-zinc-500 hover:text-red-400"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
