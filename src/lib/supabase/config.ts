/**
 * False while the site runs with placeholder Supabase values (before the real
 * project is connected). Callers skip database requests in that case instead of
 * waiting on a host that can't answer, so pages still render instantly.
 */
export const isSupabaseConfigured = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return /^https?:\/\//.test(url) && !url.includes("placeholder");
})();
