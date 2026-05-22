const { parseSrtToText, parseVttToText } = require("../services/parserService");
const { chunkText } = require("../services/chunkingService");
const { generateStudyGuide } = require("../services/aiService");
const AppError = require("../utils/AppError");

exports.generateNotes = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError("Please upload a subtitle file.", 400);
    }

    const rawContent = req.file.buffer.toString("utf-8");
    const fileName = req.file.originalname.toLowerCase();

    let cleanText = "";
    if (fileName.endsWith(".srt")) {
      cleanText = parseSrtToText(rawContent);
    } else if (fileName.endsWith(".vtt")) {
      cleanText = parseVttToText(rawContent);
    }

    if (!cleanText || cleanText.trim() === "") {
      throw new AppError("The uploaded file contains no readable text.", 400);
    }

    const chunks = await chunkText(cleanText);

    const markdown = await generateStudyGuide(chunks);

    res.status(200).json({
      status: "success",
      metadata: {
        originalName: req.file.originalname,
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

