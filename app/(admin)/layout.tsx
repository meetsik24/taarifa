import { AdminShell } from "@/components/admin-shell";
import { requireStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireStaff();
  return (
    <AdminShell adminName={session.name} role={session.role}>
      {children}
    </AdminShell>
  );
}
