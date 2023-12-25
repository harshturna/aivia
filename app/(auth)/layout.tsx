import { getUser } from "@/lib/getUser";
import { redirect } from "next/navigation";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getUser("SERVER_COMPONENT");

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex items-center justify-center h-full">{children}</div>
  );
};

export default AuthLayout;
