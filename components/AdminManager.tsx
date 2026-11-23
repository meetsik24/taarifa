"use client";

import { useActionState } from "react";
import { UserAdd01Icon } from "@hugeicons/core-free-icons";
import { createAdmin, removeAdmin, type AdminFormState } from "@/app/(admin)/wasimamizi/actions";
import { AppIcon } from "@/components/app-icon";
import { useCopy, useLocale } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { roleLabel, type Role } from "@/lib/roles";

export function AdminManager({
  admins,
  currentEmail,
}: {
  admins: Array<{ id: number; name: string; email: string; role: Role }>;
  currentEmail: string;
}) {
  const t = useCopy();
  const locale = useLocale();
  const [state, action, pending] = useActionState<AdminFormState, FormData>(createAdmin, null);

  return (
    <div className="flex flex-col gap-4">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>{t.admins.title}</CardTitle>
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
                <p className="text-sm text-muted-foreground">{roleLabel(admin.role, locale)}</p>
              </div>
              {admin.role !== "super_admin" && admin.email !== currentEmail ? (
                <form action={removeAdmin}>
                  <input type="hidden" name="id" value={admin.id} />
                  <Button type="submit" variant="outline" className="w-full sm:w-auto">
                    {t.admins.remove}
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {admin.email === currentEmail ? t.roles.you : roleLabel(admin.role, locale)}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>{t.admins.addTitle}</CardTitle>
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
              <Label htmlFor="name">{t.admins.name}</Label>
              <Input id="name" name="name" required maxLength={80} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin-email">{t.admins.email}</Label>
              <Input id="admin-email" name="email" type="email" required autoComplete="off" />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="role">{t.admins.role}</Label>
              <NativeSelect id="role" name="role" defaultValue="admin">
                <option value="admin">{t.roles.admin}</option>
                <option value="filler">{t.roles.filler}</option>
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin-password">{t.admins.password}</Label>
              <Input id="admin-password" name="password" type="password" required minLength={8} autoComplete="new-password" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm">{t.admins.confirm}</Label>
              <Input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" />
            </div>
            <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
              <AppIcon icon={UserAdd01Icon} />
              {pending ? t.admins.adding : t.admins.add}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
