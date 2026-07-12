import fetch from "node-fetch";

async function run() {
  const urls = [
    "https://dashscope.aliyuncs.com/compatible-mode/v1/audio/speech",
    "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text2audio/audio-synthesis",
    "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/audio/speech"
  ];
  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
      "Content-Type": "application/json"
  };
  const data = {
      "model": "qwen3-tts-flash",
      "input": "Hello world",
      "voice": "longxiaochun"
  };
  for (const url of urls) {
      const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(data) });
      console.log(url, "Status:", response.status);
      console.log("Text:", await response.text());
  }
}
run();
