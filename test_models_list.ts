import fetch from "node-fetch";

async function run() {
  const url = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/models";
  const headers = {
      "Authorization": "Bearer sk-afb1ffe81ae7484c8cac9af60cbdb2fd"
  };
  const response = await fetch(url, { method: "GET", headers });
  const data = await response.json();
  console.log("Status:", response.status);
  console.log(JSON.stringify(data.data?.map((m: any) => m.id), null, 2));
}
run();
