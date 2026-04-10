const SOUNDS = {
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  pop: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
  typing: "https://assets.mixkit.co/active_storage/sfx/1384/1384-preview.mp3",
  search: "https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3",
  transition: "https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3"
};

class AudioManager {
  private audios: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;

  constructor() {
    // Preload sounds
    if (typeof window !== 'undefined') {
      Object.entries(SOUNDS).forEach(([key, url]) => {
        const audio = new Audio(url);
        audio.preload = "auto";
        this.audios.set(key, audio);
      });
    }
  }

  play(soundName: keyof typeof SOUNDS, volume: number = 0.4) {
    if (!this.enabled) return;
    
    const audio = this.audios.get(soundName);
    if (audio) {
      // Clone to allow overlapping sounds
      const clone = audio.cloneNode() as HTMLAudioElement;
      clone.volume = volume;
      clone.play().catch(() => {
        // Ignore errors (usually due to user not interacting yet)
      });
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

export const audioManager = new AudioManager();
