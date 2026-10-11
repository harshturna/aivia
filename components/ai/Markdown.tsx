"use client";

import { Check, Copy } from "lucide-react";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

import "highlight.js/styles/github-dark.css";

/**
 * A fenced code block with a copy affordance.
 *
 * The copy button reads textContent off the rendered <pre> rather than trying
 * to walk React children: rehype-highlight replaces the code contents with
 * nested <span> elements, so the children are no longer plain strings.
 */
const CodeBlock = ({
  children,
  node: _node,
  ...props
}: React.ComponentProps<"pre"> & { node?: unknown }) => {
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
        className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-chip
                   bg-fg/10 px-2 py-1 text-xs text-fg-2 opacity-0 transition-[opacity,background-color]
                   hover:bg-fg/20 focus-visible:opacity-100 group-hover/code:opacity-100 [@media(hover:none)]:opacity-100"
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
        className="overflow-x-auto rounded-control bg-surface-3 p-4 text-sm"
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
      // `node` is the syntax tree react-markdown passes; it is not a DOM attribute
      code: ({ className, node: _node, ...props }) => {
        const isFenced = Boolean(className?.includes("language-"));
        return isFenced ? (
          <code className={className} {...props} />
        ) : (
          <code
            className="rounded-chip bg-foreground/10 px-1 py-0.5 text-[0.9em]"
            {...props}
          />
        );
      },
      h1: ({ node: _node, ...props }) => (
        <h1 className="mb-2 mt-4 text-xl font-semibold" {...props} />
      ),
      h2: ({ node: _node, ...props }) => (
        <h2 className="mb-2 mt-4 text-lg font-semibold" {...props} />
      ),
      h3: ({ node: _node, ...props }) => (
        <h3 className="mb-1 mt-3 font-semibold" {...props} />
      ),
      ul: ({ node: _node, ...props }) => (
        <ul className="my-2 list-disc pl-6 space-y-1" {...props} />
      ),
      ol: ({ node: _node, ...props }) => (
        <ol className="my-2 list-decimal pl-6 space-y-1" {...props} />
      ),
      p: ({ node: _node, ...props }) => (
        <p className="my-2 leading-7" {...props} />
      ),
      a: ({ node: _node, ...props }) => (
        <a
          className="text-primary underline underline-offset-2"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        />
      ),
      blockquote: ({ node: _node, ...props }) => (
        <blockquote
          className="my-2 border-l-2 border-border pl-4 italic"
          {...props}
        />
      ),
    }}
  >
    {children}
  </ReactMarkdown>
);
