import fetch from "node-fetch";

async function run() {
  const url = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
      "Content-Type": "application/json"
  };

  const payload = {
      "model": "qwen3-tts-flash",
      "messages": [
          {"role": "user", "content": "You are a helpful assistant. Hello world this is a longer text because otherwise it might fail due to minimum text length limits in the model. Please generate this."}
      ],
      "voice": "longxiaochun"
  };

  const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
  console.log(response.status);
  console.log(await response.text());
}
run();
