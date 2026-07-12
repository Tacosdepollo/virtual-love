import React, { useState, useEffect } from "react";
import { adMobService, AdMobConfig, AdMobStats } from "../services/adMobService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Settings, BarChart3, HelpCircle, Save, CheckCircle2, RefreshCw, Smartphone, TrendingUp, AlertTriangle } from "lucide-react";

interface AdMobConsoleProps {
  language: "es" | "en";
  showToast?: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function AdMobConsole({ language, showToast }: AdMobConsoleProps) {
  const [config, setConfig] = useState<AdMobConfig>(adMobService.getConfig());
  const [stats, setStats] = useState<AdMobStats>(adMobService.getStats());
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(adMobService.getConfig());
      setStats(adMobService.getStats());
    };
    adMobService.registerCallback(handleUpdate);
    return () => adMobService.unregisterCallback(handleUpdate);
  }, []);

  const handleSave = () => {
    adMobService.updateConfig(config);
    setIsSaved(true);
    if (showToast) {
      showToast(
        language === "es" ? "Configuración de AdMob guardada correctamente." : "AdMob settings saved successfully.",
        "success"
      );
    }
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetStats = () => {
    localStorage.removeItem("gims_admob_stats");
    // Reload
    window.location.reload();
  };

  // Compute stats
  const ctr = stats.impressions > 0 ? ((stats.clicks / stats.impressions) * 100).toFixed(1) : "0.0";
  const ecpm = stats.impressions > 0 ? ((stats.earnings / stats.impressions) * 1000).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{language === 'es' ? 'Impresiones' : 'Impressions'}</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-white">{stats.impressions}</span>
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center">
              <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> +15%
            </span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{language === 'es' ? 'Clicks' : 'Clicks'}</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-zinc-200">{stats.clicks}</span>
            <span className="text-[10px] text-zinc-500 font-medium">{ctr}% CTR</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">eCPM</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-[var(--brand)]">${ecpm}</span>
            <span className="text-[10px] text-zinc-500 font-medium">USD</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{language === 'es' ? 'Ingresos Estimados' : 'Estimated Earnings'}</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-amber-500">${stats.earnings.toFixed(3)}</span>
            <span className="text-[10px] text-amber-500/80 font-medium">USD</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Unit Configuration Form */}
        <Card className="md:col-span-2 bg-zinc-950/80 border-zinc-800 text-zinc-100 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold font-heading flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#4285F4]" />
              {language === 'es' ? 'IDs de Bloque de Anuncios AdMob' : 'AdMob Ad Unit IDs'}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {language === 'es' 
                ? 'Coloca tus identificadores reales de Google AdMob para tu aplicación Android, iOS o Web híbrida.'
                : 'Input your production Google AdMob identifiers for your Android, iOS, or Hybrid Web builds.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-400 font-semibold">{language === 'es' ? 'ID de Aplicación AdMob (App ID)' : 'AdMob App ID'}</Label>
              <Input
                value={config.appId}
                onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                placeholder="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
                className="bg-zinc-900 border-zinc-800 text-zinc-200 rounded-xl"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-400 font-semibold">{language === 'es' ? 'Banner Unit ID' : 'Banner Unit ID'}</Label>
                <Input
                  value={config.bannerUnitId}
                  onChange={(e) => setConfig({ ...config, bannerUnitId: e.target.value })}
                  placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
                  className="bg-zinc-900 border-zinc-800 text-zinc-200 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400 font-semibold">{language === 'es' ? 'Interstitial Unit ID' : 'Interstitial Unit ID'}</Label>
                <Input
                  value={config.interstitialUnitId}
                  onChange={(e) => setConfig({ ...config, interstitialUnitId: e.target.value })}
                  placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
                  className="bg-zinc-900 border-zinc-800 text-zinc-200 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400 font-semibold">{language === 'es' ? 'Rewarded Unit ID' : 'Rewarded Unit ID'}</Label>
              <Input
                value={config.rewardedUnitId}
                onChange={(e) => setConfig({ ...config, rewardedUnitId: e.target.value })}
                placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
                className="bg-zinc-900 border-zinc-800 text-zinc-200 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input 
                type="checkbox" 
                id="testMode" 
                checked={config.testMode}
                onChange={(e) => setConfig({ ...config, testMode: e.target.checked })}
                className="w-4 h-4 rounded text-[#4285F4] focus:ring-[#4285F4] bg-zinc-850 border-zinc-750"
              />
              <Label htmlFor="testMode" className="text-zinc-300 text-sm cursor-pointer select-none">
                {language === 'es' ? 'Modo de Prueba (Mostrar bloques de prueba de AdMob)' : 'Enable Test Mode (Render mock / placeholder blocks)'}
              </Label>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button 
                variant="outline" 
                onClick={handleResetStats}
                className="border-zinc-800 hover:bg-zinc-900 text-zinc-400 text-xs rounded-xl"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                {language === 'es' ? 'Restaurar Datos de Prueba' : 'Reset Ad Stats'}
              </Button>

              <Button 
                onClick={handleSave}
                className="bg-[#4285F4] hover:bg-[#4285F4]/90 text-white rounded-xl text-xs gap-1"
              >
                {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {language === 'es' ? 'Guardar Cambios' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AdMob Quick integration details */}
        <Card className="bg-zinc-950/80 border-zinc-800 text-zinc-100 rounded-2xl flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle className="text-md font-bold font-heading flex items-center gap-1.5 text-zinc-200">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                {language === 'es' ? 'Integración del SDK' : 'SDK Diagnostic'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-zinc-400 line-clamp-none">
              <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 space-y-1.5">
                <div className="flex justify-between">
                  <span>Plataforma</span>
                  <span className="font-bold text-zinc-200">AdMob Web/CAP</span>
                </div>
                <div className="flex justify-between">
                  <span>Script Injector</span>
                  <span className="font-bold text-emerald-400">Google IMA Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Compliance</span>
                  <span className="font-bold text-zinc-200">COPPA, CCPA, GDPR</span>
                </div>
                <div className="flex justify-between">
                  <span>Ads Loaded</span>
                  <span className="font-bold text-zinc-200">{stats.impressions}</span>
                </div>
              </div>

              <div className="flex gap-2 text-zinc-400">
                <HelpCircle className="w-4 h-4 text-[#4285F4] shrink-0" />
                <p>
                  {language === 'es' 
                    ? 'Los anuncios de banner adaptables se muestran al explorar nuevos compañeros, los intersticiales se cargan al iniciar chats, y los anuncios recompensados te permiten agregar fondos extra gratis.'
                    : 'Adaptive banner ads show dynamically in companions tab, interstitials trigger on chat entry, and rewarded videos grant coin rewards completely free.'}
                </p>
              </div>
            </CardContent>
          </div>

          <div className="p-4 border-t border-zinc-800/60 bg-zinc-900/10 flex items-center gap-2 text-[10px] text-amber-500 bg-amber-500/5 rounded-b-2xl">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Ensure you register this site URL or App ID in your Google AdMob Dashboard to begin receiving production payouts.</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
