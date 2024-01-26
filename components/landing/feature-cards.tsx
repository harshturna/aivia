import Image from "next/image";
import HeadingText from "@/components/heading-text";
import { featureCards } from "@/config/contents";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function FeatureCards() {
  return (
    <section className="bg-slate-50 dark:bg-slate-900">
      <div className="container space-y-8 py-12 text-center lg:py-20">
        <HeadingText>{featureCards.header}</HeadingText>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {featureCards.content.map((cards: any) => {
            const Icon = cards.icon;

            return (
              <Card
                key={cards.text}
                className={cn(
                  "flex flex-grow flex-col items-center justify-between gap-2 p-8 dark:bg-secondary",
                  cards.color,
                  cards.bgColor
                )}
              >
                <div className="flex">
                  <Icon className="h-[6rem] w-[6rem]" />
                </div>
                <div className="space-y-2">
                  <CardTitle>{cards.text}</CardTitle>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
