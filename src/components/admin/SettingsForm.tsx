"use client";

import { useActionState } from "react";
import { updateSiteSettings, type SaveSettingsState } from "@/lib/actions/settings";
import type { SiteSettings } from "@/types/database";

const initialState: SaveSettingsState = { error: null };
const inputClass =
  "w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold/50";
const labelClass = "block text-sm font-medium text-navy mb-1.5";

export function SettingsForm({ settings }: { settings: SiteSettings | null }) {
  const [state, formAction, pending] = useActionState(updateSiteSettings, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className={labelClass}>Téléphone</label>
        <input
          name="company_phone"
          defaultValue={settings?.company_phone ?? ""}
          placeholder="+213 ..."
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Numéro WhatsApp</label>
        <input
          name="whatsapp_number"
          defaultValue={settings?.whatsapp_number ?? ""}
          placeholder="+213 ... (format international)"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>E-mail</label>
        <input
          name="company_email"
          type="email"
          defaultValue={settings?.company_email ?? ""}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Adresse</label>
        <input
          name="company_address"
          defaultValue={settings?.company_address ?? ""}
          className={inputClass}
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg p-3">
          Paramètres enregistrés.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-gold rounded-full px-8 py-3 text-sm font-semibold tracking-wide disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
