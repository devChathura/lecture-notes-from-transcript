const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const test = require("node:test");

const {
  parseSrtToText,
  parseVttToText,
} = require("../src/services/parserService");

const fixturePath = (fileName) => path.join(__dirname, "fixtures", fileName);

test("parseSrtToText removes SRT metadata and HTML tags while keeping words", () => {
  const rawContent = fs.readFileSync(fixturePath("parser.srt"), "utf-8");
  const cleanText = parseSrtToText(rawContent);

  assert.equal(
    cleanText,
    "Welcome to parsing. This cue spans two lines and keeps the words. Important",
  );
});

test("parseVttToText handles WEBVTT headers, missing hours, and HTML tags", () => {
  const rawContent = fs.readFileSync(fixturePath("parser.vtt"), "utf-8");
  const cleanText = parseVttToText(rawContent);

  assert.equal(
    cleanText,
    "Welcome back. This cue has no hour component. Styled text.",
  );
});
