import { logout } from "@/lib/actions/auth";

export function AdminTopbar({ email }: { email: string }) {
  return (
    <header className="h-16 bg-white border-b border-line flex items-center justify-between px-4 md:px-8">
      <p className="text-sm text-navy/60">{email}</p>
      <form action={logout}>
        <button
          type="submit"
          className="text-sm font-medium text-navy/70 hover:text-gold cursor-pointer"
        >
          Déconnexion
        </button>
      </form>
    </header>
  );
}
