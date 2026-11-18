import type { Metadata } from "next";
import { EntryForm } from "@/components/EntryForm";
import { SiteHeader } from "@/components/SiteHeader";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "WAD 2026 | Jaza taarifa",
  description: "Fomu ya kushiriki taarifa ya utekelezaji wa kila siku wa WAD 2026.",
};

export default async function FormPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string | string[] }>;
}) {
  const params = await searchParams;
  const marker = Array.isArray(params.m) ? params.m[0] : params.m;
  const session = await getSession();

  return (
    <>
      <SiteHeader active="form" showDashboard={Boolean(session)} adminName={session?.name} />
      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
        <EntryForm key={marker ?? "new"} />
      </main>
    </>
  );
}
