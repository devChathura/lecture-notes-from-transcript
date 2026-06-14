import {
  BookOpen,
  ExternalLink,
  GitBranch,
  Globe2,
  Newspaper,
  UserRound,
} from "lucide-react";

const GITHUB_URL =
  "https://github.com/devChathura/lecture-notes-from-transcript";
const PORTFOLIO_URL = "https://chathura-hapukotuwa.netlify.app/";
const LINKEDIN_URL = "https://www.linkedin.com/in/chathura-hapukotuwa/";
const MEDIUM_PROFILE_URL = "https://medium.com/@nozerochathura";
const PARSER_ARTICLE_URL =
  "https://medium.com/@nozerochathura/building-a-stateless-subtitle-parser-in-node-js-extracting-clean-text-from-srt-and-vtt-files-d978d6c3b34c";

const linkGroups = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Try Lecture Companion", href: "/try" },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "Engineering", href: "#engineering" },
      { label: "GitHub", href: GITHUB_URL, external: true },
      { label: "Parser article", href: PARSER_ARTICLE_URL, external: true },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Portfolio", href: PORTFOLIO_URL, external: true },
      { label: "LinkedIn", href: LINKEDIN_URL, external: true },
      { label: "Medium", href: MEDIUM_PROFILE_URL, external: true },
    ],
  },
];

const profileLinks = [
  { label: "GitHub", href: GITHUB_URL, icon: GitBranch },
  { label: "Portfolio", href: PORTFOLIO_URL, icon: Globe2 },
  { label: "LinkedIn", href: LINKEDIN_URL, icon: UserRound },
  { label: "Medium", href: MEDIUM_PROFILE_URL, icon: Newspaper },
];

const FooterLink = ({ link }) => (
  <a
    href={link.href}
    target={link.external ? "_blank" : undefined}
    rel={link.external ? "noopener noreferrer" : undefined}
    className="inline-flex items-center gap-1.5 rounded-sm text-sm leading-6 text-slate-600 transition-colors duration-200 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
  >
    {link.label}
    {link.external && (
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    )}
  </a>
);

const Footer = () => {
  return (
    <footer className="-mx-8 -mb-8 bg-transparent pb-0 pt-16 sm:mx-0 sm:pt-20">
      <div className="relative w-full overflow-hidden rounded-t-3xl rounded-b-none border-x-0 border-b-0 border-t border-slate-200/70 bg-white/65 text-slate-950 shadow-none backdrop-blur-xl sm:mx-auto sm:max-w-[1350px] sm:border sm:shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
        <div className="relative z-10 px-6 pt-10 sm:px-8 md:px-12 lg:px-16 lg:pt-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            <div>
              <a
                href="/"
                aria-label="Lecture Companion home"
                className="inline-flex items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-900 shadow-sm"
                  aria-hidden="true"
                >
                  <BookOpen className="h-5 w-5" />
                </span>
                <span className="text-lg font-bold text-slate-950">
                  Lecture Companion
                </span>
              </a>

              <p className="mt-5 max-w-md text-[15px] leading-7 text-slate-600">
                An AI-powered study tool that turns messy lecture subtitle
                files into clean, structured Markdown notes.
              </p>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Built by Chathura Hapukotuwa to solve a real lecture revision
                workflow.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {profileLinks.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/75 bg-white/55 text-slate-500 transition-colors duration-200 hover:border-slate-300 hover:bg-white/85 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>

            <nav
              aria-label="Footer navigation"
              className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3"
            >
              {linkGroups.map((group) => (
                <div
                  key={group.title}
                  className={
                    group.title === "Connect" ? "col-span-2 sm:col-span-1" : ""
                  }
                >
                  <h2 className="text-sm font-bold text-slate-950">
                    {group.title}
                  </h2>
                  <ul className="mt-4 space-y-2.5">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <FooterLink link={link} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div
            className="relative mt-10 hidden h-24 overflow-hidden lg:block"
            aria-hidden="true"
          >
            <p className="absolute left-1/2 top-1/2 w-max -translate-x-1/2 -translate-y-1/2 text-[clamp(4rem,9vw,8rem)] font-bold leading-none text-transparent [-webkit-text-stroke:1px_rgba(148,163,184,0.24)]">
              Lecture Companion
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-slate-200/70 py-5 text-sm leading-6 text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:mt-0">
            <p>© 2026 Chathura Hapukotuwa</p>
            <p>Built with React, Node.js, Express, and Gemini AI.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
