import { FormLinkManager } from "@/components/FormLinkManager";
import { SiteHeader } from "@/components/SiteHeader";
import { requireAdmin } from "@/lib/auth";
import { listFormLinks } from "@/lib/form-links";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ShareFormPage() {
  const session = await requireAdmin();
  const links = await listFormLinks();

  return (
    <>
      <SiteHeader active="form" adminName={session.name} />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
        <p className="text-sm leading-6 text-muted-foreground">
          Tengeneza kiungo na ushiriki. Mtu anayekifungua anajaza fomu tu. Haoni dashibodi wala orodha ya wasimamizi.
        </p>
        <FormLinkManager
          links={links.map((link) => ({
            id: link.id,
            token: link.token,
            label: link.label,
            createdAt: link.createdAt,
            revoked: link.revokedAt !== null,
          }))}
        />
      </main>
    </>
  );
}
