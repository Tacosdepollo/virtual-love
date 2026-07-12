import React, { useState, useEffect } from "react";
import { Language } from "../types";
import { Button } from "./ui/button";
import { t } from "../translations";
import { motion, AnimatePresence } from "motion/react";
import { Play, X, Coins, Loader2, CheckCircle2, Volume2, VolumeX } from "lucide-react";
import { audioManager } from "../lib/audio";
import { adMobService } from "../services/adMobService";

interface RewardedAdProps {
  language: Language;
  onComplete: (reward: number) => void;
  onClose: () => void;
}

export default function RewardedAd({ language, onComplete, onClose }: RewardedAdProps) {
  const [status, setStatus] = useState<'loading' | 'playing' | 'reward'>('loading');
  const [timeLeft, setTimeLeft] = useState(15);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (adMobService.isCapacitor()) {
      adMobService.showNativeRewarded((rewardAmount) => {
        onComplete(rewardAmount || 100);
        onClose();
      });
      return;
    }

    // Simulate loading
    const timer = setTimeout(() => {
      setStatus('playing');
      audioManager.play('search');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (status === 'playing' && timeLeft === 0) {
      setStatus('reward');
      audioManager.play('pop');
    }
  }, [status, timeLeft]);

  useEffect(() => {
    if (status === 'playing') {
      let timeoutId = setTimeout(() => {
        try {
          const ads = document.getElementsByClassName("adsbygoogle");
          let unprocessedAds = 0;
          for (let i = 0; i < ads.length; i++) {
            if (!ads[i].hasAttribute("data-adsbygoogle-status")) {
              unprocessedAds++;
            }
          }
          if (unprocessedAds > 0) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          }
        } catch (e: any) {
          if (!e.message?.includes("already have ads")) {
            console.warn("AdSense error:", e.message);
          }
        }
      }, 250);
      return () => clearTimeout(timeoutId);
    }
  }, [status]);

  const handleClaim = () => {
    audioManager.play('click');
    onComplete(100);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
      {/* Real AdSense Script is now active in index.html */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl aspect-video overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">AD • Sponsored</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-black/60 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            
            {status !== 'playing' && (
              <button 
                onClick={onClose}
                className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-black/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center relative bg-zinc-950">
          <AnimatePresence mode="wait">
            {status === 'loading' && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <Loader2 className="w-12 h-12 text-[var(--brand)] animate-spin" />
                <p className="text-zinc-400 text-sm font-medium animate-pulse">{t('adLoading', language)}</p>
              </motion.div>
            )}

            {status === 'playing' && (
              <motion.div 
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col items-center justify-center p-8 space-y-6"
              >
                {/* Real AdSense Unit */}
                <div className="w-full max-w-md bg-zinc-900/50 rounded-xl overflow-hidden min-h-[250px] flex items-center justify-center border border-white/5">
                  <ins className="adsbygoogle"
                    style={{ display: 'inline-block', width: '300px', height: '250px' }}
                    data-ad-client="ca-pub-5594071281413115"
                    data-ad-slot="5804582944"></ins>
                </div>

                {/* Fallback Mock Content (Visible if real ad fails to load or while testing) */}
                <div className="relative w-full max-w-sm aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/5 group hidden">
                  <img 
                    src="https://picsum.photos/seed/app/800/800" 
                    alt="Ad Content" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-lg">GIMS.ai Premium</h3>
                    <p className="text-white/60 text-xs">Unlock all features today!</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                    <span className="text-2xl font-mono font-bold text-white">00:{timeLeft.toString().padStart(2, '0')}</span>
                  </div>
                  <p className="text-zinc-400 text-xs max-w-[150px]">Wait for the timer to finish to claim your reward.</p>
                </div>
              </motion.div>
            )}

            {status === 'reward' && (
              <motion.div 
                key="reward"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6 text-center p-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-20 animate-pulse" />
                  <div className="relative w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center border-2 border-amber-500/50">
                    <CheckCircle2 className="w-12 h-12 text-amber-500" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-white font-heading">{t('adRewardTitle', language)}</h2>
                  <p className="text-zinc-400">{t('adRewardDesc', language)}</p>
                </div>

                <Button 
                  onClick={handleClaim}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-6 rounded-2xl text-lg gap-3 shadow-xl shadow-amber-500/20"
                >
                  <Coins className="w-6 h-6" />
                  {t('adClaim', language)}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Progress */}
        {status === 'playing' && (
          <div className="h-1.5 w-full bg-zinc-800">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: `${((15 - timeLeft) / 15) * 100}%` }}
              className="h-full bg-[var(--brand)] shadow-[0_0_10px_var(--brand)]"
            />
          </div>
        )}
      </div>
      
      {/* AdSense Info (Hidden for user, but present in code) */}
      {/* 
        To integrate REAL Google AdSense Rewarded Ads:
        1. Add the AdSense script to index.html
        2. Use the window.adsbygoogle API to load a rewarded ad unit
        3. Replace this simulated logic with the AdSense callback
      */}
    </div>
  );
}
