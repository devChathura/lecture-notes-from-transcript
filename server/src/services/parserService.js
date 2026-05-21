function parseSrtToText(rawContent) {
  let text = rawContent.replace(/\r\n/g, "\n");
  const srtPattern =
    /^\d+\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}\n/gm;
  text = text.replace(srtPattern, "");
  text = text.replace(/<[^>]+>/g, "");
  return text.replace(/\n+/g, " ").trim();
}

function parseVttToText(rawContent) {
  let text = rawContent.replace(/\r\n/g, "\n");
  text = text.replace(/^WEBVTT.*\n*/, "");
  const vttPattern =
    /^(?:.+?\n)?\d{2}:\d{2}(?::\d{2})?\.\d{3} --> \d{2}:\d{2}(?::\d{2})?\.\d{3}.*\n/gm;
  text = text.replace(vttPattern, "");
  text = text.replace(/<[^>]+>/g, "");
  return text.replace(/\n+/g, " ").trim();
}

module.exports = { parseSrtToText, parseVttToText };
