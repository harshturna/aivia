/**
 * Plain constants shared by the server layout and the client sidebar. Kept out of the
 * "use client" module: a server component importing from one gets client references, not
 * values, so the cookie name read as an object and the collapsed state never applied.
 */
export const SIDEBAR_COOKIE = "aivia_sidebar";
