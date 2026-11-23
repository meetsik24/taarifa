"use client";

import { useActionState, useState } from "react";
import { Copy01Icon, Link01Icon } from "@hugeicons/core-free-icons";
import { createFormLink, stopFormLink, type LinkFormState } from "@/app/(admin)/jaza/actions";
import { AppIcon } from "@/components/app-icon";
import { useCopy } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { fill } from "@/lib/messages";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type ShareLink = {
  id: number;
  token: string;
  label: string;
  passkey: string;
};

function linkUrl(origin: string, token: string): string {
  const base = origin || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/fomu/${token}`;
}

export function FormLinkManager({ links, origin }: { links: ShareLink[]; origin: string }) {
  const t = useCopy();
  const [state, action, pending] = useActionState<LinkFormState, FormData>(createFormLink, null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  async function copyText(id: number, value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const field = document.createElement("textarea");
      field.value = value;
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

  async function copyLink(id: number, token: string): Promise<void> {
    await copyText(id, linkUrl(origin, token));
  }

  return (
    <Card className="shadow-none">
      <CardContent className="flex flex-col gap-5">
        <form action={action} className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="label"
            name="label"
            maxLength={80}
            placeholder={t.links.namePlaceholder}
            aria-label={t.links.nameLabel}
            className="sm:flex-1"
          />
          <Input
            id="passkey"
            name="passkey"
            type="text"
            required
            minLength={4}
            maxLength={64}
            autoComplete="off"
            placeholder={t.links.passkeyPlaceholder}
            aria-label={t.links.passkeyLabel}
            className="sm:w-44"
          />
          <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
            <AppIcon icon={Link01Icon} />
            {pending ? t.links.creating : t.links.create}
          </Button>
        </form>
        {state?.token && state.passkey ? (
          <div className="rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground" role="status">
            <p>{t.links.ready}</p>
            <p className="mt-1 font-medium">{fill(t.links.passkeyLine, { passkey: state.passkey })}</p>
          </div>
        ) : null}
        {state?.error ? (
          <p className="text-sm font-medium text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}

        {links.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.links.empty}</p>
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
                    {link.passkey ? (
                      <p className="text-sm text-muted-foreground">
                        {fill(t.links.passkeyLine, { passkey: link.passkey })}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t.links.openLink}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 sm:flex-none"
                      onClick={() => void copyLink(link.id, link.token)}
                    >
                      <AppIcon icon={Copy01Icon} />
                      {copiedId === link.id ? t.links.copied : t.links.copy}
                    </Button>
                    <form action={stopFormLink}>
                      <input type="hidden" name="id" value={link.id} />
                      <Button type="submit" variant="outline">
                        {t.links.stop}
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
