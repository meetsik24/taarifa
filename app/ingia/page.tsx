import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession, safeNextPath } from "@/lib/auth";

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
  const next = safeNextPath(nextValue);
  const error = errorValue === "credentials" || errorValue === "unavailable" ? errorValue : null;
  if (session) redirect(next);

  return (
    <>
      <SiteHeader active="login" />
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8 sm:py-12">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Ingia kwa wasimamizi</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Dashibodi inaonekana kwa wasimamizi tu. Fomu ya taarifa inabaki wazi kwa kiungo chake.
            </p>
          </CardHeader>
          <CardContent>
            <LoginForm next={next} error={error} />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
