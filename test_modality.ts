import fetch from "node-fetch";

async function run() {
  const url = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
      "Content-Type": "application/json"
  };
  
  const p = {
      "model": "qwen3-tts-flash",
      "messages": [{"role": "user", "content": "你好"}],
      "modalities": ["audio"],
      "voice": "longxiaochun" // wait, Qwen documentation uses this?
  };

  const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(p) });
  console.log(response.status);
  const json = await response.json();
  console.log("Keys:", Object.keys(json));
  if (json.error) console.log(json.error);
}
run();
