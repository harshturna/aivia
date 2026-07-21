"use client";

import { useState, useEffect } from "react";
import Loader from "@/components/SubmitLoader";
import { useGuestLogin } from "@/hooks/useGuestLogin";
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
  FormLabel,
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


  const { guestHandler, isGuestLoading } = useGuestLogin();

  const isLoading = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col m-4 border border-border bg-card px-6 py-6 rounded-xl shadow-sm md:w-[600px]"
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
          name="email"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" placeholder="••••••••" {...field} />
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
        <span className="text-center text-sm text-muted-foreground">
          Dont have an account?{" "}
          <Link href="/signup" className="font-medium text-foreground underline underline-offset-2">
            Sign up
          </Link>
        </span>
        <p className="text-center text-sm font-medium text-muted-foreground">OR</p>
        <Button
          type="button"
          onClick={guestHandler}
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
