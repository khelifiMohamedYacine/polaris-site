"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: t("home") },
    { href: "/projets", label: t("properties") },
    { href: "/a-propos", label: t("about") },
    { href: "/contact", label: t("contact") },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-black/95 to-navy/95 backdrop-blur text-ivory shadow-[0_10px_30px_rgba(0,0,0,0.55)]">
      <div className="container-page flex items-center justify-between h-24">
        <Link href="/" className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Image
            src="/logo.jpeg"
            alt="POLARIS Construction"
            width={1480}
            height={1580}
            priority
            className="h-12 sm:h-16 w-auto shrink-0"
          />
          <span className="font-display text-base sm:text-xl tracking-wide whitespace-nowrap">
            POLARIS <span className="text-gold">Construction</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm tracking-wide transition-colors ${
                  active ? "text-gold font-semibold" : "text-ivory hover:text-gold"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <LanguageSwitcher />
        </nav>

        <button
          type="button"
          className="md:hidden p-2 -me-2 shrink-0 cursor-pointer"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
        >
          <span className="block w-6 h-0.5 bg-ivory mb-1.5" />
          <span className="block w-6 h-0.5 bg-ivory mb-1.5" />
          <span className="block w-6 h-0.5 bg-ivory" />
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-white/10 bg-navy">
          <div className="container-page py-4 flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-ivory text-base py-1"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10" onClick={() => setOpen(false)}>
              <LanguageSwitcher />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
