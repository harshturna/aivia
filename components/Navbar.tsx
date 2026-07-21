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
    <header className="sticky top-0 z-40 flex items-center border-b border-border/60 bg-background/80 p-4 backdrop-blur">
      <MobileSidebar apiLimitCount={apiLimitCount} isPro={isPro} />
      <div className="flex w-full items-center justify-end gap-2">
        <LogoutButton isGuestUser={guestUser} />
      </div>
    </header>
  );
};

export default Navbar;
