import { getCurrentAdmin } from "@/lib/auth/current";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  return (
    <div className="min-h-screen md:flex">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <AdminTopbar email={admin?.email ?? ""} />
        <main className="p-4 md:p-8 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
