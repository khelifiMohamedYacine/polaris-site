import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "./session";

export async function getCurrentAdmin() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Every admin server action / route calls this first. */
export async function assertAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Non autorisé.");
  return admin;
}
