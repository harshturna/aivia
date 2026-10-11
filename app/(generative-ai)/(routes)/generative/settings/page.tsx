import SettingsComponent from "@/components/ui/Settings";
import { isGuestUser } from "@/lib/guest-user";
import { checkSubscription } from "@/lib/subscription";

const page = async () => {
  const isPro = await checkSubscription("SERVER_COMPONENT");
  const isGuest = await isGuestUser("SERVER_COMPONENT");

  return <SettingsComponent isPro={isPro} isGuest={isGuest} />;
};

export default page;
