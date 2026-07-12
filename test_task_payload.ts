import fetch from "node-fetch";

async function run() {
  const url = "https://dashscope-intl.aliyuncs.com/api/v1/services/audio/text-to-wav";
  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
      "Content-Type": "application/json"
  };
  
  const payloads = [
    {
      "model": "qwen3-tts-flash",
      "task": {
        "text": "Hello world!"
      }
    },
    {
      "task": {
         "model": "qwen3-tts-flash",
         "input": { "text": "Hello world!" }
      }
    },
    {
      "model": "qwen3-tts-flash",
      "input": { "text": "Hello world!" },
      "task": {}
    }
  ];

  for (const p of payloads) {
    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(p) });
    const text = await response.text();
    console.log(response.status, text.slice(0, 100));
  }
}
run();
