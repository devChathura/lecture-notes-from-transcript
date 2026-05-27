const express = require("express");
const generateController = require("../controllers/generateController");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post("/", upload.single("file"), generateController.generateNotes);

module.exports = router;

