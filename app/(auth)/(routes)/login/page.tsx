"use client";

import { useState, useEffect } from "react";
import Loader from "@/components/SubmitLoader";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FormSchema } from "../constants";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import Logo from "@/components/Logo";

const Login = () => {
  useEffect(() => {
    router.refresh();
  }, []);

  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onChange",
    resolver: zodResolver(FormSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async (
    formData
  ) => {
    const { email, password } = formData;
    const supabase = createClientComponentClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      form.reset();
      setSubmitError(error.message);
    }

    if (!error) {
      router.push("/dashboard");
    }
  };

  const guestHandler = async (email: string, password: string) => {
    const supabase = createClientComponentClient();
    setIsGuestLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsGuestLoading(false);
    if (error) {
      toast.error("Error logging in as guest");
    }
    if (!error) {
      router.push("/dashboard");
    }   
  };

  const isLoading = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col m-4 border px-5 py-4 rounded-lg border-slate-200 md:w-[600px]"
      >
        <Link href="/" className="w-full flex justify-left items-center">
          <Logo />
          <span className="font-semibold text-4xl first-letter:ml-2">
            aivia.
          </span>
        </Link>
        <FormDescription className="text-foreground/60">
          Your AI Suite
        </FormDescription>
        <FormField
          name="email"
          render={({ field }) => {
            return (
              <FormItem>
                <FormControl>
                  <Input type="email" placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="password" placeholder="Password" {...field} />
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
          {!isLoading ? "Login" : <Loader />}
        </Button>
        <span className="self-container text-slate-400">
          Dont have an account?{" "}
          <Link href="/signup" className="text-slate-400 underline">
            Sign up
          </Link>
        </span>
        <p className="text-center font-semibold text-1.5xl">OR</p>
        <Button
          type="button"
          onClick={() => guestHandler("blesv1502@gmail.com", "password123")}
          variant="ghost"
          className="underline !mt-1"
        >
          {!isGuestLoading ? "Explore the app as guest" : <Loader />}
        </Button>
      </form>
    </Form>
  );
};

export default Login;
