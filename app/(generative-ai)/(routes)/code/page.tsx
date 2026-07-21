"use client";

import { Code } from "lucide-react";

import { GenerativeChat } from "@/components/ai/GenerativeChat";

const CodePage = () => (
  <GenerativeChat
    api="/api/code"
    title="Code Generation"
    description="Generate code using descriptive text"
    icon={Code}
    iconColor="text-primary"
    bgColor="bg-primary/10"
    placeholder="Simple toggle button using react hooks"
    emptyLabel="No code generated"
  />
);

export default CodePage;
