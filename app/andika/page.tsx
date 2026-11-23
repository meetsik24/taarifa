import type { Metadata } from "next";
import { Logout01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/app-icon";
import { BrandLockup } from "@/components/BrandMark";
import { EntryForm } from "@/components/EntryForm";
import { buttonVariants } from "@/components/ui/button";
import { LanguageSwitch } from "@/components/language-switch";
import { requireUser } from "@/lib/auth";
import { getCopy } from "@/lib/locale";
import { fill } from "@/lib/messages";
import { cn } from "cn";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getCopy();
  return { title: t.titles.form, description: t.titles.formDescription };
}

export default async function FillPage() {
  const session = await requireUser();
  const t = await getCopy();

  return (
    <>
      <div className="h-2 bg-primary" aria-hidden="true" />
      <div className="h-1 bg-brand-cyan" aria-hidden="true" />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <BrandLockup title={t.pages.enterReport} />
          <div className="flex flex-col gap-2 sm:items-end">
            <LanguageSwitch />
            <form action="/toka" method="post">
              <button type="submit" className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}>
                <AppIcon icon={Logout01Icon} />
                {fill(t.pages.signOutNamed, { name: session.name })}
              </button>
            </form>
          </div>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          {session.role === "filler" ? t.pages.fillerNote : t.pages.staffNote}
        </p>
        <EntryForm againHref="/andika" />
      </main>
    </>
  );
}
