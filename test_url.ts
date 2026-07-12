import fetch from "node-fetch";

async function run() {
  const url = "https://dashscope-intl.aliyuncs.com/api/v1/services/audio/text-to-wav";
  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
      "Content-Type": "application/json"
  };
  const data = {
      "model": "qwen3-tts-flash",
      "input": {
          "text": "Hello world!"
      },
      "parameters": {}
  };
  const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(data) });
  console.log("Status:", response.status);
  console.log("Text:", await response.text());
}
run();
