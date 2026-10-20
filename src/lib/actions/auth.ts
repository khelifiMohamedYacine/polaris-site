"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query, queryOne } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session";

/** `email` is echoed back so the form can refill it — React resets the form after each submit. */
export type LoginState = { error: string | null; email?: string };

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const fail = (error: string): LoginState => ({ error, email });

  if (!email || !password) {
    return fail("Merci de renseigner votre e-mail et votre mot de passe.");
  }

  let user: { id: string; email: string; password_hash: string } | null;
  try {
    user = await queryOne("SELECT id, email, password_hash FROM admin_users WHERE email = $1", [email]);
    if (!user) {
      const [{ count }] = await query<{ count: number }>("SELECT count(*)::int AS count FROM admin_users");
      if (count === 0) {
        return fail("Aucun compte administrateur : définissez ADMIN_EMAIL et ADMIN_PASSWORD sur l'hébergeur.");
      }
    }
  } catch (err) {
    console.error("login failed:", err);
    return fail("Connexion impossible pour le moment. Merci de réessayer.");
  }

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return fail("E-mail ou mot de passe incorrect.");
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken({ uid: user.id, email: user.email }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect("/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
