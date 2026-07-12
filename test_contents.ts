import fetch from "node-fetch";

async function run() {
  const url = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
      "Content-Type": "application/json"
  };
  
  const contents = [
      "Hello world",
      "<speak>Hello world</speak>",
      [{"type": "text", "text": "Hello world"}],
      [{"type": "input", "text": "Hello world"}]
  ];

  for (const c of contents) {
      const p = {
          "model": "qwen3-tts-flash",
          "messages": [
              {"role": "user", "content": c}
          ],
          "voice": "longxiaochun"
      };

      const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(p) });
      const json = await response.json();
      console.log(response.status, json.error?.message || "Success");
  }
}
run();
