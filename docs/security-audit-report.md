# Lecture Companion Security Audit Implementation Report

## 1. Executive Summary

The Lecture Companion security audit reviewed the React/Vite frontend, the
Node.js/Express backend, the subtitle upload boundary, Gemini integration,
public demo behavior, browser persistence, error handling, dependencies, and
production configuration.

No critical security issues remain in the audited implementation.

The audit introduced several layers of protection:

- Public production AI generation now defaults to disabled unless it is
  deliberately enabled with `ENABLE_LIVE_GENERATION=true`.
- The generation endpoint is rate-limited to reduce repeated Gemini requests
  and quota abuse.
- The backend now validates uploaded subtitle files independently of the
  frontend by checking file extension, MIME hint, UTF-8 decoding, binary
  content, subtitle timecodes, multipart limits, file count, and file size.
- Cleaned transcripts are limited before they can be sent to Gemini.
- Production CORS behavior now fails closed when no allowed origin is
  configured.
- Gemini system instructions are separated from transcript source material,
  reducing the chance that transcript content can override the application's
  intended generation behavior.
- Gemini calls have a configured timeout and provider failures are mapped to
  controlled API errors.
- Unexpected production errors no longer expose stack traces or raw internal
  error details.
- Backend and static frontend security headers were added.
- Cached browser data is validated more strictly before restoration.
- Detailed frontend generation errors are logged only in development.
- Server lint tooling is now declared explicitly, making clean installations
  and CI checks reproducible.

Verification completed during the audit:

- 21 server tests passed.
- Client lint passed.
- Server lint passed.
- The client production build passed.
- Client, server, and root dependency audits reported zero known
  vulnerabilities.
- No committed Google API key pattern was found.
- Local environment files are ignored by Git.
- The public demo production bundle did not contain the generation endpoint or
  Gemini secret markers.
- The static security header configuration was included in the production
  build.

The normal local backend-powered workflow remains available. The primary
behavioral difference is that a production backend must now explicitly opt in
to live generation and configure its allowed frontend origin.

## 2. Audit Scope

The audit covered the following areas.

### Frontend

- Vite environment variables.
- Public demo mode behavior.
- API request behavior in demo and live modes.
- Generated-note persistence in `localStorage`.
- Cached-data validation and restoration.
- User-facing generation errors and developer-only diagnostics.
- Production build output.
- Static deployment security headers.
- Dependency vulnerabilities.

### Backend

- Express application configuration.
- `POST /api/v1/generate`.
- Multer memory storage and multipart limits.
- Subtitle extension and MIME validation.
- UTF-8 decoding and subtitle content validation.
- Cleaned-transcript size controls.
- Gemini API key handling.
- Gemini prompt construction.
- Gemini timeout, retry, and provider-error mapping.
- CORS behavior in development and production.
- Rate limiting and quota-abuse controls.
- Error logging and production response sanitization.
- Security headers and framework fingerprinting.
- Dependency vulnerabilities.

### Configuration and production readiness

- Git ignore rules for local environment files.
- Placeholder-only environment examples.
- Required production environment variables.
- Node.js runtime requirement.
- Reproducible lint dependencies.
- README deployment and privacy guidance.
- Public demo and production backend separation.

## 3. Threat Model

The audit focused on risks relevant to a public portfolio application that can
cause paid or quota-limited AI work.

### 3.1 Anonymous Gemini quota consumption

If a public backend accepts unrestricted generation requests, anonymous users
can repeatedly invoke Gemini using the project owner's API key. Even when the
frontend is in demo mode, a publicly reachable backend endpoint can be called
directly.

Controls added:

- Production live generation defaults to disabled.
- The generation endpoint is rate-limited.
- Cleaned transcript length is capped.
- Gemini requests have a timeout.
- Public demo builds do not include the generation endpoint.

### 3.2 Malicious or malformed file uploads

Frontend validation can be bypassed. An attacker can submit files directly to
the API, rename binary content with a `.srt` or `.vtt` extension, send an
unexpected MIME type, submit too many multipart fields, or upload an oversized
file.

Controls added:

- Backend extension allowlist.
- MIME hint allowlist.
- UTF-8 decoding with fatal error handling.
- NUL-byte rejection for likely binary files.
- SRT/VTT timecode checks.
- One-file and multipart limits.
- 5 MB backend file-size limit.
- Cleaned transcript character limit.

### 3.3 Oversized transcript and AI-cost abuse

A 5 MB text file can still contain far more transcript text than is reasonable
for one AI request. In the current architecture, transcript chunks are joined
for one final synthesis request. File size alone therefore does not provide a
sufficient AI-input budget.

Control added:

- `MAX_TRANSCRIPT_CHARACTERS`, defaulting to `200000`, rejects excessive
  cleaned input before chunking and Gemini generation.

### 3.4 Prompt injection through subtitle content

Lecture transcripts are untrusted text. A subtitle could contain text such as
"ignore previous instructions" or request a different output. When trusted
instructions and transcript text are placed in one undifferentiated prompt,
the model has less structural guidance about which content is authoritative.

Controls added:

- Trusted behavior is supplied through Gemini's `systemInstruction`.
- Transcript content is supplied as source material between explicit source
  delimiters.
- The system instruction states that transcript commands and role changes must
  not be followed.

This reduces prompt-injection risk but does not mathematically eliminate it.
Model output must still be treated as generated content.

### 3.5 Secret exposure

The Gemini key must never appear in Vite environment variables, browser code,
build output, logs, or committed environment files.

Verified controls:

- `GEMINI_API_KEY` is used only by the server.
- Tracked files contain only placeholder values.
- `client/.env.local` and `server/config.env` are ignored.
- Demo and live client bundles contained no Gemini key markers.

### 3.6 Overly permissive CORS

The previous backend reflected arbitrary origins when `CORS_ORIGIN` was empty.
That behavior could unintentionally allow any browser origin to read responses
from a deployed API.

Control added:

- Production uses an empty allowlist when `CORS_ORIGIN` is not configured.
- Development retains explicit localhost defaults.
- Multiple configured origins may be supplied as a comma-separated list.

CORS is a browser access control, not authentication. Requests without an
`Origin` header remain possible for command-line and server-to-server clients.

### 3.7 Stack trace and internal error leakage

Raw exceptions can expose file paths, dependency details, request behavior, or
provider internals.

Controls added:

- Unknown production server failures return a generic message.
- Stack traces and structured error details are included only in development.
- Known operational errors use intentionally written public messages.
- Frontend technical generation details remain development-only.

### 3.8 Unsafe localStorage restoration

`localStorage` is controlled by the browser user and can contain stale,
corrupted, manually modified, or unexpectedly large data.

Controls added:

- Cached Markdown is limited to `500000` characters.
- Cached file names are limited to `255` characters.
- Cached file size must be finite, non-negative, and no more than 5 MB.
- Existing checks for version, extension, timestamp, source, and required
  strings remain in place.
- Invalid cache entries are removed instead of rendered.

### 3.9 Repeated generation requests

Even valid small files can be submitted repeatedly to consume API quota.

Control added:

- `express-rate-limit` protects `/api/v1/generate`.
- Default policy: 10 requests per 15-minute window per derived client IP.
- Standard rate-limit headers are returned.

### 3.10 Missing response hardening and fingerprinting

Default framework headers and missing browser security policies provide
unnecessary information or permit avoidable browser behaviors.

Controls added:

- Express `X-Powered-By` is disabled.
- Helmet is applied to backend responses.
- Static frontend headers define CSP, framing protection, MIME sniffing
  protection, referrer policy, permissions policy, COOP, and legacy
  cross-domain policy restrictions.

## 4. Summary of Issues Fixed

| Severity | Issue                                                                                              | Fix Implemented                                                                                                                                | Files Changed                                                                                                                                         | Status    |
| -------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| High     | A deployed backend could expose the owner's Gemini quota even when the frontend used demo mode.    | Added a production kill switch. Live generation defaults off unless `ENABLE_LIVE_GENERATION=true`.                                             | `server/src/app.js`, `server/config.env.example`, `README.md`                                                                                         | Completed |
| High     | Repeated requests and unusually large transcript content could consume Gemini quota.               | Added endpoint rate limiting, cleaned transcript character limits, multipart limits, and a provider timeout.                                   | `server/src/app.js`, `server/src/controllers/generateController.js`, `server/src/middlewares/uploadMiddleware.js`, `server/src/services/aiService.js` | Completed |
| Medium   | Production CORS could become permissive when no origin was configured.                             | Production now uses an empty origin allowlist by default; development uses explicit localhost origins.                                         | `server/src/app.js`, `server/config.env.example`, `README.md`                                                                                         | Completed |
| Medium   | Backend upload validation relied mainly on the filename extension.                                 | Added extension and MIME allowlists, UTF-8 validation, binary rejection, subtitle timecode validation, file count, multipart, and 5 MB limits. | `server/src/middlewares/uploadMiddleware.js`, `server/src/services/subtitleValidationService.js`, `server/src/controllers/generateController.js`      | Completed |
| Medium   | Trusted AI instructions and transcript text were combined in one prompt.                           | Moved trusted rules into `systemInstruction` and marked transcript content as untrusted source material.                                       | `server/src/services/aiService.js`                                                                                                                    | Completed |
| Medium   | Gemini requests had no explicit request timeout and provider failures were inconsistently exposed. | Added `AI_REQUEST_TIMEOUT_MS`, controlled retry logic, empty-response checks, and 502/503/504 mappings.                                        | `server/src/services/aiService.js`, `server/config.env.example`                                                                                       | Completed |
| Medium   | Unexpected production errors could expose raw internal messages or stack traces.                   | Sanitized unknown production 5xx responses, limited production logging, and retained detailed diagnostics only in development.                 | `server/src/app.js`, `server/src/services/chunkingService.js`, `client/src/pages/TryPage.jsx`                                                         | Completed |
| Low      | The API lacked standard security middleware and explicit body limits.                              | Added Helmet, 32 KB JSON/form limits, URL-encoded parameter limits, 404 handling, and framework fingerprint removal.                           | `server/src/app.js`, `server/package.json`                                                                                                            | Completed |
| Low      | Static frontend responses lacked a deployment header policy.                                       | Added CSP, COOP, MIME sniffing protection, frame denial, referrer policy, permissions policy, and cross-domain policy restrictions.            | `client/public/_headers`                                                                                                                              | Completed |
| Low      | Cached note validation did not bound Markdown, filename, or file-size metadata.                    | Added maximum cached Markdown length, filename length, and file-size validation.                                                               | `client/src/pages/TryPage.jsx`                                                                                                                        | Completed |
| Low      | Full frontend request errors were logged in production browser consoles.                           | Restricted detailed generation error logging to `import.meta.env.DEV`.                                                                         | `client/src/pages/TryPage.jsx`                                                                                                                        | Completed |
| Low      | The server lint script depended on tooling not declared in the server package.                     | Added explicit ESLint, Prettier, and related development dependencies plus a Node.js engine requirement.                                       | `server/package.json`, `server/package-lock.json`                                                                                                     | Completed |

## 5. Detailed File-by-File Change Explanation

### File: `server/src/app.js`

#### What changed

- Added `helmet`.
- Added `express-rate-limit`.
- Added production environment detection.
- Added `ENABLE_LIVE_GENERATION` evaluation.
- Added comma-separated CORS origin parsing.
- Added localhost development origin defaults.
- Changed production CORS fallback from permissive to an empty allowlist.
- Added optional `TRUST_PROXY_HOPS` handling.
- Disabled `X-Powered-By`.
- Added Helmet middleware.
- Added a 32 KB JSON body limit.
- Added a 32 KB URL-encoded body limit and a 20-parameter limit.
- Restricted CORS methods and headers.
- Added a 10-minute CORS preflight cache.
- Added a generation rate limiter.
- Added a server-side live-generation gate before rate limiting and routing.
- Added an explicit JSON 404 response.
- Expanded Multer error mapping.
- Added body-parser oversized-request mapping.
- Derived `fail` or `error` response status from the HTTP status code.
- Added structured server-side logging for 5xx failures.
- Suppressed error logging during tests.
- Sanitized unknown production 5xx messages.
- Limited development error details to error name, code, and stack.

#### Why it changed

`app.js` is the backend's central trust boundary. The previous configuration
allowed arbitrary browser origins when no CORS origin was configured, had no
request rate limit, no production live-generation control, no general body
limits, and returned `err.message` for every failure.

#### Architectural decision

The controls were placed at the application boundary so they apply before
business logic:

- The kill switch precedes the generation route.
- Rate limiting applies only to the expensive endpoint, not the health route.
- CORS applies globally.
- Helmet and body limits apply before routing.
- Centralized error handling keeps service and controller code focused on
  raising operational errors.

This is preferable to duplicating checks inside the controller.

#### Security impact

- Prevents accidental public activation of Gemini usage.
- Reduces repeated-request abuse.
- Prevents permissive production CORS fallback.
- Reduces oversized non-multipart request risk.
- Removes Express fingerprinting.
- Adds standard response hardening.
- Prevents unknown internal errors from being returned verbatim.

#### App flow impact

- Landing page: no effect.
- Public demo frontend: no effect; it still uses local sample data.
- Local backend flow: still works by default in non-production unless
  `ENABLE_LIVE_GENERATION=false`.
- Production backend flow: now requires
  `ENABLE_LIVE_GENERATION=true`.
- Production cross-origin frontend access: now requires the frontend origin in
  `CORS_ORIGIN`.
- Users exceeding the rate limit now receive HTTP 429 with a friendly message.

#### Edge cases handled

- Missing or invalid positive integer environment values fall back to safe
  defaults.
- Requests without an `Origin` header remain available for health checks,
  command-line tools, and server-to-server clients.
- Multiple CORS origins can be comma-separated.
- Reverse proxy trust is enabled only when a positive hop count is supplied.
- Multer file-size, file-count, field-count, part-count, and unexpected-field
  errors receive controlled status codes.
- JSON or form bodies above 32 KB receive HTTP 413.
- Unknown endpoints receive JSON HTTP 404.

#### Related tests

- `server/tests/appSecurity.test.js`
- `server/tests/productionConfig.test.js`
- `server/tests/rateLimit.test.js`

### File: `server/src/middlewares/uploadMiddleware.js`

#### What changed

- Replaced suffix-only checks with `path.extname`.
- Added an explicit `.srt` and `.vtt` extension allowlist.
- Added a MIME hint allowlist covering common SRT/VTT text MIME variants.
- Changed unsupported file responses to HTTP 415.
- Kept Multer memory storage.
- Expanded Multer limits:
  - 5 MB file size.
  - One file.
  - Zero text fields.
  - Two multipart parts, allowing the file part and multipart termination
    behavior.
  - 100-character field-name limit.
  - 50 header pairs.

#### Why it changed

Filename extension checks alone are easy to bypass. Multipart requests also
need explicit structural limits to avoid unnecessary parsing and memory use.

#### Architectural decision

The middleware performs inexpensive metadata checks before the controller
decodes or parses the file. MIME is treated only as a hint because clients can
spoof it; the separate content-validation service performs the stronger
checks.

Memory storage remains appropriate for this project because:

- The endpoint accepts one file.
- The file is capped at 5 MB.
- The file is processed immediately.
- No permanent upload is required.

#### Security impact

- Rejects clearly unsupported content earlier.
- Reduces multipart abuse.
- Prevents multiple-file submissions.
- Avoids writing untrusted uploads to disk.

#### App flow impact

Valid `.srt` and `.vtt` uploads continue to work. Some files that previously
passed because of their extension alone may now be rejected if the MIME hint
is clearly incompatible.

#### Edge cases handled

- Browsers and operating systems report subtitle MIME types inconsistently, so
  common values such as `text/plain`, `text/vtt`,
  `application/x-subrip`, and `application/octet-stream` are allowed.
- Empty MIME hints are accepted, then checked by content validation.
- An image renamed to `.vtt` with `image/png` is rejected.

#### Related tests

- MIME rejection in `server/tests/appSecurity.test.js`.
- Binary-content rejection in `server/tests/appSecurity.test.js`.
- Oversized-file rejection in `server/tests/appSecurity.test.js`.

### File: `server/src/services/subtitleValidationService.js`

#### What changed

This new service:

- Rejects empty or non-Buffer input.
- Rejects NUL bytes as a binary-content signal.
- Decodes with `TextDecoder("utf-8", { fatal: true })`.
- Removes a UTF-8 byte-order mark when present.
- Rejects invalid UTF-8.
- Defines SRT and VTT timecode patterns.
- Requires timecodes appropriate to the selected extension.
- Returns decoded text only after validation succeeds.

#### Why it changed

Extension and MIME checks cannot prove that a file is a text subtitle. A
renamed binary file or plain text document must be rejected before parser and
AI processing.

#### Architectural decision

Content validation is isolated in a service so it can be tested independently
and reused without coupling it to Express or Multer.

The validator checks structural evidence rather than attempting a full subtitle
parser rewrite. Existing parser behavior remains responsible for extracting
clean transcript text.

#### Security impact

- Blocks obvious binary uploads.
- Blocks invalid text encoding.
- Blocks plain text masquerading as SRT/VTT.
- Prevents malformed content from reaching downstream parsing and Gemini.

#### App flow impact

Valid UTF-8 SRT and VTT files continue through the same parser pipeline.
Malformed, binary, incorrectly encoded, or timecode-free files are rejected
earlier with HTTP 400 or 415.

#### Edge cases handled

- UTF-8 BOM.
- Empty files.
- NUL-containing files.
- VTT timestamps with or without an hours component.
- SRT comma-based milliseconds.
- Extension and timecode-format mismatch.

#### Related tests

- `server/tests/subtitleValidationService.test.js`
- Binary upload integration coverage in
  `server/tests/appSecurity.test.js`

### File: `server/src/controllers/generateController.js`

#### What changed

- Sanitizes the uploaded filename with `path.basename`.
- Limits returned filename metadata to 255 characters.
- Extracts the extension with `path.extname`.
- Calls `validateSubtitleContent` before parsing.
- Selects the existing SRT or VTT parser from the validated extension.
- Adds `MAX_TRANSCRIPT_CHARACTERS`, defaulting to `200000`.
- Rejects excessive cleaned transcript text with HTTP 413.
- Returns the sanitized filename in response metadata.

#### Why it changed

The controller is the correct point to connect transport-level file metadata,
content validation, parsing, transcript budgeting, chunking, and AI
generation.

The transcript limit is necessary because file size and Gemini input size are
different concerns. A dense text file under 5 MB could still create a costly
request.

#### Architectural decision

Validation order is intentionally cheap-to-expensive:

1. Multer metadata and size checks.
2. Filename sanitization.
3. UTF-8 and subtitle structure checks.
4. Existing parsing and cleanup.
5. Cleaned transcript character limit.
6. Chunking.
7. Gemini generation.

This prevents expensive work when earlier checks fail.

#### Security impact

- Reduces path-like filename metadata exposure.
- Prevents invalid content from reaching the parser.
- Prevents excessive cleaned input from reaching Gemini.
- Reduces quota and memory abuse.

#### App flow impact

The successful response shape remains unchanged:

- `status`
- `metadata.originalName`
- `metadata.chunkCount`
- `data.markdown`

The only visible difference is stricter rejection of malformed or excessive
input.

#### Edge cases handled

- Missing file.
- Empty cleaned transcript.
- Overlong original filename.
- Directory components in client-provided filename.
- Oversized cleaned transcript.

#### Related tests

- Missing file, binary file, MIME mismatch, 5 MB limit, transcript limit, and
  missing Gemini configuration in `server/tests/appSecurity.test.js`.

### File: `server/src/services/aiService.js`

#### What changed

- Missing `GEMINI_API_KEY` now raises an operational HTTP 503 error instead of
  logging a warning and constructing a client with an undefined key.
- Added `AI_REQUEST_TIMEOUT_MS`, defaulting to `120000`.
- Added a dedicated system instruction.
- The system instruction treats transcript content as untrusted source
  material.
- Generation output is constrained to Markdown structure.
- Added a provider-status extraction helper.
- Retry logic now uses parsed provider status.
- Retries are limited to transient 429, 500, 502, and 503 statuses.
- Retry logs contain provider status and timing, not transcript content.
- Gemini model configuration includes:
  - `maxOutputTokens: 8192`
  - `temperature: 0.2`
  - request timeout
- Transcript content is placed between
  `SOURCE_TRANSCRIPT_START` and `SOURCE_TRANSCRIPT_END`.
- Empty provider responses are rejected.
- Provider errors are mapped to operational 502, 503, or 504 errors.
- Raw provider errors are preserved as `cause` for server-side debugging.
- Normal request start/completion logs were removed.

#### Why it changed

Gemini is both a cost boundary and an untrusted external dependency. Calls need
bounded duration, controlled retries, safe error messages, and clearer
instruction hierarchy.

#### Architectural decision

Trusted instructions are supplied through Gemini's supported
`systemInstruction` field. The transcript is supplied separately as source
content.

Retries remain inside the AI service because provider-specific retry decisions
belong next to the provider adapter. HTTP-facing error messages are expressed
as `AppError` so the centralized Express error handler can safely return them.

#### Security impact

- Reduces prompt-injection risk.
- Prevents indefinite provider waits.
- Avoids retrying timeouts that may already have consumed provider work.
- Prevents raw Gemini errors from reaching users.
- Avoids logging transcript content.
- Fails clearly when the backend key is not configured.

#### App flow impact

Normal local generation still calls `gemini-2.5-flash` and returns Markdown.
Transient provider failures may retry up to three attempts. Users receive
friendlier 502, 503, or 504 errors instead of raw SDK messages.

#### Edge cases handled

- Missing API key.
- Empty chunk list.
- Empty Gemini response.
- Provider rate limiting.
- Temporary provider failures.
- Provider timeout.
- Unknown provider failure.

#### Related tests

- Missing Gemini configuration is covered by
  `server/tests/appSecurity.test.js`.
- Direct provider calls are not made by the automated test suite.

### File: `server/src/services/chunkingService.js`

#### What changed

- Full error-object logging was removed.
- A concise development-only error message is logged.
- Existing error propagation with `cause` remains.

#### Why it changed

Full error objects can contain unnecessary internal details. Production logs
should contain the minimum information needed to diagnose a failure.

#### Architectural decision

The service keeps its existing error contract but limits logging locally.
Centralized application error handling remains responsible for public
responses.

#### Security impact

- Reduces accidental production log exposure.
- Preserves development diagnostics.

#### App flow impact

No successful-flow change. Chunking failures still propagate to the global
error handler.

#### Edge cases handled

- Development receives a concise message.
- Test and production modes do not emit this local chunking log.

#### Related tests

- Existing `server/tests/chunkingService.test.js` continued to pass.

### File: `server/src/routes/generateRoutes.js`

#### What changed

No routing behavior changed. The current diff only removes an extra trailing
blank line.

#### Why it changed

This is formatter-only cleanup produced while verifying server formatting.

#### Architectural decision

The route continues to compose:

1. `upload.single("file")`
2. `generateController.generateNotes`

Application-wide kill-switch and rate-limit middleware are intentionally
mounted in `server/src/app.js`.

#### Security impact

None directly.

#### App flow impact

None.

#### Edge cases handled

None added in this file.

#### Related tests

The route is exercised by all generation integration tests in
`server/tests/appSecurity.test.js` and `server/tests/rateLimit.test.js`.

### File: `server/package.json`

#### What changed

- Added `engines.node: ">=18"`.
- Added runtime dependencies:
  - `helmet`
  - `express-rate-limit`
- Added explicit development dependencies:
  - `@eslint/js`
  - `eslint`
  - `eslint-config-prettier`
  - `eslint-plugin-prettier`
  - `globals`
  - `prettier`

#### Why it changed

The backend now depends on security middleware. The server also already had
lint and format scripts/configuration but did not declare the tools required to
run them from a clean server installation.

Node 18 or newer is required by the installed middleware and by the test suite's
built-in `fetch`, `FormData`, `Blob`, and `node:test` usage.

#### Architectural decision

Security middleware is kept as direct server dependencies. Build-quality tools
are development-only dependencies.

#### Security impact

- Enables Helmet and rate limiting.
- Makes lint verification reproducible in CI and clean environments.
- Reduces runtime-version ambiguity.

#### App flow impact

No user-facing flow change. Server installation includes additional packages.

#### Edge cases handled

- Fresh `server/npm install` can now run `npm run lint` without depending on
  packages installed elsewhere in the repository.

#### Related tests

- Server lint passed after a clean dependency declaration.
- Dependency audit reported zero known vulnerabilities.

### File: `server/package-lock.json`

#### What changed

The lockfile records exact dependency versions and transitive packages for:

- Helmet.
- express-rate-limit.
- The explicit ESLint/Prettier development toolchain.
- The Node.js engine metadata from `package.json`.

#### Why it changed

Lockfile updates are required for deterministic installation of the added
runtime and development dependencies.

#### Architectural decision

The lockfile remains committed so local, CI, and production installs resolve
the audited package graph.

#### Security impact

- Supports reproducible dependency installation.
- Makes future dependency audits compare against a known graph.

#### App flow impact

No runtime behavior beyond the added middleware.

#### Edge cases handled

- Clean installs no longer depend on the root workspace's lint packages.

#### Related tests

- `npm audit` completed with zero known vulnerabilities after lockfile update.

### File: `server/config.env.example`

#### What changed

Added documented placeholders/defaults:

- `NODE_ENV=development`
- `ENABLE_LIVE_GENERATION=true`
- `TRUST_PROXY_HOPS=0`
- `RATE_LIMIT_WINDOW_MS=900000`
- `RATE_LIMIT_MAX=10`
- `MAX_TRANSCRIPT_CHARACTERS=200000`
- `AI_REQUEST_TIMEOUT_MS=120000`

Existing entries remain:

- `PORT=5001`
- placeholder `GEMINI_API_KEY`
- `CORS_ORIGIN=http://localhost:5173`

#### Why it changed

Security behavior must be deployable and understandable without reading the
source code.

#### Architectural decision

The example is configured for local development. Production recommendations
are documented separately:

- Do not expose a real key in the example.
- Leave live generation disabled unless intentionally deploying it.
- Configure the exact production frontend origin.
- Configure proxy hops only when the deployment topology is known.

#### Security impact

- Reduces insecure or accidental production configuration.
- Documents quota and request-budget controls.

#### App flow impact

Local developers who copy the example retain live local generation after adding
their own Gemini key.

#### Edge cases handled

- Safe numeric defaults remain in code if values are missing or invalid.

#### Related tests

- Production default behavior is covered by
  `server/tests/productionConfig.test.js`.

### File: `client/src/pages/TryPage.jsx`

#### What changed

- Added `MAX_CACHED_MARKDOWN_LENGTH = 500000`.
- Added `MAX_CACHED_FILE_NAME_LENGTH = 255`.
- Added `MAX_UPLOAD_SIZE = 5 * 1024 * 1024`.
- Extended localStorage validation to enforce those bounds.
- Restricted full generation error logging to Vite development mode.

Existing security-relevant behavior was retained:

- Demo mode returns before `generateStudyGuide`.
- Errors are normalized to user-friendly messages.
- Raw technical details appear only in development.
- Invalid localStorage entries are removed.
- The actual `File` object is not persisted.
- Users can clear saved notes.

#### Why it changed

Browser storage is untrusted input. Existing validation checked structure and
types but did not bound the largest stored strings or metadata values.

Production browser consoles also did not need full Axios/request errors.

#### Architectural decision

Validation remains colocated with the existing persistence helpers to avoid a
parallel storage model. Development keeps full diagnostics while production
keeps the user-facing normalized error path.

#### Security impact

- Reduces rendering and memory risk from manipulated cache entries.
- Prevents implausible file metadata from being restored.
- Reduces production console exposure of request internals.

#### App flow impact

- Valid saved notes continue to restore.
- Invalid or excessively large cache entries are cleared.
- Copy, download, upload, generation, demo, and restored-note behavior are
  unchanged.
- User-facing errors remain unchanged.

#### Edge cases handled

- Oversized cached Markdown.
- Oversized cached filenames.
- Negative, non-finite, or larger-than-5-MB cached file sizes.
- Invalid JSON and stale schema data.
- Development versus production logging.

#### Related tests

No new automated client tests were added. Client behavior was verified through
lint, production builds, bundle inspection, and the existing manual demo flow.

### File: `client/public/_headers`

#### What changed

Added a static-host header policy:

- `Content-Security-Policy`
- `Cross-Origin-Opener-Policy: same-origin`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` disabling camera, geolocation, and microphone
- `X-Permitted-Cross-Domain-Policies: none`

The CSP:

- Defaults resources to same origin.
- Restricts scripts to same origin.
- Allows styles from same origin and inline styles required by the current
  frontend tooling/design.
- Allows API connections to same origin and HTTPS origins.
- Disallows objects.
- Disallows framing.
- Restricts form actions and base URLs.

#### Why it changed

The frontend is a static application, so its browser security policy must be
configured at the hosting layer rather than through Express.

#### Architectural decision

The `_headers` format is suitable for Netlify-style static hosting. The policy
is kept in `public` so Vite copies it into `dist`.

#### Security impact

- Reduces clickjacking risk.
- Reduces MIME-sniffing risk.
- Limits resource loading and outbound browser connections.
- Prevents access to unused browser capabilities.
- Reduces referrer leakage.

#### App flow impact

The production build includes the file. There is no UI change. The current app
does not require camera, microphone, geolocation, frames, or object embeds.

#### Edge cases handled

- External HTTPS API bases remain possible through `connect-src https:`.
- Same-origin local API routing remains possible.

#### Related tests

- Production build verification confirmed `dist/_headers` exists.

Deployment note: `_headers` is host-specific. A platform that does not support
this file must configure equivalent headers in its own deployment settings.

### File: `README.md`

#### What changed

- Documented all new backend environment variables.
- Documented public demo and server kill-switch coordination.
- Documented upload safety.
- Documented endpoint rate limiting and proxy-hop configuration.
- Documented production CORS behavior.
- Documented transcript size budgeting.
- Documented Gemini request timeout.
- Added a transcript privacy note explaining that live transcript content is
  sent to Google Gemini.

#### Why it changed

Security controls are ineffective if deployment instructions omit the settings
needed to activate them safely.

#### Architectural decision

Operational guidance is kept next to setup and pipeline documentation so a
developer sees it before deployment.

#### Security impact

- Reduces secret-placement mistakes.
- Reduces accidental live production activation.
- Makes third-party transcript processing explicit.
- Documents the reverse-proxy requirement for accurate IP rate limiting.

#### App flow impact

Documentation only.

#### Edge cases handled

- Public frontend-only deployment.
- Separate backend deployment.
- Reverse proxy deployment.
- Local full-stack development.

#### Related tests

Documentation values match tested implementation defaults.

### File: `server/tests/appSecurity.test.js`

#### What changed

This new integration test file starts the Express app on an ephemeral local
port and verifies:

- Helmet's `X-Content-Type-Options`.
- Absence of `X-Powered-By`.
- Allowed CORS origin reflection.
- Untrusted CORS origin rejection.
- Missing-file rejection.
- Binary file renamed as VTT rejection.
- Disallowed MIME rejection.
- File larger than 5 MB rejection.
- Cleaned transcript character-limit rejection.
- Safe missing-Gemini-key behavior.
- Absence of stack traces in non-development responses.

#### Why it changed

Security middleware must be tested through the actual HTTP boundary, not only
as isolated helper functions.

#### Architectural decision

The tests use Node's built-in test runner, `fetch`, `FormData`, and `Blob`.
No additional HTTP test framework was introduced.

#### Security impact

Prevents regressions in upload validation, CORS, headers, and error
sanitization.

#### App flow impact

Test-only.

#### Edge cases handled

The scenarios listed above cover both accepted transport behavior and rejected
malicious/malformed behavior.

#### Related tests

This file contributes 8 of the 21 passing server tests.

### File: `server/tests/productionConfig.test.js`

#### What changed

This new integration test starts the application with:

- `NODE_ENV=production`
- no `CORS_ORIGIN`
- no `ENABLE_LIVE_GENERATION`

It verifies:

- Production does not emit an allow-origin header for an untrusted origin.
- Production generation returns HTTP 503 and remains disabled by default.

#### Why it changed

The most important quota-safety behavior depends on environment defaults.
Those defaults need direct regression coverage.

#### Architectural decision

Production configuration is tested in a separate process-level test file so
environment variables are set before `app.js` is loaded.

#### Security impact

Prevents future changes from silently reopening public CORS or Gemini access.

#### App flow impact

Test-only.

#### Edge cases handled

- Missing production origin.
- Missing production generation opt-in.

#### Related tests

This file contributes 2 of the 21 passing server tests.

### File: `server/tests/rateLimit.test.js`

#### What changed

This new integration test configures:

- `RATE_LIMIT_MAX=1`
- `RATE_LIMIT_WINDOW_MS=60000`

It verifies:

- The first generation request reaches normal endpoint validation.
- The second request receives HTTP 429.
- The 429 response contains the intended friendly message.

#### Why it changed

Rate limiting is security-sensitive middleware whose order and endpoint scope
matter.

#### Architectural decision

The test uses a low environment-configured limit rather than waiting for the
production default.

#### Security impact

Prevents accidental removal or misordering of generation rate limiting.

#### App flow impact

Test-only.

#### Edge cases handled

- Limit exhaustion inside one window.
- User-facing rate-limit response.

#### Related tests

This file contributes 1 of the 21 passing server tests.

### File: `server/tests/subtitleValidationService.test.js`

#### What changed

This new unit test file verifies:

- Valid UTF-8 SRT is accepted.
- Valid UTF-8 VTT is accepted.
- Binary/NUL-containing content is rejected with HTTP 415 semantics.
- Plain text without SRT timecodes is rejected with HTTP 400 semantics.

#### Why it changed

The new validation service is a core upload-security boundary and needs fast,
isolated tests in addition to HTTP integration tests.

#### Architectural decision

Unit tests exercise validation behavior without Express or Multer.

#### Security impact

Prevents regressions that would allow renamed binary or non-subtitle text
through the content boundary.

#### App flow impact

Test-only.

#### Edge cases handled

- Valid SRT.
- Valid VTT.
- Binary content.
- Timecode-free text.

#### Related tests

This file contributes 4 of the 21 passing server tests.

## 6. Backend Security Changes

### 6.1 Live Generation Kill Switch

`server/src/app.js` evaluates live generation as follows:

- In production, generation is disabled unless
  `ENABLE_LIVE_GENERATION=true`.
- Outside production, generation is enabled by default unless
  `ENABLE_LIVE_GENERATION=false`.

The gate is mounted directly on `/api/v1/generate` before the rate limiter and
route handler. When disabled, the server returns:

- HTTP 503
- `status: "error"`
- `message: "Live AI generation is disabled on this deployment."`

This protects Gemini quota even if:

- Someone discovers the backend URL.
- Someone bypasses the frontend.
- The frontend's demo flag is misconfigured.

To intentionally enable live generation:

```env
NODE_ENV=production
ENABLE_LIVE_GENERATION=true
GEMINI_API_KEY=your_real_backend_secret
CORS_ORIGIN=https://your-frontend.example
```

This control is not authentication. It is a deployment safety switch.

### 6.2 Rate Limiting

Rate limiting applies only to:

```text
/api/v1/generate
```

Default values:

- Window: 15 minutes (`900000` ms).
- Limit: 10 requests.
- Key: client IP as derived by Express and express-rate-limit.
- Headers: standard draft-7 rate-limit headers.
- Legacy headers: disabled.

When limited, the API returns HTTP 429:

```json
{
  "status": "fail",
  "message": "Too many generation requests. Please try again later."
}
```

The health endpoint is not rate-limited by this generation policy.

If deployed behind a reverse proxy, `TRUST_PROXY_HOPS` must be set to the exact
trusted hop count. Otherwise, IP-based limits may identify proxy addresses
instead of clients.

The current limiter uses its default in-memory store.

### 6.3 Upload Validation

Validation is layered.

#### Frontend validation

The existing FileUploader checks:

- `.srt` or `.vtt`.
- Maximum 5 MB.

This improves UX but is not trusted for security.

#### Multer metadata validation

The backend checks:

- Extension allowlist.
- MIME hint allowlist.
- One file.
- Zero regular fields.
- Multipart part/header limits.
- Maximum 5 MB.

#### Content validation

The backend then checks:

- Non-empty Buffer.
- No NUL bytes.
- Strict UTF-8 decoding.
- SRT or VTT timecode evidence appropriate to the extension.

#### Post-cleanup validation

The controller checks:

- Cleaned text is not empty.
- Cleaned text does not exceed `MAX_TRANSCRIPT_CHARACTERS`.

Frontend-only validation is insufficient because an attacker can submit
multipart requests directly to the API.

MIME validation is intentionally described as a hint. MIME values are
client-provided and spoofable. The content checks provide the stronger
validation layer.

### 6.4 CORS Hardening

Development behavior:

- Uses configured `CORS_ORIGIN` when present.
- Otherwise allows:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`

Production behavior:

- Uses only origins listed in `CORS_ORIGIN`.
- If no origin is configured, the browser allowlist is empty.
- Does not fall back to reflecting arbitrary origins.

Additional restrictions:

- Methods: GET, POST, OPTIONS.
- Allowed request header: Content-Type.
- Credentials: disabled.
- Preflight cache: 600 seconds.

Wildcard or reflected CORS is risky because it allows unrelated browser
origins to read API responses. CORS does not stop direct HTTP clients, so it is
combined with the generation gate, rate limiting, and input validation.

### 6.5 Gemini Request Safety

#### Timeout

Each Gemini request uses:

```env
AI_REQUEST_TIMEOUT_MS=120000
```

Invalid or missing positive values fall back to 120 seconds.

#### Retries

The service retries status:

- 429
- 500
- 502
- 503

It uses exponential backoff plus jitter and performs at most three attempts.
HTTP 504/timeouts are not retried automatically because the provider may
already have consumed work.

#### Safe error mapping

- 408/504 -> application HTTP 504 timeout.
- 429/500/502/503 -> application HTTP 503 temporary unavailability.
- Unknown provider failures -> application HTTP 502.

Raw provider errors are attached as `cause` for internal diagnostics but are
not returned directly to users.

#### Prompt instruction separation

Trusted rules are supplied through `systemInstruction`.

Transcript content is supplied as source material:

```text
SOURCE_TRANSCRIPT_START
...
SOURCE_TRANSCRIPT_END
```

The system instruction explicitly states that transcript commands, requests,
and role changes must not be followed. Transcript content may influence the
facts and concepts summarized, but it should not change:

- The model's role.
- The required Markdown-only output.
- The requested study-guide structure.
- The instruction to ignore transcript-contained commands.

### 6.6 Error Handling

Known operational errors use curated messages:

- Invalid upload.
- Unsupported type.
- Excessive size.
- Disabled live generation.
- Missing AI configuration.
- Provider timeout.
- Provider unavailability.
- Rate limiting.

Unknown production 5xx errors use:

```text
Something went wrong while processing the request.
```

Development responses may include:

- Error name.
- Error code.
- Stack trace.

Production responses do not include those fields.

Server-side 5xx logging includes:

- HTTP method.
- Request path.
- Status code.
- Error code.
- Error message.

It does not log:

- Gemini API key.
- Uploaded transcript content.
- Full request payload.
- Generated notes.

### 6.7 Security Headers and Middleware

Backend:

- `app.disable("x-powered-by")`
- Helmet default API-relevant headers.
- HSTS retained in production.
- HSTS disabled in development.
- Backend CSP disabled because this Express application serves JSON rather
  than the static frontend.
- CORP disabled on the API to avoid interfering with intended cross-origin API
  access governed by CORS.
- JSON and URL-encoded body limits.
- Explicit 404 JSON response.

Frontend static deployment:

- CSP.
- Frame denial.
- MIME sniffing protection.
- Same-origin opener isolation.
- Referrer policy.
- Browser capability restrictions.
- Cross-domain policy restriction.

## 7. Frontend Security Changes

### Public demo behavior

`VITE_DEMO_MODE` is evaluated at build time:

```js
const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";
```

When enabled, `handleGenerate` returns before calling
`generateStudyGuide`. Custom uploaded files are validated for UX, but the live
API is not called. The sample lecture uses bundled metadata and Markdown.

Production demo bundle inspection confirmed that the exact generation endpoint
was absent.

### Secret handling

The frontend uses:

- `VITE_DEMO_MODE`
- `VITE_API_BASE_URL`

Neither is a secret. No `GEMINI_API_KEY` is referenced by frontend code.

Vite variables are public by design. A Gemini key must never be prefixed with
`VITE_`.

### localStorage safety

The cache stores:

- Markdown.
- Filename.
- File size.
- File type.
- Generation timestamp.
- Source (`live` or `demo`).
- Schema version.

It does not store:

- Gemini key.
- Actual uploaded `File` object.
- Raw uploaded transcript.

Restoration validates all expected fields and now applies upper bounds. Invalid
entries are removed.

### Error display and logging

Users receive normalized messages for:

- 400
- 413
- 415
- 429
- 500
- 502/503/504
- timeout
- network failure
- fallback failure

Technical details are rendered only when `import.meta.env.DEV` is true.
Full request errors are also logged only in development.

### Frontend response headers

`client/public/_headers` is copied into the Vite build. On a compatible static
host, it applies the browser security policy documented above.

## 8. Architecture Before vs After

### Before

The primary flow was:

1. Frontend selected a subtitle file.
2. Frontend validated extension and 5 MB size.
3. Backend accepted extension-matching files into memory.
4. Backend decoded the file as UTF-8 without strict validation.
5. Backend parsed and cleaned the transcript.
6. Backend chunked the transcript.
7. Backend joined chunks into one prompt containing both instructions and
   transcript.
8. Backend called Gemini without an explicit request timeout.
9. Backend returned generated Markdown.

Main risks:

- Production CORS could reflect arbitrary origins.
- Public backend generation could consume the owner's quota.
- No generation rate limit.
- Binary or malformed renamed files could reach parser logic.
- Cleaned transcript size was not capped.
- Prompt instruction hierarchy was weak.
- Unknown production errors could expose raw messages.
- Server security headers were limited.
- Browser cache values were not fully bounded.

### After

The hardened live flow is:

1. Application checks whether live generation is enabled.
2. Endpoint rate limiter checks request frequency.
3. Multer enforces multipart, file count, MIME hint, extension, and 5 MB
   limits.
4. Content validator checks UTF-8, binary markers, and subtitle timecodes.
5. Controller sanitizes filename metadata.
6. Existing parser cleans the transcript.
7. Controller rejects empty or excessive cleaned text.
8. Existing chunker creates semantic chunks.
9. AI service applies trusted system instructions separately from untrusted
   transcript source text.
10. Gemini request runs with output controls, timeout, and bounded retry.
11. Provider errors are mapped to safe operational errors.
12. Express returns Markdown or a sanitized error.

### Public Demo Mode

```text
User -> Vite frontend -> bundled sample Markdown -> MarkdownViewer/localStorage
```

- Frontend sample notes only.
- No backend generation request.
- No Gemini call.
- Upload validation remains available as a demonstration.
- Copy, download, and saved-note restoration remain available.

### Local Full Backend Mode

```text
User
  -> Vite frontend
  -> POST /api/v1/generate
  -> live-generation gate
  -> rate limiter
  -> Multer validation
  -> UTF-8/timecode validation
  -> parser cleanup
  -> transcript limit
  -> chunking
  -> Gemini
  -> Markdown response
  -> MarkdownViewer/localStorage
```

With `NODE_ENV=development`, live generation defaults on unless explicitly
disabled.

### Production Backend Mode

- Live generation defaults off.
- It must be explicitly enabled.
- CORS requires configured allowed origins.
- Rate limits remain active.
- Upload and transcript limits remain active.
- Production errors are sanitized.
- Helmet and fingerprint removal remain active.

## 9. Did These Changes Affect the Previous App Flow?

Yes, but only at security boundaries and production configuration points.

### Landing page

No behavior or visual changes were made.

### `/try` page

The normal UI and state flow remain intact:

- Upload.
- Generate.
- Processing state.
- Markdown rendering.
- Copy.
- Download.
- Regenerate.
- Upload another file.
- Restore saved notes.
- Clear saved notes.

### Demo mode

No functional change. Demo mode still avoids the backend generation call and
loads local sample notes.

### Local full backend mode

Still works. The local example sets:

```env
NODE_ENV=development
ENABLE_LIVE_GENERATION=true
```

Valid SRT/VTT files proceed through the same parsing, chunking, Gemini, and
Markdown response flow.

### Upload validation

Behavior is stricter:

- Renamed binary files are rejected.
- Unsupported MIME hints are rejected.
- Invalid UTF-8 is rejected.
- Files without subtitle timecodes are rejected.
- More than one file or unexpected multipart data is rejected.
- Cleaned transcripts over the configured character limit are rejected.

### Production generation

Changed intentionally:

- Production generation now requires `ENABLE_LIVE_GENERATION=true`.

### Production CORS

Changed intentionally:

- Production browser access now requires `CORS_ORIGIN`.
- Missing production configuration no longer means "allow any origin."

### Error handling

Changed intentionally:

- Users receive clearer, less technical errors.
- Unknown production failures no longer expose raw internal messages.
- Development still has technical details.

### Markdown copy/download

No change.

### localStorage restoration

Valid existing cache entries still restore. Implausibly large or malformed
entries are now removed.

## 10. Tests Added or Updated

### `server/tests/appSecurity.test.js`

Type:

- Security integration tests.
- Validation tests.
- Error-response tests.

Scenarios:

- Security headers.
- Framework fingerprint removal.
- CORS allow and deny behavior.
- Missing upload.
- Renamed binary content.
- Disallowed MIME.
- File-size limit.
- Cleaned-transcript size limit.
- Missing AI configuration.
- No stack trace in non-development response.

Why it matters:

It verifies the actual Express/Multer/controller path rather than only helper
functions.

### `server/tests/productionConfig.test.js`

Type:

- Production configuration security tests.

Scenarios:

- Production CORS fail-closed default.
- Production live-generation disabled default.

Why it matters:

It protects the two most important safe production defaults.

### `server/tests/rateLimit.test.js`

Type:

- Abuse-control integration test.

Scenarios:

- First request accepted by the limiter.
- Second request rejected with HTTP 429 under a one-request test limit.

Why it matters:

It verifies middleware order and endpoint scope.

### `server/tests/subtitleValidationService.test.js`

Type:

- Validation unit tests.

Scenarios:

- Valid SRT.
- Valid VTT.
- Binary content.
- Plain text without timecodes.

Why it matters:

It gives fast, focused regression coverage for the new content validator.

### Existing tests

The existing parser and chunking tests remained unchanged and continued to
pass.

### Result

Server tests: **21 passed**.

No new automated client tests were added in this audit.

## 11. Test Coverage and Verification

### Automated verification

- Server tests: 21 passed.
- Server lint: passed.
- Client lint: passed.
- Client production build: passed.
- Server dependency audit: 0 vulnerabilities.
- Client dependency audit: 0 vulnerabilities.
- Root dependency audit: 0 vulnerabilities.

### Secret and environment verification

- No tracked `AIza...` Google API key pattern was found.
- The only tracked `GEMINI_API_KEY` values are placeholders in:
  - `README.md`
  - `server/config.env.example`
- `client/.env.local` is ignored by `client/.gitignore`.
- `server/config.env` is ignored by `server/.gitignore`.
- No Gemini key marker was found in the production client bundles.

### Demo bundle verification

With public demo mode enabled:

- Production build passed.
- Exact `/api/v1/generate` endpoint string was absent from the bundle.
- Gemini secret markers were absent.
- `_headers` was copied into the build.

With live mode explicitly built for verification:

- Production build passed.
- The API base was present as expected.
- Gemini secret markers were absent.

### Coverage percentage

Coverage percentage was not measured in this audit; verification focused on
targeted security tests, linting, build checks, secret scanning, bundle
inspection, and dependency audit.

## 12. Environment Variables and Configuration

| Variable                    | Used by                                            | Development value/example                            | Production recommendation                                                         | Security note                                                        |
| --------------------------- | -------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `VITE_DEMO_MODE`            | Client build                                       | `false` for local full backend testing               | `true` for the public sample-only portfolio frontend                              | Vite values are public. This is a behavior flag, not a secret.       |
| `VITE_API_BASE_URL`         | Client API service                                 | `/api/v1`                                            | Same-origin `/api/v1` or the intended HTTPS backend prefix                        | Public configuration. CSP allows same-origin and HTTPS connections.  |
| `GEMINI_API_KEY`            | Server AI service                                  | Developer's local key in ignored `server/config.env` | Store only in backend deployment secrets                                          | Never prefix with `VITE_`; never commit or log it.                   |
| `ENABLE_LIVE_GENERATION`    | Server app                                         | `true` in the local example                          | Leave unset/`false` for public sample-only backend; set `true` only intentionally | Production defaults off without explicit opt-in.                     |
| `CORS_ORIGIN`               | Server app                                         | `http://localhost:5173`                              | Exact deployed frontend origin; comma-separate multiple trusted origins           | Production fails closed if omitted.                                  |
| `PORT`                      | Server startup                                     | `5001`                                               | Deployment platform value                                                         | Not sensitive.                                                       |
| `NODE_ENV`                  | Client/server behavior indirectly; server directly | `development`                                        | `production`                                                                      | Controls production defaults, error sanitization, HSTS, and logging. |
| `TRUST_PROXY_HOPS`          | Express proxy configuration                        | `0`                                                  | Exact trusted proxy hop count, only when behind a known proxy                     | Incorrect values can weaken IP-based rate limiting.                  |
| `RATE_LIMIT_WINDOW_MS`      | Generation limiter                                 | `900000`                                             | Tune to deployment/API budget                                                     | Default is 15 minutes.                                               |
| `RATE_LIMIT_MAX`            | Generation limiter                                 | `10`                                                 | Tune to deployment/API budget                                                     | Default is 10 requests per window per derived IP.                    |
| `MAX_TRANSCRIPT_CHARACTERS` | Generation controller                              | `200000`                                             | Keep bounded based on model/input budget                                          | Limits cleaned transcript before Gemini usage.                       |
| `AI_REQUEST_TIMEOUT_MS`     | Gemini request options                             | `120000`                                             | Tune to provider behavior and platform timeout                                    | Prevents indefinitely stalled provider requests.                     |

No real secret values should appear in documentation or example files.

## 13. Remaining Risks and Future Improvements

The following items were not implemented in this audit.

### Recommended future improvement: authentication or access control

If live public generation is enabled, require authentication, invitation codes,
or another access mechanism. Rate limiting alone does not establish user
identity.

### Recommended future improvement: durable distributed rate limiting

The current limiter uses in-memory state:

- It resets when the process restarts.
- Multiple server instances do not share counters.
- Distributed clients can use multiple IP addresses.

Use Redis or another shared store for a scaled public backend.

### Recommended future improvement: CAPTCHA or bot challenge

If anonymous generation is enabled, place a bot challenge before expensive
requests.

### Recommended future improvement: user and global request budgets

Add:

- Per-user daily quotas.
- Global daily Gemini request/token budget.
- Automatic disable behavior when the budget is reached.
- Billing and quota alerts.

### Recommended future improvement: production monitoring

Add structured logging and alerts for:

- 429 spikes.
- Upload rejection rates.
- Gemini 5xx/timeout rates.
- Request latency.
- Transcript-size rejections.
- Unexpected 500 responses.

Logs must continue to exclude transcript content and secrets.

### Recommended future improvement: stronger file-format parsing

The current timecode validation is deliberately lightweight. A stricter parser
could validate cue ordering and complete file structure. It should preserve
compatibility with real subtitle-export variations.

### Recommended future improvement: model output validation

The response is checked for non-empty Markdown but not against a strict schema.
Future validation could ensure required sections exist before returning the
result.

### Recommended future improvement: content policy and privacy controls

If users may upload sensitive lectures:

- Add an explicit privacy notice before live upload.
- Define retention and deletion policies.
- Review Google Gemini data-processing terms for the chosen API account and
  deployment.
- Avoid logging content.

### Recommended future improvement: CI security pipeline

Add CI jobs for:

- Client lint.
- Server lint.
- Server tests.
- Client production build.
- `npm audit`.
- Secret scanning.

### Recommended future improvement: automated client tests

Add tests for:

- Corrupted localStorage.
- Oversized cache entries.
- Demo mode never calling the API.
- Development-only technical error details.
- 429/502/503/504 user-facing mappings.

### Recommended future improvement: deployment-header parity

`client/public/_headers` requires a compatible host. If another platform is
used, configure and test equivalent headers at that host or CDN.

### Recommended future improvement: CSP tightening

The current CSP allows `'unsafe-inline'` for styles and HTTPS API destinations.
Future deployment-specific CSP can be narrowed after confirming the exact
style and API requirements.

## 14. Final Security Checklist

- [x] No real API keys are committed.
- [x] Gemini key usage is backend-only.
- [x] Local secret environment files are ignored.
- [x] Public demo mode avoids backend generation.
- [x] Demo production bundle excludes the generation endpoint.
- [x] Live generation is disabled by default in production.
- [x] Upload extension validation is enforced on the backend.
- [x] MIME hint validation is enforced on the backend.
- [x] UTF-8 and subtitle timecode validation are enforced.
- [x] Binary/NUL-containing uploads are rejected.
- [x] One-file and multipart limits are enforced.
- [x] The 5 MB file-size limit is enforced on the backend.
- [x] Cleaned transcript size is limited before Gemini.
- [x] CORS is restricted in production.
- [x] Generation rate limiting is enabled.
- [x] Gemini requests have a timeout.
- [x] Trusted AI instructions are separated from transcript source text.
- [x] Provider failures are mapped to safe errors.
- [x] Unknown production errors are sanitized.
- [x] Production stack traces are hidden.
- [x] Security headers are added to backend responses.
- [x] Static frontend security headers are included in the build.
- [x] Express framework fingerprinting is disabled.
- [x] localStorage restoration validates bounded data.
- [x] Detailed frontend request logging is development-only.
- [x] Server lint dependencies are reproducible.
- [x] Client, server, and root dependency audits are clean.
- [x] Client production build passes.
- [x] Client lint passes.
- [x] Server lint passes.
- [x] All 21 server tests pass.

## 15. Interview Explanation

### The problem

Lecture Companion uses a backend Gemini key to generate notes. A public
portfolio deployment could allow anonymous visitors to consume that quota.
The upload endpoint also needed to treat files and transcript text as
untrusted input rather than relying on frontend checks.

### The risk

The main risks were:

- Unexpected Gemini cost or free-tier exhaustion.
- Direct backend calls bypassing demo mode.
- Repeated request abuse.
- Renamed binary or malformed subtitle uploads.
- Excessive AI input.
- Transcript-based prompt injection.
- Permissive production CORS.
- Internal errors leaking into responses or logs.

### The solution

I added defense in depth:

1. Production live generation defaults off.
2. Expensive requests are rate-limited.
3. Multer enforces transport and size limits.
4. A validation service verifies UTF-8 and subtitle timecodes.
5. The controller caps cleaned transcript length.
6. Gemini instructions are separated from transcript content.
7. Gemini calls have timeouts, bounded retries, and safe error mappings.
8. Production CORS and error responses fail closed.
9. Helmet and static browser headers harden responses.
10. Security behavior is covered by integration and unit tests.

### The tradeoff

Stricter validation can reject malformed subtitle exports that the older
extension-only flow might have accepted. Production live generation also
requires explicit configuration. Those are deliberate tradeoffs: the project
favors predictable cost and a narrow input boundary over accepting arbitrary
text files.

The current IP limiter is intentionally a baseline, not a complete public
abuse solution. A scaled live deployment would need authentication, shared
rate-limit storage, and request budgets.

### What I learned

The main lesson was that frontend demo behavior is not a security boundary.
Quota protection must also exist on the server. I also learned to separate
file metadata validation from file-content validation, distinguish trusted AI
instructions from untrusted source material, and verify safe defaults with
production-specific integration tests rather than relying only on manual
configuration review.
