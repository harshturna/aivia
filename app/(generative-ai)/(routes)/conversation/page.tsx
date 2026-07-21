"use client";

import { MessageSquare } from "lucide-react";

import { GenerativeChat } from "@/components/ai/GenerativeChat";

const ConversationPage = () => (
  <GenerativeChat
    api="/api/conversation"
    title="Conversations"
    description="Chat with Aivia, your friendly AI"
    icon={MessageSquare}
    iconColor="text-blue-500"
    bgColor="bg-blue-500/10"
    placeholder="How do I calculate the radius of a circle?"
    emptyLabel="No conversation started"
  />
);

export default ConversationPage;
