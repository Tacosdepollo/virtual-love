import fetch from "node-fetch";

async function run() {
  const url = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
      "Content-Type": "application/json"
  };
  
  const payloads = [
    {
        "model": "qwen3-tts-flash",
        "input": "Hello there how are you doing",
        "voice": "longxiaochun"
    },
    {
        "model": "qwen3-tts-flash",
        "messages": [{"role": "user", "content": "你好！"}],
        "voice": "longxiaochun"
    }
  ];

  for (const p of payloads) {
      const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(p) });
      console.log(response.status);
      const text = await response.text();
      console.log(text.slice(0, 100));
  }
}
run();
