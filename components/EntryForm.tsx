"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import {
  CheckmarkCircle02Icon,
  PencilEdit02Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { submitEntry, type SubmitState } from "@/app/form/actions";
import { AppIcon } from "@/components/app-icon";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { formatCount, formatDate } from "@/lib/format";
import { ACTIVITY_TYPES, STATUSES } from "@/lib/options";
import { councilsFor, KANDA, MIKOA } from "@/lib/places";
import { cn } from "cn";

function Field({
  name,
  label,
  required,
  error,
  children,
}: {
  name: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label>
      {children}
      {error ? (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function CountPair({
  legend,
  meName,
  keName,
  errors,
}: {
  legend: string;
  meName: string;
  keName: string;
  errors: Record<string, string>;
}) {
  const [me, setMe] = useState(0);
  const [ke, setKe] = useState(0);
  const total = (Number.isFinite(me) ? me : 0) + (Number.isFinite(ke) ? ke : 0);

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>{legend}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-3">
          <Field name={meName} label="Me" error={errors[meName]}>
            <Input
              id={meName}
              name={meName}
              inputMode="numeric"
              min={0}
              step={1}
              defaultValue={0}
              className="tabular-nums"
              aria-invalid={Boolean(errors[meName])}
              aria-describedby={errors[meName] ? `${meName}-error` : undefined}
              onChange={(event) => setMe(Number(event.target.value || 0))}
            />
          </Field>
          <Field name={keName} label="Ke" error={errors[keName]}>
            <Input
              id={keName}
              name={keName}
              inputMode="numeric"
              min={0}
              step={1}
              defaultValue={0}
              className="tabular-nums"
              aria-invalid={Boolean(errors[keName])}
              aria-describedby={errors[keName] ? `${keName}-error` : undefined}
              onChange={(event) => setKe(Number(event.target.value || 0))}
            />
          </Field>
          <p className="flex h-11 items-center justify-between rounded-lg bg-secondary px-3 text-base text-secondary-foreground tabular-nums sm:h-10">
            <span>Jumla</span>
            <span className="font-medium">{formatCount(Number.isFinite(total) ? total : 0)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function EntryForm({ againHref }: { againHref: string }) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitEntry, null);
  const errors = state && !state.ok ? state.errors : {};
  const [kanda, setKanda] = useState("");
  const [mkoa, setMkoa] = useState("");
  const [halmashauri, setHalmashauri] = useState("");
  const councils = councilsFor(mkoa);

  useEffect(() => {
    if (!state || state.ok) return;
    const first = Object.keys(state.errors)[0];
    if (first) document.getElementById(first)?.focus();
  }, [state]);

  if (state?.ok) {
    const saved = state.saved;
    return (
      <div className="flex flex-col gap-4" role="status">
        <Card className="shadow-none">
          <CardHeader>
            <p className="flex items-center gap-2 text-sm font-medium text-primary">
              <AppIcon icon={CheckmarkCircle02Icon} />
              Imefanikiwa
            </p>
            <CardTitle>Taarifa imehifadhiwa</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>
              {formatDate(saved.tarehe)} · {saved.kanda} / {saved.mkoa} / {saved.halmashauri}.{" "}
              {saved.shughuli} ({saved.hali}). Waliopima VVU{" "}
              {formatCount(saved.vvuMe + saved.vvuKe)}, waliokutwa na maambukizi{" "}
              {formatCount(saved.maambukiziMe + saved.maambukiziKe)}.
            </p>
            <p>Msimamizi ataiona kwenye dashibodi.</p>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={`${againHref}?m=${saved.id}`}
            className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}
          >
            <AppIcon icon={PencilEdit02Icon} />
            Jaza taarifa nyingine
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <p className="text-sm leading-6 text-muted-foreground">
        Sehemu zenye * zinahitajika. Namba tupu huhesabiwa kuwa sifuri.
      </p>
      {Object.keys(errors).length > 0 ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive" role="alert">
          Kuna sehemu zinazohitaji marekebisho kabla ya kuhifadhi.
        </p>
      ) : null}

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Mahali na tarehe</CardTitle>
          <p className="text-sm text-muted-foreground">
            Mkoa na halmashauri vinatoka kwenye orodha ya Tovuti Kuu ya Serikali. Chagua mkoa kwanza, kisha halmashauri ya mkoa huo.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Field name="tarehe" label="Tarehe" required error={errors.tarehe}>
              <Input
                id="tarehe"
                name="tarehe"
                type="date"
                required
                aria-invalid={Boolean(errors.tarehe)}
                aria-describedby={errors.tarehe ? "tarehe-error" : undefined}
              />
            </Field>
            <Field name="kanda" label="Kanda" required error={errors.kanda}>
              <SearchableSelect
                id="kanda"
                name="kanda"
                required
                value={kanda}
                options={KANDA}
                invalid={Boolean(errors.kanda)}
                describedBy={errors.kanda ? "kanda-error" : undefined}
                onValueChange={setKanda}
              />
            </Field>
            <Field name="mkoa" label="Mkoa" required error={errors.mkoa}>
              <SearchableSelect
                id="mkoa"
                name="mkoa"
                required
                value={mkoa}
                options={MIKOA}
                invalid={Boolean(errors.mkoa)}
                describedBy={errors.mkoa ? "mkoa-error" : undefined}
                onValueChange={(next) => {
                  setMkoa(next);
                  setHalmashauri("");
                }}
              />
            </Field>
            <Field name="halmashauri" label="Halmashauri" required error={errors.halmashauri}>
              <>
                <SearchableSelect
                  id="halmashauri"
                  name="halmashauri"
                  required
                  value={halmashauri}
                  options={councils}
                  placeholder={mkoa ? "Chagua" : "Chagua mkoa kwanza"}
                  disabled={!mkoa}
                  invalid={Boolean(errors.halmashauri)}
                  describedBy={
                    errors.halmashauri
                      ? "halmashauri-error"
                      : mkoa && councils.length === 0
                        ? "halmashauri-hint"
                        : undefined
                  }
                  onValueChange={setHalmashauri}
                />
                {mkoa && councils.length === 0 ? (
                  <p id="halmashauri-hint" className="text-sm text-muted-foreground">
                    Orodha ya serikali haina halmashauri za mkoa huu.
                  </p>
                ) : null}
              </>
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Shughuli</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Field name="shughuli" label="Shughuli iliyopangwa" required error={errors.shughuli}>
              <Input
                id="shughuli"
                name="shughuli"
                required
                maxLength={300}
                aria-invalid={Boolean(errors.shughuli)}
                aria-describedby={errors.shughuli ? "shughuli-error" : undefined}
              />
            </Field>
            <Field name="aina" label="Aina ya shughuli" required error={errors.aina}>
              <NativeSelect
                id="aina"
                name="aina"
                required
                defaultValue=""
                aria-invalid={Boolean(errors.aina)}
                aria-describedby={errors.aina ? "aina-error" : undefined}
              >
                <option value="" disabled>
                  Chagua
                </option>
                {ACTIVITY_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field name="eneo" label="Eneo / kundi lengwa" error={errors.eneo}>
              <Input id="eneo" name="eneo" maxLength={400} />
            </Field>
            <Field name="mdau" label="Mhusika / mdau" error={errors.mdau}>
              <Input id="mdau" name="mdau" maxLength={400} />
            </Field>
            <Field name="hali" label="Hali ya utekelezaji" required error={errors.hali}>
              <NativeSelect
                id="hali"
                name="hali"
                required
                defaultValue=""
                aria-invalid={Boolean(errors.hali)}
                aria-describedby={errors.hali ? "hali-error" : undefined}
              >
                <option value="" disabled>
                  Chagua
                </option>
                {STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </div>
        </CardContent>
      </Card>

      <CountPair legend="Waliopimwa VVU" meName="vvuMe" keName="vvuKe" errors={errors} />
      <CountPair
        legend="Waliokutwa na maambukizi ya VVU"
        meName="maambukiziMe"
        keName="maambukiziKe"
        errors={errors}
      />

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Huduma na vifaa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Field name="waliounganishwa" label="Waliounganishwa na huduma" error={errors.waliounganishwa}>
              <Input
                id="waliounganishwa"
                name="waliounganishwa"
                inputMode="numeric"
                min={0}
                step={1}
                defaultValue={0}
                className="tabular-nums"
              />
            </Field>
            <Field name="elimu" label="Waliofikiwa elimu" error={errors.elimu}>
              <Input
                id="elimu"
                name="elimu"
                inputMode="numeric"
                min={0}
                step={1}
                defaultValue={0}
                className="tabular-nums"
              />
            </Field>
            <Field name="kondomu" label="Idadi ya Kondomu zilizogawanywa" error={errors.kondomu}>
              <Input
                id="kondomu"
                name="kondomu"
                inputMode="numeric"
                min={0}
                step={1}
                defaultValue={0}
                className="tabular-nums"
              />
            </Field>
            <Field name="pep" label="Idadi ya Dawa Kinga/PEP/PrEP zilizogawanywa" error={errors.pep}>
              <Input
                id="pep"
                name="pep"
                inputMode="numeric"
                min={0}
                step={1}
                defaultValue={0}
                className="tabular-nums"
              />
            </Field>
            <Field name="jipime" label="Idadi ya Jipime/Self test kit zilizoganywa" error={errors.jipime}>
              <Input
                id="jipime"
                name="jipime"
                inputMode="numeric"
                min={0}
                step={1}
                defaultValue={0}
                className="tabular-nums"
              />
            </Field>
            <Field name="ushahidi" label="Ushahidi / rejea" error={errors.ushahidi}>
              <Input id="ushahidi" name="ushahidi" maxLength={400} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
          <AppIcon icon={Tick02Icon} />
          {pending ? "Inahifadhi…" : "Hifadhi taarifa"}
        </Button>
      </div>
    </form>
  );
}
