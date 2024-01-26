import { offerings } from "@/constants";
import { Card } from "../../components/ui/card";
import { Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { getUser } from "@/lib/getUser";
const Dashboard = async () => {
  const user = await getUser("SERVER_COMPONENT");

  return (
    <div className="flex justify-center flex-col h-[100%] xl:px-[10rem] lg:px-[5rem]">
      <div className="mb-8 flex-col">
        <div className="flex items-center gap-2 justify-center">
          <Sparkles
            className="w-[40px] h-[40px]"
            fill="#db75a8"
            stroke="#8b5cf5"
            strokeWidth={1}
          />
          <h2 className="text-2xl md:text-4xl font-bold text-center gradient-text">
            Explore our tools
          </h2>
        </div>
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

export default Dashboard;
