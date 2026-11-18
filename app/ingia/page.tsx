import { Login01Icon } from "@hugeicons/core-free-icons";
import { redirect } from "next/navigation";
import { login } from "@/app/ingia/actions";
import { AppIcon } from "@/components/app-icon";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSession, safeNextPath } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string | string[]; next?: string | string[] }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const nextValue = Array.isArray(params.next) ? params.next[0] : params.next;
  const next = safeNextPath(nextValue);
  if (session) redirect(next);

  const errorCode = Array.isArray(params.e) ? params.e[0] : params.e;
  const failed = errorCode === "1";
  const unavailable = errorCode === "2";

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
            <form action={login} className="flex flex-col gap-4">
              <input type="hidden" name="next" value={next} />
              {failed ? (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive" role="alert">
                  Barua pepe au nenosiri si sahihi.
                </p>
              ) : null}
              {unavailable ? (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive" role="alert">
                  Hifadhidata haipatikani kwa sasa. Jaribu tena.
                </p>
              ) : null}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Barua pepe</Label>
                <Input id="email" name="email" type="email" autoComplete="username" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Nenosiri</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <AppIcon icon={Login01Icon} />
                Ingia
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
