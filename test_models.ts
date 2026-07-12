import fetch from "node-fetch";

async function run() {
  const models = [
    "cosyvoice-v1",
    "qwen-tts-v1",
    "qwen-tts-v2",
    "sambert-zhichu-v1",
    "speech-01"
  ];
  const endpoints = [
    "https://dashscope-intl.aliyuncs.com/api/v1/services/audio/tts/cosyvoice-synthesis",
    "https://dashscope-intl.aliyuncs.com/api/v1/services/audio/tts/customization",
    "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text2audio/audio-synthesis",
    "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/audio/speech"
  ];

  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
      "Content-Type": "application/json",
      "X-DashScope-SSE": "disable"
  };

  for (const url of endpoints) {
      for (const model of models) {
          const data = {
              "model": model,
              "input": {
                  "text": "Hello world"
              }
          };
          const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(data) });
          const text = await response.text();
          if (!text.includes("Model not exist") && !text.includes("URLNotSupported") && response.status !== 404) {
              console.log(url, model, response.status, text);
          }
      }
  }
}
run();
