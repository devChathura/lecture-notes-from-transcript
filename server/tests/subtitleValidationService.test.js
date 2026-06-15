const assert = require("node:assert/strict");
const test = require("node:test");
const { validateSubtitleContent } = require("../src/services/subtitleValidationService");

test("validateSubtitleContent accepts valid UTF-8 SRT content", () => {
  const content = Buffer.from("1\n00:00:01,000 --> 00:00:03,000\nWelcome to the lecture.\n");

  assert.match(validateSubtitleContent(content, ".srt"), /Welcome/);
});

test("validateSubtitleContent accepts valid UTF-8 VTT content", () => {
  const content = Buffer.from("WEBVTT\n\n00:01.000 --> 00:03.000\nWelcome to the lecture.\n");

  assert.match(validateSubtitleContent(content, ".vtt"), /WEBVTT/);
});

test("validateSubtitleContent rejects binary content renamed as subtitles", () => {
  assert.throws(
    () => validateSubtitleContent(Buffer.from([0x89, 0x50, 0x00, 0x47]), ".vtt"),
    (error) => error.statusCode === 415,
  );
});

test("validateSubtitleContent rejects plain text without subtitle timecodes", () => {
  assert.throws(
    () =>
      validateSubtitleContent(Buffer.from("This is plain text, not an SRT subtitle file."), ".srt"),
    (error) => error.statusCode === 400,
  );
});
