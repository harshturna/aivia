import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { ContextType } from "@/constants";

export async function getUser(context: ContextType) {
  if (context === "ROUTE_HANDLER") {
    const supabase = createRouteHandlerClient({ cookies });
    const { data } = await supabase.auth.getSession();
    return data.session?.user;
  }

  if (context === "SERVER_COMPONENT") {
    const supabase = createServerComponentClient({ cookies });
    const { data } = await supabase.auth.getSession();
    return data.session?.user;
  }
}
