import { redirect } from "next/navigation";
import { getUser } from "@/lib/getUser";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getUser("SERVER_COMPONENT");

  if (!user) {
    redirect("/login");
  }

  return <div className="h-full">{children}</div>;
};

export default DashboardLayout;
