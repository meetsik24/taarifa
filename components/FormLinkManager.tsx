"use client";

import { useActionState, useState } from "react";
import { Copy01Icon, Link01Icon } from "@hugeicons/core-free-icons";
import { createFormLink, stopFormLink, type LinkFormState } from "@/app/jaza/actions";
import { AppIcon } from "@/components/app-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type ShareLink = {
  id: number;
  token: string;
  label: string;
};

function linkUrl(origin: string, token: string): string {
  const base = origin || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/fomu/${token}`;
}

export function FormLinkManager({ links, origin }: { links: ShareLink[]; origin: string }) {
  const [state, action, pending] = useActionState<LinkFormState, FormData>(createFormLink, null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  async function copyLink(id: number, token: string): Promise<void> {
    const url = linkUrl(origin, token);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.left = "-9999px";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    setCopiedId(id);
  }

  return (
    <Card className="shadow-none">
      <CardContent className="flex flex-col gap-5">
        <form action={action} className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="label"
            name="label"
            maxLength={80}
            placeholder="Jina la kiungo, mfano Kanda ya Kaskazini"
            aria-label="Jina la kiungo"
            className="sm:flex-1"
          />
          <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
            <AppIcon icon={Link01Icon} />
            {pending ? "Inatengeneza…" : "Tengeneza kiungo"}
          </Button>
        </form>
        {state?.error ? (
          <p className="text-sm font-medium text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}

        {links.length === 0 ? (
          <p className="text-sm text-muted-foreground">Bado hakuna kiungo.</p>
        ) : (
          <ul className="flex flex-col">
            {links.map((link) => {
              const url = linkUrl(origin, link.token);
              return (
                <li
                  key={link.id}
                  className="flex flex-col gap-2 border-t border-border py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{link.label}</p>
                    <p className="truncate text-sm text-muted-foreground">{url}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 sm:flex-none"
                      onClick={() => void copyLink(link.id, link.token)}
                    >
                      <AppIcon icon={Copy01Icon} />
                      {copiedId === link.id ? "Imenakiliwa" : "Nakili"}
                    </Button>
                    <form action={stopFormLink}>
                      <input type="hidden" name="id" value={link.id} />
                      <Button type="submit" variant="outline">
                        Sitisha
                      </Button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
