"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy } from "lucide-react";

import "highlight.js/styles/github-dark.css";

/**
 * A fenced code block with a copy affordance.
 *
 * The copy button reads textContent off the rendered <pre> rather than trying
 * to walk React children: rehype-highlight replaces the code contents with
 * nested <span> elements, so the children are no longer plain strings.
 */
const CodeBlock = ({ children, ...props }: React.ComponentProps<"pre">) => {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const text = preRef.current?.textContent ?? "";
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can reject on insecure origins; failing silently is
      // better than a toast the user can do nothing about.
    }
  };

  return (
    <div className="relative my-3 group/code">
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? "Copied to clipboard" : "Copy code to clipboard"}
        className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-md
                   bg-white/10 px-2 py-1 text-xs text-zinc-200 opacity-0 transition
                   hover:bg-white/20 focus-visible:opacity-100 group-hover/code:opacity-100"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3" aria-hidden="true" /> Copied
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" aria-hidden="true" /> Copy
          </>
        )}
      </button>
      <pre
        ref={preRef}
        className="overflow-x-auto rounded-lg bg-[#0d1117] p-4 text-sm"
        {...props}
      >
        {children}
      </pre>
    </div>
  );
};

/**
 * Shared markdown renderer for every AI surface.
 *
 * The app has no @tailwindcss/typography plugin, and Preflight strips list
 * markers and heading sizes, so model output previously rendered as an
 * undifferentiated wall of text. These overrides restore the basics.
 */
export const Markdown = ({ children }: { children: string }) => (
  <ReactMarkdown
    rehypePlugins={[rehypeHighlight]}
    components={{
      pre: CodeBlock,
      code: ({ className, ...props }) => {
        const isFenced = Boolean(className?.includes("language-"));
        return isFenced ? (
          <code className={className} {...props} />
        ) : (
          <code
            className="rounded bg-black/10 px-1 py-0.5 text-[0.9em]"
            {...props}
          />
        );
      },
      h1: (props) => <h1 className="mb-2 mt-4 text-xl font-semibold" {...props} />,
      h2: (props) => <h2 className="mb-2 mt-4 text-lg font-semibold" {...props} />,
      h3: (props) => <h3 className="mb-1 mt-3 font-semibold" {...props} />,
      ul: (props) => <ul className="my-2 list-disc pl-6 space-y-1" {...props} />,
      ol: (props) => <ol className="my-2 list-decimal pl-6 space-y-1" {...props} />,
      p: (props) => <p className="my-2 leading-7" {...props} />,
      a: (props) => (
        <a
          className="text-violet-600 underline underline-offset-2"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        />
      ),
      blockquote: (props) => (
        <blockquote
          className="my-2 border-l-2 border-black/20 pl-4 italic"
          {...props}
        />
      ),
    }}
  >
    {children}
  </ReactMarkdown>
);
