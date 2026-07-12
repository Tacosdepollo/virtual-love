import fetch from "node-fetch";

async function run() {
  const url = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/models";
  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd"
  };
  const response = await fetch(url, { headers });
  const json = await response.json();
  const ttsModels = json.data.filter(m => m.id.includes('tts'));
  console.log("TTS Models:", ttsModels);
}
run();
