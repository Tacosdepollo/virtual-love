import React, { useState } from "react";
import { Language } from "../types";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { 
  BookOpen, 
  Sparkles, 
  Users, 
  Compass, 
  Coins, 
  ArrowLeft, 
  Video, 
  MessagesSquare, 
  Palette, 
  ArrowRight,
  Download,
  Info,
  Smartphone
} from "lucide-react";
import { audioManager } from "../lib/audio";

interface HelpGuideProps {
  language: Language;
  onBack: () => void;
}

export default function HelpGuide({ language, onBack }: HelpGuideProps) {
  const [activeTab, setActiveTab] = useState<'basics' | 'groupChats' | 'creation' | 'coins' | 'playstore'>('basics');
  const [isZoomed, setIsZoomed] = useState(false);

  // Hardcoded matching the generated image path
  const infographicUrl = "/src/assets/images/how_to_use_gims_es_1782082604730.jpg";

  const steps = {
    es: {
      basics: {
        title: "Pasos Básicos",
        desc: "Empieza tu aventura en GIMS.ai de la manera más rápida.",
        items: [
          {
            icon: Compass,
            title: "1. Explora el catálogo",
            content: "Navega a través de las creaciones públicas de la comunidad de GIMS. Descubre robots listos para chatear, o mundos (fanfics) enteros en los que puedes introducir a tus propios personajes."
          },
          {
            icon: MessagesSquare,
            title: "2. Chatea cómodamente",
            content: "Selecciona una creación y empieza a hablar de inmediato. La IA responde de manera continua y se adapta a tus intenciones. Sube de nivel con roleplay dinámico."
          },
          {
            icon: Palette,
            title: "3. Personaliza tu ambiente",
            content: "Visita la sección de Personalización para cambiar el tema de colores de fondo, tipografías y el nivel de opacidad para adaptar el diseño a tu pantalla de celular o monitor."
          }
        ]
      },
      groupChats: {
        title: "Chats Grupales",
        desc: "Haz que múltiples personajes de IA hablen entre sí de forma dinámica.",
        items: [
          {
            icon: Users,
            title: "Creación de Grupos",
            content: "Al crear o editar a tu personaje, ve a la sección inferior 'Personajes Adicionales para el Chat Grupal'. Puedes añadir varios personajes de apoyo con sus propias identidades."
          },
          {
            icon: Sparkles,
            title: "Regla Estricta de Turnos",
            content: "Para indicarle a la IA quién te está respondiendo, los bots usarán el formato exclusivo **[Nombre]:** antes de cada mensaje. ¡Esto evita confusiones y mantiene la inmersión perfecta!"
          },
          {
            icon: MessagesSquare,
            title: "Chat Cooperativo",
            content: "Puedes pedirle a cualquier personaje específico dentro del grupo que intervenga escribiendo su nombre, o dejar que la conversación fluya de manera abierta."
          }
        ]
      },
      creation: {
        title: "Creación de Bots y Mundos",
        desc: "Lleva el fanfiction al siguiente nivel dando vida a tus propios mundos ficticios.",
        items: [
          {
            icon: Sparkles,
            title: "Crear Personaje",
            content: "Define un nombre, rasgos característicos (ej: Alegre, Sarcástico) y tus intenciones secretas para definir cómo debe reaccionar ante diversas situaciones."
          },
          {
            icon: Compass,
            title: "Crear Mundos (GIMS Worlds)",
            content: "Escribe el Lore de tu mundo y la IA generará detalles expandidos. Puedes vincular a tus bots a este mundo para que recuerden geografía, política y magia nativa."
          }
        ]
      },
      coins: {
        title: "Sistema de Monedas y Shop",
        desc: "Cómo ganar monedas gratis y qué beneficios puedes desbloquear.",
        items: [
          {
            icon: Coins,
            title: "Reclamar Monedas Diarias",
            content: "Cada día que entres a GIMS.ai, reclama tus 50 monedas diarias gratuitas desde el panel de usuario."
          },
          {
            icon: Video,
            title: "Ver Anuncios Premiados",
            content: "Dale al botón de '+' junto a tus monedas para ver un anuncio patrocinado y ganar 100 monedas extra de inmediato."
          },
          {
            icon: Palette,
            title: "Desbloquear en la Tienda",
            content: "Gasta tus monedas en la Tienda para desbloquear hermosas tipografías premium o fondos de pantalla animados ultra detallados."
          }
        ]
      },
      playstore: {
        title: "Publicar en Play Store",
        desc: "Guía técnica oficial para compilar tu app GIMS.ai y publicarla con AdMob nativo.",
        items: [
          {
            icon: Download,
            title: "1. Empaquetar con Capacitor",
            content: "Capacitor envuelve la app React de GIMS en un contenedor nativo. Corre los comandos: `npm install @capacitor/core @capacitor/cli` y luego inicializa la app usando `npx cap init GIMS.ai com.gimsai.app --web-dir=dist`."
          },
          {
            icon: Smartphone,
            title: "2. Agregar Plataforma Android",
            content: "Soporta Android nativo instalando la plataforma ejecutando `npm install @capacitor/android` seguido de `npx cap add android`. Esto creará un directorio `/android` listo para abrir en Android Studio."
          },
          {
            icon: Coins,
            title: "3. Instalar Plugin AdMob Nativo",
            content: "Instala el plugin oficial ejecutando `npm install @capacitor-community/admob`. Nuestro puente `adMobService.ts` detectará automáticamente el entorno Capacitor y activará los anuncios nativos de AdMob por ti."
          }
        ]
      }
    },
    en: {
      basics: {
        title: "Basic Steps",
        desc: "Start your adventure on GIMS.ai in the fastest way possible.",
        items: [
          {
            icon: Compass,
            title: "1. Explore creations",
            content: "Browse through public character creations made by the GIMS community. Discover ready-made bots or rich fanfic worlds waiting for your customized characters."
          },
          {
            icon: MessagesSquare,
            title: "2. Relax & Chat",
            content: "Select or preview any creation and start chatting. The AI updates dynamically and responds in continuous prose to keep up with your imagination."
          },
          {
            icon: Palette,
            title: "3. Personalize your environment",
            content: "Go to Personalization to set custom colour themes, font stylings, and backdrops adjusted perfectly to your desktop or compact mobile display."
          }
        ]
      },
      groupChats: {
        title: "Group Chats",
        desc: "Have multiple AI characters talk to each other inside a single cohesive room.",
        items: [
          {
            icon: Users,
            title: "Group setup",
            content: "When editing or creating your main character, scroll to the 'Additional Characters for Group Chat' section down below. Add supporting characters with custom behaviors."
          },
          {
            icon: Sparkles,
            title: "Strict Character Selection Rule",
            content: "To define who is actively speaking, GIMS uses the absolute formatting standard '**[Name]:**' before any paragraph. This prevents any list rendering bugs."
          },
          {
            icon: MessagesSquare,
            title: "Dynamic Roleplay",
            content: "Prompt multiple bots inside the group at once. You can ask a specific character to intervene or let the scene unfold on its own."
          }
        ]
      },
      creation: {
        title: "Bots & Fanfic Worlds",
        desc: "Bring your favorite fiction settings to life with complete lore consistency.",
        items: [
          {
            icon: Sparkles,
            title: "Create Characters",
            content: "Configure names, adjectives/traits (e.g. Sarcastic, Empathetic), styling conventions, and private instructions."
          },
          {
            icon: Compass,
            title: "Create Worlds",
            content: "Write down the lore backbone and have GIMS AI generate expanded context. Link your characters to this world so they remain knowledgeable about world rules."
          }
        ]
      },
      coins: {
        title: "Coins & Store Upgrades",
        desc: "Learn how to obtain free coins and what upgrades are available.",
        items: [
          {
            icon: Coins,
            title: "Daily Claims",
            content: "Earn 50 free coins every 24 hours simply by logging into GIMS.ai."
          },
          {
            icon: Video,
            title: "Rewarded Ads",
            content: "Tap on the '+' coin pill to play a sponsored ad and gain 100 extra coins immediately."
          },
          {
            icon: Palette,
            title: "Shop Upgrades",
            content: "Redeem coins in our Shop to unlock beautiful luxury typography types and dynamic live themes."
          }
        ]
      },
      playstore: {
        title: "Play Store Publication",
        desc: "Official technical guide to compile your GIMS.ai build and publish with native AdMob.",
        items: [
          {
            icon: Download,
            title: "1. Wrap with Capacitor",
            content: "Capacitor wraps your GIMS React app in a native container. Run the command line: `npm install @capacitor/core @capacitor/cli` then initialize the project via `npx cap init GIMS.ai com.gimsai.app --web-dir=dist`."
          },
          {
            icon: Smartphone,
            title: "2. Add Android Platform",
            content: "Support native Android builds by installing the native wrapper: `npm install @capacitor/android` and `npx cap add android`. This generates an `/android` folder ready for Android Studio."
          },
          {
            icon: Coins,
            title: "3. Bind Native AdMob Plugin",
            content: "Install the plugin via `npm install @capacitor-community/admob`. Our `adMobService.ts` automatically hooks up native banners, interstitials, and rewarded ads."
          }
        ]
      }
    }
  };

  const currentSteps = steps[language];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-6 space-y-6">
      {/* Back button and title */}
      <div className="bg-zinc-900/20 p-4 sm:p-6 rounded-2xl border border-zinc-800/50 backdrop-blur-xl">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="text-zinc-400 hover:text-zinc-200 gap-1.5 p-0 mb-3"
        >
          <ArrowLeft className="w-4 h-4 text-[var(--brand)]" />
          {language === 'es' ? 'Volver a GIMS' : 'Back to GIMS'}
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-zinc-100 flex items-center gap-3">
          <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--brand)]" />
          {language === 'es' ? 'Guía del Usuario' : 'User Guide'}
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">
          {language === 'es' ? 'Domina todas las funciones de GIMS.ai y descubre cómo sacarle el máximo provecho.' : 'Master GIMS.ai features and unleash full creative potential.'}
        </p>
      </div>

      {/* Generated Infographic Display */}
      <div className="bg-zinc-900/20 rounded-2xl border border-zinc-800/50 p-4 relative group overflow-hidden bg-gradient-to-br from-purple-900/5 to-zinc-950/20">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="w-full md:w-3/5 relative">
            <div 
              className={`rounded-xl overflow-hidden border border-zinc-800/80 cursor-zoom-in transition-all duration-300 relative ${isZoomed ? "fixed inset-4 z-50 bg-black/95 flex items-center justify-center p-4" : ""}`}
              onClick={() => {
                audioManager.play('pop');
                setIsZoomed(!isZoomed);
              }}
            >
              <img 
                src={infographicUrl} 
                alt="GIMS.ai Infographic" 
                className={`w-full max-h-80 md:max-h-96 object-cover ${isZoomed ? "max-h-full max-w-full rounded-lg object-contain cursor-zoom-out shadow-2xl" : "hover:scale-[1.02] duration-500"}`}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback if local server path resolution fails on local preview vs production
                  console.log("Infographic render fallback triggered");
                }}
              />
              {!isZoomed && (
                <div className="absolute bottom-2 right-2 bg-black/80 hover:bg-black/90 text-white rounded-full py-1 px-3 text-[10px] sm:text-xs font-semibold backdrop-blur-sm pointer-events-none">
                  {language === 'es' ? '🔍 Click para agrandar infografía' : '🔍 Click to expand infographic'}
                </div>
              )}
            </div>
            {isZoomed && (
              <Button 
                variant="outline" 
                size="sm" 
                className="fixed top-6 right-6 z-50 bg-zinc-900/80 hover:bg-zinc-800 border-zinc-700 text-white gap-1.5"
                onClick={() => setIsZoomed(false)}
              >
                {language === 'es' ? 'Cerrar' : 'Close'}
              </Button>
            )}
          </div>
          <div className="w-full md:w-2/5 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--brand)]/10 text-[var(--brand)] text-xs font-semibold rounded-full border border-[var(--brand)]/20">
              <Info className="w-3.5 h-3.5" />
              {language === 'es' ? 'Infografía Oficial' : 'Official Infographic'}
            </div>
            <h2 className="text-xl font-bold text-zinc-100 font-heading">
              GIMS.ai: {language === 'es' ? 'El Flujo de Juego Humano-IA' : 'The Human-AI Gameflow'}
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {language === 'es' 
                ? 'Nuestra guía visual resume la sinergia entre explorar las creaciones de la comunidad, charlar solos o en grupo, expandir mundos de rol y ganar monedas diarios.' 
                : 'Our visual guide summarizes the synergy between exploring community uploads, chatting solo or in grupal chats, setting up custom lore worlds, and collecting coin drops.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <a 
                href={infographicUrl} 
                download="GIMS_Infografia.jpg"
                className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-zinc-950 bg-[var(--brand)] hover:opacity-90 transition-opacity h-9 px-4 rounded-xl shadow-md"
                onClick={() => audioManager.play('click')}
              >
                <Download className="w-3.5 h-3.5" />
                {language === 'es' ? 'Descargar Infografía' : 'Download Infographic'}
              </a>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-zinc-800 text-zinc-400 hover:text-zinc-200 h-9"
                onClick={() => {
                  audioManager.play('pop');
                  setIsZoomed(true);
                }}
              >
                {language === 'es' ? 'Ver a Pantalla Completa' : 'View Full Screen'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Category Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Step tab togglers */}
        <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 p-1 bg-zinc-950/40 rounded-xl border border-zinc-800/40 lg:border-0 lg:p-0 lg:bg-transparent custom-scrollbar shrink-0">
          {(['basics', 'groupChats', 'creation', 'coins', 'playstore'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                audioManager.play('click');
                setActiveTab(tab);
              }}
              className={`flex-1 lg:flex-initial text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center lg:justify-start gap-2 border whitespace-nowrap ${
                activeTab === tab 
                  ? "bg-[var(--brand)]/15 border-[var(--brand)]/30 text-[var(--brand)] font-bold shadow-lg shadow-[var(--brand)]/5"
                  : "bg-zinc-900/10 border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              {tab === 'basics' && <Compass className="w-4 h-4 shrink-0" />}
              {tab === 'groupChats' && <Users className="w-4 h-4 shrink-0" />}
              {tab === 'creation' && <Sparkles className="w-4 h-4 shrink-0" />}
              {tab === 'coins' && <Coins className="w-4 h-4 shrink-0" />}
              {tab === 'playstore' && <Smartphone className="w-4 h-4 shrink-0" />}
              {steps[language][tab].title}
            </button>
          ))}
        </div>

        {/* Step details content */}
        <div className="col-span-1 lg:col-span-3 space-y-4">
          <div className="bg-zinc-900/10 p-5 rounded-2xl border border-zinc-800/40 bg-gradient-to-br from-zinc-900/10 to-zinc-950/20">
            <h3 className="text-lg font-bold text-zinc-100 font-heading mb-1">{currentSteps[activeTab].title}</h3>
            <p className="text-xs sm:text-sm text-zinc-400 mb-6">{currentSteps[activeTab].desc}</p>

            <div className="space-y-4">
              {currentSteps[activeTab].items.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={idx} className="flex gap-4 p-3 rounded-xl bg-zinc-900/20 border border-zinc-800/30 hover:border-zinc-700/30 transition-all duration-300">
                    <div className="p-2 sm:p-3 h-fit rounded-lg bg-[var(--brand)]/10 border border-[var(--brand)]/10 text-[var(--brand)] shrink-0">
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-zinc-200">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{item.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Quick FAQ summary banner */}
          <div className="bg-amber-500/5 col-span-1 lg:col-span-3 border border-amber-500/20 rounded-2xl p-4 flex gap-3 items-start">
            <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider">
                {language === 'es' ? '💡 Consejos de Rendimiento' : '💡 Performance Tips'}
              </span>
              <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
                {language === 'es' 
                  ? 'GIMS.ai está diseñado para funcionar perfectamente tanto en dispositivos móviles (ajustes ultra compactos) como en PC. Recuerda que no se requiere de hardware avanzado porque las voces y el procesamiento de los chats se procesan completamente en nuestros servidores de alto rendimiento.'
                  : 'GIMS.ai operates lightweight and renders flawlessly across both mobile browsers and desktops. Heavy workloads like speech generation and LLM parameters are executed server-side so your device battery stays completely safe.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
