import fetch from "node-fetch";

async function run() {
  const models = ["sambert-zhichu-v1", "sambert-zhimiao-emo-v1", "qwen3-tts-flash"];
  const paths = [
    "api/v1/services/audio/text-to-wav",
    "api/v1/services/audio/tts/text-to-wav",
    "api/v1/services/aigc/text2audio/text-to-wav"
  ];

  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
      "Content-Type": "application/json"
  };

  for (const path of paths) {
      for (const model of models) {
          const url = `https://dashscope-intl.aliyuncs.com/${path}`;
          const data = {
              "model": model,
              "input": {
                  "text": "Hello world"
              }
          };
          const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(data) });
          const text = await response.text();
          if (response.status !== 404) {
             console.log(url, model, response.status, text.slice(0, 100));
          }
      }
  }
}
run();
