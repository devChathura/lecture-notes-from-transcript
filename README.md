# AI Lecture Companion 🎓

> **Convert raw lecture subtitle files (.srt & .vtt) into structured, study-friendly Markdown notes using AI.**

![Tech Stack - React](https://img.shields.io/badge/React-19-blue?logo=react&logoColor=white)
![Tech Stack - Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tech Stack - TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwind-css&logoColor=white)
![Tech Stack - Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white)
![Tech Stack - Express](https://img.shields.io/badge/Express-REST_API-000000?logo=express&logoColor=white)
![Tech Stack - Google Gemini AI](https://img.shields.io/badge/Google_Gemini-AI_Engine-4285F4?logo=google&logoColor=white)

---

## 📖 Overview

**AI Lecture Companion** is an intelligent web application designed to help students, self-taught learners, and professionals instantly generate clear, readable study notes from video and lecture transcripts.

### The Problem It Solves

Lecture subtitle files contain valuable spoken content, but they are optimized for video playback, not studying. In their raw form, transcripts are noisy with timecodes, sequence numbers, and lack semantic structure (such as topic grouping or emphasis). Parsing them manually is inefficient and time-consuming.

### The Solution

This tool streamlines the learning process by automating the cleanup and synthesis of subtitle files. It removes metadata, intelligently chunks long texts to preserve context, and leverages **Google Gemini AI** to output structured study guides featuring high-level headings, detailed bullet-point summaries, and key terminology definitions.

---

## ✨ Features

**User-Facing Value:**

- **Effortless Ingestion:** Drag-and-drop interface for `.srt` and `.vtt` uploads.
- **Structured Study Guides:** Automatically generates beautiful Markdown notes featuring topic headings, summaries, and key concepts.
- **Export Options:** Instantly copy notes to clipboard or download as a `.md` file for your personal knowledge base (e.g., Obsidian, Notion).

**Engineering Highlights:**

- **Sliding Window Chunking Strategy:** Implements a ~4,000-character chunk size with 400-character overlap to preserve context during text segmentation.
- **Robust Text Parsing:** Custom in-memory RegEx pipelines strip SRT/VTT timestamps, sequence numbers, and HTML styling from transcript files.
- **Role-Based Prompt Engineering:** Enforces output reliability using a specific "Senior Academic Teaching Assistant" persona, helping produce consistently valid Markdown.
- **Decoupled Architecture:** Clean client-server separation to protect sensitive LLM API keys.

**Verified Engineering Metrics:**

- **Transcript Parsing Coverage:** Backend parser and chunking tests currently cover the transcript-processing slice at roughly 94% line coverage.
- **Parsing Throughput:** In-memory regex parsing has been validated on 1,000-line SRT/VTT transcripts and runs in low-millisecond time on local benchmarks.
- **AI Capacity:** Gemini 1.5 Flash orchestration is configured for single-pass synthesis over large chunked transcripts, with practical support for long-form lecture transcripts.

---

## 🏗 High-Level Architecture

The system utilizes a lightweight **Client-Server Architecture**.

- **Frontend:** A React (Vite) single-page application that handles file validation, multi-part form requests, and rendering the Markdown response.
- **Backend:** A stateless Node.js/Express API that manages file parsing, text sanitization, chunking (via LangChain), and orchestration with the Google Gemini API.
- **Testing:** Native Node test suites validate the parsing and chunking services without requiring a separate Jest setup.

### C4 Container Diagram

![Container Diagram](docs/diagrams/c4_container_diagram.svg)

_(Additional architectural diagrams can be found in the `docs/diagrams/` directory)._

---

## 📂 Project Structure

```text
lecture-notes-from-transcript/
├── client/                     # Frontend Application (React/Vite)
│   ├── src/                    # UI Components, Styles, and Logic
│   ├── package.json            # Client dependencies
│   └── vite.config.js          # Vite build configuration
├── server/                     # Backend API (Node.js/Express)
│   ├── src/
│   │   ├── controllers/        # Request/Response handling logic
│   │   ├── middlewares/        # Express middlewares (e.g., Multer file upload)
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Core business logic (Parsing, Chunking, AI)
│   │   ├── utils/              # Helper functions and Error classes
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # Server entry point
│   ├── config.env              # Environment variables
│   └── package.json            # Server dependencies
└── docs/                       # Project Documentation & Architecture
    ├── diagrams/               # C4 and Architecture diagrams
    ├── phase-1.md              # Product Definition & Requirements
    └── phase-2-architecture.md # Architecture & Design Decisions
```

---

## 🚀 Setup & Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- A **Google Gemini API Key**

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/lecture-notes-from-transcript.git
cd lecture-notes-from-transcript
```

### 2. Server Setup (Backend)

```bash
cd server
npm install
```

Create a `config.env` file in the `server` root directory:

```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the backend server:

```bash
# For development (with nodemon):
npm run dev

# For production:
npm run start
```

### 3. Client Setup (Frontend)

Open a new terminal window:

```bash
cd client
npm install
```

Start the frontend development server:

```bash
npm run dev
```

### 4. Build Commands

To build the frontend for production:

```bash
cd client
npm run build
```

---

## 💻 Usage Workflow

1. Open `http://localhost:5173` (or your configured Vite port) in your browser.
2. Drag and drop a valid `.srt` or `.vtt` file (up to 5 MB) into the upload zone.
3. Wait for the file to be processed (parsing, chunking, and AI synthesis).
4. View the generated study notes displayed in clean typography.
5. Click **Download** to save as a `.md` file, or **Copy** to paste it into your favorite note-taking app.

---

## 📸 Screenshots & Demo

_(Placeholder - Add your screenshots here once UI is complete)_

![App Dashboard Screenshot](docs/screenshots/app-dashboard.png)

---

## 🔌 API Documentation

The backend exposes a simple REST API to handle text synthesis.

| Endpoint           | Method | Description                                                                 | Content-Type          |
| :----------------- | :----- | :-------------------------------------------------------------------------- | :-------------------- |
| `/api/health`      | `GET`  | Verifies the API is online and responsive.                                  | `application/json`    |
| `/api/v1/generate` | `POST` | Uploads a subtitle file and returns structured AI-generated Markdown notes. | `multipart/form-data` |

**POST `/api/v1/generate` Response Example (200 OK):**

```json
{
  "status": "success",
  "metadata": {
    "originalName": "lecture-1.srt",
    "chunkCount": 3
  },
  "data": {
    "markdown": "# Topic 1\n\n- Point A\n- Point B\n\n## Key Concepts\n- **Term 1:** Definition"
  }
}
```

---

## ⚙️ Configuration Notes & Pipelines

- **File Uploads:** Handled seamlessly via `Multer` middleware, ensuring only valid text-based file buffers are processed in memory without writing to the disk unnecessarily.
- **Transcript Parsing:** Strip timecodes, sequence numbers, and any residual HTML before passing it to the chunking engine.
- **Chunking Engine:** Uses `@langchain/textsplitters` for robust text segmentation, employing a sliding window technique (overlap) to prevent the loss of semantic meaning at chunk boundaries.
- **AI Processing:** Interacts with the `@google/generative-ai` SDK using a strictly defined system prompt to force output into hierarchical markdown.

---

## 🛡️ Quality & Performance

- **Error Handling:** Standardized API error responses across the stack. The backend fails gracefully, catching AI timeouts and invalid file types to return a user-friendly message rather than crashing.
- **Performance:** Designed to process small-to-medium files rapidly. Backend logic parses raw streams efficiently before engaging the external AI APIs.
- **Security:** Follows best practices by keeping sensitive API keys server-side. File sizes are restricted (5MB) to prevent memory exhaustion and DoS vectors.

---

## 🛤️ Roadmap

- [ ] **Direct URL Parsing:** Allow users to paste a YouTube URL and fetch the transcript directly.
- [ ] **Cloud Storage & Authentication:** Introduce user accounts to save history and previously generated notes.
- [ ] **Custom Prompts:** Enable users to define their own specific AI personas or focus areas (e.g., "Focus only on formulas").
- [ ] **Audio/Video Ingestion:** Implement Whisper AI integration to process raw media files without existing transcripts.

---

## 📜 License

This project is licensed under the [ISC License](LICENSE).

---

## 👨‍💻 Author

**Chathura Hapukotuwa**  
_Full Stack Developer & Software Engineer_

[![GitHub](https://img.shields.io/badge/GitHub-devChathura-181717?logo=github&logoColor=white)](https://github.com/devChathura)
[![Portfolio](https://img.shields.io/badge/Portfolio-Live%20Site-111827?logo=netlify&logoColor=00C7B7)](https://chathura-hapukotuwa.netlify.app/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Chathura%20Hapukotuwa-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/chathura-hapukotuwa/)

---

_Built with passion, focusing on clean code, AI integration, and developer experience._
