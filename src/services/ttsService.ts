// Global AudioContext for Web Audio API
let audioCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function base64ToFloat32Array(base64: string): Float32Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  // Int16 has 2 bytes per sample
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const int16Array = new Int16Array(bytes.buffer);
  
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    // Normalize Int16 to Float32 [-1, 1]
    float32Array[i] = int16Array[i] / (int16Array[i] < 0 ? 32768 : 32767);
  }
  return float32Array;
}

export async function generateSpeechBuffer(text: string, voiceDescription: string): Promise<Float32Array | null> {
  try {
    const response = await fetch("/api/tts/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice_description: voiceDescription })
    });

    if (!response.ok) {
      const errTxt = await response.text();
      console.warn("Backend TTS failed:", errTxt);
      return null;
    }

    const { audio } = await response.json();
    if (!audio) return null;

    return base64ToFloat32Array(audio);
  } catch (error) {
    console.warn("Error generating speech", error);
    return null;
  }
}

export async function playSpeech(text: string, voiceDescription: string, language: 'es' | 'en' = 'es') {
  // Ensure AudioContext is created/resumed synchronously if possible, or right before playing
  const ctx = initAudioContext();
  
  const pcmData = await generateSpeechBuffer(text, voiceDescription);
  if (pcmData) {
    try {
      const audioBuffer = ctx.createBuffer(1, pcmData.length, 24000);
      audioBuffer.getChannelData(0).set(pcmData);
      
      // Stop any existing playing speech
      if (currentSource) {
        currentSource.stop();
        currentSource.disconnect();
      }

      currentSource = ctx.createBufferSource();
      currentSource.buffer = audioBuffer;
      currentSource.connect(ctx.destination);
      currentSource.start(0);
      
      return {
        stop: () => {
          if (currentSource) {
             currentSource.stop();
             currentSource.disconnect();
             currentSource = null;
          }
        }
      };
    } catch (err) {
      console.error("Audio WebAPI playback blocked or failed:", err);
    }
  }
  
  // Browser SpeechSynthesis fallback
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    // Find a matching voice for the UI language
    const voices = window.speechSynthesis.getVoices();
    const targetLangPrefix = language === 'es' ? 'es-' : 'en-';
    const langVoice = voices.find(v => v.lang.startsWith(targetLangPrefix));
    if (langVoice) {
      utterance.voice = langVoice;
    }
    
    // Play speech
    window.speechSynthesis.speak(utterance);
    
    // Create a mock audio object that mimics the play() API minimally
    return {
      play: () => {},
      pause: () => window.speechSynthesis.pause(),
      addEventListener: (evt: string, cb: any) => {
        if (evt === 'ended') {
          utterance.onend = cb;
        }
      }
    } as unknown as HTMLAudioElement;
  }
  
  return null;
}
