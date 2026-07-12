import { Client } from "@gradio/client";
import fs from "fs";

async function run() {
  try {
    const client = await Client.connect("https://iic-cosyvoice2-0-5b.ms.show/");
    const result = await client.predict("/generate_audio", { 
        tts_text: "Hola, soy tu IA personalizada.", 
        mode_checkbox_group: "自然语言控制", 
        prompt_text: "", 
        prompt_wav_upload: null, 
        prompt_wav_record: null, 
        instruct_text: "una voz femenina y amable", 
        seed: 0, 
        stream: "False", 
    });

    console.log(result);
  } catch(e) {
    console.error(e);
  }
}
run();
