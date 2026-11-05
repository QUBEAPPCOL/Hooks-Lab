import { Sidebar } from "@/components/Sidebar";
import { logout } from "@/app/login/actions";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:flex min-h-screen">
      <Sidebar logout={logout} />
      <main className="flex-1 min-w-0 px-4 sm:px-8 py-8 max-w-6xl">{children}</main>
    </div>
  );
}
