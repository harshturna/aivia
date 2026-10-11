import { isGuestUser } from "@/lib/guest-user";
import LogoutButton from "../LogoutButton";
import MobileSidebar from "./MobileSidebar";

const Navbar = async () => {
  const guestUser = await isGuestUser("SERVER_COMPONENT");
  return (
    <header className="sticky top-0 z-40 flex items-center border-b border-border/60 bg-background/80 p-4 backdrop-blur">
      <MobileSidebar />
      <div className="flex w-full items-center justify-end gap-2">
        <LogoutButton isGuestUser={guestUser} />
      </div>
    </header>
  );
};

export default Navbar;
