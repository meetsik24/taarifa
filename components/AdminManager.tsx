"use client";

import { useActionState, useState } from "react";
import { UserAdd01Icon } from "@hugeicons/core-free-icons";
import { createAdmin, removeAdmin, saveAdminZone, type AdminFormState } from "@/app/(admin)/wasimamizi/actions";
import { AppIcon } from "@/components/app-icon";
import { useCopy, useLocale } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { KANDA } from "@/lib/places";
import { roleLabel, type Role } from "@/lib/roles";

function AccessForm({ id, kanda }: { id: number; kanda: string }) {
  const t = useCopy();
  const [state, action, pending] = useActionState<AdminFormState, FormData>(saveAdminZone, null);

  return (
    <form action={action} className="flex flex-col gap-2 sm:max-w-sm">
      <input type="hidden" name="id" value={id} />
      <Label htmlFor={`kanda-${id}`}>{t.admins.access}</Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <NativeSelect id={`kanda-${id}`} name="kanda" defaultValue={kanda} className="sm:flex-1">
          <option value="">{t.admins.allZones}</option>
          {KANDA.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </NativeSelect>
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? t.admins.savingAccess : t.admins.saveAccess}
        </Button>
      </div>
      {state?.ok ? <p className="text-sm text-muted-foreground">{state.ok}</p> : null}
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
    </form>
  );
}

export function AdminManager({
  admins,
  currentEmail,
}: {
  admins: Array<{ id: number; name: string; email: string; role: Role; kanda: string }>;
  currentEmail: string;
}) {
  const t = useCopy();
  const locale = useLocale();
  const [role, setRole] = useState("admin");
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
              className="flex flex-col gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
            >
              <div>
                <p className="text-base font-medium">{admin.name}</p>
                <p className="text-sm text-muted-foreground">{admin.email}</p>
                <p className="text-sm text-muted-foreground">
                  {roleLabel(admin.role, locale)}
                  {admin.role === "admin" ? ` · ${admin.kanda || t.admins.allZones}` : ""}
                </p>
              </div>
              {admin.role === "admin" ? <AccessForm key={`${admin.id}-${admin.kanda}`} id={admin.id} kanda={admin.kanda} /> : null}
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
              <NativeSelect id="role" name="role" value={role} onChange={(event) => setRole(event.target.value)}>
                <option value="admin">{t.roles.admin}</option>
                <option value="filler">{t.roles.filler}</option>
              </NativeSelect>
            </div>
            {role === "admin" ? (
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="kanda">{t.admins.access}</Label>
                <p className="text-sm text-muted-foreground">{t.admins.accessHint}</p>
                <NativeSelect id="kanda" name="kanda" defaultValue="">
                  <option value="">{t.admins.allZones}</option>
                  {KANDA.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            ) : null}
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
