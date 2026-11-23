import { headers } from "next/headers";
import type { Metadata } from "next";
import { FormLinkManager } from "@/components/FormLinkManager";
import { listFormLinks } from "@/lib/form-links";
import { publicOriginFrom } from "@/lib/public-origin";
import { getCopy } from "@/lib/locale";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getCopy();
  return { title: t.titles.links };
}

export default async function ShareFormPage() {
  const links = (await listFormLinks()).filter((link) => link.revokedAt === null);
  const origin = publicOriginFrom(await headers());
  const t = await getCopy();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <p className="text-sm leading-6 text-muted-foreground">{t.pages.linksLead}</p>
      <FormLinkManager
        origin={origin}
        links={links.map((link) => ({
          id: link.id,
          token: link.token,
          label: link.label,
          passkey: link.passkey,
        }))}
      />
    </div>
  );
}
