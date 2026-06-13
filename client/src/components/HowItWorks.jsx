import { useEffect, useRef, useState } from "react";

const workflowSteps = [
  {
    label: "Input",
    title: "Upload a subtitle file",
    description:
      "Drop in a .srt or .vtt file from a recorded lecture, online course, or saved video transcript.",
  },
  {
    label: "Cleanup",
    title: "Clean the transcript",
    description:
      "Timestamps, sequence numbers, repeated spacing, and subtitle formatting noise are removed automatically.",
  },
  {
    label: "AI Processing",
    title: "Generate study notes",
    description:
      "AI turns the cleaned lecture text into headings, summaries, key ideas, and important terms.",
  },
  {
    label: "Output",
    title: "Export and revise",
    description:
      "Copy the notes instantly or download them as a Markdown file for Obsidian, Notion, GitHub, or your study folder.",
  },
];

const HowItWorksStep = ({ step, index, isVisible }) => {
  const isLastStep = index === workflowSteps.length - 1;

  return (
    <div
      className={`how-it-works-step-reveal relative z-10 grid h-full grid-cols-[2.75rem_1fr] gap-3 md:flex md:flex-col md:gap-4 ${
        isVisible ? "is-visible" : ""
      }`}
      style={{ "--step-delay": `${160 + index * 100}ms` }}
    >
      <div className="relative flex justify-center md:justify-start lg:justify-center">
        <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-300/80 bg-white text-sm font-bold text-slate-950 shadow-[0_4px_14px_rgba(15,23,42,0.07)]">
          {String(index + 1).padStart(2, "0")}
        </span>

        {!isLastStep && (
          <span className="absolute bottom-[-1.25rem] left-1/2 top-11 w-px -translate-x-1/2 bg-slate-200/90 md:hidden" />
        )}
      </div>

      <article className="how-it-works-card flex h-full flex-col rounded-lg border border-slate-200/65 bg-white/55 p-5 backdrop-blur-md sm:p-6">
        <p className="text-xs font-bold uppercase text-slate-400">
          {step.label}
        </p>
        <h3 className="mt-2 text-lg font-bold leading-6 text-slate-950">
          {step.title}
        </h3>
        <p className="mt-2.5 text-[15px] leading-6 text-slate-600">
          {step.description}
        </p>
      </article>
    </div>
  );
};

const HowItWorks = () => {
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
      id="how-it-works"
      className="scroll-mt-32 pb-20 pt-8 sm:pb-24 sm:pt-10"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-[1180px]">
        <div
          className={`how-it-works-header-reveal max-w-3xl ${
            isVisible ? "is-visible" : ""
          }`}
        >
          <p className="text-sm font-bold uppercase text-slate-500">
            How it works
          </p>
          <h2
            id="how-it-works-heading"
            className="mt-3 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl lg:text-5xl"
          >
            From subtitle file to study-ready notes in four steps.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Lecture Companion cleans the messy parts of your transcript,
            structures the important ideas, and gives you notes you can
            actually revise from.
          </p>
        </div>

        <div className="relative mt-10 lg:mt-11">
          <div
            className={`how-it-works-line-reveal absolute left-[12.5%] right-[12.5%] top-[1.375rem] hidden h-px bg-slate-200/90 lg:block ${
              isVisible ? "is-visible" : ""
            }`}
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {workflowSteps.map((step, index) => (
              <HowItWorksStep
                key={step.title}
                step={step}
                index={index}
                isVisible={isVisible}
              />
            ))}
          </div>
        </div>

        <p
          className={`how-it-works-summary-reveal mt-7 text-sm font-medium leading-6 text-slate-500 ${
            isVisible ? "is-visible" : ""
          }`}
        >
          Raw subtitles become clean, structured notes without manual cleanup.
        </p>
      </div>
    </section>
  );
};

export default HowItWorks;
