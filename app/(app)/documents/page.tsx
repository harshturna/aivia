"use client";

import { BookText } from "lucide-react";

import { GenerativeChat } from "@/components/ai/GenerativeChat";

const DocumentsPage = () => (
  <GenerativeChat
    api="/api/documents"
    title="Documents AI"
    description="Attach a PDF or text file and ask questions about it"
    icon={BookText}
    iconColor="text-primary"
    bgColor="bg-primary/10"
    placeholder="What are the key findings in this report?"
    emptyLabel="Attach a document to get started"
    attachments={{
      accept: "application/pdf,text/plain,text/markdown,text/csv,.md,.txt,.csv",
      label: "Attach a document",
    }}
  />
);

export default DocumentsPage;
