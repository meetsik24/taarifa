import { headers } from "next/headers";
import { FormLinkManager } from "@/components/FormLinkManager";
import { SiteHeader } from "@/components/SiteHeader";
import { requireAdmin } from "@/lib/auth";
import { listFormLinks } from "@/lib/form-links";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ShareFormPage() {
  const session = await requireAdmin();
  const links = (await listFormLinks()).filter((link) => link.revokedAt === null);
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "";
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${proto}://${host}` : "";

  return (
    <>
      <SiteHeader active="form" adminName={session.name} />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6 sm:px-8 sm:py-8">
        <FormLinkManager
          origin={origin}
          links={links.map((link) => ({
            id: link.id,
            token: link.token,
            label: link.label,
          }))}
        />
      </main>
    </>
  );
}
