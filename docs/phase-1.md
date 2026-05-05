# Phase 1: Product Definition

## Problem Statement

Lecture subtitle files such as `.srt` and `.vtt` contain useful spoken content, but they are optimized for playback, not study. In their raw form, transcripts are noisy, difficult to scan, and time-consuming to turn into meaningful notes. Students and self-directed learners often spend more effort parsing the transcript than learning from it.

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

1. The user opens the application and sees a simple single-page interface focused on one task.
2. The user drags and drops a `.srt` or `.vtt` file into the upload area.
3. The application validates the file and begins processing it.
4. The UI shows progress states such as parsing, analyzing, chunking, and generating notes so the user understands the system is working.
5. The application displays the generated notes in a structured, easy-to-scan layout.
6. The user copies the notes in Markdown format or downloads them as a `.md` file.

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

- NFR1: The system should process small subtitle files in under 10 seconds.
- NFR2: The output structure should remain consistent across similar inputs.
- NFR3: The system should handle larger transcripts gracefully without failing.
- NFR4: The interface should remain simple, readable, and easy to use.
- NFR5: The application should provide visible processing feedback during long-running operations.

## Constraints

- Output quality depends on the accuracy and consistency of the source transcript.
- AI responses are limited by model context windows, so chunking is required for long files.
- Poorly formatted or low-quality transcripts may reduce the accuracy of the generated notes.
- The MVP only supports `.srt` and `.vtt` subtitle files.

## Success Criteria

- The system can process a standard 1-hour lecture transcript of roughly 8,000 words and generate notes in under 15 seconds.
- The parser removes timecodes and subtitle metadata correctly from standard `.srt` and `.vtt` files without crashing.
- The generated notes follow the expected structure with headings, bullet summaries, and a key concepts section.
- The output stays grounded in the transcript and avoids inventing facts not supported by the source material.
- Users can successfully copy or download the generated notes in Markdown format.
