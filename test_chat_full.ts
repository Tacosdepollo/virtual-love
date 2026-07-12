import fetch from "node-fetch";

async function run() {
  const url = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
      "Content-Type": "application/json"
  };
  const data = {
      "model": "qwen3.5-omni-plus",
      "messages": [
          {"role": "user", "content": "Say hello world"}
      ],
      "modalities": ["text", "audio"],
      "audio": {
          "format": "wav"
      }
  };
  const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(data) });
  const json = await response.json();
  console.log("Status:", response.status);
  console.log(JSON.stringify(json, null, 2));
}
run();
