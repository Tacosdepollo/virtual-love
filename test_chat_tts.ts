import fetch from "node-fetch";

async function run() {
  const url = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
      "Content-Type": "application/json"
  };
  const data = {
      "model": "qwen3-tts-flash",
      "messages": [{"role": "user", "content": "Hello"}],
      "input": "test"
  };
  const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(data) });
  console.log(response.status);
  console.log(await response.text());
}
run();
