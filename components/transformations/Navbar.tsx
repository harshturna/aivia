import MobileSidebar from "./MobileSidebar";
import LogoutButton from "../LogoutButton";
import { isGuestUser } from "@/lib/guest-user";

const Navbar = async () => {
  const guestUser = await isGuestUser("SERVER_COMPONENT");
  return (
    <div className="flex items-center p-4">
      <MobileSidebar />
      <div className="flex w-full justify-end">
        <LogoutButton isGuestUser={guestUser} />
      </div>
    </div>
  );
};

export default Navbar;
