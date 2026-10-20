"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Tableau de bord", icon: "🏠" },
  { href: "/admin/properties", label: "Projets", icon: "🏢" },
  { href: "/admin/inquiries", label: "Demandes", icon: "✉️" },
  { href: "/admin/settings", label: "Paramètres", icon: "⚙️" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="md:w-64 shrink-0 bg-navy text-ivory md:min-h-screen">
      <div className="p-5 flex items-center gap-3 border-b border-white/10">
        <Image
          src="/logo.jpeg"
          alt="POLARIS"
          width={1480}
          height={1580}
          className="h-14 w-auto shrink-0"
        />
        <div className="leading-tight">
          <p className="font-display text-sm">POLARIS</p>
          <p className="text-xs text-ivory/50">Administration</p>
        </div>
      </div>

      <nav className="p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
        {LINKS.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm whitespace-nowrap transition-colors ${
                active
                  ? "bg-gold text-white font-semibold"
                  : "text-ivory/80 hover:bg-white/10"
              }`}
            >
              <span aria-hidden="true">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
