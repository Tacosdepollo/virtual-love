import fetch from "node-fetch";

async function run() {
  const url = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/audio/speech/";
  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
      "Content-Type": "application/json"
  };
  const data = {
      "model": "qwen3-tts-flash",
      "input": "Hello world",
      "voice": "longxiaochun"
  };
  const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(data) });
  console.log("Status:", response.status);
}
run();
