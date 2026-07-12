import fetch from "node-fetch";

async function run() {
  const url = "https://dashscope-intl.aliyuncs.com/api/v1/tasks" // maybe?
  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd",
      "Content-Type": "application/json"
  };
  const data = {
      "model": "qwen3-tts-flash",
      "input": {
          "text": "Hello world!"
      }
  };
  // wait actually let me just try to search task API
}
run();
