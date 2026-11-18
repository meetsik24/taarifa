import { requireAdmin } from "@/lib/auth";
import { listAdmins } from "@/lib/admins";
import { AdminManager } from "@/components/AdminManager";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminsPage() {
  const session = await requireAdmin();
  const admins = await listAdmins();

  return (
    <>
      <SiteHeader active="admins" adminName={session.name} />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
        <p className="text-sm leading-6 text-muted-foreground">
          Wasimamizi wanaweza kuona dashibodi. Mtu mwenye kiungo cha fomu haoni orodha hii.
        </p>
        <AdminManager admins={admins} currentEmail={session.email} />
      </main>
    </>
  );
}
