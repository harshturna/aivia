import { Button } from "@/components/ui/button";
import Link from "next/link";

const page = () => {
  return (
    <div>
      <Link href="/login">
        <Button>Login</Button>
      </Link>
      <Link href="/signup">
        <Button>Register</Button>
      </Link>
      <Link href="/dashboard">
        <Button>Dashboard</Button>
      </Link>
    </div>
  );
};

export default page;
