"use client";

import { useState } from "react";
import { Login01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/app-icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

const fieldClass =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-10";

export function LoginForm({
  next,
  error,
}: {
  next: string;
  error: "credentials" | "unavailable" | null;
}) {
  const [pending, setPending] = useState(false);

  return (
    <form
      action="/ingia/thibitisha"
      method="post"
      className="flex flex-col gap-4"
      onSubmit={() => setPending(true)}
    >
      <input type="hidden" name="next" value={next} />
      {error === "credentials" ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive" role="alert">
          Barua pepe au nenosiri si sahihi.
        </p>
      ) : null}
      {error === "unavailable" ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive" role="alert">
          Hifadhidata haipatikani kwa sasa. Jaribu tena.
        </p>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Barua pepe
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={fieldClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Nenosiri
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={fieldClass}
        />
      </div>
      <button type="submit" className={cn(buttonVariants(), "w-full")} disabled={pending}>
        <AppIcon icon={Login01Icon} />
        {pending ? "Inaingia…" : "Ingia"}
      </button>
    </form>
  );
}
