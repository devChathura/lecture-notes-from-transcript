const assert = require("node:assert/strict");
const test = require("node:test");
const { chunkText } = require("../src/services/chunkingService");

test("chunkText splits text asynchronously using LangChain", async () => {
  const text = "This is a long sentence for testing";

  const chunks = await chunkText(text, 15, 5);

  assert.ok(chunks.length > 1, "Should create multiple chunks");

  assert.equal(chunks[0], "This is a long");

  assert.ok(chunks[0].includes("long"));
  assert.ok(chunks[1].includes("long"));
});

test("chunkText handles text smaller than the max chunk size", async () => {
  const text = "Short text.";
  const chunks = await chunkText(text, 4000, 400);

  assert.equal(chunks.length, 1);
  assert.equal(chunks[0], "Short text.");
});

test("chunkText handles empty input gracefully", async () => {
  const chunks = await chunkText("   ", 4000, 400);
  assert.equal(chunks.length, 0);
});

test("chunkText respects custom lecture separators", async () => {
  const text = "This is the first sentence. And here is the second sentence!";

  const chunks = await chunkText(text, 27, 0);

  assert.ok(chunks.length >= 2, "Should split into at least two sentences");
  assert.equal(chunks[0].trim(), "This is the first sentence.");
});
