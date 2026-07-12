import fetch from "node-fetch";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  const paths = [
    "qwen-tts",
    "qwen-speech",
    "qwen3-synthesis",
    "qwen-text-to-speech",
    "tts-synthesis",
    "speech-synthesis",
    "audio-synthesis"
  ];
  const prefixes = [
    "https://dashscope-intl.aliyuncs.com/api/v1/services/audio/tts/",
    "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text2audio/"
  ];

  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
      "Content-Type": "application/json"
  };
  const data = {
      "model": "qwen3-tts-flash",
      "input": {"text": "Hello world"} // using correct DashScope JSON input wrapping!
  };

  for (const prefix of prefixes) {
    for (const path of paths) {
      const url = prefix + path;
      const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(data) });
      const text = await response.text();
      console.log(url, "-->", response.status);
      if (!text.includes("url error") && !text.includes("Throttling.RateQuota")) {
         console.log(text);
      }
      await sleep(1000);
    }
  }
}
run();
