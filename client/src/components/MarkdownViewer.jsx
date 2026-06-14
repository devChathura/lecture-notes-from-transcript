import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Check, Copy, Download, FileText } from "lucide-react";

export const MARKDOWN_VIEWER_SAMPLE = `# Lecture 05: Authentication and Access Control

Authentication establishes **who a user is**, while authorization determines what that user is allowed to do.

## Key Ideas

- Authentication verifies identity using credentials.
- Authorization controls access to protected resources.
- Passwords should be stored using a slow, salted hash.
- Sessions and tokens should expire after a limited period.

## Important Terms

### Identity Provider

A trusted service that verifies a user's identity and issues credentials.

> Apply the principle of least privilege: users should receive only the permissions they need.

Use \`HttpOnly\` cookies where appropriate to prevent client-side scripts from reading session tokens.

## Authentication vs Authorization

| Concept | Purpose |
| --- | --- |
| Authentication | Verifies identity |
| Authorization | Controls permissions |

## Example

\`\`\`js
const canEdit = user.permissions.includes("lecture:edit");
\`\`\`

## Revision Checklist

1. Explain the difference between authentication and authorization.
2. Compare cookie-based sessions with token-based authentication.
3. Describe how passwords should be stored securely.
`;

const getDownloadName = (fileName) => {
  if (!fileName) return "lecture-companion-notes.md";

  const safeName = fileName
    .replace(/\.(srt|vtt)$/i, "")
    .replace(/[<>:"/\\|?*]/g, "-")
    .trim();

  return `${safeName || "lecture-companion"}-study-notes.md`;
};

const markdownComponents = {
  h1: ({ children }) => <h2 data-note-title="true">{children}</h2>,
  h2: ({ children }) => <h3 data-note-section="true">{children}</h3>,
  h3: ({ children }) => <h4 data-note-subsection="true">{children}</h4>,
};

export default function MarkdownViewer({ markdown, fileName }) {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(
    () => () => {
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }
    },
    []
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = getDownloadName(fileName);
    link.hidden = true;
    document.body.appendChild(link);
    link.click();
    window.setTimeout(() => {
      link.remove();
      URL.revokeObjectURL(url);
    }, 1000);
  };

  if (!markdown) {
    return null;
  }

  return (
    <div className="try-state-enter w-full overflow-hidden rounded-lg border border-slate-200/70 bg-white/70 shadow-[0_14px_40px_rgba(15,23,42,0.05)] backdrop-blur-md">
      <div className="flex flex-col gap-3 border-b border-slate-200/70 bg-slate-50/65 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 lg:flex-col lg:items-stretch xl:flex-row xl:items-center">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-600 shadow-sm"
            aria-hidden="true"
          >
            <FileText className="h-4 w-4" />
          </span>
          <span className="truncate text-sm font-semibold text-slate-800">
            Generated Study Guide
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50/70 px-2 py-1 text-[11px] font-semibold text-emerald-700">
            <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
            Ready
          </span>
        </div>

        <div className="flex w-full flex-wrap gap-2 sm:w-auto lg:w-full xl:w-auto">
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "Markdown copied" : "Copy generated notes"}
            className={`inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 sm:flex-none lg:flex-1 xl:flex-none ${
              copied
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200/90 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:text-slate-950"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                Copy Notes
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            aria-label="Download generated notes as Markdown"
            className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-full border border-slate-200/90 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 sm:flex-none lg:flex-1 xl:flex-none"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download .md
          </button>
        </div>
      </div>

      <div
        className="overflow-x-hidden p-5 text-[15px] text-slate-800 [overflow-wrap:anywhere] sm:p-6 lg:max-h-[calc(100vh-230px)] lg:overflow-y-auto
        prose-container
        [&>[data-note-title]]:mb-5 [&>[data-note-title]]:mt-0 [&>[data-note-title]]:border-b [&>[data-note-title]]:border-slate-200/80 [&>[data-note-title]]:pb-3 [&>[data-note-title]]:text-2xl [&>[data-note-title]]:font-bold [&>[data-note-title]]:leading-tight [&>[data-note-title]]:tracking-tight [&>[data-note-title]]:text-slate-950
        [&>[data-note-section]]:mb-3 [&>[data-note-section]]:mt-7 [&>[data-note-section]]:text-xl [&>[data-note-section]]:font-bold [&>[data-note-section]]:leading-snug [&>[data-note-section]]:text-slate-900
        [&>[data-note-subsection]]:mb-2 [&>[data-note-subsection]]:mt-5 [&>[data-note-subsection]]:text-lg [&>[data-note-subsection]]:font-semibold [&>[data-note-subsection]]:leading-snug [&>[data-note-subsection]]:text-slate-800
        [&>p]:mb-4 [&>p]:leading-7 [&>p]:text-slate-600
        [&>ul]:mb-5 [&>ul]:list-disc [&>ul]:space-y-1.5 [&>ul]:pl-5 [&>ul]:text-slate-600
        [&>ol]:mb-5 [&>ol]:list-decimal [&>ol]:space-y-1.5 [&>ol]:pl-5 [&>ol]:text-slate-600
        [&>li]:pl-1 [&>li]:leading-7
        [&>strong]:font-semibold [&>strong]:text-slate-900
        [&>blockquote]:my-5 [&>blockquote]:border-l-2 [&>blockquote]:border-slate-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-500
        [&_a]:font-medium [&_a]:text-slate-800 [&_a]:underline [&_a]:decoration-slate-300 [&_a]:underline-offset-4 hover:[&_a]:decoration-slate-500
        [&_code]:rounded-md [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em] [&_code]:text-slate-800
        [&_pre]:my-5 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-slate-200 [&_pre]:bg-slate-100/80 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:leading-6 [&_pre]:text-slate-800
        [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit
        [&_hr]:my-6 [&_hr]:border-slate-200
        [&_table]:my-5 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_table]:text-left [&_th]:border-b [&_th]:border-slate-300 [&_th]:p-2 [&_th]:font-semibold [&_td]:border-b [&_td]:border-slate-200 [&_td]:p-2
      "
      >
        <ReactMarkdown components={markdownComponents}>{markdown}</ReactMarkdown>
      </div>

      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Generated notes copied to clipboard." : ""}
      </span>
    </div>
  );
}
