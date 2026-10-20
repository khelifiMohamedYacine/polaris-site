"use client";

import { useActionState } from "react";
import Image from "next/image";
import { login, type LoginState } from "@/lib/actions/auth";

const initialState: LoginState = { error: null };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/logo.jpeg"
            alt="POLARIS Construction"
            width={1480}
            height={1580}
            priority
            className="h-24 w-auto mb-4"
          />
          <h1 className="font-display text-xl text-navy">Espace administration</h1>
          <p className="text-sm text-navy/50">POLARIS Construction</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">
              Adresse e-mail
            </label>
            <input
              key={state.email}
              name="email"
              type="email"
              defaultValue={state.email}
              required
              autoComplete="username"
              className="w-full rounded-lg border border-line px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">
              Mot de passe
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-line px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>

          {state.error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn-gold w-full rounded-full px-6 py-3 text-sm font-semibold tracking-wide disabled:opacity-60"
          >
            {pending ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
