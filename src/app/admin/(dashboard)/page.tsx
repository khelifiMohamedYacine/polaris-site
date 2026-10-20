import Link from "next/link";
import { queryOne } from "@/lib/db";
import { createDraftProperty } from "@/lib/actions/properties";

export default async function AdminDashboardPage() {
  const counts = await queryOne<{
    published: number;
    draft: number;
    available: number;
    new_inquiries: number;
  }>(`SELECT
      (SELECT count(*)::int FROM properties WHERE publication_status = 'published') AS published,
      (SELECT count(*)::int FROM properties WHERE publication_status = 'draft') AS draft,
      (SELECT count(*)::int FROM properties WHERE status = 'available') AS available,
      (SELECT count(*)::int FROM inquiries WHERE status = 'new') AS new_inquiries`);
  const { published, draft, available, new_inquiries: newInquiries } = counts!;

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
