const fs = require("fs");
const path = require("path");

function parseSrtToText(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");

  let text = content.replace(/\r\n/g, "\n");

  const srtPattern =
    /^\d+\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}\n/gm;
  text = text.replace(srtPattern, "");

  const htmlTagPattern = /<[^>]+>/g;
  text = text.replace(htmlTagPattern, "");

  text = text.replace(/\n+/g, " ").trim();

  return text;
}

function parseVttToText(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");

  let text = content.replace(/\r\n/g, "\n");

  text = text.replace(/^WEBVTT.*\n*/, "");

  const vttPattern =
    /^(?:.+?\n)?\d{2}:\d{2}(?::\d{2})?\.\d{3} --> \d{2}:\d{2}(?::\d{2})?\.\d{3}.*\n/gm;
  text = text.replace(vttPattern, "");

  const htmlTagPattern = /<[^>]+>/g;
  text = text.replace(htmlTagPattern, "");

  text = text.replace(/\n+/g, " ").trim();

  return text;
}

if (require.main === module) {
  const srtPath = path.join(
    __dirname,
    "../../POC_sample_test_files/sample_0.srt",
  );
  const vttPath = path.join(
    __dirname,
    "../../POC_sample_test_files/sample.vtt",
  );
  try {
    console.log("--- STARTING SRT PARSE POC ---");
    console.log(parseSrtToText(srtPath).substring(0, 200) + "...");
    console.log("------------------------------\n");

    console.log("--- STARTING VTT PARSE POC ---");
    console.log(parseVttToText(vttPath).substring(0, 200) + "...");
    console.log("------------------------------\n");
  } catch (error) {
    console.error("Failed to parse file:", error);
  }
}

module.exports = { parseSrtToText, parseVttToText };
