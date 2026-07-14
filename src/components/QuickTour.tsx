import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Compass, Paintbrush, Coins, ArrowRight, ArrowLeft, Check, X } from "lucide-react";
import { Language } from "../types";
import { Button } from "./ui/button";

interface QuickTourProps {
  language: Language;
  onClose: () => void;
}

export default function QuickTour({ language, onClose }: QuickTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Sparkles className="w-12 h-12 text-[var(--brand)]" />,
      title: {
        es: "¡Bienvenido a GIMS.ai!",
        en: "Welcome to GIMS.ai!"
      },
      description: {
        es: "Tu portal interactivo hacia mundos infinitos y personajes únicos impulsados por Inteligencia Artificial de vanguardia. Diseña, chatea y explora sin límites.",
        en: "Your interactive portal to infinite worlds and unique characters powered by cutting-edge Artificial Intelligence. Design, chat, and explore without limits."
      }
    },
    {
      icon: <Compass className="w-12 h-12 text-[var(--brand)]" />,
      title: {
        es: "Mundos y Personajes",
        en: "Worlds & Characters"
      },
      description: {
        es: "Navega por la pestaña 'Explorar' para descubrir personajes únicos creados por la comunidad, o sumérgete en mundos interactivos con tramas y dinámicas cambiantes.",
        en: "Browse the 'Explore' tab to discover unique characters created by the community, or immerse yourself in interactive worlds with dynamic storylines."
      }
    },
    {
      icon: <Paintbrush className="w-12 h-12 text-[var(--brand)]" />,
      title: {
        es: "Personalización Absoluta",
        en: "Complete Personalization"
      },
      description: {
        es: "Modifica el aspecto completo de la aplicación. Elige entre decenas de temas visuales espectaculares (como Gothic Noir, Cyberpunk, Arctic Frost) y fuentes tipográficas elegantes.",
        en: "Modify the entire look of the application. Choose from dozens of spectacular visual themes (like Gothic Noir, Cyberpunk, Arctic Frost) and elegant typographic fonts."
      }
    },
    {
      icon: <Coins className="w-12 h-12 text-[var(--brand)]" />,
      title: {
        es: "Misiones y Recompensas",
        en: "Missions & Rewards"
      },
      description: {
        es: "Completa misiones diarias, reclama tus recompensas gratuitas y acumula monedas GIMS para desbloquear temas visuales y fuentes exclusivas en la tienda.",
        en: "Complete daily missions, claim your free rewards, and collect GIMS coins to unlock exclusive visual themes and fonts in the store."
      }
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div id="quick-tour-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
      <motion.div
        id="quick-tour-card"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-lg overflow-hidden border border-zinc-800/80 bg-zinc-900/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center text-zinc-100"
      >
        {/* Skip button */}
        <button
          id="quick-tour-skip-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 p-2 rounded-full hover:bg-zinc-800/50 transition-colors"
          title={language === 'es' ? 'Saltar tour' : 'Skip tour'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center space-y-6 my-6"
          >
            <div className="p-4 bg-[var(--brand)]/10 border border-[var(--brand)]/20 rounded-2xl">
              {steps[currentStep].icon}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[var(--brand)] tracking-tight">
              {steps[currentStep].title[language]}
            </h2>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-md">
              {steps[currentStep].description[language]}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Footer/Navigation */}
        <div className="w-full pt-6 border-t border-zinc-800/50 flex items-center justify-between mt-auto">
          {/* Indicator dots */}
          <div className="flex gap-1.5">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep ? "w-6 bg-[var(--brand)]" : "w-2 bg-zinc-800"
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                id="quick-tour-back-btn"
                variant="outline"
                onClick={handlePrev}
                className="h-10 px-4 rounded-xl border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1.5 text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                {language === 'es' ? 'Atrás' : 'Back'}
              </Button>
            )}

            <Button
              id="quick-tour-next-btn"
              onClick={handleNext}
              className="h-10 px-5 rounded-xl bg-[var(--brand)] hover:opacity-90 text-white font-bold gap-1.5 text-xs"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  {language === 'es' ? 'Empezar' : 'Get Started'}
                  <Check className="w-4 h-4" />
                </>
              ) : (
                <>
                  {language === 'es' ? 'Siguiente' : 'Next'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
