import React, { useState, useEffect } from "react";
import { ShopItem, Language, UserStats } from "../types";
import { Button } from "./ui/button";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Coins, Check, ShoppingBag, Play, Sparkles, Star, Calendar, Zap, CreditCard } from "lucide-react";
import { t } from "../translations";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import RewardedAd from "./RewardedAd";
import { billingService } from "../services/billingService";
import GooglePlayCheckout from "./GooglePlayCheckout";

interface ShopViewProps {
  language: Language;
  userStats: UserStats;
  userId?: string;
  onBuy: (item: ShopItem) => void;
  onBuyCoins: (amount: number, price: number) => void;
  onAddCoins: (amount: number) => void;
  onSubscribe: () => void;
  onClaimDaily: () => void;
}

export const SHOP_ITEMS: ShopItem[] = [
  // Themes
  { id: "theme_storm", name: "Storm", description: "Poderosos rayos y tormenta", price: 600, type: "theme", value: "storm", previewColor: "#4a4ae2" },
  { id: "theme_stone", name: "Ancient Stone", description: "Textura de piedra ancestral", price: 500, type: "theme", value: "stone", previewColor: "#555555" },
  { id: "theme_brick", name: "Urban Brick", description: "Estilo urbano de ladrillo", price: 500, type: "theme", value: "brick", previewColor: "#a52a2a" },
  { id: "theme_clouds", name: "Dreamy Clouds", description: "Cielo nublado y suave", price: 600, type: "theme", value: "clouds", previewColor: "#87ceeb" },
  { id: "theme_whitewood", name: "White Wood", description: "Madera blanca minimalista", price: 400, type: "theme", value: "whitewood", previewColor: "#f5f5f5" },
  { id: "theme_bluewood", name: "Rustic Blue", description: "Madera azul desgastada", price: 400, type: "theme", value: "bluewood", previewColor: "#4682b4" },
  { id: "theme_nostalgia", name: "🌸 Nostalgia", description: "Recuerdos envueltos en papel antiguo", price: 450, type: "theme", value: "nostalgia", previewColor: "#f4a4b4" },
  { id: "theme_inspiracion", name: "✨ Inspiración", description: "Chispas de creatividad", price: 600, type: "theme", value: "inspiracion", previewColor: "#f39c12" },
  { id: "theme_alegria", name: "☀️ Alegría", description: "Luz y optimismo para cada mensaje", price: 500, type: "theme", value: "alegria", previewColor: "#f1c40f" },
  { id: "theme_midnight", name: "🌌 Midnight", description: "Cielo estrellado profundo", price: 700, type: "theme", value: "midnight", previewColor: "#1a1a40" },
  { id: "theme_forest", name: "🌲 Forest", description: "Bosque profundo y natural", price: 600, type: "theme", value: "forest", previewColor: "#2d5a27" },
  { id: "theme_sunset", name: "🌅 Sunset", description: "Atardecer cálido y vibrante", price: 600, type: "theme", value: "sunset", previewColor: "#ff7e5f" },
  { id: "theme_ocean", name: "🌊 Ocean", description: "Océano profundo y calmo", price: 600, type: "theme", value: "ocean", previewColor: "#0077be" },
  { id: "theme_lava", name: "🌋 Lava", description: "Calor volcánico intenso", price: 700, type: "theme", value: "lava", previewColor: "#cf1020" },
  { id: "theme_neon", name: "🔋 Neon", description: "Estilo futurista brillante", price: 800, type: "theme", value: "neon", previewColor: "#39ff14" },
  { id: "theme_sakura", name: "🌸 Sakura", description: "Flores de cerezo suaves", price: 500, type: "theme", value: "sakura", previewColor: "#ffb7c5" },
  { id: "theme_gold", name: "👑 Gold", description: "Lujo y elegancia dorada", price: 900, type: "theme", value: "gold", previewColor: "#ffd700" },
  { id: "theme_mint", name: "🍃 Mint", description: "Frescura mentolada limpia", price: 500, type: "theme", value: "mint", previewColor: "#98ff98" },
  { id: "theme_violet", name: "🔮 Violet", description: "Misticismo violeta profundo", price: 700, type: "theme", value: "violet", previewColor: "#8b00ff" },
  { id: "theme_cyberpunk", name: "🤖 Cyberpunk", description: "Futuro distópico neón", price: 800, type: "theme", value: "cyberpunk", previewColor: "#ff00ff" },
  { id: "theme_frutigeraero", name: "🫧 Frutiger Aero", description: "Estilo brillante y acuático", price: 700, type: "theme", value: "frutigeraero", previewColor: "#00d2ff" },
  { id: "theme_gothic", name: "🖤 Gothic Noir", description: "Atmósfera gótica romántica oscura", price: 650, type: "theme", value: "gothic", previewColor: "#1d0c24" },
  { id: "theme_cyberpunk_yellow", name: "🟡 Cyberpunk 2077", description: "Contrastes negros y amarillo neón", price: 800, type: "theme", value: "cyberpunk-yellow", previewColor: "#f1c40f" },
  { id: "theme_steampunk", name: "⚙️ Steampunk", description: "Engranajes, bronce y cuero clásico", price: 700, type: "theme", value: "steampunk", previewColor: "#8e44ad" },
  { id: "theme_arctic", name: "❄️ Arctic Frost", description: "Gélido ambiente de hielo polar", price: 500, type: "theme", value: "arctic", previewColor: "#3498db" },
  { id: "theme_toxic", name: "☣️ Toxic Wasteland", description: "Fango radiactivo y verde tóxico", price: 600, type: "theme", value: "toxic", previewColor: "#2ecc71" },
  { id: "theme_bubblegum", name: "🍬 Bubblegum", description: "Colores dulces y juego de burbujas", price: 550, type: "theme", value: "bubblegum", previewColor: "#e84393" },
  { id: "theme_marshmallow", name: "☁️ Marshmallow", description: "Suavidad pastel de nubes dulces", price: 500, type: "theme", value: "marshmallow", previewColor: "#ffeaa7" },
  { id: "theme_abyss", name: "🕳️ Deep Abyss", description: "El misterioso y oscuro fondo del mar", price: 750, type: "theme", value: "abyss", previewColor: "#2c3e50" },
  { id: "theme_firefly", name: "✨ Firefly Meadow", description: "Luciérnagas mágicas en la penumbra", price: 650, type: "theme", value: "firefly", previewColor: "#27ae60" },
  { id: "theme_glitch", name: "📟 System Glitch", description: "Errores digitales y estética hacker", price: 800, type: "theme", value: "glitch", previewColor: "#c0392b" },
  { id: "theme_cozy_fireplace", name: "🔥 Cozy Fireplace", description: "Calidez de un hogar de chimenea", price: 600, type: "theme", value: "cozy-fireplace", previewColor: "#d35400" },
  { id: "theme_northern_lights", name: "🌌 Aurora Borealis", description: "Fascinante espectáculo de luces árticas", price: 850, type: "theme", value: "northern-lights", previewColor: "#9b59b6" },
  { id: "theme_vintage_sepia", name: "⏳ Vintage Sepia", description: "Filtro sepia y memorias del pasado", price: 450, type: "theme", value: "vintage-sepia", previewColor: "#d35400" },
  { id: "theme_graffiti", name: "🎨 Street Graffiti", description: "Arte callejero y sprays coloridos", price: 600, type: "theme", value: "graffiti", previewColor: "#e67e22" },
  { id: "theme_matcha", name: "🍵 Matcha Latte", description: "Elegancia y serenidad del té verde", price: 500, type: "theme", value: "matcha", previewColor: "#16a085" },
  { id: "theme_obsidian", name: "💎 Dark Obsidian", description: "Cristal volcánico pulido y brillante", price: 700, type: "theme", value: "obsidian", previewColor: "#2c3e50" },
  { id: "theme_hyperlight", name: "⚡ Hyperlight", description: "Velocidad lumínica cian neón", price: 800, type: "theme", value: "hyperlight", previewColor: "#00d2ff" },
  { id: "theme_peach_fuzz", name: "🍑 Peach Fuzz", description: "La suavidad aterciopelada del melocotón", price: 500, type: "theme", value: "peach-fuzz", previewColor: "#ff7e5f" },
  { id: "theme_oasis", name: "🏝️ Desert Oasis", description: "Oasis fresco rodeado de dunas cálidas", price: 600, type: "theme", value: "oasis", previewColor: "#1abc9c" },
  { id: "theme_nebula", name: "🪐 Orion Nebula", description: "Cuna de estrellas en el espacio lejano", price: 800, type: "theme", value: "nebula", previewColor: "#8e44ad" },

  // Fonts
  { id: "font_audiowide", name: "Audiowide", description: "Futuristic and rounded", price: 300, type: "font", value: "audiowide" },
  { id: "font_jacquard", name: "Jacquard 24", description: "Elegant decorative style", price: 400, type: "font", value: "jacquard" },
  { id: "font_montecarlo", name: "MonteCarlo", description: "Sophisticated cursive", price: 300, type: "font", value: "montecarlo" },
  { id: "font_saira", name: "Saira Stencil", description: "Industrial stencil look", price: 300, type: "font", value: "saira" },
  { id: "font_silkscreen", name: "Silkscreen", description: "Classic pixel style", price: 400, type: "font", value: "silkscreen" },
  { id: "font_playfair", name: "Playfair Display", description: "Serif clásico y elegante", price: 400, type: "font", value: "playfair" },
  { id: "font_montserrat", name: "Montserrat", description: "Moderno y versátil", price: 300, type: "font", value: "montserrat" },
  { id: "font_oswald", name: "Oswald", description: "Fuerte y condensado", price: 300, type: "font", value: "oswald" },
  { id: "font_lobster", name: "Lobster", description: "Estilo script divertido", price: 400, type: "font", value: "lobster" },
  { id: "font_pacifico", name: "Pacifico", description: "Relajado y manuscrito", price: 400, type: "font", value: "pacifico" },
  { id: "font_righteous", name: "Righteous", description: "Estilo retro-futurista", price: 400, type: "font", value: "righteous" },
  { id: "font_bangers", name: "Bangers", description: "Estilo cómic impactante", price: 400, type: "font", value: "bangers" },
  { id: "font_orbitron", name: "Orbitron", description: "Tipografía de ciencia ficción", price: 400, type: "font", value: "orbitron" },
  { id: "font_press-start", name: "Press Start 2P", description: "Estilo retro gaming", price: 500, type: "font", value: "press-start" },
  { id: "font_dancing-script", name: "Dancing Script", description: "Elegante y fluido", price: 400, type: "font", value: "dancing-script" },
  { id: "font_cinzel", name: "Cinzel", description: "Elegancia clásica romana", price: 400, type: "font", value: "cinzel" },
  { id: "font_sacramento", name: "Sacramento", description: "Manuscrito súper sutil y fino", price: 400, type: "font", value: "sacramento" },
  { id: "font_vt323", name: "VT323", description: "Pantalla de terminal clásica arcade", price: 350, type: "font", value: "vt323" },
  { id: "font_fascinate", name: "Fascinate", description: "Tipografía retro art-decó audaz", price: 400, type: "font", value: "fascinate" },
  { id: "font_syncopate", name: "Syncopate", description: "Sans-serif moderna de gran ancho", price: 400, type: "font", value: "syncopate" },
  { id: "font_cabin_sketch", name: "Cabin Sketch", description: "Diseño infantil dibujado a mano", price: 400, type: "font", value: "cabin-sketch" },
  { id: "font_rye", name: "Rye", description: "Estilo rústico del oeste americano", price: 400, type: "font", value: "rye" },
  { id: "font_permanent_marker", name: "Permanent Marker", description: "Escrito con rotulador indeleble", price: 300, type: "font", value: "permanent-marker" },
  { id: "font_creepster", name: "Creepster", description: "Letras espeluznantes de terror", price: 400, type: "font", value: "creepster" },
  { id: "font_aboreto", name: "Aboreto", description: "Ultra-minimalista lineal moderna", price: 400, type: "font", value: "aboreto" },
  { id: "font_barlow_condensed", name: "Barlow Condensed", description: "Súper condensada y técnica", price: 300, type: "font", value: "barlow-condensed" },
  { id: "font_alumni_collegiate", name: "Alumni Collegiate", description: "Tipografía deportiva universitaria", price: 400, type: "font", value: "alumni-collegiate" },
  { id: "font_platypi", name: "Platypi", description: "Letra serif con personalidad curiosa", price: 350, type: "font", value: "platypi" },
  { id: "font_yesteryear", name: "Yesteryear", description: "Caligrafía de los años 40", price: 400, type: "font", value: "yesteryear" },
  { id: "font_unifraktur", name: "Unifraktur", description: "Gótica clásica medieval fraktur", price: 450, type: "font", value: "unifraktur" },
  { id: "font_niconne", name: "Niconne", description: "Caligrafía elegante continua", price: 400, type: "font", value: "niconne" },
  { id: "font_rubik_mono", name: "Rubik Mono One", description: "Bloques de letras anchas y sólidas", price: 450, type: "font", value: "rubik-mono" },
  { id: "font_teko", name: "Teko", description: "Estructuras verticales de cartelera", price: 350, type: "font", value: "teko" },
  { id: "font_monoton", name: "Monoton", description: "Estilo retro disco futurista", price: 500, type: "font", value: "monoton" },
  { id: "font_cinzel_dec", name: "Cinzel Decorative", description: "Ornatos clásicos detallados", price: 450, type: "font", value: "cinzel-dec" },
];

export const COIN_PACKAGES = [
  { id: "coins_100", name: "100 Monedas", description: "Paquete inicial", price: 0.50, coins: 100 },
  { id: "coins_500", name: "500 Monedas", description: "Paquete popular", price: 2.00, coins: 500 },
  { id: "coins_2000", name: "2000 Monedas", description: "Paquete avanzado", price: 5.00, coins: 2000 },
  { id: "coins_10000", name: "10000 Monedas", description: "Paquete experto", price: 20.00, coins: 10000 },
];

export default function ShopView({ language, userStats, userId, onBuy, onBuyCoins, onAddCoins, onSubscribe, onClaimDaily }: ShopViewProps) {
  const [showAd, setShowAd] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'theme' | 'font' | 'subscription' | 'coins'>('all');
  const [playCheckoutItem, setPlayCheckoutItem] = useState<{ id: string; name: string; price: number } | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success')) {
      setStatusMessage({
        type: 'success',
        text: language === 'es' ? "¡Pago completado con éxito! Tu suscripción se activará en unos momentos." : "Payment successful! Your subscription will be active in a few moments."
      });
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('canceled')) {
      setStatusMessage({
        type: 'error',
        text: language === 'es' ? "El pago fue cancelado." : "Payment was canceled."
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [language]);

  const isSubscribed = userStats.subscription?.active;
  const lastClaim = userStats.subscription?.lastClaimDate || 0;
  const today = new Date().setHours(0, 0, 0, 0);
  const canClaim = isSubscribed && lastClaim < today;

  const handleWatchAd = () => {
    setShowAd(true);
  };

  const handleAdComplete = (reward: number) => {
    onAddCoins(reward);
    setShowAd(false);
  };

  const filteredItems = SHOP_ITEMS.filter(item => 
    activeCategory === 'all' || item.type === activeCategory
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
      {showAd && (
        <RewardedAd 
          language={language} 
          onComplete={handleAdComplete} 
          onClose={() => setShowAd(false)} 
        />
      )}
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
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold gap-2 rounded-xl h-12 px-6 shadow-lg shadow-amber-500/20 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
            <Play className="w-4 h-4 fill-black" />
            {t('watchAd', language)}
          </Button>

          <div className="flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-full border border-zinc-700 shadow-inner h-12">
            <Coins className="w-5 h-5 text-amber-400" />
            <span className="text-xl font-bold text-amber-100">{userStats.coins}</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 bg-zinc-900/40 p-1 rounded-2xl border border-zinc-800 w-fit">
        <Button
          variant="ghost"
          onClick={() => setActiveCategory('all')}
          className={cn(
            "rounded-xl px-6",
            activeCategory === 'all' ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          {t('all', language)}
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveCategory('subscription')}
          className={cn(
            "rounded-xl px-6",
            activeCategory === 'subscription' ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          GIMS+
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveCategory('theme')}
          className={cn(
            "rounded-xl px-6",
            activeCategory === 'theme' ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          {t('themes', language)}
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveCategory('font')}
          className={cn(
            "rounded-xl px-6",
            activeCategory === 'font' ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          {t('fonts', language)}
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveCategory('coins')}
          className={cn(
            "rounded-xl px-6",
            activeCategory === 'coins' ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          {language === 'es' ? 'Monedas' : 'Coins'}
        </Button>
      </div>

      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "p-4 rounded-xl border font-medium text-center",
              statusMessage.type === 'success' 
                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                : "bg-rose-500/10 border-rose-500/50 text-rose-400"
            )}
          >
            {statusMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Subscription Card */}
        {(activeCategory === 'all' || activeCategory === 'subscription') && (
          <motion.div
            whileHover={{ y: -5 }}
            className="md:col-span-2 lg:col-span-3 xl:col-span-2"
          >
            <Card className="bg-gradient-to-br from-amber-500/20 to-purple-500/20 backdrop-blur-sm border-amber-500/30 overflow-hidden h-full flex flex-col relative group">
              <div className="absolute top-0 right-0 p-4">
                <Star className="w-12 h-12 text-amber-500/20 group-hover:scale-110 transition-transform" />
              </div>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500 p-2 rounded-xl">
                    <Zap className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-white font-heading">GIMS+</CardTitle>
                    <CardDescription className="text-amber-200/70 font-medium">{t('subscriptionDesc', language)}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-zinc-300">{language === 'es' ? '50 monedas gratis cada día' : '50 free coins every day'}</p>
                    <p className="text-sm text-zinc-300">{t('subscriptionBenefit2', language)}</p>
                    <p className="text-sm text-zinc-300">{t('subscriptionBenefit3', language)}</p>
                  </div>
                  <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center text-center">
                    <Coins className="w-8 h-8 text-amber-400 mb-2" />
                    <span className="text-2xl font-bold text-white">1500</span>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500">Monedas / Mes</span>
                    <div className="mt-2 text-sm font-bold text-[var(--brand)]">$4.99 / mes</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {!isSubscribed ? (
                  <div className="w-full flex flex-col">
                    <Button
                      onClick={async () => {
                        const isNativeHandled = await billingService.purchaseItem(
                          "subscription_monthly",
                          4.99,
                          userId,
                          userStats,
                          (updatedStats) => {
                            setStatusMessage({
                              type: 'success',
                              text: language === 'es' ? "¡Suscripción de Google Play activada con éxito!" : "Google Play subscription activated successfully!"
                            });
                          }
                        );
                        if (!isNativeHandled) {
                          setPlayCheckoutItem({
                            id: "subscription_monthly",
                            name: "GIMS+ Suscripción Mensual",
                            price: 4.99
                          });
                        }
                      }}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold h-12 rounded-xl mb-3 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                    >
                      <span className="text-sm font-black">▶</span>
                      {language === 'es' ? 'Pagar con Google Play' : 'Pay with Google Play'}
                    </Button>

                    <div className="flex items-center mb-3 text-zinc-500 text-[10px] uppercase tracking-widest justify-center gap-2">
                      <div className="h-[1px] bg-zinc-800 flex-1" />
                      <span>{language === 'es' ? 'O bien' : 'Or pay with'}</span>
                      <div className="h-[1px] bg-zinc-800 flex-1" />
                    </div>

                    <PayPalButtons
                      style={{ layout: "horizontal", height: 48, color: "gold", shape: "rect", label: "pay" }}
                      createOrder={async () => {
                        const response = await fetch("/api/paypal/create-order", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                        });
                        const order = await response.json();
                        if (!order.id) {
                          throw new Error(order.error || "Failed to create PayPal order");
                        }
                        return order.id;
                      }}
                      onApprove={async (data) => {
                        const response = await fetch("/api/paypal/capture-order", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            orderID: data.orderID,
                            userId: userId
                          }),
                        });
                        const details = await response.json();
                        if (details.status === 'COMPLETED') {
                          setStatusMessage({
                            type: 'success',
                            text: language === 'es' ? "¡Pago completado con éxito! Tu suscripción se activará en unos momentos." : "Payment successful! Your subscription will be active in a few moments."
                          });
                          
                          // Update user stats in Firestore
                          if (userId) {
                            const { doc, updateDoc } = await import("firebase/firestore");
                            const { db } = await import("../lib/firebase");
                            const newStats = {
                              ...userStats,
                              subscription: {
                                active: true,
                                startDate: Date.now(),
                                lastClaimDate: 0,
                                type: 'monthly'
                              }
                            };
                            await updateDoc(doc(db, "users", userId), { stats: newStats });
                          }
                        }
                      }}
                      onError={(err) => {
                        console.error("PayPal Error:", err);
                        setStatusMessage({
                          type: 'error',
                          text: language === 'es' ? "Error al procesar el pago con PayPal." : "Error processing PayPal payment."
                        });
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="secondary"
                      className="flex-1 h-12 rounded-xl border-amber-500/30 text-amber-200"
                      disabled
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {t('subscribed', language)}
                    </Button>
                    <Button 
                      onClick={onClaimDaily}
                      disabled={!canClaim}
                      className={cn(
                        "flex-1 h-12 rounded-xl font-bold",
                        canClaim ? "bg-amber-500 hover:bg-amber-600 text-black" : "bg-zinc-800 text-zinc-500"
                      )}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {canClaim ? t('claimDaily', language) : t('alreadyClaimed', language)}
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {(activeCategory === 'all' || activeCategory === 'coins') && COIN_PACKAGES.map((pkg) => (
          <motion.div
            key={pkg.id}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="bg-zinc-900/20 backdrop-blur-sm border-zinc-800/50 overflow-hidden h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-zinc-100">{pkg.name}</CardTitle>
                <CardDescription className="text-zinc-400 text-sm">{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 py-4 flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-2">
                  <Coins className="w-8 h-8 text-amber-400" />
                  <span className="text-3xl font-bold text-white">{pkg.coins}</span>
                </div>
                <span className="text-sm font-medium text-zinc-500">${pkg.price.toFixed(2)} USD</span>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={async () => {
                    const isNativeHandled = await billingService.purchaseItem(
                      pkg.id,
                      pkg.price,
                      userId,
                      userStats,
                      (updatedStats) => {
                        onBuyCoins(pkg.coins, pkg.price);
                        setStatusMessage({
                          type: 'success',
                          text: language === 'es' ? `¡Se han añadido ${pkg.coins} monedas por Google Play!` : `Added ${pkg.coins} coins via Google Play!`
                        });
                      }
                    );
                    if (!isNativeHandled) {
                      setPlayCheckoutItem({
                        id: pkg.id,
                        name: pkg.name,
                        price: pkg.price
                      });
                    }
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold h-11 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 text-xs"
                >
                  <span className="text-[10px] font-black">▶</span>
                  {language === 'es' ? 'Comprar con Google Play' : 'Buy with Google Play'}
                </Button>

                <div className="flex items-center w-full text-zinc-600 text-[9px] uppercase tracking-wider justify-center gap-1.5">
                  <div className="h-[1px] bg-zinc-800 flex-1" />
                  <span>{language === 'es' ? 'O bien' : 'Or'}</span>
                  <div className="h-[1px] bg-zinc-800 flex-1" />
                </div>

                <PayPalButtons
                  style={{ layout: "horizontal", height: 38, color: "gold", shape: "rect", label: "pay" }}
                  createOrder={async () => {
                    const response = await fetch("/api/paypal/create-order", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        amount: pkg.price.toFixed(2),
                        description: `GIMS ${pkg.coins} Coins`
                      }),
                    });
                    const order = await response.json();
                    if (!order.id) {
                      throw new Error(order.error || "Failed to create PayPal order");
                    }
                    return order.id;
                  }}
                  onApprove={async (data) => {
                    const response = await fetch("/api/paypal/capture-order", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        orderID: data.orderID,
                        userId: userId
                      }),
                    });
                    const details = await response.json();
                    if (details.status === 'COMPLETED') {
                      onBuyCoins(pkg.coins, pkg.price);
                    }
                  }}
                  onError={(err) => {
                    console.error("PayPal Error:", err);
                    setStatusMessage({
                      type: 'error',
                      text: language === 'es' ? "Error al procesar el pago con PayPal." : "Error processing PayPal payment."
                    });
                  }}
                />
              </CardFooter>
            </Card>
          </motion.div>
        ))}

        {(activeCategory === 'all' || activeCategory === 'theme' || activeCategory === 'font') && filteredItems.map((item) => {
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
                      className="w-full h-24 rounded-lg border border-zinc-700 flex items-center justify-center overflow-hidden relative"
                      data-theme={item.value}
                    >
                      <div 
                        className="absolute inset-0"
                        style={{ 
                          backgroundImage: 'var(--bg-image)', 
                          backgroundRepeat: 'repeat',
                          backgroundSize: 'var(--bg-size, auto)',
                          backgroundColor: item.previewColor
                        }}
                      />
                      <span className="relative text-xs font-bold mix-blend-difference text-white opacity-50 uppercase tracking-tighter">Preview</span>
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

      <AnimatePresence>
        {playCheckoutItem && (
          <GooglePlayCheckout
            productId={playCheckoutItem.id}
            productName={playCheckoutItem.name}
            price={playCheckoutItem.price}
            language={language}
            onClose={() => setPlayCheckoutItem(null)}
            onSuccess={async () => {
              if (playCheckoutItem.id.startsWith("coins")) {
                const amount = parseInt(playCheckoutItem.id.split("_")[1]) || 100;
                onBuyCoins(amount, playCheckoutItem.price);
                setStatusMessage({
                  type: 'success',
                  text: language === 'es' ? `¡Se han añadido ${amount} monedas a tu cuenta!` : `Added ${amount} coins to your account!`
                });
              } else if (playCheckoutItem.id === "subscription_monthly") {
                if (userId) {
                  const { doc, updateDoc } = await import("firebase/firestore");
                  const { db } = await import("../lib/firebase");
                  const newStats = {
                    ...userStats,
                    subscription: {
                      active: true,
                      startDate: Date.now(),
                      lastClaimDate: 0,
                      type: 'monthly'
                    }
                  };
                  await updateDoc(doc(db, "users", userId), { stats: newStats });
                  setStatusMessage({
                    type: 'success',
                    text: language === 'es' ? "¡Suscripción de Google Play activada con éxito!" : "Google Play subscription activated successfully!"
                  });
                }
              }
              setPlayCheckoutItem(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
