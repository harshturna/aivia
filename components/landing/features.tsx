import Image from "next/image";
import HeadingText from "@/components/heading-text";
import { features } from "@/config/contents";

export default function Features() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
      <div className="max-w-[1000px] mx-auto px-4 md:pl-6 md:pr-3">
        <h2 className="text-3xl font-bold text-center mb-12">Our Features</h2>
        <div className="grid md:grid-cols-3 max-w-[1110px] mx-auto gap-8 lg:gap-0">
          {features.content.map((cards: any) => {
            const Icon = cards.icon;

            return (
              <div
                key={cards.text}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-4 p-4 bg-primary rounded-full">
                  <Icon className="h-12 w-12 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{cards.text}</h3>
                <p className="text-muted-foreground">{cards.subtext}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
