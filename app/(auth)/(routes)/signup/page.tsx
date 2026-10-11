"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import type * as z from "zod";
import Logo from "@/components/Logo";
import Loader from "@/components/SubmitLoader";
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
import { useGuestLogin } from "@/hooks/useGuestLogin";
import { createClient } from "@/lib/supabase/client";
import { FormSchema } from "../constants";

const Signup = () => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onChange",
    resolver: zodResolver(FormSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async (
    formData
  ) => {
    const { email, password } = formData;
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      form.reset();
      setSubmitError(error.message);
    }

    if (!error) {
      router.refresh();
      router.push("/dashboard");
    }
  };

  const { guestHandler, isGuestLoading } = useGuestLogin();

  const isLoading = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col m-5 border border-border bg-card px-6 py-6 rounded-xl shadow-sm md:w-[600px]"
      >
        <Link href="/" className="w-full flex justify-start items-center">
          <Logo />
          <span className="font-display font-semibold text-3xl ml-2">
            aivia.
          </span>
        </Link>
        <FormDescription className="text-foreground/60">
          Your AI Suite
        </FormDescription>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => {
            return (
              <FormItem>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Email"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Password"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {submitError && <FormMessage>{submitError}</FormMessage>}
        <Button
          type="submit"
          className="w-full p-6"
          size="lg"
          disabled={isLoading}
        >
          {!isLoading ? "Sign up" : <Loader />}
        </Button>
        <span className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-2"
          >
            Log in
          </Link>
        </span>
        <p className="text-center font-semibold">OR</p>
        <Button
          type="button"
          onClick={() => guestHandler()}
          variant="ghost"
          className="underline !mt-1"
        >
          Explore the app as guest
        </Button>
      </form>
    </Form>
  );
};

export default Signup;
