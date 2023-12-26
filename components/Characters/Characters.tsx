import { Character } from "@prisma/client";
import Image from "next/image";
import React from "react";
import { Card, CardHeader } from "../ui/card";
import Link from "next/link";

interface CharacterProps {
  data: (Character & {
    _count: {
      messages: number;
    };
  })[];
}

const Characters = ({ data }: CharacterProps) => {
  if (data.length === 0) {
    return (
      <div className="pt-10 flex flex-col items-center justify-center space-y-3">
        <div className="relative w-60 h-60">
          <Image fill alt="Empty" src="/empty.png" />
        </div>
        <p className="text-sm text-slate-400"></p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 pb-10">
      {data.map((item) => (
        <Card
          key={item.id}
          className="rounded-xl cursor-pointer hover:opacity-90 transition border-0 bg-slate-200/50"
        >
          <Link href={`/characters/chat/${item.id}`}>
            <CardHeader className="flex items-center justify-center text-center text-muted-foreground">
              <div className="relative w-32 h-32">
                <Image
                  src={item.src}
                  fill
                  className="rounded-xl object-cover"
                  alt={item.name}
                />
              </div>
              <p className="font-bold">{item.name}</p>
              <p className="text-xs">{item.description}</p>
            </CardHeader>
          </Link>
        </Card>
      ))}
    </div>
  );
};

export default Characters;
