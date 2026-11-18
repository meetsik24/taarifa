import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "WAD 2026 | Jaza taarifa",
  description: "Fomu ya kushiriki taarifa ya utekelezaji wa kila siku wa WAD 2026.",
};

export default async function FormPage() {
  const session = await getSession();
  if (session) redirect("/jaza");

  return (
    <>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
        <div>
          <p className="text-sm font-medium text-primary">WAD 2026</p>
          <h1 className="text-xl font-medium">Jaza taarifa</h1>
        </div>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Fomu inafunguliwa kwa kiungo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              Omba kiungo kutoka kwa msimamizi. Kiungo hicho kinakufungulia fomu ya kujaza taarifa.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
