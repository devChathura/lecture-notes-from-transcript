const multer = require("multer");
const AppError = require("../utils/AppError");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const isSrt = file.originalname.toLowerCase().endsWith(".srt");
  const isVtt = file.originalname.toLowerCase().endsWith(".vtt");

  if (isSrt || isVtt) {
    cb(null, true);
  } else {
    cb(new AppError("Invalid file type. Please upload only .srt or .vtt files.", 400), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;

