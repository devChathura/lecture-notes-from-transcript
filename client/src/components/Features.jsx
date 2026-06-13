import { useEffect, useRef, useState } from "react";
import {
  BookOpenCheck,
  BrainCircuit,
  Copy,
  Download,
  ScanText,
  Upload,
} from "lucide-react";

const features = [
  {
    title: "SRT / VTT Uploads",
    description:
      "Upload lecture subtitle files directly from recorded classes, online courses, or saved video transcripts.",
    icon: Upload,
  },
  {
    title: "Transcript Cleanup",
    description:
      "Automatically removes timestamps, sequence numbers, subtitle noise, and formatting clutter from raw transcript files.",
    icon: ScanText,
  },
  {
    title: "AI Study Guide Generation",
    description:
      "Turns cleaned lecture text into structured notes with headings, summaries, key ideas, and important terms.",
    icon: BrainCircuit,
  },
  {
    title: "Markdown Export",
    description:
      "Download generated notes as clean Markdown files for Obsidian, Notion, GitHub, or your personal study folder.",
    icon: Download,
  },
  {
    title: "Copy to Clipboard",
    description:
      "Copy generated notes instantly and paste them into your preferred note-taking workflow.",
    icon: Copy,
  },
  {
    title: "Student-Friendly Output",
    description:
      "Creates readable study material designed for revision, not just raw AI summaries.",
    icon: BookOpenCheck,
  },
];

const FeatureCard = ({ feature, index, isVisible }) => {
  const Icon = feature.icon;

  return (
    <div
      className={`feature-reveal-card h-full ${
        isVisible ? "is-visible" : ""
      }`}
      style={{ "--feature-delay": `${140 + index * 70}ms` }}
    >
      <article className="feature-card-surface flex h-full flex-col rounded-lg border border-slate-200/70 bg-white/70 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-md sm:p-6">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-100/80 text-slate-800 shadow-sm"
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>

        <h3 className="mt-5 text-lg font-bold leading-6 text-slate-950">
          {feature.title}
        </h3>
        <p className="mt-2.5 text-[15px] leading-6 text-slate-600">
          {feature.description}
        </p>
      </article>
    </div>
  );
};

const Features = () => {
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
      id="features"
      className="scroll-mt-32 pb-20 pt-14 sm:pb-24 sm:pt-16"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-[1180px]">
        <div
          className={`features-header-reveal max-w-3xl ${
            isVisible ? "is-visible" : ""
          }`}
        >
          <p className="text-sm font-bold uppercase text-slate-500">
            Features
          </p>
          <h2
            id="features-heading"
            className="mt-3 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl lg:text-5xl"
          >
            Everything you need to turn transcripts into study material.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Lecture Companion handles the messy parts of transcript cleanup,
            AI summarization, and Markdown export so students can focus on
            studying.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:mt-11 lg:grid-cols-3 lg:gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
