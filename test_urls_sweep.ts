import fetch from "node-fetch";

async function run() {
  const paths = [
    "qwen-synthesis",
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
    "https://dashscope-intl.aliyuncs.com/api/v1/services/audio/text2audio/"
  ];

  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
      "Content-Type": "application/json"
  };
  const data = {
      "model": "qwen3-tts-flash",
      "input": {"text": "Hello world"}
  };

  const promises = [];
  for (const prefix of prefixes) {
    for (const path of paths) {
      const url = prefix + path;
      promises.push((async () => {
        const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(data) });
        const text = await response.text();
        if (!text.includes("url error")) {
          console.log(url, "-->", response.status, text.slice(0, 50));
        }
      })());
    }
  }
  await Promise.all(promises);
}
run();
