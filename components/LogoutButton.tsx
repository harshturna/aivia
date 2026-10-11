"use client";

import { MoveRight } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./ui/button";

interface LogoutButtonProps {
  isGuestUser: boolean;
}

const LogoutButton = ({ isGuestUser }: LogoutButtonProps) => {
  const logoutHandler = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (!error) {
      window.location.href = "/";
    }

    if (error) {
      toast.error("Error Logging out");
    }
  };

  const guestLogout = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (!error) {
      window.location.href = "/login";
    }

    if (error) {
      window.location.href = "/";
    }
  };

  return isGuestUser ? (
    <Button variant="link" onClick={guestLogout}>
      Interested in more? Create an account <MoveRight className="ml-2" />
    </Button>
  ) : (
    <Button onClick={logoutHandler}>Logout</Button>
  );
};

export default LogoutButton;
