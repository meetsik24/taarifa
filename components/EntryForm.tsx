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
import { useCopy, useLocale } from "@/components/language-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { formatCount, formatDate } from "@/lib/format";
import { fill, translateTerm } from "@/lib/messages";
import { ACTIVITY_TYPES, STATUSES } from "@/lib/options";
import { todayInTanzania } from "@/lib/parse";
import { councilsFor, KANDA, mikoaFor } from "@/lib/places";
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
  const t = useCopy();
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
          <Field name={meName} label={t.words.me} error={errors[meName]}>
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
          <Field name={keName} label={t.words.ke} error={errors[keName]}>
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
            <span>{t.words.total}</span>
            <span className="font-medium">{formatCount(Number.isFinite(total) ? total : 0)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function EntryForm({ againHref, formToken = "" }: { againHref: string; formToken?: string }) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitEntry, null);
  const t = useCopy();
  const locale = useLocale();
  const errors = state && !state.ok ? state.errors : {};
  const [kanda, setKanda] = useState("");
  const [mkoa, setMkoa] = useState("");
  const [halmashauri, setHalmashauri] = useState("");
  const [aina, setAina] = useState<string[]>([]);
  const [hali, setHali] = useState("");
  const regions = mikoaFor(kanda);
  const councils = councilsFor(mkoa);
  const countsClosed = hali === "Haijaanza" || hali === "Imesitishwa";
  const educationOnly = aina.length > 0 && aina.every((value) => value === "Elimu na uhamasishaji");
  const showTesting = !countsClosed && !educationOnly;

  function toggleActivity(value: string): void {
    setAina((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  useEffect(() => {
    if (!state || state.ok) return;
    const first = Object.keys(state.errors).find((key) => key !== "form");
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
              {t.form.savedEyebrow}
            </p>
            <CardTitle>{t.form.savedTitle}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>
              {fill(t.form.savedBody, {
                date: formatDate(saved.tarehe),
                zone: saved.kanda,
                region: saved.mkoa,
                council: saved.halmashauri,
                activity: saved.shughuli,
                status: translateTerm(locale, saved.hali),
                tested: formatCount(saved.vvuMe + saved.vvuKe),
                positive: formatCount(saved.maambukiziMe + saved.maambukiziKe),
              })}
            </p>
            <p>{t.form.savedDashboard}</p>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={`${againHref}?m=${saved.id}`}
            className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}
          >
            <AppIcon icon={PencilEdit02Icon} />
            {t.form.another}
          </Link>
        </div>
      </div>
    );
  }

  const fieldErrors = Object.entries(errors).filter(([key]) => key !== "form");

  return (
    <form
      action={action}
      className="flex flex-col gap-4"
      noValidate
      onReset={(event) => event.preventDefault()}
    >
      <p className="text-sm leading-6 text-muted-foreground">{t.form.intro}</p>
      {formToken ? <input type="hidden" name="formToken" value={formToken} /> : null}
      {errors.form ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive" role="alert">
          {errors.form}
        </p>
      ) : null}
      {fieldErrors.length > 0 ? (
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          <p className="font-medium">{t.form.fixFields}</p>
          <ul className="mt-1 list-disc pl-5">
            {fieldErrors.map(([key, message]) => (
              <li key={key}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>{t.fields.placeAndDate}</CardTitle>
          <p className="text-sm text-muted-foreground">{t.fields.placeHint}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Field name="tarehe" label={t.fields.date} required error={errors.tarehe}>
              <Input
                id="tarehe"
                name="tarehe"
                type="date"
                required
                min={todayInTanzania()}
                max={todayInTanzania()}
                value={todayInTanzania()}
                onChange={() => undefined}
                aria-invalid={Boolean(errors.tarehe)}
                aria-describedby={errors.tarehe ? "tarehe-error" : undefined}
              />
            </Field>
            <Field name="kanda" label={t.fields.zone} required error={errors.kanda}>
              <SearchableSelect
                id="kanda"
                name="kanda"
                required
                value={kanda}
                options={KANDA}
                invalid={Boolean(errors.kanda)}
                describedBy={errors.kanda ? "kanda-error" : undefined}
                onValueChange={(next) => {
                  setKanda(next);
                  setMkoa("");
                  setHalmashauri("");
                }}
              />
            </Field>
            <Field name="mkoa" label={t.fields.region} required error={errors.mkoa}>
              <SearchableSelect
                id="mkoa"
                name="mkoa"
                required
                value={mkoa}
                options={regions}
                placeholder={kanda ? t.words.choose : t.words.chooseZoneFirst}
                disabled={!kanda}
                invalid={Boolean(errors.mkoa)}
                describedBy={errors.mkoa ? "mkoa-error" : undefined}
                onValueChange={(next) => {
                  setMkoa(next);
                  setHalmashauri("");
                }}
              />
            </Field>
            <Field name="halmashauri" label={t.fields.council} required error={errors.halmashauri}>
              <SearchableSelect
                id="halmashauri"
                name="halmashauri"
                required
                value={halmashauri}
                options={councils}
                placeholder={mkoa ? t.words.choose : t.words.chooseRegionFirst}
                disabled={!mkoa}
                invalid={Boolean(errors.halmashauri)}
                describedBy={errors.halmashauri ? "halmashauri-error" : undefined}
                onValueChange={setHalmashauri}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>{t.fields.activitySection}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Field name="shughuli" label={t.fields.activity} required error={errors.shughuli}>
              <Input
                id="shughuli"
                name="shughuli"
                required
                maxLength={300}
                aria-invalid={Boolean(errors.shughuli)}
                aria-describedby={errors.shughuli ? "shughuli-error" : undefined}
              />
            </Field>
            <Field name="eneo" label={t.fields.area} error={errors.eneo}>
              <Input id="eneo" name="eneo" maxLength={400} />
            </Field>
            <Field name="mdau" label={t.fields.actor} error={errors.mdau}>
              <Input id="mdau" name="mdau" maxLength={400} />
            </Field>
            <Field name="hali" label={t.fields.status} required error={errors.hali}>
              <NativeSelect
                id="hali"
                name="hali"
                required
                value={hali}
                aria-invalid={Boolean(errors.hali)}
                aria-describedby={errors.hali ? "hali-error" : undefined}
                onChange={(event) => setHali(event.target.value)}
              >
                <option value="" disabled>
                  {t.words.choose}
                </option>
                {STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {translateTerm(locale, value)}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <fieldset
            id="aina"
            className="flex flex-col gap-2"
            aria-invalid={Boolean(errors.aina)}
            aria-describedby={errors.aina ? "aina-error" : undefined}
          >
            <legend className="text-sm font-medium">
              {t.fields.activityType}
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </legend>
            <p className="text-sm text-muted-foreground">{t.fields.activityTypeHint}</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {ACTIVITY_TYPES.map((value) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    name="aina"
                    value={value}
                    checked={aina.includes(value)}
                    onChange={() => toggleActivity(value)}
                    className="size-4 accent-primary"
                  />
                  {translateTerm(locale, value)}
                </label>
              ))}
            </div>
            {aina.includes("Huduma nyingine") ? (
              <Field name="nyingine" label={t.fields.otherActivity} required error={errors.nyingine}>
                <Input
                  id="nyingine"
                  name="nyingine"
                  required
                  maxLength={300}
                  aria-invalid={Boolean(errors.nyingine)}
                  aria-describedby={errors.nyingine ? "nyingine-error" : undefined}
                />
              </Field>
            ) : null}
            {errors.aina ? (
              <p id="aina-error" className="text-sm text-destructive">
                {errors.aina}
              </p>
            ) : null}
          </fieldset>
        </CardContent>
      </Card>

      {countsClosed ? (
        <p className="text-sm leading-6 text-muted-foreground">{t.form.countsClosed}</p>
      ) : null}
      {showTesting ? (
        <>
          <CountPair legend={t.fields.tested} meName="vvuMe" keName="vvuKe" errors={errors} />
          <CountPair
            legend={t.fields.positive}
            meName="maambukiziMe"
            keName="maambukiziKe"
            errors={errors}
          />
        </>
      ) : null}

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>{t.fields.services}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {countsClosed ? null : (
              <>
                <Field name="waliounganishwa" label={t.fields.linked} error={errors.waliounganishwa}>
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
                <Field name="elimu" label={t.fields.educated} error={errors.elimu}>
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
                <Field name="kondomu" label={t.fields.condoms} error={errors.kondomu}>
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
                <Field name="pep" label={t.fields.pep} error={errors.pep}>
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
                <Field name="jipime" label={t.fields.selfTests} error={errors.jipime}>
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
              </>
            )}
            <Field name="ushahidi" label={t.fields.evidence} error={errors.ushahidi}>
              <Input id="ushahidi" name="ushahidi" maxLength={400} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
          <AppIcon icon={Tick02Icon} />
          {pending ? t.form.saving : t.form.save}
        </Button>
      </div>
    </form>
  );
}
