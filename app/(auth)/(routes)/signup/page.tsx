import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { isGuestUser } from "@/lib/guest-user";

export const metadata: Metadata = { title: "Create an account" };

export default async function SignupPage() {
  // the shared guest reaches this page signed in: it is offered the way back, not a guest
  // session it already has (TICKET-054)
  return (
    <AuthForm
      kind="signup"
      signedInAsGuest={await isGuestUser("SERVER_COMPONENT")}
    />
  );
}
