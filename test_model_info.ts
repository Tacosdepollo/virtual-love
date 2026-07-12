import fetch from "node-fetch";

async function run() {
  const url = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/models/qwen3-tts-flash";
  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd"
  };
  const response = await fetch(url, { headers });
  console.log(response.status);
  console.log(await response.text());
}
run();
