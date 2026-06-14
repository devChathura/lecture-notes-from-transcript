import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileText,
} from "lucide-react";

const workflowSteps = [
  { label: "Raw", status: "Raw subtitle", ariaLabel: "View raw subtitle step" },
  {
    label: "Clean",
    status: "Cleaning",
    ariaLabel: "View clean transcript step",
  },
  { label: "AI", status: "AI processing", ariaLabel: "View AI processing step" },
  { label: "Notes", status: "Notes ready", ariaLabel: "View study notes step" },
];

const processItems = [
  "Transcript cleaned",
  "Content chunked",
  "Key ideas extracted",
  "Notes structured",
];

const stepDurations = [2200, 2200, 3000, 0];
const inactivityDelay = 6000;
const confettiCooldown = 1200;

const Hero = () => {
  return (
    <section className="hero-ambient relative isolate mx-auto w-full max-w-[1240px] overflow-hidden px-4 pb-12 pt-[96px] sm:px-6 lg:flex lg:min-h-[calc(100vh-4rem)] lg:items-center lg:pb-8 lg:pt-20">
      <div className="relative z-10 grid w-full items-center gap-8 lg:grid-cols-[0.96fr_1.04fr] lg:gap-10">
        <div className="flex flex-col items-start">
          <h1 className="max-w-3xl animate-hero-headline text-left font-sans text-[40px] font-[680] leading-[1.05] tracking-tight text-[#141414] motion-reduce:animate-none sm:text-[52px] lg:text-[58px]">
            From Messy Lecture Subtitles to Clean Study Notes.
          </h1>

          <p className="mt-5 max-w-2xl animate-hero-subtitle text-left text-[16px] font-[440] leading-[1.65] text-[#5f6368] motion-reduce:animate-none sm:text-[17px]">
            Built for students who do not want to pause lectures 100 times just
            to take notes. Upload a .srt or .vtt transcript and Lecture
            Companion cleans, chunks, and converts it into structured Markdown
            study notes using AI.
          </p>

          <div className="mt-7 flex w-full animate-hero-actions flex-col gap-3 motion-reduce:animate-none sm:w-auto sm:flex-row">
            <a
              href="/try"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#141414] px-6 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-slate-950/15 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-black hover:shadow-xl hover:shadow-slate-950/20 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 motion-reduce:transform-none"
            >
              Try Lecture Companion
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="https://github.com/devChathura"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300/80 bg-white/55 px-6 py-3.5 text-[15px] font-semibold text-[#141414] shadow-sm backdrop-blur-md transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white/80 hover:shadow-md active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 motion-reduce:transform-none"
            >
              <ExternalLink className="h-4 w-4" />
              View GitHub
            </a>
          </div>

          <p className="mt-5 max-w-xl animate-hero-support text-left text-sm font-medium leading-6 text-slate-500 motion-reduce:animate-none">
            Built by a Software Engineering undergraduate to solve my own
            lecture revision workflow.
          </p>
        </div>

        <WorkflowDemoCard />
      </div>
    </section>
  );
};

const WorkflowDemoCard = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoplaying, setIsAutoplaying] = useState(true);
  const confettiCanvasRef = useRef(null);
  const confettiInstanceRef = useRef(null);
  const confettiTimersRef = useRef([]);
  const lastConfettiAtRef = useRef(0);
  const timerRef = useRef(null);
  const inactivityTimerRef = useRef(null);

  const clearPlaybackTimers = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (inactivityTimerRef.current) {
      window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  };

  const startInactivityTimer = () => {
    inactivityTimerRef.current = window.setTimeout(() => {
      setIsAutoplaying(true);
      inactivityTimerRef.current = null;
    }, inactivityDelay);
  };

  useEffect(() => {
    if (!isAutoplaying || activeStep === workflowSteps.length - 1) {
      return undefined;
    }

    timerRef.current = window.setTimeout(() => {
      setActiveStep((step) => {
        const nextStep = step + 1;

        if (nextStep === workflowSteps.length - 1) {
          setIsAutoplaying(false);
        }

        return nextStep;
      });
    }, stepDurations[activeStep]);

    return () => window.clearTimeout(timerRef.current);
  }, [activeStep, isAutoplaying]);

  useEffect(() => {
    if (activeStep !== workflowSteps.length - 1) {
      return undefined;
    }

    if (!confettiCanvasRef.current) {
      return undefined;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const now = Date.now();

    if (now - lastConfettiAtRef.current < confettiCooldown) {
      return undefined;
    }

    lastConfettiAtRef.current = now;

    confettiTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    confettiTimersRef.current = [];

    if (!confettiInstanceRef.current) {
      confettiInstanceRef.current = confetti.create(confettiCanvasRef.current, {
        resize: true,
        useWorker: true,
      });
    }

    const fire = (originX, delay) => {
      const timer = window.setTimeout(() => {
        confettiInstanceRef.current({
          particleCount: 24,
          spread: 62,
          startVelocity: 20,
          scalar: 0.72,
          gravity: 0.95,
          ticks: 90,
          origin: { x: originX, y: 0.06 },
          colors: ["#0f172a", "#334155", "#60a5fa", "#93c5fd", "#cbd5e1"],
          disableForReducedMotion: true,
        });
      }, delay);

      confettiTimersRef.current.push(timer);
    };

    fire(0.3, 0);
    fire(0.5, 180);
    fire(0.7, 360);
    fire(0.5, 540);

    return () => {
      confettiTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      confettiTimersRef.current = [];
    };
  }, [activeStep]);

  useEffect(() => {
    return () => {
      clearPlaybackTimers();
      confettiTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      confettiInstanceRef.current?.reset();
    };
  }, []);

  const handleStepClick = (index) => {
    clearPlaybackTimers();
    setIsAutoplaying(false);
    setActiveStep(index);

    if (index !== workflowSteps.length - 1) {
      startInactivityTimer();
    }
  };

  return (
    <div className="relative w-full animate-workflow-card-enter motion-reduce:animate-none lg:ml-auto lg:max-w-[570px]">
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-200/35 via-white/10 to-slate-200/45 blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/75 bg-white/76 shadow-2xl shadow-slate-950/10 backdrop-blur-xl">
        <canvas
          ref={confettiCanvasRef}
          className="pointer-events-none absolute inset-0 z-20 h-full w-full"
        />

        <div className="flex items-center justify-between gap-4 border-b border-slate-200/70 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">
                lecture-05.vtt
              </p>
              <p className="text-xs font-medium text-slate-500">
                Subtitle transcript
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-full bg-white/75 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/70">
            <BrainCircuit className="h-3.5 w-3.5 text-blue-600" />
            {workflowSteps[activeStep].status}
          </div>
        </div>

        <HorizontalProgressStepper
          activeStep={activeStep}
          onStepClick={handleStepClick}
        />

        <PreviewPanel activeStep={activeStep} />
      </div>
    </div>
  );
};

const HorizontalProgressStepper = ({ activeStep, onStepClick }) => {
  const progressWidth =
    activeStep === 0
      ? "0px"
      : `calc(${(activeStep / (workflowSteps.length - 1)) * 100}% - 2.5rem)`;

  return (
    <div className="border-b border-slate-200/70 bg-white/38 px-4 py-3">
      <div className="relative mx-auto max-w-sm">
        <div className="absolute left-5 right-5 top-3.5 h-0.5 rounded-full bg-slate-200" />
        <div
          className="absolute left-5 top-3.5 h-0.5 rounded-full bg-slate-950 transition-all duration-500 ease-out motion-reduce:transition-none"
          style={{ width: progressWidth }}
        />

        <div className="relative grid grid-cols-4 gap-2">
          {workflowSteps.map((step, index) => (
            <button
              key={step.label}
              type="button"
              onClick={() => onStepClick(index)}
              className="group flex cursor-pointer flex-col items-center gap-1.5 rounded-xl px-1.5 py-1 text-center transition-all duration-200 hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white/70 motion-reduce:transition-none"
              aria-label={step.ariaLabel}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none ${
                  activeStep === index
                    ? "scale-105 border-slate-950 bg-slate-950 text-white"
                    : activeStep > index
                      ? "border-slate-800 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-400 group-hover:border-slate-300 group-hover:text-slate-600"
                }`}
              >
                {activeStep > index ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={`text-xs transition-colors duration-200 motion-reduce:transition-none ${
                  activeStep === index
                    ? "font-bold text-slate-950"
                    : activeStep > index
                      ? "font-semibold text-slate-700 group-hover:text-slate-900"
                      : "font-semibold text-slate-500 group-hover:text-slate-800"
                }`}
              >
                {step.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const PreviewPanel = ({ activeStep }) => {
  return (
    <div className="bg-slate-50/45 p-3.5 sm:p-4">
      <div
        key={activeStep}
        className="min-h-[292px] animate-preview-enter rounded-[1.35rem] bg-white/70 p-4 motion-reduce:animate-none lg:min-h-[318px]"
      >
        {activeStep === 0 && <RawSubtitlePreview />}
        {activeStep === 1 && <CleanTranscriptPreview />}
        {activeStep === 2 && <AIProcessingPreview />}
        {activeStep === 3 && <StudyNotesPreview />}
      </div>
    </div>
  );
};

const RawSubtitlePreview = () => {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <PreviewHeader eyebrow="Raw subtitles" title="Messy lecture input" />
        <span
          className="preview-reveal rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200"
          style={{ "--preview-delay": "40ms" }}
        >
          .vtt
        </span>
      </div>

      <div className="mt-3 rounded-xl bg-slate-50/80 px-3.5 py-3 font-mono text-[11px] leading-5 text-slate-500 ring-1 ring-slate-200/50">
        <div
          className="preview-reveal"
          style={{ "--preview-delay": "70ms" }}
        >
          <p className="text-slate-400">1</p>
          <p>
            <span className="rounded bg-blue-50 px-1 py-0.5 text-blue-700">
              00:00:01,240 --&gt; 00:00:04,000
            </span>
          </p>
          <p className="text-slate-700">
            Today we are going to discuss authentication...
          </p>
        </div>

        <div
          className="preview-reveal mt-2.5"
          style={{ "--preview-delay": "130ms" }}
        >
          <p className="text-slate-400">2</p>
          <p>
            <span className="rounded bg-blue-50 px-1 py-0.5 text-blue-700">
              00:00:04,150 --&gt; 00:00:07,000
            </span>
          </p>
          <p className="text-slate-700">
            Authentication is the process of verifying identity...
          </p>
        </div>

        <div
          className="preview-reveal mt-2.5"
          style={{ "--preview-delay": "190ms" }}
        >
          <p className="text-slate-400">3</p>
          <p>
            <span className="rounded bg-blue-50 px-1 py-0.5 text-blue-700">
              00:00:07,200 --&gt; 00:00:10,500
            </span>
          </p>
          <p className="text-slate-700">
            Authorization controls what a user can access...
          </p>
        </div>
      </div>
    </div>
  );
};

const CleanTranscriptPreview = () => {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <PreviewHeader
          eyebrow="Clean transcript"
          title="Readable lecture text"
        />
        <span
          className="preview-reveal rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100"
          style={{ "--preview-delay": "40ms" }}
        >
          timestamps removed
        </span>
      </div>

      <div className="mt-4 space-y-3 rounded-xl bg-slate-50/55 px-4 py-4 text-sm leading-6 text-slate-700 ring-1 ring-slate-200/45">
        <p
          className="preview-reveal"
          style={{ "--preview-delay": "80ms" }}
        >
          Today we are going to discuss authentication.
        </p>
        <p
          className="preview-reveal"
          style={{ "--preview-delay": "140ms" }}
        >
          Authentication is the process of verifying identity.
        </p>
        <p
          className="preview-reveal"
          style={{ "--preview-delay": "200ms" }}
        >
          Authorization controls what a user can access.
        </p>
      </div>
    </div>
  );
};

const AIProcessingPreview = () => {
  const [processingProgress, setProcessingProgress] = useState(0);
  const isProcessingComplete = processingProgress === 100;

  useEffect(() => {
    const duration = Math.max(1200, stepDurations[2] - 250);
    const updateInterval = 50;
    const totalTicks = Math.ceil(duration / updateInterval);
    let currentTick = 0;

    const intervalId = window.setInterval(() => {
      currentTick += 1;
      const nextProgress = Math.min(
        Math.round((currentTick / totalTicks) * 100),
        100
      );

      setProcessingProgress(nextProgress);

      if (nextProgress === 100) {
        window.clearInterval(intervalId);
      }
    }, updateInterval);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div>
      <PreviewHeader eyebrow="AI processing" title="Generating study notes" />

      <div className="mt-4 rounded-xl bg-slate-50/55 px-4 py-3.5 ring-1 ring-slate-200/45">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              {!isProcessingComplete && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-40 motion-reduce:animate-none" />
              )}
              <span
                className={`relative inline-flex h-3 w-3 rounded-full ${
                  isProcessingComplete ? "bg-emerald-500" : "bg-blue-500"
                }`}
              />
            </span>
            <p className="text-sm font-semibold text-slate-800">
              {isProcessingComplete
                ? "Ready to generate notes"
                : "Structuring notes..."}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {processingProgress}%
          </span>
        </div>

        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label="AI note generation progress"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={processingProgress}
        >
          <div
            className="h-full rounded-full bg-slate-950 transition-[width] duration-150 ease-out motion-reduce:transition-none"
            style={{ width: `${processingProgress}%` }}
          />
        </div>
      </div>

      <div className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2">
        {processItems.map((item, index) => {
          const threshold = (index + 1) * 25;
          const isComplete = processingProgress >= threshold;

          return (
          <div key={item} className="flex items-center gap-3 px-1 py-1.5">
            <CheckCircle2
              className={`h-4 w-4 shrink-0 transition-colors duration-200 motion-reduce:transition-none ${
                isComplete
                  ? "checklist-complete text-emerald-600"
                  : "text-slate-300"
              }`}
            />
            <span
              className={`text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none ${
                isComplete ? "text-slate-700" : "text-slate-400"
              }`}
            >
              {item}
            </span>
          </div>
          );
        })}
      </div>
    </div>
  );
};

const StudyNotesPreview = () => {
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div
          className="preview-reveal"
          style={{ "--preview-delay": "30ms" }}
        >
          <PreviewHeader
            eyebrow="Study notes ready"
            title="Lecture 05: Authentication"
          />
        </div>
        <div
          className="preview-reveal flex gap-2"
          style={{ "--preview-delay": "230ms" }}
        >
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 motion-reduce:transform-none"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Notes
          </button>
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-px hover:bg-black hover:shadow-md active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 motion-reduce:transform-none"
          >
            <Download className="h-3.5 w-3.5" />
            Download .md
          </button>
        </div>
      </div>

      <div className="mt-3 px-1 py-1">
        <section
          className="preview-reveal"
          style={{ "--preview-delay": "90ms" }}
        >
          <h4 className="text-sm font-bold text-slate-950">Key Ideas</h4>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-700">
            <li>Authentication verifies identity.</li>
            <li>Authorization controls access.</li>
            <li>Passwords should be stored securely using hashing.</li>
          </ul>
        </section>

        <section
          className="preview-reveal mt-3 border-t border-slate-200/60 pt-3"
          style={{ "--preview-delay": "160ms" }}
        >
          <h4 className="text-sm font-bold text-slate-950">Key Terms</h4>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <TermDefinition
              term="Authentication"
              definition="The process of confirming who a user is."
            />
            <TermDefinition
              term="Authorization"
              definition="The process of deciding what a user can access."
            />
          </div>
        </section>
      </div>
    </div>
  );
};

const PreviewHeader = ({ eyebrow, title }) => {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-slate-400">{eyebrow}</p>
      <h3 className="mt-1 text-base font-bold tracking-tight text-slate-950 sm:text-lg">
        {title}
      </h3>
    </div>
  );
};

const TermDefinition = ({ term, definition }) => {
  return (
    <div className="rounded-lg bg-slate-50/70 px-3 py-2">
      <p className="text-xs font-bold text-slate-950">{term}</p>
      <p className="mt-1 text-xs leading-5 text-slate-600">{definition}</p>
    </div>
  );
};

export default Hero;
