import React, { useState } from "react";
import { ShopItem, Language, UserStats } from "../types";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Coins, Check, ShoppingBag, Play } from "lucide-react";
import { t } from "../translations";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface ShopViewProps {
  language: Language;
  userStats: UserStats;
  onBuy: (item: ShopItem) => void;
  onAddCoins: (amount: number) => void;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: "theme_storm", name: "Storm", description: "Poderosos rayos y tormenta", price: 600, type: "theme", value: "storm", previewColor: "#4a4ae2" },
  { id: "theme_stone", name: "Ancient Stone", description: "Textura de piedra ancestral", price: 500, type: "theme", value: "stone", previewColor: "#555555" },
  { id: "theme_brick", name: "Urban Brick", description: "Estilo urbano de ladrillo", price: 500, type: "theme", value: "brick", previewColor: "#a52a2a" },
  { id: "theme_clouds", name: "Dreamy Clouds", description: "Cielo nublado y suave", price: 600, type: "theme", value: "clouds", previewColor: "#87ceeb" },
  { id: "theme_whitewood", name: "White Wood", description: "Madera blanca minimalista", price: 400, type: "theme", value: "whitewood", previewColor: "#f5f5f5" },
  { id: "theme_bluewood", name: "Rustic Blue", description: "Madera azul desgastada", price: 400, type: "theme", value: "bluewood", previewColor: "#4682b4" },
  { id: "font_audiowide", name: "Audiowide", description: "Futuristic and rounded", price: 300, type: "font", value: "audiowide" },
  { id: "font_jacquard", name: "Jacquard 24", description: "Elegant decorative style", price: 400, type: "font", value: "jacquard" },
  { id: "font_montecarlo", name: "MonteCarlo", description: "Sophisticated cursive", price: 300, type: "font", value: "montecarlo" },
  { id: "font_saira", name: "Saira Stencil", description: "Industrial stencil look", price: 300, type: "font", value: "saira" },
  { id: "font_silkscreen", name: "Silkscreen", description: "Classic pixel style", price: 400, type: "font", value: "silkscreen" },
];

export default function ShopView({ language, userStats, onBuy, onAddCoins }: ShopViewProps) {
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  const handleWatchAd = () => {
    setIsWatchingAd(true);
    // Simulate ad watching for 3 seconds
    setTimeout(() => {
      onAddCoins(100);
      setIsWatchingAd(false);
    }, 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-zinc-900/20 p-6 rounded-2xl border border-zinc-800/50 backdrop-blur-xl gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-zinc-100 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-[var(--brand)]" />
            {t('shop', language)}
          </h1>
          <p className="text-zinc-400 mt-1">Personaliza tu experiencia con temas y fuentes exclusivas.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleWatchAd} 
            disabled={isWatchingAd}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold gap-2 rounded-xl h-12 px-6 shadow-lg shadow-amber-500/20"
          >
            <Play className={cn("w-4 h-4", isWatchingAd && "animate-pulse")} />
            {isWatchingAd ? t('adWatching', language) : t('watchAd', language)}
          </Button>

          <div className="flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-full border border-zinc-700 shadow-inner h-12">
            <Coins className="w-5 h-5 text-amber-400" />
            <span className="text-xl font-bold text-amber-100">{userStats.coins}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isWatchingAd && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
              <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                <Play className="w-10 h-10 text-amber-500 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">{t('adWatching', language)}</h2>
                <p className="text-zinc-400">Gracias por apoyar GIMS.ai. Recibirás tus monedas en unos segundos.</p>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "linear" }}
                  className="bg-amber-500 h-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {SHOP_ITEMS.map((item) => {
          const isOwned = userStats.purchasedItems.includes(item.id);
          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-zinc-900/20 backdrop-blur-sm border-zinc-800/50 overflow-hidden h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold text-zinc-100">{item.name}</CardTitle>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold px-2 py-0.5 bg-zinc-800 rounded-full">
                      {item.type}
                    </span>
                  </div>
                  <CardDescription className="text-zinc-400 text-sm">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 py-4">
                  {item.type === 'theme' && (
                    <div 
                      className="w-full h-24 rounded-lg border border-zinc-700 flex items-center justify-center"
                      style={{ backgroundColor: item.previewColor }}
                    >
                      <span className="text-xs font-bold mix-blend-difference text-white opacity-50 uppercase tracking-tighter">Preview</span>
                    </div>
                  )}
                  {item.type === 'font' && (
                    <div className="w-full h-24 rounded-lg border border-zinc-700 bg-zinc-800/50 flex items-center justify-center p-4">
                      <span className="text-lg text-zinc-100 text-center" style={{ fontFamily: `var(--font-${item.value})` }}>
                        The quick brown fox jumps over the lazy dog
                      </span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2">
                  <Button 
                    className="w-full gap-2 rounded-xl h-11"
                    variant={isOwned ? "secondary" : "default"}
                    disabled={isOwned || userStats.coins < item.price}
                    onClick={() => onBuy(item)}
                    style={!isOwned ? { backgroundColor: 'var(--brand)' } : {}}
                  >
                    {isOwned ? (
                      <>
                        <Check className="w-4 h-4" />
                        {t('owned', language)}
                      </>
                    ) : (
                      <>
                        <Coins className="w-4 h-4" />
                        {item.price} {t('buy', language)}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
