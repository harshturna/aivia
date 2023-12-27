import * as z from "zod";

export const formSchema = z.object({
  message: z.string().min(1, {
    message: "Message is required",
  }),
});
