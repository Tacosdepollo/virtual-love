import fetch from "node-fetch";

async function run() {
  const url = "https://dashscope-intl.aliyuncs.com/api/v1/services/audio/tts/speech-synthesis";
  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable"
  };
  const data = {
      "model": "qwen3-tts-flash",
      "input": {
          "text": "Hello world"
      }
  };
  const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(data) });
  const text = await response.text();
  console.log(response.status, text);
}
run();
