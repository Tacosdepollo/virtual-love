import fetch from "node-fetch";

async function run() {
  const models = ["qwen3-tts-flash"];
  const paths = [
    "api/v1/services/aigc/text2audio/audio-synthesis",
    "api/v1/services/audio/tts/text-to-speech",
    "api/v1/services/audio/tts/cosyvoice-synthesis"
  ];
  
  // Try without intl domain too
  const domains = [
      "https://dashscope-intl.aliyuncs.com",
      "https://dashscope.aliyuncs.com"
  ];

  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
      "Content-Type": "application/json",
      "X-DashScope-SSE": "disable"
  };

  for (const domain of domains) {
      for (const path of paths) {
          for (const model of models) {
              const url = `${domain}/${path}`;
              const data = {
                  "model": model,
                  "input": {
                      "text": "Hello world"
                  }
              };
              const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(data) });
              const text = await response.text();
              console.log(url, response.status);
              if (response.status !== 404) {
                 console.log("-> ", text.slice(0, 150));
              }
          }
      }
  }
}
run();
