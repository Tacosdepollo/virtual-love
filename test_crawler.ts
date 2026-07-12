import fetch from "node-fetch";

async function run() {
  const url = "https://help.aliyun.com/zh/model-studio/developer-reference/speech-synthesis-api";
  const headers = {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9"
  };
  const response = await fetch(url, { headers });
  const text = await response.text();
  console.log(text.substring(0, 1500));
}
run();
