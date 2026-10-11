"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Markdown } from "@/components/ai/Markdown";
import { ScreenHeader } from "@/components/shell/screen";
import { Composer } from "@/components/studio/composer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { messageText } from "@/lib/session-text";
import { cn } from "@/lib/utils";

interface CharacterSummary {
  id: string;
  name: string;
  description: string;
  src: string;
}

/**
 * A character chat (design §8): the character's portrait and name in the header, the
 * conversation as plain lines (yours muted, theirs in full), the composer at the foot.
 */
export function CharacterChat({
  character,
  initialMessages,
  canManage,
}: {
  character: CharacterSummary;
  initialMessages: UIMessage[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [limit, setLimit] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    id: `character-${character.id}`,
    messages: initialMessages,
    transport: new DefaultChatTransport({ api: `/api/chat/${character.id}` }),
    onError: (err) => {
      if ((err?.message ?? "").includes("limit")) setLimit(true);
    },
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages, status]);

  const remove = async () => {
    const response = await fetch(`/api/characters/${character.id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      router.push("/characters");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <ScreenHeader
        title={
          <span className="flex items-center gap-2.5">
            <span className="relative size-7 shrink-0 overflow-hidden rounded-full bg-surface">
              <Image
                src={character.src}
                alt=""
                fill
                sizes="28px"
                className="object-cover"
              />
            </span>
            <span className="truncate">{character.name}</span>
          </span>
        }
      >
        {canManage &&
          (confirming ? (
            <>
              <Button variant="destructive" size="sm" onClick={remove}>
                Delete {character.name}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirming(false)}
              >
                Keep
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Character options"
                >
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onSelect={() => router.push(`/characters/${character.id}`)}
                >
                  <Pencil /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setConfirming(true)}>
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
      </ScreenHeader>

      <div className="flex-1 px-6 pb-44 pt-8">
        <div className="mx-auto max-w-[680px] space-y-6">
          <Line
            who={character}
            text={`Hello, I am ${character.name}. What shall we talk about?`}
          />
          {messages.map((m) =>
            m.role === "user" ? (
              <p
                key={m.id}
                className="whitespace-pre-wrap text-[15px] leading-6 text-fg-2"
              >
                {messageText(m)}
              </p>
            ) : (
              <Line key={m.id} who={character} text={messageText(m)} />
            )
          )}
          {status === "submitted" && (
            <p className="flex items-center gap-2 text-[13px] text-fg-2">
              <Spinner className="size-3" /> {character.name} is writing…
            </p>
          )}
          {error && !limit && (
            <div className="flex items-center justify-between gap-4 rounded-media border border-border bg-surface p-4 text-[13px]">
              <span className="text-fg-2">The reply did not arrive.</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => regenerate()}
              >
                Try again
              </Button>
            </div>
          )}
          {limit && (
            <div className="rounded-media border border-border bg-surface p-4 text-[13px] text-fg-2">
              The guest session has reached its limit. Create an account to keep
              talking.
            </div>
          )}
          <div ref={bottom} className="scroll-mb-44" />
        </div>
      </div>

      <div className="sticky bottom-0 z-10 bg-[linear-gradient(to_top,var(--color-bg)_55%,transparent)] px-6 pb-4 pt-10">
        <Composer
          className="mx-auto max-w-[680px]"
          showModes={false}
          placeholder={`Say something to ${character.name}…`}
          value={input}
          onChange={setInput}
          onSubmit={(text) => sendMessage({ text })}
          onStop={stop}
          busy={busy}
          disabled={limit}
        />
      </div>
    </div>
  );
}

function Line({ who, text }: { who: CharacterSummary; text: string }) {
  return (
    <div className="flex gap-3">
      <span className="relative mt-0.5 size-7 shrink-0 overflow-hidden rounded-full bg-surface">
        <Image
          src={who.src}
          alt=""
          fill
          sizes="28px"
          className="object-cover"
        />
      </span>
      <div
        className={cn(
          "min-w-0 flex-1 text-[15px] leading-6 text-fg [&_p:first-child]:mt-0"
        )}
      >
        <div className="text-[12.5px] font-medium text-mute">{who.name}</div>
        <Markdown>{text}</Markdown>
      </div>
    </div>
  );
}
