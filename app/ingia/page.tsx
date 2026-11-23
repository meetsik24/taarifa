import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrandLockup } from "@/components/BrandMark";
import { LanguageSwitch } from "@/components/language-switch";
import { LoginForm } from "@/components/LoginForm";
import { Card, CardContent } from "@/components/ui/card";
import { destinationFor, getSession } from "@/lib/auth";
import { getCopy } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getCopy();
  return { title: t.titles.signIn };
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; error?: string | string[] }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const nextValue = Array.isArray(params.next) ? params.next[0] : params.next;
  const errorValue = Array.isArray(params.error) ? params.error[0] : params.error;
  const next =
    nextValue && nextValue.startsWith("/") && !nextValue.startsWith("//") && !nextValue.startsWith("/ingia")
      ? nextValue
      : "/";
  const error = errorValue === "credentials" || errorValue === "unavailable" ? errorValue : null;
  if (session) redirect(destinationFor(session.role, next));
  const t = await getCopy();

  return (
    <>
      <div className="h-2 bg-primary" aria-hidden="true" />
      <div className="h-1 bg-brand-cyan" aria-hidden="true" />
      <div className="flex justify-end px-4 pt-4">
        <LanguageSwitch />
      </div>
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8 sm:py-12">
        <BrandLockup title={t.pages.signIn} priority />
        <Card className="shadow-none">
          <CardContent>
            <LoginForm next={next} error={error} />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
