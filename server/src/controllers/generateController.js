const path = require("node:path");
const { parseSrtToText, parseVttToText } = require("../services/parserService");
const { chunkText } = require("../services/chunkingService");
const { generateStudyGuide } = require("../services/aiService");
const { validateSubtitleContent } = require("../services/subtitleValidationService");
const AppError = require("../utils/AppError");

const DEFAULT_MAX_TRANSCRIPT_CHARACTERS = 200000;
const configuredMaxTranscriptCharacters = Number.parseInt(
  process.env.MAX_TRANSCRIPT_CHARACTERS,
  10,
);
const maxTranscriptCharacters =
  Number.isInteger(configuredMaxTranscriptCharacters) && configuredMaxTranscriptCharacters > 0
    ? configuredMaxTranscriptCharacters
    : DEFAULT_MAX_TRANSCRIPT_CHARACTERS;

exports.generateNotes = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError("Please upload a subtitle file.", 400);
    }

    const safeOriginalName = path.basename(req.file.originalname).slice(0, 255);
    const extension = path.extname(safeOriginalName).toLowerCase();
    const rawContent = validateSubtitleContent(req.file.buffer, extension);

    let cleanText = "";
    if (extension === ".srt") {
      cleanText = parseSrtToText(rawContent);
    } else if (extension === ".vtt") {
      cleanText = parseVttToText(rawContent);
    }

    if (!cleanText || cleanText.trim() === "") {
      throw new AppError("The uploaded file contains no readable text.", 400);
    }

    if (cleanText.length > maxTranscriptCharacters) {
      throw new AppError(
        "The transcript is too long to process safely. Please use a shorter subtitle file.",
        413,
      );
    }

    const chunks = await chunkText(cleanText);

    const markdown = await generateStudyGuide(chunks);

    res.status(200).json({
      status: "success",
      metadata: {
        originalName: safeOriginalName,
        chunkCount: chunks.length,
      },
      data: {
        markdown: markdown,
      },
    });
  } catch (error) {
    next(error);
  }
};
