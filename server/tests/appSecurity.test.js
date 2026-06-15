const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

process.env.NODE_ENV = "test";
process.env.CORS_ORIGIN = "https://allowed.example";
process.env.RATE_LIMIT_MAX = "100";
delete process.env.GEMINI_API_KEY;

const app = require("../src/app");

let server;
let baseUrl;

before(
  () =>
    new Promise((resolve) => {
      server = app.listen(0, "127.0.0.1", () => {
        const address = server.address();
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    }),
);

after(
  () =>
    new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    }),
);

test("health responses include security headers without framework fingerprinting", async () => {
  const response = await fetch(`${baseUrl}/api/health`);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-powered-by"), null);
});

test("CORS only reflects configured origins", async () => {
  const allowedResponse = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: "https://allowed.example" },
  });
  const blockedResponse = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: "https://untrusted.example" },
  });

  assert.equal(
    allowedResponse.headers.get("access-control-allow-origin"),
    "https://allowed.example",
  );
  assert.equal(blockedResponse.headers.get("access-control-allow-origin"), null);
});

test("generation endpoint rejects requests without a file", async () => {
  const response = await fetch(`${baseUrl}/api/v1/generate`, {
    method: "POST",
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.status, "fail");
});

test("generation endpoint rejects binary content renamed as VTT", async () => {
  const formData = new FormData();
  formData.append(
    "file",
    new Blob([Uint8Array.from([0x89, 0x50, 0x00, 0x47])], {
      type: "text/vtt",
    }),
    "renamed.vtt",
  );

  const response = await fetch(`${baseUrl}/api/v1/generate`, {
    method: "POST",
    body: formData,
  });
  const body = await response.json();

  assert.equal(response.status, 415, JSON.stringify(body));
});

test("generation endpoint rejects disallowed MIME types", async () => {
  const formData = new FormData();
  formData.append(
    "file",
    new Blob(["WEBVTT\n\n00:01.000 --> 00:03.000\nLecture content.\n"], {
      type: "image/png",
    }),
    "renamed.vtt",
  );

  const response = await fetch(`${baseUrl}/api/v1/generate`, {
    method: "POST",
    body: formData,
  });

  assert.equal(response.status, 415);
});

test("generation endpoint rejects files above the 5 MB limit", async () => {
  const validPrefix = Buffer.from("1\n00:00:01,000 --> 00:00:03,000\nLecture content.\n");
  const oversizedContent = Buffer.concat([validPrefix, Buffer.alloc(5 * 1024 * 1024, 0x61)]);
  const formData = new FormData();
  formData.append(
    "file",
    new Blob([oversizedContent], { type: "application/x-subrip" }),
    "oversized.srt",
  );

  const response = await fetch(`${baseUrl}/api/v1/generate`, {
    method: "POST",
    body: formData,
  });

  assert.equal(response.status, 413);
});

test("generation endpoint rejects cleaned transcripts above the configured limit", async () => {
  const transcript = `1
00:00:01,000 --> 00:00:03,000
${"Lecture content ".repeat(15000)}
`;
  const formData = new FormData();
  formData.append(
    "file",
    new Blob([transcript], { type: "application/x-subrip" }),
    "long-lecture.srt",
  );

  const response = await fetch(`${baseUrl}/api/v1/generate`, {
    method: "POST",
    body: formData,
  });

  assert.equal(response.status, 413);
});

test("valid subtitles fail safely when the AI service is not configured", async () => {
  const formData = new FormData();
  formData.append(
    "file",
    new Blob(["1\n00:00:01,000 --> 00:00:03,000\nLecture content.\n"], {
      type: "application/x-subrip",
    }),
    "lecture.srt",
  );

  const response = await fetch(`${baseUrl}/api/v1/generate`, {
    method: "POST",
    body: formData,
  });
  const body = await response.json();

  assert.equal(response.status, 503, JSON.stringify(body));
  assert.equal(body.message, "The AI generation service is not configured.");
  assert.equal(body.stack, undefined);
});
