const multer = require("multer");
const path = require("node:path");
const AppError = require("../utils/AppError");

const storage = multer.memoryStorage();
const allowedExtensions = new Set([".srt", ".vtt"]);
const allowedMimeTypes = new Set([
  "",
  "application/octet-stream",
  "application/srt",
  "application/x-subrip",
  "application/x-srt",
  "application/vtt",
  "text/plain",
  "text/srt",
  "text/vtt",
  "text/x-vtt",
]);

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const mimeType = String(file.mimetype || "").toLowerCase();
  const hasAllowedExtension = allowedExtensions.has(extension);
  const hasAllowedMimeType = allowedMimeTypes.has(mimeType);

  if (hasAllowedExtension && hasAllowedMimeType) {
    cb(null, true);
  } else {
    cb(
      new AppError("Unsupported file type. Please upload only .srt or .vtt subtitle files.", 415),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 0,
    parts: 2,
    fieldNameSize: 100,
    headerPairs: 50,
  },
});

module.exports = upload;
