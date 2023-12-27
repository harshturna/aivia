"use client";

// TODO: Test all three button conditions - pro, guest user and non pro

import * as z from "zod";

import { Category, Character } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/Characters/ImageUpload";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Wand } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

const SEED = `Human: Hi Einstein! What sparked your theory of relativity? 

Albert Einstein: Good question! I was curious about light and time, so I imagined riding a light beam. This led me to rethink time and space, inspiring my theory.

Human: Why do you think imagination is important in science?

Albert Einstein: Imagination lets us explore beyond current knowledge. It's the key to unlocking new scientific ideas and understanding the mysteries of the universe.`;

interface CharacterFormProps {
  initialData: Character | null;
  categories: Category[];
  isGuest: boolean;
}

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  description: z.string().min(1, {
    message: "Description is required",
  }),
  instructions: z.string().min(200, {
    message: "Instructions must be at least 200 characters",
  }),
  seed: z.string().min(200, {
    message: "Seed must be at least 200 characters",
  }),
  src: z.string().min(1, {
    message: "Image is required",
  }),
  categoryId: z.string().min(1, {
    message: "Category is required",
  }),
});

const CharacterForm = ({
  categories,
  initialData,
  isGuest = true,
}: CharacterFormProps) => {
  const router = useRouter();
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
    try {
      if (initialData) {
        // update
        await axios.patch(`/api/characters/${initialData.id}`, values);
      } else {
        // create
        await axios.post("/api/characters", values);
      }

      toast.success("Success");
      router.refresh();
      router.push("/characters");
    } catch (error) {
      toast.error("Something went wrong");
      console.log("SOMETHING WENT WRONG", error);
    }
  };

  return (
    <div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 pb-10"
        >
          <div className="space-y-2 w-full">
            <div>
              <h3 className="text-lg font-medium">Your Character</h3>
              <p className="text-slate-500">Information about your Character</p>
            </div>
            <Separator />
          </div>
          <FormField
            name="src"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center space-y-4">
                <FormControl>
                  <ImageUpload
                    disabled={isLoading}
                    onChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Albert Einstein"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Your Character&#39;s Name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrption</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Theoretical physicist "
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Describe your Character
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="categoryId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select a category"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    Select a category
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-2 w-full">
            <div>
              <h3 className="text-lg font-medium">Configuartion</h3>
              <p className="text-slate-500">
                Detailed instructions for Character&#39;s behaviour
              </p>
            </div>
            <Separator />
          </div>
          <FormField
            name="instructions"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructions</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
                    disabled={isLoading}
                    placeholder="Embody Albert Einstein: Be a theoretical physicist known for curiosity and profound understanding of the universe. Use thought experiments to explore relativity and quantum mechanics, and communicate complex ideas with clarity and imagination."
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Describe relevant details of your character
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="seed"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Example Conversation</FormLabel>
                <FormControl>
                  <Textarea
                    rows={10}
                    disabled={isLoading}
                    placeholder={SEED}
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  An Example of a conversation with your Character
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="w-full flex justify-center">
            {isGuest ? (
              <Button size="lg" type="button" variant="default" disabled={true}>
                Guest cannot create new characters
              </Button>
            ) : (
              <Button size="lg" disabled={isLoading}>
                {initialData ? "Edit your character" : "Create your character"}
                <Wand className="ml-2" />
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CharacterForm;
