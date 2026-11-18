"use client";

import { useActionState, useEffect, useState } from "react";
import { Copy01Icon, Link01Icon, Share08Icon } from "@hugeicons/core-free-icons";
import { createFormLink, stopFormLink, type LinkFormState } from "@/app/jaza/actions";
import { AppIcon } from "@/components/app-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/format";

export type ShareLink = {
  id: number;
  token: string;
  label: string;
  createdAt: string;
  revoked: boolean;
};

function linkUrl(token: string): string {
  return `${window.location.origin}/fomu/${token}`;
}

export function FormLinkManager({ links }: { links: ShareLink[] }) {
  const [state, action, pending] = useActionState<LinkFormState, FormData>(createFormLink, null);
  const [origin, setOrigin] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    setCanShare(typeof navigator.share === "function");
  }, []);

  async function copyLink(id: number, token: string): Promise<void> {
    await navigator.clipboard.writeText(linkUrl(token));
    setCopiedId(id);
  }

  async function shareLink(token: string, label: string): Promise<void> {
    const url = linkUrl(token);
    if (navigator.share) {
      await navigator.share({ title: label, text: "Jaza taarifa ya WAD 2026", url });
      return;
    }
    await navigator.clipboard.writeText(url);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Tengeneza kiungo</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="flex flex-col gap-4">
            {state?.error ? (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive" role="alert">
                {state.error}
              </p>
            ) : null}
            {state?.ok ? (
              <p className="rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground" role="status">
                {state.ok}
              </p>
            ) : null}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="label">Jina la kiungo</Label>
              <Input id="label" name="label" maxLength={80} placeholder="Mfano: Kanda ya Kaskazini" />
            </div>
            <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
              <AppIcon icon={Link01Icon} />
              {pending ? "Inatengeneza…" : "Tengeneza kiungo"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Viungo vya kushiriki</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {links.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Bado hakuna kiungo. Tengeneza kimoja, kisha nakili au shiriki. Mtu mwenye kiungo anajaza fomu, haoni dashibodi.
            </p>
          ) : (
            links.map((link) => {
              const url = origin ? `${origin}/fomu/${link.token}` : `/fomu/${link.token}`;
              return (
                <div
                  key={link.id}
                  className="flex flex-col gap-3 border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <p className="text-base font-medium">{link.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(link.createdAt.slice(0, 10))}
                      {link.revoked ? " · Imesitishwa" : ""}
                    </p>
                  </div>
                  <Input readOnly value={url} aria-label={`Kiungo cha ${link.label}`} onFocus={(event) => event.currentTarget.select()} />
                  {link.revoked ? (
                    <p className="text-sm text-muted-foreground">Kiungo hiki hakifungui fomu tena.</p>
                  ) : (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => void copyLink(link.id, link.token)}>
                        <AppIcon icon={Copy01Icon} />
                        {copiedId === link.id ? "Imenakiliwa" : "Nakili"}
                      </Button>
                      {canShare ? (
                        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => void shareLink(link.token, link.label)}>
                          <AppIcon icon={Share08Icon} />
                          Shiriki
                        </Button>
                      ) : null}
                      <form action={stopFormLink}>
                        <input type="hidden" name="id" value={link.id} />
                        <Button type="submit" variant="outline" className="w-full sm:w-auto">
                          Sitisha
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
