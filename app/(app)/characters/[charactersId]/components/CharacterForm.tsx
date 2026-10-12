"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Category, Character } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ImageUpload } from "@/components/characters/ImageUpload";
import { ScreenHeader } from "@/components/shell/screen";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const SEED = `Human: Hi Einstein! What sparked your theory of relativity?

Albert Einstein: I was curious about light and time, so I imagined riding a light beam. That led me to rethink time and space.

Human: Why do you think imagination matters in science?

Albert Einstein: Imagination lets us explore beyond what we know. It is the key to new ideas.`;

const formSchema = z.object({
  name: z.string().min(1, { message: "Give the character a name." }),
  description: z
    .string()
    .min(1, { message: "Describe the character in a few words." }),
  instructions: z.string().min(200, {
    message: "Write at least 200 characters, so the character has a voice.",
  }),
  seed: z.string().min(200, {
    message: "Write at least 200 characters of example conversation.",
  }),
  src: z.string().min(1, { message: "Add a portrait." }),
  categoryId: z.string().min(1, { message: "Choose a category." }),
});

/** The character form (design §8): one column, the same fields and rules as before. */
const CharacterForm = ({
  categories,
  initialData,
}: {
  initialData: Character | null;
  categories: Category[];
}) => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      instructions: "",
      seed: "",
      src: "",
      categoryId: undefined,
    },
  });
  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitError(null);
    const response = await fetch(
      initialData ? `/api/characters/${initialData.id}` : "/api/characters",
      {
        method: initialData ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }
    );
    if (!response.ok) {
      setSubmitError(
        "Could not save the character. Check the fields and try again."
      );
      return;
    }
    const saved = (await response.json()) as { id: string };
    router.push(`/characters/c/${saved.id}`);
    router.refresh();
  };

  return (
    <div className="min-h-dvh">
      <ScreenHeader
        title={initialData ? `Edit ${initialData.name}` : "New character"}
      />
      <div className="mx-auto max-w-[560px] px-6 pb-20 pt-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="src"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] text-fg-2">
                    Portrait
                  </FormLabel>
                  <FormControl>
                    <ImageUpload
                      disabled={isLoading}
                      onChange={field.onChange}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage className="text-[12.5px] text-poor" />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] text-fg-2">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Albert Einstein…"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[12.5px] text-poor" />
                  </FormItem>
                )}
              />
              <FormField
                name="categoryId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] text-fg-2">
                      Category
                    </FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 rounded-control border-border bg-surface text-[14px]">
                          <SelectValue placeholder="Choose one" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-media border-border bg-surface-2">
                        {categories.map((c) => (
                          <SelectItem
                            key={c.id}
                            value={c.id}
                            className="text-[13px]"
                          >
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[12.5px] text-poor" />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] text-fg-2">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Theoretical physicist…"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-[12px] text-mute">
                    One line, shown under the portrait.
                  </FormDescription>
                  <FormMessage className="text-[12.5px] text-poor" />
                </FormItem>
              )}
            />
            <FormField
              name="instructions"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] text-fg-2">
                    Who they are
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      disabled={isLoading}
                      placeholder="A theoretical physicist known for curiosity. Explains hard ideas with thought experiments and a dry sense of humour…"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-[12px] text-mute">
                    Their background, their voice, what they care about.
                  </FormDescription>
                  <FormMessage className="text-[12.5px] text-poor" />
                </FormItem>
              )}
            />
            <FormField
              name="seed"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] text-fg-2">
                    An example conversation
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={9}
                      disabled={isLoading}
                      placeholder={SEED}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-[12px] text-mute">
                    A few lines in their voice, so replies sound like them.
                  </FormDescription>
                  <FormMessage className="text-[12.5px] text-poor" />
                </FormItem>
              )}
            />
            {submitError && (
              <p className="text-[13px] text-poor">{submitError}</p>
            )}
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving…"
                  : initialData
                    ? "Save changes"
                    : "Create the character"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CharacterForm;
