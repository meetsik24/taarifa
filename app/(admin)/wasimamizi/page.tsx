import type { Metadata } from "next";
import { AdminManager } from "@/components/AdminManager";
import { requireSuperAdmin } from "@/lib/auth";
import { listAdmins } from "@/lib/admins";
import { getCopy } from "@/lib/locale";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getCopy();
  return { title: t.titles.admins };
}

export default async function AdminsPage() {
  const session = await requireSuperAdmin();
  const admins = await listAdmins();
  const t = await getCopy();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <p className="text-sm leading-6 text-muted-foreground">{t.pages.adminsLead}</p>
      <AdminManager admins={admins} currentEmail={session.email} />
    </div>
  );
}
