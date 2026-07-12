import fetch from "node-fetch";

async function run() {
  const paths = [
    "compatible-mode/v1/audio/text-to-speech",
    "compatible-mode/v1/tts",
    "compatible-mode/v1/speech",
    "compatible-mode/v1/audio/synthesize",
    "compatible-mode/v1/services/audio/speech",
    "compatible-mode/v1/audio/tts",
    "api/v1/services/audio/speech/text-to-speech"
  ];
  const prefix = "https://dashscope-intl.aliyuncs.com/";

  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
      "Content-Type": "application/json"
  };
  const data = {
      "model": "qwen3-tts-flash",
      "input": "Hello",
      "voice": "longxiaochun"
  };

  const promises = [];
  for (const path of paths) {
      const url = prefix + path;
      promises.push((async () => {
        const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(data) });
        if (response.status !== 404) {
          console.log(url, "-->", response.status, await response.text());
        }
      })());
  }
  await Promise.all(promises);
}
run();
