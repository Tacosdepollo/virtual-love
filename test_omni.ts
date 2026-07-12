import fetch from "node-fetch";

async function run() {
  const url = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
      "Content-Type": "application/json"
  };
  const voices = ["cherry", "zhimiao", "long", "xiaomi", "qwen", "default", "qwen-audio", "zhijia", "zhichu", "voice_1"];

  for (const voice of voices) {
      const data = {
          "model": "qwen3.5-omni-plus",
          "messages": [
              {"role": "user", "content": "Say hi"}
          ],
          "modalities": ["text", "audio"],
          "audio": {
              "voice": voice,
              format: "wav"
          }
      };
      const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(data) });
      const json = await response.json();
      if (!json.error) {
          console.log(`Voice ${voice} works! audio length: ${json.choices[0].message?.audio?.data?.length}`);
      } else {
          console.log(`Voice ${voice} failed: ${json.error.message}`);
      }
  }
}
run();
