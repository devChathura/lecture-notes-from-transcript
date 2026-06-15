import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Check,
  ExternalLink,
  FileCode2,
  FileText,
  Hash,
  History,
  Info,
  ListChecks,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import FileUploader from "../components/FileUploader";
import MarkdownViewer, {
  MARKDOWN_VIEWER_SAMPLE,
} from "../components/MarkdownViewer";
import {
  DEMO_LECTURE,
  DEMO_STUDY_GUIDE,
} from "../data/demoStudyGuide";
import { generateStudyGuide } from "../services/apiService";

const processingSteps = [
  "Cleaning transcript",
  "Chunking lecture content",
  "Generating study notes",
  "Preparing Markdown",
];

const previewHighlights = [
  { label: "Headings", icon: Hash },
  { label: "Key Ideas", icon: ListChecks },
  { label: "Markdown", icon: FileCode2 },
];

const GENERATION_STORAGE_KEY = "lecture-companion:last-generation";
const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";
const GITHUB_REPOSITORY_URL =
  "https://github.com/devChathura/lecture-notes-from-transcript";

const formatGeneratedAt = (generatedAt) => {
  if (!generatedAt) {
    return null;
  }

  const generatedDate = new Date(generatedAt);

  if (Number.isNaN(generatedDate.getTime())) {
    return null;
  }

  const today = new Date();
  const isToday =
    generatedDate.getFullYear() === today.getFullYear() &&
    generatedDate.getMonth() === today.getMonth() &&
    generatedDate.getDate() === today.getDate();

  if (isToday) {
    return `Generated today at ${new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(generatedDate)}`;
  }

  return `Generated on ${new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(generatedDate)}`;
};

const clearGeneratedNotesStorage = () => {
  try {
    window.localStorage.removeItem(GENERATION_STORAGE_KEY);
  } catch (storageError) {
    if (import.meta.env.DEV) {
      console.warn(
        "[Lecture Companion] Could not clear saved notes:",
        storageError
      );
    }
  }
};

const loadGeneratedNotesFromStorage = () => {
  try {
    const storedValue = window.localStorage.getItem(GENERATION_STORAGE_KEY);

    if (!storedValue) {
      return null;
    }

    const storedResult = JSON.parse(storedValue);
    const isValid =
      storedResult?.version === 1 &&
      typeof storedResult.markdown === "string" &&
      storedResult.markdown.trim().length > 0 &&
      typeof storedResult.fileName === "string" &&
      storedResult.fileName.trim().length > 0 &&
      typeof storedResult.fileSize === "number" &&
      Number.isFinite(storedResult.fileSize) &&
      storedResult.fileSize >= 0 &&
      typeof storedResult.fileType === "string" &&
      [".SRT", ".VTT"].includes(storedResult.fileType.toUpperCase()) &&
      typeof storedResult.generatedAt === "string" &&
      !Number.isNaN(Date.parse(storedResult.generatedAt)) &&
      (storedResult.source === undefined ||
        ["live", "demo"].includes(storedResult.source));

    if (!isValid) {
      clearGeneratedNotesStorage();
      return null;
    }

    return storedResult;
  } catch (storageError) {
    clearGeneratedNotesStorage();
    if (import.meta.env.DEV) {
      console.warn(
        "[Lecture Companion] Could not restore saved notes:",
        storageError
      );
    }
    return null;
  }
};

const saveGeneratedNotesToStorage = (
  markdown,
  file,
  source = "live"
) => {
  try {
    const fileType = file.name
      .substring(file.name.lastIndexOf("."))
      .toUpperCase();

    window.localStorage.setItem(
      GENERATION_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        markdown,
        fileName: file.name,
        fileSize: file.size,
        fileType,
        generatedAt: new Date().toISOString(),
        source,
      })
    );
  } catch (storageError) {
    if (import.meta.env.DEV) {
      console.warn(
        "[Lecture Companion] Could not save generated notes:",
        storageError
      );
    }
  }
};

const normalizeGenerationError = (error) => {
  const sourceError = error?.cause || error;
  const response = sourceError?.response || error?.response;
  const status = response?.status;
  const code = String(sourceError?.code || error?.code || "").toUpperCase();
  const rawMessage =
    sourceError?.message || error?.message || "Unknown generation error";
  const technical = status ? `HTTP ${status}: ${rawMessage}` : rawMessage;
  const normalizedMessage = rawMessage.toLowerCase();

  if (status === 400) {
    return {
      title: "Invalid upload",
      message:
        "Please upload a valid .srt or .vtt subtitle file and try again.",
      technical,
    };
  }

  if (status === 413) {
    return {
      title: "File is too large",
      message: "Please upload a subtitle file under 5MB.",
      technical,
    };
  }

  if (status === 415) {
    return {
      title: "Unsupported file type",
      message: "Only .srt and .vtt subtitle files are supported.",
      technical,
    };
  }

  if (status === 429) {
    return {
      title: "Too many requests",
      message: "Please wait a moment before generating notes again.",
      technical,
    };
  }

  const isTimeout =
    status === 408 ||
    code === "ECONNABORTED" ||
    code === "ETIMEDOUT" ||
    normalizedMessage.includes("timeout");

  if (isTimeout) {
    return {
      title: "Generation timed out",
      message:
        "This transcript may be taking longer than expected. Please try again or use a smaller subtitle file.",
      technical,
    };
  }

  if ([502, 503, 504].includes(status)) {
    return {
      title: "AI service temporarily unavailable",
      message:
        "The note generation service is currently unavailable or taking too long to respond. Please try again in a few minutes.",
      technical,
    };
  }

  if (status === 500) {
    return {
      title: "Generation failed",
      message:
        "Something went wrong while generating your notes. Please try again.",
      technical,
    };
  }

  const isNetworkError =
    code === "ERR_NETWORK" ||
    normalizedMessage.includes("network error") ||
    (!response && Boolean(sourceError?.request));

  if (isNetworkError) {
    return {
      title: "Connection problem",
      message:
        "The app could not reach the server. Please check your connection and try again.",
      technical,
    };
  }

  return {
    title: "Notes could not be generated",
    message: "Something went wrong. Please try again.",
    technical,
  };
};

const GenerationErrorPanel = ({ error, canRetry, onRetry }) => {
  if (!error) {
    return null;
  }

  return (
    <div
      className="try-state-enter mt-4 rounded-2xl border border-red-200/70 bg-red-50/70 p-4 text-red-700"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-200/70 bg-white/80"
          aria-hidden="true"
        >
          <AlertCircle className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-red-700">{error.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-red-600">
            {error.message}
          </p>

          {canRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors duration-200 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
          )}

          {import.meta.env.DEV && error.technical && (
            <details className="mt-3 text-xs text-red-600/90">
              <summary className="w-fit cursor-pointer rounded font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300">
                Technical details
              </summary>
              <p className="mt-2 break-words rounded-lg bg-white/65 px-3 py-2 font-mono leading-relaxed">
                {error.technical}
              </p>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

const DemoGenerationMessage = ({ onTrySample }) => (
  <div
    className="try-state-enter mt-4 rounded-2xl border border-slate-200/80 bg-white/70 p-4 text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md"
    role="status"
  >
    <div className="flex items-start gap-3">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-600"
        aria-hidden="true"
      >
        <Info className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-slate-900">
          Live generation is disabled in this demo
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          To keep the public demo safe and quota-friendly, custom AI
          generation is turned off here. Try the sample lecture, or run the
          project locally with your own Google Gemini API key to test the
          complete backend flow.
        </p>
      </div>
    </div>

    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
      <button
        type="button"
        onClick={onTrySample}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-black hover:shadow-md active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 motion-reduce:transform-none"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Try sample lecture
      </button>
      <a
        href={GITHUB_REPOSITORY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-slate-200/90 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
      >
        View GitHub setup
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </div>
  </div>
);

const TryPage = () => {
  const [initialStoredResult] = useState(loadGeneratedNotesFromStorage);
  const [selectedFile, setSelectedFile] = useState(null);
  const [restoredFileMeta, setRestoredFileMeta] = useState(() =>
    initialStoredResult
      ? {
          fileName: initialStoredResult.fileName,
          fileSize: initialStoredResult.fileSize,
          fileType: initialStoredResult.fileType.toUpperCase(),
          generatedAt: initialStoredResult.generatedAt,
          source: initialStoredResult.source || "live",
        }
      : null
  );
  const [isRestoredFromCache, setIsRestoredFromCache] = useState(
    Boolean(initialStoredResult)
  );
  const [markdown, setMarkdown] = useState(
    () => initialStoredResult?.markdown || null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [showDemoGenerationMessage, setShowDemoGenerationMessage] =
    useState(false);
  const [activeProcessingStep, setActiveProcessingStep] = useState(0);
  const showMarkdownSample =
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).get("sample") === "1";
  const displayedMarkdown =
    markdown ||
    (!selectedFile && !isGenerating && showMarkdownSample
      ? MARKDOWN_VIEWER_SAMPLE
      : null);
  const sourceFileMeta = selectedFile
    ? {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.name
          .substring(selectedFile.name.lastIndexOf("."))
          .toUpperCase(),
        source: "live",
      }
    : restoredFileMeta;
  const hasGeneratedNotes = Boolean(markdown && sourceFileMeta);
  const selectedFileExtension = sourceFileMeta?.fileType || "";
  const selectedFileSize = sourceFileMeta
    ? `${(sourceFileMeta.fileSize / 1024).toFixed(1)} KB`
    : "";
  const restoredGeneratedAt = formatGeneratedAt(
    restoredFileMeta?.generatedAt
  );
  const isCurrentDemoResult =
    sourceFileMeta?.source === "demo" && !isRestoredFromCache;

  useEffect(() => {
    if (
      !isGenerating ||
      activeProcessingStep >= processingSteps.length - 1
    ) {
      return undefined;
    }

    const stepTimer = window.setTimeout(() => {
      setActiveProcessingStep((currentStep) =>
        Math.min(currentStep + 1, processingSteps.length - 1)
      );
    }, 1100);

    return () => window.clearTimeout(stepTimer);
  }, [activeProcessingStep, isGenerating]);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setRestoredFileMeta(null);
    setIsRestoredFromCache(false);
    setError(null);
    setShowDemoGenerationMessage(false);
    clearGeneratedNotesStorage();

    if (!file) {
      setMarkdown(null);
      return;
    }

    setMarkdown(null);
  };

  const handleGenerate = async () => {
    if (!selectedFile || isGenerating) {
      return;
    }

    setError(null);
    setShowDemoGenerationMessage(false);

    if (IS_DEMO_MODE) {
      setShowDemoGenerationMessage(true);
      return;
    }

    setActiveProcessingStep(0);
    setIsGenerating(true);

    try {
      const result = await generateStudyGuide(selectedFile);

      if (result.status !== "success" || !result.data?.markdown) {
        throw new Error("The server returned an unexpected response.");
      }

      setMarkdown(result.data.markdown);
      setRestoredFileMeta(null);
      setIsRestoredFromCache(false);
      saveGeneratedNotesToStorage(result.data.markdown, selectedFile);
    } catch (requestError) {
      console.error(
        "[Lecture Companion] Study note generation failed:",
        requestError
      );
      setError(normalizeGenerationError(requestError));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTrySampleLecture = () => {
    const generatedAt = new Date().toISOString();
    const sampleMeta = {
      ...DEMO_LECTURE,
      generatedAt,
    };

    setSelectedFile(null);
    setRestoredFileMeta(sampleMeta);
    setIsRestoredFromCache(false);
    setMarkdown(DEMO_STUDY_GUIDE);
    setError(null);
    setShowDemoGenerationMessage(false);
    setActiveProcessingStep(0);
    setIsGenerating(false);
    saveGeneratedNotesToStorage(
      DEMO_STUDY_GUIDE,
      {
        name: DEMO_LECTURE.fileName,
        size: DEMO_LECTURE.fileSize,
      },
      "demo"
    );
  };

  const handleUploadAnotherFile = () => {
    setSelectedFile(null);
    setRestoredFileMeta(null);
    setIsRestoredFromCache(false);
    setMarkdown(null);
    setError(null);
    setShowDemoGenerationMessage(false);
    setActiveProcessingStep(0);
    setIsGenerating(false);
    clearGeneratedNotesStorage();
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-zinc-50 via-slate-50 to-indigo-50/50 text-slate-950">
      <header className="try-header-enter sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-lg border border-white/80 bg-white/75 px-3 py-2.5 shadow-[0_10px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:gap-4 sm:px-4">
          <a
            href="/"
            className="inline-flex min-w-0 items-center gap-2 rounded-md text-slate-950 transition-colors duration-200 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white/70"
            aria-label="Lecture Companion home"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200/70 bg-white/85 text-slate-900 shadow-sm"
              aria-hidden="true"
            >
              <BookOpen className="h-4 w-4" />
            </span>
            <span className="truncate text-[13px] font-bold tracking-tight sm:text-[15px]">
              Lecture Companion
            </span>
          </a>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <a
              href="/"
              aria-label="Back to home"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-full px-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-white/80 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white/70 sm:px-4"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Back to home</span>
            </a>
            <a
              href={GITHUB_REPOSITORY_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Lecture Companion on GitHub"
              className="inline-flex h-9 w-9 items-center justify-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white/70 min-[400px]:w-auto min-[400px]:px-3 sm:px-4"
            >
              <span className="hidden min-[400px]:inline">GitHub</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-5 sm:px-6 sm:pb-16 sm:pt-7 lg:px-8">
        <div className="max-w-3xl">
          <p className="try-title-enter try-title-label text-sm font-semibold uppercase tracking-wide text-slate-500">
            Study-note generator
          </p>
          <h1 className="try-title-enter try-title-heading mt-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Try Lecture Companion
          </h1>
          <p className="try-title-enter try-title-copy mt-2.5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Upload a .srt or .vtt subtitle file and generate clean study notes.
          </p>
        </div>

        {IS_DEMO_MODE && (
          <div className="try-demo-notice-enter mt-4 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.045)] backdrop-blur-md sm:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 text-slate-600 shadow-sm"
                  aria-hidden="true"
                >
                  <Info className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-950">
                      Public demo mode
                    </p>
                    <span className="rounded-full border border-slate-200/80 bg-slate-50/90 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                      Sample generation
                    </span>
                  </div>
                  <p className="mt-1 max-w-3xl text-sm leading-5 text-slate-600">
                    Live AI generation is disabled to protect API usage. Try a
                    sample lecture to preview, copy, download, and restore
                    generated notes.
                  </p>
                  <p className="mt-1 text-xs leading-4 text-slate-500">
                    Run the full backend workflow locally with your own Google
                    Gemini API key.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleTrySampleLecture}
                  className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-black hover:shadow-md active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 motion-reduce:transform-none"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Try sample lecture
                </button>
                <a
                  href={GITHUB_REPOSITORY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-slate-200/90 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                >
                  View setup on GitHub
                  <ExternalLink
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>
          </div>
        )}

        <div
          className={`mt-5 grid grid-cols-1 items-start gap-6 transition-[grid-template-columns] duration-500 ease-out motion-reduce:transition-none lg:gap-8 ${
            hasGeneratedNotes
              ? "lg:grid-cols-[minmax(230px,0.58fr)_minmax(0,1.42fr)]"
              : "lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
          }`}
        >
          <section
            className={`try-panel-enter try-upload-panel border border-slate-200/70 bg-white/65 shadow-[0_14px_40px_rgba(15,23,42,0.05)] backdrop-blur-md transition-[padding,border-radius] duration-300 motion-reduce:transition-none ${
              hasGeneratedNotes
                ? "rounded-3xl p-5 sm:p-6"
                : "rounded-lg p-4 sm:p-5"
            }`}
            aria-labelledby={
              hasGeneratedNotes ? "source-file-heading" : "upload-heading"
            }
          >
            {hasGeneratedNotes ? (
              <div className="try-state-enter">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {isRestoredFromCache
                        ? "Restored notes"
                        : isCurrentDemoResult
                          ? "Sample lecture"
                          : "Source file"}
                    </p>
                    <h2
                      id="source-file-heading"
                      className="mt-2 text-xl font-bold text-slate-950"
                    >
                      {isRestoredFromCache
                        ? "Previous study guide restored"
                        : isCurrentDemoResult
                          ? "Sample study guide"
                          : "Notes generated"}
                    </h2>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      isRestoredFromCache
                        ? "border-slate-200/70 bg-slate-100/80 text-slate-600"
                        : "border-emerald-200/70 bg-emerald-50/70 text-emerald-700"
                    }`}
                  >
                    {isRestoredFromCache ? (
                      <History className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Check
                        className="h-3.5 w-3.5"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                    )}
                    {isRestoredFromCache
                      ? "Restored"
                      : isCurrentDemoResult
                        ? "Demo"
                        : "Ready"}
                  </span>
                </div>

                <div className="mt-5 flex min-w-0 items-center gap-3 border-y border-slate-200/70 py-4">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 text-slate-700"
                    aria-hidden="true"
                  >
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {sourceFileMeta.fileName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedFileSize}
                    </p>
                    {isRestoredFromCache && restoredGeneratedAt && (
                      <p className="mt-1 text-xs text-slate-500">
                        {restoredGeneratedAt}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-md border border-slate-200/80 bg-slate-50 px-2 py-1 text-[11px] font-bold tracking-wide text-slate-600">
                    {selectedFileExtension}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {selectedFile
                    ? "Your study guide is ready. You can regenerate notes from this file or upload another transcript."
                    : isCurrentDemoResult
                      ? "This pre-generated sample demonstrates the complete notes experience without using the live AI service."
                      : "Your generated notes were saved locally in this browser. Upload the original file again if you want to regenerate them."}
                </p>

                <div className="mt-5 grid gap-2.5">
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      aria-busy={isGenerating}
                      className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 motion-reduce:transform-none ${
                        isGenerating
                          ? "cursor-wait bg-slate-900 text-white shadow-sm"
                          : "bg-slate-950 text-white shadow-md shadow-slate-950/15 hover:-translate-y-0.5 hover:bg-black hover:shadow-lg active:translate-y-0 active:scale-[0.99]"
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2
                            className="h-4 w-4 animate-spin motion-reduce:animate-none"
                            aria-hidden="true"
                          />
                          Regenerating notes...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" aria-hidden="true" />
                          Regenerate Notes
                        </>
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleUploadAnotherFile}
                    disabled={isGenerating}
                    className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ${
                      selectedFile
                        ? "border border-slate-200/90 bg-white/70 text-slate-700 shadow-sm hover:border-slate-300 hover:bg-white hover:text-slate-950"
                        : "bg-slate-950 text-white shadow-md shadow-slate-950/15 hover:-translate-y-0.5 hover:bg-black hover:shadow-lg active:translate-y-0 active:scale-[0.99]"
                    }`}
                  >
                    <UploadCloud className="h-4 w-4" aria-hidden="true" />
                    Upload another file
                  </button>
                  {isRestoredFromCache && (
                    <button
                      type="button"
                      onClick={handleUploadAnotherFile}
                      className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-500 transition-colors duration-200 hover:bg-slate-100/70 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Clear saved notes
                    </button>
                  )}
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Generated notes are saved locally in this browser so they
                  remain available after refresh.
                </p>

                <GenerationErrorPanel
                  error={error}
                  canRetry={Boolean(selectedFile) && !isGenerating}
                  onRetry={handleGenerate}
                />
              </div>
            ) : (
              <>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Input
                  </p>
                  <h2
                    id="upload-heading"
                    className="mt-2 text-xl font-bold text-slate-950"
                  >
                    Upload your transcript
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {IS_DEMO_MODE
                      ? "Choose one subtitle file up to 5MB to test upload validation. Use the sample lecture to preview generated notes."
                      : "Choose one subtitle file up to 5MB. Subtitle cleanup and AI generation run through the backend."}
                  </p>
                </div>

                <FileUploader
                  onFileSelect={handleFileSelect}
                  disabled={isGenerating}
                  readyLabel={IS_DEMO_MODE ? "File validated" : undefined}
                />

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!selectedFile || isGenerating}
                  aria-busy={isGenerating}
                  className={`mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 motion-reduce:transform-none ${
                    !selectedFile
                      ? "cursor-not-allowed bg-slate-200 text-slate-500 shadow-none"
                      : isGenerating
                        ? "cursor-wait bg-slate-900 text-white shadow-sm"
                        : "bg-slate-950 text-white shadow-md shadow-slate-950/15 hover:-translate-y-0.5 hover:bg-black hover:shadow-lg active:translate-y-0 active:scale-[0.99]"
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin motion-reduce:animate-none"
                        aria-hidden="true"
                      />
                      Generating notes...
                    </>
                  ) : selectedFile ? (
                    <>
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                      Generate Study Guide
                    </>
                  ) : (
                    "Select a subtitle file first"
                  )}
                </button>

                <GenerationErrorPanel
                  error={error}
                  canRetry={Boolean(selectedFile) && !isGenerating}
                  onRetry={handleGenerate}
                />
                {showDemoGenerationMessage && (
                  <DemoGenerationMessage
                    onTrySample={handleTrySampleLecture}
                  />
                )}
              </>
            )}
          </section>

          <section
            className="try-panel-enter try-notes-panel"
            aria-labelledby="notes-heading"
          >
            <h2 id="notes-heading" className="sr-only">
              Generated study notes
            </h2>
            {isGenerating ? (
              <div
                className="try-state-enter flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-slate-200/70 bg-white/60 px-6 py-8 text-center shadow-[0_14px_40px_rgba(15,23,42,0.04)] backdrop-blur-md sm:min-h-[380px] sm:px-10 lg:min-h-[440px]"
                aria-live="polite"
                aria-label={`Preparing study guide: ${processingSteps[activeProcessingStep]}`}
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-600 shadow-sm"
                  aria-hidden="true"
                >
                  <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" />
                </span>

                <h3 className="mt-5 text-lg font-bold text-slate-950">
                  Preparing your study guide...
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Lecture Companion is cleaning the transcript, organizing the
                  lecture content, and generating structured notes.
                </p>

                <ul className="mt-6 grid w-full max-w-md gap-2 text-left sm:grid-cols-2">
                  {processingSteps.map((step, index) => (
                    <li
                      key={step}
                      className={`flex min-h-10 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
                        index === activeProcessingStep
                          ? "bg-slate-100/80 font-medium text-slate-900"
                          : index < activeProcessingStep
                            ? "text-slate-600"
                            : "text-slate-400"
                      }`}
                    >
                      {index < activeProcessingStep ? (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                          <Check
                            className="h-3 w-3"
                            strokeWidth={2.5}
                            aria-hidden="true"
                          />
                        </span>
                      ) : index === activeProcessingStep ? (
                        <Loader2
                          className="h-4 w-4 shrink-0 animate-spin text-slate-600 motion-reduce:animate-none"
                          aria-hidden="true"
                        />
                      ) : (
                        <span
                          className="ml-1 h-2 w-2 shrink-0 rounded-full bg-slate-200"
                          aria-hidden="true"
                        />
                      )}
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            ) : displayedMarkdown ? (
              <div>
                {isRestoredFromCache && (
                  <div className="mb-3 flex justify-start">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-slate-100/80 px-3 py-1 text-xs font-semibold text-slate-600">
                      <History className="h-3.5 w-3.5" aria-hidden="true" />
                      Restored from previous session
                    </span>
                  </div>
                )}
                {isCurrentDemoResult && (
                  <div className="mb-3 flex justify-start">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-slate-100/80 px-3 py-1 text-xs font-semibold text-slate-600">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      Sample lecture result
                    </span>
                  </div>
                )}
                <MarkdownViewer
                  markdown={displayedMarkdown}
                  fileName={
                    sourceFileMeta?.fileName ||
                    (showMarkdownSample ? "sample-lecture.vtt" : undefined)
                  }
                />
              </div>
            ) : (
              <div className="try-state-enter flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-slate-200/70 bg-white/60 px-6 py-8 text-center shadow-[0_14px_40px_rgba(15,23,42,0.04)] backdrop-blur-md sm:min-h-[380px] sm:px-10 lg:min-h-[440px]">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-600 shadow-sm"
                  aria-hidden="true"
                >
                  <BookOpen className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-slate-950">
                  Your generated study notes will appear here.
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Upload a .srt or .vtt file and generate notes to preview them
                  here.
                </p>

                <div
                  className="mt-5 flex flex-wrap justify-center gap-2"
                  aria-hidden="true"
                >
                  {previewHighlights.map(({ label, icon: Icon }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/75 bg-white/75 px-3 py-1.5 text-xs font-medium text-slate-500"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </span>
                  ))}
                </div>

                <div
                  className="mt-6 w-full max-w-sm border-t border-slate-200/70 pt-5 text-left"
                  aria-hidden="true"
                >
                  <div className="h-2 w-2/5 rounded-full bg-slate-200/80" />
                  <div className="mt-3 space-y-2">
                    <div className="h-1.5 w-full rounded-full bg-slate-200/55" />
                    <div className="h-1.5 w-11/12 rounded-full bg-slate-200/55" />
                    <div className="h-1.5 w-4/5 rounded-full bg-slate-200/55" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-300/80" />
                    <div className="h-1.5 w-3/5 rounded-full bg-slate-200/55" />
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default TryPage;
