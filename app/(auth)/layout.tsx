import { redirect } from "next/navigation";
import { getUser } from "@/lib/getUser";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getUser("SERVER_COMPONENT");

  if (user) {
    redirect("/studio");
  }

  return children;
};

export default AuthLayout;
