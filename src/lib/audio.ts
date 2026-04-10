const SOUNDS = {
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  pop: "https://www.soundjay.com/buttons/sounds/button-3.mp3",
  typing: "/typing.wav",
  search: "https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3",
  transition: "https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3"
};

class AudioManager {
  private audios: Map<string, HTMLAudioElement> = new Map();
  private activeInstances: Map<string, Set<HTMLAudioElement>> = new Map();
  private enabled: boolean = true;

  constructor() {
    // Preload sounds
    if (typeof window !== 'undefined') {
      Object.entries(SOUNDS).forEach(([key, url]) => {
        const audio = new Audio(url);
        audio.preload = "auto";
        this.audios.set(key, audio);
        this.activeInstances.set(key, new Set());
      });
    }
  }

  play(soundName: keyof typeof SOUNDS, volume: number = 0.4, startTime?: number, duration?: number) {
    if (!this.enabled) return;
    
    const url = SOUNDS[soundName];
    if (!url) return;

    try {
      const audio = new Audio(url);
      audio.volume = volume;
      
      const instances = this.activeInstances.get(soundName);
      if (instances) instances.add(audio);

      const cleanup = () => {
        if (instances) instances.delete(audio);
        audio.remove();
      };

      audio.addEventListener('ended', cleanup, { once: true });
      
      const startPlayback = () => {
        if (startTime !== undefined) {
          audio.currentTime = startTime;
        }
        audio.play().catch(err => {
          // Silence all audio errors as requested
        });
      };

      if (startTime !== undefined) {
        if (audio.readyState >= 1) {
          startPlayback();
        } else {
          audio.addEventListener('loadedmetadata', startPlayback, { once: true });
        }
      } else {
        startPlayback();
      }

      if (duration !== undefined) {
        audio.addEventListener('play', () => {
          setTimeout(() => {
            audio.pause();
            cleanup();
          }, duration * 1000);
        }, { once: true });
      }
    } catch (err) {
      // Silence initialization errors
    }
  }

  stop(soundName: keyof typeof SOUNDS) {
    const instances = this.activeInstances.get(soundName);
    if (instances) {
      instances.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
        audio.remove();
      });
      instances.clear();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

export const audioManager = new AudioManager();
