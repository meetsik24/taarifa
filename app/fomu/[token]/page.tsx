import type { Metadata } from "next";
import { cookies } from "next/headers";
import { BrandLockup } from "@/components/BrandMark";
import { EntryForm } from "@/components/EntryForm";
import { FormPasskeyGate } from "@/components/FormPasskeyGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitch } from "@/components/language-switch";
import { findActiveFormLink } from "@/lib/form-links";
import { getCopy } from "@/lib/locale";
import { FORM_ACCESS_COOKIE, readFormAccess } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getCopy();
  return { title: t.titles.form, description: t.titles.formDescription };
}

export default async function SharedFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ m?: string | string[] }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const marker = Array.isArray(query.m) ? query.m[0] : query.m;
  const link = await findActiveFormLink(token);
  const jar = await cookies();
  const accessToken = await readFormAccess(jar.get(FORM_ACCESS_COOKIE)?.value);
  const unlocked = Boolean(link) && (link?.passkey === "" || accessToken === token);
  const t = await getCopy();

  return (
    <>
      <div className="h-2 bg-primary" aria-hidden="true" />
      <div className="h-1 bg-brand-cyan" aria-hidden="true" />
      <div className="flex justify-end px-4 pt-4 sm:px-8">
        <LanguageSwitch />
      </div>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
        <BrandLockup title={t.pages.enterReport} priority />
        {link && unlocked ? (
          <EntryForm key={marker ?? "new"} againHref={`/fomu/${token}`} formToken={token} />
        ) : null}
        {link && !unlocked ? <FormPasskeyGate token={token} /> : null}
        {!link ? (
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>{t.pages.linkDeadTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">{t.pages.linkDeadBody}</p>
            </CardContent>
          </Card>
        ) : null}
      </main>
    </>
  );
}
