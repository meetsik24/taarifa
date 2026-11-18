import type { Metadata } from "next";
import { EntryForm } from "@/components/EntryForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findActiveFormLink } from "@/lib/form-links";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "WAD 2026 | Jaza taarifa",
  description: "Fomu ya kushiriki taarifa ya utekelezaji wa kila siku wa WAD 2026.",
};

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

  return (
    <>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
        <div>
          <p className="text-sm font-medium text-primary">WAD 2026</p>
          <h1 className="text-xl font-medium">Jaza taarifa</h1>
        </div>
        {link ? (
          <EntryForm key={marker ?? "new"} againHref={`/fomu/${token}`} />
        ) : (
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Kiungo hakifanyi kazi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                Kiungo hiki kimesitishwa au si sahihi. Omba kiungo kipya kutoka kwa msimamizi.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
