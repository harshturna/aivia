"use client";

import { Button } from "./ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const LogoutButton = () => {
  const router = useRouter();
  const logoutHandler = async () => {
    const supabase = createClientComponentClient();
    const { error } = await supabase.auth.signOut();

    if (!error) {
      router.push("/");
    }

    if (error) {
      toast.error("Error Logging out");
    }
  };

  return <Button onClick={logoutHandler}>Logout</Button>;
};

export default LogoutButton;
