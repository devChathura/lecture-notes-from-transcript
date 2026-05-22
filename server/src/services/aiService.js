const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI;
function getAIClient() {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set in the environment variables!");
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

const MODEL_NAME = "gemini-2.5-flash";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithRetry(model, prompt, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      const isTransient = error.message.includes("503") || error.message.includes("429");
      if (!isTransient || attempt === maxRetries) {
        throw error;
      }
      console.warn(
        `[API] Transient error detected (${error.message}). Retrying ${attempt}/${maxRetries} after delay...`,
      );
      await delay(attempt * 2000);
    }
  }
}

async function extractNotesFromChunk(chunk, chunkIndex) {
  const model = getAIClient().getGenerativeModel({ model: MODEL_NAME });
  const prompt = `You are an expert Teaching Assistant. Review the following transcript chunk (Part ${chunkIndex + 1}).Extract the core educational concepts, definitions, and key arguments.Ignore filler words, conversational tangents, and introductory remarks.Return ONLY raw bullet points. Do not format as a final essay.Transcript Chunk:"${chunk}"`;
  try {
    return await generateWithRetry(model, prompt);
  } catch (error) {
    console.error(`Error extracting chunk ${chunkIndex + 1}:`, error.message);
    return "";
  }
}

async function synthesizeNotes(rawNotesArray) {
  const model = getAIClient().getGenerativeModel({ model: MODEL_NAME });

  const combinedNotes = rawNotesArray.join("\n\n");

  const prompt = `
    You are an expert Academic Architect. I am providing you with chronologically extracted notes from a lecture.
    Your task is to synthesize these points into a single, cohesive, beautifully structured Markdown study guide.

    Requirements:
    1. Use a main title (# Title).
    2. Group related concepts under logical H2 headings (## Heading).
    3. Use bullet points for readability.
    4. Include a distinct "## Key Terminology" section at the end defining technical words used.
    5. Output ONLY valid Markdown. No conversational filler like "Here are your notes:".

    Raw Notes:
    ${combinedNotes}
    `;

  try {
    return await generateWithRetry(model, prompt);
  } catch (error) {
    console.error("Error synthesizing final notes:", error.message);
    throw new Error("Failed to generate final study guide.");
  }
}

async function generateStudyGuide(chunks) {
  if (!chunks || chunks.length === 0) {
    throw new Error("No transcript chunks provided.");
  }

  console.log(`Starting AI extraction for ${chunks.length} chunks...`);
  const rawNotesArray = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`Processing chunk ${i + 1}/${chunks.length}...`);

    const extracted = await extractNotesFromChunk(chunks[i], i);
    if (extracted) {
      rawNotesArray.push(extracted);
    }

    if (i < chunks.length - 1) {
      await delay(1500);
    }
  }
  if (rawNotesArray.length === 0) {
    throw new Error("AI failed to extract any meaningful notes from the transcript.");
  }
  console.log("Extraction complete. Starting final synthesis...");

  const finalMarkdown = await synthesizeNotes(rawNotesArray);
  return finalMarkdown;
}

module.exports = { generateStudyGuide };

// === TEMPORARY Proof of Concept TESTING ===
if (require.main === module) {
  const path = require("path");
  require("dotenv").config({ path: path.resolve(__dirname, "../../config.env") });
  console.log(
    process.env.GEMINI_API_KEY ? "GEMINI_API_KEY is set via dotenv" : "GEMINI_API_KEY is NOT set",
  );

  const mockChunks = [
    "Today we're starting our module on Big O Notation. It's really just a mathematical way to describe how the runtime of an algorithm scales as the input grows.",
    "For example, an algorithm that searches through an array one by one has an O(n) runtime, known as linear time. If it checks a hash map, it's O(1), or constant time.",
  ];

  generateStudyGuide(mockChunks)
    .then((markdown) => {
      console.log("\n=== FINAL AI OUTPUT ===");
      console.log(markdown);
    })
    .catch((err) => console.error("Test failed:", err));
}

