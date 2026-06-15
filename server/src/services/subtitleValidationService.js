const AppError = require("../utils/AppError");

const SRT_TIMECODE_PATTERN = /\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/;
const VTT_TIMECODE_PATTERN = /\d{2}:\d{2}(?::\d{2})?\.\d{3}\s*-->\s*\d{2}:\d{2}(?::\d{2})?\.\d{3}/;

function decodeSubtitleBuffer(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new AppError("The uploaded subtitle file is empty.", 400);
  }

  if (buffer.includes(0)) {
    throw new AppError("The uploaded file is not a supported text subtitle file.", 415);
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer).replace(/^\uFEFF/, "");
  } catch {
    throw new AppError("The uploaded subtitle file must use UTF-8 text encoding.", 415);
  }
}

function validateSubtitleContent(buffer, extension) {
  const rawContent = decodeSubtitleBuffer(buffer);
  const normalizedExtension = String(extension || "").toLowerCase();
  const hasExpectedTimecode =
    normalizedExtension === ".srt"
      ? SRT_TIMECODE_PATTERN.test(rawContent)
      : normalizedExtension === ".vtt"
        ? VTT_TIMECODE_PATTERN.test(rawContent)
        : false;

  if (!hasExpectedTimecode) {
    throw new AppError(
      `The uploaded file does not contain valid ${normalizedExtension || "subtitle"} timecodes.`,
      400,
    );
  }

  return rawContent;
}

module.exports = { validateSubtitleContent };
