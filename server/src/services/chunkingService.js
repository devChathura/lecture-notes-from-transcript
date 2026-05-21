const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");

// const LECTURE_SEPARATORS = ["\n\n", "\n", ". ", "? ", "! ", " ", ""];

/**
 * Splits text recursively (paragraphs -> sentences -> words) to preserve semantic meaning,
 * used the industry-standard LangChain text splitter.
 *
 * @param {string} text - The cleaned transcript text
 * @param {number} maxChunkSize - Max characters per chunk
 * @param {number} overlap - Character overlap between chunks
 * @returns {Promise<string[]>} - An array of text chunks
 */

async function chunkText(text, maxChunkSize = 4000, overlap = 400) {
  if (!text || text.trim() === "") return [];

  try {
    const formattedText = text.replace(/([.?!])\s+/g, "$1\n");
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: maxChunkSize,
      chunkOverlap: overlap,
      //   separators: LECTURE_SEPARATORS,
    });

    const chunks = await splitter.splitText(text);
    return chunks;
  } catch (error) {
    console.error("Error within chunkText service:", error);
    throw new Error(`Chunking failed: ${error.message}`);
  }
}

module.exports = { chunkText };
