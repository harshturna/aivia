import SettingsComponent from "@/components/ui/Settings";
import { checkSubscription } from "@/lib/subscription";

const page = async () => {
  const isPro = await checkSubscription("SERVER_COMPONENT");

  return <SettingsComponent isPro={isPro} />;
};

export default page;
