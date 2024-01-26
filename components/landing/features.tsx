import Image from "next/image";
import HeadingText from "@/components/heading-text";
import { features } from "@/config/contents";
import { Waves } from "lucide-react";

export default function Features() {
  return (
    <section className="container space-y-8 py-12 lg:py-20" id="features">
      {features.header || features.subheader ? (
        <HeadingText subtext={features.subheader} className="text-center">
          {features.header}
        </HeadingText>
      ) : null}
      <div className="grid grid-cols-1 gap-10 lg:mx-[20rem] md:mx-[10rem]">
        {features.content.map((cards: any) => {
          const Icon = cards.icon;

          return (
            <div
              key={cards.text}
              className="flex flex-col gap-2 md:flex-row md:gap-8 md:text-left sm:items-center sm:text-center xs:items-center"
            >
              <div className="flex">
                <Icon className="h-[6rem] w-[6rem]" />
              </div>
              <div className="flex-1">
                <p className="md:text4xl text-2xl font-semibold">
                  {cards.text}
                </p>
                <p className="font-light text-muted-foreground md:text-lg">
                  {cards.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
