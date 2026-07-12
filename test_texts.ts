import fetch from "node-fetch";

async function run() {
  const url = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
      "Content-Type": "application/json"
  };

  const texts = [
      "你好，我是你的智能助手，很高兴为你服务！",
      "123456",
      "A"
  ];
  const voices = ["longxiaochun"];

  for (const text of texts) {
      const payload = {
          "model": "qwen3-tts-flash",
          "messages": [
              {"role": "user", "content": text}
          ],
          "voice": "longxiaochun"
      };

      const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
      const json = await response.json();
      console.log(text, response.status, json.error?.message || "success");
  }
}
run();
