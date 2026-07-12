import OpenAI from "openai";

async function run() {
  const openai = new OpenAI({
    apiKey: "sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
    baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
  });

  try {
    const mp3 = await openai.audio.speech.create({
      model: "qwen3-tts-flash",
      voice: "longxiaochun",
      input: "Today is a wonderful day to build something people love!",
    });
    console.log("Success! Audio length:", mp3.headers.get("content-length"));
  } catch (err: any) {
    console.error("OpenAI Error:", err.message);
    console.error(err.response?.statusText);
  }
}
run();
