export const MAX_FREE_COUNTS = 5;
// Global cost cap per user row. The guest account is shared by every visitor,
// so this is the ceiling on public demo spend. Reset `UserApiLimit.hardLimitCount`
// to 0 in the DB to clear it.
export const HARD_LIMIT_COUNTS = 100;

export type ContextType =
  | "ROUTE_HANDLER"
  | "SERVER_COMPONENT"
  | "CLIENT_COMPONENT";
