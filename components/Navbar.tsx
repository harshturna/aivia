import MobileSidebar from "./MobileSidebar";
import { getApiLimitCount } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import LogoutButton from "./LogoutButton";
import { isGuestUser } from "@/lib/guest-user";

const Navbar = async () => {
  const apiLimitCount = await getApiLimitCount("SERVER_COMPONENT");
  const isPro = await checkSubscription("SERVER_COMPONENT");
  const guestUser = await isGuestUser("SERVER_COMPONENT");

  return (
    <div className="flex items-center p-4">
      <MobileSidebar apiLimitCount={apiLimitCount} isPro={isPro} />
      <div className="flex w-full justify-end">
        <LogoutButton isGuestUser={guestUser} />
      </div>
    </div>
  );
};

export default Navbar;
