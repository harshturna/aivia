import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/getUser";
import { getSession, isSessionId } from "@/lib/sessions";
import { StudioClient } from "../studio-client";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const user = await getUser("SERVER_COMPONENT");
  const { id } = await params;
  if (!user || !isSessionId(id)) return { title: "Studio" };
  const session = await getSession(user.id, id);
  return { title: session?.title ?? "Studio" };
}

/** A saved session, resumed where it was left (design §12). */
export default async function SessionPage({ params }: Params) {
  const user = await getUser("SERVER_COMPONENT");
  if (!user) redirect("/login");
  const { id } = await params;
  if (!isSessionId(id)) notFound();
  const session = await getSession(user.id, id);
  if (!session) notFound();
  return (
    <StudioClient
      key={session.id}
      id={session.id}
      isNew={false}
      initialMessages={session.messages}
      initialTitle={session.title}
    />
  );
}
