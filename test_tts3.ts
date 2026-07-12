import fetch from "node-fetch";

async function run() {
  const models = ["sambert-zhichu-v1"];
  const url = "https://dashscope-intl.aliyuncs.com/api/v1/services/audio/tts/cosyvoice-synthesis";
  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
      "Content-Type": "application/json",
      "X-DashScope-SSE": "disable"
  };
  const data = {
      "model": "sambert-zhichu-v1",
      "input": {
          "text": "Hello world"
      }
  };
  const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(data) });
  console.log("Status:", response.status);
  console.log("Text:", await response.text());
}
run();
