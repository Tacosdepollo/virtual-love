import fetch from "node-fetch";

async function run() {
  const model = "qwen3-tts-flash";
  const paths = [
    "api/v1/services/audio/text-to-speech/text-to-speech",
    "api/v1/services/audio/tts/text-to-speech",
    "api/v1/services/aigc/text2audio/text-to-speech",
    "api/v1/services/audio/tts/synthesize",
    "api/v1/services/audio/tts/v1/synthesize",
    "api/v1/services/audio/tts/synthesis",
    "api/v1/services/audio/tts/speech-synthesis",
    "api/v1/services/audio/tts/voice-synthesis",
    "api/v1/services/audio/text-to-audio/synthesize",
    "api/v1/services/aigc/text2audio/synthesize",
    "api/v1/services/audio/text-to-speech/synthesize",
    "api/v1/services/audio/text-to-speech/speech-synthesis",
    "api/v1/services/aigc/text2audio/speech-synthesis",
  ];

  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
      "Content-Type": "application/json"
  };

  for (const path of paths) {
      const url = `https://dashscope-intl.aliyuncs.com/${path}`;
      const data = {
          "model": model,
          "input": {
              "text": "Hello world"
          }
      };
      const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(data) });
      const text = await response.text();
      if (!text.includes("url error") && !text.includes("URLNotSupported") && response.status !== 404) {
          console.log(path, response.status, text.slice(0, 100));
      }
  }
}
run();
