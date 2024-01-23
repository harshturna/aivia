"use client";

import { useState, useEffect } from "react";
import { offerings } from "@/constants";
import { Card } from "../../components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
const ProModal = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // TODO: Add logo text to name
  return (
    <div className="flex justify-center flex-col h-[100%] xl:px-[15rem] lg:px-[5rem]">
      <div className="mb-8">
        <h2 className="text-2xl md:text-4xl font-bold text-center">Aivia</h2>
        <p className="text-muted-foreground text-sm md:text-lg text-center m-0">
          Explore our AI tools
        </p>
      </div>
      <div className="px-4 md:px-20 lg:px-32 space-y-4">
        {offerings.map((tool) => {
          if (tool.label === "Documents AI") {
            return (
              <TooltipProvider key={tool.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="p-3 border border-gray-200 rounded-md flex items-center justify-between transition-all hover:shadow-md gap-2">
                      <div className="grid grid-cols-[40px_1fr] grid-rows-2 gap-x-6 items-center">
                        <div
                          className={`row-span-2 p-2 w-full h-full flex justify-center items-center rounded-md ${tool.bgColor}`}
                        >
                          <tool.icon className={`w-6 h-6 ${tool.color}`} />
                        </div>
                        <div className="font-semibold text-left text-gray-400">
                          {tool.label}
                        </div>
                        <div className="text-sm text-left text-gray-300">
                          {tool.description}
                        </div>
                      </div>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>Coming Soon!</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }
          return (
            <Link
              href={tool.href}
              key={tool.href}
              className="flex flex-col gap-5"
            >
              <Card className="p-3 border border-gray-200 rounded-md flex items-center justify-between transition-all hover:shadow-md gap-2">
                <div className="grid grid-cols-[40px_1fr] grid-rows-2 gap-x-6 items-center">
                  <div
                    className={`row-span-2 p-2 w-full h-full flex justify-center items-center rounded-md ${tool.bgColor}`}
                  >
                    <tool.icon className={`w-6 h-6 ${tool.color}`} />
                  </div>
                  <div className="font-semibold text-left text-gray-700">
                    {tool.label}
                  </div>
                  <div className="text-sm text-left text-gray-400">
                    {tool.description}
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ProModal;
