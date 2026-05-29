import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, FileDown } from "lucide-react";

export default function MarkdownViewer({ markdown }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-8">
      {/* Control Bar */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
          <FileDown className="w-4 h-4 text-blue-500" /> Generated Study Guide
        </span>

        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 border
            ${
              copied
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
            }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" /> Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" /> Copy Markdown
            </>
          )}
        </button>
      </div>

      {/* Styled Markdown Body */}
      <div
        className="p-8 sm:p-12 text-slate-800 leading-relaxed
        prose-container
        [&>h1]:text-3xl [&>h1]:font-extrabold [&>h1]:text-slate-900 [&>h1]:mb-6 [&>h1]:mt-2 [&>h1]:border-b [&>h1]:pb-3
        [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-800 [&>h2]:mb-4 [&>h2]:mt-8 [&>h2]:flex [&>h2]:items-center
        [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-slate-800 [&>h3]:mb-3 [&>h3]:mt-6
        [&>p]:mb-5 [&>p]:text-slate-600 [&>p]:leading-7
        [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul]:space-y-2 [&>ul]:text-slate-600
        [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol]:space-y-2 [&>ol]:text-slate-600
        [&>li]:pl-1
        [&>strong]:font-semibold [&>strong]:text-slate-900
        [&>blockquote]:border-l-4 [&>blockquote]:border-blue-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-6 [&>blockquote]:text-slate-500
      "
      >
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}
