import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { createDraftProperty } from "@/lib/actions/properties";

async function count(table: string, match: Record<string, string>) {
  const admin = createAdminClient();
  let query = admin.from(table).select("id", { count: "exact", head: true });
  for (const [key, value] of Object.entries(match)) {
    query = query.eq(key, value);
  }
  const { count: c } = await query;
  return c ?? 0;
}

export default async function AdminDashboardPage() {
  const [published, draft, available, newInquiries] = await Promise.all([
    count("properties", { publication_status: "published" }),
    count("properties", { publication_status: "draft" }),
    count("properties", { status: "available" }),
    count("inquiries", { status: "new" }),
  ]);

  const stats = [
    { label: "Projets publiés", value: published, href: "/admin/properties" },
    { label: "Demandes à traiter", value: newInquiries, href: "/admin/inquiries" },
    { label: "Projets disponibles", value: available, href: "/admin/properties" },
    { label: "Brouillons", value: draft, href: "/admin/properties" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-navy mb-2">Tableau de bord</h1>
      <p className="text-navy/60 mb-8">POLARIS Construction</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl ring-1 ring-line p-6 hover:ring-gold transition-colors"
          >
            <p className="text-3xl font-display text-navy">{stat.value}</p>
            <p className="mt-1 text-sm text-navy/60">{stat.label}</p>
          </Link>
        ))}
      </div>

      <form action={createDraftProperty}>
        <button
          type="submit"
          className="btn-gold rounded-full px-8 py-3 text-sm font-semibold cursor-pointer"
        >
          + Ajouter un nouveau projet
        </button>
      </form>
    </div>
  );
}
