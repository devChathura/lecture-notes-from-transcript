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

const MODEL_NAME = "gemini-1.5-flash";
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
      await delay(attempt * 4000);
    }
  }
}

async function generateStudyGuide(chunks) {
  if (!chunks || chunks.length === 0) {
    throw new Error("No transcript chunks provided.");
  }

  console.log("Sending entire transcript to Gemini for single-pass synthesis...");

  const model = getAIClient().getGenerativeModel({ model: MODEL_NAME });

  const combinedTranscript = chunks.join("\n\n");

  const prompt = `
    You are an expert Academic Architect. I am providing you with a complete lecture transcript.
    Your task is to extract the core educational concepts and synthesize them into a single, cohesive, beautifully structured Markdown study guide.

    Requirements:
    1. Use a main title (# Title).
    2. Group related concepts under logical H2 headings (## Heading).
    3. Use bullet points for readability.
    4. Ignore filler words, conversational tangents, and introductory remarks.
    5. Include a distinct "## Key Terminology" section at the end defining technical words used.
    6. Output ONLY valid Markdown. No conversational filler like "Here are your notes:".

    Transcript:
    ${combinedTranscript}
  `;

  try {
    const finalMarkdown = await generateWithRetry(model, prompt);
    console.log("Synthesis complete!");
    return finalMarkdown;
  } catch (error) {
    console.error("Error synthesizing final notes:", error.message);
    throw new Error("Failed to generate final study guide.");
  }
}

module.exports = { generateStudyGuide };

// === TEMPORARY Proof of Concept TESTING ===
if (require.main === module) {
  const path = require("path");
  require("dotenv").config({ path: path.resolve(__dirname, "../../config.env") });

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
