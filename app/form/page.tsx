import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrandLockup } from "@/components/BrandMark";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitch } from "@/components/language-switch";
import { getSession } from "@/lib/auth";
import { getCopy } from "@/lib/locale";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getCopy();
  return { title: t.titles.form, description: t.titles.formDescription };
}

export default async function FormPage() {
  const session = await getSession();
  if (session) redirect("/jaza");
  const t = await getCopy();

  return (
    <>
      <div className="h-2 bg-primary" aria-hidden="true" />
      <div className="h-1 bg-brand-cyan" aria-hidden="true" />
      <div className="flex justify-end px-4 pt-4 sm:px-8">
        <LanguageSwitch />
      </div>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
        <BrandLockup title={t.pages.enterReport} />
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>{t.pages.formByLinkTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">{t.pages.formByLinkBody}</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
