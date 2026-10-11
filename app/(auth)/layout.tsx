import { redirect } from "next/navigation";
import { getUser } from "@/lib/getUser";
import { isGuestId } from "@/lib/guest-user";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getUser("SERVER_COMPONENT");

  // the shared guest is signed in too, and is exactly who should reach sign-up (TICKET-041)
  if (user && !isGuestId(user.id)) {
    redirect("/studio");
  }

  return children;
};

export default AuthLayout;
