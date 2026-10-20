"use client";

import { useActionState, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { submitInquiry, type SubmitInquiryState } from "@/lib/actions/inquiries";

const initialState: SubmitInquiryState = { status: "idle" };

export function InquiryForm({ propertyId }: { propertyId?: string }) {
  const t = useTranslations("form");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(
    submitInquiry,
    initialState,
  );
  const [renderedAt] = useState(() => Date.now());

  if (state.status === "success") {
    return (
      <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-600/20 p-6">
        <p className="font-semibold text-emerald-800">{t("successTitle")}</p>
        <p className="mt-1 text-sm text-emerald-700">
          {t("successBody", { reference: state.reference })}
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-navy placeholder:text-navy/35 focus:outline-none focus:ring-2 focus:ring-gold/50";

  return (
    <form action={formAction} className="space-y-4">
      {propertyId && (
        <input type="hidden" name="propertyId" value={propertyId} />
      )}
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="renderedAt" value={renderedAt} />
      {/* Honeypot — visually hidden without display:none, so basic bots still fill it */}
      <div className="w-0 h-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1.5">
          {t("fullName")} <span className="text-gold">{t("required")}</span>
        </label>
        <input
          name="fullName"
          required
          minLength={2}
          placeholder={t("fullNamePlaceholder")}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1.5">
          {t("phone")} <span className="text-gold">{t("required")}</span>
        </label>
        <input
          name="phone"
          type="tel"
          required
          minLength={6}
          placeholder={t("phonePlaceholder")}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1.5">
          {t("email")}
        </label>
        <input
          name="email"
          type="email"
          placeholder={t("emailPlaceholder")}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1.5">
          {t("message")} <span className="text-gold">{t("required")}</span>
        </label>
        <textarea
          name="message"
          required
          minLength={5}
          rows={4}
          placeholder={t("messagePlaceholder")}
          className={inputClass}
        />
      </div>

      {state.status === "error" && (
        <div className="rounded-lg bg-red-50 ring-1 ring-red-600/20 p-3">
          <p className="text-sm text-red-700">{t("errorBody")}</p>
        </div>
      )}

      <p className="text-xs text-navy/50">{t("privacyNotice")}</p>

      <button
        type="submit"
        disabled={pending}
        className="btn-gold w-full rounded-full px-6 py-3 text-sm font-semibold tracking-wide disabled:opacity-60"
      >
        {pending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
