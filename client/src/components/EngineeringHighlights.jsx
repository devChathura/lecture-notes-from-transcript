import { useEffect, useRef, useState } from "react";
import {
  BrainCircuit,
  Braces,
  FileText,
  Scissors,
  ShieldCheck,
  Split,
} from "lucide-react";

const engineeringHighlights = [
  {
    label: "Parser",
    title: "Subtitle Parser Pipeline",
    description:
      "Raw .srt and .vtt uploads are read from memory on the Express backend and routed through format-specific parsers before AI processing.",
    icon: FileText,
  },
  {
    label: "Cleanup",
    title: "Timestamp and Noise Removal",
    description:
      "The parsers remove SRT sequence blocks, VTT headers, cue timestamps, and HTML-style tags, then normalize line breaks into plain lecture text.",
    icon: Scissors,
  },
  {
    label: "Chunking",
    title: "Long Transcript Chunking",
    description:
      "LangChain's recursive text splitter prepares long transcripts as 4,000-character chunks with 400 characters of overlap before single-pass synthesis.",
    icon: Split,
  },
  {
    label: "AI",
    title: "Gemini Note Generation",
    description:
      "Gemini 2.5 Flash receives the rejoined transcript with a prompt for Markdown headings, summaries, key terminology, and readable bullet points.",
    icon: BrainCircuit,
  },
  {
    label: "Architecture",
    title: "Client-Server Separation",
    description:
      "React handles uploads and results in the browser, while Express manages parsing, chunking, Gemini requests, and the server-side API key.",
    icon: ShieldCheck,
  },
  {
    label: "Output",
    title: "Markdown Study Workflow",
    description:
      "The API returns structured Markdown with file and chunk metadata; the client renders the notes with ReactMarkdown and supports one-click copying.",
    icon: Braces,
  },
];

const EngineeringHighlightCard = ({ highlight, index, isVisible }) => {
  const Icon = highlight.icon;

  return (
    <div
      className={`engineering-card-reveal h-full ${
        isVisible ? "is-visible" : ""
      }`}
      style={{ "--engineering-delay": `${150 + index * 80}ms` }}
    >
      <article className="engineering-highlight-card relative flex h-full flex-col overflow-hidden rounded-lg border border-slate-200/65 bg-white/55 p-5 backdrop-blur-md sm:p-6">
        <span className="absolute inset-x-0 top-0 h-px bg-slate-300/60" />

        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-xs font-semibold uppercase leading-4 text-slate-500">
            {highlight.label}
          </span>
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200/75 bg-slate-50/85 text-slate-600"
            aria-hidden="true"
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </span>
        </div>

        <h3 className="mt-6 text-lg font-bold leading-6 text-slate-950">
          {highlight.title}
        </h3>
        <p className="mt-2.5 text-[15px] leading-6 text-slate-600">
          {highlight.description}
        </p>
      </article>
    </div>
  );
};

const EngineeringHighlights = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || isVisible) {
      return undefined;
    }

    if (!("IntersectionObserver" in window)) {
      const fallbackId = window.setTimeout(() => setIsVisible(true), 0);
      return () => window.clearTimeout(fallbackId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -5% 0px",
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      id="engineering"
      className="engineering-section relative isolate scroll-mt-32 overflow-hidden pb-20 pt-8 sm:pb-24 sm:pt-10"
      aria-labelledby="engineering-heading"
    >
      <div className="relative z-10 mx-auto max-w-[1180px]">
        <div
          className={`engineering-header-reveal max-w-3xl ${
            isVisible ? "is-visible" : ""
          }`}
        >
          <p className="text-sm font-bold uppercase text-slate-500">
            Engineering highlights
          </p>
          <h2
            id="engineering-heading"
            className="mt-3 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl lg:text-5xl"
          >
            Engineering the path from subtitles to study notes.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Lecture Companion combines transcript parsing, cleanup, chunking,
            AI orchestration, and a clean client-server architecture to turn
            raw subtitles into reliable study notes.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:mt-11 lg:grid-cols-3 lg:gap-6">
          {engineeringHighlights.map((highlight, index) => (
            <EngineeringHighlightCard
              key={highlight.title}
              highlight={highlight}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EngineeringHighlights;
