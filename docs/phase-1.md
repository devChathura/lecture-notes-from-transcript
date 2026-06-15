# Phase 1: Product Definition

## Problem Statement

Lecture subtitle files such as `.srt` and `.vtt` contain useful spoken content, but they are optimized for playback, not study. In their raw form, transcripts are noisy, difficult to scan, and time-consuming to turn into meaningful notes. Transcripts lack semantic structure such as topic grouping, emphasis, and hierarchy, making them inefficient for revision. Students and self-directed learners often spend more effort parsing the transcript than learning from it.

This project solves that problem by converting raw subtitle files into structured, readable study notes. The system removes timecodes, cleans transcript text, groups related ideas, and uses AI to produce a clear hierarchy of headings, summaries, and key terminology.

## Target Users

Primary users are university students, especially those in technical or information-dense programs, who need a faster way to review recorded lectures.

Secondary users are self-taught learners and professionals taking long-form online courses, such as certification prep, bootcamps, or MOOCs, who want a concise summary of the material.

Tertiary users are educators and content creators who want to repurpose their own lecture or video transcripts into study guides, notes, or article drafts.

## Feature Scope

### In Scope (MVP)

- File ingestion for `.srt` and `.vtt` uploads through a drag-and-drop interface.
- File validation with a maximum upload size of 5 MB.
- Transcript parsing that removes timecodes, sequence numbers, and metadata while preserving spoken content.
- Text chunking logic to split long transcripts into AI-friendly segments without losing context.
- AI-generated study notes with a consistent structure:
  - Main topic headings
  - Bullet-point summaries under each heading
  - A dedicated key concepts and terminology section
- Output actions to copy the result as Markdown or download it as a `.md` file.
- A readable notes view with clean typography and clear visual hierarchy.

### Out of Scope (MVP)

- Support for audio or video file uploads.
- Support for formats other than `.srt` and `.vtt`.
- User accounts, saved history, or collaboration features.
- Manual note editing inside the application.
- Real-time transcription or speaker diarization.
- Direct YouTube URL parsing (deferred to V2.0).
- User authentication and cloud database storage (deferred to V2.0).

## User Flow

1. The user opens the landing page and navigates to the `/try` experience.
2. The user drags and drops or browses for an `.srt` or `.vtt` file.
3. The client validates the file type and size before enabling generation.
4. The backend validates, parses, cleans, and chunks the subtitle content.
5. The UI shows a processing state while the backend generates the study guide.
6. The application displays the generated notes in a structured Markdown view.
7. The user copies, downloads, regenerates, or replaces the source file.
8. The latest generated result remains available after a browser refresh.

## Functional Requirements

- FR1: The system must allow users to upload `.srt` and `.vtt` files up to 5 MB.
- FR2: The system must validate subtitle file format before processing.
- FR3: The system must extract transcript text while removing timecodes and non-content metadata.
- FR4: The system must chunk long transcripts before sending them to the AI model.
- FR5: The system must generate structured study notes from the cleaned transcript.
- FR6: The system must present the generated notes in a readable format.
- FR7: The system must allow users to copy notes as Markdown.
- FR8: The system must allow users to download notes as a Markdown file.

## Non-Functional Requirements

- NFR1: The system should reject unsupported, malformed, oversized, or unreadable uploads safely.
- NFR2: The output should use a predictable Markdown hierarchy for study notes.
- NFR3: The backend should enforce configurable upload and transcript-size limits.
- NFR4: Provider and network failures should return user-friendly errors without exposing production internals.
- NFR5: The interface should remain responsive, keyboard accessible, readable, and free from horizontal overflow.
- NFR6: The application should provide visible processing feedback during generation.
- NFR7: Public demo mode should complete the sample flow without calling the backend or Gemini.
- NFR8: Generated notes restored from browser storage should be validated before use.

## Constraints

- Output quality depends on the accuracy and consistency of the source transcript.
- AI responses are limited by model context windows, so chunking is required for long files.
- Poorly formatted or low-quality transcripts may reduce the accuracy of the generated notes.
- The MVP only supports `.srt` and `.vtt` subtitle files.

## Success Criteria

- Valid UTF-8 `.srt` and `.vtt` files pass backend validation.
- Invalid, binary, malformed, and oversized uploads are rejected safely.
- The parser removes standard subtitle metadata while preserving spoken content.
- Long cleaned transcripts are segmented consistently and limited before AI generation.
- Successful generation returns Markdown that can be previewed, copied, and downloaded.
- Failed generation produces a clear user-facing error and allows retrying with the selected file.
- Public demo mode loads the bundled study guide without a backend request.
- The latest valid generated result can be restored or cleared after a browser refresh.
