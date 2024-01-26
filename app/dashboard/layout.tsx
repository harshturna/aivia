import { getUser } from "@/lib/getUser";
import { redirect } from "next/navigation";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getUser("SERVER_COMPONENT");

  console.log(user);
  if (!user) {
    redirect("/login");
  }

  return <div className="h-full">{children}</div>;
};

export default DashboardLayout;
