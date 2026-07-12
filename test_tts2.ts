import fetch from "node-fetch";

async function run() {
  const models = ["qwen3-tts-flash"];
  const url = "https://dashscope-intl.aliyuncs.com/api/v1/services/audio/tts/speech-synthesizer";
  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
      "Content-Type": "application/json"
  };
  
  for (const model of models) {
    const data = {
        "model": model,
        "input": {
            "text": "Hello world"
        }
    };
    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(data) });
    console.log("Model:", model, "Status:", response.status);
    console.log("Text:", await response.text());
  }
}
run();
