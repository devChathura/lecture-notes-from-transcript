const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

process.env.NODE_ENV = "test";
process.env.RATE_LIMIT_MAX = "1";
process.env.RATE_LIMIT_WINDOW_MS = "60000";

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

test("generation endpoint rate-limits repeated requests", async () => {
  const firstResponse = await fetch(`${baseUrl}/api/v1/generate`, {
    method: "POST",
  });
  const secondResponse = await fetch(`${baseUrl}/api/v1/generate`, {
    method: "POST",
  });
  const secondBody = await secondResponse.json();

  assert.equal(firstResponse.status, 400);
  assert.equal(secondResponse.status, 429);
  assert.equal(secondBody.message, "Too many generation requests. Please try again later.");
});
