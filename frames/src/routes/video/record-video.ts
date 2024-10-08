// import path from "path";
// import fs from "fs";
import puppeteer from "puppeteer";
import { PuppeteerScreenRecorder } from  "puppeteer-screen-recorder";

const __dirname = new URL(".", import.meta.url).pathname;

const PORT = 5173;
const url = `http://localhost:${PORT}/video`;

console.log("opening browser");
const browser = await puppeteer.launch({
  headless: "shell",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

const page = await browser.newPage();

await page.emulate({
  userAgent: "video",
  viewport: {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
  }
})

console.log("goto: ", url);
await page.goto(url);

await page.waitForNetworkIdle();

const recorder = new PuppeteerScreenRecorder(page, {
  fps: 30,
});

console.log("recording start");

const now = Date.now();
recorder.start(`${__dirname}/video-${now}.mp4`);

console.log("running video animation")
await page.evaluate(async () => {
  // @ts-ignore
  await window.run_video_animation();  
})


await recorder.stop();
console.log("recording stop");

console.log("done!")

process.exit(1);

