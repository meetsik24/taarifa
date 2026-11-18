"use client";

import { useActionState } from "react";
import { UserAdd01Icon } from "@hugeicons/core-free-icons";
import { createAdmin, removeAdmin, type AdminFormState } from "@/app/wasimamizi/actions";
import { AppIcon } from "@/components/app-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminManager({
  admins,
  currentEmail,
}: {
  admins: Array<{ id: number; name: string; email: string }>;
  currentEmail: string;
}) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(createAdmin, null);

  return (
    <div className="flex flex-col gap-4">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Wasimamizi</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex flex-col gap-3 border-b border-border pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-base font-medium">{admin.name}</p>
                <p className="text-sm text-muted-foreground">{admin.email}</p>
              </div>
              {admins.length > 1 && admin.email !== currentEmail ? (
                <form action={removeAdmin}>
                  <input type="hidden" name="id" value={admin.id} />
                  <Button type="submit" variant="outline" className="w-full sm:w-auto">
                    Ondoa
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {admin.email === currentEmail ? "Wewe" : "Msimamizi wa pekee"}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Ongeza msimamizi</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {state?.error ? (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive sm:col-span-2" role="alert">
                {state.error}
              </p>
            ) : null}
            {state?.ok ? (
              <p className="rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground sm:col-span-2" role="status">
                {state.ok}
              </p>
            ) : null}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Jina</Label>
              <Input id="name" name="name" required maxLength={80} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin-email">Barua pepe</Label>
              <Input id="admin-email" name="email" type="email" required autoComplete="off" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin-password">Nenosiri</Label>
              <Input id="admin-password" name="password" type="password" required minLength={8} autoComplete="new-password" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm">Rudia nenosiri</Label>
              <Input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" />
            </div>
            <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
              <AppIcon icon={UserAdd01Icon} />
              {pending ? "Inaongeza…" : "Ongeza msimamizi"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
