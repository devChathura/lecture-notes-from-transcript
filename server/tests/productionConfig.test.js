const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

process.env.NODE_ENV = "production";
delete process.env.CORS_ORIGIN;
delete process.env.ENABLE_LIVE_GENERATION;

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

test("production CORS fails closed when no origin is configured", async () => {
  const response = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: "https://untrusted.example" },
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), null);
});

test("production live generation defaults to disabled", async () => {
  const response = await fetch(`${baseUrl}/api/v1/generate`, {
    method: "POST",
  });
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.message, "Live AI generation is disabled on this deployment.");
});
