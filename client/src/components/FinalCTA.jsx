import { useEffect, useRef, useState } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";

const FinalCTA = () => {
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
        threshold: 0.24,
        rootMargin: "0px 0px -4% 0px",
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      id="try"
      className="scroll-mt-32 pb-20 pt-8 sm:pb-24 sm:pt-10"
      aria-labelledby="final-cta-heading"
    >
      <div
        className={`final-cta-reveal mx-auto max-w-4xl rounded-lg border border-slate-200/70 bg-white/60 px-6 py-12 text-center shadow-[0_18px_50px_rgba(15,23,42,0.055)] backdrop-blur-md sm:px-10 sm:py-14 lg:px-14 ${
          isVisible ? "is-visible" : ""
        }`}
      >
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase text-slate-500">
            Try Lecture Companion
          </p>
          <h2
            id="final-cta-heading"
            className="mt-3 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl"
          >
            Turn your next lecture transcript into study-ready notes.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Upload a subtitle file, let Lecture Companion clean and structure
            it, then copy or download your notes for revision.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="/try"
              className="final-cta-link inline-flex items-center justify-center gap-2 rounded-full bg-[#141414] px-6 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-slate-950/15 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-black hover:shadow-xl hover:shadow-slate-950/20 active:translate-y-0 active:scale-[0.99] motion-reduce:transform-none"
            >
              Try Lecture Companion
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="https://github.com/devChathura/lecture-notes-from-transcript"
              target="_blank"
              rel="noopener noreferrer"
              className="final-cta-link inline-flex items-center justify-center gap-2 rounded-full border border-slate-300/80 bg-white/55 px-6 py-3.5 text-[15px] font-semibold text-[#141414] shadow-sm backdrop-blur-md transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white/80 hover:shadow-md active:translate-y-0 active:scale-[0.99] motion-reduce:transform-none"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              View GitHub
            </a>
          </div>

          <p className="mt-6 text-sm font-medium leading-6 text-slate-500">
            Built as a personal project to solve a real lecture revision
            problem.
          </p>
          <a
            href="https://medium.com/@nozerochathura/building-a-stateless-subtitle-parser-in-node-js-extracting-clean-text-from-srt-and-vtt-files-d978d6c3b34c"
            target="_blank"
            rel="noopener noreferrer"
            className="final-cta-link mt-2 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4 transition-colors duration-200 hover:text-slate-950"
          >
            Read the parser pipeline article
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
