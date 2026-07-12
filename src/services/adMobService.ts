import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

// Standard Google AdMob test indices and configuration keys
export interface AdMobConfig {
  appId: string;
  bannerUnitId: string;
  interstitialUnitId: string;
  rewardedUnitId: string;
  testMode: boolean;
}

export const DEFAULT_ADMOB_CONFIG: AdMobConfig = {
  appId: "ca-app-pub-5594071281413115~5914681973",
  bannerUnitId: "ca-app-pub-5594071281413115/7434813051",
  interstitialUnitId: "ca-app-pub-5594071281413115/6121731384",
  rewardedUnitId: "ca-app-pub-3940256099942544/5224354917",
  testMode: false
};

export interface AdMobStats {
  requests: number;
  impressions: number;
  clicks: number;
  earnings: number; // Simulated USD
}

class AdMobService {
  private config: AdMobConfig = { ...DEFAULT_ADMOB_CONFIG };
  private stats: AdMobStats = {
    requests: 0,
    impressions: 0,
    clicks: 1,
    earnings: 0.15
  };
  private onConfigChangeCallbacks: (() => void)[] = [];

  constructor() {
    this.loadLocalConfig();
  }

  private loadLocalConfig() {
    try {
      const saved = localStorage.getItem("gims_admob_config");
      const savedStats = localStorage.getItem("gims_admob_stats");
      if (saved) {
        this.config = JSON.parse(saved);
      }
      if (savedStats) {
        this.stats = JSON.parse(savedStats);
      } else {
        this.stats = {
          requests: 12,
          impressions: 10,
          clicks: 2,
          earnings: 0.34
        };
      }
    } catch (e) {
      console.warn("Could not load local AdMob config", e);
    }
  }

  public getConfig(): AdMobConfig {
    return this.config;
  }

  public getStats(): AdMobStats {
    return this.stats;
  }

  public updateConfig(newConfig: Partial<AdMobConfig>) {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem("gims_admob_config", JSON.stringify(this.config));
    this.onConfigChangeCallbacks.forEach(cb => cb());
  }

  public registerCallback(cb: () => void) {
    this.onConfigChangeCallbacks.push(cb);
  }

  public unregisterCallback(cb: () => void) {
    this.onConfigChangeCallbacks = this.onConfigChangeCallbacks.filter(c => c !== cb);
  }

  public trackRequest() {
    this.stats.requests += 1;
    this.saveStats();
  }

  public trackImpression() {
    this.stats.impressions += 1;
    // Add small simulated micro pennies for visual feedback of a real CPM model
    this.stats.earnings += 0.015; 
    this.saveStats();
  }

  public trackClick() {
    this.stats.clicks += 1;
    this.stats.earnings += 0.25; // CTR based CPC
    this.saveStats();
  }

  private saveStats() {
    localStorage.setItem("gims_admob_stats", JSON.stringify(this.stats));
  }

  /**
   * Complete Mock/Script injection for actual production AdMob / Google Publisher Tag
   * If running inside a PWA/Hybrid container (e.g. Capacitor), this bridges to the Capacitor AdMob plugin.
   * If running on mobile web, it triggers Google AdSense/AdMob web tag.
   */
  public async initializeAdMob() {
    console.log("AdMob SDK initialized with App ID:", this.config.appId);
    
    if (this.isCapacitor()) {
      try {
        const AdMob = await this.getCapacitorAdMob();
        if (AdMob) {
          await AdMob.initialize({
            requestTrackingAuthorization: true,
            testingDevices: [],
            initializeForTesting: this.config.testMode
          });
          console.log("Capacitor AdMob Native SDK Initialized successfully!");
        }
      } catch (e) {
        console.error("Failed to initialize native Capacitor AdMob:", e);
      }
    }
    
    // Inject general AdSense/AdMob Tag script into window space
    if (typeof window !== 'undefined') {
      try {
        if (!document.getElementById("admob-sdk-connector")) {
          const script = document.createElement("script");
          script.id = "admob-sdk-connector";
          script.async = true;
          script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5594071281413115";
          script.crossOrigin = "anonymous";
          document.head.appendChild(script);
        }
      } catch (e) {
        console.error("AdMob script injector error: ", e);
      }
    }
  }

  // Check if Capacitor is present
  public isCapacitor(): boolean {
    return typeof window !== 'undefined' && (window as any).Capacitor !== undefined;
  }

  private async getCapacitorAdMob() {
    if (this.isCapacitor()) {
      const cap = (window as any).Capacitor;
      if (cap && cap.Plugins && cap.Plugins.AdMob) {
        return cap.Plugins.AdMob;
      }
    }
    return null;
  }

  public async showNativeBanner() {
    if (this.isCapacitor()) {
      try {
        const AdMob = await this.getCapacitorAdMob();
        if (AdMob) {
          await AdMob.showBanner({
            adId: this.config.bannerUnitId,
            position: "BOTTOM_CENTER",
            size: "BANNER",
            isTesting: this.config.testMode,
            margin: 0
          });
        }
      } catch (e) {
        console.error("Failed to show native banner:", e);
      }
    }
  }

  public async hideNativeBanner() {
    if (this.isCapacitor()) {
      try {
        const AdMob = await this.getCapacitorAdMob();
        if (AdMob) {
          await AdMob.removeBanner();
        }
      } catch (e) {
        console.error("Failed to remove native banner:", e);
      }
    }
  }

  public async showNativeInterstitial() {
    if (this.isCapacitor()) {
      try {
        const AdMob = await this.getCapacitorAdMob();
        if (AdMob) {
          await AdMob.prepareInterstitial({
            adId: this.config.interstitialUnitId,
            isTesting: this.config.testMode
          });
          await AdMob.showInterstitial();
        }
      } catch (e) {
        console.error("Failed to show native interstitial:", e);
      }
    }
  }

  public async showNativeRewarded(onRewardClaimed: (rewardAmount: number) => void) {
    if (this.isCapacitor()) {
      try {
        const AdMob = await this.getCapacitorAdMob();
        if (AdMob) {
          await AdMob.prepareRewardVideoAd({
            adId: this.config.rewardedUnitId,
            isTesting: this.config.testMode
          });
          
          const rewardListener = await AdMob.addListener("onRewardVideoAdRewarded", (info: any) => {
            console.log("Rewarded native video complete!", info);
            onRewardClaimed(info.rewardAmount || 100);
            rewardListener.remove();
          });

          await AdMob.showRewardVideoAd();
        }
      } catch (e) {
        console.error("Failed to show native rewarded:", e);
      }
    }
  }
}

export const adMobService = new AdMobService();
