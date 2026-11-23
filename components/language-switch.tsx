"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCopy, useLocale } from "@/components/language-provider";
import type { Locale } from "@/lib/messages";
import { cn } from "cn";

const OPTIONS: Array<{ code: Locale; label: string }> = [
  { code: "sw", label: "Kiswahili" },
  { code: "en", label: "English" },
];

function LanguageSwitchForm() {
  const locale = useLocale();
  const t = useCopy();
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const back = query ? `${pathname}?${query}` : pathname;

  return (
    <form
      action="/lugha"
      method="post"
      className="inline-flex rounded-lg border border-border bg-background p-0.5"
      aria-label={t.language.label}
    >
      <input type="hidden" name="back" value={back} />
      {OPTIONS.map((option) => {
        const active = locale === option.code;
        return (
          <button
            key={option.code}
            type="submit"
            name="lang"
            value={option.code}
            aria-pressed={active}
            className={cn(
              "h-8 rounded-md px-2.5 text-xs font-medium",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </form>
  );
}

export function LanguageSwitch() {
  return (
    <Suspense
      fallback={<span className="inline-flex h-9 w-[9.75rem] rounded-lg border border-border bg-background" />}
    >
      <LanguageSwitchForm />
    </Suspense>
  );
}
