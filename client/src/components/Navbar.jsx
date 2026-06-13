import { BookOpen, ExternalLink } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
];

const Navbar = () => {
  return (
    <div className="pointer-events-none fixed left-0 right-0 top-4 z-50 flex justify-center px-3 sm:top-6 sm:px-4">
      <nav className="pointer-events-auto flex w-full max-w-3xl animate-navbar-enter items-center justify-between rounded-full border border-white/65 bg-white/78 px-3 py-2 shadow-[0_8px_30px_rgba(15,23,42,0.1)] backdrop-blur-xl motion-reduce:animate-none sm:px-4">
        <a
          href="#"
          className="flex min-w-0 items-center gap-2 rounded-full pr-2 text-slate-950 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white/70"
          aria-label="Lecture Companion home"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200/70 bg-white/75 text-slate-900 shadow-sm">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="truncate font-sans text-sm font-bold tracking-tight sm:text-[15px]">
            Lecture Companion
          </span>
        </a>

        <div className="flex items-center gap-1">
          <div className="hidden items-center gap-1 sm:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-2 font-sans text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-white/70 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white/70 md:px-4"
              >
                {link.label}
              </a>
            ))}
          </div>

          <a
            href="https://github.com/devChathura"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-white/55 px-3 py-2 font-sans text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-white/80 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white/70 sm:px-4"
          >
            GitHub
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
