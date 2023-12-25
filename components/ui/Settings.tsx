import Heading from "@/components/Heading";
import SubscriptionButton from "@/components/SubscriptionButton";
import { Settings } from "lucide-react";

interface SettingsProps {
  isPro: boolean;
}

const SettingsComponent = async ({ isPro = false }: SettingsProps) => {
  return (
    <div>
      <Heading
        title="Settings"
        description="Manage account settings."
        icon={Settings}
        iconColor="text-gray-700"
        bgColor="bg-gray-700/10"
      ></Heading>
      <div className="px-4 lg:px-8 space-y-4">
        <div className="text-muted-foreground text-sm">
          {isPro
            ? "You are currently on a pro plan."
            : "You are currently on a free plan"}
        </div>
        <SubscriptionButton isPro={isPro} />
      </div>
    </div>
  );
};

export default SettingsComponent;
