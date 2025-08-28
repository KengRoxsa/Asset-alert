import chromium from "@sparticuz/chromium";

async function main() {
  console.log("Downloading Chromium...");
  await chromium.download();
  console.log("Chromium downloaded!");
}

main();
