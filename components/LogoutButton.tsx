"use client";

import { Button } from "./ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";

const LogoutButton = () => {
  const logoutHandler = async () => {
    const supabase = createClientComponentClient();
    const { error } = await supabase.auth.signOut();

    if (!error) {
      window.location.href="/";
    }

    if (error) {
      toast.error("Error Logging out");
    }
  };

  return <Button onClick={logoutHandler}>Logout</Button>;
};

export default LogoutButton;
