"use client";

import { useActionState } from "react";
import { unlockSharedForm, type UnlockState } from "@/app/fomu/actions";
import { useCopy } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FormPasskeyGate({ token }: { token: string }) {
  const t = useCopy();
  const [state, action, pending] = useActionState<UnlockState, FormData>(unlockSharedForm, null);

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>{t.passkey.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-3">
          <input type="hidden" name="token" value={token} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="passkey">{t.passkey.label}</Label>
            <Input
              id="passkey"
              name="passkey"
              type="password"
              autoComplete="off"
              required
              minLength={4}
              maxLength={64}
              placeholder={t.passkey.placeholder}
            />
          </div>
          <p className="text-sm leading-6 text-muted-foreground">{t.passkey.hint}</p>
          {state?.error ? (
            <p className="text-sm font-medium text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}
          <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
            {pending ? t.passkey.checking : t.passkey.open}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
